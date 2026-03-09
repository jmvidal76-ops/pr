define(['underscore', 'backbone', 'jquery', 'text!../../../Administracion/html/LogAplicacion.html', 'compartido/notificaciones', 'jszip'],
    function (_, Backbone, $, PlantillaLogBook, Not, JSZip) {
        var Logbook = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            fin: new Date(),
            inicio: new Date((new Date()).getTime() - (7 * 24 * 3600 * 1000)),
            template: _.template(PlantillaLogBook),
            initialize: function() {
                var self = this;
                window.JSZip = JSZip;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.ds = new kendo.data.DataSource({
                    pageSize: 100,
                    transport: {
                        read: {
                            url: "../api/obtenerLogBook/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function(options, operation) {

                            if (operation === "read") {

                                var result = {};

                                result.fInicio = self.inicio;
                                result.fFin = self.fin;

                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    schema: {
                        model: {
                            fields: {
                                'Fecha': { type: "date" },
                                'applicationID': { type: "string" },
                                'description': { type: "string" },
                                'objectId': { type: "string" },
                                'userName': { type: "string" },
                                'computerName': { type: "string" },
                                'processName': { type: "string" },
                                'descSection': { type: "string" },
                                'descLevel': { type: "string" },
                                'section': { type: "number" },
                                'level': { type: "number" }
                            }
                        }
                    },
                    requestStart: function() {
                        if ($("#gridLogBook").data("kendoGrid") && $("#gridLogBook").data("kendoGrid").dataSource && $("#gridLogBook").data("kendoGrid").dataSource.data() && $("#gridLogBook").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridLogBook"), true);
                        }
                    },
                    requestEnd: function() {
                        if ($("#gridLogBook").data("kendoGrid") && $("#gridLogBook").data("kendoGrid").dataSource && $("#gridLogBook").data("kendoGrid").dataSource.data() && $("#gridLogBook").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridLogBook"), false);
                        }
                    },
                    error: function(e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            $("#center-pane").empty();
                        }
                    },
                    pageSize: 100
                });

                self.render();
            },
            events: {
                'click #btnFiltrar': 'actualiza',
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
                var grid = $("#gridLogBook").data("kendoGrid");
                grid.saveAsExcel();
            },
            LimpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            render: function() {
                $(this.el).html(this.template())
                $("#center-pane").append($(this.el))
                var self = this;

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

                self.grid = this.$("#gridLogBook").kendoGrid({
                    dataSource: self.ds,
                    excel: {
                        fileName: window.app.idioma.t("LOG_APLICACION") + ".xlsx",
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
                        pageSizes: [100, 200, 500],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        { field: "objectId", title: window.app.idioma.t('OBJECT_ID'), width: 75 },
                        {
                            field: "Fecha",
                            title: window.app.idioma.t('FECHA_HORA'),
                            format: "{0:dd/MM/yyyy HH:mm:ss}",
                            width: 105,
                            filterable: {
                                extra: true,
                                ui: function(element) {
                                    element.kendoDateTimePicker({
                                        format: "dd/MM/yyyy HH:mm:ss",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },                        
                        {
                            field: "applicationID",
                            title: window.app.idioma.t('TIPO_APLICACIÓN'),
                            width: 90,
                            filterable: {
                                multi: true,
                                itemTemplate: function(e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=applicationID#' style='width: 14px;height:14px;margin-right:5px;'/>#= applicationID#</label></div>";
                                    }
                                }
                            }
                        },
                        { field: "description", title: window.app.idioma.t('DESCRIPCIONAREA'), width: 310 },
                        {
                            field: "descSection",
                            title: window.app.idioma.t('SECCION'),
                            width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function(e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=descSection#' style='width: 14px;height:14px;margin-right:5px;'/>#= descSection#</label></div>";
                                    }
                                }
                            }
                        },
                        { field: "section", hidden: true },
                        {
                            field: "descLevel",
                            title: window.app.idioma.t('NIVEL'),
                            width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function(e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=descLevel#' style='width: 14px;height:14px;margin-right:5px;'/>#= descLevel#</label></div>";
                                    }
                                }
                            }
                        },
                        { field: "level", hidden: true },                        
                        {
                            field: "processName",
                            title: window.app.idioma.t('PROCEDIMIENTO'),
                            width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=processName#' style='width: 14px;height:14px;margin-right:5px;'/>#= processName#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "userName",
                            title: window.app.idioma.t('USUARIO'),
                            width: 90,
                            filterable: {
                                multi: true,
                                itemTemplate: function(e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=userName#' style='width: 14px;height:14px;margin-right:5px;'/>#= userName#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "computerName",
                            title: window.app.idioma.t('MAQUINA'),
                            width: 80,
                            filterable: {
                                multi: true,
                                itemTemplate: function(e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=computerName#' style='width: 14px;height:14px;margin-right:5px;'/>#= computerName#</label></div>";
                                    }
                                }
                            }
                        },

                    ],
                    dataBound: function(e) {
                        //avisamos si se han llegado al limite de 30000registros
                        var numItems = e.sender.dataSource.data().length;
                        if (numItems >= 30000) {
                            //“El resultado de la consulta excede del límite de 30.000 registros, por favor, acote en el filtro de búsqueda un rango de fechas menor”.
                            Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('EXCEDE_DEL_LIMITE_REGISTROS'), 10000);
                        }
                    },
                    dataBinding: self.resizeGrid,
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];

                                row.cells[1].value = kendo.toString(e.data[dataPosition].Fecha, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                            } catch (e) {
                            }
                        }
                    },
                }).data("kendoGrid");
            },
            eliminar: function() {
                this.remove();
            },
            resizeGrid: function() {

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosdivFiltrosHeader = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridLogBook"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function() {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosdivFiltrosHeader - 2);
            }
        });

        return Logbook;
    });