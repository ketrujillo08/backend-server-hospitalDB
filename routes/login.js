var express = require("express");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var app = express();
var Usuario = require("../models/usuario");
var config = require('../config/config');

const GOOGLE_CLIENT_ID = require('../config/config').GoogleClientId;
const GOOGLE_SECRET = require('../config/config').GoogleSecret;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_SECRET);


//Funcion Google AUTH

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    return {
        nombre: payload.name,
        email: payload.email,
        imagen: payload.picture,
        google: true
    }
}

//AUTH Google

app.post('/google', async(req, res, next) => {

    var token = req.body.token || "xxx";


    var googleUser = await verify(token).catch(err => {
        console.log("RAZONES", err);
        return res.status(500).json({
            ok: false,
            mensaje: 'Token Expirado'
        });
    });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }
        if (usuarioBD) {
            if (usuarioBD.google === false) {
                return res.status(500).json({
                    ok: false,
                    message: 'Usuario ya existen, no es necesaria el AUTH por Google'
                });
            } else {
                var token = jwt.sign({ usuario: usuarioBD }, config.SEED, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    token: token,
                    data: { message: "Success", data: usuarioBD },
                    id: usuarioBD._id
                });
            }
        } else {
            //Usuario no existe debemos crearlo
            var usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.imagen = googleUser.imagen;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioNEW) => {
                var token = jwt.sign({ usuario: usuarioNEW }, config.SEED, { expiresIn: 14400 });

                res.status(200).json({
                    ok: true,
                    token: token,
                    data: { message: "Success", data: usuarioNEW },
                    id: usuarioNEW._id
                });

            });

        }
    });
});

//AUTH Normal
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