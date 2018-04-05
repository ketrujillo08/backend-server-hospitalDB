var express = require("express");
var app = express();
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
//var SEED = require("../config/config").SEED;
var middlewareAuth = require("../middlewares/auth");
var Usuario = require("../models/usuario");

app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email imagen rol')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: "Error cargando Usuarios",
                        errors: err
                    });
                }
                Usuario.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        message: "Usuarios",
                        usuarios: usuarios,
                        total: conteo
                    });
                })


            });
});


app.put('/:id', middlewareAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findByIdAndUpdate(id, body, (err, usuario) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: "Error al actualizar",
                errors: err
            });
        }
        if (!usuario) {
            return res.status(404).json({
                ok: false,
                message: "El usuario no existe",
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            newdata: body,
            lastdata: usuario,
            logged: req.usuario
        });


    });

});



app.post('/', middlewareAuth.verificaToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        imagen: body.imagen,
        rol: body.rol
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: "Error al crear Usuarios",
                errors: err
            });
        }
        if (!usuarioGuardado) {
            return res.status(404).json({
                ok: false,
                message: "El usuario no existe",
                errors: err
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioGuardado,
            logged: req.usuario
        });

    });
});

app.delete('/:id', middlewareAuth.verificaToken, (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                message: "Error al eliminar Usuarios",
                errors: err
            });
        }
        res.status(200).json({
            ok: true,
            body: usuarioBorrado
        });

    });


});



module.exports = app;