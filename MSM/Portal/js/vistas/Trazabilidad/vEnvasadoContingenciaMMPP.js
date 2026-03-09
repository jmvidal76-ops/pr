define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/EnvasadoContingenciaMMPP.html', 'compartido/notificaciones', 'compartido/utils',
    'vistas/vDialogoConfirm', "jszip", 'definiciones', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, plantillaGestionMateriales, Not, Utils, VistaDlgConfirm, JSZip, definiciones, enums) {
        var gridMateriales = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            dsStock: null,
            dsUbicaciones1: null,
            dsUbicaciones2: null,
            inicio: null,
            fin: null,
            registrosSel: [],
            registrosSelData: [],
            registrosDesSelData: [],
            selTodos: false,
            wnd: null,
            tmpToolbar: null,
            template: _.template(plantillaGestionMateriales),
            PropiedadesEditables: false,

            initialize: function () {
                var self = this;

                kendo.culture(localStorage.getItem("idiomaSeleccionado"));
                self.PropiedadesEditables = TienePermiso(226);

                window.JSZip = JSZip;

                // Inicializa el DataSource del grid (independiente de las ubicaciones)
                self.dsStock = new kendo.data.DataSource({
                    transport: {
                        read: function (operation) {
                            //Si no tiene valor el combo pintamos el grid vacio
                            let idUbicacionOri = $("#cmbUbicacionOri").getKendoDropDownList() ? $("#cmbUbicacionOri").getKendoDropDownList().value() : null;
                            if (idUbicacionOri) {
                                $.ajax({
                                    url: "../api/ObtenerLotesMateriaPrimaPorIdUbicacion?idUbicacion=" + idUbicacionOri,
                                    dataType: "json",
                                    contentType: "application/json; charset=utf-8",
                                    success: function (response) {
                                        operation.success(response); //Realiazamos la carga detos
                                    }
                                });
                            }
                            else {
                                operation.success([]);
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: "ID_LOTE_MMPP",
                            fields: {
                                'TIPO_MATERIAL': { type: "string" },
                                'CLASE_MATERIAL': { type: "string" },
                                'ID_MATERIAL': { type: "string" },
                                'MATERIAL': { type: "string" },
                                'LOTE_MES': { type: "string" },
                                'ID_PROVEEDOR': { type: "string" },
                                'PROVEEDOR': { type: "string" },
                                'LOTE_PROVEEDOR': { type: "string" },
                                'CANTIDAD_INICIAL': { type: "number" },
                                'CANTIDAD_ACTUAL': { type: "number" },
                                'FECHA_ENTRADA_PLANTA': { type: "date" },
                                'FECHA_ENTRADA_UBICACION': { type: "date" },
                                'FECHA_INICIO_CONSUMO': { type: "date" },
                                'FECHA_FIN_CONSUMO': { type: "date" },
                                'ZONA': { type: "string" },
                                'UBICACION_CON_DESCRIPTIVO': { type: "string" },
                            }
                        }
                    },
                    group: [],
                    pageSize: 200,
                });

                // Cargar ubicaciones una sola vez y, cuando terminen, renderizar la vista (cargar ambos combos a la vez)
                self.obtenerUbicaciones().then(function () {
                    self.render();
                }).catch(function () {
                    // Si falla la carga de ubicaciones, igualmente renderizamos para mostrar la vista,
                    // pero los combos quedarán con optionLabel y sin datos.
                    self.render();
                });
            },

            render: function () {
                var self = this;

                $(self.el).html(self.template());
                $("#center-pane").append($(self.el));
                $("#toolbar").kendoToolBar();

                kendo.ui.progress($("#divContingenciaMMPPEnvasado"), true);

                //Cargamos combos (ambos comparten los mismos datos, pero cada uno con su propio DataSource para filtrar/seleccionar de forma independiente)
                self.cargarCombos();
                //Cargar el Grid
                self.cargarGrid();

                self.registrosDesSelData = [];
                self.registrosSelData = [];
                self.selTodos = false;
                self.ResizeTab();

                kendo.ui.progress($("#divContingenciaMMPPEnvasado"), false);
            },

            cargarGrid: function () {
                var self = this;

                $("#divContingenciaMMPPEnvasado").kendoGrid({
                    dataSource: self.dsStock,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    sortable: true,
                    toolbarColumnMenu: true,
                    scrollable: true,
                    selectable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [500, 1000, 5000, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    noRecords: {
                        template: window.app.idioma.t("SIN_RESULTADOS")
                    },
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    columns: [
                        {
                            headerTemplate: '<input class="checkbox" id="btnSelTodos" name="btnSelTodos" type="checkbox" />',
                            template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                            groupable: false,
                            width: 35
                        },
                        {
                            hidden: true,
                            width: 200,
                            title: 'ID_LOTE_MMPP',
                            field: 'ID_LOTE_MMPP'
                        },
                        {
                            hidden: true,
                            width: 200,
                            groupable: false,
                            title: window.app.idioma.t("TIPO_MATERIAL"),
                            field: 'TIPO_MATERIAL',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field == "all" ?
                                        "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                        "<div><label><input type='checkbox' value='#=TIPO_MATERIAL#' style='width: 14px;height:14px;margin-right:5px;'/>#= TIPO_MATERIAL#</label></div>";
                                }
                            }
                        },
                        {
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            width: 150,
                            title: window.app.idioma.t("CLASE_MATERIAL"),
                            field: 'CLASE_MATERIAL',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field == "all" ?
                                        "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                        "<div><label><input type='checkbox' value='#=CLASE_MATERIAL#' style='width: 14px;height:14px;margin-right:5px;'/>#= CLASE_MATERIAL#</label></div>";
                                }
                            }
                        },
                        {
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            width: 100,
                            title: window.app.idioma.t("ID_MATERIAL"),
                            field: 'REFERENCIA_MES',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field == "all" ?
                                        "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                        "<div><label><input type='checkbox' value='#=REFERENCIA_MES#' style='width: 14px;height:14px;margin-right:5px;'/>#= REFERENCIA_MES#</label></div>";
                                }
                            }
                        },
                        {
                            title: window.app.idioma.t("DESCRIPCION"),
                            field: 'MATERIAL',
                            width: 250,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field == "all" ?
                                        "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                        "<div><label><input type='checkbox' value='#=MATERIAL#' style='width: 14px;height:14px;margin-right:5px;'/>#= MATERIAL#</label></div>";
                                }
                            }
                        },
                        {
                            title: window.app.idioma.t("LOTE_MES"),
                            field: 'LOTE_MES',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            width: 350
                        },
                        {
                            title: window.app.idioma.t("PROVEEDOR"),
                            field: 'PROVEEDOR',
                            width: 160,
                            groupable: true,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            }
                        },
                        {
                            title: window.app.idioma.t("LOTE_PROVEEDOR"),
                            field: 'LOTE_PROVEEDOR',
                            width: 150,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            }
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_INICIAL"),
                            field: 'CANTIDAD_INICIAL',
                            width: 100,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            template: '#= kendo.format("{0:n2}", CANTIDAD_INICIAL)#',
                            aggregates: ["sum"],
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
                            title: window.app.idioma.t("CANTIDAD_ACTUAL"),
                            field: 'CANTIDAD_ACTUAL',
                            width: 100,
                            template: '#= kendo.format("{0:n2}", CANTIDAD_ACTUAL)#',
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            title: window.app.idioma.t("FECHA_ENTRADA_PLANTA"),
                            field: 'FECHA_ENTRADA_PLANTA',
                            width: 200,
                            template: '#= FECHA_ENTRADA_PLANTA != null ? kendo.toString(new Date(FECHA_ENTRADA_PLANTA), "dd/MM/yyyy HH:mm:ss") : "" #',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: "dd/MM/yyyy",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            title: window.app.idioma.t("FECHA_ENTRADA_UBICACION"),
                            field: 'FECHA_ENTRADA_UBICACION',
                            width: 200,
                            template: '#= FECHA_ENTRADA_UBICACION != null ? kendo.toString(new Date(FECHA_ENTRADA_UBICACION), "dd/MM/yyyy HH:mm:ss") : "" #',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: "dd/MM/yyyy",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            title: window.app.idioma.t("FECHA_INICIO_CONSUMO"),
                            field: 'FECHA_INICIO_CONSUMO',
                            width: 200,
                            template: '#= FECHA_INICIO_CONSUMO != null ? kendo.toString(new Date(FECHA_INICIO_CONSUMO), "dd/MM/yyyy HH:mm:ss") : "" #',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: "dd/MM/yyyy",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            title: window.app.idioma.t("FECHA_FIN_CONSUMO"),
                            field: 'FECHA_FIN_CONSUMO',
                            width: 200,
                            template: '#= FECHA_FIN_CONSUMO != null ? kendo.toString(new Date(FECHA_FIN_CONSUMO), "dd/MM/yyyy HH:mm:ss") : "" #',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: "dd/MM/yyyy",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            title: window.app.idioma.t("ZONA"),
                            field: 'ZONA',
                            width: 160,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            }
                        },
                        {
                            title: window.app.idioma.t("UBICACION"),
                            field: 'UBICACION',
                            width: 150,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            template: function (dataItem) {
                                return $("#cmbUbicacionOri").data("kendoDropDownList").text();
                            }
                        }
                    ],
                    dataBound: function (e) {
                        self.registrosSelData = [];
                        self.validateCheck(self);
                        self.$("[data-funcion]").checkSecurity();
                        self.ResizeTab();
                    }
                });

            },

            events: {
                'click #btnProcesar': function () { this.Procesar(this); },
                'click #btnConsultar': function () { this.cargarDatos(); },
                'click #btnSelTodos': function () { this.aplicarSeleccion(); },
            },

            cargarDatos: function () {
                var self = this;

                // Ambos DS se cargan al inicio con una sola llamada.
                if (self.dsUbicaciones1 && self.dsUbicaciones1.data().length > 0 && self.dsUbicaciones2 && self.dsUbicaciones2.data().length == 0) {
                    self.dsUbicaciones2 = new kendo.data.DataSource({
                        data: self.dsUbicaciones1.data().toJSON ? self.dsUbicaciones1.data().toJSON() : self.dsUbicaciones1.data()
                    });
                    self.CargaComboUbicacion("#cmbUbicacionDes", 2);
                }

                self.ActualizarGrid();
            },

            // Carga única de ubicaciones y creación de dos DataSource independientes
            obtenerUbicaciones: function () {
                var self = this;

                return new Promise(function (resolve, reject) {
                    $.ajax({
                        url: "../api/ObtenerUbicaciones/0/0",
                        dataType: "json",
                        success: function (data) {
                            // Creamos dos DataSources con los mismos datos para que los filtros sean independientes
                            self.dsUbicaciones1 = new kendo.data.DataSource({ data: data });
                            self.dsUbicaciones2 = new kendo.data.DataSource({ data: data });
                            resolve();
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                $("#center-pane").empty();
                            } else if (e.status == 400) {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.responseJSON.Message, 3000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR') + ': ObtenerUbicaciones', 4000);
                            }
                            reject(e);
                        }
                    });
                });
            },

            cargarCombos: function () {
                var self = this;

                self.CargaComboUbicacion("#cmbUbicacionOri", 1);
                self.CargaComboUbicacion("#cmbUbicacionDes", 2);

                //Cargamos las fechas
                var datenow = new Date();
                $("#cmbFechaInicioConsumo").kendoDateTimePicker({
                    //value: new Date(datenow),
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#cmbFechaFinConsumo").kendoDateTimePicker({
                    //value: new Date(datenow),
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });
            },

            CargaComboUbicacion: function (comboId, Ubi) {
                var self = this;

                var dsUbi = self.dsUbicaciones1;
                if (Ubi == 2) {
                    dsUbi = self.dsUbicaciones2;
                }

                $(comboId).kendoDropDownList({
                    template: '#:data.Nombre #' + '#: data.Descripcion != null ? " - " + data.Descripcion : "" #',
                    valueTemplate: '#:data.Nombre #' + '#: data.Descripcion != null ? " - " + data.Descripcion : "" #',
                    dataSource: dsUbi,
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdUbicacion",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    filtering: function (ev) {
                        var filterValue = ev.filter != undefined ? ev.filter.value : "";
                        ev.preventDefault();

                        this.dataSource.filter({
                            logic: "or",
                            filters: [
                                {
                                    field: "Nombre",
                                    operator: "contains",
                                    value: filterValue
                                },
                                {
                                    field: "Descripcion",
                                    operator: "contains",
                                    value: filterValue
                                }
                            ]
                        });
                    }
                });
            },

            ValidarFechas: function () {
                var self = this;

                self.inicio = $("#cmbFechaInicioConsumo").getKendoDateTimePicker().value();
                self.fin = $("#cmbFechaFinConsumo").getKendoDateTimePicker().value();
                var ahora = new Date(); // Fecha actual

                // Verificar si ambas fechas están seleccionadas
                if (!self.inicio || !self.fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LAS_FECHAS_INTRODUCIDAS'), 3000);
                    return false;
                }
                // Verificar si la fecha de inicio es mayor que la de fin
                if (Date.parse(self.inicio) >= Date.parse(self.fin)) {
                    Not.crearNotificacion('warning', window.app.idioma.t('INFO'), window.app.idioma.t('ERROR_FECHA_FIN_MENOR_INICIO'), 4000);
                    return false;
                }
                // Verificar si ambas fechas están en el pasado
                if (Date.parse(self.inicio) >= ahora || Date.parse(self.fin) >= ahora) {
                    Not.crearNotificacion('warning', window.app.idioma.t('INFO'), window.app.idioma.t('ERROR_FECHAS_MAYOR_ACTUAL'), 4000);
                    return false;
                }

                return true;
            },

            aplicarSeleccion: function () {
                var self = this;
                var grid = $('#divContingenciaMMPPEnvasado').data('kendoGrid');
                var _chkAll = $("input[name='btnSelTodos']:checked").length > 0 ? true : false;

                self.selTodos = _chkAll;

                if (self.selTodos) {
                    self.registrosSelData = [];

                    grid.tbody.find('input:checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var dataSource = grid.dataSource;
                    var filters = dataSource.filter();
                    var allData = dataSource.data();
                    var query = new kendo.data.Query(allData);
                    var dataFiltered = query.filter(filters).data;
                    self.registrosSelData = [];

                    for (var i = 0; i < dataFiltered.length; i++) {
                        var datos = {};
                        datos.IdLoteMateriaPrima = dataFiltered[i].ID_LOTE_MMPP;
                        datos.LoteMes = dataFiltered[i].LOTE_MES;
                        self.registrosSelData.push(datos);
                    }
                } else {
                    grid.tbody.find('input:checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');
                    self.registrosDesSelData = [];
                    self.registrosSelData = [];
                }
            },

            validateCheck: function (self) {
                var grid = $("#divContingenciaMMPPEnvasado").data("kendoGrid");

                $(".checkbox").on("change", function (e) {
                    var row = $(e.target).closest("tr");
                    var dataItem = grid.dataItem(row);
                    var checked = this.checked;

                    var datos = {
                        IdLoteMateriaPrima: dataItem.ID_LOTE_MMPP,
                        LoteMes: dataItem.LOTE_MES
                    };

                    if (checked) {
                        row.addClass("k-state-selected");
                        self.registrosSelData.push(datos);
                        var index = self.registrosDesSelData.findIndex(d => d.uid === datos.uid);
                        if (index !== -1) {
                            self.registrosDesSelData.splice(index, 1);
                        }
                    } else {
                        row.removeClass("k-state-selected");
                        var index = self.registrosSelData.findIndex(d => d.uid === datos.uid);
                        if (index !== -1) {
                            self.registrosSelData.splice(index, 1);
                        }
                        self.registrosDesSelData.push(datos);
                    }
                });

                // Manejo de selección global
                if (self.selTodos) {
                    grid.tbody.find('input:checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');
                    // Agregar todos los elementos a registrosSelData
                    grid.items().each(function () {
                        var dataItem = grid.dataItem(this);
                        var datos = {
                            IdLoteMateriaPrima: dataItem.ID_LOTE_MMPP,
                            LoteMes: dataItem.LOTE_MES,
                            uid: dataItem.uid
                        };
                        self.registrosSelData.push(datos);
                    });
                } else {
                    grid.tbody.find('input:checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');
                    // Limpiar registros seleccionados
                    self.registrosSelData = [];
                }
            },

            Procesar: function (e) {
                var self = this;

                //Validaciones
                if (!self.ValidarFechas()) {
                    return;
                }

                var Destino = $("#cmbUbicacionDes").data("kendoDropDownList").value();
                if (Destino == "") {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('CAMPO_OBLIGATORIO') + ': ' + window.app.idioma.t('UBICACION_DESTINO'), 3000);
                    return;
                }
                var Origen = $("#cmbUbicacionOri").data("kendoDropDownList").value();
                if (Origen === Destino) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('MISMA_UBICACION_ORIGEN_Y_DESTINO'), 4000);
                    return;
                }

                // Capturamos todas las filas seleccionadas
                let selectedRows = $("#divContingenciaMMPPEnvasado").data("kendoGrid").select();

                if (selectedRows.length === 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }
                // Almacenamos los elementos seleccionados
                let selectedElements = [];
                selectedRows.each(function () {
                    var grid = $('#divContingenciaMMPPEnvasado').data('kendoGrid');
                    var element = grid.dataItem(this);

                    if (element) {
                        selectedElements.push(element);
                    }
                });

                // Ordenamos los registros seleccionados por FechaEntradaPlanta (de más antiguo a más reciente)
                selectedElements.sort(function (a, b) {
                    var fechaA = new Date(a.FECHA_ENTRADA_PLANTA).getTime();
                    var fechaB = new Date(b.FECHA_ENTRADA_PLANTA).getTime();

                    if (isNaN(fechaA) || isNaN(fechaB)) {
                        return 0; // Si hay un problema con la fecha, no cambia el orden
                    }

                    return fechaA - fechaB;
                });

                // Calcular el offset entre consumos en minutos
                var fechaInicioConsumo = new Date(self.inicio);
                var fechaFinConsumo = new Date(self.fin);
                var numeroPalets = selectedElements.length;

                // Calculamos la diferencia en minutos
                var offsetTotalMinutos = (fechaFinConsumo - fechaInicioConsumo) / (1000 * 60); // Diferencia en minutos
                var offsetPorPalet = offsetTotalMinutos / numeroPalets; // Offset por palet

                //////////////////PROCESAMOS
                var Exito = true;
                selectedElements.forEach(function (element, index) {
                    // Calculamos la fecha de inicio y fin de consumo para cada registro
                    var inicioConsumo = new Date(fechaInicioConsumo.getTime() + (index * offsetPorPalet * 60 * 1000)); // Fecha de inicio ajustada
                    var finConsumo = new Date(inicioConsumo.getTime() + (offsetPorPalet * 60 * 1000)); // Fecha de fin = inicio + offset

                    // Creamos el objeto LoteMMPP con los valores calculados
                    var LoteMMPP = {
                        ID_LOTE_MMPP: element.ID_LOTE_MMPP,
                        UBICACION_ORIGEN: Destino, // Ubicación destino elegida
                        CANTIDAD_ACTUAL: 0, // Cantidad actual = 0
                        FECHA_INICIO_CONSUMO: inicioConsumo, // Fecha de inicio ajustada
                        FECHA_ENTRADA_PLANTA: inicioConsumo, // Fecha de inicio ajustada
                        FECHA_ENTRADA_UBICACION: inicioConsumo, // Fecha de inicio ajustada
                        FECHA_FIN_CONSUMO: finConsumo  // Fecha de fin ajustada
                    };

                    $.ajax({
                        url: "../api/ActualizarLoteMateriaPrimaEnvasado",
                        type: "PUT",
                        async: false,
                        contentType: "application/json",
                        data: JSON.stringify(LoteMMPP),
                        success: function (response) {
                            //Se ha procesado correctamente
                        },
                        error: function (xhr) {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACTUALIZANDO_CODIGO') + ' ' + element.ID_LOTE_MMPP, 5000);
                            Exito = false;
                        }
                    });
                });
                if (Exito) {
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('FINALIZADO_CORRECTAMENTE'), 5000);
                }

                self.ActualizarGrid();

            },
            ResizeTab: function (isVisible) {
                var cabeceraHeight1 = $("#divCabeceraVista").height();
                var contenedorHeight = $("#center-pane").height();
                var toolbarHeight = $(".k-grid-toolbar").height() < 70 ? $(".k-grid-toolbar").height() + 53 : $(".k-grid-toolbar").height();
                var cabeceraHeight = $(".k-grouping-header").height();
                var headerHeightGrid = $(".k-grid-header").height();
                var divFiltersGrid = isVisible == 0 ? 0 : $("#divFilters").height();

                var gridElement = $("#divContingenciaMMPPEnvasado"),
                    dataArea = gridElement.find(".k-grid-content:first"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - toolbarHeight - cabeceraHeight - cabeceraHeight1 - divFiltersGrid - headerHeightGrid);

            },
            ActualizarGrid: function () {
                const self = this;

                self.selTodos = false;
                $("input[name='btnSelTodos']").prop("checked", false);

                self.dsStock.filter({});
                self.dsStock.read();
            },
            eliminar: function () {
                this.remove();
            },
        });

        return gridMateriales;
    });