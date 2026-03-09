define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/crearWO.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm','definiciones'],
    function (_, Backbone, $, plantillaDlgCrearWO, Not, VistaDlgConfirm, definiciones) {
        var VistaDlgCrarWO = Backbone.View.extend({
            tagName: 'div',
            id: 'dlgCrearWO',
            materiales: [],
            horafin: new Date((new Date()).getTime() + (3 * 3600 * 1000)),
            tiposOrden: [],
            numeroCoccion: null,
            destinationEquipments: null,
            tiposWO: definiciones.TipoWOPlanificado(),
            template: _.template(plantillaDlgCrearWO),
            initialize: function () {
                var self = this;

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

                this.render();
            },
            render: function () {
                var self = this;


                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();

                //Cargamos las fechas
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

                $("#txtCantidad").kendoNumericTextBox({
                    spinners: true, decimals: 2, culture: "es-ES", format: "n2", min: 1, max: 99999
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

                $("#destination").kendoDropDownList({
                    dataValueField: "IdUbicacion",
                    valueTemplate: "#=CodUbicacion# - #=DescUbicacion#",
                    template: "#=CodUbicacion# - #=DescUbicacion#",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerSalasDestinoCoccion",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.destinationEquipments = data;
                    var aux = new kendo.data.DataSource({
                        data: self.destinationEquipments,
                        sort: { field: "CodUbicacion", dir: "asc" }
                    });
                    $("#destination").data("kendoDropDownList").setDataSource(aux);
                    $("#destination").data("kendoDropDownList").dataSource.read();
                    kendo.ui.progress($("#center-pane"), false);
                }).fail(function (xhr) {
                    kendo.ui.progress($("#center-pane"), false);
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });

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
                        self.CambiarFecha();
                    },
                    change: function (e) {
                        self.CambiarFecha();
                    }
                });

                this.window = $(this.el).kendoWindow(
                    {
                        title: window.app.idioma.t('PLANIFICAR_WO_COCCION'),
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

                $("#CantOrdCrear").kendoNumericTextBox({
                    spinners: true, format: "#", decimals: 0, min: 1, max: 25, value: 1
                });

                this.dialog = $('#dlgCrearWO').data("kendoWindow");
                this.dialog.center();
                kendo.ui.progress($("#center-pane"), false);
                
            },
            events: {
                'change #cmbTipoOrden': 'cambiaRecurso',
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
                'change #cmbMaterial': 'validarCombosMaterialSala',
                'change #cmbSala': 'validarCombosMaterialSala',
                'click #btnLastDateWO': 'CambiarFecha'
            },
            validarCombosMaterialSala: function () {
                var self = this;
                var material = $("#cmbMaterial").data("kendoDropDownList").value();

                var sala = $("#cmbSala").data("kendoDropDownList").dataSource.data().length > 1 ? $("#cmbSala").data("kendoDropDownList").select() : "";
                var mensaje = "";

                if (sala !== "") {
                    if ((sala !== 0 || material !== "")) {
                        if (!(sala !== 0)) {
                            mensaje = 'SELECCIONAR_SALA';
                        }

                        if (!(material && material !== "")) {
                            mensaje = 'SELECCIONE_MATERIAL';
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
                $.ajax({
                    type: "POST",
                    url: "../api/GetHLCoccionByMaterial/" + $("#cmbMaterial").data("kendoDropDownList").value() + "/" + $("#cmbSala").data("kendoDropDownList").value(),
                    dataType: 'json',
                    cache: false,
                    async: true
                }).done(function (data) {
                    $("#txtCantidad").data("kendoNumericTextBox").value("")
                    $("#txtCantidad").data("kendoNumericTextBox").value(data);
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });
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
                    this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('CREAR_ORDEN_DE_COCCION'), msg: window.app.idioma.t('DESEA_REALMENTE_CREAR_ESTA'), funcion: function () { self.creaOrdenCoccion(); }, contexto: this });

                }


            },
            validarCampos: function () {

                var inicio = $("#dtpFechaInicio").data("kendoDateTimePicker").value();
                var material = $("#cmbMaterial").data("kendoDropDownList").value();
                var cantidad = $("#txtCantidad").data("kendoNumericTextBox").value();
                var sala = $("#cmbSala").data("kendoDropDownList").dataSource.data().length > 1 ? $("#cmbSala").data("kendoDropDownList").select() : "";

                if (cantidad == null && material == '' && (sala !== '' || sala == 0)) {
                    return 'RELLENE_TODOS_CAMPOS';
                }

                if (!(inicio && inicio !== "")) {
                    return 'SELECCIONE_FECHA';
                }

                if (!(material && material !== "")) {
                    return 'SELECCIONE_MATERIAL';
                }

                if (!(sala !== '' || sala == 0)) {
                    return 'SELECCIONAR_SALA';
                }

                if (!(cantidad && cantidad > 0)) {
                    return 'ERROR_CANTIDAD';
                }

                return "";

            },
            creaOrdenCoccion: function () {

                var self = this;

                var inicio = $("#dtpFechaInicio").data("kendoDateTimePicker").value();
                var material = $("#cmbMaterial").data("kendoDropDownList").value();
                var cantidad = $("#txtCantidad").data("kendoNumericTextBox").value();
                var destino = $("#destination").data("kendoDropDownList").value();

                var wo = {
                    material: material,
                    inicioEstimado: inicio,
                    cantidad: cantidad,
                    sc: $("#cmbSala").data("kendoDropDownList").text(),
                    sourceEquipPK: $("#cmbSala").data("kendoDropDownList").value(),
                    destinationEquipPK: destino
                };

                var cantOrdenes = $("#CantOrdCrear").data("kendoNumericTextBox").value();

                if (cantOrdenes > 1) {
                    wo.cantOrdenes = cantOrdenes;
                    self.crearOrdenMultiple(wo);
                    return;
                }

                Date.prototype.toJSON = function () { return moment(this).format(); };

                $.ajax({
                    data: JSON.stringify(wo),
                    type: "POST",
                    async: true,
                    url: "../api/AddOrdenFabricacion",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        Backbone.trigger('eventCierraDialogo');
                        kendo.ui.progress($("#gridListadoCoccion"), false);
                        if (res.succeeded) {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_CREADO_CORRECTAMENTE'), 4000);
                            self.cancelar();
                            Backbone.trigger('eventCierraDialogo');
                            $("#lblError").show();
                            $("#gridListadoCoccion").data('kendoGrid').dataSource.read();
                        }
                        else if (res.succeeded == false && res.message == "No_Horas_Disp") {

                            this.confirmacionHoraDisp = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('CREAR')
                                , msg: window.app.idioma.t('SELECCIONE_FECHA_DISP') + " " + window.app.idioma.t('DESEA_REALMENTE_CREAR_ESTA'), funcion: function () { self.actualizarHoraDisp(wo); }, contexto: this
                            });

                        }
                        else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CREAR_LA'), 4000);

                    },
                    error: function (response) {
                        $("#lblError").show();
                        $("#lblError").html(response.responseJSON.ExceptionMessage);
                        Backbone.trigger('eventCierraDialogo');
                    }
                });

            },
            actualizarHoraDisp: function (datos) {
                var self = this;
                datos.ConfirmacionActualizarHoras = true;

                $.ajax({
                    type: "POST",
                    url: "../api/AddOrdenFabricacion/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    Backbone.trigger('eventCierraDialogo');
                    kendo.ui.progress($("#gridListadoCoccion"), false);
                    if (res.succeeded) {
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_CREADO_CORRECTAMENTE'), 4000);
                        self.cancelar();
                        Backbone.trigger('eventCierraDialogo');
                        $("#lblError").show();
                        $("#gridListadoCoccion").data('kendoGrid').dataSource.read();
                    }
                    else {

                        Backbone.trigger('eventCierraDialogo');
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EDITAR_ORDEN'), 4000);
                        kendo.ui.progress($("#gridListadoCoccion"), false);
                    }

                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EDITAR_ORDEN'), 4000);
                    kendo.ui.progress($("#gridListadoCoccion"), false);

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
                if (e)
                    e.preventDefault();
                var sala = $("#cmbSala").data("kendoDropDownList").dataSource.data().length > 1 ? $("#cmbSala").data("kendoDropDownList").select() == 0 ? "" : $("#cmbSala").data("kendoDropDownList").value(): $("#cmbSala").data("kendoDropDownList").value();

                if (sala !== "") {
                    $.ajax({
                        type: "GET",
                        url: "../api/ObtenerUltimaFechaOrden/" + parseInt(sala),
                        dataType: 'json',
                        cache: false,
                        async: false
                    }).done(function (data) {
                        if (data) {
                            result = $("#dtpFechaInicio").data("kendoDateTimePicker").value(data);
                        }
                        else {
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
                
            },
            crearOrdenMultiple: function (wo) {

                var self = this;

                var param = {
                    material: wo.material,
                    inicioPlanificado: FormatearFechaPorRegion(wo.inicioEstimado),
                    tipo: 1,
                    origen: wo.sourceEquipPK,
                    cantidad: wo.cantidad,
                    cantOrdenes: wo.cantOrdenes,
                    destino: wo.destinationEquipPK
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
                            $("#gridListadoCoccion").data('kendoGrid').dataSource.read();
                        }
                        else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('COCCION_WP_ERROR'), 4000);
                    },
                    error: function (response) {
                        $("#lblError").show();
                        $("#lblError").html(response.responseJSON.ExceptionMessage);
                        Backbone.trigger('eventCierraDialogo');
                    }
                });


            }

        });
        return VistaDlgCrarWO;
    });

