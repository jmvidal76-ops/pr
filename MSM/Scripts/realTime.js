// Fichero: realTime.js
// Descripción: Este modulo se encarga de la comunicación a traves de SignalR

define(['jquery',
    'backbone',
    'compartido/notificaciones',
    'vistas/vDialogoConfirm',
    'vistas/vDialogoInform'],
    function ($, Backbone, Not, VistaDlgConfirm, VistaDlgInform) {
        RT = {
            HUB: null,
            HUB_RM: null, // Hub para metricas en tiempo real
            retryCount: 0,
            maxRetries: 10,
            retryTimeout: 10000,
            limitReconections: true,
            iniciar: function () {
                var self = this;
                $.getScript("../../Scripts/jquery.signalR-2.2.0.min.js", function (a, b, c) {
                    $.getScript("../signalr/hubs", function (a, b, c) {
                        self.HUB = $.connection.mSMHub;
                        self.HUB_RM = $.connection.realMetrics;

                        self.HUB.client.aviso = function (p) {
                            Not.crearNotificacion('info', window.app.idioma.t('AVISO'), p, 4000);
                        };

                        self.HUB.client.estadoDatos = function (estadoOk) {
                            if (estadoOk) {
                                Not.quitarNotificacionDatosCargando();
                                Not.quitarNotificacionDatosNoOk();
                            }
                            else {
                                Not.quitarNotificacionDatosCargando();
                                // Not.crearNotificacion('DATOS_NO_OK', window.app.idioma.t('ERROR'), 'Los datos de planta no se han cargado correctamente, puede acceder a la aplicación pero los datos en tiempo real no son fiables, cuando un administrador solucione el problema este mensaje desaparecera', null);
                                Not.crearNotificacion('DATOS_NO_OK', window.app.idioma.t('ERROR'), 'Los datos de planta en tiempo real no son fiables porque no se han cargado correctamente, comuníquelo a un administrador', null); // agomezn 090616: 090 cambiar el texto del aviso de error de carga de planta a uno menos difuso
                            }
                        };

                        self.HUB.client.cargandoDatos = function (txt) {
                            Not.crearNotificacion('DATOS_CARGANDO', 'info', '<img src="img/ajax-loader.gif"/><div>' + window.app.idioma.t('CARGANDO_DATOS') + '</div>', null);
                        };

                        //**********************************************************
                        // NOTIFICACIONES EVENTOS ALT (CALIDAD)
                        //**********************************************************
                        self.HUB.client.notNewAltForm = function (idDepartmentType) {

                            Backbone.trigger('eventNotNewAltForm_type' + idDepartmentType);

                        }
                        self.HUB.client.checkALTForms = function () {

                            Backbone.trigger('eventCheckALTForms');

                        }

                        //**********************************************************
                        // NOTIFICACIONES EVENTOS AUTOMATICOS
                        //**********************************************************

                        // Cambios de estados de orden

                        self.HUB.client.notEstOrden = function (info, linea, numLinea) {
                            if (window.location.pathname.toLowerCase().indexOf("terminal") > 0) {
                                if (window.app.lineaSel && linea == window.app.lineaSel.id) {
                                    Not.crearNotificacion('info', 'Cambio de estado', info, 4000);
                                }
                            }
                            else {
                                if (info.indexOf("Zona") <= 0) {
                                    Not.crearNotificacion('info', 'Cambio de estado', info, 4000);
                                }
                            }
                            Backbone.trigger('eventNotificacionOrden') //Para las vistas del Portal y Videowall
                            Backbone.trigger('eventNotificacionOrden' + numLinea); //Para las vistas del Terminal
                            Backbone.trigger('eventComprobarOrdenActiva', numLinea); //Para las vistas del Terminal
                        }

                        // Cambios de estados de máquina

                        self.HUB.client.notEstMaquina = function (estado, info, linea, esLlenadora, numLinea) {
                            if (esLlenadora) {
                                if (estado == 'parada') {
                                    if (window.app.lineaSel) {
                                        if (linea == window.app.lineaSel.id) Not.crearNotificacion('error', 'Máquina Parada', info, 4000);
                                    }
                                    //else {
                                    //    Not.crearNotificacion('error', 'Máquina Parada', info, 4000);
                                    //}
                                }
                                else if (estado == 'produccion') {
                                    if (window.app.lineaSel) {
                                        if (linea == window.app.lineaSel.id) Not.crearNotificacion('success', 'Máquina en Marcha', info, 4000);
                                    }// else {
                                    //    Not.crearNotificacion('success', 'Máquina Produciendo', info, 4000);
                                    //}
                                }
                                Backbone.trigger('eventNotificacionMaquina' + numLinea);
                                //Backbone.trigger('eventNotificacionCuadroMandoVideowall');
                            } else {
                                Backbone.trigger('eventNotificacionMaquinas' + numLinea);
                            }

                        }

                        function normalizeKeys(obj) {
                            let normalizedObj = {};
                            Object.keys(obj).forEach(key => {
                                normalizedObj[key.toLowerCase()] = obj[key];
                            });
                            return normalizedObj;
                        }

                        self.HUB.client.notCambiosEstadoMaquina = function (cambiosEstados) {

                            let cambiosEstadosNormalized = normalizeKeys(cambiosEstados);
                            $.each(cambiosEstadosNormalized?.llenadoras, function (index, llenadora) {
                                if (llenadora.estadoMaquina == 'parada') {
                                    if (window.app.lineaSel) {
                                        if (llenadora.numLinea == window.app.lineaSel.numLinea) Not.crearNotificacion('error', 'Máquina Parada', llenadora.nombreMaquina, 4000);
                                    }
                                }
                                else if (llenadora.estadoMaquina == 'produccion') {
                                    if (window.app.lineaSel) {
                                        if (llenadora.numLinea == window.app.lineaSel.numLinea) Not.crearNotificacion('success', 'Máquina en Marcha', llenadora.nombreMaquina, 4000);
                                    }
                                }
                            });

                            $.each(cambiosEstadosNormalized?.lineas, function (index, numLinea) {
                                Backbone.trigger('eventNotificacionMaquina' + numLinea);
                                // Backbone.trigger('eventNotificacionCuadroMandoVideowall');
                            });
                        }

                        // Cambios de estados de turno

                        self.HUB.client.notTurnos = function (info) {
                            if (window.location.pathname.toLowerCase().indexOf("videowal") == -1) {
                                Not.crearNotificacion('info', 'Cambios de turno', info, 4000);
                                window.app.cargarTurnos();
                                Backbone.trigger('eventNotificacionTurno');
                            }
                        }

                        self.HUB.client.notActualizarListadoWOFAB = function () {
                            Backbone.trigger('eventActualizarListadoWOFAB');
                        }

                        // Actualizaciones de produccion de turno

                        //self.HUB.client.notProdTurno = function () {
                        //    Backbone.trigger('eventActProdTurno');
                        //}

                        // Actualizaciones de produccion de orden

                        //self.HUB.client.notProdOrden = function () {
                        //    Backbone.trigger('eventActProdOrden');
                        //}

                        // Actualizaciones de produccion
                        self.HUB.client.notProd = function () {
                            Backbone.trigger('eventActProd');
                        }

                        self.HUB.client.notPlanificacionOrden = function (numLinea, idOrden) {
                            self.HUB.server.actualizarPlanificacionOrden(numLinea, idOrden);
                            Backbone.trigger('eventActPlanificacionOrden');
                        }

                        self.HUB.client.notOrdenEditada = function () {
                            Backbone.trigger('eventNotOrdenEditada', true);
                        }

                        //Actualizaciones usuarios conectados chat
                        self.HUB.client.actualizarUsuariosChat = function (info, linea) {
                            if (window.location.pathname.toLowerCase().indexOf("videowal") == -1) { // agomezn 040716: 039 Visualización del cuadro de mando en Videowall, se producía un error al no tener ventana de chat el videowall de supervisor
                                if (window.app.vistaPrincipal.ventanaChat) {
                                    Backbone.trigger('eventActualizarUsuarios');
                                }
                            }
                        }

                        self.HUB.client.actualizarMensajeAdministracion = function () {
                            Backbone.trigger('eventActualizarMensajeAdministracion');
                        }

                        //Comprobamos Usuario Logado, para volver al login en portal si se hace un logout desde terminal y viceversa
                        self.HUB.client.comprobarUsuarioLogado = function (info, linea) {
                            if (window.location.pathname.toLowerCase().indexOf("terminal") > 0) {
                                Backbone.trigger('eventComprobarUsuarioLogadoTerminal');
                            } else {
                                Backbone.trigger('eventComprobarUsuarioLogadoPortal');
                            }
                        }

                        //Cerramos sesion usuario
                        self.HUB.client.cerrarSesionUsuarios = function () {
                            Backbone.trigger('cerrarSesionUsuario');
                        }

                        //Actualizaciones Videowall
                        self.HUB.client.notVideowall = function () {
                            Backbone.trigger('eventActVideowall');
                        }

                        self.HUB.client.eventFinalizarDescargaTerminal = function () {
                            Backbone.trigger('eventRefreshColaCamionesTerminal');
                        }

                        self.HUB.client.eventFinalizarDescargaPortal = function () {
                            Backbone.trigger('eventRefreshColaCamiones', true);
                        }

                        self.HUB.client.expSecuenciadorIniciada = function () {
                            Backbone.trigger('expSecuenciadorIniciada');
                        }
                        self.HUB.client.expSecuenciadorProgreso = function (data) {
                            Backbone.trigger('expSecuenciadorProgreso', data);
                        }
                        self.HUB.client.expSecuenciadorFinalizada = function (result) {
                            Backbone.trigger('expSecuenciadorFinalizada', result);
                        }

                        self.HUB.client.actualizarCamionesTransito = function (data) {
                            Backbone.trigger('actualizarCamionesTransito', data);
                        }

                        self.HUB.client.eventCambioPuestoGlobal = function (data) {
                            Backbone.trigger('eventCambioPuestoGlobal', data);
                        }

                        self.HUB.client.notDuotank = function () {
                            Backbone.trigger('eventActDuotank');
                        }

                        self.HUB.client.notAdherenciaMotivos = function () {
                            Backbone.trigger('eventActAdherenciaMotivos');
                        }

                        //**********************************************************
                        // NOTIFICACIONES ACTUALIZACIONES DE APP WEB
                        //**********************************************************

                        self.HUB.client.notUpdate = function (tipo, msg, time) {
                            Not.crearNotificacion(tipo, 'Atención', msg, time);
                        }

                        self.HUB.client.asklogoff = function (mensaje) {
                            if (window.app.sesion && window.app.sesion.get("validada")) {
                                this.dlgConfirmacion = new VistaDlgConfirm({
                                    titulo: window.app.idioma.t('TIT_CONFIRMAR_ACCION'),
                                    msg: (mensaje + "<br/>" + window.app.idioma.t('MSG_CERRAR_SESION')),
                                    funcion: function () {
                                        $.ajax({
                                            type: "POST",
                                            url: "../api/logout",
                                            success: function (e) {
                                                window.removeEventListener("beforeunload", window.app.confirmarCierre);
                                                Backbone.history.navigate('#login', { replace: true, trigger: true });
                                                window.location.reload();
                                            },
                                            error: function (e) {
                                                this.dlgConfirmacion.cancelar();
                                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CERRAR_SESION'), 4000);
                                            }
                                        });
                                    }
                                });
                            }
                        };

                        self.HUB.client.logoff = function (mensaje, timeout) {
                            Not.crearNotificacion('error', 'Aviso de reinicio', mensaje + "<br/>Tiempo para el reinicio: " + timeout + window.app.idioma.t('_SEGUNDOS'), null);
                            setTimeout(function () {
                                $.ajax({
                                    type: "POST",
                                    url: "../api/logout",
                                    success: function (e) {
                                        window.removeEventListener("beforeunload", window.app.confirmarCierre);
                                        Backbone.history.navigate('#login', { replace: true, trigger: true });
                                        window.location.reload();
                                    },
                                    error: function (e) {
                                        this.dlgConfirmacion.cancelar();
                                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CERRAR_SESION'), 4000);
                                    }
                                });
                            }, timeout * 1000);

                        };

                        self.HUB.client.recibirMsg = function (msg, usuario, guidtab, idmessage) {
                            if (window.app.vistaPrincipal.ventanaChat) {
                                if (window.app.vistaPrincipal.ventanaChat.dialog.element.is(":hidden")) {
                                    $("#imgChat").addClass("parpadeo");
                                    $("#imgChat").attr("src", "img/chat2.png");
                                }
                            }
                            else {
                                $("#imgChat").addClass("parpadeo");
                                $("#imgChat").attr("src", "img/chat2.png");
                                Backbone.trigger('eventCrearChat');
                            };
                            window.app.vistaPrincipal.ventanaChat.recibirMsg(msg, usuario, guidtab, idmessage);
                            return true;
                        };


                        // Llenadora llega a produccion estimada

                        self.HUB.client.llenadoraTermina = function (info, linea, ord) {
                            if (window.location.pathname.toLowerCase().indexOf("terminal") > -1) {
                                if (window.app.lineaSel && linea == window.app.lineaSel.numLinea) {
                                    if (window.app.zonaSel.esLlenadora) {
                                        this.dlgInformacion = new VistaDlgInform({
                                            titulo: "Aviso llenadora.",
                                            msg: (window.app.idioma.t('LA_LLENADORA_LLEGÓ')),
                                        });
                                        self.HUB.server.actualizarAvisoLlenadora(linea, ord);
                                    }
                                }
                            }
                        }

                        // Metodos de metricas tiempo real
                        self.HUB_RM.client.metricasRealTime = function (metricaId, metricaValor) {
                            Backbone.trigger('metricasRealTime', { metricaId, metricaValor });
                        }

                        $.connection.hub.disconnected(async function () {
                            //$.connection.hub.start();
                            const hub = $.connection.hub
                            //iniciarHub($.connection.hub);

                            if (self.retryCount < self.maxRetries || !self.limitReconections) {
                                setTimeout(async () => {
                                    self.retryCount++;
                                    try {
                                        await hub.start();
                                        self.retryCount = 0;
                                    }
                                    catch (err) {
                                    }
                                }, self.retryTimeout)
                            } else {
                                await hub.stop();
                                console.log("SignalR: Maximos reintentos alcanzados, conexion cerrada.");
                            }
                        });

                        $.connection.hub.reconnecting(error => {
                            $.connection.hub.reconnectDelay = 4000;

                            console.log(`SignalR: Conexion perdida. Reconectando`);
                        });


                        //iniciarHub($.connection.hub);

                        $.connection.hub.start().done(function () {
                            self.retryCount = 0;
                            //notifications.server.prueba();
                        }).fail(function (e) {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CONEXION_SERVER') + ': ' + e, 4000);
                        });

                    });
                });
            },
            enviarMsg: function (txtMsg, usuario, usuarioDest, guidtab) {
                var self = this;
                if (self.HUB.connection.state != 1) {
                    self.HUB.connection.start().done(function () {
                        self.HUB.server.enviarMsg(txtMsg, usuario, usuarioDest, guidtab);
                    }).fail(function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CONEXION_SERVER') + ': ' + e, 4000);
                    });;
                } else {
                    self.HUB.server.enviarMsg(txtMsg, usuario, usuarioDest, guidtab);
                }
            },
            confirmarRecepccion: function (usuario, idmessage) {
                var self = this;
                if (self.HUB.connection.state != 1) {
                    self.HUB.connection.start().done(function () {
                        self.HUB.server.confirmarRecepccion(usuario, idmessage);
                    }).fail(function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CONEXION_SERVER') + ': ' + e, 4000);
                    });;
                } else {
                    self.HUB.server.confirmarRecepccion(usuario, idmessage);
                }
            },
            desconectar: function () {
                if ((this.HUB != null) && (typeof this.HUB != "undefined")) { // agomezn 090816: produce errores continuos "No se puede obtener la propiedad 'server' de referencia nula o sin definir"
                    this.HUB.server.desconectar();
                }
            },
            actualizarEstadoUsuariosChat: function () {
                var self = this;
                if ($.connection.hub.state != 1) {
                    $.connection.hub.start().done(function () {
                        self.HUB.server.actualizarEstadoUsuariosChat();
                    }).fail(function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CONEXION_SERVER') + ': ' + e, 4000);
                    });;
                } else {
                    self.HUB.server.actualizarEstadoUsuariosChat();
                }
            }



        }

        return RT;
    });
