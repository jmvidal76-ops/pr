define(['underscore', 'backbone', 'jquery', 'text!../../html/plantillaPantallaAlmacen.html'],
    function (_, Backbone, $, plantilla) {
        var VistaPantallaAlmacen = Backbone.View.extend({
            tagName: 'div',
            id: 'carrusel',
            className: 'vistaControlAncho',
            datos: null,
            template: _.template(plantilla),
            msRefresco: 60000,

            initialize: function () {
                this.render();
                this.actualiza();

                var self = this;
                self.timer = setInterval(function () {
                    self.actualiza();
                }, self.msRefresco);
            },

            render: function () {
                $('body').html($(this.el));
                $(this.el).html(this.template());
                $(this.el).show();
            },

            CargarOEEDiaAnterior: function () {
                var self = this;

                var now = new Date();
                var desde = new Date(new Date(now.setDate(now.getDate() - 1)).setHours(12, 0, 0));
                now = new Date();
                var hasta = new Date(now.setHours(12, 0, 0));

                self.CargarOEEFabrica(desde, hasta, 'OEEDiaAnterior');
            },

            CargarOEEMes: function () {
                var self = this;

                var now = new Date();
                var desde = new Date(now.getFullYear(), now.getMonth(), 1, 12);
                var hasta = new Date(now.getFullYear(), now.getMonth() + 1, 1, 12);

                self.CargarOEEFabrica(desde, hasta, 'OEEMes');
            },

            CargarOEEFabrica: function (desde, hasta, elem) {
                var data = {
                    desde: desde.toISOString(),
                    hasta: hasta.toISOString()
                };

                $.ajax({
                    type: 'GET',
                    url: '../api/pantallaAlmacen/OEEFabrica',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    data: data,
                    success: function (res) {
                        $('.' + elem).html(res + ' %');
                    },
                    error: function (err) {
                        console.log('Error cargando OEE Fabrica en PantallaAlmacen:');
                        console.log(err);
                    }
                });
            },

            actualiza: function () {
                this.CargarOEEDiaAnterior();
                this.CargarOEEMes();
            },

            eliminar: function () {
                if (this.timer) {
                    clearInterval(this.timer);
                    this.timer = null;
                }

                this.remove();
                this.off();

                if (this.model && this.model.off) {
                    this.model.off(null, null, this);
                }
            }
        });

        return VistaPantallaAlmacen;
    }
);
