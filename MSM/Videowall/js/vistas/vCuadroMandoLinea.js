define(['underscore', 'backbone', 'jquery', 'text!../../html/plantillaCuadroMandoLinea.html'],
    function (_, Backbone, $, plantillaCuadroMandoLinea) {
        var VistaCuadroMandoLinea = Backbone.View.extend({
            tagName: 'div',
            id: 'vistaCuadroMandoLinea',
            linea: null,
            datos: null,
            vuelta: 0,
            className: 'vistaCarruselCompleto',
            template: _.template(plantillaCuadroMandoLinea),
            initialize: function (options) {
                Backbone.on('eventActProd', this.ObtenerDatosCuadroMando, this);
                if (options && options.options.numLinea) {
                    var lineas = $.grep(window.app.planta.lineas, function (linea, index) {
                        return linea.numLinea == options.options.numLinea;
                    });
                    if (lineas.length > 0) {
                        this.linea = lineas[0]
                        this.ObtenerDatosCuadroMando();
                    }
                }
            },
            render: function () {
                var self = this;
                var linea = null;
                $(this.el).html(this.template({ 'data': self.datos }));
                linea = self.datos.linea;

                //OEEWO
                var oeeWo = linea.ordenEnPaletizadora == null ? 0 : linea.ordenEnPaletizadora.produccion.oee;
                var passProgressWo;
                passProgressWo = this.$("#oeeWO" + linea.numLinea).kendoProgressBar({
                    type: "percent",
                    max: 100,
                    value: oeeWo,
                    animation: true,
                    showStatus: false
                }).data("kendoProgressBar");
                // Color de fondo
                if (linea.ordenEnPaletizadora != null) {
                    if (oeeWo < linea.ordenEnPaletizadora.oeeCritico) {
                        passProgressWo.progressWrapper.css({
                            "background-color": "#FF3333",
                            "border-color": "#FF3333"
                        });
                    } else if (oeeWo < linea.ordenEnPaletizadora.oeeObjetivo) {
                        passProgressWo.progressWrapper.css({
                            "background-color": "#FF9933",
                            "border-color": "#FF9933"
                        });
                    } else {
                        passProgressWo.progressWrapper.css({
                            "background-color": "lightgreen",
                            "border-color": "lightgreen"
                        });
                    }
                }

                // Turnos
                var oeeTurno = self.datos.OEETurno;
                if (linea.turnoProductivo) {
                    var passProgressTurno;
                    // Barra de progreso
                    passProgressTurno = this.$("#oeeTurno" + linea.numLinea).kendoProgressBar({
                        type: "percent",
                        max: 100,
                        value: oeeTurno,
                        animation: false,
                        showStatus: false
                    }).data("kendoProgressBar");
                    // Color de fondo
                    if (oeeTurno < linea.oeeCritico) {
                        passProgressTurno.progressWrapper.css({
                            "background-color": "#FF3333",
                            "border-color": "#FF3333"
                        });
                    } else if (oeeTurno < linea.oeeObjetivo) {
                        passProgressTurno.progressWrapper.css({
                            "background-color": "#FF9933",
                            "border-color": "#FF9933"
                        });
                    } else {
                        passProgressTurno.progressWrapper.css({
                            "background-color": "lightgreen",
                            "border-color": "lightgreen"
                        });
                    }

                }
                return this;
            },
            ObtenerDatosCuadroMando: function () {
                var self = this;
                $.ajax({
                    type: "GET",
                    url: "../api/videowall/turnoslineas/" + self.linea.numLinea + "/",
                    dataType: 'json',
                    cache: false
                }).success(function (data) {
                    self.datos = data[0];
                    self.render();
                }).error(function (err, msg, ex) {
                    //alert(ex);
                    //Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_SEGUIMIENTO_LINEA') + ': ' + ex, 4000);
                });
            },
            actualiza: function () {
                var self = this;
                self.resize();
            },
            resize: function () {
                var self = this;
                var marginTop = null;
                var totalHeight = $("#carrusel").innerHeight();
                var listadoLineasHeight = $("#" + self.id + " #divtableOEE").innerHeight();
                if (listadoLineasHeight > 0) {
                    var dif = totalHeight - listadoLineasHeight;
                    marginTop = dif / 2;
                    $("#" + self.id + " #divOEE").css("margin-top", marginTop);
                }
            },
            events: {

            },
            eliminar: function () {
                Backbone.off('eventActProd');
                this.remove();
                this.off();
                if (this.datos && this.datos.off) { this.datos.off(null, null, this); }
            }
        });
        return VistaCuadroMandoLinea;
    }
);
