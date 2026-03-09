define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/MantenimientoProductos.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function (_, Backbone, $, plantillaProductos, Not, VistaDlgConfirm, Session) {
        var vistaProductos = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantillaProductos),
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

        return vistaProductos;
    });

