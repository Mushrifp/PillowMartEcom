const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({   
    productTitle:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    offPrice:{
        type:Number,
        required:true,
        default:0
    },
    percentage:{
        type:Number,
        required:true,
        default:0
    },
    image:{ 
        type:[String],
        required:true
    },
    category:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        required:true 
    },
    size:{
        type:String,
        required:true
    }

})

module.exports = mongoose.model("productDB",productSchema)