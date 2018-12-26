let dotenv = require('dotenv');
dotenv.config();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var api = require('./routes/api');
var user = require('./routes/user');
let debug = require('debug')('SERVER:');
var app = express();
var passport = require('passport');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const csrfMiddleware = csurf({
  cookie: true
});
app.use(cookieParser());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'false'}));
var conditionalCSRF =  (req, res, next) => {
  if (req.originalUrl !== '/api/upload') {
    csrfMiddleware(req, res, next);
  } else {
    next();
  }
}
app.use(conditionalCSRF);
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'build')));
require('./config/passport');
require('./models/schema')()
  .then((res)=>{ debug('connection successfull'); })
  .catch((err)=>{ debug(err); });
app.use('/user/api', user);
app.use('/api', api);

app.get('*', (req, res, next) => {
    res.sendFile(path.join( __dirname, 'dist/index.html'));
})
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({err:'error'});
});

module.exports = app;
