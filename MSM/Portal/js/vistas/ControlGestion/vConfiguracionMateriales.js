define(['underscore', 'backbone', 'jquery', 'text!../../../ControlGestion/html/ConfiguracionMateriales.html', 'compartido/notificaciones',
    'vistas/vDialogoConfirm', 'vistas/ControlGestion/vCrearEditarConfiguracionMateriales', 'definiciones'],
    function (_, Backbone, $, PlantillaConfiguracionMateriales, Not, VistaDlgConfirm, VistaCrearEditarConfiguracionMateriales, definiciones) {
        var vistaConfigMateriales = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaConfiguracionMateriales),
            dsConfiguracion: null,
            constOperaciones: definiciones.OperacionesCRUD(),
            initialize: function () {
                var self = this;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.getDataSource();
                self.render();
            },
            getDataSource: function () {
                var self = this;

                self.dsConfiguracion = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/controlGestion/obtenerConfiguracionMaterialesAjusteStockJDE",
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            id: "IdConfig",
                            fields: {
                                IdConfig: { type: "number" },
                                IdMaterial: { type: "string" },
                                DescMaterial: { type: "string" },
                                Cantidad: { type: "number" },
                                Unidad: { type: "string" },
                            }
                        },
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

                self.grid = this.$("#gridConfigMateriales").kendoGrid({
                    dataSource: self.dsConfiguracion,
                    groupable: {
                        messages: {
                            empty: window.app.idioma.t('ARRASTRAR_SOLTAR')
                        }
                    },
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
                            field: "IdMaterial",
                            title: window.app.idioma.t("CODIGO_MATERIAL"),
                            width: 200,
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
                            field: "DescMaterial",
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= DescMaterial #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Cantidad",
                            title: window.app.idioma.t("CANTIDAD"),
                            width: 200,
                            template: "#= Cantidad != null ? kendo.format('{0:n2}', parseFloat(Cantidad.toString())) : ''#",
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "Unidad",
                            title: window.app.idioma.t("UD_MEDIDA"),
                            width: 200,
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
                    ],
                    dataBinding: self.resizeGrid,
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridConfigMateriales").data("kendoGrid"));
            },
            events: {
                'click #btnAnadir': 'anadirEditar',
                'click #btnEditar': 'anadirEditar',
                'click #btnEliminar': 'confirmarEliminar',
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
            },
            anadirEditar: function (e) {
                var self = this;
                var permiso = TienePermiso(372);

                if (permiso) {
                    let operacion = (e.currentTarget.id == 'btnAnadir') ? self.constOperaciones.Crear : self.constOperaciones.Editar;
                    self.nuevaVentana = new VistaCrearEditarConfiguracionMateriales({ operacion });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                }
            },
            confirmarEliminar: function (e) {
                e.preventDefault();
                var self = this;
                var permiso = TienePermiso(372);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $("#gridConfigMateriales").data("kendoGrid");
                var data = grid.dataItem(grid.select());

                if (data != null) {
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('ELIMINAR') + ' ' + window.app.idioma.t('CONFIGURACION_MATERIALES'),
                        msg: window.app.idioma.t('CONFIRMACION_ELIMINAR_REGISTRO'),
                        funcion: function () { self.borrar(data.IdConfig); },
                        contexto: this
                    });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                }
            },
            borrar: function (idConfig) {
                var self = this;

                $.ajax({
                    type: "DELETE",
                    async: false,
                    url: "../api/controlGestion/eliminarMaterialAjusteStockJDE/" + idConfig,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            self.dsConfiguracion.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ELIMINACION_OK'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ELIMINACION_NO_OK'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ELIMINACION_NO_OK'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
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
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridConfigMateriales"),
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

        return vistaConfigMateriales;
    });