define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/DatosMaestros.html', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaDatosMaestros, Not) {
        var gridDatosMaestros = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaDatosMaestros),
            pageSizeDefault: 50,
            group: false,
            initialize: function () {
                var self = this;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.render();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))

                //Cargamos el grid con los datos recibidos
                this.$("#gridDatosMaestros").kendoGrid({
                    dataSource: {
                        transport: {
                            read: {
                                async: true,
                                url: "../api/obtenerDatosMaestros",
                                dataType: "json"
                            }
                        },
                        pageSize: 50,
                        schema: {
                            model: {
                                id: "idMaterial",
                                fields: {
                                    enUso: {
                                        type: "string",
                                        parse: function (data) {
                                            return data ? window.app.idioma.t('SI') : window.app.idioma.t('NO');
                                        }
                                    },
                                    f_efectivoDesde: {
                                        type: "date",
                                        parse: function (data) {
                                            return data == null ? "-" : new Date(data).toLocaleDateString("es-ES");
                                        }
                                    },
                                    f_efectivoHasta: {
                                        type: "date",
                                        parse: function (data) {
                                            return data == null ? "-" : new Date(data).toLocaleDateString("es-ES");
                                        }
                                    },
                                    fechaCreacion: {
                                        type: "date",
                                        parse: function (data) {
                                            return data == null ? "-" : new Date(data).toLocaleDateString("es-ES");
                                        }
                                    },
                                    fechaUltCreacion: {
                                        type: "date",
                                        parse: function (data) {
                                            return data == null ? "-" : new Date(data).toLocaleDateString("es-ES");
                                        }
                                    }
                                }
                            }
                        },
                        requestStart: function () {
                            if ($("#gridDatosMaestros").data("kendoGrid").dataSource.data().length == 0) {
                                kendo.ui.progress($("#gridDatosMaestros"), true);
                            }
                        },
                        requestEnd: function () {
                            if ($("#gridDatosMaestros").data("kendoGrid").dataSource.data().length == 0) {
                                kendo.ui.progress($("#gridDatosMaestros"), false);
                            }
                        }
                    },
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
                    detailTemplate: kendo.template(this.$("#template").html()),
                    detailInit: this.detailInit,
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
                            field: "tipo", title: window.app.idioma.t("TIPO_MATERIAL"), width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    //var p = $("form.k-filter-menu").data("kendoPopup");
                                    //var filterMultiCheck = $(".k-multicheck-wrap").data("kendoFilterMultiCheck");
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=tipo#' style='width: 14px;height:14px;margin-right:5px;'/>#= tipo#</label></div>";
                                }
                            }
                        },
                        {
                            field: "idClase", title: window.app.idioma.t("IDCLASE"), width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=idClase#' style='width: 14px;height:14px;margin-right:5px;'/>#= idClase#</label></div>";                                   
                                }
                            }
                        },
                        {
                            field: "clase", title: window.app.idioma.t("CLASE"), width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=clase#' style='width: 14px;height:14px;margin-right:5px;'/>#= clase#</label></div>";
                                }
                            }
                        },
                        {
                            field: "idSubclase", title: window.app.idioma.t("ID_SUBCLASE"), width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=idSubclase#' style='width: 14px;height:14px;margin-right:5px;'/>#= idSubclase#</label></div>";                                   
                                }
                            }
                        },
                        {
                            field: "subclase", title: window.app.idioma.t("SUBCLASE"), width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=subclase#' style='width: 14px;height:14px;margin-right:5px;'/>#= subclase#</label></div>";
                                }
                            }
                        },
                        {
                            field: "FormatoComun", title: window.app.idioma.t("FORMATO_COMUN"), width: 120,
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
                        { field: "idMaterial", title: window.app.idioma.t("CODIGO_PRODUCTO"), width: 80 },
                        {
                            field: "nombre", title: window.app.idioma.t("PRODUCTO"), width: 150,
                        },
                        //{
                        //    field: "descripcion", title: window.app.idioma.t("DESCRIPCION"), width: 200,
                        //},
                        {
                            field: "gama", title: window.app.idioma.t("GAMA"), width: 90, filterable: {
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
                            field: "marca", title: window.app.idioma.t("MARCA"), width: 90, filterable: {
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
                            field: "tipoEnvase", title: window.app.idioma.t("TIPO_ENVASE"), width: 120,
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

                this.$("#selectAgrupacion").kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: [
                        { text: window.app.idioma.t('SIN_AGRUPACION'), value: '0' },
                        { text: window.app.idioma.t('TIPO'), value: 'tipo' },
                        { text: window.app.idioma.t('CLASE'), value: 'idClase' }
                    ]
                });
            },
            detailInit: function (e) {
                var detailRow = e.detailRow;
                var udMedida = e.data.udMedida;

                if (udMedida == 'MD' || udMedida == 'PL') {
                    e.detailRow.find('#divFichaProducto').show();
                } else {
                    e.detailRow.find('#divFichaProducto').hide();
                }

                detailRow.find(".container").kendoTabStrip({
                    animation: {
                        open: { effects: "fadeIn" }
                    }
                });
            },
            events: {
                'change #selectAgrupacion': 'Agrupar',
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
            },
            Agrupar: function () {
                var dataSource = $("#gridDatosMaestros").data("kendoGrid").dataSource;
                if ($("#selectAgrupacion").val() != 0) {
                    var pageSize = dataSource.pageSize();
                    var totalReg = dataSource.total();
                    if (pageSize != totalReg) {
                        self.pageSizeDefault = pageSize;
                    }
                    dataSource.pageSize(totalReg);
                    dataSource.group({ field: $("#selectAgrupacion").val() });
                }
                else {
                    dataSource.pageSize(self.pageSizeDefault);
                    dataSource.group("");
                }
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

                var gridElement = $("#gridDatosMaestros"),
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

        return gridDatosMaestros;
    });