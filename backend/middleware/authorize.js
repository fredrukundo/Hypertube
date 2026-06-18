const jwt = require('jsonwebtoken');
const passport = require('../config/passport')

const isAuthorize = (req, res, next) => {

    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token && req.query.token) {
        token = req.query.token;
    }

    if (!token) {
        return res.status(401).json({
            error: { code: 'NOT_AUTHENTICATED' }
        });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);

        req.user = user;
        return next();

    } catch (err) {
        return res.status(401).json({
            error: { code: 'INVALID_TOKEN' }
        });
    }
};


module.exports = isAuthorize