const express = require("express")
var https = require('https');
var fs = require('fs');
var path = require('path');
const app = express()
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const port = '8000'
const doctorRouter = require('./routes/doctor')
const patientRouter = require('./routes/patient')
const ws = require("nodejs-websocket")
const daily_news_script = require('./script/daily_news_script')
const wsPort = '8001'

// app.all('*',function(req, res){
//     console.log("*")
//     res.setHeader("Access-Control-Allow-Origin", "*")
// })
// console.log(process.env.MYSQL_PASSWORD)
app.options('*',function(req,res){
    res.setHeader("Access-Control-Allow-Origin","*")
    res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.setHeader("Access-Control-Expose-Headers", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    console.log(req.url+' options')
    res.end(req.url+' options')
})
app.use(function(req, res, next){
    res.setHeader("Access-Control-Allow-Origin", "*")
    // res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-with, Content-Type, Accept")
    res.setHeader("Content-Type", "application/json; charset=utf-8")
    next()
})
app.use(express.json({limit: '500mb'}));
app.use(express.urlencoded({limit: '500mb'}))
app.use(bodyParser.urlencoded({extended: false}))
app.use(jsonParser)
app.post("/", function(req, res){
    console.log("1")
    res.send("helloworld")
})
app.get("/", function(req, res){
    console.log("2")
    res.send("<p>helloworld</p>")
    res.end()
})
app.use('/doctor', doctorRouter)
app.use('/patient', patientRouter)
app.listen(port, '0.0.0.0', function(){
    console.log("listen port:", port)
})


let clientCount = 0;
const server = ws.createServer(function(conn) {
    console.log("New connection")
    clientCount++;
    conn.nickname = 'user' + clientCount;
    let mes = {}
    mes.type = "enter";
    mes.data = conn.nickname + ' comes in'
    broadcast(JSON.stringify(mes));
    conn.on("text", function(str) {
        console.log("Received " + str);
        let mes = {};
        mes.type = "message";
        mes.data = conn.nickname + ' says: ' + str;
        broadcast(JSON.stringify(mes));
    })
    conn.on("close", function(code, reason) {
        console.log("Connection closed");
        let mes = {};
        mes.type = "leave";
        mes.data = conn.nickname + ' left'
        broadcast(JSON.stringify(mes));
    })
    conn.on("error", function(err) {
        console.log("handle err");
        console.log(err);
    })
})
server.listen(wsPort)

function broadcast(str) {
    server.connections.forEach(function(connection) {
        connection.sendText(str);
    })
}
// var privateCrt = fs.readFileSync(path.join(process.cwd(), 'ylsh.top_bundle.pem'), 'utf8');
// var privateKey = fs.readFileSync(path.join(process.cwd(), 'ylsh.top.key'), 'utf8');
// const HTTPS_OPTOIN = {
//   key: privateKey,
//   cert: privateCrt
// };
// const SSL_PORT = 8002
// const httpsServer = https.createServer(HTTPS_OPTOIN, app);
// httpsServer.listen(SSL_PORT, () => {
//   console.log(`HTTPS Server is running on: port:${SSL_PORT}`);
// });

daily_news_script()