define(['underscore', 'backbone', 'jquery', 'text!../../../Alt/html/EditarCrearAnalitica.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm',
        '../../../../Portal/js/constantes'],
    function (_, Backbone, $, plantillaAnalitica, Not, VistaDlgConfirm, definiciones) {
        var vistaEditarCrearAnalitica = Backbone.View.extend({
            tagName: 'div',
            id: 'divEditarCrearAnalitica',
            window: null,
            accion: null,
            row: null,
            lineas: 0,
            listaLlenadoras: null,
            constantes: definiciones.OperacionesCRUD(),
            template: _.template(plantillaAnalitica),
            initialize: function (accion) {
                var self = this;

                // Accion: 0 - Añadir, 1 - Editar
                self.accion = parseInt(accion);

                if (self.accion == self.constantes.Editar) {
                    // Obtenemos la línea seleccionada del grid
                    var grid = $("#gridAnaliticasO2").data("kendoGrid");
                    self.row = grid.dataItem(grid.select());

                    if (self.row == null) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                        return;
                    }
                }

                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                self.ConfigurarControles();
                var tituloWindow = self.accion == self.constantes.Crear ? window.app.idioma.t('AÑADIR_ANALITICA') : window.app.idioma.t('EDITAR_ANALITICA');
                
                self.window = $(self.el).kendoWindow(
                    {
                        title: tituloWindow,
                        width: "1280px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: [],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                self.dialog = $('#divEditarCrearAnalitica').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                if (self.accion == self.constantes.Editar) {
                    self.RellenarDatos();
                }
            },
            ConfigurarControles: function () {
                var self = this;

                var datasourceLineas = [];
                for (i = 0; i < window.app.planta.lineas.length; i++) {
                    // En Alovera se considera la línea 11 como única, no hay 11A y 11B
                    if (window.app.planta.lineas[i].numLinea == 12) {
                        continue;
                    }

                    var dataLineas = {};
                    dataLineas.id = window.app.planta.lineas[i].id;
                    dataLineas.descripcion = window.app.planta.lineas[i].descripcion;
                    dataLineas.numLinea = window.app.planta.lineas[i].numLinea;
                    dataLineas.numLineaDescripcion = window.app.planta.lineas[i].numLineaDescripcion.replace('A', '');
                    datasourceLineas.push(dataLineas);
                }

                self.$("#cmbLinea").kendoDropDownList({
                    dataValueField: "id",
                    template: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                    valueTemplate: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                    dataSource: new kendo.data.DataSource({
                        data: datasourceLineas,
                        sort: { field: "nombre", dir: "asc" }
                    }),
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        var id = dataItem.id ? dataItem.id : "0";

                        var cmbLlenadora = self.$("#cmbLlenadora").data("kendoDropDownList");

                        if (id == "0") {
                            cmbLlenadora.dataSource.data([]);
                            cmbLlenadora.text("");
                            cmbLlenadora.value("");
                            cmbLlenadora.enable(false);
                        } else {
                            for (i = 0; i < window.app.planta.lineas.length; i++) {
                                if (window.app.planta.lineas[i].id == id) {
                                    self.lineas = window.app.planta.lineas[i].numLinea;
                                }
                            }

                            $.ajax({
                                url: "../api/obtenerLlenadoras/" + self.lineas + "/",
                                dataType: 'json',
                                async: false
                            }).done(function (data) {
                                self.listaLlenadoras = data;
                            }).fail(function (e) {
                                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                }
                            });

                            if (self.listaLlenadoras.length === 1) {
                                self.listaLlenadoras[0].descripcion = 'LLENADORA 1';
                            } else {
                                for (var i = 0; i < self.listaLlenadoras.length; i++) {
                                    self.listaLlenadoras[i].descripcion = 'LLENADORA ' + self.listaLlenadoras[i].descripcion.slice(-1);
                                }
                            }

                            self.dsLlenadora = new kendo.data.DataSource({
                                data: self.listaLlenadoras,
                            });

                            cmbLlenadora.setDataSource(self.dsLlenadora);
                            cmbLlenadora.enable(true);
                        }
                    },
                    width: "100%",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                self.$("#cmbLlenadora").kendoDropDownList({
                    height: 450,
                    dataTextField: "descripcion",
                    dataValueField: "nombre",
                    enable: false
                });

                $("#dtpFecha").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                });

                $("#nVolumenEnvase").kendoNumericTextBox({
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 0,
                    format: 'n0',
                    value: 0
                });

                $("#nTCP, #nNumGrifo").kendoNumericTextBox({
                    min: 0,
                    max: 255,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 0,
                    format: 'n0',
                    value: 0
                });

                $(".decimales").kendoNumericTextBox({
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2,
                    format: 'n2',
                    value: 0
                });

                $(".decimalPresionVacio").kendoNumericTextBox({
                    min: -99,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 4,
                    format: 'n4',
                    value: 0
                });

                var dsUnidades = new kendo.data.DataSource({
                    transport: {
                        read: {
                            async: false,
                            url: "../api/ObtenerUnidadesAnalitica/",
                            dataType: "json"
                        }
                    }
                });

                $(".unidades").kendoDropDownList({
                    height: 450,
                    dataSource: dsUnidades,
                    dataTextField: "Nombre",
                    dataValueField: "Id",
                });

                if (self.accion == self.constantes.Crear) {
                    $("#cmbUnidadCO2").data("kendoDropDownList").value(2);
                    $("#cmbUnidadCO2_Ts").data("kendoDropDownList").value(2);
                    $("#cmbUnidadHSV").data("kendoDropDownList").value(3);
                    $("#cmbUnidadPresion").data("kendoDropDownList").value(4);
                    $("#cmbUnidadTemperatura").data("kendoDropDownList").value(5);
                    $("#cmbUnidadTemperatura_Ts").data("kendoDropDownList").value(5);
                    $("#cmbUnidadPresionVacio").data("kendoDropDownList").value(4);
                    $("#cmbUnidadPresionEspumado").data("kendoDropDownList").value(4);
                    $("#cmbUnidadPresionSoplado").data("kendoDropDownList").value(4);
                    $("#cmbUnidadConsumoGas").data("kendoDropDownList").value(6);
                }

                $("#btnAceptarAna").kendoButton({
                    click: function () { self.Confirmar(); }
                });

                $("#btnCancelarAna").kendoButton({
                    click: function () { self.Cancelar(); }
                });
            },
            RellenarDatos: function () {
                var self = this;

                var cmbLinea = $("#cmbLinea").data("kendoDropDownList");
                var numLinea = self.row.Linea.replace(/\s+/g, '').slice(5).split('-').shift();

                cmbLinea.select(function (dataItem) {
                    return dataItem.numLineaDescripcion === numLinea;
                });
                cmbLinea.trigger("select");

                var llenadora = 'LLENADORA ' + self.row.Llenadora
                $("#cmbLlenadora").data("kendoDropDownList").text(llenadora);

                $("#nVolumenEnvase").data("kendoNumericTextBox").value(self.row.VolumenEnvase);
                $('#txtIdMuestra').val(self.row.IdMuestra);
                $('#txtIdMuestra').prop("disabled", true);
                $("#dtpFecha").data("kendoDateTimePicker").value(self.row.Fecha);
                $('#txtComentario').val(self.row.Comentario);
                $("#nTCP").data("kendoNumericTextBox").value(self.row.TCP);
                $("#nO2_TCP").data("kendoNumericTextBox").value(self.row.O2_TCP);
                $("#nCO2_TCP").data("kendoNumericTextBox").value(self.row.CO2_TCP);
                $('#txtTipoMuestra').val(self.row.TipoMuestra);
                $("#nNumGrifo").data("kendoNumericTextBox").value(self.row.NumGrifo);
                $("#nTPO").data("kendoNumericTextBox").value(self.row.TPO);
                $("#cmbUnidadTPO").data("kendoDropDownList").text(self.row.UnidadTPO);
                $("#nHSO").data("kendoNumericTextBox").value(self.row.HSO);
                $("#cmbUnidadHSO").data("kendoDropDownList").text(self.row.UnidadHSO);
                $("#nDO").data("kendoNumericTextBox").value(self.row.DO);
                $("#cmbUnidadDO").data("kendoDropDownList").text(self.row.UnidadDO);
                $("#nCO2").data("kendoNumericTextBox").value(self.row.CO2);
                $("#cmbUnidadCO2").data("kendoDropDownList").text(self.row.UnidadCO2);
                $("#nCO2_Ts").data("kendoNumericTextBox").value(self.row.CO2_Ts);
                $("#cmbUnidadCO2_Ts").data("kendoDropDownList").text(self.row.UnidadCO2_Ts);
                $("#nHSV").data("kendoNumericTextBox").value(self.row.HSV);
                $("#cmbUnidadHSV").data("kendoDropDownList").text(self.row.UnidadHSV);
                $("#nPresion").data("kendoNumericTextBox").value(self.row.Presion);
                $("#cmbUnidadPresion").data("kendoDropDownList").text(self.row.UnidadPresion);
                $("#nTemperatura").data("kendoNumericTextBox").value(self.row.Temperatura);
                $("#cmbUnidadTemperatura").data("kendoDropDownList").text(self.row.UnidadTemperatura);
                $("#nTemperatura_Ts").data("kendoNumericTextBox").value(self.row.Temperatura_Ts);
                $("#cmbUnidadTemperatura_Ts").data("kendoDropDownList").text(self.row.UnidadTemperatura_Ts);
                $("#nPresionVacio").data("kendoNumericTextBox").value(self.row.PresionVacio);
                $("#cmbUnidadPresionVacio").data("kendoDropDownList").text(self.row.UnidadPresionVacio);
                $("#nPresionEspumado").data("kendoNumericTextBox").value(self.row.PresionEspumado);
                $("#cmbUnidadPresionEspumado").data("kendoDropDownList").text(self.row.UnidadPresionEspumado);
                $("#nPresionSoplado").data("kendoNumericTextBox").value(self.row.PresionSoplado);
                $("#cmbUnidadPresionSoplado").data("kendoDropDownList").text(self.row.UnidadPresionSoplado);
                $("#nConsumoGas").data("kendoNumericTextBox").value(self.row.ConsumoGas);
                $("#cmbUnidadConsumoGas").data("kendoDropDownList").text(self.row.UnidadConsumoGas);
            },
            events: {
            },
            Cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.window.close();
                this.eliminar();
            },
            Confirmar: function () {
                var self = this;
                var tituloWindow = self.accion == self.constantes.Crear ? window.app.idioma.t('AÑADIR_ANALITICA') : window.app.idioma.t('EDITAR_ANALITICA');
                var mensaje = self.accion == self.constantes.Crear ? window.app.idioma.t('CONFIRMACION_AÑADIR_ANALITICA') : window.app.idioma.t('CONFIRMACION_EDITAR_ANALITICA');

                var confirmacion = new VistaDlgConfirm({
                    titulo: tituloWindow,
                    msg: mensaje,
                    funcion: function () { self.GuardarAnalitica(); },
                    contexto: this
                });
            },
            GuardarAnalitica: function () {
                var self = this;

                var linea = $("#cmbLinea").data("kendoDropDownList").value();
                var llenadora = $("#cmbLlenadora").data("kendoDropDownList").value();
                var idMuestra = $('#txtIdMuestra').val();

                if (linea == '' || llenadora == '' || idMuestra == '') {
                    $("#lblError").show();
                    Backbone.trigger('eventCierraDialogo');
                    return;
                }

                kendo.ui.progress($("#EditarCrearAnalitica"), true);

                var data = {};
                data.Id = self.accion == self.constantes.Crear ? 0 : self.row.Id;
                data.Linea = $("#cmbLinea").data("kendoDropDownList").text();
                data.VolumenEnvase = $("#nVolumenEnvase").data("kendoNumericTextBox").value();

                var cmbLlenadora = $("#cmbLlenadora").data("kendoDropDownList").text();
                //var hasNumber = /\d/.test(cmbLlenadora);
                data.Llenadora = cmbLlenadora.slice(-1);

                data.IdMuestra = idMuestra;
                data.Fecha = $("#dtpFecha").data("kendoDateTimePicker").value();
                data.Comentario = $('#txtComentario').val();
                data.TCP = $("#nTCP").data("kendoNumericTextBox").value();
                data.O2_TCP = $("#nO2_TCP").data("kendoNumericTextBox").value();
                data.CO2_TCP = $("#nCO2_TCP").data("kendoNumericTextBox").value();
                data.TipoMuestra = $('#txtTipoMuestra').val();
                data.NumGrifo = $("#nNumGrifo").data("kendoNumericTextBox").value();
                data.TPO = $("#nTPO").data("kendoNumericTextBox").value();
                data.UnidadTPO = $("#cmbUnidadTPO").data("kendoDropDownList").text();
                data.HSO = $("#nHSO").data("kendoNumericTextBox").value();
                data.UnidadHSO = $("#cmbUnidadHSO").data("kendoDropDownList").text();
                data.DO = $("#nDO").data("kendoNumericTextBox").value();
                data.UnidadDO = $("#cmbUnidadDO").data("kendoDropDownList").text();
                data.CO2 = $("#nCO2").data("kendoNumericTextBox").value();
                data.UnidadCO2 = $("#cmbUnidadCO2").data("kendoDropDownList").text();
                data.CO2_Ts = $("#nCO2_Ts").data("kendoNumericTextBox").value();
                data.UnidadCO2_Ts = $("#cmbUnidadCO2_Ts").data("kendoDropDownList").text();
                data.HSV = $("#nHSV").data("kendoNumericTextBox").value();
                data.UnidadHSV = $("#cmbUnidadHSV").data("kendoDropDownList").text();
                data.Presion = $("#nPresion").data("kendoNumericTextBox").value();
                data.UnidadPresion = $("#cmbUnidadPresion").data("kendoDropDownList").text();
                data.Temperatura = $("#nTemperatura").data("kendoNumericTextBox").value();
                data.UnidadTemperatura = $("#cmbUnidadTemperatura").data("kendoDropDownList").text();
                data.Temperatura_Ts = $("#nTemperatura_Ts").data("kendoNumericTextBox").value();
                data.UnidadTemperatura_Ts = $("#cmbUnidadTemperatura_Ts").data("kendoDropDownList").text();
                data.PresionVacio = $("#nPresionVacio").data("kendoNumericTextBox").value();
                data.UnidadPresionVacio = $("#cmbUnidadPresionVacio").data("kendoDropDownList").text();
                data.PresionEspumado = $("#nPresionEspumado").data("kendoNumericTextBox").value();
                data.UnidadPresionEspumado = $("#cmbUnidadPresionEspumado").data("kendoDropDownList").text();
                data.PresionSoplado = $("#nPresionSoplado").data("kendoNumericTextBox").value();
                data.UnidadPresionSoplado = $("#cmbUnidadPresionSoplado").data("kendoDropDownList").text();
                data.ConsumoGas = $("#nConsumoGas").data("kendoNumericTextBox").value();
                data.UnidadConsumoGas = $("#cmbUnidadConsumoGas").data("kendoDropDownList").text();

                if (self.accion == self.constantes.Crear) data.Fichero = 'Manual';

                $.ajax({
                    data: JSON.stringify(data),
                    type: "POST",
                    async: false,
                    url: "../api/GuardarAnaliticaO2",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        kendo.ui.progress($("#EditarCrearAnalitica"), false);
                        if (res == '') {
                            self.window.close();
                            self.eliminar();
                            $("#gridAnaliticasO2").data('kendoGrid').dataSource.read();

                            if (self.accion == self.constantes.Crear)
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('AÑADIR_ANALITICA_CORRECTA'), 3000);
                            else
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('EDITAR_ANALITICA_CORRECTA'), 3000);
                        } else {
                            if (self.accion == self.constantes.Crear)
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t(res), 4000);
                            else
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EDITAR_ANALITICA'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        kendo.ui.progress($("#EditarCrearAnalitica"), false);
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            if (self.accion == self.constantes.Crear)
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AÑADIR_ANALITICA'), 4000);
                            else
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EDITAR_ANALITICA'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaEditarCrearAnalitica;
    });