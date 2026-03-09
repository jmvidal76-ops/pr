// Fichero: app.js de Portal
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
  'compartido/utils',
  'backbone'
], function ($, Ruteador, Idioma, Sesion, VistaPrincipal, Not, configKendoGrid, Section, Utils, Backbone) {

    window.app = window.app || {};
    window.app.avisoCierre = null; // variable que controla si hay que mostrar o no el aviso de cierre
    window.app.ruteador = null;
    window.app.sesion = null;
    window.app.vistaPrincipal = null;
    window.app.vista = null;
    window.app.idioma = null;
    window.app.pantalla = null;
    window.app.tipos = null;
    window.app.planta = null;
    window.app.productos = null;
    window.app.reasonTree = null;
    window.app.cfgKendo = null;
    window.app.section = null;
    window.app.interval = null;
    window.app.intervalCargaPlanta = null;
    window.app.calidad = {};
    window.app.SEO = {};
    //Controlamos si la sesion ha expirado, si ha expirado no mostramos el aviso en pantalla (esto hará que se cierre su sesion y tenga que volver a introducir los credenciales.)
    window.app.sesionExpired = false;
    ////Controlamos si se ha cerrado la sesion de un usuario, si es así cerramos su sesión pero no eliminamos al usuario de la lista ya que se actualiza la sesion del usuario
    //window.app.userSesionChanged = false;

    window.app.iniciar = function () {
        var self = this;
        // Comprobamos si los datos en tiempo real de la planta estan cargados corrrectamente
        var datosOk;

        //$.ajax({
        //    type: "GET",
        //    url: "../api/planta/getTiempoSesion",
        //    dataType: 'json',
        //    cache: true
        //}).done(function (data) {
        //    if (data) {
        //        interval = setInterval(self.comprobarSesionActiva, data);
        //    }
        //}).fail(function (xhr) {
        //    var error = xhr;
        //});
        ExtendCulture();

        self.comprobarEstadoPlanta();

        self.comprobarSesionUsuario();

        self.getDatosMensajeAdministracion();

        $(document).ajaxError(function (a, b, c) {
            //LEA
            if (b.status == 401) {
                // alert('El tiempo de sesión ha terminado, y no tiene permisos para acceder a dicha opción, debe loguearse de nuevo');
                if (localStorage) {
                    var alertMostrado = localStorage.getItem("alertDeSesionCaducadaEnPortalMostrado") || ""; // agomezn 100616: 092 Que no se llene la pantalla de alerts de aviso de sesión caducada cuando se pierde la sesión
                    if (alertMostrado !== "") {
                        alert("Su sesión ha caducado debido al tiempo de inactividad, por lo que deberá logarse de nuevo para realizar cualquier acción");
                        localStorage.setItem("alertDeSesionCaducadaEnPortalMostrado", "si");
                    }
                } else {
                    alert("Su sesión ha caducado debido al tiempo de inactividad, por lo que deberá logarse de api/planta/comprobarSesionActivanuevo para realizar cualquier acción");
                }
                window.app.avisoCierre = false;
                parent.location.hash = '';
                window.location.reload();
            }
            //console.log('error');
        });
        $(document).ready(function () {
            // Ocultar por defecto Logo y favicon
            $("#favicon").attr("href", "data:,");
            $("#logo").hide();
            $(".navbar-header").css('margin-top', '10px');

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
                    $(".navbar-header").css('margin-top', '0px');
                } else {
                    $("#favicon").attr("href", "data:,");
                    $("#logo").hide();
                    $(".navbar-header").css('margin-top', '10px');
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
                if (!window.app.idioma) {
                    Not.crearNotificacion('DATOS_NO_OK', 'ERROR', 'Los datos de planta en tiempo real no son fiables porque no se han cargado correctamente, comuníquelo a un administrador', null);
                } else {
                    Not.crearNotificacion('DATOS_NO_OK', window.app.idioma.t('ERROR'), window.app.idioma.t("ERROR_CARGA_PLANTA"), null);
                }

                clearInterval(window.app.intervalCargaPlanta);
                window.app.intervalCargaPlanta = setInterval(function () {
                    Backbone.trigger('eventComprobarCargaPlanta');
                }, 35000);
            }

            return datosOk;
        }).fail(function (xhr) {
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_COMPROBAR'), null);
        });
    }

    window.app.comprobarSesionUsuario = function () {
        var self = this;
        // Comprobamos si el usuario tiene iniciada la sesión y en tal caso recogemos sus datos
        window.app.sesion = new Sesion();
        window.app.sesion.fetch({
            reset: true,
            success: function (sesion) {
                // Obtenemos las colecciones de tipos que se reutilizan en diferentes pantallas 
                // self.obtenerTipos();
                // Obtenemos el arbol de razones de paros y perdidas
                self.obtenerReasonTree();
                // Obtenemos las configuracion de la planta (Planta-Lineas-Zonas-Maquinas-Ordenes)
                self.obtenerConfigPlanta();
                // Establecemos el idioma (Si no se ha seleccionado ninguno por defecto ponemos es-ES
                self.idioma = new Idioma();
                self.section = new Section();
                var idiomaSeleccionado = localStorage.getItem("idiomaSeleccionado");
                if (!idiomaSeleccionado) {
                    localStorage.setItem("idiomaSeleccionado", "es-ES");
                    idiomaSeleccionado = "es-ES";
                }
                kendo.culture(idiomaSeleccionado);

                self.idioma.getFicheroIdioma(idiomaSeleccionado);
                window.app.cfgKendo = new configKendoGrid(idiomaSeleccionado);

                // Cargamos la vista principal
                self.vistaPrincipal = new VistaPrincipal({ el: "body", model: sesion });
                // Obtenemos la coleccion de productos
                self.obtenerProductos();
                self.obtenerConfigServidores();

                self.obtenerConfigCalidad();

                if (localStorage) { // agomezn 130616: 092 Que no se llene la pantalla de alerts de aviso de sesión caducada cuando se pierde la sesión
                    localStorage.removeItem("alertDeSesionCaducadaEnPortalMostrado");
                }
            },
            error: function (e, a, c) {
                if (!window.app.idioma) {
                    Not.crearNotificacion('error', 'ERROR', "Error al iniciar la aplicación");
                } else {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_APLICACION'));
                }
            }
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
                    RT.actualizarEstadoUsuariosChat();
                    clearInterval(window.app.interval);
                    window.app.sesionExpired = true;
                    parent.location.hash = '';
                    window.location.reload();
                }
            }).fail(function (xhr) {
                if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    $("#center-pane").empty();
                } else {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_COMPROBAR_LA_SESION'), 4000);
                }
            });
            ;
        }
    }

    window.app.getDatosMensajeAdministracion = function ()
    {
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
        cache: true
    }).done(function (data) {
        window.app.avisoCierre = data;
    }).fail(function (xhr) {
        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER_EL_AVISO'), 4000);
    });

    window.app.obtenerConfigPlanta = function () {
        var self = this;
        self.tipos = {};

        // Obtenemos la configuracion de la planta
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
    }

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

    window.app.obtenerProductos = function () {
        var self = this;
        $.ajax({
            type: "GET",
            url: "../api/obtenerProductos",
            dataType: 'json',
            cache: false,
            async: false
        }).done(function (data) {
            self.productos = data;
        }).fail(function (xhr) {
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_PRODUCTOS'), 4000);
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
    }

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

    //Añade un tooltip al header de un grid
    window.app.headerGridTooltip = function (grid) {
        grid.thead.kendoTooltip({
            filter: "th",
            content: function (e) {
                var target = e.target; // element for which the tooltip is shown
                return $(target).text();
            }
        });
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
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ESTADO_PROGRAMADOR'), 4000);
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
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'Error al activar el log de los triggers', 4000);
        });
    }

    //Para comprobar si existen nuevas MMPP sin propiedades
    window.app.comprobarNuevasMMPPSinPropiedades = function () {
        $.ajax({
            type: "GET",
            url: "../api/planta/comprobarNuevasMMPPSinPropiedades",
            dataType: 'json',
            cache: false
        }).done(function (data) {
            window.app.planta.nuevasMMPPSinPropiedades = data;
            Backbone.trigger('eventComprobarNuevasMMPPSinPropiedades');
        }).fail(function (xhr) {
            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'Error al comprobar si hay nuevas MMPP sin propiedades', 4000);
        });
    }

    return window.app;
});