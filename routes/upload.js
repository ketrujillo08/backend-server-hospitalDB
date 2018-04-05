var express = require("express");
var fileUpload = require("express-fileupload");
var fs = require('fs');
var app = express();
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;
    //Tipos validos

    var tiposValidos = ['hospitales', 'usuarios', 'medicos'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: `${tipo} no existe`,
            errors: { message: tiposValidos.join(", ") }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: "No selecciono ninguna imagen",
            errors: { message: "Debe seleccionar una imagen" }
        });
    }

    //Obtener el nombre del archivo 
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extension = nombreCortado[nombreCortado.length - 1];

    //Extensiones validas

    var extensionesValidas = ['png', 'gih', 'jpg', 'jpeg'];
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: "Extension no valida",
            errors: { message: "Solo Archivos de images" }
        });
    }

    //Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;
    //Mover el archivo

    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: "Error al cargar imagen",
                error: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);



    });



});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuarioUpdate) => {


            if (!usuarioUpdate) {
                return res.status(400).json({
                    ok: false,
                    message: "El usuario no existe"
                });
            }
            var pathViejo = './uploads/usuarios/' + usuarioUpdate.imagen;

            //Si la imagen existe la elimina

            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }

            usuarioUpdate.imagen = nombreArchivo;
            usuarioUpdate.save((err, usuarioActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error al actualizar imagen de usuario",
                        error: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    message: "Imagen de usaurio actualizada",
                    usuario: usuarioActualizado
                });

            });

        });
    }
    if (tipo == 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    message: "El medico no existe"
                });
            }

            var pathViejo = `./upload/medicos/${medico.img}`;
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }



            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error al actualizar imagen de medico",
                        error: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    message: "Imagen de medico actualizada",
                    medico: medicoActualizado
                });

            });
        });

    }
    if (tipo == 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    message: "El hospital no existe"
                });
            }

            var pathViejo = `./upload/hospitales/${hospital.img}`;

            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: "Error al actualizar imagen de hospital",
                        error: err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    message: "Imagen de hospital actualizada",
                    usuario: hospitalActualizado
                });
            });

        });
    }
}
module.exports = app;