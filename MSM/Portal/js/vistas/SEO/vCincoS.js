define(['underscore', 'backbone', 'jquery', 'text!../../../SEO/html/CincoS.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, Session) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
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

        return vista;
    });

