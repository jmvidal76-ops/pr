define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/GestionGrupos.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, Session) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            dsGroups: null,
            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;

                self.dsGroups = new kendo.data.DataSource({
                    pageSize: 100,
                    transport: {
                        read: {
                            url: "../api/MailGroup_Read",
                            dataType: "json"
                        },
                        create: {
                            url: "../api/MailGroup_Create",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "POST",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_CREANDO_GRUPO"), 4000);
                                } else if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    var gridTran = $("#grid").data("kendoGrid");
                                    gridTran.dataSource.read();
                                }
                            },
                        },
                        update: {
                            url: "../api/MailGroup_Update",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_ACTUALIZANDO_GRUPO"), 4000);
                                } else if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    var gridTran = $("#grid").data("kendoGrid");
                                    gridTran.dataSource.read();
                                }
                            },
                        },
                        destroy: {
                            url: "../api/MailGroup_Delete",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "DELETE",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_ELIMINAR_GRUPO"), 4000);
                                } else if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else if (!e.responseJSON) {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GRUPO_EMAIL'), 4000);
                                    $("#grid").data("kendoGrid").dataSource.read();
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
                                'Name': {
                                    type: "string",
                                    validation: {
                                        nameAddressValidation: function (input) {
                                            if (input.is("[name='Name']") && input.val() == "") {
                                                input.attr("data-nameAddressValidation-msg", window.app.idioma.t("CAMPO_REQUERIDO"));
                                                return false;
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
                                }
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
                    dataSource: self.dsGroups,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    sortable: true,
                    resizable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: [100, 200, 500],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    toolbar: [
                    {
                        name: "create", text:  window.app.idioma.t("AGREGAR")
                    }],
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    columns: [
                        { field: "Name", title: window.app.idioma.t('NOMBRE'), width: 150 },
                        {
                            field: "UserAddress",
                            title: window.app.idioma.t('CORREOS_ELECTRONICOS')
                        },
                        {
                            field: "coms",
                            title: window.app.idioma.t("OPERACIONES"),
                            attributes: { "align": "center" },
                            width: 200,
                            command: [
                                {
                                    name: "edit",
                                    text: {
                                        edit: window.app.idioma.t("EDITAR"),
                                        update: window.app.idioma.t("ACTUALIZAR"),
                                        cancel: window.app.idioma.t("CANCELAR")
                                    },
                                    click: function (e) {
                                        var permiso = TienePermiso(176);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            $('#grid').data("kendoGrid").cancelChanges();
                                        }
                                        document.querySelector("input[type=text][name=UserAddress]").setAttribute("placeholder", window.app.idioma.t("FORMATO_MULTIPLES_CORREOS"));
                                    }
                                },
                                {
                                    className: "btn-destroy",
                                    name: "Delete",
                                    text: window.app.idioma.t('ELIMINAR'),
                                    click: function (e) {
                                        e.preventDefault(); //prevent page scroll reset
                                        var permiso = TienePermiso(176);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            return;
                                        }

                                        var grid = $("#grid").data("kendoGrid");
                                        var tr = $(e.target).closest("tr"); //get the row for deletion
                                        var data = this.dataItem(tr); //get the row data so it can be referred later

                                        this.confirmacion = new VistaDlgConfirm({
                                            titulo: window.app.idioma.t('ELIMINAR'),
                                            msg: window.app.idioma.t('CONFIRMACION_ELIMINAR_GRUPO'),
                                            funcion: function () {
                                                grid.dataSource.remove(data);  //prepare a "destroy" request
                                                grid.dataSource.sync();  //actually send the request (might be ommited if the autoSync option is enabled in the dataSource)
                                                Backbone.trigger('eventCierraDialogo');
                                            }, contexto: this
                                        });
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
                    var permiso = TienePermiso(176);

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

            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

