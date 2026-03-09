define(['underscore', 'backbone', 'jquery', 'text!../../../Logistica/html/BloqueCarga.html'],
    function (_, Backbone, $, plantillaBloque) {
        var BloqueCarga = Backbone.View.extend({
            tagName: 'div',
            template: _.template(plantillaBloque),
            initialize: function () {
                //this.model.on('change', this.render, this);
                this.render();
            },
            render: function () {
                $(this.el).html(this.template({ 'zona': this.model }));

                var self = this;
                var passProgress;

                passProgress = self.$("#info" + self.model.ZonaCarga.Id).kendoProgressBar({
                    type: "percent",
                    max: 100,
                    value: self.model.PorcentajeLlenado,
                    animation: true,
                    showStatus: false
                }).data("kendoProgressBar");

                if (!self.model.SinOperacion) {
                    if (self.model.PorcentajeLlenado == 0) {
                        passProgress.value(100);
                        passProgress.progressWrapper.css({
                            "background-color": "#FF9933",
                            "border-color": "#FF9933"
                        });
                    } else {
                        passProgress.progressWrapper.css({
                            "background-color": "lightgreen",
                            "border-color": "lightgreen"
                        });
                    }
                }

                return this;
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
        return BloqueCarga;
    });