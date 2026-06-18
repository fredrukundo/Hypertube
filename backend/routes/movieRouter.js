const express = require('express');
const pool = require('../config/pool');
const isAuthorize = require('../middleware/authorize');
const AllEngines = require('../utils/engines/engines');
const { archiveMovieById, saveArchiveMovie } = require('../utils/engines/archive');
const streaming = require('../utils/engines/streaming');
const { saveYTSMovie, YTSMovieById } = require('../utils/engines/yts');

const router = express.Router();

const INFO = process.env.INFO_MODE || false
const DEBUG = process.env.DEBUG_MODE || false

router.get('/', isAuthorize, async (req, res) => {
    try {
        let { page, limit, search, sortBy, year, minRating } = req.query;

        page = Number(page);
        limit = Number(limit);
        year = Number(year);
        minRating = Number(minRating);

        page = !isNaN(page) && page >= 1 ? page : 1;
        limit = !isNaN(limit) && limit <= 100 ? limit : 20;

        const data = await AllEngines({
            target: search || null,
            page,
            limit,
            sortBy: sortBy || 'downloads',
            year: !isNaN(year) ? year : null,
            minRating: !isNaN(minRating) ? minRating : null
        });

        return res.status(200).json({
            success: { data }
        });

    } catch (error) {
        if (DEBUG) {
            console.log('[ERROR] -> [GET] movies/ :', error);
        }

        return res.status(400).json({
            error: { code: 'GENERAL_ERROR' }
        });
    }
});

router.get('/search', isAuthorize, async (req, res) => {
    try {
        let { page, limit, keyword, sortBy, year, minRating } = req.query;

        if (!keyword){
            return res.status(200).json({success: { data: null }});
        }

        page = Number(page);
        limit = Number(limit);
        year = Number(year);
        minRating = Number(minRating);

        page = !isNaN(page) && page >= 1 ? page : 1;
        limit = !isNaN(limit) && limit <= 100 ? limit : 20;

        const data = await AllEngines({
            target: keyword,
            page,
            limit,
            sortBy: sortBy || 'downloads',
            year: !isNaN(year) ? year : null,
            minRating: !isNaN(minRating) ? minRating : null
        });

        return res.status(200).json({
            success: { data }
        });

    } catch (error) {
        if (DEBUG) {
            console.log('[ERROR] -> [GET] movies/search :', error);
        }

        return res.status(400).json({
            error: { code: 'GENERAL_ERROR' }
        });
    }
});


router.get('/live/:id/stream', isAuthorize, async (req, res) => {
    try {
        const { id } = req.params;
        const existingMovie = await pool.query(
            `SELECT * FROM movies WHERE identifier = $1 LIMIT 1`,
            [id]
        );
        if (!existingMovie || existingMovie.rows.length === 0) {
            return res.status(400).json({
                error: { code: 'MOVIE_NOT_FOUND' }
            });
        }
        const movie = existingMovie.rows[0];
        if (!movie.torrent_link) {
            return res.status(400).json({
                error: { code: 'TORRENT_LINK_NOT_AVAILABLE' }
            });
        }
        await streaming.pipeStream(req, res, movie);
        // await pipeController.piping(req, res, movie);

    } catch (error) {
        if (DEBUG) {
            console.log('[ERROR] -> [GET] movies/live/:id/stream :', error);
        }

        return res.status(500).json({
            error: { code: 'SERVER_ERROR' }
        });
    }
});

const saveMovie = async (movie, engine) => {
    try {
        const { id } = movie;

        const existing = await pool.query(
            `SELECT * FROM movies WHERE api = $1 AND identifier = $2`,
            [engine, id]
        );

        
        if (existing.rows.length > 0) {
            
            const commentsResult = await pool.query(
                `SELECT 
                    *
                FROM comments
                WHERE comments.movie_id = $1
                `,
                [existing.rows[0].id]
            );

            const commentsCount = commentsResult.rowCount;

            return {
                ...existing.rows[0],
                commentsCount,
            };
        }

        const result = await pool.query(
            `INSERT INTO movies 
            (api, identifier, title, year, summary, length, main_cast, imdb_rating, director, cover_image, torrent_link, language)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`,
            [
                engine,
                movie.id,
                movie.title || null,
                movie.year || null,
                movie.summary || '',
                movie.runtime || null,
                movie.main_cast || null,
                movie.rating || 0,
                movie.director || null,
                movie.cover || null,
                //movie.video || null,
                movie.torrent || null,
                movie.language || null,
                //movie.subtitles ? JSON.stringify(movie.subtitles) : null
            ]
        );

        return {
            ...result.rows[0],
            commentsCount: 0,
        };

    } catch (error) {
        if (DEBUG) {
            console.log('[ERROR] saveMovie:', error);
        }
        return null;
    }
};


router.get('/:id', isAuthorize, async (req, res) => {
    try{
        const { id } = req.params;
        const { engine } = req.query;
        if (!engine || !['archive', 'yts'].includes(engine)) {
            return res.status(400).json({
                error: { code: 'ENGINE_MUST_BE_AVAILABLE' }
            });
        }
    
        if (engine === 'yts'){
            const movie = await YTSMovieById(id);
            if (!movie){
                return res.status(400).json({
                    error: { code: 'MOVIE_NOT_FOUND' }
                });
            }
        
            const movieDB = await saveMovie(movie, "yts");
        
            return res.json(movieDB);
        }else{
            const movie = await archiveMovieById(id);
            if (!movie){
                return res.status(400).json({
                    error: { code: 'MOVIE_NOT_FOUND' }
                });
            }
        
            const movieDB = await saveMovie(movie, "archive");
        
            return res.json(movieDB);
        }
    }catch(error){
        if (DEBUG) {
            console.log('[ERROR] -> [GET] movies/:id :', error);
        }

        return res.status(400).json({
            error: { code: 'GENERAL_ERROR' }
        });

    }
});


// ── Subtitle endpoint: serves SRT as WebVTT ───────────────────────────────
const path = require('path');
const fs = require('fs');

function srtToVtt(srtContent) {
    // SRT → WebVTT conversion:
    // 1. Add WEBVTT header
    // 2. Replace comma with dot in timestamps (00:01:23,456 → 00:01:23.456)
    const vtt = srtContent
        .replace(/\r\n/g, '\n')
        .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
    return 'WEBVTT\n\n' + vtt;
}

router.get('/subtitles/:movieId', isAuthorize, async (req, res) => {
    try {
        const { movieId } = req.params;
        const movieDir = path.join('./uploads/movies', movieId);

        if (!fs.existsSync(movieDir)) {
            res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
            return res.send('WEBVTT\n\n');
        }

        // Scan for subtitle files in the movie directory (recursively)
        const findSubs = (dir) => {
            const results = [];
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    results.push(...findSubs(fullPath));
                } else {
                    const ext = path.extname(entry.name).toLowerCase();
                    if (['.srt', '.vtt', '.ass'].includes(ext)) {
                        results.push(fullPath);
                    }
                }
            }
            return results;
        };

        const subtitleFiles = findSubs(movieDir);
        if (subtitleFiles.length === 0) {
            res.setHeader('Content-Type', 'text/vtt; charset=utf-8');

            return res.send('WEBVTT\n\n');
        }

        // Serve the first subtitle found, converted to VTT
        const subPath = subtitleFiles[0];
        const ext = path.extname(subPath).toLowerCase();
        const content = fs.readFileSync(subPath, 'utf-8');

        let vttContent;
        if (ext === '.vtt') {
            vttContent = content;
        } else if (ext === '.srt') {
            vttContent = srtToVtt(content);
        } else {
            // .ass — basic passthrough (limited browser support)
            vttContent = content;
        }

        res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.send(vttContent);

    } catch (error) {
        if (DEBUG) {
            console.log('[ERROR] -> [GET] movies/subtitles/:movieId :', error);
        }
        return res.status(500).json({ error: { code: 'SUBTITLE_ERROR' } });
    }
});


module.exports = router;
