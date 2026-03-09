define(['underscore', 'backbone', 'modelos/mLinea'], function (_, Backbone, Linea) {
    var Lineas = Backbone.Collection.extend({
        opciones: [],
        initialize: function(options) {
            this.url = '../api/videowall/turnoslineas/' + options;
        },
        model: Linea,
        //url: '../api/videowall/turnoslineas/' + "0"
        //url: function () {
        //    var n = this.opciones;
        //    return '../api/videowall/turnoslineas/' + this.opciones
        //}
    });
    return Lineas;
});