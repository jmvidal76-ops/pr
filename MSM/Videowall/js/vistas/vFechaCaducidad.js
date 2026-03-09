define(['underscore', 'backbone', 'jquery', 'text!../../html/plantillaFechaCaducidad.html'],
    function (_, Backbone, $, plantillaFechaCaducidad) {
        var VistaFechaCaducidad = Backbone.View.extend({
            tagName: 'div',
            id: 'VistaFechaCaducidad',
            className: 'vistaCarrusel',
            fecha: '',
            hora: '',
            timer: null,
            dateTime: null,
            dsLineas: null,
            linea: null,
            template: _.template(plantillaFechaCaducidad),
            initialize: function (options) {
                var self = this;

                Backbone.on('eventActProd', self.actualiza, self);


                let lineas = $.grep(window.app.planta.lineas, function (linea, index) {
                    return linea.numLinea == options.options.numLinea;
                });

                if (lineas.length > 0) {
                    self.linea = lineas[0]
                    self.ObtenerLineas();
                    self.actualiza();
                }
            },
            ObtenerLineas: function () {
                var self = this;

                $.ajax({
                    url: "../api/videowall/ObtenerLineas",
                    async: false,
                    dataType: 'json',
                }).done(function (res) {
                    self.dsLineas = res;
                }).fail(function (e) {
                    console.error("Error ObtenerLineas", e);
                });
            },
            ObtenerInfoTrenes: function (numLinea) {
                var self = this;                

                if (!self.dsLineas || !self.dsLineas.length) {
                    self.ObtenerLineas();
                }

                var item = self.dsLineas.find(linea => linea.Id == numLinea);
                if (!item) {
                    console.error("No se encontró la línea con Id =", numLinea, "en dsLineas");
                    self.fecha = '-';
                    self.render();
                    return;
                }

                var idEtiquetaSIGI = item.IdEtiquetaSIGI;

                $.ajax({
                    type: "GET",
                    url: "../api/videowall/ObtenerInfoTrenes/" + idEtiquetaSIGI,
                    async: false,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                }).done(function (res) {
                    var fechaRaw = Array.isArray(res) ? (res[1] ?? '-') : (res ?? '-');
                    // 1) Parsear el string a Date (aceptando dd/MM/yy y dd/MM/yyyy)
                    var dt = kendo.parseDate(fechaRaw, ["dd/MM/yy", "dd/MM/yyyy"]);
                    // 2) Formatear a dd/MM/yyyy si se parseó; si no, mostrar tal cual
                    self.fecha = dt ? kendo.toString(dt, 'dd/MM/yyyy') : fechaRaw;

                    self.render();
                }).fail(function (e) {
                    console.error("Error ObtenerInfoTrenes", e);
                    self.fecha = '-';
                    self.render();
                });
            },
            render: function () {
                var self = this;
                $(this.el).html(this.template({ 'fecha': self.fecha, 'hora': self.hora }));
                // Evitar errores si no existe actualizaReloj: solo crear el timer si está definida
                clearInterval(self.timer);
                if (typeof self.actualizaReloj === 'function') {
                    self.timer = setInterval(function () { self.actualizaReloj(); }, 1000);
                }
                return this;
            },
            actualiza: function () {
                var self = this;
                self.ObtenerInfoTrenes(self.linea.numLinea);
            },
            events: {

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

        return VistaFechaCaducidad;
    }
);