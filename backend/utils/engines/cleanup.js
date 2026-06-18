const cron = require('node-cron');
const fs = require('fs');
const pool = require('../../config/pool');

function deleteFolder(folder) {
    fs.rm(folder, { recursive: true, force: true }, (err) => {
        if (err) {
            // console.log("Error deleting folder:", err);
            return;
        }
       // console.log("Folder deleted successfully");
    });
}

cron.schedule('0 3 * * *', async () => {
    try {
        //console.log("🧹 Running movie cleanup...");
        //console.log("runing ...");
        // 1. Find expired movies
        const result = await pool.query(`
            SELECT id, downloaded_path 
            FROM movies 
            WHERE last_watched < NOW() - INTERVAL '30 days'
        `);

        // 2. Delete files from disk
        for (const movie of result.rows) {
            if (movie.downloaded_path && fs.existsSync(movie.downloaded_path)) {
                deleteFolder(movie.downloaded_path)
              
            }
        }

        // 3. Delete DB records
        await pool.query(`
            DELETE FROM movies 
            WHERE last_watched < NOW() - INTERVAL '30 days'
        `);

    } catch (err) {
    }
});

//module.exports = cron


