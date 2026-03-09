define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/CrearMateriasPrima.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, plantillaCrearNoConformidadWO, VistaDlgConfirm, Not) {
        var vistaCrearMateriaPrima = Backbone.View.extend({
            tagName: 'div',
            id: 'divCrearMateriaPrima',
            opciones: null,
            roles: null,
            window: null,
            crear: null,
            title: null,
            registrosSel: null,
            fecha: null,
            linea: null,
            buscar: false,
            registrosSelData: [],
            registrosDesSelData: [],
            cantidadMateriaPrima: null,
            template: _.template(plantillaCrearNoConformidadWO),
            initialize: function (options) {
                var self = this;
                self.options = options;
                self.title = window.app.idioma.t('ANADIR_MATERIA_PRIMA');

                self.registrosDesSelData = [];
                self.registrosSelData = [];
                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/obtenerMateriasPrimasOrdenesPreparacion/",
                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                            , cache: true
                        }
                    },
                    pageSize: 10,
                    schema: {
                        model: {
                            fields: {
                                'IdMaterial': { type: "string" },
                                'Clase': { type: "string" },
                                'Descripcion': { type: "string" },
                                'Cantidad': { type: "number" }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                });

                this.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());


                self.$("#lblMateriasPrimas").text(window.app.idioma.t('SELECCION_MATERIAS_PRIMAS'));
                var dia = new Date()

                self.$("#btnAceptarAnadirMateriaPrima").kendoButton();
                self.$("#btnCancelarAnadirMateriaPrima").kendoButton();



                self.grid = this.$("#gridCrearMatPrima").kendoGrid({
                    dataSource: self.ds,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    pageable: {
                        refresh: false,
                        pageSizes: [10, 20, 50, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    sortable: true,
                    resizable: true,
                    height: 300,
                    columns: [
                        {
                            title: "",
                            template: function (dataItem) {
                                var name = dataItem.uid;
                                return '<input class="checkbox" type="checkbox" name="' + name + '" style="width: 14px;	height: 14px;" />'
                            },
                            width: 30
                        },
                        {
                            field: "Clase",
                            title: window.app.idioma.t("CLASE"),
                            width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#:Clase#' style='width: 14px;height:14px;margin-right:5px;'/> #: Clase #</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            field: "IdMaterial",
                            title: window.app.idioma.t("REFERENCIA"),
                            width: 120,
                        },
                        {
                            field: "Descripcion",
                            title: window.app.idioma.t("DESCRIPCION"),
                            filterable: false,
                            width: 300,
                        },
                        { field: "Cantidad", title: window.app.idioma.t("CANTIDAD"), width: 80, template: "<input type='text' class='numericTxt' style='width: 80px' id='#=IdMaterial#'></div>" }
                    ],
                    dataBound: function () {
                        $(".checkbox").bind("change", function (e) {
                            var checked = this.checked;
                            row = $(e.target).closest("tr");
                            grid = $("#gridCrearMatPrima").data("kendoGrid");
                            dataItem = grid.dataItem(row);
                            var datos = {};
                            datos.idMaterial = dataItem.IdMaterial;
                            if (checked) {
                                row.addClass("k-state-selected");
                                //var datafound = _.findWhere(self.registrosDesSelData, datos);
                                //index = _.indexOf(self.registrosDesSelData, datafound);
                                //if (index >= 0) {
                                //    self.registrosDesSelData.splice(index, 1);
                                //}

                                self.registrosSelData.push(datos);
                            } else {
                                row.removeClass("k-state-selected");
                                self.registrosDesSelData.push(datos);

                                var datafound = _.findWhere(self.registrosSelData, datos);
                                index = _.indexOf(self.registrosSelData, datafound);
                                if (index >= 0) {
                                    self.registrosSelData.splice(index, 1);
                                }
                            }
                        });

                        var grid = $('#gridCrearMatPrima').data('kendoGrid');

                        grid.tbody.find('input:checkbox').prop("checked", false);
                        grid.tbody.find(">tr").removeClass('k-state-selected');

                        var items = grid.items();

                        var listItems = [];
                        listItems = $.grep(items, function (row) {
                            var dataItem = grid.dataItem(row);
                            return self.registrosSelData.some(function (data) {
                                return data.idMaterial == dataItem.IdMaterial;
                            });
                        });

                        listItems.forEach(function (row, idx) {
                            $(row.cells[0])[0].childNodes[0].checked = true;
                            $(row).closest("tr").addClass("k-state-selected");
                        });

                        var grid = this;
                        $(".numericTxt").each(function () {
                            var row = $(this).closest("tr");
                            var model = grid.dataItem(row);

                            
                            var NumericTxtBoxCantidad = $(this).kendoNumericTextBox({
                                spinners: true,
                                decimals: 2,
                                culture: kendo.culture().name,
                                format: "n2",
                                min: 0,
                                value: model.Cantidad,
                                change: function (e) {
                                    var value = this.value();
                                    row = $('#' + e.sender.element[0].id).closest("tr");
                                    grid = $("#gridCrearMatPrima").data("kendoGrid");
                                    dataItem = grid.dataItem(row);
                                    dataItem.Cantidad = value;

                                    if (value > 0 || self.cantidadMateriaPrima != null) {
                                        self.cantidadMateriaPrima = null;
                                        row.find(".checkbox").prop('checked', true);
                                        row.find(".checkbox").trigger("change");
                                    } else {
                                        row.find(".checkbox").prop('checked', false);
                                        row.find(".checkbox").trigger("change");
                                    }
                                },
                                spin: function (e) {
                                    var value = this.value();
                                    row = $('#' + e.sender.element[0].id).closest("tr");
                                    grid = $("#gridCrearMatPrima").data("kendoGrid");
                                    dataItem = grid.dataItem(row);
                                    dataItem.Cantidad = value;

                                    if (value > 0) {
                                        row.find(".checkbox").prop('checked', true);
                                        row.find(".checkbox").trigger("change");
                                    } else {
                                        row.find(".checkbox").prop('checked', false);
                                        row.find(".checkbox").trigger("change");
                                    }
                                }
                            }).data("kendoNumericTextBox");

                            var listItemsPrev = [];
                            listItemsPrev = $.grep(self.options.datos, function (item) {
                                return model.IdMaterial == item.IdMaterial;
                            });
                            if (listItemsPrev.length > 0) {
                                model.Cantidad = listItemsPrev[0].Cantidad;
                                self.cantidadMateriaPrima = listItemsPrev[0].Cantidad == 0 ? 1 : null;
                                NumericTxtBoxCantidad.value(model.Cantidad);
                                NumericTxtBoxCantidad.trigger("change");
                            }
                        });
                    }
                }).data("kendoGrid");



                self.window = $(self.el).kendoWindow(
                {
                    title: self.title,
                    width: "850px",
                    // height: "700px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    scrollable: false,
                    actions: []
                }).data("kendoWindow");

                self.dialog = $('#divCrearMateriaPrima').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            events: {
                'click #btnAceptarAnadirMateriaPrima': 'aceptar',
                'click #btnCancelarAnadirMateriaPrima': 'cancelar',
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
            }, aceptar: function (e) {
                e.preventDefault();

                var self = this;

                var datos = [];
                var dataSource = $("#gridCrearMatPrima").data("kendoGrid").dataSource;
                //var filters = dataSource.filter();
                var allData = dataSource.data();
                // var query = new kendo.data.Query(allData);
                //var dataFiltered = query.filter(filters).data;

                var datosSel = $.map(allData, function (data, i) {
                    var datos = {};
                    datos.idMaterial = data.IdMaterial;
                    if (_.findWhere(self.registrosSelData, datos)) {
                        var materiaPrima = {}
                        materiaPrima.Clase = data.Clase;
                        materiaPrima.IdMaterial = data.IdMaterial;
                        materiaPrima.Descripcion = data.Descripcion;
                        materiaPrima.Cantidad = data.Cantidad;
                        return materiaPrima;
                    }
                });

                var datosDesSel = $.map(allData, function (data, i) {
                    var datos = {};
                    datos.idMaterial = data.IdMaterial;
                    if (_.findWhere(self.registrosDesSelData, datos)) {
                        var materiaPrima = {}
                        materiaPrima.Clase = data.Clase;
                        materiaPrima.IdMaterial = data.IdMaterial;
                        materiaPrima.Descripcion = data.Descripcion;
                        materiaPrima.Cantidad = data.Cantidad;
                        return materiaPrima;
                    }
                });

                if (datosSel.length > 0 || datosDesSel.length > 0) {
                    self.options.funcion(datosSel, datosDesSel);
                }
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
            }
        });

        return vistaCrearMateriaPrima;
    });