const axios = require('axios');
const { movieWatched } = require('./tools');

require('dotenv').config()

const DEBUG = process.env.DEBUG_MODE === 'true'

const ArchiveEngine = async ({target = null, page = 1, limit = 20, sortBy = 'downloads', year = null, minRating = 2}) => {
    try {
        let query;

        if (target && target.trim() !== '') {
            query = `title:(${target}) AND mediatype:(movies) AND collection:(feature_films)`;
        } else {
            query = `mediatype:(movies) AND collection:(feature_films)`;
        }

        if (year) query += ` AND year:[${year} TO ${year}]`;
        if (minRating) query += ` AND avg_rating:[${minRating} TO *]`;

        const response = await axios.get('https://archive.org/advancedsearch.php', {
            params: {
                q: query,
                'fl[]': [
                    'identifier',
                    'title',
                    'year',
                    'description',
                    'runtime',
                    'avg_rating',
                    'downloads'
                ],
                sort: [`${'downloads'} desc`],
                rows: limit,
                page: page,
                output: 'json'
            }
        });

        const docs = response?.data?.response?.docs || [];
       
        const results = await Promise.all(
            docs
                .filter(doc => doc.identifier && doc.title && doc.year && doc.avg_rating && doc.runtime)
                .map(async (doc) => ({
                    id: doc.identifier,
                    title: doc.title,
                    year: doc.year || null,
                    rating: doc.avg_rating || null,
                    summary: doc.description || '',
                    runtime: toMinutes(doc.runtime) || 0,
                    downloads: doc.downloads || 0,
                    source: 'archive',
                    magnet: `https://archive.org/download/${doc.identifier}/${doc.identifier}_archive.torrent`,
                    cover: `https://archive.org/services/img/${doc.identifier}`,
                    watched: await movieWatched(doc.identifier, "archive")
                }))
        );

        return {
            page,
            limit,
            results
        };

    } catch (error) {
        if (DEBUG) {
            console.log('[ERROR] -> ArchiveAPI -> ', error.message);
        }

        return {
            page,
            limit,
            results: []
        };
    }
};

function toMinutes(time) {
    try{
        const [hours, minutes, seconds] = time.split(':').map(Number);
    
       return Math.floor((hours * 60) + minutes + (seconds / 60));
    }catch (err){
        //console.log(err)
        return 0
    }
}

const archiveMovieById = async (id) => {
    try {
        const response = await axios.get(`https://archive.org/metadata/${id}`);

        const data = response.data;
        const metadata = data.metadata || {};
        const files = data.files || [];

        const server = data.d1;
        const dir = data.dir;

        const baseUrl = `https://${server}${dir}`;

        // 🎬 Smart video selection
        const videoFile =
            files.find(f => f.format === 'h.264') ||
            files.find(f => f.format === 'MPEG4') ||
            files.find(f => f.format === '512Kb MPEG4') ||
            files.find(f => f.format && f.format.includes('Ogg'));

        // ⏱ runtime (seconds)
        const runtime = videoFile?.length
            ? Math.round(parseFloat(videoFile.length))
            : null;

        // 🖼 thumbnails
        const thumbnails = files
            .filter(f => f.format === 'Thumbnail')
            .slice(0, 5)
            .map(f => `${baseUrl}/${f.name}`);

        return {
            id,
            title: metadata.title || null,
            year: metadata.year ? parseInt(metadata.year) : null,
            summary: metadata.description || null,
            runtime,
            rating: metadata.avg_rating || null,
            main_cast: metadata.creator || null,
            director: metadata.director || null,
            language: metadata.language || null,

            cover: `https://archive.org/services/img/${id}`,

            video: videoFile
                ? `${baseUrl}/${videoFile.name}`
                : null,

            torrent: `${baseUrl}/${id}_archive.torrent`,

            thumbnails,
            subtitles : null,
        };

    } catch (error) {
        if (DEBUG) {
            console.log('[ERROR] -> getMovieById ->', error);
        }
        return null;
    }
};



module.exports = {ArchiveEngine, archiveMovieById};



/*

Sorting (dynamic)

ArchiveEngine(null, 1, 20, 'downloads') // popular
ArchiveEngine('batman', 1, 20, 'avg_rating')
ArchiveEngine('batman', 1, 20, 'year')


*/
