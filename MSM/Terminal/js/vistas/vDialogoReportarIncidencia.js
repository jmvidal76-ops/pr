define(['underscore', 'backbone', 'jquery', 'text!../../html/dialogoReportarIncidencia.html', 'compartido/notificaciones', 'compartido/utils', 'compartido/KeyboardSettings'],
    function (_, Backbone, $, plantillaDlgIncidencia, Not, Utils, KeyboardSettings) {
        var VistaDlgReportarIncidencia = Backbone.View.extend({
            tagName: 'div',
            template: _.template(plantillaDlgIncidencia),
            initialize: function (options) {
                this.options = options;
                this.render();
            },
            render: function () {

                $(this.el).html(this.template(this.options));
                $("#center-pane").prepend($(this.el));

                //$('input').addClass("k-input");
                this.$("#btnEnviar").kendoButton();
                this.$("#btnCancelar").kendoButton();
                this.$('#btnEnviar').prop('disabled', 'disabled');
                $(this.el).kendoWindow(
                {
                    title: this.options.titulo,
                    width: "65%",
                    height: "65%",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: []
                });
                this.dialog = $(this.el).data("kendoWindow");
                this.dialog.center();
                this.$('.keyboardOn').addClass("ui-keyboard-input ui-widget-content ui-corner-all");
                KeyboardSettings.Load();
            },
            events: {
                'click #btnEnviar': 'enviar',
                'click #btnCancelar': 'cancelar',
                'keyup #txtDescripcion': 'keyAction'
            },
            keyAction: function (e) {
                if (this.$("#txtDescripcion").val()) {
                    this.$('#btnEnviar').removeAttr('disabled');
                } else {
                    this.$('#btnEnviar').prop('disabled', 'disabled');
                }
            },
            enviar: function () {
                //Creamos objeto incidencia
                var self = this;
                var incidencia = {};

                incidencia.usuario = window.app.sesion.attributes.usuario;
                incidencia.pantalla = (window.app.pantalla) ? window.app.pantalla : $('#menuPrincipal li:first-child').text();
                incidencia.descripcion = $("#txtDescripcion").val();
                incidencia.aplicacion = "T";
                incidencia.email = $("#TextEmail").val();

                if (incidencia.descripcion) {
                    $.ajax({
                        type: "POST",
                        url: "../api/reportarIncidencia",
                        contentType: "application/json",
                        data: JSON.stringify(incidencia),
                        success: function (e) {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_INCIDENCIA_SE'), 5000);

                            self.dialog.close();
                            self.eliminar();
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_SE_HA_PODIDO'), 4000);
                            }
                        }
                    });
                }
            },
            cancelar: function () {
                this.dialog.close();
                this.eliminar();
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
        return VistaDlgReportarIncidencia;
    });