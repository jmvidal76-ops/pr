define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/CrearEditarParametroFabricacion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'definiciones'],
    function (_, Backbone, $, plantillaParametroFabricacion, Not, VistaDlgConfirm, definiciones) {
        var vistaCrearEditarParametroFabricacion = Backbone.View.extend({
            tagName: 'div',
            id: 'divCrearEditarParametroFabricacion',
            window: null,
            accion: null,
            dsMaterial: null,
            dsParametrosFabricacion: null,
            row: null,
            constOperaciones: definiciones.OperacionesCRUD(),
            template: _.template(plantillaParametroFabricacion),
            initialize: function (accion, tipoWO, dsMaterial, dsParametrosFabricacion, parametro) {
                var self = this;

                // Accion: 0 - Añadir, 1 - Editar
                self.accion = parseInt(accion);
                self.tipoWO = tipoWO;
                self.dsMaterial = dsMaterial;
                self.dsParametrosFabricacion = dsParametrosFabricacion;

                if (self.accion == self.constOperaciones.Editar) {
                    if (parametro) {
                        self.row = parametro;
                    } else {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                        return;
                    }
                }

                self.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                self.configurarControles();
                var tituloWindow = self.accion == self.constOperaciones.Crear ? window.app.idioma.t('CREAR') + ' ' + window.app.idioma.t('PARAMETROS_FABRICACION') : window.app.idioma.t('EDITAR') + ' ' + window.app.idioma.t('PARAMETROS_FABRICACION');

                self.window = $(self.el).kendoWindow(
                    {
                        title: tituloWindow,
                        width: "695px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: [],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                self.dialog = $('#divCrearEditarParametroFabricacion').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                if (self.accion == self.constOperaciones.Editar) {
                    self.rellenarDatos();
                }

                var nombre = self.obtenerNombreTipoWO(self.tipoWO);
                $("#txtTipoWO").val(nombre);
            },
            configurarControles: function () {
                var self = this;

                self.$("#cmbMaterial").kendoDropDownList({
                    dataSource: self.dsMaterial,
                    filter: "contains",
                    dataTextField: "DescripcionCompleta",
                    dataValueField: "IdMaterial",
                    optionLabel: window.app.idioma.t('SELECCIONAR')
                });

                self.$("#cmbEnumParametro").kendoDropDownList({
                    dataSource: self.dsParametrosFabricacion,
                    schema: {
                        model: {
                            fields: {
                                IdMaestroParametroFabricacion: { type: "number" },
                                Descripcion: { type: "string" },
                                Unidad: { type: "string" },
                                IdMaestroParametroFabricacionTipoWO: { type: "number" } 
                            }
                        }
                    },
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdMaestroParametroFabricacion",
                    template: "#: Descripcion # (#: Unidad #)",
                    valueTemplate: "#: Descripcion # (#: Unidad #)",
                    optionLabel: window.app.idioma.t('SELECCIONAR')
                });

                $("#ntxtValor").kendoNumericTextBox({ format: "n2", decimals: 2, min: 0, spinners: false });

                $("#btnAceptar").kendoButton({
                    click: function () { self.guardar(); }
                });

                $("#btnCancelar").kendoButton({
                    click: function () { self.cancelar(); }
                });
            },
            rellenarDatos: function () {
                var self = this;

                $('#txtUnidad').val(self.row.Unidad);
                $("#ntxtValor").data("kendoNumericTextBox").value(self.row.Valor); 
                $("#cmbMaterial").data("kendoDropDownList").value(self.row.IdMaterial);
                $("#cmbMaterial").data("kendoDropDownList").enable(true);
                $("#cmbEnumParametro").data("kendoDropDownList").value(self.row.IdMaestroParametroFabricacion);
                $("#cmbEnumParametro").data("kendoDropDownList").enable(true);
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

                // Obtener los valores de los campos
                var selectedItemEnumParam = $("#cmbEnumParametro").data("kendoDropDownList").value();
                var selectedMaterial = $("#cmbMaterial").data("kendoDropDownList").value();
                var valor = $("#ntxtValor").data("kendoNumericTextBox").value();

                // Validaciones
                if (!selectedItemEnumParam) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('CAMPO_REQUERIDO') + ' -> ' + window.app.idioma.t('PARAMETRO'), 4000);
                    return;
                }
                if (!selectedMaterial) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('CAMPO_REQUERIDO') + ' -> ' + window.app.idioma.t('MATERIAL'), 4000);
                    return;
                }
                if (valor === null || valor === "") {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('CAMPO_REQUERIDO') + ' -> ' + window.app.idioma.t('VALOR'), 4000);
                    return;
                }

                kendo.ui.progress($("#CrearEditarParametroFabricacion"), true);
                $("#trError").hide();

                var data = {
                    IdParametroFabricacionMaterial: self.accion === self.constOperaciones.Editar ? self.row.IdParametroFabricacionMaterial : 0,
                    IdMaestroParametroFabricacionTipoWO: $("#cmbEnumParametro").data("kendoDropDownList").dataItem().IdMaestroParametroFabricacionTipoWO,
                    IdMaterial: selectedMaterial,
                    IdMaestroParametroFabricacion: parseInt(selectedItemEnumParam, 10),
                    Valor: valor,
                    IdTipoWO: self.tipoWO
                };

                var type = self.accion === self.constOperaciones.Crear ? "POST" : "PUT";
                var url = self.accion === self.constOperaciones.Crear ? "../api/ParametrosFabricacion/CrearParametroFabricacion" : "../api/ParametrosFabricacion/ActualizarParametroFabricacion";


                var type = self.accion === self.constOperaciones.Crear ? "POST" : "PUT";
                var url = self.accion === self.constOperaciones.Crear ? "../api/ParametrosFabricacion/CrearParametroFabricacion" : "../api/ParametrosFabricacion/ActualizarParametroFabricacion";

                $.ajax({
                    data: JSON.stringify(data),
                    type: type,
                    async: false,
                    url: url,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        kendo.ui.progress($("#CrearEditarParametroFabricacion"), false);
                        if (res) {
                            self.window.close();
                            self.eliminar();
                            $("#divParam").data('kendoGrid').dataSource.read();

                            if (self.accion === self.constOperaciones.Crear)
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('AÑADIR_PARAMETRO_CORRECTO'), 3000);
                            else
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('EDITAR_PARAMETRO_CORRECTO'), 3000);
                        } else {
                            $("#trError").show();
                            $("#lblError").html(window.app.idioma.t('YA_EXISTE_PARAMETRO'));
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        kendo.ui.progress($("#CrearEditarParametroFabricacion"), false);
                        if (err.status == '403' && err.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            if (self.accion === self.constOperaciones.Crear)
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR') + ' ' + window.app.idioma.t('ANADIR') + ' ' + window.app.idioma.t('PARAMETRO'), 4000);
                            else
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR') + ' ' + window.app.idioma.t('EDITAR') + ' ' + window.app.idioma.t('PARAMETRO'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            eliminar: function () {
                this.remove();
            },
            obtenerNombreTipoWO: function (tipoOrden) {
                var info = definiciones.TipoWO();
                for (var nombre in info) {
                    if (info[nombre] === tipoOrden) {
                        return nombre;
                    }
                }
            }
        });

        return vistaCrearEditarParametroFabricacion;
    });