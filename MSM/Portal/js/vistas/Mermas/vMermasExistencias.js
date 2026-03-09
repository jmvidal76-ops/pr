define(['underscore', 'backbone', 'jquery', 'text!../../../Mermas/html/MermasExistencias.html', 'vistas/vDialogoConfirm',
    'compartido/notificaciones', 'jszip', '../../../../Portal/js/constantes', 'compartido/util'],
    function (_, Backbone, $, PlantillaMermasExistencias, VistaDlgConfirm, Not, JSZip, enums, util) {
        var VistaDatosMermas = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            tipoTurno: null,
            grid: null,
            fecha: new Date().midnight(),
            fechaCargada: null,
            template: _.template(PlantillaMermasExistencias),
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.getDataSource();
                self.render();

                self.$("[data-funcion]").checkSecurity();
            },
            getDataSource: function () {
                var self = this;

                self.dsDatosMermas = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/CalculoMermas/ObtenerExistenciasCalculoMermas",
                            data: function () {
                                var desdePicker = $("#dtpFechaDesde").getKendoDateTimePicker();
                                var hastaPicker = $("#dtpFecha").getKendoDateTimePicker();

                                var desdeDate = (desdePicker && desdePicker.value()) ? desdePicker.value() : null;
                                var hastaDate = (hastaPicker && hastaPicker.value()) ? hastaPicker.value() : null;

                                return {
                                    fechaDesde: desdeDate ? desdeDate.toISOString() : null,
                                    fechaHasta: hastaDate ? hastaDate.toISOString() : null,
                                    zona: 0
                                };
                            },
                            dataType: "json",
                            type: "GET"
                        },
                    },
                    schema: {
                        model: {
                            id: "IdMermasExistencias", 
                            fields: {
                                Id: { type: "number", editable: false },

                                IdMermasExistencias: { type: "number", editable: false },
                                Fecha: { type: "date" },
                                Zona: { type: "number" },
                                DescripcionZona: { type: "string" },

                                Codigo_JDE: { type: "string" },
                                DescripcionMaterial: { type: "string" },
                                IdUbicacion: { type: "number" },
                                Ubicacion: { type: "string" },
                                DescripcionUbicacion: { type: "string" },

                                LoteMES: { type: "string" },
                                Extracto: { type: "number" },
                                Cantidad: { type: "number" },

                                Editado: { type: "boolean" },
                                Borrado: { type: "boolean" },

                                Creado: { type: "date" },
                                CreadoPor: { type: "string" },
                                Actualizado: { type: "date" },
                                ActualizadoPor: { type: "string" }
                            }
                        }
                    },
                    aggregate: [
                        { field: "Cantidad", aggregate: "sum" },
                        { field: "Extracto", aggregate: "sum" },
                    ],
                    error: function (e) {
                        if (e.status === 403 && e.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER') + ' ObtenerExistenciasCalculoMermas', 4000);
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                DestruirKendoWidgets(self);

                var ExtGrid = window.app.cfgKendo.extGridToolbarColumnMenu;
                kendo.ui.plugin(ExtGrid);

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                //Asignaciíon fechas
                self.fecha.setHours(23, 59, 59, 999);
                $("#dtpFecha").kendoDateTimePicker({
                    value: self.fecha,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    change: function (e) {
                        var desdePicker = $("#dtpFechaDesde").getKendoDateTimePicker();
                        if (desdePicker && desdePicker.value()) {
                            $("#desdeFecha").html(kendo.toString(desdePicker.value(), kendo.culture().calendars.standard.patterns.MES_FechaHora));
                        }
                    }
                });

                var fechaDes = self.fecha.addDays(-30);
                fechaDes.setHours(00, 00, 00, 000);
                $("#dtpFechaDesde").kendoDateTimePicker({
                    value: fechaDes,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    change: function (e) {
                        var desdeVal = this.value();
                        $("#desdeFecha").html(desdeVal ? kendo.toString(desdeVal, kendo.culture().calendars.standard.patterns.MES_FechaHora) : "");
                    }
                });

                var inicialDesde = $("#dtpFechaDesde").getKendoDateTimePicker().value();
                $("#desdeFecha").html(inicialDesde ? kendo.toString(inicialDesde, kendo.culture().calendars.standard.patterns.MES_FechaHora) : "");

                self.grid = this.$("#gridDatosMermas").kendoExtGrid({
                    autoBind: false,
                    dataSource: self.dsDatosMermas,
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
                    excel: util.ui.default.gridExcelDate('EXISTENCIAS'),
                    excelExport: async function (e) {
                        ExcelGridExtra(e, util);
                    },
                    columns: [
                        {
                            hidden: true,
                            field: "IdMermasExistencias",
                            title: "Id",
                            width: 60
                        },
                        {
                            field: "Fecha",
                            title: window.app.idioma.t("FECHA"),
                            width: 100,
                            headerAttributes: { style: "width:140px; min-width:140px; max-width:140px;" },
                            attributes: { style: "width:140px; min-width:140px; max-width:140px; white-space:nowrap;" },
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.Fecha ? GetDateForExcel(value.Fecha) : '' #",
                                width: 150
                            },
                            template: "#= Fecha ? kendo.toString(Fecha, kendo.culture().calendars.standard.patterns.MES_FechaHora) : '' #",
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            hidden: true,
                            field: "Zona",
                            title: window.app.idioma.t("ZONA"),
                            width: 60,
                            filterable: false
                        },
                        {
                            field: "DescripcionZona",
                            title: window.app.idioma.t("ZONA"),
                            width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    return "<div><label><input type='checkbox' value='#=DescripcionZona#' style='width: 14px;height:14px;margin-right:5px;'/>#= DescripcionZona#</label></div>";
                                }
                            }
                        },
                        {
                            field: "Codigo_JDE",
                            title: window.app.idioma.t("CODIGO_JDE"),
                            width: 80,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field == "all" ?
                                        "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                        "<div><label><input type='checkbox' value='#=Codigo_JDE#' style='width: 14px;height:14px;margin-right:5px;'/>#= Codigo_JDE# - #= DescripcionMaterial#</label></div>";
                                }
                            },
                            attributes: { class: 'addTooltip' },
                            template: "<span class='addTooltip'>#=Codigo_JDE ? Codigo_JDE : ''#</span>"
                        },
                        {
                            field: "DescripcionMaterial",
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                            width: 250,
                            attributes: { class: 'addTooltip' },
                            template: "<span class='addTooltip'>#=DescripcionMaterial ? DescripcionMaterial : ''#</span>",
                            filterable: true
                        },
                        {
                            field: "Ubicacion",
                            title: window.app.idioma.t("UBICACION"),
                            width: 120,
                            attributes: { class: 'addTooltip' },
                            template: "<span class='addTooltip'>#=Ubicacion ? Ubicacion : DescripcionUbicacion ? DescripcionUbicacion : ''#</span>",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    return "<div><label><input type='checkbox' value='#=Ubicacion#' style='width: 14px;height:14px;margin-right:5px;'/>#= Ubicacion#</label></div>";
                                }
                            }
                        },
                        {
                            field: "DescripcionUbicacion",
                            title: window.app.idioma.t("DESCRIPCION_UBICACION"),
                            width: 200,
                            attributes: { class: 'addTooltip' },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    return "<div><label><input type='checkbox' value='#=DescripcionUbicacion#' style='width: 14px;height:14px;margin-right:5px;'/>#= DescripcionUbicacion#</label></div>";
                                }
                            }
                        },
                        {
                            field: "LoteMES",
                            title: window.app.idioma.t("LOTEMES"),
                            width: 400,
                            attributes: { class: 'addTooltip' },
                            filterable: true
                        },
                        {
                            field: "Cantidad",
                            title: window.app.idioma.t("CANTIDAD"),
                            format: "{0:n2}",
                            width: 110,
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "n2",
                                        decimals: 2,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "Extracto",
                            title: "Kg " + window.app.idioma.t("EXTRACTO"),
                            format: "{0:n2}",
                            width: 110,
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "n2",
                                        decimals: 2,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            hidden: true,
                            field: "Editado",
                            title: "Editado",
                            width: 80
                        },
                        {
                            hidden: true,
                            field: "Borrado",
                            title: "Borrado",
                            width: 80
                        },
                        {
                            hidden: true,
                            field: "Creado",
                            title: "Creado",
                            width: 140
                        },
                        {
                            hidden: true,
                            field: "CreadoPor",
                            title: "CreadoPor",
                            width: 140
                        },
                        {
                            hidden: true,
                            field: "Actualizado",
                            title: "Actualizado",
                            width: 140
                        },
                        {
                            hidden: true,
                            field: "ActualizadoPor",
                            title: "ActualizadoPor",
                            width: 140
                        }
                    ],
                    dataBinding: self.resizeGrid,
                    dataBound: function (e) {
                        self.fechaCargada = $("#dtpFecha").getKendoDateTimePicker().value();
                    },
                }).data("kendoExtGrid");

                window.app.headerGridTooltip($("#gridDatosMermas").data("kendoExtGrid"));

                self.resizeGrid();
            },
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnExportarExcel': 'exportarExcel',
            },
            exportarExcel: function () {
                var grid = $("#gridDatosMermas").data("kendoExtGrid");
                if (!grid) return;
                grid.saveAsExcel();
            },
            actualiza: function () {
                var self = this;

                var desde = $("#dtpFechaDesde").getKendoDateTimePicker().value();
                var hasta = $("#dtpFecha").getKendoDateTimePicker().value();

                // Validaciones
                if (!desde || !hasta) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LAS_FECHAS_INTRODUCIDAS'), 4000);
                    return;
                }

                if (desde >= hasta) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('_LA_FECHA'), 4000);
                    return;
                }

                // actualizar fecha de referencia
                self.fecha = hasta;

                RecargarGrid({ grid: self.grid });
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

                var gridElement = $("#gridDatosMermas"),
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

                self.dsDatosMermas.query({
                    group: [],
                    filter: [],
                    page: 1
                });
            },
        });

        return VistaDatosMermas;
    });