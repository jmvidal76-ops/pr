define(['underscore', 'backbone', 'jquery', 'text!../../../Administracion/html/CrearRol.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, plantillaCrearUsuario, VistaDlgConfirm, Not) {
        var vistaEditarRol = Backbone.View.extend({
            tagName: 'div',
            id: 'divCrearRol',
            rol: null,
            funciones: [],
            window: null,
            title: null,
            registrosSel: [],
            template: _.template(plantillaCrearUsuario),
            initialize: function (data) {
                var self = this;
                self.rol = data;

                self.title = window.app.idioma.t('EDITAR_ROL');

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerFuncionesRol/" + self.rol.Id,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).success(function (data) {
                    self.funciones = data;
                }).error(function (err, msg, ex) {
                    if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_GET_ROLES'), 4000);
                    }
                })
                this.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.$("#btnAceptar").kendoButton();
                self.$("#btnCancelar").kendoButton();
                self.$("#btnAceptar").val(window.app.idioma.t('ACEPTAR'));
                self.$("#btnCancelar").val(window.app.idioma.t('CANCELAR'));
                self.$("#lblRol").text(window.app.idioma.t('ROL'));
                self.$("#lblFuncinoes").text(window.app.idioma.t('FUNCIONES'));

                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerFunciones/",
                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                            , cache: true
                        }
                    },
                    schema: {
                        parse: function (data) {
                            var funciones = [];
                            for (var i = 0; i < data.length; i++) {
                                var funcion = {
                                    IdFuncion: data[i].ID_FUNCION,
                                    Descripcion: data[i].DESCRIPCION,
                                    IdArea: data[i].ID_AREA,
                                    DescripcionArea: data[i].AREAS_GESTION.DESCRIPCION,
                                    CodigoArea: data[i].AREAS_GESTION.CODIGO,
                                    IdEstructura: data[i].ID_ESTRUCTURA,
                                    DescripcionEstructura: data[i].EstructuraPermisos.Descripcion,
                                }
                                funciones.push(funcion);
                            }
                            return funciones;
                        },
                        model: {
                            fields: {
                                'IdFuncion': { type: "number" },
                                'Descripcion': { type: "string" },
                                'IdArea': { type: "number" },
                                'DescripcionArea': { type: "string", title: window.app.idioma.t('AREA') },
                                'CodigoArea': { type: "string" },
                                'IdEstructura': { type: "number" },
                                'DescripcionEstructura': { type: "string" },
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    },
                    sort: { field: "Descripcion", dir: "asc" },
                    group: [{ field: "DescripcionArea" }, { field: "DescripcionEstructura" }]
                });

                self.grid = this.$("#gridFunciones").kendoGrid({
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
                    height: 500,
                    columns: [
                        {
                            title: "",
                            template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                            width: 30
                        },
                        {
                            field: "Descripcion",
                            title: " ",
                            width: 500
                        },
                        {
                            field: "DescripcionArea",
                            title: " ",
                            groupHeaderTemplate: "#= value #",
                            hidden: true
                        },
                        {
                            field: "DescripcionEstructura",
                            title: " ",
                            groupHeaderTemplate: "#= value #",
                            hidden: true
                        }
                    ],
                    dataBound: function () {
                        $(".checkbox").bind("change", function (e) {
                            var checked = this.checked;
                            row = $(e.target).closest("tr");
                            grid = $("#gridFunciones").data("kendoGrid");
                            dataItem = grid.dataItem(row);
                            var idValue = dataItem.get("IdFuncion");
                            if (checked) {
                                //row.addClass("k-state-selected");
                                self.registrosSel.push(idValue);
                                self.$("#lblRegSel").text(self.registrosSel.length);

                            } else {
                                //row.removeClass("k-state-selected");
                                var index = self.registrosSel.indexOf(idValue);
                                if (index >= 0) {
                                    self.registrosSel.splice(index, 1);
                                    self.$("#lblRegSel").text(self.registrosSel.length);
                                }
                            }

                        });

                        var grid = $("#gridFunciones").data("kendoGrid");                        

                        if (grid.dataSource.group().length > 0) {
                            var groups = $(".k-grouping-row")
                            groups.each(function (idx, group) {
                                grid.collapseGroup(group);
                            });
                        }
                        var items = grid.items();

                        items.each(function (idx, row) {
                            var dataItem = grid.dataItem(row);
                            if (self.funciones.indexOf(dataItem["IdFuncion"]) >= 0) {
                                $(row.cells[2])[0].childNodes[0].checked = true;
                            }
                        });

                        self.registrosSel = self.funciones;
                    }
                }).data("kendoGrid");

                this.$("#txtRol").val(this.rol.Name);

                self.window = $(self.el).kendoWindow(
                {
                    title: self.title,
                    width: "735px",
                    height: "680px",
                    scrollable: false,
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: []
                }).data("kendoWindow");

                self.dialog = $('#divCrearRol').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
            },
            limpiarFiltroGrid: function (e) {
                e.preventDefault();
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
            }, aceptar: function (e) {
                e.preventDefault();

                var self = this;
                var rol = {};
                rol.name = self.$("#txtRol").val();
                rol.funciones = self.registrosSel;
                rol.Id = self.rol.Id;

                if (!rol.name || rol.funciones.length <= 0) {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_PROPORCIONAR_UN'), 4000);
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
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1], 4000);
                                self.dialog.close();
                                self.eliminar();
                            }
                            else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EN_LA'), 4000);
                            Backbone.trigger('eventCierraDialogo');
                        },
                        error: function (response) {
                            if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);;
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EN_LA'), 4000);
                            }
                            Backbone.trigger('eventCierraDialogo');
                        }
                    });
                }

            },
            eliminar: function () {
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

        return vistaEditarRol;
    });