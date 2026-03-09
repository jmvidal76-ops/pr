define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/EnvasadoTrazabilidadDescendente.html', 'compartido/notificaciones', 'compartido/util', "jszip"],
    function (_, Backbone, $, plantillaMMPPProductoAcabado, Not, util, JSZip) {
        var gridMMPPProductoAcabado = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(plantillaMMPPProductoAcabado),
            checkedIds: {},
            tmpToolbar: null,
            dsStock: null,
            gridLotesConsumidos: null,
            dsPaletPorMMPP: null,
            gridPaletPorMMPP: null,
            dsOperaciones: null,
            gridOperaciones: null,
            IdLoteMESSelec: null, 
            CantidadSelec: 0,
            dsProveedores: null,
            dsMaterialJDE: null,
            
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

                self.DataSourcePaletMMPP(self);
                self.ObtenerGridPaletMMPP(self);
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
                'click #btnExcelStock': 'exportarExcel',
                'click #btnExcelPaletsPorMMPP': 'exportExcelPaletsPorMMPP',
                'click #btnLimpiarFiltros': 'limpiarFiltros',
                'click #btnConsultar': function () {
                    var ID_PROVEEDOR = $("#btnProveedores").val() == "" ? null : $("#btnProveedores").val();
                    var LOTE_PROVEEDOR = $("#btnLoteProveedor").val() == "" ? null : $("#btnLoteProveedor").val();
                    var CODIGO_JDE = $("#btnCodigoJDE").val() == "" ? null : $("#btnCodigoJDE").val();
                    var LOTE_MES = $("#btnLoteMes").val() == "" ? null : $("#btnLoteMes").val();

                    //var numcont = 0;
                    //if ($("#btnProveedores").val() != "") numcont += 1;
                    //if ($("#btnLoteProveedor").val() != "") numcont += 1;
                    //if ($("#btnCodigoJDE").val() != "") numcont += 1;
                    //if ($("#btnLoteMes").val() != "") numcont += 1;

                    if (ID_PROVEEDOR == null && LOTE_PROVEEDOR == null && CODIGO_JDE == null && LOTE_MES == null) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_UTILIZAR_FILTRO'), 5000);
                    }
                    else if (ID_PROVEEDOR != null && LOTE_PROVEEDOR == null) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR_LOTE_PROVEEDOR'), 5000);

                    }
                    else {
                        if (LOTE_MES != null && (CODIGO_JDE != null || LOTE_PROVEEDOR != null || ID_PROVEEDOR != null)) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('MSG_FILTRO_LOTE_MES'), 5000);
                        }
                        else {
                            $('#divLotesConsumidos').data('kendoExtGrid').dataSource.read();
                            $('#divPaletsPorMMPP').data('kendoExtGrid').dataSource.read();
                        }
                    }
                },
            },
            exportarExcel: function () {
                var grid = $("#divLotesConsumidos").data("kendoExtGrid");
                if (!grid) return;
                grid.saveAsExcel();
            },

            exportExcelPaletsPorMMPP: function (e) {
                var grid = $("#divPaletsPorMMPP").data("kendoExtGrid");
                if (!grid) return;
                grid.saveAsExcel();
            },

            limpiarFiltros: function (self) {
                // PROVEEDOR
                $("#btnLoteProveedor").val('');
                $("#btnLoteMes").val('');
                // JDE
                var numpalet = $("#NumeroPaleta").data("kendoNumericTextBox");
                numpalet.value(0);

                var dpProveedor = $("#btnProveedores").data("kendoDropDownList");
                dpProveedor.text("");
                dpProveedor.value("");

                var dpCodigoJDE = $("#btnCodigoJDE").data("kendoDropDownList");
                dpCodigoJDE.text("");
                dpCodigoJDE.value("");
            },

            //Metodo que renderiza todos los elementos del pre-filtrado
            renderElementsFilters: function () {
                $("#gridFilters").kendoGrid({
                    toolbar: [
                        {
                            template: kendo.template($("#tmpToolbar").html())
                        },
                        {
                            template: '<label for="btnProveedores" class="k-input-label" style="margin-right: 5px;">' + window.app.idioma.t("PROVEEDOR") + '</label>' +
                                '<input id="btnProveedores" style="width:250px; margin-right: 5px;" />' + 
                                '<label class="k-input-label" style="margin-right: 5px;">' + window.app.idioma.t("LOTE_PROVEEDOR") + '</label>' +
                                '<input id="btnLoteProveedor" type="text" class="k-textbox" style="margin-right: 5px;width:10%" />' +
                                '<label class="k-input-label" style="margin-right: 5px;">' + window.app.idioma.t("LOTE_MES") + '</label>' +
                                '<input id="btnLoteMes" type="text" class="k-textbox" style="margin-right: 5px; width:26%" />' + 
                                '<label class="k-input-label" style="margin-right: 5px;">' + window.app.idioma.t("CODIGO_JDE") + '</label>' +
                                '<input id="btnCodigoJDE" type="text" class="k-textbox" style="width:250px; margin-right: 5px;" />' + 
                                '<button id="btnConsultar" class="k-button k-button-icontext"  style="float:right;"><span class="k-icon k-i-search"></span>' + window.app.idioma.t('CONSULTAR') + '</button>' + 
                                '<label class="k-input-label" style="margin-right: 5px;">' + window.app.idioma.t("MAS_MENOS_PALETAS") + '</label>' +
                                '<input id="NumeroPaleta" type="number" value="0" min="0" max="10000" class="txtField" style="margin-right: 3px; width: 100px"/>'
                        },
                        {
                            template: "<button id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-funnel-clear'></span>#: window.app.idioma.t('QUITAR_FILTROS')#</button>"
                        }
                    ]
                })
                $("#NumeroPaleta").kendoNumericTextBox({
                    placeholder: '',
                    min: 0,
                    max: 10000,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 0,
                    format: "{0:n0}",
                });

                self.dsProveedores = new kendo.data.DataSource({
                    //serverFiltering: true,
                    batch: true,
                    transport: {
                        read: {
                            url: "../api/GetMaestroProveedor",
                            dataType: "json",
                            cache: false
                        }
                    },
                    schema: {
                        model: {
                            id: "IdProveedor",
                            fields: {
                                'IdProveedor': { type: "int" },
                                'NombreFull': { type: "string" }
                            }
                        }
                    },
                    sort: {
                        field: "IdProveedor",
                        dir: "asc"
                    },
                });

                var proveedorDrop = $("#btnProveedores").kendoDropDownList({
                    autoBind: false,
                    filter: "contains",
                    optionLabel: "-- Seleccione un proveedor --",
                    dataTextField: "NombreFull",
                    dataValueField: "IdProveedor",
                    dataSource: self.dsProveedores,
                    optionLabelTemplate: '<span>-- Seleccione un proveedor --</span>'
                }).data("kendoDropDownList");

                proveedorDrop.list.width("auto");

                self.dsMaterialJDE = new kendo.data.DataSource({
                    //serverFiltering: true,
                    batch: true,
                    transport: {
                        read: {
                            url: "../api/GetMaterial",
                            dataType: "json",
                            cache: false
                        }
                    },
                    schema: {
                        model: {
                            id: "IdMaterial",
                            fields: {
                                'IdMaterial': { type: "string" },
                                'DescripcionCompleta': { type: "string" },
                            }
                        }
                    },
                    sort: { field: "DescripcionCompleta", dir: "asc" },
                });

                var materialDrop = $("#btnCodigoJDE").kendoDropDownList({
                    autoBind: false,
                    filter: "contains",
                    optionLabel: "-- Seleccione un Codigo JDE --",
                    dataTextField: "DescripcionCompleta",
                    dataValueField: "IdMaterial",
                    dataSource: self.dsMaterialJDE,
                    optionLabelTemplate: '<span>-- Seleccione un codigo JDE --</span>'
                }).data("kendoDropDownList");

                materialDrop.list.width("auto");
            },

            DataSourceOperaciones: function (e, self) {
                self.dsOperaciones = new kendo.data.DataSource({
                    batch: false,
                    async: true,
                    pageSize: 1000,
                    transport: {
                        read: {
                            url: "../api/GetOperationsByFilters",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "PUT"
                        },
                        parameterMap: function (data, type) {
                            if (type == "read") {
                                var detailRow = e.detailRow;
                                var filtros = {
                                    IdLote: e.sender.dataItem(e.masterRow).LOTE_MES
                                }
                                return JSON.stringify(filtros)
                            }
                        },
                    },
                    schema: {
                        model: {
                            id: "IdOperacion",
                            fields: {
                                'IdOperacion': { type: "number" },
                                'FechaEntrada': { type: "date" },
                                'FechaInicio': { type: "date" },
                                'FechaFin': { type: "date" },
                                'TipoOperacion': { type: "string" },
                                'IdLote': { type: "string" },
                                'IdSublote': { type: "string" },
                                'Cantidad': { type: "number" },
                                'UnidadesMedida': { type: "string" },
                                'IdOrdenOrigen': { type: "string" },
                                'IdOrdenDestino': { type: "string" },
                                'UbicacionOrigen': { type: "string" },
                                'UbicacionDestino': { type: "string" },
                                'OperadorSistema': { type: "string" },
                                'Proveedor': { type: "string" },//
                                'EAN': { type: "string" },//EAN
                                'AECOC': { type: "string" },//EAN
                                'LoteProveeddor': { type: "string" },//Lote de proveedor
                                'SSCC': { type: "string" },//SSCC
                                'IdAlbaran': { type: "string" },//ID Albaran Posición
                                'CantidadPrevia': { type: "string" },//ID Albaran Posición
                                'ReferenciaMaterial': { type: "string" },
                                'CantidadRestante': { type: "string" },
                                'IDLoteNuevo': { type: "string" },
                                'MotivoBloqueo': { type: "string" },
                                'IDMuestraLims': { type: "string" },
                                'PropiedadesExtendidas': { type: "string" },
                                'FechaBloqueo': { type: "date" },
                                'FechaCaducidad': { type: "date" },
                                'FechaFabricacion': { type: "date" },
                                'MotivoCuarentena': { type: "string" },
                                'Prioridad': { type: "string" },
                                'FechaCuarentena': { type: "date" },
                                'Defectuoso': { type: "string" },
                            }
                        }
                    }
                });

                return self.dsPaletPorMMPP;
            },

            DataSourceLoteConsumido: function (self) {
                self.dsStock = new kendo.data.DataSource({
                    batch: false,
                    async: true,
                    transport: {
                        read: {
                            url: "../api/ObtenerStockConsumidosAgrupado",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "PUT"
                        },
                        parameterMap: function (options, type) {
                            if (type == "read") {
                                var _options = {
                                    ID_PROVEEDOR: $("#btnProveedores").val() == "" ? null : $("#btnProveedores").val(),
                                    LOTE_PROVEEDOR: $("#btnLoteProveedor").val() == "" ? null : $("#btnLoteProveedor").val(),
                                    CODIGO_JDE: $("#btnCodigoJDE").val() == "" ? null : $("#btnCodigoJDE").val(),
                                    LOTE_MES: $("#btnLoteMes").val() == "" ? null : $("#btnLoteMes").val(),
                                }
                                return JSON.stringify(_options);
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: "LoteMES",
                            fields: {
                                'TIPO_MATERIAL': { type: "string" },
                                'CLASE_MATERIAL': { type: "string" },
                                'REFERENCIA_MES': { type: "string" },
                                'MATERIAL': { type: "string" },
                                'LOTE_MES': { type: "string" },
                                'PROVEEDOR': { type: "string" },
                                'LOTE_PROVEEDOR': { type: "string" },
                                'CANTIDAD_INICIAL': { type: "number" },
                                'CANTIDAD_ACTUAL': { type: "number" },
                                'UNIDADES': { type: "string" },
                                'PRIORIDAD': { type: "number" },
                                'FECHA_ENTRADA_PLANTA': { type: "date" },
                                'FECHA_ENTRADA_UBICACION': { type: "date" },
                                'FECHA_INICIO_CONSUMO': { type: "date" },
                                'FECHA_FIN_CONSUMO': { type: "date" },
                                'FECHA_INICIO_ETIQUETA': { type: "date" },
                                'FECHA_FIN_ETIQUETA': { type: "date" },
                                'FECHA_CADUCIDAD': { type: "date" },
                                'FECHA_FABRICACION': { type: "date" },
                                'FECHA_CUARENTENA': { type: "date" },
                                'MOTIVO_CUARENTENA': { type: "string" },
                                'FECHA_BLOQUEO': { type: "date" },
                                'MOTIVO_BLOQUEO': { type: "string" },
                                'ALMACEN': { type: "string" },
                                'ZONA': { type: "string" },
                                'UBICACION': { type: "string" },
                                'UBICACION_ORIGEN': { type: "number" },
                                'UBICACION_MES': { type: "string" },
                                'ESTADO_UBICACION': { type: "string" },
                                'TIPO_UBICACION': { type: "string" },
                                'POLITICA_VACIADO': { type: "string" },
                                'DEFECTUOSO': { type: "date" },
                                'GRUPO': { type: "number" }
                            }
                        }
                    },
                    aggregate: [
                        { field: "CANTIDAD_INICIAL", aggregate: "sum" }
                    ],
                    sort: {
                        field: "FECHA_INICIO_CONSUMO",
                        dir: "asc"
                    },
                    pageSize: 1000,
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_FECHA_STOCK'), 5000);
                    }
                });
                return self.dsStock;
            },

            ObtenerGridLoteConsumido: function (self) {
                self.gridLotesConsumidos = $("#divLotesConsumidos").kendoExtGrid({
                    dataSource: self.dsStock,
                    autoBind: false,
                    excel: util.ui.default.gridExcelDate('LOTES_MMPP'),
                    excelExport: async function (e) {
                        ExcelGridExtra(e, util);
                    },
                    detailTemplate: kendo.template($("#template_detalle").html()),
                    detailInit: function (e) {
                        var detailRow = e.detailRow;

                        self.DataSourceOperaciones(e, self);
                        self.gridOperaciones = detailRow.find(".clsOperaciones").kendoExtGrid({
                            dataSource: self.dsOperaciones,
                            scrollable: false,
                            sortable: true,
                            pageable: true,
                            pageSizes: [50, 100, 1000, 5000, 'All'],
                            toolbar: [
                                {
                                    template: '<label class="k-input-label" style="margin-right: 5px;">' + window.app.idioma.t("LOTES_MES_PROD_ACABADO") + '</label>'
                                }
                            ],
                            columns: [
                                {
                                    field: "TipoOperacion",
                                    width: "10%",
                                    title: window.app.idioma.t("TIPO_OPERACION"),
                                    template: '#=typeof TipoOperacion !== "undefined" && TipoOperacion !== null ?  TipoOperacion : ""#',
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=TipoOperacion#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoOperacion#</label></div>";
                                            }
                                        }
                                    },
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                        class: 'addTooltip'
                                    },

                                },
                                {
                                    field: "FechaInicio",
                                    width: "15%",
                                    title: window.app.idioma.t("FECHA_INICIO"),
                                    _excelOptions: {
                                        format: "dd/mm/yyyy hh:mm:ss",
                                        template: "#= value.FECHA_INICIO ? GetDateForExcel(value.FECHA_INICIO) : '' #",
                                        width: 150
                                    },
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                        class: 'addTooltip'
                                    },
                                    template: '#=typeof FechaInicio !== "undefined" && FechaInicio !== null?  kendo.toString(new Date(FechaInicio), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : ""#'
                                },
                                {
                                    field: "FechaFin",
                                    width: "15%",
                                    title: window.app.idioma.t("FECHA_FIN"),
                                    _excelOptions: {
                                        format: "dd/mm/yyyy hh:mm:ss",
                                        template: "#= value.FECHA_FIN ? GetDateForExcel(value.FECHA_FIN) : '' #",
                                        width: 150
                                    },
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                        class: 'addTooltip'
                                    },
                                    template: '#=typeof FechaFin !== "undefined" && FechaFin !== null?  kendo.toString(new Date(FechaFin), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : ""#'
                                },
                                {
                                    field: "FechaEntrada",
                                    width: "15%",
                                    title: window.app.idioma.t("FECHA_FIN"),
                                    _excelOptions: {
                                        format: "dd/mm/yyyy hh:mm:ss",
                                        template: "#= value.FechaEntrada ? GetDateForExcel(value.FechaEntrada) : '' #",
                                        width: 150
                                    },
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                        class: 'addTooltip'
                                    },
                                    template: '#=typeof FechaEntrada !== "undefined" && FechaEntrada !== null?  kendo.toString(new Date(FechaEntrada), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : ""#'
                                },
                                {
                                    field: "Cantidad",
                                    width: "10%",
                                    title: window.app.idioma.t("CANTIDAD"),
                                    template: '#=typeof Cantidad !== "undefined" && Cantidad !== null ?   kendo.format("{0:n2}", Cantidad) : ""#'
                                },
                                {
                                    field: "UnidadesMedida",
                                    width: "5%",
                                    title: window.app.idioma.t("UNIDADES_MEDIDA"),
                                    template: '#=typeof UnidadesMedida !== "undefined" && UnidadesMedida !== null ?  UnidadesMedida : ""#',
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=UnidadesMedida#' style='width: 14px;height:14px;margin-right:5px;'/>#= UnidadesMedida#</label></div>";
                                            }
                                        }
                                    }
                                },
                                {
                                    field: "IdOrdenOrigen",
                                    width: "10%",
                                    title: window.app.idioma.t("ID_ORDEN_ORIGEN"),
                                    template: '#=typeof IdOrdenOrigen !== "undefined" && IdOrdenOrigen !== null ?  IdOrdenOrigen : ""#',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                        class: 'addTooltip'
                                    },
                                },
                                {
                                    field: "IdOrdenDestino",
                                    width: "10%",
                                    title: window.app.idioma.t("ID_ORDEN_DESTINO"),
                                    template: '#=typeof IdOrdenDestino !== "undefined" && IdOrdenDestino !== null ?  IdOrdenDestino : ""#',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                        class: 'addTooltip'
                                    },
                                },
                                {
                                    field: "UbicacionOrigen",
                                    width: "15%",
                                    title: window.app.idioma.t("UBICACION_ORIGEN"),
                                    template: '#=typeof UbicacionOrigen !== "undefined" && UbicacionOrigen !== null ?  UbicacionOrigen : ""#',
                                    filterable: true,
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                        class: 'addTooltip'
                                    },
                                },
                                {
                                    field: "UbicacionDestino",
                                    width: "15%",
                                    title: window.app.idioma.t("UBICACION_DESTINO"),
                                    template: '#=typeof UbicacionDestino !== "undefined" && UbicacionDestino !== null ?  UbicacionDestino : ""#',
                                    filterable: true,
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                        class: 'addTooltip'
                                    },
                                },
                                {
                                    field: "EAN",
                                    width: "10%",
                                    title: window.app.idioma.t("EAN"),
                                    template: '#=typeof EAN !== "undefined" && EAN !== null ?  EAN : ""#',
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=EAN#' style='width: 14px;height:14px;margin-right:5px;'/>#= EAN#</label></div>";
                                            }
                                        }
                                    },
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                        class: 'addTooltip'
                                    },

                                },
                                {
                                    field: "ReferenciaMaterial",
                                    width: "10%",
                                    title: window.app.idioma.t("REFERENCIA_MATERIAL"),
                                    template: '#=typeof ReferenciaMaterial !== "undefined" && ReferenciaMaterial !== null ?  ReferenciaMaterial : ""#',
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=ReferenciaMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#= ReferenciaMaterial#</label></div>";
                                            }
                                        }
                                    },
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                        class: 'addTooltip'
                                    },
                                },
                                {
                                    field: "LoteProveeddor",
                                    width: "10%",
                                    title: window.app.idioma.t("LOTE_PROVEEDOR"),
                                    template: '#=typeof LoteProveeddor !== "undefined" && LoteProveeddor !== null ?  LoteProveeddor : ""#',
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=LoteProveeddor#' style='width: 14px;height:14px;margin-right:5px;'/>#= LoteProveeddor#</label></div>";
                                            }
                                        }
                                    },
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                        class: 'addTooltip'
                                    },
                                },
                                {
                                    field: "SSCC",
                                    width: "10%",
                                    title: window.app.idioma.t("SSCC"),
                                    template: '#=typeof SSCC !== "undefined" && SSCC !== null ?  SSCC : ""#',
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=SSCC#' style='width: 14px;height:14px;margin-right:5px;'/>#= SSCC#</label></div>";
                                            }
                                        }
                                    },
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                        class: 'addTooltip'
                                    },
                                }                                
                            ],
                        });
                    },
                    detailExpand: function (e) {
                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                    },
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
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FECHA_ENTRADA_PLANTA ? GetDateForExcel(value.FECHA_ENTRADA_PLANTA) : '' #",
                                width: 150
                            },
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
                            title: window.app.idioma.t("DESCRIPCION"),
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
                            title: window.app.idioma.t("FECHA_FABRICACION"),
                            field: 'FECHA_FABRICACION',
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FECHA_FABRICACION ? GetDateForExcel(value.FECHA_FABRICACION) : '' #",
                                width: 150
                            },
                            template: '#= FECHA_FABRICACION != null ? kendo.toString(new Date(FECHA_FABRICACION), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #',
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
                            title: window.app.idioma.t("FECHA_INICIO_CONSUMO"),
                            field: 'FECHA_INICIO_CONSUMO',
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FECHA_INICIO_CONSUMO ? GetDateForExcel(value.FECHA_INICIO_CONSUMO) : '' #",
                                width: 150
                            },
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
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FECHA_FIN_CONSUMO ? GetDateForExcel(value.FECHA_FIN_CONSUMO) : '' #",
                                width: 150
                            },
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
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FECHA_INICIO_ETIQUETA ? GetDateForExcel(value.FECHA_INICIO_ETIQUETA) : '' #",
                                width: 150
                            },
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
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FECHA_FIN_ETIQUETA ? GetDateForExcel(value.FECHA_FIN_ETIQUETA) : '' #",
                                width: 150
                            },
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
                            title: "Grupo", //window.app.idioma.t("LOTE_MES"),
                            field: 'GRUPO',
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

            DataSourcePaletMMPP: function (self) {
                self.dsPaletPorMMPP = new kendo.data.DataSource({
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerPaletsPorMMPP",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "PUT"
                        },
                        parameterMap: function (options, type) {
                            if (type == "read") {
                                var _options = {
                                    IdProveedor: $("#btnProveedores").val() == "" ? null : $("#btnProveedores").val(),
                                    LoteProveedor: $("#btnLoteProveedor").val() == "" ? null : $("#btnLoteProveedor").val(),
                                    Codigo_JDE: $("#btnCodigoJDE").val() == "" ? null : $("#btnCodigoJDE").val(),
                                    IdLoteMES: $("#btnLoteMes").val() == "" ? null : $("#btnLoteMes").val(),
                                    CantPaletasExtra: $("#NumeroPaleta").val() == "" ? 0 : $("#NumeroPaleta").val(),
                                }
                                return JSON.stringify(_options);
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: "LoteMES",
                            fields: {
                                'IdLoteMESMMPP': { type: "string" },
                                'Fecha': { type: "date" },
                                'NumLinea': { type: "number" },
                                'SSCC': { type: "string" },
                                'IdLoteMESProductoAcabado': { type: "string" },
                                'Referencia': { type: "string" },
                                'WO': { type: "string" },
                                'EnvasesPorPalet': { type: "number" }
                            }
                        }
                    },
                    aggregate: [
                        { field: "EnvasesPorPalet", aggregate: "sum" }
                    ],
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

            ObtenerGridPaletMMPP: function (self) {
                self.gridPaletPorMMPP = $("#divPaletsPorMMPP").kendoExtGrid({
                    dataSource: self.dsPaletPorMMPP,
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
                    excel: util.ui.default.gridExcelDate('LOTES_PROD_ACABADO_MMPPO'),
                    excelExport: async function (e) {
                        ExcelGridExtra(e, util);
                    },
                    columns: [
                        {
                            title: window.app.idioma.t("IDLOTEMESMMPP"),
                            field: 'IdLoteMESMMPP',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("IDLOTEMESPRODUCTOACABADO"),
                            field: 'IdLoteMESProductoAcabado',
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
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.Fecha ? GetDateForExcel(value.Fecha) : '' #",
                                width: 150
                            },
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
                            title: window.app.idioma.t("ENVASES_PALET"),
                            field: 'EnvasesPorPalet',
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

                $("#divPaletsPorMMPP").kendoTooltip({
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

        return gridMMPPProductoAcabado;
    });