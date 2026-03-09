define(['underscore', 'backbone', 'jquery', 'text!../../../ControlGestion/html/DatosTCPs.html', 'vistas/vDialogoConfirm',
    'compartido/notificaciones', 'jszip'],
    function (_, Backbone, $, PlantillaDatosTCPs, VistaDlgConfirm, Not, JSZip) {
        var VistaDatosTCPs = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            tipoTurno: null,
            grid: null,
            fecha: new Date().midnight(),            
            template: _.template(PlantillaDatosTCPs),
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.getDataSource();
                self.render();
            },
            getDataSource: function () {
                var self = this;

                self.dsTCPs = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/controlGestion/TCPs",
                            data: function () {
                                let result = {};
                                result.fechaDesde = self.fecha.addDays(-1).toISOString();
                                result.fechaHasta = self.fecha.toISOString();

                                return result;
                            },
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            fields: {
                                FechaInicioReal: { type: "date" },
                                CodigoWO: { type: "string" },
                                EstadoWO: { type: "string" },
                                Ubicacion: { type: "string" },
                                IdMaterial: { type: "string" },
                                DescripcionMaterial: { type: "string" },
                                NumeroProceso: { type: "number" },
                                InicioLlenado: { type: "date" },
                                FinVaciado: { type: "date" },
                                CantidadProducida: { type: "number" },
                                Coeficiente: { type: "number" },
                                CantidadCoef: { type: "number" },
                                CantidadCDG: { type: "number" },
                                UnidadMedida: { type: "string" },
                                GradoPlato: { type: "number" },
                                GradoAlcoholico: { type: "number" },
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
            render: function () {
                var self = this;

                DestruirKendoWidgets(self);

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                $("#dtpFecha").kendoDateTimePicker({
                    value: self.fecha,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    change: function (e) {
                        if (this.value()) {
                            $("#desdeFecha").html(kendo.toString(this.value().addHours(-24), kendo.culture().calendars.standard.patterns.MES_FechaHora));
                        }
                    }
                });

                $("#desdeFecha").html(kendo.toString($("#dtpFecha").getKendoDateTimePicker().value().addHours(-24), kendo.culture().calendars.standard.patterns.MES_FechaHora));

                self.grid = this.$("#gridTCPs").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t("DATOS_TCPS") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    autoBind: false,
                    dataSource: self.dsTCPs,
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
                    columns: [
                        {
                            field: "FechaInicioReal",
                            title: window.app.idioma.t("INICIO_REAL"),
                            template: '#= FechaInicioReal !== null ? kendo.toString(new Date(FechaInicioReal), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            width: 160,
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
                            field: "NumeroProceso",
                            title: window.app.idioma.t("NUMERO") + " " + window.app.idioma.t("PROCESO"),
                            width: 110,
                        },
                        {
                            field: "IdMaterial",
                            title: window.app.idioma.t("CODIGO_MATERIAL"),
                            width: 140,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= IdMaterial #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionMaterial",
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                            width: 200,
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
                            field: "CantidadProducida",
                            title: window.app.idioma.t("CANTIDAD"),
                            format: "{0:n2}",
                            aggregates: ["sum"],
                            width: 110,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "Coeficiente",
                            title: window.app.idioma.t("COEF_C"),
                            format: "{0:n2}",
                            template: function (dataItem) {
                                let html = '';

                                if (dataItem.Coeficiente < 0) {
                                    html = "<span style='color:red'>" + dataItem.Coeficiente + "</span>";
                                } else if (dataItem.Coeficiente > 0) {
                                    html = "<span style='color:green'>" + dataItem.Coeficiente + "</span>";
                                } else {
                                    html = "<span>" + dataItem.Coeficiente + "</span>";
                                }

                                return html;
                            },
                            width: 95,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                        },
                        {
                            field: "CantidadCoef",
                            title: window.app.idioma.t("CANTIDAD_COEF"),
                            format: "{0:n2}",
                            aggregates: ["sum"],
                            width: 135,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "CantidadCDG",
                            title: window.app.idioma.t("CANTIDAD_CDG"),
                            format: "{0:n2}",
                            aggregates: ["sum"],
                            width: 135,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "UnidadMedida",
                            template: "#=UnidadMedida ? UnidadMedida.toUpperCase() : ''#",
                            title: window.app.idioma.t("UD_MEDIDA"),
                            width: 115,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=UnidadMedida#' style='//width: 14px;height:14px;margin-right:5px;'/>#= UnidadMedida #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "GradoAlcoholico",
                            title: window.app.idioma.t("GRADO_ALCOHOLICO"),
                            template: "#=kendo.format('{0:n2}',parseFloat(GradoAlcoholico.toString()))#",
                            width: 90,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            }
                        },
                        {
                            field: "GradoPlato",
                            title: "ºP",
                            template: "#=kendo.format('{0:n2}',parseFloat(GradoPlato.toString()))#",
                            width: 70,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            }
                        },
                        {
                            field: "CodigoWO",
                            title: window.app.idioma.t("IDORDEN"),
                            width: 190,
                        },
                        {
                            field: "EstadoWO", title: window.app.idioma.t("DESCRIPCIONESTADO"),
                            width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=EstadoWO#' style='//width: 14px;height:14px;margin-right:5px;'/>#= EstadoWO #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Ubicacion", title: window.app.idioma.t("UBICACION"),
                            width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Ubicacion#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Ubicacion #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "InicioLlenado",
                            title: window.app.idioma.t('FECHA_INICIO_LLENADO'),
                            template: '#= InicioLlenado !== null ? kendo.toString(new Date(InicioLlenado), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            width: 120,
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            field: "FinVaciado",
                            title: window.app.idioma.t("FECHA_FIN_VACIADO"),
                            template: '#= FinVaciado !== null ? kendo.toString(new Date(FinVaciado), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            width: 120,
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                    ],
                    dataBinding: self.resizeGrid,                    
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];

                                row.cells[0].value = e.data[dataPosition].FechaInicioReal == null ? "" : kendo.toString(e.data[dataPosition].FechaInicioReal, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[4].format = "#,##0.00";
                                row.cells[5].format = "#,##0.00";
                                row.cells[6].format = "#,##0.00";
                                row.cells[7].format = "#,##0.00";
                                row.cells[9].value = kendo.toString(e.data[dataPosition].GradoAlcoholico, "n2");
                                row.cells[10].value = kendo.toString(e.data[dataPosition].GradoPlato, "n2");
                                row.cells[14].value = e.data[dataPosition].InicioLlenado == null ? "" : kendo.toString(e.data[dataPosition].InicioLlenado, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[15].value = e.data[dataPosition].FinVaciado == null ? "" : kendo.toString(e.data[dataPosition].FinVaciado, kendo.culture().calendars.standard.patterns.MES_FechaHora);

                            } catch (e) {
                            }
                        }
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridTCPs").data("kendoGrid"));

                self.resizeGrid();
            },
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnExportExcel': 'exportExcel',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid'
            },
            actualiza: function () {
                var self = this;

                self.fecha = $("#dtpFecha").getKendoDateTimePicker().value();

                if (!self.fecha) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_FECHA_INTRODUCIDA'), 3000);
                    return;
                }

                RecargarGrid({ grid: self.grid });
            },
            exportExcel: function () {
                var grid = $("#gridTCPs").data("kendoGrid");
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
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridTCPs"),
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

                self.dsTCPs.query({
                    page: 1,
                    pageSize: self.dsTCPs.pageSize(),
                    sort: [],
                    filter: []
                });
            },
        });

        return VistaDatosTCPs;
    });