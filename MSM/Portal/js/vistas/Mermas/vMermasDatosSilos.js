define(['underscore', 'backbone', 'jquery', 'text!../../../Mermas/html/MermasDatosSilos.html', 'vistas/vDialogoConfirm',
    'compartido/notificaciones', 'jszip', '../../../../Portal/js/constantes', 'compartido/util'],
    function (_, Backbone, $, PlantillaMermasDatosSilos, VistaDlgConfirm, Not, JSZip, enums, util) {
        var VistaDatosMermas = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            tipoTurno: null,
            grid: null,
            fecha: new Date().midnight(),
            fechaCargada: null,
            template: _.template(PlantillaMermasDatosSilos),
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.getDataSource();
                self.render();

                self.$("[data-funcion]").checkSecurity();
            },
            getDataSource: function () {
                var self = this;

                self.dsDatosMermas = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/CalculoMermas/ObtenerDatosCalculoMermas",
                            data: function () {
                                var desdePicker = $("#dtpFechaDesde").getKendoDateTimePicker();
                                var hastaPicker = $("#dtpFecha").getKendoDateTimePicker();

                                var desdeDate = (desdePicker && desdePicker.value()) ? desdePicker.value() : null;
                                var hastaDate = (hastaPicker && hastaPicker.value()) ? hastaPicker.value() : null;

                                return {
                                    fechaDesde: desdeDate ? desdeDate.toISOString() : null,
                                    fechaHasta: hastaDate ? hastaDate.toISOString() : null,
                                    zona: "Silos",
                                    tipo: ""
                                };
                            },
                            dataType: "json",
                            type: "GET"
                        },
                    },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                Id: { type: "number" },
                                Fecha: { type: "date" },
                                Direccion: { type: "string" },

                                Linea: { type: "number" },
                                IdMovimiento: { type: "number" }, 
                                UbicacionSiloOrigen: { type: "string" },

                                IdLoteOrigen: { type: "number" },
                                IdTipoMaterialMovimientoOrigen: { type: "number" },
                                LoteMESOrigen: { type: "string" },
                                IdClaseMaterialOrigen: { type: "string" }, 
                                IdUbicacionOrigen: { type: "number" },
                                UbicacionOrigen: { type: "string" },

                                IdLoteDestino: { type: "number" },
                                IdTipoMaterialMovimientoDestino: { type: "number" },
                                LoteMESDestino: { type: "string" },
                                IdClaseMaterialDestino: { type: "string" }, 
                                IdUbicacionDestino: { type: "number" },
                                UbicacionDestino: { type: "string" },

                                CodProducto: { type: "string" },
                                DescripcionProducto: { type: "string" },

                                SSCC: { type: "string" },
                                CodWO: { type: "string" },

                                Cantidad: { type: "number" },
                                Rendimiento: { type: "number" },
                                Humedad: { type: "number" },
                                Extracto: { type: "number" },
                                GradoPlato: { type: "number" },
                                FormulaCalculo: { type: "number" },

                                Editado: { type: "boolean" },
                                Borrado: { type: "boolean" },

                                Creado: { type: "date" },
                                CreadoPor: { type: "string" },
                                Actualizado: { type: "date" },
                                ActualizadoPor: { type: "string" }
                            }
                        }
                    },
                    aggregate: [
                        { field: "Cantidad", aggregate: "sum" },
                        { field: "Extracto", aggregate: "sum" },
                    ],
                    error: function (e) {
                        if (e.status === 403 && e.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER') + ' ObtenerDatosCalculoMermas', 4000);
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                DestruirKendoWidgets(self);

                var ExtGrid = window.app.cfgKendo.extGridToolbarColumnMenu;
                kendo.ui.plugin(ExtGrid);

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                // Asignamos valores a fechas

                self.fecha.setHours(23, 59, 59, 999);
                $("#dtpFecha").kendoDateTimePicker({
                    value: self.fecha,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    change: function (e) {
                        var desdePicker = $("#dtpFechaDesde").getKendoDateTimePicker();
                        if (desdePicker && desdePicker.value()) {
                            $("#desdeFecha").html(kendo.toString(desdePicker.value(), kendo.culture().calendars.standard.patterns.MES_FechaHora));
                        }
                    }
                });

                var fechaDes = self.fecha.addDays(-30);
                fechaDes.setHours(00, 00, 00, 000);
                $("#dtpFechaDesde").kendoDateTimePicker({
                    value: fechaDes,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    change: function (e) {
                        var desdeVal = this.value();
                        $("#desdeFecha").html(desdeVal ? kendo.toString(desdeVal, kendo.culture().calendars.standard.patterns.MES_FechaHora) : "");
                    }
                });

                var inicialDesde = $("#dtpFechaDesde").getKendoDateTimePicker().value();
                $("#desdeFecha").html(inicialDesde ? kendo.toString(inicialDesde, kendo.culture().calendars.standard.patterns.MES_FechaHora) : "");

                self.grid = this.$("#gridDatosMermas").kendoExtGrid({
                    autoBind: false,
                    dataSource: self.dsDatosMermas,
                    groupable: {
                        messages: {
                            empty: window.app.idioma.t('ARRASTRAR_SOLTAR')
                        }
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
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    excel: util.ui.default.gridExcelDate('DATOS_SILOS'),
                    excelExport: async function (e) {
                        ExcelGridExtra(e, util);
                    },
                    columns: [
                        {
                            headerTemplate: "<span></span>",
                            template: "<input type='checkbox' class='row-checkbox' />",
                            width: 40,
                            sortable: false,
                            filterable: false
                        },
                        {
                            hidden: true,
                            field: "Id",
                            title: "Id",
                            width: 60
                        },
                        {
                            field: "Fecha",
                            title: window.app.idioma.t("FECHA"),
                            width: 140,
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.Fecha ? GetDateForExcel(value.Fecha) : '' #",
                                width: 150
                            },
                            template: "#= Fecha ? kendo.toString(Fecha, kendo.culture().calendars.standard.patterns.MES_FechaHora) : '' #",
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
                            field: "Direccion",
                            title: window.app.idioma.t("DIRECCION"),
                            width: 70,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    return "<div><label><input type='checkbox' value='#=Direccion#' style='width: 14px;height:14px;margin-right:5px;'/>#= Direccion#</label></div>";
                                }
                            }
                        },
                        {
                            hidden: true,
                            field: "IdMovimiento",
                            title: "IdMovimiento",
                            width: 70
                        },
                        {
                            field: "CodProducto",
                            title: window.app.idioma.t("CODIGO_PRODUCTO"),
                            width: 70,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field == "all" ?
                                        "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                        "<div><label><input type='checkbox' value='#=CodProducto#' style='width: 14px;height:14px;margin-right:5px;'/>#= CodProducto# - #= DescripcionProducto#</label></div>";
                                }
                            }
                        },
                        {
                            field: "DescripcionProducto",
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                            width: 120,
                            filterable: true
                        },                        
                        {
                            hidden: true,
                            field: "IdUbicacionOrigen",
                            title: "IdUbicacionOrigen",
                            width: 80,
                            filterable: {
                                multi: true
                            }
                        },
                        {
                            hidden: false,
                            field: "UbicacionOrigen",
                            title: window.app.idioma.t("UBICACION_ORIGEN"),
                            width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    return "<div><label><input type='checkbox' value='#=UbicacionOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#= UbicacionOrigen#</label></div>";
                                }
                            }
                        },
                        {
                            field: "LoteMESOrigen",
                            title: "Lote Origen",
                            width: 460,
                            filterable: true
                        },
                        {
                            hidden: true,
                            field: "IdLoteOrigen",
                            title: "IdLoteOrigen",
                            width: 80
                        },
                        {
                            hidden: true,
                            field: "IdTipoMaterialMovimientoOrigen",
                            title: "IdTipoMaterialMovimientoOrigen",
                            width: 60
                        },
                        {
                            hidden: true,
                            field: "IdUbicacionDestino",
                            title: "IdUbicacionDestino",
                            width: 80,
                            filterable: {
                                multi: true
                            }
                        },
                        {
                            hidden: false,
                            field: "UbicacionDestino",
                            title: window.app.idioma.t("UBICACION_DESTINO"),
                            width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    return "<div><label><input type='checkbox' value='#=UbicacionDestino#' style='width: 14px;height:14px;margin-right:5px;'/>#= UbicacionDestino#</label></div>";
                                }
                            }
                        },
                        {
                            hidden: false,
                            field: "LoteMESDestino",
                            title: "Lote Destino",
                            width: 460,
                            filterable: true
                        },
                        {
                            hidden: true,
                            field: "IdLoteDestino",
                            title: "IdLoteDestino",
                            width: 80
                        },
                        {
                            hidden: true,
                            field: "IdTipoMaterialMovimientoDestino",
                            title: "IdTipoMaterialMovimientoDestino",
                            width: 60
                        },
                        {
                            hidden: false,
                            field: "UbicacionSiloOrigen",
                            title: window.app.idioma.t("SILO_ORIGEN"),
                            width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    return "<div><label><input type='checkbox' value='#=UbicacionSiloOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#= UbicacionSiloOrigen#</label></div>";
                                }
                            }
                        },
                        {
                            field: "Cantidad",
                            title: window.app.idioma.t("CANTIDAD"),
                            format: "{0:n2}",
                            aggregates: ["sum"],
                            width: 110,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "n2",
                                        decimals: 2,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "Rendimiento",
                            title: window.app.idioma.t("RENDIMIENTO"),
                            format: "{0:n2}",
                            width: 110,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "n2",
                                        decimals: 2
                                    });
                                }
                            }
                        },
                        {
                            field: "Humedad",
                            title: window.app.idioma.t("HUMEDAD"),
                            format: "{0:n2}",
                            width: 110,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "n2",
                                        decimals: 2
                                    });
                                }
                            }
                        },
                        {
                            field: "Extracto",
                            title: "Kg " + window.app.idioma.t("EXTRACTO"),
                            format: "{0:n2}",
                            width: 110,
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "n2",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            hidden: true,
                            field: "GradoPlato",
                            title: "ºP",
                            template: "#= GradoPlato != null ? kendo.format('{0:n2}', GradoPlato) : '' #",
                            width: 70,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "n2",
                                        decimals: 2
                                    });
                                }
                            }
                        },
                        {
                            hidden: true,
                            field: "Editado",
                            title: "Editado",
                            width: 80
                        },
                        {
                            hidden: true,
                            field: "Borrado",
                            title: "Borrado",
                            width: 80
                        },
                        {
                            hidden: true,
                            field: "Creado",
                            title: "Creado",
                            width: 140
                        },
                        {
                            hidden: true,
                            field: "CreadoPor",
                            title: "CreadoPor",
                            width: 140
                        },
                        {
                            hidden: true,
                            field: "Actualizado",
                            title: "Actualizado",
                            width: 140
                        },
                        {
                            hidden: true,
                            field: "ActualizadoPor",
                            title: "ActualizadoPor",
                            width: 140
                        }
                    ],
                    dataBinding: self.resizeGrid,
                    dataBound: function (e) {
                        self.fechaCargada = $("#dtpFecha").getKendoDateTimePicker().value();
                    },
                }).data("kendoExtGrid");

                window.app.headerGridTooltip($("#gridDatosMermas").data("kendoExtGrid"));

                self.resizeGrid();
            },
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnEditar': 'confirmarEditarMovimientos',
                'click #btnEliminar': 'confirmarEliminarMovimientos',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnExportarExcel': 'exportarExcel',
            },
            exportarExcel: function () {
                var grid = $("#gridDatosMermas").data("kendoExtGrid");
                if (!grid) return;
                grid.saveAsExcel();
            },
            actualiza: function () {
                var self = this;

                var desde = $("#dtpFechaDesde").getKendoDateTimePicker().value();
                var hasta = $("#dtpFecha").getKendoDateTimePicker().value();

                //Validamos fechas
                if (!desde || !hasta) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LAS_FECHAS_INTRODUCIDAS'), 4000);
                    return;
                }

                if (desde >= hasta) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('_LA_FECHA'), 4000);
                    return;
                }

                // actualizar fecha de referencia
                self.fecha = hasta;

                RecargarGrid({ grid: self.grid });
            },

            confirmarEditarMovimientos: function () {
                var self = this;
                var permiso = TienePermiso(426);
                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $("#gridDatosMermas").data("kendoExtGrid") || $("#gridDatosMermas").data("kendoGrid");
                if (!grid) return;

                // Validaciones
                var $checked = grid.tbody.find(".row-checkbox:checked");
                if (!$checked || $checked.length === 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                if ($checked.length > 1) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_ELEGIR_SOLO_UN_REGISTRO'));
                    return;
                }

                var dataItem = grid.dataItem($checked.closest("tr"));

                var tplHtml = $("#templateEditar").html() || "";
                try { tplHtml = _.template(tplHtml)(); } catch (ex) { /**/ }

                // Ventana edición
                var win = $("<div/>").kendoWindow({
                    title: window.app.idioma.t("EDITAR"),
                    modal: true,
                    resizable: false,
                    width: "460px",
                    close: function () { this.destroy(); }
                }).data("kendoWindow");

                win.content(tplHtml);
                win.center().open();

                var $win = win.element;

                // Inicializar widgets dentro de la ventana
                var cantidadInit = (typeof dataItem.Cantidad !== "undefined" && dataItem.Cantidad !== null) ? Number(dataItem.Cantidad) : null;
                var rendimientoInit = (typeof dataItem.Rendimiento !== "undefined" && dataItem.Rendimiento !== null) ? Number(dataItem.Rendimiento) : null;
                var humedadInit = (typeof dataItem.Humedad !== "undefined" && dataItem.Humedad !== null) ? Number(dataItem.Humedad) : null;

                // Formateamos inputs
                $win.find("#editCantidad").kendoNumericTextBox({
                    format: "n2",
                    decimals: 2,
                    value: cantidadInit,
                    min: 0
                });
                $win.find("#editRendimiento").kendoNumericTextBox({
                    format: "n2",
                    decimals: 2,
                    value: rendimientoInit
                });
                $win.find("#editHumedad").kendoNumericTextBox({
                    format: "n2",
                    decimals: 2,
                    value: humedadInit
                });

                $win.find("#btnAceptarEdicion").off('click').on("click", function () {
                    var cantidad = $win.find("#editCantidad").data("kendoNumericTextBox").value();
                    var rendimiento = $win.find("#editRendimiento").data("kendoNumericTextBox").value();
                    var humedad = $win.find("#editHumedad").data("kendoNumericTextBox").value();

                    var dto = {
                        Id: dataItem.Id,
                        Cantidad: (cantidad === null ? null : cantidad),
                        Rendimiento: (rendimiento === null ? null : rendimiento),
                        Humedad: (humedad === null ? null : humedad),
                        ActualizadoPor: (window.app && window.app.usuario && window.app.usuario.login) ? window.app.usuario.login : null
                    };

                    $.ajax({
                        url: "../api/CalculoMermas/ActualizarDatosCalculoMermas?zona=Silos",
                        type: "PUT",
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(dto),
                        dataType: "json"
                    })
                        .done(function (res) {
                            if (res) {
                                $('#gridDatosMermas').data('kendoExtGrid').dataSource.read();
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ACTUALIZANDO_OK'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACT_DATOS'), 4000);
                            }
                            win.close();
                        })
                        .fail(function (err) {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ACT_DATOS'), 4000);
                            win.close();
                        });
                });

                $win.find("#btnCancelarEdicion").off('click').on("click", function (e) {
                    e.preventDefault();
                    try { win.close(); } catch (ignore) { $win.closest('.k-window').remove(); }
                });

                win.bind("close", function () {
                    $(document).off('keydown.mvEditClose');
                });
            },
            confirmarEliminarMovimientos: function () {
                const self = this;

                const permiso = TienePermiso(426);
                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                // Ventana para eliminar
                const grid = $("#gridDatosMermas").data("kendoExtGrid");
                const seleccionados = [];
                grid.tbody.find(".row-checkbox:checked").each(function () {
                    const dataItem = grid.dataItem($(this).closest("tr"));
                    seleccionados.push(dataItem);
                });

                if (seleccionados.length === 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                self.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t("ELIMINAR"),
                    msg: window.app.idioma.t("CONFIRMAR_ACCION_CANTIDAD")
                        .replace("$num", seleccionados.length)
                        .replace("$accion", window.app.idioma.t("ELIMINAR"))
                        .replace("$tipo", window.app.idioma.t("MOVIMIENTOS")),
                    funcion: function () {
                        self.eliminarMovimientos(seleccionados);
                    },
                    contexto: self
                });
            },
            eliminarMovimientos: function (seleccionados) {
                var self = this;
                if (!seleccionados || seleccionados.length === 0) return;

                var zona = "Silos"; 
                var requests = [];

                seleccionados.forEach(function (item) {
                    var id = item.Id; 
                    var url = "../api/CalculoMermas/BorradoLogicoDatosCalculoMermas?zona=" + encodeURIComponent(zona) + "&id=" + encodeURIComponent(id);

                    var req = $.ajax({
                        url: url,
                        type: "DELETE",
                        dataType: "json"
                    })
                        .done(function (res) {
                            var ok = false;
                            if (typeof res === "boolean") ok = res;
                            else if (res && typeof res.Data !== "undefined") ok = !!res.Data;
                            else ok = !!res;

                            if (ok) {
                                var grid = $('#gridDatosMermas').data('kendoExtGrid') || $('#gridDatosMermas').data('kendoGrid');
                                if (grid && grid.dataSource) grid.dataSource.read();
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_OPERACION_SE'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ELIMINAR_REGISTROS'), 3000);
                            }
                            Backbone.trigger('eventCierraDialogo');
                        })
                        .fail(function (xhr) {
                            if (xhr.status === 403) {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ELIMINAR_REGISTROS'), 3000);
                            }
                            Backbone.trigger('eventCierraDialogo');
                        });

                    requests.push(req);
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
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridDatosMermas"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            },
            LimpiarFiltroGrid: function () {
                const self = this;

                self.dsDatosMermas.query({
                    group: [],
                    filter: [],
                    page: 1
                });
            },
        });

        return VistaDatosMermas;
    });