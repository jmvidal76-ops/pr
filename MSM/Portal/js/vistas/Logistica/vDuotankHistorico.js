define(['underscore', 'backbone', 'jquery', 'text!../../../Logistica/html/DuotankHistorico.html', 'compartido/notificaciones', 'jszip'],
    function (_, Backbone, $, PlantillaDuotankHistorico, Not, JSZip) {
        var VistaDuotankHistorico = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            grid: null,
            template: _.template(PlantillaDuotankHistorico),
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

                self.dsDuotank = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ObtenerDuotankHistorico",
                            data: function () {
                                var result = {};
                                result.fechaDesde = $("#dtpFechaDesde").getKendoDateTimePicker().value().toISOString();
                                result.fechaHasta = $("#dtpFechaHasta").getKendoDateTimePicker().value().toISOString();

                                return result;
                            },
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            fields: {
                                Zona: { type: "string" },
                                FechaInicio: { type: "date" },
                                FechaFin: { type: "date" },
                                Matricula: { type: "string" },
                                Operacion: { type: "string" },
                                Porcentaje: { type: "number" },
                            }
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_HISTORICO'), 3000);
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                DestruirKendoWidgets(self);

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))

                $("#dtpFechaDesde").kendoDateTimePicker({
                    value: new Date(new Date((new Date()).getTime() - (7 * 24 * 3600 * 1000)).setHours(0, 0, 0)),
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#dtpFechaHasta").kendoDateTimePicker({
                    value: new Date(),
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                self.grid = this.$("#gridDuotank").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t("DUOTANK_HISTORICO") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    autoBind: false,
                    dataSource: self.dsDuotank,
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
                            field: "Zona",
                            title: window.app.idioma.t("ZONA"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Zona#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Zona #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "FechaInicio",
                            title: window.app.idioma.t("FECHA_INICIO"),
                            template: '#= FechaInicio !== null ? kendo.toString(new Date(FechaInicio), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
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
                            field: "FechaFin",
                            title: window.app.idioma.t("FECHA_FIN"),
                            template: '#= FechaFin !== null ? kendo.toString(new Date(FechaFin), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
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
                            field: "Matricula",
                            title: window.app.idioma.t("MATRICULA"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Matricula#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Matricula #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Operacion",
                            title: window.app.idioma.t("OPERACION"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Operacion#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Operacion #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Porcentaje",
                            title: window.app.idioma.t("PORCENTAJE"),
                            template: "#=kendo.format('{0:n1}',parseFloat(Porcentaje.toString()))#",
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 1
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

                                row.cells[1].value = e.data[dataPosition].FechaInicio == null ? "" : kendo.toString(e.data[dataPosition].FechaInicio, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[2].value = e.data[dataPosition].FechaFin == null ? "" : kendo.toString(e.data[dataPosition].FechaFin, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[5].value = kendo.toString(e.data[dataPosition].Porcentaje, "n1");
                                
                            } catch (e) {
                            }
                        }
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridDuotank").data("kendoGrid"));

                self.resizeGrid();
            },
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnExportExcel': 'exportExcel',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
            },
            actualiza: function () {
                var self = this;

                var inicio = $("#dtpFechaDesde").getKendoDateTimePicker().value();
                var fin = $("#dtpFechaHasta").getKendoDateTimePicker().value();

                if (!inicio || !fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LAS_FECHAS_INTRODUCIDAS'), 3000);
                    return;
                }

                if (inicio > fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('_LA_FECHA'), 3000);
                    return;
                }

                if (self.dsDuotank.page() != 1) {
                    self.dsDuotank.page(1);
                }
                self.dsDuotank.read();
            },
            exportExcel: function () {
                var grid = $("#gridDuotank").data("kendoGrid");
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

                var gridElement = $("#gridDuotank"),
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
                if ($("#gridDuotank").data("kendoGrid").dataSource.filter() != undefined) {
                    $("form.k-filter-menu button[type='reset']").trigger("click");
                }
            },
        });

        return VistaDuotankHistorico;
    });