define(['underscore', 'backbone', 'jquery', 'text!../../html/dlgConfirmCambioEstado.html'], function (_, Backbone, $, plantillaDlgConfirm) {
    var VistaDlgConfCambioEstado = Backbone.View.extend({
        tagName: 'div',
        template: _.template(plantillaDlgConfirm),
        pausarFinalizar: null,
        initialize: function (options) {
            Backbone.on('eventCierraDialogo', this.cancelar, this);
            this.options = options;
            this.render();
        },
        render: function () {
            this.pausarFinalizar = null;
            $(this.el).html(this.template(this.options));
            $("body").append($(this.el));

            this.$("#btnRespuesta1").kendoButton();
            this.$("#btnRespuesta2").kendoButton();
            this.$("#btnCancelar").kendoButton();



            $(this.el).kendoWindow(
            {
                title: this.options.titulo,
                width: "400px",
                height: "280px",
                modal: true,
                resizable: false,
                draggable: false,
                scrollable: false,
                actions: []
            });
            this.dialog = $(this.el).data("kendoWindow");

            //No hay que mostrar aviso en subzonas
            //var subzonaName = null;
            //if (window.app.zonaSel.subZonas.length > 0) {
            //    window.app.zonaSel.subZonas.forEach(function (zonaId) {
            //        var subzona = $.grep(window.app.lineaSel.zonas, function (data) {
            //            return data.id == zonaId;
            //        })[0];
            //        if ((subzona.numZona < window.app.zonaSel.numZona) && subzona.ordenActual && subzona.ordenActual.id == window.app.zonaSel.ordenActual.id) {
            //            subzonaName = subzonaName == null ? subzona.nombre : ", " + subzona.nombre;
            //        }
            //    });
            //}

            if (this.options.contexto.model.get("estadoActual").nombre == "Iniciando") {
                this.$(".aviso").show();
                $('#CambioEstado').parent().addClass("avisoVentana");
                this.$("#lblAviso").html(window.app.idioma.t('AVISO_PAUSA_INICIANDO'));
                $('#CambioEstado').height("300px");
            }
            //No hay que mostrar aviso en subzonas
            //else if (subzonaName) {
            //    this.$(".aviso").show();
            //    this.$("#lblAviso").html(window.app.idioma.t('AVISO_PAUSA_SUBZONA').replace("#subzona", subzonaName));
            //    $('#CambioEstado').parent().addClass("avisoVentana");
            //    $('#CambioEstado').height("300px");
                //} 
            else {
                this.$(".aviso").hide();                
                $('#CambioEstado').parent().removeClass("avisoVentana");
            }

            this.dialog.center();
        },
        events: {
            'click #btnRespuesta1': function () {
                //this.pausar(window.app.section.getValueSection('Pausa', 'Cambio', 'keyReglaSIT'));
                if (this.pausarFinalizar == null) {
                    this.pausarFinalizar = "Pausada";
                    $('#CambioEstado > #msgDialogo').text("¿Vas a arrancar otra orden a continuación?");
                    $("#btnRespuesta1").text('Si');
                    $("#btnRespuesta2").text('No');
                    $("#btnRespuesta1").kendoButton();
                    //this.options.funcion(window.app.section.getValueSection('Pausa', this.pausarFinalizar + 'Cambio', 'keyReglaSIT'));
                }
                else {
                    var pausa = {};
                    pausa.tipo = this.pausarFinalizar == "Pausada" ? 'Pausa' : 'Fin';
                    pausa.ArrancarSigWO = 'Si';
                    pausa.tipoSIT = window.app.section.getValueSection('Envasado','Pausa', this.pausarFinalizar + 'Cambio', 'keyReglaSIT');
                    this.pausar(pausa);

                }
            },
            'click #btnRespuesta2': function () {
                //this.pausar(window.app.section.getValueSection('Pausa', 'Fin', 'keyReglaSIT'));
                if (this.pausarFinalizar == null) {
                    this.pausarFinalizar = "Finalizada";
                    $('#CambioEstado > #msgDialogo').text("¿Vas a arrancar otra orden a continuación?");
                    $("#btnRespuesta1").text('Si');
                    $("#btnRespuesta2").text('No');
                    //this.options.funcion(window.app.section.getValueSection('Pausa', this.pausarFinalizar + 'Finproduccion', 'keyReglaSIT'));
                }
                else {
                    var pausa = {};
                    pausa.tipo = this.pausarFinalizar == "Pausada" ? 'Pausa' : 'Fin';
                    pausa.ArrancarSigWO = 'No';
                    pausa.tipoSIT = window.app.section.getValueSection('Envasado','Pausa', this.pausarFinalizar + 'Finproduccion', 'keyReglaSIT');
                    this.pausar(pausa);
                }
            },
            'click #btnCancelar': 'cancelar'
        },

        pausar: function (pausa) {

            this.$("#imgProcesando").css("display", "block");

            this.$("#btnRespuesta1").data("kendoButton").enable(false);
            this.$("#btnRespuesta2").data("kendoButton").enable(false);
            this.$("#btnCancelar").data("kendoButton").enable(false);

            this.options.funcion(pausa);
        },
        cancelar: function () {
            this.dialog.close();
            this.eliminar();
        },
        eliminar: function () {
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
    return VistaDlgConfCambioEstado;
});