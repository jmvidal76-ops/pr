define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/ArchivosAdjuntosLote.html',
    'compartido/notificaciones',
    'jszip', 'compartido/utils', '../../../../Portal/js/constantes'
],
    function (_, Backbone, $, plantilla, Not, JSZip, utils, enums) {
        var vistaArchivosAdjuntosLote = Backbone.View.extend({
            tagName: 'div',
            id: 'divArchivosAdjuntosLote',
            template: _.template(plantilla),
            constEnlacesExternos: enums.EnlacesExternos(),
            constTipoMovimientoLote: enums.TipoMovimientoLote(),
            initialize: function ({ parent, data }) {
                const self = this;
                window.JSZip = JSZip;
                self.parent = parent;
                self.data = data;

                self.ficherosKD_DS = new kendo.data.DataSource({
                    data: []
                });

                self.ValidarPermisos(self);

                self.render();                
            },
            render: function () {
                const self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                const uploadWidget = $("#inpt_ArchivosAdjuntosLote").kendoUpload({
                    async: {
                        saveUrl: `../api/Documentos/UploadFile/${self.constEnlacesExternos.ARCHIVOS_ADJUNTOS_LOTE}?extensions=pdf;jpg;jpeg`,
                        removeUrl: "../api/Documentos/RemoveFile/" + self.constEnlacesExternos.ARCHIVOS_ADJUNTOS_LOTE,
                        autoUpload: false
                    },
                    localization: {
                        select: window.app.idioma.t('SELECCIONE') + "...",
                        headerStatusUploading: window.app.idioma.t('CARGANDO') + "...",
                        headerStatusUploaded: window.app.idioma.t('TERMINADO'),
                        remove: window.app.idioma.t('ELIMINAR'),
                        uploadSelectedFiles: window.app.idioma.t('CARGAR_ARCHIVOS')
                    },
                    multiple: true,
                    validation: {
                        allowedExtensions: [".pdf", ".jpg", ".jpeg"],
                    },
                    enabled: self.permisoSubirArchivo,
                    //files: self.data && self.data.NombreArchivoBoletinAnalisis ? [{ name: self.data.NombreArchivoBoletinAnalisis, size: 2000, extension: "pdf" }] : [],
                    select: function (e) {
                        e.files = e.files
                            .map(m => {
                                if (!m.renamed) {
                                    // Saneamos el nombre del archivo (sin puntos)
                                    let newName = SanearNombreArchivo(m.name);
                                    newName = newName.replace(/(?=\.[^.]+$)/, `_${self.data.id}${self.data.tipoLote}`);
                                    m.name = newName;

                                    m.renamed = true;
                                }
                                //m.name = m.renamed ? m.name : m.name.replace(/(?=\.[^.]+$)/, `_${self.data.id}${self.data.tipoLote}`);
                                
                                return m;
                            });

                        const duplicated = $.grep(e.files, (v, idx) => e.sender.fileNames.includes(v.name));

                        if (duplicated.length) {
                            e.preventDefault();
                            const filtered = $.grep(e.files, (v, idx) => !e.sender.fileNames.includes(v.name));
                            if (filtered.length) {
                                e.sender._module.onSelect({ target: e.sender.wrapper }, filtered);                                
                            }
                        }                        
                    },
                    upload: function (e) {

                        if (!e.sender.uploading) {
                            e.sender.uploading = true;
                            e.sender.filesUploaded = 0;
                            e.sender.totalFiles = $("#div_ArchivosAdjuntosLote .k-upload-files li:not(.k-file-success)").length;
                        }
                        e.data = {
                            newFileName: e.files[0].name
                        } 
                    },
                    remove: function (e) {

                        e.sender.isUploaded = e.sender.fileNames.some(s => s == e.files[0].name);
                        if (e.sender.isUploaded) {
                            if (!e.sender.removeFileCall) {
                                e.preventDefault();
                                OpenWindow(window.app.idioma.t("AVISO"),
                                    window.app.idioma.t("AVISO_BORRAR_ARCHIVO_ADJUNTO"),
                                    function () {
                                        e.sender.removeFileCall = true;
                                        $(`span[title='${e.files[0].name}']`).closest("li").find(".k-delete").parent(".k-upload-action").click();
                                    }
                                );
                                return;
                            }
                        }

                        if (e.sender.isUploaded) {
                            e.data = {
                                newFileName: e.files[0].name
                            };
                        }

                        e.sender.removeFileCall = false;
                    },
                    success: async function (e) {

                        let actualizarFicheros = false;

                        if (e.operation == "upload") {
                            // Comprobamos si se han subido todos los archivos                            
                            e.sender.filesUploaded++;
                            e.sender.fileNames.push(e.files[0].name);

                            if (e.sender.filesUploaded >= e.sender.totalFiles) {
                                e.sender.uploading = false;
                                actualizarFicheros = true;
                            }
                        }

                        if (e.operation == "remove") {
                            e.sender.fileNames = e.sender.fileNames.filter(f => f != e.files[0].name);
                            if (e.sender.isUploaded) {
                                e.sender.isUploaded = false;
                                actualizarFicheros = true;
                            }
                        }

                        if (actualizarFicheros) {
                            e.sender.updateFiles(e.sender);
                        }
                    },
                    error: function (e) {
                        let err = e.XMLHttpRequest;
                        e.sender.isUploaded = false;

                        if (e.operation == "upload") {
                            e.sender.filesUploaded++;

                            if (e.sender.filesUploaded >= e.sender.totalFiles) {
                                e.sender.uploading = false;
                                e.sender.updateFiles(e.sender);
                            }
                        }
                        //e.sender.errorFileUID = e.files[0].uid;

                        if (err.status == '403') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            if (e.XMLHttpRequest.status == 406) {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('FORMATO_FICHERO_NO_VALIDO'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GUARDANDO_ARCHIVO'), 4000);
                            }
                        }
                    }
                }).getKendoUpload();

                uploadWidget.updateFiles = function (widget) {
                    if (self.data) {
                        self.ActualizarFicherosAdjuntosLote(widget.fileNames)
                            .then(() => {
                                self.parent.ActualizarGrid();
                                self.CargarFicheros();

                                // Centramos de nuevo la ventana
                                $("#divArchivosAdjuntosLote").getKendoWindow().center();
                            })
                            .catch((er) => {
                                console.log(er);
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ASOCIANDO_ARCHIVO_LOTE'), 4000);
                            })
                    }                    
                };

                $("#kd-ficheros").kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: self.ficherosKD_DS,
                    optionLabel: window.app.idioma.t("SELECCIONE"),
                    change: function (e) {
                        self.CambioVisorArchivos(e.sender.value());
                    }
                });

                $("#inpt_visorArchivo").click(function (e) {
                    const fileName = $("#kd-ficheros").getKendoDropDownList().value();
                    const components = fileName.split(".");
                    const extension = components.pop();

                    const file = encodeURI(components.join("."));

                    window.open(`../api/Documentos/ServeFile/${self.constEnlacesExternos.ARCHIVOS_ADJUNTOS_LOTE}/${file}?extension=${extension}`, '_blank');

                    return;

                    //let pdfName = $("#inpt_BoletinAnalisis").getKendoUpload().newFileName;

                    let ventanaVisorFichero = $("<div id='dlgVisorFichero'/>").kendoWindow({
                        title: fileName,
                        width: "95%",
                        height: "95%",
                        draggable: false,
                        scrollable: false,
                        close: function () {
                            ventanaVisorFichero.getKendoWindow().destroy();
                        },
                        resizable: false,
                        modal: true,
                    });

                    if (fileName.toLocaleLowerCase().includes("pdf"))
                    {
                        let template = kendo.template($("#visorPDF").html());
                        ventanaVisorFichero.getKendoWindow()
                            .content(template({}))
                            .center().open();
                    }
                    else if (fileName.toLocaleLowerCase().includes("jpg") || fileName.toLocaleLowerCase().includes("jpeg"))
                    {
                        let template = kendo.template($("#visorJPG").html());
                        ventanaVisorFichero.getKendoWindow()
                            .content(template({}))
                            .center().open();
                    }

                    $.get(`../api/Documentos/ShowPDF/${self.constEnlacesExternos.ARCHIVOS_ADJUNTOS_LOTE}?file=${fileName}`, (data) => {
                        $("#pdfViewer").attr("data", `data:application/pdf;base64,${data}`)
                    })
                        .fail(function (err) {
                            $("#errorPdf").show();
                        })
                });

                self.CargarFicheros(true);

                self.window = $(self.el).kendoWindow({
                    title: window.app.idioma.t("ARCHIVOS_ADJUNTOS"),
                    //maxWidth: "60%",
                    //height: "60%",
                    close: function () {
                        self.window.destroy();
                        self.window = null;
                        self.parent.windowAA = null;
                        self.eliminar();
                    },
                    resizable: false,
                    modal: true
                }).data("kendoWindow");

                self.window.center();
            },
            CambioVisorArchivos: function (estado) {
                const self = this;

                if (self.permisoVerArchivo) {
                    if (estado) {
                        $("#inpt_visorArchivo").removeClass("disabled");
                    } else {
                        $("#inpt_visorArchivo").addClass("disabled");
                    }
                }                
            },
            ActualizarFicherosAdjuntosLote: async function (nombreArchivos) {
                const self = this;

                const data = {
                    IdLote: self.data.id,
                    TipoLote: self.data.tipoLote,
                    NombreArchivosAdjuntos: nombreArchivos
                }

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "PUT",
                        url: "../api/ControlStock/FicherosAdjuntos",
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(data),
                        success: function (data) {
                            resolve();
                        },
                        error: function (err) {
                            reject(err);
                        }
                    });
                })                
            },
            CargarFicheros: function (k_widget = false) {
                const self = this;

                self.ObtenerFicherosAdjuntos()
                    .then((d) => {
                        // Carga inicial de los ficheros en el widget
                        if (k_widget) {
                            const ku = $("#inpt_ArchivosAdjuntosLote").getKendoUpload();

                            const files = d.NombreArchivosAdjuntos.map(m => ({
                                name: m,
                                size: 2000,
                                extension: m.split('.').pop()
                            }));

                            ku._renderInitialFiles(files);
                            ku.fileNames = files.map(m => m.name);

                            // Centramos de nuevo la ventana
                            $("#divArchivosAdjuntosLote").getKendoWindow().center();
                        }

                        self.ficherosKD_DS = new kendo.data.DataSource({
                            data: d.NombreArchivosAdjuntos.map(m => ({ value: m, text: m }))
                        });

                        const kdp = $("#kd-ficheros").getKendoDropDownList()
                        kdp.setDataSource(self.ficherosKD_DS);
                        kdp.select(null);
                    })
                    .catch((er) => {
                        console.log("Error cargando archivos adjuntos");
                        console.warn(er);
                    })
            },
            ObtenerFicherosAdjuntos: async function () {
                const self = this;

                const data = {
                    idLote: self.data.id,
                    tipoLote: self.data.tipoLote
                }

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: "../api/ControlStock/FicherosAdjuntos",
                        contentType: "application/json; charset=utf-8",
                        data: data,
                        success: function (data) {
                            resolve(data);
                        },
                        error: function (err) {
                            reject(err);
                        }
                    });
                })
            },
            ValidarPermisos: function (self) {

                // Botón ver PDF
                self.permisoVerArchivo = TienePermisos([251, 253, 306, 308, 113, 310, 225]);

                // Widget Subir archivos
                self.permisoSubirArchivo = TienePermisos([252, 254, 307, 309, 226, 311, 224]);

            },
            eliminar: function () {
                this.remove();
            }
        });
        return vistaArchivosAdjuntosLote;
    });