define(['underscore', 'backbone', 'jquery', 'text!../../html/dialogoConfirm.html'], function (_, Backbone, $, plantillaDlgConfirm) {
    var VistaDlgConfirmacion = Backbone.View.extend({
        tagName: 'div',
        template: _.template(plantillaDlgConfirm),
        initialize: function (options) {
            Backbone.on('eventCierraDialogo', this.cancelar,this);
            this.options = options;
            this.render();
        },
        render: function () {

            $(this.el).html(this.template(this.options));

            $("body").append($(this.el));
             
            this.$("#btnAceptar").kendoButton();
            this.$("#btnCancelar").kendoButton();
            $(this.el).kendoWindow(
            {
                title: this.options.titulo,
                width: "300px",
                //height: "170px",
                modal:true,
                resizable: false,
                draggable: false,
                actions: []
            });
            this.dialog = $(this.el).data("kendoWindow");

            if (this.options.claseExtra) {
                this.dialog.wrapper.addClass(this.options.claseExtra);
            }

            this.dialog.center();
            
        },
        events: {
            'click #btnAceptar': 'aceptar',
            'click #btnCancelar': 'cancelar'
        },
        aceptar: function()
        {

            window.removeEventListener("beforeunload", window.app.confirmarCierre);
            this.$("#imgProcesando").css("display", "block");
            this.$("#btnAceptar").data("kendoButton").enable(false);
            this.$("#btnCancelar").data("kendoButton").enable(false);
            
            this.options.funcion();
        },
        cancelar: function()
        {
            this.dialog.close();
            this.eliminar();
        },
        eliminar: function()
        {
            Backbone.off('eventCierraDialogo');
            // same as this.$el.remove();
            this.remove();

            // unbind events that are
            // set on this view
            this.off();

            // remove all models bindings
            // made by this view
            if (this.model && this.model.off) { this.model.off(null, null, this); }
        },
        actualiza: function () {
            this.render();
        },
        finProceso: function () {
            this.dialog.close();
            this.eliminar();
        }
    });
    return VistaDlgConfirmacion;
});