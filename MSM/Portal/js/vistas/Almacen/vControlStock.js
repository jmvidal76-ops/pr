define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/ControlStock.html', 'compartido/notificaciones', 'compartido/util',
    'vistas/Fabricacion/vEditarLote', 'vistas/vDialogoConfirm', "jszip",
    'vistas/Almacen/vDetalleLoteUbicaciones', 'text!../../../Almacen/html/vpOperacionesControlStock.html', 'vistas/Almacen/vFormOperacionesControlStock',
    'definiciones', 'vistas/Fabricacion/vVerDetallesOrden_LIMS', 'vistas/Fabricacion/vArchivosAdjuntosLote', 'vistas/Fabricacion/vNotasLote',
    '../../../../Portal/js/constantes', 'vistas/Trazabilidad/vCrearLoteCervezaLlenadora'],
    function (_, Backbone, $, plantillaGestionMateriales, Not, Utils, vistaEditarLote, VistaDlgConfirm, JSZip,
        vistaDetalleLote, vpOperacionesControlStock, jsOperacionesControlStock, definiciones, vistaLIMS, vistaArchivosAdjuntos,
        vistaNotasLote, enums, vistaCrearLoteCervezaLlenadora) {
        var gridMateriales = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            dsStock: null,
            barcode: null,
            newOrder: [],
            registrosSel: [],
            registrosSelData: [],
            registrosDesSelData: [],
            constantes: definiciones.OperacionesAlmacen(),
            constTipoMovimientoLote: enums.TipoMovimientoLote(),
            IdTipoUbicacion: definiciones.IdTipoUbicacion(),
            selTodos: false,
            checkedIds: {},
            wnd: null,
            tmpToolbar: null,
            vpOperaciones: _.template(vpOperacionesControlStock),
            template: _.template(plantillaGestionMateriales),
            PropiedadesEditables: false,
            initialize: function () {
                kendo.culture(localStorage.getItem("idiomaSeleccionado"));
                var self = this;
                self.PropiedadesEditables = TienePermiso(226);
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
                            url: "../api/ObtenerStock",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "GET"
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
                                'FECHA_CUARENTENA': { type: "date" },
                                'MOTIVO_CUARENTENA': { type: "string" },
                                'FECHA_BLOQUEO': { type: "date" },
                                'FECHA_FABRICACION': { type: "date" },
                                'MOTIVO_BLOQUEO': { type: "string" },

                                'ID_ALMACEN': { type: "number" },
                                'ALMACEN': { type: "string" },
                                'ID_ZONA': { type: "number" },
                                'ZONA': { type: "string" },

                                'UBICACION': { type: "string" },
                                'UBICACION_ORIGEN': { type: "number" },
                                'UBICACION_MES': { type: "string" },
                                'ESTADO_UBICACION': { type: "string" },
                                'ID_TIPO_UBICACION': { type: "number" },
                                'TIPO_UBICACION': { type: "string" },

                                'POLITICA_VACIADO': { type: "string" },
                                'DEFECTUOSO': { type: "date" },
                                'ID_PROVEEDOR': { type: "string" },
                                'PROVEEDOR': { type: "string" },
                            }
                        }
                    },
                    pageSize: 1000,
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_FECHA_STOCK'), 5000);

                    }
                });


                $("#divControlStock").kendoExtGrid({
                    dataSource: self.dsStock,
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
                                "data-funcion='ALM_PROD_DAT_3_VisualizacionControlStock ALM_PROD_DAT_3_GestionControlStock ENV_PROD_EXE_54_VisualizacionControlStockMMPP ENV_PROD_EXE_54_GestionControlStockMMPP' " +
                                "style='float:right;'> <span><img src='../../../Common/img/archivos-adjuntos.png' style='width: 16px; opacity: 0.8; margin-right: 6px;'/></span>" + window.app.idioma.t('ARCHIVOS_ADJUNTOS') + "</button>"
                        },
                        {
                            template: "<button type='button' id='btnNotasLote' class='k-button k-button-icontext' " +
                                "data-funcion='ALM_PROD_DAT_3_VisualizacionControlStock ALM_PROD_DAT_3_GestionControlStock ENV_PROD_EXE_54_VisualizacionControlStockMMPP ENV_PROD_EXE_54_GestionControlStockMMPP' " +
                                "style='float:right;'> <span><img src='../../../Common/img/nota.png' style='width: 16px; opacity: 0.8; margin-right: 6px;'/></span>" + window.app.idioma.t('NOTAS') + "</button>"
                        },
                        {
                            template: "<button type='button' id='btnCrearLoteCerveza' class='k-button k-button-icontext' style='float:right;'><span class='k-icon k-add'></span>" + window.app.idioma.t('CREAR_LOTE_CERVEZA_LLE') + "</button>"
                        },
                        {
                            template: "<button type='button' id='btnTCPOrigen' class='k-button k-button-icontext' style='float:right;'>" + window.app.idioma.t('TCP_ORIGEN') + "</button>"
                        }
                    ],
                    excel: Utils.ui.default.gridExcelDate('CONTROL_STOCK'),
                    excelExport: async function (e) {
                        ExcelGridExtra(e, Utils);
                    },
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
                            width: 200,
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
                            title: window.app.idioma.t("FECHA_INICIO_CONSUMO"),
                            field: 'FECHA_INICIO_CONSUMO',
                            width: 200,
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
                            width: 200,
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
                            title: window.app.idioma.t("FECHA_ENTRADA_UBICACION"),
                            field: 'FECHA_ENTRADA_UBICACION',
                            width: 200,
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FECHA_ENTRADA_UBICACION ? GetDateForExcel(value.FECHA_ENTRADA_UBICACION) : '' #",
                                width: 150
                            },
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
                            width: 200,
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FECHA_CADUCIDAD ? GetDateForExcel(value.FECHA_CADUCIDAD) : '' #",
                                width: 150
                            },
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
                            title: window.app.idioma.t("FECHA_FABRICACION"),
                            field: 'FECHA_FABRICACION',
                            width: 200,
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
                            hidden: true,
                            title: window.app.idioma.t("FECHA_CUARENTENA"),
                            field: 'FECHA_CUARENTENA',
                            width: 200,
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FECHA_CUARENTENA ? GetDateForExcel(value.FECHA_CUARENTENA) : '' #",
                                width: 150
                            },
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
                            width: 200,
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.FECHA_BLOQUEO ? GetDateForExcel(value.FECHA_BLOQUEO) : '' #",
                                width: 150
                            },
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
                            width: 100,
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.DEFECTUOSO ? GetDateForExcel(value.DEFECTUOSO) : '' #",
                                width: 150
                            },
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


                var _operaciones = $("#btnOperations").kendoDropDownList({
                    dataSource: [
                        { id: self.constantes.OPERACIONES, name: window.app.idioma.t('OPERACIONES') },
                        { id: self.constantes.CREAR_LOTE_2, name: window.app.idioma.t('CREAR_LOTE_2') },
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
                            var bEvaluar = true;
                            var TieneItemDeConsumo = false;
                            self.ShowCantidadMover = false;


                            // Restricciones} - el 6 no existe y se elimina
                            if (dataItem.id == self.constantes.CREAR_LOTE_2 || dataItem.id == self.constantes.BLOQUEAR) {
                                bloqueadoLote = false;
                                ubicacionBloqueada = false;
                                bEvaluar = false;
                            }
                            for (var i = 0; i < self.registrosSelData.length; i++) {
                                if (dataItem.id == self.constantes.MOVER && self.registrosSelData[i].CantidadActual <= 0) {
                                    Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('SELECCIONAR_VALORES_MAYORES_A_CERO'), 5000);
                                    return false;
                                }
                                if (dataItem.id == self.constantes.MOVER && (self.registrosSelData[i].FechaBloqueo != null || self.registrosSelData[i].FechaCuarentena != null)) {
                                    Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('SELECCINAR_NO_BLOQUEADA_NO_CUARENTENA'), 5000);
                                    return false;
                                }
                                if (self.registrosSelData[i].IdTipoUbicacion == self.IdTipoUbicacion.Consumo && !TieneItemDeConsumo) {
                                    TieneItemDeConsumo = true;
                                }
                                if (bEvaluar && !ubicacionBloqueada){
                                    if (self.registrosSelData[i].EstadoUbicacion == "Bloqueada") {
                                        ubicacionBloqueada = true;
                                    }
                                }
                            }

                            if (TieneItemDeConsumo && self.registrosSelData.length > 1) {
                                Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('SOLO_SE_DEBE_MOVER_UN_LOTE_DE_CONSUMO'), 5000);
                                return false;
                            }
                            if (TieneItemDeConsumo && self.registrosSelData.length == 1 && dataItem.id == self.constantes.MOVER) {
                                self.ShowCantidadMover = true;
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
                    }
                });

                if (IsSolan()) {
                    $("#btnCrearLoteCerveza").prop("disabled", true);
                } else {
                    $("#btnCrearLoteCerveza").prop("disabled", false);
                }

                self.barcode = $("#barcode").kendoQRCode();

                self.registrosDesSelData = [];
                self.registrosSelData = [];
                self.selTodos = false;
                self.$("#lblRegSel").text("");

                self.tmpToolbar = kendo.template($("#tmpToolbar").html());

                $("#ulToolbarColumn").addClass("listColumn")
                self.ResizeTab();
            },
            events: {
                'click #btnFiltros': function () { this.mostrarFiltros(this); },
                'click #btnExcelStock': 'exportarExcel',
                'click #btnLotesConsumidos': 'chkChange',
                'click #btnConsultar': function () { $('#divControlStock').data('kendoExtGrid').dataSource.read(); },
                'click #btnSelTodos': function () { this.aplicarSeleccion(); },
                'click #btnPropiedades': function (e) { this.VerPropiedades(e, this); },
                'click #btnMostrarLIMS': function (e) { this.MostrarLIMS(e, this); },
                'click #btnArchivosAdjuntos': function (e) { this.MostrarArchivosAdjuntos(e, this); },
                'click #btnNotasLote': function (e) { this.MostrarNotasLote(e, this); },
                'click #btnGenerarEtiqueta': function (e) { this.generarEtiqueta(e, this); },
                'click #btnTCPOrigen': 'verTCPOrigen',
                'click #btnCrearLoteCerveza': 'crearLoteCerveza',
            },
            exportarExcel: function () {
                var grid = $("#divControlStock").data("kendoExtGrid");
                if (!grid) return;
                grid.saveAsExcel();
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
            chkChange: function () {
                var isChecked = $("#chkLotesConsumidos").is(":checked") ? true : false;
                var _optionIfChecked = isChecked ? false : true;
                $("#chkLotesConsumidos").prop('checked', _optionIfChecked);

                if (document.getElementById("txtFooterLotes"))
                    $("#txtFooterLotes").remove();

                if (isChecked) {
                    $('.k-pager-wrap').append('<span id="txtFooterLotes">' + window.app.idioma.t('LOTES_CONSUMIDOS') + '</span>');
                    $("#btnLotesConsumidos").html('<span class="k-icon k-update"></span>' + window.app.idioma.t('VER_CONSUMIDOS'))
                } else {
                    $('.k-pager-wrap').append('<span id="txtFooterLotes">' + window.app.idioma.t('LOTES_NO_CONSUMIDOS') + '</span>');
                    $("#btnLotesConsumidos").html('<span class="k-icon k-i-cancel"></span>' + window.app.idioma.t('VER_CONSUMIDOS'))
                }

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
                    var row = $(e.target).closest("tr");
                    self.registrosDesSelData = [];
                    self.registrosSelData = [];
                    self.$("#lblRegSel").text("");

                    grid.tbody.find('input:checkbox').not(this).prop("checked", false);
                    grid.tbody.find(">tr").map(function (number, index, arr) {
                        if (row[0] != index) {
                            $(index).prop("checked", false);
                            $(index).removeClass('k-state-selected');
                        }
                    });


                    var checked = this.checked;
                    dataItem = grid.dataItem(row);
                    //var idValue = grid.dataItem(row).get("idTiempoCambio");

                    var datos = {};
                    datos.IdLote = dataItem.LOTE_MES;
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
                    datos.IdTipoMaterial = dataItem.ID_TIPO_MATERIAL;
                    datos.IdClaseMaterial = dataItem.ID_CLASE_MATERIAL;
                    datos.IdZona = dataItem.ID_ZONA;
                    datos.IdAlmacen = dataItem.ID_ALMACEN;
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
                } else {
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
            actualizarGrid: function () {
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
                            self.actualizarGrid();
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
            verTCPOrigen: function () {
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

                if (dataItem.ID_CLASE_MATERIAL != 'CZA') {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_SELECCIONAR_CLASE_CERVEZAS'), 4000);
                    return;
                }

                if (dataItem.UBICACION.slice(-1) != '1') {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONE_LLENADORA1_LINEA_ENVASADO'), 4000);
                    return;
                }

                $.ajax({
                    type: "GET",
                    url: "../api/controlStock/obtenerTCPOrigen/" + dataItem.UBICACION,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (result) {
                        if (result == null) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('TCP_NO_ENCONTRADO'), 4000);
                        } else {
                            let ventanaTCP = $("<div id='window-tcp'/>").kendoWindow({
                                title: window.app.idioma.t("TCP_ORIGEN"),
                                width: "300px",
                                modal: true,
                                resizable: false,
                                draggable: false,
                                close: function () {
                                    ventanaTCP.destroy();
                                },
                            }).getKendoWindow();

                            ventanaTCP.content('<p style="margin-top: 5px; font-size: 30px; text-align: center;"><b>' + result + '</b></p>');
                            ventanaTCP.center().open();
                        }
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_TCP_ORIGEN'), 4000);
                        }
                    }
                });
            },
            crearLoteCerveza: function () {
                var self = this;
                var permiso = TienePermiso(226) || TienePermiso(311);

                if (permiso) {
                    self.ventanaLoteCerveza = new vistaCrearLoteCervezaLlenadora({ ventanaPadre: self });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                }
            },
            eliminar: function () {
                this.remove();
            },
        });

        return gridMateriales;
    });