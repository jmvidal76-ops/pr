define(['underscore', 'backbone', 'jquery', 'text!../../../html/envasado/CreacionPeticionesMMPPSmile.html', 'compartido/notificaciones', 'compartido/utils',
    'vistas/vDialogoConfirm', 'jszip', 'definiciones'],
    function (_, Backbone, $, plantillaCreacionPeticionesMMPPSmile, Not, Utils, VistaDlgConfirm, JSZip, definiciones) {
        var gridCreacionPeticionesMMPPSmile = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            dsStock: null,
            idLinea: null,
            zonaEq: null,
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
            template: _.template(plantillaCreacionPeticionesMMPPSmile),

            initialize: async function () {
                var self = this;
                window.JSZip = JSZip;

                self.idLinea = window.app.lineaSel.id;
                self.zonaEq = window.app.zonaSel.maquinas;

                kendo.culture(localStorage.getItem("idiomaSeleccionado"));

                self.render();

                self.inicializarGrid();

                // Inicia la carga de las WOs en segundo plano (sin bloquear la UI).
                self.woDataPromise = Promise.all([
                    self.obtenerWOActivas(self),
                    self.obtenerWOPlanificadas(self),
                    self.obtenerPrioridad('MES_MSM', 'PRIO_SMILE_CREA_TERMINAL')
                ]).then(function () {
                    self.dsWOAct = self.dsWOAct || [];
                    self.dsWOPlan = self.dsWOPlan || [];
                    self.dsWO = self.dsWOAct.concat(self.dsWOPlan);
                    self.cargarWO();
                }).catch(function (error) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CARGAR_WO_BACKGROUND'), 4000);
                    self.dsWO = []; // Asegurarse de que dsWO sea un array vacío en caso de error
                });

                //Cargamos grid al iniciar
                self.cargarGrid();
                self.esInicio = false;

                kendo.ui.progress($("#gridCreacionPeticionesMMPPSmile"), true);
                try {
                    // *** ESPERAMOS AQUÍ a que las WO se hayan cargado en segundo plano ***
                    await self.woDataPromise;
                    self.cargarWO();
                } catch (error) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CARGAR_WO_AL_SELECCIONAR_LINEA'), 4000);
                } finally {
                    kendo.ui.progress($("#gridCreacionPeticionesMMPPSmile"), false);
                }
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
                    }).fail(function () {
                        Notificacion.crearNotificacion('error', window.app.idioma.t('ERROR'), 'api/obtenerWOActivas', 4000);
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
                    }).fail(function () {
                        Notificacion.crearNotificacion('error', window.app.idioma.t('ERROR'), 'api/ordenesPendientes', 4000);
                        reject();
                    });
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

                                //var maquinas = self.zonaEq ? self.zonaEq.map(item => item.nombre).join(',') : '';

                                $.ajax({
                                    type: "GET",
                                    url: "../api/ObtenerStockMMPPSmile/",
                                    dataType: 'json',
                                    data: {
                                        IdProducto: self.idProducto || "",
                                        IdLinea: self.idLinea || "",
                                        IdMaterial: "",
                                        IdZona: window.app.zonaSel.id,
                                        AgruparMMPP: true
                                    },
                                    cache: false,
                                    contentType: "application/json; charset=utf-8",
                                    complete: function (e) {
                                        kendo.ui.progress($("#gridCreacionPeticionesMMPPSmile"), false);
                                    },
                                    success: function (response) {
                                        if (!response || response.length === 0) {
                                            operation.success([]);
                                        }
                                        else {
                                            const enrichedData = response.map(item => {
                                                //Calculos relativos al stock.su
                                                const udPaletsStock = Math.ceil(item.UnidadesDisponibles / item.PaletsDisponibles) || 0;

                                                let unidades = 0;
                                                if (item.CalculoPalets == "Envases") {
                                                    unidades = self.envasesPalet;
                                                }
                                                else if (item.CalculoPalets == "Palet") {
                                                    unidades = 1;
                                                }
                                                else if (item.CalculoPalets == "CPBs") {
                                                    unidades = self.cajasPalet;
                                                }
                                                const udProd = self.cantPlanificada * unidades;

                                                let paletsNec = 0;
                                                if (udProd != 0 & udPaletsStock != 0) {
                                                    paletsNec = Math.ceil(udProd / udPaletsStock) || 0;
                                                }

                                                var faltan = Math.max(0, paletsNec - item.UnidadesSolicitadas);                                                

                                                return {
                                                    ...item,
                                                    Prioridad: self.prioridad,
                                                    CantidadPedir: 0,
                                                    UdProducir: udProd,
                                                    UnidadesPalets: udPaletsStock,
                                                    PaletsPedidos: item.UnidadesSolicitadas,
                                                    UdPedidas: item.UnidadesSolicitadas * udPaletsStock,
                                                    PaletsPedidosIni: item.UnidadesSolicitadas,
                                                    PaletsNecesarios: paletsNec,
                                                    Faltan: faltan,
                                                    FaltanIni: faltan,
                                                };
                                            });

                                            operation.success(enrichedData);

                                            //Actualizamos faltan, sumatorio por material
                                            //actualizarFaltan(enrichedData);

                                            function actualizarFaltan(enrichedData) {
                                                const grid = $("#gridCreacionPeticionesMMPPSmile").data("kendoGrid");
                                                const dataSource = grid.dataSource.view();

                                                enrichedData.forEach(item => {
                                                    // Sumamos todas las UdPedidas de las filas con el mismo IdMaterial
                                                    const totalUdPedidas = enrichedData.filter(i => i.IdMaterial === item.IdMaterial)
                                                        .reduce((sum, i) => sum + i.UdPedidas, 0); // Sumamos todas las UdPedidas

                                                    if (totalUdPedidas > 0) {
                                                        // Calculamos el total de Faltan para todas las filas con el mismo IdMaterial
                                                        const faltanTotal = Math.max(0, item.UdProducir - totalUdPedidas);

                                                        // Actualizamos el Faltan de cada fila con el mismo IdMaterial
                                                        dataSource.forEach(fila => {
                                                            if (fila.IdMaterial === item.IdMaterial) {
                                                                var itemAct = grid.dataSource.get(fila.IdStock);
                                                                if (itemAct) {
                                                                    itemAct.Faltan = Math.ceil(faltanTotal / itemAct.UnidadesPalets);
                                                                    itemAct.FaltanIni = itemAct.Faltan;
                                                                }
                                                            }
                                                        });
                                                    }
                                                });

                                                // Refrescamos el grid después de actualizar el campo Faltan
                                                grid.refresh();
                                            }
                                        }

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
                                    'CantidadPedir': { type: "number", editable: true },
                                    'Prioridad': { type: "number", editable: true },
                                    'PaletsNecesarios': { type: "number", editable: false },
                                    'PaletsPedidos': { type: "number", editable: false },
                                    'Faltan': { type: "number", editable: false },
                                    'CalculoPalets': { type: "string", editable: false }
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
            cargarGrid: function () {
                var self = this;

                this.$("#gridCreacionPeticionesMMPPSmile").kendoGrid({
                    dataSource: self.dsStock,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    sortable: true,
                    toolbarColumnMenu: true,
                    scrollable: false,
                    selectable: true,
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
                    selectable: "row",
                    dataBinding: self.resizeGrid,
                    dataBound: function () {
                        var grid = this;
                        var wrapper = grid.wrapper;
                        var tbody = grid.tbody;
                        tbody.find(".espaciador-pie").remove();

                        var totalHeight = wrapper.innerHeight(); // Alto total disponible del grid
                        var headerHeight = wrapper.find(".k-grid-header").outerHeight(false) || 0;
                        var pagerHeight = wrapper.find(".k-pager-wrap").outerHeight(false) || 0;
 
                        var groupingHeaderHeight = wrapper.find(".k-grouping-header").outerHeight(false) || 0;

                        var contentUsed = headerHeight + pagerHeight + groupingHeaderHeight; 

                        // Sumar solo el alto visible de las filas (sin márgenes)
                        tbody.find("tr").each(function () {
                            contentUsed += $(this).outerHeight(false);
                        });

                        var espacioLibre = totalHeight - contentUsed;

                        if (espacioLibre > 1 && tbody.find("tr").length > 0) { // Añadimos la condición de que haya filas
                            var colCount = grid.columns.length;
                            var espaciador = $(
                                "<tr class='espaciador-pie k-no-data' role='presentation' style='pointer-events: none;'>" +
                                "<td colspan='" + colCount + "' style='height:" + espacioLibre + "px; border: none; background: transparent; pointer-events: none;'>&nbsp;</td>" +
                                "</tr>"
                            );
                            tbody.append(espaciador);
                        }
                    },


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
                            width: 420,
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
                            field: 'EAN',
                            title: 'EAN',
                            width: 150,
                            filterable: true,
                            groupable: true,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' }
                        },
                        {
                            hidden: true,
                            field: 'Lote',
                            title: 'Lote',
                            width: 150,
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
                                var dataItem = options.model;
                                if (dataItem.PaletsDisponibles > 0) {
                                    $('<input required name="' + options.field + '"/>')
                                        .appendTo(container)
                                        .kendoNumericTextBox({
                                            min: 0,
                                            change: function (e) {
                                                if (dataItem.CantidadPedir > dataItem.PaletsDisponibles) {
                                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SOLICITUD_SMILE_SUPERA_DISPONIBLE1'),10000);
                                                }

                                                // Nueva lógica sin sumatorios
                                                if (dataItem.Faltan != 0) {
                                                    var unidadesPedidas = parseFloat(dataItem.PaletsPedidos) * parseFloat(dataItem.UnidadesPalets);
                                                    var unidadesPedir = parseFloat(dataItem.CantidadPedir) * parseFloat(dataItem.UnidadesPalets);

                                                    var unidadesFaltan = parseFloat(dataItem.UdProducir) - unidadesPedidas - unidadesPedir;
                                                    dataItem.Faltan = Math.ceil(unidadesFaltan / parseFloat(dataItem.UnidadesPalets));

                                                    if (dataItem.Faltan < 0) {
                                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'),window.app.idioma.t('SOLICITUD_SMILE_SUPERA_NECESARIOS'),10000);
                                                    }

                                                    var grid = $("#gridCreacionPeticionesMMPPSmile").data("kendoGrid");
                                                    grid.refresh();
                                                }
                                            }
                                        });
                                }
                            }
                        },
                        {
                            hidden:true,
                            field: 'Prioridad',
                            title: window.app.idioma.t("PRIORIDAD"),
                            width: 110,
                            filterable: false,
                            groupable: false,
                            editable: function (dataItem) {
                                return dataItem.PaletsDisponibles > 0;
                            },
                            attributes: { style: "white-space: nowrap; text-align: center;" },
                            editor: function (container, options) {
                                // Verificar si el IdStock es 0
                                var dataItem = options.model;
                                if (dataItem.PaletsDisponibles > 0) {
                                    $('<input required name="' + options.field + '"/>')
                                        .appendTo(container)
                                        .kendoNumericTextBox({ min: 0, max: 10 });
                                }
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
                                return `<span style="display: block; text-align: center; ${color}">${dataItem.Faltan}</span>`;
                            },
                            template: '#=typeof Faltan !== "undefined" && Faltan !== null ?   kendo.format("{0:n0}", Faltan) : ""#',
                            attributes: { style: 'white-space: nowrap;text-align: center;', class: 'addTooltip' }
                        }
                    ],

                });

            },
            cargarWO: function () {
                var self = this;

                var ListaWO = self.dsWO.filter(e => e.idLinea == self.idLinea);

                self.$("#selectWO").kendoDropDownList({
                    dataTextField: "estadoActual.nombre",
                    dataValueField: "id",
                    valueTemplate: "#:id# Prod:#:producto.codigo# - #:estadoActual.nombre#",
                    template: "#:id# (Prod:#:producto.codigo#) - #:estadoActual.nombre#",
                    dataSource: new kendo.data.DataSource({
                        data: ListaWO,
                        schema: {
                            model: {
                                fields: {
                                    fecInicioEstimado: {
                                        type: "date",
                                        parse: function (value) {
                                            return kendo.parseDate(value, "dd/MM/yyyy");
                                        }
                                    }
                                }
                            }
                        },
                        sort: { field: "fecInicioEstimado", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    change: function (e) {
                        var selectedWO = this.dataItem(this.select());
                        if (selectedWO) {
                            // Guardamos el WO seleccionado
                            self.idProducto = selectedWO.producto.codigo;
                            self.cajasPalet = selectedWO.CajasPorPalet;
                            self.envasesPalet = selectedWO.EnvasesPorPalet;
                            self.cantPlanificada = selectedWO.cantPlanificada;

                            $("#txtProducto").val(selectedWO.producto.nombre || "");
                            $("#txtProduccion").val(selectedWO.cantPlanificada || "");
                            $("#txtCPBSEnv").val(selectedWO.CajasPorPalet + " / " + selectedWO.EnvasesPorPalet || "");

                            self.consulta();
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                $(self.el).html(self.template());
                $("#center-pane").append($(self.el));

                $("#txtSelectLinea").val(ObtenerLineaDescripcion(self.idLinea));

                //self.cargarGrid();
                //self.resizeGrid();
            },

            events: {
                'click #btnLeyenda': 'mostrarLeyenda',
                'click #btnFiltrar': 'consulta',
                'click #btnPedirMMPP': 'confirmarPeticiones',
            },
            mostrarLeyenda: function () {
                var self = this;

                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='windowLeyenda'></div>"));

                var ventanaLeyenda = $("#windowLeyenda").kendoWindow(
                    {
                        title: window.app.idioma.t('DESCRIPCION_COLORES'),
                        width: "800px",
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

                var woText = $("#selectWO option:selected").text();

                if (woText == "" || woText == window.app.idioma.t('SELECCIONE')) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR') + ' WO', 3000);
                    return;
                }

                if (self.dsStock.page() != 1) {
                    self.dsStock.page(1);
                }

                self.actualizarGrid();
            },
            actualizarGrid: function () {
                let self = this;
                self.dsStock.data([]);

                var grid = $("#gridCreacionPeticionesMMPPSmile").data("kendoGrid");
                if (self.idLinea == "" || self.idLinea == undefined || self.idLinea == null) {
                    // Oculta columnas
                    grid.hideColumn("CantidadPedir");
                    //grid.hideColumn("Prioridad");
                    grid.hideColumn("PaletsNecesarios");
                    grid.hideColumn("PaletsPedidos");
                    grid.hideColumn("Faltan");

                    //$("#btnPedirMMPP").hide();
                } else {
                    // Muestra columnas                    
                    grid.showColumn("CantidadPedir");
                    //grid.showColumn("Prioridad");
                    grid.showColumn("PaletsNecesarios");
                    grid.showColumn("PaletsPedidos");
                    grid.showColumn("Faltan");

                    //$("#btnPedirMMPP").show();
                }

                kendo.ui.progress($("#gridCreacionPeticionesMMPPSmile"), true);
                self.dsStock.read();
                //self.resizeGrid();
                
            },
            obtenerRegistroTablaMaestro: async function (material) {
                const self = this;
                try {
                    const response = await $.ajax({
                        type: "GET",
                        url: "../api/ObtenerDatosMaestroClaseSubClaseMMPPUbicacionMaterial?idLinea=" + self.idLinea + "&idMaterial=" + material,
                        dataType: 'json'
                    });
                    return response;
                } catch (e) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'api/general/ObtenerDatosMaestroClaseMMPPUbicacion', 4000);
                    return null;
                }
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
                var grid = $("#gridCreacionPeticionesMMPPSmile").data("kendoGrid");

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
                        ${window.app.idioma.t('PETICIONES_LANZAN_SMILE')}:
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
                    Equipo: self.zonaEq ? self.zonaEq.map(item => item.nombre).join(',') : '',
                    Fuente: self.idLinea,
                    Prioridad: item.Prioridad,
                    SSCC: "",
                    IdMaterial: item.IdMaterial,
                    EAN: "",
                    Cantidad: item.CantidadPedir,
                    CantidadDisponible: item.PaletsDisponibles,
                }));

                var idZona = self.idZona;

                // Confirmar peticiones
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('CONFIRMAR_LANZAN_SMILE'),
                    msg: mensajeDialogo,
                    claseExtra: "popup-ancho-especial",
                    funcion: function () {
                        // Deshabilita el botón aceptar para evitar doble envío
                        var btnAceptar = $(".popup-ancho-especial .k-window .k-primary:contains('Aceptar')");
                        btnAceptar.prop("disabled", true);

                        Backbone.trigger('eventCierraDialogo');

                        self.enviarSolicitudes(datos, idZona).then((result) => {
                            if (result == "") {
                                if (self.dsStock.page() != 1) {
                                    self.dsStock.page(1);
                                }
                                self.dsStock.read();

                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SOLICITUDES_ENVIADAS'), 4000);
                            }
                            else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ENVIAR_SOLICITUDES') + ':<br>' + result.replace(/\n/g, '<br>'), 10000);
                            }
                        });
                    },

                    contexto: this
                });
            },
            enviarSolicitudes: async function (datos) {
                return new Promise((resolve, reject) => {

                    // Realización de la solicitud AJAX
                    $.ajax({
                        type: "POST",
                        url: `../api/CrearPeticionesSmile`,
                        data: JSON.stringify(datos),
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        success: function (result) {
                            resolve(result);
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'CrearPeticionesSmile', 4000);
                            }
                            reject(result);
                        }
                    });
                });
            },
            resizeGrid: function () {
                var centerPaneHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").outerHeight(true);
                var filtrosHeight = $("#divFiltrosHeader").outerHeight(true);
                var availableHeight = centerPaneHeight - cabeceraHeight - filtrosHeight;

                $("#contenedorGrid").height(availableHeight);

                // Después de cambiar la altura del contenedor, le decimos al Kendo Grid que se redimensione
                var gridElement = $("#gridCreacionPeticionesMMPPSmile");
                if (gridElement.data("kendoGrid")) { 
                    gridElement.data("kendoGrid").resize();
                }
            },

            eliminar: function () {
                this.remove();
            },
            actualiza: async function () {
                let self = this;

                self.idLinea = window.app.lineaSel.id;
                self.zonaEq = window.app.zonaSel.maquinas;

                self.idProducto = "";
                self.cajasPalet = 0;
                self.envasesPalet = 0;
                self.cantPlanificada = 0;

                $("#txtProducto").val("");
                $("#txtProduccion").val("");
                $("#txtCPBSEnv").val("");
                $("#txtSelectLinea").val(ObtenerLineaDescripcion(self.idLinea));
                $("#selectWO").val("");

                // 🔁 Limpiar el grid
                let grid = $("#gridCreacionPeticionesMMPPSmile").data("kendoGrid");
                if (grid) {
                    grid.dataSource.data([]);
                }

                kendo.ui.progress($("#gridCreacionPeticionesMMPPSmile"), true);

                try {
                    await Promise.all([
                        self.obtenerPrioridad('MES_MSM', 'PRIO_SMILE_CREA_TERMINAL'),
                        self.obtenerWOActivas(self),
                        self.obtenerWOPlanificadas(self)
                    ]);

                    self.dsWO = [...(self.dsWOAct || []), ...(self.dsWOPlan || [])];
                    self.cargarWO(); // WO seleccionable manualmente

                } catch (err) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'Error al actualizar los datos', 4000);
                } finally {
                    kendo.ui.progress($("#gridCreacionPeticionesMMPPSmile"), false);
                }
            }


        });

        return gridCreacionPeticionesMMPPSmile;
    });
