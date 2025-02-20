var express = require('express');

var app = express();

var dgram = require('dgram');
var server = dgram.createSocket('udp6');
const sqlite3 = require('sqlite3').verbose();
var ts = Date.now();

var message = "";
var lat = "",lon = "";

var db = new sqlite3.Database('aerophilia.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
        if (err) {
            console.error("error " + err.message);
        }
        console.log('Connected to the aerophilia database.');
    });

try {
    db.run('CREATE TABLE IF NOT EXISTS data(timestamp,value)');
} catch (e) {

}

server.on('message', (msg, rinfo) => {
    //console.log("hello boo");
    message = msg;
    var sample = message.split(",");
    lat = sample[2];
    console.log("latitude " + lat);
    lon = sample[4];
    console.log("latitude " + lon);
    db.run(`INSERT INTO data(timestamp,value) VALUES(?,?)`, [ts, msg], function (err) {
        if (err) {
            console.log(err);
        }
        console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    });
});

server.on('listening', () => {
    const address = server.address();
    console.log(`server listening ${address.address}:${address.port}`);
});

server.on('error', (err) => {
    console.log(`server error:\n${err.stack}`);
    server.close();
});

//app.set('port', 80);
server.bind(13000);

//parsing data from body
// var bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({
//     extended: true
// }));

//setup view engine as ejs
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', function (req, res) {

    // message = ;

    res.render('index.html',{lat:lat,lon:lon});
});

app.listen(80, function () { 
    console.log("server is running at localhost:80");
})
