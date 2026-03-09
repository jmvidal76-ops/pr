define(['underscore', 'backbone', 'jquery', 'text!/Alt/html/ALTTemplatesLocationAddFormDialog.html', 'ALT/vALTUtils', 'compartido/notificaciones'],
    function (_, Backbone, $, HTML_Template, ALTUtils, Not) {
        var altUtil = new ALTUtils();
        
        var checkedIds = {};
        //location VIEW
        var dialogView = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLAddRelation',
            title: null,
            parentNode: null,
            formValidator: null,
            parentWindow: null,
            idDepartmentType: null,
            ds: null,
            template: _.template(HTML_Template),
            initialize: function (pNode, parentWindow) {
                var self = this;
                self.parentNode = pNode;
                self.parentWindow = parentWindow;
                self.idDepartmentType = parentWindow.idDepartmentType;
                var nodeRelations = null;
                switch (self.parentNode.type) {
                    case 'location':
                        nodeRelations = altUtil.getData("../api/TemplatesFormsByLoc/" + self.parentNode.data.ID).data;
                        break;
                    case 'form':
                        nodeRelations = altUtil.getData("../api/TemplatesTriggersByLocForm/" + self.parentNode.data.idLoc + "/" + self.parentNode.data.idTemForm).data;
                        break;
                }
                checkedIds = {};
                nodeRelations.forEach(function (rel) {
                    checkedIds[rel.ID] = true;
                });
                console.log(checkedIds);
                //set tittle of window                
                self.title = self.parentNode.data.name;                
                self.render();
            },
            render: function(){
                //--ini DIALOG WINDOW--//
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());
                //dependiendo del nodo que llama al dialogo se cargan forms o eventos
                var url2call = null;
                switch (self.parentNode.type) {
                    case 'location':
                        url2call = "../api/TemplatesForms/" + self.idDepartmentType + "/";
                        break;
                    case 'form':
                        url2call = "../api/TemplatesTriggers/" + self.idDepartmentType + "/";
                        break;
                }
                //bind TOOLBAR
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
                        },
                        //regular button
                        {
                            id: "btnAceptar",
                            type: "button",
                            text: window.app.idioma.t('GUARDAR'),
                            //icon: "tick",
                            showIcon: "toolbar"
                        },




                    ]
                });
                //bind Data to GRID
                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: url2call,
                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                            , cache: true
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    },
                    sort: { field: "name", dir: "asc" }
                });

                self.grid = this.$("#gridAddElement").kendoGrid({                    
                    dataSource: self.ds,
                    dataBound: self.onDataBound,
                    height: 400,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    sortable: true,
                    resizable: true,
                    // pageable: {
                    //     refresh: true,
                    //     pageSizes: true,
                    //     buttonCount: 5,
                    //     messages: window.app.cfgKendo.configuracionPaginado_Msg
                    // },
                    scrollable: true,
                    columns: [
                        { width: "40px",template: "<input type='checkbox' class='checkbox' />" },
                        {
                            field: "name",
                            title: window.app.idioma.t('NOMBRE'),
                            width: 180,
                        },
                        {
                            field: "descript",
                            title: window.app.idioma.t('DESCRIPCION'),

                        }

                    ],
                    dataBinding: self.resize
                }).data("kendoGrid");
                //bind click event to the checkbox
                self.grid.table.on("click", ".checkbox", self.selectRow);
                //window properties
                self.window = $(self.el).kendoWindow(
                {
                    title: self.title,
                    width: "600px",                  
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
            resize: function(){
                
            },
            //on click of the checkbox:
            selectRow: function () {
                var checked = this.checked,
                row = $(this).closest("tr"),
                grid = $("#gridAddElement").data("kendoGrid"),
                dataItem = grid.dataItem(row);
                checkedIds[dataItem.ID] = checked;
                if (checked) {
                    //-select the row
                    row.addClass("k-state-selected");
                } else {
                    //-remove selection
                    row.removeClass("k-state-selected");
                }
            },
            //on dataBound event restore previous selected rows:
            onDataBound: function (e) {
                
                var view = this.dataSource.view();
                for (var i = 0; i < view.length; i++) {                   
                    if (checkedIds[view[i].ID]) {
                        this.tbody.find("tr[data-uid='" + view[i].uid + "']")
                           .addClass("k-state-selected")
                           .find(".checkbox")
                           .attr("checked", "checked");
                    }                    
                }
               // self.grid.setOptions({height:400});
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
                var checked = [];
                var url2call = "";
                
                for(var i in checkedIds){
                    if (checkedIds[i]) {
                        switch (self.parentNode.type) {
                            case "location":
                                checked.push({ idLoc: self.parentNode.data.ID, idTemForm: i, path: self.parentNode.data.path });
                                break;
                            case "form":
                                checked.push(i);
                                break
                        }                        
                    }
                }
                switch (self.parentNode.type) {
                    case "location":
                        url2call = "../api/TemplatesLocForms/" + self.parentNode.data.ID;
                        break;
                    case "form":
                        url2call = "../api/TemplatesLocFormTri/"+ self.parentNode.data.idLoc + "/" + self.parentNode.data.idTemForm

                        break
                }
                console.log(checked);           
                console.log(url2call);
                
                $.ajax({
                        data: JSON.stringify(checked),
                        type: "POST",
                        async: false,
                        url: url2call,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                           if (res[0] == true) {
                               self.parentWindow.loadData();
                               Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1], 2000);
                                self.dialog.close();
                                self.eliminar();
                            }
                           else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res[1], 2000); 
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