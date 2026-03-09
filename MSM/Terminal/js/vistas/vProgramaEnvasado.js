define(['underscore', 'backbone', 'jquery', 'vis', 'text!../../html/ProgramaEnvasado.html', 'compartido/notificaciones'],
    function (_, Backbone, $, vis, Plantilla, Not) {
        var uploadVerProgEnvasado = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            lineas: [],
            input: {},
            output: [],
            timeline: {},
            inicio: new Date((new Date()).getTime() - (7 * 24 * 3600 * 1000)), 
            fin: new Date((new Date()).getTime() + (6 * 24 * 3600 * 1000)), 
            fechaInicio: new Date().getMonday().midnight(),
            fechaFin: undefined,
            idLineaSel: window.app.lineaSel,
            mut: null,
            dataCarga: null,
            template: _.template(Plantilla),
            initialize: function () {
                var self = this;

                self.idLineaSel = window.app.lineaSel;
                self.fechaInicio = new Date().getMonday();
                self.fechaInicio._addDays(-2);
                self.fechaFin = self.fechaInicio.addDays(9);


                self.fechaInicio.setHours(0);
                self.fechaInicio.setMinutes(0);
                self.fechaInicio.setSeconds(0);

                self.fechaFin.setHours(23);
                self.fechaFin.setMinutes(59);
                self.fechaFin.setSeconds(59);

                Backbone.on('eventcambioPuesto', this.refrescar, this);

                self.lineas = [];
                var lineasFiltradas = window.app.lineaSel; 

                var id = lineasFiltradas.id;
                var descripcion = lineasFiltradas.descripcion;
                var numLineaDescripcion = lineasFiltradas.numLineaDescripcion;

                self.lineas.push({
                    "content": window.app.idioma.t('LINEA') + " " + numLineaDescripcion + " - " + descripcion + ' ' + window.app.idioma.t('PLANIFICADA'),
                    "id": id + 'p',
                    "title": window.app.idioma.t('LINEA') + " " + numLineaDescripcion + " - " + descripcion + ' ' + window.app.idioma.t('PLANIFICADA'),
                    "id": id + 'p',
                    "value": 2,
                    "className": 'line0p'
                });

                self.lineas.push({
                    "content": window.app.idioma.t('LINEA') + " " + numLineaDescripcion + " - " + descripcion + ' real',
                    "id": id + 'r',
                    "title": window.app.idioma.t('LINEA') + " " + numLineaDescripcion + " - " + descripcion + ' real',
                    "id": id + 'r',
                    "value": 3,
                    "className": 'line0r'
                });

                self.render();
                self.refrescar();
            },
            actualizarDatosSesion: function () {
                var sesion = window.app.sesion;

                $.ajax({
                    data: JSON.stringify(sesion),
                    type: "POST",
                    async: false,
                    url: "../api/actualizarDatosSesion",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        if (data) {
                            window.app.sesion.set("linea", data.linea);
                            window.app.sesion.set("zona", data.zona);
                            Backbone.trigger('eventActualizaLineaZona');
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ACTUALIZAR_DATOS'), 4000);
                        }
                    }
                });
            },
            asignarLineas: async function (linea) {
                self.lineas = [];
                var lineasFiltradas = window.app.lineaSel;

                var id = lineasFiltradas.id;
                var descripcion = lineasFiltradas.descripcion;
                var numLineaDescripcion = lineasFiltradas.numLineaDescripcion;

                self.lineas.push({
                    "content": window.app.idioma.t('LINEA') + " " + numLineaDescripcion + " - " + descripcion + ' ' + window.app.idioma.t('PLANIFICADA'),
                    "id": id + 'p',
                    "title": window.app.idioma.t('LINEA') + " " + numLineaDescripcion + " - " + descripcion + ' ' + window.app.idioma.t('PLANIFICADA'),
                    "id": id + 'p',
                    "value": 2,
                    "className": 'line0p'
                });

                self.lineas.push({
                    "content": window.app.idioma.t('LINEA') + " " + numLineaDescripcion + " - " + descripcion + ' real',
                    "id": id + 'r',
                    "title": window.app.idioma.t('LINEA') + " " + numLineaDescripcion + " - " + descripcion + ' real',
                    "id": id + 'r',
                    "value": 3,
                    "className": 'line0r'
                });
            },
            actualiza: async function () {
                var self = this;

                self.idLineaSel = window.app.lineaSel;

                self.actualizarDatosSesion();

                self.input.start = self.fechaInicio;
                self.input.end = self.fechaFin;
                self.input.idLinea = self.idLineaSel.id;
                self.output = [];

                $.ajax({
                    url: "../api/ordenes/obtenerOrdenesPlanificadas/",
                    data: JSON.stringify(self.input),
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    type: "POST",
                    cache: true,
                    async: false
                }).done(function (data) {
                    self.dataCarga = data;
                    self.loadDataProgram(self);

                    self.lineas = [];
                    var lineasFiltradas = window.app.lineaSel;

                    var id = lineasFiltradas.id;
                    var descripcion = lineasFiltradas.descripcion;
                    var numLineaDescripcion = lineasFiltradas.numLineaDescripcion;

                    self.lineas.push({
                        "content": window.app.idioma.t('LINEA') + " " + numLineaDescripcion + " - " + descripcion + ' ' + window.app.idioma.t('PLANIFICADA'),
                        "id": id + 'p',
                        "title": window.app.idioma.t('LINEA') + " " + numLineaDescripcion + " - " + descripcion + ' ' + window.app.idioma.t('PLANIFICADA'),
                        "id": id + 'p',
                        "value": 2,
                        "className": 'line0p'
                    });

                    self.lineas.push({
                        "content": window.app.idioma.t('LINEA') + " " + numLineaDescripcion + " - " + descripcion + ' real',
                        "id": id + 'r',
                        "title": window.app.idioma.t('LINEA') + " " + numLineaDescripcion + " - " + descripcion + ' real',
                        "id": id + 'r',
                        "value": 3,
                        "className": 'line0r'
                    });

                    self.render();

                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ORDENES_PLANIFICADAS'), 4000);
                });
            },
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))
                var self = this;

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();
                var altura = contenedorHeight - cabeceraHeight - filtrosHeight - 2;
                var culture = localStorage.getItem("idiomaSeleccionado").split('-')[0];

                // create visualization
                var container = document.getElementById('visualization');
                var options = {
                    groupOrder: function (a, b) {
                        return a.value - b.value;
                    },
                    groupOrderSwap: function (a, b, groups) {
                        var v = a.value;
                        a.value = b.value;
                        b.value = v;
                    },
                    maxHeight: altura,//$("#center-pane")[0].style.height,
                    //height: altura,
                    min: self.inicio,
                    max: self.fin,
                    locale: culture,
                    zoomMin: 1000 * 60 * 60 * 12,
                    zoomMax: 1000 * 60 * 60 * 24 * 15,
                    template: function (item) {
                        return "<strong>" + item.header + "</strong> "
                    }
                };

                if (!!self.timeline.dom)
                    self.timeline.destroy();

                self.timeline = new vis.Timeline(container);
                self.timeline.setOptions(options);
                self.timeline.setGroups(self.lineas);
                self.timeline.setItems(self.output);

                //Cada vez que se avance la linea de tiempo, es decir cuando cambie el estilo, actualizamos le fecha de las ordenes 
                //que esten en producción cada minuto
                self.mut = new MutationObserver(function (mutations, mut) {
                    $.map(self.output, function (data, index) {
                        if (data.estado == +window.app.idioma.t('PRODUCCION') && data.content.indexOf("real") >= 0) {
                            var date = new Date();
                            var difference = date.getTime() - data.end.getTime(); //milliseconds
                            var resultInMinutes = Math.round(difference / 60000);
                            if (resultInMinutes >= 1) {
                                data.end = new Date();
                                self.timeline.setItems(self.output);
                                self.timeline.redraw();
                            }
                        }
                    });
                });

                self.mut.observe(document.querySelector(".vis-current-time"), {
                    'attributes': true,
                    attributeFilter: ["style"]
                });
            },
            events: {
                'click #btnFiltrar': 'filtrar',
                'click #btnDescargaExcel': 'descargarExcel',
                'click #btnDescargaPdf': 'descargarPdf',
            },
            loadDataProgram: function (self) {
                var colores = [];
                var totalCPB = 0;
                var totalEnvases = 0;
                kendo.ui.progress($('#visualization'), true);

                if (self.dataCarga) {
                    for (var i = 0; i < self.dataCarga.length; i++) {
                        colores = [];
                        colores.push("background-color: LightCoral; border-color: LightCoral;");
                        colores.push("background-color: PeachPuff; border-color: PeachPuff;");
                        colores.push("background-color: violet; border-color: violet;");
                        colores.push("background-color: LightGreen; border-color: LightGreen;");
                        colores.push("background-color: orange; border-color: orange;");
                        colores.push("background-color: LightSkyBlue; border-color: LightSkyBlue;");
                        colores.push("background-color: pink; border-color: pink;");
                        colores.push("background-color: Tan; border-color: Tan;");
                        colores.push("background-color: MediumPurple; border-color: MediumPurple;");
                        colores.push("background-color: Silver; border-color: Silver;");
                        colores.push("background-color: Tomato; border-color: Tomato;");
                        colores.push("background-color: CornflowerBlue; border-color: CornflowerBlue;");
                        colores.push("background-color: yellow; border-color: yellow;");

                        if (self.dataCarga[i].CajasPorPalet == 0) {
                            totalCPB = 0;
                            totalEnvases = (self.dataCarga[i].produccion.paletsEtiquetadoraProducidos - self.dataCarga[i].produccion.cantidadPicosPalets) * self.dataCarga[i].EnvasesPorPalet;
                        } else {
                            totalCPB = ((self.dataCarga[i].produccion.paletsEtiquetadoraProducidos - self.dataCarga[i].produccion.cantidadPicosPalets) * self.dataCarga[i].CajasPorPalet) + self.dataCarga[i].produccion.cantidadPicosCajas;
                            totalEnvases = totalCPB * (self.dataCarga[i].EnvasesPorPalet / self.dataCarga[i].CajasPorPalet);
                        }

                        self.output.push({
                            start: new Date(self.dataCarga[i].dFecInicioEstimadoLocal),
                            end: new Date(self.dataCarga[i].dFecFinEstimadoLocal),
                            group: self.dataCarga[i].idLinea + 'p',
                            className: "line" + self.dataCarga[i].numLinea + 'p',
                            content: self.dataCarga[i].id + ' plan',
                            id: self.dataCarga[i].id + ' plan',
                            style: colores[self.dataCarga[i].numLinea - 1],
                            header: self.dataCarga[i].producto.codigo + ' - ' + self.dataCarga[i].producto.nombre + ', ' +
                                window.app.idioma.t('ETIQUETADORA_PALETS') + ': ' + kendo.toString(self.dataCarga[i].cantPlanificada, 'n0') + ', ' +
                                window.app.idioma.t('CPB') + ': ' + kendo.toString(self.dataCarga[i].cantPlanificada * self.dataCarga[i].CajasPorPalet, 'n0') +
                                ', ' + window.app.idioma.t('ENVASES') + ': ' + kendo.toString(self.dataCarga[i].cantPlanificada * self.dataCarga[i].EnvasesPorPalet, 'n0') +
                                ', ' + window.app.idioma.t('HL') + ': ' +
                                kendo.toString(self.dataCarga[i].cantPlanificada * self.dataCarga[i].EnvasesPorPalet * self.dataCarga[i].producto.hectolitros, 'n2'),
                            title: `${self.dataCarga[i].id} - ${window.app.idioma.t('INICIO_PLANIFICADO')}: ` +
                                `${kendo.toString(new Date(self.dataCarga[i].dFecInicioEstimado + 'Z'), kendo.culture().calendars.standard.patterns.MES_FechaHoraMin)} - ` +
                                `${window.app.idioma.t('FIN_PLANIFICADO')}: ` +
                                `${kendo.toString(new Date(self.dataCarga[i].dFecFinEstimado + 'Z'), kendo.culture().calendars.standard.patterns.MES_FechaHoraMin)}`,
                            estado: self.dataCarga[i].estadoActual.nombre
                        })

                        if (new Date(self.dataCarga[i].dFecIniLocal).getFullYear() > 2010) {
                            var fechas = "";
                            if (self.dataCarga[i].estadoActual.nombre == window.app.idioma.t('INICIANDO') ||
                                self.dataCarga[i].estadoActual.nombre == window.app.idioma.t('PRODUCCION')) {

                                fechas = ` - ${window.app.idioma.t('INICIO')}: ` +
                                    `${kendo.toString(new Date(self.dataCarga[i].dFecInicio + 'Z'), kendo.culture().calendars.standard.patterns.MES_FechaHoraMin)} - ` +
                                    `${window.app.idioma.t('FIN_ESTIMADO')}: ` +
                                    `${(self.dataCarga[i].fecFinEstimadoCalculadoTurno === window.app.idioma.t('NO_DISPONIBLE')
                                        || self.dataCarga[i].fecFinEstimadoCalculadoTurno === window.app.idioma.t('FECHA_NO_DISPONIBLE')
                                        ? self.dataCarga[i].fecFinEstimadoCalculadoTurno
                                        : FormatearFechaPorRegion(self.dataCarga[i].fecFinEstimadoCalculadoTurno, kendo.culture().calendars.standard.patterns.MES_FechaHoraMin)
                                    )}`;

                            } else if (!new Date(self.dataCarga[i].dFecFin) < new Date(self.dataCarga[i].dFecInicio) &&
                                (self.dataCarga[i].estadoActual.nombre != window.app.idioma.t('INICIANDO') &&
                                    self.dataCarga[i].estadoActual.nombre != window.app.idioma.t('PRODUCCION'))) {

                                fechas = ` - ${window.app.idioma.t('INICIO')}: ` +
                                    `${kendo.toString(new Date(self.dataCarga[i].dFecInicio + 'Z'), kendo.culture().calendars.standard.patterns.MES_FechaHoraMin)} - ` +
                                    `${window.app.idioma.t('FIN')}: ` +
                                    `${kendo.toString(new Date(self.dataCarga[i].dFecFin + 'Z'), kendo.culture().calendars.standard.patterns.MES_FechaHoraMin)}`;

                            } else {
                                fechas = ` - ${window.app.idioma.t('INICIO')}: ` +
                                    `${kendo.toString(new Date(self.dataCarga[i].dFecInicio + 'Z'), kendo.culture().calendars.standard.patterns.MES_FechaHoraMin)}`;
                            }

                            //self.dataCarga[i].estadoActual.nombre
                            self.output.push({
                                start: new Date(self.dataCarga[i].dFecIniLocal),
                                end: new Date(self.dataCarga[i].dFecFinLocal >= self.dataCarga[i].dFecIniLocal &&
                                    (self.dataCarga[i].estadoActual.nombre != window.app.idioma.t('INICIANDO') &&
                                        self.dataCarga[i].estadoActual.nombre != window.app.idioma.t('PRODUCCION')) ? self.dataCarga[i].dFecFinLocal : new Date()),
                                group: self.dataCarga[i].idLinea + 'r',
                                className: "line" + self.dataCarga[i].numLinea + 'r',
                                content: self.dataCarga[i].id + 'real',
                                id: self.dataCarga[i].id + ' real',
                                style: colores[self.dataCarga[i].numLinea - 1],
                                header: self.dataCarga[i].producto.codigo + ' - ' + self.dataCarga[i].producto.nombre + ', ' +
                                    window.app.idioma.t('ETIQUETADORA_PALETS') + ': ' + kendo.toString(self.dataCarga[i].produccion.paletsEtiquetadoraProducidos - self.dataCarga[i].produccion.cantidadPicosPalets, 'n0') + ', ' +
                                    window.app.idioma.t('CPB') + ': ' + kendo.toString(totalCPB, 'n0') + ', ' +
                                    window.app.idioma.t('ENVASES') + ': ' + kendo.toString(totalEnvases, 'n0') + ', ' +
                                    window.app.idioma.t('HL') + ': ' + kendo.toString(totalEnvases * self.dataCarga[i].producto.hectolitros, 'n2'),
                                title: self.dataCarga[i].id + fechas,
                                estado: self.dataCarga[i].estadoActual.nombre
                            })
                        }
                    }
                }
                kendo.ui.progress($('#visualization'), false);
            },
            refrescar: function () {
                var self = this;
                                
                self.inicio = self.fechaInicio;
                self.fin = self.fechaFin;
                self.idLinea = self.idLineaSel.id;

                self.actualiza();

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var culture = localStorage.getItem("idiomaSeleccionado").split('-')[0];
                var altura = contenedorHeight - cabeceraHeight - 2;

                var options = {
                    groupOrder: function (a, b) {
                        return a.value - b.value;
                    },
                    groupOrderSwap: function (a, b, groups) {
                        var v = a.value;
                        a.value = b.value;
                        b.value = v;
                    },

                    maxHeight: altura,//$("#center-pane")[0].style.height,
                    //height: altura,
                    min: new Date(self.inicio.getFullYear(), self.inicio.getMonth(), self.inicio.getDate()),
                    max: new Date(self.fin.getFullYear(), self.fin.getMonth(), self.fin.getDate() + 1),
                    locale: culture,
                    zoomMin: 1000 * 60 * 60 * 24,
                    //zoomMax: 1000 * 60 * 60 * 24 * 15,
                    template: function (item) {
                        return "<strong>" + item.header + "</strong> "
                    }
                };

                self.timeline.setOptions(options);
                self.timeline.setGroups(self.lineas);
                self.timeline.setItems(self.output);
                self.timeline.redraw();

            },
            filtrar: function () {
                var self = this;

                self.inicio = $("#dtpFechaDesde").data("kendoDatePicker").value();
                self.fin = $("#dtpFechaHasta").data("kendoDatePicker").value();

                if (!self.inicio || !self.fin) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('LAS_FECHAS_INTRODUCIDAS'), 4000);
                    return;
                }

                if (self.inicio > self.fin) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('_LA_FECHA'), 4000);
                    return;
                }

                self.render();
                self.refrescar();
            },
            asignarLineas: function (linea) {
                self.lineas = [];
                var lineasFiltradas = window.app.planta.lineas.filter(o => o.id == linea.id);

                for (var i = 0; i < lineasFiltradas.length; i++) {
                    var id = lineasFiltradas[i].id;
                    var descripcion = lineasFiltradas[i].descripcion;
                    var numLineaDescripcion = lineasFiltradas[i].numLineaDescripcion;

                    self.lineas.push({
                        "content": window.app.idioma.t('LINEA') + " " + numLineaDescripcion + " - " + descripcion + ' ' + window.app.idioma.t('PLANIFICADA'),
                        "id": id + 'p',
                        "title": window.app.idioma.t('LINEA') + " " + numLineaDescripcion + " - " + descripcion + ' ' + window.app.idioma.t('PLANIFICADA'),
                        "id": id + 'p',
                        "value": (i + 1) * 2,
                        "className": 'line' + i + 'p'
                    });

                    self.lineas.push({
                        "content": window.app.idioma.t('LINEA') + " " + numLineaDescripcion + " - " + descripcion + ' real',
                        "id": id + 'r',
                        "title": window.app.idioma.t('LINEA') + " " + numLineaDescripcion + " - " + descripcion + ' real',
                        "id": id + 'r',
                        "value": (i + 1) * 2 + 1,
                        "className": 'line' + i + 'r'
                    });
                }
            },
            descargarExcel: function () {
                $.ajax({
                    type: "GET",
                    url: "../api/obtenerUltimoFicheroPlanificacion/xls/",
                    dataType: 'json',
                    cache: true,
                    async: false
                }).done(function (data) {
                    var bytes = Base64ToArrayBuffer(data[0]);

                    var blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                    var link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = data[1];
                    link.click();
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ALT_ERROR_DOWNLOADING_FILE'), 4000);
                });
            },
            descargarPdf: function () {
                $.ajax({
                    type: "GET",
                    url: "../api/obtenerUltimoFicheroPlanificacion/pdf/",
                    dataType: 'json',
                    cache: true,
                    async: false
                }).done(function (data) {
                    var bytes = Base64ToArrayBuffer(data[0]);

                    var blob = new Blob([bytes], { type: "application/pdf" });
                    var link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);
                    link.download = data[1];
                    link.click();
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ALT_ERROR_DOWNLOADING_FILE'), 4000);
                });
            },
            eliminar: function () {
                // same as this.$el.remove();
                var self = this;
                self.mut.disconnect();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltros").innerHeight();

                var gridElement = $("#gridProgramasEnvasado"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;

                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            }
        });

        return uploadVerProgEnvasado;
    });