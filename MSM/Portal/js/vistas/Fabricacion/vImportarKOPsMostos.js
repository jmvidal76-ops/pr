define(['underscore', 'backbone', 'jquery', 'text!../../../fabricacion/html/ImportarKOPsMostos.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'definiciones'],
    function (_, Backbone, $, plantilla, Notificacion, VistaDlgConfirm, definicion) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            alturaGrid: null,
            gridKOPs: null,
            gridMostos: null,
            id: 'dlgImportarKOPs',
            idZona: null,
            idTipoOrden: null,
            registrosDesSelDataKOPs: null,
            registrosDesSelDataMostos: null,
            registrosSelDataKOPs: [],
            registrosSelDataMostos: [],
            template: _.template(plantilla),
            tipoParametro: definicion.TipoParametro(),
            //#endregion ATTRIBUTES

            initialize: function (idZona, idTipoOrden) {
                var self = this;
                self.idZona = idZona;
                self.idTipoOrden = idTipoOrden
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

                this.dialog = $('#dlgImportarKOPs').data("kendoWindow");
                this.dialog.center();
                kendo.ui.progress($("#center-pane"), false);

                self.registrosDesSelDataKOPs = [];
                self.registrosDesSelDataMostos = [];

                self.resizeDiv();
                self.cargaGridKOPs();
                self.cargaGridMostos();
            },
            //#region EVENTOS
            events: {
                'click #btnLimpiarFiltrosKOPs': 'LimpiarFiltroGrid',
                'click #btnAceptar': 'Aceptar',
                'click #btnCancelar': 'Cancelar',
                'click #btnSelTodosKOPs': function () { this.AplicarSeleccion("#gridKOPs", this.tipoParametro.KOPs); },
                'click #btnSelTodos': function () { this.AplicarSeleccion("#gridMostos", this.tipoParametro.Mosto); }
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

                    tipo == self.tipoParametro.KOPs ? self.registrosDesSelDataKOPs = [] : self.registrosDesSelDataMostos = [];

                    for (var i = 0; i < dataFiltered.length; i++) {
                        var datos = {};
                        datos.Id = tipo == self.tipoParametro.KOPs ? dataFiltered[i].IdValor.toString() : dataFiltered[i].NombreMosto;
                        tipo == self.tipoParametro.KOPs ? self.registrosDesSelDataKOPs.push(datos) : self.registrosDesSelDataMostos.push(datos);
                    }
                } else {
                    grid.tbody.find('input:checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');
                    tipo == self.tipoParametro.KOPs ? self.registrosDesSelDataKOPs = [] : self.registrosDesSelDataMostos = [];
                    tipo == self.tipoParametro.KOPs ? self.registrosSelDataKOPs = [] : self.registrosSelDataMostos = [];
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
                            read: "../api/ObtenerKOPsPorZonaTipo/" + self.idZona + "/" + self.idTipoOrden
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
                            template: "<button type='button' id='btnLimpiarFiltrosKOPs' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
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
                        pageSize: 200,
                        schema: {
                            model: {
                                id: "IdMaterial",
                                fields: {
                                    'IdMaterial': { type: "number" },
                                    'NombreMosto': { type: "string" },
                                    'DescripcionMosto': { type: "string" }
                                }
                            }
                        }
                    },
                    sortable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    dataBound: function () {
                        self.resizeGrid(self, "#gridMostos");
                        self.ValidateCheck(self, "#gridMostos", self.tipoParametro.Mosto);
                    },
                    toolbar: [
                        {
                            template: "<button type='button' id='btnLimpiarFiltrosMostos' style='float:right; visibility: hidden;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        }
                    ],
                    columns: [
                        {
                            headerTemplate: '<input class="checkbox" id="btnSelTodos" name="btnSelTodos" type="checkbox" />',
                            template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                            width: 35
                        },
                        {
                            field: "IdMaterial",
                            hidden: true
                        },
                        {
                            field: "NombreMosto",
                            title: window.app.idioma.t("ID_MATERIAL")
                        }, {
                            field: "DescripcionMosto",
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL")
                        }]
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
                var divGrids = $("#divGrids").height();

                var gridElement = $(idGrid),
                    dataArea = gridElement.find(".k-grid-content"),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                self.alturaGrid = self.alturaGrid == null ? ventanaEmergente - otherElementsHeight - divGrids - 135 : self.alturaGrid;
                dataArea.height(self.alturaGrid);

            },
            resizeDiv: function () {
                var ventanaEmergente = $("#dlgImportarKOPs").height();
                var divGrids = $("#divGrids").height();

                $("#divIzquierda,#divDerecha").height(ventanaEmergente - divGrids - 100);
            },
            ValidateCheck: function (self, id, tipo) {
                var grid = $(id).data("kendoGrid");
                $(id).find(".checkbox").bind("change", function (e) {

                    var checked = this.checked;
                    row = $(e.target).closest("tr");
                    dataItem = grid.dataItem(row);
                    //var idValue = grid.dataItem(row).get("idTiempoCambio");

                    var datos = {};
                    datos.Id = tipo == self.tipoParametro.KOPs ? dataItem.IdValor.toString() : dataItem.NombreMosto;
                    
                    if (checked) {
                        row.addClass("k-state-selected");
                        var _registrosSelData = tipo == self.tipoParametro.KOPs ? self.registrosDesSelDataKOPs : self.registrosDesSelDataMostos;
                        var datafound = _.findWhere(_registrosSelData, datos);
                        index = _.indexOf(_registrosSelData, datafound);
                        if (index == -1) {
                            tipo == self.tipoParametro.KOPs ? self.registrosDesSelDataKOPs.push(datos) : self.registrosDesSelDataMostos.push(datos);
                        }
                    } else {
                        row.removeClass("k-state-selected");

                        var _registrosSelData = tipo == self.tipoParametro.KOPs ? self.registrosDesSelDataKOPs : self.registrosDesSelDataMostos;

                        var datafound = _.findWhere(_registrosSelData, datos);
                        index = _.indexOf(_registrosSelData, datafound);

                        if (index >= 0) {
                            tipo == self.tipoParametro.KOPs ? self.registrosDesSelDataKOPs.splice(index, 1) : self.registrosDesSelDataMostos.splice(index, 1);
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
                            return self.registrosSelDataKOPs.some(function (data) {
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
                            return self.registrosSelDataKOPs.some(function (data) {
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
            Aceptar: function (e) {
                var self = this;
                kendo.ui.progress($("#divImportar"), true);
                var gridKOPsSeleccionado = self.registrosDesSelDataKOPs;
                var dataItemKOPsSeleccionado = "";
                
                var gridMostoSeleccionado = self.registrosDesSelDataMostos;
                var dataItemMostosSeleccionado = "";

                for (var indexKOP of gridKOPsSeleccionado) {
                    if (dataItemKOPsSeleccionado == "") {
                        dataItemKOPsSeleccionado = indexKOP.Id;
                    } else {
                        dataItemKOPsSeleccionado += "," + indexKOP.Id;
                    }
                }

                for (var indexMosto of gridMostoSeleccionado) {
                    if (dataItemMostosSeleccionado == "") {
                        dataItemMostosSeleccionado = indexMosto.Id;
                    } else {
                        dataItemMostosSeleccionado += "," + indexMosto.Id;
                    }
                }

                if (dataItemMostosSeleccionado !== "" && dataItemKOPsSeleccionado !== "") {
                    $("#lblError").hide();
                        self.confirmacion = new VistaDlgConfirm({
                            titulo: window.app.idioma.t('IMPORTAR_KOPS_POR')
                            , msg: window.app.idioma.t('CONFIRMAR_IMPORTAR_KOPS'), funcion: function () { self.ImportarKOPs(dataItemKOPsSeleccionado,dataItemMostosSeleccionado); }, contexto: this
                        });
                } else {
                    $("#lblError").show();
                    $("#lblError").html(window.app.idioma.t('SELECCIONAR_IMPORTAR_KOPS_MOSTO'));
                    
                }
                kendo.ui.progress($("#divImportar"), false);

            },
            ImportarKOPs: function (KOPsSeleccionado,MostosSeleccionados) {
                var self = this;

                var Datos = {
                    IdZonaDestino: self.idZona,
                    ListaKOPs: KOPsSeleccionado,
                    ListaMostos: MostosSeleccionados
                };

                Date.prototype.toJSON = function () { return moment(this).format(); };
                kendo.ui.progress($("#divImportar"), true);
                $.ajax({
                    data: JSON.stringify(Datos),
                    type: "POST",
                    async: false,
                    url: "../api/ImportarKOPSMostosPorZonaListaMostos",
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

