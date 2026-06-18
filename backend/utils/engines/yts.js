const axios = require('axios');
const { movieWatched } = require('./tools');

require('dotenv').config()

const DEBUG = process.env.DEBUG_MODE || false

/*

String (year, rating, date_added) 

*/

const YTSEngine = async ({
    target = null,
    page = 1,
    limit = 50,
    sortBy = 'date_added',
    orderBy = 'desc',
    minRating = 0,
}) => {

    try {
        const params = {
                page: page,
                limit: limit,
                with_rt_ratings: true,
                minimum_rating: minRating,
                sort_by: sortBy,
                order_by: orderBy,
            };

        if (target) {
            params.query_term = target;
        }

        const response = await axios.get(
            `https://movies-api.accel.li/api/v2/list_movies.json`,
            { params }
        );

        const data = response?.data?.data;
        const movies = data?.movies || [];

        const results = await Promise.all(movies.map(async (movie) => {

            return {
                id: movie.id,
                title: movie.title,
                year: movie.year,
                rating: movie.rating,
                summary: movie.summary,
                runtime: movie.runtime,
                downloads: 1000,
                source: 'yts',
                magnet: movie?.torrents[0].url || null,
                cover: movie.large_cover_image,
                watched: await movieWatched(String(movie.id), "yts"),
            };
        }));

        return {
            page,
            limit,
            total: data?.movie_count || 0,
            results
        };

    } catch (error) {
        if (DEBUG) {
            console.log('[ERROR] -> YTS API ->', error.message);
        }

        return {
            page,
            limit,
            results: []
        };
    }
};

const YTSMovieById = async (movieId) => {
    try {
        const response = await axios.get(
            'https://movies-api.accel.li/api/v2/movie_details.json',
            {
                params: {
                    movie_id: movieId,
                    with_images: true,
                    with_cast: true
                }
            }
        );

        const movie = response.data?.data?.movie;

        if (!movie) return null;

        return {
            id: movie.id,
            title: movie.title,
            year: movie.year,
            summary: movie.description_full,
            runtime: movie.runtime,
            rating: movie.rating,
            main_cast: movie.cast?.map(c => c.name).join(", "),
            director: movie.director || null,
            language: movie.language,
            torrent: movie.torrents[0].url || null,
            cover: movie.large_cover_image,
        };

    } catch (error) {
        if (DEBUG) {
            console.log('[ERROR] YTSMovieById ->', error.message);
        }
        return null;
    }
};



module.exports = {YTSEngine, YTSMovieById}