define(['underscore', 'backbone', 'jquery', 'text!/ALT/html/ALTTemplatesForms.html', 'ALT/vAltFormComponent', 'ALT/vALTUtils', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, ALTConfigurationTemplate, VistaFormComponent, AltUtils, VistaDlgConfirm, Not) {
        var altUtils = new AltUtils();
        var checkedItems;
        var gridGestionForms = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            vistaFormComponent: null,
            idDepartmentType: null,
            template: _.template(ALTConfigurationTemplate),
            initialize: function (idDepar) {
                var self = this;
                self.idDepartmentType = idDepar;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);
            },
            render: function () {
                $(this.el).html(this.template())
                var self = this;

                checkedItems = [];

                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/TemplatesForms/" + self.idDepartmentType + "/",
                            dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                            cache: true
                        }
                    },
                    pageSize: 20,
                    /* schema: {
                         model: {
                             fields: {
                                 'id': { type: "int" },
                                 'name': { type: "string" },
                                 'descript': { type: "string" }
                             }
                         }
                     },	*/
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    },
                    sort: { field: "name", dir: "asc" }
                });

                self.grid = this.$("#gridGestionForms").kendoGrid({
                    dataSource: self.ds,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    toolbar: [
                        {
                            name: "create",
                            text: window.app.idioma.t('ALT_CREATE_TEMPLATE'),
                            template: "<a id='btnCrearTemplate' class='k-button k-button-icontext k-grid-add' style=' background-color:green;color:white;'><span class='k-icon k-add'></span>" + window.app.idioma.t('NUEVO') + "</a>"
                        },
                        {
                            template: "<button id='btnExportarPdf' class='k-button k-button-icontext' style='float:right;'>" + window.app.idioma.t('ALT_EXPORTAR_PDF') + "</button>"
                        },
                        {
                            template: "<div id='wrapper' style='float: right;'><input type='file' name='fileUpload' id='btnImportar' /></div>"
                        },
                        {
                            template: "<button id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext k-i-delete'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        }
                    ],
                    sortable: true,
                    resizable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            width: 30,
                            template: "<input type='checkbox' class='checkbox' style='margin-left: 1px' />",
                            headerTemplate: "<input id='checkSelectAll' type='checkbox' />"
                        },
                        {
                            title: "", // window.app.idioma.t("EDITAR") + " / " + window.app.idioma.t("COPIAR"), //no esta copiar
                            command:
                            {
                                template: "<a id='btnEditar' class='k-button k-grid-edit' title='" + window.app.idioma.t('EDITAR') + "' style='min-width:16px !important;'><span class='k-icon k-edit'></span></a>" +
                                    "<a id='btnCopiar' class='k-button' title='" + window.app.idioma.t('COPIAR') + "' style='min-width:16px;'><img  src='/ALT/img/ALT_copy.png' style='width: 16px !important; height:16px !important'/></a>" +
                                    //  "<div id='wrapper' ><input type='file' name='fileUpload' id='btnExportar' class='btnExportar' /></div>"
                                    "<a id='btnExportar' class='k-button' title='" + window.app.idioma.t('EXPORTAR') + "' style='min-width:16px !important;'><img  src='/ALT/img/ALT_export.png' style='width: 16px !important; height:16px !important'/></a>"
                            },
                            width: "130px",
                            filterable: false
                        },
                        {
                            field: "typeID",
                            title: window.app.idioma.t('TIPO'),
                            width: 150,
                            template: "#=window.app.idioma.t(typeID)#",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px !important; height:14px !important; margin-right:5px !important;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=typeID#' style='width: 14px !important;height:14px !important;margin-right:5px !important;'/>#=window.app.idioma.t(typeID)#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "name",
                            title: window.app.idioma.t('NOMBRE'),
                            width: 300,
                        },
                        {
                            field: "descript",
                            title: window.app.idioma.t('DESCRIPCION'),
                            filterable: false
                        },
                        {
                            title: window.app.idioma.t("ELIMINAR"),
                            command:
                            {
                                template: "<a id='btnBorrar' class='k-button k-grid-delete' style='min-width:16px !important;'><span class='k-icon k-delete'></span></a>"
                            },
                            width: "70px",
                            filterable: false
                        }
                    ],
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");

                //on page change reset selected
                $(self.el).find(".k-pager-numbers").on("click", function () {
                    $("#checkSelectAll").prop('checked', false);
                    checkedItems = [];
                });
                $(self.el).find(".k-pager-nav").on("click", function () {
                    $("#checkSelectAll").prop('checked', false);
                    checkedItems = [];
                });
                $(self.el).find(".k-pager-sizes").on("click", function () {
                    $("#checkSelectAll").prop('checked', false);
                    checkedItems = [];
                });

                //bind click event to the checkbox
                self.grid.table.on("click", ".checkbox", self.selectRow);

                this.$("#btnImportar").kendoUpload({
                    localization: {
                        select: window.app.idioma.t('IMPORTAR')
                    },
                    async: {
                        saveUrl: "../api/importForm/" + self.idDepartmentType + "/",
                        contentType: false,
                        dataType: 'json',
                        autoUpload: true,
                    },
                    showFileList: false,
                    multiple: false,
                    validation: {
                        allowedExtensions: [".json"]
                    },
                    success: function(res) {
                        self.ds.read();
                        if (res.response[0] == true) {
                            $("#gridGestionForms").data('kendoGrid').dataSource.read();
                            $("#gridGestionForms").data('kendoGrid').refresh();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res.response[1], 2000);
                        }
                        else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res.response[1], 2000);
                    },
                    error: function (e) {
                        if (e.response.status == '403' && e.response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ALT_error_importar'), 2000);
                        }
                    }
                });

                //Removing the "Drop files here message"
                this.$("#btnImportar").closest(".k-upload").find(".k-dropzone em").remove();
                self.resizeGrid();

                return self; // enable chained calls
            },
            events: {
                'click #btnCrearTemplate': 'crearTemplate',
                'click #btnEditar': 'editarTemplate',
                'click #btnCopiar': 'copiarTemplate',
                'click #btnBorrar': 'confirmarBorrado',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnExportar': 'exportarTemplate',
                'click #btnImportar': 'importarTemplate',
                'click #checkSelectAll': 'selectRowAll',
                'click #btnExportarPdf': 'exportarPdf',
            },
            selectRowAll: function (e) {
                var checked = $("#checkSelectAll:checked").val();
                var rows = $("#gridGestionForms").find("tr");
                var grid = $("#gridGestionForms").data("kendoGrid");
                checkedItems = [];

                if (checked) {
                    for (var i = 1; i < rows.length; i++) {
                        $(rows[i]).addClass("k-state-selected");
                        var dataItem = grid.dataItem(rows[i]);
                        checkedItems.push(dataItem);
                    }
                    $("#gridGestionForms").find(".checkbox").prop('checked', true);
                    checkedItems.push()
                } else {
                    $("#gridGestionForms").find("tr").removeClass("k-state-selected");
                    $("#gridGestionForms").find(".checkbox").prop('checked', false);
                }
            },
            selectRow: function () {
                var checked = this.checked,
                    row = $(this).closest("tr"),
                    grid = $("#gridGestionForms").data("kendoGrid"),
                    dataItem = grid.dataItem(row);

                if (checked) {
                    //select the row
                    checkedItems.push(dataItem);
                    row.addClass("k-state-selected");
                } else {
                    //remove selection
                    row.removeClass("k-state-selected");
                    $("#checkSelectAll").prop('checked', false);
                    var index = checkedItems.indexOf(dataItem);

                    if (index > -1) {
                        checkedItems.splice(index, 1);
                    }
                }
            },
            // Para los controles de tipo texto con formato que tienen iframe
            inlineIframesInExportContent: function (callback) {
                const $iframes = $('#exportContent iframe');
                let pending = $iframes.length;

                if (pending === 0) {
                    return callback();
                }

                $iframes.each(function () {
                    const iframe = this;

                    function processIframe() {
                        try {
                            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                            const iframeHtml = $(iframeDoc.body).html();
                            const $replacement = $('<div></div>').html(iframeHtml);
                            $(iframe).replaceWith($replacement);
                        } catch (e) {
                            console.warn('No se puede acceder al iframe: ', iframe.src);
                        } finally {
                            pending--;
                            if (pending === 0) callback();
                        }
                    }

                    // Esperar a que cargue o procesar inmediatamente si ya está listo
                    if (iframe.contentDocument?.readyState === "complete") {
                        processIframe();
                    } else {
                        $(iframe).on('load', processIframe);
                    }
                });
            },
            exportarPdf: function () {
                let self = this;

                // Permiso de visualización
                var permiso = self.idDepartmentType === "0" ? TienePermiso(183) : TienePermiso(189);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return false;
                }

                if (checkedItems.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 3000);
                    return;
                }

                let content = $("<div id='exportContent'></div>");

                checkedItems.forEach(function (dataItem, index) {
                    let jsonTemplate = JSON.parse(dataItem.jsonTemplate);
                    jsonTemplate.ID = dataItem.ID;

                    let modalView = new VistaFormComponent({
                        modeConfig: true,
                        terminalMode: false,
                        formTemplate: jsonTemplate,
                        idDepartmentType: self.idDepartmentType,
                    });

                    modalView.$(".divBtnsConfig").css("display", "none");
                    // Para que meta cada formulario en una página nueva
                    modalView.$('#pdfViewDiv').css({
                        "min-height": "1500px"
                    });

                    content.append(modalView.$('#pdfViewDiv'));

                    // Agregar salto de página solo si no es el último
                    if (index !== checkedItems.length - 1) {
                        content.append("<div style='page-break-after: always;'></div>");
                    }
                });

                $("body").append(content);

                setTimeout(() => {
                    self.inlineIframesInExportContent(function () {
                        kendo.drawing.drawDOM(content, {
                            margin: { top: "1cm", bottom: "1cm" },
                            paperSize: "A2",
                            landscape: true,
                        }).then(function (group) {
                            function pad2(n) { return n < 10 ? '0' + n : n }
                            var date = new Date();
                            var formatDate = date.getFullYear().toString() + pad2(date.getMonth() + 1) + pad2(date.getDate()) + pad2(date.getHours()) + pad2(date.getMinutes()) + pad2(date.getSeconds());
                            var fileName = 'Exportación múltiple' + '_' + formatDate;

                            kendo.drawing.pdf.saveAs(group, fileName, "../");
                            $('.k-window').remove();
                            $('.k-overlay').hide();
                            $("#exportContent").remove();
                        });
                    });
                }, 100);
            },
            LimpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            eliminar: function () {
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.unbind("resize", self.resizeGrid);
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var gridElement = $("#gridGestionForms"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - 2);
            },
            exportarTemplate: function (e) {
                var self = this;
                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);

                var blob = new Blob([JSON.stringify(data)], { type: "text/plain;charset=utf-8" });
                kendo.saveAs({
                    dataURI: blob,
                    fileName: window.app.idioma.t('FORMULARIO') + data.ID + ".json"
                });
            },
            copiarTemplate: function(e) {
                var self = this;
                var permiso = self.idDepartmentType === "0" ? TienePermiso(182) : TienePermiso(188);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);

                altUtils.postData("../api/CopyTemplatesForms/" + data.ID, null);

                $("#gridGestionForms").data('kendoGrid').dataSource.read();
                $("#gridGestionForms").data('kendoGrid').refresh();
            },
            crearTemplate: function () {
                var self = this;
                var permiso = self.idDepartmentType === "0" ? TienePermiso(182) : TienePermiso(188);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                this.vistaFormComponent = new VistaFormComponent({
                    modeConfig: true,
                    terminalMode: false,
                    formTemplate: null,
                    idDepartmentType: this.idDepartmentType
                });
            },
            editarTemplate: function (e) {
                var self = this;
                var permiso = self.idDepartmentType === "0" ? TienePermiso(182) : TienePermiso(188);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);
                //pop-pup de formularios - visualizador de formularios 
                var jsonTemplate = JSON.parse(data.jsonTemplate);
                jsonTemplate.ID = data.ID;

                this.vistaFormComponent = new VistaFormComponent({
                    modeConfig: true,
                    terminalMode: false,
                    formTemplate: jsonTemplate,
                    idDepartmentType: this.idDepartmentType
                });
            },
            confirmarBorrado: function (e) {
                var self = this;
                var permiso = self.idDepartmentType === "0" ? TienePermiso(182) : TienePermiso(188);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ALT_borrar_template_dialog_title'),
                    msg: window.app.idioma.t('ALT_borrar_template_dialog'),
                    funcion: function () { self.eliminarTemplate(e); },
                    contexto: this
                });
            },
            eliminarTemplate: function (e) {
                var self = this;
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                var data = self.grid.dataItem(tr);

                $.ajax({
                    type: "DELETE",
                    async: false,
                    url: "../api/TemplatesForms/" + data.ID,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res[0] == true) {
                            $("#gridGestionForms").data('kendoGrid').dataSource.read();
                            $("#gridGestionForms").data('kendoGrid').refresh();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1], 2000);
                        }
                        else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res[1], 2000);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (e) {
                        if (e.status == '403') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ALT_error_delete_template'), 2000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            importarTemplate: function (e) {
                var self = this;
                var permiso = self.idDepartmentType === "0" ? TienePermiso(182) : TienePermiso(188);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return false;
                }
            }
        });

        return gridGestionForms;
    });