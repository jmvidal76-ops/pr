const { filter } = require("underscore");

define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/RelacionMostosCervezas.html', 'compartido/notificaciones', 'compartido/utils',
        "jszip", 'definiciones'],
    function (_, Backbone, $, plantillaRelacionMostosCervezas, Not, Utils, JSZip, definiciones) {
        var gridRelacionMostosCervezas = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',            
            dsRelevos: null,
            mostosFermentacionDataSource: null,
            mostosCoccionDataSource: null,
            template: _.template(plantillaRelacionMostosCervezas),

            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                kendo.culture(localStorage.getItem("idiomaSeleccionado"));

                // Usar promesas para cargar datos
                var promesas = [
                    self.inicializarGrid()     
                ];

                // Cuando promesas se resuelvan, renderizamos
                Promise.all(promesas)
                    .then(function () {
                        self.render();
                    })
                    .catch(function (error) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CARGAR_DATOS'), 4000);
                    });

                self.obtenerMostos();
            },
            inicializarGrid: function () {
                var self = this;

                return new Promise(function (resolve, reject) {

                    self.dsRelevos = new kendo.data.DataSource({
                        transport: {
                            read: function (operation) {

                                $.ajax({
                                    type: "GET",
                                    url: "../api/ObtenerRelacionMostosCervezas",
                                    dataType: 'json',
                                    contentType: "application/json; charset=utf-8",
                                    success: function (response) {                                        
                                        // Enriquecer datos si es necesario
                                        const enrichedData = response.map(item => ({
                                            ...item,
                                            Cocciones: item.CodMostCOC || item.DescripcionCodMostCOC ? (item.CodMostCOC || '') + " - " + (item.DescripcionCodMostCOC || '') : '',
                                            Fermentados: item.CodMostFERM || item.DescripcionCodMostFERM ? (item.CodMostFERM || '') + " - " + (item.DescripcionCodMostFERM || '') : '',
                                            Cervezas: item.CodCervTCP || item.DescripcionCodCervTCP ? (item.CodCervTCP || '') + " - " + (item.DescripcionCodCervTCP || '') : ''
                                        }));

                                        operation.success(enrichedData);
                                    },
                                    error: function (e) {
                                        if (e.status === 403 && e.responseJSON === 'NotAuthorized') {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                        } else {
                                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER_RELACION_MOSTOS_CERVEZAS'), 4000);
                                        }
                                        reject(e); 
                                    }
                                });
                            }
                        },
                        schema: {
                            model: {
                                id: "CodCervTCP",
                                fields: {
                                    'CodCervTCP': { type: "string" },
                                    'DescripcionCodCervTCP': { type: "string" },
                                    'Cervezas': { type: "string" },
                                    'CodMostFERM': { type: "string" },
                                    'DescripcionCodMostFERM': { type: "string" },
                                    'Fermentados': { type: "string" },
                                    'CodMostCOC': { type: "string" },
                                    'DescripcionCodMostCOC': { type: "string" },
                                    'Cocciones': { type: "string" },
                                    'ModoActualizacion': { type: "boolean" }
                                }
                            }
                        },
                        pageSize: 200,
                    });

                    resolve();  
                });
            },
            cargarGrid: function () {
                var self = this;

                $("#gridRelacionMostosCervezas").kendoGrid({
                    dataSource: self.dsRelevos,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    sortable: true,
                    toolbarColumnMenu: true,
                    scrollable: true,
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
                    change: function (e) {
                        e.preventDefault();
                        var grid = $("#gridRelacionMostosCervezas").data("kendoGrid");
                        var selectedItem = grid.dataItem(grid.select());
                        if (selectedItem != null) {
                            self.relacionesModal(self, selectedItem);
                        }
                    },
                    columns: [
                        {
                            groupable: true,
                            title: window.app.idioma.t("MOSTO_COCCION"),
                            field: 'Cocciones',
                            width: 250,
                            filterable: true
                        },
                        {
                            groupable: true,
                            title: window.app.idioma.t("MOSTO_FERMENTACION"),
                            field: 'Fermentados',
                            width: 250,
                            filterable: true
                        },
                        {
                            groupable: true,
                            title: window.app.idioma.t("CERVEZA"),
                            field: 'Cervezas',
                            template: "<strong>#:CodCervTCP# - #: (DescripcionCodCervTCP || '') #</strong>",
                            width: 300,
                            filterable: true
                        },
                        {
                            title: window.app.idioma.t("ACTUALIZACION"),
                            field: 'ModoActualizacion',
                            template: "#= ModoActualizacion ? '" + window.app.idioma.t("AUTOMATICO") + "' : '" + window.app.idioma.t("MANUAL") + "' #",
                            filterable: { messages: { isTrue: window.app.idioma.t("AUTOMATICO"), isFalse: window.app.idioma.t("MANUAL") } },
                            width: 80,
                            filterable: true
                        }
                    ]

                });

            },
            render: function () {
                var self = this;

                $(self.el).html(self.template());
                $("#center-pane").append($(self.el));

                kendo.ui.progress($("#gridRelacionMostosCervezas"), true);
                self.cargarGrid();
                self.resizeGrid();
                kendo.ui.progress($("#gridRelacionMostosCervezas"), false);
            },

            events: {

            },

            relacionesModal: function (self, dataItem) {
                let tmplt = $("#RelacionesTemplate").html();

                let data = {
                    CodCervTCP: dataItem.CodCervTCP || '',
                    DescripcionCodCervTCP: dataItem.DescripcionCodCervTCP || '',
                    CodMostFERM: dataItem.CodMostFERM,
                    CodMostCOC: dataItem.CodMostCOC,
                    ModoActualizacion: dataItem.ModoActualizacion
                };

                let ventana = $("<div id='window-lanzar'/>").kendoWindow({
                    title: window.app.idioma.t("EDITAR") + " - " + window.app.idioma.t("RELACION_MOSTOS_CERVEZAS"),
                    close: function () {
                        kendoWindow.destroy();
                    },
                    resizable: false,
                    modal: true
                });

                let kendoWindow = ventana.getKendoWindow();

                let template = kendo.template(tmplt);
                kendoWindow.content(template(data));

                //Abrimos modal
                kendo.init(ventana);

                //Cargamos los combos de mostos
                self.cargarCombosMostos(dataItem);
                //Cargamos combo Actualización
                $("#cmbActualizacion").val(dataItem.ModoActualizacion ? "1" : "0");

                // Manejo de botones de cancelar y guardar
                $("#btnCancelarRelaciones").click(async (e) => {
                    kendoWindow.close();
                });

                $("#btnGuardarRelaciones").click(async (e) => {
                    data.CodMostFERM = $("#cmbMostoFermentacion").data("kendoDropDownList").value();
                    data.CodMostCOC = $("#cmbMostoCoccion").data("kendoDropDownList").value();
                    data.ModoActualizacion = $("#cmbActualizacion").val();

                    kendoWindow.close();
                    await self.actualizarRelacionMostosCervezas(self, data);
                    self.dsRelevos.read();
                });

                kendoWindow.center().open();
            },
            obtenerMostos: function () {
                var self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerMaterialesFabricacion",
                    dataType: 'json'
                }).done(function (data) {
                    var filteredData = data.filter(function (item) {
                        return item.IdClase === "MOS" || item.IdClase === "MIX"; //Para seleccionar solo mostos y mix
                    });
                    self.mostosFermentacionDataSource = filteredData || [];
                    self.mostosCoccionDataSource = filteredData || [];
                }).fail(function () {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                });
            },
            cargarCombosMostos: function (dataItem) {
                var self = this;

                // Inicialización de Combo mosto Fermentación
                let comboModal1 = $("#cmbMostoFermentacion").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdMaterial",
                    template: '#: IdMaterial # - #: Descripcion != null ? Descripcion : "" #',
                    valueTemplate: '#: IdMaterial # - #: Descripcion != null ? Descripcion : "" #',
                    optionLabel: window.app.idioma.t('SELECCIONAR'),
                    dataSource: {
                        data: [{ IdMaterial: "", Descripcion: "" }, ...self.mostosFermentacionDataSource], // Agregamos la opción vacía al inicio
                        sort: { field: "Descripcion", dir: "asc" }
                    },
                    filter: "contains", // Habilita el filtrado en el DropDownList
                    filtering: function (ev) {
                        const filterValue = ev.filter ? ev.filter.value : "";
                        ev.preventDefault();

                        this.dataSource.filter({
                            logic: "or",
                            filters: [
                                {
                                    field: "IdMaterial",
                                    operator: "contains",
                                    value: filterValue
                                },
                                {
                                    field: "Descripcion",
                                    operator: "contains",
                                    value: filterValue
                                }
                            ]
                        });
                    }
                }).data("kendoDropDownList");
                comboModal1.value(dataItem.CodMostFERM || "");

                // Inicialización de Combo mosto Cocción
                let comboModal2 = $("#cmbMostoCoccion").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdMaterial",
                    template: '#: IdMaterial # - #: Descripcion != null ? Descripcion : "" #',
                    valueTemplate: '#: IdMaterial # - #: Descripcion != null ? Descripcion : "" #',
                    optionLabel: window.app.idioma.t('SELECCIONAR'),
                    dataSource: {
                        data: [{ IdMaterial: "", Descripcion: "" }, ...self.mostosCoccionDataSource], // Agregamos la opción vacía al inicio
                        sort: { field: "Descripcion", dir: "asc" }
                    },
                    filter: "contains", // Habilita el filtrado en el DropDownList
                    filtering: function (ev) {
                        const filterValue = ev.filter ? ev.filter.value : "";
                        ev.preventDefault();

                        this.dataSource.filter({
                            logic: "or",
                            filters: [
                                {
                                    field: "IdMaterial",
                                    operator: "contains",
                                    value: filterValue
                                },
                                {
                                    field: "Descripcion",
                                    operator: "contains",
                                    value: filterValue
                                }
                            ]
                        });
                    }
                }).data("kendoDropDownList");
                comboModal2.value(dataItem.CodMostCOC || "");
            },
            actualizarRelacionMostosCervezas: async function (self, datos) {
                kendo.ui.progress($("#panelDatos"), true);

                return new Promise((resolve, reject) => {

                    $.ajax({
                        type: "PUT",
                        url: `../api/ActualizarRelacionMostosCervezas/`,
                        data: JSON.stringify(datos),
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        success: function (data) {
                            kendo.ui.progress($("#panelDatos"), false);
                            resolve(data);
                            if (data) {
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ACTUALIZANDO_OK'), 4000);
                            }
                            else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ACTUALIZAR') + ' ' +
                                    window.app.idioma.t('RELACION_MOSTOS_CERVEZAS'), 4000);
                            }
                        },
                        error: function (e) {
                            kendo.ui.progress($("#panelDatos"), false);
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ACTUALIZAR') + ' ' +
                                    window.app.idioma.t('RELACION_MOSTOS_CERVEZAS'), 4000);
                            }
                            reject(null);
                        }
                    })
                });
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridRelacionMostosCervezas"),
                    dataArea = gridElement.find(".k-grid-content:first"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - filtrosHeight - 130);
            },
            eliminar: function () {
                this.remove();
            },
        });

        return gridRelacionMostosCervezas;    
    });