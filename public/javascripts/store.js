// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
// global.document = new JSDOM(html).window.document;

module.exports =function(){
var nbooks=2;
this.purchasedBooks = [];
this.priceid = [];
for (var i=1;i<=nbooks;i=i+1){
document.querySelector("#btn"+i).addEventListener("click",function(){
var block=document.querySelector("#blk"+this.id.charAt(3));
	if (this.style.background!="green")
	{
		purchasedBooks.push(block);
		priceid.push(this.id.charAt(3));
	}
	this.style.background="green";
});
}
}

function extractProfile(profile) {
  let imageUrl = '';
  if (profile.photos && profile.photos.length) {
    imageUrl = profile.photos[0].value;
  }
  return {
    id: profile.id,
    displayName: profile.displayName,
    image: imageUrl,
  };
}
passport.use(new GoogleStrategy({
    clientID:  "337461078265-s1ij5hp4oc2ud5rb8r30ho0ismjj1qe6.apps.googleusercontent.com",
    clientSecret: "IA0QZwK__BmNDIrtnJ_Ng4rm",
    callbackURL: "/auth/google/callback",
    passReqToCallback   : true
},
  function(request, accessToken, refreshToken, profile, done) {
  	return done(null, extractProfile(profile));
    // User.findOne({ googleId: profile.id }, function (err, user) {
    // 	if (err)
    // 	return done(err);
    // 	else
    // 	{
    // 		if (user==null)
    // 		{
    // 			 	// newUser.google.id    = profile.id;
    //      //            newUser.google.token = token;
    //      //            newUser.google.name  = profile.displayName;
    //      //            newUser.google.email = profile.emails[0].value;
    //      var newUser = new User({googleId:profile.id});
    //                 return done(null, newUser);

    // 		}
    // 		else
    // 		{
    // 			return done(null,user);
    // 		}
    // 	}
    // });
  }
));
router.get('/auth/google',passport.authenticate('google', { scope: ['profile'] }));
router.get('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/store',
                    failureRedirect : '/'
            }));
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}
//router.get('/auth/google',passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));
