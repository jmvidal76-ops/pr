define(['underscore', 'backbone', 'jquery' , 'jszip', 'definiciones','compartido/notificaciones', 'vistas/vDialogoConfirm'
],
    function (_, Backbone, $, JSZip, definiciones, Not, VistaDlgConfirm) {
        var vistaProduccion = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLDetalleOrdenesProduccion',
            confirmacion: null,
            dialogoConfirm: null,
            dsProduccion: [],
            listaIdsProduccion: [],
            registrosSelDataProduccion: [],
            registrosDesSelDataProduccion: [],
            listaIdsLotesProduccions: [],
            dsProduccion: [],
            dsTransferencias: [],
            gridProduccion: null,
            gridProduccion: null,
            gridTransferencia: null,
            idorden: 0,
            opciones: null,
            order: [],
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
                self.CargarGrids(self);

                this.aplicarSeleccionGridProduccion(false);

                if (self.isOrdenActiva) {
                    $("#btnSelTodosProduccion").show();
                    $("#btnDesSelTodosProduccion").show();
                    $("#spanRegSelProduccion").show();
                    $("#lblRegSelProduccion").show();
                } else {
                    $("#btnSelTodosProduccion").hide();
                    $("#btnDesSelTodosProduccion").hide();
                    $("#spanRegSelProduccion").hide();
                    $("#lblRegSelProduccion").hide();
                }

                $("#txtCantidadProduccion").kendoNumericTextBox({
                    placeholder: '',
                    decimals: 2,
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                });

                $("#btnSelTodosProduccion").unbind().click(() => self.aplicarSeleccionGridProduccion(true));
                $("#btnDesSelTodosProduccion").unbind().click(() => self.aplicarSeleccionGridProduccion(false));
                $("#btnAsignarCantidadProduccion").unbind().click(() => self.confirmAsignarCantidadProduccion(self));
                $("#btnLimpiarFiltrosProduccion").unbind().click(() => $("#gridProduccion").data("kendoGrid").dataSource.filter({}));
                $("#btnEliminarMovProduccion").unbind().click(() => self.confirmEliminarMovimientosProduccion(self));
            },
            events: {
            },
            limpiarFiltrosProduccion: function () {
                var gridDataSource = $("#gridProduccion").data("kendoGrid").dataSource;
                gridDataSource.filter({});
            },
            confirmAsignarCantidadProduccion: function (self) {
                let cantidadMovimiento = $("#txtCantidadProduccion").data("kendoNumericTextBox").value();
                if (cantidadMovimiento <= 0 || cantidadMovimiento == "") {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('CANTIDAD_MAYOR_CERO'), 4000);
                }
                else if (self.registrosSelDataProduccion.length > 0) {
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('CANTIDAD'),
                        msg: window.app.idioma.t('DESEA_REALMENTE_CAMBIAR_CANTIDAD'),
                        funcion: function () { self.asignarCantidadProduccion(self); },
                        contexto: this
                    });
                } else {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                }
            },
            asignarCantidadProduccion: function (self) {
                var datosActualizar = self.registrosSelDataProduccion;
                let cantidadMovimiento = $("#txtCantidadProduccion").data("kendoNumericTextBox").value();
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
                            $('#gridProduccion').data('kendoGrid').dataSource.read();
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
            confirmEliminarMovimientosProduccion: function (self) {
                const permiso = TienePermiso(354);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                if (self.registrosSelDataProduccion.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ELIMINAR_MOVIMIENTOS'),
                    msg: window.app.idioma.t('DESEA_REALMENTE_ELIMINAR_MOVIMIENTOS'),
                    funcion: function () { self.eliminarMovimientosProduccion(self); },
                    contexto: this
                });
            },
            eliminarMovimientosProduccion: function (self) {
                let datos = self.registrosSelDataProduccion;

                $.ajax({
                    type: "DELETE",
                    url: "../api/OrdenesFab/EliminarMovimientos",
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            $('#gridProduccion').data('kendoGrid').dataSource.read();
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
            aplicarSeleccionGridProduccion: function (checked) {
                var self = this;

                self.selTodos = checked;

                var grid = $('#gridProduccion').data('kendoGrid');
                if (self.selTodos) {
                    grid.tbody.find('.checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var dataSource = grid.dataSource;
                    var filters = dataSource.filter();
                    var allData = dataSource.data();
                    var query = new kendo.data.Query(allData);
                    var dataFiltered = query.filter(filters).data;
                    $("#lblRegSelProduccion").text(dataFiltered.length);
                } else {
                    grid.tbody.find('.checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');
                    self.registrosDesSelDataProduccion = [];
                    self.registrosSelDataProduccion = [];
                    $("#lblRegSelProduccion").text("");
                }
            },
            CargarGrids: function (self) {
                var urlReadProduccion = self.order?.TipoOrden.ID == self.tipoWO.Filtracion ? "../api/OrdenesFab/ObtenerLotesProducidosFiltracion" : "../api/OrdenesFab/ObtenerLotesProducidosPorLoteMES/" + self.LoteMES + "/";

                if (self.order?.TipoOrden.ID == self.tipoWO.Trasiego) {
                    urlReadProduccion = "../api/OrdenesFab/ObtenerLotesProducidosTrasiegoPorIdWO/" + self.opciones.IdWO;
                }

                if (!$("#gridProduccion").data("kendoGrid")) {
                self.dsProduccion = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: urlReadProduccion,
                            data: function () {
                                var result = {};
                                if (self.order && self.order?.TipoOrden.ID == self.tipoWO.Filtracion) {
                                    result.fechaDesde = new Date(kendo.toString(kendo.parseDate(self.order?.FecInicio), "yyyy-MM-dd HH:mm:ss")).toISOString();
                                    result.fechaHasta = self.order?.FecFin == '---' ? new Date().toISOString() : new Date(kendo.toString(kendo.parseDate(self.order?.FecFin), "yyyy-MM-dd HH:mm:ss")).toISOString();
                                    result.idUbicacion = self.opciones.IdUbicacion;
                                }
                                return result;
                            },
                            dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                            cache: false
                        }
                    },
                    requestEnd: function (e) { if (e.type == "read") self.aplicarSeleccionGridProduccion(false) },
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
                            }
                        }
                    }
                });

                //Grid Produccion
               
                    if (self.order?.TipoOrden.ID == self.tipoWO.Trasiego) {
                        self.gridProduccion = $("#gridProduccion").kendoGrid({
                            dataSource: self.dsProduccion,
                            groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                            filterable: {
                                extra: false,
                                messages: window.app.cfgKendo.configuracionFiltros_Msg,
                                operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                            },
                            toolbar: [
                                {
                                    template: "<button type='button' id='btnSelTodosProduccion' class='k-button k-button-icontext'><span class='k-icon k-i-hbars'></span>" + window.app.idioma.t('SELECCIONAR_TODOS') + "</button>"
                                },
                                {
                                    template: "<button type='button' id='btnDesSelTodosProduccion' class='k-button k-button-icontext'><span class='k-icon k-si-cancel'></span>" + window.app.idioma.t('DESELECCIONAR_TODOS') + "</button>"
                                },
                                {
                                    template: "<span id='spanRegSelProduccion' style='margin-left:10px;'>" + window.app.idioma.t('REGISTROS_SEL') + "</span> <span id='lblRegSelProduccion'></span>"
                                },
                                {
                                    template: "<button id='btnLimpiarFiltrosProduccion' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
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
                                    self.listaIdsProduccion = this._data.map(item => item.IdLoteMateriaPrima).filter((value, index, self) => self.indexOf(value) === index);
                                }
                                //self.events(self);
                                self.resizeGrid("#gridProduccion");
                                self.validarCheck(self);
                            },
                        }).data("kendoGrid");
                    }
                    else if (self.order?.TipoOrden.ID == self.tipoWO.Filtracion) {
                        self.gridProduccion = $("#gridProduccion").kendoGrid({
                            dataSource: self.dsProduccion,
                            groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                            filterable: {
                                extra: false,
                                messages: window.app.cfgKendo.configuracionFiltros_Msg,
                                operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                            },
                            toolbar: [
                                {
                                    template: "<button type='button' id='btnSelTodosProduccion' class='k-button k-button-icontext'><span class='k-icon k-i-hbars'></span>" + window.app.idioma.t('SELECCIONAR_TODOS') + "</button>"
                                },
                                {
                                    template: "<button type='button' id='btnDesSelTodosProduccion' class='k-button k-button-icontext'><span class='k-icon k-si-cancel'></span>" + window.app.idioma.t('DESELECCIONAR_TODOS') + "</button>"
                                },
                                {
                                    template: "<span id='spanRegSelProduccion' style='margin-left:10px;'>" + window.app.idioma.t('REGISTROS_SEL') + "</span> <span id='lblRegSelProduccion'></span>"
                                },
                                {
                                    template: "<button id='btnLimpiarFiltrosProduccion' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                                }
                            ],
                            scrollable: true,
                            sortable: true,
                            selectable: true,
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
                                width: 100,
                            },
                            {
                                field: "LoteOrigen",
                                title: window.app.idioma.t("LOTE_ORIGEN"),
                                template: '<span class="addTooltip"> #= LoteOrigen #</span>',
                                attributes: {
                                    style: 'white-space: nowrap ',
                                },
                                width: 350
                            },
                            {
                                field: "LoteDestino",
                                title: window.app.idioma.t("LOTE_DESTINO"),
                                template: '<span class="addTooltip"> #= LoteDestino #</span>',
                                attributes: {
                                    style: 'white-space: nowrap ',
                                },
                                width: 350
                            },
                            {
                                field: "UbicacionDestino",
                                title: window.app.idioma.t("UBICACION_DESTINO"),
                                template: '<span class="addTooltip"> #= UbicacionDestino #</span>',
                                attributes: {
                                    style: 'white-space: nowrap ',
                                },
                                width: 80,
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            return "<div><label><input type='checkbox' value='#=UbicacionDestino#' style='//width: 14px;height:14px;margin-right:5px;'/>#= UbicacionDestino #</label></div>";
                                        }
                                    }
                                }
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
                                width: 170,
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
                                width: 150,
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
                                field: "CantidadActual",
                                template: '#= CantidadActual !== undefined ?  $.isNumeric(CantidadActual.toString().replace(",",".")) ? kendo.format("{0:n2}",parseFloat(CantidadActual.toString().replace(",","."))) : CantidadActual : ""  #',
                                title: window.app.idioma.t("CANTIDAD"),
                                width: 80,
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
                                width: 70,
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
                                    self.listaIdsProduccion = this._data.map(item => item.IdLoteMateriaPrima).filter((value, index, self) => self.indexOf(value) === index);
                                }

                                //self.events(self);
                                self.resizeGrid("#gridProduccion");
                                self.validarCheck(self);
                            },
                        }).data("kendoGrid");
                    }
                    else {
                        self.gridProduccion = $("#gridProduccion").kendoGrid({
                            dataSource: self.dsProduccion,
                            selectable: true,
                            groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                            filterable: {
                                extra: false,
                                messages: window.app.cfgKendo.configuracionFiltros_Msg,
                                operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                            },
                            toolbar: [
                                {
                                    template: "<button type='button' id='btnSelTodosProduccion' class='k-button k-button-icontext'><span class='k-icon k-i-hbars'></span>" + window.app.idioma.t('SELECCIONAR_TODOS') + "</button>"
                                },
                                {
                                    template: "<button type='button' id='btnDesSelTodosProduccion' class='k-button k-button-icontext'><span class='k-icon k-si-cancel'></span>" + window.app.idioma.t('DESELECCIONAR_TODOS') + "</button>"
                                },
                                {
                                    template: "<span id='spanRegSelProduccion' style='margin-left:10px;'>" + window.app.idioma.t('REGISTROS_SEL') + "</span> <span id='lblRegSelProduccion'></span>"
                                },
                                {
                                    template: "<button id='btnLimpiarFiltrosProduccion' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
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
                                    width: 100,
                                },
                                {
                                    field: "IdLoteMES",
                                    title: window.app.idioma.t("LOTE"),
                                    template: '<span class="addTooltip"> #= IdLoteMES #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    width: 180
                                },
                                {
                                    field: "UbicacionDestino",
                                    title: window.app.idioma.t("UBICACION_DESTINO"),
                                    template: '<span class="addTooltip"> #= UbicacionDestino #</span>',
                                    attributes: {
                                        style: 'white-space: nowrap ',
                                    },
                                    width: 80,
                                    filterable: {
                                        multi: true,
                                        itemTemplate: function (e) {
                                            if (e.field == "all") {
                                                return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                            } else {
                                                return "<div><label><input type='checkbox' value='#=UbicacionDestino#' style='//width: 14px;height:14px;margin-right:5px;'/>#= UbicacionDestino #</label></div>";
                                            }
                                        }
                                    }
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
                                    width: 170,
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
                                    width: 150,
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
                                    field: "CantidadActual",
                                    template: '#= CantidadActual !== undefined ?  $.isNumeric(CantidadActual.toString().replace(",",".")) ? kendo.format("{0:n2}",parseFloat(CantidadActual.toString().replace(",","."))) : CantidadActual : ""  #',
                                    title: window.app.idioma.t("CANTIDAD"),
                                    width: 80,
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
                                    width: 70,
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
                                    self.listaIdsProduccion = this._data.map(item => item.IdLoteMateriaPrima).filter((value, index, self) => self.indexOf(value) === index);
                                }

                                //self.events(self);
                                self.resizeGrid("#gridProduccion");
                                self.validarCheck(self);
                            },
                        }).data("kendoGrid");
                    }
                }

                $("#gridProduccion").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");
            },
            validarCheck: function (self) {
                var grid = $("#gridProduccion").data("kendoGrid");
                $(".checkbox").bind("change", function (e) {
                    var checked = this.checked;
                    row = $(e.target).closest("tr");
                    dataItem = grid.dataItem(row);
                    var datos = {};
                    datos = dataItem.IdMovimiento;

                    if (checked) {
                        row.addClass("k-state-selected");
                        var datafound = _.findWhere(self.registrosDesSelDataProduccion, datos);
                        index = _.indexOf(self.registrosDesSelDataProduccion, datafound);

                        if (index >= 0) {
                            self.registrosDesSelDataProduccion.splice(index, 1);
                        }

                        var numReg = $("#lblRegSelProduccion").text() ? $("#lblRegSelProduccion").text() : 0;
                        $("#lblRegSelProduccion").text(++numReg);
                        self.registrosSelDataProduccion.push(datos);
                    } else {
                        row.removeClass("k-state-selected");
                        self.registrosDesSelDataProduccion.push(datos);
                        var numReg = $("#lblRegSelProduccion").text() ? $("#lblRegSelProduccion").text() : 0;
                        $("#lblRegSelProduccion").text(--numReg);
                        var datafound = _.findWhere(self.registrosSelDataProduccion, datos);
                        index = _.indexOf(self.registrosSelDataProduccion, datafound);

                        if (index >= 0) {
                            self.registrosSelDataProduccion.splice(index, 1);
                        }
                    }
                });
            },
            eliminar: function () {
                this.remove();
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
                dataArea.height(contenedorHeight - cabeceraHeight - divtabla - 245);
            },
        });

        return vistaProduccion;
    });
