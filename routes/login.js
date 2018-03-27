var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var app = express();
var Usuario = require("../models/usuario");
var config = require('../config/config');


app.post('/', (req, res) => {
    var body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                data: { message: "Error al buscar Usuario" }
            });
        }
        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                data: { message: "El usuario no existe" }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                ok: false,
                data: { message: "Password Incorrecto", errors: err }
            });
        }

        //Crear TOKEN
        var token = jwt.sign({ usuario: usuarioBD }, config.SEED, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            token: token,
            data: { message: "Success", data: usuarioBD },
            id: usuarioBD._id
        });
    });

});


module.exports = app;