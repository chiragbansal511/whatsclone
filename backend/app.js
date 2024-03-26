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

async function sendmessage(receiver, message, sender, res, name, messagetype, messagefor) {
    try {
        const response = await client.db(dbName).collection("account").findOne({ email: receiver });
        if (response == null) {
            res.json("user doesn't exist");
            console.log("1");
        }

        else if (response.socketid == "offline") {
            const response = await client.db(dbName).collection(receiver).insertOne({ sender: sender, message: message, name: name, messagetype: messagetype, messagefor: messagefor , type : "message"});
        }

        else {

            const data = {
                sender: sender,
                message: message,
                name: name,
                messagetype: messagetype,
                messagefor: messagefor
            }
            io.to(response.socketid).emit("message", data);
        }
    }

    catch (error) {
        res.json("error");
        console.log("errorororo", error)
    }

}

app.get("/auth", authenticateToken, (req, res) => {
    res.json("1");
})

app.post(('/login/getopt'), async (req, res) => {

    const response = await client.db(dbName).collection("account").findOne({ email: req.body.email });
    if (response == null) {
        res.json("use not found");
    }

    else {
        const otp = Math.floor(100000 + Math.random() * 900000);

        try {
            const response = await client.db(dbName).collection("OPTS").insertOne({ email: req.body.email, otp: otp });
            // add email send code 
            res.json("opt send");
        } catch (error) {
            res.json("error");
        }
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


app.post(("/signup/verifyopt"), async (req, res) => {

    try {
        const opt = await client.db(dbName).collection("OPTS").findOne({ email: req.body.email });

        if (opt.otp == req.body.opt) {
            let response = await client.db(dbName).collection("OPTS").deleteOne({ email: req.body.email });
            const accessToken = jwt.sign({ email: req.body.email }, secretKey);
            response = await client.db(dbName).collection("account").insertOne({ email: req.body.email, profilephoto: req.body.profilephoto, socketid: "offline" });
            res.json({ accessToken: accessToken });
        }

        else {
            res.json("not verified");
        }
    } catch (error) {
        res.json("eror");
    }
});

app.post(("/profilephoto"), authenticateToken, async (req, res) => {
    console.log(req.body.email);
    try {
        let response = "";
        req.body.messagefor != "group" ? response = await client.db(dbName).collection("account").findOne({ email: req.body.email }) : response = await client.db(dbName).collection("group").findOne({ name: req.body.email });
        res.json({ profilephoto: response.profilephoto });

    } catch (error) {
        res.json("error");
    }
})


app.post(('/setsocketid'), authenticateToken, async (req, res) => {

    try {
        const response = await client.db(dbName).collection("account").updateOne({ email: jwt.decode(req.token).email }, { $set: { email: jwt.decode(req.token).email, socketid: req.body.socketid } });
        res.json("id set");
    } catch (error) {
        res.json("error");
    }
})

app.post(("/message"), authenticateToken, async (req, res) => {

    if (req.body.messagefor != "group") {
        sendmessage(req.body.receiver, req.body.message, jwt.decode(req.token).email, res, jwt.decode(req.token).email, req.body.messagetype, "individual");
    }

    else {
        const response = await client.db(dbName).collection('group').findOne({ name: req.body.receiver });

        response.members.forEach(element => {
            if (element.sender != jwt.decode(req.token).email)
                sendmessage(element.sender, req.body.message, response.name, res, jwt.decode(req.token).email, req.body.messagetype, "group");
        });

        if (response.admin != jwt.decode(req.token).email)
            sendmessage(response.admin, req.body.message, response.name, res, jwt.decode(req.token).email, req.body.messagetype, "group")
    }

    res.json("send");
})


app.get("/getmessage", authenticateToken, async (req, res) => {

    try {
        const response = await client.db(dbName).collection(jwt.decode(req.token).email).find({ type : "message"}).toArray();
        await client.db(dbName).collection(jwt.decode(req.token).email).deleteMany({});
        res.json(response);
    } catch (error) {
        res.json("error");
    }
})

app.post(("/group"), authenticateToken, async (req, res) => {
    const group = {
        admin: jwt.decode(req.token).email,
        name: req.body.name,
        members: req.body.members,
        mode: "send",
        profilephoto: req.body.profilephoto
    }

    try {
        const response = await client.db(dbName).collection("group").insertOne(group);

        group.members.forEach(element => {
            console.log(element);
            sendmessage(element.sender, `Hey come in my Group ${group.name}`, group.name, res, group.admin, "text", "group")
            console.log("hello");
        });
        sendmessage(group.admin, `You are group Admin of ${group.name}`, group.name, res, "Whatsapp", "text", "group");
        console.log("hello world");
        res.json("maked");
    } catch (error) {
        res.json(error);
    }
});

app.post(("/status"), authenticateToken, (req, res) => {

    const status = {
        type: "status",
        message : req.body.message,

    }

})

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

io.on('connection', (socket) => {
    console.log('A new client connected: ' + socket.id);

    socket.on('disconnect', async () => {
        try {
            const email = await client.db(dbName).collection("account").findOne({ socketid: socket.id });
            const response = await client.db(dbName).collection("account").updateOne({ socketid: socket.id }, { $set: { email: email.email, socketid: "offline" } });
            console.log(`disconnect socket ${socket.id}`);
        } catch (error) {

        }
    });
});