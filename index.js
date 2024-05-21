require('dotenv').config()
const express = require('express');
const app = express();
const user_router = require("./Router/userRouter")
const admin_router = require('./Router/adminRouter')
const user = require('./Router/userProfile')
const cart_router = require('./Router/cart')
const path = require('path')
const mongoose = require('mongoose')
mongoose.connect(process.env.DB_CONNECTION)
const morgan = require('morgan')
const authRoutes = require("./Router/googleRoutes")
const nocache = require('nocache')


app.use(nocache())


// app.use(morgan('dev')) 
 

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

app.use(express.json());
app.use(express.urlencoded({extended:true}))
 
app.set("view engine","ejs");
app.set("views", "./View")

app.use(express.static('Public'))

app.use("/",user_router);
app.use("/admin", admin_router); 
app.use("/user", user);
app.use("/auth", authRoutes); 
app.use("/cart", cart_router); 
   
app.get("/admin/*",(req,res)=>{
     res.render("./Admin/error-404")
})

app.get("/*",(req,res)=>{
     res.render("./Users/error")
})

app.listen(process.env.PORT,()=>{
     console.log("http://localhost:7777  Server Running")
}) 