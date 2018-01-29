var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('comments');

var service = {};

service.getAll = getAll;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;


module.exports = service;


function getAll() {
    var deferred = Q.defer();

    db.comments.find().toArray(function (err, comments) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        // return comments (without hashed passwords)
        comments = _.map(comments, function (comment) {
            return comment;
        });

        deferred.resolve(comments);
    });

    return deferred.promise;
}


function getById(_id) {
    var deferred = Q.defer();

    db.comments.findById(_id, function (err, comment) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (comment) {
            // return comment (without hashed password)
            deferred.resolve(comment);
        } else {
            // comment not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(commentParam) {
    var deferred = Q.defer();
    createcomment();
    // validation
  

    function createcomment() {
        // set comment object to commentParam without the cleartext password
        var comment = commentParam;


        // add hashed password to comment object
        //comment.hash = bcrypt.hashSync(commentParam.password, 10);

        db.comments.insert(
            comment,


            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function update(_id, commentParam) {
    var deferred = Q.defer();
 updatecomment();
    // validation
   

    function updatecomment() {
        // fields to update
        var set = {
            comment: commentParam.comment,
            updatedAt:new Date(),
            $setOnInsert:{
                createdAt:new Date()

            }
            

        };

        // update password if it was entered
       

        db.comments.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },

            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });

    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.comments.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}