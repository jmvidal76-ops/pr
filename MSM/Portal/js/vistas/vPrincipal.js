define(['underscore',
        'backbone',
        'jquery',
        'colecciones/cMenu',
        'vistas/vMenuPrincipal',
        'vistas/vLogin',
        'vistas/vMenuLateral',
        'vistas/vPanelConfig',
        'compartido/realTime',
        'vistas/vChat',
        'vistas/vDialogoConfirm',
        'compartido/router',
        'compartido/utils'],
    function (_, Backbone, $, Menus, VistaMenus, VistaLogin, VistaMenuLateral, VistaConfig, RT, VistaChat, VistaDlgConfirm, Ruteador, Utils) {
        var Principal = Backbone.View.extend({
            panelConfig: null,
            ventanaLogin: null,
            menuPrincipal: null,
            ventanaChat: null,
            initialize: function () {
                // Eventos que escucha la vista principal
                Backbone.on('eventActSesion', this.actualizaDatosSesion, this);
                Backbone.on('eventSelMenu', this.muestraSubMenu, this);
                Backbone.on('eventCrearChat', this.crearPantallaChat, this);
                Backbone.on('eventComprobarUsuarioLogadoPortal', this.comprobarUsuarioLogado, this);
                Backbone.on('eventComprobarCargaPlanta', this.comprobarCargaPlanta, this);
                Backbone.on('eventComprobarNuevasMMPPSinPropiedades', this.comprobarNuevasMMPPSinPropiedades, this);
                Backbone.on('eventActualizarMensajeAdministracion', this.getMensajeAdministracion, this);
                //Comprobamos si el usuario esta logueado
                $("#top-pane").show();
                $("#bottom-pane").show();
                window.app.comprobarNuevasMMPPSinPropiedades();

                if (this.model) {
                    if (!this.model.get("validada")) {
                        this.ventanaLogin = new VistaLogin({ model: this.model, el: $("#dlgLogin") });
                    } else {
                        RT.iniciar();
                    }
                  
                }
               
                this.panelConfig = new VistaConfig({ el: "#config-pane" });
                this.render(this.model);
            },
            render: function () {
                $("#loader").hide();
                $(document).ready(function () {
                    $("#vertical").kendoSplitter({
                        orientation: "vertical",
                        panes: [
                            { collapsible: false, resizable: false, size: "65px", scrollable: false },
                            { collapsible: false },
                            { collapsible: false, resizable: false, size: "35px", scrollable: false }
                        ]
                    });

                    $("#horizontal").kendoSplitter({
                        panes: [
                            { collapsible: true, resizable: true, collapsed: true, size: "210px" },
                            { collapsible: false },
                            { collapsible: true, resizable: false, collapsed: true, size: "200px" }
                        ]
                    });
                });
                this.actualizaDatosSesion();

                // Nombre de la planta
                this.logoPlanta();

                return this;
            },
            logoPlanta: function () {
                if (window.app.planta) {
                    $("#lblNombrePlanta").html(String.format(window.app.idioma.t('PLANTA_HEADER'), window.app.planta.Descripcion.toUpperCase()));
                    $("#logo").attr("src", String.format(window.app.idioma.t('PLANTA_LOGO'), window.app.planta.Logo));
                    $("#favicon").attr("href", "data:,")
                }
            },
            actualiza: function () {
                if (this.ventanaLogin) this.ventanaLogin.render();
                if (this.panelConfig) this.panelConfig.render();

                var submenu = this.menus.collection.findWhere({ selected: true });

                if (submenu) {
                    this.muestraSubMenu(submenu);
                }

                this.cargaMenuPrincipal(this.model);

                // Nombre de la planta
                this.logoPlanta();

                // La llamada a render se encarga de propagar las modificaciones de configuración a las vistas hijas
                if (window.app.vista) window.app.vista.render();
            },
            events: {
                "click #btnConfig": "togglePanelConfig",
                "click #imgChat": "abrePantallaChat"
            },
            getMensajeAdministracion: function () {
                window.app.getDatosMensajeAdministracion();
            },
            actualizaDatosSesion: function () {
                var self = this;
                this.fechaHora = new Date(this.model.get("fechaSesion"));
                clearInterval(this.timer);
                this.timer = setInterval(function () { self.muestraReloj(self.fechaHora); }, 1000);
                if (this.model.get("validada")) {
            
                    window.app.ruteador = new Ruteador();
                    window.app.ruteador.cargarVistas("P");
                
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
                            // RT.desconectar();
                            //parent.location.hash = '';
                            //window.location.reload();


                            $.ajax({ // agomezn 030816: 2.2 de PowerPoint de Incidencias
                                type: "POST",
                                url: "../api/logout",
                                async : false,
                                success: function (e) {
                                    Backbone.history.navigate('#login', { replace: true, trigger: true });
                                    window.location.reload();
                                },
                                error: function (e) {
                                    //this.dlgConfirmacion.cancelar();
                                    //Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CERRAR_SESION'), 4000);
                                }
                            });
                            $.ajax({
                                url: "",
                                context: document.body,
                                success: function(s){
                                    $('html[manifest=saveappoffline.appcache]').attr('content','');
                                    $(this).html(s);
                                }
                            }); 


                        });
                    }

                    $("#lblUsuarioLogado").html(this.model.get("usuario"));
                    if (self.accesoAChat(this.model.get("usuario"))) {
                        $("#imgChat").show();
                    } else {
                        $("#imgChat").hide();
                    }
                    this.cargaMenuPrincipal(this.model);
               
                } else {
                    
                    $("#imgChat").hide();
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

                //fechaHora.setSeconds(fechaHora.getSeconds() + 1);

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

                $("#lblFechaHoraSistema").html(dia + "/" + mes + "/" + ano + " " + horas + ':' + minutos + ':' + segundos);
            },
            cargaMenuPrincipal: function () {
                var self = this;
                this.menuPrincipal = new Menus();
                this.menuPrincipal.fetch({
                    reset: true,
                    success: function (e) {
                        var submenu = null;
                        if (self.menus) {
                            submenu = self.menus.collection.findWhere({ selected: true });
                        }
                        self.menus = new VistaMenus({ collection: self.menuPrincipal, el: $("#menuPrincipal") });
                        if (submenu) {
                            submenu = self.menus.collection.findWhere({ texto: submenu.get('texto') })
                            submenu.set('selected', true);
                        }
                        self.comprobarNuevasMMPPSinPropiedades();
                    },
                    error: function (e) {
                        console.log('ERROR: al crear el menu principal');
                    }
                });
            },
            muestraSubMenu: function (menuSeleccionado) {
                var subMenu = menuSeleccionado.get("subMenus");
                var tituloMenu = menuSeleccionado.get("texto");
                //Llamada que desplegue el menu superior
                var splitter = $("#horizontal").data("kendoSplitter");
                splitter.expand(".k-pane:first");
                //Mostramos lista submenus
                var menuSecundario = new Menus(subMenu);
                var subMenu = new VistaMenuLateral({ collection: menuSecundario });
                //Rellenamos cabecera Menu Lateral
                $("#lblCabeceraMenu").html(window.app.idioma.t(tituloMenu).toUpperCase());
                this.comprobarNuevasMMPPSinPropiedades();
            },
            togglePanelConfig: function () {
                var splitter = $("#horizontal").data("kendoSplitter");
                splitter.toggle("#config-pane");
                if ($("#config-pane").data("pane").collapsed) $("#btnConfig").attr("src", "img/settings.png");
                else $("#btnConfig").attr("src", "img/close.png");
            },
            abrePantallaChat: function () {
                if (!this.ventanaChat) {
                    this.ventanaChat = new VistaChat();
                    this.ventanaChat.abrir();
                }
                else {
                    if (this.ventanaChat.dialog.options.visible) this.ventanaChat.cerrar();
                    else this.ventanaChat.abrir();
                }
                $("#imgChat").removeClass("parpadeo");
                $("#imgChat").attr("src", "img/chat.png");
            },
            comprobarCargaPlanta: function () {
                window.app.comprobarCargaPlanta();
            },
            crearPantallaChat: function () {
                if (!this.ventanaChat) {
                    this.ventanaChat = new VistaChat();
                }
            },
            comprobarNuevasMMPPSinPropiedades: function () {
                var texto = window.app.idioma.t('PROPIEDADES_MMPP_ENVASADO');    

                if (window.app.planta.nuevasMMPPSinPropiedades) {
                    $("#btnMenuPrincipal4").css("background-color", "#87CEEB");
                    $($('a:contains(' + texto + ')')[0]).css("background-color", "#87CEEB");
                } else {
                    $("#btnMenuPrincipal4").css("background-color", "#E9E9E9");
                    $($('a:contains(' + texto + ')')[0]).css("background-color", "");
                }
            },
        });
        return Principal;
    }
);