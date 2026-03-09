define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/AvisosStockMMPPFabricacion.html', 'compartido/notificaciones',
    'vistas/vDialogoConfirm', 'vistas/Almacen/vCrearEditarAvisoStockMMPP', 'definiciones'],
    function (_, Backbone, $, PlantillaAvisos, Not, VistaDlgConfirm, VistaCrearEditarAviso, definiciones) {
        var vistaPropMMPPEnvasado = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaAvisos),
            dsAvisos: null,
            dsMateriales: null,
            dsUbicaciones: null,
            constOperaciones: definiciones.OperacionesCRUD(),
            initialize: function () {
                var self = this;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.getDataSource();
                self.obtenerMateriales();
                self.obtenerUbicaciones();
                self.render();
            },
            getDataSource: function () {
                var self = this;

                const colorMap = {
                    "#DC3F3F": "Rojo",
                    "#4CDA43": "Verde",
                    "#FCD067": "Amarillo"
                };

                self.dsAvisos = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ObtenerAvisosStockMMPPFabricacion",
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            id: "IdAviso",
                            fields: {
                                IdAviso: { type: "number" },
                                Semaforo: { type: "string" },
                                IdMaterial: { type: "string" },
                                DescripcionMaterial: { type: "string" },
                                IdUbicacion: { type: "number" },
                                Ubicacion: { type: "string" },
                                DescripcionUbicacion: { type: "string" },
                                DestinatariosMailNivelCritico: { type: "string" },
                                CantidadNivelCritico: { type: "number" },
                                DestinatariosMailNivelAviso: { type: "string" },
                                CantidadNivelAviso: { type: "number" },
                                CantidadActual: { type: "number" },
                                Unidad: { type: "string" },
                                TextoCuerpoCorreo: { type: "string" }
                            }
                        },
                        parse: function (response) {
                            for (const r of response) {
                                r.ColorSemaforo = colorMap[r.Semaforo];
                            }

                            return response;
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            obtenerMateriales: function () {
                var self = this;

                self.dsMateriales = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetMaterial",
                            dataType: "json"
                        }
                    },
                    sort: { field: "DescripcionCompleta", dir: "asc" },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            obtenerUbicaciones: function () {
                var self = this;

                self.dsUbicaciones = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerUbicaciones/0/0",
                            dataType: "json"
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                self.grid = this.$("#gridAvisosStockMMPP").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t("AVISOS_STOCK_MMPP_FABRICACION") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    dataSource: self.dsAvisos,
                    sortable: true,
                    resizable: true,
                    selectable: true,
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
                            field: "ColorSemaforo",
                            title: window.app.idioma.t('ESTADO'),
                            template: function (e) {
                                return "<div class='circle_cells' style='background-color:" + e.Semaforo + ";'/>";
                            },
                            width: 90,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=ColorSemaforo#' style='//width: 14px;height:14px;margin-right:5px;'/>#= ColorSemaforo #</label></div>";
                                    }
                                }
                            },
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            field: "IdMaterial",
                            title: window.app.idioma.t("COD_MATERIAL"),
                            width: 125,
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
                            field: "Ubicacion",
                            title: window.app.idioma.t("UBICACION"),
                            //width: 170,
                            filterable: true,
                        },
                        {
                            field: "DescripcionUbicacion",
                            title: window.app.idioma.t("DESCRIPCION_UBICACION"),
                            //width: 180,
                            filterable: true,
                        },
                        {
                            field: "DestinatariosMailNivelCritico",
                            title: window.app.idioma.t("DESTINATARIOS_NIVEL_CRITICO"),
                        },
                        {
                            field: "CantidadNivelCritico",
                            title: window.app.idioma.t("CANTIDAD_NIVEL_CRITICO"),
                            template: "#=kendo.format('{0:n2}',parseFloat(CantidadNivelCritico.toString()))#",
                            //width: 175,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            field: "DestinatariosMailNivelAviso",
                            title: window.app.idioma.t("DESTINATARIOS_NIVEL_AVISO"),
                        },
                        {
                            field: "CantidadNivelAviso",
                            title: window.app.idioma.t("CANTIDAD_NIVEL_AVISO"),
                            template: "#=kendo.format('{0:n2}',parseFloat(CantidadNivelAviso.toString()))#",
                            //width: 170,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            field: "CantidadActual",
                            title: window.app.idioma.t("CANTIDAD_ACTUAL"),
                            template: "#=kendo.format('{0:n2}',parseFloat(CantidadActual.toString()))#",
                            width: 145,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            field: "Unidad",
                            template: "#=Unidad ? Unidad.toUpperCase() : ''#",
                            title: window.app.idioma.t("UNIDAD"),
                            width: 90,
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
                        },
                        {
                            field: "TextoCuerpoCorreo",
                            title: window.app.idioma.t("TEXTO_CUERPO_CORREO"),
                        },
                    ],
                    dataBinding: self.resizeGrid,
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];

                                row.cells[6].value = kendo.toString(e.data[dataPosition].CantidadNivelCritico, "n2");
                                row.cells[8].value = kendo.toString(e.data[dataPosition].CantidadNivelAviso, "n2");
                                row.cells[9].value = kendo.toString(e.data[dataPosition].CantidadActual, "n2");
                            } catch (e) {
                            }
                        }
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridAvisosStockMMPP").data("kendoGrid"));
            },
            events: {
                'click #btnAnadir': 'anadirEditar',
                'click #btnEditar': 'anadirEditar',
                'click #btnEliminar': 'confirmarEliminar',
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
                'click #btnExportExcel': 'exportExcel',
            },
            anadirEditar: function (e) {
                var self = this;
                var permiso = TienePermiso(334) || TienePermiso(336);

                if (permiso) {
                    var operacion = (e.currentTarget.id == 'btnAnadir') ? self.constOperaciones.Crear : self.constOperaciones.Editar;
                    self.nuevaVentana = new VistaCrearEditarAviso(operacion.toString(), self.dsMateriales, self.dsUbicaciones)
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                }
            },
            confirmarEliminar: function (e) {
                e.preventDefault();
                var self = this;
                var permiso = TienePermiso(334) || TienePermiso(336);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $("#gridAvisosStockMMPP").data("kendoGrid");
                var data = grid.dataItem(grid.select());

                if (data != null) {
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('ELIMINAR_AVISO_STOCK_MMPP'),
                        msg: window.app.idioma.t('CONFIRMACION_ELIMINAR_AVISO_STOCK_MMPP'),
                        funcion: function () { self.borrar(data.IdAviso); },
                        contexto: this
                    });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                }
            },
            borrar: function (idAviso) {
                var self = this;

                $.ajax({
                    type: "DELETE",
                    async: false,
                    url: "../api/EliminarAvisoStockMMPPFabricacion/" + idAviso,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res == 0) {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ELIMINAR_AVISO_STOCK_MMPP'), 4000);
                        } else {
                            self.dsAvisos.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_ELIMINADO_AVISO_STOCK_MMPP'), 3000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ELIMINAR_AVISO_STOCK_MMPP'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            limpiarFiltroGrid: function () {
                const self = this;

                self.dsAvisos.query({
                    group: [],
                    filter: [],
                    page: 1
                });
            },
            exportExcel: function () {
                var grid = $("#gridAvisosStockMMPP").data("kendoGrid");
                grid.saveAsExcel();
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

                var gridElement = $("#gridAvisosStockMMPP"),
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

        return vistaPropMMPPEnvasado;
    });