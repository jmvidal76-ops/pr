define(['underscore', 'backbone', 'jquery', 'text!../../../html/Mantenimiento/ValidacionArranqueOT.html'
    , 'compartido/notificaciones', 'compartido/KeyboardSettings', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, plantilla, Not, KeyboardSettings, enums) {
        var vistaValidacionArranque = Backbone.View.extend({
            tagName: 'div',
            id: 'divValidacionArranqueOT',
            window: null,
            template: _.template(plantilla),
            initialize: function ({ parent, OT, datosValidacion, read, callback }) {
                var self = this;

                self.padre = parent;
                self.OT = OT;
                self.datosValidacion = datosValidacion;
                self.lectura = read;
                self.callback = callback;

                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                if (!IsTerminal()) {
                    $(".terminal").removeClass("terminal");
                }

                let fechaValidacion = new Date();

                $("#inpt_fecha_validacion").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: fechaValidacion
                });

                if (self.datosValidacion) {
                    $("#inpt_fecha_validacion").getKendoDateTimePicker().value(new Date(self.datosValidacion.FechaValidacion));
                    $("#inpt_responsable_produccion").val(self.datosValidacion.ResponsableProduccion);
                    $("#inpt_responsable_mantenimiento").val(self.datosValidacion.ResponsableMantenimiento);
                }

                if (self.lectura) {
                    $("#inpt_fecha_validacion").getKendoDateTimePicker().enable(false);
                    $("#inpt_responsable_produccion").attr("disabled", true);
                    $("#inpt_responsable_mantenimiento").attr("disabled", true);
                }

                $("#btnGestionCancelar").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        self.window.close();
                    }
                });

                if (!self.lectura) {
                    $("#btnGestionAceptar").kendoButton({
                        click: async function (e) {
                            e.preventDefault();

                            $("#trError").html("");
                            $("#trError").hide();

                            if (!ValidarFormulario("ValidacionArranqueOTForm")) {
                                $("#trError").html(ObtenerCamposObligatorios("ValidacionArranqueOTForm"));
                                $("#trError").show();
                                return;
                            }

                            try {
                                kendo.ui.progress($(self.el), true);

                                const responsableProduccion = $("#inpt_responsable_produccion").val();
                                const responsableMantenimiento = $("#inpt_responsable_mantenimiento").val();
                                const fechaValidacion = $("#inpt_fecha_validacion").getKendoDateTimePicker().value();

                                const datos = {
                                    OT: self.OT,
                                    ResponsableProduccion: responsableProduccion,
                                    ResponsableMantenimiento: responsableMantenimiento,
                                    FechaValidacion: fechaValidacion.toISOString()
                                }

                                await self.ValidarArranqueOT(datos);

                                kendo.ui.progress($(self.el), false);

                                if (self.callback) {
                                    self.callback();
                                }

                                self.window.close();
                            }
                            catch (er) {
                                kendo.ui.progress($(self.el), false);
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_VALIDANDO_ARRANQUE'), 4000);
                            }
                        }
                    });
                }
                else
                {
                    $("#btnGestionAceptar").kendoButton({
                        enable: false
                    })
                }

                //let maxHeight = $("#center-pane").outerHeight() * 0.8;

                self.window = $(self.el).kendoWindow(
                    {
                        title: window.app.idioma.t("VALIDACION_ARRANQUE"),
                        //maxHeight: maxHeight,
                        modal: true,
                        resizable: false,
                        close: function () {
                            if (self.padre.cancelarCalcularFechaFin != undefined) {
                                self.padre.cancelarCalcularFechaFin();
                            }
                            self.window.destroy();
                            self.window = null;
                            self.eliminar();
                        },
                    }).data("kendoWindow");

                // Para mostrar el teclado en pantalla
                self.$('.keyboardOn').addClass("ui-keyboard-input ui-widget-content ui-corner-all");
                KeyboardSettings.Load();

                self.window.center();

            },
            ValidarArranqueOT: async function (datos) {
                const self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        url: "../api/ValidarArranque",
                        contentType: "application/json; charset=utf-8",
                        //dataType: "json",
                        data: JSON.stringify(datos),
                        success: function () {
                            resolve();
                        },
                        error: function (er) {
                            reject(er);
                        }
                    });
                });
            },            
            eliminar: function () {
                this.remove();
            }
        });

        return vistaValidacionArranque;
    });