define(['underscore', 'backbone', 'jquery', 'text!../../html/plantillaDiaJuliano.html'],
    function (_, Backbone, $, plantillaDiaJuliano) {
        var VistaDiaJuliano = Backbone.View.extend({
            tagName: 'div',
            id: 'VistaDiaJuliano',
            className: 'vistaControlAncho',
            dia: 0,
            marginTopDiv: 0,
            template: _.template(plantillaDiaJuliano),
            initialize: function () {
                var self = this;
                self.calculaDia(self);
                setInterval(function () { self.calculaDia(self); }, 60000);
            },
            render: function () {
                var self = this;
                $(this.el).html(this.template({ 'dia': self.dia, 'semana': self.semana }));
                
                return this;
            },
            actualiza: function () {
                var self = this;
                self.calculaDia(self);
            },
            events: {

            },
            calculaDia: function (self) {
                self.dia = self.JulianDay();
                self.semana = self.IsoWeek();
                self.render();
            },
            JulianDay: function () {
                //Fecha Actual
                var now = new Date();
                //Inicio del año en curso
                var start = new Date(now.getFullYear(), 0, 0);
                //Se calcula la diferencia en ms con los TimeZone para la diferencia entre 00:00 y 01:00
                var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
                //Dia en milisegundos
                var oneDay = 1000 * 60 * 60 * 24;
                //Diferencia de milisegundos entre un dia
                var day = Math.floor(diff / oneDay);

                return day;
            },
            IsoWeek: function () {
                //Fecha Actual
                var today = new Date();
                var date = new Date(today.getTime());
                date.setHours(0, 0, 0, 0);
                // Thursday in current week decides the year.
                date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
                // January 4 is always in week 1.
                var week1 = new Date(date.getFullYear(), 0, 4);

                // Adjust to Thursday in week 1 and count number of weeks from date to week1.
                return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
            }
        });

        return VistaDiaJuliano;
    }
);