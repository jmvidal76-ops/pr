define(['underscore', 'backbone', 'jquery', 'vistas/vDialogoConfirm', 'compartido/notificaciones', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, VistaDlgConfirm, Not, definiciones) {
        var gridPicos = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLPicos',
            ds: null,
            grid: null,
            ordenParticion: null,
            turnos: null,
            vistaConfirmacion: null,
            fechaInicioWo: null,
            fechaFinWo: null,
            constantes: definiciones.TipoTurnos(),
            initialize: function (ordenPartic) {
                var self = this;
                self.ordenParticion = ordenPartic;

                if (self.ordenParticion.estadoActual.nombre != "Cancelada" && self.ordenParticion.estadoActual.nombre != "Iniciando") {
                    self.obtenerTurnos();

                    if (self.turnos.length == 0) {
                        self.fechaInicioWo = new Date(self.ordenParticion.dFecFinLocal).getFullYear() == 0 ? new Date() : new Date(self.ordenParticion.dFecFinLocal);
                        self.fechaFinWo = self.fechaInicioWo;
                    } else {
                        self.fechaInicioWo = new Date(self.turnos[0].fecha);
                        self.fechaFinWo = new Date(self.turnos[self.turnos.length - 1].fecha);
                    }
                }

                self.render();
            },
            render: function () {
                var self = this;

                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/obtenerPicosOrdenParticion/" + self.ordenParticion.id + "/",
                            dataType: "json"
                        },
                    },
                    pageSize: 5,
                    schema: {
                        model: {
                            id: "idPico",
                            fields: {
                                SSCC: { type: "string" },
                                fechaTurno: { type: "date" },
                                idTipoTurno: { type: "number" },
                                cantidad: { type: "number" },
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    },
                });

                var toolbarTemplate = null;

                if (self.ordenParticion.estadoActual.nombre != "Cancelada" && self.ordenParticion.estadoActual.nombre != "Iniciando") {
                    toolbarTemplate = [{
                        template: "<a id='btnNuevoPico' class='k-button k-button-icontext k-grid-add' style='background-color: green; color: white;'><span class='k-icon k-add'></span>" + window.app.idioma.t('NUEVO_PICO') + "</a>"
                    }]
                }

                self.grid = $(self.el).kendoGrid({
                    dataSource: self.ds,
                    toolbar: toolbarTemplate,
                    resizable: true,
                    scrollable: true,
                    sortable: false,
                    filterable: false,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        //pageSizes: [50, 100, 200],
                        //buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            command: {
                                template: "<a id='btnEditarPico' class='k-button k-grid-edit' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                            },
                            title: window.app.idioma.t("EDITAR"),
                            width: 100
                        },
                        {
                            command: {
                                template: "<a id='btnEliminarPico' class='k-button k-grid-delete' style='min-width:16px;'><span class='k-icon k-delete'></span></a>"
                            },
                            title: window.app.idioma.t("ELIMINAR"),
                            width: 100
                        },
                        {
                            field: "SSCC",
                            title: window.app.idioma.t('SSCC_2'),
                        },
                        {
                            field: "fechaTurno",
                            title: window.app.idioma.t('FECHA'),
                            template: '#= kendo.toString(new Date(fechaTurno),kendo.culture().calendars.standard.patterns.MES_Fecha)#'
                        },
                        {
                            field: "TipoTurno",
                            title: window.app.idioma.t('TIPO_TURNO'),
                        },
                        {
                            field: "cantidad",
                            title: window.app.idioma.t('CANTIDAD'),
                            template: '<div style="text-align:right;">#=kendo.toString(cantidad, "n0") #</div>',
                        },
                    ],
                }).data("kendoGrid");

                return self; // enable chained calls
            },
            events: {
                'click #btnNuevoPico': 'abrirPico',
                'click #btnEditarPico': 'abrirPico',
                'click #btnEliminarPico': 'confirmarBorrado'
            },
            abrirPico: function (e) {
                var self = this;
                var permiso = false;

                if (self.ordenParticion.id.includes('.')) {
                    for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                        if (window.app.sesion.attributes.funciones[i].id === 13)
                            permiso = true;
                    }
                } else {
                    for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                        if (window.app.sesion.attributes.funciones[i].id === 198)
                            permiso = true;
                    }
                }

                if (permiso) {
                    var data = null;

                    if (e.currentTarget.id == "btnEditarPico") {
                        // Obtenemos la línea seleccionada del grid
                        var tr = $(e.target.parentNode.parentNode).closest("tr");
                        // get the data bound to the current table row
                        data = self.grid.dataItem(tr);
                        if (data.SSCC != "Creado manualmente") {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_EDITAR_ELIMINAR_PICO_AUTOMATICO'), 3000);
                            return;
                        }
                    }

                    //Creamos el div donde se va a pintar la ventana modal
                    $("body").prepend($("<div id='divDatosPico'></div>"));

                    self.configurarModalPico(e, data);

                    self.ventanaCrearEditar = $('#divDatosPico').data("kendoWindow");
                    if (typeof self.ventanaCrearEditar != "undefined") {
                        self.ventanaCrearEditar.center();
                    }
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                }
            },
            configurarModalPico: function (e, data) {
                var self = this;

                $("#divDatosPico").kendoWindow(
                    {
                        title: (e.currentTarget.id == "btnNuevoPico") ? window.app.idioma.t('NUEVO_PICO') : window.app.idioma.t('EDITAR_PICO'),
                        width: "430px",
                        height: "165px",
                        content: "Envasado/html/EditarPicos.html",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        scrollable: false,
                        close: function () {
                            self.ventanaCrearEditar.destroy();
                            self.ventanaCrearEditar = null;
                        },
                        refresh: function () {
                            self.cargarContenido(data);
                        }
                    });
            },
            cargarContenido: function (edicion) {
                var self = this;

                $("#lblFechaTurno").text(window.app.idioma.t('FECHA'));
                $("#lblTurno").text(window.app.idioma.t('TURNO'));
                $("#lblCantidad").text(window.app.idioma.t('CANTIDAD'));
                $("#trError").hide();
                $("#trError").text(window.app.idioma.t('CAMPOS_OBLIGATORIOS'));

                $("#dpFechaTurno").kendoDatePicker({
                    value: self.fechaFinWo,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    min: self.fechaInicioWo,
                    max: self.fechaFinWo,
                    change: function () { self.cambiaFecha(edicion); }
                })

                $("#cmbTurno").kendoDropDownList({
                    dataValueField: "tipo.id",
                    dataTextField: "tipo.nombre",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#txtCantidad").kendoNumericTextBox({
                    decimals: 0,
                    min: 0,
                    format: "#"
                });

                if (edicion === null) {
                    $("#dpFechaTurno").data("kendoDatePicker").trigger("change");
                } else {
                    $("#dpFechaTurno").data("kendoDatePicker").value(edicion.fechaTurno);
                    $("#dpFechaTurno").data("kendoDatePicker").trigger("change");
                    $("#txtCantidad").data("kendoNumericTextBox").value(edicion.cantidad);
                }

                $("#btnCancelarPico").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        self.ventanaCrearEditar.close();
                    }
                });

                $("#btnAceptarPico").kendoButton({
                    click: function () {
                        var fechaTurno = $("#dpFechaTurno").data("kendoDatePicker").value();
                        var tipoTurno = $("#cmbTurno").data("kendoDropDownList").value();

                        var pico = {};
                        pico.idPico = edicion === null ? 0 : edicion.idPico;
                        pico.linea = self.ordenParticion.idLinea;
                        pico.particion = self.ordenParticion.id.includes('.') ? self.ordenParticion.id : self.ordenParticion.id.concat(".1");
                        pico.cantidad = $("#txtCantidad").data("kendoNumericTextBox").value();
                        pico.fechaTurno = fechaTurno;
                        pico.idTipoTurno = tipoTurno;

                        if (fechaTurno != null && tipoTurno != "" && pico.cantidad > 0) {
                            pico.turno = self.turnos.filter(function (item) {
                                return new Date(item.fecha).getTime() == fechaTurno.getTime() && item.tipo.id == tipoTurno;
                            })[0].idTurno;

                            self.vistaConfirmacion = new VistaDlgConfirm({
                                titulo: edicion === null ? window.app.idioma.t('CREAR_PICO') : window.app.idioma.t('MODIFICAR_PICO'),
                                msg: edicion === null ? window.app.idioma.t('DESEA_REALMENTE_CREAR_EL') : window.app.idioma.t('DESEA_REALMENTE_MODIFICAR_EL'),
                                funcion: function () { self.crearEditarPico(pico, edicion); },
                                contexto: this
                            });
                        } else {
                            $("#trError").show();
                        }
                    }
                });
            },
            obtenerTurnos: function () {
                var self = this;

                var data = {};
                data.numLinea = self.ordenParticion.numLinea;
                data.idParticion = self.ordenParticion.id;
                //data.fechaInicio = self.fechaInicioWo;
                //data.fechaFin = self.fechaFinWo;

                $.ajax({
                    type: "POST",
                    async: false,
                    url: "../api/obtenerTurnosOrden/",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(data),
                }).done(function (turnos) {
                    self.turnos = turnos;
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_TURNOS'), 4000);
                    }
                });
            },
            cambiaFecha: function (edicion) {
                var self = this;
                var fecha = $("#dpFechaTurno").data("kendoDatePicker").value();

                if (fecha != null) {
                    self.filtrarTurnos(fecha, edicion);
                }
            },
            filtrarTurnos: function (fecha, edicion) {
                var self = this;

                var turnosFecha = self.turnos.filter(function (turno) {
                    return new Date(fecha.setHours(0, 0, 0, 0)).getTime() === new Date(turno.fecha).getTime();
                });

                var comboTurnos = $("#cmbTurno").data('kendoDropDownList');
                comboTurnos.setDataSource(turnosFecha);

                if (edicion === null) {
                    comboTurnos.select(0);
                } else {
                    $("#cmbTurno").data("kendoDropDownList").value(edicion.idTipoTurno);
                }
            },
            crearEditarPico: function (pico, edicion) {
                var self = this;
                var url = edicion === null ? "../api/crearPico" : "../api/modificarPico";
                var mensajeOk = edicion === null ? window.app.idioma.t('SE_HA_CREADO_CORRECTAMENTE_EL_PICO') : window.app.idioma.t('SE_HA_MODIFICADO_CORRECTAMENTE');
                var mensajeError = edicion === null ? window.app.idioma.t('ERROR_AL_CREAR_EL_PICO') : window.app.idioma.t('ERROR_AL_MODIFICAR_EL_PICO');

                $.ajax({
                    type: "POST",
                    url: url,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(pico),
                    success: function (res) {
                        if (res) {
                            self.ds.read();
                            if (self.ordenParticion.id.includes('.')) {
                                $("#gridGestionWOActivas").data("kendoGrid").dataSource.read();
                            } else {
                                $("#gridHistoricoWO").data("kendoGrid").dataSource.read();
                            }
                            Not.crearNotificacion('success', 'Picos', mensajeOk, 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), mensajeError, 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (e) {
                        Backbone.trigger('eventCierraDialogo');
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), mensajeError, 4000);
                        }
                    }
                });

                self.ventanaCrearEditar.close();
            },
            confirmarBorrado: function (e) {
                var self = this;
                var permiso = false;

                if (self.ordenParticion.id.includes('.')) {
                    for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                        if (window.app.sesion.attributes.funciones[i].id === 13)
                            permiso = true;
                    }
                } else {
                    for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                        if (window.app.sesion.attributes.funciones[i].id === 198)
                            permiso = true;
                    }
                }

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var tr = $(e.target.parentNode.parentNode).closest("tr");
                var data = self.grid.dataItem(tr);

                if (data.SSCC != "Creado manualmente") {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_EDITAR_ELIMINAR_PICO_AUTOMATICO'), 3000);
                    return;
                }

                data.linea = self.ordenParticion.idLinea;

                self.vistaConfirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ELIMINAR_PICO'),
                    msg: window.app.idioma.t('DESEA_REALMENTE_ELIMINAR_PICO'),
                    funcion: function () { self.eliminarPico(data); },
                    contexto: this
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
                            self.ds.read();
                            if (self.ordenParticion.id.includes('.')) {
                                $("#gridGestionWOActivas").data("kendoGrid").dataSource.read();
                            } else {
                                $("#gridHistoricoWO").data("kendoGrid").dataSource.read();
                            }
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
            eliminar: function () {
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

        return gridPicos;
    });