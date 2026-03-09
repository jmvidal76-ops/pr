define(['underscore', 'backbone', 'jquery', 'text!../../html/plantillaFecha.html'],
    function (_, Backbone, $,plantillaFecha) {
        var VistaFecha = Backbone.View.extend({
            tagName: 'div',
            id: 'VistaFecha',
            className: 'vistaCarrusel',
            fecha: '',
            hora:'',
            timer: null,
            dateTime: null,
            template: _.template(plantillaFecha),
            initialize: function () {
                var self = this;
                self.getServerDatetime();
            },
            getServerDatetime: function () {
                var self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/videowall/getServerDateTime/",
                    dataType: 'json',
                    async: false,
                    cache: false
                }).success(function (data) {
                    self.dateTime = new Date(data);
                    self.dateTime.setSeconds(self.dateTime.getSeconds() + 1);
                    self.calculaFechaHora(self);
                }).error(function (err, msg, ex) {
                });
            },
            render: function () {
                var self = this;
                $(this.el).html(this.template({ 'fecha': self.fecha, 'hora': self.hora }));
                clearInterval(self.timer);
                self.timer = setInterval(function () { self.actualizaReloj(); }, 1000);
                return this;
            },
            actualiza: function () {
                var self = this;
                //self.calculaFechaHora(self);
                self.getServerDatetime();
                //self.resize();
            },
            events:{

            },
            actualizaReloj: function () {
                var self = this;
                if (self.dateTime) {
                    self.dateTime.setSeconds(self.dateTime.getSeconds() + 1);
                }
            },
            calculaFechaHora: function (self) {
                if (self.dateTime) {
                    var ahora = self.dateTime;
                    self.fecha = kendo.toString(ahora, 'dd/MM/yyyy');
                    self.hora = kendo.toString(ahora, 'HH:mm');
                }
                self.render();
            },
            resize: function () {
                //var self = this;
                //var marginTop = null;

                //var totalHeight = $("#carrusel").innerHeight();
                //var listadoLineasHeight = $("#divtableFecha").innerHeight();

                //if (listadoLineasHeight > 0) {
                //    var dif = totalHeight - listadoLineasHeight;
                //    marginTop = dif / 2;
                //    $("#divFecha").css("margin-top", marginTop);
                //}
            }
        });

        return VistaFecha;
    }
);