define(['underscore', 'backbone', 'jquery', 'text!../../html/datosParoPerdida.html', 'compartido/utils', 'compartido/KeyboardSettings'],
    function (_, Backbone, $,  plantillaDatosParoPerdida, Utils, KeyboardSettings) {
    var VistaDatosParoPerdida = Backbone.View.extend({
        template: _.template(plantillaDatosParoPerdida),
        tagName: 'div',
        initialize: function () {
            this.render();
        },
        render: function () {
            $(this.el).html(this.template({'paro':this.model.toJSON()}));
            $("body").append($(this.el));

            //this.$("#txtMaquina").val(this.model.maquina);

            this.$("#btnAceptar").kendoButton();
            this.$("#btnCancelar").kendoButton();
            $(this.el).kendoWindow(
            {
                title: window.app.idioma.t('DATOS_PARO'),
                width: "1200px",
                height: "440px",
                modal: true,
                resizable: false,
                draggable: false,
                actions: ["Close"]
            });
            this.dialog = $(this.el).data("kendoWindow");
            this.dialog.center();
            this.$('.keyboardOn').addClass("ui-keyboard-input ui-widget-content ui-corner-all");
            KeyboardSettings.Load();
        },
        events: {
            'click #btnAceptar': 'aceptar',
            'click #btnCancelar': 'cancelar'
        },
        aceptar: function () {
            this.dialog.close();
            this.eliminar();
        },
        cancelar: function () {
            this.dialog.close();
            this.eliminar();
        },
        eliminar: function()
        {
            // same as this.$el.remove();
            this.remove();

            // unbind events that are
            // set on this view
            this.off();

            // remove all models bindings
            // made by this view
            if (this.model && this.model.off) { this.model.off(null, null, this); }
        },
        actualiza: function()
        {
            this.render();
        }
    });
    return VistaDatosParoPerdida;
});