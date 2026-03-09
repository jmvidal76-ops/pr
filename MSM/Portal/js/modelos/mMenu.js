define(['underscore', 'backbone'], function (_, Backbone) {
    var Menu = Backbone.Model.extend({
       
        defaults: {
            id:-1,
            texto: '',
            vista: '',
            permiso:false,
            subMenus: [],
            funciones:[]
        },

        initialize: function () {
            
        },

        clear: function () {
            this.destroy();
            this.view.remove();
        }

    });
    return Menu;
});