const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const route = express.Router();
const pool = require('../config/pool');

require('dotenv').config();

const DEBUG = process.env.DEBUG_MODE || false;

const generateJWT = (id, username) => {
    return jwt.sign({ id, username }, process.env.JWT_SECRET, { expiresIn: '5d' });
};

route.post('/token', async (req, res) => {
    const { client, secret } = req.body;

    const missingFields = [];

    if (!client) missingFields.push('client');
    if (!secret) missingFields.push('secret');

    if (missingFields.length > 0) {
        return res.status(400).json({
            error: {
                code: 'MISSING_FIELDS',
                fields: missingFields
            }
        });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $1',
            [client]
        );

        const user = result.rows?.[0];

        if (!user || user.auth_provider !== 'local') {
            return res.status(401).json({
                error: { code: 'INVALID_CREDENTIALS' }
            });
        }

        if (!user.password) {
            return res.status(400).json({
                error: { code: 'USER_PASSWORD_MISSING' }
            });
        }

        const passwordOK = await bcrypt.compare(secret, user.password);

        if (!passwordOK) {
            return res.status(401).json({
                error: { code: 'INVALID_CREDENTIALS' }
            });
        }

        const token = generateJWT(user.id, user.username);

        return res.status(200).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                auth_provider: user.auth_provider
            }
        });

    } catch (error) {
        
        if (DEBUG) {
            console.log('[ERROR] -> [GET] oauth/token :', error);
        }

        return res.status(400).json({
            error: { code: 'GENERAL_ERROR' }
        });
    }
});


module.exports = route;
