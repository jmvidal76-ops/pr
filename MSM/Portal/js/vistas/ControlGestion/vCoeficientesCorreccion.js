define(['underscore', 'backbone', 'jquery', 'text!../../../ControlGestion/html/CoeficientesCorreccion.html', 'compartido/notificaciones',
    'vistas/ControlGestion/vCrearCoefCorreccionCoccion', 'vistas/ControlGestion/vCrearCoefCorreccionHistoricoStocks',
    'vistas/ControlGestion/vCrearCoefCorreccionTCPs', 'jszip', 'compartido/util'],
    function (_, Backbone, $, PlantillaCoeficientes, Not, VistaCrearCoeficienteCoccion, VistaCrearCoeficienteHistoricoStocks,
              VistaCrearCoeficienteTCPs, JSZip, util) {
        var vistaCoeficientes = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaCoeficientes),
            dsCoeficientesCoccion: null,
            dsCoeficientesTCPs: null,
            dsCoeficientesHistorico: null,
            dsMateriales: null,
            tabSelect: 1,
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.getDataSourceCoccion();
                self.getDataSourceTCPs();
                self.getDataSourceHistorico();
                self.obtenerMateriales();
                self.render();
            },
            getDataSourceCoccion: function () {
                var self = this;

                self.dsCoeficientesCoccion = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/controlGestion/coeficientesCorreccionCoccion",
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            id: "IdCoefCoccion",
                            fields: {
                                IdCoefCoccion: { type: "number" },
                                FechaInicioAplicacion: { type: "date" },
                                FechaFinAplicacion: { type: "date" },
                                CodigoMosto: { type: "string" },
                                DescripcionMosto: { type: "string" },
                                CodigoMaterial: { type: "string" },
                                DescripcionMaterial: { type: "string" },
                                Coeficiente: { type: "number" },
                            }
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            getDataSourceTCPs: function () {
                var self = this;

                self.dsCoeficientesTCPs = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/controlGestion/coeficientesCorreccionTCPs",
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            id: "IdCoefTCP",
                            fields: {
                                IdCoefTCP: { type: "number" },
                                FechaInicioAplicacion: { type: "date" },
                                FechaFinAplicacion: { type: "date" },
                                CodigoCerveza: { type: "string" },
                                DescripcionCerveza: { type: "string" },
                                CodigoMaterial: { type: "string" },
                                DescripcionMaterial: { type: "string" },
                                Coeficiente: { type: "number" },
                            }
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            getDataSourceHistorico: function () {
                var self = this;

                self.dsCoeficientesHistorico = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/controlGestion/coeficientesCorreccionHistoricoStocks",
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            id: "IdCoeficiente",
                            fields: {
                                IdCoefHistorico: { type: "number" },
                                FechaInicioAplicacion: { type: "date" },
                                FechaFinAplicacion: { type: "date" },
                                Proceso: { type: "string" },
                                CodigoMaterial: { type: "string" },
                                DescripcionMaterial: { type: "string" },
                                Coeficiente: { type: "number" },
                            }
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            obtenerMateriales: function () {
                var self = this;

                self.dsMateriales = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetMaterial",
                            dataType: "json"
                        }
                    },
                    sort: { field: "DescripcionCompleta", dir: "asc" },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                this.tab = util.ui.createTabStrip('#divPestanias', { show: self.onTabShow });

                self.configurarGridCoccion();
                self.configurarGridTCP();
                self.configurarGridHistorico();

                util.ui.enableResizeCenterPane();
            },
            onTabShow: function (e) {
                let self = window.app.vista;

                if (self) {
                    self.tabSelect = $(e.item).data("id");
                    self.resizeGrid();
                }
            },
            configurarGridCoccion: function () {
                var self = this;

                let gridCoccion = $("#gridCoeficientesCoccion").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t("COEFICIENTES_CORRECCION_COCCION") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    dataSource: self.dsCoeficientesCoccion,
                    groupable: {
                        messages: {
                            empty: window.app.idioma.t('ARRASTRAR_SOLTAR')
                        }
                    },
                    sortable: true,
                    resizable: true,
                    selectable: true,
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
                    columns: [
                        {
                            field: "FechaInicioAplicacion",
                            title: window.app.idioma.t("FECHA_INICIO_APLICACION"),
                            width: 185,
                            template: '#= FechaInicioAplicacion !== null ? kendo.toString(new Date(FechaInicioAplicacion), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "FechaFinAplicacion",
                            title: window.app.idioma.t("FECHA_FIN_APLICACION"),
                            width: 175,
                            template: '#= FechaFinAplicacion !== null ? kendo.toString(new Date(FechaFinAplicacion), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "CodigoMosto",
                            title: window.app.idioma.t("TIPO_MOSTO"),
                            width: 135,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=CodigoMosto#' style='//width: 14px;height:14px;margin-right:5px;'/>#= CodigoMosto #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionMosto",
                            title: window.app.idioma.t("DESCRIPCION_MOSTO"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionMosto#' style='//width: 14px;height:14px;margin-right:5px;'/>#= DescripcionMosto #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CodigoMaterial",
                            title: window.app.idioma.t("COD_MATERIAL"),
                            width: 130,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=CodigoMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= CodigoMaterial #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionMaterial",
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= DescripcionMaterial #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Coeficiente",
                            title: window.app.idioma.t("COEFICIENTE") + " (%)",
                            width: 140,
                            //template: "#=kendo.format('{0:n2}',parseFloat(Coeficiente.toString()))#",
                            format: "{0:n2}",
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                    ],
                    dataBinding: self.resizeGrid,
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];

                                row.cells[0].value = e.data[dataPosition].FechaInicioAplicacion == null ? "" : kendo.toString(e.data[dataPosition].FechaInicioAplicacion, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[1].value = e.data[dataPosition].FechaFinAplicacion == null ? "" : kendo.toString(e.data[dataPosition].FechaFinAplicacion, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[6].format = "#,##0.00";
                            } catch (e) {
                            }
                        }
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridCoeficientesCoccion").data("kendoGrid"));
            },
            configurarGridTCP: function () {
                var self = this;

                let gridTCP = $("#gridCoeficientesTCP").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t("COEFICIENTES_CORRECCION_TCPS") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    dataSource: self.dsCoeficientesTCPs,
                    groupable: {
                        messages: {
                            empty: window.app.idioma.t('ARRASTRAR_SOLTAR')
                        }
                    },
                    sortable: true,
                    resizable: true,
                    selectable: true,
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
                    columns: [
                        {
                            field: "FechaInicioAplicacion",
                            title: window.app.idioma.t("FECHA_INICIO_APLICACION"),
                            width: 185,
                            template: '#= FechaInicioAplicacion !== null ? kendo.toString(new Date(FechaInicioAplicacion), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "FechaFinAplicacion",
                            title: window.app.idioma.t("FECHA_FIN_APLICACION"),
                            width: 175,
                            template: '#= FechaFinAplicacion !== null ? kendo.toString(new Date(FechaFinAplicacion), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "CodigoCerveza",
                            title: window.app.idioma.t("CODIGO_CERVEZA"),
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=CodigoCerveza#' style='//width: 14px;height:14px;margin-right:5px;'/>#= CodigoCerveza #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionCerveza",
                            title: window.app.idioma.t("DESCRIPCION_CERVEZA"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionCerveza#' style='//width: 14px;height:14px;margin-right:5px;'/>#= DescripcionCerveza #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CodigoMaterial",
                            title: window.app.idioma.t("COD_MATERIAL"),
                            width: 130,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=CodigoMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= CodigoMaterial #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionMaterial",
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= DescripcionMaterial #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Coeficiente",
                            title: window.app.idioma.t("COEFICIENTE") + " (%)",
                            width: 140,
                            //template: "#=kendo.format('{0:n2}',parseFloat(Coeficiente.toString()))#",
                            format: "{0:n2}",
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                    ],
                    dataBinding: self.resizeGrid,
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];

                                row.cells[0].value = e.data[dataPosition].FechaInicioAplicacion == null ? "" : kendo.toString(e.data[dataPosition].FechaInicioAplicacion, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[1].value = e.data[dataPosition].FechaFinAplicacion == null ? "" : kendo.toString(e.data[dataPosition].FechaFinAplicacion, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[6].format = "#,##0.00";
                            } catch (e) {
                            }
                        }
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridCoeficientesTCP").data("kendoGrid"));
            },
            configurarGridHistorico: function () {
                var self = this;

                let gridHistorico = $("#gridCoeficientesHistorico").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t("COEFICIENTES_CORRECCION_HISTORICO_STOCKS") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    dataSource: self.dsCoeficientesHistorico,
                    groupable: {
                        messages: {
                            empty: window.app.idioma.t('ARRASTRAR_SOLTAR')
                        }
                    },
                    sortable: true,
                    resizable: true,
                    selectable: true,
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
                    columns: [
                        {
                            field: "FechaInicioAplicacion",
                            title: window.app.idioma.t("FECHA_INICIO_APLICACION"),
                            template: '#= FechaInicioAplicacion !== null ? kendo.toString(new Date(FechaInicioAplicacion), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "FechaFinAplicacion",
                            title: window.app.idioma.t("FECHA_FIN_APLICACION"),
                            template: '#= FechaFinAplicacion !== null ? kendo.toString(new Date(FechaFinAplicacion), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "Proceso",
                            title: window.app.idioma.t("PROCESO"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Proceso#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Proceso #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CodigoMaterial",
                            title: window.app.idioma.t("COD_MATERIAL"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=CodigoMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= CodigoMaterial #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionMaterial",
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= DescripcionMaterial #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Coeficiente",
                            title: window.app.idioma.t("COEFICIENTE") + " (%)",
                            //template: "#=kendo.format('{0:n2}',parseFloat(Coeficiente.toString()))#",
                            format: "{0:n2}",
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                    ],
                    dataBinding: self.resizeGrid,
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];

                                row.cells[0].value = e.data[dataPosition].FechaInicioAplicacion == null ? "" : kendo.toString(e.data[dataPosition].FechaInicioAplicacion, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[1].value = e.data[dataPosition].FechaFinAplicacion == null ? "" : kendo.toString(e.data[dataPosition].FechaFinAplicacion, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[5].format = "#,##0.00";
                            } catch (e) {
                            }
                        }
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridCoeficientesHistorico").data("kendoGrid"));
            },
            events: {
                'click #btnAnadirCoefCoccion': 'anadirCoefCoccion',
                'click #btnLimpiarFiltrosCoccion': 'limpiarFiltroGridCoccion',
                'click #btnExportExcelCoccion': 'exportExcelCoccion',
                'click #btnAnadirCoefTCP': 'anadirCoefTCP',
                'click #btnLimpiarFiltrosTCP': 'limpiarFiltroGridTCP',
                'click #btnExportExcelTCP': 'exportExcelTCP',
                'click #btnAnadirCoefHistorico': 'anadirCoefHistorico',
                'click #btnLimpiarFiltrosHistorico': 'limpiarFiltroGridHistorico',
                'click #btnExportExcelHistorico': 'exportExcelHistorico',
            },
            anadirCoefCoccion: function () {
                var self = this;
                var permiso = TienePermiso(355);

                if (permiso) {
                    new VistaCrearCoeficienteCoccion({ dataMateriales: self.dsMateriales });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                }
            },
            limpiarFiltroGridCoccion: function () {
                var self = this;
                self.dsCoeficientesCoccion.filter({});
            },
            exportExcelCoccion: function () {
                var grid = $("#gridCoeficientesCoccion").data("kendoGrid");
                grid.saveAsExcel();
            },
            anadirCoefTCP: function () {
                var self = this;
                var permiso = TienePermiso(355);

                if (permiso) {
                    new VistaCrearCoeficienteTCPs({ dataMateriales: self.dsMateriales });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                }
            },
            limpiarFiltroGridTCP: function () {
                var self = this;
                self.dsCoeficientesTCPs.filter({});
            },
            exportExcelTCP: function () {
                var grid = $("#gridCoeficientesTCP").data("kendoGrid");
                grid.saveAsExcel();
            },
            anadirCoefHistorico: function () {
                var self = this;
                var permiso = TienePermiso(355);

                if (permiso) {
                    new VistaCrearCoeficienteHistoricoStocks({ dataMateriales: self.dsMateriales });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                }
            },
            limpiarFiltroGridHistorico: function () {
                var self = this;
                self.dsCoeficientesHistorico.filter({});
            },
            exportExcelHistorico: function () {
                var grid = $("#gridCoeficientesHistorico").data("kendoGrid");
                grid.saveAsExcel();
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
                let self = window.app.vista;

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                let tabsHeight = $(".k-tabstrip-items").innerHeight();

                let tabElements = [$("#divPestanias-1"), $("#divPestanias-2"), $("#divPestanias-3")];
                let tabElement = tabElements[self.tabSelect - 1];

                if (tabElement) {
                    let filtrosHeight = tabElement.find(".k-header:first").innerHeight();
                    let gridElement = tabElement.find("[data-role='grid']:first"),
                    //var gridElement = view.tab.select().index() == 0 ? $("#gridCoeficientesCoccion") : $("#gridCoeficientesHistorico"),
                        dataArea = gridElement.find(".k-grid-content"),
                        gridHeight = gridElement.innerHeight(),
                        otherElements = gridElement.children().not(".k-grid-content"),
                        otherElementsHeight = 0;

                    otherElements.each(function () {
                        otherElementsHeight += $(this).outerHeight();
                    });

                    dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - tabsHeight - filtrosHeight - 2);
                }
            },
        });

        return vistaCoeficientes;
    });