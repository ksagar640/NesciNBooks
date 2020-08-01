
var express = require('express');
var app = express();
var mongoose 				= require('mongoose');
var passport        = require('passport');
var bodyParser        = require("body-parser");
var User          = require("./models/User");
var LocalStrategy         = require("passport-local");
var passportLocalMongoose   = require("passport-local-mongoose");
var book          = require("./models/book");
var session         = require('express-session');
var expressValidator        = require('express-validator');
var MongoStore        = require('connect-mongo')(session);
const paypal = require('paypal-rest-sdk');

mongoose.connect("mongodb://localhost/Bookdb");

var User          = require("./models/User");
var book          = require("./models/book");
var Cart          = require("./models/cart");
var seed=require("./seed");


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
  name: 'session-id',
  secret: 'It does not do well to dwell on dreams and forget to live',
  saveUninitialized: false,
  resave: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  cookie:{ maxAge: 7*60*1000 }
}));

passport.use(new LocalStrategy(User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.authenticate('local', { failureFlash: 'Invalid username or password.' });
passport.authenticate('local', { successFlash: 'Welcome!' });
//seed();

app.use(function(req,res,next){
  res.locals.currentUser=req.user;
	res.locals.session = req.session;
	next();
});


paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AS41eR11Fn1sdsuGj1UJahkpfzFfBQIF3rjVg3Z2wArBpZx4r9W_Q9twJDgUNwiz1MTPi7rTwqM-r5GJ',
  'client_secret': 'EPkbdtKWS640FxNYM2L9YfIhzvh45JE6P-dytD25z1QRIOxF5Oc2K5tC09jdeSydamAKqXrPqbnm5Ejf'
});
var cost = 0;


/* GET home page. */
app.get('/',function(req, res, next) {
  res.render('index');
});

app.get('/store',function(req,res){
  //Collecting ece books..
  var cart = new Cart (req.session.cart ? req.session.cart : {items:{},totalQty:0,totalPrice:0});
  req.session.cart = cart;
  book.find({},function(err,doc){
    if (err)
      console.log("NO Book Added to store page");
    else
    {
      res.render('store',{book:doc});
    }
  });
});

app.get("/add-to-cart/:bookid",function(req,res){
  var cart = new Cart (req.session.cart ? req.session.cart : {items:{},totalQty:0,totalPrice:0});

  book.findOne({id:req.params.bookid},function(err,doc){
    if (err)
    {
      return res.redirect("/store");
    }
    cart.add(doc,doc.id);
    req.session.cart = cart;
    console.log(cart);
    res.redirect("/store");
  });
});

app.get("/cart",isLoggedIn,function(req,res){
  if (!req.session.cart)
  {
    return res.redirect("/store");
  }
  var cart = new Cart(req.session.cart);
  return res.render("cart",{bookArray: cart.generateArray(),cost: cart.totalPrice});
});

app.get("/update/:bookid",isLoggedIn,function(req,res){
  var cart = new Cart(req.session.cart);
  book.findOne({id:req.params.bookid},function(err,doc){
          if (err)
            {
              console.log(err);
              return res.redirect("/cart");
            }

          else
            {
              cart.remove(doc,doc.id);
              console.log(req.session.cart);
              req.session.cart = cart;
              
              res.redirect("/cart");
            }
        });
});

/*  Auth Routes */
app.get('/signIn',function(req,res){
   res.render("SignIn");
});

app.post("/signIn",passport.authenticate('local', 
  {successRedirect: "/store",failureRedirect: '/signIn'}),((req,res)=>{
    req.session.username = req.body.username;
    req.session.password = req.body.password;
  res.redirect("/store");
}));

app.get('/signUp',function(req,res){
  res.render("signUp",{showAlert:null});
});

app.post('/signUp',function(req,res){
  User.register(new User({username: req.body.username}),req.body.password,function(err,newuser){
    if (err)
    {
      res.render('signUp',{showAlert:'true'});
    }
    console.log(newuser);
    passport.authenticate("local")(req,res,function(){
      req.session.username = req.body.username;
        req.session.password = req.body.password;
    
      res.redirect('/store');
    });
  });
});

app.get("/logout", function(req, res){
   req.session.destroy();    
     req.logout();    
     res.redirect("/");
});

app.post('/pay',function(req,res){
  cost = req.body.totalcost;
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
   "transactions": [{
        "item_list": {
            "items": [{
                "name": "Books",
                "sku": "001",
                "price": cost,
                "currency": "rupees",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": cost
        },
        "description": "Hat for the best team ever"
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
      console.log(payment);
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }   
  }
});
});

app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "rupees",
            "total" : cost
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        cost = 0;
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('Payment is Successfull and Happy Reading Moments !!!');
        cost=0;
    }
});
});

app.get('/cancel', (req, res) => res.send('Sorry Payment Failed please pay again'));


function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/signIn");
}

app.listen(3000,function () {
  console.log("server started! at port 3000");
})
