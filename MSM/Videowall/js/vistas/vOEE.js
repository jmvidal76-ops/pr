define(['underscore', 'backbone', 'jquery', 'text!../../html/plantillaOEE.html'],
    function (_, Backbone, $, plantillaOEE) {
        var VistaOEE = Backbone.View.extend({
            tagName: 'div',
            id: 'vistaOEE',
            linea: null,
            datos: null,
            className: 'vistaControlAncho',
            template: _.template(plantillaOEE),
            initialize: function (options) {
                Backbone.on('eventActProd', this.actualizaOee, this);
                //Backbone.on('eventActProdTurno', this.actualizaOee, this);

                var lineas = $.grep(window.app.planta.lineas, function (linea, index) {
                    return linea.numLinea == options.options.numLinea;
                });
                if (lineas.length > 0) {
                    this.linea = lineas[0]
                    this.actualizaOee();
                }
            },
            render: function () {
                var self = this;
                $(this.el).html(this.template({ 'data': self.datos, 'linea': window.app.idioma.t("LINEA") + " " + self.linea.numLineaDescripcion + " - " + self.linea.descripcion }));

                if (self.datos.valoresDesdeInicioTurno.oee < self.datos.cabecera.oeeCritico) {
                    this.$("#oee").css({
                        "color": "red"
                    });
                } else if (self.datos.valoresDesdeInicioTurno.oee < self.datos.cabecera.oeeObjetivo) {
                    this.$("#oee").css({
                        "color": "orange"
                    });
                } else {
                    this.$("#oee").css({
                        "color": "#58FA58"
                    });
                }
                return this;
            },
            actualizaOee: function () {
                var self = this;
                $.ajax({
                    type: "GET",
                    url: "../api/lineas/getSeguimiento/" + self.linea.id + "/",
                    dataType: 'json',
                    cache: false
                }).success(function (data) {
                    self.datos = data;
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
                var listadoLineasHeight = $("#" + self.id +" #divtableOEE").innerHeight();

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

        return VistaOEE;
    }
);
