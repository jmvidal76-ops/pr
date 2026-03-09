define(['underscore', 'backbone', 'jquery', 'text!/Alt/html/ALTTemplatesTrigger.html', 'ALT/vALTUtils', 'ALT/vALTTemplatesTriggerDialog', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, ALTConfigurationTemplate, ALTUtils, dialogEdit, VistaDlgConfirm, Not) {
        var ALTUtil = new ALTUtils();
        var gridGestionTriggers = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLgestionTriggers',
            ds: null,
            grid: null,
            dialogEdit: null,
            idDepartmentType: null,
            template: _.template(ALTConfigurationTemplate),
            initialize: function (idDepart) {
                var self = this;
                self.idDepartmentType = idDepart;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);
            },
            
            render: function () {
                $(this.el).html(this.template())
   
                
                var self = this;
                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/TemplatesTriggers/" + self.idDepartmentType +"/",
                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                            , cache: true
                        }
                    },
                    pageSize: 20,
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    },
                    schema: {
                        model: {
                            fields: {                                
                                'attrValidFrom': { type: "date" },
                                'attrValidUntil': { type: "date" },
                                'attrPlannedOnce': { type: "date" },
                            }
                        }
                    },
                    sort: { field: "name", dir: "asc" }
                });               

                self.grid = this.$("#gridGestionTriggers").kendoGrid({
                    dataSource: self.ds,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    toolbar: [
                        {
                            name: "create",
                            text: window.app.idioma.t('ALT_CREATE_TEMPLATE'),
                            template: "<a id='btnCrearTemplate' class='k-button k-button-icontext k-grid-add' style=' background-color:green;color:white;'><span class='k-icon k-add'></span>" + window.app.idioma.t('NUEVO') + "</a>"
                        },
                        {
                            template: "<button id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        }
                    ],
                    sortable: true,
                    resizable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        
                        {
                            field: "Estado",
                            title: window.app.idioma.t("ESTADO"),
                            template: "<a id='btnActivar' class='k-button k-grid-activate' style='min-width:115px; text-align:left'><img id='imgEstado' src='img/KOP_#= semaforo #.png'></img> #: (status ? window.app.idioma.t('ACTIVO') : window.app.idioma.t('DESACTIVADO') )#</a>",
                            width: 140,
                            attributes: { style: "text-align:center;" },
                            filterable: false
                        },
                        {
                            title: window.app.idioma.t("EDITAR"),
                            command:
                            {
                                template: "<a id='btnEditar' class='k-button k-grid-edit' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                            },
                            width: "70px",
                            filterable: false
                        },
                        {
                            field: "typeID",
                            title: window.app.idioma.t('TIPO'),
                            width: 120,
                            template: "#=window.app.idioma.t(typeID)#",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=typeID#' style='width: 14px;height:14px;margin-right:5px;'/>#=window.app.idioma.t(typeID)#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "name",
                            title: window.app.idioma.t('NOMBRE'), 
                            width: 300,
                            filterable: {
                                multi: false,
                            }
                        },
                        
                        {
                            field: "descript",
                            title: window.app.idioma.t('DESCRIPCION'),
                            filterable: false
                          
                        },
                        {
                            title: window.app.idioma.t("ELIMINAR"),
                            command:
                            {
                                template: "<a id='btnBorrar' class='k-button k-grid-delete' style='min-width:16px;'><span class='k-icon k-delete'></span></a>"
                            },
                            width: "70px",
                            filterable: false
                        }
                        
                    ],
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");
                
                self.resizeGrid();
                return self; // enable chained calls
            },
            events: {
                'click #btnCrearTemplate': 'crearTemplate',
                'click #btnEditar': 'editarTemplate',
                'click #btnBorrar': 'confirmarBorrado',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnActivar': 'cambiarEstadoTrigger'
            },
            cambiarEstadoTrigger: function(e){
                var self = this;
                var permiso = self.idDepartmentType === "0" ? TienePermiso(182) : TienePermiso(188);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);
                if (data.status)
                    data.status = 0;
                else
                    data.status = 1;
                //
                ALTUtil.postData('../api/TemplatesTriggers', data, true);
                $("#gridGestionTriggers").data('kendoGrid').dataSource.read();
                $("#gridGestionTriggers").data('kendoGrid').refresh();
            },
            LimpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            eliminar: function () {
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.unbind("resize", self.resizeGrid);
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            resizeGrid: function () {
                
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();

                var gridElement = $("#gridGestionTriggers"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - 2);
            },
            crearTemplate: function () {                
                var self = this;
                var permiso = self.idDepartmentType === "0" ? TienePermiso(182) : TienePermiso(188);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                this.dialogEdit = new dialogEdit({ triggerTemplate: null, idDepartmentType: this.idDepartmentType });
            },
            editarTemplate: function (e) {
                var self = this;
                var permiso = self.idDepartmentType === "0" ? TienePermiso(182) : TienePermiso(188);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr); 
                
                //pop-pup edit línea
                this.dialogEdit = new dialogEdit({ triggerTemplate: data, idDepartmentType: this.idDepartmentType });
            },
            confirmarBorrado: function (e) {
                var self = this;
                var permiso = self.idDepartmentType === "0" ? TienePermiso(182) : TienePermiso(188);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }
                
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ALT_borrar_template_dialog_title'),
                    msg: window.app.idioma.t('ALT_borrar_template_dialog'),
                    funcion: function () { self.eliminarTemplate(e); },
                    contexto: this
                });
            },
            eliminarTemplate: function (e) {
                var self = this;
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);
                $.ajax({
                    type: "DELETE",
                    async: false,
                    url: "../api/TemplatesTriggers/" + data.ID,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res[0] == true) {
                            $("#gridGestionTriggers").data('kendoGrid').dataSource.read();
                            $("#gridGestionTriggers").data('kendoGrid').refresh();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1], 2000);
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
            }
        });

        return gridGestionTriggers;
    });