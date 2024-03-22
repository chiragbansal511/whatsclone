const express = require("express");
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');


const PORT = 80;
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server);
url = "mongodb://0.0.0.0:27017/";
const client = new MongoClient(url);
const secretKey = 'your_secret_key';
const dbName = 'whatsapp';
const saltRounds = 2;
app.use(bodyParser.json());


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
    }
});


function authenticateToken(req, res, next) {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.json('0').sendStatus(403);
        req.token = token;
        next();
    });
}


app.post(('/login/getopt'), async (req, res) => {

    const otp = Math.floor(100000 + Math.random() * 900000);

    try {
        const response = await client.db(dbName).collection("OPTS").insertOne({ email: req.body.email, otp: otp });
        // add email send code 
        res.json("opt send");
    } catch (error) {
        res.json("error");
    }

})


app.post("/login/verifyopt", async (req, res) => {

    try {
        const opt = await client.db(dbName).collection("OPTS").findOne({ email: req.body.email });

        if (opt.otp == req.body.opt) {
            let response = await client.db(dbName).collection("OPTS").deleteOne({ email: req.body.email });
            const accessToken = jwt.sign({ email: req.body.email }, secretKey);
            res.json({ accessToken: accessToken });
        }

        else {
            res.json("not verified");
        }
    } catch (error) {
        res.json("eror");
    }
})


app.post(('/signup/getopt'), async (req, res) => {

    const otp = Math.floor(100000 + Math.random() * 900000);

    try {
        const response = await client.db(dbName).collection("OPTS").insertOne({ email: req.body.email, otp: otp });
        // add email send code 
        res.json("opt send");
    } catch (error) {
        res.json("error");
    }
});


app.post(("/signup/verify"), async (req, res) => {

    try {
        const opt = await client.db(dbName).collection("OPTS").findOne({ email: req.body.email });

        if (opt.otp == req.body.opt) {
            let response = await client.db(dbName).collection("OPTS").deleteOne({ email: req.body.email });
            const accessToken = jwt.sign({ email: req.body.email }, secretKey);
            response = await client.db(dbName).collection("account").insertOne({ email: req.body.email, socketid: null });
            res.json({ accessToken: accessToken });
        }

        else {
            res.json("not verified");
        }
    } catch (error) {
        res.json("eror");
    }
});


app.post(('/setsocketid'), authenticateToken, async (req, res) => {

    try {
        const response = await client.db(dbName).collection("account").updateOne({ email: jwt.decode(req.token).email }, { $set: { email: jwt.decode(req.token).email, socketid: req.body.socketid } });
        res.json("id set");
    } catch (error) {
        res.json("error");
    }
})

app.post(("/message"), authenticateToken, async (req, res) => {
    
    try {

        const response = await client.db(dbName).collection("account").findOne({email : req.body.receiver});
        if(response == null)
        {
            res.json("user doesn't exist");
        }

        else if(response.socketid == "offline")
        {
            const response = await client.db(dbName).collection(req.body.receiver).insertOne({sender : jwt.decode(req.token).email , message : req.body.message});
            res.json("send");
        }

        else {
            
            const data = {
                sender : jwt.decode(req.token).email,
                message : req.body.message
            }

            io.to(response.socketid).emit("message" , data);
            res.json("send");
        }
    }
    
    catch (error) {
        res.json("error");
    }
})


app.get("/getmessage" , authenticateToken , async (req , res)=>{
 
    try {
        const response = await client.db(dbName).collection(jwt.decode(req.token).email).find({}).toArray();
        res.json(response);
    } catch (error) {
        res.json("error");
    }
})

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

io.on('connection', (socket) => {
    console.log('A new client connected: ' + socket.id);
});