define(['underscore', 'backbone', 'jquery', 'text!../../../ControlGestion/html/CrearEditarConfiguracionMateriales.html', 'compartido/notificaciones', 'definiciones'],
    function (_, Backbone, $, plantillaConfigMateriales, Not, definiciones) {
        var vistaCrearEditarConfiguracionMateriales = Backbone.View.extend({
            tagName: 'div',
            id: 'divCrearEditarConfiguracionMateriales',
            window: null,
            accion: null,
            dsMateriales: null,
            row: null,
            constOperaciones: definiciones.OperacionesCRUD(),
            template: _.template(plantillaConfigMateriales),
            initialize: function (accion) {
                var self = this;

                // Accion: 0 - Añadir, 1 - Editar
                self.accion = accion.operacion;

                if (self.accion == self.constOperaciones.Editar) {
                    // Obtenemos la línea seleccionada del grid
                    var grid = $("#gridConfigMateriales").data("kendoGrid");
                    self.row = grid.dataItem(grid.select());

                    if (self.row == null) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                        return;
                    }
                }

                self.obtenerMateriales();
                self.render();
            },
            obtenerMateriales: function () {
                var self = this;

                self.dsMateriales = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/materiales/MMPPSemielaborados",
                            dataType: "json"
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                self.configurarControles();
                var tituloWindow = self.accion == self.constOperaciones.Crear ? window.app.idioma.t('ANADIR') + ' ' + window.app.idioma.t('MATERIAL')
                    : window.app.idioma.t('ACTUALIZAR') + ' ' + window.app.idioma.t('MATERIAL');

                self.window = $(self.el).kendoWindow(
                    {
                        title: tituloWindow,
                        width: "690px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: [],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                self.dialog = $('#divCrearEditarConfiguracionMateriales').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                if (self.accion == self.constOperaciones.Editar) {
                    self.rellenarDatos();
                }
            },
            configurarControles: function () {
                var self = this;

                self.$("#cmbMateriales").kendoDropDownList({
                    dataSource: self.dsMateriales,
                    template: "#= data.IdMaterial # - #= data.Descripcion #",
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdMaterial",
                    valueTemplate: "#= data.IdMaterial # - #= data.Descripcion #",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    filtering: function (ev) {
                        var filterValue = ev.filter != undefined ? ev.filter.value : "";
                        ev.preventDefault();

                        this.dataSource.filter({
                            logic: "or",
                            filters: [
                                {
                                    field: "IdMaterial",
                                    operator: "contains",
                                    value: filterValue
                                },
                                {
                                    field: "Descripcion",
                                    operator: "contains",
                                    value: filterValue
                                }
                            ]
                        });
                    }
                });

                $("#btnAceptarMaterial").kendoButton({
                    click: function () { self.guardar(); }
                });

                $("#btnCancelarMaterial").kendoButton({
                    click: function () { self.cancelar(); }
                });
            },
            rellenarDatos: function () {
                var self = this;
                $("#cmbMateriales").getKendoDropDownList().value(self.row.IdMaterial);
            },
            events: {
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.window.close();
                this.eliminar();
            },
            guardar: function () {
                var self = this;

                $("#trError").hide();

                let idMaterial = $("#cmbMateriales").getKendoDropDownList().value();

                var data = {};
                data.IdConfig = self.accion == self.constOperaciones.Crear ? 0 : self.row.IdConfig;
                data.IdMaterial = idMaterial;

                var type = self.accion == self.constOperaciones.Crear ? "POST" : "PUT";
                var url = self.accion == self.constOperaciones.Crear ? "../api/controlGestion/insertarMaterialAjusteStockJDE" : "../api/controlGestion/actualizarMaterialAjusteStockJDE";

                $.ajax({
                    data: JSON.stringify(data),
                    type: type,
                    async: false,
                    url: url,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res == "") {
                            self.window.close();
                            self.eliminar();
                            $("#gridConfigMateriales").data('kendoGrid').dataSource.read();

                            if (self.accion == self.constOperaciones.Crear)
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('GUARDADO_CORRECTAMENTE'), 3000);
                            else
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('REGISTRO_ACTUALIZADO_CORRECTAMENTE'), 3000);
                        } else {
                            $("#trError").show();
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            if (self.accion == self.constOperaciones.Crear)
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_GUARDAR'), 4000);
                            else
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearEditarConfiguracionMateriales;
    });