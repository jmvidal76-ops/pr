define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/EditarWOTrasiego.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'definiciones'],
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
            Destino: null,
            fecha: null,
            idOrden: null,
            maximo: null,
            template: _.template(plantillaTransferencia),
            ds: null,
            grid: null,
            salaTrasiego: null,
            tanqueOrigen: null,
            tanqueDestino: null,
            gridListadoActual: null,
            estadoVerificarFecha: null,
            tiposWO: definiciones.TipoWOPlanificado(),
            estadoValido: definiciones.ValidarNumeroBooleano(),
            initialize: function (idOrden, material, cantidad, fecha, tkOrigen, tkDestino, salaTrasiego, gridActual) {
                var self = this;

                self.idOrden = idOrden;
                self.material = material;
                self.cantidad = cantidad;
                self.fecha = fecha;
                self.Origen = tkOrigen;
                self.Destino = tkDestino;
                self.salaTrasiego = salaTrasiego;
                self.gridListadoActual = gridActual;

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

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerSalasDestinoCoccion",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.tanques = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });

                self.material = self.materialesCoccion.find(x => x.IdMosto == self.material)?.IdMosto;
                self.tanqueOrigen = self.tanques.find(x => x.CodUbicacion == self.Origen)?.IdUbicacion;
                self.tanqueDestino = self.tanques.find(x => x.CodUbicacion == self.Destino)?.IdUbicacion;

                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                $("#lblZona").html(window.app.idioma.t('SALA_TRASIEGO'));
                $("#lblOrigen").html(window.app.idioma.t('TANQUE_ORIGEN'));
                $("#lblDestino").html(window.app.idioma.t('TANQUE_DESTINO'));
                $("#lblCantidad").html(window.app.idioma.t('CANTIDAD_TRASEGO'));

                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();



                this.$("#cmbMaterial").kendoDropDownList({
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
                                url: "../api/ObtenerSalasOrigenPorTipoOrden/" + self.tiposWO.Trasiego,
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
                        self.salaTrasiego = data.find(x => x.DescZona == self.salaTrasiego)?.IdUbicacion;
                        this.value(self.salaTrasiego);
                    }
                });
                
                this.$("#cmbOrigen").kendoDropDownList({
                    dataValueField: "IdUbicacion",
                    valueTemplate: "#=CodUbicacion# - #=DescUbicacion#",
                    template: "#=CodUbicacion# - #=DescUbicacion#",
                    dataSource: new kendo.data.DataSource({
                        data: self.tanques,
                        sort: { field: "IdUbicacion", dir: "asc" }
                    }),
                    value: self.tanqueOrigen,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbDestino").kendoDropDownList({
                    dataValueField: "IdUbicacion",
                    valueTemplate: "#=CodUbicacion# - #=DescUbicacion#",
                    template: "#=CodUbicacion# - #=DescUbicacion#",
                    dataSource: new kendo.data.DataSource({
                        data: self.tanques,
                        sort: { field: "IdUbicacion", dir: "asc" }
                    }),
                    value: self.tanqueDestino,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#dtpFechaInicio").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: self.fecha
                });

                $("#txtCantidad").kendoNumericTextBox({
                    spinners: true,
                    decimals: 2,
                    culture: "es-ES",
                    format: "n2",
                    min: 1,
                    max: 99999,
                    value: self.cantidad
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
                'click #btnAceptar': 'editar'
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
                kendo.ui.progress($(self.gridListadoActual), false);
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
                        , msg: window.app.idioma.t('CONFIRMAR_EDITAR_ORDEN'), funcion: function () { self.editarWO(); }, contexto: this
                    });
                }
            },
            validarCampos: function () {
                var self = this;

                var inicio = $("#dtpFechaInicio").data("kendoDateTimePicker").value();
                var material = $("#cmbMaterial").data("kendoDropDownList").value();
                var cantidad = $("#txtCantidad").data("kendoNumericTextBox").value();
                var sala = $("#cmbSala").data("kendoDropDownList").dataSource.data().length > 1 ? $("#cmbSala").data("kendoDropDownList").select() : "";
                var origen = $("#cmbOrigen").data("kendoDropDownList").value();
                var destino = $("#cmbDestino").data("kendoDropDownList").value();

                if (cantidad == null && material == '' && (sala !== '' || sala == 0) && origen == "" && destino == "") {
                    return 'RELLENE_TODOS_CAMPOS';
                }

                if (!(cantidad && cantidad > 0)) {
                    return 'ERROR_CANTIDAD';
                }
                if (!(sala !== '' || sala == 0)) {
                    return 'SELECCIONAR_SALA';
                }
                if (!(inicio && inicio !== "")) {
                    return 'SELECCIONE_FECHA';
                }
                self.verificarFecha();
                if (self.estadoVerificarFecha == self.estadoValido.VALOR_EXISTENTE) {
                    return 'RANGO_FECHAS_EXISTENTE';
                }
                if (!(material && material !== "")) {
                    return 'SELECCIONE_MATERIAL';
                }

                if (!(origen && origen !== "") || !(destino && destino !== "")) {
                    return 'ERROR_TANQUE';
                } else if (origen == destino) {
                    return 'SELECCIONE_TANQUE_DIFERENTE';
                }
                return "";

            },
            verificarFecha: function () {
                var self = this;
                var inicio = $("#dtpFechaInicio").data("kendoDateTimePicker").value();
                var sala = $("#cmbSala").data("kendoDropDownList").value();
                var wo = {
                    IdOrden: self.idOrden,
                    IdTipoOrden: self.tiposWO.Trasiego,
                    IdSala: sala,
                    FechaInicio: inicio
                };

                Date.prototype.toJSON = function () { return moment(this).format(); };

                $.ajax({
                    data: JSON.stringify(wo),
                    type: "POST",
                    async: false,
                    url: "../api/OrdenesFab/ValidarFechaNuevaOrdenPlanificadaPorIdOrden",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        self.estadoVerificarFecha = res;
                    },
                    error: function (response) {
                        Backbone.trigger('eventCierraDialogo');
                        self.estadoVerificarFecha = true;
                    }
                });
            },
            editarWO: function () {
                var self = this;
                kendo.ui.progress($(self.gridListadoActual), true);
                var inicio = $("#dtpFechaInicio").data("kendoDateTimePicker").value();
                var material = $("#cmbMaterial").data("kendoDropDownList").value();
                var cantidad = $("#txtCantidad").data("kendoNumericTextBox").value();
                var origen = $("#cmbOrigen").data("kendoDropDownList").value();
                var destino = $("#cmbDestino").data("kendoDropDownList").value();

                var wo = {
                    IdOrden: self.idOrden,
                    Material: material,
                    Inicio: inicio,
                    Cantidad: cantidad,
                    txtSalaUbicacion: $("#cmbSala").data("kendoDropDownList").text(),
                    IdSalaUbicacion: $("#cmbSala").data("kendoDropDownList").value(),
                    IdOrigen: origen,
                    IdDestino: destino,
                    IdTipoOrden: self.tiposWO.Trasiego
                };

                Date.prototype.toJSON = function () { return moment(this).format(); };

                $.ajax({
                    type: "POST",
                    url: "../api/OrdenesFab/EditarOrdenPlanificada",
                    dataType: 'json',
                    data: JSON.stringify(wo),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    Backbone.trigger('eventCierraDialogo');
                    kendo.ui.progress($(self.gridListadoActual), false);
                    if (res) {
                        self.window.close();
                        self.eliminar();
                        $(self.gridListadoActual).data('kendoGrid').dataSource.read();
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ORDEN_EDITADA_CORRECTAMENTE'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                    }
                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EDITAR_ORDEN'), 4000);
                    kendo.ui.progress($(self.gridListadoActual), false);

                });

            }
        });
        return vistaTransferencia;
    });