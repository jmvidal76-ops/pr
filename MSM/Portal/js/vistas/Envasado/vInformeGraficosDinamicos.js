define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/GraficosDinamicos.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', 'compartido/utils', 'jszip'],
    function (_, Backbone, $, plantillaGraficosDinamicos, VistaDlgConfirm, Not, utils, JSZip) {
        var consultasDinamicas = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            anhos: [],
            template: _.template(plantillaGraficosDinamicos),
            queries: [],
            results: [],
            multiselect: null,
            arranques:null,
            multimaquina: null,
            initialize: function () {
                window.JSZip = JSZip;
                var self = this;
                var splitter = $("#vertical").data("kendoSplitter");
                this.anhos = [];
                var anyoActual = (new Date()).getFullYear();
                var anyoInicial = window.app.planta.anyoImplantacion;
                if ((anyoInicial + 1) < anyoActual) {
                    anyoInicial = anyoActual - 2;
                }

                for (var i = anyoInicial; i < (anyoActual + 3) ; i++) {
                    this.anhos[i - anyoInicial] = { id: i, nombre: i.toString() };
                }

                $.ajax({
                    type: "GET",
                    url: "../api/queriesGraficos",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.queries = data;
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        $("#center-pane").empty();
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                    }
                    
                });


                self.render();
            },
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))
                var self = this;

                //$("#divWhere").hide();
                $("#linea").hide();
                $("#arranques").hide();
                $("#semana").hide();
                $("#fechas").hide();
                $("#maquina").hide();
                $("#motivo").hide();
                $("#botones").hide();
                $("#divVacio").hide();

                this.$("#txtNumSemanas").kendoNumericTextBox({
                    format: "# semanas",
                    step: 1,
                    min: 1,
                    max: 10
                });

                $("#cmbArranques").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "Id",
                    dataSource: self.arranques,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                //Cargamos combo
                this.$("#ddlQueries").kendoDropDownList({
                    dataValueField: "id",
                    dataTextField: "nombre",
                    dataSource: new kendo.data.DataSource({
                        data: self.queries,
                        sort: { field: "nombre", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                this.$("#cmbAnyo").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: this.anhos,
                    //change: function () { self.cambiaAnyo(this, self); },
                    optionLabel: window.app.idioma.t('SELECCIONE_ANYO')
                });

                this.$("#cmbSemana").kendoDropDownList({

                    dataValueField: "numSemana",
                    template: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    valueTemplate: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                this.$("#cmbLinea").kendoDropDownList({
                    //dataTextField: "nombre",
                    dataValueField: "id",
                    template: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                    valueTemplate: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "nombre", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                this.multiselect = this.$("#cmbMotivo").kendoMultiSelect({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    autoClose: false,
                    tagMode: "single",
                    tagTemplate: '#:values.length# ' + window.app.idioma.t('MOTIVO_SELECCIONADO'),
                    dataSource: new kendo.data.DataSource({
                        data: window.app.reasonTree.Categorias[2].motivos,
                        sort: { field: "id", dir: "asc" }
                    }),
                }).data("kendoMultiSelect");

                //this.seleccionaTodoMotivo();


                this.multimaquina = this.$("#cmbMaquina").kendoMultiSelect({
                    dataTextField: "descripcion",
                    dataValueField: "id",
                    autoClose: false,
                    tagMode: "single",
                    tagTemplate: '#:values.length# ' + window.app.idioma.t('MAQUINA_SELECCIONADA'),
                    dataSource: new kendo.data.DataSource({
                        sort: { field: "id", dir: "asc" }
                    }),
                }).data("kendoMultiSelect");

                this.$("#dpInicio").kendoDatePicker({
                    //value: new Date(),
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                })

                this.$("#dpFin").kendoDatePicker({
                    //value: new Date(),
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                })

                this.$("#cmbTurnosInicio").kendoDropDownList({
                    enable: false,
                    dataValueField: "tipo.id",
                    template: "#: window.app.idioma.t('TURNO'+tipo.id)#",
                    valueTemplate: "#: window.app.idioma.t('TURNO'+tipo.id)#",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });


                this.$("#cmbTurnosFin").kendoDropDownList({
                    enable: false,
                    dataValueField: "tipo.id",
                    template: "#: window.app.idioma.t('TURNO'+tipo.id)#",
                    valueTemplate: "#: window.app.idioma.t('TURNO'+tipo.id)#",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });


                this.$("[data-funcion]").checkSecurity();
            },
            events: {
                'click #btnEjecutar': 'executaQuery',
                'click #btnExportarPDF': 'exportPDF',
                'change #cmbLinea': 'cambiaLinea',
                'change #dpInicio': 'cambiaLineaFechaIni',
                'change #dpFin': 'cambiaLineaFechaFin',
                'change #cmbAnyo': 'cambiaAnyo',
                //'click #btnFiltros': 'mostrarFiltros',
                'change #ddlQueries': 'actualizaFiltros',
                'click #todoMotivo': 'seleccionaTodoMotivo',
                'click #nadaMotivo': 'seleccionaNadaMotivo',
                'click #todoMaquina': 'seleccionaTodoMaquina',
                'click #nadaMaquina': 'seleccionaNadaMaquina'
            },
            seleccionaTodoMotivo: function () {
                var self = this;

                var all = $.map(self.multiselect.dataSource.data(), function (dataItem) {
                    return dataItem.id;
                });

                self.multiselect.value([]);
                self.multiselect.value(all);
            },
            seleccionaNadaMotivo: function () {
                var self = this;

                self.multiselect.value([]);
            },
            seleccionaTodoMaquina: function () {
                var self = this;

                var all = $.map(self.multimaquina.dataSource.data(), function (dataItem) {
                    return dataItem.id;
                });

                self.multimaquina.value([]);
                self.multimaquina.value(all);
            },
            seleccionaNadaMaquina: function () {
                var self = this;

                self.multimaquina.value([]);
            },
            actualizaFiltros: function () {
                if ($("#divWhere").is(":visible")) {
                    var id = self.$("#ddlQueries").val();
                    var seleccion = self.$("#ddlQueries").val();
                    switch (seleccion) {
                        case "1":
                            $("#linea").show();
                            $("#arranques").show();
                            $("#semana").hide();
                            $("#maquina").hide();
                            $("#motivo").hide();
                            $("#fechas").show();
                            $("#divWhere").height(90);
                            break;
                        case "2":
                        case "6":
                        case "10":
                            $("#linea").show();
                            $("#arranques").hide();
                            $("#maquina").hide();
                            $("#motivo").hide();
                            $("#semana").hide();
                            $("#fechas").show();
                            $("#divWhere").height(50);
                            break;
                        case "3":
                        case "9":
                        case "7":
                        case "8":
                            $("#linea").show();
                            $("#arranques").hide();
                            $("#semana").hide();
                            $("#fechas").show();
                            $("#maquina").show();
                            $("#motivo").hide();
                            $("#divWhere").height(100);
                            break;
                        case "4":
                        case "5":
                            $("#linea").show();
                            $("#arranques").hide();
                            $("#semana").hide();
                            $("#fechas").show();
                            $("#maquina").show();
                            $("#motivo").show();
                            $("#divWhere").height(100);
                            break;
                        case "11":
                            $("#linea").show();
                            $("#arranques").hide();
                            $("#semana").show();
                            $("#fechas").hide();
                            $("#maquina").hide();
                            $("#motivo").hide();
                            $("#divWhere").height(50);
                            break;
                    }
                }
            },
            cambiaAnyo: function () {
                var anho = this.$("#cmbAnyo").data("kendoDropDownList").value();

                if (anho != "") {
                    var ds = new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: "../api/semanas/" + anho,
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

                    var comboSemana = this.$("#cmbSemana").data('kendoDropDownList');
                    comboSemana.setDataSource(ds);
                    comboSemana.select(0);
                }

            },
            exportPDF: function () {
                $("#chart").getKendoChart().saveAsPDF();
            },
            cambiaLinea: function () {
                var self = this;
                var opcSel = this.$("#cmbLinea").data("kendoDropDownList").value();
                if (opcSel != "") {
                    self.multimaquina.dataSource.data(self.$("#cmbLinea").data("kendoDropDownList").dataSource.get(opcSel).obtenerMaquinas);
                    self.multimaquina.dataSource.sort({ field: "descripcion", dir: "asc" });
                    $("#todoMaquina").prop("disabled", false);
                    $("#nadaMaquina").prop("disabled", false);
                    //this.seleccionaTodoMaquina();
                }
                else {
                    self.multimaquina.dataSource.data([]);
                    self.multimaquina.refresh();
                    $("#todoMaquina").prop("disabled", true);
                    $("#nadaMaquina").prop("disabled", true);
                }

                this.cambiaArranque();
                this.cambiaLineaFechaIni();
                this.cambiaLineaFechaFin();
            },
            cambiaArranque: function () {
                var self = this;
                var lineas = 0;
                var opcSel = this.$("#cmbLinea").data("kendoDropDownList").value();

                for (i = 0; i < window.app.planta.lineas.length; i++)
                {
                    if (window.app.planta.lineas[i].id == opcSel)
                    {
                        lineas = window.app.planta.lineas[i].numLinea;
                    }
                }

                $.ajax({
                    type: "GET",
                    url: "../api/obtenerTiposArranque/" + lineas,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).success(function (data) {

                    $("#cmbArranques").data("kendoDropDownList").setDataSource(data);

                }).error(function (err, msg, ex) {
                    var a = "";
                });


            },
            cambiaLineaFechaIni: function () {
                var hoyDate = new Date();
                var idLinea = $("#cmbLinea").data("kendoDropDownList").value();
                var fecha = $("#dpInicio").data("kendoDatePicker").value();
                var dblFecha = null;
                if (fecha != null) {
                    dblFecha = ($("#dpInicio").data("kendoDatePicker").value().getTime() - hoyDate.getTimezoneOffset() * 60 * 1000);
                }
                if (idLinea != "" && dblFecha) {
                    var ds = new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: "../api/turnosLineaDia/" + idLinea + "/" + dblFecha,
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
                    var comboTurnos = this.$("#cmbTurnosInicio").data('kendoDropDownList');
                    comboTurnos.setDataSource(ds);
                    comboTurnos.select(0);
                    comboTurnos.enable(true);
                }

            },
            cambiaLineaFechaFin: function () {
                var hoyDate = new Date();
                var idLinea = $("#cmbLinea").data("kendoDropDownList").value();
                var fecha = $("#dpFin").data("kendoDatePicker").value();
                var dblFecha = null;
                if (fecha != null) {
                    dblFecha = ($("#dpFin").data("kendoDatePicker").value().getTime() - hoyDate.getTimezoneOffset() * 60 * 1000);
                }
                if (idLinea != "" && dblFecha) {
                    var ds = new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: "../api/turnosLineaDia/" + idLinea + "/" + dblFecha,
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
                    var comboTurnos = this.$("#cmbTurnosFin").data('kendoDropDownList');
                    comboTurnos.setDataSource(ds);
                    comboTurnos.select(0);
                    comboTurnos.enable(true);
                }

            },
            executaQuery: function () {


                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltros").innerHeight();
                var where = $("#divWhere").innerHeight();

                var altura = contenedorHeight - cabeceraHeight - filtrosHeight - where;


                var self = this;
                var valorOpcSel = self.$("#ddlQueries").val();//self.$("#ddlQueries").val();
                 

                if (valorOpcSel != "") {
                    var datosGrafico = {};
                    this.$("#imgProcesando").css("display", "block");
                    var nombre = self.$("#ddlQueries").data("kendoDropDownList").dataSource.get(valorOpcSel).nombre;
                    var tipo = self.$("#ddlQueries").data("kendoDropDownList").dataSource.get(valorOpcSel).tipo;
                    var colores = self.$("#ddlQueries").data("kendoDropDownList").dataSource.get(valorOpcSel).colores;
                    var query = self.$("#ddlQueries").data("kendoDropDownList").dataSource.get(valorOpcSel);

                    datosGrafico.linea = self.$("#cmbLinea").data("kendoDropDownList").value();
                    datosGrafico.arranque = self.$("#cmbArranques").data("kendoDropDownList").value();
                    datosGrafico.anyo = self.$("#cmbAnyo").data("kendoDropDownList").value();
                    datosGrafico.semana = self.$("#cmbSemana").data("kendoDropDownList").value();
                    datosGrafico.rangos = self.$("#txtNumSemanas").data("kendoNumericTextBox").value();
                    datosGrafico.fini = $("#dpInicio").data("kendoDatePicker").value() == null ? 0 : $("#dpInicio").data("kendoDatePicker").value().getTime();
                    datosGrafico.tini = self.$("#cmbTurnosInicio").data("kendoDropDownList").value() == "" ? 0 : self.$("#cmbTurnosInicio").data("kendoDropDownList").value()
                    datosGrafico.ffin = $("#dpFin").data("kendoDatePicker").value() == null ? 0 : $("#dpFin").data("kendoDatePicker").value().getTime();
                    datosGrafico.tfin = self.$("#cmbTurnosFin").data("kendoDropDownList").value() == "" ? 0 : self.$("#cmbTurnosFin").data("kendoDropDownList").value();
                    datosGrafico.id = valorOpcSel;
                    var maquina = "";
                    $("#trError").hide();
                    if ((datosGrafico.fini == 0 || datosGrafico.ffin == 0 ) && valorOpcSel != 11) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('SELECCIONE_FECHAS'), 4000);
                        //$("#trError").show();
                        $("#imgProcesando").hide();
                    } else if (valorOpcSel == 11 && datosGrafico.anyo == "") {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('SELECCIONE_ANYO'), 4000);
                        $("#imgProcesando").hide();
                    } else {

                        if ($("#maquina").is(":visible")) {
                            for (i = 0; i < self.multimaquina.value().length; i++) {
                                maquina += "'" + self.multimaquina.value()[i] + "'@";
                            }
                        }
                        datosGrafico.maquina = maquina;

                        var motivos = "";
                        if ($("#motivo").is(":visible")) {
                            for (i = 0; i < self.multiselect.value().length; i++) {
                                motivos += "'" + self.multiselect.value()[i] + "'@";

                            }
                        }
                        datosGrafico.motivos = motivos;


                        datosGrafico.tipo = tipo;

                        $.ajax({
                            type: "POST",
                            url: "../api/query/executeGrafico/",
                            dataType: 'json',
                            data: JSON.stringify(datosGrafico),
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            async: true
                        }).done(function (data) {
                            self.results = data;


                            if (tipo == "pie") {

                                var medida = self.$("#ddlQueries").data("kendoDropDownList").dataSource.get(valorOpcSel).seriesname;

                                $("#chart").kendoChart({
                                    pdf: {
                                        fileName: nombre + ".pdf",
                                    },
                                    title: {
                                        text: nombre
                                    },
                                    legend: {
                                        visible: true
                                    },
                                    chartArea: {
                                        background: "",
                                        height: altura
                                    },
                                    seriesDefaults: {
                                        labels: {
                                            visible: true,
                                            background: "transparent",
                                            template: "#= category #: \n #= value#" + medida
                                        }
                                    },
                                    series: [{
                                        type: "pie",
                                        startAngle: 150,
                                        data: self.results.Records,
                                        overlay: {
                                            gradient: "none"
                                        }
                                    }],
                                    seriesColors: colores,
                                    tooltip: {
                                        visible: true,
                                        template: "#= category #: #= value # " + medida.toString()
                                    }
                                });
                            }
                            else {
                                if (tipo == "bar") {

                                    var seriesname = self.$("#ddlQueries").data("kendoDropDownList").dataSource.get(valorOpcSel).seriesname;
                                    var maxvalue = self.$("#ddlQueries").data("kendoDropDownList").dataSource.get(valorOpcSel).maxvalor;

                                    if (maxvalue > 0) {
                                        $("#chart").kendoChart({
                                            pdf: {
                                                fileName: nombre + ".pdf",
                                            },
                                            renderAs: "canvas",
                                            chartArea: {
                                                height: altura
                                            },
                                            title: {
                                                text: nombre
                                            },
                                            legend: {
                                                visible: false
                                            },
                                            seriesDefaults: {
                                                type: "column",
                                                labels: {
                                                    visible: true,
                                                    background: "transparent",
                                                    template: "#= value# " + seriesname,
                                                    position: "outsideEnd"
                                                }
                                            },
                                            series: [{
                                                name: seriesname,
                                                data: self.results.valores,
                                                overlay: {
                                                    gradient: "none"
                                                }
                                            }],
                                            seriesColors: colores,
                                            valueAxis: {
                                                max: maxvalue,
                                                min: 0,
                                                line: {
                                                    visible: false
                                                },
                                                minorGridLines: {
                                                    visible: true
                                                },
                                                labels: {
                                                    rotation: "auto",
                                                    format: "{0} " + seriesname
                                                }
                                            },
                                            categoryAxis: {
                                                categories: self.results.Fields,
                                                labels: {
                                                    rotation: -90,
                                                },
                                                majorGridLines: {
                                                    visible: false
                                                }
                                            },
                                            tooltip: {
                                                visible: true,
                                                template: "#= series.name #: #= value # "
                                            },
                                            pannable: {
                                                lock: "y"
                                            },
                                            zoomable: {
                                                mousewheel: {
                                                    lock: "y"
                                                },
                                                selection: {
                                                    lock: "y"
                                                }
                                            }

                                        });
                                    }
                                    else {

                                        $("#chart").kendoChart({
                                            pdf: {
                                                fileName: nombre + ".pdf",
                                            },
                                            renderAs: "canvas",
                                            chartArea: {
                                                height: altura
                                            },
                                            title: {
                                                text: nombre
                                            },
                                            legend: {
                                                visible: false
                                            },
                                            seriesDefaults: {
                                                type: "column",
                                                labels: {
                                                    visible: true,
                                                    background: "transparent",
                                                    template: "#= value# " + seriesname,
                                                    position: "outsideEnd"
                                                }
                                            },
                                            series: [{
                                                name: seriesname,
                                                data: self.results.valores,
                                                overlay: {
                                                    gradient: "none"
                                                }
                                            }],
                                            seriesColors: colores,
                                            valueAxis: {
                                                line: {
                                                    visible: false
                                                },
                                                minorGridLines: {
                                                    visible: true
                                                },
                                                labels: {
                                                    rotation: "auto",
                                                    format: "{0} " + seriesname
                                                }
                                            },
                                            categoryAxis: {
                                                categories: self.results.Fields,
                                                labels: {
                                                    rotation: -90,
                                                },
                                                majorGridLines: {
                                                    visible: false
                                                }
                                            },
                                            tooltip: {
                                                visible: true,
                                                template: "#= series.name #: #= value # "
                                            },
                                            pannable: {
                                                lock: "y"
                                            },
                                            zoomable: {
                                                mousewheel: {
                                                    lock: "y"
                                                },
                                                selection: {
                                                    lock: "y"
                                                }
                                            }

                                        });
                                    }
                                }
                                else {
                                    if (tipo == "lin") {
                                        var medida = self.$("#ddlQueries").data("kendoDropDownList").dataSource.get(valorOpcSel).seriesname;
                                        var maxvalue = self.$("#ddlQueries").data("kendoDropDownList").dataSource.get(valorOpcSel).maxvalor;

                                        if (maxvalue > 0) {
                                            $("#chart").kendoChart({
                                                pdf: {
                                                    fileName: nombre + ".pdf",
                                                },
                                                title: {
                                                    text: nombre
                                                },
                                                legend: {
                                                    position: "bottom"
                                                },
                                                chartArea: {
                                                    height: altura
                                                },
                                                seriesDefaults: {
                                                    type: "line"
                                                },
                                                series: self.results.series,
                                                seriesColors: colores,
                                                valueAxis: {
                                                    max: maxvalue,
                                                    min: 0,
                                                    labels: {
                                                        format: "{0} " + medida
                                                    },
                                                    line: {
                                                        visible: false
                                                    },
                                                    axisCrossingValue: -10
                                                },
                                                categoryAxis: {
                                                    categories: self.results.Fields,
                                                    majorGridLines: {
                                                        visible: false
                                                    },
                                                    labels: {
                                                        rotation: "auto"
                                                    }
                                                },
                                                tooltip: {
                                                    visible: true,
                                                    format: "{0} minutos",
                                                    template: "#= series.name #: #= value #"
                                                }
                                            });

                                        }
                                        else {
                                            $("#chart").kendoChart({
                                                pdf: {
                                                    fileName: nombre + ".pdf",
                                                },
                                                title: {
                                                    text: nombre
                                                },
                                                legend: {
                                                    position: "bottom"
                                                },
                                                chartArea: {
                                                    height: altura
                                                },
                                                seriesDefaults: {
                                                    type: "line"
                                                },
                                                series: self.results.series,
                                                seriesColors: colores,
                                                valueAxis: {
                                                    labels: {
                                                        format: "{0} " + medida
                                                    },
                                                    line: {
                                                        visible: false
                                                    },
                                                    axisCrossingValue: -10
                                                },
                                                categoryAxis: {
                                                    categories: self.results.Fields,
                                                    majorGridLines: {
                                                        visible: false
                                                    },
                                                    labels: {
                                                        rotation: "auto"
                                                    }
                                                },
                                                tooltip: {
                                                    visible: true,
                                                    format: "{0} " + window.app.idioma.t('MINUTOS').toLowerCase(),
                                                    template: "#= series.name #: #= value #"
                                                }
                                            });
                                        }


                                    }
                                    else {
                                        if (tipo == "mul") {

                                            var medida = self.$("#ddlQueries").data("kendoDropDownList").dataSource.get(valorOpcSel).seriesname;
                                            var maxvalue = self.$("#ddlQueries").data("kendoDropDownList").dataSource.get(valorOpcSel).maxvalor;

                                            if (maxvalue > 0) {
                                                $("#chart").kendoChart({
                                                    pdf: {
                                                        fileName: nombre + ".pdf",
                                                    },
                                                    renderAs: "canvas",
                                                    chartArea: {
                                                        height: altura
                                                    },
                                                    title: {
                                                        text: nombre
                                                    },
                                                    legend: {
                                                        visible: true
                                                    },
                                                    seriesDefaults: {
                                                        type: "column",
                                                        labels: {
                                                            visible: true,
                                                            background: "transparent",
                                                            template: "#= value # " + medida,
                                                            position: "outsideEnd"
                                                        },
                                                        overlay: {
                                                            gradient: "none"
                                                        }
                                                    },
                                                    series: self.results.series,
                                                    seriesColors: colores,
                                                    valueAxis: {
                                                        max: maxvalue,
                                                        min: 0,
                                                        labels: {
                                                            template: "#= value # " + medida
                                                        },
                                                        line: {
                                                            visible: false
                                                        }
                                                    },
                                                    categoryAxis: {
                                                        categories: self.results.Fields,
                                                        labels: {
                                                            rotation: -90,
                                                        },
                                                        majorGridLines: {
                                                            visible: false
                                                        }
                                                    },
                                                    tooltip: {
                                                        visible: true,
                                                        template: "#= series.name # : #= value # " + medida
                                                    },
                                                    pannable: {
                                                        lock: "y"
                                                    },
                                                    zoomable: {
                                                        mousewheel: {
                                                            lock: "y"
                                                        },
                                                        selection: {
                                                            lock: "y"
                                                        }
                                                    }
                                                });
                                            }
                                            else {
                                                $("#chart").kendoChart({
                                                    pdf: {
                                                        fileName: nombre + ".pdf",
                                                    },
                                                    renderAs: "canvas",
                                                    chartArea: {
                                                        height: altura
                                                    },
                                                    title: {
                                                        text: nombre
                                                    },
                                                    legend: {
                                                        visible: true
                                                    },
                                                    seriesDefaults: {
                                                        type: "column",
                                                        labels: {
                                                            visible: true,
                                                            background: "transparent",
                                                            template: "#= value # " + medida,
                                                            position: "outsideEnd"
                                                        },
                                                        overlay: {
                                                            gradient: "none"
                                                        }
                                                    },
                                                    series: self.results.series,
                                                    seriesColors: colores,
                                                    valueAxis: {
                                                        labels: {
                                                            template: "#= value # " + medida
                                                        },
                                                        line: {
                                                            visible: false
                                                        }
                                                    },
                                                    categoryAxis: {
                                                        categories: self.results.Fields,
                                                        labels: {
                                                            rotation: -90,
                                                        },
                                                        majorGridLines: {
                                                            visible: false
                                                        }
                                                    },
                                                    tooltip: {
                                                        visible: true,
                                                        template: "#= series.name # : #= value # " + medida
                                                    },
                                                    pannable: {
                                                        lock: "y"
                                                    },
                                                    zoomable: {
                                                        mousewheel: {
                                                            lock: "y"
                                                        },
                                                        selection: {
                                                            lock: "y"
                                                        }
                                                    }
                                                });
                                            }


                                        }
                                    }
                                }
                            }
                            $("#botones").show();
                            $("#imgProcesando").hide();

                        }).fail(function (xhr) {
                            if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                            }
                            $("#imgProcesando").hide();
                        });

                    }
                }
                else {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                    $("#imgProcesando").hide();
                }

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

        });

        return consultasDinamicas;
    });