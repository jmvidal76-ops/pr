define(['underscore', 'backbone', 'jquery', 'vis', 'text!../../../Envasado/html/ParteRelevoTurno.html', 'compartido/notificaciones'
    , "../../../../Portal/js/constantes", 'compartido/util', 'vistas/Envasado/vEditarCrearParo', 'vistas/Envasado/vCrearAccionCorrectivaTurno', 'jszip'],
    function (_, Backbone, $, vis, PlantillaParteRelevoTurno, Not, enums, util, vistaEditarCrearParo, vistaCrearACT, JSZip) {
        var ParteRelevoTurno = Backbone.View.extend({
            constModosVista: enums.ModoVista(),
            constEstadoCalidad: enums.EstadoFormularioCalidad(),
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaParteRelevoTurno),
            turnoSel: null,
            turnoCargado: null,
            lineaCargada: null,
            coloresDefecto: {
                rojo: "#DC3F3F",
                naranja: "#FC801C",
                verde: "#4CDA43",
                azul: "#446CE4"
            },
            requests: {
                produccionMaquinas: null,
                parosPerdidas: null
            },
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                let splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resize);

                self.render();

                //Se le pasan los parametros del parte por GET
                if (window.location.href.indexOf("?") > 0) {
                    var turno = self.getParameterByName("turno");
                    if (turno) {
                        var fecha = self.getParameterByName("fecha");
                        if (fecha) {
                            var linea = self.getParameterByName("linea");
                            if (linea) {
                                var cmbLinea = $("#cmbLinea").data("kendoDropDownList");
                                cmbLinea.value(linea);
                                var dtpFecha = $("#dtpFecha").data("kendoDatePicker");
                                var fechaValue = fecha.substring(8, 10) + "/" + fecha.substring(5, 7) + "/" + fecha.substring(0, 4);
                                dtpFecha.value(fechaValue);

                                var hoyDate = new Date();
                                var timestamp = self.$("#dtpFecha").data("kendoDatePicker").value().getTime() - hoyDate.getTimezoneOffset() * 60 * 1000;
                                self.obtenerTurnos(linea, timestamp);

                                var cmbTurnos = $("#cmbTurnos").data("kendoDropDownList");
                                cmbTurnos.value(turno);
                                setTimeout(function () {
                                    self.cambiaTurno();
                                    self.generarInforme();
                                }, 2000);
                            }
                        }
                    }
                }
            },
            getParameterByName: function (key) {
                var vars = [], hash;
                var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
                for (var i = 0; i < hashes.length; i++) {
                    hash = hashes[i].split('=');
                    vars.push(hash[0]);
                    vars[hash[0]] = hash[1];
                }
                return vars[key];
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))

                $("#divHTMLContenido").height("100%");

                $("#pVertical").kendoSplitter({
                    panes: [
                        { collapsible: false },
                        { collapsible: true, size: "490px" }
                    ]
                });

                $("#pGrafTablas").kendoSplitter({
                    orientation: "vertical",
                    panes: [
                        { collapsible: false },
                        { collapsible: false, scrollable: false },
                        { collapsible: false, scrollable: false },
                        { collapsible: false, size: "75px" },
                    ]
                });

                $("#right-panel").kendoSplitter({
                    orientation: "vertical",
                    panes: [
                        { collapsible: false, size: "60px" },
                        { collapsible: false, size: "60px" },
                        { collapsible: false, size: "120px" },
                        { collapsible: false, size: "151px" },
                        { collapsible: false },
                        { collapsible: false, size: "63px" },                        
                    ]
                });

                $("#panel2").kendoSplitter({
                    panes: [
                        { collapsible: false },
                        { collapsible: false }
                    ]
                })

                $("#panel3").kendoSplitter({
                    panes: [
                        { collapsible: false },
                        { collapsible: false, size: "170px" }
                    ]
                })

                $("#cmbLinea").kendoDropDownList({
                    template: window.app.idioma.t("LINEA") + " #= numLineaDescripcion # - #=descripcion #",
                    valueTemplate: window.app.idioma.t("LINEA") + " #= numLineaDescripcion # - #=descripcion #",
                    dataValueField: "id",
                    dataSource: window.app.planta.lineas,
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    change: function () { self.cambiaLineaFecha(this, self); }
                });

                $("#dtpFecha").kendoDatePicker({
                    value: new Date(),
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    change: function () { self.cambiaLineaFecha(this, self); }
                });

                $("#cmbTurnos").kendoDropDownList({
                    dataValueField: "tipo.id",
                    template: "#: window.app.idioma.t('TURNO'+tipo.id)#",
                    valueTemplate: "#: window.app.idioma.t('TURNO'+tipo.id)#",
                    change: function () { self.cambiaTurno(this, self); },
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                // ComboBox del tipo de ParosPerdidas
                $("#cmbTipoParos").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: [
                        {
                            id: 0,
                            nombre: window.app.idioma.t("DURACION")
                        },
                        {
                            id: 1,
                            nombre: window.app.idioma.t("NUMERO_PAROS_MENORES")
                        }
                    ],
                    index: 0,
                    change: function () { self.cargarParosPerdidas(self.turnoCargado.idTurno); }
                });

                // Botón de actualizarComentarioTurno
                $("#btnEditarComentario").kendoButton({
                    click: function () {                        

                        let datos = {
                            IdTurno: self.turnoCargado.idTurno,
                            Comentario: $("#tfComentarioTurno").val() || null,
                            InicioTurno: self.turnoCargado.inicio,
                            IdTipoTurno: self.turnoCargado.tipo.id,
                        };

                        self.actualizarComentarioTurno(datos);
                    }
                })

                // Botón de ir a acciones correctivas
                $("#btnIrAccionesCorrectivas").kendoButton({
                    click: function () {
                        $("li[role='menuitem'] a.k-link.k-state-selected.k-state-focused").removeClass("k-state-selected k-state-focused");
                        $("li[role='menuitem'] a.k-link[href='#AccionesCorrectivasTurno']").addClass("k-state-selected k-state-focused");
                        var linea = self.turnoCargado.linea.id;
                        var fecha = new Date(self.turnoCargado.fecha+"Z");
                        var tipoTurno = self.turnoCargado.tipo.id;
                        window.location = `./#AccionesCorrectivasTurno?idLinea=${linea}` +
                            `&fecha=${fecha.toISOString()}&tipoTurno=${tipoTurno}`;
                    }
                })

                // Botón de cargar acciones correctivas
                //$("#btnCrearACAuto").kendoButton({
                //    click: function () {
                //        self.crearAccionesCorrectivasAuto(self.turnoCargado.idTurno); 
                //    }
                //})

                // Botón de crear accion correctiva
                //$("#btnCrearAC").kendoButton({
                //    click: function () {

                //        self.mostrarModalCrearAC(self.turnoCargado, self.lineaCargada);
                //    }
                //})

                // Botón de borrar acciones correctivas
                //$("#btnBorrarAC").kendoButton({
                //    click: function () {

                //        self.mostrarModalBorrarAC(self.turnoCargado.idTurno);
                //    }
                //})

                // Paneles de Paros Perdidas Grid y Chart
                this.$("#chartParosPerdidas").hide();
                this.$("#parosPerdidasGrid").kendoButton({
                    spriteCssClass: "k-icon iconGrid",
                    click: function () {
                        self.cambiarVistaParosPerdidas(self.constModosVista.Tabla);                        
                    }
                });
                this.$("#parosPerdidasChart").kendoButton({
                    spriteCssClass: "k-icon iconChart unselected",
                    click: function () {
                        self.cambiarVistaParosPerdidas(self.constModosVista.Grafico);
                    }
                });

                this.$("#pCentral").hide();
            },
            events: {
                "click #btnConsultar": 'generarInforme',
            },
            cancelar: function () {
                this.remove();
            },
            eliminar: function () {
                var self = this;
                // same as this.$el.remove();
                self.mut?.disconnect();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            cambiaLineaFecha: function () {
                var self = this;
                var hoyDate = new Date();
                var idLinea = $("#cmbLinea").data("kendoDropDownList").value();
                var fecha = $("#dtpFecha").data("kendoDatePicker").value();
                var dblFecha = null;

                if (fecha != null) {
                    dblFecha = ($("#dtpFecha").data("kendoDatePicker").value().getTime() - hoyDate.getTimezoneOffset() * 60 * 1000);
                }

                if (idLinea != "" && dblFecha) {
                    self.obtenerTurnos(idLinea, dblFecha);
                }
            },
            obtenerTurnos: function (idLinea, fecha) {
                var ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/turnosLineaDia/" + idLinea + "/" + fecha,
                            dataType: "json"
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    },
                    sort: { field: "nombre", dir: "asc" }

                });
                var comboTurnos = this.$("#cmbTurnos").data('kendoDropDownList');
                comboTurnos.setDataSource(ds);
                comboTurnos.select(0);
                $("#lblDescTurno").text("");
                this.turnoSel = null;
                self.$("#btnConsultar").hide();
                self.$("#lblDescTurno").hide();
            },
            cambiaTurno: function (e, self) {
                var self = this;
                var selTurno = $("#cmbTurnos").data('kendoDropDownList').value();

                if (selTurno != "") {
                    var ds = $("#cmbTurnos").data('kendoDropDownList').dataSource;
                    for (var i = 0; i < ds.data().length; i++) {
                        if (ds.at(i).tipo.id == selTurno) {
                            self.turnoSel = ds.at(i);
                            $("#lblDescTurno").text("De: " + kendo.toString(new Date(ds.at(i).inicioLocal), "HH:mm:ss") + " a " + kendo.toString(new Date(ds.at(i).finLocal), "HH:mm:ss"));
                            i = ds.data().length;
                            self.$("#btnConsultar").show();
                            self.$("#lblDescTurno").show();
                            $("#btnParos").parent().css('float', 'right');
                            $("#btnCambios").parent().css('float', 'right');
                            $("#btnArranques").parent().css('float', 'right');
                        }
                    }
                } else {
                    self.$("#btnConsultar").hide();
                    self.$("#lblDescTurno").hide();
                }
            },
            generarInforme: async function (e) {
                let self = this;

                if (self.turnoSel) {

                    $("#loaderReport").show();
                    this.$("#pCentral").show();

                    //Recogemos los datos de la consulta                    
                    let datos = {};
                    datos.idLinea = $("#cmbLinea").data("kendoDropDownList").value();
                    datos.fInicio = new Date(self.turnoSel.inicioLocal);
                    datos.fFin = new Date(self.turnoSel.finLocal);
                    let linea = window.app.planta.lineas.find(f => f.id == datos.idLinea);
                    let llenadoras = linea.llenadoras;
                    
                    //Cargamos el grafico de Oee de las llenadoras
                    let promises = [];

                    // Reseteamos el panel de accionesCorrectivas
                    //$("#btnBorrarAC").getKendoButton().enable(false);
                    //let grid = $("#gridAccionesCorrectivas").getKendoGrid();
                    //if (grid) {
                    //    grid.destroy();
                    //}
                    //$("#gridAccionesCorrectivas").empty();

                    promises.push(self.cargarDatosOEE(datos, llenadoras, linea, self.turnoSel));

                    //promises.push(self.cargarRendimientoLlenadoras(datos, llenadoras, linea, self.turnoSel));
                    promises.push(self.cargarParosPerdidas(self.turnoSel.idTurno));
                    promises.push(self.cargarSemaforoTurno(self.turnoSel.idTurno));
                    promises.push(self.cargarSemaforoArranqueWOTurno(self.turnoSel.idTurno));
                    promises.push(self.cargarSemaforoFinalizacionWOTurno(self.turnoSel.idTurno));         
                    promises.push(self.cargarSemaforoFormulariosCalidadTurno(linea.id, self.turnoSel));
                    promises.push(self.cargarTPOTurno(linea.id, self.turnoSel.inicioLocal, self.turnoSel.finLocal));
                    promises.push(self.cargarParosSinJustificar(self.turnoSel.idTurno));
                    promises.push(self.cargarArranques(linea.id, self.turnoSel.tipo.id, self.turnoSel.fecha));
                    promises.push(self.cargarCambios(linea.id, self.turnoSel.tipo.id, self.turnoSel.fecha));
                    promises.push(self.cargarProduccionMaquinas(linea.numLinea, self.turnoSel.idTurno));
                    //promises.push(self.cargarPanelOEE(linea, self.turnoSel, llenadoras));
                    //promises.push(self.cargarAccionesCorrectivas(self.turnoSel.idTurno));
                    promises.push(self.cargarProgramaEnvasado(self.turnoSel));
                    promises.push(self.cargarComentarioTurno(self.turnoSel.idTurno));

                    Promise.all(promises).then(values => {
                        self.cargaFinalizada();
                        self.turnoCargado = self.turnoSel;
                        self.lineaCargada = $("#cmbLinea").data("kendoDropDownList").value();
                    });                
                } else {
                    Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR_TURNO'), 4000);
                }
            },
            cargarDatosOEE: async function (datos, llenadoras, linea, turno) {
                var self = this;

                return new Promise((resolve, reject) => {
                    // Cargamos datos de LimitesOEE
                    self.obtenerLimitesOEE(linea.numLinea, turno)
                        .then((limites) => {
                            Promise.all([self.cargarRendimientoLlenadoras(datos, llenadoras, linea, turno, limites), self.cargarPanelOEE(linea, turno, llenadoras, limites)])
                                .then((result) => {
                                    resolve();
                                })
                                .catch((er1) => {
                                    resolve()
                                })
                        })
                        .catch((er2) => {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_OEE_OBJETIVO'), 4000);
                            self.cargarPanelOEE(linea, turno, llenadoras, null)
                                .then((result) => {
                                    resolve();
                                })
                                .catch((er1) => {
                                    resolve()
                                })
                        })
                })               

            },
            obtenerLimitesOEE: async function (numLinea, turnoSel) {
                var self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "../api/turnos/obtenerLimitesOEETurno/" + numLinea + "/" + turnoSel.idTurno,
                        dataType: 'json',
                        cache: true,
                        success: function (data) {
                            try {
                                if (data) {
                                    resolve(data);
                                }
                            }
                            catch (e) {
                                reject(e);
                            }
                        },
                        error: function (err) {
                            reject(err);
                        }
                    });
                });
            },
            cargarRendimientoLlenadoras: async function (datos, llenadoras, linea, turno, limitesTurno) {
                let self = this;

                return new Promise(async function(resolve, reject) {

                    // Creamos grafica con las series de las llenadoras
                    let seriesLlenadoras = [];

                    for (let ll of llenadoras) {
                        let serie = {};
                        serie.field = ll.id.replace(/\./g, "_").replace(/\-/g, "_");
                        serie.name = ll.nombre;
                        seriesLlenadoras.push(serie);
                    }

                    let limitesOEE = [];
                    if (limitesTurno) {
                        let z1 = {
                            from: limitesTurno.oeeCritico,
                            to: limitesTurno.oeeCritico + 0.2,
                            color: "red"
                        }
                        limitesOEE.push(z1);

                        let z2 = {
                            from: limitesTurno.oeeObjetivo,
                            to: limitesTurno.oeeObjetivo + 0.2,
                            color: "green"
                        }
                        limitesOEE.push(z2);
                    }

                    let dsLlenadoras = [];
                    // *******************************************
                    // Precargamos el eje de horas

                    let fIni = new Date(datos.fInicio);
                    let fFin = new Date(datos.fInicio);
                    fFin.setHours(fFin.getHours() + 1);
                    let horasSerieLLenadoras = [];

                    while (fFin.getTime() <= datos.fFin.getTime()) {
                        let nuevaSerie = {};

                        nuevaSerie.hora = (((fFin.getHours() == 0 ? 24 : fFin.getHours()) - 1) == 0 ? 24 : ((fFin.getHours() == 0 ? 24 : fFin.getHours()) - 1)) + " - " + (fFin.getHours() == 0 ? 24 : fFin.getHours());

                        dsLlenadoras.push(nuevaSerie);
                        let hora = {}
                        hora.valor = nuevaSerie.hora;
                        hora.media = 0;
                        horasSerieLLenadoras.push(hora);
                        fIni.setHours(fIni.getHours() + 1);
                        fFin.setHours(fFin.getHours() + 1);
                    }

                    // ******************************************

                    let grafOEE = $("#grafOEE").kendoChart({
                        title: {
                            text: window.app.idioma.t('RENDIMIENTO_LLENADORAS')
                        },
                        series: seriesLlenadoras,
                        seriesDefaults: {
                            type: "column"
                        },
                        categoryAxis: {
                            field: "hora",
                            majorGridLines: {
                                visible: false
                            },
                            labels: {
                                template: function (e) {
                                    if (llenadoras.length > 1) {
                                        let value;

                                        for (let hora of horasSerieLLenadoras) {
                                            if (e.value == hora.valor) {
                                                value = e.value + "\nAVG: " + hora.media;
                                            }
                                        };
                                        
                                        return value;
                                    } else {
                                        return e.value;
                                    }
                                }
                            }
                        },
                        valueAxis: {
                            max: 105,
                            min: 0,
                            labels: {
                                format: "{0}%"
                            },
                            plotBands: limitesOEE,
                        },
                        tooltip: {
                            visible: true,
                            format: "N0"
                        }
                    }).getKendoChart();

                    fIni = new Date(datos.fInicio);
                    fFin = new Date(datos.fInicio);
                    fFin.setHours(fFin.getHours() + 1);

                    let datosFiltro = {
                        numLinea: linea.numLinea,
                        idTurno: turno.idTurno,
                        inicio: turno.inicio,
                        fin: turno.fin,
                    }

                    $.ajax({
                        type: "POST",
                        url: "../api/produccion/obtenerOeeLlenadorasLinea/",
                        dataType: 'json',
                        data: JSON.stringify(datosFiltro),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            try {
                                for (let d in data) {
                                    let idMaquina = d.replace(/\./g, "_").replace(/\-/g, "_");
                                    if (idMaquina != "AVG") {
                                        let index = 0;
                                        for (let v of data[d]) {
                                            dsLlenadoras[index][idMaquina] = v.toFixed(2);
                                            index++;
                                        }
                                    } else {
                                        let index = 0;
                                        for (let v of data[d]) {
                                            horasSerieLLenadoras[index].media = v.toFixed(2);
                                            index++;
                                        }
                                    }
                                }

                                grafOEE.setDataSource(dsLlenadoras);
                                //$("#grafOEE").data("kendoChart").refresh();
                            }
                            catch (e) {}

                            resolve();
                        },
                        error: function (xhr) {
                            if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OEE_LLENADORA_LINEA'), 4000);
                            }

                            resolve();
                        }
                    });
                });
            },
            //cambiarVistaParosPerdidas: function (modo) {
            //    let self = this;

            //    $(".btnModoVista .k-icon").removeClass("unselected");

            //    if (modo == self.constModosVista.Tabla) {
            //        $("#parosPerdidasChart .k-icon").addClass("unselected");
            //        $("#gridParosPerdidas").show();
            //        $("#chartParosPerdidas").hide();
            //    }
            //    else
            //    {
            //        $("#parosPerdidasGrid .k-icon").addClass("unselected");
            //        $("#chartParosPerdidas").show();
            //        $("#gridParosPerdidas").hide();
            //        if ($("#chartParosPerdidas").getKendoChart()) {
            //            $("#chartParosPerdidas").getKendoChart().redraw()
            //        }
            //    }
            //},
            cargarParosPerdidas: function (idTurno) {
                let self = this;

                // Reseteamos el grid
                let grid = $("#gridParosPerdidas").getKendoGrid();
                if (grid != null) {
                    grid.destroy();
                }
                $("#gridParosPerdidas").empty();

                return new Promise((resolve, reject) => {

                    let porDuracion = $("#cmbTipoParos").getKendoDropDownList().select() == 0;

                    let datos = {
                        idTurno,
                        porDuracion
                    }

                    //Si es una carga independiente del panel mostramos spinner
                    if (!$("#loaderReport").is(":visible")) {
                        kendo.ui.progress($("#panelParosPerdidas"), true);
                    }

                    // Cancelamos la petición anterior
                    if (self.requests.parosPerdidas) {
                        self.requests.parosPerdidas.abort();
                    }
                    
                    self.requests.parosPerdidas = $.ajax({
                        type: "GET",
                        url: "../api/ParosPerdidas/RelevoTurno/",
                        data: datos,
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        complete: function () {
                            kendo.ui.progress($("#panelParosPerdidas"), false);
                        },
                        success: function (data) {

                            data.map(d => {
                                d.Maquina = !d.Maquina || d.Maquina == " " ? window.app.idioma.t('SIN_MAQUINA_DEFINIDA') : d.Maquina;
                                return d;
                            })

                            self.cargarGridParosPerdidas(data, porDuracion);
                            //self.cargarChartParosPerdidas(data, porDuracion);
                            
                            resolve();
                        },
                        error: function (err) {
                            if (err.statusText == "abort") {
                                return;
                            }

                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_PAROS_PERDIDAS'), 4000);
                            }
                            resolve();
                        }
                    });
                });
            },
            cargarGridParosPerdidas: function (datos, porDuracion) {
                let self = this;

                // Construimos el dataSource para el Grid con los datos obtenidos.
                let columnas = [
                    {
                        field: "Maquina",
                        title: window.app.idioma.t('MAQUINA'),
                        footerTemplate: "#=window.app.idioma.t('TOTAL')#"
                    },
                    {
                        field: "ValorParosMayores",
                        title: window.app.idioma.t('DURACION_PAROS_MAYORES'),
                        template: "#= (PorDuracion ? ConversorHorasMinutosSegundos(ValorParosMayores) : parseInt(ValorParosMayores))#",
                        width: "180px",
                        footerTemplate: "#= " + (porDuracion ? "ConversorHorasMinutosSegundos(sum)" : "parseInt(sum)") + "#"
                    },
                    {
                        field: "ValorPerdidasProduccion",
                        title: window.app.idioma.t('DURACION_PERDIDAS'),
                        template: "#= (PorDuracion ? ConversorHorasMinutosSegundos(ValorPerdidasProduccion) : parseInt(ValorPerdidasProduccion))#",
                        width: "180px",
                        footerTemplate: "#= " + (porDuracion ? "ConversorHorasMinutosSegundos(sum)" : "parseInt(sum)") + "#"
                    },
                    {
                        field: "ValorTotal",
                        title: window.app.idioma.t('DURACION_PAROS'),
                        template: "#= (PorDuracion ? ConversorHorasMinutosSegundos(ValorTotal) : parseInt(ValorTotal))#",
                        width: "180px",
                        footerTemplate: "#= " + (porDuracion ? "ConversorHorasMinutosSegundos(sum)" : "parseInt(sum)") + "#"
                    }
                ];

                let aggregate = [
                    { field: "ValorParosMayores", aggregate: "sum" },
                    { field: "ValorPerdidasProduccion", aggregate: "sum" },
                    { field: "ValorTotal", aggregate: "sum" },
                ];

                //if (datos.length > 0) {
                //    let sample = datos[0];
                //    let idx = 0;
                //    for (let m of sample.Motivos) {
                //        columnas.push({
                //            field: "Motivos[" + idx + "].Valor",
                //            title: m.Nombre,
                //            template: "#= (Motivos[" + idx + "].Valor == 0? '' : PorDuracion ? ConversorHorasMinutosSegundos(Motivos[" + idx + "].Valor) : parseInt(Motivos[" + idx + "].Valor))#",
                //            footerTemplate: "#= " + (porDuracion ? "ConversorHorasMinutosSegundos(sum)" : "parseInt(sum)") + "#"
                //        });

                //        aggregate.push({
                //            field: "Motivos[" + idx + "].Valor",
                //            aggregate: "sum"
                //        })

                //        idx++;
                //    }
                //}

                //columnas.push({
                //    field: "Total",
                //    title: window.app.idioma.t('TOTAL'),
                //    template: "#= (PorDuracion ? ConversorHorasMinutosSegundos(Total) : parseInt(Total))#",
                //    footerTemplate: "#=" + (porDuracion ? "ConversorHorasMinutosSegundos(sum)" : "parseInt(sum)") + "#"
                //})

                // Creamos el grid
                $("#gridParosPerdidas").kendoGrid({
                    scrollable: true,
                    columns: columnas,
                    pageable: false,
                    dataSource: {
                        data: datos,
                        aggregate
                    },
                    detailTemplate: kendo.template($("#templateDetailMotivosParo").html()),
                    detailInit: self.detailMotivosParoInit,
                    dataBound: function (e) {
                        e.sender.footer.find("td").css({ "background-color": "#99c3d7", "font-weight": "bold" });
                        $(e.sender.element).find("thead th").each(function (idx) {
                            $(this).attr("title", $(this).html());
                        })
                    },
                })
            },
            detailMotivosParoInit: function (e) {
                let detailRow = e.detailRow;
                let self = window.app.vista;

                const porDuracion = e.data.PorDuracion;

                const dataSource = new kendo.data.DataSource({
                    transport: {
                        read: function (o) {
                            o.success(e.data.Motivos.map(m => {
                                m.Nombre = !m.Nombre || m.Nombre == " " ? window.app.idioma.t("SIN_DEFINIR") : m.Nombre;
                                return { ...m };
                                }
                            ))
                        }
                    },
                    schema: {
                        model: {
                            id: "Id",                            
                        },
                    },
                    aggregate: [
                        { field: "ValorParosMayores", aggregate: "sum" },
                        { field: "ValorPerdidasProduccion", aggregate: "sum" },
                        { field: "ValorTotal", aggregate: "sum" },
                    ]
                });

                detailRow.find(".gridDetailMotivosParo").kendoGrid({
                    dataSource: dataSource,                    
                    scrollable: false,
                    sortable: true,
                    pageable: false,
                    columns: [                        
                        {
                            field: "Nombre",
                            title: window.app.idioma.t("MOTIVO"),
                            footerTemplate: "#=window.app.idioma.t('TOTAL') + ' ' + window.app.idioma.t('MOTIVO')#"
                        },
                        {
                            field: "ValorParosMayores",
                            title: window.app.idioma.t('DURACION_PAROS_MAYORES'),
                            template: "#= (PorDuracion ? ConversorHorasMinutosSegundos(ValorParosMayores) : parseInt(ValorParosMayores))#",
                            width: "180px",
                            footerTemplate: "#= " + (porDuracion ? "ConversorHorasMinutosSegundos(sum)" : "parseInt(sum)") + "#"
                        },
                        {
                            field: "ValorPerdidasProduccion",
                            title: window.app.idioma.t('DURACION_PERDIDAS'),
                            template: "#= (PorDuracion ? ConversorHorasMinutosSegundos(ValorPerdidasProduccion) : parseInt(ValorPerdidasProduccion))#",
                            width: "180px",
                            footerTemplate: "#= " + (porDuracion ? "ConversorHorasMinutosSegundos(sum)" : "parseInt(sum)") + "#"
                        },
                        {
                            field: "ValorTotal",
                            title: window.app.idioma.t('DURACION_PAROS'),
                            template: "#= (PorDuracion ? ConversorHorasMinutosSegundos(ValorTotal) : parseInt(ValorTotal))#",
                            width: "179px",
                            footerTemplate: "#= " + (porDuracion ? "ConversorHorasMinutosSegundos(sum)" : "parseInt(sum)") + "#"
                        }
                    ],
                    detailTemplate: kendo.template($("#templateDetailEquiposParo").html()),
                    detailInit: self.detailEquiposParoInit,
                    dataBound: function (e) {
                        
                    }
                });
            },
            detailEquiposParoInit: function (e) {
                let detailRow = e.detailRow;
                let self = window.app.vista;

                const porDuracion = e.data.PorDuracion;

                const dataSource = new kendo.data.DataSource({
                    transport: {
                        read: function (o) {
                            o.success(e.data.SubGrupo.map(m => {
                                m.Nombre = !m.Nombre || m.Nombre == " " ? window.app.idioma.t("SIN_DEFINIR") : m.Nombre;
                                return { ...m };
                            }
                            ))
                        }
                    },
                    schema: {
                        model: {
                            id: "Id",
                        },
                    },
                    aggregate: [
                        { field: "ValorParosMayores", aggregate: "sum" },
                        { field: "ValorPerdidasProduccion", aggregate: "sum" },
                        { field: "ValorTotal", aggregate: "sum" },
                    ]
                });

                detailRow.find(".gridDetailEquiposParo").kendoGrid({
                    dataSource: dataSource,
                    scrollable: false,
                    sortable: true,
                    pageable: false,
                    columns: [
                        {
                            field: "Nombre",
                            title: window.app.idioma.t("EQUIPO"),
                            footerTemplate: "#=window.app.idioma.t('TOTAL') + ' ' + window.app.idioma.t('EQUIPO')#"
                        },
                        {
                            field: "ValorParosMayores",
                            title: window.app.idioma.t('DURACION_PAROS_MAYORES'),
                            template: "#= (PorDuracion ? ConversorHorasMinutosSegundos(ValorParosMayores) : parseInt(ValorParosMayores))#",
                            width: "180px",
                            footerTemplate: "#= " + (porDuracion ? "ConversorHorasMinutosSegundos(sum)" : "parseInt(sum)") + "#"
                        },
                        {
                            field: "ValorPerdidasProduccion",
                            title: window.app.idioma.t('DURACION_PERDIDAS'),
                            template: "#= (PorDuracion ? ConversorHorasMinutosSegundos(ValorPerdidasProduccion) : parseInt(ValorPerdidasProduccion))#",
                            width: "180px",
                            footerTemplate: "#= " + (porDuracion ? "ConversorHorasMinutosSegundos(sum)" : "parseInt(sum)") + "#"
                        },
                        {
                            field: "ValorTotal",
                            title: window.app.idioma.t('DURACION_PAROS'),
                            template: "#= (PorDuracion ? ConversorHorasMinutosSegundos(ValorTotal) : parseInt(ValorTotal))#",
                            width: "177px",
                            footerTemplate: "#= " + (porDuracion ? "ConversorHorasMinutosSegundos(sum)" : "parseInt(sum)") + "#"
                        }
                    ],
                    detailTemplate: kendo.template($("#templateDetailDescripcionParo").html()),
                    detailInit: self.detailDescripcionParoInit,
                    dataBound: function (e) {

                    }
                });
            },
            detailDescripcionParoInit: function (e) {
                let detailRow = e.detailRow;
                let self = window.app.vista;

                const porDuracion = e.data.PorDuracion;

                const dataSource = new kendo.data.DataSource({
                    transport: {
                        read: function (o) {
                            o.success(e.data.SubGrupo.map(m => {                                
                                return { ...m };
                            })
                            )
                        }
                    },
                    schema: {
                        model: {
                            id: "Id",
                        },
                    },
                    aggregate: [
                        { field: "ValorParosMayores", aggregate: "sum" },
                        { field: "ValorPerdidasProduccion", aggregate: "sum" },
                        { field: "ValorTotal", aggregate: "sum" },
                    ]
                });

                detailRow.find(".gridDetailDescripcionParo").kendoGrid({
                    dataSource: dataSource,
                    scrollable: false,
                    sortable: true,
                    pageable: false,
                    columns: [
                        {
                            field: "Nombre",
                            title: window.app.idioma.t("COMENTARIO"),
                            footerTemplate: "#=window.app.idioma.t('TOTAL') + ' ' + window.app.idioma.t('COMENTARIO')#"
                        },
                        {
                            field: "ValorParosMayores",
                            title: window.app.idioma.t('DURACION_PAROS_MAYORES'),
                            template: "#= (PorDuracion ? ConversorHorasMinutosSegundos(ValorParosMayores) : parseInt(ValorParosMayores))#",
                            width: "180px",
                            footerTemplate: "#= " + (porDuracion ? "ConversorHorasMinutosSegundos(sum)" : "parseInt(sum)") + "#"
                        },
                        {
                            field: "ValorPerdidasProduccion",
                            title: window.app.idioma.t('DURACION_PERDIDAS'),
                            template: "#= (PorDuracion ? ConversorHorasMinutosSegundos(ValorPerdidasProduccion) : parseInt(ValorPerdidasProduccion))#",
                            width: "180px",
                            footerTemplate: "#= " + (porDuracion ? "ConversorHorasMinutosSegundos(sum)" : "parseInt(sum)") + "#"
                        },
                        {
                            field: "ValorTotal",
                            title: window.app.idioma.t('DURACION_PAROS'),
                            template: "#= (PorDuracion ? ConversorHorasMinutosSegundos(ValorTotal) : parseInt(ValorTotal))#",
                            width: "175px",
                            footerTemplate: "#= " + (porDuracion ? "ConversorHorasMinutosSegundos(sum)" : "parseInt(sum)") + "#"
                        }
                    ],
                    dataBound: function (e) {

                    }
                });
            },
            //detailInfoParoInit: function (e) {
            //    let detailRow = e.detailRow;
            //    let self = window.app.vista;

            //    const porDuracion = e.data.PorDuracion;

            //    const dataSource = new kendo.data.DataSource({
            //        transport: {
            //            read: function (o) {
            //                o.success(e.data.Paros.map(m => {
            //                    //m.Nombre = !m.Nombre || m.Nombre == " " ? "N/A" : m.Nombre;
            //                    return { ...m };
            //                }
            //                ))
            //            }
            //        },
            //        aggregate: [
            //            { field: "ValorParosMayores", aggregate: "sum" },
            //            { field: "ValorPerdidasProduccion", aggregate: "sum" },
            //            { field: "ValorTotal", aggregate: "sum" },
            //        ]
            //    });

            //    detailRow.find(".gridDetailInfoParo").kendoGrid({
            //        dataSource: dataSource,
            //        scrollable: false,
            //        sortable: true,
            //        pageable: false,
            //        columns: [
            //            {
            //                field: "Comentario",
            //                title: window.app.idioma.t("COMENTARIO"),
            //                footerTemplate: "#=window.app.idioma.t('TOTAL') + ' ' + window.app.idioma.t('COMENTARIO')#"
            //            },
            //            {
            //                field: "ValorParosMayores",
            //                title: window.app.idioma.t('DURACION_PAROS_MAYORES'),
            //                template: "#= (PorDuracion ? ConversorHorasMinutosSegundos(ValorParosMayores) : parseInt(ValorParosMayores))#",
            //                width: "180px",
            //                footerTemplate: "#= " + (porDuracion ? "ConversorHorasMinutosSegundos(sum)" : "parseInt(sum)") + "#"
            //            },
            //            {
            //                field: "ValorPerdidasProduccion",
            //                title: window.app.idioma.t('DURACION_PERDIDAS'),
            //                template: "#= (PorDuracion ? ConversorHorasMinutosSegundos(ValorPerdidasProduccion) : parseInt(ValorPerdidasProduccion))#",
            //                width: "180px",
            //                footerTemplate: "#= " + (porDuracion ? "ConversorHorasMinutosSegundos(sum)" : "parseInt(sum)") + "#"
            //            },
            //            {
            //                field: "ValorTotal",
            //                title: window.app.idioma.t('DURACION_PAROS'),
            //                template: "#= (PorDuracion ? ConversorHorasMinutosSegundos(ValorTotal) : parseInt(ValorTotal))#",
            //                width: "177px",
            //                footerTemplate: "#= " + (porDuracion ? "ConversorHorasMinutosSegundos(sum)" : "parseInt(sum)") + "#"
            //            }
            //        ],
            //        dataBound: function (e) {

            //        }
            //    });
            //},
            //cargarChartParosPerdidas: function (datos, porDuracion) {
            //    let self = this;

            //    let categories = [];

            //    let series = [];

            //    let odd = 0;

            //    for (let d of datos) {
            //        categories.push(d.Maquina);

            //        for (let m of d.Motivos) {
            //            let serie = series.find(f => f.name == m.Nombre);
            //            if (serie != null)
            //            {
            //                serie.data.push(m.Valor);
            //            }
            //            else
            //            {
            //                series.push({ name: m.Nombre, data: [m.Valor] });
            //            }
            //        }
            //    }

            //    $("#chartParosPerdidas").kendoChart({
            //        //title: {
            //        //    text: "Site Visitors Stats"
            //        //},
            //        //subtitle: {
            //        //    text: "/thousands/"
            //        //},
            //        legend: {
            //            visible: true,
            //            position: "right"
            //        },
            //        seriesDefaults: {
            //            type: "column"
            //        },
            //        series: series,
            //        valueAxis: {
            //            name: "value",
            //            line: {
            //                visible: false
            //            },
            //            minorGridLines: {
            //                visible: false
            //            },
            //            labels: {
            //                template: "#=" + (porDuracion ? "ConversorHorasMinutos(value)" : "value") + "#"
            //            }
            //        },
            //        categoryAxis: {
            //            categories: categories,
            //            labels: {
            //                font: "10px sans-serif",
            //                rotation: {
            //                    angle: 10
            //                    }
            //            }
            //        },
            //        tooltip: {
            //            visible: true,
            //            template: "#= series.name #: #= " + (porDuracion ? "ConversorHorasMinutosSegundos(value)" : "value") +"#"
            //        },
            //        render: function (e) {
            //            if (porDuracion && !e.sender.AxisAjusted) {
            //                let range = e.sender.getAxis("value").range();
            //                let majorUnit = range.max / 900;
            //                majorUnit = 900 * (parseInt(majorUnit / 10) + 1)
            //                let axis = e.sender.options.valueAxis;

            //                if (axis.majorUnit !== majorUnit) {
            //                    axis.majorUnit = majorUnit;

            //                    // We need to redraw the chart to apply the changes
            //                    e.sender.AxisAjusted = true;
            //                    e.sender.redraw();                                
            //                }
            //            }
            //        }
            //    });
            //},
            //crearAccionesCorrectivasAuto: function (idTurno) {
            //    let self = this;

            //    kendo.ui.progress($("#panelAccionesCorrectivas"), true);

            //    $.ajax({
            //        type: "GET",
            //        url: "../api/accionesCorrectivasTurno/CrearAutomaticas/"+ idTurno + "/",
            //        dataType: 'json',
            //        contentType: "application/json; charset=utf-8",
            //        dataType: "json",
            //        complete: function () {
            //            kendo.ui.progress($("#panelAccionesCorrectivas"), false);
            //        },
            //        success: function (data) {
            //            self.cargarAccionesCorrectivas(idTurno);
            //        },
            //        error: function (err) {

            //            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
            //                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
            //            } else {
            //                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CREAR_ACCIONES_CORRECTIVAS_AUTO'), 4000);
            //            }
            //        }
            //    });
            //},
            //cargarAccionesCorrectivas: function (idTurno) {
            //    let self = this;

            //    kendo.ui.progress($("#panelAccionesCorrectivas"), true);

            //    $.ajax({
            //        type: "GET",
            //        url: "../api/accionesCorrectivasTurno/"+ idTurno + "/",
            //        dataType: 'json',
            //        contentType: "application/json; charset=utf-8",
            //        dataType: "json",
            //        complete: function () {
            //            kendo.ui.progress($("#panelAccionesCorrectivas"), false);
            //        },
            //        success: function (data) {
            //            // Construimos el datasource para el grid con los datos obtenidos
            //            if (data.find(f => !f.CreadaManual)) {
            //                $("#btnBorrarAC").getKendoButton().enable(true);
            //            }
            //            else {
            //                $("#btnBorrarAC").getKendoButton().enable(false);
            //            }

            //            let ds = [];

            //            // dividimos las ACT entre las automáticas y las manuales

            //            let auto = data.filter(f => !f.CreadaManual);
            //            let manual = data.filter(f => f.CreadaManual);

            //            for (let m of auto) {
            //                let aux = ds.find(f => f.MaquinaId == m.MaquinaId);

            //                if (aux) {
            //                    aux.Items.push(m);
            //                }
            //                else
            //                {
            //                    ds.push({
            //                        MaquinaId: m.MaquinaId,
            //                        MaquinaNombre: m.MaquinaNombre || window.app.idioma.t('SIN_MAQUINA_DEFINIDA'),
            //                        Items: [m],
            //                        Manual: false
            //                    })
            //                }
            //            }

            //            for (let m of manual) {
            //                let aux = ds.find(f => f.MaquinaId == m.MaquinaId && f.Manual);

            //                if (m.MaquinaId == null) {
            //                    aux = null;
            //                }

            //                if (aux) {
            //                    aux.Items.push(m);
            //                }
            //                else {
            //                    ds.push({
            //                        MaquinaId: m.MaquinaId,
            //                        MaquinaNombre: m.MaquinaNombre || "",
            //                        Items: [m],
            //                        Manual: true
            //                    })
            //                }
            //            }

            //            // Creamos el grid
            //            $("#gridAccionesCorrectivas").kendoGrid({
            //                scrollable: true,
            //                columns: [
            //                    {
            //                        title: window.app.idioma.t('MAQUINA'),
            //                        field: "MaquinaNombre",
            //                        template: kendo.template($("#ACMaquinaTemplate").html()),
            //                        width: 160
            //                    },
            //                    {
            //                        title: window.app.idioma.t('COMENTARIO_PARO'),
            //                        template: kendo.template($("#ACComentarioParoTemplate").html()),
            //                        width: 230
            //                    },
            //                    {
            //                        title: window.app.idioma.t('DURACION'),
            //                        template: kendo.template($("#ACDuracionTemplate").html()),
            //                        width: 90
            //                    },
            //                    {
            //                        title: window.app.idioma.t('RENDIMIENTO_PERDIDO'),
            //                        template: kendo.template($("#ACRendimientoPerdidoTemplate").html()),
            //                        width: 90
            //                    },
            //                    {
            //                        title: window.app.idioma.t('RESPONSABLE'),
            //                        template: kendo.template($("#ACResponsableTemplate").html()),
            //                        width: 120
            //                    },
            //                    {
            //                        title: window.app.idioma.t('OBSERVACIONES'),
            //                        template: kendo.template($("#ACObservacionesTemplate").html()),
            //                        width: 200
            //                    },
            //                    {
            //                        title: window.app.idioma.t('ACCION_REALIZADA'),
            //                        template: kendo.template($("#ACAccionRealizadaTemplate").html()),
            //                        width: 200
            //                    },
            //                    {
            //                        title: window.app.idioma.t('ESTADO'),
            //                        template: kendo.template($("#ACEstadoTemplate").html()),
            //                        width: 80
            //                    }
            //                ],
            //                dataSource: ds,
            //                dataBound: function (e) {
            //                    let estadoDataSource = [
            //                        {
            //                            id: 0,
            //                            descripcion: window.app.idioma.t('CERRADA')
            //                        },
            //                        {
            //                            id: 1,
            //                            descripcion: window.app.idioma.t('ABIERTA')
            //                        }
            //                    ]
            //                    $(".cmbEstado").each(function (idx, elem) {
            //                        $(elem).kendoDropDownList({
            //                            dataTextField: "descripcion",
            //                            dataValueField: "id",
            //                            dataSource: estadoDataSource,
            //                            index: parseInt($(elem).attr("initial-value")),
            //                            change: function (e) {
            //                                self.editarAccionCorrectiva(parseInt($(elem).data("id")));
            //                            }
            //                        })
            //                    });

            //                    // tooltip para los botones de editar paro
            //                    //$(".botonEditarParo").kendoTooltip({
            //                    //    content: function (e) {
            //                    //        return window.app.idioma.t("EDITAR_PARO_MAYOR");
            //                    //    }
            //                    //});

            //                    // Hacemos focus al elemento que estuviera seleccionado antes
            //                    if(self.inputFocus) {
            //                        let elem = $("#" + self.inputFocus);

            //                        elem.focus();
            //                        document.getElementById(self.inputFocus).setSelectionRange(self.inputPosition, self.inputPosition);
            //                        elem.trigger("focusin");

            //                        self.inputFocus = null;
            //                        self.inputPosition = 0;
            //                    }
            //                }
            //            })

            //        },
            //        error: function (err) {                       

            //            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
            //                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
            //            } else {
            //                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_ACCIONES_CORRECTIVAS'), 4000);
            //            }
            //        }
            //    });
            //},
            //editarAccionCorrectiva: function (id) {
            //    let self = this;

            //    let responsableInput = $(`#responsable_${id}`);
            //    let observacionesInput = $(`#observaciones_${id}`);
            //    let accionRealizadaInput = $(`#accion_realizada_${id}`);
            //    let estadoInput = $(`#cmbEstado_${id}`);                

            //    let responsable = responsableInput.val();
            //    let observaciones = observacionesInput.val();
            //    let accionRealizada = accionRealizadaInput.val();
            //    let estado = estadoInput.getKendoDropDownList().value();

            //    // Comprobamos si alguno ha sido modificado de su valor inicial
            //    if (responsableInput.attr("initial-value") != responsable ||
            //        observacionesInput.attr("initial-value") != observaciones ||
            //        accionRealizadaInput.attr("initial-value") != accionRealizada ||
            //        estadoInput.attr("initial-value") != estado) {

            //        kendo.ui.progress($("#gridAccionesCorrectivas"), true);

            //        $.ajax({
            //            type: "PUT",
            //            url: "../api/accionesCorrectivasTurno/",
            //            contentType: "application/json; charset=utf-8",
            //            dataType: "json",
            //            data: JSON.stringify({
            //                Id: id,
            //                Responsable: responsable,
            //                Observaciones: observaciones,
            //                AccionRealizada: accionRealizada,
            //                Estado: parseInt(estado) == 1
            //            }),
            //            complete: function () {
            //                kendo.ui.progress($("#gridAccionesCorrectivas"), false)
            //            },
            //            success: function (res) {
            //                if (res) {
            //                    responsableInput.attr("initial-value", responsable);
            //                    observacionesInput.attr("initial-value", observaciones);
            //                    accionRealizadaInput.attr("initial-value", accionRealizada);
            //                    estadoInput.attr("initial-value", estado);

            //                    let focusInput = $(document.activeElement);
            //                    if (focusInput.length) {
            //                        self.inputPosition = document.activeElement.selectionStart;
            //                        self.inputFocus = focusInput.attr("id");
            //                    } else {
            //                        self.inputFocus = null;
            //                        self.inputPosition = 0;
            //                    }

            //                    self.cargarAccionesCorrectivas(self.turnoCargado.idTurno);
            //                }
            //            },
            //            error: function (e) {
            //                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
            //                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
            //                } else {
            //                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITAR_ACCIONES_CORRECTIVAS'), 4000);
            //                }
            //            }
            //        });
            //    }
            //},
            //editarParo: async function (id) {
            //    let self = this;

            //    let paro = await self.obtenerParo(id);

            //    self.nuevaVentana = new vistaEditarCrearParo("1", paro, function (e) {                    
            //        OpenWindow(window.app.idioma.t('ATENCION'),
            //            window.app.idioma.t('AVISO_RECREAR_ACCIONES_CORRECTIVAS'),
            //            null,
            //            { width: "500px" }
            //        );
            //        setTimeout(() => {
            //            self.cargarAccionesCorrectivas(self.turnoCargado.idTurno);
            //        }, 10);
            //    });
            //},
            //obtenerParo: function (id) {
            //    return new Promise((resolve, reject) => {

            //        kendo.ui.progress($("#gridAccionesCorrectivas"), true);

            //        $.ajax({
            //            type: "GET",
            //            url: "../api/parosPerdidas/" + id + "/",
            //            dataType: 'json',
            //            contentType: "application/json; charset=utf-8",
            //            dataType: "json",
            //            complete: function () {
            //                kendo.ui.progress($("#gridAccionesCorrectivas"), false);
            //            },
            //            success: function (data) {
            //                resolve(data);
            //            },
            //            error: function (err) {

            //                if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
            //                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
            //                } else {
            //                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_PAROS'), 4000);
            //                }
            //            }
            //        });
            //    });
            //},
            //mostrarModalCrearAC: function (turno, idLinea) {
            //    let self = this;

            //    self.vistaCrearACT = new vistaCrearACT(turno, idLinea, function (e) {
            //        setTimeout(() => {
            //            self.cargarAccionesCorrectivas(turno.idTurno) ;
            //        });
            //    });
            //},
            //mostrarModalBorrarAC: function (idTurno) {
            //    let self = this;

            //    OpenWindow(window.app.idioma.t('BORRAR_ACCIONES_CORRECTIVAS_TURNO'),
            //        window.app.idioma.t('SEGURO_BORRAR_ACCIONES_CORRECTIVAS_TURNO'),
            //        function () { self.borrarAccionesCorrectivas(idTurno); },
            //    );
            //},
            //borrarAccionesCorrectivas: function (idTurno) {
            //    let self = this;

            //    kendo.ui.progress($("#panelAccionesCorrectivas"), true);

            //    $.ajax({
            //        type: "DELETE",
            //        url: "../api/accionesCorrectivasTurno/BorrarPorTurno/" + idTurno + "/",
            //        dataType: 'json',
            //        contentType: "application/json; charset=utf-8",
            //        dataType: "json",
            //        complete: function () {
            //            kendo.ui.progress($("#panelAccionesCorrectivas"), false);
            //        },
            //        success: function (data) {
            //            // Se han borrado las acciones correctivas del turno
            //            $("#btnBorrarAC").getKendoButton().enable(false);

            //            self.cargarAccionesCorrectivas(idTurno);

            //        },
            //        error: function (err) {

            //            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
            //                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
            //            } else {
            //                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_BORRAR_ACCIONES_CORRECTIVAS'), 4000);
            //            }
            //        }
            //    });

            //},
            //mostrarModalFiltroExcelAC: function (e) {
            //    let self = this;

            //    let ventanaFiltroAC = $("<div id='dlgModalFiltroAC'/>").kendoWindow({
            //        title: window.app.idioma.t('EXPORTAR_ACCIONES_CORRECTIVAS'),
            //        width: "400px",
            //        draggable: false,
            //        scrollable: false,
            //        close: function () {
            //            ventanaFiltroAC.getKendoWindow().destroy();
            //        },
            //        resizable: false,
            //        modal: true,
            //    });

            //    let template = kendo.template($("#ACFiltroExcelTemplate").html());
            //    ventanaFiltroAC.getKendoWindow()
            //        .content(template({}))
            //        .center().open();

            //    $("#cmbLineaACExcel").kendoDropDownList({
            //        template: window.app.idioma.t("LINEA") + " #= numLineaDescripcion # - #=descripcion #",
            //        valueTemplate: window.app.idioma.t("LINEA") + " #= numLineaDescripcion # - #=descripcion #",
            //        dataValueField: "id",
            //        dataSource: window.app.planta.lineas,
            //        optionLabel: window.app.idioma.t('SELECCIONE'),
            //    });

            //    let now = new Date();

            //    $("#dtpFechaInicioACExcel").kendoDatePicker({
            //        value: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
            //        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
            //        culture: localStorage.getItem("idiomaSeleccionado"),
            //    });

            //    $("#dtpFechaFinACExcel").kendoDatePicker({
            //        value: now,
            //        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
            //        culture: localStorage.getItem("idiomaSeleccionado"),
            //    });

            //    ventanaFiltroAC.find("#btnExportarACExcel").val(window.app.idioma.t('EXPORTAR'));
            //    ventanaFiltroAC.find("#btnExportarACExcel").kendoButton({
            //        click: async function (e) {
            //            e.preventDefault();
            //            $("#trError").hide();

            //            let filtro = {
            //                idLinea: $("#cmbLineaACExcel").getKendoDropDownList().value(),
            //                fechaInicio: $("#dtpFechaInicioACExcel").getKendoDatePicker().value(),
            //                fechaFin: $("#dtpFechaFinACExcel").getKendoDatePicker().value()
            //            };

            //            // Comprobación de datos
            //            if (!filtro.idLinea || !filtro.fechaInicio || !filtro.fechaFin || filtro.fechaInicio > filtro.fechaFin) {
            //                $("#trError").html(window.app.idioma.t("EXPORTAR_ACCIONES_CORRECTIVAS_ERROR_CAMPOS"));
            //                $("#trError").show();
            //                return;
            //            }

            //            $("#imgProcesando").show();
            //            $("#btnExportarACExcel").getKendoButton().enable(false);

            //            try {
            //                await self.exportarExcelAC(filtro);
            //                $("#imgProcesando").hide();
            //                ventanaFiltroAC.getKendoWindow().close();
            //            }
            //            catch (err)
            //            {
            //                console.log(err);
            //                $("#imgProcesando").hide();
            //                $("#btnExportarACExcel").getKendoButton().enable(true);
            //                $("#trError").html(window.app.idioma.t("ERROR_EXPORTAR_ACCIONES_CORRECTIVAS"));
            //                $("#trError").show();
            //            }
            //        }
            //    });
            //},
            //exportarExcelAC: function (filtro) {
            //    let self = this;

            //    return new Promise(async (resolve, reject) => {
            //        try {
            //            let datos = await self.obtenerACFiltro(filtro);

            //            let sheet = {
            //                columns: [
            //                    { width: 100 },
            //                    { width: 100 },
            //                    { autoWidth: true },
            //                    { autoWidth: true },
            //                    { width: 90 },
            //                    { width: 100 },
            //                    { width: 120 },
            //                    { autoWidth: true },
            //                    { autoWidth: true },
            //                    { width: 70 },
            //                    { autoWidth: true },
            //                ],
            //                filter: {
            //                    from: 0,
            //                    to: 10
            //                },
            //                freezePane: {
            //                    colSplit: 0,
            //                    rowSplit: 1
            //                },
            //                rows: [
            //                    {
            //                        type: "header",
            //                        cells: [
            //                            { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("FECHA"), colSpan: 1, rowSpan: 1 },
            //                            { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("TURNO"), colSpan: 1, rowSpan: 1 },
            //                            { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("MAQUINA"), colSpan: 1, rowSpan: 1 },
            //                            { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("COMENTARIO_PARO"), colSpan: 1, rowSpan: 1 },
            //                            { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("DURACION"), colSpan: 1, rowSpan: 1 },
            //                            { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("RENDIMIENTO_PERDIDO"), colSpan: 1, rowSpan: 1 },
            //                            { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("RESPONSABLE"), colSpan: 1, rowSpan: 1 },
            //                            { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("OBSERVACIONES"), colSpan: 1, rowSpan: 1 },
            //                            { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("ACCION_REALIZADA"), colSpan: 1, rowSpan: 1 },
            //                            { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("ESTADO"), colSpan: 1, rowSpan: 1 },
            //                            { background: '#7a7a7a', color: '#fff', value: window.app.idioma.t("COMENTARIO_TURNO"), colSpan: 1, rowSpan: 1 },
            //                        ]
            //                    },
            //                ]
            //            };

            //            for (let d of datos) {
            //                sheet.rows.push({
            //                    type: "data",
            //                    cells: [
            //                        { value: new Date(d.TurnoFecha), colSpan: 1, rowSpan: 1, format: "dd/mm/yy" },
            //                        { value: window.app.idioma.t("TURNO" + d.IdTipoTurno), colSpan: 1, rowSpan: 1 },
            //                        { value: d.MaquinaNombre, colSpan: 1, rowSpan: 1 },
            //                        { value: d.ComentarioParo, colSpan: 1, rowSpan: 1 },
            //                        { value: GetDurationForExcelFromSeconds(d.Duracion), colSpan: 1, rowSpan: 1, format: "[hh]:mm:ss" },
            //                        { value: d.PerdidaRendimiento / 100, colSpan: 1, rowSpan: 1, format: "0 %" },
            //                        { value: d.Responsable, colSpan: 1, rowSpan: 1 },
            //                        { value: d.Observaciones, colSpan: 1, rowSpan: 1 },
            //                        { value: d.AccionRealizada, colSpan: 1, rowSpan: 1 },
            //                        { value: d.Estado ? window.app.idioma.t("ABIERTA") : window.app.idioma.t("CERRADA"), colSpan: 1, rowSpan: 1 },
            //                        { value: d.ComentarioTurno, colSpan: 1, rowSpan: 1 },
            //                    ]
            //                });
            //            }

            //            let workbook = new kendo.ooxml.Workbook({
            //                sheets: [sheet]
            //            });

            //            // Nombre del excel 
            //            let filename = util.ui.default.gridExcelDate('ACCIONES_CORRECTIVAS').fileName;

            //            kendo.saveAs({
            //                dataURI: workbook.toDataURL(),
            //                fileName: filename
            //            })

            //            resolve();
            //        }
            //        catch (err) {
            //            reject(err);
            //        }
            //    });
            //},
            //obtenerACFiltro: function (filtro) {

            //    filtro.fechaInicio = filtro.fechaInicio.toISOString();
            //    filtro.fechaFin = filtro.fechaFin.toISOString();

            //    return new Promise((resolve, reject) => {
            //        $.ajax({
            //            type: "GET",
            //            url: "../api/accionesCorrectivasTurno/filtro/",
            //            data: filtro,
            //            dataType: 'json',
            //            success: function (data) {                            
            //                resolve(data);
            //            },
            //            error: function (err) {
            //                if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
            //                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
            //                } else {
            //                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_ACCIONES_CORRECTIVAS_TURNO'), 4000);
            //                }
            //                reject();
            //            }
            //        });
            //    });
            //},
            cargarProgramaEnvasado: async function (turno) {
                var self = this;

                return new Promise((resolve, _) => {
                    self.output = [];

                    var altura = $("#programaEnvasado").height();
                    var culture = localStorage.getItem("idiomaSeleccionado").split('-')[0];
                    var inicio = new Date(turno.fecha);
                    var fin = new Date(turno.fin).midnight().addDays(1);

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
                        min: inicio,
                        max: fin,
                        locale: culture,
                        zoomMin: 1000 * 60 * 60 * 12,
                        //zoomMax: 1000 * 60 * 60 * 24 * 15,
                        template: function (item) {
                            return "<strong>" + item.header + "</strong> "
                        }
                    };

                    var idLinea = $("#cmbLinea").data("kendoDropDownList").value();
                    var linea = window.app.planta.lineas.find(f => f.id == idLinea);
                    var i = linea.numLinea -1;
                    var lineas = [
                        {
                            "content": window.app.idioma.t('LINEA') + " " + linea.numLineaDescripcion + " - " +
                                linea.descripcion + ' ' + window.app.idioma.t('PLANIFICADA'),
                            "id": linea.id + 'p',
                            "title": window.app.idioma.t('LINEA') + " " + linea.numLineaDescripcion + " - " +
                                linea.descripcion + ' ' + window.app.idioma.t('PLANIFICADA'),
                            "id": linea.id + 'p',
                            "value": (i + 1) * 2,
                            "className": 'line' + i + 'p'
                        },
                        {
                            "content": window.app.idioma.t('LINEA') + " " + linea.numLineaDescripcion + " - " +
                                linea.descripcion + ' real',
                            "id": linea.id + 'r',
                            "title": window.app.idioma.t('LINEA') + " " + linea.numLineaDescripcion + " - " +
                                linea.descripcion + ' real',
                            "id": linea.id + 'r',
                            "value": (i + 1) * 2 + 1,
                            "className": 'line' + i + 'r'
                        }

                    ]

                    self.timeline?.destroy();
                    self.timeline = new vis.Timeline($("#programaEnvasado").get(0));
                    self.timeline.setOptions(options);
                    self.timeline.setGroups(lineas);
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

                    $.ajax({
                        url: "../api/ordenes/obtenerOrdenesPlanificadas/",
                        data: JSON.stringify({
                            start: inicio,
                            end: fin
                        }),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        type: "POST",
                        cache: true,
                    }).done(function (data) {

                        const output = self.cargarProgramador(data);

                        self.timeline.setItems(output);
                        self.timeline.redraw();

                    }).fail(function (xhr) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ORDENES_PLANIFICADAS'), 4000);
                    });

                    resolve();
                })
            },
            cargarProgramador: function ( data ) {
                var colores = [];
                var totalCPB = 0;
                var totalEnvases = 0;
                kendo.ui.progress($('#programaEnvasado'), true);

                var output = [];

                if (data) {
                    for (var i = 0; i < data.length; i++) {
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

                        if (data[i].CajasPorPalet == 0) {
                            totalCPB = 0;
                            totalEnvases = (data[i].produccion.paletsEtiquetadoraProducidos - data[i].produccion.cantidadPicosPalets) * data[i].EnvasesPorPalet;
                        } else {
                            totalCPB = ((data[i].produccion.paletsEtiquetadoraProducidos - data[i].produccion.cantidadPicosPalets) * data[i].CajasPorPalet) + data[i].produccion.cantidadPicosCajas;
                            totalEnvases = totalCPB * (data[i].EnvasesPorPalet / data[i].CajasPorPalet);
                        }

                        output.push({
                            start: new Date(data[i].dFecInicioEstimadoLocal),
                            end: new Date(data[i].dFecFinEstimadoLocal),
                            group: data[i].idLinea + 'p',
                            className: "line" + data[i].numLinea + 'p',
                            content: data[i].id + ' plan',
                            id: data[i].id + ' plan',
                            style: colores[data[i].numLinea - 1],
                            header: data[i].producto.codigo + ' - ' + data[i].producto.nombre + ', ' +
                                window.app.idioma.t('ETIQUETADORA_PALETS') + ': ' + kendo.toString(data[i].cantPlanificada, 'n0') + ', ' +
                                window.app.idioma.t('CPB') + ': ' + kendo.toString(data[i].cantPlanificada * data[i].CajasPorPalet, 'n0') +
                                ', ' + window.app.idioma.t('ENVASES') + ': ' + kendo.toString(data[i].cantPlanificada * data[i].EnvasesPorPalet, 'n0') +
                                ', ' + window.app.idioma.t('HL') + ': ' +
                                kendo.toString(data[i].cantPlanificada * data[i].EnvasesPorPalet * data[i].producto.hectolitros, 'n2'),
                            title: `${data[i].id} - ${window.app.idioma.t('INICIO_PLANIFICADO')}: ` +
                                `${kendo.toString(new Date(data[i].dFecInicioEstimado + 'Z'), kendo.culture().calendars.standard.patterns.MES_FechaHoraMin)} - ` +
                                `${window.app.idioma.t('FIN_PLANIFICADO')}: ` +
                                `${kendo.toString(new Date(data[i].dFecFinEstimado + 'Z'), kendo.culture().calendars.standard.patterns.MES_FechaHoraMin)}`,
                            estado: data[i].estadoActual.nombre
                        })

                        if (new Date(data[i].dFecIniLocal).getFullYear() > 2010) {
                            var fechas = "";
                            if (data[i].estadoActual.nombre == window.app.idioma.t('INICIANDO') ||
                                data[i].estadoActual.nombre == window.app.idioma.t('PRODUCCION')) {

                                fechas = ` - ${window.app.idioma.t('INICIO')}: ` +
                                    `${kendo.toString(new Date(data[i].dFecInicio + 'Z'), kendo.culture().calendars.standard.patterns.MES_FechaHoraMin)} - ` +
                                    `${window.app.idioma.t('FIN_ESTIMADO')}: ` +
                                    `${(data[i].fecFinEstimadoCalculadoTurno === window.app.idioma.t('NO_DISPONIBLE')
                                        || data[i].fecFinEstimadoCalculadoTurno === window.app.idioma.t('FECHA_NO_DISPONIBLE')
                                        ? data[i].fecFinEstimadoCalculadoTurno
                                        : FormatearFechaPorRegion(data[i].fecFinEstimadoCalculadoTurno, kendo.culture().calendars.standard.patterns.MES_FechaHoraMin)
                                    )}`;

                            } else if (!new Date(data[i].dFecFin) < new Date(data[i].dFecInicio) &&
                                (data[i].estadoActual.nombre != window.app.idioma.t('INICIANDO') &&
                                    data[i].estadoActual.nombre != window.app.idioma.t('PRODUCCION'))) {

                                fechas = ` - ${window.app.idioma.t('INICIO')}: ` +
                                    `${kendo.toString(new Date(data[i].dFecInicio + 'Z'), kendo.culture().calendars.standard.patterns.MES_FechaHoraMin)} - ` +
                                    `${window.app.idioma.t('FIN')}: ` +
                                    `${kendo.toString(new Date(data[i].dFecFin + 'Z'), kendo.culture().calendars.standard.patterns.MES_FechaHoraMin)}`;

                            } else {
                                fechas = ` - ${window.app.idioma.t('INICIO')}: ` +
                                    `${kendo.toString(new Date(data[i].dFecInicio + 'Z'), kendo.culture().calendars.standard.patterns.MES_FechaHoraMin)}`;
                            }

                            //data[i].estadoActual.nombre
                            output.push({
                                start: new Date(data[i].dFecIniLocal),
                                end: new Date(data[i].dFecFinLocal >= data[i].dFecIniLocal &&
                                    (data[i].estadoActual.nombre != window.app.idioma.t('INICIANDO') &&
                                        data[i].estadoActual.nombre != window.app.idioma.t('PRODUCCION')) ? data[i].dFecFinLocal : new Date()),
                                group: data[i].idLinea + 'r',
                                className: "line" + data[i].numLinea + 'r',
                                content: data[i].id + 'real',
                                id: data[i].id + ' real',
                                style: colores[data[i].numLinea - 1],
                                header: data[i].producto.codigo + ' - ' + data[i].producto.nombre + ', ' +
                                    window.app.idioma.t('ETIQUETADORA_PALETS') + ': ' + kendo.toString(data[i].produccion.paletsEtiquetadoraProducidos - data[i].produccion.cantidadPicosPalets, 'n0') + ', ' +
                                    window.app.idioma.t('CPB') + ': ' + kendo.toString(totalCPB, 'n0') + ', ' +
                                    window.app.idioma.t('ENVASES') + ': ' + kendo.toString(totalEnvases, 'n0') + ', ' +
                                    window.app.idioma.t('HL') + ': ' + kendo.toString(totalEnvases * data[i].producto.hectolitros, 'n2'),
                                title: data[i].id + fechas,
                                estado: data[i].estadoActual.nombre
                            })
                        }
                    }
                }
                kendo.ui.progress($('#programaEnvasado'), false);

                return output;
            },
            cargarComentarioTurno: async function (idTurno) {                
                let self = this;

                $("#tfComentarioTurno").val("");
                $("#tfComentarioTurno").prop("title", "");

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "../api/turnos/ComentarioTurno/" + idTurno + "/",
                        data: idTurno,
                        dataType: 'json',
                        success: function (data) {
                            if (data) {
                                $("#tfComentarioTurno").val(data);
                                $("#tfComentarioTurno").prop("title", data);
                            }
                            resolve();
                        },
                        error: function (err) {
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_COMENTARIO_TURNO'), 4000);
                            }
                            resolve();
                        }
                    });
                });
            },
            actualizarComentarioTurno: function (datos) {
                let self = this;

                kendo.ui.progress($("#panelComentarioTurno"), true);

                $.ajax({
                    type: "PUT",
                    url: "../api/turnos/ComentarioTurno/",
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json',
                    complete: function () {
                        kendo.ui.progress($("#panelComentarioTurno"), false);
                    },
                    success: function (data) {
                        if (!data) {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ACTUALIZAR_COMENTARIO_TURNO'), 4000);
                        }
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ACTUALIZAR_COMENTARIO_TURNO'), 4000);
                        }
                    }
                });
            },
            cargarSemaforoTurno: async function (idTurno) {
                let self = this;

                $("#semaforoTurno").css("background-color", "transparent");

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "../api/turnos/ObtenerSemaforoTurno/" + idTurno + "/",
                        data: idTurno,
                        dataType: 'json',
                        success: function (data) {
                            if (data) {
                                $("#semaforoTurno").css("background-color", data);                                
                            }
                            resolve();                            
                        },
                        error: function (err) {
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_SEMAFORO_TURNO'), 4000);
                            }
                            resolve();
                        }
                    });
                });
            },
            cargarSemaforoArranqueWOTurno: async function (idTurno) {
                let self = this;

                $("#semaforoArranqueWOTurno").css("background-color", "transparent");

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "../api/turnos/ObtenerSemaforoArranqueWOTurno/" + idTurno + "/",
                        data: idTurno,
                        dataType: 'json',
                        success: function (data) {
                            if (data) {
                                $("#semaforoArranqueWOTurno").css("background-color", data);
                            }
                            resolve();
                        },
                        error: function (err) {
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_SEMAFORO_ARRANQUE_WO_TURNO'), 4000);
                            }
                            resolve();
                        }
                    });
                });
            },
            cargarSemaforoFinalizacionWOTurno: async function (idTurno) {
                let self = this;

                $("#semaforoFinalizacionWOTurno").css("background-color", "transparent");

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "../api/turnos/ObtenerSemaforoFinalizacionWOTurno/" + idTurno + "/",
                        data: idTurno,
                        dataType: 'json',
                        success: function (data) {
                            if (data) {
                                $("#semaforoFinalizacionWOTurno").css("background-color", data);
                            }
                            resolve();
                        },
                        error: function (err) {
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_SEMAFORO_FINALIZACION_WO_TURNO'), 4000);
                            }
                            resolve();
                        }
                    });
                });
            },
            cargarSemaforoFormulariosCalidadTurno: async function (linea, turno) {
                let self = this;

                $("#semaforoCalidadTurno").css("background-color", "transparent");

                return new Promise((resolve, reject) => {
                    let datos = {
                        linea: linea,
                        inicioTurno: new Date(turno.inicio + 'Z').toISOString(),
                        finTurno: new Date(turno.fin + 'Z').toISOString()
                    }

                    $.ajax({
                        type: "POST",
                        url: "../api/ObtenerFormulariosCalidadPorTurno/",
                        data: JSON.stringify(datos),
                        dataType: "json",
                        contentType: "application/json; charset=utf-8",
                        success: function (data) {
                            if (data) {
                                // Revisamos todos los formularios del turno para sacar un único semáforo
                                let color = self.coloresDefecto.verde;

                                if (data.find(f => f.EsValido == self.constEstadoCalidad.NoValido)) {
                                    color = self.coloresDefecto.naranja;
                                }
                                else if (data.find(f => f.EsValido == self.constEstadoCalidad.Pendiente)) {
                                    color = self.coloresDefecto.azul;
                                } 
                                $("#semaforoCalidadTurno").css("background-color", color);
                            }
                            resolve();
                        },
                        error: function (err) {
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_FORMULARIOS_CALIDAD_TURNO'), 4000);
                            }
                            resolve();
                        }
                    });
                });
            },
            cargarTPOTurno: async function (linea, desde, hasta) {
                let self = this;

                let datos = {
                    linea,
                    desde,
                    hasta
                }

                $("#valorTPO").html("N/A");

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "../api/O2Llenadoras/TPO",
                        data: datos,
                        dataType: 'json',
                        success: function (data) {
                            if (data != undefined) {
                                $("#valorTPO").html(data.toFixed(2));
                            }
                            else {
                                $("#valorTPO").html("N/A");
                            }
                            resolve();
                        },
                        error: function (err) {
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_TPO_TURNO'), 4000);
                            }
                            resolve();
                        }
                    });
                });
            },
            cargarParosSinJustificar: async function (idTurno) {
                let self = this;

                let datos = {
                    idTurno
                }

                $("#valorParosSinJustificar").html("N/A");

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "../api/ParosPerdidas/PorcentajeSinJustificar",
                        data: datos,
                        dataType: 'json',
                        success: function (data) {
                            if (data != undefined) {
                                $("#valorParosSinJustificar").html(data.toFixed(2));
                            } else
                            {
                                $("#valorParosSinJustificar").html("N/A");
                            }
                            resolve();
                        },
                        error: function (err) {
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_PORCENTAJE_PAROS_SIN_JUSTIFICAR'), 4000);
                            }
                            resolve();
                        }
                    });
                });
            },
            cargarArranques: async function (idLinea, idTipoTurno, fechaTurno) {
                let self = this;

                let grid = $("#gridArranques").getKendoGrid();
                if (grid != null) {
                    grid.destroy();
                }
                $("#gridArranques").empty();

                return new Promise((resolve, reject) => {

                    $("#gridArranques").kendoGrid({
                        scrollable: true,
                        columns: [
                            {
                                field: "IndicadorPaletizadora",
                                title: window.app.idioma.t("INDICADOR_PALETIZADORA"),
                                template: "<div class='circle_cells' style='background-color: #=IndicadorPaletizadora#'></div>",
                                width: "40%",
                                attributes: { style: "text-align:center;" }
                            },
                            {
                                field: "MinutosFinal2",
                                title: window.app.idioma.t("DURACION_PALETIZADORA"),
                                //width: 90                                
                            },
                            {
                                field: "Desviacion",
                                title: window.app.idioma.t("DESVIACION"),
                                //width: 90,
                                template: "#= ConversorHorasMinutosSegundos((MinutosObjetivo2 - MinutosFinal2) *60) #"
                            }
                        ],
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: "../api/OrdenesArranque/",
                                    dataType: "json",
                                    contentType: "application/json; charset=utf-8",
                                    data: {
                                        idLinea,
                                        idTipoTurno,
                                        fechaTurno
                                    }
                                },
                            },
                            schema: {
                                model: {
                                    id: "Id",
                                    fields: {
                                        Id: { type: "string" },
                                        IndicadorPaletizadora: { type: "string" }
                                    }
                                },
                            },
                            error: function (e) {
                                if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                                }
                                else {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_ARRANQUES'), 2000);
                                }
                            },
                            requestEnd: function (e) {
                                resolve();
                            }
                        })
                    })
                });
            },
            cargarCambios: async function (idLinea, idTipoTurno, fechaTurno) {
                let self = this;

                let grid = $("#gridCambios").getKendoGrid();
                if (grid != null) {
                    grid.destroy();
                }
                $("#gridCambios").empty();

                return new Promise((resolve, reject) => {

                    $("#gridCambios").kendoGrid({
                        scrollable: true,
                        columns: [
                            {
                                field: "IndicadorPaletizadora",
                                title: window.app.idioma.t("INDICADOR_PALETIZADORA"),
                                template: "<div class='circle_cells' style='background-color: #=IndicadorPaletizadora#'></div>",
                                width: "40%",
                                attributes: { style: "text-align:center;" }
                            },
                            {
                                field: "MinutosFinal2",
                                title: window.app.idioma.t("DURACION_PALETIZADORA"),
                                //width: 90                                
                            },
                            {
                                field: "Desviacion",
                                title: window.app.idioma.t("DESVIACION"),
                                //width: 90,
                                template: "#= ConversorHorasMinutosSegundos((MinutosObjetivo2 - MinutosFinal2) *60) #"
                            }
                        ],
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: "../api/OrdenesCambio/",
                                    dataType: "json",
                                    contentType: "application/json; charset=utf-8",
                                    data: {
                                        idLinea,
                                        idTipoTurno,
                                        fechaTurno
                                    }
                                },
                            },
                            schema: {
                                model: {
                                    id: "Id",
                                    fields: {
                                        Id: { type: "string" },
                                        IndicadorPaletizadora: { type: "string" }
                                    }
                                },
                            },
                            error: function (e) {
                                if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                                }
                                else {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_CAMBIOS'), 2000);
                                }
                            },
                            requestEnd: function (e) {
                                resolve();
                            }
                        })
                    })
                });
            },
            cargarProduccionMaquinas: async function (numLinea, idTurno) {
                let self = this;

                let grid = $("#gridProduccion").getKendoGrid();
                if (grid != null) {
                    grid.destroy();
                }
                $("#gridProduccion").empty();

                return new Promise((resolve, reject) => {

                    // Cancelamos la petición anterior
                    if (self.requests.produccionMaquinas) {
                        self.requests.produccionMaquinas.abort();
                    }

                    self.requests.produccionMaquinas = $.ajax({
                        type: "GET",
                        url: "../api/env/produccion/obtenerProduccionMaquinasTurno/"+ numLinea +"/"+ idTurno +"/",
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            // Construimos el dataSource para el Grid con los datos obtenidos.

                            let productos = new Array();

                            for (let d of data) {
                                if (!productos.includes(d.IdProducto)) {
                                    productos.push(d.IdProducto);
                                }
                            }

                            let dataSource = [];

                            for (let p of productos) {
                                let lote = data.filter(f => f.IdProducto == p);
                                let sample = lote[0];
                                let ds = {
                                    title: !p ? window.app.idioma.t('SIN_ASIGNAR') : p + " - " + sample.DescripcionProducto,
                                    WO: !p ? " " : sample.IdParticion,
                                    etiqPalets: lote.filter(f => f.Maquina.tipo.nombre == "ETIQUETADORA_PALETS")
                                        .reduce((a, b) => a.CantidadProducida || 0 + b.CantidadProducida, 0),
                                    CPB: lote.filter(f => f.Maquina.tipo.nombre == "ENCAJONADORA" || f.Maquina.tipo.nombre == "EMPAQUETADORA")
                                        .reduce((a, b) => a.CantidadProducida || 0 + b.CantidadProducida, 0),
                                    envases: lote.filter(f => f.Maquina.tipo.EsLLenadora)
                                        .reduce((a, b) => a.CantidadProducida || 0 + b.CantidadProducida, 0),
                                    OEE: sample.OEE
                                }

                                dataSource.push(ds);
                            }

                            // Creamos el grid
                            $("#gridProduccion").kendoGrid({
                                scrollable: true,
                                resizable: true,
                                columns: [
                                    {
                                        field: "title",
                                        title: window.app.idioma.t("PRODUCTO"),
                                        width: 130,
                                        footerTemplate: "#=window.app.idioma.t('TOTAL')#"
                                    },
                                    {
                                        field: "WO",
                                        title: window.app.idioma.t("WO"),
                                        //width: 90                                
                                    },
                                    {
                                        field: "etiqPalets",
                                        title: window.app.idioma.t("ETIQUETADORA_PALETS"),
                                        width: 75,
                                        footerTemplate: "#:sum#"
                                    },
                                    {
                                        field: "CPB",
                                        title: window.app.idioma.t("CPB"),
                                        width: 50,
                                        footerTemplate: "#:sum#"
                                    },
                                    {
                                        field: "envases",
                                        title: window.app.idioma.t("ENVASES"),
                                        width: 60,
                                        footerTemplate: "#:sum#"
                                    },
                                    {
                                        field: "OEE",
                                        title: window.app.idioma.t("OEE_WO"),
                                        template: "#=(OEE ? OEE.toFixed(2) : '')#",
                                        width: 70,
                                    }
                                ],
                                dataSource: {
                                    data: dataSource,
                                    aggregate: [
                                        { field: "etiqPalets", aggregate: "sum" },                                        
                                        { field: "CPB", aggregate: "sum" },                                        
                                        { field: "envases", aggregate: "sum" },                                        
                                    ]
                                },
                                dataBound: function (e) {
                                    e.sender.footer.find("td").css({ "background-color": "#99c3d7", "font-weight": "bold" });
                                }
                            })
                            resolve();
                        },
                        error: function (err) {
                            if (err.statusText == "abort") {
                                return;
                            }

                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_PRODUCCION_MAQUINAS'), 4000);
                            }
                            resolve();
                        }
                    });
                });
            },
            cargarPanelOEE: async function (linea, turno, llenadoras, limites) {
                let self = this;

                let grid = $("#gridOEE").getKendoGrid();
                if (grid != null) {
                    grid.destroy();
                }
                $("#gridOEE").empty();

                let oeeTurno = 0;

                try {
                    oeeTurno = await self.obtenerOEETurno(turno.idTurno);
                } catch (err) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_OEE_TURNO'), 4000);
                    }
                    return;
                }

                return new Promise((resolve, _) => {

                    self.cargarOEELlenadoras(linea.numLinea, turno.idTurno, llenadoras)
                        .then((datosLlenadoras) => {
                            let OEEObjetivo = limites ? limites.oeeCritico: null;
                            let OEECritico = limites ? limites.oeeObjetivo: null;

                            // Construimos el dataSource para el Grid con los datos obtenidos.
                            let dataSource = [
                                { Header: window.app.idioma.t('OEE'), Total: 0 },
                                //{ Header: window.app.idioma.t('DISPONIBILIDAD'), Total: 0 },
                                //{ Header: window.app.idioma.t('EFICIENCIA'), Total: 0 },
                                { Header: window.app.idioma.t('RENDIMIENTO'), Total: 0 },
                            ];

                            let columns = [
                                {
                                    field: "Header",
                                    title: '<b>' + window.app.idioma.t('OEE') + '</b>'
                                }
                            ];

                            //let calidadTurno = 1;
                            for (let d of datosLlenadoras) {
                                let columnName = 'LLE' + d.numMaquina;
                                columns.push({
                                    field: columnName,
                                    title: columnName,
                                    template: "#= (" + columnName + " != null ? (" + columnName + ").toFixed(2) + ' %' : '')#"
                                });

                                //calidadTurno = (!isNaN(d.calidad) ? d.calidad / 1000 : 1.0).toFixed(3);

                                //let oee = !isNaN(d.rendimiento) ? d.rendimiento : null;
                                let rendimiento = !isNaN(d.rendimiento) ? d.rendimiento : null;
                                //let disp = !isNaN(d.disponibilidad) ? d.disponibilidad : null;
                                //let efi = !isNaN(d.eficiencia) ? d.eficiencia : null;
                                dataSource[0][columnName] = null;
                                dataSource[0]["Total"] = oeeTurno;

                                dataSource[1][columnName] = rendimiento;
                                dataSource[1]["Total"] += rendimiento || 0;
                                //dataSource[1].Total = calidadTurno * 1000;

                                //dataSource[1][columnName] = disp;
                                //dataSource[1]["Total"] += disp || 0;

                                //dataSource[2][columnName] = efi;
                                //dataSource[2]["Total"] += efi || 0;

                                //dataSource[3][columnName] = null;
                                //dataSource[3].Total = calidadTurno * 1000;
                            }

                            columns.push({
                                field: "Total",
                                title: '<b>' + window.app.idioma.t('TOTAL') + '</b>',
                                template: "#= (Total).toFixed(2) + ' %'#"
                            })

                            //for (let i = 0; i < 1/*3*/; i++) {
                                let d = dataSource[1];
                                d.Total = d.Total / llenadoras.length
                            //}

                            let OEETurno = dataSource[0]["Total"];

                            // Creamos el grid
                            $("#gridOEE").kendoGrid({
                                scrollable: true,
                                columns: columns,
                                dataSource: dataSource,
                                dataBound: function (e) {

                                    if (OEEObjetivo) {
                                        let filaOEE = e.sender.table.find("td[role='gridcell']:contains('OEE')").parent();

                                        let colorFondo = OEETurno < OEECritico || OEETurno > 100 ? self.coloresDefecto.rojo :
                                            OEETurno < OEEObjetivo ? self.coloresDefecto.naranja :
                                                self.coloresDefecto.verde;
                                        let colorTexto = OEETurno < OEECritico || OEETurno > 100 ? "white" :
                                            "black";

                                        filaOEE.css({
                                            "background-color": colorFondo,
                                            "color": colorTexto
                                        });

                                        filaOEE.attr("title", window.app.idioma.t("OEE_OBJETIVO") + ": " + OEEObjetivo.toFixed(2) + " - " +
                                            window.app.idioma.t("OEE_CRITICO") + ": " + OEECritico.toFixed(2))
                                    }
                                }
                            })

                            resolve();
                        })
                        .catch((err) => {
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OEE_LLENADORA_LINEA'), 4000);
                            }
                            resolve();
                        })
                    
                });
            },
            cargarConsolidadoTurno: async function (linea, turno) {
                let self = this;

                return new Promise((resolve, reject) => {

                    let datos = {
                        linea: linea,
                        fecha: new Date(turno.fecha + 'Z').toISOString(),
                        idTipoTurno: turno.tipo.id
                    }

                    $.ajax({
                        type: "GET",
                        url: "../api/ObtenerConsolidadoTurno",
                        dataType: 'json',
                        data: datos,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            resolve(data);
                        },
                        error: function (err) {                            
                            resolve(null);
                        }
                    })
                });
            },
            cargarOEELlenadoras: async function (linea, idTurno, llenadoras) {
                let self = this;

                return new Promise((resolve, reject) => {
                    let arrayProd = [];

                    for (let ll of llenadoras) {
                        arrayProd.push({ maquina: ll });
                    }

                    $.ajax({
                        type: "POST",
                        url: "../api/produccion/obtenerProduccionLlenadorasLinea/" + linea + '/' + idTurno,
                        dataType: 'json',
                        data: JSON.stringify(arrayProd),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            resolve(data);                            
                        },
                        error: function (err) {
                            reject(err);
                        }
                    })
                });
            },
            obtenerOEETurno: async function (idTurno) {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "../api/turnos/OEETurno/" + idTurno + "/",
                        data: idTurno,
                        dataType: 'json',
                        success: function (data) {
                            resolve(data);
                        },
                        error: function (err) {
                            reject(err);
                        }
                    });
                });
            },
            cargaFinalizada: function () {
                $("#loaderReport").hide();
            },
        });

        return ParteRelevoTurno;
    });