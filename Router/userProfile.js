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
user.get("/wallet",userProfileController.wallet)

// user profile edit save changes
user.post("/profileEdit",userProfileController.profileEdit)

// user password changes from profile
user.post("/profilePasswordEdit",userProfileController.profilePasswordEdit)

// Add new user Address
user.get("/loadAddAddress",userProfileController.loadAddAddress)
user.post("/addAddress",userProfileController.addAddress)
user.get("/removeAddress",userProfileController.removeAddress)
user.get("/editAddress",userProfileController.editAddress)



  
module.exports = user; 