define(['underscore', 'backbone', 'jquery', 'text!/Alt/html/ALTRuntimeFormsChangesDialog.html', 'ALT/vALTUtils', 'compartido/notificaciones'],
    function (_, Backbone, $, HTML_Template, ALTUtils, Not) {
        var altUtil = new ALTUtils();
        
        var checkedIds = {};
        //location VIEW
        var dialogView = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLFormChanges',
            title: null,         
            grid: null,           
            template: _.template(HTML_Template),
            ds: null,
            initialize: function (idForm) {
                var self = this;
           
                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/runTimeFormsChanges/" + idForm,
                            dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                            cache: true
                        }
                    },
                    //pageSize: 10,
                    schema: {
                        model: {
                            fields: {
                                'usuario': { type: "string" },
                                'type': { type: "string" },
                                'traza': { type: "string" },                                
                                'createdOn': { type: "date" }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    },
                    sort: { field: "createdOn", dir: "desc" }
                });

                self.title = window.app.idioma.t('ALT_FORMS_CHANGES');                 //ALT_FORMS_CHANGES
                self.render();
            },
            render: function(){
                //--ini DIALOG WINDOW--//
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());
                
                //Añadimos toolbar Configuration
                $("#toolbar").kendoToolBar({
                    items: [
                        //regular button
                        {
                            id: "btnCancelar",
                            type: "button",
                            text: window.app.idioma.t('CANCELAR'),
                            //icon: "cross",
                            showIcon: "toolbar"
                        }
                    ]
                });
                //bind Data to GRID               

                self.grid = this.$("#gridDiv").kendoGrid({                    
                    dataSource: self.ds,                    
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    
                    sortable: true,
                    resizable: true,
                    scrollable: false,
                    /*pageable: {
                        refresh: true,
                        pageSizes: true,
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },*/
                    columns: [ //t.traza, t.type, t.usuario, t.createdOn
                       
                        {
                            field: "createdOn",
                            title: window.app.idioma.t('FECHA'),
                            width: 150,
                            template: '#: kendo.toString(new Date(createdOn),kendo.culture().calendars.standard.patterns.MES_FechaHora)#'
                            
                        },
                        {
                            field: "usuario",
                            title: window.app.idioma.t('USUARIO'),
                            width: 150,
                            
                        },
                        {
                            field: "type",
                            title: window.app.idioma.t('FUNCION'),
                            template: "#=  window.app.idioma.t(type) #",
                            //template: "<img title= '#:''+errors#'  id='imgEstado' src='img/KOP_#= semaforoStatus #.png'> #=  window.app.idioma.t(statusID) #</img>",
                            width: 200,
                        },
                        {
                            field: "traza",
                            title: window.app.idioma.t('DESCRIPCION'),
                            encoded: false

                        }

                    ]
                }).data("kendoGrid");
                
                //window properties
                self.window = $(self.el).kendoWindow(
                {
                    title: self.title,
                    width: "90%",
                    height: "90%",
                    modal: true,
                    closable: true,
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
                'click #btnCancelar': 'cancelar',
                'click #btnFiltrar': 'refreshGrid'
                
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
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

        return dialogView;
    }
);