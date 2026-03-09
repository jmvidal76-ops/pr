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
        cambiaEstado: function(estado, tipoArranque, pausa) {
            var self = this;
            var cambio = {};
            cambio.linea = window.app.sesion.get("linea").id;
            cambio.estado = estado;
            cambio.id = this.get("id");
            cambio.zona = window.app.zonaSel.numZona;
            if (tipoArranque) {
                cambio.idArranque = tipoArranque;
            } else {
                cambio.idArranque = null;
            }
            if (pausa) {
                cambio.pausa = pausa;
            } else {
                cambio.pausa = null;
            }

            $.ajax({
                data: JSON.stringify(cambio),
                type: "POST",
                async: true,
                url: "../api/cambiarEstadoPorOficial",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(res) {
                    Backbone.trigger('eventCierraDialogo');
                    if (!res[0]) {
                        if (res[1]) {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res[1], 4000);
                        }
                    } else Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1], 4000);
                },
                error: function(e) {
                    Backbone.trigger('eventCierraDialogo');
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CAMBIAR_EL'), 4000);
                    }
                }
            });

        }

    });
    return Sesion;
});