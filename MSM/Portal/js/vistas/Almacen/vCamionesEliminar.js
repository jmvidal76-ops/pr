define(['underscore', 'backbone', 'jquery', 'kendoTimezones', 'text!../../../Almacen/html/CamionesEliminar.html'
    , 'compartido/notificaciones', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, kendoTimezones, plantilla, Not, enums, jsMantenimiento) {
        var vistaCamionesEliminar = Backbone.View.extend({
            tagName: 'div',
            id: 'divCamionesEliminar',
            window: null,
            template: _.template(plantilla),
            initialize: function ({ parent, item, callback }) {
                var self = this;

                self.parent = parent;
                // Item debe tener el IdTransporte y la MatriculaTractora
                self.item = item;
                self.callback = callback;

                this.render();                
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                let confirmText = $("#deleteMsgConfirmar").html();
                $("#deleteMsgConfirmar").html(confirmText.replace("ID", self.item.MatriculaTractora));

                $("#btnCamionesDLTCancelar").kendoButton({
                    click: async function (e) {
                        e.preventDefault();
                        self.window.close();
                    }
                });

                $("#btnCamionesDLTAceptar").kendoButton({
                    click: async function (e) {
                        e.preventDefault();

                        if ($("#deleteInput").val().toLowerCase() != self.item.MatriculaTractora.toLowerCase()) {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('TEXTO_NO_COINCIDE'), 4000);
                            return;
                        }

                        kendo.ui.progress($("#"+self.id), true);

                        try {
                            await self.EliminarTransporte(self.item.IdTransporte);

                            kendo.ui.progress($("#" + self.id), false);

                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t("ELIMINACION_OK"), 3000);
                            self.window.close();

                            if (self.callback) {
                                self.callback();
                            }
                        }
                        catch (err) {
                            console.log(err);
                            kendo.ui.progress($("#" + self.id), false);
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_ELIMNAR'), 4000);
                            }
                        }
                    }
                });

                self.window = $(self.el).kendoWindow(
                    {
                        title: window.app.idioma.t('ELIMINAR'),
                        width: "500px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        scrollable: false,
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                            self.eliminar();
                        },
                    }).data("kendoWindow");

                self.window.center();
            },
            EliminarTransporte: async function (id) {
                let self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        url: "../api/DeleteTransport/" + id,
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            resolve(data);
                        },
                        error: function (err) {
                            reject(err);
                        }
                    });
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCamionesEliminar;
    });