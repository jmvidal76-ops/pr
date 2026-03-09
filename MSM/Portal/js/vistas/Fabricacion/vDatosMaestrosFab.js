define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/DatosMaestros.html', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaDatosMaestros, Not) {
        var gridDatosMaestros = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            template: _.template(PlantillaDatosMaestros),
            resultadoDatos: null,
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

                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerMaterialesFabricacion/",
                            dataType: "json"
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                'IdMaterial': { type: "string" },
                                'DescTipo': { type: "string" },
                                'IdClase': { type: "string" },
                                'Clase': { type: "string" },
                                'Nombre': { type: "string" },
                                'Descripcion': { type: "string" },
                                'UdMedida': { type: "string" },
                                'FechaUltCreacion': { type: "date" }
                            },
                        }
                    },
                    sort: { field: "FechaUltCreacion", dir: "desc" }
                });

                self.grid = $("#gridDatosMaestros").kendoGrid({
                    dataSource: self.ds,
                    sortable: true,
                    groupable: {
                        messages: {
                            empty: window.app.idioma.t('ARRASTRAR_SOLTAR')
                        }
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    resizable: true,
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
                    columns: [
                       { field: "IdMaterial", title: window.app.idioma.t("CODIGO_PRODUCTO"), width: 80, hidden:true },
                       {
                           field: "DescTipo", title: window.app.idioma.t("TIPO_MATERIAL"), width: 100,
                           filterable: {
                               multi: true,
                               itemTemplate: function (e) {
                                   var p = $("form.k-filter-menu").data("kendoPopup");
                                   var filterMultiCheck = $(".k-multicheck-wrap").data("kendoFilterMultiCheck");
                                   if (e.field == "all") {
                                       //handle the check-all checkbox template
                                       return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                   } else {
                                       //handle the other checkboxes
                                       return "<div><label><input type='checkbox' value='#=DescTipo#' style='width: 14px;height:14px;margin-right:5px;'/>#= DescTipo#</label></div>";
                                   }
                               }
                           }
                       },
                       {
                           field: "IdClase", title: window.app.idioma.t("IDCLASE"), width: 70,
                           filterable: {
                               multi: true,
                               itemTemplate: function (e) {
                                   if (e.field == "all") {
                                       //handle the check-all checkbox template
                                       return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                   } else {
                                       //handle the other checkboxes
                                       return "<div><label><input type='checkbox' value='#=IdClase#' style='width: 14px;height:14px;margin-right:5px;'/>#=IdClase#</label></div>";
                                   }
                               }
                           }
                       },
                       {
                           field: "Clase", title: window.app.idioma.t("CLASE"), width: 120,
                           filterable: {
                               multi: true,
                               itemTemplate: function (e) {
                                   if (e.field == "all") {
                                       //handle the check-all checkbox template
                                       return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                   } else {
                                       //handle the other checkboxes
                                       return "<div><label><input type='checkbox' value='#=Clase#' style='width: 14px;height:14px;margin-right:5px;'/>#= Clase#</label></div>";
                                   }
                               }
                           }
                       },
                       {
                           field: "IdSubclase", title: window.app.idioma.t("ID_SUBCLASE"), width: 70,
                           filterable: {
                               multi: true,
                               itemTemplate: function (e) {
                                   if (e.field == "all") {
                                       //handle the check-all checkbox template
                                       return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                   } else {
                                       //handle the other checkboxes
                                       return "<div><label><input type='checkbox' value='#=IdSubclase#' style='width: 14px;height:14px;margin-right:5px;'/>#=IdSubclase#</label></div>";
                                   }
                               }
                           }
                       },
                       {
                           field: "Subclase", title: window.app.idioma.t("SUBCLASE"), width: 120,
                           filterable: {
                               multi: true,
                               itemTemplate: function (e) {
                                   if (e.field == "all") {
                                       //handle the check-all checkbox template
                                       return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                   } else {
                                       //handle the other checkboxes
                                       return "<div><label><input type='checkbox' value='#=Subclase#' style='width: 14px;height:14px;margin-right:5px;'/>#= Subclase#</label></div>";
                                   }
                               }
                           }
                       },
                       {
                           field: "Nombre", title: window.app.idioma.t("PRODUCTO"), width: 80,
                           filterable: {
                               operators: {
                                   string: {
                                       eq: "es igual a",
                                       contains: "contiene"
                                   }
                               }
                           }
                       },
                       {
                           field: "Descripcion", title: window.app.idioma.t("DESCRIPCION"), width: 220,
                           filterable: {
                               operators: {
                                   string: {
                                       eq: "es igual a",
                                       contains: "contiene"
                                   }
                               }
                           }
                        },
                        {
                            field: "UdMedida", title: window.app.idioma.t("UNIDAD"), width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=UdMedida#' style='width: 14px;height:14px;margin-right:5px;'/>#= UdMedida#</label></div>";
                                    }
                                }
                            }
                        },
                       {
                           field: "FechaUltCreacion", title: window.app.idioma.t("FECHA_ACTUALIZACION"), width: 150,
                           format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                           template: "#: kendo.toString(FechaUltCreacion, kendo.culture().calendars.standard.patterns.MES_FechaHora) #",
                           filterable: {
                               ui: function (element) {
                                   element.kendoDateTimePicker({
                                       format: kendo.culture().calendars.standard.patterns.MES_FechaHora
                                   });
                               }
                           }
                       }
                    ],
                    dataBound: self.resizeGrid
                });                

            },            
            detailInit: function (e) {
                var detailRow = e.detailRow;

                detailRow.find(".container").kendoTabStrip({
                    animation: {
                        open: { effects: "fadeIn" }
                    }
                });
            },
            events: {                
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid'
            },           
            limpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            eliminar: function () {
                this.remove();
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