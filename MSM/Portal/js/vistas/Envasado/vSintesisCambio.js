define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/SintesisCambio.html', 'compartido/notificaciones',
        'vistas/vDialogoConfirm', 'jszip', 'compartido/util', 'vistas/Envasado/vEditarAccionMejora'],
    function (_, Backbone, $, PlantillaSintesisCambios, Not, VistaDlgConfirm, JSZip, util, VistaEditarAccionMejora) {
        var VistaSintesisCambios = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            //vistaFormCrearAccionMejora: null,
            dataItemSel: -1,
            inicio: new Date((new Date()).getTime() - (15 * 24 * 3600 * 1000)),
            fin: new Date(),
            ds: null,
            vista: null,
            template: _.template(PlantillaSintesisCambios),
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);
                self.ds = self.getDataSource(self);
                self.render();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                $("#divFiltrosParosHeader").hide();
                $("#gridSintesisTurnoCambios").hide();

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

                //Bloque Acciones de mejora
                //-------------------------

                this.$("#gridAccionesMejora").kendoGrid({
                    autoBind: false,
                    dataSource: self.ds,
                    detailTemplate: kendo.template(this.$("#templateAccionesMejora").html()),
                    //detailInit: this.detailInit,
                    detailExpand: function (e) {
                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                    },
                    excel: {
                        fileName: window.app.idioma.t('EXCEL_SINTESIS_CAMBIO') + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    sortable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        buttonCount: 5,
                        pageSizes: [50, 100, 200, 'All'],
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "numeroLinea",
                            title: window.app.idioma.t("LINEA"),
                            template: window.app.idioma.t("LINEA") + " #: numeroLineaDescripcion # - #: nombreLinea#",
                            width: "200px",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#:numeroLinea#' style='width: 14px;height:14px;margin-right:5px;'/>" + window.app.idioma.t('LINEA') + " #: numeroLineaDescripcion # - #: nombreLinea#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "fechaAlta", title: window.app.idioma.t("FECHA_ALTA"), width: "130px",
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            template: '#: kendo.toString(new Date(fechaAlta),"dd/MM/yyyy")#'
                        },
                        {
                            field: "fechaTurno", title: window.app.idioma.t("FECHA_TURNO"), width: "130px",
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            template: '#= fechaTurno.getFullYear() === 1 ? "" : kendo.toString(new Date(fechaTurno), "dd/MM/yyyy") #',
                        },
                        {
                            field: "tipoTurno", title: window.app.idioma.t("TURNO"), width: "110px",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=tipoTurno#' style='width: 14px;height:14px;margin-right:5px;'/>#= tipoTurno#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "usuario", title: window.app.idioma.t("USUARIO"), width: "110px",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=usuario#' style='width: 14px;height:14px;margin-right:5px;'/>#= usuario#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "fechaFinalizada", title: window.app.idioma.t("FECHA_FINALIZADA"), width: "150px",
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            template: '#if(fechaFinalizada){# #: kendo.toString(new Date(fechaFinalizada),"dd/MM/yyyy")# #}#'
                        },
                        {
                            title: "",
                            template: "<a id='btnEditar' class='k-button' style='min-width:16px;'><span class='k-icon k-edit'></span></a>",
                            //href='\\#EditarAccionMejora/#: id #'
                            width: "60px"
                        },
                        {
                            command: [{
                                name: "destroy",
                                template: "<a id='btnBorrar' class='k-button k-grid-delete' href='' style='min-width:16px;'><span class='k-icon k-delete'></span></a>"
                            }],
                            width: "60px"
                        }
                    ],
                    selectable: true,
                    change: function (e) {
                        var selectedRows = this.select();

                        for (var i = 0; i < selectedRows.length; i++) {
                            var dataItem = this.dataItem(selectedRows[i]);
                            self.dataItemSel = dataItem.id;
                            var urlSplit = $("#gridSintesisTurnoCambios").data("kendoGrid").dataSource.transport.options.read.url.split('/');
                            urlSplit[3] = self.dataItemSel;
                            $("#gridSintesisTurnoCambios").data("kendoGrid").dataSource.transport.options.read.url = urlSplit.join('/');
                            $("#gridSintesisTurnoCambios").data("kendoGrid").dataSource.read();
                            $("#divFiltrosParosHeader").show();
                            $("#gridSintesisTurnoCambios").show();
                            
                            break;
                        }
                    },
                    detailInit: function (e) {
                        var detailRow = e.detailRow;

                        detailRow.find(".container").kendoTabStrip({
                            animation: {
                                open: { effects: "fadeIn" }
                            }
                        });
                    },
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        // Modificar los datos de la tabla
                        for (var rowIndex = 1; rowIndex < sheet.rows.length; rowIndex++) {
                            var dataPosition = rowIndex - 1;
                            var row = sheet.rows[rowIndex];

                            //field: "fechaTurno"
                            row.cells[1].value = e.data[dataPosition].fechaTurno.getFullYear() === 1 ? '' : kendo.toString(e.data[dataPosition].fechaTurno, "dd/MM/yyyy");

                            //field: Linea
                            row.cells[4].value = window.app.idioma.t('LINEA') + ' ' + e.data[dataPosition].numeroLineaDescripcion + ' - ' + e.data[dataPosition].nombreLinea;

                            // Aplicar color de fondo a las filas pares
                            if (rowIndex % 2 == 0) {
                                for (var cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
                                    $.extend(row.cells[cellIndex], util.ui.default.excelCellEvenRow);
                                }
                            }
                        }
                    }
                });

                //Bloque Cambios
                //-----------------------

                this.$("#gridSintesisTurnoCambios").kendoGrid({
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/accionesMejora/" + self.dataItemSel + "/Cambios",
                                dataType: "json",
                                contentType: "application/json; charset=utf-8",
                                type: "GET"
                            },
                        },
                        pageSize: 50,
                        schema: {
                            model: {
                                id: "Id",
                                fields: {
                                    Id: { type: "string", editable: false, nullable: false },
                                    Linea: { type: "number" },
                                    TipoTurnoId: { type: "string" },
                                    TipoTurno: { type: "string" },
                                    FechaTurno: { type: "date" },
                                    InicioReal: { type: "date" },
                                    IDProductoEntrante: { type: "string" },
                                    ProductoEntrante: { type: "string" },
                                    IDProductoSaliente: { type: "string" },
                                    ProductoSaliente: { type: "string" },
                                    MinutosFinal1: { type: "number" },
                                    MinutosFinal2: { type: "number" },
                                    MinutosObjetivo1: { type: "number" },
                                    MinutosObjetivo2: { type: "number" },
                                    NumLineaDescripcion: { type: "string" },
                                },
                                getProductoEntrante: function () {
                                    if (this.IDProductoEntrante) {
                                        return this.IDProductoEntrante + " - " + this.ProductoEntrante;
                                    } else {
                                        return '';
                                    }
                                },
                                getProductoSaliente: function () {
                                    if (this.IDProductoSaliente) {
                                        return this.IDProductoSaliente + " - " + this.ProductoSaliente;
                                    } else {
                                        return '';
                                    }
                                }
                            }
                        }
                    },
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
                        pageSizes: [50, 100, 200],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "Linea",
                            title: window.app.idioma.t("LINEA"),
                            template: "#: window.app.idioma.t('LINEA') # #: NumLineaDescripcion # - #: DescripcionLinea #",
                            width: 100,
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
                            field: "TipoTurnoId",
                            title: window.app.idioma.t("TURNO"),
                            template: "#if(TipoTurnoId){# #: window.app.idioma.t('TURNO'+TipoTurnoId) # #}#",
                            width: 100,
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
                            field: "FechaTurno", title: window.app.idioma.t("FECHA"), width: 100,
                            template: '#if(FechaTurno){# #: kendo.toString(new Date(FechaTurno),"dd/MM/yyyy")# #}#',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "InicioReal", title: window.app.idioma.t("INICIO_REAL"), width: 100,
                            template: '#if(InicioReal){# #: kendo.toString(new Date(InicioReal),"dd/MM/yyyy HH:mm:ss")# #}#',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: "dd/MM/yyyy HH:mm:ss",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "getProductoEntrante()",
                            title: window.app.idioma.t("PRODUCTO_ENTRANTE"),
                            //template: "#= IDProductoEntrante # - #= ProductoEntrante #",
                            width: 100,
                            filterable: true
                        },
                        {
                            field: "getProductoSaliente()",
                            title: window.app.idioma.t("PRODUCTO_SALIENTE"),
                            //template: "#= IDProductoSaliente # - #= ProductoSaliente #",
                            width: 100,
                            filterable: true
                        },
                        {
                            field: "MinutosFinal1",
                            title: window.app.idioma.t("DURACION_LLENADORA"),
                            width: 100,
                            //template: ' #=  window.app.getDateFormat(MinutosFinal1 * 60) #',
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
                            title: window.app.idioma.t("DURACION_PALETIZADORA") ,
                            width: 100,
                            //template: ' #=  window.app.getDateFormat(MinutosFinal2 * 60) #',
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
                            width: 100,
                            //template: ' #=  window.app.getDateFormat(MinutosObjetivo1 * 60) #',
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
                            width: 100,
                            //template: ' #=  window.app.getDateFormat(MinutosObjetivo2 * 60) #',
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
                    dataBinding: self.resizeGrid,
                });
            },
            getDataSource: function (self) {
                var ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/accionesMejora",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.fInicio = self.inicio;
                                result.fFin = self.fin;
                                result.tipo = 1

                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: "number", editable: false, nullable: false },
                                fechaAlta: { type: "date" },
                                fechaTurno: { type: "date" },
                                tipoTurno: { type: "string" },
                                usuario: { type: "string" },
                                fechaFinalizada: { type: "date" },

                                descripcionProblema: { type: "string" },
                                causa: { type: "string" },
                                accionPropuesta: { type: "string" },
                                observaciones: { type: "string" },

                                idLinea: { type: "string" },
                                numeroLinea: { type: "string" },
                                nombreLinea: { type: "string" },

                                idMaquina: { type: "string" },
                                nombreMaquina: { type: "string" },

                                idEquipoConstructivo: { type: "number" },
                                nombreEquipoConstructivo: { type: "string" },
                                numeroLineaDescripcion: { type: "string" }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            $("#center-pane").empty();
                        }
                    }
                });

                return ds;
            },
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
                'click #btnExportExcel': 'exportExcel',
                'click #btnCrearAccionMejora': 'crearAccionMejora',
                'click #btnEditar': 'editar',
                'click #btnBorrar': 'confirmarBorrado',
                'click #btnLimpiarFiltrosParos': 'limpiarFiltroGridParos'
            },
            actualiza: function () {
                var self = this;
                $("form.k-filter-menu button[type='reset']").trigger("click");
                self.inicio = $("#dtpFechaDesde").data("kendoDatePicker").value();
                self.fin = $("#dtpFechaHasta").data("kendoDatePicker").value();
                self.ds = self.getDataSource(self);
                $("#gridAccionesMejora").data('kendoGrid').setDataSource(self.ds);
                self.ds.page(1);
            },
            crearAccionMejora: function () {
                var permiso = TienePermiso(83);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                window.location.hash = "CrearAccionMejora/1";
            },
            editar: function (e) {
                var self = this;
                var permiso = TienePermiso(83);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var tr = $(e.target.parentNode.parentNode).closest("tr");
                var data = self.$("#gridAccionesMejora").data("kendoGrid").dataItem(tr);

                self.vista = new VistaEditarAccionMejora(data);
                $('#idSintesisCambio').hide();
            },
            eliminar: function () {
                if (this.vista) {
                    this.vista.eliminar();
                }
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            confirmarBorrado: function (e) {
                e.preventDefault()
                var self = this;
                var permiso = TienePermiso(83);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ELIMINAR_SÍNTESIS_DE'),
                    msg: window.app.idioma.t('SEGURO_QUE_DESEA'),
                    funcion: function () { self.borrarSintesisCambio(e); },
                    contexto: this
                });
            },
            borrarSintesisCambio: function (e) {
                var self = this;
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = $("#gridAccionesMejora").data('kendoGrid').dataItem(tr);

                $.ajax({
                    url: "/api/accionesMejora/eliminar/" + data.id,
                    dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                    // send the destroyed data items as the "models" service parameter encoded in JSON                                
                    success: function (result) {
                        // notify the data source that the request succeeded
                        $("#gridAccionesMejora").data('kendoGrid').dataSource.read();
                        $("#gridAccionesMejora").data('kendoGrid').refresh();
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_ELIMINADO_ACCION_MEJORA'), 4000);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (result, status, ex) {
                        // notify the data source that the request failed
                        if (result.status == '403' && result.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ELIMINANDO_UNA_ACCION') + ex, 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosGrid1Height = $("#divFiltrosParosHeader").innerHeight();
                var filtrosSeparadorGridHeight = $("#divSeparadorGrids").innerHeight();
                var filtrosGrid2Height = $("#divFiltrosAccionesMejora").innerHeight();

                //Grid 1
                var gridElement = $("#gridSintesisTurnoCambios"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight / 2 - otherElementsHeight - cabeceraHeight / 2 - filtrosGrid1Height - filtrosSeparadorGridHeight / 2 - 2);

                //Grid 2
                var gridElement2 = $("#gridAccionesMejora"),
                    dataArea2 = gridElement2.find(".k-grid-content"),
                    gridHeight2 = gridElement2.innerHeight(),
                    otherElements2 = gridElement2.children().not(".k-grid-content"),
                    otherElementsHeight2 = 0;
                otherElements2.each(function () {
                    otherElementsHeight2 += $(this).outerHeight();
                });
                dataArea2.height(contenedorHeight / 2 - otherElementsHeight2 - cabeceraHeight / 2 - filtrosGrid2Height - filtrosSeparadorGridHeight / 2 - 2);
            },
            limpiarFiltroGrid: function () { // agomezn 270516: 040 Incluir un botón "Limpiar filtros" en las páginas donde se usen filtros
                $("#gridAccionesMejora").data("kendoGrid").dataSource.filter({});
            },
            limpiarFiltroGridParos: function () {
                $("#gridSintesisTurnoCambios").data("kendoGrid").dataSource.filter({});
            },
            exportExcel: function () {
                kendo.ui.progress($("#gridAccionesMejora"), true);
                var grid = $("#gridAccionesMejora").data("kendoGrid");
                grid.saveAsExcel();
                kendo.ui.progress($("#gridAccionesMejora"), false);
            },
        });

        return VistaSintesisCambios;
    });
