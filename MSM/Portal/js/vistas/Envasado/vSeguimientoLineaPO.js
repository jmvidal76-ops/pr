define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/seguimientoLinea.html', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaSeguimientoLinea, Not) {
        var SeguimientoLinea = Backbone.View.extend({
            tagName: 'div',
            template: _.template(PlantillaSeguimientoLinea),
            numLinea: null,
            id: null,
            TurnosAnterior: null,
            TurnosActual: null,
            dsMaquinasLinea: null,
            rendered: false,
            initialize: function () {
                this.render();
            },
            render: function () {
                $(this.el).html(this.template());
                var self = this;

                //Cargamos combo
                this.$("#selectLinea").kendoDropDownList({
                    dataValueField: "id",
                    template: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    valueTemplate: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "numLinea", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                this.$("#pbOEEturnoAnt").kendoProgressBar({
                    type: "percent",
                    max: 100,
                    value: 0,
                    animation: false
                }).data("kendoProgressBar");

                this.$("#pbDispTurnoAct").kendoProgressBar({
                    type: "percent",
                    max: 100,
                    value: 0,
                    animation: false
                }).data("kendoProgressBar");

                this.$("#pbDispTurnoAnt").kendoProgressBar({
                    type: "percent",
                    max: 100,
                    value: 0,
                    animation: false
                }).data("kendoProgressBar");

                this.$("#pbRendTurnoAct").kendoProgressBar({
                    type: "percent",
                    max: 100,
                    value: 0,
                    animation: false
                }).data("kendoProgressBar");

                this.$("#pbRendTurnoAnt").kendoProgressBar({
                    type: "percent",
                    max: 100,
                    value: 0,
                    animation: false
                }).data("kendoProgressBar");

                this.$("#pbOEEturnoAct").kendoProgressBar({
                    type: "percent",
                    max: 100,
                    value: 0,
                    animation: false
                }).data("kendoProgressBar");

                $("#center-pane").css("overflow", "hidden");
            },
            events: {
                'click #btnFiltrar': 'filtrar',
            },
            filtrar: function (e) {
                e.preventDefault();
                var self = this;

                if (self.numLinea) {
                    self.unbindEvents();
                }

                if ($("#selectLinea").val() != "") {
                    var valorOpcSel = this.$("#selectLinea option:selected").val();
                    var linea = $("#selectLinea").data("kendoDropDownList").dataSource.get(valorOpcSel);
                    self.numLinea = linea.numLinea;
                    self.id = _.find(window.app.planta.lineas, function(lin) {
                        return lin.numLinea == self.numLinea         
                    });

                    self.bindEvents();
                    self.actualiza();
                }
            },
            unbindEvents: function () {
                var self = this;
                Backbone.off('eventNotificacionMaquinas' + self.numLinea);
                Backbone.off('eventNotificacionMaquina' + self.numLinea);
            },
            bindEvents: function () {
                var self = this;
                Backbone.on('eventNotificacionMaquinas' + self.numLinea, this.actualiza, this);
                Backbone.on('eventNotificacionMaquina' + self.numLinea, this.actualiza, this);
            },
            resizeGrid: function (panel) {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();

                var gridElement = $("#gridMaquinas");
                dataArea = gridElement.find(".k-grid-content");
                gridHeight = gridElement.innerHeight();
                gridHeaderHeight = gridElement.find(".k-grid-header").innerHeight();

                dataArea.height(contenedorHeight - gridHeaderHeight - cabeceraHeight - $("#divFiltros").innerHeight() -
                    $("#tblFiltroResumen").innerHeight() - 15);
            },
            actualiza: function () {
                var self = this;

                if (self.numLinea) {
                    $.ajax({
                        type: "GET",
                        async: false,
                        url: "../api/DatosConsolidadosTurnoAnterior/" + self.numLinea,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            self.TurnosAnterior = data;
                        },
                        error: function (res) {
                            if (res.status == '403' && res.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENCION_TURNO_ANTERIOR'), 4000);
                            }
                        }
                    });

                    $.ajax({
                        type: "GET",
                        async: false,
                        url: "../api/DatosConsolidadosTurnoActual/" + self.numLinea,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            self.TurnosActual = data;
                        },
                        error: function (res) {
                            if (res.status == '403' && res.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENCION_TURNO_ANTERIOR'), 4000);
                            }
                        }
                    });

                    self.reload();
                }
            },
            renderGrid: function () {
                var self = this;

                self.dsMaquinasLinea = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/obtenerMaquinasLineas/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.linea = self.numLinea

                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    schema: {
                        id: 'maquina',
                        model: {
                            fields: {
                                descripcion: { type: "string" },
                                posicion: { type: "number" },
                                idZona: { type: "string" },
                                NombreZona: { type: "string" },
                                'estado.nombre': { type: "string" },
                                'orden.id': { type: "string" },
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
                    },
                    requestStart: function () {
                        kendo.ui.progress($("#gridMaquinas"), true);
                    },
                    requestEnd: function () {
                        kendo.ui.progress($("#gridMaquinas"), false);
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                });

                $("#gridMaquinas").kendoGrid({
                    dataSource: self.dsMaquinasLinea,
                    // height: '600px',
                    scrollable: true,
                    sortable: true,
                    filterable: false,
                    groupable: false,
                    columns: [
                        {
                            field: "idZona", title: window.app.idioma.t('ZONA'), hidden: true,
                            groupHeaderTemplate: '#=value.split("-")[1]#'
                        },
                        {
                            field: "NombreZona", title: window.app.idioma.t('ZONA'), width: "90px",
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        {
                            field: "posicion", title: window.app.idioma.t('INDICE'), width: "50px",
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        {
                            field: "descripcion", title: window.app.idioma.t('MAQUINA'), width: "185px",
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        {
                            field: "estado.nombre", title: window.app.idioma.t('ESTADO'), width: "60px",
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        {
                            field: "ordenIdMaquina", title: window.app.idioma.t('IDORDEN'), width: "100px",
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        //{
                        //    field: "CantidadWO", title: window.app.idioma.t('CANTIDAD_WO'), width: 60,
                        //    attributes: { style: "text-align: center; font-size: 22px" }
                        //},
                        {
                            field: "datosSeguimiento.CantidadProducidaTurno", title: window.app.idioma.t('CANTIDAD_TURNO'), width: 60,
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        {
                            field: "datosSeguimiento.DisponibilidadTurno", title: window.app.idioma.t('DISPONIBILIDAD'), width: 90,
                            template: "<div id='disponibilidad' style='width:98%;height:32px;margin:0px;padding:0px;margin-top:6px;'></div>"
                        },
                        {
                            field: "datosSeguimiento.EficienciaTurno", title: window.app.idioma.t('EFICIENCIA'), width: 90,
                            template: "<div id='eficiencia'style='width:98%;height:32px;margin:0px;padding:0px;margin-top:6px;'></div>"
                        },
                        {
                            field: "datosSeguimiento.OeeMaquina", title: window.app.idioma.t('OEE') + ' ' + window.app.idioma.t('MAQUINA'), width: 90,
                            template: "<div id='oee' style='width:98%;height:32px;margin:0px;padding:0px;margin-top:6px;'></div>"
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
                    }
                });

                this.rendered = true;
            },
            reload: function () {
                var self = this;
                if (self.rendered) {
                    $("#gridMaquinas").data('kendoGrid').dataSource.read();
                    $("#gridMaquinas").data('kendoGrid').refresh();
                } else {
                    self.renderGrid();
                }

                if (self.TurnosActual) {
                    var pbDispTurnoAct = $("#pbDispTurnoAct").data("kendoProgressBar");
                    pbDispTurnoAct.value(self.TurnosActual.disponibilidad);
                    var pbRendTurnoAct = $("#pbRendTurnoAct").data("kendoProgressBar");
                    pbRendTurnoAct.value(self.TurnosActual.eficiencia);
                    var pbOEEturnoAct = $("#pbOEEturnoAct").data("kendoProgressBar");
                    pbOEEturnoAct.value(self.TurnosActual.OEE);
                }

                if (self.TurnosAnterior) {
                    var pbDispTurnoAnt = $("#pbDispTurnoAnt").data("kendoProgressBar");
                    pbDispTurnoAnt.value(self.TurnosAnterior.disponibilidad);
                    var pbRendTurnoAnt = $("#pbRendTurnoAnt").data("kendoProgressBar");
                    pbRendTurnoAnt.value(self.TurnosAnterior.eficiencia);
                    var pbOEEturnoAnt = $("#pbOEEturnoAnt").data("kendoProgressBar");
                    pbOEEturnoAnt.value(self.TurnosAnterior.oee);
                    self.$("#paletsTurnoAnt").html(self.TurnosAnterior.palets);
                    self.$("#envasesTurnoAnt").html(self.TurnosAnterior.envases);
                    self.$("#cajasTurnoAnt").html(self.TurnosAnterior.cajas);
                }

                if (self.TurnosActual) {
                    self.$("#paletsTurnoAct").html(self.TurnosActual.palets);
                    self.$("#envasesTurnoAct").html(self.TurnosActual.envases);
                    self.$("#cajasTurnoAct").html(self.TurnosActual.cajas);
                }
            },
            eliminar: function () {
                var self = this;
                Backbone.off('eventNotificacionMaquinas' + self.numLinea);
                Backbone.off('eventNotificacionMaquina' + self.numLinea);
                $("#center-pane").css("overflow", "");
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

        return SeguimientoLinea;
    });