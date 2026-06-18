const express = require('express');
const pool = require('../config/pool');
const isAuthorize = require('../middleware/authorize');

const router = express.Router();

const DEBUG = process.env.DEBUG_MODE || false

router.get('/movies/:id', isAuthorize, async (req, res) => {
    const { id } = req.params;

    try {
        const movieRes = await pool.query(
            `SELECT * FROM movies WHERE id = $1`,
            [id]
        );

        if (movieRes.rows.length === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        const movie = movieRes.rows[0];

       const commentsResult = await pool.query(
            `SELECT 
                comments.id,
                comments.content,
                comments.created_at,
                comments.user_id,
                comments.rate,
                comments.movie_id,
                users.username
            FROM comments
            JOIN users ON users.id = comments.user_id
            WHERE comments.movie_id = $1
            ORDER BY comments.created_at DESC`,
            [id]
        );

        const commentsCount = commentsResult.rowCount;

        return res.json({
            id: movie.id,
            title: movie.title,
            year: movie.year,
            imdb_rating: movie.imdb_rating,
            length: movie.length,
            comments_count: commentsCount,
            comments: commentsResult.rows,
        });


    } catch (error) {
        if (DEBUG) {
            console.log('[ERROR] -> [GET] /comments :', error);
        }
        return res.status(400).json({
            error: { code: 'GENERAL_ERROR' }
        });
    }
});

/*
[GET] /comments
returns a list of latest comments which includes comment’s author username, date,
content, and id.
*/
router.get('/', isAuthorize, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                comments.id,
                comments.content,
                comments.created_at,
                comments.user_id,
                comments.movie_id,
                users.username
            FROM comments
            JOIN users ON users.id = comments.user_id
            ORDER BY comments.created_at DESC
            LIMIT 20;
        `);

        return res.status(200).json({success : {data : result.rows}});

    } catch (error) {
        if (DEBUG) {
            console.log('[ERROR] -> [GET] /comments :', error);
        }
        return res.status(400).json({
            error: { code: 'GENERAL_ERROR' }
        });
    }
});

/*
[GET] /comments/:id
returns comment, author’s username, comment id, date posted
*/
router.get('/:id', isAuthorize, async (req, res) => {
    
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                comments.id,
                comments.content,
                comments.created_at,
                comments.user_id,
                comments.movie_id,
                users.username
            FROM comments
            JOIN users ON users.id = comments.user_id
            WHERE comments.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({error: { code: 'COMMENT_NOT_FOUND' }});
        }

        return res.json({success : {data :result.rows[0]}});

    } catch (error) {
        if (DEBUG) {
            console.log('[ERROR] -> [GET] /comments :', error);
        }
        return res.status(400).json({
            error: { code: 'GENERAL_ERROR' }
        });
    }
});

/*
[POST] /comments 
Expected data : comment, movie_id. Rest is filled by the server.
*/
router.post('/', isAuthorize, async (req, res) => {
    
    try {
        const user_id = req.user.id;
        const { comment, movie_id, rate } = req.body || { comment : null, movie_id: null, rate: null };
    
        if (!comment || !movie_id) {
            return res.status(400).json({
                error: { code: 'MISSING_COMMENT_OR_MOVIE_ID' }
            });
        }
        if (!(rate >= 0 && rate <= 5)){
            return res.status(400).json({
                error: { code: 'RATE_ONLY_FROM_0_TO_5' }
            });
        }
        const result = await pool.query(`
            INSERT INTO comments (content, user_id, movie_id, rate)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `, [comment, user_id, movie_id, rate]);

        return res.status(201).json({success : {data :result.rows[0]}});

    } catch (error) {
        if (DEBUG) {
            console.log('[ERROR] -> [POST] /comments :', error);
        }
        return res.status(400).json({
            error: { code: 'GENERAL_ERROR' }
        });
    }
});


/*
[PATCH] /comments/:id
Expected data : comment, username
*/
router.patch('/:id', isAuthorize, async (req, res) => {
    
    try {
        const { id } = req.params;
        const { comment, username } = req.body;
        const user_id = req.user.id;
    
        if (!comment) {
            return res.status(400).json({ error: { code: 'COMMENT_IS_REQUIRE' } });
        }
        const result = await pool.query(`
            UPDATE comments
            SET content = $1
            WHERE id = $2 AND user_id = $3
            RETURNING *;
        `, [comment, id, user_id]);

        if (result.rows.length === 0) {
            return res.status(403).json({
                error: { code: 'NOT_ALLOWED_OR_NOT_FOUND' }
            });
        }

        return res.json({success : {data : result.rows[0]}});

    } catch (error) {
        if (DEBUG) {
            console.log('[ERROR] -> [PATCH] /comments/:id :', error);
        }
        return res.status(400).json({
            error: { code: 'GENERAL_ERROR' }
        });
    }
});

/*
[DELETE] /comments/:id
*/
router.delete('/:id', isAuthorize, async (req, res) => {
    
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        const result = await pool.query(`
            DELETE FROM comments
            WHERE id = $1 AND user_id = $2
            RETURNING *;
        `, [id, user_id]);

        if (result.rows.length === 0) {
            return res.status(403).json({
                error: { code: 'NOT_ALLOWED_OR_NOT_FOUND' }
            });
        }

        return res.json({success : {code : 'SUCCESS'}});

    } catch (error) {
        if (DEBUG) {
            console.log('[ERROR] -> [DELETE] /comments/:id :', error);
        }
        return res.status(400).json({
            error: { code: 'GENERAL_ERROR' }
        });
    }
});

module.exports = router