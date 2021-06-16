'use strict'

var express = require('express');
var userController = require('../controllers/user.controller');
var api = express.Router();
var mdAuth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users'});


api.post('/createUser', userController.createUser);
api.post('/login', userController.login); 
api.put('/updateUser/:id', mdAuth.ensureAuth, userController.updateUser);
api.delete('/removeUser/:id', mdAuth.ensureAuth, userController.removeUser);
api.post('/thrifMonetary', mdAuth.ensureAuth, userController.thrifMonetary);
api.get('/findUser', mdAuth.ensureAuth, userController.find);
api.post('/upload-image-user/:id', [mdAuth.ensureAuth, md_upload], userController.uploadImage);
api.get('/get-image-user/:imageFile', userController.getImageFile);
api.get('/findUsers/:page?', userController.findAll);

module.exports = api;