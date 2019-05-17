var express 				= require('express');
var router 					= express.Router();
var mongoose 				= require('mongoose');
var bodyParser 				= require("body-parser");
 var passport = require('passport');


mongoose.connect('mongodb://localhost/Bookdb', {useNewUrlParser: true});
var User					= require("../models/User");
var book 					= require("../models/book");
var expressValidator        = require('express-validator');
router.use(bodyParser.urlencoded({extended: true}));
var bookArray =[];
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

router.post('/signUp',function(req,res){
	User.register(new User({username: req.body.username}),req.body.password,function(err,newuser){
		if (err)
		{
			console.log(err);
			return res.render("signUp");
		}
		console.log(newuser);
		passport.authenticate("local")(req,res,function(){
			res.redirect('/store');
		});
	});
});

router.get("/logout", function(req, res){    
     req.logout();    
     res.redirect("/");
});

//res.render("secret",{user1:user});
// Store and Cart Section...

router.get('/store',isLoggedIn,function(req,res){
	//Collecting ece books..
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
	isInArray=false;
	book.findOne({id:req.params.bookid},function(err,doc){
		cost = cost + doc.price;
		bookArray.forEach(function(item){
			if (item.id==doc.id)
				{
					item.qtyPurchased = item.qtyPurchased+1;
					isInArray=true;
				}
			});
		if (!isInArray)
		bookArray.push(doc);
	});
	res.redirect("/store");
});

router.get("/cart",isLoggedIn,function(req,res){
	res.render("cart",{cost:cost,bookArray:bookArray});
});

router.get("/update/:bookid",isLoggedIn,function(req,res){
	book.findOne({id:req.params.bookid},function(err,doc){
					if (err)
						console.log(err);
					else
						{			
						bookArray.forEach(function(item,index,object){
								if (item.id==req.params.bookid)
								{
										cost=cost-doc.price;
									if (item.qtyPurchased>1)
									{
										item.qtyPurchased -=1;
									}
									else
									{
										object.splice(index,1);
									}
								}
							});
						}
				});
	
	res.redirect("/cart");
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
												qtyPurchased:  1,
												count		:  1
	});
	book.findOneAndUpdate({id:req.body.id},{ $inc: { count: 1 } }, {new: true },function(err,doc){
		if (doc==null)
		{
			newBook.save(function(err){
				if (err) return console.log(err);
			});
		}
		console.log(doc);
		res.redirect("/int_createBookForm");
	});
});
function isLoggedIn(req, res, next) {
if (req.isAuthenticated())
    return next();
else
    res.redirect('/');
}

module.exports = router;