const express = require('express');
const path = require('path');
const createError = require('http-errors');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const auth = require('./lib/auth');

const routes = require('./routes');
const SpeakerService = require('./services/SpeakerService');
const FeedbackService = require('./services/FeedbackService');
const cookieParser = require('cookie-parser');

module.exports = (config) => {
  const app = express();
  const speakers = new SpeakerService(config.data.speakers);
  const feedback = new FeedbackService(config.data.feedback);

  app.set('view engine', 'pug');
  app.set('views', path.join(__dirname, './views'));

  app.locals.title = config.sitename;

  app.use('/', express.static(path.join(__dirname, '../public')));
  app.get('/favicon.ico', (req, res) => res.sendStatus(204));

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(session({
    secret: 'sfssesvsvsv',
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: config.database.dsn,

    })
  }))
  app.use(auth.initialize);
  app.use(auth.session);
  app.use(auth.setUser);

  app.use(async (req, res, next) => {
    try {
      req.session.visitis = (req.session.visitis ?? 0) + 1
      const names = await speakers.getNames();
      res.locals.speakerNames = names;
      return next();
    } catch (err) {
      return next(err);
    }
  });

  app.use('/', routes({ speakers, feedback }));

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    next(createError(404));
  });

  if (app.get('env') === 'development') {
    app.locals.pretty = true;
  }

  // error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    res.locals.message = err.message;
    const status = err.status || 500; // If no status is provided, let's assume it's a 500
    res.locals.status = status;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(status);
    res.render('error');
  });

  return app;
};
