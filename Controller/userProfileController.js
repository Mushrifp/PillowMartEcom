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

    const Data = []
    for(let i=0;i<addressData.userAddress.length;i++){
      Data.push(addressData.userAddress[i])
    }

    res.render("address",{Data});
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
        const user = await userData.findOne({ _id:req.session.user_id});
        if (!user) {
             res.status(404).send("User not found");
        }


        if(req.body.name && req.body.name !== user.name){
            const existingName = await userData.findOne({name:req.body.name});
            if (existingName) {
                 res.render("profile",{message:"This name is already in use",user});
            }
            await userData.findOneAndUpdate({ _id:req.session.user_id},{$set:{name:req.body.name}}
            );
            user.name = req.body.name;
        }

        if(req.body.email && req.body.email !== user.email){
            const existingEmail = await userData.findOne({email:req.body.email});
            if (existingEmail) {
                return res.render("profile",{message:"This email is already in use",user});
            }
            await userData.findOneAndUpdate({_id:req.session.user_id},{$set:{email:req.body.email}});
            user.email = req.body.email;
        }

        if (req.body.mobile && req.body.mobile !== user.mobile){
            await userData.findOneAndUpdate({_id:req.session.user_id},{$set:{mobile:req.body.mobile}});
            user.mobile = req.body.mobile;
        }

        res.render("profile",{message:"Profile updated successfully",user});
        console.log("Profile data updated successfully");
    } catch (error) {
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

  const Data={
      name: req.body.name,
      Bname: req.body.Bname,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      town: req.body.town,
      pincode: req.body.pincode
  }

  const existingAddress = await address.findOne({UserID:req.session.user_id,userAddress:{$elemMatch:{Bname:req.body.Bname}}})

    if(existingAddress){
      res.render("addAddress",{message:"ALready exits Type",Data})
    }else{
   
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
