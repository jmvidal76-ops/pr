define(['underscore', 'backbone', 'jquery', 'text!../../../html/Alt/AnaliticasO2.html', 'compartido/notificaciones', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, Plantilla, Not, definiciones) {
        var VistaAnaliticasO2 = Backbone.View.extend({
            tagName: 'div',
            template: _.template(Plantilla),
            component: null,
            datosToleranciasO2: null,
            datosParametrosO2: null,
            datosToleranciasCO2: null,
            tipo: null,
            constantes: definiciones.TipoParametrosO2(),
            initialize: function (options) {
                var self = this;
                self.render();
                Backbone.on('eventcambioPuesto', this.Actualiza, this);
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").css("overflow", "hidden");

                self.cargarToleranciasO2();
                self.cargarParametrosO2();
                self.cargarToleranciasCO2();
                self.cargarAnaliticas();
            },
            cargarAnaliticas: function () {
                var self = this;
                var numLinea = window.app.lineaSel.Grupo == '' ? window.app.lineaSel.numLineaDescripcion : window.app.lineaSel.Grupo;
                var linea = window.app.idioma.t('LINEA') + ' ' + numLinea + ' - ' + window.app.lineaSel.descripcion;

                self.dsAnaliticas = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerAnaliticasO2Terminal/" + linea + "/",
                            dataType: "json",
                        }
                    },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                'Id': { type: "number" },
                                'Linea': { type: "string" },
                                'VolumenEnvase': { type: "string" },
                                'Llenadora': { type: "number" },
                                'IdMuestra': { type: "string" },
                                'Fecha': { type: "date" },
                                'Comentario': { type: "string" },
                                'TCP': { type: "number" },
                                'O2_TCP': { type: "number" },
                                'CO2_TCP': { type: "number" },
                                'TipoMuestra': { type: "string" },
                                'NumGrifo': { type: "number" },
                                'TPO': { type: "number" },
                                'UnidadTPO': { type: "string" },
                                'HSO': { type: "number" },
                                'UnidadHSO': { type: "string" },
                                'DO': { type: "number" },
                                'UnidadDO': { type: "string" },
                                'CO2': { type: "number" },
                                'UnidadCO2': { type: "string" },
                                'CO2_Ts': { type: "number" },
                                'UnidadCO2_Ts': { type: "string" },
                                'HSV': { type: "number" },
                                'UnidadHSV': { type: "string" },
                                'Presion': { type: "number" },
                                'UnidadPresion': { type: "string" },
                                'Temperatura': { type: "number" },
                                'UnidadTemperatura': { type: "string" },
                                'Temperatura_Ts': { type: "number" },
                                'UnidadTemperatura_Ts': { type: "string" }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            $("#center-pane").empty();
                        }
                    }
                });

                //Cargamos el grid con los datos recibidos
                var grid = self.$("#gridAnaliticasO2Terminal").kendoGrid({
                    dataSource: self.dsAnaliticas,
                    toolbar: [
                        {
                            template: "<a class='k-button' id='btnAnadirConsumoGas' style='margin-left:20px;font-size:22px;float:right;'>" + window.app.idioma.t('AÑADIR_CONSUMO_GAS') + "</a>"
                        },
                        {
                            template: "<a class='k-button' id='btnAnadirPresionSoplado' style='margin-left:20px;font-size:22px;float:right;'>" + window.app.idioma.t('AÑADIR_PRESION_SOPLADO') + "</a>"
                        },
                        {
                            template: "<a class='k-button' id='btnAnadirPresionEspumado' style='margin-left:20px;font-size:22px;float:right;'>" + window.app.idioma.t('AÑADIR_PRESION_ESPUMADO') + "</a>"
                        },
                        {
                            template: "<a class='k-button' id='btnAnadirPresionVacio' style='margin-left:20px;font-size:22px;float:right;'>" + window.app.idioma.t('AÑADIR_PRESION_VACIO') + "</a>"
                        }
                    ],
                    sortable: false,
                    resizable: true,
                    selectable: true,
                    height: '95%',
                    pageable: false,
                    columns: [
                        {
                            field: "colorSemaforoO2",
                            title: window.app.idioma.t("INDICADOR_O2"),
                            template: function (data) {
                                return self.obtenerColorSemaforoO2(data);
                            },
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            field: "colorSemaforoCO2",
                            title: window.app.idioma.t("INDICADOR_CO2"),
                            template: function (data) {
                                return self.obtenerColorSemaforoCO2(data);
                            },
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            field: "Fecha", title: window.app.idioma.t("FECHA"),
                            template: '#: kendo.toString(new Date(Fecha), kendo.culture().calendars.standard.patterns.MES_FechaHora) #',
                        },
                        {
                            field: "Llenadora", title: window.app.idioma.t("LLENADORA"),
                        },
                        {
                            field: "TipoMuestra", title: window.app.idioma.t("TIPO_MUESTRA"),
                        },
                        {
                            field: "TCP", title: window.app.idioma.t("TCP"),
                        },
                        {
                            field: "O2_TCP", title: window.app.idioma.t("O2_TCP"),
                        },
                        {
                            field: "TPO", title: window.app.idioma.t("TPO"),
                        },
                        {
                            field: "HSO", title: window.app.idioma.t("HSO"),
                        },
                        {
                            field: "DO", title: window.app.idioma.t("DO"),
                        },
                        {
                            field: "UnidadDO", title: window.app.idioma.t("UNIDAD_DO"),
                        },
                        {
                            field: "CO2_TCP", title: window.app.idioma.t("CO2_TCP"),
                        },
                        {
                            field: "CO2", title: window.app.idioma.t("CO2"),
                        },
                        {
                            field: "UnidadCO2", title: window.app.idioma.t("UNIDAD_CO2"),
                        },
                        {
                            field: "NumGrifo", title: window.app.idioma.t("NUM_GRIFO"),
                        },
                        {
                            field: "Comentario", title: window.app.idioma.t("COMENTARIO"),
                        },
                        {
                            field: "PresionVacio", title: window.app.idioma.t("PRESION_VACIO"),
                        },
                        {
                            field: "UnidadPresionVacio", title: window.app.idioma.t("UNIDAD_PRESION_VACIO"),
                        },
                        {
                            field: "PresionEspumado", title: window.app.idioma.t("PRESION_ESPUMADO"),
                        },
                        {
                            field: "UnidadPresionEspumado", title: window.app.idioma.t("UNIDAD_PRESION_ESPUMADO"),
                        },
                        {
                            field: "PresionSoplado", title: window.app.idioma.t("PRESION_SOPLADO"),
                        },
                        {
                            field: "UnidadPresionSoplado", title: window.app.idioma.t("UNIDAD_PRESION_SOPLADO"),
                        },
                        {
                            field: "ConsumoGas", title: window.app.idioma.t("CONSUMO_GAS"),
                        },
                        {
                            field: "UnidadConsumoGas", title: window.app.idioma.t("UNIDAD_CONSUMO_GAS"),
                        },
                    ],
                    dataBound: function () {
                        for (var i = 0; i < this.columns.length; i++) {
                            this.autoFitColumn(i);
                        }
                    },
                }).data("kendoGrid");
            },
            cargarToleranciasO2: function () {
                var self = this;

                $.ajax({
                    url: "../api/ObtenerToleranciasO2/",
                    dataType: 'json',
                    async: false
                }).done(function (datos) {
                    self.datosToleranciasO2 = datos;
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER_TOLERANCIAS_O2'), 4000);
                    }
                });
            },
            cargarParametrosO2: function () {
                var self = this;

                $.ajax({
                    url: "../api/ObtenerParametrosO2/",
                    dataType: 'json',
                    async: false
                }).done(function (datos) {
                    self.datosParametrosO2 = datos;
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER_PARAMETROS_O2'), 4000);
                    }
                });
            },
            cargarToleranciasCO2: function () {
                var self = this;

                $.ajax({
                    url: "../api/ObtenerToleranciasCO2/",
                    dataType: 'json',
                    async: false
                }).done(function (datos) {
                    self.datosToleranciasCO2 = datos;
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER_TOLERANCIAS_CO2'), 4000);
                    }
                });
            },
            obtenerColorSemaforoO2: function (datos) {
                var self = this;

                let tolerancia = self.datosToleranciasO2.filter(function (value, index) {
                    return value.Linea == datos.Linea;
                })[0];

                let parametro = self.datosParametrosO2.filter(function (value, index) {
                    return value.Linea == datos.Linea;
                })[0];

                let paramComparacion = parametro.ConTPO ? datos.TPO : datos.DO;

                if (tolerancia == undefined) {
                    return "<img id='imgEstado' src='img/KOP_Rojo.png'></img>";
                }

                if (paramComparacion <= tolerancia.LimiteIncremento) {
                    return "<img id='imgEstado' src='img/KOP_Verde.png'></img>";
                }

                if (tolerancia.LimiteIncremento < paramComparacion && paramComparacion <= tolerancia.ToleranciaIncremento) {
                    return "<img id='imgEstado' src='img/KOP_Amarillo.png'></img>";
                }

                if (paramComparacion > tolerancia.ToleranciaIncremento) {
                    return "<img id='imgEstado' src='img/KOP_Rojo.png'></img>";
                }
            },
            obtenerColorSemaforoCO2: function (datos) {
                var self = this;

                let tolerancia = self.datosToleranciasCO2.filter(function (value, index) {
                    return value.Linea == datos.Linea;
                })[0];

                if (tolerancia == undefined) {
                    return "<img id='imgEstado' src='img/KOP_Rojo.png'></img>";
                }

                if (tolerancia.LimiteInferior < datos.CO2_Ts && datos.CO2_Ts < tolerancia.LimiteSuperior) {
                    return "<img id='imgEstado' src='img/KOP_Verde.png'></img>";
                }

                if ((tolerancia.ToleranciaInferior <= datos.CO2_Ts && datos.CO2_Ts <= tolerancia.LimiteInferior) ||
                    (tolerancia.LimiteSuperior <= datos.CO2_Ts && datos.CO2_Ts <= tolerancia.ToleranciaSuperior)) {
                    return "<img id='imgEstado' src='img/KOP_Amarillo.png'></img>";
                }

                if (datos.CO2_Ts < tolerancia.ToleranciaInferior || datos.CO2_Ts > tolerancia.ToleranciaSuperior) {
                    return "<img id='imgEstado' src='img/KOP_Rojo.png'></img>";
                }
            },
            events: {
                "click #btnAnadirPresionVacio": "AbrirModalPresion",
                "click #btnAnadirPresionEspumado": "AbrirModalPresion",
                "click #btnAnadirPresionSoplado": "AbrirModalPresion",
                "click #btnAnadirConsumoGas": "AbrirModalPresion",
            },
            AbrirModalPresion: function (e) {
                var self = this;
                var permiso = TienePermiso(364);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                // Obtenemos la línea seleccionada del grid
                var grid = $("#gridAnaliticasO2Terminal").data("kendoGrid");
                var data = grid.dataItem(grid.select());

                if (data == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                //Creamos el div donde se va a pintar la ventana modal
                $("body").prepend($("<div id='dlgPresion'></div>"));

                self.ConfigurarModalPresion(e, data);

                self.ventanaPresion = $('#dlgPresion').data("kendoWindow");
                if (typeof self.ventanaPresion != "undefined") {
                    self.ventanaPresion.center();
                }
            },
            ConfigurarModalPresion: function (e, data) {
                var self = this;
                var title = '';

                switch (e.target.id) {
                    case "btnAnadirPresionVacio":
                        title = window.app.idioma.t('AÑADIR_PRESION_VACIO');
                        self.tipo = self.constantes.PresionVacio;
                        break;
                    case "btnAnadirPresionEspumado":
                        title = window.app.idioma.t('AÑADIR_PRESION_ESPUMADO');
                        self.tipo = self.constantes.PresionEspumado;
                        break;
                    case "btnAnadirPresionSoplado":
                        title = window.app.idioma.t('AÑADIR_PRESION_SOPLADO');
                        self.tipo = self.constantes.PresionSoplado;
                        break;
                    default:
                        title = window.app.idioma.t('AÑADIR_CONSUMO_GAS');
                        self.tipo = self.constantes.ConsumoGas;
                }

                $("#dlgPresion").kendoWindow(
                    {
                        title: title,
                        width: "500px",
                        height: "700px",
                        content: "html/EditarDatosPresion.html",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        scrollable: false,
                        close: function () {
                            self.ventanaPresion.destroy();
                            self.ventanaPresion = null;
                        },
                        refresh: function () {
                            self.CargaContenidoModal(e, data);
                        }
                    });
            },
            CargaContenidoModal: function (e, edicion) {
                var self = this;

                $("#lblCantidad").text(window.app.idioma.t('CANTIDAD'));

                switch (self.tipo) {
                    case self.constantes.PresionVacio:
                        $("#txtCantidad").val(edicion.PresionVacio.toString().replace('.', ','));
                        break;
                    case self.constantes.PresionEspumado:
                        $("#txtCantidad").val(edicion.PresionEspumado.toString().replace('.', ','));
                        break;
                    case self.constantes.PresionSoplado:
                        $("#txtCantidad").val(edicion.PresionSoplado.toString().replace('.', ','));
                        break;
                    default:
                        $("#txtCantidad").val(edicion.ConsumoGas.toString().replace('.', ','));
                }

                $("#btnCancelarPresion").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        self.CancelarFormulario();
                    }
                });

                $("#btnAceptarPresion").kendoButton({
                    click: function () {
                        var data = {};
                        var valor = $("#txtCantidad").val().replace(',', '.');

                        data.idMuestra = edicion.IdMuestra;
                        data.tipo = self.tipo;
                        data.cantidad = (e.target.id == "btnAnadirPresionVacio") ? parseFloat(valor).toFixed(4) : parseFloat(valor).toFixed(2);

                        self.EditarPresion(data);
                    }
                });
            },
            EditarPresion: function (data) {
                var self = this;

                $.ajax({
                    type: "POST",
                    url: "../api/EditarPresion",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(data),
                    success: function (res) {
                        if (res) {
                            self.ActualizarGrid();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('VALOR_AGREGADO_CORRECTAMENTE'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AGREGANDO_EL'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (e) {
                        Backbone.trigger('eventCierraDialogo');
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AGREGANDO_EL'), 4000);
                        }
                    }
                });

                this.ventanaPresion.close();
            },
            ActualizarGrid: function () {
                var linea = window.app.idioma.t('LINEA') + ' ' + window.app.lineaSel.numLineaDescripcion + ' - ' + window.app.lineaSel.descripcion;

                $.ajax({
                    url: "../api/ObtenerAnaliticasO2Terminal/" + linea + "/",
                    dataType: "json",
                    success: function (result) {
                        $("#gridAnaliticasO2Terminal").data("kendoGrid").dataSource.data(result);
                    },
                    error: function (e) {
                        Backbone.trigger('eventCierraDialogo');
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_OBTENER_ANALITICAS'), 4000);
                        }
                    }
                });
            },
            CancelarFormulario: function () {
                this.ventanaPresion.close();
            },
            Actualiza: function (cambioPuesto) {
                this.render();
            },
            eliminar: function () {
                Backbone.off('eventcambioPuesto');
                if (this.component)
                    this.component.eliminar();
                $("#center-pane").css("overflow", "");
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

        return VistaAnaliticasO2;
    });