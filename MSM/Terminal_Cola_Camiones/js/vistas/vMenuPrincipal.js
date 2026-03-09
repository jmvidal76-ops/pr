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
            return this
        },
        actualiza: function () {
            this.render();
        }
    });
    return MenuPrincipal;
});