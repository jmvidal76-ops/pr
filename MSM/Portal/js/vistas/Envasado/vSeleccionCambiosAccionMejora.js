define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/SeleccionAccionMejora.html'],
    function (_, Backbone, $, SeleccionCambiosAccionMejora) {
        var VistaSeleccionCambiosAccionMejora = Backbone.View.extend({
            tagName: 'div',
            id: 'dlgSeleccionCambiosAccionMejora',
            checkedIds: [],
            checkedRows: [],
            dialog: null,
            linea: null,
            fechaTurno: null,
            idTipoTurno: null,
            template: _.template(SeleccionCambiosAccionMejora),
            initialize: function (nombreLinea, fechaTurno, idTipoTurno) {
                var self = this;
                self.checkedIds = [];
                self.checkedRows = [];

                self.linea = nombreLinea;
                self.fechaTurno = fechaTurno;
                self.idTipoTurno = idTipoTurno;

                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                this.$("#gridSeleccion").kendoGrid({
                    dataSource: {
                        pageSize: 50,
                        transport: {
                            read: {
                                url: "../api/GetAccionesMejoraCambios/",
                                type: "POST",
                                contentType: "application/json; charset=utf-8",
                                dataType: "json"
                            },
                            parameterMap: function (options, operation) {
                                if (operation === "read") {
                                    var result = {};
                                    result.linea = self.linea;
                                    result.fechaTurno = self.fechaTurno;
                                    result.idTipoTurno = self.idTipoTurno;

                                    return JSON.stringify(result);
                                }

                                return kendo.stringify(options);
                            }
                        },
                        schema: {
                            model: {
                                id: "Id",
                                fields: {
                                    Id: { type: "string", editable: false, nullable: false },
                                    IdLinea: {type: "string"},
                                    Linea: { type: "number" },
                                    TipoTurnoId: { type: "string" },
                                    TipoTurno: { type: "string" },
                                    FechaTurno: { type: "date" },
                                    InicioReal: { type: "date" },
                                    IDProductoEntrante : {type: "string"},
                                    ProductoEntrante: { type: "string" },
                                    IDProductoSaliente: { type: "string"},
                                    ProductoSaliente: { type: "string" },
                                    MinutosFinal1: { type: "number" },
                                    MinutosFinal2: { type: "number" },
                                    MinutosObjetivo1: { type: "number" },
                                    MinutosObjetivo2: { type: "number" },
                                    NumLineaDescripcion: { type: "string" },
                                },
                                getProductoEntrante: function () {
                                    if (this.IDProductoEntrante) {
                                        return this.IDProductoEntrante + " - " + this.ProductoEntrante;
                                    } else {
                                        return '';
                                    }
                                },
                                getProductoSaliente: function () {
                                    if (this.IDProductoSaliente) {
                                        return this.IDProductoSaliente + " - " + this.ProductoSaliente;
                                    } else {
                                        return '';
                                    }
                                }
                            }
                        },
                        error: function (e) {
                            if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            }
                        },
                        sort: { field: "Linea", dir: "asc" }
                    },
                    toolbar: [
                      {
                          template: "<div><div style='float: left;padding: 5px 5px 5px 35px; font-weight: bold;'><input type='checkbox' id='cbSeleccionarTodos' /> " + window.app.idioma.t('SELECCIONAR_TODOS') + "</div><div style='float:right;'><button type='button' id='btnLimpiarFiltros' class='k-button k-button-icontext' style:'float:right;'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button></div></div>"
                      },
                    ],
                    height: "95%",
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
                        pageSizes: [50, 100, 200],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            title: "",
                            template: '<input class="checkbox" type="checkbox"  style="width: 12px;	height: 12px" />',
                            width: 60
                        },
                        {
                            field: "Linea",
                            title: window.app.idioma.t("LINEA"),
                            template: "#: window.app.idioma.t('LINEA') # #: NumLineaDescripcion # - #: DescripcionLinea #",
                            width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#: window.app.idioma.t('LINEA') # #: NumLineaDescripcion # - #: DescripcionLinea #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "TipoTurno",
                            title: window.app.idioma.t("TIPO_TURNO"),
                            width: 100,
                            template: "#if(TipoTurnoId){# #: window.app.idioma.t('TURNO'+TipoTurnoId) # #}#",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=TipoTurno#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t('TURNO'+TipoTurnoId)#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "FechaTurno", title: window.app.idioma.t("FECHA_TURNO"), width: 100,
                            format: "{0:dd/MM/yyyy}",
                            filterable: {
                                extra:true,
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "InicioReal", title: window.app.idioma.t("INICIO_REAL"), width: 100,
                            format: "{0:dd/MM/yyyy HH:mm:ss}",
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: "dd/MM/yyyy HH:mm:ss",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "getProductoEntrante()",
                            title: window.app.idioma.t("PRODUCTO_ENTRANTE"),
                            //template: "#= IDProductoEntrante # - #= ProductoEntrante #",
                            width: 100,
                            filterable: true,
                        },
                        {
                            field: "getProductoSaliente()",
                            title: window.app.idioma.t("PRODUCTO_SALIENTE"),
                            //template: "#= IDProductoSaliente # - #= ProductoSaliente #",
                            width: 100,
                            filterable: true,
                        },
                        {
                            field: "MinutosFinal1",
                            title: window.app.idioma.t("DURACION") + " 1",
                            width: 100,
                            //template: ' #=  window.app.getDateFormat(MinutosFinal1 * 60) #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        {
                            field: "MinutosFinal2",
                            title: window.app.idioma.t("DURACION") + " 2",
                            width: 100,
                            //template: ' #=  window.app.getDateFormat(MinutosFinal2 * 60) #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        {
                            field: "MinutosObjetivo1",
                            title: window.app.idioma.t("TIEMPO_OBJETIVO") + " 1",
                            width: 100,
                            //template: ' #=  window.app.getDateFormat(MinutosObjetivo1 * 60) #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        {
                            field: "MinutosObjetivo2",
                            title: window.app.idioma.t("TIEMPO_OBJETIVO") + " 2",
                            width: 100,
                            //template: ' #=  window.app.getDateFormat(MinutosObjetivo2 * 60) #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        }
                    ],
                    dataBound: function (e) {
                        var view = this.dataSource.view();
                        for (var i = 0; i < view.length; i++) {
                            if (self.checkedIds[view[i].id]) {
                                this.tbody.find("tr[data-uid='" + view[i].uid + "']")
                                .addClass("k-state-selected")
                                .find(".checkbox")
                                .attr("checked", "checked");
                            }
                        }
                    },
                });

                this.$("#gridSeleccion").data("kendoGrid").table.on("click", ".checkbox", function () {
                    var checked = this.checked,
                    row = $(this).closest("tr"),
                    grid = $("#gridSeleccion").data("kendoGrid"),
                    dataItem = grid.dataItem(row);

                    self.checkedIds[dataItem.id] = checked;
                
                    if (checked) {
                        //-select the row
                        row.addClass("k-state-selected");                    
                        self.checkedRows.push(dataItem);
                    } else {
                        //-remove selection
                        row.removeClass("k-state-selected");
                        for (i = 0; i < self.checkedRows.length; i++) {
                            if (self.checkedRows[i].id == dataItem.id) {
                                self.checkedRows.splice(i,1);
                            }
                        }
                    }
                });

                $(this.el).kendoWindow({
                    title: window.app.idioma.t('SELECCIÓN_DE_CAMBIOS'),
                    width: "90%",
                    height: "90%",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    scrollable: false,
                    actions: []
                });

                this.dialog = $('#dlgSeleccionCambiosAccionMejora').data("kendoWindow");
                this.dialog.center();
            },
            events: {           
                'click #btnGuardarAccionMejora': 'GuardarAccionMejora',
                'click #btnCancelarAccionMejora': 'CancelarAccionMejora',
                'change #cbSeleccionarTodos': 'SeleccionarTodos',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
            },
            SeleccionarTodos: function () {
                var self = this;
                var seleccionarTodos = $("#cbSeleccionarTodos").prop("checked");

                var grid = $('#gridSeleccion').data('kendoGrid');
                self.checkedIds = [];
                self.checkedRows = [];
                if (seleccionarTodos) {
                    $.each(grid.dataSource.view(), function (index, value) {
                        self.checkedIds[value.id] = true;
                        self.checkedRows.push(value);
                    });
                }
                grid.refresh();
            },
            GuardarAccionMejora: function () {            
                Backbone.trigger('eventCambiosSeleccionados', this.checkedRows);
                this.dialog.close();
                this.eliminar();
            },
            CancelarAccionMejora: function () {
                this.dialog.close();
                this.eliminar();
            },
            LimpiarFiltroGrid: function () {
                //var self = this;
                //$("#gridSeleccion").data("kendoGrid").dataSource.filter(self.filtros);
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
            }
    });

    return VistaSeleccionCambiosAccionMejora;
});