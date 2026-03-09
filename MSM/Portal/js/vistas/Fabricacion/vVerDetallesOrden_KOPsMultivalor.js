define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/vpVerDetalleOrden_KOPsMultivalor.html',
    'compartido/notificaciones',
    'vistas/vDialogoConfirm', 'vistas/Fabricacion/vDeclararProd',
    'vistas/Fabricacion/vCambiarProcedimientos', 'vistas/Fabricacion/vVerDeltaV',
    'vistas/Fabricacion/vDuplicarEntry', 'vistas/Fabricacion/vConsumoMaterial',
    'jszip', 'vistas/Fabricacion/vNuevaTransferencia',
    'vistas/Fabricacion/vReclasificaOrden', 'vistas/Fabricacion/vEditarProcedimientos',
    'vistas/Fabricacion/vVerDetalleLIMS', 'compartido/utils', 'definiciones'
],
    function (_, Backbone, $, FormDetalleOrden, Not, VistaDlgConfirm, VistaDeclararProd, VistaProcedimientos,
        VistaDeltaV, vistaDuplicarEntry, VistaConsumoMaterial, JSZip, vistaNuevaTransf, vistaReclasifica, vistaEditaProcs, vistaDetalleLims, utils, definiciones) {
        var vistaDetalleOrdenKOPsMultivalor = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenidoKOPsMultivalor',
            curvas: null,
            confirmacion: null,
            dataOrden: null,
            dialogoConfirm: null,
            dsLims: null,
            dsKOPSMaestros: null,
            dsMultivalor: null,
            dsCurvaOrden: null,
            detailMultiValue: null,
            dsSampleType: null,
            dsSubDepartament: null,
            dsCmbProc: [],
            dsKOPS: null,
            expandedRowUidGridCurvas: null,
            gridProduccion: null,
            gridConsumo: null,
            gridKOPS: null,
            gridProcs: null,
            gridCurvas: null,
            gridTransferencias: null,
            gridLims: null,
            gridhistorian: null,
            historian: null,
            idorden: 0,
            masterMultiValue: null,
            opciones: null,
            order: [],
            objIndex: null,
            urlMaestroCurvas: null,
            urlListadoKOPsMultivalor: null,
            urlValorCurvaGrafico: null,
            template: _.template(FormDetalleOrden),
            ventanaEditarCrear: null,
            vistaDeclararProd: null,
            vistaProcs: null,
            isOrdenActiva: true,
            ColorEstado: '',
            estadoColor: definiciones.EstadoColor(),
            window: null,
            permisoVisualizacionKOPsMultivalor: false,
            permisoGestionKOPsMultivalor: false,
            initialize: function (order, opciones, idOrden, ordenEstado) {
                var self = this;
                window.JSZip = JSZip;
                self.opciones = opciones;
                self.idorden = idOrden;
                self.isOrdenActiva = ordenEstado;
                kendo.ui.progress(self.$("#contenedor"), true);
                self.order = order;

                self.ValidarPermisos(self);

                self.dsCurvaOrden = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerListadoKOPsMultivalorDetalleOrden/" + parseInt(idOrden),
                            dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests                            
                            cache: false
                        }
                    },
                    requestStart: function (e) {
                        if (!self.permisoVisualizacionKOPsMultivalor && !self.permisoGestionKOPsMultivalor) {
                            e.preventDefault();
                        }
                    },
                    pageSize: 100,
                    schema: {
                        model: {
                            id: "PK",
                            fields: {
                                'ID_MAESTRO': { type: "string" },
                                'PK': { type: "string" },
                                'ID_ORDEN': { type: "string" },
                                'COD_KOP': { type: "string" },
                                'NAME': { type: "string" },
                                'PROCCESS': { type: "string" },
                                'MEDIDA': { type: "string" },
                                'TIPO': { type: "string" },
                                'DATATYPE': { type: "string" }
                            }
                        }
                    },
                    sort: { field: "FechaInicio", dir: "asc" }
                });

                self.render(self);
                //self.SetWOKOPColor();

            },
            render: function (self) {
                $(self.el).html(this.template());
                self.CargarTabKOPSMultivalor(self);

            },
            events: function (grid) {
                var self = this;
                $("tr").find(".btnGrafico").on("click", function (e) {
                    self.ConsultaGraficoCurva(grid, e);
                });
            },
            eventsDetalle: function (self) {
                $("tr").find(".btnAsignarCurva").on("click", function (e) {
                    self.asignarCurvas(self);
                });

                $(".btnExcelCurva").on("click", function (e) {
                    self.ExcelCurva($("#gridDetalleMultivalor").data("kendoGrid")._data, e);
                });

                $(".btnPDFCurva").on("click", function (e) {
                    self.PdfCurva(self, e);
                });
            },
            CargarTabKOPSMultivalor: function (self) {
                self.MostrarEstadoInicialGridMultivalor();

                self.CargarGridCurvas(self);
            },
            MostrarEstadoInicialGridMultivalor: function () {
                $("#gridCurvas").show();
                $("#btnGrafico").show();
                $("#chart").hide();
                $("#btnTabla").hide();
                $("#btnExcelCurvaGrafico").hide();
                $("#btnPDFCurvaGrafico").hide();
            },
            CargarGridCurvas: function (self) {
                if ($("#gridCurvas").data("kendoGrid") == undefined) {
                    self.gridCurvas = $("#gridCurvas").kendoGrid({
                        dataSource: self.dsCurvaOrden,
                        sortable: true,
                        selectable: true,
                        culture: localStorage.getItem("idiomaSeleccionado"),
                        filterable: {
                            extra: false,
                            messages: window.app.cfgKendo.configuracionFiltros_Msg,
                            operators: window.app.cfgKendo.configuracionFiltros_Operadores
                        },
                        detailInit: function (e) {
                            return self.DetailInitCurvas(e, self);
                        },
                        detailTemplate: kendo.template($("#templateMultivalor").html()),
                        dataBound: function () {
                            self.OnDataBoundCurvasMaestro(this);
                            //this.expandRow($('tr[data-uid=' + self.expandedRowUidGridCurvas + ']'));
                            self.ActualizarValoresKOPSMultivalor();

                            self.events(this);
                            ConsultaTablaCurva = self.ConsultaTablaCurva;
                            $('[data-funcion]').checkSecurity();
                        },
                        change: function () {
                        },
                        detailExpand: function (e) {
                            e.preventDefault();
                            self.masterMultiValue = e.masterRow;
                            self.detailMultiValue = e;

                            this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                            var datos = $("#gridCurvas").data("kendoGrid").dataItem(self.masterMultiValue);

                            self.expandedRowUidGridCurvas = e.masterRow.data('uid');

                            var tipoValor = datos.DATATYPE.toLowerCase();
                            self.objIndex = "";
                            $.each($(".inputValor"), function (index, item) {
                                if (item.id === (String(datos.NAME).replace(/\s/g, '') + datos.PK)) {
                                    self.objIndex = ".inputValor:eq(" + String(index) + ")";
                                }
                            })

                            switch (tipoValor) {

                                case "float":
                                case "numero":
                                case "número":
                                case "int":
                                case "number":
                                    $(self.objIndex).kendoNumericTextBox({
                                        placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                                        decimals: 5,
                                        culture: localStorage.getItem("idiomaSeleccionado"),
                                        format: 'n5'
                                    });
                                    break;
                                case "datetime":
                                case "fecha":
                                    $(self.objIndex).kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado"),
                                        value: new Date()
                                    });
                                    break;
                                case "texto":
                                case "text":
                                    $(self.objIndex).addClass("k-textbox");
                                    break;
                            }
                        },
                        pageable: false,
                        excel: {
                            allPages: true,
                            filterable: true
                        },
                        pdf: {
                            //fileName: nombreKOP + ".pdf",
                            //title: nombreKOP

                        },
                        scrollable: true,

                        columns: [{
                            template: "<div class='circle_cells' style='background-color:#=SEMAFORO#;'/>",
                            field: "SEMAFORO",
                            title: '',
                            width: "50px",
                            attributes: { style: "text-align:center;" },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=SEMAFORO#' style='width: 14px;height:14px;margin-right:5px;'/><img id='imgEstadoKOP' style='width: 11px; height: 11px; vertical-align: initial;padding-right: 3px; background-color:#=SEMAFORO#;'></img> #= FILTRO_SEMAFORO # </label></div>";
                                    }
                                }
                            }
                        },
                        {
                            title: "",
                            template: "#if(DATATYPE.toLowerCase() !=='número' && DATATYPE.toLowerCase() !=='number'){ #" +
                                "<span>" + window.app.idioma.t('GRÁFICO_NO_DISPONIBLE') + "</span>" +
                                "#} else {#   <button id='btnGrafico#=PK#' class='k-button k-button-icontext  btnGrafico blueBtn' style='min-width:107px'> <img class='k-icon' alt='icon' src='img/chartImg2.png' style='margin-left:0.3rem' />" + window.app.idioma.t('GRAFICO') + "</button>  #}#",
                            headerAttributes: { style: "text-align:center" },
                            width: 130,
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            title: "#",
                            template: "#= ++record #",
                            width: 30
                        },
                        {
                            field: "PK",
                            title: window.app.idioma.t("N_KOPMULTIVALOR"),
                            width: 200
                        },
                        {
                            field: "COD_KOP",
                            template: "#=COD_KOP + ' - ' + NAME#",
                            title: window.app.idioma.t("KOPS_PROCESO"),
                            width: 600
                        },
                        {
                            template: "#= PROCCESS #",
                            field: "PROCCESS",
                            title: window.app.idioma.t("PROCEDIMIENTO"),
                            width: 150,
                            filteable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=PROCCESS#' style='width: 14px;height:14px;margin-right:5px;'/>#= PROCCESS # </label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "DATATYPE",
                            title: window.app.idioma.t("TIPO_DATO"),
                            filteable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=DATATYPE#' style='width: 14px;height:14px;margin-right:5px;'/>#= DATATYPE # </label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "TIPO",
                            title: window.app.idioma.t("TIPOKOP"),
                            filteable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=TIPO#' style='width: 14px;height:14px;margin-right:5px;'/>#= TIPO # </label></div>";
                                    }
                                }
                            }
                        }
                        ],
                        dataBinding: function () {
                            record = (this.dataSource.page() - 1) * this.dataSource.pageSize();
                        }
                    }).data("kendoGrid");
                }

                self.SetCurvasTabColor();
            },
            DetailInitCurvas: function (e, self) {
                var detailRow = e.detailRow;
                var datos = e.data;

                detailRow.find("#tpDetalleMultivalor").kendoTabStrip({
                    animation: {
                        open: {
                            effects: "fadeIn"
                        }
                    }
                });

                self.dsMultivalor = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerListadoKOPsMultivalorExpandidoDetalleOrden/" + parseInt(datos.ID_ORDEN) + "/" + parseInt(datos.ID_MAESTRO),
                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                            ,
                            cache: false
                        },
                    },
                    requestStart: function (e) {
                        if (!self.permisoVisualizacionKOPsMultivalor && !self.permisoGestionKOPsMultivalor) {
                            e.preventDefault();
                        }
                    },
                    pageSize: 100,
                    schema: {
                        model: {
                            id: "PK",
                            fields: {
                                'PK': { type: "string" },
                                'NAME': { type: "string" },
                                'VALOR_MAXIMO': { type: "string" },
                                'VALOR_MINIMO': { type: "string" },
                                'VALOR': { type: "string" },
                                'MEDIDA': { type: "string" },
                                'INDEX': { type: "number" }
                            }
                        }
                    },
                    sort: { field: "INDEX", dir: "asc" }
                });

                detailRow.find("#gridDetalleMultivalor").kendoGrid({
                    dataSource: self.dsMultivalor,
                    sortable: false,
                    resizable: false,
                    selectable: self.permisoGestionKOPsMultivalor ? "multiple, row" : false,
                    dataBound: function () {
                        onDataBoundCurvas();
                        self.eventsDetalle(self);
                    },
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    filterable: false,
                    pageable: false,
                    excel: {
                        //fileName: nombreKOP + ".xlsx",
                        allPages: true,
                        filterable: true
                    },
                    pdf: {
                        //fileName: nombreKOP + ".pdf",
                        //title: nombreKOP
                    },
                    scrollable: true,
                    toolbar: [{
                        template: function () {
                            if (self.permisoGestionKOPsMultivalor) {
                                return "<button type='button' id='btnSelTodos' class='k-button k-button-icontext " + datos.PK + "'><span class='k-icon k-i-hbars'></span>" + window.app.idioma.t('SELECCIONAR_TODOS') + "</button>"
                            } else {
                                return "<div></div>"
                            }
                        }
                    },
                    {
                        template: function () {
                            if (self.permisoGestionKOPsMultivalor) {
                                return "<button type='button' id='btnDesSelTodos' class='k-button k-button-icontext " + datos.PK + "'><span class='k-icon k-si-cancel'></span>" + window.app.idioma.t('DESELECCIONAR_TODOS') + "</button>"
                            } else {
                                return "<div></div>"
                            }
                        }
                    },
                    {
                        template: function () {
                            if (self.permisoGestionKOPsMultivalor) {
                                return "<span style='margin-left:10px;'>" + window.app.idioma.t('REGISTROS_SEL') + "</span> <span id='lblRegSel" + datos.PK + "' > 0 </span>"
                            } else {
                                return "<div></div>"
                            }
                        }
                    },
                    {
                        template: "<button type='button' id='btnExcelCurva" + datos.PK + "' class='k-button k-button-icontext @" + datos.PK + "-" + datos.NAME + "@ btnExcelCurva' style='float:right;background-color:darkorange; color:white;margin-left:5px;'> <span class='k-icon k-i-excel'></span>" + window.app.idioma.t('EXPORTAR_EXCEL') + "</button>"
                    },
                    {
                        template: "<button type='button' id='btnPDFCurva" + datos.PK + "' class='k-button k-button-icontext @" + datos.PK + "-" + datos.NAME + "@ btnPDFCurva' style='float:right;background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-pdf'></span>" + window.app.idioma.t('EXPORTAR_PDF') + "</button>"
                    },
                    {
                        template: function () {
                            if (self.permisoGestionKOPsMultivalor) {
                                return "<button id='btnAsignarCurva' data-funcion='FAB_PROD_EXE_9_GestionKOPsMultivalorActivos' class='btnAsignarCurva k-button " + datos.PK + " " + "k-button-icontext " + datos.DATATYPE + "' style='background-color: green; color: white; float:right'><span class='k-icon k-i-pencil' alt='icon' />" + window.app.idioma.t('APLICAR') + "</button>";
                            } else {
                                return "<div></div>"
                            }
                        }
                    },
                    {
                        template: function () {
                            if (self.permisoGestionKOPsMultivalor) {
                                return "<input id='" + String(datos.NAME).replace(/\s/g, '') + datos.PK + "' class='inputValor' style='float:right; width:180px;max-width:180px' />";
                            } else {
                                return "<div></div>"
                            }
                        }
                    },
                    {
                        template: function () {
                            if (self.permisoGestionKOPsMultivalor) {
                                return "<label  style='float:right;display:none'>" + window.app.idioma.t('VALOR_') + "</label><input type='checkbox' class='checkbox " + datos.PK + "'  checked='checked' style='float:right;display:none' />"
                            } else {
                                return "<div></div>"
                            }
                        }
                    }
                    ],
                    columns: [{
                        template: "<div class='circle_cells' style='background-color:#=SEMAFORO#;'/>",
                        field: "SEMAFORO",
                        width: "50px",
                        attributes: { style: "text-align:center;" },
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field === "all") {
                                    //handle the check-all checkbox template
                                    return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                } else {
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=SEMAFORO#' style='width: 14px;height:14px;margin-right:5px;'/><img id='imgEstadoKOP' style='width: 11px; height: 11px; vertical-align: initial;padding-right: 3px; background-color:#=SEMAFORO#;'></img> #= FILTRO_SEMAFORO # </label></div>";
                                }
                            }
                        }
                    },
                    {
                        title: "",
                        template: '<input class="checkbox checkboxGrid ' + datos.NAME + '"  type="checkbox" style="width: 14px; height: 14px;" />',
                        width: 30,
                        hidden: true
                    },
                    {
                        field: "INDEX",
                        title: window.app.idioma.t("INDICE")
                    },
                    {
                        field: "NAME",
                        title: window.app.idioma.t("DESCRIPCION")
                    },
                    {
                        field: "VALOR_MINIMO",
                        title: window.app.idioma.t("VALOR_MINIMO"),
                        template: function (e) {
                            return self.ObtenerValor(e, "VALOR_MINIMO")

                        }
                    },
                    {
                        field: "VALOR",
                        title: window.app.idioma.t("VALOR"),
                        template: function (e) {
                            return self.ObtenerValor(e, "VALOR")

                        }
                    },
                    {
                        field: "VALOR_MAXIMO",
                        title: window.app.idioma.t("VALOR_MAXIMO"),
                        template: function (e) {
                            return self.ObtenerValor(e, "VALOR_MAXIMO")
                        }

                    },
                    {
                        field: "MEDIDA",
                        title: window.app.idioma.t("UNIDAD_MEDIDA")
                    }
                    ],
                    dataBinding: function (e) {
                        kendo.ui.progress($("#gridDetalleMultivalor"), false);
                        self.ResizeTab;
                    }
                }).data("kendoGrid");

                function onDataBoundCurvas() {
                    var data = $("#gridDetalleMultivalor").data("kendoGrid")._data;

                    for (var x = 0; x < data.length; x++) {
                        var dataItem = data[x];
                        var tipo = dataItem.DATATYPE;

                        $("#valoresCurva").show();
                        switch (tipo.toLowerCase()) {
                            case "texto":
                            case "text":
                                $("#divtxtValorCurva").show();
                                $("#divnumValorCurva").hide();
                                $("#divfecValorCurva").hide();
                                break;
                            case "numero":
                            case "número":
                            case "number":
                                $("#divtxtValorCurva").hide();
                                $("#divnumValorCurva").show();
                                $("#divfecValorCurva").hide();


                                break;
                            case "datetime":
                            case "fecha":
                                $("#divtxtValorCurva").hide();
                                $("#divnumValorCurva").hide();
                                $("#divfecValorCurva").show();


                                break;
                            default:
                                $("#divtxtValorCurva").hide();
                                break;

                        }
                    }

                    $('[data-funcion]').checkSecurity();
                }

            },
            ActualizarValoresKOPSMultivalor: function () {
                var self = this;
                var data = $("#gridCurvas").data("kendoGrid").dataSource.data();
                function search(colorSemaforo, array) {
                    for (var i = 0; i < array.length; i++) {
                        if (array[i].SEMAFORO === colorSemaforo) {
                            return array[i];
                        }
                    }
                }

                var resultAzul = search("Azul", data);
                if (resultAzul)
                    self.opciones.KopsMultivalorSinRellenar = 1;
                else {
                    self.opciones.KopsMultivalorSinRellenar = 0;

                    var resultAmarillo = search("Amarillo", data);
                    self.opciones.KopsMultivalorFueraRango = resultAmarillo ? 1 : 0;
                }

                self.SetCurvasTabColor();

            },
            asignarCurvas: function (self) {
                var selectedKop = $("#gridCurvas").data("kendoGrid").dataItem(self.masterMultiValue);
                var nombre = selectedKop.NAME;
                var id = selectedKop.PK;
                var dataType = selectedKop.DATATYPE;
                var filasSeleccionadas = [];

                var tipo = dataType;

                var grid = $(self.objIndex).closest("#gridDetalleMultivalor").data("kendoGrid");
                kendo.ui.progress($(self.objIndex).closest("#gridDetalleMultivalor"), true);

                var value = null;
                switch (tipo.toLowerCase()) {
                    case "texto":
                    case "text":
                        value = $(self.objIndex)[0].value;
                        break;
                    case "número":
                    case "number":
                        if ($(self.objIndex).data("kendoNumericTextBox") === undefined)
                            value = $($(self.objIndex).find("#" + String(nombre).replace(/\s/g, '') + id)).data("kendoNumericTextBox").value();
                        else
                            value = $(self.objIndex).data("kendoNumericTextBox").value();
                        break;
                    case "fecha":
                    case "datetime":
                        if ($(self.objIndex).data("kendoDateTimePicker") === undefined)
                            value = $($(self.objIndex).find("#" + String(nombre).replace(/\s/g, '') + id)).data("kendoDateTimePicker").value();
                        else
                            value = $(self.objIndex).data("kendoDateTimePicker").value();

                        break;
                }

                $.each(grid.select(), function (index, item) {
                    filasSeleccionadas.push({ PK: id, Index: $(self.objIndex).closest("#gridDetalleMultivalor").data("kendoGrid").dataItem(item).INDEX, Value: value, PO: self.idorden });
                });

                if (filasSeleccionadas.length > 0) {

                    var datos = {};
                    datos.items = filasSeleccionadas;
                    localStorage["gridCurvas-options"] = kendo.stringify($(self.objIndex).closest("#gridCurvas").data("kendoGrid").getOptions());

                    $.ajax({
                        type: "POST",
                        url: "../api/actualizarGridCurvas/",
                        dataType: 'json',
                        data: JSON.stringify(datos),
                        contentType: "application/json; charset=utf-8",
                        cache: false,
                        async: true,
                    }).done(function (res) {
                        self.SetCurvasTabColor(res.message);
                        $(self.objIndex).closest("#gridCurvas").data("kendoGrid").dataSource.read();
                    }).fail(function (err) {
                        kendo.ui.progress($(self.objIndex).closest("#gridDetalleMultivalor"), false);
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ASIGNANDO_LOS_VALORES'), 2000);
                    });

                } else {
                    kendo.ui.progress($(self.objIndex).closest("#gridDetalleMultivalor"), false);
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONE_UN_REGISTRO'), 2000);
                }
            },
            OnDataBoundCurvasMaestro: function (grid) {
                var data = grid._data;
                for (var x = 0; x < data.length; x++) {

                    var dataItem = data[x];
                    var tr = $("#gridCurvas").find("[data-uid='" + dataItem.uid + "']");
                    if (dataItem.TIPO === "Multivalor") {
                        $("td:nth-child(1)", tr)[0].innerHTML = "";

                    }
                }
            },
            ConsultaGraficoCurva: function (grid, e) {
                var self = this;
                $("#gridCurvas").hide();
                $("#btnGrafico").hide();
                $("#chart").show();
                $("#btnTabla").show();
                $("#btnExcelCurvaGrafico").show();
                $("#btnPDFCurvaGrafico").show();

                var tr = $(e.target).closest("tr");
                var data = grid.dataItem(tr);
                var _pkKOP = data.ID_MAESTRO;

                $.ajax({
                    type: "POST",
                    async: false,
                    url: "../api/ObtenerValorCurvaGrafico/" + parseInt(_pkKOP) + "/" + parseInt(self.idorden),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        var results = data;
                        var nombre = $("#gridCurvas").data("kendoGrid").dataItem(e.currentTarget.parentElement.parentElement).NAME;


                        $("#chart").kendoChart({
                            pdf: {
                                fileName: nombre + ".pdf",
                            },
                            title: {
                                text: nombre
                            },
                            legend: {
                                position: "bottom"
                            },
                            seriesDefaults: {
                                type: "line"
                            },
                            pannable: {
                                lock: "y"
                            },
                            zoomable: {
                                mousewheel: {
                                    lock: "y"
                                },
                                selection: {
                                    lock: "y"
                                }
                            },
                            series: results.series,
                            seriesColors: ["#088A29", "#878787", "#E0E0E0"],
                            valueAxis: {
                                labels: {
                                    format: "{0} "
                                },
                                line: {
                                    visible: false
                                },
                                axisCrossingValue: -10
                            },
                            categoryAxis: {
                                categories: results.Fields,
                                majorGridLines: {
                                    visible: false
                                },
                                labels: {
                                    rotation: "auto"
                                }
                            },
                            tooltip: {
                                visible: true,
                                format: "{0}",
                                template: "#= series.name #: #= value #"
                            }
                        });
                    },
                    error: function (response) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS_VALORES'), 2000);
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
                $("#chart").append("<div id='iconsalir'>X</div>")
            },
            ExcelCurva: function (data, e) {

                var rows = [];
                rows.push({
                    cells: [
                        { value: window.app.idioma.t("SEMAFORO"), background: "#7A7A7A", color: "#FFFFFF" },
                        { value: window.app.idioma.t("INDICE"), background: "#7A7A7A", color: "#FFFFFF" },
                        { value: window.app.idioma.t("DESCRIPCION"), background: "#7A7A7A", color: "#FFFFFF" },
                        { value: window.app.idioma.t("VALOR_MINIMO"), background: "#7A7A7A", color: "#FFFFFF" },
                        { value: window.app.idioma.t("VALOR"), background: "#7A7A7A", color: "#FFFFFF" },
                        { value: window.app.idioma.t("VALOR_MAXIMO"), background: "#7A7A7A", color: "#FFFFFF" },
                        { value: window.app.idioma.t("UNIDAD_MEDIDA"), background: "#7A7A7A", color: "#FFFFFF" }

                    ]
                })
                for (var i = 0; i < data.length; i++) {
                    // Push single row for every record.
                    if (data[i].DATATYPE == 'float') {
                        data[i].VALOR_MINIMO = data[i].VALOR_MINIMO != "" ? parseFloat(data[i].VALOR_MINIMO).toFixed(2).replace(".", ",") : "";
                        data[i].VALOR = data[i].VALOR != "" ? parseFloat(data[i].VALOR).toFixed(2).replace(".", ",") : "";
                        data[i].VALOR_MAXIMO = data[i].VALOR_MAXIMO != "" ? parseFloat(data[i].VALOR_MAXIMO).toFixed(2).replace(".", ",") : "";
                    }
                    rows.push({
                        cells: [
                            { value: data[i].FILTRO_SEMAFORO },
                            { value: data[i].INDEX },
                            { value: data[i].NAME },
                            { value: data[i].VALOR_MINIMO },
                            { value: data[i].VALOR },
                            { value: data[i].VALOR_MAXIMO },
                            { value: data[i].MEDIDA }

                        ]
                    })
                }
                var workbook = new kendo.ooxml.Workbook({
                    sheets: [
                        {
                            filter: { from: 0, to: 6 },
                            columns: [
                                { autoWidth: true },
                                { autoWidth: true },
                                { autoWidth: true },
                                { autoWidth: true },
                                { autoWidth: true },
                                { autoWidth: true },
                                { autoWidth: true }
                            ],
                            rows: rows
                        }
                    ]
                });
                // Save the file as an Excel file with the xlsx extension.
                kendo.saveAs({ dataURI: workbook.toDataURL(), fileName: e.currentTarget.className.split("@")[1] + ".xlsx" });
            },
            PdfCurva: function (self, e) {
                var nombre = e.currentTarget.className.split("@")[1];
                $(e.currentTarget.closest(".k-grid")).data("kendoGrid").options.pdf.fileName = nombre + ".pdf";
                $(e.currentTarget.closest(".k-grid")).data("kendoGrid").saveAsPDF();
            },
            SetCurvasTabColor: function (colorparam = null) {
                var self = this;
                var color = "black";
                var backGroundColor = "#eae8e8";

                $.ajax({
                    type: "POST",
                    async: true,
                    url: "../api/KOPsFab/ObtenerEstadoKOPMultivalorDetalleOrden/" + self.order.PK,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        if (self.estadoColor.Azul == response) {
                            backGroundColor = "#4168E0";
                            color = "white";
                        }
                        else if (self.estadoColor.Amarillo == response) {
                            backGroundColor = "#FECD00";
                            color = "black";
                        }
                        else if (self.estadoColor.Verde == response) {
                            backGroundColor = "lightgreen";
                            color = "black";
                        } else {
                            backGroundColor = response;
                            color = "black";
                        }
                        $("#divCurvas").css("background-color", backGroundColor);
                        $("#divCurvas .k-link").css("color", color);
                    },
                    error: function (response) {

                    }
                });
            },

            Rgb2Hex: function (rgb) {
                rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                function hex(x) {
                    return ("0" + parseInt(x).toString(16)).slice(-2);
                }
                return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
            },
            SetColorTabKOPSConstantes: function () {
                var self = this;
                var self = this;
                var self = this;
                var color = "white";
                var backGroundColor = "#eae8e8";

                $.ajax({
                    type: "POST",
                    async: true,
                    url: "../api/KOPsFab/ObtenerEstadoKOPDetalleOrden/" + self.idorden,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        if (self.estadoColor.Azul == response) {
                            backGroundColor = "#4168E0";
                            color = "white";
                        }
                        else if (self.estadoColor.Amarillo == response) {
                            backGroundColor = "#FECD00";
                            color = "black";
                        }
                        else if (self.estadoColor.Verde == response) {
                            backGroundColor = "lightgreen";
                            color = "black";
                        } else {

                            backGroundColor = response;
                            color = self.GetBrillo(response);
                        }
                        $("#divKOPS").css("background-color", backGroundColor);
                        $("#divKOPS .k-link").css("color", color);
                    },
                    error: function (response) {

                    }
                });
            },
            SetWOKOPColor: function () {
                var self = this;

                var color = "Verde";
                var colorCurvas = self.GetColorName(self.Rgb2Hex($("#divCurvas").css("background-color")));
                var colorKOPS = self.GetColorName(self.Rgb2Hex($("#divKOPS").css("background-color")));

                if (colorCurvas === colorKOPS) {
                    color = colorCurvas;
                } else {
                    if (((colorCurvas === "Amarillo" || colorCurvas === "Verde") && colorKOPS === "Azul") || ((colorKOPS === "Amarillo" || colorKOPS === "Verde") && colorCurvas === "Azul"))
                        color = "Azul";
                    else
                        if ((colorCurvas === "Amarillo" && colorKOPS === "Verde") || (colorCurvas === "Verde" && colorKOPS === "Amarillo"))
                            color = "Amarillo";
                }

                var kop = {};
                kop.orderId = self.idorden;
                kop.value = color;
            },
            SwitchColorEstadoActual: function (color, self) {
                if (self.order.EstadoActual.Recalcular)
                    color = "#f77918";

                $("#imgEstadoOrden").css("background-color", color + " !important");
            },
            GetBrillo: function (color) {
                var color = "" + color
                var m = color.substr(1).match(color.length == 7 ? /(\S{2})/g : /(\S{1})/g);
                if (m) var r = parseInt(m[0], 16), g = parseInt(m[1], 16), b = parseInt(m[2], 16);
                var valorBrillo;
                if (typeof r != "undefined")
                    valorBrillo = ((r * 299) + (g * 587) + (b * 114)) / 1000;

                var valor = "#fff";
                if (((valorBrillo) / 255) > 0.5)
                    valor = "#000";
                return valor;
            },
            GetColorName: function (color) {
                switch (color.toUpperCase()) {
                    case "#4168E0":
                        color = "Azul"
                        break;
                    case "#FECD00":
                        color = "Amarillo"
                        break;
                    default:
                        color = "Verde"
                }
                return color;
            },
            ObtenerValor: function (datos, columna) {
                if (datos.DATATYPE == "float") {
                    if (datos[columna] !== "") {
                        return "<div>" + parseFloat(datos[columna]).toFixed(2).replace(".", ",") + "</div>"
                    } else {
                        return "<div>" + datos[columna] + "</div>"
                    }
                } else {
                    return "<div>" + datos[columna] + "</div>"
                }
            },
            ValidarPermisos: function (self) {

                if (self.isOrdenActiva) {
                    self.permisoVisualizacionKOPsMultivalor = TienePermiso(247) || TienePermiso(242);
                    self.permisoGestionKOPsMultivalor = TienePermiso(242);
                } else {
                    self.permisoVisualizacionKOPsMultivalor = TienePermiso(248) || TienePermiso(243);
                    self.permisoGestionKOPsMultivalor = false;
                }

            }
        });
        return vistaDetalleOrdenKOPsMultivalor;
    });