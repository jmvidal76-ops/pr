define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/ListadoKOPsManuales.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm',
    'definiciones', 'vistas/Fabricacion/vImportarKOPsPorDefecto', 'vistas/Fabricacion/vImportarKOPsMostos',
    'vistas/Fabricacion/vImportarKOPsMaterial', 'vistas/Fabricacion/vCrearKOPsMaterial'],
    function (_, Backbone, $, plantilla, Notificacion, VistaDlgConfirm, definiciones, VistaImportarKOPs, VistaImportarKOPsMostos, VistaImportarKOPsMaterial, VistaCrearKOPsMaterial) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            alturaGrid: null,
            cmbZonas: null,
            gridMostos: null,
            gridKOPsDefecto: null,
            gridKOPs: null,
            tipoSeleccionado: 1,
            dataKOP: null,
            dataItemMostosSeleccionado: null,
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

                gridKOPsDefecto = $("#divMaterialesDefecto").kendoGrid({
                    dataSource: {
                        type: "json",
                        transport: {
                            read: "../api/ObtenerKOPsPorZonaTipo/" + self.idZona + "/" + tipoOrden
                        },
                        pageSize: 200,
                        schema: {
                            model: {
                                id: "IdValor",
                                fields: {
                                    'IdValor': { type: "number" },
                                    'DescKop': { type: "string" },
                                    'Uom': { type: "string" },
                                    'Minimo': { type: "string" },
                                    'Maximo': { type: "string" },
                                    'Valor': { type: "string" },
                                    'Tipo': { type: "string" },
                                    'Procedimiento': { type: "string" },
                                    'Material': { type: "string" },
                                    'Fecha': { type: "date" },
                                    'Formato': { type: "string" }
                                }
                            }
                        }
                    },
                    sortable: true,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
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
                    dataBound: function () { self.resizeGrid(self, "#divMaterialesDefecto") },
                    toolbar: [
                        {
                            template: "<button type='button' id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        },
                        {
                            template: function (e) {
                                if (TienePermiso(98) && $("#cmbZonas").data('kendoDropDownList').dataSource.data().length > 1) {
                                    return "<button type='button' id='btnImportarKops' style='float:right;background-color:green;color:white;' class='k-button k-button-icontext k-grid-add btnCopyKOPS'><span class='k-icon k-add'></span>" + window.app.idioma.t('IMPORTAR_KOPS_UBICACION') + "</button>"
                                } else {
                                    return ""
                                }
                            }
                        }
                    ],
                    columns: [
                        {
                            field: "IdValor",
                            hidden: true
                        },
                        //{
                        //    field: "IdEstado",
                        //    hidden: true
                        //},
                        {
                            template: function (e) {
                                if (TienePermiso(98)) {
                                    if (e.Editable) {
                                        return "<a id='btnEditar#=IdValor#' class='k-button k-grid-edit editarKOPDefecto' data-funcion='FAB_PROD_EXE_9_GestionDelEstadoDeLasWo' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                                    } else {
                                        return "<a id='btnEditar#=IdValor#' class='k-button k-grid-edit editarKOPDefecto' data-funcion='FAB_PROD_EXE_9_GestionDelEstadoDeLasWo' style='min-width:16px;visibility:hidden'><span class='k-icon k-edit'></span></a>"
                                    }
                                } else {
                                    return "<a id='btnEditar#=IdValor#' class='k-button k-grid-edit editarKOPDefecto' data-funcion='FAB_PROD_EXE_9_GestionDelEstadoDeLasWo' style='min-width:16px;visibility:hidden'><span class='k-icon k-edit'></span></a>"
                                }

                            },
                            width: 40,
                            attributes: { style: "text-align:center;" }

                        },
                        {
                            field: "Procedimiento",
                            title: window.app.idioma.t("PROCEDIMIENTO"),
                            width: 50,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Procedimiento#' style='width: 14px;height:14px;margin-right:5px;'/>#= Procedimiento#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescKop",
                            title: window.app.idioma.t("KOP"),
                            width: 180,
                            attributes: {
                                style: 'white-space: nowrap '
                            }
                        },
                        {
                            field: "Tipo",
                            title: window.app.idioma.t("TIPO"),
                            width: 40,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Tipo#' style='width: 14px;height:14px;margin-right:5px;'/>#= Tipo#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            field: "Minimo",
                            title: window.app.idioma.t("VALOR_MINIMO"),
                            width: 50,
                            template: function (e) {
                                return self.ObtenerValor(e, "Minimo")
                            }
                        },
                        {
                            field: "Valor",
                            title: window.app.idioma.t("VALOR"),
                            width: 50,
                            template: function (e) {
                                return self.ObtenerValor(e, "Valor")
                            }
                        },
                        {
                            field: "Maximo",
                            title: window.app.idioma.t("VALOR_MAXIMO"),
                            width: 50,
                            template: function (e) {
                                return self.ObtenerValor(e, "Maximo")
                            }
                        },
                        {
                            field: "Uom",
                            title: window.app.idioma.t("UNIDAD_MEDIDA"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Uom#' style='width: 14px;height:14px;margin-right:5px;'/>#= Uom#</label></div>";
                                    }
                                }
                            },
                            width: 50,
                        },
                        {
                            field: "Formato",
                            title: window.app.idioma.t("FORMATO"),
                            width: 40,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Formato#' style='width: 14px;height:14px;margin-right:5px;'/>#= Formato#</label></div>";
                                    }
                                }
                            },

                        },
                        {
                            field: "Fecha",
                            title: window.app.idioma.t("FECHA"),
                            width: 50,
                            template: '#= Fecha != null ? kendo.toString(Fecha,kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora
                                    });
                                }
                            }
                        }


                    ]
                }).data("kendoGrid");

                if (tipoOrden == self.tiposWO.Filtracion) {
                    $("#liMostos").hide();
                } else {
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

                        groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                        selectable: "multiple,row",
                        sortable: true,
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            buttonCount: 5,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        detailTemplate: kendo.template(this.$("#templateDetalleKop").html()),
                        detailInit: function (e) {
                            $("#divMosto").data("kendoGrid").clearSelection();
                            self.masterRow = e;
                            $("#divMosto").data("kendoGrid").select(e.masterRow);
                            dataItemMostosSeleccionado = e.sender.dataItem(e.masterRow);
                            self.detailInitConsumo(e);


                        },
                        detailExpand: function (e) {
                            this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                        },
                        dataBound: function () { self.resizeGrid(self, "#divMosto") },
                        toolbar: [
                            {
                                template: "<button type='button' id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                            },
                            {
                                template: function (e) {
                                    if (TienePermiso(98)) {
                                        return "<button type='button' id='btnImportarKopsMostos' style='float:right;background-color:green;color:white;' class='k-button k-button-icontext k-grid-add btnCopyKOPS'><span class='k-icon k-add'></span>" + window.app.idioma.t('IMPORTAR_KOPS_POR') + "</button>"
                                    } else {
                                        return ""
                                    }
                                }
                            },
                            {
                                template: function (e) {
                                    if (TienePermiso(98)) {
                                        return "<button type='button' id='btnImportarKopsMaterial' style='float:right;background-color:#f35800;color:white;' class='k-button k-button-icontext k-grid-add btnCopyKOPS'><span class='k-icon k-i-search'></span>" + window.app.idioma.t('IMPORTAR_KOPS_POR_MATERIAL') + "</button>"
                                    } else {
                                        return ""
                                    }
                                }
                            },
                            {
                                template: function (e) {
                                    if (TienePermiso(98)) {
                                        return "<button type='button' id='btnCrearKopsMaterial' style='float:right;background-color:#26a6f5;color:white;' class='k-button k-button-icontext k-grid-add btnCopyKOPS'><span class='k-icon k-add'></span>" + window.app.idioma.t('CREAR_KOPS_PARA_MATERIAL') + "</button>"
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
                }
                

            },
            detailInitConsumo: function (e) {
                var self = this;
                var detailRow = e.detailRow;

                self.idZona = $("#cmbZonas").data("kendoDropDownList").value();

                var dataSourceKOPsCoccion = new kendo.data.DataSource({
                    transport: {
                        read: "../api/ObtenerKOPSMostosPorZonaMostoTipoOrden/" + self.idZona + "/" + dataItemMostosSeleccionado.NombreMosto + "/" + self.tipoSeleccionado
                    },
                    pageSize: 200,
                    async: true,
                    schema: {
                        model: {
                            id: "IdValor",
                            fields: {
                                'IdValor': { type: "number" },
                                'DescKop': { type: "string" },
                                'Uom': { type: "string" },
                                'Minimo': { type: "string" },
                                'Maximo': { type: "string" },
                                'Valor': { type: "string" },
                                'Tipo': { type: "string" },
                                'Procedimiento': { type: "string" },
                                'Material': { type: "string" },
                                'Fecha': { type: "date" },
                                'Formato': { type: "string" },
                                'Activo': { type: "bool" },
                                'Requerido': { type: "bool" }
                            }
                        }
                    }
                });

                self.gridKOPs = detailRow.find(".divDetalleKop").kendoGrid({
                    dataSource: dataSourceKOPsCoccion,
                    sortable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    dataBound: function () { self.resizeGrid(self, ".divDetalleKop") },
                    pageable: {
                        refresh: true,
                        pageSizes: [200, 400, 600],
                        buttonCount: 200,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    toolbar: [
                        {
                            template: "<button type='button' id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        }
                    ],
                    columns: [
                        {
                            field: "IdValor",
                            hidden: true
                        },
                        //{
                        //    field: "IdEstado",
                        //    hidden: true
                        //},
                        {
                            title: window.app.idioma.t("REQUERIDO"),
                            template: '# if(Requerido) { #' +
                                ' <input class="checkbox" type="checkbox" style="width: 14px;height: 14px; left: 23px;" checked disabled/>' +
                                ' # } else { #' +
                                '<input class="checkbox" type="checkbox" style="width: 14px;height: 14px; left: 23px;" disabled/>' +
                                '# } #',
                            width: 30
                        },
                        {
                            template: function (e) {
                                if (TienePermiso(98)) {
                                    if (e.Editable) {
                                        return "<a id='btnEditar#=IdValor#' class='k-button k-grid-edit editarKOPCoccion' data-funcion='FAB_PROD_EXE_9_GestionDelEstadoDeLasWo' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                                    } else {
                                        return "<a id='btnEditar#=IdValor#' class='k-button k-grid-edit editarKOPCoccion' data-funcion='FAB_PROD_EXE_9_GestionDelEstadoDeLasWo' style='min-width:16px; visibility:hidden'><span class='k-icon k-edit'></span></a>"
                                    }
                                } else {
                                    return "<a id='btnEditar#=IdValor#' class='k-button k-grid-edit editarKOPCoccion' data-funcion='FAB_PROD_EXE_9_GestionDelEstadoDeLasWo' style='min-width:16px; visibility:hidden'><span class='k-icon k-edit'></span></a>"
                                }


                            },
                            width: 40,
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            field: "Procedimiento",
                            title: window.app.idioma.t("PROCEDIMIENTO"),
                            width: 60,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Procedimiento#' style='width: 14px;height:14px;margin-right:5px;'/>#= Procedimiento#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescKop",
                            title: window.app.idioma.t("KOP"),
                            width: 180,
                            attributes: {
                                style: 'white-space: nowrap '
                            }
                        },
                        {
                            field: "Tipo",
                            title: window.app.idioma.t("TIPO"),
                            width: 40,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Tipo#' style='width: 14px;height:14px;margin-right:5px;'/>#= Tipo#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            field: "Minimo",
                            title: window.app.idioma.t("VALOR_MINIMO"),
                            width: 50,
                            template: function (e) {
                                return self.ObtenerValor(e, "Minimo")
                            }
                        },
                        {
                            field: "Valor",
                            title: window.app.idioma.t("VALOR"),
                            width: 50,
                            template: function (e) {
                                return self.ObtenerValor(e, "Valor")
                            }
                        },
                        {
                            field: "Maximo",
                            title: window.app.idioma.t("VALOR_MAXIMO"),
                            width: 50,
                            template: function (e) {
                                return self.ObtenerValor(e, "Maximo")
                            }
                        },
                        {
                            field: "Uom",
                            title: window.app.idioma.t("UNIDAD_MEDIDA"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Uom#' style='width: 14px;height:14px;margin-right:5px;'/>#= Uom#</label></div>";
                                    }
                                }
                            },
                            width: 50,
                        },
                        {
                            field: "Formato",
                            title: window.app.idioma.t("FORMATO"),
                            width: 40,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Formato#' style='width: 14px;height:14px;margin-right:5px;'/>#= Formato#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            field: "Fecha",
                            title: window.app.idioma.t("FECHA"),
                            width: 50,
                            template: '#= Fecha != null ? kendo.toString(Fecha,kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora
                                    });
                                }
                            }
                        }
                    ]
                }).data("kendoGrid");

            },
            //#region EVENTOS
            events: {
                'click .editarKOPDefecto': 'editarKOPsDefecto',
                'click .editarKOPCoccion': 'editarKOPsCoccion',
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
                'click #btnImportarKops': 'abrirDialogoImportarKOPs',
                'click #btnImportarKopsMaterial': 'abrirDialogoImportarKOPsMaterial',
                'click #btnCrearKopsMaterial': 'abrirDialogoCrearKOPsMaterial',
                'click #btnImportarKopsMostos': 'abrirDialogoImportarKOPsMostos'
            },
            //#endregion EVENTOS
            editarKOPsDefecto: function (e) {
                var self = this;
                var grid = gridKOPsDefecto;
                self.ifMaterialDefecto = 0;
                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var data = grid.dataItem(tr);
                self.editarKOPS(e, data);
            },
            editarKOPsCoccion: function (e) {
                var self = this;
                self.ifMaterialDefecto = 1;

                var tr = $(e.target.parentNode.parentNode).closest("tr");
                var grid = self.gridKOPs;
                var data = grid.dataItem(tr);

                // get the data bound to the current table row
                data.NombreMosto = dataItemMostosSeleccionado.NombreMosto;
                data.DescripcionMosto = dataItemMostosSeleccionado.DescripcionMosto;
                self.editarKOPS(e, data);
            },
            editarKOPS: function (e, data) {
                var self = this;
                self.dataKOP = data;
                var anchura = 970;

                //Hacemos responsive la ventana si el tipo uom es hhmmss
                switch (data.Uom.toLowerCase()) {
                    case "hh:mm:ss":
                        anchura = 1130;
                        break;
                }
                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='window'></div>"));



                $("#window").kendoWindow(
                    {
                        title: window.app.idioma.t('EDITAR_KOPs'),
                        width: anchura,
                        top: "339",
                        left: "410",
                        height: "210",
                        content: "Fabricacion/html/EditarKOPSProceso.html",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        close: function () {
                            self.ventanaEditarCrear.destroy();
                            self.ventanaEditarCrear = null;
                        },
                        refresh: function () {
                            self.cargaContenido(e, data);
                        }
                    });

                self.ventanaEditarCrear = $('#window').data("kendoWindow");
                self.ventanaEditarCrear.center();
                self.ventanaEditarCrear.open();
            },
            cargaContenido: function (e, data) {
                var self = this;

                $("#lblNombre").text(window.app.idioma.t('NOMBRE') + ": ");
                $("#lblMinimo").text(window.app.idioma.t('VALOR_MINIMO') + ": ");
                $("#lblValor").text(window.app.idioma.t("VALOR") + ": ");
                $("#lblMaximo").text(window.app.idioma.t('VALOR_MAXIMO') + ": ");
                $("#lblUom").text(window.app.idioma.t('UNIDAD_MEDIDA') + ": ");
                $("#lblTipo").text(window.app.idioma.t("TIPO") + ": ");
                $("#lblFecha").text(window.app.idioma.t('FECHA') + ": ");
                $("#btnAceptarKOP").text(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarKOP").text(window.app.idioma.t('CANCELAR'));
                $("#lblMaterial").text(window.app.idioma.t('MATERIAL') + ": ");
                $("#lblZona").text(window.app.idioma.t('ZONA'));
                $("#txtZona").text($('#cmbZonas').data('kendoDropDownList').dataItem($('#cmbZonas').data('kendoDropDownList').select()).DescripcionZona);

                $("#btnAceptarKOP").kendoButton({
                    click: function (e) { self.confirmarEdicion(e); }
                });
                $("#btnCancelarKOP").kendoButton({
                    click: function (e) { self.cancelarFormulario(e); }
                });

                //e.target.parentNode.parentNode.parentNode.cells[3].innerHTML

                var maximo = 90;

                if (data.Formato === 'Calculado') {
                    $("#txtValor").prop('disabled', true);
                    if (data.Uom === 'hh:mm:ss') {
                        $("#txtDiaValor, #txtHoraValor, #txtMinutosValor, #txtSegundosValor").prop('disabled', true);
                    }
                }
                else {
                    $("#txtValor").prop('disabled', false);
                    if (data.Uom === 'hh:mm:ss') {
                        $("#txtDiaValor, #txtHoraValor, #txtMinutosValor, #txtSegundosValor").prop('disabled', false);
                    }
                }

                $("#txtIdValor").text(data.IdValor);
                $("#txtNombre").text(data.DescKop);

                if (data.Requerido !== null) {
                    $("#lblRequerido").text(window.app.idioma.t('REQUERIDO') + ": ");
                    $("#chxRequerido").prop('checked', data.Requerido);
                } else {
                    $("#chxRequerido").hide();
                }

                if (data.DescKop.length > maximo) {
                    $("#txtNombre").addClass("lblOverflow");
                    $("#txtNombre").kendoTooltip({
                        filter: $("#txtNombre"),
                        content: function (e) {
                            var content = data.DescKop;
                            return content;
                        }
                    }).data("kendoTooltip");
                }

                $("#txtUom").text(data.Uom);

                if (self.ifMaterialDefecto == "0") {
                    $("#txtMaterial").text(window.app.idioma.t('MATERIA_DEFECTO'));
                } else {
                    $("#txtMaterial").text(data.NombreMosto + " - " + data.DescripcionMosto);
                }
                $('#txtTipo').text(data.Tipo)
                switch (data.Tipo.toLowerCase()) {
                    case "numeric":
                    case "int":
                        $("#txtValor").kendoNumericTextBox({
                            placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                            decimals: 0,
                            culture: kendo.culture().name,
                            format: 'n0',
                            value: data.Valor
                        });
                        $("#txtMinimo").kendoNumericTextBox({
                            placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                            decimals: 0,
                            culture: kendo.culture().name,
                            format: 'n0',
                            value: data.Minimo
                        });

                        $("#txtMaximo").kendoNumericTextBox({
                            placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                            decimals: 0,
                            culture: kendo.culture().name,
                            format: 'n0',
                            value: data.Maximo
                        });
                        self.isText = false;
                        $("#txtValor").prop('disabled', false);
                        break;
                    case "float":
                        switch (data.Uom.toLowerCase()) {
                            case "hh:mm:ss":
                                $(".UOMOtros").hide();
                                $(".UOMhms").show();

                                var arrHorario = [];

                                if (data.Minimo != "") {
                                    arrHorario = ConversorHorasMinutosSegundos(data.Minimo * 3600).split(":");
                                }
                                var dias = "";
                                var horas = "";
                                var minutos = "";
                                var segundos = "";
                                if (arrHorario.length != 0) {
                                    dias = parseInt(parseInt(arrHorario[0]) / 24);
                                    horas = parseInt(arrHorario[0]) % 24;
                                    minutos = parseInt(arrHorario[1]);
                                    segundos = parseInt(arrHorario[2]);
                                }


                                $("#txtDiaMinimo").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: dias,
                                    width: 12,
                                    min: 0,
                                    max: 50
                                });

                                $("#txtHoraMinimo").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: horas,
                                    min: 0,
                                    max: 23
                                });

                                $("#txtMinutosMinimo").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: minutos,
                                    min: 0,
                                    max: 59
                                });

                                $("#txtSegundosMinimo").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: segundos,
                                    min: 0,
                                    max: 59
                                });

                                arrHorario = [];
                                if (data.Valor != "") {
                                    arrHorario = ConversorHorasMinutosSegundos(data.Valor * 3600).split(":");
                                }
                                dias = "";
                                horas = "";
                                minutos = "";
                                segundos = "";

                                if (arrHorario.length != 0) {
                                    dias = parseInt(parseInt(arrHorario[0]) / 24);
                                    horas = parseInt(arrHorario[0]) % 24;
                                    minutos = parseInt(arrHorario[1]);
                                    segundos = parseInt(arrHorario[2]);
                                }


                                $("#txtDiaValor").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: dias,
                                    min: 0,
                                    max: 50
                                });

                                $("#txtHoraValor").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: horas,
                                    min: 0,
                                    max: 23
                                });

                                $("#txtMinutosValor").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: minutos,
                                    min: 0,
                                    max: 59
                                });

                                $("#txtSegundosValor").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: segundos,
                                    min: 0,
                                    max: 59
                                });

                                arrHorario = [];
                                if (data.Maximo != "") {
                                    arrHorario = ConversorHorasMinutosSegundos(data.Maximo * 3600).split(":");
                                }
                                dias = "";
                                horas = "";
                                minutos = "";
                                segundos = "";

                                if (arrHorario.length != 0) {
                                    dias = parseInt(parseInt(arrHorario[0]) / 24);
                                    horas = parseInt(arrHorario[0]) % 24;
                                    minutos = parseInt(arrHorario[1]);
                                    segundos = parseInt(arrHorario[2]);
                                }

                                $("#txtDiaMaximo").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: dias,
                                    min: 0,
                                    max: 50
                                });

                                $("#txtHoraMaximo").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: horas,
                                    min: 0,
                                    max: 23
                                });

                                $("#txtMinutosMaximo").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: minutos,
                                    min: 0,
                                    max: 59
                                });

                                $("#txtSegundosMaximo").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: segundos,
                                    min: 0,
                                    max: 59
                                });
                                $(".Inputhms").css('width', '4em')
                                break;
                            default:
                                $("#txtValor").kendoNumericTextBox({
                                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                                    decimals: 5,
                                    culture: localStorage.getItem("idiomaSeleccionado"),
                                    format: 'n5',
                                    value: parseFloat(FormatearNumericosPorRegion(data.Valor), localStorage.getItem("idiomaSeleccionado"))
                                });
                                $("#txtMinimo").kendoNumericTextBox({
                                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                                    decimals: 5,
                                    culture: localStorage.getItem("idiomaSeleccionado"),
                                    format: 'n5',
                                    value: parseFloat(FormatearNumericosPorRegion(data.Minimo), localStorage.getItem("idiomaSeleccionado"))
                                });
                                $("#txtMaximo").kendoNumericTextBox({
                                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                                    decimals: 5,
                                    culture: localStorage.getItem("idiomaSeleccionado"),
                                    format: 'n5',
                                    value: parseFloat(FormatearNumericosPorRegion(data.Maximo), localStorage.getItem("idiomaSeleccionado"))
                                });
                                self.isText = false;
                                $("#txtValor").prop('disabled', false);
                                break;
                        }
                        break;
                    case "string":
                        $("#txtMinimo").prop('disabled', true);
                        $("#txtMinimo").val(data.Minimo)
                        $("#txtMaximo").prop('disabled', true);
                        $("#txtMaximo").val(data.Maximo)
                        $("#txtValor").attr('maxlength', '100');
                        $("#txtValor").val(data.Valor);
                        $("#txtValor").addClass("k-textbox");
                        $("#txtValor").prop('placeholder', window.app.idioma.t('INTRODUZCA_UN_VALOR'))
                        self.isText = true;
                        $("#txtValor").prop('disabled', false);
                        break;
                }//fin switch
                $("#txtValor").prop('disabled', false);
                if (data.Tipo.toLowerCase() !== "string") {
                    var valMin = $("#txtMinimo").data("kendoNumericTextBox") ? $("#txtMinimo").data("kendoNumericTextBox") : $("#txtMinimo").data("kendoDateTimePicker");
                    var valMax = $("#txtMaximo").data("kendoNumericTextBox") ? $("#txtMaximo").data("kendoNumericTextBox") : $("#txtMaximo").data("kendoDateTimePicker");

                    if (data.Formato.indexOf("CONSTANTE") != -1) {
                        if (valMin && valMax) {
                            valMin.enable(false);
                            valMax.enable(false);
                        } else {
                            $("#txtMinimo").prop('disabled', true);
                            $("#txtMaximo").prop('disabled', true);
                        }

                    } else {
                        if (valMin && valMax) {
                            valMin.enable(true);
                            valMax.enable(true);
                        } else {
                            $("#txtMinimo").prop('disabled', false);
                            $("#txtMaximo").prop('disabled', false);
                        }
                    }
                }
            },
            confirmarEdicion: function (e) {
                e.preventDefault();
                var self = this;

                Backbone.trigger('eventCierraDialogo');

                var min = ConversorDiasHorasMinutosSegundosAHoras("Minimo");
                var max = ConversorDiasHorasMinutosSegundosAHoras("Maximo");
                var val = ConversorDiasHorasMinutosSegundosAHoras("Valor");

                //si es un fecha o un string no hay que comprobar los valores de máximo y mínimo
                if (!isNaN($("#txtValor").val())) {
                    if (min != "" && max != "") {
                        if (parseFloat(min) >= parseFloat(max)) {
                            $("#message").text(window.app.idioma.t('VALOR_MINIMO_MAYOR'));
                            $("#errorMsg").show();
                        }
                        else {
                            $("#errorMsg").hide();

                            this.confirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('EDITARKOP')
                                , msg: window.app.idioma.t('DESEA_GUARDAR_LOS'), funcion: function () { self.editarKOPConfirma(); }, contexto: this
                            });

                        }
                    } else if (min !== "" && max === "" || max !== "" && min === "") {
                        $("#message").text(window.app.idioma.t('VALOR_NO_DEFINIDO'));
                        $("#errorMsg").show();
                    } else {
                        $("#errorMsg").hide();
                        this.confirmacion = new VistaDlgConfirm({
                            titulo: window.app.idioma.t('EDITARKOP')
                            , msg: window.app.idioma.t('DESEA_GUARDAR_LOS'), funcion: function () { self.editarKOPConfirma(); }, contexto: this
                        });
                    }
                } else {
                    if (min != "" && max != "") {
                        if (parseFloat(min) >= parseFloat(max)) {
                            $("#message").text(window.app.idioma.t('VALOR_MINIMO_MAYOR'));
                            $("#errorMsg").show();
                            return false;
                        }
                    } else if (min !== "" && max === "" || max !== "" && min === "") {
                        $("#message").text(window.app.idioma.t('VALOR_NO_DEFINIDO'));
                        $("#errorMsg").show();
                    }
                    else {
                        $("#errorMsg").hide();
                        this.confirmacion = new VistaDlgConfirm({
                            titulo: window.app.idioma.t('EDITARKOP')
                            , msg: window.app.idioma.t('DESEA_REALMENTE_CAMBIAR'), funcion: function () { self.editarKOPConfirma(); }, contexto: this
                        });
                    }
                }
            },
            editarKOPConfirma: function () {
                var self = this;
                var pl = {};

                /***/                
                var max, min, val;
                var tipoKOP = self.dataKOP.Tipo;
                var uomKOP = self.dataKOP.Uom;
                if (tipoKOP == "float" && uomKOP == "hh:mm:ss") {
                    //Ahora convertimos todos los datos a horas con decimales
                    min = ConversorDiasHorasMinutosSegundosAHoras("Minimo");
                    max = ConversorDiasHorasMinutosSegundosAHoras("Maximo");
                    val = ConversorDiasHorasMinutosSegundosAHoras("Valor");
                    if (min !== "") {
                        $("#txtMinimo").val(parseFloat(min).toFixed(5).replace(",", "."));
                    } else {
                        $("#txtMinimo").val("");
                    }
                    if (max !== "") {
                        $("#txtMaximo").val(parseFloat(max).toFixed(5).replace(",", "."));
                    } else {
                        $("#txtMaximo").val("");
                    }
                    if (val !== "") {
                        $("#txtValor").val(parseFloat(val).toFixed(5).replace(",", "."));
                    } else {
                        $("#txtValor").val("");
                    }


                } else {
                    if ($("#txtMaximo").val() == "") {
                        max = $("#txtMaximo").text();
                    }
                    else {
                        max = $("#txtMaximo").val();
                    }


                    if ($("#txtMinimo").val() == "") {
                        min = $("#txtMinimo").text();
                    } else {
                        min = $("#txtMinimo").val();
                    }

                    if ($("#txtValor").val() == "") {
                        val = $("#txtValor").text();
                    } else {
                        val = $("#txtValor").val();
                    }

                    min = min.replace(",", ".");
                    max = max.replace(",", ".");
                    val = val.replace(",", ".");

                    if (tipoKOP == "float") {
                        if (min !== "") {
                            min = parseFloat(min).toFixed(5);
                            $("#txtMinimo").val(min);
                        }
                        if (max !== "") {
                            max = parseFloat(max).toFixed(5);
                            $("#txtMaximo").val(max);
                        }
                        if (val !== "") {
                            val = parseFloat(val).toFixed(5);
                            $("#txtValor").val(val);
                        }
                    } else if (tipoKOP == "int") {
                        if (min !== "") {
                            min = parseFloat(min);
                        }
                        if (max !== "") {
                            max = parseFloat(max);
                        }
                        if (val !== "") {
                            val = parseFloat(val);
                        }
                    }

                }
                /***/

                var _max = $("#txtMaximo").val();
                var _min = $("#txtMinimo").val();
                var _valor = $("#txtValor").val();

                pl.Valor = _valor;
                pl.IdValor = $("#txtIdValor").text();
                pl.Tipo = $("#txtTipo").text();
                pl.Minimo = _min;
                pl.Maximo = _max;
                pl.Requerido = $("#chxRequerido").prop('checked');
                var uri = "";
                var grid = "";
                if (self.ifMaterialDefecto == 0) {
                    uri = "ActualizarKopsPorDefecto";
                    grid = "#divMaterialesDefecto";
                } else {
                    uri = "ActualizarKopsPorMostos";
                    grid = ".divDetalleKop";
                }

                $.ajax({
                    data: JSON.stringify(pl),
                    type: "PUT",
                    async: true,
                    url: "../api/" + uri,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        $(grid).data("kendoGrid").dataSource.read();
                        Backbone.trigger('eventCierraDialogo');
                        Notificacion.crearNotificacion(res[0] ? 'success' : 'error', window.app.idioma.t('AVISO'), res[1], 2000);
                        self.ventanaEditarCrear.close();

                    },
                    error: function (response) {
                        Notificacion.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS_VALORES'), 2000);
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
                self.confirmacion.finProceso();
            },
            cancelarFormulario: function (e) {
                e.preventDefault();
                this.ventanaEditarCrear.close();
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
            abrirDialogoImportarKOPs: function (e) {
                var self = this;
                this.VistaImportarKOPs = new VistaImportarKOPs(self.idZona, self.tipoSeleccionado);
            },
            abrirDialogoImportarKOPsMaterial: function (e) {
                var self = this;
                this.VistaImportarKOPsMaterial = new VistaImportarKOPsMaterial(self.idZona, self.tipoSeleccionado);
            },
            abrirDialogoImportarKOPsMostos: function (e) {
                var self = this;
                this.VistaImportarKOPsMostos = new VistaImportarKOPsMostos(self.idZona, self.tipoSeleccionado);
            },
            abrirDialogoCrearKOPsMaterial: function (e) {
                var self = this;
                var gridMostos = $("#divMosto").data("kendoGrid");
                this.VistaCrearKOPsMaterial = new VistaCrearKOPsMaterial(self.idZona, self.tipoSeleccionado, "Normal", gridMostos.dataSource.data());
            },
            importarKops: function (dataItemMostosSeleccionado) {
                var self = this;

                $.ajax({
                    data: JSON.stringify(dataItemMostosSeleccionado),
                    type: "POST",
                    async: true,
                    url: "../api/ImportarKOPSMostosPorZonaListaMostos/",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (resultado) {
                        if (resultado) {
                            Notificacion.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HAN_MODIFICADO_CORRECTAMENTE') + dataItemMostosSeleccionado, 2000);
                        } else {
                            Notificacion.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS_VALORES') + dataItemMostosSeleccionado, 2000);
                        }
                        gridMostos.clearSelection();
                        gridMostos.dataSource.read();
                        kendo.ui.progress($("#divMosto"), false);
                    },
                    error: function () {
                        Notificacion.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS_VALORES') + dataItemMostosSeleccionado, 2000);
                        gridMostos.clearSelection();
                        gridMostos.dataSource.read();
                        kendo.ui.progress($("#divMosto"), false);
                    }
                });
                self.confirmacion.finProceso();
            },
            ObtenerValor: function (datos, columna) {
                if (datos.Uom.toUpperCase() == "TS") {
                    if (datos[columna] || datos[columna].toString() !== "") {
                        return "<div>" + kendo.toString(kendo.parseDate(kendo.toString(kendo.parseDate(datos[columna]), kendo.culture().calendars.standard.patterns.s) + "Z"), kendo.culture().calendars.standard.patterns.MES_FechaHora) + "</div>"
                    } else {
                        return "<div></div>"
                    }
                } else if (datos.Tipo == "float") {
                    if (datos[columna] || datos[columna].toString() !== "") {
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
            }

        });

        return vista;
    });