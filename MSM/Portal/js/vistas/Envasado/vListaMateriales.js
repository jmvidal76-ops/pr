define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/ListaMateriales.html'],
    function (_, Backbone, $, PlantillaListaMateriales) {
        var gridListaMateriales = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaListaMateriales),
            pageSizeDefault: 50,
            initialize: function () {
                var self = this;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.render();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                var ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            async: true,
                            url: "../api/obtenerListaMateriales",
                            dataType: "json"
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "idMaterial"
                        }
                    },
                    requestStart: function () {
                        if ($("#gridListaMateriales").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridListaMateriales"), true);
                        }
                    },
                    requestEnd: function () {
                        if ($("#gridListaMateriales").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridListaMateriales"), false);
                        }
                    }
                });

                //Cargamos el grid con los datos recibidos
                this.$("#gridListaMateriales").kendoGrid({
                    dataSource: ds,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    toolbar: [
                        {
                            template: "<button id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        }
                    ],
                    detailTemplate: kendo.template(this.$("#detailTemplate").html()),
                    detailInit: function (e) {
                        self.detailInit(e, self);
                    },
                    detailExpand: function (e) {
                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                    },
                    groupable: {
                        messages: {
                            empty: window.app.idioma.t('ARRASTRAR_SOLTAR')
                        }
                    },
                    sortable: true,
                    resizable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "idMaterial", title: window.app.idioma.t("CODIGO_PRODUCTO"), width: 105
                        },
                        {
                            field: "FormatoComun", title: window.app.idioma.t("FORMATO_COMUN"), width: 160,
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
                            field: "nombre", title: window.app.idioma.t("PRODUCTO"), width: 160,
                        },
                        {
                            field: "descripcion", title: window.app.idioma.t("DESCRIPCION"), width: 190,
                        },
                        {
                            field: "udMedida", title: window.app.idioma.t("UNIDAD_MEDIDA"), width: 110,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=udMedida#' style='width: 14px;height:14px;margin-right:5px;'/>#=udMedida#</label></div>";
                                }
                            }
                        },
                        {
                            field: "gama", title: window.app.idioma.t("GAMA"), width: 70, filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=gama#' style='width: 14px;height:14px;margin-right:5px;'/>#=gama#</label></div>";
                                }
                            }
                        },
                        {
                            field: "marca", title: window.app.idioma.t("MARCA"), width: 70, filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=marca#' style='width: 14px;height:14px;margin-right:5px;'/>#=marca#</label></div>";
                                }
                            }
                        },
                        {
                            field: "tipoEnvase", title: window.app.idioma.t("TIPO_ENVASE"), width: 110,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=tipoEnvase#' style='width: 14px;height:14px;margin-right:5px;'/>#=tipoEnvase#</label></div>";
                                }
                            }
                        },
                    ],
                    dataBound: function () {
                        self.resizeGrid()
                    }
                });
            },
            detailInit: function (e, vista) {
                var self = this;
                var detailRow = e.detailRow;
                var codigoProducto = e.data.idMaterial;

                var gridDetalle = detailRow.find(".detalle");
                vista.cargarDetalle(gridDetalle, codigoProducto);
            },
            cargarDetalle: function (gridDetalle, codigoProducto) {
                var self = this;

                var dsDetalle = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/obtenerDetalleMateriales/" + codigoProducto,
                            dataType: "json"
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            fields: {
                                Cantidad: { type: "number" },
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    },
                });

                gridDetalle.kendoGrid({
                    dataSource: dsDetalle,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    detailTemplate: kendo.template(this.$("#detailEans").html()),
                    detailInit: function (e) {
                        self.detailEans(e, self);
                    },
                    detailExpand: function (e) {
                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                    },
                    sortable: true,
                    resizable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "Linea", title: window.app.idioma.t('LINEA'),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#=Linea#</label></div>";
                                }
                            }
                        },
                        {
                            field: "IdMaterial", title: window.app.idioma.t('ID_MATERIAL'), width: "150px",
                        },
                        {
                            field: "NombreMaterial", title: window.app.idioma.t('MATERIAL'),
                        },
                        {
                            field: "Cantidad", title: window.app.idioma.t('CANTIDAD'), width: "150px",
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 6
                                    });
                                }
                            }
                        },
                        {
                            field: "UnidadMedida", title: window.app.idioma.t('UNIDAD_MEDIDA'), width: "150px",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=UnidadMedida#' style='width: 14px;height:14px;margin-right:5px;'/>#=UnidadMedida#</label></div>";
                                }
                            }
                        }
                    ]
                });
            },
            detailEans: function (e, vista) {
                var self = this;
                var detailRow = e.detailRow;
                var idMaterial = e.data.IdMaterial;

                var gridEans = detailRow.find(".ean");
                vista.cargarEans(gridEans, idMaterial);
            },
            cargarEans: function (gridEans, idMaterial) {
                var self = this;

                var dsEans = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/obtenerEansMaterial/" + idMaterial,
                            dataType: "json"
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    },
                });

                gridEans.kendoGrid({
                    dataSource: dsEans,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    sortable: true,
                    resizable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "IdEan", title: window.app.idioma.t('EAN'), width: "140px",
                        },
                        {
                            field: "NombreEan", title: window.app.idioma.t('NOMBRE'), //width: "150px",
                        },
                        {
                            field: "CodProveedor", title: window.app.idioma.t('CODIGO_PROVEEDOR'), width: "170px",
                        },
                        {
                            field: "Proveedor", title: window.app.idioma.t('PROVEEDOR'), //width: "150px",
                        }
                    ]
                });
            },
            events: {
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
            },
            limpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
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
                var filtrosHeight = $("#divFiltros").innerHeight();

                var gridElement = $("#gridListaMateriales"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;

                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            }
        });

        return gridListaMateriales;
    });