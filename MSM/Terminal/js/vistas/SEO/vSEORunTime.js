define(['underscore', 'backbone', 'jquery', 'text!../../../html/SEO/SEOrunTime.html', 'ALT/vALTRunTimeForms', 'compartido/notificaciones'],
    function(_, Backbone, $, Plantilla, ALTcomponent,  Not) {
        var ListadoWO = Backbone.View.extend({
            tagName: 'div',            
            template: _.template(Plantilla),
            component: null,
            initialize: function(options) {
                var self = this;
                //Backbone.on('eventActProd', this.actualiza, this);
                self.render();
                Backbone.on('eventcambioPuesto', this.actualiza, this);
            },
            render: function() {
                var self = this;

                $(this.el).html(this.template());
                //escondemos el menu secundario
                $("#divMenuSecundario").slideUp({ duration: 100, queue: false, opacity: "toggle" });
                //style
                $("#center-pane").css("overflow", "hidden"); 
                //var height = $(window).height() - $("#header").height() - $("#footer").height() - $(".cabeceraVista").height();
                //$(self.component.el).css('max-height', height - 40);
                //$(self.component.el).css("overflow", "hidden");
                //self.component.grid.height = height - 40;               
                //this.$("#divAltRuntime").css('height', height);
                var idPDV = window.app.pdvSEOSel;
                if (idPDV) {
                    self.component = new ALTcomponent({
                        idDepartmentType: "1", //SEO
                        idLoc: idPDV, idForm: null, infoSIT: null, allowFilters: false, statusPendiente: true, statusFinalizado: false,
                        pageable: false, allowFiltersGrid: false, terminalMode: true, esHistorico: false
                    });
                    this.$("#divAltRuntime").append(self.component.render().el);
                    
                } else {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t("SEO_ERR_NO_PDV_SEL"), 8000); 
                }
            },
            actualiza: function(cambioPuesto) {
                this.render();
            },
            eliminar: function() {
                Backbone.off('eventcambioPuesto');
                if(this.component)
                    this.component.eliminar();
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