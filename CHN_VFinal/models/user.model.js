'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    email: String,
    username: String,
    password: String,
    role: String,
    image: String,
    accounts: [{ type: Schema.Types.ObjectId, ref: 'account'}]
});

module.exports = mongoose.model('user', userSchema);
