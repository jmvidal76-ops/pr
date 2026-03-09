define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/RevisionKOPsWO.html',
    'vistas/vDialogoConfirm', 'compartido/notificaciones', 'jszip', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, PlantillaRevisionKOPsWO, VistaDlgConfirm, Not, JSZip, enums) {
        var VistaKOPs = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            tipoTurno: null,
            grid: null,
            fecha: new Date().midnight(),
            fechaCargada: null,
            template: _.template(PlantillaRevisionKOPsWO),
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.getDataSource();
                self.render();

                self.$("[data-funcion]").checkSecurity();
            },
            getDataSource: function () {
                var self = this;

                self.dsKOPs = new kendo.data.DataSource({
                    pageSize: 200,
                    transport: {
                        read: {
                            url: "../api/OrdenesFab/ObtenerKOPsWORevision",
                            data: function () {
                                let result = {};
                                result.fechaDesde = self.fecha.addDays(-1).toISOString();
                                result.fechaHasta = self.fecha.toISOString();
                                return result;
                            },
                            dataType: "json"
                        }
                    },
                    schema: {
                        model: {
                            fields: {
                                DescTipoWO: { type: "string" },
                                LoteMES: { type: "string" },
                                Semaforo: { type: "string" },
                                Cod_KOP: { type: "number" },
                                Des_KOP: { type: "string" },
                                ID_Procedimiento: { type: "string" },
                                TipoKOP: { type: "string" },
                                Valor_Minimo: { type: "string" },
                                Valor_Actual: { type: "string" },
                                Valor_Maximo: { type: "string" },
                                UOM_KOP: { type: "string" },
                                Fecha: { type: "date" },
                                Editable: { type: "boolean" },
                                ID_WO: { type: "number" },
                                CodWO: { type: "string" },
                                FechaFinReal: { type: "date" },
                                IdTipoWO: { type: "number" },
                                Recalcular: { type: "boolean" },
                                IdTipoSubproceso: { type: "number" },
                                DescSubProceso: { type: "string" },
                                MaestroCodKOP: { type: "string" },
                                MensajeKOP: { type: "string" },
                                TipoDatoKOP: { type: "string" },
                                IdTipoKOP: { type: "number" },
                                DescTipoKOP: { type: "string" },
                                IdEstadoKOP: { type: "number" },
                                DescEstadoKOP: { type: "string" },
                                ColorEstadoKOP: { type: "string" },
                                FechaActualizado: { type: "date" },
                                ID_KOP: { type: "string" },
                                Cod_Orden: { type: "number" },
                                ID_Orden: { type: "string" },
                                Cod_Procedimiento: { type: "number" },
                                Tipo_KOP: { type: "string" },
                                Obligatorio: { type: "number" },
                                Sequence_Procedimiento: { type: "number" },
                                FechaUTC: { type: "date" },
                                PkActVal: { type: "number" },
                                Sequence_KOP: { type: "number" },
                                filtroSemaforo: { type: "string" }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                DestruirKendoWidgets(self);

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                $("#dtpFecha").kendoDateTimePicker({
                    value: self.fecha,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    change: function (e) {
                        if (this.value()) {
                            self.fecha = this.value();
                            $("#desdeFecha").html(kendo.toString(self.fecha.addHours(-24), kendo.culture().calendars.standard.patterns.MES_FechaHora));
                        }
                    }
                });

                $("#desdeFecha").html(
                    kendo.toString($("#dtpFecha").getKendoDateTimePicker().value().addHours(-24), kendo.culture().calendars.standard.patterns.MES_FechaHora)
                );

                self.grid = this.$("#gridKOPs").kendoGrid({
                    autoBind: false,
                    dataSource: self.dsKOPs,
                    groupable: {
                        messages: {
                            empty: window.app.idioma.t('ARRASTRAR_SOLTAR')
                        }
                    },
                    sortable: true,
                    resizable: true,
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
                            headerTemplate: "<span></span>", // sin seleccionar todo
                            template: "<input type='checkbox' class='row-checkbox' />",
                            width: 30,
                            sortable: false,
                            filterable: false
                        },
                        {
                            field: "DescTipoWO", title: window.app.idioma.t("TIPO_WO"), width: 80,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescTipoWO#' style='width: 14px;height:14px;margin-right:5px;'/>#= DescTipoWO#</label></div>";
                                    }
                                }
                            },
                        },
                        { field: "CodWO", title: "WO", width: 130 },                         
                        { field: "LoteMES", title: window.app.idioma.t("LOTE"), width: 280, attributes: { style: 'white-space: nowrap ' }},
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
                        { field: "Cod_KOP", title: "Cod_KOP", width: 60, hidden: true },
                        { field: "Des_KOP", title: window.app.idioma.t("KOP"), width: 200, attributes: { style: 'white-space: nowrap ' } },
                        {
                            field: "ID_Procedimiento", title: window.app.idioma.t("PROCEDIMIENTO"), width: 80,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=ID_Procedimiento#' style='width: 14px;height:14px;margin-right:5px;'/>#= ID_Procedimiento   #</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            field: "TipoKOP", title: window.app.idioma.t("TIPO"), width: 80,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=TipoKOP#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoKOP   #</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            field: "Valor_Minimo",
                            title: window.app.idioma.t("VALOR_MINIMO"),
                            width: 100,
                            template: function (e) { return self.ObtenerValor(e, "Valor_Minimo"); }
                        },
                        {
                            field: "Valor_Actual",
                            title: window.app.idioma.t("VALOR"),
                            width: 100,
                            template: function (e) { return self.ObtenerValor(e, "Valor_Actual"); }
                        },
                        {
                            field: "Valor_Maximo",
                            title: window.app.idioma.t("VALOR_MAXIMO"),
                            width: 100,
                            template: function (e) { return self.ObtenerValor(e, "Valor_Maximo"); }
                        },
                        //{ field: "TipoDatoKOP", title: "TipoDatoKOP", hide: true, width: 60 },
                        {
                            field: "UOM_KOP", title: window.app.idioma.t("UNIDAD_MEDIDA"), width: 50,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=UOM_KOP#' style='width: 14px;height:14px;margin-right:5px;'/>#= UOM_KOP   #</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            field: "Fecha",
                            title: window.app.idioma.t("FECHA"),
                            width: 100,
                            template: function (e) {
                                let fecha = self.parseKendoDate(e.Fecha);
                                if (fecha) {
                                    return kendo.toString(fecha, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                } else {
                                    return "";
                                }
                            },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({ format: "dd/MM/yyyy", culture: localStorage.getItem("idiomaSeleccionado") });
                                }
                            }
                        }
                    ],
                    dataBinding: self.resizeGrid,
                    dataBound: function (e) {
                        self.fechaCargada = $("#dtpFecha").getKendoDateTimePicker().value();
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridKOPs").data("kendoGrid"));

                self.resizeGrid();
            },
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnEditar': 'confirmarEditarValor',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
            },
            actualiza: function () {
                var self = this;

                self.fecha = $("#dtpFecha").getKendoDateTimePicker().value();

                if (!self.fecha) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_FECHA_INTRODUCIDA'), 3000);
                    return;
                }

                $("#desdeFecha").html(
                    kendo.toString(self.fecha.addHours(-24), kendo.culture().calendars.standard.patterns.MES_FechaHora)
                );

                RecargarGrid({ grid: self.grid });
            },
            confirmarEditarValor: function () {
                const self = this;
                const permiso = TienePermiso(420);
                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }
                const grid = $("#gridKOPs").data("kendoGrid");
                const seleccionados = [];
                grid.tbody.find(".row-checkbox:checked").each(function () {
                    const dataItem = grid.dataItem($(this).closest("tr"));
                    seleccionados.push(dataItem);
                });

                if (seleccionados.length === 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                const first = seleccionados[0];
                const tipoDatoKOPFirst = (first.TipoDatoKOP || "").toLowerCase();
                const uomKOPFirst = (first.UOM_KOP || "").toLowerCase();

                // Validar que todos tienen el mismo tipo de dato
                const allSameTipoDato = seleccionados.every(item =>
                    (item.TipoDatoKOP || "").toLowerCase() === tipoDatoKOPFirst
                );
                if (!allSameTipoDato) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('MULTIPLES_KOPS_NO_EDITAR_DIFERENTE_TIPO_DATO'), 4000);
                    return;
                }

                // Si es float, validar unidad de medida
                if (tipoDatoKOPFirst === "float") {
                    // ¿Todos son hh:mm:ss?
                    const allHHMMSS = seleccionados.every(item =>
                        (item.UOM_KOP || "").toLowerCase() === "hh:mm:ss"
                    );
                    // ¿Ninguno es hh:mm:ss?
                    const noneHHMMSS = seleccionados.every(item =>
                        (item.UOM_KOP || "").toLowerCase() !== "hh:mm:ss"
                    );
                    if (!allHHMMSS && !noneHHMMSS) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('MULTIPLES_KOPS_NO_EDITAR_DIFERENTE_TIPO_DATO'), 4000);
                        return;
                    }
                }

                self.mostrarDialogoEdicionKOP(seleccionados, first);
            },
            mostrarDialogoEdicionKOP: function (seleccionados, data) {
                const self = this;
                let anchura = 400;

                $("#window").remove();
                $("#center-pane").prepend($("<div id='window'></div>"));

                $("#window").kendoWindow({
                    title: window.app.idioma.t('EDITARKOP'),
                    width: anchura,
                    modal: true,
                    close: function () { this.destroy(); }
                });

                let html = `
                <div style="padding: 20px;">
                    <div id="valorCentrado" style="display:flex; align-items:center; justify-content:flex-start; margin-bottom:25px;">
                        <label style="margin-right: 10px; min-width:54px; text-align:right;">
                            ${window.app.idioma.t("VALOR")}:
                        </label>
                        <span id="inputsKOP"></span>
                    </div>
                    <div style="text-align:center;">
                        <button class="k-button" id="btnAceptarCambio">${window.app.idioma.t("ACEPTAR")}</button>
                        <button class="k-button" id="btnCancelarCambio" style="margin-left:10px;">
                            ${window.app.idioma.t("CANCELAR")}
                        </button>
                    </div>
                </div>`;
                $("#window").data("kendoWindow").content(html).center().open();

                const tipoKOP = (data.Tipo_KOP || "").toLowerCase();
                const uomKOP = (data.UOM_KOP || "").toLowerCase();
                const isMultiSelect = seleccionados.length > 1;

                // INPUT SEGÚN MULTI O INDIVIDUAL
                if (tipoKOP === "float" && uomKOP !== "hh:mm:ss") {
                    $("#inputsKOP").html('<input id="nuevoValor" type="text" data-type="number" data-role="numerictextbox" />');
                    $("#nuevoValor").kendoNumericTextBox({
                        decimals: 2,
                        culture: localStorage.getItem("idiomaSeleccionado"),
                        format: 'n2',
                        value: isMultiSelect ? null : parseFloat(FormatearNumericosPorRegion(data.Valor_Actual))
                    });
                } else if (tipoKOP === "float" && uomKOP === "hh:mm:ss") {
                    $("#inputsKOP").html(`
                        <input id="txtHoraValor" type="text" data-type="number" data-role="numerictextbox" style="width:55px;text-align:center;" />
                        <span>:</span>
                        <input id="txtMinutosValor" type="text" data-type="number" data-role="numerictextbox" style="width:55px;text-align:center;" />
                        <span>:</span>
                        <input id="txtSegundosValor" type="text" data-type="number" data-role="numerictextbox" style="width:55px;text-align:center;" />
                    `);
                    let valor = isMultiSelect ? 0 : (parseFloat(data.Valor_Actual) || 0);
                    let totalSegs = Math.round(valor * 3600);
                    let horas = Math.floor(totalSegs / 3600);
                    let minutos = Math.floor((totalSegs % 3600) / 60);
                    let segundos = totalSegs % 60;
                    $("#txtHoraValor").kendoNumericTextBox({
                        min: 0, max: 23, decimals: 0, format: 'n0', value: horas
                    });
                    $("#txtMinutosValor").kendoNumericTextBox({
                        min: 0, max: 59, decimals: 0, format: 'n0', value: minutos
                    });
                    $("#txtSegundosValor").kendoNumericTextBox({
                        min: 0, max: 59, decimals: 0, format: 'n0', value: segundos
                    });
                } else if (tipoKOP === "numeric" || tipoKOP === "int") {
                    $("#inputsKOP").html('<input id="nuevoValor" type="text" data-type="number" data-role="numerictextbox" />');
                    $("#nuevoValor").kendoNumericTextBox({
                        decimals: 0,
                        culture: localStorage.getItem("idiomaSeleccionado"),
                        format: 'n0',
                        value: isMultiSelect ? null : parseInt(FormatearNumericosPorRegion(data.Valor_Actual))
                    });
                } else if (tipoKOP === "datetime") {
                    $("#inputsKOP").html('<input id="nuevoValor" type="text" />');
                    let valorFecha = isMultiSelect ? null : self.parseKendoDate(data.Valor_Actual);
                    $("#nuevoValor").kendoDateTimePicker({
                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                        culture: localStorage.getItem("idiomaSeleccionado"),
                        value: valorFecha
                    });
                    $("#nuevoValor").closest(".k-datepicker").css("width", "290px");
                } else if (tipoKOP === "string") {
                    $("#inputsKOP").html('<input id="nuevoValor" type="text" class="kendo-textbox-legacy" />');
                    $("#nuevoValor").val(isMultiSelect ? "" : data.Valor_Actual);
                } else {
                    $("#inputsKOP").html('<input id="nuevoValor" type="text" style="width:110px;" />');
                    $("#nuevoValor").val(isMultiSelect ? "" : data.Valor_Actual);
                }

                // Botón aceptar
                $("#btnAceptarCambio").on("click", function () {
                    let nuevoValor;
                    if (tipoKOP === "float" && uomKOP === "hh:mm:ss") {
                        let horas = $("#txtHoraValor").data("kendoNumericTextBox").value() || 0;
                        let minutos = $("#txtMinutosValor").data("kendoNumericTextBox").value() || 0;
                        let segundos = $("#txtSegundosValor").data("kendoNumericTextBox").value() || 0;
                        nuevoValor = horas + minutos / 60 + segundos / 3600;
                    } else if (tipoKOP === "float" && uomKOP !== "hh:mm:ss") {
                        nuevoValor = $("#nuevoValor").data("kendoNumericTextBox").value();
                    } else if (tipoKOP === "numeric" || tipoKOP === "int") {
                        nuevoValor = $("#nuevoValor").data("kendoNumericTextBox").value();
                    } else if (tipoKOP === "datetime") {
                        nuevoValor = $("#nuevoValor").data("kendoDateTimePicker").value();
                    } else {
                        nuevoValor = $("#nuevoValor").val();
                    }

                    // Validación: no permitir vacío en multi o individual
                    if (
                        nuevoValor === null ||
                        nuevoValor === "" ||
                        (typeof nuevoValor === "number" && isNaN(nuevoValor))
                    ) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('VALOR_NO_VALIDO'), 4000);
                        return;
                    }

                    // Cierra el diálogo de edición de valor antes de mostrar el de confirmación
                    if ($("#window").data("kendoWindow")) {
                        $("#window").data("kendoWindow").close();
                    }

                    self.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t("EDITAR"),
                        msg: window.app.idioma.t("CONFIRMAR_ACTUALIZAR"),
                        funcion: function () {
                            // Cierra el confirm
                            if (self.confirmacion && self.confirmacion.$el) {
                                var win = self.confirmacion.$el.data("kendoWindow");
                                if (win) win.close();
                            }

                            var total = seleccionados.length, completados = 0, errores = 0;
                            seleccionados.forEach(function (dataItem) {
                                self.actualizarValor([dataItem.Cod_KOP], nuevoValor, function (success) {
                                    completados++;
                                    if (!success) errores++;
                                    if (completados === total) {
                                        if (errores === 0) {
                                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('MODIFICADO_CORRECTAMENTE'), 4000);
                                        } else {
                                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('FINALIZADA_ACTUALIZACION_CON_ERRORES'), 4000);
                                        }
                                        self.dsKOPs.read();
                                        $("#gridKOPs").find(".row-checkbox:checked").prop("checked", false);
                                        if ($("#window").data("kendoWindow")) {
                                            $("#window").data("kendoWindow").close();
                                        }
                                    }
                                });
                            });
                        },
                        contexto: self
                    });
                });

                // Botón cancelar
                $("#btnCancelarCambio").on("click", function () {
                    $("#window").data("kendoWindow").close();
                });
            },
            actualizarValor: function (ids, nuevoValor, callback) {
                var self = this;
                var grid = $("#gridKOPs").data("kendoGrid");
                var dataItem = grid.dataSource.data().find(function (item) {
                    return item.Cod_KOP == ids[0];
                });

                if (!dataItem) {
                    if (callback) callback(false);
                    return;
                }

                var pl = {
                    IDOrden: dataItem.ID_Orden || dataItem.IDOrden,
                    Cod_Procedimiento: dataItem.Cod_Procedimiento,
                    nombreKop: dataItem.Des_KOP,
                    UOM: dataItem.UOM_KOP,
                    PkActVal: dataItem.Cod_KOP,
                    Tipo_KOP: dataItem.Tipo_KOP,
                    ValorKOP: nuevoValor
                };

                if (dataItem.Tipo_KOP && dataItem.Tipo_KOP.toLowerCase() === "multivalor") {
                    pl.ValorKOP = Array.isArray(nuevoValor) ? nuevoValor : [nuevoValor];
                }

                $.ajax({
                    url: "../api/KOPsFab/editarValoresKOP",
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(pl),
                    success: function () {
                        if (callback) callback(true);
                    },
                    error: function () {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_MODIFICAR_KOP') + " Cod_KOP: " + dataItem.Cod_KOP, 8000);
                        if (callback) callback(false);
                    }
                });
            },
            ObtenerValor: function (datos, columna) {
                if (
                    (datos.Tipo_KOP === "float" || datos.Tipo_KOP === "numeric" || datos.Tipo_KOP === "int") &&
                    datos.UOM_KOP && datos.UOM_KOP.toLowerCase() === "hh:mm:ss"
                ) {
                    if (datos[columna] !== "" && datos[columna] !== null && !isNaN(datos[columna])) {
                        return this.decimalHoursToHMS(datos[columna]);
                    } else {
                        return "";
                    }
                }
                if (datos.UOM_KOP && datos.UOM_KOP.toUpperCase() === "TS") {
                    if (datos[columna] && datos[columna].toString() !== "") {
                        let fecha = this.parseKendoDate(datos[columna]);
                        if (fecha) {
                            return kendo.toString(fecha, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                        } else {
                            return datos[columna];
                        }
                    } else {
                        return "";
                    }
                }
                if (
                    datos.Tipo_KOP === "float" ||
                    datos.Tipo_KOP === "numeric" ||
                    datos.Tipo_KOP === "int"
                ) {
                    if (datos[columna] !== "" && datos[columna] !== null && !isNaN(datos[columna])) {
                        return kendo.toString(parseFloat(datos[columna]), "n2");
                    } else {
                        return "";
                    }
                }
                return datos[columna] == null ? "" : datos[columna];
            },
            parseKendoDate: function (valor) {
                if (!valor) return null;
                if (valor instanceof Date) return valor;
                let fecha = kendo.parseDate(valor);
                if (!fecha) fecha = kendo.parseDate(valor, "yyyy-MM-ddTHH:mm:ss");
                if (!fecha) fecha = kendo.parseDate(valor, "dd/MM/yyyy HH:mm:ss");
                if (!fecha) fecha = new Date(valor);
                if (!fecha || isNaN(fecha.getTime())) return null;
                return fecha;
            },
            decimalHoursToHMS: function (decimal) {
                decimal = parseFloat(decimal) || 0;
                const totalSeconds = Math.round(decimal * 3600);
                const horas = Math.floor(totalSeconds / 3600);
                const minutos = Math.floor((totalSeconds % 3600) / 60);
                const segundos = totalSeconds % 60;
                return `${this.pad2(horas)}:${this.pad2(minutos)}:${this.pad2(segundos)}`;
            },
            pad2: function (n) {
                return n < 10 ? "0" + n : "" + n;
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

                var gridElement = $("#gridKOPs"),
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
                const self = this;
                self.dsKOPs.query({
                    group: [],
                    filter: [],
                    page: 1
                });
            }
        });

        return VistaKOPs;
    });