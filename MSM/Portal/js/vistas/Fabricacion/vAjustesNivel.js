define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/AjustesNivel.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', 'jszip', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, Plantilla, VistaDlgConfirm, Not, JSZip, enums) {
        var VistaTransferencias = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            grid: null,
            ds: null,
            constEstadosMensajesSAI: enums.EstadosMensajesSAI(),
            inicio: new Date((new Date()).getTime() - (24 * 60 * 60 * 1000)),
            fin: new Date((new Date()).getTime()),
            template: _.template(Plantilla),
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

                self.ds = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ObtenerAjustesNivel",
                            data: function () {
                                var result = {};
                                return result;
                            },
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST",
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var fechas = {
                                    fechaInicio: self.inicio,
                                    fechaFin: self.fin
                                };
                                return JSON.stringify(fechas);
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: "IdNivelUbicacion",
                            fields: {
                                IdNivelUbicacion: { type: "number", editable: false },
                                Cantidad: { type: "number", editable: false },
                                UbicacionOrigen: { type: "string", editable: false },
                                Unidad: { type: "string", editable: false },
                                Procesado: { type: "number", editable: false },
                                MensajeProcesado: { type: "string", editable: false },
                                Creado: { type: "date", editable: false }
                            }
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            $("#center-pane").empty();
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                $("#dtpFechaDesde").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: self.inicio
                }).data("kendoDateTimePicker");

                $("#dtpFechaHasta").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: self.fin
                }).data("kendoDateTimePicker");

                self.grid = this.$("#grid").kendoGrid({
                    autoBind: false,
                    dataSource: self.ds,
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
                            field: "IdNivelUbicacion", title: window.app.idioma.t("ID_NIVEL_UBICACION"), width: 30,
                        },
                        {
                            field: "UbicacionOrigen", title: window.app.idioma.t("UBICACION_ORIGEN"), width: 80,
                        },
                        {
                            field: "Cantidad",
                            title: window.app.idioma.t("CANTIDAD"),
                            width: 60,
                            template: '<span class="addTooltip">#= kendo.format("{0:n2}",Cantidad)#</span>',
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        decimals: 2
                                    });
                                }
                            }
                        },
                        {
                            field: "Unidad", title: window.app.idioma.t("UNIDAD_MEDIDA"), width: 30,
                        },
                        {
                            field: "Procesado",
                            title: window.app.idioma.t("PROCESADO"),
                            width: 40,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        {
                            field: "MensajeProcesado", title: window.app.idioma.t("MENSAJE_ERROR"), width: 130,
                        },
                        {
                            field: "Creado",
                            title: window.app.idioma.t('CREADO'),
                            template: function (e) { return e.Creado == null ? "" : kendo.toString(kendo.parseDate(e.Creado), kendo.culture().calendars.standard.patterns.MES_FechaHora); },
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            width: 90,
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupable: false
                        }
                    ],
                    dataBinding: self.resizeGrid,
                    dataBound: function () {
                        var grid = $("#grid").data("kendoGrid");
                        var data = grid.dataSource.data();
                        $.each(data, function (i, row) {
                            if (row.Procesado === self.constEstadosMensajesSAI.Procesado) {
                                $('tr[data-uid="' + row.uid + '"] ').css("background-color", "#dff5df");
                            }
                            if (row.Procesado === self.constEstadosMensajesSAI.Fallido) {
                                $('tr[data-uid="' + row.uid + '"] ').css("background-color", "#ffc4e9");
                            }
                            if (row.Procesado === self.constEstadosMensajesSAI.SinProcesarNoMotivo) {
                                $('tr[data-uid="' + row.uid + '"] ').css("background-color", "#c4ffff");
                            }
                        })
                    }
                }).data("kendoGrid");

                self.resizeGrid();
                self.ds.read();
            },
            filtrar: function () {
                var self = this;
                var _iniciofecha = $("#dtpFechaDesde").data("kendoDateTimePicker").value();
                var _finfecha = $("#dtpFechaHasta").data("kendoDateTimePicker").value();
                var _mensaje = "";

                if ((_iniciofecha == "" || _iniciofecha == null) && (_finfecha == "") || _finfecha == null) {
                    _mensaje = window.app.idioma.t('SELECCIONE_FECHAS');
                }

                if (_iniciofecha == "" || _iniciofecha == null) {
                    _mensaje = window.app.idioma.t('SELECCIONE_FECHAS');
                }

                if (_finfecha == "" || _finfecha == null) {
                    _mensaje = window.app.idioma.t('SELECCIONE_FECHAS');
                }

                if (Date.parse(_iniciofecha) > Date.parse(_finfecha)) {
                    _mensaje = window.app.idioma.t('ERROR_FECHA_FIN_MENOR_INICIO');
                }
                if (_mensaje !== "") {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), _mensaje, 4000);
                    return false;
                }


                //self.timeline.destroy()
                self.inicio = _iniciofecha;
                self.fin = _finfecha;
                self.actualizar();
            },
            actualizar: function () {
                var self = this;
                self.ds.read()
            },
            events: {
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnFiltrar': 'filtrar'
            },
            eliminar: function () {
                this.remove();
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#grid"),
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
                if ($("#grid").data("kendoGrid").dataSource.filter() != undefined) {
                    $("form.k-filter-menu button[type='reset']").trigger("click");
                }
            },
        });

        return VistaTransferencias;
    });