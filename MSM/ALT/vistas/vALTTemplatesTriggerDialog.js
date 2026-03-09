define(['underscore', 'backbone', 'jquery', 'text!/Alt/html/ALTTemplatesTriggerDialog.html', 'ALT/vALTUtils', 'compartido/notificaciones'],
    function (_, Backbone, $, ALTTemplatesTriggerDialog, vALTUtils,  Not) {
        //ALT UTils
        var altUtils = new vALTUtils();
        //trigger VIEW
        var triggerView = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLTemplateTriggerView',
            title: null,
            data2bind: {
                ordersTypes: [],
                ordersStatus: [],
                ordersStatusArranqueCambio: [],
                classArr: [],
                definitionsArr: [],
                locations: [],
                frecuenciaArr:[ 
                    {name: window.app.idioma.t('UNA_VEZ'), value:1},
                    {name: window.app.idioma.t('DIARIO'), value:2},
                    {name: window.app.idioma.t('SEMANAL'), value:3},
                    {name: window.app.idioma.t('MENSUAL'), value:4},
                ],
                frecuenciaCiclicaArr:[
                    {name: window.app.idioma.t('HORA'), value:60},
                    {name: window.app.idioma.t('MINUTOS'), value:1},

                ],
                sinoArr:[
                    {name: window.app.idioma.t('SI'), value:1},
                    {name: window.app.idioma.t('NO'), value:0},
                    {name: window.app.idioma.t('INDIFERENTE'), value:-1},
                ],
                turnosArr: [
                    { name: window.app.idioma.t('MAÑANA'), value: "1" }, 
                    { name: window.app.idioma.t('TARDE'), value: "2" },
                    { name: window.app.idioma.t('NOCHE'), value: "3" }
                ],
                typesArr: [
                    { name: window.app.idioma.t('ORDEN'), value: "ORDEN" },
                    { name: window.app.idioma.t('PLANIFICADO'), value: "PLANIFICADOV2" },
                    { name: window.app.idioma.t('TURNO'), value: "TURNO" },
                    { name: window.app.idioma.t('MATERIAL'), value: "MATERIAL" }
                ],
                ciclicoDias: [
                    { name: window.app.idioma.t('LUNES'), value: "L" }, 
                    { name: window.app.idioma.t('MARTES'), value: "M" },
                    { name: window.app.idioma.t('MIERCOLES'), value: "X" },
                    { name: window.app.idioma.t('JUEVES'), value: "J" },
                    { name: window.app.idioma.t('VIERNES'), value: "V" },
                    { name: window.app.idioma.t('SABADO'), value: "S" },
                    { name: window.app.idioma.t('DOMINGO'), value: "D" }
                ],
                ciclicoDiasMes: [
                    { name: window.app.idioma.t('LUNES'), value: "L" }, 
                    { name: window.app.idioma.t('MARTES'), value: "M" },
                    { name: window.app.idioma.t('MIERCOLES'), value: "X" },
                    { name: window.app.idioma.t('JUEVES'), value: "J" },
                    { name: window.app.idioma.t('VIERNES'), value: "V" },
                    { name: window.app.idioma.t('SABADO'), value: "S" },
                    { name: window.app.idioma.t('DOMINGO'), value: "D" },                 
                    { name: window.app.idioma.t('DIA'), value: "DIA" },
                    { name: window.app.idioma.t('DIA_ENTRESEMANA'), value: "SEM" },
                    { name:  window.app.idioma.t('DIA_FINDESEMANA'), value: "FIN" }
                ],
                ciclicoNumDiaMes: [
                    { name: window.app.idioma.t('PRIMER'), value: 1 },
                    { name: window.app.idioma.t('SEGUNDO'), value: 2 },
                    { name: window.app.idioma.t('TERCER'), value: 3 },
                    { name: window.app.idioma.t('CUARTO'), value: 4 },
                    { name: window.app.idioma.t('ULTIMO'), value: 0 }
                ],
                triggerTemplate: null,
                attr01: "",
                attr02: "",
                isDisableValidez:function(){
                    return this.triggerTemplate.get("attrValidHasUntil") == 0;
                },
                isDisableFrecuenciaCiclica: function(){
                    return this.triggerTemplate.get("attrFrecuencyIsCycle") == 0;
                },
                isDisableFrecuenciaHora: function(){
                    return this.triggerTemplate.get("attrFrecuencyIsCycle") == 1;
                },
                isDisableMesNoExacto: function(){
                    return this.triggerTemplate.get("attrPlannedMonthIsHourly") == 1;
                },
                isDisableMesExacto: function(){
                    return this.triggerTemplate.get("attrPlannedMonthIsHourly") == 0;
                },
            }, 
            template: _.template(ALTTemplatesTriggerDialog),
            initialize: function (params) {
                var self = this;
                //--//
                self.data2bind.ordersStatus = altUtils.getData("../api/getOrdersStatus").data;
                self.data2bind.ordersTypes = altUtils.getData("../api/getOrdersTypes").data;
                self.data2bind.ordersStatusArranqueCambio = altUtils.getData("../api/getOrdersStatusArranqueCambio").data;
                self.data2bind.classArr = altUtils.getData("../api/getClasses").data;

                self.data2bind.ordersStatus.forEach(function(s){
                    s.name = window.app.idioma.t('ORDER_STATUS_' + s.id);
                });
                self.data2bind.ordersStatusArranqueCambio.forEach(function (s) {
                    s.name = window.app.idioma.t('ORDER_STATUS_' + s.id.replace(" ","_") );
                });
                self.data2bind.ordersTypes.forEach(function (t) {
                    t.name = window.app.idioma.t('ORDER_TYPE_' + t.id);
                });
                
                if (params.triggerTemplate==null) {
                    self.data2bind.triggerTemplate = new kendo.data.ObservableObject(
                        { ID: -1, name: '', descript: '', typeID: 'PLANIFICADOV2', 
                        attr01: '', attr02: '', //parametros para todos los triggers excetp PLANIFICADOV2 que usa el resto
                        attrPlannedShiftActive: -1,
                        attrPlannedOrderActive: -1,
                        attrPlannedType: 2, //1 solo una vez 2 diario 3 semanal 4 mensual -1 no de planificado
                        attrPlannedOnce: new Date(),                        
                        attrPlannedDays: 1,
                        attrPlannedWeeks: 1,
                        attrPlannedWeekDays:'{}',
                        attrPlannedMonthIsHourly: 1,
                        attrPlannedMonthDay: 1,
                        attrPlannedMonthFrec: 1,
                        attrPlannedMonthNumDay: 1, //0 ultimo 1 primer 2 seg 3 tercero 4 cuarto
                        attrPlannedMonthDayWeek: "L",
                        attrFrecuencyIsCycle: 0, //0 puntual 1 ciclica
                        attrFrecuencyHour: '00:00',
                        attrFrecuencyQuantity: 1,
                        attrFrecuencyUnits:60,
                        attrFrecuencyFrom:'00:00',
                        attrFrecuencyTo: '23:59',
                        attrValidHasUntil: 0, //0 no expira 1 tiene expiracion
                        attrValidFrom:  new Date(),//(new Date()).getUTCDate(),
                        attrValidUntil: new Date(),//).getUTCDate(),
                        }); //, locID: self.data2bind.locations[self.data2bind.locations.length -1].value 
                } else {
                    self.data2bind.triggerTemplate = new kendo.data.ObservableObject(params.triggerTemplate);
                    //AQUI IGUALAR LOS CAMPOS DEL TRIGGER;
                    if (self.data2bind.triggerTemplate.typeID == "TURNO") {
                       self.data2bind.triggerTemplate.attr01 = JSON.parse(self.data2bind.triggerTemplate.attr01);
                       
                    }
                }
                //asignamos el departamento al que pertenece
                self.data2bind.triggerTemplate.set("idDepartmentType", params.idDepartmentType);
               
                //datos para planificados
                if( self.data2bind.triggerTemplate.typeID=='PLANIFICADOV2'){
                    self.data2bind.triggerTemplate.attrPlannedWeekDays = JSON.parse(self.data2bind.triggerTemplate.attrPlannedWeekDays);
                }
                //set tittle of window                
                self.title = self.data2bind.triggerTemplate.name;                
                self.render();
            },
            render: function(){
                //--ini DIALOG WINDOW--//
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());
                kendo.bind($("#myTriggerTemplate"), this.data2bind);
                self.selectTypeOrderChange();
                self.$("#btnAceptar").kendoButton();
                self.$("#btnCancelar").kendoButton();
                self.$("#btnAceptar").val(window.app.idioma.t('ACEPTAR'));
                self.$("#btnCancelar").val(window.app.idioma.t('CANCELAR'));
                
                $("#attr01TURNO").kendoMultiSelect();

                //Planificado diario
                $("#attrPlannedOnce").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHoraMin,
                    dateInput: true
                });
                //Planificado semanal
                $("#attrPlannedWeekDays").kendoMultiSelect();
                //Planificado frecuencia               
                $("#attrFrecuencyHour").kendoTimePicker({                    
                    interval: 5,
                    format: "HH:mm"                    
                });
                $("#attrFrecuencyHour2").kendoTimePicker({                    
                    interval: 5,
                    format: "HH:mm"                    
                });
                $("#attrFrecuencyHour3").kendoTimePicker({                    
                    interval: 5,
                    format: "HH:mm"                    
                });
                $("#attrFrecuencyFrom").kendoTimePicker({
                    dateInput: true,
                    interval: 5,
                    format: "HH:mm"                
                });
                $("#attrFrecuencyTo").kendoTimePicker({
                    dateInput: true,
                    interval: 5,
                    format: "HH:mm"
                });
                $("#attrValidFrom").kendoDateTimePicker({
                    dateInput: true,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHoraMin,
                });
                //culture: localStorage.getItem("idiomaSeleccionado"),
                $("#attrValidUntil").kendoDateTimePicker({
                    dateInput: true,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHoraMin,
                });
                
                //window properties
                $("#attr02MATERIAL").kendoDropDownList({                   
                    optionLabel: window.app.idioma.t('ALT_TODOS') //window.app.idioma.t("ALT_TODO")
                });
                self.selectClass();
                
                //hide DIV of not type
                this.showTypeDiv(this.data2bind.triggerTemplate.typeID);
                this.showTypeDivPlanificadov2(this.data2bind.triggerTemplate.attrPlannedType); 
                //bind toolBar

                self.window = $(self.el).kendoWindow(
                {
                    title: self.title,
                    modal: true,
                    maxHeight: $(window).height()*0.9,
                    scrollable:true,
                    resizable: false,
                    draggable: false,
                    actions: [],
                    activate: this.onActivate
                }).data("kendoWindow");
                
                self.dialog = $('#myTriggerTemplate').data("kendoWindow");
                self.dialog = self.window;                
                self.dialog.center();
            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
                'change #selectTypeID': 'selectChange',
                'change #attr01ORDEN': 'selectTypeOrderChange',
                'change #attrPlannedType': 'selectChangeFrecuencia',
                'change #attr01MATERIAL': 'selectClass'    
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                
                this.eliminar();
            },
            aceptar: function (e) {
                //Guardamos template
                e.preventDefault();

                var self = this;
                $("#lblError").text("");
                if ((self.data2bind.triggerTemplate.attr01 == "WO_ENVASADO_ARRANQUE" || self.data2bind.triggerTemplate.attr01 == "WO_ENVASADO_CAMBIO"))
                    self.data2bind.triggerTemplate.attr02 = $("#attr03ORDEN option:selected").val();
                //COMPROBAMOS QUE LOS CAMPOS SEAN CORRECTOS"" }, 
                switch (self.data2bind.triggerTemplate.typeID) {
                    case "TURNO":
                        if (self.data2bind.triggerTemplate.name == "" || self.data2bind.triggerTemplate.attr01 == "") {
                            $("#lblError").text(window.app.idioma.t("ALT_FALTAN_CAMPOS"));
                            return;
                        }
                        break;
                    case "ORDEN":
                        if (self.data2bind.triggerTemplate.name == "" || self.data2bind.triggerTemplate.attr01 == "" || self.data2bind.triggerTemplate.attr02 == "") {
                            $("#lblError").text(window.app.idioma.t("ALT_FALTAN_CAMPOS"));
                            return;
                        }
                        break
                    case "MATERIAL":
                        if (self.data2bind.triggerTemplate.name == "" || self.data2bind.triggerTemplate.attr01 == "") {
                            $("#lblError").text(window.app.idioma.t("ALT_FALTAN_CAMPOS"));
                            return;
                        }
                        break;
                    case "PLANIFICADOV2":
                        //IGUALAMOSLOS CAMPOS ANTES DE COMPROBAR
                        if (self.data2bind.triggerTemplate.attrPlannedType == 4) {
                            self.data2bind.triggerTemplate.attrFrecuencyHour = $("#attrFrecuencyHour2").val();
                        } else {
                            self.data2bind.triggerTemplate.attrFrecuencyHour = $("#attrFrecuencyHour").val();
                        }

                        self.data2bind.triggerTemplate.attrFrecuencyFrom = $("#attrFrecuencyFrom").val();
                        self.data2bind.triggerTemplate.attrFrecuencyTo = $("#attrFrecuencyTo").val();

                        //COMPROBACION NOMBRE
                        if (self.data2bind.triggerTemplate.name == "") {
                            $("#lblError").text(window.app.idioma.t("ALT_FALTAN_CAMPOS") + ": " + window.app.idioma.t("NOMBRE"));
                            return;
                        }
                        //COMPROBACION DE  FRECUENCIA COMUN PARA TODOS LOS TIPOS DE PLANIFICADOSV2
                        if (self.data2bind.triggerTemplate.attrFrecuencyIsCycle == 0 && !self.comprobarHora(self.data2bind.triggerTemplate.attrFrecuencyHour)) {
                            $("#lblError").text(window.app.idioma.t("ALT_FALTAN_CAMPOS") + ": " + window.app.idioma.t("FRECUENCIA") + " - " + window.app.idioma.t("HORA"));
                            return;
                        }
                        if (self.data2bind.triggerTemplate.attrFrecuencyIsCycle == 1) {
                            if (self.data2bind.triggerTemplate.attrFrecuencyQuantity == null || isNaN(self.data2bind.triggerTemplate.attrFrecuencyQuantity) || self.data2bind.triggerTemplate.attrFrecuencyQuantity < 1) {
                                $("#lblError").text(window.app.idioma.t("ALT_FALTAN_CAMPOS") + ": " + window.app.idioma.t("FRECUENCIA") + ' - ' + window.app.idioma.t("CADA"));
                                return;
                            }

                            if (!self.comprobarHora(self.data2bind.triggerTemplate.attrFrecuencyFrom)) {
                                $("#lblError").text(window.app.idioma.t("ALT_FALTAN_CAMPOS") + ": " + window.app.idioma.t("FRECUENCIA") + ' - ' + window.app.idioma.t("DESDE"));
                                return;
                            }
                            if (!self.comprobarHora(self.data2bind.triggerTemplate.attrFrecuencyTo)) {
                                $("#lblError").text(window.app.idioma.t("ALT_FALTAN_CAMPOS") + ": " + window.app.idioma.t("FRECUENCIA") + ' - ' + window.app.idioma.t("HASTA"));
                                return;
                            }
                        }
                        if (Object.prototype.toString.call(self.data2bind.triggerTemplate.attrValidFrom) != "[object Date]") {
                            //is not a date
                            $("#lblError").text(window.app.idioma.t("ALT_FALTAN_CAMPOS") + ": " + window.app.idioma.t("VALIDEZ") + ' - ' + window.app.idioma.t("DESDE"));
                            return;
                        }
                        if (Object.prototype.toString.call(self.data2bind.triggerTemplate.attrValidUntil) != "[object Date]") {
                            //is not a date
                            $("#lblError").text(window.app.idioma.t("ALT_FALTAN_CAMPOS") + ": " + window.app.idioma.t("VALIDEZ") + ' - ' + window.app.idioma.t("HASTA"));
                            return;
                        }
                        //Comprobacion Validez
                        if (self.data2bind.triggerTemplate.attrPlannedType == 1) {
                            //UNA VEZ
                            if (Object.prototype.toString.call(self.data2bind.triggerTemplate.attrPlannedOnce) != "[object Date]") {
                                //is not a date
                                $("#lblError").text(window.app.idioma.t("ALT_FALTAN_CAMPOS") + ": " + window.app.idioma.t("DIA_Y_HORA") + ' ?? ');
                                return;
                            }
                        }
                        if (self.data2bind.triggerTemplate.attrPlannedType == 2) {
                            //DIARIO
                            if (self.data2bind.triggerTemplate.attrPlannedDays == null || isNaN(self.data2bind.triggerTemplate.attrPlannedDays) || self.data2bind.triggerTemplate.attrPlannedDays < 1) {
                                $("#lblError").text(window.app.idioma.t("ALT_FALTAN_CAMPOS") + ": " + window.app.idioma.t("CADA") + " ?? " + window.app.idioma.t("DIAS"));
                                return;
                            }
                        }
                        if (self.data2bind.triggerTemplate.attrPlannedType == 3) {
                            //SEMANAL
                            self.data2bind.triggerTemplate.attrPlannedWeekDays = $("#attrPlannedWeekDays").data("kendoMultiSelect").value();

                            if (self.data2bind.triggerTemplate.attrPlannedWeeks == null || isNaN(self.data2bind.triggerTemplate.attrPlannedWeeks) || self.data2bind.triggerTemplate.attrPlannedWeeks < 1) {
                                $("#lblError").text(window.app.idioma.t("ALT_FALTAN_CAMPOS") + ": " + window.app.idioma.t("CADA") + " ?? " + window.app.idioma.t("SEMANA_LOS_DIAS"));
                                return;
                            }
                            if (Object.keys(self.data2bind.triggerTemplate.attrPlannedWeekDays).length === 0) {
                                $("#lblError").text(window.app.idioma.t("ALT_FALTAN_CAMPOS") + ": " + window.app.idioma.t("SEMANA_LOS_DIAS") + " ?? ");
                                return;
                            }
                            //despues de comprobar los días de la semanas lo transformamos a string para guardar en BD
                            self.data2bind.triggerTemplate.attrPlannedWeekDays = JSON.stringify(self.data2bind.triggerTemplate.attrPlannedWeekDays);
                        }

                        if (self.data2bind.triggerTemplate.attrPlannedType == 4) {
                            //MENSUAL   
                            if (self.data2bind.triggerTemplate.attrPlannedMonthDay == null || isNaN(self.data2bind.triggerTemplate.attrPlannedMonthDay) || self.data2bind.triggerTemplate.attrPlannedMonthDay < 1) {
                                $("#lblError").text(window.app.idioma.t("ALT_FALTAN_CAMPOS") + ": " + window.app.idioma.t("DIA") + " ?? " + window.app.idioma.t("DE_CADA"));
                                return;
                            }
                            if (self.data2bind.triggerTemplate.attrPlannedMonthFrec == null || isNaN(self.data2bind.triggerTemplate.attrPlannedMonthFrec) || self.data2bind.triggerTemplate.attrPlannedMonthFrec < 1) {
                                $("#lblError").text(window.app.idioma.t("ALT_FALTAN_CAMPOS") + ": " + window.app.idioma.t("DE_CADA") + " ?? " + window.app.idioma.t("MES_ES"));
                                return;
                            }
                        }

                        break;
                }
                //AQUI IGUALAR LOS CAMPOS DEL TRIGGER;

                if (self.data2bind.triggerTemplate.typeID == "TURNO") {
                    self.data2bind.triggerTemplate.attr01 = JSON.stringify(self.data2bind.triggerTemplate.attr01);
                }

                console.log(JSON.stringify(self.data2bind.triggerTemplate));
                $.ajax({
                    data: JSON.stringify(self.data2bind.triggerTemplate),
                    type: "POST",
                    async: false,
                    url: "../api/TemplatesTriggers",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res[0] == true) {
                            $("#gridGestionTriggers").data('kendoGrid').dataSource.read();
                            $("#gridGestionTriggers").data('kendoGrid').refresh();
                            Not.crearNotificacion('success', window.app.idioma.t("AVISO"), res[1], 2000);
                            self.dialog.close();
                            self.eliminar();
                        }
                        else Not.crearNotificacion('error', window.app.idioma.t("AVISO"), window.app.idioma.t("ALT_error_create_template"), 2000);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (response) {
                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ALT_error_create_template'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ALT_error_create_template'), 2000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            comprobarHora: function (hora) {
                if (hora.length != 5)
                    return false;
                if (hora.indexOf(":") == -1)
                    return false;

                var fech = hora.split(":");
                var h = fech[0];
                var m = fech[1];

                if (h >= 0 && h < 24 && m >= 0 & m < 60)
                    return true;
                else {
                    $("#lblError").text(window.app.idioma.t("ALT_ERROR_HORA"));
                    return false;
                }
                return true;
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
            showTypeDiv: function (type) {
                //buscamos todos los divs y los escondemos
                $("#triggerTemplate").find('.divParametros').each(function (index) {
                    $(this).hide();
                });
                $("#div" + type).show();
            },
            selectChange: function (e) {
                this.data2bind.triggerTemplate.set("attr01", "");
                this.data2bind.triggerTemplate.set("attr02", "");
                this.showTypeDiv($('#selectTypeID').val());
                var tipoSel = $('#selectTypeID').val(); 
                this.dialog.center();
            },
            selectChangeFrecuencia: function(e){
                this.showTypeDivPlanificadov2($('#attrPlannedType').val());
                this.dialog.center();
            },
            selectTypeOrderChange: function (e) {
                var valueSelect = $("#attr01ORDEN option:selected").val();
                switch (valueSelect) {
                    case "WO_ENVASADO_ARRANQUE":
                    case "WO_ENVASADO_CAMBIO":
                        $("#divORDEN #spanOrderStatus").hide();
                        $("#divORDEN #spanOrderStatusArranque").show();
                        break;
                    default:
                        $("#divORDEN #spanOrderStatus").show();
                        $("#divORDEN #spanOrderStatusArranque").hide();
                }
            },
            showTypeDivPlanificadov2: function(tipoSel){
                $("#divPLANIFICADOV2").find('.tipoPlanificado').each(function (index) {
                    $(this).hide();                            
                });

                $("#divPLANIFICADOV2tipo" + tipoSel).show();
                switch(parseInt(tipoSel)){
                    case 2://diaria
                        $("#divPLANIFICADOV2frecuencia").show();
                        $("#divPLANIFICADOV2validez").show();
                        break;
                    case 3: //semanal
                        $("#divPLANIFICADOV2frecuencia").show();
                        $("#divPLANIFICADOV2validez").show();
                        break;
                    case 4://mensual
                        //$("#divPLANIFICADOV2frecuencia").show();
                        $("#divPLANIFICADOV2validez").show();
                        break;
                }
            },
            selectClass: function (e) {
                var cmbDefinitions= self.$("#attr02MATERIAL").data("kendoDropDownList");
                var opcSel = this.$("#attr01MATERIAL option:selected").val();

                if (opcSel != "") {
                    var definitionsArr = altUtils.getData("../api/getDefinitions/"+opcSel).data;
                    cmbDefinitions.dataSource.data(definitionsArr);
                    cmbDefinitions.select(0);
                } else {
                    cmbDefinitions.dataSource.data([]);
                    cmbDefinitions.refresh();
                }
            },
            getData: function (URL, dataBack) {               
                $.ajax({
                    type: "GET",
                    async: false,
                    url: URL,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res.length > 0) {
                            dataBack.value = res;
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

        return triggerView;
    }
);