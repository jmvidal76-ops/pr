define(['underscore', 'backbone', 'jquery', 'text!../../../Alt/html/MSMLibraryCalidad.html', 'definiciones'],
    function (_, Backbone, $, Plantilla, definiciones) {
        var VistaLibraryCalidad = Backbone.View.extend({
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
                    self.enlacesExternos.INSTRUCCIONES_TECNICAS_LABORATORIO,
                    self.enlacesExternos.METODOS_ANALITICOS,
                    self.enlacesExternos.MANUAL_APPCC_CALIDAD,
                    self.enlacesExternos.PLAN_VIGILANCIA_CALIDAD,
                    self.enlacesExternos.GESTION_PRODUCTO_NO_CONFORME_CALIDAD,
                    self.enlacesExternos.PROTOCOLOS_ENVASADO_CALIDAD,
                    self.enlacesExternos.PLANES_HIGIENE_CALIDAD,
                    self.enlacesExternos.INSTRUCCIONES_QSA_CALIDAD,
                    self.enlacesExternos.POLITICAS_CALIDAD
                ];

                const arrayEnlacesNombres = [
                    "INSTRUCCIONES_TECNICAS_LABORATORIO",
                    "METODOS_ANALITICOS",
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

                        $('#divEnlacesCalidad').append(`<div style="padding-top: 10px">
                            <button class="k-button k-button-icontext ajustesBoton" style="margin-left: 5px;" onclick="javascript: window.open('${valor}')">
                                ${ window.app.idioma.t(arrayEnlacesNombres[i]) } </button>
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

        return VistaLibraryCalidad;
    });