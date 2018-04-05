var express = require("express");
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

app.get('/collection/:tabla/:busqueda', (req, res, next) => {
    var collection = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = RegExp(busqueda, 'i');
    var promise;
    switch (collection) {
        case 'usuario':
            var promise = buscarUsuarios(busqueda, regex);
            break;
        case 'medico':
            var promise = buscarMedicos(busqueda, regex);
            break;
        case 'hospital':
            var promise = buscarHospitales(busqueda, regex);
            break;

    }

    promise.then(respuesta => {
        res.status(200).json({
            ok: true,
            [collection]: respuesta
        });
    });

});

app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(busqueda, regex), buscarMedicos(busqueda, regex), buscarUsuarios(busqueda, regex)])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                message: "Global Search correcta",
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email rol')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('hospital')
            .populate('usuario', 'nombre email rol')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email rol')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;