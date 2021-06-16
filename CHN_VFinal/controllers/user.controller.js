'use strict'

var User = require('../models/user.model');
var Account = require('../models/account.model');
var mongoosePaginate = require('mongoose-pagination');

var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

function createUser(req, res) {
    var user = new User();
    var params = req.body;

    if (params.name != null && params.username != null && params.email != null && params.password != null) {

        User.findOne({
            $or: [{
                email: params.email
            }, {
                username: params.username
            }]
        }, (err, findOk) => {
            if (err) {
                res.status(500).send({
                    message: 'Error en la petición.'
                });
            } else if (findOk) {
                res.send({
                    message: 'Usuario o email ya utilizados.'
                });
            } else {
                user.name = params.name;
                user.username = params.username;
                user.email = params.email;
                user.role = 'USER';

                bcrypt.hash(params.password, null, null, (err, passwordHash) => {
                    if (err) {
                        res.status(404).send({
                            message: 'Error al encriptar la contraseña.'
                        });
                    } else if (!passwordHash) {
                        res.status(404).send({
                            message: 'Error inesperado.'
                        });
                    } else {
                        user.password = passwordHash;
                        user.save((err, userSaved) => {
                            if (err) {
                                res.status(404).send({
                                    message: 'Error en la petición de guardar datos.'
                                });
                            } else if (!userSaved) {
                                res.status(404).send({
                                    message: 'Error al guardar datos.'
                                });
                            } else {
                                res.send({
                                    message: 'Datos guardados con éxito: ',
                                    userSaved
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
        return res.status(404).send({
            message: 'Ingrese todos los datos.'
        });
    }
}

function login(req, res) {
    var params = req.body;

    if (params.username != null) {
        if (params.password) {
            User.findOne({
                $or: [{
                    username: params.username
                }]
            }, (err, check) => {
                if (err) {
                    res.status(404).send({
                        message: 'Error en la petición.'
                    });
                } else if (!check) {
                    res.send({
                        message: 'Datos de usuario incorrectos'
                    });
                } else {
                    bcrypt.compare(params.password, check.password, (err, ok) => {
                        if (err) {
                            res.status(404).send({
                                message: 'Error general.'
                            });
                        } else if (!ok) {
                            res.send({
                                message: 'Contraseña incorrecta.'
                            })
                        } else {
                            if (params.gettoken == 'true') {
                                res.send({
                                    token: jwt.createToken(check)
                                });
                            } else {
                                res.send({
                                    message: 'Bienvenido.',
                                    user: check
                                });
                            }

                        }
                    });
                }
            }).populate('accounts');
        } else {
            return res.send({
                message: 'Contraseña incorrecta.'
            });
        }
    } else {
        return res.send({
            message: 'Usuario erróneo.'
        });
    }
}

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    if (userId != req.user.sub) {
        res.status(403).send({
            message: 'Error de permisos, usuario no logeado'
        });
    } else {
        User.findByIdAndUpdate(userId, update, {
            new: true
        }, (err, userUpdated) => {
            if (err) {
                res.status(500).send({
                    message: 'Error general al actualizar'
                });
            } else if (userUpdated) {
                res.send({
                    user: userUpdated
                });
            } else {
                res.status(404).send({
                    message: 'No se ha podido actualizar'
                });
            }
        });
    }
}

function thrifMonetary(req, res) {
    var account = new Account();
    var update = req.body;
    var params = req.body;

    account.thrift = params.thrif;
    account.monetary = params.monetary;
    account.username = req.user.username;

    if (!req.headers.authorization) {
        res.status(418).send({
            message: 'No tiene permiso para actualizar la cuenta.'
        });
    } else {
        if (req.user.sub != null) {

            User.findOne({
                _id: req.user.sub
            }, (err, user) => {
                if (err) {
                    res.status(404).send({
                        message: 'Error general.'
                    });
                } else if (!user) {
                    res.send({
                        message: 'Usuario no encontrado.'
                    });
                } else {
                    if (params.thrif != null && params.monetary != null) {
                        User.findByIdAndUpdate(req.user.sub, {
                            $push: {
                                accounts: account
                            }
                        }, {
                            new: true
                        }, (err, accountUpdate) => {
                            if (err) {
                                res.status(404).send({
                                    message: 'Error general.'
                                });
                            } else if (!accountUpdate) {
                                res.send({
                                    message: 'No se pudo actualizar la cuenta.'
                                });
                            } else {
                                account.save((err, saveAccount) => {
                                    if (err) {
                                        res.status(404).send({
                                            message: 'Error general.'
                                        });
                                    } else if (!saveAccount) {
                                        res.send({
                                            message: 'Cuenta no actualizada'
                                        });
                                    } else {
                                        res.send({
                                            message: 'Cuenta: ',
                                            saveAccount
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        res.send({
                            message: 'Ingrese los parametros mínimos.'
                        })
                    }
                }
            });
        } else {
            return res.status(404).send({
                message: 'Ingrese todos los datos.'
            });
        }
    }
}
/*
function removeUser(req, res) {
    var userId = req.params.id;

    if (userId != req.user.sub) {
        res.status(403).send({
            message: 'Error de permisos, usuario no logeado'
        });
    } else {
        Account.findOneAndRemove({
            username: req.user.username
        }, (err, userFind) => {
            if (err) {
                res.status(404).send({
                    message: 'Error general.'
                });
            } else if (!userFind) {
                res.send({
                    message: 'No se puede eliminar la cuenta ya que no lo a creado su usuario.'
                });
            } else {
                res.send({
                    message: 'Se ha eliminado la siguiente cuenta: ',
                    user: userFind
                });
            }

        });
    }
    User.findByIdAndDelete(req.user.sub, {
        new: true
    }, (err, userRemoved) => {
        if (err) {
            res.status(500).send({
                message: 'Error general al actualizar'
            });
        } else if (userRemoved) {
            res.send({
                message: 'Se ha eliminado el siguiente usuario: ',
                user: userRemoved
            });
        } else {
            res.status(404).send({
                message: 'No se ha podido eliminar'
            });
        }
    });
}*/

function removeUser(req, res) {
    var userId = req.params.id;

    if(userId != req.user.sub){
        res.status(403).send({message: 'Error de permisos, usuario no logeado'});
    }else{
        User.findByIdAndRemove(userId, (err, userRemoved)=>{
            if(err){
                res.status(500).send({message: 'Error general al actualizar'});
            }else if(userRemoved){
                res.send({message: 'Se ha eliminado al siguiente usuario: ',user: userRemoved});
            }else{
                res.status(404).send({message: 'No se ha podido eliminar'});
            }
        });
    }
}

function find(req, res) {
    User.findById(req.user.sub, (err, userFind) => {

        if (err) {
            res.status(500).send({
                message: 'Error general al encontrar usuario.'
            });
        } else if (userFind) {
            res.send({
                user: userFind
            });
        } else {
            res.status(404).send({
                message: 'No se ha podido encontrar datos.'
            });
        }
    }).populate('accounts');
}

function findAll(req, res) {
    if(req.params.page){
    var page = req.params.page;
    }else{
        var page = 1;
    }
    var itemsPerPage = 3;

    User.find().sort('name').paginate(page, itemsPerPage, function(err, userFindAll, items){
        if (err) {
            res.status(500).send({
                message: 'Error general al encontrar usuario.'
            });
        } else if (userFindAll) {
            res.send({
                pages_total: items,
                user: userFindAll
            });
        } else {
            res.status(404).send({
                message: 'No se ha podido encontrar datos.'
            });
        }
    });
}

function uploadImage(req, res) {
    var userId = req.params.id;
    var file_name = 'No subido..'

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        User.findByIdAndUpdate(userId, {
            image: file_name
        }, (err, userUpload) => {
            if (err) {
                res.status(500).send({
                    message: 'Error general al subir imagen.'
                });
            } else if (userUpload) {
                res.send({
                    user: userUpload
                });
            } else {
                res.status(200).send({
                    message: 'Extensión no valida.'
                });
            }
        })
    } else {
        res.status(200).send({
            message: 'No has subido ninguna imagen...'
        });
    }
}

function getImageFile(req, res) {
    var imageFile = req.params.imageFile;
    var path_file = './uploads/users' + imageFile;

    fs.exists(path_file, function (exists) {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({
                message: 'No existe la imagen...'
            });
        }
    })
}

module.exports = {
    createUser,
    login,
    updateUser,
    thrifMonetary,
    removeUser,
    uploadImage,
    getImageFile,
    find,
    findAll
}