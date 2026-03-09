define(['underscore', 'backbone', 'jquery', 'text!../../../Administracion/html/GestionUsuarios.html', 'vistas/vDialogoConfirm', 'vistas/Administracion/vCrearUsuario', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaGestionUsuarios, VistaDlgConfirm, VistaCrearUsuario, Not) {
        var gridGestionUsuarios = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            arrayUsuariosSesionAbierta: [],
            vistaCrearUsuario: null,
            template: _.template(PlantillaGestionUsuarios),
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
                            url: "../api/ObtenerUsuariosAdmin/",
                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                            , cache: true
                        }
                    },
                    pageSize: 20,
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                'Id': { type: "number" },
                                'NombreUsuario': { type: "string" },
                                'NombreRol': { type: "string" },
                                'Activo': { type: "string" },
                            },
                            getActivo: function ()
                            {
                                var activo = parseInt(this.get('Activo'));
                                return activo == 1 ? window.app.idioma.t('SI') : window.app.idioma.t('NO');
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    },
                    sort: { field: "NombreUsuario", dir: "asc" }
                });

                self.grid = this.$("#gridGestionUsuarios").kendoGrid({
                    dataSource: self.ds,
                    dataBound: onDataBound,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    toolbar: [
                        {
                            name: "create",
                            text: window.app.idioma.t('CREAR_USUARIO'),
                            template: "<a id='btnCrearUsuario' data-funcion='UC_GEN_USR_MNG_1_GestionUsuarios' class='k-button k-button-icontext k-grid-add' style='background-color:green;color:white;'><span class='k-icon k-add'></span>" + window.app.idioma.t('CREAR_USUARIO') + "</a>"
                        },
                        {
                            template: "<button id='btnLimpiarFiltros' class='k-button k-button-icontext k-i-delete' style='margin-left:5px;float:right;'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
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
                            command:
                            {
                                template: "<div align='center' title='Editar'><a id='btnEditar' class='k-button k-edit' data-funcion='UC_GEN_USR_MNG_1_GestionUsuarios' style='min-width:16px;'><span class='k-icon k-edit'></span></a></div>"
                            },
                            title: window.app.idioma.t("EDITAR"),
                            width: 40
                        },
                        //{
                        //    command:
                        //    {
                        //        template: "<div align='center' title='Bloquear'><a id='btnBloquear' class='k-button k-grid-cancel' data-funcion='ENV_PROD_RES_10_GestionParametrosPlanta' style='min-width:16px;'><span class='k-icon k-cancel'></span></a></div>"
                        //    },
                        //    title: window.app.idioma.t("BLOQUEAR"),
                        //    width: 70
                        //},                                                
                        {
                            field: "NombreUsuario",
                            title: window.app.idioma.t("USUARIO"),
                            width: 260
                        },
                        {
                            field: "NombreRol",
                            title: window.app.idioma.t("ROL"),
                            width: 290,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#:NombreRol#' style='width: 14px;height:14px;margin-right:5px;'/>#:NombreRol#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "getActivo()",
                            title: window.app.idioma.t("ACTIVO"),
                            width: 50,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#:getActivo()#' style='width: 14px;height:14px;margin-right:5px;'/>#: getActivo()#</label></div>";
                                    }
                                }
                                //ui: function (element) {
                                //    element.kendoNumericTextBox({
                                //        format: "0",
                                //        decimals: 0
                                //    });
                                //}
                            }
                        },
                        { // agomezn 080816: botón de cierre de sesión abierta de usuario
                            command:
                            {
                                template: "<div align='center' title='Cerrar sesión'><a id='btnCerrarSesionUsuario' class='k-button k-grid-unlock' data-funcion='ENV_PROD_RES_10_GestionParametrosPlanta' style='min-width:16px;'><span class='k-icon k-i-unlock'></span></a></div>"
                            },
                            title: window.app.idioma.t("CERRAR_SESION"),
                            width: 60
                        },
                        { // agomezn 100616: 082 Nuevos botones en Administración para borrar usuario y cerrar su sesión
                            command:
                            {
                                template: "<div align='center' title='Borrar'><a id='btnBorrar' class='k-button k-grid-delete' data-funcion='ENV_PROD_RES_10_GestionParametrosPlanta' style='min-width:16px;'><span class='k-icon k-delete'></span></a></div>"
                            },
                            title: window.app.idioma.t("ELIMINAR"),
                            width: 40
                        },
                    ],
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");

                function onDataBound() { // agomezn 090816: 101 de Excel de incidencias, muestra botones de cierre de sesión sólo para los usuarios que tengan una abierta
                    var datosGrid=this._data; // Datos del grid
                    $.ajax({
                        type: "GET",
                        url: "../api/usuariosSesionAbierta",
                        dataType: 'json',
                        cache: false,
                        async: true
                    }).done(function (data){
                        self.arrayUsuariosSesionAbierta=data; 
                        for (var i=0; i<datosGrid.length; i++) {
                            var dataItem=datosGrid[i];
                            var $fila=$("#gridGestionUsuarios").data("kendoGrid").tbody.find("tr[data-uid='"+dataItem.uid+"']");
                            var $celda = $fila.find('td:has(div a[id="btnCerrarSesionUsuario"])');
                            var $boton=$celda.find("a");
                            if(dataItem.NombreUsuario==window.app.sesion.attributes.usuario){ // Es el usuario actual, se deshabilita botón de cierre de sesión                       
                                $boton.prop("disabled", true).addClass("k-button k-state-disabled");
                            }else if(self.arrayUsuariosSesionAbierta.indexOf(dataItem.NombreUsuario)>-1){ // Usuario con sesión abierta, se habilita botón de cierre de sesión
                                $boton.prop("disabled", false).addClass("k-button k-state-enabled");
                            }else { // Usuario sin sesión abierta, se oculta el botón de cierre de sesión
                                $boton.toggle(false);
                            }
                        }
                    }).fail(function (xhr) {
                        if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_OBTENER_EL'), 4000);
                        }
                    });
                }
            },
            events: {
                'click #btnCrearUsuario': 'crearUsuario',
                'click #btnEditar': 'editarUsuario',
                'click #btnBloquear': 'confirmarBloqueo',
                'click #btnBorrar': 'confirmarBorrado',
                'click #btnCerrarSesionUsuario': 'cerrarSesionUsuario',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
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

                var gridElement = $("#gridGestionUsuarios"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - 2);
            },
            crearUsuario: function () {
                this.vistaCrearUsuario = new VistaCrearUsuario();
            },
            editarUsuario: function (e) {
                var self = this;
                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);
                this.vistaCrearUsuario = new VistaCrearUsuario(data);
            },
            confirmarBloqueo: function (e) {
                var self = this;
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('BLOQUEAR_USUARIO'),
                    msg: window.app.idioma.t('DESEA_REALMENTE_BLOQUEAR'), funcion: function () { self.bloquearUsuario(e); }, contexto: this
                });
            },
            bloquearUsuario: function (e)
            {
                var self = this;
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);
                $.ajax({
                    type: "POST",
                    async: false,
                    url: "../api/bloquearUsuario/"+ data.IdUser,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res[0] == true) {
                            $("#gridGestionUsuarios").data('kendoGrid').dataSource.read();
                            $("#gridGestionUsuarios").data('kendoGrid').refresh();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1], 4000);
                        }
                        else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_BLOQUEAR_EL'), 4000);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (response) {
                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_BLOQUEAR_EL'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            confirmarBorrado: function (e) {
                var self = this;
                this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('BORRADO_DE_USUARIO'), msg: window.app.idioma.t('DESEA_REALMENTE_BORRAR_USUARIO'), funcion: function () { self.borrarUsuario(e); }, contexto: this });
            },
            borrarUsuario: function (e)
            {
                var self = this;
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                var data = self.grid.dataItem(tr);
                $.ajax({
                    type: "POST",
                    async: false,
                    url: "../api/borrarUsuario/"+ data.IdUser,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res[0] == true) {
                            $("#gridGestionUsuarios").data('kendoGrid').dataSource.read();
                            $("#gridGestionUsuarios").data('kendoGrid').refresh();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1], 4000);
                        }
                        else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_BORRAR_EL_USUARIO'), 4000);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_BORRAR_EL_USUARIO'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            cerrarSesionUsuario: function (e)
            {
                e.preventDefault();
                var self = this;
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                var data = self.grid.dataItem(tr);
                $.ajax({
                    type: "POST",
                    async: false,
                    url: "../api/cerrarSesionUsuario/"+ data.NombreUsuario,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res[0] == true) {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1], 4000);
                            $("#gridGestionUsuarios").data("kendoGrid").dataSource.read();
                        }
                        else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CERRAR'), 4000);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CERRANDO_LA_SESIÓN'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
        });

        return gridGestionUsuarios;
    });