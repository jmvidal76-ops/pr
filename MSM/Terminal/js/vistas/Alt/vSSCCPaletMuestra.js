define(['underscore', 'backbone', 'jquery', 'text!../../../html/Alt/SSCCPaletMuestra.html', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaSSCCPaletMuestra, Not) {
        var vistaSSCCPaletMuestra = Backbone.View.extend({
            tagName: 'div',
            formData: null,
            template: _.template(PlantillaSSCCPaletMuestra),
            component: null,
            initialize: function () {
                var self = this;
                self.render();
            },
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").css("overflow", "hidden");
            },
            events: {
                'click  #btnGuardarSSCC': 'guardarSSCC'
            },
            guardarSSCC: function () {
                var self = this;

                let permiso = TienePermiso(419);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                }

                if ($('#txtSSCCPaletMuestra').val().length != 18) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NUM_CARACTERES_SSCC'), 4000);
                }

                let datos = {};
                datos.IdPaletProductoAcabadoMuestra = 0;
                datos.SSCC = $('#txtSSCCPaletMuestra').val();

                $.ajax({
                    type: "POST",
                    url: "../api/guardarSSCCMuestraTomada/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    success: function (res) {
                        if (res) {
                            $('#txtSSCCPaletMuestra').val("");
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_OPERACION_SE'), 3000);
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GUARDAR'), 3000);
                        }
                    },
                    error: function (response) {
                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GUARDAR'), 3000);
                        }
                    }
                });
            },
            eliminar: function () {
                if (this.component)
                    this.component.eliminar();
                $("#center-pane").css("overflow", "");
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

        return vistaSSCCPaletMuestra;
    });