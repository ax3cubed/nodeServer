var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('likes');

var service = {};

service.getAll = getAll;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;


module.exports = service;


function getAll() {
    var deferred = Q.defer();

    db.likes.find().toArray(function (err, likes) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        // return likes (without hashed passwords)
        likes = _.map(likes, function (like) {
            return like;
        });

        deferred.resolve(likes);
    });

    return deferred.promise;
}


function getById(_id) {
    var deferred = Q.defer();

    db.likes.findById(_id, function (err, like) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (like) {
            // return like (without hashed password)
            deferred.resolve(like);
        } else {
            // like not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(likeParam) {
    var deferred = Q.defer();
    createlike();
    // validation
  

    function createlike() {
        // set like object to likeParam without the cleartext password
        var like = likeParam;


        // add hashed password to like object
        //like.hash = bcrypt.hashSync(likeParam.password, 10);

        db.likes.insert(
            like,


            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function update(_id, likeParam) {
    var deferred = Q.defer();
 updatelike();
    // validation
   

    function updatelike() {
        // fields to update
        var set = {
            like: likeParam.like,
            updatedAt:new Date(),
            $setOnInsert:{
                createdAt:new Date()

            }
            

        };

        // update password if it was entered
       

        db.likes.update(
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

    db.likes.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}