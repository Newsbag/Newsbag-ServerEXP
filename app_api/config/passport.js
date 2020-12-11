const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').Strategy;
const User = mongoose.model('User');

let jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use('local', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, (username, password, cb) => {
    let criteria = (username.indexOf('@') === -1) ? {username: username} : {email: username};
    return User.findOne(criteria)
    .then(user => {
        if (!user) {
            console.error("Incorrect email");
            return cb(null, false, {
                "message": "Incorrect email"
            });
        }
        if (!user.validPassword(password)) {
            console.error("Incorrect password");
            return cb(null, false, {
                "message": "Incorrect password"
            });
        }
        console.log("User logged in");
        return cb(null, user, {
            "message": "User logged in"
        });
    })
    .catch(err => {
        console.error(err);
        cb(err)
    });
}));

passport.use('jwt', new JwtStrategy(jwtOptions, (payload, cb) => {
    return User.findById(payload.id)
    .then(user => {
        return cb(null, user);
    })
    .catch(err => {
        return cb(err);
    });
}));