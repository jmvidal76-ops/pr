define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/PopupSepararEstadoMaquina.html', 'compartido/notificaciones'],
    function (_, Backbone, $, plantillaPopupSepararEstadoMaquina, Not) {
        var VistaPopupSepararEstadoMaquina = Backbone.View.extend({
        tagName: 'div',
        id: 'dlgSepararEstadoMaquina',
        template: _.template(plantillaPopupSepararEstadoMaquina),
        initialize: function () {
            this.render();
        },
        render: function () {
            $("#center-pane").prepend($(this.el));
            $(this.el).html(this.template());

            this.$("#btnAceptar").kendoButton();
            this.$("#btnCancelar").kendoButton();            

            //$("#cmbEstado").kendoDropDownList({
            //    dataTextField: "nombre",
            //    dataValueField: "id",
            //    dataSource: [{ id: 1, nombre: "Estado 1" }, { id: 2, nombre: "Estado 2" }, { id: 3, nombre: "Estado 3" }, { id: 4, nombre: "Estado 4" }],
            //    optionLabel: window.app.idioma.t('SELECCIONE')
            //});

            var inicio = new Date(this.model.fechaInicioUTC * 1000);
            var fin = new Date(this.model.fechaFinUTC * 1000);
            //new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate(), fin.getHours(), fin.getMinutes(), fin.getSeconds())

            $("#tpHoraSeparacion").kendoTimePicker({
                value: inicio,
                min: inicio,
                max: fin,
                format: "HH:mm:ss tt",
                interval: 5
            });

            
            $(this.el).kendoWindow(
            {
                title: window.app.idioma.t('SEPARAR_ESTADO_MAQUINA'),
                width: "600px",
                height: "150px",
                modal:true,
                resizable: false,
                draggable: false,
                actions: []
            });

            this.dialog = $('#dlgSepararEstadoMaquina').data("kendoWindow");
            this.dialog.center();
        },
        events: {
            'click #btnAceptar': 'aceptar',
            'click #btnCancelar': 'cancelar'
        },
        
        aceptar: function(e)
        {
            e.preventDefault();

            var self = this;
        
            var separacion = {};

            separacion.estadoMaquina = self.model;
            separacion.horaSeparacionMilisegundosUTF = $("#tpHoraSeparacion").data("kendoTimePicker").value().getTime() - $("#tpHoraSeparacion").data("kendoTimePicker").value().getTimezoneOffset() * 1000;

            $.ajax({
                data: JSON.stringify(separacion),
                type: "POST",
                async: false,
                url: "../api/SepararEstadoHistorico",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (res) {
                    if (res == "")
                    {
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ESTADO_SEPARADO_DE_LA_MAQUINA') + ': ' + res[1], 4000);
                    }
                    else
                    {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_SEPARANDO_ESTADO_MAQUINA'), 4000);
                    }

                    Backbone.trigger('eventCierraDialogo');
                    self.cancelar();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.status == '403' && jqXHR.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_SEPARANDO_ESTADO_MAQUINA') + ': ' + jqXHR.responseJSON.ExceptionMessage, 4000);
                    }
                    self.cancelar();
                },
            });
           
            
           
        },
        cancelar: function()
        {
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
        }
    });
        return VistaPopupSepararEstadoMaquina;
});