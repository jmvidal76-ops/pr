define(['underscore', 'backbone', 'jquery', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion','vistas/Fabricacion/vPlantillasConsumosMMPP_AsociarDisparadorKOP'],
    function (_, Backbone, $, Not, VistaDlgConfirm, Session,vAsociarDisparadorKOP) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            dsDisparadorPlantillasKOP: null,
            idGrid: null,
            //#endregion ATTRIBUTES

            initialize: function (id) {
                var self = this;
                self.idGrid = id;
                self.dsDisparadorPlantillasKOP = new kendo.data.DataSource({
                    async: true,
                    autoBind: true,
                    transport: {
                        read: {
                            url: "../api/disparadorPlantillasKOP/-1",
                            dataType: "json"
                        },
                    },
                    sort: { field: "CodKOP", dir: "asc" },
                    schema: {
                        model: {
                            id: "IdMaestroKOP",
                            fields: {
                                'IdMaestroKOP': { type: "number" },
                                'CodKOP': { type: "string" },
                                'DescKOP': { type: "string" }
                            }
                        }
                    }
                });
                self.render();
            },
            render: function () {
                var self = this;


                $("#" + self.idGrid).kendoGrid({
                    dataSource: self.dsDisparadorPlantillasKOP,
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
                            template: "<label>" + window.app.idioma.t('DISPARADORES_KOPS') + "</label>"
                        },
                        {
                            template: "<button id='btnAsociarDisparadorKOP' style='display:none' class='k-button k-AsociarUbicacion' onclick='asociarDisparadores()'>" + window.app.idioma.t("ASOCIAR_DESASOCIAR") + "</button>"
                        }
                    ],
                    dataBound: function () {
                        asociarDisparadores = self.asociarDisparadores;
                    },
                    columns: [
                        {
                            title: window.app.idioma.t("NOMBRE"),
                            field: 'CodKOP',
                            template: "<span class='addTooltip'>#=CodKOP#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            width: "40%"
                        },
                        {
                            title: window.app.idioma.t("DESCRIPCION"),
                            field: 'DescKOP',
                            template: "<span class='addTooltip'>#=DescKOP#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            width: "40%"
                        }
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

            asociarDisparadores: function () {
                var gridPlantillas = $("#gridPlantillasConsumosMMPP").data("kendoGrid");
                var plantillaSeleccionada = gridPlantillas.select();
                if (plantillaSeleccionada.length > 0) {
                    var selectedItem = gridPlantillas.dataItem(plantillaSeleccionada);
                    var plantilla = {
                        IdPlantilla: selectedItem.IdPlantillaConsumo,
                        Descripcion: selectedItem.Descripcion
                    };

                    var grid = $("#contentDisparadorPlantillaKOP").data("kendoGrid").dataItems();
                    var listIdUbicaciones = grid.map(item => item.IdMaestroKOP);

                    new vAsociarDisparadorKOP(plantilla, listIdUbicaciones);
                }
                
            },

            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

