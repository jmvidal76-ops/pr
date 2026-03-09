define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/ParametrosLinea.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', 'jszip'],
    function (_, Backbone, $, PlantillaParametrosLinea, VistaDlgConfirm, Not, JSZip) {
        var gridParametrosLinea = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            registrosSelData: [],
            registrosDesSelData: [],
            selTodos: false,
            ventanaEditarCrear: null,
            template: _.template(PlantillaParametrosLinea),
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;
                self.registrosSelData = [];
                self.registrosDesSelData = [];
                self.selTodos = false;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerParametrosLinea/",
                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "idPPR",
                            fields: {
                                // Id: { type: "number", editable: false, nullable: false },
                                'idPPR': { type: "string" },
                                'idProducto': { type: "string" },
                                'idLinea': { type: "int" },
                                'numeroLinea': { type: "int" },
                                'descripcionLinea': { type: "string" },        
                                'nombreProducto': { type: "string" },
                                'velocidadNominal': { type: "number" },
                                'VelocidadNominalMaqLimitante': { type: "number" },
                                'OEE_objetivo': { type: "number" },
                                'OEE_critico': { type: "number" },
                                'OEE_medio': { type: "number" },
                                'OEE_preactor': { type: "number" },
                                'numeroLineaDescripcion': { type: "string" },
                                'FormatoComun': { type: "string" },
                                'InhabilitarCalculo': { type: "boolean" }
                            }
                        }
                    },
                    requestStart: function () {
                        if (self.ds.data().length == 0) {
                            kendo.ui.progress($("#gridParametrosLinea"), true);
                        }
                    },
                    requestEnd: function () {
                        if (self.ds.data().length == 0) {
                            kendo.ui.progress($("#gridParametrosLinea"), false);
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            $("#center-pane").empty();
                        }
                    },
                    sort: { field: "numeroLinea", dir: "asc" }
                });

                self.render();
            },
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))
                var self = this;

                // Controles de asignación multiple
                $("#txtVelNom").kendoNumericTextBox({
                    placeholder: '',
                    decimals: 0,
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: '0'
                });

                $("#txtVelNomMaqLimitante").kendoNumericTextBox({
                    placeholder: '',
                    decimals: 0,
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: '0'
                });

                $("#txtOeeObj").kendoNumericTextBox({
                    placeholder: '',
                    min: 0,
                    max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                $("#txtOeeCri").kendoNumericTextBox({
                    placeholder: '',
                    min: 0,
                    max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                $("#txtOeePreactor").kendoNumericTextBox({
                    placeholder: '',
                    min: 0,
                    max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                var permiso = TienePermiso(181);

                $("#txtVelNom").data("kendoNumericTextBox").enable(permiso);

                //Cargamos el grid
                self.grid = this.$("#gridParametrosLinea").kendoGrid({
                    dataSource: self.ds,
                    excel: {
                        fileName: window.app.idioma.t("PARAMETROS_LINEA") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    sortable: true,
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    toolbar: [
                        {
                            template: "<button type='button' id='btnSelTodos' class='k-button k-button-icontext'><span class='k-icon k-i-hbars'></span>" + window.app.idioma.t('SELECCIONAR_TODOS') + "</button>"
                        },
                        {
                            template: "<button type='button' id='btnDesSelTodos' class='k-button k-button-icontext'><span class='k-icon k-si-cancel'></span>" + window.app.idioma.t('DESELECCIONAR_TODOS') + "</button>"
                        },
                        {
                            template: "<span style='margin-left:10px;'>" + window.app.idioma.t('REGISTROS_SEL') + "</span> <span id='lblRegSel'></span>"
                        },
                        {
                            template: "<button type='button' id='btnExportExcel' style='float:right;' class='k-button k-button-icontext k-grid-excel'><span class='k-icon k-i-excel'></span>" + window.app.idioma.t('EXPORTAR_EXCEL') + "</button>"
                        },
                        {
                            template: "<button type='button' id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        },
                        {
                            template: "<button type='button' id='btnCalcularOEEPreactor' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-custom'></span>" + window.app.idioma.t('CALCULAR_OEE_SECUENCIADOR') + "</button>"
                        }
                    ],
                    columns: [
                        {
                            title: "",
                            template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                            width: 25
                        },
                        {
                            command:
                            {
                                template: "<a id='btnEditar' class='k-button k-grid-edit' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                            },
                            width: "55px"
                        },
                        {
                            field: "idLinea",
                            title: window.app.idioma.t("LINEA"),
                            template: window.app.idioma.t("LINEA") + ' #:numeroLineaDescripcion# - #:descripcionLinea#', width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=idLinea#' style='width: 14px;height:14px;margin-right:5px;'/>" + window.app.idioma.t('LINEA') + " #= numeroLineaDescripcion# - #= descripcionLinea#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "FormatoComun", title: window.app.idioma.t("FORMATO_COMUN"), width: 270,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=FormatoComun#' style='width: 14px;height:14px;margin-right:5px;'/>#=FormatoComun#</label></div>";
                                }
                            }
                        },
                        { field: "idProducto", title: window.app.idioma.t("CODIGO_PRODUCTO"), width: 135 },
                        { field: "nombreProducto", title: window.app.idioma.t("PRODUCTO"), width: 240 },
                        {
                            field: "velocidadNominal", title: window.app.idioma.t("VELOCIDAD_NOMINAL"), width: 165, filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        {
                            field: "VelocidadNominalMaqLimitante", title: window.app.idioma.t("VEL_NOM_MAQ_LIMITANTE"), width: 200, filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        { field: "OEE_objetivo", title: window.app.idioma.t("OEE_OBJETIVO"), width: 130, template: '#if(OEE_objetivo % 1 != 0){# #:OEE_objetivo.toFixed(2) # #}else{ # #:OEE_objetivo # # }#' },
                        { field: "OEE_critico", title: window.app.idioma.t("OEE_CRITICO"), width: 120, template: '#if(OEE_critico % 1 != 0){# #:OEE_critico.toFixed(2) # #}else{ # #:OEE_critico # # }#' },
                        { field: "OEE_medio", title: window.app.idioma.t("OEE_MEDIO"), width: 150, template: '#if(OEE_medio % 1 != 0){# #:OEE_medio.toFixed(2) # #}else{ # #:OEE_medio # # }#' },
                        { field: "InhabilitarCalculo", title: window.app.idioma.t("INHABILITAR_CALCULO"), width: 160, template: '<input type="checkbox" class="chkInhabilitar" disabled #= InhabilitarCalculo ? \'checked="checked"\' : "" # />' },
                        { field: "OEE_preactor", title: window.app.idioma.t("OEE_SECUENCIADOR"), width: 140, template: '#if(OEE_preactor % 1 != 0){# #:OEE_preactor.toFixed(2) # #}else{ # #:OEE_preactor # # }#' }
                    ],
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];

                                //field: Linea
                                row.cells[0].value = window.app.idioma.t('LINEA') + ' ' + e.data[dataPosition].numeroLineaDescripcion + ' - ' + e.data[dataPosition].descripcionLinea;
                            } catch (e) { }
                        }
                    },
                    dataBound: function () {
                        $(".checkbox").bind("change", function (e) {
                            var checked = this.checked;
                            row = $(e.target).closest("tr");
                            grid = $("#gridParametrosLinea").data("kendoGrid");
                            dataItem = grid.dataItem(row);
                            var idValue = grid.dataItem(row).get("idPPR");
                            var datos = {};
                            datos.numeroLinea = dataItem.numeroLinea;
                            datos.codProducto = dataItem.idProducto;
                            datos.idPPR = dataItem.idPPR;
                            datos.inhabilitarCalculo = dataItem.InhabilitarCalculo;

                            if (checked) {
                                row.addClass("k-state-selected");
                                var datafound = _.findWhere(self.registrosDesSelData, datos);
                                index = _.indexOf(self.registrosDesSelData, datafound);

                                if (index >= 0) {
                                    self.registrosDesSelData.splice(index, 1);
                                }

                                var numReg = self.$("#lblRegSel").text() ? self.$("#lblRegSel").text() : 0;
                                self.$("#lblRegSel").text(++numReg);
                                self.registrosSelData.push(datos);
                            } else {
                                row.removeClass("k-state-selected");
                                self.registrosDesSelData.push(datos);
                                var numReg = self.$("#lblRegSel").text() ? self.$("#lblRegSel").text() : 0;
                                self.$("#lblRegSel").text(--numReg);
                                var datafound = _.findWhere(self.registrosSelData, datos);
                                index = _.indexOf(self.registrosSelData, datafound);

                                if (index >= 0) {
                                    self.registrosSelData.splice(index, 1);
                                }
                            }
                        });

                        var grid = $('#gridParametrosLinea').data('kendoGrid');

                        if (self.selTodos) {
                            grid.tbody.find('.checkbox').prop("checked", true);
                            grid.tbody.find(">tr").addClass('k-state-selected');

                            var items = grid.items();
                            var listItems = [];

                            listItems = $.grep(items, function (row) {
                                var dataItem = grid.dataItem(row);
                                return self.registrosDesSelData.some(function (data) {
                                    return data.idPPR == dataItem.id;
                                });
                            });

                            listItems.forEach(function (row, idx) {
                                $(row.cells[0])[0].childNodes[0].checked = false;
                                $(row).closest("tr").removeClass("k-state-selected");
                            });
                        } else {
                            grid.tbody.find('.checkbox').prop("checked", false);
                            grid.tbody.find(">tr").removeClass('k-state-selected');

                            var items = grid.items();
                            var listItems = [];

                            listItems = $.grep(items, function (row) {
                                var dataItem = grid.dataItem(row);
                                return self.registrosSelData.some(function (data) {
                                    return data.idPPR == dataItem.id;
                                });
                            });

                            listItems.forEach(function (row, idx) {
                                $(row.cells[0])[0].childNodes[0].checked = true;
                                $(row).closest("tr").addClass("k-state-selected");
                            });
                        }
                    },
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");

                var _grid = $("#gridParametrosLinea").data("kendoGrid");
                $("#gridParametrosLinea").data("kendoGrid").dataSource.bind("change", function (e) {
                    if (_grid.dataSource.filter() != null && typeof (_grid.dataSource.filter()) != "undefined") {
                        //Comprobamos si el cambio en el datasource se debe a un cambio del filtro y en tal caso eliminamos los checkbox
                        if (_grid.dataSource.filter().filters != self.filtroActual) {
                            self.filtroActual = _grid.dataSource.filter().filters; //hay que actualizar la variable antes de llamar a aplicarSeleccion para que no entre en un bucle infinito
                        }
                        self.filtroActual = _grid.dataSource.filter().filters;
                    }
                });

                window.app.headerGridTooltip(self.grid);
            },
            limpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            editarParametroLinea: function (e) {
                var self = this;
                var permiso = TienePermiso(1);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='window'></div>"));

                $("#window").kendoWindow(
                {
                    title: window.app.idioma.t('PARAMETROS_LINEA'),
                    width: "440px",
                    height: "510px",
                    content: "Envasado/html/EditarCrearParametrosLinea.html",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    close: function () {
                        self.ventanaEditarCrear.destroy();
                        self.ventanaEditarCrear = null;
                    },
                    refresh: function () {
                        self.cargaContenido(e);
                    }
                });

                self.ventanaEditarCrear = $('#window').data("kendoWindow");
                self.ventanaEditarCrear.center();
                self.ventanaEditarCrear.open();
            },
            cargaContenido: function (e) {
                //Traducimos los label del formulario
                var self = this;

                $("#lblLinea").text(window.app.idioma.t('LINEA') + ': ');
                $("#lblCodigoProducto").text(window.app.idioma.t("CODIGO_PRODUCTO") + ': ');
                $("#lblProducto").text(window.app.idioma.t('PRODUCTO') + ': ');
                $("#lblVelocidadNominal").text(window.app.idioma.t('VELOCIDAD_NOMINAL'));
                $("#lblVelNomMaqLimitante").text(window.app.idioma.t('VEL_NOM_MAQ_LIMITANTE'));
                $("#lblObjetivo").text(window.app.idioma.t('OEE_OBJETIVO') + ' %');
                $("#lblCalculado").text(window.app.idioma.t("OEE_MEDIO") + ' %');
                $("#lblCritico").text(window.app.idioma.t('OEE_CRITICO') + ' %');
                $("#lblPreactor").text(window.app.idioma.t('OEE_SECUENCIADOR') + ' %');
                $("#lblInhabilitarCalculo").text(window.app.idioma.t('INHABILITAR_CALCULO'));
                $("#btnAceptarPL").text(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarPL").text(window.app.idioma.t('CANCELAR'));

                $("#ntxtVelocidadNominal").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    decimals: 0,
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: 'n0'
                });

                $("#ntxtVelNomMaqLimitante").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    decimals: 0,
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: 'n0'
                });

                $("#ntxtOEE_Objetivo").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    min: 0,
                    max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                $("#ntxtOEE_Critico").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    min: 0,
                    max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                $("#ntxtOEE_Calculado").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    min: 0,
                    //max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                $("#txtOEE_Preactor").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    min: 0,
                    max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                $("#btnAceptarPL").kendoButton({
                    click: function (e) { self.confirmarEdicion(); }
                });

                $("#btnCancelarPL").kendoButton({
                    click: function () { self.CancelarFormulario(); }
                });

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);

                $("#lblValorPPR").text(data.idPPR);
                $("#lblValorLinea").text(data.nombreLinea);
                $("#lblValorCodigoProducto").text(data.idProducto);
                $("#lblValorProducto").text(data.nombreProducto);
                $("#ntxtVelocidadNominal").data("kendoNumericTextBox").value(data.velocidadNominal);
                $("#ntxtVelNomMaqLimitante").data("kendoNumericTextBox").value(data.VelocidadNominalMaqLimitante);
                $("#ntxtOEE_Objetivo").data("kendoNumericTextBox").value(data.OEE_objetivo);
                $("#ntxtOEE_Critico").data("kendoNumericTextBox").value(data.OEE_critico);
                $("#ntxtOEE_Calculado").data("kendoNumericTextBox").value(data.OEE_medio);
                $("#txtOEE_Preactor").data("kendoNumericTextBox").value(data.OEE_preactor);
                $("#chkInhabilitar_Calculo").prop('checked', data.InhabilitarCalculo);

                var permiso = TienePermiso(181);

                $("#ntxtVelocidadNominal").data("kendoNumericTextBox").enable(permiso);
            },
            events: {
                'click #btnEditar': 'editarParametroLinea',
                'click #btnAsignarParametros': 'confirmAsignarParametros',
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
                'click #btnSelTodos': function () { this.aplicarSeleccion(true); },
                'click #btnDesSelTodos': function () { this.aplicarSeleccion(false); },
                'click #btnCalcularOEEPreactor': 'confirmAsignarParametros'
            },
            aplicarSeleccion: function (checked) {
                var self = this;

                self.selTodos = checked;

                var grid = $('#gridParametrosLinea').data('kendoGrid');
                if (self.selTodos) {
                    grid.tbody.find('.checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var dataSource = $("#gridParametrosLinea").data("kendoGrid").dataSource;
                    var filters = dataSource.filter();
                    var allData = dataSource.data();
                    var query = new kendo.data.Query(allData);
                    var dataFiltered = query.filter(filters).data;
                    self.$("#lblRegSel").text(dataFiltered.length);
                } else {
                    grid.tbody.find('.checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');
                    self.registrosDesSelData = [];
                    self.registrosSelData = [];
                    self.$("#lblRegSel").text("");
                }
            },
            calcularOEEPreactor: function (e) {
                var self = this;

                var datos = [];
                var dataSource = $("#gridParametrosLinea").data("kendoGrid").dataSource;
                var filters = dataSource.filter();
                var allData = dataSource.data();
                var query = new kendo.data.Query(allData);
                var dataFiltered = query.filter(filters).data;

                if (self.selTodos) {
                    datos = $.map(dataFiltered, function (data, i) {
                        var datos = {};
                        datos.numeroLinea = data.numeroLinea;
                        datos.codProducto = data.idProducto;
                        datos.idPPR = data.idPPR;
                        datos.inhabilitarCalculo = data.InhabilitarCalculo;

                        if (!_.findWhere(self.registrosDesSelData, datos)) {
                            return datos;
                        }
                    });
                } else {
                    var datos = $.map(dataFiltered, function (data, i) {
                        var datos = {};
                        datos.numeroLinea = data.numeroLinea;
                        datos.codProducto = data.idProducto;
                        datos.idPPR = data.idPPR;
                        datos.inhabilitarCalculo = data.InhabilitarCalculo;

                        if (_.findWhere(self.registrosSelData, datos)) {
                            return datos;
                        }
                    });
                }

                self.registrosDesSelData = [];
                self.registrosSelData = [];
                self.selTodos = false;
                self.$("#lblRegSel").text("");

                // Calcular OEE Preactor
                $.ajax({
                    type: "POST",
                    async: false,
                    url: "../api/calcularOEEPreactor/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).success(function (res) {
                    if (res) {
                        Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('SE_HAN_MODIFICADO_OEE_SECUENCIADOR'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR'), 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                }).error(function (err) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR'), 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                });

                // Calcular OEE WO Medio
                $.ajax({
                    type: "POST",
                    async: false,
                    url: "../api/calcularOEEWOMedio/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).success(function (res) {
                    if (res) {
                        Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('SE_HAN_MODIFICADO_OEE_WO_MEDIO'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR'), 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                }).error(function (err) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR'), 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                });

                self.ds.read();
            },
            confirmAsignarParametros: function (e) {
                e.preventDefault();
                var self = this;
                var permiso = TienePermiso(1);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $('#gridParametrosLinea').data('kendoGrid');

                if (grid.tbody.find('>tr.k-state-selected').length > 0 || self.registrosSelData.length > 0 ||
                    (self.registrosDesSelData.length > 0 && self.registrosDesSelData.length < self.ds.data().length)) {
                        if (e.currentTarget.id == "btnCalcularOEEPreactor") {
                            this.confirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('PARAMETROS_DE_LINEA'),
                                msg: window.app.idioma.t('DESEA_REALMENTE_RECALCULAR'),
                                funcion: function () { self.calcularOEEPreactor(e.currentTarget.id); },
                                contexto: this
                            });
                        } else {
                            this.confirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('PARAMETROS_DE_LINEA'),
                                msg: window.app.idioma.t('DESEA_REALMENTE_CAMBIAR_LOS'),
                                funcion: function () { self.AsignarParametros(e.currentTarget.id); },
                                contexto: this
                            });
                        }
                } else {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                }
            },
            AsignarParametros: function () {
                var self = this;
                var datos = {};
                datos.velNom = $('#txtVelNom').val();
                datos.velNomMaqLimitante = $('#txtVelNomMaqLimitante').val();
                datos.oeeObj = $('#txtOeeObj').val();
                datos.oeeCri = $('#txtOeeCri').val();
                datos.oeePre = $('#txtOeePreactor').val();
                datos.inhabilitarCalculo = $('#chkInhabilitarCalculo').prop('checked');
                var cambios = [];
                var dataSource = $("#gridParametrosLinea").data("kendoGrid").dataSource;
                var filters = dataSource.filter();
                var allData = dataSource.data();
                var query = new kendo.data.Query(allData);
                var dataFiltered = query.filter(filters).data;

                if (self.selTodos) {
                    cambios = $.map(dataFiltered, function (data, i) {
                        var datos = {};
                        datos.numeroLinea = data.numeroLinea;
                        datos.codProducto = data.idProducto;
                        datos.idPPR = data.idPPR;

                        if (!_.findWhere(self.registrosDesSelData, datos)) {
                            return {
                                idPPR: datos.idPPR,
                                lineaProducto: window.app.idioma.t('LINEA') + ' ' + datos.numeroLinea + ' - ' + 
                                    window.app.idioma.t('PRODUCTO') + ' ' + datos.codProducto
                            };
                        }
                    });
                } else {
                    var cambios = $.map(dataFiltered, function (data, i) {
                        var datos = {};
                        datos.numeroLinea = data.numeroLinea;
                        datos.codProducto = data.idProducto;
                        datos.idPPR = data.idPPR;

                        if (_.findWhere(self.registrosSelData, datos)) {
                            return {
                                idPPR: datos.idPPR,
                                lineaProducto: window.app.idioma.t('LINEA') + ' ' + datos.numeroLinea + ' - ' +
                                    window.app.idioma.t('PRODUCTO') + ' ' + datos.codProducto
                            };
                        }
                    });
                }

                datos.cambios = cambios;
                self.registrosDesSelData = [];
                self.registrosSelData = [];
                self.selTodos = false;
                self.$("#lblRegSel").text("");

                $.ajax({
                    type: "POST",
                    url: "../api/asignarParametrosLinea/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).success(function (res) {
                    if (res) {
                        self.ds.read();
                        Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('SE_HAN_ASIGNADO_PARAM_LINEA'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ASIGNAR_PARAM_LINEA'), 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                }).error(function (err) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ASIGNAR_PARAM_LINEA'), 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                });
            },
            limpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            CancelarFormulario: function () {
                this.ventanaEditarCrear.close();
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
            confirmarEdicion: function (e) {
                var self = this;
                
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('PARAMETROS_DE_LINEA'),
                    msg: window.app.idioma.t('CONFIRMACION_EDITAR_PARAMETROS_LINEA'),
                    funcion: function () { self.editarParametros(); },
                    contexto: this
                });
            },
            editarParametros: function () {
                var self = this;

                var pl = {};
                pl.idPPR = $("#lblValorPPR").text();
                pl.velocidadNominal = $("#ntxtVelocidadNominal").data("kendoNumericTextBox").value();
                pl.velNomMaqLimitante = $("#ntxtVelNomMaqLimitante").data("kendoNumericTextBox").value();
                pl.OEE_objetivo = $("#ntxtOEE_Objetivo").data("kendoNumericTextBox").value();
                pl.OEE_critico = $("#ntxtOEE_Critico").data("kendoNumericTextBox").value();
                //pl.OEE_calculado = $("#ntxtOEE_Calculado").data("kendoNumericTextBox").value();
                pl.OEE_preactor = $("#txtOEE_Preactor").data("kendoNumericTextBox").value();
                pl.inhabilitarCalculo = $("#chkInhabilitar_Calculo").prop('checked');
                pl.linea = $("#lblValorLinea").text();
                pl.codigoProducto = $("#lblValorCodigoProducto").text();

                $.ajax({
                    data: JSON.stringify(pl),
                    type: "POST",
                    async: false,
                    url: "../api/modificarParametrosLinea",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            self.ds.read();
                            Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('SE_HAN_MODIFICADO'), 4000);
                            self.ventanaEditarCrear.close();
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS_PARÁMETROS'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (response) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS_PARÁMETROS'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltros").innerHeight();

                var gridElement = $("#gridParametrosLinea"),
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

        return gridParametrosLinea;
    });