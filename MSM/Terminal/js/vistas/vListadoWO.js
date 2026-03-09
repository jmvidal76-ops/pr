define(['underscore', 'backbone', 'jquery', 'colecciones/cOrdenes', 'text!../../html/listadoWO.html', 'vistas/vOrden',
        'compartido/notificaciones', 'vistas/vAsignarProduccion', 'vistas/vAsignarMaquina'],
    function (_, Backbone, $, Ordenes, PlantillaListadoWO, BloqueOrden, Not, VistaAsignarProduccion, VistaAsignarMaquina) {
        var ListadoWO = Backbone.View.extend({
            tagName: 'div',
            ordenes: [],
            template: _.template(PlantillaListadoWO),
            eventosLinea: ['eventNotificacionOrden'],
            lineas: null,
            cambioLineaZona: null,
            actualizandoDatos: false,
            asignandoDesasignandoOrden : false,
            initialize: function(options) {
                var self = this;
                self.cambioLineaZona = false;
                
                $.each(self.eventosLinea, function(index, eventName) {
                    Backbone.on(eventName + window.app.lineaSel.numLinea, function () { self.actualiza({ evento: eventName + window.app.lineaSel.numLinea }) }, self);
                });

                Backbone.on('eventActProd', this.actualiza, this);
                Backbone.on('eventActPlanificacionOrden', this.actualiza, this);
                Backbone.on('eventcambioPuesto', this.actualiza, this);
                Backbone.on('asignandoDesasignandoWO2Zona', this.fAsignandoDesasignandoOrden, this);
                
                self.collection = new Ordenes(window.app.lineaSel.id, window.app.zonaSel.id);

                self.posicionScroll = self.$el.parent().scrollTop();
                self.actualiza({ evento: "initialize" });
                self.$el.parent().animate({ scrollTop: self.posicionScroll }, 0);

            },
            render: function() {
                var self = this;
                if (!self.renderSinPlantilla) {
                    $(this.el).html(this.template());
                }

                // Borramos las vistas hijas que hubiera cargadas anteriormente
                for (i = 0; i < self.ordenes.length; i++) {
                    self.ordenes[i].eliminar();
                }
                // Si es una zona que esta en mas de una linea
                // Mostramos un menu con la selección de la linea
                // ------------------------------------------------------
                var heightMenuEspecial = 0;
                if (window.app.zonaSel.ZonasCompartidasLinea.length == 0 && window.app.zonaSel.ZonasCompartidasEntreLineas.length == 0) {
                    this.$(".menuZonaEspecial").hide();
                } else {
                    this.$(".menuZonaEspecial").show();
                    if (window.app.zonaSel.ZonasCompartidasEntreLineas.length > 0) {
                        this.$("#divZELineas").show();
                        this.$("#lblSelLin").html(window.app.idioma.t('POSICION_LINEA'));
                        this.$("#lblSelLin2").html(window.app.idioma.t('LINEA').toUpperCase() + ' ' + window.app.lineaSel.numLineaDescripcion);
                        this.$("#lblSelLin3").html(window.app.idioma.t('CAMBIO_POSICION_LINEA'));

                        this.$('.btnLinea').remove();

                        $.each(window.app.zonaSel.ZonasCompartidasEntreLineas, function(index, zonaCompartida) {
                            self.$("#botonesLineas").append($("<button class ='btnLinea' id = 'zlin" + zonaCompartida.NumLinea + zonaCompartida.Id + "'> Línea " + zonaCompartida.NumLineaDescripcion + " <br/> Zona " + zonaCompartida.Descripcion + "</button>"));
                            self.$("#zlin" + zonaCompartida.NumLinea + zonaCompartida.Id).kendoButton({ click: function() { self.cambiaLineaZonaCompartida(zonaCompartida.NumLinea, zonaCompartida.Id) } });
                        });

                        if (window.app.zonaSel.ProduccionCompartida && window.app.zonaSel.esLlenadora) { //window.app.lineaSel.Grupo != ''
                            this.$('#divAsignacionProduccion').show();
                            this.$("#btnCambioAsignacion").kendoButton();
                            self.ObtenerAsignacionProduccion();

                            $.each(self.lineas, function (index, linea) {
                                if (linea.idLinea === window.app.lineaSel.id) {
                                    var porcentaje = linea.tagValue ? linea.tagValue : 0;
                                    $('#lblPorcentajeAsignado').html(window.app.idioma.t('PORCENTAJE_PROD_ASIGNADO') + ': <strong>' + porcentaje + '%</strong>');
                                }
                            });
                        } else {
                            this.$('#divAsignacionProduccion').hide();
                        }

                        if (window.app.zonaSel.MaquinasCompartidas && (window.app.zonaSel.esEmpaquetadora || window.app.zonaSel.esPaletizadora)) {
                            this.$('#btnConfigurarMaquinas').show();
                            this.$("#btnConfigurarMaquinas").kendoButton();
                        } else {
                            this.$('#btnConfigurarMaquinas').hide();
                        }

                        heightMenuEspecial += $("#divZELineas").height();
                    } else {
                        this.$("#divZELineas").hide();
                    }

                    if (window.app.zonaSel.ZonasCompartidasLinea.length > 0) {
                        this.$("#divZEZonas").show();
                        this.$("#lblSelZon").html(window.app.idioma.t('POSICION_ZONA'));
                        this.$("#lblSelZon2").html(window.app.zonaSel.descripcion.toUpperCase());
                        this.$("#lblSelZon3").html(window.app.idioma.t('CAMBIO_POSICION_ZONA'));

                        this.$('.btnZona').remove();

                        $.each(window.app.zonaSel.ZonasCompartidasLinea, function(index, zonaCompartida) {
                            self.$("#botonesZonas").append($("<button class ='btnZona' id = '" + zonaCompartida.Id + "'>" + zonaCompartida.Descripcion + "</button>"));
                            self.$("#" + zonaCompartida.Id).kendoButton({ click: function() { self.cambiaLineaSubZona(zonaCompartida.Id) } });
                        });
                        heightMenuEspecial += $("#divZEZonas").height();
                    } else {
                        this.$("#divZEZonas").hide();
                    }
                }

                this.collection.each(function (orden) {
                    estado = orden.get("estadoActual").nombre;
                    if (estado != "Cerrada" && estado != "Finalizada") {
                        var bloqueOrden = new BloqueOrden({ model: orden });
                        if (bloqueOrden.estaAsignadaEnZona) {
                            self.$("#listadoWOAsignada").append(bloqueOrden.el);
                            //var wdiv = $("#listadoWOAsignada").width()
                            //$("#listadoWOAsignada").css("width", wdiv + 1);
                        }
                        else {
                            $(bloqueOrden.el).css("margin-bottom", "15px");
                            self.$("#listadoWO").append(bloqueOrden.el);
                        }

                        self.ordenes.push(bloqueOrden);
                    }
                });
               
                $("#center-pane").css("overflow", "hidden");
                var height = $(window).height() - $("#header").height() - $("#footer").height() - $(".cabeceraVista").height() - heightMenuEspecial;
                // $("#listado").css('max-height', height - 40);
                $("#listado").css('max-height', height -5);
            },
            events: {
                'click #btnCambioAsignacion': 'CambioAsignacion',
                'click #btnConfigurarMaquinas': 'ConfigurarMaquinas',
            },
            CambioAsignacion: function () {
                var self = this;
                this.vistaProduccion = new VistaAsignarProduccion({ventanaPadre: self, lineasCompartidas: self.lineas });
            },
            ConfigurarMaquinas: function () {
                var self = this;
                var idOrden = "";

                self.collection.each(function (orden) {
                    estado = orden.get("estadoActual").nombre;
                    if (estado === "Producción") {
                        idOrden = orden.id;
                        return;
                    }
                });

                this.vistaAsignarMaquina = new VistaAsignarMaquina({ orden: idOrden });
            },
            timer: null,
            posicionScroll: 0,
            eliminar: function() {
                Backbone.off('eventNotificacionOrden' + window.app.lineaSel.numLinea);
                Backbone.off('eventActProd');
                Backbone.off('eventActPlanificacionOrden');

                var self = this;
                clearInterval(self.timer);
                for (i = 0; i < self.ordenes.length; i++) {
                    self.ordenes[i].eliminar();
                }
                $("#center-pane").css("overflow", "");
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },            
            actualizarDatosSesion: function() {
                var sesion = window.app.sesion;
                $.ajax({
                    data: JSON.stringify(sesion),
                    type: "POST",
                    async: false,
                    url: "../api/actualizarDatosSesion",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function(data) {
                        if (data) {
                            window.app.sesion.set("linea", data.linea);
                            window.app.sesion.set("zona", data.zona);
                            Backbone.trigger('eventActualizaLineaZona');
                        }
                    },
                    error: function(e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ACTUALIZAR_DATOS'), 4000);
                        }
                    }
                });
            },
            unbindEvents: function() {
                var self = this;
                $.each(Backbone._events, function(eventName, event) {
                    var isInEventosLinea = $.grep(self.eventosLinea, function(value, index) {
                        return eventName.indexOf(value) >= 0;
                    });
                    if (isInEventosLinea.length > 0) {
                        Backbone.off(eventName);
                    }

                });
            },
            bindEvents: function() {
                var self = this;
                $.each(self.eventosLinea, function(index, eventName) {
                    Backbone.on(eventName + window.app.lineaSel.numLinea, function () { self.actualiza({ evento: eventName + window.app.lineaSel.numLinea }) }, self);
                });
            },
            //params es la funcion que llega del Backbone.trigger 'eventActProd'
            actualiza: function (params, cambioPuesto) {
                var self = this;

                if (self.asignandoDesasignandoOrden && typeof params.onFinish != 'function') {
                    return;
                }

                self.asignandoDesasignandoOrden = false;

                if (cambioPuesto) {
                    self.unbindEvents();
                    self.bindEvents();
                }

                self.actualizarDatosSesion();

                self.collection.linea = window.app.lineaSel.id;
                self.collection.zona = window.app.zonaSel.id;

                self.collection.fetch()
                    .then(function (res) {
                        if (!self.actualizandoDatos) {
                            self.actualizandoDatos = true;
                            return res;
                        }

                        return Promise.reject(res);
                    }).then(function (collection) {
                        if (self.collection.models.some(m => m.get("idLinea") !== self.collection.linea)) {
                            return;
                        }

                        self.render();

                        if (cambioPuesto) {
                            kendo.ui.progress($("#listado"), false);
                        }

                        if (params && typeof params.onFinish === 'function') {
                            params.onFinish();
                        }

                        self.actualizandoDatos = false;
                    });

                
            },
            cambiaLineaZonaCompartida: function (linea, idZona) {
                var self = this;
                self.cambioLineaZona = true;
                var datos = {};
                datos.numLinea = linea;
                datos.idZona = idZona;
                kendo.ui.progress($("#listado"), true);

                $.ajax({
                    data: JSON.stringify(datos),
                    type: "POST",
                    async: true,
                    url: "../api/cambiaLineaZonaCompartida",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (sesion) {
                        let onFinish = function () {
                            self.renderSinPlantilla = false;
                            kendo.ui.progress($("#listado"), false);
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('EL_USUARIO_') + window.app.vistaPrincipal.model.get("usuario") + window.app.idioma.t('HA_CAMBIADO_DE'), 4000);
                        };

                        self.renderSinPlantilla = true;
                        window.app.vistaPrincipal.model.set("linea", sesion.linea);
                        window.app.vistaPrincipal.model.set("zona", sesion.zona);
                        Backbone.trigger('eventActualizaPie');

                        if (window.app.vista && window.app.vista.actualiza) {
                            window.app.vista.actualiza({ evento: "Cambio Zona", onFinish: onFinish }, true);
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('SE_HA_PRODUCIDO') + self.model.get("usuario") + window.app.idioma.t('INTENTABA_CAMBIAR_DE'), 4000);
                        }
                        kendo.ui.progress($("#listado"), false);
                    }
                });
            },
            cambiaLineaSubZona: function (idZona) {
                var datos = {};
                //var codZona = window.app.zonaSel.subZonas[i].replace(".", "_");
                //datos.codZona = this.wrapper.context.id.replace("SUB", ".");
                datos.idZona = idZona;
                kendo.ui.progress($("#listado"), true);

                $.ajax({
                    data: JSON.stringify(datos),
                    type: "POST",
                    async: true,
                    url: "../api/cambiaSubZona",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (sesion) {
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('EL_USUARIO_') + window.app.vistaPrincipal.model.get("usuario") + window.app.idioma.t('HA_CAMBIADO_DE_ZONA'), 4000);
                        window.app.vistaPrincipal.model.set("linea", sesion.linea);
                        window.app.vistaPrincipal.model.set("zona", sesion.zona);
                        Backbone.trigger('eventActualizaPie');
                        if (window.app.vista && window.app.vista.actualiza) {
                            window.app.vista.actualiza(null, true);
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('SE_HA_PRODUCIDO') + self.model.get("usuario") + window.app.idioma.t('INTENTABA_CAMBIAR_DE'), 4000);
                        }
                        kendo.ui.progress($("#listado"), false);
                    }
                });
            },
            ObtenerAsignacionProduccion: function () {
                var self = this;

                datos = {};
                datos.numLinea = window.app.lineaSel.numLinea
                $.ajax({
                    data: JSON.stringify(datos),
                    type: "POST",
                    async: false,
                    url: "../api/getMaquinasAsignacionLineaZona",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        self.lineas = res == null ? [] : res;
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                        self.lineas = [];
                    }
                });
            },
            fAsignandoDesasignandoOrden: function () {
                var self = this;
                self.asignandoDesasignandoOrden = true;
            }
        });

        return ListadoWO;
    });