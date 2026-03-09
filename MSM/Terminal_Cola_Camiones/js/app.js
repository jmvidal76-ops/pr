// Fichero: app.js
// Descripción: Este modulo se encarga de cargar las distintas partes de la estructura general de la aplicación

define([
  'jquery',
  'compartido/router',
  'idioma',  
  'vistas/vPrincipal',
  'compartido/notificaciones',
  'section',
], function ($, Ruteador, Idioma,VistaPrincipal, Not, Section) {

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
    window.app.calidad = {};

    window.app.iniciar = function () {
        var self = this;
        // Establecemos el idioma (Si no se ha seleccionado ninguno por defecto ponemos es-ES
        self.idioma = new Idioma();
        self.section = new Section();

        if (!localStorage.getItem("idiomaSeleccionado"))
            localStorage.setItem("idiomaSeleccionado", "es-ES");

        self.idioma.getFicheroIdioma(localStorage.getItem("idiomaSeleccionado"));
        self.obtenerConfigPlanta();
        self.vistaPrincipal = new VistaPrincipal({ el: "body", model: null });
    },
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
    },
    //Convierte segundos ('s') en dias hh:mm:ss
    window.app.getDateFormat = function (s) {
        var d = Math.floor(Math.floor(Math.floor(s / 60) / 60) / 24); //Dias
        var fm = [
                          (d > 0 ? d + "d " : "") +      //Dias
                          (Math.floor(Math.floor(s / 60) / 60) % 24),                          //horas
                          Math.floor(s / 60) % 60,                                                //minutos
                          Math.floor(s % 60)                                                                     //segundos
        ];
        var date = $.map(fm, function (v, i) { return ((v < 10) ? '0' : '') + v; }).join(':');

        return date;
    }

    return window.app;
});