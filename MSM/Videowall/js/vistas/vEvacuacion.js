define(['underscore', 'backbone', 'jquery', 'text!../../html/plantillaEvacuacion.html'],
    function (_, Backbone, $, plantillaEvacuacion) {
        var VistaEvacuacion = Backbone.View.extend({
            tagName: 'div',
            id: 'VistaEvacuacion',
            className: 'vistaCarrusel',
            dias: 0,
            template: _.template(plantillaEvacuacion),
            initialize: function () {
                var self = this;
                self.render();
            },
            render: function () {
                var self = this;
                $(this.el).html(this.template());

                return this;
            },
            actualiza: function () {
                var self = this;
                self.render();
            },
            events: {

            },
        });

        return VistaEvacuacion;
    }
);