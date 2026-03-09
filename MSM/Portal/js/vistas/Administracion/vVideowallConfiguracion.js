define(['underscore', 'backbone', 'jquery', 'text!../../../Administracion/html/VideowallConfiguracion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
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
                            url: "../api/ObtenerInformacionVideowall",
                            dataType: "json"
                        },
                        update: {
                            url: "../api/ActualizarPantallaVideowall",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_ACTUALIZAR_VIDEOWALL"), 4000);
                                } else if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    var gridTran = $("#grid").data("kendoGrid");
                                    gridTran.dataSource.read();
                                }
                            },
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
                                'Descripcion': { type: "string", editable: false },
                                'Pagina': { type: "string", editable: false },

                                'Visible': {
                                    type: "boolean"
                                },
                                'Duracion': {
                                    type: "number"
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
                    columns: [
                        {
                            field: "Descripcion",
                            title: window.app.idioma.t('PANTALLA'),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Descripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#=Descripcion#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Pagina",
                            title: window.app.idioma.t('PAGINA'),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Pagina#' style='width: 14px;height:14px;margin-right:5px;'/>#=Pagina#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Visible",
                            title: window.app.idioma.t('VISIBLE'),
                            template: "# if(typeof Visible !== 'undefined') { if(Visible){#" + window.app.idioma.t("SI") + "#} else {#No#}} #",
                            editor: function (e, options) { return self.editarCampoVisible(e, options) },
                        },
                        {
                            field: "Duracion",
                            title: window.app.idioma.t('DURACION'),
                            editor: function (e, options) { return self.editarCampoDuracion(e, options) },

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
                                        var permiso = TienePermiso(228);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            $('#grid').data("kendoGrid").cancelChanges();
                                        }

                                    }
                                },

                            ]
                        }
                    ],
                    editable: "inline",
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");
            },
            //Combo
            editarCampoVisible: function (container, options) {
                $('<select id="dropdownlist" data-bind="value: ' + options.field + '"><option value="true">' + window.app.idioma.t("SI") +
                    '</option><option value="false">' + window.app.idioma.t("NO") + '</option> </select>').appendTo(container).kendoDropDownList();
            },
            //Campo numerico
            editarCampoDuracion: function (container, options) {
                $('<input data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoNumericTextBox({
                        min: 5,
                        format: "0",
                        decimals: 0

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
            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

