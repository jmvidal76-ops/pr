define(['underscore', 'backbone', 'jquery', 'text!../../../Alt/html/VariacionGasesArranques.html', 'vistas/vDialogoConfirm',
    'compartido/notificaciones', 'jszip', '../../../../Portal/js/constantes', 'compartido/util'],
    function (_, Backbone, $, PlantillaVariacionGasesArranque, VistaDlgConfirm, Not, JSZip, enums, util) {
        var VistaDatosVariacionGasesArranques = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            tipoTurno: null,
            grid: null,
            fecha: new Date().midnight(),
            fechaCargada: null,
            template: _.template(PlantillaVariacionGasesArranque),
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.getDataSource();
                self.render();

                self.$("[data-funcion]").checkSecurity();
            },
            getDataSource: function () {
                var self = this;

                self.dsDatosVariacionGasesArranque = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ObtenerVariacionGasesArranques",
                            data: function () {
                                var desdePicker = $("#dtpFechaDesde").getKendoDateTimePicker();
                                var hastaPicker = $("#dtpFecha").getKendoDateTimePicker();

                                var desde = desdePicker ? desdePicker.value() : null;
                                var hasta = hastaPicker ? hastaPicker.value() : null;


                                return {
                                    fechaDesde: desde.toISOString(),
                                    fechaHasta: hasta.toISOString()
                                };
                            },
                            dataType: "json",
                            type: "GET"
                        },
                    },
                    schema: {
                        model: {
                            id: "IdVariacionGasesArranquesEnvasado",
                            fields: {
                                Id: { type: "number", editable: false },

                                IdVariacionGasesArranquesEnvasado: { type: "number", editable: false },
                                Ubicacion: { type: "string" },
                                CodMaterial: { type: "string" },
                                DescripcionMaterial: { type: "string" },
                                FechaArranque: { type: "date" },
                                LoteTCP: { type: "string" },
                                LoteLlenadora: { type: "string" },
                                O2TCP: { type: "number" },
                                O2Llenadora: { type: "number" },
                                DiferenciaO2: { type: "number" },
                                CO2TCP: { type: "number" },
                                CO2Llenadora: { type: "number" },
                                DiferenciaCO2: { type: "number" },
                                Creado: { type: "date" },
                                CreadoPor: { type: "string" },
                                Actualizado: { type: "date" },
                                ActualizadoPor: { type: "string" }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr && e.xhr.status == 403 && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr && e.xhr.status == 400) {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CONSULTA'), 3000);
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                DestruirKendoWidgets(self);

                var ExtGrid = window.app.cfgKendo.extGridToolbarColumnMenu;
                kendo.ui.plugin(ExtGrid);

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                //Asignaciíon fechas
                self.fecha.setHours(23, 59, 59, 999);
                $("#dtpFecha").kendoDateTimePicker({
                    value: self.fecha,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    change: function (e) {
                        var desdePicker = $("#dtpFechaDesde").getKendoDateTimePicker();
                        if (desdePicker && desdePicker.value()) {
                            $("#desdeFecha").html(kendo.toString(desdePicker.value(), kendo.culture().calendars.standard.patterns.MES_FechaHora));
                        }
                    }
                });

                var fechaDes = self.fecha.addDays(-7);
                fechaDes.setHours(00, 00, 00, 000);
                $("#dtpFechaDesde").kendoDateTimePicker({
                    value: fechaDes,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    change: function (e) {
                        var desdeVal = this.value();
                        $("#desdeFecha").html(desdeVal ? kendo.toString(desdeVal, kendo.culture().calendars.standard.patterns.MES_FechaHora) : "");
                    }
                });

                var inicialDesde = $("#dtpFechaDesde").getKendoDateTimePicker().value();
                $("#desdeFecha").html(inicialDesde ? kendo.toString(inicialDesde, kendo.culture().calendars.standard.patterns.MES_FechaHora) : "");

                self.grid = this.$("#gridDatosVariacionGasesArranques").kendoExtGrid({
                    autoBind: false,
                    dataSource: self.dsDatosVariacionGasesArranque,
                    groupable: {
                        messages: {
                            empty: window.app.idioma.t('ARRASTRAR_SOLTAR')
                        }
                    },
                    sortable: true,
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    excel: util.ui.default.gridExcelDate('VARIACION_GASES_ARRANQUES'),
                    excelExport: async function (e) {
                        ExcelGridExtra(e, util);
                    },
                    columns: [
                        {
                            hidden: true,
                            field: "IdVariacionGasesArranquesEnvasado",
                            title: "Id",
                            width: 60
                        },
                        {
                            field: "Ubicacion",
                            title: window.app.idioma.t("LINEA"),
                            width: 200,
                            attributes: { class: 'addTooltip' },
                            template: "<span class='addTooltip'>#=Ubicacion ? Ubicacion : DescripcionUbicacion ? DescripcionUbicacion : ''#</span>",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#:Ubicacion#' style='width: 14px;height:14px;margin-right:5px;'/>#: Ubicacion#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            field: "Codigo_JDE",
                            title: window.app.idioma.t("CODIGO_JDE"),
                            width: 80,
                            attributes: { class: 'addTooltip' },
                            template: "<span class='addTooltip'>#=Codigo_JDE ? Codigo_JDE : ''#</span>",
                            filterable: true
                        },
                        {
                            field: "DescripcionMaterial",
                            title: window.app.idioma.t("DESCRIPCION_DEL_MATERIAL"),
                            width: 250,
                            attributes: { class: 'addTooltip' },
                            template: "<span class='addTooltip'>#=DescripcionMaterial ? DescripcionMaterial : ''#</span>",
                            filterable: true
                        },
                        {
                            field: "FechaArranque",
                            title: window.app.idioma.t("FECHA_ARRANQUE"),
                            width: 150,
                            headerAttributes: { style: "width:140px; min-width:140px; max-width:140px;" },
                            attributes: { style: "width:140px; min-width:140px; max-width:140px; white-space:nowrap;" },
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FechaArranque ? GetDateForExcel(value.FechaArranque) : '' #",
                                width: 150
                            },
                            template: "#= FechaArranque ? kendo.toString(FechaArranque, kendo.culture().calendars.standard.patterns.MES_FechaHora) : '' #",
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupable: false
                        },
                        {
                            field: "LoteTCP",
                            title: window.app.idioma.t("LOTE_TCP"),
                            width: 300,
                            attributes: { class: 'addTooltip' },
                            template: "<span class='addTooltip'>#=LoteTCP ? LoteTCP : ''#</span>",
                            filterable: true
                        },
                        {
                            field: "LoteLlenadora",
                            title: window.app.idioma.t("LOTE_LLENADORA"),
                            width: 300,
                            attributes: { class: 'addTooltip' },
                            template: "<span class='addTooltip'>#=LoteLlenadora ? LoteLlenadora : ''#</span>",
                            filterable: true
                        },
                        {
                            field: "O2TCP",
                            title: window.app.idioma.t("O2_TCP"),
                            format: "{0:n2}",
                            width: 110,                            
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "n2",
                                        decimals: 2,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupable: false
                        },
                        {
                            field: "O2Llenadora",
                            title: window.app.idioma.t("O2_LLENADORA"),
                            format: "{0:n2}",
                            width: 110,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "n2",
                                        decimals: 2,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupable: false
                        },
                        {
                            field: "DiferenciaO2",
                            title: window.app.idioma.t("DIFERENCIA_O2"),
                            format: "{0:n2}",
                            width: 110,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "n2",
                                        decimals: 2,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupable: false
                        },
                        {
                            field: "CO2TCP",
                            title: window.app.idioma.t("CO2_TCP"),
                            format: "{0:n2}",
                            width: 110,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "n2",
                                        decimals: 2,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupable: false
                        },
                        {
                            field: "CO2Llenadora",
                            title: window.app.idioma.t("CO2_LLENADORA"),
                            format: "{0:n2}",
                            width: 110,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "n2",
                                        decimals: 2,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupable: false
                        },
                        {
                            field: "DiferenciaCO2",
                            title: window.app.idioma.t("DIFERENCIA_CO2"),
                            format: "{0:n2}",
                            width: 110,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "n2",
                                        decimals: 2,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupable: false
                        },
                        {
                            hidden: true,
                            field: "Creado",
                            title: "Creado",
                            width: 140
                        },
                        {
                            hidden: true,
                            field: "CreadoPor",
                            title: "CreadoPor",
                            width: 140
                        },
                        {
                            hidden: true,
                            field: "Actualizado",
                            title: "Actualizado",
                            width: 140
                        },
                        {
                            hidden: true,
                            field: "ActualizadoPor",
                            title: "ActualizadoPor",
                            width: 140
                        }
                    ],
                    dataBinding: self.resizeGrid,
                    dataBound: function (e) {
                        self.fechaCargada = $("#dtpFecha").getKendoDateTimePicker().value();
                    },
                }).data("kendoExtGrid");

                window.app.headerGridTooltip($("#gridDatosVariacionGasesArranques").data("kendoExtGrid"));

                self.resizeGrid();
            },
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnExportarExcel': 'exportarExcel',
            },
            exportarExcel: function () {
                var grid = $("#gridDatosVariacionGasesArranques").data("kendoExtGrid");
                if (!grid) return;
                grid.saveAsExcel();
            },
            actualiza: function () {
                var self = this;

                var desde = $("#dtpFechaDesde").getKendoDateTimePicker().value();
                var hasta = $("#dtpFecha").getKendoDateTimePicker().value();

                // Validaciones
                if (!desde || !hasta) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LAS_FECHAS_INTRODUCIDAS'), 4000);
                    return;
                }

                if (desde >= hasta) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('_LA_FECHA'), 4000);
                    return;
                }

                // actualizar fecha de referencia
                self.fecha = hasta;

                RecargarGrid({ grid: self.grid });
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
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridDatosVariacionGasesArranques"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            },
            LimpiarFiltroGrid: function () {
                const self = this;

                self.dsDatosVariacionGasesArranque.query({
                    group: [],
                    filter: [],
                    page: 1
                });
            },
        });

        return VistaDatosVariacionGasesArranques;
    });