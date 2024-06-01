const userData = require('../Model/userData');
const productData = require('../Model/product');
const hash = require('bcrypt');
const product = require("../Model/product")
const categoryDB  = require("../Model/category")
const order = require("../Model/order")
const mongoose = require('mongoose');




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

           if(adminEmail == req.body.email&&adminPass == req.body.password){
            req.session.admin_mail = {
                email:adminEmail
            }

            const productNumber = await productData.countDocuments({})
            const userNumber = await userData.countDocuments({})
             res.render("dash",{ProductCount:productNumber,userCount:userNumber})
            console.log("admin In")
           }else{
            res.render("account-login",{message:"Invalid email and password"})
           }

    } catch (error) {
        console.log(error)
    }
}


// Load Dashboard
const loadDash = async (req,res)=>{
     try {
        const productNumber = await productData.countDocuments({})
        const userNumber = await userData.countDocuments({})
        const orderNumber = await order.find({})
        let number = 0;
        for(let i=0;i<orderNumber.length;i++){
            number +=orderNumber[i].items.length
        }
         res.render("dash",{ProductCount:productNumber,userCount:userNumber,orderNumber})
        
     } catch (error) {
        console.log(error)
     }
}

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
            const options = {year:'numeric',month:'long',day:'numeric'};
            const delivery = singleData.Dates.delivery.toLocaleDateString('en-US',options); 
            const ordered = singleData.Dates.ordered.toLocaleDateString('en-US',options); 
              let obj = {
                user:Datas[i].userID,
                ID:singleData._id,
                orderDate:ordered,
                deliveryDate:delivery,
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
        const DataOfUser = await userData.find({})
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
         res.render("offerandcop-3")
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
        res.redirect('/admin/product')
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

        const objectId = new  mongoose.Types.ObjectId(req.query.id);
        let done = await order.findOne({userID:req.query.user,"items._id":objectId});

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
          quantity:done.items[0].quantity,
          name:done.items[0].address.name,
          Bname:done.items[0].address.Bname,
          phone:done.items[0].address.phone,
          email:done.items[0].address.email,
          address:done.items[0].address.address,
          town:done.items[0].address.town,
          pincode:done.items[0].address.pincode,
   
        }
         
        res.render("viewOrder",{obj})
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
    statusChange
}