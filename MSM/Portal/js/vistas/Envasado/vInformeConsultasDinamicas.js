define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/ConsultasDinamicas.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', 'compartido/utils', 'jszip'],
    function (_, Backbone, $, plantillaConsultasDinamicas, VistaDlgConfirm, Not, utils, JSZip) {
        var consultasDinamicas = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(plantillaConsultasDinamicas),
            queries: [],
            results: [],
            initialize: function () {
                window.JSZip = JSZip;
                var self = this;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                $.ajax({
                    type: "GET",
                    url: "../api/queries",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.queries = data;
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
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

                $("#divWhere").show();
                $("#botones").hide();
                $("#divVacio").hide();
                

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
                   
                    dataValueField: "tipo.id",
                    template: "#: window.app.idioma.t('TURNO'+tipo.id)#",
                    valueTemplate: "#: window.app.idioma.t('TURNO'+tipo.id)#",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    enable: false
                });


                this.$("#cmbTurnosFin").kendoDropDownList({
                    enable: false,
                    dataValueField: "tipo.id",
                    template: "#: window.app.idioma.t('TURNO'+tipo.id)#",
                    valueTemplate: "#: window.app.idioma.t('TURNO'+tipo.id)#",
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
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                   
                });



                this.$("[data-funcion]").checkSecurity();
            },
            events: {
                'click #btnEjecutar': 'executaQuery',
                'click #btnExportExcel': 'exportExcel',
                'click #btnExportarPDF': 'exportPDF',
                'click #btnFiltros': 'mostrarFiltros',
                'change #cmbLinea': 'cambiaLinea',
                'change #dpInicio': 'cambiaLineaFechaIni',
                'change #dpFin': 'cambiaLineaFechaFin',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid' // agomezn 270516: 040 Incluir un botón "Limpiar filtros" en las páginas donde se usen filtros
            },
            cambiaLinea: function () {
                this.cambiaLineaFechaIni();
                this.cambiaLineaFechaFin();
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
            mostrarFiltros: function () {
                if ($("#divWhere").is(":visible")){
                    $("#divWhere").hide("slow");
                    $("#btnFiltros").html('<span class=\"k-icon k-i-plus\"></span>Mostrar Filtros');
                }
                else {
                    $("#divWhere").show("slow");
                    $("#btnFiltros").html('<span class=\"k-icon k-i-arrow-n\"></span>Ocultar Filtros');
                }
            },                        
            exportExcel: function () {
                var grid = $("#grid").data("kendoGrid");
                grid.saveAsExcel();
            },
            exportPDF: function () {
                var grid = $("#grid").data("kendoGrid");
                grid.saveAsPDF();
            },
            executaQuery: function () {

                var self = this;
                var valorOpcSel = self.$("#ddlQueries").val();
               
                $("#trError").hide();
                if (valorOpcSel != "") {
                    var query = self.$("#ddlQueries").data("kendoDropDownList").dataSource.get(valorOpcSel);
                    var querytext = self.$("#ddlQueries").data("kendoDropDownList").dataSource.get(valorOpcSel).nombre;
                    this.$("#imgProcesando").css("display", "block");
                    datosGrafico = {};

                    datosGrafico.id = valorOpcSel;
                    datosGrafico.linea = this.$("#cmbLinea").data("kendoDropDownList").value();
                    datosGrafico.fini = $("#dpInicio").data("kendoDatePicker").value() == null ? 0 : $("#dpInicio").data("kendoDatePicker").value().getTime();
                    datosGrafico.tini = self.$("#cmbTurnosInicio").data("kendoDropDownList").value() == "" ? 0 : self.$("#cmbTurnosInicio").data("kendoDropDownList").value()
                    datosGrafico.ffin = $("#dpFin").data("kendoDatePicker").value() == null ? 0 : $("#dpFin").data("kendoDatePicker").value().getTime();
                    datosGrafico.tfin = self.$("#cmbTurnosFin").data("kendoDropDownList").value() == "" ? 0 : self.$("#cmbTurnosFin").data("kendoDropDownList").value();

                    if (datosGrafico.fini == 0 || datosGrafico.ffin == 0) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('SELECCIONE_FECHAS'), 4000);
                       
                        $("#imgProcesando").hide();
                    } else {

                        //var urlKendo = "";

                        //if (valorOpcSel != "") {
                        //    var query = self.$("#ddlQueries").data("kendoDropDownList").dataSource.get(valorOpcSel);

                        //    if (self.linea == "" && self.finicio == null && self.ffin == null && self.tinicio == "" && self.tfin == "") {
                        //        urlKendo = "../api/query/execute/" + query.id;
                        //    }
                        //    else {

                        //        if (self.finicio != null && self.tinicio == "")
                        //            self.tinicio = 1;

                        //        if (self.ffin != null && self.tfin == "")
                        //            self.tfin = 3;

                        //        self.Inicio = 0;
                        //        self.Fin = 0;
                        //        var hoyDate = new Date();

                        //        if (self.finicio != null) {
                        //            //Inicio
                        //            $.ajax({
                        //                type: "GET",
                        //                url: "../api/turnocercano/" + this.$("#cmbLinea").data("kendoDropDownList").value() + "/" + ($("#dpInicio").data("kendoDatePicker").value().getTime() - hoyDate.getTimezoneOffset() * 60 * 1000) + "/" + $("#cmbTurnosInicio").data("kendoDropDownList").value() + "/1",
                        //                dataType: 'json',
                        //                cache: false,
                        //                async: false
                        //            }).success(function (data) {
                        //                self.Inicio = data.inicioUTC;
                        //            }).error(function (err, msg, ex) {
                        //                //Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_PRODUCTOS_LINEA') + ':' + ex, 4000);
                        //            });
                        //        }

                        //        if (self.ffin != null) {
                        //            //Fin
                        //            $.ajax({
                        //                type: "GET",
                        //                url: "../api/turnocercano/" + self.$("#cmbLinea").data("kendoDropDownList").value() + "/" + ($("#dpFin").data("kendoDatePicker").value().getTime() - hoyDate.getTimezoneOffset() * 60 * 1000) + "/" + $("#cmbTurnosFin").data("kendoDropDownList").value() + "/0",
                        //                dataType: 'json',
                        //                cache: false,
                        //                async: false
                        //            }).success(function (data) {
                        //                self.Fin = data.finUTC;
                        //            }).error(function (err, msg, ex) {
                        //                //Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_PRODUCTOS_LINEA') + ':' + ex, 4000);
                        //            });

                        //        }
                        //        urlKendo = "../api/query/executeFiltros/" + query.id + "/" + self.Inicio + "/" + self.Fin + "/" + self.linea;

                        //    }



                        $.ajax({
                            //type: "GET",
                            //url: urlKendo,
                            //dataType: 'json',
                            //cache: false,
                            //async: false
                            type: "POST",
                            url: "../api/query/executeFiltros",
                            dataType: 'json',
                            data: JSON.stringify(datosGrafico),
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            async: true
                        }).done(function (data) {
                            self.results = data;

                            if (self.results.Fields.length > 0) {
                                var fields = {};
                                for (i = 0; i < self.results.Fields.length; i++) {

                                    switch (self.results.Types[i]) {
                                        case "varchar":
                                        case "char":
                                        case "text":
                                        case "nvarchar":
                                        case "nchar":
                                        case "ntext":
                                            fields[self.results.Fields[i]] = { type: "string" };
                                            break;

                                        case "bigint":
                                        case "int":
                                        case "decimal":
                                        case "float":
                                        case "money":
                                        case "numeric":
                                        case "real":
                                        case "tinyint":
                                        case "smallint":
                                        case "smallmoney":
                                            fields[self.results.Fields[i]] = { type: "number" };
                                            break;

                                        case "date":
                                        case "datetime":
                                        case "smalldatetime":
                                            fields[self.results.Fields[i]] = { type: "date" };
                                            break;
                                    }
                                }

                                var columns = [];
                                for (i = 0; i < self.results.Fields.length; i++) {
                                    //Se agrego el title para que se pueda ver con espacios el header de cada columna
                                    var valueField = self.results.Fields[i];
                                    var replaceValueField = valueField.replace(/\_/g, ' ');
                                    columns[i] = { field: self.results.Fields[i], title: replaceValueField };
                                }

                                $("#divVacio").hide();
                                var CHANGE = 'change',
                                $grid = $('#grid');


                                // Unbind existing refreshHandler in order to re-create with different column set
                                if ($grid.length > 0 && $grid.data().kendoGrid) {
                                    var thisKendoGrid = $grid.data().kendoGrid;

                                    if (thisKendoGrid.dataSource && thisKendoGrid._refreshHandler) {
                                        thisKendoGrid.dataSource.unbind(CHANGE, thisKendoGrid._refreshHandler);
                                        $grid.removeData('kendoGrid');
                                        $grid.empty();
                                    }
                                }

                                self.$("#grid").kendoGrid({
                                    dataSource: {
                                        pageSize: 50,
                                        data: self.results.Records,
                                        schema: {
                                            model: {
                                                fields: fields
                                            }
                                        }

                                    },
                                    sortable: true,
      
                                    toolbar: [ // agomezn 270516: 040 Incluir un botón "Limpiar filtros" en las páginas donde se usen filtros
                                    {
                                        template: "<button type='button' id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                                    }],
                                    resizable: true,
                                    excel: {
                                        fileName: querytext + ".xlsx",
                                        allPages: true,
                                        filterable: true
                                    },
                                    pdf: {
                                        fileName: querytext + ".pdf",
                                        title: querytext
                                    },
                                    filterable: {
                                        extra: false,
                                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                                    },
                                    selectable: false,
                                    pageable: {
                                        refresh: true,
                                        pageSizes: true,
                                        pageSizes: [50, 100, 200, 'All'],
                                        buttonCount: 5,
                                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                                    },
                                    //dataBinding: self.resizeGrid(),
                                    columns: columns
                                });
                                self.resizeGrid();

                                $("#grid thead [data-field=Perc_Perd] .k-link").html("% Perd A/C");
                                //$("#grid thead [data-field=Duracion_llenadora] .k-link").html("Media duración llenadora");
                                //$("#grid thead [data-field=Duracion_paletizadora] .k-link").html("Media duración paletizadora");

                                $("#botones").show();
                                $("#imgProcesando").hide();
                            }
                            else {

                                $("#imgProcesando").hide();
                                $("#divVacio").show("slow");


                            }
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
            resizeGrid: function () {

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltros").innerHeight();
                var divWhere = $("#divWhere").innerHeight();

                var gridElement = $("#grid"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - divWhere - 2);

            },
            LimpiarFiltroGrid: function () { // agomezn 270516: 040 Incluir un botón "Limpiar filtros" en las páginas donde se usen filtros
                $("form.k-filter-menu button[type='reset']").trigger("click");
            }
        });

        return consultasDinamicas;
    });