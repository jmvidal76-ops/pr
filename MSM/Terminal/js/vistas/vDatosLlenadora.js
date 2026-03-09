define(['underscore', 'backbone', 'jquery', 'text!../../html/datosLLenadora.html'],
function (_, Backbone, $, plantillaDatosLlenadora) {
    var VistaDatosLlenadora = Backbone.View.extend({
        tagName: 'divLlenadoras',
        template: _.template(plantillaDatosLlenadora),
        initialize: function () {
            this.render();
        },
        render: function () {
            var self = this;

            $(this.el).html(this.template({ 'model': this.model }));
           
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
        },
        actualiza: function () {
            this.render();
        }
    });
    return VistaDatosLlenadora;
});