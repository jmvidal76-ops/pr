define(['underscore', 'backbone','modelos/mMenu'], function (_, Backbone,Menu) {
    var Menus = Backbone.Collection.extend({
        model: Menu,
        url: '../api/menus/T'
    });
    return Menus;
});