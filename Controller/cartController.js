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
                 for(let i=0;i<cartDat.product.length;i++){
                    const productdata = await productData.findOne({_id:arrayOfID[i][i-i]})
                    carts.push(productdata)
                 }
  
                res.render("cart",{userData:userSession,carts})
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

                     if(cartDB){
                          const newCarts = [req.query.id,0]
                              const done =  await cart.findOneAndUpdate({user:req.session.user_id},{$addToSet:{product:newCarts}})
                              done ? res.send({added:"Added"}) : res.send({failed:"Not Added"})
                     }else{

                         const NewCart = new cart ({
                              user:req.session.user_id,
                              product:[req.query.id,0]
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
       const done =  await cart.findOneAndUpdate({user:req.session.user_id},{$pull:{product:{$elemMatch:{$eq:req.query.id}}}})
       if(done){
           const cartDat = await cart.findOne({user:req.session.user_id})
           const arrayOfID = cartDat.product
           let carts = []
            for(let i=0;i<cartDat.product.length;i++){
               const productdata = await productData.findOne({_id:arrayOfID[i][i-i]})
               carts.push(productdata)
            }
           res.redirect("/cart/cart")
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

module.exports = {
    loadCart,
    addCart,
    cartDelete,
    loadWish,
    addWish,
    wishDelete
}