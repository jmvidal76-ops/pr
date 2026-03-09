define(['underscore', 'backbone', 'jquery', 'text!../../html/menuWO.html'],
    function (_, Backbone, $, PlantillaMenuWO) {
        var MenuWO = Backbone.View.extend({
            template: _.template(PlantillaMenuWO),
            initialize: function (options) {
                Backbone.on('eventcambioPuesto', this.actualizaCambioPuesto, this);
                this.render();
            },
            render: function () {
                var modelo = this.model.toJSON();
                var self = this;
                $(this.el).html(this.template(modelo));

                this.$("#btnVolverListado").kendoButton({ imageUrl: "img/back.png" });
                this.$("#btnGenerarFPA").kendoButton({ imageUrl: "img/pdf.png" });
                this.$("#btnListaMateriales").kendoButton({ imageUrl: "img/bomb.png" });
                this.$("#btnComprobarMaterial").kendoButton({ imageUrl: "img/check_material.png" });
            },
            checkButtons: function () {
                var self = this;
            },
            actualizaCambioPuesto: function () {
                var self = this;
                self.checkButtons();
            },
            eliminar: function () {
                Backbone.off('eventcambioPuesto');
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

        return MenuWO;
    });