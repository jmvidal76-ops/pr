define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/ComponentProduccionMateriales.html', 'vistas/trazabilidad/vComponentMateriales', 'compartido/notificaciones'],
    function (_, Backbone, $, TemplateComponent, componentMateriales, Not) {
       
        //trigger VIEW
        var dialogView = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMProduccionMateriales',
            title: null,
            component: null, //grid materiales
            serverTraza: window.app.section.getAppSettingsValue('HostApiTrazabilidad'),
            data2bind: null,
            template: _.template(TemplateComponent),
            
            initialize: function (params) {
                var self = this;
                //reset values
                self.data2bind = new kendo.data.ObservableObject({ 
                    ubicaciones: null,
                    enableVelNom: false,
                    objectTemplate: null,
                    selectUbicacion: {
                        IdUbicacion: null,
                        VelocidadNominal: null,
                        VelocidadNominalReferencia: null,
                        Offset: null,
                        Rendimiento: null
                    },
                   Calculo: null
                   
                })
                //custom values
                if (params.selectProd==null) {
                    //self.data2bind.objectTemplate = new kendo.data.ObservableObject({ }); 
                } else {
                   //get produccion
                    self.data2bind.objectTemplate = new kendo.data.ObservableObject(params.selectProd);   
                    
                }              
                             
                self.title = window.app.idioma.t('MATERIALES');              
                self.render();
            },
            render: function(){
                //--ini DIALOG WINDOW--//
                var self = this;
                kendo.culture(localStorage.getItem("idiomaSeleccionado")); 
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());
                self.refreshUbicaciones();               
                kendo.bind($("#myObjectTemplate"), this.data2bind);
              
                self.$("#btnCancelar").kendoButton();
                self.$("#btnCancelar").val(window.app.idioma.t('CERRAR'));                
                self.$("#actualizarOffsets").kendoButton();
                self.$("#actualizarOffsets").val(window.app.idioma.t('ACTUALIZAR'));
                //Render inputs   
                //self.$("#velocidadNominal").data("kendoNumericTextBox").enable(false);
                self.$("#Calculo").data("kendoNumericTextBox").enable(false);
                // $("#dateBloquear").data("kendoDateTimePicker").enable(false);    
                
               
                
                //bind toolBar
                self.window = $(self.el).kendoWindow(
                {
                    title: self.title,
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: [],
                    activate: this.onActivate
                }).data("kendoWindow");
                
                self.dialog = $('#myObjectTemplate').data("kendoWindow");
                self.dialog = self.window;                
                self.dialog.center();
                

            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
                'click #actualizarOffsets': 'actualizarOffsets',
                'change #listUbicaciones': 'cambiarParametros'
            },
            cambiarParametros: function(e) {

                this.setOffsetsUbicacion(e.target.value);
                this.loadGridMateriales();
            },
            setOffsetsUbicacion: function(IdUbicacion) {
                for(var i = 0; i < this.data2bind.ubicaciones.length; i++){
                // this.data2bind.ubicaciones.forEach(element => {                
                   
                    if (this.data2bind.ubicaciones[i].IdUbicacion == IdUbicacion) {
                        this.data2bind.set("selectUbicacion.IdUbicacion", this.data2bind.ubicaciones[i].IdUbicacion),
                            this.data2bind.set("selectUbicacion.VelocidadNominalReferencia", this.data2bind.ubicaciones[i].VelocidadNominalReferencia),
                        this.data2bind.set("selectUbicacion.Offset", this.data2bind.ubicaciones[i].Offset),
                        this.data2bind.set("selectUbicacion.Rendimiento", this.data2bind.ubicaciones[i].RendimientoWO*100);
                        break;
                    }
                }  
                // });
            },
            refreshUbicaciones: function (){
                // var selUbicacion = this.data2bindselectUbicacion.idUbicacion;                
                 //get ubicas y offsets
                 var self = this;
                 var urlPart = '../api/ProduccionOffset/'+self.data2bind.objectTemplate.IdProduccion;
                 // http://10.2.20.206:2017/TrazabilidadAPITestData/api/ProduccionOffset/1
                 self.callBackServer(urlPart,"GET", function(result){
                     self.data2bind.set("ubicaciones", result);
                     if (result.length > 0) {
                         if (self.data2bind.selectUbicacion.IdUbicacion == null) {
                             self.setOffsetsUbicacion(result[0].IdUbicacion);
                         }
                         $("#lblError").text("");
                     } else {
                         $("#lblError").css('color', 'blue');
                         $("#lblError").text(window.app.idioma.t('ERROR_NO_HAY_UBICACIONES'));
                     }
                     //cargamos el componente de Materiales
                     self.loadGridMateriales();
                   
                 });
            },
            loadGridMateriales: function(){
                //get materiales http://10.2.20.206:2017/TrazabilidadAPITestData/api/Consumo/Produccion/2/2083

                     //self.data2bind.selectUbicacion.idUbicacion
                    //pasamos parametros vacíos para que coja por defectos
                var self = this;
                var ubicacion = 0;
                if (self.data2bind.selectUbicacion.IdUbicacion != null) {
                    ubicacion = self.data2bind.selectUbicacion.IdUbicacion;

                }
                var url = "../api/Consumo/Produccion/" + self.data2bind.objectTemplate.IdProduccion + "/" + ubicacion;
                    self.component = new componentMateriales(url,null,null,null);
                    if(self.component)
                        self.component.eliminar();
                    $("#gridMateriales").html(self.component.render().el);

            },
            actualizarOffsets: function(e) {
                var self = this;
                var params = {                    
                        "IdProduccion": this.data2bind.ubicaciones[0].IdProduccion,
                        "IdUbicacion": this.data2bind.get("selectUbicacion.IdUbicacion"),
                        "NombreUbicacion": "",
                        "VelocidadNominal": self.$("#velocidadNominal").val(),
                        "VelocidadNominalReferencia":  this.data2bind.get("selectUbicacion.VelocidadNominalReferencia"),
                        "Offset":  this.data2bind.get("selectUbicacion.Offset"),
                        "RendimientoWO": this.data2bind.get("selectUbicacion.Rendimiento")/100
                    }
                var url =  '../api/UpdProduccionOffset'; // + this.data2bind.get("selectUbicacion.idUbicacion");
                $("#lblError").css('color', 'blue');
                $("#lblError").text(window.app.idioma.t('ACTUALIZANDO')); 
                //                
                console.log("URL: " + url);
                console.log("DATA: "+ JSON.stringify(params));
                $.ajax({
                        data: JSON.stringify(params),
                        type: "PUT",
                        async: false,
                        url: url,                        
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            //console.log("RESUL " + JSON.stringify(res));
                            if(res == "true"){
                                self.refreshUbicaciones();
                                $("#lblError").css('color', 'blue');
                                $("#lblError").text(window.app.idioma.t('ACTUALIZANDO_OK'));  
                            }else{
                                //error
                                $("#lblError").css('color', 'red');
                                $("#lblError").text(window.app.idioma.t('ACTUALIZANDO_ERROR')); 
                            }
                                                            
                        },
                        error: function (response) {
                            if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITANDO'), 3000); 
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITANDO'), 3000); 
                            }
                            
                            self.eliminar();
                        }
                    });
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                
                this.eliminar();
            },           
            eliminar: function () {
                // same as this.$el.remove();
                this.dialog.close();
                this.component.eliminar();               
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },                             
            callBackServer: function (URL, typeCall, callback) {
                
                $.ajax({
                    type: typeCall,
                    async: false,
                    url: URL,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                       console.log("OK")
                        if (res) {
                         
                           callback(res);
                            
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_DATOS'), 2000);
                            Backbone.trigger('eventCierraDialogo');
                        }
                    },
                    error: function (response) {
                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_DATOS'), 2000); 
                        }


                    }
                });
            }
        });

        return dialogView;
    }
        

);