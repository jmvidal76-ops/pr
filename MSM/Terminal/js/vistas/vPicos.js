define(['underscore', 'backbone', 'jquery', 'text!../../html/picos.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', '../../../scripts/utils'],
    function (_, Backbone, $, PlantillaPicos, VistaDlgConfirm, Not, utils) {
        var Picos = Backbone.View.extend({
            template: _.template(PlantillaPicos),
            grid: null,
            requests: [],
            turno: null,
            vistaConfirmacion: null,
            ds: null,
            ordenesIntervalo: null,
            tiposTurno: [],
            tipoTurno: null,
            initialize: function (options) {
                Backbone.on('eventCambioTurnoActual', this.actualiza, this);
                var self = this;

                self.initializeData();
                self.cargaDatosInicial();
                self.render();
            },
            initializeData: function () {
                var self = this;
                self.grid = null;
                self.turno = null;
                self.vistaConfirmacion = null;
                self.ds = null;
                self.ordenesIntervalo = null;
                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: function (operation) {
                            if (self.turno) {
                                $.ajax({
                                    url: "../api/obtenerPicos/" + self.turno.Id + "/",
                                    dataType: "json",
                                    success: function (response) {
                                        operation.success(response); //mark the operation as successful
                                    }
                                });
                            }
                            else {
                                operation.success([]);
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: "IdPico",
                            fields: {
                                idPico: { type: "number", editable: false, nullable: false },
                                particion: { type: "string" },
                                turno: { type: "number" },
                                cantidad: { type: "number" },
                                descProducto: { type: "string" },
                                codProducto: { type: "number" },
                                OrdenEstadoActual: { type: "string" },
                                fechaTurno: { type: "date" },
                                idTipoTurno: { type: "number" },
                                SSCC: { type: "string" },
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            $("#center-pane").empty();
                        }
                    },
                    sort: { field: "IdPico", dir: "desc" }
                });

                $.ajax({
                    type: "GET",
                    url: "../api/tiposTurnosFabrica/",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.tiposTurno = data.filter(function (item) {
                        return item.id > 0 && item.id <= 3;
                    });
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_TIPOS_TURNO'), 4000);
                    }
                });
            },
            cambiarFechaYTipoTurno: function (fecha, tipoTurno) {
                let self = this;

                if (!tipoTurno) {
                    tipoTurno = self.getTipoTurno(fecha)
                }

                if (tipoTurno == 3 && fecha.getHours < 12) {
                    fecha._addDays(-1)
                }

                self.tipoTurno = tipoTurno

                self.$("#fechaFiltro").data("kendoDatePicker").value(fecha.midday());
                self.$("#ddlTurno").data("kendoDropDownList").value(self.tipoTurno);

            },
            cargaDatosInicial: function () {
                let self = this;

                let fecha = new Date();
                self.tipoTurno = self.getTipoTurno(fecha);

                setTimeout(() => {
                    if (!window.app.vistaPrincipal.cargandoTurno) {
                        self.cargaDatosTurno(window.app.vistaPrincipal.turnoActual);
                    }
                })
            },
            cargaTurno: async function (idTurno, fecha, idLinea, fechaInicio, fechaFin) {
                let self = this;

                return new Promise((resolve, reject) => {

                    var req = $.ajax({
                        type: "GET",
                        url: `../api/turnos/breaks?idLinea=${idLinea}${fecha ? '&fechaActual=' + fecha.toISOString() : ''}${idTurno ? '&idturno=' + idTurno : ''}` +
                            `${fechaInicio ? '&fechaInicio=' + fechaInicio.toISOString() : ''}${fechaFin ? '&fechaFin=' + fechaFin.toISOString() : ''}`,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            let turnoActual;
                            if (res.length > 0) {
                                turnoActual = res[0];
                            }

                            resolve(turnoActual);
                        },
                        error: function (e) {
                            if (e.statusText == "abort") {
                                return;
                            }
                            reject(e);
                        }
                    });

                    self.requests.push(req);
                })
            },
            cargaTurnoConsecutivo: async function (anterior, idTurno, fecha, idLinea) {
                let self = this;

                return new Promise((resolve, reject) => {

                    let req = $.ajax({
                        type: "GET",
                        url: `../api/turnos/breaksConsecutivo?anterior=${anterior.toString()}&idLinea=${idLinea}${idTurno ? '&idturno=' + idTurno : ''}${fecha ? '&fechaActual=' + fecha.toISOString() : ''}`,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {

                            resolve(res);
                        },
                        error: function (e) {
                            if (e.statusText == "abort") {
                                return;
                            }
                            e.type = `TURNO_${anterior ? "ANTERIOR" : "SIGUIENTE"}`
                            reject(e);
                        }
                    });

                    self.requests.push(req)
                })
            },
            cargaDatosTurno: function (turno) {
                let self = this;

                kendo.ui.progress($("#panelDatos"), true);
                // Cancelamos todas las request pendientes
                for (let r of self.requests) {
                    r.abort()
                }

                self.requests = [];

                self.turno = turno;
                self.mostrarDatosTurno();
            },
            mostrarDatosTurno: function() {
                let self = this;

                kendo.ui.progress($("#panelDatos"), false);

                if (!self.turno) {
                    Not.crearNotificacion('', '', window.app.idioma.t('ERROR_NO_TURNOS_LINEA_FECHA'), 4000);

                    self.$("#btnNuevoPico").prop("disabled", true).addClass("k-state-disabled");
                }
                else {
                    self.$("#btnNuevoPico").prop("disabled", false).removeClass("k-state-disabled");                    
                }

                $("#gridPicos").getKendoGrid().dataSource.read();

            },
            obtenerFechaFiltros: function (inicio = true) {
                let self = this;

                let dt = self.$("#fechaFiltro").data("kendoDatePicker").value();
                let tipoTurno = Number(self.$("#ddlTurno").data("kendoDropDownList").value());

                if (!dt) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FECHA_INCORRECTA'), 3000);
                    return null
                }

                let tTurno = self.tiposTurno.find(f => f.id == tipoTurno)
                let dateYear = dt.getFullYear()

                let time = new Date((inicio ? tTurno.inicio : tTurno.fin).replace("1899", dateYear)).getHours()

                dt = new Date(dt.setHours(time, 0, 0, 0))
                if (!inicio && tipoTurno == 3 && dt.getHours() > 0) {
                    dt._addDays(1)
                }

                return dt

            },
            turnoSeleccionado: async function () {
                let self = this;

                let dt = self.$("#fechaFiltro").data("kendoDatePicker").value();
                let tipoTurno = Number(self.$("#ddlTurno").data("kendoDropDownList").value());

                if (!dt) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FECHA_INCORRECTA'), 3000);
                    return
                }
                kendo.ui.progress($("#panelDatos"), true);

                // si el turno seleccionado es el actual, podemos ahorrarnos la llamada para obtenerlo ya que siempre está cargado en la vistaPrincipal
                let actualDt = new Date();
                let actualTipoTurno = self.getTipoTurno(actualDt);
                if (actualTipoTurno == 3) {
                    actualDt._addDays(-1)
                }

                if (actualDt.toDateString() == dt.toDateString() && actualTipoTurno == tipoTurno) {
                    self.cargaDatosTurno(window.app.vistaPrincipal.turnoActual)
                }
                else {

                    let fechaTurnoInicio = self.obtenerFechaFiltros();
                    let fechaTurnoFin = self.obtenerFechaFiltros(false);
                    try {
                        let turno = await self.cargaTurno(null, null, window.app.lineaSel.id, fechaTurnoInicio, fechaTurnoFin);

                        self.cargaDatosTurno(turno);
                    }
                    catch (er) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_TURNOS'), 4000);
                        kendo.ui.progress($("#panelDatos"), false);
                    }
                }
            },
            irTurnoActual: function () {
                var turnoActual = window.app.vistaPrincipal.turnoActual
                this.cambiarFechaYTipoTurno(new Date(), turnoActual ? turnoActual.IdTipoTurno : null)
                this.cargaDatosTurno(turnoActual)
            },
            moverTurnoAtras: async function () {
                let self = this;
                let turnoCargar;
                let idLinea = window.app.lineaSel.id;

                kendo.ui.progress($("#panelDatos"), true);

                try {
                    if (self.turno) {
                        turnoCargar = await self.cargaTurnoConsecutivo(true, self.turno.Id, null, idLinea)
                    }
                    else {
                        let fechaTurno = self.obtenerFechaFiltros();
                        if (!fechaTurno) {
                            kendo.ui.progress($("#panelDatos"), false);
                            return
                        }

                        turnoCargar = await self.cargaTurnoConsecutivo(true, null, fechaTurno, idLinea)
                    }
                }
                catch (er) {
                    kendo.ui.progress($("#panelDatos"), false);
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_TURNO_ANTERIOR'), 4000);
                    return
                }

                if (!turnoCargar) {
                    kendo.ui.progress($("#panelDatos"), false);
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_TURNO_PLANIFICADO'), 4000);
                    return;
                }
                self.cambiarFechaYTipoTurno(new Date(turnoCargar.Fecha), turnoCargar.IdTipoTurno)
                self.cargaDatosTurno(turnoCargar)
            },
            moverTurnoAdelante: async function () {
                let self = this;
                let turnoCargar;
                let idLinea = window.app.lineaSel.id;

                kendo.ui.progress($("#panelDatos"), true);

                try {
                    if (self.turno) {
                        turnoCargar = await self.cargaTurnoConsecutivo(false, self.turno.Id, null, idLinea)
                    }
                    else {
                        let fechaTurno = self.obtenerFechaFiltros(false);
                        if (!fechaTurno) {
                            kendo.ui.progress($("#panelDatos"), false);
                            return
                        }

                        turnoCargar = await self.cargaTurnoConsecutivo(false, null, fechaTurno, idLinea)
                    }
                }
                catch (er) {
                    kendo.ui.progress($("#panelDatos"), false);
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_TURNO_SIGUIENTE'), 4000);
                    return
                }

                if (!turnoCargar) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_TURNO_PLANIFICADO'), 4000);
                    kendo.ui.progress($("#panelDatos"), false);
                    return;
                }
                self.cambiarFechaYTipoTurno(new Date(turnoCargar.Fecha), turnoCargar.IdTipoTurno)
                self.cargaDatosTurno(turnoCargar)
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());

                self.$("#fechaFiltro").kendoDatePicker({
                    value: new Date(),
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                self.$("#ddlTurno").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: self.tiposTurno,
                    value: self.tipoTurno
                });

                self.$("#btnTurnoActual").kendoButton({ imageUrl: "img/time.png" });

                self.grid = self.$("#gridPicos").kendoGrid({
                    dataSource: self.ds,
                    autoBind: false,
                    toolbar: [{
                        name: "Nueva",
                        text: window.app.idioma.t('NUEVO_PICO'),
                        template: "<a class='k-button' id='btnNuevoPico' style='margin-left:20px;font-size:22px;float:right;'><img src='img/add.png' style='margin-right:3px;'/>" + window.app.idioma.t('NUEVO_PICO') + "</a>"
                    }],
                    scrollable: false,
                    selectable: false,
                    filterable: false,
                    sortable: false,
                    pageable: false,
                    columns: [
                        {
                            field: "codProducto",
                            title: window.app.idioma.t('CODIGO_PRODUCTO'),
                            width: 150,
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        {
                            field: "descProducto",
                            title: window.app.idioma.t('PRODUCTO'),
                            width: 360,
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        {
                            field: "idPico",
                            hidden: true,
                            title: window.app.idioma.t('ID_PICO'),
                            width: 70,
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        {
                            field: "particion",
                            title: window.app.idioma.t('IDORDEN'),
                            width: 360,
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        {
                            field: "SSCC",
                            title: window.app.idioma.t('SSCC_2'),
                            width: 360,
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        {
                            field: "cantidad",
                            title: window.app.idioma.t('CANTIDAD'),
                            width: 250,
                            attributes: { style: "text-align: center; font-size: 22px" }
                        },
                        {
                            width: 200,
                            command: { template: "<a id='btnEditarPico'class='k-button k-grid-edit' style='text-align: center;min-width:16px;font-size: 22px'>" + window.app.idioma.t('EDITAR') + "</a>" }
                        },
                        {
                            width: 200,
                            command: { template: "<a id='btnEliminarPico'class='k-button k-grid-edit' style='text-align: center;min-width:16px;font-size: 22px'>" + window.app.idioma.t('ELIMINAR') + "</a>" }
                        },
                    ]
                }).data("kendoGrid");

            },
            events: {
                "click #btnNuevoPico": "abrirDialogoPico",
                "click #btnEditarPico": "abrirDialogoPico",
                "click #btnTurnoActual": "irTurnoActual",
                "click #btnTurnoAtras": "moverTurnoAtras",
                "click #btnTurnoAdelante": "moverTurnoAdelante",
                "click #btnEliminarPico": function (e) {
                    var self = this;
                    var permiso = TienePermiso(90);

                    if (!permiso) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                        return;
                    }
                    var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                    var data = self.grid.dataItem(tr);

                    if (data.SSCC != "Creado manualmente") {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_EDITAR_ELIMINAR_PICO_AUTOMATICO'), 3000);
                        return;
                    }

                    if (data.OrdenEstadoActual === "Cerrada") {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ELIMINAR_PICO'), 3000);
                        return;
                    }

                    data.linea = window.app.lineaSel.id;

                    self.vistaConfirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('ELIMINAR_PICO'),
                        msg: window.app.idioma.t('DESEA_REALMENTE_ELIMINAR_PICO'),
                        funcion: function () { self.eliminarPico(data); },
                        contexto: this
                    });
                },
                "change #fechaFiltro": "turnoSeleccionado",
                "change #ddlTurno": 'turnoSeleccionado'
            },
            eliminar: function () {
                // same as this.$el.remove();
                Backbone.off('eventCambioTurnoActual');
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            actualiza: function () {
                var self = this;

                self.turno = null;
                self.turnoSeleccionado();
            },
            getTipoTurno: function (fecha) {
                var self = this;
                var tipoTurno = null;
                var turno = window.app.planta.turnoActual[window.app.lineaSel.numLinea - 1];
                if (turno && turno.turnoProductivo) {
                    tipoTurno = turno.tipo.id;
                } else {
                    var tTurno = self.getTipoTurnoFecha(fecha);
                    if (tTurno) {
                        tipoTurno = tTurno;
                    }
                }
                return tipoTurno;
            },
            getTipoTurnoFecha: function (fecha) {
                var self = this;

                let turnOffset = GetHourFromDate(self.tiposTurno[0].inicio, fecha);
                let result = 1;

                let turnHour = fecha.getHours() - turnOffset + fecha.getMinutes() / 60;
                if (turnHour < 0) {
                    turnHour += 24;
                }

                for (let tt of self.tiposTurno) {
                    let start = GetHourFromDate(tt.inicio, fecha) - turnOffset;
                    let end = GetHourFromDate(tt.fin, fecha) - turnOffset;

                    if (start < 0) start += 24;
                    if (end <= 0) end += 24;

                    if (start > end) {
                        // Turno que cruza medianoche
                        if (turnHour >= start || turnHour < end) {
                            result = tt.id;
                            break;
                        }
                    } else {
                        if (turnHour >= start && turnHour < end) {
                            result = tt.id;
                            break;
                        }
                    }
                }

                return result;
            },
            abrirDialogoPico: function (e) {
                var self = this;
                var permiso = TienePermiso(90);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                if (self.turno) {
                    var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                    var data = self.grid.dataItem(tr);

                    if (e.target.id && e.target.id === "btnEditarPico" && data.SSCC != "Creado manualmente") {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_EDITAR_ELIMINAR_PICO_AUTOMATICO'), 3000);
                        return;
                    }

                    if (e.target.id && e.target.id === "btnEditarPico" && data.OrdenEstadoActual === "Cerrada") {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITAR_PICO'), 4000);
                        return;
                    }

                    //Creamos el div donde se va a pintar la ventana modal
                    $("body").prepend($("<div id='dlgDatosPico'></div>"));

                    if (e.target.id && e.target.id == "btnNuevoPico") {
                        if (self.turno) { // agomezn 080716: 102 Al crear en Picos un nuevo pico los desplegables de la ventana modal aparecen vacíos si el turno no es productivo
                            self.configurarDialogoPico(e, data);
                        }
                    } else {
                        self.configurarDialogoPico(e, data);
                    }

                    self.ventanaEditarCrear = $('#dlgDatosPico').data("kendoWindow");
                    if (typeof self.ventanaEditarCrear != "undefined") {
                        self.ventanaEditarCrear.center();
                    }
                }
            },
            configurarDialogoPico: function (e, data) {
                var self = this;

                $("#dlgDatosPico").kendoWindow(
                {
                    title: (e.target.id == "btnNuevoPico") ? window.app.idioma.t('NUEVO_PICO') : window.app.idioma.t('EDITAR_PICO'),
                    width: "500px",
                    height: "700px",
                    content: "html/EditarPicos.html",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    scrollable: false,
                    close: function () {
                        self.ventanaEditarCrear.destroy();
                        self.ventanaEditarCrear = null;
                    },
                    refresh: function () {
                        self.cargaContenidoDialogo(e, data);
                    }
                });
            },
            cargaContenidoDialogo: function (e, edicion) {
                var self = this;

                $("#trError").hide();
                $("#lblOrden").text(window.app.idioma.t('IDORDEN'));
                $("#lblCantidad").text(window.app.idioma.t('CANTIDAD_PICOS'));
                $("#trError").text(window.app.idioma.t('CAMPOS_OBLIGATORIOS'));

                $("#cmbOrden").kendoDropDownList({
                    dataTextField: "id",
                    dataValueField: "id",
                    template: "#: producto.codigo # | #: producto.nombre # | #: id # ",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    enable: self.turno != null,
                });

                var datos = {};
                datos.idLinea = window.app.lineaSel.id;
                datos.fechaInicio = new Date(self.turno.FechaInicio);
                datos.fechaFin = new Date(self.turno.FechaFin);
                self.obtenerOrdenesTurno(datos);

                var ds = new kendo.data.DataSource({
                    data: self.ordenesIntervalo,
                });

                var comboOrdenes = $("#cmbOrden").data("kendoDropDownList");
                comboOrdenes.setDataSource(ds);

                if (ds.total() == 1) {
                    comboOrdenes.select(1);
                }

                $("#ntxtCantidad").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    min: 0,
                    enable: self.turno != null,
                    format: "#",
                    decimals: 0
                });

                $("#btnCancelarEditarCrear").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        self.cancelarFormulario();
                    }
                });

                if ((e.target.id && e.target.id == "btnNuevoPico") || (e.currentTarget.id && e.currentTarget.id == 'btnNuevoPico')) { //Nuevo Pico
                    $("#btnAceptarEditarCrear").kendoButton({
                        click: function () {
                            var pico = {};
                            pico.particion = $("#cmbOrden").data("kendoDropDownList").value();
                            pico.turno = self.turno.Id;
                            pico.cantidad = $("#ntxtCantidad").data("kendoNumericTextBox").value();
                            pico.linea = window.app.lineaSel.id;
                            pico.fechaTurno = $("#fechaFiltro").data("kendoDatePicker").value();
                            pico.idTipoTurno = $("#ddlTurno").data("kendoDropDownList").value();

                            if (pico.cantidad > 0 && pico.particion != "") {
                                self.vistaConfirmacion = new VistaDlgConfirm({
                                    titulo: window.app.idioma.t('CREAR_PICO'),
                                    msg: window.app.idioma.t('DESEA_REALMENTE_CREAR_EL'),
                                    funcion: function () { self.crearPico(pico); },
                                    contexto: this
                                });
                            } else {
                                $("#trError").show();
                            }
                        }
                    });
                } else { //Edicion de pico
                    if (edicion != null) {
                        $("#cmbOrden").data("kendoDropDownList").value(edicion.particion);
                        $("#ntxtCantidad").data("kendoNumericTextBox").value(edicion.cantidad);

                        $("#btnAceptarEditarCrear").kendoButton({
                            click: function () {
                                edicion.particion = $("#cmbOrden").data("kendoDropDownList").value();
                                edicion.cantidad = $("#ntxtCantidad").data("kendoNumericTextBox").value();
                                edicion.linea = window.app.lineaSel.id;
                                edicion.turno = self.turno.Id;

                                if (edicion.cantidad > 0 && edicion.particion != "") {
                                    self.vistaConfirmacion = new VistaDlgConfirm({
                                        titulo: window.app.idioma.t('MODIFICAR_PICO'),
                                        msg: window.app.idioma.t('DESEA_REALMENTE_MODIFICAR_EL'),
                                        funcion: function () { self.editarPico(edicion); },
                                        contexto: this
                                    });
                                } else {
                                    $("#trError").show();
                                }
                            }
                        });
                    }
                }
            },
            obtenerOrdenesTurno: function (datos) {
                var self = this;

                $.ajax({
                    type: "POST",
                    url: "../api/ordenes/obtenerOrdenesLineaTurno/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    async: false
                }).done(function (ordenes) {
                    self.ordenesIntervalo = ordenes;
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ORDENES_INTERVALO'), 4000);
                    }
                });
            },
            eliminarPico: function (pico) {
                var self = this;

                $.ajax({
                    type: "POST",
                    url: "../api/eliminarPico",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(pico),
                    success: function (res) {
                        if (res) {
                            self.actualizarGrid();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_ELIMINADO_CORRECTAMENTE_EL'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_BORRAR_EL_PICO'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (e) {
                        Backbone.trigger('eventCierraDialogo');
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_BORRAR_EL_PICO'), 4000);
                        }
                    }
                });
            },
            crearPico: function (pico) {
                var self = this;

                $.ajax({
                    type: "POST",
                    url: "../api/crearPico",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(pico),
                    success: function (res) {
                        if (res) {
                            self.actualizarGrid();
                            Not.crearNotificacion('success', 'Picos', window.app.idioma.t('SE_HA_CREADO_CORRECTAMENTE_EL_PICO'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_REGISTRO_DE_PICO'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (e) {
                        Backbone.trigger('eventCierraDialogo');
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CREAR_EL_PICO'), 4000);
                        }
                    }
                });

                this.ventanaEditarCrear.close();
            },
            editarPico: function (edicion) {
                var self = this;
                $.ajax({
                    type: "POST",
                    url: "../api/modificarPico",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(edicion),
                    success: function (res) {
                        if (res) {
                            self.actualizarGrid();
                            Not.crearNotificacion('success', 'Picos', window.app.idioma.t('SE_HA_MODIFICADO_CORRECTAMENTE'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (e) {
                        Backbone.trigger('eventCierraDialogo');
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_EL_PICO'), 4000);
                        }
                    }
                });

                this.ventanaEditarCrear.close();
            },
            cancelarFormulario: function () {
                this.ventanaEditarCrear.close();
            },
            actualizarGrid: function () {
                var self = this;

                if (self.turno) {
                    self.ds.read();
                }
                else {
                    $("#gridPicos").data("kendoGrid").dataSource.data([]);
                    self.ordenesIntervalo = null;
                }
            },
        });

        return Picos;
    });