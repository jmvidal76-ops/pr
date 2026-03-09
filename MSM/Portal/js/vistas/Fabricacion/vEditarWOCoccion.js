define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/EditarWOCoccion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'definiciones'],
    function (_, Backbone, $, plantillaTransferencia, Not, VistaDlgConfirm, definiciones) {
        var vistaTransferencia = Backbone.View.extend({
            tagName: 'div',
            id: 'divTransferencia',
            tcps: null,
            materiales: null,
            lineaFiltracion: null,
            materiales: null,
            materialesCoccion: null,
            material: null,
            cantidad: null,
            destinationEquipments: null,
            destinationEquipment: null,
            fecha: null,
            idOrden: null,
            maximo: null,
            tiposWO: definiciones.TipoWOPlanificado(),
            template: _.template(plantillaTransferencia),
            ds: null,
            grid: null,
            salaCoccion: null,
            initialize: function (idOrden, material, cantidad, fecha, equipmentPK, salaCoccion) {
                var self = this;

                self.idOrden = idOrden;
                self.material = material;
                self.cantidad = cantidad;
                self.fecha = fecha;
                self.destinationEquipment = equipmentPK;
                self.salaCoccion = salaCoccion;

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerMaterialesCoccion",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.materialesCoccion = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });

                self.material = self.materialesCoccion.find(x => x.IdMosto == self.material)?.IdMosto;

                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                //// Cargamos los combos

                this.$("#cmbMaterialCoccion").kendoDropDownList({
                    dataValueField: "IdMosto",
                    valueTemplate: "#=IdMosto# - #=Descripcion#",
                    template: "#=IdMosto# - #=Descripcion#",
                    dataSource: new kendo.data.DataSource({
                        data: self.materialesCoccion,
                        sort: { field: "IdMosto", dir: "asc" }
                    }),
                    value: self.material,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                this.$("#cmbSala").kendoDropDownList({
                    dataValueField: "IdUbicacion",
                    dataTextField: "DescZona",
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/ObtenerSalasOrigenPorTipoOrden/" + self.tiposWO.Coccion,
                                dataType: "json"
                            }
                        },
                        sort: { field: "DescZona", dir: "asc" },
                        schema: {
                            model: {
                                id: "IdUbicacion",
                                fields: {
                                    'IdUbicacion': { type: "number" },
                                    'DescZona': { type: "string" },
                                }
                            }
                        },
                    },
                    dataBound: function (e) {
                        let data = this.dataSource.data();
                        if (data.length > 1) {
                            this.setOptions({
                                optionLabel: {
                                    IdUbicacion: 0,
                                    DescZona: window.app.idioma.t('SELECCIONE')
                                }
                            })
                        }
                        self.salaCoccion = data.find(x => x.DescZona == self.salaCoccion)?.IdUbicacion;
                        this.value(self.salaCoccion);
                    }
                });

                
                $("#destination").kendoDropDownList({
                    dataValueField: "IdUbicacion",
                    valueTemplate: "#=CodUbicacion# - #=DescUbicacion#",
                    template: "#=CodUbicacion# - #=DescUbicacion#",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#txtCantidad").kendoNumericTextBox({
                    spinners: true, decimals: 2, culture: "es-ES", format: "n2", min: 1, max: 99999
                });

                $("#lblFecha").kendoDateTimePicker({

                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });


                $("#txtCantidad").data("kendoNumericTextBox").value(self.cantidad);
                $("#lblFecha").data("kendoDateTimePicker").value(self.fecha);

                this.$("#btnEditarAux").kendoButton();
                this.$("#btnCancelar").kendoButton();

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerSalasDestinoCoccion",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.destinationEquipments = data;
                    var aux = new kendo.data.DataSource({
                        data: self.destinationEquipments,
                        sort: { field: "CodUbicacion", dir: "asc" }
                    });
                    self.destinationEquipment = self.destinationEquipments.find(x => x.CodUbicacion == self.destinationEquipment)?.IdUbicacion;

                    $("#destination").data("kendoDropDownList").setDataSource(aux);
                    $("#destination").data("kendoDropDownList").dataSource.read();
                    $("#destination").data("kendoDropDownList").value(self.destinationEquipment);
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });


                self.window = $(self.el).kendoWindow(
                    {
                        title: window.app.idioma.t('EDITAR'),
                        width: "700px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: ["Close"],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                self.dialog = $('#divTransferencia').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

            },
            events: {

                'click #btnCancelar': 'cancelar',
                'click #btnEditarAux': 'editar',
                'change #cmbMaterialCoccion': 'validarCombosMaterialSala',
                'change #cmbSala': 'validarCombosMaterialSala'
            },
            validarCombosMaterialSala: function () {
                var self = this;
                var material = $("#cmbMaterialCoccion").data("kendoDropDownList").value();
                var sala = $("#cmbSala").data("kendoDropDownList").dataSource.data().length > 1 ? $("#cmbSala").data("kendoDropDownList").select() : "";
                var mensaje = "";

                    if ((sala !== 0 || material !== "")) {
                        if (!(sala !== 0)) {
                            mensaje = 'SELECCIONAR_SALA';
                        }

                        if (!(material && material !== "")) {
                            mensaje = 'SELECCIONE_MATERIAL';
                        }

                        if (mensaje !== "") {
                            $("#lblError").show();
                            $("#lblError").html(window.app.idioma.t(mensaje));
                        } else {
                            if (self.material !== material && self.salaCoccion !== $("#cmbSala").data("kendoDropDownList").value()) {
                                self.obtenerCantidades();
                            } else {
                                $("#txtCantidad").data("kendoNumericTextBox").value(self.cantidad);
                            }
                            
                            $("#lblError").hide();
                        }
                    } else {
                        $("#lblError").hide();
                    }

            },
            obtenerCantidades: function () {
                $.ajax({
                    type: "POST",
                    url: "../api/GetHLCoccionByMaterial/" + $("#cmbMaterialCoccion").data("kendoDropDownList").value() + "/" + $("#cmbSala").data("kendoDropDownList").value(),
                    dataType: 'json',
                    cache: false,
                    async: true
                }).done(function (data) {
                    $("#txtCantidad").data("kendoNumericTextBox").value("")
                    $("#txtCantidad").data("kendoNumericTextBox").value(data);
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });
            },
            eliminar: function () {
                this.remove();
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
                kendo.ui.progress($("#gridListadoCoccion"), false);
            },
            editar: function (e) {
                e.preventDefault();
                var self = this;
                var resValidacion = this.validarCampos();
                if (resValidacion != "") {
                    $("#lblError").show();
                    $("#lblError").html(window.app.idioma.t(resValidacion));
                    Backbone.trigger('eventCierraDialogo');
                } else {
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('EDITAR')
                        , msg: window.app.idioma.t('CONFIRMAR_EDITAR_ORDEN'), funcion: function () { self.editaFil(); }, contexto: this
                    });
                }
            },
            validarCampos: function () {

                var inicio = $("#lblFecha").data("kendoDateTimePicker").value();
                var material = $("#cmbMaterialCoccion").data("kendoDropDownList").value();
                var cantidad = $("#txtCantidad").data("kendoNumericTextBox").value();
                var sala = $("#cmbSala").data("kendoDropDownList").dataSource.data().length > 1 ? $("#cmbSala").data("kendoDropDownList").select() : "";

                if (cantidad == null && material == '' && (sala !== '' || sala == 0)) {
                    return 'RELLENE_TODOS_CAMPOS';
                }

                if (!(inicio && inicio !== "")) {
                    return 'SELECCIONE_FECHA';
                }

                if (!(material && material !== "")) {
                    return 'SELECCIONE_MATERIAL';
                }

                if (!(sala !== '' || sala == 0)) {
                    return 'SELECCIONAR_SALA';
                }

                if (!(cantidad && cantidad > 0)) {
                    return 'ERROR_CANTIDAD';
                }

                return "";

            },
            editaFil: function () {
                var self = this;
                kendo.ui.progress($("#gridListadoCoccion"), true);
                var idOrden = self.idOrden;
                var fecha = $("#lblFecha").data("kendoDateTimePicker").value();
                var material = $("#cmbMaterialCoccion").data("kendoDropDownList").value();
                var cantidad = $("#txtCantidad").data("kendoNumericTextBox").value();
                var destinationEquipment = $("#destination").data("kendoDropDownList").value()
                var salaCoccion = $("#cmbSala").data("kendoDropDownList").value();

                var datos = {
                    fecha: fecha,
                    material: material,
                    cantidad: cantidad,
                    idOrden: idOrden,
                    destinationEquipment: destinationEquipment,
                    SalaCoccion: salaCoccion
                };

                Date.prototype.toJSON = function () { return moment(this).format(); };

                $.ajax({
                    type: "POST",
                    url: "../api/editaWOFab/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    Backbone.trigger('eventCierraDialogo');
                    kendo.ui.progress($("#gridListadoCoccion"), false);
                    if (res.succeeded) {
                        self.window.close();
                        self.eliminar();
                        $("#gridListadoCoccion").data('kendoGrid').dataSource.read();
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ORDEN_EDITADA_CORRECTAMENTE'), 4000);
                    }
                    else if (res.succeeded == false && res.message == "No_Horas_Disp") {

                        this.confirmacionHoraDisp = new VistaDlgConfirm({
                            titulo: window.app.idioma.t('EDITAR')
                            , msg: window.app.idioma.t('SELECCIONE_FECHA_DISP') + " " + window.app.idioma.t('CONFIRMAR_EDITAR_ORDEN'), funcion: function () { self.actualizarHoraDisp(datos); }, contexto: this
                        });
                    }

                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EDITAR_ORDEN'), 4000);
                    kendo.ui.progress($("#gridListadoCoccion"), false);

                });

            },
            actualizarHoraDisp: function (datos) {
                var self = this;


                datos.ConfirmacionActualizarHoras = true;

                $.ajax({
                    type: "POST",
                    url: "../api/editaWOFab/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    Backbone.trigger('eventCierraDialogo');
                    kendo.ui.progress($("#gridListadoCoccion"), false);
                    if (res.succeeded) {
                        self.window.close();
                        $("#gridListadoCoccion").data('kendoGrid').dataSource.read();
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ORDEN_EDITADA_CORRECTAMENTE'), 4000);
                    }
                    else {

                        Backbone.trigger('eventCierraDialogo');
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EDITAR_ORDEN'), 4000);
                        kendo.ui.progress($("#gridListadoCoccion"), false);
                    }

                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EDITAR_ORDEN'), 4000);
                    kendo.ui.progress($("#gridListadoCoccion"), false);

                });

            }
        });
        return vistaTransferencia;
    });