define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/EditarCantidadesOrden.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, plantillaCrearUsuario, VistaDlgConfirm, Not) {
        var vistaEditarCantidadesOrden = Backbone.View.extend({
            tagName: 'div',
            id: 'divEditarCantidades',
            idOrden: null,
            funciones: [],
            window: null,
            title: null,
            options: null,
            update: false,
            template: _.template(plantillaCrearUsuario),
            initialize: function (data) {
                var self = this;
                self.idOrden = data.idOrden;
                self.options = data;
                self.title = window.app.idioma.t('MODIFICACION_CANTIDADES');

                this.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.ds = new kendo.data.DataSource({
                    transport: {
                        //read: {
                        //    url: "../api/ordenes/ObtenerPropiedadesOrden/" + self.idOrden + "/",
                        //    dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        //    type: "GET"
                        //},
                        //update: {
                        //    url: "../api/ordenes/ObtenerPropiedadesOrden/Update/",
                        //    dataType: "json",
                        //    contentType: "application/json; charset=utf-8",
                        //    type: "POST"
                        //},
                        //parameterMap: function (options, operation) {
                        //    if (operation !== "read" && options.models) {
                        //        return JSON.stringify(options.models);
                        //    }
                        //},
                        read: function (e) {

                            $.ajax({
                                type: "GET",
                                async: false,
                                url: "../api/ordenes/ObtenerPropiedadesOrden/" + self.idOrden + "/",
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (res) {
                                    e.success(res);
                                },
                                error: function (response) {
                                    if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);;
                                    } else {
                                        Not.crearNotificacion('error', 'Aviso', window.app.idioma.t('ERROR_OBTENIENDO_DATOS'), 2000);
                                    }
                                    Backbone.trigger('eventCierraDialogo');
                                }
                            });
                        },
                        update: function (e) {
                            $.ajax({
                                type: "POST",
                                async: false,
                                url: "../api/ordenes/ObtenerPropiedadesOrden/Update/",
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                data: JSON.stringify(e.data.models),
                                success: function (res) {
                                    self.update = true;
                                    e.success();
                                    self.cancelar();
                                },
                                error: function (response) {
                                    if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);;
                                    } else {
                                        Not.crearNotificacion('error', 'Aviso', window.app.idioma.t('ERROR_GUARDANDO_DATOS'), 2000);
                                    }
                                    Backbone.trigger('eventCierraDialogo');
                                }
                            });
                        },
                    },
                    batch: true,
                    pageSize: 20,
                    schema: {
                        model: {
                            id: "IdPropiedad",
                            fields: {
                                IdOrden: { type: "string" },
                                IdPropiedadOrden: { type: "number" },
                                IdPropiedad: { type: "number" },
                                Name: { editable: false, type: "string" },
                                Tipo: { type: "string" },
                                Value: { type: "number", defaultValue: 0 },
                            },
                            getName: function () {
                                return window.app.idioma.t(this.Name);
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    },
                });



                self.grid = this.$("#gridPropiedadesOrden").kendoGrid({
                    dataSource: self.ds,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    toolbar: [
                        {
                            template: "<button id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        }
                    ],
                    sortable: true,
                    resizable: true,
                    height: 300,
                    toolbar: ["save", "cancel"],
                    messages: {
                        commands: window.app.cfgKendo.configuracionOperacionesGrid
                    },
                    columns: [
                        {
                            field: "getName()",
                            title: window.app.idioma.t("NOMBRE"),
                            width: 320
                        },
                        {
                            field: "Value",
                            template: function (dataItem) {
                                if (!dataItem.Value) {
                                    return 0;
                                } else {
                                    return dataItem.Value;
                                }
                            },
                            editor: self.gridValueColumnEditor,
                            title: window.app.idioma.t("VALOR")
                        },
                    ],
                    editable: true
                }).data("kendoGrid");

                //Situamos el footer al final
                this.$("#gridPropiedadesOrden").find(".k-grid-toolbar").insertAfter(this.$("#gridPropiedadesOrden").find(".k-grid-content"));

                self.window = $(self.el).kendoWindow(
                {
                    title: self.title,
                    width: "600px",
                    modal: true,
                    resizable: false,
                    draggable: true,
                    scrollable: false,
                    actions: ['close'],
                    close: function (e) {
                        self.onClose(self.options, self.update, self.idOrden);
                    }
                }).data("kendoWindow");

                self.dialog = $('#divEditarCantidades').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            gridValueColumnEditor: function (container, options) {
                switch (options.model.Tipo) {
                    case 'string':
                        createStringEditor(container, options);
                        break;

                    case 'Numeric':
                        $('<input name="' + options.field + '"/>')
                        .appendTo(container)
                        .kendoNumericTextBox({
                            format: "0",
                            decimals: 0
                        });
                        break;

                    case 'decimal':
                        createDoubleEditor(container, options);
                        break;

                    case 'bool':
                        createBooleanEditor(container, options);
                        break;

                    case 'date':
                        createDateTimeEditor(container, options);
                        break;

                    default:
                        break;
                }
            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
                'change #selectAgrupacion': 'Agrupar',
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
                'click .k-grid-cancel-changes': 'cancelGrid',
                'click .k-grid-save-changes': 'saveGrid'
            },
            onClose: function (options, update, idOrden) {
                options.funcion(update, idOrden);
            },
            cancelGrid: function () {
                var self = this;
                self.cancelar();
            },
            saveGrid: function () {
                var self = this;
                self.update = true;
            },
            limpiarFiltroGrid: function (e) {
                e.preventDefault();
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            cancelar: function (e) {
                var self = this;
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
                self.options.funcion(self.update, self.idOrden);

            }, aceptar: function (e) {
                e.preventDefault();

                var self = this;
                var rol = {};
                rol.name = self.$("#txtRol").val();
                rol.funciones = self.registrosSel;
                rol.Id = self.rol.Id;

                if (!rol.name || rol.funciones.length <= 0) {
                    Not.crearNotificacion('error', 'Aviso', window.app.idioma.t('DEBE_PROPORCIONAR_UN'), 2000);
                } else {
                    $.ajax({
                        data: JSON.stringify(rol),
                        type: "POST",
                        async: false,
                        url: "../api/editarRol",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            if (res[0] == true) {
                                $("#gridGestionRoles").data('kendoGrid').dataSource.read();
                                $("#gridGestionRoles").data('kendoGrid').refresh();
                                Not.crearNotificacion('success', 'Aviso', res[1], 2000);
                                self.dialog.close();
                                self.eliminar();
                            }
                            else Not.crearNotificacion('error', 'Aviso', window.app.idioma.t('ERROR_EN_LA'), 2000);
                            Backbone.trigger('eventCierraDialogo');
                        },
                        error: function (response) {
                            if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);;
                            } else {
                                Not.crearNotificacion('error', 'Aviso', window.app.idioma.t('ERROR_EN_LA'), 2000);
                            }
                            Backbone.trigger('eventCierraDialogo');
                        }
                    });
                }

            },
            eliminar: function () {
                var self = this;


                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            }
        });

        return vistaEditarCantidadesOrden;
    });