var express = require("express");
var app = express();

var middlewareAuth = require("../middlewares/auth");

var Usuario = require("../models/usuario");
var Hospital = require("../models/hospital");



app.get("/", (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde).
    limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    error: err
                });
            }
            if (!hospitales) {
                return res.status(404).json({
                    ok: true,
                    message: "Lista de hospitales vacia"
                });
            }
            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });


        });

});

app.post("/", middlewareAuth.verificaToken, (req, res) => {

    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id,
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            body: hospitalGuardado
        });
    });

});

app.put('/:id', middlewareAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    body.usuario = req.usuario._id;

    Hospital.findByIdAndUpdate(id, body, (err, hospitalModificado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }
        if (!hospitalModificado) {
            return res.status(400).json({
                ok: false,
                message: "Hospital no existe"
            })
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalModificado
        });
    });

});

app.delete('/:id', middlewareAuth.verificaToken, (req, res) => {
    var id = req.query.id;
    Hospital.findByIdAndRemove(id, (err, hospitalEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalEliminado
        });

    });

});

module.exports = app;