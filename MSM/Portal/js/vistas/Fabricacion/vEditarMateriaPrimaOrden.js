define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/EditarMateriasPrimasOrden.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', 'vistas/Envasado/vCrearNoConformidadWO'],
    function (_, Backbone, $, plantillaEditarMateriaPrima, VistaDlgConfirm, Not, vistaEditarMateriaPrimaWO) {
        var vistaEditarMateriaPrima = Backbone.View.extend({
            tagName: 'div',
            id: 'divEditarMateriaPrima',
            opciones: null,
            roles: null,
            window: null,
            crear: null,
            title: null,
            dsLote: null,
            template: _.template(plantillaEditarMateriaPrima),
            initialize: function (options) {
                var self = this;
                self.opciones = options;
                self.title = window.app.idioma.t('EDITAR_MATERIA_PRIMA');

                this.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.$("#btnCancelarEditarMateriasPrimas").kendoButton();
                self.$("#btnAceptarEditarMateriasPrimas").kendoButton();

                $("#txtWO").prop('disabled', true);
                $("#txtEnvases").prop('disabled', true);

                $("#txtCantidad").kendoNumericTextBox({
                    spinners: true,
                    decimals: 2,
                    culture: kendo.culture().name,
                    format: "n2",
                    min: 0,
                    value: self.opciones.contexto.Cantidad,
                });

                self.$("#txtClase").val(self.opciones.contexto.Clase);
                self.$("#txtMaterial").val(self.opciones.contexto.IdMaterial);
                self.$("#txtDescripcion").val(self.opciones.contexto.Descripcion);

                self.dsLote = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/obtenerLotesPorReferenciaMaterial/" + self.opciones.contexto.IdMaterial,
                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        }
                    },
                    schema: {
                        model: {
                            id: "Lotid",
                            fields: {
                                'Lotid': { type: "string" }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            $("#center-pane").empty();
                        }
                    }
                });

                $("#txtLote").kendoDropDownList({
                    dataTextField: "Lotid",
                    dataValueField: "Lotid",
                    optionLabel:  window.app.idioma.t('SELECCIONE'),
                    dataSource: self.dsLote
                });

                //if (self.opciones.contexto.IdLote) {
                //    self.dsLote.add({
                //        Lotid: self.opciones.contexto.IdLote,
                //        Lotid: self.opciones.contexto.IdLote
                //    });

                //    $("#txtLote").data("kendoDropDownList").select(self.opciones.contexto.IdLote)
                //}

                self.window = $(self.el).kendoWindow(
                {
                    title: self.title,
                    width: "460px",
                    //height: "300px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: []
                }).data("kendoWindow");


                self.dialog = $('#divEditarMateriaPrima').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            events: {
                'click #btnCancelarEditarMateriasPrimas': 'cancelar',
                'click #btnAceptarEditarMateriasPrimas': 'aceptar',
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
            },
            aceptar: function (e) {
                e.preventDefault();

                var self = this;
                var materiaPrima = {};
                materiaPrima.IdMaterial = self.$("#txtMaterial").val();
                materiaPrima.Cantidad = $("#txtCantidad").val();
                materiaPrima.IdLote = $("#txtLote").data("kendoDropDownList").value();
                self.cargarload();
                self.opciones.funcion(materiaPrima);

            },
            eliminar: function () {
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            cargarload: function () {
                var self = this;

                kendo.ui.progress(self.window.element, true);
            },
            finLoad: function () {
                var self = this;

                kendo.ui.progress(self.window.element, false);
            },
        });

        return vistaEditarMateriaPrima;
    });