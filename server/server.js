require('rootpath')();
var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var config = require('config.json');
var MongoClient = require('mongodb').MongoClient;

var database;


 MongoClient.connect("mongodb://acube:danDaniel@ds127802.mlab.com:27802/gachatt", function(err, db){
   if(!err){
           console.log("gachatt server is connected");
    }
    else{
        console.log(err);
    }
  database=db;
  

});
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());




// use JWT auth to secure the api
// app.use(expressJwt({
//     secret: config.secret,
//     getToken: function (req) {
//         if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
//             return req.headers.authorization.split(' ')[1];
//         } else if (req.query && req.query.token) {
//             return req.query.token;
//         }
//         return null;
//     }
// }).unless({ path: ['/users/authenticate',
// '/post/create',
//  '/users/register',
//  '/admin/authenticate',
//   '/admin/register',
//  '/like/create',
//  '/comments/create',
// '/feedback/create',
// '/device/create'] }));

// routes
app.use('/users', require('./controllers/users.controller'));
app.use('/feedback', require('./controllers/feedback.controller'));
app.use('/likes', require('./controllers/like.controller'));
app.use('/comments', require('./controllers/comment.controller'));
app.use('/admin', require('./controllers/admin.controller'));
app.use('/post', require('./controllers/post.controller'));
app.use('/device', require('./controllers/device.controller'));
// start server
var port = process.env.NODE_ENV === 'production' ? 1024  : 4002;
var server = app.listen(port, function () {
 console.log('Server listening on port ' + port);
});
