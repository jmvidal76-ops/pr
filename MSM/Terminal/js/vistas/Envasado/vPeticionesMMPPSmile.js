define(['underscore', 'backbone', 'jquery', 'text!../../../html/envasado/PeticionesMMPPSmile.html', 'compartido/notificaciones', 'compartido/utils',
    'vistas/vDialogoConfirm', 'jszip', 'definiciones'],
    function (_, Backbone, $, plantillaPeticionesMMPPSmile, Not, Utils, VistaDlgConfirm, JSZip, definiciones) {
        var gridPeticionesMMPPSmile = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            inicio: null,
            fin: null,
            dsPeticiones: null,
            dsDetalle: null,
            actualizacionIntervalo: null,
            numLinea: null,
            template: _.template(plantillaPeticionesMMPPSmile),

            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                kendo.culture(localStorage.getItem("idiomaSeleccionado"));

                // Asignamos fechas iniciales
                if (!self.inicio) {
                    self.inicio = new Date();
                    self.inicio.setHours(self.inicio.getHours() - 24, 0, 0);
                }
                if (!self.fin) {
                    self.fin = new Date();
                    self.fin.setHours(23, 59, 59);
                }

                // Recuperar la línea seleccionada del login (terminal)
                self.numLinea = (window.app && window.app.lineaSel && window.app.lineaSel.id) ? window.app.lineaSel.id : null;

                self.render();
            },

            cargarDatos: function (callback) {
                var self = this;

                let datos = {
                    fechaIni: self.inicio.toISOString(),
                    fechaFin: self.fin.toISOString(),
                    idLinea: (self.numLinea != null && self.numLinea !== '') ? self.numLinea : ''
                };

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerPeticionesMMPPSmile",
                    dataType: 'json',
                    cache: false,
                    data: datos,
                    contentType: "application/json; charset=utf-8",
                    complete: function () {
                        kendo.ui.progress($("#gridPeticionesMMPPSmile"), false);
                    },
                    success: function (response) {
                        let enrichedData = [];
                        if (response && response.length) {
                            enrichedData = response.map(item => {
                                if (item.NombreEquipo == "") {
                                    item.NombreEquipo = item.Nombre;
                                }
                                return { ...item };
                            });
                        }
                        callback(enrichedData);
                    },
                    error: function (e) {
                        if (e.status === 403 && e.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER') + ' ' + window.app.idioma.t('PETICIONES_MMPP_SMILE'), 4000);
                        }
                        callback([]);
                    }
                });
            },
            cargarGrid: function (data) {
                var self = this;

                self.dsPeticiones = new kendo.data.DataSource({
                    data: data,
                    pageSize: 100,
                    aggregate: [
                        { field: "Cantidad", aggregate: "sum" },
                        { field: "CantidadRecibida", aggregate: "sum" }
                    ],
                    schema: {
                        model: {
                            id: "IdSolicitudMision",
                            fields: {
                                'IdSolicitudMision': { type: "number" },
                                'IdTipoSolicitud': { type: "number" },
                                'TipoSolicitudDesc': { type: "string" },
                                'IdEstadoSolicitud': { type: "number" },
                                'EstadoSolicitudDesc': { type: "string" },
                                'Fuente': { type: "string" },
                                'Destino': { type: "string" },
                                'Equipo': { type: "string" },
                                'NombreEquipo': { type: "string" },
                                'Prioridad': { type: "number" },
                                'SSCC': { type: "string" },
                                'IdMaterial': { type: "string" },
                                'DescripcionMaterial': { type: "string" },
                                'EAN': { type: "string" },
                                'Cantidad': { type: "number" },
                                'CantidadRecibida': { type: "number" },
                                'EstadoCalidad': { type: "string" },
                                'NotasCambioCalidad': { type: "string" },
                                'IdEstadoSolicitudPrevio': { type: "number" },
                                'Error': { type: "string" },
                                'Creado': { type: "date" },
                                'CreadoPor': { type: "string" },
                                'Actualizado': { type: "date" },
                                'ActualizadoPor': { type: "string" },
                            }
                        }
                    }
                });

                if (self.$("#gridPeticionesMMPPSmile").data("kendoGrid")) {
                    self.$("#gridPeticionesMMPPSmile").data("kendoGrid").setDataSource(self.dsPeticiones);
                    self.resizeGrid();
                    return;
                }

                this.$("#gridPeticionesMMPPSmile").kendoGrid({
                    dataSource: self.dsPeticiones,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    sortable: true,
                    toolbarColumnMenu: true,
                    scrollable: true,
                    selectable: true,
                    detailTemplate: kendo.template(this.$("#detailTemplate").html()),
                    detailInit: function (e) {
                        self.detailInit(e, self);
                    },
                    detailExpand: function (e) {
                        //this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                        var grid = this;
                        var row = e.masterRow;
                        grid.expandRow(row);
                        self.almacenarEstadoExpansion(); // Almacenar el estado de expansión antes de expandir
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [100, 200, 500, 'All'],
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
                    dataBinding: function (e) {
                        self.resizeGrid();
                        self.iniciarActualizacionAutomatica();
                    },
                    page: function (e) {
                        self.paginaActual = e.page;
                        self._restaurarPagina = false;
                    },
                    dataBound: function (e) {
                        self.resizeGrid();
                        // Restaurar el estado (página, selección y expansión) después de cada actualización de datos
                        self.restaurarEstadoGrid();
                    },
                    columns: [
                        {
                            template: function (e) {
                                let color = "transparent";
                                let title = e.EstadoSolicitudDesc;

                                // Asignar color y título según el estado
                                switch (e.IdEstadoSolicitud) {
                                    case 1:
                                        color = "#7ed5f1"; // Azul Claro
                                        break;
                                    case 2:
                                        color = "#00008b6e"; // Azul Oscuro
                                        break;
                                    case 3:
                                        color = "#90EE90"; // Verde Claro
                                        break;
                                    case 4:
                                        color = "#04a104"; // Verde Oscuro
                                        break;
                                    case 5:
                                        color = "#c50000"; // Rojo
                                        break;
                                    case 6:
                                        color = "#FFA500"; // Naranja
                                        break;
                                    case 7:
                                        color = "#FF4500"; // Naranja Oscuro
                                        break;
                                    default:
                                        color = "#CCCCCC"; // Gris
                                }

                                return "<div class='circle_cells' title='" + title + "' style='background-color:" + color + ";'></div>";
                            },
                            width: 50,
                            attributes: { style: "text-align:center;" },
                            filterable: false,
                            title: window.app.idioma.t("ESTADO_COLORES"),
                        },
                        {
                            groupable: true,
                            title: 'Id ' + window.app.idioma.t("PETICION"),
                            field: 'IdSolicitudMision',
                            template: '#:IdSolicitudMision#',
                            width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field == "all" ?
                                        "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                        "<div><label><input type='checkbox' value='#=IdSolicitudMision#' style='width: 14px;height:14px;margin-right:5px;'/>#= IdSolicitudMision#</label></div>";
                                }
                            }
                        },
                        {
                            groupable: true,
                            title: window.app.idioma.t("TIPO"),
                            field: 'IdTipoSolicitud',
                            template: '#:IdTipoSolicitud# - #:TipoSolicitudDesc#',
                            width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field == "all" ?
                                        "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                        "<div><label><input type='checkbox' value='#=IdTipoSolicitud#' style='width: 14px;height:14px;margin-right:5px;'/>#= IdTipoSolicitud# - #= TipoSolicitudDesc#</label></div>";
                                }
                            }
                        },
                        {
                            groupable: true,
                            title: window.app.idioma.t("ESTADO"),
                            field: 'IdEstadoSolicitud',
                            template: '#:IdEstadoSolicitud# - #:EstadoSolicitudDesc#',
                            width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    var displayText = e.field === "all"
                                        ? "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>"
                                        : "<div><label><input type='checkbox' value='#= IdEstadoSolicitud #' style='width: 14px;height:14px;margin-right:5px;'/>#= IdEstadoSolicitud# - #= EstadoSolicitudDesc#</label></div>";
                                    return displayText;
                                }
                            }
                        },
                        {
                            groupable: true,
                            title: window.app.idioma.t("LINEA_ORIGEN"),
                            field: 'Fuente',
                            template: "#= IdTipoSolicitud == 1 ? '' : ObtenerLineaDescripcion(Fuente) #",
                            //template: "#= Fuente ? ObtenerLineaDescripcion(Fuente) : '' #",
                            width: 250,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field == "all" ?
                                        "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                        "<div><label><input type='checkbox' value='#= Fuente #' style='width: 14px;height:14px;margin-right:5px;'/>#= ObtenerLineaDescripcion(Fuente) #</label></div>";
                                }
                            },
                            groupHeaderTemplate: "#= value && IdTipoSolicitud != 1 ? ObtenerLineaDescripcion(value) : '' #",
                        },
                        {
                            groupable: true,
                            title: window.app.idioma.t("LINEA_DESTINO"),
                            field: 'Destino',
                            template: "#= Destino ? ObtenerLineaDescripcion(Destino) : '' #",
                            width: 250,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field == "all" ?
                                        "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                        "<div><label><input type='checkbox' value='#= Destino #' style='width: 14px;height:14px;margin-right:5px;'/>#= ObtenerLineaDescripcion(Destino) #</label></div>";
                                }
                            },
                            groupHeaderTemplate: "#= ObtenerLineaDescripcion(value) #"
                        },
                        {
                            title: window.app.idioma.t("ZONA"),
                            field: 'NombreEquipo',
                            width: 280,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field == "all" ?
                                        "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                        "<div><label><input type='checkbox' value='#=NombreEquipo#' style='width: 14px;height:14px;margin-right:5px;'/>#= NombreEquipo#</label></div>";
                                }
                            }
                        },
                        {
                            groupable: true,
                            title: window.app.idioma.t("PRIORIDAD"),
                            field: 'Prioridad',
                            width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field == "all" ?
                                        "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                        "<div><label><input type='checkbox' value='#=Prioridad#' style='width: 14px;height:14px;margin-right:5px;'/>#= Prioridad# - #= PrioridadDescripcion#</label></div>";
                                }
                            }
                        },
                        {
                            groupable: true,
                            title: "IdMaterial",
                            field: 'IdMaterial',
                            width: 120,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                            filterable: true
                        },
                        {
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                            field: 'DescripcionMaterial',
                            width: 250,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                            filterable: true
                        },
                        {
                            groupable: true,
                            title: "EAN",
                            field: 'EAN',
                            width: 150,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                            filterable: true
                        },
                        {
                            groupable: true,
                            title: "SSCC",
                            field: 'SSCC',
                            width: 120,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                            filterable: true
                        },
                        {
                            groupable: true,
                            title: window.app.idioma.t("CALIDAD"),
                            field: 'EstadoCalidad',
                            width: 120,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                            filterable: true
                        },
                        {
                            groupable: true,
                            title: window.app.idioma.t("CANTIDAD_PEDIDA"),
                            field: 'Cantidad',
                            template: '#=typeof Cantidad !== "undefined" && Cantidad !== null ?   kendo.format("{0:n0}", Cantidad) : ""#',
                            width: 150,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                            filterable: true,
                            aggregates: ["sum"],
                            groupFooterTemplate: "Total: #: kendo.toString(sum, 'n0') #"
                        },
                        {
                            groupable: true,
                            title: window.app.idioma.t("CANTIDAD_RECIBIDA"),
                            field: 'CantidadRecibida',
                            template: '#=typeof CantidadRecibida !== "undefined" && CantidadRecibida !== null ?   kendo.format("{0:n0}", CantidadRecibida) : ""#',
                            width: 150,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                            filterable: true,
                            aggregates: ["sum"],
                            groupFooterTemplate: "Total: #: kendo.toString(sum, 'n0') #"
                        },
                        {
                            hidden: true,
                            groupable: true,
                            title: window.app.idioma.t("NOTAS"),
                            field: 'NotasCambioCalidad',
                            width: 200,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                            filterable: true
                        },
                        {
                            hidden: true,
                            groupable: true,
                            title: "IdEstadoPrevio",
                            field: 'Procesado',
                            width: 120,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field === "all"
                                        ? "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>"
                                        : "<div><label><input type='checkbox' value='#=Procesado#' style='width: 14px;height:14px;margin-right:5px;'/>#= Procesado ? 'Sí' : 'No' #</label></div>";
                                }
                            }
                        },
                        {
                            groupable: true,
                            title: window.app.idioma.t("FECHA_CREACION"),
                            field: 'Creado',
                            width: 140,
                            template: '#= Creado ? kendo.toString(new Date(Creado), "dd/MM/yyyy HH:mm:ss") : "" #',
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({ format: "dd/MM/yyyy", culture: localStorage.getItem("idiomaSeleccionado") });
                                }
                            }
                        },
                        {
                            groupable: true,
                            title: 'Error',
                            field: 'Error',
                            width: 200,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                            filterable: true
                        },
                    ]

                });

                self.resizeGrid();
            },

            almacenarEstadoGrid: function () {
                var self = this;
                var grid = self.$("#gridPeticionesMMPPSmile").data("kendoGrid");
                // Guardar la página actual
                self.paginaActual = grid.dataSource.page();
                // Guardar el Id de la fila seleccionada
                var selectedRow = grid.select();
                self.filaSeleccionadaId = selectedRow.length ? grid.dataItem(selectedRow).IdSolicitudMision : null;
            },
            restaurarEstadoGrid: function () {
                var self = this;
                var grid = self.$("#gridPeticionesMMPPSmile").data("kendoGrid");
                if (!grid) return;

                // Restaurar la página 
                if (self._restaurarPagina === true && self.paginaActual != null) {
                    var ds = grid.dataSource;
                    var total = (typeof ds.total === "function") ? ds.total() : (ds.data() ? ds.data().length : 0);
                    var pageSize = (typeof ds.pageSize === "function") ? ds.pageSize() : 100;
                    var maxPage = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));

                    var targetPage = Math.min(Math.max(1, self.paginaActual), maxPage);
                    if (ds.page() !== targetPage) {
                        ds.page(targetPage);
                    }
                }

                // Restaurar fila seleccionada
                if (self.filaSeleccionadaId !== null) {
                    var dataItem = grid.dataSource.data().find(function (item) { return item.IdSolicitudMision === self.filaSeleccionadaId; });
                    if (dataItem) {
                        var row = grid.tbody.find("tr[data-uid='" + dataItem.uid + "']");
                        if (row.length) {
                            grid.select(row);
                        }
                    }
                }

                // Restaurar expansiones solo en refrescos programáticos
                if (self._restaurarPagina === true && self.expandedRows && grid) {
                    for (var i = 0; i < self.expandedRows.length; i++) {
                        var idSolicitud = self.expandedRows[i];
                        var item = grid.dataSource.data().find(function (it) { return it.IdSolicitudMision === idSolicitud; });
                        if (item) {
                            var rowExp = grid.tbody.find("tr[data-uid='" + item.uid + "']");
                            if (rowExp.length) grid.expandRow(rowExp);
                        }
                    }
                }
            },
            almacenarEstadoExpansion: function () {
                var self = this;
                var grid = self.$("#gridPeticionesMMPPSmile").data("kendoGrid");
                self.expandedRows = grid.tbody.find("tr.k-master-row").filter(function () {
                    return $(this).find(".k-hierarchy-cell .k-minus").length > 0;
                }).map(function () {
                    var dataItem = grid.dataItem(this);
                    return dataItem ? dataItem.IdSolicitudMision : null;
                }).get().filter(id => id !== null);
            },
            restaurarEstadoExpansion: function () {
                var self = this;
                var grid = self.$("#gridPeticionesMMPPSmile").data("kendoGrid");
                if (self.expandedRows && grid) {
                    for (var idSolicitud of self.expandedRows) {
                        var dataItem = grid.dataSource.data().find(item => item.IdSolicitudMision === idSolicitud);
                        if (dataItem) {
                            var row = grid.tbody.find("tr[data-uid='" + dataItem.uid + "']");
                            if (row.length) {
                                grid.expandRow(row);
                            }
                        }
                    }
                }
            },

            cargarCabecera: function () {
                var self = this;
                $("#dtpFechaDesde").kendoDateTimePicker({
                    value: self.inicio,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });
                $("#dtpFechaHasta").kendoDateTimePicker({
                    value: self.fin,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                });
            },
            detailInit: function (e, vista) {
                var self = this;
                var detailRow = e.detailRow;
                var Id = e.data.IdSolicitudMision;
                var gridDetalle = detailRow.find(".detalle");
                vista.cargarDetalle(gridDetalle, Id);
            },
            cargarDetalle: function (gridDetalle, Id) {
                var self = this;
                self.cargarCompletados(Id);
                gridDetalle.kendoGrid({
                    dataSource: self.dsDetalle,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    sortable: true,
                    resizable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            hidden: true,
                            field: "IdSolicitudMisionCompletada",
                            title: "IdSolicitudMisionCompletada",
                            width: "100px",
                        },
                        {
                            hidden: true,
                            field: "IdSolicitudMision",
                            title: "IdSolicitudMision",
                            width: "100px",
                        },
                        {
                            hidden: true,
                            field: "IdMaterial",
                            title: "IdMaterial",
                            width: "100px",
                        },
                        {
                            field: "EAN",
                            title: "EAN",
                            width: "100px",
                        },
                        {
                            field: "Proveedor",
                            title: window.app.idioma.t('PROVEEDOR'),
                            width: "100px",
                        },
                        {
                            field: "Lote",
                            title: window.app.idioma.t('LOTE'),
                            width: "100px",
                        },
                        {
                            field: "SSCC",
                            title: "SSCC",
                            width: "150px",
                        },
                        {
                            field: "UnidadesSolicitadas",
                            title: window.app.idioma.t('UNIDADES_SOLICITADAS'),
                            width: "60px",
                            template: '#=typeof UnidadesSolicitadas !== "undefined" && UnidadesSolicitadas !== null ?   kendo.format("{0:n0}", UnidadesSolicitadas) : ""#',
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                        },
                        {
                            field: "UnidadesRepuestas",
                            title: window.app.idioma.t('UNIDADES_SUMINISTRADAS'),
                            width: "60px",
                            template: '#=typeof UnidadesRepuestas !== "undefined" && UnidadesRepuestas !== null ?   kendo.format("{0:n0}", UnidadesRepuestas) : ""#',
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD"),
                            field: 'Cantidad',
                            width: "60px",
                            template: '#=typeof Cantidad !== "undefined" && Cantidad !== null ?   kendo.format("{0:n0}", Cantidad) : ""#',
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                        },
                        {
                            field: "EstadoCalidad",
                            title: window.app.idioma.t('CALIDAD'),
                            width: "60px",
                        },
                        {
                            field: "FechaProduccion",
                            title: window.app.idioma.t('FECHA_PRODUCCION'),
                            width: "150px",
                            format: "{0:yyyy-MM-dd}"
                        },
                        {
                            field: "FechaCaducidad",
                            title: window.app.idioma.t('FECHA_CADUCIDAD'),
                            width: "150px",
                            format: "{0:yyyy-MM-dd}"
                        }
                    ]

                });
            },
            cargarCompletados: function (IdSolicitud) {
                let self = this;
                var dsDetalle = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerSolicitudCompletadaSmile/" + IdSolicitud,
                            dataType: "json"
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            fields: {
                                IdSolicitudMisionCompletada: { type: "number" },
                                IdSolicitudMision: { type: "number" },
                                UnidadesRepuestas: { type: "number" },
                                UnidadesSolicitadas: { type: "number" },
                                SSCC: { type: "string" },
                                IdMaterial: { type: "string" },
                                EAN: { type: "string" },
                                Proveedor: { type: "string" },
                                Lote: { type: "string" },
                                Cantidad: { type: "number" },
                                EstadoCalidad: { type: "string" },
                                FechaProduccion: { type: "date" },
                                FechaCaducidad: { type: "date" },
                                Creado: { type: "date" },
                                CreadoPor: { type: "string" },
                                Actualizado: { type: "date" },
                                ActualizadoPor: { type: "string" }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.status === 403 && e.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'ObtenerSolicitudCompletadaSmile', 4000);
                        }
                    },
                });

                self.dsDetalle = dsDetalle;
            },
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnEliminar': 'confirmarCancelar',
            },
            actualiza: function () {
                var self = this;
                self.inicio = $("#dtpFechaDesde").data("kendoDateTimePicker").value();
                self.fin = $("#dtpFechaHasta").data("kendoDateTimePicker").value();

                if (!self.inicio || !self.fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LAS_FECHAS_INTRODUCIDAS'), 3000);
                    return;
                }
                if (self.inicio > self.fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('_LA_FECHA'), 3000);
                    return;
                }

                self.numLinea = (window.app && window.app.lineaSel && window.app.lineaSel.id) ? window.app.lineaSel.id : null;

                // Forzar ir a la primera página al cambiar el rango de fechas
                var grid = $("#gridPeticionesMMPPSmile").data("kendoGrid");
                if (grid && grid.dataSource && typeof grid.dataSource.page === "function") {
                    grid.dataSource.page(1);
                }

                self.actualizarGrid();
            },
            iniciarActualizacionAutomatica: function () {
                var self = this;
                if (!self.actualizacionIntervalo) {
                    self.actualizacionIntervalo = setInterval(function () {
                        self.actualizarGrid();
                    }, 120000); // cada 120 segundos
                }
            },
            detenerActualizacionAutomatica: function () {
                var self = this;
                if (self.actualizacionIntervalo) {
                    clearInterval(self.actualizacionIntervalo);
                    self.actualizacionIntervalo = null;
                }
            },
            resizeGrid: function () {
                // Calcular alturas disponibles y ajustar el grid y su contenido
                var centerPaneHeight = $("#center-pane").innerHeight() || $(window).height();
                var cabeceraHeight = $("#divCabeceraVista").outerHeight(true) || 0;
                var filtrosHeaderHeight = $("#divFiltrosHeader").outerHeight(true) || 0;

                var contenidoVistaHeight = centerPaneHeight - cabeceraHeight - filtrosHeaderHeight;
                if (contenidoVistaHeight < 100) contenidoVistaHeight = 100;
                $("#divContenidoVista").height(contenidoVistaHeight);

                $("#gridPeticionesMMPPSmile").height(contenidoVistaHeight);

                var grid = $("#gridPeticionesMMPPSmile").data("kendoGrid");
                if (grid) grid.resize();
            },
            render: function () {
                var self = this;
                $(self.el).html(self.template());
                $("#center-pane").append($(self.el));

                self.cargarCabecera();

                self.cargarDatos(function (data) {
                    self.cargarGrid(data);
                });

                $(window).off("resize.gridPeticionesMMPPSmile").on("resize.gridPeticionesMMPPSmile", function () {
                    self.resizeGrid();
                });
            },
            confirmarCancelar: function (e) {
                e.preventDefault();
                var self = this;

                var permiso = TienePermiso(388);
                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $("#gridPeticionesMMPPSmile").data("kendoGrid");
                var selectedRow = grid.select();

                if (selectedRow.length === 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                var dataItem = grid.dataItem(selectedRow);

                if (dataItem && dataItem.IdSolicitudMision) {
                    var idSolicitudMision = dataItem.IdSolicitudMision;

                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('CANCELAR') + ' ' + window.app.idioma.t('PETICION'),
                        msg: window.app.idioma.t('CANCELAR_MISION'),
                        funcion: function () {
                            Backbone.trigger('eventCierraDialogo');

                            self.cancelar(idSolicitudMision).then((result) => {
                                if (result == true) {
                                    self.actualizarGrid();
                                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('CANCELADA'), 4000);
                                } else {
                                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('CANCELAR'), 4000);
                                }
                            });
                        },
                        contexto: this
                    });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                }
            },
            cancelar: async function (idSolicitudMision) {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "PATCH",
                        url: "../api/ActualizarEstadoPeticionSmile/" + idSolicitudMision + "/6", // Pasamos 6 que es "Cancelando"
                        dataType: 'json',
                        success: function (result) {
                            resolve(result);
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('CANCELAR'), 4000);
                            }
                            reject(false);
                        }
                    });
                });
            },
            actualizarGrid: function () {
                var self = this;
                var $gridEl = $("#gridPeticionesMMPPSmile");
                var grid = $gridEl.data("kendoGrid");

                // NO sincronizamos con window.app aquí: usamos la línea tomada en initialize/actualiza
                if (!grid) {
                    self.cargarDatos(function (data) { self.cargarGrid(data); });
                    return;
                }

                self._restaurarPagina = true;
                self.almacenarEstadoGrid();

                var ds = grid.dataSource;
                var currentFilter = ds.filter();
                var currentSort = ds.sort();
                var currentGroup = ds.group();
                var previousPage = ds.page();
                var previousPageSize = (typeof ds.pageSize === "function") ? ds.pageSize() : (ds.options && ds.options.pageSize) || 100;

                kendo.ui.progress($gridEl, true);

                self.cargarDatos(function (data) {
                    try {
                        ds.data(data || []);

                        if (currentFilter) ds.filter(currentFilter);
                        if (currentSort) ds.sort(currentSort);
                        if (currentGroup) ds.group(currentGroup);

                        if (typeof ds.pageSize === "function" && previousPageSize) {
                            ds.pageSize(previousPageSize);
                        }

                        var total = (typeof ds.total === "function") ? ds.total() : (data ? data.length : 0);
                        var pageSize = (typeof ds.pageSize === "function") ? ds.pageSize() : previousPageSize || 100;
                        var maxPage = Math.max(1, Math.ceil((total || 0) / (pageSize || 1)));

                        var targetPage = 1;
                        if (self.paginaActual && self.paginaActual >= 1 && self.paginaActual <= maxPage) {
                            targetPage = self.paginaActual;
                        } else if (previousPage && previousPage >= 1 && previousPage <= maxPage) {
                            targetPage = previousPage;
                        }

                        if (typeof ds.page === "function") {
                            ds.page(targetPage);
                        }

                        if (typeof grid.refresh === "function") grid.refresh();
                        if (grid.pager && typeof grid.pager.refresh === "function") grid.pager.refresh();
                    } catch (err) {
                        console.error("actualizarGrid error:", err);
                    } finally {
                        kendo.ui.progress($gridEl, false);
                        try { self.restaurarEstadoGrid(); } catch (_) { }
                        self._restaurarPagina = false;
                    }
                });
            },
            eliminar: function () {
                this.detenerActualizacionAutomatica();
                this.remove();
            },
        });

        return gridPeticionesMMPPSmile;
    });