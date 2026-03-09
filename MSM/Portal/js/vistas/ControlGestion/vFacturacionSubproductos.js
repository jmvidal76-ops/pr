define(['underscore', 'backbone', 'jquery', 'text!../../../ControlGestion/html/FacturacionSubproductos.html', 'compartido/notificaciones'
    , '../../../../Portal/js/constantes', 'vistas/Almacen/vCamionesEntradaSalida', 'vistas/Almacen/vCamionesEliminar', 'jszip', 'compartido/util'],
    function (_, Backbone, $, plantilla, Not, enums, vistaEntradaSalida, vistaCamionesEliminar, JSZip, util) {
        var vistaFacturacionSubproductos = Backbone.View.extend({
            //#region ATTRIBUTES
            tagName: 'div',
            id: 'divFacturacionSubproductos',
            constAcciones: enums.AccionCamiones(),
            constTipoOperacion: enums.TipoOperacionCamiones(),
            constOrigen: enums.IdMaestroOrigen(),
            constColoresSemaforo: enums.ColoresSemaforo(),
            constClaseMaterialTM: enums.ClaseMaterialTM(),
            constEstadosFacturacion: enums.TipoEstadoFacturacion(),
            ds: null,
            grid: null,
            template: _.template(plantilla),
            //#endregion ATTRIBUTES

            initialize: async function () {
                var self = this;
                window.JSZip = JSZip;

                kendo.culture(localStorage.getItem("idiomaSeleccionado"));
                kendo.ui.progress($("#center-pane"), true);

                let splitter = $("#vertical").data("kendoSplitter");
                if (splitter) {
                    splitter.bind("resize", self.resizeGrid);
                }

                self.coloresSemaforo = await self.CargaColores();

                self.DataSource();

                self.render();
                self.$("[data-funcion]").checkSecurity();

                kendo.ui.progress($("#center-pane"), false);
            },
            CargaColores: async function () {
                const self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        url: "../api/general/coloresSemaforo",
                        dataType: "json",
                        cache: true,
                        success: function (response) {
                            resolve(response);
                        },
                        error: function (err) {
                            console.log("Error obteniendo los colores de semaforo");
                            console.log(err);
                            resolve([]);
                        }
                    })
                })
            },
            DataSource: function () {
                var self = this;
                
                self.ds = new kendo.data.DataSource({                    
                    transport: {
                        read: {
                            url: "../api/controlGestion/facturacionSubproductos",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            cache: false,
                            type: "GET",
                            data: function () {
                                return {
                                    fechaInicio: $("#dtpFechaDesde").getKendoDatePicker().value()?.toISOString(),
                                    fechaFin: $("#dtpFechaHasta").getKendoDatePicker().value()?.toISOString()
                                }
                            }
                        },
                    },
                    schema: {
                        parse: function (response) {

                            for (let r of response) {
                                const tr = r.Transporte;

                                r.IdTransporte = tr.IdTransporte;
                                r.FechaEntrada = tr.FechaEntrada;
                                r.FechaSalida = tr.FechaSalida;
                                r.NombreProducto = `${tr.NombreProducto}${(r.Producto.Codigo ? ' (' + r.Producto.Codigo + ')' : '')}`;
                                r.ProductoJDE = r.Producto.IdMaestroOrigen == self.constOrigen.JDE;
                                r.ProductoClase = r.Producto.IdClase;
                                r.NombreCliente = `${tr.NombreCliente}${(r.Cliente.Codigo ? ' (' + r.Cliente.Codigo + ')' : '')}`;
                                r.ClienteJDE = r.Cliente.IdMaestroOrigen == self.constOrigen.JDE;
                                r.MatriculaTractora = tr.MatriculaTractora;
                                r.CodigoAlbaran = tr.CodigoAlbaran;
                                r.Facturado = tr.Facturado;                                
                                // Fecha del último envío a facturación si existe
                                r.FechaEnvioFacturacion = r.HistoricoFacturacion
                                    .sort((a, b) => new Date(b.FechaEnvio) - new Date(a.FechaEnvio))[0]?.FechaEnvio

                                let tara = tr.IdTipoOperacion == self.constTipoOperacion.Carga ? tr.PesoEntrada : tr.PesoSalida;
                                let bruto = tr.IdTipoOperacion == self.constTipoOperacion.Carga ? tr.PesoSalida : tr.PesoEntrada;
                                let neto = bruto != undefined ? bruto - tara : undefined;
                                r.Tara = tara;
                                r.Bruto = bruto;
                                r.Neto = neto;

                                let fechaEntradaNoTime = new Date(r.FechaEntrada);
                                let fechaSalidaNoTime = new Date(r.FechaSalida);
                                r.FechaEntradaNoTime = new Date(
                                    fechaEntradaNoTime.getFullYear(),
                                    fechaEntradaNoTime.getMonth(),
                                    fechaEntradaNoTime.getDate());
                                r.FechaSalidaNoTime = new Date(
                                    fechaSalidaNoTime.getFullYear(),
                                    fechaSalidaNoTime.getMonth(),
                                    fechaSalidaNoTime.getDate());
                                if (r.FechaEnvioFacturacion) {
                                    r.FechaEnvioFacturacion = new Date(r.FechaEnvioFacturacion);
                                    let fechaEnvioFacturacionNoTime = new Date(r.FechaEnvioFacturacion);
                                    
                                    r.FechaEnvioFacturacionNoTime = new Date(
                                        fechaEnvioFacturacionNoTime.getFullYear(),
                                        fechaEnvioFacturacionNoTime.getMonth(),
                                        fechaEnvioFacturacionNoTime.getDate());
                                }
                                r.Estado = self.ComprobarValidos(r)?.estado || self.constEstadosFacturacion.NO_VALIDO;
                            }

                            return response;
                        },
                        model: {
                            id: "IdTransporte",
                            fields: {
                                'IdTransporte': { type: "number" },
                                'FechaEntrada': { type: "date" },
                                'FechaEntradaNoTime': { type: "date" },
                                'FechaSalida': { type: "date" },
                                'FechaSalidaNoTime': { type: "date" },
                                'FechaOrden': { type: "date" },
                                'FechaEnvio': { type: "date" },
                                'Neto': { type: "number" },
                                'FechaEnvioFacturacion': { type: "date" },
                                'FechaEnvioFacturacionNoTime': { type: "date" },
                                "Estado": { type: "number" }
                            }
                        }
                    },
                    requestStart: function (e) {
                        kendo.ui.progress($("#gridFacturacionSubproductos"), true);
                    },
                    requestEnd: function (e) {
                        kendo.ui.progress($("#gridFacturacionSubproductos"), false);
                    },
                    pageSize: 30,
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else if (e.xhr.status == '405') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FILTROS_OBLIGATORIOS'), 4000);
                        } else if (e.xhr.status == '406') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_FECHA_FIN_MENOR_INICIO'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_FACTURACION_SUBPRODUCTOS'), 2000);
                        }
                    }
                });
            },
            SeleccionarTodos: function (e) {
                const checked = $(e.target).is(":checked");
                $(".factura-cb:not(:disabled)").each(function (idx, elem) {
                    $(this).prop("checked", checked).trigger("change");
                });
            },
            render: function () {
                var self = this;

                DestruirKendoWidgets(self);

                $("#center-pane").prepend($(self.el));
                $(self.el).html(self.template());

                $("#dtpFechaDesde").kendoDatePicker({
                    value: new Date().addDays(-7),
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#dtpFechaHasta").kendoDatePicker({
                    value: new Date(),
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                self.grid = this.$("#gridFacturacionSubproductos").kendoGrid({
                    dataSource: self.ds,
                    excel: util.ui.default.gridExcelDate('FACTURACION_SUBPRODUCTOS'),
                    excelExport: async function (e) {
                       
                        ExcelGridExtra(e, util);

                    },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores2,
                    },
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    selectable: false,
                    sortable: true,
                    resizable: true,
                    scrollable: true,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [30, 100, 200, 'All'],
                        buttonCount: 2,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            headerTemplate: '<input class="checkbox cb-todos" id="btnSelTodos" name="btnSelTodos" type="checkbox" style="margin:auto;margin-bottom:2px;" onclick="javascript: window.app.vista.SeleccionarTodos(event)"/>',
                            template: (e) => {
                                const datosValido = self.ComprobarValidos(e);

                                return `<input class="checkbox factura-cb" type="checkbox" style="width: 14px;height: 14px;margin: auto;"
                                        ${(datosValido.valido ? '' : 'disabled')}/>`;
                            },
                            width: "30px"
                        },
                        {
                            field: "Estado",
                            title: " ",
                            _excelOptions: {
                                title: window.app.idioma.t("ESTADO"),
                                template: "#=window.app.idioma.t('ESTADO_FACTURACION_' + value.Estado)#",
                                width: "auto"
                            },
                            template: function (e) {
                                const datosValido = self.ComprobarValidos(e);

                                return `<div class='circle_cells' style='background-color:${datosValido.color};' title='${datosValido.msg}'/>`;
                            },
                            width: "48px",
                            attributes: { style: "text-align:center;" },
                            groupable: false,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#= Estado #' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t('ESTADO_FACTURACION_' + Estado) #</label></div>";
                                        //return "<div><label><input type='checkbox' value='#= Estado #' style='width: 14px;height:14px;margin-right:5px;'/>#= Estado #</label></div>";
                                    }
                                }
                            },
                            //toolbarColumnMenu: false
                        },
                        {
                            field: "NombreProducto",
                            title: window.app.idioma.t("MATERIAL"),
                            attributes: {
                                style: 'white-space: nowrap;#=window.app.vista.ComprobarValidos(data).productoValido ? "" : "background-color: \\#fa807282;"#',
                                //'white-space: nowrap;' + '#=(ProductoJDE ? "" : "background-color: lightsalmon;")#',
                                "class": 'addTooltip'
                            },
                            width: "250px",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#= NombreProducto #' style='width: 14px;height:14px;margin-right:5px;'/>#= NombreProducto #</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            field: "FechaEntradaNoTime",
                            title: window.app.idioma.t("FECHA_ENTRADA"),
                            template: '#= FechaEntrada != null ? kendo.toString(new Date(FechaEntrada), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            _excelOptions: {
                                width: 120,
                                format: "dd/mm/yy hh:mm:ss",
                                template: "#=GetDateForExcel(value.FechaEntrada)#"
                            },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupHeaderTemplate: (e) => {
                                return `${window.app.idioma.t("FECHA_ENTRADA")}: ${kendo.toString(e.value, "dd/MM/yyyy")}`
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },
                            width: "150px"
                        },
                        {
                            field: "FechaSalidaNoTime",
                            title: window.app.idioma.t("FECHA_SALIDA"),
                            template: '#= FechaSalida != null ? kendo.toString(new Date(FechaSalida), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            _excelOptions: {
                                width: 120,
                                format: "dd/mm/yy hh:mm:ss",
                                template: "#=GetDateForExcel(value.FechaSalida)#"
                            },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupHeaderTemplate: (e) => {
                                return `${window.app.idioma.t("FECHA_SALIDA")}: ${kendo.toString(e.value, "dd/MM/yyyy")}`
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },
                            width: "150px"
                        },
                        {
                            field: "NombreCliente",
                            title: window.app.idioma.t("CLIENTE"),
                            //template: "",
                            attributes: {
                                style: 'white-space: nowrap;#=window.app.vista.ComprobarValidos(data).clienteValido ? "" : "background-color: \\#fa807282;"#',
                                "class": 'addTooltip'
                            },
                            width: "250px",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#= NombreCliente #' style='width: 14px;height:14px;margin-right:5px;'/>#= NombreCliente #</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            field: "Neto",
                            title: window.app.idioma.t("NETO"),
                            template: "#= (Neto == undefined ? '' : kendo.format('{0:n2} kg', Neto))# ",
                            groupable: false,
                            aggregates: ["sum"],
                            attributes: {
                                style: '#=window.app.vista.ComprobarValidos(data).pesoNetoValido ? "" : "background-color: \\#fa807282;"#'
                            },
                            width: "100px",
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            field: "MatriculaTractora",
                            title: window.app.idioma.t("MATRICULA_TRACTORA"),
                            width: "160px"
                        },
                        {
                            field: "CodigoAlbaran",
                            title: window.app.idioma.t("CODIGO_ALBARAN"),
                            width: "140px",
                            groupable: false,
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                        },
                        {
                            field: "FechaEnvioFacturacionNoTime",
                            title: window.app.idioma.t("FECHA_ENVIO_FACTURACION"),
                            template: '#= FechaEnvioFacturacion != null ? kendo.toString(new Date(FechaEnvioFacturacion), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            _excelOptions: {
                                format: "dd/mm/yy hh:mm:ss",
                                template: "#= value.FechaEnvioFacturacion ? GetDateForExcel(value.FechaEnvioFacturacion) : ''#"
                            },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            groupHeaderTemplate: (e) => {
                                return `${window.app.idioma.t("FECHA_ENVIO_FACTURACION")}: ${e.value ? kendo.toString(e.value, "dd/MM/yyyy") : 'N/A'}`
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },
                            width: "190px"
                        },
                        {
                            title: window.app.idioma.t("OPERACIONES"),
                            attributes: { "align": "center" },
                            groupable: false,
                            filterable: false,
                            sortable: false,
                            template: `<div>
    <button id='btnVer_#=IdTransporte#' onclick='javascript: window.app.vista.VerTransporte("#=uid#")' class='k-button k-button-icontext' data-funcion='CDG_FAC_SUB_1_VisualizacionFacturacionSubproductos'
        style='min-width:initial;padding:6px;' title='${window.app.idioma.t("VER")} ${window.app.idioma.t("TRANSPORTE")}'>
        <span><img src='../../../Common/img/mostrar-propiedades.png' style='width: 25px; opacity: 0.7;' /></span>
    </button>` +
                                //<button id='btnHistoricoFacturacion_#=IdTransporte#' onclick='javascript: window.app.vista.HistoricoFacturacion("#=uid#")' class='k-button k-button-icontext'
                                //    data-funcion='CDG_FAC_SUB_1_VisualizacionFacturacionSubproductos' style='min-width:initial;padding:4px 4px;padding-top:0;'
                                //    title='${window.app.idioma.t("HISTORICO")} ${window.app.idioma.t("FACTURACION_SUBPRODUCTOS")}'>
                                //    <span><img src='../../../Common/img/historico.png' style='width: 25px; opacity: 0.7;' /></span>
                                //</button>
                                `<button id='btnEditar_#=IdTransporte#' onclick='javascript: window.app.vista.EditarTransporte("#=uid#")' class='k-button k-button-icontext'
        data-funcion='CDG_FAC_SUB_1_GestionFacturacionSubproductos' style='min-width:initial;height:40px;font-weight:bold;'>
        ${window.app.idioma.t("EDITAR")}
    </button>`+
                                //<button #=(IdTipoOperacion == window.app.vista.constTipoOperacion.Carga ? '' : 'disabled')# id='btnPrint_#=IdTransporte#' onclick='javascript: window.app.vista.ImprimirAlbaran(#=IdTransporte#)' class='k-button k-button-icontext' data-funcion='CDG_FAC_SUB_1_GestionFacturacionSubproductos' style = 'min-width:initial;' title = '${window.app.idioma.t("IMPRIMIR_ALBARAN")}' >
                                //    <span><img src='../../../Common/img/impresora.png' style='width: 16px; opacity: 0.7;' /></span>
                                //</button >
                                `<button id='btnEliminar_#=IdTransporte#' onclick='javascript: window.app.vista.EliminarTransporteDialog(#=Facturado#, #=IdTransporte#, "#=MatriculaTractora#")' 
        class='k-button k-button-icontext' data-funcion='CDG_FAC_SUB_1_GestionFacturacionSubproductos'
        style='min-width:initial; padding:6px;width:38px;height:40px;' title='${window.app.idioma.t("ELIMINAR")} ${window.app.idioma.t("TRANSPORTE")}'>
        <span class='k-icon k-delete' style='vertical-align: middle; margin: 0px; scale: 1.5'></span>
    </button>
    </div>`,
                            width: "170px"
                        },
                    ],
                    dataBinding: self.resizeGrid,
                    dataBound: function (e) {
                        self.$("[data-funcion]").checkSecurity();

                        self.ValidarCheck(e);
                    },
                    change: function () {
                    }
                }).data("kendoGrid");

                $("#gridFacturacionSubproductos").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");
            },

            //#region EVENTS
            events: {
                'click #btnFiltrar': "ActualizaGrid",
                'click #btnFacturar': "Facturar",
                'click #btnExportarExcel': "ExportarExcel",
            },
            //#endregion EVENTS

            //#region METODOS
            ComprobarValidos: function (item) {
                const self = this;

                // Los registros son validos si tienen Producto de origen JDE y clase SUB (20), Cliente origen JDE, Peso neto > 0, y PesoEntrada y PesoSalida no nulos
                let result = {
                    color: "transparent",
                    valido: true,
                    msg: "",
                    productoValido: true,
                    clienteValido: true,
                    pesoNetoValido: true,
                    pesoValido: true,
                    estado: self.constEstadosFacturacion.VALIDO
                }

                let errores = [];

                if (!item.ProductoJDE) {
                    result.valido = false;
                    result.estado = self.constEstadosFacturacion.NO_VALIDO;
                    result.productoValido = false;
                    errores.push(window.app.idioma.t("FACTURACION_ERROR_PRODUCTO_JDE"));
                }
                if (item.ProductoClase != self.constClaseMaterialTM.Subproducto.id) {
                    result.valido = false;
                    result.estado = self.constEstadosFacturacion.NO_VALIDO;
                    result.productoValido = false;
                    errores.push(window.app.idioma.t("FACTURACION_ERROR_PRODUCTO_CLASE_SUB"));
                }
                if (!item.ClienteJDE) {
                    result.valido = false;
                    result.estado = self.constEstadosFacturacion.NO_VALIDO;
                    result.clienteValido = false;
                    errores.push(window.app.idioma.t("FACTURACION_ERROR_CLIENTE_JDE"));
                }
                if (item.Neto <= 0) {
                    result.valido = false;
                    result.estado = self.constEstadosFacturacion.NO_VALIDO;
                    result.pesoNetoValido = false;
                    errores.push(window.app.idioma.t("FACTURACION_ERROR_PESO_NETO"));
                }
                if (item.Tara == null || item.Bruto == null) {
                    result.valido = false;
                    result.estado = self.constEstadosFacturacion.NO_VALIDO;
                    result.pesoValido = false;
                    errores.push(window.app.idioma.t("FACTURACION_ERROR_PESO_NULO"));
                }

                if (item.Facturado) {
                    // Si ya está facturado no dejamos volverlo a enviar
                    result.valido = false;
                    result.estado = self.constEstadosFacturacion.FACTURADO;
                    result.color = self.coloresSemaforo.find(f => f.Id == self.constColoresSemaforo.GRIS)?.Color;
                    result.msg = window.app.idioma.t('FACTURACION_ESTADO_GRIS');

                    //if (result.valido) {
                    //    result.color = self.coloresSemaforo.find(f => f.Id == self.constColoresSemaforo.GRIS)?.Color;
                    //    result.msg = window.app.idioma.t('FACTURACION_ESTADO_GRIS');
                    //}
                    //else {
                    //    result.color = self.coloresSemaforo.find(f => f.Id == self.constColoresSemaforo.AMARILLO)?.Color;
                    //    result.msg = window.app.idioma.t('FACTURACION_ESTADO_AMARILLO')
                    //        .replace("#ERRORS#", errores.join("&#013;"));
                    //}
                }
                else if (!result.valido) {
                    result.color = self.coloresSemaforo.find(f => f.Id == self.constColoresSemaforo.ROJO)?.Color;
                    result.msg = window.app.idioma.t('FACTURACION_ESTADO_ROJO')
                        .replace("#ERRORS#", errores.join("&#013;"));
                }
                else {
                    result.color = self.coloresSemaforo.find(f => f.Id == self.constColoresSemaforo.VERDE)?.Color;
                    result.msg = window.app.idioma.t('FACTURACION_ESTADO_VERDE');
                }

                return result;
            },
            ValidarCheck: function (e) {
                const self = this;

                e.sender.element.find(".checkbox:not(.cb-todos)").on("change", function (e) {
                    const row = $(e.target).closest("tr");
                    const checked = this.checked;

                    if (checked) {
                        row.addClass("k-state-selected");
                    }
                    else {
                        row.removeClass("k-state-selected");
                    }
                })
            },          
            HistoricoFacturacion: function (uid) {
                const self = this;
                const item = self.ds.getByUid(uid).Transporte;

                const maxHeight = window.innerHeight * 0.8;

                const ventanaHistorico = $("<div id='window-historico'/>").kendoWindow({
                    title: window.app.idioma.t("HISTORICO") + " " + window.app.idioma.t("FACTURACION_SUBPRODUCTOS"),
                    maxWidth: "60%",
                    maxHeight: maxHeight + "px",
                    close: function () {
                        ventanaHistorico.destroy();
                    },
                    resizable: false,
                    modal: true
                }).getKendoWindow();

                let template = kendo.template($("#gridHistoricoFacturacionWindow").html());
                ventanaHistorico
                    .content(template({}));

                $("#gridHistoricoFacturacion").kendoGrid({
                    dataSource: new kendo.data.DataSource({
                        transport: {
                            read: function (operation) {

                                $.ajax({
                                    url: "../api/controlGestion/facturacionSubproductosHistorico",
                                    data: { idTransporte: item.IdTransporte },
                                    dataType: "json",
                                    cache: false,
                                    success: function (response) {
                                        operation.success(response);
                                    },
                                    error: function (err) {
                                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_FACTURACION_SUBPRODUCTOS_HISTORICO'), 4000);
                                        operation.success([]);
                                    },
                                })
                            }
                        },
                        schema: {
                            model: {
                                id: "Id",
                                fields: {
                                    'Id': { type: "number" },
                                    'FechaEnvio': { type: "date" },
                                }
                            }
                        },
                        requestStart: function (e) {
                            kendo.ui.progress($("#gridFacturacionSubproductos"), true)
                        },
                        requestStart: function (e) {
                            kendo.ui.progress($("#gridFacturacionSubproductos"), false)
                        },
                        pageSize: 30,
                    }),
                    scrollable: true,
                    sortable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    selectable: false,
                    columns: [
                        {
                            field: "FechaEnvio",
                            title: window.app.idioma.t("FECHA_ENVIO_FACTURACION"),
                            template: '#= kendo.toString(new Date(FechaEnvio), kendo.culture().calendars.standard.patterns.MES_FechaHora)#',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },
                        },
                        {
                            field: "Usuario",
                            title: window.app.idioma.t('USUARIO')
                        }
                    ],
                    maxHeight: (maxHeight - 35) + "px",
                    dataBound: function (e) {
                        ventanaHistorico.center();
                    }
                });

                ventanaHistorico.center().open();
            },
            VerTransporte: function (uid) {
                let self = this;
                let item = self.ds.getByUid(uid).Transporte;

                self.windowES = new vistaEntradaSalida({
                    parent: self,
                    action: self.constAcciones.FacturacionVer,
                    item: item,
                    printCallback: function (id, tipoOp) {
                        self.ImprimirPDF(id, tipoOp);
                    },
                    callback: function () {
                    }
                });
            },
            EditarTransporte: function (uid) {
                let self = this;
                let item = self.ds.getByUid(uid).Transporte;

                self.windowES = new vistaEntradaSalida({
                    parent: self,
                    action: self.constAcciones.FacturacionEditar,
                    item: item,
                    printCallback: function (id, tipoOp) {
                        self.ImprimirPDF(id, tipoOp);
                    },
                    callback: function () {
                        self.ActualizaGrid(null, true);
                    }
                });
            },
            ImprimirPDF: function (id, tipoOp) {
                const self = this;

                if (tipoOp == self.constTipoOperacion.Carga) {
                    GenerarInforme(window.app.idioma.t("ALBARAN_SALIDA"),
                        `AlbaranSalidaCamiones.aspx?IdTransporte=${id}`,
                        { height: "90%", width: "90%" });
                } else {
                    GenerarInforme(window.app.idioma.t("JUSTIFICANTE_BASCULA"),
                        `JustificanteBasculaCamiones.aspx?IdTransporte=${id}`,
                        { height: "90%", width: "90%" });
                }
            },
            //ImprimirAlbaran: function (id) {
            //    let self = this;

            //    GenerarInforme(window.app.idioma.t("ALBARAN_SALIDA"),
            //        `AlbaranSalidaCamiones.aspx?IdTransporte=${id}`,
            //        { height: "90%", width: "90%" });
            //},
            EliminarTransporteDialog: function (facturado, id, matricula) {
                const self = this;

                // Si el transporte ya está facturado no se puede eliminar
                if (facturado) {
                    OpenWindow(window.app.idioma.t("AVISO"),
                        window.app.idioma.t("ERROR_BORRAR_TRANSPORTE_FACTURADO"));
                    return;
                }

                new vistaCamionesEliminar({
                    parent: self,
                    item: {
                        IdTransporte: id,
                        MatriculaTractora: matricula
                    },
                    callback: function () {
                        // En caso de que estemos borrando desde el formulario de Entrada/Salida lo cerramos tambien
                        if ($("#btnCamionesESCancelar").length) {
                            $("#btnCamionesESCancelar").click();
                        }
                        self.ActualizaGrid(null, true);
                    }
                });
            },
            Facturar: function () {
                const self = this;

                let selectedRows = $("tr.k-state-selected");

                if (selectedRows.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                var dataItems = [];
                for (const r of Array.from(selectedRows)) {
                    dataItems.push(self.grid.dataItem(r));
                }

                if (dataItems.some(s => s.Facturado)) {
                    // Se va a reenviar algún registro ya facturado, se pide confirmación

                    OpenWindow(window.app.idioma.t("AVISO"),
                        window.app.idioma.t("FACTURACION_AVISO_REENVIO"),
                        function () {
                            self.EnviarFacturacion(dataItems);
                        }
                    );
                }
                else {
                    self.EnviarFacturacion(dataItems);
                }
            },
            EnviarFacturacion: function (datos) {
                const self = this;

                kendo.ui.progress($("#center-pane"), true);

                const d = datos.map(m => ({
                    Transporte: m.Transporte,
                    Cliente: m.Cliente,
                    Producto: m.Producto
                }));

                $.ajax({
                    type: "POST",
                    url: "../api/controlGestion/EnviarFacturacionSubproductos",
                    //dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    cache: true,
                    data: JSON.stringify(d),
                    complete: function () {
                        kendo.ui.progress($("#center-pane"), false);
                    },
                    success: function (response) {
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('FACTURACION_ENVIADA'), 4000);
                        self.ActualizaGrid(null, true);
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), e.responseJSON.Message, 4000);
                        }
                    }
                })

            },
            ActualizaGrid: function (e, mantenerFiltros = false ) {
                let self = this;

                kendo.ui.progress($('#visualization'), true);

                const options = {
                    filter: mantenerFiltros ? self.ds.filter() : []
                }

                $("#btnSelTodos").prop("checked", false);
                RecargarGrid({ grid: self.grid, options: options });

                kendo.ui.progress($('#visualization'), false);
            },
            ExportarExcel: function () {
                let self = this;

                kendo.ui.progress($("#center-pane"), true);
                self.grid.saveAsExcel();
                kendo.ui.progress($("#center-pane"), false);
            },
            //#endregion METODOS
            resizeGrid: function () {

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosdivFiltrosHeader = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridFacturacionSubproductos"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosdivFiltrosHeader - 2);
            },
            eliminar: function () {
                this.remove();
            },
        });

        return vistaFacturacionSubproductos;
    });
