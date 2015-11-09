/**
 * Created by ShrimpTang on 2015/11/9.
 */
var express = require('express');
var faker = require('faker');
var cors = require('cors');
var bodyParser = require('body-parser');
var jwt = require("jsonwebtoken");
var expressJwt = require("express-jwt");
var user = {
    username: '11',
    password: '11'
};

var jwtSecret = 'klgrfgvre//gervgfvgr/gbvcze23d/ooo'
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(expressJwt({
    secret: jwtSecret
}).unless({path: ['/login']}));
app.get('/random-user', function (req, res) {
    console.info(req.user);
    var user = faker.helpers.userCard();
    user.avatar = faker.image.avatar();
    res.json(user);
});

app.post('/login', authenticate, function (req, res) {
    var token = jwt.sign({
        username: user.username
    }, jwtSecret);
    res.send({
        token: token,
        user: user
    });
    //res.send(user);
});

app.get('/me', function (req, res) {
    res.send(req.user);
});
app.listen(3000, function () {
    console.log(' App running on localhost:3000');
});


function authenticate(req, res, next) {
    var body = req.body;
    if (!body.username || !body.password) {
        res.status(400).end('不能为空');
    }
    if (body.username !== user.username || body.password !== user.password) {
        res.status(401).end('用户名或密码错误');
    }
    next();
}