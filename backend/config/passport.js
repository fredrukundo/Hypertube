const pool = require('./pool')
const passport = require('passport')
const FortyTwoStrategy = require('passport-42').Strategy
const GitHubStrategy = require('passport-github2').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');


const INFO = process.env.INFO_MODE || false
const DEBUG = process.env.DEBUG_MODE || false

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'RANDOM_JWT_KEY'
};

passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try{
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [jwt_payload.id]);
        if (result.rows.length > 0) {
            return done(null, result.rows[0]);
        }
        return done(null, false);
    }catch (error) {
        if (DEBUG){
            console.log('[ERROR] -> JwtStrategy -> ', error)
        }
        return done(error, false);
    }
}));

passport.serializeUser((user, done) => done(null, user.id))

passport.deserializeUser(async (id, done) => {
    try{
        const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id])
        if (result.rows.length == 0){
            throw new Error('USER_NOT_FOUND')
        }
        done(null, result.rows[0])
    }catch(error){
        if (DEBUG){
            console.log('[ERROR] -> passport.deserializeUser -> ', error)
        }
        done(error, null)
    }
})

if (process.env.FORTYTWO_CLIENT_ID && process.env.FORTYTWO_CLIENT_SECRET){
    passport.use("42", new FortyTwoStrategy({
        clientID: process.env.FORTYTWO_CLIENT_ID,
        clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
        callbackURL: "/auth/42/callback"
    }, async (accessToken, refreshToken, profile, cb) => {
        try{
            let result = await pool.query('SELECT * FROM users WHERE auth_provider = $1 AND provider_id = $2', ['42', profile.id]);
            let user = result.rows[0] || null;

            if (!user && profile?.emails) {
                try {

                    const email =
                        profile?.emails?.[0]?.value ||
                        `${profile.username}@student.42.fr`;

                    const res = await pool.query(
                        `
                        SELECT * FROM users
                        WHERE email = $1 AND auth_provider != $2
                        `,
                        [email, '42']
                    );

                    if (res.rows.length > 0) {
                        return cb(
                            new Error(
                                'An account with this email already exists using another login method.'
                            ),
                            null
                        );
                    }

                } catch (error) {

                    return cb(
                        new Error(
                            'You cannot use this oauth with this account. Try another account.'
                        ),
                        null
                    );
                }
            }

            
            if (!user) {
                
                const insert = await pool.query(
                    `INSERT INTO users (username, email, first_name, last_name, profile_picture, auth_provider, provider_id)
                        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                    [
                        profile.username,
                        profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@student.42.fr`,
                        profile.name.givenName,
                        profile.name.familyName,
                        profile._json?.image?.versions?.medium || profile._json?.image?.link || null,
                        '42',
                        profile.id
                    ]
                );
                user = insert.rows[0];
            }
            return cb(null, user); 

        }catch(error){
            if (DEBUG){
                console.log('[ERROR] -> FortyTwoStrategy -> ', error)
            }
            return cb(error, null);
        }
    }))
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use("github", new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/auth/github/callback"
    }, async (accessToken, refreshToken, profile, cb) => {
        try {
            
            let result = await pool.query(
                'SELECT * FROM users WHERE auth_provider = $1 AND provider_id = $2',
                ['github', profile.id]
            );
            
            let user = result.rows[0] || null;
            
            if (!user) {
                const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
                const insert = await pool.query(
                `INSERT INTO users
                (username, email, first_name, last_name, profile_picture, auth_provider, provider_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                [
                    profile.username || profile.displayName,
                    email,
                    profile.displayName || null,
                    null,
                    profile.photos?.[0]?.value || null,
                    'github',
                    profile.id
                ]
                );

                user = insert.rows[0];
            }

            return cb(null, user);

        } catch (error) {
            if (DEBUG) {
                console.log('[ERROR] -> GitHubStrategy -> ', error);
            }
            return cb(error, null);
        }
    }));
}


if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    passport.use("discord", new DiscordStrategy({
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: "/auth/discord/callback",
        scope: ['identify', 'email']
    }, async (accessToken, refreshToken, profile, cb) => {
        try {
            let result = await pool.query(
                'SELECT * FROM users WHERE auth_provider = $1 AND provider_id = $2',
                ['discord', profile.id]
            );

            let user = result.rows[0] || null;

            if (!user) {
                const insert = await pool.query(
                `INSERT INTO users
                (username, email, first_name, last_name, profile_picture, auth_provider, provider_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                [
                    profile.username || profile.global_name,
                    profile.email || null,
                    profile.global_name || null,
                    null,
                    profile.avatar
                    ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
                    : null,
                    'discord',
                    profile.id
                ]
                );

                user = insert.rows[0];
            }

            return cb(null, user);

        } catch (error) {
            return cb(error, null);
        }
    }));
}


module.exports = passport
