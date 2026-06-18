const zxcvbn = require("zxcvbn");
const express = require('express');
const router = express.Router();
const isAuthorize = require('../middleware/authorize')
const languages = require('../config/language')

const DEBUG = process.env.DEBUG_MODE || false

const {
    lookupUserByEmail,
    lookupUserByUsername,
    registerUser
} = require('../models/usersModel');

const bcrypt = require('bcrypt');
const pool = require('../config/pool');
const upload = require('../utils/uploads/profileImage');
const { registerSchema, updateUserSchema } = require('../utils/validators/user.validator');


router.post('/register', async (req, res) => {
    try {
        const parsed = registerSchema.safeParse(req.body);

        if (!parsed.success) {
            const errors = parsed.error.flatten();

            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    fields: errors.fieldErrors
                }
            });
        }

        let {
            username,
            email,
            first_name,
            last_name,
            password,
            repassword
        } = parsed.data;

        const isStrong = zxcvbn(password);
        if (isStrong.score < 3){
            return res.status(400).json({
                error: { code: 'PASSWORD_TOO_WEAK' }
            });
        }

        if (password !== repassword) {
            return res.status(400).json({
                error: { code: 'PASSWORD_NOT_MATCH' }
            });
        }

        const emailExist = await lookupUserByEmail(email);

        if (emailExist) {
            return res.status(400).json({
                error: { code: 'EMAIL_ALREADY_EXISTS' }
            });
        }

        const usernameExist = await lookupUserByUsername(username);

        if (usernameExist) {
            return res.status(400).json({
                error: { code: 'USERNAME_ALREADY_EXISTS' }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await registerUser({
            email,
            username,
            password: hashedPassword,
            first_name,
            last_name
        });

        if (result) {
            return res.status(201).json({
                success: { code: 'REGISTER_SUCCESS' }
            });
        }

        return res.status(400).json({
            error: { code: 'REGISTER_FAILED' }
        });

    } catch (error) {
        if (DEBUG) {
            console.log('[ERROR] -> [POST]/users/register -> ', error);
        }

        return res.status(400).json({
            error: { code: 'GENERAL_ERROR' }
        });
    }
});

router.get('/', isAuthorize, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username FROM users');
        res.status(200).json({success : {data : result.rows}});
    } catch (error) {
        if (DEBUG){
            console.log('[ERROR] -> [GET] /users -> ', error)
        }
        return res.status(400).json({
            error: { code: 'GENERAL_ERROR' }
        });
    }
});

router.delete("/delete", isAuthorize, async (req, res) => {
    try {
        const result = await pool.query(`
            DELETE FROM users
            WHERE id = $1
            RETURNING id
        `,
            [req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                error: { code: "USER_NOT_FOUND" }
            });
        }

        return res.status(200).json({message: "Account deleted successfully"});

    } catch (error) {
        if (DEBUG) {
            console.error("[ERROR] -> [DELETE] /users/delete :", error);
        }

        return res.status(400).json({
        error: { code: "GENERAL_ERROR" }
        });
    }
});

// GET current logged in user
router.get("/me", isAuthorize, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT id, username, email, profile_picture, first_name, last_name, preferred_language, auth_provider
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: { code: "USER_NOT_FOUND" }
      });
    }

    return res.status(200).json(result.rows[0]);

  } catch (error) {
    if (DEBUG) {
      console.log('[ERROR] -> [GET] /users/me :', error);
    }

    return res.status(400).json({
      error: { code: "GENERAL_ERROR" }
    });
  }
});


router.get('/:id', isAuthorize, async (req, res) => {
    try {
        const targetID = parseInt(req.params.id);
        const isSelf = req.user.id === targetID;

        const query = isSelf 
        ? 'SELECT id, username, email, profile_picture, first_name, last_name, preferred_language, auth_provider FROM users WHERE id = $1'
        : 'SELECT id, username, profile_picture, first_name, last_name FROM users WHERE id = $1';

        const result = await pool.query(query, [targetID]);
        if (result.rows.length === 0) {
            return res.status(404).json({error: {code: 'USER_NOT_FOUND'}});
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        if (DEBUG){
            console.log('[ERROR] -> [GET] /users?id= -> ', error)
        }
        return res.status(400).json({
            error: { code: 'GENERAL_ERROR' }
        });
    }
});

router.patch(
    '/:id',
    isAuthorize,
    upload.single('profile_picture'),
    async (req, res) => {
        try {
            const targetId = parseInt(req.params.id);

            if (req.user.id !== targetId) {
                return res.status(403).json({
                    error: { code: 'FORBIDDEN_OPERATION' }
                });
            }

            const parsed = updateUserSchema.safeParse(req.body);

            if (!parsed.success) {
                return res.status(400).json({
                    error: {
                        code: 'VALIDATION_ERROR',
                        fields: parsed.error.flatten().fieldErrors
                    }
                });
            }

            let {
                email,
                username,
                first_name,
                last_name,
                preferred_language
            } = parsed.data;

            const profile_picture = req.file
                ? `${req.protocol}://${req.get('host')}/uploads/images/${req.file.filename}`
                : null;

            if (
                !email &&
                !username &&
                !first_name &&
                !last_name &&
                !preferred_language &&
                !profile_picture
            ) {
                return res.status(400).json({
                    error: { code: 'NO_FIELDS_TO_UPDATE' }
                });
            }

            const fields = [];
            const values = [];
            let index = 1;

            // ---------------- EMAIL ----------------
            if (email) {
                const emailExist = await lookupUserByEmail(email);

                if (emailExist && emailExist.id !== targetId) {
                    return res.status(400).json({
                        error: { code: 'EMAIL_ALREADY_EXISTS' }
                    });
                }

                fields.push(`email = $${index++}`);
                values.push(email);
            }

            // ---------------- USERNAME ----------------
            if (username) {
                const usernameExist = await lookupUserByUsername(username);

                if (usernameExist && usernameExist.id !== targetId) {
                    return res.status(400).json({
                        error: { code: 'USERNAME_ALREADY_EXISTS' }
                    });
                }

                fields.push(`username = $${index++}`);
                values.push(username);
            }

            // ---------------- FIRST NAME ----------------
            if (first_name) {
                fields.push(`first_name = $${index++}`);
                values.push(first_name);
            }

            // ---------------- LAST NAME ----------------
            if (last_name) {
                fields.push(`last_name = $${index++}`);
                values.push(last_name);
            }

            // ---------------- PROFILE PICTURE ----------------
            if (profile_picture) {
                fields.push(`profile_picture = $${index++}`);
                values.push(profile_picture);
            }

            // ---------------- LANGUAGE ----------------
            if (preferred_language) {
                if (!languages[preferred_language]) {
                    return res.status(400).json({
                        error: { code: 'UNSUPPORTED_LANGUAGE' }
                    });
                }

                fields.push(`preferred_language = $${index++}`);
                values.push(preferred_language);
            }

            fields.push(`updated_at = CURRENT_TIMESTAMP`);

            values.push(targetId);

            const result = await pool.query(
                `UPDATE users
                 SET ${fields.join(', ')}
                 WHERE id = $${index}
                 RETURNING *`,
                values
            );

            if (result.rowCount === 0) {
                return res.status(404).json({
                    error: { code: 'USER_NOT_FOUND' }
                });
            }

            return res.status(200).json({
                success: { code: 'ACCOUNT_UPDATED' }
            });

        } catch (error) {
            if (DEBUG) {
                console.log('[ERROR] -> [PATCH] /users/:id :', error);
            }

            return res.status(400).json({
                error: { code: 'GENERAL_ERROR' }
            });
        }
    }
);


module.exports = router;
