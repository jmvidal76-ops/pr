define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/CalendarioFabrica.html', 'compartido/notificaciones', 'compartido/utils'],
    function (_, Backbone, $, PlantillaCalendarioFabrica, Not, Utils) {
        var gridCalendarioFabrica = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaCalendarioFabrica),
            initialize: function () {
                var self = this;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);
                self.render();
            },
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))
                var self = this;


                //Agenda
                //------
                kendo.culture(localStorage.getItem("idiomaSeleccionado"));

                var CustomAgenda = kendo.ui.AgendaView.extend({
                    endDate: function () {
                        var year = (new Date()).getFullYear();
                        var date = new Date(year + "/1/1");
                        return kendo.date.addDays(date, 365);
                    }
                });
                var listaFestivos = new kendo.data.SchedulerDataSource(
                    {
                        batch: false,
                        transport: {
                            read: {
                                url: "../api/diasFestivos",
                                contentType: "application/json"
                            },
                            create: {
                                url: "../api/diasFestivos/insertar",
                                type: "POST",
                                contentType: "application/json",
                            },

                            parameterMap: function (data, type) {
                                return JSON.stringify(data);

                            }
                        },
                        schema: {
                            model: {
                                id: "id",
                                fields: {
                                    taskId: { from: "id", type: "number" },
                                    title: { from: "descripcion", type: "string" },
                                    start: { type: "date", from: "inicio" },
                                    end: { type: "date", from: "fin" },
                                    startTimezone: { from: "StartTimezone", defaultValue: "Etc/UTC" },
                                    //endTimezone: { from: "EndTimezone" },
                                    //description: { from: "Description" },
                                    //recurrenceId: { from: "RecurrenceID" },
                                    //recurrenceRule: { from: "RecurrenceRule" },
                                    //recurrenceException: { from: "RecurrenceException" },
                                    //ownerId: { from: "OwnerID", defaultValue: 1 },
                                    isAllDay: { type: "boolean", defaultValue: true }
                                }
                            }
                        },
                        error: function (e) {
                            if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            }
                        }
                    });


                var puedeEditar = window.app.sesion.isAuthorizedTo("ENV_PROD_RES_13_GestionDelCalendarioDeFabrica");


                $("#scheduler").kendoScheduler({
                    views: [
                        "month",
                        { type: CustomAgenda, title: window.app.idioma.t('AGENDA'), eventTimeTemplate: $("#event-time-template").html(), }
                    ],
                    edit: function (e) { // agomezn 010616: 049 que obligue a que se seleccione un tipo al pasar un día a festivo con doble click en Calendario de fábrica
                        var buttonsContainer = e.container.find(".k-edit-buttons");
                        var saveButton = buttonsContainer.find(".k-scheduler-update");
                        $(saveButton).hide();
                    },
                    eventTemplate: $("#event-template").html(),
                    timezone: "Etc/UTC",
                    editable: {
                        move: false,
                        moveEnd: false,
                        resize: false,
                        resizeEnd: false,
                        create: puedeEditar,
                        update: false,
                        destroy: puedeEditar,
                        template: $("#customEditorTemplate").html(),
                        window: {
                            title: window.app.idioma.t('NUEVO_FESTIVO'),
                            //animation: false,
                            //open: myOpenEventHandler
                        }
                    },
                    add: function (e) {
                        var end = kendo.date.nextDay(kendo.date.getDate(e.event.end));

                        if (!self.isSlotFree(kendo.date.getDate(e.event.start), end, e.event)) {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t("ERROR_DOS_EVENTO_MISMA_FECHA"), 4000);
                            e.preventDefault();
                        }
                    },
                    remove: function (e) {
                        $.ajax({
                            url: "../api/diasFestivos/eliminar/" + e.event.taskId,
                            dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests

                            success: function (result) {
                                // notify the data source that the request succeeded
                                Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t("FESTIVO_ELIMINADO"), 4000);
                            },
                            error: function (e) {
                                // notify the data source that the request failed
                                $("#scheduler").data("kendoScheduler").dataSource.add(e.event);
                                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t("ERROR_ELIMINANDO_FESTIVO"), 4000);
                                }

                            }
                        });
                    },
                    messages: {
                        today: window.app.idioma.t('HOY'),// "Hoy",
                        save: window.app.idioma.t('GUARDAR'),//"Guardar",
                        cancel: window.app.idioma.t('CANCELAR'),//"Cancelar",
                        deleteWindowTitle: window.app.idioma.t('ELIMINAR_FESTIVO'),//"Eliminar festivo",
                        destroy: window.app.idioma.t('ELIMINAR'),//"Eliminar",
                        event: window.app.idioma.t('FESTIVO'),//"Festivo",
                        date: window.app.idioma.t('DIA'),//"Dia",
                        time: window.app.idioma.t('PRERIODO'),//"Periodo",
                        allDay: window.app.idioma.t('TODO_EL_DIA'),//"Todos los dias",
                        editable: {
                            confirmation: window.app.idioma.t('CONFIRMACION_ELIMINAR_FESTIVO'),//"¿Seguro que desea eliminar este festivo?"
                        },
                        views: {
                            day: window.app.idioma.t('DIA'),//"Dia",
                            week: window.app.idioma.t('SEMANA'),//"Semana",
                            month: window.app.idioma.t('MES'),//"Mes"
                        },
                        //recurrenceMessages: {
                        //    deleteWindowTitle: "Eliminar elemento recurrente",
                        //    deleteWindowOccurrence: "Eliminar ocurrencia actual",
                        //    deleteWindowSeries: "Eliminar la serie",
                        //    editWindowTitle: "Editar elemento recurrente",
                        //    editWindowOccurrence: "Editar ocurrencia actual",
                        //    editWindowSeries: "Editar la serie",
                        //    editRecurring: "¿Quiere editar esta ocurrencia del evento o la serie completa?",
                        //    deleteRecurring: "¿Quiere eliminar esta ocurrencia del evento o la serie completa?"
                        //},
                        //editor: {
                        //    allDayEvent: "Todo el día",
                        //    description: "Descripción",
                        //    editorTitle: "Festivo",
                        //    end: "Fin",
                        //    endTimezone: "Zona horaria de fin",
                        //    repeat: "Repetir",
                        //    separateTimezones: "Usar zonas horarias separadas para el inicio y el fin",
                        //    start: "Inicio",
                        //    startTimezone: "Zona horaria de inicio",
                        //    timezone: "Zona horaria",
                        //    timezoneEditorButton: "Zona horaria",
                        //    timezoneEditorTitle: "Zonas horarias",
                        //    title: "Título",
                        //    noTimezone: "Sin zona horaria"
                        //},
                        //recurrenceEditor: {
                        //    frequencies: {
                        //        daily: "Diariamente", monthly: "Mensualmente", never: "Nunca", weekly: "Semanalmente", yearly: "Anualmente"
                        //    },
                        //    daily: {
                        //        interval: "día(s)", repeatEvery: "Repetir cada:"
                        //    },
                        //    weekly: {
                        //        repeatEvery: "Repetir cada:", repeatOn: "Repetir en:", interval: "semana(s)"
                        //    },
                        //    monthly: {
                        //        day: "Día", interval: "mes(es)", repeatEvery: "Repetir cada:", repeatOn: "Repetir en:"
                        //    },
                        //    yearly: {
                        //        of: "de", repeatEvery: "Repetir cada:", repeatOn: "Repetir en:", interval: "año(s)"
                        //    },
                        //    end: {
                        //        after: "Después", occurrence: "ocurrencia(s)", label: "Fin:", never: "Nunca", on: "En", mobileLabel: "Ends"
                        //    },
                        //    offsetPositions: {
                        //        first: "Primero", fourth: "Cuarto", last: "Último", second: "Segundo", third: "Tercero"
                        //    }
                        //}
                    },
                    dataSource: listaFestivos

                });

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $('.k-floatwrap.k-header.k-scheduler-toolbar').height()
                var widget = $("#scheduler").data("kendoScheduler");
                //size widget to take the whole view
                widget.element.height(contenedorHeight - cabeceraHeight - filtrosHeight + $('.k-scheduler-table th').height() + 9);
                widget.resize(true);
                this.$("[data-funcion]").checkSecurity();
            },
            events: {
                'click #btnFiltrar': 'Filtrar'
            },
            Filtrar: function () {

                var self = this;

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
                var filtrosHeight = $("#divFiltros").innerHeight();

                var gridElement = $("#gridCalendarioFabrica"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);

            },
            isSlotFree: function (start, end, event) {
                var scheduler = $("#scheduler").getKendoScheduler();
                var occurrences = scheduler.occurrencesInRange(start, end);

                var idx = occurrences.indexOf(event);
                if (idx > -1) {
                    occurrences.splice(idx, 1);
                }

                return !occurrences.length;
            }
        });

        return gridCalendarioFabrica;
    });