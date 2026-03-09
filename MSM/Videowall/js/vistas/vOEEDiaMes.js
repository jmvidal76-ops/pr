define(['underscore', 'backbone', 'jquery', 'text!../../html/plantillaOEEDiaMes.html'],
    function (_, Backbone, $, plantilla) {
        var VistaOEEDiaMes = Backbone.View.extend({
            tagName: 'div',
            id: 'vistaOEEDiaMes',
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

            },
            CargarOEEDiaAnterior: function () {
                let self = this;

                let now = new Date();

                let desde = new Date(new Date(now.setDate(now.getDate() - 1)).setHours(12, 0, 0,));
                now = new Date();
                let hasta = new Date(now.setHours(12, 0, 0,));

                self.CargarOEEFabrica(desde, hasta, "OEEDiaAnterior");
            },
            CargarOEEMes: function () {
                let self = this;

                let now = new Date();
                let desde = new Date(now.getFullYear(), now.getMonth(), 1, 12);
                let hasta = new Date(now.getFullYear(), now.getMonth() + 1, 1, 12);

                self.CargarOEEFabrica(desde, hasta, "OEEMes");
            },
            CargarOEEFabrica: function (desde, hasta, elem) {
                let sefl = this;

                let data = {
                    desde: desde.toISOString(),
                    hasta: hasta.toISOString(),
                }

                $.ajax({
                    type: "GET",
                    url: "../api/videowall/OEEFabrica",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: data,
                    success: function (res) {

                        $("." + elem).html(res + " %");
                    },
                    error: function (err) {
                        console.log(`Error cargando OEE Fabrica:`);
                        console.log(err);
                    }
                });
            },
            actualiza: function () {
                let self = this;
                self.CargarOEEDiaAnterior();
                self.CargarOEEMes();
                self.render();
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

        return VistaOEEDiaMes;
    }
);
