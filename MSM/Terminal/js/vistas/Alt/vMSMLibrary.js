define(['underscore', 'backbone', 'jquery', 'text!../../../html/Alt/MSMLibrary.html', 'definiciones'],
    function (_, Backbone, $, Plantilla, definiciones) {
        var VistaAltLibrary = Backbone.View.extend({
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

                var promises = [];

                promises.push(ObtenerEnlaceExternoMSMLibrary(self.enlacesExternos.INSTRUCCIONES_TECNICAS_ENVASADO));
                promises.push(ObtenerEnlaceExternoMSMLibrary(self.enlacesExternos.MANUAL_APPCC));
                promises.push(ObtenerEnlaceExternoMSMLibrary(self.enlacesExternos.PLAN_VIGILANCIA));
                promises.push(ObtenerEnlaceExternoMSMLibrary(self.enlacesExternos.GESTION_PRODUCTO_NO_CONFORME));
                promises.push(ObtenerEnlaceExternoMSMLibrary(self.enlacesExternos.PROTOCOLOS_ENVASADO));
                promises.push(ObtenerEnlaceExternoMSMLibrary(self.enlacesExternos.PLANES_HIGIENE));
                promises.push(ObtenerEnlaceExternoMSMLibrary(self.enlacesExternos.INSTRUCCIONES_QSA));
                promises.push(ObtenerEnlaceExternoMSMLibrary(self.enlacesExternos.POLITICAS));

                Promise.all(promises).then(values => {
                    $('#btnInstrucEnvasado').click(function () {
                        window.open(values[0]);
                    });

                    $('#btnManual').click(function () {
                        window.open(values[1]);
                    });

                    $('#btnPlanVigilancia').click(function () {
                        window.open(values[2]);
                    });

                    $('#btnProductoNoConforme').click(function () {
                        window.open(values[3]);
                    });

                    $('#btnProtocolosEnvasado').click(function () {
                        window.open(values[4]);
                    });

                    $('#btnPlanesHigiene').click(function () {
                        window.open(values[5]);
                    });

                    $('#btnInstrucQSA').click(function () {
                        window.open(values[6]);
                    });

                    $('#btnPoliticas').click(function () {
                        window.open(values[7]);
                    });
                }).catch(err => {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ENLACE'), 3000);
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

        return VistaAltLibrary;
    });