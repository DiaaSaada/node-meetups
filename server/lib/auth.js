const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy
const UserModel = require('../models/userModel');

passport.use(new LocalStrategy({
    usernameField: 'email',
}, async (u, p, done) => {
    try {
        const user = await UserModel.findOne({ email: u }).exec();
        if (!user) {
            return done(null, false, { message: 'Invalid username or password!' })
        }
        const passwordOk = await user.comparePassword(p)
        if (!passwordOk) {
            return done(null, false, { message: 'Invalid username or password!' })
        }
        done(null, user)
    } catch (err) {
        return done(err)
    }

}))
passport.serializeUser((user, done) => done(null, user._id))
passport.deserializeUser(async (userId, done) => {
    try {
        const user = await UserModel.findById(userId)
        return done(null, user)
    } catch (err) {
        done(err)
    }
})
module.exports = {
    initialize: passport.initialize(),
    session: passport.session(),
    setUser: (req, res, next) => {
        res.locals.user = req.user
        return next()
    }
}