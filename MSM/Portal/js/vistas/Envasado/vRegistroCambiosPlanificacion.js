define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/RegistroCambiosPlanificacion.html',
    'vistas/Envasado/vPlanificadorWOJustificar', 'compartido/notificaciones', 'jszip', 'compartido/util'],
    function (_, Backbone, $, Plantilla, vistaJustificar, Not, JSZip, util) {
        var VistaRegistroCambiosPlanificacion = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenidoRCP',
            grid: null,
            ds: null,
            template: _.template(Plantilla),
            SEMANA_MAX: 53,
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;                

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.getDataSource();
                self.render();
            },
            getDataSource: function () {
                var self = this;               

                self.ds = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/Planificador/JustificacionesCambiosPlanificacion",
                            data: function () {
                                var result = {};
                                result.fechaDesde = self.$("#selectSemanaD").getKendoDropDownList()?.dataItem()?.inicio?.toISOString();
                                result.fechaHasta = self.$("#selectSemanaH").getKendoDropDownList()?.dataItem()?.fin?.addDays(1)?.toISOString();

                                return result;
                            },
                            dataType: "json",
                        },
                        update: {
                            url: "../api/Planificador/JustificacionesCambiosPlanificacion",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    $("#gridRegistroCambiosPlanificacion").data("kendoGrid").dataSource.read();
                                }
                            },
                        },
                        destroy: {
                            url: "../api/Planificador/JustificacionesCambiosPlanificacion",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "DELETE",
                            complete: function (e) {
                                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    self.actualiza(null, true);
                                }
                            }
                        },
                        parameterMap: function (options, operation) {
                            if (operation !== "read" && options) {
                                return kendo.stringify(options);
                            }
                            return options;
                        }
                    },
                    schema: {
                        parse: function (response) {

                            for (const r of response) {
                                r.FechaModificacion = r.FechaActualizado ?? r.FechaCreado;
                                r.Usuario = r.Actualizado ?? r.Creado;
                            }

                            return response;
                        },
                        model: {
                            id: "IdJustificacion",
                            fields: {
                                IdJustificacion: { type: "number", editable: false },
                                Anio: {
                                    type: "number",
                                    validation: {
                                        required: true,                                        
                                        anioValido: function (input) {
                                            if (input.is("[name='Anio']")) {
                                                var v = input.val();
                                                if (v === "" || v == null) return false;          // required ya lo cubre, pero ok
                                                var n = Number(v);
                                                // entero y 4 dígitos (1000..9999)
                                                return Number.isInteger(n) && n >= 1000 && n <= 9999;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                Semana: {
                                    type: "number",
                                    validation: {
                                        required: true,
                                        semanaValida: function (input) {
                                            if (input.is("[name='Semana']")) {
                                                var v = input.val();
                                                if (v === "" || v == null) return false;          // required ya lo cubre, pero ok
                                                var n = Number(v);
                                                // entero y 4 dígitos (1000..9999)
                                                return Number.isInteger(n) && n >= 1 && n <= self.SEMANA_MAX;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                FechaCreado: { type: "date", editable: false },
                                FechaActualizado: { type: "date", editable: false },
                                FechaModificacion: { type: "date", editable: false },
                                Usuario: { type: "string", editable: false },
                            }
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            $("#center-pane").empty();
                        }
                    }
                });
            },
            cambiaAnio: function (e, self, t) {
                let semanaDDL = $("#selectSemana"+t).getKendoDropDownList();

                semanaDDL.dataSource.read();
            },
            render: function () {
                var self = this;

                DestruirKendoWidgets(self);

                $(self.el).html(self.template());
                $("#center-pane").append($(self.el))

                let anios = [];

                for (let i = window.app.planta.anyoImplantacion; i <= new Date().getFullYear() + 2; i++) {
                    anios.push({ id: i, nombre: i.toString() })
                }

                let aniosDS = new kendo.data.DataSource({
                    data: anios
                })

                let inicio = new Date().addDays(-7).getMonday();
                let fin = new Date().addDays(7).getMonday();

                let ready = { a: false, b: false };
                let firstLoad = true;

                function tryFirstLoad() {
                    if (ready.a && ready.b && firstLoad) {
                        firstLoad = false;
                        self.actualiza();  // primer load cuando ambos combos de semana están cargados
                    }
                }

                $("#selectAnioD").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: aniosDS,
                    value: inicio.getFullYear(),
                    change: function () { self.cambiaAnio(this, self, "D"); },
                });

                let semanasDSD = new kendo.data.DataSource({
                    transport: {
                        read: function (operation) {

                            let anioDDL = self.$("#selectAnioD").getKendoDropDownList();
                            if (anioDDL && anioDDL.value()) {
                                let anio = anioDDL.value();
                                $.ajax({
                                    url: "../api/semanas/" + anio + "/",
                                    dataType: "json",
                                    success: function (response) {
                                        operation.success(response); //mark the operation as successful
                                    }
                                });
                            }
                            else {
                                operation.success([]);
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: "numSemana",
                            fields: {
                                year: { type: "number" },
                                numSemana: { type: "number" },
                                inicio: { type: "date" },
                                fin: { type: "date" }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                })
                this.$("#selectSemanaD").kendoDropDownList({
                    dataValueField: "numSemana",
                    template: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    valueTemplate: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    dataSource: semanasDSD,
                    dataBound: function (e) {
                        this.value(inicio.getWeek());
                        ready.a = true;
                        tryFirstLoad();
                    }
                });

                $("#selectAnioH").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: aniosDS,
                    value: fin.getFullYear(),
                    change: function () { self.cambiaAnio(this, self, "H"); },
                });

                let semanasDSH = new kendo.data.DataSource({
                    transport: {
                        read: function (operation) {

                            let anioDDL = self.$("#selectAnioH").getKendoDropDownList();
                            if (anioDDL && anioDDL.value()) {
                                let anio = anioDDL.value();
                                $.ajax({
                                    url: "../api/semanas/" + anio + "/",
                                    dataType: "json",
                                    success: function (response) {
                                        operation.success(response); //mark the operation as successful
                                    }
                                });
                            }
                            else {
                                operation.success([]);
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: "numSemana",
                            fields: {
                                year: { type: "number" },
                                numSemana: { type: "number" },
                                inicio: { type: "date" },
                                fin: { type: "date" }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                })
                this.$("#selectSemanaH").kendoDropDownList({
                    dataValueField: "numSemana",
                    template: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    valueTemplate: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    dataSource: semanasDSH,
                    dataBound: function (e) {
                        this.value(fin.getWeek());
                        ready.b = true;
                        tryFirstLoad();
                    }
                });

                $("#btnAdd").kendoButton({
                    click: async function (e) {
                        e.preventDefault();
                        self.OpenModalJustificar();
                    }
                });                

                self.grid = this.$("#gridRegistroCambiosPlanificacion").kendoGrid({
                    autoBind: false,
                    excel: util.ui.default.gridExcelDate('REGISTRO_CAMBIOS_PLANIFICACION'),
                    dataSource: self.ds,
                    sortable: true,
                    resizable: true,
                    editable: "inline",
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            title: window.app.idioma.t("ANYO"),
                            field: "Anio",
                            width: 40,
                            _excelOptions: {
                                width: "80"
                            },
                            editor: function (container, options) {
                                $('<input name="' + options.field + '"/>')
                                    .appendTo(container)
                                    .kendoNumericTextBox({
                                        format: "0",   // sin decimales
                                        decimals: 0,
                                        min: 1000,
                                        max: 9999,
                                        step: 1
                                    });
                            }
                        },
                        {
                            title: window.app.idioma.t("SEMANA"),
                            field: "Semana",
                            width: 40,
                            _excelOptions: {
                                width: "80"
                            },
                            editor: function (container, options) {
                                $('<input name="' + options.field + '"/>')
                                    .appendTo(container)
                                    .kendoNumericTextBox({
                                        format: "0",   // sin decimales
                                        decimals: 0,
                                        step: 1,
                                        min: 1,
                                        max: self.SEMANA_MAX
                                    });
                            }
                        },
                        {
                            field: "Linea",
                            title: window.app.idioma.t("LINEA"),
                            template: "#: ObtenerLineaDescripcion(Linea) #",
                            _excelOptions: {
                                width: "250",
                                template: "#=ObtenerLineaDescripcion(value.Linea)#"
                            },
                            width: 140,
                            editor: function (container, options) {
                                $('<input name="' + options.field + '"/>')
                                    .appendTo(container)
                                    .kendoDropDownList({
                                        template: "#: ObtenerLineaDescripcion(id) #",
                                        valueTemplate: "#: ObtenerLineaDescripcion(id) #",
                                        dataValueField: "id",
                                        dataSource: window.app.planta.lineas,
                                        //optionLabel: window.app.idioma.t('SELECCIONE')
                                    });
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#: ObtenerLineaDescripcion(Linea) #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "IdMotivo",
                            title: window.app.idioma.t("MOTIVO"),
                            template: "<span title='#:DescripcionMotivo#'>#:IdMotivo# - #: Motivo #</span>",
                            width: 140,
                            _excelOptions: {
                                width: "250",
                                template: "#=value.IdMotivo# - #= value.Motivo #"
                            },
                            editor: function (container, options) {
                                $('<input name="' + options.field + '"/>')
                                    .appendTo(container)
                                    .kendoDropDownList({
                                        dataValueField: "IdMotivo",
                                        template: "<span title='#: Descripcion #'>#: IdMotivo # - #: Motivo #</span>",
                                        valueTemplate: "<span title='#: Descripcion #'>#: IdMotivo # - #: Motivo #</span>",
                                        //optionLabel: window.app.idioma.t('SELECCIONE'),
                                        dataSource: new kendo.data.DataSource({
                                            transport: {
                                                read: {
                                                    url: "../api/GetMotivosAdherencia?verInactivos=false",
                                                    dataType: "json",
                                                    contentType: "application/json; charset=utf-8",
                                                    type: "GET"
                                                },
                                            },
                                            error: function (e) {
                                                if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                                }
                                            }
                                        }),
                                    });
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=IdMotivo#' style='width: 14px;height:14px;margin-right:5px;'/>#:IdMotivo# - #: Motivo #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Comentario",
                            title: window.app.idioma.t("COMENTARIO"),
                            width: 160,
                            groupable: false,
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                        },
                        {
                            field: "FechaModificacion",
                            title: window.app.idioma.t('FECHA_MODIFICACION'),
                            template: '#: kendo.toString(new Date(FechaModificacion),kendo.culture().calendars.standard.patterns.MES_FechaHora)#',                            
                            _excelOptions: {
                                width: "auto",
                                template: '#=GetDateForExcel(value.FechaModificacion)#',
                                format: "dd/mm/yy hh:mm:ss",
                            },                            
                            width: 90,
                            groupable: false,
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                    });
                                }
                            },
                            groupHeaderTemplate: (e) => {
                                return `${window.app.idioma.t("FECHA")}: ${kendo.toString(e.value, "dd/MM/yyyy")}`
                            },
                        },
                        {
                            field: "Usuario",
                            title: window.app.idioma.t('USUARIO'),
                            width: 80,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#= Usuario #' style='width: 14px;height:14px;margin-right:5px;'/>#= Usuario#</label></div>";
                                    }
                                }
                            },
                        },                        
                        {
                            title: window.app.idioma.t("OPERACIONES"),
                            attributes: { "align": "center" },
                            width: 40,
                            groupable: false,
                            command: [
                                {
                                    name: "edit",
                                    text: {
                                        edit: "", //window.app.idioma.t("EDITAR"),
                                        update: "", //window.app.idioma.t("ACTUALIZAR"),
                                        cancel: "", //window.app.idioma.t("CANCELAR")
                                    },
                                    click: function (e) {
                                        var permiso = TienePermiso(452);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            $('#gridRegistroCambiosPlanificacion').data("kendoGrid").cancelChanges();
                                        }
                                    }
                                },
                                {
                                    name: "Delete",
                                    text: "", //window.app.idioma.t('ELIMINAR'),
                                    click: function (e) {
                                        e.preventDefault(); //prevent page scroll reset
                                        var permiso = TienePermiso(452);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            return;
                                        }

                                        var grid = $("#gridRegistroCambiosPlanificacion").data("kendoGrid");
                                        var tr = $(e.target).closest("tr");
                                        var data = this.dataItem(tr);

                                        OpenWindow(window.app.idioma.t('ATENCION'),
                                            window.app.idioma.t('CONFIRMACION_ELIMINAR_REGISTRO'),
                                            () => {
                                                grid.dataSource.remove(data);
                                                grid.dataSource.sync();
                                            },
                                            {
                                                width: "290px",
                                                okMsg: window.app.idioma.t("SI"),
                                                cancelMsg: window.app.idioma.t("NO")                                                
                                            }
                                        );
                                    }
                                },
                            ]
                        }
                    ],
                    dataBinding: self.resizeGrid,
                    dataBound: function (e) {
                        $(".k-grid-Delete span").addClass("k-icon k-delete");
                    },
                    cancel: function (e) {
                        $("#gridRegistroCambiosPlanificacion").data("kendoGrid").refresh();
                    },
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    excelExport: function (e) {
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
                }).data("kendoGrid");

                $("#gridRegistroCambiosPlanificacion").kendoTooltip({
                    filter: ".addTooltip",
                    width: "200px",
                    show: function (e) {
                        e.sender.popup.element.addClass('multiline-tooltip');
                    },
                    content: function (e) {
                        return e.target.html();
                    }
                })

                self.resizeGrid();
            },
            OpenModalJustificar: function () {
                let self = this;

                self.vistaJustificar = new vistaJustificar(self, {
                    anio: new Date().getFullYear(),
                    semana: new Date().getWeek(),
                    lineas: [],                    
                    callback: (result) => {
                        self.actualiza();
                    }
                });
            },            
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnExportExcel': 'exportExcel',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
            },            
            actualiza: function (e, mantenerFiltros = false) {
                var self = this;

                let fechaDesde = self.$("#selectSemanaD").getKendoDropDownList()?.dataItem()?.inicio;
                let fechaHasta = self.$("#selectSemanaH").getKendoDropDownList()?.dataItem()?.fin?.addDays(1);

                if (!fechaDesde || !fechaHasta) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LAS_FECHAS_INTRODUCIDAS'), 3000);
                    return;
                }

                if (fechaDesde > fechaHasta) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('_LA_FECHA'), 3000);
                    return;
                }

                RecargarGrid({ grid: self.grid, options: { filter: mantenerFiltros ? self.ds.filter() : [] } });

            },
            exportExcel: function () {
                var grid = $("#gridRegistroCambiosPlanificacion").data("kendoGrid");
                grid.saveAsExcel();
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

                var gridElement = $("#gridRegistroCambiosPlanificacion"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            },
            LimpiarFiltroGrid: function () {
                var self = this;

                self.ds.query({
                    page: 1,
                    pageSize: self.ds.pageSize(),
                    sort: [],
                    filter: []
                });
            },
        });

        return VistaRegistroCambiosPlanificacion;
    });