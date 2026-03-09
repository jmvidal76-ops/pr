define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/MovimientoLotesFabricacion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion',
    'definiciones', "jszip", 'compartido/util'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, Session, definiciones, JSZip, util) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            dsMovimientos: null,
            dsTransferencias: null,
            dsPlantillas: null,
            dsMMPPOrigen: null,
            dsSemielaboradoOrigen: null,
            dsMMPPDestino: null,
            dsSemielaboradoDestino: null,
            dsMMPPEnvasadoOrigen: null,
            dsMMPPEnvasadoDestino: null,
            inicio: new Date((new Date()).getTime() - (15 * 24 * 3600 * 1000)),
            fin: new Date(),
            movimientoSeleccionado: null,
            tipoMovimientoLote: definiciones.TipoMovimientoLote(),
            operacionesMovLotes: definiciones.OperacionMovimientoLotes(),
            registrosSelData: [],
            registrosDesSelData: [],
            selTodos: false,
            idUbicacionOrigen: null,
            idUbicacionDestino: null,
            tooltip: null,
            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;

                self.dsMovimientos = new kendo.data.DataSource({
                    async: true,
                    transport: {
                        read: {
                            url: "../api/ObtenerMovimientosLotesFabricacion",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        create: {
                            url: "../api/AgregarMovimientosLotesFabricacion",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        update: {
                            url: "../api/EditarMovimientosLotesFabricacion",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.fInicio = self.inicio;
                                result.fFin = self.fin;

                                return JSON.stringify(result);
                            } else if (operation == "create" || operation == "update") {
                                let _loteOrigen = $("#loteOrigencmb").data("kendoDropDownList").dataItem($("#loteOrigencmb").data("kendoDropDownList").select());
                                let _loteDestino = $("#loteDestinocmb").data("kendoDropDownList").dataItem($("#loteDestinocmb").data("kendoDropDownList").select());

                                options.IdTipoMaterialMovimientoOrigen = _loteOrigen.IdTipoMaterialMovimiento;
                                options.IdTipoMaterialMovimientoDestino = _loteDestino.IdTipoMaterialMovimiento;
                                options.IdLoteOrigen = _loteOrigen.IdLote;
                                options.IdLoteDestino = _loteDestino.IdLote;

                                if (operation == "create") {
                                    options.RestarCantidadEnOrigen = $('#chkRestarCantidad').prop('checked');
                                    options.SumarCantidadEnDestino = $('#chkSumarCantidad').prop('checked');
                                }
                            }

                            return kendo.stringify(options);
                        }
                    },
                    requestEnd: function (e) {
                        var response = e.response;
                        var type = e.type;

                        if (type == "create" || type == "update") {
                            var mensaje = type == "create" ? 'MOVIMIENTO_CREADO_CORRECTAMENTE' : 'MOVIMIENTO_EDITADO_CORRECTAMENTE';
                            Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t(mensaje), 3000);

                            self.fin = new Date();
                            self.dsMovimientos.read();
                        }
                    },
                    sort: { field: "Creado", dir: "desc" },
                    schema: {
                        model: {
                            id: "IdMovimiento",
                            fields: {
                                'IdMovimiento': { type: "number", editable: false },
                                'IdTransferencia': { type: "number", editable: false },
                                'IdPlantilla': { type: "number", editable: false },
                                'LoteSAI': { type: "string", editable: false },
                                'IdLoteOrigen': {
                                    type: "number", editable: false
                                },
                                'LoteOrigen': {
                                    type: "string",
                                    validation: {
                                        required: true,
                                        customLoteOrigen: function (input) {
                                            if (input.attr("data-bind") == "value:LoteOrigen" && input.val() == 0) {
                                                input.attr("data-customLoteOrigen-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'IdLoteDestino': {
                                    type: "number", editable: false
                                },
                                'LoteDestino': {
                                    type: "string",
                                    validation: {
                                        required: true,
                                        customLoteDestino: function (input) {
                                            if (input.attr("data-bind") == "value:LoteDestino" && input.val() == 0) {
                                                input.attr("data-customLoteDestino-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'IdTipoMaterialMovimientoOrigen': { type: "number", editable: false },
                                'IdTipoMaterialMovimientoDestino': { type: "number", editable: false },
                                'NombreTipoMaterialMovimientoOrigen': { type: "string", editable: false },
                                'NombreTipoMaterialMovimientoDestino': { type: "string", editable: false },
                                'Cantidad': {
                                    type: "number",
                                    validation: {
                                        required: true,
                                        customCantidad: function (input) {
                                            if (input.attr("data-bind") == "value:Cantidad" && input.val() == 0) {
                                                input.attr("data-customCantidad-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'Creado': { type: "date" },
                                'IdUbicacionOrigen': {
                                    type: "number", editable: false
                                },
                                'UbicacionOrigen': {
                                    type: "string",
                                    validation: {
                                        required: true,
                                        customIdUbicacionOrigen: function (input) {
                                            if (input.attr("data-bind") == "value:UbicacionOrigen" && input.val() == 0) {
                                                input.attr("data-customIdUbicacionOrigen-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'IdUbicacionDestino': {
                                    type: "number", editable: false
                                },
                                'UbicacionDestino': {
                                    type: "string",
                                    validation: {
                                        required: true,
                                        customIdUbicacionDestino: function (input) {
                                            if (input.attr("data-bind") == "value:UbicacionDestino" && input.val() == 0) {
                                                input.attr("data-customIdUbicacionDestino-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'IdMaterialOrigen': { type: "string", editable: false },
                                'IdMaterialDestino': { type: "string", editable: false },
                                'NombreMaterialOrigen': { type: "string", editable: false },
                                'NombreMaterialDestino': { type: "string", editable: false },

                            }
                        }
                    },
                    pageSize: 50,
                });

                self.dsTransferencias = new kendo.data.DataSource({
                    async: true,

                    transport: {
                        read: {
                            url: "../api/ObtenerTransferenciasFabricacion",
                            type: "GET"
                        },
                        create: {   
                            url: "../api/AgregarTransferenciaFabricacion",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                const _idTransferencia = self.movimientoSeleccionado ? self.movimientoSeleccionado.IdTransferencia : 0;
                                return { id: _idTransferencia };
                            }

                            return kendo.stringify(options);
                        }
                    },
                    requestEnd: function (e) {
                        var type = e.type;
                        if (type == "create") {
                            Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('TRANSFERENCIA_CREADA_MOVIMIENTO'), 5000);
                            self.movimientoSeleccionado = null;
                            self.dsTransferencias.read();
                        }
                    },
                    sort: { field: "FechaFin", dir: "desc" },
                    schema: {
                        model: {
                            id: "IdTransferencia",
                            fields: {
                                'IdTransferencia': { type: "number", editable: false },
                                'LoteSAI': { type: "string", editable: false },
                                'MaterialSAI': {
                                    type: "string",
                                    validation: {
                                        required: true,
                                        customMaterialSAI: function (input) {
                                            if (input.attr("data-bind") == "value:MaterialSAI" && input.val() == 0) {
                                                input.attr("data-customMaterialSAI-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'FechaInicio': { type: "date", editable: false },
                                'FechaFin': { type: "date", editable: false },
                                'IdUbicacionOrigen': {
                                    type: "string",
                                    validation: {
                                        required: true,
                                        customIdUbicacionOrigen: function (input) {
                                            if (input.attr("data-bind") == "value:IdUbicacionOrigen" && input.val() == 0) {
                                                input.attr("data-customIdUbicacionOrigen-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'UbicacionOrigen': { type: "string", editable: false },
                                'IdUbicacionDestino': {
                                    type: "string",
                                    validation: {
                                        required: true,
                                        customIdUbicacionDestino: function (input) {
                                            if (input.attr("data-bind") == "value:IdUbicacionDestino" && input.val() == 0) {
                                                input.attr("data-customIdUbicacionDestino-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'UbicacionDestino': { type: "string", editable: false },
                                'Cantidad': {
                                    type: "number",
                                    validation: {
                                        required: true,
                                        customCantidad: function (input) {
                                            if (input.attr("data-bind") == "value:Cantidad" && input.val() == 0) {
                                                input.attr("data-customCantidad-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'Unidad': {
                                    type: "string",
                                    validation: {
                                        required: true,
                                        customUnidad: function (input) {
                                            if (input.attr("data-bind") == "value:Unidad" && input.val() == 0) {
                                                input.attr("data-customUnidad-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    },
                    pageSize: 50,
                });

                self.dsPlantillas = new kendo.data.DataSource({
                    async: true,
                    transport: {
                        read: {
                            url: "../api/ObtenerPlantillasPorId",
                            dataType: "json"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                const _idPlantilla = self.movimientoSeleccionado ? self.movimientoSeleccionado.IdPlantilla : null;
                                return { id: _idPlantilla };
                            }

                            return kendo.stringify(options);
                        },
                    },
                    sort: { field: "Descripcion", dir: "asc" },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "IdPlantillaConsumo",
                            fields: {
                                'IdPlantillaConsumo': { type: "number" },
                                'Descripcion': { type: "string" },
                                'IdTipoWO': { type: "number" },
                                'DescTipoWO': { type: "string" },
                                'CantidadTeorica': { type: "number" },
                                'ValorMinimoRequerido': { type: "number" },
                                'ValorMaximoRequerido': { type: "number" },
                                'CantidadTeorica': { type: "number" },
                                'CodigoJDE': { type: "string" },
                                'IdTipoDisparadorConsumo': { type: "number" },
                                'DescTipoDisparador': { type: "string" },
                                'Unidad': { type: "string" },
                                'IdModoDescuento': { type: "number" },
                                'DescModoDescuento': { type: "string" },
                                'IdUbicacionOrigen': { type: "string" },
                                'NombreUbicacion': { type: "string" },
                                'DescripcionUbicacion': { type: "string" },
                                'IdIndicadorMMPPAsignadas': { type: "int" },
                                'Activa': { type: "bool" },
                            }
                        }
                    }
                });

                self.dsMMPPOrigen = new kendo.data.DataSource({
                    async: true,
                    autoBind: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerLoteMMPPFabricacion",
                            type: "GET"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                const _id = self.movimientoSeleccionado ? self.movimientoSeleccionado.IdLoteOrigen : null;
                                return { id: _id };
                            }

                            return kendo.stringify(options);
                        }
                    },
                    schema: {
                        model: {
                            id: "IdLoteMateriaPrima",
                            fields: {
                                'IdLoteMateriaPrima': { type: "number" },
                                'IdLoteMES': { type: "string" },
                                'SSCC': { type: "string" },
                                'IdMaterial': { type: "string" },
                                'IdUbicacion': { type: "number" },
                                'IdProveedor': { type: "string" },
                                'LoteProveedor': { type: "string" },
                                'CantidadInicial': { type: "number" },
                                'CantidadActual': { type: "number" },
                                'Unidad': { type: "string" },
                                'Prioridad': { type: "number" },
                                'FechaEntradaPlanta': { type: "date" },
                                'FechaInicioConsumo': { type: "date" },
                                'FechaFinConsumo': { type: "date" },
                                'FechaCaducidad': { type: "date" },
                                'FechaCuarentena': { type: "date" },
                                'MotivoCuarentena': { type: "string" },
                                'FechaBloqueo': { type: "date" },
                                'MotivoBloqueo': { type: "string" },
                                'FechaDefectuoso': { type: "date" },
                                'IdTipoUbicacion': { type: "number" },
                                'IdProceso': { type: "number" },
                                'NombreMaterial': { type: "string" },
                                'Proveedor': { type: "string" },
                                'NombreUbicacion': { type: "string" },
                                'Zona': { type: "string" },
                                'Proceso': { type: "string" },
                            }
                        }
                    },
                    requestStart: function (e) {
                        if (!self.movimientoSeleccionado) {
                            e.preventDefault();
                        } else {
                            if (!self.movimientoSeleccionado.IdLoteOrigen) {
                                e.preventDefault();
                            }
                        }
                    },
                    pageSize: 50,
                });

                self.dsMMPPDestino = new kendo.data.DataSource({
                    async: true,
                    autoBind: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerLoteMMPPFabricacion",
                            type: "GET"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                const _id = self.movimientoSeleccionado ? self.movimientoSeleccionado.IdLoteDestino : null;
                                return { id: _id };
                            }

                            return kendo.stringify(options);
                        }
                    },
                    requestStart: function (e) {
                        if (!self.movimientoSeleccionado) {
                            e.preventDefault();
                        } else {
                            if (!self.movimientoSeleccionado.IdLoteDestino) {
                                e.preventDefault();
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: "IdLoteMateriaPrima",
                            fields: {
                                'IdLoteMateriaPrima': { type: "number" },
                                'IdLoteMES': { type: "string" },
                                'SSCC': { type: "string" },
                                'IdMaterial': { type: "string" },
                                'IdUbicacion': { type: "number" },
                                'IdProveedor': { type: "string" },
                                'LoteProveedor': { type: "string" },
                                'CantidadInicial': { type: "number" },
                                'CantidadActual': { type: "number" },
                                'Unidad': { type: "string" },
                                'Prioridad': { type: "number" },
                                'FechaEntradaPlanta': { type: "date" },
                                'FechaInicioConsumo': { type: "date" },
                                'FechaFinConsumo': { type: "date" },
                                'FechaCaducidad': { type: "date" },
                                'FechaCuarentena': { type: "date" },
                                'MotivoCuarentena': { type: "string" },
                                'FechaBloqueo': { type: "date" },
                                'MotivoBloqueo': { type: "string" },
                                'FechaDefectuoso': { type: "date" },
                                'IdTipoUbicacion': { type: "number" },
                                'IdProceso': { type: "number" },
                                'NombreMaterial': { type: "string" },
                                'Proveedor': { type: "string" },
                                'NombreUbicacion': { type: "string" },
                                'Zona': { type: "string" },
                                'Proceso': { type: "string" },
                            }
                        }
                    },
                    pageSize: 50,
                });

                self.dsMMPPEnvasadoOrigen = new kendo.data.DataSource({
                    async: true,
                    autoBind: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerLoteMMPPEnvasado",
                            type: "GET"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                const _id = self.movimientoSeleccionado ? self.movimientoSeleccionado.IdLoteOrigen : null;
                                return { id: _id };
                            }
                            return kendo.stringify(options);
                        }
                    },
                    requestStart: function (e) {
                        if (!self.movimientoSeleccionado || !self.movimientoSeleccionado.IdLoteOrigen) {
                            e.preventDefault();
                        }
                    },
                    schema: {
                        model: {
                            id: "IdLoteMateriaPrima",
                            fields: {
                                'IdLoteMateriaPrima': { type: "number" },
                                'IdLoteMES': { type: "string" },
                                'SSCC': { type: "string" },
                                'IdMaterial': { type: "string" },
                                'IdUbicacion': { type: "number" },
                                'IdProveedor': { type: "string" },
                                'LoteProveedor': { type: "string" },
                                'CantidadInicial': { type: "number" },
                                'CantidadActual': { type: "number" },
                                'Unidad': { type: "string" },
                                'Prioridad': { type: "number" },
                                'FechaEntradaPlanta': { type: "date" },
                                'FechaInicioConsumo': { type: "date" },
                                'FechaFinConsumo': { type: "date" },
                                'FechaCaducidad': { type: "date" },
                                'FechaCuarentena': { type: "date" },
                                'MotivoCuarentena': { type: "string" },
                                'FechaBloqueo': { type: "date" },
                                'MotivoBloqueo': { type: "string" },
                                'FechaDefectuoso': { type: "date" },
                                'IdTipoUbicacion': { type: "number" },
                                'IdProceso': { type: "number" },
                                'NombreMaterial': { type: "string" },
                                'Proveedor': { type: "string" },
                                'NombreUbicacion': { type: "string" },
                                'Zona': { type: "string" },
                                'Proceso': { type: "string" },
                            }
                        }
                    },
                    pageSize: 50,
                });

                self.dsMMPPEnvasadoDestino = new kendo.data.DataSource({
                    async: true,
                    autoBind: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerLoteMMPPEnvasado",
                            type: "GET"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                const _id = self.movimientoSeleccionado ? self.movimientoSeleccionado.IdLoteDestino : null;
                                return { id: _id };
                            }
                            return kendo.stringify(options);
                        }
                    },
                    requestStart: function (e) {
                        if (!self.movimientoSeleccionado || !self.movimientoSeleccionado.IdLoteDestino) {
                            e.preventDefault();
                        }
                    },
                    schema: {
                        model: {
                            id: "IdLoteMateriaPrima",
                            fields: {
                                'IdLoteMateriaPrima': { type: "number" },
                                'IdLoteMES': { type: "string" },
                                'SSCC': { type: "string" },
                                'IdMaterial': { type: "string" },
                                'IdUbicacion': { type: "number" },
                                'IdProveedor': { type: "string" },
                                'LoteProveedor': { type: "string" },
                                'CantidadInicial': { type: "number" },
                                'CantidadActual': { type: "number" },
                                'Unidad': { type: "string" },
                                'Prioridad': { type: "number" },
                                'FechaEntradaPlanta': { type: "date" },
                                'FechaInicioConsumo': { type: "date" },
                                'FechaFinConsumo': { type: "date" },
                                'FechaCaducidad': { type: "date" },
                                'FechaCuarentena': { type: "date" },
                                'MotivoCuarentena': { type: "string" },
                                'FechaBloqueo': { type: "date" },
                                'MotivoBloqueo': { type: "string" },
                                'FechaDefectuoso': { type: "date" },
                                'IdTipoUbicacion': { type: "number" },
                                'IdProceso': { type: "number" },
                                'NombreMaterial': { type: "string" },
                                'Proveedor': { type: "string" },
                                'NombreUbicacion': { type: "string" },
                                'Zona': { type: "string" },
                                'Proceso': { type: "string" },
                            }
                        }
                    },
                    pageSize: 50,
                });

                self.dsSemielaboradoOrigen = new kendo.data.DataSource({
                    async: true,
                    autoBind: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerLoteSemielaborado",
                            type: "GET"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                const _id = self.movimientoSeleccionado ? self.movimientoSeleccionado.IdLoteOrigen : null;
                                return { id: _id };
                            }

                            return kendo.stringify(options);
                        }
                    },
                    requestStart: function (e) {
                        if (!self.movimientoSeleccionado) {
                            e.preventDefault();
                        } else {
                            if (!self.movimientoSeleccionado.IdLoteOrigen) {
                                e.preventDefault();
                            }
                        }
                    },
                    sort: { field: "FechaFin", dir: "desc" },
                    schema: {
                        model: {
                            id: "IdLoteSemielaborado",
                            fields: {
                                'IdLoteSemielaborado': { type: "number" },
                                'TipoMaterial': { type: "string" },
                                'ClaseMaterial': { type: "string" },
                                'IdMaterial': { type: "string" },
                                'IdUbicacion': { type: "number" },
                                'CantidadInicial': { type: "number" },
                                'CantidadActual': { type: "number" },
                                'Unidad': { type: "string" },
                                'Prioridad': { type: "number" },
                                'FechaCreacion': { type: "date" },
                                'FechaConsumo': { type: "date" },
                                'IdTipoUbicacion': { type: "number" },
                                'IdProceso': { type: "number" },
                                'NombreMaterial': { type: "string" },
                                'LoteMES': { type: "string" },
                                'Ubicacion': { type: "string" },
                                'Zona': { type: "string" },
                                'Proceso': { type: "string" },
                            }
                        }
                    },
                    pageSize: 50,
                });

                self.dsSemielaboradoDestino = new kendo.data.DataSource({
                    async: true,
                    autoBind: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerLoteSemielaborado",
                            type: "GET"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                const _id = self.movimientoSeleccionado ? self.movimientoSeleccionado?.IdLoteDestino : null;
                                return { id: _id };
                            }

                            return kendo.stringify(options);
                        }
                    },
                    requestStart: function (e) {
                        if (!self.movimientoSeleccionado) {
                            e.preventDefault();
                        } else {
                            if (!self.movimientoSeleccionado.IdLoteDestino) {
                                e.preventDefault();
                            }
                        }
                    },
                    sort: { field: "FechaFin", dir: "desc" },
                    schema: {
                        model: {
                            id: "IdLoteSemielaborado",
                            fields: {
                                'IdLoteSemielaborado': { type: "number" },
                                'TipoMaterial': { type: "string" },
                                'ClaseMaterial': { type: "string" },
                                'IdMaterial': { type: "string" },
                                'IdUbicacion': { type: "number" },
                                'IdProveedor': { type: "string" },
                                'LoteProveedor': { type: "string" },
                                'CantidadInicial': { type: "number" },
                                'CantidadActual': { type: "number" },
                                'Unidad': { type: "string" },
                                'Prioridad': { type: "number" },
                                'FechaCreacion': { type: "date" },
                                'FechaConsumo': { type: "date" },
                                'IdTipoUbicacion': { type: "number" },
                                'IdProceso': { type: "number" },
                                'NombreMaterial': { type: "string" },
                                'LoteMES': { type: "string" },
                                'Ubicacion': { type: "string" },
                                'Zona': { type: "string" },
                                'Proceso': { type: "string" }
                            }
                        }
                    },
                    pageSize: 50,
                });

                SetCultura();

                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                window.JSZip = JSZip;

                self.tooltip = kendo.template($("#tooltip").html());

                //Cargamos las fechas
                $("#dtpFechaInicio").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: self.inicio,
                    change: function () {
                        self.inicio = this.value();
                    }
                });

                $("#dtpFechaFin").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: self.fin,
                    change: function () {
                        self.fin = this.value();
                    }
                });

                $("#gridMovimientos").kendoGrid({
                    dataSource: self.dsMovimientos,
                    dataBound: function () {
                        self.ValidateCheck(self);
                    },
                    sortable: true,
                    scrollable: true,
                    selectable: "row",
                    resizable: true,
                    editable: {
                        mode: "popup",
                        confirmation: false
                    },
                    excel: util.ui.default.gridExcelDate('MOVIMIENTO_LOTES'),
                    excelExport: async function (e) {
                        ExcelGridExtra(e, util);
                    },
                    edit: function (e) {
                        var isNew = e.model.isNew();
                        var wnd = $(e.container).data("kendoWindow");
                        wnd.setOptions({
                            width: "745px"
                        });

                        $('.k-edit-label').css('width', '20%');
                        $('.k-edit-field').css('width', '75%');
                        $('[data-container-for="Cantidad"] .k-numerictextbox').css('width', '205px');
                        $('[data-container-for="Creado"] .k-datetimepicker').css('width', '205px');

                        wnd.center();

                        let _columnasGrid = this.columns;

                        for (var i = 0; i < _columnasGrid.length; i++) {
                            let _columna = _columnasGrid[i].field;
                            if (_columna) {
                                switch (_columna) {
                                    case "LoteSAI":
                                    case "IdMaterialOrigen":
                                    case "IdMaterialDestino":
                                    case "UbicacionOrigenMov":
                                    case "UbicacionDestinoMov":
                                        e.container.find(".k-edit-label:eq(" + i + ")").hide();
                                        e.container.find(".k-edit-field:eq(" + i + ")").hide();
                                        break;

                                    case "UbicacionOrigen":
                                        e.container.find(".k-edit-label:eq(" + i + ") label").text(window.app.idioma.t("UBICACION_ORIGEN"));
                                        break;

                                    case "UbicacionDestino":
                                        e.container.find(".k-edit-label:eq(" + i + ") label").text(window.app.idioma.t("UBICACION_DESTINO"));
                                        break;

                                    default:
                                        break;
                                }
                            } else if (i == 0) {
                                e.container.find(".k-edit-label:eq(0)").hide();
                                e.container.find(".k-edit-field:eq(0)").hide();
                            }
                        }

                        if (isNew) {
                            self.movimientoSeleccionado = null;
                            $('.k-window-title').text(window.app.idioma.t("CREAR"));
                            $(".k-grid-update").text(window.app.idioma.t("GUARDAR"));

                            if ($("#loteOrigencmb").length > 0 && $("#loteDestinocmb").length > 0) {
                                $("#loteOrigencmb").data("kendoDropDownList").dataSource.data([]);
                                $("#loteDestinocmb").data("kendoDropDownList").dataSource.data([]);
                            }
                        } else {
                            $('.k-window-title').text(window.app.idioma.t("EDITAR"));
                            $(".k-grid-update").text(window.app.idioma.t("ACTUALIZAR"));
                            $(".k-grid-cancel").text(window.app.idioma.t("CANCELAR"));

                            if (self.movimientoSeleccionado?.IdUbicacionOrigen) {
                                self.idUbicacionOrigen = self.movimientoSeleccionado.IdUbicacionOrigen;
                            }
                            if (self.movimientoSeleccionado?.IdUbicacionDestino) {
                                self.idUbicacionDestino = self.movimientoSeleccionado.IdUbicacionDestino;
                            }
                        }

                        // Insertar fechas arriba, antes de las ubicaciones
                        let contenedorFechas = $(`
                            <div style="display: flex; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #ccc;">
                                <div style="margin-left: 14.5%; display: flex; align-items: center;">
                                    <label for="fechaDesdePopup" style="margin-right: 8px;">${window.app.idioma.t("DESDE")}:</label>
                                    <input id="fechaDesdePopup" style="width: 180px; margin-right: 24px;" />
                                    <label for="fechaHastaPopup" style="margin-right: 8px;">${window.app.idioma.t("HASTA")}:</label>
                                    <input id="fechaHastaPopup" style="width: 180px;" />
                                </div>
                            </div>
                        `);

                        $('[data-container-for="UbicacionOrigen"]').parent().before(contenedorFechas);

                        $("#fechaDesdePopup").kendoDateTimePicker({
                            format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                            culture: localStorage.getItem("idiomaSeleccionado"),
                            value: self.inicio,
                            change: function () {
                                self.inicio = this.value();
                                self.refrescarLotesSegunUbicaciones();
                            }
                        });

                        $("#fechaHastaPopup").kendoDateTimePicker({
                            format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                            culture: localStorage.getItem("idiomaSeleccionado"),
                            value: self.fin,
                            change: function () {
                                self.fin = this.value();
                                self.refrescarLotesSegunUbicaciones();
                            }
                        });


                        // Estilo y botones adicionales
                        $('[data-container-for="UbicacionOrigen"]').css({ display: 'flex', 'align-items': 'center' });
                        $('[data-container-for="UbicacionOrigen"]').append('<div style="width: 146px;"></div>');

                        $('[data-container-for="UbicacionDestino"]').css({ display: 'flex', 'align-items': 'center' });
                        $('[data-container-for="UbicacionDestino"]').append('<div style="width: 146px;"></div>');

                        let divLoteOrigen = $('[data-container-for="LoteOrigen"]');
                        divLoteOrigen.css({ display: 'flex', 'align-items': 'center' });

                        let origenHtml = '<div style="margin-left: 10px; white-space: nowrap; display: flex; align-items: center;">' +
                            '<label for="chkRestarCantidad" style="max-width: 105px; margin: 0;">' + window.app.idioma.t("RESTAR_CANTIDAD") +
                            '</label><input type="checkBox" id="chkRestarCantidad" style="width: 30px; vertical-align:text-bottom; margin: 0;" /></div>';

                        divLoteOrigen.append(origenHtml);

                        let divLoteDestino = $('[data-container-for="LoteDestino"]');
                        divLoteDestino.css({ display: 'flex', 'align-items': 'center' });

                        let destinoHtml = '<div style="margin-left: 10px; white-space: nowrap; display: flex; align-items: center;">' +
                            '<label for="chkSumarCantidad" style="max-width: 105px; margin: 0;">' + window.app.idioma.t("SUMAR_CANTIDAD") +
                            '</label><input type="checkBox" id="chkSumarCantidad" style="width: 30px; vertical-align:text-bottom; margin: 0;" /></div>';

                        divLoteDestino.append(destinoHtml);

                        // Alinear etiquetas a la izquierda
                        var elements = document.getElementsByClassName('k-edit-label');
                        for (var i = 0; i < elements.length; i++) {
                            elements[i].style.textAlign = "left";
                        }
                    },
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    change: function (e) {
                        e.preventDefault();
                        var selectedRows = this.select();
                        if (selectedRows.length > 0) {
                            var dataItem = this.dataItem(selectedRows[0]);
                            self.movimientoSeleccionado = dataItem;

                            self.dsTransferencias.data([]);
                            self.dsPlantillas.data([]);
                            self.dsMMPPOrigen.data([]);
                            self.dsMMPPEnvasadoOrigen.data([]);
                            self.dsSemielaboradoOrigen.data([]);
                            self.dsMMPPDestino.data([]);
                            self.dsMMPPEnvasadoDestino.data([]);
                            self.dsSemielaboradoDestino.data([]);

                            if (dataItem.IdPlantilla) {
                                self.dsPlantillas.read();
                                $("#gridTransferencias").hide();
                                //$("#divFiltrosTransferenciaHeader").hide();
                                $("#gridPlantilla").show();
                            } else if (dataItem.IdTransferencia) {
                                self.dsTransferencias.read();
                                $("#gridTransferencias").show();
                                //$("#divFiltrosTransferenciaHeader").show();
                                $("#gridPlantilla").hide();
                            }


                            // ORIGEN
                            if (dataItem.IdTipoMaterialMovimientoOrigen == self.tipoMovimientoLote.Envasado) {
                                var gridOrigen = $("#gridOrigenMMPPMovimiento").data("kendoGrid");
                                if (gridOrigen) gridOrigen.setDataSource(self.dsMMPPEnvasadoOrigen);
                                self.dsMMPPEnvasadoOrigen.read();
                                $("#gridOrigenMMPPMovimiento").show();
                                $("#gridOrigenSemiMovimiento").hide();
                            } else if (dataItem.IdTipoMaterialMovimientoOrigen == self.tipoMovimientoLote.Fabricacion) {
                                var gridOrigenFab = $("#gridOrigenMMPPMovimiento").data("kendoGrid");
                                if (gridOrigenFab) gridOrigenFab.setDataSource(self.dsMMPPOrigen);
                                self.dsMMPPOrigen.read();
                                $("#gridOrigenMMPPMovimiento").show();
                                $("#gridOrigenSemiMovimiento").hide();
                            } else if (dataItem.IdTipoMaterialMovimientoOrigen == self.tipoMovimientoLote.Semielaborado) {
                                self.dsSemielaboradoOrigen.read();
                                $("#gridOrigenMMPPMovimiento").hide();
                                $("#gridOrigenSemiMovimiento").show();
                            }

                            // DESTINO
                            if (dataItem.IdTipoMaterialMovimientoDestino == self.tipoMovimientoLote.Envasado) {
                                var gridDestino = $("#gridDestinoMMPPMovimiento").data("kendoGrid");
                                if (gridDestino) gridDestino.setDataSource(self.dsMMPPEnvasadoDestino);
                                self.dsMMPPEnvasadoDestino.read();
                                $("#gridDestinoMMPPMovimiento").show();
                                $("#gridDestinoSemiMovimiento").hide();
                            } else if (dataItem.IdTipoMaterialMovimientoDestino == self.tipoMovimientoLote.Fabricacion) {
                                var gridDestinoFab = $("#gridDestinoMMPPMovimiento").data("kendoGrid");
                                if (gridDestinoFab) gridDestinoFab.setDataSource(self.dsMMPPDestino);
                                self.dsMMPPDestino.read();
                                $("#gridDestinoMMPPMovimiento").show();
                                $("#gridDestinoSemiMovimiento").hide();
                            } else if (dataItem.IdTipoMaterialMovimientoDestino == self.tipoMovimientoLote.Semielaborado) {
                                self.dsSemielaboradoDestino.read();
                                $("#gridDestinoMMPPMovimiento").hide();
                                $("#gridDestinoSemiMovimiento").show();
                            }
                        }

                    },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    columns: [
                        {
                            headerTemplate: '<input class="checkbox" id="btnSelTodos" name="btnSelTodos" type="checkbox" />',
                            template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                            width: 35,
                            exportable: { excel: false }
                        },
                        {
                            title: window.app.idioma.t("LOTE_SAI"),
                            field: 'LoteSAI',
                            template: "<span class='addTooltip'>#=LoteSAI != null ? LoteSAI : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 300
                        },
                        //{
                        //    title: window.app.idioma.t("UBICACION_ORIGEN") + ' ' + window.app.idioma.t("TRANSFERENCIA"),
                        //    field: 'UbicacionOrigen',
                        //    attributes: { "align": "center", style: 'white-space: nowrap ', class: 'addTooltip', },
                        //    editor: function (e, options) { return self.UbicacionOrigenDropDownEditor(self, e, options) },
                        //    width: 250,
                        //    filterable: true
                        //},
                        //{
                        //    title: window.app.idioma.t("UBICACION_DESTINO") + ' ' + window.app.idioma.t("TRANSFERENCIA"),
                        //    field: 'UbicacionDestino',
                        //    attributes: { "align": "center", style: 'white-space: nowrap ', },
                        //    editor: function (e, options) { return self.UbicacionDestinoDropDownEditor(self, e, options) },
                        //    width: 250,
                        //    filterable: true
                        //},
                        {
                            title: window.app.idioma.t("UBICACION_LOTE") + ' ' + window.app.idioma.t("ORIGEN"),
                            field: 'UbicacionLoteOrigen',
                            attributes: { "align": "center", style: 'white-space: nowrap ', class: 'addTooltip', },
                            editor: function (e, options) { return self.UbicacionOrigenDropDownEditor(self, e, options) },
                            width: 250,
                            filterable: true
                        },
                        {
                            title: window.app.idioma.t("UBICACION_LOTE") + ' ' + window.app.idioma.t("DESTINO_AUX"),
                            field: 'UbicacionLoteDestino',
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            editor: function (e, options) { return self.UbicacionDestinoDropDownEditor(self, e, options) },
                            width: 250,
                            filterable: true
                        },
                        {
                            title: window.app.idioma.t("LOTE_ORIGEN"),
                            field: 'LoteOrigen',
                            template: "<span class='addTooltip'>#=LoteOrigen != null ? LoteOrigen : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 300,
                            editor: function (e, options) { return self.LoteOrigenDropDownEditor(self, e, options) },
                        },
                        {
                            title: window.app.idioma.t("MATERIAL_ORIGEN"),
                            field: 'IdMaterialOrigen',
                            editor: function (e, options) { return self.MaterialOrigenDropDownEditor(self, e, options) },
                            template: "<span class='addTooltip'>#=IdMaterialOrigen != null ? IdMaterialOrigen +' - '+ NombreMaterialOrigen : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 300,
                            _excelOptions: {
                                template: "#= value.IdMaterialOrigen ? (value.IdMaterialOrigen + (value.NombreMaterialOrigen ? ' - ' + value.NombreMaterialOrigen : '')) : '' #",
                                width: 300
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdMaterialOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#=  IdMaterialOrigen +' - '+ NombreMaterialOrigen#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("LOTE_DESTINO"),
                            field: 'LoteDestino',
                            template: "<span class='addTooltip'>#=LoteDestino != null ? LoteDestino : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 300,
                            editor: function (e, options) { return self.LoteDestinoDropDownEditor(self, e, options) }
                        },
                        {
                            title: window.app.idioma.t("MATERIAL_DESTINO"),
                            field: 'IdMaterialDestino',
                            editor: function (e, options) { return self.MaterialDestinoDropDownEditor(self, e, options) },
                            template: "<span class='addTooltip'>#=IdMaterialDestino != null ? IdMaterialDestino +' - '+ NombreMaterialDestino : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 300,
                            _excelOptions: {
                                template: "#= value.IdMaterialDestino ? (value.IdMaterialDestino + (value.NombreMaterialDestino ? ' - ' + value.NombreMaterialDestino : '')) : '' #",
                                width: 300
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdMaterialDestino#' style='width: 14px;height:14px;margin-right:5px;'/>#=  IdMaterialDestino +' - '+ NombreMaterialDestino#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD"),
                            field: 'Cantidad',
                            aggregates: ["sum"],
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",
                            template: '#= kendo.format("{0:n2}",Cantidad)#',
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 100,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("FECHA"),
                            field: 'Creado',
                            width: 150,
                            editor: function (e, options) { return self.FechaDropDownEditor(e, options) },
                            template: "<span class='addTooltip'>#= Creado != null ? kendo.toString(new Date(Creado), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : '' #</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            _excelOptions: {
                                format: "dd/mm/yy hh:mm:ss",
                                template: "#= value.Creado ? GetDateForExcel(value.Creado) : '' #",
                                width: 150
                            },
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                    ],
                });

                $("#gridTransferencias").kendoGrid({
                    dataSource: self.dsTransferencias,
                    autoBind: false,
                    sortable: true,
                    scrollable: true,
                    selectable: "row",
                    resizable: true,
                    editable: {
                        mode: "popup",
                        confirmation: false
                    },
                    edit: function (e) {
                        var isNew = e.model.isNew();
                        var wnd = $(e.container).data("kendoWindow");
                        wnd.setOptions({
                            width: "40%"
                        });

                        wnd.center();

                        let _columnasGrid = this.columns;

                        for (var i = 0; i < _columnasGrid.length; i++) {
                            let _columna = _columnasGrid[i].field;
                            if (_columna) {
                                switch (_columna) {
                                    //No se añade enumerado porque estos son los nombres de las columnas que se muestran en el grid
                                    case "LoteSAI":
                                    case "FechaInicio":
                                    case "FechaFin":
                                        if (isNew) {
                                            e.container.find(".k-edit-label:eq(" + i + ")").hide();
                                            e.container.find(".k-edit-field:eq(" + i + ")").hide();
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            } else if (i == 0) {
                                e.container.find(".k-edit-label:eq(0)").hide();
                                e.container.find(".k-edit-field:eq(0)").hide();
                            }

                        }

                        if (isNew) {
                            self.movimientoSeleccionado = null;
                            $('.k-window-title').text(window.app.idioma.t("CREAR"));
                            $(".k-grid-update").text(window.app.idioma.t("GUARDAR"));
                        } else {
                            $('.k-window-title').text(window.app.idioma.t("EDITAR"));
                            $(".k-grid-update").text(window.app.idioma.t("ACTUALIZAR"));
                            $(".k-grid-cancel").text(window.app.idioma.t("CANCELAR"));

                            $('.k-edit-label').prop("disabled", true).addClass("k-state-disabled");

                        }
                    },

                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    toolbar: [{
                        template: "<label id='lblMovimientoGenerado'></label>" // empieza vacío
                    }],
                    dataBound: function () {
                        var ds = this.dataSource;

                        if (this._loadingTransferencias) {
                            $("#lblMovimientoGenerado").text("");
                            return;
                        }

                        var total = (typeof ds.total === "function") ? ds.total() : (ds.data ? ds.data().length : 0);

                        var texto = "";

                        // Si la carga fue originada por el botón "Consultar transferencias manuales"
                        if (self.consultaTransferenciasManuales) {
                            texto = window.app.idioma.t('MANUAL');
                            self.consultaTransferenciasManuales = false;
                        } else {
                            if (total === 0) {
                                texto = window.app.idioma.t('MANUAL');
                            } else {
                                var first = (ds.view && ds.view()[0]) || (ds.data && ds.data()[0]) || null;
                                var isEmpty = function (v) { return v == null || v === ""; };
                                var tipo = (first && isEmpty(first.IdTransferencia) && isEmpty(first.IdPlantilla))
                                    ? window.app.idioma.t('MANUAL')
                                    : window.app.idioma.t('TRANSFERENCIA');
                                texto = tipo;
                            }
                        }

                        $("#lblMovimientoGenerado").text(
                            texto ? (window.app.idioma.t('MOVIMIENTO_GENERADO_DESDE') + " " + texto) : ""
                        );
                    },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    columns: [
                        {
                            title: window.app.idioma.t("LOTE_SAI"),
                            field: 'LoteSAI',
                            template: "<span class='addTooltip'>#=LoteSAI != null ? LoteSAI : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 300
                        },
                        {
                            title: window.app.idioma.t("MATERIAL_SAI"),
                            field: 'MaterialSAI',
                            template: "<span class='addTooltip'>#=MaterialSAI != null ? MaterialSAI : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150,
                            editor: function (e, options) { return self.MaterialSAIDropDownEditor(e, options) },
                        },
                        {
                            title: window.app.idioma.t("FECHA"),
                            field: 'FechaFin',
                            template: "<span class='addTooltip'>#= FechaFin != null ? kendo.toString(new Date(FechaFin), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : '' #</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 200,
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("UBICACION_ORIGEN"),
                            field: 'IdUbicacionOrigen',
                            template: "<span class='addTooltip'>#=UbicacionOrigen != null ? UbicacionOrigen : ''#</span>",
                            editor: function (e, options) { self.UbicacionOrigenDropDownEditor(self, e, options) },
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },
                        {
                            title: window.app.idioma.t("UBICACION_DESTINO"),
                            field: 'IdUbicacionDestino',
                            template: "<span class='addTooltip'>#=UbicacionDestino != null ? UbicacionDestino : ''#</span>",
                            editor: function (e, options) { self.UbicacionDestinoDropDownEditor(self, e, options) },
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD"),
                            field: 'Cantidad',
                            aggregates: ["sum"],
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",
                            template: '#= kendo.format("{0:n2}",Cantidad)#',
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 100,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("UNIDAD"),
                            field: 'Unidad',
                            editor: function (e, options) { return self.UoMDropdDownEditor(e, options) },
                            template: "<span class='addTooltip'>#=Unidad != null ? Unidad : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 80
                        },
                    ],
                });

                $("#gridPlantilla").kendoGrid({
                    dataSource: self.dsPlantillas,
                    sortable: true,
                    scrollable: true,
                    selectable: "row",
                    resizable: true,
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    toolbar: [{
                        template: "<label>" + window.app.idioma.t('MOVIMIENTO_GENERADO_DESDE') + " " + window.app.idioma.t('PLANTILLA') + "</label>"
                    }],
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    columns: [
                        {
                            title: " ",
                            field: 'IdIndicadorMMPPAsignadas',
                            width: 50,
                            attributes: { style: "text-align:center;" },
                            template: function (item) {
                                return "<div class='circle_cells' style='background-color:" + item.ColorIndicador + ";'/>";
                            },
                        },

                        {
                            title: window.app.idioma.t("NOMBRE"),
                            field: 'Descripcion',
                            template: "<span class='addTooltip'>#=Descripcion#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            width: 250
                        },
                        {
                            title: window.app.idioma.t("TIPO_ORDEN"),
                            field: 'IdTipoWO',
                            width: 150,
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            template: "<span class='addTooltip'>#=DescTipoWO#</span>",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=IdTipoWO#' style='width: 14px;height:14px;margin-right:5px;'/>#=DescTipoWO#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            title: window.app.idioma.t("MATERIAL"),
                            field: 'CodigoJDE',
                            width: 80,
                            template: "<span class='addTooltip'>#=CodigoJDE#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_TEORICA"),
                            field: 'CantidadTeorica',
                            width: 80,
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            template: '<span class="addTooltip">#= kendo.format("{0:n2}",CantidadTeorica)#</span>',
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("UNIDADES"),
                            field: 'Unidad',
                            width: 50,
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            template: "<span class='addTooltip'>#=Unidad#</span>",
                        },
                        {
                            title: window.app.idioma.t("TIPO_DISPARADOR"),
                            field: 'IdTipoDisparadorConsumo',
                            template: "<span class='addTooltip'>#=DescTipoDisparador#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            width: 150,
                        },
                        {
                            title: window.app.idioma.t("MODO_DESCUENTO"),
                            field: 'IdModoDescuento',
                            template: "<span class='addTooltip'>#=DescModoDescuento#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            width: 150,
                        },
                        {
                            title: window.app.idioma.t("UBICACION_ORIGEN"),
                            field: 'NombreUbicacion',
                            width: 200,
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            template: "<span class='addTooltip'>#=NombreUbicacion#</span>",

                        },
                        {
                            title: window.app.idioma.t("VALOR_MINIMO_REQUERIDO"),
                            field: 'ValorMinimoRequerido',
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            width: 150,
                            template: '<span class="addTooltip">#= kendo.format("{0:n2}",ValorMinimoRequerido)#</span>',
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("VALOR_MAXIMO_REQUERIDO"),
                            field: 'ValorMaximoRequerido',
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            width: 150,
                            template: '<span class="addTooltip">#= kendo.format("{0:n2}",ValorMaximoRequerido)#</span>',
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                        }]
                });

                $("#gridOrigenMMPPMovimiento").kendoGrid({
                    dataSource: self.dsMMPPOrigen,
                    sortable: true,
                    scrollable: true,
                    resizable: true,
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    toolbar: [{
                        template: "<label>" + window.app.idioma.t('LOTE_ORIGEN') + "</label>"
                    }],
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    columns: [
                        {
                            title: window.app.idioma.t("LOTE_MES"),
                            field: 'IdLoteMES',
                            template: "<span class='addTooltip'>#=IdLoteMES != null ? IdLoteMES : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 300
                        },
                        {
                            title: window.app.idioma.t("UBICACION"),
                            field: 'NombreUbicacion',
                            template: "<span class='addTooltip'>#=NombreUbicacion != null ? NombreUbicacion : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },

                        {
                            title: window.app.idioma.t("CANTIDAD_INICIAL"),
                            field: 'CantidadInicial',
                            aggregates: ["sum"],
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",
                            template: '#= CantidadInicial != null ? kendo.format("{0:n2}",CantidadInicial) : ""#',
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 100,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_ACTUAL"),
                            field: 'CantidadActual',
                            aggregates: ["sum"],
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",
                            template: '#= CantidadActual != null ? kendo.format("{0:n2}",CantidadActual) : ""#',
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 100,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("MATERIAL"),
                            field: 'NombreMaterial',
                            template: "<span class='addTooltip'>#=IdMaterial != null ?  IdMaterial : ''# - #=NombreMaterial != null ?  NombreMaterial : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },
                        {
                            title: window.app.idioma.t("PROCESO"),
                            field: 'Proceso',
                            template: "<span class='addTooltip'>#=Proceso != null ? Proceso : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },
                        {
                            title: window.app.idioma.t("FECHA_INICIO_CONSUMO"),
                            field: 'FechaInicioConsumo',
                            template: "<span class='addTooltip'>#= FechaInicioConsumo != null ? kendo.toString(new Date(FechaInicioConsumo), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : '' #</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 200,
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("FECHA_FIN_CONSUMO"),
                            field: 'FechaFinConsumo',
                            template: "<span class='addTooltip'>#= FechaFinConsumo != null ? kendo.toString(new Date(FechaFinConsumo), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : '' #</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 200,
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },

                        {
                            title: window.app.idioma.t("UNIDAD"),
                            field: 'Unidad',
                            template: "<span class='addTooltip'>#=Unidad != null ? Unidad : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 80
                        },
                        {
                            title: window.app.idioma.t("PROVEEDOR"),
                            field: 'Proveedor',
                            template: "<span class='addTooltip'>#=Proveedor != null ? Proveedor : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },
                        {
                            title: window.app.idioma.t("LOTE_PROVEEDOR"),
                            field: 'LoteProveedor',
                            template: "<span class='addTooltip'>#=LoteProveedor != null ? LoteProveedor : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },
                    ]
                });

                $("#gridDestinoMMPPMovimiento").kendoGrid({
                    dataSource: self.dsMMPPDestino,
                    sortable: true,
                    scrollable: true,
                    resizable: true,
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    toolbar: [{
                        template: "<label>" + window.app.idioma.t('LOTE_DESTINO') + "</label>"
                    }],
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    columns: [
                        {
                            title: window.app.idioma.t("LOTE_MES"),
                            field: 'IdLoteMES',
                            template: "<span class='addTooltip'>#=IdLoteMES != null ? IdLoteMES : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 300
                        },
                        {
                            title: window.app.idioma.t("UBICACION"),
                            field: 'NombreUbicacion',
                            template: "<span class='addTooltip'>#=NombreUbicacion != null ? NombreUbicacion : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_INICIAL"),
                            field: 'CantidadInicial',
                            aggregates: ["sum"],
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",
                            template: '#= CantidadInicial != null ? kendo.format("{0:n2}",CantidadInicial) : ""#',
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 100,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_ACTUAL"),
                            field: 'CantidadActual',
                            aggregates: ["sum"],
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",
                            template: '#= CantidadActual != null ? kendo.format("{0:n2}",CantidadActual) : ""#',
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 100,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("MATERIAL"),
                            field: 'NombreMaterial',
                            template: "<span class='addTooltip'>#=IdMaterial != null ?  IdMaterial : ''# - #=NombreMaterial != null ?  NombreMaterial : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },
                        {
                            title: window.app.idioma.t("PROCESO"),
                            field: 'Proceso',
                            template: "<span class='addTooltip'>#=Proceso != null ? Proceso : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },
                        {
                            title: window.app.idioma.t("FECHA_INICIO_CONSUMO"),
                            field: 'FechaInicioConsumo',
                            template: "<span class='addTooltip'>#= FechaInicioConsumo != null ? kendo.toString(new Date(FechaInicioConsumo), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : '' #</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 200,
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("FECHA_FIN_CONSUMO"),
                            field: 'FechaFinConsumo',
                            template: "<span class='addTooltip'>#= FechaFinConsumo != null ? kendo.toString(new Date(FechaFinConsumo), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : '' #</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 200,
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },

                        {
                            title: window.app.idioma.t("UNIDAD"),
                            field: 'Unidad',
                            template: "<span class='addTooltip'>#=Unidad != null ? Unidad : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 80
                        },
                        {
                            title: window.app.idioma.t("PROVEEDOR"),
                            field: 'Proveedor',
                            template: "<span class='addTooltip'>#=Proveedor != null ? Proveedor : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },
                        {
                            title: window.app.idioma.t("LOTE_PROVEEDOR"),
                            field: 'LoteProveedor',
                            template: "<span class='addTooltip'>#=LoteProveedor != null ? LoteProveedor : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },
                    ]
                });

                $("#gridOrigenSemiMovimiento").kendoGrid({
                    dataSource: self.dsSemielaboradoOrigen,
                    sortable: true,
                    scrollable: true,
                    resizable: true,
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    toolbar: [{
                        template: "<label>" + window.app.idioma.t('LOTE_ORIGEN') + "</label>"
                    }],
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    columns: [
                        {
                            title: window.app.idioma.t("LOTE_MES"),
                            field: 'LoteMES',
                            template: "<span class='addTooltip'>#=LoteMES != null ? LoteMES : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 300
                        },

                        {
                            title: window.app.idioma.t("UBICACION"),
                            field: 'Ubicacion',
                            template: "<span class='addTooltip'>#=Ubicacion != null ? Ubicacion : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },

                        {
                            title: window.app.idioma.t("CANTIDAD_INICIAL"),
                            field: 'CantidadInicial',
                            aggregates: ["sum"],
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",
                            template: '#= CantidadInicial != null ? kendo.format("{0:n2}",CantidadInicial) : ""#',
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 100,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_ACTUAL"),
                            field: 'CantidadActual',
                            aggregates: ["sum"],
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",
                            template: '#= CantidadActual != null ? kendo.format("{0:n2}",CantidadActual) : ""#',
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 100,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("MATERIAL"),
                            field: 'NombreMaterial',
                            template: "<span class='addTooltip'>#=IdMaterial != null ?  IdMaterial : ''# - #=NombreMaterial != null ?  NombreMaterial : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },
                        {
                            title: window.app.idioma.t("UNIDAD"),
                            field: 'Unidad',
                            template: "<span class='addTooltip'>#=Unidad != null ? Unidad : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 80
                        },
                        {
                            title: window.app.idioma.t("PROCESO"),
                            field: 'Proceso',
                            template: "<span class='addTooltip'>#=Proceso != null ? Proceso : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },
                        {
                            title: window.app.idioma.t("FECHA_CONSUMO"),
                            field: 'FechaConsumo',
                            template: "<span class='addTooltip'>#= FechaConsumo != null ? kendo.toString(new Date(FechaConsumo), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : '' #</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 200,
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        }

                    ]
                });

                $("#gridDestinoSemiMovimiento").kendoGrid({
                    dataSource: self.dsSemielaboradoDestino,
                    sortable: true,
                    scrollable: true,
                    resizable: true,
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    toolbar: [{
                        template: "<label>" + window.app.idioma.t('LOTE_DESTINO') + "</label>"
                    }],
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    columns: [
                        {
                            title: window.app.idioma.t("LOTE_MES"),
                            field: 'LoteMES',
                            template: "<span class='addTooltip'>#=LoteMES != null ? LoteMES : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 300
                        },

                        {
                            title: window.app.idioma.t("UBICACION"),
                            field: 'Ubicacion',
                            template: "<span class='addTooltip'>#=Ubicacion != null ? Ubicacion : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },

                        {
                            title: window.app.idioma.t("CANTIDAD_INICIAL"),
                            field: 'CantidadInicial',
                            aggregates: ["sum"],
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",
                            template: '#= CantidadInicial != null ? kendo.format("{0:n2}",CantidadInicial) : ""#',
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 100,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_ACTUAL"),
                            field: 'CantidadActual',
                            aggregates: ["sum"],
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",
                            template: '#= CantidadActual != null ? kendo.format("{0:n2}",CantidadActual) : ""#',
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 100,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("MATERIAL"),
                            field: 'NombreMaterial',
                            template: "<span class='addTooltip'>#=IdMaterial != null ?  IdMaterial : ''# - #=NombreMaterial != null ?  NombreMaterial : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },
                        {
                            title: window.app.idioma.t("UNIDAD"),
                            field: 'Unidad',
                            template: "<span class='addTooltip'>#=Unidad != null ? Unidad : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 80
                        },
                        {
                            title: window.app.idioma.t("PROCESO"),
                            field: 'Proceso',
                            template: "<span class='addTooltip'>#=Proceso != null ? Proceso : ''#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 150
                        },
                        {
                            title: window.app.idioma.t("FECHA_CONSUMO"),
                            field: 'FechaConsumo',
                            template: "<span class='addTooltip'>#= FechaConsumo != null ? kendo.toString(new Date(FechaConsumo), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : '' #</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ', },
                            width: 200,
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        }

                    ]
                });

                $("#verticalSplitter").kendoSplitter({
                    orientation: "vertical",
                    panes: [
                        { collapsible: false, size: "50%" },
                        { collapsible: false, size: "20%" },
                        { collapsible: false, size: "30%" }
                    ]
                });

                $("#horizontalSplitter").kendoSplitter({
                    orientation: "horizontal",
                    panes: [
                        { collapsible: false },
                        { collapsible: false }
                    ]
                });

                $("#gridMovimientos, #gridTransferencias, #gridOrigenMMPPMovimiento, #gridDestinoMMPPMovimiento,#gridOrigenSemiMovimiento,#gridDestinoSemiMovimiento").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

                $("#btnOperations").kendoDropDownList({
                    dataSource: [
                        { id: 0, name: window.app.idioma.t('OPERACIONES') },
                        { id: self.operacionesMovLotes.Crear, name: window.app.idioma.t('CREAR_MOVIMIENTO') },
                        { id: self.operacionesMovLotes.Editar, name: window.app.idioma.t('EDITAR_MOVIMIENTO') },
                        { id: self.operacionesMovLotes.Eliminar, name: window.app.idioma.t('ELIMINAR_MOVIMIENTO') },
                        { id: self.operacionesMovLotes.CrearTransferencia, name: window.app.idioma.t('CREAR_TRANSFERENCIA') },
                    ],
                    dataTextField: "name",
                    dataValueField: "id",
                    select: function (e) {
                        if (e.item) {
                            var dataItem = this.dataItem(e.item);
                            var gridMovimientos = $("#gridMovimientos").data("kendoGrid");
                            var gridTransferencia = $("#gridTransferencias").data("kendoGrid");

                            switch (dataItem.id) {
                                case self.operacionesMovLotes.Crear:
                                    gridMovimientos.addRow();
                                    break;
                                case self.operacionesMovLotes.Eliminar:
                                    if (self.registrosSelData.length == 0) {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR_MOVIMIENTO'), 3000);
                                    } else {
                                        self.ConfirmarBorrado(e);
                                    }
                                    break;
                                case self.operacionesMovLotes.CrearTransferencia:
                                    gridTransferencia.addRow();
                                    break;
                                case self.operacionesMovLotes.Editar:
                                    if (self.movimientoSeleccionado)
                                        gridMovimientos.editRow(self.movimientoSeleccionado);
                                    break;
                                default:
                            }
                        }
                    }
                });

                self.resizeSplitter();
            },
            refrescarLotesSegunUbicaciones: function () {
                var self = this;

                if (self.idUbicacionOrigen) {
                    self.cargarLotes(self.idUbicacionOrigen, "#loteOrigencmb", true);
                }

                if (self.idUbicacionDestino) {
                    self.cargarLotes(self.idUbicacionDestino, "#loteDestinocmb", false);
                }
            },
            cargarLotes: function (idUbicacion, comboId, esOrigen) {
                var self = this;

                if (!idUbicacion || !self.ValidarFechas()) return;

                let fechaInicio = self.inicio;
                let fechaFin = self.fin;

                const fechaDesdePopup = $("#fechaDesdePopup").data("kendoDateTimePicker")?.value();
                const fechaHastaPopup = $("#fechaHastaPopup").data("kendoDateTimePicker")?.value();

                if (fechaDesdePopup && fechaHastaPopup) {
                    fechaInicio = fechaDesdePopup;
                    fechaFin = fechaHastaPopup;
                }

                $.ajax({
                    url: "../api/ObtenerLotePorIdUbicacion",
                    type: "GET",
                    dataType: "json",
                    data: {
                        idUbicacion: idUbicacion,
                        fechaInicio: fechaInicio.toISOString(),
                        fechaFin: fechaFin.toISOString()
                    },
                    success: function (data) {
                        const combo = $(comboId).data("kendoDropDownList");
                        if (combo) {
                            combo.dataSource.data(data);
                        }
                    }
                });
            },


            //#region EVENTOS
            events: {
                'click #btnFiltrar': 'FiltrarFechas',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnSelTodos': function () { this.AplicarSeleccion(); },
                'click #btnConsultarTransferenciasManuales': function () { this.ConsultarTransferenciasManuales(this); },
                'click #btnExcel': 'exportarExcel',
            },

            //#endregion EVENTOS

            exportarExcel: function () {
                var grid = $("#gridMovimientos").data("kendoGrid");
                if (!grid) return;
                grid.saveAsExcel();
            },
            AplicarSeleccion: function () {
                var self = this;
                var grid = $('#gridMovimientos').data('kendoGrid');
                var _chkAll = $("input[name='btnSelTodos']:checked").length > 0 ? true : false;

                self.selTodos = _chkAll;

                if (self.selTodos) {
                    grid.tbody.find('input:checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var dataSource = grid.dataSource;
                    var filters = dataSource.filter();
                    var allData = dataSource.data();
                    var query = new kendo.data.Query(allData);
                    var dataFiltered = query.filter(filters).data;

                    self.registrosSelData = [];

                    for (var i = 0; i < dataFiltered.length; i++) {
                        var datos = {};
                        datos.IdMovimiento = dataFiltered[i].IdMovimiento;
                        datos.uid = dataFiltered[i].uid;
                        self.registrosSelData.push(datos);
                        self.movimientoSeleccionado = dataFiltered[i];
                    }
                } else {
                    grid.tbody.find('input:checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');
                    self.registrosDesSelData = [];
                    self.registrosSelData = [];
                }
            },
            ConsultarTransferenciasManuales: function (self) {
                $("#gridMovimientos").data("kendoGrid").clearSelection();
                $("#gridOrigenMMPPMovimiento").data("kendoGrid").dataSource.data([]);
                $("#gridDestinoMMPPMovimiento").data("kendoGrid").dataSource.data([]);
                $("#gridOrigenSemiMovimiento").data("kendoGrid").dataSource.data([]);
                $("#gridDestinoSemiMovimiento").data("kendoGrid").dataSource.data([]);

                self.movimientoSeleccionado = null;

                self.consultaTransferenciasManuales = true;

                self.dsTransferencias.read();
            },
            MaterialSAIDropDownEditor: function (container, options) {
                $('<input data-text-field="Nombre" class="width-80" id="MaterialSAIDropDownEditor" data-value-field="Nombre" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        optionLabel: window.app.idioma.t("SELECCIONE_MATERIAL_SAI"),
                        dataSource: {

                            transport: {
                                read: {
                                    url: "../api/plantillaConsumoMMPP/ObtenerMaterialSAI",
                                    dataType: "json"
                                }
                            },
                            sort: { field: "Nombre", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdMaterialSAI",
                                    fields: {
                                        'IdMaterialSAI': { type: "number" },
                                        'Nombre': { type: "string" }
                                    }
                                }
                            }
                        },
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },

                    });

                var cmb = $("#MaterialSAIDropDownEditor").data("kendoDropDownList");
                cmb.list.width("auto");
            },
            UoMDropdDownEditor: function (container, options) {
                var dsUnidadMedida = new kendo.data.DataSource({
                    batch: true,
                    transport: {
                        read: {
                            url: "../api/GetUnidadMedida/",
                            dataType: "json",
                            cache: false
                        },
                        schema: {
                            model: {
                                id: "SourceUoMID",
                                fields: {
                                    'SourceUoMID': { type: "string" },
                                }
                            }
                        }

                    }
                });

                $('<input data-text-field="SourceUoMID" class="width-80" id="uomDrop"  data-value-field="SourceUoMID" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        optionLabel: window.app.idioma.t("SELECCIONE_UNIDAD"),
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },
                        dataSource: dsUnidadMedida

                    });

                var UoMDrop = $("#uomDrop").data("kendoDropDownList");
                UoMDrop.list.width("auto");
            },
            UbicacionOrigenDropDownEditor: function (self, container, options) {
                $('<input data-text-field="Nombre" class="width-80" id="ubicacioncmb" data-value-field="IdUbicacion" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        dataBound: function (e) {
                            var ddl = this;
                            self.idUbicacionOrigen = options.model.IdUbicacionOrigen;
                            ddl.select(function (dataItem) {
                                return dataItem.IdUbicacion === options.model.IdUbicacionOrigen
                            });

                            if ($("#loteOrigencmb").length > 0) {
                                $("#loteOrigencmb").data("kendoDropDownList").dataSource.read();
                            }
                        },
                        optionLabel: window.app.idioma.t("SELECCIONE_UBICACION"),
                        select: function (e) {
                            if (typeof options.model.IdMovimiento !== 'undefined') {
                                var grid = $("#gridMovimientos").data("kendoGrid");
                                var currentUid = options.model.uid;
                                var dataItem = this.dataItem(e.item);
                                var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                                var item = grid.dataItem(currentRow);
                                if (item) {
                                    item.set("IdUbicacionOrigen", dataItem.IdUbicacion);
                                    self.idUbicacionOrigen = dataItem.IdUbicacion;
                                    $("#loteOrigencmb").data("kendoDropDownList").dataSource.data([]);
                                    if (self.idUbicacionOrigen)
                                        $("#loteOrigencmb").data("kendoDropDownList").dataSource.read();
                                }
                            } else if (typeof options.model.IdTransferencia !== 'undefined') {
                                var dataItem = this.dataItem(e.item);
                                options.model.UbicacionOrigen = dataItem.Nombre;
                            }
                        },
                        dataSource: {
                            transport: {
                                read: {
                                    url: "../api/GetLocation/0/0",
                                    dataType: "json",
                                    cache: false
                                }
                            },
                            sort: { field: "Nombre", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdUbicacion",
                                    fields: {
                                        'IdUbicacion': { type: "number" },
                                        'Nombre': { type: "string" },
                                    }
                                }
                            }
                        },
                    });

                // $('<span class="k-invalid-msg" data-for="sl' + options.field + '"></span>').appendTo(container);
                var ubicacioncmb = $("#ubicacioncmb").data("kendoDropDownList");
                ubicacioncmb.list.width("auto");
                ///$('<a id="btnAddProveedor" class="k-button" style="min-width:40px !important;width:10% !important"> <span class="k-icon k-add"></span> </a>').appendTo(container);
            },
            UbicacionDestinoDropDownEditor: function (self, container, options) {
                $('<input data-text-field="Nombre" class="width-80" id="ubicacionDestinocmb" data-value-field="IdUbicacion" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        dataBound: function (e) {
                            var ddl = this;
                            self.idUbicacionDestino = options.model.IdUbicacionDestino;
                            ddl.select(function (dataItem) {
                                return dataItem.IdUbicacion === options.model.IdUbicacionDestino
                            });

                            if ($("#loteDestinocmb").length > 0) {
                                $("#loteDestinocmb").data("kendoDropDownList").dataSource.read();
                            }
                        },
                        optionLabel: window.app.idioma.t("SELECCIONE_UBICACION"),
                        select: function (e) {
                            if (typeof options.model.IdMovimiento !== 'undefined') {
                                var grid = $("#gridMovimientos").data("kendoGrid");
                                var currentUid = options.model.uid;
                                var dataItem = this.dataItem(e.item);
                                var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                                var item = grid.dataItem(currentRow);
                                if (item) {
                                    item.set("IdUbicacionDestino", dataItem.IdUbicacion);
                                    self.idUbicacionDestino = dataItem.IdUbicacion;
                                    $("#loteDestinocmb").data("kendoDropDownList").dataSource.data([]);
                                    if (self.idUbicacionDestino)
                                        $("#loteDestinocmb").data("kendoDropDownList").dataSource.read();
                                }
                            } else if (typeof options.model.IdTransferencia !== 'undefined') {
                                var dataItem = this.dataItem(e.item);
                                options.model.UbicacionDestino = dataItem.Nombre;
                            }
                        },
                        dataSource: {
                            transport: {
                                read: {
                                    url: "../api/GetLocation/0/0",
                                    dataType: "json",
                                    cache: false
                                }
                            },
                            sort: { field: "Nombre", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdUbicacion",
                                    fields: {
                                        'IdUbicacion': { type: "number" },
                                        'Nombre': { type: "string" },
                                    }
                                }
                            }
                        },
                    });

                // $('<span class="k-invalid-msg" data-for="sl' + options.field + '"></span>').appendTo(container);
                var ubicacioncmb = $("#ubicacionDestinocmb").data("kendoDropDownList");
                ubicacioncmb.list.width("auto");
                ///$('<a id="btnAddProveedor" class="k-button" style="min-width:40px !important;width:10% !important"> <span class="k-icon k-add"></span> </a>').appendTo(container);
            },
            LoteOrigenDropDownEditor: function (self, container, options) {
                let inicializado = false;

                $('<input data-text-field="IdLoteMES" class="width-80" id="loteOrigencmb" data-value-field="IdLote" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        autoBind: false,
                        change: function (e) {
                            const dataItem = this.dataItem();
                            if (dataItem && self.movimientoSeleccionado) {
                                self.movimientoSeleccionado.IdLoteOrigen = dataItem.IdLote;
                                self.movimientoSeleccionado.LoteOrigen = dataItem.IdLoteMES;
                            }
                        },
                        dataBound: function (e) {
                            if (self.movimientoSeleccionado) {
                                var ddl = this;
                                var loteExist = ddl.dataSource.data().filter(l => l.IdLote == self.movimientoSeleccionado?.IdLoteOrigen);
                                if (loteExist.length > 0) {
                                    ddl.select(function (dataItem) {
                                        return dataItem.IdLote === self.movimientoSeleccionado.IdLoteOrigen;
                                    });
                                } else {
                                    ddl.dataSource.data().push({
                                        "IdLote": self.movimientoSeleccionado?.IdLoteOrigen,
                                        "IdLoteMES": self.movimientoSeleccionado?.LoteOrigen,
                                        "CantidadActual": 0,
                                        "IdTipoMaterialMovimiento": self.movimientoSeleccionado?.IdTipoMaterialMovimientoOrigen,
                                        "Unidad": self.movimientoSeleccionado?.UnidadMedidaOrigen ?? ""
                                    });

                                    ddl.select(function (dataItem) {
                                        return dataItem.IdLote === self.movimientoSeleccionado.IdLoteOrigen;
                                    });
                                }
                            }
                        },
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            if (!inicializado) {
                                listContainer.width(listContainer.width() + kendo.support.scrollbar());
                                inicializado = true;
                            }
                        },
                        optionLabel: window.app.idioma.t("SELECCIONE_LOTE_ORIGEN"),
                        select: function (e) {
                            var grid = $("#gridMovimientos").data("kendoGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                            item.set("LoteOrigen", dataItem.LoteMES);
                        },
                        template: '<span>#= IdLoteMES +" / "+ kendo.format("{0:n2}",CantidadActual) +" / "+Unidad#</span>',
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: function (optionsTransport) {
                                    if (self.idUbicacionOrigen && self.ValidarFechas?.()) {
                                        const fechaDesde = $("#fechaDesdePopup").data("kendoDateTimePicker")?.value() || self.inicio;
                                        const fechaHasta = $("#fechaHastaPopup").data("kendoDateTimePicker")?.value() || self.fin;

                                        $.ajax({
                                            url: "../api/ObtenerLotePorIdUbicacion",
                                            dataType: "json",
                                            type: "GET",
                                            data: {
                                                idUbicacion: self.idUbicacionOrigen,
                                                fechaInicio: fechaDesde.toISOString(),
                                                fechaFin: fechaHasta.toISOString()
                                            },
                                            success: function (result) {
                                                optionsTransport.success(result);
                                            },
                                            error: function (err) {
                                                optionsTransport.error(err);
                                            }
                                        });
                                    } else {
                                        optionsTransport.success([]); // evita error 404 devolviendo vacío
                                    }
                                }
                            },
                            sort: { field: "IdLoteMES", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdLote",
                                    fields: {
                                        'IdLote': { type: "number" },
                                        'IdLoteMES': { type: "string" },
                                        'IdTipoMaterialMovimiento': { type: "number" },
                                        'CantidadActual': { type: "number" },
                                        'Unidad': { type: "string" },
                                    }
                                }
                            }
                        })
                    });

                var cmb = $("#loteOrigencmb").data("kendoDropDownList");
                cmb.list.width("auto");
                cmb.list.css("min-width", "350px");
            },
            LoteDestinoDropDownEditor: function (self, container, options) {
                let inicializado = false;

                $('<input data-text-field="IdLoteMES" class="width-80" id="loteDestinocmb" data-value-field="IdLote" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        autoBind: false,
                        dataBound: function (e) {
                            if (self.movimientoSeleccionado) {
                                var ddl = this;
                                var loteExist = ddl.dataSource.data().filter(l => l.IdLote == self.movimientoSeleccionado?.IdLoteDestino);
                                if (loteExist.length > 0) {
                                    ddl.select(function (dataItem) {
                                        return dataItem.IdLote === self.movimientoSeleccionado.IdLoteDestino;
                                    });
                                } else {
                                    ddl.dataSource.data().push({
                                        "IdLote": self.movimientoSeleccionado?.IdLoteDestino,
                                        "IdLoteMES": self.movimientoSeleccionado?.LoteDestino,
                                        "CantidadActual": 0,
                                        "IdTipoMaterialMovimiento": self.movimientoSeleccionado?.IdTipoMaterialMovimientoDestino,
                                        "Unidad": self.movimientoSeleccionado?.UnidadMedidaDestino ?? ""
                                    });

                                    ddl.select(function (dataItem) {
                                        return dataItem.IdLote === self.movimientoSeleccionado?.IdLoteDestino;
                                    });
                                }
                            }
                        },
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            if (!inicializado) {
                                listContainer.width(listContainer.width() + kendo.support.scrollbar());
                                inicializado = true;
                            }
                        },
                        optionLabel: window.app.idioma.t("SELECCIONE_LOTE_DESTINO"),
                        select: function (e) {
                            var grid = $("#gridMovimientos").data("kendoGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                            item.set("LoteDestino", dataItem.LoteMES);
                        },
                        template: '<span class="loteDestinocmb">#= IdLoteMES +" / "+ kendo.format("{0:n2}",CantidadActual) +" / "+Unidad#</span>',
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: function (optionsTransport) {
                                    if (self.idUbicacionDestino && self.ValidarFechas?.()) {
                                        const fechaDesde = $("#fechaDesdePopup").data("kendoDateTimePicker")?.value() || self.inicio;
                                        const fechaHasta = $("#fechaHastaPopup").data("kendoDateTimePicker")?.value() || self.fin;

                                        $.ajax({
                                            url: "../api/ObtenerLotePorIdUbicacion",
                                            dataType: "json",
                                            type: "GET",
                                            data: {
                                                idUbicacion: self.idUbicacionDestino,
                                                fechaInicio: fechaDesde.toISOString(),
                                                fechaFin: fechaHasta.toISOString()
                                            },
                                            success: function (result) {
                                                optionsTransport.success(result);
                                            },
                                            error: function (err) {
                                                optionsTransport.error(err);
                                            }
                                        });
                                    } else {
                                        optionsTransport.success([]);
                                    }
                                }
                            },
                            sort: { field: "IdLoteMES", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdLote",
                                    fields: {
                                        'IdLote': { type: "number" },
                                        'IdLoteMES': { type: "string" },
                                        'IdTipoMaterialMovimiento': { type: "number" },
                                        'CantidadActual': { type: "number" },
                                        'Unidad': { type: "string" },
                                    }
                                }
                            }
                        })
                    });

                var cmb = $("#loteDestinocmb").data("kendoDropDownList");
                cmb.list.width("auto");
                cmb.list.css("min-width", "350px");
            },
            ValidateCheck: function (self) {
                var grid = $("#gridMovimientos").data("kendoGrid");
                $(".checkbox").bind("change", function (e) {

                    var checked = this.checked;
                    row = $(e.target).closest("tr");
                    dataItem = grid.dataItem(row);
                    //var idValue = grid.dataItem(row).get("idTiempoCambio");

                    var datos = {};
                    datos.IdMovimiento = dataItem.IdMovimiento;
                    datos.uid = dataItem.uid;
                    if (checked) {
                        row.addClass("k-state-selected");

                        var datafound = _.findWhere(self.registrosDesSelData, datos);
                        index = _.indexOf(self.registrosDesSelData, datafound);
                        if (index >= 0) {
                            self.registrosDesSelData.splice(index, 1);
                        }

                        var numReg = self.$("#lblRegSel").text() ? self.$("#lblRegSel").text() : 0;
                        self.registrosSelData.push(datos);
                        self.movimientoSeleccionado = dataItem;
                    } else {
                        row.removeClass("k-state-selected");
                        self.registrosDesSelData.push(datos);

                        var datafound = _.findWhere(self.registrosSelData, datos);
                        index = _.indexOf(self.registrosSelData, datafound);
                        if (index >= 0) {
                            self.registrosSelData.splice(index, 1);
                        }

                        self.movimientoSeleccionado = null;
                    }
                });

                if (self.selTodos) {
                    grid.tbody.find('input:checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var items = grid.items();

                    var listItems = [];
                    listItems = $.grep(items, function (row) {
                        var dataItem = grid.dataItem(row);
                        return self.registrosDesSelData.some(function (data) {
                            return data.id == dataItem.id;
                        });
                    });

                    listItems.forEach(function (row, idx) {
                        $(row.cells[0])[0].childNodes[0].checked = false;
                        $(row).closest("tr").removeClass("k-state-selected");
                    });
                } else {
                    grid.tbody.find('input:checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');

                    var items = grid.items();

                    var listItems = [];
                    listItems = $.grep(items, function (row) {
                        var dataItem = grid.dataItem(row);
                        return self.registrosSelData.some(function (data) {
                            return data.id == dataItem.id;
                        });
                    });

                    listItems.forEach(function (row, idx) {
                        $(row.cells[0])[0].childNodes[0].checked = true;
                        $(row).closest("tr").addClass("k-state-selected");
                    });
                }
            },
            ConfirmarBorrado: function (e) {
                e.preventDefault();
                var self = this;
                var permiso = TienePermiso(269);
                let _movSeleccionados = $("#gridMovimientos").data("kendoGrid").tbody.find('input:checked');

                if (_movSeleccionados.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR_MOVIMIENTO'), 3000);
                    return;
                }

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ELIMINAR'),
                    msg: window.app.idioma.t('CONFIRMACION_ELIMINAR_MOVIMIENTO'),
                    funcion: function () { self.EliminarMovimientos(self, _movSeleccionados); },
                    contexto: this
                });
            },
            EliminarMovimientos: function (self, movimientosSeleccionados) {
                var grid = $("#gridMovimientos").data("kendoGrid");
                var _result = [];

                movimientosSeleccionados.each(function () {
                    var _item = grid.dataItem($(this).closest('tr'));
                    $.ajax({
                        type: "DELETE",
                        url: "../api/EliminarMovimientoLote/" + _item.IdMovimiento,
                        dataType: 'json'
                    }).done(function (result) {
                        if (result != 0) {
                            _result.push(true);
                        } else {
                            _result.push(false);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }).fail(function (e, xhr) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    });
                });

                if (!_result.includes(false)) {
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('MOVIMIENTOS_ELIMINADOS_CORRECTAMENTE'), 4000);
                    self.fin = new Date();
                    self.dsMovimientos.read();
                }
            },
            FiltrarFechas: function (e) {
                var self = this;

                if (self.ValidarFechas()) {
                    self.dsMovimientos.data([]);
                    self.dsTransferencias.data([]);
                    self.dsMMPPOrigen.data([]);
                    self.dsSemielaboradoOrigen.data([]);
                    self.dsMMPPDestino.data([]);
                    self.dsSemielaboradoDestino.data([]);
                    self.dsMMPPEnvasadoOrigen.data([]);
                    self.dsMMPPEnvasadoDestino.data([]);
                    $("#gridMovimientos").data("kendoGrid").dataSource.read();
                }
            },
            ValidarFechas: function () {
                var self = this;

                if (self.inicio && self.fin) {
                    if (Date.parse(self.inicio) > Date.parse(self.fin)) {
                        Not.crearNotificacion('warning', window.app.idioma.t('INFO'), window.app.idioma.t('ERROR_FECHA_FIN_MENOR_INICIO'), 4000);
                        return false;
                    }

                    return true;
                }

                Not.crearNotificacion('warning', window.app.idioma.t('INFO'), window.app.idioma.t('SELECCIONE_FECHAS'), 4000);
                return false;
            },
            LimpiarFiltroGrid: function () {
                var self = this;
                self.movimientoSeleccionado = null;
                self.inicio = new Date((new Date()).getTime() - (15 * 24 * 3600 * 1000));
                self.fin = new Date();

                $("#dtpFechaInicio").data("kendoDateTimePicker").value(self.inicio);
                $("#dtpFechaFin").data("kendoDateTimePicker").value(self.fin);
                $("form.k-filter-menu button[type='reset']").trigger("click");
                $("#gridMovimientos").data("kendoGrid").dataSource.read();
                $("#gridTransferencias").data("kendoGrid").dataSource.read();
            },
            FechaDropDownEditor: function (container, options) {
                $('<input class="width-80" data-text-field="' + options.field + '" data-value-field="' + options.field
                    + '" data-bind="value:' + options.field + '" />')
                    .appendTo(container)
                    .kendoDateTimePicker({
                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                        culture: localStorage.getItem("idiomaSeleccionado"),
                        //value: new Date(options.model.dateTime)
                    });
            },
            MaterialOrigenDropDownEditor: function (self, container, options) {
                $('<input data-text-field="DescripcionCompleta"  class="width-80" id="materialOrigenDrop"  data-value-field="IdMaterial" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        optionLabel: window.app.idioma.t("SELECCIONE_MATERIAL"),
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },
                        select: function (e) {
                            var grid = $("#gridMovimientos").data("kendoGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                            item.set("IdMaterialOrigen", dataItem.IdMaterial);
                        },
                        dataSource: {
                            transport: {
                                read: {
                                    url: "../api/GetMaterial",
                                    dataType: "json"
                                }

                            },
                            sort: { field: "DescripcionCompleta", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdMaterial",
                                    fields: {
                                        'IdMaterial': { type: "string" },
                                        'DescripcionCompleta': { type: "string" },
                                    }
                                }
                            },
                        },
                    });
                // $('<span class="k-invalid-msg" data-for="sl' + options.field + '"></span>').appendTo(container);
                var materialDrop = $("#materialOrigenDrop").data("kendoDropDownList");
                materialDrop.list.width("auto");
            },
            MaterialDestinoDropDownEditor: function (self, container, options) {
                $('<input data-text-field="DescripcionCompleta"  class="width-80" id="materialDestinoDrop"  data-value-field="IdMaterial" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        optionLabel: window.app.idioma.t("SELECCIONE_MATERIAL"),
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },
                        select: function (e) {
                            var grid = $("#gridMovimientos").data("kendoGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                            item.set("IdMaterialDestino", dataItem.IdMaterial);
                        },
                        dataSource: {
                            transport: {
                                read: {
                                    url: "../api/GetMaterial",
                                    dataType: "json"
                                }

                            },
                            sort: { field: "DescripcionCompleta", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdMaterial",
                                    fields: {
                                        'IdMaterial': { type: "string" },
                                        'DescripcionCompleta': { type: "string" },
                                    }
                                }
                            },
                        },
                    });

                // $('<span class="k-invalid-msg" data-for="sl' + options.field + '"></span>').appendTo(container);
                var materialDrop = $("#materialDestinoDrop").data("kendoDropDownList");
                materialDrop.list.width("auto");
            },
            resizeSplitter: function () {
                var outerSplitter = $("#verticalSplitter").data("kendoSplitter");
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").height();
                //var headerFilter = $("#divFiltrosHeader").height();

                outerSplitter.wrapper.height(contenedorHeight - cabeceraHeight);
                outerSplitter.resize();
            },
            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });
