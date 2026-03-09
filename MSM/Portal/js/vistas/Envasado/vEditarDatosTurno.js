define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/editarDatosTurno.html', 'compartido/notificaciones'],
    function (_, Backbone, $, plantillaDlgCrearWO, Not) {
        var VistaDlgEditarDatosTurno = Backbone.View.extend({
            tagName: 'div',
            id: 'dlgEditarDTurno',
            options: null,
            template: _.template(plantillaDlgCrearWO),
            initialize: function (options) {
                var self = this;
                self.options = options;

                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                $("#txtOeeObjetivo").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    min: 0,
                    max: 100,
                    culture: "en-US",
                    decimals: 2,
                    spinners: false,
                    value: self.options.datosTurno.OEEObjetivo      //self.options.oeeobjetivo.innerHTML.slice(0, -1)
                });

                $("#txtOeeCri").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    min: 0,
                    max: 100,
                    culture: "en-US",
                    decimals: 2,
                    spinners: false,
                    value: self.options.datosTurno.OEECritico      //self.options.oeecritico.innerHTML.slice(0, -1)
                });

                $("#btnAceptarDatosTurno").kendoButton({
                    click: function () { self.aceptar(); }
                });

                $("#btnCancelarDatosTurno").kendoButton({
                    click: function () { self.cancelar(); }
                });

                $(this.el).kendoWindow(
                {
                    title: window.app.idioma.t('MODIFICAR_DATOS_TURNO'),
                    width: "300px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    scrollable: false,
                    actions: []
                });

                this.dialog = $('#dlgEditarDTurno').data("kendoWindow");
                this.dialog.center();
            },
            events: {
            },
            aceptar: function (e) {
                var self = this;

                var datosTurno = {
                    IdTurno: self.options.datosTurno.IdTurno,
                    OEECritico: $("#txtOeeCri").val(),
                    OEEObjetivo: $("#txtOeeObjetivo").val(),
                    FechaTurno: self.options.datosTurno.FechaTurno,
                    IdTipoTurno: self.options.datosTurno.IdTipoTurno
                };

                if (datosTurno.OEECritico != "" && datosTurno.OEEObjetivo != "" && parseFloat(datosTurno.OEECritico) < parseFloat(datosTurno.OEEObjetivo)) {

                    $.ajax({
                        data: JSON.stringify(datosTurno),
                        type: "PUT",
                        async: true,
                        url: "../api/ActualizarOEEObjetivoCriticoTurno",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            if (res) {
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('GUARDADO_CORRECTAMENTE'), 3000);
                                self.options.datosTurno.OEEObjetivo = datosTurno.OEEObjetivo;
                                self.options.datosTurno.OEECritico = datosTurno.OEECritico;
                                self.options.detalleTurnoDiv.find('.oeeObjetivo').html(datosTurno.OEEObjetivo + "%");
                                self.options.detalleTurnoDiv.find('.oeeCritico').html(datosTurno.OEECritico + "%");
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_EDITAR_LOS'), 3000);
                            }

                            self.cancelar(e);
                        },
                        error: function (err) {
                            self.cancelar(e);

                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_EDITAR_LOS'), 3000);
                            }
                        }
                    });
                }
                else {
                    self.cancelar(e);
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('EL_OEE_CRÍTICO'), 3000);
                }
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
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
        return VistaDlgEditarDatosTurno;
    });