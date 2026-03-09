// Fichero: app.js
// Descripcion: Inicializa la aplicacion PantallaAlmacen con una unica vista.

define([
    'jquery',
    'idioma',
    'vistas/vPantallaAlmacen'
], function ($, Idioma, VistaPantallaAlmacen) {

    window.app = window.app || {};

    window.app.iniciar = function () {
        var self = this;

        self.idioma = new Idioma();
        var idiomaSeleccionado = localStorage.getItem('idiomaSeleccionado');
        if (!idiomaSeleccionado) {
            idiomaSeleccionado = 'es-ES';
            localStorage.setItem('idiomaSeleccionado', idiomaSeleccionado);
        }

        kendo.culture(idiomaSeleccionado);
        self.idioma.getFicheroIdioma(idiomaSeleccionado);

        self.vistaPrincipal = new VistaPantallaAlmacen();
    };

    return window.app;
});
