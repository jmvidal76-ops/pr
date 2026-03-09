define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/StockMMPPSmile.html', 'compartido/notificaciones', 'compartido/util',
    'vistas/vDialogoConfirm', 'jszip', 'definiciones'],
    function (_, Backbone, $, plantillaStockMMPPSmile, Not, util, VistaDlgConfirm, JSZip, definiciones) {
        var gridStockMMPPSmile = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            dsStock: null,
            dsDetalle: null,
            idLinea: "",
            idProducto: "",
            cantPlanificada: 0,
            paletsPlanificados: 0,
            envasesPalet: 0,
            cajasPalet: 0,
            esInicio: true,
            template: _.template(plantillaStockMMPPSmile),

            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                kendo.culture(localStorage.getItem("idiomaSeleccionado"));

                // Usar promesas para cargar datos
                var promesas = [
                    self.render(),
                    self.inicializarGrid(),
                ];

                // Cuando ambas promesas se resuelvan, renderizamos
                Promise.all(promesas)
                    .then(function () {
                        self.cargarGrid();                        
                        self.esInicio = false;

                        self.dsStock.read();
                    })
                    .catch(function (error) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CARGAR_DATOS'), 4000);
                    });
            },
            inicializarGrid: function () {
                var self = this;

                return new Promise(function (resolve, reject) {

                    self.dsStock = new kendo.data.DataSource({
                        transport: {
                            read: function (operation) {

                                if (self.esInicio) {
                                    operation.success([]);
                                    resolve();
                                    return;
                                }

                                $.ajax({
                                    type: "GET",
                                    url: "../api/ObtenerStockMMPPSmile/",
                                    dataType: 'json',
                                    data: {
                                        IdProducto: "",
                                        IdLinea: "",
                                        IdMaterial: "",
                                        IdZona: "",
                                        AgruparMMPP: false
                                    },
                                    cache: false,
                                    contentType: "application/json; charset=utf-8",
                                    complete: function (e) {
                                        kendo.ui.progress($("#gridStockMMPPSmile"), false);
                                    },
                                    success: function (response) {
                                        if (!response || response.length === 0) {
                                            operation.success([]);
                                        }
                                        else {
                                            const enrichedData = response.map(item => {
                                                //const udPaletsStock = Math.ceil(item.UnidadesDisponibles / item.PaletsDisponibles) || 0;
                                                return {
                                                    ...item,
                                                    //UdPedidas: item.UnidadesSolicitadas * udPaletsStock,
                                                };
                                            });

                                            operation.success(enrichedData);
                                        }

                                        resolve();
                                    },
                                    error: function (e) {
                                        if (e.status === 403 && e.responseJSON === 'NotAuthorized') {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                        } else {
                                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER') + ' ' + window.app.idioma.t('STOCK_MMPP_SMILE'), 4000);
                                        }

                                        reject(e);
                                    }
                                });
                            }
                        },
                        schema: {
                            model: {
                                id: "IdMaterial",
                                fields: {
                                    'IdMaterial': { type: "string", editable: false },
                                    'DescripcionMaterial': { type: "string", editable: false },
                                    'IdClaseMaterial': { type: "string", editable: false },
                                    'IdStock': { type: "number", editable: false },
                                    'PaletsDisponibles': { type: "number", editable: false },
                                    'UnidadesDisponibles': { type: "number", editable: false },
                                    'EAN': { type: "string", editable: false },
                                    'Lote': { type: "string", editable: false },
                                    'FechaStock': { type: "date", editable: false },
                                    'FechaCreacion': { type: "date", editable: false },
                                    'UsuarioCreacion': { type: "string", editable: false },
                                    'FechaActualizacion': { type: "date", editable: false },
                                    'UsuarioActualizacion': { type: "string", editable: false },
                                    'IdProveedor': { type: "number", editable: false },
                                    'DescripcionProveedor': { type: "string", editable: false },
                                    'UnidadesPalets': { type: "number", editable: false },
                                }
                            }
                        },
                        aggregate: [
                            { field: "PaletsDisponibles", aggregate: "sum" },
                            { field: "UnidadesDisponibles", aggregate: "sum" }
                        ],
                        pageSize: 200,
                    });

                    resolve();
                });
            },
            cargarGrid: function () {
                var self = this;

                this.$("#gridStockMMPPSmile").kendoGrid({
                    dataSource: self.dsStock,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    sortable: true,
                    toolbarColumnMenu: true,
                    scrollable: true,
                    autoWidth: true,
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
                    dataBound: function () {
                        self.resizeGrid();
                    },
                    editable: true,
                    columns: [
                        {
                            template: function (e) {
                                let color = "";
                                let title = "";
                                if (e.PaletsDisponibles <= 0 || e.PaletsDisponibles == null) {
                                    color = "#fb0101";
                                    title = "No hay Stock";
                                }
                                else if (e.PaletsDisponibles > 0) {
                                    color = "#90EE90";
                                    title = "Hay Stock";
                                } else {
                                    color = "transparent";
                                }

                                return "<div class='circle_cells' title='" + title + "' style='background-color:" + color + ";'></div>";
                            },
                            width: 50,
                            attributes: { style: "text-align:center;" },
                            filterable: false,
                            groupable: true,
                            title: window.app.idioma.t("ESTADO_COLORES"),
                        },
                        {
                            field: 'IdMaterial',
                            title: 'IdMaterial',
                            width: 100,
                            filterable: true,
                            groupable: true,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                        },
                        {
                            field: 'DescripcionMaterial',
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                            width: 340,
                            filterable: true,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' }
                        },
                        {
                            field: 'IdClaseMaterial',
                            title: window.app.idioma.t("CLASE_MATERIAL"),
                            width: 80,
                            filterable: true,
                            groupable: true,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field == "all" ?
                                        "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                        "<div><label><input type='checkbox' value='#=IdClaseMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#= IdClaseMaterial#</label></div>";
                                }
                            }
                        },
                        {
                            hidden: true,
                            field: 'IdStock',
                            title: 'IdStock',
                            width: 50,
                            filterable: true,
                            groupable: false,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' }
                        },
                        {
                            field: 'EAN',
                            title: 'EAN',
                            width: 150,
                            filterable: true,
                            groupable: true,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' }
                        },
                        {
                            field: 'Lote',
                            title: 'Lote',
                            width: 150,
                            filterable: true,
                            groupable: false,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' }
                        },
                        {
                            field: 'DescripcionProveedor',
                            title: window.app.idioma.t("PROVEEDOR"),
                            width: 200,
                            filterable: true,
                            groupable: true,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field == "all" ?
                                        "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                        "<div><label><input type='checkbox' value='#=DescripcionProveedor#' style='width: 14px;height:14px;margin-right:5px;'/>#= DescripcionProveedor#</label></div>";
                                }
                            }
                        },
                        {
                            field: 'UnidadesDisponibles',
                            title: window.app.idioma.t("UNIDADES_DISPONIBLES"),
                            width: 150,
                            filterable: true,
                            groupable: true,
                            attributes: { style: 'white-space: nowrap;text-align: center;', class: 'addTooltip' },
                            template: '#=typeof UnidadesDisponibles !== "undefined" && UnidadesDisponibles !== null ? kendo.format("{0:n0}", UnidadesDisponibles) : ""#',
                            aggregates: ["sum"],
                            groupFooterTemplate: "Total: #: kendo.toString(sum, 'n0') #"
                        },
                        {
                            field: 'PaletsDisponibles',
                            title: window.app.idioma.t("PALETS_DISPONIBLES"),
                            width: 150,
                            filterable: true,
                            groupable: true,
                            attributes: { style: 'white-space: nowrap;text-align: center;', class: 'addTooltip' },
                            template: '#=typeof PaletsDisponibles !== "undefined" && PaletsDisponibles !== null ? kendo.format("{0:n0}", PaletsDisponibles) : ""#',
                            aggregates: ["sum"],
                            groupFooterTemplate: "Total: #: kendo.toString(sum, 'n0') #"
                        }
                    ],

                });

                // Llamada inicial a resizeGrid después de que la cuadrícula se crea
                self.resizeGrid();
            },
            render: function () {
                var self = this;

                $(self.el).html(self.template());
                $("#center-pane").append($(self.el));
            },

            events: {
                'click #btnFiltrar': 'consulta',
            },
            consulta: function () {
                var self = this;

                if (self.dsStock.page() != 1) {
                    self.dsStock.page(1);
                }

                self.actualizarGrid();
            },
            actualizarGrid: function () {
                let self = this;
                self.dsStock.data([]);

                kendo.ui.progress($("#gridStockMMPPSmile"), true);
                self.dsStock.read();
            },
            resizeGrid: function () {
                var self = this;

                var centerPaneHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").outerHeight(true);

                var contenidoVistaHeight = centerPaneHeight - cabeceraHeight;
                if (contenidoVistaHeight < 100) {
                    contenidoVistaHeight = 100;
                }
                $("#divContenidoVista").height(contenidoVistaHeight);

                var divContenidoVistaElement = self.$("#divContenidoVista");
                var filtrosHeaderHeight = self.$("#divFiltrosHeader").outerHeight(true);

                var gridHeight = divContenidoVistaElement.innerHeight() - filtrosHeaderHeight - 0;

                if (gridHeight < 150) {
                    gridHeight = 150;
                }

                self.$("#gridStockMMPPSmile").height(gridHeight);

                var grid = self.$("#gridStockMMPPSmile").data("kendoGrid");
                if (grid) {
                    grid.resize();
                }
            },
            eliminar: function () {
                this.remove();
            },
        });

        return gridStockMMPPSmile;
    });