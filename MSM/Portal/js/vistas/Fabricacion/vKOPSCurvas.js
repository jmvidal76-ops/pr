define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/KOPSCurva.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm',
    'definiciones', 'vistas/Fabricacion/vImportarKOPsMultivalorPorDefecto', 'vistas/Fabricacion/vCrearCurva', 'vistas/Fabricacion/vUpdateCurva',
    'vistas/Fabricacion/vUpdateCurvaPosicion', 'vistas/Fabricacion/vCrearKOPsMaterial'],
    function (_, Backbone, $, plantilla, Notificacion, VistaDlgConfirm, definiciones, VistaImportar, vistaCrearMultivalor, vistaUpdateCurva, vistaUpdateCurvaPosicion, VistaCrearKOPsMaterial) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            alturaGrid: null,
            cmbZonas: null,
            gridMostos: null,
            gridKOPsMultivalorDefecto: null,
            gridMaestroCurva: null,
            gridMaestroKOPsMultivalorMosto: null,
            gridMaestroCurvaMosto: null,
            tipoSeleccionado: 1,
            dataKOP: null,
            filaSeleccionadaMaestro: null,
            filaSeleccionadaMosto: null,
            filaSeleccionadaMostoPosicion: null,
            dataItemMaestroKopsMultivalorSeleccionado: null,
            dataItemKopsMultivalorSeleccionadoMosto: null,
            dataItemKopsMultivalorSeleccionadoPosicion: null,
            primeraVez: null,
            tiposWO: definiciones.TipoWO(),
            template: _.template(plantilla),
            idZona: null,
            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;
                self.render(self.tiposWO.Coccion);
            },
            render: function () {
                var self = this;
                self.primeraVez = true;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());
                self.asignacionValor(self.tiposWO);

                $("#tabsMateriales").kendoTabStrip({
                    select: function (e) { self.selectTab(e, self) },
                    scrollable: true,
                    animation: {
                        open: {
                            effects: "fadeIn"
                        }
                    }
                });

                $("#tabsEstados").kendoTabStrip({
                    select: function (e) { self.selectTabTipoOrden(e, self) },
                    scrollable: true,
                    animation: {
                        open: {
                            effects: "fadeIn"
                        }
                    }
                });


                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerZonasKOPsPorTipoOrden/" + self.tipoSeleccionado,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {

                    self.cmbZonas = data;
                }).fail(function (xhr) {
                    Notificacion.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 2000);
                });

                $("#cmbZonas").kendoDropDownList({
                    dataTextField: "DescripcionZona",
                    dataValueField: "IdZona",
                    dataSource: {
                        data: self.cmbZonas,
                        sort: { field: "DescripcionZona", dir: "asc" },
                    },
                    change: function (e) {
                        self.idZona = this.value();
                        self.cargarGrid(self.tipoSeleccionado);
                    }
                }).data("kendoDropDownList");

                if (self.cmbZonas != null) {
                    self.cargarGrid(self.tipoSeleccionado);
                }

                self.cambioSelector(self.tipoSeleccionado);
            },
            asignacionValor: function (tipoOrden) {
                $("#idCoccion").val(tipoOrden.Coccion);
                $("#idFermentacion").val(tipoOrden.Fermentacion);
                $("#idTrasiego").val(tipoOrden.Trasiego);
                $("#idGuarda").val(tipoOrden.Guarda);
                $("#idFiltracion").val(tipoOrden.Filtracion);
                $("#idPrellenado").val(tipoOrden.Prellenado);
                $("#idConcentrado").val(tipoOrden.Concentrado);
            },
            cargarGrid: function (tipoOrden) {
                var self = this;

                if ($("#divMosto").data("kendoGrid")) {
                    $("#divMosto").data("kendoGrid").destroy();
                }

                if ($("#divMaterialesDefecto").data("kendoGrid")) {
                    $("#divMaterialesDefecto").data("kendoGrid").destroy();
                }

                self.idZona = $("#cmbZonas").data("kendoDropDownList").value();

                gridKOPsMultivalorDefecto = $("#divMaterialesDefecto").kendoGrid({
                    dataSource: {
                        type: "json",
                        transport: {
                            read: "../api/ObtenerListadoMaestroKOPsMultivalorPorZonaTipo/" + self.idZona + "/" + tipoOrden
                        },
                        pageSize: 200,
                        schema: {
                            model: {
                                id: "PK",
                                fields: {
                                    'ID_MAESTRO': { type: "string" },
                                    'PK': { type: "string" },
                                    'ID_ORDEN': { type: "string" },
                                    'COD_KOP': { type: "string" },
                                    'NAME': { type: "string" },
                                    'PROCCESS': { type: "string" },
                                    'MEDIDA': { type: "string" },
                                    'TIPO': { type: "string" },
                                    'DATATYPE': { type: "string" }
                                }
                            }
                        },
                        sort: { field: "ID_ORDEN", dir: "desc" }
                    },
                    sortable: true,
                    selectable: "multiple,row",
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
                    detailTemplate: kendo.template(this.$("#templateDetalleKopMultivalor").html()),
                    detailInit: function (e) {
                        $("#divMaterialesDefecto").data("kendoGrid").clearSelection();
                        self.masterRow = e;
                        $("#divMaterialesDefecto").data("kendoGrid").select(e.masterRow);
                        dataItemMaestroKopsMultivalorSeleccionado = e.sender.dataItem(e.masterRow);
                        self.detailInitDefecto(e);
                    },
                    detailExpand: function (e) {
                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                        $("#divMaterialesDefecto").data("kendoGrid").clearSelection();
                        self.masterRow = e;
                        $("#divMaterialesDefecto").data("kendoGrid").select(e.masterRow);
                        dataItemMaestroKopsMultivalorSeleccionado = e.sender.dataItem(e.masterRow);
                        e.data = e.sender.dataItem(e.masterRow);
                        self.detailInitDefecto(e);
                    },
                    dataBound: function () {
                        self.resizeGrid(self, "#divMaterialesDefecto");
                        self.events(self);
                    },
                    toolbar: [
                        {
                            template: "<button type='button' id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        }
                    ],
                    columns: [
                        {
                            field: "PK",
                            title: window.app.idioma.t("N_KOPMULTIVALOR"),
                            width: 180
                        },
                        {
                            field: "COD_KOP",
                            template: "#=COD_KOP + ' - ' + NAME#",
                            title: window.app.idioma.t("KOPS_PROCESO"),
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            width: 300
                        },
                        {
                            template: "#= PROCCESS #",
                            field: "COD_PROCCESS",
                            title: window.app.idioma.t("PROCEDIMIENTO"),
                            width: 150,
                            filteable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=COD_PROCCESS#' style='width: 14px;height:14px;margin-right:5px;'/>#= PROCCESS # </label></div>";
                                    }
                                }
                            }
                        },
                        {
                            template: "#= MEDIDA #",
                            field: "MEDIDA",
                            title: window.app.idioma.t("UNIDAD_MEDIDA"),
                            width: 150,
                            filteable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=MEDIDA#' style='width: 14px;height:14px;margin-right:5px;'/>#= MEDIDA # </label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "TIPO",
                            title: window.app.idioma.t("TIPOKOP"),
                            width: 150,
                            filteable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=TIPO#' style='width: 14px;height:14px;margin-right:5px;'/>#= TIPO # </label></div>";
                                    }
                                }
                            }
                        },
                        {
                            template: "#=DATATYPE.charAt(0).toUpperCase() + DATATYPE.slice(1)#",
                            field: "DATATYPE",
                            title: window.app.idioma.t("TIPO_DATO"),
                            filteable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=DATATYPE#' style='width: 14px;height:14px;margin-right:5px;'/>#= DATATYPE # </label></div>";
                                    }
                                }
                            },
                            width: 150,
                        },
                        {
                            title: window.app.idioma.t("EDITAR"),
                            template: function (e) {
                                if (TienePermiso(99)) {
                                    return "<a id='btnEditar" + e.ID_MAESTRO + "' class='k-button k-grid-edit btnEditarKOPMultivalor' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                                } else {
                                    return "<a id='btnEditar" + e.ID_MAESTRO + "' class='k-button k-grid-edit btnEditarKOPMultivalor' style='min-width:16px; visibility:hidden'><span class='k-icon k-edit'></span></a>"
                                }
                            },
                            width: 80,
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            title: window.app.idioma.t("ELIMINAR"),
                            template: function (e) {
                                if (TienePermiso(99)) {
                                    return "<a id='btnEliminar" + e.ID_MAESTRO + "' class='k-button k-delete btnEliminarKOPMultivalor' style='min-width:16px;'><span class='k-icon k-delete'></span></a>"
                                } else {
                                    return "<a id='btnEliminar" + e.ID_MAESTRO + "' class='k-button k-delete btnEliminarKOPMultivalor' style='min-width:16px; visibility:hidden'><span class='k-icon k-delete'></span></a>"
                                }
                            },
                            width: 80,
                            attributes: { style: "text-align:center;" }
                        }
                    ]
                }).data("kendoGrid");

                switch (tipoOrden) {
                    case self.tiposWO.Prellenado:
                        $("#txtMostos").text(window.app.idioma.t('CERVEZAS'));
                        break;
                    case self.tiposWO.Concentrado:
                        $("#txtMostos").text(window.app.idioma.t('MATERIALES'));
                        break;
                    default:
                        $("#txtMostos").text(window.app.idioma.t('MOSTOS'));
                        break;
                }
                gridMostos = $("#divMosto").kendoGrid({
                    dataSource: {
                        type: "json",
                        transport: {
                            read: "../api/ObtenerMostosPorZonaTipo/" + self.idZona + "/" + tipoOrden
                        },
                        pageSize: 50
                    },
                    selectable: "multiple,row",
                    sortable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    detailTemplate: kendo.template(this.$("#templateDetalleKopMultivalorMostos").html()),
                    detailInit: function (e) {
                        $("#divMosto").data("kendoGrid").clearSelection();
                        self.masterRow = e;
                        $("#divMosto").data("kendoGrid").select(e.masterRow);
                        dataItemKopsMultivalorSeleccionadoMosto = e.sender.dataItem(e.masterRow);
                        self.detailInitMosto(e);
                    },
                    detailExpand: function (e) {
                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                        $("#divMosto").data("kendoGrid").clearSelection();
                        self.masterRow = e;
                        $("#divMosto").data("kendoGrid").select(e.masterRow);
                        self.dataItemKopsMultivalorSeleccionadoMosto = e.sender.dataItem(e.masterRow);
                        e.data = e.sender.dataItem(e.masterRow);
                        self.detailInitMosto(e);
                    },
                    dataBound: function () {
                        self.resizeGrid(self, "#divMosto");
                    },
                    toolbar: [
                        {
                            template: "<button type='button' id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        },
                        {
                            template: function (e) {
                                if (TienePermiso(99)) {
                                    return "<button type='button' id='btnImportarKOPsMultivalor' style='float:right;background-color:green;color:white;' class='k-button k-button-icontext k-grid-add btnImportarKOPsMultivalor'><span class='k-icon k-add'></span>" + window.app.idioma.t('IMPORTAR_KOPS_POR') + "</button>"
                                } else {
                                    return ""
                                }
                            }
                        },
                        {
                            template: function (e) {
                                if (TienePermiso(99)) {
                                    return "<button type='button' id='btnCrearKopsMaterialMultivalor' style='float:right;background-color:#26a6f5;color:white;' class='k-button k-button-icontext k-grid-add btnCrearKopsMaterialMultivalor'><span class='k-icon k-add'></span>" + window.app.idioma.t('CREAR_KOPS_PARA_MATERIAL') + "</button>"
                                } else {
                                    return ""
                                }
                            }
                        }
                    ],
                    columns: [{
                        field: "NombreMosto",
                        title: window.app.idioma.t("ID_MATERIAL")
                    }, {
                        field: "DescripcionMosto",
                        title: window.app.idioma.t("DESCRIPCION_MATERIAL")
                    }]
                }).data("kendoGrid");

                $(".btnImportarKOPsMultivalor").kendoButton({
                    click: function (e) {
                        self.importarKOPsMultivalor(self);
                    }
                });
                $(".btnCrearKopsMaterialMultivalor").kendoButton({
                    click: function (e) {
                        self.abrirDialogoCrearKOPsMaterial(self);
                    }
                });
            },
            detailInitDefecto: function (e) {
                var self = this;
                var detailRow = e.detailRow;
                var datos = e.data;

                self.idZona = $("#cmbZonas").data("kendoDropDownList").value();

                var dsMultivalor = new kendo.data.DataSource({
                    transport: {
                        read: "../api/ObtenerListadoKOPsMultivalorExpandidoPorZonaKOPTipo/" + self.idZona + "/" + parseInt(datos.id) + "/" + datos.COD_PROCCESS + "/" + self.tipoSeleccionado,
                    },
                    pageSize: 200,
                    async: true,
                    schema: {
                        model: {
                            id: "PK",
                            fields: {
                                'PK': { type: "string" },
                                'NAME': { type: "string" },
                                'VALOR_MAXIMO': { type: "string" },
                                'VALOR_MINIMO': { type: "string" },
                                'VALOR': { type: "string" },
                                'MEDIDA': { type: "string" },
                                'INDEX': { type: "number" },
                                'ACTIVO': { type: "bool" }
                            }
                        }
                    }
                });
                self.filaSeleccionadaMaestro = detailRow.find(".divDetalleMaestroKOPMultivalorCurva");

                if (detailRow.find(".divDetalleMaestroKOPMultivalorCurva").data("kendoGrid")) {
                    detailRow.find(".divDetalleMaestroKOPMultivalorCurva").data("kendoGrid").destroy();
                }


                self.gridMaestroCurva = detailRow.find(".divDetalleMaestroKOPMultivalorCurva").kendoGrid({
                    dataSource: dsMultivalor,
                    sortable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    dataBound: function () {
                        self.resizeGrid(self, ".divDetalleMaestroKOPMultivalorCurva");
                        self.eventsMaestroPosicion(self, detailRow.find(".divDetalleMaestroKOPMultivalorCurva"));
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: [200, 400, 600],
                        buttonCount: 200,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    toolbar: [
                        {
                            template: "<button type='button' id='btnAnadirMaestroPosicion" + datos.ID_MAESTRO + "' class='k-button k-button-icontext @" + datos.ID_MAESTRO + "-" + datos.NAME + "@ btnAnadirMaestroPosicion' style='float:right;background-color:green;color:white;margin-left:5px;'> <span class='k-icon k-i-add'></span>" + window.app.idioma.t('AÑADIR_POSICION') + "</button>"
                        }
                    ],
                    columns: [
                        {
                            title: window.app.idioma.t("HABILITADO"),
                            template: '# if(ACTIVO) { #' +
                                ' <input class="checkbox activaCurva" type="checkbox" style="width: 14px;height: 14px; left: 23px;" checked disabled/>' +
                                ' # } else { #' +
                                '<input class="checkbox activaCurva" type="checkbox" style="width: 14px;height: 14px; left: 23px;" disabled/>' +
                                '# } #',
                            width: 80
                        },
                        {
                            field: "INDEX",
                            title: window.app.idioma.t("INDICE"),
                            width: 100
                        },
                        {
                            field: "NAME",
                            template: "#=NAME + ' - Posicion ' + INDEX#",
                            title: window.app.idioma.t("DESCRIPCION"),
                            width: 420,
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                        },
                        {
                            field: "VALOR_MINIMO",
                            title: window.app.idioma.t("VALOR_MINIMO"),
                            template: function (e) {
                                return self.ObtenerValor(e, "VALOR_MINIMO")

                            }
                        },
                        {
                            field: "VALOR",
                            title: window.app.idioma.t("VALOR"),
                            template: function (e) {
                                return self.ObtenerValor(e, "VALOR")

                            }
                        },
                        {
                            field: "VALOR_MAXIMO",
                            title: window.app.idioma.t("VALOR_MAXIMO"),
                            template: function (e) {
                                return self.ObtenerValor(e, "VALOR_MAXIMO")
                            }

                        },
                        {
                            field: "MEDIDA",
                            title: window.app.idioma.t("UNIDAD_MEDIDA")
                        },
                        {
                            title: window.app.idioma.t("EDITAR"),
                            template: function (e) {
                                if (TienePermiso(99)) {
                                    return "<a id='btnEditar#=IdValor#' class='k-button k-grid-edit btnModificarMaestroPosicion' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                                } else {
                                    return "<a id='btnEditar#=IdValor#' class='k-button k-grid-edit btnModificarMaestroPosicion' style='min-width:16px; visibility:hidden'><span class='k-icon k-edit'></span></a>"
                                }


                            },
                            width: 70,
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            title: window.app.idioma.t("ELIMINAR"),
                            template: function (e) {
                                if (TienePermiso(99)) {
                                    return "<a id='btnEliminar#=IdValor#' class='k-button k-grid-delete btnEliminarPosicionDefecto' style='min-width:16px;'><span class='k-icon k-delete'></span></a>"
                                } else {
                                    return "<a id='btnEliminar#=IdValor#' class=k-button k-grid-delete btnEliminarPosicionDefecto' style='min-width:16px; visibility:hidden'><span class='k-icon k-delete'></span></a>"
                                }
                            },
                            width: 70,
                            attributes: { style: "text-align:center;" }
                        }
                    ]
                }).data("kendoGrid");


                $("#btnAnadirMaestroPosicion" + datos.ID_MAESTRO).kendoButton({
                    click: function (e) {
                        var data = dataItemMaestroKopsMultivalorSeleccionado;
                        data.Fila = self.filaSeleccionadaMaestro;
                        data.IdMosto = null;
                        data.IdZona = self.idZona;
                        data.IdTipo = self.tipoSeleccionado;
                        self.crearPosicionDefecto(data);
                    }
                });
            },
            detailInitMosto: function (e) {
                var self = this;
                var detailRow = e.detailRow;
                var datos = e.data;

                self.idZona = $("#cmbZonas").data("kendoDropDownList").value();
                self.mostoSeleccionado = datos.NombreMosto;
                var dsMultivalor = new kendo.data.DataSource({
                    transport: {
                        read: "../api/ObtenerListadoKOPsMultivalorPorZonaTipoMosto/" + self.idZona + "/" + self.tipoSeleccionado + "/" + datos.NombreMosto
                    },
                    pageSize: 200,
                    async: true,
                    schema: {
                        model: {
                            id: "PK",
                            fields: {
                                'ID_MAESTRO': { type: "string" },
                                'PK': { type: "string" },
                                'ID_ORDEN': { type: "string" },
                                'COD_KOP': { type: "string" },
                                'NAME': { type: "string" },
                                'PROCCESS': { type: "string" },
                                'MEDIDA': { type: "string" },
                                'TIPO': { type: "string" },
                                'DATATYPE': { type: "string" }
                            }
                        }
                    }
                });

                if (detailRow.find(".divDetalleKopMostoKOPMultivalor").data("kendoGrid")) {
                    detailRow.find(".divDetalleKopMostoKOPMultivalor").data("kendoGrid").destroy();
                }
                gridMaestroKOPsMultivalorMosto = detailRow.find(".divDetalleKopMostoKOPMultivalor").kendoGrid({
                    dataSource: dsMultivalor,
                    selectable: "multiple,row",
                    sortable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    dataBound: function () {
                        self.resizeGrid(self, ".divDetalleKopMostoKOPMultivalor");
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: [200, 400, 600],
                        buttonCount: 200,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    detailTemplate: kendo.template(this.$("#templateDetalleKopMultivalorMostosPosicion").html()),
                    detailInit: function (e) {
                        detailRow.find(".divDetalleKopMostoKOPMultivalor").data("kendoGrid").clearSelection();
                        self.masterRow = e;
                        detailRow.find(".divDetalleKopMostoKOPMultivalor").data("kendoGrid").select(e.masterRow);
                        dataItemKopsMultivalorSeleccionadoPosicion = e.sender.dataItem(e.masterRow);
                        self.detailInitCurva(e);
                    },
                    detailExpand: function (e) {
                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                        detailRow.find(".divDetalleKopMostoKOPMultivalor").data("kendoGrid").clearSelection();
                        self.masterRow = e;
                        detailRow.find(".divDetalleKopMostoKOPMultivalor").data("kendoGrid").select(e.masterRow);
                        dataItemKopsMultivalorSeleccionadoPosicion = e.sender.dataItem(e.masterRow);
                        self.filaSeleccionadaMosto = detailRow.find(".divDetalleKopMostoKOPMultivalor");
                    },
                    columns: [
                        {
                            field: "PK",
                            title: window.app.idioma.t("N_KOPMULTIVALOR"),
                            width: 160
                        },
                        {
                            field: "COD_KOP",
                            template: "#=COD_KOP + ' - ' + NAME#",
                            title: window.app.idioma.t("KOPS_PROCESO"),
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            width: 300
                        },
                        {
                            template: "#= PROCCESS #",
                            field: "COD_PROCCESS",
                            title: window.app.idioma.t("PROCEDIMIENTO"),
                            width: 100,
                            filteable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=COD_PROCCESS#' style='width: 14px;height:14px;margin-right:5px;'/>#= PROCCESS # </label></div>";
                                    }
                                }
                            }
                        },
                        {
                            template: "#= MEDIDA #",
                            field: "MEDIDA",
                            title: window.app.idioma.t("UNIDAD_MEDIDA"),
                            width: 150,
                            filteable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=MEDIDA#' style='width: 14px;height:14px;margin-right:5px;'/>#= MEDIDA # </label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "TIPO",
                            title: window.app.idioma.t("TIPOKOP"),
                            width: 130,
                            filteable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=TIPO#' style='width: 14px;height:14px;margin-right:5px;'/>#= TIPO # </label></div>";
                                    }
                                }
                            }
                        },
                        {
                            template: "#=DATATYPE.charAt(0).toUpperCase() + DATATYPE.slice(1)#",
                            field: "DATATYPE",
                            title: window.app.idioma.t("TIPO_DATO"),
                            width: 150,
                            filteable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=DATATYPE#' style='width: 14px;height:14px;margin-right:5px;'/>#= DATATYPE # </label></div>";
                                    }
                                }
                            }
                        }
                    ]
                }).data("kendoGrid");

            },
            detailInitCurva: function (e) {
                var self = this;
                var detailRow = e.detailRow;
                var datos = e.data;

                self.idZona = $("#cmbZonas").data("kendoDropDownList").value();

                self.filaSeleccionadaMostoPosicion = detailRow.find(".divDetalleMostoPosicion");
                if (detailRow.find(".divDetalleMostoPosicion").data("kendoGrid")) {
                    detailRow.find(".divDetalleMostoPosicion").data("kendoGrid").destroy();
                }
                self.gridMaestroCurvaMosto = detailRow.find(".divDetalleMostoPosicion").kendoGrid({
                    sortable: true,
                    selectable: "multiple,row",
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
                        self.eventsMostoPosicion(self, detailRow.find(".divDetalleMostoPosicion"), datos.ID_MAESTRO, dataItemKopsMultivalorSeleccionadoMosto.NombreMosto);
                        self.resizeGrid(self, ".divDetalleMostoPosicion");
                    },
                    toolbar: [
                        {
                            template: "<button type='button' id='btnAnadirMostoPosicion" + datos.ID_MAESTRO + "' class='k-button k-button-icontext @" + datos.ID_MAESTRO + "-" + datos.NAME + " AnadirMostoPosicion" + datos.ID_MAESTRO + "' style='float:right;background-color:green;color:white;margin-left:5px;'> <span class='k-icon k-i-add'></span>" + window.app.idioma.t('AÑADIR_POSICION') + "</button>"
                        }
                    ],
                    columns: [
                        {
                            title: window.app.idioma.t("HABILITADO"),
                            template: '# if(ACTIVO) { #' +
                                ' <input class="checkbox activaCurva" type="checkbox" style="width: 14px;height: 14px; left: 23px;" checked disabled/>' +
                                ' # } else { #' +
                                '<input class="checkbox activaCurva" type="checkbox" style="width: 14px;height: 14px; left: 23px;" disabled/>' +
                                '# } #',
                            width: 80
                        },
                        {
                            field: "INDEX",
                            title: window.app.idioma.t("INDICE"),
                            width: 100
                        },
                        {
                            field: "NAME",
                            template: "#=NAME + ' - Posicion ' + INDEX#",
                            title: window.app.idioma.t("DESCRIPCION"),
                            width: 420,
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                        },
                        {
                            field: "VALOR_MINIMO",
                            title: window.app.idioma.t("VALOR_MINIMO"),
                            template: function (e) {
                                return self.ObtenerValor(e, "VALOR_MINIMO")

                            }
                        },
                        {
                            field: "VALOR",
                            title: window.app.idioma.t("VALOR"),
                            template: function (e) {
                                return self.ObtenerValor(e, "VALOR")

                            }
                        },
                        {
                            field: "VALOR_MAXIMO",
                            title: window.app.idioma.t("VALOR_MAXIMO"),
                            template: function (e) {
                                return self.ObtenerValor(e, "VALOR_MAXIMO")
                            }

                        },
                        {
                            field: "MEDIDA",
                            title: window.app.idioma.t("UNIDAD_MEDIDA")
                        },
                        {
                            title: window.app.idioma.t("EDITAR"),
                            template: function (e) {
                                if (TienePermiso(99)) {
                                    return "<a id='btnEditar#=ID_MAESTRO#' class='k-button k-grid-edit btnModificarMostoPosicion' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                                } else {
                                    return "<a id='btnEditar#=ID_MAESTRO#' class='k-button k-grid-edit btnModificarMostoPosicion' style='min-width:16px; visibility:hidden'><span class='k-icon k-edit'></span></a>"
                                }


                            },
                            width: 70,
                            attributes: { style: "text-align:center;" }
                        }
                    ]
                }).data("kendoGrid");


                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerListadoKOPsMultivalorExpandidoPorZonaKOPTipoMosto/" + self.idZona + "/" + parseInt(datos.id) + "/" + datos.COD_PROCCESS + "/" + self.tipoSeleccionado + "/" + self.mostoSeleccionado,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: false
                }).done(function (searchResults) {
                    var dataSource = new kendo.data.DataSource({ data: searchResults, pageSize: 200 });
                    var grid = detailRow.find(".divDetalleMostoPosicion").data("kendoGrid");
                    dataSource.read();
                    grid.setDataSource(dataSource);
                }).fail(function (xhr) {
                    Notificacion.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 2000);
                });

                $("#btnAnadirMostoPosicion" + datos.ID_MAESTRO).kendoButton({
                    click: function (e) {
                        var data = dataItemKopsMultivalorSeleccionadoPosicion;
                        data.IdMosto = self.mostoSeleccionado;
                        data.Fila = self.filaSeleccionadaMosto;
                        data.IdZona = self.idZona;
                        data.IdTipo = self.tipoSeleccionado;
                        self.crearPosicionMosto(data);
                    }
                });
            },
            //#region EVENTOS
            events: function (self) {
                $(".btnEditarKOPMultivalor").on("click", function (e) {
                    var tr = e.target.closest("tr");
                    var data = $('#divMaterialesDefecto').data('kendoGrid').dataItem(tr);
                    self.editarKOPMultivalorDefecto(self, data);
                });
                $(".btnEliminarKOPMultivalor").on("click", function (e) {
                    var tr = e.target.closest("tr");
                    var data = $('#divMaterialesDefecto').data('kendoGrid').dataItem(tr);
                    self.eliminarKOPMultivalorDefecto(self, data);
                });

                $(".btnLimpiarFiltros").on("click", function (e) {
                    self.limpiarFiltroGrid();
                });
            },
            eventsMaestroPosicion: function (self, filaSeleccionada) {
                filaSeleccionada.find(".btnModificarMaestroPosicion").on("click", function (e) {
                    var data = dataItemMaestroKopsMultivalorSeleccionado;
                    data.Fila = self.filaSeleccionadaMaestro;
                    data.IdMosto = null;
                    var tr = e.target.closest("tr");
                    var dataFila = self.filaSeleccionadaMaestro.data('kendoGrid').dataItem(tr);
                    self.editarPosicionDefecto(data, dataFila, filaSeleccionada);
                });
                filaSeleccionada.find(".btnEliminarPosicionDefecto").on("click", function (e) {
                    var tr = e.target.closest("tr");
                    var dataFila = self.filaSeleccionadaMaestro.data('kendoGrid').dataItem(tr);
                    self.eliminarPosicionDefecto(self, filaSeleccionada, dataFila);
                });
                filaSeleccionada.find(".btnLimpiarFiltros").on("click", function (e) {
                    self.limpiarFiltroGrid();
                });
            },
            eventsMostoPosicion: function (self, filaSeleccionada, idbtn, mostoSeleccionado) {
                filaSeleccionada.find(".btnModificarMostoPosicion").on("click", function (e) {
                    var data = dataItemKopsMultivalorSeleccionadoPosicion;
                    data.IdMosto = mostoSeleccionado;

                    var tr = e.target.closest("tr");
                    var dataFila = self.filaSeleccionadaMostoPosicion.data('kendoGrid').dataItem(tr);
                    self.editarPosicionMosto(data, dataFila, self.filaSeleccionadaMosto);
                });
                filaSeleccionada.find(".btnLimpiarFiltros").on("click", function (e) {
                    self.limpiarFiltroGrid();
                });
            },
            //#endregion EVENTOS
            editarKOPMultivalorDefecto: function (self, data) {
                data.tipoSeleccionado = self.tipoSeleccionado;
                self.vistaUpdateCurva = new vistaUpdateCurva(data, false);
            },
            eliminarKOPMultivalorDefecto: function (self, data) {
                var self = this;
                kendo.ui.progress($("#divMaterialesDefecto"), true);
                var datos = {};
                var _NKOP = data.PK;
                var _idSubProceso = data.COD_PROCCESS;
                datos = {
                    NKOP: _NKOP,
                    IdSubProceso: _idSubProceso
                };

                Date.prototype.toJSON = function () { return moment(this).format(); };

                $.ajax({
                    type: "POST",
                    url: "../api/KOPsFab/BorradoLogicoKOPMultivalor",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    Backbone.trigger('eventCierraDialogo');
                    kendo.ui.progress($("#divMaterialesDefecto"), false);
                    if (res) {
                        $("#divMaterialesDefecto").data('kendoGrid').dataSource.read();
                        Notificacion.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ACTUALIZANDO_OK'), 4000);
                    } else {
                        Notificacion.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ACTUALIZAR_EL'), 4000);

                    }
                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    kendo.ui.progress($("#divMaterialesDefecto"), false);
                    Notificacion.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ACTUALIZAR_EL'), 4000);
                });
            },
            crearPosicionDefecto: function (data, filaSeleccionada) {
                data.ifMosto = false;
                self.vistaCrearMultivalor = new vistaCrearMultivalor(data, filaSeleccionada);
            },
            crearPosicionMosto: function (data, filaSeleccionada) {
                data.ifMosto = true;
                self.vistaCrearMultivalor = new vistaCrearMultivalor(data, filaSeleccionada);
            },
            editarPosicionDefecto: function (data, dataFila, filaSeleccionada) {
                var self = this;
                data.ifMosto = false;
                self.vistaUpdateCurvaPosicion = new vistaUpdateCurvaPosicion(data, dataFila, filaSeleccionada);
            },
            editarPosicionMosto: function (data, dataFila, filaSeleccionada) {
                var self = this;
                data.ifMosto = true;
                self.vistaUpdateCurvaPosicion = new vistaUpdateCurvaPosicion(data, dataFila, filaSeleccionada);
            },
            eliminarPosicionDefecto: function (self, filaSeleccionada, data) {
                kendo.ui.progress($("#divMaterialesDefecto"), true);
                var datos = {};
                var _NKOP = data.COD_KOP;
                datos = {
                    NKOP: _NKOP
                };

                Date.prototype.toJSON = function () { return moment(this).format(); };

                $.ajax({
                    type: "POST",
                    url: "../api/KOPsFab/BorradoLogicoKOPMultivalorPosicion",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    Backbone.trigger('eventCierraDialogo');
                    kendo.ui.progress($("#divMaterialesDefecto"), false);
                    if (res) {
                        filaSeleccionada.data('kendoGrid').dataSource.read();
                        Notificacion.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ACTUALIZANDO_OK'), 4000);
                    } else {
                        Notificacion.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ACTUALIZAR_EL'), 4000);

                    }
                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    kendo.ui.progress($("#divMaterialesDefecto"), false);
                    Notificacion.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ACTUALIZAR_EL'), 4000);
                });
            },
            importarKOPsMultivalor: function (self) {
                this.VistaImportar = new VistaImportar(self.idZona, self.tipoSeleccionado);
            },
            abrirDialogoCrearKOPsMaterial: function (self) {
                this.VistaCrearKOPsMaterial = new VistaCrearKOPsMaterial(self.idZona, self.tipoSeleccionado, "Multivalor", gridMostos.dataSource.data());
            },
            eliminar: function () {
                this.remove();
            },
            resizeGrid: function (self, idGrid) {

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                //var filtrosHeight = $("#divFiltros").innerHeight();

                var gridElement = $(idGrid),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                self.alturaGrid = self.alturaGrid == null ? contenedorHeight - otherElementsHeight - cabeceraHeight - 130 : self.alturaGrid;
                dataArea.height(self.alturaGrid);

            },
            cambioSelector: function (tipoOrden) {
                $(".tipoOrden").each(function () {
                    if ($(this).val() !== tipoOrden) {

                        $(this).removeClass("k-state").removeClass("k-state-active");
                        $(this).addClass("k-state");
                    } else {
                        $(this).removeClass("k-state").removeClass("k-state-active");
                        $(this).addClass("k-state-active");
                    }
                });
            },
            selectTabTipoOrden: function (e, self) {
                self.tipoSeleccionado = e.item.value;
                self.render();
            },
            selectTab: function (e, self) {
                if ($(e.item).index() == 0) {
                    self.cargarGrid;
                }
                $("#tabsMateriales").css("margin-top", "0.5em")
                $("#tabsMateriales").css("background-color", "#FFFFFF")
            },
            limpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            ObtenerValor: function (datos, columna) {
                if (datos.DATATYPE == "float") {
                    if (datos[columna] !== "") {
                        return "<div>" + parseFloat(datos[columna]).toFixed(2).replace(".", ",") + "</div>"
                    } else {
                        return "<div>" + datos[columna] + "</div>"
                    }
                } else {
                    return "<div>" + datos[columna] + "</div>"
                }
            },
            ValidarPermisos: function (self) {

                if (self.isOrdenActiva) {
                    self.permisoVisualizacionKOPsMultivalor = TienePermiso(247) || TienePermiso(242);
                    self.permisoGestionKOPsMultivalor = TienePermiso(242);
                } else {
                    self.permisoVisualizacionKOPsMultivalor = TienePermiso(248) || TienePermiso(243);
                    self.permisoGestionKOPsMultivalor = false;
                }

            },
            ExtraerTipoCadena: function () {
                var self = this;
                var tipo = "";
                switch (self.tipoSeleccionado) {
                    case self.tiposWO.Coccion:
                        tipo = window.app.idioma.t('COCCION');
                        break;
                    case self.tiposWO.Fermentacion:
                        tipo = window.app.idioma.t('FERMENTACION');
                        break;
                    case self.tiposWO.Trasiego:
                        tipo = window.app.idioma.t('TRASIEGO');
                        break;
                    case self.tiposWO.Guarda:
                        tipo = window.app.idioma.t('GUARDA');
                        break;
                    case self.tiposWO.Concentrado:
                        tipo = window.app.idioma.t('CONCENTRADO');
                        break;
                    default:
                        tipo = window.app.idioma.t('COCCION');
                        break;
                }
                return tipo;
            }
        });

        return vista;
    });

