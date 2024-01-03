const express = require('express');

const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();


const key="guts";
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    user:'root',
    password:'password',
    database:'quantify',
    host:'localhost',
    port:'3306'
})

app.listen(6969 , ()=>{
    console.log("backend up on port 6969");
})



app.get("/" , (req,res)=>{
    return res.json("home page");
})


//fetch food entries
app.get("/food",(req,res)=>{
    const q="SELECT * FROM food WHERE DATE(logged_at) = CURDATE()";

    db.query(q,(err,data)=>{
        if(err){
            return res.json(err);
        }
        else{
            return res.json(data);
        }
    })
})


//inserting new food data 
app.post("/food",(req,res)=>{
    const {name,calories,protein} = req.body;
    
    const userFinder = "SELECT * FROM users WHERE email = ?";
    let userid;
    db.query(userFinder,[req.data.email] , (err,data)=>{
        if(err){
            console.log(err);
        }
        else{
            userid=data.userid;
            console.log(userid);
        }
    })

    const q="INSERT INTO food (userid,name,calories,protein) VALUES (?,?,?,?)";
    
    db.query(q,[userid,name,calories,protein],(err,data)=>{
        if(err){
            res.json(err);
        }
        else{
            res.json("succesfully inserted data");
        }
    })
})



//regitration 
app.post("/user" , async (req,res) =>{
    let {username , password , email} = req.body;
    console.log("password being hashed: " + password);
    let password1 = await bcrypt.hash(password,10);
    const q = "INSERT INTO users (username,password,email) VALUES (?,?,?)";

    db.query(q,[username,password1,email] , (err,data) =>{
        if(err){
            res.json(err);
        }
        else{
            res.json("inserted new user");
        }
    })
})


//login authentication
app.post("/login",(req,res)=>{
    const token = jwt.sign(req.body.email , key);
    let dataTobeSent = {
        token:'',
        userid:null,
        message:''
    }
    console.log("entered password:"+req.body.password);
    console.log("entered email:"+req.body.email);

    const query = "SELECT * FROM users WHERE email = (?)";
    
    
    db.query(query,[req.body.email], async (err,data)=>{
        if(err){
            res.json({
                message:err.code,
                token:null
            });
        }
        else{
            if(data.length > 0){
                console.log("password in db " + data[0].password);
                console.log("comparing db stored hashed pass and " + req.body.password);
                const isPassValid = await bcrypt.compare(req.body.password , data[0].password);

                console.log("comparision result:" , isPassValid);

                if(isPassValid)
                {
                    dataTobeSent.token=token;
                    dataTobeSent.message = "welcome "+ data[0].username;
                    res.json(dataTobeSent);
                }
                else{
                    dataTobeSent.token=null;
                    dataTobeSent.message = "wrong password";
                    res.json(dataTobeSent);
                }
            }
            else{
                dataTobeSent.token=null;
                dataTobeSent.message = "user does'nt exist";
                res.json(dataTobeSent);
            }
        }
    })
})