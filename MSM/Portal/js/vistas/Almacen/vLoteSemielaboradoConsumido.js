define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/LoteSemielaboradoConsumido.html', 'compartido/notificaciones', 'compartido/utils',
    'vistas/vDialogoConfirm', "jszip",
    'vistas/Almacen/vDetalleLoteUbicaciones', 'text!../../../Almacen/html/vpOperacionesControlStock.html', 'vistas/Almacen/vFormOperacionesControlStock',
    'definiciones', 'vistas/Fabricacion/vVerDetallesOrden_LIMS', 'vistas/Fabricacion/vNotasLote', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, plantillaGestionMateriales, Not, Utils, VistaDlgConfirm, JSZip,
        vistaDetalleLote, vpOperacionesControlStock, jsOperacionesControlStock, definiciones, vistaLIMS,
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
            constantes: definiciones.OperacionesAlmacen(),
            constTipoMovimientoLote: enums.TipoMovimientoLote(),
            constTipoEnvaseCerveza: enums.TipoEnvaseCerveza(),
            tiposMateriales: definiciones.TipoMaterial(),
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
                self.PropiedadesEditables = TienePermiso(258);

                self.render();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));
                window.JSZip = JSZip;

                var tooltip = kendo.template($("#tooltip").html());

                var ExtGrid = window.app.cfgKendo.extGridToolbarColumnMenu;
                kendo.ui.plugin(ExtGrid);

                self.dsStock = new kendo.data.DataSource({
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerStockLoteSemielaboradoConsumido",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "PUT"
                        },
                        update: {
                            url: "../api/ActualizarLoteSemielaboradoConsumido",
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
                            if (type == "update" || type == "create") {
                                options.Unidad = $("#uomDrop").data("kendoDropDownList").dataItem($("#uomDrop").data("kendoDropDownList").select()).SourceUoMID;
                                options.IdMaterial = $("#materialDrop").data("kendoDropDownList").dataItem($("#materialDrop").data("kendoDropDownList").select()).IdMaterial;

                                return JSON.stringify(options);
                            }
                        }
                    },
                    requestEnd: function (e) {
                        if (e.type == "update" || e.type == "create" || e.type == "destroy") {
                            if (e.response.ResultadoError) {
                                Not.crearNotificacion('warning', window.app.idioma.t('INFO'), window.app.idioma.t(e.response.ResultadoError), 5000);
                            }
                            $("#divControlStock").data("kendoExtGrid").dataSource.read();
                        }
                    },
                    schema: {
                        parse: function (data) {
                            var items = Array.isArray(data) ? data : [data];

                            for (var d of items) {
                                var loteMES = d.LoteMES;
                                if (loteMES) {
                                    var claseMat = loteMES.split("-")[2];

                                    if (claseMat) {
                                        d.TipoEnvase = self.constTipoEnvaseCerveza.hasOwnProperty(claseMat) ? claseMat : null;
                                    }
                                } else {
                                    d.TipoEnvase = "";
                                }
                            }
                            return data;
                        },
                        model: {
                            id: "IdLoteSemielaborado",
                            fields: {
                                'IdLoteSemielaborado': { type: "number", editable: false },
                                'TipoMaterial': { type: "string", editable: false },
                                'ClaseMaterial': { type: "string", editable: false },
                                'IdMaterial': {
                                    type: "string",
                                    validation: {
                                        required: true,
                                        customIdMaterial: function (input) {
                                            if (input.attr("data-bind") == "value:IdMaterial" && input.val() == 0) {
                                                    input.attr("data-customIdMaterial-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                    input.parents("td").append(tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                    return false;
                                                

                                            }
                                            return true;

                                        }
                                    }
                                },
                                'NombreMaterial': { type: "string", editable: false },
                                'LoteMES': { type: "string", editable: false },
                                'IdProceso': {
                                    type: "number",
                                    validation: {
                                        required: true,
                                        customProceso: function (input) {
                                            if (input.attr("data-bind") == "value:IdProceso" && input.val() == 0) {
                                                input.attr("data-customProceso-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'Proceso': { type: "string" },
                                'CantidadInicial': {
                                    type: "number", validation: {
                                        required: true,
                                        customCantidadInicial: function (input) {
                                            if (input.attr("data-bind") == "value:CantidadInicial" && input.val() == 0) {
                                                input.attr("data-customCantidadInicial-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    },
                                },
                                'CantidadActual': {
                                    type: "number"
                                },
                                'Unidad': {
                                    type: "string",
                                    validation: {
                                        required: true,
                                        customUnidad: function (input) {
                                            if (input.attr("data-bind") == "value:Unidad" && input.val() == 0) {
                                                input.attr("data-customUnidad-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'FechaConsumo': { type: "date" },
                                'FechaCreacion': {
                                    type: "date",
                                    validation: {
                                        required: true,
                                        customFechaCreacion: function (input) {
                                            if (input.attr("data-bind") == "value:FechaCreacion" && input.val() == 0) {
                                                input.attr("data-customFechaCreacion-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    },
                                },
                                'Almacen': { type: "string", editable: false },
                                'Zona': { type: "string", editable: false },

                                'Ubicacion': { type: "string" },
                                'IdUbicacionOrigen': {
                                    type: "number", validation: {
                                        required: true,
                                        customUbicacion: function (input) {
                                            if (input.attr("data-bind") == "value:IdUbicacionOrigen" && input.val() == 0) {
                                                input.attr("data-customUbicacion-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    },
                                },
                                'UbicacionMES': { type: "string", editable: false },
                                'EstadoUbicacion': { type: "string", editable: false },
                                'TipoUbicacion': { type: "string", editable: false },
                                'PoliticaVaciado': { type: "string", editable: false },
                                'UbicacionConDescriptivo': { type: "string", editable: false },
                                "Notas": { type: "string", editable: false }
                            }
                        }
                    },
                    sort: {
                        field: "FechaCreacion",
                        dir: "desc"
                    },
                    pageSize: 50,
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_LOTE_SEMIELABORADO'), 5000);
                    }
                });

                $("#divControlStock").kendoExtGrid({
                    dataSource: self.dsStock,
                    autoBind: false,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    sortable: true,
                    toolbarColumnMenu: true,
                    scrollable: true,
                    editable: {
                        mode: "popup",
                        confirmation: false
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 500, 'All'],
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
                            template: '<label style="margin-right:5px">' + window.app.idioma.t("FECHA_CREACION") + '</label><input placeholder="' +
                                window.app.idioma.t('INICIO_CONSUMO') + '" id="cmbFechaInicioConsumo" style="margin-right:5px; width:190px" /><input placeholder="' +
                                window.app.idioma.t('FIN_CONSUMO') + '" style="margin-right:5px; width:190px" id="cmbFechaFinConsumo" />'
                        },
                        {
                            template: "<button type='button' id='btnExcelStock' class='k-button k-button-icontext' style='float:right;margin-left:5px;'> <span class='k-icon k-i-excel'></span>" + window.app.idioma.t('EXPORTAR_EXCEL') + "</button>"
                        },
                        {
                            template: "<input id='btnOperations' />"
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
                            template: "<button type='button' id='btnNotasLote' class='k-button k-button-icontext' " +
                                "data-funcion='FAB_PROD_EXE_11_VisualizacionLoteSemielaboradoConsumido FAB_PROD_EXE_11_GestionLoteSemielaboradoConsumido' " +
                                "style='float:right;'> <span><img src='../../../Common/img/nota.png' style='width: 16px; opacity: 0.8; margin-right: 6px;'/></span>" + window.app.idioma.t('NOTAS') + "</button>"
                        }

                    ],
                    columns: [
                        {
                            headerTemplate: '<input class="checkbox" id="btnSelTodos" name="btnSelTodos" type="checkbox" />',
                            template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                            width: 35
                        },
                        {
                            title: window.app.idioma.t("NOTAS"),
                            field: "Notas",
                            filterable: false,
                            groupable: false,
                            attributes: { style: "text-align:center;" },
                            template: '<img src="../Portal/img/round_comment_notification.png" title="#: Notas #" style="width: 16px !important; height:16px !important;#if(!Notas){# display:none;#}#">',
                            width: 35
                        },
                        {
                            template: function (e) {
                                let title = window.app.idioma.t("ESTADO_LIMS_" + e.IdEstadoLIMS) || "";
                                return "<div class='circle_cells' title='"+ title +"' style='background-color:" + e.ColorEstadoLIMS + ";'/>"
                            },
                            width: 50,
                            title: window.app.idioma.t("LIMS"),
                            attributes: { style: "text-align:center;" },
                            groupable: false,
                            filterable: false,
                            //toolbarColumnMenu: false
                        },
                        {
                            hidden: true,
                            title: window.app.idioma.t("TIPO_MATERIAL"),
                            field: 'TipoMaterial',
                            width: 200,
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
                                        return "<div><label><input type='checkbox' value='#=TipoMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoMaterial#</label></div>";
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
                            field: 'ClaseMaterial',
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=ClaseMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#= ClaseMaterial#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            attributes: {
                                style: 'white-space: nowrap ',
                            },
                            title: window.app.idioma.t("CODIGO_JDE"),
                            field: 'IdMaterial',
                            template: '<span class="addTooltip">#=IdMaterial#</span>',
                            editor: function (e, options) { return self.MaterialDropDownEditor(self, e, options) },
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#= IdMaterial#</label></div>";
                                    }
                                }
                            },


                        },
                        {
                            title: window.app.idioma.t("DESCRIPCION"),
                            field: 'NombreMaterial',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            width: 250,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=NombreMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#= NombreMaterial#</label></div>";
                                    }
                                }
                            },
                        },
                       
                        {
                            title: window.app.idioma.t("LOTE_MES"),
                            field: 'LoteMES',
                            template: "<span class='addTooltip'>#=LoteMES != null ? LoteMES : ''#</span>",
                            width: 350,
                            attributes: {
                                style: 'white-space: nowrap ',
                            },
                        },
                        {
                            title: window.app.idioma.t("PROCESO"),
                            field: 'Proceso',
                            width: 150,
                            template: "<span class='addTooltip'>#=Proceso != null ? Proceso : ''#</span>",
                            editor: function (e, options) { return self.ProcesoDropDownEditor(e, options) },
                            attributes: {
                                style: 'white-space: nowrap '
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Proceso#' style='width: 14px;height:14px;margin-right:5px;'/>#= Proceso#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_INICIAL"),
                            field: 'CantidadInicial',
                            width: 150,
                            attributes: {
                                style: 'white-space: nowrap '
                            },
                            template: '<span class="addTooltip">#= kendo.format("{0:n2}",CantidadInicial)#</span>',
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
                            field: 'CantidadActual',
                            width: 150,
                            template: '<span class="addTooltip">#= kendo.format("{0:n2}",CantidadActual)#</span>',
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
                                style: 'white-space: nowrap '
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",

                        },
                        {
                            title: window.app.idioma.t("UNIDAD_MEDIDA"),
                            field: 'Unidad',
                            width: 100,
                            template: '<span class="addTooltip">#=Unidad#</span>',
                            editor: function (e, options) { return self.UoMDropdDownEditor(e, options) },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Unidad#' style='width: 14px;height:14px;margin-right:5px;'/>#= Unidad#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("FECHA_CREACION"),
                            field: 'FechaCreacion',
                            width: 200,
                            editor: function (e, options) { return self.FechaDropDownEditor(e, options) },
                            template: '<span class="addTooltip">#= FechaCreacion != null ? kendo.toString(new Date(FechaCreacion), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #</span>',
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
                            title: window.app.idioma.t("FECHA_CONSUMO"),
                            field: 'FechaConsumo',
                            width: 200,
                            editor: function (e, options) { return self.FechaDropDownEditor(e, options) },
                            template: '<span class="addTooltip">#= FechaConsumo != null ? kendo.toString(new Date(FechaConsumo), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #</span>',
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
                            field: 'Almacen',
                            title: window.app.idioma.t("ALMACEN"),
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Almacen#' style='width: 14px;height:14px;margin-right:5px;'/>#= Almacen#</label></div>";
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
                            field: 'Zona',
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Zona#' style='width: 14px;height:14px;margin-right:5px;'/>#= Zona#</label></div>";
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
                            field: 'UbicacionConDescriptivo',
                            width: 150,
                            template: '<span class="addTooltip">#= typeof UbicacionConDescriptivo != undefined && UbicacionConDescriptivo != null ? UbicacionConDescriptivo : "" #</span>',
                            editor: function (e, options) { return self.UbicacionDropDownEditor(e, options) },
                            filterable: true,
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },
                        {
                            hidden: true,
                            title: window.app.idioma.t("TIPO_UBICACION"),
                            field: 'TipoUbicacion',
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=TipoUbicacion#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoUbicacion#</label></div>";
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
                            field: 'PoliticaVaciado',
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=PoliticaVaciado#' style='width: 14px;height:14px;margin-right:5px;'/>#= PoliticaVaciado#</label></div>";
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
                            field: 'EstadoUbicacion',
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=EstadoUbicacion#' style='width: 14px;height:14px;margin-right:5px;'/>#= EstadoUbicacion#</label></div>";
                                    }
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


                        var rows = e.sender.tbody.children();
                        self.validateCheck(self);

                        self.$("[data-funcion]").checkSecurity();
                    },
                    edit: function (e) {
                        var isNew = e.model.isNew();
                        var wnd = $(e.container).data("kendoWindow");
                        var form = e.container.find(".k-edit-form-container");

                        wnd.setOptions({
                            width: "40%"
                        });

                        wnd.center();

                        let _columnasGrid = $("#divControlStock").data("kendoExtGrid").columns;

                        for (var i = 0; i < _columnasGrid.length; i++) {
                            let _columna = _columnasGrid[i].field;
                            if (_columna) {
                                switch (_columna) {
                                    //No se añade enumerado porque estos son los nombres de las columnas que se muestran en el grid
                                    case "TipoMaterial":
                                    case "ClaseMaterial":
                                    case "NobreMaterial":
                                    case "Almacen":
                                    case "Zona":
                                    case "TipoUbicacion":
                                    case "PoliticaVaciado":
                                    case "EstadoUbicacion":
                                    case "Notas":
                                        e.container.find(".k-edit-label:eq(" + i + ")").hide();
                                        e.container.find(".k-edit-field:eq(" + i + ")").hide();
                                        break;
                                    default:
                                        if (isNew && _columna == "LoteMES") {
                                            e.container.find(".k-edit-label:eq(" + i + ")").hide();
                                            e.container.find(".k-edit-field:eq(" + i + ")").hide();
                                        }
                                        break;
                                }
                            } else {
                                e.container.find(".k-edit-label:eq(" + i + ")").hide();
                                e.container.find(".k-edit-field:eq(" + i + ")").hide();
                            }

                        }


                        if (isNew) {
                            $('.k-window-title').text(window.app.idioma.t("CREAR"));
                            $(".k-grid-update").text(window.app.idioma.t("GUARDAR"));
                        } else {
                            $('.k-window-title').text(window.app.idioma.t("EDITAR"));
                            $(".k-grid-update").text(window.app.idioma.t("ACTUALIZAR"));
                            $(".k-grid-cancel").text(window.app.idioma.t("CANCELAR"));

                            $('.k-edit-label').prop("disabled", true).addClass("k-state-disabled");

                        }

                        // Añadimos el campo Botella / Barril que aparecerá cuando se seleccione el proceso Prellenado
                        form.find("[data-container-for='Proceso']").after(`<div id='TipoEnvaseContainer' style='display:none'>
                        <div class="k-edit-label ${(!isNew ? 'k-state-disabled' : '')}"><label for="TipoEnvase">${window.app.idioma.t("TIPO_ENVASE")}</label></div>
                        <div  data-container-for="TipoEnvase" class="k-edit-field"><input class="width-80" id="TipoEnvase" name="TipoEnvase"/></div>
                        </div>`);

                        var tipoEnvaseDDL = $("#TipoEnvase").kendoDropDownList({
                            dataSource: Object.entries(self.constTipoEnvaseCerveza).map(([key, value]) => ({ value: key, text: value })),
                            optionLabel: "Seleccione…",
                            dataTextField: "text",
                            dataValueField: "value",
                            value: !isNew && e.model.IdProceso == 7 ? e.model.TipoEnvase : null,
                        }).data("kendoDropDownList");

                        var procesoDDL = $("#procesoDrop").getKendoDropDownList();

                        function toggleTipoEnvase() {
                            var valorProceso = procesoDDL ? procesoDDL.value() : null;
                            var habilitar = (valorProceso == 7);
                            if (habilitar) {
                                $("#TipoEnvaseContainer").show();
                            } else {
                                tipoEnvaseDDL.value(null);
                                $("#TipoEnvaseContainer").hide();
                            }
                        }

                        if (procesoDDL) {
                            procesoDDL.bind("change", toggleTipoEnvase);
                        }

                        if (!isNew) {
                            procesoDDL.one("dataBound", function () {
                                this.trigger("change");
                            })
                        }

                        e.model.set("TipoEnvase", tipoEnvaseDDL.value());
                        tipoEnvaseDDL.bind("change", function () { e.model.set("TipoEnvase", tipoEnvaseDDL.value()); });
                    },
                    cancel: function (e) {
                        self.dsStock.read();
                    }
                });

                // Borro el titulo de la columna Notas (no cabe en el grid, pero está definido para que salga en el excel)
                $("#divControlStock th[data-field='Notas'] a").remove();

                var _operaciones = $("#btnOperations").kendoDropDownList({
                    dataSource: [
                        { id: self.constantes.OPERACIONES, name: window.app.idioma.t('OPERACIONES') },
                        { id: self.constantes.EDITAR_LOTE, name: window.app.idioma.t('EDITAR_LOTE') },
                        { id: self.constantes.ELIMINAR_LOTE, name: window.app.idioma.t('ELIMINAR_LOTE') },
                        { id: self.constantes.EDITAR_PROPIEDADES_LOTE, name: window.app.idioma.t('EDITAR_PROPIEDADES_LOTE') }
                    ],
                    dataTextField: "name",
                    dataValueField: "id",
                    select: function (e) {
                        if (e.item) {
                            var dataItem = this.dataItem(e.item);
                            var grid = $("#divControlStock").data("kendoExtGrid");

                            switch (dataItem.id) {
                                case self.constantes.EDITAR_LOTE:
                                    if (self.registrosSelData.length == 0) {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR_LOTE'), 3000);
                                    }
                                    else if (self.registrosSelData.length > 1) {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('EDITAR_UN_SOLO_LOTE'), 3000);
                                    } else {
                                        var currentRow = grid.tbody.find("tr[data-uid='" + self.registrosSelData[0].uid + "']");
                                        grid.editRow(currentRow);
                                    }
                                    break;
                                case self.constantes.ELIMINAR_LOTE:
                                    if (self.registrosSelData.length == 0) {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR_LOTE'), 3000);
                                    } else {
                                        self.confirmarBorrado(e);
                                    }
                                    break;
                                case self.constantes.EDITAR_PROPIEDADES_LOTE:
                                    if (self.registrosSelData.length == 0) {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR_LOTE'), 3000);
                                    } else {
                                        jsOperacionesControlStock.ShowWindowNewForm(e, self, dataItem.id, dataItem.name);
                                    }
                                    break;
                                default:
                            }
                        }
                        //e.preventDefault();
                        // Use the selected item or its text
                    }
                });

                $("#divControlStock").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

                var datenow = new Date();

                self.barcode = $("#barcode").kendoQRCode();

                self.registrosDesSelData = [];
                self.registrosSelData = [];
                self.selTodos = false;
                self.$("#lblRegSel").text("");

                self.tmpToolbar = kendo.template($("#tmpToolbar").html());

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

                $("#ulToolbarColumn").addClass("listColumn")
                self.ResizeTab();
            },
            events: {
                'click #btnFiltros': function () { this.mostrarFiltros(this); },
                'click #btnExcelStock': 'exportExcel',
                'click #btnLotesConsumidos': 'chkChange',
                'click #btnConsultar': 'consultar',
                'click #btnSelTodos': function () { this.aplicarSeleccion(); },
                'click #btnPropiedades': function (e) { this.VerPropiedades(e, this); },
                'click #btnMostrarLIMS': function (e) { this.MostrarLIMS(e, this); },
                'click #btnNotasLote': function (e) { this.MostrarNotasLote(e, this); },
                'click #btnGenerarEtiqueta': function (e) { this.generarEtiqueta(e, this); },
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
                datos.IdLote = element.LoteMES;
                datos.IdLoteSemielaborado = element.IdLoteSemielaborado;
                datos.UbicacionMES = element.UbicacionMES;
                datos.CantidadActual = element.CantidadActual;
                datos.uid = element.uid;
                datos.EstadoUbicacion = element.EstadoUbicacion;
                data.registrosSelData.push(datos);

                var dataItem = { id: self.constantes.EDITAR_PROPIEDADES_LOTE, name: window.app.idioma.t('EDITAR_PROPIEDADES_LOTE') }
                data.PropiedadesEditables = self.PropiedadesEditables;
                jsOperacionesControlStock.ShowWindowNewForm(e, data, dataItem.id, dataItem.name);
            },
            confirmarBorrado: function (e) {
                e.preventDefault();
                var self = this;
                var permiso = TienePermiso(256);
                var _lotesSeleccionados = $("#divControlStock").data("kendoExtGrid").tbody.find('input:checked');

                if (_lotesSeleccionados.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR_LOTE'), 3000);
                    return;
                }

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ELIMINAR'),
                    msg: window.app.idioma.t('CONFIRMACION_ELIMINAR_LOTE'),
                    funcion: function () { self.eliminarLotes(_lotesSeleccionados); },
                    contexto: this
                });
            },
            eliminarLotes: function (_lotesSeleccionados) {
                var grid = $("#divControlStock").data("kendoExtGrid");
                var _result = [];

                _lotesSeleccionados.each(function () {
                    var _item = grid.dataItem($(this).closest('tr'));
                    $.ajax({
                        type: "DELETE",
                        url: "../api/EliminarLoteSemielaboradoConsumido/" + _item.IdLoteSemielaborado,
                        dataType: 'json',
                        async: false
                    }).done(function (result) {
                        if (result != 0) {
                            _result.push(true);
                        } else {
                            _result.push(false);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }).fail(function (e, xhr) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    });
                });

                if (!_result.includes(false)) {
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('LOTES_ELIMINADOS_CORRECTAMENTE'), 4000);
                    $("#divControlStock").data("kendoExtGrid").dataSource.read();
                }
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
            MaterialDropDownEditor: function (self, container, options) {
                $('<input data-text-field="DescripcionCompleta"  class="width-80" id="materialDrop"  data-value-field="IdMaterial" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        optionLabel: window.app.idioma.t("SELECCIONE_MATERIAL"),
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());

                            this.setDataSource(this.dataSource.data().filter(item => item.Tipo == self.tiposMateriales.Default || item.Tipo == self.tiposMateriales.Semielaborados
                                || item.Tipo == self.tiposMateriales.Subproductos));
                        },
                        dataSource: {

                            transport: {
                                read: {
                                    url: "../api/GetMaterial",
                                    dataType: "json"
                                }

                            },
                            sort: { field: "DescripcionCompleta", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdMaterial",
                                    fields: {
                                        'IdMaterial': { type: "string" },
                                        'DescripcionCompleta': { type: "string" },
                                    }
                                }
                            },
                        },
                    });
                // $('<span class="k-invalid-msg" data-for="sl' + options.field + '"></span>').appendTo(container);
                var materialDrop = $("#materialDrop").data("kendoDropDownList");
                materialDrop.list.width("auto");
            },
            ProcesoDropDownEditor: function (container, options) {
                $('<input data-text-field="Descripcion" id="procesoDrop" class="width-80"  data-value-field="IdProceso" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        dataTextField: "Descripcion",
                        dataValueField: "IdProceso",
                        optionLabel: window.app.idioma.t("SELECCIONAR_PROCESO"),
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },
                        dataBound: function (e) {
                            var ddl = this;
                            ddl.select(function (dataItem) {
                                return dataItem.IdProceso === options.model.IdProceso
                            })
                        },
                        dataSource: {
                            transport: {
                                read: {
                                    url: "../api/ObtenerProcesosLotes/true",
                                    dataType: "json"
                                }
                            },
                            sort: { field: "Descripcion", dir: "asc" },
                        },
                        select: function (e) {
                            var grid = $("#divControlStock").data("kendoExtGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                            if (item)
                                item.set("IdProceso", dataItem.IdProceso);
                        },
                    });
                // $('<span class="k-invalid-msg" data-for="sl' + options.field + '"></span>').appendTo(container);
                var procesoDrop = $("#procesoDrop").data("kendoDropDownList");
                procesoDrop.list.width("auto");
            },
            UbicacionDropDownEditor: function (container, options) {
                $('<input data-text-field="Nombre" class="width-80" id="ubicacioncmb" data-value-field="IdUbicacion" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },
                        optionLabel: window.app.idioma.t("SELECCIONE_UBICACION"),
                        dataBound: function (e) {
                            var ddl = this;
                            ddl.select(function (dataItem) {
                                return dataItem.IdUbicacion === options.model.IdUbicacionOrigen
                            });

                            ddl.trigger("select")
                        },
                        select: function (e) {
                            var grid = $("#divControlStock").data("kendoExtGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                            if (item)
                                item.set("IdUbicacionOrigen", dataItem.IdUbicacion);
                        },
                        dataSource: {
                            transport: {
                                read: {
                                    url: "../api/GetLocation/0/0",
                                    dataType: "json",
                                    cache: false
                                }
                            },
                            sort: { field: "Nombre", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdUbicacion",
                                    fields: {
                                        'IdUbicacion': { type: "number" },
                                        'Nombre': { type: "string" },
                                    }
                                }
                            }
                        },
                    });

                // $('<span class="k-invalid-msg" data-for="sl' + options.field + '"></span>').appendTo(container);
                var ubicacioncmb = $("#ubicacioncmb").data("kendoDropDownList");
                ubicacioncmb.list.width("auto");
                ///$('<a id="btnAddProveedor" class="k-button" style="min-width:40px !important;width:10% !important"> <span class="k-icon k-add"></span> </a>').appendTo(container);
            },
            UoMDropdDownEditor: function (container, options) {
                var dsUnidadMedida = new kendo.data.DataSource({
                    batch: true,
                    transport: {
                        read: {
                            url: "../api/GetUnidadMedida/",
                            dataType: "json",
                            cache: false
                        },
                        schema: {
                            model: {
                                id: "SourceUoMID",
                                fields: {
                                    'SourceUoMID': { type: "string" },
                                }
                            }
                        }
                    }
                });

                $('<input data-text-field="SourceUoMID" id="uomDrop" class="width-80" data-value-field="PK" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        dataBound: function (e) {
                            var ddl = this;
                            ddl.select(function (dataItem) {
                                return dataItem.SourceUoMID === options.model.Unidad
                            })
                        },
                        optionLabel: window.app.idioma.t("SELECCIONE_UNIDAD"),
                        select: function (e) {
                            var grid = $("#divControlStock").data("kendoExtGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                            item.set("Unidad", dataItem.SourceUoMID);
                        },
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },
                        dataSource: dsUnidadMedida

                    });

                var UoMDrop = $("#uomDrop").data("kendoDropDownList");
                UoMDrop.list.width("auto");
            },
            FechaDropDownEditor: function (container, options) {
                $('<input class="width-80" data-text-field="' + options.field + '" data-value-field="' + options.field
                    + '" data-bind="value:' + options.field + '" />')
                    .appendTo(container)
                    .kendoDateTimePicker({
                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                        culture: localStorage.getItem("idiomaSeleccionado"),
                        //value: new Date(options.model.dateTime)
                    });
            },
            TextBoxEditor: function (container, options, value) {
                $('<input class="width-80 k-textbox" value="' + value + '" name="sl' + options.field + '" data-text-field="' + options.field + '" data-value-field="' + options.field
                    + '" data-bind="value:' + options.field + '" id="' + options.field + '" />')
                    .appendTo(container);
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
                        datos.IdLote = dataFiltered[i].LoteMES;
                        datos.UbicacionMES = dataFiltered[i].UbicacionMES;
                        datos.CantidadActual = dataFiltered[i].CantidadActual;
                        datos.uid = dataFiltered[i].uid;
                        datos.EstadoUbicacion = dataFiltered[i].EstadoUbicacion;
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
                    row = $(e.target).closest("tr");
                    dataItem = grid.dataItem(row);
                    //var idValue = grid.dataItem(row).get("idTiempoCambio");

                    var datos = {};
                    datos.IdLote = dataItem.LoteMES;
                    datos.IdLoteSemielaborado = dataItem.IdLoteSemielaborado;
                    datos.UbicacionMES = dataItem.UbicacionMES;
                    datos.CantidadActual = dataItem.CantidadActual;
                    datos.EstadoUbicacion = dataItem.EstadoUbicacion;
                    datos.uid = dataItem.uid;
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
            exportExcel: function (e) {
                $("#divControlStock").data("kendoExtGrid").options.excel.fileName = window.app.idioma.t('CONTROL_STOCK') + ".xlsx";
                $("#divControlStock").data("kendoExtGrid").saveAsExcel();
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
                    value: dataItem.LoteMES,
                    renderAs: "svg",
                    color: "#000000",
                    size: 520,
                    text: {
                        visible: false
                    },
                });
                barcode.redraw();

                $("#txtBarcode").remove();
                $("#barcode div").append('<center><h3 style="color:#000000" id="txtBarcode">' + dataItem.LoteMES + '</h3></center>')

                var mywindow = window.open('', 'QR', '');
                mywindow.document.write('<html><head><title>QR - ' + dataItem.LoteMES + '</title>');
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

                self.dsStock.filter({});
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
                    IdLoteMES: dataItem.LoteMES,
                    FechaLote: dataItem.FechaCreacion
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
                    id: dataItem.IdLoteSemielaborado,
                    notas: dataItem.Notas,
                    tipoLote: self.constTipoMovimientoLote.Semielaborado
                }

                self.windowNL = new vistaNotasLote({ parent: self, data });

            },
            eliminar: function () {
                this.remove();
            },
        });

        return gridMateriales;
    });