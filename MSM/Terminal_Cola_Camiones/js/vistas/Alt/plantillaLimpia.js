define(['underscore', 'backbone', 'jquery', 'text!../../../html/Alt/runTime.html', 'compartido/notificaciones'],
    function(_, Backbone, $, Plantilla,  Not) {
        var ListadoWO = Backbone.View.extend({
            tagName: 'div',            
            template: _.template(Plantilla),
            initialize: function(options) {
                var self = this;
                
                //Backbone.on('eventActProd', this.actualiza, this);
                self.render();
            },
            render: function() {
                var self = this;

                $(this.el).html(this.template());
              
                //$("#center-pane").append(this.el);
                $("#center-pane").css("overflow", "hidden");
                var height = $(window).height() - $("#header").height() - $("#footer").height() - $(".cabeceraVista").height();

                $("#divAltRuntime").css('max-height', height - 40);
            },
           
            eliminar: function() {
                //Backbone.off('eventNotificacionOrden' + window.app.lineaSel.numLinea);
               
                $("#center-pane").css("overflow", "");
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
        return ListadoWO;
    });