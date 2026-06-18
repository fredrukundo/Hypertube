const {initUsersDBTable} = require('../models/usersModel')
const initPasswordResetDBTable = require('../models/securityModel');
const initMoviesDBTable = require('../models/moviesModel');
const initCommentsDBTable = require('../models/commentsModel');

async function runMigrations(){
    await initUsersDBTable();
    await initPasswordResetDBTable();
    await initMoviesDBTable();
    await initCommentsDBTable();
}

module.exports = {runMigrations}
