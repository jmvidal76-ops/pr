define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/JDERecepcion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function(_, Backbone, $, plantillaProductos, Not, VistaDlgConfirm, Session) {
        var vistaProductos = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantillaProductos),
            gridJDE: null,
            gridJDEProperties: null,
            dsJDE: null,
            dsJDEProperties: null,
            fin: new Date(),
            inicio: new Date((new Date()).getTime() - (15 * 24 * 3600 * 1000)),
            //#endregion ATTRIBUTES

            initialize: function() {
                var self = this;
                kendo.culture(localStorage.getItem("idiomaSeleccionado"));
                var ExtGrid = kendo.ui.Grid.extend({
                    options: {
                        toolbarColumnMenu: false,
                        name: "ExtGrid"
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

                            var that = $("#gridJDE").data("kendoExtGrid");

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

                self.render();
            },
            render: function() {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                

                self.DataSourceJDE(self);


                self.gridJDE = $("#gridJDE").kendoExtGrid({
                    dataSource: self.dsJDE,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    detailTemplate: kendo.template(this.$("#templateProperties").html()),
                    detailInit: function(model) {
                        self.DataSourcePropertiesReception(model, self);
                        self.GridJDEProperties(model, self);
                    },
                    detailExpand: function(e) {
                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                    },
                    resizable: true,
                    toolbarColumnMenu: true,
                    autoSync: false,
                    scrollable: true,
                    sortable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    selectable: true,
                    noRecords: {
                        template: window.app.idioma.t("SIN_RESULTADOS")
                    },
                    toolbar: [
                        {
                            template: '<input placeholder="' + window.app.idioma.t('DESDE') + '"  id="dtpFechaDesde" style="margin-right:5px;width:200px"/>'
                        },
                        {
                            template: '<input placeholder="' + window.app.idioma.t('HASTA') + '" id="dtpFechaHasta" style="margin-right:5px;width:200px" />'
                        },
                        {
                            template: '<button id="btnFiltrar" style="margin-left:5px;float:right" class="k-button k-button-icontext" ><span class="k-icon k-i-search"></span>' + window.app.idioma.t('CONSULTAR') + '</button>'
                        },
                    ],
                    columns: [{
                            field: "FechaRecepcion",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            //width: "10%",
                            title: window.app.idioma.t("FECHA_RECEPCION"),
                            template: '#= FechaRecepcion != null ? kendo.toString(new Date(FechaRecepcion), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            aggregates: ["count"],
                            groupFooterTemplate: window.app.idioma.t("CANTIDAD") + ": #=  count #"
                        },
                        {
                            field: "CodigoPlanta",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("CODIGO_PLANTA"),
                            template: '#=typeof CodigoPlanta !== "undefined"?  CodigoPlanta : ""#',
                            hidden:true
                        },
                        {
                            field: "CodigoMaterial",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("CODIGO_MATERIAL"),
                            template: '#=typeof CodigoMaterial !== "undefined"?  CodigoMaterial : ""#',
                            hidden: true
                        },

                        {
                            field: "DescripcionMaterial",
                            //width: "12%",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                            template: '#=typeof DescripcionMaterial !== "undefined"?  DescripcionMaterial : ""#'
                        },
                        {
                            field: "CodigoProveedor",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("CODIGO_PROVEEDOR"),
                            template: '#=typeof CodigoProveedor !== "undefined"?  CodigoProveedor : ""#',
                            hidden: true
                        },
                        {
                            field: "DescripcionProveedor",
                            //width: "12%",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("DESCRIPCION_PROVEEDOR"),
                            template: '#=typeof DescripcionProveedor !== "undefined"?  DescripcionProveedor : ""#',
                            hidden: true
                        },
                        {
                            field: "LoteProveedor",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("LOTE_PROVEEDOR"),
                            template: '#=typeof LoteProveedor !== "undefined"?  LoteProveedor : ""#'
                        },
                        {
                            field: "Albaran",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("ALBARAN"),
                            template: '#=typeof Albaran !== "undefined"?  Albaran : ""#',
                            hidden: true
                        },
                        {
                            field: "PosicionAlbaran",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("ALBARAN_POSICION"),
                            template: '#=typeof PosicionAlbaran !== "undefined"?  PosicionAlbaran : ""#',
                            hidden: true
                        },
                        {
                            field: "Cantidad",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("CANTIDAD"),
                            template: '#=typeof Cantidad !== "undefined"?   kendo.format("{0:n2}", Cantidad) : ""#',
                            aggregates: ["sum"],
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #=  kendo.format('{0:n2}', sum) #",
                        },
                        {
                            field: "Unidad",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("UNIDAD_MEDIA"),
                            template: '#=typeof Unidad !== "undefined"?  Unidad : ""#'
                        },
                        {
                            field: "LoteMes",
                            //width: "23%",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("LOTE_MES"),
                            template: '#=typeof LoteMes !== "undefined"?  LoteMes : ""#'
                        },
                        {
                            field: "MatriculaCamion",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("MATRICULA_CAMION"),
                            template: '#=typeof MatriculaCamion !== "undefined"?  MatriculaCamion : ""#',
                            hidden: true
                        },
                        {
                            field: "TipoDocumento",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("TIPO_DOCUMENTO"),
                            template: '#=typeof TipoDocumento !== "undefined"?  TipoDocumento : ""#',
                            hidden: true
                        },
                        {
                            field: "NumPedidoMSM",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("NUM_PEDIDO_MSM"),
                            template: '#=typeof NumPedidoMSM !== "undefined"?  NumPedidoMSM : ""#',
                            hidden: true
                        },
                        {
                            field: "LineaPedido",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("LINEA_PEDIDO"),
                            template: '#=typeof LineaPedido !== "undefined"?  LineaPedido : ""#',
                            hidden: true
                        },
                        {
                            field: "UltimaAccionMes",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("ULTIMA_ACCION_MES"),
                            template: '#=typeof UltimaAccionMes !== "undefined"?  UltimaAccionMes : ""#'
                        },
                        {
                            field: "FechaHoraModificacion",
                            //width: "10%",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("FECHA_MODIFICACION"),
                            template: '#=typeof FechaHoraModificacion !== "undefined"? kendo.toString(new Date(FechaHoraModificacion), kendo.culture().calendars.standard.patterns.MES_FechaHora )  : ""#'
                        },
                        {
                            field: "ProcesadaJDE",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            title: window.app.idioma.t("PROCESADA_JDE"),
                            template: '#=typeof ProcesadaJDE !== "undefined"?  ProcesadaJDE : ""#'
                        },

                    ],
                    dataBinding: function(e) {
                        //e.preventDefault();
                        if (e.action == "remove") e.preventDefault();
                        kendo.ui.progress($("#gridJDE"), false);
                        self.resizeGrid();
                    },
                    //dataBound: ()

                }).data("kendoExtGrid");

                //$("#gridJDE").data("kendoGrid").tbody.on("mouseenter", "> tr > td", function (e) {
                //    if (false) {
                //        // if a tooltip should not be displayed...
                //        return false;
                //    }
                //});

                $("#gridJDE").kendoTooltip({
                    filter: ".addTooltip",
                    content: function(e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");


                $("#gridJDE").data("kendoExtGrid").thead.kendoTooltip({
                    filter: "th",
                    content: function(e) {
                        var target = e.target;
                        return target.text();
                    }
                });

                $("#dtpFechaDesde").kendoDateTimePicker({
                    value: self.inicio,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#dtpFechaHasta").kendoDateTimePicker({
                    value: self.fin,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#ulToolbarColumn").addClass("listColumn")
            },

            //#region EVENTOS
            events: {
                'click  #btnFiltrar': 'actualiza',
            },
            //#endregion EVENTOS

            actualiza: function () {
                var self = this;
                self.inicio = $("#dtpFechaDesde").data("kendoDateTimePicker").value();
                self.fin = $("#dtpFechaHasta").data("kendoDateTimePicker").value();
                self.dsJDE.page(1);
                self.dsJDE.read();
            },

            DataSourceJDE: function(self) {

                self.dsJDE = new kendo.data.DataSource({
                    batch: false,
                    pageSize: 50,
                    async: true,
                    transport: {
                        read: {
                            url: "../api/GetJDEReceptionMaterial/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST" // POST para poder pasar parametros de fechas
                        },

                        update: {
                            url: "../api/UpdateJDEReceptionMaterial",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",


                        },
                        create: {
                            url: "../api/AddJDEReceptionMaterial",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "POST",

                        },
                        destroy: {
                            url: "../api/DeleteJDEReceptionMaterial",
                            type: "PUT",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json"
                        },
                        parameterMap: function(options, operation) {
                            if (operation !== "read") {
                                return JSON.stringify(options);
                            }
                            else if (operation === "read") {
                                var result = {};
                                result.fInicio = self.inicio;
                                result.fFin = self.fin;
                                return JSON.stringify(result);
                            }
                           

                        }

                    },
                    requestEnd: function(e) {},
                    schema: {
                        model: {
                            id: "IdAlbaranPosicion",
                            fields: {
                                CodigoRecepcion: { type: "number" },
                                FechaRecepcion: { type: "date", aggregate: "count" },
                                CodigoPlanta: { type: "number" },
                                CodigoMaterial: { type: "string" },
                                DescripcionMaterial: { type: "string" },
                                CodigoProveedor: { type: "string" },
                                DescripcionProveedor: { type: "string" },
                                LoteProveedor: { type: "string" },
                                Albaran: { type: "string" },
                                PosicionAlbaran: { type: "number" },
                                Cantidad: { type: "number" },
                                Unidad: { type: "string" },
                                LoteMes: { type: "string" },
                                MatriculaCamion: { type: "string" },
                                TipoDocumento: { type: "string" },
                                NumPedidoMSM: { type: "string" },
                                LineaPedido: { type: "number" },
                                UltimaAccionMes: { type: "string" },
                                FechaHoraModificacion: { type: "date" },
                                ProcesadaJDE: { type: "number" },
                            }

                        },
                       
                    }
                });

            },

            DataSourcePropertiesReception: function(model, self) {
                self.dsJDEProperties = new kendo.data.DataSource({
                    batch: false,
                    async: true,
                    pageSize: 10, 
                    transport: {
                        read: {
                            url: "../api/GetJDECodeReception/" + model.data.CodigoRecepcion + "/",
                            dataType: "json"
                        },
                        parameterMap: function(options, operation) {
                            if (operation !== "read") {
                                return JSON.stringify(options);
                            }
                        }
                    },
                    requestEnd: function(e) {},
                    schema: {
                        model: {
                            id: "IdAlbaranPosicion",
                            fields: {
                                CodigoPropiedad: { type: "number" },
                                CodigoRecepcion: { type: "number" },
                                NombrePropiedad: { type: "string" },
                                Valor: { type: "string" },
                                Unidad: { type: "string" },
                            }

                        },
                       
                    }
                });

            },

            GridJDEProperties: function(e, self) {
                var detailRow = e.detailRow;
                var datos = e.data;
                detailRow.find("#gridPropertiesReception").kendoGrid({
                    dataSource: self.dsJDEProperties,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    resizable: true,
                    autoSync: false,
                    scrollable: true,
                    pageable: false,
                    selectable: true,
                    noRecords: {
                        template: window.app.idioma.t("SIN_RESULTADOS")
                    },
                    columns: [
                        {
                            field: "NombrePropiedad",
                            title: window.app.idioma.t("NOMBRE").toUpperCase(),
                            template: '#= NombrePropiedad != null ? NombrePropiedad: "" #',
                        },
                        {
                            field: "Valor",
                            title: window.app.idioma.t("VALOR").toUpperCase(),
                            template: '#= Valor != null ? Valor: "" #',
                        },
                        {
                            field: "Unidad",
                            title: window.app.idioma.t("UNIDAD_MEDIDA").toUpperCase(),
                            template: '#= Unidad != null ? Unidad: "" #',
                        },


                    ],
                    dataBinding: function(e) {
                        kendo.ui.progress($("#gridPropertiesReception"), false);

                    },

                }).data("kendoGrid");
            },

            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();
                
                var gridElement = $("#gridJDE"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - filtrosHeight - cabeceraHeight - 2);
            },

            eliminar: function() {
                this.remove();
            },
        });

        return vistaProductos;
    });