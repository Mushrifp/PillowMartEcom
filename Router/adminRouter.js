require("dotenv").config();
const express = require("express");
const admin_router = express();
const adminController = require("../Controller/adminController");
const multer = require("multer");
const path = require("path");
const auth = require("../Middleware/adminAuthentication");
const session = require("express-session");

admin_router.set("view engine", "ejs");
admin_router.set("views", "./View/Admin");

admin_router.use(express.static("Public"));

admin_router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../Public/productImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

// Admin log in and verify
admin_router.get("/", auth.isLogout, adminController.adminLogin);
admin_router.post("/loginVerify", auth.isLogout, adminController.loginVerify);
admin_router.post("/logout", auth.isLogin, adminController.logout);

// Load Dashboard
admin_router.get("/dash", auth.isLogin, adminController.loadDash);
admin_router.get("/home", auth.isLogin, adminController.loadDash);

// Load Product
admin_router.get("/product", auth.isLogin, adminController.Product);

// Load Order
admin_router.get("/order", auth.isLogin, adminController.Order);

// Load User list
admin_router.get("/user", auth.isLogin, adminController.users);

// Load Product Reviews
admin_router.get("/review", auth.isLogin, adminController.reviews);

// Load Transactions
admin_router.get("/transactions", auth.isLogin, adminController.transactions);

// Load category
admin_router.get("/category", auth.isLogin, adminController.category);

// user block and unblock
admin_router.post("/blockUnblockUser", adminController.blockUnblockUser);

// sales page loading
admin_router.get("/sales", adminController.sales);

// logout
admin_router.get("/logout", auth.isLogin, adminController.logout);

// Offer and Coupon add offer and coupon
admin_router.get("/offAndcop", adminController.offAndcop);
admin_router.get("/addoffer", adminController.addoffer);
admin_router.get("/addcoupon", adminController.addcoupon);

// add edit update delete product
admin_router.get("/addproduct", auth.isLogin, adminController.loadAddproduct);
admin_router.post(
  "/addProduct",
  upload.array("images", 3),
  adminController.addProduct
);
admin_router.get("/deleteProduct", auth.isLogin, adminController.deleteProduct);
admin_router.get("/editProduct", auth.isLogin, adminController.editProduct);
admin_router.post(
  "/editProduct",
  upload.fields([
    { name: "images0", maxCount: 1 },
    { name: "images1", maxCount: 1 },
    { name: "images2", maxCount: 1 },
  ]),
  adminController.updateProduct
);

// Adding new category and delete category
admin_router.post("/newCategory", auth.isLogin, adminController.newCategory);
admin_router.get(
  "/deleteCategory",
  auth.isLogin,
  adminController.deleteCategory
);
admin_router.get(
  "/editCategoryLoad",
  auth.isLogin,
  adminController.editCategoryLoad
);
admin_router.post("/editCategory", auth.isLogin, adminController.editCategory);

// order details
admin_router.get("/viewOrder", auth.isLogin, adminController.viewOrder);
admin_router.get("/statusChange", auth.isLogin, adminController.statusChange);

// coupon adding
admin_router.post("/addCoupon", auth.isLogin, adminController.addCoupon);
admin_router.get("/deleteCoupon", auth.isLogin, adminController.deleteCoupon);
admin_router.get("/editCoupon", auth.isLogin, adminController.editCoupon);
admin_router.post(
  "/editCouponSave",
  auth.isLogin,
  adminController.editCouponSave
);

// sales filter
admin_router.post("/filterSales", auth.isLogin, adminController.filterSales);
admin_router.get("/filterSales2", auth.isLogin, adminController.filterSales2);
admin_router.post(
  "/filterSalesByDateRange",
  auth.isLogin,
  adminController.filterSalesByDateRange
);

// offer
admin_router.post("/createOffer", auth.isLogin, adminController.createOffer);
admin_router.get("/editOffer", auth.isLogin, adminController.editOffer);
admin_router.get("/deleteOffer", auth.isLogin, adminController.deleteOffer);
admin_router.post(
  "/editOfferSave",
  auth.isLogin,
  adminController.editOfferSave
);
admin_router.get("/OffApply", auth.isLogin, adminController.OffApply);
admin_router.get("/apply", auth.isLogin, adminController.apply);
admin_router.get(
  "/removeOfferProduct",
  auth.isLogin,
  adminController.removeOfferProduct
);
admin_router.get(
  "/currentofferProduct",
  auth.isLogin,
  adminController.currentofferProduct
);
admin_router.get(
  "/currentOfferCategory",
  auth.isLogin,
  adminController.currentOfferCategory
);
admin_router.get(
  "/addOfferTOCategory",
  auth.isLogin,
  adminController.addOfferTOCategory
);
admin_router.get(
  "/offApplyCategory",
  auth.isLogin,
  adminController.offApplyCategory
);
admin_router.post(
  "/removeOfferCategory",
  auth.isLogin,
  adminController.removeOfferCategory
);

// order return
admin_router.get("/returnOrder", auth.isLogin, adminController.returnOrder);

module.exports = admin_router;
