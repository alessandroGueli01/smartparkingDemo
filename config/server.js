require("dotenv").config();
const express = require("express");
const session = require("express-session");
const Keycloak = require("keycloak-connect");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require('path');
const { Pool } = require("pg");
const apiRest = require("./apiRest"); // importo il file per apirest



const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const memoryStore = new session.MemoryStore();
const frontendDir = path.join(__dirname, '..', 'formlogin');

// file statici (frontend semplice) usando un percorso assoluto
app.use(express.static(frontendDir));
app.use(session({
    secret: 'session-secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}));


const keycloak = new Keycloak({ store: memoryStore }, {
    realm: process.env.KEYCLOAK_REALM,
    "auth-server-url": process.env.KEYCLOAK_AUTH_SERVER_URL,
    "resource": process.env.KEYCLOAK_CLIENT_ID,
    "credentials": { "secret": process.env.KEYCLOAK_CLIENT_SECRET },
    "confidential-port": 0
});
app.use(keycloak.middleware());


const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});


app.use("/api", apiRest);

app.get("/api/protetta", keycloak.protect(), (req, res) => {
    res.json({ message: "Accesso consentito!", user: req.kauth.grant.access_token.content });
});


app.get("/api/db-check", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({ success: true, time: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Redirect root to login page for convenience
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendDir, 'login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(frontendDir, 'admin.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(frontendDir, 'dashboard.html'));
});

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});