define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/VerDetalleOrden.html',
    'compartido/notificaciones',
    'vistas/vDialogoConfirm', 'vistas/Fabricacion/vDeclararProd',
    'vistas/Fabricacion/vCambiarProcedimientos', 'vistas/Fabricacion/vVerDeltaV',
    'vistas/Fabricacion/vDuplicarEntry', 'vistas/Fabricacion/vConsumoMaterial',
    'jszip', 'vistas/Fabricacion/vEditarProcedimientos',
    'vistas/Fabricacion/vVerDetalleLIMS', 'definiciones', 'vistas/Fabricacion/vVerDetallesOrden_ProcesoSAI', 'vistas/Fabricacion/vVerDetallesOrden_KOPs'
    , 'vistas/Fabricacion/vVerDetallesOrden_KOPsMultivalor', 'vistas/Fabricacion/vVerDetallesOrden_Notas', 'vistas/Fabricacion/vVerDetallesOrden_Consumo'
    , 'vistas/Fabricacion/vVerDetallesOrden_Produccion', 'vistas/Fabricacion/vVerDetallesOrden_TransferenciasSAI',
    'vistas/Fabricacion/vVerDetallesOrden_LIMS'
],
    function (_, Backbone, $, FormDetalleOrden, Not, VistaDlgConfirm, VistaDeclararProd, VistaProcedimientos,
        VistaDeltaV, vistaDuplicarEntry, VistaConsumoMaterial, JSZip, vistaEditaProcs, vistaDetalleLims, 
        definiciones, vistaProcesoSAI, vistaKOPs, vistaKOPsMultivalor, vistaNotas, vistaConsumo, vistaProduccion, vistaTransfSAI,
        vistaLIMS) {
        var vistaDetalleOrden = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            curvas: null,
            confirmacion: null,
            dataOrden: null,
            dialogoConfirm: null,
            dsConsumo: [],
            dsCurvaOrden: [],
            dsLims: null,
            dsPlanificado: null,
            dsProduccion: [],
            dsConsumoDetalle: null,
            dsProdDetalle: null,
            dsKOPSMaestros: null,
            dsMultivalor: null,
            dsProcedimientos: null,
            detailMultiValue: null,
            dsSampleType: null,
            dsSubDepartament: null,
            dsHistorian: null,
            dsCmbProc: [],
            dsKOPS: null,
            expandedRowUidGridCurvas: null,
            gridProduccion: null,
            gridConsumo: null,
            gridKOPS: null,
            gridProcs: null,
            gridCurvas: null,
            gridTransferencias: null,
            gridLims: null,
            gridhistorian: null,
            historian: null,
            IdOrden: 0,
            IdTipoOrden :null,
            masterMultiValue: null,
            opciones: null,
            order: [],
            objIndex: null,
            procsHistorian: null,
            selectedTab: null,
            template: _.template(FormDetalleOrden),
            vistaFormWo: null,
            ventanaEditarCrear: null,
            vistaDeclararProd: null,
            vistaProcs: null,
            isOrdenActiva: true,
            Recalcular: false,
            Tipo_KOP_Mod: '',
            ColorEstado: '',
            IdEstadoWO: definiciones.IdEstadoWO(),
            estadosKOP: definiciones.EstadoKOP(),
            estadoColor: definiciones.EstadoColor(),
            tipoWO: definiciones.TipoWO(),
            WorkFlowData: null,
            vistaProduccionCargada: false,
            vistaConsumoCargada: false,
            vistaKOPsMultivalorCargada: false,
            vistaKOPsCargada: false,
            vistaTransfSAICargada: false,
            vistaLIMSCargada: false,
            vistaNotasCargada: false,
            initialize: function (options, ordenActiva, IdTipoOrden) {
                var self = this;

                dataOrden = options;
                self.opciones = options;
                self.IdOrden = self.opciones.IdWO;
                self.IdTipoOrden = IdTipoOrden !== null ? IdTipoOrden !== undefined ? IdTipoOrden : self.order.TipoOrden.ID : self.order.TipoOrden.ID;
                window.JSZip = JSZip;
                kendo.ui.progress(self.$("#contenedor"), true);

                self.isOrdenActiva = ordenActiva;

                self.ActualizaDetalle(self);
            },
            render: function () {
                var self = this;
                var element = document.getElementById("divHTMLContenido");
                var tempduracionEstimada;

                if (self.order.FecInicio != "---" && self.order.FecFin != "---") {
                    let difHoras = ((Date.parse(self.order.FecFinLocal) - Date.parse(self.order.FecIniLocal)) / (3600 * 1000)).toFixed(2);
                    tempduracionEstimada = ConversorHorasMinutosSegundos(difHoras * 3600);
                } else {
                    tempduracionEstimada = "---";
                }
                
                self.order.duracionEstimada = tempduracionEstimada;

                self.order.TituloExtracto = self.IdTipoOrden == self.tipoWO.Guarda ? window.app.idioma.t('EXTRACTO_ORIGINAL') :
                                            self.IdTipoOrden == self.tipoWO.Filtracion ? window.app.idioma.t('CANTIDAD_KG_CLARIF') : window.app.idioma.t('EXTRACTO_SECO_P') ;
                self.order.TituloExtracto += ":";

                self.order.TituloLoteLevadura = self.IdTipoOrden == self.tipoWO.Guarda ? window.app.idioma.t('GAF') :
                    self.IdTipoOrden == self.tipoWO.Filtracion ? window.app.idioma.t("TIEMPO_PREP_FILTRO_KG") :
                        self.IdTipoOrden == self.tipoWO.Prellenado ? window.app.idioma.t("OXIGENO") :window.app.idioma.t("LOTE_LEVADURA");

                self.order.TituloLoteLevadura += ":";
                self.order.UnidadExtracto = self.order.MaterialSobrante != "" ?
                    self.IdTipoOrden == self.tipoWO.Filtracion ? " " + window.app.idioma.t("KG") :" P " : "";
                self.order.UnidadLoteLevadura = self.IdTipoOrden == self.tipoWO.Filtracion ?
                    " " : self.IdTipoOrden == self.tipoWO.Prellenado ? " " + window.app.idioma.t("PPB") : "";

                if (self.IdTipoOrden == self.tipoWO.Filtracion) {
                    let horas = self.order.LoteLevadura.replace(",", ".");
                    if (horas != "") {
                        let Horas = parseFloat(horas);
                        var tiempoConvertido = ConversorHorasMinutosSegundos(Horas * 3600);
                        self.order.LoteLevadura = tiempoConvertido;
                    }
                    else {
                        self.order.LoteLevadura = "---";
                    }
                }

                var temp = $(this.el).html(this.template({ 'order': self.order }));
                if (self.IdTipoOrden !== self.tipoWO.Coccion) {
                    $('.tipoOrden').css('display', 'none');
                }
                $("#lblCabeceraDetalle").show();
                document.getElementById("lblCabeceraListadoWO").style.textDecoration = "underline";
                document.getElementById("lblCabeceraListadoWO").style.cursor = "pointer";
                //$(this.el).html(this.template({ 'order': self.order }));
                element.appendChild(temp[0]);

                self.ColorEstado = this.order.EstadoActual.Color
                self.SwitchColorEstadoActual(this.order.EstadoActual.Color);
                self.Recalcular = this.order.EstadoActual.Recalcular;
                self.SetColorTabNotas();
                self.SetCurvasTabColor();
                self.SetLIMsTabColor();

                var tabStrip = this.$("#tpInfoOrden").kendoTabStrip({
                    scrollable: true,
                    animation: {
                        open: {
                            effects: "fadeIn"
                        }
                    },
                    select: function (e) {
                        self.SelectTab(e, self);
                    }
                }).data("kendoTabStrip");

                self.CargarTabProcesos(self);
                self.gridProcs = $('#gridProcs').data('kendoGrid');
                self.ActivarBotonesSegunPermisos(self);
                //tabStrip.disable(tabStrip.tabGroup.children().eq(3)); //Medidas
                //tabStrip.disable(tabStrip.tabGroup.children().eq(4)); //Notas
                //tabStrip.disable(tabStrip.tabGroup.children().eq(7)); //LIMS

                if (self.IdTipoOrden !== self.tipoWO.Coccion) {
                    $('.tipoOrden').hide();
                    $('#idTipoEficiencia').hide();
                    $('#idTipoLoteLevadura').show();

                    if (self.IdTipoOrden == self.tipoWO.Trasiego || self.IdTipoOrden == self.tipoWO.Concentrado) {
                        $('#loteEficiencia').hide();
                        $('#extracto').hide();
                    } else if (self.IdTipoOrden == self.tipoWO.Filtracion) {
                        $("#porcentajesFiltracion").show();
                    } else if (self.IdTipoOrden == self.tipoWO.Prellenado) {
                        $("#propPrellenado").show();
                    }
                } 

                if (!self.isOrdenActiva) {
                    $('#btnCerrarOrden').hide();
                    $('#btnConsolidarDatos').hide();
                }
            },
            events: {
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnCerrarOrden': 'CierraOrden',
                'click .btnParar': 'PararProcedimiento',
                'click .btnArrancar': 'ArrancarProcedimiento',
                'click #btnDuplicarEntry': 'DuplicarEntry',
                'click #btnSelTodos': function (e) { this.AplicarSeleccion(true, e); },
                'click #btnDesSelTodos': function (e) { this.AplicarSeleccion(false, e); },
                'click .btnAsignarCurva': 'AsignaValoresCurva',
                'click #': 'ConsultaGraficoCurva',
                'click .btnGrafico': 'ConsultaGraficoCurva',
                'click #btnPDFCurva': 'PdfCurva',
                'click #btnPDFCurvaGrafico': 'PdfCurvaGrafico',
                'click #btnConsultarHistorian': 'SeleccionaHistorian',
                'click #btnGraficoHistorian': 'GraficoHistorian',
                'click #btnTablaHistorian': 'SeleccionaHistorian',
                'click #btnPDFGraficoHistorian': 'PdfHistorianGrafico',
                'click #btnPDFHistorian': 'PdfHistorian',
                'click #btnExcelHistorian': 'ExcelHistorian',
                'change #cmbProcedimientoHistorian': 'CambiaProcHistorian',
                'click #chkHistorian': 'CambiaFechasHistorian',
                'click #btnActualizarProcs': 'ActualizaProcesos',
                'click .btnEditarProc': 'EditaInfoProc',
                'change #cmdProc': 'ArrancarProcedimiento',
                'click .checkboxGrid': 'CheckGrid',
                'click #divCurvas': 'DivCurvas',
                'click #btnTablaChart': 'DivCurvas',
                'click #btnPdfMultiValorGrafico': 'PdfHistorianGrafico',
                'click .detalleLims': 'DetalleLims',
                'click .eliminaLims': 'EliminaLims',
                'click #iconsalir': 'ConsultaTablaCurva'
            },
            ActualizaDetalle: function (self, opts) {
                var self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/OrdenesFab/ObtenerDetalleOrden/" + parseInt(self.IdOrden) + "/" + self.IdTipoOrden,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.order = data;
                    self.order.Material.Nombre = data.Material.ID + " - " + data.Material.Descripcion;

                    if (data != null) {
                        if (self.order.FecInicio != null) {
                            self.order.FecInicio = kendo.toString(kendo.parseDate(self.order.FecIniLocal), kendo.culture().calendars.standard.patterns.MES_FechaHora);
                        } else {
                            self.order.FecInicio = "---";
                        }
                        if (self.order.FecFin != null) {
                            self.order.FecFin = kendo.toString(kendo.parseDate(self.order.FecFinLocal), kendo.culture().calendars.standard.patterns.MES_FechaHora);
                        } else {
                            self.order.FecFin = "---";
                        }
                        if (self.order.FecInicioEstimado != null) {
                            self.order.FecInicioEstimado = kendo.toString(kendo.parseDate(self.order.FecInicioEstimado), kendo.culture().calendars.standard.patterns.MES_FechaHora);
                        } else {
                            self.order.FecInicioEstimado = "---";
                        }
                        if (self.order.FecFinEstimado != null) {
                            self.order.FecFinEstimado = kendo.toString(kendo.parseDate(self.order.FecFinEstimado), kendo.culture().calendars.standard.patterns.MES_FechaHora);
                        } else {
                            self.order.FecFinEstimado = "---";
                        }
                    }
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 2000);
                });

                self.render();

                if (opts && opts.cambioTipoMaterial) {
                    self.peticionLims(self.order.LoteMES);
                }
            },
            peticionLims: function (Lote) {
                var self = this;

                var workFlow = self.obtenerConfiguracionMuestrasAutomaticas(Lote);

                //Si no encuentra la configuración del workflow salimos
                if (workFlow == null) {
                    return;
                }
                //Si existe pero no está activo no hacemos nada
                else if (!workFlow.Activo) 
                {
                    return;
                }

                self.obtenerDatosWorkFlow(workFlow.IdMaestroFlujos);

                // Extraer la 7ª seccion la fecha del lote
                var fechaRaw = null;
                try {
                    var partes = (Lote || '').split('-');
                    fechaRaw = partes.length >= 7 ? partes[6] : null;
                } catch (e) {
                    fechaRaw = null;
                }

                // Pasamos la fecha que viene en utc a datetime local
                var fechaLote = parseToLocalDate(fechaRaw);

                let data = {
                    IdLoteMES: Lote,
                    FechaLoteMES: fechaLote.toISOString(),
                    IdWorkflow: workFlow.IdMaestroFlujos,
                    WorkFlowData: self.WorkFlowData,
                    Comentarios: 'Petición Automática por cambio de material de WO',
                }

                self.lanzarMuestra(data);
            },
            obtenerConfiguracionMuestrasAutomaticas: function (Lote) {
                var self = this;
                var IdWorkflowSeleccionado = null;

                $.ajax({
                    url: "../api/LIMS/ObtenerConfiguracionMuestrasAutomaticas",
                    dataType: "json",
                    async: false,
                    success: function (configuraciones) {
                        // Obtenemos tipo lote
                        var partesLote = Lote.split('-');
                        var tipoLote = partesLote[4 ];

                        // Buscamos workflow por tipo de lote
                        for (var i = 0; i < configuraciones.length; i++) {
                            if (configuraciones[i].ProcesoLote === tipoLote) {
                                IdWorkflowSeleccionado = configuraciones[i];
                                break;
                            }
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });

                return IdWorkflowSeleccionado;
            },
            obtenerDatosWorkFlow: function (WF) {
                var self = this;

                var idWofkFlow = parseInt(WF, 10);

                $.ajax({
                    url: "../api/LIMS/ObtenerWorkflowsLIMS/",
                    dataType: "json",
                    async: false,
                    success: function (workflows) {
                        for (let i = 0; i < workflows.length; i++) {
                            if (workflows[i].Id == idWofkFlow) {
                                self.WorkFlowData = `${workflows[i].Nombre}${(workflows[i].Descripcion ? ' - ' + workflows[i].Descripcion : '')}`;
                                break;
                            }
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_FLUJOS_LIMS'), 4000);
                        }
                    }
                });
            },
            lanzarMuestra: async function (datos) {
                $.ajax({
                    url: `../api/LIMS/PeticionMuestraLIMS`,
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(datos),
                    success: function (data) {
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PETICION_MUESTRA_LIMS_EXITO'), 3000);
                        kendo.ui.progress($("#ComentarioMuestraTemplate"), false);
                        kendoWindow.close();
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CREANDO_PETICION_MUESTRA_LIMS'), 3000);
                        }
                        kendo.ui.progress($("#ComentarioMuestraTemplate"), false);
                        kendoWindow.close();
                    }
                });
            },
            ActualizaProcesos: function () {
                $("#gridProcs").data('kendoGrid').dataSource.read();
            },
            cargarDetallesCabecera: function () {
                var self = this;
                $.ajax({
                    type: "GET",
                    url: "../api/OrdenesFab/ObtenerDetalleOrden/" + parseInt(self.IdOrden) + "/" + self.IdTipoOrden,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.order = data;

                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 2000);
                });
                $("#lblProducida").text(self.order.cProducida + " HL");
                $("#lblSobrante").text(self.order.mSobrante + " P");
                $("#lblLoteLevadura").text(tiempoConvertido);
            },
            ArrancarProcedimiento: function (e) {
                var self = this;

                var item = self.dsCmbProc.get(e.currentTarget.value);
                var data = { Des_Procedimiento: item.Des_Procedimiento, ID_Orden: item.ID_Orden, tipo: 'Inicio', ID_Proc: e.currentTarget.value };

                self.vistaProcs = new VistaProcedimientos(data, 'Inicio');
            },
            AplicarSeleccion: function (checked, e) {
                var self = this;
                var id = e.currentTarget.className.split(" ")[2];
                self.selTodos = checked;

                var grid = $(e.currentTarget.closest(".k-grid")).data('kendoGrid');
                if (self.selTodos) {
                    grid.tbody.find('input:checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var dataSource = grid.dataSource;
                    var filters = dataSource.filter();
                    var allData = dataSource.data();
                    var query = new kendo.data.Query(allData);
                    var dataFiltered = query.filter(filters).data;
                    self.$("#lblRegSel" + id).text(dataFiltered.length);
                } else {
                    grid.tbody.find('input:checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');
                    self.registrosDesSelData = [];
                    self.registrosSelData = [];
                    self.$("#lblRegSel" + id).text("0");
                }
            },
            CheckGrid: function (e) {
                $(e.target).closest("tr").toggleClass("k-state-selected");
                var nombre = e.currentTarget.className.split(" ")[2];
                var pk = e.currentTarget.className.split(" ")[3];
                var count = $("#lblRegSel" + pk).text();
                var checked = e.currentTarget.checked;
                if (checked) {
                    count = parseInt(count) + 1;
                } else {
                    count = parseInt(count) - 1;
                }

                $("#lblRegSel" + pk).text(count);
            },
            CierraOrden: function () {
                var self = this;

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('CERRAR_ORDEN'),
                    msg: window.app.idioma.t('DESEA_REALMENTE_CERRAR'),
                    funcion: function () { self.ConfirmaCierre(); },
                    contexto: this
                });
            },
            CancelarFormulario: function () {
                this.ventanaEditarCrear.close();
            },
            ConfirmarEdicion: function (e) {
                var self = this;
                var valor = "";

                if ($("#txtTipoKop").html() == "float" && $("#txtUom").html() == "hh:mm:ss") {
                    valor = ConversorDiasHorasMinutosSegundosAHoras("Valor");
                    if (valor !== "") {
                        $("#txtValor").val(parseFloat(valor).toFixed(5));
                    } else {
                        $("#txtValor").val("");
                    }
                }
                if ($("#txtValor").val() === "")
                    valor = $("#txtValor").text();
                else
                    valor = $("#txtValor").val();

                if (valor.length === 0 || valor === window.app.idioma.t('INTRODUZCA_UN_VALOR')) {
                    $("#lblErrorValor").text(window.app.idioma.t('ERROR_VALOR_NOSELECCIONADO'));
                    $("#lblErrorValor").show();
                }
                else {
                    $("#lblErrorValor").hide();
                    self.EditarKOPConfirma();
                }
            },
            ConfirmaCierre: function () {
                var pkOrden = this.order.PK;

                let data = {
                    codWO: this.order.ID,
                    estado: this.order.EstadoActual.Descripcion
                }

                $.ajax({
                    type: "GET",
                    async: false,
                    url: "../api/OrdenesFab/CerrarOrden/" + parseInt(pkOrden),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: data,
                    success: function (result) {
                        Backbone.trigger('eventCierraDialogo');

                        if (result) {
                            Backbone.trigger('eventActualizarListadoWOFAB');
                            window.location.hash = "GestionWOActivasFab";
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ORDEN_CERRADA'), 3000);
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CERRANDO_LA'), 3000);
                        }
                    },
                    error: function (response) {
                        Backbone.trigger('eventCierraDialogo');
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), response, 3000);
                    }
                });

            },
            CargarTabProcesos: function (self) {
                new vistaProcesoSAI(self.order, self.IdOrden, self);
                self.SetColorTabKOPSConstantes();
                self.SetCurvasTabColor();

                self.ResizeTab();
            },
            CargarTabKOPSConstantes: function (self) {
                if (!self.vistaKOPsCargada) {
                    new vistaKOPs(self.order, self.IdOrden, self.opciones, self.isOrdenActiva);
                    self.SetColorTabKOPSConstantes();
                    self.SetCurvasTabColor();
                    self.vistaKOPsCargada = true;
                }
                self.ResizeTab();
            },
            CargarTabKOPSMultivalor: function (self) {
                if (!self.vistaKOPsMultivalorCargada) {
                    new vistaKOPsMultivalor(self.order, self.opciones, self.IdOrden, self.isOrdenActiva);
                    self.vistaKOPsMultivalorCargada = true;
                }
               
                self.ResizeGrafico();
            },
            CargarTabConsumo: function (self) {
                if (!self.vistaConsumoCargada) {
                    new vistaConsumo(self.order, self.IdOrden, self.opciones, self.isOrdenActiva);
                    self.vistaConsumoCargada = true;
                }
                self.ResizeTab();
            },
            CargarTabProduccion: function (self) {
                if (!self.vistaProduccionCargada) {
                    new vistaProduccion(self.order, self.IdOrden, self.opciones, self.isOrdenActiva);
                    self.vistaProduccionCargada = true;
                }
                self.ResizeTab();
            },
            CargarTabTransferenciasSAI: function (self) {
                if (!self.vistaTransfSAICargada) {
                    new vistaTransfSAI(self.order, self.IdOrden, self.opciones, self.isOrdenActiva);
                    self.vistaTransfSAICargada = true;
                }
               
                self.ResizeTab();
            },
            CargarTabMedidas: function (self) {
                //Configuracion Historian
                if (typeof $("#cmbHistorian").data("kendoMultiSelect") === "undefined") {
                    $("#cmbHistorian").kendoMultiSelect({
                        placeholder: window.app.idioma.t('SELECCIONE'),
                        itemTemplate: "<input type='checkbox'/> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; #= Des_KOP#",
                        dataTextField: "Des_KOP",
                        dataValueField: "Cod_KOP",
                        tagMode: "single",
                        tagTemplate: '#:values.length# ' + window.app.idioma.t('MEDIDAS_SELECCIONADAS'),
                        autoClose: false,
                        dataSource: [],
                        change: function () {
                            //Función para marcar los checkbox del multiselect de TAGS
                            var checkInputs = function (elements) {
                                elements.each(function () {
                                    $(this).children("input").prop("checked", $(this).hasClass("k-state-selected"));
                                });
                            };
                            var items = this.ul.find("li");
                            checkInputs(items);
                        }
                    });
                }

                if (self.procsHistorian === null) {
                    self.CargarHistorian(self);
                }

                if (typeof $("#cmbProcedimientoHistorian").data("kendoDropDownList") === "undefined") {
                    $("#cmbProcedimientoHistorian").kendoDropDownList({
                        dataTextField: "Des_Procedimiento",
                        dataValueField: "Cod_Procedimiento",
                        dataSource: self.procsHistorian,
                        dataBound: function () {
                            this.select(0);
                            self.CambiaProcHistorian();
                        }
                    });
                }
            },
            CargarTabLIMS: function (self) {
                if (!self.vistaLIMSCargada) {
                    new vistaLIMS({
                        LoteMES: self.order.LoteMES,
                        FechaLote: kendo.parseDate(self.order.FecInicio, kendo.culture().calendars.standard.patterns.MES_FechaHora),
                        opciones: {
                            IdTipoOrden: parseInt(self.order.TipoOrden.ID),
                            PeticionMuestraCallback: () => {
                                self.SetLIMsTabColor();
                            }
                        }
                    });
                    self.SetLIMsTabColor();
                    self.vistaLIMSCargada = true;
                }
               
                self.ResizeTab();
                self.resizeGrid("#gridLIMS");
            },
            CargarTabNotas: function (self) {
                if (!self.vistaNotasCargada) {
                    var Nota = self.opciones.NotasWO == "" ? " " : self.opciones.NotasWO;
                    new vistaNotas(self.IdOrden, Nota, self.isOrdenActiva);
                    self.vistaNotasCargada = true;
                }
            },
            CargarGridPlanificado: function (self) {
                $("#gridPlanificado").kendoGrid({
                    dataSource: self.dsPlanificado,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    toolbar: [{
                        template: "<label>" + window.app.idioma.t('PLANIFICADO') + "</label>"
                    },
                    ],
                    sortable: true,
                    resizable: true,
                    scrollable: false,
                    pageable: {
                        refresh: true,
                        pageSize: 5,
                        buttonCount: 4,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "Descripcion_Material",
                            title: window.app.idioma.t('MATERIAL'),
                            width: 300,
                            filterable: false
                        },
                        {
                            field: "Cantidad_Estimada",
                            title: window.app.idioma.t('CANTIDAD') + ' (hl)',
                            width: 150,
                            filterable: false
                        },
                        {
                            field: "Nombre_Localizacion",
                            title: window.app.idioma.t('TCP'),
                            width: 200,
                            filterable: false
                        },

                    ],
                    dataBinding: function (e) {
                        kendo.ui.progress(self.$("#gridPlanificado"), false);

                    },
                }).data("kendoGrid");
            },
            CargarHistorian: function (self) {
                $.ajax({
                    type: "GET",
                    url: "../api/OrdenesFab/GetProcedimientosOrdenConWP/" + parseInt(self.IdOrden),
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.procsHistorian = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 2000);
                });
            },
            
            ConsultaTablaCurva: function () {
                var self = this;

                $("#gridCurvas").show();
                $("#btnGrafico").show();
                $("#chart").hide();
                $("#btnTabla").hide();
                $("#btnExcelCurvaGrafico").hide();
                $("#btnPDFCurvaGrafico").hide();
                //self.SetCurvasTabColor("0");
            },
            CambiaProcHistorian: function () {

                var self = this;

                var proc = $("#cmbProcedimientoHistorian").data("kendoDropDownList").value();

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerKOPSHistorian/" + parseInt(self.IdOrden) + "/" + parseInt(proc),
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.historian = $.grep(data, function (item) {
                        return item.ID_KOP.indexOf("PROCESS_STATUS") === -1 && item.ID_KOP.indexOf("BREW_NUMBER") === -1
                            && item.ID_KOP.indexOf("TOTAL_BREWS") === -1 && (item.ID_KOP.indexOf("NUMERO_") === -1 && item.ID_KOP.indexOf("_DV") === -1);
                    });

                    //Para listar los tags pertenecientes al tanque que se esté utilizando.
                    if (self.order.TipoOrden.ID.toUpperCase() === "FE" || self.order.TipoOrden.ID.toUpperCase() === "GU" ||
                        (self.order.TipoOrden.ID.toUpperCase() === "PR" && $("#cmbProcedimientoHistorian").data("kendoDropDownList").text().indexOf("Orden") === -1)) {
                        self.historian = $.grep(self.historian, function (item) {
                            return item.Des_KOP.indexOf(self.order.executionEquipment) !== -1;
                        });
                    } else {
                        if (self.order.TipoOrden.ID.toUpperCase() === "PR" && $("#cmbProcedimientoHistorian").data("kendoDropDownList").text().indexOf("Orden") !== -1) {
                            //Se obtiene el número de línea a partir del nombre de la llenadora
                            //se listarán todos los tags pertenencientes a los trenes que se hayan utilizado en las transferencias realizadas                            
                            var trains = [];

                            if (trains.length !== 0)
                                self.historian = $.grep(self.historian, function (item) {
                                    //OJO los tags para los trenes seran TRAIN_01_....
                                    return trains.indexOf(item.ID_KOP.substring(7, 8));
                                });
                            else
                                self.historian = [];
                        }
                    }
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 2000);
                });

                if (self.historian) {
                    if (self.historian.length > 0) {
                        $("#lbl2").text(window.app.idioma.t('FECHA_INICIO'));
                        $("#lbl0").show();
                        $("#lbl3").show();
                        $("#lblFechaInicioHistorian").show();
                        $("#lblFechaFinHistorian").show();
                        //$("#btnGraficoHistorian").show();
                        $("#btnConsultarHistorian").show();
                        $("#divcmbHistorian").show();
                        // $("#cmbHistorian").data("kendoDropDownList").setDataSource(self.historian);
                        $("#cmbHistorian").data("kendoMultiSelect").setDataSource(self.historian);
                        $("#lblContextoOrdenHistorian").show();
                        $("#chkHistorian").show();
                        $("#chkHistorian").prop('checked', false);
                        self.CambiaFechasHistorian();
                    } else {
                        $("#lbl2").text("No hay medidas definidas para este procedimiento");
                        $("#lbl0").hide();
                        $("#lbl3").hide();
                        $("#lblFechaInicioHistorian").hide();
                        $("#lblFechaFinHistorian").hide();
                        //$("#btnGraficoHistorian").hide();
                        $("#divcmbHistorian").hide();
                        $("#btnConsultarHistorian").hide();
                        $("#lblContextoOrdenHistorian").hide();
                        $("#chkHistorian").hide();
                    }
                }
            },
            CambiaFechasHistorian: function () {
                var self = this;

                var orden = self.IdOrden;
                var proc = $("#cmbProcedimientoHistorian").data("kendoDropDownList").value();
                var valorCHK = 0;
                if ($('#chkHistorian').is(":checked"))
                    valorCHK = 1;

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerFechasProcHistorian/" + parseInt(self.IdOrden) + "/" + parseInt(proc) + "/" + valorCHK,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    $("#lblFechaInicioHistorian").text(data[0]);
                    $("#lblFechaFinHistorian").text(data[1]);
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 2000);
                });
            },
            DivCurvas: function () {
                $("#chart").hide();
                $("#toolbarMultiValor").hide();
                $("#gridCurvas").show();
            },
            DuplicarEntry: function () {
                var self = this;

                self.vistaDuplicarEntry = new vistaDuplicarEntry(self.opciones);
            },
            DetalleLims: function (e) {
                var item = $("#gridLIMS").data("kendoGrid").dataItem($(e.currentTarget).parents("tr")[0]);
                this.vistaDetalleLims = new vistaDetalleLims(item.Sc);
            },
            EditTipoSample: function (dsSampleType, container, options) {
                $("<input id='ddlSampleType' name='ddlSampleType'/>")
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: false,
                        dataValueField: "St",
                        dataTextField: "Description",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataSource: dsSampleType
                    });
            },
            EditFecha: function (container, options) {
                $('<span id="dtp' + options.model.idProp + '"></span>').appendTo(container);

                var m = new Date();
                var dia = m.getDate() < 10 ? "0" + m.getDate() : m.getDate();
                var mes = m.getMonth() < 10 ? "0" + m.getMonth() : m.getMonth();
                var hora = m.getHours() < 10 ? "0" + m.getHours() : m.getHours();
                var min = m.getMinutes() < 10 ? "0" + m.getMinutes() : m.getMinutes();
                var seg = m.getSeconds() < 10 ? "0" + m.getSeconds() : m.getSeconds();
                var dateString = dia + "/" + mes + "/" + m.getFullYear() + " " + hora + ":" + min + ":" + seg;

                $("#dtp" + options.model.idProp).html(dateString);
                $("#btnDetalleLIMS0").hide();
            },
            //EditSubdepartment: function (self, container, options) {
            //    $("<input id='ddlSubDepartament' name='ddlSubDepartament'/>")
            //        .appendTo(container)
            //        .kendoDropDownList({
            //            dataValueField: "Description",
            //            dataTextField: "Description",
            //            optionLabel: window.app.idioma.t('SELECCIONE'),
            //            dataSource: self.dsSubDepartament,
            //            select: function (e) {
            //                var dataItem = this.dataItem(e.item);
            //                var descripcion = dataItem.Description;

            //                //Se setea el dataSource de tipo de muestra
            //                self.dsSampleType.transport.options.read.url = "../api/LIMS/SamplesType/" + descripcion;
            //                self.dsSampleType.read();
            //            }
            //        });
            //},
            EditaInfoProc: function (e) {
                var self = this;

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var data = self.gridProcs.dataItem(tr);

                self.vistaEditaProcs = new vistaEditaProcs(data, self.order);
            },
            CambiarFechaLocalaUTC: function (Valor_Actual) {
                var cambiarFecha = kendo.toString(kendo.parseDate(((kendo.parseDate(Valor_Actual)).toISOString()).slice(0, -1)), kendo.culture().calendars.standard.patterns.MES_FechaHora);
                return cambiarFecha;
            },
            
            ExcelHistorian: function () {
                var self = this;
                $("#gridHistorian").data("kendoGrid").options.excel.fileName = self.order.ID + "_ValoresMedidas.xlsx";
                $("#gridHistorian").data("kendoGrid").saveAsExcel();
            },
            EliminaLims: function (e) {
                e.preventDefault(); //prevent page scroll reset

                var grid = $("#gridLIMS").data("kendoGrid");
                var tr = $(e.target).closest("tr"); //get the row for deletion
                var data = grid.dataItem(tr); //get the row data so it can be referred later

                this.confirmacion = new VistaDlgConfirm({
                    titulo: "Eliminar Muestra",
                    msg: window.app.idioma.t('DESEA_REALMENTE_ELIMNIAR'),
                    funcion: function () {
                        $.ajax({
                            url: "../api/LIMS/Destroy/" + data.Sc,
                            dataType: "json",
                            type: "DELETE",
                            contentType: "application/json; charset=utf-8",
                            async: false
                        }).done(function (data) {
                            $("#gridLIMS").data("kendoGrid").dataSource.read();
                        }).fail(function (xhr) {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 2000);
                        });
                        //grid.dataSource.remove(data) //prepare a "destroy" request
                        //grid.dataSource.sync() //actually send the request (might be ommited if the autoSync option is enabled in the dataSource)
                        Backbone.trigger('eventCierraDialogo');
                    },
                    contexto: this
                });

            },
            GetColorName: function (color) {
                switch (color.toUpperCase()) {
                    case "#4168E0":
                        color = "Azul"
                        break;
                    case "#FECD00":
                        color = "Amarillo"
                        break;
                    default:
                        color = "Verde"
                }
                return color;
            },
            GetDate: function (fecha) {
                var fechaActual = fecha.split(" ")[0].replace(/\//g, '-');;
                var horaActual = "";
                var minActual = "";
                var anio = fechaActual.split("-")[2];
                var mes = fechaActual.split("-")[1];
                var dia = fechaActual.split("-")[0];

                if (parseInt(anio) < parseInt(dia)) {
                    anio = fechaActual.split("-")[0];
                    dia = fechaActual.split("-")[2];
                }

                horaActual = fecha.split(" ")[1].split(":")[0];
                minActual = fecha.split(" ")[1].split(":")[1];
                segActual = fecha.split(" ")[1].split(":")[2];

                return new Date(anio, mes, dia, horaActual, minActual, segActual);
            },
            GraficoHistorian: function () {
                var self = this;

                //$("#btnGraficoHistorian").hide();
                $("#btnTablaHistorian").show();
                $("#btnPDFGraficoHistorian").show();
                $("#gridHistorian").hide();

                //Obtengo los measuresId de las tag seleccionadas
                var selectedMeasuresId = $("#cmbHistorian").data("kendoMultiSelect").value();
                //Esta función devolverá el array en formato string para enviarlo por la url en el GET
                var buffer = function (elements) {
                    var auxBuffer = "";
                    $.each(elements, function (index, value) { auxBuffer = auxBuffer + "Cod_KOP=" + value + "&" });
                    return auxBuffer.slice(0, -1);
                };

                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('CONSULTA_PUEDE_TARDAR'), 5000);
                $("#imgCargandoChartHistorian").show();

                var valorCHK = 0;
                if ($('#chkHistorian').is(":checked"))
                    valorCHK = 1;

                var request = {};
                request.Cod_Kops = buffer(selectedMeasuresId);
                request.Id_Orden = parseInt(self.IdOrden);
                request.Operacion = valorCHK;

                //AL hacerlocon kendo da error, por eso se utiliza Ajax
                $.ajax({
                    data: JSON.stringify(request),
                    type: "POST",
                    async: true,
                    url: "../api/ObtenerGraficoHistorianByList",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        var results = data;

                        $("#chartHistorian").kendoChart({
                            pdf: {
                                fileName: self.order.ID + "Valores_MedidasGrafico.pdf",
                            },
                            title: {
                                text: self.order.ID
                            },
                            legend: {
                                position: "bottom"
                            },
                            seriesDefaults: {
                                type: "line"
                            },
                            series: results.series,
                            pannable: {
                                lock: "y"
                            },
                            zoomable: {
                                mousewheel: {
                                    lock: "y"
                                },
                                selection: {
                                    lock: "y"
                                }
                            },
                            valueAxes: results.axes,
                            categoryAxis: results.categories,
                            tooltip: {
                                visible: true,
                                format: "{0}",
                                template: "Fecha: #= category # - Valor: #= value #"
                            }
                        });

                        $("#chartHistorian").show();
                        $("#imgCargandoChartHistorian").hide();


                    },
                    error: function (response) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS_VALORES'), 2000);
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            LimpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            OnDataBoundProcesos: function (e, self, grid) {
                var data = grid._data;

                for (var x = 0; x < data.length; x++) {
                    var dataItem = data[x];
                    var tr = $("#gridProcs").find("[data-uid='" + dataItem.uid + "']");
                    var id = $("td:nth-child(1)", tr)[0].innerHTML;
                    var estado = $("td:nth-child(9)", tr)[0].innerHTML;

                    if (self.order.EstadoActual.Descripcion === "Consolidando datos") {
                        $("#btnParar" + id).hide();
                        $("#btnArrancar" + id).hide();
                        $("#btnEditarProc" + id).show();
                    } else {
                        $("#btnEditarProc" + id).remove();

                        switch (estado) {
                            case "N":
                                $("#btnParar" + id).hide();
                                $("#btnArrancar" + id).hide();
                                break;
                            case "A":
                                $("#btnParar" + id).hide();
                                $("#btnArrancar" + id).show();
                                break;
                            case "P":
                                $("#btnParar" + id).show();
                                $("#btnArrancar" + id).hide();
                                break;
                            default:
                                $("#btnParar" + id).hide();
                                $("#btnArrancar" + id).hide();
                                break;
                        }
                    }

                    var codProc = $("td:nth-child(4)", tr)[0].innerHTML;

                    if (codProc.indexOf('-') > 0)
                        $("#btnProcSAI" + id).hide();
                    else
                        $("#btnProcSAI" + id).show();
                }
            },
            OnDataBoundCurvasMaestro: function (grid) {
                var data = grid._data;
                for (var x = 0; x < data.length; x++) {

                    var dataItem = data[x];
                    var tr = $("#gridCurvas").find("[data-uid='" + dataItem.uid + "']");
                    if (dataItem.TIPO === "Multivalor") {
                        $("td:nth-child(1)", tr)[0].innerHTML = "";

                    }
                }
            },
            PararProcedimiento: function (e) {
                var self = this;

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var data = self.gridProcs.dataItem(tr);

                self.vistaProcs = new VistaProcedimientos(data, 'Fin');
            },
            PdfCurvaGrafico: function () {
                $("#chart").getKendoChart().saveAsPDF();
            },
            PdfHistorianGrafico: function () {
                var self = this;
                $("#chartHistorian").getKendoChart().options.pdf.fileName = self.order.ID + "_GraficoMedidas.pdf";
                $("#chartHistorian").getKendoChart().saveAsPDF();
            },
            PdfHistorian: function () {
                var self = this;
                $("#gridHistorian").data("kendoGrid").options.pdf.fileName = self.order.ID + "_ValoresMedidas.pdf";
                $("#gridHistorian").data("kendoGrid").saveAsPDF();
            },
            Rgb2Hex: function (rgb) {
                rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                function hex(x) {
                    return ("0" + parseInt(x).toString(16)).slice(-2);
                }
                return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
            },
            ResizeTab: function () {

                var contenedorHeight = $("#center-pane").height();
                var cabeceraHeight = $("#divCabeceraVista").height();
                var divtabla = $("#tablaOrden").height();

                var tabStrip = $("#tpInfoOrden").find('.k-content.k-state-active').first("div[id^='tpInfoOrden']");
                if (tabStrip) {
                    var tabTitle = $("#tpInfoOrden").find('.k-state-active.k-item.k-tab-on-top.k-state-default.k-first').height()
                    tabStrip.height(contenedorHeight - cabeceraHeight - divtabla - tabTitle - 30);
                }
            },
            ResizeGrafico: function () {
                var contenedorHeight = $("#center-pane").height();
                var cabeceraHeight = $("#divCabeceraVista").height();
                var divtabla = $("#tablaOrden").height();
                var divFiltros = $("#tablaOrden").height();

                var tabStrip = $("#tpInfoOrden").find('.k-content.k-state-active').first("div[id^='tpInfoOrden']");
                if (tabStrip) {
                    var tabTitle = $("#tpInfoOrden").find('.k-state-active.k-item.k-tab-on-top.k-state-default.k-first').height()
                    $("#gridCurvas").height(contenedorHeight - cabeceraHeight - divtabla - tabTitle - divFiltros);
                    $("#chart").height(contenedorHeight - cabeceraHeight - divtabla - tabTitle - divFiltros);
                }

            },
            ResizeGridHistorian: function () {

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divcontHistorian").innerHeight();
                var divtabla = $("#tablaOrden").innerHeight();


                var tabStrip = $("#tpInfoOrden").find('.k-content.k-state-active').first("div[id^='tpInfoOrden']");
                if (tabStrip) {
                    var tabTitle = $("#tpInfoOrden").find('.k-state-active.k-item.k-tab-on-top.k-state-default.k-first').height()
                    $("#gridHistorian").height(contenedorHeight - cabeceraHeight - filtrosHeight - divtabla - tabTitle - 50);
                    $("#chartHistorian").height(contenedorHeight - cabeceraHeight - filtrosHeight - divtabla - tabTitle - 50);
                }
            },
            ReclasificarOrden: function () {
                var self = this;
                if (self.order.EstadoActual.Descripcion !== 'Consolidando datos')
                    this.vistaReclasifica = new vistaReclasifica(self.order);
                else
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_SE_PUEDE'), 2000);
            },
            SwitchColorEstadoActual: function (color) {
                var self = this;
                if (self.order.EstadoActual.Recalcular)
                    color = "#f77918";

                $("#imgEstadoOrden").css("background-color", color + " !important");
            },
            SetHeaderData: function () {
                var self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerDetalleOrdenFab/" + parseInt(self.IdOrden),
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.order = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 2000);
                });
            },
            SetWOKOPColor: function () {
                var self = this;

                var color = "Verde";
                var colorCurvas = self.GetColorName(self.Rgb2Hex($("#divCurvas").css("background-color")));
                var colorKOPS = self.GetColorName(self.Rgb2Hex($("#divKOPS").css("background-color")));

                if (colorCurvas === colorKOPS) {
                    color = colorCurvas;
                } else {
                    if (((colorCurvas === "Amarillo" || colorCurvas === "Verde") && colorKOPS === "Azul") || ((colorKOPS === "Amarillo" || colorKOPS === "Verde") && colorCurvas === "Azul"))
                        color = "Azul";
                    else
                        if ((colorCurvas === "Amarillo" && colorKOPS === "Verde") || (colorCurvas === "Verde" && colorKOPS === "Amarillo"))
                            color = "Amarillo";
                }

                var kop = {};
                kop.orderId = self.IdOrden;
                kop.value = color;
            },
            SelectTab: function (e, self) {
                var tabStripIndex = $(e.item).index();
                self.ResizeTab();

                switch (tabStripIndex) {
                    case 0:
                        self.CargarTabProcesos(self);
                        break;
                    case 1:
                        self.CargarTabKOPSConstantes(self);
                        break;
                    case 2:
                        self.CargarTabKOPSMultivalor(self);
                        break;
                    case 3:
                        self.CargarTabConsumo(self);
                        break;
                    case 4:
                        self.CargarTabProduccion(self);
                        break;
                    case 5:
                        self.CargarTabTransferenciasSAI(self);
                        break;
                    case 6:
                        self.CargarTabNotas(self);
                        break;
                    case 7:
                        self.CargarTabLIMS(self);
                        break;
                }
            },
            GetBrillo: function (color) {
                var color = "" + color
                var m = color.substr(1).match(color.length == 7 ? /(\S{2})/g : /(\S{1})/g);
                if (m) var r = parseInt(m[0], 16), g = parseInt(m[1], 16), b = parseInt(m[2], 16);
                var valorBrillo;
                if (typeof r != "undefined")
                    valorBrillo = ((r * 299) + (g * 587) + (b * 114)) / 1000;

                var valor = "#fff";
                if (((valorBrillo) / 255) > 0.5)
                    valor = "#000";
                return valor;
            },
            SetColorTabKOPSConstantes: function () {
                var self = this;
                var color = "white";
                var backGroundColor = "#eae8e8";

                $.ajax({
                    type: "POST",
                    async: true,
                    url: "../api/KOPsFab/ObtenerEstadoKOPDetalleOrden/" + self.IdOrden,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        if (self.estadoColor.Azul == response) {
                            backGroundColor = "#4168E0";
                            color = "white";
                        }
                        else if (self.estadoColor.Amarillo == response) {
                            backGroundColor = "#FECD00";
                            color = "black";
                        }
                        else if (self.estadoColor.Verde == response) {
                            backGroundColor = "lightgreen";
                            color = "black";
                        } else {

                            backGroundColor = response;
                            color = "black";
                        }
                        $("#divKOPS").css("background-color", backGroundColor);
                        $("#divKOPS .k-link").css("color", color);
                    },
                    error: function (response) {

                    }
                });
            },
            SetCurvasTabColor: function (colorparam = null) {
                var self = this;
                var color = "white";
                var backGroundColor = "#eae8e8";

                $.ajax({
                    type: "POST",
                    async: true,
                    url: "../api/KOPsFab/ObtenerEstadoKOPMultivalorDetalleOrden/" + self.IdOrden,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        if (self.estadoColor.Azul == response) {
                            backGroundColor = "#4168E0";
                            color = "white";
                        }
                        else if (self.estadoColor.Amarillo == response) {
                            backGroundColor = "#FECD00";
                            color = "black";
                        }
                        else if (self.estadoColor.Verde == response) {
                            backGroundColor = "lightgreen";
                            color = "black";
                        } else {
                            backGroundColor = response;
                            color = "black";
                        }

                        $("#divCurvas").css("background-color", backGroundColor);
                        $("#divCurvas .k-link").css("color", color);
                    },
                    error: function (response) {

                    }
                });
            },
            SetColorTabNotas: function () {
                var self = this;
                var backGroundColor = "#eae8e8";
                if (self.opciones.NotasWO) {
                    backGroundColor = "lightgreen";
                }

                $("#divNotas").css("background-color", backGroundColor);

            },
            SetLIMsTabColor: function () {
                var self = this;
                var color = "white";
                var backGroundColor = "#eae8e8";

                $.ajax({
                    type: "GET",
                    async: true,
                    url: "../api/LIMS/ObtenerEstadoLIMsDetalleOrden/" + self.order.LoteMES,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        if (response) {
                            backGroundColor = response.Valor;
                            color = ColorTextoBlancoNegro(backGroundColor);

                            $("#divLIMS").css("background-color", backGroundColor);
                            $("#divLIMS .k-link").css("color", color);
                            $("#divLIMS").attr("title", window.app.idioma.t('ESTADO_LIMS_'+response.Id))
                        }                        
                    },
                    error: function (response) {

                    }
                });
            },
            SeleccionaHistorian: function () {
                var self = this;

                $("#btnGraficoHistorian").show();
                $("#btnTablaHistorian").hide();
                $("#btnPDFGraficoHistorian").hide();
                $("#chartHistorian").hide();
                $("#gridHistorian").show();
                $("#imgCargandoChartHistorian").hide();

                //Obtengo los measuresId de las tag seleccionadas
                var selectedMeasuresId = $("#cmbHistorian").data("kendoMultiSelect").value();
                //Esta función devolverá el array en formato string para enviarlo por la url en el GET
                var buffer = function (elements) {
                    var auxBuffer = "";
                    $.each(elements, function (index, value) { auxBuffer = auxBuffer + "Cod_KOP=" + value + "&" });
                    return auxBuffer.slice(0, -1);
                };


                //var idKop = $("#cmbHistorian").data("kendoDropDownList").value();
                //var kop = $("#cmbHistorian").data("kendoDropDownList").text();

                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('CONSULTA_PUEDE_TARDAR'), 5000);

                var valorCHK = 0;
                if ($('#chkHistorian').is(":checked"))
                    valorCHK = 1;

                var request = {};
                request.Cod_Kops = buffer(selectedMeasuresId);
                request.Id_Orden = parseInt(self.IdOrden);
                request.Operacion = valorCHK;
                //AL hacerlocon kendo da error, por eso se utiliza Ajax
                $.ajax({
                    data: JSON.stringify(request),
                    type: "POST",
                    async: false,
                    url: "../api/ObtenerGridHistorianByList",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        self.dsHistorian = data[0];
                        if ($("#gridHistorian").data("kendoGrid") === undefined)
                            kendo.ui.progress(self.$("#gridHistorian"), true);

                        if (self.dsHistorian.Fields.length > 0) {
                            var fields = {};
                            for (i = 0; i < self.dsHistorian.Fields.length; i++) {

                                switch (self.dsHistorian.Types[i].toLowerCase()) {
                                    case "varchar":
                                    case "char":
                                    case "text":
                                    case "nvarchar":
                                    case "nchar":
                                    case "ntext":
                                        fields[self.dsHistorian.Fields[i]] = { type: "string" };
                                        break;

                                    case "bigint":
                                    case "int":
                                    case "decimal":
                                    case "float":
                                    case "money":
                                    case "numeric":
                                    case "real":
                                    case "tinyint":
                                    case "smallint":
                                    case "smallmoney":
                                        fields[self.dsHistorian.Fields[i]] = { type: "number" };
                                        break;

                                    case "date":
                                    case "datetime":
                                    case "smalldatetime":
                                        fields[self.dsHistorian.Fields[i]] = { type: "date" };
                                        break;
                                }
                            }

                            var columns = [];
                            columns[0] = {
                                title: window.app.idioma.t('POSICION'),
                                template: "#= ++record #",
                                width: 9
                            };

                            for (i = 1; i < self.dsHistorian.Fields.length + 1; i++) {
                                columns[i] = { title: self.dsHistorian.Fields[i - 1] === "RowUpdated" ? window.app.idioma.t('FECHA_HORA') : data[1][self.dsHistorian.Fields[i - 1]], width: self.dsHistorian.Fields[i - 1] === "RowUpdated" ? 15 : 50, field: self.dsHistorian.Fields[i - 1] };
                            }

                            var CHANGE = 'change',
                                $grid = $('#gridHistorian');

                            // Unbind existing refreshHandler in order to re-create with different column set
                            if ($grid.length > 0 && $grid.data().kendoGrid) {
                                var thisKendoGrid = $grid.data().kendoGrid;

                                if (thisKendoGrid.dataSource && thisKendoGrid._refreshHandler) {
                                    thisKendoGrid.dataSource.unbind(CHANGE, thisKendoGrid._refreshHandler);
                                    $grid.removeData('kendoGrid');
                                    $grid.empty();
                                }
                            }

                            self.$("#gridHistorian").kendoGrid({
                                dataSource: {
                                    pageSize: 50,
                                    data: self.dsHistorian.Records,
                                    schema: {
                                        model: {
                                            fields: fields
                                        }
                                    }

                                },
                                sortable: true,
                                resizable: true,
                                excel: {
                                    //fileName: self.order.ID + "_ValoresMedidas.xlsx",
                                    allPages: true,
                                    filterable: true
                                },
                                pdf: {
                                    //fileName: self.order.ID + "_ValoresMedidas.pdf",
                                    //title: self.order.ID
                                },
                                filterable: {
                                    extra: false,
                                    messages: window.app.cfgKendo.configuracionFiltros_Msg,
                                    operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                                },
                                selectable: false,
                                pageable: {
                                    refresh: true,
                                    pageSizes: true,
                                    buttonCount: 5,
                                    messages: window.app.cfgKendo.configuracionPaginado_Msg
                                },
                                toolbar: [{
                                    template: "<button type='button' id='btnExcelHistorian' class='k-button k-button-icontext' style='float:right;background-color:darkorange; color:white;margin-left:5px;'> <span class='k-icon k-i-excel'></span>" + window.app.idioma.t('EXPORTAR_EXCEL') + "</button>"
                                },
                                {
                                    template: "<button type='button' id='btnPDFHistorian' class='k-button k-button-icontext' style='float:right;background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-pdf'></span>" + window.app.idioma.t('EXPORTAR_PDF') + "</button>"
                                },
                                {
                                    template: "<button type='button' id='btnGraficoHistorian' class='k-button k-button-icontext' style='float:right;background-color:royalblue; color:white;margin-left:5px;width:110.977px;'><img class='k-icon' alt='icon' src='img/chartImg2.png'/>" + window.app.idioma.t('GRAFICO') + "</button>"
                                }
                                ],
                                columns: columns,
                                dataBinding: function () {
                                    record = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                                    self.ResizeGridHistorian();
                                    kendo.ui.progress(self.$("#gridHistorian"), false);
                                },
                                dataBound: function (e) {
                                    var data = this._data;
                                    if (data.length < 1) {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('VALORES_NO_REGISTRADO'), 5000);
                                    }
                                }
                            });
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('TAG_NO_SELECCIONADO'), 5000);
                        }
                    },
                    error: function (response) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_REQUEST'), 2000);
                    }
                });
            },
            eliminar: function () {
                this.remove();
            },
            resizeGrid: function (id) {

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltros").innerHeight();
                var divtabla = $("#tablaOrden").innerHeight();

                var gridElement = $(id),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - cabeceraHeight - divtabla - 155);

                if (id === "#gridKOPS") {
                    var gridElement2 = $("#gridEditor"),
                        dataArea2 = gridElement2.find(".k-grid-content")
                    dataArea2.height(contenedorHeight - cabeceraHeight - divtabla - 110);
                }
            },
            ActivarBotonesSegunPermisos: function (self) {
                if (self.isOrdenActiva) {
                    $('#divKOPS').attr('data-funcion', 'FAB_PROD_EXE_9_VisualizacionKOPActivos FAB_PROD_EXE_9_GestionKOPActivos');
                    $('#divCurvas').attr('data-funcion', 'FAB_PROD_EXE_9_VisualizacionKOPsMultivalorActivos FAB_PROD_EXE_9_GestionKOPsMultivalorActivos');
                    $('#divConsumo').attr('data-funcion', 'FAB_PROD_EXE_12_VisualizacionMaterialActivos');
                    $('#divProduccion').attr('data-funcion', 'FAB_PROD_EXE_12_VisualizacionMaterialActivos');
                    $('#divTransferenciasSAI').attr('data-funcion', 'FAB_PROD_EXE_12_VisualizacionMaterialActivos');
                } else {
                    $('#divKOPS').attr('data-funcion', 'FAB_PROD_EXE_9_VisualizacionKOPHistorico FAB_PROD_EXE_9_GestionKOPHistorico');
                    $('#divCurvas').attr('data-funcion', 'FAB_PROD_EXE_9_VisualizacionKOPsMultivalorHistorico FAB_PROD_EXE_9_GestionKOPsMultivalorHistorico');
                    $('#divConsumo').attr('data-funcion', 'FAB_PROD_EXE_12_VisualizacionMaterialHistorico');
                    $('#divProduccion').attr('data-funcion', 'FAB_PROD_EXE_12_VisualizacionMaterialHistorico');
                    $('#divTransferenciasSAI').attr('data-funcion', 'FAB_PROD_EXE_12_VisualizacionMaterialHistorico');
                }
            }
        });
        return vistaDetalleOrden;
    });