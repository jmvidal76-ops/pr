define(['underscore', 'backbone', 'jquery', 'text!../../../Mermas/html/CalculoMermaSilos.html', 'compartido/notificaciones', 'jszip', 'compartido/util'
], function (_, Backbone, $, PlantillaCalculoMermaSilos, Not, JSZip, util) {

    var VistaCalculoMermaSilos = Backbone.View.extend({
        tagName: 'div',
        id: 'divHTMLContenido',
        template: _.template(PlantillaCalculoMermaSilos),

        dsExistenciasIniciales: null,
        dsMovimientosSilos: null,
        dsMovEntradas: null,
        dsMovSalidas: null,
        dsExistenciasFinales: null,

        gridExistenciasIniciales: null,
        gridMovEntradas: null,
        gridMovSalidas: null,
        gridExistenciasFinales: null,

        fechaHasta: null,
        fechaDesde: null,

        initialize: function () {
            var self = this;
            window.JSZip = JSZip;

            // Rango inicial de 30 días
            self.fechaHasta = new Date().midnight().addDays(-1);
            self.fechaHasta.setHours(23, 59, 59, 999);

            self.fechaDesde = self.fechaHasta.addDays(-30);
            self.fechaDesde.setHours(0, 0, 0, 0);

            self.getDataSources();
            self.render();

            // Después de pintar la vista y los grids, lanzamos la primera consulta
            //self.consultar();
            self.resizeGrid();

            self.$("[data-funcion]").checkSecurity();
        },

        crearDataSourceExistencias: function (getFechasFn, zonaValor) {
            var self = this;

            var ds = new kendo.data.DataSource({
                autoBind: false,
                pageSize: 50,
                transport: {
                    read: {
                        url: "../api/CalculoMermas/ObtenerExistenciasCalculoMermas",
                        dataType: "json",
                        type: "GET",
                        data: function () {
                            var fechas = getFechasFn ? getFechasFn() : { fechaDesde: null, fechaHasta: null };
                            var desde = fechas.fechaDesde instanceof Date ? fechas.fechaDesde : (fechas.fechaDesde ? new Date(fechas.fechaDesde) : null);
                            var hasta = fechas.fechaHasta instanceof Date ? fechas.fechaHasta : (fechas.fechaHasta ? new Date(fechas.fechaHasta) : null);

                            return {
                                fechaDesde: desde ? desde.toISOString() : null,
                                fechaHasta: hasta ? hasta.toISOString() : null,
                                zona: zonaValor
                            };
                        }
                    }
                },
                schema: {
                    model: {
                        id: "IdMermasExistencias",
                        fields: {
                            Id: { type: "number", editable: false },
                            IdMermasExistencias: { type: "number", editable: false },
                            Fecha: { type: "date" },
                            Zona: { type: "number" },
                            DescripcionZona: { type: "string" },

                            Codigo_JDE: { type: "string" },
                            DescripcionMaterial: { type: "string" },
                            IdUbicacion: { type: "number" },
                            Ubicacion: { type: "string" },
                            DescripcionUbicacion: { type: "string" },

                            Extracto: { type: "number" },
                            Cantidad: { type: "number" },

                            Editado: { type: "boolean" },
                            Borrado: { type: "boolean" },

                            Creado: { type: "date" },
                            CreadoPor: { type: "string" },
                            Actualizado: { type: "date" },
                            ActualizadoPor: { type: "string" }
                        }
                    }
                },
                error: function (e) {
                    if (e.status === 403 && e.responseJSON === 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER') + ' ObtenerExistenciasCalculoMermas', 4000);
                    }
                }
            });

            return ds;
        },

        getDataSources: function () {
            var self = this;
            var formato = "yyyy-MM-dd HH:mm";

            // 1) Existencias iniciales
            self.dsExistenciasIniciales = self.crearDataSourceExistencias(function () {
                var dpDesde = $("#dtpFechaDesdeMerma").getKendoDatePicker();
                var valorDesde = dpDesde && dpDesde.value();

                if (!valorDesde) {
                    return { fechaDesde: null, fechaHasta: null };
                }

                var d = new Date(valorDesde);
                var dIni = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
                var dFin = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

                return {
                    fechaDesde: kendo.toString(dIni, formato),
                    fechaHasta: kendo.toString(dFin, formato)
                };
            }, 0);

            // eventos del DS de existencias iniciales
            self.dsExistenciasIniciales.bind("requestStart", function () {
                self.mostrarSpinnerGrid(self.gridExistenciasIniciales);
            });
            self.dsExistenciasIniciales.bind("requestEnd", function () {
                self.ocultarSpinnerGrid(self.gridExistenciasIniciales);
                self.recalcularResultados(); // <-- AÑADIDO aquí
            });
            self.dsExistenciasIniciales.bind("change", function () {
                self.recalcularResultados();
            });

            // 2) Movimientos silos
            self.dsMovimientosSilos = new kendo.data.DataSource({
                autoBind: false,
                pageSize: 5000,
                transport: {
                    read: {
                        url: "../api/CalculoMermas/ObtenerDatosCalculoMermas",
                        dataType: "json",
                        type: "GET",
                        data: function () {
                            var dpDesde = $("#dtpFechaDesdeMerma").getKendoDatePicker();
                            var dpHasta = $("#dtpFechaHastaMerma").getKendoDatePicker();

                            var vDesde = dpDesde && dpDesde.value();
                            var vHasta = dpHasta && dpHasta.value();

                            var fechaDesde = null;
                            var fechaHasta = null;

                            if (vDesde) {
                                var d = new Date(vDesde);
                                // Desde inicio del día
                                var dIni = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
                                fechaDesde = dIni.toISOString();
                            }
                            if (vHasta) {
                                var h = new Date(vHasta);
                                // Hasta fin del día
                                var dFin = new Date(h.getFullYear(), h.getMonth(), h.getDate(), 23, 59, 59, 999);
                                fechaHasta = dFin.toISOString();
                            }

                            return {
                                fechaDesde: fechaDesde,
                                fechaHasta: fechaHasta,
                                zona: "Silos",
                                tipo: ""
                            };
                        }
                    }
                },
                schema: { /* ... (igual que antes) ... */ },
                requestStart: function () {
                    self.mostrarSpinnerGrid(self.gridMovEntradas);
                    self.mostrarSpinnerGrid(self.gridMovSalidas);
                },
                requestEnd: function () {
                    self.ocultarSpinnerGrid(self.gridMovEntradas);
                    self.ocultarSpinnerGrid(self.gridMovSalidas);
                    self.recalcularResultados(); // <-- AÑADIDO aquí
                },
                error: function (e) {
                    if (e.status === 403 && e.responseJSON === 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER') + ' ObtenerDatosCalculoMermas', 4000);
                    }
                }
            });

            // DS para grids 2 y 3 (igual que antes)
            self.dsMovEntradas = new kendo.data.DataSource({
                autoBind: false,
                pageSize: 50,
                schema: self.dsMovimientosSilos.options.schema
            });

            self.dsMovSalidas = new kendo.data.DataSource({
                autoBind: false,
                pageSize: 50,
                schema: self.dsMovimientosSilos.options.schema
            });

            // volvemos a recalcular los totales 
            self.dsMovEntradas.bind("change", function () {
                self.recalcularResultados();
            });
            self.dsMovSalidas.bind("change", function () {
                self.recalcularResultados();
            });

            // 3) Existencias finales
            self.dsExistenciasFinales = self.crearDataSourceExistencias(function () {
                var dpHasta = $("#dtpFechaHastaMerma").getKendoDatePicker();
                var vHasta = dpHasta && dpHasta.value();

                if (!vHasta) {
                    return { fechaDesde: null, fechaHasta: null };
                }

                // Fecha desde: día seleccionado a las 02:00
                var desde = new Date(vHasta.getFullYear(), vHasta.getMonth(), vHasta.getDate(), 2, 0, 0);

                // Fecha hasta: día seleccionado + 1 día a la 01:00
                var hasta = new Date(vHasta.getFullYear(), vHasta.getMonth(), vHasta.getDate() + 1, 1, 0, 0);

                return {
                    fechaDesde: kendo.toString(desde, formato),
                    fechaHasta: kendo.toString(hasta, formato)
                };
            }, 0);
            // eventos del DS de existencias finales
            self.dsExistenciasFinales.bind("requestStart", function () {
                self.mostrarSpinnerGrid(self.gridExistenciasFinales);
            });
            self.dsExistenciasFinales.bind("requestEnd", function () {
                self.ocultarSpinnerGrid(self.gridExistenciasFinales);
                self.recalcularResultados(); // <-- AÑADIDO aquí
            });
            self.dsExistenciasFinales.bind("change", function () {
                self.recalcularResultados();
            });
        },

        mostrarSpinnerGrid: function (grid) {
            if (!grid) return;
            kendo.ui.progress(grid.wrapper || grid.element, true);
        },
        ocultarSpinnerGrid: function (grid) {
            if (!grid) return;
            kendo.ui.progress(grid.wrapper || grid.element, false);
        },

        // RESULTADOS 

        sumarCampo: function (ds, campo) {
            if (!ds) return 0;
            var dataView = ds.view();
            var total = 0;
            for (var i = 0; i < dataView.length; i++) {
                var it = dataView[i];
                var v = it[campo] != null ? it[campo] : 0;
                total += v;
            }
            return total;
        },

        recalcularResultados: function () {
            var self = this;

            // --- Extracto ---
            var eiExt = self.sumarCampo(self.dsExistenciasIniciales, "Extracto");
            var entExt = self.sumarCampo(self.dsMovEntradas, "Extracto");
            var salExt = self.sumarCampo(self.dsMovSalidas, "Extracto");
            var efExt = self.sumarCampo(self.dsExistenciasFinales, "Extracto");

            var etExt = eiExt + entExt - salExt;
            var mermaExt = etExt - efExt;
            var porcMermaExt = etExt !== 0 ? (mermaExt / etExt) * 100 : 0;

            $("[data-campo='EI_Extracto']").text(kendo.toString(eiExt, "n2"));
            $("[data-campo='Entradas_Extracto']").text(kendo.toString(entExt, "n2"));
            $("[data-campo='Salidas_Extracto']").text(kendo.toString(salExt, "n2"));
            $("[data-campo='EF_Extracto']").text(kendo.toString(efExt, "n2"));
            $("[data-campo='ET_Extracto']").text(kendo.toString(etExt, "n2"));
            $("[data-campo='Merma_Extracto']").text(kendo.toString(mermaExt, "n2"));
            $("[data-campo='PorcMerma_Extracto']").text(kendo.toString(porcMermaExt, "n2"));

            // --- Volumen (Cantidad) ---
            var eiVol = self.sumarCampo(self.dsExistenciasIniciales, "Cantidad");
            var entVol = self.sumarCampo(self.dsMovEntradas, "Cantidad");
            var salVol = self.sumarCampo(self.dsMovSalidas, "Cantidad");
            var efVol = self.sumarCampo(self.dsExistenciasFinales, "Cantidad");

            var etVol = eiVol + entVol - salVol;
            var mermaVol = etVol - efVol;
            var porcMermaVol = etVol !== 0 ? (mermaVol / etVol) * 100 : 0;

            $("[data-campo='EI_Volumen']").text(kendo.toString(eiVol, "n2"));
            $("[data-campo='Entradas_Volumen']").text(kendo.toString(entVol, "n2"));
            $("[data-campo='Salidas_Volumen']").text(kendo.toString(salVol, "n2"));
            $("[data-campo='EF_Volumen']").text(kendo.toString(efVol, "n2"));
            $("[data-campo='ET_Volumen']").text(kendo.toString(etVol, "n2"));
            $("[data-campo='Merma_Volumen']").text(kendo.toString(mermaVol, "n2"));
            $("[data-campo='PorcMerma_Volumen']").text(kendo.toString(porcMermaVol, "n2"));
        },

        // Convierte un grid en hoja Excel
        hojaDesdeGrid: function (grid, nombreHoja) {
            if (!grid) return null;

            var workbook = null;

            grid.one("excelExport", function (e) {
                workbook = e.workbook;
                e.preventDefault();
            });

            grid.saveAsExcel();

            if (workbook && workbook.sheets && workbook.sheets.length > 0) {
                var sheet = workbook.sheets[0];
                sheet.name = nombreHoja || sheet.name;
                return sheet;
            }
            return null;
        },

        hojaResultados: function () {
            function num(campo) {
                var t = $("[data-campo='" + campo + "']").text() || "0";
                var v = kendo.parseFloat(t);
                return isNaN(v) ? 0 : v;
            }

            var rows = [];

            rows.push({ cells: [{ value: "" }] });

            // Merma en Extracto
            rows.push({
                cells: [
                    { value: window.app.idioma.t('MERMA_EN_EXTRACTO'), colSpan: 7, background: "#FFE4B5", bold: true, textAlign: "center" }
                ]
            });
            rows.push({
                cells: [
                    { value: window.app.idioma.t('EXISTENCIAS_INICIALES'), bold: true, textAlign: "center" },
                    { value: window.app.idioma.t('ENTRADAS'), bold: true, textAlign: "center" },
                    { value: window.app.idioma.t('SALIDAS'), bold: true, textAlign: "center" },
                    { value: window.app.idioma.t('EXISTENCIAS_INICIALES'), bold: true, textAlign: "center" },
                    { value: window.app.idioma.t('EXISTENCIAS_FINALES'), bold: true, textAlign: "center" },
                    { value: window.app.idioma.t('MERMA'), bold: true, textAlign: "center" },
                    { value: "% " + window.app.idioma.t('MERMA'), bold: true, textAlign: "center" }
                ]
            });
            rows.push({
                cells: [
                    { value: num("EI_Extracto"), format: "0.00", textAlign: "center" },
                    { value: num("Entradas_Extracto"), format: "0.00", textAlign: "center" },
                    { value: num("Salidas_Extracto"), format: "0.00", textAlign: "center" },
                    { value: num("EF_Extracto"), format: "0.00", textAlign: "center" },
                    { value: num("ET_Extracto"), format: "0.00", textAlign: "center" },
                    { value: num("Merma_Extracto"), format: "0.00", textAlign: "center" },
                    { value: num("PorcMerma_Extracto"), format: "0.00", textAlign: "center" }
                ]
            });

            rows.push({ cells: [{ value: "" }] });

            // Merma en Volumen
            rows.push({
                cells: [
                    { value: window.app.idioma.t('MERMA_EN_VOLUMEN'), colSpan: 7, background: "#FFE4B5", bold: true, textAlign: "center" }
                ]
            });
            rows.push({
                cells: [
                    { value: window.app.idioma.t('EXISTENCIAS_INICIALES'), bold: true, textAlign: "center" },
                    { value: window.app.idioma.t('ENTRADAS'), bold: true, textAlign: "center" },
                    { value: window.app.idioma.t('SALIDAS'), bold: true, textAlign: "center" },
                    { value: window.app.idioma.t('EXISTENCIAS_INICIALES'), bold: true, textAlign: "center" },
                    { value: window.app.idioma.t('EXISTENCIAS_FINALES'), bold: true, textAlign: "center" },
                    { value: window.app.idioma.t('MERMA'), bold: true, textAlign: "center" },
                    { value: "% " + window.app.idioma.t('MERMA'), bold: true, textAlign: "center" }
                ]
            });
            rows.push({
                cells: [
                    { value: num("EI_Volumen"), format: "0.00", textAlign: "center" },
                    { value: num("Entradas_Volumen"), format: "0.00", textAlign: "center" },
                    { value: num("Salidas_Volumen"), format: "0.00", textAlign: "center" },
                    { value: num("EF_Volumen"), format: "0.00", textAlign: "center" },
                    { value: num("ET_Volumen"), format: "0.00", textAlign: "center" },
                    { value: num("Merma_Volumen"), format: "0.00", textAlign: "center" },
                    { value: num("PorcMerma_Volumen"), format: "0.00", textAlign: "center" }
                ]
            });

            // Columnas formato
            var columns = [];
            for (var i = 0; i < 7; i++) {
                columns.push({
                    width: 20,
                    autoWidth: true
                });
            }

            rows[2].cells.forEach(function (c) { c.wrap = true; });
            rows[5].cells.forEach(function (c) { c.wrap = true; });

            return {
                name: window.app.idioma.t('RESULTADOS'),
                columns: columns,
                rows: rows
            };
        },

        render: function () {
            var self = this;

            DestruirKendoWidgets(self);

            $(this.el).html(this.template());
            $("#center-pane").append($(this.el));

            var fmtVisual = "dd/MM/yyyy";

            $("#dtpFechaHastaMerma").kendoDatePicker({
                value: self.fechaHasta,
                format: fmtVisual,
                culture: localStorage.getItem("idiomaSeleccionado")
            });

            $("#dtpFechaDesdeMerma").kendoDatePicker({
                value: self.fechaDesde,
                format: fmtVisual,
                culture: localStorage.getItem("idiomaSeleccionado")
            });

            util.ui.createVSplitter('#vspCalculoMerma', ['12%', '22%', '22%', '22%', '22%']);

            self.cargarGrids();

            util.ui.enableResizeCenterPane && util.ui.enableResizeCenterPane();

            self.resizeGrid();

            return this;
        },

        cargarGrids: function () {
            var self = this;

            // Grid 1: Existencias Iniciales
            self.gridExistenciasIniciales = $("#gridExistenciasIniciales").kendoGrid({
                toolbar: kendo.template($("#tmplGridExistenciasInicialesToolbar").html()),
                dataSource: self.dsExistenciasIniciales,
                sortable: true,
                resizable: true,
                autoBind: false,
                filterable: {
                    extra: false,
                    messages: window.app.cfgKendo.configuracionFiltros_Msg,
                    operators: window.app.cfgKendo.configuracionFiltros_Operadores
                },
                pageable: {
                    refresh: true,
                    pageSizes: [50, 100, 200, 'All'],
                    buttonCount: 5,
                    messages: window.app.cfgKendo.configuracionPaginado_Msg
                },
                excel: util.ui.default.gridExcelDate('EXISTENCIAS_INICIALES_SILOS'),
                excelExport: function (e) {
                    ExcelGridExtra(e, util);
                },
                columns: [
                    {
                        field: "Fecha",
                        title: window.app.idioma.t("FECHA"),
                        filterable: false,
                        width: 140,
                        template: '#: kendo.toString(new Date(Fecha),kendo.culture().calendars.standard.patterns.MES_FechaHora)#'
                    },
                    {
                        hidden: false,
                        field: "Ubicacion",
                        title: window.app.idioma.t("UBICACION"),
                        width: 120,
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field == "all") {
                                    return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                }
                                return "<div><label><input type='checkbox' value='#=Ubicacion#' style='width: 14px;height:14px;margin-right:5px;'/>#= Ubicacion#</label></div>";
                            }
                        }
                    },
                    {
                        field: "Codigo_JDE",
                        title: window.app.idioma.t("CODIGO_JDE"),
                        width: 70,
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                return e.field == "all" ?
                                    "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                    "<div><label><input type='checkbox' value='#=Codigo_JDE#' style='width: 14px;height:14px;margin-right:5px;'/>#= Codigo_JDE# - #= DescripcionMaterial#</label></div>";
                            }
                        }
                    },
                    { field: "DescripcionMaterial", title: window.app.idioma.t("DESCRIPCION_MATERIAL"), filterable: false, width: 220 },
                    { field: "Cantidad", title: window.app.idioma.t("CANTIDAD"), format: "{0:n2}", width: 110, filterable: false },
                    { field: "Extracto", title: "Kg " + window.app.idioma.t("EXTRACTO"), format: "{0:n2}", width: 110, filterable: false }
                ]
            }).data("kendoGrid");

            // Grid 2: Movimientos de Entrada
            self.gridMovEntradas = $("#gridMovEntradas").kendoGrid({
                toolbar: kendo.template($("#tmplGridMovEntradasToolbar").html()),
                dataSource: self.dsMovEntradas,
                sortable: true,
                resizable: true,
                autoBind: false,
                filterable: {
                    extra: false,
                    messages: window.app.cfgKendo.configuracionFiltros_Msg,
                    operators: window.app.cfgKendo.configuracionFiltros_Operadores
                },
                pageable: {
                    refresh: true,
                    pageSizes: [50, 100, 200, 'All'],
                    buttonCount: 5,
                    messages: window.app.cfgKendo.configuracionPaginado_Msg
                },
                excel: util.ui.default.gridExcelDate('MOV_ENTRADA_SILOS'),
                excelExport: function (e) {
                    ExcelGridExtra(e, util);
                },
                columns: [
                    {
                        field: "Fecha",
                        title: window.app.idioma.t("FECHA"),
                        filterable: false,
                        width: 140,
                        template: '#: kendo.toString(new Date(Fecha),kendo.culture().calendars.standard.patterns.MES_FechaHora)#'
                    },
                    {
                        field: "UbicacionOrigen",
                        title: window.app.idioma.t("UBICACION_ORIGEN"),
                        width: 120,
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field == "all") {
                                    return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                }
                                return "<div><label><input type='checkbox' value='#=UbicacionOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#= UbicacionOrigen#</label></div>";
                            }
                        }                    },
                    {
                        hidden: false,
                        field: "UbicacionDestino",
                        title: window.app.idioma.t("UBICACION_DESTINO"),
                        width: 120,
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field == "all") {
                                    return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                }
                                return "<div><label><input type='checkbox' value='#=UbicacionDestino#' style='width: 14px;height:14px;margin-right:5px;'/>#= UbicacionDestino#</label></div>";
                            }
                        }
                    },
                    {
                        field: "CodProducto",
                        title: window.app.idioma.t("CODIGO_JDE"),
                        width: 70,
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                return e.field == "all" ?
                                    "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                    "<div><label><input type='checkbox' value='#=CodProducto#' style='width: 14px;height:14px;margin-right:5px;'/>#= CodProducto# - #= DescripcionProducto#</label></div>";
                            }
                        }
                    },
                    { field: "DescripcionProducto", title: window.app.idioma.t("DESCRIPCION_MATERIAL"), width: 200, filterable: false },
                    { field: "Cantidad", title: window.app.idioma.t("CANTIDAD"), format: "{0:n2}", width: 110, filterable: false },
                    { field: "Rendimiento", title: window.app.idioma.t("RENDIMIENTO"), format: "{0:n2}", width: 100, filterable: false },
                    { field: "Humedad", title: window.app.idioma.t("HUMEDAD"), format: "{0:n2}", width: 100, filterable: false },
                    { field: "Extracto", title: "Kg " + window.app.idioma.t("EXTRACTO"), format: "{0:n2}", width: 120, filterable: false }
                ]
            }).data("kendoGrid");

            // Grid 3: Movimientos de Salida
            self.gridMovSalidas = $("#gridMovSalidas").kendoGrid({
                toolbar: kendo.template($("#tmplGridMovSalidasToolbar").html()),
                dataSource: self.dsMovSalidas,
                sortable: true,
                resizable: true,
                autoBind: false,
                filterable: {
                    extra: false,
                    messages: window.app.cfgKendo.configuracionFiltros_Msg,
                    operators: window.app.cfgKendo.configuracionFiltros_Operadores
                },
                pageable: {
                    refresh: true,
                    pageSizes: [50, 100, 200, 'All'],
                    buttonCount: 5,
                    messages: window.app.cfgKendo.configuracionPaginado_Msg
                },
                excel: util.ui.default.gridExcelDate('MOV_SALIDA_SILOS'),
                excelExport: function (e) {
                    ExcelGridExtra(e, util);
                },
                columns: [
                    {
                        field: "Fecha",
                        title: window.app.idioma.t("FECHA"),
                        filterable: false,
                        width: 140,
                        template: '#: kendo.toString(new Date(Fecha),kendo.culture().calendars.standard.patterns.MES_FechaHora)#'
                    },
                    {
                        field: "UbicacionOrigen",
                        title: window.app.idioma.t("UBICACION_ORIGEN"),
                        width: 120,
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field == "all") {
                                    return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                }
                                return "<div><label><input type='checkbox' value='#=UbicacionOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#= UbicacionOrigen#</label></div>";
                            }
                        }
                    },
                    {
                        field: "UbicacionDestino",
                        title: window.app.idioma.t("UBICACION_DESTINO"),
                        width: 120,
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field == "all") {
                                    return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                }
                                return "<div><label><input type='checkbox' value='#=UbicacionDestino#' style='width: 14px;height:14px;margin-right:5px;'/>#= UbicacionDestino#</label></div>";
                            }
                        }
                    },
                    {
                        hidden: false,
                        field: "UbicacionSiloOrigen",
                        title: window.app.idioma.t("SILO_ORIGEN"),
                        width: 120,
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field == "all") {
                                    return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                }
                                return "<div><label><input type='checkbox' value='#=UbicacionSiloOrigen#' style='width: 14px;height:14px;margin-right:5px;'/>#= UbicacionSiloOrigen#</label></div>";
                            }
                        }
                    },
                    {
                        field: "CodProducto",
                        title: window.app.idioma.t("CODIGO_JDE"),
                        width: 70,
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                return e.field == "all" ?
                                    "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                    "<div><label><input type='checkbox' value='#=CodProducto#' style='width: 14px;height:14px;margin-right:5px;'/>#= CodProducto# - #= DescripcionProducto#</label></div>";
                            }
                        }
                    },
                    { field: "DescripcionProducto", title: window.app.idioma.t("DESCRIPCION_MATERIAL"), width: 200, filterable: false },
                    { field: "Cantidad", title: window.app.idioma.t("CANTIDAD"), format: "{0:n2}", width: 110, filterable: false },
                    { field: "Rendimiento", title: window.app.idioma.t("RENDIMIENTO"), format: "{0:n2}", width: 100, filterable: false },
                    { field: "Humedad", title: window.app.idioma.t("HUMEDAD"), format: "{0:n2}", width: 100, filterable: false },
                    { field: "Extracto", title: "Kg " + window.app.idioma.t("EXTRACTO"), format: "{0:n2}", width: 120, filterable: false }
                ]
            }).data("kendoGrid");

            // Grid 4: Existencias Finales
            self.gridExistenciasFinales = $("#gridExistenciasFinales").kendoGrid({
                toolbar: kendo.template($("#tmplGridExistenciasFinalesToolbar").html()),
                dataSource: self.dsExistenciasFinales,
                sortable: true,
                resizable: true,
                autoBind: false,
                filterable: {
                    extra: false,
                    messages: window.app.cfgKendo.configuracionFiltros_Msg,
                    operators: window.app.cfgKendo.configuracionFiltros_Operadores
                },
                pageable: {
                    refresh: true,
                    pageSizes: [50, 100, 200, 'All'],
                    buttonCount: 5,
                    messages: window.app.cfgKendo.configuracionPaginado_Msg
                },
                excel: util.ui.default.gridExcelDate('EXISTENCIAS_FINALES_SILOS'),
                excelExport: function (e) {
                    ExcelGridExtra(e, util);
                },
                columns: [
                    {
                        field: "Fecha",
                        title: window.app.idioma.t("FECHA"),
                        filterable: false,
                        width: 140,
                        template: '#: kendo.toString(new Date(Fecha),kendo.culture().calendars.standard.patterns.MES_FechaHora)#'
                    },
                    {
                        hidden: false,
                        field: "Ubicacion",
                        title: window.app.idioma.t("UBICACION"),
                        width: 120,
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field == "all") {
                                    return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                }
                                return "<div><label><input type='checkbox' value='#=Ubicacion#' style='width: 14px;height:14px;margin-right:5px;'/>#= Ubicacion#</label></div>";
                            }
                        }
                    },
                    {
                        field: "Codigo_JDE",
                        title: window.app.idioma.t("CODIGO_JDE"),
                        width: 70,
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                return e.field == "all" ?
                                    "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                    "<div><label><input type='checkbox' value='#=Codigo_JDE#' style='width: 14px;height:14px;margin-right:5px;'/>#= Codigo_JDE# - #= DescripcionMaterial#</label></div>";
                            }
                        }
                    },
                    { field: "DescripcionMaterial", title: window.app.idioma.t("DESCRIPCION_MATERIAL"), filterable: false, width: 220 },
                    { field: "Cantidad", title: window.app.idioma.t("CANTIDAD"), format: "{0:n2}", width: 110, filterable: false },
                    { field: "Extracto", title: "Kg " + window.app.idioma.t("EXTRACTO"), format: "{0:n2}", width: 110, filterable: false }
                ]
            }).data("kendoGrid");

            // Split movimientos (Cogemos todos los movs -> desglosamos en entradas y salidas)
            self.dsMovimientosSilos.bind("change", function () {
                var datos = self.dsMovimientosSilos.data();

                if (!datos || datos.length === 0) {
                    self.dsMovEntradas.data([]);
                    self.dsMovSalidas.data([]);
                    self.recalcularResultados();
                    return;
                }

                function getDireccion(m) {
                    var v = (typeof m.get === "function") ? m.get("Direccion") : m.Direccion;
                    return v == null ? "" : String(v).toLowerCase().trim();
                }

                var entradas = [];
                var salidas = [];

                datos.forEach(function (m) {
                    var dir = getDireccion(m);
                    if (dir === "entrada") entradas.push(m);
                    else if (dir === "salida") salidas.push(m);
                });

                self.dsMovEntradas.data(entradas);
                self.dsMovSalidas.data(salidas);

                self.recalcularResultados();
            });

            window.app.headerGridTooltip && window.app.headerGridTooltip(self.gridExistenciasIniciales);
            window.app.headerGridTooltip && window.app.headerGridTooltip(self.gridMovEntradas);
            window.app.headerGridTooltip && window.app.headerGridTooltip(self.gridMovSalidas);
            window.app.headerGridTooltip && window.app.headerGridTooltip(self.gridExistenciasFinales);
        },

        events: {
            'click #btnCalculoMermaConsultar': 'consultar',
            'click #btnCalculoMermaLimpiarFiltros': 'limpiarFiltros',
            'click #btnCalculoMermaExportarExcel': 'exportarExcel'
        },

        consultar: function () {
            var self = this;

            var desde = $("#dtpFechaDesdeMerma").getKendoDatePicker().value();
            var hasta = $("#dtpFechaHastaMerma").getKendoDatePicker().value();

            if (!desde || !hasta) {
                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LAS_FECHAS_INTRODUCIDAS'), 4000);
                return;
            }

            if (desde > hasta) {
                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('_LA_FECHA'), 4000);
                return;
            }

            self.limpiarFiltros();

            self.dsExistenciasIniciales.read();
            self.dsMovimientosSilos.read();
            self.dsExistenciasFinales.read();
        },

        limpiarFiltros: function () {
            var self = this;
            self.LimpiarFiltroGrid();
        },

        // Excel multi-hoja 
        exportarExcel: function () {
            var self = this;

            var g1 = self.gridExistenciasIniciales;
            var g2 = self.gridMovEntradas;
            var g3 = self.gridMovSalidas;
            var g4 = self.gridExistenciasFinales;

            if (!g1 && !g2 && !g3 && !g4) {
                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_HAY_DATOS_EXPORTAR'), 3000);
                return;
            }

            var sheets = [];

            var s1 = self.hojaDesdeGrid(g1, window.app.idioma.t('EXISTENCIAS_INICIALES'));
            if (s1) sheets.push(s1);

            var s2 = self.hojaDesdeGrid(g2, window.app.idioma.t('MOVIMIENTOS_ENTRADA'));
            if (s2) sheets.push(s2);

            var s3 = self.hojaDesdeGrid(g3, window.app.idioma.t('MOVIMIENTOS_SALIDA'));
            if (s3) sheets.push(s3);

            var s4 = self.hojaDesdeGrid(g4, window.app.idioma.t('EXISTENCIAS_FINALES'));
            if (s4) sheets.push(s4);

            sheets.push(self.hojaResultados());

            var workbook = new kendo.ooxml.Workbook({
                sheets: sheets
            });

            kendo.saveAs({
                dataURI: workbook.toDataURL(),
                fileName: "CalculoMermaSilos.xlsx"
            });
        },

        eliminar: function () {
            // same as this.$el.remove();
            this.remove();

            // unbind events that are
            // set on this view
            this.off();

            // remove all models bindings
            // made by this view
            if (this.model && this.model.off) { this.model.off(null, null, this); }
        },

        resizeGrid: function () {
            var contenedorHeight = $("#center-pane").innerHeight();
            var cabeceraHeight = $("#divCabeceraVista").innerHeight();
            var filtrosHeight = $("#divFiltrosHeader").innerHeight();

            var disponible = contenedorHeight - cabeceraHeight - filtrosHeight - 4;
            if (disponible <= 0) return;

            $("#vspCalculoMerma").height(disponible);
        },

        LimpiarFiltroGrid: function () {
            var self = this;

            if (self.dsExistenciasIniciales) {
                self.dsExistenciasIniciales.query({ group: [], filter: [], page: 1 });
            }
            if (self.dsMovEntradas) {
                self.dsMovEntradas.query({ group: [], filter: [], page: 1 });
            }
            if (self.dsMovSalidas) {
                self.dsMovSalidas.query({ group: [], filter: [], page: 1 });
            }
            if (self.dsExistenciasFinales) {
                self.dsExistenciasFinales.query({ group: [], filter: [], page: 1 });
            }

            self.recalcularResultados();
        }

    });

    return VistaCalculoMermaSilos;
});