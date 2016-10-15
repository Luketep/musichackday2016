var express = require('express');
var bodyParser = require('body-parser');

var Pusher = require('pusher');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var pusher = new Pusher({
    app_id: "259586",
    key: "fe7f64b7bbd141ad1df0",
    secret: "379094cf97257b76228f"
});

app.get('/test',function (req,res) {
    res.send("OK");
});

app.post('/pusher/auth', function (req, res) {
    var socketId = req.body.socket_id;
    var channel = req.body.channel_name;
    var auth = pusher.authenticate(socketId, channel);
    res.send(auth);
});

var port = process.env.PORT || 5000;
app.listen(port);