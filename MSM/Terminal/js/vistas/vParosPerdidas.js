define(['underscore', 'backbone', 'jquery', 'vistas/vDatosParoPerdida', 'vistas/vJustificacionParo', 'vistas/vDlgFraccionarParo', 'vistas/vJustificacionMultiplesParos',
    'vistas/vJustificacionPerdida', 'vistas/vJustificacionMultiplesPerdidas', 'text!../../html/parosPerdidas.html', 'compartido/notificaciones',
    '../../../scripts/utils'],
    function (_, Backbone, $, VistaDatosParoPerdida, VistaJustificacionParo, VistaFraccionarParo, VistaJustificacionMultiplesParos, VistaJustificacionPerdida,
              VistaJustificacionMultiplesPerdidas, PlantillaParosPerdidas, Not, utils) {
        var ParosPerdidas = Backbone.View.extend({
            ventanaDetalleParo: null,
            ventanaJustificaParo: null,
            todasmaquinas: [],
            tiposTurno: [],
            gridParos: null,
            gridPerdidas: null,
            requests: [],
            turno: null,
            turnoAnterior: null,
            tipoTurno: null,
            
            template: _.template(PlantillaParosPerdidas),
            initialize: function (options) {
                Backbone.on('eventParoJustificado', this.actualiza, this);
                Backbone.on('eventParoFraccionado', this.actualiza, this);
                Backbone.on('eventActProd', this.recargarResumen, this);
                Backbone.on('eventCambioTurnoActual', this.actualiza, this);
                var self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/tiposTurnosFabrica/",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.tiposTurno = data.filter(function (item) {
                        return item.id > 0 && item.id <= 3;
                    });
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_TIPOS_TURNO'), 4000);
                    }
                });

                this.cargaDatosInicial();                
                this.render();
            },
            cambiarFechaYTipoTurno: function (fecha, tipoTurno) {
                let self = this;

                if (!tipoTurno) {
                    tipoTurno = self.getTipoTurno(fecha)
                }

                if (tipoTurno == 3 && fecha.getHours < 12) {
                    fecha._addDays(-1)
                }

                self.tipoTurno = tipoTurno

                self.$("#fechaFiltro").data("kendoDatePicker").value(fecha.midday());
                self.$("#ddlTurno").data("kendoDropDownList").value(self.tipoTurno);

            },
            cargaDatosInicial: function () {
                let self = this;

                self.setTodasMaquinas();

                let fecha = new Date();
                self.tipoTurno = self.getTipoTurno(fecha);
                
                setTimeout(() => {
                    if (!window.app.vistaPrincipal.cargandoTurno) {
                        self.cargaDatosTurno(window.app.vistaPrincipal.turnoActual);
                    }
                })                
            },
            cargaTurno: async function (idTurno, fecha, idLinea, fechaInicio, fechaFin) {
                let self = this;

                return new Promise((resolve, reject) => {

                    var req = $.ajax({
                        type: "GET",
                        url: `../api/turnos/breaks?idLinea=${idLinea}${fecha ? '&fechaActual=' + fecha.toISOString() : ''}${idTurno ? '&idturno=' + idTurno : ''}` +
                            `${fechaInicio ? '&fechaInicio=' + fechaInicio.toISOString() : ''}${fechaFin ? '&fechaFin=' + fechaFin.toISOString() : ''}`,
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
                            if (e.statusText == "abort") {
                                return;
                            }
                            reject(e);
                        }
                    });

                    self.requests.push(req);
                })
            },
            cargaTurnoConsecutivo: async function (anterior, idTurno, fecha, idLinea) {
                let self = this;

                return new Promise((resolve, reject) => {

                    let req = $.ajax({
                        type: "GET",
                        url: `../api/turnos/breaksConsecutivo?anterior=${anterior.toString()}&idLinea=${idLinea}${idTurno ? '&idturno=' + idTurno : ''}${fecha ? '&fechaActual=' + fecha.toISOString() : ''}`,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {                            

                            resolve(res);
                        },
                        error: function (e) {
                            if (e.statusText == "abort") {
                                return;
                            }
                            e.type = `TURNO_${anterior ? "ANTERIOR" : "SIGUIENTE"}`
                            reject(e);
                        }
                    });

                    self.requests.push(req)
                })
            },
            cargaResumenTurno: async function (idTurno, idTurnoAnterior, numLinea) {
                let self = this;

                return new Promise((resolve, reject) => {

                    let req = $.ajax({
                        type: "GET",
                        url: `../api/resumenturno/${numLinea}/${idTurno}/${idTurnoAnterior}`,
                        dataType: 'json',
                        cache: true,
                        contentType: "application/json; charset=utf-8",
                        success: function (res) {

                            resolve(res);
                        },
                        error: function (e) {
                            if (e.statusText == "abort") {
                                return;
                            }
                            e.type = "RESUMEN"
                            reject(e);
                        }
                    });

                    self.requests.push(req)
                })
            },

            cargaParos: async function (numLinea, idTurno) {
                let self = this;

                return new Promise((resolve, reject)=>{
                    let req = $.ajax({
                        type: "GET",
                        url: `../api/paros/${numLinea}/${idTurno}`,
                        dataType: 'json',
                        cache: true,
                        contentType: "application/json; charset=utf-8",
                        success: function (res) {

                            resolve(res);
                        },
                        error: function (e) {
                            if (e.statusText == "abort") {
                                return;
                            }
                            e.type = "PAROS"
                            reject(e);
                        }
                    });

                    self.requests.push(req)

                })
            },
            cargaPerdidas: async function (numLinea, idTurno) {
                let self = this;

                return new Promise((resolve, reject) => {
                    let req = $.ajax({
                        type: "GET",
                        url: `../api/perdidas/${numLinea}/${idTurno}`,
                        dataType: 'json',
                        cache: true,
                        contentType: "application/json; charset=utf-8",
                        success: function (res) {

                            resolve(res);
                        },
                        error: function (e) {
                            if (e.statusText == "abort") {
                                return;
                            }
                            e.type = "PERDIDAS"
                            reject(e);
                        }
                    });

                    self.requests.push(req)

                })
            },
            cargaDatosTurno: function (turno) {
                let self = this;

                let idLinea = window.app.lineaSel.id;
                var numLinea = window.app.lineaSel.numLinea

                kendo.ui.progress($("#panelDatos"), true);
                let promises = [];
                // Cancelamos todas las request pendientes
                for (let r of self.requests){
                    r.abort()
                }

                self.requests = []

                // Cargamos el turno anterior
                if (turno) {
                    promises.push(self.cargaTurnoConsecutivo(true, turno.Id, null, idLinea));

                    // Cargamos los paros y perdidas
                    // Comprobamos que no sea una linea agrupada
                    let grupo = window.app.lineaSel.Grupo;
                    let lineaEspecial
                    if (grupo) {
                        var lineasEspeciales = $.grep(window.app.planta.lineas, function (l, i) {
                            return l.Grupo == grupo;
                        });

                        lineaEspecial = lineasEspeciales.reduce(function (prev, current) {
                            return (prev.numLinea < current.numLinea) ? prev : current
                        });
                    }

                    if (!grupo || (lineaEspecial && lineaEspecial.numLinea == numLinea)) {
                        promises.push(self.cargaParos(numLinea, turno.Id));
                        promises.push(self.cargaPerdidas(numLinea, turno.Id));
                    }
                } else {
                    let fechaSeleccionada = self.obtenerFechaFiltros()
                    if (!fechaSeleccionada) {
                        kendo.ui.progress($("#panelDatos"), false);
                        return
                    }
                    promises.push(self.cargaTurnoConsecutivo(true, null, fechaSeleccionada, idLinea));
                }

                self.turno = turno;
                Promise.all(promises).then(async function (values) {
                    self.turnoAnterior = values[0];
                    let paros = values[1] || [];
                    let perdidas = values[2] || [];

                    let resumenTurno = await self.cargaResumenTurno(turno ? turno.Id : null, self.turnoAnterior ? self.turnoAnterior.Id : null, numLinea);

                    self.mostrarDatosTurno(resumenTurno, paros, perdidas);
                })
                .catch((er) => {
                    kendo.ui.progress($("#panelDatos"), false);
                    console.log(er)
                    if (er.type) {
                        if (er.type.includes("RESUMEN")) {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_RESUMEN_TURNOS'), 4000);
                        }
                        else if (er.type.includes("PAROS")) {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_PAROS'), 4000);
                        }
                        else if (er.type.includes("PERDIDAS")) {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_PERDIDAS'), 4000);
                        }
                        else if (er.type.includes("ANTERIOR")) {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_TURNO_ANTERIOR'), 4000);
                        }
                        else if (er.type.includes("SIGUIENTE")) {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_TURNO_SIGUIENTE'), 4000);
                        }
                    }
                    else
                    {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_TURNOS'), 4000);
                    }
                });                
            },
            mostrarDatosTurno: function (resumenTurno, paros, perdidas) {
                let self = this;

                kendo.ui.progress($("#panelDatos"), false);

                if (!self.turno) {
                    Not.crearNotificacion('', '', window.app.idioma.t('ERROR_NO_TURNOS_LINEA_FECHA'), 4000);

                    self.$('.actualParos').removeClass('bordeNoJustificado');
                    self.$('.actualPerdidas').removeClass('bordeNoJustificado');

                    self.$('#totalParosNojustificados').val(0);
                    self.$('#tiempoParosNojustificados').val(0);
                    self.$('#totalPerdidasNojustificadas').val(0);
                    self.$('#tiempoPerdidasNojustificadas').val(0);
                }
                else
                {
                    if (resumenTurno.totalParosNojustificados > 0) {
                        self.$('.actualParos').addClass('bordeNoJustificado');
                    } else {
                        self.$('.actualParos').removeClass('bordeNoJustificado');
                    }
                    self.$('#totalParosNojustificados').val(resumenTurno.totalParosNojustificados);
                    self.$('#tiempoParosNojustificados').val(resumenTurno.tiempoParosNojustificados);

                    if (resumenTurno.totalPerdidasNojustificadas > 0) {
                        self.$('.actualPerdidas').addClass('bordeNoJustificado');
                    } else {
                        self.$('.actualPerdidas').removeClass('bordeNoJustificado');
                    }
                    self.$('#totalPerdidasNojustificadas').val(resumenTurno.totalPerdidasNojustificadas);
                    self.$('#tiempoPerdidasNojustificadas').val(resumenTurno.tiempoPerdidasNojustificadas);
                }

                if (!self.turnoAnterior) {
                    self.$('.anteriorParos').removeClass('bordeNoJustificado');
                    self.$('.anteriorPerdidas').removeClass('bordeNoJustificado');

                    self.$('#ultimaHoraTurnoAnteriortotalParosNojustificados').val(0);
                    self.$('#ultimaHoraTurnoAnteriortiempoParosNojustificados').val(0);
                    self.$('#ultimaHoraTurnoAnteriortotalPerdidasNojustificadas').val(0);
                    self.$('#ultimaHoraTurnoAnteriortiempoPerdidasNojustificadas').val(0);

                    self.$("#datosTurnoAnterior").html("");
                }
                else {
                    if (resumenTurno.ultimaHoraTurnoAnterior.totalParosNojustificados > 0) {
                        self.$('.anteriorParos').addClass('bordeNoJustificado');
                    } else {
                        self.$('.anteriorParos').removeClass('bordeNoJustificado');
                    }
                    self.$('#ultimaHoraTurnoAnteriortotalParosNojustificados').val(resumenTurno.ultimaHoraTurnoAnterior.totalParosNojustificados);
                    self.$('#ultimaHoraTurnoAnteriortiempoParosNojustificados').val(resumenTurno.ultimaHoraTurnoAnterior.tiempoParosNojustificados);

                    if (resumenTurno.ultimaHoraTurnoAnterior.totalPerdidasNojustificadas > 0) {
                        self.$('.anteriorPerdidas').addClass('bordeNoJustificado');
                    } else {
                        self.$('.anteriorPerdidas').removeClass('bordeNoJustificado');
                    }
                    self.$('#ultimaHoraTurnoAnteriortotalPerdidasNojustificadas').val(resumenTurno.ultimaHoraTurnoAnterior.totalPerdidasNojustificadas);
                    self.$('#ultimaHoraTurnoAnteriortiempoPerdidasNojustificadas').val(resumenTurno.ultimaHoraTurnoAnterior.tiempoPerdidasNojustificadas);
                }

                if (paros) {
                    self.$("#gridParos").data("kendoGrid").dataSource.data(paros);
                    self.filtrarParosJustificados();
                }

                if (perdidas) {
                    self.$("#gridPerdidas").data("kendoGrid").dataSource.data(perdidas);
                    self.filtrarPerdidasJustificadas();
                }

                self.$("#datosTurnoAnterior").html(kendo.toString(new Date(self.turnoAnterior.Fecha), 'dd/MM/yyyy') + " " + window.app.idioma.t("TURNO"+self.turnoAnterior.IdTipoTurno))

            },
            setTodasMaquinas: function () {
                var self = this;

                $.ajax({
                    url: "../api/MaquinasLinea/" + window.app.lineaSel.id + "/",
                    dataType: 'json',
                    async: false
                }).done(function (listaMaquinas) {
                    self.todasmaquinas = listaMaquinas;
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_MAQUINAS'), 4000);
                    }
                });
            },
            events: {
                "click #btnJustificarParosSel": "justificarParosSel",
                "click #btnJustificarPerdidasSel": "justificarPerdidasSel",
                "change #chkParosJustificados": "filtrarParosJustificados",
                "change #chkPerdidasJustificadas": "filtrarPerdidasJustificadas",
                "click #btnTurnoActual": "irTurnoActual",
                "click #btnTurnoAtras": "moverTurnoAtras",
                "click #btnTurnoAdelante": "moverTurnoAdelante",
                "change #fechaFiltro": "turnoSeleccionado",
                "change #ddlTurno": 'turnoSeleccionado',
            },
            recargarResumen: async function () {
                let self = this
                let numLinea = window.app.lineaSel.numLinea

                kendo.ui.progress($("#panelDatos"), true);
                try
                {
                    let resumenTurno = await self.cargaResumenTurno(self.turno ? self.turno.Id : null, self.turnoAnterior ? self.turnoAnterior.Id : null, numLinea);

                    self.mostrarDatosTurno(self.turno, self.turnoAnterior, resumenTurno);
                }
                catch (er) {
                    kendo.ui.progress($("#panelDatos"), false);
                }                
            },
            actualiza: function () {
                let self = this;

                self.turno = null;
                self.turnoAnterior = null;

                self.setTodasMaquinas();

                self.turnoSeleccionado();
            },
            getTipoTurno: function (fecha) {
                var self = this;
                var tipoTurno = null;
                var turno = window.app.planta.turnoActual[window.app.lineaSel.numLinea - 1];
                if (turno && turno.turnoProductivo) {
                    tipoTurno = turno.tipo.id;
                } else {
                    var tTurno = self.getTipoTurnoFecha(fecha);
                    if (tTurno) {
                        tipoTurno = tTurno;
                    }
                }
                return tipoTurno;
            },
            getTipoTurnoFecha: function (fecha) {
                var self = this;

                let turnOffset = GetHourFromDate(self.tiposTurno[0].inicio, fecha);
                let result = 1;

                let turnHour = fecha.getHours() - turnOffset + fecha.getMinutes() / 60;
                if (turnHour < 0) {
                    turnHour += 24;
                }

                for (let tt of self.tiposTurno) {
                    let start = GetHourFromDate(tt.inicio, fecha) - turnOffset;
                    let end = GetHourFromDate(tt.fin, fecha) - turnOffset;

                    if (start < 0) start += 24;
                    if (end <= 0) end += 24;

                    if (start > end) {
                        // Turno que cruza medianoche
                        if (turnHour >= start || turnHour < end) {
                            result = tt.id;
                            break;
                        }
                    } else {
                        if (turnHour >= start && turnHour < end) {
                            result = tt.id;
                            break;
                        }
                    }
                }

                return result;
            },
            obtenerFechaFiltros: function(inicio = true) {
                let self = this;

                let dt = self.$("#fechaFiltro").data("kendoDatePicker").value();
                let tipoTurno = Number(self.$("#ddlTurno").data("kendoDropDownList").value());

                if (!dt) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FECHA_INCORRECTA'), 3000);
                    return null
                }

                let tTurno = self.tiposTurno.find(f => f.id == tipoTurno)
                let dateYear = dt.getFullYear()

                let time = new Date((inicio ? tTurno.inicio : tTurno.fin).replace("1899", dateYear)).getHours()

                dt = new Date(dt.setHours(time, 0, 0, 0))
                if (!inicio && tipoTurno == 3 && dt.getHours() > 0) {
                    dt._addDays(1)
                }

                return dt

            },
            turnoSeleccionado: async function () {
                let self = this;

                let dt = self.$("#fechaFiltro").data("kendoDatePicker").value();
                let tipoTurno = Number(self.$("#ddlTurno").data("kendoDropDownList").value());

                if (!dt) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FECHA_INCORRECTA'), 3000);                    
                    return
                }
                kendo.ui.progress($("#panelDatos"), true);

                // si el turno seleccionado es el actual, podemos ahorrarnos la llamada para obtenerlo ya que siempre está cargado en la vistaPrincipal
                let actualDt = new Date();
                let actualTipoTurno = self.getTipoTurno(actualDt);
                if (actualTipoTurno == 3) {
                    actualDt._addDays(-1)
                }

                if (actualDt.toDateString() == dt.toDateString() && actualTipoTurno == tipoTurno) {                    
                    self.cargaDatosTurno(window.app.vistaPrincipal.turnoActual)
                }
                else {

                    let fechaTurnoInicio = self.obtenerFechaFiltros();
                    let fechaTurnoFin = self.obtenerFechaFiltros(false);
                    try {
                        let turno = await self.cargaTurno(null, null, window.app.lineaSel.id, fechaTurnoInicio, fechaTurnoFin);

                        self.cargaDatosTurno(turno);
                    }
                    catch (er) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_TURNOS'), 4000);
                        kendo.ui.progress($("#panelDatos"), false);
                    }                    
                }
            },
            irTurnoActual: function () {
                var turnoActual = window.app.vistaPrincipal.turnoActual
                this.cambiarFechaYTipoTurno(new Date(), turnoActual ? turnoActual.IdTipoTurno : null)
                this.cargaDatosTurno(turnoActual)
            },
            moverTurnoAtras: async function () {
                let self = this;
                let turnoCargar;
                let idLinea = window.app.lineaSel.id;

                kendo.ui.progress($("#panelDatos"), true);

                if (self.turnoAnterior) {                    
                    turnoCargar = self.turnoAnterior                    
                }
                else
                {
                    try {
                        if (self.turno) {
                            turnoCargar = await self.cargaTurnoConsecutivo(true, self.turno.Id, null, idLinea)
                        }
                        else {
                            let fechaTurno = self.obtenerFechaFiltros();
                            if (!fechaTurno) {
                                kendo.ui.progress($("#panelDatos"), false);
                                return
                            }

                            turnoCargar = await self.cargaTurnoConsecutivo(true, null, fechaTurno, idLinea)
                        }
                    }
                    catch (er) {
                        kendo.ui.progress($("#panelDatos"), false);
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_TURNO_ANTERIOR'), 4000);
                        return
                    }
                }

                if (!turnoCargar) {
                    kendo.ui.progress($("#panelDatos"), false);
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_TURNO_PLANIFICADO'), 4000);
                    return;
                }
                self.cambiarFechaYTipoTurno(new Date(turnoCargar.Fecha), turnoCargar.IdTipoTurno)
                self.cargaDatosTurno(turnoCargar)
            },
            moverTurnoAdelante: async function () {
                let self = this;
                let turnoCargar;
                let idLinea = window.app.lineaSel.id;

                kendo.ui.progress($("#panelDatos"), true);

                try {
                    if (self.turno) {
                        turnoCargar = await self.cargaTurnoConsecutivo(false, self.turno.Id, null, idLinea)
                    }
                    else {
                        let fechaTurno = self.obtenerFechaFiltros(false);
                        if (!fechaTurno) {
                            kendo.ui.progress($("#panelDatos"), false);
                            return
                        }

                        turnoCargar = await self.cargaTurnoConsecutivo(false, null, fechaTurno, idLinea)
                    }
                }
                catch (er) {
                    kendo.ui.progress($("#panelDatos"), false);
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_TURNO_SIGUIENTE'), 4000);
                    return
                }                

                if (!turnoCargar) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_TURNO_PLANIFICADO'), 4000);
                    kendo.ui.progress($("#panelDatos"), false);
                    return;
                }
                self.cambiarFechaYTipoTurno(new Date(turnoCargar.Fecha), turnoCargar.IdTipoTurno)
                self.cargaDatosTurno(turnoCargar)
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());

                self.$("#fechaFiltro").kendoDatePicker({
                    value: new Date(),
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                self.$("#ddlTurno").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: self.tiposTurno,
                    value: self.tipoTurno
                });

                self.$("#btnTurnoActual").kendoButton({ imageUrl: "img/time.png" });

                self.$("#tpParosPerdidas").kendoTabStrip({
                    animation: {
                        open: {
                            effects: "fadeIn"
                        }
                    }
                });

                this.$('.keyboardOn').addClass("ui-keyboard-input ui-widget-content ui-corner-all");

                self.gridParos = self.$("#gridParos").kendoGrid({
                    dataSource: {
                        schema: {
                            model: {
                                id: "id",
                                fields: {
                                    'id': { type: "number", editable: false, nullable: false },
                                    'IdTipoParoPerdida': { type: "number" },
                                    'timeCategory': { type: "number" },
                                    'justificado': { type: "bool" },
                                    'lote': { type: "string" },
                                    'fechaHora': { type: "string" },
                                    'fechaHoraUTC': { type: "number" },
                                    'fechaHoraFinUTC': { type: "number" },
                                    'duracion': { type: "string" },
                                    'maquina': { type: "string" },
                                    'descmaquina': { type: "string" },
                                    'estadoLinea': { type: "string" },
                                    'motivo': { type: "string" },
                                    'causa': { type: "string" },
                                    'motivoId': { type: "string" },
                                    'causaId': { type: "string" },
                                    'idMaquinaResponsable': { type: "string" },
                                    'nombreMaquinaResponsable': { type: "string" },
                                    'idEquipoConstructivo': { type: "string" },
                                    'nombreEquipoConstructivo': { type: "string" },
                                    'descripcion': { type: "string" },
                                    'observaciones': { type: "string" }
                                }
                            }
                        }
                    },
                    toolbar: [
                        {
                            name: "justificar",
                            text: window.app.idioma.t('JUSTIFICAR_SELECCIONADO'),
                            template: "<a class='k-button' id='btnJustificarParosSel' style='margin-left:20px;'><span class='k-icon k-edit'></span>" + window.app.idioma.t('JUSTIFICAR_SELECCIONADO') + "</a>"
                        },
                        {
                            name: "verJustificados",
                            text: window.app.idioma.t('VER_JUSTIFICADOS'),
                            template: "<label style='font-size:20px; font-weight:normal;'><input id='chkParosJustificados' type='checkbox' name='checkbox' value='value' style='width: 22px;	height: 22;margin-left:20px;margin-right:10px;margin-top:5px;'>" + window.app.idioma.t('VER_JUSTIFICADOS') + "</label>"
                        }
                    ],
                    scrollable: true,
                    selectable: false,
                    filterable: false,
                    sortable: false,
                    pageable: false,
                    resizable: true,
                    columns: [
                        {
                            title: "",
                            template: '<input class="checkbox" type="checkbox"  style="width: 24px;	height: 24px" />',
                            width: 45,
                            attributes: { style: "text-align: center;" }
                        },
                        {
                            field: "justificado", title: window.app.idioma.t("JUSTIFICADO"),
                            width: 90,
                            template: function (registro) {
                                if (registro.justificado) return "<img src='img/check.png' width='32' height='25' alt='Justificado'/>";
                                else return "<img src='img/redball.png' width='32' height='32' alt='Justificado'/>";
                            },
                            attributes: { style: "text-align: center;" }
                        },
                        {
                            field: "fechaHora",
                            title: window.app.idioma.t("HORA"),
                            width: 150,
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        {
                            field: "maquina",
                            hidden: true,
                            title: window.app.idioma.t("LLENADORA"),
                            width: 170,
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        {
                            field: "descmaquina",
                            title: window.app.idioma.t("LLENADORA"),
                            width: 170,
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        {
                            field: "duracion",
                            title: window.app.idioma.t("DURACION"),
                            width: 130,
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        {
                            field: "motivo",
                            title: window.app.idioma.t("MOTIVO"),
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        {
                            field: "causa",
                            title: window.app.idioma.t("CAUSA"),
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        {
                            field: "nombreMaquinaResponsable",
                            title: window.app.idioma.t("MAQUINA_RESPONSABLE"),
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        //{
                        //    field: "equipoConstructivo.nombre",
                        //    title: window.app.idioma.t("EQUIPO_CONSTRUCTIVO"),
                        //    attributes: { style: "text-align: center; font-size: 22px" } },
                        {
                            command:
                            {
                                template: "<a class='k-button k-button-icontext k-grid-Ver' href='\\#' onclick='verParo(this)' ><span class=' '></span>#=window.app.idioma.t('VER')#</a>",
                            },
                            title: " ",
                            width: 90
                        },
                        {
                            command: {
                                template: "<a class='k-button k-button-icontext k-grid-Editar' href='\\#' onclick='editarParo(this)'><span class=' '></span>#=window.app.idioma.t('EDITAR')#</a>"
                            },
                            title: " ",
                            width: 90
                        },
                        {
                            command: {
                                template: "<a class='k-button k-button-icontext k-grid-Ver' href='\\#' onclick='fraccionarParo(this)' ><span class=' '></span>" + window.app.idioma.t('FRACCIONAR') + "</a>",
                            },
                            title: " ",
                            width: 110
                        }
                    ],
                    dataBound: function () {
                        var grid = this;

                        verParo = function (e) {
                            var dataItem = grid.dataItem($(e).closest("tr"));
                            this.ventanaDetalleParo = new VistaDatosParoPerdida({ model: dataItem, maquinas: self.todasmaquinas });
                        };

                        editarParo = function (e) {
                            var permiso = TienePermiso(19);

                            if (!permiso) {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                return;
                            }

                            var dataItem = grid.dataItem($(e).closest("tr"));
                            this.ventanaJustificaParo = new VistaJustificacionParo({ model: dataItem, maquinas: self.todasmaquinas });
                        };
                        fraccionarParo = function (e) {
                            var permiso = TienePermiso(19);

                            if (!permiso) {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                return;
                            }

                            var dataItem = grid.dataItem($(e).closest("tr"));
                            var minutosTotales = 0;
                            $.ajax({
                                type: "GET",
                                url: "../api/obtenerMinimoParoMayor/" + window.app.lineaSel.numLinea + "/",
                                dataType: 'json',
                                cache: false,
                                async: false,
                                reset: true
                            }).success(function (res) {
                                minutosTotales = res;
                            }).error(function (e) {
                                minutosTotales = 0;
                            });

                            var minutosParo = parseInt(dataItem.duracion.split(':')[0] * 60) + parseInt(dataItem.duracion.split(':')[1]);

                            if (parseInt(minutosParo) >= parseInt((minutosTotales * 2)))
                                this.ventanaFraccionarParo = new VistaFraccionarParo({ model: dataItem });
                            else
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('IMPOSIBLE_FRACCIONAR'), 3000);
                        };

                        self.resizeGrid("#gridParos");
                    }
                }).data("kendoGrid");

                self.gridParos.table.on("click", ".checkbox", self.selectRowParos);

                self.gridPerdidas = self.$("#gridPerdidas").kendoGrid({
                    dataSource: {
                        schema: {
                            model: {
                                id: "id",
                                fields: {
                                    'id': { type: "number", editable: false, nullable: false },
                                    'IdTipoParoPerdida': { type: "number" },
                                    'timeCategory': { type: "number" },
                                    'justificado': { type: "bool" },
                                    'lote': { type: "string" },
                                    'fechaHora': { type: "string" },
                                    'fechaHoraUTC': { type: "number" },
                                    'fechaHoraFinUTC': { type: "number" },
                                    'duracion': { type: "string" },
                                    'maquina': { type: "string" },
                                    'descmaquina': { type: "string" },
                                    'estadoLinea': { type: "string" },
                                    'motivo': { type: "string" },
                                    'causa': { type: "string" },
                                    'motivoId': { type: "string" },
                                    'causaId': { type: "string" },
                                    'idMaquinaResponsable': { type: "string" },
                                    'nombreMaquinaResponsable': { type: "string" },
                                    'idEquipoConstructivo': { type: "string" },
                                    'nombreEquipoConstructivo': { type: "string" },
                                    'descripcion': { type: "string" },
                                    'observaciones': { type: "string" },
                                    'StrDuracionPerdidas': { type: "string" },
                                    'NumeroPerdidas': { type: "number" },
                                    'StrDuracionParosMenores': { type: "string" },
                                    'NumeroParosMenores': { type: "number" },
                                    'strDuracionPerdidaProduccion': { type: "string" }
                                }
                            }
                        }
                    },
                    toolbar: [
                        {
                            name: "justificar",
                            text: window.app.idioma.t('JUSTIFICAR_SELECCIONADO'),
                            template: "<a class='k-button' id='btnJustificarPerdidasSel' style='margin-left:20px;'><span class='k-icon k-edit'></span>" + window.app.idioma.t('JUSTIFICAR_SELECCIONADO') + "</a>"
                        },
                        {
                            name: "verJustificados",
                            text: window.app.idioma.t('VER_JUSTIFICADOS'),
                            template: "<label style='font-size:20px; font-weight:normal;'><input id='chkPerdidasJustificadas' type='checkbox' name='checkbox' value='value' style='width: 22px;	height: 22;margin-left:20px;margin-right:10px;margin-top:5px;'>" + window.app.idioma.t('VER_JUSTIFICADOS') + "</label>"
                        }
                    ],
                    scrollable: true,
                    selectable: false,
                    filterable: false,
                    sortable: false,
                    pageable: false,
                    resizable: true,
                    columns: [
                        {
                            title: "",
                            template: '<input class="checkbox" type="checkbox"  style="width: 24px;	height: 24" />',
                            width: 45
                        },
                        {
                            field: "justificado", title: window.app.idioma.t("JUSTIFICADO"), width: 70,
                            template: function (registro) {
                                if (registro.justificado) return "<img src='img/check.png'/>";
                                else return "<img src='img/redball.png'/>";
                            }
                        },

                        { field: "fechaHora", title: window.app.idioma.t("HORA"), width: 150, attributes: { style: "text-align: center; font-size: 22px" } },
                        { field: "maquina", hidden: true, title: window.app.idioma.t("LLENADORA"), width: 170, attributes: { style: "text-align: center; font-size: 22px" } },
                        { field: "descmaquina", title: window.app.idioma.t("LLENADORA"), width: 150, attributes: { style: "text-align: center; font-size: 22px" } },
                        { field: "strDuracionPerdidaProduccion", title: window.app.idioma.t("DURACION"), width: 170, attributes: { style: "text-align: center; font-size: 22px" } },
                        { field: "motivo", title: window.app.idioma.t("MOTIVO"), attributes: { style: "text-align: center; font-size: 22px" } },
                        { field: "causa", title: window.app.idioma.t("CAUSA"), attributes: { style: "text-align: center; font-size: 22px" } },
                        { field: "nombreMaquinaResponsable", title: window.app.idioma.t("MAQUINA_RESPONSABLE"), attributes: { style: "text-align: center; font-size: 22px" } },
                        {
                            command:
                            {
                                template: "<a class='k-button k-button-icontext k-grid-Ver' href='\\#' onclick='verPerdida(this)' ><span class=' '></span>#=window.app.idioma.t('VER')#</a>",
                            },
                            title: " ", width: 90
                        },
                        {
                            command: {
                                template: "<a class='k-button k-button-icontext k-grid-Editar' href='\\#' onclick='editarPerdida(this)'><span class=' '></span>#=window.app.idioma.t('EDITAR')#</a>"
                            },
                            title: " ", width: 90
                        }
                    ],

                    dataBound: function () {
                        var grid = this;

                        verPerdida = function (e) {
                            var dataItem = grid.dataItem($(e).closest("tr"));
                            this.ventanaDetalleParo = new VistaDatosParoPerdida({ model: dataItem, maquinas: self.todasmaquinas });
                        };

                        editarPerdida = function (e) {
                            var permiso = TienePermiso(19);

                            if (!permiso) {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                return;
                            }

                            var dataItem = grid.dataItem($(e).closest("tr"));
                            this.ventanaJustificaParo = new VistaJustificacionPerdida({ model: dataItem, maquinas: self.todasmaquinas });
                        };

                        self.resizeGrid("#gridPerdidas");
                    }
                }).data("kendoGrid");

                self.gridPerdidas.table.on("click", ".checkbox", this.selectRowPerdidas);

                $("#center-pane").css("overflow", "hidden");
            },
            selectRowParos: function () {
                var checked = this.checked,
                    row = $(this).closest("tr"),
                    grid = $("#gridParos").data("kendoGrid"),
                    dataItem = grid.dataItem(row);

                //checkedIds[dataItem.id] = checked;
                if (checked) {
                    //-select the row
                    row.addClass("k-state-selected");
                } else {
                    //-remove selection
                    row.removeClass("k-state-selected");
                }
            },
            selectRowPerdidas: function () {
                var checked = this.checked,
                    row = $(this).closest("tr"),
                    grid = $("#gridPerdidas").data("kendoGrid"),
                    dataItem = grid.dataItem(row);

                //checkedIds[dataItem.id] = checked;
                if (checked) {
                    //-select the row
                    row.addClass("k-state-selected");
                } else {
                    //-remove selection
                    row.removeClass("k-state-selected");
                }
            },
            eliminar: function () {
                Backbone.off('eventParoJustificado');
                Backbone.off('eventParoFraccionado');
                Backbone.off('eventActProd');
                Backbone.off('eventCambioTurnoActual');

                if (this.ventanaDetalleParo) {
                    this.ventanaDetalleParo.eliminar();
                }
                if (this.ventanaJustificaParo) {
                    this.ventanaJustificaParo.eliminar();
                }
                if (this.ventanaJustificaParo) {
                    this.ventanaJustificaParo.eliminar();
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
            filtrarParosJustificados: function () {
                if (this.$("#chkParosJustificados").prop('checked')) {
                    this.gridParos.dataSource.filter([]);
                }
                else {
                    this.gridParos.dataSource.filter({
                        "field": "justificado",
                        "operator": "eq",
                        "value": false
                    });
                }
            },
            filtrarPerdidasJustificadas: function () {
                if (this.$("#chkPerdidasJustificadas").prop('checked')) {
                    this.gridPerdidas.dataSource.filter([]);
                }
                else {
                    this.gridPerdidas.dataSource.filter({
                        "field": "justificado",
                        "operator": "eq",
                        "value": false
                    });
                }
            },
            justificarParosSel: function () {
                var self = this;
                var permiso = TienePermiso(19);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var sel = this.gridParos.tbody.find(".k-state-selected");
                //this.gridParos.dataItem(sel[0])
                if (sel.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_SELECCIONAR_AL_MENOS'), 4000);
                }
                else {
                    var paros = [];
                    var grid = $("#gridParos").data("kendoGrid");

                    jQuery.each(sel, function (index, value) {
                        var dataItem = grid.dataItem(value);
                        paros.push(dataItem);
                    });
                    this.ventanaJustificaParo = new VistaJustificacionMultiplesParos({ collection: paros, maquinas: self.todasmaquinas });
                }
            },
            justificarPerdidasSel: function () {
                var self = this;
                var permiso = TienePermiso(19);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var sel = this.gridPerdidas.tbody.find(".k-state-selected");
                if (sel.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_SELECCIONAR_AL_MENOS_UNA'), 4000);
                } else {
                    var perdidas = [];
                    var grid = $("#gridPerdidas").data("kendoGrid");

                    jQuery.each(sel, function (index, value) {
                        var dataItem = grid.dataItem(value);
                        perdidas.push(dataItem);
                    });
                    this.ventanaJustificaPerdida = new VistaJustificacionMultiplesPerdidas({ collection: perdidas, maquinas: self.todasmaquinas });
                }
            },
            resizeGrid: function (grid) {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $(".cabeceraVista").innerHeight();
                var tblR = $("#tblResumen").innerHeight();
                var tblNav = $("#tableNav").innerHeight();

                var gridElement = $(grid),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - cabeceraHeight - tblR - tblNav - 163);//- otherElementsHeight 80
            }
        });
        return ParosPerdidas;
    });