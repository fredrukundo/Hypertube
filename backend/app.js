require('dotenv').config();
const path = require('path');
const hpp = require('hpp')
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const { runMigrations } = require('./database/db');
const app = express();

require('./utils/engines/cleanup');

app.use(passport.initialize());

const authAPIs = require('./routes/authRoute');
const oauthAPIs = require('./routes/oauth');
const userAPIs = require('./routes/userRoute');
const securityAPIs = require('./routes/securityRouter');
const movieAPIs = require('./routes/movieRouter');
const commentsAPIs = require('./routes/commentRouter');

//  CORS Configuration
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
};

app.use(cors(corsOptions));

// Logging
const incomingRequests = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

app.use(hpp());
app.use(incomingRequests);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Static Files 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/oauth', authAPIs);
app.use('/auth', oauthAPIs);
app.use('/users', userAPIs);
app.use('/movies', movieAPIs);
app.use('/security', securityAPIs);
app.use('/comments', commentsAPIs);

// Health Check
app.get('/health', (req, res) => {
    return res.json({ message: 200 });
});

// Start Server
const PORT = Number(process.env.EXPRESS_PORT) || 8000;

app.listen(PORT, async () => {
    await runMigrations();
    console.log(`Server running on port: ${PORT}`);
});