define(['underscore', 'backbone', 'jquery', 'text!/ALT/html/ALTFormFieldFilesTem.html', 'compartido/notificaciones', 'ALT/vALTUtils','vistas/vDialogoConfirm' ],
    function (_, Backbone, $, htmlTemplante, Not, vALTUTils, VistaDlgConfirm ) {
        var altUtils = new vALTUTils();
        var filesTemplate = Backbone.View.extend({
            tagName: 'div',
            template: _.template(htmlTemplante),
            parent: null,
            field: null,
            fieldFiles: null,
            ds: null,
            initialize: function (field, parent) {                
                //reset default values
                var self = this;
                this.field = field;
                this.parent = parent;
                this.fieldFiles = parent.fieldsFilesV2.filter(function (f) { return f.fieldName == field.nameID; }); //filtramos solo los archivos que son suyos.

               
            },
            render: function () {
                var self = this;
                $(this.el).css("width", "100%"); //para que ocupe un minimo          
                $(this.el).html(this.template());
               

                this.$('.labelTxt').html(this.field.label);
                //file DOM "<a id='btnDescargar' class='k-button k-button-icontext k-grid-add'><span class='k-icon k-add'></span>descargar</a>" +
                this.$(".fielField").kendoUpload({
                    async: {
                        saveUrl: "../api/ALTuploadFileV2/" + self.field.nameID,
                        removeUrl: "remove",
                    },
                    files: self.fieldFiles,
                    validation: {
                        maxFileSize: 5000000 //5 MB
                    },
                    localization: {
                        select: window.app.idioma.t('SELECCIONE') + "...",
                        headerStatusUploading: window.app.idioma.t('CARGANDO') + "...", //SELECCIONE
                        headerStatusUploaded: window.app.idioma.t('TERMINADO')
                    },
                    remove: function (e) {
                       
                        e.preventDefault();                      

                        if (e.files[0]) {
                            fileUidToRemove = e.files[0].uid;
                            var liDOMElement = $("li[data-uid=" + fileUidToRemove + "]");
                            this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('ELIMINAR_FICHERO'), msg: window.app.idioma.t('ELIMINAR_FICHERO_DIALOG'), funcion: function () { self.RemoveFicheroConfirm(e.files[0], liDOMElement); }, contexto: this });
                        }
                    },
                    success: function (e) {
                        self.$(".txtErrorFile").text("");
                        self.parent.fieldsFilesV2.push(e.response);
                    },
                    error: function (e) {

                        switch (e.XMLHttpRequest.status) {
                            case 406: //Archivo demasiado grande para la configuraci�n del IIS
                                self.$(".txtErrorFile").text(window.app.idioma.t('ALT_ERROR_UPLOADING_FILE_SIZE'));
                                break;
                            case 409://Archivo ya existe en BD con el mismo nombre para el formulario
                                self.$(".txtErrorFile").text(window.app.idioma.t('ALT_ERROR_UPLOADING_FILE_DUPLICADO'));
                                break;
                            default:
                                self.$(".txtErrorFile").text(window.app.idioma.t('ALT_ERROR_UPLOADING_FILE'));
                        }
                    }
                    // multiple: false
                });
                
                if ((!self.parent.modeConfig && !self.field.editableInRuntime) || self.parent.disableInputs) {
                    // Deshabilitamos the Upload si en modo ejecíón y no es editable en runtime o estamos en modo visualizacion (form FINALIZADO)
                    //var upload = this.$("#file").data("kendoUpload");
                    //upload.disable();
                    this.$('.k-upload-button').hide();
                    this.$('.k-upload-status').hide();
                }

                //si estamos en modo configuraci�n dejaremos botones de edici�n los campos  sino los escondemos             
                if (!self.parent.modeConfig)
                    this.$(".divConfigControls").css("display", "none");


                return this;
            },
            events: {                
                //methods for configmode
                'click .k-filename': 'descargarArchivo',
                'click .toggleUp': 'toggleItemUp',
                'click .toggleDown': 'toggleItemDown',
                'click .destroy': 'deleteItem',
                'click .editField': 'editField',
            },
            descargarArchivo: function (container) {
                var parent = $(container.currentTarget).parent().parent();
                var docName = container.currentTarget.innerText;
                var idFile = -1;
                //var idForm = this.parent.formInstance.ID;
                var docType = "";
                var docExtension = "";
                this.parent.fieldsFilesV2.forEach(function (file) {
                    if (file.name == docName) {
                        idFile = file.ID;
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
                    data: JSON.stringify({ idFile: idFile}),
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    url: '../api/ALTDownloadFileV2',
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
            RemoveFicheroConfirm: function (file, elementDOM) {
                var self = this;
                var index = -1;
                this.parent.fieldsFilesV2.forEach(function (f, i) {
                    if (file.ID) {
                        if (f.ID == file.ID) {
                            index = i;
                            return;
                        }
                    } else {
                        if (f.fieldName == self.field.nameID && f.name == file.name) {
                            index = i;
                            return;
                        }
                    }
                });
                if (index >= 0) {
                    this.parent.fieldsFilesV2.splice(index, 1);
                    elementDOM.remove();
                    $("#txtErrorFile").text("");
                } else {
                    $("#txtErrorFile").text(window.app.idioma.t('ALT_ERROR_BORRAR_ARCHIVO'));
                }
                Backbone.trigger('eventCierraDialogo');
            },
            //METHODS FOR CONFIG MODE
            deleteItem: function () {

                var index = this.parent.formTemplate.fieldsTemplate.indexOf(this.field);
                if (index >= 0) {
                    this.parent.formTemplate.fieldsTemplate.splice(index, 1);
                    this.parent.prepareForm();
                }

                //parte especifica para el control field. Si borramos eliminaremos todos los archivos de la lista
                var self = this;
                var files2Delete = self.parent.fieldsFilesV2.filter(function (f) { return f.fieldName == self.field.nameID; });
                files2Delete.forEach(function (f) {
                    var index = self.parent.fieldsFilesV2.indexOf(f);
                    if (index >= 0) {
                        self.parent.fieldsFilesV2.splice(index, 1);                        
                    }
                });
            },
            editField: function () {
                this.parent.toolBoxModel.set("newField", this.field);
                this.parent.changeType();
                this.parent.toolBoxModel.set("modeEdit", true)
                this.parent.toolBoxModel.set("modeAdd", false);
            },
            toggleItemUp: function () {
                var index = this.parent.formTemplate.fieldsTemplate.indexOf(this.field);
                if (index >= 0) {
                    this.swapPos(index, index - 1);

                }
            },
            toggleItemDown: function () {
                var index = this.parent.formTemplate.fieldsTemplate.indexOf(this.field);
                if (index >= 0) {
                    this.swapPos(index, index + 1);

                }
            },
            swapPos: function (oldPos, newPos) {
                if (newPos >= 0 && newPos < this.parent.formTemplate.fieldsTemplate.length) {
                    var temp = this.parent.formTemplate.fieldsTemplate[oldPos];
                    this.parent.formTemplate.fieldsTemplate[oldPos] = this.parent.formTemplate.fieldsTemplate[newPos];
                    this.parent.formTemplate.fieldsTemplate[newPos] = temp;
                    this.parent.prepareForm();
                }
            }
        });
        
        return filesTemplate;
    }
);