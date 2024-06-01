const mongoose = require('mongoose')

const order = new mongoose.Schema({

    userID:{
        type:String,
        required:true
    },
    items:[{
        item:{
            type:Object,
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        cash:{
            type:Number,
            required:true
        },
        Dates:{
            ordered:{
                type:Date,
                required:true
            },
            delivery:{
                type:Date,
                required:true
            }
        },
        status:{
            type:String,
            required:true,
            default:"Pending"
        },
        address:{
            type:Object,
            required:true
        },    
    }],
    total:{
        type:Number,
        required:true                                                           
    },
    paymentMethod:{
        type:String,
        required:true 
    },
    totalStatus:{
        type:String,
        required:true,
        default:"Pending"
    }

})

module.exports = mongoose.model("order",order)