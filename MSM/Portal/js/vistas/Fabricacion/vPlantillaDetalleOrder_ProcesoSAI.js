define(['underscore', 'backbone', 'jquery', 'text!../../../CARPETA/html/HTMLCREADO.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion', 'vistas/Fabricacion/vpVerDetalleOrden_ProcesoSAI'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, Session) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;
                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
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
                            template: "<label>" + window.app.idioma.t('SALA_INSTALACION_DESTINO_WO') + "</label>"
                        },
                        {
                            template: "<button class='k-button k-AsociarUbicacion' onclick='asociarUbicaciones()'>" + window.app.idioma.t("ASOCIAR_DESASOCIAR_UBICACIONES") + "</button>"
                        }
                    ],
                    dataBound: function () {
                        asociarProcesoSAI = self.asociarProcesoSAI;
                    },
                    columns: [
                        {
                            title: window.app.idioma.t("NOMBRE"),
                            field: 'Nombre',
                            attributes: { "align": "center" },
                            width: "40%"
                        },
                        {
                            title: window.app.idioma.t("DESCRIPCION"),
                            field: 'Descripcion',
                            attributes: { "align": "center" },
                            width: "40%"
                        }
                    ],
                    editable: {
                        mode: "inline"
                    }
                });

            },

            //#region EVENTOS
            events: {
                
            },
            //#endregion EVENTOS
            asociarProcesoSAI: function () {
                var gridPlantillas = $("#gridPlantillasConsumosMMPP").data("kendoGrid");
                var plantillaSeleccionada = gridPlantillas.select();
                if (plantillaSeleccionada.length > 0) {
                    var selectedItem = gridPlantillas.dataItem(plantillaSeleccionada);
                    var plantilla = {
                        IdPlantilla: selectedItem.IdPlantillaConsumo,
                        Descripcion: selectedItem.Descripcion
                    };

                    var gridUbicaciones = $("#contentUbicacionesPlantillas").data("kendoGrid").dataItems();
                    var listIdUbicaciones = gridUbicaciones.map(item => item.IdUbicacion);

                    new vAsociarUbicacion(plantilla, listIdUbicaciones);
                }

            },

            eliminar: function () {
                this.remove();
            },
            

            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

