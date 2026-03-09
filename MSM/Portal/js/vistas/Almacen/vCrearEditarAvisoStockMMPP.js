define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/CrearEditarAvisoStockMMPP.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'definiciones'],
    function (_, Backbone, $, plantillaAviso, Not, VistaDlgConfirm, definiciones) {
        var vistaCrearEditarAvisoStockMMPP = Backbone.View.extend({
            tagName: 'div',
            id: 'divCrearEditarAvisoStockMMPP',
            window: null,
            accion: null,
            dsMateriales: null,
            dsUbicaciones: null,
            row: null,
            constOperaciones: definiciones.OperacionesCRUD(),
            template: _.template(plantillaAviso),
            initialize: function (accion, dsMateriales, dsUbicaciones) {
                var self = this;

                // Accion: 0 - Añadir, 1 - Editar
                self.accion = parseInt(accion);
                self.dsMateriales = dsMateriales;
                self.dsUbicaciones = dsUbicaciones;

                if (self.accion == self.constOperaciones.Editar) {
                    // Obtenemos la línea seleccionada del grid
                    var grid = $("#gridAvisosStockMMPP").data("kendoGrid");
                    self.row = grid.dataItem(grid.select());

                    if (self.row == null) {
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
                var tituloWindow = self.accion == self.constOperaciones.Crear ? window.app.idioma.t('ANADIR_AVISO_STOCK_MMPP') : window.app.idioma.t('EDITAR_AVISO_STOCK_MMPP');

                self.window = $(self.el).kendoWindow(
                    {
                        title: tituloWindow,
                        width: "795px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: [],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                self.dialog = $('#divCrearEditarAvisoStockMMPP').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                if (self.accion == self.constOperaciones.Editar) {
                    self.rellenarDatos();
                }
            },
            configurarControles: function () {
                var self = this;

                self.$("#cmbMaterial").kendoDropDownList({
                    dataSource: self.dsMateriales,
                    filter: "contains",
                    dataTextField: "DescripcionCompleta",
                    dataValueField: "IdMaterial",
                });

                self.$("#cmbUbicacion").kendoDropDownList({
                    template: '#:data.Nombre #' + '#: data.Descripcion != null ? " - " + data.Descripcion : "" #',
                    dataSource: self.dsUbicaciones,
                    filter: "contains",
                    dataTextField: "Nombre",
                    dataValueField: "IdUbicacion",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    filtering: function (ev) {
                        var filterValue = ev.filter != undefined ? ev.filter.value : "";
                        ev.preventDefault();

                        this.dataSource.filter({
                            logic: "or",
                            filters: [
                                {
                                    field: "Nombre",
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

                $("#ntxtCantidadNivelCritico, #ntxtCantidadNivelAviso").kendoNumericTextBox({
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2,
                    format: 'n2',
                    value: 0
                });

                $("#btnAceptarAviso").kendoButton({
                    click: function () { self.guardar(); }
                });

                $("#btnCancelarAviso").kendoButton({
                    click: function () { self.cancelar(); }
                });
            },
            rellenarDatos: function () {
                var self = this;

                $("#cmbMaterial").data("kendoDropDownList").value(self.row.IdMaterial);
                $("#cmbMaterial").data("kendoDropDownList").enable(false);
                $("#cmbUbicacion").data("kendoDropDownList").value(self.row.IdUbicacion);
                $("#cmbUbicacion").data("kendoDropDownList").enable(false);
                $('#txtDestinatariosNivelCritico').val(self.row.DestinatariosMailNivelCritico);
                $("#ntxtCantidadNivelCritico").data("kendoNumericTextBox").value(self.row.CantidadNivelCritico);
                $('#txtDestinatariosNivelAviso').val(self.row.DestinatariosMailNivelAviso);
                $("#ntxtCantidadNivelAviso").data("kendoNumericTextBox").value(self.row.CantidadNivelAviso);
                $('#txtTextoCuerpoCorreo').val(self.row.TextoCuerpoCorreo);
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

                kendo.ui.progress($("#CrearEditarAvisoStockMMPP"), true);
                $("#trError").hide();

                var idUbicacion = $("#cmbUbicacion").data("kendoDropDownList").value() == '' ? null : $("#cmbUbicacion").data("kendoDropDownList").value();
                var cantidadNivelCritico = $("#ntxtCantidadNivelCritico").data("kendoNumericTextBox").value() == null ? 0 : $("#ntxtCantidadNivelCritico").data("kendoNumericTextBox").value();
                var cantidadNivelAviso = $("#ntxtCantidadNivelAviso").data("kendoNumericTextBox").value() == null ? 0 : $("#ntxtCantidadNivelAviso").data("kendoNumericTextBox").value();

                if (cantidadNivelCritico > cantidadNivelAviso) {
                    $("#trError").show();
                    kendo.ui.progress($("#CrearEditarAvisoStockMMPP"), false);
                    return;
                }

                var data = {};
                data.IdAviso = self.accion == self.constOperaciones.Crear ? 0 : self.row.IdAviso;
                data.Semaforo = self.accion == self.constOperaciones.Crear ? "" : self.row.Semaforo;
                data.IdMaterial = self.accion == self.constOperaciones.Crear ? $("#cmbMaterial").data("kendoDropDownList").value() : self.row.IdMaterial;
                data.IdUbicacion = self.accion == self.constOperaciones.Crear ? idUbicacion : self.row.IdUbicacion;
                data.DestinatariosMailNivelCritico = $('#txtDestinatariosNivelCritico').val();
                data.CantidadNivelCritico = cantidadNivelCritico;
                data.DestinatariosMailNivelAviso = $('#txtDestinatariosNivelAviso').val();
                data.CantidadNivelAviso = cantidadNivelAviso;
                data.TextoCuerpoCorreo = $('#txtTextoCuerpoCorreo').val();

                var type = self.accion == self.constOperaciones.Crear ? "POST" : "PUT";
                var url = self.accion == self.constOperaciones.Crear ? "../api/AgregarAvisoStockMMPPFabricacion" : "../api/ModificarAvisoStockMMPPFabricacion";

                $.ajax({
                    data: JSON.stringify(data),
                    type: type,
                    async: false,
                    url: url,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        kendo.ui.progress($("#CrearEditarAvisoStockMMPP"), false);
                        if (res !== null) {
                            self.window.close();
                            self.eliminar();
                            $("#gridAvisosStockMMPP").data('kendoGrid').dataSource.read();

                            if (self.accion == self.constOperaciones.Crear)
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('AÑADIR_AVISO_STOCK_MMPP_CORRECTO'), 3000);
                            else
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('EDITAR_AVISO_STOCK_MMPP_CORRECTO'), 3000);
                        } else {
                            $("#trError").show();
                            $("#lblError").html(window.app.idioma.t('YA_EXISTE_AVISO_MATERIAL_UBICACION'));
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        kendo.ui.progress($("#CrearEditarAvisoStockMMPP"), false);
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            if (self.accion == self.constOperaciones.Crear)
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AÑADIR_AVISO_STOCK_MMPP'), 4000);
                            else
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EDITAR_AVISO_STOCK_MMPP'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearEditarAvisoStockMMPP;
    });