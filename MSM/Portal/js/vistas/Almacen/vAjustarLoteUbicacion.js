define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/AjustarLoteUbicacion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaCrearEditarUbicacion, Not, VistaDlgConfirm) {
        var vistaCrearEditarUbicacion = Backbone.View.extend({
            tagName: 'div',
            id: 'divEditarArranqueCambio',
            window: null,
            dialog: null,
            row: null,
            accion: null,
            dsTiposUbicacion: null,
            dsEstadosUbicacion: null,
            dsPoliticaAlmacenamiento: null,
            dsPoliticaLlenado: null,
            dsPoliticaVaciado: null,
            dsAlmacen: null,
            dsZona: null,
            dsMateriales: null,
            dsClasesMaterial: null,
            dsTiposMaterial: null,
            tituloWindow: null,
            row: null,
            template: _.template(plantillaCrearEditarUbicacion),
            initialize: function (dateItem) {
                var self = this;

                self.row = dateItem;

                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template({}));


                self.tituloWindow = "Ajustar Lote";

                self.window = $(self.el).kendoWindow(
                {
                    title: self.tituloWindow,
                    width: "400px",
                    height: "250px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: ["close"],
                    close: function () {
                        self.window.destroy();
                        self.window = null;
                    },
                }).data("kendoWindow");

                self.dialog = $('#divEditarArranqueCambio').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                $("#btnNewAceptar").kendoButton();

                $("#btnNewCancelar").kendoButton();

                $("#txtCantidad").kendoNumericTextBox({
                    decimals: 2,
                    min: 0,
                    culture: "es-ES",
                    spinners: true,
                    value: self.row.Cantidad
                });

                $("#txtAntiguaCantidad").val(self.row.Cantidad + " " + self.row.UnidadMedida);

                $("#txtUOM").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "IdUOM",
                    dataSource: [{ Descripcion: "KG", IdUOM: 1 }, { Descripcion: "HL", IdUOM: 2 }]
                });

                for (var i = 0; i < $("#txtUOM").data("kendoDropDownList").dataSource.data().length; i++) {
                    if ($("#txtUOM").data("kendoDropDownList").dataSource.data()[i].Descripcion.toUpperCase() === self.row.UnidadMedida.toUpperCase())
                        $("#txtUOM").data("kendoDropDownList").value($("#txtUOM").data("kendoDropDownList").dataSource.data()[i].IdUOM);
                }

            },
            events: {
                'click #btnNewAceptar': 'aceptar',
                'click #btnNewCancelar': 'cancelar'
            },
            cancelar: function () {
                var self = this;

                self.window.close();
            },
            aceptar: function (e) {
                var self = this;

                self.dialogoConfirm = new VistaDlgConfirm({ titulo: window.app.idioma.t('CREAR_LOTE_2'), msg: window.app.idioma.t('DESEA_REALMENTE_AJUSTAR'), funcion: function () { self.confirmaAcepta(); }, contexto: this });

            },
            confirmaAcepta: function(){
                var self = this;

                Backbone.trigger('eventCierraDialogo');
                self.window.close();

                $("#divControlStock").data("kendoGrid").dataSource.read();
                $("#divControlStock").data("kendoGrid").refresh();

                Not.crearNotificacion('success', 'Info', window.app.idioma.t('AJUSTADO_EL_LOTE'), 2000);

            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearEditarUbicacion;
    });