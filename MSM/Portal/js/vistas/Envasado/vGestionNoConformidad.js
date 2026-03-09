define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/GestionNoConformidad.html', 'compartido/notificaciones', 'jszip'],
    function (_, Backbone, $, PlantillaNoConformidad, Not, JSZip) {
        var gridGestionNoConformidad = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            template: _.template(PlantillaNoConformidad),
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.render();
            },
            render: function () {
                $(this.el).html(this.template())
                $("#center-pane").append($(this.el))
                var self = this;

                const fechaActual = new Date();
                const fecha18MesesAntes = new Date(fechaActual);
                fecha18MesesAntes.setMonth(fechaActual.getMonth() - 18);

                $("#dtpFechaDesde").kendoDateTimePicker({
                    value: fecha18MesesAntes,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#dtpFechaHasta").kendoDateTimePicker({
                    value: new Date(),
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/noConformidad/ObtenerNoConformidades/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            data: function () {
                                return {
                                    fechaDesde: $("#dtpFechaDesde").getKendoDateTimePicker().value().toISOString(),
                                    fechaHasta: $("#dtpFechaHasta").getKendoDateTimePicker().value().toISOString()
                                }
                            }
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "IdNoConformidad",
                            fields: {
                                'IdNoConformidad': { type: "number" },
                                'IdProduccion': { type: "number" },
                                'SSCC': { type: "string" },
                                'NumeroLinea': { type: "number" },
                                'Producto': { type: "string" },
                                'LoteJDE': { type: "string" },
                                'FechaCreacion': { type: "date" },
                                'FechaProduccion': { type: "date" },
                                'FechaNoConformidad': { type: "date" },
                                'IdOrden': { type: "string" },
                                'IdParticion': { type: "string" },
                                'IdTurno': { type: "number" },
                                'Activo': { type: "boolean" },
                                'Creado': { type: "date" },
                                'CreadoPor': { type: "string" },
                                'Actualizado': { type: "date" },
                                'ActualizadoPor': { type: "string" },
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    },
                });

                self.grid = this.$("#gridGestionNoConformidad").kendoGrid({
                    dataSource: self.ds,
                    excel: {
                        fileName: window.app.idioma.t("GESTION_NOCONFORMIDAD") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    sortable: true,
                    resizable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "FechaCreacion", title: window.app.idioma.t('FECHA_CREACION'), width: 150,
                            //format: "{0:dd/MM/yyyy HH:mm:ss}",
                            template: '#: kendo.toString(new Date(FechaCreacion), kendo.culture().calendars.standard.patterns.MES_FechaHora)#',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendar.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "FechaProduccion", title: window.app.idioma.t('FECHA_PRODUCCION'), width: 150,
                            //format: "{0:dd/MM/yyyy HH:mm:ss}",
                            template: '#: kendo.toString(new Date(FechaProduccion), kendo.culture().calendars.standard.patterns.MES_FechaHora)#',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendar.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "FechaNoConformidad", title: window.app.idioma.t('FECHA_NO_CONFORMIDAD'), width: 150,
                            //format: "{0:dd/MM/yyyy HH:mm:ss}",
                            template: '#: kendo.toString(new Date(FechaNoConformidad), kendo.culture().calendars.standard.patterns.MES_FechaHora)#',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendar.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "SSCC",
                            title: window.app.idioma.t("SSCC"),
                            width: 160,
                        },
                        {
                            field: "NumeroLinea",
                            title: window.app.idioma.t("LINEA"),
                            template: "#:ObtenerLineaDescripcion(NumeroLinea)#",
                            width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=NumeroLinea#' style='width: 14px;height:14px;margin-right:5px;'/>#:ObtenerLineaDescripcion(NumeroLinea)#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Producto",
                            title: window.app.idioma.t('PRODUCTO'),
                            width: 105,
                        },
                        {
                            field: "IdParticion",
                            title: window.app.idioma.t('WO'),
                            width: 150,
                        },
                        {
                            field: "LoteJDE",
                            title: window.app.idioma.t('LOTE_JDE'),
                            width: 120,
                        },
                        {
                            field: "Actualizado",
                            title: window.app.idioma.t('ULT_MODIFICACION'),
                            width: 155,
                            //format: "{0:" + kendo.culture().calendar.patterns.MES_FechaHora + "}",
                            template: '#: kendo.toString(new Date(Actualizado), kendo.culture().calendars.standard.patterns.MES_FechaHora)#',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendar.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        }
                    ],
                    dataBinding: self.resizeGrid,
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];

                                row.cells[0].value = kendo.toString(e.data[dataPosition].FechaCreacion, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[1].value = kendo.toString(e.data[dataPosition].FechaProduccion, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[2].value = kendo.toString(e.data[dataPosition].FechaNoConformidad, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[4].value = ObtenerLineaDescripcion(e.data[dataPosition].NumeroLinea);
                                row.cells[8].value = kendo.toString(e.data[dataPosition].Actualizado, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                            } catch (e) {
                            }
                        }
                    },
                }).data("kendoGrid");   
            },
            events: {
                'click #btnConsultar': 'actualiza',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnExportExcel': 'exportExcel',
            },
            actualiza: function () {
                var self = this;

                self.inicio = $("#dtpFechaDesde").getKendoDateTimePicker().value();
                self.fin = $("#dtpFechaHasta").getKendoDateTimePicker().value();

                if (!self.inicio || !self.fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LAS_FECHAS_INTRODUCIDAS'), 3000);
                    return;
                }

                if (self.inicio > self.fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('_LA_FECHA'), 3000);
                    return;
                }

                RecargarGrid({ grid: self.grid });
            },
            exportExcel: function () {
                var grid = $("#gridGestionNoConformidad").data("kendoGrid");
                grid.saveAsExcel();
            },
            LimpiarFiltroGrid: function () {
                const self = this;

                self.ds.query({
                    group: [],
                    filter: [],
                    page: 1
                });
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

                var gridElement = $("#gridGestionNoConformidad"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            },
        });

        return gridGestionNoConformidad;
    });