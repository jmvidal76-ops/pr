define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/ControlStockConsumido.html', 'compartido/notificaciones', 'compartido/util',
    'vistas/Fabricacion/vEditarLote', 'vistas/vDialogoConfirm', "jszip",
    'vistas/Almacen/vDetalleLoteUbicaciones', 'text!../../../Almacen/html/vpOperacionesControlStock.html', 'vistas/Almacen/vFormOperacionesControlStock',
    'definiciones', 'vistas/Fabricacion/vVerDetallesOrden_LIMS', 'vistas/Fabricacion/vArchivosAdjuntosLote', 'vistas/Fabricacion/vNotasLote',
    '../../../../Portal/js/constantes'],
    function (_, Backbone, $, plantillaGestionMateriales, Not, util, vistaEditarLote, VistaDlgConfirm, JSZip,
        vistaDetalleLote, vpOperacionesControlStock, jsOperacionesControlStock, definiciones, vistaLIMS, vistaArchivosAdjuntos,
        vistaNotasLote, enums) {
        var gridMateriales = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            dsStock: null,
            barcode: null,
            newOrder: [],
            registrosSel: [],
            registrosSelData: [],
            registrosDesSelData: [],
            selTodos: false,
            checkedIds: {},
            wnd: null,
            tmpToolbar: null,
            vpOperaciones: _.template(vpOperacionesControlStock),
            template: _.template(plantillaGestionMateriales),
            constantes: definiciones.OperacionesAlmacen(),
            constTipoMovimientoLote: enums.TipoMovimientoLote(),
            PropiedadesEditables: false,
            initialize: function () {
                kendo.culture(localStorage.getItem("idiomaSeleccionado"));
                var self = this;
                self.PropiedadesEditables = TienePermiso(224);
                self.render();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));
                window.JSZip = JSZip;

                var ExtGrid = window.app.cfgKendo.extGridToolbarColumnMenu;
                kendo.ui.plugin(ExtGrid);

                self.dsStock = new kendo.data.DataSource({
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerStockConsumidos",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "PUT"
                        },
                        parameterMap: function (options, type) {
                            if (type == "read") {
                                var _options = {
                                    FECHA_INICIO_CONSUMO: $("#cmbFechaInicioConsumo").getKendoDateTimePicker().value().toISOString(),
                                    FECHA_FIN_CONSUMO: $("#cmbFechaFinConsumo").getKendoDateTimePicker().value().toISOString()
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
                                'SSCC': { type: "string" },
                                'LOTE_PROVEEDOR': { type: "string" },

                                'CANTIDAD_INICIAL': { type: "number" },
                                'CANTIDAD_ACTUAL': { type: "number" },
                                'UNIDADES': { type: "string" },

                                'PRIORIDAD': { type: "number" },

                                'FECHA_ENTRADA_PLANTA': { type: "date" },
                                'FECHA_ENTRADA_UBICACION': { type: "date" },
                                'FECHA_INICIO_CONSUMO': { type: "date" },
                                'FECHA_FIN_CONSUMO': { type: "date" },
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
                                'ID_PROVEEDOR': { type: "string" },
                                'PROVEEDOR': { type: "string" },
                            }
                        }
                    },
                    sort: {
                        field: "FECHA_ENTRADA_PLANTA",
                        dir: "desc"
                    },
                    pageSize: 1000,
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_FECHA_STOCK'), 5000);
                    }
                });

                $("#divControlStock").kendoExtGrid({
                    dataSource: self.dsStock,
                    autoBind: false,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    sortable: true,
                    toolbarColumnMenu: true,
                    scrollable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [500, 1000, 5000, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    excel: util.ui.default.gridExcelDate('CONTROL_STOCK'),
                    excelExport: async function (e) {
                        ExcelGridExtra(e, util);
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
                            template: '<label style="margin-right:5px">' + window.app.idioma.t("FECHA_ENTRADA_PLANTA") + '</label><input placeholder="' +
                                window.app.idioma.t('INICIO_CONSUMO') + '" id="cmbFechaInicioConsumo" style="margin-right:5px; width:190px" /><input placeholder="' +
                                window.app.idioma.t('FIN_CONSUMO') + '" style="margin-right:5px; width:190px" id="cmbFechaFinConsumo" />'
                        },
                        {
                            template: "<input id='btnOperations' />"
                        },
                        {
                            template: "<button type='button' id='btnExcelStock' class='k-button k-button-icontext' style='float:right;margin-left:5px;'> <span class='k-icon k-i-excel'></span>" + window.app.idioma.t('EXPORTAR_EXCEL') + "</button>"
                        },
                        {
                            template: '<button id="btnConsultar" class="k-button k-button-icontext"  style="float:right;"><span class="k-icon k-i-search"></span>' + window.app.idioma.t('CONSULTAR') + '</button>'
                        },
                        {
                            template: "<button type='button' id='btnPropiedades' class='k-button k-button-icontext' style='float:right;'> <span><img src='../../../Common/img/mostrar-propiedades.png' style='width: 16px; opacity: 0.8; margin-right: 6px;'/></span>" + window.app.idioma.t('PROPIEDADES') + "</button>"
                        },
                        {
                            template: "<button type='button' id='btnGenerarEtiqueta' class='k-button k-button-icontext' style='float:right;'> <span><img src='../../../Common/img/codigo-qr.png' style='width: 16px; opacity: 0.8; margin-right: 6px;'/></span>" + window.app.idioma.t('GENERAR_ETIQUETA') + "</button>"
                        },
                        {
                            template: "<button type='button' id='btnMostrarLIMS' class='k-button k-button-icontext' style='float:right;'> <span><img src='../../../Common/img/muestra.png' style='width: 16px; opacity: 0.8; margin-right: 6px;'/></span>" + window.app.idioma.t('LIMS') + "</button>"
                        },
                        {
                            template: "<button type='button' id='btnArchivosAdjuntos' class='k-button k-button-icontext' " +
                                "data-funcion='ALM_PROD_DAT_7_VisualizacionControlStockConsumidos ALM_PROD_DAT_7_GestionControlStockConsumidos' " +
                                "style='float:right;'> <span><img src='../../../Common/img/archivos-adjuntos.png' style='width: 16px; opacity: 0.8; margin-right: 6px;'/></span>" + window.app.idioma.t('ARCHIVOS_ADJUNTOS') + "</button>"
                        },
                        {
                            template: "<button type='button' id='btnNotasLote' class='k-button k-button-icontext' " +
                                "data-funcion='ALM_PROD_DAT_7_VisualizacionControlStockConsumidos ALM_PROD_DAT_7_GestionControlStockConsumidos' " +
                                "style='float:right;'> <span><img src='../../../Common/img/nota.png' style='width: 16px; opacity: 0.8; margin-right: 6px;'/></span>" + window.app.idioma.t('NOTAS') + "</button>"
                        }

                    ],
                    columns: [
                        {
                            template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                            width: 35
                        },
                        {
                            title: window.app.idioma.t("NOTAS"),
                            field: "NOTAS",
                            filterable: false,
                            groupable: false,
                            attributes: { style: "text-align:center;" },
                            template: '<img src="../Portal/img/round_comment_notification.png" title="#: NOTAS #" style="width: 16px !important; height:16px !important;#if(!NOTAS){# display:none;#}#">',
                            width: 35
                        },
                        {
                            template: function (e) {
                                let title = window.app.idioma.t("ESTADO_LIMS_" + e.ID_ESTADO_LIMS) || "";
                                return "<div class='circle_cells' title='"+ title +"' style='background-color:" + e.COLOR_ESTADO_LIMS + ";'/>"
                            },
                            width: 50,
                            title: window.app.idioma.t("LIMS"),
                            attributes: { style: "text-align:center;" },
                            groupable: false,
                            filterable: false,
                            //toolbarColumnMenu: false
                        },
                        {
                            template: function (e) {
                                let color = e.ARCHIVOS_ADJUNTOS ? "#49d240" : "transparent";
                                let title = e.ARCHIVOS_ADJUNTOS ? window.app.idioma.t("TIENE_ARCHIVOS_ADJUNTOS_SI") : window.app.idioma.t("TIENE_ARCHIVOS_ADJUNTOS_NO");
                                return "<div class='circle_cells' title='" + title + "' style='background-color:" + color + ";'></div>";
                            },
                            width: 50,
                            title: window.app.idioma.t("ARCHIVOS_ADJUNTOS"),
                            attributes: { style: "text-align:center;" },
                            groupable: false,
                            filterable: false,
                            // toolbarColumnMenu: false
                        },
                        {
                            hidden: true,
                            width: 200,
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
                            width: 150,
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
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            width: 100,
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
                            width: 250,
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
                            title: window.app.idioma.t("LOTE_MES"),
                            field: 'LOTE_MES',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            width: 350,
                        },
                        {
                            title: window.app.idioma.t("SSCC"),
                            field: 'SSCC',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            width: 180,
                        },
                        {
                            hidden: true,
                            template: "#=ID_PROVEEDOR != null ?ID_PROVEEDOR: ''#  #=PROVEEDOR != null? PROVEEDOR: ''#",
                            title: window.app.idioma.t("PROVEEDOR"),
                            field: 'ID_PROVEEDOR',
                            width: 150,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("LOTE_PROVEEDOR"),
                            field: 'LOTE_PROVEEDOR',
                            width: 150,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_INICIAL"),
                            field: 'CANTIDAD_INICIAL',
                            width: 150,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            template: '#= kendo.format("{0:n2}",CANTIDAD_INICIAL)#',
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_ACTUAL"),
                            field: 'CANTIDAD_ACTUAL',
                            width: 150,
                            template: '#= kendo.format("{0:n2}",CANTIDAD_ACTUAL)#',
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            hidden: true,
                            title: window.app.idioma.t("UNIDAD_MEDIDA"),
                            width: 100,
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
                            hidden: true,
                            field: 'PRIORIDAD',
                            width: 100,
                            title: window.app.idioma.t("PRIORIDAD"),

                        },
                        {
                            title: window.app.idioma.t("FECHA_ENTRADA_PLANTA"),
                            field: 'FECHA_ENTRADA_PLANTA',
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FECHA_ENTRADA_PLANTA ? GetDateForExcel(value.FECHA_ENTRADA_PLANTA) : '' #",
                                width: 150
                            },
                            width: 200,
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
                            title: window.app.idioma.t("FECHA_INICIO_CONSUMO"),
                            field: 'FECHA_INICIO_CONSUMO',
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FECHA_INICIO_CONSUMO ? GetDateForExcel(value.FECHA_INICIO_CONSUMO) : '' #",
                                width: 150
                            },
                            width: 200,
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
                            width: 200,
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
                            title: window.app.idioma.t("FECHA_ENTRADA_UBICACION"),
                            field: 'FECHA_ENTRADA_UBICACION',
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FECHA_ENTRADA_UBICACION ? GetDateForExcel(value.FECHA_ENTRADA_UBICACION) : '' #",
                                width: 150
                            },
                            width: 200,
                            template: '#= FECHA_ENTRADA_UBICACION != null ? kendo.toString(new Date(FECHA_ENTRADA_UBICACION), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #',
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
                            hidden: true,
                            title: window.app.idioma.t("FECHA_CADUCIDAD"),
                            field: 'FECHA_CADUCIDAD',
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FECHA_CADUCIDAD ? GetDateForExcel(value.FECHA_CADUCIDAD) : '' #",
                                width: 150
                            },
                            width: 200,
                            template: '#= FECHA_CADUCIDAD != null ? kendo.toString(new Date(FECHA_CADUCIDAD), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
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
                            hidden: true,
                            toolbarColumnMenu: true,
                            title: window.app.idioma.t("FECHA_FABRICACION"),
                            field: 'FECHA_FABRICACION',
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FECHA_FABRICACION ? GetDateForExcel(value.FECHA_FABRICACION) : '' #",
                                width: 150
                            },
                            width: 200,
                            template: '#= FECHA_FABRICACION != null ? kendo.toString(new Date(FECHA_FABRICACION), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            }
                        },
                        {
                            hidden: true,
                            title: window.app.idioma.t("FECHA_CUARENTENA"),
                            field: 'FECHA_CUARENTENA',
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FECHA_CUARENTENA ? GetDateForExcel(value.FECHA_CUARENTENA) : '' #",
                                width: 150
                            },
                            width: 200,
                            template: "#:(FECHA_CUARENTENA) ? kendo.toString(new Date(FECHA_CUARENTENA), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : '' # <img src='/Portal/img/info.png'  class='titleInfoCuarentena' style='display: #: (!FECHA_CUARENTENA || !MOTIVO_CUARENTENA) ? 'none' : MOTIVO_CUARENTENA #;'/>",
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
                                style: 'white-space: nowrap '
                            },
                        },
                        {
                            hidden: true,
                            title: window.app.idioma.t("FECHA_BLOQUEO"),
                            field: 'FECHA_BLOQUEO',
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FECHA_BLOQUEO ? GetDateForExcel(value.FECHA_BLOQUEO) : '' #",
                                width: 150
                            },
                            width: 200,
                            template: "#:(FECHA_BLOQUEO) ? kendo.toString(new Date(FECHA_BLOQUEO), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : '' # <img src='/Portal/img/info.png' class='titleInfoBloqueo'  style='display: #: (!FECHA_BLOQUEO || !MOTIVO_BLOQUEO) ? 'none' : MOTIVO_BLOQUEO #;'/>",
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
                                style: 'white-space: nowrap '
                            },
                        },
                        {
                            hidden: true,
                            field: 'ALMACEN',
                            width: 200,
                            title: window.app.idioma.t("ALMACEN"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=ALMACEN#' style='width: 14px;height:14px;margin-right:5px;'/>#= ALMACEN#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },

                        },
                        {
                            title: window.app.idioma.t("ZONA"),
                            width: 200,
                            field: 'ZONA',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=ZONA#' style='width: 14px;height:14px;margin-right:5px;'/>#= ZONA#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("UBICACION"),
                            field: 'UBICACION_CON_DESCRIPTIVO',
                            width: 200,
                            filterable: true,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            hidden: true,
                            title: window.app.idioma.t("TIPO_UBICACION"),
                            field: 'TIPO_UBICACION',
                            width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=TIPO_UBICACION#' style='width: 14px;height:14px;margin-right:5px;'/>#= TIPO_UBICACION#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            hidden: true,
                            title: window.app.idioma.t("POLITICA_VACIADO"),
                            field: 'POLITICA_VACIADO',
                            width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=POLITICA_VACIADO#' style='width: 14px;height:14px;margin-right:5px;'/>#= POLITICA_VACIADO#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },

                        {
                            hidden: true,
                            title: window.app.idioma.t("ESTADO_UBICACION"),
                            width: 200,
                            field: 'ESTADO_UBICACION',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=ESTADO_UBICACION#' style='width: 14px;height:14px;margin-right:5px;'/>#= ESTADO_UBICACION#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            hidden: true,
                            title: window.app.idioma.t("DEFECTUOSO"),
                            field: 'DEFECTUOSO',
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.DEFECTUOSO ? GetDateForExcel(value.DEFECTUOSO) : '' #",
                                width: 150
                            },
                            width: 100,
                            template: '#= DEFECTUOSO != null ? kendo.toString(new Date(DEFECTUOSO), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
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
                        $("#lblRegSel").text('');
                        self.registrosSelData = [];

                        self.ResizeTab();

                        $(".titleInfoBloqueo").kendoTooltip({
                            width: 120,
                            content: function (e) {
                                var dataSrc = self.dsStock.data();
                                var id = $(e.target.closest("tr")[0]).attr("data-uid");
                                return dataSrc.filter(x => x.uid == id)[0].MOTIVO_BLOQUEO;
                            },
                            show: function (e) {
                                this.popup.wrapper.width("auto");
                            }
                        });

                        $(".titleInfoCuarentena").kendoTooltip({
                            width: 120,
                            content: function (e) {
                                var dataSrc = self.dsStock.data();
                                var id = $(e.target.closest("tr")[0]).attr("data-uid");
                                return dataSrc.filter(x => x.uid == id)[0].MOTIVO_CUARENTENA;
                            },
                            show: function (e) {
                                this.popup.wrapper.width("auto");
                            }
                        });

                        var rows = e.sender.tbody.children();
                        self.validateCheck(self);

                        self.$("[data-funcion]").checkSecurity();
                    }
                });

                // Borro el titulo de la columna Notas (no cabe en el grid, pero está definido para que salga en el excel)
                $("#divControlStock th[data-field='NOTAS'] a").remove();

                $("#divControlStock").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

                var datenow = new Date();

                $("#cmbFechaInicioConsumo").kendoDateTimePicker({
                    value: new Date(datenow.getFullYear(), datenow.getMonth() - 1, 1),
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#cmbFechaFinConsumo").kendoDateTimePicker({
                    value: new Date(datenow.setHours(23, 59, 59)),
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                var _operaciones = $("#btnOperations").kendoDropDownList({
                    dataSource: [
                        { id: self.constantes.OPERACIONES, name: window.app.idioma.t('OPERACIONES') },
                        { id: self.constantes.EDITAR_LOTE, name: window.app.idioma.t('EDITAR_LOTE') },
                        { id: self.constantes.ELIMINAR_LOTE, name: window.app.idioma.t('ELIMINAR_LOTE') },
                        { id: self.constantes.EDITAR_PROPIEDADES_LOTE, name: window.app.idioma.t('EDITAR_PROPIEDADES_LOTE') },
                    ],
                    dataTextField: "name",
                    dataValueField: "id",
                    select: function (e) {
                        if (e.item) {
                            var dataItem = this.dataItem(e.item);
                            var bloqueadoLote = false;
                            var ubicacionBloqueada = false;

                            switch (dataItem.id) {
                                case "6":
                                case "7":
                                case "4":
                                case "11":
                                    bloqueadoLote = false;
                                    ubicacionBloqueada = false;
                                    break;
                                default:
                                    for (var i = 0; i < self.registrosSelData.length; i++) {

                                        //if (self.registrosSelData[i].FechaBloqueo !== null ) {
                                        //    bloqueadoLote = true;
                                        //}
                                        if (self.registrosSelData[i].EstadoUbicacion == "Bloqueada") {
                                            ubicacionBloqueada = true;
                                        }

                                    }
                                    break;
                            }

                            if (!ubicacionBloqueada) {
                                self.isFabricacion = false;
                                jsOperacionesControlStock.ShowWindowNewForm(e, self, dataItem.id, dataItem.name);
                            }
                            else if (bloqueadoLote) {
                                Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('LOTE_BLOQUEADO'), 5000);
                            } else if (ubicacionBloqueada) {
                                Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('E1005'), 5000);
                            }
                        }
                        //e.preventDefault();
                        // Use the selected item or its text
                    }
                });

                self.barcode = $("#barcode").kendoQRCode();

                self.registrosDesSelData = [];
                self.registrosSelData = [];
                self.selTodos = false;
                self.$("#lblRegSel").text("");

                self.tmpToolbar = kendo.template($("#tmpToolbar").html());

                $("#ulToolbarColumn").addClass("listColumn")
                self.ResizeTab();

                //self.dsStock.filter({ field: "EstadoLote", operator: "neq", value: "Eliminado" });
            },
            events: {
                'click #btnLimpiarFiltros': function () { this.limpiarFiltros(this) },
                'click #btnFiltros': function () { this.mostrarFiltros(this); },
                'click #btnExcelStock': 'exportarExcel',
                'click #btnConsultar': 'consultar',
                'click #btnSelTodos': function () { this.aplicarSeleccion(); },
                'click #btnPropiedades': function (e) { this.VerPropiedades(e, this); },
                'click #btnMostrarLIMS': function (e) { this.MostrarLIMS(e, this); },
                'click #btnArchivosAdjuntos': function (e) { this.MostrarArchivosAdjuntos(e, this); },
                'click #btnNotasLote': function (e) { this.MostrarNotasLote(e, this); },
                'click #btnGenerarEtiqueta': function (e) { this.generarEtiqueta(e, this); },
            },
            exportarExcel: function () {
                var grid = $("#divControlStock").data("kendoExtGrid");
                if (!grid) return;
                grid.saveAsExcel();
            },
            consultar: function () {
                var inicio = $("#cmbFechaInicioConsumo").getKendoDateTimePicker().value();
                var fin = $("#cmbFechaFinConsumo").getKendoDateTimePicker().value();

                if (!inicio || !fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LAS_FECHAS_INTRODUCIDAS'), 3000);
                    return;
                }

                if (inicio > fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('_LA_FECHA'), 3000);
                    return;
                }

                $('#divControlStock').data('kendoExtGrid').dataSource.read();
            },
            VerPropiedades: function (e, self) {
                let selectedRow = $("tr.k-state-selected");

                if (selectedRow.length > 1) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_ELEGIR_SOLO_UN_REGISTRO'), 4000);
                    return;
                }

                var element = $('#divControlStock').data('kendoExtGrid').dataItem(selectedRow);
                if (!element) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }
                var data = [];
                data.registrosSelData = [];
                data.vpOperaciones = self.vpOperaciones;
                var datos = {};
                datos.IdLote = element.LOTE_MES;
                datos.SSCC = element.SSCC;
                datos.UbicacionMES = element.UBICACION_MES;
                datos.UbicacionOrigen = element.UBICACION_ORIGEN;
                datos.CantidadActual = element.CANTIDAD_ACTUAL;
                datos.uid = element.uid;
                datos.EstadoUbicacion = element.ESTADO_UBICACION;
                datos.FechaBloqueo = element.FECHA_BLOQUEO;
                datos.FechaCuarentena = element.MOTIVO_CUARENTENA;
                datos.IdLoteMateriaPrima = element.ID_LOTE_MMPP;
                datos.MotivoCuarentena = element.MOTIVO_CUARENTENA;
                datos.MotivoBloqueo = element.MOTIVO_BLOQUEO;
                datos.Defectuoso = element.DEFECTUOSO;
                data.registrosSelData.push(datos);

                var dataItem = { id: self.constantes.EDITAR_PROPIEDADES_LOTE, name: window.app.idioma.t('EDITAR_PROPIEDADES_LOTE') }
                data.PropiedadesEditables = self.PropiedadesEditables;
                jsOperacionesControlStock.ShowWindowNewForm(e, data, dataItem.id, dataItem.name);
            },
            limpiarFiltros: function (self) {
                $("#cmbFechaInicioConsumo").data("kendoDatePicker").value('');
                $("#cmbFechaInicioConsumo").val('');

                $("#cmbFechaFinConsumo").data("kendoDatePicker").value('');
                $("#cmbFechaFinConsumo").val('');
            },
            aplicarSeleccion: function () {
                var self = this;
                var grid = $('#divControlStock').data('kendoExtGrid');
                var _chkAll = $("input[name='btnSelTodos']:checked").length > 0 ? true : false;

                self.selTodos = _chkAll;

                if (self.selTodos) {
                    grid.tbody.find('input:checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var dataSource = grid.dataSource;
                    var filters = dataSource.filter();
                    var allData = dataSource.data();
                    var query = new kendo.data.Query(allData);
                    var dataFiltered = query.filter(filters).data;
                    //self.$("#lblRegSel").text(self.dsTiempos.data().length);
                    self.registrosSelData = [];

                    for (var i = 0; i < dataFiltered.length; i++) {
                        var datos = {};
                        datos.IdLote = dataFiltered[i].LOTE_MES;
                        datos.SSCC = dataFiltered[i].SSCC;
                        datos.UbicacionMES = dataFiltered[i].UBICACION_MES;
                        datos.UbicacionOrigen = dataFiltered[i].UBICACION_ORIGEN;
                        datos.CantidadActual = dataFiltered[i].CANTIDAD_ACTUAL;
                        datos.uid = dataFiltered[i].uid;
                        datos.EstadoUbicacion = dataFiltered[i].ESTADO_UBICACION;
                        datos.FechaBloqueo = dataFiltered[i].FECHA_BLOQUEO;
                        datos.FechaCuarentena = dataFiltered[i].MOTIVO_CUARENTENA;
                        datos.IdLoteMateriaPrima = dataFiltered[i].ID_LOTE_MMPP;
                        datos.MotivoCuarentena = dataFiltered[i].MOTIVO_CUARENTENA;
                        datos.MotivoBloqueo = dataFiltered[i].MOTIVO_BLOQUEO;
                        datos.Defectuoso = dataFiltered[i].DEFECTUOSO;
                        self.registrosSelData.push(datos);
                    }
                    self.$("#lblRegSel").text(dataFiltered.length);
                } else {
                    grid.tbody.find('input:checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');
                    self.registrosDesSelData = [];
                    self.registrosSelData = [];
                    self.$("#lblRegSel").text("");
                }
            },
            validateCheck: function (self) {
                var grid = $("#divControlStock").data("kendoExtGrid");
                $(".checkbox").bind("change", function (e) {

                    var checked = this.checked;
                    self.registrosDesSelData = [];
                    self.registrosSelData = [];
                    self.$("#lblRegSel").text("");
                    var row = $(e.target).closest("tr");
                    grid.tbody.find('input:checkbox').not(this).prop("checked", false);
                    grid.tbody.find(">tr").map(function (number, index, arr) {
                        if (row[0] != index) {
                            $(index).prop("checked", false);
                            $(index).removeClass('k-state-selected');
                        }
                    });

                    dataItem = grid.dataItem(row);
                    //var idValue = grid.dataItem(row).get("idTiempoCambio");

                    var datos = {};
                    datos.IdLote = dataItem.LOTE_MES;
                    datos.SSCC = dataItem.SSCC;
                    datos.UbicacionMES = dataItem.UBICACION_MES;
                    datos.UbicacionOrigen = dataItem.UBICACION_ORIGEN;
                    datos.CantidadActual = dataItem.CANTIDAD_ACTUAL;
                    datos.FechaBloqueo = dataItem.FECHA_BLOQUEO;
                    datos.FechaCuarentena = dataItem.FECHA_CUARENTENA;
                    datos.EstadoUbicacion = dataItem.ESTADO_UBICACION;
                    datos.uid = dataItem.uid;
                    datos.IdProveedor = dataItem.ID_PROVEEDOR;
                    datos.CantidadInicial = dataItem.CANTIDAD_INICIAL;
                    datos.IdMaterial = dataItem.REFERENCIA_MES;
                    datos.FechaEntradaUbicacion = dataItem.FECHA_ENTRADA_UBICACION;
                    datos.FechaEntradaPlanta = dataItem.FECHA_ENTRADA_PLANTA;
                    datos.FechaInicioConsumo = dataItem.FECHA_INICIO_CONSUMO;
                    datos.FechaFinConsumo = dataItem.FECHA_FIN_CONSUMO;
                    datos.LoteProveedor = dataItem.LOTE_PROVEEDOR;
                    datos.Unidad = dataItem.UNIDADES;
                    datos.FechaCaducidad = dataItem.FECHA_CADUCIDAD;
                    datos.FechaFabricacion = dataItem.FECHA_FABRICACION;
                    datos.IdLoteMateriaPrima = dataItem.ID_LOTE_MMPP;
                    datos.MotivoCuarentena = dataItem.MOTIVO_CUARENTENA;
                    datos.MotivoBloqueo = dataItem.MOTIVO_BLOQUEO;
                    datos.Defectuoso = dataItem.DEFECTUOSO;
                    if (checked) {
                        row.addClass("k-state-selected");
                        //self.registrosSel.push(idValue);

                        var datafound = _.findWhere(self.registrosDesSelData, datos);
                        index = _.indexOf(self.registrosDesSelData, datafound);
                        if (index >= 0) {
                            self.registrosDesSelData.splice(index, 1);
                        }

                        var numReg = self.$("#lblRegSel").text() ? self.$("#lblRegSel").text() : 0;
                        //self.$("#lblRegSel").text(++numReg);

                        //self.$("#lblRegSel").text(self.registrosSel.length);
                        self.registrosSelData.push(datos);

                    } else {
                        row.removeClass("k-state-selected");
                        //var index = self.registrosSel.indexOf(idValue);
                        //if (index >= 0) {
                        //    self.registrosSel.splice(index, 1);
                        //    self.$("#lblRegSel").text(self.registrosSel.length);
                        //    self.registrosSelData.splice(index, 1);
                        //}
                        self.registrosDesSelData.push(datos);
                        var numReg = self.$("#lblRegSel").text() ? self.$("#lblRegSel").text() : 0;
                        //self.$("#lblRegSel").text(--numReg);
                        //self.$("#lblRegSel").text(self.registrosSelData.length);

                        var datafound = _.findWhere(self.registrosSelData, datos);
                        index = _.indexOf(self.registrosSelData, datafound);
                        if (index >= 0) {
                            self.registrosSelData.splice(index, 1);
                        }
                    }
                });

                if (self.selTodos) {
                    grid.tbody.find('input:checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var items = grid.items();

                    var listItems = [];
                    listItems = $.grep(items, function (row) {
                        var dataItem = grid.dataItem(row);
                        return self.registrosDesSelData.some(function (data) {
                            return data.id == dataItem.id;
                        });
                    });

                    listItems.forEach(function (row, idx) {
                        $(row.cells[0])[0].childNodes[0].checked = false;
                        $(row).closest("tr").removeClass("k-state-selected");
                    });
                } else {
                    grid.tbody.find('input:checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');

                    var items = grid.items();

                    var listItems = [];
                    listItems = $.grep(items, function (row) {
                        var dataItem = grid.dataItem(row);
                        return self.registrosSelData.some(function (data) {
                            return data.id == dataItem.id;
                        });
                    });

                    listItems.forEach(function (row, idx) {
                        $(row.cells[0])[0].childNodes[0].checked = true;
                        $(row).closest("tr").addClass("k-state-selected");
                    });
                }
            },
            mostrarFiltros: function (self) {
                if ($(".filters").is(":visible")) {
                    $(".filters").hide("slow");
                    self.ResizeTab(0);
                    $("#btnFiltros").html('<span class="k-icon k-i-plus"></span>' + window.app.idioma.t('MOSTRAR_FILTROS'));
                }
                else {
                    $(".filters").show("slow");
                    self.ResizeTab(1);
                    $("#btnFiltros").html('<span class="k-icon k-i-minus"></span>' + window.app.idioma.t('OCULTAR_FILTROS'));
                }
            },
            detalleStock: function (e) {
                var self = this;

                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var dataRow = $("#divControlStock").data("kendoExtGrid").dataItem(tr);

                this.ventana = new vistaDetalleLote(dataRow);
            },
            ResizeTab: function (isVisible) {
                var cabeceraHeight1 = $("#divCabeceraVista").height();
                var contenedorHeight = $("#center-pane").height();
                var toolbarHeight = $(".k-grid-toolbar").height() < 70 ? $(".k-grid-toolbar").height() + 53 : $(".k-grid-toolbar").height();
                var cabeceraHeight = $(".k-grouping-header").height();
                var headerHeightGrid = $(".k-grid-header").height();
                var divFiltersGrid = isVisible == 0 ? 0 : $("#divFilters").height();

                var gridElement = $("#divControlStock"),
                    dataArea = gridElement.find(".k-grid-content:first"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - toolbarHeight - cabeceraHeight1 - cabeceraHeight - divFiltersGrid - headerHeightGrid);
            },
            generarEtiqueta: function (e, self) {
                let selectedRow = $("tr.k-state-selected");

                if (selectedRow.length > 1) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_ELEGIR_SOLO_UN_REGISTRO'), 4000);
                    return;
                }

                var dataItem = $('#divControlStock').data('kendoExtGrid').dataItem(selectedRow);
                if (!dataItem) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                var barcode = $('#barcode').data('kendoQRCode');
                barcode.setOptions({
                    value: dataItem.LOTE_MES,
                    renderAs: "svg",
                    color: "#000000",
                    size: 520,
                    text: {
                        visible: false
                    },
                });
                barcode.redraw();

                $("#txtBarcode").remove();
                $("#barcode div").append('<center><h3 style="color:#000000" id="txtBarcode">' + dataItem.LOTE_MES + '</h3></center>')

                var mywindow = window.open('', 'QR', '');
                mywindow.document.write('<html><head><title>QR - ' + dataItem.LOTE_MES + '</title>');
                mywindow.document.write("<style>");
                mywindow.document.write("#barcode{height:100%;width:100%;}"
                    + "#barcode div{" +
                    "margin-bottom:0.3em;" +
                    "position: absolute;" +
                    //"top:50%;" +
                    //"left: 50%;" +
                    "transform: translate(-50%, -50%);" +
                    "}" +
                    "#barcode svg{ border-style: solid; padding-top:0.5em;padding-bottom:0.5em}"

                    + "#txtBarcode{" +
                    "font-size:1.2em;" +
                    "margin-top:0.6em;" +
                    "font-family:'Helvetica Neue',Helvetica,Arial,sans-serif" +
                    "}"
                );
                mywindow.document.write("</style>");
                mywindow.document.write('</head><body ><div style="height:100%;width:100%;position:absolute;top:50%;left:50%">');
                //Contenido del codigo de barras
                mywindow.document.write(document.getElementById('barcode').outerHTML);
                mywindow.document.write('</div></body></html>');

                mywindow.document.close(); // necessary for IE >= 10
                mywindow.focus(); // necessary for IE >= 10*/

                mywindow.print();
                //mywindow.close();

                return true;
            },
            ActualizarGrid: function () {
                const self = this;

                //self.dsStock.filter({});
                $("#divControlStock").data("kendoExtGrid").setDataSource(self.dsStock);
                self.dsStock.read();
            },
            MostrarLIMS: function (e, self) {
                let selectedRow = $("tr.k-state-selected");

                if (selectedRow.length > 1) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_ELEGIR_SOLO_UN_REGISTRO'), 4000);
                    return;
                }

                var dataItem = $('#divControlStock').data('kendoExtGrid').dataItem(selectedRow);
                if (!dataItem) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                let data = {
                    IdLoteMES: dataItem.LOTE_MES,
                    FechaLote: dataItem.FECHA_ENTRADA_PLANTA
                }

                let ventana = $("<div id='window-lims'/>").kendoWindow({
                    title: window.app.idioma.t("LIMS"),
                    maxWidth: "90%",
                    height: "90%",
                    close: function () {
                        kendoWindow.destroy();
                    },
                    resizable: false,
                    modal: true
                })

                let kendoWindow = ventana.getKendoWindow();

                let template = kendo.template($("#tmpLIMS").html());
                kendoWindow
                    .content(template(data));

                kendo.init(ventana);

                $("#gridLIMS").css("height", (window.innerHeight * 0.9 - 60) + "px");

                new vistaLIMS({
                    LoteMES: data.IdLoteMES,
                    FechaLote: data.FechaLote,
                    opciones: {
                        mostrarLanzarMuestra: true,
                        PeticionMuestraCallback: () => {
                            self.ActualizarGrid();
                        }
                    }
                });

                kendoWindow.center().open();
            },
            MostrarArchivosAdjuntos: function (e, self) {
                let selectedRow = $("tr.k-state-selected");

                if (selectedRow.length > 1) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_ELEGIR_SOLO_UN_REGISTRO'), 4000);
                    return;
                }

                var dataItem = $('#divControlStock').data('kendoExtGrid').dataItem(selectedRow);
                if (!dataItem) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                let data = {
                    id: dataItem.ID_LOTE_MMPP,
                    tipoLote: self.constTipoMovimientoLote.Envasado
                }

                self.windowAA = new vistaArchivosAdjuntos({ parent: self, data });

            },
            MostrarNotasLote: function (e, self) {
                let selectedRow = $("tr.k-state-selected");

                if (selectedRow.length > 1) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_ELEGIR_SOLO_UN_REGISTRO'), 4000);
                    return;
                }

                var dataItem = $('#divControlStock').data('kendoExtGrid').dataItem(selectedRow);
                if (!dataItem) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                let data = {
                    id: dataItem.ID_LOTE_MMPP,
                    notas: dataItem.NOTAS,
                    tipoLote: self.constTipoMovimientoLote.Envasado
                }

                self.windowNL = new vistaNotasLote({ parent: self, data });

            },
            eliminar: function () {
                this.remove();
            },
        });

        return gridMateriales;
    });