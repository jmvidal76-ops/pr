define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/vpAsociarTipoSemielaboradoPlantilla.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, Session) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            tagName: 'div',
            id: 'divAsociarUbicacionZona',
            PlantillaSeleccionada: {},
            TiposSemielaboradosPorPlantilla: null,
            dsTiposSemielaborados: null,
            window: null,
            dialog: null,
            //#endregion ATTRIBUTES

            initialize: function (plantilla, tiposSemielaborados) {
                var self = this;


                self.PlantillaSeleccionada = plantilla;
                self.TiposSemielaboradosPorPlantilla = tiposSemielaborados;

                self.dsTiposSemielaborados = new kendo.data.DataSource({
                    async: true,
                    autoBind: true,
                    transport: {
                        read: {
                            url: "../api/tipoSemielaboradosPlantillaConsumo/0",
                            dataType: "json"
                        },
                    },
                    sort: { field: "Clase", dir: "asc" },
                    pageSize: 200,
                    schema: {
                        model: {
                            id: "IdMaterial",
                            fields: {
                                'IdMaterial': { type: "string" },
                                'Clase': { type: "string" },
                                'DescClase': { type: "string" },
                                'DescMaterial': { type: "string" },
                                'TipoMaterial': { type: "string" }
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

                self.dialog = $('#divAsociarUbicacionZona').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                $("#gridAsociarTipo").kendoGrid({
                    toolbar: kendo.template($("#template").html()),
                    dataSource: self.dsTiposSemielaborados,
                    sortable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [200, 500, 1000,'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            headerTemplate: "<input type='checkbox' onclick='toggleAll(event)' value='Uncheck' id='checkAllEquipos'/>",
                            template: "<input  type='checkbox' id='#=IdMaterial#'  />",
                            width: 50
                        },
                        {
                            title: window.app.idioma.t("MATERIAL"),
                            field: 'IdMaterial',
                            attributes: { "align": "center" },
                            width: 100
                        },
                        {
                            title: window.app.idioma.t("DESCRIPCION"),
                            field: 'DescMaterial',
                            attributes: { "align": "center" },
                            width: 300
                        },
                        {
                            title: window.app.idioma.t("CLASE"),
                            field: 'Clase',
                            attributes: { "align": "center" },
                            width: 50
                        },
                        {
                            title: window.app.idioma.t("DESCRIPCION"),
                            field: 'DescClase',
                            attributes: { "align": "center" },
                            width: 150
                        }
                    ],
                    dataBound: function () {
                        toggleAll = self.toggleAll;
                        reiniciarSeleccion = self.reiniciarSeleccion(self);
                    }
                });
            },
            reiniciarSeleccion: function () {
                self = this;

                var checkButtonValue = $("#checkAllEquipos").val();
                if (checkButtonValue == "Check") {
                    $("#gridAsociarTipo input[type=checkbox]").prop("checked", false).trigger("change");
                    $("#checkAllEquipos").val("Uncheck");
                }

                var grid = $("#gridAsociarTipo").data("kendoGrid");
                var view = grid.dataSource.view();
                grid.items().each(function (index, row) {
                    kendo.bind(row, view[index]);
                    var data = view[index];

                    if (data) {
                        var checkbox = $(row).find("input[type=checkbox]");
                        if (self.TiposSemielaboradosPorPlantilla.indexOf(data.IdMaterial) !== -1) {
                            $(checkbox).prop('checked', true);
                        } else {
                            $(checkbox).prop('checked', false);
                        }
                    }

                });


            },

            //#region EVENTOS
            events: {
                "click #btnReiniciarSeleccion": function () { var self = this; self.reiniciarSeleccion(self); },
                "click #btnAceptar": function () { var self = this; this.guardarTiposSemielaboradosAsociadas(self); }
            },
            //#endregion EVENTOS

            guardarTiposSemielaboradosAsociadas: function (self) {
                var tiposSemiSeleccionados = self.obtenerEquiposSeleccionados();
                const isEqual = (a, b) => JSON.stringify(tiposSemiSeleccionados) === JSON.stringify(self.TiposSemielaboradosPorPlantilla);
                if (!isEqual(tiposSemiSeleccionados, self.TiposSemielaboradosPorPlantilla)) {
                    $("#notificacionAsociarTipoConsumoPlantilla").text("");
                    self.confirmarGuardado(self, tiposSemiSeleccionados);
                }
                else {
                    $("#notificacionAsociarTipoConsumoPlantilla").text(window.app.idioma.t('NO_HAY_CAMBIOS_SELECCIONADOS'));
                }
            },
            confirmarGuardado: function (self, tiposSemiSeleccionados) {
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ASOCIAR_DESASOCIAR_UBICACIONES'),
                    msg: window.app.idioma.t('DESEA_REALMENTE_ASIGNAR_TIPOS_SEMI_PLANTILLAS'),
                    funcion: function () {
                        self.actualizarPlantillaTiposSemielaborados(tiposSemiSeleccionados);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    contexto: this
                });
            },
            actualizarPlantillaTiposSemielaborados: function (tiposSemiSeleccionados) {
                var dataItem = {};
                dataItem.IdPlantilla = self.PlantillaSeleccionada.IdPlantilla;
                dataItem.TiposSemielaborados = tiposSemiSeleccionados;

                $.ajax({
                    type: 'PUT',
                    data: JSON.stringify(dataItem),
                    async: true,
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    url: '../api/ActualizarPlantillaTipoSemielaborado',
                    success: function (result) {
                        if (result) {
                            self.window.close();
                            $("#contentTipoSemielaboradoPlantillas").data("kendoGrid").dataSource.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('TIPOS_SEMIELABORADOS_ACTUALIZADAS_CORRECTAMENTE'), 4000);
                        }
                        else
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACTUALIZAR_TIPOS_SEMIELABORADOSPLANTILLAS'), 4000);
                    },
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACTUALIZAR_TIPOS_SEMIELABORADOSPLANTILLAS'), 4000);
                    }

                });
            },
            obtenerEquiposSeleccionados: function () {
                var TiposSemielaboradosSeleccionadas = [];

                $('#gridAsociarTipo input[type=checkbox]:checked').each(function () {
                    var idMaterial = $(this).attr("id");
                    if (idMaterial) {
                        if (TiposSemielaboradosSeleccionadas.indexOf(idMaterial) === -1) {
                            TiposSemielaboradosSeleccionadas.push(idMaterial);
                        }
                    }
                });

                return TiposSemielaboradosSeleccionadas;

            },
            toggleAll: function (e) {
                var checkButtonValue = $("#checkAllEquipos").val();

                if (checkButtonValue == "Uncheck") {
                    $("#gridAsociarTipo input[type=checkbox]").prop("checked", true).trigger("change");
                    $("#checkAllEquipos").val("Check");
                } else {
                    $("#gridAsociarTipo input[type=checkbox]").prop("checked", false).trigger("change");
                    $("#checkAllEquipos").val("Uncheck");
                }
            },

            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

