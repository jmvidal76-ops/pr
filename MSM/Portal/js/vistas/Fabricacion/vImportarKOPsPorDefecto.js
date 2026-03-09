define(['underscore', 'backbone', 'jquery', 'text!../../../fabricacion/html/ImportarKOPsPorDefecto.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'definiciones'],
    function (_, Backbone, $, plantilla, Notificacion, VistaDlgConfirm, definicion) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            alturaGrid: null,
            gridKOPs: null,
            id: 'dlgImportarKOPs',
            IdZonaOrigen: null,
            IdZonaDestino: null,
            idTipoOrden: null,
            registrosDesSelDataKOPs: null,
            registrosSelDataKOPs: [],
            template: _.template(plantilla),
            tipoParametro: definicion.TipoParametro(),
            //#endregion ATTRIBUTES

            initialize: function (idZona, idTipoOrden) {
                var self = this;
                self.idTipoOrden = idTipoOrden
                self.IdZonaDestino = idZona;
                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());
                this.window = $(this.el).kendoWindow(
                    {
                        title: window.app.idioma.t('IMPORTAR_KOPS_UBICACION'),
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

                this.dialog = $('#dlgImportarKOPs').data("kendoWindow");
                this.dialog.center();
                kendo.ui.progress($("#center-pane"), false);

                self.registrosDesSelDataKOPs = [];

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerZonasKOPsPorTipoOrden/" + self.idTipoOrden,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.cmbZonasDestino = data;
                }).fail(function (xhr) {
                    Notificacion.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 2000);
                });

                self.Destino = self.cmbZonasDestino.find(x => x.idZona == self.IdZonaDestino)?.idZona;

                var _index = self.cmbZonasDestino.findIndex(x => x.IdZona == self.IdZonaDestino);

                $("#cmbSalaDestino").kendoDropDownList({
                    dataTextField: "DescripcionZona",
                    dataValueField: "IdZona",
                    dataSource: {
                        data: self.cmbZonasDestino.splice(_index, 1),
                        sort: { field: "DescripcionZona", dir: "asc" },
                    },
                    change: function (e) {
                        self.IdZonaDestino = this.value();
                    }
                }).data("kendoDropDownList");


                self.cmbZonasOrigen = self.cmbZonasDestino;
                self.IdZonaOrigen = self.cmbZonasOrigen[0].IdZona;

                $("#cmbSalaOrigen").kendoDropDownList({
                    dataTextField: "DescripcionZona",
                    dataValueField: "IdZona",
                    dataSource: {
                        data: self.cmbZonasOrigen,
                        sort: { field: "DescripcionZona", dir: "asc" },
                    },
                    change: function (e) {
                        self.IdZonaOrigen = this.value();
                        self.cargaGridKOPs();
                    }
                }).data("kendoDropDownList");

                self.cargaGridKOPs();
            },
            //#region EVENTOS
            events: {
                'click #btnAceptar': 'Aceptar',
                'click #btnCancelar': 'Cancelar',
                'click #btnSelTodosKOPs': function () { this.AplicarSeleccion("#gridKOPs", this.tipoParametro.KOPs); },
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

                    self.registrosDesSelDataKOPs = [];

                    for (var i = 0; i < dataFiltered.length; i++) {
                        var datos = {};
                        datos.Id = dataFiltered[i].IdValor.toString();
                        self.registrosDesSelDataKOPs.push(datos);
                    }
                } else {
                    grid.tbody.find('input:checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');
                    self.registrosDesSelDataKOPs = [];
                    self.registrosSelDataKOPs = [];
                }
            },
            //#endregion EVENTOS
            cargaGridKOPs: function () {
                var self = this;
                if ($("#gridKOPs").data("kendoGrid")) {
                    $("#gridKOPs").data("kendoGrid").destroy();
                }
                gridKOPs = $("#gridKOPs").kendoGrid({
                    dataSource: {
                        type: "json",
                        transport: {
                            read: "../api/ObtenerKOPsPorZonaTipo/" + self.IdZonaOrigen + "/" + self.idTipoOrden
                        },
                        pageSize: 200,
                        schema: {
                            model: {
                                id: "IdValor",
                                fields: {
                                    'IdValor': { type: "number" },
                                    'DescKop': { type: "string" },
                                    'Minimo': { type: "string" },
                                    'Maximo': { type: "string" },
                                    'Valor': { type: "string" },
                                }
                            }
                        }
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
                    dataBound: function () {
                        self.resizeGrid(self, "#gridKOPs");
                        self.ValidateCheck(self, "#gridKOPs", self.tipoParametro.KOPs);
                    },
                    toolbar: [
                        {
                            template: "<button type='button' id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        }
                    ],
                    columns: [
                        {
                            headerTemplate: '<input class="checkbox" id="btnSelTodosKOPs" name="btnSelTodos" type="checkbox" />',
                            template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                            width: 35
                        },
                        {
                            field: "IdValor",
                            hidden: true
                        },
                        {
                            field: "DescKop",
                            title: window.app.idioma.t("KOP"),
                            width: "200px",
                            attributes: {
                                style: 'white-space: nowrap '
                            }
                        },
                        {
                            field: "Minimo",
                            title: window.app.idioma.t("VALOR_MINIMO"),
                            width: "80px",
                            template: function (e) {
                                return self.ObtenerValor(e, "Minimo")
                            }
                        },
                        {
                            field: "Valor",
                            title: window.app.idioma.t("VALOR"),
                            width: "80px",
                            template: function (e) {
                                return self.ObtenerValor(e, "Valor")
                            }
                        },
                        {
                            field: "Maximo",
                            title: window.app.idioma.t("VALOR_MAXIMO"),
                            width: "80px",
                            template: function (e) {
                                return self.ObtenerValor(e, "Maximo")
                            }
                        }
                    ]
                }).data("kendoGrid");
            },
            eliminar: function () {
                this.remove();
            },
            ObtenerValor: function (datos, columna) {
                if (datos.Uom.toUpperCase() == "TS") {
                    if (datos[columna].toString() !== "") {
                        return "<div>" + kendo.toString(kendo.parseDate(kendo.toString(kendo.parseDate(datos[columna]), kendo.culture().calendars.standard.patterns.s) + "Z"), kendo.culture().calendars.standard.patterns.MES_FechaHora) + "</div>"
                    } else {
                        return "<div></div>"
                    }
                } else if (datos.Tipo == "float") {
                    if (datos[columna] !== "") {
                        if (datos.Uom == "hh:mm:ss") {
                            if (datos[columna] !== "") {
                                return "<div>" + ConversorHorasMinutosSegundos(datos[columna] * 3600) + "</div>"
                            } else {
                                return "<div></div>"
                            }

                        }
                        else {
                            return "<div>" + parseFloat(datos[columna]).toFixed(2).replace(".", ",") + "</div>"
                        }
                    } else {
                        return "<div></div>"
                    }
                } else {
                    return "<div>" + datos[columna] + "</div>"
                }
            },
            resizeGrid: function (self, idGrid) {

                var ventanaEmergente = $("#dlgImportarKOPs").height();
                var divCombos = $("#divCombos").height();
                //var filtrosHeight = $("#divFiltros").innerHeight();

                var gridElement = $(idGrid),
                    dataArea = gridElement.find(".k-grid-content"),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                self.alturaGrid = self.alturaGrid == null ? ventanaEmergente - otherElementsHeight - divCombos - 100 : self.alturaGrid;
                dataArea.height(self.alturaGrid);

            },
            ValidateCheck: function (self, id, tipo) {
                var grid = $(id).data("kendoGrid");
                $(id).find(".checkbox").bind("change", function (e) {

                    var checked = this.checked;
                    row = $(e.target).closest("tr");
                    dataItem = grid.dataItem(row);
                    //var idValue = grid.dataItem(row).get("idTiempoCambio");

                    var datos = {};
                    datos.Id = dataItem.IdValor.toString();

                    if (checked) {
                        row.addClass("k-state-selected");
                        var _registrosSelData = self.registrosDesSelDataKOPs;
                        var datafound = _.findWhere(_registrosSelData, datos);
                        index = _.indexOf(_registrosSelData, datafound);
                        if (index == -1) {
                            self.registrosDesSelDataKOPs.push(datos);
                        }
                    } else {
                        row.removeClass("k-state-selected");

                        var _registrosSelData = self.registrosDesSelDataKOPs;

                        var datafound = _.findWhere(_registrosSelData, datos);
                        index = _.indexOf(_registrosSelData, datafound);

                        if (index >= 0) {
                            self.registrosDesSelDataKOPs.splice(index, 1);
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
                        return self.registrosSelDataKOPs.some(function (data) {
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

                        return self.registrosSelDataKOPs.some(function (data) {
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
                var gridKOPsSeleccionado = self.registrosDesSelDataKOPs;
                var dataItemKOPsSeleccionado = "";

                for (var indexKOP of gridKOPsSeleccionado) {
                    if (dataItemKOPsSeleccionado == "") {
                        dataItemKOPsSeleccionado = indexKOP.Id;
                    } else {
                        dataItemKOPsSeleccionado += "," + indexKOP.Id;
                    }
                }

                if (dataItemKOPsSeleccionado !== "") {
                    $("#lblError").hide();
                    self.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('IMPORTAR_KOPS_POR')
                        , msg: window.app.idioma.t('CONFIRMAR_IMPORTAR_KOPS'), funcion: function () { self.ImportarKOPs(dataItemKOPsSeleccionado) }, contexto: this
                    });
                } else {
                    $("#lblError").show();
                    $("#lblError").html(window.app.idioma.t('SELECCIONAR_IMPORTAR_KOPS'));

                }
                kendo.ui.progress($("#divImportar"), false);

            },
            ImportarKOPs: function (KOPsSeleccionado) {
                var self = this;

                var Datos = {
                    IdZonaOrigen: self.IdZonaOrigen,
                    IdZonaDestino: self.IdZonaDestino,
                    ListaKOPs: KOPsSeleccionado
                };

                Date.prototype.toJSON = function () { return moment(this).format(); };
                kendo.ui.progress($("#divImportar"), true);
                $.ajax({
                    data: JSON.stringify(Datos),
                    type: "POST",
                    async: false,
                    url: "../api/ImportarKOPSPorDefectoPorZona",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (resultado) {
                        if (resultado) {
                            Notificacion.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HAN_MODIFICADO_PARAM_DEFECTO'), 3000);
                            $("#divMaterialesDefecto").data('kendoGrid').dataSource.read();
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
        });

        return vista;
    });

