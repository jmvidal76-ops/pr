define(['underscore', 'backbone', 'jquery', 'text!../../../Alt/html/AnaliticasO2PO.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', 'jszip',
    'vistas/Alt/vEditarCrearAnalitica', 'compartido/util', 'xlsx'],
    function (_, Backbone, $, PlantillaAnaliticasO2, VistaDlgConfirm, Not, JSZip, vistaCrearEditarAnalitica, util, XLSX) {
        var vistaAnaliticasO2PO = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaAnaliticasO2),
            inicio: new Date((new Date()).getTime() - (7 * 24 * 3600 * 1000)),
            fin: new Date(),
            dsAnaliticas: null,
            dsToleranciasO2: null,
            dsParametrosO2: null,
            dsToleranciasCO2: null,
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;
                window.XLSX = XLSX;

                //var splitter = $("#vertical").data("kendoSplitter");
                //splitter.bind("resize", self.resizeGrid);

                self.render();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                this.tab = util.ui.createTabStrip('#divPestanias');

                $("#dtpFechaDesde").kendoDatePicker({
                    value: self.inicio,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#dtpFechaHasta").kendoDatePicker({
                    value: self.fin,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                self.cargarToleranciasO2();
                self.cargarParametrosO2();
                self.cargarToleranciasCO2();
                self.cargarAnaliticas();
                
                util.ui.enableResizeCenterPane();
            },
            cargarAnaliticas: function () {
                var self = this;

                self.dsAnaliticas = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ObtenerAnaliticasO2/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.fechaInicio = self.inicio;
                                result.fechaFin = self.fin;

                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                'Id': { type: "number" },
                                'Linea': { type: "string" },
                                'VolumenEnvase': { type: "string" },
                                'Llenadora': { type: "number" },
                                'IdMuestra': { type: "string" },
                                'Fecha': { type: "date" },
                                'Comentario': { type: "string" },
                                'TCP': { type: "number" },
                                'O2_TCP': { type: "number" },
                                'CO2_TCP': { type: "number" },
                                'TipoMuestra': { type: "string" },
                                'NumGrifo': { type: "number" },
                                'TPO': { type: "number" },
                                'UnidadTPO': { type: "string" },
                                'HSO': { type: "number" },
                                'UnidadHSO': { type: "string" },
                                'DO': { type: "number" },
                                'UnidadDO': { type: "string" },
                                'CO2': { type: "number" },
                                'UnidadCO2': { type: "string" },
                                'CO2_Ts': { type: "number" },
                                'UnidadCO2_Ts': { type: "string" },
                                'HSV': { type: "number" },
                                'UnidadHSV': { type: "string" },
                                'Presion': { type: "number" },
                                'UnidadPresion': { type: "string" },
                                'Temperatura': { type: "number" },
                                'UnidadTemperatura': { type: "string" },
                                'Temperatura_Ts': { type: "number" },
                                'UnidadTemperatura_Ts': { type: "string" },
                                'PresionVacio': { type: "number" },
                                'UnidadPresionVacio': { type: "string" },
                                'PresionEspumado': { type: "number" },
                                'UnidadPresionEspumado': { type: "string" },
                                'PresionSoplado': { type: "number" },
                                'UnidadPresionSoplado': { type: "string" },
                                'ConsumoGas': { type: "number" },
                                'UnidadConsumoGas': { type: "string" },
                                'Fichero': { type: "string" },
                            }
                        }
                    },
                    requestStart: function () {
                        if ($("#gridAnaliticasO2").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridAnaliticasO2"), true);
                        }
                    },
                    requestEnd: function () {
                        if ($("#gridAnaliticasO2").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridAnaliticasO2"), false);
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            $("#center-pane").empty();
                        }
                    }
                });

                //Cargamos el grid con los datos recibidos
                var grid = self.$("#gridAnaliticasO2").kendoGrid({
                    dataSource: self.dsAnaliticas,
                    excel: {
                        fileName: window.app.idioma.t('ANALITICAS_O2_LLENADORAS') + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    sortable: true,
                    resizable: true,
                    selectable: true,
                    height: '95%',
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            //field: "colorSemaforoO2",
                            title: window.app.idioma.t("INDICADOR_O2"),
                            template: function (data) {
                                return self.obtenerColorSemaforoO2(data);
                            },
                            width: 100,
                            filterable: false,
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            //field: "colorSemaforoCO2",
                            title: window.app.idioma.t("INDICADOR_CO2"),
                            template: function (data) {
                                return self.obtenerColorSemaforoCO2(data);
                            },
                            width: 105,
                            filterable: false,
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            field: "VolumenEnvase", title: window.app.idioma.t("VOLUMEN_ENVASE"), width: 150,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        {
                            field: "Llenadora", title: window.app.idioma.t("LLENADORA"), width: 110,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        {
                            field: "IdMuestra", title: window.app.idioma.t("ID_MUESTRA"), width: 115,
                        },
                        {
                            field: "Fecha", title: window.app.idioma.t("FECHA"), width: 150,
                            template: '#: kendo.toString(new Date(Fecha), kendo.culture().calendars.standard.patterns.MES_FechaHora) #',
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
                            field: "Linea", title: window.app.idioma.t("LINEA"), width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#=Linea#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Comentario", title: window.app.idioma.t("COMENTARIO"), width: 250,
                        },
                        {
                            field: "TCP", title: window.app.idioma.t("TCP"), width: 80,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        {
                            field: "O2_TCP", title: window.app.idioma.t("O2_TCP"), width: 100,
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
                            field: "CO2_TCP", title: window.app.idioma.t("CO2_TCP"), width: 110,
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
                            field: "TipoMuestra", title: window.app.idioma.t("TIPO_MUESTRA"), width: 130,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=TipoMuestra#' style='width: 14px;height:14px;margin-right:5px;'/>#=TipoMuestra#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "NumGrifo", title: window.app.idioma.t("NUM_GRIFO"), width: 100,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        {
                            field: "TPO", title: window.app.idioma.t("TPO"), width: 80,
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
                            field: "UnidadTPO", title: window.app.idioma.t("UNIDAD_TPO"), width: 105,
                        },
                        {
                            field: "CO2_Ts", title: window.app.idioma.t("CO2_TS"), width: 105,
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
                            field: "UnidadCO2_Ts", title: window.app.idioma.t("UNIDAD_CO2_TS"), width: 130,
                        },
                        {
                            field: "HSO", title: window.app.idioma.t("HSO"), width: 80,
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
                            field: "UnidadHSO", title: window.app.idioma.t("UNIDAD_HSO"), width: 105,
                        },
                        {
                            field: "DO", title: window.app.idioma.t("DO"), width: 80,
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
                            field: "UnidadDO", title: window.app.idioma.t("UNIDAD_DO"), width: 105,
                        },
                        {
                            field: "CO2", title: window.app.idioma.t("CO2"), width: 80,
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
                            field: "UnidadCO2", title: window.app.idioma.t("UNIDAD_CO2"), width: 105,
                        },
                        {
                            field: "HSV", title: window.app.idioma.t("HSV"), width: 80,
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
                            field: "UnidadHSV", title: window.app.idioma.t("UNIDAD_HSV"), width: 105,
                        },
                        {
                            field: "Presion", title: window.app.idioma.t("PRESION"), width: 100,
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
                            field: "UnidadPresion", title: window.app.idioma.t("UNIDAD_PRESION"), width: 120,
                        },
                        {
                            field: "Temperatura", title: window.app.idioma.t("TEMPERATURA"), width: 125,
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
                            field: "UnidadTemperatura", title: window.app.idioma.t("UNIDAD_TEMPERATURA"), width: 150,
                        },
                        {
                            field: "Temperatura_Ts", title: window.app.idioma.t("TEMPERATURA_TS"), width: 150,
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
                            field: "UnidadTemperatura_Ts", title: window.app.idioma.t("UNIDAD_TEMPERATURA_TS"), width: 175,
                        },
                        {
                            field: "PresionVacio", title: window.app.idioma.t("PRESION_VACIO"), width: 135,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 4
                                    });
                                }
                            }
                        },
                        {
                            field: "UnidadPresionVacio", title: window.app.idioma.t("UNIDAD_PRESION_VACIO"), width: 155,
                        },
                        {
                            field: "PresionEspumado", title: window.app.idioma.t("PRESION_ESPUMADO"), width: 165,
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
                            field: "UnidadPresionEspumado", title: window.app.idioma.t("UNIDAD_PRESION_ESPUMADO"), width: 185,
                        },
                        {
                            field: "PresionSoplado", title: window.app.idioma.t("PRESION_SOPLADO"), width: 150,
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
                            field: "UnidadPresionSoplado", title: window.app.idioma.t("UNIDAD_PRESION_SOPLADO"), width: 175,
                        },
                        {
                            field: "ConsumoGas", title: window.app.idioma.t("CONSUMO_GAS"), width: 135,
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
                            field: "UnidadConsumoGas", title: window.app.idioma.t("UNIDAD_CONSUMO_GAS"), width: 160,
                        },
                        {
                            field: "Fichero", title: window.app.idioma.t("FICHERO"), width: 200,
                        }
                    ],
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var row = sheet.rows[i];
                                row.cells[3].value = kendo.toString(new Date(row.cells[3].value), kendo.culture().calendars.standard.patterns.MES_FechaHora);
                            } catch (e) { }
                        }
                    },
                    //dataBinding: self.resizeGrid
                    dataBound: function () {
                        var grid = $("#gridAnaliticasO2").data("kendoGrid");
                        var data = grid.dataSource.data();
                        $.each(data, function (i, row) {
                            if (row.TipoMuestra == 'A') {
                                $('tr[data-uid="' + row.uid + '"] ').css("background-color", "lightskyblue");
                            }
                        })
                    }
                }).data("kendoGrid");
            },
            cargarToleranciasO2: function () {
                var self = this;

                self.dsToleranciasO2 = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            async: false,
                            url: "../api/ObtenerToleranciasO2/",
                            dataType: "json",
                        },
                        update: {
                            url: "../api/EditarToleranciasO2",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    var gridTol = $("#gridToleranciasO2").data("kendoGrid");
                                    gridTol.dataSource.read();
                                }
                            },
                        },
                        parameterMap: function (options, operation) {
                            if (operation !== "read" && options) {
                                if (options.LimiteIncremento > options.ToleranciaIncremento) {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LIMITE_MAYOR_QUE_TOLERANCIA'), 3000);
                                    $('#gridToleranciasO2').data("kendoGrid").cancelChanges();
                                    return;
                                }
                                return kendo.stringify(options);
                            }
                            return options;
                        }
                    },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                'Id': { type: "number", editable: false },
                                'Linea': { type: "string", editable: false },
                                'LimiteIncremento': { type: "number" },
                                'ToleranciaIncremento': { type: "number" },
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            $("#center-pane").empty();
                        }
                    }
                });

                //Cargamos el grid con los datos recibidos
                var grid = self.$("#gridToleranciasO2").kendoGrid({
                    dataSource: self.dsToleranciasO2,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    editable: "inline",
                    sortable: true,
                    resizable: true,
                    selectable: false,
                    height: '95%',
                    columns: [
                        {
                            field: "Linea", title: window.app.idioma.t("LINEA"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#=Linea#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "LimiteIncremento", title: window.app.idioma.t("LIMITE_INCREMENTO"),
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 1
                                    });
                                }
                            }
                        },
                        {
                            field: "ToleranciaIncremento", title: window.app.idioma.t("TOLERANCIA_INCREMENTO"),
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 1
                                    });
                                }
                            }
                        },
                        {
                            field: "oper",
                            title: window.app.idioma.t("OPERACION"),
                            attributes: { "align": "center" },
                            width: 200,
                            command: [
                                {
                                    name: "edit",
                                    text: {
                                        edit: window.app.idioma.t("EDITAR"),
                                        update: window.app.idioma.t("ACTUALIZAR"),
                                        cancel: window.app.idioma.t("CANCELAR")
                                    },
                                    click: function (e) {
                                        const permiso = TienePermiso(221);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            $('#gridToleranciasO2').data("kendoGrid").cancelChanges();
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                }).data("kendoGrid");
            },
            cargarParametrosO2: function () {
                var self = this;

                self.dsParametrosO2 = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            async: false,
                            url: "../api/ObtenerParametrosO2/",
                            dataType: "json",
                        },
                        update: {
                            url: "../api/EditarParametrosO2",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    $("#gridParametrosO2").data("kendoGrid").dataSource.read();
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
                            id: "Id",
                            fields: {
                                'Id': { type: "number", editable: false },
                                'Linea': { type: "string", editable: false },
                                'ConTPO': { type: "boolean" },
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            $("#center-pane").empty();
                        }
                    }
                });

                //Cargamos el grid con los datos recibidos
                var grid = self.$("#gridParametrosO2").kendoGrid({
                    dataSource: self.dsParametrosO2,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    editable: "inline",
                    sortable: true,
                    resizable: true,
                    selectable: false,
                    height: '95%',
                    columns: [
                        {
                            field: "Linea", title: window.app.idioma.t("LINEA"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#=Linea#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "ConTPO",
                            title: window.app.idioma.t("CON_TPO"),
                            width: 120,
                            template: "# if(typeof ConTPO !== 'undefined') { if(ConTPO){#" + window.app.idioma.t("SI") + "#} else {#" + window.app.idioma.t("NO") + "#}} #",
                            editor: function (e, options) { return self.editorParametro(e, options) },
                        },
                        {
                            field: "oper",
                            title: window.app.idioma.t("OPERACION"),
                            attributes: { "align": "center" },
                            width: 200,
                            command: [
                                {
                                    name: "edit",
                                    text: {
                                        edit: window.app.idioma.t("EDITAR"),
                                        update: window.app.idioma.t("ACTUALIZAR"),
                                        cancel: window.app.idioma.t("CANCELAR")
                                    },
                                    click: function (e) {
                                        const permiso = TienePermiso(221);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            $('#gridParametrosO2').data("kendoGrid").cancelChanges();
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                }).data("kendoGrid");
            },
            editorParametro: function (container, options) {
                $('<select id="dropdownlist" data-bind="value: ' + options.field + '"><option value="true">' + window.app.idioma.t("SI") +
                    '</option><option value="false">' + window.app.idioma.t("NO") + '</option></select>').appendTo(container).kendoDropDownList();
            },
            cargarToleranciasCO2: function () {
                var self = this;

                self.dsToleranciasCO2 = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            async: false,
                            url: "../api/ObtenerToleranciasCO2/",
                            dataType: "json",
                        },
                        update: {
                            url: "../api/EditarToleranciasCO2",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    $("#gridToleranciasCO2").data("kendoGrid").dataSource.read();
                                }
                            },
                        },
                        parameterMap: function (options, operation) {
                            if (operation !== "read" && options) {
                                if (options.ToleranciaInferior > options.LimiteInferior) {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('TOLERANCIA_INF_MAYOR_QUE_LIMITE_INF'), 3000);
                                    $('#gridToleranciasCO2').data("kendoGrid").cancelChanges();
                                    return;
                                }

                                if (options.LimiteInferior > options.LimiteSuperior) {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LIMITE_INF_MAYOR_QUE_LIMITE_SUP'), 3000);
                                    $('#gridToleranciasCO2').data("kendoGrid").cancelChanges();
                                    return;
                                }

                                if (options.LimiteSuperior > options.ToleranciaSuperior) {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LIMITE_SUP_MAYOR_QUE_TOLERANCIA_SUP'), 3000);
                                    $('#gridToleranciasCO2').data("kendoGrid").cancelChanges();
                                    return;
                                }
                                return kendo.stringify(options);
                            }
                            return options;
                        }
                    },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                'Id': { type: "number", editable: false },
                                'Linea': { type: "string", editable: false },
                                'ToleranciaInferior': { type: "number" },
                                'LimiteInferior': { type: "number" },
                                'LimiteSuperior': { type: "number" },
                                'ToleranciaSuperior': { type: "number" },
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            $("#center-pane").empty();
                        }
                    }
                });

                //Cargamos el grid con los datos recibidos
                var grid = self.$("#gridToleranciasCO2").kendoGrid({
                    dataSource: self.dsToleranciasCO2,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    editable: "inline",
                    sortable: true,
                    resizable: true,
                    selectable: false,
                    height: '95%',
                    columns: [
                        {
                            field: "Linea", title: window.app.idioma.t("LINEA"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#=Linea#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "ToleranciaInferior", title: window.app.idioma.t("TOLERANCIA_INFERIOR"),
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
                            field: "LimiteInferior", title: window.app.idioma.t("LIMITE_INFERIOR"),
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
                            field: "LimiteSuperior", title: window.app.idioma.t("LIMITE_SUPERIOR"),
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
                            field: "ToleranciaSuperior", title: window.app.idioma.t("TOLERANCIA_SUPERIOR"),
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
                            field: "oper",
                            title: window.app.idioma.t("OPERACION"),
                            attributes: { "align": "center" },
                            width: 200,
                            command: [
                                {
                                    name: "edit",
                                    text: {
                                        edit: window.app.idioma.t("EDITAR"),
                                        update: window.app.idioma.t("ACTUALIZAR"),
                                        cancel: window.app.idioma.t("CANCELAR")
                                    },
                                    click: function (e) {
                                        const permiso = TienePermiso(221);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            $('#gridToleranciasCO2').data("kendoGrid").cancelChanges();
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                }).data("kendoGrid");
            },
            obtenerColorSemaforoO2: function (datos) {
                let datosToleranciasO2 = $("#gridToleranciasO2").data("kendoGrid").dataSource.data();
                let parametrosO2 = $("#gridParametrosO2").data("kendoGrid").dataSource.data();

                let tolerancia = datosToleranciasO2.filter(function (value, index) {
                    return value.Linea == datos.Linea;
                })[0];

                let parametro = parametrosO2.filter(function (value, index) {
                    return value.Linea == datos.Linea;
                })[0];

                if (!parametro) {
                    return "<img id='imgEstado' src='img/KOP_Rojo.png'></img>";
                }

                let paramComparacion = parametro.ConTPO ? datos.TPO : datos.DO;

                if (tolerancia == undefined) {
                    return "<img id='imgEstado' src='img/KOP_Rojo.png'></img>";
                }

                if (paramComparacion <= tolerancia.LimiteIncremento) {
                    return "<img id='imgEstado' src='img/KOP_Verde.png'></img>";
                }

                if (tolerancia.LimiteIncremento < paramComparacion && paramComparacion <= tolerancia.ToleranciaIncremento) {
                    return "<img id='imgEstado' src='img/KOP_Amarillo.png'></img>";
                }

                if (paramComparacion > tolerancia.ToleranciaIncremento) {
                    return "<img id='imgEstado' src='img/KOP_Rojo.png'></img>";
                }
            },
            obtenerColorSemaforoCO2: function (datos) {
                let datosToleranciasCO2 = $("#gridToleranciasCO2").data("kendoGrid").dataSource.data();
                let tolerancia = datosToleranciasCO2.filter(function (value, index) {
                    return value.Linea == datos.Linea;
                })[0];

                if (tolerancia == undefined) {
                    return "<img id='imgEstado' src='img/KOP_Rojo.png'></img>";
                }

                if (tolerancia.LimiteInferior < datos.CO2_Ts && datos.CO2_Ts < tolerancia.LimiteSuperior) {
                    return "<img id='imgEstado' src='img/KOP_Verde.png'></img>";
                }

                if ((tolerancia.ToleranciaInferior <= datos.CO2_Ts && datos.CO2_Ts <= tolerancia.LimiteInferior) ||
                    (tolerancia.LimiteSuperior <= datos.CO2_Ts && datos.CO2_Ts <= tolerancia.ToleranciaSuperior)) {
                    return "<img id='imgEstado' src='img/KOP_Amarillo.png'></img>";
                }

                if (datos.CO2_Ts < tolerancia.ToleranciaInferior || datos.CO2_Ts > tolerancia.ToleranciaSuperior) {
                    return "<img id='imgEstado' src='img/KOP_Rojo.png'></img>";
                }
            },
            events: {
                'click #btnFiltrar': 'Actualiza',
                'click #btnAnadir': 'AnadirEditar',
                'click #btnEditar': 'AnadirEditar',
                'click #btnEliminar': 'ConfirmarEliminar',
                'click #btnExportExcel': 'ExportarExcel',
                "click #btnImportExcel": function () { $("#inputFile").click() },
                "change #inputFile": function (e) { this.ImportarExcel(e.target.files[0], e); },
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid'
            },
            AnadirEditar: function (e) {
                var self = this;
                const permiso = TienePermiso(221);

                if (permiso) {
                    self.nuevaVentana = (e.currentTarget.id == 'btnAnadir') ? new vistaCrearEditarAnalitica('0') : new vistaCrearEditarAnalitica('1');
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                }
            },
            ConfirmarEliminar: function (e) {
                e.preventDefault();
                var self = this;
                const permiso = TienePermiso(221);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $("#gridAnaliticasO2").data("kendoGrid");
                var data = grid.dataItem(grid.select());

                if (data != null) {
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('ELIMINAR_ANALITICA'),
                        msg: window.app.idioma.t('CONFIRMACION_ELIMINAR_ANALITICA'),
                        funcion: function () { self.Borrar(data); },
                        contexto: this
                    });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                }
            },
            Borrar: function (data) {
                var self = this;

                $.ajax({
                    data: JSON.stringify(data),
                    type: "POST",
                    async: false,
                    url: "../api/EliminarAnaliticaO2",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            self.dsAnaliticas.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ELIMINAR_ANALITICA_CORRECTA'), 3000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ELIMINAR_ANALITICA'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ELIMINAR_ANALITICA'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            ProcesarDatos: function (data) {
                var infoData = [];

                data.forEach(x => {
                    infoData.push({
                        "Linea": x[window.app.idioma.t("LINEA")],
                        "VolumenEnvase": x[window.app.idioma.t("VOLUMEN_ENVASE")],
                        "Llenadora": x[window.app.idioma.t("LLENADORA")],
                        "IdMuestra": x[window.app.idioma.t("ID_MUESTRA")],
                        "Fecha": x[window.app.idioma.t("FECHA")],
                        "Comentario": x[window.app.idioma.t("COMENTARIO")],
                        "TCP": x[window.app.idioma.t("TCP")],
                        "O2_TCP": x[window.app.idioma.t("O2_TCP")],
                        "CO2_TCP": x[window.app.idioma.t("CO2_TCP")],
                        "TipoMuestra": x[window.app.idioma.t("TIPO_MUESTRA")],
                        "NumGrifo": x[window.app.idioma.t("NUM_GRIFO")],
                        "TPO": x[window.app.idioma.t("TPO")],
                        "UnidadTPO": x[window.app.idioma.t("UNIDAD_TPO")],
                        "HSO": x[window.app.idioma.t("HSO")],
                        "UnidadHSO": x[window.app.idioma.t("UNIDAD_HSO")],
                        "DO": x[window.app.idioma.t("DO")],
                        "UnidadDO": x[window.app.idioma.t("UNIDAD_DO")],
                        "CO2": x[window.app.idioma.t("CO2")],
                        "UnidadCO2": x[window.app.idioma.t("UNIDAD_CO2")],
                        "CO2_Ts": x[window.app.idioma.t("CO2_TS")],
                        "UnidadCO2_Ts": x[window.app.idioma.t("UNIDAD_CO2_TS")],
                        "HSV": x[window.app.idioma.t("HSV")],
                        "UnidadHSV": x[window.app.idioma.t("UNIDAD_HSV")],
                        "Presion": x[window.app.idioma.t("PRESION")],
                        "UnidadPresion": x[window.app.idioma.t("UNIDAD_PRESION")],
                        "Temperatura": x[window.app.idioma.t("TEMPERATURA")],
                        "UnidadTemperatura": x[window.app.idioma.t("UNIDAD_TEMPERATURA")],
                        "Temperatura_Ts": x[window.app.idioma.t("TEMPERATURA_TS")],
                        "UnidadTemperatura_Ts": x[window.app.idioma.t("UNIDAD_TEMPERATURA_TS")],
                        "PresionVacio": x[window.app.idioma.t("PRESION_VACIO")],
                        "UnidadPresionVacio": x[window.app.idioma.t("UNIDAD_PRESION_VACIO")],
                        "PresionEspumado": x[window.app.idioma.t("PRESION_ESPUMADO")],
                        "UnidadPresionEspumado": x[window.app.idioma.t("UNIDAD_PRESION_ESPUMADO")],
                        "PresionSoplado": x[window.app.idioma.t("PRESION_SOPLADO")],
                        "UnidadPresionSoplado": x[window.app.idioma.t("UNIDAD_PRESION_SOPLADO")],
                        "ConsumoGas": x[window.app.idioma.t("CONSUMO_GAS")],
                        "UnidadConsumoGas": x[window.app.idioma.t("UNIDAD_CONSUMO_GAS")],
                        "Fichero": x[window.app.idioma.t("FICHERO")],
                    });
                });

                return infoData;
            },
            ImportarExcel: function (fichero, e) {
                var self = this;

                if (fichero.type != 'application/vnd.ms-excel' && fichero.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FORMATO_FICHERO_NO_VALIDO'), 4000);
                    return;
                }

                var reader = new FileReader();
                reader.readAsArrayBuffer(fichero)
                reader.onload = function () {
                    var workbook = XLSX.read(reader.result, { type: 'buffer' });
                    var sheet = workbook.Sheets[workbook.SheetNames[0]];
                    var json = XLSX.utils.sheet_to_json(sheet, null);

                    if (json.length == 0) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FORMATO_FICHERO_NO_VALIDO'), 4000);
                        return;
                    }

                    var validData = self.ProcesarDatos(json);
                    kendo.ui.progress($('#gridAnaliticasO2'), true);
                    e.target.value = "";

                    $.ajax({
                        type: "POST",
                        data: JSON.stringify(validData),
                        async: false,
                        url: "../api/GuardarAnaliticasO2Importar",
                        contentType: "application/json; charset=utf-8",
                        success: function (res) {
                            kendo.ui.progress($('#gridAnaliticasO2'), false);
                            var mensaje = res + window.app.idioma.t('SUBIDA_ARCHIVO_EXCEL_1') + validData.length + window.app.idioma.t('SUBIDA_ARCHIVO_EXCEL_2');
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), mensaje, 4000);

                            self.dsAnaliticas.read();
                        },
                        error: function (err) {
                            $('#inputFile').val('');
                            self.dsAnaliticas.read();

                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_IMPORTAR_EXCEL'), 4000);
                            }
                            kendo.ui.progress($('#gridAnaliticasO2'), false);
                        }
                    });
                }
            },
            Actualiza: function () {
                var self = this;
                $("form.k-filter-menu button[type='reset']").trigger("click");
                self.inicio = $("#dtpFechaDesde").data("kendoDatePicker").value();
                self.fin = $("#dtpFechaHasta").data("kendoDatePicker").value();
                self.$("#gridAnaliticasO2").data('kendoGrid').destroy();
                self.$("#gridAnaliticasO2").empty();
                self.cargarAnaliticas();
            },
            ExportarExcel: function () {
                kendo.ui.progress($("#gridAnaliticasO2"), true);
                var grid = $("#gridAnaliticasO2").data("kendoGrid");
                grid.saveAsExcel();
                kendo.ui.progress($("#gridAnaliticasO2"), false);
            },
            LimpiarFiltroGrid: function () {
                var self = this;
                $("form.k-filter-menu button[type='reset']").trigger("click");
                self.Actualiza();
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
            //resizeGrid: function () {
            //    var contenedorHeight = $("#center-pane").innerHeight();
            //    var cabeceraHeight = $("#divCabeceraVista").innerHeight();
            //    var filtrosHeight = $("#divFiltrosHeader").innerHeight();

            //    var gridElement = $("#gridAnaliticasO2"),
            //        dataArea = gridElement.find(".k-grid-content"),
            //        gridHeight = gridElement.innerHeight(),
            //        otherElements = gridElement.children().not(".k-grid-content"),
            //        otherElementsHeight = 0;
            //    otherElements.each(function () {
            //        otherElementsHeight += $(this).outerHeight();
            //    });
            //    dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            //}
        });

        return vistaAnaliticasO2PO;
    });