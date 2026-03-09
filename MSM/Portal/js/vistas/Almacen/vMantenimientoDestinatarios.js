define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/MantenimientoDestinatarios.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function (_, Backbone, $, plantillaDestinatarios, Not, VistaDlgConfirm, Session) {
        var vistaDestinatarios = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantillaDestinatarios),
            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;
               

              

                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());


            },

            //#region EVENTOS
            events: {
                
            },
            //#endregion EVENTOS

            

            eliminar: function () {
                this.remove();
            },
        });

        return vistaDestinatarios;
    });

