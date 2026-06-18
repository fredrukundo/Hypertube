const e = require('express');
const torrentStream = require('torrent-stream');
const fs = require('fs');
const path = require('path')
const ffmpeg = require('fluent-ffmpeg');
const trackers = require('../../utils/trackers');
const pump = require('pump');
const os = require('os');
const { PassThrough } = require('stream');
const { pipeline } = require('stream/promises');
const { resolve } = require('dns');
const pool = require('../../config/pool');
const delay = (ms) => new Promise(r => setTimeout(r, ms));


var engines = {};
const VIDEO_EXTENSIONS = [
    '.mp4', '.mkv', '.webm', '.mov', '.avi', '.wmv',
    '.flv', '.m4v', '.3gp', '.mpg', '.mpeg', '.ogv', '.ogg',
]

function getRange(req, fileSize) {
    const range = req.headers.range;
    if (!range) {
        return null;
    }
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = (end - start) + 1;
    return { start, end, chunkSize };
}

async function initEngine(req, res, movie) {
    if (engines[movie.torrent_link]) {
        return engines[movie.torrent_link];
    }
    const response = await fetch(movie.torrent_link);
    if (!response.ok) {
        throw new Error(`Failed to fetch torrent`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let options = {
        path: `./uploads/movies/${movie.id}`,
        trackers: trackers,
        dht: true,
        tracker: true
    }
    const engine = torrentStream(buffer, options);
    engine.isReady = false;
    engine.on('ready', () => {
        // Deselect everything immediately — only explicitly selected files will download
        engine.files.forEach(
            f => {
                // console.log(f.name);
                f.deselect();
            }
        );
        engine.isReady = true;
        engines[movie.torrent_link] = engine;
        //console.log(`[torrent] engine ready — ${engine.files.length} files (all deselected)`);
    });
    engine.on('idle',async () => {
        //console.log("Engine idle");
        const streamFile = findStreamFile(engine);
        const moviePath = `./uploads/movies/${movie.id}/${streamFile.file.name}`;
        //console.log("movie not founded: ", movie.id);
        /* */
        await saveDownloadedMovie(`./uploads/movies/${movie.id}`, movie.id);
        await upsertUserHistory(req.user.id, movie); // req.user.id
        /* */
        
        if (streamFile.found &&
            fs.existsSync(moviePath) &&
            streamFile.file.length === fs.statSync(moviePath).size) {
            engine.movieDownloaded = true;
            engine.moviePath = moviePath;
            engine.pathDB = `./uploads/movies/${movie.id}`
        }
    });
    engine.on('error', (err) => {
        //console.log("Engine error:", err);
        engine.destroy(() => { });
        delete engines[movie.torrent_link];
    });
    engine.on('download', (index) => {
        //console.log(`[torrent] piece ${index} downloaded, total: ${(engine.swarm.downloaded / 1024 / 1024).toFixed(1)} MB`);
    });
    engine.on('peer', () => {
        //console.log(`[torrent] peers: ${engine.swarm.wires.length}`);
    });
    return engine;
}

function findStreamFile(engine) {
    if (!engine.isReady) {
        throw new Error('Engine is not ready');
    }
    const files = engine.torrent.files;
    if (!files || files.length === 0) {
        throw new Error('No files found in torrent');
    }

    let targetIndex = -1;
    let targetFile = null;
    let maxSize = -1;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExtension = path.extname(file.name).toLowerCase();

        if (!VIDEO_EXTENSIONS.includes(fileExtension)) continue;

        // Prefer mp4/webm — no conversion needed
        if (fileExtension === '.mp4' || fileExtension === '.webm') {
            targetIndex = i;
            targetFile = file;
            break;
        }

        // Track the largest video file as fallback
        if (file.length > maxSize) {
            maxSize = file.length;
            targetIndex = i;
            targetFile = file;
        }
    }
    if (!targetFile) {
        return { found: false, index: -1, file: null, needConvert: false, mimeType: null };
    }
    const fileExtension = path.extname(targetFile.name).toLowerCase();
    const needConvert = !(fileExtension === '.mp4' || fileExtension === '.webm');
    const mimeType = needConvert ? 'video/webm' : (fileExtension === '.mp4' ? 'video/mp4' : 'video/webm');
    return { found: true, index: targetIndex, file: targetFile, needConvert, mimeType };
}

function awaitEngineReady(engine, timeoutMs) {
    return new Promise((resolve, reject) => {
        const onReady = () => {
            cleanup();
            resolve();
        };
        const onError = (err) => {
            cleanup();
            reject(err);
        };
        const onTimeout = () => {
            cleanup();
            reject(new Error('ENGINE_READY_TIMEOUT'));
        };

        const cleanup = () => {
            clearTimeout(timer);
            engine.off('ready', onReady);
            engine.off('error', onError);
        };

        engine.once('ready', onReady);
        engine.once('error', onError);

        const timer = setTimeout(onTimeout, timeoutMs);
    });
}

function convertAndStream(res, targetFile, moviePath) {
    res.writeHead(200, {
        "Content-Type": "video/webm",
        "Transfer-Encoding": "chunked"
    });
    const inputStream = targetFile.createReadStream();
    let command = ffmpeg(inputStream)
        .audioBitrate(128)
        .audioCodec("libvorbis")
        .audioChannels(2)
        .videoBitrate(1024)
        .videoCodec("libvpx")
        .outputFormat("webm")
        .outputOptions([
            "-cpu-used 2",
            "-deadline realtime",
            "-preset ultrafast",
            "-error-resilient 1",
            `-threads ${Math.min(os.availableParallelism(), 16)}`,
        ]);

    command
        .on("error", (err, _stdout, stderr) => {
            //console.error("FFmpeg stderr: " + stderr);
        })
        .on("end", () => {
            //console.log("\nConversion finished successfully!");
        });
    res.on('close', () => {
        //console.log("Client disconnected, stopping conversion");
        stop();
        command.kill('SIGKILL');
    });
    command.pipe(res, { end: true });
}

async function waitForFileToGrow(filePath) {
    const start = Date.now();
    const minBytes = 1 << 20 // 1MB;
    const maxWaitTime = 60000; // 60 seconds

    while (Date.now() - start < maxWaitTime) {
        try {
            const stat = await fs.promises.stat(filePath);
            if (stat.size >= minBytes)
                return stat.size;
        } catch {
            // file doesn't exist yet
        }
        await new Promise(r => setTimeout(r, 250));
    }

    throw new Error('FILE_NOT_READY');
}

function sendStream(statusCode, res, inputStream, mimeType, fileSize) {
    res.writeHead(statusCode, {
        "Content-Length": fileSize,
        "Content-Type": mimeType,
        "Accept-Ranges": "bytes"
    });
    inputStream.pipe(res);
}


/* =========================
   USER HISTORY
========================= */
const upsertUserHistory = async (userId, movie, progress = 1.0) => {
    try {
        await pool.query(`
            UPDATE movies SET last_watched = CURRENT_TIMESTAMP WHERE id = $1
        `, [movie.id]);

        await pool.query(`
            INSERT INTO user_movie_history (user_id, movie_id, engine, identifier, progress)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, movie_id)
            DO UPDATE SET 
                progress = EXCLUDED.progress,
                last_watched = CURRENT_TIMESTAMP
        `, [userId, movie.id, movie.api, movie.identifier, progress]);

    } catch (err) {
        //console.log("History DB error:", err.message);
    }
};

const saveDownloadedMovie = async (filePath, id) => {
    if (!fs.existsSync(filePath)) {
        //console.log("not found !!")
        return;
    }

    const movieResult = await pool.query(
        'SELECT status, downloaded_path FROM movies WHERE id = $1',
        [id]
    );

    if (movieResult.rowCount === 0) {
        return;
    }

    const movie = movieResult.rows[0];

    const shouldUpdate =
        movie.status !== 'downloaded' ||
        !movie.downloaded_path;

    if (shouldUpdate) {
        await pool.query(
            `UPDATE movies
             SET downloaded_path = $1,
                 status = $2
             WHERE id = $3`,
            [filePath, 'downloaded', id]
        );
    }
};

function findSubtitles(engine) {
    const files = engine.files || [];
    for (const file of files) {
        const fileExtension = path.extname(file.name).toLowerCase();
        const isSubtitle = fileExtension === '.srt' || fileExtension === '.ass' || fileExtension === '.vtt';
        if (isSubtitle)
            return { file: file, extension: fileExtension };
    }
    return null;
}

async function pipeStream(req, res, movie) {
    //console.log(`Movie : `, movie);
    const engine = await initEngine(req, res, movie);
    if (!engine.isReady) {
        await awaitEngineReady(engine, 20000);
    }
    

    if (engine.movieDownloaded) {
        const moviePath = engine.moviePath;
        const fileSize = fs.statSync(moviePath).size;
        const range = getRange(req, fileSize);
        engine.disconnect(() => { });
        engine.destroy(() => { });
        delete engines[movie.torrent_link];
        
        if (range) {
            res.writeHead(206, {
                "Accept-Ranges": "bytes",
                "Content-Range": `bytes ${range.start}-${range.end}/${fileSize}`,
                "Content-Length": range.chunkSize,
                "Content-Type": "video/mp4"
            });
            const inoutStream = fs.createReadStream(moviePath, { start: range.start, end: range.end });
            inoutStream.pipe(res);
            return;
        } else {
            res.writeHead(200, {
                "Content-Length": fileSize,
                "Content-Type": "video/mp4",
                "Accept-Ranges": "bytes"
            });
            const inoutStream = fs.createReadStream(moviePath);
            inoutStream.pipe(res);
        }
        return;
    }
    const { found, index, file, needConvert, mimeType } = findStreamFile(engine);
    if (!found) {
        throw new Error('NO_STREAM_FILE_FOUND');
    }

    const targetFile = engine.files[index];
    const fileSize = file.length;
    const rangeParams = getRange(req, fileSize);
    const subtitleFile = findSubtitles(engine);
    targetFile.select();
    if (subtitleFile) {
        //console.log("hehheh: ", subtitleFile.file.name);
        subtitleFile.file.select();
        subtitleFile.file.createReadStream();
    }
    let moviePath = `./uploads/movies/${movie.id}/${targetFile.name}`;

    //await waitForFileToGrow(moviePath);
    // movie.downloaded_path = moviePath;
    if (needConvert) {
        //console.log('=> 3')
        convertAndStream(res, targetFile, moviePath);
    } else {
        //console.log('=> 4')
        // If the client sent a Range header but it's invalid/unsupported, return 416.
        if (req.headers.range && !rangeParams) {
            res.writeHead(416, {
                "Content-Range": `bytes */${fileSize}`,
                "Accept-Ranges": "bytes"
            });
            return res.end();
        }
        const inputStream = rangeParams ? targetFile.createReadStream({ start: rangeParams.start, end: rangeParams.end }) : targetFile.createReadStream();
        const stopStream = () => {
            inputStream.destroy();
        };
        if (!rangeParams) {
            res.on('close', stopStream);
            res.writeHead(200, {
                "Content-Length": fileSize,
                "Content-Type": mimeType,
                "Accept-Ranges": "bytes"
            });
            inputStream.pipe(res);
        } else {
            res.on('close', () => {
                stopStream();
            });
            res.writeHead(206, {
                "Accept-Ranges": "bytes",
                "Content-Range": "bytes " + rangeParams.start + "-" + rangeParams.end + "/" + fileSize,
                "Content-Length": rangeParams.chunkSize,
                "Content-Type": mimeType
            });
            inputStream.pipe(res);
        }

    }
}

module.exports = {
    pipeStream
};