define(['underscore', 'backbone', 'jquery', 'compartido/notificaciones'], function (_, Backbone, $, Not) {
    var OpcionMenu = Backbone.View.extend({
        tagName: 'li',
        initialize: function () {
            this.render();
        },
        render: function () {
            var elem = this.$el;
            elem.append($("<a href='#" + ((this.model.get("permiso")) ? this.model.get("vista") : "sinPermiso") +
                "' id='btnMenuPrincipal" + this.model.get("id") + "' class='" + ((this.model.get("permiso")) ? "k-button botonMenu" : "k-button botonMenuDisabled") +
                "'><span>" + window.app.idioma.t(this.model.get("texto")) + "</span></a>"));
            return this;
        },
        events: {
            'click': 'selOpcMenu'
        },

        selOpcMenu: function () {
            if (this.model.get("subMenus") && this.model.get("subMenus").length > 0 && this.model.get("permiso")) {
                this.setSetlectOpc();
                Backbone.trigger('eventSelMenu', this.model);
            }
            else {
                Not.crearNotificacion('warning', 'Aviso Menu', window.app.idioma.t('NO_TIENE_PERMISOS'), 4000);
            }

        },
        setSetlectOpc: function () {
            this.model.collection.each(function (models) {
                if (models.get('selected')) {
                    models.set('selected', false);
                }
            })
            this.model.set('selected', true);
        }
    });
    return OpcionMenu;
});