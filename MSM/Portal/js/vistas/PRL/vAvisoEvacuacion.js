define(['underscore', 'backbone', 'jquery', 'text!../../../PRL/html/AvisoEvacuacion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, PlantillaAvisoEvacuacion, Not, VistaDlgConfirm) {
        var VistaAvisoEvacuacion = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaAvisoEvacuacion),
            initialize: function () {
                var self = this;
                self.render();
            },
            render: function () {
                var self = this;
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));
                self.comprobarAviso();
            },
            events: {
                'click  #btnActivar': 'activar',
                'click  #btnDesactivar': 'desactivar'
            },
            comprobarAviso: function () {
                var self = this;

                $.ajax({
                    type: "GET",
                    async: false,
                    url: "../api/AvisoEvacuacion_Read/",
                    dataType: 'json',
                    cache: false,
                    success: function (data) {
                        var estado = data ? window.app.idioma.t('ACTIVADO') : window.app.idioma.t('DESACTIVADO');
                        var color = data ? 'red' : 'green';
                        $('#lblEstado').text(estado);
                        $('#lblEstado').css('color', color);
                    },
                    error: function (err) {
                    }
                });
            },
            activar: function () {
                var self = this;

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('AVISO_EVACUACION'),
                    msg: window.app.idioma.t("MENSAJE_EVACUACION"),
                    funcion: function () {
                        var datos = {};
                        datos.Parametro = window.app.idioma.t('AVISO_EVACUACION');
                        datos.Valor = window.app.idioma.t('ACTIVADO');

                        self.accion(datos);

                        $('#lblEstado').text(window.app.idioma.t('ACTIVADO'));
                        $('#lblEstado').css('color', 'red');

                        Backbone.trigger('eventCierraDialogo');
                    },
                    contexto: this
                });
            },
            desactivar: function () {
                var self = this;

                var datos = {};
                datos.Parametro = window.app.idioma.t('AVISO_EVACUACION');
                datos.Valor = window.app.idioma.t('DESACTIVADO');

                self.accion(datos);

                $('#lblEstado').text(window.app.idioma.t('DESACTIVADO'));
                $('#lblEstado').css('color', 'green');
            },
            accion: function (datos) {
                $.ajax({
                    type: "POST",
                    async: false,
                    url: "../api/AvisoEvacuacion_Update/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    success: function (res) {
                        if (res) {
                            Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('LA_OPERACION_SE'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AVISO_EVACUACION'), 4000);
                        }
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AVISO_EVACUACION'), 4000);
                        }
                    }
                });
            },
            eliminar: function () {
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            }
        });

        return VistaAvisoEvacuacion;
    });