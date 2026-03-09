define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/vpAsociarDisparadorKOP.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, Session) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            tagName: 'div',
            id: 'divAsociarDisparadorKOP',
            PlantillaSeleccionada: {},
            dsDisparadorPlantillasKOP: null,
            disparadoresPlantilla: null,
            window: null,
            dialog: null,
            //#endregion ATTRIBUTES

            initialize: function (plantilla, disparadoresKOP) {
                var self = this;


                self.PlantillaSeleccionada = plantilla;
                self.disparadoresPlantilla = disparadoresKOP;

                self.dsDisparadorPlantillasKOP = new kendo.data.DataSource({
                    async: true,
                    autoBind: true,
                    transport: {
                        read: {
                            url: "../api/disparadorPlantillasKOP/0",
                            dataType: "json"
                        },
                    },
                    sort: { field: "CodKOP", dir: "asc" },
                    pageSize: 50,
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
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.window = $(self.el).kendoWindow(
                    {
                        title: window.app.idioma.t('PLANTILLA_SELECCIONADA') + ": " + self.PlantillaSeleccionada.Descripcion,
                        width: "40%",
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

                self.dialog = $('#divAsociarDisparadorKOP').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                $("#gridAsociarDisparadorKOP").kendoGrid({
                    toolbar: kendo.template($("#template").html()),
                    dataSource: self.dsDisparadorPlantillasKOP,
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
                            headerTemplate: "<input type='checkbox' onclick='toggleAll(event)' value='Uncheck' id='checkAllDisparadorKOP'/>",
                            template: "<input  type='checkbox' id='#=IdMaestroKOP#'  />",
                            width: "3%"
                        },
                        {
                            title: window.app.idioma.t("ZONA"),
                            field: 'NombreZona',
                            attributes: { "align": "center" },
                            width: "40%"
                        },
                        {
                            title: window.app.idioma.t("NOMBRE"),
                            field: 'CodKOP',
                            attributes: { "align": "center" },
                            width: "40%"
                        },
                        {
                            title: window.app.idioma.t("DESCRIPCION"),
                            field: 'DescKOP',
                            attributes: { "align": "center" },
                            width: "40%"
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

                var checkButtonValue = $("#checkAllDisparadorKOP").val();
                if (checkButtonValue == "Check") {
                    $("#gridAsociarDisparadorKOP input[type=checkbox]").prop("checked", false).trigger("change");
                    $("#checkAllDisparadorKOP").val("Uncheck");
                }

                var grid = $("#gridAsociarDisparadorKOP").data("kendoGrid");
                var view = grid.dataSource.view();
                grid.items().each(function (index, row) {
                    kendo.bind(row, view[index]);
                    var data = view[index];

                    if (data) {
                        var checkbox = $(row).find("input[type=checkbox]");
                        if (self.disparadoresPlantilla.indexOf(data.IdMaestroKOP) !== -1) {
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
                "click #btnAceptar": function () { var self = this; this.guardarDisparadorAsociadas(self); }
            },
            //#endregion EVENTOS

            guardarDisparadorAsociadas: function (self) {
                var tiposSemiSeleccionados = self.obtenerDisparadorKOPSeleccionados();
                const isEqual = (a, b) => JSON.stringify(tiposSemiSeleccionados) === JSON.stringify(self.disparadoresPlantilla);
                if (!isEqual(tiposSemiSeleccionados, self.disparadoresPlantilla)) {
                    $("#notificacionAsociarDisparadorKOPPlantilla").text("");
                    self.confirmarGuardado(self, tiposSemiSeleccionados);
                }
                else {
                    $("#notificacionAsociarDisparadorKOPPlantilla").text(window.app.idioma.t('NO_HAY_CAMBIOS_SELECCIONADOS'));
                }
            },
            confirmarGuardado: function (self, tiposSemiSeleccionados) {
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ASOCIAR_DESASOCIAR_DISPARADORES_KOP'),
                    msg: window.app.idioma.t('DESEA_REALMENTE_ASIGNAR_DISPARADORES_KOP'),
                    funcion: function () {
                        self.actualizarPlantillaDisparadoresKOP(tiposSemiSeleccionados);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    contexto: this
                });
            },
            actualizarPlantillaDisparadoresKOP: function (idKOPSeleccionado) {
                var dataItem = {};
                dataItem.IdPlantillaConsumo = self.PlantillaSeleccionada.IdPlantilla;
                dataItem.IdMaestroKOP = idKOPSeleccionado;

                $.ajax({
                    type: 'PUT',
                    data: JSON.stringify(dataItem),
                    async: true,
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    url: '../api/ActualizarPlantillaDisparadorKOP',
                    success: function (result) {
                        if (result) {
                            self.window.close();
                            $("#contentDisparadorPlantillaKOP").data("kendoGrid").dataSource.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('DISPARADORES_KOP_ACTUALIZADAS_CORRECTAMENTE'), 4000);
                        }
                        else
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACTUALIZAR_DISPARADORES_KOP'), 4000);
                    },
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACTUALIZAR_DISPARADORES_KOP'), 4000);
                    }

                });
            },
            obtenerDisparadorKOPSeleccionados: function () {
                var disparadorSeleccionadas = [];

                $('#gridAsociarDisparadorKOP input[type=checkbox]:checked').each(function () {
                    var id = $(this).attr("id");
                    if (id) {
                        if (disparadorSeleccionadas.indexOf(id) === -1) {
                            disparadorSeleccionadas.push(id);
                        }
                    }
                });

                return disparadorSeleccionadas;

            },
            toggleAll: function (e) {
                var checkButtonValue = $("#checkAllDisparadorKOP").val();

                if (checkButtonValue == "Uncheck") {
                    $("#gridAsociarDisparadorKOP input[type=checkbox]").prop("checked", true).trigger("change");
                    $("#checkAllDisparadorKOP").val("Check");
                } else {
                    $("#gridAsociarDisparadorKOP input[type=checkbox]").prop("checked", false).trigger("change");
                    $("#checkAllDisparadorKOP").val("Uncheck");
                }
            },

            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

