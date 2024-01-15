const express = require('express');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

//mongoose connection setup
const mongoose = require('mongoose');

const URI = "mongodb+srv://dasu:guts100k@cluster0.y4xtr77.mongodb.net/quantify?retryWrites=true&w=majority";

mongoose.connect(URI, {
    useNewUrlParser : true,
    useUnifiedTopology : true
}).then(()=>{
    console.log("successfully connected to mongodb");
}).catch((err)=>{
    console.log(err);
})

const foodModel = require('./Food');
const User = require('./User');
const key="guts";


const mongodb = mongoose.connection;


app.listen(6969 , ()=>{
    console.log("backend up on port 6969");
})





app.get("/" , (req,res)=>{
    return res.json("home page");
})




//fetch food entries
app.get("/food",async (req,res)=>{
    const tokenRaw = req.headers.authorization;
    const [,token] = tokenRaw.split(' ');
    const emailFromToken = jwt.verify(token , key);
    let date = new Date();
    date.setHours(0,0,0,0);
    try{
        const foodData = await foodModel.find({
            email : emailFromToken,
            logged_at: date
        })
        res.json(foodData);
    }catch(err){
        res.json(err);
    }
})


//inserting new food data 
app.post("/food",(req,res)=>{
    const {name,calories,protein} = req.body;
    const tokenRaw = req.header('Authorization');
    if(!tokenRaw){
        return res.json("Unauthorized");
    }

    [,token] = tokenRaw.split(' ');

    const tokenData = jwt.verify(token,key);
    try{
        const newFood = new foodModel({
            email:tokenData,
            name:name,
            calories:calories,
            protein:protein
        })
        const response = newFood.save();
        return res.json("saved data" + response);
    }catch(err){
        return res.json(err);
    }
    
})


//regitration 
app.post("/user" , async (req,res) =>{
    let {username , password , email} = req.body;
    try{
        password = await bcrypt.hash(password,10);
        const newUser = new User({
            email:email,
            username:username,
            password:password
        });
        
        if(User.find({email:email}).length < 1)
        {
            const response = newUser.save();
            res.json("saved new user " + response);
        }
        else{
            res.json("email already exists");
        }
        
        
    }catch(err){
        console.log(err);
    }
})

//fetch the user details
app.get('/user' ,async (req,res)=>{
    let token = req.headers.authorization;
    [,token] = token.split(' ');
    
    
    try{
        const email = jwt.verify(token , key);
        let user = await User.find({
            email:email
        })
        if(user)
        {
            user.password='yourmom';
            res.json(user);
        }
            
    }catch(err){
        res.json(err);
        console.log(err);
    }
})

//login authentication
app.post("/login",async(req,res)=>{
    const token = jwt.sign(req.body.email , key);
     
    //console.log("entered password:"+req.body.password);
    //console.log("entered email:"+req.body.email);

    try{
        const users = await User.find({
            email : req.body.email,
        });

        if(users.length > 0){
            //console.log("all the users with given email:" + users);
            if(bcrypt.compareSync(req.body.password,users[0].password)){
                return res.json({
                    token:token,
                    message:"succesfully logged in",
                    username:users[0].username
                });
            }
            return res.json({
                message:"password wrong"
            });
        }
        else{
            return res.json({
                message:"No user found"
            });
        }
    }catch(err){
        console.log(err);
    }
})