define(['underscore', 'backbone', 'jquery', 'text!../../../ControlGestion/html/HistoricoStocks.html', 'vistas/vDialogoConfirm',
    'compartido/notificaciones', 'jszip', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, PlantillaHistoricoStocks, VistaDlgConfirm, Not, JSZip, enums) {
        var VistaHistoricoStocks = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            grid: null,
            fecha: new Date().midday(),
            fechaCargada: null,
            indexGradoAlcoholico: 0,
            constTipoDatos: enums.TipoDatoEnvioJDE(),
            template: _.template(PlantillaHistoricoStocks),
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

                self.dsTanques = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/controlGestion/historicoStocks",
                            data: function () {
                                var result = {};
                                result.fecha = new Date(self.fecha.setHours(12, 0, 0)).toISOString();

                                return result;
                            },
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                Id: { type: "number" },
                                FechaCaptura: { type: "date" },
                                IdZona: { type: "number" },
                                DescripcionZona: { type: "string" },
                                Ubicacion: { type: "string" },
                                CodigoSemielaborado: { type: "string" },
                                DescripcionSemielaborado: { type: "string" },
                                Proceso: { type: "string" },
                                Cantidad: { type: "number" },
                                Coeficiente: { type: "number" },
                                CantidadCoef: { type: "number" },
                                CantidadCDG: { type: "number" },
                                UnidadMedida: { type: "string" },
                                Extracto: { type: "number" },
                                GradoAlcoholico: { type: "number" },
                                Densidad: { type: "number" },
                                KgExtracto: { type: "number" },
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
            },
            render: function () {
                var self = this;

                DestruirKendoWidgets(self);

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))

                $("#dtpFecha").kendoDatePicker({
                    value: self.fecha,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                self.grid = this.$("#gridTanques").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t("HISTORICO_STOCKS") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    autoBind: false,
                    dataSource: self.dsTanques,
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
                            field: "FechaCaptura",
                            title: window.app.idioma.t('FECHA_CAPTURA'),
                            width: 150,
                            template: '#: kendo.toString(new Date(FechaCaptura), kendo.culture().calendars.standard.patterns.MES_FechaHora)#',
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
                            field: "DescripcionZona",
                            title: window.app.idioma.t("ZONA"),
                            width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionZona#' style='//width: 14px;height:14px;margin-right:5px;'/>#= DescripcionZona #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Ubicacion",
                            title: window.app.idioma.t("UBICACION"),
                            width: 130,
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
                            field: "CodigoSemielaborado",
                            title: window.app.idioma.t("CODIGO_MATERIAL"),
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=CodigoSemielaborado#' style='//width: 14px;height:14px;margin-right:5px;'/>#= CodigoSemielaborado #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionSemielaborado", title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                            width: 250,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionSemielaborado#' style='//width: 14px;height:14px;margin-right:5px;'/>#= DescripcionSemielaborado #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Proceso",
                            title: window.app.idioma.t("Proceso"),
                            width: 125,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Proceso#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Proceso #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Cantidad",
                            title: window.app.idioma.t("CANTIDAD"),
                            template: "#= Cantidad != null ? kendo.format('{0:n2}', parseFloat(Cantidad.toString())) : '--'#",
                            //format: "{0:n2}",
                            aggregates: ["sum"],
                            width: 120,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "Coeficiente",
                            title: window.app.idioma.t("COEF_C"),
                            format: "{0:n2}",
                            template: function (dataItem) {
                                let html = '';

                                if (dataItem.Coeficiente < 0) {
                                    html = "<span style='color:red'>" + dataItem.Coeficiente + "</span>";
                                } else if (dataItem.Coeficiente > 0) {
                                    html = "<span style='color:green'>" + dataItem.Coeficiente + "</span>";
                                } else {
                                    html = "<span>" + dataItem.Coeficiente + "</span>";
                                }

                                return html;
                            },
                            width: 95,
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
                            field: "CantidadCoef",
                            title: window.app.idioma.t("CANTIDAD_COEF"),
                            template: "#= CantidadCoef != null ? kendo.format('{0:n2}', parseFloat(CantidadCoef.toString())) : '--'#",
                            //format: "{0:n2}",
                            aggregates: ["sum"],
                            width: 135,
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
                            field: "CantidadCDG",
                            title: window.app.idioma.t("CANTIDAD_CDG"),
                            template: "#= CantidadCDG != null ? kendo.format('{0:n2}', parseFloat(CantidadCDG.toString())) : '--'#",
                            //format: "{0:n2}",
                            aggregates: ["sum"],
                            width: 135,
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
                            field: "UnidadMedida",
                            template: "#=UnidadMedida ? UnidadMedida.toUpperCase() : ''#",
                            title: window.app.idioma.t("UD_MEDIDA"),
                            width: 100,
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
                            field: "GradoAlcoholico",
                            title: window.app.idioma.t("GRADO_ALCOHOLICO"),
                            template: "#= GradoAlcoholico != null ? kendo.format('{0:n2}',parseFloat(GradoAlcoholico.toString())) : ''#",
                            width: 120,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: "<span class='_ga_' data-index='#= window.app.vista.indexGradoAlcoholico++ #'>#= window.app.vista.calcularGradoAlcoholico( this ) #</span>"
                        },
                        {
                            field: "Extracto",
                            title: window.app.idioma.t("EXTRACTO"),
                            template: "#= Extracto != null ? kendo.format('{0:n2}', parseFloat(Extracto.toString())) : ''#",
                            width: 110,
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
                            field: "Densidad",
                            title: window.app.idioma.t("DENSIDAD"),
                            template: "#= Densidad != null ? kendo.format('{0:n6}', parseFloat(Densidad.toString())) : ''#",
                            width: 110,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 6
                                    });
                                }
                            }
                        },
                        {
                            field: "KgExtracto",
                            title: window.app.idioma.t("KG_EXTRACTO"),
                            template: "#= KgExtracto != null ? kendo.format('{0:n2}', parseFloat(KgExtracto.toString())) : ''#",
                            width: 120,
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
                    dataBinding: self.resizeGrid,
                    dataBound: function (e) {
                        self.fechaCargada = $("#dtpFecha").getKendoDatePicker().value();
                    },
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];

                                row.cells[0].value = kendo.toString(e.data[dataPosition].FechaCaptura, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[6].value = e.data[dataPosition].Cantidad == null ? "--" : kendo.toString(e.data[dataPosition].Cantidad, "n2");
                                row.cells[7].format = "#,##0.00";
                                row.cells[8].value = e.data[dataPosition].CantidadCoef == null ? "--" : kendo.toString(e.data[dataPosition].CantidadCoef, "n2");
                                row.cells[9].value = e.data[dataPosition].CantidadCDG == null ? "--" : kendo.toString(e.data[dataPosition].CantidadCDG, "n2");
                                row.cells[11].value = e.data[dataPosition].GradoAlcoholico == null ? "" : kendo.toString(e.data[dataPosition].GradoAlcoholico, "n2");
                                row.cells[12].value = e.data[dataPosition].Extracto == null ? "" : kendo.toString(e.data[dataPosition].Extracto, "n2");
                                row.cells[13].value = e.data[dataPosition].Densidad == null ? "" : kendo.toString(e.data[dataPosition].Densidad, "n6");
                                row.cells[14].value = e.data[dataPosition].KgExtracto == null ? "" : kendo.toString(e.data[dataPosition].KgExtracto, "n2");
                            } catch (e) {
                            }
                        }
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridTanques").data("kendoGrid"));

                self.resizeGrid();
            },
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnExportExcel': 'exportExcel',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnFiltroCDG': 'filtroCDG',
                'click #btnExportJDE': 'exportJDE',
            },
            calcularGradoAlcoholico(e) {
                var self = this;

                setTimeout(function () {
                    if (!self.calculoGA) {
                        self.calculoGA = true;

                        // Obtenemos todas las filas de datos por agrupacion                        
                        var grupos = [];
                        $("tbody[role='rowgroup']").find("tr.k-grouping-row").each(function () {
                            grupos.push($(this).nextUntil("tr.k-group-footer", "tr[role='row']"));
                        });

                        var i = 0;
                        for (var g of grupos) {
                            // Cantidad total del grupo
                            var total = Array.from(g).map(m => self.grid.dataItem(m).Cantidad).reduce((ac, cv) => ac + cv, 0);
                            var totP = 0;
                            g.each(function (idx, elem) {
                                var dataItem = self.grid.dataItem(this);
                                var gap = dataItem.GradoAlcoholico; // Grado alcoholico ponderado
                                totP += gap * dataItem.Cantidad;
                            })
                            $($("._ga_").get(i++)).html( (totP / total).toFixed(2) );                            
                        }

                        //$("._ga_").each(function (idx, elem) {
                        //    var idx = $(this).data("index");
                        //    $(elem).html(idx);
                        //})
                    }
                    setTimeout(function () {
                        self.calculoGA = false;
                        self.indexGradoAlcoholico = 0;
                    }, 10)
                });

                return '';
            },
            actualiza: function () {
                var self = this;

                self.fecha = $("#dtpFecha").data("kendoDatePicker").value();

                if (!self.fecha) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_FECHA_INTRODUCIDA'), 3000);
                    return;
                }

                RecargarGrid({ grid: self.grid });

                self.ComprobarDatosJDE();
            },
            exportExcel: function () {
                var grid = $("#gridTanques").data("kendoGrid");
                grid.saveAsExcel();
            },
            getFiltroCDG: function () {
                const filtroCDG = {
                    "filters": [
                        {
                            field: "Proceso",
                            operator: "eq",
                            value: "Prellenado"
                        },
                        {
                            field: "Cantidad",
                            operator: "gt",
                            value: 0
                        }
                    ],
                    "logic": "and"
                }

                return filtroCDG;
            },
            filtroCDG: function () {
                var self = this;

                const filtroCDG = self.getFiltroCDG();
                const grupoCDG = [
                    {
                        "field": "CodigoSemielaborado",
                        "dir": "asc",
                        "aggregates": [
                            {
                                "field": "Cantidad",
                                "aggregate": "sum"
                            },
                            {
                                "field": "CantidadCoef",
                                "aggregate": "sum"
                            },
                            {
                                "field": "CantidadCDG",
                                "aggregate": "sum"
                            },
                            {
                                "field": "GradoAlcoholico",
                                "aggregate": "sum"
                            }
                        ]
                    },
                ]

                self.dsTanques.query({
                    group: grupoCDG,
                    filter: filtroCDG,
                    page: 1
                });
            },
            exportJDE: async function () {
                const self = this;

                // Comprobamos que haya registros
                let data = new kendo.data.Query(self.grid.dataSource.data()).filter(self.grid.dataSource.filter()).data;

                if (data.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_HAY_DATOS'), 4000);
                    return;
                }

                // Comprobamos que la fecha del input es la misma de los datos cargados
                if (self.fechaCargada.getTime() != $("#dtpFecha").getKendoDatePicker().value().getTime()) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('CONSUMO_MMPP_ENVIO_JDE_FECHA_NO_COINCIDE'), 4000);
                    return;
                }

                // Comprobamos que el filtro aplicado coincide con el filtroCDG
                if (JSON.stringify(self.grid.dataSource.filter()) != JSON.stringify(self.getFiltroCDG())) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('CONSUMO_MMPP_ENVIO_JDE_FILTRO_NO_CDG'), 4000);
                    return;
                }

                let materialesNoJDE = [];
                try {
                    // Enviamos sólo los materiales que existan en JDE, avisando de los que no en caso de existir antes de enviarlos
                    const materiales = data.map(m => m.CodigoSemielaborado);
                    var result = await self.ComprobarMaterialesJDE(materiales);
                    materialesNoJDE = Object.entries(result)
                        .filter(([codigo, codigoJDE]) => codigoJDE == null)
                        .map(([codigo, codigoJDE]) => codigo);

                    data = data.filter(f => !materialesNoJDE.includes(f.CodigoSemielaborado));

                }
                catch (errMsg) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), errMsg, 4000);
                    return;
                }

                const fecha = $("#dtpFecha").getKendoDatePicker().value();

                OpenWindow(
                    window.app.idioma.t('EXPORTAR_JDE')
                    , window.app.idioma.t('CONFIRMACION_ENVIO_TCP_JDE')
                        .replace('#FECHA#', kendo.toString(fecha.midnight(), kendo.culture().calendars.standard.patterns.MES_FechaHora))
                        .replace('#MATERIALES_NO_JDE#', materialesNoJDE.length == 0 ? "" : window.app.idioma.t("MATERIALES_NO_JDE").replace("#MATERIALES#", materialesNoJDE.join(", ")))
                    , async function (e) {
                        try {
                            await self.EnviarDatosJDE(data, fecha);
                            self.ComprobarDatosJDE();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ENVIO_TCP_JDE'), 4000);
                        }
                        catch (errMsg) {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), errMsg, 4000);
                        }
                    }
                );
            },
            ComprobarDatosJDE: function () {
                const self = this;

                const fecha = self.fecha.midnight();

                const datos = {
                    fecha: fecha.toISOString(),
                    tipoDato: self.constTipoDatos.TCP
                }

                const hora = kendo.toString(fecha, "HHmmss");

                if (hora != "000000") {
                    $("#EstadoEnvioJDE").find(".txt").html("");
                    $("#EstadoEnvioJDE").hide();
                    return;
                }

                $.ajax({
                    type: "GET",
                    url: "../api/controlGestion/ComprobarDatosFabJDE",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: datos,
                    success: function (res) {

                        if (res) {
                            $("#EstadoEnvioJDE").find(".txt").html(window.app.idioma.t("DATOS_ENVIADOS_JDE_FECHA").replace("#FECHA#", kendo.toString(new Date(res), kendo.culture().calendars.standard.patterns.MES_FechaHora)));
                            $("#EstadoEnvioJDE").show();
                        } else {
                            $("#EstadoEnvioJDE").hide();
                        }
                    },
                    error: function (e) {
                        console.log(e);
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_COMPROBAR_TCP_JDE'), 4000);
                        }
                    }
                });
            },
            ComprobarMaterialesJDE: async function (materiales) {
                const self = this;

                kendo.ui.progress($("#top-pane"), true);

                $(".k-loading-text").html(window.app.idioma.t('COMPROBANDO_MATERIALES') + "...").addClass("progress-text");

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        url: "../api/controlGestion/ComprobarMaterialesJDE",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        data: JSON.stringify(materiales),
                        complete: function () {
                            kendo.ui.progress($("#top-pane"), false);
                        },
                        success: function (res) {
                            resolve(res);
                        },
                        error: function (e) {
                            console.log(e);
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                reject(window.app.idioma.t('AVISO_SIN_PERMISOS'));
                            } else {
                                reject(window.app.idioma.t('ERROR_COMPROBANDO_MATERIALES_JDE'));
                            }
                        }
                    });
                })
            },
            EnviarDatosJDE: async function (datos, fecha) {
                kendo.ui.progress($("#top-pane"), true);

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        url: "../api/controlGestion/EnvioDatosTCPsJDE?fecha=" + fecha.midday().toISOString(),
                        contentType: "application/json; charset=utf-8",
                        //dataType: "json",
                        data: JSON.stringify(datos),
                        complete: function () {
                            kendo.ui.progress($("#top-pane"), false)
                        },
                        success: function (res) {
                            resolve(res);
                        },
                        error: function (e) {
                            console.log(e);
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                reject(window.app.idioma.t('AVISO_SIN_PERMISOS'));
                            } else {
                                reject(window.app.idioma.t('ERROR_ENVIO_TCP_JDE'));
                            }
                        }
                    });
                })
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

                var gridElement = $("#gridTanques"),
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

                self.dsTanques.query({
                    page: 1,
                    pageSize: self.dsTanques.pageSize(),
                    sort: [],
                    filter: []
                });
            },
        });

        return VistaHistoricoStocks;
    });