var config = require('config.json');
var express = require('express');
var router = express.Router();
var adminService = require('services/admin.service');

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/current', getCurrent);
router.put('/:_id', update);
router.delete('/:_id', _delete);
router.get('/:_id', findOne);

module.exports = router;

function findOne(req, res ) {
    adminService.getById(req.params._id)
        .then(function (admin) {
            if (admin) {
                res.send(admin);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function authenticate(req, res) {
    adminService.authenticate(req.body.email, req.body.password)
        .then(function (admin) {
            if (admin) {
                // authentication successful
                res.send(admin);
            } else {
                // authentication failed
                res.status(401).send('Email or password is incorrect');
                
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function register(req, res) {
    adminService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAll(req, res) {
    adminService.getAll()
        .then(function (admins) {
            res.send(admins);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrent(req, res) {
    adminService.getById(req.admin.sub)
        .then(function (admin) {
            if (admin) {
                res.send(admin);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function update(req, res) {
    adminService.update(req.params._id, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function _delete(req, res) {
    adminService.delete(req.params._id)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}