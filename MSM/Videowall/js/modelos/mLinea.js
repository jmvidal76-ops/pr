define(['underscore', 'backbone'], function (_, Backbone) {
    var Linea = Backbone.Model.extend({

        defaults: {
          
        },

        initialize: function () {

        },

        clear: function () {
            this.destroy();
            this.view.remove();
        }

    });

    return Linea;
});