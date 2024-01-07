const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email:String,
    username:String,
    password:String
},{
    versionKey : false
})

const User = mongoose.model('users',userSchema);

module.exports = User;