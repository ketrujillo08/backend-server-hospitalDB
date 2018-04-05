var express = require("express");
var app = express();

var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var middlewareAuth = require("../middlewares/auth");

var Usuario = require("../models/usuario");
var Hospital = require("../models/hospital");
var Medico = require("../models/medico");

app.get("/", (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: err
                });
            }
            if (!medicos) {
                res.status(400).json({
                    ok: false,
                    message: "No existeb medicos"
                });
            }
            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            })

        });
});

app.post("/", middlewareAuth.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoNuevo) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoNuevo
        });
    });


});

app.put("/:id", middlewareAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    console.log(id);
    var body = req.body;

    Medico.findByIdAndUpdate(id, body, (err, medicoMod) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }
        if (!medicoMod) {
            return res.status(400).json({
                ok: false,
                message: "No existe medicos"
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoMod,
            user: req.usuario
        });
    });
});

app.delete("/:id", middlewareAuth.verificaToken, (req, res) => {
    var id = req.query.id;
    Medico.findByIdAndRemove(id, (err, medicoDel) => {
        if (err) {
            res.status(500).json({
                ok: false,
                error: err
            });
        }
        if (!medicoDel) {
            res.status(400).json({
                ok: false,
                message: "No existe medicos"
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoDel,
            user: req.usuario
        });

    });
});

module.exports = app;