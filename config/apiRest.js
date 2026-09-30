const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const router = express.Router();

//Java backend
const JAVA_BASE = process.env.JAVA_BACKEND_URL || 'http://localhost:8080/api';
const AUTH_BACKEND = process.env.PISSIR_AUTH_BACKEND || 'local';

const LOCAL_DATA_FILE = process.env.PISSIR_DATA_FILE || path.join(__dirname, '..', 'data', 'local-data.json');

function readLocalData() {
    try {
        const data = JSON.parse(fs.readFileSync(LOCAL_DATA_FILE, 'utf8'));
        return {
            users: Array.isArray(data.users) ? data.users : [],
            vehicles: Array.isArray(data.vehicles) ? data.vehicles : []
        };
    } catch (error) {
        if (error.code === 'ENOENT') return { users: [], vehicles: [] };
        throw error;
    }
}

const localData = readLocalData();
let nextUserId = Math.max(0, ...localData.users.map(user => Number(user.id) || 0)) + 1;

function saveLocalData() {
    const directory = path.dirname(LOCAL_DATA_FILE);
    const temporaryFile = `${LOCAL_DATA_FILE}.tmp`;
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(temporaryFile, JSON.stringify(localData, null, 2), { mode: 0o600 });
    fs.renameSync(temporaryFile, LOCAL_DATA_FILE);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
    if (typeof passwordHash !== 'string' || !passwordHash.includes(':')) return false;
    const [salt, expectedHex] = passwordHash.split(':');
    const expected = Buffer.from(expectedHex, 'hex');
    const actual = crypto.scryptSync(password, salt, 64);
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function normalizePlate(value) {
    return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
}

function findVehicle(plate) {
    const normalizedPlate = normalizePlate(plate);
    return localData.vehicles.find(vehicle => vehicle.plate === normalizedPlate);
}

const createDefaultAdmin = () => {
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    const admin = localData.users.find(user => user.username.toLowerCase() === adminUsername.toLowerCase());

    if (!admin) {
        const created = {
            id: nextUserId++,
            username: adminUsername,
            passwordHash: hashPassword(adminPassword),
            tipo: 'admin'
        };
        localData.users.push(created);
        saveLocalData();
    }
};

createDefaultAdmin();

const toSafeUser = (user) => ({
    id: user.id,
    username: user.username,
    tipo: user.tipo || 'base'
});

const normalizeUser = (payload) => {
    const username = String(payload?.username || '').trim();
    const password = String(payload?.password || '').trim();
    return { username, password };
};

const fallbackRegister = (payload) => {
    const { username, password } = normalizeUser(payload);
    const tipo = payload?.tipo || 'base';

    if (!username || !password) {
        return { status: 400, body: { error: 'username and password are required' } };
    }

    const existing = localData.users.find(user => user.username.toLowerCase() === username.toLowerCase());
    if (existing) {
        return { status: 409, body: { error: 'Username already exists' } };
    }

    const user = {
        id: nextUserId++,
        username,
        passwordHash: hashPassword(password),
        tipo: 'base'
    };

    localData.users.push(user);
    saveLocalData();
    return { status: 200, body: toSafeUser(user) };
};

const fallbackLogin = (payload) => {
    const { username, password } = normalizeUser(payload);

    if (!username || !password) {
        return { status: 400, body: { error: 'username and password are required' } };
    }

    const found = localData.users.find(user => user.username.toLowerCase() === username.toLowerCase());
    if (!found || !verifyPassword(password, found.passwordHash)) {
        return { status: 401, body: { error: 'Invalid credentials' } };
    }

    const token = `local-${crypto.randomBytes(16).toString('hex')}`;
    return {
        status: 200,
        body: {
            token,
            user: toSafeUser(found)
        }
    };
};

function checkPlate(payload) {
    const plate = normalizePlate(payload?.plate);
    const username = String(payload?.username || '').trim().toLowerCase();
    if (!/^[A-Z0-9-]{4,10}$/.test(plate) || !username) {
        return { status: 400, body: { error: 'A valid plate and username are required' } };
    }

    const vehicle = findVehicle(plate);
    if (vehicle && vehicle.username.toLowerCase() !== username) {
        return { status: 409, body: { error: 'This plate is already registered to another user' } };
    }
    return { status: 200, body: { available: true, plate } };
}

function registerPlate(payload) {
    const result = checkPlate(payload);
    if (result.status !== 200) return result;

    const plate = result.body.plate;
    const username = String(payload.username).trim();
    const existingVehicle = findVehicle(plate);
    if (!existingVehicle) {
        localData.vehicles.push({
            plate,
            username,
            model: String(payload.model || '').trim(),
            createdAt: new Date().toISOString()
        });
        saveLocalData();
    }
    return { status: 200, body: { registered: true, plate } };
}

const shouldUseLocalFallback = (error) => {
    const message = (error && (error.message || '')) || '';
    return message.includes('ECONNREFUSED') || message.includes('ENOTFOUND') || message.includes('connect ECONNREFUSED');
};

router.post('/plates/check', (req, res) => {
    const result = checkPlate(req.body);
    res.status(result.status).json(result.body);
});

router.post('/plates/register', (req, res) => {
    const result = registerPlate(req.body);
    res.status(result.status).json(result.body);
});

// Proxy registration to Java backend
router.post('/java/auth/register', async (req, res) => {
    if (AUTH_BACKEND !== 'java') {
        const fallback = fallbackRegister(req.body);
        return res.status(fallback.status).json(fallback.body);
    }

    try {
        const r = await axios.post(`${JAVA_BASE}/auth/register`, req.body);
        res.status(r.status).json(r.data);
    } catch (error) {
        if (shouldUseLocalFallback(error)) {
            const fallback = fallbackRegister(req.body);
            return res.status(fallback.status).json(fallback.body);
        }
        const msg = error.response ? error.response.data : error.message;
        res.status(500).json({ error: msg });
    }
});

// Proxy login Java backend
router.post('/java/auth/login', async (req, res) => {
    if (AUTH_BACKEND !== 'java') {
        const fallback = fallbackLogin(req.body);
        return res.status(fallback.status).json(fallback.body);
    }

    try {
        const r = await axios.post(`${JAVA_BASE}/auth/login`, req.body);
        res.status(r.status).json(r.data);
    } catch (error) {
        if (shouldUseLocalFallback(error)) {
            const fallback = fallbackLogin(req.body);
            return res.status(fallback.status).json(fallback.body);
        }
        const msg = error.response ? error.response.data : error.message;
        res.status(401).json({ error: msg });
    }
});

// Proxy bookings  Java backend
router.post('/java/bookings', async (req, res) => {
    try {
        const r = await axios.post(`${JAVA_BASE}/bookings`, req.body, { headers: req.headers });
        res.status(r.status).json(r.data);
    } catch (error) {
        const msg = error.response ? error.response.data : error.message;
        res.status(500).json({ error: msg });
    }
});

// Proxy charging requests
router.post('/java/charging/request', async (req, res) => {
    try {
        const r = await axios.post(`${JAVA_BASE}/charging/request`, req.body, { headers: req.headers });
        res.status(r.status).json(r.data);
    } catch (error) {
        const msg = error.response ? error.response.data : error.message;
        res.status(500).json({ error: msg });
    }
});

router.get('/java/charging/queue', async (req, res) => {
    try {
        const r = await axios.get(`${JAVA_BASE}/charging/queue`, { headers: req.headers });
        res.status(r.status).json(r.data);
    } catch (error) {
        const msg = error.response ? error.response.data : error.message;
        res.status(500).json({ error: msg });
    }
});

// Proxy admin payments query
router.get('/java/admin/payments', async (req, res) => {
    try {
        const r = await axios.get(`${JAVA_BASE}/admin/payments`, { params: req.query, headers: req.headers });
        res.status(r.status).json(r.data);
    } catch (error) {
        const msg = error.response ? error.response.data : error.message;
        res.status(500).json({ error: msg });
    }
});

// Proxy primary auth endpoints to Java backend (full migration)
router.post('/register', async (req, res) => {
    if (AUTH_BACKEND !== 'java') {
        const fallback = fallbackRegister(req.body);
        return res.status(fallback.status).json(fallback.body);
    }

    try {
        const r = await axios.post(`${JAVA_BASE}/auth/register`, req.body);
        res.status(r.status).json(r.data);
    } catch (error) {
        if (shouldUseLocalFallback(error)) {
            const fallback = fallbackRegister(req.body);
            return res.status(fallback.status).json(fallback.body);
        }
        const msg = error.response ? error.response.data : error.message;
        res.status(500).json({ error: msg });
    }
});

router.post('/login', async (req, res) => {
    if (AUTH_BACKEND !== 'java') {
        const fallback = fallbackLogin(req.body);
        return res.status(fallback.status).json(fallback.body);
    }

    try {
        const r = await axios.post(`${JAVA_BASE}/auth/login`, req.body);
        res.status(r.status).json(r.data);
    } catch (error) {
        if (shouldUseLocalFallback(error)) {
            const fallback = fallbackLogin(req.body);
            return res.status(fallback.status).json(fallback.body);
        }
        const msg = error.response ? error.response.data : error.message;
        res.status(401).json({ error: msg });
    }
});

router.delete('/utente/:id', async (req, res) => {
    try {
        const r = await axios.delete(`${JAVA_BASE}/users/${req.params.id}`);
        res.status(r.status).json(r.data);
    } catch (error) {
        const msg = error.response ? error.response.data : error.message;
        res.status(500).json({ error: msg });
    }
});

module.exports = router;
