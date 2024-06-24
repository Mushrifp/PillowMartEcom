const userData = require('../Model/userData');
const productData = require('../Model/product');
const hash = require('bcrypt');
const product = require("../Model/product")
const categoryDB  = require("../Model/category")
const order = require("../Model/order")
const { Types } = require('mongoose');
const mongoose = require('mongoose');
const Coupon = require('../Model/coupons');
const offer = require('../Model/offer');



// For pdf 
const ejs = require("ejs")
const htmlPdf = require("html-pdf")
const fs = require("fs")
const path = require("path");


// Load Login
const adminLogin = async (req,res)=>{
    try {
        res.render("account-login")
    } catch (error) {
        console.log(error)
    }
}

// admin login verify
const loginVerify = async (req,res)=>{
    try {
         
          let adminEmail = "admin@gmail.com"
          let adminPass = "123"
console.log("this is the shit ",req.body)
           if(adminEmail == req.body.email&&adminPass == req.body.password){
            req.session.admin_mail = {
                email:adminEmail
            }

    res.send({Done:"Verified"})
           }else{
    res.send({NotDone:"Not Verified"})
           }

    } catch (error) {
        console.log(error)
    }
}

// Load Dashboard with Pagination
const loadDash = async (req, res) => {
    try {
        const productNumber = await productData.countDocuments({});
        const userNumber = await userData.countDocuments({});
        const orderNumber = await order.find({});

        let number = 0;
        for (let i = 0; i < orderNumber.length; i++) {
            number += orderNumber[i].items.length;
        }

        const Datas = await order.find({}).sort({ _id: -1 });

        let orders = [];

        for (let i = 0; i < Datas.length; i++) {
            for (let j = 0; j < Datas[i].items.length; j++) {
                let singleData = Datas[i].items[j];
                let pyst ;
                if(singleData.paymentStatus == true){
                       pyst="Paid"
                }else{
                      pyst="Not Paid"
                }
                let obj = {
                    user: Datas[i].userID,
                    ID: singleData._id,
                    paymentMethod: singleData.paymentMethod,
                    category:singleData.item.category,
                    paymentStatus: pyst,
                    productName: singleData.item.productTitle,
                    image: singleData.item.image[0],
                    OrdrDate: singleData.Dates.ordered,
                    Status: singleData.status,
                    Total: singleData.cash,
                    name: singleData.address.name
                };

                orders.push(obj);
            }
        }

        const perPage = 3; 
        const page = req.query.page || 1; 

        const userDataList = await userData.find({}).sort({_id:-1}).skip((page-1)*perPage).limit(perPage);

        const catgorys = await categoryDB.find({})

        const totalUsers = await userData.countDocuments({});
        const totalPages = Math.ceil(totalUsers/perPage);

        res.render('dash',{
            ProductCount: productNumber,
            userCount: userNumber,
            number,
            orders,
            userData: userDataList,
            totalPages,
            currentPage: parseInt(page),
            catgorys
        });

    } catch (error) {
        console.log(error);
    }
};


// Load Product
const Product = async (req,res)=>{
    try {  
        const productDatas = await productData.find({})
      res.render("products-list",{productData:productDatas})
    } catch (error) {
        console.log(error)
    }
}

// Load order 
const Order = async (req,res)=>{
    try {
    
    const Datas = await order.find({}).sort({ _id: -1 });

   let orders=[]

       for(let i=0;i<Datas.length;i++){
          for(let j=0;j<Datas[i].items.length;j++){
            let singleData = Datas[i].items[j]
              let obj = {
                user:Datas[i].userID,
                ID:singleData._id,
                paymentMethod:singleData.paymentMethod,
                paymentStatus:singleData.paymentStatus,
                productName:singleData.item.productTitle,
                image:singleData.item.image[0],
                Status:singleData.status,
                Total:singleData.cash,
                name:singleData.address.name
              }

              orders.push(obj)
          }
       }

         res.render("orders-1",{orders:orders})
    } catch (error) {
        console.log(error)
    }
}

// Load user
const users = async (req,res)=>{
    try {
        const DataOfUser = await userData.find({}).sort({ _id: -1 });
        res.render("user-list",{userData:DataOfUser})
    } catch (error) {
        console.log(error)
    }
}
 
// Load reviews
const reviews = async (req,res)=>{
    try{
       res.render("reviews")
    }catch(error){
        console.log(error)
    }
}

// Load transactions
const transactions = async (req,res)=>{
    try{
         res.render("transactions-2")
    }catch(error){
        console.log(error)
    }
}

// Load category
const category = async (req,res)=>{
    try{

        const categoryData = await categoryDB.find({})     

       res.render("categories",{categoryData})
    }catch(error){
        console.log(error)
    }
}

// Load add product 
const loadAddproduct = async (req,res)=>{
    try{
        const categoryData = await categoryDB.find({})
        res.render("add-product-3",{categoryData})
    }catch(error){
        console.log(error)
    }
}

// Load add offer 
const addoffer = async (req,res)=>{
    try {
         res.render("add-offer-3")
    } catch (error) {
         console.log(error)
    }
}

// Load add coupon 
const addcoupon  = async (req,res)=>{
    try {
          res.render("add-coupon-3")
    } catch (error) {
         console.log(error)
    }
}

// Load coupon and offer 
const offAndcop = async (req,res)=>{
    try {
        const coupons = await Coupon.find({});
        const offers = await offer.find({});
         res.render("offerandcop-3",{coupons,offers})
        
    } catch (error) {
        console.log(error)
    }
}

// Delete user from user list admin
const blockUnblockUser = async (req,res)=>{
    try {
            
        let block = false;

        if(req.body.action == "block"){
                  block = true
        }
  await userData.findByIdAndUpdate({_id:req.body.userId},{$set:{isAdminBlocked:block}});

  const DataOfUser = await userData.find({})
        res.render("user-list",{userData:DataOfUser})
        console.log("User :" + req.body.action);

    } catch (error) { 
        console.log(error)
    }
}

// Product edit and update and save changes
const updateProduct = async (req, res) => {
    try {

        const productDatas = await productData.findById({_id: req.body.id});
        const categoryData = await categoryDB.find({});

        if (!productDatas) {
            return res.status(404).send("Product not found");
        }

        if (req.body.productTitle){
            const existingProduct = await productData.findOne({ productTitle: req.body.productTitle });
            if (existingProduct && existingProduct._id != req.body.id){
                 res.render("edit-product-3", { message: "This product name already exists", categoryData, currentData: productDatas });
            }
            await productData.findByIdAndUpdate({_id:req.body.id},{$set:{productTitle: req.body.productTitle}});

        }

        if(req.body.description) {
            await productData.findByIdAndUpdate({_id:req.body.id},{$set:{description:req.body.description}});
        }

        if(req.body.stock){
            await productData.findByIdAndUpdate({_id:req.body.id},{$set:{stock:req.body.stock}});
        }

        if(req.body.price){
            await productData.findByIdAndUpdate({_id:req.body.id},{$set:{price:req.body.price}});

        }

        if(req.body.size){
            await productData.findByIdAndUpdate({_id:req.body.id},{$set:{size:req.body.size}});

        }

        if(req.body.category){
            await productData.findByIdAndUpdate({_id:req.body.id},{$set:{category: req.body.category }});
        }
        
            if(req.files){
                if(req.files['images0']){

                    await productData.findByIdAndUpdate({_id:req.body.id},{$set:{"image.0":req.files['images0'][0].filename}});
                    console.log("Image 1 updated");
                }
                if(req.files['images1']){

                    await productData.findByIdAndUpdate({_id:req.body.id},{$set:{"image.1":req.files['images1'][0].filename}});
                    console.log("Image 2 updated");
                }
                if(req.files['images2']){
                    await productData.findByIdAndUpdate({_id:req.body.id},{$set:{"image.2":req.files['images2'][0].filename}});
                    console.log("Image 3 updated");
                }
            
            }
            

        const updatedProductData = await productData.findById({_id:req.body.id});
        res.render("edit-product-3", { message: "Product updated successfully", categoryData, currentData: updatedProductData });

    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error");
    }
}

// add product by admin 
const addProduct = async (req,res)=>{
    try {
        const images = req.files.map(file => file.filename); 
        const ProductDB = await product.findOne({productTitle:req.body.title})
              console.log("adding product")
        if(!ProductDB){
            const productStore = new productData({
                productTitle:req.body.title,
                description:req.body.description,
                price:req.body.price,
                image:images,
                stock:req.body.stock,
                size:req.body.size,
                category:req.body.category
            })
            await productStore.save();
            const productDatas = await productData.find({})
          res.render("products-list",{productData:productDatas})
        }else{
             res.render("add-product-3",{message:"This product Name already exist",title:req.body.title,description:req.body.description,price:req.body.price,image:images,stock:req.body.stock,category:req.body.category})
        }
   
    } catch (error) {
        console.log(error)
    }
}
 
// Delete product 
const deleteProduct = async (req,res)=>{
    try {      
        await productData.deleteOne({_id:req.query.id})
        res.send({Done:"done"})
    } catch (error) {
         console.log(error)
    }
}

// Edit product
const editProduct = async (req,res)=>{
    try {
        const currData = await productData.findOne({_id:req.query.id})
        const categoryData = await categoryDB.find({})
        res.render("edit-product-3",{currentData:currData,categoryData})
    } catch (error) {
         console.log(error)
    }
}

// logout
const logout = async (req,res)=>{
    try {
         req.session.destroy();
         res.redirect('/admin/')
    } catch (error) {
       console.log(error.message)
    }
}

// Adding new category 
const newCategory = async (req,res)=>{
    try{

        const name = req.body.name.replace(/\s/g, "")
        const existingCategory = await categoryDB.findOne({name:req.body.name})
        const categoryData = await categoryDB.find({}) 
 
       if(!existingCategory){
                  const newCategory = new categoryDB ({
                      name:req.body.name,
                      description:req.body.description
                   })

                 const saving  = await newCategory.save();
                 saving ? console.log("category saved") : console.log("category not saved")
                 const categoryData = await categoryDB.find({}) 
                 res.render("categories",{message:"Created",categoryData})
                 

        }else{
            res.render("categories",{message:"Already exists",pdName:req.body.name,pdDescription:req.body.description,categoryData})
       }

    }catch(error){
        console.log(error)
    }
}

// Deleting category
const deleteCategory = async (req,res)=>{
    try {      
        await categoryDB.deleteOne({_id:req.query.id})
        res.redirect('/admin/category')
    } catch (error) {
         console.log(error)
    }
}

// edit category load
const editCategoryLoad = async (req,res)=>{
    try{
        const CategoryData = await categoryDB.findOne({_id:req.query.id})
       res.render("categoryEdit",{CategoryData})
    }catch(error){
        console.log(error)
    }
}

// editing category 
const editCategory = async (req,res)=>{
    try {   
        let updateOperations = {};
        console.log("this is the upcoming data",req.body)
const alreadyExistName = await categoryDB.findOne({name:req.body.name})
const CategoryData ={
    name:req.body.name,
    description:req.body.description
}
        
        if(req.body.name&&!alreadyExistName){
            updateOperations.name = req.body.name;
        }else{
            res.render("categoryEdit",{CategoryData,message:"Already exist"})
        }
                
        if(req.body.description){
            updateOperations.description = req.body.description;
        }

        const done = await categoryDB.findByIdAndUpdate({ _id:req.body.id},{$set:updateOperations});

        if (done) {
            const categoryData = await categoryDB.find({});
            res.render("categories", { categoryData });
        } else {
            console.log("not done");
        }

    } catch (error) {
         console.log(error)
    }
}

// Order View 
const viewOrder = async (req,res)=>{
    try {

        let done = await order.findOne({ userID: req.query.user, "items._id": req.query.id },{ "items.$": 1 });

        const options = {year:'numeric',month:'long',day:'numeric'};
        const ordered = done.items[0].Dates.ordered.toLocaleDateString('en-US',options);
        const delivery = done.items[0].Dates.delivery.toLocaleDateString('en-US',options);  
        let obj = {
          ordered:ordered,
          delivery:delivery,
          title:done.items[0].item.productTitle,
          description:done.items[0].item.description,
          price:done.items[0].item.price,
          image1:done.items[0].item.image[0],
          image2:done.items[0].item.image[1],
          image3:done.items[0].item.image[2],
          category:done.items[0].item.category,
          size:done.items[0].item.size,
          status:done.items[0].status,
          cash:done.items[0].cash,
          paymentMethod:done.items[0].paymentMethod,
          paymentStatus:done.items[0].paymentStatus,
          quantity:done.items[0].quantity,
          name:done.items[0].address.name,
          Bname:done.items[0].address.Bname,
          phone:done.items[0].address.phone,
          email:done.items[0].address.email,
          address:done.items[0].address.address,
          town:done.items[0].address.town,
          pincode:done.items[0].address.pincode,
   
        } 
 let page = req.query.page
        res.render("viewOrder",{obj,page})
    } catch (error) {
        console.log(error)
    }
}

// change status
const statusChange = async (req,res)=>{
   try {
    const objectId = new  mongoose.Types.ObjectId(req.query.orderId);
    let done = await order.updateOne({userID:req.query.userId, "items._id": objectId }, {$set:{ "items.$.status": req.query.action } });

        if(done){
         res.send({Done:"Done"})
        }else{
         res.send({failed:"failed"})
        }
   } catch (error) {
     console.log(error)
   }
}

// adding coupon 
const addCoupon = async (req,res)=>{
    try{
        const { code, name, description, discount, count, startDate, endDate } = req.body;
        const newCoupon = new Coupon({
            code,
            name,
            description,
            discount,
            count,
            startDate,
            endDate
         });

         const done = await newCoupon.save();;
         if(done){
            res.send({doneMessage:"done"})
         }else{
            res.send({message:"failed"})
         }
    }catch(error){
        console.log(error)
    }
}

// delete coupon 
const deleteCoupon = async (req,res)=>{
    try{
        await Coupon.deleteOne({_id:req.query.id})
        const coupons = await Coupon.find({});
        const offers = await offer.find({});
        res.render("offerandcop-3",{coupons,message:"deleted",offers})
    }catch(error){
        console.log(error)
    }
}

// edit coupon 
const editCoupon = async (req,res)=>{
    try{

       const coupon = await Coupon.findOne({_id:req.query.id})
       res.render("edit-coupon-3 ",{coupon})

    }catch(error){
        console.log(error)
    }
}

// edit save coupon
const editCouponSave = async (req, res) => {
    try {
        const id = req.body.ID;
        const updateFields = {};

        const keys = Object.keys(req.body);
       for (let i = 0; i < keys.length; i++) {
         const key = keys[i];
         if (key !== 'ID') {
        updateFields[key] = req.body[key];
           }
                }
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateFields, { new: true });

        if (updatedCoupon) {
            const coupons = await Coupon.find({});
            const offers = await offer.find({});
            res.render("offerandcop-3", { coupons ,offers });
        } else {
            res.render("offerandcop-3", { message: "Failed to update coupon" });
        }
    } catch (error) {
        console.log(error);
    }
};


const filterOrders = async (req,res)=>{
    try{

        const filterType = req.body.filterType;
        const filterValue  = req.body.filterValue;
        const data  = req.body.data     

        let filteredOrders = data;
    
        if(filterType === 'Category'){
            filteredOrders = filteredOrders.filter(order => order.category === filterValue);


        } else if (filterType === 'Date'){
            filteredOrders = filteredOrders.filter(order => {
                const filterDate = new Date(filterValue);
                const orderDate = new Date(order.OrdrDate);
                return orderDate.getFullYear() === filterDate.getFullYear() && orderDate.getMonth() === filterDate.getMonth() && orderDate.getDate() === filterDate.getDate();
            });
            

        } else if (filterType === 'Status'){
            filteredOrders = filteredOrders.filter(order => order.paymentStatus.toLowerCase() === filterValue.toLowerCase());


        } else if (filterType === 'Filter By'){
            const now = new Date();
            if (filterValue === 'Week') {
                const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
                filteredOrders = filteredOrders.filter(order => new Date(order.OrdrDate) >= oneWeekAgo);
            } else if (filterValue === 'Month'){
                const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
                filteredOrders = filteredOrders.filter(order => new Date(order.OrdrDate) >= oneMonthAgo);
            } else if (filterValue === 'Today'){
                filteredOrders = filteredOrders.filter(order => new Date(order.OrdrDate).toDateString() === new Date().toDateString());
            }


        } else if (filterType === 'Payment Method'){
            let v ;
             if(filterValue == "COD"){
                v="CashOnDelivery"
             }else if(filterValue == "Online"){
                v="Razorpay"
             }else{
                v="wallet"
             }
            filteredOrders = filteredOrders.filter(order => order.paymentMethod.toLowerCase() === v.toLowerCase());
        }

        if(filteredOrders.length === 0){
            res.send({NoData:data});
        }else{
            res.send(filteredOrders);
        }
    
    }catch(error){
        console.log(error)
    }
}

// pdf export
const pdfEx = async (req, res) => {
    try {
        const productNumber = await productData.countDocuments({});
        const userNumber = await userData.countDocuments({});
        const orderNumbers = await order.find({});
        
        let totalItems = 0;
        for (let order of orderNumbers) {
            totalItems += order.items.length;
        }

        const orders = [];
        const allOrders = await order.find({}).sort({ _id: -1 });
        allOrders.forEach((data) => {
            data.items.forEach((item) => {
                let paymentStatus = item.paymentStatus ? 'Paid' : 'Not Paid';
                orders.push({
                    user: data.userID,
                    ID: item._id,
                    paymentMethod: item.paymentMethod,
                    category: item.item.category,
                    paymentStatus,
                    productName: item.item.productTitle,
                    image: item.item.image[0],
                    OrdrDate: item.Dates.ordered,
                    Status: item.status,
                    Total: item.cash,
                    name: item.address.name
                });
            });
        });

        const userDataList = await userData.find({}).sort({ _id: -1 });

        const datas = {
            ProductCount: productNumber,
            userCount: userNumber,
            orders,
            userData: userDataList,
            totalItems
        };

        const filePath = path.resolve(__dirname, "../View/Admin/pdf.ejs");
        const htmlToString = fs.readFileSync(filePath, 'utf-8');
        const ejData = ejs.render(htmlToString, datas);

        const options = {
            format: 'Letter'
        };

        htmlPdf.create(ejData, options).toFile("SalesReport.pdf", (err, response) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Failed to generate PDF");
            }
            const file = path.resolve(__dirname, "../SalesReport.pdf");
            fs.readFile(file, (err, data) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Failed to read PDF file");
                }
                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", 'attachment; filename="SalesReport.pdf"');
                res.send(data);
            });
        });

    } catch (error) {
        console.error(error);
    }
};

// create offer 
const createOffer = async (req, res) => {
       
        try {
            const { offerName, discountPercentage, description, startDate, expiryDate } = req.body;
            const discount = parseFloat(discountPercentage);

            const newOffer = new offer({
                name: offerName,
                description: description,
                discount: discount,
                startDate: startDate,
                endDate: expiryDate
            });
    
            
            await newOffer.save();
    
           res.send({Done:"Done"})
            
        } catch (error) {
            console.error(error);
        }
    };

// edit offer
const editOffer = async (req,res)=>{
    try{
        const offers = await offer.findOne({_id:req.query.id})
        res.render("edit-offer-3",{offers})
    }catch(error){
        console.log(error)
    }
}

// Delete offer
const deleteOffer = async (req,res)=>{
    try{
        await offer.deleteOne({_id:req.query.id})
        const offers = await offer.find({});
        const coupons = await Coupon.find({});
        res.render("offerandcop-3",{coupons,message:"deleted",offers})
    }catch(error){
        console.log(error)
    }
}

// edit save offer 
const editOfferSave = async (req, res) => {
    try {
        const { id, name, discount, description, startDate, endDate } = req.body;

        const updateFields = {
            name,
            discount,
            description,
            startDate,
            endDate
        };
        console.log("Received id:", updateFields);

        const objectId = new Types.ObjectId(id);

        const updatedOffer = await offer.findByIdAndUpdate(objectId, updateFields, { new: true });

        if (updatedOffer) {
            res.send({ Done: "Done" });
        } else {
            res.send({ NotDone: "failed" });
        }
    } catch (error) {
        console.error(error);
    }
};

// offer applying loading
const OffApply = async (req,res)=>{
    try{

        const productData = await product.find({
            $or: [
                { OffPrice: { $exists: false } },
                { OffPrice: { $eq: 0 } }
            ]
        });
         let offerID = req.query.id
         
         res.render("applyOffer",{productData,offerID})
    }catch(error){
        console.log(error)
    }
}

// offer apply 
const apply = async (req,res)=>{
    try{
           await offer.updateOne({_id:req.query.offerID},{$set:{offProduct:req.query.id}})

           const offerInfo = await offer.findOne({_id:req.query.offerID})
           const productInfo = await product.findOne({_id:req.query.id})

           let offerPercentage = offerInfo.discount;
           let actualPrice = productInfo.price;
          
           await offer.updateOne({_id:req.query.offerID},{$push: { offProduct: productInfo._id }})

           const discountDecimal = offerPercentage / 100;
           const discountAmount = actualPrice * discountDecimal;
           const finalPrice = parseInt(actualPrice - discountAmount); 
    
 
           const updatedProduct = await product.updateOne({ _id: req.query.id },{ $set:{OffPrice:finalPrice}});
           
               if(updatedProduct){
                const productData = await product.find({
                    $or: [
                        { OffPrice: { $exists: false } },
                        { OffPrice: { $eq: 0 } }
                    ]
                });
                let offerID = req.query.offerID
                res.render("applyOffer",{productData,offerID,message:"Done"})
               }else{
                const productData = await product.find({
                    $or: [
                        { OffPrice: { $exists: false } },
                        { OffPrice: { $eq: 0 } }
                    ]
                });
                let offerID = req.query.id
                res.render("applyOffer",{productData,offerID,failed:"failed"})
               }

    }catch(error){
        console.log(error)
    }
}

// remove offer  
const remove = async (req,res)=>{
    try{

    }catch(error){
        console.log(error)
    }
}

// current product 
const current = async (req,res)=>{
    try{
        let offerID = req.query.offerID
        const productData = await product.find({
            OffPrice: { $exists: true, $gt: 0 }
        });
        let dataOFoffer = await offer.findOne({_id:offerID})

        console.log(dataOFoffer)

        //   res.render("current",{productData,offerID})
        
    }catch(error){
        console.log(error)
    }
}

module.exports={
    loadDash,
    Product,
    Order,
    users,
    reviews,
    transactions,
    category,
    loadAddproduct,
    logout,
    addoffer,
    addcoupon, 
    offAndcop,
    adminLogin,
    loginVerify,
    blockUnblockUser,
    addProduct,
    deleteProduct,
    editProduct,
    updateProduct,
    logout,
    newCategory,
    deleteCategory,
    editCategory,
    editCategoryLoad,
    viewOrder,
    statusChange,
    addCoupon,
    deleteCoupon,
    editCoupon,
    editCouponSave,
    filterOrders,
    pdfEx,
    createOffer,
    editOffer,
    deleteOffer,
    editOfferSave,
    OffApply,
    apply,
    remove,
    current
}