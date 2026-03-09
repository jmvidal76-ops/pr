define(['underscore', 'backbone', 'jquery', 'text!../../../Logistica/html/OEEPlanificacion.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', 'jszip'],
    function (_, Backbone, $, Plantilla, VistaDlgConfirm, Not, JSZip) {
        var gridOEEPlanificaciones = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            registrosSelData: [],
            registrosDesSelData: [],
            selTodos: false,
            ventanaEditarCrear: null,
            template: _.template(Plantilla),
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;
                self.registrosSelData = [];
                self.registrosDesSelData = [];
                self.selTodos = false;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                const colorMap = {
                    "#DC3F3F": "Rojo",
                    "#4CDA43": "Verde",
                    "#FCD067": "Amarillo",
                    "#446CE4": "Azul",
                };

                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerDatosOEEPlanificaciones/",
                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "IdOEEPlanificaciones",
                            fields: {
                                // Id: { type: "number", editable: false, nullable: false },
                                'IdOEEPlanificaciones': { type: "number" },
                                'Color': { type: "string" },
                                'IdProducto': { type: "number" },
                                'IdLinea': { type: "string" },
                                'NumeroLinea': { type: "number" },
                                'OEEPreactor': { type: "number" },
                                'DescripcionLinea': { type: "string" },
                                'NombreProducto': { type: "string" },
                                'VelocidadNominal': { type: "number" },
                                'VelocidadNominalOEE': { type: "number" },
                                'InhabilitarCalculoAC': { type: "boolean" },
                                'TiempoArranque': { type: "number" },
                                'TiempoCambio': { type: "number" },
                                'InhabilitarCalculoOEE': { type: "boolean" },
                                'OEEPlanificado': { type: "number" },
                                'EnvasesMinuto': { type: "number" },
                                'MediaAC': { type: "number" },
                                'EnvasesPerdidosOEE': { type: "number" },
                                'PorcentajePerdidosAC': { type: "number" },
                                'CPBsHora': { type: "number" },
                                'CPBsTurno': { type: "number" },
                                'AjusteOEE': { type: "number" },
                                'CPBMDBY': { type: "number" },
                            }
                        },
                        parse: function (response) {
                            for (const r of response) {
                                r.Indicador = colorMap[r.Color];
                                r.DiferenciaMESBY = 100 - ((r.CBPsHora / r.CPBMDBY) * 100)
                            }

                            return response;
                        }
                    },
                    requestStart: function () {
                        if (self.ds.data().length == 0) {
                            kendo.ui.progress($("#gridOEEPlanificaciones"), true);
                        }
                    },
                    requestEnd: function () {
                        if (self.ds.data().length == 0) {
                            kendo.ui.progress($("#gridOEEPlanificaciones"), false);
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            $("#center-pane").empty();
                        }
                    },
                    sort: { field: "IdLinea", dir: "asc" }
                });

                self.render();
                self.$("[data-funcion]").checkSecurity();
            },
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))
                var self = this;

                $("#txtMediaAC_Bar").kendoNumericTextBox({
                    placeholder: '',
                    decimals: 0,
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: '0'
                });

                $("#txtAjusteOEE_Bar").kendoNumericTextBox({
                    placeholder: '',
                    decimals: 2,
                    min: -100,
                    max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: "{0:n2}"
                });

                $("#txtOeePlanificado_Bar").kendoNumericTextBox({
                    placeholder: '',
                    min: 0,
                    max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                //var permiso = TienePermiso(314);

                //$("#txtVelNom").data("kendoNumericTextBox").enable(permiso);

                //Cargamos el grid
                self.grid = this.$("#gridOEEPlanificaciones").kendoGrid({
                    dataSource: self.ds,                    
                    sortable: true,
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    toolbar: [
                        {
                            template: "<button type='button' id='btnSelTodos' class='k-button k-button-icontext'><span class='k-icon k-i-hbars'></span>" + window.app.idioma.t('SELECCIONAR_TODOS') + "</button>"
                        },
                        {
                            template: "<button type='button' id='btnDesSelTodos' class='k-button k-button-icontext'><span class='k-icon k-si-cancel'></span>" + window.app.idioma.t('DESELECCIONAR_TODOS') + "</button>"
                        },
                        {
                            template: "<span style='margin-left:10px;'>" + window.app.idioma.t('REGISTROS_SEL') + "</span> <span id='lblRegSel'></span>"
                        },
                        {
                            // Permiso de visualización
                            template: "<button type='button' id='btnExportExcel' data-function='LOG_PROD_GES_1_VisualizacionOEEPlanificacion' style='float:right;' class='k-button k-button-icontext k-grid-excel'><span class='k-icon k-i-excel'></span>" + window.app.idioma.t('EXPORTAR_EXCEL') + "</button>"
                        },
                        {
                            template: "<button type='button' id='btnLimpiarFiltros' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</button>"
                        },
                        {
                            // Permiso de gestión
                            template: "<button type='button' id='btnCalcularOEEPlanificado' data-function='LOG_PROD_GES_1_GestionOEEPlanificacion' style='float:right;' class='k-button k-button-icontext'><span class='k-icon k-i-custom'></span>" + window.app.idioma.t('ACTUALIZAR') + " " + window.app.idioma.t('DATOS') + "</button>"
                        }
                    ],
                    columns: [
                        //{ field: "InhabilitarCalculoAC", template: '<input type="hidden" id="hdIdOEEPlanificaciones" value="#=IdOEEPlanificaciones#" />' },
                        {
                            title: "",
                            template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                            width: 32
                        },
                        {
                            field: "Indicador",
                            template: function (e) {
                                return "<div class='circle_cells' style='background-color:" + e.Color + ";'></div><div class='circle_desc'></div>"
                            },
                            title: "",
                            width: 105,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Indicador#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Indicador #</label></div>";
                                    }
                                }
                            },
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            command:
                            {
                                template: "<a id='btnEditar' class='k-button k-grid-edit' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                            },
                            width: 55
                        },
                        {
                            field: "IdLinea",
                            title: window.app.idioma.t("LINEA"),
                            template: "#:ObtenerLineaDescripcion(IdLinea)#", //window.app.idioma.t("LINEA") + ' #:NumeroLinea# - #:DescripcionLinea#',
                            width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdLinea#' style='width: 14px;height:14px;margin-right:5px;'/>#:ObtenerLineaDescripcion(IdLinea)#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "IdProducto",
                            title: window.app.idioma.t("CODIGO_PRODUCTO"),
                            width: 135
                        },
                        {
                            field: "NombreProducto",
                            title: window.app.idioma.t("PRODUCTO"),
                            width: 240
                        },
                        {
                            field: "VelocidadNominal", title: window.app.idioma.t("VELOCIDAD_NOMINAL"), width: 165, filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        {
                            field: "OEEPreactor",
                            title: window.app.idioma.t("OEE_SECUENCIADOR"),
                            width: 140,
                            //template: '#if(OEEPreactor % 1 != 0){# #:OEEPreactor.toFixed(2) # #}else{ # #:OEEPreactor # # }#'
                            format: "{0:n2}"
                        },
                        {
                            field: "VelocidadNominalOEE",
                            title: window.app.idioma.t("VELOCIDAD_NOMINAL_OEE"),
                            width: 150,
                            template: '#if(VelocidadNominalOEE % 1 != 0){# #:VelocidadNominalOEE.toFixed(2) # #}else{ # #:VelocidadNominalOEE # # }#'
                        },
                        {
                            field: "EnvasesMinuto",
                            title: window.app.idioma.t("ENVASES_MINUTO"),
                            width: 150,
                            //template: '#if(EnvasesMinuto % 1 != 0){# #:EnvasesMinuto.toFixed(2) # #}else{ # #:EnvasesMinuto # # }#',
                            format: "{0:n2}"

                        },
                        {
                            field: "InhabilitarCalculoAC",
                            title: window.app.idioma.t("INHABILITAR_CALCULO_AC"),
                            width: 160,
                            template: '<input type="checkbox" class="chkInhabilitar" disabled #= InhabilitarCalculoAC ? \'checked="checked"\' : "" # />'
                        },
                        {
                            field: "TiempoArranque",
                            title: window.app.idioma.t("TIEMPO_ARRANQUE"),
                            width: 150,
                            template: '#if(TiempoArranque % 1 != 0){# #:TiempoArranque.toFixed(2) # #}else{ # #:TiempoArranque # # }#'
                        },
                        {
                            field: "TiempoCambio",
                            title: window.app.idioma.t("TIEMPOS_DE_CAMBIO"),
                            width: 150,
                            template: '#if(TiempoCambio % 1 != 0){# #:TiempoCambio.toFixed(2) # #}else{ # #:TiempoCambio # # }#'
                        },
                        {
                            field: "MediaAC",
                            title: window.app.idioma.t("MEDIA_AC"),
                            width: 120,
                            //template: '#if(MediaAC % 1 != 0){# #:MediaAC.toFixed(2) # #}else{ # #:MediaAC # # }#'
                            format: "{0:n2}"
                        },
                        {
                            field: "EnvasesPerdidosOEE",
                            title: window.app.idioma.t("ENVASES_PERDIDOS_OEE"),
                            width: 150,
                            //template: '#if(EnvasesPerdidosOEE % 1 != 0){# #:EnvasesPerdidosOEE.toFixed(2) # #}else{ # #:EnvasesPerdidosOEE # # }#'
                            format: "{0:n2}"
                        },
                        {
                            field: "PorcentajePerdidosAC",
                            title: window.app.idioma.t("PORCENTAJE_PERDIDOS_AC"),
                            width: 150,
                            //template: '#if(PorcentajePerdidosAC % 1 != 0){# #:PorcentajePerdidosAC.toFixed(2) # #}else{ # #:PorcentajePerdidosAC # # }#'
                            format: "{0:n2}"
                        },
                        {
                            field: "InhabilitarCalculoOEE",
                            title: window.app.idioma.t("INHABILITAR_CALCULO_OEE"),
                            width: 160,
                            template: '<input type="checkbox" class="chkInhabilitar" disabled #= InhabilitarCalculoOEE ? \'checked="checked"\' : "" # />'
                        },
                        {
                            field: "OEEPlanificado",
                            title: window.app.idioma.t("OEE_PLANIFICACION"),
                            width: 150,
                            //template: '#if(OEEPlanificado % 1 != 0){# #:OEEPlanificado.toFixed(2) # #}else{ # #:OEEPlanificado # # }#'
                            format: "{0:n2}"
                        },
                        {
                            field: "AjusteOEE",
                            title: window.app.idioma.t("AJUSTE_OEE"),
                            width: 120,
                            //template: '#if(CPBsTurno % 1 != 0){# #:CPBsTurno.toFixed(2) # #}else{ # #:CPBsTurno # # }#'
                            format: "{0:n2}"
                        },
                        {
                            field: "OEEFinalPlanificacion",
                            title: window.app.idioma.t("OEE_FINAL_PLANIFICACION"),
                            width: 150,
                            //template: '#if(CPBsTurno % 1 != 0){# #:CPBsTurno.toFixed(2) # #}else{ # #:CPBsTurno # # }#'
                            format: "{0:n2}"
                        },
                        {
                            field: "CBPsHora",
                            title: window.app.idioma.t("CPBS_HORA"),
                            width: 120,
                            //template: '#if(CBPsHora % 1 != 0){# #:CBPsHora.toFixed(2) # #}else{ # #:CBPsHora # # }#'
                            format: "{0:n2}"
                        },
                        {
                            field: "UdMedida",
                            title: window.app.idioma.t("UNIDAD"),
                            width: 90,
                            //template: '#if(CPBsTurno % 1 != 0){# #:CPBsTurno.toFixed(2) # #}else{ # #:CPBsTurno # # }#'
                            format: "{0:n2}"
                        },
                        {
                            field: "CPBsTurno",
                            title: window.app.idioma.t("CPBS_TURNO"),
                            width: 140,
                            //template: '#if(CPBsTurno % 1 != 0){# #:CPBsTurno.toFixed(2) # #}else{ # #:CPBsTurno # # }#'
                            format: "{0:n2}"
                        },
                        {
                            field: "CPBMDBY",
                            title: window.app.idioma.t("CPBMDBY"),
                            width: 150,
                            //template: '#if(CPBsTurno % 1 != 0){# #:CPBsTurno.toFixed(2) # #}else{ # #:CPBsTurno # # }#'
                            format: "{0:n2}"
                        },
                        {
                            field: "DiferenciaMESBY",
                            title: window.app.idioma.t("DIFERENCIA_MES_BY"),
                            width: 160,
                            format: "{0:n2}"
                        },
                    ],
                    excel: {
                        fileName: "OEEPlanificaciones.xlsx",
                        allPages: true
                    },
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];
                                row.cells[1].value = ObtenerLineaDescripcion(e.data[dataPosition].IdLinea);
                                row.cells[22].format = "#,##0.00";
                            } catch (e) { }
                        }
                    },
                    dataBound: function () {
                        $(".checkbox").bind("change", function (e) {
                            var checked = this.checked;
                            row = $(e.target).closest("tr");
                            grid = $("#gridOEEPlanificaciones").data("kendoGrid");
                            dataItem = grid.dataItem(row);
                            //var idValue = grid.dataItem(row).get("IdOEEPlanificaciones");
                            var datos = {};
                            datos.IdOEEPlanificaciones = dataItem.IdOEEPlanificaciones;
                            datos.MediaAC = dataItem.MediaAC;
                            datos.OEEPlanificado = dataItem.OEEPlanificado;
                            datos.InhabilitarCalculoAC = dataItem.InhabilitarCalculoAC;
                            datos.InhabilitarCalculoOEE = dataItem.InhabilitarCalculoOEE;

                            if (checked) {
                                row.addClass("k-state-selected");
                                var datafound = _.findWhere(self.registrosDesSelData, datos);
                                index = _.indexOf(self.registrosDesSelData, datafound);

                                if (index >= 0) {
                                    self.registrosDesSelData.splice(index, 1);
                                }

                                var numReg = self.$("#lblRegSel").text() ? self.$("#lblRegSel").text() : 0;
                                self.$("#lblRegSel").text(++numReg);
                                self.registrosSelData.push(datos);
                            } else {
                                row.removeClass("k-state-selected");
                                self.registrosDesSelData.push(datos);
                                var numReg = self.$("#lblRegSel").text() ? self.$("#lblRegSel").text() : 0;
                                self.$("#lblRegSel").text(--numReg);
                                var datafound = _.findWhere(self.registrosSelData, datos);
                                index = _.indexOf(self.registrosSelData, datafound);

                                if (index >= 0) {
                                    self.registrosSelData.splice(index, 1);
                                }
                            }
                        });

                        var grid = self.grid;

                        if (self.selTodos) {
                            grid.tbody.find('.checkbox').prop("checked", true);
                            grid.tbody.find(">tr").addClass('k-state-selected');

                            var items = grid.items();
                            var listItems = [];

                            listItems = $.grep(items, function (row) {
                                var dataItem = grid.dataItem(row);
                                return self.registrosDesSelData.some(function (data) {
                                    return data.idPPR == dataItem.id;
                                });
                            });

                            listItems.forEach(function (row, idx) {
                                $(row.cells[0])[0].childNodes[0].checked = false;
                                $(row).closest("tr").removeClass("k-state-selected");
                            });
                        } else {
                            grid.tbody.find('.checkbox').prop("checked", false);
                            grid.tbody.find(">tr").removeClass('k-state-selected');

                            var items = grid.items();
                            var listItems = [];

                            listItems = $.grep(items, function (row) {
                                var dataItem = grid.dataItem(row);
                                return self.registrosSelData.some(function (data) {
                                    return data.idPPR == dataItem.id;
                                });
                            });

                            listItems.forEach(function (row, idx) {
                                $(row.cells[0])[0].childNodes[0].checked = true;
                                $(row).closest("tr").addClass("k-state-selected");
                            });
                        }
                    },
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");

                var _grid = $("#gridOEEPlanificaciones").data("kendoGrid");
                $("#gridOEEPlanificaciones").data("kendoGrid").dataSource.bind("change", function (e) {
                    if (_grid.dataSource.filter() != null && typeof (_grid.dataSource.filter()) != "undefined") {
                        //Comprobamos si el cambio en el datasource se debe a un cambio del filtro y en tal caso eliminamos los checkbox
                        if (_grid.dataSource.filter().filters != self.filtroActual) {
                            self.filtroActual = _grid.dataSource.filter().filters; //hay que actualizar la variable antes de llamar a aplicarSeleccion para que no entre en un bucle infinito
                        }
                        self.filtroActual = _grid.dataSource.filter().filters;
                    }
                });

                window.app.headerGridTooltip(self.grid);
            },
            limpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            editarOEEPlanificaciones: function (e) {
                var self = this;
                var permiso = TienePermiso(314);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='window'></div>"));

                $("#window").kendoWindow(
                    {
                        title: window.app.idioma.t('OEE_PLANIFICACION'),
                        width: "440px",
                        height: "450px",
                        content: "Envasado/html/EditarOEEPlanificaciones.html",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        close: function () {
                            self.ventanaEditarCrear.destroy();
                            self.ventanaEditarCrear = null;
                        },
                        refresh: function () {
                            self.cargaContenido(e);
                        }
                    });

                self.ventanaEditarCrear = $('#window').data("kendoWindow");
                self.ventanaEditarCrear.center();
                self.ventanaEditarCrear.open();
            },
            
            cargaContenido: function (e) {
                //Traducimos los label del formulario
                var self = this;

                $("#lblLinea").text(window.app.idioma.t('LINEA') + ': ');
                $("#lblCodigoProducto").text(window.app.idioma.t("CODIGO_PRODUCTO") + ': ');
                $("#lblProducto").text(window.app.idioma.t('PRODUCTO') + ': ');
                $("#lblMediaAC").text(window.app.idioma.t('MEDIA_AC') + ': ');
                $("#lblOEEPlanificado").text(window.app.idioma.t('OEE_PLANIFICACION') + ': ');
                $("#lblInhabilitarCalculoAC").text(window.app.idioma.t('INHABILITAR_CALCULO_AC') + ': ');
                $("#lblInhabilitarCalculoOEE").text(window.app.idioma.t('INHABILITAR_CALCULO_OEE') + ': ');
                $("#lblAjusteOEE").text(window.app.idioma.t('AJUSTE_OEE') + ': ');
                $("#btnAceptarOEEPlan").text(window.app.idioma.t('ACEPTAR'));
                $("#btnCancelarOEEPlan").text(window.app.idioma.t('CANCELAR'));

                $("#ntxtMediaAC").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    decimals: 0,
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                $("#ntxtOEEPlanificado").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    decimals: 0,
                    min: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                $("#ntxtAjusteOEE").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    decimals: 0,
                    min: -100,
                    max: 100,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2
                });

                $("#btnAceptarOEEPlan").kendoButton({
                    click: function (e) { self.confirmarEdicion(); }
                });

                $("#btnCancelarOEEPlan").kendoButton({
                    click: function () { self.CancelarFormulario(); }
                });

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);

                $("#lblValorLinea").text(window.app.idioma.t("LINEA") + data.NumeroLinea + ' - ' + data.DescripcionLinea);
                $("#lblValorCodigoProducto").text(data.IdProducto);
                $("#lblValorProducto").text(data.NombreProducto);
                $("#ntxtMediaAC").data("kendoNumericTextBox").value(data.MediaAC);
                $("#ntxtOEEPlanificado").data("kendoNumericTextBox").value(data.OEEPlanificado);
                $("#hdIdOEEPlanificaciones").val(data.IdOEEPlanificaciones);
                $("#chkInhabilitarCalculoAC").prop('checked', data.InhabilitarCalculoAC);
                $("#chkInhabilitarCalculoOEE").prop('checked', data.InhabilitarCalculoOEE);

                //var permiso = TienePermiso(181);

                //$("#ntxtVelocidadNominal").data("kendoNumericTextBox").enable(permiso);
            },
            events: {
                'click #btnEditar': 'editarOEEPlanificaciones',
                'click #btnAsignarParametros': 'confirmActualizarSeleccionados',
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
                'click #btnSelTodos': function () { this.aplicarSeleccion(true); },
                'click #btnDesSelTodos': function () { this.aplicarSeleccion(false); },
                'click #btnCalcularOEEPlanificado': function () { this.ejecutarJobRecalcularOEEPlanificado() }
            },
            confirmActualizarSeleccionados: function (e) {
                e.preventDefault();
                var self = this;
                var permiso = TienePermiso(314);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var grid = $('#gridOEEPlanificaciones').data('kendoGrid');

                if (grid.tbody.find('>tr.k-state-selected').length > 0 || self.registrosSelData.length > 0 ||
                    (self.registrosDesSelData.length > 0 && self.registrosDesSelData.length < self.ds.data().length)) {
                        this.confirmacion = new VistaDlgConfirm({
                            titulo: window.app.idioma.t('OEE_PLANIFICACIONES'),
                            msg: window.app.idioma.t('CONFIRMACION_EDITAR_OEE_PLANIFICACIONES'),
                            funcion: function () { self.ActualizarSeleccionados(e.currentTarget.id); },
                            contexto: this
                        });
                } else {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                }
            },
            aplicarSeleccion: function (checked) {
                var self = this;

                self.selTodos = checked;

                var grid = $('#gridOEEPlanificaciones').data('kendoGrid');
                if (self.selTodos) {
                    grid.tbody.find('.checkbox').prop("checked", true);
                    grid.tbody.find(">tr").addClass('k-state-selected');

                    var dataSource = $("#gridOEEPlanificaciones").data("kendoGrid").dataSource;
                    var filters = dataSource.filter();
                    var allData = dataSource.data();
                    var query = new kendo.data.Query(allData);
                    var dataFiltered = query.filter(filters).data;
                    self.$("#lblRegSel").text(dataFiltered.length);
                } else {
                    grid.tbody.find('.checkbox').prop("checked", false);
                    grid.tbody.find(">tr").removeClass('k-state-selected');
                    self.registrosDesSelData = [];
                    self.registrosSelData = [];
                    self.$("#lblRegSel").text("");
                }
            },
            ejecutarJobRecalcularOEEPlanificado: function (e)
            {
                var grid = $("#gridOEEPlanificaciones");
                var dataSource = grid.data("kendoGrid").dataSource;
                // Calcular OEE Planificado
                $.ajax({
                    type: "POST",
                    async: false,
                    url: "../api/EjecutarJobActualizarOEEPlanificaciones/",
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).success(function (res) {
                    if (res) {
                        kendo.ui.progress(grid, true);
                        setTimeout(() => {
                            dataSource.read();
                            Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('SE_HA_EJECUTADO_JOB_ACTUALIZAR_OEE_PLANIFICADO'), 4000);
                            kendo.ui.progress(grid, false);
                        }, 15000)
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_OEE_PLANIFICADO'), 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                }).error(function (err) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_OEE_PLANIFICADO'), 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                });
            },
            limpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            CancelarFormulario: function () {
                this.ventanaEditarCrear.close();
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
            confirmarEdicion: function (e) {
                var self = this;

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('OEE_PLANIFICACION'),
                    msg: window.app.idioma.t('CONFIRMACION_EDITAR_OEE_PLANIFICACIONES'),
                    funcion: function () { self.modificarOEEPlanificaciones(); },
                    contexto: this
                });
            },
            ActualizarSeleccionados: function (e) {
                var self = this;
                var grid = $('#gridOEEPlanificaciones').data('kendoGrid');
                var selectedRows = self.registrosSelData;

                if (self.selTodos) {
                    var dataSource = self.ds;
                    var filters = dataSource.filter();
                    var allData = dataSource.data();
                    var query = new kendo.data.Query(allData);
                    var selectedRows = query.filter(filters).data;
                }
                                                
                var mediaAC = $("#txtMediaAC_Bar").data("kendoNumericTextBox").value();
                var oeePlanificado = $("#txtOeePlanificado_Bar").data("kendoNumericTextBox").value();
                var ajusteOEE = $("#txtAjusteOEE_Bar").data("kendoNumericTextBox").value();
                var inhabilitarCalculoAC = $("#chkInhabilitarCalculoAC_Bar").prop('checked');
                var inhabilitarCalculoOEE = $("#chkInhabilitarCalculoOEE_Bar").prop('checked');

                selectedRows.forEach((selectedRow) =>
                {
                    selectedRow.MediaAC = mediaAC;
                    selectedRow.OEEPlanificado = oeePlanificado;
                    selectedRow.AjusteOEE = ajusteOEE;
                    selectedRow.InhabilitarCalculoAC = inhabilitarCalculoAC;
                    selectedRow.InhabilitarCalculoOEE = inhabilitarCalculoOEE;
                });

                self.sendActualizarOEEPlanificaciones(selectedRows);

                grid.tbody.find('.checkbox').prop("checked", false);
                grid.tbody.find(">tr").removeClass('k-state-selected');
                self.registrosDesSelData = [];
                self.registrosSelData = [];
                self.$("#lblRegSel").text("");

                $("#txtMediaAC_Bar").data("kendoNumericTextBox").value("");
                $("#txtOeePlanificado_Bar").data("kendoNumericTextBox").value("");
                $("#txtAjusteOEE_Bar").data("kendoNumericTextBox").value("");
                $("#chkInhabilitarCalculoAC_Bar").prop('checked', false);
                $("#chkInhabilitarCalculoOEE_Bar").prop('checked', false);
            },
            modificarOEEPlanificaciones: function () {
                var self = this;

                var oeePlanificaciones = [];
                var row = {};
                row.MediaAC = $("#ntxtMediaAC").data("kendoNumericTextBox").value();
                row.OEEPlanificado = $("#ntxtOEEPlanificado").data("kendoNumericTextBox").value();
                row.AjusteOEE = $("#ntxtAjusteOEE").data("kendoNumericTextBox").value();
                row.InhabilitarCalculoAC = $("#chkInhabilitarCalculoAC").prop('checked');
                row.InhabilitarCalculoOEE = $("#chkInhabilitarCalculoOEE").prop('checked');
                row.IdOEEPlanificaciones = $("#hdIdOEEPlanificaciones").val();

                oeePlanificaciones.push(row);

                self.sendActualizarOEEPlanificaciones(oeePlanificaciones);
                self.ventanaEditarCrear.close();
            },
            sendActualizarOEEPlanificaciones: function (data) {
                var self = this;
                $.ajax({
                    data: JSON.stringify(data),
                    type: "PUT",
                    async: false,
                    url: "../api/EditarOEEPlanificaciones",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            self.ds.read();
                            self.selTodos = false;
                            Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('SE_HAN_MODIFICADO'), 4000);                            
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS_PARÁMETROS'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (response) {
                        s
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_MODIFICAR_LOS_PARÁMETROS'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltros").innerHeight();

                var gridElement = $("#gridOEEPlanificaciones"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            }
        });

        return gridOEEPlanificaciones;
    });