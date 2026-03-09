define(['underscore', 'backbone', 'modelos/mLinea'], function (_, Backbone, Linea) {
    var Lineas = Backbone.Collection.extend({
        model: Linea,
        url: '../api/turnosLineas'
    });
    return Lineas;
});