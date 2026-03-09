define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/arrancarOrden.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaDlgCrearWO, Not, VistaDlgConfirm) {
        var VistaDlgCrarWO = Backbone.View.extend({
            tagName: 'div',
            id: 'dlgCrearWO',
            materiales: [],
            celdas: null,
            horafin: new Date((new Date()).getTime() + (3 * 3600 * 1000)),
            tiposOrden: [],
            autoOrden: 0,
            numeroCoccion: null,
            template: _.template(plantillaDlgCrearWO),
            initialize: function (idOrden, pkOrden) {
                var self = this;
                self.autoOrden = pkOrden;
                this.render(idOrden, pkOrden);
            },
            render: function (idOrden, pkOrden) {

                var self = this;
                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();

                $("#lblIdOrden").html(idOrden);

                //Cargamos las fechas
                $("#dtpFechaInicio").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: new Date()
                });

                $(this.el).kendoWindow(
                {
                    title: window.app.idioma.t('ARRANCAR_ORDEN'),
                    width: "500px",
                    height: "260px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: []
                });

                this.dialog = $('#dlgCrearWO').data("kendoWindow");
                this.dialog.center();
            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar'
            },
            aceptar: function (e) {
                e.preventDefault();

                var self = this;

                this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('ARRANCAR_ORDEN'), msg: window.app.idioma.t('DESEA_REALMENTE_ARRANCAR'), funcion: function () { self.creaOrdenCoccion(); }, contexto: this });
            },
            creaOrdenCoccion: function () {

                var self = this;

                var inicio = $("#dtpFechaInicio").data("kendoDateTimePicker").value();

                if (inicio && inicio !== "") {

                   var wo = {};
                    wo.pk = self.autoOrden;
                    wo.inicio = inicio;

                    $.ajax({
                        data: JSON.stringify(wo),
                        type: "POST",
                        async: true,
                        url: "../api/arrancarOrden",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            if (!res.succeeded) {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res.message, 4000);
                            }
                            else 
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_ARRANCADO'), 4000);
                                Backbone.trigger('eventCierraDialogo');
                                self.cancelar();
                                $("#gridListadoWO").data('kendoGrid').dataSource.read();
                            
                        },
                        error: function (response) {
                            $("#lblError").show();
                            $("#lblError").html(response.responseJSON.ExceptionMessage);
                            Backbone.trigger('eventCierraDialogo');
                        }
                    });
                }//inicio
                else {
                    $("#lblError").show();
                    $("#lblError").html(window.app.idioma.t('SELECCIONE_FECHA_INICIO'));
                    Backbone.trigger('eventCierraDialogo');
                }

            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
            },
            eliminar: function () {
                this.remove();
            }
        });
        return VistaDlgCrarWO;
    });