// Fichero: idioma.js
// Descripción: herramientas para traducir los terminos de la aplicación
define([
  'jquery',
  'compartido/notificaciones'
], function ($,Not) {
    var Section = function () {
        this.value = null;

        this.getValueSection = function (categoryName, sectionName, keyName, property) {
            var self = this;
            $.ajax({
                type: "GET",
                url: "../api/getSectionValue/" + categoryName + '/' + sectionName + '/' + keyName + '/' + property + '/',
                dataType: 'json',
                cache: false,
                async: false
            }).done(function (data) {
                self.value = data;
            }).fail(function (xhr) {
                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_VALUE'), 4000);
            });
            return self.value;
        };

        this.getAppSettingsValue = function (keyName) {
            var self = this;
            $.ajax({
                type: "GET",
                url: "../api/getTrazaServer/" + keyName + '/',
                dataType: 'json',
                cache: false,
                async: false
            }).done(function (data) {
                self.value = data;
            }).fail(function (xhr) {
                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_VALUE'), 4000);
            });
            return self.value;
        };

    };

    return Section;
});