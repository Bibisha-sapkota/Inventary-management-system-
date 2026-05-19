const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('✅ Google Profile:', profile.displayName, profile.emails[0].value);

        // Check if user exists with Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = await User.findOne({ email: profile.emails[0].value });
        }

        if (user) {
            console.log('✅ Existing user found');
            if (!user.googleId) {
                user.googleId = profile.id;
                user.isGoogleUser = true;
                user.avatar = profile.photos[0]?.value || '';
            }
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
        }

        // IF WE REACH HERE, NO ACCOUNT EXISTS
        console.log('✅ No account exists. Preparing for Role Selection.');
        return done(null, { 
            isNewGoogleUser: true, 
            email: profile.emails[0].value, 
            name: profile.displayName, 
            googleId: profile.id, 
            avatar: profile.photos[0]?.value || '' 
        });

    } catch (error) {
        console.error('❌ Google Auth Error:', error);
        done(error, null);
    }
}));

module.exports = passport;