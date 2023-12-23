const express = require('express');

const mysql = require('mysql');
const mongoose = require('mongoose');

const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json())

const db = mysql.createConnection({
    user:'sql12672428',
    password:'5g7NmZGHhR',
    database:'sql12672428',
    host:'sql12.freesqldatabase.com'
})

app.listen(6969 , ()=>{
    console.log("backend up on port 6969");
})

app.get("/" , (req,res)=>{
    return res.json("home page");
})

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

app.post("/food",(req,res)=>{
    const {name,calories,protein} = req.body;
    const q="INSERT INTO food (name,calories,protein) VALUES (?,?,?)";
    
    db.query(q,[name,calories,protein],(err,data)=>{
        if(err){
            res.json(err);
        }
        else{
            res.json("succesfully inserted data");
        }
    })
})


app.post("/foodMongo", async (req,res)=>{
    const data = req.body;
    try{
        await data.save();
    }
    catch(err){
        console.log(err);
    }
})

app.get("/foodMongo" ,(req,res) =>{
    const data = res.body;
    return data;
})