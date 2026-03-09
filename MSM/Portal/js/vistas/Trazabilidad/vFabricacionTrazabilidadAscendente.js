define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/FabricacionTrazabilidadAscendente.html', 'compartido/notificaciones',
    'vistas/vDialogoConfirm', 'definiciones', "jszip", 'vistas/Fabricacion/vVerDetallesOrden_LIMS'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, definiciones, JSZip, vistaLIMS) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            inicio: new Date((new Date()).getTime() - (15 * 24 * 3600 * 1000)),
            fin: new Date(),
            dsLotes: null,
            dsCoccion: null,
            dsFermentacion: null,
            dsFiltracion: null,
            dsTCP: null,
            dsGuarda: null,
            dsEnvasado: null,
            procesosLote: definiciones.ProcesoLote(),
            dataTrazaAsc: [],
            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;
                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                window.JSZip = JSZip;

                $("#dtpFechaInicio").kendoDatePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: self.inicio,
                    change: function () {
                        self.inicio = this.value();
                    }
                });

                $("#dtpFechaFin").kendoDatePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: self.fin,
                    change: function () {
                        self.fin = this.value();
                    }
                });

                this.$("#divPestanias").kendoTabStrip({
                    scrollable: true,
                    animation: {
                        open: {
                            effects: "fadeIn"
                        }
                    }
                });



                const popover = $('[data-toggle="popover"]');
                popover.popover();
                popover.click(function (e) {
                    e.stopPropagation();
                });
                $(document).click(function (e) {
                    if (($('.popover').has(e.target).length == 0) || $(e.target).is('.close')) {
                        popover.popover('hide');
                    }
                });

                var ExtGrid = window.app.cfgKendo.extGridToolbarColumnMenu;
                kendo.ui.plugin(ExtGrid);

                let _schemaGrids = {
                    model: {
                        id: "IdLote",
                        fields: {
                            'IdLote': { type: "number" },
                            'TipoMaterial': { type: "string" },
                            'ClaseMaterial': { type: "string" },
                            'IdMaterial': { type: "string" },
                            'NombreMaterial': { type: "string" },
                            'IdLoteMES': { type: "string" },
                            'IdProceso': { type: "number" },
                            'Proceso': { type: "string" },
                            'CantidadInicial': { type: "number" },
                            'CantidadActual': { type: "number" },
                            'Unidad': { type: "string", },
                            'FechaConsumo': { type: "date" },
                            'FechaCreacion': { type: "date" },
                            'Almacen': { type: "string" },
                            'Zona': { type: "string" },
                            'Ubicacion': { type: "string" },
                            'IdUbicacionOrigen': { type: "number" },
                            'UbicacionMES': { type: "string" },
                            'EstadoUbicacion': { type: "string" },
                            'TipoUbicacion': { type: "string" },
                            'PoliticaVaciado': { type: "string" },
                            'LoteProveedor': { type: "string" },
                            'NombreProveedor': { type: "string" }
                        }
                    }
                };


                self.dsCoccion = new kendo.data.DataSource({
                    schema: _schemaGrids,
                    pageSize: 50,
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_LOTE_SEMIELABORADO'), 5000);

                    }
                });
                self.dsFermentacion = new kendo.data.DataSource({
                    schema: _schemaGrids,
                    pageSize: 50,
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_LOTE_SEMIELABORADO'), 5000);

                    }
                });
                self.dsFiltracion = new kendo.data.DataSource({
                    schema: _schemaGrids,
                    pageSize: 50,
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_LOTE_SEMIELABORADO'), 5000);

                    }
                });
                self.dsTCP = new kendo.data.DataSource({
                    schema: _schemaGrids,
                    pageSize: 50,
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_LOTE_SEMIELABORADO'), 5000);

                    }
                });
                self.dsEnvasado = new kendo.data.DataSource({
                    schema: _schemaGrids,
                    pageSize: 50,
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_LOTE_SEMIELABORADO'), 5000);

                    }
                });
                self.dsGuarda = new kendo.data.DataSource({
                    schema: _schemaGrids,
                    pageSize: 50,
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_LOTE_SEMIELABORADO'), 5000);

                    }
                });

                self.dsLotes = new kendo.data.DataSource({
                    async: true,
                    transport: {
                        read: {
                            url: "../api/trazabilidadAscendente",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "PUT"
                        },
                        parameterMap: function (options, type) {
                            if (type == "read") {
                                var _loteMES = $("#cmbLoteMes").val();
                                var _cmbDesde = $("#dtpFechaInicio").val() != "" ? kendo.parseDate($("#dtpFechaInicio").data('kendoDatePicker').value(), "yyyy-mm-dd") : null;
                                var _cmbHasta = $("#dtpFechaFin").val() != "" ? kendo.parseDate($("#dtpFechaFin").data('kendoDatePicker').value(), "yyyy-mm-dd") : null;
                                if (_loteMES != "") {
                                    return JSON.stringify({
                                        IdLoteMES: _loteMES ? _loteMES : null,
                                        FechaInicio: _cmbDesde.toISOString().split('T')[0],
                                        FechaFin: _cmbHasta.toISOString().split('T')[0]
                                    });
                                }

                                return JSON.stringify({
                                    IdLoteMES: _loteMES ? _loteMES : null,
                                    FechaInicio: _cmbDesde.toISOString().split('T')[0],
                                    FechaFin: _cmbHasta.toISOString().split('T')[0]
                                });
                            }
                        }
                    },
                    requestStart: function (e) {
                        if (self.validarDatosFiltros(self)) {
                            self.tabsLoading("gridCoccion", true);
                            self.tabsLoading("gridFermentacion", true);
                            self.tabsLoading("gridGuarda", true);
                            self.tabsLoading("gridFiltracion", true);
                            self.tabsLoading("gridTCP", true);
                            self.tabsLoading("gridEnvasado", true);
                            self.tabsLoading("gridMMPP", true);
                            self.tabsLoading("gridMovimientos", true);
                        } else {
                            e.preventDefault();
                        }
                    },
                    requestEnd: function (e) {
                        var response = e.response;
                        if (response) {
                            self.tabsLoading("gridCoccion", false);
                            self.tabsLoading("gridFermentacion", false);
                            self.tabsLoading("gridFiltracion", false);
                            self.tabsLoading("gridTCP", false);
                            self.tabsLoading("gridEnvasado", false);
                            self.tabsLoading("gridGuarda", false);

                            // Crear un objeto para agrupar los datos por IdProceso en una sola iteración
                            let dataAgrupada = {
                                [self.procesosLote.COC]: [],
                                [self.procesosLote.FER]: [],
                                [self.procesosLote.FIL]: [],
                                [self.procesosLote.TCP]: [],
                                [self.procesosLote.ENV]: [],
                                [self.procesosLote.GUA]: []
                            };

                            // Agrupar los datos en una sola pasada
                            response.forEach(item => {
                                if (dataAgrupada[item.IdProceso]) {
                                    dataAgrupada[item.IdProceso].push(item);
                                }
                            });

                            if (dataAgrupada[self.procesosLote.COC].length > 0) {
                                self.dsCoccion.data(dataAgrupada[self.procesosLote.COC]);
                            }
                            if (dataAgrupada[self.procesosLote.FER].length > 0) {
                                self.dsFermentacion.data(dataAgrupada[self.procesosLote.FER]);
                            }
                            if (dataAgrupada[self.procesosLote.FIL].length > 0) {
                                self.dsFiltracion.data(dataAgrupada[self.procesosLote.FIL]);
                            }
                            if (dataAgrupada[self.procesosLote.TCP].length > 0) {
                                self.dsTCP.data(dataAgrupada[self.procesosLote.TCP]);
                            }
                            if (dataAgrupada[self.procesosLote.ENV].length > 0) {
                                self.dsEnvasado.data(dataAgrupada[self.procesosLote.ENV]);
                            }
                            if (dataAgrupada[self.procesosLote.GUA].length > 0) {
                                self.dsGuarda.data(dataAgrupada[self.procesosLote.GUA]);
                            }

                            // Finalmente, asignamos toda la data agrupada a self.dataTrazaAsc
                            self.dataTrazaAsc = Object.values(dataAgrupada).flat();
                            self.tabsDisabled(self, false);
                            self.dsLotesMMPP.read();
                            self.dsMovimientos.read();
                        }

                    },
                    schema: {
                        model: {
                            id: "IdLote",
                            fields: {
                                'IdLote': { type: "number" },
                                'TipoMaterial': { type: "string" },
                                'ClaseMaterial': { type: "string" },
                                'IdMaterial': { type: "string" },
                                'NombreMaterial': { type: "string" },
                                'IdLoteMES': { type: "string" },
                                'IdProceso': { type: "number" },
                                'Proceso': { type: "string" },
                                'CantidadInicial': { type: "number" },
                                'CantidadActual': { type: "number" },
                                'Unidad': { type: "string", },
                                'FechaConsumo': { type: "date" },
                                'FechaCreacion': { type: "date" },
                                'Almacen': { type: "string" },
                                'Zona': { type: "string" },
                                'Ubicacion': { type: "string" },
                                'IdUbicacionOrigen': { type: "number" },
                                'UbicacionMES': { type: "string" },
                                'EstadoUbicacion': { type: "string" },
                                'TipoUbicacion': { type: "string" },
                                'PoliticaVaciado': { type: "string" },
                                'LoteProveedor': { type: "string" },
                                'NombreProveedor': { type: "string" }
                            }
                        }
                    },
                    pageSize: 50,
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_LOTE_SEMIELABORADO'), 5000);

                    }

                });

                self.dsLotesMMPP = new kendo.data.DataSource({
                    async: true,
                    transport: {
                        read: {
                            url: "../api/movimientosHaciaLotesTotales",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "PUT"
                        },
                        parameterMap: function (options, type) {
                            if (type == "read") {
                                if (self.dataTrazaAsc)
                                    return JSON.stringify(self.dataTrazaAsc.map(t => t.IdLote));
                            }
                        }
                    },
                    requestEnd: function () {
                        self.tabsLoading("gridMMPP", false);
                    },
                    schema: {
                        model: {
                            id: "IdMovimiento",
                            fields: {
                                'IdMovimiento': { type: "number" },
                                'LoteOrigen': { type: "string" },
                                'LoteDestino': { type: "string" },
                                'Cantidad': { type: "number" },
                                'LoteSAI': { type: "string" },
                                'UbicacionOrigen': { type: "string" },
                                'UbicacionDestino': { type: "string" },
                                'IdMaterialOrigen': { type: "string" },
                                'IdMaterialDestino': { type: "string" }
                            }
                        }
                    },
                    pageSize: 50,
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_LOTE_SEMIELABORADO'), 5000);

                    }

                });

                self.dsMovimientos = new kendo.data.DataSource({
                    async: true,
                    transport: {
                        read: {
                            url: "../api/movimientosHaciaLotes",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "PUT"
                        },
                        parameterMap: function (options, type) {
                            if (type == "read") {
                                if (self.dataTrazaAsc)
                                    return JSON.stringify(self.dataTrazaAsc.map(t => t.IdLote));
                            }
                        }
                    },
                    requestEnd: function () {
                        self.tabsLoading("gridMovimientos", false);
                    },
                    schema: {
                        model: {
                            id: "IdMovimiento",
                            fields: {
                                'IdMovimiento': { type: "number" },
                                'LoteOrigen': { type: "string" },
                                'LoteDestino': { type: "string" },
                                'Cantidad': { type: "number" },
                                'LoteSAI': { type: "string" },
                                'UbicacionOrigen': { type: "string" },
                                'UbicacionDestino': { type: "string" },
                                'IdMaterialOrigen': { type: "string" },
                                'IdMaterialDestino': { type: "string" }
                            }
                        }
                    },
                    pageSize: 50,
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_LOTE_SEMIELABORADO'), 5000);

                    }

                });


                self.renderGrid(self, "gridCoccion", "TRAZA_COCCION", self.dsCoccion);
                self.renderGrid(self, "gridFermentacion", "TRAZA_FERMENTACION", self.dsFermentacion);
                self.renderGrid(self, "gridGuarda", "TRAZA_GUARDA", self.dsGuarda);
                self.renderGrid(self, "gridFiltracion", "TRAZA_FILTRACION", self.dsFiltracion);
                self.renderGrid(self, "gridTCP", "TRAZA_TCP", self.dsTCP);
                self.renderGrid(self, "gridEnvasado", "TRAZA_ENVASADO", self.dsEnvasado);
                self.renderGridMMPP(self);
                self.renderGridMovimientos(self);

                self.resizeTab();
                self.resizeGrid("gridCoccion");
                self.resizeGrid("gridFermentacion");
                self.resizeGrid("gridGuarda");
                self.resizeGrid("gridFiltracion");
                self.resizeGrid("gridTCP");
                self.resizeGrid("gridEnvasado");
                self.resizeGrid("gridMMPP");
                self.resizeGrid("gridMovimientos");
            },

            //#region EVENTOS
            events: {
                'click #btnFiltrar': function () { this.consultar(this) },
                'click #btnExportarExcel': function () { this.ExportarExcelCompleto(this) },
                'click #btnMostrarLIMS': function (e) { this.MostrarLIMS(e, this); },
                'click #btnVerInforme': function () { this.verInformePDF() },
            },

            consultar: function (self) {
                self.comprobarLoteMES(function (loteMES) {
                    if (loteMES != "") {
                        self.tabsDisabled(self, true);
                        self.dsLotes.read();
                    }
                });
            },

            validarDatosFiltros: function (self) {
                var _loteMES = $("#cmbLoteMes").val();
                var _cmbDesde = $("#dtpFechaInicio").val() != "" ? kendo.parseDate($("#dtpFechaInicio").data('kendoDatePicker').value(), "yyyy-mm-dd") : null;
                var _cmbHasta = $("#dtpFechaFin").val() != "" ? kendo.parseDate($("#dtpFechaFin").data('kendoDatePicker').value(), "yyyy-mm-dd") : null;

                if (_loteMES == "") {
                    Not.crearNotificacion('Info', window.app.idioma.t('INFO'), window.app.idioma.t('SELECCIONAR_LOTEMES'), 5000);
                    return false;
                }
                else if ((!_cmbDesde || !_cmbHasta) && _loteMES != "") {
                    Not.crearNotificacion('Info', window.app.idioma.t('INFO'), window.app.idioma.t('SELECCIONAR_FECHAS_LOTEPROVEEDOR'), 5000);
                    return false;
                }

                return true;
            },
            verInformePDF: function () {
                var self = this;

                self.comprobarLoteMES(function (loteMES) {
                    //Llamamos a GenerarInforme de Utils
                    if (loteMES != "") {
                        GenerarInforme(window.app.idioma.t("INFORME_TRAZABILIDAD_ASCENDENTE"), `InformeTrazabilidadAscendente.aspx?paramLoteMESEnvasado=${loteMES}`, 
                            { height: "90%", width: "90%" });
                    }
                });
            },
            comprobarLoteMES: function (callback) { 
                let loteMES = $("#cmbLoteMes").val();

                if (loteMES == "") {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_INTRODUCIR_UN') + ": " + window.app.idioma.t('LOTE_MES'), 4000);
                    callback(""); 
                    return; 
                }

                $.ajax({
                    type: "GET",
                    url: `../api/ObtenerLotePorLoteMES`, 
                    contentType: "application/json; charset=utf-8",
                    data: { loteMES: loteMES },
                    success: function (data) {
                        if (data.length > 0) {
                            callback(loteMES); 
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LOTEMES_NO_ENCUENTRA'), 5000);
                            callback(""); 
                        }
                    },
                    error: function (err) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'api/ObtenerLotePorLoteMES', 5000);
                        callback(""); 
                    }
                });
            },

            renderGrid: function (self, idGrid, nombreExcel, ds) {

                $("#" + idGrid).kendoExtGrid({
                    dataSource: ds,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    sortable: true,
                    toolbarColumnMenu: true,
                    scrollable: true,
                    autoBind: false,
                    selectable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 500, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    noRecords: {
                        template: window.app.idioma.t("SIN_RESULTADOS")
                    },
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    toolbar: [
                        {
                            name: "excel", text: window.app.idioma.t("EXPORTAR_EXCEL")
                        },
                    ],
                    excel: {
                        fileName: window.app.idioma.t(nombreExcel) + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    columns: [
                        {
                            template: function (e) {
                                return "<div class='circle_cells' style='background-color:" + e.ColorEstadoLIMs + ";'/>"
                            },
                            width: 50,
                            title: window.app.idioma.t("LIMS"),
                            attributes: { style: "text-align:center;" },
                            groupable: false,
                            filterable: false,
                            //toolbarColumnMenu: false
                        },
                        {
                            title: window.app.idioma.t("LOTE_MES"),
                            field: 'IdLoteMES',
                            width: 350,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            hidden: true,
                            title: window.app.idioma.t("TIPO_MATERIAL"),
                            field: 'TipoMaterialOrigen',
                            width: 200,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=TipoMaterialOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoMaterialOrigen#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            title: window.app.idioma.t("CLASE_MATERIAL"),
                            field: 'ClaseMaterial',
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=ClaseMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#= ClaseMaterial#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            attributes: {
                                style: 'white-space: nowrap ',
                            },
                            title: window.app.idioma.t("CODIGO_JDE"),
                            field: 'IdMaterial',
                            template: '<span class="addTooltip">#=IdMaterial#</span>',
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#= IdMaterial#</label></div>";
                                    }
                                }
                            },


                        },
                        {
                            attributes: {
                                style: 'white-space: nowrap ',
                            },
                            title: window.app.idioma.t("PROCESO"),
                            field: 'Proceso',
                            template: '<span class="addTooltip">#=Proceso#</span>',
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Proceso#' style='width: 14px;height:14px;margin-right:5px;'/>#= Proceso#</label></div>";
                                    }
                                }
                            },


                        },
                        {
                            title: window.app.idioma.t("DESCRIPCION"),
                            field: 'NombreMaterial',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            width: 250,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=NombreMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#= NombreMaterial#</label></div>";
                                    }
                                }
                            },
                        },

                        {
                            attributes: {
                                style: 'white-space: nowrap ',
                            },
                            title: window.app.idioma.t("LOTE_PROVEEDOR"),
                            hidden: true,
                            field: 'LoteProveedor',
                            template: '<span class="addTooltip">#= LoteProveedor != null ? LoteProveedor : "" #</span>',
                            width: 350,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=LoteProveedor#' style='width: 14px;height:14px;margin-right:5px;'/>#= LoteProveedor#</label></div>";
                                    }
                                }
                            },


                        },
                        {
                            attributes: {
                                style: 'white-space: nowrap ',
                            },
                            title: window.app.idioma.t("PROVEEDOR"),
                            hidden: true,
                            field: 'Proveedor',
                            template: '<span class="addTooltip">#= NombreProveedor != null ? NombreProveedor : "" #</span>',
                            width: 350,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=NombreProveedor#' style='width: 14px;height:14px;margin-right:5px;'/>#= NombreProveedor#</label></div>";
                                    }
                                }
                            },


                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_INICIAL"),
                            field: 'CantidadInicial',
                            width: 150,
                            attributes: {
                                style: 'white-space: nowrap '
                            },
                            template: '<span class="addTooltip">#= kendo.format("{0:n2}",CantidadInicial)#</span>',
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },

                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_ACTUAL"),
                            field: 'CantidadActual',
                            width: 150,
                            template: '<span class="addTooltip">#= kendo.format("{0:n2}",CantidadActual)#</span>',
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",

                        },
                        {
                            title: window.app.idioma.t("UNIDAD_MEDIDA"),
                            field: 'Unidad',
                            width: 100,
                            template: '<span class="addTooltip">#=Unidad#</span>',
                            editor: function (e, options) { return self.UoMDropdDownEditor(e, options) },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Unidad#' style='width: 14px;height:14px;margin-right:5px;'/>#= Unidad#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("FECHA_CREACION"),
                            field: 'FechaCreacion',
                            width: 200,
                            editor: function (e, options) { return self.FechaDropDownEditor(e, options) },
                            template: '<span class="addTooltip">#= FechaCreacion != null ? kendo.toString(new Date(FechaCreacion), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #</span>',
                            filterable: {
                                extra: true,
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
                            hidden: true,
                            field: 'Almacen',
                            title: window.app.idioma.t("ALMACEN"),
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Almacen#' style='width: 14px;height:14px;margin-right:5px;'/>#= Almacen#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },

                        },
                        {
                            title: window.app.idioma.t("ZONA"),
                            field: 'Zona',
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Zona#' style='width: 14px;height:14px;margin-right:5px;'/>#= Zona#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("UBICACION"),
                            field: 'Ubicacion',
                            width: 150,
                            template: '<span class="addTooltip">#=Ubicacion#</span>',
                            editor: function (e, options) { return self.UbicacionDropDownEditor(e, options) },
                            filterable: true,
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },
                        {
                            hidden: true,
                            title: window.app.idioma.t("TIPO_UBICACION"),
                            field: 'TipoUbicacion',
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=TipoUbicacion#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoUbicacion#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            hidden: true,
                            title: window.app.idioma.t("POLITICA_VACIADO"),
                            field: 'PoliticaVaciado',
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=PoliticaVaciado#' style='width: 14px;height:14px;margin-right:5px;'/>#= PoliticaVaciado#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },

                        {
                            hidden: true,
                            title: window.app.idioma.t("ESTADO_UBICACION"),
                            field: 'EstadoUbicacion',
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=EstadoUbicacion#' style='width: 14px;height:14px;margin-right:5px;'/>#= EstadoUbicacion#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        }


                    ],
                    dataBound: function (e) {
                        e.preventDefault();

                        self.tabsLoading(idGrid, false);
                        self.tabsDisabled(self, false);
                    }
                });



            },
            tabsDisabled: function (self, enableAll) {
                var tabStrip = $("#divPestanias").data("kendoTabStrip");

                tabStrip.enable(tabStrip.tabGroup.children().eq(0), self.dataTrazaAsc?.find(t => t.IdProceso == self.procesosLote.COC) || enableAll ? true : false);
                tabStrip.enable(tabStrip.tabGroup.children().eq(1), self.dataTrazaAsc?.find(t => t.IdProceso == self.procesosLote.FER) || enableAll ? true : false);
                tabStrip.enable(tabStrip.tabGroup.children().eq(2), self.dataTrazaAsc?.find(t => t.IdProceso == self.procesosLote.GUA) || enableAll ? true : false);
                tabStrip.enable(tabStrip.tabGroup.children().eq(3), self.dataTrazaAsc?.find(t => t.IdProceso == self.procesosLote.FIL) || enableAll ? true : false);
                tabStrip.enable(tabStrip.tabGroup.children().eq(4), self.dataTrazaAsc?.find(t => t.IdProceso == self.procesosLote.TCP) || enableAll ? true : false);
                tabStrip.enable(tabStrip.tabGroup.children().eq(5), self.dataTrazaAsc?.find(t => t.IdProceso == self.procesosLote.ENV) || enableAll ? true : false);
            },
            tabsLoading: function (idGrid, loading) {
                if (loading) {
                   
                    switch (idGrid) {
                        
                        case "gridCoccion":
                            kendo.ui.progress($("#" + idGrid), true);
                            $("#loaderCoccion").addClass("k-loading");
                            break;
                        case "gridFermentacion":
                            kendo.ui.progress($("#" + idGrid), true);
                            $("#loaderFermentacion").addClass("k-loading");
                            break;
                        case "gridGuarda":
                            kendo.ui.progress($("#" + idGrid), true);
                            $("#loaderGuarda").addClass("k-loading");
                            break;
                        case "gridFiltracion":
                            kendo.ui.progress($("#" + idGrid), true);
                            $("#loaderFiltracion").addClass("k-loading");
                            break;
                        case "gridTCP":
                            kendo.ui.progress($("#" + idGrid), true);
                            $("#loaderTCP").addClass("k-loading");
                            break;
                        case "gridEnvasado":
                            kendo.ui.progress($("#" + idGrid), true);
                            $("#loaderEnvasado").addClass("k-loading");
                            break;
                        case "gridMMPP":
                            $("#loaderMMPP").addClass("k-loading");
                            break;
                        case "gridMovimientos":
                            $("#loaderMovimientos").addClass("k-loading");
                            break;
                        default:

                    }
                } else {
                    
                    switch (idGrid) {
                        case "gridCoccion":
                            kendo.ui.progress($("#" + idGrid), false);
                            $("#loaderCoccion").removeClass("k-loading");
                            break;
                        case "gridFermentacion":
                            kendo.ui.progress($("#" + idGrid), false);
                            $("#loaderFermentacion").removeClass("k-loading");
                            break;
                        case "gridGuarda":
                            kendo.ui.progress($("#" + idGrid), false);
                            $("#loaderGuarda").removeClass("k-loading");
                            break;
                        case "gridFiltracion":
                            kendo.ui.progress($("#" + idGrid), false);
                            $("#loaderFiltracion").removeClass("k-loading");
                            break;
                        case "gridTCP":
                            kendo.ui.progress($("#" + idGrid), false);
                            $("#loaderTCP").removeClass("k-loading");
                            break;
                        case "gridEnvasado":
                            kendo.ui.progress($("#" + idGrid), false);
                            $("#loaderEnvasado").removeClass("k-loading");
                            break;
                        case "gridMMPP":
                            $("#loaderMMPP").removeClass("k-loading");
                            break;
                        case "gridMovimientos":
                            $("#loaderMovimientos").removeClass("k-loading");
                            break;
                        default:

                    }
                }
            },
            renderGridMMPP: function (self) {
                $("#gridMMPP").kendoExtGrid({
                    dataSource: self.dsLotesMMPP,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    sortable: true,
                    toolbarColumnMenu: true,
                    scrollable: true,
                    selectable: true,
                    autoBind: false,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 500, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    noRecords: {
                        template: window.app.idioma.t("SIN_RESULTADOS")
                    },
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    toolbar: [
                        {
                            name: "excel", text: window.app.idioma.t("EXPORTAR_EXCEL")
                        },
                    ],
                    excel: {
                        fileName: window.app.idioma.t('TRAZA_MMPP') + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    columns: [
                        {
                            template: function (e) {
                                return "<div class='circle_cells' style='background-color:" + e.ColorEstadoLIMs + ";'/>"
                            },
                            width: 50,
                            title: window.app.idioma.t("LIMS"),
                            attributes: { style: "text-align:center;" },
                            groupable: false,
                            filterable: false,
                            //toolbarColumnMenu: false
                        },
                        {
                            title: window.app.idioma.t("LOTE_ORIGEN"),
                            field: 'LoteOrigen',
                            width: 350,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            }
                        },
                        {
                            title: window.app.idioma.t("LOTE_DESTINO"),
                            field: 'LoteDestino',
                            width: 350,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            }
                        },
                        {
                            title: window.app.idioma.t("PROCESO_DESTINO"),
                            field: 'ProcesoDestino',
                            width: 150,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            }
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD"),
                            field: 'Cantidad',
                            width: 150,
                            attributes: {
                                style: 'white-space: nowrap '
                            },
                            template: '<span class="addTooltip">#= kendo.format("{0:n2}",Cantidad)#</span>',
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },

                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            title: window.app.idioma.t("UBICACION_ORIGEN"),
                            field: 'UbicacionOrigen',
                            width: 150,
                            template: '#=typeof UbicacionOrigen !== "undefined" && UbicacionOrigen != null ? UbicacionOrigen : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=UbicacionOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#= UbicacionOrigen#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },
                        {
                            title: window.app.idioma.t("UBICACION_DESTINO"),
                            field: 'UbicacionDestino',
                            width: 150,
                            template: '#=typeof UbicacionDestino !== "undefined" && UbicacionDestino != null ? UbicacionDestino : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=UbicacionDestino#' style='width: 14px;height:14px;margin-right:5px;'/>#= UbicacionDestino#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },
                        {
                            title: window.app.idioma.t("PROVEEDOR"),
                            field: 'IdProveedorOrigen',
                            width: 150,
                            template: '#=typeof IdProveedorOrigen !== "undefined" && IdProveedorOrigen != null ? IdProveedorOrigen : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdProveedorOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#= IdProveedorOrigen#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },
                        {
                            title: window.app.idioma.t("LOTE_PROVEEDOR"),
                            field: 'LoteProveedorOrigen',
                            width: 150,
                            template: '#=typeof LoteProveedorOrigen !== "undefined" && LoteProveedorOrigen != null ? LoteProveedorOrigen : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=LoteProveedorOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#= LoteProveedorOrigen#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },
                        {
                            title: window.app.idioma.t("CODIGO_MATERIAL_ORIGEN"),
                            field: 'IdMaterialOrigen',
                            width: 150,
                            template: '#=typeof IdMaterialOrigen !== "undefined" && IdMaterialOrigen != null ? IdMaterialOrigen : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdMaterialOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#= IdMaterialOrigen#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },
                        {
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL_ORIGEN"),
                            field: 'NombreMaterialOrigen',
                            width: 250,
                            template: '#=typeof NombreMaterialOrigen !== "undefined" && NombreMaterialOrigen != null ? NombreMaterialOrigen : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=NombreMaterialOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#= NombreMaterialOrigen#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },
                        {
                            title: window.app.idioma.t("CODIGO_MATERIAL_DESTINO"),
                            field: 'IdMaterialDestino',
                            width: 150,
                            template: '#=typeof IdMaterialDestino !== "undefined" && IdMaterialDestino != null ? IdMaterialDestino : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdMaterialDestino#' style='width: 14px;height:14px;margin-right:5px;'/>#=IdMaterialDestino#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },
                        {
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL_DESTINO"),
                            field: 'NombreMaterialDestino',
                            width: 250,
                            template: '#=typeof NombreMaterialDestino !== "undefined" && NombreMaterialDestino != null ? NombreMaterialDestino : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=NombreMaterialDestino#' style='width: 14px;height:14px;margin-right:5px;'/>#=NombreMaterialDestino#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },



                    ],
                    dataBound: function (e) {
                        self.resizeTab();


                    }
                });

            },

            renderGridMovimientos: function (self) {
                $("#gridMovimientos").kendoExtGrid({
                    dataSource: self.dsMovimientos,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    sortable: true,
                    toolbarColumnMenu: true,
                    scrollable: true,
                    selectable: true,
                    autoBind: false,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 500, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    noRecords: {
                        template: window.app.idioma.t("SIN_RESULTADOS")
                    },
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    toolbar: [
                        {
                            name: "excel", text: window.app.idioma.t("EXPORTAR_EXCEL")
                        },
                    ],
                    excel: {
                        fileName: window.app.idioma.t('TRAZA_MMPP') + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    columns: [
                        {
                            template: function (e) {
                                return "<div class='circle_cells' style='background-color:" + e.ColorEstadoLIMs + ";'/>"
                            },
                            width: 50,
                            title: window.app.idioma.t("LIMS"),
                            attributes: { style: "text-align:center;" },
                            groupable: false,
                            filterable: false,
                            //toolbarColumnMenu: false
                        },
                        {
                            title: window.app.idioma.t("LOTE_ORIGEN"),
                            field: 'LoteOrigen',
                            width: 350,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            }
                        },
                        {
                            title: window.app.idioma.t("LOTE_DESTINO"),
                            field: 'LoteDestino',
                            width: 350,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            }
                        },
                        {
                            title: window.app.idioma.t("PROCESO_DESTINO"),
                            field: 'ProcesoDestino',
                            width: 150,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            }
                        },

                        {
                            title: window.app.idioma.t("UBICACION_ORIGEN"),
                            field: 'UbicacionOrigen',
                            width: 150,
                            template: '#=typeof UbicacionOrigen !== "undefined" && UbicacionOrigen != null ? UbicacionOrigen : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=UbicacionOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#= UbicacionOrigen#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },
                        {
                            title: window.app.idioma.t("UBICACION_DESTINO"),
                            field: 'UbicacionDestino',
                            width: 150,
                            template: '#=typeof UbicacionDestino !== "undefined" && UbicacionDestino != null ? UbicacionDestino : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=UbicacionDestino#' style='width: 14px;height:14px;margin-right:5px;'/>#= UbicacionDestino#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },
                        {
                            title: window.app.idioma.t("CANTIDAD"),
                            field: 'Cantidad',
                            width: 150,
                            attributes: {
                                style: 'white-space: nowrap '
                            },
                            template: '<span class="addTooltip">#= kendo.format("{0:n2}",Cantidad)#</span>',
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },

                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            title: window.app.idioma.t("UNIDAD"),
                            field: 'UnidadMedidaOrigen',
                            width: 150,
                            template: '#=typeof UnidadMedidaOrigen !== "undefined" && UnidadMedidaOrigen != null ? UnidadMedidaOrigen : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=UnidadMedidaOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#= UnidadMedidaOrigen#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },
                        {
                            title: window.app.idioma.t("PROVEEDOR"),
                            field: 'NombreProveedorOrigen',
                            width: 150,
                            template: '#=typeof NombreProveedorOrigen !== "undefined" && NombreProveedorOrigen != null ? NombreProveedorOrigen : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=NombreProveedorOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#= NombreProveedorOrigen#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },
                        {
                            title: window.app.idioma.t("LOTE_PROVEEDOR"),
                            field: 'LoteProveedorOrigen',
                            width: 150,
                            template: '#=typeof LoteProveedorOrigen !== "undefined" && LoteProveedorOrigen != null ? LoteProveedorOrigen : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=LoteProveedorOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#= LoteProveedorOrigen#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },
                        {
                            title: window.app.idioma.t("TIPO_MATERIAL"),
                            field: 'TipoMaterialOrigen',
                            width: 150,
                            template: '#=typeof TipoMaterialOrigen !== "undefined" && TipoMaterialOrigen != null ? TipoMaterialOrigen : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=TipoMaterialOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoMaterialOrigen#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },
                        {
                            title: window.app.idioma.t("CLASE_MATERIAL"),
                            field: 'ClaseMaterialOrigen',
                            width: 150,
                            template: '#=typeof ClaseMaterialOrigen !== "undefined" && ClaseMaterialOrigen != null ? ClaseMaterialOrigen : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=ClaseMaterialOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#= ClaseMaterialOrigen#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },
                        {
                            title: window.app.idioma.t("MATERIAL"),
                            field: 'MaterialOrigen',
                            width: 150,
                            template: '#=typeof MaterialOrigen !== "undefined" && MaterialOrigen != null ? MaterialOrigen  : ""#',
                            attributes: {
                                style: 'white-space: nowrap '
                            },

                        },

                        {
                            title: window.app.idioma.t("FECHA"),
                            field: 'Creado',
                            template: "<span class='addTooltip'>#= Creado != null ? kendo.toString(new Date(Creado), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : '' #</span>",
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

                    ],
                    dataBound: function (e) {
                        self.resizeTab();

                    }
                });
            },
            ExportarExcelCompleto: function (self) {

                kendo.ui.progress($("#center-pane"), true);

                // Datos de los grids
                const grids = [
                    "gridCoccion"
                    , "gridFermentacion"
                    , "gridGuarda"
                    , "gridFiltracion"
                    , "gridTCP"
                    , "gridEnvasado"
                    , "gridMMPP"
                    , "gridMovimientos"];

                const sheets = [];                

                for (const g of grids) {
                    const gWidget = $("#" + g).getKendoExtGrid();

                    const rows = [];

                    const headerRow = {
                        type: "header",
                        cells: []
                    };

                    const fields = [];

                    for (const c of gWidget.columns) {
                        if (c.hidden || c.command || !c.field) {
                            continue;
                        }
                        headerRow.cells.push(
                            { background: '#7a7a7a', color: '#fff', value: c.title, colSpan: 1, rowSpan: 1 }
                        )
                        fields.push(c.field);
                    }

                    rows.push(headerRow);

                    for (const d of Array.from(gWidget.dataSource.view())) {
                        if (gWidget.tbody.find(`tr[data-uid='${d.uid}']`).css("display") == "none") {
                            continue;
                        }
                        const cells = [];

                        for (const f of fields) {
                            cells.push({
                                value: d[f]
                            })
                        }

                        rows.push({
                            type: "data",
                            cells: cells
                        })                                                
                    }

                    const columns = fields.map(m => ({ autoWidth: true }));

                    sheets.push({
                        name: g.replace('grid', ''),
                        columns: columns,
                        freezePane: {
                            rowSplit: 1
                        },
                        rows: rows,
                        filter: {
                            from: 0,
                            to: columns.length - 1
                        }
                    });
                }

                const workbook = new kendo.ooxml.Workbook({
                    sheets: sheets
                });

                const fileName = `TrazabilidadAscendente_${$("#cmbLoteMes").val()}.xlsx`
                // Save the workbook
                kendo.saveAs({
                    dataURI: workbook.toDataURL(),
                    fileName: fileName
                });

                kendo.ui.progress($("#center-pane"), false);
            },
            //#endregion EVENTOS

            resizeTab: function () {
                var contenedorHeight = $("#center-pane").height();
                var toolbarHeight = $(".k-grid-toolbar").height();

                $("#divSplitterV").height(contenedorHeight - toolbarHeight);

                var cabeceraHeight1 = $("#divCabeceraVista").height();
                var contenedorHeight = $("#center-pane").height();
                var toolbarHeight = $(".k-grid-toolbar").height() < 70 ? $(".k-grid-toolbar").height() + 53 : $(".k-grid-toolbar").height();

                $(".k-content").height(contenedorHeight - toolbarHeight - cabeceraHeight1)

            },

            resizeGrid: function (idGrid) {
                var cabeceraHeight1 = $("#divCabeceraVista").height();
                var contenedorHeight = $("#center-pane").height();
                var toolbarHeight = $(".k-grid-toolbar").height() < 70 ? $(".k-grid-toolbar").height() + 53 : $(".k-grid-toolbar").height();
                var cabeceraHeight = $(".k-grouping-header").height();
                var headerHeightGrid = $(".k-grid-header").height();

                var gridElement = $("#" + idGrid),
                    dataArea = gridElement.find(".k-grid-content:first"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - toolbarHeight - cabeceraHeight1 - cabeceraHeight - headerHeightGrid - 100);
            },
            MostrarLIMS: function (e, self) {
                const actualGrid = $(".k-content.k-state-active").find("[data-role='extgrid']").getKendoExtGrid()
                const selectedRow = actualGrid.select();

                if (selectedRow.length > 1) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_ELEGIR_SOLO_UN_REGISTRO'), 4000);
                    return;
                }

                const dataItem = actualGrid.dataItem(selectedRow);
                if (!dataItem) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                let data = {
                }

                const gridId = $(".k-content.k-state-active").find("[data-role='extgrid']").attr("id")

                if (gridId == "gridMMPP") {

                } else if (gridId == "gridMovimientos") {
                    data.IdLoteMES = dataItem.LoteOrigen;
                    data.FechaLote = dataItem.Creado;
                } else {
                    data.IdLoteMES = dataItem.IdLoteMES;
                    data.FechaLote = dataItem.FechaCreacion;
                }

                let ventana = $("<div id='window-lims'/>").kendoWindow({
                    title: window.app.idioma.t("LIMS"),
                    maxWidth: "90%",
                    height: "90%",
                    close: function () {
                        kendoWindow.destroy();
                    },
                    resizable: false,
                    modal: true
                })

                let kendoWindow = ventana.getKendoWindow();

                let template = kendo.template($("#tmpLIMS").html());
                kendoWindow
                    .content(template(data));

                kendo.init(ventana);

                $("#gridLIMS").css("height", (window.innerHeight * 0.9 - 60) + "px");

                new vistaLIMS({ LoteMES: data.IdLoteMES, FechaLote: data.FechaLote, opciones: { mostrarLanzarMuestra: false } });

                kendoWindow.center().open();
            },
            eliminar: function () {
                $('[data-toggle="popover"]').popover('hide');
                this.remove();                
            },
        });

        return vista;
    });

