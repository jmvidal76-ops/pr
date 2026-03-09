define(['underscore', 'backbone', 'jquery', 'text!../../../Administracion/html/MonitorTareas.html', 'compartido/notificaciones', 'compartido/util','jszip', 'definiciones'],
    function (_, Backbone, $, plantillaTareasSchedule, Not, util, JSZip, definiciones) {
            var tareasSchedule = Backbone.View.extend({
                tagName: 'div',
                id: 'divHTMLContenido',
                dsTareas: null,
                dsEjecutando: null,
                dsProgramadas: null,
                template: _.template(plantillaTareasSchedule),

                initialize: function () {
                    var self = this;
                    self.render();
                },

                render: function () {
                    var self = this;

                    $(this.el).html(this.template());
                    $("#center-pane").append($(this.el));

                    self.obtenerTareas(function () {
                        self.procesarDatos();
                        self.iniciarGrid("gridTareasEjecucion", self.dsEjecutando);
                        self.iniciarGrid("gridTareasProgramadas", self.dsProgramadas);
                    });

                    self.resizeGrid();
                },

                obtenerTareas: function (callback) {
                    var self = this;
                    $.ajax({
                        type: "GET",
                        url: "../api/TareasScheduler",
                        dataType: 'json'
                    }).done(function (data) {
                        self.dsTareas = data;
                        callback();
                    }).fail(function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'api/TareasScheduler', 4000);
                    });
                },

                procesarDatos: function () {
                    var self = this;
                    var tareas = self.dsTareas || [];

                    // Filtrar tareas
                    self.dsEjecutando = tareas.filter(t => t.TipoTarea === "En ejecución");
                    self.dsProgramadas = tareas.filter(t => t.TipoTarea === "Programada");
                },

                iniciarGrid: function (idGrid, dataSource) {
                    $("#" + idGrid).kendoGrid({
                        dataSource: new kendo.data.DataSource({
                            data: dataSource,
                            pageSize: 200, 
                            schema: {
                                model: {
                                    fields: {
                                        JobKey: { type: "string" },
                                        TriggerKey: { type: "string" },
                                        TipoTarea: { type: "string" },
                                        Grupo: { type: "string" },
                                        InicioTrigger: { type: "date" },
                                        UltimaEjecucion: { type: "date" },
                                        ProximaEjecucion: { type: "date" },
                                        CronExpresion: { type: "string" },
                                        Estado: { type: "string" },
                                        Descripcion: { type: "string" }
                                    }
                                }
                            }
                        }),
                        groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                        sortable: true,
                        pageable: {
                            refresh: true,
                            pageSizes: [200, 400, 600],
                            buttonCount: 5,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        noRecords: { template: window.app.idioma.t("SIN_RESULTADOS") },
                        resizable: true,
                        filterable: {
                            extra: false,
                            messages: window.app.cfgKendo.configuracionFiltros_Msg,
                            operators: window.app.cfgKendo.configuracionFiltros_Operadores
                        },
                        columns: [
                            { field: "JobKey", title: "Clave de Tarea", width: 200 },
                            { field: "TriggerKey", title: "Clave de Disparador", width: 200 },
                            { field: "TipoTarea", title: "Tipo Tarea", width: 120, hidden: true },
                            { field: "Grupo", title: "Grupo", width: 120 },
                            { field: "InicioTrigger", title: "Inicio Programación", width: 140, template: '#= InicioTrigger ? kendo.toString(new Date(InicioTrigger), "dd/MM/yyyy HH:mm:ss") : "" #' },
                            { field: "UltimaEjecucion", title: "Última Ejecución", width: 140, template: '#= UltimaEjecucion ? kendo.toString(new Date(UltimaEjecucion), "dd/MM/yyyy HH:mm:ss") : "" #' },
                            { field: "ProximaEjecucion", title: "Próxima Ejecución", width: 140, template: '#= ProximaEjecucion ? kendo.toString(new Date(ProximaEjecucion), "dd/MM/yyyy HH:mm:ss") : "" #' },
                            { field: "CronExpresion", title: "Expresión Cron", width: 180 },
                            { field: "Estado", title: "Estado", width: 180 },
                            { field: "Descripcion", title: "Descripción", width: 200 }
                        ]
                    });
                },

                events: {
                    'click #btnActualizar': 'consulta',
                },

                consulta: function () {
                    var self = this;

                    self.obtenerTareas(function () {
                        self.procesarDatos();
                        self.actualizarGrids();

                        // Restaurar botón y ocultar carga
                        $("#btnActualizar").prop("disabled", false);
                        kendo.ui.progress($("#center-pane"), false);
                    });
                },

                actualizarGrids: function () {
                    var self = this;

                    var gridEjecucion = $("#gridTareasEjecucion").data("kendoGrid");
                    var gridProgramadas = $("#gridTareasProgramadas").data("kendoGrid");                   
                    
                    if (gridEjecucion && gridProgramadas) {
                        gridEjecucion.dataSource.data([]);  // Limpiar datos antes de actualizar
                        kendo.ui.progress($("#gridTareasEjecucion"), true);
                        gridEjecucion.dataSource.data(self.dsEjecutando);
                        kendo.ui.progress($("#gridTareasEjecucion"), false);

                        gridProgramadas.dataSource.data([]);
                        kendo.ui.progress($("#gridTareasProgramadas"), true);
                        gridProgramadas.dataSource.data(self.dsProgramadas);
                        kendo.ui.progress($("#gridTareasProgramadas"), false);
                    }
                },

                resizeGrid: function () {
                    var contenedorHeight = $("#center-pane").innerHeight();
                    var cabeceraHeight = $("#divCabeceraVista").outerHeight(true);
                    var filtrosHeight = $("#divFiltrosHeader").outerHeight(true);
                    var footerHeight = $("#bottom-pane").outerHeight(true);
                    var gridContainer = $("#vsplitPanelTareas");

                    var otherElementsHeight = 0;
                    gridContainer.children().not("#gridTareasEjecucion, #gridTareasProgramadas").each(function () {
                        otherElementsHeight += $(this).outerHeight(true);
                    });

                    var availableHeight = contenedorHeight - (cabeceraHeight + filtrosHeight + footerHeight + otherElementsHeight);
                    if (availableHeight < 0) availableHeight = 0;

                    // Aplicamos los porcentajes correctos
                    var heightEjecucion = Math.floor(availableHeight * 0.35);
                    // Restar un margen adicional a la altura del grid programado
                    var heightProgramadas = Math.floor(availableHeight * 0.65); 

                    $("#gridTareasEjecucion").height(heightEjecucion);
                    $("#gridTareasProgramadas").height(heightProgramadas);

                    $("#gridTareasEjecucion").closest(".k-grid-content").height(heightEjecucion);
                    $("#gridTareasProgramadas").closest(".k-grid-content").height(heightProgramadas);
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

            return tareasSchedule;
        });
