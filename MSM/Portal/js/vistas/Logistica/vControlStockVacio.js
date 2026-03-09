define(['underscore', 'backbone', 'jquery', 'text!../../../Logistica/html/ControlStockVacio.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones',
        'compartido/util', 'jszip', 'xlsx'],
    function (_, Backbone, $, PlantillaControlStockVacio, VistaDlgConfirm, Not, util, JSZip, XLSX) {
        var vistaControlStock = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaControlStockVacio),
            inicio: new Date((new Date()).getTime() - (30 * 24 * 3600 * 1000)),
            fin: new Date(),
            registrosSelData: [],
            registrosDesSelData: [],
            selTodos: false,
            dsMovimientos: null,
            gridMovimientos: null,
            dsMermas: null,
            gridMermas: null,
            ventanaAjuste: null,
            ventanaConsumo: null,
            ventanaEditar: null,
            datosMerma: null,
            dsCajas: null,
            listaParametros: null,
            stockFinal: null,
            dsMinimosMaximos: null,
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;
                window.XLSX = XLSX;
                self.registrosSelData = [];
                self.registrosDesSelData = [];
                self.selTodos = false;

                self.render();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                this.tab = util.ui.createTabStrip('#divPestanias');

                $("#dtpFechaDesde").kendoDatePicker({
                    value: self.inicio,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#dtpFechaHasta").kendoDatePicker({
                    value: self.fin,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#txtMerma").kendoNumericTextBox({
                    placeholder: '',
                    min: 0,
                    max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                self.CargarMovimientos();
                self.CargarMermas();
                self.ObtenerCajas();
                self.CargarParametros();
                self.CargarMinimosMaximos();

                util.ui.enableResizeCenterPane();
            },
            CargarMovimientos: function () {
                var self = this;

                self.dsMovimientos = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ObtenerMovimientosVacio/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.fechaInicio = self.inicio;
                                result.fechaFin = self.fin;

                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    schema: {
                        model: {
                            id: "MovimientosVacio.Id",
                            fields: {
                                'MovimientosVacio.Id': { type: "number" },
                                'MovimientosVacio.IdMovimiento': { type: "string" },
                                'MovimientosVacio.FechaMovimiento': { type: "date" },
                                'DescripcionMovimiento': { type: "string" },
                                'MovimientosVacio.IdCaja': { type: "string" },
                                'DescripcionCaja': { type: "string" },
                                'MovimientosVacio.IdOrden': { type: "string" },
                                'MovimientosVacio.StockInicial': { type: "number" },
                                'MovimientosVacio.CantidadMovimiento': { type: "number" },
                                'MovimientosVacio.StockFinal': { type: "number" },
                            }
                        }
                    },
                    requestStart: function () {
                        if ($("#gridMovimientos").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridMovimientos"), true);
                        }
                    },
                    requestEnd: function () {
                        if ($("#gridMovimientos").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridMovimientos"), false);
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            $("#center-pane").empty();
                        }
                    }
                });

                //Cargamos el grid con los datos recibidos
                self.gridMovimientos = this.$("#gridMovimientos").kendoGrid({
                    dataSource: self.dsMovimientos,
                    excel: {
                        fileName: "MovimientosVacio.xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    sortable: true,
                    resizable: true,
                    height: '95%',
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "MovimientosVacio.FechaMovimiento", title: window.app.idioma.t("FECHA"),
                            template: '#: kendo.toString(new Date(MovimientosVacio.FechaMovimiento), kendo.culture().calendars.standard.patterns.MES_FechaHora) #',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "MovimientosVacio.IdMovimiento", title: window.app.idioma.t("TIPO"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=MovimientosVacio.IdMovimiento#' style='width: 14px;height:14px;margin-right:5px;'/>#=MovimientosVacio.IdMovimiento#</label></div>";
                                }
                            }
                        },
                        {
                            field: "DescripcionMovimiento", title: window.app.idioma.t("MOVIMIENTO_LOTE"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=DescripcionMovimiento#' style='width: 14px;height:14px;margin-right:5px;'/>#=DescripcionMovimiento#</label></div>";
                                }
                            }
                        },
                        {
                            field: "MovimientosVacio.IdCaja", title: window.app.idioma.t("CODIGO_CAJA"),
                        },
                        {
                            field: "DescripcionCaja", title: window.app.idioma.t("CAJA"),
                        },
                        {
                            field: "MovimientosVacio.IdOrden", title: window.app.idioma.t("CODIGO_ORDEN"),
                        },
                        {
                            field: "MovimientosVacio.StockInicial", title: window.app.idioma.t("STOCK_INICIAL"),
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
                            field: "MovimientosVacio.CantidadMovimiento", title: window.app.idioma.t("CANTIDAD"),
                            template: "#= Math.abs(MovimientosVacio.CantidadMovimiento) #",
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
                            field: "MovimientosVacio.StockFinal", title: window.app.idioma.t("STOCK_FINAL"),
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                    ],
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var row = sheet.rows[i];
                                row.cells[0].value = kendo.toString(new Date(row.cells[0].value), kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[7].value = Math.abs(row.cells[7].value);
                            } catch (e) { }
                        }
                    },
                }).data("kendoGrid");
            },
            CargarMermas: function () {
                var self = this;

                self.dsMermas = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerMermasStockVacio/",
                            dataType: "json"
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "MermasStockVacio.Id",
                            fields: {
                                'MermasStockVacio.Id': { type: "number" },
                                'DescripcionLinea': { type: "string" },
                                'FormatoComun': { type: "string" },
                                'MermasStockVacio.Producto': { type: "string" },
                                'DescripcionProducto': { type: "string" },
                                'MermasStockVacio.Merma': { type: "number" }
                            }
                        }
                    },
                    requestStart: function () {
                        if ($("#gridMermas").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridMermas"), true);
                        }
                    },
                    requestEnd: function () {
                        if ($("#gridMermas").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridMermas"), false);
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            $("#center-pane").empty();
                        }
                    },
                });

                self.gridMermas = this.$("#gridMermas").kendoGrid({
                    dataSource: self.dsMermas,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
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
                            template: "<button id='btnLimpiarFiltrosMermas' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        }
                    ],
                    sortable: true,
                    resizable: true,
                    height: '95%',
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            title: "",
                            template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                            width: "30px"
                        },
                        {
                            command:
                            {
                                template: "<a id='btnEditar' class='k-button k-grid-edit' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                            },
                            width: "55px"
                        },
                        {
                            field: "DescripcionLinea", title: window.app.idioma.t("LINEA"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=DescripcionLinea#' style='width: 14px;height:14px;margin-right:5px;'/>#=DescripcionLinea#</label></div>";
                                }
                            }
                        },
                        {
                            field: "FormatoComun", title: window.app.idioma.t("FORMATO_COMUN"),
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
                        {
                            field: "MermasStockVacio.Producto", title: window.app.idioma.t("CODIGO_PRODUCTO"),
                        },
                        {
                            field: "DescripcionProducto", title: window.app.idioma.t("PRODUCTO"),
                        },
                        {
                            field: "MermasStockVacio.Merma", title: window.app.idioma.t("MERMA") + ' (%)',
                            template: '#if(MermasStockVacio.Merma % 1 != 0){# #:MermasStockVacio.Merma.toFixed(2) # #}else{ # #:MermasStockVacio.Merma # # }#'
                        },
                    ],
                    dataBound: function () {
                        $(".checkbox").bind("change", function (e) {
                            var checked = this.checked;
                            row = $(e.target).closest("tr");
                            grid = $("#gridMermas").data("kendoGrid");
                            dataItem = grid.dataItem(row);
                            var datos = {};
                            datos.Id = dataItem.MermasStockVacio.Id;
                            datos.Linea = dataItem.MermasStockVacio.Linea;
                            datos.Producto = dataItem.MermasStockVacio.Producto;
                            
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

                        var grid = $('#gridMermas').data('kendoGrid');

                        if (self.selTodos) {
                            grid.tbody.find('.checkbox').prop("checked", true);
                            grid.tbody.find(">tr").addClass('k-state-selected');

                            var items = grid.items();
                            var listItems = [];

                            listItems = $.grep(items, function (row) {
                                var dataItem = grid.dataItem(row);
                                return self.registrosDesSelData.some(function (data) {
                                    return data.Id == dataItem.MermasStockVacio.Id;
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
                                    return data.Id == dataItem.MermasStockVacio.Id;
                                });
                            });

                            listItems.forEach(function (row, idx) {
                                $(row.cells[0])[0].childNodes[0].checked = true;
                                $(row).closest("tr").addClass("k-state-selected");
                            });
                        }
                    }
                }).data("kendoGrid");

                var _grid = $("#gridMermas").data("kendoGrid");
                $("#gridMermas").data("kendoGrid").dataSource.bind("change", function (e) {
                    if (_grid.dataSource.filter() != null && typeof (_grid.dataSource.filter()) != "undefined") {
                        //Comprobamos si el cambio en el datasource se debe a un cambio del filtro y en tal caso eliminamos los checkbox
                        if (_grid.dataSource.filter().filters != self.filtroActual) {
                            self.filtroActual = _grid.dataSource.filter().filters; //hay que actualizar la variable antes de llamar a aplicarSeleccion para que no entre en un bucle infinito
                        }
                        self.filtroActual = _grid.dataSource.filter().filters;
                    }
                });
            },
            CargarParametros: function () {
                var self = this;

                self.dsParametros = new kendo.data.DataSource({
                    transport: {
                        read: function (options) {
                            $.ajax({
                                url: "../api/GetParametrosStockVacio/",
                                dataType: "json",
                                success: function (result) {
                                    self.listaParametros = result;
                                    options.success(result);
                                },
                                error: function (result) {
                                    options.error(result);
                                }
                            });
                        },
                        update: function (options) {
                            if (!$.isNumeric(options.data.Valor)) {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDACION_NUMERO'), 3000);
                                return;
                            }

                            if (options.data.Id == 3 && options.data.Valor != "0" && options.data.Valor != "1") {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDACION_VALOR_ENTRE'), 3000);
                                return;
                            }

                            if (options.data.Id == 4 && options.data.Valor != "0" && options.data.Valor != "1") {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDACION_VALOR_ENTRE'), 3000);
                                return;
                            }

                            var queryArgs = [];
                            queryArgs.push({
                                Id: options.data.Id,
                                Valor: options.data.Valor
                            });

                            util.api.ajaxApi('../api/EditarParametrosStockVacio', queryArgs).done(function (data) {
                                if (data === window.app.idioma.t('MOD_PARAMETRO_OK')) {
                                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('MOD_PARAMETRO_OK'), 3000);
                                } else {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('MOD_PARAMETRO_NOK'), 3000);
                                }

                                options.success();
                            }).fail(function (xhr) {
                                options.error();
                                util.ui.NotificaError(xhr);
                            });
                        }
                    },
                    schema: {
                        model: {
                            id: 'Id',
                            fields: {
                                'Descripcion': { type: 'string', editable: false },
                                'Valor': { type: 'string' }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            $("#center-pane").empty();
                        }
                    },
                });

                $('#gridParametros').kendoGrid({
                    dataSource: self.dsParametros,
                    resizable: true,
                    scrollable: false,
                    editable: {
                        mode: 'inline',
                        confirmation: false
                    },
                    columns: [
                        {
                            field: 'Descripcion',
                            title: window.app.idioma.t('DESCRIPCION')
                        },
                        {
                            field: 'Valor',
                            title: window.app.idioma.t('VALOR')
                        },
                        {
                            title: ' ',
                            width: 120,
                            attributes: { 'style': 'text-align: center' },
                            command: [
                                {
                                    name: 'edit',
                                    text: {
                                        edit: window.app.idioma.t('EDITAR'),
                                        update: window.app.idioma.t('ACTUALIZAR'),
                                        cancel: window.app.idioma.t('CANCELAR')
                                    }
                                }]
                        }
                    ],
                    dataBound: function (e) {
                        util.ui.applyGridButtonSecurity(e.sender.element, [
                            { selector: '.k-grid-edit', defaultRole: 'LOG_PROD_SCH_3_GestionControlStockVacio' }
                        ]);

                        //var grid = $("#gridParametros").data("kendoGrid");
                        //var gridData = grid.dataSource.view();
                        //for (var i = 0; i < gridData.length; i++) {
                        //    var currentUid = gridData[i].uid;
                        //    if (!gridData[i].Editable) {
                        //        var currenRow = grid.table.find("tr[data-uid='" + currentUid + "']");
                        //        var editButton = $(currenRow).find(".k-grid-edit");
                        //        editButton.hide();
                        //    }
                        //}
                    },
                });
            },
            CargarMinimosMaximos: function () {
                var self = this;

                self.dsMinimosMaximos = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerMinimosMaximosStock/",
                            dataType: "json"
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                'Id': { type: "number" },
                                'CodigoCaja': { type: "string" },
                                'DescripcionCaja': { type: "string" },
                                'Minimo': { type: "number" },
                                'Maximo': { type: "number" }
                            }
                        }
                    },
                    requestStart: function () {
                        if ($("#gridMinimosMaximos").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridMinimosMaximos"), true);
                        }
                    },
                    requestEnd: function () {
                        if ($("#gridMinimosMaximos").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridMinimosMaximos"), false);
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            $("#center-pane").empty();
                        }
                    },
                });

                $('#gridMinimosMaximos').kendoGrid({
                    dataSource: self.dsMinimosMaximos,
                    excel: {
                        fileName: window.app.idioma.t('MINIMOS_MAXIMOS_STOCK') + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    sortable: true,
                    resizable: true,
                    height: '95%',
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "CodigoCaja", title: window.app.idioma.t("CODIGO_CAJA"),
                        },
                        {
                            field: "DescripcionCaja", title: window.app.idioma.t("CAJA"),
                        },
                        {
                            field: "Minimo", title: window.app.idioma.t("MINIMO"),
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
                            field: "Maximo", title: window.app.idioma.t("MAXIMO"),
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                    ],
                    excelExport: function (e) {
                        //var sheet = e.workbook.sheets[0];

                        //for (var i = 1; i < sheet.rows.length; i++) {
                        //    try {
                        //        var row = sheet.rows[i];
                        //        row.cells[0].value = kendo.toString(new Date(row.cells[0].value), kendo.culture().calendars.standard.patterns.MES_FechaHora);
                        //        row.cells[7].value = Math.abs(row.cells[7].value);
                        //    } catch (e) { }
                        //}
                    },
                });
            },
            events: {
                'click #btnFiltrar': 'Actualiza',
                'click #btnConsumoCajaVacia': 'ConsumoCajaVacia',
                'click #btnAjusteManual': 'AjusteManual',
                'click #btnRecalcular': 'Recalcular',
                'click #btnExportExcel': 'ExportarExcel',
                'click #btnExportExcelMin': 'ExportarExcelMin',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnLimpiarFiltrosMermas': 'LimpiarFiltroGridMermas',
                'click #btnLimpiarFiltrosMin': 'LimpiarFiltroGridMin',
                'click #btnAsignarMermas': 'ConfirmarAsignarMermas',
                'click #btnEditar': 'EditarMerma',
                'click #btnSelTodos': function () { this.AplicarSeleccion(true); },
                'click #btnDesSelTodos': function () { this.AplicarSeleccion(false); },
                "click #btnImportExcel": function () { $("#inputFile").click() },
                "change #inputFile": function (e) { this.ImportarExcel(e.target.files[0], e); },
                "click #btnImportStockExcel": function () {
                    $("#inputStockFile").value = null;//get(0)
                    $("#inputStockFile").click()
                },
                "change #inputStockFile": function (e) {
                    this.ImportarStockExcel(e.target.files[0], e);
                },
            },
            Actualiza: function () {
                var self = this;
                $("form.k-filter-menu button[type='reset']").trigger("click");
                self.inicio = $("#dtpFechaDesde").data("kendoDatePicker").value();
                self.fin = $("#dtpFechaHasta").data("kendoDatePicker").value();
                self.CargarMovimientos();
            },
            ConsumoCajaVacia: function () {
                var self = this;
                var permiso = TienePermiso(215);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='windowConsumo'></div>"));

                $("#windowConsumo").kendoWindow(
                    {
                        title: window.app.idioma.t('CONSUMO_CAJA_VACIA'),
                        width: "430px",
                        height: "200px",
                        content: "Logistica/html/CrearConsumoCajaVacia.html",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        close: function () {
                            self.ventanaConsumo.destroy();
                            self.ventanaConsumo = null;
                        },
                        refresh: function () {
                            self.CrearConsumoCajaVacia();
                        }
                    });

                self.ventanaConsumo = $('#windowConsumo').data("kendoWindow");
                self.ventanaConsumo.center();
                self.ventanaConsumo.open();
            },
            AjusteManual: function () {
                var self = this;
                var permiso = TienePermiso(215);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='windowAjuste'></div>"));

                $("#windowAjuste").kendoWindow(
                    {
                        title: window.app.idioma.t('AJUSTE_MANUAL'),
                        width: "430px",
                        height: "150px",
                        content: "Logistica/html/CrearAjusteManual.html",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        close: function () {
                            self.ventanaAjuste.destroy();
                            self.ventanaAjuste = null;
                        },
                        refresh: function () {
                            self.CrearAjusteManual();
                        }
                    });

                self.ventanaAjuste = $('#windowAjuste').data("kendoWindow");
                self.ventanaAjuste.center();
                self.ventanaAjuste.open();
            },
            Recalcular: function () {
                var self = this;
                var permiso = TienePermiso(215);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                $.ajax({
                    url: "../api/RecalcularStock",
                    dataType: 'json',
                    async: false
                }).done(function (res) {
                    if (res) {
                        self.dsMovimientos.read();
                        Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('RECALCULO_OK'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_RECALCULAR_STOCK'), 4000);
                    }
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_RECALCULAR_STOCK'), 4000);
                    }
                });
            },
            CrearConsumoCajaVacia: function () {
                var self = this;

                $("#lblWO").text(window.app.idioma.t('WO') + ': ');
                $("#lblCajaConsumo").text(window.app.idioma.t('CAJA') + ': ');
                $("#lblCantidadConsumo").text(window.app.idioma.t('CANTIDAD'));
                $("#btnAceptarConsumo").text(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarConsumo").text(window.app.idioma.t('CANCELAR'));

                var dsWO = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerWOConsumoCajaVacia/",
                            dataType: "json",
                        }
                    }
                });

                $("#cmbWO").kendoDropDownList({
                    dataSource: dsWO,
                    template: " #=IdProducto # - #=Id #",
                    valueTemplate: " #=IdProducto # - #=Id #",
                    dataValueField: "Id",
                });

                $("#cmbCajaConsumo").kendoDropDownList({
                    dataSource: self.dsCajas,
                    template: " #=IdCaja # - #=DescripcionCaja #",
                    valueTemplate: " #=IdCaja # - #=DescripcionCaja #",
                    dataValueField: "IdCaja",
                });

                $("#ntxtCantidadConsumo").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    format: "n0",
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                });

                $("#btnAceptarConsumo").kendoButton({
                    click: function () { self.ConfirmarConsumo(); }
                });

                $("#btnCancelarConsumo").kendoButton({
                    click: function () { self.CancelarConsumo(); }
                });
            },
            CrearAjusteManual: function () {
                var self = this;

                $("#lblCaja").text(window.app.idioma.t('CAJA') + ': ');
                $("#lblCantidad").text(window.app.idioma.t('CANTIDAD'));
                $("#btnAceptarAjuste").text(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarAjuste").text(window.app.idioma.t('CANCELAR'));

                $("#cmbCaja").kendoDropDownList({
                    dataSource: self.dsCajas,
                    template: " #=IdCaja # - #=DescripcionCaja #",
                    valueTemplate: " #=IdCaja # - #=DescripcionCaja #",
                    dataValueField: "IdCaja",
                });

                $("#ntxtCantidad").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    format: "n0",
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                });

                $("#btnAceptarAjuste").kendoButton({
                    click: function () { self.ConfirmarAjuste(); }
                });

                $("#btnCancelarAjuste").kendoButton({
                    click: function () { self.CancelarAjuste(); }
                });
            },
            ObtenerCajas: function () {
                var self = this;

                self.dsCajas = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerCajas/",
                            dataType: "json",
                        }
                    }
                });
            },
            CancelarConsumo: function () {
                this.ventanaConsumo.close();
            },
            CancelarAjuste: function () {
                this.ventanaAjuste.close();
            },
            ConfirmarConsumo: function () {
                var self = this;

                var confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('CONSUMO_CAJA_VACIA'),
                    msg: window.app.idioma.t('CONFIRMACION_CONSUMO_CAJA_VACIA'),
                    funcion: function () { self.GuardarConsumo(); },
                    contexto: this
                });
            },
            ConfirmarAjuste: function () {
                var self = this;

                var idCaja = $("#cmbCaja").data("kendoDropDownList").value();
                var cantidad = $("#ntxtCantidad").data("kendoNumericTextBox").value();

                var data = {};
                data.idCaja = idCaja;

                $.ajax({
                    data: JSON.stringify(data),
                    type: "POST",
                    async: false,
                    url: "../api/GetStockFinal",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        self.stockFinal = res;
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                });

                var porcentaje = parseInt(self.listaParametros[0].Valor);
                var minimo = self.stockFinal - (Math.abs(self.stockFinal) * (porcentaje / 100));
                var maximo = self.stockFinal + (Math.abs(self.stockFinal) * (porcentaje / 100));

                if (cantidad < minimo || cantidad > maximo) {
                    var confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('AJUSTE_MANUAL'),
                        msg: window.app.idioma.t('CONFIRMACION_AJUSTE_MANUAL'),
                        funcion: function () { self.GuardarAjuste(idCaja, cantidad); },
                        contexto: this
                    });
                } else {
                    self.GuardarAjuste(idCaja, cantidad);
                }
            },
            GuardarConsumo: function () {
                var self = this;

                var data = {};
                data.wo = $("#cmbWO").data("kendoDropDownList").value();
                data.idCaja = $("#cmbCajaConsumo").data("kendoDropDownList").value();
                var valorCantidad = $("#ntxtCantidadConsumo").data("kendoNumericTextBox").value();
                data.cantidad = valorCantidad === '' ? 0 : valorCantidad;

                $.ajax({
                    data: JSON.stringify(data),
                    type: "POST",
                    async: false,
                    url: "../api/GuardarConsumoCajaVacia",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            self.dsMovimientos.read();
                            Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('SE_HA_GUARDADO_CONSUMO_CAJA_VACIA'), 4000);
                            self.ventanaConsumo.close();
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_GUARDAR_CONSUMO_CAJA_VACIA'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_GUARDAR_CONSUMO_CAJA_VACIA'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            GuardarAjuste: function (idCaja, valorCantidad) {
                var self = this;

                var data = {};
                data.idCaja = idCaja;
                data.cantidad = valorCantidad === '' ? 0 : valorCantidad;

                $.ajax({
                    data: JSON.stringify(data),
                    type: "POST",
                    async: false,
                    url: "../api/GuardarAjusteManual",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            self.dsMovimientos.read();
                            Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('SE_HA_GUARDADO_AJUSTE'), 4000);
                            self.ventanaAjuste.close();
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_GUARDAR_AJUSTE'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_GUARDAR_AJUSTE'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            ExportarExcel: function () {
                kendo.ui.progress($("#gridMovimientos"), true);
                var grid = $("#gridMovimientos").data("kendoGrid");
                grid.saveAsExcel();
                kendo.ui.progress($("#gridMovimientos"), false);
            },
            ExportarExcelMin: function () {
                kendo.ui.progress($("#gridMinimosMaximos"), true);
                var grid = $("#gridMinimosMaximos").data("kendoGrid");
                grid.saveAsExcel();
                kendo.ui.progress($("#gridMinimosMaximos"), false);
            },
            ConfirmarAsignarMermas: function (e) {
                e.preventDefault();
                var self = this;
                var permiso = TienePermiso(215);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $('#gridMermas').data('kendoGrid');

                if (grid.tbody.find('>tr.k-state-selected').length > 0 || self.registrosSelData.length > 0 ||
                    (self.registrosDesSelData.length > 0 && self.registrosDesSelData.length < self.ds.data().length)) {

                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('CONTROL_STOCK_VACIO'),
                        msg: window.app.idioma.t('DESEA_REALMENTE_CAMBIAR_MERMAS'),
                        funcion: function () { self.AsignarMermas(); },
                        contexto: this
                    });
                } else {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                }
            },
            AsignarMermas: function () {
                var self = this;
                var datos = {};
                datos.Merma = $('#txtMerma').val();
                var cambios = [];
                var dataSource = $("#gridMermas").data("kendoGrid").dataSource;
                var filters = dataSource.filter();
                var allData = dataSource.data();
                var query = new kendo.data.Query(allData);
                var dataFiltered = query.filter(filters).data;

                if (self.selTodos) {
                    cambios = $.map(dataFiltered, function (data, i) {
                        var datos = {};
                        datos.Id = data.MermasStockVacio.Id;
                        datos.Linea = data.MermasStockVacio.Linea;
                        datos.Producto = data.MermasStockVacio.Producto;
                        
                        if (!_.findWhere(self.registrosDesSelData, datos)) {
                            return {
                                Linea: datos.Linea,
                                Producto: datos.Producto 
                            };
                        }
                    });
                } else {
                    var cambios = $.map(dataFiltered, function (data, i) {
                        var datos = {};
                        datos.Id = data.MermasStockVacio.Id;
                        datos.Linea = data.MermasStockVacio.Linea;
                        datos.Producto = data.MermasStockVacio.Producto;
                        
                        if (_.findWhere(self.registrosSelData, datos)) {
                            return {
                                Linea: datos.Linea,
                                Producto: datos.Producto
                            };
                        }
                    });
                }

                datos.Cambios = cambios;
                self.registrosDesSelData = [];
                self.registrosSelData = [];
                self.selTodos = false;
                self.$("#lblRegSel").text("");

                $.ajax({
                    type: "POST",
                    url: "../api/AsignarMermas/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).success(function (res) {
                    if (res) {
                        self.dsMermas.read();
                        Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('SE_HAN_ASIGNADO_MERMAS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ASIGNAR_MERMAS'), 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                }).error(function (err) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ASIGNAR_MERMAS'), 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                });
            },
            EditarMerma: function (e) {
                var self = this;
                var permiso = TienePermiso(215);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='window'></div>"));

                $("#window").kendoWindow(
                {
                    title: window.app.idioma.t('EDITAR_MERMAS'),
                    width: "400px",
                    height: "240px",
                    content: "Logistica/html/EditarMermas.html",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    close: function () {
                        self.ventanaEditar.destroy();
                        self.ventanaEditar = null;
                    },
                    refresh: function () {
                        self.CargarDatosEdicion(e);
                    }
                });

                self.ventanaEditar = $('#window').data("kendoWindow");
                self.ventanaEditar.center();
                self.ventanaEditar.open();
            },
            CargarDatosEdicion: function (e) {
                var self = this;

                $("#lblLinea").text(window.app.idioma.t('LINEA') + ': ');
                $("#lblCodigoProducto").text(window.app.idioma.t("CODIGO_PRODUCTO") + ': ');
                $("#lblProducto").text(window.app.idioma.t('PRODUCTO') + ': ');
                $("#lblMerma").text(window.app.idioma.t('MERMA'));
                $("#btnAceptarMerma").text(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarMerma").text(window.app.idioma.t('CANCELAR'));

                $("#ntxtMerma").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    min: 0,
                    max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });
                
                $("#btnAceptarMerma").kendoButton({
                    click: function () { self.ConfirmarEdicion(); }
                });

                $("#btnCancelarMerma").kendoButton({
                    click: function () { self.CancelarEdicion(); }
                });

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                self.datosMerma = self.gridMermas.dataItem(tr);

                $("#lblValorLinea").text(self.datosMerma.DescripcionLinea.substr(6));
                $("#lblValorCodigoProducto").text(self.datosMerma.MermasStockVacio.Producto);
                $("#lblValorProducto").text(self.datosMerma.DescripcionProducto);
                $("#ntxtMerma").data("kendoNumericTextBox").value(self.datosMerma.MermasStockVacio.Merma);
            },
            CancelarEdicion: function () {
                this.ventanaEditar.close();
            },
            ConfirmarEdicion: function () {
                var self = this;

                var confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('EDITAR_MERMAS'),
                    msg: window.app.idioma.t('CONFIRMACION_EDITAR_MERMAS'),
                    funcion: function () { self.EditarParametros(); },
                    contexto: this
                });
            },
            EditarParametros: function () {
                var self = this;

                var data = {};
                data.Linea = self.datosMerma.MermasStockVacio.Linea;
                data.Producto = self.datosMerma.MermasStockVacio.Producto;
                var valorMerma = $("#ntxtMerma").data("kendoNumericTextBox").value();
                data.Merma = valorMerma === '' ? 0 : valorMerma;

                $.ajax({
                    data: JSON.stringify(data),
                    type: "POST",
                    async: false,
                    url: "../api/EditarMerma",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            self.dsMermas.read();
                            Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('SE_HA_ACTUALIZADO_MERMA'), 4000);
                            self.ventanaEditar.close();
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_EDITAR_MERMA'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_EDITAR_MERMA'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            AplicarSeleccion: function (checked) {
                var self = this;

                self.selTodos = checked;
                var grid = $('#gridMermas').data('kendoGrid');

                if (self.selTodos) {
                    grid.tbody.find('.checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var dataSource = $("#gridMermas").data("kendoGrid").dataSource;
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
            ProcesarDatos: function (data) {
                var infoData = [];

                data.forEach(x => {
                    infoData.push({
                        "CodigoCaja": x[window.app.idioma.t("CODIGO_CAJA")],
                        "DescripcionCaja": x[window.app.idioma.t("CAJA")],
                        "Minimo": x[window.app.idioma.t("MINIMO")],
                        "Maximo": x[window.app.idioma.t("MAXIMO")],
                    });
                });

                return infoData;
            },
            ImportarExcel: function (fichero, e) {
                var self = this;

                if (fichero.type != 'application/vnd.ms-excel' && fichero.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FORMATO_FICHERO_NO_VALIDO'), 4000); 
                    return;
                }

                var reader = new FileReader();
                reader.readAsArrayBuffer(fichero)
                reader.onload = function () {
                    var workbook = XLSX.read(reader.result, { type: 'buffer' });
                    var sheet = workbook.Sheets[workbook.SheetNames[0]];
                    var json = XLSX.utils.sheet_to_json(sheet, null);

                    if (json.length == 0) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FORMATO_FICHERO_NO_VALIDO'), 4000);
                        return;
                    }

                    var validData = self.ProcesarDatos(json);
                    kendo.ui.progress($('#gridMinimosMaximos'), true);
                    e.target.value = "";

                    $.ajax({
                        type: "POST",
                        data: JSON.stringify(validData),
                        async: false,
                        url: "../api/GuardarMinimosMaximosStock",
                        contentType: "application/json; charset=utf-8",
                        success: function (res) {
                            kendo.ui.progress($('#gridMinimosMaximos'), false);
                            var mensaje = res + window.app.idioma.t('SUBIDA_ARCHIVO_EXCEL_1') + validData.length + window.app.idioma.t('SUBIDA_ARCHIVO_EXCEL_2');
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), mensaje, 4000);

                            $('#gridMinimosMaximos').data("kendoGrid").dataSource.read();
                        },
                        error: function (err) {
                            $('#inputFile').val('');
                            $('#gridMinimosMaximos').data("kendoGrid").dataSource.read();

                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_IMPORTAR_EXCEL'), 4000);
                            }
                            kendo.ui.progress($('#gridMinimosMaximos'), false);
                        }
                    });
                }
            },
            ImportarStockExcel: function (fichero, e) {
                var self = this;

                if (fichero.type != 'application/vnd.ms-excel' && fichero.type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FORMATO_FICHERO_NO_VALIDO'), 4000);
                    return;
                }

                var reader = new FileReader();
                reader.readAsArrayBuffer(fichero)
                reader.onload = function () {
                    var workbook = XLSX.read(reader.result, { type: 'buffer' });
                    var sheet = workbook.Sheets[workbook.SheetNames[0]];
                    var json = XLSX.utils.sheet_to_json(sheet, null);

                    if (json.length == 0) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FORMATO_FICHERO_NO_VALIDO'), 4000);
                        return;
                    }

                    var validData = self.ProcesarDatosStock(json);
                    kendo.ui.progress($('#gridMovimientos'), true);
                    e.target.value = "";

                    $.ajax({
                        type: "POST",
                        data: JSON.stringify(validData),
                        async: false,
                        url: "../api/GuardarImportarStock",
                        contentType: "application/json; charset=utf-8",
                        success: function (res) {
                            kendo.ui.progress($('#gridMovimientos'), false);
                            var mensaje = res + window.app.idioma.t('SUBIDA_ARCHIVO_EXCEL_1') + validData.length + window.app.idioma.t('SUBIDA_ARCHIVO_EXCEL_2');
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), mensaje, 4000);

                            $('#gridMovimientos').data("kendoGrid").dataSource.read();
                        },
                        error: function (err) {
                            $('#inputStockFile').val('');
                            $('#gridMovimientos').data("kendoGrid").dataSource.read();

                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_IMPORTAR_EXCEL'), 4000);
                            }
                            kendo.ui.progress($('#gridMovimientos'), false);
                        }
                    });
                }
            },
            ProcesarDatosStock: function (data) {
                var infoData = [];

                data.forEach(x => {
                    infoData.push({
                        "CodigoCaja": x["Codigo"],
                        "Cantidad": x[window.app.idioma.t("CANTIDAD")],
                    });
                });

                return infoData;
            },
            LimpiarFiltroGrid: function () {
                var self = this;
                $("form.k-filter-menu button[type='reset']").trigger("click");
                self.Actualiza();
            },
            LimpiarFiltroGridMermas: function () {
                const self = this;

                self.dsMermas.query({
                    group: [],
                    filter: [],
                    page: 1
                });
            },
            LimpiarFiltroGridMin: function () {
                const self = this;

                self.dsMinimosMaximos.query({
                    group: [],
                    filter: [],
                    page: 1
                });
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
            //resizeGrid: function (esPrimerGrid) {
            //    var contenedorHeight = $("#center-pane").innerHeight();
            //    var cabeceraHeight = $("#divCabeceraVista").innerHeight();
            //    var filtrosHeight = $("#divFiltros").innerHeight();

            //    var gridElement = esPrimerGrid ? $("#gridMovimientos") : $("#gridMermas"),
            //        dataArea = gridElement.find(".k-grid-content"),
            //        gridHeight = gridElement.innerHeight(),
            //        otherElements = gridElement.children().not(".k-grid-content"),
            //        otherElementsHeight = 0;

            //    otherElements.each(function () {
            //        otherElementsHeight += $(this).outerHeight();
            //    });

            //    dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            //}
        });

        return vistaControlStock;
    });