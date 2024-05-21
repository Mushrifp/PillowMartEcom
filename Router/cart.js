const express = require('express');
const cart_router = express();
const cartController = require("../Controller/cartController");
const auth = require('../Middleware/userAuthentication');
const session = require('express-session');

cart_router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, 
  }));

cart_router.set("view engine","ejs");
cart_router.set("views", "./View/Users");

// Cart
cart_router.get("/cart", auth.isLogin, cartController.loadCart);
cart_router.post("/addCart", cartController.addCart);
cart_router.get("/cartDelete", cartController.cartDelete);

// Wishlist
cart_router.get("/wishlist", auth.isLogin, cartController.loadWish);
cart_router.post("/addToWishlist", cartController.addWish);
cart_router.get("/wishDelete", cartController.wishDelete);

module.exports = cart_router;
