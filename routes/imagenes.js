var express = require("express");
var fs = require('fs');
var app = express();

app.get('/:tipo/:id_img', (req, res, next) => {
    var tipo = req.params.tipo;
    var id_img = req.params.id_img;
    var path = `./uploads/${tipo}/${id_img}`;

    fs.exists(path, (existe) => {
        if (!existe)
            path = "./assets/img/no-img.jpg";
        res.sendfile(path);
    });
});

module.exports = app;