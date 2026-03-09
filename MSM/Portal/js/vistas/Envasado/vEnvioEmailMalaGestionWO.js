define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/EnvioEmailMalaGestionWO.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm) {
        var vista = Backbone.View.extend({
            template: _.template(plantilla),
            dsAlertasMalaGestionWO: null,
            initialize: function () {
                var self = this;

                self.dsAlertasMalaGestionWO = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/MailMalaGestionWO_Read",
                            dataType: "json"
                        },
                        create: {
                            url: "../api/MailMalaGestionWO_Create",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "POST",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_CREANDO_ALERTA"), 4000);
                                } else if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    $("#gridMalaGestionWO").data("kendoGrid").dataSource.read();
                                }
                            },
                        },
                        update: {
                            url: "../api/MailMalaGestionWO_Update",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_ACTUALIZANDO_ALERTA"), 4000);
                                } else if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    $("#gridMalaGestionWO").data("kendoGrid").dataSource.read();
                                }
                            },
                        },
                        destroy: {
                            url: "../api/MailMalaGestionWO_Delete",
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
                                'MailGrupos': {
                                    validation: {
                                        MailGruposValidation: function (input) {
                                            if (input.is("[name='MailGrupos']")) {
                                                if ($("#mailGroup").data("kendoMultiSelect").value() == "") {
                                                    input.attr("data-MailGruposValidation-msg", window.app.idioma.t("CAMPO_REQUERIDO"));
                                                    return false;
                                                }
                                            }

                                            return true;
                                        }
                                    }
                                },
                                'MailLineas': {
                                    validation: {
                                        MailLineasValidation: function (input) {
                                            if (input.is("[name='MailLineas']")) {
                                                if ($("#linea").data("kendoMultiSelect").value() == "") {
                                                    input.attr("data-MailLineasValidation-msg", window.app.idioma.t("CAMPO_REQUERIDO"));
                                                    return false;
                                                }
                                            }

                                            return true;
                                        }
                                    }
                                },
                                'Asunto': {
                                    type: "string",
                                    validation: {
                                        AsuntoValidation: function (input) {
                                            if (input.is("[name='Asunto']") && input.val() == "") {
                                                input.attr("data-AsuntoValidation-msg", window.app.idioma.t("CAMPO_REQUERIDO"));
                                                return false;
                                            }

                                            return true;
                                        }
                                    }
                                },
                                'CuerpoMensaje': {
                                    type: "string",
                                    validation: {
                                        CuerpoMensajeValidation: function (input) {
                                            if (input.is("[name='CuerpoMensaje']") && input.val() == "") {
                                                input.attr("data-CuerpoMensajeValidation-msg", window.app.idioma.t("CAMPO_REQUERIDO"));
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
                                'Activo': { type: "boolean"},
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

                self.grid = this.$("#gridMalaGestionWO").kendoGrid({
                    dataSource: self.dsAlertasMalaGestionWO,
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
                            field: "MailLineas",
                            title: window.app.idioma.t('LINEAS'),
                            template: function (data) { if (typeof data.MailLineas !== 'undefined') { if (data.MailLineas.length > 0) { return self.templateLineas(data.MailLineas) } else return ""; } return "" },
                            editor: function (e, options) { return self.lineaEditor(e, options) },
                            width: 380
                        },
                        {
                            field: "MailGrupos",
                            title: window.app.idioma.t('GRUPOS_EMAILS'),
                            template: function (data) { if (typeof data.MailGrupos !== 'undefined') { if (data.MailGrupos.length > 0) { return self.templateGroups(data.MailGrupos) } else return ""; } return "" },
                            editor: function (e, options) { return self.mailGroupDropDownEditor(e, options) },
                            width: 200
                        },
                        {
                            field: "Asunto",
                            title: window.app.idioma.t('ASUNTO_EMAIL'),
                            width: 170
                        },
                        {
                            field: "CuerpoMensaje",
                            title: window.app.idioma.t('CONTENIDO_EMAIL'),
                            width: 340,
                            editor: function (e, options) { return self.cuerpoMensajeEditorTextArea(e, options) },
                        },
                        {
                            field: "Activo",
                            title: window.app.idioma.t('ACTIVO'),
                            width: 60,
                            template: "# if(typeof Activo !== 'undefined') { if(Activo){#" + window.app.idioma.t("SI") + "#} else {#" + window.app.idioma.t("NO") + "#}} #",
                            editor: function (e, options) { return self.resendEditorComboBox(e, options) },
                        },
                        {
                            field: "coms",
                            title: window.app.idioma.t("OPERACIONES"),
                            attributes: { "align": "center" },
                            width: 220,
                            command: [
                                {
                                    name: "edit",
                                    text: {
                                        edit: window.app.idioma.t("EDITAR"),
                                        update: window.app.idioma.t("ACTUALIZAR"),
                                        cancel: window.app.idioma.t("CANCELAR")
                                    },
                                    click: function (e) {
                                        var permiso = TienePermiso(287);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            $('#gridMalaGestionWO').data("kendoGrid").cancelChanges();
                                        }
                                    }
                                },
                                {
                                    className: "btn-destroy",
                                    name: "Delete",
                                    text: window.app.idioma.t('ELIMINAR'),
                                    click: function (e) {
                                        e.preventDefault(); //prevent page scroll reset
                                        var permiso = TienePermiso(287);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            return;
                                        }

                                        var grid = $("#gridMalaGestionWO").data("kendoGrid");
                                        var tr = $(e.target).closest("tr");
                                        var data = this.dataItem(tr);

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
                                    name: "testMail",
                                    text: window.app.idioma.t('PROBAR_ENVIO'),
                                    click: function (e) {
                                        kendo.ui.progress($("#gridMalaGestionWO"), true);
                                        e.preventDefault(); //prevent page scroll reset
                                        var tr = $(e.target).closest("tr");
                                        var data = this.dataItem(tr);
                                        self.testMail(data);
                                    }
                                }
                            ]
                        }
                    ],
                    editable: "inline",
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");

                $(".k-grid-add").click(function (e) {
                    var permiso = TienePermiso(287);

                    if (!permiso) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                        return false;
                    }
                });
            },
            events: {
            },
            dataSourceLineas: function () {
                var datasourceLineas = [];
                $.each(window.app.planta.lineas, function (index, linea) {
                    var data = {};
                    data.Id = linea.id;
                    data.Nombre = linea.nombre;
                    data.NumeroLinea = linea.numLinea;
                    data.Descripcion = linea.descripcion;
                    data.NumeroLineaDescripcion = linea.numLineaDescripcion;
                    datasourceLineas.push(data);
                });

                return new kendo.data.DataSource({
                    data: datasourceLineas,
                    sort: { field: "NumeroLinea", dir: "asc" }
                });
            },
            testMail: function (data) {
                $.ajax({
                    type: "GET",
                    url: "../api/MailMalaGestionWO_TestMail/" + data.Id,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    Not.crearNotificacion('success', 'Info', window.app.idioma.t('SUCCESS_TEST_MAIL'), 4000);
                    kendo.ui.progress($("#gridMalaGestionWO"), false);
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_TEST_MAIL'), 4000);
                    }
                    kendo.ui.progress($("#gridMalaGestionWO"), false);
                });
            },
            templateLineas: function (data) {
                var result = "";
                for (var i = 0; i < data.length; i++) {
                    result = result + window.app.idioma.t('LINEA') + " " + data[i].NumeroLineaDescripcion + " - " + data[i].Descripcion + ", ";
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
            lineaEditor: function (container, options) {
                $('<input style="width:100% !important" id="linea" name="' + options.field + '"/>')
                    .appendTo(container)
                    .kendoMultiSelect({
                        optionLabel: window.app.idioma.t("SELECCIONE"),
                        dataTextField: "Nombre",
                        dataValueField: "Id",
                        tagTemplate: window.app.idioma.t('LINEA') + " #= NumeroLineaDescripcion # - #=Descripcion #",
                        itemTemplate: window.app.idioma.t('LINEA') + " #= NumeroLineaDescripcion # - #=Descripcion #",
                        dataSource: this.dataSourceLineas(),
                    }).data("kendoMultiSelect");
                var linea = $("#linea").data("kendoMultiSelect");
                linea.list.width("auto");
            },
            resendEditorComboBox: function (container, options) {
                $('<select id="dropdownlist" data-bind="value: ' + options.field + '"><option value="true">' + window.app.idioma.t("SI") +
                    '</option><option value="false">' + window.app.idioma.t("NO") + '</option> </select>').appendTo(container).kendoDropDownList();
            },
            cuerpoMensajeEditorTextArea: function (container, options) {
                $('<textarea data-maxtextlength="250" class="k-textarea" rows="4" id="CuerpoMensaje" name="CuerpoMensaje" style="width:95%" data-bind="value: ' + options.field + '"></textarea>').appendTo(container);
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

                var gridElement = $("#gridMalaGestionWO"),
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