define(['underscore', 'backbone', 'jquery', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion','vistas/Fabricacion/vPlantillasConsumosMMPP_AsociarDisparadorTransferencia'],
    function (_, Backbone, $, Not, VistaDlgConfirm, Session,vAsociarDisparadorTransferencia) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            dsDisparadorPlantillasTransferencia: null,
            idGrid: null,
            //#endregion ATTRIBUTES

            initialize: function (id) {
                var self = this;
                self.idGrid = id;
                self.dsDisparadorPlantillasTransferencia = new kendo.data.DataSource({
                    async: true,
                    autoBind: true,
                    transport: {
                        read: {
                            url: "../api/disparadorPlantillasTransferencia/-1",
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
                    },
                    sort: { field: "NombrePrefijo", dir: "asc" },
                    schema: {
                        model: {
                            id: "IdDisparadorTransferencia",
                            fields: {
                                'IdDisparadorTransferencia': { type: "number" },
                                'IdPrefijoLoteSAI': { type: "number" },
                                'IdMaterialSAI': { type: "number" },
                                'IdUbicacionOrigen': { type: "number" },
                                'IdUbicacionDestino': { type: "number" },
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


                $("#" + self.idGrid).kendoGrid({
                    dataSource: self.dsDisparadorPlantillasTransferencia,
                    sortable: true,
                    scrollable: true,
                    selectable: "row",
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    change: function (e) {
                        e.preventDefault();
                        //self.seleccionaAlmacen(e, self);
                    },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    toolbar: [
                        {
                            template: "<label>" + window.app.idioma.t('DISPARADORES_TRANSFERENCIA') + "</label>"
                        },
                        {
                            template: "<button id='btnAsociarDisparadorTransferencia' style='display:none' class='k-button k-AsociarUbicacion' onclick='asociarDisparadoresTransferencias()'>" + window.app.idioma.t("ASOCIAR_DESASOCIAR") + "</button>"
                        }
                    ],
                    dataBound: function () {
                        asociarDisparadoresTransferencias = self.asociarDisparadoresTransferencias;
                    },
                    columns: [
                        {
                            title: window.app.idioma.t("PREFIJO_LOTE_SAI"),
                            field: 'IdPrefijoLoteSAI',
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            width: "20%",
                            template: "<span class='addTooltip'>#= NombrePrefijo #</span>",
                        },
                        {
                            title: window.app.idioma.t("MATERIAL_SAI"),
                            field: 'IdMaterialSAI',
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            width: "20%",
                            template: "<span class='addTooltip'>#= NombreMaterial #</span>",
                        },
                        {
                            title: window.app.idioma.t("UBICACION_ORIGEN"),
                            field: 'IdUbicacionOrigen',
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            width: "20%",
                            template: "<span class='addTooltip'>#= NombreUbicacionOrigen != null ? NombreUbicacionOrigen : '' #</span>",
                        },
                        {
                            title: window.app.idioma.t("UBICACION_DESTINO"),
                            field: 'IdUbicacionDestino',
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            width: "20%",
                            template: "<span class='addTooltip'>#= NombreUbicacionDestino != null ? NombreUbicacionDestino : '' #</span>",
                        },
                       
                    ],
                    editable: {
                        mode: "inline"
                    }
                });

                $("#" + self.idGrid).kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

            },

            //#region EVENTOS
            events: {
                
            },
            //#endregion EVENTOS
            
            asociarDisparadoresTransferencias: function () {
                var gridPlantillas = $("#gridPlantillasConsumosMMPP").data("kendoGrid");
                var plantillaSeleccionada = gridPlantillas.select();
                if (plantillaSeleccionada.length > 0) {
                    var selectedItem = gridPlantillas.dataItem(plantillaSeleccionada);
                    var plantilla = {
                        IdPlantilla: selectedItem.IdPlantillaConsumo,
                        Descripcion: selectedItem.Descripcion
                    };

                    var dataSourceGrid = $("#contentDisparadorPlantillaTransferencia").data("kendoGrid").dataSource;

                    new vAsociarDisparadorTransferencia(plantilla, dataSourceGrid);
                }
                
            },

            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

