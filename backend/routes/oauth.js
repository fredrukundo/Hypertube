// routes/oauthRouter.js

require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL;

const generateJWT = (id, username) => {
    return jwt.sign(
        { id, username },
        process.env.JWT_SECRET,
        { expiresIn: '5d' }
    );
};

const redirectError = (res) => {
    return res.redirect(
        `${FRONTEND_URL}/auth/error?message=${encodeURIComponent(
            'Authentication failed'
        )}`
    );
};

const oauthCallback = (strategy) => {
    return (req, res, next) => {

        passport.authenticate(
            strategy,
            { session: false },
            (err, user) => {

                if (err || !user) {
                    return redirectError(res);
                }

                try {

                    const token = generateJWT(
                        user.id,
                        user.username
                    );

                    return res.redirect(
                        `${FRONTEND_URL}/auth/success?token=${token}`
                    );

                } catch (error) {

                    return redirectError(res);
                }
            }
        )(req, res, next);
    };
};

/* =========================
   42 OAuth
========================= */

router.get(
    '/42',
    passport.authenticate('42', { session: false })
);

router.get(
    '/42/callback',
    oauthCallback('42')
);

/* =========================
   GitHub OAuth
========================= */

router.get(
    '/github',
    passport.authenticate('github', {
        scope: ['user:email'],
        session: false
    })
);

router.get(
    '/github/callback',
    oauthCallback('github')
);

/* =========================
   Discord OAuth
========================= */

router.get(
    '/discord',
    passport.authenticate('discord', {
        session: false
    })
);

router.get(
    '/discord/callback',
    oauthCallback('discord')
);

module.exports = router;