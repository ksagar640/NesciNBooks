var express 				= require('express');
var router 					= express.Router();
var mongoose 				= require('mongoose');
var bodyParser 				= require("body-parser");
var passport = require('passport');
const paypal = require('paypal-rest-sdk');
mongoose.connect("mongodb://localhost/Bookdb");
var User					= require("../models/User");
var book 					= require("../models/book");
var Cart 					= require("../models/cart");
var expressValidator        = require('express-validator');
router.use(bodyParser.urlencoded({extended: true}));
// var seedDB                  =require('./seed');
// seedDB();
router.use(function(req,res,next){
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
router.get('/',function(req, res, next) {
  res.render('index');
});
/*  Auth Routes */
router.get('/signIn',function(req,res){
   res.render("SignIn");
});
router.post("/signIn",passport.authenticate('local', 
	{successRedirect: "/store",failureRedirect: '/signIn' }),((req,res)=>{
		req.session.username = req.body.username;
		req.session.password = req.body.password;
 
	res.redirect("/store");
}));
router.get('/signUp',function(req,res){
	res.render("signUp");
});

router.post('/pay',function(req,res){
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
                "name": "Red Sox Hat",
                "sku": "001",
                "price": cost,
                "currency": "USD",
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

router.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
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

router.get('/cancel', (req, res) => res.send('Sorry Payment Failed please pay again'));





router.post('/signUp',function(req,res){
	User.register(new User({username: req.body.username}),req.body.password,function(err,newuser){
		if (err)
		{
			console.log(err);
			return res.render("signUp");
		}
		console.log(newuser);
		passport.authenticate("local")(req,res,function(){
			req.session.username = req.body.username;
		    req.session.password = req.body.password;
			res.redirect('/store');
		});
	});
});

router.get("/logout", function(req, res){
	 req.session.destroy();    
     req.logout();    
     res.redirect("/");
});
router.get('/store',isLoggedIn,function(req,res){
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
router.get("/add-to-cart/:bookid",isLoggedIn,function(req,res){
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

router.get("/cart",isLoggedIn,function(req,res){
	if (!req.session.cart)
	{
		return res.redirect("/store");
	}
	var cart = new Cart(req.session.cart);
	return res.render("cart",{bookArray: cart.generateArray(),cost: cart.totalPrice});
});

router.get("/update/:bookid",isLoggedIn,function(req,res){
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


// Mongo Routes Only For admin.
router.get("/int_createBookForm",(req,res)=>{
	res.render("createBookForm");
});

router.get("/int_findBook/:bookid",(req,res)=>{
	book.findOne({id:req.params.bookid},function(err,doc){
		if (err)
			res.send(err);
		else
		res.send(doc);
	});
});

router.post("/int_createBookForm",(req,res)=>{
	var newBook = new book({
												id 			:  req.body.id,
												title  		:  req.body.title,
												course      :  req.body.course,
												author 		:  req.body.author,
												publisher   :  req.body.publisher,		
												branch		:  req.body.branch,
												semester	:  req.body.semester,
												price       :  req.body.price,
	});
					res.redirect('/int_createBookForm');
		
});

function isLoggedIn(req, res, next) {
if (req.isAuthenticated())
    return next();
else
    res.redirect('/');
}


module.exports = router;