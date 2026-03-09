define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/vpVerDetallesOrden_LIMS.html',
    'compartido/notificaciones',
    'jszip', 'compartido/utils', '../../../../Portal/js/constantes'
],
    function (_, Backbone, $, FormDetalleOrden, Not, JSZip, utils, enums) {
        var vistaDetalleOrdenLIMS = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenidoLIMS',
            template: _.template(FormDetalleOrden),
            constTipoWO: enums.TipoWO(),
            mostrarLanzarMuestra: false,
            initialize: function ({ LoteMES, FechaLote, opciones }) {
                var self = this;
                window.JSZip = JSZip;
                self.opciones = opciones
                self.LoteMES = LoteMES;
                self.FechaLote = FechaLote;
                
                if (opciones.IdTipoOrden) {
                    // Tipos de WO permitidas para lanzar muestras
                    let tipoWOLanzarMuestra = [
                        self.constTipoWO.Coccion,
                        self.constTipoWO.Fermentacion,
                        self.constTipoWO.Guarda,
                        self.constTipoWO.Prellenado,
                    ]
                    self.mostrarLanzarMuestra = tipoWOLanzarMuestra.includes(opciones.IdTipoOrden)

                } else {
                    self.mostrarLanzarMuestra = opciones.mostrarLanzarMuestra || false;
                }

                //self.IdTipoOrden = parseInt(self.order.TipoOrden.ID);
                self.ValidarPermisos(self);               

                self.dsLIMS = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/LIMS/ObtenerMuestrasLIMS/" + self.LoteMES,
                            dataType: "json"
                        }
                    },
                    schema: {
                        model: {
                            id: "IdMuestra",
                            fields: {
                                'IdMuestra': { type: "number" },
                                'FechaCreacion': { type: "date" },
                                'TimeStampSM': { type: "date" },
                            }
                        }
                    },
                    requestStart: function (e) {
                        if (!self.permisoVisualizacionLIMS && !self.permisoGestionLIMS) {
                            e.preventDefault();
                        }
                    },
                    pageSize: 30,
                });

                self.render(self);

            },
            render: function (self) {
                //$(self.el).html(self.template());
                self.CargarLIMS(self);                
            },
            CargarLIMS: function (self) {
                if (!$("#gridLIMS").data("kendoGrid")) {
                    self.CargarGridLIMS(self);
                } else {
                    self.dsLIMS.read();
                }
            },
            CargarGridLIMS: function (self) {
                self.gridLims = $("#gridLIMS").kendoGrid({
                    dataSource: self.dsLIMS,
                    sortable: true,
                    scrollable: true,
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
                        this.expandRow(this.tbody.find("tr.k-master-row").first());
                        LimpiarFiltrosLIMS = self.LimpiarFiltrosLIMS;
                        $("#btnLanzar").click(function () {
                            self.LanzarMuestraModal(self)
                        })
                        LanzarMuestraModal = self.LanzarMuestraModal;
                        self.CargarFechaUltimaPeticion(self);
                        //self.resizeGrid("#gridLIMS");
                    },
                    toolbar: [
                        {
                            template: function () {
                                if (self.mostrarLanzarMuestra && self.permisoGestionLIMS) {
                                    return "<button id='btnLanzar' data-funcion='FAB_PROD_EXE_9_GestionLIMs' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'> " +
                                        "<span><img src='../../../Common/img/muestra.png' style='width: 16px; opacity: 0.8; margin-right: 6px;'/></span>" + window.app.idioma.t('LANZAR_MUESTRA') + "</button>";
                                } else {
                                    return "";
                                }
                            },
                        },
                        {
                            template: "<button id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;' onClick='LimpiarFiltrosLIMS()'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        }
                    ],
                    columns: [
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
                            field: "Nivel",
                            title: window.app.idioma.t("NIVEL"),
                        },
                        {
                            field: "TimeStampSM",
                            title: window.app.idioma.t("FECHA"),
                            template: '#= TimeStampSM !== null ? kendo.toString(new Date(TimeStampSM), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
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
            CargarFechaUltimaPeticion: function (self) {
                $.ajax({
                    type: "GET",
                    async: true,
                    url: "../api/LIMS/ObtenerFechaUltimaPeticionLIMs/" + self.LoteMES + "/true",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        if (response) {
                            if ($("#fechaUltimaPeticion").length == 0) {
                                $("#gridLIMS").append('<div id="fechaUltimaPeticion" style="position: absolute; top: 10px; left: 20px;"></div>');
                            }
                            $("#fechaUltimaPeticion").html(`${window.app.idioma.t("FECHA_ULTIMA_PETICION_MUESTRA")} 
                            ${kendo.toString(new Date(response), kendo.culture().calendars.standard.patterns.MES_FechaHora)}`);
                        }
                    },
                    error: function (response) {

                    }
                });
            },
            LimpiarFiltrosLIMS() {
                $(".k-grid").each(function () {
                    var subGrid = $(this).data("kendoGrid");
                    if (subGrid) {
                        subGrid.dataSource.filter({});
                    }
                });
            },
            //LanzarMuestraModal: function (loteMES, fechaLote) {
            LanzarMuestraModal: function (self) {
                if (!self) {
                    return;
                }

                let tmplt = Array.from($(self.template())).find(e => e.id == 'lanzarMuestraTemplate').innerHTML;
                    
                let data = {
                    IdLoteMES: self.LoteMES,
                    FechaLoteMES: self.FechaLote.toISOString(),
                    IdWorkflow: 0,
                    Comentarios: ''
                }

                let ventana = $("<div id='window-lanzar'/>").kendoWindow({
                    title: window.app.idioma.t("LANZAR_MUESTRA"),
                    close: function () {
                        kendoWindow.destroy();
                    },
                    resizable: false,
                    modal: true
                })

                let kendoWindow = ventana.getKendoWindow();

                let template = kendo.template(tmplt);
                kendoWindow
                    .content(template(data));

                kendo.init(ventana);

                // DropDownList de workflows
                let workflowDDL = $("#inpt_flujo").getKendoDropDownList();
                if (workflowDDL) {
                    let ds = new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: "../api/LIMS/ObtenerWorkflowsLIMS/",
                                dataType: "json"
                            }
                        },
                        schema: {
                            parse: function (response) {

                                for (let r of response) {
                                    r.Descripcion = `${r.Nombre}${(r.Descripcion ? ' - '+r.Descripcion: '')}`                                    
                                }

                                return response;
                            },
                            model: {
                                id: "Id",
                                fields: {
                                    'Id': { type: "number" },
                                    'Nombre': { type: "string" },
                                    'Descripcion': { type: "string" },
                                }
                            }
                        }
                    });

                    workflowDDL.setDataSource(ds);
                }

                // Configuramos los botones
                $("#btnCancelarLIMS").click((e) => {
                    kendoWindow.close();
                })

                $("#btnAceptarLIMS").click(async (e) => {
                    data.IdWorkflow = $("#inpt_flujo").getKendoDropDownList().value();
                    data.Comentarios = $("#inpt_comentarios").val()

                    if (!data.IdWorkflow) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ID_WORKFLOW_NECESARIO'), 3000);
                        return;
                    }

                    kendo.ui.progress($("#window-lanzar"), true);

                    try {
                        await self.LanzarMuestra(data);              
                        kendo.ui.progress($("#window-lanzar"), false);
                        kendoWindow.close();
                        self.CargarFechaUltimaPeticion(self);
                        if (self.opciones.PeticionMuestraCallback) {
                            self.opciones.PeticionMuestraCallback();
                        }

                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PETICION_MUESTRA_LIMS_EXITO'), 3000);
                    }
                    catch (er) {
                        kendo.ui.progress($("#window-lanzar"), false);
                        console.log(er);
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CREANDO_PETICION_MUESTRA_LIMS'), 3000);
                    }                     
                    
                })

                kendoWindow.center().open();

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
                        error: function (err) {
                            reject(err);
                        }
                    });
                });
            },
            ValidarPermisos: function (self) {

                self.permisoVisualizacionLIMS = TienePermiso(340);
                self.permisoGestionLIMS = TienePermiso(341);

            }
        });
        return vistaDetalleOrdenLIMS;
    });