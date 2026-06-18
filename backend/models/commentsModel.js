const pool = require('../config/pool')

const INFO = process.env.INFO_MODE || false
const DEBUG = process.env.DEBUG_MODE || false

async function initCommentsDBTable(){
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                rate INT DEFAULT 2 CHECK (rate BETWEEN 0 AND 5),

                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        if (INFO){
            console.log('[OK] -> initCommentsDBTable')
        }

    }catch(error){
        if (DEBUG){
            console.log('[ERROR] -> initCommentsDBTable -> ', error)
        }
    }
}

module.exports = initCommentsDBTable