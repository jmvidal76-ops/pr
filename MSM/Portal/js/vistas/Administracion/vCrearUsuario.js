define(['underscore', 'backbone', 'jquery', 'text!../../../Administracion/html/CrearUsuario.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, plantillaCrearUsuario, VistaDlgConfirm, Not) {
        var vistaCrearUsuario = Backbone.View.extend({
            tagName: 'div',
            id: 'divCrearUsuario',
            opciones: null,
            roles: null,
            window: null,
            crear: null,
            title: null,
            template: _.template(plantillaCrearUsuario),
            initialize: function (options) {
                var self = this;
                self.opciones = options;
                self.crear = self.opciones ? false : true;
                self.title = self.opciones ? window.app.idioma.t('EDITAR_USUARIO') : window.app.idioma.t('CREAR_USUARIO');

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerRoles/",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).success(function (data) {
                    self.roles = data;
                }).error(function (err, msg, ex) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_GET_ROLES'), 4000);
                    }
                })
                this.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.$("#btnAceptar").kendoButton();
                self.$("#btnCancelar").kendoButton();
                self.$("#btnAceptar").val(window.app.idioma.t('ACEPTAR'));
                self.$("#btnCancelar").val(window.app.idioma.t('CANCELAR'));
                self.$("#lblPassword").text(window.app.idioma.t('PASS'));
                self.$("#lblUsuario").text(window.app.idioma.t('USUARIO'));
                
                self.$("#lblActivo").text(window.app.idioma.t('ACTIVO'));
                self.$("#lblRol").text(window.app.idioma.t('ROL'));

                self.cmbLineas = $("#cmbRol").kendoDropDownList({
                    dataTextField: "Name",
                    dataValueField: "Id",
                    dataSource: {
                        data: self.roles,
                        schema: {
                            model: {
                                fields: {
                                    'Id': { type: "string" },
                                    'Name': { type: "string" },
                                    'Users': { type: "object" }
                                }
                            }
                        },
                        sort: { field: "Name", dir: "asc" }
                    },
                    optionLabel: window.app.idioma.t('SELECCIONE')
                }).data("kendoDropDownLis");

                if (!self.crear) {
                    self.$("#lblAvisoPass").text(window.app.idioma.t('CAMBIO_CONTRASEÑA'));
                    self.$("#lblAvisoPass").css("color", "#c5c5c5");
                    self.$("#divPass").addClass("borderdiv");
                    //self.cmbLineas.optionLabel = '';
                    self.cargaContenido()
                } else {
                    self.$("#lblAvisoPass").hide();                    
                    self.$("#divActivo").hide();
                    
                }

                self.window = $(self.el).kendoWindow(
                {
                    title: self.title,
                    width: "450px",
                    //height: "300px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: []
                }).data("kendoWindow");

                self.dialog = $('#divCrearUsuario').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
            }, aceptar: function (e) {
                e.preventDefault();

                var self = this;
                var user = {};
                user.name = self.$("#txtUsuario").val();
                user.password = $("#txtPassword").val();
                user.activo = $("#chkActivo")[0].checked;
                var id = $("#cmbRol").data("kendoDropDownList").dataItem().Id;
                user.role = (id) ? $("#cmbRol").data("kendoDropDownList").dataItem() : null;
                
                if (self.crear) {
                    if (!user.name || !user.password || !user.role) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_PROPORCIONAR_USUARIO'), 4000);
                    } else if (user.password.length < 6) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_CONTRASEÑA_DEBE'), 4000);
                    } else {
                        $.ajax({
                            data: JSON.stringify(user),
                            type: "POST",
                            async: false,
                            url: "../api/crearUsuario",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function (res) {
                                if (res[0] == true) {
                                    $("#gridGestionUsuarios").data('kendoGrid').dataSource.read();
                                    $("#gridGestionUsuarios").data('kendoGrid').refresh();
                                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1], 4000);
                                    self.dialog.close();
                                    self.eliminar();
                                }
                                else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EN_LA'), 4000);
                                Backbone.trigger('eventCierraDialogo');
                            },
                            error: function (response) {
                                if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EN_LA'), 4000);
                                }
                                Backbone.trigger('eventCierraDialogo');
                            }
                        });
                    }
                } else {
                    if (!user.name || !user.role) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_PROPORCIONAR_USUARIO_Y'), 4000);
                    }
                    else if (user.password.length < 6 && user.password > 0) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_CONTRASEÑA_DEBE'), 4000);
                    }
                    else {
                        user.iduser = this.opciones.IdUser;
                        $.ajax({
                            data: JSON.stringify(user),
                            type: "POST",
                            async: false,
                            url: "../api/editarUsuario",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function (res) {
                                if (res[0] == true) {
                                    $("#gridGestionUsuarios").data('kendoGrid').dataSource.read();
                                    $("#gridGestionUsuarios").data('kendoGrid').refresh();
                                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1], 4000);
                                    self.dialog.close();
                                    self.eliminar();
                                }
                                else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                                Backbone.trigger('eventCierraDialogo');
                            },
                            error: function (response) {
                                if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                                }
                                Backbone.trigger('eventCierraDialogo');
                            }
                        });
                    }
                }
            },
            cargaContenido: function () {
                var self = this;
                this.$("#txtUsuario").val(this.opciones.NombreUsuario);
                this.$("#cmbRol").data("kendoDropDownList").select(function (dataItem) {
                    return dataItem.Name == self.opciones.NombreRol
                });
                this.$("#chkActivo")[0].checked = parseInt(this.opciones.Activo);
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
        });

        return vistaCrearUsuario;
    });