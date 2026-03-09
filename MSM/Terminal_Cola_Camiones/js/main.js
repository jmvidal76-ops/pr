/// <reference path="C:\Users\ldelolmo\Documents\Visual Studio 2013\Projects\MSM\MSM\Scripts/jquery.signalR-2.2.0.min.js" />
/// <reference path="C:\Users\ldelolmo\Documents\Visual Studio 2013\Projects\MSM\MSM\Scripts/jquery.signalR-2.2.0.min.js" />
// Fichero: main.js
// Descripción: Configura las rutas a las librerias e inicializa la aplicación

// Definimos las rutas donde estan alojadas las librerias js y las dependencias entre ellas
requirejs.config({
    paths: {
        compartido: '/Scripts/',
        ALT: '/ALT/vistas',
        //signalr: '/Scripts/jquery.signalR-2.2.0.min',
        //hubs: '/signalr/hubs?',
        jquery: '/LibreriasJS/libs/jquery/jquery-1.11.3.min',
        jqueryUI: '/LibreriasJS/libs/jqueryUI/jquery-ui.min',
        keyboard: '/LibreriasJS/libs/keyboard/js/jquery.keyboard.min',
        kendo: '/LibreriasJS/libs/kendoUI/kendo.all.min',
        underscore: '/LibreriasJS/libs/underscore/underscore-min',
        backbone: '/LibreriasJS/libs/backbone/backbone-min',
        text: '/LibreriasJS/libs/require/text',
        pnotify: '/LibreriasJS/libs/pNotify/pnotify.custom.min'
    },
    shim: {
        'kendo': ['jquery'],
        'jqueryUI': ['jquery'],
        'keyboard': ['jqueryUI'],
        'pnotify': ['jqueryUI'],
        'app': {
            deps: ['kendo']
        }
        //'signalr': {
        //    deps: ['jquery'],
        //    exports: "$.connection"
        //},
        //'hubs': {
        //    deps: ['signalr']
        //}
    },
    waitSeconds: 20
});

//Iniciamos la aplicación (Definida en el fichero app.js)
require([
  'app', 'UISettings'
], function (App, UISettings) {
    $.getScript("/LibreriasJS/libs/bootstrap/js/bootstrap.min.js"); // cargamos el JS de bootstrap de momento así por que no funciona desde requirejs.config
    App.iniciar(); // iniciamos la aplicación

});