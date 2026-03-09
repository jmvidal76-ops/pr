define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/EnvioEmailPartesCalidadNoValidos.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm) {
        var vistaEmailPartesCalidad = Backbone.View.extend({
            template: _.template(plantilla),
            dsPartesCalidad: null,
            listaPdvs: [],
            initialize: function () {
                var self = this;

                self.dsPartesCalidad = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/MailPartesCalidadNoValidos_Read",
                            dataType: "json"
                        },
                        create: {
                            url: "../api/MailPartesCalidadNoValidos_Create",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "POST",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_CREANDO_ALERTA"), 4000);
                                } else if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    $("#gridPartesCalidad").data("kendoGrid").dataSource.read();
                                }
                            },
                        },
                        update: {
                            url: "../api/MailPartesCalidadNoValidos_Update",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_ACTUALIZANDO_ALERTA"), 4000);
                                } else if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    $("#gridPartesCalidad").data("kendoGrid").dataSource.read();
                                }
                            },
                        },
                        destroy: {
                            url: "../api/MailPartesCalidadNoValidos_Delete",
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
                            id: "IdMailParteCalidad",
                            fields: {
                                'IdMailParteCalidad': { type: "number", editable: false },
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
                                'PuntoVerificacion': {
                                    type: "string",
                                    validation: {
                                        PuntoVerificacionValidation: function (input) {
                                            if (input.is("[name='PuntoVerificacion']")) {
                                                if ($("#cmbPdvNivel1").data("kendoDropDownList").value() == "") {
                                                    input.attr("data-PuntoVerificacionValidation-msg", window.app.idioma.t("CAMPO_REQUERIDO"));
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
                                'Activo': { type: "boolean" },
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

                self.grid = this.$("#gridPartesCalidad").kendoGrid({
                    dataSource: self.dsPartesCalidad,
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
                            field: "PuntoVerificacion",
                            title: window.app.idioma.t('ALT_LOCATIONS'),
                            editor: function (e, options) { return self.pdvEditor(e, options) },
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
                                        var permiso = TienePermiso(349);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            $('#gridPartesCalidad').data("kendoGrid").cancelChanges();
                                        }
                                    }
                                },
                                {
                                    className: "btn-destroy",
                                    name: "Delete",
                                    text: window.app.idioma.t('ELIMINAR'),
                                    click: function (e) {
                                        e.preventDefault(); //prevent page scroll reset
                                        var permiso = TienePermiso(349);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            return;
                                        }

                                        var grid = $("#gridPartesCalidad").data("kendoGrid");
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
                                        kendo.ui.progress($("#gridPartesCalidad"), true);
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
                    save: function (e) {
                        let pdv = '';

                        if ($("#cmbPdvNivel1").data('kendoDropDownList').value() !== '') {
                            pdv = $("#cmbPdvNivel1").data('kendoDropDownList').text();

                            if ($("#cmbPdvNivel2").data('kendoDropDownList').value() !== '') {
                                pdv = pdv + ' \\ ' + $("#cmbPdvNivel2").data('kendoDropDownList').text();

                                if ($("#cmbPdvNivel3").data('kendoDropDownList').value() !== '') {
                                    pdv = pdv + ' \\ ' + $("#cmbPdvNivel3").data('kendoDropDownList').text();
                                }
                            }
                        }

                        e.model.PuntoVerificacion = pdv;
                    },
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");

                $(".k-grid-add").click(function (e) {
                    var permiso = TienePermiso(349);

                    if (!permiso) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                        return false;
                    }
                });
            },
            events: {
            },
            testMail: function (data) {
                $.ajax({
                    type: "GET",
                    url: "../api/MailPartesCalidadNoValidos_TestMail/" + data.IdMailParteCalidad,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    Not.crearNotificacion('success', 'Info', window.app.idioma.t('SUCCESS_TEST_MAIL'), 4000);
                    kendo.ui.progress($("#gridPartesCalidad"), false);
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_TEST_MAIL'), 4000);
                    }
                    kendo.ui.progress($("#gridPartesCalidad"), false);
                });
            },
            templateGroups: function (data) {
                var result = "";
                for (var i = 0; i < data.length; i++) {
                    result = result + data[i].Name + ", ";
                }
                return result.substring(0, result.length - 2);
            },
            dataSourceLocationsN1: function () {
                let idLocation = 0;

                // Obtenemos pdvs para el nivel 1
                self.listaPdvs = window.app.calidad.pdvs;
                let location = self.listaPdvs.filter(function (item) {
                    return item.idParent == null;
                });

                if (location.length != 0) {
                    idLocation = location[0].ID;
                }

                let locationsN1 = self.listaPdvs.filter(function (item) {
                    return item.idParent == idLocation;
                });

                return new kendo.data.DataSource({
                    data: locationsN1,
                    sort: { field: "name", dir: "asc" }
                });
            },
            pdvEditor: function (container, options) {
                $('<label for="cmbPdvNivel1">' + window.app.idioma.t("NIVEL") + " 1" + '</label>').appendTo(container);

                $('<input style="width:100% !important" id="cmbPdvNivel1" name="' + options.field + '" />')
                    .appendTo(container)
                    .kendoDropDownList({
                        optionLabel: window.app.idioma.t("SELECCIONE"),
                        dataTextField: "name",
                        dataValueField: "ID",
                        dataSource: this.dataSourceLocationsN1(),
                        valuePrimitive: true,
                        change: function () {
                            // Obtenemos pdvs para el nivel 2
                            let idN1 = this.value();

                            let locationsN2 = self.listaPdvs.filter(function (item) {
                                return item.idParent == idN1;
                            });

                            let ds = new kendo.data.DataSource({
                                data: locationsN2,
                                sort: { field: "name", dir: "asc" }
                            });

                            let comboN2 = $("#cmbPdvNivel2").data('kendoDropDownList');
                            comboN2.setDataSource(ds);
                        },
                    }).data("kendoDropDownList");

                let pdvN1 = $("#cmbPdvNivel1").data("kendoDropDownList");
                pdvN1.list.width("auto");

                $('<label for="cmbPdvNivel2">' + window.app.idioma.t("NIVEL") + " 2" + '</label>').appendTo(container);
                $('<input style="width:100% !important" id="cmbPdvNivel2" />')
                    .appendTo(container)
                    .kendoDropDownList({
                        optionLabel: window.app.idioma.t("SELECCIONE"),
                        dataTextField: "name",
                        dataValueField: "ID",
                        change: function () {
                            // Obtenemos pdvs para el nivel 3
                            let idN2 = this.value();

                            let locationsN3 = self.listaPdvs.filter(function (item) {
                                return item.idParent == idN2;
                            });

                            let locationsN3N4 = [];
                            locationsN3.forEach(function (locationN3) {
                                locationsN3N4.push(locationN3);

                                let locationsN4 = self.listaPdvs.filter(function (item) {
                                    return item.idParent == locationN3.ID;
                                });

                                locationsN4.forEach(function (locationN4) {
                                    locationsN3N4.push(locationN4);
                                });
                            });

                            let ds = new kendo.data.DataSource({
                                data: locationsN3N4,
                                sort: { field: "name", dir: "asc" }
                            });

                            let comboN3 = $("#cmbPdvNivel3").data('kendoDropDownList');
                            comboN3.setDataSource(ds);
                        }
                    }).data("kendoDropDownList");

                let pdvN2 = $("#cmbPdvNivel2").data("kendoDropDownList");
                pdvN2.list.width("auto");

                $('<label for="cmbPdvNivel3">' + window.app.idioma.t("NIVEL") + " 3" + '</label>').appendTo(container);
                $('<input style="width:100% !important" id="cmbPdvNivel3" />')
                    .appendTo(container)
                    .kendoDropDownList({
                        optionLabel: window.app.idioma.t("SELECCIONE"),
                        dataTextField: "name",
                        dataValueField: "ID",
                    }).data("kendoDropDownList");

                var pdvN3 = $("#cmbPdvNivel3").data("kendoDropDownList");
                pdvN3.list.width("auto");

                setTimeout(() => {
                    if (options.model.PuntoVerificacion != '') {
                        const niveles = options.model.PuntoVerificacion.split("\\");

                        for (var i = 0; i < niveles.length; i++) {
                            if (i == 0) {
                                $("#cmbPdvNivel1").data("kendoDropDownList").text(niveles[i].trim());
                                $("#cmbPdvNivel1").data("kendoDropDownList").trigger("change");
                            }

                            if (i == 1) {
                                $("#cmbPdvNivel2").data("kendoDropDownList").text(niveles[i].trim());
                                $("#cmbPdvNivel2").data("kendoDropDownList").trigger("change");
                            }

                            if (i == 2) {
                                $("#cmbPdvNivel3").data("kendoDropDownList").text(niveles[i].trim());
                            }
                        }
                    }
                });
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

                var gridElement = $("#gridPartesCalidad"),
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

        return vistaEmailPartesCalidad;
    });