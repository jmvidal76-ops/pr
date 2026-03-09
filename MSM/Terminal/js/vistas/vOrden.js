define(['underscore', 'backbone', 'jquery', 'vistas/vDialogoConfirmAsignar', 'vistas/vDialogoConfirmDesasignar', 'vistas/vDlgConfirmTipoArranque', 'text!../../html/pBloqueOrden.html', 'vistas/vDialogoInform'],
    function (_, Backbone, $, VistaDlgConfirm, VistaDlgConfirmDesasignar, VistaDlgConfirmTipoArranque, plantillaBloque, VistaDlgInform) {
        var BloqueOrden = Backbone.View.extend({
            tagName: 'div',
            template: _.template(plantillaBloque),
            arranqueOrden: false,
            estaAsignadaEnZona: null,
            configuracionMaquinas: null,
            initialize: function (options) {
                this.model.on('change', this.actualiza, this);
                Backbone.on('eventcambioPuesto', this.actualizaCambioPuesto, this);

                this.render();
            },
            render: function () {
                var self = this;
                $(this.el).html(this.template(this.model.toJSON()));
                self.estaAsignadaEnZona = false;
                self.arranqueOrden = false;
                var valorOEE = 0.0;
                if (self.model.get("produccion")) valorOEE = self.model.get("produccion").oee;

                var passProgress = this.$("#oee" + self.model.get("id").replace('.', '')).kendoProgressBar({
                    type: "value",
                    max: 100,
                    value: valorOEE,
                    animation: true
                }).data("kendoProgressBar");

                if (Math.floor(valorOEE) == valorOEE) {
                    passProgress.progressStatus.text(valorOEE + " %");
                } else {
                    passProgress.progressStatus.text(valorOEE.toFixed(2) + " %");
                }

                if (valorOEE < this.model.get('oeeCritico')) {
                    if (typeof (passProgress) != "undefined") {
                        passProgress.progressWrapper.css({
                            "background-color": "red",
                            "border-color": "red"
                        });
                    }
                } else if (valorOEE < this.model.get('oeeObjetivo')) {
                    if (typeof (passProgress) != "undefined") {
                        passProgress.progressWrapper.css({
                            "background-color": "orange",
                            "border-color": "orange"
                        });
                    }
                } else if (valorOEE > 100) {
                    if (typeof (passProgress) != "undefined") {
                        passProgress.progressWrapper.css({
                            "background-color": "red",
                            "border-color": "red"
                        });
                    }
                } else {
                    if (typeof (passProgress) != "undefined") {
                        passProgress.progressWrapper.css({
                            "background-color": "green",
                            "border-color": "green"
                        });
                    }
                }

                var estado = this.model.get("estadoActual").nombre;

                var botonera;
                var botoneraPlay = '<img name="play"  id="btnAccionAsignar" style="display:block;margin-top:32px;margin-left:auto;margin-right:auto;" src="img/play.png"/>';
                var botoneraPause = '<img name="pause" id="btnAccionDesasignar" style="display:block;margin-top:32px;margin-left:auto;margin-right:auto;" src="img/pause.png"/>';
                var botoneraBloq = '<img name="pause" style="display:block;margin-top:32px;margin-left:auto;margin-right:auto;" src="img/no_operation.png"/>';
                if (!window.app.zonaSel.ordenActual) {
                    botonera = botoneraPlay
                    this.$("#btnAccion").removeClass("btnAccionDesasignar").addClass("btnAccionAsignar");
                } else if (window.app.zonaSel.ordenActual.id == this.model.id) {
                    botonera = botoneraPause;
                    self.estaAsignadaEnZona = true;
                    this.$("#btnAccion").removeClass("btnAccionAsignar").addClass("btnAccionDesasignar");
                } else {
                    botonera = botoneraBloq;
                    this.$("#btnAccion").removeClass("btnAccionAsignar").removeClass("btnAccionDesasignar");
                }
                if (estado == 'Finalizada' || estado == 'Cancelada' || estado == 'Cerrada' || estado == 'Cancelada') {
                    botonera = botoneraBloq;
                    this.$("#btnAccion").removeClass("btnAccionAsignar").removeClass("btnAccionDesasignar");
                }

                //si la zona no permite asignar/desasignar como la zona de tapones, bloqueamos.
                if (!window.app.zonaSel.InicioPausa) {
                    botonera = botoneraBloq;
                    this.$("#btnAccion").removeClass("btnAccionAsignar").removeClass("btnAccionDesasignar");
                }

                this.$("#btnAccion").append($(botonera));

                return this;
            },
            actualizaCambioPuesto: function () {
                var self = this;
                //Actualizamos en el caso de que estemos en el detalle
                if (window.location.hash.toLowerCase().indexOf("menu") > 0) {
                    self.actualiza();
                }
            },
            actualiza: function () {
                this.render();
            },
            events: {
                'click .btnAccionAsignar': 'validarCambioOArranque',
                'click .btnAccionDesasignar': 'validarDesasignarOrden',
            },
            obtenerConfiguracionMaquinas: function () {
                var self = this;
                $.ajax({
                    async: false,
                    url: "../api/ObtenerConfiguracionMaquinasCompartidas",
                    dataType: "json",
                    success: function (res) {
                        self.configuracionMaquinas = res;
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                });
            },
            comprobarZonaActual: function () {
                var self = this;

                var empaquetadoras = self.configuracionMaquinas.filter(function (item) {
                    return item.Linea == window.app.lineaSel.id && item.Maquina.includes('EMP');
                });

                var paleteras = self.configuracionMaquinas.filter(function (item) {
                    return item.Linea == window.app.lineaSel.id && item.Maquina.includes('PAL');
                });

                self.empaquetadorasActivas = 0;
                self.paleterasActivas = 0;

                empaquetadoras.forEach(function (maquina) {
                    if (maquina.Activa) {
                        self.empaquetadorasActivas = 1;
                        return;
                    }
                });

                paleteras.forEach(function (maquina) {
                    if (maquina.Activa) {
                        self.paleterasActivas = 1;
                        return;
                    }
                });
            },
            abrirConfirmTipoArranque: function (ordenArranqueCambio) {
                var self = this;
                this.confirmacion = new VistaDlgConfirmTipoArranque({
                    titulo: window.app.idioma.t('ALT_LOG_ESTADO'),
                    msg: window.app.idioma.t('SELECCIONE_UN_TIPO'),
                    funcion: function (tArranque) {
                        tipoArranque = tArranque;
                        self.validarAsignarOrden(ordenArranqueCambio, tipoArranque);
                    },
                    contexto: this
                });
            },
            validarCambioOArranque: function (e) {
                e.preventDefault(); // evitamos que se realice la acción del href
                var self = this;

                if (window.app.zonaSel.MaquinasCompartidas) {
                    self.obtenerConfiguracionMaquinas();
                    self.comprobarZonaActual();

                    if (self.empaquetadorasActivas == 0 || self.paleterasActivas == 0) {
                        this.confirmacion = new VistaDlgInform({
                            titulo: window.app.idioma.t('ASIGNAR_WO'),
                            msg: window.app.idioma.t('PARA_PODER_ASIGNAR_WO'),
                            contexto: this
                        });
                        return;
                    }
                }

                //A01. comprobar si hay que crear orden de arranque o de cambio
                //comprobar si hay que preguntar si es arranque o cambio.
                //solo se pregunta si la orden es entrante, es decir si la orden no estaba en niniguna zona de la línea
                var ordenArranqueCambio = 0; //0: no hay que crear ninguna; 1: arranque; 2: cambio

                var datos = {};
                datos.woId = this.model.id;
                datos.linea = this.model.get("idLinea");
                datos.zonas = window.app.lineaSel.zonas;
                var strFechaWO = this.model.get("fecInicioEstimado").substring(0, 10);

                $.ajax({
                    data: JSON.stringify(datos),
                    type: "POST",
                    async: true,
                    url: "../api/checkOrdenArranqueOCambio",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        //-1 sino hay que hacer nada /  0 si arranque / 1 si cambio
                        ordenArranqueCambio = res; //
                        var tipoArranque = -1;
                        if (ordenArranqueCambio == 0) {
                            //ES arranque, preguntamos el tipo de arranque y actualizamos la orden para marcar que cuando llegue a paletizadora tiene que crear una orden de arranque.
                            var dia = strFechaWO.substring(0, 2);
                            var mes = strFechaWO.substring(3, 5);
                            var anio = strFechaWO.substring(6, 10);
                            var newDateFormated = [anio, mes, dia].join('/');
                            var noSemanaFechaInicioWO = new Date(newDateFormated).getWeek();
                            var noSemanaActual = new Date().getWeek();

                            if (noSemanaFechaInicioWO === noSemanaActual) {
                                self.abrirConfirmTipoArranque(ordenArranqueCambio);
                            }
                            else {
                                OpenWindow(window.app.idioma.t('TITULO_FUERA_SEMANA_ACTUAL'),
                                    window.app.idioma.t('CONFIRMACION_WO_FUERA_SEMANA_ACTUAL'),
                                    function () {
                                        self.abrirConfirmTipoArranque(ordenArranqueCambio);
                                    },
                                );
                            }
                        } else if (ordenArranqueCambio == 1 || ordenArranqueCambio == -1) {
                            //la orden genera un cambio o no tiene que hacer nada, se lo pasaremos a la función de asignar para que lo gestione
                            //A02. asignar a la zonas determinadas ( actual o, actual y anteriores)                              
                            self.validarAsignarOrden(ordenArranqueCambio, tipoArranque);
                        } else {
                            Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_COMPROBANDO_ARRANQUE_O_CAMBIO'), 4000);
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_COMPROBANDO_ARRANQUE_O_CAMBIO'), 4000);
                        }
                    }
                });
            },
            validarAsignarOrden: function (ordenArranqueCambio, tipoArranque) {
                var self = this;
                this.confirmacion = new VistaDlgConfirm({
                    ordenArranqueCambio: ordenArranqueCambio,
                    titulo: window.app.idioma.t('ASIGNAR_WO'),
                    funcion: function (zonas2Asignar) {
                        Backbone.trigger('asignandoDesasignandoWO2Zona');
                        self.model.asignarWO2Zona(zonas2Asignar, ordenArranqueCambio, tipoArranque);
                    },
                    contexto: this
                });
            },
            validarDesasignarOrden: function (e) {
                e.preventDefault(); // evitamos que se realice la acción 
                var self = this;
                //A02. asignar a la zonas determinadas ( actual o, actual y anteriores)
                this.confirmacion = new VistaDlgConfirmDesasignar({
                    titulo: window.app.idioma.t('DESASIGNAR_WO'),
                    funcion: function (zonas2Desasignar, nuevoEstado) {
                        Backbone.trigger('asignandoDesasignandoWO2Zona');
                        self.model.desasignarWO2Zona(zonas2Desasignar, nuevoEstado);
                    },
                    contexto: this
                });
            },
            eliminar: function () {
                Backbone.off('eventcambioPuesto');
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            }
        });

        return BloqueOrden;
    });