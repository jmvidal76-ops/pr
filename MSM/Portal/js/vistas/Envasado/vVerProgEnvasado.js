define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/VerProgramaEnvasado.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, PlantillaVerProgEnvasado, Not, VistaDlgConfirmar) {
    var uploadVerProgEnvasado = Backbone.View.extend({
        tagName: 'div',
        id: 'divHTMLContenido',
        fecha: new Date(),
        lineas:[],
        template: _.template(PlantillaVerProgEnvasado),
        initialize: function () {
            var self = this;
            var splitter = $("#vertical").data("kendoSplitter");
            splitter.bind("resize", self.resizeGrid);
            self.lineas = [];
            for (var i = 0; i < window.app.planta.lineas.length; i++) {
                self.lineas.push(
                    {
                        text: window.app.idioma.t('LINEA')
                              + " " + window.app.planta.lineas[i].numLinea
                              + " - " + window.app.planta.lineas[i].descripcion,
                        value: window.app.planta.lineas[i].id,
                        color: "#f58a8a"
                    })
            }
            self.render();
            
        },
        render: function () {
            $(this.el).html(this.template());
            $("#center-pane").append($(this.el))
            var self = this;


            //Agenda
            //------
            kendo.culture(localStorage.getItem("idiomaSeleccionado"));
            
            $("#scheduler").kendoScheduler({
                date: self.fecha,
                eventHeight: 40,
                majorTick: 1440,
                minorTickCount: 1,
                columnWidth: 20,
                //timezone: "Etc/UTC",
                footer: false,               
                editable: false,                
                views: [{
                    type: "timelineWeek",                    
                }],
                dataSource: {
                    //batch: true,
                    transport: {
                        read: {
                            url:"../api/ordenes/obtenerOrdenesPlanificadas",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var scheduler = $("#scheduler").data("kendoScheduler");
                                var result = {};
                                result.start = scheduler.view().startDate();
                                result.end = scheduler.view().endDate();
                                return JSON.stringify(result);
                            }
                            return kendo.stringify(options);
                        }
                    },
                    serverFiltering: true,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { from: "id", type: "string" },
                                title: { from: "id" },
                                start: { type: "date", from: "dFecInicioEstimadoLocal" },
                                end: { type: "date", from: "dFecFinEstimadoLocal" },
                                startTimezone: { defaultValue: "Etc/UTC" },
                                endTimezone: { defaultValue: "Etc/UTC" },
                                cantidad: { from: "cantPlanificada" },
                                producto: { from: "producto.nombre" },
                                idLinea: { from: "idLinea", nullable: true },
                                isAllDay: { type: "boolean", defaultValue: true }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                },               
                group: {
                    resources: ["Lineas"],
                    orientation: "vertical"
                },
                resources: [
                    {
                        field: "idLinea",
                        name: "Lineas",
                        dataSource: self.lineas,
                        title: window.app.idioma.t('LINEAS')
                    }

                ]
            });

            $("#scheduler").kendoTooltip({
                filter: ".k-event",
                position: "top",
                width: 350,
                content: kendo.template($('#template').html())
            });

        },
        events: {
            'click #btnLimpiarFiltros': 'LimpiarFiltroGrid' // agomezn 270516: 040 Incluir un botón "Limpiar filtros" en las páginas donde se usen filtros
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

            var gridElement = $("#gridProgramasEnvasado"),
                dataArea = gridElement.find(".k-grid-content"),
                gridHeight = gridElement.innerHeight(),
                otherElements = gridElement.children().not(".k-grid-content"),
                otherElementsHeight = 0;
            otherElements.each(function () {
                otherElementsHeight += $(this).outerHeight();
            });
            dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);

        }
    });

    return uploadVerProgEnvasado;
});