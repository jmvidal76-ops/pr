define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/CreacionPeticionesMMPPEnvasado.html', 'compartido/notificaciones', 'compartido/util',
    'vistas/vDialogoConfirm','jszip', 'definiciones'],
    function (_, Backbone, $, plantillaCreacionPeticionesMMPPEnvasado, Not, util, VistaDlgConfirm, JSZip, definiciones) {
        var gridCreacionPeticionesMMPPEnvasado = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            dsStock: null,
            dsDetalle: null,
            idLinea: "",
            idProducto: "",
            prioridad: "",
            cantPlanificada: 0,
            paletsPlanificados: 0,
            envasesPalet: 0,
            cajasPalet: 0,
            esInicio: true,
            dsWO: null,
            dsWOAct: null,
            dsWOPlan: null,
            template: _.template(plantillaCreacionPeticionesMMPPEnvasado),

            initialize: function () { 
                var self = this;
                window.JSZip = JSZip;

                kendo.culture(localStorage.getItem("idiomaSeleccionado"));

                self.render();

                self.inicializarGrid();                

                self.cargarCabecera();

                // Inicia la carga de las WOs en segundo plano (sin bloquear la UI).
                self.woDataPromise = Promise.all([
                    self.obtenerWOActivas(self),
                    self.obtenerWOPlanificadas(self),
                    self.obtenerPrioridad('MES_MSM', 'PRIO_SMILE_CREA_PORTAL')
                ]).then(function () {
                    self.dsWOAct = self.dsWOAct || [];
                    self.dsWOPlan = self.dsWOPlan || [];
                    self.dsWO = self.dsWOAct.concat(self.dsWOPlan);
                }).catch(function (error) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CARGAR_WO_BACKGROUND'), 4000);
                    self.dsWO = []; // Asegurarse de que dsWO sea un array vacío en caso de error
                });                

                //CArgamos grids al iniciar
                self.cargarGrid();
                self.inicializarGridDetalle();
                self.cargarGridDetalle();
                self.esInicio = false;
            },
            obtenerPrioridad: function (bbdd, clave) {
                var self = this;

                return new Promise(function (resolve, reject) {
                    $.ajax({
                        type: "GET",
                        url: "../api/general/ObtenerValorParametroGeneral?bbdd=" + bbdd + "&clave=" + clave,
                        dataType: 'json'                        
                    }).done(function (data) {
                        self.prioridad = data;
                        resolve();
                    }).fail(function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'api/general/ObtenerValorParametroGeneral', 4000);
                        reject();
                    });
                });
            },
            obtenerWOActivas: function (self) {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        type: "GET",
                        url: "../api/obtenerWOActivas/",
                        dataType: 'json',
                    }).done(function (data) {
                        self.dsWOAct = data.filter(function (item) {
                            return item.estadoActual && (item.estadoActual.nombre != 'Finalizada');
                        });
                        resolve();
                    }).fail(function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'api/obtenerWOActivas', 4000);
                        reject();
                    });                  
                });
            },
            obtenerWOPlanificadas: function (self) {
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        type: "GET",
                        url: "../api/ordenesPendientes/",
                        dataType: 'json',
                    }).done(function (data) {
                        self.dsWOPlan = data;
                        resolve();
                    }).fail(function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'api/ordenesPendientes', 4000);
                        reject();
                    });
                });
            },
            enriquecerStock: function (item) {

                const udPaletsStock =
                    Math.ceil(item.UnidadesDisponibles / item.PaletsDisponibles) || 0;

                let unidades = 0;
                if (item.CalculoPalets === "Envases") {
                    unidades = this.envasesPalet;
                } else if (item.CalculoPalets === "Palet") {
                    unidades = 1;
                } else if (item.CalculoPalets === "CPBs") {
                    unidades = this.cajasPalet;
                }

                const udProducir = this.cantPlanificada * unidades;

                let paletsNecesarios = 0;
                if (udProducir > 0 && udPaletsStock > 0) {
                    paletsNecesarios = Math.ceil(udProducir / udPaletsStock);
                }

                return {
                    ...item,

                    // base
                    UnidadesPalets: udPaletsStock,
                    UdProducir: udProducir,

                    // histórico
                    PaletsPedidos: item.UnidadesSolicitadas || 0,

                    // entrada usuario
                    CantidadPedir: 0,

                    // solo informativo
                    PaletsNecesarios: paletsNecesarios,

                    // se recalcula luego
                    Faltan: 0
                };
            },
            calcularFaltan: function (item) {

                const udPalet = Number(item.UnidadesPalets) || 0;
                if (udPalet === 0) return 0;

                const produccion = Number(item.UdProducir) || 0;

                const pedidosAnteriores = Number(item.PaletsPedidos) || 0;
                const pedidosActuales = Number(item.CantidadPedir) || 0;

                const totalPaletsPedidos = pedidosAnteriores + pedidosActuales;

                const faltan = Math.max(
                    0,
                    Math.ceil(
                        (produccion - totalPaletsPedidos * udPalet) / udPalet
                    )
                );

                return faltan;
            },
            recalcularFila: function (item) {
                if (!item) return;

                item.set(
                    "Faltan",
                    this.calcularFaltan(item)
                );
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
                                    url: "../api/solicitudes-mmpp/stock",
                                    dataType: 'json',
                                    data: {
                                        IdProducto: self.idProducto || "",
                                        IdLinea: self.idLinea || "",
                                        IdMaterial: "",
                                        IdZona: "",
                                        AgruparMMPP: true
                                    },
                                    cache: false,
                                    contentType: "application/json; charset=utf-8",
                                    success: function (response) {
                                        if (!response || response.length === 0) {
                                            operation.success([]);
                                        }
                                        else {
                                            //Quitamos del stock las que la clase de material sea CZA
                                            const filteredResponse = response.filter(item => item.IdClaseMaterial !== "CZA");

                                            const enrichedData = filteredResponse.map(item =>
                                                self.enriquecerStock(item)
                                            );                                           

                                            operation.success(enrichedData);
                                        }
                                        //kendo.ui.progress($("#divHTMLContenido"), false);
                                        resolve();
                                    },                                    
                                    error: function (e) {
                                        if (e.status === 403 && e.responseJSON === 'NotAuthorized') {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                        } else {
                                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER') + ' ' + window.app.idioma.t('CREACION_PETICIONES_MMPP_SMILE'), 4000);
                                        }
                                        
                                        reject(e);
                                    }
                                });
                            }
                        },
                        change: function (e) {
                            if (e.action !== "read") return;

                            this.view().forEach(item => {
                                self.recalcularFila(item);
                            });
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
                                    'LoteProveedor': { type: "string", editable: false },
                                    'FechaStock': { type: "date", editable: false },
                                    'FechaCreacion': { type: "date", editable: false },
                                    'UsuarioCreacion': { type: "string", editable: false },
                                    'FechaActualizacion': { type: "date", editable: false },
                                    'UsuarioActualizacion': { type: "string", editable: false },
                                    'IdProveedor': { type: "number", editable: false },
                                    'DescripcionProveedor': { type: "string", editable: false },
                                    'UnidadesPalets': { type: "number", editable: false },
                                    'UdProducir': { type: "number", editable: false },
                                    'CantidadPedir': { type: "number", editable: true },
                                    'Prioridad': { type: "number", editable: true },
                                    'PaletsNecesarios': { type: "number", editable: false },
                                    'PaletsPedidos': { type: "number", editable: false },
                                    'Faltan': { type: "number", editable: false },
                                    'CalculoPalets': { type: "string", editable: false },

                                }
                            }
                        },
                        pageSize: 200,
                    });

                    // Si estamos iniciando la pantalla no buscamos nada
                    if (self.esInicio) {
                        resolve();
                    }
                });
            },
            inicializarGridDetalle: function () {
                var self = this;

                self.dsDetalle = new kendo.data.DataSource({
                    transport: {
                        read: function (operation) {

                            // Si no hay fila seleccionada, devolvemos vacío y salimos.
                            if (!self.dataItemSel || !self.dataItemSel.IdMaterial) {
                                operation.success([]);
                                return;
                            }

                            $.ajax({
                                type: "GET",
                                url: "../api/solicitudes-mmpp/stock",
                                dataType: 'json',
                                cache: false,
                                contentType: "application/json; charset=utf-8",
                                data: {                                    
                                    IdProducto: self.idProducto || "",
                                    IdLinea: self.idLinea || "",
                                    IdMaterial: self.dataItemSel.IdMaterial,
                                    IdZona: "",
                                    AgruparMMPP: false
                                }
                            })
                                .done(function (response) {
                                    const enrichedData = (response || []).map(item => {

                                        const base = {
                                            ...item,
                                            
                                            UdProducir: self.dataItemSel.UdProducir,
                                            PaletsPedidos: self.dataItemSel.PaletsPedidos,
                                            PaletsNecesarios: self.dataItemSel.PaletsNecesarios,
                                            
                                            UnidadesPalets:
                                                Math.ceil(item.UnidadesDisponibles / item.PaletsDisponibles) || 0,

                                            CantidadPedir: 0
                                        };

                                        base.Faltan = self.calcularFaltan(base);

                                        return base;
                                    });

                                    operation.success(enrichedData);

                                    setTimeout(() => {
                                        const gridDet = $("#gridCreacionPeticionesMMPPEnvasadoDetalle").data("kendoGrid");
                                        if (!gridDet) return;

                                        gridDet.dataSource.view().forEach(fila => {
                                            fila.Faltan = self.calcularFaltan(fila);
                                        });

                                        gridDet.refresh();
                                    }, 0);
                                })
                                .fail(function (e) {
                                    if (e.status === 403 && e.responseJSON === 'NotAuthorized') {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                    } else {
                                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER') + ' ObtenerStockMMPPEnvasado', 4000);
                                    }
                                    operation.error(e);
                                })
                                .always(function () {
                                    //kendo.ui.progress($("#gridCreacionPeticionesMMPPEnvasadoDetalle"), false);
                                });
                        }
                    },
                    schema: {
                        model: {
                            id: "IdStock",
                            fields: {
                                'IdMaterial': { type: "string", editable: false },
                                'DescripcionMaterial': { type: "string", editable: false },
                                'IdClaseMaterial': { type: "string", editable: false },
                                'IdStock': { type: "number", editable: false },
                                'PaletsDisponibles': { type: "number", editable: false },
                                'UnidadesDisponibles': { type: "number", editable: false },
                                'LoteProveedor': { type: "string", editable: false },                                
                                'FechaStock': { type: "date", editable: false },
                                'FechaCreacion': { type: "date", editable: false },
                                'UsuarioCreacion': { type: "string", editable: false },
                                'FechaActualizacion': { type: "date", editable: false },
                                'UsuarioActualizacion': { type: "string", editable: false },
                                'IdProveedor': { type: "number", editable: false },
                                'DescripcionProveedor': { type: "string", editable: false },
                                'UnidadesPalets': { type: "number", editable: false },
                                'UdProducir': { type: "number", editable: false },
                                'CantidadPedir': { type: "number", editable: true },
                                'Prioridad': { type: "number", editable: true },
                                'PaletsNecesarios': { type: "number", editable: false },
                                'PaletsPedidos': { type: "number", editable: false },
                                'Faltan': { type: "number", editable: false }
                            }
                        }
                    },
                    pageSize: 100
                });
            },
            cargarGrid: function () {
                var self = this;

                const $grid = this.$("#gridCreacionPeticionesMMPPEnvasado");

                $grid.kendoGrid({
                    dataSource: self.dsStock,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    sortable: true,
                    toolbarColumnMenu: true,
                    scrollable: true,
                    //selectable: true,
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
                    //selectable: {
                    //    mode: "single", 
                    //    style: "row"
                    //},

                    //change: function () {                        
                    //    const grid = this;
                    //    const item = grid.dataItem(grid.select());
                    //    if (!item) return;

                    //    self.dataItemSel = item;
                        
                    //    if (!self.dsDetalle) {
                    //        console.warn("dsDetalle aún no inicializado, se ignora change");
                    //        return;
                    //    }                        

                    //    self.dsDetalle.read();
                    //},
                    dataBound: self.resizeGrid,
                    editable: true,
                    columns: [
                        {
                            template: function (e) {
                                let color = "";
                                if (e.PaletsDisponibles == 0 || e.PaletsDisponibles == null) {
                                    color = "#fb0101"; // Rojo
                                }
                                else if (e.PaletsDisponibles >= e.PaletsNecesarios && e.PaletsDisponibles > 0) {
                                    color = "#90EE90"; // Verde Claro
                                } else if (e.PaletsDisponibles < e.PaletsNecesarios) {
                                    color = "#f9f382"; // Amarillo
                                } else {
                                    color = "transparent";
                                }
                                
                                return "<div class='circle_cells' title='' style='background-color:" + color + ";'></div>";
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
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field == "all" ?
                                        "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                        "<div><label><input type='checkbox' value='#=IdMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#= IdMaterial# - #= DescripcionMaterial#</label></div>";
                                }
                            }
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
                            hidden: true,
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
                            hidden: true,
                            field: 'LoteProveedor',
                            title: 'Lote Proveedor',
                            width: 150,
                            filterable: true,
                            groupable: false,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' }
                        },
                        {
                            field: 'UnidadesDisponibles',
                            title: window.app.idioma.t("UNIDADES_DISPONIBLES"),
                            width: 150,
                            filterable: false,
                            groupable: false,
                            attributes: { style: 'white-space: nowrap;text-align: center;', class: 'addTooltip' },
                            template: '#=typeof UnidadesDisponibles !== "undefined" && UnidadesDisponibles !== null ?   kendo.format("{0:n0}", UnidadesDisponibles) : ""#',
                        },
                        {
                            field: 'PaletsDisponibles',
                            title: window.app.idioma.t("PALETS_DISPONIBLES"),
                            width: 150,
                            filterable: false,
                            groupable: false,
                            attributes: { style: 'white-space: nowrap;text-align: center;', class: 'addTooltip' },
                            template: '#=typeof PaletsDisponibles !== "undefined" && PaletsDisponibles !== null ?   kendo.format("{0:n0}", PaletsDisponibles) : ""#',
                        },
                        {
                            field: 'UnidadesPalets',
                            title: window.app.idioma.t("UNIDADES_PALETS"),
                            width: 150,
                            filterable: false,
                            groupable: false,
                            attributes: { style: 'white-space: nowrap;text-align: center;', class: 'addTooltip' },
                            template: '#=typeof UnidadesPalets !== "undefined" && UnidadesPalets !== null ?   kendo.format("{0:n0}", UnidadesPalets) : ""#',
                        },
                        {
                            field: 'CalculoPalets',
                            title: window.app.idioma.t("TIPO"),
                            width: 130,
                            filterable: true,
                            groupable: false,
                            attributes: { style: 'white-space: nowrap;text-align: center;', class: 'addTooltip' },
                            template: function (dataItem) {
                                return dataItem.CalculoPalets && dataItem.CalculoPalets.trim() !== ''
                                    ? dataItem.CalculoPalets
                                    : window.app.idioma.t("FALTA_CALCULOPALETS");
                            }
                        },
                        {
                            field: 'CantidadPedir',
                            title: window.app.idioma.t("CANTIDAD_PEDIR"),
                            width: 150,
                            filterable: false,
                            groupable: false,
                            editable: function (dataItem) {
                                return dataItem.PaletsDisponibles > 0;
                            },
                            attributes: { style: "white-space: nowrap; text-align: center;" },
                            editor: function (container, options) {
                                $('<input required name="' + options.field + '"/>')
                                    .appendTo(container)
                                    .kendoNumericTextBox({
                                        min: 0,
                                        change: function () {

                                            options.model.set(
                                                "Faltan",
                                                self.calcularFaltan(options.model)
                                            );

                                        }
                                    });
                            }
                        },
                        {
                            field: 'Prioridad',
                            title: window.app.idioma.t("PRIORIDAD"),
                            width: 110,
                            filterable: false,
                            groupable: false,
                            editable: true,
                            attributes: { style: "white-space: nowrap; text-align: center;" },
                            editor: function (container, options) {
                                $('<input required name="' + options.field + '"/>')
                                    .appendTo(container)
                                    .kendoNumericTextBox({ min: 0, max: 10 });
                            }
                        },
                        {
                            field: 'PaletsNecesarios',
                            title: window.app.idioma.t("PALETS_NECESARIOS"),
                            width: 150,
                            filterable: false,
                            groupable: false,
                            attributes: { style: 'white-space: nowrap;text-align: center;', class: 'addTooltip' },
                            template: '#=typeof PaletsNecesarios !== "undefined" && PaletsNecesarios !== null ?   kendo.format("{0:n0}", PaletsNecesarios) : ""#',
                        },
                        {
                            field: 'PaletsPedidos',
                            title: window.app.idioma.t("PALETS_PEDIDOS"),
                            width: 150,
                            filterable: false,
                            groupable: false,
                            attributes: { style: 'white-space: nowrap;text-align: center;', class: 'addTooltip' },
                            template: '#=typeof PaletsPedidos !== "undefined" && PaletsPedidos !== null ?   kendo.format("{0:n0}", PaletsPedidos) : ""#',
                        },
                        {
                            field: 'Faltan',
                            title: window.app.idioma.t("FALTAN"),
                            width: 100,
                            filterable: false,
                            groupable: false,
                            template: function (dataItem) {
                                let color = dataItem.Faltan < 0 ? "background-color: #ffcccc;" : "";
                                let faltanValue = (dataItem.Faltan === Infinity || dataItem.Faltan === -Infinity) ? 0 : dataItem.Faltan;
                                return `<span style="display: block; text-align: center; ${color}">${faltanValue}</span>`;
                            },                            
                            attributes: { style: 'white-space: nowrap;text-align: center;', class: 'addTooltip' }
                        }
                    ],

                });
                const grid = $grid.data("kendoGrid");
                grid.bind("dataBound", function () {
                    grid.tbody
                        .off("mousedown._rowSelect")
                        .on("mousedown._rowSelect", "tr", function (e) {

                            // No ejecutar selección si clicas en el numeric textbox o su spinner
                            if ($(e.target).closest(".k-numerictextbox").length > 0) return;
                            if ($(e.target).closest(".k-icon").length > 0) return;

                            const item = grid.dataItem(this);
                            if (!item) return;

                            grid.tbody.find("tr").removeClass("k-state-selected");
                            $(this).addClass("k-state-selected");

                            self.dataItemSel = item;

                            if (!self.dsDetalle) return;

                            self.dsDetalle.read();
                        });
                });
            },
            cargarGridDetalle: function () {
                var self = this;

                $("#gridCreacionPeticionesMMPPEnvasadoDetalle").kendoGrid({
                    dataSource: self.dsDetalle,
                    autoBind: false,
                    height: 200,
                    sortable: true,
                    pageable: true,
                    selectable: {
                        mode: "single",
                        style: "row"
                    },
                    editable: { mode: "incell" },
                    columns: [
                        {
                            template: function (e) {
                                const paletsNecesarios =
                                    self.dataItemSel && self.dataItemSel.PaletsNecesarios
                                        ? self.dataItemSel.PaletsNecesarios
                                        : 0;   // valor seguro por defecto

                                let color = "";

                                if (e.PaletsDisponibles == 0 || e.PaletsDisponibles == null) {
                                    color = "#fb0101";
                                }
                                else if (e.PaletsDisponibles >= paletsNecesarios && e.PaletsDisponibles > 0) {
                                    color = "#90EE90";
                                } else if (e.PaletsDisponibles < paletsNecesarios) {
                                    color = "#f9f382";
                                }

                                return "<div class='circle_cells' style='background-color:" + color + ";'></div>";
                            },
                            width: 50,
                            attributes: { style: "text-align:center;" },
                            filterable: false,
                            groupable: true,
                            editable: false,
                            editor: function () { },
                            title: window.app.idioma.t("ESTADO_COLORES"),
                        },
                        {
                            field: 'IdMaterial',
                            title: 'IdMaterial',
                            width: 100,
                            filterable: true,
                            groupable: true,
                            editable: false,
                            editor: function () { },
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field == "all" ?
                                        "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                        "<div><label><input type='checkbox' value='#=IdMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#= IdMaterial# - #= DescripcionMaterial#</label></div>";
                                }
                            }
                        },
                        {
                            field: 'DescripcionMaterial',
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                            width: 340,
                            filterable: true,
                            editable: false,
                            editor: function () { },
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' }
                        },
                        {
                            field: 'IdClaseMaterial',
                            title: window.app.idioma.t("CLASE_MATERIAL"),
                            width: 80,
                            filterable: true,
                            groupable: true,
                            editable: false,
                            editor: function () { },
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
                            editable: false,
                            editor: function () { },
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' }
                        },
                        {
                            field: 'DescripcionProveedor',
                            title: window.app.idioma.t("PROVEEDOR"),
                            width: 200,
                            filterable: true,
                            groupable: true,
                            editable: false,
                            editor: function () { },
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
                            field: 'LoteProveedor',
                            title: 'Lote Proveedor',
                            width: 150,
                            filterable: true,
                            groupable: false,
                            editable: false,
                            editor: function () { },
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' }
                        },
                        {
                            groupable: true,
                            editable: false,
                            editor: function () { },
                            //title: window.app.idioma.t("FECHA_CREACION"),
                            field: 'FechaCaducidad',
                            width: 140,
                            template: '#= FechaCaducidad ? kendo.toString(new Date(FechaCaducidad), "dd/MM/yyyy HH:mm:ss") : "" #',
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({ format: "dd/MM/yyyy", culture: localStorage.getItem("idiomaSeleccionado") });
                                }
                            }
                        },
                        {
                            groupable: true,
                            editable: false,
                            editor: function () { },
                            //title: window.app.idioma.t("FECHA_CREACION"),
                            field: 'FechaEntradaPlanta',
                            width: 140,
                            template: '#= FechaEntradaPlanta ? kendo.toString(new Date(FechaEntradaPlanta), "dd/MM/yyyy HH:mm:ss") : "" #',
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({ format: "dd/MM/yyyy", culture: localStorage.getItem("idiomaSeleccionado") });
                                }
                            }
                        },
                        {
                            field: 'UnidadesDisponibles',
                            title: window.app.idioma.t("UNIDADES_DISPONIBLES"),
                            width: 150,
                            filterable: false,
                            groupable: false,
                            editable: false,
                            editor: function () { },
                            attributes: { style: 'white-space: nowrap;text-align: center;', class: 'addTooltip' },
                            template: '#=typeof UnidadesDisponibles !== "undefined" && UnidadesDisponibles !== null ?   kendo.format("{0:n0}", UnidadesDisponibles) : ""#',
                        },
                        {
                            field: 'PaletsDisponibles',
                            title: window.app.idioma.t("PALETS_DISPONIBLES"),
                            width: 150,
                            filterable: false,
                            groupable: false,
                            editable: false,
                            editor: function () { },
                            attributes: { style: 'white-space: nowrap;text-align: center;', class: 'addTooltip' },
                            template: '#=typeof PaletsDisponibles !== "undefined" && PaletsDisponibles !== null ?   kendo.format("{0:n0}", PaletsDisponibles) : ""#',
                        },
                        {
                            field: 'UnidadesPalets',
                            title: window.app.idioma.t("UNIDADES_PALETS"),
                            width: 150,
                            filterable: false,
                            groupable: false,
                            editable: false,
                            editor: function () { },
                            attributes: { style: 'white-space: nowrap;text-align: center;', class: 'addTooltip' },
                            template: '#=typeof UnidadesPalets !== "undefined" && UnidadesPalets !== null ?   kendo.format("{0:n0}", UnidadesPalets) : ""#',
                        },
                        {
                            field: 'CantidadPedir',
                            title: window.app.idioma.t("CANTIDAD_PEDIR"),
                            width: 150,
                            filterable: false,
                            groupable: false,
                            editable: function (dataItem) {
                                return self.dataItemSel.PaletsNecesarios > 0 && dataItem.PaletsDisponibles > 0;
                            },
                            attributes: { style: "white-space: nowrap; text-align: center;" },
                            editor: function (container, options) {
                                var dataItem = options.model;

                                if (self.dataItemSel.PaletsNecesarios > 0 && dataItem.PaletsDisponibles > 0) {

                                    $('<input required name="' + options.field + '"/>')
                                        .appendTo(container)
                                        .kendoNumericTextBox({
                                            min: 0,
                                            change: function () {

                                                const grid = $("#gridCreacionPeticionesMMPPEnvasadoDetalle")
                                                    .data("kendoGrid");

                                                const filas = grid.dataSource.view();

                                                let totalPaletsPedir = 0;

                                                filas.forEach(fila => {
                                                    totalPaletsPedir += Number(fila.CantidadPedir) || 0;

                                                    fila.set(
                                                        "Faltan",
                                                        self.calcularFaltan(fila)
                                                    );
                                                });

                                                if (totalPaletsPedir > self.dataItemSel.PaletsNecesarios) {
                                                    Not.crearNotificacion(
                                                        'warning',
                                                        window.app.idioma.t('AVISO'),
                                                        window.app.idioma.t('SOLICITUD_SMILE_SUPERA_NECESARIOS'),
                                                        10000
                                                    );
                                                }
                                                
                                            }
                                        });
                                }
                            }
                        },
                        {
                            field: 'Prioridad',
                            title: window.app.idioma.t("PRIORIDAD"),
                            width: 110,
                            filterable: false,
                            groupable: false,                            
                            editable: function (dataItem) {
                                return self.dataItemSel.PaletsNecesarios > 0 && dataItem.PaletsDisponibles > 0;
                            },
                            attributes: { style: "white-space: nowrap; text-align: center;" },
                            editor: function (container, options) {
                                var dataItem = options.model;
                                if (self.dataItemSel.PaletsNecesarios > 0 && dataItem.PaletsDisponibles > 0) {
                                    $('<input required name="' + options.field + '"/>')
                                        .appendTo(container)
                                        .kendoNumericTextBox({ min: 0, max: 10 });
                                }
                            }
                        },
                        {
                            hidden: true,
                            field: 'PaletsNecesarios',
                            title: window.app.idioma.t("PALETS_NECESARIOS"),
                            width: 150,
                            filterable: false,
                            groupable: false,
                            editable: false,
                            editor: function () { },
                            attributes: { style: 'white-space: nowrap;text-align: center;', class: 'addTooltip' },
                            template: '#=typeof PaletsNecesarios !== "undefined" && PaletsNecesarios !== null ?   kendo.format("{0:n0}", PaletsNecesarios) : ""#',
                        },
                        {
                            hidden: true,
                            field: 'PaletsPedidos',
                            title: window.app.idioma.t("PALETS_PEDIDOS"),
                            width: 150,
                            filterable: false,
                            groupable: false,
                            editable: false,
                            editor: function () { },
                            attributes: { style: 'white-space: nowrap;text-align: center;', class: 'addTooltip' },
                            template: '#=typeof PaletsPedidos !== "undefined" && PaletsPedidos !== null ?   kendo.format("{0:n0}", PaletsPedidos) : ""#',
                        },
                        {
                            hidden: true,
                            field: 'Faltan',
                            title: window.app.idioma.t("FALTAN"),
                            width: 100,
                            filterable: false,
                            groupable: false,
                            editable: false,
                            editor: function () { },
                            template: function (dataItem) {
                                let color = dataItem.Faltan < 0 ? "background-color: #ffcccc;" : "";
                                return `<span style="display: block; text-align: center; ${color}">${dataItem.Faltan}</span>`;
                            },                            
                            attributes: { style: 'white-space: nowrap;text-align: center;', class: 'addTooltip' }
                        }
                    ]
                });
            },
            cargarCabecera: function () {
                var self = this;

                self.$("#selectLinea").kendoDropDownList({
                    dataTextField: "id",
                    dataValueField: "numLinea",
                    valueTemplate: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    template: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "numLinea", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    change: async function (e) {

                        const ddl = this;
                        const idx = ddl.select();
                        
                        if (idx < 0) return;

                        const selectedLinea = ddl.dataItem(idx);
                        if (!selectedLinea) return;

                        self.idLinea = "";
                        if (selectedLinea.id != window.app.idioma.t('SELECCIONE')) {
                            self.idLinea = selectedLinea.id;
                        }

                        self.idProducto = "";
                        self.cajasPalet = 0;
                        self.envasesPalet = 0;
                        self.cantPlanificada = 0;

                        $("#txtProducto").val("");
                        $("#txtProduccion").val("");
                        $("#txtCPBSEnv").val("");
                        $("#selectWO").val("");

                        if (selectedLinea) {
                            //kendo.ui.progress($("#divHTMLContenido"), true);
                            try {
                                await self.woDataPromise;
                                self.cargarWO(selectedLinea);
                            } catch (error) {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'),
                                    window.app.idioma.t('ERROR_CARGAR_WO_AL_SELECCIONAR_LINEA'), 4000);
                                self.cargarWO(null);
                            } finally {
                                //kendo.ui.progress($("#divHTMLContenido"), false);
                            }
                        }
                    }
                });
            },
            cargarWO: function (Linea) {
                var self = this;

                // Por si dsWO aún no llegó
                var base = Array.isArray(self.dsWO) ? self.dsWO : [];

                // Filtra por línea y normaliza un campo plano de fecha para ordenar/mostrar
                var ListaWO = base
                    .filter(function (e) { return e && e.numLinea == Linea.numLinea; })
                    .map(function (e) {
                        var fecRaw = e && e.producto ? e.producto.fecInicioEstimado : null;
                        var fecPlano = fecRaw ? kendo.parseDate(fecRaw, "dd/MM/yyyy") || new Date(fecRaw) : null;
                        return {
                            // Clona el objeto original para no mutar referencias
                            ...e,
                            fecInicioEstimadoPlano: fecPlano
                        };
                    });

                self.$("#selectWO").kendoDropDownList({
                    dataTextField: "estadoActual.nombre",
                    dataValueField: "id",
                    valueTemplate: "#: id # "
                        + "Prod: #= producto && producto.codigo ? producto.codigo : '' # - "
                        + "#= estadoActual && estadoActual.nombre ? estadoActual.nombre : '' #",
                    template:
                        "#: id # "
                        + "(Prod: #= producto && producto.codigo ? producto.codigo : '' #) - "
                        + "#= estadoActual && estadoActual.nombre ? estadoActual.nombre : '' # "
                        + "#= fecInicioEstimadoPlano ? kendo.toString(fecInicioEstimadoPlano, 'dd/MM/yyyy') : '' #",
                    dataSource: new kendo.data.DataSource({
                        data: ListaWO,
                        sort: { field: "fecInicioEstimadoPlano", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    change: function (e) {

                        const ddl = this;
                        const idx = ddl.select();

                        // Si no hay selección válida, no hacer nada
                        if (idx === undefined || idx === null || idx < 0) return;

                        let selectedWO = null;

                        try {
                            selectedWO = ddl.dataItem(idx);
                        } catch (err) {
                            return; 
                        }
                        
                        if (!selectedWO || typeof selectedWO !== "object") return;
                        
                        if (!selectedWO.producto) return;
                        if (!selectedWO.estadoActual) return;

                        const prod = selectedWO.producto;

                        self.idProducto = prod.codigo || "";
                        self.cajasPalet = selectedWO.CajasPorPalet || 0;
                        self.envasesPalet = selectedWO.EnvasesPorPalet || 0;
                        self.cantPlanificada = selectedWO.cantPlanificada || 0;

                        $("#txtProducto").val(prod.nombre || "");
                        $("#txtProduccion").val(self.cantPlanificada);
                        $("#txtCPBSEnv").val(self.cajasPalet + " / " + self.envasesPalet);

                        self.consulta();
                    }
                });
            },
            render: function () {
                var self = this;

                $(self.el).html(self.template());
                $("#center-pane").append($(self.el));

                //util.ui.createVSplitter('#vsplitPanelSecuenciacion', ['65%', '35%']);                
            },

            events: {
                'click #btnLeyenda': 'mostrarLeyenda',
                'click #btnFiltrar': 'consulta',
                'click #btnPedirMMPP': 'confirmarPeticiones',
                'click #btnPedirMMPP2': 'confirmarPeticiones2',
            },
            mostrarLeyenda: function () {
                var self = this;

                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='windowLeyenda'></div>"));

                var ventanaLeyenda = $("#windowLeyenda").kendoWindow(
                    {
                        title: window.app.idioma.t('DESCRIPCION_COLORES'),
                        width: "1135px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        close: function () {
                            ventanaLeyenda.getKendoWindow().destroy();
                        },
                        refresh: function () {
                        }
                    });

                var template = kendo.template($("#templateLeyenda").html());
                ventanaLeyenda.getKendoWindow()
                    .content(template({}))
                    .center().open();
            },
            consulta: function () {
                var self = this;

                var ddlWO = $("#selectWO").data("kendoDropDownList");
                if (!ddlWO) return;

                const idx = ddlWO.select();
                if (idx < 0) return;

                const selectedWO = ddlWO.dataItem(idx);
                if (!selectedWO) return;

                if (self.idLinea == "") {
                    Not.crearNotificacion(
                        'warning',
                        window.app.idioma.t('AVISO'),
                        window.app.idioma.t('SELECCIONAR') + ' ' + window.app.idioma.t('LINEA'),
                        3000
                    );
                    return;
                }
                
                if (self.dsDetalle) {
                    self.dsDetalle.data([]);
                }

                self.actualizarGrid();

                const grid = $("#gridCreacionPeticionesMMPPEnvasado").data("kendoGrid");

                if (!grid) return;

                grid.dataSource.view().forEach(item => {
                    item.set(
                        "UdProducir",
                        self.cantPlanificada *
                        (item.CalculoPalets === "Envases" ? self.envasesPalet :
                            item.CalculoPalets === "CPBs" ? self.cajasPalet : 1)
                    );

                    self.recalcularFila(item);
                });

                grid.refresh();
            },
            actualizarGrid: function () {
                let self = this;
                self.dsStock.data([]);

                var grid = $("#gridCreacionPeticionesMMPPEnvasado").data("kendoGrid");
                if (self.idLinea == "" || self.idLinea == undefined || self.idLinea == null) {
                    // Oculta columnas
                    grid.hideColumn("CantidadPedir");
                    grid.hideColumn("Prioridad");
                    grid.hideColumn("PaletsNecesarios");
                    grid.hideColumn("PaletsPedidos");
                    grid.hideColumn("Faltan");

                    $("#btnPedirMMPP").hide();
                    $("#btnPedirMMPP2").hide();
                } else {
                    // Muestra columnas                    
                    grid.showColumn("CantidadPedir");
                    grid.showColumn("Prioridad");
                    grid.showColumn("PaletsNecesarios");
                    grid.showColumn("PaletsPedidos");
                    grid.showColumn("Faltan");

                    $("#btnPedirMMPP").show();
                    $("#btnPedirMMPP2").show();
                }

                //kendo.ui.progress($("#divHTMLContenido"), true);
                self.dsStock.read();
            },
            actualizarGridDetalle: function () {
                let self = this;
                self.dsDetalle.data([]);

                //kendo.ui.progress($("#gridCreacionPeticionesMMPPEnvasadoDetalle"), true);
                self.dsDetalle.read();
            },
            obtenerRegistroTablaMaestro: async function (material) {
                const self = this;
                try {
                    const response = await $.ajax({
                        type: "GET",
                        url: `../api/solicitudes-mmpp/datos-maestroClasesUbicaciones?idLinea=${self.idLinea}&idMaterial=${material}`,
                        dataType: 'json'
                    });
                    return response;
                } catch (e) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'api/solicitudes-mmpp/datos-maestroClasesUbicaciones', 4000);
                    return null;
                }
            },
            normalizarMensajeError: function (result, e) {
                // Si viene string, lo formateamos
                if (typeof result === "string") {
                    return result.replace(/\n/g, "<br>");
                }

                // Si viene objeto JSON (del back), intentamos campos típicos
                if (result && typeof result === "object") {
                    if (result.message) return String(result.message).replace(/\n/g, "<br>");
                    if (result.error) return String(result.error).replace(/\n/g, "<br>");
                    try {
                        return JSON.stringify(result, null, 2).replace(/\n/g, "<br>");
                    } catch (_err) {
                        return String(result);
                    }
                }

                // Si el error viene desde jQuery.ajax 'error' (objeto e)
                if (e) {
                    // responseJSON con detalle
                    if (e.responseJSON) {
                        try {
                            return JSON.stringify(e.responseJSON, null, 2).replace(/\n/g, "<br>");
                        } catch (_err) {
                            return String(e.responseJSON);
                        }
                    }
                    // responseText plano
                    if (e.responseText) {
                        return String(e.responseText).replace(/\n/g, "<br>");
                    }
                    // status + statusText
                    if (e.status || e.statusText) {
                        return `HTTP ${e.status || ''} ${e.statusText || ''}`;
                    }
                    // toString del objeto error
                    if (typeof e === 'object') {
                        try {
                            return JSON.stringify(e, null, 2).replace(/\n/g, "<br>");
                        } catch (_err) { }
                    }
                }

                // Fallback final
                return String(result ?? '');
            },
            confirmarPeticiones: async function (e) {
                e.preventDefault();
                var self = this;

                var permiso = TienePermiso(390);
                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                // Obtener el grid
                var grid = $("#gridCreacionPeticionesMMPPEnvasado").data("kendoGrid");

                // Verificar que al menos haya un registro con "CantidadPedir" mayor a 0
                var dataSource = grid.dataSource.view().filter(item => parseFloat(item.CantidadPedir) > 0);
                if (dataSource.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('OBL_PEDIR_MMPP'), 4000);
                    return;
                }

                // Validar que cada material -> Esté configurado en la tabla maestra des calses/ubicacion y en calculo de palets
                for (let item of dataSource) {
                    var aux = await self.obtenerRegistroTablaMaestro(item.IdMaterial);
                    if (!aux || aux.length === 0) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), `El material ${item.IdMaterial} (${item.DescripcionMaterial}) no esta configurado en la tabla maestra Clases/Ubicacion.`, 6000);
                        return;
                    }
                    if (item.CalculoPalets == '') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), `El material ${item.IdMaterial} (${item.DescripcionMaterial}) no esta configurado en la tabla maestra Calculo de Palets.`, 6000);
                        //return;
                    }
                }

                // Construir mensaje a mostrar en el diálogo
                var mensajeDialogo = `
                    <div style="font-family: Arial, sans-serif; color: #333; padding: 10px; max-width: 340px; width: 100%;">
                        <p style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
                            ${window.app.idioma.t('PETICIONES_LANZAN')}:
                        </p>
                        <ul style="list-style-type: none; padding-left: 0; margin: 0;width:500px;">
                            ${dataSource.map(item => {
                    // Definir la cantidad solicitada
                    const cantidadSolicitada = item.CantidadPedir;

                    // Función para crear una línea de la lista con IdMaterial y la cantidad solicitada
                    const crearLinea = (idMaterial, descripcion, cantidad) => `
                                    <li style="background: #f9f9f9; padding: 8px 12px; margin-bottom: 5px; 
                                        border-radius: 5px; border-left: 5px solid #007bff; display: flex; 
                                        align-items: center; gap: 10px; word-wrap: break-word;">
                                        <span style="font-size: 14px; flex: 1; text-align: left; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                                            ${idMaterial} ${descripcion}
                                        </span>
                                        <span style="font-size: 14px; font-weight: bold; white-space: nowrap; text-align: left;">
                                            ${cantidad} Palets
                                        </span>
                                    </li>
                                `;

                    // Mostrar solo una línea con el IdMaterial, DescripcionMaterial y la cantidad solicitada
                    return crearLinea(item.IdMaterial, item.DescripcionMaterial, cantidadSolicitada);
                }).join('')}
                        </ul>
                    </div>
                `;

                // Construcción del objeto "datos" con los registros filtrados
                var datos = dataSource.map(item => ({
                    IdTipoSolicitud: 1,
                    IdEstadoSolicitud: 1,
                    Fuente: self.idLinea,
                    Prioridad: item.Prioridad,
                    IdMaterial: item.IdMaterial,
                    LoteProveedor: "",
                    Cantidad: item.CantidadPedir,
                    CantidadDisponible: item.PaletsDisponibles,
                }));

                var idZona = self.idZona;

                // Confirmar peticiones
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('CONFIRMAR_LANZAN_SOLICITUDES'),
                    msg: mensajeDialogo,
                    claseExtra: 'popup-ancho-especial',
                    funcion: function () {
                        var btnAceptar = $(".popup-ancho-especial .k-window .k-primary:contains('Aceptar')");
                        btnAceptar.prop("disabled", true);

                        Backbone.trigger('eventCierraDialogo');

                        self.enviarSolicitudes(datos, idZona).then((result) => {

                            // EXITO
                            if (!result || result === true || (typeof result === 'object' && result.fallidas === 0)) {
                                if (self.dsStock.page() != 1) {
                                    self.dsStock.page(1);
                                }
                                self.dsStock.read();

                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SOLICITUDES_ENVIADAS'), 4000);
                                return;
                            }


                            // El backend puede devolver un objeto JSON o algo no-string
                            const msg = Array.isArray(result?.errores) && result.errores.length
                                ? result.errores.map(e =>`${e.IdMaterial} - ${e.DescripcionMaterial} (${e.Cantidad}): ${e.Error}`).join('<br>')
                                : self.normalizarMensajeError(result);
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'),
                                window.app.idioma.t('ERROR_ENVIAR_SOLICITUDES') + ':<br>' + msg, 10000);

                        }).catch((e) => {
                            // ERRORES de red / 4xx / 5xx
                            const msg = self.normalizarMensajeError(null, e);
                            if (e && e.status == 403 && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'),
                                    window.app.idioma.t('ERROR_ENVIAR_SOLICITUDES') + ':<br>' + msg, 10000);
                            }
                        });
                    },

                    contexto: this
                });
            },
            confirmarPeticiones2: async function (e) {
                //Confirmar para solicitudes con LoteProveedor
                e.preventDefault();
                var self = this;

                var permiso = TienePermiso(390);
                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                // Obtener el grid
                var grid = $("#gridCreacionPeticionesMMPPEnvasadoDetalle").data("kendoGrid");

                // Verificar que al menos haya un registro con "CantidadPedir" mayor a 0
                var dataSource = grid.dataSource.view().filter(item => parseFloat(item.CantidadPedir) > 0);
                if (dataSource.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('OBL_PEDIR_MMPP'), 4000);
                    return;
                }

                // Validar que cada material esté configurado en la tabla maestra
                for (let item of dataSource) {
                    var aux = await self.obtenerRegistroTablaMaestro(item.IdMaterial);
                    if (!aux || aux.length === 0) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), `El material ${item.IdMaterial} (${item.DescripcionMaterial}) no esta configurado en la tabla maestra.`, 6000);
                        return;
                    }
                }

                // Construir mensaje a mostrar en el diálogo
                var mensajeDialogo = `
                    <div style="font-family: Arial, sans-serif; color: #333; padding: 10px; width: 480px;">
                        <p style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">
                            ${window.app.idioma.t('PETICIONES_LANZAN')}:
                        </p>
                        <ul style="list-style-type: none; padding-left: 0; margin: 0;width:500px;">
                            ${dataSource.map(item => {
                                    // Definir cantidad disponible y cantidad solicitada
                                    const cantidadDisponible = item.PaletsDisponibles;
                                    const cantidadSolicitada = item.CantidadPedir > cantidadDisponible ? item.CantidadPedir - cantidadDisponible : 0;

                                    // Función para crear una línea de la lista
                                    const crearLinea = (cantidad, LoteProveedor, descripcionProveedor) => `
                                    <li style="background: #f9f9f9; padding: 8px 12px; margin-bottom: 5px; 
                                        border-radius: 5px; border-left: 5px solid #007bff; display: flex; 
                                        align-items: center; gap: 10px;">
                                        <span style="font-size: 14px; flex: 1; text-align: left;">
                                            ${item.IdMaterial} ${item.DescripcionMaterial} </br> 
                                            ${LoteProveedor ? 'Lote Proveedor: ' + LoteProveedor : ''} ${descripcionProveedor ? '/ ' + descripcionProveedor : ''}
                                        </span>
                                        <span style="font-size: 14px; font-weight: bold; white-space: nowrap; text-align: left;">
                                            ${cantidad} Palets
                                        </span>
                                    </li>
                                `;

                                    // Generar las líneas según la disponibilidad y solicitud
                                    let mensaje = '';
                                    if (cantidadSolicitada > 0) {
                                        // Línea para lo disponible
                                        mensaje += crearLinea(cantidadDisponible, item.LoteProveedor, item.DescripcionProveedor);
                                        // Línea para lo solicitado, con el LoteProveedor vacío y sin proveedor
                                        mensaje += crearLinea(cantidadSolicitada, '', '');
                                    } else {
                                        // Solo se muestra la línea para pedir la cantidad total
                                        mensaje += crearLinea(item.CantidadPedir, item.LoteProveedor, item.DescripcionProveedor);
                                    }

                                    return mensaje;
                                }).join('')}
                        </ul>
                    </div>
                `;

                // Construcción del objeto "datos" con los registros filtrados
                var datos = dataSource.map(item => ({
                    IdTipoSolicitud: 1,
                    IdEstadoSolicitud: 1,
                    Fuente: self.idLinea,                    
                    Prioridad: item.Prioridad,
                    LoteProveedor: item.LoteProveedor,
                    IdMaterial: item.IdMaterial,                    
                    Cantidad: item.CantidadPedir,
                    CantidadDisponible: item.PaletsDisponibles,
                }));
                var totalCantidadPedir = dataSource.reduce((total, item) => total + (item.CantidadPedir || 0), 0);

                // Confirmar peticiones
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('CONFIRMAR_LANZAN_SOLICITUDES'),
                    claseExtra: "popup-ancho-especial",
                    msg: mensajeDialogo,

                    funcion: function () {
                        var btnAceptar = $(".popup-ancho-especial .k-window .k-primary:contains('Aceptar')");
                        btnAceptar.prop("disabled", true);

                        Backbone.trigger('eventCierraDialogo');

                        self.enviarSolicitudes(datos).then((result) => {
                            // EXITO
                            if (!result || result === true || (typeof result === 'object' && result.fallidas === 0)) {
                                if (self.dsStock.page() != 1) {
                                    self.dsStock.page(1);
                                }

                                //Actualizar grid general
                                gridGeneral = $("#gridCreacionPeticionesMMPPEnvasado").data("kendoGrid");
                                var itemAct = gridGeneral.dataSource.get(datos[0].IdMaterial);
                                if (itemAct) {
                                    const totalCantidadPedir = datos.reduce((acc, d) => acc + (d.Cantidad || 0), 0);
                                    itemAct.PaletsPedidos += totalCantidadPedir;
                                    itemAct.CantidadPedir = 0;

                                    itemAct.Faltan = self.calcularFaltan(itemAct);

                                    gridGeneral.refresh();
                                }

                                self.dsDetalle.read();

                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SOLICITUDES_ENVIADAS'), 4000);
                                return;
                            }
                           
                            const msg = Array.isArray(result?.errores) && result.errores.length
                                ? result.errores.map(e => `${e.IdMaterial} - ${e.DescripcionMaterial} (${e.Cantidad}): ${e.Error}`).join('<br>')
                                : self.normalizarMensajeError(result);
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'),
                                window.app.idioma.t('ERROR_ENVIAR_SOLICITUDES') + ':<br>' + msg, 10000);

                        }).catch((e) => {
                            const msg = self.normalizarMensajeError(null, e);
                            if (e && e.status == 403 && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'),
                                    window.app.idioma.t('ERROR_ENVIAR_SOLICITUDES') + ':<br>' + msg, 10000);
                            }
                        });
                    },

                    contexto: this
                });
            },
            enviarSolicitudes: async function (datos) {
                return new Promise((resolve, reject) => {

                    $.ajax({
                        type: "POST",
                        url: "../api/solicitudes-mmpp",
                        data: JSON.stringify(datos),
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        success: function (result) {
                            // Algunos backends devuelven vacío/true/objeto
                            resolve(result);
                        },
                        error: function (e) {
                            // No uses 'result' aquí porque no existe en este scope
                            if (e.status == 403 && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                // No mostramos aquí el detalle; lo haremos en el catch del caller
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'solicitudes-mmpp', 4000);
                            }
                            reject(e); // <-- devuelve el error real al caller (para que lo procese con normalizar)
                        }
                    });
                });
            },
            resizeGrid: function () {
                var centerPaneHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").outerHeight(true);
                var filtrosHeight = $("#divFiltrosHeader").outerHeight(true);
                var availableHeight = centerPaneHeight - cabeceraHeight - filtrosHeight;

                var gridElement = $("#gridCreacionPeticionesMMPPEnvasado");
                gridElement.css("height", availableHeight + "px");
            },

            eliminar: function () {
                this.remove();
            },
        });

        return gridCreacionPeticionesMMPPEnvasado;
    });
