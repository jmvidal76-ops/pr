// Fichero: app.js
// Descripción: Este modulo se encarga de cargar las distintas partes de la estructura general de la aplicación

define([
    'underscore',
    'jquery',
    'compartido/router',
    'idioma',
    'modelos/mSesion',
    'vistas/vVideoWall',
    'compartido/notificaciones'
], function (_, $, Ruteador, Idioma, Sesion, VistaVideoWall, Not) {

    window.app = window.app || {};

    window.app = window.app || {};
    window.app.avisoCierre = null; // variable que controla si hay que mostrar o no el aviso de cierre
    window.app.ruteador = null;
    window.app.sesion = null;
    window.app.vistaPrincipal = null;
    window.app.vista = null;
    window.app.idioma = null;
    window.app.tipos = null;
    window.app.reasonTree = null;
    window.app.planta = null;
    window.app.lineaSel = null;
    window.app.zonaSel = null;
    window.app.interval = null;
    window.app.sesionExpired = false;

    window.app.iniciar = function () {
        var self = this;       

        self.idioma = new Idioma();
        var idiomaSeleccionado = localStorage.getItem("idiomaSeleccionado");
        if (!idiomaSeleccionado) {
            localStorage.setItem("idiomaSeleccionado", "es-ES");
            idiomaSeleccionado = "es-ES";
            kendo.culture(idiomaSeleccionado);
        }
        self.idioma.getFicheroIdioma(idiomaSeleccionado);

        self.obtenerConfigPlanta();
        var parametros = _.object(_.compact(_.map(location.search.slice(1).split('&'), function (item) { if (item) return item.split('='); })));
        window.app.videowall = new VistaVideoWall({ options: parametros });
    }

    window.app.obtenerConfigPlanta = function () {
        var self = this;
        self.tipos = {};

        // Obtenemos la configuración de la planta
        $.ajax({
            type: "GET",
            url: "../api/planta/configuracion",
            dataType: 'json',
            cache: true,
            async: false
        }).done(function (data) {
            self.planta = data;
        }).fail(function (xhr) {
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CONFIGURACION_PLANTA'), 4000);
        });
    }
    return window.app;
});