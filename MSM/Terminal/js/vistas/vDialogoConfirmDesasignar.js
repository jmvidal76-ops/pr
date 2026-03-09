define(['underscore', 'backbone', 'jquery', 'text!../../html/dialogoConfirmDesasignar.html'], function (_, Backbone, $, plantillaDlgConfirm) {
    var VistaDlgConfirmacion = Backbone.View.extend({
        tagName: 'div',
        template: _.template(plantillaDlgConfirm),
        zonas2DesAsignar: null, //zonas que se puede asignar la WO
        zonasBloqueadas: null, //zonas que tienen otra WO y no se puede asignar
        preguntarFinalizarPausar: false,
        nuevoEstado: null,
        initialize: function (options) {
            Backbone.on('eventCierraDialogo', this.cancelar,this);
            this.options = options;
            
            //revisemos las zonas anteriores a la actual, cuando nos encontremos una con WO diferente paramos y las meteremos en zonas bloequedas
            this.zonas2DesAsignar = [];
            this.zonasBloqueadas = [];
            this.nuevoEstado = "";
            //añadimos zona actual 
            this.zonas2DesAsignar.push(window.app.zonaSel);

            //revisamos el resto de zonas por detrás
            for(var i = window.app.lineaSel.zonas.length-1; i >=0; i--) {
                if(window.app.lineaSel.zonas[i].numZona >= window.app.zonaSel.numZona)
                    continue;//zona posterior o zona actual
                if(window.app.lineaSel.zonas[i].ordenActual == null){
                    //this.zonas2DesAsignar.push(window.app.lineaSel.zonas[i]);//No lo añadimos porque no hay que desasignar por que no tiene orden
                    continue;
                }                        
                if(window.app.lineaSel.zonas[i].ordenActual.id == ""){
                    //this.zonasBloqueadas.push(window.app.lineaSel.zonas[i])//No lo añadimos porque no hay que desasignar por que no tiene orden
                    break;
                }
                if(window.app.lineaSel.zonas[i].ordenActual.id != this.options.contexto.model.id){
                    this.zonasBloqueadas.push(window.app.lineaSel.zonas[i])
                    break;
                }                        
                if (window.app.lineaSel.zonas[i].ordenActual.id == this.options.contexto.model.id) {
                    this.zonas2DesAsignar.push(window.app.lineaSel.zonas[i]);
                    continue;
                }                   
            }
            
            this.render();
        },
        render: function () {
            //definir texto
            var windowLength = "550px";
            var colorTexto = "black";
            var esconderBotonAnteriores = true;
            //vemos si tenemos que preguntar de desasignar
            for (var i = 0; i < this.zonas2DesAsignar.length; i++) {
                if (this.zonas2DesAsignar[i].Permite_Produccion) {
                    this.preguntarFinalizarPausar = true;
                    break;
                }
            }
            //
            this.options.aviso = "";
            if(this.zonas2DesAsignar.length>1){
               
                this.options.msg = window.app.idioma.t('DESEA_DESASIGNAR_ACTUAL_ANTERIORES'); 
                esconderBotonAnteriores = false;
                if(this.zonasBloqueadas.length>0){
                    colorTexto = "red";
                    this.options.aviso = window.app.idioma.t('AVISO_APARTIR_DE_LA_ZONA') + " '" + this.zonasBloqueadas[0].descripcion + "' " + window.app.idioma.t('TIENE_ASIGNADA_OTRA_ORDEN_NO_PODRA');
                } 
            }else{
               
                this.options.msg = window.app.idioma.t('DESEA_DESASIGNAR_ACTUAL');
            }
            $(this.el).html(this.template(this.options));
            $("body").append($(this.el));
                     
            this.$("#divEstado").css("display", "none");
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
            
        },
        events: {
            'click .btnAceptar': 'validarDesasignacion',
            'click #btnPausar': 'validarPausar',
            'click #btnFinalizar': 'validarFinalizar',
            'click .btnCancelar': 'cancelar'
        },
        validarPausar: function(){
            this.nuevoEstado = "Pausada";
            this.desasignarActualyAnteriores();
        },
        validarFinalizar: function () {
            this.nuevoEstado = "Finalizada";
            this.desasignarActualyAnteriores();
        },
        validarDesasignacion: function(){
            if (this.preguntarFinalizarPausar) {
                
                //this.options.msg = window.app.idioma.t('DESEAS_PAUSAR_O');                
                this.$("#divMsg").html(window.app.idioma.t('DESEAS_PAUSAR_O'));
                this.$("#divAviso").css("display", "none");
                this.$("#divZonas").css("display", "none");
                this.$("#divEstado").css("display", "inline-block");
            } else {
                this.nuevoEstado = "";
                this.desasignarActualyAnteriores();
            }
        },
        desasignarActualyAnteriores: function() {
            window.removeEventListener("beforeunload", window.app.confirmarCierre);
            this.$("#imgProcesando").css("display", "block");
            /*this.$(".btnAceptar").data("kendoButton").enable(false);            
            this.$(".btnCancelar").data("kendoButton").enable(false);
            this.$("#btnPausar").data("kendoButton").enable(false);            
            this.$("#btnFinalizar").data("kendoButton").enable(false);
            this.$("#btnCancelarEstado").data("kendoButton").enable(false);*/
            this.$("#divZonas").css("display", "none");
            this.$("#divEstado").css("display", "none"); 
            this.$("#divAviso").css("display", "none");

            this.$(".msgDialogo").html(window.app.idioma.t('DESASIGNANDO_WO'));

            this.options.funcion(this.zonas2DesAsignar, this.nuevoEstado);
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