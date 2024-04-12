const express = require('express');

const router = express.Router();
const UserModel = require('../../models/userModel');

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

  router.get('/account', (req, res) => res.render('users/account', { user: req.user }));

  return router;
};
