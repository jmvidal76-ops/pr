define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/InformeTurno.html', 'compartido/notificaciones', 'vistas/envasado/vParosPerdidas', 'vistas/envasado/vOrdenesCambio', 'vistas/envasado/vOrdenesArranque'],
    function (_, Backbone, $, PlantillaInformeTurno, Not, VistaParosPerdidas, VistaCambios, VistaArranques) {
        var InformeTurno = Backbone.View.extend({
            tagName: 'div',
            id: 'center-pane',
            template: _.template(PlantillaInformeTurno),
            turnoSel: null,
            dsLlenadoras: [],
            dsParosMayores: [],
            dlgVista: null,
            vistaDetalle: null,
            ordenes: null,
            procesos: [],
            linea: null,
            Inicio: null,
            turnoInicio: null,
            turnoFin: null,
            Fin: null,
            cargados: [],
            parosPerdidas: [],
            parosPerdidasLlenadora: [],
            PanelParosPerdidas: false,
            PanelParosPerdidasLlenadora: false,
            PanelOEELlenadora: false,
            PanelDerechoLLenadora: false,
            PanelDerechoEmpaquetadora: false,
            PanelDerechoPaletera: false,
            PanelDerechoRechazos: false,
            numEmpaquetadorasEncajonadoras: null,
            numLLenadoras: null,
            numPaletizadoras: null,
            limitesTurno: null,
            initialize: function () {
                var self = this;
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
                                //myDate = fechaValue.split("/");
                                //var dia = parseInt(myDate[0]) + 1;
                                //var newDate = myDate[1] + "/" + dia + "/" + myDate[2];
                                //var timestamp = new Date(newDate).getTime();
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

                $("#pVertical").kendoSplitter({

                    panes: [
                        { collapsible: false },
                        { collapsible: true, size: "480px" }
                    ]
                });

                $("#pHorizontal").kendoSplitter({
                    orientation: "vertical",
                    panes: [
                        { collapsible: false, size: "27px", resizable: false },
                        { collapsible: false, size: "40px", resizable: false },
                        { collapsible: false }
                    ]
                });

                $("#pGrafTablas").kendoSplitter({
                    orientation: "vertical",
                    panes: [
                        { collapsible: false, size: "40%" },
                        { collapsible: false },
                        { collapsible: false }
                    ]
                });

                $("#right-pane").kendoSplitter({
                    orientation: "vertical",
                    panes: [
                        { collapsible: false, size: "80px" },
                        { collapsible: false },
                        { collapsible: false, size: "60px", scrollable: false },
                        { collapsible: false, size: "40px", scrollable: false },
                        { collapsible: false, size: "60px", scrollable: false },
                        { collapsible: false },
                        { collapsible: false },
                    ]
                });
                $("#toolbar").kendoToolBar({
                    items: [
                        { template: "<label>" + window.app.idioma.t('LINEA') + "</label>" },
                        {
                            template: "<input id='cmbLinea' style='width: 210px;' />",
                            overflow: "never"
                        },
                        { template: "<label>" + window.app.idioma.t('FECHA_2') + "</label>" },
                        {
                            template: "<input id='dtpFecha' style='width: 100px;'/>",
                            overflow: "never"
                        },
                        { template: "<label>" + window.app.idioma.t('TURNO_2') + "</label>" },
                        {
                            template: "<input id='cmbTurnos' style='width: 100px;' />",
                            overflow: "never"
                        },
                        { template: "<label id='lblDescTurno'></label>" },
                        {
                            template: "<a id='btnConsultar' class='k-button k-button-icontext k-grid-add' style='display:none;'>" + window.app.idioma.t('CONSULTAR') + "</a>"
                            //, attributes: { style: "display:none;" },
                        },
                        //{
                        //    template: "<a id='btnExportarPDF' class='k-button k-button-icontext k-grid-add' style='display:none;'>" + window.app.idioma.t('GENERAR_INFORME') + "</a>"
                        //        //, attributes: { style: "display:none;" },
                        //        //type: "button",
                        //        //id: "btnExportarPDF",
                        //        //text: window.app.idioma.t('GENERAR_INFORME'),
                        //        //attributes: { style: "display:none;" },
                        //        //click: function () { self.exportarPDF(); }
                        //},
                        {
                            template: "<a id='btnParos' class='k-button k-button-icontext k-grid-add' style='margin-top:6px;display:none;'>" + window.app.idioma.t('PAROS') + "</a>"
                            //, attributes: { style: "float: right;margin-top:6px;display:none;" },
                            //type: "button",
                            //id: "btnParos",
                            //text: "Paros",
                            //attributes: { style: "float: right;margin-top:6px;display:none;" },
                            //click: function () { self.verDlgEventos('Paros'); }
                        },
                        {
                            template: "<a id='btnCambios' class='k-button k-button-icontext k-grid-add' style='margin-top:6px;display:none;'>" + window.app.idioma.t('CAMBIOS') + "</a>"
                            //, attributes: { style: "float: right;margin-top:6px;display:none;" },
                            //type: "button",
                            //id: "btnCambios",
                            //text: "Cambios",
                            //attributes: { style: "float: right;margin-top:6px;display:none;" },
                            //click: function () { self.verDlgEventos('Cambios'); }
                        },
                        {
                            template: "<a id='btnArranques' class='k-button k-button-icontext k-grid-add' style='margin-top:6px;display:none;'>" + window.app.idioma.t('ARRANQUES') + "</a>"
                            //, attributes: { style: "float: right;margin-top:6px;display:none;" },
                            //type: "button",
                            //id: "btnArranques",
                            //text: "Arranques",
                            //attributes: { style: "float: right;margin-top:6px;display:none;" },
                            //click: function () { self.verDlgEventos('Arranques'); }
                        }
                    ]
                });

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

                this.$("#pCentral").hide();
            },
            events: {
                "click #btnConsultar": 'generarInforme',
                "click #btnExportarPDF": 'exportarPDF',
                'click #btnParos': function () { this.verDlgEventos('Paros'); },
                'click #btnCambios': function () { this.verDlgEventos('Cambios'); },
                'click #btnArranques': function () { this.verDlgEventos('Arranques'); },
            },
            cancelar: function () {
                this.remove();
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
            },
            verDlgEventos: function (tipoEvt) {
                var self = this;

                self.$el.prepend("<div id='dialog'><div id='contenidoDlg' style='margin:0px;padding:0px;width:100%;height:100%;'></div></div>");

                self.dlgVista = self.$("#dialog").kendoWindow({
                    title: window.app.idioma.t(tipoEvt.toUpperCase()) +' ' + window.app.idioma.t('_DEL_TURNO'),
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: ['Close'],
                    iframe: false,
                    height: '90%',
                    width: '90%',
                    scrollable: false,
                    close: function () {
                        self.dlgVista.destroy();
                        self.dlgVista = null;
                    }

                }).data("kendoWindow");

                self.dlgVista.center();

                var opciones = {};
                opciones.dia = self.turnoSel.fechaUTC;
                opciones.turno = self.turnoSel.tipo.id;
                opciones.fechaTurnoInicio = self.turnoSel.inicioLocal;
                opciones.fechaTurnoFin = self.turnoSel.finLocal;

                if (tipoEvt == 'Paros') {
                    for (i = 0; i < window.app.planta.lineas.length; i++) {
                        if (window.app.planta.lineas[i].id == self.turnoSel.linea.id) {
                            opciones.linea = self.turnoSel.linea.numLinea;

                        }
                    }
                    opciones.fechaTurno = self.turnoSel.fecha;
                } else {
                    opciones.linea = self.turnoSel.linea.id;
                }

                if (tipoEvt == 'Paros') {
                    self.vistaDetalle = new VistaParosPerdidas({ id: 'contenidoDlg', filtro: opciones });
                } else if (tipoEvt == 'Cambios') {
                    self.vistaDetalle = new VistaCambios({ id: 'contenidoDlg', filtro: opciones });
                } else { // arranques                    
                    self.vistaDetalle = new VistaArranques({ id: 'contenidoDlg', filtro: opciones });
                }

            },
            exportarPDF: function () {
                var self = this;
                var form = document.createElement("form");
                form.setAttribute("method", "POST");
                form.setAttribute("action", "/Informes/INF-ENV-PROD_ANA-4.aspx");

                // setting form target to a window named 'formresult'
                form.setAttribute("target", "_blank");

                var lineaField = document.createElement("input");
                lineaField.setAttribute("name", "Linea");
                lineaField.setAttribute("value", self.linea);
                form.appendChild(lineaField);

                var fechaInicioField = document.createElement("input");
                fechaInicioField.setAttribute("name", "FechaInicio");
                fechaInicioField.setAttribute("value", self.Inicio);
                form.appendChild(fechaInicioField);

                var turnoInicioField = document.createElement("input");
                turnoInicioField.setAttribute("name", "turnoInicio");
                turnoInicioField.setAttribute("value", self.turnoInicio);
                form.appendChild(turnoInicioField);

                var fechaFinField = document.createElement("input");
                fechaFinField.setAttribute("name", "FechaFin");
                fechaFinField.setAttribute("value", self.Fin);
                form.appendChild(fechaFinField);

                var idiomaField = document.createElement("input");
                idiomaField.setAttribute("name", "Idioma");
                idiomaField.setAttribute("value", localStorage.getItem("idiomaSeleccionado"));
                form.appendChild(idiomaField);

                document.body.appendChild(form);

                form.submit();
                document.body.removeChild(form);

            },
            cambiaLineaFecha: function () {
                var self = this;
                var hoyDate = new Date();
                self.$("#btnExportarPDF").hide();
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
                self.$("#btnParos").hide();
                self.$("#btnCambios").hide();
                self.$("#btnArranques").hide();
                self.$("#btnConsultar").hide();
                self.$("#lblDescTurno").hide();
                self.$("#btnExportarPDF").hide();
            },
            cambiaTurno: function (e, self) {
                var self = this;
                var selTurno = $("#cmbTurnos").data('kendoDropDownList').value();
                self.$("#btnExportarPDF").hide();
                if (selTurno != "") {
                    var ds = $("#cmbTurnos").data('kendoDropDownList').dataSource;
                    for (var i = 0; i < ds.data().length; i++) {
                        if (ds.at(i).tipo.id == selTurno) {
                            self.turnoSel = ds.at(i);
                            $("#lblDescTurno").text("De: " + kendo.toString(new Date(ds.at(i).inicioLocal), "HH:mm:ss") + " a " + kendo.toString(new Date(ds.at(i).finLocal), "HH:mm:ss"));
                            i = ds.data().length;
                            self.$("#btnParos").show();
                            self.$("#btnCambios").show();
                            self.$("#btnArranques").show();
                            self.$("#btnConsultar").show();
                            self.$("#lblDescTurno").show();
                            $("#btnParos").parent().css('float', 'right');
                            $("#btnCambios").parent().css('float', 'right');
                            $("#btnArranques").parent().css('float', 'right');

                        }
                    }
                } else {
                    self.$("#btnParos").hide();
                    self.$("#btnCambios").hide();
                    self.$("#btnArranques").hide();
                    self.$("#btnConsultar").hide();
                    self.$("#lblDescTurno").hide();
                    self.$("#btnExportarPDF").hide();
                }
            },
            generarInforme: function (e, self) {
                var self = this;
                if (self.turnoSel) {
                    self.limitesTurno = null;
                    self.PanelParosPerdidas = false;
                    self.PanelParosPerdidasLlenadora = false;
                    self.PanelOEELlenadora = false;
                    self.PanelDerechoLLenadora = false;
                    self.PanelDerechoEmpaquetadora = false;
                    self.PanelDerechoPaletera = false;
                    self.PanelDerechoRechazos = false;
                    self.procesos[0] = false;
                    self.procesos[1] = false;
                    self.$("#btnExportarPDF").hide();
                    this.$("#loader").show();
                    self.dsLlenadoras = [];
                    //Recogemos los datos de la consulta
                    var linea = null;
                    var datos = {};
                    datos.idLinea = $("#cmbLinea").data("kendoDropDownList").value();

                    for (var i = 0; i < window.app.planta.lineas.length; i++) {
                        if (window.app.planta.lineas[i].id == datos.idLinea) {
                            linea = window.app.planta.lineas[i];
                            i = window.app.planta.lineas.length;
                        }
                    }

                    datos.fInicio = new Date(self.turnoSel.inicioLocal);
                    datos.fFin = new Date(self.turnoSel.finLocal);

                    var llenadoras = linea.llenadoras;

                    //Ordenes del turno
                    self.obtenerOrdenesTurno(datos);
                    self.obtenerLimitesOEE(linea.numLinea, self.turnoSel);
                    //Cargamos el grafico de Oee de las llenadoras
                    self.generarGraficoOeeLlenadoras(datos, llenadoras, linea);

                    $.ajax({
                        type: "GET",
                        url: "../api/obtenerParosPerdidasTurno/" + self.turnoSel.idTurno,
                        dataType: 'json',
                        cache: true,
                        async: true
                    }).success(function (data) {
                        try {
                            if (data) {
                                self.parosPerdidas = data;
                            } else {
                                self.parosPerdidas = [];
                            }

                            //Cargamos los grid de paros por horas 
                            self.generarGridParosMayores(linea);
                            self.generarGridPerdidas(linea);
                            self.PanelParosPerdidas = true;
                            self.checkLoader();
                        } catch (e) {
                            self.PanelParosPerdidas = true;
                            self.checkLoader();
                        }

                    }).error(function (err) {
                        self.PanelParosPerdidas = true;
                        self.checkLoader();
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_PAROS') + ': ' + err, 4000);
                        }
                    });

                    $.ajax({
                        type: "GET",
                        url: "../api/obtenerParosPerdidasTotalesLLenadoraTurno/" + self.turnoSel.idTurno,
                        dataType: 'json',
                        cache: true,
                        async: true
                    }).success(function (data) {
                        try {
                            if (data) {
                                self.parosPerdidasLlenadora = data;
                            } else {
                                self.parosPerdidasLlenadora = [];
                            }

                            self.generarResumenParosLlenadora(llenadoras);
                            self.PanelParosPerdidasLlenadora = true;
                            self.checkLoader();
                        } catch (e) {
                            self.PanelParosPerdidasLlenadora = true;
                            self.checkLoader();
                        }

                    }).error(function (err) {
                        self.PanelParosPerdidasLlenadora = true;
                        self.checkLoader();
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_PAROS') + ': ' + err, 4000);
                        }
                    });

                    //Cargamos los datos resumen del panel derecho
                    //Produccion de la llenadora
                    self.numLLenadoras = llenadoras.length;
                    self.generarDatosResumenLlenadora(datos, llenadoras, linea);

                    //Datos de empaquetadoras y encajonadoras
                    var maquinas = linea.obtenerMaquinas;
                    var empaquetadorasEncajonadoras = new Array();
                    for (var i = 0; i < maquinas.length; i++) {
                        //if (maquinas[i].id.indexOf("ENC") != -1 || maquinas[i].id.indexOf("EMP") != -1) {
                        if (maquinas[i].tipo.nombre == "ENCAJONADORA" || maquinas[i].tipo.nombre == "EMPAQUETADORA") {
                            empaquetadorasEncajonadoras.push(maquinas[i]);
                        }
                    }
                    self.numEmpaquetadorasEncajonadoras = empaquetadorasEncajonadoras.length
                    if (self.numEmpaquetadorasEncajonadoras > 0) {
                        self.generarDatosResumenEmpaquetadoraEncajonadora(datos, empaquetadorasEncajonadoras, linea);
                    } else {
                        self.PanelDerechoEmpaquetadora = true;
                        self.checkLoader();
                    }

                    //Datos de paletizadoras
                    var maquinas = linea.obtenerMaquinas;
                    var paletizadoras = new Array();
                    for (var i = 0; i < maquinas.length; i++) {
                        if (maquinas[i].id.indexOf("PAL") != -1 || maquinas[i].tipo.nombre == "ETIQUETADORA_PALETS") {
                            paletizadoras.push(maquinas[i]);
                        }
                    }

                    self.numPaletizadoras = paletizadoras.length;
                    self.generarDatosResumenPaletizadoras(datos, paletizadoras, linea);


                    //Datos almacén
                    //self.generarDatosAlmacen(datos, linea);
                    self.generarDatosRechazos(linea.id);
                    this.$("#pCentral").show();

                    //Datos a enviar al informe aspx
                    self.linea = linea.id;
                    self.Inicio = self.turnoSel.inicioUTC;
                    self.turnoInicio = self.turnoSel.tipo.nombre;
                    self.turnoFin = self.turnoSel.tipo.nombre
                    self.Fin = self.turnoSel.finUTC;
                } else {
                    Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR_TURNO'), 4000);
                }

            },
            obtenerLimitesOEE: function (numLinea, turnoSel) {
                var self = this;
                $.ajax({
                    type: "GET",
                    url: "../api/turnos/obtenerLimitesOEETurno/" + numLinea + "/" + turnoSel.idTurno,
                    dataType: 'json',
                    cache: true,
                    async: false
                }).success(function (data) {
                    try {
                        if (data) {
                            self.limitesTurno = data;
                        }
                    } catch (e) { }

                }).error(function (err) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_PAROS') + ': ' + err, 4000);
                    }
                });
            },
            checkLoader: function () {
                var self = this;
                if (self.PanelParosPerdidas && self.PanelParosPerdidasLlenadora && self.PanelOEELlenadora && self.PanelDerechoLLenadora && self.PanelDerechoEmpaquetadora && self.PanelDerechoPaletera && self.PanelDerechoRechazos) {
                    self.$("#loader").hide();

                    //Si no hay empaquetadoras / encajonadoras ocultamos el panel
                    var splitter = $('#right-pane').data('kendoSplitter');
                    if (self.numEmpaquetadorasEncajonadoras > 0) {
                        if (splitter.options.panes[3].collapsible) {
                            $("#panelEmpaquetadoraEncajondarora_p1").show();
                            splitter.toggle("#panelEmpaquetadoraEncajondarora_p1");
                            splitter.options.panes[3].collapsible = false;
                        }
                    } else {
                        splitter.options.panes[3].collapsible = true;
                        splitter.toggle("#panelEmpaquetadoraEncajondarora_p1");
                        $("#panelEmpaquetadoraEncajondarora_p1").hide();
                    }

                    //Si no hay paletizadoras ocultamos el panel
                    if (self.numPaletizadoras > 0) {
                        if (splitter.options.panes[4].collapsible) {
                            $("#panelPaletizadora_p1").show();
                            splitter.toggle("#panelPaletizadora_p1");
                            splitter.options.panes[4].collapsible = false;
                        }
                    } else {
                        splitter.options.panes[4].collapsible = true;
                        splitter.toggle("#panelPaletizadora_p1");
                        $("#panelPaletizadora_p1").hide();
                    }

                    //Si no hay llenadoras ocultamos el panel
                    if (self.numLLenadoras > 0) {
                        if (splitter.options.panes[2].collapsible) {
                            $("#panelLlenadoras_p2").show();
                            splitter.toggle("#panelLlenadoras_p2");
                            splitter.options.panes[2].collapsible = false;
                        }
                    } else {
                        splitter.options.panes[2].collapsible = true;
                        splitter.toggle("#panelLlenadoras_p2");
                        $("#panelLlenadoras_p2").hide();
                    }
                }
            },
            generarResumenParosLlenadora: function (llenadoras) {
                var self = this;

                var numLlenadoras = llenadoras.length;

                var datosLlenadoras_p3 = [];

                obj = {};
                obj.parametro = window.app.idioma.t('MAYORES');
                datosLlenadoras_p3.push(obj);

                obj = {};
                obj.parametro = window.app.idioma.t('TIEMPO_MAY');
                datosLlenadoras_p3.push(obj);

                obj = {};
                obj.parametro = window.app.idioma.t('MENORES');
                datosLlenadoras_p3.push(obj);

                obj = {};
                obj.parametro = window.app.idioma.t('TIEMPO_MEN');
                datosLlenadoras_p3.push(obj);

                obj = {};
                obj.parametro = window.app.idioma.t('DURACION_BAJA_VEL');
                datosLlenadoras_p3.push(obj);

                obj = {};
                obj.parametro = window.app.idioma.t('DURACIÓN_PÉRDIDA_PROD');
                datosLlenadoras_p3.push(obj);

                var columnas_p3 = [];
                var colParametro_p3 = {};
                colParametro_p3.field = 'parametro';
                colParametro_p3.title = '<b>' + window.app.idioma.t('PAROS_2') + '</b>';
                colParametro_p3.width = '150px';
                columnas_p3.push(colParametro_p3);

                var totalParosMayores = 0;
                var totalTieParosMay = 0;
                var totalParosMenores = 0;
                var totalTieParosMen = 0;
                var totalTieBajaVel = 0;
                var totalTiePerdidaProd = 0;

                var jsonStr = '{';

                jQuery.each(llenadoras, function (index, maquina) {

                    var col = {};
                    col.field = 'LLE' + maquina.numMaquina;
                    col.title = 'LLE' + maquina.numMaquina;
                    columnas_p3.push(col);

                    jsonStr = jsonStr + "\"LLE" + maquina.numMaquina + "\": {\"type\": \"string\"},";

                    var datosMaquina = [];
                    datosMaquina = $.grep(self.parosPerdidasLlenadora, function (data) {
                        return data.nombre == maquina.nombre;
                    });


                    var acumuladoParosLLenadora = {
                        numParosMayores: 0,
                        numParosMenores: 0,
                        duracionParoMayor: 0,
                        duracionParoMenor: 0,
                        duracionBajaVelocidad: 0,
                        duracionPerdidaProduccion: 0
                    }

                    $.each(datosMaquina, function (i, datos) {

                        acumuladoParosLLenadora.numParosMayores += datos.numParosMayores;
                        acumuladoParosLLenadora.numParosMenores += datos.numParosMenores;
                        acumuladoParosLLenadora.duracionParoMayor += datos.duracionParoMayor;
                        acumuladoParosLLenadora.duracionParoMenor += datos.duracionParoMenor;
                        acumuladoParosLLenadora.duracionBajaVelocidad += datos.duracionBajaVelocidad;
                        acumuladoParosLLenadora.duracionPerdidaProduccion += datos.duracionPerdidaProduccion;
                    });

                    datosLlenadoras_p3[0]["LLE" + maquina.numMaquina] = acumuladoParosLLenadora.numParosMayores; // num paros mayores
                    totalParosMayores += acumuladoParosLLenadora.numParosMayores;
                    datosLlenadoras_p3[1]["LLE" + maquina.numMaquina] = window.app.getDateFormat(acumuladoParosLLenadora.duracionParoMayor); // paros mayores
                    totalTieParosMay += acumuladoParosLLenadora.duracionParoMayor;
                    datosLlenadoras_p3[2]["LLE" + maquina.numMaquina] = acumuladoParosLLenadora.numParosMenores; // num paros menores
                    totalParosMenores += acumuladoParosLLenadora.numParosMenores;
                    datosLlenadoras_p3[3]["LLE" + maquina.numMaquina] = window.app.getDateFormat(acumuladoParosLLenadora.duracionParoMenor); // paros menores
                    totalTieParosMen += acumuladoParosLLenadora.duracionParoMenor;
                    datosLlenadoras_p3[4]["LLE" + maquina.numMaquina] = window.app.getDateFormat(acumuladoParosLLenadora.duracionBajaVelocidad); // duracion baja vel
                    totalTieBajaVel += acumuladoParosLLenadora.duracionBajaVelocidad;
                    datosLlenadoras_p3[5]["LLE" + maquina.numMaquina] = window.app.getDateFormat(acumuladoParosLLenadora.duracionPerdidaProduccion); // duración perdida prod
                    totalTiePerdidaProd += acumuladoParosLLenadora.duracionPerdidaProduccion;

                });

                var colTot = {}
                colTot.field = 'TOTAL';
                colTot.title = '<b>' + window.app.idioma.t('TOTAL') + '</b>';

                columnas_p3.push(colTot);

                datosLlenadoras_p3[0]["TOTAL"] = totalParosMayores; //num paros mayores
                datosLlenadoras_p3[1]["TOTAL"] = window.app.getDateFormat(totalTieParosMay); // paros mayores
                datosLlenadoras_p3[2]["TOTAL"] = totalParosMenores; // num paros menores
                datosLlenadoras_p3[3]["TOTAL"] = window.app.getDateFormat(totalTieParosMen); // paros menores
                datosLlenadoras_p3[4]["TOTAL"] = window.app.getDateFormat(totalTieBajaVel); // duracion baja vel
                datosLlenadoras_p3[5]["TOTAL"] = window.app.getDateFormat(totalTiePerdidaProd); // duración perdida prod

                jsonStr = jsonStr.substring(0, jsonStr.length - 1) + '}';
                campos = JSON.parse(jsonStr);

                $("#panelLlenadoras_p3").html('');
                $("#panelLlenadoras_p3").kendoGrid({
                    dataSource: {
                        data: datosLlenadoras_p3,
                        schema: {
                            model: {
                                id: "parametro",
                                fields: campos
                            }
                        }
                    },
                    pageable: false,
                    columns: columnas_p3
                });
            },
            generarDatosResumenLlenadora: async function (datos, llenadoras, linea) {
                var self = this;

                var numLlenadoras = llenadoras.length;

                var fIni = new Date(datos.fInicio);
                var fFin = new Date(datos.fFin);

                var arrayProd = [];

                var datosLlenadoras_p1 = [];
                var datosLlenadoras_p2 = [];

                //Campos del grid 1

                var obj = {};
                obj.parametro = window.app.idioma.t('OEE');
                datosLlenadoras_p1.push(obj);

                obj = {};
                obj.parametro = window.app.idioma.t('DISPONIBILIDAD');
                datosLlenadoras_p1.push(obj);

                obj = {};
                obj.parametro = window.app.idioma.t('EFICIENCIA');
                datosLlenadoras_p1.push(obj);

                obj = {};
                obj.parametro = window.app.idioma.t('RENDIMIENTO');
                datosLlenadoras_p1.push(obj);

                //obj = {};
                //obj.parametro = window.app.idioma.t('IC_TURNO');
                //datosLlenadoras_p1.push(obj);

                obj = {};
                obj.parametro = window.app.idioma.t('TPLANIFICADO');
                datosLlenadoras_p1.push(obj);

                obj = {};
                obj.parametro = window.app.idioma.t('TOPERATIVO');
                datosLlenadoras_p1.push(obj);

                obj = {};
                obj.parametro = window.app.idioma.t('TNETO');
                datosLlenadoras_p1.push(obj);

                //Campos del grid 2

                obj = {};
                obj.parametro = window.app.idioma.t('ENVASES');
                datosLlenadoras_p2.push(obj);

                obj = {};
                obj.parametro = window.app.idioma.t('HLENVASES');
                datosLlenadoras_p2.push(obj);

                let oeeTurno = 0;

                try {
                    oeeTurno = await self.obtenerOEETurno(self.turnoSel.idTurno);
                } catch (err) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_OEE_TURNO'), 4000);
                    }
                    return;
                }

                jQuery.each(llenadoras, function (index, value) {

                    var datosProd = {};
                    datosProd.fecInicio = fIni;
                    datosProd.fecFin = fFin;
                    datosProd.maquina = value;
                    arrayProd.push(datosProd);

                });

                $.ajax({
                    type: "POST",
                    url: "../api/produccion/obtenerProduccionLlenadorasLinea/" + linea.numLinea + '/' + self.turnoSel.idTurno,
                    dataType: 'json',
                    async: true,
                    data: JSON.stringify(arrayProd),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).done(function (data) {
                    try {
                        var columnas_p1 = [];
                        var columnas_p2 = [];
                        var campos = {};

                        var colParametro_p1 = {};
                        var colParametro_p2 = {};

                        colParametro_p1.field = 'parametro';
                        colParametro_p2.field = 'parametro';
                        colParametro_p1.title = '<b>' + window.app.idioma.t('OEE') + '</b>';
                        colParametro_p2.title = '<b>' + window.app.idioma.t('PRODUCCIÓN') + '</b>';
                        colParametro_p1.width = '150px';
                        colParametro_p2.width = '150px';

                        columnas_p1.push(colParametro_p1);
                        columnas_p2.push(colParametro_p2);
                        var jsonStr = '{';

                        var totalOEE = 0;
                        var totalDisp = 0;
                        var totalEfic = 0;
                        var totalTiePlanif = 0;
                        var totalTieOperat = 0;
                        var totalTieNeto = 0;

                        var totalEnvases = 0;
                        var totalHLcaudal = 0;
                        var totalHLenvases = 0;
                        var totalRendimiento = 0;

                        var totalParosMayores = 0;
                        var totalTieParosMay = 0;
                        var totalParosMenores = 0;
                        var totalTieParosMen = 0;
                        var totalTieBajaVel = 0;
                        var totalTiePerdidaProd = 0;
                        var totalRechazos = 0;

                        var totalHLrechazos = 0;
                        var totalCajas = 0;


                        var colTot = {}
                        colTot.field = 'TOTAL';
                        colTot.title = '<b>' + window.app.idioma.t('TOTAL') + '</b>';
                        var calidadTurno;
                        jQuery.each(data, function (index, value) {

                            var col = {};
                            col.field = 'LLE' + value.numMaquina;
                            col.title = 'LLE' + value.numMaquina;

                            columnas_p1.push(col);
                            columnas_p2.push(col);

                            calidadTurno = (!isNaN(value.calidad) ? value.calidad / 1000 : 1.0).toFixed(3);

                            jsonStr = jsonStr + "\"LLE" + value.numMaquina + "\": {\"type\": \"string\"},";
                            datosLlenadoras_p1[0]["LLE" + value.numMaquina] = null;
                            //totalOEE += (!isNaN(value.rendimiento) ? value.rendimiento : 0.0);
                            datosLlenadoras_p1[1]["LLE" + value.numMaquina] = (!isNaN(value.disponibilidad) ? value.disponibilidad.toFixed(2) + " %" : '--');
                            totalDisp += (!isNaN(value.disponibilidad) ? value.disponibilidad : 0.0);
                            datosLlenadoras_p1[2]["LLE" + value.numMaquina] = (!isNaN(value.eficiencia) ? value.eficiencia.toFixed(2) + " %" : '--');
                            totalEfic += (!isNaN(value.eficiencia) ? value.eficiencia : 0.0);

                            datosLlenadoras_p1[3]["LLE" + value.numMaquina] = (!isNaN(value.rendimiento) ? value.rendimiento.toFixed(2) + " %" : '--');
                            totalRendimiento += (!isNaN(value.rendimiento) ? value.rendimiento : 0.0);

                            datosLlenadoras_p1[4]["LLE" + value.numMaquina] = (!isNaN(value.tiempoPlanificado) ? (value.tiempoPlanificado / 60.0).toFixed(0) + " min" : "--"); // agomezn 030816: 042 del Excel de incidencias, no muestra los minutos correctos
                            totalTiePlanif += (!isNaN(value.tiempoPlanificado) ? value.tiempoPlanificado : 0.0);

                            datosLlenadoras_p1[5]["LLE" + value.numMaquina] = (!isNaN(value.tiempoOperativo) ? (value.tiempoOperativo / 60.0).toFixed(0) + " min" : "--"); // agomezn 030816: 042 del Excel de incidencias, no muestra los minutos correctos
                            totalTieOperat += (!isNaN(value.tiempoOperativo) ? value.tiempoOperativo : 0.0);

                            datosLlenadoras_p1[6]["LLE" + value.numMaquina] = (!isNaN(value.tiempoNeto) ? (value.tiempoNeto / 60.0).toFixed(0) + " min" : "--"); // agomezn 030816: 042 del Excel de incidencias, no muestra los minutos correctos
                            totalTieNeto += (!isNaN(value.tiempoNeto) ? value.tiempoNeto : 0.0);


                            datosLlenadoras_p2[0]["LLE" + value.numMaquina] = value.envases;
                            totalEnvases += value.envases;
                            totalHLcaudal += 0;
                            datosLlenadoras_p2[1]["LLE" + value.numMaquina] = value.hectolitros.toFixed(2); // HL envases
                            totalHLenvases += value.hectolitros;
                            var hlPorEnvase = 0;
                            if (totalEnvases > 0) {
                                hlPorEnvase = totalHLenvases / totalEnvases;
                            }
                        });


                        columnas_p1.push(colTot);
                        columnas_p2.push(colTot);

                        //*********** TOTALES **************
                        datosLlenadoras_p1[0]["TOTAL"] = oeeTurno.toFixed(2) + ' %';
                        datosLlenadoras_p1[1]["TOTAL"] = (totalDisp / numLlenadoras).toFixed(2) + ' %';
                        datosLlenadoras_p1[2]["TOTAL"] = (totalEfic / numLlenadoras).toFixed(2) + ' %';
                        datosLlenadoras_p1[3]["TOTAL"] = (totalRendimiento / numLlenadoras).toFixed(2) + ' %';

                        totalTiePlanif = (!isNaN(totalTiePlanif) ? (totalTiePlanif / 60.0) : 0.0); // agomezn 030816: 042 del Excel de incidencias, no muestra los minutos correctos
                        datosLlenadoras_p1[4]["TOTAL"] = totalTiePlanif.toFixed(0) + ' min';
                        totalTieOperat = (!isNaN(totalTieOperat) ? (totalTieOperat / 60.0) : 0.0); // agomezn 030816: 042 del Excel de incidencias, no muestra los minutos correctos
                        datosLlenadoras_p1[5]["TOTAL"] = totalTieOperat.toFixed(0) + ' min';
                        totalTieNeto = (!isNaN(totalTieNeto) ? (totalTieNeto / 60.0) : 0.0); // agomezn 030816: 042 del Excel de incidencias, no muestra los minutos correctos
                        datosLlenadoras_p1[6]["TOTAL"] = totalTieNeto.toFixed(0) + ' min';
                        
                        datosLlenadoras_p2[0]["TOTAL"] = totalEnvases;
                        datosLlenadoras_p2[1]["TOTAL"] = totalHLenvases.toFixed(2); // HL envase

                        //**********************************

                        jsonStr = jsonStr.substring(0, jsonStr.length - 1) + '}';
                        campos = JSON.parse(jsonStr);

                        var config = {}
                        config.type = 'string';
                        campos.parametro = config;

                        $("#panelLlenadoras_p1").html('');
                        $("#panelLlenadoras_p1").kendoGrid({
                            dataSource: {
                                data: datosLlenadoras_p1,
                                schema: {
                                    model: {
                                        id: "parametro",
                                        fields: campos
                                    }
                                }
                            },
                            pageable: false,
                            columns: columnas_p1
                        });

                        $("#panelLlenadoras_p2").html('');
                        $("#panelLlenadoras_p2").kendoGrid({
                            dataSource: {
                                data: datosLlenadoras_p2,
                                schema: {
                                    model: {
                                        id: "parametro",
                                        fields: campos
                                    }
                                }
                            },
                            pageable: false,
                            columns: columnas_p2
                        });

                        self.procesos[1] = true;

                        if (self.procesos[0] && self.procesos[1]) {
                            self.$("#btnExportarPDF").show();
                            self.$("#btnParos").show();
                            self.$("#btnCambios").show();
                            self.$("#btnArranques").show();
                        }

                        self.PanelDerechoLLenadora = true;
                        self.checkLoader();
                    } catch (e) {
                        self.PanelDerechoLLenadora = true;
                        self.checkLoader();
                    }
                }).fail(function (xhr) {
                    self.PanelDerechoLLenadora = true;
                    self.checkLoader();

                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_PRODUCCION_LLENADORA_LINEA'), 4000);
                    }
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
            generarDatosResumenEmpaquetadoraEncajonadora: function (datos, maquinas, linea) {
                var self = this;

                var numMaquinas = maquinas.length;

                var fIni = new Date(datos.fInicio);
                var fFin = new Date(datos.fFin);

                var arrayProd = [];

                var datosMaquinas_p1 = [];

                obj = {};
                obj.parametro = window.app.idioma.t('CAJAS_PACKS');
                datosMaquinas_p1.push(obj);

                jQuery.each(maquinas, function (index, value) {

                    var datosProd = {};
                    datosProd.fecInicio = fIni;
                    datosProd.fecFin = fFin;
                    datosProd.maquina = value;
                    arrayProd.push(datosProd);

                });

                $.ajax({
                    type: "POST",
                    url: "../api/produccion/obtenerProduccionEmpaquetadoraEncajonadoraLinea/" + linea.numLinea + '/' + self.turnoSel.idTurno,
                    dataType: 'json',
                    async: true,
                    data: JSON.stringify(arrayProd),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).done(function (data) {
                    try {
                        var columnas_p1 = [];
                        var campos = {};

                        var colParametro_p1 = {};
                        colParametro_p1.field = 'parametro';
                        colParametro_p1.title = '<b>' + window.app.idioma.t('PROD_EMPAQUETADORA') + '</b>';
                        colParametro_p1.width = '150px';

                        columnas_p1.push(colParametro_p1);

                        var jsonStr = '{';

                        var totalCajas = 0;


                        var colTot = {}
                        colTot.field = 'TOTAL';
                        colTot.title = '<b>' + window.app.idioma.t('TOTAL') + '</b>';

                        jQuery.each(data, function (index, value) {

                            var col = {};
                            if (value.claseMaquina == "EMPAQUETADORA") {
                                col.field = 'EMP' + value.numMaquina;
                                col.title = 'EMP' + value.numMaquina;
                                jsonStr = jsonStr + "\"EMP" + value.numMaquina + "\": {\"type\": \"string\"},";
                                //datosMaquinas_p1[0]["EMP" + value.numMaquina] = value.cajas;
                                datosMaquinas_p1[0]["EMP" + value.numMaquina] = value.cantidadProducida;
                            } else {
                                col.field = 'ENC' + value.numMaquina;
                                col.title = 'ENC' + value.numMaquina;
                                jsonStr = jsonStr + "\"ENC" + value.numMaquina + "\": {\"type\": \"string\"},";
                                //datosMaquinas_p1[0]["ENC" + value.numMaquina] = value.cajas;
                                datosMaquinas_p1[0]["ENC" + value.numMaquina] = value.cantidadProducida;
                            }
                            columnas_p1.push(col);


                            totalCajas += value.cantidadProducida;


                        });


                        columnas_p1.push(colTot);

                        //*********** TOTALES **************
                        datosMaquinas_p1[0]["TOTAL"] = totalCajas;

                        //**********************************

                        jsonStr = jsonStr.substring(0, jsonStr.length - 1) + '}';
                        campos = JSON.parse(jsonStr);

                        var config = {}
                        config.type = 'string';
                        campos.parametro = config;

                        $("#panelEmpaquetadoraEncajondarora_p1").html('');
                        $("#panelEmpaquetadoraEncajondarora_p1").kendoGrid({
                            dataSource: {
                                data: datosMaquinas_p1,
                                schema: {
                                    model: {
                                        id: "parametro",
                                        fields: campos
                                    }
                                }
                            },
                            pageable: false,
                            columns: columnas_p1
                        });

                        self.PanelDerechoEmpaquetadora = true;
                        self.checkLoader();
                    } catch (e) {
                        self.PanelDerechoEmpaquetadora = true;
                        self.checkLoader();
                    }

                }).fail(function (xhr) {
                    self.PanelDerechoEmpaquetadora = true;
                    self.checkLoader();

                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_PRODUCCION_LLENADORA_LINEA'), 4000);
                    }
                });

            },
            generarDatosResumenPaletizadoras: function (datos, maquinas, linea) {
                var self = this;

                var numMaquinas = maquinas.length;

                var fIni = new Date(datos.fInicio);
                var fFin = new Date(datos.fFin);

                var arrayProd = [];

                var datosMaquinas_p1 = [];

                jQuery.each(maquinas, function (index, value) {
                    //Descripcion de maquinas
                    obj = {};
                    obj.parametro = maquinas[index].descripcion.charAt(0).toUpperCase() + maquinas[index].descripcion.toLowerCase().slice(1);
                    datosMaquinas_p1.push(obj);
                    //Valores de maquinas
                    var datosProd = {};
                    datosProd.fecInicio = fIni;
                    datosProd.fecFin = fFin;
                    datosProd.maquina = value;
                    arrayProd.push(datosProd);

                });

                $.ajax({
                    type: "POST",
                    url: "../api/produccion/obtenerProduccionPaletizadoraLinea/" + linea.numLinea + '/' + self.turnoSel.idTurno,
                    dataType: 'json',
                    async: true,
                    data: JSON.stringify(arrayProd),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).done(function (data) {
                    try {
                        var columnas_p1 = [];
                        var campos = {};

                        var colParametro_p1 = {};
                        colParametro_p1.field = 'parametro';
                        colParametro_p1.title = '<b>' + window.app.idioma.t('PROD_PALETERA') + '</b>';
                        colParametro_p1.width = '150px';

                        columnas_p1.push(colParametro_p1);

                        var jsonStr = '{';

                        var totalPalets = 0;
                        var totalEtiquetadoraPalets = 0;

                        var colTot = {};
                        colTot.field = 'TOTAL';
                        colTot.title = '<b>' + window.app.idioma.t('TOTAL') + '</b>';
                        jQuery.each(data, function (index, value) {
                            var col = {};
                            if (value.claseMaquina == "ETIQUETADORA_PALETS") {

                                col.field = 'ETI' + value.numMaquina;
                                col.title = 'ETI' + value.numMaquina;
                                jsonStr = jsonStr + "\"ETI" + value.numMaquina + "\": {\"type\": \"string\"},";
                                datosMaquinas_p1[index]["ETI" + value.numMaquina] = typeof value.cantidadProducida != 'undefined' && value.cantidadProducida != null ? value.cantidadProducida : 0;
                                totalEtiquetadoraPalets += typeof value.cantidadProducida != 'undefined' && value.cantidadProducida != null ? value.cantidadProducida : 0;
                            } else {
                                col.field = 'PAL' + value.numMaquina;
                                col.title = 'PAL' + value.numMaquina;
                                jsonStr = jsonStr + "\"PAL" + value.numMaquina + "\": {\"type\": \"string\"},";
                                datosMaquinas_p1[index]["PAL" + value.numMaquina] = typeof value.cantidadProducida != 'undefined' && value.cantidadProducida != null ? value.cantidadProducida : 0;
                                totalPalets += typeof value.cantidadProducida != 'undefined' && value.cantidadProducida != null ? value.cantidadProducida : 0;
                            }


                            columnas_p1.push(col);





                        });


                        columnas_p1.push(colTot);

                        //*********** TOTALES **************
                        datosMaquinas_p1[0]["TOTAL"] = totalEtiquetadoraPalets;
                        datosMaquinas_p1[1]["TOTAL"] = totalPalets;
                        //**********************************

                        jsonStr = jsonStr.substring(0, jsonStr.length - 1) + '}';
                        campos = JSON.parse(jsonStr);

                        var config = {}
                        config.type = 'string';
                        campos.parametro = config;

                        $("#panelPaletizadora_p1").html('');
                        $("#panelPaletizadora_p1").kendoGrid({
                            dataSource: {
                                data: datosMaquinas_p1,
                                schema: {
                                    model: {
                                        id: "parametro",
                                        fields: campos
                                    }
                                }
                            },
                            pageable: false,
                            columns: columnas_p1
                        });

                        self.PanelDerechoPaletera = true;
                        self.checkLoader();
                    } catch (e) {
                        self.PanelDerechoPaletera = true;
                        self.checkLoader();
                    }
                }).fail(function (xhr) {
                    self.PanelDerechoPaletera = true;
                    self.checkLoader();

                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_PRODUCCION_LLENADORA_LINEA'), 4000);
                    }
                });

            },
            generarDatosRechazos: function (linea) {
                var self = this;

                var datosRechazos = [];

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerRechazosTurno/" + self.turnoSel.idTurno,
                    dataType: 'json',
                    async: true,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).done(function (data) {

                    try {
                        var tempSource = new kendo.data.DataSource({
                            data: [
                                { "tiporechazo": window.app.idioma.t('TOTAL'), "automaticos": data.rechazosVaciosAutomatico + data.rechazosClasificadorAutomatico + data.rechazosSalidaLlenadoraAutomatico + data.rechazosProductoTerminadoAutomatico },
                                { "tiporechazo": window.app.idioma.t('CLASIFICADOR'), "automaticos": data.rechazosClasificadorAutomatico },
                                { "tiporechazo": window.app.idioma.t('VACIOS'), "automaticos": data.rechazosVaciosAutomatico },
                                { "tiporechazo": window.app.idioma.t('SUBTOTAL_VACIOS'), "automaticos": data.rechazosVaciosAutomatico + data.rechazosClasificadorAutomatico },
                                { "tiporechazo": window.app.idioma.t('LLENADORA'), "automaticos": data.rechazosSalidaLlenadoraAutomatico },
                                { "tiporechazo": window.app.idioma.t('PRODUCTO_TERMINADO'), "automaticos": data.rechazosProductoTerminadoAutomatico },
                                { "tiporechazo": window.app.idioma.t('SUBTOTAL_LLENOS'), "automaticos": data.rechazosSalidaLlenadoraAutomatico + data.rechazosProductoTerminadoAutomatico }
                            ]
                        })

                        $("#panelLlenadoras_p5").kendoGrid({
                            dataSource: tempSource,
                            columns: [{
                                field: "tiporechazo",
                                title: window.app.idioma.t('RECHAZOS_2')
                            }, {
                                field: "automaticos",
                                title: window.app.idioma.t('AUTOMATICOS')
                            }
                            ]
                        });
                        //self.$("#loader").hide();
                        self.PanelDerechoRechazos = true;
                        self.checkLoader();
                    } catch (e) {
                        self.PanelDerechoRechazos = true;
                        self.checkLoader();
                    }
                }).fail(function (xhr) {
                    self.PanelDerechoRechazos = true;
                    self.checkLoader();

                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_LOS_DATOS_DE'), 4000);
                    }
                    //self.$("#loader").hide();
                });

            },
            getDateFormat: function sformat(s) {
                var fm = [
                    (Math.floor(Math.floor(Math.floor(s / 60) / 60) / 24) * 24) + //Dias
                    (Math.floor(Math.floor(s / 60) / 60) % 24), //horas
                    Math.floor(s / 60) % 60, //minutos
                    Math.floor(s % 60) //segundos
                ];
                var date = $.map(fm, function (v, i) { return ((v < 10) ? '0' : '') + v; }).join(':');

                return date;
            },
            generarGraficoOeeLlenadoras: function (datos, llenadoras, linea) {
                var self = this;
                // Creamos grafica con las series de las llenadoras
                var seriesLlenadoras = [];
                jQuery.each(llenadoras, function (index, value) {

                    var serie = {};
                    serie.field = value.id.replace(/\./g, "_").replace(/\-/g, "_");
                    serie.name = value.nombre;
                    seriesLlenadoras.push(serie);
                });

                var limitesOEE = [];
                if (self.limitesTurno) {
                    var z1 = {
                        from: self.limitesTurno.oeeCritico,
                        to: self.limitesTurno.oeeCritico + 0.2,
                        color: "red"
                    }
                    limitesOEE.push(z1);

                    var z2 = {
                        from: self.limitesTurno.oeeObjetivo,
                        to: self.limitesTurno.oeeObjetivo + 0.2,
                        color: "green"
                    }
                    limitesOEE.push(z2);
                }

                //if (self.ordenes && self.ordenes.length > 0) {
                //    var z1 = {
                //        from: self.ordenes[0].oeeCritico,
                //        to: self.ordenes[0].oeeCritico + 0.2,
                //        color: "red"
                //    }
                //    limitesOEE.push(z1);

                //    var z2 = {
                //        from: self.ordenes[0].oeeObjetivo,
                //        to: self.ordenes[0].oeeObjetivo + 0.2,
                //        color: "green"
                //    }
                //    limitesOEE.push(z2);
                //}



                this.$("#grafOEE").kendoChart({
                    dataSource: self.dsLlenadoras,
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
                                    var value;
                                    jQuery.each(self.horasSerieLLenadoras, function (index, hora) {
                                        if (e.value == hora.valor) {
                                            value = e.value + "\nAVG: " + hora.media;
                                        }
                                    });
                                    return value; //.split("/").join("\n");
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
                });

                // *******************************************
                // Precargamos el eje de horas

                var fIni = new Date(datos.fInicio);
                var fFin = new Date(datos.fInicio);
                fFin.setHours(fFin.getHours() + 1);
                self.horasSerieLLenadoras = [];
                while (fFin.getTime() <= datos.fFin.getTime()) {

                    var nuevaSerie = {};

                    nuevaSerie.hora = (((fFin.getHours() == 0 ? 24 : fFin.getHours()) - 1) == 0 ? 24 : ((fFin.getHours() == 0 ? 24 : fFin.getHours()) - 1)) + " - " + (fFin.getHours() == 0 ? 24 : fFin.getHours());

                    $("#grafOEE").data("kendoChart").dataSource.add(nuevaSerie);
                    var hora = {}
                    hora.valor = nuevaSerie.hora;
                    hora.media = 0;
                    self.horasSerieLLenadoras.push(hora);
                    fIni.setHours(fIni.getHours() + 1);
                    fFin.setHours(fFin.getHours() + 1);
                }

                // ******************************************
                var arrayProd = [];

                var fIni = new Date(datos.fInicio);
                var fFin = new Date(datos.fInicio);
                fFin.setHours(fFin.getHours() + 1);

                var datosFiltro = {
                    numLinea: linea.numLinea,
                    idTurno: self.turnoSel.idTurno,
                    inicio: self.turnoSel.inicio,
                    fin: self.turnoSel.fin,
                }

                $.ajax({
                    type: "POST",
                    url: "../api/produccion/obtenerOeeLlenadorasLinea/",
                    dataType: 'json',
                    async: true,
                    data: JSON.stringify(datosFiltro),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).done(function (data) {
                    try {
                        //var hora = new Date(data[0].fecFin).getHours();

                        var series = $("#grafOEE").data("kendoChart").dataSource.data();
                        var idMaquina;
                        jQuery.each(data, function (index, value) {
                            idMaquina = index.replace(/\./g, "_").replace(/\-/g, "_");
                            if (idMaquina != "AVG") {
                                jQuery.each(value, function (index, value) {
                                    series[index][idMaquina] = value.toFixed(2);
                                });
                            } else {
                                jQuery.each(value, function (index, value) {
                                    var hora = self.horasSerieLLenadoras[index];
                                    hora.media = value.toFixed(2);
                                });
                            }
                        });
                        $("#grafOEE").data("kendoChart").refresh();

                        self.procesos[0] = true;

                        if (self.procesos[0] && self.procesos[1]) {
                            //self.$("#loader").hide();
                            self.$("#btnExportarPDF").show();
                        }
                        self.PanelOEELlenadora = true;
                        self.checkLoader();
                    } catch (e) {
                        self.PanelOEELlenadora = true;
                        self.checkLoader();
                    }
                }).fail(function (xhr) {
                    self.PanelOEELlenadora = true;
                    self.checkLoader();

                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OEE_LLENADORA_LINEA'), 4000);
                    }
                });
            },
            obtenerOrdenesTurno: function (datos) {
                var self = this;
                $.ajax({
                    type: "POST",
                    url: "../api/ordenes/obtenerOrdenesIntervalo/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    async: false
                }).done(function (data) {
                    self.ordenes = data;
                    self.$("#ordenes").html('');

                    jQuery.each(data, function (index, value) {
                        self.$("#ordenes").append("<div class='bloqueOrden'>" + value.producto.codigo + " - " + value.producto.nombre + " (" + value.id + ")</div>");
                    });
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ORDENES_INTERVALO'), 4000);
                    }
                });
            },
            generarGridParosMayores: function (linea) {
                var self = this;

                //Montamos array con las series
                var columnas = [];
                var campos = {};

                var fIni = new Date(self.turnoSel.inicioLocal);
                var fFin = new Date(self.turnoSel.inicioLocal);
                fFin.setHours(fFin.getHours() + 1);

                var colMaquina = {}
                colMaquina.field = 'maquina';
                colMaquina.title = '<b>' + window.app.idioma.t('PAROS_MAYORES') + '</b>';
                colMaquina.width = '240px';
                columnas.push(colMaquina);

                var jsonStr = '{';

                while (fFin.getTime() <= new Date(self.turnoSel.finLocal).getTime()) {
                    var col = {}
                    col.field = 'h' + fFin.getHours().toString();
                    col.title = fIni.getHours() + ':00';
                    //col.format = "{0:n1}";
                    columnas.push(col);

                    jsonStr = jsonStr + "\"h" + fFin.getHours().toString() + "\": {\"type\": \"number\"},";

                    fIni.setHours(fIni.getHours() + 1);
                    fFin.setHours(fFin.getHours() + 1);
                }

                jsonStr = jsonStr.substring(0, jsonStr.length - 1) + '}';
                campos = JSON.parse(jsonStr);

                var config = {}
                config.type = 'string';
                campos.maquina = config;

                var config = {}
                config.type = 'number';
                campos.llenadora = config;

                config = {}
                config.type = 'number';
                campos.total = config;

                var colTotal = {}
                colTotal.field = 'getDateFormat()';
                colTotal.title = 'Total';
                columnas.push(colTotal);

                var datosParosHoras = [];
                $("#gridParosMayores").html('');
                $("#gridParosMayores").kendoGrid({
                    dataSource: {
                        data: datosParosHoras,
                        schema: {
                            model: {
                                id: "maquina",
                                fields: campos,
                                getDateFormat: function () {
                                    return window.app.getDateFormat(this.total);
                                }
                            }
                        }
                    },
                    pageable: false,
                    columns: columnas,
                    dataBound: function (e) {
                        var dataItems = e.sender.dataSource.view();
                        for (var j = 0; j < dataItems.length; j++) {
                            if (dataItems[j].llenadora == 1) {
                                var row = e.sender.tbody.find("[data-uid='" + dataItems[j].uid + "']");
                                var cell = row.children().eq(0);
                                cell.addClass('celdaLlenadora');
                            }
                        }
                    }
                });
                var maquinas = linea.obtenerMaquinas;
                var plantillaHoras = self.montarColumnasHoras();
                for (var i = 0; i < maquinas.length; i++) {
                    var registro = $.extend({}, plantillaHoras);
                    //$.each(registro, function (i, hora) {
                    //    registro[i] = window.app.getDateFormat(hora)
                    //});
                    registro.maquina = maquinas[i].descripcion; // agomezn 010615: 044 que Parte de Turno muestre descripciones de máquinas en vez de nombre más ID
                    registro.llenadora = (maquinas[i].tipo.nombre == 'LLENADORA' ? 1 : 0);
                    registro.idMaquina = maquinas[i].nombre;
                    registro.total = 0;
                    $("#gridParosMayores").data('kendoGrid').dataSource.data().push(registro);
                }

                var dataSourceParosMayores = $("#gridParosMayores").data('kendoGrid').dataSource.data();
                $.each(dataSourceParosMayores, function (i, maquina) {
                    var datosMaquina = $.grep(self.parosPerdidas, function (data) {
                        return data.nombre == maquina.idMaquina;
                    });
                    if (datosMaquina && datosMaquina.length > 0) {
                        $.each(datosMaquina, function (i, datos) {
                            maquina['h' + (datos.hora + self.getTimeOffset(self.turnoSel.inicioLocal) + 1)] = window.app.getDateFormat(datos.duracionParoMayor);
                            maquina['total'] += datos.duracionParoMayor;
                        });
                    } else {
                        maquina['total'] = 0;
                    }
                });

                $("#gridParosMayores").data('kendoGrid').dataSource.sort([{ field: "total", dir: "desc" }]);
                $("#gridParosMayores").data('kendoGrid').refresh();
            },
            generarGridPerdidas: function (linea) {
                var self = this;

                //Montamos array con las series
                var columnas = [];
                var campos = {};

                var fIni = new Date(self.turnoSel.inicioLocal);
                var fFin = new Date(self.turnoSel.inicioLocal);
                fFin.setHours(fFin.getHours() + 1);

                var colMaquina = {}
                colMaquina.field = 'maquina';
                colMaquina.title = '<b>' + window.app.idioma.t('PERDIDAS_PRODUCCIÓN') + '</b>';
                colMaquina.width = '240px';
                columnas.push(colMaquina);

                var jsonStr = '{';

                while (fFin.getTime() <= new Date(self.turnoSel.finLocal).getTime()) {
                    var col = {}
                    col.field = 'h' + fFin.getHours().toString();
                    col.title = fIni.getHours() + ':00';
                    //col.format = "{0:n1}";
                    columnas.push(col);

                    jsonStr = jsonStr + "\"h" + fFin.getHours().toString() + "\": {\"type\": \"number\"},";

                    fIni.setHours(fIni.getHours() + 1);
                    fFin.setHours(fFin.getHours() + 1);
                }

                jsonStr = jsonStr.substring(0, jsonStr.length - 1) + '}';
                campos = JSON.parse(jsonStr);

                var config = {}
                config.type = 'string';
                campos.maquina = config;

                config = {}
                config.type = 'string';
                campos.total = config;

                var colTotal = {}
                colTotal.field = 'getDateFormat()';
                colTotal.title = 'Total';
                //colTotal.format = "{0:n1}";
                columnas.push(colTotal);

                var datosParosHoras = [];

                $("#gridPerdidas").html('');
                $("#gridPerdidas").kendoGrid({
                    dataSource: {
                        data: datosParosHoras,
                        schema: {
                            model: {
                                id: "maquina",
                                fields: campos,
                                getDateFormat: function () {
                                    return window.app.getDateFormat(this.total);
                                }
                            }
                        }

                    },
                    pageable: false,
                    columns: columnas
                });
                var maquinas = linea.llenadoras;
                var plantillaHoras = self.montarColumnasHoras();
                for (var i = 0; i < maquinas.length; i++) {
                    var registro = plantillaHoras;
                    registro.maquina = maquinas[i].tipo.nombre + ' ' + maquinas[i].numMaquina;
                    registro.idMaquina = maquinas[i].nombre;
                    registro.total = 0;
                    $("#gridPerdidas").data('kendoGrid').dataSource.data().push(registro);
                }

                var dataSourcePerdidas = $("#gridPerdidas").data('kendoGrid').dataSource.data();
                $.each(dataSourcePerdidas, function (i, maquina) {
                    var datosMaquina = $.grep(self.parosPerdidas, function (data) {
                        return data.nombre == maquina.idMaquina;
                    });
                    if (datosMaquina && datosMaquina.length > 0) {
                        $.each(datosMaquina, function (i, datos) {
                            maquina['h' + (datos.hora + self.getTimeOffset(self.turnoSel.inicioLocal) + 1)] = window.app.getDateFormat(datos.duracionPerdidaProduccion);
                            maquina['total'] += datos.duracionPerdidaProduccion;
                        });
                    } else {
                        maquina['total'] = 0;
                    }
                });

                $("#gridPerdidas").data('kendoGrid').dataSource.sort([{ field: "total", dir: "desc" }]);
                $("#gridPerdidas").data('kendoGrid').refresh();
            },
            montarColumnasHoras: function () {
                var self = this;
                var fIni = new Date(self.turnoSel.inicioLocal);
                var fFin = new Date(self.turnoSel.inicioLocal);
                fFin.setHours(fFin.getHours() + 1);

                var jsonStr = '{';

                while (fFin.getTime() <= new Date(self.turnoSel.finLocal).getTime()) {

                    jsonStr = jsonStr + "\"h" + fFin.getHours().toString() + "\":\"" + window.app.getDateFormat(0) + "\",";
                    fIni.setHours(fIni.getHours() + 1);
                    fFin.setHours(fFin.getHours() + 1);
                }

                jsonStr = jsonStr.substring(0, jsonStr.length - 1) + '}';
                return JSON.parse(jsonStr);
            },
            asignaHorasParo: function (maquina, paro) {
                var self = this;

                var limiteTurno = new Date(self.turnoSel.finLocal).getTime();
                var fIni = new Date(self.turnoSel.inicioLocal);
                var fFin = new Date(self.turnoSel.inicioLocal);
                fFin.setHours(fFin.getHours() + 1);

                var inicioParo = new Date(paro.dFechaHoraInicioLocal).getTime()
                var finParo = new Date(paro.dFechaHoraFinLocal).getTime()

                while (fFin.getTime() <= limiteTurno) {
                    // Paros que incluyen toda la hora
                    if (inicioParo <= fIni.getTime() && finParo >= fFin.getTime()) {
                        maquina['h' + fFin.getHours()] = 60;
                        maquina['total'] = maquina['total'] + 60;
                    } // Paros dentro de una hora
                    else if (inicioParo >= fIni.getTime() && finParo <= fFin.getTime()) {
                        var minutos = (finParo - inicioParo) / 60000;
                        maquina['h' + fFin.getHours()] += minutos;
                        maquina['total'] = maquina['total'] + minutos;
                    } // Un trozo por la izquierda
                    else if (inicioParo <= fIni.getTime() && finParo >= fIni.getTime()) {
                        var minutos = (finParo - fIni.getTime()) / 60000;
                        maquina['h' + fFin.getHours()] += minutos;
                        maquina['total'] = maquina['total'] + minutos;
                    } // Un trozo por la derecha
                    else if (inicioParo <= fFin.getTime() && finParo >= fFin.getTime()) {
                        var minutos = (fFin.getTime() - inicioParo) / 60000;
                        maquina['h' + fFin.getHours()] += minutos;
                        maquina['total'] = maquina['total'] + minutos;
                    }

                    fIni.setHours(fIni.getHours() + 1);
                    fFin.setHours(fFin.getHours() + 1);
                }

            },
            getTimeOffset: function (d) {
                var date = new Date(d)
                var offset = date.getTimezoneOffset() * (-1);
                return offset / 60;
            }

        });

        return InformeTurno;
    });