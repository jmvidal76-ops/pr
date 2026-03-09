define(['underscore', 'backbone', 'jquery', 'compartido/realTime', 'compartido/notificaciones', 'kendo', '../../../../Portal/js/constantes', "vistas/vFecha", "vistas/vOEE",
    "vistas/vDiaJuliano", "vistas/vCuadroMando", "vistas/vWO", "vistas/vProducto", "vistas/vAccidente", "vistas/vEvacuacion", "vistas/vCuadroMandoLinea",
    "vistas/vRendimientoTurnos", "vistas/vOEEDiaMes", "vistas/vFechaCaducidad"],
    function (_, Backbone, $, RT, Not, kendo, enums, VistaFecha, VistaOEE, VistaDiaJuliano, VistaCuadroMando, VistaWO, VistaProducto,
        VistaAccidente, VistaEvacuacion, VistaCuadroMandoLinea, VistaRendimientoTurnos, VistaOEEDiaMes, VistaFechaCaducidad) {
        var VideoWall = Backbone.View.extend({
            tagName: 'div',
            id: 'carrusel',
            indiceVistaActual: 0,
            msCambio: 5000,
            idLineaSeleccionada: 0,
            maxLineas: 5,
            numPaginaActual: 1,
            numVuelta: 1,
            numIndice: 0,
            numPantallasCargadas: 0,
            enumPantallas: enums.PantallasVideowall(),  //añadir al enumerado las nuevas pantallas
            numPantallas: 0,
            vistasCarrusel: [],
            numCarrusel: [],
            pantallas: [],
            topCuadroMando: null,
            hayAviso: false,
            timerControl: null,
            initialize: function (options) {
                var self = this;
                Backbone.on('eventActVideowall', this.actualiza, this);
                self.pantallaSel = null;
                self.options = options.options;
                self.numPantallas = Object.keys(self.enumPantallas).length;

                this.idioma = self.options && self.options.idioma ? options.idioma : 'es-ES';
                kendo.culture(this.idioma);

                //aplicamos opciones de configuración
                if (self.options) {
                    if (self.options.color) {
                        var isHex = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test('#' + self.options.color)
                        if (isHex) {
                            $(self.el).css('color', "#" + self.options.color);
                        } else {
                            $(self.el).css('color', self.options.color);
                        }
                    }
                    if (self.options.bg) {
                        var isHex = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test('#' + self.options.bg)
                        if (isHex) {
                            $(self.el).css('background-color', "#" + self.options.bg);
                        } else {
                            $(self.el).css('background-color', self.options.bg);
                        }
                    }
                }

                // agomez 280616: 039 Visualización del cuadro de mando en Videowall, retomado, se mostrará sólo el cuadro de mando en caso de que indique "?supervisor" al final de la URL
                var soloCuadroMando = false;
                if (window.location.href.indexOf("supervisor") > -1) {
                    soloCuadroMando = true;
                }

                if (!soloCuadroMando) {
                    $.ajax({
                        type: "GET",
                        url: "../api/videowall/obtenerPantallasVideowall/",
                        dataType: 'json',
                        cache: false,
                        async: false
                    }).done(function (data) {
                        self.pantallas = data;
                    }).fail(function (xhr) {
                        if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_PANTALLAS'), 2000);
                        }
                    });

                    if (self.options && self.options.pantalla) {
                        pantallasSel = jQuery.grep(self.pantallas, function (pantalla, i) {
                            return pantalla.CodigoPantalla == self.options.pantalla;
                        });

                        if (pantallasSel.length > 0) {
                            self.pantallaSel = pantallasSel[0];
                            self.cargarVistas();
                        } else {
                            self.cargarComboPantallas();
                        }
                    } else {
                        self.cargarComboPantallas();
                    }
                } else { // Si introdujo "?supervisor" al final de la URL, sólo se muestra el cuadro de mando
                    self.cargarSupervisor();
                }
            },
            setPantalla: function (pantalla) {
                var self = this;
                self.options.pantalla = pantalla.CodigoPantalla;
            },
            actualiza: async function () {
                let self = window.app.videowall;

                // Si el servidor está caído esta función falla y se bloquea el videowall
                // antes de recargar la página comprobamos que el servidor está activo

                let servidorActivo =  await self.checkServer();

                if (servidorActivo) {

                    var queryString = undefined;
                    $.each(self.options, function (index, obj) {
                        var key = index;
                        var value = obj;
                        if (queryString) {
                            queryString += value ? "&" + key + "=" + value : "&" + key;
                        } else {
                            queryString = value ? "?" + key + "=" + value : "?" + key;
                        }
                    });
                    window.localStorage.clear();
                    window.location.href = window.location.protocol + "//" + window.location.host + window.location.pathname + queryString;
                }
            },
            checkServer: async function () {
                let self = window.app.videowall;

                return new Promise((resolve) => {
                    fetch("../api/General/ping/")
                        .then(response => {
                            clearInterval(self.timerControl);
                            self.timerControl = null;
                            resolve(true);
                        })
                        .catch(_ => serverInactive());

                    function serverInactive() {
                        // El servidor no responde. Programamos un temporizador para que cuando vuelva a estar activo se actualice
                        if (self.timerControl == null) {
                            self.timerControl = setInterval(self.actualiza, 1500);
                            $("body").append("<div class='reloading_videowall'>" + window.app.idioma.t("RECARGANDO_VIDEOWALL") + "</div>");
                            $(".reloading_videowall").fadeIn(300);
                        }
                        resolve(false);
                    }
                });
            },
            cargarComboPantallas: function () {
                var self = this;
                $("body").prepend($("<div id='dlgPantalla'></div>"));

                $("#dlgPantalla").kendoWindow({
                    title: window.app.idioma.t('PANTALLA_VIDEOWALL'),
                    width: "440px",
                    //height: "180px",
                    content: "html/videowall.html",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    scrollable: false,
                    actions: [],
                    close: function () {
                        self.dialog.destroy();
                        self.dialog = null;
                    },
                    refresh: function () {
                        $("#btnAceptar").kendoButton({
                            click: function (e) {
                                e.preventDefault();
                                if (self.pantallaSel) {

                                    self.setPantalla(self.pantallaSel);
                                    self.cargarVistas();
                                } else {

                                    $("#divErrorVW").show();

                                }
                            }
                        });
                        $("#divErrorVW").hide();
                        $("#divErrorVW").text(window.app.idioma.t('ERROR_SEL_VIDEOWALL'));
                        $("#btnAceptar").text(window.app.idioma.t('ACEPTAR'));
                        $("#lblPantalla").text(window.app.idioma.t('PANTALLA'));

                        $("#cmbPantalla").kendoDropDownList({
                            dataTextField: "Nombre",
                            dataValueField: "IdPantalla",
                            dataSource: new kendo.data.DataSource({
                                data: self.pantallas
                            }),
                            optionLabel: window.app.idioma.t('SELECCIONE'),
                            change: function (e) {
                                $("#divErrorVW").hide();
                                var opSel = $("#cmbPantalla").val();

                                pantallasSel = jQuery.grep(self.pantallas, function (pantalla, i) {
                                    return pantalla.IdPantalla == opSel;
                                });

                                if (pantallasSel.length > 0) {

                                    self.pantallaSel = pantallasSel[0];
                                    $("#lblDescripcionPantalla").text(pantallasSel[0].Descripcion);

                                } else {
                                    self.pantallaSel = null;
                                    $("#lblDescripcionPantalla").empty();

                                }

                                e.preventDefault();
                            }
                        });
                    }
                }).data("kendoWindow").center().open();

                $(".k-window").css("top", "50px");
            },
            cargarVistas: function () {
                var self = this;
                self.avisoEvacuacion();

                if (self.hayAviso) {
                    var vistaEvacuacion = new VistaEvacuacion();
                    self.vistasCarrusel.push(vistaEvacuacion);
                } else {
                    self.cargaObtenerInformacionLineaVideowall();
                }

                self.render();
                for (var i = 0; i < self.numCarrusel.length; i++) {
                    if (self.numCarrusel[i] != undefined) {
                        self.numPantallasCargadas = self.numPantallasCargadas + 1
                    }

                }
                self.funcTimeOut = async function () {
                    // Comprobamos si el servidor está activo antes de cambiar de vista
                    let serverActive = await self.checkServer();

                    if (serverActive) {
                        clearTimeout(self.timeOut);
                        self.numIndice = (self.numIndice + 1) % self.numCarrusel.length;
                        self.msCambio = self.numCarrusel[self.numIndice];

                        if (self.msCambio != undefined) {
                            self.muestraNuevaVistaIndividual(self);
                            self.timeOut = setTimeout(self.funcTimeOut, self.msCambio);
                        } else {
                            self.funcTimeOut()
                        }
                    }
                }

                //bucle para sacar los segundos la primera posicion encontrada que no este vacia
                for (var i = 0; i < self.numCarrusel.length; i++) {
                    if (self.numCarrusel[i] != undefined) {
                        self.msCambio = self.numCarrusel[i];
                        break;
                    }

                }

                self.timeOut = setTimeout(self.funcTimeOut, self.msCambio);
                RT.iniciar();
            },
            cargaObtenerInformacionLineaVideowall: function () {
                var self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/videowall/ObtenerInformacionLineaVideowall/" + self.pantallaSel.IdPantalla,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    pantallas = data;

                    pantallas.forEach(function (numLinea, index) {
                        if (numLinea.Visible) {
                            self.numCarrusel.push(numLinea.Duracion * 1000);
                            idLineaSeleccionada = numLinea.IdLinea;
                            if (self.numPaginaActual > self.numPantallas) {
                                self.numPaginaActual = 1;
                            }
                            self.cargaPantalla(self.numPaginaActual);
                        }
                        self.numPaginaActual = self.numPaginaActual + 1;
                        self.numVuelta = self.numVuelta + 1
                    });
                }).fail(function (xhr) {

                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_PANTALLAS'), 2000);
                    }

                });
            },
            cargaPantalla: function (pantallaActiva) {
                var self = this;
                var numLinea = idLineaSeleccionada;
                self.options.numLinea = numLinea

                let vista;

                switch (pantallaActiva) {
                    case self.enumPantallas.Fecha:
                        vista = new VistaFecha();
                        break;
                    case self.enumPantallas.DiaJuliano:
                        vista = new VistaDiaJuliano();
                        break;
                    case self.enumPantallas.CuadroMandoLinea:
                        vista = new VistaCuadroMandoLinea({ id: 'vistaCuadroMandoLinea' + numLinea, options: self.options });
                        break;
                    case self.enumPantallas.OEE:
                        vista = new VistaOEE({ id: 'vistaOEE' + numLinea, options: self.options });
                        break;
                    case self.enumPantallas.WO:
                        vista = new VistaWO({ id: 'vistaWO' + numLinea, options: self.options });
                        break;
                    case self.enumPantallas.Producto:
                        vista = new VistaProducto({ id: 'vistaProducto' + numLinea, options: self.options });
                        break;
                    case self.enumPantallas.Accidente:
                        vista = new VistaAccidente({ id: 'vistaAccidente' + numLinea, options: self.options });
                        break;
                    case self.enumPantallas.RendimientoTurnos:
                        vista = new VistaRendimientoTurnos({ id: 'vistaRendimientoTurnos' + numLinea, options: self.options });
                        break;
                    case self.enumPantallas.OEEDiaMes:
                        vista = new VistaOEEDiaMes({ id: 'vistaOEEDiaMes' + numLinea, options: self.options });
                        break;
                    case self.enumPantallas.FechaCaducidad:
                        vista = new VistaFechaCaducidad({ id: 'vistaFechaCaudidad' + numLinea, options: self.options });
                        break;
                }

                if (vista) {
                    self.vistasCarrusel.push(vista);
                }

            },
            render: function () {
                var self = this;
                $('body').html($(self.el));

                $.each(self.vistasCarrusel, function (index, value) {
                    self.$el.append($(value.el));
                });

                var soloCuadroMando = (window.location.href.indexOf("supervisor") > -1);

                if (!soloCuadroMando) {
                    self.muestraNuevaVistaIndividual(self)
                } else {
                    self.muestraNuevaVistaSupervisor(self);
                }
                self.$el.css("max-width", screen.width);
                return this;
            },
            avisoEvacuacion: function () {
                var self = this;

                $.ajax({
                    type: "GET",
                    async: false,
                    url: "../api/AvisoEvacuacion_Read/",
                    dataType: 'json',
                    cache: false,
                    success: function (data) {
                        self.hayAviso = data;
                    },
                    error: function (err) {
                    }
                });
            },
            events: {

            },
            cargarSupervisor: function () {
                var self = this;

                self.avisoEvacuacion();
                self.msCambio = 20000;
                var numLineas = window.app.planta.lineas.length;
                self.maxLineas = numLineas < self.maxLineas ? numLineas : self.maxLineas;
                var numVistas = Math.ceil(numLineas / self.maxLineas);
                var arrayLineas = [];
                var counter = 0;

                if (self.hayAviso) {
                    var vistaEvacuacion = new VistaEvacuacion();
                    self.vistasCarrusel.push(vistaEvacuacion);
                } else {
                    window.app.planta.lineas.forEach(function (linea) {
                        arrayLineas.push(linea.numLinea);
                        ++counter;

                        if (arrayLineas.length == self.maxLineas || counter == numLineas) {
                            var indexCarrusel = { id: self.vistasCarrusel.length };
                            var vistaCuadroMando = new VistaCuadroMando({ id: 'VistaListadoLineas' + indexCarrusel.id, lineas: arrayLineas, indexCarrusel: indexCarrusel });
                            self.vistasCarrusel.push(vistaCuadroMando);
                            arrayLineas = [];
                        }
                    });

                    var indexCarrusel1 = {
                        id: self.vistasCarrusel.length
                    };
                }

                self.render();

                if (self.options && self.options.segundosCambio) {
                    self.msCambio = self.options.segundosCambio * 1000;
                }

                self.funcTimeOut = async function () {
                    let serverActive = await self.checkServer();
                    if (serverActive) {
                        self.muestraNuevaVistaSupervisor(self);
                        clearTimeout(self.timeOut);
                        self.timeOut = setTimeout(self.funcTimeOut, self.msCambio);
                    }
                }
                self.timeOut = setTimeout(self.funcTimeOut, self.msCambio);

                RT.iniciar();
            },
            muestraNuevaVistaIndividual: function (self) {
                var aviso = self.hayAviso;

                if (self.hayAviso === aviso) {
                    if (self.vistasCarrusel.length === 1) {
                        //self.vistasCarrusel[self.indiceVistaActual].$el.fadeOut(1000, function () {
                        self.vistasCarrusel[self.indiceVistaActual].$el.fadeIn(1000);
                        self.vistasCarrusel[self.indiceVistaActual].actualiza();
                        //});
                        return;
                    }

                    const vistaAnterior = (self.indiceVistaActual - 1) < 0 ? (self.vistasCarrusel.length - 1) : (self.indiceVistaActual - 1);

                    self.vistasCarrusel[vistaAnterior].$el.fadeOut(1000, function () {
                        self.vistasCarrusel[self.indiceVistaActual].$el.fadeIn(1000);
                        self.vistasCarrusel[self.indiceVistaActual].actualiza();
                        self.indiceVistaActual = (self.indiceVistaActual + 1) % self.vistasCarrusel.length;
                    });

                } else {
                    self.vistasCarrusel.forEach(function (vista) {
                        vista.el.remove();
                    });
                    //$('#carrusel [style*="display: block"]').hide();
                    self.indiceVistaActual = 0;
                    self.vistasCarrusel = [];
                    self.cargarVistas();
                }
            },
            muestraNuevaVistaSupervisor: function (self) {
                // Se mostrará sólo el cuadro de mando en caso de que indique "?supervisor" al final de la URL
                var aviso = self.hayAviso;
                self.avisoEvacuacion();
                // Si introdujo "?supervisor" al final de la URL, sólo se muestra el cuadro de mando
                if (self.hayAviso === aviso) {

                    if (self.vistasCarrusel[0].id === "VistaEvacuacion") {

                        self.vistasCarrusel[0].$el.fadeIn(1000);
                        self.vistasCarrusel[0].actualiza();
                        return;

                    }

                    var numLineas = window.app.planta.lineas.length;
                    var numVistas = Math.ceil(numLineas / self.maxLineas);

                    if (numVistas > 1) {

                        if (self.indiceVistaActual == 0) {

                            self.vistasCarrusel[self.vistasCarrusel.length - 1].$el.fadeOut(self.msCambio / 4, function () {
                                self.vistasCarrusel[self.indiceVistaActual].$el.fadeIn(self.msCambio / 4);
                                self.vistasCarrusel[self.indiceVistaActual].actualiza();
                                self.topCuadroMando = self.vistasCarrusel[self.indiceVistaActual].resize();
                                self.indiceVistaActual += 1;
                                if (self.indiceVistaActual == self.vistasCarrusel.length) self.indiceVistaActual = 0;
                            });

                        } else {

                            self.vistasCarrusel[self.indiceVistaActual - 1].$el.fadeOut(self.msCambio / 4, function () {
                                self.vistasCarrusel[self.indiceVistaActual].$el.fadeIn(self.msCambio / 4);
                                self.vistasCarrusel[self.indiceVistaActual].actualiza();
                                if (self.topCuadroMando) {

                                    self.vistasCarrusel[self.indiceVistaActual].setTop(self.topCuadroMando);
                                }

                                self.indiceVistaActual += 1;
                                if (self.indiceVistaActual == self.vistasCarrusel.length) self.indiceVistaActual = 0;
                            });
                        }

                    } else {

                        self.vistasCarrusel[self.indiceVistaActual].listen();
                        self.vistasCarrusel[self.indiceVistaActual].actualiza();
                        self.vistasCarrusel[self.indiceVistaActual].resize();

                    }
                } else {

                    self.vistasCarrusel.forEach(function (vista) {
                        vista.el.remove();
                    });

                    self.indiceVistaActual = 0;
                    self.vistasCarrusel = [];
                    self.cargarSupervisor();

                }

            },
            eliminar: function () {
                Backbone.off('eventActVideowall', this.actualiza, this);

                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
        });

        return VideoWall;
    }
);