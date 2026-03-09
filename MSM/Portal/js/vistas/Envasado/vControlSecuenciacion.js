define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/ControlSecuenciacion.html', 'vistas/vDialogoConfirm',
        'compartido/notificaciones', 'compartido/util', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, PlantillaControlSecuenciacion, VistaDlgConfirm, Not, util, definiciones) {
        var vistaControlSecuenciacion = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaControlSecuenciacion),
            dsLineas: null,
            dsPlanificadas: null,
            dsProductosCajas: null,
            constantes: definiciones.TransferenciaSIGI(),
            initialize: function () {
                var self = this;

                self.render();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                util.ui.createVSplitter('#vsplitPanelSecuenciacion', ['45%', '55%']);

                self.ObtenerLineas();
            },
            ObtenerLineas: function () {
                var self = this;

                $.ajax({
                    url: "../api/ObtenerLineas",
                    async: false,
                    dataType: 'json',
                }).done(function (res) {
                    self.dsLineas = res;
                }).fail(function (e) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_DATOS'), 4000);
                });

                $("#selectLinea").kendoDropDownList({
                    dataSource: self.dsLineas,
                    dataTextField: "DescripcionLinea",
                    dataValueField: "IdEtiquetaSIGI",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    change: function () {
                        self.Consultar();
                    }
                });
            },
            events: {
                'click #btnConsultar': 'Consultar',
                'click #btnTransferirMES': 'Transferir',
                'change #chkTransfAutomatica': 'Transferir',
                'click #btnAddProducto': 'AbrirModalProductoCaja',
                'click #btnAddCajaVacia': 'AbrirModalProductoCaja',
                'click #btnEliminar': 'ConfirmarEliminar',
                'change #chkSecuenciaActiva': 'ActivarSecuenciaAuto',
                'change #chkProducirSKUS': 'ProducirSKUS',
                'click #btnTransferirSIGI': 'TransferirSIGI',
            },
            Consultar: function () {
                var self = this;

                var linea = $("#selectLinea").data("kendoDropDownList").value();

                if (linea == '') {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_SE_HA_INDICADO_LA_LINEA'), 3000);
                    return;
                }

                self.CargarPlanificadas();
                self.CargarProductosCajas();
                self.ObtenerConfiguracion();
                self.ObtenerSecuenciaActiva();
                self.ObtenerInfoTrenes();
                self.ObtenerProductos();
                self.ObtenerCajas();
            },
            CargarPlanificadas: function () {
                var self = this;
                var linea = $("#selectLinea").data("kendoDropDownList").value();

                self.dsPlanificadas = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ObtenerDatosSecuenciacionMES/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.linea = linea;

                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                'Id': { type: "number" },
                                'IdLinea': { type: "string" },
                                'IdProducto': { type: "string" },
                                'DescripcionProducto': { type: "string" },
                                'FechaInicioPlanificado': { type: "date" },
                                'WO': { type: "string" },
                                'EstadoWO': { type: "string" },
                            }
                        }
                    },
                    requestStart: function () {
                        if ($("#gridPlanificadas").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridPlanificadas"), true);
                        }
                    },
                    requestEnd: function () {
                        if ($("#gridPlanificadas").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridPlanificadas"), false);
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
                $("#gridPlanificadas").kendoGrid({
                    dataSource: self.dsPlanificadas,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    sortable: true,
                    resizable: true,
                    columns: [
                        {
                            field: "IdProducto", title: window.app.idioma.t("CODIGO_PRODUCTO"),
                        },
                        {
                            field: "DescripcionProducto", title: window.app.idioma.t("PRODUCTO"),
                        },
                        {
                            field: "FechaInicioPlanificado", title: window.app.idioma.t("INICIO_PLANIFICADO"),
                            template: '#: kendo.toString(new Date(FechaInicioPlanificado), kendo.culture().calendars.standard.patterns.MES_FechaHora) #',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "WO", title: window.app.idioma.t("IDORDEN"),
                        },
                        {
                            field: "EstadoWO", title: window.app.idioma.t("ESTADO"),
                        },
                    ],
                }).data("kendoGrid");
            },
            CargarProductosCajas: function () {
                var self = this;
                var linea = $("#selectLinea").data("kendoDropDownList").value();

                self.dsProductosCajas = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ObtenerDatosSecuenciacionSIGI/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.linea = linea;

                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                'Id': { type: "number" },
                                'IdEtiquetaSIGI': { type: "number" },
                                'IdLinea': { type: "string" },
                                'ProductoCaja': { type: "string" },
                                'Descripcion': { type: "string" },
                                'Orden': { type: "number" },
                            }
                        }
                    },
                    requestStart: function () {
                        if ($("#gridProductosCajas").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridProductosCajas"), true);
                        }
                    },
                    requestEnd: function () {
                        if ($("#gridProductosCajas").data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($("#gridProductosCajas"), false);
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
                $("#gridProductosCajas").kendoGrid({
                    dataSource: self.dsProductosCajas,
                    toolbar: [
                        {
                            template: "<button id='btnAddProducto' class='k-button k-button-icontext'>" + window.app.idioma.t('ANADIR_PRODUCTO') + "</button>"
                        },
                        {
                            template: "<button id='btnAddCajaVacia' class='k-button k-button-icontext'>" + window.app.idioma.t('ANADIR_CAJA_VACIA') + "</button>"
                        },
                        {
                            template: "<button id='btnEliminar' class='k-button k-button-icontext'>" + window.app.idioma.t('ELIMINAR') + "</button>"
                        },
                        {
                            template: "<label style='margin-left: 10px;'>" + window.app.idioma.t('SECUENCIA_ACTIVA_SIGI') + "</label>"
                        },
                        {
                            template: "<input type='checkbox' id='chkSecuenciaActiva' style='width: 30px; vertical-align: text-bottom' />"
                        },
                        {
                            template: "<button type='button' id='btnHelp' data-toggle='popover' data-placement='right' data-container='body' data-content='" + window.app.idioma.t('SIGI_TEXTO_AYUDA') + "'><img src='img/question.png'></button>"
                        },
                        {
                            template: "<label style='margin-left: 10px;'>" + window.app.idioma.t('ENVASAR_PROD_DIFERENTES') + "</label>"
                        },
                        {
                            template: "<input type='checkbox' id='chkProducirSKUS' style='width: 30px; vertical-align: text-bottom' />"
                        },
                        {
                            template: "<button id='btnTransferirSIGI' class='k-button k-button-icontext'>" + window.app.idioma.t('TRANSFERIR_SIGI') + "</button>"
                        },
                    ],
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    sortable: true,
                    resizable: true,
                    selectable: true,
                    columns: [
                        {
                            field: "ProductoCaja", title: window.app.idioma.t("PRODUCTO") + window.app.idioma.t("CAJA"),
                        },
                        {
                            field: "Descripcion", title: window.app.idioma.t("DESCRIPCION"),
                        },
                        {
                            field: "Orden", title: window.app.idioma.t("ORDEN_ETIQUETADORA_PALETS"),
                        },
                    ],
                    dataBound: function () {
                        if (!$("#chkTransfAutomatica").prop('checked')) {
                            self.kendoSortable();
                        }
                    }
                });

                const popover = $('[data-toggle="popover"]');
                popover.popover();
                popover.click(function (e) {
                    e.stopPropagation();
                });
                $(document).click(function (e) {
                    if (($('.popover').has(e.target).length == 0) || $(e.target).is('.close')) {
                        popover.popover('hide');
                    }
                });
            },
            ObtenerConfiguracion: function () {
                var datos = {
                    idEtiquetaSIGI: $("#selectLinea").data("kendoDropDownList").value()
                };

                $.ajax({
                    type: "POST",
                    url: "../api/ObtenerConfiguracion",
                    async: false,
                    data: JSON.stringify(datos),
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                }).done(function (res) {
                    if (res.ConPlanificacion) {
                        $("#chkTransfAutomatica").prop('checked', res.TransferenciaAutomatica);
                        $("#btnTransferirMES").prop("disabled", false);
                        $("#chkTransfAutomatica").prop("disabled", false);
                    } else {
                        $("#btnTransferirMES").prop("disabled", true);
                        $("#chkTransfAutomatica").prop("disabled", true);
                    }

                    if (res.HabilitarProdSimultanea) {
                        $("#chkProducirSKUS").prop('checked', res.ValorProdSimultanea);
                        $("#chkProducirSKUS").prop("disabled", false);
                    } else {
                        $("#chkProducirSKUS").prop("disabled", true);
                    }
                }).fail(function (e) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_DATOS'), 4000);
                });
            },
            ObtenerSecuenciaActiva: function () {
                var idEtiquetaSIGI = $("#selectLinea").data("kendoDropDownList").value();

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerSecuenciaActiva/" + idEtiquetaSIGI,
                    async: false,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                }).done(function (res) {
                    $("#chkSecuenciaActiva").prop('checked', res);

                    if (res) {
                        $("#btnTransferirSIGI").prop("disabled", false);
                    } else {
                        $("#btnTransferirSIGI").prop("disabled", true);
                    }
                }).fail(function (e) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_DATOS'), 4000);
                });
            },
            ObtenerInfoTrenes: function () {
                var idEtiquetaSIGI = $("#selectLinea").data("kendoDropDownList").value();

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerInfoTrenes/" + idEtiquetaSIGI,
                    async: false,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                }).done(function (res) {
                    $("#codPalet").text(res[0]);
                    $("#fechaConsumo").text(res[1]);
                }).fail(function (e) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_DATOS'), 4000);
                });
            },
            Transferir: function (e) {
                var self = this;

                var permiso = TienePermiso(262);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var datos = {
                    tipo: e.target.id == "btnTransferirMES" ? self.constantes.Manual : self.constantes.Automatica,
                    idEtiquetaSIGI: $("#selectLinea").data("kendoDropDownList").value(),
                    esAutomatico: $("#chkTransfAutomatica").prop('checked') ? 1 : 0
                };

                $.ajax({
                    type: "POST",
                    url: "../api/TransferirMES",
                    async: false,
                    data: JSON.stringify(datos),
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                }).done(function (res) {
                    if (res) {
                        self.dsProductosCajas.read();
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('MODIFICADO_CORRECTAMENTE'), 3000);
                    } else {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 3000);
                    }
                }).fail(function (e) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                });
            },
            kendoSortable: function () {
                var self = this;

                var permiso = TienePermiso(262);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                $('#gridProductosCajas').data("kendoGrid").table.kendoSortable({
                    filter: ">tbody >tr",
                    hint: function (element) { //customize the hint
                        var table = $('<table style="width: ' + $('#gridProductosCajas').width() + 'px;" class="k-grid k-widget"></table>'),
                            hint;

                        table.append(element.clone()); //append the dragged element
                        table.css("opacity", 0.7);

                        return table; //return the hint element
                    },
                    cursor: "move",
                    placeholder: function (element) {
                        return $('<tr colspan="3" class="placeholder"></tr>');
                    },
                    change: function (e) {
                        var grid = $('#gridProductosCajas').data("kendoGrid");
                        var itemOrigen = grid.dataItems()[e.oldIndex];
                        var itemDestino = grid.dataItems()[e.newIndex];

                        var datos = {
                            idEtiquetaSIGI: itemOrigen.IdEtiquetaSIGI,
                            idOrigen: itemOrigen.Id,
                            ordenOrigen: itemOrigen.Orden,
                            ordenDestino: itemDestino.Orden,
                            subeOrden: e.oldIndex > e.newIndex ? 1 : 0
                        };

                        $.ajax({
                            type: "POST",
                            url: "../api/CambiarOrdenSIGI/",
                            async: false,
                            data: JSON.stringify(datos),
                            dataType: 'json',
                            contentType: "application/json; charset=utf-8",
                        }).done(function (res) {
                            if (res) {
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('MODIFICADO_CORRECTAMENTE'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                            }
                            self.dsProductosCajas.read();
                        }).fail(function (err) {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                        });
                    }
                });
            },
            ObtenerProductos: function () {
                var self = this;
                var linea = $("#selectLinea").data("kendoDropDownList").value();

                self.dsProductos = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerProductosSecuenciacion/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.linea = linea;

                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    }
                });
            },
            ObtenerCajas: function () {
                var self = this;
                var linea = $("#selectLinea").data("kendoDropDownList").value();

                self.dsCajas = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerCajasSecuenciacion/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.linea = linea;

                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    }
                });
            },
            AbrirModalProductoCaja: function (e) {
                var self = this;
                var permiso = TienePermiso(262);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                //Creamos el div donde se va a pintar la ventana modal
                $("body").prepend($("<div id='dlgProductoCaja'></div>"));

                self.ConfigurarModal(e);

                self.ventanaProductoCaja = $('#dlgProductoCaja').data("kendoWindow");
                if (typeof self.ventanaProductoCaja != "undefined") {
                    self.ventanaProductoCaja.center();
                }
            },
            ConfigurarModal: function (e) {
                var self = this;

                $("#dlgProductoCaja").kendoWindow(
                    {
                        title: (e.target.id == "btnAddProducto") ? window.app.idioma.t('ANADIR_PRODUCTO') : window.app.idioma.t('ANADIR_CAJA_VACIA'),
                        width: "460px",
                        height: "110px",
                        content: "Envasado/html/CrearProductoCaja.html",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        scrollable: false,
                        close: function () {
                            self.ventanaProductoCaja.destroy();
                            self.ventanaProductoCaja = null;
                        },
                        refresh: function () {
                            self.CargaContenidoModal(e);
                        }
                    });
            },
            CargaContenidoModal: function (e) {
                var self = this;

                $("#btnAceptarProductoCaja").val(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarProductoCaja").val(window.app.idioma.t('CANCELAR'));
                var linea = $("#selectLinea").data("kendoDropDownList").value();
                var gridData = $("#gridProductosCajas").data("kendoGrid").dataSource.data();
                var orden = gridData.length == 0 ? 1 : gridData[gridData.length - 1].Orden + 1;

                var textoLabel = (e.target.id == "btnAddProducto") ? window.app.idioma.t('PRODUCTO') : window.app.idioma.t('CAJA')
                $("#lblProductoCaja").text(textoLabel);

                $("#cmbProductoCaja").kendoDropDownList({
                    filter: "contains",
                    dataSource: (e.target.id == "btnAddProducto") ? self.dsProductos : self.dsCajas,
                    dataTextField: "Descripcion",
                    dataValueField: (e.target.id == "btnAddProducto") ? "IdProducto" : "IdCaja",
                });

                $("#btnCancelarProductoCaja").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        self.ventanaProductoCaja.close();
                    }
                });

                $("#btnAceptarProductoCaja").kendoButton({
                    click: function () {
                        var data = {};

                        data.idLinea = linea;
                        data.idProductoCaja = $("#cmbProductoCaja").data("kendoDropDownList").value();
                        data.descripcion = $("#cmbProductoCaja").data("kendoDropDownList").text().split('-').pop();
                        data.orden = orden;

                        self.GuardarProductoCaja(data);
                    }
                });
            },
            GuardarProductoCaja: function (data) {
                var self = this;

                $.ajax({
                    type: "POST",
                    url: "../api/GuardarProductoCaja",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(data),
                    success: function (res) {
                        if (res) {
                            self.dsProductosCajas.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('VALOR_AGREGADO_CORRECTAMENTE'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AGREGANDO_EL'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (e) {
                        Backbone.trigger('eventCierraDialogo');
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AGREGANDO_EL'), 4000);
                        }
                    }
                });

                self.ventanaProductoCaja.close();
            },
            ConfirmarEliminar: function (e) {
                e.preventDefault();
                var self = this;
                var permiso = TienePermiso(262);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $("#gridProductosCajas").data("kendoGrid");
                var data = grid.dataItem(grid.select());

                if (data != null) {
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('ELIMINAR_PRODUCTO_CAJA'),
                        msg: window.app.idioma.t('CONFIRMACION_ELIMINAR_REGISTRO'),
                        funcion: function () { self.Borrar(data); },
                        contexto: this
                    });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                }
            },
            Borrar: function (data) {
                var self = this;

                $.ajax({
                    data: JSON.stringify(data),
                    type: "POST",
                    async: false,
                    url: "../api/EliminarProductoCaja",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            self.dsProductosCajas.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ELIMINACION_OK'), 3000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ELIMINACION_NO_OK'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ELIMINACION_NO_OK'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            ActivarSecuenciaAuto: function () {
                var permiso = TienePermiso(262);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                if ($("#chkSecuenciaActiva").prop('checked')) {
                    $("#btnTransferirSIGI").prop("disabled", false);
                } else {
                    $("#btnTransferirSIGI").prop("disabled", true);
                }

                var datos = {
                    idLinea: $("#selectLinea").data("kendoDropDownList").value(),
                    valor: $("#chkSecuenciaActiva").prop('checked') ? 1 : 0
                };

                $.ajax({
                    type: "POST",
                    url: "../api/ActivarSecuenciaAutoSIGI",
                    async: false,
                    data: JSON.stringify(datos),
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                }).done(function (res) {
                    if (res) {
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('MODIFICADO_CORRECTAMENTE'), 3000);
                    } else {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 3000);
                    }
                }).fail(function (e) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                });
            },
            ProducirSKUS: function () {
                var permiso = TienePermiso(262);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var datos = {
                    idEtiquetaSIGI: $("#selectLinea").data("kendoDropDownList").value(),
                    valor: $("#chkProducirSKUS").prop('checked') ? 1 : 0
                };

                $.ajax({
                    type: "POST",
                    url: "../api/FijarValorProduccionSimultanea",
                    async: false,
                    data: JSON.stringify(datos),
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                }).done(function (res) {
                    if (res) {
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('MODIFICADO_CORRECTAMENTE'), 3000);
                    } else {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 3000);
                    }
                }).fail(function (e) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                });
            },
            TransferirSIGI: function (e) {
                var self = this;

                var permiso = TienePermiso(262);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var datos = {
                    idEtiquetaSIGI: $("#selectLinea").data("kendoDropDownList").value()
                };

                $.ajax({
                    type: "POST",
                    url: "../api/TransferirSIGI",
                    async: false,
                    data: JSON.stringify(datos),
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                }).done(function (res) {
                    if (res) {
                        self.dsProductosCajas.read();
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('MODIFICADO_CORRECTAMENTE'), 3000);
                    } else {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 3000);
                    }
                }).fail(function (e) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS'), 4000);
                });
            },
            eliminar: function () {
                $('[data-toggle="popover"]').popover('hide');
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
        });

        return vistaControlSecuenciacion;
    });