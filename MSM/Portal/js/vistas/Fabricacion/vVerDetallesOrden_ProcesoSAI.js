define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/vpVerDetalleOrden_ProcesoSAI.html', 'compartido/notificaciones',
    'vistas/Fabricacion/vDeclararProd', 'vistas/Fabricacion/vCambiarProcedimientos', 'vistas/Fabricacion/vVerDeltaV', 'jszip',
    'vistas/Fabricacion/vEditarProcedimientos', 'vistas/vDialogoConfirm', 'definiciones'
],
    function (_, Backbone, $, FormDetalleOrdenProcesoSAI, Not, VistaDeclararProd, VistaProcedimientos, VistaDeltaV, JSZip, vistaEditaProcs,
            VistaDlgConfirm, definiciones) {
        var vistaDetalleOrdenProcesoSAI = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenidoProcesoSAI',
            dsProcedimientos: null,
            dsCmbProc: [],
            gridProcs: null,
            idorden: 0,
            order: [],
            template: _.template(FormDetalleOrdenProcesoSAI),
            vistaFormWo: null,
            vistaDeclararProd: null,
            vistaProcs: null,
            isOrdenActiva: true,
            ventanaPadre: null,
            tipoWO: definiciones.TipoWO(),
            dsTipoCervezas: null,
            dsTipoMostos: null,
            window: null,
            initialize: function (order, idOrden, ventanaPadre) {
                var self = this;
                window.JSZip = JSZip;
                kendo.ui.progress(self.$("#contenedor"), true);
                self.order = order;
                self.idOrden = idOrden;
                self.ventanaPadre = ventanaPadre;
                self.dsProcedimientos = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/OrdenesFab/GetProcedimientosOrdenDetalle/" + parseInt(self.idOrden),
                            dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                            
                            cache: false
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "Cod_Procedimiento",
                            fields: {
                                'Id': { type: "string" },
                                'DescSubProceso': { type: "string" },
                                'FechaInicio': { type: "date" },
                                'FechaFin': { type: "date" },
                                'LoteSAI': { type: "string" },
                                'totalHoras': { type: "number" },
                                'IdWO': { type: "string" }
                            }
                        }
                    },
                    sort: { field: "FechaInicio", dir: "asc" }
                });

                self.render(self);
                //self.SetWOKOPColor();
            },
            render: function (self) {
                $(self.el).html(this.template());
                self.CargarTabProcesos(self);
                $("#imgEstadoOrden").css("background-color", self.order.EstadoActual.Color + " !important");

                let textoBotonTipoMosto = (self.order.TipoOrden.ID == self.tipoWO.Coccion) ? window.app.idioma.t('CAMBIAR_TIPO_MOSTO_COCCION') :
                    (self.order.TipoOrden.ID == self.tipoWO.Fermentacion) ? window.app.idioma.t('CAMBIAR_TIPO_MOSTO_FERMENTACION') : window.app.idioma.t('CAMBIAR_TIPO_MOSTO_GUARDA');
                $("#btnCambiarTipoMosto").text(textoBotonTipoMosto);

                switch (parseInt(self.order.TipoOrden.ID)) {
                    case self.tipoWO.Coccion:                    
                    case self.tipoWO.Guarda:
                        $("#btnCambiarTipoMosto").show();
                        $("#btnCambiarTipoCerveza").hide();
                        self.ObtenerTiposMosto();
                        break;
                    case self.tipoWO.Fermentacion:
                        $("#btnCambiarTipoMosto").show();
                        $("#btnCambiarTipoCerveza").hide();
                        $("#btnVerInformePdf").show();
                        self.ObtenerTiposMosto();
                        break;
                    case self.tipoWO.Prellenado:
                        $("#btnCambiarTipoCerveza").show();
                        $("#btnCambiarTipoMosto").hide();
                        self.ObtenerTiposCervezaTCP();
                        break;
                    default:
                        $("#btnCambiarTipoMosto").hide();
                        $("#btnCambiarTipoCerveza").hide();
                        break;
                }
            },
            events: function (self) {
                $("#btnConsolidarDatos").on("click", function (e) {
                    if (TienePermiso(72)) {
                        self.ConsolidarWO(self);
                    }
                });

                $("#btnCambiarTipoMosto").on("click", function (e) {
                    self.AbrirModalTipoMosto(e);
                });

                $("#btnCambiarTipoCerveza").on("click", function (e) {
                    self.AbrirModalTipoCerveza(e);
                });

                $("#btnVerInformePdf").on("click", function (e) {
                    self.verInformePDF();
                });
            },
            ActualizaProcesos: function () {
                $("#gridProcs").data('kendoGrid').dataSource.read();
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
            ConsolidarWO: function (self) {
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('CERRAR_ORDEN'),
                    msg: window.app.idioma.t('DESEA_REALMENTE_PASAR'),
                    funcion: function () { self.Consolidar(self); },
                    contexto: this
                });
            },
            Consolidar: function (self) {
                let data = {
                    codWO: self.order.ID,
                    estado: self.order.EstadoActual.Descripcion
                }

                $.ajax({
                    type: "GET",
                    url: "../api/ConsolidarDatos/" + self.order.PK,
                    dataType: 'json',
                    data: data,
                    cache: false,
                    async: true
                }).done(function (data) {
                    if (data) {
                        self.order.EstadoActual.Color = "#4169E0";
                        $("#btnConsolidarDatos").remove();
                        $('#txtEstadoProcCerrado').html("CONSOLIDANDO DATOS");
                        self.initialize(self.order, self.idOrden);
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('WO_EN_ESTADO'), 3000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_WO_NO_SE'), 3000);
                    }

                    self.confirmacion.finProceso();
                }).fail(function (xhr) {
                    self.confirmacion.finProceso();
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('LA_WO_NO_SE'), 3000);
                });
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
            ConfirmaCierre: function () {
                var self = this;
                var item = this.order;
                var pkOrden = item.pk;

                $.ajax({
                    type: "POST",
                    async: false,
                    url: "../api/OrdenesFab/CerrarOrden/" + parseInt(pkOrden),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (result) {
                        Backbone.trigger('eventCierraDialogo');

                        if (result) {
                            Backbone.trigger('eventActualizarListadoWOFAB');
                            window.location.hash = "GestionWOActivasFab";
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ORDEN_CERRADA'), 2000);
                        } else
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), texto, 2000);
                    },
                    error: function (response) {
                        Backbone.trigger('eventCierraDialogo');

                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), response, 2000);
                    }
                });
            },
            CargarTabProcesos: function (self) {
                $("#spanDEstimada").html().toString();
                if (!$("#gridProcs").data("kendoGrid")) {
                    self.CargarGridProcesos(self);
                    if ($("#txtEstadoProcCerrado").html().indexOf("CONSOLIDANDO DATOS") > -1) {
                        $("#btnConsolidarDatos").hide();
                    }
                } else
                    self.dsProcedimientos.read();

                if (!$("#cmdProc").data("kendoDropDownList"))
                    $("#cmdProc").kendoDropDownList({
                        optionLabel: window.app.idioma.t("SELECCIONAR"),
                        dataTextField: "Des_Procedimiento",
                        dataValueField: "Cod_Procedimiento",
                        dataSource: self.dsCmbProc
                    });
            },
            CargarGridProcesos: function (self) {
                //Grid Procedimientos

                self.gridProcs = $("#gridProcs").kendoGrid({
                    dataSource: self.dsProcedimientos,
                    //dataBound: function (e) { self.OnDataBoundProcesos(e, self, this); },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    toolbar: [
                        //{
                        //    template: "<span>Procesos:&nbsp;&nbsp;&nbsp;</span><input id='cmdProc' style='width:200px;'>"
                        //},
                        {
                            template: "<button id='btnLimpiarFiltros' style='float:right;' class='k-button' style='background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        },
                        {
                            template: "<button id='btnActualizarProcs' style='float:right;' class='k-button' style='background-color:lightgreen; color:white;margin-left:5px;'><span class='k-icon k-i-refresh'></span>" + window.app.idioma.t('ACTUALIZAR') + "</button>"
                        },
                        {
                            template: "<button id='btnVerInformePdf' class='k-button k-button-icontext' style='float:right;display:none'><span class='k-icon k-i-pdf'></span>" + window.app.idioma.t('VER_INFORME') + "</button>"
                        },
                        {
                            template: "<button id='btnConsolidarDatos' data-funcion='FAB_PROD_EXE_9_GestionWoActivas' style='float:right;' class='k-button blueBtn'><span class='k-icon k-i-lock'></span>" + window.app.idioma.t('CONSOLIDAR_DATOS') + "</button>"
                        },
                        {
                            template: "<button id='btnCambiarTipoMosto' data-funcion='FAB_PROD_EXE_9_GestionWoActivas' style='float:right;' class='k-button'></button>"
                        },
                        {
                            template: "<button id='btnCambiarTipoCerveza' data-funcion='FAB_PROD_EXE_9_GestionWoActivas' style='float:right;' class='k-button'>" + window.app.idioma.t('CAMBIAR_TIPO_CERVEZA_TCP') + "</button>"
                        }
                    ],
                    sortable: true,
                    resizable: true,
                    scrollable: false,
                    pageable: false,
                    columns: [
                        {
                            field: "Id",
                            hidden: true
                        },
                        {
                            field: "IdWO",
                            hidden: true
                        },
                        {
                            template: "<button id='btnProcSAI#=Id#' data-funcion='FAB_PROD_EXE_9_GestionWoActivas FAB_PROD_EXE_9_VisualizacionWoActivas' class='btnSAI' onClick='VerDeltaV(#=Id#)'> <span class='k-icon k-i-connector'></span>" + window.app.idioma.t('PROC_SAI') + "</button>",
                            width: "120px"
                        },
                        {
                            title: window.app.idioma.t('LOTE_SAI'),
                            field: "LoteSAI"
                        },
                        {
                            field: "DescSubProceso",
                            title: window.app.idioma.t("PROCEDIMIENTO"),
                            width: "180px"
                        },
                        {
                            field: "FechaInicio",
                            title: window.app.idioma.t("FECHA_INICIO"),
                            template: '#= FechaInicio !== null ? kendo.toString(FechaInicio, "' + kendo.culture().calendars.standard.patterns.MES_FechaHora + '" ) : "" #',
                            width: "170px",
                            format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "FechaFin",
                            title: window.app.idioma.t("FECHA_FIN"),
                            template: '#= FechaFin !== null ? kendo.toString(FechaFin, "' + kendo.culture().calendars.standard.patterns.MES_FechaHora + '" ) : "" #',
                            width: "170px",
                            format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "totalHoras",
                            title: window.app.idioma.t("DURACION_PROCESO"),
                            width: "80px",
                            template: function (e) {
                                return '<div>' + (e.totalHoras !== null ? ConversorHorasMinutosSegundos(e.totalHoras * 3600) : "") + '</div>';
                            }
                        }
                    ],
                    dataBinding: function (e) {
                        self.resizeGrid("#gridProcs");
                        if (self.order.EstadoActual.Descripcion === "Consolidando datos") {
                            $("#gridProcs").data('kendoGrid').showColumn('ID_Uom');
                            $("#btnCerrarOrden").show();
                        } else {
                            $("#gridProcs").data('kendoGrid').hideColumn('ID_Uom');
                            $("#btnCerrarOrden").hide();
                        }
                        if (!self.isOrdenActiva) {
                            $("#btnCerrarOrden").hide();
                            $("#btnConsolidarDatos").hide();
                        }
                    },
                    dataBound: function () {
                        for (var i = 4; i < this.columns.length; i++) {
                            this.autoFitColumn(i);
                        }
                        $("[data-funcion]").checkSecurity();

                        VerDeltaV = self.VerDeltaV;
                        self.events(self);
                    },
                }).data("kendoGrid");
            },
            CambiaProcHistorian: function () {
                var self = this;

                var proc = $("#cmbProcedimientoHistorian").data("kendoDropDownList").value();

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerKOPSHistorian/" + parseInt(self.idorden) + "/" + parseInt(proc),
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
                            self.dsTransferencias.data().forEach(function (item, index) {
                                if (trains.indexOf(item.equipoDestino.substring(1, 2)) === -1)
                                    //L109_EQ_LLE_...
                                    trains.push(item.equipoDestino.substring(1, 2));
                            });

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
            DeclararProduccion: function (e) {
                var self = this;
                if (self.order.EstadoActual.Descripcion !== 'Consolidando datos')
                    self.vistaFormWO = new VistaDeclararProd(self.order);
                else
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_SE_PUEDE'), 2000);
            },
            EditaInfoProc: function (e) {
                var self = this;

                //Obtenemos la línea seleccionada del grid
                var tr = $('.btnSAI').on('click').parent().parent().find('td:eq(4)')[0].innerHTML; // get the current table row (tr)
                // get the data bound to the current table row
                var data = self.gridProcs.dataItem(tr);

                self.vistaEditaProcs = new vistaEditaProcs(data, self.order);
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
            PararProcedimiento: function (e) {
                var self = this;

                //Obtenemos la línea seleccionada del grid
                var tr = $('.btnSAI').on('click').parent().parent().find('td:eq(4)')[0].innerHTML; // get the current table row (tr)
                // get the data bound to the current table row
                var data = $('#gridProcs').data('kendoGrid').dataItem(tr);

                self.vistaProcs = new VistaProcedimientos(data, 'Fin');
            },
            HeaderData: function () {
                var self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/ObtenerDetalleOrdenFab/" + parseInt(self.idorden),
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.order = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 2000);
                });
            },
            VerDeltaV: function (id) {
                var self = this;
                var ordeType = $('.btnSAI').on('click').parent().parent().find('td:eq(4)')[0].innerHTML;
                //Obtenemos la línea seleccionada del grid
                var tr = $('#btnProcSAI' + id).on('click').parent().parent().closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var data = $('#gridProcs').data('kendoGrid').dataItem(tr);
                data.ID_Orden = data.IdWO;
                data.Des_Procedimiento = data.Id;
                self.vistaDeltaV = new VistaDeltaV(data, ordeType);
            },
            ObtenerTiposCervezaTCP: function () {
                var self = this;
                var listaCervezas = null;

                $.ajax({
                    url: "../api/materiales/cervezasTipoSemielaborado/",
                    dataType: 'json',
                    async: false
                }).done(function (lista) {
                    listaCervezas = lista;
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_CERVEZAS_SEMIELABORADO'), 4000);
                    }
                });

                listaCervezas = listaCervezas.filter(function (item) {
                    return item.IdMaterial.length == 6;
                });

                self.dsTipoCervezas = new kendo.data.DataSource({
                    data: listaCervezas,
                });
            },
            AbrirModalTipoCerveza: function (e) {
                var self = this;
                var permiso = TienePermiso(72);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                //Creamos el div donde se va a pintar la ventana modal
                $("body").prepend($("<div id='dlgTipoCerveza'></div>"));

                self.ConfigurarModalTipoCerveza(e);

                self.ventanaTipoCerveza = $('#dlgTipoCerveza').data("kendoWindow");
                if (typeof self.ventanaTipoCerveza != "undefined") {
                    self.ventanaTipoCerveza.center();
                }
            },
            ConfigurarModalTipoCerveza: function (e) {
                var self = this;

                $("#dlgTipoCerveza").kendoWindow(
                    {
                        title: window.app.idioma.t('CAMBIAR_TIPO_CERVEZA_TCP'),
                        width: "665px",
                        content: "Fabricacion/html/SeleccionTipoCervezaTCP.html",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        scrollable: false,
                        close: function () {
                            self.ventanaTipoCerveza.destroy();
                            self.ventanaTipoCerveza = null;
                        },
                        refresh: function () {
                            self.CargarContenidoModalTipoCerveza(e);
                        }
                    });
            },
            CargarContenidoModalTipoCerveza: function (e) {
                var self = this;

                $("#btnAceptarTipoCerveza").val(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarTipoCerveza").val(window.app.idioma.t('CANCELAR'));
                //var orden = gridData.length == 0 ? 1 : gridData[gridData.length - 1].Orden + 1;

                $("#lblTipoCerveza").text(window.app.idioma.t('TIPO_CERVEZA'));
                $("#lblCervezaBarril").text(window.app.idioma.t('CERVEZA_BARRIL'));

                const selectedId = self.order.Material.ID;

                // Filtramos solo aprobados y el material de la orden.                
                const finalDropdownData = self.dsTipoCervezas.options.data.filter(item =>
                    item.Status === "APPROVED" || item.IdMaterial === selectedId
                );

                $("#cmbTipoCerveza").kendoDropDownList({
                    filter: "contains",
                    dataSource: finalDropdownData,
                    dataTextField: "Descripcion",
                    dataValueField: "IdMaterial",
                });
                $("#cmbTipoCerveza").data("kendoDropDownList").value(selectedId);

                let dsCervezaBarril = new kendo.data.DataSource({
                    data: [
                        { value: 'NO', text: window.app.idioma.t('NO').toUpperCase() },
                        { value: 'SI', text: window.app.idioma.t('SI').toUpperCase() }
                    ]
                });

                $("#cmbCervezaBarril").kendoDropDownList({
                    dataSource: dsCervezaBarril,
                    dataTextField: "text",
                    dataValueField: "value",
                });                
                $("#cmbCervezaBarril").data("kendoDropDownList").value(self.order.CzaBarril);

                $("#btnCancelarTipoCerveza").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        self.ventanaTipoCerveza.close();
                    }
                });

                $("#btnAceptarTipoCerveza").kendoButton({
                    click: function () {
                        let tipoCervezaSel = $("#cmbTipoCerveza").data("kendoDropDownList").value();
                        let cervezaBarrilSel = $("#cmbCervezaBarril").data("kendoDropDownList").value();

                        if (tipoCervezaSel == self.order.Material.ID && cervezaBarrilSel == self.order.CzaBarril) {
                            return;
                        }

                        const selectedMaterial = self.dsTipoCervezas.options.data.find(item => item.IdMaterial === tipoCervezaSel);
                        if (selectedMaterial?.Status !== "APPROVED") {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('MATERIAL_OBSOLETO') + '.' + window.app.idioma.t('SELECCIONAR_OTRO_MATERIAL'), 4000);
                            return;
                        }

                        var data = {};
                        data.loteMES = self.order.LoteMES;
                        data.idWO = self.order.PK;
                        data.codWO = self.order.ID;
                        data.idMaterial = tipoCervezaSel;
                        data.czaBarril = cervezaBarrilSel;

                        self.CambiarTipoCerveza(data);
                    }
                });
            },
            CambiarTipoCerveza: function (data) {
                var self = this;

                $.ajax({
                    type: "PUT",
                    url: "../api/materiales/WOPrellenado",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(data),
                    success: function (res) {
                        if (res) {
                            self.ventanaPadre.ActualizaDetalle(self.ventanaPadre, { cambioTipoMaterial: true });
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('TIPO_CERVEZA_TCP_CORRECTA'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('TIPO_CERVEZA_TCP_INCORRECTA'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (e) {
                        Backbone.trigger('eventCierraDialogo');
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CAMBIAR_TIPO_CERVEZA_TCP'), 4000);
                        }
                    }
                });

                self.ventanaTipoCerveza.close();
            },
            ObtenerTiposMosto: function () {
                var self = this;
                let listaMostos = null;
                let url = self.order.TipoOrden.ID == self.tipoWO.Coccion ? "../api/materiales/mostosCoccionTipoSemielaborado/" : "../api/materiales/mostosTipoSemielaborado/";

                $.ajax({
                    url: url,
                    dataType: 'json',
                    async: false
                }).done(function (lista) {
                    listaMostos = lista;
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_MOSTOS_SEMIELABORADO'), 4000);
                    }
                });

                listaMostos = listaMostos.filter(function (item) {
                    return item.IdMaterial.length == 6;
                });

                self.dsTipoMostos = new kendo.data.DataSource({
                    data: listaMostos,
                });
            },
            AbrirModalTipoMosto: function (e) {
                var self = this;
                var permiso = TienePermiso(72);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                //Creamos el div donde se va a pintar la ventana modal
                $("body").prepend($("<div id='dlgTipoMosto'></div>"));

                self.ConfigurarModalTipoMosto(e);

                self.ventanaTipoMosto = $('#dlgTipoMosto').data("kendoWindow");
                if (typeof self.ventanaTipoMosto != "undefined") {
                    self.ventanaTipoMosto.center();
                }
            },
            ConfigurarModalTipoMosto: function (e) {
                var self = this;
                let titulo = (self.order.TipoOrden.ID == self.tipoWO.Coccion) ? window.app.idioma.t('CAMBIAR_TIPO_MOSTO_COCCION') :
                    (self.order.TipoOrden.ID == self.tipoWO.Fermentacion) ? window.app.idioma.t('CAMBIAR_TIPO_MOSTO_FERMENTACION') : window.app.idioma.t('CAMBIAR_TIPO_MOSTO_GUARDA');

                $("#dlgTipoMosto").kendoWindow(
                    {
                        title: titulo,
                        width: "645px",
                        height: "105px",
                        content: "Fabricacion/html/SeleccionTipoMosto.html",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        scrollable: false,
                        close: function () {
                            self.ventanaTipoMosto.destroy();
                            self.ventanaTipoMosto = null;
                        },
                        refresh: function () {
                            self.CargarContenidoModalTipoMosto(e);
                        }
                    });
            },
            CargarContenidoModalTipoMosto: function (e) {
                var self = this;

                $("#btnAceptarTipoMosto").val(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarTipoMosto").val(window.app.idioma.t('CANCELAR'));

                $("#lblTipoMosto").text(window.app.idioma.t('TIPO_MOSTO'));                

                const selectedId = self.order.Material.ID;

                // Filtramos solo aprobados y el material de la orden.                
                const finalDropdownData = self.dsTipoMostos.options.data.filter(item =>
                    item.Status === "APPROVED" || item.IdMaterial === selectedId
                );

                $("#cmbTipoMosto").kendoDropDownList({
                    filter: "contains",
                    dataSource: finalDropdownData,
                    dataTextField: "Descripcion",
                    dataValueField: "IdMaterial",
                });

                $("#cmbTipoMosto").data("kendoDropDownList").value(selectedId);

                $("#btnCancelarTipoMosto").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        self.ventanaTipoMosto.close();
                    }
                });

                $("#btnAceptarTipoMosto").kendoButton({
                    click: function () {
                        var data = {};
                        data.loteMES = self.order.LoteMES;
                        data.idWO = self.order.PK;
                        data.idTipoWO = self.order.TipoOrden.ID;
                        data.idMaterial = $("#cmbTipoMosto").data("kendoDropDownList").value();

                        const selectedMaterial = self.dsTipoMostos.options.data.find(item => item.IdMaterial === data.idMaterial);
                        if (selectedMaterial?.Status !== "APPROVED") {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('MATERIAL_OBSOLETO') + '.' + window.app.idioma.t('SELECCIONAR_OTRO_MATERIAL'), 4000);
                            return;
                        }

                        self.CambiarTipoMosto(data);
                    }
                });
            },
            CambiarTipoMosto: function (data) {
                var self = this;

                $.ajax({
                    type: "PUT",
                    url: "../api/materiales/TipoMosto",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(data),
                    success: function (res) {
                        if (res) {
                            self.ventanaPadre.ActualizaDetalle(self.ventanaPadre, { cambioTipoMaterial: true });
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('TIPO_MOSTO_CORRECTA'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('TIPO_MOSTO_INCORRECTA'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (e) {
                        Backbone.trigger('eventCierraDialogo');
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CAMBIAR_TIPO_MOSTO'), 4000);
                        }
                    }
                });

                self.ventanaTipoMosto.close();
            },
            verInformePDF: function () {
                var self = this;
                var codWO = self.order.ID;
                if (codWO != "") {
                    GenerarInforme(
                        window.app.idioma.t("INFORME_SEGUIMIENTO_WO_FERMENTACION"),
                        `InformeSeguimientoWOFermentacion.aspx?paramCodWO=${codWO}`,
                        { height: "90%", width: "90%" }
                    );
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_INTRODUCIR_UN') + ": Cod WO", 4000);
                }
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
        });

        return vistaDetalleOrdenProcesoSAI;
    });