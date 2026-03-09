define(['underscore', 'backbone', 'jquery', 'text!../../../Alt/html/vplantillaSplit.html',  'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, ALTTemplate, VistaDlgConfirm, Not) {
        var comGestionLocations = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLrunTime',
            ds: null,
            dialogEdit: null,

            template: _.template(ALTTemplate),
            initialize: function () {
                var self = this;     
               
                self.render();
            },
            
            render: function () {
                var self = this;
                $(self.el).html(self.template())
                $("#center-pane").append($(self.el))
                //split
                $("#alt-horizontal").kendoSplitter({
                    panes: [
                        { collapsible: false, size: "200px" },
                        { collapsible: false }
                    ]
                });
               
                //INI AUTO RESIZE
                var outerSplitter = $("#alt-horizontal").data("kendoSplitter");
                var browserWindow = $(window);
                var headerFooterHeight = $("#header").height() + $("#divCabeceraVista").height();
                function resizeSplitter() {
                    outerSplitter.wrapper.height(browserWindow.height() - headerFooterHeight);
                    outerSplitter.resize();
                }
                resizeSplitter();
                browserWindow.resize(resizeSplitter);               
                //FIN AUTO RESIZE
            },
            events: {
                '#btn':'event'
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

        return comGestionLocations;
    });