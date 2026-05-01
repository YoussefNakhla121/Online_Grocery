const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const { testConnection } = require('./util/database');
const routes = require('./routes');

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// CORS — must be before routes
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204); // respond to preflight immediately
    }
    next();
});

app.use('/api', routes);



app.get('/health', async (req, res) => {
    try {
        await testConnection();
        res.status(200).json({ status: 'ok' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message || 'Supabase health check failed' });
    }
});

testConnection()
    .then(() => console.log('Supabase connection OK'))
    .catch((error) => console.error('Supabase connection failed:', error.message || error));

app.listen(8080);
