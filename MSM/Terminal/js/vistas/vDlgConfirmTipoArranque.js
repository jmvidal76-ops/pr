define(['underscore', 'backbone', 'jquery', 'text!../../html/dlgConfirmTipoArranque.html'], function (_, Backbone, $, plantillaDlgConfirm) {
    var VistaDlgConfCambioEstado = Backbone.View.extend({
        tagName: 'div',
        template: _.template(plantillaDlgConfirm),
        tiposArranque: null,
        initialize: function (options) {
            
            var self = this;
            self.options = options;

            $.ajax({
                type: "GET",
                async: false,
                url: "../api/obtenerTiposArranque/" + window.app.lineaSel.numLinea,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    self.tiposArranque = data;
                },
                error: function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_TIPOS_DE_ARRANQUE'), 4000);
                    }                    
                }
            });

            this.render();
        },
        render: function () {

            $(this.el).html(this.template(this.options));
            $("body").append($(this.el));

            var self = this;

            self.$("#lblArranque").text(window.app.idioma.t('TIPO_ARRANQUE'));
             
            this.$("#btnAceptar").kendoButton({ enable: false });
            this.$("#btnCancelar").kendoButton();

            this.$("#cmbTipoArranque").kendoDropDownList({
                height: 350,
                dataTextField: "Descripcion",
                dataValueField: "Id",
                dataSource: new kendo.data.DataSource({
                    data: self.tiposArranque,
                    sort: { field: "Id", dir: "asc" }
                })
                ,optionLabel: window.app.idioma.t('SELECCIONE')
                , change: function () {
                    var btnAceptar=self.$("#btnAceptar").data("kendoButton");
                    if(typeof btnAceptar!="undefined"){
                        if(this.value()=="") {
                            btnAceptar.enable(false); 
                        }else{
                            btnAceptar.enable(true);
                        }
                    }
                }
            });

            

            $(this.el).kendoWindow(
            {
                title: this.options.titulo,
                width: "550px",
                height: "240px",
                modal:true,
                resizable: false,
                draggable: false,
                actions: []
            });
            this.dialog = $(this.el).data("kendoWindow");
            this.dialog.center();
            
        },
        events: {
            'click #btnAceptar': 'aceptar',
            'click #btnCancelar': 'cancelar'
        },
        aceptar: function (aceptar)
        {
            
            this.$("#imgProcesando").css("display", "block");

            var cmbTipoArranque = $("#cmbTipoArranque").data("kendoDropDownList").dataItem();
            this.$("#btnCancelar").data("kendoButton").enable(false);
            this.$("#btnAceptar").data("kendoButton").enable(false);
            
            this.options.funcion(cmbTipoArranque.Id);
            this.cancelar();
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