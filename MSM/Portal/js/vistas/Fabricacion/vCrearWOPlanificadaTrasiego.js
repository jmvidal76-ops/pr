define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/CrearWOPlanificadaTrasiego.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'definiciones'],
    function (_, Backbone, $, plantillaDlgCrearWO, Not, VistaDlgConfirm, definiciones) {
        var VistaDlgCrarWO = Backbone.View.extend({
            tagName: 'div',
            id: 'dlgCrearWO',
            materiales: [],
            horafin: new Date((new Date()).getTime() + (3 * 3600 * 1000)),
            tanques: null,
            numeroCoccion: null,
            destinationEquipments: null,
            gridListadoActual: null,
            template: _.template(plantillaDlgCrearWO),
            tiposWO: definiciones.TipoWOPlanificado(),
            estadoValido: definiciones.ValidarNumeroBooleano(),
            initialize: function (gridActual) {
                var self = this;
                self.gridListadoActual = gridActual;
                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerMaterialesCoccion",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.materiales = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerSalasDestinoCoccion",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.tanques = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });

                this.render();
            },
            render: function () {
                var self = this;


                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());
                $("#lblZona").html(window.app.idioma.t('SALA_TRASIEGO'));
                $("#lblOrigen").html(window.app.idioma.t('TANQUE_ORIGEN'));
                $("#lblDestino").html(window.app.idioma.t('TANQUE_DESTINO'));
                $("#lblCantidad").html(window.app.idioma.t('CANTIDAD_TRASEGO'));
                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();

                

                this.$('#btnLastDateWO').kendoTooltip({
                    position: "top",
                    width: 'auto',
                    animation: {
                        open: {
                            effects: "fade:in"
                        }
                    },
                    content: window.app.idioma.t('LAST_WO_ORDER_DATE')
                }).data("kendoTooltip");

                $("#txtCantidad").kendoNumericTextBox({
                    spinners: true,
                    decimals: 2,
                    culture: "es-ES",
                    format: "n2",
                    min: 1,
                    max: 99999
                });

                //// Cargamos los combos
                this.$("#cmbMaterial").kendoDropDownList({
                    dataValueField: "IdMosto",
                    valueTemplate: "#=IdMosto# - #=Descripcion#",
                    template: "#=IdMosto# - #=Descripcion#",
                    dataSource: new kendo.data.DataSource({
                        data: self.materiales,
                        sort: { field: "IdMosto", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });
                //Cargamos las fechas
                $("#dtpFechaInicio").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                this.$("#cmbSala").kendoDropDownList({
                    dataValueField: "IdUbicacion",
                    dataTextField: "DescZona",
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/ObtenerSalasOrigenPorTipoOrden/" + self.tiposWO.Trasiego,
                                dataType: "json"
                            }
                        },
                        sort: { field: "DescZona", dir: "asc" },
                        schema: {
                            model: {
                                id: "IdUbicacion",
                                fields: {
                                    'IdUbicacion': { type: "number" },
                                    'DescZona': { type: "string" },
                                }
                            }
                        },
                    },
                    dataBound: function (e) {
                        let data = this.dataSource.data();
                        var _hora = new Date();
                        if (data.length > 1) {
                            this.setOptions({
                                optionLabel: {
                                    IdUbicacion: 0,
                                    DescZona: window.app.idioma.t('SELECCIONE')
                                }
                            })
                            this.select(0);
                        }
                        
                        var idSala = data[0].IdUbicacion;

                        if (idSala !== '') {

                            $.ajax({
                                type: "GET",
                                url: "../api/ObtenerUltimaFechaOrdenTrasiego/" + idSala + "/" + self.tiposWO.Trasiego,
                                dataType: 'json',
                                cache: false,
                                async: false
                            }).done(function (data) {
                                if (data) {
                                    _hora = data;
                                }
                            }).fail(function (xhr) {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                            });
                        }


                        $("#dtpFechaInicio").data("kendoDateTimePicker").value(_hora);
                    },
                    change: function (e) {
                        self.CambiarFecha();
                    }
                });

                

                this.$("#cmbOrigen").kendoDropDownList({
                    dataValueField: "IdUbicacion",
                    valueTemplate: "#=CodUbicacion# - #=DescUbicacion#",
                    template: "#=CodUbicacion# - #=DescUbicacion#",
                    dataSource: new kendo.data.DataSource({
                        data: self.tanques,
                        sort: { field: "IdUbicacion", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                this.$("#cmbDestino").kendoDropDownList({
                    dataValueField: "IdUbicacion",
                    valueTemplate: "#=CodUbicacion# - #=DescUbicacion#",
                    template: "#=CodUbicacion# - #=DescUbicacion#",
                    dataSource: new kendo.data.DataSource({
                        data: self.tanques,
                        sort: { field: "IdUbicacion", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                this.window = $(this.el).kendoWindow(
                    {
                        title: window.app.idioma.t('PLANIFICAR_WO_TRASIEGO'),
                        width: "700px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: ["Close"],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                //self.CambiarFecha();
                $("#CantOrdCrear").kendoNumericTextBox({
                    spinners: true, format: "#", decimals: 0, min: 1, max: 25, value: 1
                });

                this.dialog = $('#dlgCrearWO').data("kendoWindow");
                this.dialog.center();
                kendo.ui.progress($("#center-pane"), false);
            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
                'click #btnLastDateWO': 'CambiarFecha'
            },
            aceptar: function (e) {
                e.preventDefault();
                var self = this;
                var resValidacion = this.validarCampos();
                if (resValidacion != "") {
                    $("#lblError").show();
                    $("#lblError").html(window.app.idioma.t(resValidacion));
                    Backbone.trigger('eventCierraDialogo');
                } else {
                    this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('CREAR_ORDEN_DE_TRASIEGO'), msg: window.app.idioma.t('DESEA_REALMENTE_CREAR_TRASIEGO'), funcion: function () {self.creaOrdenTrasiego() }, contexto: this });

                }


            },
            validarCampos: function () {
                var self = this;

                var inicio = $("#dtpFechaInicio").data("kendoDateTimePicker").value();
                var material = $("#cmbMaterial").data("kendoDropDownList").value();
                var cantidad = $("#txtCantidad").data("kendoNumericTextBox").value();
                var sala = $("#cmbSala").data("kendoDropDownList").dataSource.data().length > 1 ? $("#cmbSala").data("kendoDropDownList").select() : "";
                var origen = $("#cmbOrigen").data("kendoDropDownList").value();
                var destino = $("#cmbDestino").data("kendoDropDownList").value();

                if (cantidad == null && material == '' && (sala !== '' || sala == 0) && origen == ""  && destino == "") {
                    return 'RELLENE_TODOS_CAMPOS';
                }

                if (!(cantidad && cantidad > 0)) {
                    return 'ERROR_CANTIDAD';
                }
                if (!(sala !== '' || sala == 0)) {
                    return 'SELECCIONAR_SALA';
                }
                if (!(inicio && inicio !== "")) {
                    return 'SELECCIONE_FECHA';
                }

                self.verificarFecha();
                if (self.estadoVerificarFecha == self.estadoValido.VALOR_EXISTENTE) {
                    return 'RANGO_FECHAS_EXISTENTE';
                }


                if (!(material && material !== "")) {
                    return 'SELECCIONE_MATERIAL';
                }
                
                    if (!(origen && origen !== "") || !(destino && destino !== "")) {
                        return 'ERROR_TANQUE';
                    } else if (origen  == destino) {
                        return 'SELECCIONE_TANQUE_DIFERENTE';
                    }
                return "";

            },
            verificarFecha: function () {
                var self = this;
                    var inicio = $("#dtpFechaInicio").data("kendoDateTimePicker").value();
                    var sala = $("#cmbSala").data("kendoDropDownList").value();
                    var wo = {
                        IdTipoOrden: self.tiposWO.Trasiego,
                        IdSala:sala,
                        FechaInicio: inicio
                    };

                    Date.prototype.toJSON = function () { return moment(this).format(); };

                    $.ajax({
                        data: JSON.stringify(wo),
                        type: "POST",
                        async: false,
                        url: "../api/OrdenesFab/ValidarFechaNuevaOrdenPlanificada",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            self.estadoVerificarFecha = res;
                        },
                        error: function (response) {
                            Backbone.trigger('eventCierraDialogo');
                            self.estadoVerificarFecha = true;
                        }
                    });
            },
            creaOrdenTrasiego: function () {
                var self = this;

                var inicio = $("#dtpFechaInicio").data("kendoDateTimePicker").value();
                var material = $("#cmbMaterial").data("kendoDropDownList").value();
                var cantidad = $("#txtCantidad").data("kendoNumericTextBox").value();
                var origen = $("#cmbOrigen").data("kendoDropDownList").value();
                var destino = $("#cmbDestino").data("kendoDropDownList").value();

                var wo = {
                    Material: material,
                    Inicio: inicio,
                    Cantidad: cantidad,
                    txtSalaUbicacion: $("#cmbSala").data("kendoDropDownList").text(),
                    IdSalaUbicacion: $("#cmbSala").data("kendoDropDownList").value(),
                    IdOrigen: origen,
                    IdDestino: destino,
                    IdTipoOrden: self.tiposWO.Trasiego
                };

                Date.prototype.toJSON = function () { return moment(this).format(); };
                $.ajax({
                    data: JSON.stringify(wo),
                    type: "POST",
                    async: true,
                    url: "../api/CrearOrdenPlanificada",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        Backbone.trigger('eventCierraDialogo');
                        kendo.ui.progress($(self.gridListadoActual), false);
                        if (res) {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_CREADO_CORRECTAMENTE'), 4000);
                            self.cancelar();
                            Backbone.trigger('eventCierraDialogo');
                            $("#lblError").show();
                            $(self.gridListadoActual).data('kendoGrid').dataSource.read();
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CREAR_LA'), 4000);
                        }

                    },
                    error: function (response) {
                        $("#lblError").show();
                        $("#lblError").html(response.responseJSON.ExceptionMessage);
                        Backbone.trigger('eventCierraDialogo');
                    }
                });

            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
            },
            eliminar: function () {
                this.remove();
            },
            CambiarFecha: function (e) {
                var self = this;
                if (e) { e.preventDefault() };
                var idSala = $("#cmbSala").data("kendoDropDownList").dataSource.data().length > 1 ? $("#cmbSala").data("kendoDropDownList").select() == 0 ? "" : $("#cmbSala").data("kendoDropDownList").value() : $("#cmbSala").data("kendoDropDownList").value();
                if (idSala !== '') {

                    $.ajax({
                        type: "GET",
                        url: "../api/ObtenerUltimaFechaOrdenTrasiego/" + idSala + "/" + self.tiposWO.Trasiego,
                        dataType: 'json',
                        cache: false,
                        async: false
                    }).done(function (data) {
                        if (data) {
                            result = $("#dtpFechaInicio").data("kendoDateTimePicker").value(data);
                        } else {
                            self.horaActual = new Date()
                            result = $("#dtpFechaInicio").data("kendoDateTimePicker").value(self.horaActual);
                        }
                    }).fail(function (xhr) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                    });
                } else {
                    self.horaActual = new Date()
                    result = $("#dtpFechaInicio").data("kendoDateTimePicker").value(self.horaActual);
                }
                    
            }
            
        });
        return VistaDlgCrarWO;
    });

