define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/AyudaPlanificacionCocciones.html', 'jszip', 'compartido/notificaciones',
    'vistas/vDialogoConfirm', 'compartido/util', 'vistas/Fabricacion/vCrearWOMultiple'],
    function (_, Backbone, $, plantillaAyudaCoccion, JSZip, Not, VistaDlgConfirm, util, CrearWOMultiple) {
        var vistaAyudaCoccion = Backbone.View.extend({
            tagName: 'div',
            template: _.template(plantillaAyudaCoccion),
            gridCervEnvasarCervAD: null,
            gridCervADMostoFrio: null,
            gridMostoFrio: null,
            gridMermasEnvasadoHelper: null,
            gridMermasFiltracionHelper: null,
            gridMermasFermGuardaHelper: null,
            gridCoefAumentoVolHelper: null,
            gridConfiguracion: null,
            dsCervEnvasarCervAD: null,
            dsCervADMostoFrio: null,
            dsMostoFrio: null,
            dsConfiguracion: null,
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                //Backbone.on('eventActProd', this.actualiza, this);

                self.getSemanasProyeccion();
                self.getDataSourceCervEnvasarCervAD();
                self.getDataSourceCervADMostoFrio();
                self.getDataSourceMostoFrio();
                self.getDataSourceConfiguracion();

                self.render();
            },
            render: function () {
                var self = this;

                this.$el.html(this.template());
                $('#center-pane').append(this.$el);

                this.tab = util.ui.createTabStrip('#divPestanias', {
                    select: function (e) {
                        self.SelectTab(e, self);
                    }
                });

                // Panel Planificaciones Cocción
                util.ui.createVSplitter('#vsplitPanelPlanCoccion', ['36%', '32%', '32%']);

                // Panel Mermas
                util.ui.createVSplitter('#vsplitPanelMermas', ['34%', '33%', '33%']);

                // Panel Configuración
                util.ui.createVSplitter('#vsplitPanelConfiguracion', ['75%', '25%']);

                self.cargarGridCervEnvasarCervAD();
                self.cargarGridCervADMostoFrio();
                self.cargarGridMostoFrio();
                self.cargarGridsMermasCoeficiente();
                self.cargarGridConfiguracion();

                util.ui.enableResizeCenterPane();
            },
            //actualiza: function () {
            //    var self = this;

            //    RecargarGrid({ grid: self.gridConfiguracion });
            //    RecargarGrid({ grid: self.gridMermas });
            //    RecargarGrid({ grid: self.gridConexionLinea });
            //},
            events: {
                'click #btnCocActualizar': 'cocActualizar',
                'click #btnCocCzaEnvasarCzaAltaDensidadExcel': 'cocCzaEnvasarCzaAltaDensidadExcel',
                'click #btnCocCzaEnvasarCzaAltaDensidadLimpiarFiltros': 'cocCzaEnvasarCzaAltaDensidadLimpiarFiltros',
                'click #btnCocCzaAltaDensidadMostoFrioExcel': 'cocCzaAltaDensidadMostoFrioExcel',
                'click #btnCocCzaAltaDensidadMostoFrioLimpiarFiltros': 'cocCzaAltaDensidadMostoFrioLimpiarFiltros',
                'click #btnCocMostoFrioExcel': 'cocMostoFrioExcel',
                'click #btnCocMostoFrioLimpiarFiltros': 'cocMostoFrioLimpiarFiltros',
                'click #btnCocMermaEnvasadoAplicar': function (e) {
                    var self = this;
                    let mermaCoefValor = $("#txtCocMermaEnvasado").data("kendoNumericTextBox").value();
                    self.mermasCoefAplicar(e, self.gridMermasEnvasadoHelper, mermaCoefValor, "mermaEnvasado");
                },
                'click #btnCocMermaFiltracionAplicar': function (e) {
                    var self = this;
                    let mermaCoefValor = $("#txtCocMermaFiltracion").data("kendoNumericTextBox").value();
                    self.mermasCoefAplicar(e, self.gridMermasFiltracionHelper, mermaCoefValor, "mermaFiltracion");
                },
                'click #btnCocMermaFermGuardaAplicar': function (e) {
                    var self = this;
                    let mermaCoefValor = $("#txtCocMermaFermGuarda").data("kendoNumericTextBox").value();
                    self.mermasCoefAplicar(e, self.gridMermasFermGuardaHelper, mermaCoefValor, "mermaFermGuarda");
                },
                'click #btnCocCoefAumentoVolAplicar': function (e) {
                    var self = this;
                    let mermaCoefValor = $("#txtCocCoefAumentoVol").data("kendoNumericTextBox").value();
                    self.mermasCoefAplicar(e, self.gridCoefAumentoVolHelper, mermaCoefValor, "coefAumentoVolumen");
                },
                'click .boton-limpiar': function (e) {
                    var self = this;
                    var grid = $(e.currentTarget).closest(".k-grid").data("kendoGrid");
                    self.mermasCoefLimpiarFiltros(grid.dataSource);
                },
                'click .crearWoCocciones': 'createWP',
            },
            SelectTab: function (e, self) {
            },
            getSemanasProyeccion: function () {
                var self = this;

                $.ajax({
                    url: "../api/ayudaPlanificacion/coccion/valorConfiguracion",
                    dataType: "json",
                    async: false,
                    success: function (res) {
                        self.numSemanas = res;
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), err.xhr.responseJSON.Message, 4000);
                        }
                    }
                });
            },
            getDataSourceCervEnvasarCervAD: function () {
                var self = this;

                self.dsCervEnvasarCervAD = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ayudaPlanificacion/coccion/cervEnvasarCervAltaDensidad",
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            id: "IdCervEnvCervAD",
                            fields: {
                                IdCervEnvCervAD: { type: "number" },
                                CervezaEnvasar: { type: "string" },
                                CervEnvasarDescripcion: { type: "string" },
                                HlEnvasar: { type: "number" },
                                MermaEnvasado: { type: "number" },
                                HlNecesariosEnTCPMerma: { type: "number" },
                                HlEnTCP: { type: "number" },
                                HlNecesariosEnTCP: { type: "number" },
                                MermaFiltracion: { type: "number" },
                                HlFiltrar: { type: "number" },
                                CoefAumentoVolumen: { type: "number" },
                                HlNecesariosADEnBodega: { type: "number" },
                                TipoCervezaAD: { type: "string" },
                                TipoCervADDescripcion: { type: "string" },
                            }
                        },
                        parse: function (response) {
                            for (const r of response) {
                                r.CervezaEnvasarLargo = r.CervezaEnvasar + " - " + r.CervEnvasarDescripcion;
                                r.CervezaADLargo = r.TipoCervezaAD == "Indeterminado" ? r.TipoCervezaAD : r.TipoCervezaAD + " - " + r.TipoCervADDescripcion;
                            }

                            return response;
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            cargarGridCervEnvasarCervAD: function () {
                var self = this;

                self.gridCervEnvasarCervAD = $("#gridCocCzaEnvasarCzaAltaDensidad").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t("CERV_ENVASAR_CERV_AD") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    excelExport: async function (e) {
                        ExcelGridExtra(e, util);
                    },
                    //autoBind: false,
                    dataSource: self.dsCervEnvasarCervAD,
                    toolbar: kendo.template($("#tmplGridCocCzaEnvasarCzaAltaDensidadToolbar").html()),
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
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "CervezaEnvasarLargo",
                            title: window.app.idioma.t('CERVEZA_A_ENVASAR'),
                            width: 275,
                        },
                        {
                            field: "HlEnvasar",
                            title: window.app.idioma.t('HL_ENVASAR'),
                            width: 125,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "MermaEnvasado",
                            title: window.app.idioma.t('MERMA_ENVASADO'),
                            width: 125,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
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
                            field: "HlNecesariosEnTCPMerma",
                            title: window.app.idioma.t('HL_NECESARIOS_TCP_MERMA'),
                            width: 135,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "HlEnTCP",
                            title: window.app.idioma.t('HL_TCP'),
                            width: 110,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "HlNecesariosEnTCP",
                            title: window.app.idioma.t('HL_NECESARIOS_TCP'),
                            width: 135,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "MermaFiltracion",
                            title: window.app.idioma.t('MERMA_FILTRACION'),
                            width: 125,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
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
                            field: "HlFiltrar",
                            title: window.app.idioma.t('HL_FILTRAR'),
                            width: 115,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "CoefAumentoVolumen",
                            title: window.app.idioma.t('COEF_AUMENTO_VOLUMEN'),
                            width: 125,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
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
                            field: "HlNecesariosADEnBodega",
                            title: window.app.idioma.t('HL_NECESARIOS_AD_BODEGA'),
                            width: 135,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "CervezaADLargo",
                            title: window.app.idioma.t('TIPO_CERVEZA_AD'),
                        },
                    ],
                    dataBound: function (e) {
                        let ds = e.sender.dataSource;

                        if (!e.sender.primeraCarga) {
                            e.sender.primeraCarga = true;
                            ds.filter({ field: "HlEnvasar", operator: "gt", value: 0 });
                        }

                        $("#gridCocMermasEnvasado").data("kendoGrid")?.dataSource.read();
                        $("#gridCocMermasFiltracion").data("kendoGrid")?.dataSource.read();
                        $("#gridCocCoefAumentoVol").data("kendoGrid")?.dataSource.read();
                    },
                }).data("kendoGrid");

                $("#txtCocSemanas").kendoNumericTextBox({
                    min: 3,
                    max: 15,
                    value: self.numSemanas,
                    decimals: 0,
                    format: "n0",
                    culture: localStorage.getItem("idiomaSeleccionado"),
                });

                window.app.headerGridTooltip($("#gridCocCzaEnvasarCzaAltaDensidad").data("kendoGrid"));
            },
            cocActualizar: function (e) {
                e.preventDefault();
                var self = this;
                var permiso = TienePermiso(423);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                kendo.ui.progress($("#vsplitPanelPlanCoccion"), true);
                let numSemanas = $("#txtCocSemanas").data("kendoNumericTextBox").value();

                $.ajax({
                    url: "../api/ayudaPlanificacion/coccion/calculoPrevision",
                    dataType: "json",
                    data: { numSemanas: numSemanas},
                    success: function (res) {
                        setTimeout(() => {
                            if (res) {
                                RecargarGrid({
                                    grid: self.gridCervEnvasarCervAD,
                                    options: {
                                        group: self.dsCervEnvasarCervAD.group(),
                                        filter: self.dsCervEnvasarCervAD.filter(),
                                        page: 1
                                    }
                                });

                                RecargarGrid({
                                    grid: self.gridCervADMostoFrio,
                                    options: {
                                        group: self.dsCervADMostoFrio.group(),
                                        filter: self.dsCervADMostoFrio.filter(),
                                        page: 1
                                    }
                                });

                                RecargarGrid({
                                    grid: self.gridMostoFrio,
                                    options: {
                                        group: self.dsMostoFrio.group(),
                                        filter: self.dsMostoFrio.filter(),
                                        page: 1
                                    }
                                });

                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ACTUALIZANDO_OK'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ACT_DATOS'), 4000);
                            }
                            kendo.ui.progress($("#vsplitPanelPlanCoccion"), false);
                        }, 5000)
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ACT_DATOS'), 4000);
                        }
                        kendo.ui.progress($("#vsplitPanelPlanCoccion"), false);
                    }
                });
            },
            cocCzaEnvasarCzaAltaDensidadExcel: function () {
                var grid = $("#gridCocCzaEnvasarCzaAltaDensidad").data("kendoGrid");
                grid.saveAsExcel();
            },
            cocCzaEnvasarCzaAltaDensidadLimpiarFiltros: function () {
                const self = this;

                self.dsCervEnvasarCervAD.query({
                    group: [],
                    filter: [],
                    page: 1
                });
            },
            getDataSourceCervADMostoFrio: function () {
                var self = this;

                self.dsCervADMostoFrio = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ayudaPlanificacion/coccion/cervAltaDensidadMostoFrio",
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            id: "IdCervADMostoFrio",
                            fields: {
                                IdCervADMostoFrio: { type: "number" },
                                TipoCervezaAD: { type: "string" },
                                TipoCervADDescripcion: { type: "string" },
                                HlNecesariosADEnBodega: { type: "number" },
                                MermaFermGuarda: { type: "number" },
                                HlNecesariosEnBodega: { type: "number" },
                                HlEnBodega: { type: "number" },
                                HlNecesariosMostoFrio: { type: "number" },
                                TipoMostoFrio: { type: "string" },
                                TipoMostoFrioDescripcion: { type: "string" },
                            }
                        },
                        parse: function (response) {
                            for (const r of response) {
                                r.CervezaADLargo = r.TipoCervezaAD + " - " + r.TipoCervADDescripcion;
                                r.MostoFrioLargo = r.TipoMostoFrio == "Indeterminado" ? r.TipoMostoFrio : r.TipoMostoFrio + " - " + r.TipoMostoFrioDescripcion;
                            }

                            return response;
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            cargarGridCervADMostoFrio: function () {
                var self = this;

                self.gridCervADMostoFrio = $("#gridCocCzaAltaDensidadMostoFrio").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t("CERV_AD_MOSTO_FRIO") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    excelExport: async function (e) {
                        ExcelGridExtra(e, util);
                    },
                    //autoBind: false,
                    dataSource: self.dsCervADMostoFrio,
                    toolbar: kendo.template($("#tmplGridCocCzaAltaDensidadMostoFrioToolbar").html()),
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
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "CervezaADLargo",
                            title: window.app.idioma.t('TIPO_CERVEZA_AD'),
                            width: 275,
                        },
                        {
                            field: "HlNecesariosADEnBodega",
                            title: window.app.idioma.t('HL_NECESARIOS_AD_BODEGA'),
                            //width: 190,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "MermaFermGuarda",
                            title: window.app.idioma.t('MERMA_FERMENTACION_GUARDA'),
                            //width: 180,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
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
                            field: "HlNecesariosEnBodega",
                            title: window.app.idioma.t('HL_NECESARIOS_BODEGA'),
                            //width: 180,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "HlEnBodega",
                            title: window.app.idioma.t('HL_BODEGA'),
                            //width: 130,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "HlNecesariosMostoFrio",
                            title: window.app.idioma.t('HL_NECESARIOS_MOSTO_FRIO'),
                            //width: 180,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "MostoFrioLargo",
                            title: window.app.idioma.t('TIPO_MOSTO_FRIO'),
                            width: 265
                        },
                    ],
                    dataBound: function (e) {
                        let ds = e.sender.dataSource;

                        if (!e.sender.primeraCarga) {
                            e.sender.primeraCarga = true;
                            ds.filter({ field: "HlNecesariosADEnBodega", operator: "gt", value: 0 });
                        }

                        $("#gridCocMermasFermGuarda").data("kendoGrid")?.dataSource.read();
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridCocCzaAltaDensidadMostoFrio").data("kendoGrid"));
            },
            cocCzaAltaDensidadMostoFrioExcel: function () {
                var grid = $("#gridCocCzaAltaDensidadMostoFrio").data("kendoGrid");
                grid.saveAsExcel();
            },
            cocCzaAltaDensidadMostoFrioLimpiarFiltros: function () {
                const self = this;

                self.dsCervADMostoFrio.query({
                    group: [],
                    filter: [],
                    page: 1
                });
            },
            getDataSourceMostoFrio: function () {
                var self = this;

                self.dsMostoFrio = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ayudaPlanificacion/coccion/mostoFrio",
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            id: "IdMostoFrio",
                            fields: {
                                IdMostoFrio: { type: "number" },
                                TipoMostoFrio: { type: "string" },
                                TipoMostoFrioDescripcion: { type: "string" },
                                HlNecesariosMostoFrio: { type: "number" },
                                HlCoccPlanificadas: { type: "number" },
                                HlCoccEnCurso: { type: "number" },
                                HlCocer: { type: "number" },
                                NumCocciones: { type: "number" },
                            }
                        },
                        parse: function (response) {
                            for (const r of response) {
                                r.MostoFrioLargo = r.TipoMostoFrio + " - " + r.TipoMostoFrioDescripcion;
                            }

                            return response;
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            cargarGridMostoFrio: function () {
                var self = this;

                self.gridMostoFrio = $("#gridCocMostoFrio").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t("MOSTO_FRIO") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    excelExport: async function (e) {
                        ExcelGridExtra(e, util);
                    },
                    //autoBind: false,
                    dataSource: self.dsMostoFrio,
                    toolbar: kendo.template($("#tmplGridCocMostoFrioToolbar").html()),
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
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "MostoFrioLargo",
                            title: window.app.idioma.t('TIPO_MOSTO_FRIO'),
                            width: 275,
                        },
                        {
                            field: "HlNecesariosMostoFrio",
                            title: window.app.idioma.t('HL_NECESARIOS_MOSTO_FRIO'),
                            //width: 200,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "HlCoccPlanificadas",
                            title: window.app.idioma.t('HL_COC_PLANIFICADAS'),
                            //width: 180,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "HlCoccEnCurso",
                            title: window.app.idioma.t('HL_COC_CURSO'),
                            //width: 180,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "HlCocer",
                            title: window.app.idioma.t('HL_COCER'),
                            //width: 120,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "NumCocciones",
                            title: window.app.idioma.t('NUM_COCCIONES'),
                            //width: 160,
                            format: "{0:n0}",
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            title: window.app.idioma.t('OPERACIONES'),
                            template: "<button class='boton-add k-button crearWoCocciones'><span class='k-icon k-add'></span>" + window.app.idioma.t('COCCION_CREAR_COCCION') + "</button>",
                            width: 160
                        },
                    ],
                    dataBound: function (e) {
                        let ds = e.sender.dataSource;

                        if (!e.sender.primeraCarga) {
                            e.sender.primeraCarga = true;
                            ds.filter({ field: "HlNecesariosMostoFrio", operator: "gt", value: 0 });
                        }
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridCocMostoFrio").data("kendoGrid"));
            },
            cocMostoFrioExcel: function () {
                var grid = $("#gridCocMostoFrio").data("kendoGrid");
                grid.saveAsExcel();
            },
            cocMostoFrioLimpiarFiltros: function () {
                const self = this;

                self.dsMostoFrio.query({
                    group: [],
                    filter: [],
                    page: 1
                });
            },
            createWP: function (e) {
                var self = this;
                let permiso = TienePermiso(423);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var row = $(e.target).closest("tr");
                var grid = $("#gridCocMostoFrio").data("kendoGrid");
                var dataItem = grid.dataItem(row);

                var param = {
                    material: dataItem.TipoMostoFrio,
                    materialDescripcion: dataItem.TipoMostoFrioDescripcion,
                    nroOrdNec: dataItem.NumCocciones
                };

                let crearWOMultiple = new CrearWOMultiple(param);
            },
            cargarGridsMermasCoeficiente: function () {
                var self = this;

                self.dsCervEnvasarCervAD.fetch(function () {
                    self.gridMermasEnvasadoHelper = self.initSelectableGrid("#gridCocMermasEnvasado",
                        new kendo.data.DataSource(
                            {
                                transport: {
                                    read: function (options) {
                                        var dataCervEnvasarCervAD = self.dsCervEnvasarCervAD.data().toJSON();
                                        options.success(dataCervEnvasarCervAD);
                                    }
                                },
                                schema: {
                                    model: {
                                        id: "IdCervEnvCervAD",
                                        fields: {
                                            MermaEnvasado: { type: "number" },
                                        }
                                    },
                                },
                                pageSize: 50
                            }),
                        "#tmplGridCocMermasEnvasadoToolbar", "#txtCocMermaEnvasado",
                        [
                            {
                                field: "CervezaEnvasarLargo",
                                title: window.app.idioma.t('CERVEZA_A_ENVASAR'),
                            },
                            {
                                field: "MermaEnvasado", title: window.app.idioma.t('MERMA_ENVASADO'),
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
                                field: "CervezaADLargo",
                                title: window.app.idioma.t('TIPO_CERVEZA_AD'),
                            }
                        ]
                    );

                    self.gridMermasFiltracionHelper = self.initSelectableGrid("#gridCocMermasFiltracion",
                        new kendo.data.DataSource(
                            {
                                transport: {
                                    read: function (options) {
                                        var dataCervEnvasarCervAD = self.dsCervEnvasarCervAD.data().toJSON();
                                        options.success(dataCervEnvasarCervAD);
                                    }
                                },
                                schema: {
                                    model: {
                                        id: "IdCervEnvCervAD",
                                        fields: {
                                            MermaFiltracion: { type: "number" },
                                        }
                                    },
                                },
                                pageSize: 50
                            }),
                        "#tmplGridCocMermasFiltracionToolbar", "#txtCocMermaFiltracion",
                        [
                            {
                                field: "CervezaEnvasarLargo",
                                title: window.app.idioma.t('CERVEZA_A_ENVASAR'),
                            },
                            {
                                field: "MermaFiltracion", title: window.app.idioma.t('MERMA_FILTRACION'),
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
                                field: "CervezaADLargo",
                                title: window.app.idioma.t('TIPO_CERVEZA_AD'),
                            }
                        ]
                    );

                    self.gridCoefAumentoVolHelper = self.initSelectableGrid("#gridCocCoefAumentoVol",
                        new kendo.data.DataSource(
                            {
                                transport: {
                                    read: function (options) {
                                        var dataCervEnvasarCervAD = self.dsCervEnvasarCervAD.data().toJSON();
                                        options.success(dataCervEnvasarCervAD);
                                    }
                                },
                                schema: {
                                    model: {
                                        id: "IdCervEnvCervAD",
                                        fields: {
                                            CoefAumentoVolumen: { type: "number" },
                                        }
                                    },
                                },
                                pageSize: 50
                            }),
                        "#tmplGridCocCoefAumentoVolToolbar", "#txtCocCoefAumentoVol",
                        [
                            {
                                field: "CervezaEnvasarLargo",
                                title: window.app.idioma.t('CERVEZA_A_ENVASAR'),
                            },
                            {
                                field: "CoefAumentoVolumen", title: window.app.idioma.t('COEF_AUMENTO_VOLUMEN'),
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
                                field: "CervezaADLargo",
                                title: window.app.idioma.t('TIPO_CERVEZA_AD'),
                            }
                        ]
                    );
                });

                self.dsCervADMostoFrio.fetch(function () {
                    self.gridMermasFermGuardaHelper = self.initSelectableGrid("#gridCocMermasFermGuarda",
                        new kendo.data.DataSource(
                            {
                                transport: {
                                    read: function (options) {
                                        var dataCervADMostoFrio = self.dsCervADMostoFrio.data().toJSON();
                                        options.success(dataCervADMostoFrio);
                                    }
                                },
                                schema: {
                                    model: {
                                        id: "IdCervADMostoFrio",
                                        fields: {
                                            MermaFermGuarda: { type: "number" },
                                        }
                                    },
                                },
                                pageSize: 50
                            }),
                        "#tmplGridCocMermasFermGuardaToolbar", "#txtCocMermaFermGuarda",
                        [
                            {
                                field: "CervezaADLargo",
                                title: window.app.idioma.t('TIPO_CERVEZA_AD'),
                            },
                            {
                                field: "MermaFermGuarda", title: window.app.idioma.t('MERMA_FERMENTACION_GUARDA'),
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
                                field: "MostoFrioLargo",
                                title: window.app.idioma.t('TIPO_MOSTO_FRIO'),
                            }
                        ]
                    );
                });
            },
            initSelectableGrid: function (gridSelector, dataSource, toolbarTemplateId, mermaId, extraColumns) {
                var $grid = $(gridSelector);
                var checkedItems = [];

                var baseColumns = [
                    {
                        width: 30,
                        template: "<input type='checkbox' class='checkbox' style='margin-left: 4px' />",
                        headerTemplate: "<input type='checkbox' class='checkSelectAll' />",
                    }
                ];

                var columns = baseColumns.concat(extraColumns);

                $grid.kendoGrid({
                    dataSource: dataSource,
                    toolbar: kendo.template($(toolbarTemplateId).html()),
                    sortable: true,
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: columns,
                    dataBound: function () {
                        $grid.find(".checkSelectAll").prop("checked", false);
                        checkedItems = [];
                    }
                }).data("kendoGrid");

                $(mermaId).kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                window.app.headerGridTooltip($(gridSelector).data("kendoGrid"));

                $grid.on("change", ".checkSelectAll", function () {
                    var grid = $grid.data("kendoGrid");
                    var rows = grid.tbody.find("tr");
                    var checked = $(this).is(":checked");

                    checkedItems = [];

                    if (checked) {
                        rows.each(function () {
                            var dataItem = grid.dataItem(this);
                            $(this).addClass("k-state-selected");
                            $(this).find(".checkbox").prop("checked", true);
                            checkedItems.push(dataItem);
                        });
                    } else {
                        rows.removeClass("k-state-selected");
                        rows.find(".checkbox").prop("checked", false);
                    }
                });

                $grid.on("change", ".checkbox", function () {
                    var grid = $grid.data("kendoGrid");
                    var row = $(this).closest("tr");
                    var dataItem = grid.dataItem(row);

                    if ($(this).is(":checked")) {
                        row.addClass("k-state-selected");
                        checkedItems.push(dataItem);
                    } else {
                        row.removeClass("k-state-selected");
                        $grid.find(".checkSelectAll").prop("checked", false);
                        checkedItems = checkedItems.filter(item => item !== dataItem);
                    }
                });

                return {
                    getCheckedItems: function () { return checkedItems; },
                    //getDataSource: function () { return $grid.data("kendoGrid").dataSource; },
                    grid: $grid,
                };
            },
            mermasCoefAplicar: function (e, helper, mermaCoefValor, textoRuta) {
                e.preventDefault();
                var self = this;
                let permiso = TienePermiso(423);
                let checkedItems = helper.getCheckedItems();

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                if (checkedItems.length === 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_BEER_SELECTED'), 3000);
                    return;
                }

                if (mermaCoefValor == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_INTRODUCIR_UN'), 3000);
                    return;
                }

                let listaIds = [];
                checkedItems.forEach(function (dataItem, index) {
                    let idMermaCoef = textoRuta == "mermaFermGuarda" ? dataItem.IdCervADMostoFrio : dataItem.IdCervEnvCervAD;
                    listaIds.push(idMermaCoef);
                });

                let data = {
                    listaIds: listaIds,
                    mermaCoef: mermaCoefValor
                }

                $.ajax({
                    type: "PUT",
                    url: "../api/ayudaPlanificacion/coccion/" + textoRuta,
                    dataType: 'json',
                    data: JSON.stringify(data),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).success(function (res) {
                    if (res) {
                        if (textoRuta == "mermaFermGuarda") {
                            self.dsCervADMostoFrio.read();
                        } else {
                            self.dsCervEnvasarCervAD.read();
                        }

                        checkedItems = [];
                        Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('UPDATED_VALUES'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ACT_DATOS'), 4000);
                    }
                }).error(function (err) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ACT_DATOS'), 4000);
                    }
                });
            },
            mermasCoefLimpiarFiltros: function (datasource) {
                datasource.query({
                    group: [],
                    filter: [],
                    page: 1
                });
            },
            getDataSourceConfiguracion: function () {
                var self = this;

                self.dsConfiguracion = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ayudaPlanificacion/coccion/configuracion",
                            dataType: "json"
                        },
                        update: {
                            url: "../api/ayudaPlanificacion/coccion/valorConfiguracion",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                } else {
                                    if (e.responseJSON) {
                                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('GUARDADO_CORRECTAMENTE'), 4000);
                                    } else {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                                    }

                                    var grid = $("#gridCocConfiguracion").data("kendoGrid");
                                    grid.dataSource.read();
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
                            id: "IdConfiguracion",
                            fields: {
                                IdConfiguracion: { type: "number" },
                                Clave: { type: "string", editable: false },
                                Descripcion: { type: "string", editable: false },
                                Valor: { type: "string" },
                                Unidad: { type: "string", editable: false },
                            }
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });

                //return self.dsConfiguracion.fetch();
            },
            cargarGridConfiguracion: function () {
                var self = this;

                self.gridConfiguracion = $("#gridCocConfiguracion").kendoGrid({
                    dataSource: self.dsConfiguracion,
                    toolbar: kendo.template($("#tmplGridCocConfiguracionToolbar").html()),
                    sortable: true,
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    editable: "inline",
                    columns: [
                        {
                            field: "Clave",
                            title: window.app.idioma.t('CLAVE'),
                        },
                        {
                            field: "Descripcion",
                            title: window.app.idioma.t('DESCRIPCION'),
                        },
                        {
                            field: "Valor",
                            title: window.app.idioma.t('VALOR'),
                        },
                        {
                            field: "Unidad",
                            title: window.app.idioma.t('UNIDAD'),
                        },
                        {
                            title: '',
                            attributes: { "align": "center" },
                            width: 150,
                            command: [
                                {
                                    name: "edit",
                                    text: {
                                        edit: window.app.idioma.t("EDITAR"),
                                        update: window.app.idioma.t("ACTUALIZAR"),
                                        cancel: window.app.idioma.t("CANCELAR")
                                    },
                                    click: function (e) {
                                        var permiso = TienePermiso(423);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            $('#gridCocConfiguracion').data("kendoGrid").cancelChanges();
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                    //dataBinding: self.resizeGrid,
                    //save: function (e) {
                    //    RecargarGrid({ grid: self.gridPrevTotal });
                    //    RecargarGrid({ grid: self.gridPrevLineas });
                    //},
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridCocConfiguracion").data("kendoGrid"));
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
            }
        });

        return vistaAyudaCoccion;
    });
