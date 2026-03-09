// Fichero: main.js
// Descripción: Configura las rutas a las librerias e inicializa la aplicación

// Definimos las rutas donde estan alojadas las librerias js y las dependencias entre ellas


requirejs.config({
    urlArgs: "v=1.0.0",
    paths: {
        compartido: '/Scripts/',
        ALT: '/ALT/vistas',
        //signalr: '/Scripts/jquery.signalR-2.2.0.min',
        //hubs: '/signalr/hubs?',
        jquery: '/LibreriasJS/libs/jquery/jquery-1.11.3.min',
        jqueryUI: '/LibreriasJS/libs/jqueryUI/jquery-ui.min',
        keyboard: '/LibreriasJS/libs/keyboard/js/jquery.keyboard.min',
        kendo: '/LibreriasJS/libs/kendoUI/kendo.all.min',
        kendoTimezones: '/LibreriasJS/libs/kendoUI/kendo.timezones.min',
        vis: '/LibreriasJS/libs/vis/vis.min',
        underscore: '/LibreriasJS/libs/underscore/underscore-min',
        backbone: '/LibreriasJS/libs/backbone/backbone-min',
        text: '/LibreriasJS/libs/require/text',
        pnotify: '/LibreriasJS/libs/pNotify/pnotify.custom.min',
        jszip: '/LibreriasJS/libs/jszip/jszip',
        xlsx: '/LibreriasJS/libs/xlsx/xlsx.mini',
        definiciones: '/Portal/js/constantes',
    },
    map: {
        '*': {
            'kendo.core.min': 'kendo'
        }
    },
    shim: {
        'vis': ['jquery'],
        'jqueryUI': ['jquery'],
        'kendo': ['jquery', 'jszip'],
        'kendoTimezones': ['kendo'],
        'app': {
            deps: ['kendo']
        },
        'pnotify': ['jqueryUI'],
        'jszip': ['jquery'],
        //'signalr': {
        //    deps: ['jquery'],
        //    exports: "$.connection"
        //},
        //'hubs': {
        //    deps: ['signalr']
        //}

    },
    waitSeconds: 600
});

//Iniciamos la aplicación (Definida en el fichero app.js)
require([
    'app',
], function(App) {
    $.getScript("/LibreriasJS/libs/bootstrap/js/bootstrap.min.js"); // cargamos el JS de bootstrap de momento así por que no funciona desde requirejs.config
    App.iniciar(); // iniciamos la aplicación
    
});