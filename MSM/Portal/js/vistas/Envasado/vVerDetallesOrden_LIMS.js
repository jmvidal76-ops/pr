define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/vpVerDetallesOrden_LIMS.html',
    'compartido/notificaciones',
    'jszip', 'compartido/utils', '../../../../Portal/js/constantes'
],
    function (_, Backbone, $, FormDetalleOrden, Not, JSZip, utils, enums) {
        var vistaDetalleOrdenLIMS = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenidoLIMS',
            template: _.template(FormDetalleOrden),
            initialize: function ({ wo, lotes, fechaLote, opciones }) {
                var self = this;
                window.JSZip = JSZip;
                self.opciones = opciones;
                self.lotes = lotes;
                self.fechaLote = fechaLote;
                self.wo = wo.replace(/\./g, '-');

                self.ValidarPermisos(self);

                // Verificar si self.lotes tiene elementos antes de crear el datasource
                if (self.lotes.length === 0) {
                    // Crear un datasource vacío para el grid
                    self.dsLIMS = new kendo.data.DataSource({
                        data: []
                    });
                } else {
                    self.dsLIMS = new kendo.data.DataSource({
                        transport: {
                            read: async function (options) {
                                try {
                                    const response = await $.ajax({
                                        url: "../api/LIMS/ObtenerMuestrasLIMSMultiples",
                                        type: "POST",
                                        contentType: "application/json",
                                        dataType: "json",
                                        data: JSON.stringify(self.lotes)
                                    });

                                    const enrichedData = await Promise.all(response.map(async item => {
                                        const fechaUltPet = await self.CargarFechaUltimaPeticion(item.IdLote);
                                        return {
                                            ...item,
                                            FechaUltimaPeticion: fechaUltPet
                                        };
                                    }));

                                    // Ordenar
                                    enrichedData.sort((a, b) => {
                                        if (!a.IdLote) return 1;
                                        if (!b.IdLote) return -1;
                                        return a.IdLote.localeCompare(b.IdLote); // ascendente
                                    });

                                    options.success(enrichedData);
                                } catch (e) {
                                    if (e.status == '403' && e.responseJSON === 'NotAuthorized') {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                    } else {
                                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'ObtenerMuestrasLIMSMultiples', 4000);
                                    }
                                }
                            },
                            parameterMap: function (data, type) {
                                if (type === "read") {
                                    return JSON.stringify(self.lotes);
                                }
                            }
                        },
                        schema: {
                            model: {
                                id: "IdMuestra",
                                fields: {
                                    'IdMuestra': { type: "number" },
                                    'CantidadInicial': { type: "number" },
                                    'FechaCreacion': { type: "date" },
                                    'TimeStampSM': { type: "date" },
                                    'FechaUltimaPeticion': { type: "date" }                                    
                                }
                            }
                        },
                        pageSize: 30,
                        requestStart: function (e) {
                            var gridElement = $("#gridLIMS_" + self.wo);
                            gridElement.css("min-height", "120px");
                            kendo.ui.progress(gridElement, true);
                        },
                        requestEnd: function (e) {
                            var gridElement = $("#gridLIMS_" + self.wo);
                            kendo.ui.progress(gridElement, false);
                        }
                    });
                }

                self.render();
            },
            render: function () {                
                var self = this;
                $(self.el).html(self.template({ wo: self.wo }));
                return self;
            },
            CargarLIMS: function () {
                var self = this;
                var grid = $("#gridLIMS_" + self.wo).data("kendoGrid");
                if (!grid) {
                    self.CargarGridLIMS();
                } else {
                    self.dsLIMS.read();
                }
            },
            CargarGridLIMS: function () {
                var self = this;
                self.gridLims = $("#gridLIMS_" + self.wo).kendoGrid({
                    dataSource: self.dsLIMS,
                    sortable: true,
                    scrollable: true,
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 500, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    detailInit: detailInit,
                    dataBound: function () {
                        $('[data-funcion]').checkSecurity();

                        // Asignamos la función LimpiarFiltrosLIMS del contexto de self
                        var LimpiarFiltrosLIMS = self.LimpiarFiltrosLIMS;

                        // Configuramos el evento de click para el botón Lanzar
                        $("#btnLanzar_" + self.wo).click(function () {
                            self.LanzarMuestraModal(self);
                        });

                        // Asignamos la función LanzarMuestraModal del contexto de self
                        var LanzarMuestraModal = self.LanzarMuestraModal;

                        //// Configuramos el evento de click para el botón LimpiarFiltros
                        //$("#btnLimpiarFiltros_" + self.wo).click(function () {
                        //    LimpiarFiltrosLIMS(self.wo);
                        //});
                    },
                    noRecords: {
                        template: window.app.idioma.t("SIN_RESULTADOS")
                    },
                    toolbar: [
                        {
                            template: function () {
                                if (self.opciones.TipoWO == 'Activas' && self.lotes.length > 0) {
                                    if (self.LanzarMuestrasLIMSenWO) {
                                        return "<button id='btnLanzar_" + self.wo + "' class='k-button k-button-icontext k-i-delete' style='margin-left:5px; float:right;'>" +
                                            "<span><img src='../../../Common/img/muestra.png' style='width: 16px; opacity: 0.8; margin-right: 6px;'/></span>" + window.app.idioma.t('LANZAR_MUESTRA') + "</button>";
                                    } else {
                                        return "";
                                    }
                                }
                                else {
                                    return "";
                                }
                            }
                        },
                        //{
                        //    template: "<button id='btnLimpiarFiltros_" + self.wo + "' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'>" +
                        //        "<span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        //}
                    ],
                    columns: [
                        {
                            template: function (data) {
                                if (self.opciones.TipoWO === 'Activas') {
                                    return '<input class="checkbox" type="checkbox" style="width: 14px; height: 14px;" />';
                                } else {
                                    return '<input class="checkbox" type="checkbox" style="width: 14px; height: 14px; display: none;" />';
                                }
                            },
                            width: 35
                        },
                        {
                            template: function (e) {
                                let title = window.app.idioma.t("ESTADO_LIMS_" + e.IdEstado) || "";
                                return "<div class='circle_cells' title='" + title + "' style='background-color:" + e.ColorEstado + ";width:25px;height:25px;'/>"
                            },
                            width: "50px",
                            title: window.app.idioma.t("LIMS"),
                            attributes: { style: "text-align:center;" },
                            groupable: false
                        },
                        {
                            field: "IdLote",
                            width: "350px",
                            title: window.app.idioma.t("LOTE"),
                        },
                        {
                            field: "IdMuestraSM",
                            title: window.app.idioma.t("IDSAMPLE"),
                        },
                        {
                            field: "TipoMuestra",
                            title: window.app.idioma.t("TIPO_SAMPLE"),
                        },
                        {
                            field: "Producto",
                            title: window.app.idioma.t("PRODUCTO"),
                        },
                        {
                            field: "ProductoDesc",
                            title: window.app.idioma.t("DESCRIPCION_PRODUCTO"),
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD"),
                            field: 'CantidadInicial',
                            format: '{0:n2}',
                        },
                        {
                            field: "TimeStampSM",
                            title: window.app.idioma.t("FECHA"),
                            template: '#= (IdMuestraSM !== null && IdMuestraSM !== "" && TimeStampSM !== null) ? kendo.toString(new Date(TimeStampSM), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
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
                            field: "FechaUltimaPeticion",
                            title: window.app.idioma.t("FECHA_ULT_PETICION"),
                            format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        }                        
                        //{
                        //    command: [
                        //        //{ name: "destroy", text: "Eliminar" }
                        //        {
                        //            template: "<a class='k-button eliminaLims'>" + window.app.idioma.t("ELIMINAR") + "</a>",
                        //            attributes: { style: "text-align: center;" }
                        //        }

                        //        //, { name: "edit", text: { edit: "", update: window.app.idioma.t("LANZAR"), cancel: window.app.idioma.t("CANCELAR") } }
                        //    ],
                        //    title: "&nbsp;",
                        //},
                    ],                    
                }).data("kendoGrid");

                function detailInit(e) {
                    let ds = new kendo.data.DataSource({
                        data: e.data.Analiticas,
                        schema: {
                            model: {
                                id: "IdAnalitica",
                                fields: {
                                    'IdAnalitica': { type: "number" },
                                    'ValorResultado': { type: "number" },
                                    'RangoLimitesMinTOL': { type: "number" },
                                    'RangoLimitesMaxTOL': { type: "number" },
                                    'RangoLimitesMinLIM': { type: "number" },
                                    'RangoLimitesMaxLIM': { type: "number" },
                                    'FechaResultado': { type: "date" },
                                    'FechaAutorizacion': { type: "date" },
                                    'TimeStampSM': { type: "date" },
                                    'FechaCreacion': { type: "date" },
                                }
                            }
                        },
                        pageSize: 30,
                    });

                    $("<div/>").appendTo(e.detailCell).kendoGrid({
                        dataSource: ds,
                        sortable: true,
                        scrollable: true,
                        //filterable: {
                        //    extra: false,
                        //    messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        //    operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                        //},
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            pageSizes: [50, 100, 500, 'All'],
                            buttonCount: 5,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        columns: [
                            {
                                template: function (e) {
                                    let title = window.app.idioma.t("ESTADO_LIMS_" + e.IdEstado) || "";
                                    return "<div class='circle_cells' title='"+ title +"' style='background-color:" + e.ColorEstado + ";width:25px;height:25px;'/>"
                                },
                                width: "50px",
                                title: window.app.idioma.t("LIMS"),
                                attributes: { style: "text-align:center;" },
                                groupable: false
                            },
                            {
                                field: "CodigoTest",
                                title: window.app.idioma.t("CODIGO_TEST"),
                                width: "150px",
                            },
                            {
                                field: "DescripcionTest",
                                title: window.app.idioma.t("DESCRIPCION_TEST"),
                                width: "200px",
                            },
                            {
                                field: "Componente",
                                title: window.app.idioma.t("COMPONENTE"),
                                width: "150px",
                            },
                            {
                                field: "DescripcionComponente",
                                title: window.app.idioma.t("DESCRIPCION_COMPONENTE"),
                                width: "200px",
                            },
                            {
                                field: "ValorResultado",
                                title: window.app.idioma.t("VALOR"),
                                template: '#= ValorResultado != null ? ValorResultado.toFixed(2) : ""#',
                                width: "80px",
                            },
                            {
                                field: "Unidad",
                                title: window.app.idioma.t("UNIDAD"),
                                width: "100px",
                            },
                            {
                                field: "Valido_OOS",
                                title: 'OOS',
                                width: "80px",
                            },
                            {
                                field: "RangoLimitesMinLIM",
                                title: window.app.idioma.t("RANGO_LIM_MIN"),
                                template: '#= RangoLimitesMinLIM.toFixed(2)#',
                                width: "150px",
                            },
                            {
                                field: "RangoLimitesMaxLIM",
                                title: window.app.idioma.t("RANGO_LIM_MAX"),
                                template: '#= RangoLimitesMaxLIM.toFixed(2)#',
                                width: "150px",
                            },
                            {
                                field: "RangoLimitesMinTOL",
                                title: window.app.idioma.t("RANGO_TOL_MIN"),
                                template: '#= RangoLimitesMinTOL.toFixed(2)#',
                                width: "150px",
                            },
                            {
                                field: "RangoLimitesMaxTOL",
                                title: window.app.idioma.t("RANGO_TOL_MAX"),
                                template: '#= RangoLimitesMaxTOL.toFixed(2)#',
                                width: "150px",
                            },
                            {
                                field: "FechaResultado",
                                title: window.app.idioma.t("FECHA_RESULTADO"),
                                width: "160px",
                                template: '#= FechaResultado !== null ? kendo.toString(new Date(FechaResultado), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
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
                                field: "FechaAutorizacion",
                                title: window.app.idioma.t("FECHA_AUTORIZACION"),
                                width: "170px",
                                template: '#= FechaAutorizacion !== null ? kendo.toString(new Date(FechaAutorizacion), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
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
                                field: "PersonaValidado",
                                title: window.app.idioma.t("PERSONA_VALIDADO"),
                                width: "160px",
                            },
                            {
                                field: "Comentario",
                                title: window.app.idioma.t("COMENTARIO"),
                                width: "200px",
                            },

                        ]
                    });
                }
            },
            CargarFechaUltimaPeticion: async function (LoteMES) {
                return new Promise((resolve, reject) => {

                    $.ajax({
                        type: "GET",
                        async: true,
                        url: "../api/LIMS/ObtenerFechaUltimaPeticionLIMs/" + LoteMES + "/false",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (result) {
                            resolve(result);
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'ObtenerFechaUltimaPeticionLIMs', 4000);
                            }
                            reject(result);
                        }
                    });
                });
            },
            LimpiarFiltrosLIMS(wo) {
                var gridLIMS = $("#gridLIMS_" + wo).data("kendoGrid");
                if (gridLIMS) {
                    gridLIMS.dataSource.filter({}); 
                }
            },
            LanzarMuestraModal: function (self) {
                if (!self) return;

                var grid = $("#gridLIMS_" + self.wo).data("kendoGrid");
                var checkedRow = grid.tbody.find("input[type='checkbox']:checked").closest("tr");

                if (checkedRow.length === 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                if (checkedRow.length > 1) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_ELEGIR_SOLO_UN_REGISTRO'), 4000);
                    return;
                }

                var dataItem = grid.dataItem(checkedRow);

                var WF = self.ObtenerWFParametrosGenerales();
                var WorkFlowData = WF ? self.ObtenerDatosWorkFlow(WF) : null;

                let tmplt = document.getElementById("lanzarMuestraTemplate").innerHTML;

                let data = {
                    IdLoteMES: dataItem.IdLote,
                    FechaLoteMES: self.fechaLote.toISOString(),
                    IdWorkflow: WF,
                    WorkFlowData: WorkFlowData,
                    Comentarios: '',
                    wo: self.wo
                };

                // Destruir y eliminar cualquier ventana anterior
                var anterior = $("#window-lanzar");
                if (anterior.data("kendoWindow")) {
                    anterior.data("kendoWindow").destroy();
                }
                anterior.remove(); // eliminar el div del DOM por completo

                // Crear nuevo div para ventana
                let ventana = $("<div id='window-lanzar'/>").kendoWindow({
                    title: window.app.idioma.t("LANZAR_MUESTRA"),
                    resizable: false,
                    modal: true,
                    close: function () {
                        ventana.getKendoWindow().destroy();
                        ventana.remove(); // eliminar al cerrar también
                    }
                });

                let kendoWindow = ventana.getKendoWindow();
                let template = kendo.template(tmplt);
                kendoWindow.content(template(data));

                kendo.init(ventana);

                function resetModal() {
                    $("#inpt_comentarios").val(window.app.idioma.t('MUESTRA_LANZADA_WO_PORTAL'));
                }
                resetModal();

                // Botones
                ventana.on("click", ".btnCancelarLIMS", function () {
                    kendoWindow.close();
                });

                ventana.on("click", ".btnAceptarLIMS", async function () {
                    data.IdWorkflow = WF;
                    data.Comentarios = $("#inpt_comentarios").val();

                    if (!data.IdWorkflow) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ID_WORKFLOW_NECESARIO'), 3000);
                        return;
                    }

                    kendo.ui.progress($("#window-lanzar"), true);

                    try {
                        await self.LanzarMuestra(data);
                        kendo.ui.progress($("#window-lanzar"), false);
                        kendoWindow.close();

                        if (self.opciones.PeticionMuestraCallback) {
                            self.opciones.PeticionMuestraCallback();
                        }

                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PETICION_MUESTRA_LIMS_EXITO'), 3000);
                        self.dsLIMS.read();
                    } catch (er) {
                        kendo.ui.progress($("#window-lanzar"), false);
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CREANDO_PETICION_MUESTRA_LIMS'), 3000);
                    }
                });

                kendoWindow.center().open();
            },

            ObtenerWFParametrosGenerales: function () {
                var self = this;

                var IdWorkflowSeleccionado = null;
                var clave = "WF_CONT";

                $.ajax({
                    type: "GET",
                    url: `../api/LIMS/ObtenerParametroGeneral_LIMS`,
                    dataType: 'json',
                    data: { Clave: clave },
                    cache: true,
                    async: false,
                    contentType: "application/json; charset=utf-8",
                    success: function (res) {
                        IdWorkflowSeleccionado = res;
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'),"ObtenerParametroGeneral_LIMS", 3000);
                        }
                    }
                });

                return IdWorkflowSeleccionado;
            },
            ObtenerDatosWorkFlow: function (WF) {
                var self = this;

                var WorkFlowData = null;
                var idWofkFlow = parseInt(WF, 10);

                $.ajax({
                    url: "../api/LIMS/ObtenerWorkflowsLIMS/",
                    dataType: "json",
                    async: false,
                    success: function (workflows) {
                        for (let i = 0; i < workflows.length; i++) {
                            if (workflows[i].Id == idWofkFlow) {
                                WorkFlowData = `${workflows[i].Nombre}${(workflows[i].Descripcion ? ' - ' + workflows[i].Descripcion : '')}`;
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

                return WorkFlowData;
            },
            LanzarMuestra: async function (datos) {
                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        url: `../api/LIMS/PeticionMuestraLIMS`,
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(datos),
                        success: function (data) {
                            resolve();
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON === 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'PeticionMuestraLIMS', 4000);
                            }
                            reject(e);
                        }
                    });
                });
            },
            ValidarPermisos: function (self) {

                self.LanzarMuestrasLIMSenWO = TienePermiso(425); //Permiso para lanzar muestras LIMS en WO
            }
        });
        return vistaDetalleOrdenLIMS;
    });