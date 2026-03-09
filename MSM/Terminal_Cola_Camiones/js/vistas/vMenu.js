define(['underscore', 'backbone', 'jquery' ,'compartido/notificaciones'], function (_, Backbone,$,Not) {
    var OpcionMenu = Backbone.View.extend({
        tagName: 'li',
        initialize: function () {
            this.render();
        },
        render: function () {
            var elem = this.$el;
            if (this.model.get("subMenus").length > 0)
            {
                elem.append($("<a id='btnMenuPrincipal" + this.model.get("id") + "' href='#" + ((this.model.get("permiso")) ? this.model.get("vista") : "sinPermiso") + "' class='" + ((this.model.get("permiso")) ? "k-button botonMenu firstLevel" : "k-button botonMenuDisabled") + "'>" + window.app.idioma.t(this.model.get("texto")) + "</a>"));
            }
            else
            {
                elem.append($("<a id='btnMenuPrincipal" + this.model.get("id") + "' href='#" + ((this.model.get("permiso")) ? this.model.get("vista") : "sinPermiso") + "' class='" + ((this.model.get("permiso")) ? "k-button botonMenu" : "k-button botonMenuDisabled") + "'>" + window.app.idioma.t(this.model.get("texto")) + "</a>"));
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
        }
    });
    return OpcionMenu;
});