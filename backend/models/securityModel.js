const pool = require('../config/pool')

const INFO = process.env.INFO_MODE || false
const DEBUG = process.env.DEBUG_MODE || false

async function initPasswordResetDBTable(){
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS password_reset_requests (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL,
                reset_token TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        if (INFO){
            console.log('[OK] -> initPasswordResetDBTable')
        }

    }catch(error){
        if (DEBUG){
            console.log('[ERROR] -> initPasswordResetDBTable -> ', error)
        }
    }
}

module.exports = initPasswordResetDBTable