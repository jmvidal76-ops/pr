define(['underscore', 'backbone', 'jquery', 'text!../../../Administracion/html/GestionRoles.html', 'vistas/vDialogoConfirm', 'vistas/Administracion/vCrearRol', 'vistas/Administracion/vEditarRol', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaGestionRoles, VistaDlgConfirm, VistaCrearRol, VistaEditarRol, Not) {
        var gridGestionRoles = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            vistaCrearRol: null,
            template: _.template(PlantillaGestionRoles),
            initialize: function () {
                var self = this;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.render();
            },
            render: function () {
                $(this.el).html(this.template())
                $("#center-pane").append($(this.el))
                var self = this;
                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerRoles/",
                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                            , cache: true
                        }
                    },
                    pageSize: 20,
                    schema: {
                        model: {
                            fields: {
                                'Id': { type: "string" },
                                'Name': { type: "string" }
                            }
                        }
                    },	
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    },
                    sort: { field: "Name", dir: "asc" }
                });

                self.grid = this.$("#gridGestionRoles").kendoGrid({
                    dataSource: self.ds,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    toolbar: [
                        {
                            name: "create",
                            text: window.app.idioma.t('CREAR_ROL'),
                            template: "<a id='btnCrearRol' class='k-button k-button-icontext k-grid-add' data-funcion='UC_GEN_USR_MNG_2_GestionRoles' style=' background-color:green;color:white;'><span class='k-icon k-add'></span>" + window.app.idioma.t('CREAR_ROL') + "</a>"
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
                            title: window.app.idioma.t("EDITAR"),
                            command:
                            {
                                template: "<a id='btnEditar' class='k-button k-grid-edit' data-funcion='UC_GEN_USR_MNG_2_GestionRoles' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                            },
                            width: "70px"
                        },
                        //{
                        //    field: "Id",
                        //    hidden: true,
                        //},
                        {
                            field: "Name",
                            title: window.app.idioma.t("NombreRol"),
                            //width: 300,
                        },
                        {
                            title: window.app.idioma.t("ELIMINAR"),
                            command:
                            {
                                template: "<a id='btnBorrar' class='k-button k-grid-delete' data-funcion='UC_GEN_USR_MNG_2_GestionRoles' style='min-width:16px;'><span class='k-icon k-delete'></span></a>"
                            },
                            width: "70px"
                        }

                    ],
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");
            },
            events: {
                'click #btnCrearRol': 'crearRol',
                'click #btnEditar': 'editarRol',
                'click #btnBorrar': 'confirmarBorrado',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid'
            },
            LimpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
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
            },
            resizeGrid: function () {
                
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();

                var gridElement = $("#gridGestionRoles"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - 2);
            },
            crearRol: function () {
                this.vistaCrearRol = new VistaCrearRol();
            },
            editarRol: function (e) {
                var self = this;
                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);
                this.vistaEditarRol = new VistaEditarRol(data);
            },
            confirmarBorrado: function (e) {
                var self = this;
                this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('ELIMINAR_ROL'), msg: window.app.idioma.t('DESEA_REALMENTE_ELIMINAR'), funcion: function () { self.eliminarRol(e); }, contexto: this });
            },
            eliminarRol: function (e)
            {
                var self = this;
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);
                $.ajax({
                    type: "POST",
                    async: false,
                    url: "../api/eliminarRol/"+ data.Id,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res[0] == true) {
                            $("#gridGestionRoles").data('kendoGrid').dataSource.read();
                            $("#gridGestionRoles").data('kendoGrid').refresh();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1], 4000);
                        }
                        else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res[1], 4000);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (response) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_BORRAR_EL'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            }
        });

        return gridGestionRoles;
    });