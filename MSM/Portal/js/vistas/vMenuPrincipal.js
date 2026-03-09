define(['underscore', 'backbone','jquery','vistas/vMenu'], function (_, Backbone,$,Menu) {
    var MenuPrincipal = Backbone.View.extend({
        tagName: 'ul',
        initialize: function () {
            this.render();
        },
        render: function () {
            this.$el.html('');
            this.collection.each(function (menu) {
                var menuView = new Menu({ model: menu });
                this.$el.append(menuView.el);
            }, this);
            this.$el.append($("<li><a id='aConfig' class='configuracion'><img id='btnConfig' src='img/settings.png' /></a></li>"));
            return this
        }
    });
    return MenuPrincipal;
});