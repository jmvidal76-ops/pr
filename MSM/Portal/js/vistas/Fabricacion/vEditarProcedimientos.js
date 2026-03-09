define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/EditarProcedimiento.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaDlgEditarProcedimientos, Not, VistaDlgConfirm) {
        var vistaEditarProcedimiento = Backbone.View.extend({
            tagName: 'div',
            id: 'divEditarProcedimientos',
            datos: null,
            window: null,
            equipos: [],
            tipo: null,
            order: null,
            template: _.template(plantillaDlgEditarProcedimientos),
            initialize: function (data, order) {
                var self = this;
                self.datos = data;
                self.order = order;
                this.render();
            },
            render: function () {
                var self = this;
                this.datos.tipo = self.tipo;
                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template({ 'order': self.order, 'proc': self.datos }));

                $("#btnAceptar").kendoButton({
                    click: function () { self.confirmarEdicion(); }
                });
                $("#btnCancelar").kendoButton({
                    click: function () { self.CancelarFormulario(); }
                });

                if (self.datos.Tiempo_Inicio == null)
                    $("#txtFechaFin").kendoDateTimePicker({
                        format: "dd/MM/yyyy HH:mm:ss",
                        culture: localStorage.getItem("idiomaSeleccionado")
                    });
                else
                    $("#txtFechaInicio").kendoDateTimePicker({
                        format: "dd/MM/yyyy HH:mm:ss",
                        culture: localStorage.getItem("idiomaSeleccionado"),
                        value: self.datos.Tiempo_Inicio
                    });

                if (self.datos.Tiempo_Fin == null)
                    $("#txtFechaFin").kendoDateTimePicker({
                        format: "dd/MM/yyyy HH:mm:ss",
                        culture: localStorage.getItem("idiomaSeleccionado")
                    });
                else
                    $("#txtFechaFin").kendoDateTimePicker({
                        format: "dd/MM/yyyy HH:mm:ss",
                        culture: localStorage.getItem("idiomaSeleccionado"),
                        value: self.datos.Tiempo_Fin
                    });

                self.window = $(self.el).kendoWindow(
                {
                    title: window.app.idioma.t('EDITAR_PROCEDIMIENTO'),
                    width: "400px",
                    height: "350px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: [],
                    close: function () {
                        self.window.destroy();
                        self.window = null;
                    },
                }).data("kendoWindow");

                self.dialog = $('#divEditarProcedimientos').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            events: {
            },
            CancelarFormulario: function () {
                this.window.close();
                $("#btnActualizarProcs").click()
            },
            confirmarEdicion: function (e) {
                var self = this;
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('EDITAR_PROCEDIMIENTO')
                    , msg: window.app.idioma.t('DESEA_REALMENTE_EDITAR_ESTE_PROCEDIMIENTO'), funcion: function () { self.cambiaEstadoProcedimiento(); }, contexto: this
                });
            },
            cambiaEstadoProcedimiento: function () {
                var self = this;

                var inicio = $("#txtFechaInicio").data("kendoDateTimePicker").value();
                var fin = $("#txtFechaFin").data("kendoDateTimePicker").value();

                if (fin !== null || inicio !== null) {
                    if (new Date(inicio).getTime() > new Date(fin).getTime() && fin !== null) {
                        $("#trError").show();
                        $("#lblError").html("La fecha de fin tiene que ser superior o igual a la de inicio");
                        Backbone.trigger('eventCierraDialogo');
                    }
                    else {
                        $("#trError").hide();

                        var datos = {};
                        datos.inicio = inicio;
                        datos.fin = fin;
                        datos.order = self.order.id;
                        datos.proc = self.datos.Cod_Procedimiento;

                        $.ajax({
                            type: "POST",
                            url: "../api/editarProcedimiento/",
                            dataType: 'json',
                            data: JSON.stringify(datos),
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            cache: false,
                            async: true,
                        }).done(function (res) {
                            $("#gridProcs").data('kendoGrid').dataSource.read();
                            self.window.close();
                            Backbone.trigger('eventCierraDialogo');
                            self.eliminar();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('CAMBIADO_EL_ESTADO'), 4000);
                        }).fail(function (err) {
                            Backbone.trigger('eventCierraDialogo');
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_DECLARAR_PROD'), 4000);
                        });

                    }
                }
                else {
                    $("#trError").show();
                    $("#lblError").html("Debe introducir valor para una fecha.");
                    Backbone.trigger('eventCierraDialogo');
                }
                $("#btnActualizarProcs").click()
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaEditarProcedimiento;
    });