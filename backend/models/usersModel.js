const pool = require('../config/pool')

const INFO = process.env.INFO_MODE || false
const DEBUG = process.env.DEBUG_MODE || false

async function initUsersDBTable(){
    try{
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                password TEXT,
                profile_picture TEXT,
                auth_provider VARCHAR(50) DEFAULT 'local',
                provider_id VARCHAR(150),
                preferred_language VARCHAR(5) DEFAULT 'en',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        if (INFO){
            console.log('[OK] -> initUsersDBTable')
        }

    }catch(error){
        if (DEBUG){
            console.log('[ERROR] -> initUsersDBTable -> ', error)
        }
    }
}

async function registerUser(informations) {
    try {
        const query = `
            INSERT INTO users 
            (username, email, first_name, last_name, password, profile_picture, auth_provider, provider_id)
            VALUES ($1, $2, $3, $4, $5, NULL, 'local', NULL)
            RETURNING id, username, email, first_name, last_name;
        `;

        const {
            email,
            username,
            password,
            first_name,
            last_name,
        } = informations;

        const result = await pool.query(query, [
            username,
            email,
            first_name,
            last_name,
            password
        ]);

        return result.rows[0]; // ✅ now it exists

    } catch (error) {
        if (DEBUG) {
            console.log('[ERROR] -> registerUser -> ', error);
        }
        return null;
    }
}

async function lookupUserByEmail(email){
    try{
        const query = `
            SELECT * FROM users WHERE email = $1;
        `
        const result = await pool.query(query, [email])
        return result.rows[0]
    }catch(error){
        if (DEBUG){
            console.log('ERROR -> lookupUserByEmail -> ', error)
        }
        return null
    }
}

async function lookupUserByUsername(username){
    try{
        const query = `
            SELECT * FROM users WHERE username = $1;
        `
        const result = await pool.query(query, [username])
        return result.rows[0]
    }catch(error){
        if (DEBUG){
            console.log('ERROR -> lookupUserByUsername -> ', error)
        }
        return null
    }
}

module.exports = {initUsersDBTable, lookupUserByEmail, lookupUserByUsername, registerUser}