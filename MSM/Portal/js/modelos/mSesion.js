define(['underscore', 'backbone'], function (_, Backbone) {
    var Session = Backbone.Model.extend({
        url: '../api/compruebaLogin/portal',
        defaults: {
           
        },
        initialize: function () {
            
        },
        isAuthorizedTo: function (funcion) {
            var sw = false;
            jQuery.each(this.attributes.funciones, function (index, value) {
                if (value.codigo == funcion) {
                    sw= true;
                }
            });

            return sw;       
        },
        clear: function () {
            this.destroy();
            this.view.remove();
        }

    });
    return Session;
});