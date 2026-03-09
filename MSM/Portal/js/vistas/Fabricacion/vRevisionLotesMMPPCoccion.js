define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/RevisionLotesMMPPCoccion.html', 'vistas/vDialogoConfirm',
    'compartido/notificaciones', 'jszip', 'compartido/utils', '../../../../Portal/js/constantes', 'vistas/Fabricacion/vEditarLotesRevision'],
    function (_, Backbone, $, PlantillaRevisionLotesMMPPCoccion, VistaDlgConfirm, Not, JSZip, utils, enums, vEditarLotesRevision) {
        var VistaConsumo = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            tipoTurno: null,
            grid: null,
            fecha: new Date().midnight(),
            fechaCargada: null,
            template: _.template(PlantillaRevisionLotesMMPPCoccion),
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.getDataSource();
                self.render();

                self.$("[data-funcion]").checkSecurity();

                // --- Listener persistente para actualizar el grid tras editar lotes ---
                Backbone.off('eventCierraDialogo.actualizaGrid');
                Backbone.on('eventCierraDialogo.actualizaGrid', function () {
                    if (self.grid && self.grid.dataSource) {
                        self.grid.dataSource.read();
                    }
                });
            },
            getDataSource: function () {
                var self = this;

                self.dsConsumos = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/controlGestion/revisionMMPPCoccion",
                            data: function () {
                                let result = {};
                                result.fechaDesde = self.fecha.addDays(-1).toISOString();
                                result.fechaHasta = self.fecha.toISOString();

                                return result;
                            },
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            fields: {
                                IdMovimiento: { type: "number" },
                                NumCoccion: { type: "string" },
                                Ubicacion: { type: "string" },
                                IdMosto: { type: "string" },
                                DescripcionMosto: { type: "string" },
                                CantidadProducida: { type: "number" },
                                Cantidad: { type: "number" },
                                GradoPlato: { type: "number" },
                                Lote: { type: "string" },
                                IdLote: { type: "number" },
                                IdClase: { type: "string" },
                                Clase: { type: "string" },
                                IdMaterial: { type: "string" },
                                TipoMaterial: { type: "number" },
                                DescripcionMaterial: { type: "string" },
                                IdProveedor: { type: "string" },
                                DescripcionProveedor: { type: "string" },
                                LoteProveedor: { type: "string" },
                                CantidadInicial: { type: "number" },
                                CantidadActual: { type: "number" },
                                UnidadMedida: { type: "string" },
                                FechaEntradaUbicacion: { type: "date" },
                                FechaInicioConsumo: { type: "date" },
                                FechaFinConsumo: { type: "date" },
                                IdAlmacen: { type: "number" },
                                IdZona: { type: "number" },
                                Zona: { type: "string" },
                                IdUbicacionLote: { type: "number" },
                                UbicacionLote: { type: "string" }
                            }
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                DestruirKendoWidgets(self);

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                $("#dtpFecha").kendoDateTimePicker({
                    value: self.fecha,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    change: function (e) {
                        if (this.value()) {
                            $("#desdeFecha").html(kendo.toString(this.value().addHours(-24), kendo.culture().calendars.standard.patterns.MES_FechaHora));
                        }
                    }
                });

                $("#desdeFecha").html(kendo.toString($("#dtpFecha").getKendoDateTimePicker().value().addHours(-24), kendo.culture().calendars.standard.patterns.MES_FechaHora));

                self.grid = this.$("#gridConsumos").kendoGrid({
                    autoBind: false,
                    dataSource: self.dsConsumos,
                    groupable: {
                        messages: {
                            empty: window.app.idioma.t('ARRASTRAR_SOLTAR')
                        }
                    },
                    sortable: true,
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            headerTemplate: "<span></span>", // sin seleccionar todo
                            template: "<input type='checkbox' class='row-checkbox' />",
                            width: 40,
                            sortable: false,
                            filterable: false
                        },
                        {
                            hidden: true,
                            field: "IdMovimiento",
                            title: "IdMovimiento",
                            width: 100,
                        },
                        {
                            field: "Ubicacion",
                            title: window.app.idioma.t("UBICACION"),
                            width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Ubicacion#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Ubicacion #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "NumCoccion",
                            title: window.app.idioma.t("NUMERO_COCCION"),
                            width: 110,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=NumCoccion#' style='//width: 14px;height:14px;margin-right:5px;'/>#= NumCoccion #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            hidden: true,
                            field: "IdMosto",
                            title: window.app.idioma.t("ID_MOSTO"),
                            width: 105,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdMosto#' style='//width: 14px;height:14px;margin-right:5px;'/>#= IdMosto #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionMosto",
                            title: window.app.idioma.t("DESCRIPCION_MOSTO"),
                            width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionMosto#' style='//width: 14px;height:14px;margin-right:5px;'/>#= DescripcionMosto #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CantidadProducida",
                            title: window.app.idioma.t("CANTIDAD") + ' Mosto',
                            format: "{0:n2}",
                            width: 140,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                        },
                        {
                            field: "GradoPlato",
                            title: "ºP",
                            template: "#=kendo.format('{0:n2}',parseFloat(GradoPlato.toString()))#",
                            width: 70,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            }
                        },
                        {
                            field: "Lote",
                            title: window.app.idioma.t("LOTE_MMPP_ORIGEN"),
                            width: 300,
                            filterable: true,
                        },
                        {
                            hidden: true,
                            title: "IdLote",
                            field: "IdLote",
                            width: 100,
                        },
                        {
                            field: "IdMaterial",
                            title: window.app.idioma.t("CODIGO_MATERIAL"),
                            width: 130,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= IdMaterial #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionMaterial",
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                            width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= DescripcionMaterial #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            hidden: true,
                            field: "IdClase",
                            width: 50,
                        },
                        {
                            field: "Clase",
                            title: window.app.idioma.t("CLASE_MATERIAL"),
                            width: 130,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Clase#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Clase #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            hidden: true,
                            field: "IdProveedor", title: window.app.idioma.t("CODIGO_PROVEEDOR"), width: 140,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdProveedor#' style='//width: 14px;height:14px;margin-right:5px;'/>#= IdProveedor #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            hidden: true,
                            field: "DescripcionProveedor", title: window.app.idioma.t("DESCRIPCION_PROVEEDOR"), width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionProveedor#' style='//width: 14px;height:14px;margin-right:5px;'/>#= DescripcionProveedor #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "LoteProveedor",
                            title: window.app.idioma.t("LOTE_PROVEEDOR"),
                            width: 200,
                            filterable: true,                            
                        },
                        {
                            field: "Cantidad",
                            title: window.app.idioma.t("CANTIDAD_CONSUMIDA"),
                            format: "{0:n2}",
                            aggregates: ["sum"],
                            width: 135,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            field: "CantidadInicial",
                            title: window.app.idioma.t("CANTIDAD_INICIAL"),
                            format: "{0:n2}",
                            width: 135,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            field: "CantidadActual",
                            title: window.app.idioma.t("CANTIDAD_ACTUAL"),
                            format: "{0:n2}",
                            width: 135,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            field: "UnidadMedida",
                            template: "#=UnidadMedida ? UnidadMedida.toUpperCase() : ''#",
                            title: window.app.idioma.t("UD_MEDIDA"),
                            width: 60,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=UnidadMedida#' style='//width: 14px;height:14px;margin-right:5px;'/>#= UnidadMedida #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "FechaEntradaUbicacion",
                            title: window.app.idioma.t("FECHA_ENTRADA_UBICACION"),
                            template: '#= FechaEntradaUbicacion !== null ? kendo.toString(FechaEntradaUbicacion, "' + kendo.culture().calendars.standard.patterns.MES_FechaHora + '" ) : "" #',
                            width: "170px",
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
                            field: "FechaInicioConsumo",
                            title: window.app.idioma.t("FECHA_INICIO_CONSUMO"),
                            template: '#= FechaInicioConsumo !== null ? kendo.toString(FechaInicioConsumo, "' + kendo.culture().calendars.standard.patterns.MES_FechaHora + '" ) : "" #',
                            width: "170px",
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
                            field: "FechaFinConsumo",
                            title: window.app.idioma.t("FECHA_FIN_CONSUMO"),
                            template: '#= FechaFinConsumo !== null ? kendo.toString(FechaFinConsumo, "' + kendo.culture().calendars.standard.patterns.MES_FechaHora + '" ) : "" #',
                            width: "170px",
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
                            hidden:true,
                            field: "IdAlmacen",
                            width: 50,
                        },
                        {
                            hidden: true,
                            field: "IdZona",
                            width: 50,
                        },
                        {
                            field: "Zona",
                            title: window.app.idioma.t("ZONA"),
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Zona#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Zona #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            hidden: true,
                            field: "IdUbicacionLote",
                            title: "IdUbicacionLote",
                            width: 150,                            
                        },
                        {
                            field: "UbicacionLote",
                            title: window.app.idioma.t("UBICACION_LOTE"),
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=UbicacionLote#' style='//width: 14px;height:14px;margin-right:5px;'/>#= UbicacionLote #</label></div>";
                                    }
                                }
                            }
                        },
                    ],
                    dataBinding: self.resizeGrid,
                    dataBound: function (e) {
                        self.fechaCargada = $("#dtpFecha").getKendoDateTimePicker().value();
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridConsumos").data("kendoGrid"));

                self.resizeGrid();
            },
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnFiltroMMPP': 'filtroMMPP',
                'click #btnFiltroMMPPAA': 'filtroMMPPAA',
                'click #btnEditar': 'editarLotes',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
            },
            actualiza: function () {
                var self = this;

                self.fecha = $("#dtpFecha").getKendoDateTimePicker().value();

                if (!self.fecha) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_FECHA_INTRODUCIDA'), 3000);
                    return;
                }

                RecargarGrid({ grid: self.grid });
            },
            getFiltroMMPP: function () {
                const filtroMMPP = {
                    "filters": [
                        {
                            "value": "Adjuntos",
                            "operator": "eq",
                            "field": "Clase"
                        },
                        {
                            "value": "Malta",
                            "operator": "eq",
                            "field": "Clase"
                        },
                        {
                            "value": "Lúpulos",
                            "operator": "eq",
                            "field": "Clase"
                        }
                    ],
                    "logic": "or"
                };

                return filtroMMPP;
            },
            filtroMMPP: function () {
                var self = this;

                const filtroMMPP = self.getFiltroMMPP();

                self.dsConsumos.query({
                    filter: filtroMMPP,
                    page: 1
                });
            },
            getFiltroMMPPAA: function () {
                const filtroMMPPAA = {
                    "filters": [
                        {
                            "value": "Adjuntos",
                            "operator": "neq",
                            "field": "Clase"
                        },
                        {
                            "value": "Malta",
                            "operator": "neq",
                            "field": "Clase"
                        },
                        {
                            "value": "Lúpulos",
                            "operator": "neq",
                            "field": "Clase"
                        }
                    ],
                    "logic": "and"
                };

                return filtroMMPPAA;
            },
            filtroMMPPAA: function () {
                var self = this;

                const filtroMMPPAA = self.getFiltroMMPPAA();

                self.dsConsumos.query({
                    filter: filtroMMPPAA,
                    page: 1
                });
            },
            editarLotes: function () {
                var self = this;
                var grid = $("#gridConsumos").data("kendoGrid");
                var seleccionados = [];

                //Si no tiene permiso para gestion no puede editar lotes
                if (!self.tienePermiso(415)) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    return;
                }

                grid.tbody.find(".row-checkbox:checked").each(function () {
                    var dataItem = grid.dataItem($(this).closest("tr"));
                    if (dataItem) {
                        seleccionados.push(dataItem);
                    }
                });

                if (seleccionados.length === 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                // Llamamos a la ventana de edición
                new vEditarLotesRevision(seleccionados);
            },
            tienePermiso: function (idFuncion) {
                var permiso = false;

                for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                    if (window.app.sesion.attributes.funciones[i].id === idFuncion) {
                        permiso = true;
                    }
                }

                return permiso;
            },
            limpiarSeleccionGrid: function () {
                var grid = $("#gridConsumos").data("kendoGrid");
                if (!grid) return;

                // Quitar todos los checks
                grid.tbody.find(".row-checkbox").prop("checked", false);
            },
           
            eliminar: function () {
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridConsumos"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            },
            LimpiarFiltroGrid: function () {
                const self = this;

                self.dsConsumos.query({
                    group: [],
                    filter: [],
                    page: 1
                });
            },
        });

        return VistaConsumo;
    });