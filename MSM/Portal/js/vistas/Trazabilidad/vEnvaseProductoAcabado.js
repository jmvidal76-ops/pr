define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/EnvaseProductoAcabado.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion', 'compartido/utils', "jszip"],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, Session, JSZip) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            dsEnvasePale: null,
            gridEnvasePale: null,
            //#endregion ATTRIBUTES

            initialize: function () {
                kendo.culture(localStorage.getItem("idiomaSeleccionado"));
                var self = this;
 
                self.dataSourceEnvasePale(self);
                self.render();
                self.renderGridEnvasePale(self);
                self.resizeGrid();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());
                window.JSZip = JSZip;

                const popover = $('[data-toggle="popover"]');
                popover.popover();

                popover.click(function (e) {
                    e.stopPropagation();
                });
                $(document).click(function (e) {
                    if (($('.popover').has(e.target).length == 0) || $(e.target).is('.close')) {
                        popover.popover('hide');
                    }
                });

                var ExtGrid = kendo.ui.Grid.extend({
                    options: {
                        toolbarColumnMenu: false,
                        name: "ExtGrid",
                    },
                    init: function (element, options) {
                        /// <summary>
                        /// Initialize the widget.
                        /// </summary>

                        if (options.toolbarColumnMenu === true && typeof options.toolbar === "undefined") {
                            options.toolbar = [];

                        }
                        kendo.ui.Grid.fn.init.call(this, element, options);
                        this._initToolbarColumnMenu();
                    },

                    _initToolbarColumnMenu: function () {
                        // The toolbar column menu should be displayed.
                        if (this.options.toolbarColumnMenu === true && this.element.find(".k-ext-grid-columnmenu").length === 0) {

                        }
                    },
                    _findColumnByTitle: function (title) {
                        var result = null;

                        for (var idx = 0; idx < this.columns.length && result === null; idx++) {
                            column = this.columns[idx];

                            if (column.title === title) {
                                result = column;
                            }
                        }
                        return result;
                    }
                });

                kendo.ui.plugin(ExtGrid);

                $("#minutos").kendoNumericTextBox({
                    min: 1,
                    max: 10000,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 0,
                    format: "{0:n0}",
                });

                var lineaDrop = $("#idLinea").kendoDropDownList({
                    dataValueField: "id",
                    template: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    valueTemplate: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "numLinea", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                }).data("kendoDropDownList");
                lineaDrop.list.width("auto");

                $("#fecha").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    dateInput: true,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });
            },
            events: {
                'click #btnConvertir': 'convertir',
                'click #btnExportExcel': 'exportExcel',
                'click #btnConsultar': 'consultar'
            },
            convertir: function () {
                $.ajax({
                    type: "GET",
                    url: "../api/convertirLoteALineaFecha/" + $("#loteEnvase").val(),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        $("#idLinea").data("kendoDropDownList").value(res.IdLinea);
                        $("#fecha").getKendoDateTimePicker().value(res.Fecha);
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), err.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            consultar: function () {
                var idLinea = $("#idLinea").val() == "" ? null : $("#idLinea").val();
                var fecha = $("#fecha").val() != "" ? kendo.parseDate($("#fecha").data('kendoDateTimePicker').value(), kendo.culture().calendars.standard.patterns.MES_FechaHora) : null;
                var minutos = $("#minutos").val() == "" ? null : $("#minutos").val();
                if (fecha == null || idLinea == null || minutos == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_UTILIZAR_TODOS_FILTROS'), 5000);
                }
                else {
                    $('#gridEnvasePale').data('kendoExtGrid').dataSource.read();
                }
            },

            dataSourceEnvasePale: function (self) {
                self.dsEnvasePale = new kendo.data.DataSource({
                    async: true,
                    transport: {
                        read: {
                            url: "../api/ObtenerEnvaseProductoAcabado",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "PUT"
                        },
                        parameterMap: function (options, type) {
                            if (type == "read") {
                                var _options = {
                                    Fecha: $("#fecha").val() == "" ? null : kendo.parseDate($("#fecha").data('kendoDateTimePicker').value(), kendo.culture().calendars.standard.patterns.MES_FechaHora),
                                    IdLinea: $("#idLinea").val() == "" ? null : $("#idLinea").val(),
                                    Minutos: $("#minutos").val() == "" ? 1 : $("#minutos").val(),
                                }

                                return JSON.stringify(_options);
                            }
                        }
                    },
                    requestStart: function (e) {
                        var fecha = $("#fecha").val() == "" ? null : $("#fecha").val();
                        var idLinea = $("#idLinea").val() == "" ? null : $("#idLinea").val();
                        var minutos = $("#minutos").val() == "" ? 1 : $("#minutos").val();
                        if (!fecha || !idLinea || !minutos) {
                            e.preventDefault();
                        }
                    },
                    schema: {
                        model: {
                            id: "IdLoteMES",
                            fields: {
                                'Fecha': { type: "date" },
                                'NumLinea': { type: "number" },
                                'SSCC': { type: "string" },
                                'IdLoteMES': { type: "string" },
                                'Referencia': { type: "string" },
                                'WO': { type: "string" },
                            }
                        }
                    },
                    sort: {
                        field: "Fecha",
                        dir: "desc"
                    },
                    pageSize: 1000,
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_FECHA_STOCK'), 5000);
                    }
                });
                return self.dsPaletPorMMPP;
            },

            renderGridEnvasePale: function (self) {
                self.gridPaleProductoAcabado = $("#gridEnvasePale").kendoExtGrid({
                    excel: {
                        fileName: window.app.idioma.t("ENVASE_PRODUCTOACABADO") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    dataSource: self.dsEnvasePale,
                    autoBind: true,
                    sortable: true,
                    selectable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 1000, 5000, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    noRecords: {
                        template: window.app.idioma.t("SIN_RESULTADOS")
                    },
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    toolbar: [
                        {
                            template: "<button type='button' id='btnExportExcel' class='k-button k-button-icontext' style='float:right;margin-left:5px;'> <span class='k-icon k-i-excel'></span>" + window.app.idioma.t('EXPORTAR_EXCEL') + "</button>"
                        },
                    ],
                    columns: [
                        {
                            title: window.app.idioma.t("IDLOTEMESPRODUCTOACABADO"),
                            field: 'IdLoteMES',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("SSCC"),
                            field: 'SSCC',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("FECHA_PRODUCCION"),
                            field: 'Fecha',
                            template: '#= Fecha != null ? kendo.toString(new Date(Fecha), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("NUMLINEA"),
                            field: 'NumLinea',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("CODIGO_PRODUCTO"),
                            field: 'Referencia',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("WO"),
                            field: 'WO',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                    ],
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];
                                row.cells[2].value = kendo.toString(new Date(row.cells[2].value), kendo.culture().calendars.standard.patterns.MES_FechaHora);
                            } catch (e) {
                                console.error("Error excelExport");
                            }
                        }
                    },
                    dataBound: function () {
                        self.resizeGrid();
                    }
                });

                $("#divPaletsPorMMPP").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");
            },

            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtros = $("#gridFilters").height();

                var gridElement = $("#gridEnvasePale"),
                    dataArea = gridElement.find(".k-grid-content"),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtros - 10);
            },
            exportExcel: function () {
                require(['jszip'], function (JSZip) {
                    window.JSZip = JSZip;

                    var grid = $("#gridEnvasePale").data("kendoExtGrid"); // Cambia a "kendoExtGrid" si estás usando ese tipo de grid
                    if (grid) {
                        grid.saveAsExcel(); // Verifica si el método saveAsExcel está disponible para kendoExtGrid
                    } else {
                        console.error("Grid no encontrado o no está inicializado correctamente.");
                    }
                });
            },
            eliminar: function () {
                $('[data-toggle="popover"]').popover('hide');
                this.remove();
            },
        });

        return vista;
    })

