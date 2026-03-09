define(['underscore', 'backbone', 'jquery', 'ALT/vALTRunTime', 'compartido/notificaciones'],
    function (_, Backbone, $,  ALTcomponent, Not) {
        var comRunTimeMenu = Backbone.View.extend({
        //ESTA JS ÚNICAMENTE SIRVE PARA CARGAR EL COMPONENTE RUNTIME EN MODO CONSULTA DE HISTÓRICO O RUNTIME
            component: null,
            idDepartmentType: "0", // CEL
            initialize: function () {
                var self = this;
                self.component = new ALTcomponent({
                    idDepartmentType: this.idDepartmentType, 
                    idLoc: null, idForm: null, infoSIT: null, statusPendiente: true, statusFinalizado: false, esHistorico: false
                });
                Backbone.on('eventNotNewAltForm_type'+this.idDepartmentType, this.eventNotNewAltForm, this);
                self.component.render();
                
            },
            eventNotNewAltForm: function () {
                Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('ALT_NEW_FORM'), 2000);
                //this.refreshGrid();
            },
            eliminar: function () {
                    Backbone.off('eventNotNewAltForm_type'+this.idDepartmentType);
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