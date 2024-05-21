const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userData = require('../Model/userData');

passport.use(
    new GoogleStrategy(
        {
            clientID: "973527692531-2cmnp4cjffre13vl0ks7u1j7chfvti8u.apps.googleusercontent.com",
            clientSecret: "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",
            callbackURL: 'http://localhost:7777/auth/google/callback',
        },
        (accessToken, refreshToken, profile, done) => {

            const { displayName, emails } = profile;
            const email = emails[0].value;

            const name = displayName.replace(/\s/g, "")

            const newUser = new userData({
                name: name,
                email: email,
                mobile: 1234567890, 
                password: "Mushrif@123", 
                isVerified: true
            });    

            newUser.save()
                .then(savedUser => {
                    console.log("Google User saved :", savedUser);
                    done(null, savedUser); 
                })
                .catch(error => {
                    console.error("Error saving user:", error);
                    done(error, null); 
                });
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;

