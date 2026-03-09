define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/MSMLibraryEnvasado.html', 'definiciones'],
    function (_, Backbone, $, Plantilla, definiciones) {
        var VistaLibraryEnvasado = Backbone.View.extend({
            tagName: 'div',
            template: _.template(Plantilla),
            component: null,
            enlacesExternos: definiciones.EnlacesExternos(),
            initialize: function () {
                var self = this;
                self.render();
                self.obtenerUrl();
            },
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").css("overflow", "hidden");
            },
            events: {
            },
            obtenerUrl: function () {
                var self = this;

                const arrayEnlaces = [
                    self.enlacesExternos.INSTRUCCIONES_TECNICAS_ENVASADO,
                    self.enlacesExternos.MANUAL_APPCC,
                    self.enlacesExternos.PLAN_VIGILANCIA,
                    self.enlacesExternos.GESTION_PRODUCTO_NO_CONFORME,
                    self.enlacesExternos.PROTOCOLOS_ENVASADO,
                    self.enlacesExternos.PLANES_HIGIENE,
                    self.enlacesExternos.INSTRUCCIONES_QSA,
                    self.enlacesExternos.POLITICAS
                ];

                const arrayEnlacesNombres = [
                    "INSTRUCCIONES_TECNICAS_ENVASADO",
                    "MANUAL_APPCC",
                    "PLAN_VIGILANCIA",
                    "GESTION_PRODUCTO_NO_CONFORME",
                    "PROTOCOLOS_ENVASADO",
                    "PLANES_HIGIENE",
                    "INSTRUCCIONES_QSA",
                    "POLITICAS"
                ];

                const promises = [];

                for (let i of arrayEnlaces) {
                    promises.push(ObtenerEnlaceExternoMSMLibrary(i));
                }

                Promise.all(promises).then(values => {
                    let i = -1;

                    for (let valor of values) {
                        i++;
                        if (!valor) continue;

                        $('#divEnlacesEnvasado').append(`<div style="padding-top: 10px">
                            <button class="k-button k-button-icontext ajustesBoton" style="margin-left: 5px;" onclick="javascript: window.open('${valor}')">
                                ${window.app.idioma.t(arrayEnlacesNombres[i])} </button>
                        </div>`);
                    }
                }).catch(err => {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ENLACE'), 3000);
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
            },
        });

        return VistaLibraryEnvasado;
    });