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
const orderReturned = require("../Model/returnOrder")






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
console.log(req.body)
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

        let orders = [];

        const revenue = await order.aggregate([
            {$unwind: "$items"},{$match: {"items.paymentMethod": { $in: ["wallet", "razorpay"] }}},{ $group: {_id: null,totalRevenue: { $sum: "$items.cash" }}}])

        let totalRevenue = revenue[0].totalRevenue

        const latestUsers = await userData.find().sort({ _id: -1 }).limit(5)

        const latestProduct = await productData.find().sort({ _id: -1 }).limit(5)

        const topSellingProducts = await order.aggregate([
            { $unwind: "$items" },{
              $group: {
                _id: "$items.item.productTitle",
                totalQuantitySold: { $sum: "$items.quantity" },
                orderCount: { $sum: 1 },
                image: { $first: { $arrayElemAt: ["$items.item.image", 0] } }
              }},
            { $sort: { totalQuantitySold: -1 } },
            { $limit: 6 }])

        const topSellingCategories = await order.aggregate([
              { $unwind: "$items" },{ 
                $group: {
                  _id: "$items.item.category",
                  totalQuantitySold: { $sum: "$items.quantity" },
                  orderCount: { $sum: 1 }
                }
              },
              { $sort: { totalQuantitySold: -1 } },
              { $limit: 3 }]);


        res.render('dash',{
            ProductCount: productNumber,
            userCount: userNumber,
            number,
            orders,
            totalRevenue,
            latestUsers,
            latestProduct,
            topSellingProducts,
            topSellingCategories 
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

        const existingCategory = await categoryDB.findOne({name:req.body.name})
        const categoryData = await categoryDB.find({}) 
 
       if(!existingCategory){
                  const newCategory = new categoryDB ({
                      name:req.body.name,
                      description:req.body.description
                   })

                 const saving  = await newCategory.save();
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

// filter sales 
const filterSales  = async (req,res)=>{
    try{
             let selectedDate  = req.body.date

             let dataToSend = await SalesDatas();
    
         let filteredData = []
           
          for(let i=0;i<dataToSend.length;i++){
              if(dataToSend[i]._id.orderedDate == selectedDate){
                filteredData.push(dataToSend[i])
              }
          }

       if(filteredData.length == 0){
        res.render("sales",{selectedDate,message:"no data"})
       }else{
        res.render("sales",{salesData:filteredData,selectedDate})
       }
           
            
    }catch(error){
        console.log(error)
    }
}


const SalesDatas = async () => {
    try {
        let o = await order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: {
                        orderedDate: {
                            $dateToString: { format: "%Y-%m-%d", date: "$items.Dates.ordered" }
                        }
                    },
                    totalCount: { $sum: 1 },
                    totalRevenue: { $sum: '$items.cash' },
                    cod: {
                        $sum: {
                            $cond: [
                                { $eq: ["$items.paymentMethod", "CashOnDelivery"] },
                                1,
                                0
                            ]
                        }
                    },
                    wallet: {
                        $sum: {
                            $cond: [
                                { $eq: ["$items.paymentMethod", "wallet"] },
                                1,
                                0
                            ]
                        }
                    },
                    razorpay: {
                        $sum: {
                            $cond: [
                                { $eq: ["$items.paymentMethod", "Razorpay"] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { "_id.orderedDate": -1 } }
        ]);

        return o;
    } catch (error) {
        console.log(error);
    }
};


// filter based on month and today and week 
const filterSales2 = async (req,res)=>{
    try{
        let query = req.query.filterBy
       
        let dataToSend = await SalesDatas();

        let send = [];

        if (query == "Monthly") {

            let currentDate = new Date();
            let startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            let endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
            send = dataToSend.filter(item => {
                let itemDate = new Date(item._id.orderedDate);
                return itemDate >= startOfMonth && itemDate <= endOfMonth;
            });
        } else if (query == "Weekly") {

            let currentDate = new Date();
            let startOfWeek = new Date(currentDate);
            startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); 
        
            let endOfWeek = new Date(currentDate);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
        
            send = dataToSend.filter(item => {
                let itemDate = new Date(item._id.orderedDate);
                return itemDate >= startOfWeek && itemDate <= endOfWeek;
            });
        } else {

            let today = new Date();

            let todayFormatted = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        
            send = dataToSend.filter(item => item._id.orderedDate === todayFormatted);
        }

   if(send.length == 0){
    res.render("sales",{message:"no data"})
   }else{
    res.render("sales",{salesData:send,query})
   }

    }catch(error){
        console.log(error)
    }
}

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

// offer applying loading product
const OffApply = async (req,res)=>{
    try{

        const productData = await product.find({});
         let offerID = req.query.id
         let offerData = await offer.findOne({_id: offerID})
         res.render("applyOffer",{productData,offerID,offerData})
    }catch(error){
        console.log(error)
    }
}

// offer apply  product
const apply = async (req,res)=>{
    try{
           await offer.updateOne({},{$pull:{offItem:req.query.id}})
           await offer.updateOne({_id:req.query.offerID},{$push:{offItem:req.query.id}})

           const offerDetails = await offer.findOne({_id:req.query.offerID})
           const producDetails = await product.findOne({_id:req.query.id})

           let offerPercentage = offerDetails.discount;
           let actualPrice = producDetails.price;

           const discountDecimal = offerPercentage / 100;
           const discountAmount = actualPrice * discountDecimal;
           const finalPrice = parseInt(actualPrice - discountAmount); 
    
 
           const updatedProduct = await product.updateOne({ _id: req.query.id },{ $set:{offPrice:finalPrice, percentage:offerDetails.discount }});
           
               if(updatedProduct){
                       res.send({Done:"Done"})
               }else{
                           res.send({NotDone:"NotDone"})
               }

    }catch(error){
        console.log(error)
    }
}

// remove offer product 
const removeOfferProduct = async (req,res)=>{
    try{

            console.log(req.query)
          
      const productCategory = await product.findOne({_id:req.query.productdID})

    const categoryCheck = await categoryDB.findOne({name:productCategory.category})

        if(categoryCheck.offer != true){
            await offer.updateOne({_id:req.query.offer},{$pull:{offItem:req.query.productdID}})
             await product.updateOne({_id:req.query.productdID},{$set:{offPrice:0,percentage:0}})

                   res.send({Done:"done"})
             
        }else{

               let cateID =  categoryCheck.id;
               let offerInfos = await offer.find({offItem:cateID})
            
               const producDetails = await product.findOne({_id:req.query.productdID})
    
               let offerPercentage = offerInfos[0].discount;
               let actualPrice = producDetails.price;
    
               const discountDecimal = offerPercentage / 100;
               const discountAmount = actualPrice * discountDecimal;
               const finalPrice = parseInt(actualPrice - discountAmount);

            await product.updateOne({ _id: req.query.productdID },{ $set:{offPrice:finalPrice, percentage:offerInfos[0].discount }});
            await offer.updateOne({_id:req.query.offer},{$pull:{offItem:req.query.productdID}})

            res.send({Done:"done"})
        }

    }catch(error){
        console.log(error)
    }
} 

// current offer products
const currentofferProduct = async (req,res)=>{
    try{
        let offerID = req.query.offerID
        let offerIdArray = await offer.find({_id:offerID});

           let arrayID = offerIdArray[0].offItem;

              if(arrayID.length != 0){
           
                let productInfo = []

                   for(let i=0;i<arrayID.length;i++){

                         let offID = arrayID[i]

                         const products = await product.find({ _id: offID});

                        if(products.length != 0 ){
                            productInfo.push(products[0]) 
                        }

                   }

                   res.render("currentProductOffer",{productData:productInfo,offerID})

              }else{
                res.render("currentProductOffer",{message:false,offerID})
              }
        
    }catch(error){
        console.log(error)
    }
}

// Load sales page
const sales = async (req,res)=>{
    try {
        
        let dataToSend = await SalesDatas();

        res.render("sales",{salesData:dataToSend})
    
        
    } catch (error) {
        console.log(error);
    } 
}

// offer apply to category page load
const addOfferTOCategory = async (req,res)=>{
    try{
              const categoryData = await categoryDB.find({offer:{$eq:false}})   

            let offerID = req.query.id

            let offerData = await offer.findOne({_id:req.query.id})

              res.render("applyOfferCategory",{categoryData,offerID,offerData})

    }catch(error){  
        console.log(error)
    }
}

// add offer to category
const offApplyCategory = async (req,res)=>{
    try{
           
               const detailsCategory = await categoryDB.findOne({_id:req.query.id})
               let CategoryName  = detailsCategory.name;


    await offer.updateOne({_id:req.query.offerID},{$push:{offItem:req.query.id}})
    await categoryDB.updateOne({_id:req.query.id},{$set:{offer:true}})

    const offerDetails = await offer.findOne({_id:req.query.offerID})
    const producDetails = await product.find({category:CategoryName})

let done = false

    for(let i=0;i<producDetails.length;i++){

        let offerPercentage = offerDetails.discount;
        let actualPrice = producDetails[i].price;
    
        const discountDecimal = offerPercentage / 100;
        const discountAmount = actualPrice * discountDecimal;
        const finalPrice = parseInt(actualPrice - discountAmount); 
    
    
        const updatedProduct = await product.updateOne({ _id: producDetails[i]._id },{ $set:{offPrice:finalPrice,percentage:offerDetails.discount}});    
        
          if(updatedProduct){
            done=true
          }else{
            done=false
          }

    }
    
        if(done){
                res.send({Done:"Done"})
        }else{
            res.send({NotDone:"NotDone"})
        }


    }catch(error){
        console.log(error)
    }
}

// current offer in category
const currentOfferCategory = async (req,res)=>{
    try{
   

       let offerID = req.query.offerID
       let offerIdArray = await offer.find({_id:offerID});

          let arrayID = offerIdArray[0].offItem;

             if(arrayID.length != 0){
          
               let categoryInfo = []

                  for(let i=0;i<arrayID.length;i++){

                        let offID = arrayID[i]

                        const category = await categoryDB.find({ _id: offID});

                       if(category.length != 0 ){
                           categoryInfo.push(category[0]) 
                       }

                  }

                  res.render("currentOfferCategory",{categoryData:categoryInfo,offerID})

             }else{
               res.render("currentOfferCategory",{message:"NO Data",offerID})
             }

    }catch(error){
        console.log(error)
    }
}

// removing category offer
const removeOfferCategory  = async (req,res)=>{
    try{
               console.log(req.body)

               const detailsCategory = await categoryDB.findOne({_id:req.body.categoryID})
               let CategoryName  = detailsCategory.name;


    await offer.updateOne({_id:req.body.OfferID},{$pull:{offItem:req.body.categoryID}})
    await categoryDB.updateOne({_id:req.body.categoryID},{$set:{offer:false}})

    const producDetails = await product.find({category:CategoryName})

    for(let i=0;i<producDetails.length;i++){
     
        await product.updateOne({ _id: producDetails[i]._id },{ $set:{offPrice:0,percentage:0}});          

    }   

    res.send({respond:'done'})
               
               
    }catch(error){
        console.log(error)
    }
} 

// return order
const returnOrder = async (req, res) => {
    try {
        let done = await orderReturned.find({});

        let arr = [];

        for (let i = 0; i < done.length; i++) {
            let data = await order.findOne({ userID: done[i].userId, "items._id": done[i].orderId });

                    let ojj = {
                        title: data.items[0].item.productTitle,
                        price: data.items[0].item.price,
                        image1:data.items[0].item.image[0],
                        customer:data.items[0].address.name,
                        phone:data.items[0].address.phone,
                        orderDate:data.items[0].Dates.ordered,
                        deliveryDate:data.items[0].Dates.delivery,
                        paymentMethod:data.items[0].paymentMethod,
                        reason: done[i].reason 
                    };

                    arr.push(ojj);

        }

        console.log(arr);
        res.render("returnOrder", { orders: arr }); 
    } catch (error) {
        console.log(error);
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
    filterSales,
    filterSales2,
    createOffer,
    editOffer,
    deleteOffer,
    editOfferSave,
    OffApply,
    apply,
    removeOfferProduct,
    currentofferProduct,
    sales,
    offApplyCategory,
    addOfferTOCategory,
    currentOfferCategory,
    removeOfferCategory,
    returnOrder
}