define(['underscore', 'backbone', 'jquery', 'text!../../../Mermas/html/MermasCapturaExistencias.html', 'vistas/vDialogoConfirm',
    'compartido/notificaciones', 'jszip', '../../../../Portal/js/constantes', 'compartido/util'],
    function (_, Backbone, $, Plantilla, VistaDlgConfirm, Not, JSZip, enums, util) {
        var VistaConfExistencias = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            grid: null,
            template: _.template(Plantilla),
            zonas: [],
            zonaDropdownData: [],
            formulas: [],
            formulaDropdownData: [],

            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                var splitter = $("#vertical").data("kendoSplitter");
                if (splitter) splitter.bind("resize", self.resizeGrid);

                Promise.all([
                    self.obtenerZonasCalculoExistencias(),
                    self.obtenerFormulasCalculo()
                ])
                    .catch(function () { })
                    .finally(function () {
                        self.getDataSource();
                        self.render();
                    });
            },

            obtenerZonasCalculoExistencias: function () {
                var self = this;
                return new Promise(function (resolve, reject) {
                    $.ajax({
                        type: "GET",
                        url: "../api/CalculoMermas/ObtenerZonasCalculoExistencias?id=0",
                        dataType: 'json'
                    }).done(function (res) {
                        self.zonas = res || [];
                        self.zonaDropdownData = self.zonas.map(function (z) {
                            return { value: Number(z.IdZona), text: z.Descripcion || String(z.IdZona) };
                        });
                        resolve();
                    }).fail(function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), '/api/CalculoMermas/ObtenerZonasCalculoExistencias', 4000);
                        reject(e);
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
                        resolve();
                    }).fail(function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), '/api/CalculoMermas/ObtenerFormulasCalculo', 4000);
                        reject(e);
                    });
                });
            },

            getDataSource: function () {
                var self = this;

                self.dsConfExistencias = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: function (operation) {
                            $.ajax({
                                type: "GET",
                                url: "../api/CalculoMermas/ObtenerConfiguracionCalculoExistencias",
                                dataType: "json",
                                data: { zona: 0 }, 
                                cache: false
                            }).done(function (response) {
                                var data = Array.isArray(response) ? response : [];
                                // Enriquecer con descripciones 
                                var enriched = data.map(function (item) {
                                    var idZona = item.Zona != null ? Number(item.Zona) : null;
                                    var descZona = "";
                                    if (idZona != null) {
                                        var z = (self.zonaDropdownData || []).find(function (r) { return Number(r.value) === idZona; });
                                        descZona = z ? (z.text || "") : "";
                                    }
                                    var idMetodo = item.MetodoCalculo != null ? Number(item.MetodoCalculo) : null;
                                    var descMetodo = "";
                                    if (idMetodo != null) {
                                        var f = (self.formulas || []).find(function (r) { return Number(r.IdFormula) === idMetodo; });
                                        descMetodo = f ? (f.Descripcion || "") : "";
                                    }
                                    return Object.assign({}, item, {
                                        DescripcionZona: descZona,
                                        DescripcionMetodo: descMetodo
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
                            id: "IdMermasConfigCalcExistencias",
                            fields: {
                                IdMermasConfigCalcExistencias: { type: "number", editable: false },
                                Zona: { type: "number", editable: true },
                                DescripcionZona: { type: "string", editable: false },
                                Ubicacion: { type: "string", editable: true },
                                MetodoCalculo: { type: "number", editable: true },
                                DescripcionMetodo: { type: "string", editable: false },

                                Creado: { type: "date", editable: false },
                                CreadoPor: { type: "string", editable: false },
                                Actualizado: { type: "date", editable: false },
                                ActualizadoPor: { type: "string", editable: false }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.status === 403 && e.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER') + ' ObtenerConfiguracionCalculoExistencias', 4000);
                        }
                    }
                });
            },

            render: function () {
                var self = this;

                DestruirKendoWidgets(self);

                var ExtGrid = window.app.cfgKendo.extGridToolbarColumnMenu;
                kendo.ui.plugin(ExtGrid);

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                self.grid = this.$("#gridConfExistencias").kendoExtGrid({
                    autoBind: false,
                    dataSource: self.dsConfExistencias,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_SOLTAR') } },
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
                    excel: util.ui.default.gridExcelDate('CAPTURA_EXISTENCIAS'),
                    excelExport: async function (e) { ExcelGridExtra(e, util); },
                    noRecords: { template: window.app.idioma.t("SIN_RESULTADOS") },

                    columns: [
                        {
                            headerTemplate: "",
                            template: "<input type='checkbox' class='chk-select-config' data-id='#=IdMermasConfigCalcExistencias#' />",
                            width: 40,
                            attributes: { style: 'text-align:center;' },
                            filterable: false,
                            sortable: false
                        },
                        { hidden: true, field: 'IdMermasConfigCalcExistencias', title: 'IdMermasConfigCalcExistencias', width: 60 },
                        {
                            //Columna de edición del registro
                            title: '',
                            attributes: { "align": "center" },
                            width: 60,
                            command: [
                                {
                                    name: "edit",
                                    text: {
                                        edit: window.app.idioma.t("EDITAR"),
                                        update: window.app.idioma.t("ACTUALIZAR"),
                                        cancel: window.app.idioma.t("CANCELAR")
                                    },
                                    click: function (e) {
                                        var permiso = TienePermiso(448);
                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            var grid = $("#gridConfExistencias").data("kendoExtGrid");
                                            if (grid) grid.cancelChanges();
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            field: "Zona",
                            title: window.app.idioma.t("ZONA"),
                            width: 160,
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
                                return kendo.htmlEncode(dataItem.DescripcionZona || "");
                            },
                            editor: function (container, options) {
                                var input = $('<input name="' + options.field + '"/>').appendTo(container);
                                try {
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
                            field: "Ubicacion",
                            title: window.app.idioma.t("UBICACION"),
                            width: 180,
                            attributes: { style: 'white-space: nowrap', class: 'addTooltip' },
                            filterable: true
                        },
                        {
                            field: "MetodoCalculo",
                            title: window.app.idioma.t("METODO_CALCULO"),
                            width: 180,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px;height:14px;margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    return "<div><label>" +
                                        "<input type='checkbox' value='#= MetodoCalculo #' style='width:14px;height:14px;margin-right:5px;'/>" +
                                        "#= String(DescripcionMetodo || '') #" +
                                        "</label></div>";
                                }
                            },
                            attributes: { style: 'text-align:center;' },
                            template: function (dataItem) {
                                return kendo.htmlEncode(dataItem.DescripcionMetodo || "");
                            },
                            editor: function (container, options) {
                                var input = $('<input name="' + options.field + '"/>').appendTo(container);
                                try {
                                    input.kendoDropDownList({
                                        dataTextField: "text",
                                        dataValueField: "value",
                                        dataSource: self.formulaDropdownData || [],
                                        valuePrimitive: true,
                                        optionLabel: window.app.idioma.t('SELECCIONE'),
                                        change: function (e) {
                                            var id = e.sender.value();
                                            var f = (self.formulas || []).find(function (r) { return String(r.IdFormula) === String(id); });
                                            options.model.set("DescripcionMetodo", f ? (f.Descripcion || "") : "");
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
                        { hidden: true, field: "CreadoPor", title: window.app.idioma.t("CREADO_POR"), width: 120 },
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
                        { hidden: true, field: "ActualizadoPor", title: window.app.idioma.t("ACTUALIZADO_POR"), width: 140 }
                    ],

                    dataBinding: self.resizeGrid,
                    dataBound: function () {
                        try { $("#gridConfExistencias").find(".chk-select-config").prop("checked", false); } catch (ignore) { }
                    },

                    save: function (e) {
                        var view = self;
                        var gridWidget = this;
                        e.preventDefault();

                        var model = e.model;
                        var dto = {
                            IdMermasConfigCalcExistencias: model.IdMermasConfigCalcExistencias,
                            Zona: model.Zona,
                            Ubicacion: model.Ubicacion,
                            MetodoCalculo: model.MetodoCalculo,
                            ActualizadoPor: (window.app && window.app.usuario && window.app.usuario.login) ? window.app.usuario.login : ""
                        };

                        try { kendo.ui.progress(gridWidget.element, true); } catch (ex) { /**/ }

                        view.actualizarConfiguracion(dto)
                            .done(function () { try { gridWidget.dataSource.read(); } catch (ex) { console.warn(ex); } })
                            .fail(function () { try { gridWidget.dataSource.read(); } catch (ex) { console.warn(ex); } })
                            .always(function () { try { kendo.ui.progress(gridWidget.element, false); } catch (ex) { /**/ } });
                    }
                }).data("kendoExtGrid");

                if (self.grid) {
                    window.app.headerGridTooltip(self.grid);
                }

                // cargar todos los registros al iniciar
                self.dsConfExistencias.read();
                self.resizeGrid();
            },

            actualizarConfiguracion: function (dto) {
                if (!dto || typeof dto !== 'object') {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACT_DATOS'), 4000);
                    return $.Deferred().reject({ message: 'Invalid DTO' }).promise();
                }

                return $.ajax({
                    url: "../api/CalculoMermas/ActualizarConfiguracionCalculoExistencias",
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
                    .always(function () { Backbone.trigger('eventCierraDialogo'); });
            },

            crearConfiguracion: function (data) {
                if (!data || typeof data !== 'object') {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OPERACION'), 4000);
                    return $.Deferred().reject({ message: 'Invalid data' }).promise();
                }

                return $.ajax({
                    type: "POST",
                    url: "../api/CalculoMermas/CrearConfiguracionCalculoExistencias",
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
                            $('#gridConfExistencias').data('kendoExtGrid').dataSource.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ACTUALIZANDO_OK'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), 'CrearConfiguracionCalculoExistencias', 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    })
                    .fail(function (err) {
                        var resp = null;
                        if (err && typeof err.responseJSON !== 'undefined') resp = err.responseJSON;
                        else if (err && err.responseText) { try { resp = JSON.parse(err.responseText); } catch (ignore) { resp = err.responseText; } }

                        if (err && err.status === 403 && resp === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), 'CrearConfiguracionCalculoExistencias', 4000);
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
                var grid = this.grid || $("#gridConfExistencias").data("kendoExtGrid");
                if (!grid) return;
                grid.saveAsExcel();
            },

            LimpiarFiltroGrid: function () {
                const self = this;
                self.dsConfExistencias.query({ group: [], filter: [], page: 1 });
            },

            crearRegistro: function () {
                const self = this;
                const permiso = TienePermiso(448);
                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var win = $("<div/>").kendoWindow({
                    title: window.app.idioma.t("CREAR") + ' ' + window.app.idioma.t("CONFIGURACION"),
                    modal: true,
                    resizable: false,
                    width: "660px",
                    close: function () { this.destroy(); }
                }).data("kendoWindow");

                var templateHtml = $("#templateCrearRegistroExistencias").html() || "";
                var tpl = _.template(templateHtml);
                win.content(tpl());
                win.center().open();

                var $win = win.element;

                function initTextBox($el) {
                    if (!$el || $el.length === 0) return;
                    try {
                        if ($.fn.kendoTextBox) { $el.kendoTextBox(); return; }
                    } catch (e) { /**/ }
                    $el.addClass("k-textbox").css("width", "100%");
                }

                // Textboxes
                initTextBox($win.find("#nuevoUbicacion"));

                // Zona combo 
                (function () {
                    var $el = $win.find("#nuevoZona");
                    if ($el && $el.length) {
                        try {
                            $el.kendoDropDownList({
                                dataTextField: "text",
                                dataValueField: "value",
                                dataSource: (self.zonaDropdownData || []),
                                valuePrimitive: true,
                                optionLabel: window.app.idioma.t('SELECCIONE')
                            });
                        } catch (e) {
                            $el.addClass("k-textbox").css("width", "100%");
                        }
                    }
                })();

                // Método de cálculo combo (fórmulas de existencias)
                (function () {
                    var $el = $win.find("#nuevoMetodoCalculo");
                    if ($el && $el.length) {
                        try {
                            $el.kendoDropDownList({
                                dataTextField: "text",
                                dataValueField: "value",
                                dataSource: (self.formulaDropdownData || []),
                                valuePrimitive: true,
                                optionLabel: window.app.idioma.t('SELECCIONE')
                            });
                        } catch (e) {
                            $el.addClass("k-textbox").css("width", "100%");
                        }
                    }
                })();

                // Botones
                $win.find("#btnCrearAceptar").on("click", function () {
                    const nuevoZona = ($win.find("#nuevoZona").data("kendoDropDownList")
                        ? $win.find("#nuevoZona").data("kendoDropDownList").value()
                        : ($win.find("#nuevoZona").val() || "")).toString().trim();

                    const nuevoUbicacion = ($win.find("#nuevoUbicacion").val() || "").toString().trim();

                    const metodoRaw = ($win.find("#nuevoMetodoCalculo").data("kendoDropDownList")
                        ? $win.find("#nuevoMetodoCalculo").data("kendoDropDownList").value()
                        : ($win.find("#nuevoMetodoCalculo").val() || "")).toString().trim();

                    const required = [
                        { value: nuevoZona, label: window.app.idioma.t("ZONA"), selector: "#nuevoZona" },
                        { value: nuevoUbicacion, label: window.app.idioma.t("UBICACION"), selector: "#nuevoUbicacion" },
                        { value: metodoRaw, label: window.app.idioma.t("METODO_CALCULO"), selector: "#nuevoMetodoCalculo" }
                    ];

                    const missing = required.filter(function (f) { return !f.value; });
                    if (missing.length > 0) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('CAMPOS_OBLIGATORIOS'), 4000);
                        try { var sel = missing[0].selector; var $first = $win.find(sel); if ($first && $first.length) $first.focus(); } catch (ignore) { }
                        return;
                    }

                    const dto = {
                        Zona: parseInt(nuevoZona, 10),
                        Ubicacion: nuevoUbicacion,
                        MetodoCalculo: metodoRaw ? parseInt(metodoRaw, 10) : null
                    };

                    win.close();
                    self.crearConfiguracion(dto);
                });

                $win.find("#btnCrearCancelar").on("click", function () { win.close(); });
            },

            confirmarEliminar: function () {
                var self = this;
                var permiso = TienePermiso(448);
                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var $checked = $("#gridConfExistencias").find(".chk-select-config:checked");
                if (!$checked || $checked.length === 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR_UN_REGISTRO'), 4000);
                    return;
                }
                if ($checked.length > 1) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_ELEGIR_SOLO_UN_REGISTRO'), 4000);
                    return;
                }

                var id = Number($checked.first().data("id"));
                var grid = $("#gridConfExistencias").data("kendoExtGrid") || $("#gridConfExistencias").data("kendoGrid");
                var dataItem = null;
                try {
                    dataItem = grid.dataSource.get(id);
                } catch (ex) {
                    var dsdata = grid.dataSource.data() || [];
                    for (var i = 0; i < dsdata.length; i++) {
                        if (Number(dsdata[i].IdMermasConfigCalcExistencias) === id) { dataItem = dsdata[i]; break; }
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
                    funcion: function () { self.eliminarConfiguracion(dataItem); },
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
                    url: "../api/CalculoMermas/EliminarConfiguracionCalculoExistencias",
                    data: JSON.stringify(dto),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        var ok = false;
                        if (typeof res === "boolean") ok = res;
                        else if (res && typeof res.Data !== "undefined") ok = !!res.Data;
                        else ok = !!res;

                        if (ok) {
                            var grid = $('#gridConfExistencias').data('kendoExtGrid') || $('#gridConfExistencias').data('kendoGrid');
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

                var gridElement = $("#gridConfExistencias"),
                    dataArea = gridElement.find(".k-grid-content"),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () { otherElementsHeight += $(this).outerHeight(); });

                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            }
        });

        return VistaConfExistencias;
    });