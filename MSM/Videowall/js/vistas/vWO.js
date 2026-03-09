define(['underscore', 'backbone', 'jquery', 'text!../../html/plantillaWO.html'],
    function (_, Backbone, $, plantillaWO) {
        var VistaWO = Backbone.View.extend({
            tagName: 'div',
            id: 'vistaWO',
            linea: null,
            className: 'vistaCarrusel',
            template: _.template(plantillaWO),
            initialize: function (options) {
                Backbone.on('eventActProd', this.obtenerLinea, this);

                var lineas = $.grep(window.app.planta.lineas, function (linea, index) {
                    return linea.numLinea == options.options.numLinea;
                });
                if (lineas.length > 0) {
                    this.linea = lineas[0];
                }
            },
            render: function () {
                var self = this;
                $(this.el).html(this.template({ 'data': self.linea, 'linea': window.app.idioma.t("LINEA") + " " + self.linea.numLineaDescripcion + " - " + self.linea.descripcion }));

                if (self.linea.ordenEnPaletizadora != null) {
                    if (self.linea.ordenEnPaletizadora.produccion.oee < self.linea.oeeCritico) {
                        this.$("#oee").css({
                            "color": "red"
                        });
                    } else if (self.linea.ordenEnPaletizadora.produccion.oee < self.linea.oeeObjetivo) {
                        this.$("#oee").css({
                            "color": "orange"
                        });
                    } else {
                        this.$("#oee").css({
                            "color": "#58FA58"
                        });
                    }
                }

                return this;
            },
            obtenerLinea: function () {
                var self = this;

                $.ajax({
                    type: "GET",
                    async: false,
                    url: "../api/lineasVideowall/" + self.linea.id + "/",
                    dataType: 'json',
                    cache: false
                }).success(function (data) {
                    self.linea = data;
                }).error(function (err, msg, ex) {
                });

                self.render();
            },
            actualiza: function () {
                var self = this;
                self.obtenerLinea();
                self.resize();
            },
            resize: function () {
                var self = this;
                var marginTop = null;

                var totalHeight = $("#carrusel").innerHeight();
                var listadoLineasHeight = $("#divtableWO").innerHeight();

                if (listadoLineasHeight > 0) {
                    var dif = totalHeight - listadoLineasHeight;
                    marginTop = dif / 2;
                    $("#divWO").css("margin-top", marginTop);
                }
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

        return VistaWO;
    }
);