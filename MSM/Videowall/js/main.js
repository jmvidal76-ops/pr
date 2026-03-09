/// <reference path="C:\Users\ldelolmo\Documents\Visual Studio 2013\Projects\MSM\MSM\Scripts/jquery.signalR-2.2.0.min.js" />
/// <reference path="C:\Users\ldelolmo\Documents\Visual Studio 2013\Projects\MSM\MSM\Scripts/jquery.signalR-2.2.0.min.js" />
// Fichero: main.js
// Descripción: Configura las rutas a las librerias e inicializa la aplicación

// Definimos las rutas donde estan alojadas las librerias js y las dependencias entre ellas
requirejs.config({
    urlArgs: "v=1.0.0",
    paths: {
        compartido: '/Scripts/',
        jquery: '/LibreriasJS/libs/jquery/jquery-1.11.3.min',
        jqueryUI: '/LibreriasJS/libs/jqueryUI/jquery-ui.min',
        kendo: '/LibreriasJS/libs/kendoUI/kendo.all.min',
        underscore: '/LibreriasJS/libs/underscore/underscore-min',
        backbone: '/LibreriasJS/libs/backbone/backbone-min',
        text: '/LibreriasJS/libs/require/text',
        pnotify: '/LibreriasJS/libs/pNotify/pnotify.custom.min'
    },
    shim: {
        'kendo': ['jquery'],
        'jqueryUI': ['jquery'],
        'pnotify': ['jqueryUI'],
        'app': {
            deps: ['kendo']
        }
    },
    waitSeconds: 600
});

//Iniciamos la aplicación (Definida en el fichero app.js)
require([
  'app'
], function (App) {
    App.iniciar(); // iniciamos la aplicación
});