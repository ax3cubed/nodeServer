var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('post');


var service = {};

service.getAll = getAll;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;

module.exports = service;

function getAll(){
     var deferred = Q.defer();

    db.post.find().toArray(function (err, posts) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        // return the posts 
        posts = _.map(posts, function (post) {
            return post;
        });

        deferred.resolve(posts);
    });

    return deferred.promise;

}

function getById(_id) {
     var deferred = Q.defer();

    db.post.findById(_id, function (err, post) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (post) {
            // return post
            deferred.resolve(post);
        } else {
            // post not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(postParam) {
    var deferred = Q.defer();

    //validation
    db.post.findOne(
        {title:postParam.title},
        function (err, post) {
            if (err)deferred.reject(err.name+': '+err.message);
            if (post) {
                //a post with this title exists
                deferred.reject('this title "' +postParam.title +'" has already been used');
            } else {
                createPost();
            }
        });
    
    function createPost() {
     var post =postParam;
     ;
        db.post.insert(
            post,
            {"createdAt": new Date()},
            
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}
function update(_id, postParam) {
    var deferred = Q.defer();

    updatePost();

    function updatePost() {
        // fields to update
        var set = {
            privacy:postParam.privacy,
            content:postParam.content,
            updatedAt:new Date(),
            $setOnInsert:{
                createdAt:new Date()

            }
            
            
        };

      

        db.post.update(
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

    db.post.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}