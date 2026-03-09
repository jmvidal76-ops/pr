define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/vpVerDetalleOrden_Consumo.html'
    , 'jszip', 'definiciones', 'compartido/notificaciones', 'vistas/vDialogoConfirm'
],
    function (_, Backbone, $, Plantilla, JSZip, definiciones, Not, VistaDlgConfirm) {
        var vistaConsumo = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLDetallesOrdenConsumo',
            confirmacion: null,
            dialogoConfirm: null,
            dsConsumo: [],
            registrosSelData: [],
            registrosDesSelData: [],
            dsConsumoFiltraciones: [],
            listaIdsProduccion: [],
            listaIdsLotesConsumos: [],
            dsProduccion: [],
            dsTransferencias: [],
            gridConsumo: null,
            gridConsumoFiltracion: null,
            idorden: 0,
            opciones: null,
            order: [],
            template: _.template(Plantilla),
            ventanaEditarCrear: null,
            isOrdenActiva: true,
            Recalcular: false,
            Tipo_KOP_Mod: '',
            ColorEstado: '',
            LoteMES: null,
            IdEstadoWO: definiciones.IdEstadoWO(),
            tipoWO: definiciones.TipoWO(),
            estadosKOP: definiciones.EstadoKOP(),
            estadoColor: definiciones.EstadoColor(),
            permisoVisualizacionKOPs: false,
            permisoGestionKOPs: false,
            window: null,
            loteSeleccionadoFiltracion: "",
            initialize: function (order, idOrden, opciones, ordenEstado) {
                var self = this;
                window.JSZip = JSZip;
                self.opciones = opciones
                kendo.ui.progress(self.$("#contenedor"), true);
                self.order = order;
                self.idorden = idOrden;
                self.Recalcular = order.EstadoActual.Recalcular;
                self.isOrdenActiva = ordenEstado;
                self.LoteMES = order.LoteMES;

                self.render(self);
            },
            render: function (self) {
                $(self.el).html(this.template());
                self.CargarGrids(self);

                if (self.order?.TipoOrden.ID == self.tipoWO.Prellenado) {
                    $("#gridConsumosFiltraciones").show();

                    if (!$("#verticalSplitter").data("kendoSplitter")) {

                        $("#verticalSplitter").kendoSplitter({
                            orientation: "vertical",
                            panes: [
                                { collapsible: true,},
                                { collapsible: true, }
                            ]
                        });

                    }
                    self.resizeDiv()
                    self.resizeSplitter();

                }

                if (self.isOrdenActiva) {
                    $("#btnSelTodosConsumos").show();
                    $("#btnDesSelTodosConsumos").show();
                    $("#spanRegSelConsumos").show();
                    $("#lblRegSelConsumos").show();
                } else {
                    $("#btnSelTodosConsumos").hide();
                    $("#btnDesSelTodosConsumos").hide();
                    $("#spanRegSelConsumos").hide();
                    $("#lblRegSelConsumos").hide();
                }

                $("#txtCantidadConsumo").kendoNumericTextBox({
                    placeholder: '',
                    decimals: 2,
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                });

                $("#btnSelTodosConsumos").unbind().click(() => self.aplicarSeleccionGridConsumos(true));
                $("#btnDesSelTodosConsumos").unbind().click(() => self.aplicarSeleccionGridConsumos(false));
                $("#btnAsignarCantidad").unbind().click(() => self.confirmAsignarCantidad(self));
                $("#btnLimpiarFiltrosConsumo").unbind().click(() => $("#gridConsumo").data("kendoGrid").dataSource.filter({}));
                $("#btnEliminarMovConsumo").unbind().click(() => self.confirmEliminarMovimientosConsumo(self));
                $("#btnConsultarConsumos").unbind().click(() => self.consultarConsumosFiltracion(self));
            },
            events: {
            },
            consultarConsumosFiltracion: function (self) {
                self.dsConsumoFiltraciones.read();
            },
            confirmAsignarCantidad: function (self) {
                let cantidadMovimiento = $("#txtCantidadConsumo").data("kendoNumericTextBox").value();
                if (cantidadMovimiento <= 0 || cantidadMovimiento == "") {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('CANTIDAD_MAYOR_CERO'), 4000);
                }
                else if (self.registrosSelData.length > 0) {
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('CANTIDAD'),
                        msg: window.app.idioma.t('DESEA_REALMENTE_CAMBIAR_CANTIDAD'),
                        funcion: function () { self.asignarCantidad(self); },
                        contexto: this
                    });
                } else {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                }
            },
            asignarCantidad: function (self) {
                var datosActualizar = self.registrosSelData;
                let cantidadMovimiento = $("#txtCantidadConsumo").data("kendoNumericTextBox").value();
                //PENDIENTE HACER LLAMADA PARA MODIFICAR CANTIDAD
                $.ajax({
                    type: "POST",
                    async: true,
                    url: "../api/ActualizarCantidadMovimientos",
                    data: JSON.stringify({ "IdMovimientos": datosActualizar, "Cantidad": cantidadMovimiento }),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            $('#gridConsumo').data('kendoGrid').dataSource.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('CANTIDAD_MOVIMIENTO_ACTUALIZADA'), 4000);
                            
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CANTIDAD_MOVIMIENTO_ACTUALIZADA'), 4000);
                        }
                        
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            confirmEliminarMovimientosConsumo: function (self) {
                const permiso = TienePermiso(354);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                if (self.registrosSelData.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ELIMINAR_MOVIMIENTOS'),
                    msg: window.app.idioma.t('DESEA_REALMENTE_ELIMINAR_MOVIMIENTOS'),
                    funcion: function () { self.eliminarMovimientosConsumo(self); },
                    contexto: this
                });
            },
            eliminarMovimientosConsumo: function (self) {
                let datos = self.registrosSelData;

                $.ajax({
                    type: "DELETE",
                    url: "../api/OrdenesFab/EliminarMovimientos",
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            $('#gridConsumo').data('kendoGrid').dataSource.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_OPERACION_SE'), 4000);
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ELIMINAR_MOVIMIENTOS'), 4000);
                        }

                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (response) {
                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ELIMINAR_MOVIMIENTOS'), 3000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            aplicarSeleccionGridConsumos: function (checked) {
                var self = this;

                self.selTodos = checked;

                var grid = $('#gridConsumo').data('kendoGrid');
                if (self.selTodos) {
                    grid.tbody.find('.checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var dataSource = grid.dataSource;
                    var filters = dataSource.filter();
                    var allData = dataSource.data();
                    var query = new kendo.data.Query(allData);
                    var dataFiltered = query.filter(filters).data;
                    $("#lblRegSel").text(dataFiltered.length);
                } else {
                    grid.tbody.find('.checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');
                    self.registrosDesSelData = [];
                    self.registrosSelData = [];
                    $("#lblRegSel").text("");
                }
            },
            CargarGrids: function (self) {
                var urlReadConsumos = "../api/OrdenesFab/ObtenerLotesConsumosPorLoteMES/" + self.LoteMES + "/";
                
                if (self.order?.TipoOrden.ID == self.tipoWO.Trasiego) {
                    urlReadConsumos = "../api/OrdenesFab/ObtenerLotesConsumoTrasiegoPorIdWO/" + self.opciones.IdWO;
                }
                if (self.order?.TipoOrden.ID == self.tipoWO.Filtracion) {

                    if (!self.order.FecIniLocal && !self.order.FecFinLocal)
                        return;

                    var fechaInicio = (self.order.FecIniLocal).substring(0, (self.order.FecIniLocal).lastIndexOf("+"));
                    var fechaFin = !self.order.FecFinLocal ? new Date().toISOString() : (self.order.FecFinLocal).substring(0, (self.order.FecFinLocal).lastIndexOf("+"));

                    urlReadConsumos = "../api/OrdenesFab/ObtenerLotesConsumosFiltracionFechas?fechaDesde=" + fechaInicio + "&fechaHasta=" + fechaFin + "&idUbicacion=" + self.opciones.IdUbicacion;
                }

                self.dsConsumo = new kendo.data.DataSource({
                    transport: {
                        read: function (options) {
                            $.ajax({
                                type: "GET",
                                async: true,
                                url: urlReadConsumos,
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (res) {
                                    options.success(res);
                                    self.aplicarSeleccionGridConsumos(false);
                                },
                                error: function (err) {
                                    options.error(err);
                                }
                            });
                        }
                    },
                    pageSize: 100,
                    schema: {
                        model: {
                            fields: {
                                'FechaCreacion': { type: "date" },
                                'LoteMES': { type: "string" },
                                'LoteOrigen': { type: "string" },
                                'LoteDestino': { type: "string" },
                                'IdMaterial': { type: "string" },
                                'NombreMaterial': { type: "string" },
                                'ClaseMaterial': { type: "string" },
                                'IdProveedor': { type: "string" },
                                'Proveedor': { type: "string" },
                                'LoteProveedor': { type: "string" },
                                'CantidadInicial': { type: "number" },
                                'CantidadActual': { type: "number" },
                                'Unidad': { type: "string" },
                                'FechaInicio': { type: "date" },
                                'LoteSAI': { type: "string" },
                                'LoteMES': { type: "string" },
                                'IdMaterialOrigen': { type: "string" },
                                'IdMaterialDestino': { type: "string" },
                                'DescripcionMaterialOrigen': { type: "string" },
                                'DescripcionMaterialDestino': { type: "string" },
                                'CodUbicacionOrigen': { type: "string" },
                                'DescUbicacionOrigen': { type: "string" },
                                'CodUbicacionDestino': { type: "string" },
                                'DescUbicacionDestino': { type: "string" },
                                'MaterialSAI': { type: "string" },
                                'ClaseMaterialOrigen': { type: "string" },
                                'ClaseMaterialDestino': { type: "string" },
                                'DescripcionProveedor': { type: "string" },
                                'Cantidad': { type: "number" },
                                'IdMovimiento': { type: "number" },
                                'IdTipoMaterialMovimiento': { type: "number" },
                            }
                        }
                    }
                });

                if (!$("#gridConsumo").data("kendoGrid")) {
                    if (self.order?.TipoOrden.ID == self.tipoWO.Trasiego) {
                        self.gridConsumo = $("#gridConsumo").kendoGrid({
                            dataSource: self.dsConsumo,
                            groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                            filterable: {
                                extra: false,
                                messages: window.app.cfgKendo.configuracionFiltros_Msg,
                                operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                            },
                            toolbar: [
                                {
                                    template: "<button type='button' id='btnSelTodosConsumos' class='k-button k-button-icontext'><span class='k-icon k-i-hbars'></span>" + window.app.idioma.t('SELECCIONAR_TODOS') + "</button>"
                                },
                                {
                                    template: "<button type='button' id='btnDesSelTodosConsumos' class='k-button k-button-icontext'><span class='k-icon k-si-cancel'></span>" + window.app.idioma.t('DESELECCIONAR_TODOS') + "</button>"
                                },
                                {
                                    template: "<span id='spanRegSelConsumos' style='margin-left:10px;'>" + window.app.idioma.t('REGISTROS_SEL') + "</span> <span id='lblRegSelConsumos'></span>"
                                },
                                {
                                    template: "<button id='btnLimpiarFiltrosConsumo' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                                }
                            ],
                            scrollable: true,
                            sortable: true,
                            resizable: true,
                            pageable: {
                                refresh: true,
                                pageSizes: true,
                                pageSizes: [100, 500, 1000, 'All'],
                                buttonCount: 5,
                                messages: window.app.cfgKendo.configuracionPaginado_Msg
                            },
                            noRecords: {
                                template: window.app.idioma.t("SIN_RESULTADOS")
                            },
                            columns: [
                                {
                                    template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                                    width: 35
                                },
                                {
                                    field: "FechaInicio",
                                    title: window.app.idioma.t("FECHA"),
                                    template: '#= FechaInicio !== null ? kendo.toString(FechaInicio, "' + kendo.culture().calendars.standard.patterns.MES_FechaHora + '" ) : "" #',
                                    width: 100,
                                },
                                {
                                    field: "CodUbicacionOrigen",
                                    template: '<span class="addTooltip"> #= CodUbicacionOrigen #</span>',
                                    title: window.app.idioma.t("UBICACION_ORIGEN"),
                                    attributes: {
                                        style: 'white-space: nowrap',
                                    },
                                    width: 60
                                },
                                {
                                    field: "LoteOrigen",
                                    template: '<span class="addTooltip"> #= LoteOrigen #</span>',
                                    title: window.app.idioma.t("LOTE_ORIGEN"),
                                    attributes: {
                                        style: 'white-space: nowrap',
                                    },
                                    width: 350
                                },
                                {
                                    field: "CodUbicacionDestino",
                                    template: '<span class="addTooltip"> #= CodUbicacionDestino #</span>',
                                    title: window.app.idioma.t("UBICACION_DESTINO"),
                                    attributes: {
                                        style: 'white-space: nowrap',
                                    },
                                    width: 100
                                },
                                {
                                    field: "LoteDestino",
                                    template: '<span class="addTooltip"> #= LoteDestino #</span>',
                                    title: window.app.idioma.t("LOTE_DESTINO"),
                                    attributes: {
                                        style: 'white-space: nowrap',
                                    },
                                    width: 350
                                },
                                {
                                    field: "IdMaterialOrigen",
                                    template: '<span class="addTooltip"> #= IdMaterialOrigen #</span>',
                                    title: window.app.idioma.t("ID_MATERIAL_ORIGEN"),
                                    attributes: {
                                        style: 'white-space: nowrap',
                                    },
                                    width: 60
                                },
                                {
                                    field: "DescripcionMaterialOrigen",
                                    template: '<span class="addTooltip"> #= DescripcionMaterialOrigen #</span>',
                                    title: window.app.idioma.t("MATERIAL_ORIGEN"),
                                    attributes: {
                                        style: 'white-space: nowrap',
                                    },
                                    width: 140,
                                    groupHeaderTemplate: window.app.idioma.t("MATERIAL_ORIGEN") + ": #=value# - (Cantidad: #=kendo.format('{0:n2}', aggregates.Cantidad.sum)#)"
                                },
                                {
                                    field: "IdMaterialDestino",
                                    template: '<span class="addTooltip"> #= IdMaterialDestino #</span>',
                                    title: window.app.idioma.t("ID_MATERIAL_DESTINO"),
                                    attributes: {
                                        style: 'white-space: nowrap',
                                    },
                                    width: 60
                                },
                                {
                                    field: "DescripcionMaterialDestino",
                                    template: '<span class="addTooltip"> #= DescripcionMaterialDestino #</span>',
                                    title: window.app.idioma.t("MATERIAL_DESTINO"),
                                    attributes: {
                                        style: 'white-space: nowrap',
                                    },
                                    width: 140,
                                    groupHeaderTemplate: window.app.idioma.t("MATERIAL_DESTINO") + ": #=value# - (Cantidad: #=kendo.format('{0:n2}', aggregates.Cantidad.sum)#)"
                                },
                                {
                                    field: "Cantidad",
                                    template: '#= Cantidad !== undefined ?  $.isNumeric(Cantidad.toString().replace(",",".")) ? kendo.format("{0:n2}",parseFloat(Cantidad.toString().replace(",","."))) : Cantidad : ""  #',
                                    title: window.app.idioma.t("CANTIDAD"),
                                    width: 90,
                                    aggregates: ["sum"],
                                    filterable: {
                                        ui: function (element) {
                                            element.kendoNumericTextBox({
                                                format: "{0:n2}",
                                                culture: localStorage.getItem("idiomaSeleccionado")
                                            })
                                        }
                                    },
                                    groupable: false,
                                    groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                                },
                                {
                                    field: "Unidad",
                                    template: "#=Unidad ? Unidad.toUpperCase(): ''#",
                                    title: window.app.idioma.t("UNIDAD_MEDIDA"),
                                    width: 110,
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=Unidad#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Unidad #</label></div>";
                                            }
                                        }
                                    }
                                }
                            ],
                            dataBound: function (e) {
                                if (self.order?.TipoOrden.ID == self.tipoWO.Filtracion) {
                                    self.listaIdsLotesConsumos = this._data.map(item => item.IdLoteMateriaPrima).filter((value, index, self) => self.indexOf(value) === index);
                                }
                                self.resizeGrid("#gridConsumo");
                                self.validarCheck(self);
                            },
                        }).data("kendoGrid");
                    }
                    else if (self.order?.TipoOrden.ID == self.tipoWO.Filtracion) {
                        self.gridConsumo = $("#gridConsumo").kendoGrid({
                            dataSource: self.dsConsumo,
                            groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                            filterable: {
                                extra: false,
                                messages: window.app.cfgKendo.configuracionFiltros_Msg,
                                operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                            },
                            toolbar: [
                                {
                                    template: "<button type='button' id='btnSelTodosConsumos' class='k-button k-button-icontext'><span class='k-icon k-i-hbars'></span>" + window.app.idioma.t('SELECCIONAR_TODOS') + "</button>"
                                },
                                {
                                    template: "<button type='button' id='btnDesSelTodosConsumos' class='k-button k-button-icontext'><span class='k-icon k-si-cancel'></span>" + window.app.idioma.t('DESELECCIONAR_TODOS') + "</button>"
                                },
                                {
                                    template: "<span id='spanRegSelConsumos' style='margin-left:10px;'>" + window.app.idioma.t('REGISTROS_SEL') + "</span> <span id='lblRegSelConsumos'></span>"
                                },
                                {
                                    template: "<button id='btnLimpiarFiltrosConsumo' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                                }
                            ],
                            scrollable: true,
                            sortable: true,
                            resizable: true,
                            pageable: {
                                refresh: true,
                                pageSizes: true,
                                pageSizes: [100, 500, 1000, 'All'],
                                buttonCount: 5,
                                messages: window.app.cfgKendo.configuracionPaginado_Msg
                            },
                            noRecords: {
                                template: window.app.idioma.t("SIN_RESULTADOS")
                            },
                            columns: [
                                {
                                    template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                                    width: 35
                                },
                                {
                                    field: "FechaCreacion",
                                    title: window.app.idioma.t("FECHA"),
                                    template: '#= FechaCreacion !== null ? kendo.toString(FechaCreacion, "' + kendo.culture().calendars.standard.patterns.MES_FechaHora + '" ) : "" #',
                                    width: 110,
                                },
                                {
                                    field: "LoteOrigen",
                                    template: '<span class="addTooltip"> #= LoteOrigen #</span>',
                                    title: window.app.idioma.t("LOTE_ORIGEN"),
                                    attributes: {
                                        style: 'white-space: nowrap',
                                    },
                                    width: 350
                                },
                                {
                                    field: "LoteDestino",
                                    template: '<span class="addTooltip"> #= LoteDestino #</span>',
                                    title: window.app.idioma.t("LOTE_DESTINO"),
                                    attributes: {
                                        style: 'white-space: nowrap',
                                    },
                                    width: 350
                                },
                                {
                                    field: "IdMaterial",
                                    title: window.app.idioma.t("CODIGO_MATERIAL"),
                                    width: 120,
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
                                    field: "NombreMaterial",
                                    template: '<span class="addTooltip"> #= NombreMaterial #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                                    width: 150,
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=NombreMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= NombreMaterial #</label></div>";
                                            }
                                        }
                                    },
                                    groupHeaderTemplate: window.app.idioma.t("DESCRIPCION_MATERIAL") + ": #=value# - (Cantidad: #=kendo.format('{0:n2}', aggregates.CantidadActual.sum)#)"
                                },
                                {
                                    field: "ClaseMaterial",
                                    title: window.app.idioma.t("CLASE_MATERIAL"),
                                    template: '<span class="addTooltip"> #= ClaseMaterial #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    width: 140,
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=ClaseMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= ClaseMaterial #</label></div>";
                                            }
                                        }
                                    }
                                },
                                {
                                    field: "IdProveedor",
                                    title: window.app.idioma.t("CODIGO_PROVEEDOR"),
                                    width: 120
                                },
                                {
                                    field: "Proveedor",
                                    title: window.app.idioma.t("DESCRIPCION_PROVEEDOR"),
                                    template: '<span class="addTooltip"> #= Proveedor #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    width: 120
                                },
                                {
                                    field: "LoteProveedor",
                                    title: window.app.idioma.t("LOTE_PROVEEDOR"),
                                    width: 110
                                },
                                {
                                    field: "CantidadActual",
                                    template: '#= CantidadActual !== undefined ?  $.isNumeric(CantidadActual.toString().replace(",",".")) ? kendo.format("{0:n2}",parseFloat(CantidadActual.toString().replace(",","."))) : CantidadActual : ""  #',
                                    title: window.app.idioma.t("CANTIDAD"),
                                    width: 90,
                                    aggregates: ["sum"],
                                    filterable: {
                                        ui: function (element) {
                                            element.kendoNumericTextBox({
                                                format: "{0:n2}",
                                                culture: localStorage.getItem("idiomaSeleccionado")
                                            })
                                        }
                                    },
                                    groupable: false,
                                    groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                                },
                                {
                                    field: "Unidad",
                                    template: "#=Unidad ? Unidad.toUpperCase(): ''#",
                                    title: window.app.idioma.t("UNIDAD_MEDIDA"),
                                    width: 110,
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=Unidad#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Unidad #</label></div>";
                                            }
                                        }
                                    }
                                }
                            ],
                            dataBound: function (e) {
                                if (self.order?.TipoOrden.ID == self.tipoWO.Filtracion) {
                                    self.listaIdsLotesConsumos = this._data.map(item => item.IdLoteMateriaPrima).filter((value, index, self) => self.indexOf(value) === index);
                                }
                                self.resizeGrid("#gridConsumo");
                                self.validarCheck(self);
                            },
                        }).data("kendoGrid");
                    }
                    else if (self.order?.TipoOrden.ID == self.tipoWO.Prellenado) {

                        self.dsConsumoFiltraciones = new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: "../api/OrdenesFab/ObtenerLotesConsumosPorIdLotes",
                                    dataType: "json",
                                    contentType: "application/json; charset=utf-8",
                                    type: "PUT"
                                },
                                parameterMap: function (options, type) {
                                    if (type == "read") {
                                        var data = $("#gridConsumo").data("kendoGrid")?.dataSource?.data();
                                        if (data.length > 0) {
                                            const lotes = data.map(lote => { return { IdLoteMateriaPrima: lote.IdLoteMateriaPrima, IdTipoMaterialMovimiento: lote.IdTipoMaterialMovimiento } });
                                            return JSON.stringify(lotes);
                                        }
                                    }
                                }
                            },
                            requestStart: function (e) {
                                var data = $("#gridConsumo").data("kendoGrid")?.dataSource?.data();
                                if (data.length == 0) { e.preventDefault(); }
                            },
                            pageSize: 100,
                            schema: {
                                model: {
                                    fields: {
                                        'FechaCreacion': { type: "date" },
                                        'LoteMES': { type: "string" },
                                        'LoteOrigen': { type: "string" },
                                        'LoteDestino': { type: "string" },
                                        'IdMaterial': { type: "string" },
                                        'NombreMaterial': { type: "string" },
                                        'ClaseMaterial': { type: "string" },
                                        'IdProveedor': { type: "string" },
                                        'Proveedor': { type: "string" },
                                        'LoteProveedor': { type: "string" },
                                        'CantidadInicial': { type: "number" },
                                        'CantidadActual': { type: "number" },
                                        'Unidad': { type: "string" },
                                        'FechaInicio': { type: "date" },
                                        'LoteSAI': { type: "string" },
                                        'LoteMES': { type: "string" },
                                        'IdMaterialOrigen': { type: "string" },
                                        'IdMaterialDestino': { type: "string" },
                                        'DescripcionMaterialOrigen': { type: "string" },
                                        'DescripcionMaterialDestino': { type: "string" },
                                        'CodUbicacionOrigen': { type: "string" },
                                        'DescUbicacionOrigen': { type: "string" },
                                        'CodUbicacionDestino': { type: "string" },
                                        'DescUbicacionDestino': { type: "string" },
                                        'MaterialSAI': { type: "string" },
                                        'ClaseMaterialOrigen': { type: "string" },
                                        'ClaseMaterialDestino': { type: "string" },
                                        'DescripcionProveedor': { type: "string" },
                                        'Cantidad': { type: "number" },
                                        'CantidadLote': { type: "number" },
                                    }
                                }
                            }
                        });

                        self.gridConsumoFiltracion = $("#gridConsumosFiltraciones").kendoGrid({
                            autoBind: false,
                            dataSource: self.dsConsumoFiltraciones,
                            groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                           
                            filterable: {
                                extra: false,
                                messages: window.app.cfgKendo.configuracionFiltros_Msg,
                                operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                            },
                            toolbar: [
                                {
                                    template: "<label>" + window.app.idioma.t('CONSUMO_LOTE') + ": " + self.loteSeleccionadoFiltracion + "</label>",
                                },
                                {
                                    template: "<button id='btnConsultarConsumos' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'>" + window.app.idioma.t('CONSULTAR') + "</button>"
                                }
                            ],
                            dataBound: function (e) {
                                var consumos = $("#gridConsumo").data("kendoGrid")?.dataSource?.data();
                                if (consumos?.length > 0) {
                                    var grid = e.sender;
                                    var rows = grid.items();

                                    

                                    if (rows?.length > 0) {
                                        for (var i = 0; i < rows.length; i++) {
                                            var row = rows[i];
                                            var $row = $(row);
                                            var item = e.sender.dataItem(row);

                                            const loteSuperior = consumos?.find(item2 => item2.IdLoteMES == item.LoteDestino);
                                            if (loteSuperior) {
                                                const porcentaje = loteSuperior.CantidadInicial > 0 ? (loteSuperior.CantidadActual * 100) / loteSuperior.CantidadInicial : 100;
                                                if (porcentaje) {
                                                    item.CantidadLote = item.CantidadActual * (porcentaje / 100);
                                                    var currenRow = grid.table.find("tr[data-uid='" + item.uid + "']");
                                                    item.CantidadLote = item.CantidadLote ? parseFloat(item.CantidadLote.toString().replace(",", ".")) : "";
                                                    //item.set("CantidadLote", item.CantidadLote)
                                                    console.log(item)
                                                    $(currenRow).find(".cantidadLote").text(kendo.format("{0:n4}",item.CantidadLote));

                                                   // $(currenRow).closest(".k-group-footer")
                                                }
                                            }
                                        }
                                    }

                                    //grid.refresh();
                                }
                            },
                            scrollable: true,
                            sortable: true,
                            resizable: true,
                            pageable: {
                                refresh: true,
                                pageSizes: true,
                                pageSizes: [100, 500, 1000, 'All'],
                                buttonCount: 5,
                                messages: window.app.cfgKendo.configuracionPaginado_Msg
                            },
                            noRecords: {
                                template: window.app.idioma.t("SIN_RESULTADOS")
                            },
                            columns: [
                                {
                                    field: "FechaCreacion",
                                    title: window.app.idioma.t("FECHA"),
                                    template: '#= FechaCreacion !== null ? kendo.toString(FechaCreacion, "' + kendo.culture().calendars.standard.patterns.MES_FechaHora + '" ) : "" #',
                                    width: 110,
                                },
                                {
                                    field: "LoteOrigen",
                                    title: window.app.idioma.t("LOTE_ORIGEN"),
                                    template: '<span class="addTooltip"> #= LoteOrigen #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    width: 250
                                },
                                {
                                    field: "LoteDestino",
                                    title: window.app.idioma.t("LOTE_DESTINO"),
                                    template: '<span class="addTooltip"> #= LoteDestino #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    width: 250
                                },
                                {
                                    field: "IdMaterial",
                                    title: window.app.idioma.t("CODIGO_MATERIAL"),
                                    width: 120,
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
                                    field: "NombreMaterial",
                                    template: '<span class="addTooltip"> #= NombreMaterial #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                                    width: 150,
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=NombreMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= NombreMaterial #</label></div>";
                                            }
                                        }
                                    },
                                    groupHeaderTemplate: window.app.idioma.t("DESCRIPCION_MATERIAL") + ": #=value# - (Cantidad: #=kendo.format('{0:n2}', aggregates.CantidadLote.sum)#)"
                                },
                                {
                                    field: "ClaseMaterial",
                                    title: window.app.idioma.t("CLASE_MATERIAL"),
                                    template: '<span class="addTooltip"> #= ClaseMaterial #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    width: 140,
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=ClaseMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= ClaseMaterial #</label></div>";
                                            }
                                        }
                                    }
                                },
                                {
                                    field: "IdProveedor",
                                    title: window.app.idioma.t("CODIGO_PROVEEDOR"),
                                    width: 120
                                },
                                {
                                    field: "Proveedor",
                                    title: window.app.idioma.t("DESCRIPCION_PROVEEDOR"),
                                    template: '<span class="addTooltip"> #= Proveedor #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    width: 120
                                },
                                {
                                    field: "LoteProveedor",
                                    title: window.app.idioma.t("LOTE_PROVEEDOR"),
                                    width: 110
                                },
                                {
                                    field: "CantidadActual",
                                    template: '#= CantidadActual !== undefined ?  $.isNumeric(CantidadActual.toString().replace(",",".")) ? kendo.format("{0:n2}",parseFloat(CantidadActual.toString().replace(",","."))) : CantidadActual : ""  #',
                                    title: window.app.idioma.t("CANTIDAD_MOVIMIENTO"),
                                    width: 90,
                                    aggregates: ["sum"],
                                    filterable: {
                                        ui: function (element) {
                                            element.kendoNumericTextBox({
                                                format: "{0:n2}",
                                                culture: localStorage.getItem("idiomaSeleccionado")
                                            })
                                        }
                                    },
                                    groupable: false,
                                    groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                                },
                                {
                                    field: "CantidadLote",
                                    template: '<span class="cantidadLote">#= CantidadLote ?  $.isNumeric(CantidadLote.toString().replace(",",".")) ? kendo.format("{0:n2}",parseFloat(CantidadLote.toString().replace(",","."))) : CantidadLote : ""  #</span>',
                                    title: window.app.idioma.t("CANTIDAD_LOTE"),
                                    width: 90,
                                    aggregates: ["sum"],
                                    filterable: {
                                        ui: function (element) {
                                            element.kendoNumericTextBox({
                                                format: "{0:n2}",
                                                culture: localStorage.getItem("idiomaSeleccionado")
                                            })
                                        }
                                    },
                                    groupable: false,
                                    groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                                },
                                {
                                    field: "Unidad",
                                    template: "#=Unidad ? Unidad.toUpperCase(): ''#",
                                    title: window.app.idioma.t("UNIDAD_MEDIDA"),
                                    width: 110,
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=Unidad#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Unidad #</label></div>";
                                            }
                                        }
                                    }
                                }
                            ],
                        });

                        self.gridConsumo = $("#gridConsumo").kendoGrid({
                            dataSource: self.dsConsumo,
                            groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                            filterable: {
                                extra: false,
                                messages: window.app.cfgKendo.configuracionFiltros_Msg,
                                operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                            },
                            toolbar: [
                                {
                                    template: "<button type='button' id='btnSelTodosConsumos' class='k-button k-button-icontext'><span class='k-icon k-i-hbars'></span>" + window.app.idioma.t('SELECCIONAR_TODOS') + "</button>"
                                },
                                {
                                    template: "<button type='button' id='btnDesSelTodosConsumos' class='k-button k-button-icontext'><span class='k-icon k-si-cancel'></span>" + window.app.idioma.t('DESELECCIONAR_TODOS') + "</button>"
                                },
                                {
                                    template: "<span id='spanRegSelConsumos' style='margin-left:10px;'>" + window.app.idioma.t('REGISTROS_SEL') + "</span> <span id='lblRegSelConsumos'></span>"
                                },
                                {
                                    template: "<button id='btnLimpiarFiltrosConsumo' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                                }
                            ],
                            scrollable: true,
                            sortable: true,
                            resizable: true,
                            pageable: {
                                refresh: true,
                                pageSizes: true,
                                pageSizes: [100, 500, 1000, 'All'],
                                buttonCount: 5,
                                messages: window.app.cfgKendo.configuracionPaginado_Msg
                            },
                            noRecords: {
                                template: window.app.idioma.t("SIN_RESULTADOS")
                            },
                            columns: [
                                {
                                    template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                                    width: 35
                                },
                                {
                                    field: "FechaCreacion",
                                    title: window.app.idioma.t("FECHA"),
                                    template: '#= FechaCreacion !== null ? kendo.toString(FechaCreacion, "' + kendo.culture().calendars.standard.patterns.MES_FechaHora + '" ) : "" #',
                                    width: 110,
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                },
                                {
                                    field: "IdLoteMES",
                                    title: window.app.idioma.t("LOTE"),
                                    template: '<span class="addTooltip"> #= IdLoteMES #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    width: 250
                                },
                                {
                                    field: "IdMaterial",
                                    title: window.app.idioma.t("CODIGO_MATERIAL"),
                                    width: 120,
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
                                    field: "NombreMaterial",
                                    template: '<span class="addTooltip"> #= NombreMaterial #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                                    width: 150,
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=NombreMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= NombreMaterial #</label></div>";
                                            }
                                        }
                                    },
                                    groupHeaderTemplate: window.app.idioma.t("DESCRIPCION_MATERIAL") + ": #=value# - (Cantidad: #=kendo.format('{0:n2}', aggregates.CantidadActual.sum)#)"
                                },
                                {
                                    field: "ClaseMaterial",
                                    title: window.app.idioma.t("CLASE_MATERIAL"),
                                    template: '<span class="addTooltip"> #= ClaseMaterial #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    width: 140,
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=ClaseMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= ClaseMaterial #</label></div>";
                                            }
                                        }
                                    }
                                },
                                {
                                    field: "IdProveedor",
                                    title: window.app.idioma.t("CODIGO_PROVEEDOR"),
                                    width: 120
                                },
                                {
                                    field: "Proveedor",
                                    title: window.app.idioma.t("DESCRIPCION_PROVEEDOR"),
                                    template: '<span class="addTooltip"> #= Proveedor #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    width: 120
                                },
                                {
                                    field: "LoteProveedor",
                                    title: window.app.idioma.t("LOTE_PROVEEDOR"),
                                    width: 110
                                    },
                                {
                                    field: "CantidadActual",
                                    template: '#= CantidadActual !== undefined ?  $.isNumeric(CantidadActual.toString().replace(",",".")) ? kendo.format("{0:n2}",parseFloat(CantidadActual.toString().replace(",","."))) : CantidadActual : ""  #',
                                    title: window.app.idioma.t("CANTIDAD"),
                                    width: 90,
                                    aggregates: ["sum"],
                                    filterable: {
                                        ui: function (element) {
                                            element.kendoNumericTextBox({
                                                format: "{0:n2}",
                                                culture: localStorage.getItem("idiomaSeleccionado")
                                            })
                                        }
                                    },
                                    groupable: false,
                                    groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                                },
                                {
                                    field: "Unidad",
                                    template: "#=Unidad ? Unidad.toUpperCase(): ''#",
                                    title: window.app.idioma.t("UNIDAD_MEDIDA"),
                                    width: 110,
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=Unidad#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Unidad #</label></div>";
                                            }
                                        }
                                    }
                                }
                            ],
                            dataBound: function (e) {
                                self.resizeGrid(".divSplitter");
                                self.validarCheck(self);
                            },
                        }).data("kendoGrid");
                    }
                    else {
                        self.gridConsumo = $("#gridConsumo").kendoGrid({
                            dataSource: self.dsConsumo,
                            groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                            filterable: {
                                extra: false,
                                messages: window.app.cfgKendo.configuracionFiltros_Msg,
                                operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                            },
                            toolbar: [
                                {
                                    template: "<button type='button' id='btnSelTodosConsumos' class='k-button k-button-icontext'><span class='k-icon k-i-hbars'></span>" + window.app.idioma.t('SELECCIONAR_TODOS') + "</button>"
                                },
                                {
                                    template: "<button type='button' id='btnDesSelTodosConsumos' class='k-button k-button-icontext'><span class='k-icon k-si-cancel'></span>" + window.app.idioma.t('DESELECCIONAR_TODOS') + "</button>"
                                },
                                {
                                    template: "<span id='spanRegSelConsumos' style='margin-left:10px;'>" + window.app.idioma.t('REGISTROS_SEL') + "</span> <span id='lblRegSelConsumos'></span>"
                                },
                                {
                                    template: "<button id='btnLimpiarFiltrosConsumo' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                                }
                            ],
                            scrollable: true,
                            sortable: true,
                            resizable: true,
                            pageable: {
                                refresh: true,
                                pageSizes: true,
                                pageSizes: [100, 500, 1000, 'All'],
                                buttonCount: 5,
                                messages: window.app.cfgKendo.configuracionPaginado_Msg
                            },
                            noRecords: {
                                template: window.app.idioma.t("SIN_RESULTADOS")
                            },
                            columns: [
                                {
                                    template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                                    width: 35
                                },
                                {
                                    field: "FechaCreacion",
                                    title: window.app.idioma.t("FECHA"),
                                    template: '#= FechaCreacion !== null ? kendo.toString(FechaCreacion, "' + kendo.culture().calendars.standard.patterns.MES_FechaHora + '" ) : "" #',
                                    width: 110,
                                },
                                {
                                    field: "IdLoteMES",
                                    title: window.app.idioma.t("LOTE"),
                                    template: '<span class="addTooltip"> #= IdLoteMES #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    width: 250
                                },
                                {
                                    field: "IdMaterial",
                                    title: window.app.idioma.t("CODIGO_MATERIAL"),
                                    width: 120,
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
                                    field: "NombreMaterial",
                                    template: '<span class="addTooltip"> #= NombreMaterial #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                                    width: 150,
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=NombreMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= NombreMaterial #</label></div>";
                                            }
                                        }
                                    },
                                    groupHeaderTemplate: window.app.idioma.t("DESCRIPCION_MATERIAL") + ": #=value# - (Cantidad: #=kendo.format('{0:n2}', aggregates.CantidadActual.sum)#)"
                                },
                                {
                                    field: "ClaseMaterial",
                                    title: window.app.idioma.t("CLASE_MATERIAL"),
                                    template: '<span class="addTooltip"> #= ClaseMaterial #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    width: 140,
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=ClaseMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= ClaseMaterial #</label></div>";
                                            }
                                        }
                                    }
                                },
                                {
                                    field: "IdProveedor",
                                    title: window.app.idioma.t("CODIGO_PROVEEDOR"),
                                    width: 120
                                },
                                {
                                    field: "Proveedor",
                                    title: window.app.idioma.t("DESCRIPCION_PROVEEDOR"),
                                    template: '<span class="addTooltip"> #= Proveedor #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    width: 120
                                },
                                {
                                    field: "LoteProveedor",
                                    title: window.app.idioma.t("LOTE_PROVEEDOR"),
                                    width: 110
                                },
                                {
                                    field: "CantidadActual",
                                    template: '#= CantidadActual !== undefined ?  $.isNumeric(CantidadActual.toString().replace(",",".")) ? kendo.format("{0:n2}",parseFloat(CantidadActual.toString().replace(",","."))) : CantidadActual : ""  #',
                                    title: window.app.idioma.t("CANTIDAD"),
                                    width: 90,
                                    aggregates: ["sum"],
                                    filterable: {
                                        ui: function (element) {
                                            element.kendoNumericTextBox({
                                                format: "{0:n2}",
                                                culture: localStorage.getItem("idiomaSeleccionado")
                                            })
                                        }
                                    },
                                    groupable: false,
                                    groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                                },
                                {
                                    field: "Unidad",
                                    template: "#=Unidad ? Unidad.toUpperCase(): ''#",
                                    title: window.app.idioma.t("UNIDAD_MEDIDA"),
                                    width: 110,
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=Unidad#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Unidad #</label></div>";
                                            }
                                        }
                                    }
                                }
                            ],
                            dataBound: function (e) {
                                if (self.order?.TipoOrden.ID == self.tipoWO.Filtracion) {
                                    self.listaIdsLotesConsumos = this._data.map(item => item.IdLoteMateriaPrima).filter((value, index, self) => self.indexOf(value) === index);
                                }
                                self.resizeGrid("#gridConsumo");
                                self.validarCheck(self);

                            },
                        }).data("kendoGrid");
                    }
                }

                $("#gridConsumo").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

                $("#gridConsumosFiltraciones").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

               
            },
            eliminar: function () {
                this.remove();
            },
            validarCheck: function (self) {
                var grid = $("#gridConsumo").data("kendoGrid");
                $(".checkbox").bind("change", function (e) {
                    var checked = this.checked;
                    row = $(e.target).closest("tr");
                    dataItem = grid.dataItem(row);
                    var datos = {};
                    datos = dataItem.IdMovimiento;

                    if (checked) {
                        row.addClass("k-state-selected");
                        var datafound = _.findWhere(self.registrosDesSelData, datos);
                        index = _.indexOf(self.registrosDesSelData, datafound);

                        if (index >= 0) {
                            self.registrosDesSelData.splice(index, 1);
                        }

                        var numReg = $("#lblRegSel").text() ? $("#lblRegSel").text() : 0;
                        $("#lblRegSel").text(++numReg);
                        self.registrosSelData.push(datos);
                    } else {
                        row.removeClass("k-state-selected");
                        self.registrosDesSelData.push(datos);
                        var numReg = $("#lblRegSel").text() ? $("#lblRegSel").text() : 0;
                        $("#lblRegSel").text(--numReg);
                        var datafound = _.findWhere(self.registrosSelData, datos);
                        index = _.indexOf(self.registrosSelData, datafound);

                        if (index >= 0) {
                            self.registrosSelData.splice(index, 1);
                        }
                    }
                });
            },
            resizeGrid: function (id) {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var divtabla = $("#tablaOrden").innerHeight();
                var items = $(".k-tabstrip-items").innerHeight();

                var gridElement = $(id),
                    dataArea = gridElement.find(".k-grid-content"),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    groupingArea = gridElement.find(".k-grouping-header").innerHeight(),
                    otherElementsHeight = 0;

                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - cabeceraHeight - divtabla - 275);
            },
            resizeDiv: function () {
                var pestanias = $(".k-tabstrip-items").height();
                var contenidoGlobal = $("#divHTMLContenido").height();
                var tablaOrden = $("#tablaOrden").height();
                var cabecera = $("#divCabeceraVista").height();
                var cantidadHeight = $("#divFiltros").height();

                $("#divConsumoExterno").height(contenidoGlobal - cabecera - pestanias - tablaOrden - cantidadHeight - 55);
            },
            resizeSplitter: function () {
                var pestanias = $(".k-tabstrip-items").height();
                var contenidoGlobal = $("#divHTMLContenido").height();
                var tablaOrden = $("#tablaOrden").height();
                var outerSplitter = $("#verticalSplitter").data("kendoSplitter");
                var cabecera = $("#divCabeceraVista").height();
                var cantidadHeight = $("#divFiltros").height();

                outerSplitter.wrapper.height(contenidoGlobal - pestanias - tablaOrden - cabecera - cantidadHeight - 60);
                outerSplitter.resize();
            },
        });

        return vistaConsumo;
    });
