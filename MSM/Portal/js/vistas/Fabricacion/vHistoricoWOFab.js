define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/HistoricoWOFab.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones'
    , 'vistas/Fabricacion/vVerDetallesOrden', 'definiciones'],
    function (_, Backbone, $, PlantillaGestionWOActivas, VistaDlgConfirm, Not, vVerDetallesOrden, definiciones) {
        var gridGestionWOHistorico = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            inicio: new Date((new Date()).getTime() - (15 * 24 * 3600 * 1000)),
            fin: new Date(),
            mensaje: null,
            filaExpand: null,
            tabAbierto: null,
            poType: '',
            tiposWO: definiciones.TipoWO(),
            template: _.template(PlantillaGestionWOActivas),
            initialize: function () {
                Backbone.on('eventActualizarListadoWOFAB', this.actualiza, this);
                var self = this;
                self.ds = self.getDataSource(self);
                self.render();
            },
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))
                var self = this;

                //Cargamos las fechas
                $("#dtpFechaInicio").kendoDatePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: self.inicio
                });

                $("#dtpFechaFin").kendoDatePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: self.fin
                });

                self.cargarGrid(self);
                $("#gridGestionWOHistorico").hide();
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

                var gridElement = $("#gridGestionWOHistorico"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 40);
            },
            events: {
                'click .btnVerDetalles': 'verDetalles',
                'click #btnFiltrar': 'Actualizar',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #lblCabeceraListadoWO': 'RegresarListadoWO'
            },
            Actualizar: function () {
                var self = this;
                self.inicio = $("#dtpFechaInicio").data("kendoDatePicker").value();
                self.fin = fechaHasta = $("#dtpFechaFin").data("kendoDatePicker").value()

                if (self.ValidarFechas(self.inicio, self.fin)) {
                    //self.Actualiza(self);
                    if (self.ds.page() != 1) {
                        self.ds.page(1);
                    }
                    self.ds.read();
                    $("#gridGestionWOHistorico").show();
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), self.mensaje, 4000);
                }
            },
            LimpiarFiltroGrid: function () {
                var self = this;
                self.ds.filter({});
            },
            ValidarFechas(inicio, fin) {
                var self = this;

                if ((inicio == "" || inicio == null) && (fin == "") || fin == null) {
                    self.mensaje = window.app.idioma.t('SELECCIONE_FECHAS');
                    return false;
                }

                if (inicio == "" || inicio == null) {
                    self.mensaje = window.app.idioma.t('SELECCIONE_FECHAS');
                    return false;
                }

                if (fin == "" || fin == null) {
                    self.mensaje = window.app.idioma.t('SELECCIONE_FECHAS');
                    return false;
                }

                if (Date.parse(inicio) > Date.parse(fin)) {
                    self.mensaje = window.app.idioma.t('ERROR_FECHA_FIN_MENOR_INICIO');
                    return false;
                }

                return true;
            },
            //Actualiza: function (self) {
            //    $("form.k-filter-menu button[type='reset']").trigger("click");
            //    self.inicio = $("#dtpFechaInicio").data("kendoDatePicker").value();
            //    self.fin = $("#dtpFechaFin").data("kendoDatePicker").value()
            //    self.ds = self.getDataSource(self);
            //    $("#gridGestionWOHistorico").data('kendoGrid').setDataSource(self.ds);
            //    self.ds.page(1);
            //},
            getDataSource: function (self) {
                var ds = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/OrdenesFab/ObtenerListadoOrdenesCerradas/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.fInicio = self.inicio;
                                result.fFin = self.fin;

                                return JSON.stringify(result);
                            }

                           // return kendo.stringify(options);
                        }
                    },
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
                                'DescUbicacion': { type: "string" },
                                'IdTipoWO': { type: "number" },
                                'DescTipoWO': { type: "string" },
                                'IdEstadoWO': { type: "number" },
                                'DescEstadoWO': { type: "string" },
                                'ColorEstadoWO': { type: "string" },
                                'IdEstadoLIMS': { type: "number" },
                                'DescEstadoLIMS': { type: "string" },
                                'ColorEstadoLIMS': { type: "string" },
                                'NCoccion': { type: "number" },
                                'ExtractoSeco': { type: "string" },
                                'EficienciaCoccion': { type: "string" },
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
                        }
                    }
                });

                return ds;
            },
            cargarGrid: function (self) {
                kendo.ui.progress($("#gridGestionWOHistorico"), true);

                self.grid = $("#gridGestionWOHistorico").kendoGrid({
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    dataSource: self.ds,
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
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    columns: [
                        {
                            template: function (e) {
                                return "<div class='circle_cells' style='background-color:" + e.ColorEstadoKOP + ";'/>";
                            },
                            field: 'DescEstadoKOP',
                            width: "50px",
                            title: window.app.idioma.t("KOPS"),
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
                            width: "50px",
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
                            template: "<button id='#=IdWO#' type='button' data-funcion='FAB_PROD_EXE_9_VisualizacionWoActivas FAB_PROD_EXE_9_GestionWoActivas' class='k-button btnVerDetalles' style='min-width:16px;'>" + window.app.idioma.t('DETALLES') + "</button>",
                            width: "100px",
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
                            width: 170,
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
                            width: 200,
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
                            field: "NombreUbicacion",
                            width: 120,
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            groupable: true
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
                            width: 80,
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
                    dataBound: onDataBoundWO
                });
                function onDataBoundWO() {
                    kendo.ui.progress($("#gridGestionWOHistorico"), false);
                    self.resizeGrid();
                    $('[data-funcion]').checkSecurity();
                }

                this.$('#gridGestionWOHistorico').kendoTooltip({
                    filter: ".tooltipText",
                    position: "auto",
                    width: 'auto',
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

                this.$('#gridGestionWOHistorico').kendoTooltip({
                    filter: "#imgDesc",
                    position: "auto",
                    width: 'auto',
                    content: function (e) {
                        var grid = $("#gridGestionWOHistorico").data("kendoGrid");
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
            },
            //obtenerIdMenu: function (nombre) {
            //    switch (nombre) {
            //        case window.app.idioma.t('COCCION'):
            //            return this.tiposWO.Coccion;
            //        case window.app.idioma.t('FERMENTACION'):
            //            return this.tiposWO.Fermentacion;
            //        case window.app.idioma.t('TRASIEGO'):
            //            return this.tiposWO.Trasiego;
            //        case window.app.idioma.t('GUARDA'):
            //            return this.tiposWO.Guarda;
            //        case window.app.idioma.t('FILTRACION'):
            //            return this.tiposWO.Filtración;
            //        case window.app.idioma.t('PRELLENADO'):
            //            return this.tiposWO.Prellenado;
            //        default:
            //            return "0";
            //    }
            //},
            //filtraGrid: function (tipo) {
            //    var self = this;
            //    return new Promise((resolve, reject) => {
            //        self.ObtenerTipoOrden(tipo).then((ordersType) => {
            //            if (ordersType) {
            //                if (self.ds === null)
            //                    self.GenerarDataSourceListadoWOActivas(self, self.obtenerIdMenu(tipo));
            //                else {
            //                    self.ds.transport.options.read.url = "../api/OrdenesFab/GetHistoricoWO/" + self.obtenerIdMenu(tipo);
            //                }
            //                resolve();
            //            }

            //        });
            //    });
            //},
            //GenerarDataSourceListadoWOActivas: function (self, ordersType) {
            //    self.ds = new kendo.data.DataSource({
            //        transport: {
            //            read: {
            //                url: "../api/OrdenesFab/ObtenerListadoOrdenesCerradas",
            //                dataType: "json",
            //                contentType: "application/json; charset=utf-8",
            //                type: "POST"
            //            }
            //        },
            //        pageSize: 50,
            //        schema: {
            //            model: {
            //                id: "IdWO",
            //                fields: {
            //                    'IdWO': { type: "number" },
            //                    'CodWO': { type: "string" },
            //                    'LoteMES': { type: "string" },
            //                    'FechaInicioPlan': { type: "date" },
            //                    'FechaFinPlan': { type: "date" },
            //                    'CantidadPlan': { type: "number" },
            //                    'FechaInicioReal': { type: "date" },
            //                    'FechaFinReal': { type: "date" },
            //                    'CantidadReal': { type: "number" },
            //                    'NotasWO': { type: "string" },
            //                    'IdUbicacion': { type: "number" },
            //                    'NombreUbicacion': { type: "string" },
            //                    'DescUbicacion': { type: "string" },
            //                    'IdTipoWO': { type: "number" },
            //                    'DescTipoWO': { type: "string" },
            //                    'IdEstadoWO': { type: "number" },
            //                    'DescEstadoWO': { type: "string" },
            //                    'ColorEstadoWO': { type: "string" },
            //                    'IdEstadoLIMS': { type: "number" },
            //                    'DescEstadoLIMS': { type: "string" },
            //                    'ColorEstadoLIMS': { type: "string" },
            //                    'NCoccion': { type: "number" },
            //                    'ExtractoSeco': { type: "string" },
            //                    'EficienciaCoccion': { type: "string" },
            //                    'IdMaterial': { type: "string" },
            //                    'DescMaterial': { type: "string" },
            //                    'UdMedida': { type: "string" },
            //                    'IdEstadoKOP': { type: "number" },
            //                    'ColorEstadoKOP': { type: "string" },
            //                    'DescEstadoKOP': { type: "string" },
            //                    'Recalcular': { type: 'bool' },
            //                    'FechaActualizado': { type: "date" },
            //                },
            //            },
            //        },
            //        sort: { field: "FecInicio", dir: "desc" }
            //    });
            //},
            //ObtenerTipoOrden: function (tipo) {
            //    return new Promise((resolve, reject) => {
            //        if (tipo === window.app.idioma.t('HISTÓRICO_DE_WO_FAB')) {
            //            $.ajax({
            //                type: "POST",
            //                async: false,
            //                url: "../api/GetAllOrderTypes",
            //                contentType: "application/json; charset=utf-8",
            //                dataType: "json",
            //                success: function (texto) {
            //                    resolve(texto);
            //                },
            //                error: function (response) {
            //                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_SE_HAN_PODIDO'), 4000);
            //                    reject();
            //                }
            //            });
            //        } else {
            //            $.ajax({
            //                type: "POST",
            //                async: false,
            //                url: "../api/GetOrderType",
            //                contentType: "application/json; charset=utf-8",
            //                dataType: "json",
            //                data: JSON.stringify(this.obtenerIdMenu(tipo)),
            //                success: function (texto) {
            //                    resolve(texto);
            //                },
            //                error: function (response) {
            //                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_SE_HA_PODIDO_OBTENER'), 4000);
            //                    reject();
            //                }
            //            });
            //        }
            //    });
            //},
            verDetalles: function (e) {
                var self = this;
                var grid = $("#gridGestionWOHistorico").data("kendoGrid");
                var item = grid.dataSource.get(e.currentTarget.id);
                var currentRow = grid.tbody.find("tr[data-uid='" + item.uid + "']");
                var data = grid.dataItem(currentRow);
                new vVerDetallesOrden(data, false, data.IdTipoWO);
                $('#divFiltrosHeader').hide();
                $("#gridGestionWOHistorico").hide();
                $("#divFiltrosConsumos").hide();
                $("#divFiltrosProduccion").hide();
            },
            RegresarListadoWO: function () {
                var self = this;
                var doubleSibling = document.getElementById("gridGestionWOHistorico").nextSibling.nextSibling;
                var nextSibling = doubleSibling ? doubleSibling : document.getElementById("gridGestionWOHistorico").nextSibling;
                if (nextSibling)
                    nextSibling.remove();

                $("#divFiltrosHeader").show();
                $("#gridGestionWOHistorico").show();
                $("#lblCabeceraDetalle").hide();
                document.getElementById("lblCabeceraListadoWO").style.textDecoration = "";
                document.getElementById("lblCabeceraListadoWO").style.cursor = "";
            },
            actualiza: function () {
                var self = this;
                self.ds?.read();
            }
        });

        return gridGestionWOHistorico;
    });