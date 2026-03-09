define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/RevisionMMPPCoccion.html', 'vistas/vDialogoConfirm',
    'compartido/notificaciones', 'jszip', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, PlantillaRevisionMMPPCoccion, VistaDlgConfirm, Not, JSZip, enums) {
        var VistaConsumo = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            tipoTurno: null,
            grid: null,
            fecha: new Date().midnight(),
            fechaCargada: null,
            template: _.template(PlantillaRevisionMMPPCoccion),
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

                self.dsConsumos = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/controlGestion/revisionMMPPCoccion",
                            data: function () {
                                let result = {};
                                result.fechaDesde = self.fecha.addDays(-1).toISOString();
                                result.fechaHasta = self.fecha.toISOString();

                                return result;
                            },
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            fields: {
                                Ubicacion: { type: "string" },
                                IdMosto: { type: "string" },
                                DescripcionMosto: { type: "string" },
                                CantidadProducida: { type: "number" },
                                GradoPlato: { type: "number" },
                                IdMaterial: { type: "string" },
                                Clase: { type: "string" },
                                DescripcionMaterial: { type: "string" },
                                IdProveedor: { type: "string" },
                                DescripcionProveedor: { type: "string" },
                                LoteProveedor: { type: "string" },
                                Cantidad: { type: "number" },
                                UnidadMedida: { type: "string" },
                                NumCoccion: { type: "number" },
                                Lote: { type: "string" },
                                IdMovimiento: { type: "number" }
                            }
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                DestruirKendoWidgets(self);

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                $("#dtpFecha").kendoDateTimePicker({
                    value: self.fecha,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    change: function (e) {
                        if (this.value()) {
                            $("#desdeFecha").html(kendo.toString(this.value().addHours(-24), kendo.culture().calendars.standard.patterns.MES_FechaHora));
                        }
                    }
                });

                $("#desdeFecha").html(kendo.toString($("#dtpFecha").getKendoDateTimePicker().value().addHours(-24), kendo.culture().calendars.standard.patterns.MES_FechaHora));

                self.grid = this.$("#gridConsumos").kendoGrid({
                    autoBind: false,
                    dataSource: self.dsConsumos,
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
                    columns: [
                        {
                            headerTemplate: "<span></span>", // sin seleccionar todo
                            template: "<input type='checkbox' class='row-checkbox' />",
                            width: 40,
                            sortable: false,
                            filterable: false
                        },
                        {
                            hidden: true,
                            field: "IdMovimiento",
                            title: "IdMovimiento",
                            width: 80,
                        },
                        {
                            field: "Ubicacion",
                            title: window.app.idioma.t("UBICACION"),
                            width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Ubicacion#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Ubicacion #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "NumCoccion",
                            title: window.app.idioma.t("NUMERO_COCCION"),
                            width: 110,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=NumCoccion#' style='//width: 14px;height:14px;margin-right:5px;'/>#= NumCoccion #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            hidden: true,
                            field: "IdMosto",
                            title: window.app.idioma.t("ID_MOSTO"),
                            width: 105,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdMosto#' style='//width: 14px;height:14px;margin-right:5px;'/>#= IdMosto #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionMosto",
                            title: window.app.idioma.t("DESCRIPCION_MOSTO"),
                            width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionMosto#' style='//width: 14px;height:14px;margin-right:5px;'/>#= DescripcionMosto #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CantidadProducida",
                            title: window.app.idioma.t("CANTIDAD") + ' Mosto',
                            format: "{0:n2}",
                            //aggregates: ["sum"],
                            width: 140,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            //groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "GradoPlato",
                            title: "ºP",
                            template: "#=kendo.format('{0:n2}',parseFloat(GradoPlato.toString()))#",
                            width: 70,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            }
                        },
                        {
                            field: "Clase",
                            title: window.app.idioma.t("CLASE_MATERIAL"),
                            width: 130,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Clase#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Clase #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "IdMaterial",
                            title: window.app.idioma.t("CODIGO_MATERIAL"),
                            width: 130,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= IdMaterial #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionMaterial",
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                            width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= DescripcionMaterial #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            hidden: true,
                            field: "IdProveedor", title: window.app.idioma.t("CODIGO_PROVEEDOR"), width: 140,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdProveedor#' style='//width: 14px;height:14px;margin-right:5px;'/>#= IdProveedor #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionProveedor", title: window.app.idioma.t("DESCRIPCION_PROVEEDOR"), width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionProveedor#' style='//width: 14px;height:14px;margin-right:5px;'/>#= DescripcionProveedor #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "LoteProveedor", title: window.app.idioma.t("LOTE_PROVEEDOR"), width: 200,
                            filterable: true,                            
                        },
                        {
                            field: "Cantidad",
                            title: window.app.idioma.t("CANTIDAD_CONSUMIDA"),
                            format: "{0:n2}",
                            aggregates: ["sum"],
                            width: 135,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            hidden: true,
                            field: "Coeficiente",
                            title: window.app.idioma.t("COEF_C"),
                            format: "{0:n2}",
                            template: function (dataItem) {
                                let html = '';

                                if (dataItem.Coeficiente < 0) {
                                    html = "<span style='color:red'>" + dataItem.Coeficiente + "</span>";
                                } else if (dataItem.Coeficiente > 0) {
                                    html = "<span style='color:green'>" + dataItem.Coeficiente + "</span>";
                                } else {
                                    html = "<span>" + dataItem.Coeficiente + "</span>";
                                }

                                return html;
                            },
                            width: 95,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                        },
                        {
                            hidden: true,
                            field: "CantidadCoef",
                            title: window.app.idioma.t("CANTIDAD_COEF"),
                            format: "{0:n2}",
                            aggregates: ["sum"],
                            width: 135,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            hidden: true,
                            field: "CantidadCDG",
                            title: window.app.idioma.t("CANTIDAD_CDG"),
                            format: "{0:n2}",
                            aggregates: ["sum"],
                            width: 135,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "UnidadMedida",
                            template: "#=UnidadMedida ? UnidadMedida.toUpperCase() : ''#",
                            title: window.app.idioma.t("UD_MEDIDA"),
                            width: 60,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=UnidadMedida#' style='//width: 14px;height:14px;margin-right:5px;'/>#= UnidadMedida #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Lote", title: window.app.idioma.t("LOTE_MMPP_ORIGEN"), width: 300,
                            filterable: true,
                        },
                    ],
                    dataBinding: self.resizeGrid,
                    dataBound: function (e) {
                        self.fechaCargada = $("#dtpFecha").getKendoDateTimePicker().value();
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridConsumos").data("kendoGrid"));

                self.resizeGrid();
            },
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnFiltroMMPP': 'filtroMMPP',
                'click #btnFiltroMMPPAA': 'filtroMMPPAA',
                'click #btnEditar': 'confirmarEditarMovimientos',
                'click #btnEliminar': 'confirmarEliminarMovimientos',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
            },
            actualiza: function () {
                var self = this;

                self.fecha = $("#dtpFecha").getKendoDateTimePicker().value();

                if (!self.fecha) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_FECHA_INTRODUCIDA'), 3000);
                    return;
                }

                RecargarGrid({ grid: self.grid });
            },
            getFiltroMMPP: function () {
                const filtroMMPP = {
                    "filters": [
                        {
                            "value": "Adjuntos",
                            "operator": "eq",
                            "field": "Clase"
                        },
                        {
                            "value": "Malta",
                            "operator": "eq",
                            "field": "Clase"
                        },
                        {
                            "value": "Lúpulos",
                            "operator": "eq",
                            "field": "Clase"
                        }
                    ],
                    "logic": "or"
                };

                return filtroMMPP;
            },
            filtroMMPP: function () {
                var self = this;

                const filtroMMPP = self.getFiltroMMPP();

                self.dsConsumos.query({
                    filter: filtroMMPP,
                    page: 1
                });
            },
            getFiltroMMPPAA: function () {
                const filtroMMPPAA = {
                    "filters": [
                        {
                            "value": "Adjuntos",
                            "operator": "neq",
                            "field": "Clase"
                        },
                        {
                            "value": "Malta",
                            "operator": "neq",
                            "field": "Clase"
                        },
                        {
                            "value": "Lúpulos",
                            "operator": "neq",
                            "field": "Clase"
                        }
                    ],
                    "logic": "and"
                };

                return filtroMMPPAA;
            },
            filtroMMPPAA: function () {
                var self = this;

                const filtroMMPPAA = self.getFiltroMMPPAA();

                self.dsConsumos.query({
                    filter: filtroMMPPAA,
                    page: 1
                });
            },
            confirmarEditarMovimientos: function () {
                const self = this;
                const permiso = TienePermiso(411);
                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }
                const grid = $("#gridConsumos").data("kendoGrid");
                const seleccionados = [];
                grid.tbody.find(".row-checkbox:checked").each(function () {
                    const dataItem = grid.dataItem($(this).closest("tr"));
                    seleccionados.push(dataItem.IdMovimiento);
                });

                if (seleccionados.length === 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                const win = $("<div/>").kendoWindow({
                    title: window.app.idioma.t("EDITAR"),
                    modal: true,
                    resizable: false,
                    width: "400px",
                    close: function () { this.destroy(); }
                }).data("kendoWindow");

                win.content(`
                    <div style="padding: 20px;">
                        <label>${window.app.idioma.t("CANTIDAD")}:</label>
                        <input id="nuevaCantidad" type="text" data-type="number" data-role="numerictextbox"/>
                        <div style="margin-top: 25px; text-align: center;">
                            <button class="k-button" id="btnAceptarCambio">${window.app.idioma.t("ACEPTAR")}</button>
                            <button class="k-button" id="btnCancelarCambio" style="margin-left:10px;">${window.app.idioma.t("CANCELAR")}</button>
                        </div>
                    </div>
                `);

                win.center().open();

                $("#nuevaCantidad").kendoNumericTextBox({
                    format: "n2",
                    decimals: 2,
                    min: 0
                });
                $("#nuevaCantidad").closest(".k-numerictextbox").css("width", "180px");

                $("#btnAceptarCambio").on("click", function () {
                    const cantidad = $("#nuevaCantidad").data("kendoNumericTextBox").value();
                    if (cantidad <= 0 || cantidad == null) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('CANTIDAD_MAYOR_CERO'), 4000);
                        return;
                    }
                    win.close();

                    self.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t("EDITAR_CANTIDAD"),
                        msg: window.app.idioma.t("CONFIRMAR_ACCION_CANTIDAD")
                            .replace("$num", seleccionados.length)
                            .replace("$accion", window.app.idioma.t("MODIFICAR"))
                            .replace("$tipo", window.app.idioma.t("MOVIMIENTOS")),
                        funcion: function () {
                            self.actualizarCantidadMovimientos(seleccionados, cantidad);
                        },
                        contexto: self
                    });
                });

                $("#btnCancelarCambio").on("click", function () {
                    win.close();
                });
            },
            actualizarCantidadMovimientos: function (ids, cantidad) {
                const datosAEnviar = {
                    IdMovimientos: ids,
                    Cantidad: cantidad
                };

                $.ajax({
                    type: "POST",
                    url: "../api/ActualizarCantidadMovimientos",
                    data: JSON.stringify(datosAEnviar),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            $('#gridConsumos').data('kendoGrid').dataSource.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('CANTIDAD_MOVIMIENTO_ACTUALIZADA'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CANTIDAD_MOVIMIENTO_ACTUALIZADA'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CANTIDAD_MOVIMIENTO_ACTUALIZADA'), 4000);
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            confirmarEliminarMovimientos: function () {
                const self = this;
                const permiso = TienePermiso(411);
                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }
                const grid = $("#gridConsumos").data("kendoGrid");
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
                const ids = seleccionados.map(item => item.IdMovimiento);

                $.ajax({
                    type: "DELETE",
                    url: "../api/OrdenesFab/EliminarMovimientos",
                    data: JSON.stringify(ids),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            $('#gridConsumos').data('kendoGrid').dataSource.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_OPERACION_SE'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ELIMINAR_MOVIMIENTOS'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (response) {
                        if (response.status === 403) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ELIMINAR_MOVIMIENTOS'), 3000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
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

                var gridElement = $("#gridConsumos"),
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

                self.dsConsumos.query({
                    group: [],
                    filter: [],
                    page: 1
                });
            },
        });

        return VistaConsumo;
    });