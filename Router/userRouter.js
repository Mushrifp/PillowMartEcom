require('dotenv').config()
const express = require('express');
const user_router = express();
const userController = require("../Controller/userController");
const auth = require('../Middleware/userAuthentication');
const session = require('express-session');



user_router.set("view engine","ejs");
user_router.set("views", "./View/Users");


user_router.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false, 
}));

// Load pages
user_router.get("/", userController.loadHome);
user_router.get("/home", userController.loadHome);
user_router.get("/about", userController.loadAbout);
user_router.get("/product", userController.loadProduct);
user_router.get("/login", auth.isLogout, userController.loadLogin); 
user_router.get("/register", auth.isLogout, userController.loadRegister); 
user_router.get("/contact", userController.loadContact)
user_router.get("/wishlist",  auth.isLogin, userController.loadWishlist);
user_router.get("/single-product", userController.singleProduct);
user_router.get("/logout",auth.isLogin, userController.userLogout)
 
// User register  
user_router.post("/registerPost", userController.insertUser); 

// OTP verification and OTP resend 
user_router.post("/otpVerification", userController.otpVerification);
user_router.post("/otpResend", userController.otpResend);

// Login verify
user_router.post("/loginVerify", userController.loginVerify);

// Forget password otp mail sending and resetting
user_router.post("/forgetEmail",userController.forgetEmail)
user_router.get("/otpResend",userController.otpResend)  
user_router.post("/otpVerificationForget",userController.otpVerificationForget)  
user_router.get('/otpForgetPass', (req,res) =>{
    const {email,name}=req.query;
    res.render('otpForgetPass',{email,name});
  });
user_router.get("/forgetPass",(req,res)=>{
  const {email}=req.query;
  res.render('forgetPass',{mail:email});
})
user_router.post("/passChanging",userController.passChanging)

// category load
user_router.get("/categoryLoad",userController.categoryLoad)

// high to low and low to high 
user_router.get("/LowToHigh",userController.LowToHigh)
user_router.get("/HighToLow",userController.HighToLow)
user_router.get("/search",userController.search)

// checkout and order
user_router.post("/checkout",userController.loadCheckout)
user_router.get("/proceed",userController.loadProceed)



module.exports = user_router;
