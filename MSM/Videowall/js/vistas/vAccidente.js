define(['underscore', 'backbone', 'jquery', 'text!../../html/plantillaAccidente.html'],
    function (_, Backbone, $, plantillaAccidente) {
        var VistaAccidente = Backbone.View.extend({
            tagName: 'div',
            id: 'VistaAccidente',
            className: 'vistaCarrusel',
            linea: null,
            dias: 0,
            template: _.template(plantillaAccidente),
            initialize: function (options) {
                var self = this;

                var lineas = $.grep(window.app.planta.lineas, function (linea, index) {
                    return linea.numLinea == options.options.numLinea;
                });
                if (lineas.length > 0) {
                    self.linea = lineas[0];
                }

                self.calculaDias();
            },
            render: function () {
                var self = this;
                $(this.el).html(this.template({ 'dias': self.dias, 'linea': window.app.idioma.t("LINEA") + " " + self.linea.numLineaDescripcion + " - " + self.linea.descripcion }));
                
                return this;
            },
            actualiza: function () {
                var self = this;
                self.calculaDias();
                self.resize();
            },
            calculaDias: function () {
                var self = this;
                var lineaActual = window.app.idioma.t('LINEA') + " " + self.linea.numLineaDescripcion;

                $.ajax({
                    type: "GET",
                    async: false,
                    url: "../api/FechaAccidente_Read/" + lineaActual + "/",
                    dataType: 'json',
                    cache: false,
                    success: function (data) {
                        //Fecha Actual
                        var now = new Date();
                        //Fecha último accidente
                        var fecha = new Date(data);
                        //Se calcula la diferencia en ms con los TimeZone para la diferencia entre 00:00 y 01:00
                        var diff = (now - fecha) + ((fecha.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
                        //Dia en milisegundos
                        var oneDay = 1000 * 60 * 60 * 24;
                        //Diferencia de milisegundos entre un dia
                        var day = Math.floor(diff / oneDay);

                        self.dias = day;
                    },
                    error: function (err) {
                    }
                });

                self.render();
            },
            events: {

            },
            resize: function () {
                var self = this;
                var marginTop = null;

                var totalHeight = $("#carrusel").innerHeight();
                var listadoLineasHeight = $("#divtableAccidente").innerHeight();

                if (listadoLineasHeight > 0) {
                    var dif = totalHeight - listadoLineasHeight;
                    marginTop = dif / 2;
                    $("#divAccidente").css("margin-top", marginTop);
                }
            }
        });

        return VistaAccidente;
    }
);