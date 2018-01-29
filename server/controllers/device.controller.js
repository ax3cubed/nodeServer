var config = require('config.json');
var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var deviceService = require('services/device.service');

// routes

//connect to the db
// var authCheck = jwt({
//     secret: new Buffer(config.secret, 'base64'),
//     audience: config.audience
// });

router.get('/', getAll);
router.get('/current', getCurrent);
router.put('/:_id', update);
router.delete('/:_id', _delete);
router.post('/create', create)

module.exports = router;

function create(req, res) {
    deviceService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAll(req, res) {
    deviceService.getAll()
        .then(function (devices) {
            res.send(devices);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrent(req, res) {
    deviceService.getById(req.device.sub)
        .then(function (device) {
            if (device) {
                res.send(device);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function update(req, res) {
    deviceService.update(req.params._id, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function _delete(req, res) {
    deviceService.delete(req.params._id)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
