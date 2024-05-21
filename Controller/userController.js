const userData = require('../Model/userData')
const hash = require("bcrypt");
const OTP = require("../Model/otp")
const nodemailer = require("nodemailer");
const productData = require("../Model/product")
const cart = require('../Model/cart')
const categoryDB = require('../Model/category')




// Password hashing 
const passwordHash = async (password) => {
    try {
        const hashedPassword = hash.hash(password, 10);
        return hashedPassword
    } catch (error) {
        console.log(error)
    }
}

// Password strong 
const StrongPassword = async (password) => {
    try {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+}{:;'?/>.<,]).{5,}$/;
        if (regex.test(password)) {
            return true
        }
        return false
    } catch (error) {
        console.log(error)
    }
}

// Load Home Page 
const loadHome = async (req, res) => {
    try {
        console.log("reached controller")

      const userSession  = await userData.findOne({_id:req.session.user_id})
      
    if(userSession){ 
        res.render("index",{userData:userSession})
    }else{
        res.render("index")
    }


    } catch (error) {
        console.log(error)
    }
}

// Load About Page
const loadAbout = async (req, res) => {
    try {

        const userSession  = await userData.findOne({_id:req.session.user_id})

        if(userSession){ 
            res.render("about",{userData:userSession})
        }else{
            res.render('about')
        }
        
    } catch (error) {
        console.log(error)
    }
}

// Load Product Page
const loadProduct = async (req, res) => {
    try {
        const DataProduct = await productData.find({})

        const userSession  = await userData.findOne({_id:req.session.user_id})

        const categoryData = await categoryDB.find({})
        if(userSession){ 
            res.render("product_list", { Data: DataProduct,userData:userSession ,cate:categoryData})
        }else{
            res.render("product_list", { Data: DataProduct ,cate:categoryData})
        }
    } catch (error) {
        console.log(error)
    }
}

// Load login page 
const loadLogin = async (req, res) => {
    try {
        res.render("login")
    } catch (error) {
        console.log(error)
    }
}

const loadContact = async (req, res) => {
    try {

        const userSession  = await userData.findOne({_id:req.session.user_id})

        if(userSession){ 
            res.render("contact",{userData:userSession})
        }else{
            res.render('contact')
        }
    } catch (error) {
        console.log(error)
    }
}

// Load register
const loadRegister = async (req, res) => {
    try {
        res.render("register")
    } catch (error) {
        console.log(error)
    }
}

// product single page
const singleProduct = async (req, res) => {
    try {
        let singleData = await productData.findOne({ _id: req.query.id })

        const userSession  = await userData.findOne({_id:req.session.user_id})

        if(userSession){ 
            res.render("single-product",{singleData:singleData,userData:userSession })
        }else{
            res.render('single-product',{singleData:singleData})
        }
    } catch (error) {
        console.log(error)
    }
}

// Load wishlist
const loadWishlist = async (req, res) => {
    try {

        const userSession  = await userData.findOne({_id:req.session.user_id})

        if(userSession){ 
            res.render("wishlist",{userData:userSession})
        }else{
            res.render('wishlist')
        }
        
    } catch (error) {
        console.log(error)
    }
}

// Otp regenerate and  mail sending
const otpResend = async (req, res) => {
    try {

        const email = req.body.email;
        const name = req.body.name

        const existingOTP = await OTP.findOne({ email: email });

        if (existingOTP) {
            await OTP.deleteOne({ email: email });
            console.log("Existing OTP deleted for email:", email);
        }

        const otp = Math.floor(1000 + Math.random() * 9000);

        const otpStore = new OTP({
            otp: otp,
            email: email
        })

        await otpStore.save()

        await OTP.collection.createIndex({ "otp": 1 }, { expireAfterSeconds: 60 });

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Pillow Mart Otp Verification",
            html: "<h3> Hello " + name + "This is from PILLOW MART Here is your OTP : " + otp + " :  Thank you </h3>"
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Mail sent successfully :- ", info.response + " :Send to " + email + "------");
            }
        });


    } catch (error) {
        console.log(error)
    }
}

// otp verification
const otpVerification = async (req, res) => {
    try {

        let otp = req.body.one + req.body.two + req.body.three + req.body.four;
        let userEmail = req.body.email

        let sendedOtp = await OTP.findOne({ email: userEmail })

        if (!sendedOtp) {
            res.send({ invalid: "Invalid OTP" });
        }

        if (otp && otp == sendedOtp.otp) {
            await userData.updateOne({ "email": sendedOtp.email }, { $set: { "isVerified": true } })
            await OTP.deleteOne({ email: userEmail });
            res.send({ success: 'verified' })
        } else {
            res.send({ invalid: "Invalid OTP" });
        }

    } catch (error) {
        console.log(error)
    }
}

// User register and otp sending
const insertUser = async (req, res) => {
    try {
        const hPassword = await passwordHash(req.body.password);

        let existing = await userData.findOne({ email: req.body.email })

        if (existing && existing.name == req.body.name) {
            await userData.deleteOne({ name: req.body.name })
            if (existing && existing.isVerified == false) {
                await userData.deleteOne({ email: req.body.email })
            }
        };
        let existingEmail = await userData.findOne({ email: req.body.email })
        let existingName = await userData.findOne({ name: req.body.name })


        if (!existingName) {
            if (!existingEmail) {
                let existingNumber = await userData.findOne({ name: req.body.number })

                if (!existingNumber) {
                    let passwordCheck = await StrongPassword(req.body.password)

                    if (passwordCheck) {


                        if (req.body.retypePassword == req.body.password) {

                            const user = new userData({
                                name: req.body.name,
                                email: req.body.email,
                                password: hPassword,
                                mobile: req.body.number
                            })

                            await user.save();
                            console.log("data inserted : " + user)



                            const otp = Math.floor(1000 + Math.random() * 9000);

                            const otpStore = new OTP({
                                otp: otp,
                                email: req.body.email
                            })

                            await otpStore.save()

                            await otpStore.collection.createIndex({ "otp": 1 }, { expireAfterSeconds: 60 });

                            const transporter = nodemailer.createTransport({
                                host: process.env.EMAIL_HOST,
                                port: process.env.EMAIL_PORT,
                                secure: false,
                                requireTLS: true,
                                auth: {
                                    user: process.env.EMAIL_USER,
                                    pass: process.env.EMAIL_PASSWORD
                                },

                            });

                            console.log(req.body.email)

                            const mailOptions = {
                                from: process.env.EMAIL_FROM,
                                to: req.body.email,
                                subject: "Pillow Mart Otp Verification",
                                html: "<h3> Hello  " + req.body.name + "  This is from PILLOW MART Here is your OTP : " + otp + " :  Thank you </h3>"
                            };

                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log("Mail sent successfully :- ", info.response + " :Send to " + req.body.email);
                                }
                            });

                            res.render("otp", { message: "Check Your Mail , Enter Your OTP ", email: req.body.email, name: req.body.name })

                        } else {
                            res.render("register", { message: "Retyped Password not matching", currentName: req.body.name, currentEmail: req.body.email, currentPass: req.body.password, currentPhone: req.body.number })
                        }

                    } else {
                        res.render("register", { message: "minimum of 8 characters,one uppercase ,lowercase letter one number, and one special character.", currentName: req.body.name, currentEmail: req.body.email, currentPass: req.body.password, currentPhone: req.body.number })
                    }
                } else {
                    res.render("register", { message: "This Number is already taken choose another one", currentName: req.body.name, currentEmail: req.body.email, currentPass: req.body.password, currentPhone: req.body.number })
                }

            } else {
                res.render("register", { message: "This email is already taken choose another one", currentName: req.body.name, currentEmail: req.body.email, currentPass: req.body.password, currentPhone: req.body.number })
            }

        } else {
            res.render("register", { message: "This username is already taken choose another one", currentName: req.body.name, currentEmail: req.body.email, currentPass: req.body.password, currentPhone: req.body.number })
        }



    } catch (error) {
        console.log(error)
    }
}

// Login Verification
const loginVerify = async (req, res) => {
    try {
        let userDatas = await userData.findOne({$or:[{"name":req.body.name},{"email":req.body.name}]})

        console.log("Log in user Data :",userDatas)
 
        if (userDatas){
            if (userDatas.isAdminBlocked == false) {
                if (userDatas.isVerified == false) {
                    res.render("login", {message: "Not verified OTP can't login", currentName: req.body.name, currentPass: req.body.password })
                } else {
                    let passwordMatch = await hash.compare(req.body.password, userDatas.password)
                    if (passwordMatch){
                        
                       let sessionStoring  = req.session.user_id = userDatas._id
                       if(sessionStoring){

                        console.log("session stored")
                        res.render("index", { message: "Login Success",userData:sessionStoring })
                        
                       }else{
                         console.log("session not stored")
                         
                       }
                    } else {
                        res.render("login", { message: "User Name and Password is incorrect", currentName: req.body.name, currentPass: req.body.password })
                    }
               }
            } else { 
                res.render("login", { message: "Admin Blocked Can't login", currentName: req.body.name, currentPass: req.body.password })
            }
        } else {
            res.render("login", { message: "User Not found", currentName: req.body.name, currentPass: req.body.password })
        }
    } catch (error) {
        console.log(error)
    }
}

// Password forget sending mail
const forgetEmail = async (req, res) => {
    try {

        const email = req.body.email;
        const existingOTP = await OTP.findOne({ email: email });
        const userName = await userData.findOne({ email: email });
        if (!userName) {
             res.send({ noFound: "Profile Not Found" })
        } else {
            let name = userName.name
            if (existingOTP) {
                await OTP.deleteOne({ email: email });
                console.log("Existing OTP deleted for email:", email);
            }

            const otp = Math.floor(1000 + Math.random() * 9000);

            const otpStore = new OTP({
                otp: otp,
                email: email
            })

            await otpStore.save()

            await OTP.collection.createIndex({ "otp": 1 }, { expireAfterSeconds: 60 });

            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: false,
                requireTLS: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: "Pillow Mart Otp Verification",
                html: "<h3> Hello " + name + "This is from PILLOW MART Here is your OTP : " + otp + " :  Thank you </h3>"
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Mail sent successfully :- ", info.response + " :Send to " + email + "------");
                }
            });

            res.send({email:email,name:name});

        }
        

    } catch (error) {
        console.log(error)
    }
}

//Forget password OTP verification
const otpVerificationForget = async (req, res) => {
    try {
        let otp = req.body.one + req.body.two + req.body.three + req.body.four;
        let userEmail = req.body.email

        let sendedOtp = await OTP.findOne({ email: userEmail })

        if (!sendedOtp) {
            res.send({error: "Invalid OTP"});
        }
 
        if (otp && otp == sendedOtp.otp){
            await OTP.deleteOne({ email:userEmail });
            res.send({done:"verified"})
        } else {
            res.send({error:"Invalid OTP"});
        }
    } catch (error){
        console.log(error)
    }
}

// Password Changing
const passChanging = async (req,res)=>{
    try {
          let pass = req.body.new_password
          let passConfirm = req.body.confirm_password
          let email = req.body.email

          let passwordCheck = await StrongPassword(pass);

         if(passwordCheck){
                 if(pass == passConfirm){
                  const hPassword = await passwordHash(pass);

                  let passwordReset = await userData.updateOne({"email":email},{$set:{"password":hPassword}})

                      if(passwordReset){
                          res.render("login",{message:"Password Changed"})
                      }else{
                          res.render("forgetPass",{message:"failed",mail:email,ConfirmPass:passConfirm,pass:pass})
                      }

                 }else{
                   res.render("forgetPass",{message:"Confirm password is not matching",mail:email,ConfirmPass:passConfirm,pass:pass})
                 }
         }else{
                res.render("forgetPass",{message:"Password is Not strong",mail:email,ConfirmPass:passConfirm,pass:pass})
         }

    } catch (error) {
        console.log(error)
    }
}


// logout
const userLogout = async (req,res)=>{
    try {
         req.session.destroy();
         res.render("index",{logoutMessage:"logout Done"})
    } catch (error){
       console.log(error.message)
    }
}

// Category loading
const categoryLoad = async (req,res)=>{
    try{
           const userSession  = await userData.findOne({_id:req.session.user_id})
           const data = await categoryDB.findOne({_id:req.query.id})
           const allData = await productData.find({category:data.name})
           const categoryData = await categoryDB.find({})

           
           console.log("Data related to the  same category",allData)
           
           if(userSession){ 
            res.render("product_list", { Data: allData,userData:userSession ,cate:categoryData})
        }else{
            res.render("product_list", { Data: allData ,cate:categoryData})
        }

    }catch(error){
        console.log(error)
    }
}

// low to high 
const LowToHigh = async (req,res)=>{
     try{
        const Sort = await productData.find({}).sort({ price:1})
        const userSession  = await userData.findOne({_id:req.session.user_id})
        const categoryData = await categoryDB.find({})


        res.render("product_list", { Data: Sort,userData:userSession ,cate:categoryData})
                 



     }catch(error){
        console.log(error)
     }
}

// high to low 
const HighToLow = async (req,res)=>{
    try{
       const Sort = await productData.find({}).sort({price:-1})
       const userSession  = await userData.findOne({_id:req.session.user_id})
       const categoryData = await categoryDB.find({})


       res.render("product_list", { Data: Sort,userData:userSession ,cate:categoryData})
                



    }catch(error){
       console.log(error)
    }
}

// Product Search
const search = async (req,res)=>{
   try{
              const userSession = await userData.findOne({ _id:req.session.user_id});
              const categoryData = await categoryDB.find({});
            
              let searchQuery = {};
              if (req.query.search) {
                  const search = req.query.search;
                  searchQuery = {
                      $or: [
                          { productTitle: { $regex: '.*' + search + '.*', $options: 'i' }},
                          { category: { $regex: '.*' + search + '.*', $options: 'i' }},
                          { size: { $regex: '.*' + search + '.*', $options: 'i' }}
                      ]
                  };
            
                  const searchNumber = parseFloat(search);
                  if (!isNaN(searchNumber)) {
                      searchQuery.$or.push({ price: searchNumber });
                  }
              }
            
              const data = await productData.find(searchQuery);
            
              res.render("product_list", { userData: userSession, cate: categoryData, Data: data });
   }catch(error){
    console.log(error)
   }
}

// Load Checkout page
const loadCheckout = async (req,res)=>{
    try {
        console.log("Enterd to the checkout")
        const userSession = await userData.findOne({ _id:req.session.user_id});
        const productsData = req.body.products;

        const productsArray = Object.keys(productsData).map(productId =>([
          productId,
           parseInt(productsData[productId].quantity)
        ]));

        await cart.updateOne({user:req.session.user_id},{$set:{product:[]}});

        await cart.updateOne({user:req.session.user_id},{$push:{product:{$each:productsArray}}});

        const UserCart = await cart.findOne({user:req.session.user_id});
  
        console.log("Updated Cart:",UserCart);
        
const arrayOfID = UserCart.product
const CheckOutData = [];

     for(let i=0;i<UserCart.product.length;i++){
         let product = [];
         let PData = await productData.findOne({_id:arrayOfID[i][i-i]})
         product.push(PData,arrayOfID[i][1])
         CheckOutData.push(product)
     }

     console.log(CheckOutData)
        res.render("checkout",{userData: userSession,Products:CheckOutData});
    } catch (error) {
        console.log(error)
    }
}

// Load proceed to pay 
const loadProceed = async (req,res)=>{
    try {
         res.render("confirmation")
    } catch (error) {
        console.log(error)
    }
}
module.exports = {
    loadHome,
    loadAbout, 
    loadProduct,
    loadLogin,
    loadContact,
    loadRegister,
    singleProduct,
    loadWishlist,
    insertUser,
    otpVerification,
    loginVerify,
    otpResend,
    forgetEmail,
    otpVerificationForget,
    passChanging,
    userLogout,
    categoryLoad,
    HighToLow,
    LowToHigh,
    search,
    loadCheckout,
    loadProceed
}