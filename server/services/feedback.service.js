var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('feedback');


var service = {};

service.getAll = getAll;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;

module.exports = service;

function getAll(){
     var deferred = Q.defer();

    db.feedback.find().toArray(function (err, feedbacks) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        // return the feedbacks 
        feedbacks = _.map(feedbacks, function (feedback) {
            return feedback;
        });

        deferred.resolve(feedbacks);
    });

    return deferred.promise;

}

function getById(_id) {
     var deferred = Q.defer();

    db.feedback.findById(_id, function (err, feedback) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (feedback) {
            // return feedback
            deferred.resolve(feedback);
        } else {
            // feedback not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(feedbackParam) {
    var deferred = Q.defer();

    createFeedback();

    function createFeedback() {
     
        db.feedback.insert(
            feedback,
            
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}
function update(_id, feedbackParam) {
    var deferred = Q.defer();

    updateFeedback();

    function updateFeedback() {
        // fields to update
        var set = {
            feedback_message:feedbackParam.feedback_message
        };

      

        db.feedback.update(
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

    db.feedback.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}