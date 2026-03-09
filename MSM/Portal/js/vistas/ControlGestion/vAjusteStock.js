define(['underscore', 'backbone', 'jquery', 'text!../../../ControlGestion/html/AjusteStock.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'jszip'],
    function (_, Backbone, $, PlantillaAjusteStock, Not, VistaDlgConfirm, JSZip) {
        var vistaAjusteStock = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaAjusteStock),
            dsAjusteStock: null,
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.getDataSource();
                self.render();
            },
            getDataSource: function () {
                var self = this;

                self.dsAjusteStock = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/controlGestion/obtenerAjusteStock",
                            dataType: "json"
                        },
                    },
                    schema: {
                        parse: function (response) {

                            for (const r of response) {
                                r.DiferenciaCantidad = r.CantidadMES - r.CantidadJDE;
                            }

                            return response;
                        },
                        model: {
                            id: "IdAjuste",
                            fields: {
                                IdAjuste: { type: "number" },
                                Localizacion: { type: "string" },
                                IdMaterial: { type: "string" },
                                DescMaterial: { type: "string" },
                                CantidadMES: { type: "number" },
                                CantidadJDE: { type: "number" },
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

                self.grid = this.$("#gridAjusteStock").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t("AJUSTE_STOCK") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    dataSource: self.dsAjusteStock,
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
                            field: "Localizacion",
                            title: window.app.idioma.t("LOCALIZACION"),
                            width: 180,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Localizacion#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Localizacion #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "IdMaterial",
                            title: window.app.idioma.t("CODIGO_MATERIAL"),
                            width: 180,
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
                            field: "CantidadMES",
                            title: window.app.idioma.t("CANTIDAD") + " MES",
                            width: 180,
                            template: "#= CantidadMES != null ? kendo.format('{0:n2}', parseFloat(CantidadMES.toString())) : ''#",
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
                            field: "CantidadJDE",
                            title: window.app.idioma.t("CANTIDAD") + " JDE",
                            width: 180,
                            template: "#= CantidadJDE != null ? kendo.format('{0:n2}', parseFloat(CantidadJDE.toString())) : ''#",
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
                            field: "DiferenciaCantidad",
                            title: "Dif. Cantidad",
                            width: 180,
                            template: "#= DiferenciaCantidad != null ? kendo.format('{0:n2}', parseFloat(DiferenciaCantidad.toString())) : ''#",
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
                            width: 180,
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
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];

                                row.cells[3].value = e.data[dataPosition].CantidadMES == null ? "" : kendo.toString(e.data[dataPosition].CantidadMES, "n2");
                                row.cells[4].value = e.data[dataPosition].CantidadJDE == null ? "" : kendo.toString(e.data[dataPosition].CantidadJDE, "n2");
                                row.cells[5].value = e.data[dataPosition].DiferenciaCantidad == null ? "" : kendo.toString(e.data[dataPosition].DiferenciaCantidad, "n2");
                            } catch (e) {
                            }
                        }
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridAjusteStock").data("kendoGrid"));
            },
            events: {
                'click #btnActualizarStocks': 'confirmarActualizarStocks',
                'click #btnCorregirStock': 'corregirStock',
                'click #btnExportExcel': 'exportExcel',
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
            },
            confirmarActualizarStocks: function (e) {
                e.preventDefault();
                var self = this;
                var permiso = TienePermiso(374);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ACTUALIZAR_STOCKS'),
                    msg: window.app.idioma.t('DESEA_REALMENTE') + " " + window.app.idioma.t('ACTUALIZAR_STOCKS'),
                    funcion: function () { self.actualizarStocks(); },
                    contexto: this
                });
            },
            actualizarStocks: function () {
                var self = this;

                $.ajax({
                    url: "../api/controlGestion/actualizarStocksMESJDE",
                    dataType: "json",
                    success: function (res) {
                        setTimeout(() => {
                            if (res) {
                                self.dsAjusteStock.read();
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ACTUALIZANDO_OK'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ACTUALIZAR_STOCKS'), 4000);
                            }
                            Backbone.trigger('eventCierraDialogo');
                        }, 5000)
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ACTUALIZAR_STOCKS'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            corregirStock: function (e) {
                return;
            },
            exportExcel: function () {
                var grid = $("#gridAjusteStock").data("kendoGrid");
                grid.saveAsExcel();
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

                var gridElement = $("#gridAjusteStock"),
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

        return vistaAjusteStock;
    });