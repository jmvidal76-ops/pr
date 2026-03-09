define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/GestionWOActivas.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones',
    'vistas/Fabricacion/vVerDetallesOrden', 'definiciones', 'vistas/Fabricacion/vCrearWOManual'],
    function (_, Backbone, $, PlantillaGestionWOActivas, VistaDlgConfirm, Not, vVerDetallesOrden, definiciones, VistaCrearWO) {
        var gridGestionWOActivas = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            IdEstadoWO: definiciones.IdEstadoWO(),
            ds: null,
            grid: null,
            filaExpand: null,
            tabAbierto: null,
            vistaFormWO: null,
            tipoWOSeleccionada: null,
            tiposWO: definiciones.TipoWO(),
            estadosKOP: definiciones.EstadoKOP(),
            poType: '',
            template: _.template(PlantillaGestionWOActivas),
            initialize: function () {
                Backbone.on('eventActualizarListadoWOFAB', this.actualiza, this);
                var self = this;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                var params = $("a.k-link.k-state-selected").text().split(' ');
                this.filtraGrid(params[params.length - 1]).then(() => {
                    self.render();
                });
            },
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))
                var self = this;

                kendo.ui.progress($("#gridGestionWOActivas"), true);

                self.grid = $("#gridGestionWOActivas").kendoGrid({
                    dataSource: self.ds,
                    groupable: {
                        messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') },
                        sort: {
                            dir:"desc"
                        }
                    },
                    sortable: true,
                    selectable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    toolbar: [{
                        text: window.app.idioma.t('CREAR_WO_MANUAL'),
                        template: function () {
                            if (self.tipoWOSeleccionada == self.tiposWO.Coccion) {
                                if (TienePermiso(72)) {
                                    return "<a id='btnCrearWO' class= 'k-button k-button-icontext k-grid-add' style='background-color:green;color:white;'> <span class='k-icon k-add'></span>" + window.app.idioma.t('CREAR_WO_MANUAL') + "</a>"
                                } else {
                                    return ""
                                }
                            } else {
                                return ""
                            }
                        }
                    },
                    {
                        text: window.app.idioma.t('QUITAR_FILTROS'),
                        template: "<a id='btnLimpiarFiltros' class='k-button k-button-icontext k-i-delete'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</a>"
                    }],
                    columns: [
                        {
                            template: function (e) {
                                return "<div class='circle_cells' style='background-color:" + e.ColorEstadoKOP + ";'/>";
                            },
                            field: 'DescEstadoKOP',
                            width: 80,
                            title: window.app.idioma.t("KOP"),
                            attributes: { style: "text-align:center;" },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=DescEstadoKOP#' style='width: 14px;height:14px;margin-right:5px;'/><img id='ColorEstadoKOP' style='width: 11px; height: 11px; vertical-align: initial;margin-right: 3px; background-color:#=ColorEstadoKOP#;'></img>#=DescEstadoKOP#</label></div>";
                                    }
                                }
                            },
                            groupable: true
                        },
                        {
                            template: function (e) {
                                let title = window.app.idioma.t("ESTADO_LIMS_" + e.IdEstadoLIMS) || "";
                                return "<div class='circle_cells' title='"+ title +"' style='background-color:" + e.ColorEstadoLIMS + ";'/>"
                            },
                            width: 50,
                            title: window.app.idioma.t("LIMS"),
                            attributes: { style: "text-align:center;" },
                            groupable: false
                        },
                        {
                            field: "NotasWO",
                            title: " ",
                            width: 25,
                            filterable: false,
                            attributes: { style: "text-align:center;" },
                            template: '<img id="imgDesc" src="../Portal/img/round_comment_notification.png" style="width: 16px !important; height:16px !important;#if(!NotasWO){# display:none;#}#">',
                            groupable: false
                        },
                        {
                            title: window.app.idioma.t("DETALLES"),
                            template: "<button id='#=IdWO#' type='button' data-funcion='FAB_PROD_EXE_9_VisualizacionWoActivas FAB_PROD_EXE_9_GestionWoActivas' class='k-button btnVerDetalles' style='min-width:16px;'>" + window.app.idioma.t('DETALLES') + "</button>",
                            width: 80,
                            attributes: { style: "text-align:center;" },
                            groupable: false
                        },
                        {
                            field: "IdWO",
                            hidden: true
                        },
                        {
                            field: "CodWO",
                            title: window.app.idioma.t("IDORDEN"),
                            width: 180,
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            sortable: {
                                compare: function (a, b) {
                                    if (typeof a != undefined && typeof b != undefined) {
                                        return parseInt(a.CodWO.split('-')[4] + a.CodWO.split('-')[5]) - parseInt(a.CodWO.split('-')[4] + b.CodWO.split('-')[5]);
                                    }
                                }
                            },
                            groupable: false
                        },
                        {
                            field: "DescTipoWO",
                            title: window.app.idioma.t("ORDEN"),
                            width: 90,
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=DescTipoWO#' style='width: 14px;height:14px;margin-right:5px;'/>#=DescTipoWO#</label></div>";
                                    }
                                }
                            },
                            groupable: false
                        },
                        {
                            field: "DescEstadoWO",
                            template: function (e) {
                                //return "<img id='imgEstadoOP' src='img/KOP_" + e.SemaforoWo + ".png'></img> " + window.app.idioma.t(e.EstadoActual.replace(" ", "_").toUpperCase())
                                return "<div class='circle_cells' style='background-color:" + e.ColorEstadoWO + ";'></div><div class='circle_desc'>" + e.DescEstadoWO + "</div>"
                            },
                            title: window.app.idioma.t("ESTADO"),
                            width: 170,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescEstadoWO#' style='width: 14px;height:14px;margin-right:5px;'/><img id='ColorEstadoWO' style='width: 11px; height: 11px; vertical-align: initial;margin-right: 3px; background-color:#=ColorEstadoWO#;'></img>#=DescEstadoWO#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            groupable: true
                        },
                        {
                            title: window.app.idioma.t("UBICACION"),
                            field: "UbicacionTexto",
                            width: 120,
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            groupable: true
                        },
                        {
                            title: window.app.idioma.t("CERRAR_ORDEN"),
                            width: 40,
                            filterable: false,
                            attributes: { style: "text-align:center;" },
                            template: function (e) {
                                return "<div id='divEst" + e.IdWO + "' ><input data-funcion='FAB_PROD_EXE_9_GestionWoActivas' type='image' id='btnEst" + e.IdWO + "' class='btnCambiaEstado' src='img/cerrarOrden.png' style='border:0' /></div>"
                            },
                            groupable: false
                        },
                        {
                            field: "IdMaterial",
                            title: window.app.idioma.t("MATERIAL"),
                            width: 170,
                            template: "#=IdMaterial + ' - ' + DescMaterial#",
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=IdMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#=IdMaterial + ' - ' + DescMaterial#</label></div>";
                                    }
                                }
                            },
                            groupable: true
                        },
                        {
                            field: "CzaBarril",
                            title: window.app.idioma.t("TIPO_CERVEZA"),
                            width: 100,
                            hidden: self.tipoWOSeleccionada != self.tiposWO.Prellenado,
                            template: function (dataItem) {
                                let html = '';

                                if (dataItem.CzaBarril == 'B/L') {
                                    html = "<span style='color:orange'>" + dataItem.CzaBarril + "</span>";
                                } else if (dataItem.CzaBarril == 'Barril') {
                                    html = "<span style='color:green'>" + dataItem.CzaBarril + "</span>";
                                } else {
                                    html = "<span>" + dataItem.CzaBarril + "</span>";
                                }

                                return html;
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=CzaBarril#' style='width: 14px;height:14px;margin-right:5px;'/>#= CzaBarril#</label></div>";
                                    }
                                }
                            },
                            groupable: true
                        },
                        {
                            field: "CantidadReal",
                            title: window.app.idioma.t("CANTIDAD"),
                            width: 110,
                            template: "#=(CantidadReal == 0 ? 0 : kendo.toString(CantidadReal, 'n3')) + ' ' + UdMedida#",
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            groupable: false
                        },
                        {
                            field: "Anio",
                            title: window.app.idioma.t("ANYO"),
                            width: 75,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Anio#' style='width: 14px;height:14px;margin-right:5px;'/>#=Anio#</label></div>";
                                    }
                                }
                            },
                            groupable: true
                        },
                        {
                            field: "NOrigen",
                            title: window.app.idioma.t("NUMERO_ORIGEN"),
                            width: 70,
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            groupable: false
                        },
                        {
                            field: "FechaInicioPlan",
                            title: window.app.idioma.t("INICIO_PLANIFICADO"),
                            width: 100,
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            hidden: self.tipoWOSeleccionada == self.tiposWO.Fermentacion || self.tipoWOSeleccionada == self.tiposWO.Guarda || self.tipoWOSeleccionada == self.tiposWO.Concentrado  ? true : false,
                            format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                            template: function (e) { return e.FechaInicioPlan == null ? "" : kendo.toString(kendo.parseDate(e.FechaInicioPlan), kendo.culture().calendars.standard.patterns.MES_FechaHora); },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupable: false
                        },
                        {
                            field: "FechaInicioReal",
                            title: window.app.idioma.t("INICIO_REAL"),
                            width: 100,
                            format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                            template: function (e) { return e.FechaInicioReal == null ? "" : kendo.toString(kendo.parseDate(e.FechaInicioReal), kendo.culture().calendars.standard.patterns.MES_FechaHora); },
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupable: false
                        },
                        {
                            field: "FechaFinPlan",
                            title: window.app.idioma.t("FIN_PLANIFICADO"),
                            width: 100,
                            hidden: self.tipoWOSeleccionada == self.tiposWO.Fermentacion || self.tipoWOSeleccionada == self.tiposWO.Guarda || self.tipoWOSeleccionada == self.tiposWO.Concentrado ? true : false,
                            format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                            template: function (e) { return e.FechaFinPlan == null ? "" : kendo.toString(kendo.parseDate(e.FechaFinPlan), kendo.culture().calendars.standard.patterns.MES_FechaHora); },
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupable: false
                        },
                        {
                            field: "FechaFinReal",
                            title: window.app.idioma.t("FIN_REAL"),
                            width: 100,
                            format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                            template: function (e) { return e.FechaFinReal == null ? "" : kendo.toString(kendo.parseDate(e.FechaFinReal), kendo.culture().calendars.standard.patterns.MES_FechaHora); },
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupable: false
                        }
                    ],
                    dataBound: function () {
                        var data = this._data;
                        var color = "";

                        for (var x = 0; x < data.length; x++) {
                            var dataItem = data[x];
                            var id = dataItem.IdWO;
                            var idEstado = dataItem.IdEstadoWO;
                            var estado = dataItem.DescEstadoWO;

                            if (idEstado !== self.IdEstadoWO.Consolidando_datos) {
                                $("#divEst" + id).hide();
                            }
                        }

                        if (!TienePermiso(72)) {
                            $("#btnCrearWO").remove();
                        }

                        kendo.ui.progress($("#gridGestionWOActivas"), false);

                        self.resizeGrid();
                        $('[data-funcion]').checkSecurity();
                    },
                    dataBinding: function (e) {
                        var data = this.dataSource;
                        var group = data.group();
                        if (group.length >= 1) {
                            $('.k-group-indicator').data().dir = 'desc';
                        }
                    }
                });

                this.$('#gridGestionWOActivas').kendoTooltip({
                   filter: ".tooltipText",
                    position: "auto",
                    width: 'auto',
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

                this.$('#gridGestionWOActivas').kendoTooltip({
                    filter: "#imgDesc",
                    position: "auto",
                    width: 'auto',
                    content: function (e) {
                        var grid = $("#gridGestionWOActivas").data("kendoGrid");
                        var dataItem = grid.dataItem(e.target.closest("tr"));
                        var des = dataItem["NotasWO"];
                        var parser = new DOMParser;
                        var dom = parser.parseFromString('<!doctype html><body>' + des, 'text/html');
                        var decodedString = dom.body.textContent;
                        if (des) {
                            return decodedString;
                        } else {
                            return window.app.idioma.t('SIN_DESCRIPCION');
                        }
                    }
                }).data("kendoTooltip");

                window.app.headerGridTooltip(self.grid.data("kendoGrid"));

                //Se pone en la url la pantalla de inicio, para caundo se pulse en el menú la misma vista
                //se recargue con la nueva condición
                window.location.hash = "Inicio";
            },
            eliminar: function () {
                this.remove();
            },
            resizeGrid: function () {

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltros").innerHeight();

                var gridElement = $("#gridGestionWOActivas"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            },
            events: {
                'click .btnVerDetalles': 'verDetalles',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnCrearWO': 'CrearWOManual',
                'click .btnCambiaEstado': 'CierraOrden',
                'click #lblCabeceraListadoWO': 'RegresarListadoWO'
            },
            obtenerIdMenu: function (nombre) {
                switch (nombre) {
                    case window.app.idioma.t('COCCION'):
                        return this.tiposWO.Coccion;
                    case window.app.idioma.t('FERMENTACION'):
                        return this.tiposWO.Fermentacion;
                    case window.app.idioma.t('TRASIEGO'):
                        return this.tiposWO.Trasiego;
                    case window.app.idioma.t('GUARDA'):
                        return this.tiposWO.Guarda;
                    case window.app.idioma.t('FILTRACION'):
                        return this.tiposWO.Filtracion;
                    case window.app.idioma.t('CONCENTRADO'):
                        return this.tiposWO.Concentrado;
                    case window.app.idioma.t('PRELLENADO'):
                        return this.tiposWO.Prellenado;
                    default:
                        return "0";
                }
            },
            filtraGrid: function (tipo) {
                var self = this;
                return new Promise((resolve, reject) => {
                    self.ObtenerTipoOrden(tipo).then((ordersType) => {
                        if (ordersType) {
                            if (self.ds === null)
                                self.GenerarDataSourceListadoWOActivas(self, self.obtenerIdMenu(tipo));
                            else {
                                self.ds.transport.options.read.url = "../api/OrdenesFab/ObtenerListadoOrdenes/" + ordersType;
                            }
                            resolve();
                        }

                    });
                });
            },
            GenerarDataSourceListadoWOActivas: function (self, ordersType) {
                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/OrdenesFab/ObtenerListadoOrdenes/" + ordersType,
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "IdWO",
                            fields: {
                                'IdWO': { type: "number" },
                                'CodWO': { type: "string" },
                                'LoteMES': { type: "string" },
                                'FechaInicioPlan': { type: "date" },
                                'FechaFinPlan': { type: "date" },
                                'CantidadPlan': { type: "number" },
                                'FechaInicioReal': { type: "date" },
                                'FechaFinReal': { type: "date" },
                                'CantidadReal': { type: "number" },
                                'NotasWO': { type: "string" },
                                'IdUbicacion': { type: "number" },
                                'NombreUbicacion': { type: "string" },
                                'NombreZona': { type: "string" },
                                'DescUbicacion': { type: "string" },
                                'IdTipoWO': { type: "number" },
                                'DescTipoWO': { type: "string" },
                                'IdEstadoWO': { type: "number" },
                                'DescEstadoWO': { type: "string" },
                                'ColorEstadoWO': { type: "string" },
                                'IdEstadoLIMS': { type: "number" },
                                'DescEstadoLIMS': { type: "string" },
                                'ColorEstadoLIMS': { type: "string" },
                                'IdMaterial': { type: "string" },
                                'DescMaterial': { type: "string" },
                                'UdMedida': { type: "string" },
                                'IdEstadoKOP': { type: "number" },
                                'ColorEstadoKOP': { type: "string" },
                                'DescEstadoKOP': { type: "string" },
                                'Recalcular': { type: 'bool' },
                                'FechaActualizado': { type: "date" },
                                'Anio': { type: "number" },
                                'NOrigen': { type: "number" },
                            },
                        },
                        parse: function (response) {
                            response.forEach(function (x) {
                                if (x.Recalcular) {
                                    x.DescEstadoWO = window.app.idioma.t("RECALCULAR");
                                    x.ColorEstadoWO = "#f77918";
                                }

                                x.UbicacionTexto = (ordersType === self.tiposWO.Coccion ||
                                    ordersType === self.tiposWO.Trasiego ||
                                    ordersType === self.tiposWO.Filtracion) ? x.NombreZona : x.NombreUbicacion;
                            });

                            return response;
                        }
                    }
                });
                self.tipoWOSeleccionada = ordersType;
            },
            ObtenerTipoOrden: function (tipo) {
                return new Promise((resolve, reject) => {
                    if (tipo === window.app.idioma.t('GESTION_WO')) {
                        $.ajax({
                            type: "POST",
                            async: false,
                            url: "../api/GetAllOrderTypes",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function (texto) {
                                resolve(texto);
                            },
                            error: function (response) {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_SE_HAN_PODIDO'), 4000);
                                reject();
                            }
                        });
                    } else {
                        $.ajax({
                            type: "POST",
                            async: false,
                            url: "../api/GetOrderType",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            data: JSON.stringify(this.obtenerIdMenu(tipo)),
                            success: function (texto) {
                                resolve(texto);
                            },
                            error: function (response) {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_SE_HA_PODIDO_OBTENER'), 4000);
                                reject();
                            }
                        });
                    }
                });
            },
            CierraOrden: function (e) {
                var self = this;
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('CERRAR_ORDEN')
                    , msg: window.app.idioma.t('DESEA_REALMENTE_CERRAR'), funcion: function () { self.confirmaCierre(e); }, contexto: this
                });
            },
            confirmaCierre: function (e) {
                var self = this;
                var row = $(e.target.parentNode.parentNode).closest("tr");
                var dataItem = $("#gridGestionWOActivas").data('kendoGrid').dataItem(row);
                var pkOrden = dataItem.IdWO;

                let data = {
                    codWO: dataItem.CodWO,
                    estado: dataItem.DescEstadoWO
                }

                $.ajax({
                    type: "GET",
                    async: true,
                    url: "../api/OrdenesFab/CerrarOrden/" + parseInt(pkOrden),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: data,
                    success: function (result) {
                        self.ds.read();
                        Backbone.trigger('eventCierraDialogo');
                        if (result) {
                            //Backbone.trigger('eventActualizarListadoWOFAB');
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ORDEN_CERRADA'), 4000);
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CERRANDO_LA'), 4000);
                        }
                    },
                    error: function (response) {
                        Backbone.trigger('eventCierraDialogo');
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), response, 4000);
                    }
                });
            },
            verDetalles: function (e) {
                var self = this;
                var grid = $("#gridGestionWOActivas").data("kendoGrid");
                var item = grid.dataSource.get(e.currentTarget.id);
                var currentRow = grid.tbody.find("tr[data-uid='" + item.uid + "']");
                var data = grid.dataItem(currentRow);

                new vVerDetallesOrden(data, true, data.IdTipoWO);

                $("#gridGestionWOActivas").hide();
            },
            RegresarListadoWO: function () {
                var self = this;
                $("#gridGestionWOActivas > div.k-pager-wrap.k-grid-pager.k-widget.k-floatwrap > a.k-pager-refresh.k-link").click();
                var doubleSibling = document.getElementById("gridGestionWOActivas").nextSibling.nextSibling;
                var nextSibling = doubleSibling ? doubleSibling : document.getElementById("gridGestionWOActivas").nextSibling;
                if (nextSibling)
                    nextSibling.remove();

                $("#gridGestionWOActivas").show();
                $("#lblCabeceraDetalle").hide();
                document.getElementById("lblCabeceraListadoWO").style.textDecoration = "";
                document.getElementById("lblCabeceraListadoWO").style.cursor = "";
            },
            LimpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            CrearWOManual: function () {
                var self = this;
                kendo.ui.progress($("#center-pane"), true);
                self.vistaFormWO = new VistaCrearWO(self.tipoWOSeleccionada);
            },
            actualiza: function () {
                var self = this;
                self.ds.read();
            }
        });

        return gridGestionWOActivas;
    });