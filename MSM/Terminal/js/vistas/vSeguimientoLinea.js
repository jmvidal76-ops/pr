define(['underscore', 'backbone', 'jquery', 'text!../../html/SeguimientoLinea.html', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaSeguimientoLinea, Not) {
        var SeguimientoLinea = Backbone.View.extend({
            tagName: 'div',
            template: _.template(PlantillaSeguimientoLinea),
            turnoActualLoad: false,
            lineasLoad: false,
            TurnosAnterior: null,
            TurnosActual: null,
            rendered: false,
            prerender: false,
            eventosLinea: ['eventNotificacionOrden', 'eventNotificacionMaquinas', 'eventNotificacionMaquina'],
            initialize: function () {
                var self = this;
                $.each(self.eventosLinea, function (index, eventName) {
                    Backbone.on(eventName + window.app.lineaSel.numLinea, self.actualiza, self);
                });
                Backbone.on('eventNotificacionTurno', this.actualiza, this);

                self.actualiza();
            },
            render: function () {
                $(this.el).html(this.template());
                var self = this;
                self.prerender = true;
                var pbDispTA = this.$("#pbDispTurnoAct").kendoProgressBar({
                    type: "percent",
                    /// Miguel Angel Suero Aviles 30/10/2017 incluido min
                    min: 0,
                    max: 100,
                    value: self.TurnosActual.disponibilidad,
                    animation: true
                }).data("kendoProgressBar");

                var pbDispTAn = this.$("#pbDispTurnoAnt").kendoProgressBar({
                    type: "percent",
                    /// Miguel Angel Suero Aviles 30/10/2017 incluido min
                    min: 0,
                    max: 100,
                    //value: self.TurnosAnterior.disponibilidad,
                    animation: true
                }).data("kendoProgressBar");

                var pbRendTA = this.$("#pbRendTurnoAct").kendoProgressBar({
                    type: "percent",
                    /// Miguel Angel Suero Aviles 30/10/2017 incluido min
                    min: 0,
                    max: 100,
                    value: self.TurnosActual.eficiencia,
                    animation: true
                }).data("kendoProgressBar");

                var pbRendTAn = this.$("#pbRendTurnoAnt").kendoProgressBar({
                    type: "percent",
                    /// Miguel Angel Suero Aviles 30/10/2017 incluido min
                    min: 0,
                    max: 100,
                    // value: self.TurnosAnterior.eficiencia,
                    animation: true
                }).data("kendoProgressBar");

                var pbOEETA = this.$("#pbOEEturnoAct").kendoProgressBar({
                    type: "percent",
                    /// Miguel Angel Suero Aviles 30/10/2017 incluido min
                    min: 0,
                    max: 100,
                    value: self.TurnosActual.OEE,
                    animation: true
                }).data("kendoProgressBar");

                var pbOEETAn = this.$("#pbOEEturnoAnt").kendoProgressBar({
                    type: "percent",
                    /// Miguel Angel Suero Aviles 30/10/2017 incluido min
                    min: 0,
                    max: 100,
                    //value: self.TurnosAnterior.oee,
                    animation: true
                }).data("kendoProgressBar");

                this.$("#paletsTurnoAct").html(self.TurnosActual.palets);
                this.$("#envasesTurnoAct").html(self.TurnosActual.envases);
                this.$("#cajasTurnoAct").html(self.TurnosActual.cajas);

                $.ajax({
                    type: "GET",
                    async: true,
                    url: "../api/DatosConsolidadosTurnoAnterior/" + window.app.lineaSel.numLinea,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        self.TurnosAnterior = data;
                        pbDispTAn.value(self.TurnosAnterior.disponibilidad);
                        pbRendTAn.value(self.TurnosAnterior.eficiencia);
                        pbOEETAn.value(self.TurnosAnterior.oee);
                        self.$("#paletsTurnoAnt").html(self.TurnosAnterior.palets);
                        self.$("#envasesTurnoAnt").html(self.TurnosAnterior.envases);
                        self.$("#cajasTurnoAnt").html(self.TurnosAnterior.cajas);
                        self.rendered = true;
                        self.prerender = false;
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EN_LA_OBTENCION'), 4000);
                        }
                    }
                });

                //var datosProd = this.linea.llenadoras[0].datosSeguimiento.datosProduccionAvanceTurno;
                var maquinasActualizadas = [];
                $.ajax({
                    type: "GET",
                    async: false,
                    url: "../api/ObtenerMaquinasLinea/" + window.app.lineaSel.numLinea,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        maquinasActualizadas = data;
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EN_LA_OBTENCION'), 4000);
                        }
                    }
                });

                for (var i = 0; i < this.linea.obtenerMaquinas.length; i++) {
                    var m = maquinasActualizadas.filter(function (item) { return item.id == self.linea.obtenerMaquinas[i].id; });
                    if (m.length > 0)
                        this.linea.obtenerMaquinas[i].ordenIdMaquina = m[0].ordenIdMaquina;
                }
                
                $("#gridMaquinas").kendoGrid({
                    dataSource: {
                        data: this.linea.obtenerMaquinas,
                        schema: {
                            id: 'maquina',
                            model: {
                                fields: {
                                    descripcion: { type: "string" },
                                    posicion: { type: "number" },
                                    idZona: { type: "string" },
                                    NombreZona: { type: "string" },
                                    'estado.nombre': { type: "string" },
                                    'ordenIdMaquina': { type: "string" },
                                    'datosSeguimiento.CantidadProducidaTurno': { type: "number" },
                                    'datosSeguimiento.EficienciaTurno': { type: "number" },
                                    'datosSeguimiento.DisponibilidadTurno': { type: "number" },
                                    //CantidadWO: { type: "number" }
                                }
                            },
                            parse: function (response) {
                                for (var i = 0; i < response.length; i++) {
                                    if (!response[i].orden) {
                                        response[i].orden = {};
                                        response[i].orden.id = '';
                                    }
                                }
                                return response;
                            }
                        },
                        sort: {
                            field: "posicion",
                            dir: "asc"
                        }
                    },
                    // height: '600px',
                    scrollable: true,
                    sortable: true,
                    filterable: false,
                    groupable: false,
                    columns: [
                        { field: "idZona", title: window.app.idioma.t('ZONA'), hidden: true, groupHeaderTemplate: '#=value.split("-")[1]#' },
                        { field: "NombreZona", title: window.app.idioma.t('ZONA'), width: "85px", attributes: { style: "text-align: center; font-size: 22px" } },
                        { field: "posicion", title: window.app.idioma.t('INDICE'), width: "45px", attributes: { style: "text-align: center; font-size: 22px" } },

                        //{ field: "nombre", title: "Máquina", width: "100px", attributes: { style: "text-align: center; font-size: 22px" } },
                        //{ field: "tipo.nombre", title: "Tipo", width: "150px", attributes: { style: "text-align: center; font-size: 22px" } },
                        { field: "descripcion", title: window.app.idioma.t('MAQUINA'), width: "170px", attributes: { style: "text-align: center; font-size: 22px" } },
                        { field: "estado.nombre", title: window.app.idioma.t('ESTADO'), width: "70px", attributes: { style: "text-align: center; font-size: 22px" } },
                       /* {
                            field: "orden.id", title: window.app.idioma.t('IDORDEN'), width: "100px",
                            template: ' # if (orden) { # #=orden.id# # } #',
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },*/
                        {
                            field: "ordenIdMaquina", title: window.app.idioma.t('IDORDEN'), width: "105px",
                            //template: ' # if (orden) { # #=orden.id# # } #',
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        //{
                        //    field: "CantidadWO", title: window.app.idioma.t('CANTIDAD_WO'), width: 55,
                        //    attributes: { style: "text-align: center; font-size: 22px" }
                        //},
                        { field: "datosSeguimiento.CantidadProducidaTurno", title: window.app.idioma.t('CANTIDAD_TURNO'), width: 55, attributes: { style: "text-align: center; font-size: 22px" } },
                        { field: "datosSeguimiento.DisponibilidadTurno", title: window.app.idioma.t('DISPONIBILIDAD'), width: 85, template: "<div id='disponibilidad' style='width:98%;height:32px;margin:0px;padding:0px;margin-top:6px;'></div>" },
                        { field: "datosSeguimiento.EficienciaTurno", title: window.app.idioma.t('EFICIENCIA'), width: 85, template: "<div id='eficiencia'style='width:98%;height:32px;margin:0px;padding:0px;margin-top:6px;'></div>" },
                        {
                            field: "datosSeguimiento.OeeMaquina", title: window.app.idioma.t('OEE') + ' ' + window.app.idioma.t('MAQUINA'),
                            width: 85, template: "<div id='oee' style='width:98%;height:32px;margin:0px;padding:0px;margin-top:6px;'></div>"
                        }

                    ],
                    dataBinding: self.resizeGrid,
                    dataBound: function (e) {
                        var grid = this;
                        var items = grid.items();

                        items.each(function (idx, row) {
                            var model = grid.dataItem(row);
                            $(row).find("#eficiencia").kendoProgressBar({
                                type: "percent",
                                max: 100,
                                value: model.datosSeguimiento.EficienciaTurno,
                                animation: true
                            }).data("kendoProgressBar");

                            $(row).find("#disponibilidad").kendoProgressBar({
                                type: "percent",
                                max: 100,
                                value: model.datosSeguimiento.DisponibilidadTurno,
                                animation: true
                            }).data("kendoProgressBar");

                            $(row).find("#oee").kendoProgressBar({
                                type: "percent",
                                max: 100,
                                value: model.datosSeguimiento.OeeMaquina,
                                animation: true
                            }).data("kendoProgressBar");
                        });

                        //$('.k-grid-header').css('padding-right', '21px');
                    }
                })

                $("#center-pane").css("overflow", "hidden");
            },
            events: {
            },
            resizeGrid: function (panel) {
                var gridElement = $("#gridMaquinas");
                var dataArea = gridElement.find(".k-grid-content");

                var height = $(window).height() - $("#header").height() - $("#footer").height() - $(".cabeceraVista").height() - $("#tblFiltroResumen").height();

                dataArea.height(height - 65);
            },
            unbindEvents: function () {
                var self = this;
                $.each(Backbone._events, function (eventName, event) {
                    var isInEventosLinea = $.grep(self.eventosLinea, function (value, index) {
                        return eventName.indexOf(value) >= 0;
                    });
                    if (isInEventosLinea.length > 0) {
                        Backbone.off(eventName);
                    }
                });
            },
            bindEvents: function () {
                var self = this;
                $.each(self.eventosLinea, function (index, eventName) {
                    Backbone.on(eventName + window.app.lineaSel.numLinea, self.actualiza, self);
                });
            },
            actualiza: function (cambioPuesto) {
                var self = this;

                if (cambioPuesto) {
                    self.unbindEvents();
                    self.bindEvents();
                }

                $.ajax({
                    type: "GET",
                    url: "../api/DatosConsolidadosTurnoActual/" + window.app.lineaSel.numLinea,
                    dataType: 'json',
                    cache: false
                }).success(function (data) {
                    self.turnoActualLoad = true;
                    self.TurnosActual = data;
                    if (self.turnoActualLoad && self.lineasLoad) {
                        self.turnoActualLoad = false;
                        self.lineasLoad = false;
                        if (self.rendered) {
                            self.reload();
                        } else if (!self.prerender) {
                            self.render();
                        }
                    }
                }).error(function (e, msg, ex) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_LINEA_ACTUAL') + ': ' + ex, 4000);
                    }
                }).done(function () {
                    if (self.TurnosActual && self.linea) {
                        self.turnoActualLoad = false;
                        self.lineasLoad = false;
                        if (self.rendered) {
                            self.reload();
                        } else if (!self.prerender) {
                            self.render();
                        }
                    }
                });

                $.ajax({
                    type: "GET",
                    url: "../api/lineas/" + window.app.lineaSel.id + "/",
                    dataType: 'json',
                    cache: false
                }).success(function (data) {
                    self.lineasLoad = true;
                    self.linea = data;
                    if (self.turnoActualLoad && self.lineasLoad) {
                        self.turnoActualLoad = false;
                        self.lineasLoad = false;
                        if (self.rendered) {
                            self.reload();
                        } else if (!self.prerender) {
                            self.render();
                        }
                    }
                }).error(function (e, msg, ex) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_LINEA_ACTUAL') + ': ' + ex, 4000);
                    }
                }).done(function () {
                    if (self.linea && self.TurnosActual) {
                        self.turnoActualLoad = false;
                        self.lineasLoad = false;
                        if (self.rendered) {
                            self.obtenerTurnoAnterior(self);
                        } else if (!self.prerender) {
                            self.render();
                        }
                    }
                });
            },
            reload: function () {
                var self = this;
                $("#gridMaquinas").data('kendoGrid').dataSource.read();
                $("#gridMaquinas").data("kendoGrid").dataSource.data(this.linea.obtenerMaquinas);
                $("#gridMaquinas").data('kendoGrid').refresh();

                self.$("#pbDispTurnoAct").data("kendoProgressBar").value(self.TurnosActual.disponibilidad);
                self.$("#pbDispTurnoAnt").data("kendoProgressBar").value(self.TurnosAnterior.disponibilidad);
                self.$("#pbRendTurnoAct").data("kendoProgressBar").value(self.TurnosActual.eficiencia);
                self.$("#pbRendTurnoAnt").data("kendoProgressBar").value(self.TurnosAnterior.eficiencia);
                self.$("#pbOEEturnoAct").data("kendoProgressBar").value(self.TurnosActual.OEE);
                self.$("#pbOEEturnoAnt").data("kendoProgressBar").value(self.TurnosAnterior.oee);

                this.$("#paletsTurnoAnt").html(self.TurnosAnterior.palets);
                this.$("#envasesTurnoAnt").html(self.TurnosAnterior.envases);
                this.$("#cajasTurnoAnt").html(self.TurnosAnterior.cajas);
                this.$("#paletsTurnoAct").html(self.TurnosActual.palets);
                this.$("#envasesTurnoAct").html(self.TurnosActual.envases);
                this.$("#cajasTurnoAct").html(self.TurnosActual.cajas);
            },
            eliminar: function () {
                Backbone.off('eventNotificacionOrden' + window.app.lineaSel.numLinea);
                Backbone.off('eventNotificacionMaquinas' + window.app.lineaSel.numLinea);
                Backbone.off('eventNotificacionMaquina' + window.app.lineaSel.numLinea);
                Backbone.off('eventNotificacionTurno');
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
            /// Miguel Angel Suero Aviles 30/10/2017. bug 2871, inclusion funcion  para el cambio de turno
            obtenerTurnoAnterior: function (self) {
                $.ajax({
                    type: "GET",
                    async: true,
                    url: "../api/DatosConsolidadosTurnoAnterior/" + window.app.lineaSel.numLinea,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        self.TurnosAnterior = data;
                        self.reload();
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EN_LA_OBTENCION'), 4000);
                            // En caso de error recarga la pagina
                            self.reload();
                        }
                    }
                });
            }
        });

        return SeguimientoLinea;
    });