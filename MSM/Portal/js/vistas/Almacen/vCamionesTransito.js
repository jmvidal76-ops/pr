define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/CamionesTransito.html', 'compartido/notificaciones'
    , '../../../../Portal/js/constantes', 'vistas/Almacen/vCamionesEntradaSalida', 'vistas/Almacen/vCamionesEliminar'],
    function (_, Backbone, $, plantillaCamionesTransito, Not, enums, vistaEntradaSalida, vistaCamionesEliminar) {

        var vistaCamionesTransito = Backbone.View.extend({
            //#region ATTRIBUTES

            tagName: 'div',
            id: 'divCamionesTransito',
            constAcciones: enums.AccionCamiones(),
            constTipoOperacion: enums.TipoOperacionCamiones(),
            dsTransporte: null,
            gridTransportes: null,
            wnd: null,
            windowES: null,
            template: _.template(plantillaCamionesTransito),

            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;

                let splitter = $("#vertical").data("kendoSplitter");
                if (splitter) {
                    splitter.bind("resize", self.resizeGrid);
                }

                Backbone.on('actualizarCamionesTransito', (data) => {
                    self.ActualizaGridTransportes();

                    // Comprobamos que el transporte editado no se esté editando en esta ventana
                    /*setTimeout(() => {
                        var transporteEditado = $("#transporteEditado").html();
                        if (transporteEditado == data.idTransporte && self.windowES && $("#dlgModalCustom").length == 0) {
                            OpenWindow(window.app.idioma.t("ATENCION"), window.app.idioma.t("REGISTRO_HA_CAMBIADO"), () => { self.windowES.window.close(); }, { mandatoryAction: true });
                        }
                    }, 300);*/                 
                }, this);

                self.DataSourceTransporte();

                self.render();
                self.$("[data-funcion]").checkSecurity();
            },
            DataSourceTransporte: function () {
                var self = this;

                self.dsTransporte = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetTransports",
                            dataType: "json"
                        }
                    },
                    schema: {
                        parse: function (response) {

                            for (let r of response) {
                                var fechaEntradaNoTime = new Date(r.FechaEntrada);
                                r.FechaEntradaNoTime = new Date(
                                    fechaEntradaNoTime.getFullYear(),
                                    fechaEntradaNoTime.getMonth(),
                                    fechaEntradaNoTime.getDate())
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
                                'FechaOrden': { type: "date" },
                                'IdTipoOperacion': { type: "number"},
                                'PesoEntrada': { type: "number"},
                                'PesoSalida': { type: "number"},

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

                                //'ColorSemaforo': { type: "string" },
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
                });
            },
            render: function () {
                var self = this;

                DestruirKendoWidgets(self);

                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.gridTransportes = this.$("#gridTransportes").kendoGrid({
                    dataSource: self.dsTransporte,
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
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [30, 100, 200, 'All'],
                        buttonCount: 2,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        //{
                        //    field: "Estado",
                        //    title: window.app.idioma.t("ESTADO"),
                        //    attributes: { "align": "center" },
                        //    template: "<img id='imgEstado' src='img/KOP_#= ColorSemaforo #.png'></img>",
                        //    width: "7%"
                        //},
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
                            // width: "5%"
                        },
                        //{
                        //    field: "FechaDescarga",
                        //    title: window.app.idioma.t("DESCARGADO"),
                        //    attributes: { "align": "center" },
                        //    template: "#if(FechaDescarga != null){#<span class='k-icon k-update'></span>#}#",
                        //    // width: "5%"
                        //},
                        {
                            field: "MatriculaTractora",
                            title: window.app.idioma.t("MATRICULA_TRACTORA"),
                            width: "12%"
                        },
                        {
                            field: "NombreTransportista",
                            title: window.app.idioma.t("TRANSPORTISTA"),
                            width: "13%",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                        },
                        {
                            field: "FechaEntradaNoTime",
                            title: window.app.idioma.t("FECHA_ENTRADA"),
                            template: '#= FechaEntrada != null ? kendo.toString(new Date(FechaEntrada), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
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
                            width: "15%"
                        },
                        {
                            field: "PesoEntrada",
                            template: "#= (PesoEntrada == undefined ? '' : kendo.format('{0:n2} kg', PesoEntrada))# ",
                            title: window.app.idioma.t("PESO_ENTRADA"),                            
                        },
                        {
                            field: "DescripcionUbicacionInterna",
                            title: window.app.idioma.t("UBICACION_INTERNA"),
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            width: "22%"
                        },
                        {
                            field: window.app.idioma.t("OPERACIONES"),
                            attributes: { "align": "center" },
                            groupable: false,
                            filterable: false,
                            sortable: false,
                            template: `<div>
    <button id='btnSalida_#=IdTransporte#' onclick='javascript: window.app.vista.SalidaCamion("#=uid#")' class='k-button k-button-icontext' data-funcion='ALM_PROD_DAT_1_GestionCamionesTransito' style='background-color: darkorange;'>
        <span><img src='../../../Common/img/salir.png' style='width: 16px; opacity: 0.7; margin-right: 6px;'/></span>${window.app.idioma.t("SALIDA")}
    </button>
    <button id='btnEditar_#=IdTransporte#' onclick='javascript: window.app.vista.EditarTransporte("#=uid#")' class='k-button k-button-icontext' data-funcion='ALM_PROD_DAT_1_GestionCamionesTransito' style='min-width:initial;'>
        ${window.app.idioma.t("EDITAR")}
    </button>    
    <button id='btnEliminar_#=IdTransporte#' onclick='javascript: window.app.vista.EliminarTransporteDialog(#=IdTransporte#, "#=MatriculaTractora#")' class='k-button k-button-icontext' data-funcion='ALM_PROD_DAT_1_GestionCamionesTransito' style='min-width:initial;' title='${window.app.idioma.t("ELIMINAR")} ${window.app.idioma.t("TRANSPORTE")}'>
        <span class='k-icon k-delete' style='vertical-align: middle;margin:0px;'></span>
    </button>
    </div>`,
                            width: "220px"
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
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");
            },
            //#region EVENTS
            events: {
                'click #btnEntrada': "EntradaCamion",
            },
            //#endregion EVENTS

            //#region METODOS
            EntradaCamion: function () {
                let self = this;

                self.windowES = new vistaEntradaSalida({
                    parent: self,
                    action: self.constAcciones.Entrada,
                    item: null,
                    printCallback: null,
                    callback: function () {
                        self.ActualizaGridTransportes();
                    }
                });
            },
            SalidaCamion: function (uid) {
                let self = this;
                let item = self.dsTransporte.getByUid(uid);

                self.windowES = new vistaEntradaSalida({
                    parent: self,
                    action: self.constAcciones.Salida,
                    item: item,
                    printCallback: function (id, tipoOp) {
                        self.ImprimirPDF(id, tipoOp);
                    },
                    callback: function () {
                        self.ActualizaGridTransportes();
                    }
                });
            },
            EditarTransporte: function (uid) {
                let self = this;
                let item = self.dsTransporte.getByUid(uid);

                self.windowES = new vistaEntradaSalida({
                    parent: self,
                    action: self.constAcciones.Editar,
                    item: item,
                    printCallback: null,
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
            //        { height: "97%", width: "100%" });
            //},
            //ImprimirJustificante: function (id) {
            //    let self = this;

            //    GenerarInforme(window.app.idioma.t("JUSTIFICANTE_BASCULA"),
            //        `JustificanteBasculaCamiones.aspx?IdTransporte=${id}`,
            //        { height: "97%", width: "100%" });
            //},
            EliminarTransporteDialog: function (id, matricula) {
                let self = this;

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

                RecargarGrid({ grid: self.gridTransportes });

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
            //                                $("#btnCapturarSalida").data("kendoButton").enable(true);
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

            //#endregion METODOS            
            eliminar: function () {
                Backbone.off('actualizarCamionesTransito');

                this.remove();
            },
        });
        
        return vistaCamionesTransito;
    });


function crearTooltips(target, content) {
    if (target.data("kendoTooltip") !== undefined) {
        target.data("kendoTooltip").destroy();
    }
    target.kendoTooltip({
        position: "bottom",
        content: window.app.idioma.t(content)
    });
}
