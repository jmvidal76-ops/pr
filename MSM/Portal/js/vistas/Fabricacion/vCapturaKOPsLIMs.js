define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/CapturaKOPsLIMs.html', 'compartido/notificaciones',
    'vistas/vDialogoConfirm', 'vistas/Fabricacion/vCrearEditarCapturaKOPsLIMs', 'definiciones'],
    function (_, Backbone, $, PlantillaCapturaKOPsLIMs, Not, VistaDlgConfirm, VistaCrearEditarKOPsLIMS, definiciones) {
        var vistaKOPsLIMs = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaCapturaKOPsLIMs),
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
                            url: "../api/KOPS/ObtenerConfiguracionCapturaKOPSLIMS",
                            dataType: "json"
                        },
                    },
                    schema: {
                        parse: function (response) {

                            for (const r of response) {
                                r.CodigoDescKOP = r.CodigoKOP + ' - ' + r.DescKOP;
                            }

                            return response;
                        },
                        model: {
                            id: "IdConfig",
                            fields: {
                                IdConfig: { type: "number" },
                                IdTipoWO: { type: "number" },
                                DescTipoWO: { type: "string" },
                                CodigoKOP: { type: "string" },
                                DescKOP: { type: "string" },
                                CodigoTest: { type: "string" },
                                Componente: { type: "string" },
                                Activo: { type: "boolean" }
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

                self.grid = this.$("#gridKopsLims").kendoGrid({
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
                            field: "DescTipoWO",
                            title: window.app.idioma.t("TIPO_WO"),
                            width: 130,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescTipoWO#' style='//width: 14px;height:14px;margin-right:5px;'/>#= DescTipoWO #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CodigoDescKOP",
                            title: window.app.idioma.t("KOP"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=CodigoDescKOP#' style='//width: 14px;height:14px;margin-right:5px;'/>#= CodigoDescKOP #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CodigoTest",
                            title: window.app.idioma.t("CODIGO_TEST"),
                        },
                        {
                            field: "Componente",
                            title: window.app.idioma.t("COMPONENTE"),
                        },
                        {
                            field: "Activo",
                            title: window.app.idioma.t("ACTIVO"),
                            width: 110,
                            template: "# if(Activo){#" + window.app.idioma.t("SI") + "#} else {#" + window.app.idioma.t("NO") + "#} #",
                        },
                    ],
                    dataBinding: self.resizeGrid,
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridKopsLims").data("kendoGrid"));
            },
            events: {
                'click #btnAnadir': 'anadirEditar',
                'click #btnEditar': 'anadirEditar',
                'click #btnEliminar': 'confirmarEliminar',
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
            },
            anadirEditar: function (e) {
                var self = this;
                var permiso = TienePermiso(370);

                if (permiso) {
                    let operacion = (e.currentTarget.id == 'btnAnadir') ? self.constOperaciones.Crear : self.constOperaciones.Editar;
                    self.nuevaVentana = new VistaCrearEditarKOPsLIMS({ operacion });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                }
            },
            confirmarEliminar: function (e) {
                e.preventDefault();
                var self = this;
                var permiso = TienePermiso(370);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $("#gridKopsLims").data("kendoGrid");
                var data = grid.dataItem(grid.select());

                if (data != null) {
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('ELIMINAR') + ' ' + window.app.idioma.t('CAPTURA_KOPS_LIMS'),
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
                    url: "../api/KOPS/EliminarCapturaKOPSLIMS/" + idConfig,
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

                var gridElement = $("#gridKopsLims"),
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

        return vistaKOPsLIMs;
    });