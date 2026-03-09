define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/ModificarOrdenesCambio.html'], function (_, Backbone, $, PlantillaModOrdenesCambio) {
    var gridModOrdenesCambio = Backbone.View.extend({
        tagName: 'div',
        id: 'divHTMLContenido',
        template: _.template(PlantillaModOrdenesCambio),
        initialize: function () {
            var self = this;
            var splitter = $("#vertical").data("kendoSplitter");
            splitter.bind("resize", self.resizeGrid);
            self.render();
        },
        render: function () {
            $(this.el).html(this.template());
            $("#center-pane").append($(this.el))
            var self = this;

            $("#dtpFechaDesde").kendoDatePicker({
                format: "dd/MM/yyyy HH:mm:ss",
                culture: localStorage.getItem("idiomaSeleccionado")
            });

            $("#dtpFechaHasta").kendoDatePicker({
                format: "dd/MM/yyyy HH:mm:ss",
                culture: localStorage.getItem("idiomaSeleccionado")
            });


            //Grid
            this.$("#gridModOrdenesCambio").kendoGrid({
                dataSource: {
                    data: [
                            { OrdId: 1, Linea: "Linea B347", OC: "1", Estado: "En curso", WOAnt: "xxx", ProductoAnterior: "xx", WOPos: "xxx", ProductoPosterior: "xx", InicioReal: new Date(2015, 6, 20), FinReal: new Date(2015, 6, 20), Duracion: "xxx", InicioEstimado: "09/07/2015 12:30:15", FinEstimado: "09/08/2015 12:30:15", DuracionEstimada: "xxx" },
                            { OrdId: 2, Linea: "Linea B147", OC: "2", Estado: "Planificada", WOAnt: "xxx", ProductoAnterior: "xx", WOPos: "xxx", ProductoPosterior: "xx", InicioReal: new Date(2015, 6, 20), FinReal: new Date(2015, 6, 20), Duracion: "xxx", InicioEstimado: "10/07/2015 12:30:15", FinEstimado: "09/08/2015 12:30:15", DuracionEstimada: "xxx" },
                            { OrdId: 3, Linea: "Linea B247", OC: "3", Estado: "En curso", WOAnt: "xxx", ProductoAnterior: "xx", WOPos: "xxx", ProductoPosterior: "xx", InicioReal: new Date(2015, 6, 20), FinReal: new Date(2015, 6, 20), Duracion: "xxx", InicioEstimado: "11/07/2015 12:30:15", FinEstimado: "09/08/2015 12:30:15", DuracionEstimada: "xxx" },
                            { OrdId: 4, Linea: "Linea B347", OC: "4", Estado: "En curso", WOAnt: "xxx", ProductoAnterior: "xx", WOPos: "xxx", ProductoPosterior: "xx", InicioReal: new Date(2015, 6, 20), FinReal: new Date(2015, 6, 20), Duracion: "xxx", InicioEstimado: "12/07/2015 12:30:15", FinEstimado: "09/08/2015 12:30:15", DuracionEstimada: "xxx" },
                            { OrdId: 5, Linea: "Linea B147", OC: "5", Estado: "Cerrada", WOAnt: "xxx", ProductoAnterior: "xx", WOPos: "xxx", ProductoPosterior: "xx", InicioReal: new Date(2015, 6, 20), FinReal: new Date(2015, 6, 20), Duracion: "xxx", InicioEstimado: "13/07/2015 12:30:15", FinEstimado: "09/08/2015 12:30:15", DuracionEstimada: "xxx" },
                            { OrdId: 6, Linea: "Linea B447", OC: "6", Estado: "En curso", WOAnt: "xxx", ProductoAnterior: "x", WOPos: "xxx", ProductoPosterior: "xx", InicioReal: new Date(2015, 6, 20), FinReal: new Date(2015, 6, 20), Duracion: "xxx", InicioEstimado: "14/07/2015 12:30:15", FinEstimado: "09/08/2015 12:30:15", DuracionEstimada: "xxx" },
                            { OrdId: 7, Linea: "Linea B147", OC: "7", Estado: "En curso", WOAnt: "xxx", ProductoAnterior: "xx", WOPos: "xxx", ProductoPosterior: "xx", InicioReal: new Date(2015, 6, 20), FinReal: new Date(2015, 6, 20), Duracion: "xxx", InicioEstimado: "15/07/2015 12:30:15", FinEstimado: "09/08/2015 12:30:15", DuracionEstimada: "xxx" },
                            { OrdId: 8, Linea: "Linea B447", OC: "8", Estado: "Planificada", WOAnt: "xxx", ProductoAnterior: "xx", WOPos: "xxx", ProductoPosterior: "xx", InicioReal: new Date(2015, 6, 20), FinReal: new Date(2015, 6, 20), Duracion: "xxx", InicioEstimado: "16/07/2015 12:30:15", FinEstimado: "09/08/2015 12:30:15", DuracionEstimada: "xxx" }
                    ],
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "OrdId",
                            fields: {
                                OrdId: { type: "number", editable: false, nullable: false },
                                Linea: { type: "string" },
                                OC: { type: "number" },
                                Estado: { type: "string" },
                                WOAnt: { type: "string" },
                                ProductoAnterior: { type: "string" },
                                WOPos: { type: "string" },
                                ProductoPosterior: { type: "string" },
                                InicioReal: { type: "date" },
                                FinReal: { type: "date" },
                                Duracion: { type: "string" },
                                InicioEstimado: { type: "date" },
                                FinEstimado: { type: "date" },
                                DuracionEstimada: { type: "string" }
                            }
                        }
                    }
                },
                filterable: {
                    extra: false,
                    messages: window.app.cfgKendo.configuracionFiltros_Msg,
                    operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                },
                groupable: false,
                resizable: true,
                detailTemplate: kendo.template(this.$("#template").html()),
                detailInit: this.detailInit,
                detailExpand: function (e) {
                    this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                },
                sortable: true,
                pageable: {
                    refresh: true,
                    pageSizes: [50, 100, 200],
                    pageSizes: true,
                    buttonCount: 5,
                    messages: window.app.cfgKendo.configuracionPaginado_Msg
                },
                columns: [
                         {
                            field: "Linea", title: window.app.idioma.t("LINEA"), width: 80,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#=Linea#</label></div>";
                                    }
                                }
                            }
                        },
                        { field: "OC", title: window.app.idioma.t("OC"), width: 40, filterable: false },
                        {
                            field: "Estado", title: window.app.idioma.t("ESTADO"), width: 80,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Estado#' style='width: 14px;height:14px;margin-right:5px;'/>#=Estado#</label></div>";
                                    }
                                }
                            }
                        },
                        { field: "WOAnt", title: window.app.idioma.t("WO_ANTERIOR"), width: 80, filterable: false },
                        {
                            field: "ProductoAnterior", title: window.app.idioma.t("PRODUCTO_ANTERIOR"), width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=ProductoAnterior#' style='width: 14px;height:14px;margin-right:5px;'/>#=ProductoAnterior#</label></div>";
                                    }
                                }
                            }
                        },
                        { field: "WOPos", title: window.app.idioma.t("WO_POSTERIOR"), width: 80, filterable: false },
                        {
                            field: "ProductoPosterior", title: window.app.idioma.t("PRODUCTO_POSTERIOR"), width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=ProductoPosterior#' style='width: 14px;height:14px;margin-right:5px;'/>#=ProductoPosterior#</label></div>";
                                    }
                                }
                            }
                        },
                        { field: "InicioReal", title: window.app.idioma.t("INICIO_REAL"), width: 80, format: "{0:dd/MM/yyyy}", filterable: false },
                        { field: "FinReal", title: window.app.idioma.t("FIN_REAL"), width: 80, format: "{0:dd/MM/yyyy}", filterable: false },
                        { field: "Duracion", title: window.app.idioma.t("DURACION"), width: 80, filterable: false },
                        { field: "InicioEstimado", title: window.app.idioma.t("FECHA_INICIO_ESTIMADA"), width: 95, format: "{0:dd/MM/yyyy}", filterable: false },
                        { field: "FinEstimado", title: window.app.idioma.t("FECHA_FIN_ESTIMADA"), width: 95, format: "{0:dd/MM/yyyy}", filterable: false },
                        { field: "DuracionEstimada", title: window.app.idioma.t("DURACION_ESTIMADA"), width: 105, filterable: false }
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

            //Cargamos combo
            $("#selectEstado").kendoDropDownList();

        },
        events: {
            'click #btnLimpiarFiltros': 'LimpiarFiltroGrid'
        },
        LimpiarFiltroGrid: function () {
            $("form.k-filter-menu button[type='reset']").trigger("click");
        },
        eliminar: function () {
            t// same as this.$el.remove();
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

            var gridElement = $("#gridModOrdenesCambio"),
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

    return gridModOrdenesCambio;
});