define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/CrearEditarWO.html', 'compartido/notificaciones'],
    function (_, Backbone, $, plantillaDlgCrearEditarWO, Not) {
        var VistaDlgCrearEditarWO = Backbone.View.extend({
            tagName: 'div',
            id: 'dlgCrearEditarWO',
            relacionEnvasesCajasPalets: {},
            template: _.template(plantillaDlgCrearEditarWO),
            data: null,
            requestCalculoFechaFin: null,
            initialize: function (options) {
                let self = this;

                // Si vienen datos es una edición
                if (options != null && options.data != null) {
                    self.data = options.data;
                }

                this.render();

            },
            render: function () {
                let self = this;
                let data = self.data;
                let esCrear = data == null;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();


                $("#dtpFechaInicio").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: esCrear ? new Date() : new Date(data.dFecInicioEstimadoLocal),
                    change: function (e) {
                        self.calcularFechaFin();
                    }
                });

                $("#dtpFechaFinalizado").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: esCrear ? new Date() : new Date(data.dFecFinEstimadoLocal)
                });

                this.cmbLineas = $("#cmbLinea").kendoDropDownList({
                    template: window.app.idioma.t("LINEA") + " #= numLineaDescripcion # - #=descripcion #",
                    valueTemplate: window.app.idioma.t("LINEA") + " #= numLineaDescripcion # - #=descripcion #",
                    dataValueField: "id",
                    dataSource: window.app.planta.lineas,
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    enable: esCrear,
                    change: function (e) {
                        self.cambiaLinea(e, data);
                    }
                });         

                $("#cmbProducto").kendoDropDownList({
                    template: "#=codigo # - #= nombre # - #=tipoProducto.nombre #",
                    valueTemplate: "#=codigo # - #= nombre # - #=tipoProducto.nombre #",
                    dataValueField: "codigo",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    enable: esCrear,
                    change: function (e) {
                        self.cambiaProducto(e);
                    }
                });

                $("#cmbEstado").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: [{ id: "CREADA", nombre: "Creada" }, { id: "PLANIFICADA", nombre: "Planificada" }],
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    enable: esCrear
                });

                $("#txtCantidad").kendoNumericTextBox({
                    spinners: false, decimals: 0, culture: localStorage.getItem("idiomaSeleccionado"), format: "n0", min: 0, value: esCrear ? null : data.cantPlanificada
                });

                if (!esCrear) {
                    let estado = data.estadoActual.nombre.toUpperCase();
                    $("#cmbEstado").getKendoDropDownList().value(estado);
                    if (estado == 'PLANIFICADA') {
                        $("#rowFechas").show();
                        $("#spAviso").show();
                    }
                    let nota = data.descripcion;

                    if (nota) {
                        $("#txtDescripcion").val(nota);
                    }
                    let linea = window.app.planta.lineas.filter(p => p.numLinea == data.numLinea);
                    if (linea != null && linea.length > 0) {
                        let lineasDDL = $("#cmbLinea").getKendoDropDownList()
                        lineasDDL.value(linea[0].id);
                        lineasDDL.trigger("change");
                    }
                }

                $("#CrearEditarWO").kendoValidator({
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

                this.dialog = $(this.el).kendoWindow(
                    {
                        title: esCrear ? window.app.idioma.t('CREAR_WO') : window.app.idioma.t('EDITAR_WO'),
                        width: "1024px",
                        height: "420px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        scrollable: false,
                        actions: []
                    }).data("kendoWindow");

                this.dialog.center();
            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
                'change #cmbEstado': 'cambiaEstado',
                'change #txtCantidad': 'cambiaCantidad',
                //'change #dtpFechaInicio': 'calcularFechaFin',
            },
            cambiaEstado: function () {
                let self = this;

                if ($("#cmbEstado").data("kendoDropDownList").value() == "PLANIFICADA") {
                    $("#rowFechas").show();
                    $("#spAviso").show();
                    self.calcularFechaFin();
                } else {
                    $("#rowFechas").hide();
                    $("#spAviso").hide();
                }
            },
            cambiaLinea: function (e, editData) {
                let self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerProductosLinea/" + e.sender.value() + "/",
                    dataType: 'json',
                    cache: false
                }).success(function (data) {
                    let kdd = $("#cmbProducto").data("kendoDropDownList");
                    kdd.dataSource.data(data);
                    if (editData != null) {
                        kdd.value(editData.producto.codigo)
                        kdd.trigger("change");
                    }
                }).error(function (err, msg, ex) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_PRODUCTOS_LINEA') + ':' + ex, 4000);
                    }
                });
            },
            cambiaProducto: function (e) {
                var self = this;
                var opcSel = $("#cmbProducto").data("kendoDropDownList").dataItem();
                $("#udMedida").html(window.app.idioma.t(opcSel.udMedida));

                if (self.data == null) {
                    self.calcularFechaFin();
                }                

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerRelacionEnvasesCajasPalets/" + opcSel.codigo + "/",
                    dataType: 'json',
                    cache: false
                }).success(function (data) {
                    self.relacionEnvasesCajasPalets = data;
                    self.cambiaCantidad(false);
                }).error(function (err, msg, ex) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_RELACION_ENVASES_CAJAS_PALETS'), 4000);
                    }
                })
            },
            cambiaCantidad: function (recalcularFechaFin = true) {
                var self = this;
                var cantidad = parseInt($("#txtCantidad").val(), 10);

                if (recalcularFechaFin) {
                    self.calcularFechaFin();
                }

                if (self.relacionEnvasesCajasPalets && cantidad > 0) {
                    //if (self.relacionEnvasesCajasPalets.ContenedoresPorEmbalaje == 0) { //Son barriles
                    if (self.relacionEnvasesCajasPalets.UOM === 'BR') { //Son barriles
                        $("#relacionEnvasesCajasPalets").html("Envases:" + cantidad * self.relacionEnvasesCajasPalets.EnvasesPorPalet);// + ", Cajas:" + cantidad * self.relacionEnvasesCajasPalets.ContenedoresPorPalet);
                    } else {
                        $("#relacionEnvasesCajasPalets").html("Envases:" + cantidad * self.relacionEnvasesCajasPalets.EnvasesPorPalet + ", Cajas/Packs:" + cantidad * self.relacionEnvasesCajasPalets.CajasPorPalet);
                    }
                } else {
                    $("#relacionEnvasesCajasPalets").html("");
                }
            },
            calcularFechaFin: function () {
                let self = this;
                //Comprobamos que tenemos los datos necesarios para el cálculo y que el estado es planificada

                let idLinea = $("#cmbLinea").getKendoDropDownList().value();
                let idProducto = $("#cmbProducto").getKendoDropDownList().value();
                let cantidad = parseInt($("#txtCantidad").val(), 10);
                let fechaInicio = $("#dtpFechaInicio").getKendoDateTimePicker().value();
                
                if ($("#cmbEstado").getKendoDropDownList().value() == "PLANIFICADA" &&
                    idLinea != "" &&
                    idProducto != "" &&
                    !isNaN(cantidad) &&
                    fechaInicio != null) {
                    let data = {
                        idLinea,
                        idProducto,
                        cantidad,
                        fechaInicio: fechaInicio.toISOString()
                    }

                    $("#fechaFinProgress").show();

                    if (self.requestCalculoFechaFin != null) {
                        self.requestCalculoFechaFin.abort();
                    }

                    self.requestCalculoFechaFin = $.ajax({
                        data: data,
                        type: "GET",
                        url: "../api/ordenes/calcularFechaFin",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        complete: function (e) {
                            if (e.statusText == "abort") {
                                return;
                            }
                            $("#fechaFinProgress").hide();
                        },
                        success: function (res) {

                            let fechaFin = new Date(res);
                            $("#dtpFechaFinalizado").getKendoDateTimePicker().value(fechaFin);
                        },
                        error: function (err) {
                            if (err.statusText == "abort") {
                                return;
                            }
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CALCULANDO_FIN_WO'), 4000);
                            }
                        }
                    });
                }
            },
            aceptar: function (e) {
                e.preventDefault();
                let self = this;
                let esCrear = self.data == null;

                if (self.requestCalculoFechaFin && self.requestCalculoFechaFin.readyState < 4) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('RECALCULANDO_FECHA_FIN_WO'), 4000);
                    return;
                }

                if ($("#CrearEditarWO").data("kendoValidator").validate()) {
                    let wo = {};

                    if (esCrear) {
                        // Crear WO
                        wo.descripcion = self.$("#txtDescripcion").val();
                        wo.fechaInicio = self.$("#dtpFechaInicio").data("kendoDateTimePicker").value();
                        wo.fechaFin = self.$("#dtpFechaFinalizado").data("kendoDateTimePicker").value();
                        wo.cantidad = parseInt($("#txtCantidad").val(), 10);
                        wo.linea = $("#cmbLinea").data("kendoDropDownList").value();
                        let opcSel = $("#cmbProducto").data("kendoDropDownList").dataItem();
                        wo.producto = opcSel;
                        wo.estado = $("#cmbEstado").data("kendoDropDownList").value();

                        // Cambio para que el estado se envie sólo con la primera letra en mayúsculas
                        wo.estado = wo.estado.charAt(0).toUpperCase() + wo.estado.slice(1).toLowerCase();
                    }
                    else
                    {
                        // Editar WO
                        wo.descripcion = self.$("#txtDescripcion").val();
                        wo.dFecInicioEstimado = self.$("#dtpFechaInicio").data("kendoDateTimePicker").value();
                        wo.dFecFinEstimado = self.$("#dtpFechaFinalizado").data("kendoDateTimePicker").value();
                        wo.cantPlanificada = parseInt($("#txtCantidad").val(), 10);
                        wo.id = self.data.id;
                    }                    

                    kendo.ui.progress($(".k-window"), true);

                    $.ajax({
                        data: JSON.stringify(wo),
                        type: esCrear ? "POST" : "PUT",
                        url: esCrear ? "../api/ordenes/crearWoManual" : "../api/ordenes/planificadas",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        complete: function () {
                            kendo.ui.progress($(".k-window"), false);
                        },
                        success: function (res) {
                            if (esCrear) {
                                if (res[0]) {
                                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_CREADO') + res[1], 4000);
                                    self.cancelar(e);
                                } else {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CREAR_LA'), 4000);
                                }
                            } else {
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('EDITADA_ORDEN_CORRECTAMENTE'), 4000);
                                self.cancelar(e);
                            }
                            
                        },
                        error: function (err) {
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                if (esCrear) {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CREAR_LA'), 4000);
                                } else {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), err.responseJSON.Message, 4000);
                                }                                
                            }
                        }
                    });
                } else {
                    // Si se quiere mostrar todos los errores de validacion este seria el sitio
                    //var errors = self.validador.errors();
                }
            },
            cancelar: function (e) {
                let self = this;

                if (e) {
                    e.preventDefault();
                }
                self.dialog.bind("deactivate", function (e) { self.eliminar() });
                self.dialog.close();
                //this.eliminar();
            },
            eliminar: function () {
                let self = this;
                // same as this.$el.remove();
                $(".k-window").remove();
                self.remove();

                // unbind events that are
                // set on this view
                self.off();

                // remove all models bindings
                // made by this view
                if (self.model && self.model.off) { self.model.off(null, null, self); }
            }
        });

        return VistaDlgCrearEditarWO;
    });