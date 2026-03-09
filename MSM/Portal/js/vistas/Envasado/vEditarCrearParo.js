define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/EditarCrearParo.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaCrearArranqueCambio, Not, VistaDlgConfirm) {
        var vistaCrearArranqueCambio = Backbone.View.extend({
            tagName: 'div',
            id: 'divEditarCrearParo',
            window: null,
            tipo: null,
            accion: null,
            row: null,
            aceptar: null,
            causas: null,
            minimoMayor: null,
            turno: null,
            lineas: 0,
            template: _.template(plantillaCrearArranqueCambio),
            callback: null,
            initialize: function (accion, e, callback) {
                var self = this;

                /*
                Accion
                 0 - Añadir
                 1 - Editar

                Tipo
                 1 - Paro Mayor
                 2 - Perdida Produccion
                */

                self.accion = parseInt(accion);
                self.tipo = 1;
                self.callback = callback;

                if (self.accion == 1) {
                    // Dabad 21/12/22: Ante la necesidad de editar un paro desde otro lugar que desde el grid en Paros Perdidas Llenadora, modifico esta parte para aceptar el propio paro como entrada
                    if (e.target == undefined) {
                        // No hemos mandado el elemento del grid, por lo que es el propio paro
                        // Hay que hacer algunos ajustes ya que los objetos del grid son algo distintos
                        e.DuracionSegundos = e.Duracion;
                        e.MotivoID = e.MotivoId;
                        e.CausaID = e.CausaId;
                        e.id = e.Id;
                        self.row = e;
                    }
                    else
                    {
                        //Obtenemos la línea seleccionada del grid
                        var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                        // get the data bound to the current table row
                        var dataRow = $("#gridSeleccionParosPerdidas").data("kendoGrid").dataItem(tr);

                        self.row = dataRow;
                    }

                    self.tipo = self.row.IdTipoParoPerdida;
                    console.log(self.row)
                }

                this.render();
                self.cambiaFecha();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template({ 'tipo': self.tipo }));

                self.$("#btnAnular").hide();

                self.aceptar = $("#btnAceptar").kendoButton({
                    click: function (e) { self.confirmarEdicion(e); }
                }).data("kendoButton");

                $("#btnCancelar").kendoButton({
                    click: function (e) { self.cancelarFormulario(e); }
                });

                $("#btnAnular").kendoButton({
                    click: function (e) { self.confirmarAnular(e); }
                });

                this.$("#cmbLineaParo").kendoDropDownList({
                    dataValueField: "id",
                    template: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                    valueTemplate: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "nombre", dir: "asc" }
                    }),
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        var id = dataItem.id ? dataItem.id : "0";

                        var cmbLlenadora = self.$("#cmbLlenadora").data("kendoDropDownList");
                        var cmbMaquinaResponsable = self.$("#cmbMaquinaResponsable").data("kendoDropDownList");
                        var cmbEquipoConstructivo = self.$("#cmbEquipoConstructivo").data("kendoDropDownList");
                        var cmbAveria = self.$("#cmbDescripcion").data("kendoDropDownList");
                        var maquinas = null;

                        if (id == "0") {
                            cmbLlenadora.dataSource.data([]);
                            cmbLlenadora.text("");
                            cmbLlenadora.value("");
                            cmbLlenadora.enable(false);

                            cmbMaquinaResponsable.text("");
                            cmbMaquinaResponsable.enable(false);

                            cmbEquipoConstructivo.text("");
                            cmbEquipoConstructivo.enable(false);

                            cmbAveria.text("");
                            cmbAveria.enable(false);
                        } else {
                            for (i = 0; i < window.app.planta.lineas.length; i++) {
                                if (window.app.planta.lineas[i].id == id) {
                                    self.lineas = window.app.planta.lineas[i].numLinea;
                                }
                            }

                            dsLlenadora.transport.options.read.url = "../api/obtenerLlenadoras/" + self.lineas + "/";
                            dsLlenadora.read();
                            cmbLlenadora.enable(true);

                            $.ajax({
                                url: "../api/MaquinasLinea/" + id + "/",
                                dataType: 'json',
                                async: false
                            }).done(function (listaMaquinas) {
                                maquinas = listaMaquinas;
                            }).fail(function (e) {
                                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_MAQUINAS'), 4000);
                                }
                            });

                            var dsMaquinas = new kendo.data.DataSource({
                                data: maquinas,
                            });

                            cmbMaquinaResponsable.setDataSource(dsMaquinas);
                            cmbMaquinaResponsable.enable(true);
                        }
                    },
                    change: function () {
                        self.cambiaFecha();
                    },
                    width: "100%",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#txtInicioReal").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHoraMin,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    change: function () {
                        self.cambiaFecha();
                    }
                });

                var dsLlenadora = new kendo.data.DataSource({
                    batch: true,
                    transport: {
                        read: {
                            url: "../api/obtenerLlenadoras/0/",
                            dataType: "json",
                            cache: false,
                        }
                    }
                });

                self.$("#cmbLlenadora").kendoDropDownList({
                    height: 450,
                    dataSource: dsLlenadora,
                    dataTextField: "descripcion",
                    dataValueField: "nombre",
                    enable: false,
                    dataBound: function (e) {
                        $("#cmbLlenadora").data("kendoDropDownList").select(0);
                        if (self.row) {
                            if (self.row.EquipoNombre && (self.accion === 1) && self.row.IdLinea == self.lineas) {
                                $("#cmbLlenadora").data("kendoDropDownList").value(self.row.EquipoNombre);
                            }
                        }
                    }
                    //optionLabel: window.app.idioma.t('SELECCIONE')
                });

                if (self.tipo == 1) {
                    $("#txtMayorHoras").kendoNumericTextBox({
                        spinners: false, decimals: 0, culture: localStorage.getItem("idiomaSeleccionado"), format: "n0", min: 0, max: 8, value: 0, format: "00"
                    });

                    $("#txtMayorMinutos").kendoNumericTextBox({
                        spinners: false, decimals: 0, culture: localStorage.getItem("idiomaSeleccionado"), format: "n0", min: 0, max: 59, value: 0, format: "00"
                    });

                    $("#txtMayorSegundos").kendoNumericTextBox({
                        spinners: false, decimals: 0, culture: localStorage.getItem("idiomaSeleccionado"), format: "n0", min: 0, max: 59, value: 0, format: "00"
                    });
                } else {
                    $("#txtNumParoMenor").kendoNumericTextBox({
                        spinners: true, decimals: 0, culture: localStorage.getItem("idiomaSeleccionado"), format: "n0", min: 0, max: 200, value: 0
                    });

                    $("#txtMenoresHoras").kendoNumericTextBox({
                        spinners: false, decimals: 0, culture: localStorage.getItem("idiomaSeleccionado"), format: "n0", min: 0, max: 1, value: 0, format: "00"
                    });

                    $("#txtMenoresMinutos").kendoNumericTextBox({
                        spinners: false, decimals: 0, culture: localStorage.getItem("idiomaSeleccionado"), format: "n0", min: 0, max: 59, value: 0, format: "00"
                    });

                    $("#txtMenoresSegundos").kendoNumericTextBox({
                        spinners: false, decimals: 0, culture: localStorage.getItem("idiomaSeleccionado"), format: "n0", min: 0, max: 59, value: 0, format: "00"
                    });

                    $("#txtBajaHoras").kendoNumericTextBox({
                        spinners: false, decimals: 0, culture: localStorage.getItem("idiomaSeleccionado"), format: "n0", min: 0, max: 1, value: 0, format: "00"
                    });

                    $("#txtBajaMinutos").kendoNumericTextBox({
                        spinners: false, decimals: 0, culture: localStorage.getItem("idiomaSeleccionado"), format: "n0", min: 0, max: 59, value: 0, format: "00"
                    });

                    $("#txtBajaSegundos").kendoNumericTextBox({
                        spinners: false, decimals: 0, culture: localStorage.getItem("idiomaSeleccionado"), format: "n0", min: 0, max: 59, value: 0, format: "00"
                    });
                }

                this.$("#cmbMotivo").kendoDropDownList({
                    height: 150,
                    dataTextField: "nombre",
                    dataValueField: "id",
                    change: function (e) {
                        $("#trError").hide();
                    },
                    dataSource: new kendo.data.DataSource({
                        data: window.app.reasonTree.Categorias[1].motivos,
                        sort: { field: "nombre", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                this.$("#cmbCausa").kendoDropDownList({
                    height: 450,
                    dataTextField: "nombre",
                    dataValueField: "id",
                    change: function (e) {
                        $("#trError").hide();
                    },
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                self.$("#cmbMaquinaResponsable").kendoDropDownList({
                    height: 450,
                    dataTextField: "Descripcion",
                    dataValueField: "CodigoMaquina",
                    enable: false,
                    select: function (e) {
                        $("#trError").hide();
                        var dataItem = this.dataItem(e.item);
                        var codigoMaquina = dataItem.Descripcion == 'Seleccione' ? "0" : dataItem.CodigoMaquina.trim();
                        var cmbEquipoConstructivo = self.$("#cmbEquipoConstructivo").data("kendoDropDownList");
                        var cmbAveria = self.$("#cmbDescripcion").data("kendoDropDownList");
                        var equipos = null;

                        if (codigoMaquina == "0") {
                            cmbEquipoConstructivo.text("");
                            cmbEquipoConstructivo.enable(false);

                            cmbAveria.text("");
                            cmbAveria.enable(false);
                        } else {
                            $.ajax({
                                url: "../api/EquiposConstructivosMaquina/" + codigoMaquina + "/",
                                dataType: 'json',
                                async: false
                            }).done(function (listaEquipos) {
                                equipos = listaEquipos;
                            }).fail(function (e) {
                                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_EQUIPOS_CONSTRUCTIVOS'), 4000);
                                }
                            });

                            var dsEquipos = new kendo.data.DataSource({
                                data: equipos,
                            });

                            cmbEquipoConstructivo.setDataSource(dsEquipos);
                            cmbEquipoConstructivo.enable(true);

                            cmbAveria.text("");
                        }
                    },
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                this.$("#cmbEquipoConstructivo").kendoDropDownList({
                    height: 450,
                    dataTextField: "Descripcion",
                    dataValueField: "CodigoEquipo",
                    enable: false,
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        var codigoEquipo = dataItem.Descripcion == 'Seleccione' ? "0" : dataItem.CodigoEquipo;
                        var cmbAveria = $("#cmbDescripcion").data("kendoDropDownList");
                        var averias = null;

                        if (codigoEquipo == "0") {
                            cmbAveria.text("");
                            cmbAveria.enable(false);
                        } else {
                            $.ajax({
                                url: "../api/AveriasEquipoConstructivo/" + codigoEquipo + "/",
                                dataType: 'json',
                                async: false
                            }).done(function (listaAverias) {
                                averias = listaAverias;
                            }).fail(function (e) {
                                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_POSIBLES'), 4000);
                                }
                            });

                            var dsAverias = new kendo.data.DataSource({
                                data: averias,
                            });

                            cmbAveria.setDataSource(dsAverias);
                            cmbAveria.enable(true);
                        }
                    },
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                this.$("#cmbDescripcion").kendoDropDownList({
                    height: 450,
                    enable: false,
                    dataTextField: "Descripcion",
                    dataValueField: "IdDescripcionAveria",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                if (self.accion === 0) {//Añadir
                    if (self.tipo === 1)//Paro Mayor
                    {
                        self.mensaje = window.app.idioma.t('PREGUNTA_CREAR_PARO_MAYOR');
                        self.tituloWindow = window.app.idioma.t('CREAR_PARO_MAYOR');
                    } else {
                        self.tituloWindow = window.app.idioma.t('CREAR_PERDIDA_PROD');
                        self.mensaje = window.app.idioma.t('PREGUNTA_CREAR_PERDIDA_PROD');
                    }
                } else {
                    if (self.tipo === 1)//Paro Mayor
                    {
                        self.mensaje = window.app.idioma.t('PREGUNTAR_EDITAR_PARO_MAYOR');
                        self.tituloWindow = window.app.idioma.t('EDITAR_PARO_MAYOR');
                    } else {
                        self.mensaje = window.app.idioma.t('PREGUNTA_EDITAR_PERDIDA_PROD');
                        self.tituloWindow = window.app.idioma.t('EDITAR_PERDIDA_PROD');
                    }
                }

                self.window = $(self.el).kendoWindow(
                    {
                        title: self.tituloWindow,
                        width: "550px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: [],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                self.dialog = $('#divEditarCrearParo').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                if (self.accion == 1) {
                    self.row.Justificado === 1 ? self.$("#btnAnular").show() : self.$("#btnAnular").hide();
                    $("#txtInicioReal").data("kendoDateTimePicker").value(self.row.InicioLocal);

                    for (i = 0; i < window.app.planta.lineas.length; i++) {
                        if (window.app.planta.lineas[i].numLinea == self.row.IdLinea) {
                            $("#cmbLineaParo").data("kendoDropDownList").select(i + 1);
                            $("#cmbLineaParo").data("kendoDropDownList").trigger("select");
                        }
                    }

                    if (self.row.MotivoID) {
                        $("#cmbMotivo").data("kendoDropDownList").value(self.row.MotivoID);
                    }

                    self.cambiaMotivo();

                    if (self.row.CausaID) {
                        $("#cmbCausa").data("kendoDropDownList").value(self.row.CausaID);
                    }

                    if (self.row.MaquinaCausaId) {
                        $("#cmbMaquinaResponsable").data("kendoDropDownList").value(self.row.MaquinaCausaId);
                        $("#cmbEquipoConstructivo").data("kendoDropDownList").enable(true);
                        $("#cmbMaquinaResponsable").data("kendoDropDownList").trigger("select");
                    }

                    if (self.row.EquipoConstructivoId) {
                        $("#cmbEquipoConstructivo").data("kendoDropDownList").value(self.row.EquipoConstructivoId);
                        $("#cmbDescripcion").data("kendoDropDownList").enable(true);
                        $("#cmbEquipoConstructivo").data("kendoDropDownList").trigger("select");
                    }

                    if (self.row.Descripcion) {
                        $("#cmbDescripcion").data("kendoDropDownList").text(self.row.Descripcion);
                    }

                    if (self.row.Observaciones !== "")
                        $("#txtObservaciones").val(self.row.Observaciones);

                    if (self.tipo == 2) {
                        $("#txtInicioReal").data("kendoDateTimePicker").enable(false);

                        if (self.row.DuracionMenores > 0) {
                            var tiempo = window.app.getDateFormat(self.row.DuracionMenores).split(':');
                            $("#txtMenoresHoras").data("kendoNumericTextBox").value(parseInt(tiempo[0]));
                            $("#txtMenoresMinutos").data("kendoNumericTextBox").value(parseInt(tiempo[1]));
                            $("#txtMenoresSegundos").data("kendoNumericTextBox").value(parseInt(tiempo[2]));
                        }

                        if (self.row.DuracionBajaVel > 0) {
                            tiempo = window.app.getDateFormat(self.row.DuracionBajaVel).split(':');
                            $("#txtBajaHoras").data("kendoNumericTextBox").value(parseInt(tiempo[0]));
                            $("#txtBajaMinutos").data("kendoNumericTextBox").value(parseInt(tiempo[1]));
                            $("#txtBajaSegundos").data("kendoNumericTextBox").value(parseInt(tiempo[2]));
                        }

                        tiempo = window.app.getDateFormat(self.row.DuracionBajaVel + self.row.DuracionMenores);
                        $("#txtDuracionTotalMenores").html(tiempo);

                        $("#txtNumParoMenor").data("kendoNumericTextBox").value(self.row.NumeroParoMenores);
                    } else {
                        if (self.row.DuracionSegundos > 0) {
                            var tiempo = window.app.getDateFormat(self.row.DuracionSegundos).split(':');
                            $("#txtMayorHoras").data("kendoNumericTextBox").value(parseInt(tiempo[0]));
                            $("#txtMayorMinutos").data("kendoNumericTextBox").value(parseInt(tiempo[1]));
                            $("#txtMayorSegundos").data("kendoNumericTextBox").value(parseInt(tiempo[2]));
                        }
                    }
                } else {
                    var diaAyer = new Date()
                    diaAyer.setDate(diaAyer.getDate() - 1);
                    $("#txtInicioReal").data("kendoDateTimePicker").value(diaAyer);
                }
            },
            events: {
                'change #txtInicioReal': 'cambiaFecha',
                'blur #txtMenoresHoras': 'sumaDuraciones',
                'blur #txtMenoresMinutos': 'sumaDuraciones',
                'blur #txtMenoresSegundos': 'sumaDuraciones',
                'blur #txtBajaHoras': 'sumaDuraciones',
                'blur #txtBajaMinutos': 'sumaDuraciones',
                'blur #txtBajaSegundos': 'sumaDuraciones',
                'change #cmbMotivo': 'cambiaMotivo',
                'blur #txtMayorHoras': 'compruebaDuracionMayor',
                'blur #txtMayorMinutos': 'compruebaDuracionMayor',
                'blur #txtMayorSegundos': 'compruebaDuracionMayor',
            },
            compruebaDuracionMayor: function () {
                var self = this;

                var horasMayor = $("#txtMayorHoras").data("kendoNumericTextBox").value();
                var minutorMayor = $("#txtMayorMinutos").data("kendoNumericTextBox").value();
                var segundosMayor = $("#txtMayorSegundos").data("kendoNumericTextBox").value();

                var tiempoTotal = parseInt(horasMayor * 3600) + parseInt(minutorMayor * 60) + parseInt(segundosMayor);
                var tiempoMinimo = self.minimoMayor * 60;

                if (tiempoMinimo > tiempoTotal) {
                    $("#trError").show();
                    $("#lblError").html(window.app.idioma.t("EL_MINIMO_DEL_PARO_MAYOR") + self.minimoMayor + " " + window.app.idioma.t("MINUTOS_PARO"));
                } else {
                    $("#trError").hide();
                }
            },
            cambiaMotivo: function () {
                var self = this;
                var cmbMotivo = $("#cmbMotivo").data("kendoDropDownList");
                var causas = null;

                if (cmbMotivo.value() === '') {
                    $("#cmbCausa").data("kendoDropDownList").dataSource.data([]);
                    $("#cmbCausa").data("kendoDropDownList").text('');
                } else {
                    jQuery.each(window.app.reasonTree.Categorias[1].motivos, function (index, value) {
                        if (value.nombre == cmbMotivo.text()) {
                            causas = value.causas;
                        }
                    });
                }

                self.causas = causas;
                $("#cmbCausa").data("kendoDropDownList").setDataSource(self.causas);
            },
            sumaDuraciones: function () {
                var self = this;

                var horasMenores = $("#txtMenoresHoras").data("kendoNumericTextBox").value();
                var minutosMenores = $("#txtMenoresMinutos").data("kendoNumericTextBox").value();
                var segundosMenores = $("#txtMenoresSegundos").data("kendoNumericTextBox").value();

                var horasBaja = $("#txtBajaHoras").data("kendoNumericTextBox").value();
                var minutosBaja = $("#txtBajaMinutos").data("kendoNumericTextBox").value();
                var segundosBaja = $("#txtBajaSegundos").data("kendoNumericTextBox").value();

                var totalTiempo = 0;
                if (horasMenores !== "" || minutosMenores !== "" || segundosMenores !== "") {
                    totalTiempo += parseInt(horasMenores * 3600) + parseInt(minutosMenores * 60) + parseInt(segundosMenores);
                }

                if (horasBaja !== "" || minutosBaja !== "" || segundosBaja !== "") {
                    totalTiempo += parseInt(horasBaja * 3600) + parseInt(minutosBaja * 60) + parseInt(segundosBaja);
                }

                if (totalTiempo <= 3600) {
                    $("#txtDuracionTotalMenores").html(window.app.getDateFormat(totalTiempo));
                    $("#trError").hide();
                } else {
                    $("#trError").show();
                    $("#lblError").html(window.app.idioma.t('DURACION_MINIMA_PARO'));
                }
            },
            cambiaFecha: function () {
                var self = this;
                self.obtenerTurno();
            },
            obtieneMinimoParoMayor: function () {
                var self = this;
                var lineaId = $("#cmbLineaParo").data("kendoDropDownList").value();
                var lineas = 0;

                for (i = 0; i < window.app.planta.lineas.length; i++) {
                    if (window.app.planta.lineas[i].id == lineaId) {
                        lineas = window.app.planta.lineas[i].numLinea;
                    }
                }

                $.ajax({
                    type: "GET",
                    url: "../api/obtenerMinimoParoMayor/" + lineas,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).success(function (data) {
                    self.minimoMayor = data;
                }).error(function (err, msg, ex) {
                    var a = "";
                });
            },
            obtenerTurno: function () {
                var self = this;
                var lineaId = $("#cmbLineaParo").data("kendoDropDownList").value();
                var lineas = 0;

                for (i = 0; i < window.app.planta.lineas.length; i++) {
                    if (window.app.planta.lineas[i].id == lineaId) {
                        lineas = window.app.planta.lineas[i].numLinea;
                    }
                }

                var fecha = $("#txtInicioReal").data("kendoDateTimePicker").value().getTime() / 1000;

                $.ajax({
                    type: "GET",
                    url: "../api/obtenerTurnoSegunFecha/" + parseInt(fecha) + "/" + parseInt(lineas),
                    dataType: 'json',
                    cache: false,
                    async: false
                }).success(function (data) {
                    $("#txtTurno").html(data);

                    if (data == "Turno no encontrado") {
                        $("#trError").show();
                        $("#lblError").html(window.app.idioma.t('TURNO_NO_EXISTE'));
                        self.aceptar.enable(false);
                    } else {
                        self.turno = data;
                        self.aceptar.enable(true);
                        $("#trError").hide();
                    }
                }).error(function (err, msg, ex) {
                });
            },
            cancelarFormulario: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.window.close();
                this.eliminar();
            },
            confirmarEdicion: function (e) {
                e.preventDefault();
                var self = this;

                var linea = $("#cmbLineaParo").data("kendoDropDownList").value();
                var fecha = $("#txtInicioReal").data("kendoDateTimePicker").value();

                if (linea !== "" && fecha !== "") {
                    if (!self.validarMotivoCausa()) return;
                    if (!self.validarMaquina()) return;

                    if (self.tipo == 1) {//Paro Mayor
                        datosProc = self.datosParoPerdidaProduccion(self);

                        var tiempoTotal = parseInt(datosProc.duracionHoras * 3600) + parseInt(datosProc.duracionMinutos * 60) + parseInt(datosProc.duracionSegundos);
                        var tiempoMinimo = self.minimoMayor * 60;

                        if (tiempoMinimo > tiempoTotal) {
                            $("#trError").show();
                            $("#lblError").html(window.app.idioma.t("EL_MINIMO_DEL_PARO_MAYOR") + self.minimoMayor + " " + window.app.idioma.t("MINUTOS_PARO"));
                        } else {
                            if (self.accion == 1)
                                datosProc.id = self.row.id;
                        }
                    } else {
                        //Perdida de produccion
                        var datosProc = self.datosParoPerdidaProduccion(self);

                        if (self.accion == 1)
                            datosProc.id = self.row.id;

                        var totalTiempo = 0;
                        if (datosProc.duracionHoras !== "" || datosProc.duracionMinutos !== "" || datosProc.duracionSegundos !== "") {
                            totalTiempo += parseInt(datosProc.duracionHoras * 3600) + parseInt(datosProc.duracionMinutos * 60) + parseInt(datosProc.duracionSegundos);
                        }

                        if (datosProc.horasBaja !== "" || datosProc.minutosBaja !== "" || datosProc.segundosBaja !== "") {
                            totalTiempo += parseInt(datosProc.horasBaja * 3600) + parseInt(datosProc.minutosBaja * 60) + parseInt(datosProc.segundosBaja);
                        }

                        if (totalTiempo > 3600) {
                            $("#trError").show();
                            $("#lblError").html(window.app.idioma.t('DURACION_MINIMA_PARO'));
                            return;
                        } else {
                            $("#trError").hide();
                        }
                    }

                    kendo.ui.progress($("#EditarCrearParo"), true);
                    self.checkParo(datosProc, self);
                } else {
                    $("#trError").show();
                    $("#lblError").html(window.app.idioma.t('CAMPO_LINEA_FECHA'));
                    return;
                }
            },
            datosParoPerdidaProduccion: function (self) {
                var datosProc = {};
                var duracionHorasPerdida = 0;
                var duracionMinutosPerdida = 0;
                var duracionSegundosPerdida = 0;
                if (self.tipo == 2) {
                    var duracionPerdidaSplit = $("#txtDuracionTotalMenores").text().split(":");
                    duracionHorasPerdida = parseInt(duracionPerdidaSplit[0]);
                    duracionMinutosPerdida = parseInt(duracionPerdidaSplit[1]);
                    duracionSegundosPerdida = parseInt(duracionPerdidaSplit[2]);
                }

                datosProc.duracionHoras = self.tipo == 1 ? $("#txtMayorHoras").data("kendoNumericTextBox").value() : duracionHorasPerdida;
                datosProc.duracionMinutos = self.tipo == 1 ? $("#txtMayorMinutos").data("kendoNumericTextBox").value() : duracionMinutosPerdida;
                datosProc.duracionSegundos = self.tipo == 1 ? $("#txtMayorSegundos").data("kendoNumericTextBox").value() : duracionSegundosPerdida;
                datosProc.fecha = $("#txtInicioReal").data("kendoDateTimePicker").value();
                datosProc.llenadora = $("#cmbLlenadora").data("kendoDropDownList").value();
                datosProc.linea = $("#cmbLineaParo").data("kendoDropDownList").value();
                datosProc.motivo = $("#cmbMotivo").data("kendoDropDownList").value();
                datosProc.causa = $("#cmbCausa").data("kendoDropDownList").value();
                datosProc.accion = self.accion;

                if (self.tipo == 2) {
                    datosProc.horasBaja = $("#txtBajaHoras").data("kendoNumericTextBox").value();
                    datosProc.minutosBaja = $("#txtBajaMinutos").data("kendoNumericTextBox").value();
                    datosProc.segundosBaja = $("#txtBajaSegundos").data("kendoNumericTextBox").value();
                }

                return datosProc;
            },
            validarMotivoCausa: function () {
                var motivo = $("#cmbMotivo").data("kendoDropDownList").value();
                var causa = $("#cmbCausa").data("kendoDropDownList").value();

                if (motivo === "") {
                    $("#lblError").html(window.app.idioma.t("SELECCIONE_MOTIVO"));
                    $("#trError").show();
                    return false;
                }

                if ($("#cmbCausa").data("kendoDropDownList").dataSource.total() != 0 && causa === "") {
                    $("#lblError").html(window.app.idioma.t("SELECCIONE_CAUSA"));
                    $("#trError").show();
                    return false;
                } else
                    $("#trError").hide();

                return true;
            },
            validarMaquina: function () {
                var correcto = true;
                var idMotivo = $("#cmbMotivo").data("kendoDropDownList").value();
                
                $.ajax({
                    url: "../api/EsMaquinaObligatoriaParo/" + idMotivo + "/",
                    dataType: 'json',
                    async: false
                }).done(function (esMaquinaObligatoria) {
                    if ($("#cmbMaquinaResponsable").data("kendoDropDownList").value() == '' && esMaquinaObligatoria) {
                        $("#lblError").html(window.app.idioma.t("SELECCIONE_MAQUINA"));
                        $("#trError").show();
                        correcto = false;
                    }
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        correcto = false;
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ES_MAQUINA_OBLIGATORIA'), 4000);
                        correcto = false;
                    }
                });

                return correcto;
            },
            checkParo: function (datosProd, self) {
                $.ajax({
                    type: "POST",
                    url: "../api/checkeaParo/",
                    dataType: 'json',
                    data: JSON.stringify(datosProd),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    if (!res.succeeded) {
                        $("#trError").show();
                        $("#lblError").html(res.message);
                    } else {
                        $("#trError").hide();
                        this.confirmacion = new VistaDlgConfirm({
                            titulo: self.tituloWindow,
                            msg: self.mensaje,
                            funcion: function () { self.editarValoresParo(datosProd.linea, datosProd.fecha, datosProd.motivo, datosProd.causa, datosProd.llenadora); },
                            contexto: this
                        });
                    }
                    kendo.ui.progress($("#EditarCrearParo"), false);
                }).fail(function (err) {
                    $("#trError").show();
                    $("#lblError").html(err.message == undefined ? window.app.idioma.t("ERROR_REQUEST") : err.message);
                    kendo.ui.progress($("#EditarCrearParo"), false);
                });
            },
            editarValoresParo: function (linea, fecha, motivo, causa, llenadora) {
                var self = this;
                var datosProc = {};

                datosProc.tipo = self.tipo;
                datosProc.fecha = fecha;
                datosProc.linea = linea;
                datosProc.numLinea = $("#cmbLineaParo").data("kendoDropDownList").dataItem().numLinea;
                datosProc.motivo = motivo;
                datosProc.causa = causa;
                datosProc.llenadora = llenadora;
                datosProc.llenadoraDescripcion = $("#cmbLlenadora").data("kendoDropDownList").text();
                datosProc.motivoDescripcion = $("#cmbMotivo").data("kendoDropDownList").text();
                datosProc.causaDescripcion = $("#cmbCausa").data("kendoDropDownList").text();
                datosProc.maquina = $("#cmbMaquinaResponsable").data("kendoDropDownList").value();
                datosProc.maquinaDescripcion = $("#cmbMaquinaResponsable").data("kendoDropDownList").text();
                datosProc.equipo = $("#cmbEquipoConstructivo").data("kendoDropDownList").value();
                datosProc.equipoConstructivoDescripcion = $("#cmbEquipoConstructivo").data("kendoDropDownList").text();
                datosProc.idAveria = $("#cmbDescripcion").data("kendoDropDownList").value();
                datosProc.descripcion = $("#cmbDescripcion").data("kendoDropDownList").text();
                datosProc.observaciones = $("#txtObservaciones").val();
                datosProc.turno = self.turno;
                
                if (self.tipo == 1) {
                    datosProc.duracionHoras = $("#txtMayorHoras").data("kendoNumericTextBox").value();
                    datosProc.duracionMinutos = $("#txtMayorMinutos").data("kendoNumericTextBox").value();
                    datosProc.duracionSegundos = $("#txtMayorSegundos").data("kendoNumericTextBox").value();
                } else {
                    datosProc.MenoresHoras = $("#txtMenoresHoras").data("kendoNumericTextBox").value();
                    datosProc.MenoresMinutos = $("#txtMenoresMinutos").data("kendoNumericTextBox").value();
                    datosProc.MenoresSegundos = $("#txtMenoresSegundos").data("kendoNumericTextBox").value();
                    datosProc.BajaVelHoras = $("#txtBajaHoras").data("kendoNumericTextBox").value();
                    datosProc.BajaVelMinutos = $("#txtBajaMinutos").data("kendoNumericTextBox").value();
                    datosProc.BajaVelSegundos = $("#txtBajaSegundos").data("kendoNumericTextBox").value();
                    datosProc.numParosMenores = $("#txtNumParoMenor").data("kendoNumericTextBox").value();
                }

                var url = "";
                if (self.accion === 0) {
                    var url = "../api/crearParo/"
                } else {
                    var url = "../api/editarParo/"
                    datosProc.Id = self.row.Id;
                    datosProc.aplicarJustificacionMaquina = !(self.row.MaquinaCausaId === datosProc.maquina);
                    datosProc.aplicarJustificacionEquipo = !(self.row.EquipoConstructivoId === datosProc.equipo);
                    datosProc.aplicarJustificacionAveria = !(self.row.Descripcion === datosProc.descripcion);
                }

                kendo.ui.progress($("#EditarCrearParo"), true);
                $.ajax({
                    type: "POST",
                    url: url,
                    dataType: 'json',
                    data: JSON.stringify(datosProc),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    kendo.ui.progress($("#EditarCrearParo"), false);
                    Backbone.trigger('eventCierraDialogo');
                    self.window.close();
                    self.eliminar();

                    if (self.callback) {
                        self.callback(datosProc);
                    }

                    if ($("#gridSeleccionParosPerdidas").length > 0) {
                        $("#gridSeleccionParosPerdidas").data('kendoGrid').dataSource.read();
                    }

                    if (self.accion == 1)
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('EDITADO_PARO_CORRECTAMENTE'), 3000);
                    else
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('CREADO_PARO_CORRECTAMENTE'), 3000);
                }).fail(function (err) {
                    kendo.ui.progress($("#EditarCrearParo"), false);
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EDITANDO_UN_PARO'), 2000);
                });
            },
            confirmarAnular: function (e) {
                e.preventDefault();
                var self = this;

                self.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ANULAR'),
                    msg: window.app.idioma.t('DESEA_ANULAR_JUSTIFICACION'),
                    funcion: function () { self.anular(); },
                    contexto: this
                });
            },
            anular: function () {
                var self = this;

                var paro = {
                    id: self.row.Id,
                    maquina: self.row.EquipoId
                };

                $.ajax({
                    type: "POST",
                    url: "../api/AnularParoPerdidaPortal/",
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json',
                    data: JSON.stringify(paro),
                    cache: false,
                    async: false,
                    reset: true
                }).success(function (res) {
                    self.window.close();
                    if (!res[0]) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res[1], 4000);
                    } else {
                        $("#gridSeleccionParosPerdidas").data('kendoGrid').dataSource.read();
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ANULACION_CORRECTA'), 4000);
                    }
                    self.eliminar();
                    Backbone.trigger('eventCierraDialogo');
                }).error(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ANULACION') + ': ' + e.Message, 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearArranqueCambio;
    });