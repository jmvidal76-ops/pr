define(['underscore', 'backbone', 'jquery', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, Not, VistaDlgConfirm) {
        
        //FIELDS TEMPLATES VIEW
        var fieldInput = Backbone.View.extend({
            tagName: 'div',
            defaultWidth: "270px",
            template: null, 
            field: {},
            parent: null,  
            self: null,
            render: function () {
                var self = this;
                var fieldString = '';
                var bindStr = "";
                var requiredStr = self.field.required ? "required" : "";
                //var disableStr = self.parent.disableInputs ? 'onkeypress="return false;"' : "";
                //para que el pdf los mantenga juntos, no funciona en esta version kendo
                $(self.el).addClass("prevent-split");

                //     
                switch (self.field.type) {
                    case 'header':
                        fieldString = "<br/><br/><h3> " + this.field.label + " </h3>";
                        $(self.el).css("width", "100%"); //para que ocupe un minimo
                        break;
                    case 'br':
                        fieldString = "<br/>";
                        $(self.el).css("width", "100%"); //para que ocupe un minimo
                        break;
                    case 'link':
                        var link = "";
                        if (self.field.link.indexOf("http") === -1 && self.field.link.indexOf("ftp") === -1) {
                            link = "http:///" + self.field.link;
                        } else {
                            link = self.field.link;
                        }
                        fieldString = '<br/><a target="_blank" href="' + link + '" class="k-button"><img class="linkIco" src="../ALT/img/ALT_link.png" /><%-label%></a>';
                        break;
                    case 'turnoId':
                    case 'orderTypeId':
                        //ponemos el ID el tipo para que luego podamos conseguir el dato por nombre
                        fieldString = '<br /><label ><%-label%></label> <input id="<%-nameID%>" name="<%-nameID%>" data-bind="value: <%-nameID%>" ' + requiredStr + ' />';

                        break;
                    case 'orderId':
                    case 'shcId':
                    case 'lotId':
                    case 'materialId':
                    case 'location':
                        //ponemos el ID el tipo para que luego podamos conseguir el dato por nombre
                        fieldString = '<br /><label ><%-label%></label> <input id="<%-nameID%>" name="<%-nameID%>" data-bind="value: <%-nameID%>" class="keyboardOn" ' + requiredStr + ' />';

                        break;
                    case 'range':
                        //html string PLACE HOLDER data-role="dropdownlist"
                        fieldString = self.getDefaultStringHTML('type="text" data-bind="value:<%-nameID%>" class="keyboardOn" data-mymin="' + this.field.min + '" data-mymax="' + this.field.max + '" ' + requiredStr);

                        break;
                    case 'checkbox':
                        //html string
                        //fieldString = self.getDefaultStringHTML('data-bind="checked:<%-nameID%>" type="checkbox" ' + requiredStr );
                        var requireValueStr = '';
                        if (this.field.required)
                            requireValueStr = ' data-requirevalue= "' + this.field.requireValueCheck + '" ';
                        fieldString = '<br /><label ><%-label%></label> <input id="<%-nameID%>" name="<%-nameID%>"  data-bind="value: <%-nameID%>" ' + requireValueStr + requiredStr + ' />';
                        break;
                    case 'text':
                        //html string
                        fieldString = self.getDefaultStringHTML('data-bind="value:<%-nameID%>" type="text" class="k-textbox keyboardOn" ' + requiredStr);

                        break;
                    case 'textarea':
                        fieldString = '<br/><br/><label><%-label%></label><br/><textarea id="<%-nameID%>" name="<%-nameID%>" data-bind="value:<%-nameID%>"  class="k-textbox keyboardOn" rows="10" style="width: 100%" ' + requiredStr + '></textarea>';
                        //css settings

                        $(self.el).css("width", "100%"); //para que ocupe un minimo
                        break;
                    case 'number':
                        fieldString = self.getDefaultStringHTML('data-bind="value:<%-nameID%>" class="keyboardOn" ' + requiredStr);
                        //css settings
                        break;
                    case 'date':
                        fieldString = self.getDefaultStringHTML('data-bind="value:<%-nameID%>" ' + requiredStr);
                        //css settings
                        break;
                    case 'rtds':
                        fieldString = self.getDefaultStringHTML('data-bind="value:<%-nameID%>" class="rtdsField keyboardOn" ' + requiredStr + '  onkeypress="return false;" ');
                        fieldString += '<a class=" rtdsBto k-button"  ><img  src="../ALT/img/ALT_download.png" /></span></a>';
                        break;
                }

                //si estamos en modo configuraci�n dejaremos botones de edici�n los campos               
                if (self.parent.modeConfig) {
                    fieldString += '<div class="divBtnsConfig"><a class=" toggleUp k-button" ><img  src="../ALT/img/ALT_up.png" /></span></a>'
                        + '<a class="toggleDown k-button" ><img  src="../ALT/img/ALT_down.png" /></span></a>'
                        + '<a class="editField k-button" ><img  src="../ALT/img/ALT_edit.png" /></span></a>'
                        + '<a class="destroy k-button" style="background-color:red"><img  src="../ALT/img/ALT_cancel.png" style="width: 16px; height:16px"/></a></div>';
                }

                self.template = _.template(fieldString);

                $(self.el).html(self.template(self.field));
                //a�adimos toolptip de informaci�n si dispone
                if (!self.parent.modeConfig && self.field.descript != "") {

                    //console.log('#' + self.field.nameID);
                    $(self.el).kendoTooltip({
                        content: self.field.descript,
                        position: "left"
                    });
                }
                //Despues de html lo convertimos a kendo segun tipo
                //OBJETOS KENDOS PARA CAMPOS ESPECIALES distintos a HTML genericos
                switch (self.field.type) {
                    case 'checkbox':
                        //css settings
                        //this.$('label').css("width", "100%");
                        //this.$('input').css("width", "initial");
                        this.$("#" + self.field.nameID).kendoDropDownList({
                            valuePrimitive: true,
                            dataTextField: "text",
                            dataValueField: "value",
                            dataSource: [{ text: "OK", value: "true" }, { text: window.app.idioma.t('NO_OK'), value: "false" }],
                            optionLabel: { text: window.app.idioma.t('SELECCIONE'), value: "" },
                            change: function () {
                                let combo = this;

                                if (combo.text() == window.app.idioma.t('NO_OK')) {
                                    let confirmacion = new VistaDlgConfirm({
                                        titulo: "Cambiar valor",
                                        msg: window.app.idioma.t('SELECCIONAR_NO_OK'),
                                        funcion: function () {
                                            confirmacion.dialog.close();
                                        },
                                        funcionClose: function () {
                                            combo.value("");
                                        },
                                        contexto: this
                                    });
                                }
                            }
                        });
                        self.mutateFunction("#" + self.field.nameID);
                        break;
                    case 'date':
                        self.$("#" + self.field.nameID).kendoDatePicker({
                            format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                            culture: localStorage.getItem("idiomaSeleccionado")
                        });
                        self.mutateFunction("#" + self.field.nameID);

                        break;
                    //this.$("#" + self.field.nameID).kendoDateTimePicker();
                    case 'rtds':
                    case 'number':
                    case 'range':
                        var numericbox = this.$("#" + self.field.nameID).kendoNumericTextBox({
                            decimals: 4,
                            format: "##.#,####",
                            spinners: false,
                            culture: localStorage.getItem("idiomaSeleccionado"),
                        });
                        self.mutateFunction("#" + self.field.nameID);

                        break;
                    case 'turnoId':
                        this.$("#turnoId").kendoDropDownList({
                            valuePrimitive: true,
                            dataTextField: "text",
                            dataValueField: "value",
                            dataSource: self.parent.data2BindSITInfo.lTiposTurnos,
                            optionLabel: { text: window.app.idioma.t('SELECCIONE'), value: "" }
                        });
                        self.mutateFunction("#" + self.field.nameID);
                        break;
                    case 'orderId':
                        this.$("#orderId").kendoAutoComplete({
                            filter: "contains",
                            dataSource: self.parent.data2BindSITInfo.lOrdenesID,
                        });
                        //self.mutateFunction("#" + self.field.nameID);
                        break;
                    case 'orderTypeId':
                        this.$("#orderTypeId").kendoDropDownList({
                            valuePrimitive: true,
                            dataTextField: "text",
                            dataValueField: "value",
                            dataSource: self.parent.data2BindSITInfo.lTiposOrdenes,
                            optionLabel: { text: window.app.idioma.t('SELECCIONE'), value: "" }
                        });
                        self.mutateFunction("#" + self.field.nameID);
                        break;
                    case 'shcId':
                        this.$("#shcId").kendoAutoComplete({
                            filter: "contains",
                            dataSource: self.parent.data2BindSITInfo.lSHCIDs
                        });
                        // self.mutateFunction("#" + self.field.nameID);
                        break;
                    case 'lotId':
                        this.$("#lotId").kendoAutoComplete({
                            filter: "contains",
                            dataSource: self.parent.data2BindSITInfo.lotsIDs
                        });
                        //  self.mutateFunction("#" + self.field.nameID);
                        break;
                    case 'materialId':
                        this.$("#materialId").kendoAutoComplete({
                            filter: "contains",
                            dataSource: self.parent.data2BindSITInfo.lMaterials
                        });
                        //self.mutateFunction("#" + self.field.nameID);
                        break;
                    case 'location':
                        this.$("#location").kendoAutoComplete({
                            filter: "contains",
                            dataSource: self.parent.data2BindSITInfo.lLocationsID
                        });
                        // self.mutateFunction("#" + self.field.nameID);
                        break;
                }
                //disable all div
                if (self.parent.disableInputs && self.field.type != "file") {
                    $(self.el).attr("data-readonly", "");
                }

                if (localStorage.getItem("tecladoVirtual") == "true" && window.location.pathname.toLowerCase().indexOf("terminal") > 0) {
                    $('.keyboardOn').addClass("ui-keyboard-input ui-widget-content ui-corner-all");
                    if (localStorage.getItem("idiomaSeleccionado") == "en-GB") {
                        $('.keyboardOn').keyboard();
                    } else {
                        $('.keyboardOn').keyboard({ layout: 'spanish-qwerty' });
                    }

                    $('#orderId').change(function () {
                        $("#orderId").data("kendoAutoComplete").search($('#orderId').val());
                    });

                    $('#shcId').change(function () {
                        $("#shcId").data("kendoAutoComplete").search($('#shcId').val());
                    });

                    $('#lotId').change(function () {
                        $("#lotId").data("kendoAutoComplete").search($('#lotId').val());
                    });

                    $('#materialId').change(function () {
                        $("#materialId").data("kendoAutoComplete").search($('#materialId').val());
                    });

                    $('#location').change(function () {
                        $("#location").data("kendoAutoComplete").search($('#location').val());
                    });
                }

                return self; // enable chained calls
            },
            mutateFunction: function (ID) {
                var self = this;
                //FUNCION para marcar los campos especiales con bordes azul o amarillo, es necesario para ciertos campos especiales de Kendo
                //correct mutation event detection
                var hasMutationEvents = ("MutationEvent" in window),
                    MutationObserver = window.WebKitMutationObserver || window.MutationObserver;

                if (MutationObserver) {
                    var observer = new MutationObserver(function (mutations) {
                        var idx = 0,
                            mutation,
                            length = mutations.length;

                        for (; idx < length; idx++) {
                            mutation = mutations[idx];
                            if (mutation.attributeName === "class") {
                                self.updateCssOnPropertyChange(mutation);
                            }
                        }
                    }),
                    config = { attributes: true, childList: false, characterData: false };
                   
                    observer.observe(this.$(ID)[0], config);
                    
                } else if (hasMutationEvents) {
                    this.$(ID).bind("DOMAttrModified", this.updateCssOnPropertyChange);
                } else {

                    this.$(ID).attachEvent("onpropertychange", this.updateCssOnPropertyChange);

                }
            },
            updateCssOnPropertyChange: function (e) {
                var element = $(e.target || e.srcElement);

                element.siblings("span.k-dropdown-wrap")
                .add(element.parent("span.k-numeric-wrap"))
                .toggleClass("k-invalid", element.hasClass("k-invalid"));
                element.siblings("span.k-dropdown-wrap")
                .add(element.parent("span.k-numeric-wrap"))
                .toggleClass("invalidRequired", element.hasClass("invalidRequired"));
                element.siblings("span.k-dropdown-wrap")
                .add(element.parent("span.k-numeric-wrap"))
                .toggleClass("invalidRange", element.hasClass("invalidRange"));
            },
            initialize: function (f, g) {
                       
                this.field = f;
                this.parent = g;
                        
            },      
            events: {
                'click .toggleUp': 'toggleItemUp',
                'click .toggleDown': 'toggleItemDown',
                'click .destroy': 'deleteItem',
                'click .editField': 'editField',
                'click .k-filename': 'descargarArchivo',
                'click .rtdsBto': 'getRTDSValue'
            },
            getRTDSValue: function(container){
                var self = this;
                var numerictextbox = $("#" + this.field.nameID).data("kendoNumericTextBox");
                $(self.el).find('label').each(function (index) {
                    $(this).text(self.field.label + " (" + window.app.idioma.t('CARGANDO') + "...)");
                });
                // tag de prueba: B109_VELOCIDAD_NOMINAL     
                $.ajax({
                    type: 'POST',
                    async: true,
                    data: JSON.stringify({ tags: [self.field.rtdsName] }),
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    url: '../api/RTDSreadTags',
                    success: function (result) {
                        self.parent.formValues[self.field.nameID] = result[0].value;
                        numerictextbox.value(result[0].value);
                        numerictextbox.focus();//para la validaci�n
                        $(self.el).find('label').each(function (index) {
                            $(this).text(self.field.label);
                            
                        });
                    },
                    error: function (e) {
                        $(self.el).find('label').each(function (index) {
                            $(this).text(self.field.label + " (Error)");
                        });
                    }

                });
            },
            descargarArchivo: function(container) {
                var parent = $(container.currentTarget).parent().parent();
                var docName = container.currentTarget.innerText;
                var idForm = this.parent.formInstance.ID;
                var docType ="";
                var docExtension = "";
                this.parent.formFiles.forEach( function(file) {
                    if (file.name == docName) {
                        docType = file.type;
                        docExtension = file.extension;
                    }
                });
                //console.log("EMPEZAR� la descarga " + docName + " form " + this.parent.formTemplate.ID);
               
                //'use strict';
                //var pdf;
                $.ajax({
                    type: 'POST',
                    async: true,
                    data: JSON.stringify({idForm: idForm, docName: docName}),
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    url: '../api/ALTDownloadFile',
                    success: function (documento) {
                        if (documento != null) {
                            var data = documento;
                            var arrBuffer = base64ToArrayBuffer(data);

                            // It is necessary to create a new blob object with mime-type explicitly set
                            // otherwise only Chrome works like it should
                            var newBlob = new Blob([arrBuffer], { type: docType });

                            // IE doesn't allow using a blob object directly as link href
                            // instead it is necessary to use msSaveOrOpenBlob
                            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                                var byteCharacters = atob(data);
                                var byteNumbers = new Array(byteCharacters.length);
                                for (var i = 0; i < byteCharacters.length; i++) {
                                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                                }
                                var byteArray = new Uint8Array(byteNumbers);
                                var blob = new Blob([byteArray], { type: docType });
                                window.navigator.msSaveOrOpenBlob(blob, docName);
                                return;
                            }

                            // For other browsers: 
                            // Create a link pointing to the ObjectURL containing the blob.
                            var data = window.URL.createObjectURL(newBlob);

                            var link = document.createElement('a');
                            document.body.appendChild(link); //required in FF, optional for Chrome
                            link.href = data;
                            link.download = docName;
                            link.click();
                            window.URL.revokeObjectURL(data);
                            link.remove();

                            function base64ToArrayBuffer(data) {
                                var binaryString = window.atob(data);
                                var binaryLen = binaryString.length;
                                var bytes = new Uint8Array(binaryLen);
                                for (var i = 0; i < binaryLen; i++) {
                                    var ascii = binaryString.charCodeAt(i);
                                    bytes[i] = ascii;
                                }
                                return bytes;
                            }
                        }
                    },
                    error: function (e) {
                        console.log(e);
                        $("#txtErrorFile").text(window.app.idioma.t('ALT_ERROR_UPLOADING_FILE'));
                    }

                });

            },
           
            getDefaultStringHTML: function(HtmlOpt){
                var fieldString = '<br/><label><%-label%></label> <input id="<%-nameID%>" name="<%-nameID%>" ' + HtmlOpt + ' />';
                             
                return fieldString;
            },
            deleteItem: function () {
                       
                var index = this.parent.formTemplate.fieldsTemplate.indexOf(this.field);
                if (index >= 0) {
                    this.parent.formTemplate.fieldsTemplate.splice(index, 1);
                    this.parent.prepareForm();
                }
            },
            editField: function () {
                this.parent.toolBoxModel.set("newField", this.field); 
                this.parent.changeType();
                this.parent.toolBoxModel.set("modeEdit",true)
                this.parent.toolBoxModel.set("modeAdd",false);
            },
            toggleItemUp: function () {
                var index = this.parent.formTemplate.fieldsTemplate.indexOf(this.field);
                if (index >= 0) {
                    this.swapPos(index, index - 1);
                            
                }
            },
            toggleItemDown: function(){
                var index = this.parent.formTemplate.fieldsTemplate.indexOf(this.field);
                if (index >= 0) {
                    this.swapPos(index, index + 1);

                }
            },
            swapPos: function(oldPos, newPos) {
                if (newPos >= 0 && newPos < this.parent.formTemplate.fieldsTemplate.length) {
                    var temp = this.parent.formTemplate.fieldsTemplate[oldPos];
                    this.parent.formTemplate.fieldsTemplate[oldPos] = this.parent.formTemplate.fieldsTemplate[newPos];
                    this.parent.formTemplate.fieldsTemplate[newPos] = temp;
                    this.parent.prepareForm();
                }
            }
            });

return fieldInput;
});
