define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/GestionAlertas.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, Session) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            dsAlertas: null,
            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;

                self.dsAlertas = new kendo.data.DataSource({
                    pageSize: 100,
                    transport: {
                        read: {
                            url: "../api/MailNotification_Read",
                            dataType: "json"
                        },
                        create: {
                            url: "../api/MailNotification_Create",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "POST",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_CREANDO_ALERTA"), 4000);
                                } else if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    var gridTran = $("#grid").data("kendoGrid");
                                    gridTran.dataSource.read();
                                }
                            },
                        },
                        update: {
                            url: "../api/MailNotification_Update",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_ACTUALIZANDO_ALERTA"), 4000);
                                } else if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    var gridTran = $("#grid").data("kendoGrid");
                                    gridTran.dataSource.read();
                                }
                            },
                        },
                        destroy: {
                            url: "../api/MailNotification_Delete",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "DELETE",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_ELIMINAR_ALERTA"), 4000);
                                } else if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                }
                            }
                        },
                        parameterMap: function (options, operation) {
                            if (operation !== "read" && options) {
                                return kendo.stringify(options);
                            }
                            return options;
                        }
                    },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                'Id': { type: "number", editable: false },
                                'StoppageTime': {
                                    type: "number",
                                    validation:
                                    {
                                        StoppageTimeValidation: function (input) {
                                            if (input.is("[name='StoppageTime']") && input.val() == "") {
                                                input.attr("data-StoppageTimeValidation-msg", window.app.idioma.t("CAMPO_REQUERIDO"));
                                                return false;

                                            }

                                            return true;
                                        }
                                    }
                                },
                                'MailGroup': {
                                    validation: {
                                        MailGroupValidation: function (input) {
                                            if (input.is("[name='MailGroup']")) {
                                                if ($("#mailGroup").data("kendoMultiSelect").value() == "") {
                                                    input.attr("data-MailGroupValidation-msg", window.app.idioma.t("CAMPO_REQUERIDO"));
                                                    return false;
                                                }
                                            }

                                            return true;
                                        }
                                    }
                                },
                                'MailEquipments': {
                                    validation: {
                                        MailEquipmentsValidation: function (input) {
                                            if (input.is("[name='MailEquipments']")) {
                                                if ($("#maquina").data("kendoMultiSelect").value() == "") {
                                                    input.attr("data-MailEquipmentsValidation-msg", window.app.idioma.t("CAMPO_REQUERIDO"));
                                                    return false;
                                                }
                                            }

                                            return true;
                                        }
                                    }
                                },
                                'Subject': {
                                    type: "string",
                                    validation: {
                                        subjectAddressValidation: function (input) {
                                            if (input.is("[name='Subject']") && input.val() == "") {
                                                input.attr("data-subjectAddressValidation-msg", window.app.idioma.t("CAMPO_REQUERIDO"));
                                                return false;
                                            }

                                            return true;
                                        }
                                    }
                                },
                                'BodyMessage': {
                                    type: "string",
                                    validation: {
                                        bodyMessageAddressValidation: function (input) {
                                            if (input.is("[name='BodyMessage']") && input.val() == "") {
                                                input.attr("data-bodyMessageAddressValidation-msg", window.app.idioma.t("CAMPO_REQUERIDO"));
                                                return false;
                                            }

                                            return true;
                                        },
                                        maxlength: function (input) {
                                            var cantMax = 250
                                            if (input.val()) {
                                                if (input.val().length > cantMax) {
                                                    input.attr("data-maxlength-msg", window.app.idioma.t("CARACTERES_MAXIMOS") + ' ' + cantMax);
                                                    return false;
                                                }
                                            }
                                            return true;
                                        }
                                    }

                                },
                                'UserAddress': {
                                    type: "string", validation: {
                                        userAddressValidation: function (input) {
                                            if (input.is("[name='UserAddress']") && input.val() != "") {
                                                input.attr("data-userAddressValidation-msg", window.app.idioma.t("FORMATO_MULTIPLES_EMAILS_INCORRECTO"));
                                                return self.validationMail(input.val());
                                            } else if (input.is("[name='UserAddress']") && input.val() == "") {
                                                input.attr("data-userAddressValidation-msg", window.app.idioma.t("CAMPO_REQUERIDO"));
                                                return false;
                                            }

                                            return true;
                                        }
                                    },
                                },
                                'Active': { type: "boolean" },
                            }
                        }
                    }
                });

                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.grid = this.$("#grid").kendoGrid({
                    dataSource: self.dsAlertas,
                    sortable: true,
                    resizable: true,
                    scrollable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: [100, 200, 500],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    toolbar: [
                    {
                        name: "create", text: window.app.idioma.t("AGREGAR")
                    }],
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    columns: [
                        {
                            field: "MailEquipments",
                            title: window.app.idioma.t('EQUIPOS'),
                            template: function (data) { if (typeof data.MailEquipments !== 'undefined') { if (data.MailEquipments.length > 0) { return self.templateEquipments(data.MailEquipments) } else return ""; } return "" },
                            editor: function (e, options) { return self.maquinaEditor(e, options) },
                            width: 350
                        },
                        {
                            field: "StoppageTime",
                            title: window.app.idioma.t('TIEMPO_PARO_MIN'),
                            width: 120,
                            editor: function (e, options) { return self.stoppageTimeEditor(e, options) },
                        },
                        {
                            field: "MailGroup",
                            title: window.app.idioma.t('GRUPOS_EMAILS'),
                            template: function (data) { if (typeof data.MailGroup !== 'undefined') { if (data.MailGroup.length > 0) { return self.templateGroups(data.MailGroup) } else return ""; } return "" },
                            editor: function (e, options) { return self.mailGroupDropDownEditor(e, options) },
                            width: 250
                        },
                        {
                            field: "Subject",
                            title: window.app.idioma.t('ASUNTO_EMAIL'),
                            width: 150
                        },
                        {
                            field: "BodyMessage",
                            title: window.app.idioma.t('CONTENIDO_EMAIL'),
                            width: 150,
                            editor: function (e, options) { return self.bodyMessageEditorTextArea(e, options) },
                        },
                        {
                            field: "Active",
                            title: window.app.idioma.t('ACTIVO'),
                            width: 150,
                            template: "# if(typeof Active !== 'undefined') { if(Active){#" + window.app.idioma.t("SI") + "#} else {#" + window.app.idioma.t("NO") + "#}} #",
                            editor: function (e, options) { return self.resendEditorComboBox(e, options) },
                        },
                        {
                            field: "coms",
                            title: window.app.idioma.t("OPERACIONES"),
                            attributes: { "align": "center" },
                            width: 300,
                            command: [
                                {
                                    name: "edit",
                                    text: {
                                        edit: window.app.idioma.t("EDITAR"),
                                        update: window.app.idioma.t("ACTUALIZAR"),
                                        cancel: window.app.idioma.t("CANCELAR")
                                    },
                                    click: function (e) {
                                        var permiso = TienePermiso(178);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            $('#grid').data("kendoGrid").cancelChanges();
                                        }
                                        //document.querySelector("input[type=text][name=UserAddress]").setAttribute("placeholder", window.app.idioma.t("FORMATO_MULTIPLES_CORREOS"));
                                    }
                                },
                                {
                                    className: "btn-destroy",
                                    name: "Delete",
                                    text: window.app.idioma.t('ELIMINAR'),
                                    click: function (e) {
                                        e.preventDefault(); //prevent page scroll reset
                                        var permiso = TienePermiso(178);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            return;
                                        }

                                        var grid = $("#grid").data("kendoGrid");
                                        var tr = $(e.target).closest("tr"); //get the row for deletion
                                        var data = this.dataItem(tr); //get the row data so it can be referred later

                                        this.confirmacion = new VistaDlgConfirm({
                                            titulo: window.app.idioma.t('ELIMINAR'),
                                            msg: window.app.idioma.t('CONFIRMACION_ELIMINAR_REGISTRO'),
                                            funcion: function () {
                                                grid.dataSource.remove(data);
                                                grid.dataSource.sync();
                                                Backbone.trigger('eventCierraDialogo');
                                            }, contexto: this
                                        });
                                    }
                                },
                                {
                                    name: "testConnection",
                                    text: window.app.idioma.t('PROBAR_ENVIO'),
                                    click: function (e) {
                                        kendo.ui.progress($("#grid"), true);
                                        e.preventDefault(); //prevent page scroll reset 
                                        var grid = $("#grid").data("kendoGrid");
                                        var tr = $(e.target).closest("tr"); //get the row for deletion
                                        var data = this.dataItem(tr); //get the row data so it can be referred later
                                        self.testMail(data);
                                    }
                                }
                            ]
                        }
                    ],
                    editable: "inline",
                    dataBound: function (e) {
                        //avisamos si se han llegado al limite de 30000registros
                        var numItems = e.sender.dataSource.data().length;
                        if (numItems >= 30000) {
                            //“El resultado de la consulta excede del límite de 30.000 registros, por favor, acote en el filtro de búsqueda un rango de fechas menor”.
                            Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('EXCEDE_DEL_LIMITE_REGISTROS'), 10000);
                        }
                    },
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");

                $(".k-grid-add").click(function (e) {
                    var permiso = TienePermiso(178);

                    if (!permiso) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                        return false;
                    }
                });
            },

            //#region EVENTOS
            events: {
                
            },
            //#endregion EVENTOS

            dataSourceLineas: function () {
                return new kendo.data.DataSource({
                    data: window.app.planta.lineas,
                    sort: { field: "Descripcion", dir: "asc" }
                });
            },
            testMail: function (data) {
                $.ajax({
                    type: "GET",
                    url: "../api/MailNotification_TestMail/" + data.Id,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    Not.crearNotificacion('success', 'Info', window.app.idioma.t('SUCCESS_TEST_MAIL'), 4000);
                    kendo.ui.progress($("#grid"), false);
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_TEST_MAIL'), 4000);
                    }
                    kendo.ui.progress($("#grid"), false);
                });
            },
            templateEquipments: function (data) {
                var result = "";
                for (var i = 0; i < data.length; i++) {
                    result = result + data[i].nombre + ", ";
                }
                return result.substring(0, result.length - 2);
            },

            templateGroups: function (data) {
                var result = "";
                for (var i = 0; i < data.length; i++) {
                    result = result + data[i].Name + ", ";
                }
                return result.substring(0, result.length - 2);
            },

            maquinaEditor: function (container, options) {
                var self = this;
                $('<label for="linea">' + window.app.idioma.t("LINEA") + '</label>').appendTo(container);

                $('<input style="width:100% !important" id="linea" name="linea"/>')
                        .appendTo(container)
                        .kendoDropDownList({
                            optionLabel: window.app.idioma.t("SELECCIONE"),
                            dataTextField: "Nombre",
                            dataValueField: "id",
                            template: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                            valueTemplate: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                            dataSource: this.dataSourceLineas(),
                            select: function (e) {
                                var dataItem = this.dataItem(e.item);
                                var cmbZona = $("#zona").data("kendoDropDownList");
                                if (dataItem.id) {
                                    cmbZona.dataSource.data(dataItem.zonas);
                                    cmbZona.dataSource.sort({ field: "numZona", dir: "asc" });
                                    cmbZona.select(0);
                                    cmbZona.enable(true);
                                } else {
                                    cmbZona.dataSource.data([]);
                                    cmbZona.select(0);
                                    cmbZona.enable(false); 
                                }
                               
                                var cmbMaquina = $("#maquina").data("kendoMultiSelect");
                                var maquinas = cmbMaquina.dataSource.data();
                                for (var i = 0; i < maquinas.length; i++) {
                                    maquinas[i].isDeleted = false;
                                }
                                cmbMaquina.dataSource.data(maquinas);
                                cmbMaquina.dataSource.sort({ field: "nombre", dir: "asc" });
                            }
                        }).data("kendoDropDownList");

                var linea = $("#linea").data("kendoDropDownList");
                linea.list.width("auto");

                $('<label for="zona">' + window.app.idioma.t("ZONA") + '</label>').appendTo(container);
                $('<input style="width:100% !important" id="zona" name="zona"/>')
                       .appendTo(container)
                       .kendoDropDownList({
                           optionLabel: window.app.idioma.t("SELECCIONE"),
                           dataTextField: "descripcion",
                           dataValueField: "id",
                           enable: false,
                           dataSource: this.dataSourceZona(),
                           select: function (e) {
                               var dataItem = this.dataItem(e.item);
                               var cmbMaquina = $("#maquina").data("kendoMultiSelect");
                               if (dataItem.id) {
                                   var maquinas = cmbMaquina.dataSource.data();
                                   for (var i = 0; i < maquinas.length; i++) {
                                       maquinas[i].isDeleted = false;
                                       for (var j = 0; j < dataItem.maquinas.length; j++) {
                                           if (dataItem.maquinas[j].id == maquinas[i].id) {
                                               maquinas[i].isDeleted = true;
                                           }
                                       }
                                   }

                                   cmbMaquina.dataSource.data(maquinas);
                                   cmbMaquina.dataSource.sort({ field: "nombre", dir: "asc" });
                               } 
                           }
                       }).data("kendoDropDownList");

                var zona = $("#zona").data("kendoDropDownList");
                zona.list.width("auto");

                $('<label for="maquina">' + window.app.idioma.t("EQUIPO") + '</label>').appendTo(container);
                $('<input style="width:100% !important" id="maquina" name="' + options.field + '"/>')
                       .appendTo(container)
                       .kendoMultiSelect({
                           optionLabel: window.app.idioma.t("SELECCIONE"),
                           dataTextField: "descripcion",
                           dataValueField: "id",
                           dataSource: this.dataSourceMaquina(),
                           template: kendo.template($("#templateMaquina").html())
                       }).data("kendoMultiSelect");
                var maquina = $("#maquina").data("kendoMultiSelect");
                maquina.list.width("auto");
            },

            stoppageTimeEditor: function (container, options) {
                $('<input data-bind="value:' + options.field + '"/>')
                   .appendTo(container)
                   .kendoNumericTextBox({
                       spinners: false,
                       format: "#",
                       decimals: 0
                   });
            },

            resendEditorComboBox: function (container, options) {
                $('<select id="dropdownlist" data-bind="value: ' + options.field + '"><option value="true">' + window.app.idioma.t("SI") +
                    '</option><option value="false">' + window.app.idioma.t("NO") + '</option> </select>').appendTo(container).kendoDropDownList();
            },

            bodyMessageEditorTextArea: function (container, options) {
                $('<textarea data-maxtextlength="250" class="k-textarea" rows="4" id="BodyMessage" name="BodyMessage" style="width:80%" data-bind="value: ' + options.field + '"></textarea>').appendTo(container);
            },

            dataSourceZona: function () {
                var _dsZonas = [];
                for (var i = 0; i < window.app.planta.lineas.length; i++) {
                    var zonas = window.app.planta.lineas[i].zonas;
                    for (var j = 0; j < zonas.length; j++) {
                        _dsZonas.push(zonas[j]);
                    }
                }
                return new kendo.data.DataSource({
                    data: _dsZonas,
                    sort: { field: "nombre", dir: "asc" }
                });
            },

            dataSourceMaquina: function () {
                var _dsMaquinas = [];
                for (var i = 0; i < window.app.planta.lineas.length; i++) {
                    var maquinas = window.app.planta.lineas[i].obtenerMaquinas;
                    for (var j = 0; j < maquinas.length; j++) {
                        _dsMaquinas.push(maquinas[j]);
                    }
                    
                }
                return new kendo.data.DataSource({
                    data: _dsMaquinas,
                    sort: { field: "NombreZona", dir: "asc" }
                });
            },

            dataSourceMailGroup: function () {
                return new kendo.data.DataSource({
                    batch: true,
                    transport: {
                        read: {
                            url: "../api/MailGroup_Read",
                            dataType: "json",
                            cache: false
                        }

                    },
                    sort: { field: "Name", dir: "asc" },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                'Id': { type: "number" },
                                'Name': { type: "string" }
                            }
                        }
                    }
                });
            },

            validationMail: function (email) {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

                var emailsArray = email.split(";");
                for (var i = 0; i < emailsArray.length; i++) {
                    //alert(emailsArray[i]);
                    //return validateEmail(emailsArray[i].trim());
                    if ((emailsArray[i].trim() != "") && re.test(emailsArray[i].trim()) == false) {
                        return false;
                    }
                }
                return true;
            },

            mailGroupDropDownEditor: function (container, options) {
                $('<input style="width:100% !important" id="mailGroup" name="' + options.field + '"/>')
                        .appendTo(container)
                        .kendoMultiSelect({
                            optionLabel: window.app.idioma.t("SELECCIONE"),
                            dataTextField: "Name",
                            dataValueField: "Id",
                            open: function (e) {
                                var listContainer = e.sender.list.closest(".k-list-container");
                                listContainer.width(listContainer.width() + kendo.support.scrollbar());
                            },
                            dataSource: this.dataSourceMailGroup()
                        }).data("kendoMultiSelect");

                var mailGroup = $("#mailGroup").data("kendoMultiSelect");
                mailGroup.list.width("auto");
            },

            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();

                var gridElement = $("#grid"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - 2);

            },

            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

