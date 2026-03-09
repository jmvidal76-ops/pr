define(['underscore', 'backbone', 'jquery', 'text!../../html/EditarAsignacionMaquina.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaAsignarMaquina, VistaDlgConfirm, Not) {
        var vistaEditarAsignacionMaquina = Backbone.View.extend({
            tagName: 'div',
            id: 'divAsignarMaquina',
            descripcionMaquinas: null,
            configuracionMaquinas: null,
            hayOrdenOtraLinea: null,
            template: _.template(PlantillaAsignarMaquina),
            initialize: function (options) {
                var self = this;
                self.orden = options.orden;

                self.obtenerDescripcionMaquinas();
                self.obtenerConfiguracionMaquinas();

                self.render();
                self.dialog.center();
            },
            obtenerDescripcionMaquinas: function () {
                var self = this;
                $.ajax({
                    async: false,
                    url: "../api/ObtenerDescripcionMaquinasCompartidas",
                    dataType: "json",
                    success: function (res) {
                        self.descripcionMaquinas = res;
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                });
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
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))
                var self = this;
                var htmlDescripcionMaquinas = '';
                var htmlConfiguracion = '';

                self.descripcionMaquinas.forEach(function (maquina) {
                    htmlDescripcionMaquinas += '<tr><td class="tamanioTd">' + maquina + '</td></tr>';
                });

                $('#listaMaquinas').append(htmlDescripcionMaquinas);

                self.configuracionMaquinas.forEach(function (configMaquina, index) {
                    if (index % 2 === 0) {
                        htmlConfiguracion += '<tr><td style="text-align:center"><input type="radio" id="rb' + configMaquina.Ordenacion + '" name="opt' + configMaquina.Ordenacion + '" class="alturaRadio" /></td>';
                    } else {
                        htmlConfiguracion += '<td style="text-align:center"><input type="radio" id="rb' + configMaquina.Ordenacion + '" name="opt' + (configMaquina.Ordenacion - 1) + '" class="alturaRadio" /></td></tr>';
                    }
                });

                $('#listaConfiguracion').append(htmlConfiguracion);

                self.configuracionMaquinas.forEach(function (configMaquina) {
                    $('#rb' + configMaquina.Ordenacion).prop('checked', configMaquina.Activa);
                });

                self.$("#btnAceptarMP").kendoButton();
                self.$("#btnCancelarMP").kendoButton();

                self.window = $(self.el).kendoWindow(
                {
                    title: window.app.idioma.t('CONFIG_EMPAQUETADORAS_PALETIZADORAS'),
                    width: "630px",
                    //height: "300px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    scrollable: false,
                    actions: []
                }).data("kendoWindow");

                self.dialog = $('#divAsignarMaquina').data("kendoWindow");
                self.dialog.center();
            },
            events: {
                'click #btnAceptarMP': 'confirmarEdicion',
                'click #btnCancelarMP': 'cancelar',
            },
            comprobarLineaActual: function () {
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
            comprobarLineaOpuesta: function () {
                var self = this;

                var empaquetadorasOtraLinea = self.configuracionMaquinas.filter(function (item) {
                    return item.Linea != window.app.lineaSel.id && item.Maquina.includes('EMP');
                });

                var paleterasOtraLinea = self.configuracionMaquinas.filter(function (item) {
                    return item.Linea != window.app.lineaSel.id && item.Maquina.includes('PAL');
                });

                self.empaquetadorasActivasOtraLinea = 0;
                self.paleterasActivasOtraLinea = 0;

                empaquetadorasOtraLinea.forEach(function (maquina) {
                    if (maquina.Activa) {
                        self.empaquetadorasActivasOtraLinea = 1;
                        return;
                    }
                });

                paleterasOtraLinea.forEach(function (maquina) {
                    if (maquina.Activa) {
                        self.paleterasActivasOtraLinea = 1;
                        return;
                    }
                });
            },
            confirmarEdicion: function (e) {
                var self = this;
                if (e) {
                    e.preventDefault();
                }

                self.hayOrdenLineaOpuesta();

                self.configuracionMaquinas.forEach(function (configMaquina) {
                    configMaquina.Activa = $('#rb' + configMaquina.Ordenacion).prop('checked');
                });

                if (self.orden != "") {
                    self.comprobarLineaActual();

                    if (self.empaquetadorasActivas == 0 || self.paleterasActivas == 0) {
                        self.$('#divAviso').html(window.app.idioma.t('WO_ASIGNADA_ZONA'));
                        return;
                    }
                }

                if (self.hayOrdenOtraLinea) {
                    self.comprobarLineaOpuesta();

                    if (self.empaquetadorasActivasOtraLinea == 0 || self.paleterasActivasOtraLinea == 0) {
                        self.$('#divAviso').html(window.app.idioma.t('WO_ASIGNADA_OTRA_LINEA'));
                        return;
                    }
                }

                self.$('#divAviso').html('');

                self.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('CONFIG_EMPAQUETADORAS_PALETIZADORAS'),
                    msg: window.app.idioma.t('CONFIRMACION_MODIFICAR_REGISTROS'),
                    funcion: function () { self.editarConfiguracion(); },
                    contexto: this
                });
            },
            editarConfiguracion: function () {
                var self = this;

                datos = {};
                datos.idLinea = window.app.lineaSel.id;
                //datos.idZona = window.app.zonaSel.id;
                datos.maquinas = self.configuracionMaquinas;

                $.ajax({
                    data: JSON.stringify(datos),
                    type: "POST",
                    async: false,
                    url: "../api/modificarConfiguracionMaquinas",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_OPERACION_SE'), 4000);
                        self.cancelar();
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            hayOrdenLineaOpuesta: function () {
                var self = this;

                datos = {};
                datos.idLinea = window.app.lineaSel.id;
                datos.idZona = window.app.zonaSel.id;
                
                $.ajax({
                    data: JSON.stringify(datos),
                    type: "POST",
                    async: false,
                    url: "../api/HayOrdenLineaOpuesta",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        self.hayOrdenOtraLinea = res;
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERR_COMPROBANDO_ZONA_COMPARTIDA'), 4000);
                        }
                        self.cancelar();
                    }
                });
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }

                Backbone.trigger('eventCierraDialogo');
                this.dialog.close();
                this.eliminar();
            },
            eliminar: function () {
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

        return vistaEditarAsignacionMaquina;
    });