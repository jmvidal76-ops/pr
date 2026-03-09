define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/vpAsociarDisparadorTransferencia.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, Session) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            tagName: 'div',
            id: 'divAsociarDisparadorTransferencia',
            PlantillaSeleccionada: {},
            dsDisparadorPlantillasTransferencia: null,
            disparadoresPlantilla: null,
            window: null,
            dialog: null,
            //#endregion ATTRIBUTES

            initialize: function (plantilla,dataSouceGrid) {
                var self = this;

                self.PlantillaSeleccionada = plantilla;
                self.dsDisparadorPlantillasTransferencia = new kendo.data.DataSource({
                    async: true,
                    autoBind: true,
                    transport: {
                        read: {
                            url: dataSouceGrid.transport.options.read.url,
                            dataType: "json"
                        },
                        create: {
                            url: "../api/disparadorPlantillasTransferencia/Create",
                            dataType: "json",
                            type: "POST",
                            contentType: "application/json; charset=utf-8",
                        },
                        update: {
                            url: "../api/disparadorPlantillasTransferencia/Update",
                            dataType: "json",
                            type: "PUT",
                            contentType: "application/json; charset=utf-8",
                        },
                        destroy: {
                            url: "../api/disparadorPlantillasTransferencia/Delete",
                            dataType: "json",
                            type: "DELETE",
                            contentType: "application/json; charset=utf-8",
                        },
                        parameterMap: function (options, operation) {
                            if (operation != "read") {
                                options.IdPlantillaConsumo = self.PlantillaSeleccionada.IdPlantilla;
                                return JSON.stringify(options);
                            }
                        },
                    },
                    requestEnd: function (e) {
                        if (e.type == "destroy" || e.type == "create" || e.type == "update") {
                            $("#contentDisparadorPlantillaTransferencia").data("kendoGrid").dataSource.read();
                            self.dsDisparadorPlantillasTransferencia.read();
                        }
                    },
                    sort: { field: "NombrePrefijo", dir: "asc" },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "IdDisparadorTransferencia",
                            fields: {
                                'IdDisparadorTransferencia': { type: "number" },
                                'IdPrefijoLoteSAI': { type: "number" },
                                'IdMaterialSAI': { type: "number" },
                                'IdUbicacionOrigen': {
                                    type: "number", validation: {
                                        required: true,
                                        IdUbicacionOrigenvalidation: function (input) {
                                            if (input.is("[name='IdUbicacionOrigen']")) {
                                                var row = input.closest("tr");
                                                var grid = row.closest("[data-role=grid]").data("kendoGrid");
                                                var dataItem = grid.dataItem(row);


                                                if (input.val() == "" && (!dataItem.IdUbicacionDestino || dataItem.IdUbicacionDestino == 0)) {
                                                    input.attr("data-IdUbicacionOrigenvalidation-msg", window.app.idioma.t('UBICACION_ORIGEN_DESTINO_REQUERIDA'));
                                                    dataItem.IdUbicacionOrigen = input.val();
                                                    return false;
                                                }
                                            }
                                            return true;
                                        }
                                    } },
                                'IdUbicacionDestino': {
                                    type: "number", validation: {
                                        required: true,
                                        IdUbicacionDestinovalidation: function (input) {
                                            if (input.is("[name='IdUbicacionDestino']")) {
                                                var row = input.closest("tr");
                                                var grid = row.closest("[data-role=grid]").data("kendoGrid");
                                                var dataItem = grid.dataItem(row);


                                                if (input.val() == "" && (!dataItem.IdUbicacionOrigen || dataItem.IdUbicacionOrigen == 0)) {
                                                    input.attr("data-IdUbicacionDestinovalidation-msg", window.app.idioma.t('UBICACION_ORIGEN_DESTINO_REQUERIDA'));
                                                    dataItem.IdUbicacionDestino = input.val();
                                                    return false;
                                                }
                                            }
                                            return true;
                                        }
                                    } },
                                'NombreUbicacionOrigen': { type: "string" },
                                'NombreUbicacionDestino': { type: "string" },
                                'NombrePrefijo': { type: "string" },
                                'NombreMaterial': { type: "string" },
                            }
                        }
                    }
                });

                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.window = $(self.el).kendoWindow(
                    {
                        title: window.app.idioma.t('PLANTILLA_SELECCIONADA') + ": " + self.PlantillaSeleccionada.Descripcion,
                        width: "60%",
                        height: "80%",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: ["Close"],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                self.dialog = $('#divAsociarDisparadorTransferencia').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                $("#gridAsociarDisparadorTransferencia").kendoGrid({
                    toolbar: [
                        {
                            template: "<label>" + window.app.idioma.t('DISPARADORES_TRANSFERENCIA') + "</label>"
                        },
                        {
                            name: "create", text: window.app.idioma.t("AGREGAR")
                        }
                    ],
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    dataSource: self.dsDisparadorPlantillasTransferencia,
                    sortable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [200, 500, 1000],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            title: window.app.idioma.t("PREFIJO_LOTE_SAI"),
                            field: 'IdPrefijoLoteSAI',
                            attributes: { "align": "center" },
                            width: "20%",
                            template: "#: NombrePrefijo #",
                            editor: function (e, options) { return self.PrefijoLoteSAIDropDownEditor(e, options) },
                        },
                        {
                            title: window.app.idioma.t("MATERIAL_SAI"),
                            field: 'IdMaterialSAI',
                            attributes: { "align": "center" },
                            width: "20%",
                            template: "#: NombreMaterial #",
                            editor: function (e, options) { return self.MaterialSAIDropDownEditor(e, options) },
                        },
                        {
                            title: window.app.idioma.t("UBICACION_ORIGEN"),
                            field: 'IdUbicacionOrigen',
                            attributes: { "align": "center" },
                            width: "20%",
                            template: "#: NombreUbicacionOrigen != null ? NombreUbicacionOrigen : '' #",
                            editor: function (e, options) { return self.UbicacionOrigenDropDownEditor(e, options) },
                        },
                        {
                            title: window.app.idioma.t("UBICACION_DESTINO"),
                            field: 'IdUbicacionDestino',
                            attributes: { "align": "center" },
                            width: "20%",
                            template: "#: NombreUbicacionDestino != null ? NombreUbicacionDestino : '' #",
                            editor: function (e, options) { return self.UbicacionDestinoDropDownEditor(e, options) },
                        },
                        {
                            command: [
                                {
                                    name: "edit",
                                    text: { edit: "", update: window.app.idioma.t('GUARDAR'), cancel: window.app.idioma.t('CANCELAR') }
                                },
                                //{ name: "destroy", text: "Eliminar" }
                                {
                                    name: "Delete", text: window.app.idioma.t('ELIMINAR'),
                                    click: function (e) {  //add a click event listener on the delete button
                                        e.preventDefault(); //prevent page scroll reset

                                        var grid = $("#gridAsociarDisparadorTransferencia").data("kendoGrid");
                                        var tr = $(e.target).closest("tr"); //get the row for deletion
                                        var data = this.dataItem(tr); //get the row data so it can be referred later

                                        this.confirmacion = new VistaDlgConfirm({
                                            titulo: window.app.idioma.t('ELIMINAR_DISPARADOR_TRANSFERENCIA'), msg: window.app.idioma.t('DESEA_REALMENTE_ELIMINAR_DISPARADOR_TRANSFERENCIA'), funcion: function () {
                                                grid.dataSource.remove(data)  //prepare a "destroy" request
                                                grid.dataSource.sync()  //actually send the request (might be ommited if the autoSync option is enabled in the dataSource)
                                                Backbone.trigger('eventCierraDialogo');
                                            }, contexto: this
                                        });
                                    }
                                },
                            ],
                            title: "&nbsp;",
                            width: "15%"
                        }


                    ],
                    dataBound: function () {
                    },
                    editable: {
                        mode: "inline"
                    }
                });
            },

            //#region EVENTOS
            events: {
            },
            //#endregion EVENTOS

            PrefijoLoteSAIDropDownEditor: function (container, options) {
                var self = this;
                $('<input data-text-field="Nombre" id="prefijoLoteSAIDropDownEditor" required data-value-field="IdPrefijoLote" name="' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        filter: "contains",
                        optionLabel: window.app.idioma.t("SELECCIONE_PREFIJO_LOTE_SAI"),
                        dataSource: {

                            transport: {
                                read: {
                                    url: "../api/plantillaConsumoMMPP/ObtenerPrefijosLoteSAI",
                                    dataType: "json"
                                }
                            },
                            sort: { field: "Nombre", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdPrefijoLote",
                                    fields: {
                                        'IdPrefijoLote': { type: "number" },
                                        'Nombre': { type: "string" }
                                    }
                                }
                            }
                        },
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },

                    });
                $('<span class="k-invalid-msg" data-for="' + options.field + '"></span>').appendTo(container);
                var cmb = $("#prefijoLoteSAIDropDownEditor").data("kendoDropDownList");
                cmb.list.width("auto");
            },
            MaterialSAIDropDownEditor: function (container, options) {
                var self = this;
                $('<input data-text-field="Nombre" id="MaterialSAIDropDownEditor" required data-value-field="IdMaterialSAI" name="' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        filter: "contains",
                        optionLabel: window.app.idioma.t("SELECCIONE_MATERIAL_SAI"),
                        dataSource: {

                            transport: {
                                read: {
                                    url: "../api/plantillaConsumoMMPP/ObtenerMaterialSAI",
                                    dataType: "json"
                                }
                            },
                            sort: { field: "Nombre", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdMaterialSAI",
                                    fields: {
                                        'IdMaterialSAI': { type: "number" },
                                        'Nombre': { type: "string" }
                                    }
                                }
                            }
                        },
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },

                    });
                $('<span class="k-invalid-msg" data-for="' + options.field + '"></span>').appendTo(container);
                var cmb = $("#MaterialSAIDropDownEditor").data("kendoDropDownList");
                cmb.list.width("auto");
            },
            UbicacionOrigenDropDownEditor: function (container, options) {
                var self = this;
                $('<input data-text-field="Nombre" id="ubicacionOrigenDisparadorDropDownEditor" data-value-field="IdUbicacion" name="' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        filter: "contains",
                        optionLabel: window.app.idioma.t("SELECCIONE_UBICACION_ORIGEN"),
                        dataSource: {
                            transport: {
                                read: {
                                    url: "../api/ObtenerEquiposMES",
                                    dataType: "json",
                                    contentType: "application/json; charset=utf-8",
                                    type: "GET"
                                }
                            },
                            pageSize: 200,
                            sort: { field: "Nombre", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdUbicacion",
                                    fields: {
                                        'IdUbicacion': { type: "number" },
                                        'Nombre': { type: "string" },
                                        'Descripcion': { type: "string" }
                                    }
                                }

                            }
                        },
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },

                    });
                $('<span class="k-invalid-msg" data-for="' + options.field + '"></span>').appendTo(container);
                var cmb = $("#ubicacionOrigenDisparadorDropDownEditor").data("kendoDropDownList");
                cmb.list.width("auto");
            },
            UbicacionDestinoDropDownEditor: function (container, options) {
                var self = this;
                $('<input data-text-field="Nombre" id="ubicacionDestinoDisparadorDropDownEditor" data-value-field="IdUbicacion" name="' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        filter: "contains",
                        optionLabel: window.app.idioma.t("SELECCIONE_UBICACION_DESTINO"),
                        dataSource: {
                            transport: {
                                read: {
                                    url: "../api/ObtenerEquiposMES",
                                    dataType: "json",
                                    contentType: "application/json; charset=utf-8",
                                    type: "GET"
                                }
                            },
                            pageSize: 200,
                            sort: { field: "Nombre", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdUbicacion",
                                    fields: {
                                        'IdUbicacion': { type: "number" },
                                        'Nombre': { type: "string" },
                                        'Descripcion': { type: "string" }
                                    }
                                }

                            }
                        },
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },

                    });
                $('<span class="k-invalid-msg" data-for="' + options.field + '"></span>').appendTo(container);
                var cmb = $("#ubicacionDestinoDisparadorDropDownEditor").data("kendoDropDownList");
                cmb.list.width("auto");
            },

            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

