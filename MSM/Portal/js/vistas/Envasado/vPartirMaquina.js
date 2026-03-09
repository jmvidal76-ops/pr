define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/PartirMaquina.html', 'compartido/notificaciones'],
    function (_, Backbone, $, plantillaDlgCrearWO, Not) {
        var VistaDlgEditarDatosTurno = Backbone.View.extend({
            tagName: 'div',
            id: 'dlgEditarDTurno',
            options: null,
            tiempoPaletera: 0,
            template: _.template(plantillaDlgCrearWO),
            initialize: function (options) {
                var self = this;
                self.options = options;

                this.render();
            },
            render: function () {
                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                var self = this;
                $("#imgProcesando").hide();
                $("#lblNuevaHora").text(window.app.idioma.t('NUEVA_HORA'));

                $("#btnAceptar").text(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelar").text(window.app.idioma.t('CANCELAR'));


                var dia = self.options.inicio.split(" ")[0];
                var diaMax = self.options.fin.split(" ")[0];
                $("#nuevaHora").kendoTimePicker({
                    dateInput: true,
                    interval: 5,
                    format: "HH:mm",
                    min: kendo.parseDate(self.options.inicio, kendo.culture().calendars.standard.patterns.MES_FechaHora),
                    max: kendo.parseDate(self.options.fin, kendo.culture().calendars.standard.patterns.MES_FechaHora)
                });


                $("#btnAceptar").kendoButton();
                $("#btnCancelar").kendoButton();

                $(this.el).kendoWindow(
                {
                    title: window.app.idioma.t("PARTIR"),
                    width: "460px",
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
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
            },
            aceptar: function (e) {
                e.preventDefault();

                var self = this;

                var horaSel = $("#nuevaHora").val();


                hora = horaSel.replace(":", "");
                if (hora.length == 3) { hora = "0" + hora; }


                var strInicio = self.options.inicio.substr(self.options.inicio.indexOf(" ") + 1, 16);
                strInicio = strInicio.replace(":", "");

                var strFin = self.options.fin.substr(self.options.fin.indexOf(" ") + 1, 16);
                strFin = strFin.replace(":", "");

                var valido = 1;
                if (strInicio > strFin) { //son de dias diferentes
                    if (hora < strInicio && hora > strFin) valido = 0;
                }
                else {
                    if (hora < strInicio || hora > strFin) valido = 0;
                }
                if (valido) {
                    var datosApi = {};

                    var fecha;
                    if (strInicio < strFin) {//es el mismo dia
                        var dia = self.options.inicio.split(" ")[0];
                        fecha = kendo.parseDate(dia + " " + horaSel + ":00", kendo.culture().calendars.standard.patterns.MES_FechaHora);
                        //fecha = new Date(parseInt(dia.split("-")[0]), parseInt(dia.split("-")[1]) - 1, parseInt(dia.split("-")[2]), parseInt(horaSel.split(":")[0]), parseInt(horaSel.split(":")[1]), 0, 0)
                    }
                    else {
                        if (hora > strInicio) {// es del dia del inicio
                            var dia = self.options.inicio.split(" ")[0];
                            fecha = kendo.parseDate(dia + " " + horaSel + ":00", kendo.culture().calendars.standard.patterns.MES_FechaHora);
                            //fecha = new Date(parseInt(dia.split("-")[0]), parseInt(dia.split("-")[1]) - 1, parseInt(dia.split("-")[2]), parseInt(horaSel.split(":")[0]), parseInt(horaSel.split(":")[1]), 0, 0)
                        }
                        else { //es del dia del fin
                            var dia = self.options.fin.split(" ")[0];
                            fecha = kendo.parseDate(dia + " " + horaSel + ":00", kendo.culture().calendars.standard.patterns.MES_FechaHora);
                            // fecha = new Date(parseInt(dia.split("-")[0]), parseInt(dia.split("-")[1]) - 1, parseInt(dia.split("-")[2]), parseInt(horaSel.split(":")[0]), parseInt(horaSel.split(":")[1]), 0, 0)
                        }
                    }

                    var hoyDate = new Date();
                    var nuevaHora = fecha.getTime();
                    datosApi.nuevaHora = nuevaHora / 1000;
                    datosApi.registroMaquina = self.options.registroMaquina;

                    self.$("#imgProcesando").show();
                    self.$("#divAceptar").hide();

                    $.ajax({
                        data: JSON.stringify(datosApi),
                        type: "POST",
                        async: true,
                        url: "../api/partirRegistroMaquina",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            self.$("#imgProcesando").hide();
                            self.$("#divAceptar").show();
                            if (res[0]) {
                                self.options.padre.gridDetalle.data("kendoGrid").dataSource.read();
                                self.cancelar(e);
                            }
                            else { self.cancelar(e); Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_EDITAR_LOS'), 2000); }
                        },
                        error: function (err) {
                            self.$("#imgProcesando").hide();
                            self.$("#divAceptar").show();
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                self.cancelar(e);
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            } else {
                                self.cancelar(e);
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_PARTIENDO_DATOS'), 2000);
                            }
                        }
                    });
                }
                else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('HORA_FUERA_RANGO'), 2000);

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