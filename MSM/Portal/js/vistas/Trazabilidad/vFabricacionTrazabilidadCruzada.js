define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/FabricacionTrazabilidadCruzada.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion', 'definiciones'],
    function (_, Backbone, $, plantilla, Not) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            inicio: new Date((new Date()).getTime() - (15 * 24 * 3600 * 1000)),
            fin: new Date(),
            dsLotes: null,
            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;
                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                var ExtGrid = kendo.ui.Grid.extend({
                    options: {
                        toolbarColumnMenu: false,
                        name: "ExtGrid",
                    },
                    init: function (element, options) {
                        /// <summary>
                        /// Initialize the widget.
                        /// </summary>

                        if (options.toolbarColumnMenu === true && typeof options.toolbar === "undefined") {
                            options.toolbar = [];

                        }
                        kendo.ui.Grid.fn.init.call(this, element, options);
                        this._initToolbarColumnMenu();
                    },

                    _initToolbarColumnMenu: function () {
                        /// <summary>
                        /// Determine whether the column menu should be displayed, and if so, display it.
                        /// </summary>

                        // The toolbar column menu should be displayed.
                        if (this.options.toolbarColumnMenu === true && this.element.find(".k-ext-grid-columnmenu").length === 0) {

                            // Create the column menu items.
                            var $menu = $("<ul id='ulToolbarColumn' style='max-height:400px !important;overflow-y:auto'></ul>");

                            // Loop over all the columns and add them to the column menu.
                            for (var idx = 0; idx < this.columns.length; idx++) {
                                var column = this.columns[idx];
                                // A column must have a title to be added.
                                if ($.trim(column.title).length > 0) {
                                    // Add columns to the column menu.
                                    $menu.append(kendo.format("<li><input  type='checkbox' data-index='{0}' data-field='{1}' data-title='{2}' {3}>&emsp;{4}</li>",
                                        idx, column.field, column.title, column.hidden ? "" : "checked", column.title));
                                }
                            }

                            // Create a "Columns" menu for the toolbar.
                            this.wrapper.find("div.k-grid-toolbar").append("<ul class='k-ext-grid-columnmenu' style='float:left;border-radius:4px;margin-right:5px;'><li data-role='menutitle' class='btnColumns' style='border-style:hidden;'>" + window.app.idioma.t('COLUMNAS') + "</li></ul>");
                            this.wrapper.find("div.k-grid-toolbar ul.k-ext-grid-columnmenu li").append($menu);

                            var that = $("#grid").data("kendoExtGrid");

                            this.wrapper.find("div.k-grid-toolbar ul.k-ext-grid-columnmenu").kendoMenu({
                                closeOnClick: false,
                                select: function (e) {
                                    // Get the selected column.
                                    var $item = $(e.item), $input, columns = that.columns;
                                    $input = $item.find(":checkbox");
                                    if ($input.attr("disabled") || $item.attr("data-role") === "menutitle") {
                                        return;
                                    }

                                    var column = that._findColumnByTitle($input.attr("data-title"));

                                    // If checked, then show the column; otherwise hide the column.
                                    if ($input.is(":checked")) {
                                        that.showColumn(column.field);
                                    } else {
                                        that.hideColumn(column.field);
                                    }
                                }
                            });
                        }
                    },
                    _findColumnByTitle: function (title) {
                        /// <summary>
                        /// Find a column by column title.
                        /// </summary>
                        var result = null;

                        for (var idx = 0; idx < this.columns.length && result === null; idx++) {
                            column = this.columns[idx];

                            if (column.title === title) {
                                result = column;
                            }
                        }

                        return result;
                    }
                });

                kendo.ui.plugin(ExtGrid);

                self.dsLotes = new kendo.data.DataSource({
                    async: true,
                    transport: {
                        read: {
                            url: "../api/trazabilidadCruzada",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "PUT"
                        },
                        parameterMap: function (options, type) {
                            if (type == "read") {
                                var _ubicacion = $("#cmbUbicacion").val();
                                var _cmbDesde = $("#dtpFechaInicio").val() != "" ? kendo.parseDate($("#dtpFechaInicio").data('kendoDatePicker').value(), "yyyy-mm-dd") : null;
                                var _cmbHasta = $("#dtpFechaFin").val() != "" ? kendo.parseDate($("#dtpFechaFin").data('kendoDatePicker').value(), "yyyy-mm-dd") : null;

                                if (_ubicacion != "") {
                                    return JSON.stringify({
                                        IdUbicacion: _ubicacion ? _ubicacion : null,
                                        FechaInicio: _cmbDesde.toISOString().split('T')[0],
                                        FechaFin: _cmbHasta.toISOString().split('T')[0]
                                    });
                                }
                            }
                        }
                    },
                    requestStart: function (e) {
                        if (!self.validarDatosFiltros(self)) {
                            e.preventDefault();
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
                            }
                        }
                    },
                    pageSize: 50,
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_LOTE_SEMIELABORADO'), 5000);

                    }

                });


                $("#grid").kendoExtGrid({
                    dataSource: self.dsLotes,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    sortable: true,
                    toolbarColumnMenu: true,
                    scrollable: true,
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
                            template: "<label style='margin- left: 5px; '>" + window.app.idioma.t('DESDE') + "</label>" +
                                "<input id='dtpFechaInicio' />" +
                                "<label style = 'margin-left: 5px;'>" + window.app.idioma.t('HASTA') + "</label > " +
                                "<input id = 'dtpFechaFin' /> " +
                                "<label class= 'k-input-label' style = 'margin-right: 5px;' >" + window.app.idioma.t('UBICACION') + "</label > " +
                                "<input id='cmbUbicacion' style='margin- left: 5px; width:8% '/> "
                        },
                        {
                            template: '<button id="btnLimpiarFiltros" class="k-button k-button-icontext k-i-delete" style="margin-left: 5px;float:right"><span class="k-icon k-i-funnel-clear"></span>' + window.app.idioma.t('QUITAR_FILTROS') + '</button>'
                        },
                        {
                            template: '<button id="btnFiltrar" class="k-button k-button-icontext" style="margin-left: 5px;float:right"><span class="k-icon k-i-search"></span>' + window.app.idioma.t('CONSULTAR') + '</button>'
                        },
                        {
                            name: "excel", text: window.app.idioma.t("EXPORTAR_EXCEL")
                        },
                    ],
                    excel: {
                        fileName: window.app.idioma.t('EXCEL_TRAZABILIDAD_CRUZADA') + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    columns: [
                        {
                            hidden: true,
                            title: window.app.idioma.t("TIPO_MATERIAL"),
                            field: 'TipoMaterial',
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
                                        return "<div><label><input type='checkbox' value='#=TipoMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoMaterial#</label></div>";
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
                            title: window.app.idioma.t("LOTE_MES"),
                            field: 'IdLoteMES',
                            width: 350,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
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
                        },
                        {
                            command: [
                                {
                                    text: window.app.idioma.t("GENERAR_ETIQUETA"),
                                    click: self.generarEtiqueta
                                }],
                            title: " ",
                            width: 250

                        },


                    ],
                    dataBound: function (e) {
                        self.ResizeTab();
                    }
                });

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

                var dsUbicacion = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetLocation/0/0",
                            dataType: "json"
                        }
                    }
                });

                $("#cmbUbicacion").kendoDropDownList({
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    dataSource: dsUbicacion,
                    filter: "contains",
                    dataTextField: "Nombre",
                    dataValueField: "IdUbicacion",
                    open: self.onElementOpen
                });

                var cmbUbicacion = $("#cmbUbicacion").data("kendoDropDownList");
                cmbUbicacion.list.width("auto");

                $('[data-toggle="popover"]').popover();
                self.ResizeTab();

            },
            //#region EVENTOS
            events: {
                'click #btnFiltrar': 'filtrar',
                'click #btnLimpiarFiltros': function () { this.limpiarFiltros(this) },
            },
            //#endregion EVENTOS
            filtrar: function () {
                $("#grid").data("kendoExtGrid").dataSource.read();
            },
            limpiarFiltros: function () {
                var prevDay = new Date((new Date()).getTime() - (15 * 24 * 3600 * 1000));
                var todayDate = kendo.toString(kendo.parseDate(new Date()), 'dd/MM/yyyy');
                var PrevDate = kendo.toString(kendo.parseDate(prevDay), 'dd/MM/yyyy');


                $("#dtpFechaInicio").data("kendoDatePicker").value(PrevDate);
                $("#dtpFechaInicio").val(PrevDate);

                $("#dtpFechaFin").data("kendoDatePicker").value(todayDate);
                $("#dtpFechaFin").val(todayDate);

                $("#cmbLoteProveedor").val("");
                $("#cmbUbicacion").val("");

                $("#grid").data("kendoExtGrid").dataSource.filter({});
            },
            validarDatosFiltros: function (self) {
                var _ubicacion = $("#cmbUbicacion").val();
                var _cmbDesde = $("#dtpFechaInicio").val() != "" ? kendo.parseDate($("#dtpFechaInicio").data('kendoDatePicker').value(), "yyyy-mm-dd") : null;
                var _cmbHasta = $("#dtpFechaFin").val() != "" ? kendo.parseDate($("#dtpFechaFin").data('kendoDatePicker').value(), "yyyy-mm-dd") : null;


                if (_ubicacion == "")
                {
                    Not.crearNotificacion('Info', window.app.idioma.t('INFO'), window.app.idioma.t('SELECCIONAR_UBICACION'), 5000);
                    return false;
                }
                else if ((!_cmbDesde || !_cmbHasta) && _ubicacion != "") {
                    Not.crearNotificacion('Info', window.app.idioma.t('INFO'), window.app.idioma.t('SELECCIONAR_FECHAS'), 5000);
                    return false;
                }

                return true;
            },
            getValueVariable: function (id, tipo) {
                return typeof $('#' + id).data(tipo).dataItems() !== 'undefined' ? isNaN(parseInt($('#' + id).data(tipo).value())) ? null : $('#' + id).data(tipo).value() : null;
            },
            onElementOpen: function (e) {
                var listContainer = e.sender.list.closest(".k-list-container");
                listContainer.width(listContainer.width() + kendo.support.scrollbar());
            },
            ResizeTab: function (isVisible) {
                var contenedorHeight = $("#center-pane").height();
                var toolbarHeight = $(".k-grid-toolbar").height();

                $("#divSplitterV").height(contenedorHeight - toolbarHeight);

                var cabeceraHeight1 = $("#divCabeceraVista").height();
                var contenedorHeight = $("#center-pane").height();
                var toolbarHeight = $(".k-grid-toolbar").height() < 70 ? $(".k-grid-toolbar").height() + 53 : $(".k-grid-toolbar").height();
                var cabeceraHeight = $(".k-grouping-header").height();
                var headerHeightGrid = $(".k-grid-header").height();
                var divFiltersGrid = isVisible == 0 ? 0 : $("#divFilters").height();

                var gridElement = $("#grid"),
                    dataArea = gridElement.find(".k-grid-content:first"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - toolbarHeight - cabeceraHeight1 - cabeceraHeight - divFiltersGrid - headerHeightGrid);
            },
            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

