define(['underscore', 'backbone', 'jquery'],
    function (_, Backbone, $, PlantillaInicio) {
        var Inicio = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',

            initialize: function () {
                var self = this;
                self.render();

            },
            render: function () {
                //$(this.el).html('');
                $("#center-pane").html('ey');
                //$("#center-pane").append($(this.el))
            },
            events: {

            },

            eliminar: function () {
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

        return Inicio;
    });