define(['underscore', 'backbone', 'jquery', 'text!../../html/plantillaRendimientoTurnos.html'],
    function (_, Backbone, $, plantilla) {
        var VistaRendimientoTurnos = Backbone.View.extend({
            tagName: 'div',
            id: 'vistaRendimientoTurnos',
            linea: null,
            datos: null,
            turno: null,
            className: 'vistaControlAncho',
            template: _.template(plantilla),
            initialize: function (options) {
                let self = this;
                Backbone.on('eventActProd', self.actualiza, self);
                //Backbone.on('eventActProdTurno', this.actualizaOee, this);

                let lineas = $.grep(window.app.planta.lineas, function (linea, index) {
                    return linea.numLinea == options.options.numLinea;
                });
                if (lineas.length > 0) {
                    self.linea = lineas[0]
                    self.actualiza();
                }
            },
            render: function () {
                let self = this;
                $(this.el).html(this.template({ 'data': self.datos, 'turno': self.turno, 'linea': window.app.idioma.t("LINEA") + " " + self.linea.numLineaDescripcion + " - " + self.linea.descripcion }));

                $("#" + self.id + " #divtableRendimientoTurnos")
                $("#" + self.id + " #errorDiv").hide();
                $("#" + self.id + " #graficaTurno").hide();
                if (self.turno) {
                    if (self.datos) {
                        $("#" + self.id + " #graficaTurno").show();
                        $("#" + self.id + " #graficaTurno").kendoChart({
                            //title: {
                            //    text: "Curva de Producción de turno",
                            //    color: "#FFF",
                            //    font: "3vw sans-serif"
                            //},
                            chartArea: {
                                height: $("#carrusel").innerHeight() - $("#" + self.id + " .tituloLineaSmall").innerHeight() - 40, //$("#center-pane").innerHeight() - $("#divCabeceraVista").innerHeight() - $("#divCurvaTurno").innerHeight() - 5
                                background: "#000",
                            },
                            legend: {
                                visible: false
                                //    position: "bottom"
                            },
                            seriesDefaults: {
                                type: "line",
                                color: "#FFF"
                            },
                            series: self.datos.Series,
                            valueAxis: {
                                color: "#FFF",
                                labels: {
                                    font: "1vw sans-serif",
                                },
                                line: {
                                    visible: false
                                },
                            },
                            categoryAxis: {
                                categories: self.datos.Horas,
                                majorGridLines: {
                                    visible: false
                                },
                                labels: {
                                    step: 6,
                                    color: "#FFF",
                                    font: "1vw sans-serif"
                                },
                            },
                            //tooltip: {
                            //    visible: true,
                            //    format: "{0}",
                            //    template: "#= series.name #: #= value #"
                            //}
                        });
                    }
                    else {
                        // No hay datos de rendimiento
                        $("#" + self.id + " #errorDiv").show();
                        $("#" + self.id + " #errorDiv").html("No hay datos para mostrar")//<br/>No data to display.")
                    }
                } else {
                    // No hay turno activo
                    $("#" + self.id + " #errorDiv").show();
                    $("#" + self.id + " #errorDiv").html("No hay turno activo")//<br/>There is no active turn.")
                }
            },
            CargarRendimientoTurnos: function (linea) {
                let self = this;

                self.datos = null;
                self.turno = null;

                $.ajax({
                    type: "GET",
                    url: "../api/videowall/rendimientoTurnos/" + linea +"/",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        
                        self.turno = res.turno;
                        self.datos = res.datos;                        
                    },
                    error: function (err) {
                        console.log(`Error cargando curva de rendimiento:`);
                        console.log(err);
                    },
                    complete: function () {
                        self.render();
                    },
                });
            },
            actualiza: function () {
                let self = this;
                self.CargarRendimientoTurnos(self.linea.id);
                
            },
            events: {

            },
            eliminar: function () {
                Backbone.off('eventActProd');
                //Backbone.off('eventActProdTurno');
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

        return VistaRendimientoTurnos;
    }
);
