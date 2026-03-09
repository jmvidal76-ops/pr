define(['underscore', 'backbone', 'jquery', 'vistas/vDialogoConfirm', 'text!../../html/justificacionMultiplesParos.html', 'compartido/notificaciones', 'compartido/KeyboardSettings'],
    function (_, Backbone, $, VistaDlgConfirm, plantillaJustificacionMultiplesParos, Not, KeyboardSettings) {
        var VistaJustificacionParo = Backbone.View.extend({
            vistaConfirmacion: null,
            template: _.template(plantillaJustificacionMultiplesParos),
            tagName: 'div',
            heightP: 10,
            dialog: null,
            maquinasTodas: [],
            initialize: function (op) {
                var self = this;
                self.maquinasTodas = op.maquinas;
                self.render();
            },
            render: function () {
                var self = this;
                self.Paros = self.collection;
                $(this.el).html(this.template());
                $("body").append($(this.el));

                jQuery.each(self.Paros, function (index, value) {                    
                    self.$("#paros").append("<tr><td>" + window.app.idioma.t('INICIO') + "</td><td style=\"width:180px;text-align:left;font-weight:bold\">" + value.fechaHora + "</td><td>Maquina:</td><td style=\"width:180px;text-align:left;font-weight:bold\">" + value.descmaquina + "</td><td>Duracion:</td><td style=\"width:180px;text-align:left;font-weight:bold\">" + value.duracion + "</td></tr>");
                });

                this.$("#cmbMotivo").kendoDropDownList({
                    height: 450,
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.reasonTree.Categorias[1].motivos,
                        sort: { field: "nombre", dir: "asc" }
                    })
                    ,optionLabel: window.app.idioma.t('SELECCIONE')
                });

                var causas = null;

                if (causas != null) {
                    var ddlMotivos = $("#cmbMotivo").data("kendoDropDownList");
                    ddlMotivos.value(this.model.motivoId);
                }
            
                var opcSel = this.$("#cmbMotivo option:selected").val();

                this.$("#cmbCausa").kendoDropDownList({
                    height: 450,
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: new kendo.data.DataSource({
                        data: causas,
                        sort: { field: "nombre", dir: "asc" }
                    })
                    , optionLabel: window.app.idioma.t('SELECCIONE')
                });

                if (causas != null) {
                    var ddlCausas = $("#cmbCausa").data("kendoDropDownList");
                    ddlCausas.value(this.model.causaId);
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

                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();  

                $(this.el).kendoWindow(
                {
                    title: window.app.idioma.t('JUSTIFICA_PARO'),
                    width: "1200px",
                    maxHeight: "744px",
                    height: 485 + self.Paros.length * self.heightP + "px",
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
                'change #cmbMotivo': 'cambiaMotivo',
                'change #cmbMaquinaResponsable': 'cambiaMaquina',
                'change #cmbCausa': 'cambiaCausa',
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

                self.vistaConfirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('TIT_CONFIRMAR_ACCION'),
                    msg: window.app.idioma.t('MSG_JUSTIFICAR_MULTIPLES_PAROS'),
                    funcion: function () { self.confirmarJustificacion(); },
                    contexto: this
                });
            },
            confirmarJustificacion: function () {
                var self = this;

                jQuery.each(self.Paros, function (index, value) {
                    var paro = {
                        id: value.id,
                        fechaHoraFinUTC: value.fechaHoraFinUTC,
                        fechaHoraUTC: value.fechaHoraUTC,
                        motivoId: self.$("#cmbMotivo").data("kendoDropDownList").value(),
                        causaId: self.$("#cmbCausa").data("kendoDropDownList").value(),
                        idMaquinaResponsable: self.$("#cmbMaquinaResponsable").data("kendoDropDownList").value(),
                        idEquipoConstructivo: self.$("#cmbEquipoConstructivo").data("kendoDropDownList").value(),
                        descripcion: self.$("#cmbDescripcion").data("kendoDropDownList").text(),
                        maquina: window.app.lineaSel.id + "." + value.maquina,
                        observaciones: self.$("#txtObservaciones").val(),
                        idAveria: $("#cmbDescripcion").data("kendoDropDownList").value() === '' ? 0 : parseInt($("#cmbDescripcion").data("kendoDropDownList").value()),
                        justificacionMultiple: true,
                        linea: window.app.lineaSel.id
                    }

                    $.ajax({
                        type: "POST",
                        url: "../api/JustificaParoMayor/",
                        contentType: "application/json; charset=utf-8",
                        dataType: 'json',
                        data: JSON.stringify(paro),
                        cache: false,
                        async: false,
                        reset: true
                    }).success(function (res) {
                        if (!res[0]) {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res[1], 4000);
                        }

                        if (index == (self.Paros.length - 1)) {
                            self.dialog.close();
                            Backbone.trigger('eventParoJustificado');
                            Backbone.trigger('eventCierraDialogo');
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('JUSTIFICACION_REGISTRADA'), 4000);
                        }
                    }).error(function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_JUSTIFICANDO_PAROS') + ': ' + e, 4000);
                        }
                    });
                });

                self.eliminar();
            },
            cancelar: function () {
                this.dialog.close();
                this.eliminar();
            },
            cambiaMotivo: function () {
                $("#trError").hide();
                var self = this;
                var cmbCausa = self.$("#cmbCausa").data("kendoDropDownList");
                var opcSel = this.$("#cmbMotivo option:selected").val();

                if (opcSel != "") {
                    cmbCausa.dataSource.data(self.$("#cmbMotivo").data("kendoDropDownList").dataSource.get(opcSel).causas);
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

        return VistaJustificacionParo;
    });