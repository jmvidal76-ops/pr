define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/VisualizacionUbicacionesGrid.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, Plantilla, VistaDlgConfirm, Not, enums) {
        var Vista = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            grid: null,
            ds: null,
            template: _.template(Plantilla),
            initialize: function () {
                var self = this;

                self.getDataSource();
                self.render();
            },

            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                self.grid = this.$("#grid").kendoGrid({
                    autoBind: false,
                    dataSource: self.ds,
                    groupable: {
                        messages: {
                            empty: window.app.idioma.t('ARRASTRAR_SOLTAR')
                        }
                    },
                    sortable: true,
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [500, 1000, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "DescripcionAlmacen",
                            title: window.app.idioma.t("ALMACEN"),
                            width: 250,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionAlmacen#' style='width: 14px;height:14px;margin-right:5px;'/> #= DescripcionAlmacen#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionZona",
                            title: window.app.idioma.t("DESCRIPCIONZONA"),
                            width: 250,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionZona#' style='width: 14px;height:14px;margin-right:5px;'/> #= DescripcionZona#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Nombre", title: window.app.idioma.t("NOMBRE_UBICACION"), width: 200,
                        },
                        {
                            field: "Descripcion", title: window.app.idioma.t("DESCRIPCION_UBICACION"), width: 260,
                        },
                        {
                            field: "DescripcionEstado", title: window.app.idioma.t("DESCRIPCIONESTADO"), width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionEstado#' style='width: 14px;height:14px;margin-right:5px;'/> #= DescripcionEstado#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionTipoUbicacion", title: window.app.idioma.t("TIPO_UBICACION"), width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionTipoUbicacion#' style='width: 14px;height:14px;margin-right:5px;'/> #= DescripcionTipoUbicacion#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionPoliticaLlenado", title: window.app.idioma.t("DESCRIPCIONPOLITICALLENADO"), width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionPoliticaLlenado#' style='width: 14px;height:14px;margin-right:5px;'/> #= DescripcionPoliticaLlenado#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionPoliticaVaciado", title: window.app.idioma.t("DESCRIPCIONPOLITICAVACIADO"), width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionPoliticaVaciado#' style='width: 14px;height:14px;margin-right:5px;'/> #= DescripcionPoliticaVaciado#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionClaseMaterial",
                            title: window.app.idioma.t("DESCRIPCIONCLASEMATERIAL"),
                            width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionClaseMaterial#' style='width: 14px;height:14px;margin-right:5px;'/> #= DescripcionClaseMaterial#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "IdUnidadMedida",
                            title: window.app.idioma.t("UNIDAD_MEDIDA"),
                            width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdUnidadMedida#' style='width: 14px;height:14px;margin-right:5px;'/> #= IdUnidadMedida#</label></div>";
                                    } 
                                }
                            }
                        },
                        {
                            field: "IdUbicacionLinkMes", title: window.app.idioma.t("IDUBICACIONLINKMES"), width: 250,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdUbicacionLinkMes#' style='width: 14px;height:14px;margin-right:5px;'/> #= IdUbicacionLinkMes#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "IdLinea",
                            title: window.app.idioma.t("LINEA"),
                            width: 200,
                            template: function (e) {
                                return e.NumeroLinea === null || e.DescripcionLinea === null ? "" : window.app.idioma.t("LINEA") + " " + e.NumeroLinea.toString() + " - " + e.DescripcionLinea;
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    else {
                                        return ({ IdLinea, NumeroLinea, DescripcionLinea, all }) => {
                                            if (NumeroLinea === null || DescripcionLinea === null)
                                                return `<div>
                                                            <label>
                                                                <input type='checkbox' style='width: 14px;height:14px;margin-right:5px;' value='' />
                                                                (Sin datos)
                                                            </label>
                                                        </div>`;
                                            else
                                                return `<div>
                                                            <label>
                                                                <input type='checkbox' style='width: 14px;height:14px;margin-right:5px;' value='${ IdLinea }' />
                                                                ${ window.app.idioma.t("LINEA") } ${ NumeroLinea.toString() } - ${ DescripcionLinea }
                                                            </label>
                                                        </div>`;
                                        }
                                    }
                                }
                            }
                        },
                        {
                            field: "DescripcionZonaAsociada",
                            title: window.app.idioma.t("DESCZONAASOCIADA"),
                            width: 200,
                        },
                        {
                            field: "Offset",
                            title: window.app.idioma.t("OFFSET"),
                            aggregates: ["sum"],
                            width: 100,
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "VelocidadNominalReferencia",
                            title: window.app.idioma.t("VELOCIDADNOMINALREFERENCIA"),
                            aggregates: ["sum"],
                            width: 100,
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "NamePDVCalidad", title: window.app.idioma.t("DESCPDV"), width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=NamePDVCalidad#' style='width: 14px;height:14px;margin-right:5px;'/> #= NamePDVCalidad#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "NamePDVSEO", title: window.app.idioma.t("DESCPDVSEO"), width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=NamePDVSEO#' style='width: 14px;height:14px;margin-right:5px;'/> #= NamePDVSEO#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "NombreGrupo", title: window.app.idioma.t("NOMBREGRUPO"), width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=NombreGrupo#' style='width: 14px;height:14px;margin-right:5px;'/> #= NombreGrupo#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CantidadLotesVaciadoAutomatico", title: window.app.idioma.t("CANTIDADLOTESVACIADOAUTOMATICO"), width: 100,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                    ],
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");

                self.resizeGrid();
                self.ds.read();
            },
            getDataSource: function () {
                var self = this;

                self.ds = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/GetUbicacionesPuntosVerificacion",
                            data: function () {
                                var result = {};
                                return result;
                            },
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "GET",
                        }
                    },
                    schema: {
                        model: {
                            id: "IdUbicacion",
                            fields: {
                                DescripcionAlmacen: { type: "string", editable: false },
                                DescripcionZona: { type: "string", editable: false },
                                Nombre: { type: "string", editable: false },
                                Descripcion: { type: "string", editable: false },
                                DescripcionEstado: { type: "string", editable: false },
                                DescripcionTipoUbicacion: { type: "string", editable: false },
                                DescripcionPoliticaLlenado: { type: "string", editable: false },
                                DescripcionPoliticaVaciado: { type: "string", editable: false },
                                DescripcionClaseMaterial: { type: "string", editable: false },
                                IdUnidadMedida: { type: "string", editable: false },
                                IdLinea: { type: "string", editable: false },
                                IdUbicacionLinkMes: { type: "string", editable: false },
                                NombreGrupo: { type: "string", editable: false },
                                CantidadLotesVaciadoAutomatico: { type: "number", editable: false }
                            }
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            $("#center-pane").empty();
                        }
                    }
                });

            },
            actualizar: function () {
                var self = this;
                self.ds.read()
            },
            events: {
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnFiltrar': 'filtrar'
            },
            eliminar: function () {
                this.remove();
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#grid"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            },
        });
        return Vista;
    });