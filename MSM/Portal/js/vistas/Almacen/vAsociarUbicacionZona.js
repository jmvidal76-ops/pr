define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/vpAsociarUbicacionZona.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, Session) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            tagName: 'div',
            id: 'divAsociarUbicacionZona',
            ZonaSeleccionada: {},
            UbicacionesPorZona: null,
            dsUbicaciones: null,
            window: null,
            dialog: null,
            //#endregion ATTRIBUTES

            initialize: function (zona,ubicaciones) {
                var self = this;
             

                self.ZonaSeleccionada = zona;
                self.UbicacionesPorZona = ubicaciones;

                self.dsUbicaciones = new kendo.data.DataSource({
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerEquiposMES",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "GET"
                        }
                    },
                    sort: { field: "Nombre", dir: "asc" },
                    schema: {
                        model: {
                            id: "IdUbicacion",
                            fields: {
                                'IdUbicacion': { type: "number" },
                                'Nombre': { type: "string" },
                                'Descripcion': { type: "string" },
                                'UbicacionAsociada': { type: "number" },
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
                        title: window.app.idioma.t('ZONA_SELECCIONADA') + ": " + self.ZonaSeleccionada.Descripcion,
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

                self.dialog = $('#divAsociarUbicacionZona').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                $("#gridAsociarUbicacionZona").kendoGrid({
                    toolbar: kendo.template($("#template").html()), 
                    dataSource: self.dsUbicaciones,
                    sortable: true,
                    columns: [
                        {
                            headerTemplate: "<input type='checkbox' onclick='toggleAll(event)' value='Uncheck' id='checkAllEquipos'/>",
                            template: "<input  type='checkbox' id='#=IdUbicacion#'  />",
                            width: 32
                        },
                        { field: "Nombre", title: window.app.idioma.t('UBICACION')},
                        { field: "Descripcion", title: window.app.idioma.t('DESCRIPCION')}

                
                    ],
                    dataBound: function ()
                    {
                        toggleAll = self.toggleAll;
                        reiniciarSeleccion = self.reiniciarSeleccion(self);
                    }
                });
            },
            reiniciarSeleccion: function () {
                self = this;

                var checkButtonValue = $("#checkAllEquipos").val();
                if (checkButtonValue == "Check") {
                    $("#gridAsociarUbicacionZona input[type=checkbox]").prop("checked", false).trigger("change");
                    $("#checkAllEquipos").val("Uncheck");
                }

                var grid = $("#gridAsociarUbicacionZona").data("kendoGrid");
                var view = grid.dataSource.view();
                grid.items().each(function (index, row) {
                    kendo.bind(row, view[index]);
                    var data = view[index];

                    if (data) {
                        var checkbox = $(row).find("input[type=checkbox]");
                        if (self.UbicacionesPorZona.indexOf(data.IdUbicacion) !== -1) {
                            $(checkbox).prop('checked', true);
                        } else {
                            $(checkbox).prop('checked', false);
                            if (data.UbicacionAsociada == 1)
                                this.remove(data);
                        }
                    }

                });

                
            },

            //#region EVENTOS
            events: {
                "click #btnReiniciarSeleccion": function () { var self = this; self.reiniciarSeleccion(self); },
                "click #btnAceptar": function () { var self = this;  this.guardarUbicacionesAsociadas(self); }
            },
            //#endregion EVENTOS

            guardarUbicacionesAsociadas: function (self) {
                var ubicacionesSeleccionadas = self.obtenerEquiposSeleccionados();
                const isEqual = (a, b) => JSON.stringify(ubicacionesSeleccionadas) === JSON.stringify(self.UbicacionesPorZona);
                if (!isEqual(ubicacionesSeleccionadas, self.UbicacionesPorZona)) {
                    $("#notificacionAsociarUbicacionZona").text("");
                    self.confirmarGuardado(self, ubicacionesSeleccionadas);
                }
                else {
                    $("#notificacionAsociarUbicacionZona").text(window.app.idioma.t('NO_HAY_CAMBIOS_SELECCIONADOS'));
                }
            },
            confirmarGuardado: function (self, ubicacionesSeleccionadas) {
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ASOCIAR_DESASOCIAR_UBICACIONES'),
                    msg: window.app.idioma.t('DESEA_REALMENTE_ASIGNAR_UBICACIONES'),
                    funcion: function () {
                        self.actualizarZonaUbicaciones(ubicacionesSeleccionadas);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    contexto: this
                });
            },
            actualizarZonaUbicaciones: function (ubicacionesSeleccionadas) {
                var dataItem = {};
                dataItem.IdZona = self.ZonaSeleccionada.IdZona;
                dataItem.Ubicaciones = ubicacionesSeleccionadas;

                $.ajax({
                    type: 'PUT',
                    data: JSON.stringify(dataItem),
                    async: true,
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    url: '../api/ActualizarZonaUbicaciones',
                    success: function (result) {
                        if (result) {
                            self.window.close();
                            $("#divListaZonas").data("kendoGrid").select($("#divListaZonas").data("kendoGrid").select());
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('UBICACIONES_ACTUALIZADAS_CORRECTAMENTE'), 4000);
                        }
                        else
                           Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACTUALIZAR_UBICACIONESZONAS'), 4000);
                    },
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACTUALIZAR_UBICACIONESZONAS'), 4000);
                    }

                });
            },
            obtenerEquiposSeleccionados: function () {
                var UbicacionesSeleccionadas = [];

                $('#gridAsociarUbicacionZona input[type=checkbox]:checked').each(function () {
                    var idUbicacion = $(this).attr("id");
                    if (idUbicacion) {
                            if (UbicacionesSeleccionadas.indexOf(parseInt(idUbicacion)) === -1) {
                                UbicacionesSeleccionadas.push(parseInt(idUbicacion));
                            }
                    }
                });

                return UbicacionesSeleccionadas;

            },
            toggleAll: function (e) {
                var checkButtonValue = $("#checkAllEquipos").val();

                if (checkButtonValue == "Uncheck") {
                    $("#gridAsociarUbicacionZona input[type=checkbox]").prop("checked", true).trigger("change");
                    $("#checkAllEquipos").val("Check");
                } else {
                    $("#gridAsociarUbicacionZona input[type=checkbox]").prop("checked", false).trigger("change");
                    $("#checkAllEquipos").val("Uncheck");
                }
            },

            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

