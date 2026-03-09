define(['underscore', 'backbone', 'jquery', '../../../../Portal/js/vistas/Mantenimiento/vSolicitudesOTs', 'text!../../../Mantenimiento/html/vSolicitudesOTsEnvasado.html', 'compartido/notificaciones'
    , 'compartido/util', 'jszip', '../../../../Portal/js/constantes','../../../../Terminal/js/vistas/Mantenimiento/vValidacionArranqueOT',],
    function (_, Backbone, $, VistaSolicitudesOTs, Plantilla, Not, util, JSZip, enums, vistaValidacionArranqueOT) {
        var VistaSolicitudesOtsEnvasado = VistaSolicitudesOTs.extend({
            template: _.template(Plantilla),
            initialize: function () {

                VistaSolicitudesOTs.prototype.initialize.call(this, { parent: this, options: { esEnvasado: true } });

            }, 
        });

        return VistaSolicitudesOtsEnvasado;
    });