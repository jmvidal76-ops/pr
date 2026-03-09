define(['underscore', 'backbone', 'jquery', 'text!../../../Administracion/html/LogUsuarios.html', 'compartido/notificaciones', 'jszip'],
    function (_, Backbone, $, PlantillaLogUsuarios, Not, JSZip) {
        var gridLogUsuarios = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            fin: new Date(),
            inicio: new Date((new Date()).getTime() - (7 * 24 * 3600 * 1000)),
            template: _.template(PlantillaLogUsuarios),
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
                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/obtenerLogUsuarios/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.fInicio = new Date(self.inicio.setHours(0, 0, 0));
                                result.fFin = new Date(self.fin.addDays(1).setHours(0, 0, 0));
                                return JSON.stringify(result);
                            }
                            return kendo.stringify(options);
                        }
                    },
                    schema: {
                        model: {
                            fields: {
                                'id': { type: "number" },
                                'fechaHora': { type: "date" },
                                'funcion': { type: "string" },
                                'tipo': { type: "string" },
                                'evento': { type: "string" },
                                'usuario': { type: "string" }
                            }
                        }
                    },
                    requestStart: function () {
                        if ($("#gridLogUsuarios").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridLogUsuarios"), true);
                        }
                    },
                    requestEnd: function () {
                        if ($("#gridLogUsuarios").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridLogUsuarios"), false);
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            $("#center-pane").empty();
                        }
                    },
                    pageSize: 100
                });

                $("#dtpFechaDesde").kendoDatePicker({
                    value: self.inicio,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#dtpFechaHasta").kendoDatePicker({
                    value: self.fin,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                self.grid = this.$("#gridLogUsuarios").kendoGrid({
                    dataSource: self.ds,
                    excel: {
                        fileName: window.app.idioma.t("LOG_USUARIOS") + ".xlsx",
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
                        pageSizes: [100, 200, 500, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [

                        { field: "id", title: window.app.idioma.t('ID'), width: 60},
                        { field: "fechaHora", title: window.app.idioma.t('FECHA_HORA'), format: "{0:dd/MM/yyyy HH:mm:ss}", width: 105, 
                          filterable: { // agomezn 300516: 010 Al filtrar los log por fecha no sale nada no tiene el mismo formato de fecha
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: "dd/MM/yyyy HH:mm:ss",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        { field: "funcion", title: window.app.idioma.t('FUNCIONES'), width: 300 },
                        {
                            field: "tipo", title: window.app.idioma.t('TIPO'), width: 75,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=tipo#' style='width: 14px;height:14px;margin-right:5px;'/>#= tipo#</label></div>";
                                    }
                                }
                            }
                        },
                        { field: "evento", title: window.app.idioma.t('ALT_GESTION_TemplatesTriggers'), width: 400 },
                        {
                            field: "usuario", title: window.app.idioma.t('USUARIO'), width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=usuario#' style='width: 14px;height:14px;margin-right:5px;'/>#= usuario#</label></div>";
                                    }
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

                                row.cells[1].value = kendo.toString(e.data[dataPosition].fechaHora, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                            } catch (e) {
                            }
                        }
                    },
                }).data("kendoGrid");
            },
            events: {
                'click  #btnFiltrar': 'actualiza',
                'click #btnExportExcel': 'exportExcel',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
            },
            actualiza: function () {
                var self = this;
                $("form.k-filter-menu button[type='reset']").trigger("click");
                self.inicio = $("#dtpFechaDesde").data("kendoDatePicker").value();
                self.fin = $("#dtpFechaHasta").data("kendoDatePicker").value();
                self.ds.page(1);
                self.ds.read();
            },
            exportExcel: function () {
                var grid = $("#gridLogUsuarios").data("kendoGrid");
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
                var filtrosdivFiltrosHeader = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridLogUsuarios"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosdivFiltrosHeader - 2);
            },
            LimpiarFiltroGrid: function () { // agomezn 300516: 040 Incluir un botón "Limpiar filtros" en las páginas donde se usen filtros
                $("form.k-filter-menu button[type='reset']").trigger("click");
            }
        });

        return gridLogUsuarios;
    });