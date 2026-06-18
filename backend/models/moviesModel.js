const pool = require('../config/pool')

const INFO = process.env.INFO_MODE || false
const DEBUG = process.env.DEBUG_MODE || false

async function initMoviesDBTable(){
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS movies (
                id SERIAL PRIMARY KEY,
                api VARCHAR(255) NOT NULL,
                identifier VARCHAR(255) UNIQUE NOT NULL,
                title VARCHAR(500) NOT NULL,
                year INTEGER,
                summary TEXT,
                length INTEGER,
                main_cast TEXT,
                imdb_rating REAL,
                director VARCHAR(255),
                cover_image VARCHAR(1024),
                downloaded_path VARCHAR(1024),
                torrent_link TEXT,
                subtitle JSONB,
                last_watched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                language VARCHAR(50),
                status VARCHAR(50) DEFAULT 'not_downloaded',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            
            
            CREATE TABLE IF NOT EXISTS user_movie_history (
                id SERIAL PRIMARY KEY,
                progress FLOAT DEFAULT 0,
                engine VARCHAR(50),
                identifier VARCHAR(255),
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
                last_watched TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, movie_id)
            );
                
        `);
        if (INFO){
            console.log('[OK] -> initMoviesDBTable')
        }

    }catch(error){
        if (DEBUG){
            console.log('[ERROR] -> initMoviesDBTable -> ', error)
        }
    }
}


module.exports = initMoviesDBTable