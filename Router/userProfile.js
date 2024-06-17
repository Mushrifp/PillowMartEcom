const express = require("express");
const user = express();
const userProfileController = require("../Controller/userProfileController")

user.set("view engine","ejs");
user.set("views", "./View/Users/UserEdit");

// user profile edit load pages 
user.get("/profile",userProfileController.profile)
user.get("/password",userProfileController.password)
user.get("/address",userProfileController.LoadAddress)
user.get("/order",userProfileController.order)
user.get("/wallet",userProfileController.loadWallet)

// user profile edit save changes
user.post("/profileEdit",userProfileController.profileEdit)

// user password changes from profile
user.post("/profilePasswordEdit",userProfileController.profilePasswordEdit)

// Add new user Address
user.get("/loadAddAddress",userProfileController.loadAddAddress)
user.post("/addAddress",userProfileController.addAddress)
user.get("/removeAddress",userProfileController.removeAddress)
user.get("/editAddress",userProfileController.editAddress)
user.post("/updateAddress",userProfileController.updateAddress)

// address adding through checkout page 
user.post("/addressAddCheckout",userProfileController.addressAddCheckout)

// view and cancel order 
user.post("/cancelOrder",userProfileController.cancelOrder)
user.get("/viewDetails",userProfileController.viewDetails)
user.post("/returnOrder",userProfileController.returnOrder)

// wallet money add
user.post("/walletAddMoney",userProfileController.walletAddMoney)
user.post("/getWalletHistory",userProfileController.getWalletHistory)

  
module.exports = user; 