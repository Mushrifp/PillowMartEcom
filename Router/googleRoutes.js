const express = require('express');
const passport = require('../Public/passport');
const router = express();
const session = require('express-session')


router.use(session({
  secret: "sitesessionscerest",
  resave: false,
  saveUninitialized: false,
}));

router.use(passport.initialize()); 
router.use(passport.session()) 


router.set("view engine","ejs");
router.set("views", "./View/Users");

router.get('/google',passport.authenticate('google',{scope:['profile','email']}));

router.get(
    '/google/callback', 
    passport.authenticate('google',{failureRedirect:'/'}),
    (req,res) => {
      req.session.user_id = req.session.passport.user._id;
      console.log("Google Login Done")
      res.redirect('/');
    }
);
          
                      
module.exports = router;
