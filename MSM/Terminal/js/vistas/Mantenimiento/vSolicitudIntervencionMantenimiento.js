define(['underscore', 'backbone', 'jquery', 'text!../../../html/Mantenimiento/SolicitudIntervencionMantenimiento.html', 'compartido/notificaciones',
    'vistas/Mantenimiento/vValidacionArranqueOT', 'compartido/KeyboardSettings', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, Plantilla, Not, vistaValidacionArranqueOT, KeyboardSettings, enums) {
        var VistaSolicitudIntervencion = Backbone.View.extend({
            tagName: 'div',
            template: _.template(Plantilla),
            constEstadosMantenimiento: enums.EstadosSolicitudMantenimiento(),
            constOperacionesMantenimiento: enums.OperacionesSolicitudMantenimiento(),
            initialize: function (options) {
                let self = this;

                self.dsSolicitudes = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerSolicitudesIntervencionTerminal/" + window.app.lineaSel.id + "/",
                            dataType: "json",
                        }
                    },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                'Id': { type: "number" },
                                'NumOT': { type: "number" },
                                'Linea': { type: "string" },
                                'Estado': { type: "string" },
                                'Maquina': { type: "string" },
                                'EquipoConstructivo': { type: "string" },
                                'DescripcionAveria': { type: "string" },
                                'DescripcionProblema': { type: "string" },
                                //'ComentarioCierre': { type: "string" },
                                'FechaCreacion': { type: "date" },
                                //'FechaCierre': { type: "date" }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_SOLICITUDES_MANTENIMIENTO'), 2000);
                        }
                        $("#center-pane").empty();
                    }
                });

                self.render();
                Backbone.on('eventcambioPuesto', this.actualiza, this);
            },
            render: function() {
                let self = this;

                DestruirKendoWidgets(self);

                $(self.el).html(self.template());
                $("#center-pane").css("overflow", "hidden");

                self.CargarSolicitudes();
                self.$("[data-funcion]").checkSecurity();

                //var height = $(window).height() - $("#header").height() - $("#footer").height() - $(".cabeceraVista").height() - heightMenuEspecial;
                //$("#listado").css('max-height', height -5);
            },
            CargarSolicitudes: function () {
                let self = this;

                //Cargamos el grid con los datos recibidos
                self.grid = self.$("#gridSolicitudesIntervencionTerminal").kendoGrid({
                    dataSource: self.dsSolicitudes,
                    toolbar: [
                        {
                            template: "<a class='k-button' id='btnCerrarSolicitud' data-funcion='MAN_PROD_SOL_2_GestionSolicitudIntervencionTerminal' style='margin-left:20px;font-size:22px;float:right;'>" + window.app.idioma.t('CERRAR_SOLICITUD_MAN') + "</a>"
                        },
                        {
                            template: "<a class='k-button' id='btnValidarArranque' data-funcion='MAN_PROD_VAL_1_GestionValidacionArranque' style='margin-left:20px;font-size:22px;float:right;'>" + window.app.idioma.t('VALIDACION_ARRANQUE') + "</a>"
                        },
                        {
                            template: "<a class='k-button' id='btnAnadirSolicitud' data-funcion='MAN_PROD_SOL_2_GestionSolicitudIntervencionTerminal' style='margin-left:20px;font-size:22px;float:right;'>" + window.app.idioma.t('CREAR_SOLICITUD_MAN') + "</a>"
                        },
                        {
                            template: "<a class='k-button' id='btnAsociarParo' data-funcion='MAN_PROD_SOL_2_GestionSolicitudIntervencionTerminal' style='margin-left:20px;font-size:22px;float:right;'>" + window.app.idioma.t('ASOCIAR_PAROS_SOLICITUD_MAN') + "</a>"
                        }
                    ],
                    sortable: false,
                    resizable: true,
                    selectable: true,
                    height: '95%',
                    pageable: false,
                    columns: [
                        //{
                        //    field: "colorSemaforo",
                        //    title: " ",
                        //    template: function (data) {
                        //        return "<div></div>"
                        //        //return self.ObtenerColorSemaforo(data);
                        //    },
                        //    width: "80px",
                        //    attributes: { style: "text-align:center;" }
                        //},
                        {
                            field: "MaquinaDescripcion", title: window.app.idioma.t("MAQUINA"),
                        },
                        {
                            field: "NumOT", title: window.app.idioma.t("NUM_OT"),
                        },
                        {
                            field: "EquipoConstructivoDescripcion", title: window.app.idioma.t("EQUIPO_CONSTRUCTIVO"),
                        },
                        {
                            field: "Estado", title: window.app.idioma.t("ESTADO"),
                        },
                        {
                            field: "EstadoDescripcion", title: window.app.idioma.t("DESCRIPCION_ESTADO"),
                        },
                        {
                            field: "DescripcionTipoAveria", title: window.app.idioma.t("TIPO_AVERIA"),
                        },
                        {
                            field: "DescripcionAveria", title: window.app.idioma.t("DESCRIPCION_AVERIA"),
                        },
                        {
                            field: "DescripcionProblema", title: window.app.idioma.t("DESCRIPCION_PROBLEMA"),
                        },
                        //{
                        //    field: "ComentarioCierre", title: window.app.idioma.t("COMENTARIO_CIERRE"),
                        //},
                        {
                            field: "FechaCreacion", title: window.app.idioma.t("FECHA_CREACION"),
                            template: '#: kendo.toString(new Date(FechaCreacion), kendo.culture().calendars.standard.patterns.MES_FechaHora) #',
                        },
                        //{
                        //    field: "FechaCierre", title: window.app.idioma.t("FECHA_CIERRE"),
                        //    template: '#: FechaCierre == null ? "N/A" : kendo.toString(new Date(FechaCierre), kendo.culture().calendars.standard.patterns.MES_FechaHora) #',
                        //},
                    ],
                }).data("kendoGrid");

            },
            events: {
                'click #btnAnadirSolicitud': 'AbrirModalAnadirSolicitud',
                'click #btnValidarArranque': 'AbrirModalValidarArranque',
                'click #btnCerrarSolicitud': 'AbrirModalCerrarSolicitud',
                'click #btnAsociarParo': 'AbrirModalAsociarParo',
            },
            AbrirModalAnadirSolicitud: function (e) {
                let self = this;

                //Creamos el div donde se va a pintar la ventana modal
                $("body").prepend($("<div id='dlgGestionSolicitud'></div>"));

                let datos = {
                    //numLinea: window.app.lineaSel.numLineaDescripcion,
                    Linea: window.app.lineaSel.id,
                    Usuario: { Id: window.app.sesion.attributes.usuarioId }
                }

                self.ConfigurarModal(e, datos);

            },
            AbrirModalValidarArranque: async function (e) {
                let self = this;

                // Obtenemos la línea seleccionada del grid
                let grid = $("#gridSolicitudesIntervencionTerminal").getKendoGrid();
                let datos = grid.dataItem(grid.select());

                if (datos == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                // Comprobamos que no esté ya cerrada
                if (datos.Estado == self.constEstadosMantenimiento.Cerrada || datos.CerradoEnJDE) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SOLICITUD_CERRADA'), 4000);
                    return
                }

                // Comprobamos que la OT requiera Validación de Arranque
                kendo.ui.progress($("#content"), true);

                try {
                    const datosVal = await self.CheckValidacionArranque(datos.NumOT);

                    kendo.ui.progress($("#content"), false);

                    if (!datosVal.ValidacionRequerida) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDACION_ARRANQUE_NO_REQUERIDA'), 4000);
                        return;
                    }

                    self.windowValArranque = new vistaValidacionArranqueOT({
                        parent: self, OT: datos.NumOT, datosValidacion: datosVal.DatosValidacion, read: false, callback: () => {
                            self.actualizarGrid();
                        }
                    });
                }                
                catch (er) {
                    kendo.ui.progress($("#content"), false);

                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CHECK_VALIDACION_ARRANQUE'), 4000);
                }
            },
            AbrirModalCerrarSolicitud: async function (e) {
                let self = this;

                // Obtenemos la línea seleccionada del grid
                let grid = $("#gridSolicitudesIntervencionTerminal").getKendoGrid();
                let datos = grid.dataItem(grid.select());

                if (datos == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                // Comprobamos que la OT requiera Validación de Arranque
                kendo.ui.progress($("#content"), true);

                try {
                    const datosVal = await self.CheckValidacionArranque(datos.NumOT);

                    kendo.ui.progress($("#content"), false);

                    if (datosVal.ValidacionRequerida && !datosVal.DatosValidacion) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDACION_ARRANQUE_REQUERIDA'), 4000);
                        return;
                    }

                    // Esta línea clona el objeto datos, para que no se modifique el objeto original de la tabla
                    datos = { ...datos };

                    // Comprobamos que no esté ya cerrada
                    if (datos.Estado == self.constEstadosMantenimiento.Cerrada || datos.CerradoEnJDE) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SOLICITUD_CERRADA'), 4000);
                        return
                    }

                    //Creamos el div donde se va a pintar la ventana modal
                    $("body").prepend($("<div id='dlgGestionSolicitud'></div>"));

                    self.ConfigurarModal(e, datos);
                }
                catch (er) {
                    kendo.ui.progress($("#content"), false);

                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CHECK_VALIDACION_ARRANQUE'), 4000);
                }
            },
            AbrirModalAsociarParo: function (e) {
                let self = this;

                // Obtenemos la línea seleccionada del grid
                let grid = $("#gridSolicitudesIntervencionTerminal").getKendoGrid();
                let datos = grid.dataItem(grid.select());

                if (datos == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                // Esta lína clona el objeto datos, para que no se modifique el objeto original de la tabla
                datos = { ...datos };

                //Creamos el div donde se va a pintar la ventana modal
                $("body").prepend($("<div id='dlgGestionSolicitud'></div>"));

                self.ConfigurarModal(e, datos);

            },
            ConfigurarModal: function (e, datos) {
                let self = this;

                let modo = e.target.id == "btnAnadirSolicitud" ? self.constOperacionesMantenimiento.Crear :
                    e.target.id == "btnCerrarSolicitud" ? self.constOperacionesMantenimiento.Cerrar :
                        self.constOperacionesMantenimiento.AsociarParo;

                let title;
                let template;
                let width = "700px";
                let height = "";


                switch (modo) {
                    case self.constOperacionesMantenimiento.Crear:
                        title = window.app.idioma.t('CREAR_SOLICITUD_MAN');
                        template = "../portal/Mantenimiento/html/CrearSolicitudEnvasado.html";
                        break;
                    case self.constOperacionesMantenimiento.Cerrar:
                        title = window.app.idioma.t('CERRAR_SOLICITUD_MAN');
                        template = "../portal/Mantenimiento/html/CerrarSolicitud.html";
                        break;
                    case self.constOperacionesMantenimiento.AsociarParo:
                        title = window.app.idioma.t('ASOCIAR_PAROS_SOLICITUD_MAN');
                        template = "../portal/Mantenimiento/html/AsociarSolicitud.html";
                        height = "90%";
                        width = "90%";
                        break;
                }

                self.ventanaGestion = $("#dlgGestionSolicitud").kendoWindow(
                    {
                        title: title,
                        width: width,
                        height: height,
                        content: template,
                        modal: true,
                        resizable: false,
                        draggable: false,
                        scrollable: false,
                        close: function () {
                            self.ventanaGestion.destroy();
                            self.ventanaGestion = null;
                        },
                        refresh: function () {
                            self.CargaContenidoModal(e, datos);
                            if (typeof self.ventanaGestion != "undefined") {
                                self.ventanaGestion.center();
                            }
                        }
                    }).getKendoWindow();
            },
            ConstruirModelo: function (datos) {
                var self = this;

                // Datos de los combos
                $("#dlgGestionSolicitud [data-model-name]").each(function () {
                    var kendoWidget = $(this).getKendoDropDownList();
                    if (kendoWidget) {
                        datos[$(this).attr('data-model-name')] = kendoWidget.value();
                    }                    
                });

                datos.DescripcionAveria = $("#tfDescripcionAveria").val();
                datos.DescripcionProblema = $("#tfDescripcionProblema").val();
                datos.ComentarioCierre = $("#tfComentarioCierre").val();
                datos.EsEnvasado = true;
            },
            CargaContenidoModal: function (e, datos) {
                let self = this;

                let modo = e.target.id == "btnAnadirSolicitud" ? self.constOperacionesMantenimiento.Crear :
                    e.target.id == "btnCerrarSolicitud" ? self.constOperacionesMantenimiento.Cerrar :
                        self.constOperacionesMantenimiento.AsociarParo;

                $("#trError").hide();
                // Para mostrar el teclado en pantalla
                this.$('.keyboardOn').addClass("ui-keyboard-input ui-widget-content ui-corner-all");
                KeyboardSettings.Load();

                $("#dlgGestionSolicitud [data-lng-key]").each(function () {
                    $(this).html(window.app.idioma.t($(this).attr('data-lng-key')))
                });

                $("#dlgGestionSolicitud [data-lng-val-key]").each(function () {
                    $(this).val(window.app.idioma.t($(this).attr('data-lng-val-key')))
                })

                $("#dlgGestionSolicitud [data-lng-title-key]").each(function () {
                    $(this).attr("title", window.app.idioma.t($(this).attr('data-lng-title-key')))
                })

                if (modo == self.constOperacionesMantenimiento.Crear) {
                    // ********* CREAR

                    $("#cmbMaquina").kendoDropDownList({
                        dataTextField: "Descripcion",
                        dataValueField: "CodigoMaquina",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: function (operation) {
                                    var idPadre = datos.Linea || "_";

                                    if (idPadre) {
                                        $.ajax({
                                            url: "../api/MaquinasLinea/" + idPadre + "/",
                                            dataType: "json",
                                            cache: false,
                                            success: function (response) {
                                                operation.success(response);
                                            },
                                            error: function (er) {
                                                operation.error(er);
                                            }
                                        })
                                    } else {
                                        operation.success([]);
                                    }

                                }
                            },
                            sort: { field: "CodigoMaquina", dir: "asc" },
                            schema: {
                                model: {
                                    id: "CodigoMaquina",
                                    fields: {
                                        'CodigoMaquina': { type: "string" },
                                        'Descripcion': { type: "string" },
                                    }
                                }
                            }
                        }),
                    }).bind("change", () => {
                        var dropDownList = $("#cmbEquipo").getKendoDropDownList();
                        if (!dropDownList) {
                            return;
                        }
                        dropDownList.value(null);
                        dropDownList._old = null;
                        dropDownList.dataSource.read();
                        RefrescarAlturaDropDownListKendo(dropDownList);
                        dropDownList.trigger("change");
                    });

                    $("#cmbEquipo").kendoDropDownList({
                        dataTextField: "Descripcion",
                        dataValueField: "CodigoEquipo",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: function (operation) {
                                    var idPadre = ($("#cmbMaquina").getKendoDropDownList()?.value() || "_").trim();

                                    if (idPadre) {
                                        $.ajax({
                                            url: "../api/EquiposConstructivosMaquina/" + idPadre + "/",
                                            dataType: "json",
                                            cache: false,
                                            success: function (response) {
                                                operation.success(response);
                                            },
                                            error: function (er) {
                                                operation.error(er);
                                            }
                                        })
                                    } else {
                                        operation.success([]);
                                    }

                                }
                            },
                            sort: { field: "CodigoEquipo", dir: "asc" },
                            schema: {
                                model: {
                                    id: "CodigoEquipo",
                                    fields: {
                                        'CodigoEquipo': { type: "string" },
                                        'Descripcion': { type: "string" },
                                    }
                                }
                            }
                        }),
                        height: 200
                    })

                    $("#cmbTipoAveria").kendoDropDownList({
                        dataTextField: "DescripcionAveria",
                        dataValueField: "IdTipoAveria",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: "../api/TiposAverias",
                                    dataType: "json",
                                }
                            },
                            error: function (e) {
                                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_TIPOS_AVERIAS'), 4000);
                                }
                            }
                        }),
                    });

                    // Creación de nueva solicitud
                    $("#btnGestionCrear").kendoButton({
                        click: function () {
                            $("#trError").hide();

                            if (!ValidarFormulario("CrearSolicitud")) {
                                // Faltan campos por rellenar
                                $("#trError").text(ObtenerCamposObligatorios("CrearSolicitud"));
                                $("#trError").show();
                                return;
                            }

                            self.ConstruirModelo(datos);

                            self.CrearSolicitud(datos);
                        }
                    });

                } else if (modo == self.constOperacionesMantenimiento.Cerrar) {
                    // ************ CERRAR

                    $("#crearOTProgramada").show();

                    // Cierre de solicitud
                    $("#btnGestionCerrar").kendoButton({
                        click: function () {
                            $("#trError").hide();

                            if (!ValidarFormulario("CerrarSolicitud")) {
                                // Faltan campos por rellenar
                                $("#trError").text(ObtenerCamposObligatorios("CerrarSolicitud"));
                                $("#trError").show();
                                return;
                            }
                            datos.ComentarioCierre = $("#tfComentarioCierre").val();

                            datos.OTProgramada = $("#cb_OTProgramada").is(":checked");

                            self.CerrarSolicitud(datos);
                        }
                    });
                } else {
                    // ************ ASOCIAR PARO
                    $("#lblParos").text(window.app.idioma.t('PAROS_PERDIDAS'));

                    $('#gridParos').kendoGrid({
                        dataSource: self.getParosDataSource(datos.Id),
                        filterable: {
                            extra: false,
                            messages: window.app.cfgKendo.configuracionFiltros_Msg,
                            operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                        },
                        scrollable: true,
                        selectable: false,
                        sortable: true,
                        pageable: false,
                        resizable: false,
                        height: $("#dlgGestionSolicitud").height() - 180,
                        columns: [
                            {
                                title: "",
                                template: '<input class="checkbox" type="checkbox"  style="width: 24px;	height: 24px" />',
                                width: 45,
                                attributes: { style: "text-align: center;" },
                                hidden: true
                            },
                            {
                                field: "justificado",
                                title: window.app.idioma.t("JUSTIFICADO"),
                                width: 90,
                                attributes: { style: "text-align: center;" },
                                template: function (registro) {
                                    if (registro.justificado) return "<img src='img/check.png' width='32' height='25' alt='Justificado'/>";
                                    else return "<img src='img/redball.png' width='32' height='32' alt='Justificado'/>";
                                },
                                filterable: false
                            },
                            {
                                field: "InicioLocal",
                                title: window.app.idioma.t("HORA"),
                                format: "{0:" + kendo.culture().calendar.patterns.MES_FechaHora + "}",
                                width: 150,
                                attributes: { style: "text-align: center; font-size: 22px" },
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
                                field: "IdTipoTurno",
                                template: "#if(IdTipoTurno){# #: window.app.idioma.t('TURNO'+IdTipoTurno) # #}#",
                                title: window.app.idioma.t("TURNO"),
                                width: 130,
                                attributes: { style: "text-align: center; font-size: 22px" },
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=IdTipoTurno#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t('TURNO'+IdTipoTurno)#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "IdTipoParoPerdida",
                                title: window.app.idioma.t("TIPO"),
                                template: "#=TipoParoPerdida#",
                                width: 150,
                                attributes: { style: "text-align: center; font-size: 22px" },
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            return "<div><label><input type='checkbox' value='#=IdTipoParoPerdida#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoParoPerdida#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "EquipoDescripcion",
                                title: window.app.idioma.t("LLENADORA"),
                                width: 170,
                                attributes: { style: "text-align: center; font-size: 22px" },
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            return "<div><label><input type='checkbox' value='#=EquipoDescripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= EquipoDescripcion#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "Duracion",
                                title: window.app.idioma.t("DURACION"),
                                width: 130,
                                attributes: { style: "text-align: center; font-size: 22px" },
                                format: "{0:HH:mm:ss}",
                                filterable: {
                                    extra: false,
                                    ui: function (element) {
                                        element.kendoTimePicker({
                                            format: "HH:mm:ss",
                                            culture: localStorage.getItem("idiomaSeleccionado")
                                        });
                                    }

                                }
                            },
                            {
                                field: "MotivoNombre",
                                title: window.app.idioma.t("MOTIVO"),
                                //width: 80,
                                attributes: { style: "text-align: center; font-size: 22px" },
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            return "<div><label><input type='checkbox' value='#=MotivoNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= MotivoNombre#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "CausaNombre",
                                title: window.app.idioma.t("CAUSA"),
                                //width: 80,
                                attributes: { style: "text-align: center; font-size: 22px" },
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            return "<div><label><input type='checkbox' value='#=CausaNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= CausaNombre#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "MaquinaCausaNombre",
                                title: window.app.idioma.t("MAQUINA_RESPONSABLE"),
                                //width: 100,
                                attributes: { style: "text-align: center; font-size: 22px" },
                                filterable: false
                            },
                        ],
                        // Seleccionamos en el grid los paros que ya están asignados
                        dataBound: e => { self.SeleccionarParosAsociados() },
                    });

                    // Click de las filas para seleccionarlas
                    $('#gridParos').getKendoGrid().table.on("click", "tr", self.SelectRow);

                    // asociación de paros a solicitud
                    $("#btnGestionAsociar").kendoButton({
                       click: function () {
                            $("#trError").hide();

                            let grid = $('#gridParos').getKendoGrid();
                            let paros = new Array();

                            // Obtenemos los paros seleccionados
                            grid.table.find(".k-state-selected").each((idx, i) => {
                                paros.push(grid.dataItem(i).Id);
                            })

                            datos.paros = paros;

                            self.AsociarParos(datos);
                       }
                    });
                };

                $("#btnGestionCancelar").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        self.CancelarFormulario();
                    }
                });

            },
            CancelarFormulario: function () {
                this.ventanaGestion.close();
            },
            getParosDataSource: function (idSolicitud) {
                let linea = window.app.lineaSel.id;
                let fecha = new Date();

                return new kendo.data.DataSource({
                    transport: {
                        read: {
                            type: "GET",
                            url: "../api/ParosPerdidasOTs/",
                            dataType: "json",
                            data: function () { 
                                return {
                                    idLinea: linea,
                                    idSolicitud: idSolicitud,
                                    fDesde: fecha.toISOString(),
                                    fHasta: null
                                }
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                Id: { type: "string", editable: false, nullable: false },
                                IdTipoParoPerdida: { type: "number" },
                                TipoParoPerdida: { type: "string" },
                                IdLinea: { type: "number" },
                                NumeroLineaDescripcion: { type: "string" },
                                DescLinea: { type: "string" },
                                Turno: { type: "string" },
                                FechaTurno: { type: "date" },
                                IdTipoTurno: { type: "string" },
                                NombreTipoTurno: { type: "string" },
                                InicioLocal: { type: "date" },
                                FinLocal: { type: "date" },
                                EquipoNombre: { type: "string" },
                                EquipoDescripcion: { type: "string" },
                                EquipoConstructivoNombre: { type: "string" },
                                EquipoConstructivoId: { type: "string" },
                                MaquinaCausaId: { type: "string" },
                                MaquinaCausaNombre: { type: "string" },
                                MotivoNombre: { type: "string" },
                                CausaNombre: { type: "string" },
                                Descripcion: { type: "string" },
                                Observaciones: { type: "string" },
                                Duracion: { type: "date" },
                                DuracionSegundos: { type: "number" },
                                DuracionMenores: { type: "number" },
                                DuracionBajaVel: { type: "number" },
                                NumeroParoMenores: { type: "number" },
                                MotivoID: { type: "number" },
                                CausaID: { type: "number" },
                                EquipoId: { type: "string" },
                                Justificado: { type: "number" },
                                Asociado: { type: "bool" }
                            },
                        },
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_PAROS_PERDIDAS_TURNO'), 4000);
                        }
                    }
                });
            },
            SelectRow: function () {
                let row = $(this)
                    , checked = row.hasClass("k-state-selected");

                if (checked) {
                    //-remove selection
                    row.removeClass("k-state-selected");
                } else {
                    //-select the row
                    row.addClass("k-state-selected");
                }
            },
            SeleccionarParosAsociados: function () {

                let grid = $("#gridParos").getKendoGrid();
                let dataSource = grid.dataSource;

                $.each(grid.items(), function (index, item) {
                    let uid = $(item).data("uid");
                    let dataItem = dataSource.getByUid(uid);

                    if (dataItem.Asociado) {
                        $(item).addClass("k-state-selected");
                    }
                });
            },
            CrearSolicitud: function (datos) {
                let self = this;

                kendo.ui.progress($(".k-window"), true)

                $.ajax({
                    type: "POST",
                    url: "../api/crearSolicitudIntervencionTerminal",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(datos),
                    complete: function () {
                        kendo.ui.progress($(".k-window"), false)
                        self.CancelarFormulario()
                    },
                    success: function (res) {
                        self.actualizarGrid();
                        if (res.correcto) {
                            Not.crearNotificacion('success', 'Mantenimiento', (window.app.idioma.t('SE_HA_GUARDADO_SOLICITUD_MANTENIMIENTO') || "").replaceAll("#ID", ""), 4000);
                        }
                        else
                        {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res.mensaje, 4000);
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GUARDAR_SOLICITUD_MANTENIMIENTO'), 4000);
                        }
                    }
                });

            },
            CheckValidacionArranque: async function (OT) {
                let self = this;

                return new Promise((resolve, reject) => {

                    $.ajax({
                        type: "GET",
                        url: "../api/ValidacionArranque/check/" + OT,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            resolve(res);
                        },
                        error: function (er) {
                            reject(er);
                        }
                    });
                });
            },
            CerrarSolicitud: function (datos) {
                let self = this;

                kendo.ui.progress($(".k-window"), true);

                $.ajax({
                    type: "POST",
                    url: "../api/cerrarSolicitudIntervencionTerminal",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(datos),
                    complete: function () {
                        kendo.ui.progress($(".k-window"), false);
                        self.CancelarFormulario();
                    },
                    success: function (res) {
                        if (res) {
                            self.actualizarGrid();
                            Not.crearNotificacion('success', 'Mantenimiento', (window.app.idioma.t('SE_HA_CERRADO_SOLICITUD_MANTENIMIENTO') || "").replaceAll("#ID", ""), 4000);
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), (window.app.idioma.t('ERROR_CERRAR_SOLICITUD_MANTENIMIENTO') || "").replaceAll("#ID", ""), 4000);
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), (window.app.idioma.t('ERROR_CERRAR_SOLICITUD_MANTENIMIENTO') || "").replaceAll("#ID", ""), 4000);
                        }
                    }
                });
            },
            AsociarParos: function (datos) {
                let self = this;

                kendo.ui.progress($(".k-window"), true);

                $.ajax({
                    type: "POST",
                    url: "../api/AsociarParosMantenimiento/" + datos.Id + "/",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(datos.paros),
                    complete: function () {
                        kendo.ui.progress($(".k-window"), false);
                        self.CancelarFormulario()
                    },
                    success: function (res) {

                        if (res) {
                            self.actualizarGrid();
                            Not.crearNotificacion('success', 'Mantenimiento', (window.app.idioma.t('SE_HAN_ASOCIADO_PAROS_MANTENIMIENTO') || "").replaceAll("#ID", datos.Id), 4000);
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), (window.app.idioma.t('ERROR_ASOCIANDO_PAROS_MANTENIMIENTO') || "").replaceAll("#ID", datos.Id), 4000);
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), (window.app.idioma.t('ERROR_ASOCIANDO_PAROS_MANTENIMIENTO') || "").replaceAll("#ID", datos.Id), 4000);
                        }
                    }
                });
            },
            actualizarGrid: function () {
                var self = this;

                self.dsSolicitudes.read();
            },
            eliminar: function() {
                Backbone.off('eventcambioPuesto');
               
                $("#center-pane").css("overflow", "");
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            }, 
            actualiza: function () {
                this.render();
            }
        });

        return VistaSolicitudIntervencion;
    });