// Fichero: app.js
// Descripción: Este modulo se encarga de cargar las distintas partes de la estructura general de la aplicación

define([
  'jquery',
  'compartido/router',
  'idioma',
  'modelos/mSesion',
  'vistas/vPrincipal',
  'compartido/notificaciones',
  'compartido/configuradorKendoGrid',
  'section',
  'compartido/realTime',
  'compartido/utils'
], function ($, Ruteador, Idioma, Sesion, VistaPrincipal, Not, configKendoGrid, Section, RT, Utils) {

    window.app = window.app || {};
    window.app.avisoCierre = null; // variable que controla si hay que mostrar o no el aviso de cierre
    window.app.ruteador = null;
    window.app.sesion = null;
    window.app.vistaPrincipal = null;
    window.app.vista = null;
    window.app.idioma = null;
    window.app.tipos = null;
    window.app.reasonTree = null;
    window.app.planta = null;
    window.app.lineaSel = null;
    window.app.zonaSel = null;
    window.app.pdvSel = null;
    window.app.pdvSEOSel = null;
    window.app.cfgKendo = null;
    window.app.interval = null;
    window.app.sesionExpired = false;
    window.app.calidad = {};
    window.app.SEO = {};

    window.app.iniciar = function () {
        var self = this;

        ExtendCulture();

        self.comprobarEstadoPlanta();

        self.comprobarSesionUsuario();

        self.getDatosMensajeAdministracion();

        $(document).ajaxError(function (a, b, c) {
            //LEA
            if (b.status == 401) {
                // alert('El tiempo de sesión ha terminado, y no tiene permisos para acceder a dicha opción, debe loguearse de nuevo');
                if (localStorage) {
                    var alertMostrado = localStorage.getItem("alertDeSesionCaducadaEnTerminalMostrado") || ""; // agomezn 100616: 091 Que no se llene la pantalla de alerts de aviso de sesión caducada cuando se pierde la sesión
                    if (alertMostrado !== "") {
                        alert("Su sesión ha caducado debido al tiempo de inactividad, por lo que deberá logarse de nuevo para realizar cualquier acción");
                        localStorage.setItem("alertDeSesionCaducadaEnTerminalMostrado", "si");
                    }
                } else {
                    alert("Su sesión ha caducado debido al tiempo de inactividad, por lo que deberá logarse de nuevo para realizar cualquier acción");
                }
                window.app.avisoCierre = false;
                parent.location.hash = '';
                window.location.reload();
            }
            console.log(b);
        });

        $(document).ready(function () {
            // Ocultar por defecto Logo y favicon
            $("#favicon").attr("href", "data:,");
            $("#logo").hide();
            $("#lblNombrePlanta").css('margin-top', '15px');
            $("#lblNombrePlanta").css('margin-right', '10px');

            // Si ya hay modelo de sesión y está validada, aplicamos permiso
            if (window.app && window.app.sesion && typeof window.app.sesion.get === 'function') {
                if (window.app.sesion.get('validada')) {
                    aplicarSegunPermiso();
                } else {
                    // Espera a que se cargue la sesión
                    window.app.sesion.once('sync', function () {
                        if (window.app.sesion.get('validada')) aplicarSegunPermiso();
                    });
                }
            }

            function aplicarSegunPermiso() {
                var permiso = false; // true => puede ocultar logos
                try { permiso = TienePermiso(422); } catch (e) { permiso = false; } //422 Ocultar logos

                if (!permiso) {
                    // mostrar logos y favicon de planta
                    var section = new Section();
                    $("#favicon").attr("href", section.getAppSettingsValue('faviconPlanta'));
                    $("#logo").show();
                    $("#lblNombrePlanta").css('margin-top', '0px');
                    $("#lblNombrePlanta").css('margin-right', '0px');
                    $(".navbar-header").css('margin-top', '0px');
                } else {
                    //
                    $("#favicon").attr("href", "data:,");
                    $("#logo").hide();
                    $("#lblNombrePlanta").css('margin-top', '15px');
                    $("#lblNombrePlanta").css('margin-right', '10px');
                }
            }
        });
    }

    window.app.comprobarCargaPlanta = function () {
        $.ajax({
            type: "GET",
            url: "../api/planta/estadoDatos",
            dataType: 'json',
            cache: true
        }).done(function (data) {
            datosOk = data;
            if (datosOk) {
                Not.quitarNotificacionDatosNoOk();
                clearInterval(window.app.intervalCargaPlanta);

                window.app.sesion = new Sesion();
                window.app.sesion.fetch({
                    reset: true,
                    success: function (sesion) {
                        // Obtenemos las colecciones de tipos
                        //self.obtenerTipos();
                        // Establecemos el idioma (Si no se ha seleccionado ninguno por defecto ponemos es-ES
                        self.idioma = new Idioma();
                        self.section = new Section();
                        // Obtenemos el arbol de razones de paros y perdidas
                        self.obtenerReasonTree();
                        // Obtenemos las configuracion de la planta
                        self.obtenerConfigPlanta();
                        //Obtenemos configuración ALT
                        self.obtenerConfigCalidad();

                        if (!localStorage.getItem("idiomaSeleccionado")) localStorage.setItem("idiomaSeleccionado", "es-ES");
                        var idiomaSeleccionado = localStorage.getItem("idiomaSeleccionado");
                        kendo.culture(idiomaSeleccionado);
                        self.idioma.getFicheroIdioma(idiomaSeleccionado);
                        // Iniciamos el ruteador
                        //self.ruteador = new Ruteador();
                        //self.ruteador.cargarVistas("T");
                        //Obtenemos configuración SEO
                        self.obtenerConfigSEO();
                        self.obtenerConfigServidores();
                        // Cargamos la vista principal
                        if (window.app.planta) {
                            self.vistaPrincipal = new VistaPrincipal({ el: "body", model: sesion });
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CARGA_PLANTA'));
                        }

                        if (localStorage) { // agomezn 130616: 092 Que no se llene la pantalla de alerts de aviso de sesión caducada cuando se pierde la sesión
                            localStorage.removeItem("alertDeSesionCaducadaEnTerminalMostrado");
                        }
                    },
                    error: function (e) {
                        //Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_APLICACION'), 4000);
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CARGA_PLANTA'));
                    }
                });
            }
            else {
                // Not.crearNotificacion('DATOS_NO_OK', window.app.idioma.t('ERROR'), 'Los datos de planta no se han cargado correctamente, puede acceder a la aplicación pero los datos en tiempo real no son fiables, cuando un administrador solucione el problema este mensaje desaparecera', null);
                Not.crearNotificacion('DATOS_NO_OK', window.app.idioma.t('ERROR'), 'Los datos de planta en tiempo real no son fiables porque no se han cargado correctamente, comuníquelo a un administrador', null); // agomezn 090616: 090 cambiar el texto del aviso de error de carga de planta a uno menos difuso
            }
        }).fail(function (xhr) {
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_COMPROBAR'), null);
        });
    }

    window.app.obtenerReasonTree = function () {
        var self = this;
        self.reasonTree = {};

        // Obtenemos los tipos de estados de una orden
        $.ajax({
            type: "GET",
            url: "../api/paros/reasonTree",
            dataType: 'json',
            cache: true
        }).done(function (data) {
            self.reasonTree = data;
        }).fail(function (xhr) {
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_REASON_TREE'), 4000);
        });
    }

    window.app.comprobarSesionActiva = function () {
        var self = this;
        if (window.app.sesion.get("validada")) {
            $.ajax({
                type: "GET",
                url: "../api/planta/comprobarSesionActiva/" + window.app.sesion.get('usuario'),
                dataType: 'json',
                cache: true
            }).done(function (data) {
                if (data.activa) {
                    clearInterval(window.app.interval);
                    window.app.interval = setInterval(window.app.comprobarSesionActiva, data.miliseconds);
                } else {
                    Backbone.trigger('eventActualizarUsuarios');
                    clearInterval(window.app.interval);
                    window.app.sesionExpired = true;
                    parent.location.hash = '';
                    window.location.reload();
                }
            }).fail(function (xhr) {
                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_COMPROBAR_LA_SESION'), 4000);
            });
        }
    }

    window.app.comprobarSesionUsuario = function () {
        var self = this;

        // Comprobamos si el usuario tiene iniciada la sesión y en tal caso recogemos sus datos
        window.app.sesion = new Sesion();
        window.app.sesion.fetch({
            reset: true,
            success: function (sesion) {
                // Obtenemos las colecciones de tipos
                //self.obtenerTipos();
                // Obtenemos el arbol de razones de paros y perdidas
                self.obtenerReasonTree();
                // Obtenemos las configuracion de la planta
                self.obtenerConfigPlanta();
                
                // Establecemos el idioma (Si no se ha seleccionado ninguno por defecto ponemos es-ES
                self.idioma = new Idioma();
                self.section = new Section();
                if (!localStorage.getItem("idiomaSeleccionado")) localStorage.setItem("idiomaSeleccionado", "es-ES");
                var idiomaSeleccionado = localStorage.getItem("idiomaSeleccionado");
                kendo.culture(idiomaSeleccionado);
                self.idioma.getFicheroIdioma(idiomaSeleccionado);
                window.app.cfgKendo = new configKendoGrid(idiomaSeleccionado);
                // Iniciamos el ruteador
                //self.ruteador = new Ruteador();
                //self.ruteador.cargarVistas("T");

                self.obtenerConfigServidores();

                //Obtenemos configuración SEO
                self.obtenerConfigSEO();
                //Obtenemos configuración ALT
                self.obtenerConfigCalidad();
                // Cargamos la vista principal
                //if (window.app.planta) {
                self.vistaPrincipal = new VistaPrincipal({ el: "body", model: sesion });
                //}
                //else {
                //    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'Error al iniciar la aplicación');
                //}

                if (localStorage) { // agomezn 130616: 092 Que no se llene la pantalla de alerts de aviso de sesión caducada cuando se pierde la sesión
                    localStorage.removeItem("alertDeSesionCaducadaEnTerminalMostrado");
                }
            },
            error: function (e, a) {
                if (!window.app.idioma) {
                    Not.crearNotificacion('error', 'ERROR', a.responseJSON.Message);
                } else {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_APLICACION'));
                }
            }
        });
    }

    window.app.comprobarEstadoPlanta = function () {

        $.ajax({
            type: "GET",
            url: "../api/planta/estadoDatos",
            dataType: 'json',
            cache: false
        }).done(function (data) {
            datosOk = data;
            if (datosOk) {
                Not.quitarNotificacionDatosNoOk();
                clearInterval(window.app.intervalCargaPlanta);
            } else {
                Not.crearNotificacion('DATOS_NO_OK', window.app.idioma.t('ERROR'), 'Los datos de planta en tiempo real no son fiables porque no se han cargado correctamente, comuníquelo a un administrador', null); // agomezn 090616: 090 cambiar el texto del aviso de error de carga de planta a uno menos difuso
                clearInterval(window.app.intervalCargaPlanta);
                window.app.intervalCargaPlanta = setInterval(function () {
                    Backbone.trigger('eventComprobarCargaPlanta');
                }, 35000);
            }
            return datosOk;
        }).fail(function (xhr) {
            if (!window.app.idioma) {
                Not.crearNotificacion('DATOS_NO_OK', 'ERROR', "Error al comprobar el estado de los datos de la planta.", null);
            } else {
                Not.crearNotificacion('DATOS_NO_OK', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_COMPROBAR'), null);
            }
        });
    }

    window.app.getDatosMensajeAdministracion = function () {
        $.ajax({
            type: "GET",
            url: "../api/ObtenerMensajeAdministracion",
            dataType: 'json',
        }).success(function (data) {
            if (data.Activo) {
                $("#alrtMensajeAdministracion").css('display', 'block');
                $("#alrtMensajeAdministracion").attr('class', 'alert ' + data.Opcion);
                $("#alrtMensajeAdministracion").html('<span><i class="glyphicon glyphicon-warning-sign"></i>&nbsp;' + data.Descripcion + '</span>');
            }
            else {
                $("#alrtMensajeAdministracion").css('display', 'none');
                $("#alrtMensajeAdministracion").html('');
            }
        }).fail(function (e) {
            // Manejar error
        });
    }

    // Obtenemos si tiene que gestionar el aviso de cierre, o no
    $.ajax({
        type: "GET",
        url: "../api/planta/avisoCierre",
        dataType: 'json',
        cache: true,
        async: false
    }).done(function (data) {
        window.app.avisoCierre = data;
    }).fail(function (xhr) {
        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER_EL_AVISO'), 4000);
    });

    

    window.app.obtenerConfigPlanta = function () {
        var self = this;
        self.tipos = {};

        // Obtenemos la configuración de la planta
        $.ajax({
            type: "GET",
            url: "../api/planta/configuracion",
            dataType: 'json',
            cache: true,
            async: false
        }).done(function (data) {
            self.planta = data;
        }).fail(function (xhr) {
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CONFIGURACION_PLANTA'), 4000);
        });
    },
    //add ALT
    window.app.obtenerConfigCalidad = function () {
        var self = this;
        $.ajax({
            type: "GET",
            url: "../api/TemplatesLocations/0/",
            dataType: 'json',
            cache: true,
            async: false
        }).done(function (data) {
            self.calidad.pdvs = data;
        }).fail(function (xhr) {
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ALT_ERROR_CONFIGURACION_CALIDAD'), 4000);
        });
    },
    //add SEO
    window.app.obtenerConfigSEO = function () {
        var self = this;
        $.ajax({
            type: "GET",
            url: "../api/TemplatesLocations/1/",
            dataType: 'json',
            cache: true,
            async: false
        }).done(function (data) {
            self.SEO.pdvs = data;
        }).fail(function (xhr) {
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ALT_ERROR_CONFIGURACION_CALIDAD'), 4000);
        });
    },
    window.app.cargarTurnos = function () {
        var self = this;
        self.tipos = {};

        // Obtenemos la configuracion de la planta
        $.ajax({
            type: "GET",
            url: "../api/planta/turnos",
            dataType: 'json',
            cache: true,
            async: false
        }).done(function (data) {
            self.planta.turnoActual = data;
        }).fail(function (xhr) {
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_CARGAR'), 4000);
        });
    }

    window.app.obtenerConfigServidores = function () {
        var self = this;
        $.ajax({
            type: "GET",
            url: "../api/planta/servidores",
            dataType: 'json',
            cache: false,
            async: false
        }).done(function (data) {
            self.servidores = data;
        }).fail(function (xhr) {
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER_LA'), 4000);
        });
    }

    //Convierte segundos ('s') en dias hh:mm:ss
    window.app.getDateFormat = function (s) {
        var d = Math.floor(Math.floor(Math.floor(s / 60) / 60) / 24); //Dias
        var fm = [
                          (d > 0 ? d + "d " : "") +      //Dias
                          (Math.floor(Math.floor(s / 60) / 60) % 24),                          //horas
                          Math.floor(s / 60) % 60,                                                //minutos
                          Math.floor(s % 60)                                                                     //segundos
        ];
        var date = $.map(fm, function (v, i) { return ((v < 10) ? '0' : '') + v; }).join(':');

        return date;
    }

    //Devuelve un listado del estado de los jobs programados
    window.app.comprobarEstadoProgramador = function () {
        $.ajax({
            type: "GET",
            url: "../api/planta/estadoJobsProgramador",
            dataType: 'json',
            cache: false
        }).done(function (data) {
            console.log("Estado Jobs programador:")
            console.log(data);
        }).fail(function (xhr) {
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ESTADO_PROGRAMADOR'), null);
        });
    }

    //Devuelve un listado del estado de las tareas del programadorMSM
    window.app.comprobarEstadoProgramadorMSM = function (nombre = '') {
        const data = {
            nombreTarea: nombre
        }
        $.ajax({
            type: "GET",
            url: "../api/planta/ProgramadorMSM/estado",
            data: data,
            dataType: 'json',
            cache: false
        }).done(function (result) {
            console.log("Estado tareas ProgramadorMSM:");

            for (let r in result) {
                if (result[r].MaximaDuracion && result[r].MaximaDuracion.Key) {
                    result[r].MaximaDuracion.Key = new Date(result[r].MaximaDuracion.Key);
                }

                if (result[r].ProximaEjecucion) {
                    result[r].ProximaEjecucion = new Date(result[r].ProximaEjecucion);
                }
                if (result[r].UltimaEjecucion) {
                    result[r].UltimaEjecucion = new Date(result[r].UltimaEjecucion);
                }
            }
            console.log(result);
        }).fail(function (xhr) {
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ESTADO_PROGRAMADOR'), 4000);
        });
    }

    //Cambia el intervalo de ejecución de una tarea
    window.app.cambiarIntervaloProgramadorMSM = function (nombre = '', tiempo = 1, ejecutarYa = true) {
        const data = {
            nombreTarea: nombre,
            nuevoIntervalo: tiempo,
            ejecutarYa
        }
        $.ajax({
            type: "GET",
            url: "../api/planta/ProgramadorMSM/cambiarIntervalo",
            data: data,
            //dataType: 'json',
            cache: false
        }).done(function (result) {

            console.log(`Cambiado intervalo tarea ProgramadorMSM: ${nombre} - ${tiempo} mins`);

        }).fail(function (xhr) {
            console.log(xhr);
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), "Error cambiando el intervalo de la tarea", 4000);
        });
    }

    window.app.AccionesTareaEnum = {
        Eliminar: 0,
        Pausar: 1,
        Reanudar: 2,
        EjecutarAhora: 3
    }

    window.app.TareasProgramadorMSM = {
        ActFechaEstimadaFinWO: 'ActFechaEstimadaFinWO',
    }

    //Accion tarea programadorMSM
    window.app.cambiarTareaProgramadorMSM = function (nombre = '', accion = 1) {
        const acciones = [];

        for (let a in window.app.AccionesTareaEnum) {
            acciones.push(window.app.AccionesTareaEnum[a]);
        }

        if (!acciones.includes(accion)) {
            console.log("Accion desconocida, las acciones disponibles son:");
            console.log(window.app.AccionesTareaEnum);
            return
        }

        const data = {
            nombreTarea: nombre,
            accion: accion
        }
        $.ajax({
            type: "GET",
            url: "../api/planta/ProgramadorMSM/cambiarTarea",
            data: data,
            dataType: 'json',
            cache: false
        }).done(function (result) {

            console.log(`Cambiada tarea ProgramadorMSM: ${nombre}`);

        }).fail(function (xhr) {
            console.log(xhr);
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), "Error cambiando la tarea", 4000);
        });
    }

    ////Para activar o desactivar los logs del programador
    //window.app.activarLogsProgramador = function (activar) {
    //    $.ajax({
    //        type: "GET",
    //        url: "../api/planta/activarLogsProgramador?activar=" + activar,
    //        dataType: 'json',
    //        cache: false
    //    }).done(function (data) {
    //        console.log("Estado logs programador: activos " + activar)
    //    }).fail(function (xhr) {
    //        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'Error al activar los logs del programador', null);
    //    });
    //}

    //Para activar o desactivar log de los triggers
    window.app.activarLogTriggers = function (tipoTrigger, activar) {
        $.ajax({
            type: "GET",
            url: "../api/planta/activarLogTriggers?tipoTrigger=" + tipoTrigger + "&activar=" + activar,
            dataType: 'json',
            cache: false
        }).done(function (data) {
            console.log(data)
        }).fail(function (xhr) {
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'Error al activar el log de los triggers', null);
        });
    }

    return window.app;
});