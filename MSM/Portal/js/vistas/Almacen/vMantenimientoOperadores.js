define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/MantenimientoOperadores.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function (_, Backbone, $, plantillaOperadores, Not, VistaDlgConfirm, Session) {
        var vistaOperadores = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantillaOperadores),
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

        return vistaOperadores;
    });

