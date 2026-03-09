define(['underscore', 'backbone', 'jquery', 'text!../../../Logistica/html/PrevisionStockVacio.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones',
        'compartido/util', 'jszip'],
    function (_, Backbone, $, PlantillaPrevisionStockVacio, VistaDlgConfirm, Not, util, JSZip) {
        var vistaPrevisionStock = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaPrevisionStockVacio),
            inicio: new Date(),
            fin: new Date((new Date()).getTime() + (14 * 24 * 3600 * 1000)),
            datosPrevisiones: null,
            dsPrevisiones: null,
            listaParametros: null,
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

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

                $("#nDias").kendoNumericTextBox({
                    placeholder: '',
                    format: "n0",
                    min: 1,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    change: function () {
                        self.CambiarDias(this.value());
                    }
                });

                self.ObtenerParametros();
                $("#lblDias").text(self.listaParametros[1].Descripcion);
                $("#nDias").data("kendoNumericTextBox").value(self.listaParametros[1].Valor);
                $("#lblIncluir").text(self.listaParametros[2].Descripcion);
                var valorIncluir = self.listaParametros[2].Valor == '0' ? false : true;
                $("#chkIncluir").prop('checked', valorIncluir);

                self.ObtenerPrevisiones();

                util.ui.enableResizeCenterPane();
            },
            ObtenerPrevisiones: function () {
                var self = this;
                var result = {};
                result.fechaInicio = self.inicio;
                result.fechaFin = self.fin;

                $.ajax({
                    data: JSON.stringify(result),
                    type: "POST",
                    async: false,
                    url: "../api/GetPrevisionStock",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        self.datosPrevisiones = data;
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                });

                self.CargarPrevisiones();
            },
            CargarPrevisiones: function () {
                var self = this;

                var datos = [];
                var semanas = [];
                var pivot = {};

                $.each(self.datosPrevisiones, function (idx, fila) {
                    var columnFecha = 'Dia' + fila.Fecha.replace(/-/g, '');

                    if (!semanas.find(o => o.columnName === columnFecha)) {
                        semanas.push({
                            columnName: columnFecha,
                            columnTitle: fila.Fecha
                        });
                    }
                     
                    var pkey, nuevoDato;
                    nuevoDato = {
                        CodigoCaja: fila.CodigoCaja,
                        DescripcionCaja: fila.DescripcionCaja,
                        Minimo: fila.Minimo,
                        Maximo: fila.Maximo
                    };
                    pkey = fila.CodigoCaja;

                    var dato = pivot[pkey];
                    if (dato === undefined) {
                        pivot[pkey] = nuevoDato;
                        dato = pivot[pkey];
                    }
                    dato[columnFecha] = fila.Cantidad;
                });

                var fieldsSemanas = $.map(semanas, function (s) {
                    return self.createFieldSemana(s.columnName, s.columnTitle);
                });

                datos = $.map(pivot, function (val, _) { return val; });

                var fieldsFijos = [
                    {
                        name: 'CodigoCaja',
                        type: 'string',
                        i18n: window.app.idioma.t("CODIGO_CAJA"),
                        kGrid: {
                        }
                    },
                    {
                        name: 'DescripcionCaja',
                        type: 'string',
                        i18n: window.app.idioma.t("CAJA"),
                        kGrid: {
                        }
                    },
                    {
                        name: 'Minimo',
                        type: 'integer',
                        i18n: window.app.idioma.t("MINIMO"),
                        kGrid: {
                        }
                    },
                    {
                        name: 'Maximo',
                        type: 'integer',
                        i18n: window.app.idioma.t("MAXIMO"),
                        kGrid: {
                        }
                    }
                ];

                var listaFields = fieldsFijos.concat(fieldsSemanas);
                var fields = util.ui.createDataSourceFields(listaFields);

                self.dsPrevisiones = new kendo.data.DataSource({
                    data: datos,
                    schema: {
                        model: {
                            fields: fields
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            $("#center-pane").empty();
                        }
                    },
                    pageSize: 50
                });

                //Cargamos el grid con los datos recibidos
                self.$("#gridPrevisiones").kendoGrid({
                    dataSource: self.dsPrevisiones,
                    excel: {
                        fileName: window.app.idioma.t('PREVISION') + ".xlsx",
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
                    columns: util.ui.createGridColumns(listaFields),
                    dataBound: function (e) {
                        var grid = $("#gridPrevisiones").data("kendoGrid");
                        var gridData = grid.dataSource.view();
                        for (var i = 0; i < gridData.length; i++) {
                            var currentUid = gridData[i].uid;
                            var currentRow = grid.table.find("tr[data-uid='" + currentUid + "'] td");
                            var minimo = gridData[i].Minimo;
                            var maximo = gridData[i].Maximo;

                            for (var j = 0; j < currentRow.length; j++) {
                                var data = currentRow[j].textContent.replace('.', '').replace(',', '');
                                // Tiene que ser para los valores numéricos y excluimos la primera columna del código de Caja
                                if ($.isNumeric(data) && j > 0) {
                                    if (parseInt(data) < 0) {
                                        $(currentRow[j]).css('color', 'red');
                                    } else if (parseInt(data) >= 0 && parseInt(data) < minimo) {
                                        $(currentRow[j]).css('color', 'orange');
                                    } else if (parseInt(data) >= minimo && parseInt(data) <= maximo) {
                                        $(currentRow[j]).css('color', 'black');
                                    } else {
                                        $(currentRow[j]).css('color', 'green');
                                    }
                                }
                            }
                        }
                    },
                    excelExport: function (e) {
                        //kendo.ui.progress($("#gridPrevisiones"), true);
                        //var sheet = e.workbook.sheets[0];

                        //for (var i = 1; i < sheet.rows.length; i++) {
                        //    try {
                        //        var row = sheet.rows[i];
                        //        row.cells[0].value = kendo.toString(new Date(row.cells[0].value), kendo.culture().calendars.standard.patterns.MES_FechaHora);
                        //        row.cells[7].value = Math.abs(row.cells[6].value);
                        //    } catch (e) { }
                        //}

                        //kendo.ui.progress($("#gridPrevisiones"), false);
                    },
                }).data("kendoGrid");

                var grid = $("#gridPrevisiones").data("kendoGrid");
                grid.hideColumn("Minimo");
                grid.hideColumn("Maximo");
            },
            createFieldSemana: function (columnName, numSemana) {
                var fieldSemana = {
                    name: columnName,
                    type: 'integer',
                    text: numSemana,
                    //cssClass: 'columna-cantidad',
                    kGrid: {
                    }
                };

                return fieldSemana;
            },
            events: {
                'click #btnFiltrar': 'Actualiza',
                'change #chkIncluir': 'IncluirPrevision',
                'click #btnRecalcular': 'Recalcular',
                'click #btnExportExcel': 'ExportarExcel',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid'
            },
            Actualiza: function () {
                var self = this;
                $("form.k-filter-menu button[type='reset']").trigger("click");
                self.inicio = $("#dtpFechaDesde").data("kendoDatePicker").value();
                self.fin = $("#dtpFechaHasta").data("kendoDatePicker").value();
                self.$("#gridPrevisiones").data('kendoGrid').destroy();
                self.$("#gridPrevisiones").empty();
                self.ObtenerPrevisiones();
            },
            CambiarDias: function (dias) {
                var queryArgs = [];
                queryArgs.push({
                    Id: 2,
                    Valor: dias
                });

                $.ajax({
                    type: "POST",
                    url: "../api/EditarParametrosStockVacio",
                    dataType: 'json',
                    data: JSON.stringify(queryArgs),
                    contentType: "application/json; charset=utf-8",
                    async: false
                }).done(function (data) {
                    if (data === window.app.idioma.t('MOD_PARAMETRO_OK')) {
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('MOD_PARAMETRO_OK'), 3000);
                    } else {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('MOD_PARAMETRO_NOK'), 3000);
                    }
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('MOD_PARAMETRO_NOK'), 4000);
                    }
                });
            },
            IncluirPrevision: function () {
                var queryArgs = [];
                queryArgs.push({
                    Id: 3,
                    Valor: $("#chkIncluir").prop('checked') ? 1 : 0
                });

                $.ajax({
                    type: "POST",
                    url: "../api/EditarParametrosStockVacio",
                    dataType: 'json',
                    data: JSON.stringify(queryArgs),
                    contentType: "application/json; charset=utf-8",
                    async: false
                }).done(function (data) {
                    if (data === window.app.idioma.t('MOD_PARAMETRO_OK')) {
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('MOD_PARAMETRO_OK'), 3000);
                    } else {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('MOD_PARAMETRO_NOK'), 3000);
                    }
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('MOD_PARAMETRO_NOK'), 4000);
                    }
                });
            },
            ObtenerParametros: function () {
                var self = this;
                $.ajax({
                    url: "../api/GetParametrosStockVacio",
                    dataType: 'json',
                    async: false
                }).done(function (result) {
                    self.listaParametros = result;
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER_PARAM_STOCK'), 4000);
                    }
                });
            },
            Recalcular: function () {
                var self = this;
                var permiso = TienePermiso(217);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                kendo.ui.progress($("#gridPrevisiones"), true);

                $.ajax({
                    url: "../api/RecalcularPrevisionStock",
                    dataType: 'json'
                }).done(function (res) {
                    if (res) {
                        self.Actualiza();
                        Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('RECALCULO_OK'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_RECALCULAR_STOCK'), 4000);
                    }
                    kendo.ui.progress($("#gridPrevisiones"), false);
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_RECALCULAR_STOCK'), 4000);
                    }
                    kendo.ui.progress($("#gridPrevisiones"), false);
                });
            },
            ExportarExcel: function () {
                kendo.ui.progress($("#gridPrevisiones"), true);
                var grid = $("#gridPrevisiones").data("kendoGrid");
                grid.saveAsExcel();
                kendo.ui.progress($("#gridPrevisiones"), false);
            },
            LimpiarFiltroGrid: function () {
                var self = this;
                $("form.k-filter-menu button[type='reset']").trigger("click");
                self.Actualiza();
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

        return vistaPrevisionStock;
    });