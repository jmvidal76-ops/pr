define(['underscore', 'backbone', 'jquery', 'text!../../../fabricacion/html/ImportarKOPsMultivalorPorDefecto.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'definiciones'],
    function (_, Backbone, $, plantilla, Notificacion, VistaDlgConfirm, definicion) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            alturaGrid: null,
            gridKOPs: null,
            gridMostos: null,
            dsPosiciones: null,
            id: 'dlgImportarKOPsMultivalor',
            idZona: null,
            idTipoOrden: null,
            filaSeccionada: [],
            registrosDesSelDataKOPsPosicion: null,
            registrosDesSelDataMostos: null,
            registrosSelDataKOPsPosicion: [],
            registrosSelDataMostos: [],
            template: _.template(plantilla),
            tipoParametro: definicion.TipoParametro(),
            //#endregion ATTRIBUTES

            initialize: function (idZona, idTipoOrden) {
                var self = this;
                self.idZona = idZona;
                self.idTipoOrden = idTipoOrden.toString()
                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());
                this.window = $(this.el).kendoWindow(
                    {
                        title: window.app.idioma.t('IMPORTAR_KOPS_POR'),
                        width: "90%",
                        height: "90%",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: ["Close"],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                this.dialog = $('#dlgImportarKOPsMultivalor').data("kendoWindow");
                this.dialog.center();
                kendo.ui.progress($("#center-pane"), false);

                self.registrosDesSelDataKOPsPosicion = [];
                self.registrosDesSelDataMostos = [];

                self.resizeDiv();
                self.cargaGridKOPs();
                self.cargaGridMostos();
            },
            //#region EVENTOS
            events:
            {
                'click #btnLimpiarFiltroGridKOPs': 'LimpiarFiltroGrid',
                'click #btnAceptar': 'Aceptar',
                'click #btnCancelar': 'Cancelar',
                'click #btnSelTodosKOPs': function () { this.AplicarSeleccionKOPs("#gridKOPs"); },
                'click #btnSelTodos': function () { this.AplicarSeleccion("#gridMostos"); }
            },
            eventsPosiciones: function (self, PK, gridSeleccionada) {
                var posicion = 0;
                gridSeleccionada.find("#btnSelTodasPosiciones" + PK).click(function () {
                    self.AplicarSeleccionPosicion(gridSeleccionada);
                });
            },
            AplicarSeleccion: function (id, tipo) {
                var self = this;
                var grid = $(id).data('kendoGrid');
                var _chkAll = $(id).find("input[name='btnSelTodos']:checked").length > 0 ? true : false;

                self.selTodos = _chkAll;

                if (self.selTodos) {
                    grid.tbody.find('input:checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var dataSource = grid.dataSource;
                    var filters = dataSource.filter();
                    var allData = dataSource.data();
                    var query = new kendo.data.Query(allData);
                    var dataFiltered = query.filter(filters).data;

                    self.registrosDesSelDataMostos = [];

                    for (var i = 0; i < dataFiltered.length; i++) {
                        var datos = {};
                        datos.Id = dataFiltered[i].NombreMosto;
                        self.registrosDesSelDataMostos.push(datos);
                    }
                } else {
                    grid.tbody.find('input:checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');
                    self.registrosDesSelDataMostos = [];
                    self.registrosSelDataMostos = [];
                }
            },
            AplicarSeleccionKOPs: function (id, tipo) {
                var self = this;
                var grid = $(id).data('kendoGrid');
                var _chkAll = $(id).find("input[name='btnSelTodosKOPs']:checked").length > 0 ? true : false;

                self.selTodos = _chkAll;

                if (self.selTodos) {
                    grid.tbody.find('input:checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var dataSource = grid.dataSource;
                    var filters = dataSource.filter();
                    var allData = dataSource.data();
                    var query = new kendo.data.Query(allData);
                    var dataFiltered = query.filter(filters).data;

                    self.registrosDesSelDataKOPsPosicion = [];
                    
                    
                    for (var i = 0; i < dataFiltered.length; i++) {
                        self.cargarDatosInitDefecto(self, dataFiltered[i]);
                        self.dsPosiciones.forEach(function (pos, idx) {
                            var datos = {};
                            datos.Id = pos.COD_KOP

                            var _registrosSelData = self.registrosDesSelDataKOPsPosicion;
                            var datafound = _.findWhere(_registrosSelData, datos);
                            index = _.indexOf(_registrosSelData, datafound);
                            if (index == -1) {
                                tipo = self.registrosDesSelDataKOPsPosicion.push(datos);
                            }
                        });
                    }
                    self.selTodosMultivalor = true;
                } else {
                   
                    grid.tbody.find('input:checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');
                    self.registrosDesSelDataKOPsPosicion = [];
                    self.registrosSelDataKOPsPosicion = [];
                    self.selTodosMultivalor = false;


                }
            },
            AplicarSeleccionPosicion: function (id) {
                var self = this;
                var grid = id.data('kendoGrid');
                var _chkAll = $(id).find("input[name='btnSelTodasMultivalorPosicion']:checked").length > 0 ? true : false;
                var dataItem = self.dataItemMaestroKopsMultivalorSeleccionado;

                self.selTodos = _chkAll;

                var dataSource = grid.dataSource;
                var filters = dataSource.filter();
                var allData = dataSource.data();
                var query = new kendo.data.Query(allData);
                var dataFiltered = query.filter(filters).data;

                if (self.selTodos) {
                    $('#btnSelTodosKOPsMultivalor' + dataItem.PK).prop("checked", true);
                    grid.tbody.find('input:checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');
                    for (var i = 0; i < dataFiltered.length; i++) {
                        var datos = {};
                        datos.Id = dataFiltered[i].COD_KOP

                        var _registrosSelData = self.registrosDesSelDataKOPsPosicion;
                        var datafound = _.findWhere(_registrosSelData, datos);
                        index = _.indexOf(_registrosSelData, datafound);
                        if (index == -1) {
                            tipo = self.registrosDesSelDataKOPsPosicion.push(datos);
                        }
                    }

                } else {
                    $('#btnSelTodosKOPsMultivalor' + dataItem.PK).prop("checked", false);
                    grid.tbody.find('input:checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');

                    for (var i = 0; i < dataFiltered.length; i++) {
                        var datos = {};
                        datos.Id = dataFiltered[i].COD_KOP

                        var _registrosSelData = self.registrosDesSelDataKOPsPosicion;
                        var datafound = _.findWhere(_registrosSelData, datos);
                        index = _.indexOf(_registrosSelData, datafound);
                        if (index >=0) {
                           tipo = self.registrosDesSelDataKOPsPosicion.splice(index, 1);
                        }
                    }
                }
            },
            //#endregion EVENTOS
            cargaGridKOPs: function () {
                var self = this;
                gridKOPs = $("#gridKOPs").kendoGrid({
                    dataSource: {
                        type: "json",
                        transport: {
                            read: "../api/ObtenerListadoMaestroKOPsMultivalorPorZonaTipo/" + self.idZona + "/" + self.idTipoOrden
                        },
                        pageSize: 200,
                        schema: {
                            model: {
                                id: "PK",
                                fields: {
                                    'PK': { type: "string" },
                                    'ID_ORDEN': { type: "string" },
                                    'COD_KOP': { type: "string" },
                                    'NAME': { type: "string" },
                                    'PROCCESS': { type: "string" },
                                    'MEDIDA': { type: "string" },
                                    'TIPO': { type: "string" },
                                    'DATATYPE': { type: "string" }
                                }
                            }
                        },
                        sort: { field: "ID_ORDEN", dir: "desc" }
                    },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: [200, 400, 600],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    detailTemplate: kendo.template(this.$("#templateDetalleKopMultivalor").html()),
                    detailInit: function (e) {
                        $("#divMaterialesDefecto").data("kendoGrid").clearSelection();
                        self.masterRow = e;
                        $("#divMaterialesDefecto").data("kendoGrid").select(e.masterRow);
                        self.dataItemMaestroKopsMultivalorSeleccionado = e.sender.dataItem(e.masterRow);
                        self.detailInitDefecto(e);
                    },
                    detailExpand: function (e) {

                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                        self.masterRow = e;
                        $("#divMaterialesDefecto").data("kendoGrid").select(e.masterRow);
                        self.dataItemMaestroKopsMultivalorSeleccionado = e.sender.dataItem(e.masterRow);
                    },
                    dataBound: function () {
                        self.resizeGridKOPs();
                        self.ValidateCheckMultivalor(self, "#gridKOPs", self.tipoParametro.KOPs);
                    },
                    toolbar: [
                        {
                            template: "<button type='button' id='btnLimpiarFiltroGridKOPs' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        }
                    ],
                    columns: [
                        {
                            headerTemplate: '<input class="checkbox" id="btnSelTodosKOPs" name="btnSelTodosKOPs" type="checkbox" />',
                            template: '<input class="checkbox" id="btnSelTodosKOPsMultivalor#=PK#" name="btnSelTodasMultivalor" type="checkbox" style="width: 14px;	height: 14px;" />',
                            width: 35
                        },
                        {
                            field: "PK",
                            title: window.app.idioma.t("N_KOPMULTIVALOR"),
                            width: 200
                        },
                        {
                            field: "COD_KOP",
                            template: "#=COD_KOP + ' - ' + NAME#",
                            title: window.app.idioma.t("KOPS_PROCESO"),
                            width: 150,
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                        },
                        {
                            template: "#= PROCCESS #",
                            field: "COD_PROCCESS",
                            title: window.app.idioma.t("PROCEDIMIENTO"),
                            width: 150,
                            filteable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=COD_PROCCESS#' style='width: 14px;height:14px;margin-right:5px;'/>#= PROCCESS # </label></div>";
                                    }
                                }
                            }
                        }
                    ]
                }).data("kendoGrid");
            },
            cargaGridMostos: function () {
                var self = this;
                if ($("#gridMostos").data("kendoGrid")) {
                    $("#gridMostos").data("kendoGrid").destroy();
                }
                gridMostos = $("#gridMostos").kendoGrid({
                    dataSource: {
                        type: "json",
                        transport: {
                            read: "../api/ObtenerMostosPorZonaTipo/" + self.idZona + "/" + self.idTipoOrden
                        },
                        pageSize: 50
                    },
                    selectable: "multiple,row",
                    sortable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    dataBound: function () {
                        self.resizeGridMosto();
                        self.ValidateCheckMosto(self, "#gridMostos", self.tipoParametro.KOPs);
                    },
                    toolbar: [
                        {
                            template: "<button type='button' id='btnLimpiarFiltroGridMostos' style='float:right; visibility: hidden;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        }
                    ],
                    columns: [
                        {
                            headerTemplate: '<input class="checkbox" id="btnSelTodos" name="btnSelTodos" type="checkbox" />',
                            template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                            width: 35
                        },
                        {
                            field: "NombreMosto",
                            title: window.app.idioma.t("ID_MATERIAL")
                        },
                        {
                            field: "DescripcionMosto",
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL")
                        }]
                }).data("kendoGrid");
            },
            detailInitDefecto: function (e) {
                var self = this;
                var detailRow = e.detailRow;
                var datos = e.data;

                self.idZona = $("#cmbZonas").data("kendoDropDownList").value();

                self.cargarDatosInitDefecto(self,datos);

                //if(se)


                if (detailRow.find("#divDetalleMaestroKOPMultivalorCurva").data("kendoGrid")) {
                    detailRow.find("#divDetalleMaestroKOPMultivalorCurva").data("kendoGrid").destroy()
                }

                self.filaseleccionada = detailRow.find("#divDetalleMaestroKOPMultivalorCurva");
                self.gridMaestroCurva = detailRow.find("#divDetalleMaestroKOPMultivalorCurva").kendoGrid({
                    sortable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    dataBound: function (e) {
                        self.eventsPosiciones(self, datos.PK, detailRow.find("#divDetalleMaestroKOPMultivalorCurva"));
                        self.ValidatePositionCheck(self, detailRow.find("#divDetalleMaestroKOPMultivalorCurva"), e.sender);
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: [200, 400, 600],
                        buttonCount: 200,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            headerTemplate: '<input class="checkbox" id="btnSelTodasPosiciones' + datos.PK + '" name="btnSelTodasMultivalorPosicion" type="checkbox" />',
                            template: '<input class="checkbox"  id="btnSelPosicion" name="btnSelPosicion" type="checkbox" style="width: 14px;	height: 14px;" />',
                            width: 35
                        },
                        {
                            field: "INDEX",
                            title: window.app.idioma.t("INDICE")
                        },
                        {
                            field: "NAME",
                            template: "#=NAME + ' - Posicion ' + INDEX#",
                            title: window.app.idioma.t("DESCRIPCION")
                        },
                        {
                            field: "VALOR_MINIMO",
                            title: window.app.idioma.t("VALOR_MINIMO"),
                            template: function (e) {
                                return self.ObtenerValor(e, "VALOR_MINIMO")

                            }
                        },
                        {
                            field: "VALOR",
                            title: window.app.idioma.t("VALOR"),
                            template: function (e) {
                                return self.ObtenerValor(e, "VALOR")

                            }
                        },
                        {
                            field: "VALOR_MAXIMO",
                            title: window.app.idioma.t("VALOR_MAXIMO"),
                            template: function (e) {
                                return self.ObtenerValor(e, "VALOR_MAXIMO")
                            }

                        }
                    ]
                }).data("kendoGrid");

                var dataSource = new kendo.data.DataSource({ data: self.dsPosiciones, pageSize: 200 });
                var grid = detailRow.find("#divDetalleMaestroKOPMultivalorCurva").data("kendoGrid");
                dataSource.read();
                grid.setDataSource(dataSource);
                self.resizeGrid(self, "#divDetalleMaestroKOPMultivalorCurva");

                var Cadena = {};
                Cadena.Id = datos.PK + datos.PROCCESS;
                var _filaSeccionada = self.filaSeccionada;
                var datafound = _.findWhere(_filaSeccionada, Cadena);
                index = _.indexOf(_filaSeccionada, datafound);

                if (self.selTodosMultivalor && index == 0) {
                    detailRow.find("#divDetalleMaestroKOPMultivalorCurva").data("kendoGrid").tbody.find('input:checkbox').prop("checked", true);
                    detailRow.find("#divDetalleMaestroKOPMultivalorCurva").data("kendoGrid").tbody.find(">tr").addClass('k-state-selected');
                } else {
                    detailRow.find("#divDetalleMaestroKOPMultivalorCurva").data("kendoGrid").tbody.find('input:checkbox').prop("checked", false);
                    detailRow.find("#divDetalleMaestroKOPMultivalorCurva").data("kendoGrid").tbody.find(">tr").removeClass('k-state-selected');
                }

            },
            cargarDatosInitDefecto: function (self, datos) {

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerListadoKOPsMultivalorExpandidoPorZonaKOPTipo/" + self.idZona + "/" + datos.PK + "/" + datos.COD_PROCCESS + "/" + self.idTipoOrden,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: false
                }).done(function (searchResults) {
                    self.dsPosiciones = searchResults
                }).fail(function (xhr) {
                    Notificacion.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 2000);
                });
            },
            eliminar: function () {
                this.remove();
            },
            ObtenerValor: function (datos, columna) {
                if (datos.DATATYPE == "float") {
                    if (datos[columna] !== "") {
                        return "<div>" + parseFloat(datos[columna]).toFixed(2).replace(".", ",") + "</div>"
                    } else {
                        return "<div>" + datos[columna] + "</div>"
                    }
                } else {
                    return "<div>" + datos[columna] + "</div>"
                }
            },
            resizeGridKOPs: function () {
                var self = this;
                var ventanaEmergente = $("#dlgImportarKOPsMultivalor").height();
                var divGrids = $("#divGrids").height();

                var gridElement = $("#gridKOPs"),
                    dataArea = gridElement.find(".k-grid-content"),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                var _altura = ventanaEmergente - otherElementsHeight - divGrids - 115;
                dataArea.height(_altura);

            },
            resizeGridMosto: function () {
                var self = this;
                var ventanaEmergente = $("#dlgImportarKOPsMultivalor").height();
                var divGrids = $("#divGrids").height();

                var gridElement = $("#gridMostos"),
                    dataArea = gridElement.find(".k-grid-content"),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                var _altura = ventanaEmergente - otherElementsHeight - divGrids - 140;
                dataArea.height(_altura);

            },
            resizeDiv: function () {
                var ventanaEmergente = $("#dlgImportarKOPsMultivalor").height();
                var divGrids = $("#divGrids").height();

                $("#divIzquierda,#divDerecha").height(ventanaEmergente - divGrids - 100);
            },
            ValidateCheckMultivalor: function (self, elemento, tipo) {
                var grid = $(elemento).data("kendoGrid");
                $(elemento).find(".checkbox").bind("change", function (e) {

                    var checked = this.checked;
                    row = $(e.target).closest("tr");
                    dataItem = grid.dataItem(row);
                    //var idValue = grid.dataItem(row).get("idTiempoCambio");

                    self.cargarDatosInitDefecto(self, dataItem);

                    if (checked) {
                        row.addClass("k-state-selected");
                        self.dsPosiciones.forEach(function (pos, idx) {
                            var datos = {};
                            datos.Id = pos.COD_KOP

                            var _registrosSelData = self.registrosDesSelDataKOPsPosicion;
                            var datafound = _.findWhere(_registrosSelData, datos);
                            index = _.indexOf(_registrosSelData, datafound);
                            if (index == -1) {
                                tipo = self.registrosDesSelDataKOPsPosicion.push(datos);
                            }

                        });
                        var _filaSeccionada = self.filaSeccionada;
                        var datos = {};
                        datos.Id = dataItem.PK + dataItem.PROCCESS;
                        var datafound = _.findWhere(_filaSeccionada, datos);
                        index = _.indexOf(_filaSeccionada, datafound);
                        if (index == -1) {
                            self.filaSeccionada.push(datos);
                            if (self.masterRow) {
                                $('#btnSelTodasPosiciones' + dataItem.PK).prop("checked", true);
                                if (self.masterRow.detailRow.find("#divDetalleMaestroKOPMultivalorCurva").data("kendoGrid")) {
                                    self.masterRow.detailRow.find("#divDetalleMaestroKOPMultivalorCurva").data("kendoGrid").tbody.find(">tr").find('input:checkbox').prop("checked", true);
                                    self.masterRow.detailRow.find("#divDetalleMaestroKOPMultivalorCurva").data("kendoGrid").tbody.find(">tr").addClass('k-state-selected');
                                }
                            }
                        }
                        self.selTodosMultivalor = true;
                    } else {
                        row.removeClass("k-state-selected");
                        self.dsPosiciones.forEach(function (pos, idx) {
                            var datos = {};
                            datos.Id = pos.COD_KOP
                            var _registrosSelData = tipo = self.registrosDesSelDataKOPsPosicion;
                            var datafound = _.findWhere(_registrosSelData, datos);
                            index = _.indexOf(_registrosSelData, datafound);
                            if (index >= 0) {
                                tipo = self.registrosDesSelDataKOPsPosicion.splice(index, 1);
                            }
                        });

                        var _filaSeccionada = self.filaSeccionada;
                        var datos = {};
                        datos.Id = dataItem.PK + dataItem.PROCCESS;
                        var datafound = _.findWhere(_filaSeccionada, datos);
                        index = _.indexOf(_filaSeccionada, datafound);
                        if (index >= 0) {
                            tipo = self.filaSeccionada.splice(index, 1);
                            if (self.masterRow) {
                                $('#btnSelTodasPosiciones' + dataItem.PK).prop("checked", false);
                                if (self.masterRow.detailRow.find("#divDetalleMaestroKOPMultivalorCurva").data("kendoGrid")) {
                                    self.masterRow.detailRow.find("#divDetalleMaestroKOPMultivalorCurva").data("kendoGrid").tbody.find(">tr").find('input:checkbox').prop("checked", false);
                                    self.masterRow.detailRow.find("#divDetalleMaestroKOPMultivalorCurva").data("kendoGrid").tbody.find(">tr").removeClass('k-state-selected');
                                }
                            }
                            if (self.filaSeccionada.length == 0) {
                                self.selTodosMultivalor = false;
                            }
                        } else {
                            self.selTodosMultivalor = false;
                        }
                    }

                });

                if (self.selTodosMultivalor) {
                    grid.tbody.find('input:checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var items = grid.items();

                    var listItems = [];
                    listItems = $.grep(items, function (row) {
                        var dataItem = grid.dataItem(row);
                        return self.registrosSelDataKOPsPosicion.some(function (data) {
                            return data.id == dataItem.id;
                        });
                    });

                    listItems.forEach(function (row, idx) {
                        $(row.cells[0])[0].childNodes[0].checked = false;
                        $(row).closest("tr").removeClass("k-state-selected");
                    });
                } else {
                    grid.tbody.find('input:checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');

                    var items = grid.items();

                    var listItems = [];
                    listItems = $.grep(items, function (row) {
                        var dataItem = grid.dataItem(row);

                        return self.registrosSelDataKOPsPosicion.some(function (data) {
                            return data.id == dataItem.id;
                        });

                    });

                    listItems.forEach(function (row, idx) {
                        $(row.cells[0])[0].childNodes[0].checked = true;
                        $(row).closest("tr").addClass("k-state-selected");
                    });
                }


            },
            ValidateCheckMosto: function (self, elemento, tipo) {
                var grid = $(elemento).data("kendoGrid");
                $(elemento).find(".checkbox").bind("change", function (e) {

                    var checked = this.checked;
                    row = $(e.target).closest("tr");
                    dataItem = grid.dataItem(row);
                    //var idValue = grid.dataItem(row).get("idTiempoCambio");

                    var datos = {};
                    datos.Id = dataItem.NombreMosto;

                    if (checked) {
                        row.addClass("k-state-selected");
                        var _registrosSelData = self.registrosDesSelDataMostos;
                        var datafound = _.findWhere(_registrosSelData, datos);
                        index = _.indexOf(_registrosSelData, datafound);
                        if (index == -1) {
                            tipo = self.registrosDesSelDataMostos.push(datos);
                        }
                    } else {
                        row.removeClass("k-state-selected");

                        var _registrosSelData = self.registrosDesSelDataMostos;

                        var datafound = _.findWhere(_registrosSelData, datos);
                        index = _.indexOf(_registrosSelData, datafound);

                        if (index >= 0) {
                            tipo = self.registrosDesSelDataMostos.splice(index, 1);
                        }
                    }
                });

                if (self.selTodos) {
                    grid.tbody.find('input:checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var items = grid.items();

                    var listItems = [];
                    listItems = $.grep(items, function (row) {
                        var dataItem = grid.dataItem(row);
                        if (tipo == self.tipoParametro.KOPs) {
                            return self.registrosSelDataKOPsPosicion.some(function (data) {
                                return data.id == dataItem.id;
                            });
                        } else {
                            return self.registrosSelDataMostos.some(function (data) {
                                return data.id == dataItem.id;
                            });
                        }
                    });

                    listItems.forEach(function (row, idx) {
                        $(row.cells[0])[0].childNodes[0].checked = false;
                        $(row).closest("tr").removeClass("k-state-selected");
                    });
                } else {
                    grid.tbody.find('input:checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');

                    var items = grid.items();

                    var listItems = [];
                    listItems = $.grep(items, function (row) {
                        var dataItem = grid.dataItem(row);

                        if (tipo == self.tipoParametro.KOPs) {
                            return self.registrosSelDataKOPsPosicion.some(function (data) {
                                return data.id == dataItem.id;
                            });
                        } else {
                            return self.registrosSelDataMostos.some(function (data) {
                                return data.id == dataItem.id;
                            });
                        }

                    });

                    listItems.forEach(function (row, idx) {
                        $(row.cells[0])[0].childNodes[0].checked = true;
                        $(row).closest("tr").addClass("k-state-selected");
                    });
                }


            },
            ValidatePositionCheck: function (self, elemento) {
                let grid = $('#divDetalleMaestroKOPMultivalorCurva').data('kendoGrid');
                $(elemento).find(".checkbox").bind("change", function (e) {
                    //let grid = $('#divDetalleMaestroKOPMultivalorCurva').data('kendoGrid');
                    var checked = this.checked;
                    row = $(e.target).closest("tr");
                    dataItem = grid.dataItem(row);
                    //var idValue = grid.dataItem(row).get("idTiempoCambio");

                    var datos = {};
                    datos.Id = dataItem.COD_KOP.toString();

                    if (checked) {
                        row.addClass("k-state-selected");
                        var _registrosSelData = self.registrosDesSelDataKOPsPosicion;
                        var datafound = _.findWhere(_registrosSelData, datos);
                        index = _.indexOf(_registrosSelData, datafound);
                        if (index == -1) {
                            tipo = self.registrosDesSelDataKOPsPosicion.push(datos);
                        }

                    } else {
                        row.removeClass("k-state-selected");
                        var _registrosSelData = self.registrosDesSelDataKOPsPosicion;

                        var datafound = _.findWhere(_registrosSelData, datos);
                        index = _.indexOf(_registrosSelData, datafound);

                        if (index >= 0) {
                            tipo = self.registrosDesSelDataKOPsPosicion.splice(index, 1);
                        }

                    }
                });

                if (self.selTodosMultivalor) {
                    grid.tbody.find('input:checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var items = grid.items();

                    var listItems = [];
                    listItems = $.grep(items, function (row) {
                        var dataItem = grid.dataItem(row);
                        return self.registrosDesSelDataKOPsPosicion.some(function (data) {
                            return data.id == dataItem.id;
                        });
                    });

                    listItems.forEach(function (row, idx) {
                        $(row.cells[0])[0].childNodes[0].checked = false;
                        $(row).closest("tr").removeClass("k-state-selected");
                    });
                } else {
                    grid.tbody.find('input:checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');

                    var items = grid.items();

                    var listItems = [];
                    listItems = $.grep(items, function (row) {
                        var dataItem = grid.dataItem(row);

                        return self.registrosDesSelDataKOPsPosicion.some(function (data) {
                            return data.id == dataItem.id;
                        });

                    });

                    listItems.forEach(function (row, idx) {
                        $(row.cells[0])[0].childNodes[0].checked = true;
                        $(row).closest("tr").addClass("k-state-selected");
                    });
                }


            },
            Aceptar: function (e) {
                var self = this;
                kendo.ui.progress($("#divImportar"), true);

                var gridPosicioneSeleccionado = self.registrosDesSelDataKOPsPosicion;
                var dataItemPosicionesSeleccionado = "";


                var gridMostoSeleccionado = self.registrosDesSelDataMostos;
                var dataItemMostosSeleccionado = "";

                for (var indexPosicion of gridPosicioneSeleccionado) {
                    if (dataItemPosicionesSeleccionado == "") {
                        dataItemPosicionesSeleccionado = indexPosicion.Id;
                    } else {
                        dataItemPosicionesSeleccionado += "," + indexPosicion.Id;
                    }
                }

                for (var indexMosto of gridMostoSeleccionado) {
                    if (dataItemMostosSeleccionado == "") {
                        dataItemMostosSeleccionado = indexMosto.Id;
                    } else {
                        dataItemMostosSeleccionado += "," + indexMosto.Id;
                    }
                }

                if (dataItemMostosSeleccionado !== "" && dataItemPosicionesSeleccionado !== "") {
                    $("#lblError").hide();
                    self.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('IMPORTAR_KOPS_POR')
                        , msg: window.app.idioma.t('CONFIRMAR_IMPORTAR_KOPS'), funcion: function () { self.ImportarKOPs(dataItemPosicionesSeleccionado, dataItemMostosSeleccionado); }, contexto: this
                    });
                } else {
                    $("#lblError").show();
                    $("#lblError").html(window.app.idioma.t('SELECCIONAR_IMPORTAR_KOPS'));

                }
                kendo.ui.progress($("#divImportar"), false);

            },
            ImportarKOPs: function (KOPsPosicionesSeleccionado, MostosSeleccionados) {
                var self = this;

                var Datos = {
                    ListaKOPs: KOPsPosicionesSeleccionado,
                    ListaMostos: MostosSeleccionados
                };

                Date.prototype.toJSON = function () { return moment(this).format(); };
                kendo.ui.progress($("#divImportar"), true);
                $.ajax({
                    data: JSON.stringify(Datos),
                    type: "POST",
                    async: false,
                    url: "../api/ImportarKOPSMultivalorPorDefectoAMostos",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (resultado) {
                        if (resultado) {
                            Notificacion.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HAN_MODIFICADO_CORRECTAMENTE') + MostosSeleccionados, 3000);
                            $("#divMosto").data('kendoGrid').dataSource.read();
                            kendo.ui.progress($("#divImportar"), false);

                            self.Cancelar();
                        } else {
                            $("#lblError").show();
                            $("#lblError").html(window.app.idioma.t('ERROR_AL_MODIFICAR_LOS_VALORES'));
                            kendo.ui.progress($("#divImportar"), false);
                        }
                    },
                    error: function () {
                        $("#lblError").show();
                        $("#lblError").html(window.app.idioma.t('ERROR_AL_MODIFICAR_LOS_VALORES'));
                    }
                });

                self.confirmacion.finProceso();
            },
            Cancelar: function (e) {
                var self = this;
                self.window.destroy();
                self.window = null;
            },
            LimpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
        });

        return vista;
    });

