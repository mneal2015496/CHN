'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3977;

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/CHN', {useNewUrlParser: true, useUnifiedTopology:true}, (err,res)=>{
    if(err){
        throw err;
    }else{
        console.log("Conexión a las DB funcionando");
        app.listen(port, function(){
            console.log("Servidor Activo " + port);          
        });
    }
});

 