require("dotenv").config();
const userData = require("../Model/userData");
const hash = require("bcrypt");
const OTP = require("../Model/otp");
const nodemailer = require("nodemailer");
const productData = require("../Model/product");
const cart = require("../Model/cart");
const categoryDB = require("../Model/category");
const address = require("../Model/address");
const order = require("../Model/order");
const Razorpay = require("razorpay");
const wallet = require("../Model/wallet");
const Coupon = require("../Model/coupons");
const wishlist = require("../Model/wish");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Password hashing
const passwordHash = async (password) => {
  try {
    const hashedPassword = hash.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
};

// Password strong
const StrongPassword = async (password) => {
  try {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+}{:;'?/>.<,]).{5,}$/;
    if (regex.test(password)) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
  }
};

// Load Home Page
const loadHome = async (req, res) => {
  try {
    console.log("Home !! ");

    const userSession = await userData.findOne({ _id: req.session.user_id });

    let relate = await order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.item._id",
          totalQuantitySold: { $sum: "$items.quantity" },
          orderCount: { $sum: 1 },
          image: { $first: { $arrayElemAt: ["$items.item.image", 0] } },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
    ]);

    let relateCategory = [];

    for (let i = 0; i < relate.length; i++) {
      const data = await productData.findOne({ _id: relate[i]._id });
      relateCategory.push(data);
    }

    let relatePrice = await productData.find({ price: { $lt: 500 } });

    if (userSession) {
      let cartCnt = await cart.findOne({ user: req.session.user_id });
      let wishCnt = await wishlist.findOne({ user: req.session.user_id });

      let data;
      if (cartCnt && wishCnt) {
        data = {
          wish: wishCnt.product.length,
          cart: cartCnt.product.length,
        };
      } else {
        data = {
          wish: 0,
          cart: 0,
        };
      }

      res.render("index", {
        userData: userSession,
        relatePrice,
        relateCategory,
        data,
      });
    } else {
      res.render("index", { relatePrice, relateCategory });
    }
  } catch (error) {
    console.log(error);
  }
};

// Load About Page
const loadAbout = async (req, res) => {
  try {
    const userSession = await userData.findOne({ _id: req.session.user_id });

    if (userSession) {
      let cartCnt = await cart.findOne({ user: req.session.user_id });
      let wishCnt = await wishlist.findOne({ user: req.session.user_id });

      let data;
      if (cartCnt && wishCnt) {
        data = {
          wish: wishCnt.product.length,
          cart: cartCnt.product.length,
        };
      } else {
        data = {
          wish: 0,
          cart: 0,
        };
      }
      res.render("about", { userData: userSession, data });
    } else {
      res.render("about");
    }
  } catch (error) {
    console.log(error);
  }
};

// Load Product Page
const loadProduct = async (req, res) => {
  try {
    const DataProduct = await productData.find({}).limit(5);

    const userSession = await userData.findOne({ _id: req.session.user_id });

    const categoryData = await categoryDB.find({});

    const totalProduct = await productData.countDocuments({});

    let answer = Math.ceil(totalProduct / 5) - 1;

    let number = 0;

    if (userSession) {
      let cartCnt = await cart.findOne({ user: req.session.user_id });
      let wishCnt = await wishlist.findOne({ user: req.session.user_id });

      let data;
      if (cartCnt && wishCnt) {
        data = {
          wish: wishCnt.product.length,
          cart: cartCnt.product.length,
        };
      } else {
        data = {
          wish: 0,
          cart: 0,
        };
      }
      res.render("product_list", {
        Data: DataProduct,
        userData: userSession,
        cate: categoryData,
        answer,
        number,
        selectedCategory: req.query.category || "all",
        selectedPrice: req.query.price || "all",
        selectedFilter: req.query.filter || "all",
        data,
      });
    } else {
      res.render("product_list", {
        Data: DataProduct,
        cate: categoryData,
        answer,
        number,
        selectedCategory: req.query.category || "all",
        selectedPrice: req.query.price || "all",
        selectedFilter: req.query.filter || "all",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// Load login page
const loadLogin = async (req, res) => {
  try {
    res.render("login");
  } catch (error) {
    console.log(error);
  }
};

const loadContact = async (req, res) => {
  try {
    const userSession = await userData.findOne({ _id: req.session.user_id });

    if (userSession) {
      let cartCnt = await cart.findOne({ user: req.session.user_id });
      let wishCnt = await wishlist.findOne({ user: req.session.user_id });

      let data;
      if (cartCnt && wishCnt) {
        data = {
          wish: wishCnt.product.length,
          cart: cartCnt.product.length,
        };
      } else {
        data = {
          wish: 0,
          cart: 0,
        };
      }
      res.render("contact", { userData: userSession, data });
    } else {
      res.render("contact");
    }
  } catch (error) {
    console.log(error);
  }
};

// Load register
const loadRegister = async (req, res) => {
  try {
    res.render("register");
  } catch (error) {
    console.log(error);
  }
};

// product single page
const singleProduct = async (req, res) => {
  try {
    let singleData = await productData.findOne({ _id: req.query.id });

    const userSession = await userData.findOne({ _id: req.session.user_id });

    let relateCategory = await productData.find({
      category: singleData.category,
    });
    let relatePrice = await productData.find({
      price: { $lte: singleData.price + 500 },
    });

    if (userSession) {
      let cartCnt = await cart.findOne({ user: req.session.user_id });
      let wishCnt = await wishlist.findOne({ user: req.session.user_id });

      let data;
      if (cartCnt && wishCnt) {
        data = {
          wish: wishCnt.product.length,
          cart: cartCnt.product.length,
        };
      } else {
        data = {
          wish: 0,
          cart: 0,
        };
      }
      res.render("single-product", {
        singleData: singleData,
        userData: userSession,
        relateCategory,
        relatePrice,
        data,
      });
    } else {
      res.render("single-product", {
        singleData: singleData,
        relateCategory,
        relatePrice,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// Load wishlist
const loadWishlist = async (req, res) => {
  try {
    const userSession = await userData.findOne({ _id: req.session.user_id });

    if (userSession) {
      let cartCnt = await cart.findOne({ user: req.session.user_id });
      let wishCnt = await wishlist.findOne({ user: req.session.user_id });

      let data;
      if (cartCnt && wishCnt) {
        data = {
          wish: wishCnt.product.length,
          cart: cartCnt.product.length,
        };
      } else {
        data = {
          wish: 0,
          cart: 0,
        };
      }
      res.render("wishlist", { userData: userSession, data });
    } else {
      res.render("wishlist");
    }
  } catch (error) {
    console.log(error);
  }
};

// Otp regenerate and  mail sending
const otpResend = async (req, res) => {
  try {
    const email = req.body.email;
    const name = req.body.name;

    const existingOTP = await OTP.findOne({ email: email });

    if (existingOTP) {
      await OTP.deleteOne({ email: email });
      console.log("Existing OTP deleted for email:", email);
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    const otpStore = new OTP({
      otp: otp,
      email: email,
    });

    await otpStore.save();

    await OTP.collection.createIndex({ otp: 1 }, { expireAfterSeconds: 60 });

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Pillow Mart Otp Verification",
      html:
        "<h3> Hello " +
        name +
        "This is from PILLOW MART Here is your OTP : " +
        otp +
        " :  Thank you </h3>",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log(
          "Mail sent successfully :- ",
          info.response + " :Send to " + email + "------"
        );
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// otp verification
const otpVerification = async (req, res) => {
  try {
    let otp = req.body.one + req.body.two + req.body.three + req.body.four;
    let userEmail = req.body.email;

    let sendedOtp = await OTP.findOne({ email: userEmail });

    if (!sendedOtp) {
      res.send({ invalid: "Invalid OTP" });
    }

    if (otp && otp == sendedOtp.otp) {
      await userData.updateOne(
        { email: sendedOtp.email },
        { $set: { isVerified: true } }
      );
      await OTP.deleteOne({ email: userEmail });
      res.send({ success: "verified" });
    } else {
      res.send({ invalid: "Invalid OTP" });
    }
  } catch (error) {
    console.log(error);
  }
};

// User register and otp sending
const insertUser = async (req, res) => {
  try {
    const hPassword = await passwordHash(req.body.password);

    let existing = await userData.findOne({ email: req.body.email });

    if (existing && existing.name == req.body.name) {
      await userData.deleteOne({ name: req.body.name });
      if (existing && existing.isVerified == false) {
        await userData.deleteOne({ email: req.body.email });
      }
    }
    let existingEmail = await userData.findOne({ email: req.body.email });
    let existingName = await userData.findOne({ name: req.body.name });

    if (!existingName) {
      if (!existingEmail) {
        let existingNumber = await userData.findOne({
          mobile: req.body.number,
        });

        if (req.body.number.length == 10) {
          if (!existingNumber) {
            let passwordCheck = await StrongPassword(req.body.password);

            if (passwordCheck) {
              if (req.body.retypePassword == req.body.password) {
                let userName = req.body.name.trimEnd();
                const user = new userData({
                  name: userName,
                  email: req.body.email,
                  password: hPassword,
                  mobile: req.body.number,
                });

                await user.save();
                console.log("data inserted : " + user);

                const otp = Math.floor(1000 + Math.random() * 9000);

                const otpStore = new OTP({
                  otp: otp,
                  email: req.body.email,
                });

                await otpStore.save();

                await otpStore.collection.createIndex(
                  { otp: 1 },
                  { expireAfterSeconds: 60 }
                );

                const transporter = nodemailer.createTransport({
                  host: process.env.EMAIL_HOST,
                  port: process.env.EMAIL_PORT,
                  secure: false,
                  requireTLS: true,
                  auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD,
                  },
                });

                console.log(req.body.email);

                const mailOptions = {
                  from: process.env.EMAIL_FROM,
                  to: req.body.email,
                  subject: "Pillow Mart Otp Verification",
                  html:
                    "<h3> Hello  " +
                    req.body.name +
                    "  This is from PILLOW MART Here is your OTP : " +
                    otp +
                    " :  Thank you </h3>",
                };

                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    console.log(error);
                  } else {
                    console.log(
                      "Mail sent successfully :- ",
                      info.response + " :Send to " + req.body.email
                    );
                  }
                });

                res.render("otp", {
                  message: "Check Your Mail , Enter Your OTP ",
                  email: req.body.email,
                  name: req.body.name,
                });
              } else {
                res.render("register", {
                  message: "Retyped Password not matching",
                  currentName: req.body.name,
                  currentEmail: req.body.email,
                  currentPass: req.body.password,
                  currentPhone: req.body.number,
                });
              }
            } else {
              res.render("register", {
                message:
                  "minimum of 8 characters,one uppercase ,lowercase letter one number, and one special character.",
                currentName: req.body.name,
                currentEmail: req.body.email,
                currentPass: req.body.password,
                currentPhone: req.body.number,
              });
            }
          } else {
            res.render("register", {
              message: "This Number is already taken choose another one",
              currentName: req.body.name,
              currentEmail: req.body.email,
              currentPass: req.body.password,
              currentPhone: req.body.number,
            });
          }
        } else {
          res.render("register", {
            message: "Enter a Valid Number",
            currentName: req.body.name,
            currentEmail: req.body.email,
            currentPass: req.body.password,
            currentPhone: req.body.number,
          });
        }
      } else {
        res.render("register", {
          message: "This email is already taken choose another one",
          currentName: req.body.name,
          currentEmail: req.body.email,
          currentPass: req.body.password,
          currentPhone: req.body.number,
        });
      }
    } else {
      res.render("register", {
        message: "This username is already taken choose another one",
        currentName: req.body.name,
        currentEmail: req.body.email,
        currentPass: req.body.password,
        currentPhone: req.body.number,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// Login Verification
const loginVerify = async (req, res) => {
  try {
    let userDatas = await userData.findOne({
      $or: [{ name: req.body.name }, { email: req.body.name }],
    });

    if (userDatas) {
      if (userDatas.isAdminBlocked == false) {
        if (userDatas.isVerified == false) {
          res.render("login", {
            message: "Not verified OTP can't login",
            currentName: req.body.name,
            currentPass: req.body.password,
          });
        } else {
          let passwordMatch = await hash.compare(
            req.body.password,
            userDatas.password
          );
          if (passwordMatch) {
            let sessionStoring = (req.session.user_id = userDatas._id);
            console.log("Session Stored :", sessionStoring);
            if (sessionStoring) {
              const exist = await wallet.findOne({ user: req.session.user_id });

              if (!exist) {
                const newWallet = new wallet({
                  user: req.session.user_id,
                  amount: 0,
                });
                await newWallet.save();
              }

              let relate = await order.aggregate([
                { $unwind: "$items" },
                {
                  $group: {
                    _id: "$items.item._id",
                    totalQuantitySold: { $sum: "$items.quantity" },
                    orderCount: { $sum: 1 },
                    image: {
                      $first: { $arrayElemAt: ["$items.item.image", 0] },
                    },
                  },
                },
                { $sort: { totalQuantitySold: -1 } },
              ]);

              let relateCategory = [];

              for (let i = 0; i < relate.length; i++) {
                const data = await productData.findOne({ _id: relate[i]._id });
                relateCategory.push(data);
              }

              let relatePrice = await productData.find({ price: { $lt: 500 } });
              let cartCnt = await cart.findOne({ user: req.session.user_id });
              let wishCnt = await wishlist.findOne({
                user: req.session.user_id,
              });
              let data;
              if (cartCnt && wishCnt) {
                data = {
                  wish: wishCnt.product.length,
                  cart: cartCnt.product.length,
                };
              } else {
                data = {
                  wish: 0,
                  cart: 0,
                };
              }

              res.render("index", {
                message: "Login Success",
                userData: sessionStoring,
                relateCategory,
                relatePrice,
                data,
              });
            } else {
              console.log("session not stored");
            }
          } else {
            res.render("login", {
              message: "User Name and Password is incorrect",
              currentName: req.body.name,
              currentPass: req.body.password,
            });
          }
        }
      } else {
        res.render("login", {
          message: "Admin Blocked Can't login",
          currentName: req.body.name,
          currentPass: req.body.password,
        });
      }
    } else {
      res.render("login", {
        message: "User Not found",
        currentName: req.body.name,
        currentPass: req.body.password,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// Password forget sending mail
const forgetEmail = async (req, res) => {
  try {
    const email = req.body.email;
    const existingOTP = await OTP.findOne({ email: email });
    const userName = await userData.findOne({ email: email });
    if (!userName) {
      res.send({ noFound: "Profile Not Found" });
    } else {
      let name = userName.name;
      if (existingOTP) {
        await OTP.deleteOne({ email: email });
        console.log("Existing OTP deleted for email:", email);
      }

      const otp = Math.floor(1000 + Math.random() * 9000);

      const otpStore = new OTP({
        otp: otp,
        email: email,
      });

      await otpStore.save();

      await OTP.collection.createIndex({ otp: 1 }, { expireAfterSeconds: 60 });

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Pillow Mart Otp Verification",
        html:
          "<h3> Hello " +
          name +
          "This is from PILLOW MART Here is your OTP : " +
          otp +
          " :  Thank you </h3>",
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log(
            "Mail sent successfully :- ",
            info.response + " :Send to " + email + "------"
          );
        }
      });

      res.send({ email: email, name: name });
    }
  } catch (error) {
    console.log(error);
  }
};

//Forget password OTP verification
const otpVerificationForget = async (req, res) => {
  try {
    let otp = req.body.one + req.body.two + req.body.three + req.body.four;
    let userEmail = req.body.email;

    let sendedOtp = await OTP.findOne({ email: userEmail });

    if (!sendedOtp) {
      res.send({ error: "Invalid OTP" });
    }

    if (otp && otp == sendedOtp.otp) {
      await OTP.deleteOne({ email: userEmail });
      res.send({ done: "verified" });
    } else {
      res.send({ error: "Invalid OTP" });
    }
  } catch (error) {
    console.log(error);
  }
};

// Password Changing
const passChanging = async (req, res) => {
  try {
    let pass = req.body.new_password;
    let passConfirm = req.body.confirm_password;
    let email = req.body.email;

    let passwordCheck = await StrongPassword(pass);

    if (passwordCheck) {
      if (pass == passConfirm) {
        const hPassword = await passwordHash(pass);

        let passwordReset = await userData.updateOne(
          { email: email },
          { $set: { password: hPassword } }
        );

        if (passwordReset) {
          res.render("login", { message: "Password Changed" });
        } else {
          res.render("forgetPass", {
            message: "failed",
            mail: email,
            ConfirmPass: passConfirm,
            pass: pass,
          });
        }
      } else {
        res.render("forgetPass", {
          message: "Confirm password is not matching",
          mail: email,
          ConfirmPass: passConfirm,
          pass: pass,
        });
      }
    } else {
      res.render("forgetPass", {
        message: "Password is Not strong",
        mail: email,
        ConfirmPass: passConfirm,
        pass: pass,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// logout
const userLogout = async (req, res) => {
  try {
    req.session.destroy();

    let relate = await order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.item._id",
          totalQuantitySold: { $sum: "$items.quantity" },
          orderCount: { $sum: 1 },
          image: { $first: { $arrayElemAt: ["$items.item.image", 0] } },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
    ]);

    let relateCategory = [];

    for (let i = 0; i < relate.length; i++) {
      const data = await productData.findOne({ _id: relate[i]._id });
      relateCategory.push(data);
    }

    let relatePrice = await productData.find({ price: { $lt: 500 } });

    res.render("index", {
      logoutMessage: "logout Done",
      relateCategory,
      relatePrice,
    });
  } catch (error) {
    console.log(error.message);
  }
};

// Category loading
const categoryLoad = async (req, res) => {
  try {
    const userSession = await userData.findOne({ _id: req.session.user_id });
    const data = await categoryDB.findOne({ _id: req.query.id });
    const allData = await productData.find({ category: data.name });
    const categoryData = await categoryDB.find({});

    if (userSession) {
      let cartCnt = await cart.findOne({ user: req.session.user_id });
      let wishCnt = await wishlist.findOne({ user: req.session.user_id });

      let data;
      if (cartCnt && wishCnt) {
        data = {
          wish: wishCnt.product.length,
          cart: cartCnt.product.length,
        };
      } else {
        data = {
          wish: 0,
          cart: 0,
        };
      }
      res.render("product_list", {
        Data: allData,
        userData: userSession,
        cate: categoryData,
        data,
      });
    } else {
      res.render("product_list", { Data: allData, cate: categoryData });
    }
  } catch (error) {
    console.log(error);
  }
};

// Load Checkout page
const loadCheckout = async (req, res) => {
  try {
    const userSession = await userData.findOne({ _id: req.session.user_id });
    const addresss = await address.findOne({ UserID: req.session.user_id });
    const walletMoney = await wallet.findOne({ user: req.session.user_id });

    const UserCart = await cart.findOne({ user: req.session.user_id });

    const arrayOfID = UserCart.product;
    const CheckOutData = [];
    let subtotal = 0;

    for (let i = 0; i < arrayOfID.length; i++) {
      let PData = await productData.findOne({ _id: arrayOfID[i].id });
      let cartTotal = UserCart.product.find(
        (item) => item.id === arrayOfID[i].id
      );
      let data = {
        productInfo: PData,
        productTotal: cartTotal.total,
        quantity: cartTotal.quantity,
      };
      subtotal += cartTotal.total;

      CheckOutData.push(data);
    }

    if (addresss && addresss.userAddress) {
      const userAddresses = addresss.userAddress;
      let cartCnt = await cart.findOne({ user: req.session.user_id });
      let wishCnt = await wishlist.findOne({ user: req.session.user_id });

      let data;
      if (cartCnt && wishCnt) {
        data = {
          wish: wishCnt.product.length,
          cart: cartCnt.product.length,
        };
      } else {
        data = {
          wish: 0,
          cart: 0,
        };
      }
      res.render("checkout", {
        userData: userSession,
        Products: CheckOutData,
        userAddresses,
        walletMoney: walletMoney.amount,
        subtotal,
        data,
      });
    } else {
      res.render("checkout", {
        userData: userSession,
        Products: CheckOutData,
        walletMoney: walletMoney.amount,
        subtotal,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// Load confirmation
const orderConfirm = async (req, res) => {
  try {
    console.log(req.body);

    let couponDiscount = 0;

    if (req.body.coupon != "") {
      if (req.body.orderDetails.length == 1) {
        couponDiscount = parseInt(req.body.coupon);
      } else {
        let couponDiscountOne =
          parseInt(req.body.coupon) / req.body.orderDetails.length;
        couponDiscount = parseInt(couponDiscountOne);
      }
    }

    let orderDetails = req.body.orderDetails;

    const userAddress = await address.findOne(
      { UserID: req.session.user_id },
      { userAddress: { $elemMatch: { Code: req.body.addressCode } } }
    );

    const product = [];
    const productStock = [];

    function addDays(date, days) {
      let result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }
    let currentDate = new Date();

    for (let i = 0; i < orderDetails.length; i++) {
      const ProductData = await productData.findOne({
        _id: orderDetails[i].productId,
      });

      let tot = orderDetails[i].total - couponDiscount;

      let productOBJ = {
        item: ProductData,
        quantity: orderDetails[i].quantity,
        cash: tot,
        Dates: {
          ordered: currentDate,
          delivery: addDays(currentDate, 5),
        },
        address: userAddress.userAddress[0],
        paymentMethod: req.body.paymentMethod,
        paymentStatus: false,
        coupon: req.body.coupon,
      };
      product.push(productOBJ);
      let pStock = {
        product: orderDetails[i].productId,
        quantity: orderDetails[i].quantity,
      };
      productStock.push(pStock);
    }

    const newOrder = new order({
      userID: req.session.user_id,
      items: product,
      total: req.body.subtotal,
      paymentMethod: req.body.paymentMethod,
    });
    console.log(newOrder);
    const RazPay = {
      userID: req.session.user_id,
      items: product,
      total: req.body.subtotal,
    };

    if (req.body.paymentMethod == "CashOnDelivery") {
      const done = await newOrder.save();

      if (done) {
        for (let i = 0; i < productStock.length; i++) {
          await productData.updateOne(
            { _id: productStock[i].product },
            { $inc: { stock: -productStock[i].quantity } }
          );
        }
        await cart.updateOne(
          { user: req.session.user_id },
          { $set: { product: [] } }
        );

        res.send({
          method: "COD",
          orderNumber: newOrder._id,
          orderDate: currentDate.toDateString(),
          orderTotal: newOrder.total,
          paymentMethod: newOrder.paymentMethod,
          billingAddress: newOrder.items[0].address,
          orderDetails: orderDetails,
          subtotal: req.body.subtotal,
          coupon: req.body.coupon,
        });
      } else {
        res.send({ failed: "Failed" });
      }
    } else if (req.body.paymentMethod == "Razorpay") {
      let razo_ID = process.env.RAZORPAY_ID;
      let razo_SECRET = process.env.RAZORPAY_SECRET;

      const options = {
        amount: req.body.subtotal * 100,
        currency: "INR",
        receipt: "order_rcptid_11",
      };

      const order = await razorpayInstance.orders.create(options);

      for (let i = 0; i < productStock.length; i++) {
        await productData.updateOne(
          { _id: productStock[i].product },
          { $inc: { stock: -productStock[i].quantity } }
        );
      }

      res.send({
        orderNumber: newOrder._id,
        orderDate: currentDate.toDateString(),
        orderTotal: newOrder.total,
        paymentMethod: newOrder.paymentMethod,
        billingAddress: newOrder.items[0].address,
        orderDetails: orderDetails,
        subtotal: req.body.subtotal,
        coupon: req.body.coupon,
        razo: order,
        razoID: razo_ID,
        RazPay: RazPay,
      });
    } else if (req.body.paymentMethod == "wallet") {
      newOrder.items.forEach((item) => {
        item.paymentStatus = true;
      });

      const done = await newOrder.save();

      if (done) {
        for (let i = 0; i < productStock.length; i++) {
          await productData.updateOne(
            { _id: productStock[i].product },
            { $inc: { stock: -productStock[i].quantity } }
          );
        }
        await cart.updateOne(
          { user: req.session.user_id },
          { $set: { product: [] } }
        );
        const date = new Date();
        const formattedDate = date.toLocaleString();

        const transaction = {
          date: formattedDate,
          type: "withdrawal",
          money: req.body.subtotal - couponDiscount,
        };

        await wallet.updateOne(
          { user: req.session.user_id },
          {
            $push: { history: transaction },
            $inc: { amount: -req.body.subtotal },
          }
        );

        res.send({
          method: "wallet",
          orderNumber: newOrder._id,
          orderDate: currentDate.toDateString(),
          orderTotal: newOrder.total,
          paymentMethod: newOrder.paymentMethod,
          billingAddress: newOrder.items[0].address,
          orderDetails: orderDetails,
          subtotal: req.body.subtotal,
          coupon: req.body.coupon,
        });
      } else {
        res.send({ failed: "Failed" });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// pagination
const pagination = async (req, res) => {
  try {
    const userSession = await userData.findOne({ _id: req.session.user_id });
    const categoryData = await categoryDB.find({});
    const totalProduct = await productData.countDocuments({});

    const page = parseInt(req.query.number) || 0;

    let pageNUmber = 5;
    const skip = page * pageNUmber;

    const DataProduct = await productData.find().skip(skip).limit(pageNUmber);

    const answer = Math.ceil(totalProduct / pageNUmber) - 1;

    if (userSession) {
      let cartCnt = await cart.findOne({ user: req.session.user_id });
      let wishCnt = await wishlist.findOne({ user: req.session.user_id });

      let data;
      if (cartCnt && wishCnt) {
        data = {
          wish: wishCnt.product.length,
          cart: cartCnt.product.length,
        };
      } else {
        data = {
          wish: 0,
          cart: 0,
        };
      }
      res.render("product_list", {
        Data: DataProduct,
        userData: userSession,
        cate: categoryData,
        answer,
        number: page,
        data,
      });
    } else {
      res.render("product_list", {
        Data: DataProduct,
        cate: categoryData,
        answer,
        number: page,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
};

// Order place through razorpay
const razpayOrderPlace = async (req, res) => {
  try {
    const newOrder = new order({
      userID: req.body.RazPay.userID,
      items: req.body.RazPay.items,
      total: req.body.orderTotal,
      coupon: req.body.coupon,
    });

    for (let i = 0; i < newOrder.items.length; i++) {
      newOrder.items[i].paymentStatus = true;
    }

    await cart.updateOne(
      { user: req.session.user_id },
      { $set: { product: [] } }
    );

    await newOrder.save();
  } catch (error) {
    console.log(error);
  }
};

// coupon show
const showCoupon = async (req, res) => {
  try {
    let total = req.body.subtotal;
    let offer = total * (25 / 100);
    const currentDate = new Date();

    let data = await Coupon.find({
      endDate: { $gt: currentDate.toISOString().split("T")[0] },
      discount: { $lt: offer },
      count: { $gt: 0 },
    });

    if (data) {
      res.send({ data });
    } else {
      res.send({ NoData });
    }
  } catch (error) {
    console.log(error);
  }
};

// applying coupon
const applyCoupon = async (req, res) => {
  try {
    let data = await Coupon.findOne({ code: req.body.code });
    if (!data) {
      res.send({ Nodata: "NodatFound" });
    } else {
      let dis = data.discount;

      let answer = parseInt(req.body.subtotal) - dis;

      let done = await Coupon.updateOne(
        { code: req.body.code },
        { $inc: { count: -1 } }
      );

      res.send({ answer });
    }
  } catch (error) {
    console.log(error);
  }
};

// product filter and sort
const filterProduct = async (req, res) => {
  try {
    let query = {};
    let sortQuery = {};

    console.log(req.query);

    if (req.query.category && req.query.category !== "all") {
      let categoryCheck = await categoryDB.findOne({
        name: req.query.category,
      });

      if (!categoryCheck) {
        categoryss = await categoryDB.findOne({ _id: req.query.category });
        query.category = categoryss.name;
      }

      if (categoryCheck) {
        query.category = categoryCheck.name;
      }
    }

    if (req.query.price && req.query.price !== "all") {
      switch (req.query.price) {
        case "100-500":
          query.price = { $gte: 100, $lte: 500 };
          break;
        case "500-1000":
          query.price = { $gte: 500, $lte: 1000 };
          break;
        case "1000-1500":
          query.price = { $gte: 1000, $lte: 1500 };
          break;
        default:
          break;
      }
    }

    if (req.query.filter === "lowToHigh") {
      sortQuery.price = 1;
    } else if (req.query.filter === "highToLow") {
      sortQuery.price = -1;
    }

    const page = parseInt(req.query.number) || 0;
    const itemsPerPage = 5;
    const skip = page * itemsPerPage;

    const products = await productData
      .find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(itemsPerPage);

    const userSession = await userData.findOne({ _id: req.session.user_id });
    const categoryData = await categoryDB.find({});
    const totalProduct = await productData.countDocuments(query);
    const totalPages = Math.ceil(totalProduct / itemsPerPage) - 1;

    if (userSession) {
      let cartCnt = await cart.findOne({ user: req.session.user_id });
      let wishCnt = await wishlist.findOne({ user: req.session.user_id });

      let data;
      if (cartCnt && wishCnt) {
        data = {
          wish: wishCnt.product.length,
          cart: cartCnt.product.length,
        };
      } else {
        data = {
          wish: 0,
          cart: 0,
        };
      }
      res.render("product_list", {
        Data: products,
        userData: userSession,
        cate: categoryData,
        answer: totalPages,
        number: page,
        selectedCategory: query.category || "all",
        selectedPrice: req.query.price || "all",
        selectedFilter: req.query.filter || "all",
        data,
      });
    } else {
      res.render("product_list", {
        Data: products,
        cate: categoryData,
        answer: totalPages,
        number: page,
        selectedCategory: query.category || "all",
        selectedPrice: req.query.price || "all",
        selectedFilter: req.query.filter || "all",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// handle search suggestions
const searchSuggestions = async (req, res) => {
  try {
    const searchQuery = req.query.searchQuery;

    const regex = new RegExp(searchQuery, "i");

    const suggestions = await productData.find({ productTitle: regex });

    const formattedSuggestions = suggestions.map((product) => ({
      _id: product._id,
      name: product.productTitle,
      image: product.image[0],
    }));
    res.send(formattedSuggestions);
  } catch (error) {
    console.error("Error fetching search suggestions:");
  }
};

// order show in admin dashboard
const dashboardOrderChart = async (req, res) => {
  try {
    const orderData = await order.aggregate([
      { $unwind: "$items" },
      { $addFields: { year: { $year: "$items.Dates.ordered" } } },
      { $group: { _id: "$year", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.send(orderData);
  } catch (error) {
    console.error(error);
  }
};

// chart with monthly data
const dashboardOrderChartMonthly = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const orderData = await order.aggregate([
      { $unwind: "$items" },
      {
        $match: {
          "items.Dates.ordered": { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: "$items.Dates.ordered" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const allMonths = [
      { _id: 1, count: 0 },
      { _id: 2, count: 0 },
      { _id: 3, count: 0 },
      { _id: 4, count: 0 },
      { _id: 5, count: 0 },
      { _id: 6, count: 0 },
      { _id: 7, count: 0 },
      { _id: 8, count: 0 },
      { _id: 9, count: 0 },
      { _id: 10, count: 0 },
      { _id: 11, count: 0 },
      { _id: 12, count: 0 },
    ];

    for (let item of orderData) {
      let monthIndex = item._id - 1;
      allMonths[monthIndex].count = item.count;
    }

    res.json(allMonths);
  } catch (error) {
    console.error(error);
  }
};

// remove coupon
const removeCoupon = async (req, res) => {
  try {
    const check = await Coupon.findOne({ code: req.body.c });
    if (check) {
      let done = await Coupon.updateOne(
        { code: req.body.c },
        { $inc: { count: 1 } }
      );
      res.send({ done });
    } else {
      res.send({ NotFound: "failed" });
    }
  } catch (error) {
    console.log(error);
  }
};

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
  loadCheckout,
  orderConfirm,
  pagination,
  razpayOrderPlace,
  showCoupon,
  applyCoupon,
  filterProduct,
  searchSuggestions,
  dashboardOrderChart,
  dashboardOrderChartMonthly,
  removeCoupon,
};
