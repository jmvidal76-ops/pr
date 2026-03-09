define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/TurnosFabrica.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', 'compartido/util'],
    function (_, Backbone, $, plantillaTurnosFabrica, VistaDlgConfirm, Not, util) {
        var gridTurnosFabrica = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(plantillaTurnosFabrica),
            dsSemanas: null,
            semanasAnho: [],
            weekday: [],
            tiposTurno: [],
            tiposPlantillaTurno: [],
            registrosSel: [],
            resultadoDiasFestivos: [],
            elementos: null,
            desdeInicio: null,
            filaExpand: null,
            maxValueHoras: 8,
            lstException: [],
            numSemanaSelected: null,
            initialize: function () {
                var self = this;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.weekday = new Array(7);
                self.weekday[0] = "Domingo";
                self.weekday[1] = "Lunes";
                self.weekday[2] = "Martes";
                self.weekday[3] = "Miercoles";
                self.weekday[4] = "Jueves";
                self.weekday[5] = "Viernes";
                self.weekday[6] = "Sabado";

                $.ajax({
                    type: "GET",
                    url: "../api/tiposTurnosFabrica/",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.tiposTurno = data;
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_TIPOS_TURNO'), 2000);
                    }
                });

                $.ajax({
                    type: "GET",
                    url: "../api/tiposPlantillaTurnoFabrica/",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.tiposPlantillaTurno = data;
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_TIPOS_PLANTILLA_TURNO'), 2000);
                    }
                });

                $.ajax({
                    type: "GET",
                    url: "../api/diasFestivos/", // + $("#selectAnyo").val(),
                    dataType: 'json',
                    cache: false,
                    async: true
                }).done(function (data) {
                    self.resultadoDiasFestivos = data;
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_FESTIVOS'), 2000);
                    }
                });

                self.render();
            },
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))
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

                this.$("#selectSemana").kendoDropDownList({
                    dataValueField: "numSemana",
                    template: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    valueTemplate: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    open: function (e) {
                        var listContainer = e.sender.list.closest(".k-list-container");
                        listContainer.width(listContainer.width() + kendo.support.scrollbar());
                    },
                });

                var Anhos = [];
                var anyoActual = (new Date()).getFullYear();
                var anyoInicial = window.app.planta.anyoImplantacion;
                if ((anyoInicial + 1) < anyoActual) {
                    anyoInicial = anyoActual - 2;
                }

                //Anhos[0] = { id: (anoActual ), nombre: (anoActual ).toString() };
                for (var i = anyoInicial; i < (anyoActual + 3); i++) {
                    Anhos[i - anyoInicial] = { id: i, nombre: i.toString() };
                }

                var ano = { id: anyoActual, nombre: anyoActual };
                this.$("#selectAnyo").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: Anhos,
                    value: (new Date()).getFullYear(),
                    change: function () { self.cambiaAnio(this, self); },

                    //optionLabel: window.app.idioma.t('SELECCIONE_ANYO')
                });

                this.$("#selectTurno").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "pk",
                    dataSource: self.tiposPlantillaTurno,
                    optionLabel: window.app.idioma.t('SELECCIONE_PLANTILLA')
                });

                //Montamos Grid
                //-------------
                this.$("#gridTurnosFabrica").kendoGrid({
                    //dataSource: dataSourceSemanas,
                    detailTemplate: kendo.template(this.$("#template").html()),
                    detailExpand: function (e) {
                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                        self.filaExpand = this.dataItem(e.masterRow) ? this.dataItem(e.masterRow).id : null;
                        self.numSemanaSelected = this.dataItem(e.masterRow) ? this.dataItem(e.masterRow).numeroSemana : null;
                    },
                    detailCollapse: function (e) {
                        self.filaExpand = null;
                        self.lstException = [];
                    },
                    detailInit: this.detailInit,
                    sortable: true,
                    resizable: true,
                    filterable: {
                        refresh: true,
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },

                    columns: [{
                        title: "",
                        template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                        width: 30
                    },
                    { field: "Linea", title: window.app.idioma.t("LINEA"), width: 150, filterable: false },
                    { field: "Ano", title: window.app.idioma.t("ANYO"), width: 100, filterable: false },
                    { field: "Semana", title: window.app.idioma.t("SEMANA"), width: 400, filterable: false },
                    { field: "TurnosCompletos", title: window.app.idioma.t("TURNOS_COMPLETOS"), width: 150, filterable: false },
                    { field: "TipoTurno", title: window.app.idioma.t("PLANTILLA_SEMANAL"), width: 150, filterable: false }
                    ],
                    dataBound: function () {
                        $(".checkbox").bind("change", function (e) {
                            //$(e.target).closest("tr").toggleClass("k-state-selected");
                            var checked = this.checked;
                            var row = $(e.target).closest("tr");
                            var grid = $("#gridTurnosFabrica").data("kendoGrid");
                            var dataItem = grid.dataItem(row);
                            var idValue = grid.dataItem(row).get("id");

                            if (checked) {
                                row.addClass("k-state-selected");
                                self.registrosSel.push(idValue);
                            } else {
                                row.removeClass("k-state-selected");
                                var index = self.registrosSel.indexOf(idValue);
                                if (index >= 0) {
                                    self.registrosSel.splice(index, 1);
                                }
                            }
                        });

                        if (self.elementos && $(".checkbox")) {
                            var hoy = new Date();
                            hoy.setHours(0, 0, 0, 0);
                            for (i = 0; i < self.elementos.length; i++) {
                                var fechasemanaanterior = new Date(self.elementos[i].diaFin.getTime() - 7 * 24 * 60 * 60 * 1000);
                                fechasemanaanterior.setHours(0, 0, 0, 0);
                                if (fechasemanaanterior < hoy) {
                                    if ($(".checkbox")[i]) {
                                        $(".checkbox")[i].style.display = "none";
                                    }
                                }

                                if ($("#selectLinea").data("kendoDropDownList").value()) {
                                    if (self.elementos[i].diaFin >= hoy && self.elementos[i].diaInicio <= hoy) {
                                        $(".k-master-row")[i].style.backgroundColor = "#3EA2E0"
                                    }
                                }
                            }
                        }

                        if (self.filaExpand) {
                            var grid = $("#gridTurnosFabrica").data("kendoGrid");
                            var dataItem = grid.dataSource.get(self.filaExpand);
                            if (dataItem) grid.expandRow("tr[data-uid=" + dataItem.uid + "]");
                        }
                        //Backbone.trigger('eventCierraDialogo');
                    },
                    dataBinding: function (e) {
                        self.resizeGrid();
                        if (e.items) {
                            self.elementos = e.items;
                        }
                    },
                    //dataBinding: self.resizeGrid,
                    detailInit: function (e) {
                        var detailRow = e.detailRow;
                        detailRow.find(".container").kendoTabStrip({
                            animation: {
                                open: { effects: "fadeIn" }
                            }
                        });

                        detailRow.find("#selectDesde").kendoDropDownList({
                            dataValueField: "value",
                            dataTextField: "desc",
                            dataSource: {
                                data: [{ value: 'inicio', desc: 'Horas desde el inicio del turno' }, { value: 'final', desc: 'Horas desde el final del turno' }]
                            },
                            animation: false
                        });

                        detailRow.find("#selectDesde").closest(".k-widget").hide();
                        /*2713 - Modificación de turnos de fábrica aunque no haya plantilla semanal asignada
                        //Comprobamos si tiene plantilla de turno asignada la semana.
                        //-----------------------------------------------------------
                        if (e.data.TipoTurno != null) {*/
                        var diasSemanasAnho = [];
                        var dia = "";
                        var fecha = "";

                        for (var i = 0; i < 7; i++) {
                            fecha = new Date(e.data.diaInicio.getTime() + i * 24 * 3600000);
                            dia = self.weekday[fecha.getDay()].toString();
                            var ahora = new Date();
                            diasSemanasAnho[i] = {
                                id: i,
                                Dia: dia,
                                Fecha: fecha,
                                Manana: e.data.diasSemana.getTurno(1, fecha),
                                Tarde: e.data.diasSemana.getTurno(2, fecha),
                                Noche: e.data.diasSemana.getTurno(3, fecha)
                            };

                            //cambio inigo: en caso de que haya un turno menor a 8 horas miramos si se cuenta desde inicio o desde el final
                            self.desdeInicio = "inicio";
                            var arHorasInicio = new Array();
                            for (j = 0; j < self.tiposTurno.length; j++) {
                                arHorasInicio.push(self.tiposTurno[j].inicioUTC.slice(-8));
                            }

                            for (j = 0; j < e.data.diasSemana.length; j++) {
                                var horaInicio = e.data.diasSemana[j].inicio.slice(-8);
                                if ($.inArray(horaInicio, arHorasInicio) == -1 && horaInicio != "23:00:00") {
                                    self.desdeInicio = "final";
                                }
                            }

                            //var ddlDesde = $("#selectDesde").data("kendoDropDownList");
                            //ddlDesde.value(self.desdeInicio);

                            $("#fecha" + dia + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).html(fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear());

                            $("#manana" + dia + "HI" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).kendoNumericTextBox({
                                min: 0,
                                step: 0.5,
                                decimals: 1,
                                format: '#.#',
                                change: function () {
                                    if (!self.validateInteger(this.value()))
                                        this.value(0);

                                    self.establecerMaxControl(this.element.attr("id"))
                                }
                            });

                            $("#manana" + dia + "HI" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").wrapper.width("75px");
                            $("#manana" + dia + "HF" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).kendoNumericTextBox({
                                min: 0,
                                step: 0.5,
                                decimals: 1,
                                format: '#.#',
                                change: function () {
                                    if (!self.validateInteger(this.value()))
                                        this.value(0);
                                    self.establecerMaxControl(this.element.attr("id"))
                                }
                            });

                            $("#manana" + dia + "HF" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").wrapper.width("75px");

                            $("#tarde" + dia + "HI" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).kendoNumericTextBox({
                                min: 0,
                                step: 0.5,
                                decimals: 1,
                                format: '#.#',
                                change: function () {
                                    if (!self.validateInteger(this.value()))
                                        this.value(0);
                                    self.establecerMaxControl(this.element.attr("id"))
                                }
                            });

                            $("#tarde" + dia + "HI" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").wrapper.width("75px");
                            $("#tarde" + dia + "HF" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).kendoNumericTextBox({
                                min: 0,
                                step: 0.5,
                                decimals: 1,
                                format: '#.#',
                                change: function () {
                                    if (!self.validateInteger(this.value()))
                                        this.value(0);
                                    self.establecerMaxControl(this.element.attr("id"))
                                }
                            });

                            $("#tarde" + dia + "HF" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").wrapper.width("75px");

                            $("#noche" + dia + "HI" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).kendoNumericTextBox({
                                min: 0,
                                step: 0.5,
                                decimals: 1,
                                format: '#.#',
                                change: function () {
                                    if (!self.validateInteger(this.value()))
                                        this.value(0);
                                    self.establecerMaxControl(this.element.attr("id"))
                                }
                            });

                            $("#noche" + dia + "HI" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").wrapper.width("75px");
                            $("#noche" + dia + "HF" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).kendoNumericTextBox({
                                min: 0,
                                step: 0.5,
                                decimals: 1,
                                format: '#.#',
                                change: function () {
                                    if (!self.validateInteger(this.value()))
                                        this.value(0);
                                    self.establecerMaxControl(this.element.attr("id"))
                                }
                            });

                            $("#noche" + dia + "HF" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").wrapper.width("75px");

                            $("#manana" + dia + "HI" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").value(diasSemanasAnho[i].Manana.horasInicio);
                            $("#tarde" + dia + "HI" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").value(diasSemanasAnho[i].Tarde.horasInicio);
                            $("#noche" + dia + "HI" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").value(diasSemanasAnho[i].Noche.horasInicio);
                            $("#manana" + dia + "HF" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").value(diasSemanasAnho[i].Manana.horasFin);
                            $("#tarde" + dia + "HF" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").value(diasSemanasAnho[i].Tarde.horasFin);
                            $("#noche" + dia + "HF" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").value(diasSemanasAnho[i].Noche.horasFin);

                            //establecemos su valor máximo en función de su valor
                            self.establecerMaxControl("manana" + dia + "HI" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, ''));
                            self.establecerMaxControl("manana" + dia + "HF" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, ''));
                            self.establecerMaxControl("tarde" + dia + "HI" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, ''));
                            self.establecerMaxControl("tarde" + dia + "HF" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, ''));
                            self.establecerMaxControl("noche" + dia + "HI" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, ''));
                            self.establecerMaxControl("noche" + dia + "HF" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, ''));

                            var valorOpcSel = $("#selectLinea option:selected").val();
                            var linea = $("#selectLinea").data("kendoDropDownList").dataSource.get(valorOpcSel);
                            var tipoTurnoActual = self.getTipoTurnoFecha(ahora);

                            if (fecha.getFullYear() == ahora.getFullYear() && fecha.getMonth() == ahora.getMonth() && fecha.getDate() == ahora.getDate()) {
                                if (tipoTurnoActual == 1) {
                                    $("#manana" + dia + "HI" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").enable(false);
                                    $("#manana" + dia + "HF" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").enable(false);
                                }
                                if (tipoTurnoActual == 2) {
                                    //$("#manana" + dia + "HI" + e.data.numeroSemana +    e.data.idLinea.replace(/\./g,  '')).data("kendoNumericTextBox").enable(false);
                                    $("#tarde" + dia + "HI" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").enable(false);
                                    //$("#manana" + dia + "HF" + e.data.numeroSemana +    e.data.idLinea.replace(/\./g,  '')).data("kendoNumericTextBox").enable(false);
                                    $("#tarde" + dia + "HF" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").enable(false);
                                }
                            } else {
                                detailRow.find("#selectDesde").closest(".k-widget").show();
                            }

                            var turno = self.tiposTurno[0];
                            var _horaTurno = new Date(turno.inicio).getHours();
                            //PARA LOS TURNOS DE NOCHE VALIDAMOS QUE SEA DEL TURNO ACTUAL O DEL DIA ANTERIOR
                            //Si es domingo y el tipo de turno es de noche y la fecha actual es menor que la fecha de inicio 
                            if (tipoTurnoActual == 3 && ahora.getHours() <= _horaTurno && diasSemanasAnho[i].Fecha.getDate() + 1 == ahora.getDate()) {
                                $("#noche" + dia + "HI" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").enable(false);
                                $("#noche" + dia + "HF" + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").enable(false);
                            }

                            //Miramos si es GMT+2 (verano) o GMT+1 (invierno)
                            var gmt = diasSemanasAnho[i].Fecha.getTimezoneOffset();

                            if (diasSemanasAnho[i].Manana._festivoLaborable == "Y" || diasSemanasAnho[i].Manana._festivoLaborable == "N") { //Tanto si es festivo laborable como no laborable indicamos festivo
                                $("#fecha" + dia + e.data.numeroSemana + e.data.idLinea.replace(/\./g, ''))[0].innerHTML += window.app.idioma.t('FESTIVO');
                            }

                            if (diasSemanasAnho[i].Manana.horas > 0) {
                                $("#horarioManana" + dia + e.data.numeroSemana + e.data.idLinea.replace(/\./g, ''))[0].innerHTML = diasSemanasAnho[i].Manana.rangoHorasTurno;
                            } else {
                                $("#horarioManana" + dia + e.data.numeroSemana + e.data.idLinea.replace(/\./g, ''))[0].innerHTML = window.app.idioma.t('SIN_TURNO');
                            }
                            if (diasSemanasAnho[i].Tarde.horas > 0 && diasSemanasAnho[i].Tarde.inicio.substr(11, 5)) {
                                $("#horarioTarde" + dia + e.data.numeroSemana + e.data.idLinea.replace(/\./g, ''))[0].innerHTML = diasSemanasAnho[i].Tarde.rangoHorasTurno;
                            } else {
                                $("#horarioTarde" + dia + e.data.numeroSemana + e.data.idLinea.replace(/\./g, ''))[0].innerHTML = window.app.idioma.t('SIN_TURNO');
                            }
                            if (diasSemanasAnho[i].Noche.horas > 0) {
                                $("#horarioNoche" + dia + e.data.numeroSemana + e.data.idLinea.replace(/\./g, ''))[0].innerHTML = diasSemanasAnho[i].Noche.rangoHorasTurno;
                            } else {
                                $("#horarioNoche" + dia + e.data.numeroSemana + e.data.idLinea.replace(/\./g, ''))[0].innerHTML = window.app.idioma.t('SIN_TURNO');
                            }
                            if (diasSemanasAnho[i].Manana._tipoDia == "Holiday") {
                                $("#manana" + dia + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").enable(false);
                                $("#horarioManana" + dia + e.data.numeroSemana + e.data.idLinea.replace(/\./g, ''))[0].innerHTML = window.app.idioma.t('NO_LABORABLE');
                            }
                            if (diasSemanasAnho[i].Tarde._tipoDia == "Holiday") {
                                $("#tarde" + dia + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").enable(false);
                                $("#horarioTarde" + dia + e.data.numeroSemana + e.data.idLinea.replace(/\./g, ''))[0].innerHTML = window.app.idioma.t('NO_LABORABLE');
                            }
                            if (diasSemanasAnho[i].Noche._tipoDia == "Holiday") {
                                $("#noche" + dia + e.data.numeroSemana + e.data.idLinea.replace(/\./g, '')).data("kendoNumericTextBox").enable(false);
                                $("#horarioNoche" + dia + e.data.numeroSemana + e.data.idLinea.replace(/\./g, ''))[0].innerHTML = window.app.idioma.t('NO_LABORABLE');
                            }

                            //if (i == 6) {
                            //    var hoy = new Date();
                            //    if (hoy > fecha) {
                            //        $("#divGuardarTurnos" + e.data.numeroSemana +    e.data.idLinea.replace(/\./g,  ''))[0].style.display = "none";
                            //    }
                            //}
                        }

                        //}
                        //else {
                        //    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_TURNO_NO_ASIGNADO'), 2000);
                        //    //this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow))
                        //    this.refresh();
                        //}

                        Backbone.trigger('eventCierraDialogo');
                    }
                });

                this.$("#selectAnyo").data('kendoDropDownList').trigger('change');
                this.$("#selectSemana").data('kendoDropDownList').value(util.date.getISOWeek(new Date()));
            },
            cambiaAnio: function (e, self) {
                self.obtenerSemanas($(e.element).val(), e.element[0].id);
            },
            obtenerSemanas: function (anio, origen) {
                var ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/semanas/" + anio,
                            dataType: "json"
                        }
                    },
                    schema: {
                        model: {
                            id: "numSemana",
                            fields: {
                                year: { type: "number" },
                                numSemana: { type: "number" },
                                inicio: { type: "date" },
                                fin: { type: "date" }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                });

                var comboSemana;

                if (origen == 'selectAnyo') {
                    comboSemana = this.$("#selectSemana").data('kendoDropDownList');
                }
                comboSemana.setDataSource(ds);
                //comboSemana.select(0);
            },
            validateInteger: function (value) {
                var _valueDivision = (value) / 0.5;
                return Number.isInteger(_valueDivision);
            },
            getTipoTurnoFecha: function (fecha) {
                var self = this;

                //SE REEMPLAZA EL AÑO DE LA FECHA DEL TURNO PORQUE AL TRAER LA FECHA DE 1899 LA CONVERSION LA REALIZA
                //CON LA DE ESA FECHA Y NO LA ACTUAL, ES DECIR, PARA EL TURNO DE LAS 7h LA CONVERSIÓN PARA ESA FECHA ES 
                //05:45 Y PARA LA FECHA ACTUAL ES 07:00, ESTA FECHA DE TURNO SE DEBERÍA CAMBIAR EN BBDD PERO NO SABEMOS QUE PERJUDICA
                //PENDIENTE DE REVISAR LAS IMPLICACIONES.
                self.tiposTurno[0].inicio = self.tiposTurno[0].inicio.replace("1899", fecha.getFullYear());
                self.tiposTurno[0].fin = self.tiposTurno[0].fin.replace("1899", fecha.getFullYear());
                var fechaAct = new Date(self.tiposTurno[0].inicio);
                fechaAct.setHours(fecha.getHours());
                fechaAct.setMinutes(fecha.getMinutes());
                fechaAct.setSeconds(fecha.getSeconds());

                //SE VALIDA SI ES EL TURNO DE NOCHE DESPUÉS DE LAS 24h 

                var fechaInicioTurnos = new Date(self.tiposTurno[0].inicio);
                if (fechaAct < fechaInicioTurnos)
                    fechaAct.setDate(fechaAct.getDate() + 1);

                for (var i = 0; i <= self.tiposTurno.length; i++) {
                    self.tiposTurno[i].inicio = self.tiposTurno[i].inicio.replace("1899", fecha.getFullYear());
                    self.tiposTurno[i].fin = self.tiposTurno[i].fin.replace("1899", fecha.getFullYear());
                    var fechaInicioTurno = new Date(self.tiposTurno[i].inicio);
                    var fechaFinTurno = new Date(self.tiposTurno[i].fin);

                    if (fechaAct >= fechaInicioTurno && fechaAct <= fechaFinTurno)
                        return self.tiposTurno[i].id;
                }
            },
            getIndex: function (lineas, numLinea) {
                indexLinea = $.map(lineas, function (linea, i) {
                    if (linea.numLinea == numLinea) {
                        return i;
                    }
                });

                if (indexLinea.length > 0) {
                    return indexLinea[0];
                } else {
                    return -1
                }
            },
            establecerMaxControl: function (element) {
                var self = this;
                var elementValue = $("#" + element).data("kendoNumericTextBox").value();
                var elementAux = null;
                if (element.indexOf("HI") >= 0) {
                    elementAux = $("#" + element.replace('HI', 'HF')).data("kendoNumericTextBox");
                } else {
                    elementAux = $("#" + element.replace('HF', 'HI')).data("kendoNumericTextBox");
                }

                elementAux.options.max = self.maxValueHoras - elementValue;
            },
            guardarExcepcion: function (idTipoTurno, strTipoTurno, fecha, semana, inicioFin) {
                var self = this;
                var result = true;
                var dia = self.weekday[fecha.getDay()].toString();
                var idLinea = semana.idLinea.replace(/\./g, '');
                var turno = semana.diasSemana.getTurno(idTipoTurno, fecha);
                var horasInicio = parseFloat($("#" + strTipoTurno + dia + "HI" + semana.numeroSemana + idLinea).data("kendoNumericTextBox").value());
                var horasFin = parseFloat($("#" + strTipoTurno + dia + "HF" + semana.numeroSemana + idLinea).data("kendoNumericTextBox").value());
                if (isNaN(horas)) {
                    horas = 0;
                }

                var tipoTurnoPorRangoHoras = null;
                for (i = 0; i < self.tiposTurno.length; i++) {
                    if (self.tiposTurno[i].id == turno.tipoTurno) {
                        tipoTurnoPorRangoHoras = self.tiposTurno[i];
                    }
                }

                //Si el tipo turno es 'No Work' obtenemos el turno de 
                if (tipoTurnoPorRangoHoras.id == 0) {
                    tipoTurnoPorRangoHoras = $.grep(self.tiposTurno, function (turno) {
                        return turno.id == idTipoTurno;
                    })[0];
                }

                if (tipoTurnoPorRangoHoras) {
                    //var horaInicioDelTurno = self.tiposTurno[turno.tipoTurno].inicio.substr(11, 8);
                    var horaInicioDelTurno = null;

                    var horaInicioDelTurno = tipoTurnoPorRangoHoras.inicioUTC.substr(11);

                    //var diaInicioDelTurno = turno.inicio.substr(0, 10);
                    var tzoffset = fecha.getTimezoneOffset() * 60000; //offset en milisegundos
                    var diaInicioDelTurno = (new Date(fecha.getTime() - tzoffset)).toISOString().substr(0, 10);

                    const toTimestamp = (strDate) => {
                        if (strDate) {
                            const date = new Date(strDate);
                            return new Date(date.toISOString()).getTime() / 1000;
                        }
                    }

                    var fInicio = toTimestamp(diaInicioDelTurno + "T" + horaInicioDelTurno + "Z");
                    if (!fInicio) {
                        fInicio = kendo.parseDate(diaInicioDelTurno + "T" + horaInicioDelTurno, "s");
                    }
                    var inicio;
                    var fin;
                    var horas = 0;
                    var breakWorkingTime = false;

                    if (horasFin == 0 || (horasInicio + horasFin) == self.maxValueHoras) { //se deben contar las horas desde el inicio del turno
                        horas = horasInicio + horasFin;

                        inicio = fInicio - 3600; //(fInicio.getTimezoneOffset()+60) * 60;
                        fin = inicio + horas * 3600;
                    } else if (horasInicio == 0) { //Se deben contar las horas desde el final del turno
                        horas = horasFin;
                        fin = fInicio + 8 * 3600 - 3600; //(fInicio.getTimezoneOffset()+60) * 60 
                        inicio = fin - horas * 3600;
                    } else { //existe una pausa dentro del turno
                        //Lo tratamos como si fuera un turno completo de 8 horas y añadimos un break
                        breakWorkingTime = true;

                        horas = self.maxValueHoras;
                        inicio = fInicio - 3600; //(fInicio.getTimezoneOffset()+60) * 60;
                        fin = inicio + horas * 3600;
                    }

                    if (!self.esFestivo(fecha.getDay(), semana.diasSemana)) {
                        var lstOperacion = self.getOperacion(horas, turno, fecha.getDay(), self.desdeInicio, inicioFin, breakWorkingTime, horasInicio, horasFin);
                        var WTBreak = null;
                        if (breakWorkingTime) {
                            WTBreak = {
                                inicioBreak: inicio + horasInicio * 3600,
                                finBreak: fin - horasFin * 3600,
                            };
                        }

                        $.each(lstOperacion, function (index, op) {
                            var turnoException = {
                                idLinea: semana.idLinea,
                            };
                            turnoException.inicio = inicio;
                            turnoException.fin = fin;
                            turnoException.wtBreak = WTBreak;
                            turno.wtBreak
                            if (op && op != "") {
                                var fechaTurno = new Date(1970, 0, 1);
                                fechaTurno.setSeconds(inicio);
                                fechaTurno = new Date(fechaTurno.toDateString());

                                turnoException.fechaTurno = (fechaTurno.getTime() / 1000 - fechaTurno.getTimezoneOffset() * 60)
                                turnoException.operacion = op;

                                if (turno.tipoTurno == 0 && op == 'ADD') { //Si es un turno 'NoWork' y se realiza un add (ya que previamente se ha borrado) tenemos que volver a pedir el turno
                                    var turnoAux = semana.diasSemana.getTurno(idTipoTurno, fecha);
                                    turnoException.idTurno = 0; //Nuevo
                                    turnoException.tipoTurno = idTipoTurno;
                                    //result = self.setTurnoException(turnoException);
                                    self.lstException.push(turnoException);
                                } else {
                                    turnoException.idTurno = turno.idTurno,
                                        turnoException.tipoTurno = turno.tipoTurno;
                                    self.lstException.push(turnoException);
                                    //result = self.setTurnoException(turnoException);
                                }

                                //if (!result) {
                                //    return false;
                                //}
                            }
                        });
                    }
                }

                return result;
            },
            ejecutarOperaciones: function () {
                var self = this;

                var lstOpDelete = $.grep(self.lstException, function (value, index) {
                    var fecNow = new Date();
                    var fechaAct = fecNow.getTime() / 1000 + 3600;
                    return value.operacion == 'DELETE' && value.tipoTurno > 0 && value.inicio < fechaAct;
                });

                if (lstOpDelete.length > 0) {
                    this.confirmacionConsolidado = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('TURNOS_DE_FÁBRICA'),
                        msg: window.app.idioma.t('AVISO_DELETE_TURNOS_CONSOLIDADOS'),
                        funcion: function () { self.lanzarOperaciones(); },
                        contexto: this,
                        funcionClose: function () { self.cerrarDialogos(); }
                    });
                } else {
                    self.lanzarOperaciones();
                }
            },
            cerrarDialogos: function () {
                var self = this;
                self.confirmacion.cancelar();
            },
            lanzarOperaciones: function () {
                var self = this;
                var data = {
                    exceptions: self.lstException,
                    filaMaster: {
                        lineaPath: $("#selectLinea").val(),
                        semana: ""
                    }
                }

                if (self.filaExpand) {
                    var grid = $("#gridTurnosFabrica").data("kendoGrid");
                    var dataItem = grid.dataSource.get(self.filaExpand);
                    data.filaMaster.semana = dataItem.Semana;
                    data.filaMaster.lineaPath = dataItem.idLinea;
                }

                $.ajax({
                    type: "POST",
                    url: "../api/setOperacionesSobreTurnos/",
                    data: JSON.stringify(data.exceptions),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    cache: false,
                    async: true
                }).done(function (data) {
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), 'Se han asignado correctamente los turnos a las semana.', 3000);
                    self.lstException = [];
                    self.ActualizarGrid();
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), xhr.statusText, 2000);
                    }
                    self.lstException = [];
                    self.ActualizarGrid();
                });
            },
            esFestivo: function (day, dias) {
                day++;
                var returnValue = false;
                $(dias).each(function (index, dia) {
                    if (dia.diaSemana == day && dia.tipoDia == "Holiday") {
                        returnValue = true;
                    }
                });

                return returnValue;
            },
            getOperacion: function (horasAct, turno, day, desdeInicioFinAnt, desdeInicioFinAct, breakTurno, horasInicio, horasFin) {
                var listOperacion = [];

                if ((horasAct == null || horasAct == 0) && turno.horas > 0) {
                    if (turno.idTurno > 0 && turno.tipoTurno == 0) { //Si es un turno 'NoWork'
                        listOperacion.push("DELETE");
                        listOperacion.push("ADD");
                    } else {
                        listOperacion.push("DELETE");
                    }
                } else if (horasAct > 0 && turno.horas == 0) {
                    if (turno.idTurno > 0 && turno.tipoTurno == 0 && (day == 6 || day == 0)) { //Si es un turno 'NoWork'
                        listOperacion.push("DELETE");
                        listOperacion.push("ADD");
                    } else {
                        listOperacion.push("ADD");
                    }
                } else if (horasAct != turno.horas) {
                    listOperacion.push("UPDATE");
                } else if (horasAct == turno.horas && breakTurno && (horasInicio != turno.horasInicio || horasFin != turno.horasFin)) { //Si se añade una parada
                    listOperacion.push("UPDATE");
                } else if (horasInicio != turno.horasInicio || horasFin != turno.horasFin) {
                    listOperacion.push("UPDATE");
                }

                return listOperacion;
            },
            events: {
                'click #btnFiltrar': 'Filtrar',
                'click #btnAsignarTurnos': 'confirmarAsignarTurnos',
                'click #btnGuardarTurnos': 'seguroGuardarTurnos'
            },
            seguroGuardarTurnos: function (e) {
                var self = this;
                e.preventDefault();

                var permiso = TienePermiso(6);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $("#gridTurnosFabrica").data("kendoGrid");
                var dataItem = grid.dataSource.get(self.filaExpand);
                var numeroSemana = self.numSemanaSelected;

                if (window.app.sesion.isAuthorizedTo("ENV_PROD_RES_7_GestionDeLosTurnosDeFabrica")) {
                    if (numeroSemana) {
                        self.confirmacion = new VistaDlgConfirm({
                            titulo: window.app.idioma.t('TURNOS_DE_FÁBRICA'),
                            msg: window.app.idioma.t('DESEA_REALMENTE_MODIFICAR'),
                            funcion: function () { self.guardarTurnos(numeroSemana, dataItem); },
                            contexto: this
                        });
                    } else {
                        numeroSemana = self.$(e.currentTarget).attr('ns');
                        if (numeroSemana) {
                            self.confirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('TURNOS_DE_FÁBRICA'),
                                msg: window.app.idioma.t('DESEA_REALMENTE_MODIFICAR'),
                                funcion: function () { self.guardarTurnos(numeroSemana, dataItem); },
                                contexto: this
                            });
                        }
                    }
                }
            },
            guardarTurnos: function (numeroSemana, dataItem) {
                try {
                    var self = this;
                    var semana;
                    for (var i = 0; i < self.semanasAnho.length; i++) {
                        if (self.semanasAnho[i].numeroSemana == numeroSemana && self.semanasAnho[i].idLinea == dataItem.idLinea) {
                            semana = self.semanasAnho[i];
                        }
                    }

                    var result = true;
                    for (var i = 0; i < 7; i++) {
                        var fecha = new Date(semana.diaInicio.getTime() + i * 24 * 3600000);

                        var resultM = self.guardarExcepcion(1, "manana", fecha, semana, true)
                        var resultT = self.guardarExcepcion(2, "tarde", fecha, semana, true)
                        var resultN = self.guardarExcepcion(3, "noche", fecha, semana, true)

                        //if (!resultM || !resultN | !resultT) {
                        //    result = false;
                        //}
                    }

                    self.ejecutarOperaciones();
                } catch (err) {
                    self.lstException = [];
                    Backbone.trigger('eventCierraDialogo');
                }
            },
            dsTurnosFabrica: function (anyo, valorLinea, valorSemana) {
                var self = this;
                valorLinea = valorLinea ? valorLinea : '0';
                valorSemana = valorSemana ? valorSemana : 0;
                function TurnoDia(data) {
                    _.extend(this, data);

                    if (data) {
                        this.idTurno = data._idTurno;
                        this.dia = data._dia;
                        this.diaSemana = data._diaSemana;
                        this.inicio = data._inicio;
                        this.fin = data._fin;
                        this.horas = data._horas;
                        this.horasInicio = data.horasInicio;
                        this.horasFin = data.horasFin;
                        this.rangoHorasTurno = data.rangoHorasTurno
                        this.tipoTurno = data._tipoTurno;
                        this.tipoTurnoSemana = data._tipoTurnoSemana;
                        this.tipoDia = data._tipoDia;
                    }
                }

                function TurnosSemana(data) {
                    _.extend(this, data);
                    if (data) {
                        this.length = data.length;
                        for (var i = 0; i < this.length; i++) {
                            this[i] = new TurnoDia(data[i]);
                        }
                    }
                }

                function Turno(data, turno, fecha) {
                    for (var i = 0; i < data.length; i++) {
                        var dia = new Date(Date.parse(data[i]._dia));
                        if (dia.getDate() == fecha.getDate() &&
                            dia.getMonth() == fecha.getMonth() &&
                            dia.getFullYear() == fecha.getFullYear() &&
                            data[i]._tipoTurno == turno) {
                            return data[i];
                        }
                    }

                    return null;
                }

                function getFestivo(data, fecha, calendarioFestivo) {
                    for (var i = 0; i < data.length; i++) {
                        var dia = new Date(Date.parse(data[i]._dia));
                        if (dia.getDate() == fecha.getDate() &&
                            dia.getMonth() == fecha.getMonth() &&
                            dia.getFullYear() == fecha.getFullYear()) {
                            return data[i]._festivoLaborable;
                        }
                    }

                    return checkCalendarioFestivo(fecha, calendarioFestivo);
                }

                function checkCalendarioFestivo(fecha, calendarioFestivo) {
                    var holiday = [];
                    holiday = $.grep(calendarioFestivo, function (data) {
                        var dia = new Date(Date.parse(data.fecha));
                        return dia.getDate() == fecha.getDate() &&
                            dia.getMonth() == fecha.getMonth() &&
                            dia.getFullYear() == fecha.getFullYear();
                    });

                    if (holiday.length > 0) {
                        return 'Y'
                    } else {
                        return null;
                    }
                }

                TurnosSemana.prototype.getTurno = function (turno, fecha) {
                    var turnoC = Turno(this, turno, fecha);
                    if (turnoC) {
                        return turnoC;
                    } else if (turno == 3) {
                        turnoC = Turno(this, 0, fecha);
                        if (turnoC) {
                            return turnoC;
                        }
                    }
                    //for (var i = 0; i < this.length; i++) {
                    //    var dia = new Date(Date.parse(this[i]._dia));
                    //    if (dia.getDate() == fecha.getDate() &&
                    //        dia.getMonth() == fecha.getMonth() &&
                    //        dia.getFullYear() == fecha.getFullYear() &&
                    //        this[i]._tipoTurno == turno) {
                    //        return this[i];
                    //    }
                    //}

                    //Comprobamos que el turno no esté en vacaciones
                    for (var i = 0; i < this.length; i++) {
                        var dia = new Date(Date.parse(this[i]._dia));
                        if (dia.getDate() == fecha.getDate() &&
                            dia.getMonth() == fecha.getMonth() &&
                            dia.getFullYear() == fecha.getFullYear() &&
                            this[i]._tipoTurnoSemana == "" &&
                            this[i]._tipoTurno == 0) {
                            return this[i];
                        }
                    }

                    var strInicio = "";
                    for (var i = 0; i < self.tiposTurno.length; i++) {
                        if (self.tiposTurno[i].id == turno) {
                            strInicio = kendo.toString(fecha, "dd/MM/yyyy") + 'T' + self.tiposTurno[i].inicioUTC.substr(11, 12);
                            break;
                        }
                    }

                    var turnoDia = new TurnoDia({
                        _idTurno: "0",
                        _dia: fecha,
                        _diaSemana: fecha.getDay() + 1,
                        _inicio: strInicio,
                        _fin: strInicio,
                        _horas: 0,
                        _tipoTurno: turno,
                        _tipoTurnoSemana: "",
                        _tipoDia: "",
                        _festivoLaborable: getFestivo(this, fecha, self.resultadoDiasFestivos),
                        horasInicio: 0,
                        horasFin: 0,
                        rangoHorasTurno: 0
                    });

                    return turnoDia;
                };

                //Llamada a la BBDD para traernos los turnos de Fabrica
                //-----------------------------------------------------
                $.ajax({
                    type: "POST",
                    url: "../api/turnosFabrica/" + valorLinea + "/" + anyo + "/" + valorSemana,
                    dataType: 'json',
                    cache: false,
                    async: true
                }).done(function (data) {
                    self.resultadoDatos = data;
                    self.semanasAnho = [];

                    for (i = 0; i < self.resultadoDatos.length; i++) {
                        var inicio = new Date(Date.parse(self.resultadoDatos[i].inicio));
                        inicio.setHours(0, 0, 0, 0);
                        var fin = new Date(Date.parse(self.resultadoDatos[i].fin));
                        fin.setHours(0, 0, 0, 0);

                        var plantillaTurno = self.resultadoDatos[i].plantillaTurno;

                        if (plantillaTurno && plantillaTurno.indexOf("-") > 0) {
                            plantillaTurno = plantillaTurno.substring(0, plantillaTurno.indexOf("-"));
                        }

                        var numTurnos = "";
                        if (self.resultadoDatos[i].DiasSemana != null) {
                            numTurnos = 0;
                            for (j = 0; j < self.resultadoDatos[i].DiasSemana.length; j++) {
                                if (self.resultadoDatos[i].DiasSemana[j].horasReales == 8) {
                                    numTurnos++;
                                }
                            }
                        }

                        self.semanasAnho[i] = {
                            id: i,
                            Ano: self.resultadoDatos[i].Year,
                            diaInicio: inicio,
                            diaFin: fin,
                            Semana: "Semana " + self.resultadoDatos[i].numSemana + " (Del " + inicio.toLocaleDateString("es-ES") + " al " + fin.toLocaleDateString("es-ES") + ")",
                            Linea: window.app.idioma.t('LINEA') + " " + self.resultadoDatos[i].linea.numLineaDescripcion + " - " + self.resultadoDatos[i].linea.descripcion,
                            idLinea: self.resultadoDatos[i].linea.id,
                            TipoTurno: plantillaTurno,
                            TurnosCompletos: numTurnos,
                            diasSemana: new TurnosSemana(self.resultadoDatos[i].DiasSemana),
                            numeroSemana: self.resultadoDatos[i].numSemana
                        };
                    }

                    //Creamos datasource de semanas Final
                    //-----------------------------------
                    var dataSourceSemanas = new kendo.data.DataSource({
                        data: self.semanasAnho,
                        //pageSize: 20,
                        batch: true,
                        schema: {
                            model: {
                                id: "id",
                                fields: {
                                    id: { type: "string", editable: false, nullable: false },
                                    Ano: { type: "string" },
                                    diaInicio: { type: "date", editable: false, nullable: false },
                                    diaFin: { type: "date", editable: false, nullable: false },
                                    Semana: { type: "string" },
                                    Linea: { type: "string" },
                                    idLinea: { type: "string" },
                                    TipoTurno: { type: "string" }
                                }
                            }
                        }
                    });

                    self.dsSemanas = dataSourceSemanas;
                    kendo.ui.progress(self.$("#gridTurnosFabrica"), false);
                    self.$("#gridTurnosFabrica").data("kendoGrid").setDataSource(self.dsSemanas)
                    self.$("#gridTurnosFabrica").data('kendoGrid').dataSource.read();
                    self.$("#gridTurnosFabrica").data('kendoGrid').refresh();
                }).fail(function (xhr) {
                    kendo.ui.progress(self.$("#gridTurnosFabrica"), false);
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_TURNOS'), 2000);
                    }
                });
            },
            ActualizarGrid: function () {
                var self = this;
                if (($("#selectLinea").val() != "" && $("#selectAnyo").val() != "") || ($("#selectSemana").val() != "" && $("#selectAnyo").val() != "")) {
                    var valorOpcSel = this.$("#selectLinea option:selected").val();
                    var valorSemanaOpcSel = this.$("#selectSemana option:selected").val();
                    var linea = '';
                    var textOpcSel = '';
                    if (valorOpcSel) {
                        linea = $("#selectLinea").data("kendoDropDownList").dataSource.get(valorOpcSel);
                    }
                    kendo.ui.progress(this.$("#gridTurnosFabrica"), true);
                    self.dsTurnosFabrica(parseInt($("#selectAnyo").val()), valorOpcSel, valorSemanaOpcSel);
                } else {
                    Not.crearNotificacion('info', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_SELECCIONE_LINEA_ANIO_SEMANA'), 2000);
                }
            },
            Filtrar: function () {
                var self = this;
                self.filaExpand = null;
                self.ActualizarGrid();
            },
            confirmarAsignarTurnos: function () {
                var self = this;
                var permiso = TienePermiso(6);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                if ($("#selectTurno").val() != 0) {
                    if ($("#gridTurnosFabrica  tbody tr.k-state-selected").length > 0) {
                        this.confirmacion = new VistaDlgConfirm({
                            titulo: window.app.idioma.t('TURNOS_DE_FÁBRICA'),
                            msg: window.app.idioma.t('DESEA_REALMENTE_MODIFICAR_LOS'),
                            funcion: function () { self.AsignarTurnos(); },
                            contexto: this
                        });
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t("SELE_TURNO_ASIGNAR"), 2000);
                    }
                } else {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t("SELE_TURNO_ASIGNAR"), 2000);
                }
            },
            AsignarTurnos: function () {
                var self = this;

                if (self.resultadoDiasFestivos.length == 0) {
                    //Llamada a la BBDD para traernos los dias festivos
                    //-------------------------------------------------
                    $.ajax({
                        type: "GET",
                        url: "../api/diasFestivos/", // + $("#selectAnyo").val(),
                        dataType: 'json',
                        cache: false,
                        async: false
                    }).done(function (data) {
                        self.resultadoDiasFestivos = data;
                    }).fail(function (xhr) {
                        if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_FESTIVOS'), 2000);
                        }
                    });
                }
                //Recorremos el grid y vemos las filas que estan checkeadas
                var index = 0;
                var error = false;

                self.registrosSel.forEach(function (id) {
                    var dataSource = $('#gridTurnosFabrica').data().kendoGrid.dataSource;

                    var Item = dataSource.get(id);

                    var fecha;
                    var fechaGrid = "";
                    var fechaFestivo = "";
                    for (var i = 0; i < 7; i++) {
                        fecha = new Date(new Date(Item.diaInicio).getFullYear(), new Date(Item.diaInicio).getMonth(), new Date(Item.diaInicio).getDate() + i);
                        fechaGrid = fecha.getFullYear() + "/" + ('0' + (fecha.getMonth() + 1)).slice(-2) + "/" + ("0" + (fecha.getDate())).slice(-2);
                        for (var j = 0; j < self.resultadoDiasFestivos.length; j++) {
                            fechaFestivo = self.resultadoDiasFestivos[j].fecha.split("-")[0] + "/" + self.resultadoDiasFestivos[j].fecha.split("-")[1] + "/" + self.resultadoDiasFestivos[j].fecha.split("-")[2].substring(0, 2);
                            if (fechaGrid == fechaFestivo) {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SEMANA_CON_DIA_FESTIVO'), 2000);
                                break;
                            }
                        }
                    }

                    //Guardamos los valores nuevos en BBDD y refrescamos el grid
                    //----------------------------------------------------------
                    var linea = Item.idLinea;
                    var start = Item.diaInicio.getTime() / 1000 - Item.diaInicio.getTimezoneOffset() * 60;
                    //start = Date.UTC(Item.diaInicio.getFullYear(), Item.diaInicio.getMonth(), Item.diaInicio.getDay())/1000;
                    //start = (Item.diaInicio.getTime() / 1000) + (Item.diaInicio.getTimezoneOffset() * 60);
                    var error = false;

                    $.ajax({
                        type: "GET",
                        url: "../api/SetPlantillaFabrica/" + linea + "/" + Item.numeroSemana + "/" + Item.Ano + "/" + $("#selectTurno").val(),
                        dataType: 'json',
                        cache: false,
                        async: false
                    }).done(function (data) {
                        //Item.set('TipoTurno', $("#selectTurno option:selected").val());
                    }).fail(function (xhr) {
                        if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                        error = true;
                    });
                });

                if (error) Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 3000);
                else Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HAN_ASIGNADO_TURNOS_SEMANA'), 3000);

                Backbone.trigger('eventCierraDialogo');
                self.ActualizarGrid();
                self.registrosSel = [];
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
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltros").innerHeight();

                var gridElement = $("#gridTurnosFabrica"),
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

        return gridTurnosFabrica;
    });