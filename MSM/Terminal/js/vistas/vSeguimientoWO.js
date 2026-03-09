define(['underscore', 'backbone', 'jquery', 'vistas/vDatosLlenadora', 'text!../../html/SeguimientoWO.html', 'compartido/notificaciones'],
    function (_, Backbone, $, VistaLlenadora, PlantillaSeguimientoWO,Not) {
    var SeguimientoWO = Backbone.View.extend({
        tagName: 'div',
        template: _.template(PlantillaSeguimientoWO),
        model: null,
        llenadoraSel: 0,
        eventosLinea: ['eventNotificacionOrden', 'eventNotificacionMaquina'],
        initialize: function () {
            var self = this;
            $.each(self.eventosLinea, function (index, eventName) {
                Backbone.on(eventName + window.app.lineaSel.numLinea, self.actualiza, self);
            })

            Backbone.on('eventActProd', this.actualiza, this);
            Backbone.on('eventActPlanificacionOrden', this.actualiza, this);
           
            self.actualiza();
        },
        vistaLlenadora: null,
        model:null,
        unbindEvents: function () {
            var self = this;
            $.each(Backbone._events, function (eventName, event) {
                var isInEventosLinea = $.grep(self.eventosLinea, function (value, index) {
                    return eventName.indexOf(value) >= 0;
                });
                if (isInEventosLinea.length > 0) {
                    Backbone.off(eventName);
                }

            });
        },
        bindEvents: function () {
            var self = this;
            $.each(self.eventosLinea, function (index, eventName) {
                Backbone.on(eventName + window.app.lineaSel.numLinea, self.actualiza, self);
            });
        },
        actualiza: function (cambioPuesto) {
            var self = this;

            if (cambioPuesto) {
                self.unbindEvents();
                self.bindEvents();
            }

            $.ajax({
                type: "GET",
                url: "../api/lineas/getSeguimientoWO/" + window.app.lineaSel.id + "/",
                dataType: 'json',
                cache: false
            }).success(function (data) {
                self.model = data;
                self.render();
                console.log('seriesData', data.seriesData);
            }).error(function (e, msg, ex) {
                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                } else { 
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_SEGUIMIENTO_LINEA') + ': ' + ex, 4000);
                }
            });

        },
        render: function () {

            var self = this;
            

            $(this.el).html(this.template({ 'model': self.model }));

                      

            // TabPanel de las llenadoras

            var tpLlenadoras = $("#tpLlenadoras").kendoTabStrip({
                animation: false,
                // Cuando cambia el tab seleccionado cambiamos la vista de la llenadora
                select: function (e) {
                    if (self.vistaLlenadora) {
                        self.vistaLlenadora.eliminar();
                    }
                    self.vistaLlenadora = new VistaLlenadora({ model: self.model.llenadoras[$(e.item).index()] });
                    tpLlenadoras.contentHolder($(e.item).index()).html(self.vistaLlenadora.el);
                    self.llenadoraSel = $(e.item).index();
                }

            }).data("kendoTabStrip");

            var tabs = []
            jQuery.each(self.model.llenadoras, function (index, value) {
                tabs.push({ text: value.descripcion, content: index.toString() })
            });

            tpLlenadoras.append(tabs);
            
            if (self.llenadoraSel > (self.model.llenadoras.length - 1)) {
                self.llenadoraSel = 0;
            }

            tpLlenadoras.select(self.llenadoraSel);

             //Comprobamos si el turno actual es productivo
            var tipoTurno = 0;
            for (var i = 0; i < window.app.planta.turnoActual.length; i++) {
                if (window.app.planta.turnoActual[i].linea.id == window.app.lineaSel.id) {
                    tipoTurno = window.app.planta.turnoActual[i].tipo.id;
                }
            }

            //Graficas de rendimiento de las llenadoras
            if (tipoTurno != 0) {
                this.$("#grafRendLlenadora").kendoChart({
                    legend: {
                        visible: false
                    },
                    seriesDefaults: {
                        type: "line",
                        missingValues: "gap",
                    },
                    series: self.model.seriesData,
                    valueAxis: {
                        max: 110,
                        min: 0,
                        line: {
                            visible: false
                        },
                        minorGridLines: {
                            visible: true
                        },
                        labels: {
                            format: "{0}%"
                        }
                    },
                    categoryAxis: {
                        categories: self.model.categoryLabels,
                        majorGridLines: {
                            visible: false
                        }
                    },
                    transitions: false,
                    tooltip: {
                        visible: true,
                        template: "#= series.name #: #= kendo.toString(value, 'n2') #%"
                    }
                });
            }
            
         

            //Grafico de tarta de los paros

            this.$("#grafParos").kendoChart({
                legend: {
                    visible: false
                },

                series: [{
                    type: "pie",
                    data: [
                    {
                        category: "Tiempo Neto",
                        value: self.model.totalTiempoOperativo,
                    }, {
                        category: "Paros Mayores",
                        value: self.model.totalParosMayores
                    }, {
                        category: "Pérdidas de producción",
                        value: self.model.totalParosMenores
                    }]
                }],
                seriesColors: ["#008000", "#FF0000", "#FFA500"],
                transitions: false,
                tooltip: {
                    visible: true,
                    template: "#= category # : #= kendo.format('{0:P}', percentage) #"
                }
            });

           


            // Barras de progreso
                      
            this.$("#pbOEEturno").kendoProgressBar({
                type: "percent",
                max: 100,                
                animation: false,
                change: function (e) {
                    if (e.value < self.model.cabecera.oeeCritico) {
                        this.progressWrapper.css({
                            "background-color": "red", "border-color": "red"
                        });
                    } else if (e.value < self.model.cabecera.oeeObjetivo) {
                        this.progressWrapper.css({
                            "background-color": "orange", "border-color": "orange"
                        });
                    } else {
                        this.progressWrapper.css({
                            "background-color": "green", "border-color": "green"
                        });
                    }

                },
                value: self.model.valoresDesdeInicioTurno.oee
                
            });

            var pbt = $("#pbOEEturno").data("kendoProgressBar");
            pbt.value(self.model.valoresDesdeInicioTurno.oee);
           

            var oee = self.model.valoresDesdeInicioOrden.oee;
            var OEEProgress = this.$("#pbOEEorden").kendoProgressBar({
                type: "value",
                max: 100,
                animation: false,
                value: oee
            }).data("kendoProgressBar");

            //var pb = $("#pbOEEorden").data("kendoProgressBar");
            //pb.value(self.model.valoresDesdeInicioOrden.datosProduccionAvanceTurnoOrden.oee);

            if (Math.floor(oee) == oee) {
                OEEProgress.progressStatus.text(oee + " %");
            } else {
                OEEProgress.progressStatus.text(oee.toFixed(2) + " %");
            }

            if (oee < self.model.cabecera.oeeCritico) {
                OEEProgress.progressWrapper.css({
                    "background-color": "red",
                    "border-color": "red"
                });
            }
            else if (oee < self.model.cabecera.oeeObjetivo) {
                OEEProgress.progressWrapper.css({
                    "background-color": "orange",
                    "border-color": "orange"
                });
            }
            else if (oee > 100) {
                OEEProgress.progressWrapper.css({
                    "background-color": "#FF0000",
                    "border-color": "#FF0000"
                });
            } else {
                OEEProgress.progressWrapper.css({
                    "background-color": "green",
                    "border-color": "green"
                });
            }
            
            $("#center-pane").css("overflow", "hidden");
            var height = $(window).height() - $("#header").height() - $("#footer").height() - $(".cabeceraVista").height();
            $("#segWO").css('max-height', height - 18);
            
        },                
        eliminar: function()
        {
            Backbone.off('eventNotificacionOrden' + window.app.lineaSel.numLinea);
            Backbone.off('eventNotificacionMaquina' + window.app.lineaSel.numLinea);
            Backbone.off('eventActProd');
            Backbone.off('eventNotificacionTurno');
            Backbone.off('eventActPlanificacionOrden');

            $("#center-pane").css("overflow", "");

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
    return SeguimientoWO;
});