define(['jquery', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function ($, Not, VistaDlgConfirm) {
        var metodos = {
            //#region METODOS
            //1. Actualiza los datos de un documento
            ActualizarDocumento: function (container, options) {
                var _uid = container.currentTarget.className.split(" ")[4];
                var _row = $("#gridDocumentos").data("kendoGrid").tbody.find("tr[data-uid='" + _uid + "']");

                //Se obtiene la fila que se va a modificar, se obtiene el indice y se forza a llamar al evento de actualizar
                var dataItem = $("#gridDocumentos").data('kendoGrid').dataItems()[_row[0].rowIndex];
                if (typeof dataItem.id !== 'undefined') {
                    if (typeof dataItem !== 'undefined') {
                        dataItem.set('EditRow', dataItem.EditRow + 1);
                        this.dsDocumentos.sync();
                        $("#gridDocumentos").data("kendoGrid").refresh();
                    }

                } else {
                    this.dsDocumentos.sync();
                }

            },

            //2. Datasource de documentos a través de un ID de transporte
            DataSourceDocumentos: function (id) {
                var _self = this;
                var _tooltip = new kendo.template($("#tooltip").html());

                _self.dsDocumentos = new kendo.data.DataSource({
                    pageSize: 10,
                    batch: false,
                    async: false,
                    transport: {
                        read: {
                            url: "../api/GetDocuments/" + id,
                            dataType: "json"
                        },

                        update: {
                            url: "../api/UpdateDocument",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",


                        },
                        create: {
                            url: "../api/AddDocument",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "POST",

                        },
                        destroy: {
                            url: "../api/DeleteDocument",
                            type: "PUT",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json"
                        },
                        parameterMap: function (options, operation) {
                            if (operation !== "read" && options) {

                                if (typeof options.models !== 'undefined') {
                                    options.models[0].IdTransporte = id;
                                    options.models[0].IdTipoDocumento = options.models[0].TipoDocumento.IdTipoDocumento;
                                    options.models[0].Fichero = fileUpload.files != undefined ? fileUpload.files.length > 0 ? fileUpload.response : null : null;
                                    options.models[0].NombreFichero = fileUpload.files != undefined ? fileUpload.files.length > 0 ? fileUpload.files[0].name : null : null;
                                    return JSON.stringify(options.models[0]);
                                } else {
                                    if (operation == "create" || operation == "update") {
                                        options.Fichero = fileUpload != undefined ? fileUpload.files != undefined ? fileUpload.files.length > 0 ? fileUpload.response : null : null : null;
                                        options.NombreFichero = fileUpload != undefined ? fileUpload.files != undefined ? fileUpload.files.length > 0 ? fileUpload.files[0].name : null : null : null;
                                    }
                                    options.IdTransporte = id;
                                    options.IdTipoDocumento = options.TipoDocumento.IdTipoDocumento;

                                    return JSON.stringify(options);

                                }
                            }

                        }

                    },
                    requestEnd: function (e) {
                        var response = e.response;
                        var type = e.type;
                        if (typeof type !== 'undefined' && type !== "read" && type !== "create") {
                            $("#gridDocumentos").data("kendoGrid").dataSource.read();
                        } else if (response == null && type == "create") {
                            $("#gridDocumentos").data("kendoGrid").dataSource.read();
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t("ERROR_DOCUMENTO"), 4000);
                        }

                    },
                    schema: {
                        model: {
                            id: "IdDocumento",
                            fields: {
                                "IdDocumento": { type: "number", editable: false },
                                "Descripcion": {
                                    validation: {
                                        defaultValue: "-",
                                        required: {
                                            message: "La descripcion no puede estar vacía"
                                        }
                                    }
                                },
                                "NombreFichero": { type: "string", editable: false },
                                "TipoDocumento": {
                                    defaultValue: {
                                        IdTipoDocumento: 0, Descripcion: "Seleccione tipo de documento.."
                                    },
                                    validation: {
                                        required: true,
                                        customTipoDocumento: function (input) {
                                            if (input.attr("data-bind") == "value:TipoDocumento" && input.val() == 0) {
                                                input.attr("data-customTipoDocumento-msg", "Seleccione un valor");
                                                input.parents("td").append(tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                "Fichero": {},
                                "EditRow": { type: "number" }
                            }

                        }
                    }
                });



            },

            //3. Descarga un documento al hacer click sobre el nombre
            DescargarDocumento: function (container, options) {
                var _idDocumento = container.currentTarget.className.split(" ")[1];
                var _docName = container.currentTarget.innerHTML;

                $.ajax({
                    type: 'POST',
                    async: true,
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    url: '../api/DownloadFile/' + _idDocumento,
                    success: function (documento) {
                        if (documento != null) {
                            var data = documento;
                            var fileNamePDF = _docName.substr(_docName.length - 3);
                            var fileName = fileNamePDF.indexOf("pdf") !== -1 ? _docName : _docName + ".pdf";


                            var arrBuffer = base64ToArrayBuffer(data);

                            // It is necessary to create a new blob object with mime-type explicitly set
                            // otherwise only Chrome works like it should
                            var newBlob = new Blob([arrBuffer], { type: "application/pdf" });

                            // IE doesn't allow using a blob object directly as link href
                            // instead it is necessary to use msSaveOrOpenBlob
                            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                                var byteCharacters = atob(data);
                                var byteNumbers = new Array(byteCharacters.length);
                                for (var i = 0; i < byteCharacters.length; i++) {
                                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                                }
                                var byteArray = new Uint8Array(byteNumbers);
                                var blob = new Blob([byteArray], { type: 'application/pdf' });
                                window.navigator.msSaveOrOpenBlob(blob, fileName);
                                return;
                            }

                            // For other browsers: 
                            // Create a link pointing to the ObjectURL containing the blob.
                            var data = window.URL.createObjectURL(newBlob);

                            var link = document.createElement('a');
                            document.body.appendChild(link); //required in FF, optional for Chrome
                            link.href = data;
                            link.download = fileName;
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

                    }

                });



            },

            //4. Elimina un documento 
            DeleteDocument: function (container, options) {
                var _idDocument = container.currentTarget.className.split(" ")[2];
                $.ajax({
                    type: 'POST',
                    async: true,
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    url: '../api/DeleteDocument/' + _idDocument,
                    success: function (result) {

                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GUARDAR'), 4000);
                        }
                    }

                });
            },

            //5. Metodo que carga un archivo
            FileUploadEditor: function (container, options) {
                var _self = this;
                _self.fileUpload = [];

                if (sessionStorage.initialFiles === undefined) {
                    sessionStorage.initialFiles = [];
                }


                //var initialFiles = JSON.parse(sessionStorage.initialFiles);

                $('<input type="file" name="fileUpload" id="fileUploadDocumento' + options.model.id + '" />')
                    .appendTo(container)
                    .kendoUpload({
                        async: {
                            saveUrl: "../api/UploadFile",
                            //dataType: 'json'
                        },
                        localization: {
                            select: window.app.idioma.t('SELECCIONE') + "...",
                            headerStatusUploading: window.app.idioma.t('CARGANDO') + "...",
                            headerStatusUploaded: window.app.idioma.t('TERMINADO')
                        },
                        success: function (data) { _self.fileUpload = data },
                        multiple: false,
                        upload: onUpload,
                        error: function (err) {

                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t("ARCHIVO_INCOMPATIBLE"), 4000);
                            }
                        }
                    });

                function onUpload(e) {
                    // An array with information about the uploaded files
                    var files = e.files;
                    // Checks the extension of each file and aborts the upload if it is not .jpg
                    $.each(files, function () {
                        if (this.extension.toLowerCase() != ".pdf") {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t("ARCHIVO_INCOMPATIBLE"), 4000);
                            e.preventDefault();
                        }
                    });
                }
            },

            //6. DropDown de tipo de documento
            NombreTipoDocumentoDropDownEditor: function (container, options) {
                $('<input data-text-field="Descripcion" required data-value-field="IdTipoDocumento" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: false,
                        dataSource: {

                            transport: {
                                read: {
                                    url: "../api/GetDocumentType",
                                    dataType: "json"
                                }

                            }
                        }
                    });

            },

            //7. Metodo que define el grid de documentos a traves del id de transporte
            ObtenerDocumentos: function (id) {
                var _self = this;
                _self.DataSourceDocumentos(id);

                //Si ya existe el grid lo eliminamos
                if ($("#gridDocumentos").data("kendoGrid") !== undefined) {
                    $("#gridDocumentos").data("kendoGrid").destroy();
                }

                //Se define nuevamente el grid
                _self.gridDocumentos = $("#gridDocumentos").kendoGrid({
                    dataSource: _self.dsDocumentos,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    resizable: true,
                    //autoSync: false,
                    //scrollable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [30, 100, 200, 'All'],
                        buttonCount: 2,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    toolbar: [{ name: "create", text: window.app.idioma.t("AGREGAR"), id: "AddDocument", hidden: true }],
                    editable: "inline",
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    columns: [
                        {
                            field: "IdDocumento",
                            hidden: true,
                            template: '#=typeof IdDocumento !== "undefined"? IdDocumento: 0#'
                        },
                        {
                            field: "TipoDocumento",
                            width: '20%',
                            title: window.app.idioma.t("TIPO_DOCUMENTO"),
                            editor: _self.NombreTipoDocumentoDropDownEditor,
                            validation: { required: true },
                            template: '#=TipoDocumento != null? TipoDocumento.Descripcion: ""#'
                        },
                        {
                            field: "Descripcion",
                            width: "30%",
                            title: window.app.idioma.t("DESCRIPCION"),
                            template: '#=typeof Descripcion !== "undefined" && Descripcion != null ? Descripcion: "0"#'
                        },
                        {
                            field: "Fichero",
                            width: "30%",
                            title: window.app.idioma.t("FICHERO_ADJUNTO"),
                            template: "<a  style='cursor:pointer' class='k-download-Document #=typeof IdDocumento !== 'undefined'? IdDocumento: 0 # #=typeof NombreFichero !== 'undefined'? NombreFichero : ''#'>#=typeof NombreFichero !== 'undefined'? NombreFichero: Descargar #</a>",
                            editor: _self.FileUploadEditor
                        },
                        //{
                        //    field: "Fichero",
                        //    width: "20%",
                        //    template: "<a class='k-button k-download-Document #=typeof IdDocumento !== 'undefined'? IdDocumento: 0 # #=typeof NombreFichero !== 'undefined'? NombreFichero : ''#'>Descargar</a><a class='k-button k-delete-Document #=typeof IdDocumento !== 'undefined'? IdDocumento: 0 # #=typeof NombreFichero !== 'undefined'? NombreFichero : ''#'>Eliminar</a>",

                        //    attributes: { "align": "center" }
                        //},
                        {
                            field: "EditRow",
                            hidden: true,
                            nullable: true
                        },
                        {
                            field: "coms",
                            title: window.app.idioma.t("OPERACIONES"),
                            attributes: { "align": "center" },
                            command: [
                                {
                                    name: "edit", text: "Editar"
                                },
                                {
                                    name: "Delete", text: "Eliminar",
                                    click: function (e) {

                                        e.preventDefault(); //prevent page scroll reset

                                        var grid = $("#gridDocumentos").data("kendoGrid");
                                        var tr = $(e.target).closest("tr"); //get the row for deletion
                                        var data = this.dataItem(tr); //get the row data so it can be referred later

                                        this.confirmacion = new VistaDlgConfirm({
                                            titulo: window.app.idioma.t('ELIMINAR_DOCUMENTO'), msg: window.app.idioma.t('DESEA_REALMENTE_ELIMINAR_ESTE_DOCUMENTO'), funcion: function () {
                                                grid.dataSource.remove(data);  //prepare a "destroy" request
                                                grid.dataSource.sync();  //actually send the request (might be ommited if the autoSync option is enabled in the dataSource)
                                                grid.dataSource.read();
                                                Backbone.trigger('eventCierraDialogo');
                                            }, contexto: this
                                        });
                                    }

                                }], width: "250px"
                        }
                    ],
                    edit: function (container) {
                        //self.RemoveFichero();
                        var commandCell = container.container.find("td:last");
                        commandCell.html('<a class="k-button k-button-icontext k-primary k-grid-updateDocumento ' + container.model.uid + '">' + window.app.idioma.t("ACTUALIZAR") + '</a><a class="k-button k-button-icontext k-grid-cancel">' + window.app.idioma.t("CANCELAR") + '</a>');

                    },
                    cancel: function () {
                        $("#gridDocumentos").data("kendoGrid").dataSource.read();

                    },

                    dataBinding: function (e) {
                        //e.preventDefault();
                        if (e.action == "remove") e.preventDefault();
                        kendo.ui.progress($("#gridDocumentos"), false);
                    },
                    dataBound: function () {
                        var grid = this;

                        var data = this._data;

                        var itemsGridTransport = $("#gridTransportes").data("kendoGrid").items();

                        $('.k-grid-add').hide();
                        itemsGridTransport.each(function (idx, item) {
                            if ($(item).is('.k-state-selected')) {
                                $('.k-grid-add').show();
                            }
                        });

                        for (var x = 0; x < data.length; x++) {
                            var dataItem = data[x];
                            var NombreFichero = dataItem.NombreFichero;
                            var IdDocumento = dataItem.IdDocumento;
                            if (NombreFichero == "" || NombreFichero == null) {
                                $(".k-download-Document." + IdDocumento).hide();
                                $(".k-delete-Document." + IdDocumento).hide();
                            }
                        }
                        kendo.ui.progress($("#gridDocumentos"), false);
                    }
                }).data("kendoGrid");
            },

            //8. Metodo que muestra un mensaje de confirmación para eliminar un fichero (actualmente fuera de uso)
            removeFichero: function (container, options) {
                var _idDocument = typeof container !== 'undefined' ? container.currentTarget.className.split(" ").length >= 2 ? container.currentTarget.className.split(" ")[2] : 0 : 0;
                var _self = this;

                if (_idDocument != 0) {
                    this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('ELIMINAR_FICHERO'), msg: window.app.idioma.t('DESEA_REALMENTE_ELIMINAR_ESTE_FICHERO'), funcion: function () { _self.RemoveFicheroConfirm(container, options, idDocument); }, contexto: this });
                } else {
                    _self.RemoveFicheroConfirm(container, options, _idDocument);
                }
            },

            //9. Metodo que se ejecuta al confirmar la eliminación de un fichero (actualmente fuera de uso)
            RemoveFicheroConfirm: function (container, options, idDocument) {
                var _self = this;
                $.ajax({
                    type: 'PUT',
                    dataType: 'json',
                    url: '../api/RemoveFile/' + idDocument,
                    async: true,
                    success: function (documento) {
                        _self.uploadFile = 0;
                        $("#gridDocumentos").data("kendoGrid").dataSource.read();

                    },
                    error: function (err) {
                        if (err.status != 200) {
                            $("#gridDocumentos").data("kendoGrid").dataSource.read();
                            Backbone.trigger('eventCierraDialogo');
                        }

                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }

                });
            },

            //#endregion METODOS
        }

        return metodos;
    });

