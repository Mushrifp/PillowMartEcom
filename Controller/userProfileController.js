require("dotenv").config();
const mongoose = require("mongoose");
const userData = require("../Model/userData");
const productData = require("../Model/product");
const hash = require("bcrypt");
const address = require("../Model/address");
const Order = require("../Model/order");
const wallet = require("../Model/wallet");
const orderReturned = require("../Model/returnOrder");
const Razorpay = require("razorpay");
const cart = require("../Model/cart");
const wish = require("../Model/wish");

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

// Load profile
const profile = async (req, res) => {
  try {
    const userDatas = await userData.findOne({ _id: req.session.user_id });
    let cartCnt = await cart.findOne({ user: req.session.user_id });
    let wishCnt = await wish.findOne({ user: req.session.user_id });

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
    res.render("profile", { user: userDatas, data });
  } catch (error) {
    console.log(error);
  }
};

// Load password
const password = async (req, res) => {
  try {
    const userDatas = await userData.findOne({ _id: req.session.user_id });
    let cartCnt = await cart.findOne({ user: req.session.user_id });
    let wishCnt = await wish.findOne({ user: req.session.user_id });

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
    res.render("password", { userDatas, data });
  } catch (error) {
    console.log(error);
  }
};

// Load address
const LoadAddress = async (req, res) => {
  try {
    const addressData = await address.findOne({ UserID: req.session.user_id });
    const userDatas = await userData.findOne({ _id: req.session.user_id });
    let cartCnt = await cart.findOne({ user: req.session.user_id });
    let wishCnt = await wish.findOne({ user: req.session.user_id });

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
    if (addressData) {
      const Data = [];
      for (let i = 0; i < addressData.userAddress.length; i++) {
        Data.push(addressData.userAddress[i]);
      }
      res.render("address", { Data, userDatas, data });
    } else {
      res.render("address", { NoData: "No Adress", userDatas, data });
    }
  } catch (error) {
    console.log(error);
  }
};

// Load order
const order = async (req, res) => {
  try {
    const userDatas = await userData.findOne({ _id: req.session.user_id });

    const Datas = await Order.find({ userID: req.session.user_id }).sort({
      _id: -1,
    });
    let cartCnt = await cart.findOne({ user: req.session.user_id });
    let wishCnt = await wish.findOne({ user: req.session.user_id });

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
    let orders = [];

    for (let i = 0; i < Datas.length; i++) {
      for (let j = 0; j < Datas[i].items.length; j++) {
        let singleData = Datas[i].items[j];

        const options = { year: "numeric", month: "long", day: "numeric" };
        const delivery = singleData.Dates.delivery.toLocaleDateString(
          "en-US",
          options
        );
        const ordered = singleData.Dates.ordered.toLocaleDateString(
          "en-US",
          options
        );

        let obj = {
          docID: singleData._id,
          ID: singleData.item._id,
          orderDate: ordered,
          deliveryDate: delivery,
          productName: singleData.item.productTitle,
          image: singleData.item.image[0],
          Status: singleData.status,
          Total: singleData.cash,
          quantity: singleData.quantity,
          paymentMethod: singleData.paymentMethod,
          paymentStatus: singleData.paymentStatus,
        };

        orders.push(obj);
      }
    }

    res.render("order", { Data: orders, userDatas, data });
  } catch (error) {
    console.log(error);
  }
};

//  Load wallet
const loadWallet = async (req, res) => {
  try {
    const userDatas = await userData.findOne({ _id: req.session.user_id });
    const exist = await wallet.findOne({ user: req.session.user_id });
    let cartCnt = await cart.findOne({ user: req.session.user_id });
    let wishCnt = await wish.findOne({ user: req.session.user_id });

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
    if (exist) {
      res.render("wallet", { userDatas, exist, data });
    } else {
      const newWallet = new wallet({
        user: req.session.user_id,
        amount: 0,
      });

      await newWallet.save();

      const exist = await wallet.findOne({ user: req.session.user_id });
      res.render("wallet", { userDatas, exist, data });
    }
  } catch (error) {
    console.log(error);
  }
};

// edit profile name and email and number
const profileEdit = async (req, res) => {
  try {
    const user = await userData.findOne({ _id: req.session.user_id });
    if (!user) {
      res.status(404).send("User not found");
    }
    let cartCnt = await cart.findOne({ user: req.session.user_id });
    let wishCnt = await wish.findOne({ user: req.session.user_id });

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
    if (req.body.name && req.body.name !== user.name) {
      const existName = await userData.findOne({ name: req.body.name });
      if (existName) {
        res.render("profile", {
          message: "This name is already in use",
          user,
          data,
        });
      } else {
        await userData.updateOne(
          { _id: req.session.user_id },
          { $set: { name: req.body.name } }
        );
        res.redirect("/user/profile");
      }
    }

    if (req.body.email && req.body.email !== user.email) {
      const existEmail = await userData.findOne({ email: req.body.email });
      if (existEmail) {
        res.render("profile", {
          message: "This email is already in use",
          user,
          data,
        });
      } else {
        await userData.updateOne(
          { _id: req.session.user_id },
          { $set: { email: req.body.email } }
        );
        res.redirect("/user/profile");
      }
    }

    if (req.body.mobile && req.body.mobile.length == 10) {
      const existMobile = await userData.findOne({ mobile: req.body.mobile });
      if (existMobile) {
        res.render("profile", {
          message: "This phone number is already in use",
          user,
          data,
        });
      } else {
        await userData.updateOne(
          { _id: req.session.user_id },
          { $set: { mobile: req.body.mobile } }
        );
        res.redirect("/user/profile");
      }
    } else {
      res.render("profile", { message: "Enter a valid NUmber", user, data });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

// profile password changing
const profilePasswordEdit = async (req, res) => {
  try {
    let passwordCheck = await StrongPassword(req.body.new);
    let cartCnt = await cart.findOne({ user: req.session.user_id });
    let wishCnt = await wish.findOne({ user: req.session.user_id });

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
    if (passwordCheck) {
      if (req.body.new == req.body.confirm) {
        const hPassword = await passwordHash(req.body.new);

        const done = await userData.updateOne(
          { _id: req.session.user_id },
          { $set: { password: hPassword } }
        );

        if (done) {
          console.log("password changed");
          res.render("password", { message: "Password Changed", data });
        } else {
          console.log("password not changed");
          res.render("password", {
            message: "Failed to Change Password",
            data,
          });
        }
      } else {
        res.render("password", {
          message: "Retyped Password not matching",
          newpass: req.body.new,
          confirm: req.body.confirm,
        });
      }
    } else {
      res.render("password", {
        message:
          "minimum of 8 characters,one uppercase ,lowercase letter one number, and one special character.",
        newpass: req.body.new,
        confirm: req.body.confirm,
        data,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

// user Adding New Address
const addAddress = async (req, res) => {
  try {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let result = "";
    for (let i = 0; i < 7; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    const Data = {
      Code: result,
      name: req.body.name,
      Bname: req.body.Bname,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      town: req.body.town,
      pincode: req.body.pincode,
    };
    let cartCnt = await cart.findOne({ user: req.session.user_id });
    let wishCnt = await wish.findOne({ user: req.session.user_id });

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
    if (req.body.phone.length != 10) {
      res.render("addAddress", { message: "Enter Valid Number", Data, data });
    }

    if (req.body.pincode.length != 6) {
      res.render("addAddress", { message: "Enter Valid pincode", Data, data });
    }

    const addressData = await address.findOne({ UserID: req.session.user_id });

    if (addressData) {
      const done = await address.findOneAndUpdate(
        { UserID: req.session.user_id },
        { $addToSet: { userAddress: Data } }
      );
      if (done) {
        res.render("addAddress", { doneMessage: "Created Successfully", data });
      } else {
        res.render("addAddress", { message: "failed Try again ", data });
      }
    } else {
      const NewAddress = new address({
        UserID: req.session.user_id,
        userAddress: [Data],
      });
      const save = NewAddress.save();
      if (save) {
        res.render("addAddress", { doneMessage: "Created Successfully", data });
      } else {
        res.render("addAddress", { message: "failed Try again ", data });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// load add address
const loadAddAddress = async (req, res) => {
  try {
    const userDatas = await userData.findOne({ _id: req.session.user_id });
    let cartCnt = await cart.findOne({ user: req.session.user_id });
    let wishCnt = await wish.findOne({ user: req.session.user_id });

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
    res.render("addAddress", { userDatas, data });
  } catch (error) {
    console.log(error);
  }
};

// address remove
const removeAddress = async (req, res) => {
  try {
    const done = await address.updateOne(
      { UserID: req.session.user_id },
      { $pull: { userAddress: { Code: req.query.Code } } }
    );
    if (done) {
      const addressData = await address.findOne({
        UserID: req.session.user_id,
      });

      const Data = [];
      for (let i = 0; i < addressData.userAddress.length; i++) {
        Data.push(addressData.userAddress[i]);
      }

      let cartCnt = await cart.findOne({ user: req.session.user_id });
      let wishCnt = await wish.findOne({ user: req.session.user_id });

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

      res.render("address", { Data, data });
    } else {
      const addressData = await address.findOne({
        UserID: req.session.user_id,
      });

      const Data = [];
      for (let i = 0; i < addressData.userAddress.length; i++) {
        Data.push(addressData.userAddress[i]);
      }

      res.render("address", { Data, data });
    }
  } catch (error) {
    console.log(error);
  }
};

// edit address
const editAddress = async (req, res) => {
  try {
    const addressData = await address.findOne({ UserID: req.session.user_id });

    let datas = addressData.userAddress;
    let dataToSend = {};
    for (let i = 0; i < datas.length; i++) {
      if (datas[i].Code == req.query.Code) {
        dataToSend = datas[i];
      }
    }
    let cartCnt = await cart.findOne({ user: req.session.user_id });
    let wishCnt = await wish.findOne({ user: req.session.user_id });

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
    res.render("editAddress", { Data: dataToSend, data });
  } catch (error) {
    console.log(error);
  }
};

// Update edited address
const updateAddress = async (req, res) => {
  try {
    const Data = {
      name: req.body.name,
      Bname: req.body.Bname,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      town: req.body.town,
      pincode: req.body.pincode,
    };
    let cartCnt = await cart.findOne({ user: req.session.user_id });
    let wishCnt = await wish.findOne({ user: req.session.user_id });

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
    if (req.body.phone.length !== 10) {
      res.render("editAddress", { message: "Enter Valid Number", Data, data });
    }

    if (req.body.pincode.length !== 6) {
      res.render("editAddress", { message: "Enter Valid pincode", Data, data });
    }

    const updateFields = {
      "userAddress.$.name": req.body.name,
      "userAddress.$.Bname": req.body.Bname,
      "userAddress.$.phone": req.body.phone,
      "userAddress.$.email": req.body.email,
      "userAddress.$.address": req.body.address,
      "userAddress.$.town": req.body.town,
      "userAddress.$.pincode": req.body.pincode,
    };

    const done = await address.findOneAndUpdate(
      { UserID: req.session.user_id, "userAddress.Code": req.body.Code },
      { $set: updateFields }
    );
    done ? console.log("update Adsress") : console.log("Not updated");
    res.render("editAddress", { doneMessage: "Saved Changes", Data, data });
  } catch (error) {
    console.log(error);
  }
};

// adding trough checkout page
const addressAddCheckout = async (req, res) => {
  try {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let result = "";
    for (let i = 0; i < 7; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    const Data = {
      Code: result,
      name: req.body.name,
      Bname: req.body.Bname,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      town: req.body.town,
      pincode: req.body.pincode,
    };

    const addressData = await address.findOne({ UserID: req.session.user_id });

    if (addressData) {
      const done = await address.findOneAndUpdate(
        { UserID: req.session.user_id },
        { $addToSet: { userAddress: Data } }
      );
      if (done) {
        res.send({ doneMessage: "Created Successfully" });
      } else {
        res.send({ message: "failed Try again " });
      }
    } else {
      const NewAddress = new address({
        UserID: req.session.user_id,
        userAddress: [Data],
      });
      const save = NewAddress.save();
      if (save) {
        res.send({ doneMessage: "Created Successfully" });
      } else {
        res.send({ message: "failed Try again " });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// cancelOrder
const cancelOrder = async (req, res) => {
  try {
    let done = await Order.updateOne(
      { userID: req.session.user_id, "items._id": req.query.docID },
      { $set: { "items.$.status": "Canceled" } }
    );

    let StockIncrement = await productData.updateOne(
      { _id: req.query.ID },
      { $inc: { stock: parseInt(req.query.quant, 10) } }
    );

    const date = new Date();
    const formattedDate = date.toLocaleString();

    if (
      req.query.paymentMethod == "Razorpay" ||
      req.query.paymentMethod == "wallet"
    ) {
      const transaction = {
        date: formattedDate,
        type: "Deposit",
        money: req.query.totalCash,
      };

      await wallet.updateOne(
        { user: req.session.user_id },
        {
          $push: { history: transaction },
          $inc: { amount: req.query.totalCash },
        }
      );
    }

    if (done && StockIncrement) {
      res.send({ Done: "Done" });
    } else {
      res.send({ failed: "failed" });
    }
  } catch (error) {
    console.log(error);
  }
};

// View order
const viewDetails = async (req, res) => {
  try {
    const objectId = new mongoose.Types.ObjectId(req.query.ID);
    let ordrData = await Order.findOne({
      userID: req.session.user_id,
      "items._id": objectId,
    });

    let productItems = ordrData.items;

    let done = [];

    for (let i = 0; i < productItems.length; i++) {
      if (objectId.equals(productItems[i]._id)) {
        done.push(productItems[i]);
        break;
      }
    }

    const options = { year: "numeric", month: "long", day: "numeric" };
    const ordered = done[0].Dates.ordered.toLocaleDateString("en-US", options);
    const delivery = done[0].Dates.delivery.toLocaleDateString(
      "en-US",
      options
    );
    let obj = {
      id: done[0]._id,
      ordered: ordered,
      delivery: delivery,
      title: done[0].item.productTitle,
      description: done[0].item.description,
      price: done[0].item.price,
      image1: done[0].item.image[0],
      image2: done[0].item.image[1],
      image3: done[0].item.image[2],
      category: done[0].item.category,
      size: done[0].item.size,
      status: done[0].status,
      cash: done[0].cash,
      paymentMethod: done[0].paymentMethod,
      paymentStatus: done[0].paymentStatus,
      coupon: done[0].coupon,
      quantity: done[0].quantity,
      name: done[0].address.name,
      Bname: done[0].address.Bname,
      phone: done[0].address.phone,
      email: done[0].address.email,
      address: done[0].address.address,
      town: done[0].address.town,
      pincode: done[0].address.pincode,
    };
    let cartCnt = await cart.findOne({ user: req.session.user_id });
    let wishCnt = await wish.findOne({ user: req.session.user_id });

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
    res.render("orderView", { obj, data });
  } catch (error) {
    console.log(error);
  }
};

// adding money to wallet
const walletAddMoney = async (req, res) => {
  try {
    const date = new Date();
    const formattedDate = date.toLocaleString();

    const transaction = {
      date: formattedDate,
      type: "Deposit",
      money: parseInt(req.query.number),
    };

    const done = await wallet.updateOne(
      { user: req.session.user_id },
      {
        $push: { history: transaction },
        $inc: { amount: parseInt(req.query.number) },
      }
    );

    if (done) {
      res.send({ done: "done" });
    } else {
      res.send({ failed: "failed" });
    }
  } catch (error) {
    console.log(error);
  }
};

// wallet history
const getWalletHistory = async (req, res) => {
  try {
    const data = await wallet.findOne({ user: req.session.user_id });

    const sortedHistory = data.history.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.send({ data: sortedHistory });
  } catch (error) {
    console.log(error);
  }
};

// order return
const returnOrder = async (req, res) => {
  try {
    await Order.updateOne(
      { userID: req.session.user_id, "items._id": req.query.docID },
      { $set: { "items.$.status": "Return" } }
    );

    let newReturnOrder = new orderReturned({
      userId: req.session.user_id,
      orderId: req.query.docID,
      reason: req.query.reason,
    });

    let done = newReturnOrder.save();

    if (done) {
      res.send({ Done: "Done" });
    } else {
      res.send({ failed: "failed" });
    }
  } catch (error) {
    console.log(error);
  }
};

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// pay later
const payLaterOnline = async (req, res) => {
  try {
    let razo_ID = process.env.RAZORPAY_ID;
    let razo_SECRET = process.env.RAZORPAY_SECRET;

    const orderInfo = await Order.findOne({
      userID: req.session.user_id,
      "items._id": req.body.iD,
    });

    const options = {
      amount: orderInfo.items[0].cash * 100,
      currency: "INR",
      receipt: "order_rcptid_11",
    };

    const order = await razorpayInstance.orders.create(options);

    res.send({
      razo: order,
      razoID: razo_ID,
      orderInfo: req.body.iD,
    });
  } catch (error) {
    console.log(error);
  }
};

// pay later wallet
const payLaterWallet = async (req, res) => {
  try {
    const wall = await wallet.findOne({ user: req.session.user_id });
    const orderInfo = await Order.findOne({
      userID: req.session.user_id,
      "items._id": req.body.iD,
    });

    if (orderInfo.items[0].cash <= wall.amount) {
      await Order.updateOne(
        { userID: req.session.user_id, "items._id": req.body.iD },
        { $set: { "items.$.paymentStatus": true } }
      );
      const date = new Date();
      const formattedDate = date.toLocaleString();
      const transaction = {
        date: formattedDate,
        type: "withdrawal",
        money: orderInfo.items[0].cash,
      };
      await wallet.updateOne(
        { user: req.session.user_id },
        {
          $push: { history: transaction },
          $inc: { amount: -orderInfo.items[0].cash },
        }
      );

      res.send({ done: "Done" });
    } else {
      let info = {
        userBalance: wall.amount,
        orderTot: orderInfo.items[0].cash,
      };
      res.send({ failed: info });
    }
  } catch (error) {
    console.log(error);
  }
};

// pay later razorpay order confirmation
const razpayOrderPlace = async (req, res) => {
  try {
    const d = await Order.updateOne(
      { userID: req.session.user_id, "items._id": req.body.id },
      { $set: { "items.$.paymentStatus": true } }
    );

    res.send({ done: "done" });
  } catch (error) {}
};

module.exports = {
  profile,
  password,
  LoadAddress,
  order,
  loadWallet,
  profileEdit,
  profilePasswordEdit,
  addAddress,
  loadAddAddress,
  removeAddress,
  editAddress,
  updateAddress,
  addressAddCheckout,
  cancelOrder,
  viewDetails,
  walletAddMoney,
  getWalletHistory,
  returnOrder,
  payLaterOnline,
  payLaterWallet,
  razpayOrderPlace,
};
