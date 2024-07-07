const userData = require('../Model/userData');
const wish = require("../Model/wish")
const productData = require("../Model/product")
const cart = require('../Model/cart')

// Load Cart
const loadCart = async (req, res) => {
    try {
        const userSession  = await userData.findOne({_id:req.session.user_id})

        if(userSession){ 
            const cartDat = await cart.findOne({user:req.session.user_id})

                if(cartDat&&cartDat.product&&cartDat.product.length != 0){

                    const arrayOfID = cartDat.product
                    let carts = []
                    let total = 0  

                 for(let i=0;i<arrayOfID.length;i++){

                    const productdata = await productData.findOne({_id:arrayOfID[i].id})
                    if(arrayOfID[i].id == productdata._id){

                        let offerCheck  = 0;

                        if(productdata.offPrice != 0){
                            offerCheck = productdata.offPrice
                        }else{
                            offerCheck = productdata.price
                        }

                        let tot  = offerCheck * arrayOfID[i].quantity

                        await cart.updateOne({ user: req.session.user_id, 'product.id': arrayOfID[i].id },{ $set: { 'product.$.total': tot } });

                        total+=arrayOfID[i].total


                      
                        let ob ={
                            productInfos:productdata,
                            quantity:arrayOfID[i].quantity,
                            total:arrayOfID[i].total
                        }
                        carts.push(ob)
                         
                    }
                    
                 }

                res.render("cart",{userData:userSession,carts,total})
                }else{
                res.render("cart",{userData:userSession,emptyCart:"empty"})
                }
    
        }else{
            res.render('cart')
        } 
    } catch(error){
        console.log(error)
    }
}

// Add Cart
const addCart = async (req,res)=>{
     try{ 
           if(req.session.user_id){
                     const cartDB = await cart.findOne({user:req.session.user_id})
               const pr = await  productData.findOne({_id:req.query.id})
               let price = 0;
               if(pr.offPrice != 0){
                price=pr.offPrice
               }else{
                price=pr.price
               }
                     if(cartDB){
                          const newCarts = {
                            id:req.query.id,
                            quantity:1,
                            total:price
                        }
                              const done =  await cart.findOneAndUpdate({user:req.session.user_id},{$addToSet:{product:newCarts}})
                              done ? res.send({added:"Added"}) : res.send({failed:"Not Added"})
                     }else{
                           
                              let h = {
                                  id:req.query.id,
                                  quantity:1,
                                  total:price
                              }
                         const NewCart = new cart ({
                              product:h
                         })
                       const done = await NewCart.save();
                        done ? res.send({added:"Added"}) : res.send({failed:"Not Added"})
                     }
            }else{       
               res.send({notAdded:"Not Added"})
            }
     }catch(error){
        console.log(error)
     }
}

// Remove the product from cart
const cartDelete = async (req,res)=>{
    try{
       const done =  await cart.findOneAndUpdate({user:req.session.user_id},{$pull:{product:{id:req.query.id}}})
       if(done){
        res.send({done:"done"})
       }
    }catch(error){
        console.log(error)
    }
}

// Load wishlist
const loadWish = async (req,res)=>{
    try {
        const userSession  = await userData.findOne({_id:req.session.user_id})

        if(userSession){ 
            const wishDat = await wish.findOne({user:req.session.user_id})

              if(wishDat&&wishDat.product&&wishDat.product.length != 0){
                  let wishlist = []
  
               for(let i=0;i<wishDat.product.length;i++){
                  const productdata = await productData.findOne({_id:wishDat.product[i]})
                  wishlist.push(productdata)
               }
               
              res.render("wishlist",{userData:userSession,wishlist})
              }else{
              res.render("wishlist",{userData:userSession,empty:"empty"})
              }

        }else{
            res.render('wishlist')
        }  
    } catch (error) {
        console.log(error)
    }
}

// Add to wishlist
const addWish = async (req,res)=>{
    try {

         if(req.session.user_id){
                  const wishDB = await wish.findOne({user:req.session.user_id})

                  if(wishDB){

                           const done =  await wish.findOneAndUpdate({user:req.session.user_id},{$addToSet:{product:req.query.id}})
                           done ? res.send({added:"Added"}) : res.send({failed:"Not Added"})
                  }else{

                      const NewWish = new wish ({
                           user:req.session.user_id,
                           product:[req.query.id]
                      })
                    const done = await NewWish.save();
                     done ? res.send({added:"Added"}) : res.send({failed:"Not Added"})
                  }
         }else{           
            res.send({notAdded:"Not Added"})
         }

        
    } catch (error) {
        console.log(error)
    }
}

// Remove the product from wish
const wishDelete = async (req,res)=>{
     try{
        const userSession  = await userData.findOne({_id:req.session.user_id})
        const done =  await wish.findOneAndUpdate({user:req.session.user_id},{$pull:{product:req.query.id}})
        if(done){
            const wishDat = await wish.findOne({user:req.session.user_id})
            let wishlist = []
             for(let i=0;i<wishDat.product.length;i++){
                const productdata = await productData.findOne({_id:wishDat.product[i]})
                wishlist.push(productdata)
             }
            res.render("wishlist",{userData:userSession,wishlist})
        }
     }catch(error){
         console.log(error)
     }
}

// cart quantity update
const qtyCart = async (req, res) => {
    try {

           if(req.body.action == 'increment'){
              const userCart = await cart.findOne({user:req.session.user_id});
              const matchingItem = userCart.product.find(item => item.id === req.body.id);

              if(matchingItem.quantity >= 10){
                res.send({maxIsTen:"max"})
              }else{
                         
                     const productInfo = await productData.findOne({_id:req.body.id})
                       
                     if(productInfo.stock > matchingItem.quantity ){
                       await cart.updateOne({ user: req.session.user_id, 'product.id': req.body.id },{ $inc: { 'product.$.quantity': 1 } });
                      let qytToSend = matchingItem.quantity + 1

               let originalPrice = 0;

                        if(productInfo.offPrice != 0){
                            originalPrice=productInfo.offPrice
                        }else{
                            originalPrice=productInfo.price
                        }

                        let tot = matchingItem.total + originalPrice

                        await cart.updateOne({ user: req.session.user_id, 'product.id': req.body.id },{ $set: { 'product.$.total': tot } });

                        const totArr = await cart.findOne({user:req.session.user_id})
                        
                          
                        let totSub = totArr.product.reduce((acc, item) => acc + item.total, 0);

                        let dataToSend={
                            qyt:qytToSend,
                            total:tot,
                            subtotal:totSub
                        }

                        res.send({dataToSend:dataToSend})
                        

                     }else{
                        res.send({max:"maxiQty"})
                  }  
              }
               
           }else{
            
            const userCart = await cart.findOne({user:req.session.user_id});
            const matchingItem = userCart.product.find(item => item.id === req.body.id);

            if(matchingItem.quantity <= 1){
              res.send({maxIsTen:"max"})
            }else{
                       
                   const productInfo = await productData.findOne({_id:req.body.id})
                     
                     await cart.updateOne({ user: req.session.user_id, 'product.id': req.body.id },{ $inc: { 'product.$.quantity': -1 } });
                    let qytToSend = matchingItem.quantity + -1

             let originalPrice = 0;

                      if(productInfo.offPrice != 0){
                          originalPrice=productInfo.offPrice
                      }else{
                          originalPrice=productInfo.price
                      }

                      let tot = matchingItem.total - originalPrice

                      await cart.updateOne({ user: req.session.user_id, 'product.id': req.body.id },{ $set: { 'product.$.total': tot } });

                      const totArr = await cart.findOne({user:req.session.user_id})
                      
                        
                      let totSub = totArr.product.reduce((acc, item) => acc + item.total, 0);

                      let dataToSend={
                          qyt:qytToSend,
                          total:tot,
                          subtotal:totSub
                      }

                      res.send({dataToSend:dataToSend})
                       
            }

              
           }

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};






            



module.exports = {
    loadCart,
    addCart,
    cartDelete,
    loadWish,
    addWish,
    wishDelete,
    qtyCart
}