// Fichero: idioma.js
// Descripción: herramientas para traducir los terminos de la aplicación
define([
  'jquery',
  'compartido/notificaciones'
], function ($,Not) {
    var Idioma = function () {
        this.recursos = null;
        this.getFicheroIdioma = function (idioma) {
            var self = this;
            self.recursos = {};
            $.ajax({
                type: "GET",
                url: "../api/idioma/" + idioma,
                dataType: 'json',
                cache: false,
                async: false
            }).done(function (data) {
                self.recursos = data;
            }).fail(function (xhr) {
                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'Error cargando idioma', 4000);
            });
        };

        this.t = function (p) {
            return this.recursos[p];
        };

    };

    return Idioma;
});