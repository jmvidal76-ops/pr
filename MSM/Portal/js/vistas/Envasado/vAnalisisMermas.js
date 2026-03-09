define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/AnalisisMermas.html', 'compartido/notificaciones', 'jszip', 'compartido/util'],
    function (_, Backbone, $, PlantillaAnalisisMermas, Not, JSZip, util) {
        var vistaAnalisisMermas = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaAnalisisMermas),
            dsAnalisis: null,
            dsConfiguracion: null,
            tabSelect: 1,
            aniosInicio: [],
            aniosFin: [],
            gridAnalisis: null,
            anioIni: 0,
            semanaIni: 0,
            anioFin: 0,
            semanaFin: 0,
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.aniosInicio = [];
                self.aniosFin = [];
                var anioActual = (new Date()).getFullYear();
                var anioInicial = anioActual - 2;

                for (var i = anioInicial; i <= anioActual; i++) {
                    self.aniosInicio.push({ id: i, nombre: i.toString() });
                }

                for (var i = anioInicial; i <= (anioActual + 1); i++) {
                    self.aniosFin.push({ id: i, nombre: i.toString() });
                }

                self.getDataSourceAnalisis();
                self.getDataSourceConfiguracion();
                self.render();
            },
            getDataSourceAnalisis: function () {
                var self = this;

                self.dsAnalisis = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/mermas/analisis",
                            dataType: "json",
                            data: function () {
                                return {
                                    anioIni: self.anioIni,
                                    semanaIni: self.semanaIni,
                                    anioFin: self.anioFin,
                                    semanaFin: self.semanaFin,
                                }
                            }
                        },
                    },
                    schema: {
                        model: {
                            id: "Linea",
                            fields: {
                                Linea: { type: "string" },
                                IME: { type: "number" },
                                PorcentajeTrazadosRespectoLlenados: { type: "number" },
                                PaletsDespaletera: { type: "number" },
                                EnvasesLlenadora: { type: "number" },
                                PorcentajeMermaInspectoresVacio: { type: "number" },
                                PorcentajeMermaLlenadoraEtiquetadora: { type: "number" },
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
            getDataSourceConfiguracion: function () {
                var self = this;

                self.dsConfiguracion = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/mermas/analisisConfig",
                            dataType: "json"
                        },
                        update: {
                            url: "../api/editarIMEObjetivo",
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

                                    var grid = $("#gridConfigMermas").data("kendoGrid");
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
                            id: "IdMermaAnalisisConfig",
                            fields: {
                                IdMermaAnalisisConfig: { type: "number" },
                                IdLinea: { type: "string", editable: false },
                                IMEObjetivo: { type: "number" },
                                TipoCalculoRetornable: { type: "boolean", editable: false },
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

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                this.tab = util.ui.createTabStrip('#divPestaniasMermas', { show: self.onTabShow });

                self.$("#anioInicio").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: self.aniosInicio,
                    value: (new Date()).getFullYear(),
                    change: function () { self.cambiaAnio(this, self); },
                });

                self.$("#semanaInicio").kendoDropDownList({
                    dataValueField: "numSemana",
                    template: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    valueTemplate: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                self.$("#anioFin").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: self.aniosFin,
                    value: (new Date()).getFullYear(),
                    change: function () { self.cambiaAnio(this, self); },
                });

                self.$("#semanaFin").kendoDropDownList({
                    dataValueField: "numSemana",
                    template: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    valueTemplate: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                self.$("#anioInicio").data('kendoDropDownList').trigger('change');
                let diaSemanaAnterior = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 7);
                self.$("#semanaInicio").data('kendoDropDownList').value(util.date.getISOWeek(diaSemanaAnterior));
                self.$("#anioFin").data('kendoDropDownList').trigger('change');
                self.$("#semanaFin").data('kendoDropDownList').value(util.date.getISOWeek(new Date()));

                self.configurarGridAnalisis();
                self.configurarGridConfiguracion();

                util.ui.enableResizeCenterPane();
            },
            onTabShow: function (e) {
                let self = window.app.vista;

                if (self) {
                    self.tabSelect = $(e.item).data("id");
                    self.resizeGrid();
                }
            },
            cambiaAnio: function (e, self) {
                self.obtenerSemanas($(e.element).val(), e.element[0].id);
            },
            obtenerSemanas: function (anio, origen) {
                var ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/semanas/" + anio,
                            dataType: "json"
                        }
                    },
                    schema: {
                        model: {
                            id: "numSemana",
                            fields: {
                                year: { type: "number" },
                                numSemana: { type: "number" },
                                inicio: { type: "date" },
                                fin: { type: "date" }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                });

                var comboSemana;

                if (origen == 'anioInicio') {
                    comboSemana = this.$("#semanaInicio").data('kendoDropDownList');
                } else {
                    comboSemana = this.$("#semanaFin").data('kendoDropDownList');
                }

                comboSemana.setDataSource(ds);
            },
            configurarGridAnalisis: function () {
                var self = this;

                self.gridAnalisis = $("#gridAnalisisMermas").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t("ANALISIS_MERMAS") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    autoBind: false,
                    dataSource: self.dsAnalisis,
                    groupable: {
                        messages: {
                            empty: window.app.idioma.t('ARRASTRAR_SOLTAR')
                        }
                    },
                    sortable: true,
                    resizable: true,
                    selectable: true,
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
                            field: "Linea",
                            title: window.app.idioma.t("LINEA"),
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
                            title: window.app.idioma.t('SEMAFORO'),
                            template: function (e) {
                                return "<div class='circle_cells' style='background-color:" + e.Semaforo + ";'/>";
                            },
                            width: 80,
                            filterable: false,
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            field: "IME",
                            title: window.app.idioma.t('IME'),
                            width: 120,
                            format: "{0:n3}",
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 3,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            field: "PorcentajeTrazadosRespectoLlenados",
                            title: window.app.idioma.t('PORCENTAJE_TRAZADOS_LLENADOS'),
                            format: "{0:n3}",
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 3,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            field: "PaletsDespaletera",
                            title: window.app.idioma.t('PALETS_DESP'),
                            width: 150,
                            format: "{0:n0}",
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            field: "EnvasesLlenadora",
                            title: window.app.idioma.t('ENVASES_LLEN'),
                            width: 150,
                            format: "{0:n0}",
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            field: "PorcentajeMermaInspectoresVacio",
                            title: window.app.idioma.t('PORCENTAJE_MERMA_INSPECTORES_VACIO'),
                            format: "{0:n3}",
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 3,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            field: "PorcentajeMermaLlenadoraEtiquetadora",
                            title: window.app.idioma.t('PORCENTAJE_MERMA_LLEN_ETIQ'),
                            format: "{0:n3}",
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 3,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                    ],
                    dataBinding: self.resizeGrid,
                    excelExport: function (e) {
                        e.workbook.fileName = window.app.idioma.t("ANALISIS_MERMAS") + '_' + window.app.idioma.t('SEMANA') + self.semanaIni +
                            "-" + self.semanaFin + ".xlsx";
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];

                                row.cells[0].value = ObtenerLineaDescripcion(e.data[dataPosition].Linea);
                                row.cells[1].format = "#,##0.000";
                                row.cells[2].format = "#,##0.000";
                                row.cells[5].format = "#,##0.000";
                                row.cells[6].format = "#,##0.000";
                            } catch (e) {
                            }
                        }
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridAnalisisMermas").data("kendoGrid"));
            },
            configurarGridConfiguracion: function () {
                var self = this;

                let gridConfig = $("#gridConfigMermas").kendoGrid({
                    dataSource: self.dsConfiguracion,
                    sortable: true,
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    editable: "inline",
                    pageable: {
                        refresh: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "IdLinea",
                            title: window.app.idioma.t("LINEA"),
                            template: "#:ObtenerLineaDescripcion(IdLinea)#",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdLinea#' style='width: 14px;height:14px;margin-right:5px;'/>#:ObtenerLineaDescripcion(IdLinea)#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "IMEObjetivo",
                            title: window.app.idioma.t("IME_OBJETIVO"),
                            format: "{0:n2}",
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            field: "TipoCalculoRetornable",
                            title: window.app.idioma.t("TIPO_CALCULO_RETORNABLE"),
                            template: "# if(TipoCalculoRetornable){#" + window.app.idioma.t("SI") + "#} else {#" + window.app.idioma.t("NO") + "#} #",
                            filterable: { messages: { isTrue: window.app.idioma.t("SI"), isFalse: window.app.idioma.t("NO") } },
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
                                        var permiso = TienePermiso(409);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            $('#gridConfigMermas').data("kendoGrid").cancelChanges();
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                    dataBinding: self.resizeGrid,
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridConfigMermas").data("kendoGrid"));
            },
            events: {
                'click #btnFiltrarAnalisis': 'actualiza',
                'click #btnInfoAnalisis': 'mostrarInfo',
                'click #btnLimpiarFiltrosAnalisis': 'limpiarFiltroGridAnalisis',
                'click #btnExportExcelAnalisis': 'exportExcelAnalisis',
            },
            actualiza: function () {
                var self = this;

                self.anioIni = parseInt($("#anioInicio").data('kendoDropDownList').value());
                self.semanaIni = $("#semanaInicio").data('kendoDropDownList').value() === "" ? null : parseInt($("#semanaInicio").data('kendoDropDownList').value());
                self.anioFin = parseInt($("#anioFin").data('kendoDropDownList').value());
                self.semanaFin = $("#semanaFin").data('kendoDropDownList').value() === "" ? null : parseInt($("#semanaFin").data('kendoDropDownList').value());

                if (self.anioIni > self.anioFin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDACION_ANIO'), 4000);
                    return;
                }

                if (self.semanaIni == null || self.semanaFin == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_SELECCIONAR_UNA'), 4000);
                    return;
                }

                if (self.anioIni === self.anioFin && self.semanaIni > self.semanaFin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDACION_SEMANA'), 4000);
                    return;
                }

                RecargarGrid({ grid: self.gridAnalisis });
            },
            mostrarInfo: function () {
                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='windowInfoAnalisis'></div>"));

                var ventanaInfoAnalisis = $("#windowInfoAnalisis").kendoWindow(
                    {
                        title: window.app.idioma.t('INFORMACION'),
                        width: "800px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        close: function () {
                            ventanaInfoAnalisis.getKendoWindow().destroy();
                        },
                        refresh: function () {
                        }
                    });

                var template = kendo.template($("#templateInfoAnalisis").html());
                ventanaInfoAnalisis.getKendoWindow()
                    .content(template({}))
                    .center().open();
            },
            limpiarFiltroGridAnalisis: function () {
                const self = this;

                self.dsAnalisis.query({
                    group: [],
                    filter: [],
                    page: 1
                });
            },
            exportExcelAnalisis: function () {
                var grid = $("#gridAnalisisMermas").data("kendoGrid");
                grid.saveAsExcel();
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
                let self = window.app.vista;

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                let tabsHeight = $(".k-tabstrip-items").innerHeight();

                let tabElements = [$("#divPestaniasMermas-1"), $("#divPestaniasMermas-2")];
                let tabElement = tabElements[self.tabSelect - 1];

                if (tabElement) {
                    let filtrosHeight = self.tabSelect == 1 ? tabElement.find(".k-header:first").innerHeight() : 0;
                    let gridElement = tabElement.find("[data-role='grid']:first"),
                        //var gridElement = view.tab.select().index() == 0 ? $("#gridCoeficientesCoccion") : $("#gridCoeficientesHistorico"),
                        dataArea = gridElement.find(".k-grid-content"),
                        gridHeight = gridElement.innerHeight(),
                        otherElements = gridElement.children().not(".k-grid-content"),
                        otherElementsHeight = 0;

                    otherElements.each(function () {
                        otherElementsHeight += $(this).outerHeight();
                    });

                    dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - tabsHeight - filtrosHeight - 2);
                }
            },
        });

        return vistaAnalisisMermas;
    });