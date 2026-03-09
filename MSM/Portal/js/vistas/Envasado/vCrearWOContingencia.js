define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/crearWOContingencia.html', 'compartido/notificaciones'],
    function (_, Backbone, $, plantillaDlgCrearWO, Not) {
        var VistaDlgCrarWO = Backbone.View.extend({
            tagName: 'div',
            id: 'dlgCrearWO',
            relacionEnvasesCajasPalets: {},
            template: _.template(plantillaDlgCrearWO),
            initialize: function () {
                this.render();
            },
            render: function () {
                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                this.$("#imgProcesando").hide();
                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();

                //Cargamos las fechas
                //$("#dtpFechaOrden").kendoDatePicker({
                //    format: "dd/MM/yyyy HH:mm:ss",
                //    culture: "es-ES",
                //    value: new Date()
                //});
                //$("#dtpFechaSolicitada").kendoDatePicker({
                //    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                //    culture: "es-ES",
                //    value: new Date()
                //});
                $("#dtpFechaInicio").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: new Date()
                });
                $("#dtpFechaFinalizado").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: new Date()
                });


                this.cmbLineas = $("#cmbLinea").kendoDropDownList({
                    //dataTextField: "nombre",
                    template: window.app.idioma.t("LINEA") + " #= numLineaDescripcion # - #=descripcion #",
                    valueTemplate: window.app.idioma.t("LINEA") + " #= numLineaDescripcion # - #=descripcion #",
                    dataValueField: "id",
                    dataSource: window.app.planta.lineas,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                // Cargamos los combos
                $("#cmbRuta").kendoDropDownList({
                    //dataTextField: "nombre",
                    //dataValueField: "id",
                    //dataSource: [{ id: 1, nombre: "Ruta 1" }, { id: 2, nombre: "Ruta 2" }, { id: 3, nombre: "Ruta 3" }, { id: 4, nombre: "Ruta 4" }],
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbProducto").kendoDropDownList({
                    //dataTextField: "nombre",
                    template: "#=codigo # - #= nombre # - #=tipoProducto.nombre #",
                    valueTemplate: "#=codigo # - #= nombre # - #=tipoProducto.nombre #",
                    dataValueField: "codigo",
                    //dataSource: window.app.productos,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#txtCantidad").kendoNumericTextBox({
                    spinners: false, decimals: 0, culture: localStorage.getItem("idiomaSeleccionado"), format: "n0", min: 0
                });


                $("#CrearWO").kendoValidator({
                    rules: {
                        checkCombo: function (input) {
                            if (input.data("kendoDropDownList")) {
                                return $.trim(input.val()) !== "" || input.data("kendoDropDownList").dataSource.total() == 0;
                            } else {
                                return true
                            }
                        },
                        checkCantidad: function (input) {
                            if (input.data("kendoNumericTextBox")) {
                                return input.data("kendoNumericTextBox").value() != 0;
                            } else {
                                return true;
                            }
                        },
                        checkFechas: function (input) {
                            if (input.data("kendoDateTimePicker")) {
                               if ($("#dtpFechaInicio").data("kendoDateTimePicker").value() &&
                                $("#dtpFechaFinalizado").data("kendoDateTimePicker").value()) {
                                    return $("#dtpFechaInicio").data("kendoDateTimePicker").value() <= $("#dtpFechaFinalizado").data("kendoDateTimePicker").value()
                                } 
                            } else {
                                return true;
                            }
                        }
                    },
                    messages: {
                        required: "campo obligatorio",
                        checkCombo: "debe seleccionar una opcion",
                        checkCantidad: "no es posible indicar el valor 0",
                        checkFechas: "La fecha de inicio debe ser anterior a la de fin"
                    }
                }).data("kendoValidator");


                $(this.el).kendoWindow(
                {
                    title: window.app.idioma.t('CREAR_WO_FINALIZADA'),
                    width: "1024px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    scrollable: false,
                    actions: []
                });

                this.dialog = $('#dlgCrearWO').data("kendoWindow");
                this.dialog.center();
            },
            events: {
                'change #cmbLinea': 'cambiaLinea',
                'change #cmbProducto': 'cambiaProducto',
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
                'change #txtCantidad': 'cambiaCantidad'
            },
            cambiaLinea: function (e) {
                var self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerProductosLinea/" + $(e.currentTarget).val() + "/",
                    dataType: 'json',
                    cache: false
                }).success(function (data) {

                    $("#cmbProducto").data("kendoDropDownList").dataSource.data(data);

                }).error(function (err, msg, ex) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_PRODUCTOS_LINEA') + ':' + ex, 2000);
                    }
                }).done(function () {

                    //$.ajax({
                    //    type: "GET",
                    //    url: "../api/ObtenerRutasLinea/" + $(e.currentTarget).val() + "/",
                    //    dataType: 'json',
                    //    cache: false
                    //}).success(function (data) {

                    //    $("#cmbRuta").data("kendoDropDownList").dataSource.data(data);

                    //}).error(function (err, msg, ex) {
                    //    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_RUTAS_LINEA') + ':' + ex, 2000);                    
                    //}).done(function () {


                    //});

                });

            },
            cambiaProducto: function (e) {
                var self = this;
                //var opcSel = $("#cmbProducto option:selected").val();
                var opcSel = $("#cmbProducto").data("kendoDropDownList").dataItem();
                $("#udMedida").html(window.app.idioma.t(opcSel.udMedida));

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerRelacionEnvasesCajasPalets/" + opcSel.codigo + "/",
                    dataType: 'json',
                    cache: false
                }).success(function (data) {
                    self.relacionEnvasesCajasPalets = data;
                    self.cambiaCantidad();
                }).error(function (err, msg, ex) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_RELACION_ENVASES_CAJAS_PALETS'), 2000);
                    }
                })

            },
            cambiaCantidad: function () {
                var self = this;
                var cantidad = parseInt($("#txtCantidad").val(), 10);

                if (self.relacionEnvasesCajasPalets && cantidad > 0) {
                    //if (self.relacionEnvasesCajasPalets.ContenedoresPorEmbalaje == 0) //Son barriles
                    if (self.relacionEnvasesCajasPalets.UOM === 'BR') { //Son barriles
                        $("#relacionEnvasesCajasPalets").html("Envases:" + cantidad * self.relacionEnvasesCajasPalets.EnvasesPorPalet);// + ", Cajas:" + cantidad * self.relacionEnvasesCajasPalets.ContenedoresPorPalet);
                    } else {
                        $("#relacionEnvasesCajasPalets").html("Envases:" + cantidad * self.relacionEnvasesCajasPalets.EnvasesPorPalet + ", Cajas/Packs:" + cantidad * self.relacionEnvasesCajasPalets.CajasPorPalet);
                    }
                } else {
                    $("#relacionEnvasesCajasPalets").html("");
                }

            },
            aceptar: function (e) {
                e.preventDefault();

                var self = this;



                if ($("#CrearWO").data("kendoValidator").validate()) {
                    self.$("#imgProcesando").show();
                    self.$("#divAceptar").hide();
                    var wo = {};
                    wo.descripcion = self.$("#txtDescripcion").val();
                    wo.linea = $("#cmbLinea").data("kendoDropDownList").value();
                    //var codProd = $("#cmbProducto option:selected").val();
                    var opcSel = $("#cmbProducto").data("kendoDropDownList").dataItem();
                    wo.producto = opcSel;
                    wo.fechaInicio = self.$("#dtpFechaInicio").data("kendoDateTimePicker").value();
                    wo.fechaFin = self.$("#dtpFechaFinalizado").data("kendoDateTimePicker").value();
                    wo.cantidad = parseInt($("#txtCantidad").val(), 10);

                    $.ajax({
                        data: JSON.stringify(wo),
                        type: "POST",
                        async: true,
                        url: "../api/ordenes/crearWoContingencia",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            if (res[0]) {
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_CREADO') + res[1], 2000);
                                $("#gridGestionWOActivas").data('kendoGrid').dataSource.read();
                                $("#gridGestionWOActivas").data('kendoGrid').refresh();
                                self.cancelar(e);
                            }
                            else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CREAR_LA'), 2000);
                                self.$("#imgProcesando").hide();
                                self.$("#divAceptar").show();
                            }
                        },
                        error: function (err) {
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CREAR_LA'), 2000);
                            }
                            self.$("#imgProcesando").hide();
                            self.$("#divAceptar").show();
                        }
                    });
                } else {
                    // Si se quiere mostrar todos los errores de validacion este seria el sitio
                    //var errors = self.validador.errors();

                }



            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
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
        return VistaDlgCrarWO;
    });