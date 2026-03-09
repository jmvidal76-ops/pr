define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/EnvasadoTrazabilidadAscendente.html', 'compartido/notificaciones', 'compartido/utils', "jszip"],
    function (_, Backbone, $, plantillaMMPPProductoAcabado, Not, Utils, JSZip) {
        var gridProductoAcabadoMMPP = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(plantillaMMPPProductoAcabado),
            checkedIds: {},
            tmpToolbar: null,
            dsLotesConsumidos: null,
            gridLotesConsumidos: null,
            dsLoteProductoAcabado: null,
            gridLoteProductoAcabado: null,
            IdLoteMESSelec: null, 
            
            initialize: function () {
                kendo.culture(localStorage.getItem("idiomaSeleccionado"));
                var self = this;
                self.render();
            },
            render: function () {
                var self = this;
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));
                window.JSZip = JSZip;

                self.tmpToolbar = kendo.template($("#tmpToolbar").html());
                self.renderElementsFilters();
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

                self.DataSourceLoteProductoAcabado(self);
                self.ObtenerGridLoteProductoAcabado(self);
                self.DataSourceLoteConsumido(self);
                self.ObtenerGridLoteConsumido(self);

                var datenow = new Date();
            
                self.ResizeTab();

                $("#divSplitterV").kendoSplitter({
                    orientation: "vertical",
                    panes: [
                        { collapsible: false, size: "60%" },
                        { collapsible: false},
                    ]
                });
            },
            events: {
                'click #btnExcelStock': 'exportExcel',
                'click #btnExcelPaletsPorMMPP': 'exportExcelPaletsPorMMPP',
                'click #btnLimpiarFiltros': 'limpiarFiltros',
                'click #btnConsultar': function () {
                    var IdLinea = $("#selectLinea").val() == "" ? null : $("#selectLinea").val();
                    var Fecha = $("#cmbFecha").val() != "" ? kendo.parseDate($("#cmbFecha").data('kendoDateTimePicker').value(), "yyyy-mm-dd hh:mm:ss") : null;
                    var SSCC = $("#iSSCC").val() == "" ? null : $("#iSSCC").val();

                    if (SSCC == null && IdLinea == null) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_UTILIZAR_FILTRO'), 5000);
                    }
                    else if (IdLinea != null && Fecha == null) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('MSG_FILTRO_LINEA_FECHA'), 5000);
                    }
                    else {
                        $('#divLotesConsumidos').data('kendoExtGrid').dataSource.read();
                        $('#divLotesProductoAcabado').data('kendoExtGrid').dataSource.read();
                    }
                },
            },

            exportExcel: function (e) {
                $("#divLotesConsumidos").data("kendoExtGrid").options.excel.fileName = window.app.idioma.t('LOTES_MMPP')+".xlsx";
                $("#divLotesConsumidos").data("kendoExtGrid").saveAsExcel();
            },

            exportExcelPaletsPorMMPP: function (e) {
                $("#divLotesProductoAcabado").data("kendoExtGrid").options.excel.fileName = window.app.idioma.t('LOTES_PROD_ACABADO_MMPPO') + ".xlsx";
                $("#divLotesProductoAcabado").data("kendoExtGrid").saveAsExcel();
            },

            limpiarFiltros: function (self) {
                var dpLinea = $("#selectLinea").data("kendoDropDownList");
                dpLinea.text("");
                dpLinea.value("");
                $("#cmbFecha").data("kendoDateTimePicker").value('');
                $("#cmbFecha").val('');
                $("#iSSCC").val('');
            },

            //Metodo que renderiza todos los elementos del pre-filtrado
            renderElementsFilters: function () {
                $("#gridFilters").kendoGrid({
                    toolbar: [
                        {
                            template: kendo.template($("#tmpToolbar").html())
                        },
                        {
                            template: '<label for="selectLinea" class="k-input-label" style="margin-right: 5px;">' + window.app.idioma.t("LINEA") + '</label>' +
                                '<select id="selectLinea" style="width:200px;margin-right: 5px;"></select>' + 
                                '<label for="cmbFecha" class="k-input-label" style="margin-right: 5px;">' + window.app.idioma.t("FECHA_ENVASE") + '</label>' +
                                '<input placeholder="' + window.app.idioma.t('SELECCIONE') + '" id="cmbFecha" style="margin-right:5px;width:11%" />' +
                                '<label class="k-input-label" style="margin-right: 5px;">' + window.app.idioma.t("SSCC_PROD_ACAB") + '</label>' +
                                '<input id="iSSCC" type="text" class="k-textbox" style="margin-right: 5px;" />' + 
                                '<button id="btnConsultar" class="k-button k-button-icontext"  style="float:right;"><span class="k-icon k-i-search"></span>' + window.app.idioma.t('CONSULTAR') + '</button>'
                        },
                        {
                            template: '<button id="btnLimpiarFiltros" style="float:right;" class="k-button k-button-icontext k-i-delete" style="background-color:darkorange; color:white;margin-left:5px;"><span class="k-icon k-i-funnel-clear"></span>#: window.app.idioma.t("QUITAR_FILTROS")#</button>'
                        }
                    ]
                })
                var lineaDrop = $("#selectLinea").kendoDropDownList({
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

                var datenow = new Date();
                var _fecha = $("#cmbFecha").kendoDateTimePicker({
                    value: new Date(datenow.getFullYear(), datenow.getMonth() - 1, 1),
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    dateInput: true,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#cmbFecha").data("kendoDateTimePicker").value('');
                $("#cmbFecha").val('');
            },

            DataSourceLoteConsumido: function (self) {
                self.dsLotesConsumidos = new kendo.data.DataSource({
                    batch: false,
                    async: true,
                    transport: {
                        read: {
                            url: "../api/ObtenerLotesConsumidos",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "PUT"
                        },
                        parameterMap: function (options, type) {
                            if (type == "read") {
                                var iFecha = $("#cmbFecha").data('kendoDateTimePicker').value();
                                var _options = {
                                    IdLinea : $("#selectLinea").val() == "" ? null : $("#selectLinea").val(),
                                    Fecha: iFecha != "" ? iFecha : null,
                                    SSCC : $("#iSSCC").val() == "" ? null : $("#iSSCC").val()
                                }
                                return JSON.stringify(_options);
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: "LOTE_MES",
                            fields: {
                                'FECHA_ENTRADA_PLANTA': { type: "date" },
                                'LOTE_MES': { type: "string" },
                                'REFERENCIA_MES': { type: "string" },
                                'MATERIAL': { type: "string" },
                                'TIPO_MATERIAL': { type: "string" },
                                'CLASE_MATERIAL': { type: "string" },
                                'ID_PROVEEDOR': { type: "string" },
                                'PROVEEDOR': { type: "string" },
                                'LOTE_PROVEEDOR': { type: "string" },
                                'UNIDADES': { type: "string" },
                                'UBICACION': { type: "string" },
                                'FECHA_INICIO_CONSUMO': { type: "date" },
                                'FECHA_FIN_CONSUMO': { type: "date" },
                                'FECHA_INICIO_ETIQUETA': { type: "date" },
                                'FECHA_FIN_ETIQUETA': { type: "date" },
                                'FECHA_INICIO_CONSUMO_CODIFICADOR': { type: "date" },
                                'FECHA_FIN_CONSUMO_CODIFICADOR': { type: "date" },
                                'CANTIDAD_INICIAL': { type: "number" },
                            }
                        }
                    },
                    aggregate: [
                        { field: "CANTIDAD_INICIAL", aggregate: "sum" }
                    ],
                    sort: {
                        field: "FECHA_ENTRADA_PLANTA",
                        dir: "asc"
                    },
                    pageSize: 1000,
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_FECHA_STOCK'), 5000);
                    }
                });
                return self.dsLotesConsumidos;
            },

            ObtenerGridLoteConsumido: function (self) {
                self.gridLotesConsumidos = $("#divLotesConsumidos").kendoExtGrid({
                    dataSource: self.dsLotesConsumidos,
                    autoBind: false,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    sortable: true,
                    toolbarColumnMenu: true,
                    scrollable: true,
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
                            template: '<label class="k-input-label" style="margin-right: 5px;">' + window.app.idioma.t("LOTES_MMPP") + '</label>'
                        },
                        {
                            template: "<button type='button' id='btnExcelStock' class='k-button k-button-icontext' style='float:right;margin-left:5px;'> <span class='k-icon k-i-excel'></span>" + window.app.idioma.t('EXPORTAR_EXCEL') + "</button>"
                        },
                    ],
                    columns: [
                        {
                            title: window.app.idioma.t("FECHA_ENTRADA_PLANTA"),
                            field: 'FECHA_ENTRADA_PLANTA',
                            template: '#= FECHA_ENTRADA_PLANTA != null ? kendo.toString(new Date(FECHA_ENTRADA_PLANTA), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
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
                            title: window.app.idioma.t("IDLOTEMESMMPP"),
                            field: 'LOTE_MES',
                            width: '400px',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            title: window.app.idioma.t("CODIGO_JDE"),
                            field: 'REFERENCIA_MES',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=REFERENCIA_MES#' style='width: 14px;height:14px;margin-right:5px;'/>#= REFERENCIA_MES#</label></div>";
                                    }
                                }
                            },

                        },
                        {
                            title: window.app.idioma.t("MATERIAL"),
                            field: 'MATERIAL',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=MATERIAL#' style='width: 14px;height:14px;margin-right:5px;'/>#= MATERIAL#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("TIPO_MATERIAL"),
                            field: 'TIPO_MATERIAL',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=TIPO_MATERIAL#' style='width: 14px;height:14px;margin-right:5px;'/>#= TIPO_MATERIAL#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            title: window.app.idioma.t("CLASE_MATERIAL"),
                            field: 'CLASE_MATERIAL',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=CLASE_MATERIAL#' style='width: 14px;height:14px;margin-right:5px;'/>#= CLASE_MATERIAL#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("PROVEEDOR"),
                            field: 'PROVEEDOR',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=PROVEEDOR#' style='width: 14px;height:14px;margin-right:5px;'/>#= PROVEEDOR#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("LOTE_PROVEEDOR"),
                            field: 'LOTE_PROVEEDOR',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=LOTE_PROVEEDOR#' style='width: 14px;height:14px;margin-right:5px;'/>#= LOTE_PROVEEDOR#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD"),
                            field: 'CANTIDAD_INICIAL',
                            template: '#=typeof CANTIDAD_INICIAL !== "undefined" && CANTIDAD_INICIAL !== null ?   kendo.format("{0:n2}", CANTIDAD_INICIAL) : ""#',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: true,
                            aggregates: ["sum"],
                            groupFooterTemplate: "Total: #: kendo.toString(sum, 'n2') #"
                        },
                        {
                            title: window.app.idioma.t("UNIDAD_MEDIDA"),
                            field: 'UNIDADES',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=UNIDADES#' style='width: 14px;height:14px;margin-right:5px;'/>#= UNIDADES#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            title: window.app.idioma.t("UBICACION"),
                            field: 'UBICACION',
                            filterable: true,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("FECHA_INICIO_CONSUMO"),
                            field: 'FECHA_INICIO_CONSUMO',
                            template: '#= FECHA_INICIO_CONSUMO != null ? kendo.toString(new Date(FECHA_INICIO_CONSUMO), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #',
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
                            title: window.app.idioma.t("FECHA_FIN_CONSUMO"),
                            field: 'FECHA_FIN_CONSUMO',
                            template: '#= FECHA_FIN_CONSUMO != null ? kendo.toString(new Date(FECHA_FIN_CONSUMO), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #',
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
                            title: window.app.idioma.t("FECHA_INICIO_ETIQUETA"),
                            field: 'FECHA_INICIO_ETIQUETA',
                            template: '#= FECHA_INICIO_ETIQUETA != null ? kendo.toString(new Date(FECHA_INICIO_ETIQUETA), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #',
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
                            title: window.app.idioma.t("FECHA_FIN_ETIQUETA"),
                            field: 'FECHA_FIN_ETIQUETA',
                            template: '#= FECHA_FIN_ETIQUETA != null ? kendo.toString(new Date(FECHA_FIN_ETIQUETA), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #',
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
                            title: window.app.idioma.t("FECHA_INI_CODI"),
                            field: 'FECHA_INICIO_CONSUMO_CODIFICADOR',
                            template: '#= FECHA_INICIO_CONSUMO_CODIFICADOR != null ? kendo.toString(new Date(FECHA_INICIO_CONSUMO_CODIFICADOR), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #',
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
                            title: window.app.idioma.t("FECHA_FIN_CODI"),
                            field: 'FECHA_FIN_CONSUMO_CODIFICADOR',
                            template: '#= FECHA_FIN_CONSUMO_CODIFICADOR != null ? kendo.toString(new Date(FECHA_FIN_CONSUMO_CODIFICADOR), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #',
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
                    ],
                    dataBound: function (e) {
                        
                    }
                });

                $("#divLotesConsumidos").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");
            },

            DataSourceLoteProductoAcabado: function (self) {
                self.dsLoteProductoAcabado = new kendo.data.DataSource({
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerInfoLotesProductoAcabado",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "PUT"
                        },
                        parameterMap: function (options, type) {
                            if (type == "read") {
                                var iFecha = $("#cmbFecha").data('kendoDateTimePicker').value();
                                var _options = {
                                    IdLinea: $("#selectLinea").val() == "" ? null : $("#selectLinea").val(),
                                    Fecha: iFecha != "" ? iFecha : null,
                                    SSCC: $("#iSSCC").val() == "" ? null : $("#iSSCC").val()
                                }
                                return JSON.stringify(_options);
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: "LOTE_PRODUCTO_ACABADO",
                            fields: {
                                'LOTE_PRODUCTO_ACABADO': { type: "string" },
                                'LOTE_MES': { type: "string" },
                                'SSCC': { type: "string" },
                                'FECHA_PRODUCCION': { type: "date" },
                                'LINEA': { type: "string" },
                                'MATERIAL': { type: "string" },
                                'WO': { type: "string" },
                                'ENVASES_PALET': { type: "number" }
                            }
                        }
                    },
                    aggregate: [
                        { field: "ENVASES_PALET", aggregate: "sum" }
                    ],
                    sort: {
                        field: "FECHA_PRODUCCION",
                        dir: "desc"
                    },
                    pageSize: 1000,
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_FECHA_STOCK'), 5000);
                    }
                });
                return self.dsLoteProductoAcabado;
            },

            ObtenerGridLoteProductoAcabado: function (self) {
                self.gridLoteProductoAcabado = $("#divLotesProductoAcabado").kendoExtGrid({
                    dataSource: self.dsLoteProductoAcabado,
                    autoBind: false,
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
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    toolbar: [
                        {
                            template: '<label class="k-input-label" style="margin-right: 5px;">' + window.app.idioma.t("LOTES_PROD_ACABADO_MMPPO") + '</label>'
                        },
                        {
                            template: "<button type='button' id='btnExcelPaletsPorMMPP' class='k-button k-button-icontext' style='float:right;margin-left:5px;'> <span class='k-icon k-i-excel'></span>" + window.app.idioma.t('EXPORTAR_EXCEL') + "</button>"
                        },
                    ],
                    columns: [
                        {
                            title: window.app.idioma.t("IDLOTEMESMMPP"),
                            field: 'LOTE_MES',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("IDLOTEMESPRODUCTOACABADO"),
                            field: 'LOTE_PRODUCTO_ACABADO',
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
                            field: 'FECHA_PRODUCCION',
                            template: '#= FECHA_PRODUCCION != null ? kendo.toString(new Date(FECHA_PRODUCCION), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
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
                            title: window.app.idioma.t("LINEA"),
                            field: 'LINEA',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("MATERIAL"),
                            field: 'MATERIAL',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("ENVASES_PALET"),
                            field: 'ENVASES_PALET',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: true,
                            aggregates: ["sum"],
                            groupFooterTemplate: "Total: #: kendo.toString(sum, 'n0') #"
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
                });

                $("#divLotesProductoAcabado").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");
            },

            ResizeTab: function (isVisible) {
                var cabeceraHeight1 = $("#divCabeceraVista").height();
                var contenedorHeight = $("#center-pane").height();
                var toolbarHeight = $(".k-grid-toolbar").height() < 70 ? $(".k-grid-toolbar").height() +53 : $(".k-grid-toolbar").height();
                var cabeceraHeight = $(".k-grouping-header").height();
                var headerHeightGrid = $(".k-grid-header").height();
                var divFiltersGrid = isVisible == 0 ? 0 : $("#gridFilters").height();
                //$("#divSplitterV").height(contenedorHeight - cabeceraHeight1 - cabeceraHeight - divFiltersGrid - headerHeightGrid);
                $("#divSplitterV").height(contenedorHeight - cabeceraHeight1 - divFiltersGrid);
            },

            eliminar: function () {               
                this.remove();
            },
        });

        return gridProductoAcabadoMMPP;
    });