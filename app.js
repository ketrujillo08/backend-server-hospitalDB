//Requires
var express = require('express');
var mongoose = require('mongoose');

//Inicializar variables

var app = express();

//Conexion Base de Datos

mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de datos:\x1b[32m%s\x1b[0m', 'online');
});

//rutas

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        message: "Peticion correcta"
    });
});

//Escuchar peticiones

app.listen(2000, () => {
    console.log('Express server puerto 3000:\x1b[32m%s\x1b[0m', 'online');
});