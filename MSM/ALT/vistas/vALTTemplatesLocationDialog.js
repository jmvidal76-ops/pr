define(['underscore', 'backbone', 'jquery', 'text!/ALT/html/ALTTemplatesLocationDialog.html', 'ALT/vALTUtils', 'compartido/notificaciones'],
    function (_, Backbone, $, HTML_Template, ALTUtils, Not) {
        var altUtil = new ALTUtils();
        //location VIEW
        var locationView = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLTemplatelocationView',
            title: null,
            formValidator: null,
            parentWindow: null,
            data2bind: {
                locationTemplate: null,
              
            },        
            

            template: _.template(HTML_Template),
            initialize: function ( params, parentID, parentWindow) {
                var self = this;
                self.parentWindow = parentWindow;               
                if (params.locationTemplate == null) {
                    self.data2bind.locationTemplate = new kendo.data.ObservableObject({ ID: -1, name: '', descript: '', idParent: parentID, idSITInherit: true, idSITLoc: ''});
         
                } else {
                    self.data2bind.locationTemplate = new kendo.data.ObservableObject(params.locationTemplate);
                   
                }               
                //set type of department
                self.data2bind.locationTemplate.set("idDepartmentType", self.parentWindow.idDepartmentType);
                //set tittle of window                
                self.title = self.data2bind.locationTemplate.name;                
                self.render();
            },
            render: function(){
                //--ini DIALOG WINDOW--//
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());
                
                self.$("#btnAceptar").kendoButton();
                self.$("#btnCancelar").kendoButton();
                self.$("#btnAceptar").val(window.app.idioma.t('ACEPTAR'));
                self.$("#btnCancelar").val(window.app.idioma.t('CANCELAR'));

                //bind Data to HTML
                kendo.bind($("#myDialog"), self.data2bind);
                self.formValidator = altUtil.getValidator("#locationTemplate");
                //window properties
                self.window = $(self.el).kendoWindow(
                {
                    title: self.title,
                    //width: "320px",
                    //height: "300px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: [],
                    activate: this.onActivate
                }).data("kendoWindow");
                
                self.dialog = $('#myDialog').data("kendoWindow");
                self.dialog = self.window;                
                self.dialog.center();               

            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar'
                
            },

            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
            },
            aceptar: function (e) {
                 
                //Guardamos template
                e.preventDefault();

                var self = this;
                console.log(JSON.stringify(self.data2bind.locationTemplate));
                if (self.formValidator.validate()==false)  {
                    
                    //Not.crearNotificacion('error', window.app.idioma.t('AVISO'), 'Debe proporcionar un nombre para el rol y los campos asociadas', 2000);
                } else {
                    $.ajax({
                        data: JSON.stringify(self.data2bind.locationTemplate),
                        type: "POST",
                        async: false,
                        url: "../api/TemplatesLocations",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            if (res[0] == true) {
                                self.parentWindow.loadData();
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1], 2000);                                
                            }
                            else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res[1], 2000); 
                            }
                            self.dialog.close();
                            self.eliminar();
                            Backbone.trigger('eventCierraDialogo');
                        },
                        error: function (response) {
                            if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ALT_error_create_template'), 2000); 
                            }
                            Backbone.trigger('eventCierraDialogo');
                        }
                    });
                }

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
        

        })

        return locationView;
    }
);