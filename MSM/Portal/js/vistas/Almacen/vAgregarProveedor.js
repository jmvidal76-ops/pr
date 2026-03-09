define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/AgregarProveedor.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, Session) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            idActualizar: null,
            window: null,
            dialog: null,
            //#endregion ATTRIBUTES

            initialize: function (idComboProveedor) {
                var self = this;
                self.idActualizar = idComboProveedor;

                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.window = $(self.el).kendoWindow(
                    {
                        title: window.app.idioma.t('PROVEEDOR') ,
                        width: "20%",
                        height: "25%",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: ["Close"],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                self.dialog = self.window;
                self.dialog.center();

                $("#btnSubmitProveedor").unbind('click').bind('click', function () {
                    var idProveedor = $("#idProveedorNew").val();
                    var nombreProveedor = $("#nombreProveedorNew").val();

                    if (idProveedor === "" || nombreProveedor === "" || idProveedor == 0) {
                        $("#errorProveedor").text(window.app.idioma.t("DATOS_PROVEEDOR"))
                    } else {
                        $("#errorProveedor").text();
                        self.AddProveedor(self, idProveedor, nombreProveedor);
                    }
                });

            },

            //#region EVENTOS
            events: {
                
            },
            //#endregion EVENTOS

            AddProveedor: function (self, idProveedor, nombreProveedor) {
                var proveedorEAN = { IdProveedor: idProveedor, Nombre: nombreProveedor };
                kendo.ui.progress($('#divWndProveedor'), true);
                $.ajax({
                    type: "POST",
                    data: JSON.stringify(proveedorEAN),
                    async: true,
                    url: "../api/AddProveedorEAN",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        kendo.ui.progress($('#divWndProveedor'), false);
                        if (res) {
                            $("#errorProveedor").text("");
                            $("#" + self.idActualizar).data("kendoDropDownList").dataSource.read();
                            self.window.close();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PROVEEDOR_ACTUALIZADO'), 4000);
                        } else {
                            self.dialogoConfirm = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('PROVEEDOR'), msg: window.app.idioma.t('PROVEEDOR_EXISTENTE'),
                                funcion: function () { self.UpdateProveedor(self, idProveedor, nombreProveedor); }, contexto: this
                            });
                        }
                    },
                    error: function (err) {
                        kendo.ui.progress($('#divWndProveedor'), false);
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GUARDAR'), 4000);
                        }
                    }
                });
            },
            UpdateProveedor: function (self, idProveedor, nombreProveedor) {
                var proveedorEAN = { IdProveedor: idProveedor, Nombre: nombreProveedor };
                kendo.ui.progress($('#divWndProveedor'), true);
                $.ajax({
                    type: "POST",
                    data: JSON.stringify(proveedorEAN),
                    async: true,
                    url: "../api/UpdateProveedorEAN",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        self.dialogoConfirm.cancelar();
                        kendo.ui.progress($('#divWndProveedor'), false);
                        if (res) {
                            $("#errorProveedor").text("");
                            $("#" + self.idActualizar).data("kendoDropDownList").dataSource.read();
                            self.window.close();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PROVEEDOR_ACTUALIZADO'), 4000);
                        } else {
                            $("#errorProveedor").text(window.app.idioma.t("ERROR_PROVEEDOR"))
                        }
                    },
                    error: function (err) {
                        self.dialogoConfirm.cancelar();
                        kendo.ui.progress($('#divWndProveedor'), false);
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GUARDAR'), 4000);
                        }
                    }
                });
            },

            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

