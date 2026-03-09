define(['underscore', 'backbone', 'jquery', 'compartido/notificaciones', '../../../../Portal/js/constantes'], function (_, Backbone,$,Not,enums) {
    var OpcionMenu = Backbone.View.extend({
        tagName: 'li',
        enlacesExternos: enums.EnlacesExternos(),
        url: null,
        initialize: function () {
            this.render();
        },
        render: function () {
            var self = this;
            var elem = this.$el;

            if (this.model.get("subMenus").length > 0) {
                elem.append($("<a id='btnMenuPrincipal" + this.model.get("id") + "' href='#" +
                    ((this.model.get("permiso")) ? this.model.get("vista") : "sinPermiso") + "' class='" +
                    ((this.model.get("permiso")) ? "k-button botonMenu firstLevel" : "k-button botonMenuDisabled") + "'>" +
                    window.app.idioma.t(this.model.get("texto")) + "</a>"));
            } else {
                var target = '';
                var url = '';

                let nombreVista = this.model.get("texto");
                let idEnlaceExterno = self.enlacesExternos[nombreVista];

                // Comprobamos si el elemento de menú es un enlace externo
                target = idEnlaceExterno ? "target='_blank'" : "";

                if (this.model.get("permiso")) {
                    if (idEnlaceExterno) {
                        self.obtenerEnlaceExterno(idEnlaceExterno);
                        url = self.url;
                    } else {
                        url = "#" + this.model.get("vista");
                    }
                } else {
                    url = "#sinPermiso";
                }

                elem.append($("<a id='btnMenuPrincipal" + this.model.get("id") + "' href='" + url + "' class='" +
                    ((this.model.get("permiso")) ? "k-button botonMenu" : "k-button botonMenuDisabled") + "' " + target + ">" +
                    window.app.idioma.t(this.model.get("texto")) + "</a>"));
            }
            
            return this;
        },
        events: {
            'click .firstLevel': 'selOpcMenu',
            'click .botonMenuDisabled': 'selOpcMenu' // agomezn 020616: 056 que muestre un aviso y no eche de Terminal al usuario que no tenga permisos para ejecutar una acción
        },
        selOpcMenu: function (e) {
            if (this.model.get("subMenus").length > 0 && this.model.get("permiso")) {
                Backbone.trigger('eventSelMenu', this.model.get("subMenus"));
            } else {
                Not.crearNotificacion('warning', 'Aviso Menu', window.app.idioma.t('NO_TIENE_PERMISOS'), 4000);
            }
        },
        actualiza: function () {
            this.render();
        },
        obtenerEnlaceExterno: function (idEnlace) {
            var self = this;

            $.ajax({
                type: "GET",
                url: "../api/obtenerEnlaceExterno/" + idEnlace,
                dataType: "json",
                async: false
            }).done(function (url) {
                self.url = url;
            }).fail(function (e) {
                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                } else {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ENLACE'), 4000);
                }
            });
        }
    });
    return OpcionMenu;
});