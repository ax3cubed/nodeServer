var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('devices');

var service = {};


service.getAll = getAll;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;


module.exports = service;


function getAll() {
    var deferred = Q.defer();

    db.devices.find().toArray(function (err, devices) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        // return devices (without hashed passwords)
        devices = _.map(devices, function (device) {
            return device;
        });

        deferred.resolve(devices);
    });

    return deferred.promise;
}


function getById(_id) {
    var deferred = Q.defer();

    db.devices.findById(_id, function (err, device) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (device) {
            // return device (without hashed password)
            deferred.resolve(device);
        } else {
            // device not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(params) {
    var deferred = Q.defer();
    db.devices.findOne({ deviceName: params.deviceName },
        function (err, device) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            if (device) {
                deferred.reject('this device' + params.deviceName + 'is already taken')
            } else {
                createDevice();

            }
        });
    function createDevice() {
        var device = params;
        db.devices.insert(
            device,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();

            });
    }
    return deferred.promise;
}

function update(_id, deviceParam) {
    var deferred = Q.defer();
    updatedevice();
    // validation


    function updatedevice() {
        // fields to uzpdate
        var set = {
            deviceName: deviceParam.deviceName


        };

        // update password if it was entered


        db.devices.update(
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

    db.devices.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}