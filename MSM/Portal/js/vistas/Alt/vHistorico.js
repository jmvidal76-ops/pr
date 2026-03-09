define(['underscore', 'backbone', 'jquery', 'ALT/vALTRunTime'],
    function (_, Backbone, $,  ALTcomponent) {
        var comRunTimeMenu = Backbone.View.extend({
        //ESTA JS ÚNICAMENTE SIRVE PARA CARGAR EL COMPONENTE RUNTIME EN MODO CONSULTA DE HISTÓRICO O RUNTIME
            initialize: function () {
                var self = this;
        
                self.component = new ALTcomponent({
                    idDepartmentType: "0", //CEL
                    idLoc: null, idForm: null, infoSIT: null, statusPendiente: true, statusFinalizado: true, esHistorico: true
                });

                self.component.render();
            },
            eliminar: function () {
                this.component.eliminar();
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

        return comRunTimeMenu;
    });