define(['underscore', 'backbone', 'jquery', 'text!../../html/justificacionParo.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', 'compartido/KeyboardSettings'],
    function (_, Backbone, $, plantillaJustificacionParo, VistaDlgConfirm, Not, KeyboardSettings) {
        var VistaJustificacionPerdida = Backbone.View.extend({
            template: _.template(plantillaJustificacionParo),
            tagName: 'div',
            dialog: null,
            maquinasTodas: [],
            vistaConfirmacion: null,
            initialize: function (op) {
                var self = this;
                self.maquinasTodas = op.maquinas;
                self.render();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template({ 'paro': this.model.toJSON() }));
                $("body").append($(this.el));

                self.$("#cmbMotivo").kendoDropDownList({
                    height: 450,
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.reasonTree.Categorias[2].motivos,
                        sort: { field: "nombre", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                if (this.model.motivoId && this.model.motivoId != 136) {
                    self.$("#cmbMotivo").data("kendoDropDownList").value(this.model.motivoId);
                }

                var causas = null;

                jQuery.each(window.app.reasonTree.Categorias[1].motivos, function (index, value) {
                    if (value.id == self.model.motivoId) {
                        causas = value.causas;
                    }
                });

                self.$("#cmbCausa").kendoDropDownList({
                    height: 450,
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: causas,
                        sort: { field: "nombre", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                if (this.model.causaId) {
                    self.$("#cmbCausa").data("kendoDropDownList").value(this.model.causaId);
                }

                self.$("#cmbMaquinaResponsable").kendoDropDownList({
                    height: 450,
                    dataTextField: "Descripcion",
                    dataValueField: "CodigoMaquina",
                    dataSource: new kendo.data.DataSource({
                        data: self.maquinasTodas,
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                self.$("#cmbEquipoConstructivo").kendoDropDownList({
                    height: 450,
                    dataTextField: "Descripcion",
                    dataValueField: "CodigoEquipo",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                self.$("#cmbDescripcion").kendoDropDownList({
                    height: 450,
                    dataTextField: "Descripcion",
                    dataValueField: "IdDescripcionAveria",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                if (this.model.idMaquinaResponsable) {
                    self.$("#cmbMaquinaResponsable").data("kendoDropDownList").value(this.model.idMaquinaResponsable);
                    self.cambiaMaquina();

                    if (this.model.idEquipoConstructivo) {
                        self.$("#cmbEquipoConstructivo").data("kendoDropDownList").value(this.model.idEquipoConstructivo);
                        self.cambiaEquipoConstructivo();

                        if (this.model.descripcion != '') {
                            self.$("#cmbDescripcion").data("kendoDropDownList").text(this.model.descripcion);
                        }
                    }
                }

                if (this.model.observaciones.length > 0) {
                    $("#txtObservaciones").val(this.model.observaciones);
                }

                self.$("#btnAceptar").kendoButton();
                self.$("#btnCancelar").kendoButton();
                self.$("#btnAnular").kendoButton();
                self.model.justificado ? self.$("#btnAnular").show() : self.$("#btnAnular").hide();

                $(this.el).kendoWindow({
                    title: window.app.idioma.t('EDITAR_PERDIDA_PROD'),
                    width: "1200px",
                    height: "540px",
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
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
                'click #btnAnular': 'confirmarAnular',
                'change #cmbMotivo': 'cambiaMotivo',
                'change #cmbCausa': 'cambiaCausa',
                'change #cmbMaquinaResponsable': 'cambiaMaquina',
                'change #cmbEquipoConstructivo': 'cambiaEquipoConstructivo'
            },
            cambiaCausa: function () {
                $("#trError").hide();
            },
            validarMotivoCausa: function () {
                var motivo = $("#cmbMotivo").data("kendoDropDownList").value();
                var causa = $("#cmbCausa").data("kendoDropDownList").value();

                if (motivo === "") {
                    $("#lblError").html(window.app.idioma.t("SELECCIONE_MOTIVO"));
                    $("#trError").show();
                    return false;
                }

                if ($("#cmbCausa").data("kendoDropDownList").dataSource.total() != 0 && causa === "") {
                    $("#lblError").html(window.app.idioma.t("SELECCIONE_CAUSA"));
                    $("#trError").show();
                    return false;
                } else
                    $("#trError").hide();

                return true;
            },
            validarMaquina: function () {
                var correcto = true;
                var idMotivo = $("#cmbMotivo").data("kendoDropDownList").value();

                $.ajax({
                    url: "../api/EsMaquinaObligatoriaParo/" + idMotivo + "/",
                    dataType: 'json',
                    async: false
                }).done(function (esMaquinaObligatoria) {
                    if ($("#cmbMaquinaResponsable").data("kendoDropDownList").value() == '' && esMaquinaObligatoria) {
                        $("#lblError").html(window.app.idioma.t("SELECCIONE_MAQUINA"));
                        $("#trError").show();
                        correcto = false;
                    }
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        correcto = false;
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ES_MAQUINA_OBLIGATORIA'), 4000);
                        correcto = false;
                    }
                });

                return correcto;
            },
            aceptar: function () {
                var self = this;

                if (!self.validarMotivoCausa()) return;
                if (!self.validarMaquina()) return;

                $("#trError").hide();

                var maquina = self.$("#cmbMaquinaResponsable").data("kendoDropDownList").value();
                var equipo = self.$("#cmbEquipoConstructivo").data("kendoDropDownList").value();
                var averia = self.$("#cmbDescripcion").data("kendoDropDownList").text();

                var paro = {
                    id: self.model.id,
                    fechaHoraFinUTC: self.model.fechaHoraFinUTC,
                    fechaHoraUTC: self.model.fechaHoraUTC,
                    motivoId: self.$("#cmbMotivo").data("kendoDropDownList").value(),
                    causaId: self.$("#cmbCausa").data("kendoDropDownList").value(),
                    idMaquinaResponsable: maquina,
                    idEquipoConstructivo: equipo,
                    descripcion: averia,
                    maquina: window.app.lineaSel.id + "." + self.model.maquina,
                    observaciones: self.$("#txtObservaciones").val(),
                    idAveria: $("#cmbDescripcion").data("kendoDropDownList").value() === '' ? 0 : parseInt($("#cmbDescripcion").data("kendoDropDownList").value()),
                    justificacionMultiple: false,
                    linea: window.app.lineaSel.id,
                    aplicarJustificacionMaquina: !(self.model.idMaquinaResponsable === maquina),
                    aplicarJustificacionEquipo: !(self.model.idEquipoConstructivo === equipo),
                    aplicarJustificacionAveria: !(self.model.descripcion === averia)
                }

                $.ajax({
                    type: "POST",
                    url: "../api/JustificaPerdida/",
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json',
                    data: JSON.stringify(paro),
                    cache: false,
                    async: false,
                    reset: true
                }).success(function (res) {
                    self.dialog.close();
                    if (!res[0]) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res[1], 4000);
                    } else {
                        //self.trigger('formSubmitted');
                        Backbone.trigger('eventParoJustificado');
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('JUSTIFICACION_REGISTRADA'), 4000);
                    }
                    self.eliminar();
                }).error(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_JUSTIFICANDO_PERDIDAS') + ': ' + e.Message, 4000);
                    }
                });
            },
            cancelar: function () {
                this.dialog.close();
                this.eliminar();
            },
            confirmarAnular: function () {
                var self = this;
                self.vistaConfirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ANULAR'),
                    msg: window.app.idioma.t('DESEA_ANULAR_JUSTIFICACION'),
                    funcion: function () { self.anular(); },
                    contexto: this
                });
            },
            anular: function () {
                var self = this;

                var paro = {
                    id: self.model.id,
                    maquina: window.app.lineaSel.id + "." + self.model.maquina
                };

                $.ajax({
                    type: "POST",
                    url: "../api/AnularPerdidaTerminal/",
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json',
                    data: JSON.stringify(paro),
                    cache: false,
                    async: false,
                    reset: true
                }).success(function (res) {
                    self.dialog.close();
                    if (!res[0]) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res[1], 4000);
                    } else {
                        Backbone.trigger('eventParoJustificado');
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ANULACION_CORRECTA'), 4000);
                    }
                    self.eliminar();
                    Backbone.trigger('eventCierraDialogo');
                }).error(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ANULACION') + ': ' + e.Message, 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                });
            },
            cambiaMotivo: function () {
                $("#trError").hide();
                var cmbCausa = $("#cmbCausa").data("kendoDropDownList");
                var opcSel = this.$("#cmbMotivo option:selected").val();

                if (opcSel != "") {
                    cmbCausa.dataSource.data($("#cmbMotivo").data("kendoDropDownList").dataSource.get(opcSel).causas);
                    cmbCausa.select(0);
                } else {
                    cmbCausa.dataSource.data([]);
                    cmbCausa.refresh();
                }
            },
            cambiaMaquina: function () {
                $("#trError").hide();
                var idMaquina = $("#cmbMaquinaResponsable").data("kendoDropDownList").value().trim();

                if (idMaquina != "") {
                    var equipos = null;

                    $.ajax({
                        url: "../api/EquiposConstructivosMaquina/" + idMaquina + "/",
                        dataType: 'json',
                        async: false
                    }).done(function (listaEquipos) {
                        equipos = listaEquipos;
                    }).fail(function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_EQUIPOS_CONSTRUCTIVOS'), 4000);
                        }
                    });

                    var dsEquipos = new kendo.data.DataSource({
                        data: equipos,
                    });

                    $("#cmbEquipoConstructivo").data("kendoDropDownList").setDataSource(dsEquipos);
                    $("#cmbDescripcion").data("kendoDropDownList").text('');
                } else {
                    $("#cmbEquipoConstructivo").data("kendoDropDownList").dataSource.data([]);
                    $("#cmbEquipoConstructivo").data("kendoDropDownList").text('');

                    $("#cmbDescripcion").data("kendoDropDownList").dataSource.data([]);
                    $("#cmbDescripcion").data("kendoDropDownList").text('');
                }
            },
            cambiaEquipoConstructivo: function () {
                var idEquipoConstructivo = $("#cmbEquipoConstructivo").data("kendoDropDownList").value();

                if (idEquipoConstructivo != "") {
                    var averias = null;

                    $.ajax({
                        url: "../api/AveriasEquipoConstructivo/" + idEquipoConstructivo + "/",
                        dataType: 'json',
                        async: false
                    }).done(function (listaAverias) {
                        averias = listaAverias;
                    }).fail(function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_POSIBLES'), 4000);
                        }
                    });

                    var dsAverias = new kendo.data.DataSource({
                        data: averias,
                    });

                    $("#cmbDescripcion").data("kendoDropDownList").setDataSource(dsAverias);
                } else {
                    $("#cmbDescripcion").data("kendoDropDownList").dataSource.data([]);
                    $("#cmbDescripcion").data("kendoDropDownList").text('');
                }
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

        return VistaJustificacionPerdida;
    });