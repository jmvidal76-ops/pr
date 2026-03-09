define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/vpVerDetalleOrden_KOPs.html',
    'compartido/notificaciones',
    'vistas/vDialogoConfirm',
    'jszip', 'compartido/utils', 'definiciones'
],
    function (_, Backbone, $, FormDetalleOrden, Not, VistaDlgConfirm, JSZip, utils, definiciones) {
        var vistaDetalleOrdenKOPs = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenidoKOPs',
            confirmacion: null,
            dialogoConfirm: null,
            dsConsumo: [],
            dsKOPSMaestros: null,
            dsKOPS: null,
            gridKOPS: null,
            idorden: 0,
            opciones: null,
            order: [],
            template: _.template(FormDetalleOrden),
            ventanaEditarCrear: null,
            isOrdenActiva: true,
            Recalcular: false,
            Tipo_KOP_Mod: '',
            ColorEstado: '',
            IdEstadoWO: definiciones.IdEstadoWO(),
            tipoWO: definiciones.TipoWO(),
            estadosKOP: definiciones.EstadoKOP(),
            estadoColor: definiciones.EstadoColor(),
            permisoVisualizacionKOPs: false,
            permisoGestionKOPs: false,
            IdTipoOrden: null,
            window: null,
            initialize: function (order, idOrden, opciones, ordenEstado) {
                var self = this;
                window.JSZip = JSZip;
                self.opciones = opciones
                kendo.ui.progress(self.$("#contenedor"), true);
                self.order = order;
                self.idorden = idOrden;
                self.Recalcular = order.EstadoActual.Recalcular;
                self.isOrdenActiva = ordenEstado;
                self.IdTipoOrden = parseInt(self.order.TipoOrden.ID);
                self.ValidarPermisos(self);

                self.dsKOPS = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/OrdenesFab/ObtenerKOPsOrden/" + parseInt(idOrden) + "/" + order.TipoOrden.ID,
                            dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                            cache: false
                        }
                    },
                    requestStart: function (e) {
                        if (!self.permisoVisualizacionKOPs && !self.permisoGestionKOPs) {
                            e.preventDefault();
                        }
                    },
                    pageSize: 200,
                    schema: {
                        model: {
                            id: "Cod_KOP",
                            fields: {
                                'Cod_KOP': { type: "number" },
                                'ID_KOP': { type: "string" },
                                'Des_KOP': { type: "string" },
                                'Cod_Orden': { type: "number" },
                                'ID_Orden': { type: "string" },
                                'ID_Procedimiento': { type: "string" },
                                'Tipo_KOP': { type: "string" },
                                'Valor_Actual': { type: "string" },
                                'Valor_Minimo': { type: "string" },
                                'Valor_Maximo': { type: "string" },
                                'Obligatorio': { type: "number" },
                                'UOM_KOP': { type: "string" },
                                'Fecha': { type: "date" },
                                'Cod_Procedimiento': { type: "number" },
                                'TipoKOP': { type: "string" },
                                'Sequence_Procedimiento': { type: "number" },
                                'PkActVal': { type: "number" },
                                'Sequence_KOP': { type: "number" },
                                'Editable': { type: "boolean" }
                            }
                        },
                        parse: function (data) {
                            var parsedData = data.forEach(x => {
                                if (x.UOM_KOP == "ts" && x.Valor_Actual == "0") {
                                    x.Valor_Actual = "";
                                }
                            });
                            return data;
                        }
                    }, //,
                    sort: { field: "Des_KOP", dir: "asc" }
                });

                self.render(self);
                //self.SetWOKOPColor();

            },
            render: function (self) {
                $(self.el).html(this.template());
                self.CargarTabKOPSConstantes(self);
            },
            events: function (self) {
                $(".editarKOP").on("click", function (e) {
                    var tr = e.target.closest("tr");
                    var data = $('#gridKOPS').data('kendoGrid').dataItem(tr);
                    self.EditarKOPS(self, data);
                });

                $("#btnRecalcular").on("click", function (e) {
                    if (self.Recalcular) {
                        self.RecalcularFormulas(self);
                        self.Recalcular = false;
                    }
                });

            },
            CargarTabKOPSConstantes: function (self) {
                if (!$("#gridKOPS").data("kendoGrid")) {
                    self.CargarGridKOPS(self);
                } else {
                    self.dsKOPS.read();
                }
            },
            CargarGridKOPS: function (self) {
                //Grid KOPS
                self.gridKOPS = $("#gridKOPS").kendoGrid({
                    dataSource: self.dsKOPS,
                    dataBound: function (e) {
                        self.OnDataBoundKOPS(e, self, this);
                        $('[data-funcion]').checkSecurity();
                        LimpiarFiltros = self.LimpiarFiltros;
                        self.events(self);
                    },

                    //rowTemplate: '<tr data-uid="#= uid #"><td><div class="#: Valor_Minimo>100 ? \"circulorojo\" : \"circuloazul\" #"></div></td><td><a id="btnEditar" class="k-button k-grid-edit" data-funcion="FAB_PROD_EXE_9_GestionDelEstadoDeLasWo" style="min-width:16px;"><span class="k-icon k-edit"></span></a></td><td>#: Des_KOP #</td><td>#: ID_Procedimiento #</td><td>#: Valor_Actual #</td><td>#: Valor_Minimo #</td><td>#: Valor_Maximo #</td><td>#: UOM_KOP #</td><td>#: kendo.toString(Fecha, "dd/MM/yyyy HH:mm:ss" ) #</td></tr>',
                    //<tr data-uid="#= uid #"><td></td><td></td>Des_KOP<td></td><td>#: ID_Procedimiento #</td><td class="#:Valor_Actual>=Valor_Minimo && Valor_Actual<=Valor_Maximo ? \"red\" : \"white\"#">#:Valor_Actual #</td></tr>',
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    toolbar: [
                        {
                            template: function () {
                                if (self.permisoGestionKOPs) {
                                    return "<button id='btnRecalcular' data-funcion='FAB_PROD_EXE_9_GestionKOPActivos' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;'><span class='k-icon k-i-calculator'></span>" + window.app.idioma.t('RECALCULAR_KOPS') + "</button>";
                                } else {
                                    return "";
                                }
                            },
                        },
                        {
                            template: "<button id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext k-i-delete' style='background-color:darkorange; color:white;margin-left:5px;' onClick='LimpiarFiltros()'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        }

                    ],
                    sortable: true,
                    scrollable: true,
                    resizable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: [200, 400, 600],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [{
                        field: "Cod_KOP",
                        title: window.app.idioma.t("KOP"),
                        hidden: true
                    },
                    {
                        template: "<div class='circle_cells' style='background-color:#=Semaforo#;'/>",
                        field: 'Semaforo',
                        title: '',
                        width: "30px",
                        attributes: { style: "text-align:center;" },
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field === "all") {
                                    //handle the check-all checkbox template
                                    return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                } else {
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#= Semaforo #' style='width: 14px;height:14px;margin-right:5px;'/><img id='imgEstadoKOP' style='width: 11px; height: 11px; vertical-align: initial;margin-right: 3px; background-color:#=Semaforo#;'></img>#= filtroSemaforo # </label></div>";
                                }
                            }
                        }
                    },
                    {

                        template: function (e) {
                            if (self.permisoGestionKOPs) {
                                return "<button id='btnEditar" + e.Cod_KOP + "' class='k-button k-grid-edit editarKOP' data-funcion='FAB_PROD_EXE_9_GestionWoActivas' style='min-width:16px;'><span class='k-icon k-edit'></span></button> ";
                            } else {
                                return "";
                            }

                        },
                        width: "40px",
                        attributes: { style: "text-align:center;" }
                    },
                    {
                        field: "Des_KOP",
                        title: window.app.idioma.t("KOP"),
                        width: "200px",
                        attributes: {
                            style: 'white-space: nowrap '
                        }
                    },

                    {
                        field: "ID_Procedimiento",
                        title: window.app.idioma.t("PROCEDIMIENTO"),
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field === "all") {
                                    //handle the check-all checkbox template
                                    return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                } else {
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=ID_Procedimiento#' style='width: 14px;height:14px;margin-right:5px;'/>#= ID_Procedimiento#</label></div>";
                                }
                            }
                        },
                        width: "150px",
                    },
                    {
                        field: "TipoKOP",
                        title: window.app.idioma.t("TIPO"),
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field === "all") {
                                    //handle the check-all checkbox template
                                    return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                } else {
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=TipoKOP#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoKOP#</label></div>";
                                }
                            }
                        },
                        width: "80px",
                    },
                    {
                        field: "Valor_Minimo",
                        title: window.app.idioma.t("VALOR_MINIMO"),
                        width: "80px",
                        template: function (e) {
                            return self.ObtenerValor(e, "Valor_Minimo")
                        }
                    },
                    {
                        field: "Valor_Actual",
                        title: window.app.idioma.t("VALOR"),
                        width: "80px",
                        template: function (e) {
                            return self.ObtenerValor(e, "Valor_Actual")
                        }
                    },
                    {
                        field: "Valor_Maximo",
                        title: window.app.idioma.t("VALOR_MAXIMO"),
                        width: "80px",
                        template: function (e) {
                            return self.ObtenerValor(e, "Valor_Maximo")
                        }
                    },
                    {
                        field: "UOM_KOP",
                        template: "#=UOM_KOP#",
                        title: window.app.idioma.t("UNIDAD_MEDIDA"),
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field === "all") {
                                    //handle the check-all checkbox template
                                    return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                } else {
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=UOM_KOP#' style='width: 14px;height:14px;margin-right:5px;'/>#= UOM_KOP#</label></div>";
                                }
                            }
                        },
                        width: "50px"
                    },
                    {
                        field: "Fecha",
                        title: window.app.idioma.t("FECHA"),
                        template: '#= Fecha !== null ? kendo.toString(Fecha, "' + kendo.culture().calendars.standard.patterns.MES_FechaHora + '" ) : "" #',
                        width: "100px",
                        format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                        filterable: {
                            ui: function (element) {
                                element.kendoDateTimePicker({
                                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                    culture: localStorage.getItem("idiomaSeleccionado")
                                });
                            }
                        }
                    },
                    {
                        field: "Tipo_KOP",
                        hidden: true
                    },
                    {
                        field: "ID_Orden",
                        hidden: true
                    },
                    {
                        field: "Cod_Procedimiento",
                        hidden: true
                    },
                    {
                        field: "ID_KOP",
                        hidden: true
                    },
                    {
                        field: "PkActVal",
                        hidden: true
                    }
                    ],
                    filterMenuInit: function (e) {
                        if (e.field === "ID_Procedimiento" || e.field === "UOM_KOP") {
                            var filterMultiCheck = this.thead.find("[data-field=" + e.field + "]").data("kendoFilterMultiCheck")
                            filterMultiCheck.container.empty();
                            filterMultiCheck.checkSource.sort({ field: e.field, dir: "asc" });

                            // uncomment the following line to handle any grouping from the original dataSource:
                            // filterMultiCheck.checkSource.group(null);

                            filterMultiCheck.checkSource.data(filterMultiCheck.checkSource.view().toJSON());
                            filterMultiCheck.createCheckBoxes();
                        }
                    }
                }).data("kendoGrid");

                $("#gridKOPS").kendoTooltip({
                    filter: "td:nth-child(4)",
                    //position: "right",
                    width: 300,
                    content: function (e) {
                        var dataItem = $("#gridKOPS").data("kendoGrid").dataItem(e.target.closest("tr"));
                        var content = dataItem.Des_KOP;
                        return content;
                    }
                }).data("kendoTooltip");
                if (self.Recalcular) {
                    $("#btnRecalcular").css("background-color", "orange");
                }

            },
            CambiarFechaLocalaUTC: function (Valor_Actual) {
                var cambiarFecha = kendo.toString(kendo.parseDate(((kendo.parseDate(Valor_Actual)).toISOString()).slice(0, -1)), kendo.culture().calendars.standard.patterns.MES_FechaHora);
                return cambiarFecha;
            },
            eliminar: function () {
                this.remove();
            },
            RecalcularFormulas: function (self) {
                kendo.ui.progress($('#gridKOPS'), true);
                setTimeout(function () {
                    $.ajax({
                        type: "GET",
                        url: "../api/OrdenesFab/RecalcularKOPs/" + self.idorden + "/" + self.IdTipoOrden,
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        cache: false,
                        async: true
                    }).success(function (res) {
                        $('#gridKOPS > div.k-pager-wrap.k-grid-pager.k-widget.k-floatwrap > a.k-pager-refresh.k-link').click();
                        self.order.EstadoActual.Recalcular = false;
                        self.SwitchColorEstadoActual(self.order.EstadoActual.Color, self);
                        $("#btnRecalcular").css("background-color", "");
                        self.SetColorTabKOPSConstantes(self);
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('RECALCULAR_CORRECTAMENTE'), 4000);
                        self.cargarCabeceraRecalculada(self);
                        kendo.ui.progress($('#gridKOPS'), false);
                    }).fail(function (err) {
                        self.Recalcular = true;
                        kendo.ui.progress($('#gridKOPS'), false);
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_RECALCULAR_KOPS'), 4000);

                    });
                }, 1000);

            },
            OnDataBoundKOPS: function (e, self, grid) {
                self.resizeGrid("#gridKOPS");
                var data = grid._data;


                for (var x = 0; x < data.length; x++) {
                    var dataItem = data[x];
                    var tr = $("#gridKOPS").find("[data-uid='" + dataItem.uid + "']");
                    var element = $(e.sender.element).data("kendoGrid").dataItem(tr);
                    var cell = element.Cod_KOP;
                    var id = element.Cod_KOP;
                    var tipoKOP = element.TipoKOP;
                    var desc = dataItem.Des_KOP;
                    /*
                    Ocultar boton de Editar en las calculadas
                    */
                    if (!TienePermiso(211))  // || (tipo == "Multivalor"))
                    {
                        $("#btnEditar" + id).remove();
                    } else {
                        if (element.Editable == false) {
                            $("#btnEditar" + id).remove();
                        }
                        if ((tipoKOP === "CALCULADO") || desc.includes("COC059") || desc.includes("COC001"))// || (tipo == "Multivalor"))
                        {
                            $("#btnEditar" + id).remove();
                        }
                    }
                }

            },
            EditarKOPS: function (self, data) {
                //var self = this;
                var anchura = 870;
                var tr = "";

                switch (data.UOM_KOP.toLowerCase()) {
                    case "hh:mm:ss":
                        anchura = 970;
                        break;
                }

                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='window'></div>"));

                $("#window").kendoWindow({
                    title: window.app.idioma.t('EDITARKOP'),
                    width: anchura,
                    top: "339",
                    left: "410",
                    height: "210",
                    content: "Fabricacion/html/EditarKOPS.html",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    close: function () {
                        self.ventanaEditarCrear.destroy();
                        self.ventanaEditarCrear = null;
                    },
                    refresh: function () {
                        self.CargaContenido(self, data);
                    }
                });
                self.ventanaEditarCrear = $('#window').data("kendoWindow");
                self.ventanaEditarCrear.center();
                self.ventanaEditarCrear.open();
            },
            CargaContenido: function (self, data) {

                //Traducimos los label del formulario
                //var self = this;

                $("#btnCancelarKOP").kendoButton();
                $("#lblNombre").text(window.app.idioma.t('NOMBRE') + ": ");
                $("#lblProcedimiento").text(window.app.idioma.t('PROCEDIMIENTO') + ": ");
                $("#lblTipo").text(window.app.idioma.t('TIPO') + ": ");
                $("#lblMinimo").text(window.app.idioma.t('VALOR_MINIMO') + ": ");
                $("#lblValor").text(window.app.idioma.t("VALOR") + ": ");
                $("#lblMaximo").text(window.app.idioma.t('VALOR_MAXIMO') + ": ");
                $("#lblUom").text(window.app.idioma.t('UNIDAD_MEDIDA') + ": ");
                $("#btnAceptarKOP").text(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarKOP").text(window.app.idioma.t('CANCELAR'));
                $("#lblTextValor").text(window.app.idioma.t('ANTIGUO_VALOR') + ": ");

                $("#btnAceptarKOP").kendoButton({
                    click: function (e) { e.preventDefault(); self.ConfirmarEdicion(self); }
                });
                $("#btnCancelarKOP").kendoButton({
                    click: function (e) { e.preventDefault(); self.CancelarFormulario(); }
                });


                $("#lblIDKOP").text(data.ID_KOP);
                $("#lblIDOrden").text(data.ID_Orden);
                $("#lblCodProc").text(data.Cod_Procedimiento);

                $("#lblAntiguoValor").text(data.Valor_Actual == "" ? "" : data.UOM_KOP.toUpperCase() === 'TS' ? kendo.toString(kendo.parseDate(kendo.toString(kendo.parseDate(data.Valor_Actual), kendo.culture().calendars.standard.patterns.s) + 'Z'), kendo.culture().calendars.standard.patterns.MES_FechaHora) : data.Valor_Actual);

                var maximo = 40;

                $("#txtNombre").text(data.Des_KOP);

                if (data.Des_KOP.length > maximo) {
                    $("#txtNombre").kendoTooltip({
                        filter: $("#txtNombre"),
                        content: function (e) {
                            var content = data.Des_KOP;
                            return content;
                        }
                    }).data("kendoTooltip");
                }


                $("#txtProcedimiento").text(data.ID_Procedimiento);
                $("#txtTipo").text(data.TipoKOP);
                $("#txtTipoKop").text(data.Tipo_KOP);
                $("#txtMinimo").text(data.Valor_Minimo === null ? "-" : ($.isNumeric(data.Valor_Minimo.replace(",", ".")) ? kendo.format("{0:n5}", parseFloat(data.Valor_Minimo.replace(",", "."))) : data.Valor_Minimo));
                $("#txtMaximo").text(data.Valor_Maximo === null ? "-" : ($.isNumeric(data.Valor_Maximo.replace(",", ".")) ? kendo.format("{0:n5}", parseFloat(data.Valor_Maximo.replace(",", "."))) : data.Valor_Maximo));
                $("#txtUom").text(data.UOM_KOP);
                $("#lblActValPK").text(data.Cod_KOP);
                self.Tipo_KOP_Mod = data.Tipo_KOP;

                switch (data.Tipo_KOP.toLowerCase()) {
                    case "numeric":
                    case "int":
                        $("#txtValor").kendoNumericTextBox({
                            placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                            decimals: 0,
                            culture: localStorage.getItem("idiomaSeleccionado"),
                            format: 'n0',
                            value: parseInt(FormatearNumericosPorRegion(data.Valor_Actual), localStorage.getItem("idiomaSeleccionado"))
                        });
                        if (data.Valor_Maximo !== "") {
                            $("#txtMaximo").text(parseInt(FormatearNumericosPorRegion(data.Valor_Maximo), localStorage.getItem("idiomaSeleccionado")));
                        }
                        if (data.Valor_Minimo !== "") {
                            $("#txtMinimo").text(parseInt(FormatearNumericosPorRegion(data.Valor_Minimo), localStorage.getItem("idiomaSeleccionado")));
                        }
                        if (data.Valor_Actual !== "") {
                            $("#lblAntiguoValor").text(parseInt(FormatearNumericosPorRegion(data.Valor_Actual), localStorage.getItem("idiomaSeleccionado")));
                        }
                        break;
                    case "float":
                        switch (data.UOM_KOP.toLowerCase()) {
                            case "hh:mm:ss":
                                $(".UOMOtros").hide();
                                $(".UOMhms").show();

                                var arrHorario = ""
                                var dias = "";
                                var horas = "";
                                var minutos = "";
                                var segundos = "";

                                if (data.Valor_Minimo == "") {
                                    $("#txtMinimo").text();
                                } else {
                                    $("#txtMinimo").text(ConversorHorasMinutosSegundos(data.Valor_Minimo * 3600));
                                }

                                if (data.Valor_Actual == "") {
                                    $("#lblAntiguoValor").text("")

                                } else {
                                    arrHorario = ConversorHorasMinutosSegundos(data.Valor_Actual * 3600)
                                    $("#lblAntiguoValor").text(arrHorario);
                                    arrHorario = arrHorario.split(":");
                                    if (arrHorario.length != 0) {
                                        dias = parseInt(parseInt(arrHorario[0]) / 24);
                                        horas = parseInt(arrHorario[0]) % 24;
                                        minutos = parseInt(arrHorario[1]);
                                        segundos = parseInt(arrHorario[2]);
                                    }
                                }
                                $("#txtDiaValor").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: dias,
                                    min: 0,
                                    max: 50
                                });
                                $("#txtHoraValor").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: horas,
                                    min: 0,
                                    max: 23
                                });
                                $("#txtMinutosValor").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: minutos,
                                    min: 0,
                                    max: 59
                                });
                                $("#txtSegundosValor").kendoNumericTextBox({
                                    placeholder: "--",
                                    decimals: 0,
                                    culture: kendo.culture().name,
                                    format: 'n0',
                                    value: segundos,
                                    min: 0,
                                    max: 59
                                });
                                if (data.Valor_Maximo == "") {
                                    $("#txtMaximo").text();
                                } else {
                                    $("#txtMaximo").text(ConversorHorasMinutosSegundos(data.Valor_Maximo * 3600));
                                }
                                $(".Inputhms").css('width', '4em')
                                break;
                            default:
                                $("#txtValor").kendoNumericTextBox({
                                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                                    decimals: 5,
                                    culture: localStorage.getItem("idiomaSeleccionado"),
                                    format: 'n5',
                                    value: parseFloat(FormatearNumericosPorRegion(data.Valor_Actual), localStorage.getItem("idiomaSeleccionado"))
                                });
                                if (data.Valor_Maximo !== "") {
                                    $("#txtMaximo").text(parseFloat(data.Valor_Maximo).toFixed(5).replace(".", ","));
                                }
                                if (data.Valor_Minimo !== "") {
                                    $("#txtMinimo").text(parseFloat(data.Valor_Minimo).toFixed(5).replace(".", ","));
                                }
                                if (data.Valor_Actual !== "") {
                                    $("#lblAntiguoValor").text(parseFloat(data.Valor_Actual).toFixed(5).replace(".", ","));
                                }
                                break;
                        }
                        break;
                    case "datetime":
                        if (data.Valor_Actual !== null && data.Valor_Actual !== "") {
                            $("#txtValor").kendoDateTimePicker({
                                format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                culture: localStorage.getItem("idiomaSeleccionado"),
                                value: new Date(kendo.toString(kendo.parseDate(data.Valor_Actual), kendo.culture().calendars.standard.patterns.s) + "Z")
                            });
                        } else {
                            $("#txtValor").kendoDateTimePicker({
                                format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                culture: localStorage.getItem("idiomaSeleccionado"),
                                value: new Date()
                            });
                        }
                        if ($("#txtValor").val() != '') {
                            $("#txtValor").val(kendo.toString(kendo.parseDate($("#txtValor").val()), kendo.culture().calendars.standard.patterns.MES_FechaHora));
                        }
                        break;
                    case "string":
                        $("#txtValor").addClass("k-textbox");
                        $("#txtValor").val(data.Valor_Actual);
                        break;
                }
                //$("#txtValor").text(data.Valor_Actual);
            },
            resizeGrid: function (id) {

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltros").innerHeight();
                var divtabla = $("#tablaOrden").innerHeight();

                var gridElement = $(id),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - cabeceraHeight - divtabla - 155);

                if (id === "#gridKOPS") {
                    var gridElement2 = $("#gridEditor"),
                        dataArea2 = gridElement2.find(".k-grid-content")
                    dataArea2.height(contenedorHeight - cabeceraHeight - divtabla - 110);
                }
            },
            LimpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },

            ConfirmarEdicion: function (self) {
                var valor = "";

                if ($("#txtTipoKop").html() == "float" && $("#txtUom").html() == "hh:mm:ss") {
                    valor = ConversorDiasHorasMinutosSegundosAHoras("Valor");
                    if (valor !== "") {
                        $("#txtValor").val(parseFloat(valor).toFixed(5));
                    } else {
                        $("#txtValor").val("");
                    }
                }

                valor = $("#txtValor").val() === "" ? $("#txtValor").text() : $("#txtValor").val();
                
                $("#lblErrorValor").hide();
                self.EditarKOPConfirma(self);
                
            },
            EditarKOPConfirma: function (self) {
                var valorEditar = $("#txtValor").val() === "" ? $("#txtValor").text() : $("#txtValor").val();
                var fechaAct = $("#txtFecha").val();
                var unidadMedida = $("#txtUom").text();

                kendo.ui.progress($('#window').parents(0), true);

                var pl = {};
                pl.Fecha = typeof fechaAct != "undefined" ? FormatearFechaPorRegion(fechaAct) : new Date();
                var valor = "";
                if (unidadMedida.toUpperCase() === 'TS' && typeof valorEditar != "undefined" && valorEditar != "") {
                    valorEditar = self.CambiarFechaLocalaUTC(valorEditar);
                    valorEditar = FormatearFechaPorRegion(valorEditar);
                    if (valorEditar === null) {
                        kendo.ui.progress($('#window').parents(0), false);
                        $("#lblErrorValor").text(window.app.idioma.t('FECHA_INCORRECTA'));
                        $("#lblErrorValor").show();
                        return;
                    }
                    else {
                        $("#lblErrorValor").hide();
                    }
                }
                pl.ValorKOP = valorEditar;
                pl.IDOrden = $("#lblIDOrden").text();
                pl.Cod_Procedimiento = $("#lblCodProc").text();
                pl.nombreKop = $("#lblIDKOP").text();
                pl.UOM = $("#txtUom").text();
                pl.PkActVal = $("#lblActValPK").text();
                pl.Tipo_KOP = self.Tipo_KOP_Mod;

                if ($("#lblAntiguoValor").text().length > 0 && $("#lblAntiguoValor").text() !== "-") {
                    pl.valorAnterior = true;
                } else {
                    pl.valorAnterior = false;
                }

                setTimeout(function () {
                    $.ajax({
                        data: JSON.stringify(pl),
                        type: "POST",
                        async: false,
                        url: "../api/KOPsFab/editarValoresKOP",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function () {

                            $("#btnRecalcular").css("background-color", "orange");
                            $("#imgEstadoOrden").attr("src", "img/KOP_Naranja.png");
                            self.order.EstadoActual.Recalcular = true;
                            self.dsKOPS.read();
                            Backbone.trigger('eventCierraDialogo');
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HAN_MODIFICADO_CORRECTAMENTE'), 2000);
                            kendo.ui.progress($('#window').parents(0), false);
                            self.ventanaEditarCrear.close();
                            self.ActualizarValoresKOPSConstantes(self);
                            //self.ActualizarListadoWO(self.id);
                            self.SetWOKOPColor();
                            self.Recalcular = true;
                            //self.ventanaEditarCrear.destroy();
                            //self.ventanaEditarCrear = null;
                        },
                        error: function (response) {
                            kendo.ui.progress($('#window').parents(0), false);
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS_VALORES'), 2000);
                            Backbone.trigger('eventCierraDialogo');
                        }
                    });
                }, 1000);
                self.Tipo_KOP_Mod = '';

            },
            ActualizarValoresKOPSConstantes: function (self) {

                var data = $("#gridKOPS").data("kendoGrid").dataSource.data();
                function search(colorSemaforo, array) {
                    for (var i = 0; i < array.length; i++) {
                        if (array[i].Semaforo === colorSemaforo) {
                            return array[i];
                        }
                    }
                }

                var resultAzul = search("Azul", data);
                if (!resultAzul) {
                    var resultAmarillo = search("Amarillo", data);
                    self.opciones.KopsConstanteFueraRango = resultAmarillo ? 1 : 0;
                }

                self.SetColorTabKOPSConstantes(self);

            },
            CancelarFormulario: function () {
                this.ventanaEditarCrear.close();
            },
            ObtenerValor: function (datos, columna) {
                var self = this;
                if (datos.UOM_KOP.toUpperCase() == "TS") {
                    if (datos[columna].toString() !== "") {
                        return "<div>" + kendo.toString(kendo.parseDate(kendo.toString(kendo.parseDate(datos[columna]), kendo.culture().calendars.standard.patterns.s) + "Z"), kendo.culture().calendars.standard.patterns.MES_FechaHora) + "</div>"
                    } else {
                        return "<div></div>"
                    }
                } else if (datos.Tipo_KOP == "float") {
                    if (datos[columna] !== "") {
                        if (datos.UOM_KOP == "hh:mm:ss") {
                            if (datos[columna] !== "") {
                                return "<div>" + ConversorHorasMinutosSegundos(datos[columna] * 3600) + "</div>"
                            } else {
                                return "<div></div>"
                            }

                        }
                        else {
                            return "<div>" + parseFloat(datos[columna]).toFixed(2).replace(".", ",") + "</div>"
                        }
                    } else {
                        return "<div></div>"
                    }
                } else {
                    return "<div>" + datos[columna] + "</div>"
                }
            },
            cargarCabeceraRecalculada: function (self) {
                $.ajax({
                    type: "GET",
                    url: "../api/OrdenesFab/ObtenerDetalleOrden/" + parseInt(self.idorden) + "/" + self.order.TipoOrden.ID,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true
                }).done(function (data) {
                    data.CantidadProducida != "" ? $('#lblProducida').text(data.CantidadProducida + " HL") : "";
                    data.FecIniLocal != null ? $('#lblFechaInicioReal').text(kendo.toString(new Date(data.FecIniLocal), "dd/MM/yyyy HH:mm:ss")) : "";
                    data.FecFinLocal != null ? $('#lblFechaFinReal').text(kendo.toString(new Date(data.FecFinLocal), "dd/MM/yyyy HH:mm:ss")) : "";

                    if (self.IdTipoOrden !== self.tipoWO.Coccion) {
                        $('.tipoOrden').css('display', 'none');
                        $('#idTipoEficiencia').css('display', 'none');
                        $('#idTipoLoteLevadura').css('display', 'block');

                        let _unidadMaterialSobrante = data.MaterialSobrante != "" ? self.IdTipoOrden == self.tipoWO.Filtracion ? " " + window.app.idioma.t("KG") : " P " : "";
                        data.MaterialSobrante == "" ? $('#idUnidadExtracto').hide() : $('#lblSobrante').html(" " + data.MaterialSobrante + _unidadMaterialSobrante);

                        if (self.IdTipoOrden == self.tipoWO.Guarda) {
                            $("#idLote").html('<b>' + window.app.idioma.t('GAF') + " : </b>");
                        } else if (self.IdTipoOrden == self.tipoWO.Filtracion) {
                            $("#pctTierrasValue").html(" " + data.PcteTierras);
                            $("#pctPresionValue").html(" " + data.PctePresion);
                            $("#oeeWOValue").html(" " + data.OEEWO);
                        }
                        else if (self.IdTipoOrden == self.tipoWO.Prellenado) {
                            $("#CO2Value").html(data.CO2);
                        }

                        data.LoteLevadura == "" ? $('#lblLote').hide() : $('#lblLote').html(data.LoteLevadura);
                        if (self.IdTipoOrden == self.tipoWO.Trasiego) {
                            $('#loteEficiencia').css('display', 'none');
                            $('#extracto').css('display', 'none');
                        }
                    } else {
                        data.MaterialSobrante == "" ? $('#idUnidadExtracto').hide() : $('#lblSobrante').html(data.MaterialSobrante + ' P');
                        $('#lblEficiencia').html(data.Eficiencia + " %");
                    }
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 2000);
                });
            },
            Rgb2Hex: function (rgb) {
                rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                function hex(x) {
                    return ("0" + parseInt(x).toString(16)).slice(-2);
                }
                return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
            },
            SetColorTabKOPSConstantes: function (self) {

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
                            color = "black";
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
            ValidarPermisos: function (self) {

                if (self.isOrdenActiva) {
                    self.permisoVisualizacionKOPs = TienePermiso(240) || TienePermiso(211);
                    self.permisoGestionKOPs = TienePermiso(240);
                } else {
                    self.permisoVisualizacionKOPs = TienePermiso(241) || TienePermiso(212);
                    self.permisoGestionKOPs = false;
                }

            }
        });
        return vistaDetalleOrdenKOPs;
    });