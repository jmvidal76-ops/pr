define(['underscore', 'backbone', 'jquery', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion', 'vistas/Fabricacion/vPlantillasConsumosMMPP_AsociarTipoSemielaborado'],
    function (_, Backbone, $, Not, VistaDlgConfirm, Session,vAsociarTipoSemielaborado) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            dsTipoSemielaboradosPlantillas: null,
            idGrid: null,
            //#endregion ATTRIBUTES

            initialize: function (id) {
                var self = this;
                self.idGrid = id;
                self.dsTipoSemielaboradosPlantillas = new kendo.data.DataSource({
                    async: true,
                    autoBind: true,
                    transport: {
                        read: {
                            url: "../api/tipoSemielaboradosPlantillaConsumo/-1",
                            dataType: "json"
                        },
                        update: {
                            url: "../api/tipoSemielaboradosPlantillaConsumo",
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_ACTUALIZANDO_TIPO_SEMI"), 4000);
                                } else if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('TIPO_SEMI_ACTUALIZADO_CORRECTAMENTE'), 4000);
                                }
                            },
                        },
                    },
                    sort: { field: "Descripcion", dir: "asc" },
                    schema: {
                        model: {
                            id: "IdPlantillaTipo",
                            fields: {
                                'IdPlantillaTipo': { type: "number", editable: false },
                                'IdMaterial': { type: "string",editable: false },
                                'Clase': { type: "string", editable: false },
                                'DescClase': { type: "string", editable: false },
                                'DescMaterial': { type: "string", editable: false },
                                'TipoMaterial': { type: "string", editable: false },
                                'Cantidad': { type: "number" }
                            }
                        }
                    }
                });
                self.render();
            },
            render: function () {
                var self = this;


                $("#" + self.idGrid).kendoGrid({
                    dataSource: self.dsTipoSemielaboradosPlantillas,
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
                            template: "<label>" + window.app.idioma.t('TIPOS_SEMIELABORADOS') + "</label>"
                        },
                        {
                            template: "<button id='btnAsociarAsociarTipos' class='k-button k-AsociarUbicacion' onclick='asociarTipos()'>" + window.app.idioma.t("ASOCIAR_DESASOCIAR_TIPOS_SEMIELABORADOS") + "</button>"
                        },
                        {
                            template: "<button id='btnGuardarCantidadSemielaborado' class='k-button k-AsociarUbicacion' onclick='guardarCantidad()'>" + window.app.idioma.t("GUARDAR") + "</button>"
                        }
                    ],
                    dataBound: function () {
                        asociarTipos = self.asociarTipos;
                        guardarCantidad = self.guardarCantidad;
                    },
                    columns: [
                        {
                            title: window.app.idioma.t("CLASE"),
                            field: 'Clase',
                            template: "<span class='addTooltip'>#=Clase#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 100
                        },
                        {
                            title: window.app.idioma.t("DESCRIPCION"),
                            field: 'DescClase',
                            template: "<span class='addTooltip'>#=DescClase#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },
                        {
                            title: window.app.idioma.t("DESCRIPCION"),
                            field: 'DescMaterial',
                            template: "<span class='addTooltip'>#=DescMaterial#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 250
                        },
                        {
                            title: window.app.idioma.t("TIPO_MATERIAL"),
                            field: 'TipoMaterial',
                            template: "<span class='addTooltip'>#=TipoMaterial#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 100
                        },
                        {
                            title: window.app.idioma.t("MATERIAL"),
                            field: 'IdMaterial',
                            template: "<span class='addTooltip'>#=IdMaterial#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 100
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD"),
                            field: 'Cantidad',
                            template: "<span class='addTooltip'>#=Cantidad ? Cantidad : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 100
                        }
                    ],
                    editable: true
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

            asociarTipos: function () {
                var gridPlantillas = $("#gridPlantillasConsumosMMPP").data("kendoGrid");
                var plantillaSeleccionada = gridPlantillas.select();
                if (plantillaSeleccionada.length > 0) {
                    var selectedItem = gridPlantillas.dataItem(plantillaSeleccionada);
                    var plantilla = {
                        IdPlantilla: selectedItem.IdPlantillaConsumo,
                        Descripcion: selectedItem.Descripcion
                    };

                    var grid = $("#contentTipoSemielaboradoPlantillas").data("kendoGrid").dataItems();
                    var listIdMateriales = grid.map(item => item.IdMaterial);

                    new vAsociarTipoSemielaborado(plantilla, listIdMateriales);
                }
                
            },

            guardarCantidad: function () {
                var grid = $("#contentTipoSemielaboradoPlantillas").data("kendoGrid");
                grid.saveChanges();
            },

            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

