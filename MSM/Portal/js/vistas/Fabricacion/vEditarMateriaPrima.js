define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/EditarMateriasPrimas.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', 'vistas/Envasado/vCrearNoConformidadWO'],
    function (_, Backbone, $, plantillaEditarMateriaPrima, VistaDlgConfirm, Not, vistaEditarMateriaPrimaWO) {
        var vistaEditarMateriaPrima = Backbone.View.extend({
            tagName: 'div',
            id: 'divEditarMateriaPrima',
            opciones: null,
            roles: null,
            window: null,
            crear: null,
            title: null,
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

                self.$("#lblClase").text(window.app.idioma.t('CLASE'));
                self.$("#lblMaterial").text(window.app.idioma.t('REFERENCIA'));
                self.$("#lblDescripcion").text(window.app.idioma.t('DESCRIPCION'));
                self.$("#lblCantidad").text(window.app.idioma.t('CANTIDAD'));

                self.$("#btnCancelarEditarMateriasPrimas").kendoButton();
                self.$("#btnCancelarEditarMateriasPrimas").val(window.app.idioma.t('CANCELAR'));
                self.$("#btnAceptarEditarMateriasPrimas").kendoButton();
                self.$("#btnAceptarEditarMateriasPrimas").val(window.app.idioma.t('ACEPTAR'));
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