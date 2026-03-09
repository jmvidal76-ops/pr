define(['underscore', 'backbone', 'compartido/notificaciones'], function (_, Backbone, Not) {
    var Sesion = Backbone.Model.extend({
        url: '../api/compruebaLogin/terminal',
        defaults: {
           
        },
        initialize: function () {
            this.on("invalid", function (model, error) {
                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), error, 4000);
            });
        },
        isAuthorizedTo: function (funcion) {
            var sw = false;
            jQuery.each(this.attributes.funciones, function (index, value) {
                if (value.codigo == funcion) {
                    sw = true;
                }
            });

            return sw;
        },
        clear: function () {
            this.destroy();
            this.view.remove();
        },
        validate: function (attrs) {
            if (!attrs.usuario) {
                return window.app.idioma.t('NO_SE_HA_INDICADO');
            }
            if (!attrs.password) {
                return window.app.idioma.t('NO_SE_HA_INDICADO_LA_PASSWORD');
            }
            if (!attrs.linea) {
                return window.app.idioma.t('NO_SE_HA_INDICADO_LA_LINEA');
            }
            if (!attrs.zona) {
                return window.app.idioma.t('NO_SE_HA_INDICADO_LA_ZONA');
            }
        }       

    });
    return Sesion;
});