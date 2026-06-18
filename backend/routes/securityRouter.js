const express = require('express');
const bcrypt = require('bcrypt');
const route = express.Router();
const pool = require('../config/pool');

require('dotenv').config();

const INFO = process.env.INFO_MODE || false;
const DEBUG = process.env.DEBUG_MODE || false;

// for a logged-in user, change password
const isAuthorize = require("../middleware/authorize");
const { sendEmail } = require('../utils/email');

route.post("/change-password", isAuthorize, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        error: { code: "MISSING_FIELDS" },
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        error: { code: "WEAK_PASSWORD" },
      });
    }

    const userId = req.user.id;

    const userResult = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        error: { code: "INVALID_USER" },
      });
    }

    const user = userResult.rows[0];

    const match = await bcrypt.compare(
      current_password,
      user.password
    );

    if (!match) {
      return res.status(400).json({
        error: { code: "INVALID_CREDENTIALS" },
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, userId]
    );

    return res.status(200).json({
      message: "PASSWORD_CHANGED_SUCCESS",
    });
  } catch (error) {
    return res.status(400).json({
      error: { code: "GENERAL_ERROR" },
    });
  }
});

route.post('/reset-password/request', async (req, res) => {
    try {
        let { email_username } = req.body;

        email_username = email_username?.trim().toLowerCase();

        if (!email_username) {
            return res.status(400).json({
                error: { code: 'MISSING_EMAIL' }
            });
        }

        const userResult = await pool.query(
            'SELECT id, email, username FROM users WHERE email = $1 OR username = $1',
            [email_username]
        );

        const user = userResult.rows[0];

        if (!user) {
            return res.status(200).json({
                message: 'IF_EMAIL_USERNAME_EXISTS_RESET_SENT'
            });
        }

        const limitResult = await pool.query(
            `SELECT COUNT(*) 
                FROM password_reset_requests
                WHERE user_id = $1
                AND created_at > NOW() - INTERVAL '1 hour'`,
            [user.id]
        );

        const count = parseInt(limitResult.rows[0].count);

        if (count >= 3) {
            return res.status(429).json({
                error: {
                    code: 'RESET_LIMIT_REACHED',
                }
            });
        }

        const resetToken = require('crypto').randomBytes(32).toString('hex');
        
        await pool.query(
            `INSERT INTO password_reset_requests (user_id, reset_token)
            VALUES ($1, $2)`,
            [user.id, resetToken]
        );

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        await sendEmail(
            user.email,
            "Password Reset Request",
            `
                <h2>Password Reset</h2>
                <p>Hello ${user.username},</p>
                <p>You requested a password reset.</p>
                <p>Click below to reset your password:</p>
                <a href="${resetUrl}" target="_blank">
                    Reset Password
                </a>
                <p>This link will expire soon.</p>
            `
        );

        if (INFO) {
            console.log('RESET TOKEN:', resetToken);
        }

        return res.status(200).json({
            message: 'IF_EMAIL_USERNAME_EXISTS_RESET_SENT'
        });

    } catch (error) {
        if (DEBUG) {
            console.log('RESET REQUEST ERROR:', error);
        }

        return res.status(400).json({
            error: { code: 'GENERAL_ERROR' }
        });
    }
});

route.post('/reset-password/change', async (req, res) => {
    try {
        let { new_password, re_password, token } = req.body;

        if (!token || !re_password || !new_password) {
            return res.status(400).json({
                error: { code: 'MISSING_FIELDS' }
            });
        }

        const result = await pool.query(`
            SELECT * FROM password_reset_requests 
            WHERE reset_token = $1 
            AND created_at > NOW() - INTERVAL '1 hour'
        `, [token]);

        if (result.rows.length === 0) {
            return res.status(400).json({
                error: { code: 'EXPIRED_SESSION' }
            });
        }

        const resetData = result.rows[0];

        if (new_password.length < 6) {
            return res.status(400).json({
                error: { code: 'WEAK_PASSWORD' }
            });
        }

        if (new_password !== re_password) {
            return res.status(400).json({
                error: { code: 'PASSWORD_NOT_MATCH' }
            });
        }

        const userResult = await pool.query(
            'SELECT id FROM users WHERE id = $1',
            [resetData.user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({
                error: { code: 'INVALID_USER' }
            });
        }

        const user = userResult.rows[0];

        const hashedPassword = await bcrypt.hash(new_password, 10);

        await pool.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [hashedPassword, user.id]
        );

        await pool.query(
            'DELETE FROM password_reset_requests WHERE id = $1',
            [resetData.id]
        );

        return res.status(200).json({
            message: 'PASSWORD_RESET_SUCCESS'
        });

    } catch (error) {
        if (DEBUG) {
            console.log('[API-ERROR] /reset-password/change :', error);
        }

        return res.status(400).json({
            error: { code: 'GENERAL_ERROR' }
        });
    }
});

route.get('/reset-password/confirm', async (req, res) => {
    try {
        let { token } = req.query;

        if (!token) {
            return res.status(400).json({
                error: { code: 'MISSING_FIELDS' }
            });
        }

        const result = await pool.query(`
            SELECT id FROM password_reset_requests 
            WHERE reset_token = $1 
            AND created_at > NOW() - INTERVAL '1 hour'
        `, [token]);

        if (result.rows.length === 0) {
            return res.status(400).json({
                error: { code: 'EXPIRED_SESSION' }
            });
        }

        return res.status(200).json({
            message: 'ALLOW_ACCESS'
        });

    } catch (error) {
        if (DEBUG) {
            console.log('[API-ERROR] /reset-password/confirm :', error);
        }

        return res.status(400).json({
            error: { code: 'GENERAL_ERROR' }
        });
    }
});


module.exports = route;
