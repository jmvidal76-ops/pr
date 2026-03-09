define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/vpVerDetalleOrden_TransferenciasSAI.html'
    , 'jszip', 'definiciones'
],
    function (_, Backbone, $, FormDetalleOrden, JSZip, definiciones) {
        var vistaTransferenciasSAI = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenidoKOPs',
            confirmacion: null,
            dialogoConfirm: null,
            dsConsumo: [],
            listaIdsProduccion: [],
            listaIdsLotesConsumos: [],
            dsProduccion: [],
            dsTransferencias: [],
            gridConsumo: null,
            gridProduccion: null,
            gridTransferencia: null,
            idorden: 0,
            opciones: null,
            order: [],
            template: _.template(FormDetalleOrden),
            ventanaEditarCrear: null,
            isOrdenActiva: true,
            Recalcular: false,
            Tipo_KOP_Mod: '',
            ColorEstado: '',
            LoteMES: null,
            IdEstadoWO: definiciones.IdEstadoWO(),
            tipoWO: definiciones.TipoWO(),
            estadosKOP: definiciones.EstadoKOP(),
            estadoColor: definiciones.EstadoColor(),
            permisoVisualizacionKOPs: false,
            permisoGestionKOPs: false,
            window: null,
            initialize: function (order, idOrden, opciones, ordenEstado) {
                var self = this;
                window.JSZip = JSZip;
                self.opciones = opciones
                kendo.ui.progress(self.$("#contenedor"), true);
                self.order = order;
                self.idorden = idOrden;
                self.Recalcular = order.EstadoActual.Recalcular;
                self.isOrdenActiva = ordenEstado;
                self.LoteMES = order.LoteMES;

                self.render(self);
            },
            render: function (self) {
                $(self.el).html(this.template());
                self.CargarGrids(self);

            },
            events: function () {
                $("#btnLimpiarFiltrosTransferencia").on("click", function (e) {
                    var gridDataSource = $("#gridTransferencias").data("kendoGrid").dataSource;
                    gridDataSource.filter({});
                });
            },
            CargarGrids: function (self) {
                var urlReadTransferencias = "../api/OrdenesFab/ObtenerLotesTransferenciasPorLoteMES/" + self.LoteMES + "/";

                if (self.order?.TipoOrden.ID == self.tipoWO.Trasiego) {
                    urlReadTransferencias = "../api/OrdenesFab/ObtenerLotesTransferenciasTrasiegoPorIdWO/" + self.opciones.IdWO;
                }

                if (self.order?.TipoOrden.ID == self.tipoWO.Filtracion) {

                    if (!self.order.FecIniLocal && !self.order.FecFinLocal)
                        return;

                    var fechaInicio = (self.order.FecIniLocal).substring(0, (self.order.FecIniLocal).lastIndexOf("+"));
                    var fechaFin = !self.order.FecFinLocal ? new Date().toISOString() : (self.order.FecFinLocal).substring(0, (self.order.FecFinLocal).lastIndexOf("+"));

                    urlReadTransferencias = "../api/OrdenesFab/ObtenerLotesTransferenciasFiltracionFechas?fechaDesde=" + fechaInicio + "&fechaHasta=" + fechaFin + "&idUbicacion=" + self.opciones.IdUbicacion;
                }

                self.dsTransferencias = new kendo.data.DataSource({
                    transport: {
                        read: function (options) {
                            $.ajax({
                                type: "GET",
                                async: true,
                                url: urlReadTransferencias,
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (res) {
                                    options.success(res);
                                },
                                error: function (err) {
                                    options.error(err);
                                }
                            });
                        }
                    },
                    pageSize: 100,
                    schema: {
                        model: {
                            fields: {
                                'FechaInicio': { type: "date" },
                                'LoteSAI': { type: "string" },
                                'UbicacionOrigen': { type: "string" },
                                'DescUbicacionOrigen': { type: "string" },
                                'UbicacionDestino': { type: "string" },
                                'DescUbicacionDestino': { type: "string" },
                                'MaterialSAI': { type: "string" },
                                'Cantidad': { type: "number" },
                                'Unidad': { type: "string" }
                            }
                        }
                    }
                });

                if (!$("#gridTransferencias").data("kendoGrid")) {
                    self.gridTransferencia = $("#gridTransferencias").kendoGrid({
                        dataSource: self.dsTransferencias,
                        groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                        filterable: {
                            extra: false,
                            messages: window.app.cfgKendo.configuracionFiltros_Msg,
                            operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                        },
                        toolbar: [{
                            template: "<label>" + window.app.idioma.t('TRANSFERENCIAS_SAI') + "</label>"
                        },
                        {
                            template: "<button id='btnLimpiarFiltrosTransferencia' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        }
                        ],
                        scrollable: true,
                        sortable: true,
                        resizable: true,
                        pageable: {
                            refresh: true,
                            refresh: true,
                            pageSizes: true,
                            pageSizes: [100, 500, 1000, 'All'],
                            buttonCount: 5,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        noRecords: {
                            template: window.app.idioma.t("SIN_RESULTADOS")
                        },
                        columns: [{
                            field: "FechaInicio",
                            title: window.app.idioma.t("FECHA"),
                            template: '#= FechaInicio !== null ? kendo.toString(FechaInicio, "' + kendo.culture().calendars.standard.patterns.MES_FechaHora + '" ) : "" #',
                            width: 100,
                        },
                        {
                            field: "LoteSAI",
                            title: window.app.idioma.t("LOTE"),
                            template: '<span class="addTooltip"> #= LoteSAI #</span>',
                            attributes: {
                                style: 'white-space: nowrap ',
                            },
                            width: 200
                        },
                        {
                            field: "UbicacionOrigen",
                            title: window.app.idioma.t("UBICACION_ORIGEN"),
                            width: 130,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=UbicacionOrigen#' style='//width: 14px;height:14px;margin-right:5px;'/>#= UbicacionOrigen #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescUbicacionOrigen",
                            template: '<span class="addTooltip"> #= DescUbicacionOrigen #</span>',
                            attributes: {
                                style: 'white-space: nowrap ',
                            },
                            title: window.app.idioma.t("DESCRIPCION_ORIGEN"),
                            width: 150
                        },
                        {
                            field: "UbicacionDestino",
                            title: window.app.idioma.t("UBICACION_DESTINO"),
                            width: 130,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=UbicacionDestino#' style='//width: 14px;height:14px;margin-right:5px;'/>#= UbicacionDestino #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescUbicacionDestino",
                            template: '<span class="addTooltip"> #= DescUbicacionDestino #</span>',
                            attributes: {
                                style: 'white-space: nowrap ',
                            },
                            title: window.app.idioma.t("DESCRIPCION_DESTINO"),
                            width: 150
                        },
                        {
                            field: "MaterialSAI",
                            template: '<span class="addTooltip"> #= MaterialSAI #</span>',
                            attributes: {
                                style: 'white-space: nowrap ',
                            },
                            title: window.app.idioma.t("MATERIAL"),
                            width: 130
                        },
                        {
                            field: "Cantidad",
                            template: '#= Cantidad !== undefined ?  $.isNumeric(Cantidad.toString().replace(",",".")) ? kendo.format("{0:n2}",parseFloat(Cantidad.toString().replace(",","."))) : Cantidad : ""  #',
                            title: window.app.idioma.t("CANTIDAD"),
                            width: 90,
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                            groupable: false,
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "Unidad",
                            template: "#=Unidad ? Unidad.toUpperCase(): ''#",
                            title: window.app.idioma.t("UNIDAD_MEDIDA"),
                            width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Unidad#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Unidad #</label></div>";
                                    }
                                }
                            }
                        }
                        ],
                        dataBound: function (e) {
                            self.events();
                            self.resizeGrid("#gridTransferencias");
                        },
                    }).data("kendoGrid");
                }



                $("#gridTransferencias").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

                self.resizeGrid("#gridTransferencias");
            },
            eliminar: function () {
                this.remove();
            },
            resizeGrid: function (id) {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var divtabla = $("#tablaOrden").innerHeight();
                var items = $(".k-tabstrip-items").innerHeight();

                var gridElement = $(id),
                    dataArea = gridElement.find(".k-grid-content"),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    groupingArea = gridElement.find(".k-grouping-header").innerHeight(),
                    otherElementsHeight = 0;

                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - cabeceraHeight - divtabla - 205);

            },
        });
        return vistaTransferenciasSAI;
    });
