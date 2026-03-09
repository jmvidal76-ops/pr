define(['underscore', 'backbone','modelos/mOrden'], function (_, Backbone,Orden) {
    var Ordenes = Backbone.Collection.extend({
        initialize: function (linea,zona) {
            this.linea = linea;
            this.zona = zona;
        },
        url: function () {
            return '../api/ordenesActivas/' + this.linea + '/' + this.zona + '/';
        },
        model: Orden
       
    });
    return Ordenes;
});