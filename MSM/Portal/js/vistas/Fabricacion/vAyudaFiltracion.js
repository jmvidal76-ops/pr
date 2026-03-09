define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/AyudaFiltracion.html', 'jszip', 'compartido/notificaciones',
    'vistas/vDialogoConfirm', 'compartido/util'],
    function (_, Backbone, $, plantillaAyudaFiltracion, JSZip, Not, VistaDlgConfirm, util) {
        var checkedItems;

        var vistaAyudaFiltracion = Backbone.View.extend({
            tagName: 'div',
            template: _.template(plantillaAyudaFiltracion),
            gridPrevTotal: null,
            gridPrevLineas: null,
            gridMermas: null,
            gridConfiguracion: null,
            gridConexionLinea: null,
            dsPrevisionTotal: null,
            dsPrevisionLineas: null,
            dsMermas: null,
            dsConfiguracion: null,
            dsConexionLinea: null,
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                Backbone.on('eventActProd', this.actualiza, this);

                self.getDataSourceConfiguracion();
                self.getDataSourcePrevisionTotal();
                self.getDataSourcePrevisionLineas();
                self.getDataSourceMermas();

                self.render();
            },
            render: function () {
                var self = this;

                this.$el.html(this.template());
                $('#center-pane').append(this.$el);

                checkedItems = [];

                this.tab = util.ui.createTabStrip('#divPestanias', {
                    select: function (e) {
                        self.SelectTab(e, self);
                    }
                });

                // Panel Planificar Filtracion
                util.ui.createVSplitter('#vsplitPanelPlanFiltracion', ['50%', '50%']);

                // Panel Parametros
                util.ui.createVSplitter('#vsplitPanelParametros', ['35%', '30%', '35%']);

                self.cargarGridPrevisionTotal();
                self.cargarGridPrevisionLineas();

                $.each(window.app.planta.lineas, function (index, linea) {
                    $("<div>").attr("id", linea.id.replace(/\./g, "-")).addClass("line").text("L" + linea.numLineaDescripcion).appendTo("#lineas");
                });

                self.cargarGridMermas();
                self.cargarGridConfiguracion();
                self.cargarGridConexionLinea();

                util.ui.enableResizeCenterPane();
            },
            actualiza: function () {
                var self = this;

                RecargarGrid({ grid: self.gridConfiguracion });
                RecargarGrid({ grid: self.gridMermas });
                RecargarGrid({ grid: self.gridConexionLinea });
            },
            events: {
                'click #btnFilPrevTotalActualizar': 'filPrevTotalActualizar',
                'click #btnFilPrevTotalExcel': 'filPrevTotalExcel',
                'click #btnFilPrevTotalLimpiarFiltros': 'filPrevTotalLimpiarFiltros',
                'click #btnFilPrevLineasExcel': 'filPrevLineasExcel',
                'click #btnFilPrevLineasLimpiarFiltros': 'filPrevLineasLimpiarFiltros',
                'click #btnFilMermasAplicar': 'filMermasAplicar',
                'click #btnFilMermasLimpiarFiltros': 'filMermasLimpiarFiltros',
                'click #checkSelectAll': 'selectRowAll',
                'change .checkbox-conexion': 'actualizaConexionTCPLinea'
            },
            SelectTab: function (e, self) {
                //switch ($(e.item).index()) {
                //    case 0:
                //        if (self.cambioEnParametros) {
                //            //self.RefreshAllPlanningData();
                //            self.cambioEnParametros = false;
                //        }

                //        break;
                //    case 1:
                //        //self.RefreshAllParametersData();
                //        break;
                //}
            },
            getDataSourcePrevisionTotal: function () {
                var self = this;

                self.dsPrevisionTotal = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ayudaPlanificacion/filtracion/datosTotales",
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            id: "IdDatosTotales",
                            fields: {
                                IdDatosTotales: { type: "number" },
                                CodigoCerveza: { type: "string" },
                                CodigoCervezaDescripcion: { type: "string" },
                                Tipo: { type: "boolean" },
                                HlEnvasar: { type: "number" },
                                MermaEnvasado: { type: "number" },
                                HlNecesarios: { type: "number" },
                                HlEnTCP: { type: "number" },
                                BalanceHl: { type: "number" },
                                FechaInicioConsumo: { type: "date" },
                                FechaFinConsumo: { type: "date" },
                            }
                        },
                        parse: function (response) {
                            for (const r of response) {
                                r.CervezaEnvasar = r.CodigoCerveza + " - " + r.CodigoCervezaDescripcion;
                                r.TipoCerveza = r.Tipo == 0 ? "B/L" : "Barril";
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
            cargarGridPrevisionTotal: function () {
                var self = this;

                self.gridPrevTotal = $("#gridFilPrevTotal").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t("PREVISION_FILTRACIONES") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    excelExport: async function (e) {
                        ExcelGridExtra(e, util);
                    },
                    //autoBind: false,
                    dataSource: self.dsPrevisionTotal,
                    toolbar: kendo.template($("#tmplGridFilPrevTotalToolbar").html()),
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
                            field: "CervezaEnvasar",
                            title: window.app.idioma.t('CERVEZA_A_ENVASAR'),
                        },
                        {
                            field: "TipoCerveza",
                            title: window.app.idioma.t('TIPO_CERVEZA'),
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=TipoCerveza#' style='width: 14px;height:14px;margin-right:5px;'/>#=TipoCerveza#</label></div>";
                                }
                            }
                        },
                        {
                            field: "HlEnvasar",
                            title: window.app.idioma.t('HL_ENVASAR'),
                            width: 160,
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
                            width: 200,
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
                            field: "HlNecesarios",
                            title: window.app.idioma.t('HL_NECESARIOS'),
                            width: 160,
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
                            width: 160,
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
                            field: "BalanceHl",
                            title: window.app.idioma.t('BALANCE_HL'),
                            width: 160,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
                            aggregates: ["sum"],
                            template: function (dataItem) {
                                let html = '';
                                let dataConfig = self.dsConfiguracion.data();

                                if (dataConfig.length > 0) {
                                    let limiteAviso = parseInt(dataConfig[1].Valor);
                                    let limiteCritico = parseInt(dataConfig[2].Valor);

                                    if (dataItem.BalanceHl < limiteCritico) {
                                        html = "<span class='balanceRojo' data-cerveza='" + dataItem.CodigoCerveza + "' data-tipo='" + dataItem.Tipo + "'style='color:red'>" + kendo.format("{0:n2}", dataItem.BalanceHl) + "</span>";
                                    } else if (dataItem.BalanceHl >= limiteCritico && dataItem.BalanceHl <= limiteAviso) {
                                        html = "<span class='balanceNaranja' data-cerveza='" + dataItem.CodigoCerveza + "' data-tipo='" + dataItem.Tipo + "'style='color:orange'>" + kendo.format("{0:n2}", dataItem.BalanceHl) + "</span>";
                                    } else {
                                        html = "<span style='color:green'>" + kendo.format("{0:n2}", dataItem.BalanceHl) + "</span>";
                                    }
                                }

                                return html;
                            },
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
                            field: "FechaInicioConsumo",
                            title: window.app.idioma.t('FECHA_INICIO_CONSUMO'),
                            width: 180,
                            template: '#= FechaInicioConsumo != null ? kendo.toString(FechaInicioConsumo, kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            _excelOptions: {
                                format: "dd/mm/yy hh:mm:ss",
                                template: "#= value.FechaInicioConsumo ? GetDateForExcel(value.FechaInicioConsumo) : ''#"
                            },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            field: "FechaFinConsumo",
                            title: window.app.idioma.t('FECHA_FIN_CONSUMO'),
                            width: 180,
                            template: '#= FechaFinConsumo != null ? kendo.toString(FechaFinConsumo, kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            _excelOptions: {
                                format: "dd/mm/yy hh:mm:ss",
                                template: "#= value.FechaFinConsumo ? GetDateForExcel(value.FechaFinConsumo) : ''#"
                            },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                    ],
                    dataBound: function (e) {
                        let ds = e.sender.dataSource;

                        if (!e.sender.primeraCarga) {
                            e.sender.primeraCarga = true;
                            ds.filter({ field: "HlEnvasar", operator: "gt", value: 0 });
                        }
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridFilPrevTotal").data("kendoGrid"));
            },
            filPrevTotalActualizar: async function (e) {
                e.preventDefault();
                const self = this;
                const permiso = TienePermiso(413);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                kendo.ui.progress($("#vsplitPanelPlanFiltracion"), true);

                try {
                    //Lanzamos el cálculo
                    await $.ajax({
                        url: "../api/ayudaPlanificacion/filtracion/calculoPrevision",
                        dataType: "json"
                    });

                    // 2. Compruebo que haya terminado
                    const estado = await self.esperarFinCalculo(120000); // 2 minutos de tiempo máximo

                    if (estado === "finalizado") {

                        RecargarGrid({
                            grid: self.gridPrevTotal,
                            options: {
                                group: self.dsPrevisionTotal.group(),
                                filter: self.dsPrevisionTotal.filter(),
                                page: 1
                            }
                        });

                        RecargarGrid({
                            grid: self.gridPrevLineas,
                            options: {
                                group: self.dsPrevisionLineas.group(),
                                filter: self.dsPrevisionLineas.filter(),
                                page: 1
                            }
                        });

                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ACTUALIZANDO_OK'), 4000);
                    }
                    else if (estado === "timeout") {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t("TIEMPO_AGOTADO"), 4000);
                    }
                    else {

                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ACT_DATOS'), 4000);
                    }

                }
                catch (err) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ACT_DATOS'), 4000);
                    }
                }
                finally {
                    kendo.ui.progress($("#vsplitPanelPlanFiltracion"), false);
                }
            },
            comprobarFinCalculoPrevision: async function () {
                try {
                    const res = await $.ajax({
                        url: "../api/ayudaPlanificacion/filtracion/comprobarFinCalculoPrevision",
                        dataType: "json"
                    });

                    return res;
                } catch (err) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ACT_DATOS'), 4000);
                    }
                    return false;
                }
            },
            esperarFinCalculo: async function (timeoutMs = 2 * 60 * 1000) {
                const self = this;

                const intervalo = 5000;
                const inicio = Date.now();


                while (true) {
                    const estado = await self.comprobarFinCalculoPrevision();

                    // Si API devuelve true → terminado
                    if (estado === true) {
                        return "finalizado";
                    }

                    // Si API devuelve null → error
                    if (estado === null) {
                        return "error";
                    }

                    // (estado === false) → seguir esperando

                    // Comprobamos timeout
                    if (Date.now() - inicio > timeoutMs) {
                        return "timeout";
                    }

                    await new Promise(resolve => setTimeout(resolve, intervalo));
                }
            },
            filPrevTotalExcel: function () {
                var grid = $("#gridFilPrevTotal").data("kendoGrid");
                grid.saveAsExcel();
            },
            filPrevTotalLimpiarFiltros: function () {
                const self = this;

                self.dsPrevisionTotal.query({
                    group: [],
                    filter: [],
                    page: 1
                });
            },
            getDataSourcePrevisionLineas: function () {
                var self = this;

                self.dsPrevisionLineas = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ayudaPlanificacion/filtracion/datosLineas",
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            id: "IdDatosLineas",
                            fields: {
                                IdDatosLineas: { type: "number" },
                                CodigoCerveza: { type: "string" },
                                CodigoCervezaDescripcion: { type: "string" },
                                Tipo: { type: "boolean" },
                                HlEnvasar: { type: "number" },
                                MermaEnvasado: { type: "number" },
                                HlNecesarios: { type: "number" },
                                HlEnTCP: { type: "number" },
                                BalanceHl: { type: "number" },
                            }
                        },
                        parse: function (response) {
                            for (const r of response) {
                                r.CervezaEnvasar = r.CodigoCerveza + " - " + r.CodigoCervezaDescripcion;
                                r.TipoCerveza = r.Tipo == 0 ? "B/L": "Barril";
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
            cargarGridPrevisionLineas: function () {
                var self = this;

                self.gridPrevLineas = $("#gridFilPrevLineas").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t("PREVISION_FILTRACIONES_LINEA") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    excelExport: async function (e) {
                        ExcelGridExtra(e, util);
                    },
                    //autoBind: false,
                    dataSource: self.dsPrevisionLineas,
                    toolbar: kendo.template($("#tmplGridFilPrevLineasToolbar").html()),
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
                            field: "Linea",
                            title: window.app.idioma.t('LINEA'),
                            width: 240,
                            template: "#:ObtenerLineaDescripcion(Linea)#",
                            _excelOptions: {
                                template: "#:ObtenerLineaDescripcion(value.Linea)#",
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#:ObtenerLineaDescripcion(Linea)#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CervezaEnvasar",
                            title: window.app.idioma.t('CERVEZA_A_ENVASAR'),
                        },
                        {
                            field: "TipoCerveza",
                            title: window.app.idioma.t('TIPO_CERVEZA'),
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=TipoCerveza#' style='width: 14px;height:14px;margin-right:5px;'/>#=TipoCerveza#</label></div>";
                                }
                            }
                        },
                        {
                            field: "HlEnvasar",
                            title: window.app.idioma.t('HL_ENVASAR'),
                            width: 200,
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
                            width: 200,
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
                            field: "HlNecesarios",
                            title: window.app.idioma.t('HL_NECESARIOS'),
                            width: 200,
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
                            width: 200,
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
                            field: "BalanceHl",
                            title: window.app.idioma.t('BALANCE_HL'),
                            width: 200,
                            format: "{0:n2}",
                            _excelOptions: {
                                format: "#,##0.00",
                            },
                            aggregates: ["sum"],
                            template: function (dataItem) {
                                let html = '';
                                let dataConfig = self.dsConfiguracion.data();

                                if (dataConfig.length > 0) {
                                    let limiteAviso = parseInt(dataConfig[1].Valor);
                                    let limiteCritico = parseInt(dataConfig[2].Valor);

                                    if (dataItem.BalanceHl < limiteCritico) {
                                        html = "<span style='color:red'>" + kendo.format("{0:n2}", dataItem.BalanceHl) + "</span>";
                                    } else if (dataItem.BalanceHl >= limiteCritico && dataItem.BalanceHl <= limiteAviso) {
                                        html = "<span style='color:orange'>" + kendo.format("{0:n2}", dataItem.BalanceHl) + "</span>";
                                    } else {
                                        if (dataItem.HlEnvasar > 0) {
                                            html = "<span class='conHlEnvasar' data-cerveza='" + dataItem.CodigoCerveza + "' data-tipo='" + dataItem.Tipo + "'style='color:green'>" + kendo.format("{0:n2}", dataItem.BalanceHl) + "</span>";
                                        } else {
                                            html = "<span style='color:green'>" + kendo.format("{0:n2}", dataItem.BalanceHl) + "</span>";
                                        }
                                    }
                                }

                                return html;
                            },
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
                    ],
                    dataBound: function (e) {
                        let ds = e.sender.dataSource;

                        if (!e.sender.primeraCarga) {
                            e.sender.primeraCarga = true;
                            ds.filter({ field: "HlEnvasar", operator: "gt", value: 0 });
                        }

                        self.colorearLineas(e);
                    },
                    //dataBinding: self.resizeGrid,
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridFilPrevLineas").data("kendoGrid"));
            },
            colorearLineas: function (e) {
                var self = this;
                let grid = e.sender;
                let data = grid.dataSource.data();
                let lineasColor = {}; // clave = Linea, valor = color

                let dataConfig = self.dsConfiguracion.data();
                if (dataConfig.length === 0) return;

                let limiteAviso = parseInt(dataConfig[1].Valor);
                let limiteCritico = parseInt(dataConfig[2].Valor);

                data.forEach(function (item) {
                    if (!lineasColor[item.Linea]) {
                        if (item.BalanceHl < limiteCritico) {
                            lineasColor[item.Linea] = "red";
                        } else if (item.BalanceHl >= limiteCritico && item.BalanceHl <= limiteAviso) {
                            lineasColor[item.Linea] = "orange";
                        }
                    }
                });

                // Se cruza con gridFilPrevTotal
                let gridTotal = $("#gridFilPrevTotal").data("kendoGrid");
                if (gridTotal) {
                    $("#gridFilPrevLineas .conHlEnvasar").each(function () {
                        let $el = $(this);
                        let codCerveza = $el.data("cerveza");
                        let tipo = $el.data("tipo");

                        // Busca en el grid total una celda que coincida por cerveza y tipo
                        let $celdaTotal = $("#gridFilPrevTotal").find(
                            ".balanceRojo[data-cerveza='" + codCerveza + "'][data-tipo='" + tipo + "'], " +
                            ".balanceNaranja[data-cerveza='" + codCerveza + "'][data-tipo='" + tipo + "']"
                        );

                        if ($celdaTotal.length > 0) {
                            let dataItemLinea = grid.dataSource.getByUid($el.closest("tr").data("uid"));
                            let linea = dataItemLinea ? dataItemLinea.Linea : null;

                            if (linea) {
                                if ($celdaTotal.hasClass("balanceRojo")) {
                                    lineasColor[linea] = "red";
                                } else if ($celdaTotal.hasClass("balanceNaranja")) {
                                    lineasColor[linea] = "orange";
                                }
                            }
                        }
                    });
                }

                // Se asigna verde por defecto a las líneas que no tienen color rojo ni naranja
                let todasLineas = Array.from(new Set(data.map(item => item.Linea)));
                todasLineas.forEach(function (linea) {
                    if (!lineasColor[linea]) lineasColor[linea] = "limegreen";
                });

                // Se pintan todas las líneas
                Object.keys(lineasColor).forEach(function (linea) {
                    let idDiv = linea.replace(/\./g, "-");
                    $("#" + idDiv).css("background-color", lineasColor[linea]);
                });
            },
            filPrevLineasExcel: function () {
                var grid = $("#gridFilPrevLineas").data("kendoGrid");
                grid.saveAsExcel();
            },
            filPrevLineasLimpiarFiltros: function () {
                const self = this;

                self.dsPrevisionLineas.query({
                    group: [],
                    filter: [],
                    page: 1
                });
            },
            getDataSourceMermas: function () {
                var self = this;

                self.dsMermas = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ayudaPlanificacion/filtracion/datosLineas",
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            id: "IdDatosLineas",
                            fields: {
                                IdDatosLineas: { type: "number" },
                                Linea: { type: "string" },
                                CodigoCerveza: { type: "string" },
                                CodigoCervezaDescripcion: { type: "string" },
                                MermaEnvasado: { type: "number" },
                            }
                        },
                        parse: function (response) {
                            for (const r of response) {
                                r.CervezaEnvasar = r.CodigoCerveza + " - " + r.CodigoCervezaDescripcion;
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
            cargarGridMermas: function () {
                var self = this;

                self.gridMermas = $("#gridFilMermas").kendoGrid({
                    dataSource: self.dsMermas,
                    toolbar: kendo.template($("#tmplGridFilMermasToolbar").html()),
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
                            width: 30,
                            template: "<input type='checkbox' class='checkbox' style='margin-left: 4px' />",
                            headerTemplate: "<input id='checkSelectAll' type='checkbox' />",
                        },
                        {
                            field: "Linea",
                            title: window.app.idioma.t('LINEA'),
                            template: "#:ObtenerLineaDescripcion(Linea)#",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#:ObtenerLineaDescripcion(Linea)#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CervezaEnvasar",
                            title: window.app.idioma.t('CERVEZA_A_ENVASAR'),
                        },
                        {
                            field: "MermaEnvasado",
                            title: window.app.idioma.t('MERMA_ENVASADO'),
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            }
                        },
                    ],
                    //dataBinding: self.resizeGrid,
                }).data("kendoGrid");

                $("#txtFilMermas").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                //on page change reset selected
                $(self.el).find(".k-pager-numbers").on("click", function () {
                    $("#checkSelectAll").prop('checked', false);
                    checkedItems = [];
                });
                $(self.el).find(".k-pager-nav").on("click", function () {
                    $("#checkSelectAll").prop('checked', false);
                    checkedItems = [];
                });
                $(self.el).find(".k-pager-sizes").on("click", function () {
                    $("#checkSelectAll").prop('checked', false);
                    checkedItems = [];
                });

                //bind click event to the checkbox
                self.gridMermas.table.on("click", ".checkbox", self.selectRow);

                window.app.headerGridTooltip($("#gridFilMermas").data("kendoGrid"));
            },
            filMermasAplicar: function (e) {
                e.preventDefault();
                var self = this;
                let permiso = TienePermiso(413);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                //let grid = $('#gridFilMermas').data('kendoGrid');
                
                //if (grid.select().length === 0) {
                if (checkedItems.length === 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_BEER_SELECTED'), 3000);
                    return;
                }

                let merma = $("#txtFilMermas").data("kendoNumericTextBox").value();
                if (merma == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_INTRODUCIR_UN'), 3000);
                    return;
                }

                let listaIds = [];
                checkedItems.forEach(function (dataItem, index) {
                    listaIds.push(dataItem.IdDatosLineas);
                });

                let data = {
                    listaIds: listaIds,
                    merma: merma
                }

                $.ajax({
                    type: "PUT",
                    url: "../api/ayudaPlanificacion/filtracion/merma",
                    dataType: 'json',
                    data: JSON.stringify(data),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).success(function (res) {
                    if (res) {
                        self.dsMermas.read();
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
            filMermasLimpiarFiltros: function () {
                const self = this;

                self.dsMermas.query({
                    group: [],
                    filter: [],
                    page: 1
                });
            },
            selectRowAll: function (e) {
                var checked = $("#checkSelectAll:checked").val();
                var rows = $("#gridFilMermas").find("tr");
                var grid = $("#gridFilMermas").data("kendoGrid");
                checkedItems = [];

                if (checked) {
                    for (var i = 1; i < rows.length; i++) {
                        $(rows[i]).addClass("k-state-selected");
                        var dataItem = grid.dataItem(rows[i]);
                        checkedItems.push(dataItem);
                    }
                    $("#gridFilMermas").find(".checkbox").prop('checked', true);
                    checkedItems.push()
                } else {
                    $("#gridFilMermas").find("tr").removeClass("k-state-selected");
                    $("#gridFilMermas").find(".checkbox").prop('checked', false);
                }
            },
            selectRow: function () {
                var checked = this.checked,
                    row = $(this).closest("tr"),
                    grid = $("#gridFilMermas").data("kendoGrid"),
                    dataItem = grid.dataItem(row);

                if (checked) {
                    //select the row
                    checkedItems.push(dataItem);
                    row.addClass("k-state-selected");
                } else {
                    //remove selection
                    row.removeClass("k-state-selected");
                    $("#checkSelectAll").prop('checked', false);
                    var index = checkedItems.indexOf(dataItem);

                    if (index > -1) {
                        checkedItems.splice(index, 1);
                    }
                }
            },
            getDataSourceConfiguracion: function () {
                var self = this;

                self.dsConfiguracion = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ayudaPlanificacion/filtracion/configuracion",
                            dataType: "json"
                        },
                        update: {
                            url: "../api/ayudaPlanificacion/filtracion/valorConfiguracion",
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

                                    var grid = $("#gridFilConfiguracion").data("kendoGrid");
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

                return self.dsConfiguracion.fetch();
            },
            cargarGridConfiguracion: function () {
                var self = this;

                self.gridConfiguracion = $("#gridFilConfiguracion").kendoGrid({
                    dataSource: self.dsConfiguracion,
                    toolbar: kendo.template($("#tmplGridFilConfiguracionToolbar").html()),
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
                            //width: 150,
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
                                        var permiso = TienePermiso(413);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            $('#gridFilConfiguracion').data("kendoGrid").cancelChanges();
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                    //dataBinding: self.resizeGrid,
                    save: function (e) {
                        RecargarGrid({ grid: self.gridPrevTotal });
                        RecargarGrid({ grid: self.gridPrevLineas });
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridFilConfiguracion").data("kendoGrid"));
            },
            cargarGridConexionLinea: function () {
                var self = this;

                self.dsConexionLinea = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "/api/ayudaPlanificacion/filtracion/conexionesTCPsLineas",
                            dataType: "json",
                            type: "GET"
                        }
                    },
                    pageSize: 100,
                    error: function (e) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON?.Message || e.statusText, 3000);
                    }
                });

                self.dsConexionLinea.fetch(function () {
                    let data = self.dsConexionLinea.view().toJSON();

                    // Construir columnas dinámicamente
                    let columns = Object.keys(data[0]).filter(key => key !== "TCP").map(function (key) {
                        if (key === "TCPNombre") {
                            return { field: "TCPNombre", title: window.app.idioma.t('TCP'), width: 130 };
                        } else {
                            return {
                                field: key,
                                title: ObtenerLineaDescripcion(key),
                                template: `<input type="checkbox" class="checkbox-conexion" data-tcp="#= TCP #" data-linea="${key}" #= data["${key}"] ? 'checked' : '' # />`,
                            };
                        }
                    });

                    self.gridConexionLinea = $("#gridConexionLinea").kendoGrid({
                        dataSource: self.dsConexionLinea,
                        toolbar: kendo.template($("#tmplGridConexionLineaToolbar").html()),
                        sortable: true,
                        resizable: true,
                        columns: columns
                    }).data("kendoGrid");
                }, function (error) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), error, 3000);
                });
            },
            actualizaConexionTCPLinea(e) {
                const checkbox = $(e.currentTarget);

                const tcp = checkbox.data("tcp");
                const linea = checkbox.data("linea");
                const conexion = checkbox.is(":checked");

                $.ajax({
                    url: "/api/ayudaPlanificacion/filtracion/conexionTCPLinea",
                    type: "PUT",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify({
                        TCP: tcp,
                        Linea: linea,
                        Conexion: conexion
                    }),
                    success: function (res) {
                        if (res) {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('UPDATED_DATAS'), 3000);
                            self.dsConexionLinea.read();
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACT_DATOS'), 3000);
                        }
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACT_DATOS'), 3000);
                        }
                    }
                });
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

        return vistaAyudaFiltracion;
    });
