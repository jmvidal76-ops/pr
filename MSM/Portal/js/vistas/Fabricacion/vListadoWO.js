
define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/ListadoWO.html', 'vistas/Fabricacion/vCrearWO', 'vistas/Fabricacion/vEditarWOCoccion', 'compartido/notificaciones',
    'compartido/utils', 'vistas/Fabricacion/vNuevaFiltracion', 'vistas/vDialogoConfirm',
    'vistas/Fabricacion/vEditarNotasOrden', 'vistas/Fabricacion/vCrearWOPlanificadaTrasiego', 'compartido/util', 'definiciones', 'vistas/Fabricacion/vEditarWOTrasiego'],
    function (_, Backbone, $, PlantillaListadoWO, vistaNuevaWO, VistavEditarWOCoccion, Not,
        Utils, vistaNuevaFiltracion, VistaDlgConfirm,
        vistaNotasOrden, vistaNuevaWOTrasiego, util, definiciones, VistavEditarWOTrasiego) {
        var gridListadoWO = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            vistaFormWO: null,
            groupList: null,
            gridListadoActual: "#gridListadoCoccion",
            tipoSeleccionado: null,
            tamanoGuardado: null,
            tamanoGuardadoParametro: null,
            tiposWO: definiciones.TipoWOPlanificado(),
            template: _.template(PlantillaListadoWO),
            tooltip: null,
            initialize: function () {
                Backbone.on('eventNotificacionOrdenFabricacion', this.actualiza, this);
                var self = this;
                self.tipoSeleccionado = self.tiposWO.Coccion;
                self.render(self.tiposWO.Coccion);
            },
            SelectRow: function (e) {
                e.sender.dataSource.view().forEach(function (element, index) {
                    if (element.descripcion != null && element.descripcion != " " && element.descripcion != "") {
                        $("tr:eq(" + (index + 1).toString() + ")").find("a[id='btnNotas']").css({ "background-color": "green", "color": "white" });
                    }
                });
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.tooltip = kendo.template($("#tooltip").html());

                kendo.ui.progress($("#center-pane"), true);
                self.asignacionValor();
                self.cargarGrid(self.tipoSeleccionado);
                $("#gridListadoCoccion").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

                $("#tabsPestanias").kendoTabStrip({
                    select: function (e) { self.selectTabTipoOrden(e, self) },
                    scrollable: true,
                    animation: {
                        open: {
                            effects: "fadeIn"
                        }
                    }
                });

                var tabStrip = this.$("#tabsPestanias").data("kendoTabStrip");
                //tabStrip.disable(tabStrip.tabGroup.children().eq(1));
                tabStrip.disable(tabStrip.tabGroup.children().eq(2));
                //tabStrip.disable(tabStrip.tabGroup.children().eq(3));


                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.cambioSelector();
            },
            events: {
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnCrearWOCoccion': 'crearWOCoccion',
                'click #btnCrearWOTrasiego': 'crearWOTrasiego',
                'click #btnEditarCoccion': 'editarOrdenCoccion',
                'click #btnEditarTrasiego': 'editarOrdenTrasiego',
                'click #btnNotas': 'EditarNotas',
                'click #btnEliminar': 'eliminarOrden'
            },
            asignacionValor: function () {
                var self = this;
                $("#idCoccion").val(self.tiposWO.Coccion);
                $("#idTrasiego").val(self.tiposWO.Trasiego);
                $("#idFiltracion").val(self.tiposWO.Filtracion);
                $("#idParametro").val(self.tiposWO.Parametro);
            },
            checkGroup: null,
            cargarGrid: function () {
                var self = this;


                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/OrdenesFab/ObtenerListadoOrdenPlanificada/" + self.tipoSeleccionado,
                            dataType: "json"
                        }
                    },
                    group: {
                        field: "Zona",
                        dir: "asc"
                    },
                    requestEnd: function (e) {
                        kendo.ui.progress($("#center-pane"), false);
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                'pk': { type: "number" },
                                'Id': { type: "string" },
                                'CodMaterialDescripcion': { type: "string" },
                                'IdUbicacionDescripcionDestino': { type: "string" },
                                'CodMaterial': { type: "string" },
                                'Material': { type: "string" },
                                'Cantidad': { type: "string" },
                                'InicioPlanificado': { type: "date" },
                                'FinPlanificado': { type: "date" },
                                'IdOrigen': { type: "string" },
                                'CodOrigen': { type: "string" },
                                'Origen': { type: "string" },
                                'CodDestino': { type: "string" },
                                'Destino': { type: "string" },
                                'Estado': { type: "string" },
                                'UdMedida': { type: "string" },
                                'Nota': { type: "string" },
                                'NumTeorico': { type: "number" },
                                'Ubicacion': { type: "string" },
                                'Zona': { type: "string" }
                            },
                        }
                    },
                    sort: { field: "InicioPlanificado", dir: "asc" }
                });

                if (!$(self.gridListadoActual).data("kendoGrid")) {
                    this.$(self.gridListadoActual).kendoGrid({
                        dataSource: self.ds,
                        selectable: true,
                        groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                        scrollable: true,
                        sortable: true,
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            pageSizes: [50, 100, 200],
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
                            text: window.app.idioma.t('QUITAR_FILTROS'),
                            template: "<a id='btnLimpiarFiltros' class='k-button k-button-icontext k-i-delete'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</a>"
                        },
                        {
                            template: function () {
                                if (TienePermiso(272)) {
                                    return "<a id='btnCrearWOCoccion' class='k-button k-button-icontext k-grid-add' style=' background-color:green;color:white; float: initial'><span class='k-icon k-add'></span>" + window.app.idioma.t('NUEVA_WO') + "</a>"
                                } else {
                                    return ""
                                }
                            }
                        },
                        ],
                        columns: [
                            {
                                field: "NotasWO",
                                title: " ",
                                width: 25,
                                filterable: false,
                                attributes: {
                                    style: "text-align:center;"
                                },
                                template: '<img id="imgDesc" src="../Portal/img/round_comment_notification.png" style="width: 16px !important; height:16px !important;#if(!NotasWO){# display:none;#}#">'
                            },
                            {
                                title: window.app.idioma.t("NOTAS_ORDEN"),
                                command: {
                                    template: "<a id='btnNotas' class='k-button k-grid-edit' style='min-width:90%;'><span class='k-icon k-i-restore'></span></a>"
                                },
                                attributes: { style: "text-align:center;" },
                                filterable: false,
                                width: 80
                            },

                            {
                                title: window.app.idioma.t("EDITAR"),
                                command: {
                                    template: "<a id='btnEditarCoccion' class='k-button k-grid-edit' style='min-width:90%;'><span class='k-icon k-edit'></span></a>"
                                },
                                attributes: { style: "text-align:center;" },
                                filterable: false,
                                width: 80
                            },
                            {
                                title: window.app.idioma.t("ELIMINAR"),
                                command: {
                                    template: "<a id='btnEliminar' class='k-button k-grid-delete' style='min-width:90%;'><span class='k-icon k-delete'></span></a>"
                                },
                                attributes: { style: "text-align:center;" },
                                filterable: false,
                                width: 80
                            },
                            {
                                field: "pk",
                                hidden: true
                            },
                            {
                                field: "NumTeorico",
                                template: '<span id="NumTeorico" class="addTooltip"> #= NumTeorico #</span>',
                                title: window.app.idioma.t("NUM_TEORICO"),
                                width: 80
                            },
                            {
                                field: "CodMaterialDescripcion",
                                template: '<span id="idMaterial" class="addTooltip"> #= CodMaterialDescripcion #</span>',
                                title: window.app.idioma.t("MATERIAL"),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                },
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            return "<div><label><input type='checkbox' value='#=Material#' style='//width: 14px;height:14px;margin-right:5px;'/>#= CodMaterialDescripcion #</label></div>";
                                        }
                                    }
                                },
                                width: 220
                            },
                            {
                                field: "Cantidad",
                                title: window.app.idioma.t("CANTIDAD"),
                                template: function (e) {
                                    return parseFloat(e.Cantidad.replace(".", ",")).toFixed(2).replace(".", ",") + " " + e.UdMedida
                                },
                                width: 110
                            },
                            {
                                field: "Zona",
                                title: window.app.idioma.t("ORIGEN_AUX"),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                },
                                template: '<span id="idOrigen" class="addTooltip">#=Zona#</span>',
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=IdZona#' style='//width: 14px;height:14px;margin-right:5px;'/>#=Zona#</label></div>";
                                        }
                                    }
                                },
                                width: 120
                            },
                            {
                                field: "CodDestino",
                                title: window.app.idioma.t("DESTINO_AUX"),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                },
                                template: '<span id="idDestino" class="addTooltip">#:IdUbicacionDescripcionDestino#</span>',
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=CodDestino#' style='//width: 14px;height:14px;margin-right:5px;'/>#= IdUbicacionDescripcionDestino #</label></div>";
                                        }
                                    }
                                },
                                width: 140
                            },
                            {
                                field: "InicioPlanificado",
                                title: window.app.idioma.t("INICIO_PLANIFICADO"),
                                width: 140,
                                format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    'class': 'tooltipText'
                                },
                                template: function (e) {
                                    return '<span id="InicioPlanificado" class="addTooltip">' + kendo.toString(kendo.parseDate(e.InicioPlanificado), kendo.culture().calendars.standard.patterns.MES_FechaHora) + '</span>';
                                },
                                filterable: {
                                    ui: function (element) {
                                        element.kendoDateTimePicker({
                                            format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                            culture: localStorage.getItem("idiomaSeleccionado")
                                        });
                                    }
                                }
                            },
                            {
                                field: "FinPlanificado",
                                title: window.app.idioma.t("FIN_PLANIFICADO"),
                                width: 140,
                                format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    'class': 'tooltipText'
                                },
                                template: function (e) {
                                    return '<span id="FinPlanificado" class="addTooltip">' + kendo.toString(kendo.parseDate(e.FinPlanificado), kendo.culture().calendars.standard.patterns.MES_FechaHora) + '</span>';
                                },
                                filterable: {
                                    ui: function (element) {
                                        element.kendoDateTimePicker({
                                            format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                            culture: localStorage.getItem("idiomaSeleccionado")
                                        });
                                    }
                                }
                            }

                        ],
                        dataBound: function (e) {
                            if (!TienePermiso(272)) {
                                $(self.gridListadoActual).find('tr').find('#btnNotas').remove();
                                $(self.gridListadoActual).find('tr').find('#btnEditarCoccion').remove();
                                $(self.gridListadoActual).find('tr').find('#btnEliminar').remove();
                            }
                            self.resizeGridCoccion();

                            var listFitColumns = [4];
                            listFitColumns.forEach(x => {
                                this.autoFitColumn(x);
                            });

                            //Columnas a auto ajustar su ancho por el nombre del campo o el orden si es un boton

                            if ($(self.gridListadoActual).data("kendoGrid").dataSource.group().length > 0) {
                                self.AgregarClaseSortableGrid(self);

                            }
                            self.SelectRow(e);
                        }
                    });

                    self.kendoSortable(self);

                    self.cargarTooltips();
                }


                this.$("[data-funcion]").checkSecurity();


            },
            cargarGridTrasiego: function () {
                var self = this;

                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/OrdenesFab/ObtenerListadoOrdenPlanificada/" + self.tipoSeleccionado,
                            dataType: "json"
                        }
                    },
                    group: {
                        field: "Zona",
                        dir: "asc"
                    },
                    requestEnd: function (e) {
                        kendo.ui.progress($("#center-pane"), false);
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                'pk': { type: "number" },
                                'Id': { type: "string" },
                                'CodMaterialDescripcion': { type: "string" },
                                'IdUbicacionDescripcionDestino': { type: "string" },
                                'CodMaterial': { type: "string" },
                                'Material': { type: "string" },
                                'Cantidad': { type: "string" },
                                'InicioPlanificado': { type: "date" },
                                'FinPlanificado': { type: "date" },
                                'CodUbicacion': { type: "string" },
                                'Ubicacion': { type: "string" },
                                'CodOrigen': { type: "string" },
                                'Origen': { type: "string" },
                                'CodDestino': { type: "string" },
                                'Destino': { type: "string" },
                                'Estado': { type: "string" },
                                'UdMedida': { type: "string" },
                                'Nota': { type: "string" },
                                'NumTeorico': { type: "number" },
                                'IdZona': { type: "string" },
                                'Zona': { type: "string" }
                            },
                        }
                    },
                    sort: { field: "InicioPlanificado", dir: "asc" },
                });

                if (!$(self.gridListadoActual).data("kendoGrid")) {
                    this.$(self.gridListadoActual).kendoGrid({
                        dataSource: self.ds,
                        selectable: true,
                        groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                        scrollable: true,
                        sortable: true,
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            pageSizes: [50, 100, 200],
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
                            text: window.app.idioma.t('QUITAR_FILTROS'),
                            template: "<a id='btnLimpiarFiltros' class='k-button k-button-icontext k-i-delete'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</a>"
                        },
                        {
                            template: function () {
                                if (TienePermiso(272)) {
                                    return "<a id='btnCrearWOTrasiego' class='k-button k-button-icontext k-grid-add' style=' background-color:green;color:white; float: initial'><span class='k-icon k-add'></span>" + window.app.idioma.t('NUEVA_WO') + "</a>"
                                } else {
                                    return ""
                                }
                            }
                        },
                        ],
                        columns: [
                            {
                                field: "NotasWO",
                                title: " ",
                                width: 35,
                                filterable: false,
                                attributes: {
                                    style: "text-align:center;"
                                },
                                template: '<img id="imgDesc" src="../Portal/img/round_comment_notification.png" style="width: 16px !important; height:16px !important;#if(!NotasWO){# display:none;#}#">'
                            },
                            {
                                title: window.app.idioma.t("NOTAS_ORDEN"),
                                width: 80,
                                command: {
                                    template: "<a id='btnNotas' class='k-button k-grid-edit' style='min-width:90%;'><span class='k-icon k-i-restore'></span></a>"
                                },
                                attributes: { style: "text-align:center;" },
                                filterable: false
                            },
                            {
                                title: window.app.idioma.t("EDITAR"),
                                width: 80,
                                command: {
                                    template: "<a id='btnEditarTrasiego' class='k-button k-grid-edit' style='min-width:90%;'><span class='k-icon k-edit'></span></a>"
                                },
                                attributes: { style: "text-align:center;" },
                                filterable: false
                            },
                            {
                                title: window.app.idioma.t("ELIMINAR"),
                                width: 80,
                                command: {
                                    template: "<a id='btnEliminar' class='k-button k-grid-delete'  style='min-width:90%;'><span class='k-icon k-delete'></span></a>"
                                },
                                attributes: { style: "text-align:center;" },
                                filterable: false
                            },
                            {
                                field: "pk",
                                hidden: true
                            },
                            {
                                field: "NumTeorico",
                                title: window.app.idioma.t("NUM_TEORICO"),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                },
                                template: '<span id="NumTeorico2" class="addTooltip"> #= NumTeorico #</span>',
                                width: 80
                            },
                            {
                                field: "CodMaterialDescripcion",
                                template: '<span id="idMaterial" class="addTooltip"> #= CodMaterialDescripcion #</span>',
                                title: window.app.idioma.t("MATERIAL"),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                },
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            return "<div><label><input type='checkbox' value='#=Material#' style='//width: 14px;height:14px;margin-right:5px;'/>#= CodMaterialDescripcion #</label></div>";
                                        }
                                    }
                                },
                                width: 230,
                            },
                            {
                                field: "Cantidad",
                                title: window.app.idioma.t("CANTIDAD_TRASEGO"),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                },
                                template: function (e) {
                                    return '<span id="idDestino" class="addTooltip">' + parseFloat(e.Cantidad.replace(",", ".")).toFixed(2).replace(".", ",") + " " + e.UdMedida + '</span>';
                                },
                                width: 120
                            },
                            {
                                field: "Zona",
                                title: window.app.idioma.t("ORIGEN_AUX"),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                },
                                template: '<span id="idOrigen" class="addTooltip">#:Zona#</span>',
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=IdZona#' style='//width: 14px;height:14px;margin-right:5px;'/>#:Zona#</label></div>";
                                        }
                                    }
                                },
                                width: 180
                            },
                            {
                                field: "Origen",
                                title: window.app.idioma.t("TANQUE_ORIGEN"),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                },
                                template: '<span id="idOrigen" class="addTooltip">#:IdUbicacionDescripcionOrigen#</span>',
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=CodOrigen#' style='//width: 14px;height:14px;margin-right:5px;'/>" + (self.tipoSeleccionado == self.tiposWO.Coccion ? "#:Origen#" : "#:IdUbicacionDescripcionOrigen#") + "</label></div>";
                                        }
                                    }
                                },
                                width: 180
                            },
                            {
                                field: "CodDestino",
                                title: window.app.idioma.t("TANQUE_DESTINO"),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                },
                                template: '<span id="idDestino" class="addTooltip">#:IdUbicacionDescripcionDestino#</span>',
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=CodDestino#' style='//width: 14px;height:14px;margin-right:5px;'/>#= IdUbicacionDescripcionDestino #</label></div>";
                                        }
                                    }
                                },
                                width: 180
                            },
                            {
                                field: "InicioPlanificado",
                                title: window.app.idioma.t("INICIO_PLANIFICADO"),
                                width: 160,
                                format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                                filterable: {
                                    ui: function (element) {
                                        element.kendoDateTimePicker({
                                            format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                            culture: localStorage.getItem("idiomaSeleccionado")
                                        });
                                    }
                                }
                            },
                            {
                                field: "FinPlanificado",
                                title: window.app.idioma.t("FIN_PLANIFICADO"),
                                width: 140,
                                format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                                filterable: {
                                    ui: function (element) {
                                        element.kendoDateTimePicker({
                                            format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                            culture: localStorage.getItem("idiomaSeleccionado")
                                        });
                                    }
                                }
                            }

                        ],
                        dataBound: function (e) {
                            if (!TienePermiso(272)) {
                                $(self.gridListadoActual).find('tr').find('#btnNotas').remove()
                                $(self.gridListadoActual).find('tr').find('#btnEditarTrasiego').remove();
                                $(self.gridListadoActual).find('tr').find('#btnEliminar').remove();
                            }

                            self.resizeGridTrasiego();

                            var listFitColumns = [4];
                            listFitColumns.forEach(x => {
                                this.autoFitColumn(x);
                            });

                            if ($(self.gridListadoActual).data("kendoGrid").dataSource.group().length > 0) {
                                self.AgregarClaseSortableGrid(self);
                            }

                            self.SelectRow(e);

                        }
                    });

                    self.kendoSortableTrasiego(self);

                    self.cargarTooltips();
                }


                this.$("[data-funcion]").checkSecurity();


            },
            AgregarClaseSortableGrid: function (self) {
                var elementgrid = $(self.gridListadoActual).data("kendoGrid");
                if (elementgrid) {

                    var currentList = elementgrid.dataSource.group();
                    var sorteable = currentList.findIndex(x => x.field == "Zona") >= 0;
                    var _cursor = "default";

                    if (sorteable && currentList.length == 1) {
                        $(self.gridListadoActual + " tbody > tr:not('.k-grouping-row')").each(function () {
                            $(this).addClass("Sortable");
                        });
                        _cursor = "move";
                    } else {
                        $(self.gridListadoActual + " tbody > tr:not('.k-grouping-row')").each(function () {
                            $(this).removeClass("Sortable");
                        });
                    }

                    $(self.gridListadoActual + " tbody tr").each(function () {
                        $(this).css({ 'cursor': _cursor });
                    });
                }
            },
            cargarGridParametro: function () {
                var self = this;

                self.dsParametro = new kendo.data.DataSource({
                    pageSize: 100,
                    transport: {
                        read: {
                            url: "../api/OrdenesFab/ObtenerListadoParametrosOrden",
                            dataType: "json"
                        },
                        update: {
                            url: "../api/OrdenesFab/EditarParametroOrdenPlanificada",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_ACTUALIZANDO_GRUPO"), 4000);
                                } else if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    var gridTran = $(self.gridListadoActual).data("kendoGrid");
                                    gridTran.dataSource.read();
                                }
                            },
                        },
                        parameterMap: function (options, operation) {
                            if (operation !== "read" && options) {
                                return kendo.stringify(options);
                            }
                            return options;
                        }
                    },
                    schema: {
                        model: {
                            id: "IdParametro",
                            fields: {
                                'Descripcion': { type: "string", editable: false },
                                'Valor': {
                                    type: "string",
                                    validation: {
                                        required: true,
                                        customValor: function (input) {
                                            if (input.attr("data-bind") == "value:Valor" && (input.val() == '' || input.val() == 0)) {
                                                input.attr("data-customValor-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = "slValor"));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'Unidad': { type: "string", editable: false },
                                'IdTipoWO': { type: "string", editable: false },
                                'DescTipoWO': { type: "string", editable: false },
                                'TipoParametro': { type: "string" },
                            }
                        }
                    }
                });
                if (!$(self.gridListadoActual).data("kendoGrid")) {
                    self.grid = this.$(self.gridListadoActual).kendoGrid({
                        dataSource: self.dsParametro,
                        filterable: {
                            extra: false,
                            messages: window.app.cfgKendo.configuracionFiltros_Msg,
                            operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                        },
                        sortable: true,
                        resizable: true,
                        pageable: {
                            refresh: true,
                            pageSizes: [100, 200, 500],
                            buttonCount: 5,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        toolbar: [{
                            text: window.app.idioma.t('QUITAR_FILTROS'),
                            template: "<a id='btnLimpiarFiltros' class='k-button k-button-icontext k-i-delete'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</a>"
                        }],
                        columns: [
                            {
                                field: "Descripcion",
                                template: "#= Descripcion #",
                                title: window.app.idioma.t("DESCRIPCION"),
                                filterable: false,
                                width: 180,
                                attributes: {
                                    style: 'white-space: nowrap ',
                                }
                            },
                            {
                                field: "Valor",
                                title: window.app.idioma.t('VALOR'),
                                template: function (e) {
                                    return self.ObtenerValor(e, "Valor")
                                },
                                width: 180,
                                editor: function (e, options) { return self.editarCampoValor(e, options) },
                            },
                            {
                                field: "Unidad",
                                title: window.app.idioma.t("UNIDAD"),
                                template: "#=Unidad#",
                                width: 180
                            },
                            {
                                field: "IdTipoWO",
                                title: window.app.idioma.t("ORDEN"),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                },
                                template: "#=DescTipoWO#",
                                width: 180,
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=IdTipoWO#' style='//width: 14px;height:14px;margin-right:5px;'/>#=DescTipoWO#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "coms",
                                title: window.app.idioma.t("OPERACIONES"),
                                attributes: { "align": "center" },
                                width: 200,
                                command: [
                                    {
                                        name: "edit",
                                        text: {
                                            edit: window.app.idioma.t("EDITAR"),
                                            update: window.app.idioma.t("ACTUALIZAR"),
                                            cancel: window.app.idioma.t("CANCELAR")
                                        }
                                    },

                                ]
                            }
                        ],
                        editable: "inline",
                        dataBound: function (e) {
                            if (!TienePermiso(272)) {
                                $(self.gridListadoActual + " a").remove()
                            };
                            self.resizeGridParametro();
                        }
                    }).data("kendoGrid");
                }

                this.$("[data-funcion]").checkSecurity();
            },
            editarCampoValor: function (container, options) {
                switch (options.model.TipoParametro) {
                    case "float":
                        var _value = kendo.format("{0:n2}", options.model.Valor.replace(".", ","));
                        options.model.Valor = _value;
                        //$('<input id="IDValor"  name="sl' + options.field + '/>')
                        $('<input id="IDValor"  name="sl' + options.field + '"  data-bind="value:' + options.field + '"/>')
                            .appendTo(container)
                            .kendoNumericTextBox({
                                spinners: true,
                                decimals: 2,
                                culture: localStorage.getItem("idiomaSeleccionado"),
                                format: "n2",
                                min: 1,
                                max: 99999,
                                value: _value
                            });

                        break;
                    default:
                        $('<input id="IDValor"  name="sl' + options.field + '"  data-bind="value:' + options.field + '"/>').addClass("k-textbox");
                        break;
                }
            },
            kendoSortable: function (self) {
                $(self.gridListadoActual).data("kendoGrid").table.kendoSortable({
                    filter: ">tbody >tr.Sortable",
                    hint: function (element) { //customize the hint
                        var table = $('<table style="width: ' + $(self.gridListadoActual).width() + 'px;" class="k-grid k-widget"></table>'),
                            hint;

                        table.append(element.clone()); //append the dragged element
                        table.css("opacity", 0.7);

                        return table; //return the hint element
                    },
                    cursor: "move",
                    change: function (e) {
                        var _grid = $(self.gridListadoActual).data("kendoGrid");
                        var itemOrigen = _grid.dataItems()[e.oldIndex];
                        var itemDestino = _grid.dataItems()[e.newIndex];
                        var _idUbicacionZona = itemDestino.Ubicacion == "" ? itemDestino.IdZona : itemDestino.Ubicacion;
                        var datos = {
                            CambiarFechas: true,
                            IdOri: itemOrigen.Id,
                            IdDes: itemDestino.Id,
                            IdZona: _idUbicacionZona
                        };

                        $.ajax({
                            type: "POST",
                            url: "../api/editaWOFab/",
                            dataType: 'json',
                            data: JSON.stringify(datos),
                            contentType: "application/json; charset=utf-8",
                            cache: false,
                            async: true,
                        }).done(function (res) {
                            if (res.succeeded) {

                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ORDEN_MODIFICADA_CORRECTAMENTE'), 4000);
                            }
                            kendo.ui.progress($(self.gridListadoActual), false);
                            $(self.gridListadoActual).data('kendoGrid').dataSource.read();
                        }).fail(function (err) {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_MODIFICANDO_ORDEN'), 4000);
                        });

                    }
                });
            },
            kendoSortableTrasiego: function (self) {
                $(self.gridListadoActual).data("kendoGrid").table.kendoSortable({
                    filter: ">tbody >tr.Sortable",
                    hint: function (element) { //customize the hint
                        var table = $('<table style="width: ' + $(self.gridListadoActual).width() + 'px;" class="k-grid k-widget"></table>'),
                            hint;

                        table.append(element.clone()); //append the dragged element
                        table.css("opacity", 0.7);

                        return table; //return the hint element
                    },
                    cursor: "move",
                    change: function (e) {
                        var _grid = $(self.gridListadoActual).data("kendoGrid");
                        var itemOrigen = _grid.dataItems()[e.oldIndex];
                        var itemDestino = _grid.dataItems()[e.newIndex];
                        var datos = {
                            IdOri: itemOrigen.Id,
                            IdDes: itemDestino.Id,
                            IdZona: itemDestino.IdZona
                        };

                        $.ajax({
                            type: "POST",
                            url: "../api/IntercambioFechasOrdenOrigenDestino/",
                            dataType: 'json',
                            data: JSON.stringify(datos),
                            contentType: "application/json; charset=utf-8",
                            cache: false,
                            async: true,
                        }).done(function (res) {
                            if (res) {

                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ORDEN_MODIFICADA_CORRECTAMENTE'), 4000);
                            }
                            kendo.ui.progress($(self.gridListadoActual), false);
                            $(self.gridListadoActual).data('kendoGrid').dataSource.read();
                        }).fail(function (err) {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_MODIFICANDO_ORDEN'), 4000);
                        });

                    }
                });
            },
            EditarNotas: function (e) {
                var self = this;
                var row = $(e.target.parentNode.parentNode).closest("tr");
                var dataItem = $(self.gridListadoActual).data("kendoGrid").dataItem(row);
                this.vistaNotasOrden = new vistaNotasOrden(dataItem.Id, self.gridListadoActual);

            },
            filtraGrid: function (tipo) {
                var self = this;

                if (tipo === "")
                    self.ds.filter([]);
                else
                    self.ds.filter({ field: "tipoOrden.descripcion", operator: "eq", value: tipo });

                var dsFilter = new kendo.data.DataSource({
                    data: self.ds.view(),
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                'pk': { type: "number" },
                                'id': { type: "string" },
                                'tipoOrden.descripcion': { type: "string" },
                                'estadoActual.descripcion': { type: "string" },
                                'material.idMaterial': { type: "string" },
                                'material.nombre': { type: "string" },
                                'cantidad': { type: "number" },
                                'material.udMedida': { type: "string" },
                                'dFecInicioEstimadoLocal': { type: "date" },
                                'dFecIniLocal': { type: "date" },
                                'dFecFinEstimadoLocal': { type: "date" },
                                'dFecFinLocal': { type: "date" },
                                'SourceEquipment.nombre': { type: "string" },
                                'DestinationEquipment.nombre': { type: "string" },
                            },
                        }
                    },
                    sort: { field: "dFecInicioEstimadoLocal", dir: "desc", field: "dFecIniLocal", dir: "desc" }
                });

                $(self.gridListadoActual).data("kendoGrid").setDataSource(dsFilter);
                $(self.gridListadoActual).data("kendoGrid").dataSource.read();
            },
            crearWOCoccion: function () {
                var self = this;
                kendo.ui.progress($("#center-pane"), true);
                this.vistaNuevaWO = new vistaNuevaWO(self.gridListadoActual);
            },
            crearWOTrasiego: function () {
                var self = this;
                kendo.ui.progress($("#center-pane"), true);
                this.vistaNuevaWOTrasiego = new vistaNuevaWOTrasiego(self.gridListadoActual);
            },
            creaFiltracion: function () {
                var self = this;
                kendo.ui.progress($("#center-pane"), true);
                this.vistaNuevaFiltracion = new vistaNuevaFiltracion();
            },
            LimpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            eliminar: function () {
                Backbone.off('eventNotificacionOrdenFabricacion');
                this.remove();
            },
            editarOrdenCoccion: function (e) {
                var self = this;
                var row = $(e.target.parentNode.parentNode).closest("tr");
                var item = $(self.gridListadoActual).data("kendoGrid").dataItem(row);
                var idOrden = item.Id;
                var Cantidad = item.Cantidad;
                var fechaInicio = item.InicioPlanificado;
                var Origen = item.Origen;
                this.vistaEditarLote = new VistavEditarWOCoccion(idOrden, item.CodMaterial, Cantidad, fechaInicio, item.CodDestino, Origen, self.gridListadoActual);

            },
            editarOrdenTrasiego: function (e) {
                var self = this;
                var row = $(e.target.parentNode.parentNode).closest("tr");
                var item = $(self.gridListadoActual).data("kendoGrid").dataItem(row);
                var idOrden = item.Id;
                var Cantidad = item.Cantidad;
                var fechaInicio = item.InicioPlanificado;
                var Material = item.CodMaterial;
                var Sala = item.CodUbicacion;
                var Origen = item.CodOrigen;
                var Destino = item.CodDestino;
                this.vistaEditarLote = new VistavEditarWOTrasiego(idOrden, Material, Cantidad, fechaInicio, Origen, Destino, Sala, self.gridListadoActual);

            },
            eliminarOrden: function (e) {
                e.preventDefault();
                var self = this;

                var row = $(e.target.parentNode.parentNode).closest("tr");
                var dataItem = $(self.gridListadoActual).data("kendoGrid").dataItem(row);
                var idOrden = dataItem.Id;
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ELIMINAR_ORDEN')
                    , msg: window.app.idioma.t('DESEA_REALMENTE_ELIMINAR_ESTA_ORDEN'),
                    funcion: function () { self.eliminaFil(idOrden); }, contexto: this
                });
            },
            eliminaFil: function (idOrden) {
                var datos = {};
                var self = this;
                datos.idOrden = idOrden;
                kendo.ui.progress($("#center-pane"), true);
                $.ajax({
                    type: "POST",
                    url: "../api/eliminarFiltracion/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    Backbone.trigger('eventCierraDialogo');
                    $(self.gridListadoActual).data('kendoGrid').dataSource.read();
                    if (res) {
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ORDEN_ELIMINADA_CORRECTAMENTE'), 4000);
                    } else {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_PUEDE_ELIMINAR_ORDEN'), 4000);
                    }
                    kendo.ui.progress($("#center-pane"), false);
                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ELIMINANDO_ORDEN'), 4000);
                    kendo.ui.progress($("#center-pane"), false);
                });
            },
            resizeGridCoccion: function () {
                var self = this;
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();

                var gridElement = $(self.gridListadoActual),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                if (self.tamanoGuardado == null) {
                    self.tamanoGuardado = contenedorHeight - otherElementsHeight - cabeceraHeight - 48;
                }
                dataArea.height(self.tamanoGuardado);
            },
            resizeGridTrasiego: function () {
                var self = this;
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();

                var gridElement = $(self.gridListadoActual),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                if (self.tamanoGuardado == null) {
                    self.tamanoGuardado = contenedorHeight - otherElementsHeight - cabeceraHeight - 48;
                }
                dataArea.height(self.tamanoGuardado);
            },
            resizeGridParametro: function () {
                var self = this;
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();

                var gridElement = $(self.gridListadoActual),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                if (self.tamanoGuardadoParametro == null) {
                    self.tamanoGuardadoParametro = contenedorHeight - otherElementsHeight - cabeceraHeight - 135;
                }
                dataArea.height(self.tamanoGuardadoParametro);
            },
            actualiza: function (tipo) {
                var self = this;
                self.ds.read();
            },
            cambioSelector: function () {
                var self = this;
                $(".tipoOrden").each(function () {
                    if ($(this).val() !== self.tipoSeleccionado) {

                        $(this).removeClass("k-state").removeClass("k-state-active");
                        $(this).addClass("k-state");
                    } else {
                        $(this).removeClass("k-state").removeClass("k-state-active");
                        $(this).addClass("k-state-active");
                    }
                });
            },
            cargarTooltips: function () {
                var self = this;
                $(self.gridListadoActual).kendoTooltip({
                    filter: "#imgDesc",
                    position: "auto",
                    width: 'auto',
                    content: function (e) {
                        var grid = $(self.gridListadoActual).data("kendoGrid");
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
            },
            selectTabTipoOrden: function (e, self) {
                self.tipoSeleccionado = e.item.value;

                switch (self.tipoSeleccionado) {
                    case self.tiposWO.Coccion:
                        self.gridListadoActual = "#gridListadoCoccion";
                        if (!$(self.gridListadoActual).data("kendoGrid")) {
                            self.cargarGrid();
                        }

                        break;
                    case self.tiposWO.Trasiego:
                        self.gridListadoActual = "#gridListadoTrasiego";
                        if (!$(self.gridListadoActual).data("kendoGrid")) {
                            self.cargarGridTrasiego();
                            $(self.gridListadoActual).kendoTooltip({
                                filter: ".addTooltip",
                                content: function (e) {
                                    return e.target.html();
                                }
                            }).data("kendoTooltip");
                        }
                        break;
                    case self.tiposWO.Filtracion:
                        self.gridListadoActual = "#gridListadoFiltracion";
                        if (!$(self.gridListadoActual).data("kendoGrid")) {
                            self.cargarGrid();
                            $(self.gridListadoActual).kendoTooltip({
                                filter: ".addTooltip",
                                content: function (e) {
                                    return e.target.html();
                                }
                            }).data("kendoTooltip");
                        }
                        break;
                    case self.tiposWO.Parametro:
                        self.gridListadoActual = "#gridParametro"
                        if (!$(self.gridListadoActual).data("kendoGrid")) { self.cargarGridParametro(); }
                        break;
                }

            },
            ObtenerValor: function (datos, columna) {
                var self = this;
                if (datos.TipoParametro == "ts") {
                    if (datos[columna].toString() !== "") {
                        return "<div>" + kendo.toString(kendo.parseDate(kendo.toString(kendo.parseDate(datos[columna]), kendo.culture().calendars.standard.patterns.s) + "Z"), kendo.culture().calendars.standard.patterns.MES_FechaHora) + "</div>"
                    } else {
                        return "<div></div>"
                    }
                } else if (datos.TipoParametro == "float") {
                    if (datos[columna] !== "" && datos[columna] !== null) {
                        if (datos.TipoParametro == "hh:mm:ss") {
                            if (datos[columna] !== "") {
                                return "<div>" + ConversorHorasMinutosSegundos(datos[columna] * 3600) + "</div>"
                            } else {
                                return "<div></div>"
                            }

                        }
                        else {
                            return "<div>" + parseFloat(datos[columna].replace(",", ".")).toFixed(2).replace(".", ",") + "</div>"
                        }
                    } else {
                        return "<div></div>"
                    }
                } else {
                    return "<div>" + datos[columna] + "</div>"
                }
            },

        });

        return gridListadoWO;
    });