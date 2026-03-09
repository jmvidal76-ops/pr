define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/crearWOMultiple.html', 'compartido/notificaciones',
        'vistas/vDialogoConfirm', 'definiciones'],
    function (_, Backbone, $, plantillaDlgCrearWO, Not, VistaDlgConfirm, definiciones) {
        var VistaDlgCrarWO = Backbone.View.extend({
            tagName: 'div',
            id: 'dlgCrearWO',
            horafin: new Date((new Date()).getTime() + (3 * 3600 * 1000)),
            tiposOrden: [],
            numeroCoccion: null,
            inputData: null,
            destinationEquipments: null,
            tiposWO: definiciones.TipoWOPlanificado(),
            template: _.template(plantillaDlgCrearWO),
            initialize: function (inputData) {
                var self = this;
                self.inputData = inputData;
                self.render();                    
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();

                $("#txtMaterial").text(self.inputData.material + " - " + self.inputData.materialDescripcion);
                $("#CantNecOrd").text(self.inputData.nroOrdNec);

                $("#CantOrdCrear").kendoNumericTextBox({
                    spinners: true, format: "#", decimals: 0, min: 1, max: 25, value: 1
                });

                $("#dtpFechaInicio").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: new Date()
                });

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

                this.$("#cmbSala").kendoDropDownList({
                    dataValueField: "IdUbicacion",
                    dataTextField: "DescZona",
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/ObtenerSalasOrigenPorTipoOrden/" + self.tiposWO.Coccion,
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
                        if (data.length > 1) {
                            this.setOptions({
                                optionLabel: {
                                    IdUbicacion: 0,
                                    DescZona: window.app.idioma.t('SELECCIONE')
                                }
                            })
                            this.select(0);
                        }
                        self.validarSala();
                        self.cambiarFecha();
                    },
                    change: function (e) {
                        self.cambiarFecha();
                    }
                });

                this.$("#cmbDestino").kendoDropDownList({
                    dataValueField: "IdUbicacion",
                    valueTemplate: "#=CodUbicacion# - #=DescUbicacion#",
                    template: "#=CodUbicacion# - #=DescUbicacion#",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/ObtenerSalasDestinoCoccion",
                                dataType: "json"
                            }
                        },
                        sort: { field: "CodUbicacion", dir: "asc" },
                    },
                });

                $("#txtCantidad").kendoNumericTextBox({
                    decimals: 2, culture: localStorage.getItem("idiomaSeleccionado"), format: "n2", min: 1, max: 99999
                });

                this.window = $(this.el).kendoWindow(
                    {
                        title: window.app.idioma.t('CREAR_MULTIPLE_ORD_DE_COC'),
                        width: "655px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: ["Close"],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                this.dialog = $('#dlgCrearWO').data("kendoWindow");
                this.dialog.center();
                kendo.ui.progress($("#center-pane"), false);
            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
                'click #btnLastDateWO': 'cambiarFecha',
                'change #cmbSala': 'validarSala',
            },
            validarSala: function () {
                var self = this;

                var sala = $("#cmbSala").data("kendoDropDownList").dataSource.data().length > 1 ? $("#cmbSala").data("kendoDropDownList").select() : "";
                var mensaje = "";

                if (sala !== "") {
                    if (sala !== 0) {
                        if (!(sala !== 0)) {
                            mensaje = 'SELECCIONAR_SALA';
                        }

                        if (mensaje !== "") {
                            $("#lblError").show();
                            $("#lblError").html(window.app.idioma.t(mensaje));
                        } else {
                            self.obtenerCantidades();
                            $("#lblError").hide();
                        }
                    } else {
                        $("#lblError").hide();
                    }
                } else {
                    $("#lblError").hide();
                    self.obtenerCantidades();
                }
            },
            obtenerCantidades: function () {
                var self = this;

                $.ajax({
                    type: "POST",
                    url: "../api/GetHLCoccionByMaterial/" + self.inputData.material + "/" + $("#cmbSala").data("kendoDropDownList").value(),
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    $("#txtCantidad").data("kendoNumericTextBox").value(data);
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_DATOS'), 4000);
                });
            },
            aceptar: function (e) {
                e.preventDefault();
                var self = this;
                var resValidacion = self.validarCampos();
                if (resValidacion != "") {
                    $("#lblError").show();
                    $("#lblError").html(window.app.idioma.t(resValidacion));
                    Backbone.trigger('eventCierraDialogo');
                } else {
                    $("#lblError").hide();
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('CREAR_ORDEN_DE_COCCION'),
                        msg: window.app.idioma.t('DESEA_REALMENTE_CREAR_ESTA'),
                        funcion: function () { self.creaOrdenCoccion(); },
                        contexto: this
                    });
                }
            },
            validarCampos: function () {
                var inicio = $("#dtpFechaInicio").data("kendoDateTimePicker").value();
                var numOrdenes = $("#CantOrdCrear").data("kendoNumericTextBox").value();
                var sala = $("#cmbSala").data("kendoDropDownList").dataSource.data().length > 1 ? $("#cmbSala").data("kendoDropDownList").select() : "";
                var cantidad = $("#txtCantidad").data("kendoNumericTextBox").value();

                if (!(numOrdenes && numOrdenes > 0) && (sala !== '' || sala == 0) && cantidad == null) return 'RELLENE_TODOS_CAMPOS';
                if (!(inicio && inicio !== "")) return 'SELECCIONE_FECHA';
                if (!(sala !== '' || sala == 0)) return 'SELECCIONAR_SALA';
                if (!(numOrdenes && numOrdenes > 0)) return 'ERROR_NUMERO_ORDENES';
                if (!(cantidad && cantidad > 0)) return 'ERROR_CANTIDAD';

                return "";
            },
            creaOrdenCoccion: function () {
                var self = this;

                var param = {
                    material: this.inputData.material,
                    inicioPlanificado: FormatearFechaPorRegion($("#dtpFechaInicio").data("kendoDateTimePicker").value()),
                    tipo: 1,
                    origen: $("#cmbSala").data("kendoDropDownList").value(),
                    cantidad: $("#txtCantidad").data("kendoNumericTextBox").value(),
                    cantOrdenes: $("#CantOrdCrear").data("kendoNumericTextBox").value(),
                    destino: $("#cmbDestino").data("kendoDropDownList").value()
                };

                $.ajax({
                    data: JSON.stringify(param),
                    type: "POST",
                    async: true,
                    url: "/api/CrearOrdenPlanificadaMultiple",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        Backbone.trigger('eventCierraDialogo');
                        if (res.succeeded) {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('COCCION_WP_CREADA'), 4000);
                            self.cancelar();
                            Backbone.trigger('eventCierraDialogo');
                        }
                        else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('COCCION_WP_ERROR'), 4000);
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
            cambiarFecha: function (e) {
                if (e)
                    e.preventDefault();

                var sala = $("#cmbSala").data("kendoDropDownList").dataSource.data().length > 1 ? $("#cmbSala").data("kendoDropDownList").select() == 0 ? "" : $("#cmbSala").data("kendoDropDownList").value() : $("#cmbSala").data("kendoDropDownList").value();

                if (sala !== "") {
                    $.ajax({
                        type: "GET",
                        url: "../api/ObtenerUltimaFechaOrden/" + parseInt(sala),
                        dataType: 'json',
                        cache: false,
                        async: false
                    }).done(function (data) {
                        let fecha = data ? data : new Date();
                        $("#dtpFechaInicio").data("kendoDateTimePicker").value(fecha);
                    }).fail(function (xhr) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_DATOS'), 4000);
                    });
                } else {
                    $("#dtpFechaInicio").data("kendoDateTimePicker").value(new Date());
                }
            }
        });

        return VistaDlgCrarWO;
    });