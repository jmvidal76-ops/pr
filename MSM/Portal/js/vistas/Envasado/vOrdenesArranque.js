define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/OrdenesArranque.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', 'jszip', 'vistas/Envasado/vCrearWOArranqueCambio'],
    function (_, Backbone, $, PlantillaOrdenesArranque, VistaDlgConfirm, Not, JSZip, VistaCrearNuevaOrdenArranque) {
        var VistaOrdenesArranque = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            dia: 0,
            turno: 0,
            linea: '',
            grid: null,
            ds: null,
            inicio: new Date((new Date()).getTime() - (30 * 24 * 3600 * 1000)),
            fin: new Date(),
            vistaActualiza: null,
            vistaCrearOrden: null,
            dsTiposArranque: null,
            template: _.template(PlantillaOrdenesArranque),
            initialize: function (options) {
                var self = this;
                var splitter = $("#vertical").data("kendoSplitter");
                window.JSZip = JSZip;

                if (this.id != 'divHTMLContenido') {
                    splitter.bind("resize", function () { self.resizeGrid(self.id); });
                }
                else splitter.bind("resize", function () { self.resizeGrid("center-pane"); });

                if (options && options.filtro) {
                    if (options.filtro.fechaTurnoInicio) {
                        self.inicio = options.filtro.fechaTurnoInicio;
                    }
                    if (options.filtro.fechaTurnoFin) {
                        self.fin = options.filtro.fechaTurnoFin;
                    }
                    if (options.filtro.linea) {
                        self.linea = options.filtro.linea;
                    }
                }

                self.render();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());

                if (this.id != 'divHTMLContenido') {
                    $("#" + this.id).append($(this.el));
                    this.$("#divCabeceraVista").hide();
                    this.$('.filtroFechas').hide();
                } else {
                    $("#center-pane").append($(this.el));
                }

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

                $.ajax({
                    type: "GET",
                    url: "../api/ordenes/obtenerTiposArranque",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.dsTiposArranque = data;
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR'), 2000);
                    }
                    //Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_MATERIALES'), 2000);
                });

                self.grid = this.$("#gridSeleccionArranque").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t("ORDENES_ARRANQUE") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    dataSource: {
                        pageSize: 50,
                        transport: {
                            read: {
                                url: "../api/GetOrdenesArranque/",
                                dataType: "json",
                                contentType: "application/json; charset=utf-8",
                                type: "POST"
                            },
                            parameterMap: function (options, operation) {
                                if (operation === "read") {
                                    var result = {};
                                    result.fechaInicio = self.inicio;
                                    result.fechaFin = self.fin;
                                    result.idLinea = self.linea;

                                    return JSON.stringify(result);
                                }

                                return kendo.stringify(options);
                            }
                        },
                        //filter: filtros,
                        schema: {
                            model: {
                                id: "Id",
                                fields: {
                                    Id: { type: "string", editable: false, nullable: false },
                                    Linea: { type: "number" },
                                    IdLinea: { type: "string" },
                                    DescripcionLinea: { type: "string" },
                                    TipoArranque: { type: "number" },
                                    TipoTurnoId: { type: "string" },
                                    TipoTurno: { type: "string" },
                                    FechaTurno: { type: "date" },
                                    InicioReal: { type: "date" },
                                    IDProductoEntrante: { type: "string" },
                                    ProductoEntrante: { type: "string" },
                                    MinutosFinal1: { type: "number" },
                                    MinutosFinal2: { type: "number" },
                                    MinutosObjetivo1: { type: "number" },
                                    MinutosObjetivo2: { type: "number" },
                                    NumLineaDescripcion: { type: "string" },
                                    TiempoPreactor: { type: "number" }
                                },
                            },
                        },
                        requestStart: function () {
                            if (this.data().length == 0) {
                                kendo.ui.progress($("#gridSeleccionArranque"), true);
                            }
                        },
                        requestEnd: function () {
                            if (this.data().length == 0) {
                                kendo.ui.progress($("#gridSeleccionArranque"), false);
                            }
                        },
                        error: function (e) {
                            if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);

                                if (self.id != 'divHTMLContenido') {
                                    $("#" + this.id).empty();
                                } else {
                                    $("#center-pane").empty();
                                }
                            }
                        }
                    },
                    dataBinding: (this.id == 'divHTMLContenido' ? function () { self.resizeGrid("center-pane"); } : function () { self.resizeGrid(self.id); }),
                    sortable: true,
                    resizable: true,
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
                    columns: [
                        {
                            command:
                            {
                                template: "<a id='btnEditar' class='k-button k-grid-edit' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                            },
                            title: window.app.idioma.t("EDITAR"),
                            width: "50px"
                        },
                        {
                            command:
                            {
                                template: "<a id='btnEliminar' class='k-button k-grid-delete' style='min-width:16px;'><span class='k-icon k-delete'></span></a>"
                            },
                            title: window.app.idioma.t("ELIMINAR"),
                            width: "50px"
                        },
                        {
                            field: "IndicadorLlenadora",
                            title: window.app.idioma.t("INDICADOR_LLENADORA"),
                            template: "<img id='imgEstado' src='img/KOP_#= IndicadorLlenadora #.png'></img>",
                            width: 50,
                            filterable: false,
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            field: "IndicadorPaletizadora",
                            title: window.app.idioma.t("INDICADOR_PALETIZADORA"),
                            template: "<img id='imgEstado' src='img/KOP_#= IndicadorPaletizadora #.png'></img>",
                            width: 50,
                            filterable: false,
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            field: "Linea",
                            title: window.app.idioma.t("LINEA"),
                            template: "#: window.app.idioma.t('LINEA') # #: NumLineaDescripcion # - #: DescripcionLinea #",
                            width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#: window.app.idioma.t('LINEA') # #: NumLineaDescripcion # - #: DescripcionLinea #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Id",
                            title: window.app.idioma.t("ORDEN_ID"),
                            width: 80,
                            filterable: true
                        },
                        {
                            field: "DESC_ARRANQUE",
                            title: window.app.idioma.t("TIPO_ARRANQUE"),
                            width: 90,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#= DESC_ARRANQUE#' style='width: 14px;height:14px;margin-right:5px;'/>#= DESC_ARRANQUE#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "TipoTurnoId",
                            title: window.app.idioma.t("TURNO"),
                            width: 90,
                            template: "#if(TipoTurnoId){# #: window.app.idioma.t('TURNO'+TipoTurnoId) # #}#",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=TipoTurnoId#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t('TURNO'+TipoTurnoId)#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "InicioReal", title: window.app.idioma.t("INICIO_REAL"), width: 100,
                            format: "{0:" + kendo.culture().calendar.patterns.MES_FechaHora + "}",
                            filterable: {
                                extra: true, // agomezn 300516: 010 Al filtrar los log por fecha no sale nada no tiene el mismo formato de fecha
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: "dd/MM/yyyy HH:mm:ss",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                            //template: "#= kendo.toString( new Date(InicioReal.getTime() - InicioReal.getTimezoneOffset() * 60 * 1000) ,'dd/MM/yyyy HH:mm:ss')#"
                        },
                        {
                            field: "IDProductoEntrante",
                            title: window.app.idioma.t("CODIGO_PRODUCTO_ENTRANTE"),
                            width: 70,
                            filterable: true
                        },
                        {
                            field: "ProductoEntrante",
                            title: window.app.idioma.t("PRODUCTO_ENTRANTE"),
                            width: 150,
                            filterable: true
                        },
                        {
                            field: "MinutosFinal1",
                            title: window.app.idioma.t("DURACION_LLENADORA"),
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
                            field: "MinutosFinal2",
                            title: window.app.idioma.t("DURACION_PALETIZADORA"),
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
                            field: "MinutosObjetivo1",
                            title: window.app.idioma.t("TIEMPO_OBJETIVO_LLENADORA"),
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
                            field: "MinutosObjetivo2",
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
                            field: "TiempoPreactor",
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
                        kendo.ui.progress($("#gridSeleccionArranque"), true);
                        var sheet = e.workbook.sheets[0];

                        var template1 = kendo.template("#if(TipoTurnoId){# #: window.app.idioma.t('TURNO'+TipoTurnoId) # #}#");

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];

                                var dataItem1 = {
                                    TipoTurnoId: row.cells[5].value
                                };

                                row.cells[2].value = window.app.idioma.t('LINEA') + ' ' + e.data[dataPosition].NumLineaDescripcion + ' - ' + e.data[dataPosition].DescripcionLinea;
                                row.cells[5].value = template1(dataItem1);
                                row.cells[6].value = kendo.toString(row.cells[6].value, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                            } catch (e) {
                            }
                        }
                        kendo.ui.progress($("#gridSeleccionArranque"), false);
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip(self.grid);
            },
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnExportExcel': 'exportExcel',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid', // agomezn 270516: 040 Incluir un botón "Limpiar filtros" en las páginas donde se usen filtros
                'click #btnEditar': 'editarOrdenArranque',
                'click #btnEliminar': 'eliminarOrdenArranque',
                'click #btnCrearOrdenArranque': 'crearOrdenArranque'
            },
            crearOrdenArranque: function () {
                var self = this;
                var permiso = TienePermiso(81);

                if (permiso) {
                    self.vistaCrearOrden = new VistaCrearNuevaOrdenArranque("0", "0", null);
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                }
            },
            eliminarOrdenArranque: function (e) {
                var self = this;
                var permiso = TienePermiso(81);

                if (permiso) {
                    this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('ELIMINAR_ORDEN_DE'), msg: window.app.idioma.t('DESEA_REALMENTE_ELIMINAR_ESTA_ORDEN'), funcion: function () { self.confirmaEliminacion(e); }, contexto: this });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                }
            },
            confirmaEliminacion: function (e) {
                var self = this;

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var dataRow = self.$("#gridSeleccionArranque").data("kendoGrid").dataItem(tr);

                var datosArranque = {};

                datosArranque.idOrden = dataRow.Id;

                $.ajax({
                    type: "POST",
                    url: "../api/eliminarOrdenArranqueCambio/",
                    dataType: 'json',
                    data: JSON.stringify(datosArranque),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    Backbone.trigger('eventCierraDialogo');

                    if (res.succeeded) {
                        $("#gridSeleccionArranque").data('kendoGrid').dataSource.read();
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ORDEN_ELIMINADA'), 3000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), res.message, 2000);
                    }
                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EDITAR_ORDEN'), 2000);
                });
            },
            editarOrdenArranque: function (e) {
                var self = this;
                var permiso = TienePermiso(81);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    return;
                }

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var dataRow = self.grid.dataItem(tr);

                self.vistaActualiza = new VistaCrearNuevaOrdenArranque("1", "0", dataRow);
            },
            actualiza: function () {
                var self = this;
                self.inicio = $("#dtpFechaDesde").data("kendoDatePicker").value();
                self.fin = $("#dtpFechaHasta").data("kendoDatePicker").value();

                if (!self.inicio || !self.fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LAS_FECHAS_INTRODUCIDAS'), 3000);
                    return;
                }

                if (self.inicio > self.fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('_LA_FECHA'), 3000);
                    return;
                }

                self.grid.dataSource.read();
            },
            exportExcel: function () {
                kendo.ui.progress($("#gridSeleccionArranque"), true);
                var grid = $("#gridSeleccionArranque").data("kendoGrid");
                grid.saveAsExcel();
                kendo.ui.progress($("#gridSeleccionArranque"), false);
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
            resizeGrid: function (panel) {
                var contenedorHeight = $("#" + panel).innerHeight();
                var cabeceraHeight = 0;
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();
                if (panel == "center-pane") cabeceraHeight = $("#divCabeceraVista").innerHeight();

                var gridElement = $("#gridSeleccionArranque"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                //dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            },
            LimpiarFiltroGrid: function () { // agomezn 270516: 040 Incluir un botón "Limpiar filtros" en las páginas donde se usen filtros
                if ($("#gridSeleccionArranque").data("kendoGrid").dataSource.filter() != undefined) {
                    $("form.k-filter-menu button[type='reset']").trigger("click");
                }
            },
        });

        return VistaOrdenesArranque;
    });