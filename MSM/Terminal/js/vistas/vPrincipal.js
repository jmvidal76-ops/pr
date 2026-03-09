define(['underscore', 'backbone', 'jquery', 'colecciones/cMenu', 'vistas/vMenuPrincipal', 'vistas/vLogin', 'vistas/vPanelConfig',
    'vistas/vChat', 'compartido/notificaciones', 'compartido/KeyboardSettings', 'compartido/router', 'compartido/realTime',],
    function (_, Backbone, $, Menus, VistaMenus, VistaLogin, VistaConfig, VistaChat, Not, KeyboardSettings, Ruteador,RT) {
        var Principal = Backbone.View.extend({
            ventanaLogin: null,
            ventanaChat: null,
            panelConfig: null,
            menuPrincipal: null,
            cargandoTurno: false,
            turnoActual: null,
            timerTurno: null,
            initialize: function () {
                let self = this;
                // Eventos que escucha la vista principal
                Backbone.on('eventActSesion', this.actualizaDatosSesion, this);
                Backbone.on('eventcambioPuesto', () => { self.turnoActual = null; self.ComprobarTurnoActual() }, this);
                Backbone.on('eventSelMenu', this.muestraSubMenu, this);
                Backbone.on('eventActualizaPie', this.actualizaPie, this);
                Backbone.on('eventComprobarOrdenActiva', this.comprobarOrdenActivaCambioOrden, this);
                Backbone.on('eventCrearChat', this.crearPantallaChat, this);
                Backbone.on('eventActualizaLineaZona', this.actualizaLineaZona, this);
                Backbone.on('eventComprobarUsuarioLogadoTerminal', this.comprobarUsuarioLogado, this);
                Backbone.on('eventCheckALTForms', this.eventCheckALTForms, this);
                Backbone.on('eventComprobarCargaPlanta', this.comprobarCargaPlanta, this);
                Backbone.on('eventActualizarMensajeAdministracion', this.getMensajeAdministracion, this);
                
                $("#loader").hide();
                $("#panel").show();

                if (this.model) {
                    if (!this.model.get("validada") || (this.model.get("validada") && !this.model.get("linea") && !this.model.get("zona"))) {
                        this.ventanaLogin = new VistaLogin({ model: this.model, esLogin: true });
                    } else {
                        RT.iniciar();
                    }
                }

                this.panelConfig = new VistaConfig();
                this.render();

                $("body").keydown(function (event) {
                    if (event.ctrlKey && (event.keyCode == 37 || event.keyCode == 39)) {
                        var self = this;
                        if (window.app.lineaSel && window.app.zonaSel) {
                            var sesion = window.app.sesion;

                            var zonaCalcula = window.app.zonaSel.numZona;
                            if (event.keyCode == 39) zonaCalcula++;
                            else zonaCalcula--;
                            var cambia = false;
                            if (zonaCalcula >= 0 && zonaCalcula < window.app.lineaSel.zonas.length) {
                                cambia = true;
                                sesion.set("zona", window.app.lineaSel.zonas[zonaCalcula]);
                                sesion.set("pdv", window.app.pdvSel);
                                sesion.set("pdvSEO", window.app.pdvSEOSel);
                            }

                            if (cambia) {
                                kendo.ui.progress($("#listado"), true);

                                $.ajax({
                                    data: JSON.stringify(sesion),
                                    type: "POST",
                                    async: false,
                                    url: "../api/cambioPuesto",
                                    contentType: "application/json; charset=utf-8",
                                    dataType: "json",
                                    success: function (data) {
                                        //Not.crearNotificacion('success', 'Aviso Cambio Linea y Zona', window.app.idioma.t('CAMBIO_DE_PUESTO'), 1500);
                                        Backbone.trigger('eventActualizaPie');
                                        Backbone.trigger('eventcambioPuesto');
                                        if (window.app.vista && window.app.vista.actualiza) {
                                            window.app.vista.actualiza(null, true);
                                        }
                                    },
                                    error: function (e) {
                                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('SE_HA_PRODUCIDO') + self.model.get("usuario") + window.app.idioma.t('INTENTABA_CAMBIAR_DE'), 4000);
                                        kendo.ui.progress($("#listado"), false);
                                    }
                                });
                            }
                            else {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_HAY_MAS'), 1500);
                            }
                        }

                        event.preventDefault();
                    }
                });

                // Iniciamos temporizador para controlar el turno actual
                clearInterval(self.timerTurno);
                self.ComprobarTurnoActual(),
                self.timerTurno = setInterval(function () {
                    self.ComprobarTurnoActual();
                }, 60000);
            },
            getMensajeAdministracion: function () {
                window.app.getDatosMensajeAdministracion();
            },
            render: function () {
                $("#panel").kendoSplitter({
                    orientation: "horizontal",
                    panes:
                    [
                        { collapsible: false },
                        { collapsible: true, resizable: false, collapsed: true, size: "250px" }
                    ]
                });
                $("#btnCerrarMenuSec").text(window.app.idioma.t('CERRAR'));
                $("#btnCerrarMenuSec").kendoButton({ imageUrl: "img/back.png" });
                $("#imgReloj").show();

                $("#divMenuSecundario").slideUp({ duration: 50, queue: false, opacity: "toggle" });

                this.actualizaDatosSesion();

                $('.keyboardOn').addClass("ui-keyboard-input ui-widget-content ui-corner-all");
                // Si esta marcada la opción de utilizar el teclado en pantalla lo habilitamos para los controles tipo input text
                KeyboardSettings.Load();

                // Nombre de la planta
                this.logoPlanta();
                
                return this;
            },
            logoPlanta: function () {
                if (window.app.planta) {
                    $("#lblNombrePlanta").html(String.format(window.app.idioma.t('PLANTA_HEADER'), window.app.planta.Descripcion.toUpperCase()));
                    $("#logo").attr("src", String.format(window.app.idioma.t('PLANTA_LOGO'), window.app.planta.Logo));
                    $("#favicon").attr("href", "data:,");
                    $(".navbar-header").css('margin-top', '10px');
                }
            },
            actualiza: function () {
                if (this.ventanaLogin) this.ventanaLogin.render();
                if (this.panelConfig) this.panelConfig.render();
                this.cargaMenuPrincipal(this.model);
                // Nombre de la planta
                this.logoPlanta();
                // La llamada a actualiza de encarga de propagar las modificaciones de configuración a las vistas hijas
                // Todas las vistas deben tener una función "actualiza" que como minimo debe tener la llamada a su función render
                if (window.app.vista) {
                    if (window.app.vista.actualizaRender != undefined) {
                        window.app.vista.actualizaRender();
                    } else {
                        window.app.vista.actualiza();
                    }                    
                }
                // Si esta marcada la opción de utilizar el teclado en pantalla lo habilitamos para los controles tipo input text
                if (localStorage.getItem("tecladoVirtual") == "true") {
                    $('.keyboardOn').addClass("ui-keyboard-input ui-widget-content ui-corner-all");
                    if (localStorage.getItem("idiomaSeleccionado") == "en-GB") {
                        $('.keyboardOn').keyboard();
                    } else {
                        $('.keyboardOn').keyboard({ layout: 'spanish-qwerty' });
                    }
                }
            },
            events: {
                "click #btnConfig": "togglePanelConfig",
                "click #btnCerrarMenuSec": "cierraSubMenu",
                "click #imgChat": "abrePantallaChat"
            },
            actualizaPie: function () {
                if (this.model.get("linea") && this.model.get("zona")) {
                    $("#imgLineaZona").show();
                    var linea = this.model.get("linea");
                    $("#lblLineaZona").html(window.app.idioma.t('LINEA') + ' ' + linea.numLineaDescripcion + " - " + linea.descripcion + " | Zona " + this.model.get("zona").descripcion);

                    window.app.lineaSel = this.model.get("linea");
                    window.app.zonaSel = this.model.get("zona");
                    window.app.pdvSel = this.model.get("pdv");
                    window.app.pdvSEOSel = this.model.get("pdvSEO");

                    this.comprobarOrdenActiva();
                }
            },
            //ALT evento para detectar nuevos formularios
            eventCheckALTForms: function () {
                var filterData = {
                    idDepartmentType: 0, //miramos si hay alguno pendiente de CEL (Calidad)
                    inicio: null,
                    formID: null,
                    idLoc: window.app.pdvSel,
                    statusPendiente: true,
                    statusFinalizado:false
                };

                if (window.app.pdvSel) {
                    $.ajax({
                        type: "POST",                        
                        url: "../api/checkNumberPendientesByLoc/",
                        data: JSON.stringify(filterData),
                        async: false,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (numberRegisters) {
                            if (numberRegisters > 0) {
                                $("#btnMenuPrincipal6").css("background-color", "blue");
                                $("#btnMenuPrincipal6").css("color", "black");
                            } else {
                                $("#btnMenuPrincipal6").css("background-color", "#e9e9e9");
                                $("#btnMenuPrincipal6").css("color", "#777");
                            }
                        },
                        error: function (e) {
                        }
                    });
                }

                if (window.app.pdvSEOSel) {
                    filterData.idLoc = window.app.pdvSEOSel;
                    $.ajax({
                        type: "POST",
                        url: "../api/checkNumberPendientesByLoc/",
                        data: JSON.stringify(filterData),
                        async: false,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (numberRegisters) {
                            if (numberRegisters > 0) {
                                $("#btnMenuPrincipal147").css("background-color", "blue");
                                $("#btnMenuPrincipal147").css("color", "black");
                            } else {
                                $("#btnMenuPrincipal147").css("background-color", "#e9e9e9");
                                $("#btnMenuPrincipal147").css("color", "#777");
                            }
                        },
                        error: function (e) {
                        }
                    });
                }
            }, 
            actualizaLineaZona: function () {
                this.model.set("linea", window.app.sesion.get("linea"));
                this.model.set("zona", window.app.sesion.get("zona"));
                this.model.set("pdv", window.app.sesion.get("pdv"));
                this.model.set("pdvSEO", window.app.sesion.get("pdvSEO"));
                
                if (this.model.get("linea") && this.model.get("zona")) {
                    window.app.lineaSel = this.model.get("linea");
                    window.app.zonaSel = this.model.get("zona");
                    window.app.pdvSel = this.model.get("pdv");
                    window.app.pdvSEOSel = this.model.get("pdvSEO");
                }
            },
            actualizaDatosSesion: function () {
                var self = this;
                this.fechaHora = new Date(this.model.get("fechaSesion"));
                clearInterval(this.timer);
                this.timer = setInterval(function () { self.muestraReloj(self.fechaHora); }, 1000);

                if (this.model.get("validada")) {
                    window.app.ruteador = new Ruteador();
                    window.app.ruteador.cargarVistas("T");

                    this.ventanaLogin = null;

                    //Aviso de cierre
                    if (window.app.avisoCierre) {
                        window.app.confirmarCierre = function (e) {
                            if (window.app.avisoCierre && !window.app.sesionExpired) {
                                e = e || window.event;
                                if (e) e.returnValue = 'Esto hará que se cierre su sesion y tenga que volver a introducir los credenciales.';
                                return e.returnValue;
                            }
                        };

                        window.addEventListener("beforeunload", window.app.confirmarCierre);

                        $(window).on('unload', function () {
                            $.ajax({
                                type: "POST",
                                url: "../api/logout",
                                success: function (e) {
                                    Backbone.history.navigate('#login', { replace: true, trigger: true });
                                    window.location.reload();
                                },
                                error: function (e) {
                                }
                            });
                            $.ajax({
                                url: "",
                                context: document.body,
                                success: function (s) {
                                    $('html[manifest=saveappoffline.appcache]').attr('content', '');
                                    $(this).html(s);
                                }
                            });
                        });
                    }

                    $("#imgUsuario").show();
                    $("#lblUsuario").html(this.model.get("usuario"));
                    $("#lblEstadoDatos").show();
                    $("#imgDatosOK").show();

                    if (self.accesoAChat(this.model.get("usuario"))) {
                        $("#imgChat").show();
                    } else {
                        $("#imgChat").hide();
                    }

                    this.actualizaPie();
                    this.cargaMenuPrincipal(this.model);
                    self.turnoActual = null;
                    self.ComprobarTurnoActual();
                }
            },
            accesoAChat: function () {
                var acceso = false;
                acceso = $.map(window.app.sesion.attributes.funciones, function (funcion, index) {
                    if (funcion.codigo == 'UC_GEN_TT_4_Chat') {
                        return true;
                    }
                })[0];

                return acceso;
            },
            comprobarUsuarioLogado: function () {
                $.ajax({
                    type: "GET",
                    async: false,
                    url: "../api/ComprobarUsuarioLogado/" + this.model.get("usuario") + "/",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {

                    },
                    error: function (response) {

                    }
                });
            },
            fechaHora: null,
            timer: null,
            muestraReloj: function (fechaHora) {
                fechaHora = new Date();

                var dia = fechaHora.getDate();
                var mes = fechaHora.getMonth() + 1;
                var ano = fechaHora.getFullYear();
                var horas = fechaHora.getHours();
                var minutos = fechaHora.getMinutes();
                var segundos = fechaHora.getSeconds();

                if (dia < 10) { dia = '0' + dia; }
                if (mes < 10) { mes = '0' + mes; }
                if (horas < 10) { horas = '0' + horas; }
                if (minutos < 10) { minutos = '0' + minutos; }
                if (segundos < 10) { segundos = '0' + segundos; }

                $("#lblFecHoraSistema").html(dia + "/" + mes + "/" + ano + " " + horas + ':' + minutos + ':' + segundos);
            },
            cargaMenuPrincipal: function () {
                var self = this;
                this.menuPrincipal = new Menus();
                this.menuPrincipal.fetch({
                    reset: true,
                    success: function (e) {
                        this.menus = new VistaMenus({ collection: self.menuPrincipal, el: $("#menuPrincipal") });
                    },
                    error: function (e) {
                        console.log('ERROR: al crear el menu principal');
                    }
                });
            },
            muestraSubMenu: function (subMenu) {
                $("#divMenuSecundario").slideDown({ duration: 50, queue: false, opacity: "toggle" });
                var menuSecundario = new Menus(subMenu);
                var subMenu = new VistaMenus({ collection: menuSecundario, el: $("#menuSecundario") });
            },
            cierraSubMenu: function (subMenu) {
                $("#divMenuSecundario").slideUp({ duration: 50, queue: false, opacity: "toggle" });
            },
            togglePanelConfig: function () {
                this.panelConfig.mostrar();
                if ($("#btnConfig").attr("src") == "img/close.png") $("#btnConfig").attr("src", "img/settings.png");
                else $("#btnConfig").attr("src", "img/close.png");
            },
            abrePantallaChat: function () {
                if (!this.ventanaChat) {
                    this.ventanaChat = new VistaChat();
                    this.ventanaChat.abrir();
                } else {
                    if (this.ventanaChat.dialog.options.visible) this.ventanaChat.cerrar();
                    else this.ventanaChat.abrir();
                }
                $("#imgChat").removeClass("parpadeo");
                $("#imgChat").attr("src", "img/chat.png");
            },
            crearPantallaChat: function () {
                if (!this.ventanaChat) {
                    this.ventanaChat = new VistaChat();
                }
            },
            comprobarOrdenActivaCambioOrden: function (linea) {
                var self = this;
                if (window.app.lineaSel && window.app.lineaSel.numLinea == linea) {
                    self.comprobarOrdenActiva();
                }
            },
            comprobarCargaPlanta: function () {
                window.app.comprobarCargaPlanta();
            },
            comprobarOrdenActiva: function () {
                $.ajax({
                    type: "GET",
                    async: true,
                    url: "../api/ordenes/comprobarOrdenActiva/",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (orden) {
                        if (orden) {
                            Not.quitarNotificacionOrden();
                        } else {
                            Not.crearNotificacion('SINORDEN', window.app.idioma.t('AVISO'), '<img src="img/AvisoOrden.png" style="width:60px;height:60px"/><span style="font-size:24px;">' + window.app.idioma.t('LA_ZONA_NO') + '</span>', null);
                        }
                    },
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_COMPROBAR_LA'), 4000);
                    },
                    complete: function () {
                        if ($(".cerrarAviso").length == 0) {
                            $('body > div.ui-pnotify.stack-bottomright.sinOrden > div > h4').append("<span class='glyphicon glyphicon-remove cerrarAviso' style='float: right'></span>");
                        }

                        $(".cerrarAviso").click(function (e) {
                            Not.quitarNotificacionOrden();
                        });
                    }
                });
            },
            ComprobarTurnoActual: async function () {
                let self = this;

                // Se ejecuta cada X tiempo (1 min) y guarda el turno en el que nos encontramos. En caso de que se pase la hora lo actualiza al nuevo turno
                // Cuando quede poco tiempo para el cierre del turno mostrará un indicar luminoso en el botón de mermas
                let now = new Date();
                if (self.turnoActual == null || new Date(self.turnoActual.FechaFin).getTime() < now.getTime()) {
                    // tenemos que actualizar el turno
                    try
                    {
                        self.cargandoTurno = true;
                        self.turnoActual = await self.ObtenerTurnoActual();
                        self.cargandoTurno = false;

                        Backbone.trigger('eventCambioTurnoActual');
                    }
                    catch (ex) {
                        console.log("Error obteniendo el turno actual ")
                        console.log(ex);
                        self.turnoActual = null;
                    }
                }

                if (self.turnoActual != null) {

                    // Comprobamos si queda poco tiempo para acabar el turno
                    let tiempoMargen = 10; //minutos hasta que se acabe el turno para resaltar mermas
                    if (new Date(now.getTime() + tiempoMargen * 60000).getTime() >= new Date(self.turnoActual.FechaFin).getTime()) {
                        $("#btnMenuPrincipal234").css("background-color", "orange");
                        $("#btnMenuPrincipal234").css("color", "black");
                    } else {
                        $("#btnMenuPrincipal234").css("background-color", "#e9e9e9");
                        $("#btnMenuPrincipal234").css("color", "#777");
                    }
                }
            },
            ObtenerTurnoActual: async function () {
                return new Promise((resolve, reject) => {
                    if (window.app.lineaSel == null) {
                        resolve(null);
                        return;
                    }
                    let linea = window.app.lineaSel.id;
                    let fecha = new Date();

                    $.ajax({
                        type: "GET",
                        url: `../api/turnos/breaks?idLinea=${linea}&fechaActual=${fecha.toISOString()}`,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            let turnoActual;
                            if (res.length > 0) {
                                turnoActual = res[0];
                            }                           

                            resolve(turnoActual);
                        },
                        error: function (e) {
                            reject(e);
                        }
                    });
                })
            }
        });

        return Principal;
    }
);