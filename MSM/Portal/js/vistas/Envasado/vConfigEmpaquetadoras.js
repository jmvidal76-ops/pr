define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/ConfigEmpaquetadoras.html', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaConfigEmpaquetadoras, Not) {
        var gridConfigEmpaquetadoras = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaConfigEmpaquetadoras),
            dsProductos: null,
            listadoConfig: null,
            listaEmpaquetadoras: null,
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

                self.ObtenerConfiguracion()

                self.dsProductos = new kendo.data.DataSource({
                    data: self.listadoConfig,
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "ConfiguracionEmpaquetadoras.Id",
                            fields: {
                                'ConfiguracionEmpaquetadoras.Id': { type: "number" },
                                'DescripcionLinea': { type: "string" },
                                'FormatoComun': { type: "string" },
                                'ConfiguracionEmpaquetadoras.Producto': { type: "string" },
                                'DescripcionProducto': { type: "string" }
                            }
                        }
                    },
                    requestStart: function () {
                        if ($("#gridConfigEmpaquetadoras").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridConfigEmpaquetadoras"), true);
                        }
                    },
                    requestEnd: function () {
                        if ($("#gridConfigEmpaquetadoras").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridConfigEmpaquetadoras"), false);
                        }
                    }
                });

                //Cargamos el grid con los datos recibidos
                this.$("#gridConfigEmpaquetadoras").kendoGrid({
                    dataSource: self.dsProductos,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    toolbar: [
                        {
                            template: "<button id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
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
                            field: "DescripcionLinea", title: window.app.idioma.t("LINEA"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=DescripcionLinea#' style='width: 14px;height:14px;margin-right:5px;'/>#=DescripcionLinea#</label></div>";
                                }
                            }
                        },
                        {
                            field: "FormatoComun", title: window.app.idioma.t("FORMATO_COMUN"),
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
                            field: "ConfiguracionEmpaquetadoras.Producto", title: window.app.idioma.t("CODIGO_PRODUCTO"),
                        },
                        {
                            field: "DescripcionProducto", title: window.app.idioma.t("PRODUCTO"),
                        },
                    ],
                    dataBound: function () {
                        self.resizeGrid()
                    }
                });
            },
            ObtenerConfiguracion: function () {
                var self = this;

                $.ajax({
                    url: "../api/obtenerConfiguracionEmpaquetadoras",
                    dataType: 'json',
                    async: false
                }).done(function (listaConfiguracion) {
                    self.listadoConfig = listaConfiguracion;
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CONFIG_EMPAQ'), 4000);
                    }
                });
            },
            detailInit: function (e, vista) {
                var linea = e.data.ConfiguracionEmpaquetadoras.Linea;
                var producto = e.data.ConfiguracionEmpaquetadoras.Producto;
                vista.cargarDetalle(e.detailRow.find(".detalle"), linea, producto);
            },
            cargarDetalle: function (gridDetalle, linea, producto) {
                var self = this;
                self.ObtenerEmpaquetadoras(linea, producto);

                var dsDetalle = new kendo.data.DataSource({
                    data: self.listaEmpaquetadoras,
                    pageSize: 50,
                    schema: {
                        model: {
                            fields: {
                                "Empaquetadora": { type: "string" },
                                "Suma": { type: "boolean" },
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    },
                    sort: { field: "Empaquetadora", dir: "asc" }
                });

                gridDetalle.kendoGrid({
                    dataSource: dsDetalle,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    sortable: true,
                    resizable: true,
                    columns: [
                        {
                            field: "DescripcionEmpaquetadora", title: window.app.idioma.t('EMPAQUETADORA'),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=DescripcionEmpaquetadora#' style='width: 14px;height:14px;margin-right:5px;'/>#=DescripcionEmpaquetadora#</label></div>";
                                }
                            }
                        },
                        {
                            field: "Suma", title: window.app.idioma.t('SUMA'),
                            template: '<input type="checkbox" id="#=NumeroLinea##=Producto##=Empaquetadora#" #= Suma ? \'checked="checked"\' : "" # />'
                        },
                    ],
                    dataBound: function () {
                        var data = this.dataSource.view();

                        for (var i = 0; i < data.length; i++) {
                            var id = data[i].NumeroLinea + data[i].Producto + data[i].Empaquetadora;

                            $("#" + id).bind("change", function (e) {
                                var permiso = TienePermiso(213);

                                if (!permiso) {
                                    gridDetalle.data("kendoGrid").cancelChanges();
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                    return;
                                }

                                var checked = this.checked;
                                var row = $(e.target).closest("tr");
                                var dataItem = gridDetalle.data("kendoGrid").dataItem(row);

                                var configuracion = {
                                    Linea: dataItem.Linea,
                                    Producto: dataItem.Producto,
                                    Empaquetadora: dataItem.Empaquetadora,
                                    Suma: checked,
                                }

                                $.ajax({
                                    type: "POST",
                                    url: "../api/guardarSumaEmpaquetadora/",
                                    contentType: "application/json; charset=utf-8",
                                    dataType: 'json',
                                    data: JSON.stringify(configuracion),
                                    async: false,
                                }).success(function (res) {
                                    if (!res) {
                                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_SUMA_EMPAQUETADORA') + ': ' + e.Message, 4000);
                                    }
                                }).error(function (e) {
                                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                    } else {
                                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_SUMA_EMPAQUETADORA') + ': ' + e.Message, 4000);
                                    }
                                });
                            });
                        }
                    }
                });
            },
            ObtenerEmpaquetadoras: function (linea, producto) {
                var self = this;

                $.ajax({
                    url: "../api/obtenerEmpaquetadorasLinea/" + linea + "/" + producto + "/",
                    dataType: 'json',
                    async: false
                }).done(function (listado) {
                    self.listaEmpaquetadoras = listado;
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CONFIG_EMPAQ'), 4000);
                    }
                });
            },
            events: {
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
            },
            limpiarFiltroGrid: function () {
                const self = this;

                self.dsProductos.query({
                    group: [],
                    filter: [],
                    page: 1
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
                var filtrosHeight = $("#divFiltros").innerHeight();

                var gridElement = $("#gridConfigEmpaquetadoras"),
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

        return gridConfigEmpaquetadoras;
    });