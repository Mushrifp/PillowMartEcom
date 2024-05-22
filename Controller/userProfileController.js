const userData = require("../Model/userData");
const productData = require("../Model/product");
const hash = require("bcrypt");
const address = require("../Model/address")


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

// Load profile
const profile = async (req, res) => {
  try {
    const userDatas = await userData.findOne({ _id: req.session.user_id });
    console.log(userDatas);
    res.render("profile", { user: userDatas });
  } catch (error) {
    console.log(error);
  }
};

// Load password
const password = async (req, res) => {
  try {
    res.render("password");
  } catch (error) {
    console.log(error);
  }
};

// Load address
const LoadAddress = async (req, res) => {
  try {
    const addressData = await address.findOne({UserID:req.session.user_id})
    if(addressData){
    const Data = []
    for(let i=0;i<addressData.userAddress.length;i++){
      Data.push(addressData.userAddress[i])
    }
    res.render("address",{Data});
  }else{
    res.render("address",{NoData:"No Adress"});
  }
  } catch (error) {
    console.log(error);
  }
}

// Load order
const order = async (req, res) => {
  try {
    res.render("order");
  } catch (error) {
    console.log(error);
  }
};

//  Load wallet
const wallet = async (req, res) => {
  try {
    res.render("wallet");
  } catch (error) {
    console.log(error);
  }
};

// edit profile name and email and number
const profileEdit = async (req, res) => {
    try {
      const user = await userData.findOne({_id:req.session.user_id});
      if (!user) {
          res.status(404).send("User not found");
      }

      if (req.body.name&&req.body.name !== user.name){
        const existName = await userData.findOne({name:req.body.name});
        if(existName){
            res.render("profile",{message:"This name is already in use",user});
        }else{
          await userData.updateOne({_id:req.session.user_id},{$set:{name:req.body.name}})
          res.redirect("/user/profile")
        }
      }
  
      if(req.body.email&&req.body.email !== user.email){
        const existEmail = await userData.findOne({email:req.body.email});
        if(existEmail){
            res.render("profile",{message:"This email is already in use",user});
       }else{
         await userData.updateOne({_id:req.session.user_id},{$set:{email:req.body.email}})
         res.redirect("/user/profile")
        }
      }
      
      if (req.body.mobile&&req.body.mobile.length == 10) {
          const existMobile = await userData.findOne({mobile:req.body.mobile});
          if (existMobile) {
              res.render("profile",{message:"This phone number is already in use",user});
          }else{
            await userData.updateOne({_id:req.session.user_id},{$set:{mobile:req.body.mobile}})
            res.redirect("/user/profile")
          }
      }else{
          res.render("profile",{message:"Enter a valid NUmber",user});
      }

     
  
  } catch (error){
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
}; 

// profile password changing
const profilePasswordEdit = async (req,res)=>{
    try {

             let passwordCheck = await StrongPassword(req.body.new)

             if (passwordCheck) {

                 if (req.body.new == req.body.confirm){

                  const hPassword = await passwordHash(req.body.new); 

                  const done = await userData.updateOne({_id:req.session.user_id},{$set:{password:hPassword}})

                  if(done){
                     console.log("password changed");
                     res.render("password",{message:"Password Changed"})
                  }else{
                    console.log("password not changed");
                    res.render("password",{message:"Failed to Change Password"})
                  }

                 } else {
                     res.render("password", { message: "Retyped Password not matching", newpass:req.body.new,confirm:req.body.confirm })
                 }

             } else {
                 res.render("password", { message: "minimum of 8 characters,one uppercase ,lowercase letter one number, and one special character.", newpass:req.body.new,confirm:req.body.confirm })
             }

      
    } catch (error) {
        console.log(error)
    }
}  

// user Adding New Address
const addAddress = async (req,res)=>{
      try{ 
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let result = '';
        for (let i = 0; i < 7; i++) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

  const Data={
      Code:result,
      name: req.body.name,
      Bname: req.body.Bname,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      town: req.body.town,
      pincode: req.body.pincode
  } 
   
    if(req.body.phone.length != 10){
          res.render("addAddress",{message:"Enter Valid Number",Data})
    }

    if(req.body.pincode.length != 6){
      res.render("addAddress",{message:"Enter Valid pincode",Data})
    }

    const addressData = await address.findOne({UserID:req.session.user_id})
 
    if(addressData){
      const done =  await address.findOneAndUpdate({UserID:req.session.user_id},{$addToSet:{userAddress:Data}})
      if(done){
        res.render("addAddress",{message:"Created Successfully"})
     }else{
       res.render("addAddress",{message:"failed Try again "})
     }
    }else{
      const NewAddress = new address({
        UserID:req.session.user_id,
        userAddress:[Data]
        
      }) 
       const save = NewAddress.save();
       if(save){
        res.render("addAddress",{message:"Created Successfully"})
     }else{
       res.render("addAddress",{message:"failed Try again "})
     }
    }
      }catch(error){
        console.log(error)
      }
}

// load add address
const loadAddAddress = async (req,res)=>{
    try {
        res.render("addAddress")
    } catch (error) {
       console.log(error)
    }
}

// address remove
const removeAddress = async (req,res)=>{
    try{

      const done = await address.updateOne({UserID:req.session.user_id},{$pull:{userAddress:{Bname:req.query.name}}});
            if(done){
         const addressData = await address.findOne({UserID:req.session.user_id})

          const Data = []
          for(let i=0;i<addressData.userAddress.length;i++){
            Data.push(addressData.userAddress[i])
          }

          res.render("address",{Data});         
     }else{
      const addressData = await address.findOne({UserID:req.session.user_id})

      const Data = []
      for(let i=0;i<addressData.userAddress.length;i++){
        Data.push(addressData.userAddress[i])
      }

      res.render("address",{Data});     
     }

    }catch(error){
       console.log(error)
    }
}

const editAddress = async (req,res)=>{
   try{
    console.log(req.query.name)
    const addressData = await address.findOne({UserID:req.session.user_id,userAddress:{$elemMatch:{Bname:req.query.name}}})
    const addressDatas = await address.findOne({UserID:req.session.user_id})

    if(addressData){
      const Data = []
      for(let i=0;i<addressData.userAddress.length;i++){
        Data.push(addressData.userAddress[i])
      }

      res.render("editAddress",{Data}); 
    }else{
      const Data = []
      for(let i=0;i<addressDatas.userAddress.length;i++){
        Data.push(addressDatas.userAddress[i])
      }

      res.render("address",{Data}); 
      
    }
   }catch(error){
    console.log(error)
   }
}

module.exports = {
  profile,
  password,
  LoadAddress,
  order,
  wallet,
  profileEdit,
  profilePasswordEdit,
  addAddress,
  loadAddAddress,
  removeAddress,
  editAddress
};
