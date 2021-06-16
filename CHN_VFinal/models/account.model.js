'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountSchema = Schema({
    username: String,
    thrift: Number,
    monetary: Number
});

module.exports = mongoose.model('account', accountSchema);