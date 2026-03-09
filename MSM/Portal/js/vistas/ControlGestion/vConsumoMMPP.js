define(['underscore', 'backbone', 'jquery', 'text!../../../ControlGestion/html/ConsumoMMPP.html', 'vistas/vDialogoConfirm',
    'compartido/notificaciones', 'jszip', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, PlantillaConsumoMMPP, VistaDlgConfirm, Not, JSZip, enums) {
        var VistaConsumo = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            tipoTurno: null,
            grid: null,
            fecha: new Date().midnight(),
            fechaCargada: null,
            constTipoDatos: enums.TipoDatoEnvioJDE(),
            template: _.template(PlantillaConsumoMMPP),
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

                self.dsConsumos = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/controlGestion/consumosMMPPCoccion",
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
                                Ubicacion: { type: "string" },
                                IdMosto: { type: "string" },
                                DescripcionMosto: { type: "string" },
                                CantidadProducida: { type: "number" },
                                GradoPlato: { type: "number" },
                                IdMaterial: { type: "string" },
                                Clase: { type: "string" },
                                DescripcionMaterial: { type: "string" },
                                IdProveedor: { type: "string" },
                                DescripcionProveedor: { type: "string" },
                                Cantidad: { type: "number" },
                                Coeficiente: { type: "number" },
                                CantidadCoef: { type: "number" },
                                CantidadCDG: { type: "number" },
                                UnidadMedida: { type: "string" },
                                NumCoccion: { type: "number"}
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
                    excel: {
                        fileName: window.app.idioma.t("CONSUMO_MMPP") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
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
                        },
                        {
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
                            //aggregates: ["sum"],
                            width: 140,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            //groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
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
                            field: "DescripcionProveedor", title: window.app.idioma.t("DESCRIPCION_PROVEEDOR"), width: 160,
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
                            format: "{0:n2}",
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
                            format: "{0:n2}",
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
                            width: 115,
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
                    ],
                    dataBinding: self.resizeGrid,
                    dataBound: function (e) {
                        self.fechaCargada = $("#dtpFecha").getKendoDateTimePicker().value();
                    },
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];

                                row.cells[4].format = "#,##0.00";
                                row.cells[5].value = kendo.toString(e.data[dataPosition].GradoPlato, "n2");
                                row.cells[11].format = "#,##0.00";
                                row.cells[12].format = "#,##0.00";
                                row.cells[13].format = "#,##0.00";
                                row.cells[14].format = "#,##0.00";
                            } catch (e) {
                            }
                        }
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridConsumos").data("kendoGrid"));

                self.resizeGrid();
            },
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnFiltroCDG': 'filtroCDG',
                'click #btnExportJDE': 'exportJDE',
                'click #btnExportExcel': 'exportExcel',
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

                self.ComprobarDatosJDE();
            },
            getFiltroCDG: function () {
                const filtroCDG = {
                    "filters": [
                        {
                            "value": "Malta",
                            "operator": "eq",
                            "field": "Clase"
                        },
                        {
                            "value": "Adjuntos",
                            "operator": "eq",
                            "field": "Clase"
                        },
                        {
                            "value": "Glucosa",
                            "operator": "eq",
                            "field": "Clase"
                        },
                        /*{
                            "value": "Aroma",
                            "operator": "eq",
                            "field": "Clase"
                        }*/
                    ],
                    "logic": "or"
                }

                return filtroCDG;
            },
            filtroCDG: function () {
                var self = this;

                const filtroCDG = self.getFiltroCDG();
                const grupoCDG = [
                    {
                        "field": "DescripcionMosto",
                        "dir": "asc",
                        "aggregates": [
                            {
                                "field": "CantidadProducida",
                                "aggregate": "sum"
                            },
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
                            }
                        ]
                    },
                    {
                        "field": "NumCoccion",
                        "dir": "asc",
                        "aggregates": [
                            {
                                "field": "CantidadProducida",
                                "aggregate": "sum"
                            },
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
                            }
                        ]
                    },
                    {
                        "field": "DescripcionMaterial",
                        "dir": "asc",
                        "aggregates": [
                            {
                                "field": "CantidadProducida",
                                "aggregate": "sum"
                            },
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
                            }
                        ]
                    }
                ]

                self.dsConsumos.query({
                    group: grupoCDG,
                    filter: filtroCDG,
                    page: 1
                });
            },
            exportExcel: function () {
                var grid = $("#gridConsumos").data("kendoGrid");
                grid.saveAsExcel();
            },
            exportJDE: async function () {
                const self = this;

                // Comprobamos que haya registros 
                const data = new kendo.data.Query(self.grid.dataSource.data()).filter(self.grid.dataSource.filter()).data;

                if (data.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_HAY_DATOS'), 4000);
                    return;
                }

                // Comprobamos que la fecha del input es la misma de los datos cargados
                if (self.fechaCargada.getTime() != $("#dtpFecha").getKendoDateTimePicker().value().getTime()) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('CONSUMO_MMPP_ENVIO_JDE_FECHA_NO_COINCIDE'), 4000);
                    return;
                }

                // Comprobamos que la hora del input fecha sean las 00
                const fecha = $("#dtpFecha").getKendoDateTimePicker().value();
                const hora = kendo.toString(fecha, "HHmmss");

                if (hora != "000000") {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_HORA_MEDIANOCHE') || "La hora seleccionada debe ser las 00:00:00.", 4000);
                    return;
                }

                // Comprobamos que el filtro aplicado coincide con el filtroCDG
                if (JSON.stringify(self.grid.dataSource.filter()) != JSON.stringify(self.getFiltroCDG())) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('CONSUMO_MMPP_ENVIO_JDE_FILTRO_NO_CDG'), 4000);
                    return;
                }

                // Comprobar que todos los materiales existen en JDE
                try {
                    // Comprobamos que todos los materiales de las cocciones existen en JDE
                    const materiales = data.map(m => m.IdMaterial);                    
                    var result = await self.ComprobarMaterialesJDE(materiales);
                    if (Object.values(result).some(x => x === null)) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CONSUMO_MMPP_MATERIAL_NOJDE'), 4000);
                        return;
                    }

                    // Comprobamos que las cocciones asociadas a estos consumos ya han sido exportadas a JDE
                    const cocciones = data.map(m => m.NumCoccion);
                    var result = await self.ComprobarCoccionesJDE(cocciones);
                    if (!result) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CONSUMO_MMPP_COCCION_NOJDE'), 4000);
                        return;
                    }                    
                    
                }
                catch (errMsg) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), errMsg, 4000);
                    return;
                }

                OpenWindow(
                    window.app.idioma.t('EXPORTAR_JDE')
                    , window.app.idioma.t('CONFIRMACION_ENVIO_CONSUMO_MMPP_COCCION_JDE')
                        .replace('#FECHA_INI#', kendo.toString(fecha.addDays(-1), kendo.culture().calendars.standard.patterns.MES_FechaHora))
                        .replace('#FECHA_FIN#', kendo.toString(fecha, kendo.culture().calendars.standard.patterns.MES_FechaHora))
                    , async function (e) {
                        try {
                            await self.EnviarDatosJDE(data, fecha);
                            self.ComprobarDatosJDE();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ENVIO_CONSUMO_MMPP_JDE'), 4000);
                        }
                        catch (errMsg) {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), errMsg, 4000);
                        }
                    }
                );
            },
            ComprobarDatosJDE: function () {
                const self = this;

                const fecha = self.fecha;

                const datos = {
                    fecha: fecha.addDays(-1).midday().toISOString(),
                    tipoDato: self.constTipoDatos.CONSUMO_MMPP_COCCION
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
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_COMPROBAR_COCCIONES_JDE'), 4000);
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
            ComprobarCoccionesJDE: async function (cocciones) {
                const self = this;

                kendo.ui.progress($("#top-pane"), true);

                $(".k-loading-text").html(window.app.idioma.t('COMPROBANDO_COCCIONES')+"...").addClass("progress-text");

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        url: "../api/controlGestion/ComprobarCoccionesJDE",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        data: JSON.stringify(cocciones),
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
                                reject(window.app.idioma.t('ERROR_COMPROBANDO_COCCIONES_JDE'));
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
                        url: "../api/controlGestion/EnvioDatosConsumoMMPPCoccionJDE?fecha=" + fecha.midday().toISOString(),
                        contentType: "application/json; charset=utf-8",
                        //dataType: "json",
                        data: JSON.stringify(datos),
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
                                reject(window.app.idioma.t('ERROR_ENVIO_CONSUMO_MMPP_JDE'));
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