define([
    'underscore', 'backbone', 'jquery', 'text!../../../Mermas/html/MermasParametrosGenerales.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones',
    'jszip','../../../../Portal/js/constantes', 'compartido/util'
], function (_, Backbone, $, Plantilla, VistaDlgConfirm, Not, JSZip, enums, util) {

    var VistaParametrosGenerales = Backbone.View.extend({
        tagName: 'div',
        id: 'divHTMLContenido',
        grid: null,
        template: _.template(Plantilla),

        initialize: function () {
            var self = this;
            window.JSZip = JSZip;

            var splitter = $("#vertical").data("kendoSplitter");
            if (splitter) splitter.bind("resize", self.resizeGrid);

            self.getDataSource();
            self.render();
        },

        getDataSource: function () {
            var self = this;

            self.dsParametros = new kendo.data.DataSource({
                pageSize: 50,
                transport: {
                    read: function (operation) {
                        $.ajax({
                            type: "GET",
                            url: "../api/CalculoMermas/ObtenerParametrosGenerales", 
                            dataType: "json"
                        }).done(function (response) {
                            var data = Array.isArray(response) ? response : [];
                            operation.success(data);
                        }).fail(function (e) {
                            operation.error(e);
                        });
                    }
                },
                schema: {
                    model: {
                        id: "IdMermasConfigVarias",
                        fields: {
                            IdMermasConfigVarias: { type: "number", editable: false },
                            Nombre: { type: "string", editable: true },
                            Descripcion: { type: "string", editable: true },
                            Valor: { type: "string", editable: true },
                            Creado: { type: "date", editable: false },
                            CreadoPor: { type: "string", editable: false },
                            Actualizado: { type: "date", editable: false },
                            ActualizadoPor: { type: "string", editable: false }
                        }
                    }
                },
                error: function (e) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER') + ' ParametrosGenerales', 4000);
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

            self.grid = this.$("#gridParametrosGenerales").kendoExtGrid({
                autoBind: false,
                dataSource: self.dsParametros,
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
                excel: util.ui.default.gridExcelDate('PARAMETROS_GENERALES'),
                noRecords: { template: window.app.idioma.t("SIN_RESULTADOS") },

                columns: [
                    {
                        headerTemplate: "",
                        template: "<input type='checkbox' class='chk-select-parametro' data-id='#=IdMermasConfigVarias#' />",
                        width: 40,
                        attributes: { style: 'text-align:center;' },
                        filterable: false,
                        sortable: false
                    },
                    { hidden: true, field: 'IdMermasConfigVarias', title: 'Id', width: 60 },
                    {
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
                                    var permiso = TienePermiso(450);
                                    if (!permiso) {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                        var grid = $("#gridParametrosGenerales").data("kendoExtGrid");
                                        if (grid) grid.cancelChanges();
                                    }
                                }
                            }
                        ]
                    },
                    { field: "Nombre", title: window.app.idioma.t("NOMBRE"), width: 180, filterable: true },
                    { field: "Descripcion", title: window.app.idioma.t("DESCRIPCION"), width: 300, filterable: true },
                    { field: "Valor", title: window.app.idioma.t("VALOR"), width: 200, filterable: true },
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
                    { hidden: true, field: "Actualizado", title: window.app.idioma.t("ACTUALIZADO"), width: 160 },
                    { hidden: true, field: "ActualizadoPor", title: window.app.idioma.t("ACTUALIZADO_POR"), width: 140 }
                ],

                dataBinding: self.resizeGrid,
                dataBound: function () {
                    try { $("#gridParametrosGenerales").find(".chk-select-parametro").prop("checked", false); } catch (ignore) { }
                },

                save: function (e) {
                    var view = self;
                    var gridWidget = this;
                    e.preventDefault();

                    var model = e.model;
                    var dto = {
                        IdMermasConfigVarias: model.IdMermasConfigVarias,
                        Nombre: (model.Nombre || "").trim(),
                        Descripcion: (model.Descripcion || "").trim(),
                        Valor: (model.Valor || "").trim(),
                        ActualizadoPor: (window.app && window.app.usuario && window.app.usuario.login) ? window.app.usuario.login : ""
                    };

                    try { kendo.ui.progress(gridWidget.element, true); } catch (ex) { /**/ }

                    view.actualizarParametro(dto)
                        .done(function () { try { gridWidget.dataSource.read(); } catch (ex) { console.warn(ex); } })
                        .fail(function () { try { gridWidget.dataSource.read(); } catch (ex) { console.warn(ex); } })
                        .always(function () { try { kendo.ui.progress(gridWidget.element, false); } catch (ex) { /**/ } });
                }
            }).data("kendoExtGrid");

            if (self.grid) {
                window.app.headerGridTooltip(self.grid);
            }
            self.dsParametros.read();
            self.resizeGrid();
        },

        actualizarParametro: function (dto) {
            if (!dto || typeof dto !== 'object') {
                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACT_DATOS'), 4000);
                return $.Deferred().reject({ message: 'Invalid DTO' }).promise();
            }

            return $.ajax({
                url: "../api/CalculoMermas/ActualizarParametroGeneral",
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

        crearParametro: function (data) {
            if (!data || typeof data !== 'object') {
                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OPERACION'), 4000);
                return $.Deferred().reject({ message: 'Invalid data' }).promise();
            }

            return $.ajax({
                type: "POST",
                url: "../api/CalculoMermas/CrearParametroGeneral",
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
                        $('#gridParametrosGenerales').data('kendoExtGrid').dataSource.read();
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ACTUALIZANDO_OK'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), 'CrearParametroGeneral', 4000);
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
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), 'CrearParametroGeneral', 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                });
        },

        events: {
            'click #btnExportarExcel': 'exportarExcel',
            'click #btnEliminar': 'confirmarEliminar',
            'click #btnCrear': 'crearRegistro'
        },

        exportarExcel: function () {
            var grid = this.grid || $("#gridParametrosGenerales").data("kendoExtGrid");
            if (!grid) return;
            grid.saveAsExcel();
        },

        crearRegistro: function () {
            const self = this;
            const permiso = TienePermiso(450);
            if (!permiso) {
                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                return;
            }

            var win = $("<div/>").kendoWindow({
                title: window.app.idioma.t("CREAR") + ' ' + window.app.idioma.t("PARAMETRO"),
                modal: true,
                resizable: false,
                width: "460px",
                close: function () { this.destroy(); }
            }).data("kendoWindow");

            var templateHtml = $("#templateCrearRegistroParametros").html() || "";
            var tpl = _.template(templateHtml);
            win.content(tpl());
            win.center().open();

            var $win = win.element;

            // Textboxes
            $win.find("input[type='text'],input.k-textbox").addClass("k-textbox").css("width", "100%");

            // Botones
            $win.find("#btnCrearAceptar").on("click", function () {
                const nuevoNombre = ($win.find("#nuevoNombre").val() || "").trim();
                const nuevaDescripcion = ($win.find("#nuevaDescripcion").val() || "").trim();
                const nuevoValor = ($win.find("#nuevoValor").val() || "").trim();

                const required = [
                    { value: nuevoNombre, label: window.app.idioma.t("NOMBRE"), selector: "#nuevoNombre" },
                    { value: nuevaDescripcion, label: window.app.idioma.t("DESCRIPCION"), selector: "#nuevaDescripcion" },
                    { value: nuevoValor, label: window.app.idioma.t("VALOR"), selector: "#nuevoValor" }
                ];

                const missing = required.filter(function (f) { return !f.value; });
                if (missing.length > 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('CAMPOS_OBLIGATORIOS'), 4000);
                    try { var sel = missing[0].selector; var $first = $win.find(sel); if ($first && $first.length) $first.focus(); } catch (ignore) { }
                    return;
                }

                const dto = {
                    Nombre: nuevoNombre,
                    Descripcion: nuevaDescripcion,
                    Valor: nuevoValor
                };

                win.close();
                self.crearParametro(dto);
            });

            $win.find("#btnCrearCancelar").on("click", function () { win.close(); });
        },

        confirmarEliminar: function () {
            var self = this;
            var permiso = TienePermiso(450);
            if (!permiso) {
                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                return;
            }

            var $checked = $("#gridParametrosGenerales").find(".chk-select-parametro:checked");
            if (!$checked || $checked.length === 0) {
                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR_UN_REGISTRO'), 4000);
                return;
            }
            if ($checked.length > 1) {
                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_ELEGIR_SOLO_UN_REGISTRO'), 4000);
                return;
            }

            var id = Number($checked.first().data("id"));
            var grid = $("#gridParametrosGenerales").data("kendoExtGrid") || $("#gridParametrosGenerales").data("kendoGrid");
            var dataItem = null;
            try {
                dataItem = grid.dataSource.get(id);
            } catch (ex) {
                var dsdata = grid.dataSource.data() || [];
                for (var i = 0; i < dsdata.length; i++) {
                    if (Number(dsdata[i].IdMermasConfigVarias) === id) { dataItem = dsdata[i]; break; }
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
                funcion: function () { self.eliminarParametro(dataItem); },
                contexto: self
            });
        },

        eliminarParametro: function (dto) {
            if (!dto || typeof dto !== 'object') {
                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR_UN_REGISTRO'), 4000);
                return;
            }

            $.ajax({
                type: "DELETE",
                url: "../api/CalculoMermas/EliminarParametroGeneral",
                data: JSON.stringify(dto),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (res) {
                    var ok = typeof res === "boolean" ? res : !!res;
                    if (ok) {
                        var grid = $('#gridParametrosGenerales').data('kendoExtGrid') || $('#gridParametrosGenerales').data('kendoGrid');
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

            var gridElement = $("#gridParametrosGenerales"),
                dataArea = gridElement.find(".k-grid-content"),
                otherElements = gridElement.children().not(".k-grid-content"),
                otherElementsHeight = 0;
            otherElements.each(function () { otherElementsHeight += $(this).outerHeight(); });

            dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
        }
    });

    return VistaParametrosGenerales;
});