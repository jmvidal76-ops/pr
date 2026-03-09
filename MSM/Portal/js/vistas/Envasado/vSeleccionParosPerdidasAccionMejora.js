define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/SeleccionAccionMejora.html'],
    function (_, Backbone, $, SeleccionParosPerdidasAccionMejora) {
        var VistaSeleccionParosPerdidasAccionMejora = Backbone.View.extend({
            tagName: 'div',
            id: 'dlgSeleccionParosPerdidasAccionMejora',
            checkedIds: [],
            checkedRows: [],
            dialog: null,
            linea: null,
            fechaTurno: null,
            idTipoTurno: null,
            template: _.template(SeleccionParosPerdidasAccionMejora),
            initialize: function (nombreLinea, fechaTurno, idTipoTurno) {
                var self = this;
                self.checkedIds = [];
                self.checkedRows = [];

                self.linea = $.grep(window.app.planta.lineas, function (linea, i) {
                    return linea.id == nombreLinea;
                })[0];

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
                                url: "../api/GetParosPerdidasLLenadoraLinea/",
                                type: "POST",
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                async: true
                            },
                            parameterMap: function (options, operation) {
                                if (operation === "read") {
                                    var result = {};
                                    result.numLinea = self.linea.numLinea;
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
                                    Id: { type: "number", editable: false, nullable: false },
                                    TipoParoPerdida: { type: "string" },
                                    EsParoMayor: { type: "number" },
                                    EsParoMenor: { type: "number" },
                                    EsBajaVelocidad: { type: "number" },
                                    IdLinea: { type: "number" },
                                    FechaTurno: { type: "date" },
                                    IdTipoTurno: { type: "string" },
                                    NombreTipoTurno: { type: "string" },
                                    InicioLocal: { type: "date" },
                                    FinLocal: { type: "date" },
                                    EquipoNombre: { type: "string" },
                                    EquipoConstructivoNombre: { type: "string" },
                                    MotivoNombre: { type: "string" },
                                    CausaNombre: { type: "string" },
                                    Descripcion: { type: "string" },
                                    Observaciones: { type: "string" },
                                    Duracion: { type: "date" },
                                    EquipoDescripcion: { type: "string" },
                                    NumeroLineaDescripcion: { type: "string" }
                                }
                            }
                        },
                        error: function (e) {
                            if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            }
                        },
                        sort: { field: "IdLinea", dir: "asc" }
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
                            field: "IdLinea",
                            title: window.app.idioma.t("LINEA"),
                            width: 100,
                            template: window.app.idioma.t("LINEA") + ' #: NumeroLineaDescripcion # - #: DescLinea #',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //return "<div><label><input type='checkbox' style='width: 14px;height:14px;margin-right:5px;'/>h</label></div>";
                                        return "<div><label><input type='checkbox' value='#=IdLinea#' style='width: 14px;height:14px;margin-right:5px;'/>" + window.app.idioma.t('LINEA') + " #= NumeroLineaDescripcion# - #= DescLinea#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "FechaTurno", title: window.app.idioma.t("FECHA_TURNO"), width: 100,
                            format: "{0:dd/MM/yyyy}",
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "IdTipoTurno",
                            template: "#if(IdTipoTurno){# #: window.app.idioma.t('TURNO'+IdTipoTurno) # #}#",
                            title: window.app.idioma.t("TURNO"),
                            width: 100,
                            //template: "#: CodigoMaquina # - #: Maquina #"
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=IdTipoTurno#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t('TURNO'+IdTipoTurno)#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "TipoParoPerdida",
                            title: window.app.idioma.t("TIPO"),
                            width: 100,
                            //template: "#: CodigoMaquina # - #: Maquina #"
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=TipoParoPerdida#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoParoPerdida#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "InicioLocal", title: window.app.idioma.t("HORAINICIO"), width: 100,
                            format: "{0:dd/MM/yyyy HH:mm:ss}",
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: "dd/MM/yyyy HH:mm:ss",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "Duracion",
                            title: window.app.idioma.t("DURACION"),
                            //template: ' #=  window.app.getDateFormat(Duracion) #',
                            width: 100,
                            format: "{0:HH:mm:ss}",
                            filterable: {
                                extra: false,
                                ui: function (element) {
                                    element.kendoTimePicker({
                                        format: "HH:mm:ss",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "EquipoDescripcion",
                            title: window.app.idioma.t("LLENADORA"),
                            width: 100,
                            //template: "#: CodigoMaquina # - #: Maquina #"
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=EquipoDescripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= EquipoDescripcion#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "MotivoNombre",
                            title: window.app.idioma.t("MOTIVO"),
                            width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=MotivoNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= MotivoNombre#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CausaNombre",
                            title: window.app.idioma.t("CAUSA"),
                            width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=CausaNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= CausaNombre#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "MaquinaCausaNombre",
                            title: window.app.idioma.t("MAQUINA_RESPONSABLE"),
                            width: 100,
                            //template: "#: CodigoMaquina # - #: Maquina #"
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=MaquinaCausaNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= MaquinaCausaNombre#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "EquipoConstructivoNombre",
                            title: window.app.idioma.t("EQ_CONSTRUCTIVO"),
                            width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=EquipoConstructivoNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= EquipoConstructivoNombre#</label></div>";
                                    }
                                }
                            }
                            //template: "#: CodEquipoConstructivo # - #: EquipoConstructivo #"
                        },
                        {
                            field: "Descripcion",
                            title: window.app.idioma.t("DESCRIPCION"),
                            width: 100,
                            template: "<span class='addTooltip'>#=Descripcion ? Descripcion : ''#</span>",
                            attributes: {
                                style: 'white-space: nowrap ',
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Descripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= Descripcion#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Observaciones",
                            title: window.app.idioma.t("OBSERVACION"),
                            template: "<span class='addTooltip'>#=Observaciones ? Observaciones : ''#</span>",
                            width: 100,
                            attributes: {
                                style: 'white-space: nowrap ',
                            },
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

                $("#gridSeleccion").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

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
                                self.checkedRows.splice(i, 1);
                            }
                        }
                    }
                });

                $(this.el).kendoWindow({
                    title: window.app.idioma.t("SELECCIONAR_PAROS_PERDIDAS"),
                    width: "90%",
                    height: "90%",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    scrollable: false,
                    actions: []
                });

                this.dialog = $('#dlgSeleccionParosPerdidasAccionMejora').data("kendoWindow");
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
                Backbone.trigger('eventParosSeleccionados', this.checkedRows);
                this.dialog.close();
                this.eliminar();
            },
            CancelarAccionMejora: function () {
                this.dialog.close();
                this.eliminar();
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
            LimpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            }
        });

        return VistaSeleccionParosPerdidasAccionMejora;
    });