define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/HistoricoCamiones.html', 'compartido/notificaciones'
    , '../../../../Portal/js/constantes', 'vistas/Almacen/vCamionesEntradaSalida', 'vistas/Almacen/vCamionesEliminar', 'jszip', 'compartido/util'],
    function (_, Backbone, $, plantillaCamionesHistorico, Not, enums, vistaEntradaSalida, vistaCamionesEliminar, JSZip, util) {
        var vistaCamionesHistorico = Backbone.View.extend({
            //#region ATTRIBUTES

            tagName: 'div',
            id: 'divCamionesHistorico',
            constAcciones: enums.AccionCamiones(),
            constTipoOperacion: enums.TipoOperacionCamiones(),
            dsTransporte: null,
            gridTransportes: null,
            wnd: null,
            windowES: null,
            template: _.template(plantillaCamionesHistorico),

            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                kendo.culture(localStorage.getItem("idiomaSeleccionado"));

                let splitter = $("#vertical").data("kendoSplitter");
                if (splitter) {
                    splitter.bind("resize", self.resizeGrid);
                }

                self.DataSourceTransporte();

                self.render();
                self.$("[data-funcion]").checkSecurity();
                //PESO DE TARA $("#txtMatriculaTractora").data("kendoComboBox").dataItem(0).PesoMaximo

            },
            DataSourceTransporte: function () {
                var self = this;

                self.dsTransporte = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetHistoricoTransportes",
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
                                let tara = r.IdTipoOperacion == self.constTipoOperacion.Carga ? r.PesoEntrada : r.PesoSalida;
                                let bruto = r.IdTipoOperacion == self.constTipoOperacion.Carga ? r.PesoSalida : r.PesoEntrada;
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
                                r.NombreClienteProveedor = r.NombreCliente || r.NombreProveedor;
                                r.NIFClienteProveedor = r.NIFCliente || r.NIFProveedor;
                            }

                            return response;
                        },
                        model: {
                            id: "IdTransporte",
                            fields: {
                                'IdTransporte': { type: "number" },
                                'FechaEntrada': { type: "date" },
                                'FechaEntradaNoTime': { type: "date" },
                                'FechaDescarga': { type: "date" },
                                'FechaSalida': { type: "date" },
                                'FechaSalidaNoTime': { type: "date" },
                                'FechaOrden': { type: "date" },
                                'IdTipoOperacion': { type: "number" },
                                'PesoEntrada': { type: "number" },
                                'PesoSalida': { type: "number" },
                                'Tara': { type: "number" },
                                'Bruto': { type: "number" },
                                'Neto': { type: "number" },

                                //'IdTransporte': { type: "number" },
                                //'PesoEntrada': { type: "number" },
                                //'PesoSalida': { type: "number" },
                                //'FechaEntrada': { type: "date" },
                                //'FechaDescarga': { type: "date" },
                                //'FechaSalida': { type: "date" },
                                //'Observaciones': { type: "string" },

                                //'IdProducto': { type: "number" },
                                //'NombreProducto': { type: "string" },
                                //'ObservacionesProducto': { type: "string" },

                                //'IdProveedor': { type: "number" },
                                //'NombreProveedor': { type: "string" },

                                //'IdMatriculaTractora': { type: "number" },
                                //'MatriculaTractora': { type: "string" },
                                //'IdMatriculaRemolque': { type: "number" },
                                //'MatriculaRemolque': { type: "string" },

                                //'IdTransportista': { type: "number" },
                                //'NIF': { type: "string" },
                                //'NombreTransportista': { type: "string" },

                                //'IdOperador': { type: "string" },
                                //'NombreOperador': { type: "string" },

                                //'IdOrigenMercancia': { type: "number" },
                                //'DescripcionOrigenMercancia': { type: "string" },

                                //'IdUbicacionInterna': { type: "number" },
                                //'DescripcionUbicacionInterna': { type: "string" },

                                //'IdDestinatario': { type: "number" },
                                //'DescripcionDestinatario': { type: "string" },
                                //'PoblacionDestinatario': { type: "string" },

                                //'IsGranel': { type: "boolean" },
                                //'ColorSemaforo': { type: "string" },
                                //'Material': { type: "string" },

                                //'IdAlbaran': { type: "number" },
                                //'IdTipoAlbaran': { type: "number" },

                            }
                        }
                    },
                    requestStart: function (e) {
                        kendo.ui.progress($("#gridTransportes"), true)
                    },
                    requestStart: function (e) {
                        kendo.ui.progress($("#gridTransportes"), false)
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
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_HISTORICO'), 2000);
                        }
                    }
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

                self.gridTransportes = this.$("#gridTransportes").kendoGrid({
                    dataSource: self.dsTransporte,
                    excel: util.ui.default.gridExcelDate('HISTORICO_CAMIONES_EXCEL'),
                    excelExport: async function (e) {
                        e.preventDefault();
                        let self = window.app.vista;

                        let sheets = [ExcelGridExtra(e, util)];

                        let workbook = new kendo.ooxml.Workbook({
                            sheets: sheets
                        });

                        kendo.saveAs({
                            dataURI: workbook.toDataURL(),
                            fileName: e.sender.options.excel.fileName
                        })
                    },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
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
                            field: "IdTipoOperacion",
                            title: window.app.idioma.t("TIPO"),
                            //attributes: { "align": "center" },
                            template: "#= window.app.idioma.t(TipoOperacion.toUpperCase()) #",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#= IdTipoOperacion #' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t(TipoOperacion.toUpperCase()) #</label></div>";
                                    }
                                }
                            },
                            groupHeaderTemplate: (e) => {
                                return `${window.app.idioma.t("TIPO")}: ${e.value == self.constTipoOperacion.Carga ? window.app.idioma.t("CARGA") : window.app.idioma.t("DESCARGA")}`
                            },
                            width: "100px"
                        },
                        {
                            field: "NombreProducto",
                            title: window.app.idioma.t("MATERIAL"),
                            width: "150px"
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
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
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
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
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
                            field: "NombreOperador",
                            title: window.app.idioma.t("OPERADOR"),
                            width: "180px",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                        },
                        {
                            field: "NIFOperador",
                            title: "NIF " + window.app.idioma.t("OPERADOR"),
                            width: "120px",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                        },
                        {
                            field: "NombreTransportista",
                            title: window.app.idioma.t("TRANSPORTISTA"),
                            width: "180px",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                        },
                        {
                            field: "NIF",
                            title: "NIF " + window.app.idioma.t("TRANSPORTISTA"),
                            width: "120px",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                        },
                        {
                            field: "MatriculaTractora",
                            title: window.app.idioma.t("MATRICULA_TRACTORA"),
                            width: "170px"
                        },
                        {
                            field: "MatriculaRemolque",
                            title: window.app.idioma.t("MATRICULA_REMOLQUE"),
                            width: "170px"
                        },
                        {
                            field: "NombreClienteProveedor",
                            title: window.app.idioma.t("CLIENTE_PROVEEDOR_MIN"),
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            width: "180px"
                        },
                        {
                            field: "NIFClienteProveedor",
                            title: "NIF " + window.app.idioma.t("CLIENTE_PROVEEDOR_MIN"),
                            width: "180px",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                        },
                        {
                            field: "AlbaranProveedor",
                            title: window.app.idioma.t("ALBARAN_PROVEEDOR"),
                            width: "180px"
                        },
                        {
                            field: "Tara",
                            title: window.app.idioma.t("TARA"),
                            template: "#= (Tara == undefined ? '' : kendo.format('{0:n2} kg', Tara))# ",
                            groupable: false,
                            width: "100px"                            
                        },{
                            field: "Bruto",
                            title: window.app.idioma.t("BRUTO"),
                            template: "#= (Bruto == undefined ? '' : kendo.format('{0:n2} kg', Bruto))# ",
                            groupable: false,
                            width: "100px"
                        },{
                            field: "Neto",
                            title: window.app.idioma.t("NETO"),
                            template: "#= (Neto == undefined ? '' : kendo.format('{0:n2} kg', Neto))# ",
                            groupable: false,
                            width: "100px"
                        },
                        {
                            field: "CodigoAlbaran",
                            title: window.app.idioma.t("CODIGO_ALBARAN"),
                            width: "140px",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                        },
                        {
                            field: "Observaciones",
                            title: window.app.idioma.t("OBSERVACIONES"),
                            template: "<div class='addTooltip truncated-text-cell'>#= Observaciones?.replace(/\\n/g, '<br>') || ''#</div>",
                            width: "140px",
                        },
                        {
                            title: window.app.idioma.t("OPERACIONES"),
                            attributes: { "align": "center" },
                            groupable: false,
                            filterable: false,
                            sortable: false,
                            template: `<div>
    <button id='btnVer_#=IdTransporte#' onclick='javascript: window.app.vista.VerTransporte("#=uid#")' class='k-button k-button-icontext' data-funcion='ALM_PROD_DAT_4_HistoricoCamiones'
        style='min-width:initial; padding:6px;' title='${window.app.idioma.t("VER")} ${window.app.idioma.t("TRANSPORTE")}'>
        <span><img src='../../../Common/img/mostrar-propiedades.png' style='width: 25px; opacity: 0.7;' /></span>
    </button>
    <button id='btnEditar_#=IdTransporte#' onclick='javascript: window.app.vista.EditarTransporte("#=uid#")' class='k-button k-button-icontext'
        data-funcion='ALM_PROD_DAT_4_GestionHistoricoCamiones' style='min-width:initial;height:40px;font-weight:bold;'>
        ${window.app.idioma.t("EDITAR")}
    </button>
    <button id='btnPrint_#=IdTransporte#' onclick='javascript: window.app.vista.ImprimirPDF(#:IdTransporte#, #:IdTipoOperacion#)' class='k-button k-button-icontext'
        data-funcion='ALM_PROD_DAT_4_GestionHistoricoCamiones ALM_PROD_DAT_4_HistoricoCamiones' style = 'min-width:initial; padding:6px;' title = '#=(IdTipoOperacion == window.app.vista.constTipoOperacion.Carga ? window.app.idioma.t("IMPRIMIR_ALBARAN") : window.app.idioma.t("IMPRIMIR_JUSTIFICANTE_BASCULA"))#' >
        <span><img src='../../../Common/img/impresora.png' style='width: 25px; opacity: 0.7;' /></span>
    </button >
    <button id='btnEliminar_#=IdTransporte#' onclick='javascript: window.app.vista.EliminarTransporteDialog(#=Facturado#, #=IdTransporte#, "#=MatriculaTractora#")'
    class='k-button k-button-icontext' data-funcion='ALM_PROD_DAT_4_GestionHistoricoCamiones' style='min-width:initial; padding:6px;width:38px;height:40px;' title='${window.app.idioma.t("ELIMINAR")} ${window.app.idioma.t("TRANSPORTE")}'>
        <span class='k-icon k-delete' style='vertical-align: middle;margin: 0px; scale: 1.5'></span>
    </button>
    </div>`,
                            width: "230px"
                        },
                    ],
                    dataBinding: self.resizeGrid,
                    dataBound: function () {
                        self.$("[data-funcion]").checkSecurity();
                    },
                    change: function () {
                    }
                }).data("kendoGrid");

                $("#gridTransportes").kendoTooltip({
                    filter: ".addTooltip",
                    show: function (e) {
                        e.sender.popup.element.addClass('multiline-tooltip');
                    },
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");
                self.resizeGrid();
            },

            //#region EVENTS
            events: {
                'click #btnFiltrar': "FiltrarGrid",
                'click #btnExportarExcel': "ExportarExcel",

            },
            //#endregion EVENTS

            //#region METODOS

            FiltrarGrid: function () {
                let self = this;

                RecargarGrid({ grid: self.gridTransportes });

            },
            VerTransporte: function (uid) {
                let self = this;
                let item = self.dsTransporte.getByUid(uid);

                self.windowES = new vistaEntradaSalida({
                    parent: self,
                    action: self.constAcciones.Ver,
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
                let item = self.dsTransporte.getByUid(uid);

                self.windowES = new vistaEntradaSalida({
                    parent: self,
                    action: self.constAcciones.Historico,
                    item: item,
                    printCallback: function (id, tipoOp) {
                        self.ImprimirPDF(id, tipoOp);
                    },
                    callback: function () {
                        self.ActualizaGridTransportes();
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
                        self.ActualizaGridTransportes();
                    }
                });
            },
            ActualizaGridTransportes: function () {
                let self = this;

                self.dsTransporte.filter({});
                self.gridTransportes.setDataSource(self.dsTransporte);
                self.dsTransporte.read();
            },
            ExportarExcel: function () {
                let self = this;

                kendo.ui.progress($("#center-pane"), true);
                self.gridTransportes.saveAsExcel();
                kendo.ui.progress($("#center-pane"), false);
            },

            //CaptureWeight: function (id, _self, isManual) {
            //    var self = this;
            //    //VERIFICAR EL PESO SEGUN LA TARA
            //    var permiso = false;
            //    for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
            //        if (window.app.sesion.attributes.funciones[i].id === 134 || window.app.sesion.attributes.funciones[i].id === 135)
            //            permiso = true;
            //    }

            //    if (!permiso) {
            //        Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
            //    } {
            //        var _itemGridTransporte = $("#gridTransportes").data("kendoGrid").dataItem($("#gridTransportes").data("kendoGrid").select());
            //        if (_itemGridTransporte) {
            //            if (!isManual) {
            //                $.ajax({
            //                    type: "GET",
            //                    async: true,
            //                    url: "../api/CaptureWeight",
            //                    contentType: "application/json; charset=utf-8",
            //                    dataType: "json",
            //                    success: function (res) {
            //                        if (res.length > 0) {
            //                            $("#" + id).data("kendoNumericTextBox").value(res[0].value);

            //                            if (id == "numericTxtPesoSalida" && _itemGridTransporte != null) {
            //                                _itemGridTransporte.PesoEntrada = $("#numericTxtPesoEntrada").data("kendoNumericTextBox").value();
            //                                _itemGridTransporte.PesoSalida = res[0].value;
            //                                //_itemGridTransporte.FechaDescarga = 
            //                                if (_itemGridTransporte.FechaDescarga == null && _itemGridTransporte.IdTipoAlbaran == 1) {
            //                                    this.confirmacion = new VistaDlgConfirm({
            //                                        titulo: window.app.idioma.t('FINALIZAR_DESCARGA'), msg: window.app.idioma.t('CONFIRMACION_FINALIZAR_DESCARGA_LOTE'),
            //                                        funcion: function () {
            //                                            _self.FinalizarDescarga(_itemGridTransporte);
            //                                            this.confirmacion = null;
            //                                        }, contexto: this
            //                                    });
            //                                }

            //                            } else if (id == "numericTxtPesoEntrada" && _itemGridTransporte != null) {
            //                                //$("#btnCapturarSalida").data("kendoButton").enable(true);
            //                                $("#numericTxtPesoSalida").data("kendoNumericTextBox").enable(true);
            //                            } else if (_itemGridTransporte == null) {
            //                                Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('MENSAJE_PESO_SALIDA'), 2000);
            //                            }
            //                        }

            //                    },
            //                    error: function (err) {

            //                    }
            //                });
            //            } else {
            //                _itemGridTransporte.PesoSalida = $("#numericTxtPesoSalida").data("kendoNumericTextBox").value();
            //                _self.FinalizarDescarga(_itemGridTransporte);
            //            }
            //        }
            //    }
            //},

            //#endregion METODOS
            resizeGrid: function () {

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosdivFiltrosHeader = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridTransportes"),
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

        return vistaCamionesHistorico;
    });
