define(['underscore', 'backbone', 'compartido/notificaciones'], function(_, Backbone, Not) {
    var Sesion = Backbone.Model.extend({
        defaults: {

        },
        initialize: function() {

        },
        clear: function() {
            this.destroy();
            this.view.remove();
        },
        asignarWO2Zona: function (zonas, crearOrdenArranqCambio, tipoArranque) {
            var self = this;
            var cambio = {};
            cambio.woId = this.get("id");
            cambio.zonas = zonas;
            cambio.linea = this.get("idLinea");
            cambio.crearOrdenArranqCambio = crearOrdenArranqCambio;
            cambio.tipoArranque = tipoArranque;

            $.ajax({
                data: JSON.stringify(cambio),
                type: "POST",
                async: true,
                url: "../api/asignarWO2Zona",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(res) {
                    if (res.errDesc == window.app.idioma.t('EXISTE_ZONA_ASIGNADA')) {
                        Backbone.trigger('eventCierraDialogo');
                        setTimeout(function () {
                            location.reload();
                        }, 2000);
                    } else {
                        var onFinish = function () {
                            if (!res.err) {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res.errDesc, 4000);
                            } else {
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ASIGNACION_WO_CORRECTA'), 4000);
                            }
                            self.asignarProduccionLineasDobleSalida(cambio.linea, window.app.idioma.t('ASIGNAR_WO'));
                            Backbone.trigger('eventCierraDialogo');
                        };

                        // Se le pasa un nuevo parametro que es una funcion para que lo haga al final
                        Backbone.trigger('eventActProd', { evento: "Asignar", onFinish: onFinish });
                    }
                },
                error: function(e) {
                    Backbone.trigger('eventCierraDialogo');
                    if (e.status == '500') {
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ASIGNACION_WO_CORRECTA'), 4000);
                    } else if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CAMBIAR_EL'), 4000);
                    }
                    self.asignarProduccionLineasDobleSalida(cambio.linea, window.app.idioma.t('ASIGNAR_WO'));
                }
            });
        },
        desasignarWO2Zona: function (zonas, nuevoEstado) {
            var self = this;
            var cambio = {};
            cambio.woId = this.get("id");
            cambio.zonas = zonas;
            cambio.nuevoEstado = nuevoEstado;
            cambio.linea = this.get("idLinea");

            $.ajax({
                data: JSON.stringify(cambio),
                type: "POST",
                async: true,
                url: "../api/desasignarWO2Zona",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (res) {
                    if (res.errDesc == window.app.idioma.t('EXISTE_ZONA_DESASIGNADA')) {
                        Backbone.trigger('eventCierraDialogo');
                        setTimeout(function () {
                            location.reload();
                        }, 2000);
                    } else {
                        var onFinish = function () {
                            if (!res.err) {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res.errDesc, 4000);
                            } else {
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('DESASIGNACION_WO_CORRECTA'), 4000);
                            }
                            self.asignarProduccionLineasDobleSalida(cambio.linea, window.app.idioma.t('DESASIGNAR_WO'));
                            Backbone.trigger('eventCierraDialogo');
                        };

                        // Se le pasa un nuevo parametro que es una funcion para que lo haga al final
                        Backbone.trigger('eventActProd', { evento: "Desasignar", onFinish: onFinish });
                    }
                },
                error: function (e) {
                    Backbone.trigger('eventCierraDialogo');
                    if (e.status == '500') {
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('DESASIGNACION_WO_CORRECTA'), 4000);
                    } else if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CAMBIAR_EL'), 4000);
                    }
                    self.asignarProduccionLineasDobleSalida(cambio.linea, window.app.idioma.t('DESASIGNAR_WO'));
                }
            });
        },
        asignarProduccionLineasDobleSalida: function (linea, accion) {
            var datos = {};
            datos.linea = linea;
            datos.accion = accion;

            $.ajax({
                data: JSON.stringify(datos),
                type: "POST",
                async: true,
                url: "../api/asignarProduccionLineasDobleSalida",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (res) {
                },
                error: function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    }
                    Backbone.trigger('eventActProd');
                }
            });
        }
    });

    return Sesion;
});