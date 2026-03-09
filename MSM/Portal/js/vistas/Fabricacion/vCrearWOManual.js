define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/crearWOManual.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'definiciones'],
    function (_, Backbone, $, plantillaDlgCrearWO, Not, VistaDlgConfirm, definiciones) {
        var VistaDlgCrarWO = Backbone.View.extend({
            tagName: 'div',
            id: 'dlgCrearWO',
            materiales: [],
            fechaInicio: new Date(),
            horafin: new Date((new Date()).getTime() + (3 * 3600 * 1000)),
            tipoOrden: null,
            numeroCoccion: null,
            destinationEquipments: null,
            tiposWO: definiciones.TipoWO(),
            validarNumeroMaximo: definiciones.ValidarNumeroCreacionManualWO(),
            template: _.template(plantillaDlgCrearWO),
            initialize: function (tipoOrden) {
                var self = this;
                self.tipoOrden = tipoOrden;
                this.render(self);
            },
            render: function (self) {
                var self = this;
                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerMaterialesCoccion",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.materiales = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                });

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());
                $('.error').hide();
                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();

                $("#lblNumero").text(window.app.idioma.t('NUMERO_DE') + " " + self.obtenerNombre(self, self.tipoOrden))
                $("#txtNumeroTipo").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    decimals: 0,
                    min: 1,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: 'n0',
                    value: 1
                });

                
                $("#dtpFechaInicio").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: self.fechaInicio
                });

               

                $("#dtpFechaInicio").data("kendoDateTimePicker").setOptions({
                    max: new Date(Date.parse(self.fechaInicio))
                });

                $("#dtpFechaFin").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: self.horafin
                });

                //// Cargamos los combos
                this.$("#cmbMaterial").kendoDropDownList({
                    dataValueField: "IdMosto",
                    valueTemplate: "#=IdMosto# - #=Descripcion#",
                    template: "#=IdMosto# - #=Descripcion#",
                    dataSource: new kendo.data.DataSource({
                        data: self.materiales,
                        sort: { field: "IdMosto", dir: "asc" }
                    }),
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
                            this.select(0);
                        }
                    }
                });

                 

                this.window = $(this.el).kendoWindow(
                    {
                        title: window.app.idioma.t('CREAR_WO_MANUAL_DE') + " " + self.obtenerNombre(self, self.tipoOrden),
                        width: 680,
                        top: "339",
                        left: "410",
                        height: "534",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: ["Close"],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

               
                this.dialog = $('#dlgCrearWO').data("kendoWindow");
                this.dialog.center();
                kendo.ui.progress($("#center-pane"), false);
            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar'
            },
            aceptar: function (e) {
                e.preventDefault();
                var self = this;
                $('.error').hide();
                var resValidacion = this.validarCampos(self);
                if (!resValidacion) {
                    Backbone.trigger('eventCierraDialogo');
                } else {
                    this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('CREAR_ORDEN_DE_COCCION'), msg: window.app.idioma.t('DESEA_REALMENTE_CREAR_ESTA'), funcion: function () { self.creaOrdenManual(self); }, contexto: this });

                }


            },
            validarCampos: function (self) {

                var nTipo = $("#txtNumeroTipo").data("kendoNumericTextBox").value();
                var inicio = $("#dtpFechaInicio").val() == "" ? "" : $("#dtpFechaInicio").data('kendoDateTimePicker').value();
                var fin = $("#dtpFechaFin").val() == "" ? "" : $("#dtpFechaFin").data('kendoDateTimePicker').value();
                var material = $("#cmbMaterial").data("kendoDropDownList").value();
                var sala = $("#cmbSala").data("kendoDropDownList").value();


                if (nTipo == "" && inicio == "" && fin == "" && material == "" && sala == "") {
                    $('#lblError').show();
                    $('#lblError').html(window.app.idioma.t('RELLENE_TODOS_CAMPOS'));
                    return false;
                }

                if ((inicio && inicio !== "")) {
                    if (inicio < new Date()) {
                        var respuesta = self.ValidarNumero(self, nTipo, inicio.getFullYear(), sala, self.tipoOrden);
                        if (respuesta) {
                            return false;
                        }
                    } else {
                        $('#lblErrorFechaInicio').show();
                        $('#lblErrorFechaInicio').html(window.app.idioma.t('ERROR_FECHA_INICIO_SUPERIOR_ACTUAL'));
                        return false;
                    }
                } else {
                    $('#lblErrorFechaInicio').show();
                    $('#lblErrorFechaInicio').html(window.app.idioma.t('SELECCIONE_FECHA'));
                    return false;
                }

                if (!(fin && fin !== "")) {
                    $('#lblErrorFechaFin').show();
                    $('#lblErrorFechaFin').html(window.app.idioma.t('SELECCIONE_FECHA_FIN'));
                    return false;
                }

                if (Date.parse(inicio) > Date.parse(fin)) {
                    $('#lblErrorFechaFin').show();
                    $('#lblErrorFechaFin').html(window.app.idioma.t('ERROR_FECHA_FIN_MENOR_INICIO'));
                    return false;
                }

                if (!(material && material !== "")) {
                    $('#lblErrorMaterial').show();
                    $('#lblErrorMaterial').html(window.app.idioma.t('SELECCIONE_MATERIAL'));
                    return false;
                }

                if (!(sala && sala !== "")) {
                    $('#lblErrorSala').show();
                    $('#lblErrorSala').html(window.app.idioma.t('SELECCIONAR_SALA'));
                    return false;
                }

                return true;

            },
            ValidarNumero: function (self, nTipo, fInicio, IdUbicacion, idTipo) {

                var result, mensaje = "";
                $.ajax({
                    type: "POST",
                    async: false,
                    url: "../api/OrdenesFab/ValidarNumeroCreacionWOManual/" + nTipo + "/" + fInicio + "/" + IdUbicacion + "/" +  idTipo,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {

                        switch (res) {
                            case self.validarNumeroMaximo.VALOR_MAXIMO:
                                mensaje = window.app.idioma.t('NUMERO_MAXIMO');
                                result = true;
                                break;
                            case self.validarNumeroMaximo.VALOR_EXISTENTE:
                                mensaje = window.app.idioma.t('ORDEN_COCCION_EXISTENTE');
                                result = true;
                                break;
                            case self.validarNumeroMaximo.ERROR:
                                mensaje = window.app.idioma.t('ERROR_QUERY');
                                result = true;
                                break;
                            case self.validarNumeroMaximo.VALOR_NO_EXISTENTE:
                                $('#lblErrorNumero').hide();
                                result = false;
                                break;
                        }
                        if (mensaje !== "") {
                            $('#lblErrorNumero').show();
                            $('#lblErrorNumero').html(mensaje)
                        }
                    },
                    error: function (response) {
                        $("#lblError").show();
                        $("#lblError").html(response.responseJSON.ExceptionMessage);
                        result = true;
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
                return result;
            },
            creaOrdenManual: function (self) {

                var self = this;

                var NumeroOrden = $("#txtNumeroTipo").data("kendoNumericTextBox").value();
                var FechaInicio = $("#dtpFechaInicio").data("kendoDateTimePicker").value();
                var FechaFin = $("#dtpFechaFin").data("kendoDateTimePicker").value();
                var Material = $("#cmbMaterial").data("kendoDropDownList").value();
                var Sala = $("#cmbSala").data("kendoDropDownList").value();
                var Nota = $("#auxEditor").val();

                var wo = {
                    NumeroOrden: NumeroOrden,
                    Inicio: FechaInicio,
                    Fin: FechaFin,
                    Material: Material,
                    Sala: Sala,
                    Anio: FechaInicio.getFullYear(),
                    Tipo: self.tipoOrden,
                    Nota: Nota
                };

                Date.prototype.toJSON = function () { return moment(this).format(); };

                $.ajax({
                    data: JSON.stringify(wo),
                    type: "POST",
                    async: true,
                    url: "../api/OrdenesFab/CrearWOManual",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        Backbone.trigger('eventCierraDialogo');
                        kendo.ui.progress($("#gridListadoWO"), false);
                        if (res) {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_CREADO_CORRECTAMENTE'), 4000);
                            self.cancelar();
                            Backbone.trigger('eventCierraDialogo');
                            $("#lblError").show();
                            $("#gridGestionWOActivas").data('kendoGrid').dataSource.read();
                        }
                        else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CREAR_LA'), 4000);

                    },
                    error: function (response) {
                        $("#lblError").show();
                        $("#lblError").html(response.responseJSON.ExceptionMessage);
                        Backbone.trigger('eventCierraDialogo');
                    }
                });

            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
            },
            eliminar: function () {
                this.remove();
            },
            obtenerNombre: function (self, id) {
                switch (id) {
                    case self.tiposWO.Coccion:
                        return window.app.idioma.t('COCCION')
                    case self.tiposWO.Fermentacion:
                        return window.app.idioma.t('FERMENTACION');
                    case self.tiposWO.Trasiego:
                        return window.app.idioma.t('TRASIEGO');
                    case self.tiposWO.Guarda:
                        return window.app.idioma.t('GUARDA');
                    case self.tiposWO.Filtracion:
                        return window.app.idioma.t('FILTRACION');
                    case self.tiposWO.Prellenado:
                        return window.app.idioma.t('PRELLENADO');
                    default:
                        return "";
                }
            },
        });
        return VistaDlgCrarWO;
    });

