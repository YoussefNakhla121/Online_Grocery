const userModel = require('../models/user');

async function register(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
    }

    try {
        const createdUser = await userModel.createUser(email, password);
        return res.status(201).json(createdUser);
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Unable to create user' });
    }
}

async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
    }

    try {
        const loggedInUser = await userModel.login(email, password);
        return res.status(200).json(loggedInUser);
    } catch (error) {
        return res.status(401).json({ error: error.message || 'Invalid credentials' });
    }
}

module.exports = {
    register,
    login,
};
