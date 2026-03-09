define(['underscore', 'backbone', 'jquery', 'text!../../../Administracion/html/HistoricoIncidencias.html', 'compartido/notificaciones'],
    function(_, Backbone, $, PlantillaLogIncidencias, Not) {
        var LogIncidencias = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            fin: new Date(),
            inicio: new Date(new Date().getFullYear(), 0, 1),
            template: _.template(PlantillaLogIncidencias),
            initialize: function() {
                var self = this;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.ds = new kendo.data.DataSource({
                    pageSize: 100,
                    transport: {
                        read: {
                            url: "../api/obtenerLogIncidencias/",
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
                                'ID_INCIDENCIA': { type: "number" },
                                'USUARIO': { type: "string" },
                                'PANTALLA': { type: "string" },
                                'DESCRIPCION': { type: "string" },
                                'APLICACION': { type: "string" },
                                'FECHA_CREACION': {type:"date"}
                            }
                        }
                    },
                    requestStart: function() {
                        if ($("#gridLogIncidencias").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridLogIncidencias"), true);
                        }
                    },
                    requestEnd: function() {
                        if ($("#gridLogIncidencias").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridLogIncidencias"), false);
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
            actualiza: function() {
                var self = this;
                $("form.k-filter-menu button[type='reset']").trigger("click");
                self.inicio = $("#dtpFechaDesde").data("kendoDatePicker").value();
                self.fin = $("#dtpFechaHasta").data("kendoDatePicker").value();
                self.ds.page(1);
                self.ds.read();
            },
            LimpiarFiltroGrid: function() {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            events: {
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnFiltrar': 'actualiza',
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

                self.grid = this.$("#gridLogIncidencias").kendoGrid({
                    dataSource: self.ds,
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
                        {
                            field: "ID_INCIDENCIA",
                            hidden: true
                        },
                        {
                            field: "FECHA_CREACION",
                            title: window.app.idioma.t('FECHA'),
                            format: "{0:dd/MM/yyyy HH:mm:ss}",
                            width: 80,
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: "dd/MM/yyyy HH:mm:ss",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "USUARIO",
                            title: window.app.idioma.t('USUARIO'),
                            width: 100,
                        },
                        {
                            field: "PANTALLA",
                            title: window.app.idioma.t('PANTALLA'),
                            width: 100
                        },
                        {
                            field: "DESCRIPCION",
                            title: window.app.idioma.t('DESCRIPCION'),
                            width: 300
                        },
                        {
                            field: "APLICACION",
                            title: window.app.idioma.t('APLICACION'),
                            width: 100,
                        },
                    ],
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");
            },
            eliminar: function() {
                this.remove();
            },
            resizeGrid: function() {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosdivFiltrosHeader = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridLogIncidencias"),
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

        return LogIncidencias;
    });