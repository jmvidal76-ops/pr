define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/MantenimientoClientesProveedores.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function (_, Backbone, $, plantillaClientesProveedores, Not, VistaDlgConfirm, Session) {
        var vistaClienteProveedores = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantillaClientesProveedores),
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

        return vistaClienteProveedores;
    });

