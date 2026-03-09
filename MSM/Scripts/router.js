// Fichero: router.js
// Descripción: controla la navegación por las diferentes secciones de la pagina

define([
  'jquery',
  'underscore',
  'backbone'
], function ($, _, Backbone) {

    var Ruteador = function () {

        this.vistas = null;
        this.rutas = null;
        this.r = null;
        this.cargarVistas = function (app) {
            var self = this;
            // Obtenemos las vistas de la aplicación
            $.ajax({
                type: "GET",
                url: "../api/vistas/" + app,
                dataType: 'json',
                cache: true,
                async: false
            }).done(function (data) {
                self.vistas = data;
                self.rutas = {};
                $.each(self.vistas, function (index, value) {
                    self.rutas[value.ruta] = value.funcion;
                });
                self.iniciarRouter();
                
            }).fail(function (xhr) {
                alert(window.app.idioma.t('ERROR_VISTAS') + ': ' + xhr);
            });
        }


        this.iniciarRouter = function () {
            var self = this;
            var Router = Backbone.Router.extend({
                routes: self.rutas,
                iniciar: function (vistas) {
                    var self = this;
                    $.each(vistas, function (index, value) {
                        var contenedorFunc = "";
                        var contenidoFunc = "";
                        var strParametros = "";
                        var arrParametros = "";
                        if (value.acciones) {
                            contenidoFunc += value.acciones;
                        }
                        if (value.nombre && value.ruta != "*actions") {
                            if (value.parametros) {
                                $.each(value.parametros, function (index, param) {
                                    strParametros += param.nombre + ":" + param.valor + ",";
                                    arrParametros += param.valor + ",";
                                });
                                strParametros = strParametros.slice(0, -1);
                                arrParametros = arrParametros.slice(0, -1);
                            }
                            contenidoFunc += "$('#imgPantalla').show();$('#lblPantalla').text('" + value.codigo + "');"
                            contenidoFunc += "window.app.vista = new " + value.nombre + "({" + strParametros + "});";
                            contenidoFunc += "window.app.pantalla = '" + value.codigo + " - " + value.nombre + "';";

                            if (value.contenedor) contenidoFunc += "window.app.vista.$el.appendTo('" + value.contenedor + "');";

                            if (value.seccion) {
                                contenedorFunc = "require(['vistas/" + value.seccion + "/v" + value.nombre + "'], function(" + value.nombre + ") {" + contenidoFunc + "});";
                            }
                            else {
                                contenedorFunc = "require(['vistas/v" + value.nombre + "'], function(" + value.nombre + ") {" + contenidoFunc + "});";
                            }
                        }
                        else contenedorFunc = contenidoFunc;

                        var f;
                        if (value.parametros && value.parametros.length > 0) f = new Function(arrParametros, contenedorFunc);
                        else f = new Function(contenedorFunc);
                        self.on("route:" + value.funcion, f)
                    });
                }
            });
            //    routes: rutas,
            self.r = new Router();
            self.r.iniciar(self.vistas);

            if(!Backbone.History.started) Backbone.history.start();

        }

       
    }
    return Ruteador;
});



