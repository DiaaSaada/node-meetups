const express = require('express');

const router = express.Router();
const UserModel = require('../../models/userModel');
const passport = require('passport');

module.exports = () => {
  router.get('/registration', (req, res) => res.render('users/registration', { success: req.query.success }));
  router.post('/registration', async (req, res, next) => {
    const user = new UserModel({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });
    const saved = await user.save();
    if (saved) {
      res.redirect('/users/registration?success=true')
    }
    return next(new Error());
  });

  router.get('/account', (req, res, next) => {
    if (req.user)
      return next();

    return res.status(401).end()
  }, (req, res) => res.render('users/account', { user: req.user }));


  router.get('/login', (req, res) => res.render('users/login', { error: req.query.error }));
  router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login?error=true',
  }));

  router.get('/logout', async (req, res, next) => {
    req.logOut(() => {
      return res.redirect('/')
    });

  });

  return router;
};
function myAccount() {
  return (req, res) => res.render('users/account', { user: req.user });
}


function myAccountMiddleware() {
  return;
}

