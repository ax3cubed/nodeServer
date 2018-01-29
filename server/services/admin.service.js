var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('admins');

var service = {};

service.authenticate = authenticate;
service.getAll = getAll;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;

module.exports = service;

function authenticate(email, password) {
    var deferred = Q.defer();

    db.admins.findOne({ email:email }, function (err, admin) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (admin && bcrypt.compareSync(password, admin.hash)) {
            // authentication successful
            deferred.resolve({
                _id: admin._id,
                
                name: admin.name,
                
                email: admin.email,
                token: jwt.sign({ sub: admin._id }, config.secret)
            });
        } else {
            // authentication failed
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();

    db.admins.find().toArray(function (err, admins) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        // return admins (without hashed passwords)
        admins = _.map(admins, function (admin) {
            return _.omit(admin, 'hash');
        });

        deferred.resolve(admins);
    });

    return deferred.promise;
}


function getById(_id) {
    var deferred = Q.defer();

    db.admins.findById(_id, function (err, admin) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (admin) {
            // return admin (without hashed password)
            deferred.resolve(_.omit(admin, 'hash'));
        } else {
            // admin not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(adminParam) {
    var deferred = Q.defer();

    // validation
    db.admins.findOne(
        { email: adminParam.email},
        function (err, admin) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (admin) {
                // adminname already exists
                deferred.reject('this email address  "' + adminParam.email+ '" is already taken');
            } else {
                createadmin();
            }
        });

    function createadmin() {
        // set admin object to adminParam without the cleartext password
        var admin = _.omit(adminParam, 'password');

        // add hashed password to admin object
        admin.hash = bcrypt.hashSync(adminParam.password, 10);

        db.admins.insert(
            admin,
            
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function update(_id, adminParam) {
    var deferred = Q.defer();

    // validation
    db.admins.findById(_id, function (err, admin) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (admin.email !=adminParam.email) {
            // adminname has changed so check if the new adminname is already taken
            db.admins.findOne(
                { email: adminParam.email },
                function (err, admin) {
                    if (err) deferred.reject(err.name + ': ' + err.message);
                    if (admin) {
                        // adminname already exists
                        deferred.reject('This email adresss"' + req.body.email + '" is already taken')
                    } else {
                        updateadmin();
                    }
                });
        } else {
            updateadmin();
        }
    });

    function updateadmin() {
        // fields to update
        var set = {
            email: adminParam.email,
            name: adminParam.name,
  
            password:adminParam.password,
           

        };

        // update password if it was entered
        if (adminParam.password) {
            set.hash = bcrypt.hashSync(adminParam.password, 10);
        }

        db.admins.update(
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

    db.admins.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}