define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/TiemposArranque.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', 'jszip'],
    function (_, Backbone, $, PlantillaTiemposArranque, VistaDlgConfirm, Not, JSZip) {
        var tablaTiemposArranque = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaTiemposArranque),
            registrosSelData: [],
            registrosDesSelData: [],
            selTodos: false,
            filtroActual: null,
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;
                self.registrosSelData = [];
                self.registrosDesSelData = [];
                self.selTodos = false;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);
                self.render();
            },
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));
                var self = this;

                $("#txtTiempoObjetivo1").kendoNumericTextBox({
                    placeholder: '',
                    decimals: 0,
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: '0'
                });
                $("#txtTiempoObjetivo2").kendoNumericTextBox({
                    placeholder: '',
                    decimals: 0,
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: '0'
                });

                $("#txtTiempoPreactor").kendoNumericTextBox({
                    placeholder: '',
                    decimals: 0,
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: '0'
                });

                //Creamos datasource
                self.dsTiempos = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/obtenerTiemposArranque/",
                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        }
                    },
                    pageSize: 50,
                    batch: true,
                    schema: {
                        model: {
                            id: "idTiempoArranque",
                            fields: {
                                idTiempoArranque: { type: "number" },
                                idLinea: { type: "number" },
                                descLinea: { type: "string" },
                                'productoEntrante.codigo': { type: "string" },
                                'productoEntrante.nombre': { type: "string" },
                                'tipoArranque': { type: "string" },
                                tiempo1: { type: "number" },
                                tiempo2: { type: "number" },
                                tiempoM: { type: "number" },
                                tiempoCalculado2: { type: "number" },
                                tiempoPreactor: { type: "number" },
                                numeroLineaDescripcion: { type: "string" },
                                'FormatoComunEntrante': { type: "string" },
                                'InhabilitarCalculo': { type: "boolean" }
                            }
                        }
                    },
                    sort: { field: "idLinea", dir: "asc" },
                    requestStart: function () {
                        if (self.dsTiempos.data().length == 0) {
                            kendo.ui.progress($("#gridTiemposArranque"), true);
                        }
                    },
                    requestEnd: function () {
                        if (self.dsTiempos.data().length == 0) {
                            kendo.ui.progress($("#gridTiemposArranque"), false);
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                });

                var datasourceLineas = [];
                $.each(window.app.planta.lineas, function (index, linea) {
                    var data = {};
                    data.descLinea = linea.descripcion;
                    data.idLinea = linea.numLinea;
                    data.numeroLineaDescripcion = linea.numLineaDescripcion;
                    datasourceLineas.push(data);
                });

                //Montamos Grid
                var grid = this.$("#gridTiemposArranque").kendoGrid({
                    dataSource: self.dsTiempos,
                    excel: {
                        fileName: window.app.idioma.t("TIEMPOS_DE_ARRANQUE") + ".xlsx",
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
                            template: "<span style='margin-left:10px;'>"+ window.app.idioma.t('REGISTROS_SEL') + "</span> <span id='lblRegSel'></span>"
                        },
                        {
                            template: "<button type='button' id='btnExportExcel' style='float:right;' class='k-button k-button-icontext k-grid-excel'><span class='k-icon k-i-excel'></span>" + window.app.idioma.t('EXPORTAR_EXCEL') + "</button>"
                        },
                        {
                            template: "<button type='button' id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        },
                        {
                            template: "<button type='button' id='btnCalcularTiempoArranquePreactor' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-custom'></span>" + window.app.idioma.t('CALCULA_TIEMPOS_ARRANQUE_SECUENCIADOR') + "</button>"
                        }
                    ],
                    columns: [
                        {
                            title: "",
                            template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                            width: 30
                        },
                        {
                            field: "idLinea", title: window.app.idioma.t("LINEA"), width: 160,
                            template: window.app.idioma.t('LINEA') + " #=numeroLineaDescripcion# - #=descLinea#",
                            filterable: {
                                multi: true,
                                dataSource: datasourceLineas,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=idLinea#' style='width: 14px;height:14px;margin-right:5px;'/>" + window.app.idioma.t('LINEA') + " #= numeroLineaDescripcion# - #= descLinea#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "FormatoComunEntrante", title: window.app.idioma.t("FORMATO_COMUN_ENTRANTE"), width: 160,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=FormatoComunEntrante#' style='width: 14px;height:14px;margin-right:5px;'/>#=FormatoComunEntrante#</label></div>";
                                }
                            }
                        },
                        {
                            field: "productoEntrante.codigo", title: window.app.idioma.t("CODIGO_PRODUCTO_ENTRANTE"), width: 80
                        },
                        {
                            field: "productoEntrante.nombre", title: window.app.idioma.t("PRODUCTO_ENTRANTE"), width: 200
                        },
                        {
                            field: "descArranque", title: window.app.idioma.t("TIPO_ARRANQUE"), width: 100,
                            template: "#=descArranque#",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=descArranque#' style='width: 14px;height:14px;margin-right:5px;'/> #= descArranque#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "tiempo1",
                            title: window.app.idioma.t("TIEMPO_OBJETIVO_LLENADORA"),
                            width: 90,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    })
                                }
                            }
                        },
                        {
                            field: "tiempo2",
                            title: window.app.idioma.t("TIEMPO_OBJETIVO_PALETIZADORA"),
                            width: 90,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        {
                            field: "tiempoM",
                            title: window.app.idioma.t("TIEMPO_MEDIO_LLENADORA"),
                            width: 90,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        {
                            field: "tiempoCalculado2",
                            title: window.app.idioma.t("TIEMPO_MEDIO_PALETIZADORA"),
                            width: 90,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        {
                            field: "InhabilitarCalculo",
                            title: window.app.idioma.t("INHABILITAR_CALCULO"),
                            width: 100,
                            template: '<input type="checkbox" class="chkInhabilitar" disabled #= InhabilitarCalculo ? \'checked="checked"\' : "" # />'
                        },
                        {
                            field: "tiempoPreactor",
                            title: window.app.idioma.t("TIEMPO_SECUENCIADOR"),
                            width: 90,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        }
                    ],
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];

                                //field: Linea
                                row.cells[0].value = window.app.idioma.t('LINEA') + ' ' + e.data[dataPosition].numeroLineaDescripcion + ' - ' + e.data[dataPosition].descLinea;
                            } catch (e) { }
                        }
                    },
                    dataBound: function (e, args) {
                        $(".checkbox").bind("change", function (e) {
                            var checked = this.checked;
                            row = $(e.target).closest("tr");
                            grid = $("#gridTiemposArranque").data("kendoGrid");
                            dataItem = grid.dataItem(row);

                            var datos = {};
                            datos.numeroLinea = dataItem.idLinea;
                            datos.idProductoEntrante = dataItem.productoEntrante.codigo;
                            datos.descArranque = dataItem.descArranque;
                            datos.id = dataItem.id;
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

                        var grid = $("#gridTiemposArranque").data("kendoGrid");

                        if (self.selTodos) {
                            grid.tbody.find('.checkbox').prop("checked", true);
                            grid.tbody.find(">tr").addClass('k-state-selected');

                            var items = grid.items();
                            var listItems = [];

                            listItems = $.grep(items, function (row) {
                                var dataItem = grid.dataItem(row);
                                return self.registrosDesSelData.some(function (data) {
                                    return data.id == dataItem.id;
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
                                    return data.id == dataItem.id;
                                });
                            });

                            listItems.forEach(function (row, idx) {
                                $(row.cells[0])[0].childNodes[0].checked = true;
                                $(row).closest("tr").addClass("k-state-selected");
                            });
                        }
                    },
                    dataBinding: self.resizeGrid
                });

                var _grid = $("#gridTiemposArranque").data("kendoGrid");
                $("#gridTiemposArranque").data("kendoGrid").dataSource.bind("change", function (e) {
                    if (_grid.dataSource.filter() != null && typeof (_grid.dataSource.filter()) != "undefined") {
                        //Comprobamos si el cambio en el datasource se debe a un cambio del filtro y en tal caso eliminamos los checkbox
                        if (_grid.dataSource.filter().filters != self.filtroActual) {
                            self.filtroActual = _grid.dataSource.filter().filters; //hay que actualizar la variable antes de llamar a aplicarSeleccion para que no entre en un bucle infinito);
                        }
                        self.filtroActual = _grid.dataSource.filter().filters;
                    }
                });

                window.app.headerGridTooltip(_grid);
            },
            events: {
                'click #btnAsignarTiempos': 'confirmAsignarArranques',
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
                'click #btnSelTodos': function () { this.aplicarSeleccion(true); },
                'click #btnDesSelTodos': function () { this.aplicarSeleccion(false); },
                'click #btnCalcularTiempoArranquePreactor': 'confirmAsignarParametros'
            },
            aplicarSeleccion: function (checked) {
                var self = this;
                var grid = $('#gridTiemposArranque').data('kendoGrid');

                self.selTodos = checked;

                if (self.selTodos) {
                    grid.tbody.find('.checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var dataSource = $("#gridTiemposArranque").data("kendoGrid").dataSource;
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
            calcularTiempoArranquePreactor: function (e) {
                var self = this;
                var datos = {};
                var dataSource = $("#gridTiemposArranque").data("kendoGrid").dataSource;
                var filters = dataSource.filter();
                var allData = dataSource.data();
                var query = new kendo.data.Query(allData);
                var dataFiltered = query.filter(filters).data;

                if (self.selTodos) {
                    datos = $.map(dataFiltered, function (data, i) {
                        var datos = {};
                        datos.numeroLinea = data.idLinea;
                        datos.idProductoEntrante = data.productoEntrante.codigo;
                        datos.tipoArranque = data.tipoArranque;
                        datos.id = data.id;
                        datos.inhabilitarCalculo = data.InhabilitarCalculo;

                        if (!_.findWhere(self.registrosDesSelData, datos)) {
                            return datos;
                        }
                    });
                } else {
                    var datos = $.map(dataFiltered, function (data, i) {
                        var datos = {};
                        datos.numeroLinea = data.idLinea;
                        datos.idProductoEntrante = data.productoEntrante.codigo;
                        datos.tipoArranque = data.tipoArranque;
                        datos.id = data.id;
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

                // Calcular Tiempo Arranque Preactor
                $.ajax({
                    type: "POST",
                    async: false,
                    url: "../api/calcularTiempoArranquePreactor/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).success(function (res) {
                    if (res) {
                        Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('SE_HAN_MODIFICADO_TIEMPO_ARRANQUE_SECUENCIADOR'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_TIEMPO_ARRANQUE'), 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                }).error(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_TIEMPO_ARRANQUE'), 4000);
                    }
                });

                // Calcular Tiempo Arranque Medio
                $.ajax({
                    type: "POST",
                    async: false,
                    url: "../api/calcularTiempoArranqueMedio/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).success(function (res) {
                    if (res) {
                        Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('SE_HAN_MODIFICADO_TIEMPO_ARRANQUE_MEDIO'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_TIEMPO_ARRANQUE_MEDIO'), 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                }).error(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_TIEMPO_ARRANQUE_MEDIO'), 4000);
                    }
                });

                self.dsTiempos.read();
            },
            confirmAsignarParametros: function (e) {
                var self = this;
                var permiso = TienePermiso(76);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $('#gridTiemposArranque').data('kendoGrid');

                if (grid.tbody.find('>tr.k-state-selected').length > 0 || self.registrosSelData.length > 0 ||
                    (self.registrosDesSelData.length > 0 && self.registrosDesSelData.length < self.dsTiempos.data().length)) {
                        if (e.currentTarget.id == "btnCalcularTiempoArranquePreactor") {
                            this.confirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('TIEMPOS_DE_ARRANQUE'),
                                msg: window.app.idioma.t('DESEA_REALMENTE_RECALCULAR_EL'),
                                funcion: function () {
                                    self.calcularTiempoArranquePreactor(e.currentTarget.id);
                                },
                                contexto: this
                            });
                        }
                } else {
                    Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                }
            },
            confirmAsignarArranques: function (e) {
                var self = this;
                var permiso = TienePermiso(76);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $('#gridTiemposArranque').data('kendoGrid');

                if (grid.tbody.find('>tr.k-state-selected').length > 0 || self.registrosSelData.length > 0 ||
                    (self.registrosDesSelData.length > 0 && self.registrosDesSelData.length < self.dsTiempos.data().length)) {
                        this.confirmacion = new VistaDlgConfirm({
                            titulo: window.app.idioma.t('TIEMPOS_DE_ARRANQUE'),
                            msg: window.app.idioma.t('DESEA_REALMENTE_CAMBIAR_LOS_TIEMPOS'),
                            funcion: function () {
                                self.AsignarArranques(e.currentTarget.id);
                            },
                            contexto: this
                        });
                        e.preventDefault();
                } else {
                    Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                }
            },
            AsignarArranques: function () {
                var self = this;
                var datos = {};
                datos.tiempo1 = $('#txtTiempoObjetivo1').val();
                datos.tiempo2 = $('#txtTiempoObjetivo2').val();
                datos.tiempopreact = $('#txtTiempoPreactor').val();
                datos.inhabilitarCalculo = $('#chkInhabilitarCalculoArranque').prop('checked');

                var arranques = [];
                var dataSource = $("#gridTiemposArranque").data("kendoGrid").dataSource;
                var filters = dataSource.filter();
                var allData = dataSource.data();
                var query = new kendo.data.Query(allData);
                var dataFiltered = query.filter(filters).data;

                if (self.selTodos) {
                    arranques = $.map(dataFiltered, function (data, i) {
                        var datos = {};
                        datos.numeroLinea = data.idLinea;
                        datos.idProductoEntrante = data.productoEntrante.codigo;
                        datos.descArranque = data.descArranque;
                        datos.id = data.id;

                        if (!_.findWhere(self.registrosDesSelData, datos)) {
                            return {
                                id: datos.id,
                                lineaProducto: window.app.idioma.t('LINEA') + ' ' + datos.numeroLinea + ' - ' +
                                    window.app.idioma.t('PRODUCTO_ENTRANTE') + ': ' + datos.idProductoEntrante + ' - ' +
                                    window.app.idioma.t('TIPO_ARRANQUE') + ': ' + datos.descArranque
                            };
                        }
                    });
                } else {
                    var arranques = $.map(dataFiltered, function (data, i) {
                        var datos = {};
                        datos.numeroLinea = data.idLinea;
                        datos.idProductoEntrante = data.productoEntrante.codigo;
                        datos.descArranque = data.descArranque;
                        datos.id = data.id;

                        if (_.findWhere(self.registrosSelData, datos)) {
                            return {
                                id: datos.id,
                                lineaProducto: window.app.idioma.t('LINEA') + ' ' + datos.numeroLinea + ' - ' +
                                    window.app.idioma.t('PRODUCTO_ENTRANTE') + ': ' + datos.idProductoEntrante + ' - ' +
                                    window.app.idioma.t('TIPO_ARRANQUE') + ': ' + datos.descArranque
                            };
                        }
                    });
                }

                datos.arranques = arranques;
                self.registrosDesSelData = [];
                self.registrosSelData = [];
                self.selTodos = false;
                self.$("#lblRegSel").text("");

                $.ajax({
                    type: "POST",
                    url: "../api/asignarTiemposArranque/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).success(function (res) {
                    if (res) {
                        self.dsTiempos.read();
                        Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('SE_HAN_ASIGNADO_TIEMPO_ARRANQUE'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ASIGNANDO_LOS_TIEMPOS_DE'), 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                }).error(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ASIGNANDO_LOS_TIEMPOS_DE'), 4000);
                    }
                });
            },
            limpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
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

                var gridElement = $("#gridTiemposArranque"),
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

        return tablaTiemposArranque;
    });
