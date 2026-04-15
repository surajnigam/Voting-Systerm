import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import Person from './models/users.js';

// Credentials from JSON body (POST) or query string (GET). Avoid findOne({ username: undefined }).
passport.use(
    new LocalStrategy(
        { passReqToCallback: true, usernameField: 'username', passwordField: 'password' },
        async (req, _u, _p, done) => {
            try {
                const username = req.body?.username ?? req.query?.username;
                const password = req.body?.password ?? req.query?.password;

                if (!username || !password) {
                    return done(null, false, { message: 'Missing username or password' });
                }

                const user = await Person.findOne({ username });
                if (!user) {
                    return done(null, false, { message: 'Invalid username or password' });
                }

                const isMatch = await user.comparePassword(password);
                if (!isMatch) {
                    return done(null, false, { message: 'Invalid username or password' });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);

/** Attach to the main Express app after `express()` */
export function configurePassport(app) {
    app.use(passport.initialize());
}

/** Use on specific routes only (not on all `/person` — that blocks registration). */
export const requireLocalAuth = passport.authenticate('local', { session: false });
