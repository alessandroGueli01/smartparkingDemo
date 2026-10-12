const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('axios', () => ({
    post: jest.fn(),
    get: jest.fn(),
    delete: jest.fn()
}));
const axios = require('axios');
axios.post.mockRejectedValue(Object.assign(new Error('connect ECONNREFUSED'), { code: 'ECONNREFUSED' }));

const dataFile = path.join(os.tmpdir(), `pissir-local-data-${process.pid}-${Date.now()}.json`);
process.env.PISSIR_DATA_FILE = dataFile;
process.env.JAVA_BACKEND_URL = 'http://127.0.0.1:65534/api';

function createServer(router) {
    const app = express();
    app.use(express.json());
    app.use('/api', router);
    const server = app.listen(0);
    return new Promise(resolve => server.once('listening', () => {
        resolve({ server, baseUrl: `http://127.0.0.1:${server.address().port}` });
    }));
}

async function post(baseUrl, route, body) {
    return fetch(`${baseUrl}${route}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
}

describe('persistent local accounts and unique plates', () => {
    let server;
    let baseUrl;

    afterAll(async () => {
        if (server) await new Promise(resolve => server.close(resolve));
        delete require.cache[require.resolve('../config/apiRest')];
        if (fs.existsSync(dataFile)) fs.unlinkSync(dataFile);
        delete process.env.PISSIR_DATA_FILE;
        delete process.env.JAVA_BACKEND_URL;
    });

    test('retains registered users and prevents another user from reusing a plate', async () => {
        axios.post.mockResolvedValue({ status: 201, data: { id: 999, username: 'java-user' } });
        let router = require('../config/apiRest');
        ({ server, baseUrl } = await createServer(router));

        const registration = await post(baseUrl, '/api/register', {
            username: 'persisted-user',
            email: 'persisted@example.test',
            password: 'demo-password'
        });
        expect(registration.status).toBe(200);
        expect(axios.post).not.toHaveBeenCalled();

        const storedData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        const storedUser = storedData.users.find(user => user.username === 'persisted-user');
        expect(storedUser.passwordHash).toBeDefined();
        expect(storedUser.password).toBeUndefined();

        const plateRegistration = await post(baseUrl, '/api/plates/register', {
            plate: 'ab 123 cd',
            username: 'persisted-user',
            model: 'Demo car'
        });
        expect(plateRegistration.status).toBe(200);
        await new Promise(resolve => server.close(resolve));

        delete require.cache[require.resolve('../config/apiRest')];
        router = require('../config/apiRest');
        ({ server, baseUrl } = await createServer(router));

        const login = await post(baseUrl, '/api/login', {
            username: 'persisted@example.test',
            password: 'demo-password'
        });
        expect(login.status).toBe(200);
        expect(axios.post).not.toHaveBeenCalled();

        const usernameLogin = await post(baseUrl, '/api/login', {
            username: 'persisted-user',
            password: 'demo-password'
        });
        expect(usernameLogin.status).toBe(200);

        const duplicatePlate = await post(baseUrl, '/api/plates/check', {
            plate: 'AB123CD',
            username: 'other-user'
        });
        expect(duplicatePlate.status).toBe(409);

        const sameOwnerPlate = await post(baseUrl, '/api/plates/check', {
            plate: 'AB123CD',
            username: 'persisted-user'
        });
        expect(sameOwnerPlate.status).toBe(200);
    });
});