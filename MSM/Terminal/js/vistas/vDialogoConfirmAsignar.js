define(['underscore', 'backbone', 'jquery', 'text!../../html/dialogoConfirmAsignar.html'], function (_, Backbone, $, plantillaDlgConfirm) {
    var VistaDlgConfirmacion = Backbone.View.extend({
        tagName: 'div',
        template: _.template(plantillaDlgConfirm),
        zonas2Asignar: null, //zonas que se puede asignar la WO
        zonasBloqueadas: null, //zonas que tienen otra WO y no se puede asignar 
        WOantes: null,
        bloquearZonaActual: null,
        initialize: function (options) {
            Backbone.on('eventCierraDialogo', this.cancelar, this);
            this.options = options;
            
            //revisemos las zonas anteriores a la actual, cuando nos encontremos una con WO diferente paramos y las meteremos en zonas bloequedas
            this.WOantes = "";
            this.bloquearZonaActual = false;
            this.tiposArranque = [];
            this.zonas2Asignar = [];
            this.zonasBloqueadas = [];
            this.zonas2Asignar.push(window.app.zonaSel);
            
            //zonas a asignar
            for(var i = window.app.lineaSel.zonas.length-1; i >=0; i--) {
                if(window.app.lineaSel.zonas[i].numZona >= window.app.zonaSel.numZona)
                    continue;//zona posterior
                if(window.app.lineaSel.zonas[i].ordenActual == null){
                    this.zonas2Asignar.push(window.app.lineaSel.zonas[i]);//añadmimos zona a posible de asignar
                    continue;
                }                        
                if(window.app.lineaSel.zonas[i].ordenActual.id == ""){
                    this.zonas2Asignar.push(window.app.lineaSel.zonas[i]);
                    continue;
                }
                if(window.app.lineaSel.zonas[i].ordenActual.id != this.options.contexto.model.id){
                    this.zonasBloqueadas.push(window.app.lineaSel.zonas[i])
                    this.WOantes = window.app.lineaSel.zonas[i].ordenActual.id;
                    break;
                }                        
                if (window.app.lineaSel.zonas[i].ordenActual.id == this.options.contexto.model.id) {
                    this.WOantes = window.app.lineaSel.zonas[i].ordenActual.id;
                    this.bloquearZonaActual = true;
                    break;
                }                   
            }
            
            
            this.render();
        },
        render: function () {
            //definir texto
            var windowLength = "550px";
            var colorTexto = "black";
            var esconderBotonAnteriores = true;
            this.options.aviso = "";
            if(this.zonas2Asignar.length>1){
               
                this.options.msg = window.app.idioma.t('DESEA_ASIGNAR_ACTUAL_ANTERIORES');
                esconderBotonAnteriores = false;                
            }else{
               
                this.options.msg = window.app.idioma.t('DESEA_ASIGNAR_ACTUAL');
                
            }
            if (this.zonasBloqueadas.length > 0) {
                colorTexto = "red";
                var textoSufijo = window.app.idioma.t('TIENE_ASIGNADA_OTRA_ORDEN_NO_PODRA');
                /*if(this.bloquearZonaActual)
                    textoSufijo = window.app.idioma.t('TIENE_ASIGNADA_MISMA_ORDEN');*/

                this.options.aviso = window.app.idioma.t('AVISO_APARTIR_DE_LA_ZONA') + " '" + this.zonasBloqueadas[0].descripcion + "' " + textoSufijo;
            }
            $(this.el).html(this.template(this.options));
            $("body").append($(this.el));
            if(esconderBotonAnteriores){
                this.$("#botonesAnteriores").css("display","none");
            }else{
                this.$("#botonesSINO").css("display", "none");
                if(this.bloquearZonaActual) // si la orden de antes es la misma bloqueamos a la zona actuual porque solo puede aplicar a todas
                    $(".btnAceptar").prop('disabled', true);
            }
            this.$("#msgDialogo").css("color", colorTexto);
            
            this.$("button").kendoButton();
           
            $(this.el).kendoWindow(
            {
                title: this.options.titulo,
                width: windowLength,
                //height: "170px",
                modal:true,
                resizable: false,
                draggable: false,
                actions: []
            });
            this.dialog = $(this.el).data("kendoWindow");
            this.dialog.center();
            if (this.zonas2Asignar.length == 1 && this.options.ordenArranqueCambio == 0) {
                //si es arranque y solo hay una zona no sacamos el dialogo directamente asignamos
                this.asignarActual();

            }
            
        },
        events: {
            'click .btnAceptar': 'asignarActual',
            'click .btnAceptarAnteriores': 'asignarActualyAnteriores',
            'click .btnCancelar': 'cancelar'
        },
        asignarActual: function() {
            window.removeEventListener("beforeunload", window.app.confirmarCierre);
            this.$("#imgProcesando").css("display", "block");
            /*(".btnAceptar").prop('disabled', true);
            $(".btnAceptarAnteriores").prop('disabled', true);
            $(".btnCancelar").prop('disabled', true);*/ 
            this.$("#botonesAnteriores").css("display", "none");
            this.$("#botonesSINO").css("display", "none");
            this.$("#divAviso").css("display", "none");

            this.$(".msgDialogo").html(window.app.idioma.t('ASIGNANDO_WO'));

            this.options.funcion([window.app.zonaSel]);
        },
        asignarActualyAnteriores: function() {
            window.removeEventListener("beforeunload", window.app.confirmarCierre);
            this.$("#imgProcesando").css("display", "block");
            /*$(".btnAceptar").prop('disabled', true);
            $(".btnAceptarAnteriores").prop('disabled', true);
            $(".btnCancelar").prop('disabled', true);*/
            this.$("#botonesAnteriores").css("display", "none");
            this.$("#botonesSINO").css("display", "none");
            this.$("#divAviso").css("display", "none");

            this.$(".msgDialogo").html(window.app.idioma.t('ASIGNANDO_WO'));

            this.options.funcion(this.zonas2Asignar);
        },
        cancelar: function()
        {
            this.dialog.close();
            this.eliminar();
        },
        eliminar: function()
        {
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
    return VistaDlgConfirmacion;
});