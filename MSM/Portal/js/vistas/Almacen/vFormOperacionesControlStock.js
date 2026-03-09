define(['jquery', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'definiciones','vistas/Almacen/vAgregarProveedor','vistas/Almacen/vPropiedadesLotes'],
    function ($, Not, VistaDlgConfirm, definiciones,vAgregarProveedor,vPropiedadesLotes) {
        var mantenimiento = {
            tipoOperaciones: definiciones.OperacionesAlmacen(),
            procesosLote: definiciones.ProcesoLote(),
            procesosLoteString: definiciones.ProcesoLoteString(),
            tipoMovimientoLote: definiciones.TipoMovimientoLote(),
            //1. Metodo que añade nuevos valores del formulario seleccionado
            AplicarOperacion: function (operacion, valor, motivo, elements) {
                var self = this;
                var _valuesSelected = elements.registrosSelData;
                var _data = {};
                var _valueOptionSelected = $("#vpTxtOption").data("kendoDropDownList") ? $("#vpTxtOption").data("kendoDropDownList").value() : null;
                if ((operacion == self.tipoOperaciones.BLOQUEAR || operacion == self.tipoOperaciones.CUARENTENA || operacion == self.tipoOperaciones.DEFECTUOSO || operacion == self.tipoOperaciones.CADUCIDAD) && valor == null && _valueOptionSelected == self.tipoOperaciones.OPERACIONES) {
                    //BLOQUEAR, CUARENTENA Y CADUCIDAD DEBEN TENER LA FECHA
                    $("#result").text(window.app.idioma.t('FECHA_REQUERIDA'));
                } else {
                    if (operacion == self.tipoOperaciones.EDITAR_LOTE) {
                        _data = self.ObtenerDatosFormulario();
                        if ($("#form").data("kendoValidator").validate()) {
                            _data.lotes = JSON.stringify(_valuesSelected);
                            _data.operacion = operacion;
                            _data.valor = valor;
                            _data.motivo = motivo;
                            _data.LoteFabricacion = elements.isFabricacion;
                            _data.IdLoteMateriaPrima = elements.registrosSelData[0].IdLoteMateriaPrima;
                            this.CallAjax("PUT", '../api/AplicarOperacion', _data, elements);
                        }
                        //if (_data.Ubicacion && _data.CantidadActual >= 0
                        //    && _data.UnidadesMedidaDto 
                        //    && _data.IdMaterial
                        //    && _data.Proceso) {
                        //    if ((!_data.Proveedor ||
                        //        !_data.LoteProveedor) &&
                        //        _data.Proceso == self.procesosLote.REC) {
                        //        $("#result").text(window.app.idioma.t('FALTAN_DATOS_FORMULARIO'));
                        //    } else {
                        //        $("#result").text('');
                        //        _data.lotes = JSON.stringify(_valuesSelected);
                        //        _data.operacion = operacion;
                        //        _data.valor = valor;
                        //        _data.motivo = motivo;
                        //        _data.LoteFabricacion = elements.isFabricacion;
                        //        _data.IdLoteMateriaPrima = elements.registrosSelData[0].IdLoteMateriaPrima;
                        //        this.CallAjax("PUT", '../api/AplicarOperacion', _data, elements);
                        //    }
                        //} else {
                        //    $("#result").text(window.app.idioma.t('FALTAN_DATOS_FORMULARIO'));
                        //}
                    }
                    else if (operacion != self.tipoOperaciones.CREAR_LOTE_2 && 
                            operacion != self.tipoOperaciones.EDITAR_LOTE)//CREAR LOTE
                    {                        
                        if (_valuesSelected.length > 0) {
                            _data.lotes = JSON.stringify(_valuesSelected);
                            _data.operacion = operacion;
                            _data.valor = valor;
                            _data.motivo = motivo;
                            _data.LoteFabricacion = elements.isFabricacion;
                            _data.PropiedadesLotes = elements.PropiedadesLotes;                          

                            this.CallAjax("PUT", '../api/AplicarOperacion', _data, elements);
                        } else {
                            $("#result").text(window.app.idioma.t('SELECCIONAR_LOTE'))
                        }
                    }
                    
                    else {
                        _data = self.ObtenerDatosFormulario();
                        if (elements.ShowCantidadMover) {
                            $("#vpTxtCantidadMover").attr("required", "required");                            
                            _data.CantidadActual = $("#vpTxtCantidadMover").data("kendoNumericTextBox").value();
                        }

                        _data.operacion = operacion;
                        _data.LoteFabricacion = elements.isFabricacion;

                        //if (_data.Ubicacion && _data.CantidadActual && _data.UnidadesMedidaDto && _data.LoteProveedor && _data.IdMaterial && _data.Proveedor && _data.Proceso) {
                        if ($("#form").data("kendoValidator").validate()) {
                            //$("#result").text('');
                            this.CallAjax("POST", '../api/AddReceptionDeliveryNotes', _data, elements);
                        }
                    }
                }
            },

            ObtenerDatosFormulario: function () {
                var _data = {};
                var _unidadMedida = $("#vpTxtUnidadMedida").data("kendoDropDownList").dataItem($("#vpTxtUnidadMedida").data("kendoDropDownList").select());
                var _SSCC = $("#vpTxtSSCC").val();
                var _loteProveedor = $("#vpTxtLoteProveedor").val();
                var _fechaCaducidad = $("#vpTxtFechaCaducidad").val() != "" ? kendo.toString(kendo.parseDate($("#vpTxtFechaCaducidad").data('kendoDatePicker').value(), "yyyy-mm-dd")) : null;
                var _idMaterial = $("#vpTxtMaterial").data("kendoDropDownList").value();
                var _proveedor = $("#vpTxtProveedor").data("kendoDropDownList").value();
                var _proceso = $("#vpTxtProceso").data("kendoDropDownList").value();
                var _idubicacion = $("#vpTxtUbicacion").data("kendoDropDownList").value();
                var _cantidadLote = $("#vpTxtCantidadLote").data("kendoNumericTextBox").value();
                var _cantidadInicial = $("#vpTxtCantidadInicial").data("kendoNumericTextBox").value();
                var _fechaEntradaPlanta = $("#vpTxtFechaEntradaPlanta").data("kendoDateTimePicker").value();
                var _fechaEntradaUbicacion = $("#vpTxtFechaEntradaUbicacion").data("kendoDateTimePicker").value();
                var _fechaInicioConsumo = $("#vpTxtFechaInicioConsumo").data("kendoDateTimePicker").value();
                var _fechaFinConsumo = $("#vpTxtFechaFinConsumo").data("kendoDateTimePicker").value();
                var _fechaBloqueo = $("#vpTxtFechaBloqueo").data("kendoDateTimePicker").value();
                var _fechaCuarentena = $("#vpTxtFechaCuarentena").data("kendoDateTimePicker").value();
                var _fechaDefecto = $("#vpTxtFechaDefectuoso").data("kendoDateTimePicker").value();
                var _motivoBloqueo = $("#vpTxtMotivoBloqueo").val();
                var _motivoCuarentena = $("#vpTxtMotivoCuarentena").val();
                var _replicarLote = $("#vpTxtReplicarLote").data("kendoNumericTextBox").value();

                _data.Ubicacion = { IdUbicacion: _idubicacion };
                _data.CantidadActual = _cantidadLote;
                _data.CantidadInicial = _cantidadInicial;
                _data.UnidadesMedidaDto = { Factor: _unidadMedida.Factor, TargetUoMID: _unidadMedida.TargetUoMID };
                _data.SSCC = _SSCC;
                _data.IdMaterial = _idMaterial;
                _data.Parametro03 = _loteProveedor;
                _data.FechaCaducidad = _fechaCaducidad;
                _data.LoteProveedor = _loteProveedor;
                _data.Proveedor = _proveedor;
                _data.Proceso = _proceso;
                _data.IdProceso = _proceso;
                _data.FechaEntradaPlanta = _fechaEntradaPlanta;
                _data.FechaEntradaUbicacion = _fechaEntradaUbicacion;
                _data.FechaInicioConsumo = _fechaInicioConsumo;
                _data.FechaFinConsumo = _fechaFinConsumo;
                _data.FechaCuarentena = _fechaCuarentena;
                _data.FechaBloqueo = _fechaBloqueo;
                _data.Defectuoso = _fechaDefecto;
                _data.MotivoBloqueo = _motivoBloqueo;
                _data.MotivoCuarentena = _motivoCuarentena;
                _data.ReplicarLote = _replicarLote;

                return _data;
            },
            CallAjax: function (_type, _url, _data, _elements) {
                var self = this;
                kendo.ui.progress($(".divFormControlStock"), true);
               
                $.ajax({
                    type: _type,
                    async: true,
                    data: JSON.stringify(_data),
                    url: _url,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        let MSG_TRUE = "";
                        if (res) {
                            var result = false;

                            if (_data.operacion != self.tipoOperaciones.CREAR_LOTE_2 && _data.operacion != self.tipoOperaciones.ELIMINAR_LOTE && _data.operacion != self.tipoOperaciones.MOVER) {
                                result = true;
                                //Not.crearNotificacion('success', window.app.idioma.t('INFORMACION'), window.app.idioma.t('MODIFICADO_CORRECTAMENTE'), 2000);
                                MSG_TRUE = "MODIFICADO_CORRECTAMENTE";
                            }
                            else if (_data.operacion == self.tipoOperaciones.CREAR_LOTE_2) {
                                if (res.ControlGestion01) {
                                    $("#result").html(window.app.idioma.t(res.ControlGestion01))
                                } else {
                                    result = true;
                                    //Not.crearNotificacion('success', window.app.idioma.t('INFORMACION'), window.app.idioma.t('CREADO_EL_LOTE'), 2000);
                                    MSG_TRUE = "CREADO_EL_LOTE";
                                }
                            }
                            else if (_data.operacion == self.tipoOperaciones.ELIMINAR_LOTE) {
                                result = true;
                                //Not.crearNotificacion('success', window.app.idioma.t('INFORMACION'), window.app.idioma.t('LOTE_ELIMINADO_CORRECTAMENTE'), 2000);
                                MSG_TRUE = "LOTE_ELIMINADO_CORRECTAMENTE";
                            }
                            else if (_data.operacion == self.tipoOperaciones.MOVER)

                                if (res != "true") {
                                    $("#result").html(window.app.idioma.t(res));
                                } else {
                                    result = true;
                                    //Not.crearNotificacion('success', window.app.idioma.t('INFORMACION'), window.app.idioma.t('MODIFICADO_CORRECTAMENTE'), 2000);
                                    MSG_TRUE = "MODIFICADO_CORRECTAMENTE";
                                }

                            if (result) {
                                $("#result").html("");
                                $(".k-i-close").trigger("click");
                                $("#btnSelTodos").prop("checked", false);
                                _elements.aplicarSeleccion();
                                _elements.registrosSelData = [];
                                _elements.dsStock.read().then(function () {
                                    if (MSG_TRUE != "") {
                                        Not.crearNotificacion('success', window.app.idioma.t('INFORMACION'), window.app.idioma.t(MSG_TRUE), 2000);
                                    }
                                });
                                $("#btnOperations").data("kendoDropDownList").select(0);
                            }
                            
                        }
                        else if (res == null && _data.operacion == self.tipoOperaciones.ELIMINAR_LOTE) {
                            Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('ERROR_ELIMINAR_LOTE_MOVS'), 2000);
                        }
                        else {
                            $("#result").text("Error - " + window.app.idioma.t('REVISE_DATOS_FORMULARIO'))
                        }
                       
                        kendo.ui.progress($("#divControlStock"), false);
                        kendo.ui.progress($(".divFormControlStock"), false);
                    },
                    error: function (err) {
                        kendo.ui.progress($(".divFormControlStock"), false);
                        kendo.ui.progress($("#divControlStock"), false);
                        if (_data.operacion == self.tipoOperaciones.ELIMINAR_LOTE) {
                            Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('ERROR_ELIMINAR_LOTE'), 2000);
                        }
                            else {
                            Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('FALTAN_DATOS_FORMULARIO'), 2000);
                        }
                       
                    }
                });
            },

            //3. Metodo que oculta los elementos del formulario de mantenimiento (Se utiliza para las ventanas de creacion)
            HideElementsFormMaintain: function (operacion) {
                var self = this;
                switch (operacion) {
                    case self.tipoOperaciones.AJUSTAR_CANTIDAD://AJUSTAR CANTIDAD
                        $(".divCantidad").show();
                        $(".divPrioridad , .divOption , .divOptionMotivo , .divUbicacionDestino , .divEstadoUbicacion , .divOptionDate , .divLote").hide();
                        break;
                    case self.tipoOperaciones.PRIORIDAD://PRIORIDAD
                        $(".divPrioridad").show();
                        $(".divCantidad , .divOption , .divOptionMotivo , .divUbicacionDestino , .divEstadoUbicacion , .divOptionDate , .divLote").hide();
                        break;
                    case self.tipoOperaciones.CUARENTENA://CUARENTENA
                        $(".divOption , .divOptionDate , .divOptionMotivo").show();
                        $(".divCantidad , .divUbicacionDestino , .divPrioridad , .divEstadoUbicacion , .divLote").hide();
                        break;
                    case self.tipoOperaciones.BLOQUEAR://BLOQUEAR LOTE
                        $(".divOption , .divOptionMotivo, .divOptionDate ").show();
                        $(".divCantidad , .divUbicacionDestino , .divPrioridad , .divEstadoUbicacion , .divLote").hide();
                        break;
                    case self.tipoOperaciones.MOVER://MOVER LOTE
                        $(".divLote").show();
                        $(".divCantidad , .divOption , .divOptionMotivo , .divPrioridad , .divEstadoUbicacion , .divOptionDate, #liTipoMaterial, #liClaseMaterial, #liMaterial, #liCantidad, #liLoteProveedor, #liSSCC, #liFechaCaducidad").hide();
                        break;
                    case self.tipoOperaciones.CREAR_LOTE_2://CREAR LOTE
                    case self.tipoOperaciones.EDITAR_LOTE:
                        $(".divLote").show();
                        $(".divCantidad , .divOption , .divOptionMotivo, .divUbicacionDestino , .divPrioridad ,.divOptionDate , .divEstadoUbicacion").hide();
                        $("#liCantidadMover").hide();
                        $("#liReplicarLote").hide();
                        $("#vpTxtCantidadMover").removeAttr("required");
                        $("#vpTxtReplicarLote").removeAttr("required");

                        if (operacion == self.tipoOperaciones.CREAR_LOTE_2) {
                            $("#liCantidadInicial").hide();
                            $("#liReplicarLote").show();
                            //$("#vpTxtReplicarLote").attr("required", "required");                            
                        }

                        break;
                    case self.tipoOperaciones.DEFECTUOSO://DEFECTUOSO
                    case self.tipoOperaciones.CADUCIDAD://CADUCIDAD LOTE
                        $(".divOption , .divOptionDate").show();
                        $(".divCantidad , .divUbicacionDestino , .divPrioridad , .divEstadoUbicacion , .divLote , .divOptionMotivo").hide();
                        break;
                }
            },

            UbicacionTieneOrdenEnCurso: function (idUbicacion) {
                var resp = false;
                $.ajax({
                    type: "GET",
                    url: "../api/resumenestadoordenes/" + idUbicacion,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: false,
                }).done(function (data) {
                    if (data.length > 0) {
                        if (data[0].Produccion > 0 || data[0].Iniciando > 0) {
                            resp = true;
                        }
                    }
                }).fail(function (err) {
                    Not.crearNotificacion('error', window.app.idioma.t('INFORMACION'), window.app.idioma.t('ERROR_OBTENIENDO_RESUMEN_LOTES'), 5000);
                });

                return resp;
            },

            MaterialPerteneceAlaOrden: function (IdLinea, IdZona, IdMaterial) {
                var resp = false;
                $.ajax({
                    type: "GET",
                    url: "../api/MaterialPerteneceAlaOrden/" + IdLinea + "/" + IdZona + "/" + IdMaterial,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: false,
                }).done(function (data) {
                    resp = data;
                }).fail(function (err) {
                    Not.crearNotificacion('error', window.app.idioma.t('INFORMACION'), window.app.idioma.t('ERROR_OBTENIENDO_DATOS'), 5000);
                });

                return resp;
            },

            SetElementsOperation: function (operacion, elements, functionsForm) {
                var self = this;
                var _valor = null,
                    _motivo = null,
                    _dataLote = {};
                var IdTipoUbicacion = definiciones.IdTipoUbicacion();
                switch (operacion) {
                    case self.tipoOperaciones.AJUSTAR_CANTIDAD://AJUSTAR CANTIDAD
                        _valor = $("#vpTxtCantidad").val();
                        break;
                    case self.tipoOperaciones.PRIORIDAD://PRIORIDAD
                        _valor = $("#vpTxtPrioridad").val();
                        break;
                    case self.tipoOperaciones.CUARENTENA://CUARENTENA
                        var _valueDate = $("#vpTxtOptionDate").data("kendoDateTimePicker").value();
                        _valor = _valueDate ? kendo.parseDate(_valueDate,"yyyy-MM-dd hh:mm:ss") : null;//Se pone la fecha en este formato para poder pasarlo por url
                        _motivo = $("#vpTxtOptionMotivo").val() != ""?$("#vpTxtOptionMotivo").val():null;
                        break;
                    case self.tipoOperaciones.BLOQUEAR://BLOQUEAR LOTE
                         var _valueDate = $("#vpTxtOptionDate").data("kendoDateTimePicker").value();
                         _valor = _valueDate ? kendo.parseDate(_valueDate, "yyyy-MM-dd hh:mm:ss") : null;
                        _motivo = $("#vpTxtOptionMotivo").val();
                        break;
                    case self.tipoOperaciones.MOVER://MOVER LOTE
                        _valor = $("#vpTxtUbicacion").data("kendoDropDownList").value();
                        if (_valor == "") {
                            Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('DEBE_SELECCIONAR_UNA_UBICACION'), 5000);
                            return false;
                        }
                        var dropdownlist = $("#vpTxtUbicacion").data("kendoDropDownList");
                        var elem = dropdownlist.dataItem();
                        if (elem.IdTipoUbicacion != null && elem.IdTipoUbicacion == IdTipoUbicacion.Consumo) {
                            if (elements.registrosSelData.length > 1) {
                                Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('SOLO_SE_DEBE_MOVER_UN_LOTE_A_UNA_UBICACION_DE_CONSUMO'), 5000);
                                return false;
                            }
                            // Validar que la orden tenga un estado diferente de pausada y planificada
                            if (!this.UbicacionTieneOrdenEnCurso(elem.IdUbicacion)) {
                                Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('UBICACION_NO_TIENE_ORDENES_EN_CURSO'), 5000);
                                return false;
                            }
                            // Evaluamos que el material a mover debe pertenecer al producto de la orden
                            if (!this.MaterialPerteneceAlaOrden(elem.IdLinea, elem.IdZona, elements.registrosSelData[0].IdMaterial)) {
                                Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('MATERIAL_A_MOVER_DEBE_PERTENECER_A_LA_ORDEN'), 5000);
                                return false;
                            }
                        }
                        if (elements.ShowCantidadMover) {
                            var _cantidadMover = $("#vpTxtCantidadMover").data("kendoNumericTextBox").value();
                            if (_cantidadMover == null || _cantidadMover == "" || _cantidadMover == 0) {
                                Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('DEBE_INGRESAR_UNA_CANTIDAD_MAYOR_A_CERO'), 5000);
                                return false;
                            }
                        }
                        for (var i = 0; i < elements.registrosSelData.length; i++) {
                            if (elements.registrosSelData[i].UbicacionOrigen == _valor) {
                                Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('DEBE_SELECCIONAR_UBICACION_DISTINTA'), 5000);
                                return false;
                            }
                            if (elements.ShowCantidadMover) {
                                var _cantidadMover = $("#vpTxtCantidadMover").data("kendoNumericTextBox").value();
                                if (_cantidadMover > elements.registrosSelData[i].CantidadActual) {
                                    Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('CANTIDAD_NO_PUEDE_SER_MAYOR_A_LA_CANTIDAD_DEL_LOTE'), 5000);
                                    return false;
                                }
                            }
                        }
                        break;
                    case self.tipoOperaciones.CREAR_LOTE_2://CAMBIAR ESTADO DE UBICACION
                        _dataLote = {}
                        let replicarLote = $("#vpTxtReplicarLote").data("kendoNumericTextBox").value();
                        if (replicarLote < 1 || replicarLote > 25) {
                            $("#result").text("El campo Replicar Lote solo admite valores entre 1 y 25");
                            return false;
                        } else {
                            $("#result").text("");
                        }

                        elements.ReplicarLote = replicarLote;
                        break;
                    case self.tipoOperaciones.DEFECTUOSO://DEFECTUOSO
                    case self.tipoOperaciones.CADUCIDAD://CADUCIDAD
                        var _valueDate = $("#vpTxtOptionDate").data("kendoDateTimePicker").value();
                        _valor = _valueDate ? kendo.parseDate(_valueDate, "yyyy-MM-dd hh:mm:ss") : null;//Se pone la fecha en este formato para poder pasarlo por url
                        _motivo = $("#vpTxtOption").data("kendoDropDownList") ? $("#vpTxtOption").data("kendoDropDownList").value() : null;
                        break;
                    case self.tipoOperaciones.EDITAR_PROPIEDADES_LOTE:

                        break;
                }
                if (operacion != self.tipoOperaciones.CREAR_LOTE_2) {
                    if (_valor || _valor == null)
                        functionsForm.AplicarOperacion(operacion, _valor, _motivo, elements);
                } else {
                    functionsForm.AplicarOperacion(operacion, _dataLote, _motivo, elements);
                }
            },

            //4. Metodo que carga los datos de la ventana de creación con el titulo y su id
            ShowWindowNewForm: function (e, elements, id, title) {
                var self = this;
                //5.Busca los codigos de los permisos de gestion para los lotes y lotes consumidos dentro de los permisos del usuario
                var permiso = window.app.sesion.attributes.funciones.some(x => x.id == 224 || x.id == 226 || x.id == 252 || x.id == 254);

                var _functionsForm = this;
                var _valuesSelected = elements.registrosSelData;
                if (_valuesSelected.length > 0 || id == self.tipoOperaciones.CREAR_LOTE_2) {
                    if (!permiso && id != self.tipoOperaciones.EDITAR_PROPIEDADES_LOTE) {
                        Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                    } else {
                        if (id != self.tipoOperaciones.OPERACIONES && id != self.tipoOperaciones.ELIMINAR_LOTE) {
                            
                            this.Window(id, title, elements);
                            this.RenderElements(id, elements);
                            elements.wnd = $('#wnd' + id).data("kendoWindow");
                            elements.wnd.open();
                            elements.wnd.center();

                            $(".btnAplicarCambio").kendoButton({
                                click: function (e) {
                                    e.preventDefault();
                                    _functionsForm.SetElementsOperation(id, elements, _functionsForm)

                                }
                            });

                            $("#btnAgregarProveedor").kendoButton({
                                click: function (e) {
                                    e.preventDefault();
                                    new vAgregarProveedor("vpTxtProveedor");

                                }
                            });

                            this.HideElementsFormMaintain(id);
                            if (elements.ShowCantidadMover) {
                                $("#liCantidadMover").show();
                            }
                        }
                        else if (id == self.tipoOperaciones.ELIMINAR_LOTE) {
                            this.confirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t("ELIMINAR_LOTE"), msg: window.app.idioma.t("CONFIRMACION_ELIMINAR_LOTE"), funcion: function () {
                                    _functionsForm.AplicarOperacion(self.tipoOperaciones.ELIMINAR_LOTE, null, null, elements);
                                    Backbone.trigger('eventCierraDialogo');
                                }, contexto: this
                            });
                        }
                    }
                } else {
                    $("#btnOperations").data("kendoDropDownList").select(0);
                    Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('SELECCIONAR_LOTE'), 2000);
                }
            },

            RenderElements: function (option,elements) {
                var self = this;                

                var itemSeleccionado = elements.registrosSelData && (option == self.tipoOperaciones.EDITAR_LOTE || option == self.tipoOperaciones.EDITAR_PROPIEDADES_LOTE) ? elements.registrosSelData[0] : null;
                switch (option) {
                    case self.tipoOperaciones.CREAR_LOTE_2:
                    case self.tipoOperaciones.MOVER:
                    case self.tipoOperaciones.EDITAR_LOTE:
                        var idAlmacen = 0;
                        var idZona = 0;

                        if (option == self.tipoOperaciones.EDITAR_LOTE) {
                            idAlmacen = elements.registrosSelData[0].IdAlmacen !== undefined ? elements.registrosSelData[0].IdAlmacen : 0;
                            idZona = elements.registrosSelData[0].IdZona !== undefined ? elements.registrosSelData[0].IdZona : 0;
                        }

                        $("#form").show();
                        $("#gridPropiedadesLote").hide();
                        var urlGetUbicacion = "../api/GetLocation/";
                        //if (option == self.tipoOperaciones.CREAR_LOTE_2) {
                        //    urlGetUbicacion = "../api/GetUbicacionesCrearLote/";
                        //}

                        $("#vpTxtAlmacen").kendoDropDownList({
                            filter: "contains",
                            dataTextField: "Descripcion",
                            dataValueField: "IdAlmacen",
                            optionLabel: window.app.idioma.t("SELECCIONAR_ALMACEN"),
                            dataSource: {
                                transport: {
                                    read: {
                                        url: "../api/GetDepot/",
                                        dataType: "json"
                                    }
                                },
                                sort: { field: "Descripcion", dir: "asc" },
                            },
                            select: function (e) {
                                var dataItem = this.dataItem(e.item);
                                var IdAlmacen = dataItem.IdAlmacen;

                                //Se setea el dataSource del combo de Zona
                                dsZona.transport.options.read.url = "../api/GetZone/" + IdAlmacen;
                                dsZona.read();

                                //Se setea el DataSource se Ubicacion
                                dsUbicacion.transport.options.read.url = urlGetUbicacion + IdAlmacen + "/0"
                                dsUbicacion.read();
                            },

                        }).data("kendoDropDownList");

                        var dsZona = new kendo.data.DataSource({
                            batch: true,
                            transport: {
                                read: {
                                    url: "../api/GetZone/" + idAlmacen,
                                    dataType: "json",                                    
                                    cache: false
                                }

                            },
                            sort: { field: "Descripcion", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdZona",
                                    fields: {
                                        'IdZona': { type: "number" },
                                        'Descripcion': { type: "string" }
                                    }
                                }
                            }
                        });

                        $("#vpTxtZona").kendoDropDownList({
                            autoBind: false,
                            dataTextField: "Descripcion",
                            dataValueField: "IdZona",
                            filter: "contains",
                            optionLabel: window.app.idioma.t("SELECCIONAR_ZONA"),
                            dataSource: dsZona,
                            select: function (e) {
                                var dataItem = this.dataItem(e.item);
                                var IdZona = dataItem.IdZona;

                                var IdAlmacen = $("#vpTxtAlmacen").data("kendoDropDownList").value();

                                dsUbicacion.transport.options.read.url = urlGetUbicacion + IdAlmacen + "/" + IdZona
                                dsUbicacion.read();
                            },
                        }).data("kendoDropDownList");

                        var dsUbicacion = new kendo.data.DataSource({
                            batch: true,
                            transport: {
                                read: {
                                    url: urlGetUbicacion + idAlmacen + "/" + idZona,
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
                                        'Nombre': { type: "string" }
                                    }
                                }
                            }
                        });

                        $("#vpTxtUbicacion").kendoDropDownList({
                            filter: "contains",
                            optionLabel: window.app.idioma.t("SELECCIONE_UBICACION"),
                            dataTextField: "Nombre",
                            dataValueField: "IdUbicacion",
                            dataSource: dsUbicacion,
                            dataBound: function () {
                                if (itemSeleccionado) {
                                    if (itemSeleccionado.UbicacionOrigen)
                                        this.value(itemSeleccionado.UbicacionOrigen);
                                }
                            },
                        }).data("kendoDropDownList");

                        var dsTipoMaterial = new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: "../api/GetTipoMaterial",
                                    dataType: "json"
                                }
                            },
                            sort: { field: "Descripcion", dir: "asc" },
                            filter: {
                                logic: "or",
                                filters: [
                                    { field: "IdTipoMaterial", operator: "eq", value: "01" },
                                    { field: "IdTipoMaterial", operator: "eq", value: "02" }
                                ]
                            }
                        });

                        $("#vpTxtTipoMaterial").kendoDropDownList({
                            optionLabel: window.app.idioma.t('SELECCIONE_UNO'),
                            dataSource: dsTipoMaterial,
                            filter: "contains",
                            dataTextField: "Descripcion",
                            dataValueField: "IdTipoMaterial",
                            select: function (e) {
                                var dataItem = this.dataItem(e.item);

                                //Se setea el dataSource del combo de Clase de Material
                                dsClaseMaterial.transport.options.read.url = "../api/GetClaseMaterial/" + dataItem.IdTipoMaterial;
                                dsClaseMaterial.read();

                                dataItem.IdTipoMaterial = dataItem.IdTipoMaterial == "" ? "00" : dataItem.IdTipoMaterial;

                                //Se setea el DataSource de Material
                                dsReferenciaMaterial.transport.options.read.url = "../api/GetMaterial/" + dataItem.IdTipoMaterial + "/00";
                                dsReferenciaMaterial.read();
                            },
                        });

                        var dsClaseMaterial = new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: "../api/GetClaseMaterial",
                                    dataType: "json"
                                }
                            },
                            sort: { field: "Descripcion", dir: "asc" },
                        });

                        $("#vpTxtClaseMaterial").kendoDropDownList({
                            autoBind: false,
                            optionLabel: window.app.idioma.t('SELECCIONE_UNO'),
                            dataSource: dsClaseMaterial,
                            filter: "contains",
                            dataTextField: "Descripcion",
                            dataValueField: "IdClaseMaterial",
                            select: function (e) {
                                var dataItem = this.dataItem(e.item);

                                var idTipoMaterial = $("#vpTxtTipoMaterial").data("kendoDropDownList").value();

                                idTipoMaterial = idTipoMaterial == "" ? "00" : idTipoMaterial;
                                dataItem.IdClaseMaterial = dataItem.IdClaseMaterial == "" ? "00" : dataItem.IdClaseMaterial;

                                dsReferenciaMaterial.transport.options.read.url = "../api/GetMaterial/" + idTipoMaterial + "/" + dataItem.IdClaseMaterial;
                                dsReferenciaMaterial.read();
                            },
                        });

                        var dsReferenciaMaterial = new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: "../api/GetMaterial",
                                    dataType: "json"
                                }
                            },
                            sort: { field: "DescripcionCompleta", dir: "asc" },
                        });

                        $("#vpTxtMaterial").kendoDropDownList({
                            //autoBind: false,
                            optionLabel: window.app.idioma.t('SELECCIONE_UNO'),
                            dataSource: dsReferenciaMaterial,
                            filter: "contains",
                            dataTextField: "DescripcionCompleta",
                            dataValueField: "IdMaterial",
                            open: function (e) {
                                var listContainer = e.sender.list.closest(".k-list-container");
                                listContainer.width(listContainer.width() + kendo.support.scrollbar());
                            },
                            select: function (e) {
                                var dataItem = this.dataItem(e.item);
                                var uriTipo = "../api/GetTipoMaterial",
                                    uriClase = "../api/GetClaseMaterial";

                                dsTipoMaterial.transport.options.read.url = dataItem.IdMaterial ? "../api/GetTipoMaterialPorReferencia/" + dataItem.IdMaterial : uriTipo;
                                dsTipoMaterial.read();


                                dsClaseMaterial.transport.options.read.url = dataItem.IdMaterial ? "../api/GetClaseMaterialPorReferencia/" + dataItem.IdMaterial : uriClase;
                                dsClaseMaterial.read();
                            },
                            dataBound: function () {
                                if (itemSeleccionado) {
                                    if (itemSeleccionado.IdMaterial)
                                        this.value(itemSeleccionado.IdMaterial);
                                }
                               
                            },
                        });

                        $("#vpTxtProveedor").kendoDropDownList({
                            filter: "contains",
                            optionLabel: window.app.idioma.t('SELECCIONE_UNO'),
                            open: function (e) {
                                var listContainer = e.sender.list.closest(".k-list-container");
                                listContainer.width(listContainer.width() + kendo.support.scrollbar());
                            },
                            dataTextField: "NombreFull",
                            dataValueField: "IdProveedor",
                            dataSource: {

                                transport: {
                                    read: {
                                        url: "../api/GetMaestroProveedorLoteMMPP",
                                        dataType: "json"
                                    }

                                },
                                sort: { field: "NombreFull", dir: "asc" },
                                schema: {
                                    model: {
                                        id: "IdProveedor",
                                        fields: {
                                            'IdProveedor': { type: "int" },
                                            'Nombre': { type: "string" },
                                            'NombreFull': { type: "string" },
                                        }
                                    }
                                }
                            },
                            dataBound: function () {
                                if (itemSeleccionado) {
                                    if (itemSeleccionado.IdProveedor)
                                        this.value(itemSeleccionado.IdProveedor);
                                }
                            },
                        });

                        var vpTxtMaterial = $("#vpTxtMaterial").data("kendoDropDownList");
                        vpTxtMaterial.list.width("auto-5");

                        $("#vpTxtCantidadLote").kendoNumericTextBox({
                            min: 0,
                            culture: localStorage.getItem("idiomaSeleccionado"),
                        });

                        $("#vpTxtCantidadInicial").kendoNumericTextBox({
                            min: 0,
                            culture: localStorage.getItem("idiomaSeleccionado"),
                        });

                        $("#vpTxtReplicarLote").kendoNumericTextBox({
                            decimals: 0,
                            format: '#',
                            culture: localStorage.getItem("idiomaSeleccionado"),
                        });

                        $("#vpTxtCantidadMover").kendoNumericTextBox({
                            culture: localStorage.getItem("idiomaSeleccionado")
                        });

                        $("#liCantidadMover").hide();
                        $("#vpTxtCantidadMover").removeAttr("required");

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
                                        id: "PK",
                                        fields: {
                                            'PK': { type: "int" },
                                            'SourceUoMID': { type: "string" },
                                        }
                                    }
                                }

                            }
                        });

                        $("#vpTxtUnidadMedida").kendoDropDownList({
                            autoBind: true,
                            optionLabel: "",
                            dataBound: function () {
                                if (itemSeleccionado) {
                                    if (itemSeleccionado.Unidad)
                                        this.text(itemSeleccionado.Unidad);
                                }
                            },
                            dataSource: dsUnidadMedida,
                            dataTextField: "SourceUoMID",
                            dataValueField: "PK",
                        });

                        $("#vpTxtFechaCaducidad").kendoDatePicker({
                            format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                            culture: localStorage.getItem("idiomaSeleccionado")
                        });

                        $("#vpTxtFechaEntradaPlanta").kendoDateTimePicker({
                            format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                            culture: localStorage.getItem("idiomaSeleccionado")
                        });

                        $("#vpTxtFechaEntradaUbicacion").kendoDateTimePicker({
                            format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                            culture: localStorage.getItem("idiomaSeleccionado")
                        });

                        $("#vpTxtFechaInicioConsumo").kendoDateTimePicker({
                            format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                            culture: localStorage.getItem("idiomaSeleccionado")
                        });

                        $("#vpTxtFechaFinConsumo").kendoDateTimePicker({
                            format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                            culture: localStorage.getItem("idiomaSeleccionado")
                        });

                        $("#vpTxtFechaBloqueo").kendoDateTimePicker({
                            format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                            culture: localStorage.getItem("idiomaSeleccionado")
                        });

                        $("#vpTxtFechaCuarentena").kendoDateTimePicker({
                            format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                            culture: localStorage.getItem("idiomaSeleccionado")
                        });

                        $("#vpTxtFechaDefectuoso").kendoDateTimePicker({
                            format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                            culture: localStorage.getItem("idiomaSeleccionado")
                        });

                        $("#form").kendoValidator({}).data("kendoValidator");

                        $("#vpTxtProceso").kendoDropDownList({
                            filter: "contains",
                            dataTextField: "Descripcion",
                            dataValueField: "IdProceso",
                            //optionLabel: window.app.idioma.t("SELECCIONAR_PROCESO"),
                            dataSource: [
                                { IdProceso: self.procesosLote.REC, Descripcion: window.app.idioma.t('RECEPCION') },
                                { IdProceso: self.procesosLote.ENV, Descripcion: window.app.idioma.t('ENVASADO') },
                                { IdProceso: self.procesosLote.FAB, Descripcion: window.app.idioma.t('GENERAL_FABRICACION') },
                            ],
                            index: 0,
                            //dataSource: {
                            //    transport: {
                            //        read: {
                            //            url: "../api/ObtenerProcesosLotes/" + elements.isFabricacion,
                            //            dataType: "json"
                            //        }
                            //    },
                            //    sort: { field: "Descripcion", dir: "asc" },
                            //},
                            dataBound: function () {
                                if (itemSeleccionado) {
                                    if (itemSeleccionado.IdLote) {
                                        var _idProceso = self.ObtenerValorProcesoPorIdLote(self, itemSeleccionado.IdLote);
                                        this.value(_idProceso);
                                    } 
                                }
                            },
                        }).data("kendoDropDownList");

                        if (itemSeleccionado) {
                            $("#vpTxtCantidadLote").data("kendoNumericTextBox").value(itemSeleccionado.CantidadActual);
                            $("#vpTxtCantidadInicial").data("kendoNumericTextBox").value(itemSeleccionado.CantidadInicial);
                            $("#vpTxtFechaCaducidad").data("kendoDatePicker").value(itemSeleccionado.FechaCaducidad);
                            $("#vpTxtFechaEntradaPlanta").data("kendoDateTimePicker").value(itemSeleccionado.FechaEntradaPlanta);
                            $("#vpTxtFechaEntradaUbicacion").data("kendoDateTimePicker").value(itemSeleccionado.FechaEntradaUbicacion);
                            $("#vpTxtFechaInicioConsumo").data("kendoDateTimePicker").value(itemSeleccionado.FechaInicioConsumo);
                            $("#vpTxtFechaFinConsumo").data("kendoDateTimePicker").value(itemSeleccionado.FechaFinConsumo);
                            $("#vpTxtFechaBloqueo").data("kendoDateTimePicker").value(itemSeleccionado.FechaBloqueo);
                            $("#vpTxtFechaCuarentena").data("kendoDateTimePicker").value(itemSeleccionado.FechaCuarentena);
                            $("#vpTxtFechaBloqueo").data("kendoDateTimePicker").value(itemSeleccionado.FechaBloqueo);
                            $("#vpTxtFechaDefectuoso").data("kendoDateTimePicker").value(itemSeleccionado.Defectuoso);
                            $("#vpTxtAlmacen").data("kendoDropDownList").value(itemSeleccionado.IdAlmacen);
                            $("#vpTxtZona").data("kendoDropDownList").value(itemSeleccionado.IdZona);
                            $("#vpTxtTipoMaterial").data("kendoDropDownList").value(itemSeleccionado.IdTipoMaterial);
                            $("#vpTxtClaseMaterial").data("kendoDropDownList").value(itemSeleccionado.IdClaseMaterial);

                            $("#vpTxtMotivoCuarentena").val(itemSeleccionado.MotivoCuarentena);
                            $("#vpTxtMotivoBloqueo").val(itemSeleccionado.MotivoBloqueo);
                            $("#vpTxtLoteProveedor").val(itemSeleccionado.LoteProveedor);
                            $("#vpTxtLote").val(itemSeleccionado.IdLote);
                            $("#vpTxtSSCC").val(self.ObtenerValorSSCCPorIdLote(itemSeleccionado.IdLote));

                            $(".liEdicionLote").show();
                            $("#vpTxtCantidadInicial").attr("required", "required");

                            let proceso = self.ObtenerValorProcesoPorIdLote(self, itemSeleccionado.IdLote);

                            if (proceso == self.procesosLote.ENV) {
                                $("#vpTxtProveedor").removeAttr("required");
                                $("#vpTxtLoteProveedor").removeAttr("required");
                            } else {
                                $("#vpTxtProveedor").attr("required", "required");
                                $("#vpTxtLoteProveedor").attr("required", "required");
                            }

                        } else {
                            $(".liEdicionLote").hide();
                            $("#vpTxtCantidadInicial").removeAttr("required");
                            $("#vpTxtCantidadMover").removeAttr("required");
                            $("#vpTxtReplicarLote").removeAttr("required");
                            $("#vpTxtUbiCambio").removeAttr("required");
                        }
                        break;
                    case "23":

                        var dsUbicacion = new kendo.data.DataSource({
                            batch: true,
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
                                        'Nombre': { type: "string" }
                                    }
                                }
                            }
                        });


                        $("#vpTxtUbiCambio").kendoDropDownList({
                            autoBind: false,
                            filter: "contains",
                            optionLabel: window.app.idioma.t("SELECCIONE_UBICACION"),
                            dataTextField: "Nombre",
                            dataValueField: "IdUbicacion",
                            dataSource: dsUbicacion
                        }).data("kendoDropDownList");


                        break;
                    case self.tipoOperaciones.EDITAR_PROPIEDADES_LOTE:
                        var idLote = itemSeleccionado.IdLoteMateriaPrima ? itemSeleccionado.IdLoteMateriaPrima : itemSeleccionado.IdLoteSemielaborado;
                        var idTipo = elements.isFabricacion ? self.tipoMovimientoLote.Fabricacion : itemSeleccionado.IdLoteSemielaborado ? self.tipoMovimientoLote.Semielaborado : self.tipoMovimientoLote.Envasado;
                        $("#form").hide();
                        $("#gridPropiedadesLote").show();
                        self.RenderGridPropiedadesLotes(elements.registrosSelData, idLote, idTipo, elements.PropiedadesEditables,true);
                        break;
                    default:
                        $("#vpTxtCantidad").kendoNumericTextBox({
                            culture: localStorage.getItem("idiomaSeleccionado")
                        });

                        $("#vpTxtPrioridad").kendoNumericTextBox({
                            culture: localStorage.getItem("idiomaSeleccionado"),
                            min: 0,
                            max: 100,
                            format: "n0"
                        });

                        $("#vpTxtOption").kendoDropDownList({
                            dataSource: [
                                        { id: self.tipoOperaciones.OPERACIONES, name: window.app.idioma.t('SI') },
                                        { id: self.tipoOperaciones.AJUSTAR_CANTIDAD, name: window.app.idioma.t('NO') },
                            ],
                            dataTextField: "name",
                            dataValueField: "id",
                            change: function () {
                                var value = this.value();
                                var _option = $("#btnOperations").data("kendoDropDownList").value();
                                if (value == self.tipoOperaciones.AJUSTAR_CANTIDAD) {
                                    $(".divOptionDate").hide();
                                    $(".divOptionMotivo").hide();
                                    $("#vpTxtOptionDate").val('');
                                    $("#vpTxtOptionMotivo").val('');
                                } else {

                                    if (_option != self.tipoOperaciones.BLOQUEAR)
                                        $(".divOptionDate").show();
                                    $(".divOptionMotivo").show();
                                }
                            }
                        });
                        $("#vpTxtOptionDate").kendoDateTimePicker({
                            format: "dd/MM/yyyy HH:mm",
                            culture: localStorage.getItem("idiomaSeleccionado")
                        });

                        var dsEstadoUbicacion = new kendo.data.DataSource({
                            transport: {
                                read: "../api/ObtenerEstadosUbicacion",
                                dataType: "json"

                            },
                            sort: { field: "Descripcion", dir: "asc" },

                        });

                        $("#vpTxtEstadoUbicacion").kendoDropDownList({
                            optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                            dataSource: dsEstadoUbicacion,
                            filter: "contains",
                            dataTextField: "Descripcion",
                            dataValueField: "IdEstadoUbicacion",
                        });
                        break;

                }
            },

            RenderGridPropiedadesLotes: function (elements, idLote, idTipo,editable,resizeGrid) {
                new vPropiedadesLotes(elements, idLote, idTipo, editable, "#gridPropiedadesLote", resizeGrid);
            },
            
            //5. Metodo generico que crea una nueva ventana con un id y un titulo (Se utiliza para las ventanas de creacion)
            Window: function (id, title, elements) {
                var self = this;

                if (elements.wnd != null) {
                    elements.wnd.destroy();
                    elements.wnd = null;
                }

                if (id != self.tipoOperaciones.OPERACIONES) {
                    $("#divWnd").prepend($('<div class="wnd" id="wnd' + id + '">' + elements.vpOperaciones() + '</div>'));

                    var _height = window.innerHeight > 1200 ? 'auto' : window.innerHeight - 100;
                    let maxHeight = $("#center-pane").outerHeight() * 0.95;
                    let maxWidth = $("#center-pane").outerWidth() * 0.95;

                    $("#wnd" + id).kendoWindow({
                        width: '960px',
                        visible: false,
                        title: title,
                        modal: true,
                        minWidth: '760px',
                        maxHeight: maxHeight,
                        maxWidth: maxWidth,
                        close: function (e) {
                            $(this.element).empty();
                            $("#btnOperations").data("kendoDropDownList").select(0);
                            this.setOptions({ modal: false })
                        },
                        deactivate: function (e) {
                            this.destroy();
                        }
                    });
                }
            },
            ObtenerValorProcesoPorIdLote: function (self, idLote) {
                const proceso = idLote.split('-')[4];
                if (proceso == self.procesosLoteString.Envasado)
                    return self.procesosLote.ENV;
                if (proceso == self.procesosLoteString.Fabricacion)
                    return self.procesosLote.FAB;
                
                return self.procesosLote.REC;
            },
            ObtenerValorSSCCPorIdLote: function (idLote) {
                if (idLote) {
                    var _camposIdLote = idLote.split("-");
                    if (_camposIdLote.length == 8) {
                        return _camposIdLote[7];
                    }
                }
                
                return "";
            }
        }

        return mantenimiento;      
    });