define(['underscore', 'backbone', 'jquery', 'text!../../../Mermas/html/MermasCapturaMovimientos.html', 'vistas/vDialogoConfirm',
    'compartido/notificaciones', 'jszip', '../../../../Portal/js/constantes', 'compartido/util'],
    function (_, Backbone, $, Plantilla, VistaDlgConfirm, Not, JSZip, enums, util) {
        var VistaConfExtraccion = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            grid: null,
            template: _.template(Plantilla),
            formulas: [],
            formulaDropdownData: [],
            zonas: [],
            zonaDropdownData: [],
            entradaOptions: [
                { value: "Entrada", text: window.app ? (window.app.idioma.t("ENTRADA") || "Entrada") : "Entrada" },
                { value: "Salida", text: window.app ? (window.app.idioma.t("SALIDA") || "Salida") : "Salida" }
            ],
            materiales: [],
            materialMap: {},

            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                var splitter = $("#vertical").data("kendoSplitter");
                if (splitter) splitter.bind("resize", self.resizeGrid);

                // Cargar fórmulas y zonas en paralelo antes de renderizar
                Promise.all([
                    self.obtenerFormulasCalculo(),
                    self.obtenerZonasCalculoExtracto(),
                    self.obtenerMateriales()
                ])
                    .catch(function () {
                    })
                    .finally(function () {
                        self.getDataSource();
                        self.render();
                    });
            },
            obtenerMateriales: function () {
                var self = this;

                return new Promise(function (resolve) {
                    $.ajax({
                        type: "GET",
                        url: "../api/GetMaterial",
                        dataType: "json"
                    }).done(function (res) {
                        self.materiales = Array.isArray(res) ? res : [];
                        self.materialMap = {};
                        self.materiales.forEach(function (m) {
                            var id = String(m.IdMaterial);
                            var desc = String(m.DescripcionCompleta || id);
                            var pref = id + " - ";
                            if (desc.indexOf(pref) === 0) desc = desc.substring(pref.length);
                            self.materialMap[id] = desc;
                        });
                        resolve();
                    }).fail(function () {
                        self.materiales = [];
                        self.materialMap = {};
                        resolve();
                    });
                });
            },
            obtenerFormulasCalculo: function () {
                var self = this;

                return new Promise(function (resolve, reject) {
                    $.ajax({
                        type: "GET",
                        url: "../api/CalculoMermas/ObtenerFormulasCalculo?id=0",
                        dataType: 'json'
                    }).done(function (res) {
                        self.formulas = res || [];
                        self.formulaDropdownData = self.formulas.map(function (f) {
                            return { value: Number(f.IdFormula), text: f.Descripcion || String(f.IdFormula) };
                        });

                        window.getFormulaText = function (id) {
                            if (id === null || typeof id === 'undefined' || id === '') return "";
                            var idNum = Number(id);
                            var found = (self.formulas || []).find(function (x) { return Number(x.IdFormula) === idNum; });
                            return found ? (found.Descripcion || String(id)) : String(id);
                        };

                        resolve();

                    }).fail(function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), '/api/CalculoMermas/ObtenerFormulasCalculo', 4000);
                        reject(e);
                    });
                });
            },
            obtenerZonasCalculoExtracto: function () {
                var self = this;

                return new Promise(function (resolve, reject) {
                    $.ajax({
                        type: "GET",
                        url: "../api/CalculoMermas/ObtenerZonasCalculoExtracto?id=0",
                        dataType: 'json'
                    }).done(function (res) {
                        self.zonas = res || [];
                        self.zonaDropdownData = self.zonas.map(function (z) {
                            return { value: Number(z.IdZona), text: z.Descripcion || String(z.IdZona) };
                        });

                        window.getZonaText = function (idOrText) {
                            if (idOrText === null || typeof idOrText === 'undefined' || idOrText === '') return "";
                            var idNum = Number(idOrText);
                            if (!isNaN(idNum) && idNum !== 0) {
                                var found = (self.zonas || []).find(function (x) { return Number(x.IdZona) === idNum; });
                                if (found) return found.Descripcion || String(idOrText);
                            }
                            return String(idOrText);
                        };

                        resolve();
                    }).fail(function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), '/api/CalculoMermas/ObtenerZonasCalculoExtracto', 4000);
                        reject(e);
                    });
                });
            },

            getDataSource: function () {
                var self = this;

                self.dsConfExtraccion = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: function (operation) {
                            $.ajax({
                                type: "GET",
                                url: "../api/CalculoMermas/ObtenerConfiguracionExtraccionDatosMermas",
                                dataType: "json",
                                data: { zona: 0, tipo: "" }
                            }).done(function (response) {
                                var data = Array.isArray(response) ? response : [];
                                // Enriquecer cada fila 
                                var enriched = data.map(function (item) {

                                    // Codigo JDE
                                    var idMat = item.CodigoJDE != null ? String(item.CodigoJDE) : "";
                                    var descMat = self.materialMap && idMat ? (self.materialMap[idMat] || "") : "";

                                    var idZona = item.Zona != null ? String(item.Zona) : "";
                                    // Zonas
                                    var descZona = "";
                                    if (self.zonaDropdownData && self.zonaDropdownData.length) {
                                        var z = self.zonaDropdownData.find(function (r) { return String(r.value) === idZona; });
                                        descZona = z ? (z.text || "") : "";
                                    }

                                    var idFormula = item.FormulaCalculoExtracto != null ? String(item.FormulaCalculoExtracto) : "";
                                    // formulas
                                    var descFormula = "";
                                    if (self.formulas && self.formulas.length) {
                                        var f = self.formulas.find(function (r) { return String(r.IdFormula) === idFormula; });
                                        descFormula = f ? (f.Descripcion || "") : "";
                                    }

                                    return Object.assign({}, item, {
                                        DescripcionMaterial: descMat,
                                        DescripcionZona: descZona,
                                        DescripcionFormula: descFormula
                                    });
                                });
                                operation.success(enriched);
                            }).fail(function (e) {
                                operation.error(e);
                            });
                        }
                    },
                    schema: {
                        model: {
                            id: "IdMermasConfigExtraccionDatosMermas",
                            fields: {
                                IdMermasConfigExtraccionDatosMermas: { type: "number", editable: false },
                                Zona: { type: "number", editable: true },
                                DescripcionZona: { type: "string", editable: false },
                                Tipo: { type: "string", editable: true },
                                CodigoJDE: { type: "string", editable: true },
                                DescripcionMaterial: { type: "string", editable: false },
                                IdClaseMaterialOrigen: { type: "string", editable: true },
                                ProcesoOrigen: { type: "string", editable: true },
                                UbicacionOrigen: { type: "string", editable: true },
                                IdClaseMaterialDestino: { type: "string", editable: true },
                                ProcesoDestino: { type: "string", editable: true },
                                UbicacionDestino: { type: "string", editable: true },
                                FormulaCalculoExtracto: { type: "number", editable: true },
                                DescripcionFormula: { type: "string", editable: false },
                                Creado: { type: "date", editable: false },
                                CreadoPor: { type: "string", editable: false },
                                Actualizado: { type: "date", editable: false },
                                ActualizadoPor: { type: "string", editable: false }
                            }
                        }
                    },
                    error: function (e) {}
                });
            },

            render: function () {
                var self = this;

                DestruirKendoWidgets(self);

                var ExtGrid = window.app.cfgKendo.extGridToolbarColumnMenu;
                kendo.ui.plugin(ExtGrid);

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                self.grid = this.$("#gridConfExtraccion").kendoExtGrid({
                    autoBind: false,
                    dataSource: self.dsConfExtraccion,
                    groupable: {
                        messages: {
                            empty: window.app.idioma.t('ARRASTRAR_SOLTAR')
                        }
                    },
                    sortable: true,
                    resizable: true,
                    editable: "inline",
                    selectable: false,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    excel: util.ui.default.gridExcelDate('CAPTURA_MOVIMIENTOS'),
                    excelExport: async function (e) {
                        ExcelGridExtra(e, util);
                    },
                    noRecords: {
                        template: window.app.idioma.t("SIN_RESULTADOS")
                    },
                    columns: [
                        {
                            headerTemplate: "",
                            template: "<input type='checkbox' class='chk-select-config' data-id='#=IdMermasConfigExtraccionDatosMermas#' />",
                            width: 40,
                            attributes: { style: 'text-align:center;' },
                            filterable: false,
                            sortable: false
                        },
                        {
                            hidden: true,
                            field: 'IdMermasConfigExtraccionDatosMermas',
                            title: 'IdMermasConfigExtraccionDatosMermas',
                            width: 60
                        },
                        {
                            title: '',
                            attributes: { "align": "center" },
                            width: 100,
                            command: [
                                {
                                    name: "edit",
                                    text: {
                                        edit: window.app.idioma.t("EDITAR"),
                                        update: window.app.idioma.t("ACTUALIZAR"),
                                        cancel: window.app.idioma.t("CANCELAR")
                                    },
                                    click: function (e) {
                                        var permiso = TienePermiso(446);
                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            var grid = $("#gridConfExtraccion").data("kendoExtGrid");
                                            if (grid) grid.cancelChanges();
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            field: "Zona",
                            title: window.app.idioma.t("ZONA"),
                            width: 180,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px;height:14px;margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    return "<div><label>" +
                                        "<input type='checkbox' value='#= Zona #' style='width:14px;height:14px;margin-right:5px;'/>" +
                                        "#= String(DescripcionZona || '') #" +
                                        "</label></div>";
                                }
                            },
                            template: function (dataItem) {
                                var desc = dataItem.DescripcionZona || "";
                                return kendo.htmlEncode(desc);
                            },
                            editor: function (container, options) {
                                var input = $('<input name="' + options.field + '"/>').appendTo(container);
                                try {
                                    // Combo
                                    input.kendoDropDownList({
                                        dataTextField: "text",
                                        dataValueField: "value",
                                        dataSource: self.zonaDropdownData || [],
                                        valuePrimitive: true,
                                        optionLabel: window.app.idioma.t('SELECCIONE'),
                                        change: function (e) {
                                            var id = e.sender.value();
                                            var z = (self.zonaDropdownData || []).find(function (r) { return String(r.value) === String(id); });
                                            options.model.set("DescripcionZona", z ? (z.text || "") : "");
                                        }
                                    });
                                } catch (ex) {
                                    input.addClass("k-textbox").css("width", "100%");
                                }
                            }
                        },
                        {
                            field: "Tipo",
                            title: window.app.idioma.t("TIPO"),
                            width: 80,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px;height:14px;margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    return "<div><label><input type='checkbox' value='#=Tipo#' style='width:14px;height:14px;margin-right:5px;'/>#= Tipo#</label></div>";
                                }
                            },
                            attributes: { style: 'text-align:center;' },
                            editor: function (container, options) {
                                var input = $('<input name="' + options.field + '"/>').appendTo(container);
                                try {
                                    input.kendoDropDownList({
                                        dataTextField: "text",
                                        dataValueField: "value",
                                        dataSource: self.entradaOptions,
                                        valuePrimitive: true
                                    });
                                } catch (ex) {
                                    input.addClass("k-textbox").css("width", "100%");
                                }
                            },
                            template: function (dataItem) {
                                return dataItem.Tipo ? kendo.htmlEncode(dataItem.Tipo) : "";
                            }
                        },
                        {
                            field: "CodigoJDE",
                            title: window.app.idioma.t("CODIGO_JDE"),
                            width: 260,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px;height:14px;margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    return "<div><label>" +
                                        "<input type='checkbox' value='#= CodigoJDE #' style='width:14px;height:14px;margin-right:5px;'/>" +
                                        "#= String(CodigoJDE || '') # - #= String(DescripcionMaterial || '') #" +
                                        "</label></div>";
                                }
                            },
                            template: function (dataItem) {
                                var id = dataItem.CodigoJDE != null ? String(dataItem.CodigoJDE) : "";
                                var desc = dataItem.DescripcionMaterial != null ? String(dataItem.DescripcionMaterial) : "";
                                return desc ? kendo.htmlEncode(id + " - " + desc) : kendo.htmlEncode(id);
                            },
                            editor: function (container, options) {
                                var selfView = self;
                                var input = $('<input name="' + options.field + '"/>').appendTo(container);
                                try {
                                     // Combo
                                    input.kendoDropDownList({
                                        autoBind: true,
                                        optionLabel: window.app.idioma.t("SELECCIONE_UNO"),
                                        dataSource: new kendo.data.DataSource({
                                            data: selfView.materiales || [],
                                            sort: { field: "DescripcionCompleta", dir: "asc" }
                                        }),
                                        filter: "contains",
                                        valuePrimitive: true,
                                        dataTextField: "DescripcionCompleta",
                                        dataValueField: "IdMaterial",
                                        open: function (e) {
                                            // Ampliamos el combo al abrirlo
                                            var listContainer = e.sender.list.closest(".k-list-container");
                                            var anchorWidth = e.sender.wrapper.outerWidth();
                                            var desired = Math.round(anchorWidth * 1.5); // Tamaño del combo 
                                            listContainer.css({
                                                width: desired + kendo.support.scrollbar(),
                                                minWidth: desired + kendo.support.scrollbar()
                                            });
                                        },
                                        close: function (e) {
                                            // Volvemos al tamaño original del combo al cerrarlo
                                            var listContainer = e.sender.list.closest(".k-list-container");
                                            listContainer.css({ width: "", minWidth: "" });
                                        },
                                        change: function (e) {
                                            var id = String(e.sender.value() || "");
                                            var desc = selfView.materialMap && id ? (selfView.materialMap[id] || "") : "";
                                            options.model.set("DescripcionMaterial", desc);
                                        }
                                    });
                                } catch (ex) {
                                    input.addClass("k-textbox").css("width", "100%");
                                }
                            }
                        },
                        {
                            field: "IdClaseMaterialOrigen",
                            title: "IdClaseMaterialOrigen",
                            width: 110,
                            attributes: { style: 'white-space: nowrap ', class: 'addTooltip' },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px;height:14px;margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    return "<div><label><input type='checkbox' value='#=IdClaseMaterialOrigen#' style='width:14px;height:14px;margin-right:5px;'/>#= IdClaseMaterialOrigen#</label></div>";
                                }
                            }
                        },
                        {
                            field: "ProcesoOrigen",
                            title: window.app.idioma.t("PROCESO_ORIGEN"),
                            width: 100,
                            attributes: { style: 'white-space: nowrap ', class: 'addTooltip' },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px;height:14px;margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    return "<div><label><input type='checkbox' value='#=ProcesoOrigen#' style='width:14px;height:14px;margin-right:5px;'/>#= ProcesoOrigen#</label></div>";
                                }
                            }
                        },
                        {
                            field: "UbicacionOrigen",
                            title: window.app.idioma.t("UBICACION_ORIGEN"),
                            width: 110,
                            attributes: { style: 'white-space: nowrap ', class: 'addTooltip' },
                            filterable: true
                        },
                        {
                            field: "IdClaseMaterialDestino",
                            title: window.app.idioma.t("CLASE_MATERIAL_DESTINO"),
                            width: 110,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px;height:14px;margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    return "<div><label><input type='checkbox' value='#=IdClaseMaterialDestino#' style='width:14px;height:14px;margin-right:5px;'/>#= IdClaseMaterialDestino#</label></div>";
                                }
                            }
                        },
                        {
                            field: "ProcesoDestino",
                            title: window.app.idioma.t("PROCESO_DESTINO"),
                            width: 100,
                            attributes: { style: 'white-space: nowrap ', class: 'addTooltip' },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px;height:14px;margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    return "<div><label><input type='checkbox' value='#=ProcesoDestino#' style='width:14px;height:14px;margin-right:5px;'/>#= ProcesoDestino#</label></div>";
                                }
                            }
                        },
                        {
                            field: "UbicacionDestino",
                            title: window.app.idioma.t("UBICACION_DESTINO"),
                            width: 110,
                            filterable: true
                        },
                        {
                            field: "FormulaCalculoExtracto",
                            title: window.app.idioma.t("FORMULA_CALCULO_EXTRACTO"),
                            width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px;height:14px;margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    return "<div><label>" +
                                        "<input type='checkbox' value='#= FormulaCalculoExtracto #' style='width:14px;height:14px;margin-right:5px;'/>" +
                                        "#= String(DescripcionFormula || '') #" +
                                        "</label></div>";
                                }
                            },
                            attributes: { style: 'text-align:center;' },
                            template: function (dataItem) {
                                var desc = dataItem.DescripcionFormula || "";
                                return kendo.htmlEncode(desc);
                            },
                            editor: function (container, options) {
                                var input = $('<input name="' + options.field + '"/>').appendTo(container);
                                try {
                                    // Combo
                                    input.kendoDropDownList({
                                        dataTextField: "text",
                                        dataValueField: "value",
                                        dataSource: (self.formulaDropdownData && self.formulaDropdownData.length) ? self.formulaDropdownData : [],
                                        valuePrimitive: true,
                                        optionLabel: window.app.idioma.t('SELECCIONE'),
                                        change: function (e) {
                                            var id = e.sender.value();
                                            var f = (self.formulas || []).find(function (r) { return String(r.IdFormula) === String(id); });
                                            options.model.set("DescripcionFormula", f ? (f.Descripcion || "") : "");
                                        }
                                    });
                                } catch (ex) {
                                    input.addClass("k-textbox").css("width", "100%");
                                }
                            }
                        },
                        {
                            field: "Creado",
                            title: window.app.idioma.t("CREADO"),
                            width: 140,
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.Creado ? GetDateForExcel(value.Creado) : '' #",
                                width: 150
                            },
                            template: "#= Creado ? kendo.toString(Creado, kendo.culture().calendars.standard.patterns.MES_FechaHora) : '' #",
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            hidden: true,
                            field: "CreadoPor",
                            title: window.app.idioma.t("CREADO_POR"),
                            width: 120
                        },
                        {
                            hidden: true,
                            field: "Actualizado",
                            title: window.app.idioma.t("ACTUALIZADO"),
                            width: 160,
                            _excelOptions: {
                                format: "dd/mm/yyyy hh:mm:ss",
                                template: "#= value.Actualizado ? GetDateForExcel(value.Actualizado) : '' #",
                                width: 150
                            },
                            template: "#= Actualizado ? kendo.toString(Actualizado, kendo.culture().calendars.standard.patterns.MES_FechaHora) : '' #",
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            hidden: true,
                            field: "ActualizadoPor",
                            title: window.app.idioma.t("ACTUALIZADO_POR"),
                            width: 140
                        }
                    ],
                    dataBinding: self.resizeGrid,
                    dataBound: function (e) {
                        // limpiar checkboxes 
                        try {
                            $("#gridConfExtraccion").find(".chk-select-config").prop("checked", false);
                        } catch (ignore) { }
                    },

                    save: function (e) {
                        var view = self;
                        var gridWidget = this;

                        e.preventDefault();

                        var model = e.model;

                        var dto = {
                            IdMermasConfigExtraccionDatosMermas: model.IdMermasConfigExtraccionDatosMermas,
                            Zona: model.Zona, 
                            Tipo: model.Tipo,
                            CodigoJDE: model.CodigoJDE,
                            IdClaseMaterialOrigen: model.IdClaseMaterialOrigen,
                            ProcesoOrigen: model.ProcesoOrigen,
                            UbicacionOrigen: model.UbicacionOrigen,
                            IdClaseMaterialDestino: model.IdClaseMaterialDestino,
                            ProcesoDestino: model.ProcesoDestino,
                            UbicacionDestino: model.UbicacionDestino,
                            FormulaCalculoExtracto: model.FormulaCalculoExtracto,
                            ActualizadoPor: (window.app && window.app.usuario && window.app.usuario.login) ? window.app.usuario.login : ""
                        };

                        try { kendo.ui.progress(gridWidget.element, true); } catch (ex) { /**/ }

                        view.actualizarConfiguracion(dto)
                            .done(function () {
                                try { gridWidget.dataSource.read(); } catch (ex) { console.warn(ex); }
                            })
                            .fail(function () {
                                try { gridWidget.dataSource.read(); } catch (ex) { console.warn(ex); }
                            })
                            .always(function () {
                                try { kendo.ui.progress(gridWidget.element, false); } catch (ex) { /**/ }
                            });
                    }

                }).data("kendoExtGrid");

                if (self.grid) {
                    window.app.headerGridTooltip(self.grid);
                }

                // cargar todos los registros al iniciar
                self.dsConfExtraccion.read();

                self.resizeGrid();
            },
            getZonaDescripcion: function (id) {
                try {
                    var list = this.zonaDropdownData || [];
                    for (var i = 0; i < list.length; i++) {
                        if (String(list[i].value) === String(id)) {
                            return list[i].text || "";
                        }
                    }
                    // Fallback por si no está en la maestra
                    return (typeof window.getZonaText === "function") ? (window.getZonaText(id) || "") : (id != null ? String(id) : "");
                } catch (ex) {
                    return id != null ? String(id) : "";
                }
            },
            actualizarConfiguracion: function (dto) {
                if (!dto || typeof dto !== 'object') {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACT_DATOS'), 4000);
                    return $.Deferred().reject({ message: 'Invalid DTO' }).promise();
                }

                return $.ajax({
                    url: "../api/CalculoMermas/ActualizarConfiguracionExtraccionDatosMermas",
                    type: "PUT",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: kendo.stringify(dto)
                })
                    .done(function (res) {
                        if (res === true) {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ACTUALIZANDO_OK'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACT_DATOS'), 4000);
                        }
                    })
                    .fail(function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ACT_DATOS'), 4000);
                        }
                    })
                    .always(function () {
                        Backbone.trigger('eventCierraDialogo');
                    });
            },

            crearConfiguracion: function (data) {
                if (!data || typeof data !== 'object') {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OPERACION'), 4000);
                    return $.Deferred().reject({ message: 'Invalid data' }).promise();
                }

                return $.ajax({
                    type: "POST",
                    url: "../api/CalculoMermas/CrearConfiguracionExtraccionDatosMermas",
                    data: JSON.stringify(data),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                })
                    .done(function (res) {
                        var ok = false;
                        if (typeof res === "boolean") ok = res;
                        else if (res && typeof res.Data !== "undefined") ok = !!res.Data;
                        else ok = !!res;

                        if (ok) {
                            $('#gridConfExtraccion').data('kendoExtGrid').dataSource.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ACTUALIZANDO_OK'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), 'CrearConfiguracionExtraccionDatosMermas', 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    })
                    .fail(function (err) {
                        var resp = null;
                        if (err && typeof err.responseJSON !== 'undefined') resp = err.responseJSON;
                        else if (err && err.responseText) {
                            try { resp = JSON.parse(err.responseText); } catch (ignore) { resp = err.responseText; }
                        }

                        if (err && err.status === 403 && resp === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), 'CrearConfiguracionExtraccionDatosMermas', 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    });
            },

            events: {
                'click #btnExportarExcel': 'exportarExcel',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnEliminar': 'confirmarEliminar',
                'click #btnCrear': 'crearRegistro'
            },

            exportarExcel: function () {
                var grid = this.grid || $("#gridConfExtraccion").data("kendoExtGrid");
                if (!grid) return;
                grid.saveAsExcel();
            },

            LimpiarFiltroGrid: function () {
                const self = this;

                self.dsConfExtraccion.query({
                    group: [],
                    filter: [],
                    page: 1
                });
            },

            crearRegistro: function () {
                const self = this;
                const permiso = TienePermiso(446);
                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var win = $("<div/>").kendoWindow({
                    title: window.app.idioma.t("CREAR") + ' ' + window.app.idioma.t("CONFIGURACION"),
                    modal: true,
                    resizable: false,
                    width: "820px",
                    close: function () { this.destroy(); }
                }).data("kendoWindow");

                var templateHtml = $("#templateCrearRegistro").html() || "";
                var tpl = _.template(templateHtml);
                win.content(tpl());
                win.center().open();

                var $win = win.element;

                // inicializar textboxes 
                function initTextBox($el) {
                    if (!$el || $el.length === 0) return;
                    try {
                        if ($.fn.kendoTextBox) {
                            $el.kendoTextBox();
                            return;
                        }
                    } catch (e) { /**/ }
                    $el.addClass("k-textbox").css("width", "100%");
                }

                // zona dropdown (usa zonaDropdownData)
                (function () {
                    var $el = $win.find("#nuevoZonaId");
                    if ($el && $el.length) {
                        try {
                            if ($.fn.kendoDropDownList) {
                                var dataForDrop = self.zonaDropdownData && self.zonaDropdownData.length ? self.zonaDropdownData : [];
                                $el.kendoDropDownList({
                                    dataTextField: "text",
                                    dataValueField: "value",
                                    dataSource: dataForDrop,
                                    valuePrimitive: true,
                                    optionLabel: window.app.idioma.t('SELECCIONE')
                                });
                            } else {
                                $el.addClass("k-textbox").css("width", "100%");
                            }
                        } catch (e) {
                            $el.addClass("k-textbox").css("width", "100%");
                        }
                    }
                })();

                // DataSource todos los materiales
                var dsMaterialLocal = new kendo.data.DataSource({
                    data: self.materiales || [],
                    sort: { field: "DescripcionCompleta", dir: "asc" }
                });

                (function () {
                    var $jde = $win.find("#nuevoCodigoJDE");
                    if ($jde && $jde.length) {
                        $jde.kendoDropDownList({
                            autoBind: true,
                            optionLabel: window.app.idioma.t("SELECCIONE_UNO"),
                            dataSource: dsMaterialLocal,
                            filter: "contains",
                            dataTextField: "DescripcionCompleta",
                            dataValueField: "IdMaterial",
                            open: function (e) {
                                var listContainer = e.sender.list.closest(".k-list-container");
                                var anchorWidth = e.sender.wrapper.outerWidth();
                                var desired = Math.round(anchorWidth * 2);
                                listContainer.css({
                                    width: desired + kendo.support.scrollbar(),
                                    minWidth: desired + kendo.support.scrollbar()
                                });
                            },
                            close: function (e) {
                                var listContainer = e.sender.list.closest(".k-list-container");
                                listContainer.css({ width: "", minWidth: "" });
                            }
                        });
                    }
                })();

                initTextBox($win.find("#nuevoCodigoJDE"));
                initTextBox($win.find("#nuevoIdClaseMaterialOrigen"));
                initTextBox($win.find("#nuevoProcesoOrigen"));
                initTextBox($win.find("#nuevoUbicacionOrigen"));
                initTextBox($win.find("#nuevoIdClaseMaterialDestino"));
                initTextBox($win.find("#nuevoProcesoDestino"));
                initTextBox($win.find("#nuevoUbicacionDestino"));

                // Tipo dropdown (Entrada/Salida)
                (function () {
                    var $el = $win.find("#nuevoTipo");
                    if ($el && $el.length) {
                        try {
                            if ($.fn.kendoDropDownList) {
                                $el.kendoDropDownList({
                                    dataTextField: "text",
                                    dataValueField: "value",
                                    dataSource: self.entradaOptions,
                                    valuePrimitive: true,
                                    optionLabel: window.app.idioma.t('SELECCIONE')
                                });
                            } else {
                                $el.addClass("k-textbox").css("width", "100%");
                            }
                        } catch (e) {
                            $el.addClass("k-textbox").css("width", "100%");
                        }
                    }
                })();

                // Inicializar dropDownList para formula usando las fórmulas cargadas
                (function () {
                    var $el = $win.find("#nuevoFormulaCalculoExtracto");
                    if ($el && $el.length) {
                        try {
                            if ($.fn.kendoDropDownList) {
                                var dataForDrop = self.formulaDropdownData && self.formulaDropdownData.length ? self.formulaDropdownData : [];

                                $el.kendoDropDownList({
                                    dataTextField: "text",
                                    dataValueField: "value",
                                    dataSource: dataForDrop,
                                    valuePrimitive: true,
                                    optionLabel: window.app.idioma.t('SELECCIONE')
                                });
                            } else {
                                $el.addClass("k-textbox").css("width", "100%");
                            }
                        } catch (e) {
                            $el.addClass("k-textbox").css("width", "100%");
                        }
                    }
                })();

                $win.find("#btnCrearAceptar").on("click", function () {
                    // obtener y normalizar valores
                    const nuevoZonaId = ($win.find("#nuevoZonaId").data("kendoDropDownList") ? $win.find("#nuevoZonaId").data("kendoDropDownList").value() : ($win.find("#nuevoZonaId").val() || "")).toString().trim();
                    const nuevoIdClaseMaterialOrigen = ($win.find("#nuevoIdClaseMaterialOrigen").val() || "").toString().trim();
                    const nuevoProcesoOrigen = ($win.find("#nuevoProcesoOrigen").val() || "").toString().trim();
                    const nuevoUbicacionOrigen = ($win.find("#nuevoUbicacionOrigen").val() || "").toString().trim();
                    const nuevoIdClaseMaterialDestino = ($win.find("#nuevoIdClaseMaterialDestino").val() || "").toString().trim();
                    const nuevoProcesoDestino = ($win.find("#nuevoProcesoDestino").val() || "").toString().trim();
                    const nuevoUbicacionDestino = ($win.find("#nuevoUbicacionDestino").val() || "").toString().trim();

                    // Tipo value
                    var tipoWidget = $win.find("#nuevoTipo").data("kendoDropDownList");
                    const tipoRaw = (tipoWidget ? tipoWidget.value() : ($win.find("#nuevoTipo").val() || "")).toString().trim();

                    // formula
                    var formulaWidget = $win.find("#nuevoFormulaCalculoExtracto").data("kendoDropDownList");
                    const formulaRaw = (formulaWidget ? formulaWidget.value() : ($win.find("#nuevoFormulaCalculoExtracto").val() || "")).toString().trim();

                    const nuevoCodigoJDE = ($win.find("#nuevoCodigoJDE").data("kendoDropDownList")
                        ? $win.find("#nuevoCodigoJDE").data("kendoDropDownList").value()
                        : ($win.find("#nuevoCodigoJDE").val() || "")).toString().trim();

                    const required = [
                        { value: nuevoZonaId, label: window.app.idioma.t("ZONA"), selector: "#nuevoZonaId" },
                        { value: tipoRaw, label: window.app.idioma.t("TIPO"), selector: "#nuevoTipo" },
                        { value: formulaRaw, label: window.app.idioma.t("FORMULA_CALCULO_EXTRACTO"), selector: "#nuevoFormulaCalculoExtracto" }
                    ];

                    // comprobar campos vacíos
                    const missing = required.filter(function (f) { return !f.value; });
                    if (missing.length > 0) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('CAMPOS_OBLIGATORIOS'), 4000);
                        try {
                            var sel = missing[0].selector;
                            var $first = $win.find(sel);
                            if ($first && $first.length) $first.focus();
                        } catch (ignore) { /**/ }
                        return;
                    }

                    const dto = {
                        Zona: parseInt(nuevoZonaId, 10),
                        Tipo: tipoRaw,
                        CodigoJDE: nuevoCodigoJDE,
                        IdClaseMaterialOrigen: nuevoIdClaseMaterialOrigen,
                        ProcesoOrigen: nuevoProcesoOrigen,
                        UbicacionOrigen: nuevoUbicacionOrigen,
                        IdClaseMaterialDestino: nuevoIdClaseMaterialDestino,
                        ProcesoDestino: nuevoProcesoDestino,
                        UbicacionDestino: nuevoUbicacionDestino,
                        FormulaCalculoExtracto: formulaRaw ? parseInt(formulaRaw, 10) : null
                    };

                    win.close();

                    // enviar sólo si todo correcto
                    self.crearConfiguracion(dto);
                });
                $win.find("#btnCrearCancelar").on("click", function () {
                    win.close();
                });
            },

            confirmarEliminar: function () {
                var self = this;
                var permiso = TienePermiso(446);
                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                // obtener checkboxes marcados
                var $checked = $("#gridConfExtraccion").find(".chk-select-config:checked");
                if (!$checked || $checked.length === 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR_UN_REGISTRO'), 4000);
                    return;
                }

                if ($checked.length > 1) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_ELEGIR_SOLO_UN_REGISTRO'), 4000);
                    return;
                }

                var id = Number($checked.first().data("id"));
                var grid = $("#gridConfExtraccion").data("kendoExtGrid") || $("#gridConfExtraccion").data("kendoGrid");
                var dataItem = null;
                try {
                    dataItem = grid.dataSource.get(id);
                } catch (ex) {
                    // fallback: buscar manualmente en el array de data
                    var dsdata = grid.dataSource.data() || [];
                    for (var i = 0; i < dsdata.length; i++) {
                        if (Number(dsdata[i].IdMermasConfigExtraccionDatosMermas) === id) {
                            dataItem = dsdata[i];
                            break;
                        }
                    }
                }

                if (!dataItem) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ELIMINAR_REGISTROS'), 3000);
                    return;
                }

                self.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t("ELIMINAR"),
                    msg: window.app.idioma.t("CONFIRMAR_ACCION_CANTIDAD")
                        .replace("$num", 1)
                        .replace("$accion", window.app.idioma.t("ELIMINAR"))
                        .replace("$tipo", window.app.idioma.t("REGISTRO")),
                    funcion: function () {
                        self.eliminarConfiguracion(dataItem);
                    },
                    contexto: self
                });
            },

            eliminarConfiguracion: function (dto) {
                if (!dto || typeof dto !== 'object') {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR_UN_REGISTRO'), 4000);
                    return;
                }

                $.ajax({
                    type: "DELETE",
                    url: "../api/CalculoMermas/EliminarConfiguracionExtraccionDatosMermas",
                    data: JSON.stringify(dto),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        var ok = false;
                        if (typeof res === "boolean") ok = res;
                        else if (res && typeof res.Data !== "undefined") ok = !!res.Data;
                        else ok = !!res;

                        if (ok) {
                            var grid = $('#gridConfExtraccion').data('kendoExtGrid') || $('#gridConfExtraccion').data('kendoGrid');
                            if (grid && grid.dataSource) grid.dataSource.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_OPERACION_SE'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ELIMINAR_REGISTROS'), 3000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (response) {
                        if (response.status === 403) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ELIMINAR_REGISTROS'), 3000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            eliminar: function () {
                this.remove();
                this.off();
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridConfExtraccion"),
                    dataArea = gridElement.find(".k-grid-content"),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            }
        });

        return VistaConfExtraccion;
    });