const mongoose = require('mongoose');

let currentDate = new Date();
currentDate.setHours(0,0,0,0);

const foodSchema = mongoose.Schema({
    email : String,
    name : String,
    calories:Number,
    protein : Number,
    logged_at: {type:Date , default : currentDate}
},{
  versionKey :false  
})

const foodModel = mongoose.model('food' , foodSchema); 

module.exports = foodModel;