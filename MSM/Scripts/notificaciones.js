// Fichero: notificaciones.js
// Descripción: herramientas para crear alertas y notificaciones en pantalla
define([
  'pnotify',
], function (PNotify) {
    var Notificaciones = {
        notificacionSINORDEN: null,
        notificacionDATOS_CARGANDO: null,
        notificacionDATOS_NO_OK: null,
        notificacion : null,
        stack_bottomright: { "dir1": "up", "dir2": "left", "firstpos1": 25, "firstpos2": 25 },
        quitarNotificacionOrden: function()
        {
            if (this.notificacionSINORDEN) {
                this.notificacionSINORDEN.remove();
                this.notificacionSINORDEN = null;
            }
        },
        quitarNotificacionDatosNoOk: function () {
            if (this.notificacionDATOS_NO_OK) {
                this.notificacionDATOS_NO_OK.remove();
                this.notificacionDATOS_NO_OK = null;
            }
        },
        quitarNotificacionDatosCargando: function () {
            if (this.notificacionDATOS_CARGANDO) {
                this.notificacionDATOS_CARGANDO.remove();
                this.notificacionDATOS_CARGANDO = null;
            }
        },
        crearNotificacion: function (tipo,titulo,texto,duracion)
        {
            if (tipo == "SINORDEN") {
                if (!this.notificacionSINORDEN) {
                    this.notificacionSINORDEN = new PNotify({
                        title: titulo,
                        text: texto,
                        type: 'error',
                        width: '510px',
                        closer: false,
                        sticker: false,
                        styling: 'bootstrap3',
                        hide: false,
                        addclass: "stack-bottomright sinOrden",
                        stack: this.stack_bottomright
                    });
                }
            }
            else if (tipo == "DATOS_NO_OK") {
                if (!this.notificacionDATOS_NO_OK) {
                    this.notificacionDATOS_NO_OK = new PNotify({
                        title: titulo,
                        text: texto,
                        type: 'error',
                        width: '510px',
                        closer: false,
                        sticker: false,
                        styling: 'bootstrap3',
                        hide: false,
                        addclass: "stack-bottomright",
                        stack: this.stack_bottomright
                    });
                }
            } else if (tipo == "DATOS_CARGANDO") {
                if (!this.notificacionDATOS_CARGANDO) {
                    this.notificacionDATOS_CARGANDO = new PNotify({
                        title: titulo,
                        text: texto,
                        type: 'info',
                        //width: '510px',
                        closer: false,
                        sticker: false,
                        styling: 'bootstrap3',
                        hide: false,
                        addclass: "stack-bottomright",
                        stack: this.stack_bottomright
                    });
                }
            }
            else {
                if (duracion) {
                    notificacion = new PNotify({
                        title: titulo,
                        text: texto,
                        type: tipo,
                        delay: duracion,
                        styling: 'bootstrap3',
                        addclass: "stack-bottomright",
                        stack: this.stack_bottomright
                    });
                }
                else {
                    notificacion = new PNotify({
                        title: titulo,
                        text: texto,
                        type: tipo,
                        closer: false,
                        sticker: false,
                        styling: 'bootstrap3',
                        hide: false,
                        addclass: "stack-bottomright",
                        stack: this.stack_bottomright
                    });

                    notificacion.get().click(function () {
                        notificacion.remove();
                    });

                }
            }
        }
   };

    return Notificaciones;
});