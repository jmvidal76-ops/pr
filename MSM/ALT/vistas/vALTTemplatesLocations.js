define(['underscore', 'backbone', 'jquery', 'text!/Alt/html/ALTTemplatesLocations.html', 'ALT/vALTTemplatesLocationDialog', 'ALT/vALTTemplatesLocationAddFormDialog', 'ALT/vALTUtils', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, ALTTemplate, dialogEdit, dialogAdd, ALTUtils, VistaDlgConfirm, Not) {
        var altUtil = new ALTUtils();
        var comGestionLocations = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLgestionLocations',
            dialogEdit: null,
            ALTLocations: [],
            treeNodeModel: [],
            treeViewLib: null,
            selectNode: null,
            template: _.template(ALTTemplate),
            idDepartmentType: null,
            initialize: function (idDepar) {
                this.idDepartmentType = idDepar;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeComponent);
            },
            render: function () {
                $(this.el).html(this.template())
                $("#comALT").append($(this.el))
                var self = this;
                //TOOLBAR LIBRERIAS TEMPLATES LOCATIONS
                $("#toolbar-templatesLoc").kendoToolBar({
                    items: [
                        { id: "btnAddLibLocationRoot", type: "button", text: window.app.idioma.t('ALT_ADD_PDV'), imageUrl: "/ALT/img/ALT_location.png", showIcon: "toolbar" },
                        {
                            id: "btnGroup1_location",
                            type: "buttonGroup",
                            buttons: [
                                { id: "btnEditarLoc", type: "button", text: window.app.idioma.t('EDITAR'), imageUrl: "/ALT/img/ALT_edit.png", showIcon: "toolbar" },
                                { id: "btnDelSel", type: "button", text: window.app.idioma.t('ELIMINAR'), imageUrl: "/ALT/img/ALT_cancel.png", showIcon: "toolbar" }
                            ]
                        },
                        {
                            id: "btnGroup1_trigger",
                            type: "buttonGroup",
                            buttons: [
                                { id: "btnDelSel", type: "button", text: window.app.idioma.t('ELIMINAR'), imageUrl: "/ALT/img/ALT_cancel.png", showIcon: "toolbar" },
                            ]
                        },
                        {
                            id: "btnGroup1_form",
                            type: "buttonGroup",
                            buttons: [
                                { id: "btnDelSel", type: "button", text: window.app.idioma.t('ELIMINAR'), imageUrl: "/ALT/img/ALT_cancel.png", showIcon: "toolbar" },
                            ]
                        },
                        { id: "separatorEdit", type: "separator" },
                        {
                            id: "btnGroup2_location",
                            type: "buttonGroup",
                            buttons: [
                                { id: "btnAddLibLocation", type: "button", text: window.app.idioma.t('ALT_ADD_PDV'), imageUrl: "/ALT/img/ALT_location.png", showIcon: "toolbar" },
                                { id: "btnAddLibForm", type: "button", text: window.app.idioma.t('ALT_ADD_FORM'), imageUrl: "/ALT/img/ALT_form.png", showIcon: "toolbar" }
                            ]
                        },
                        {
                            id: "btnGroup2_form",
                            type: "buttonGroup",
                            buttons: [                                
                                { id: "btnAddLibEven", type: "button", text: window.app.idioma.t('ALT_ADD_EVENT'), imageUrl: "/ALT/img/ALT_trigger.png", showIcon: "toolbar" },
                            ]
                        }
                    ]
                });
                
                //TREEVIEW
                this.treeNodeModel = altUtil.getLocationsForTree(self.idDepartmentType);
                self.treeViewLib = $("#ALTLibLoctreeView").kendoTreeView({
                    dataSource: this.treeNodeModel,
                    select: self.selectNodeLib
                }).data("kendoTreeView");
                this.treeViewLib.expand(".k-item");
                $('.k-separator').hide();
                $('.k-button-group').hide();
                $('#btnAddLibLocationRoot').show();
                //self.loadData();
                self.resizeComponent();
                return self;
            },
            events: {
                'click #btnAddLibLocation': 'crearTemplate', 
                'click #btnAddLibLocationRoot': 'crearTemplate',
                'click #btnAddLibEven': 'addRel',
                'click #btnAddLibForm': 'addRel',
                'click #btnDelSel': 'confirmarBorrado',
                'click #btnEditarLoc': 'editarTemplate'
            },
            loadData: function(){
                var selectNodeText = "";
                if (this.treeViewLib.select().length)
                    selectNodeText =  this.treeViewLib.text(this.treeViewLib.select());
                this.treeNodeModel = altUtil.getLocationsForTree(this.idDepartmentType);
                this.treeViewLib.setDataSource(new kendo.data.HierarchicalDataSource({
                    data: this.treeNodeModel                     
                }));
               
                var selectNode = this.treeViewLib.dataItem(this.treeViewLib.findByText(selectNodeText));          
                this.treeViewLib.expandTo(selectNode);
                this.treeViewLib.expand(this.treeViewLib.findByText(selectNodeText));
                
                //hide buttons
                $('.k-separator').hide();
                $('.k-button-group').hide();
                $('#btnAddLibLocationRoot').show();
            },
            addRel: function (e) {
                var self = this;
                var permiso = self.idDepartmentType === "0" ? TienePermiso(182) : TienePermiso(188);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var seleccion = this.treeViewLib.select();
                var dataItem = this.treeViewLib.dataItem(seleccion);
                // Obtenemos los nodos padre del que tenemos
                var itemsList = $(seleccion).parentsUntil('.k-treeview', '.k-item');

                // Nos quedamos con los nombres
                var textos = [];
                $.map(itemsList, function (item) {
                    textos.unshift($(item).find('>div span.k-in').text());
                });

                // Añadimos el nombre del nodo actual
                textos.push(dataItem.text);
                dataItem.data.path = textos.join(' \\ ');
                var dialog = new dialogAdd(dataItem, this);
            },
            selectNodeLib: function (e) {              
                var dataItem = this.dataItem(e.node);
                $('.k-button-group').hide();
                $('k-separator').show();
                $('#btnGroup1_' + dataItem.type).show();
                $('#btnGroup2_' + dataItem.type).show();
                $('#btnAddLibLocationRoot').hide();  
            },
            eliminar: function () {
                // same as this.$el.remove();
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.unbind("resize", self.resizeComponent);
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            resizeComponent: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var toolBarTree = $("#toolbar-templatesLoc").innerHeight();
                var treeElement = $("#ALTLibLoctreeView");
                
                treeElement.height(contenedorHeight - toolBarTree - cabeceraHeight - 2);
            },
            crearTemplate: function () {
                var self = this;
                var permiso = self.idDepartmentType === "0" ? TienePermiso(182) : TienePermiso(188);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                //nuevo registro
                if (this.treeViewLib.dataItem(this.treeViewLib.select())) {
                    this.dialogEdit = new dialogEdit({ locationTemplate: null }, this.treeViewLib.dataItem(this.treeViewLib.select()).id, this);
                } else {
                    this.dialogEdit = new dialogEdit({ locationTemplate: null }, null, this);
                }
            },
            editarTemplate: function (e) {
                var self = this;
                var permiso = self.idDepartmentType === "0" ? TienePermiso(182) : TienePermiso(188);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var dataItem = this.treeViewLib.dataItem(this.treeViewLib.select());
                //pop-pup edit línea
                this.dialogEdit = new dialogEdit({ locationTemplate: dataItem.data }, null, this);               
            },
            confirmarBorrado: function (e) {
                var self = this;
                var permiso = self.idDepartmentType === "0" ? TienePermiso(182) : TienePermiso(188);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var dataItem = this.treeViewLib.dataItem(this.treeViewLib.select());
              
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ALT_borrar_template_dialog_title'), msg: window.app.idioma.t('ALT_borrar_template_dialog'),
                    funcion: function () {                       
                        switch (dataItem.type) {
                            case 'location':
                                self.eliminarTemplate(e);
                                break;
                            case 'form':
                                self.eliminarRelLocForm(e, dataItem);
                                break;
                            case 'trigger':
                                self.eliminarRelFormTrig(e, dataItem);
                                break;
                            default:
                                break;
                        }
                    }, contexto: this
                });
            },
            eliminarRelLocForm: function (e, nodeData) {
                var self = this;
                // get the data bound to the current select node
                $.ajax({
                    data: JSON.stringify(nodeData.data),
                    type: "DELETE",
                    async: false,
                    url: "../api/TemplatesLocForms",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res[0] == true) {
                            //REFRESH ARBOL
                            self.loadData();
                        }
                        else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res[1], 2000);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (response) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ALT_error_delete_template'), 2000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            eliminarRelFormTrig: function(e, nodeData){
                var self = this;
                // get the data bound to the current select node
                $.ajax({
                    data: JSON.stringify(nodeData.data),
                    type: "DELETE",
                    async: false,
                    url: "../api/TemplatesLocFormTri",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res[0] == true) {
                            //REFRESH ARBOL
                            self.loadData();
                        }
                        else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res[1], 2000);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (response) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ALT_error_delete_template'), 2000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            eliminarTemplate: function (e)
            {
                var self = this;
                // get the data bound to the current select node
                var nodeData = this.treeViewLib.dataItem(this.treeViewLib.select());
          
                $.ajax({
                    async: false,
                    url: "../api/TemplatesLocations/" + nodeData.id,
                    type: "DELETE",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res[0] == true) {
                            //REFRESH ARBOL
                            self.loadData();
                        }
                        else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res[1], 2000);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (response) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ALT_error_delete_template'), 2000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            getData: function (URL, dataBack) {
                $.ajax({
                    type: "GET",
                    async: false,
                    url: URL,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res.length > 0) {
                            dataBack.value = res;
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_DATOS'), 2000); 
                            Backbone.trigger('eventCierraDialogo');
                        }
                    },
                    error: function (response) {
                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_DATOS'), 2000); 
                        }
                    }
                });
            }
        });

        return comGestionLocations;
    });