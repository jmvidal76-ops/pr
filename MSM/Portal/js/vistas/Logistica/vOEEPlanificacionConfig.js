define(['underscore', 'backbone', 'jquery', 'text!../../../Logistica/html/OEEPlanificacionConfig.html', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaOEEPlanifConfig, Not) {
        var vistaOEEPlanifConfig = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            dsOEEConfig: null,
            template: _.template(PlantillaOEEPlanifConfig),
            initialize: function () {
                var self = this;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.getDataSource();
                self.render();
            },
            getDataSource: function () {
                var self = this;

                self.dsOEEConfig = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ObtenerConfiguracionOEEPlanificacion",
                            dataType: "json"
                        },
                        update: {
                            url: "../api/EditarValorDesviacion",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                } else {
                                    if (e.responseJSON) {
                                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('GUARDADO_CORRECTAMENTE'), 4000);
                                    } else {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                                    }

                                    var grid = $("#gridOEEConfig").data("kendoGrid");
                                    grid.dataSource.read();
                                }
                            },
                        },
                        parameterMap: function (options, operation) {
                            if (operation !== "read" && options) {
                                return kendo.stringify(options);
                            }
                            return options;
                        }
                    },
                    schema: {
                        model: {
                            id: "IdOEEPlanificacionConfig",
                            fields: {
                                IdOEEPlanificacionConfig: { type: "number" },
                                IdLinea: { type: "string", editable: false },
                                Linea: { type: "string", editable: false },
                                Descripcion: { type: "string", editable: false },
                                Valor: { type: "string" },
                                Unidad: { type: "string", editable: false },
                                Codigo: { type: "string", editable: false },
                            }
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                self.grid = self.$("#gridOEEConfig").kendoGrid({
                    dataSource: self.dsOEEConfig,
                    sortable: true,
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    editable: "inline",
                    pageable: {
                        refresh: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "Linea",
                            title: window.app.idioma.t('LINEA'),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>" + window.app.idioma.t('LINEA') + " #= Linea#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Descripcion",
                            title: window.app.idioma.t('DESCRIPCION'),
                        },
                        {
                            field: "Valor",
                            title: window.app.idioma.t('VALOR'),
                        },
                        {
                            field: "Unidad",
                            title: window.app.idioma.t('UNIDAD'),
                            width: 150,
                        },
                        {
                            title: '',
                            attributes: { "align": "center" },
                            width: 150,
                            command: [
                                {
                                    name: "edit",
                                    text: {
                                        edit: window.app.idioma.t("EDITAR"),
                                        update: window.app.idioma.t("ACTUALIZAR"),
                                        cancel: window.app.idioma.t("CANCELAR")
                                    },
                                    click: function (e) {
                                        var permiso = TienePermiso(314);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            $('#gridOEEConfig').data("kendoGrid").cancelChanges();
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                    dataBinding: self.resizeGrid,
                }).data("kendoGrid");
            },
            events: {
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

                var gridElement = $("#gridOEEConfig"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;

                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - 2);
            }
        });

        return vistaOEEPlanifConfig;
    });