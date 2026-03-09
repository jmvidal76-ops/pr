define(['underscore', 'backbone', 'jquery', 'text!/ALT/html/ALTFormComponent.html', 'ALT/vAltFormField', 'ALT/vAltForm5SGroupFieldV2',
    'ALT/vAltFormFieldTable', 'ALT/vALTFormFieldFilesTem', 'ALT/vAltFormFieldTableConfigDialog', 'vistas/vDialogoConfirm',
    'compartido/notificaciones', 'ALT/vALTUtils', 'ALT/vAltFormFieldDropDownList', 'ALT/vAltFormFieldTextFormat', 'ALT/vAltForm5SLibre'],
    function (_, Backbone, $, ALTFormComponent, ALTFormField, ALTForm5SGroupField, ALTFormFieldTable, ALTFormFieldFilesTem,
        ALTFormFieldTableConfigDialog, VistaDlgConfirm, Not, vALTUTils, ALTFormFieldDropDownList, ALTFormFieldTextFormat, AltForm5SLibre) {
        var altUtils = new vALTUTils();
        //FORM VIEW
        var formView = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLFormView',
            title: null,
            modeConfig: null, //config; 
            terminalMode: false, //para pintar
            widthWindow: null,
            widthForm: 610, //center-pane
            widthTools: 180, //left-pane
            formTemplate: null,
            formInstance: null,
            formValues: null,
            formValuesTraza: null,
            field5S: null,
            fieldsTable: null,
            fieldsFilesV2: null,
            statusOld: null,
            refreshFunction: null,
            formValuesOld: null,
            statusTraza: null,
            formValidator: null,
            esHistorico: null,
            disableInputs: false,
            confirmacion: null,
            toolBoxValidator: null,
            data2BindSITInfo: null,
            dialogTableColumns: null,
            fieldsDropDownList: null,
            fieldsTextFormat: null,
            fields5SLibre: null,
            toolBoxModel: kendo.observable({
                modeEdit: false, // varible para indicar que un campo se esta editando en modo configuración                
                modeAdd: true,
                rtdsTags: [],
                // the type array populates the drop down
                typesArr: [
                    { name: window.app.idioma.t('TEXTO'), value: "text" },
                    { name: window.app.idioma.t('NUMERICO'), value: "number" },
                    { name: window.app.idioma.t('RANGO'), value: "range" },
                    { name: window.app.idioma.t('CHECK'), value: "checkbox" },
                    { name: window.app.idioma.t('AREA_TEXTO'), value: "textarea" },
                    { name: window.app.idioma.t('SEPARADOR'), value: "header" },
                    { name: window.app.idioma.t('SALTO_LINEA'), value: "br" },
                    { name: window.app.idioma.t('ORDEN'), value: "orderId" },
                    { name: window.app.idioma.t('TIPO_ORDEN'), value: "orderTypeId" },
                    { name: window.app.idioma.t('TURNO'), value: "turnoId" },
                    { name: window.app.idioma.t('ID_TURNO'), value: "shcId" },
                    { name: window.app.idioma.t('LOTE'), value: "lotId" },
                    { name: window.app.idioma.t('MATERIAL'), value: "materialId" },
                    { name: window.app.idioma.t('ALT_LOCALIZACION'), value: "location" },
                    { name: window.app.idioma.t('ALT_RTDS_FIELD'), value: "rtds" },
                    { name: window.app.idioma.t('ALT_5S_FIELD'), value: "5S_V2" },
                    { name: window.app.idioma.t('TABLA'), value: "table" },
                    { name: window.app.idioma.t('LINK'), value: "link" },
                    { name: window.app.idioma.t('FECHA'), value: "date" },
                    { name: window.app.idioma.t('ALT_FILE_FIELD'), value: "filesTem" },
                    { name: window.app.idioma.t('COMBO'), value: "dropDownList" },
                    { name: window.app.idioma.t('TEXTO_CON_FORMATO'), value: "textFormat" },
                    { name: window.app.idioma.t('ALT_5S_LIBRE'), value: "5SLibre" },
                ],
                newField: altUtils.getDefaultField(),
                typesValuesCheck: [{ text: window.app.idioma.t('INDIFERENTE'), value: "" }, { text: "OK", value: "true" }, { text: window.app.idioma.t('NO_OK'), value: "false" }]

            }),
            idDepartmentType: null,
            template: _.template(ALTFormComponent),
            initialize: function (params) {
                var self = this;
                this.dialogTableColumns = null;
                self.idDepartmentType = params.idDepartmentType;
                self.fieldsTable = {}; //reset value
                self.fieldsDropDownList = {};
                self.fieldsTextFormat = {};

                if (params.refreshFunction != null) {
                    self.refreshFunction = params.refreshFunction;
                }

                if (params.formTemplate == null) {
                    self.formTemplate = new kendo.data.ObservableObject({ ID: -1, name: '', countFields: 0, descript: '', fieldsTemplate: [], typeID: 'PLANTA' });
                } else {
                    self.formTemplate = new kendo.data.ObservableObject(params.formTemplate);
                    self.formInstance = new kendo.data.ObservableObject(params.formInstance);
                }

                self.terminalMode = params.terminalMode;
                self.modeConfig = params.modeConfig;

                if (params.esHistorico != null) {
                    self.esHistorico = params.esHistorico;
                }

                //set title of window                
                self.title = self.formTemplate.name + ' - ' + self.formTemplate.descript;

                this.data2BindSITInfo = new kendo.data.ObservableObject(altUtils.getData('../api/getInfoMES').data);

                if (!self.modeConfig) {
                    self.statusOld = params.formInstance.statusID;
                    self.formValuesOld = params.formInstance.FormValues;
                } else {
                    $.ajax({
                        type: 'GET',
                        async: false,
                        //data: JSON.stringify({ tags: [self.field.rtdsName] }),
                        dataType: "json",
                        contentType: 'application/json; charset=utf-8',
                        url: '../api/getPPARTDSPoints',
                        success: function (result) {
                            self.toolBoxModel.rtdsTags = result;
                        },
                        error: function (e) {
                            self.toolBoxModel.rtdsTags = [];
                        }
                    });
                }

                this.loadFiles();
                self.render();
            },
            render: function () {
                //--ini DIALOG WINDOW--//
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());
                //CABECERA DEL FORMULARIO PARTE COMÚN A MODO CONFIG Y RUNTIME
                $("#logoForm").html("<img src='/Portal/img/Mahou_San_Miguel.png'  />" +
                    "<br />" + "<br />" +
                    "<label>" + (self.idDepartmentType === "1" ? window.app.idioma.t('SEM') : window.app.idioma.t('ALT_LONG')) + "</label>");
                $("#formName").html("<label>" + window.app.idioma.t('NOMBRE') + ": </label> ");
                $("#formDescript").html("<label>" + window.app.idioma.t('DESCRIPCION') + ": </label> ");
                $("#formPath").html("<label>" + window.app.idioma.t('RUTA') + ": </label> ");
                $("#formStatusID").html("<label>" + window.app.idioma.t('ESTADO') + ": </label> ");

                //Añadimos toolbar Configuration sólo en modo configuración
                if (self.modeConfig) {
                    //CONFIG MODE!
                    $("#dtpFechaCreacion").hide();

                    $('#ALTconfigModeOffCSS').remove();
                    //Split to show toolbox                    
                    $("#alt-horizontal").kendoSplitter({
                        panes: [
                            { resizable: false, width: self.widthTools },
                            { resizable: false }
                        ]
                    });

                    //Config toolbar
                    $("#toolbar").kendoToolBar({
                        items: [
                            //regular button
                            {
                                id: "btnCancelar",
                                type: "button",
                                text: window.app.idioma.t('CANCELAR'),
                                //icon: "cross",
                                showIcon: "toolbar"
                            },
                            //regular button
                            {
                                id: "btnAceptar",
                                type: "button",
                                text: window.app.idioma.t('GUARDAR'),
                                //icon: "tick",
                                showIcon: "toolbar"
                            },
                            //separator
                            {
                                type: "separator"
                            },
                            {
                                id: "btnPrint",
                                type: "button",
                                text: window.app.idioma.t('ALT_EXPORTAR_PDF'),
                                //icon: "tick",
                                showIcon: "toolbar"
                            },
                            {
                                type: "separator"
                            },
                            //custom template
                            {
                                template: "<label>" + window.app.idioma.t('TIPO') + ": <select data-bind='value: typeID' type='text' id='selTypeID' style='width: 120px !important;'><option value='PLANTA'>" + window.app.idioma.t('PLANTA') + "</option><option value='CORPORATIVO'>" + window.app.idioma.t('CORPORATIVO') + "</option> </select></label>",
                                overflowTemplate: "<span></span>"
                            },
                            //custom template
                            {
                                template: "<label>" + window.app.idioma.t('NOMBRE') + ": <input class='k-textbox' data-bind='value: name' type='text' id='txtFormName'   maxlength='43' style='width: 140px !important;' /></label>",
                                overflowTemplate: "<span></span>"
                            },
                            //custom template
                            {
                                template: "<label>" + window.app.idioma.t('DESCRIPCION') + ": <input class='k-textbox' data-bind='value: descript' type='text' id='txtFormDescript'  style='width: 180px !important;' /></label>",
                                overflowTemplate: "<span></span>"
                            }
                        ]
                    });

                    $("#selTypeID").kendoDropDownList();

                    $("#rtdsNameSel").kendoComboBox({
                        valuePrimitive: true,
                        dataTextField: "Point",
                        dataValueField: "Point",
                        filter: "contains",
                        dataSource: self.toolBoxModel.rtdsTags
                    });
                    //bind toolBar
                    kendo.bind($("#toolbar"), self.formTemplate);
                    //bind toolBox
                    kendo.bind($("#editForm"), self.toolBoxModel);
                } else {
                    // Si está en estado FINALIZADO y tiene permiso de modificación (histórico) del estado no se deshabilitará el combo de estado, si no tiene permiso sí.
                    //if (self.formInstance.statusID == 'FINALIZADO') {
                    if (self.esHistorico) {
                        var permiso = self.idDepartmentType === "0" ? TienePermiso(236) : TienePermiso(238);
                        self.disableInputs = !permiso;
                    }

                    $("#toolbar").kendoToolBar({
                        items: [
                            //regular button
                            {
                                id: "btnCancelar",
                                type: "button",
                                text: window.app.idioma.t('CANCELAR'),
                                //icon: "cross",
                                showIcon: "toolbar"
                            },
                            //regular button
                            {
                                id: "btnAceptar",
                                type: "button",
                                text: window.app.idioma.t('GUARDAR'),
                                //icon: "tick",
                                showIcon: "toolbar"
                            },
                            //separator
                            {
                                type: "separator"
                            },
                            //regular button
                            {
                                id: "btnPrint",
                                type: "button",
                                text: window.app.idioma.t('ALT_EXPORTAR_PDF'),
                                //icon: "tick",
                                showIcon: "toolbar"
                            },
                        ]
                    });

                    //bind toolBar    
                    self.formInstance.set("arrayStatusIDs", self.data2BindSITInfo.lStatusALT);

                    kendo.bind($("#toolbar"), self.formInstance);

                    $("#formName").append(self.formInstance.name);
                    $("#formDescript").append(self.formInstance.descript);
                    $("#formPath").append(self.modeConfig ? '' : self.formInstance.path);
                    $("#formStatusID").append("<select id='selStatusID3' name='statusID' data-role='dropdownlist' class='k-select' data-bind='source: arrayStatusIDs, value: statusID' data-text-field='text' data-value-field='value' style='width: 120px !important' " + (this.disableInputs ? "disabled" : "") + ">");
                    $("#dtpFechaCreacion").show();

                    $("#dtpFechaCreacion").kendoDateTimePicker({
                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                        culture: localStorage.getItem("idiomaSeleccionado"),
                        value: self.formInstance.createdOn
                    });

                    //bind data to form
                    kendo.bind($("#alt-center-pane"), self.formInstance);
                }

                //append Form elements
                this.prepareForm();
                if (self.disableInputs) {
                    this.$('#btnAceptar').remove();
                }
                //Bind form data
                if (!self.modeConfig) {
                    self.formValues = new kendo.data.ObservableObject(JSON.parse(self.formInstance.FormValues));
                    //set Valores de proceso
                    self.formValues["orderId"] = self.formInstance.orderId;
                    self.formValues["orderTypeId"] = self.formInstance.orderTypeId;
                    self.formValues["turnoId"] = self.formInstance.turnoId;
                    self.formValues["shcId"] = self.formInstance.shcId;
                    self.formValues["lotId"] = self.formInstance.lotId;
                    self.formValues["materialId"] = self.formInstance.materialId;
                    self.formValues["location"] = self.formInstance.location;
                    //******//
                    //bind data for table 5s type
                    if (self.field5S)
                        self.field5S.bindDataRuntime(self.formInstance.FormValues);
                    //bind data for table types                    
                    for (var idField in self.fieldsTable) {
                        self.fieldsTable[idField].bindDataRuntime(self.formInstance.FormValues);
                    }
                    //bind data for table 5sLibre type
                    if (self.fields5SLibre)
                        self.fields5SLibre.bindDataRuntime(self.formInstance.FormValues);

                    //revisamos si hay algun campo tipo fecha para ponerlo en el formato correspondiente   
                    this.formTemplate.fieldsTemplate.forEach(function (fieldTem) {
                        //si tiene valor lo modificamos                        
                        if (fieldTem.type == 'date') {
                            if (self.formValues.get(fieldTem.nameID)) {
                                self.formValues.set(fieldTem.nameID, kendo.parseDate(self.formValues.get(fieldTem.nameID)));
                            } else {
                                //var dateaux = new Date();
                                self.formValues.set(fieldTem.nameID, '');
                            }
                        }
                    });
                    kendo.bind($("#formTemplate"), self.formValues);
                    self.formValidator = altUtils.getValidator("#formTemplate");
                }
                self.toolBoxValidator = altUtils.getValidator("#editForm");
                //si la pantalla es pequeña (<1280px) ponemos el ancho completo
                if ($(window).width() > 1280)
                    self.widthWindow = "80%";
                else
                    self.widthWindow = "100%";
                //window properties
                self.window = $(self.el).kendoWindow(
                    {
                        title: self.title,
                        modal: true,
                        width: self.widthWindow, //en modo terminal ocupamos todo el ancho
                        // Se ajusta al terminal como al  a la web
                        height: $(window).height(), // en modo terminal dejamos espacio por abajo para el teclado                  
                        resizable: true,
                        draggable: true,
                        actions: ["Maximize"],// this.terminalMode ? [] : ["Maximize"], //en modo terminal no dejamos maximizar necesita hueco para el teclado
                        activate: this.onActivate,
                        resize: function () {
                            self.resizePanels();
                        },
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                self.changeType();
                self.dialog = self.window;

                if (!self.modeConfig) {
                    //VALIDAMOS PARA QUE SE MARQUEN CAMPOS OBLIGATORIOS
                    self.formValidator.validate()
                }

                $(window).on("resize", function (e) {
                    self.resizePanels();
                });

                self.resizePanels();
                //MODO RUNTIME TERMINAL
                //if (this.terminalMode) {
                //    // En modo terminal dejamos espacio por debajo para el teclado y lo subimos arriba de la ventana                  
                //    this.window.setOptions({
                //        position: {
                //            top: 0
                //        }
                //    });                 
                //    $("#btnPrint").css("display", "none");
                //}

                if (self.terminalMode)
                    self.window.maximize();
            },
            resizePanels: function () {
                //console.log("RESIZE!");
                //$(this.el).height($(window).height() * 0.9);
                this.dialog.center();
                this.$("#alt-horizontal").height($(this.el).height() - this.$("#toolbar").height());
                this.$("#alt-center-pane").height("100%");
                //MODO CONFIGURACION
                if (this.modeConfig) {
                    this.$("#alt-left-pane").height("100%");
                    this.$(".k-splitbar").height("100%");
                    this.$('#alt-center-pane').width(this.$('#alt-horizontal').width() - this.$('#alt-left-pane').width() - 7);
                }
            },
            prepareForm: function () {
                //clear div
                $('#formTemplate').html('');
                //add fields
                var self = this;

                this.formTemplate.fieldsTemplate.forEach(function (field) {
                    var view = null;
                    switch (field.type) {
                        case '5S_V2':
                            view = new ALTForm5SGroupField({ field: field, modeConfig: self.modeConfig, runTimeJustView: self.disableInputs }, self);
                            self.field5S = view;
                            break;
                        case 'table':
                            // Se comprueba si tenemos algun control de tipo Tabla para cargar sus datos
                            if (!jQuery.isEmptyObject(self.fieldsTable)) {
                                for (var prop in self.fieldsTable) {
                                    if (prop === field.nameID) {
                                        field.dataColumns = self.fieldsTable[prop].dataColumns;
                                    }
                                }
                            }

                            view = new ALTFormFieldTable({ field: field, modeConfig: self.modeConfig, runTimeJustView: self.disableInputs }, self);
                            self.fieldsTable[field.nameID] = view;
                            break;
                        case 'filesTem':
                            view = new ALTFormFieldFilesTem(field, self);
                            break;
                        case 'dropDownList':
                            view = new ALTFormFieldDropDownList({ field: field, modeConfig: self.modeConfig, runTimeJustView: self.disableInputs }, self);
                            self.fieldsDropDownList[field.nameID] = view;
                            break;
                        case 'textFormat':
                            // Se comprueba si tenemos algun control de tipo textFormat para cargar sus datos
                            if (!jQuery.isEmptyObject(self.fieldsTextFormat)) {
                                for (var prop in self.fieldsTextFormat) {
                                    if (prop === field.nameID) {
                                        field.dataColumns = self.fieldsTextFormat[prop].dataColumns;
                                    }
                                }
                            }

                            view = new ALTFormFieldTextFormat({ field: field, modeConfig: self.modeConfig, runTimeJustView: self.disableInputs }, self);
                            self.fieldsTextFormat[field.nameID] = view;
                            break;
                        case '5SLibre':
                            view = new AltForm5SLibre({ field: field, modeConfig: self.modeConfig, runTimeJustView: self.disableInputs }, self);
                            self.fields5SLibre = view;
                            break;
                        default: //rest of fields
                            view = new ALTFormField(field, self);
                    }

                    $('#formTemplate').append(view.render().el);
                });
            },

            onActivate: function (e) {
            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
                'click #btnAddField': 'addField',
                'click #btnEditField': 'addField',
                'click #btnCancelEdit': 'cancelEdit',
                'click #btnPrint': 'exportPDF',
                'click #btnEditFieldTableColumns': 'openDialogFieldTableCol',
                'change #selType': 'changeType',
                'change #checkRequire': 'changeCheckRequire'
            },
            openDialogFieldTableCol: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialogTableColumns = new ALTFormFieldTableConfigDialog(this.toolBoxModel.newField);
            },
            // Para los controles de tipo texto con formato que tienen iframe
            inlineIframes: function () {
                $('#pdfViewDiv iframe').each(function () {
                    try {
                        const iframeDoc = this.contentDocument || this.contentWindow.document;
                        const iframeHtml = $(iframeDoc.body).html();

                        // Crea un div con el contenido del iframe
                        const $replacement = $('<div></div>').html(iframeHtml);

                        // Reemplaza el iframe con su contenido
                        $(this).replaceWith($replacement);
                    } catch (e) {
                        console.warn('No se puede acceder al contenido del iframe: ', e);
                    }
                });
            },
            exportPDF: function (e) {
                var self = this;
                var drawing = kendo.drawing;
                var landscapeOpt = true;

                if (self.modeConfig)
                    $(".divBtnsConfig").css("display", "none");

                self.inlineIframes();

                drawing.drawDOM("#pdfViewDiv", {
                    margin: { top: "1cm", bottom: "1cm" },
                    paperSize: "A2",
                    landscape: landscapeOpt,
                    keepTogether: ".prevent-split",
                }).then(function (group) {
                    // después de dibujar volvemos a pintar lo que hemos quitado si fuera en modo config
                    if (self.modeConfig)
                        $(".divBtnsConfig").css("display", "");

                    function pad2(n) { return n < 10 ? '0' + n : n }
                    var date = self.modeConfig ? new Date() : self.formInstance.lastModify;
                    var formatDate = date.getFullYear().toString() + pad2(date.getMonth() + 1) + pad2(date.getDate()) + pad2(date.getHours()) + pad2(date.getMinutes()) + pad2(date.getSeconds());
                    var fileName = self.formTemplate.name + '_' + formatDate;
                    drawing.pdf.saveAs(group, fileName, "../");
                });
            },
            changeCheckRequire: function (e) {
                var tipo = $('#selType').val();
                switch (tipo) {
                    case 'checkbox':
                        var valReq = $('#checkRequire').is(":checked");
                        if (valReq)
                            $('#checkboxDiv').show();
                        else
                            $('#checkboxDiv').hide();
                        break;
                    default:
                        $('#checkboxDiv').hide();
                        break;
                }
            },
            changeType: function (e) {
                var tipo = $('#selType').val();

                switch (tipo) {
                    case 'br':
                    case '5S_V2':
                    case '5SLibre':
                        $('#idDiv').find('input').each(function (index) {
                            $(this).removeAttr('required');
                        });
                        $('#idDiv').hide();
                        break;
                    default:
                        $('#idDiv').find('input').each(function (index) {
                            $(this).prop('required', true);
                        });
                        $('#idDiv').show();
                        break;
                }
                switch (tipo) {
                    case 'text':
                    case 'textArea':
                        $('#textDiv').find('input').each(function (index) {
                            $(this).prop('required', true);
                        });
                        $('#textDiv').show();
                        break;
                    default:
                        $('#textDiv').find('input').each(function (index) {
                            $(this).removeAttr('required');
                        });
                        $('#textDiv').hide();
                        break;
                }
                switch (tipo) {
                    case 'range':
                        $('#rangeDiv').find('input').each(function (index) {
                            $(this).prop('required', true);
                        });
                        $('#rangeDiv').show();
                        break;
                    default:
                        $('#rangeDiv').find('input').each(function (index) {
                            $(this).removeAttr('required');
                        });
                        $('#rangeDiv').hide();
                        break;
                }
                switch (tipo) {
                    case 'rtds':
                        $('#rtdsDiv').find('input').each(function (index) {
                            $(this).prop('required', true);
                        });
                        $('#rtdsDiv').show();
                        break;
                    default:
                        $('#rtdsDiv').find('input').each(function (index) {
                            $(this).removeAttr('required');
                        });
                        $('#rtdsDiv').hide();
                        break;
                }
                switch (tipo) {
                    case '5S_V2':
                        $('#5SDiv').find('input').each(function (index) {
                            $(this).prop('required', true);
                        });
                        $('#5SDiv').show();
                        break;
                    default:
                        $('#5SDiv').find('input').each(function (index) {
                            $(this).removeAttr('required');
                        });
                        $('#5SDiv').hide();
                        break;
                }
                switch (tipo) {
                    case '5SLibre':
                        $('#div5SLibre').find('input').each(function (index) {
                            $(this).prop('required', true);
                        });
                        $('#div5SLibre').show();
                        break;
                    default:
                        $('#div5SLibre').find('input').each(function (index) {
                            $(this).removeAttr('required');
                        });
                        $('#div5SLibre').hide();
                        break;
                }
                switch (tipo) {
                    case 'link':
                        $('#linkDiv').show();
                        break;
                    default:
                        $('#linkDiv').hide();
                        break;
                }
                switch (tipo) {
                    case 'filesTem':
                        $('#filesTemDiv').show();
                        break;
                    default:
                        $('#filesTemDiv').hide();
                        break;
                }
                switch (tipo) {
                    case 'br':
                    case 'header':
                    case 'filesTem':
                    case '5S_V2':
                    case 'link':
                    case 'textFormat':
                    case '5SLibre':
                        $('#contenidoDiv').hide();
                        break;
                    default:
                        $('#contenidoDiv').show();
                        break;
                }
                switch (tipo) {
                    case 'checkbox':
                        var valReq = $('#checkRequire').is(":checked");
                        if (valReq)
                            $('#checkboxDiv').show();
                        else
                            $('#checkboxDiv').hide();
                        break;
                    default:
                        $('#checkboxDiv').hide();
                        break;
                }
                $('#txtError').text("");
                this.toolBoxValidator = altUtils.getValidator("#editForm");

            },
            addField: function (e) {
                var self = this;
                var todoOk = false;
                if (this.toolBoxValidator.validate()) {
                    //Si es un campo de rtds comprobamos que la variable existe.
                    if (self.toolBoxModel.newField.type == "rtds") {
                        // 
                        var tagExist = false;

                        $.ajax({
                            type: 'POST',
                            async: false,
                            data: JSON.stringify({ tags: [self.toolBoxModel.newField.rtdsName] }),
                            dataType: "json",
                            contentType: 'application/json; charset=utf-8',
                            url: '../api/RTDScheckTags',
                            success: function (result) {
                                tagExist = result[0];

                            },
                            error: function (e) {
                                tagExist = false;
                            }
                        });
                        if (!tagExist) { //si no existe no lo añadimos
                            $('#txtError').text(window.app.idioma.t('ALT_RTDS_CAMPO_NO_EXISTE'));
                            return;
                        }
                    }

                    if (!this.toolBoxModel.modeEdit) {
                        //ADD
                        var existeField = false;
                        //para los campos especiales comprobamos que sólo tengamos un campo, si ya existe no lo añadiremos
                        this.formTemplate.fieldsTemplate.forEach(function (field) {
                            if (field.nameID == self.toolBoxModel.newField.type) {
                                existeField = true;
                            }
                        });
                        if (!existeField) {
                            //si noestamos editando un campo le ponemos un nombre y sumamosen el contador de campos
                            this.formTemplate.countFields += 1;
                            //ledaremos un nombre único al campo, los campos especiales su id será igual al tipo ya que no se puede añadir dos campos especiales a un formulario
                            switch (this.toolBoxModel.newField.type) {
                                case 'turnoId':
                                case 'orderId':
                                case 'orderTypeId':
                                case 'shcId':
                                case 'lotId':
                                case 'materialId':
                                case 'location':
                                case '5S_V2':
                                case '5SLibre':
                                    //case 'dropDownList':
                                    this.toolBoxModel.newField.nameID = this.toolBoxModel.newField.type;
                                    break;
                                default:
                                    this.toolBoxModel.newField.nameID = "ALTf" + this.formTemplate.countFields;
                            }
                            this.formTemplate.fieldsTemplate.push(new kendo.data.ObservableObject(this.toolBoxModel.get('newField').toJSON()));
                            this.prepareForm();
                            var d = $('#alt-center-pane');
                            d.scrollTop(d.prop("scrollHeight"));
                            todoOk = true;
                        } else {
                            $('#txtError').text(window.app.idioma.t('ALT_ERROR_CAMPO_EXISTE'));
                        }
                    } else {
                        //EDIT
                        //para los campos especiales comprobamos que sólo tengamos un campo, si ya existe no lo añadiremos
                        this.formTemplate.fieldsTemplate.forEach(function (field, index, array) {
                            if (field.nameID == self.toolBoxModel.newField.nameID) {
                                array[index] = self.toolBoxModel.newField;
                            }
                        });
                        this.prepareForm();
                        todoOk = true;
                        //******//
                    }
                    if (todoOk) {
                        this.toolBoxModel.set("modeEdit", false)
                        this.toolBoxModel.set("modeAdd", true);
                        this.limpiarCampos();
                    }
                } else {
                    $('#txtError').text(window.app.idioma.t('ALT_FALTAN_CAMPOS'));
                }
            },
            limpiarCampos: function () {
                this.toolBoxModel.set("newField", altUtils.getDefaultField());
                this.dialogTableColumns = null;
                this.changeType();
            },
            cancelEdit: function (e) {
                $('#txtError').text("");
                this.toolBoxModel.set("modeEdit", false)
                this.toolBoxModel.set("modeAdd", true);
                this.limpiarCampos();
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                $(window).off("resize");
                this.eliminar();
            },
            aceptar: function (e) {
                //Guardamos template
                e.preventDefault();

                if (this.modeConfig) {
                    this.guardarTemplateForm();
                } else {
                    this.guardarInstanceForm();
                }
            },
            refreshParent: function () {
                var self = this;
                if (self.refreshFunction == null) {
                    $("#gridGestionForms").data('kendoGrid').dataSource.read();
                    //$("#gridGestionForms").data('kendoGrid').refresh();
                }

                this.eliminar();
            },
            guardarInstanceForm: function () {
                var self = this;

                let fechaCreacion = $("#dtpFechaCreacion").data("kendoDateTimePicker").value();
                if (!fechaCreacion) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_FECHA_INTRODUCIDA'), 3000);
                    return;
                }

                //5S data
                if (self.field5S) {
                    var instance = self.field5S.save5SInstance();
                    self.formValues["data5s"] = instance;
                }
                //Table data
                for (var idField in self.fieldsTable) {
                    self.formValues[idField] = self.fieldsTable[idField].saveTableInstance();
                }
                //DropDownList data
                self.formValues.dropDownList = [];
                for (var idField in self.fieldsDropDownList) {
                    self.fieldsDropDownList[idField].selectedValue = self.fieldsDropDownList[idField].saveDropDownListInstance();
                    self.formValues.dropDownList.push({ field: idField, value: self.fieldsDropDownList[idField].selectedValue });
                }
                //TextFormat data
                for (var idField in self.fieldsTextFormat) {
                    self.formValues[idField] = self.fieldsTextFormat[idField].saveTextFormatInstance();
                }
                //5SLibre data
                if (self.fields5SLibre) {
                    var instance = self.fields5SLibre.save5SInstance();
                    self.formValues["data5sLibre"] = instance;
                }

                //set DATA 2 formInstance           
                self.formInstance.FormValues = JSON.stringify(self.formValues.toJSON());
                //self.formInstance.isValid = self.formValidator.validate() ? 1 : 0;
                if (self.formValidator.validate()) {
                    if (self.field5S) {
                        self.formInstance.isValid = self.field5S.validate() ? 1 : 2;
                    } else if (self.fields5SLibre) {
                        self.formInstance.isValid = self.fields5SLibre.validate() ? 1 : 2;
                    } else {
                        self.formInstance.isValid = 1;
                    }
                } else {
                    if (self.formValidator.errors().length === 0 || self.formValidator.errors().toString().indexOf("requerido") !== -1) {
                        self.formInstance.isValid = 0;
                    } else {
                        self.formInstance.isValid = 2;
                    }
                }

                self.formInstance.errors = '' + self.formValidator.errors();
                self.formInstance.createdOn = fechaCreacion;
                //set Valores de proceso
                self.formInstance.orderId = self.formValues["orderId"];
                self.formInstance.orderTypeId = self.formValues["orderTypeId"];
                self.formInstance.turnoId = self.formValues["turnoId"];
                self.formInstance.shcId = self.formValues["shcId"];
                self.formInstance.lotId = self.formValues["lotId"];
                self.formInstance.materialId = self.formValues["materialId"];
                self.formInstance.location = self.formValues["location"];

                //preparamos textos para trazas
                self.checkCambiosFormValues();
                //Check status and errors
                if (!self.formInstance.isValid && self.formInstance.statusID == "FINALIZADO") {
                    self.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('ALT_COMPLETE_FORM_DIALOG_TITLE'), msg: window.app.idioma.t('ALT_COMPLETE_FORM_DIALOG'),
                        funcion: function () { self.postFormInfo(); }, contexto: self
                    });
                } else {
                    self.postFormInfo();
                }
            },
            checkCambiosFormValues: function () {
                //self.formValues son los nuevos valores y self.formInstance.Formvalues los antiguos, comparamos y preparamos la traza
                this.formValuesTraza = "";
                var newValues = this.formValues.toJSON();
                var oldValues = JSON.parse(this.formValuesOld);
                for (var prop in newValues) {
                    //para campos que no son tabla ni 5S, comprobamos que no sea array newValues[prop]

                    if (this.fieldsTable[prop] == null) {
                        var label = this.getLabelofField(prop);
                        var newValue = this.getFormatValue(newValues, prop);
                        if (label != "") {
                            if (oldValues) {
                                var oldValue = this.getFormatValue(oldValues, prop);
                                if (oldValue != newValue) {
                                    var oldValueStr = oldValue != undefined ? (oldValue + " -> ") : "";
                                    this.formValuesTraza += label + ": " + oldValueStr + newValue + "; </br>";
                                }
                            } else {
                                if (newValue && newValue != "")
                                    this.formValuesTraza += label + ": " + newValue + "; </br>";
                            }
                        }
                    }
                }
                //para todos los campos tabla revisamos sus trazas 
                for (var idField in this.fieldsTable) {
                    this.formValuesTraza += this.fieldsTable[idField].getCambiosTableValues();
                }
                //si hay campo 5S anidamos sus trazas con las que hay
                if (this.field5S)
                    this.formValuesTraza += this.field5S.getCambios5SValues();

                //si hay campo 5SLibre anidamos sus trazas con las que hay
                if (this.fields5SLibre)
                    this.formValuesTraza += this.fields5SLibre.getCambios5SValues();

                this.statusTraza = "";
                if (this.formInstance.statusID != this.statusOld)
                    this.statusTraza = window.app.idioma.t(this.statusOld) + " -> " + window.app.idioma.t(this.formInstance.statusID);
            },
            getFormatValue: function (table, prop) {
                var formatDate = false;
                this.formTemplate.fieldsTemplate.forEach(function (field) {
                    if (field.nameID == prop && field.type == 'date')
                        formatDate = true;
                });
                // kendo.toString(new Date(solvedOn),kendo.culture().calendars.standard.patterns.MES_Fecha)
                //kendo.parseDate(datepicker.value(), kendo.culture().calendars.standard.patterns.MES_FechaHora)
                if (formatDate)
                    return kendo.toString(kendo.parseDate(table[prop]), kendo.culture().calendars.standard.patterns.MES_Fecha);
                return table[prop];
            },
            getLabelofField: function (id) {
                var label = "";
                this.formTemplate.fieldsTemplate.forEach(function (field) {
                    if (field.nameID == id)
                        label = field.label;
                });
                return label;
            },
            postFormInfo: function () {
                var result = altUtils.postData('../api/RuntimeForms', { formInstance: this.formInstance, statusTraza: this.statusTraza, formValuesTraza: this.formValuesTraza, formFiles: this.fieldsFilesV2 }, true);
                if (result.error == 0) {
                    this.refreshParent();
                }
            },
            loadFiles: function () {
                this.fieldsFilesV2 = [];

                if (this.modeConfig) {
                    this.fieldsFilesV2 = altUtils.getData('../api/ALTgetFilesTemplate/' + this.formTemplate.ID).data;
                } else {
                    this.fieldsFilesV2 = altUtils.getData('../api/ALTgetFormsFilesV2/' + this.formInstance.ID).data;
                }
            },
            guardarTemplateForm: function () {
                var self = this;
                //si existe el campo 5S, adherimos el template 5S a formTemplate con funcion saveTemplate
                if (self.field5S) {
                    self.field5S.save5STemplate();
                }
                //si existe algun campo tipo tabla hay que guardar sus datos por defecto
                for (var idField in self.fieldsTable) {
                    self.fieldsTable[idField].saveTableTemplate();
                }
                //si existe algun campo tipo dropDownList hay que guardar sus datos por defecto
                for (var idField in self.fieldsDropDownList) {
                    self.fieldsDropDownList[idField].saveDropDownListTemplate();
                }
                //si existe algun campo tipo textFormat hay que guardar sus datos por defecto
                for (var idField in self.fieldsTextFormat) {
                    self.fieldsTextFormat[idField].saveTextFormatTemplate();
                }
                //si existe el campo 5SLibre, adherimos el template 5S a formTemplate con funcion saveTemplate
                if (self.fields5SLibre) {
                    self.fields5SLibre.save5STemplate();
                }

                //si existe algun campo fieldsV2 preparamos los files
                /*var formsFiles = [];
                for (var idField in self.fieldsFilesV2) {
                    self.fieldsFilesV2[idField].forEach(function(f){
                        formsFiles.push(f);
                    });                   
                }*/
                //para el resto de fields no hay que hacer nada
                var bdTemplateForm = {
                    ID: self.formTemplate.ID,
                    name: self.formTemplate.name,
                    descript: self.formTemplate.descript,
                    idDepartmentType: self.idDepartmentType,
                    typeID: self.formTemplate.typeID,
                    jsonTemplate: JSON.stringify(self.formTemplate),
                    StorageFiles: self.fieldsFilesV2
                }

                if (self.formTemplate.name == "") {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ALT_ERROR_FORM_NOMBRE'), 2000);
                } else {
                    $.ajax({
                        data: JSON.stringify(bdTemplateForm),
                        type: "POST",
                        async: false,
                        url: "../api/TemplatesForms",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            if (res[0] == true) {
                                self.refreshParent();
                            }
                            else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ALT_ERROR_GUARDAR_FORM'), 2000);
                            Backbone.trigger('eventCierraDialogo');
                        },
                        error: function (response) {
                            if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ALT_ERROR_GUARDAR_FORM'), 2000);
                            }
                            Backbone.trigger('eventCierraDialogo');
                        }
                    });
                }
            },
            eliminar: function () {
                this.dialog.close();
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            }
        })

        return formView;
    }
);