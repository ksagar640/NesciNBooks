var createError = require('http-errors');
var express = require('express');
var path = require('path');

var mongoose 				= require('mongoose');
// const MongoClient = require(‘mongodb’).MongoClient;
// const uri = "mongodb+srv://admin:<qlzpam22%24>@cluster0-nglwm.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object


var passport 				= require('passport');
var bodyParser 				= require("body-parser");
var User					= require("./models/User");
var LocalStrategy 		   	= require("passport-local");
var passportLocalMongoose   = require("passport-local-mongoose");
var book 					= require("./models/book");
var session 				= require('express-session');
var expressValidator        = require('express-validator');
var MongoStore 				= require('connect-mongo')(session);

var app = express();

app.use(session({
  name: 'session-id',
  secret: 'this_is_worst_session_secret',
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie:{ maxAge: 180*60*1000 }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(function(req,res,next){
  res.locals.currentUser=req.user;
	res.locals.session = req.session;
	next();
});


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


//   client.close();
// });

module.exports = app;