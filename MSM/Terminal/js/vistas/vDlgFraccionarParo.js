define(['underscore', 'backbone', 'jquery', 'vistas/vDialogoConfirm', 'keyboard', 'text!../../html/dlgFraccionarParo.html', 'compartido/utils', 'compartido/notificaciones'],
    function (_, Backbone, $, VistaDlgConfirm, Keyboard, plantillaDatosParoPerdida, Utils, Not) {
        var VistaFraccionarParo = Backbone.View.extend({
            template: _.template(plantillaDatosParoPerdida),
            tagName: 'div',
            data: null,
            initialize: function (model) {
                data = model;
                this.render();
            },
            render: function () {
                $(this.el).html(this.template({ 'paro': this.model.toJSON() }));
                $("body").append($(this.el));

                $("#nuevaDuracion").text(this.model.duracion);

                //this.$("#txtMaquina").val(this.model.maquina);

                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();
                $(this.el).kendoWindow(
                {
                    title: window.app.idioma.t('FRACCIONAR_PARO'),
                    width: "400px",
                    height: "520px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: []
                });
                this.dialog = $(this.el).data("kendoWindow");
                this.dialog.center();

                //$("#horas").kendoNumericTextBox({
                //    min: 0,
                //    format: "#",
                //    decimals: 0
                //});

                //$("#minutos").kendoNumericTextBox({
                //    min: 0,
                //    max: 55,
                //    step:5,
                //    format: "#",
                //    decimals: 0
                //});

                //$("#segundos").kendoNumericTextBox({
                //    min: 0,
                //    max: 55,
                //    step:5,
                //    format: "#",
                //    decimals: 0
                //});
            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
                'click #btnSH': 'sumaSH',
                'click #btnSM': 'sumaSM',
                'click #btnRH': 'restaRH',
                'click #btnRM': 'restaRM'
            },
            sumaSH: function () {
                var self = this;


                var total = parseInt(self.model.duracion.toString().substring(0, 2)) * 60 + parseInt(self.model.duracion.toString().substring(3, 5));

                var horas = parseInt($("#horas").val()) + 1;
                var minutos = parseInt($("#minutos").val());

                var totalUser = horas * 60 + minutos;

                if (totalUser > total)
                    $("#divError").hide();
                else {
                    $("#divError").hide();

                    $("#horas").val(horas);

                    var segRest = total - totalUser;

                    var dhora = parseInt(segRest / 60).toString().length > 1 ? parseInt(segRest / 60).toString() : "0" + parseInt(segRest / 60).toString();
                    var dmin = parseInt(segRest % 60).toString().length > 1 ? parseInt(segRest % 60).toString() : "0" + parseInt(segRest % 60).toString();

                    $("#nuevaDuracion").text(dhora + ":" + dmin + self.model.duracion.toString().substring(5, 8));
                }

            },
            sumaSM: function () {
                var self = this;


                var total = parseInt(self.model.duracion.toString().substring(0, 2)) * 60 + parseInt(self.model.duracion.toString().substring(3, 5));

                var horas = parseInt($("#horas").val());
                var minutos = parseInt($("#minutos").val()) + 5;

                var totalUser = horas * 60 + minutos;

                if (totalUser > total || minutos > 55)
                    $("#divError").hide();
                else {
                    $("#divError").hide();

                    $("#minutos").val(minutos);

                    var segRest = total - totalUser;

                    var dhora = parseInt(segRest / 60).toString().length > 1 ? parseInt(segRest / 60).toString() : "0" + parseInt(segRest / 60).toString();
                    var dmin = parseInt(segRest % 60).toString().length > 1 ? parseInt(segRest % 60).toString() : "0" + parseInt(segRest % 60).toString();

                    $("#nuevaDuracion").text(dhora + ":" + dmin + self.model.duracion.toString().substring(5, 8));
                }
            },
            restaRH: function () {
                var self = this;

                var total = parseInt(self.model.duracion.toString().substring(0, 2)) * 60 + parseInt(self.model.duracion.toString().substring(3, 5));

                var horas = parseInt($("#horas").val()) - 1;
                var minutos = parseInt($("#minutos").val());

                var totalUser = horas * 60 + minutos;

                if (totalUser > total || horas < 0)
                    $("#divError").hide();
                else {
                    $("#divError").hide();

                    $("#horas").val(horas);

                    var segRest = total - totalUser;

                    var dhora = parseInt(segRest / 60).toString().length > 1 ? parseInt(segRest / 60).toString() : "0" + parseInt(segRest / 60).toString();
                    var dmin = parseInt(segRest % 60).toString().length > 1 ? parseInt(segRest % 60).toString() : "0" + parseInt(segRest % 60).toString();

                    $("#nuevaDuracion").text(dhora + ":" + dmin + self.model.duracion.toString().substring(5, 8));
                }
            },
            restaRM: function () {
                var self = this;

                var total = parseInt(self.model.duracion.toString().substring(0, 2)) * 60 + parseInt(self.model.duracion.toString().substring(3, 5));

                var horas = parseInt($("#horas").val());
                var minutos = parseInt($("#minutos").val()) - 5;

                var totalUser = horas * 60 + minutos;

                if (totalUser > total || minutos < 0)
                    $("#divError").hide();
                else {
                    $("#divError").hide();

                    $("#minutos").val(minutos);

                    var segRest = total - totalUser;

                    var dhora = parseInt(segRest / 60).toString().length > 1 ? parseInt(segRest / 60).toString() : "0" + parseInt(segRest / 60).toString();
                    var dmin = parseInt(segRest % 60).toString().length > 1 ? parseInt(segRest % 60).toString() : "0" + parseInt(segRest % 60).toString();

                    $("#nuevaDuracion").text(dhora + ":" + dmin + self.model.duracion.toString().substring(5, 8));
                }
            },
            aceptar: function () {
                var self = this;
                $("#divError").hide();
                var id = this.model.id;
                var strDuracionOriginal = this.model.duracion.split(":");
                var duracionOriginal = parseInt(strDuracionOriginal[0]) * 60 * 60 + parseInt(strDuracionOriginal[1]) * 60 + parseInt(strDuracionOriginal[2]);
                var duracion = $("#horas")[0].value * 60 * 60 + $("#minutos")[0].value * 60;// + parseInt($("#segundos")[0].value);

                if (duracion >= duracionOriginal) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('LA_DURACION_DEL'), 5000);
                    this.dialog.close();
                    this.eliminar();
                }
                else {
                    if (duracion <= 0) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('LA_DURACIÓN_DEL'), 5000);
                        this.dialog.close();
                        this.eliminar();
                    }
                    else {

                        var minutosTotales = 0;
                        $.ajax({
                            type: "GET",
                            url: "../api/obtenerMinimoParoMayor/" + window.app.lineaSel.numLinea + "/",
                            dataType: 'json',
                            cache: false,
                            async: false,
                            reset: true
                        }).success(function (res) {
                            minutosTotales = res;
                        }).error(function (e) {
                            minutosTotales = 0;
                        });

                        var nuevoTiempo = $("#nuevaDuracion").html();
                        var totalDuracionSecundaria = parseInt(nuevoTiempo.split(':')[0] * 60) + parseInt(nuevoTiempo.split(':')[1]);

                        if (totalDuracionSecundaria < minutosTotales) {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('LA_DURACIÓN_DEL_FRAGMENTO') + minutosTotales + " minutos", 5000);
                        }
                        else
                            self.vistaConfirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('TIT_CONFIRMAR_ACCION')
                                , msg: window.app.idioma.t('CONFIRME_QUE_DESEA'), funcion: function () { self.confirmarFraccionamiento(id, duracion); }, contexto: this
                            });


                    }
                }
            },
            confirmarFraccionamiento: function (id, duracion) {
                var self = this;
                $.ajax({
                    type: "GET",
                    url: "../api/FraccionarParo/" + id + "/" + duracion,
                    dataType: 'json',
                    cache: true
                }).success(function (data) {
                    Backbone.trigger('eventParoJustificado');
                    self.dialog.close();
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('FRACCIONAMIENTO_CORRECTAMENTE_CREADO'), 5000);
                    self.eliminar();

                }).error(function (e) {
                    try {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_FRACCIONANDO_PARO'), 4000);
                        }
                    }
                    catch (err) {
                        self.dialog.close();
                        self.eliminar();
                    }
                    self.dialog.close();
                    self.eliminar();
                });
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
            },
            actualiza: function () {
                this.render();
            }
        });
        return VistaFraccionarParo;
    });