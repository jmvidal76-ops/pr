define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/ComponentMaterialesEdit.html', 'compartido/notificaciones'],
    function (_, Backbone, $, TemplateComponent, Not) {
       
        // VIEW
        
        var dialogView = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLEditProduccion',
            title: null,
            modeEdit: null,
            refreshFunction:null,
            serverTraza: window.app.section.getAppSettingsValue('HostApiTrazabilidad'),
            data2bind: null,        
            WO: null,
            CodProducto: null,
            numLinea: null,
            template: _.template(TemplateComponent),
            initialize: function (refreshFunction, params) {
                var self = this;
                //reset values
                self.data2bind= new kendo.data.ObservableObject({ 
                    ubicaciones: [],
                    valueUbicacion: '',
                    materiales: [],
                    valueMaterial: '',
                    lotes: [],
                    valueLote: '',
                    valueCantidad: 0,
                    valueUnidad: '',
                    objectTemplate: {},
                    valueInicio: new Date(),
                    valueFin: new Date(),
                }),
                //set custom values
                self.refreshFunction = refreshFunction;
                self.WO = params.WO;
                self.CodProducto = params.CodProducto;
                self.numLinea = params.numLinea;
               
                if(params.objectTemplate) { 
                    //InicioConsumo, FinConsumo, LoteMES, LoteProveedor
                    self.data2bind.set("objectTemplate", params.objectTemplate);
                    // self.data2bind.set("valueMaterial", params.objectTemplate.Referencia);
                    // self.data2bind.set("valueUbicacion", params.objectTemplate.idUbicacion);
                    //self.data2bind.set("valueLote", params.objectTemplate.LoteMES);
                    self.data2bind.set("valueInicio", params.objectTemplate.InicioConsumo);
                    self.data2bind.set("valueFin", params.objectTemplate.FinConsumo);
                    self.data2bind.set("valueCantidad", params.objectTemplate.Cantidad);
                    self.data2bind.set("valueUnidad", params.objectTemplate.UomID);                    
                    // self.data2.set("objectTemplate.valueUnidad") = params.objectTemplate. 

                    self.title =window.app.idioma.t('EDITAR') + ": " + params.objectTemplate.Referencia; 
                    self.modeEdit = true;
                }else{
                    //GET DATA
                    //../api/material/bom/2009
                    self.callBackServer("../api/material/bom/" + self.CodProducto ,"GET", function(result){
                        self.data2bind.set("materiales", result);
                    });
                    //ubicaciones /api/ubicacion/UbicacionesLinea/2               
                    self.callBackServer("../api/ubicacion/UbicacionesLinea/" + self.numLinea ,"GET", function(result){
                        self.data2bind.set("ubicaciones", result);
                    });
 
                    //--//
                    if(self.data2bind.ubicaciones.length>0)
                        self.data2bind.set("valueUbicacion", self.data2bind.ubicaciones[0].IdUbicacion);
                    if(self.data2bind.materiales.length>0){
                        self.data2bind.set("valueMaterial", self.data2bind.materiales[0].IDMaterial);
                        self.data2bind.set("valueUnidad", self.data2bind.materiales[0].UomID);
                        self.cambiarMateriales(self.data2bind.materiales[0].IDMaterial)
                        // if(self.data2bind.lotes.length>0)
                            // self.data2bind.set("valueLote", self.data2bind.lotes[0]);
                    }                      
                    
                    self.title = window.app.idioma.t('DECLARAR_CONSUMO'); 
                    self.modeEdit = false;
                   // self.data2bind.set("objectTemplate" = params.objectTemplate
                }                             
                self.render();
            },
            render: function(){
                //--ini DIALOG WINDOW--//
                kendo.culture(localStorage.getItem("idiomaSeleccionado"));
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());
                kendo.bind($("#myObjectTemplate"), this.data2bind);
                self.$("#btnAceptar").kendoButton();
                self.$("#btnCancelar").kendoButton();
                self.$("#btnAceptar").val(window.app.idioma.t('ACEPTAR'));
                self.$("#btnCancelar").val(window.app.idioma.t('CANCELAR'));
                
                $("#fechaIni").kendoDateTimePicker({
                    value: self.data2bind.valueInicio,
                    format: "dd/MM/yyyy HH:mm",
                    dateInput: true
                });
                $("#fechaFin").kendoDateTimePicker({
                    value: self.data2bind.valueFin,
                    format: "dd/MM/yyyy HH:mm",
                    dateInput: true
                });
                if(self.modeEdit){                    
                    $("#divNuevo").hide();   
                    $("#divNuevo1").hide();                  
                    //$("#selectMaterial").prop('disabled', true);
                }
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
                'change #selectMaterial': 'cambiarUnidades'              
            }, 
            cambiarUnidades: function(e){
                var self = this;
                var id = e.target.value;
                for(var i = 0; i <self.data2bind.materiales.lenght; i++ ) {
                    if(self.data2bind.materiales[i].id == id)
                        self.data2bind.set("valueUnidad", self.data2bind.materiales[i].UomID);
                }
                self.cambiarMateriales(id);
            }, 
            cambiarMateriales: function(idReferencia){
                var self = this;
                // Lotes /api/ubicacion/Lote/0100012 data-text-field='text' data-value-field='value'
                self.callBackServer("../api/ubicacion/Lote/" + idReferencia ,"GET", function(result){
                    self.data2bind.set("lotes", result);
                });
            },      
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }               
                this.eliminar();
            },
            aceptar: function (e) {
                //new
                // api/Consum
                // {"refMaterialID":"1001","startTime":"2018-02-23","endTime":"2018-02-23","localtionId":2074,"partitionID":"OM-BUR-18-00009.1","Offset":10,"quantity":100,"operationId":0, "lotID":"TES-01-LUP-0100012-REC-20180222160715-123325"}
                //update
                //api/ConsumUPD
                // {"startTime":"2018-02-23","endTime":"2018-02-23","operationId":315,"quantity" : 300}                             
                e.preventDefault();
                
                var self = this;
                var params; 
                var url = "../";   
                if(!self.modeEdit){
                    url+= "api/Consum";
                    params= {
                        "refMaterialID": self.data2bind.get("valueMaterial"),
                        "startTime":$("#fechaIni").data("kendoDateTimePicker").value(),
                        "endTime":$("#fechaFin").data("kendoDateTimePicker").value(),
                        "localtionId":self.data2bind.get("valueUbicacion"),
                        "partitionID":self.WO, 
                        //"Offset":10,
                        "quantity":self.data2bind.get("valueCantidad"),
                        //"operationId":0, 
                        "lotID":self.data2bind.get("valueLote")
                    };
                }else{
                    url+= "api/ConsumUPD";
                    params= {
                        "operationId": self.data2bind.objectTemplate.IdOperacion,
                        "startTime":$("#fechaIni").data("kendoDateTimePicker").value(),
                        "endTime":$("#fechaFin").data("kendoDateTimePicker").value(),
                        "quantity":self.data2bind.get("valueCantidad"),
                    };
                }
                //COMPROBAMOS QUE LOS CAMPOS SEAN CORRECTOS"" }, 
                // $("#dateCuarentena").data("kendoDateTimePicker").value(),
                
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
                            console.log("OK " + JSON.stringify(res));
                            if(res>=0) {
                                self.refreshFunction();
                                console.log("res>=0 OK")
                            }else{
                                //-2: existe                            
                                //-3: fecha inicio > fecha fin;
                                console.log("res NEGATIVO");
                                var errDesc = window.app.idioma.t('ERROR_EDITANDO');
                                switch(res){     
                                    case "-2":
                                        errDesc = window.app.idioma.t('ERROR_LOTE');
                                        break;                                
                                    case "-3": //ERROR_FECHA_FIN_MENOR_INICIO
                                        errDesc = window.app.idioma.t('ERROR_FECHA_FIN_MENOR_INICIO');
                                        break;
                                } 
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), errDesc, 2000);
                            }
                            self.eliminar();                          
                        },
                        error: function (response) {
                            console.log("ERROR EN RESPONSE " + response)
                            if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITANDO'), 2000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'),window.app.idioma.t('ERROR_EDITANDO'), 2000);
                            }
                           
                            self.eliminar();
                        }
                    });
            },
            eliminar: function () {
                // same as this.$el.remove();
                this.dialog.close();
                               
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },        
                      
            callServer: function (URL, typeCall) {
                var result;
                $.ajax({
                    type: typeCall,
                    async: false,
                    url: URL,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                       console.log("OK")
                        if (res) {
                         
                           return result = res;
                            
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ALT_error_datos'), 2000);
                            Backbone.trigger('eventCierraDialogo');
                        }
                    },
                    error: function (response) {
                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ALT_error_datos'), 2000); 
                        }


                    }
                });
            },
            callBackServer: function (URL, typeCall, callback) {
                console.log("URL: " + URL);
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
        

        })

        return dialogView;
    }
);