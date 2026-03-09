define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/GestionTurnos.html', 'compartido/notificaciones', 'jszip',
    'vistas/vDialogoConfirm', 'vistas/Envasado/vEditarDatosTurno', 'vistas/Envasado/vPartirMaquina'],
    function (_, Backbone, $, PlantillaHistoricoWO, Not, JSZip, VistaDlgConfirm, VistaEditarDatosTurno, VistaPartirMaquina) {
        var gridHistoricoTurno = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            dsDetalle: null,
            dsOrdenesTurno: null,
            grid: null,
            gridHistorico: null,
            gridDetalle: null,
            fin: new Date(), //Cambiar después inicio y fin
            inicio: new Date((new Date()).getTime() - (15 * 24 * 3600 * 1000)),
            filaExpand: null,
            tabDetail: null,
            numLinea: 1,
            detailRowData: null,
            fechaLocal: null,
            strTipoTurno: null,
            shcID: null,
            dsMaquinas: null,
            cmbOrdenes: null,
            txtContador: null,
            txtRechazos: null,
            recalculo: false,
            turnoRecalculo: {},
            horario: null,
            template: _.template(PlantillaHistoricoWO),
            initialize: function () {
                window.JSZip = JSZip;
                var self = this;
                self.recalculo = false;
                self.turnoRecalculo = {};
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth() + 1; //January is 0!

                var yyyy = today.getFullYear();
                if (dd < 10) {
                    dd = '0' + dd;
                }
                if (mm < 10) {
                    mm = '0' + mm;
                }
                var today = dd + '/' + mm + '/' + yyyy;

                self.getDataSource();
                self.render();
            },
            actualiza: function () {
                var self = this;
                self.dsDetalle = null;
                self.gridDetalle = null;

                if ($("#selectLinea").val() == '') {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_SELECCIONE_LINEA'), 3000);
                    return;
                }

                self.numLinea = $("#selectLinea").val();
                self.inicio = $("#dtpFechaDesde").data("kendoDatePicker").value();
                self.fin = $("#dtpFechaHasta").data("kendoDatePicker").value();
                self.turnosNoPlanif = $("#chkMostrarTurnosNoPlanif").prop('checked');

                if (!self.inicio || !self.fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LAS_FECHAS_INTRODUCIDAS'), 3000);
                    return;
                }

                if (self.inicio > self.fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('_LA_FECHA'), 3000);
                    return;
                }

                self.linea = $.grep(window.app.planta.lineas, function (linea, i) {
                    return linea.numLinea == self.numLinea;
                })[0];

                if (self.dsTurnos.page() != 1) {
                    self.dsTurnos.page(1);
                }
                self.dsTurnos.read();

                $.ajax({
                    type: "GET",
                    async: false,
                    url: "../api/obtenerMaquinasLineaConsolidados/" + self.numLinea,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        self.dsMaquinas = data;
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_MAQUINAS'), 2000);
                        }
                    }
                });
            },
            getDataSource: function () {
                var self = this;
                self.dsTurnos = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/ObtenerConsolidadoTurnos/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST",
                            complete: function (jqXHR, textStatus) {
                                //if (self.recalculo) {
                                //    self.recalculodICT(self.turnoRecalculo);
                                //    self.recalculo = false;
                                //    self.turnoRecalculo = {};
                                //}
                            }
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};

                                //if ($("#selectLinea").val() > 0) {
                                //    result.numLinea = $("#selectLinea").val();
                                //} else {
                                //    result.numLinea = 0;
                                //}
                                result.linea = self.linea.id;
                                result.fechaInicio = self.inicio;
                                result.fechaFin = self.fin;
                                result.turnosNoPlanif = self.turnosNoPlanif;

                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    schema: {
                        model: {
                            fields: {
                                FechaTurno: { type: "date" },
                                PaletsDespaletizadora: { type: "number" },
                                EnvasesLlenadora: { type: "number" },
                                CajasPacksEmpaquetadora: { type: "number" },
                                PaletsPaletizadora: { type: "number" },
                                EtiquetadoraPalets: { type: "number" },
                                RechazosVacios: { type: "number" },
                                RechazosLlenos: { type: "number" },
                                Cambios: { type: "number" },
                                Arranques: { type: "number" },
                                IdTurno: { type: "number" },
                                Comentario: { type: "string" }
                            }
                        },
                    },
                    aggregate: [
                        { field: "PaletsDespaletizadora", aggregate: "sum" },
                        { field: "EnvasesLlenadora", aggregate: "sum" },
                        { field: "CajasPacksEmpaquetadora", aggregate: "sum" },
                        { field: "PaletsPaletizadora", aggregate: "sum" },
                        { field: "EtiquetadoraPalets", aggregate: "sum" },
                        { field: "RechazosVacios", aggregate: "sum" },
                        { field: "RechazosLlenos", aggregate: "sum" },
                        { field: "Cambios", aggregate: "sum" },
                        { field: "Arranques", aggregate: "sum" },
                    ],
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            $("#center-pane").empty();
                        }
                    }
                });

                //return ds;
            },
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))
                var self = this;

                this.$("#selectLinea").kendoDropDownList({
                    dataTextField: "id",
                    dataValueField: "numLinea",
                    valueTemplate: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    template: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    //value: self.numLinea,
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "numLinea", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#dtpFechaDesde").kendoDatePicker({
                    value: self.inicio,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")//kendo.culture().name
                });

                $("#dtpFechaHasta").kendoDatePicker({
                    value: self.fin,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado"),//kendo.culture().name
                });

                //self.ds = self.getDataSource(self);
                self.renderGrid();
                self.resizeGrid();
            },
            renderGrid: function () {
                //GRID
                var self = this;
                this.grid = this.$("#gridHistoricoTurno").kendoGrid({
                    resizable: true,
                    excel: {
                        fileName: "HistoricoTurnos.xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    autoBind: false,
                    dataSource: self.dsTurnos,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    groupable: false,
                    detailTemplate: kendo.template($("#templateTurnos").html()),
                    //    function (e) {
                    //    return self.detailTemplate(e, self);
                    //},
                    detailInit: function (e) {
                    },
                    detailExpand: function (e) {
                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                        self.masterRow = e.masterRow
                        self.filaExpand = this.dataItem(e.masterRow).id;
                        self.detailRowData = this.dataItem(e.masterRow);
                        self.detailInit(e, self);
                    },
                    detailCollapse: function (e) {
                        self.filaExpand = null;
                        self.dsDetalle = null;
                        self.gridDetalle = null;
                    },
                    sortable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            //field: "SemaforoColor",
                            title: window.app.idioma.t('PRODUCCION'),
                            template: function (e) {
                                return "<div class='circle_cells' style='background-color:" + e.SemaforoColor + ";'/>";
                            },
                            width: 40,
                            filterable: false,
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            //field: "ArranqueWOSemaforo",
                            title: window.app.idioma.t('ARRANQUE_WO'),
                            template: function (e) {
                                return "<div class='circle_cells' style='background-color:" + e.ArranqueWOSemaforo + ";'/>";
                            },
                            width: 40,
                            filterable: false,
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            //field: "FinalizacionWOSemaforo",
                            title: window.app.idioma.t('FINALIZACION_WO'),
                            template: function (e) {
                                return "<div class='circle_cells' style='background-color:" + e.FinalizacionWOSemaforo + ";'/>";
                            },
                            width: 40,
                            filterable: false,
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            field: "Comentario",
                            title: window.app.idioma.t('COMENTARIO'),
                            width: 50,
                            filterable: false,
                            attributes: { style: "text-align:center;" },
                            template: '<img id="imgDesc" src="../Portal/img/round_comment_notification.png" style="width: 16px !important; height:16px !important;#if(!Comentario){# display:none;#}#">'
                        },
                        {
                            field: "FechaTurno",
                            title: window.app.idioma.t('FECHA'),
                            width: 82,
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                        //culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            template: '#: kendo.toString(new Date(FechaTurno),kendo.culture().calendars.standard.patterns.MES_Fecha)#'
                        },
                        {
                            field: "TipoTurno",
                            title: window.app.idioma.t('TIPO_TURNO'),
                            template: "#if(IdTipoTurno){# #: window.app.idioma.t('TURNO'+IdTipoTurno) # #}#",
                            width: 78,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=TipoTurno#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoTurno#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "IdTurno",
                            title: window.app.idioma.t("IDTURNO"),
                            width: 90,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 0
                                    });
                                }
                            }
                        },
                        {
                            field: "PaletsDespaletizadora",
                            title: window.app.idioma.t('PALETS_DESP'),
                            width: 93,
                            aggregates: ["sum"],
                            footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                            template: '<div style="text-align:right;">#= kendo.format("{0:n0}",PaletsDespaletizadora)#</div>',
                            filterable: false
                        },
                        {
                            field: "EnvasesLlenadora",
                            title: window.app.idioma.t('ENVASES_LLEN'),
                            width: 98,
                            aggregates: ["sum"],
                            footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                            template: '<div style="text-align:right;">#= kendo.format("{0:n0}",EnvasesLlenadora)#</div>',
                            filterable: false
                        },
                        {
                            field: "CajasPacksEmpaquetadora",
                            title: window.app.idioma.t('CAJAS_PACKS_EMP'),
                            width: 125,
                            aggregates: ["sum"],
                            footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                            template: '<div style="text-align:right;">#= kendo.format("{0:n0}",CajasPacksEmpaquetadora)#</div>',
                            filterable: false
                        },
                        {
                            field: "PaletsPaletizadora",
                            title: window.app.idioma.t('PALETS_PAL'),
                            width: 90,
                            aggregates: ["sum"],
                            footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                            template: '<div style="text-align:right;">#= kendo.format("{0:n0}",PaletsPaletizadora)#</div>',
                            filterable: false
                        },
                        {
                            field: "EtiquetadoraPalets",
                            title: window.app.idioma.t('ETIQUETADORA_PALETS'),
                            width: 90,
                            aggregates: ["sum"],
                            footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                            template: '<div style="text-align:right;">#= kendo.format("{0:n0}",EtiquetadoraPalets)#</div>',
                            filterable: false
                        },
                        {
                            field: "RechazosVacios",
                            title: window.app.idioma.t('RECH_VACÍOS'),
                            width: 95,
                            aggregates: ["sum"],
                            footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                            template: '<div style="text-align:right;">#= kendo.format("{0:n0}",RechazosVacios)#</div>',
                            filterable: false
                        },
                        {
                            field: "RechazosLlenos",
                            title: window.app.idioma.t('RECH_LLENOS'),
                            width: 95,
                            aggregates: ["sum"],
                            footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                            template: '<div style="text-align:right;">#= kendo.format("{0:n0}",RechazosLlenos)#</div>',
                            filterable: false
                        },
                        {
                            field: "Cambios",
                            title: window.app.idioma.t('CAMBIOS'),
                            width: 70,
                            aggregates: ["sum"],
                            footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                            filterable: false,
                            template: '<div style="text-align:right;">#= Cambios#</div>'
                        },
                        {
                            field: "Arranques",
                            title: window.app.idioma.t('ARRANQUES'),
                            width: 75,
                            aggregates: ["sum"],
                            footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                            filterable: false,
                            template: '<div style="text-align:right;">#= Arranques#</div>'
                        },
                        {
                            field: "Rendimiento",
                            title: window.app.idioma.t('RENDIMIENTO'),
                            width: 85,
                            template: '<div style="text-align:right;">#=kendo.toString(parseFloat(Rendimiento.toFixed(2)), "n") #%</div>',
                            filterable: false
                        },
                        //{
                        //    field: "IC",
                        //    title: window.app.idioma.t('IC'),
                        //    width: 65,
                        //    template: '<div style="text-align:right;">#= IC != 1000 ? kendo.format("{0:n2}",IC):kendo.format("{0:n0}",IC)#‰</div>',
                        //    filterable: false
                        //},
                        {
                            field: "OEE",
                            title: window.app.idioma.t('OEE'),
                            width: 90,
                            template: "<div class='progress' style='width:100%;'></div>",
                            filterable: false
                        },
                    ],
                    dataBinding: self.resizeGrid,
                    dataBound: function (e) {
                        var grid = this;
                        $(".progress").each(function () {
                            var row = $(this).closest("tr");
                            var model = grid.dataItem(row);

                            var OEEProgress = $(this).kendoProgressBar({
                                type: "value", //type: "percent",
                                value: model.OEE,
                                max: 100
                            }).data("kendoProgressBar");

                            if (Math.floor(model.OEE) == model.OEE) {
                                OEEProgress.progressStatus.text(model.OEE + " %");
                            } else {
                                OEEProgress.progressStatus.text(kendo.toString(parseFloat(model.OEE.toFixed(2)), "n") + "%");
                            }

                            if (model.OEE < model.OEECritico) {
                                OEEProgress.progressWrapper.css({
                                    "background-color": "red",
                                    "border-color": "red"
                                });
                            } else if (model.OEE < model.OEEObjetivo) {
                                OEEProgress.progressWrapper.css({
                                    "background-color": "orange",
                                    "border-color": "orange"
                                });
                            } else if (model.OEE > 100) {
                                OEEProgress.progressWrapper.css({
                                    "background-color": "#FF0000",
                                    "border-color": "#FF0000"
                                });
                            } else {
                                OEEProgress.progressWrapper.css({
                                    "background-color": "green",
                                    "border-color": "green"
                                });
                            }
                        });

                        let data = grid.dataSource.data();
                        $.each(data, function (i, row) {
                            if (row.IdTurno == 0) {
                                $('tr[data-uid="' + row.uid + '"] ').css("background-color", "#FDDDE6");//#F8C8DC
                            }
                        })

                        // Si teniamos abierto un detalle de fila antes de la actualización de datos (que cierra los paneles de detalle) lo volvemos a abrir
                        if (self.filaExpand) {
                            var dataItem = grid.dataSource.get(self.filaExpand);
                            if (dataItem) grid.expandRow("tr[data-uid=" + dataItem.uid + "]");
                        }

                        if (data.length > 0) {
                            $('.k-grid-footer').show();
                        } else {
                            $('.k-grid-footer').hide();
                        }
                    },
                    excelExport: function (e) {
                        kendo.ui.progress($("#gridHistoricoTurno"), true);
                        var sheet = e.workbook.sheets[0];
                        sheet.rows[0].cells[0].value = window.app.idioma.t('NOTA');
                        var objectDescription = sheet.rows[0].cells[0]; // Añadimos el header descripción a una variable
                        sheet.rows[0].cells.splice(0, 1);// Lo eliminamos del arreglo de Headers
                        sheet.rows[0].cells.push(objectDescription); // Lo añadimos al final del arreglo

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var row = sheet.rows[i];
                                var dataPosition = i - 1;
                                var cellDescription = ParseDescriptionToHTML(e.data[dataPosition].Comentario);// Obtenemos la celda de descripción
                                row.cells.splice(1, 1);// Eliminamos de todos los datos de la fila el primer valor

                                //field: "FechaTurno"
                                row.cells[0].value = kendo.toString(e.data[dataPosition].FechaTurno, kendo.culture().calendars.standard.patterns.MES_Fecha);
                                //field: "PaletsDespaletizadora"
                                row.cells[3].value = kendo.toString(e.data[dataPosition].PaletsDespaletizadora, "n0");
                                //field: "EnvasesLlenadora",
                                row.cells[4].value = kendo.toString(e.data[dataPosition].EnvasesLlenadora, "n0");
                                //field: "CajasPacksEmpaquetadora"
                                row.cells[5].value = kendo.toString(e.data[dataPosition].CajasPacksEmpaquetadora, "n0");
                                //field: "PaletsPaletizadora"
                                row.cells[6].value = kendo.toString(e.data[dataPosition].PaletsPaletizadora, "n0");
                                //field: "EtiquetadoraPalets"
                                row.cells[7].value = kendo.toString(e.data[dataPosition].EtiquetadoraPalets, "n0");
                                //field: "RechazosVacios"
                                row.cells[8].value = kendo.toString(e.data[dataPosition].RechazosVacios, "n0");
                                //field: "RechazosLlenos"
                                row.cells[9].value = kendo.toString(e.data[dataPosition].RechazosLlenos, "n0");
                                //field: "rendimiento"
                                row.cells[12].value = kendo.toString(parseFloat(e.data[dataPosition].Rendimiento.toFixed(2)), "n") + "%";
                                //field: "IC"
                                //row.cells[13].value = kendo.toString(parseFloat(e.data[dataPosition].IC.toFixed(2)), "n") + "‰";
                                //field: "OEE"
                                row.cells[13].value = kendo.toString(parseFloat(e.data[dataPosition].OEE.toFixed(2)), "n") + "%";
                                row.cells.push({ value: cellDescription });
                            } catch (e) { }
                        }
                        sheet.columns.forEach(function (column) {
                            // also delete the width if it is set
                            delete column.width;
                            column.autoWidth = true;
                        });
                        kendo.ui.progress($("#gridHistoricoTurno"), false);
                    }
                });

                this.$('#gridHistoricoTurno').kendoTooltip({
                    filter: "#imgDesc",
                    position: "auto",
                    width: 'auto',
                    content: function (e) {
                        var grid = $("#gridHistoricoTurno").data("kendoGrid");
                        var dataItem = grid.dataItem(e.target.closest("tr"));
                        return CodificarEnHTML(dataItem["Comentario"]);
                    }
                }).data("kendoTooltip");

                //this.grid.data("kendoGrid").dataSource.bind("change", function (e) {
                //    var rowExpand = $("#gridHistoricoTurno").find(".k-detail-row:visible");
                //    var gridRows = self.grid.find("tr");

                //    gridRows.each(function (e) {
                //        if (self.fechaLocal && self.strTipoTurno) {
                //            if ($(this)[0].cells[2] && $(this)[0].cells[3] && $(this)[0].cells[2].innerHTML == self.fechaLocal && $(this)[0].cells[3].innerHTML == self.strTipoTurno) {
                //                var dataUid = $(this).attr("data-uid")
                //                $("#gridHistoricoTurno").data("kendoGrid").expandRow("tr[data-uid='" + dataUid + "']");
                //            }
                //        }
                //    });
                //});

                window.app.headerGridTooltip($("#gridHistoricoTurno").data("kendoGrid"));
            },
            //detailTemplate: function (e, vista) {
            //    var self = this;
            //    self.detalle = false;

            //    var orden = {};
            //    orden.id = null;
            //    return kendo.template($("#template").html())(orden); //Averiguar por qué si no le paso un objeto no funciona hay que eliminar la creacion de la orden que no tiene sentido
            //},
            detailInit: function (e, vista) {
                var self = this;

                self.detailRow = e.detailRow;
                self.detailRow.find(".tabPanel").html(this.$("#templateTurnos").html());
                self.tabPanelRow = self.detailRow.find(".tabPanel");
                var gridHistorico = self.detailRow.find(".detalle");
                var gridProduccionTurnoOrdenes = self.detailRow.find(".produccionTurnoOrden");
                var gridFormularios = self.detailRow.find(".calidad");
                var dataTurno = self.detailRowData;

                //self.shcID = dataTurno.shcID;
                self.detailRow.find("#textNote").kendoEditor({ tools: [] });

                self.DDLMaquinas = self.detailRow.find(".selectMaquina").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "Id",
                    dataSource: self.dsMaquinas,
                    change: function (e) { self.filtrarMaquinas(e); },
                    //optionLabel: window.app.idioma.t('SELECCIONE')
                }).data("kendoDropDownList");

                self.txtContador = self.detailRow.find('#contador');
                self.txtRechazos = self.detailRow.find('#rechazos');
                //Guardamos el dataSource de Particiones para usarlo a posteriori y lo cargamos en el dDropDown
                vista.dsOrdenesTurno = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/turnoParticiones/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};

                                if ($("#selectLinea").val() > 0) {
                                    result.numLinea = $("#selectLinea").val();
                                } else {
                                    result.numLinea = 0;
                                }
                                result.inicio = dataTurno.InicioTurno;
                                result.fin = dataTurno.FinTurno;
                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            $("#center-pane").empty();
                        }
                    }
                });

                self.cmbOrdenes = self.detailRow.find("#selectParticion").kendoComboBox({
                    filter: "startswith",
                    dataTextField: "IdOrdenPadre",
                    dataValueField: "IdOrdenPadre",
                    dataSource: vista.dsOrdenesTurno,
                    // optionLabel: "Sin Asignar",
                    noDataTemplate: 'No data'
                }).data("kendoComboBox");

                self.obtenerHorarioTurno(dataTurno.IdTurno);

                vista.cargarProduccionTurnoOrdenes(gridProduccionTurnoOrdenes, dataTurno);

                self.tabDetail = self.detailRow.find(".tabPanel").kendoTabStrip({
                    animation: {
                        open: { effects: "fadeIn" }
                    },
                    select: function (e) {
                        if ($(e.item).index() == 0) {
                            vista.cargarProduccionTurnoOrdenes(gridProduccionTurnoOrdenes, dataTurno)
                        } else if ($(e.item).index() == 1) {
                            vista.cargarHistoricoDetalle(gridHistorico, dataTurno, vista);
                        } else if ($(e.item).index() == 2) {
                            self.detailRow.find("#textNote").data("kendoEditor").refresh();
                            self.detailRow.find("#textNote").data("kendoEditor").value(CodificarEnHTML(dataTurno.Comentario));
                        } else if ($(e.item).index() == 3) {
                            vista.cargarFormularios(gridFormularios, dataTurno);
                        }
                    }
                }).data("kendoTabStrip");

                if (self.linea.Grupo) {
                    $("#lblPorcentaje").show();
                    $("#porcentaje").show();

                    $('#porcentaje').on('input', function () {
                        let valor = $(this).val().replace(/\D/g, ''); // eliminar caracteres no numéricos
                        //valor = valor ? Math.min(100, parseInt(valor)) : 100; // limitar a 100 y evitar NaN
                        $(this).val(valor);
                    });
                } else {
                    $("#lblPorcentaje").hide();
                    $("#porcentaje").hide();
                }

                if (dataTurno.Comentario) {
                    self.detailRow.find("#divNotas").css({ "background-color": "green", "color": "white" })
                } else {
                    self.detailRow.find("#divNotas").css({ "background-color": "", "color": "" })
                }

                kendo.ui.progress($("#divDetallesLoad"), true);
                self.tabDetail.select('0');
            },
            obtenerHorarioTurno: function (idTurno) {
                var self = this;

                $.ajax({
                    type: "GET",
                    async: false,
                    data: { idTurno: idTurno },
                    url: "../api/turnos/breaks",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        self.horario = data;
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    }
                });
            },
            confirmarBorrarRegistros: function (e) {
                var self = this;
                var permiso = TienePermiso(116);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ELIMINAR_REGISTROS'),
                    msg: window.app.idioma.t('DESEA_REALMENTE_ELIMNINAR'),
                    funcion: function () { self.eliminarRegistros(e); },
                    contexto: this
                });
            },
            eliminarRegistros: function () {
                var self = this;
                var arrSel = new Array();
                var i = 0;
                var gridRows = this.gridDetalle.find("tr");
                var esLLenadoraEtiquetadora = false;

                gridRows.each(function (e, element) {
                    var chkAsignar = $(this).find(".chkAsignar");
                    if (chkAsignar[0] && chkAsignar[0].checked) {
                        var data = self.gridDetalle.data("kendoGrid").dataItem(element);
                        //arrSel[i] = self.dsDetalle.at(e - 2);
                        arrSel[i] = data;
                        i++;
                        if (data.clase == 'LLENADORA' || data.clase == 'ETIQUETADORA_PALETS') {
                            esLLenadoraEtiquetadora = true;
                        }
                    }
                });

                if (arrSel.length > 0) {
                    var datos = {};
                    datos.arrSel = arrSel;

                    $.ajax({
                        data: JSON.stringify(datos),
                        type: "POST",
                        async: true,
                        url: "../api/eliminarRegistrosMaquina/",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            if (res[0]) {
                                self.gridDetalle.data("kendoGrid").dataSource.read();
                                self.gridDetalle.data('kendoGrid').refresh();
                                self.confirmacion.cancelar();
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_ELIMINADO_GESTION_TURNOS'), 4000);

                                if (esLLenadoraEtiquetadora) {
                                    var datosTurno = {};
                                    datosTurno.idTurno = self.detailRowData.IdTurno;
                                    datosTurno.numLinea = self.numLinea;
                                    datosTurno.fechaTurno = self.detailRowData.FechaTurno;
                                    datosTurno.idTipoTurno = self.detailRowData.IdTipoTurno;

                                    self.marcarTurnoRecalculoIC(datosTurno);
                                }
                            } else {
                                self.gridDetalle.data("kendoGrid").dataSource.read();
                                self.gridDetalle.data('kendoGrid').refresh();
                                self.confirmacion.cancelar();
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_ELIMNAR'), 4000);
                            }
                        },
                        error: function (err) {
                            self.confirmacion.cancelar();
                            self.gridDetalle.data("kendoGrid").dataSource.read();
                            self.gridDetalle.data('kendoGrid').refresh();
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_ELIMNAR'), 2000);
                            }
                        }
                    });
                } else {
                    self.confirmacion.cancelar();
                    Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 2000);
                }

                //console.log('actualizaremos cantidades rechazos: ' + rechazos + ' contador:' + contador + ' array: ' + arrRegSeleccionados);
            },
            confirmAsignarCantidades: function (e) {
                var self = this;
                var permiso = TienePermiso(116);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                let porcentaje = $("#porcentaje").val() == '' ? 0 : parseInt($("#porcentaje").val());

                if (porcentaje > 100) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('TOTAL_PRODUCCION_MAYOR'), 3000);
                    return;
                }

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ASIGNAR_CANTIDADES'),
                    msg: window.app.idioma.t('DESEA_REALMENTE_ASIGNAR'),
                    funcion: function () { self.asignarCantidades(porcentaje); },
                    contexto: this
                });
            },
            asignarCantidades: function (porcentaje) {
                var self = this;
                var orden = self.cmbOrdenes.value();
                var contador = self.txtContador.val().replace(/\./g, '');
                var rechazos = self.txtRechazos.val().replace(/\./g, '');
                var arrSel = new Array();
                var i = 0;
                //if (particion == "Sin Asignar") particion = "";
                var gridRows = this.gridDetalle.find("tr");
                var esLLenadoraEtiquetadora = false;

                gridRows.each(function (e, element) {
                    var chkAsignar = $(this).find(".chkAsignar");
                    if (chkAsignar[0] && chkAsignar[0].checked) {
                        var data = self.gridDetalle.data("kendoGrid").dataItem(element);
                        //arrSel[i] = self.dsDetalle.at(e - 2);
                        arrSel[i] = data;
                        i++;
                        if (data.clase == 'LLENADORA' || data.clase == 'ETIQUETADORA_PALETS') {
                            esLLenadoraEtiquetadora = true;
                        }
                    }
                });

                if (arrSel.length > 0) {
                    if (!isNaN(contador) && !isNaN(rechazos) && contador != "" && rechazos != "" && parseInt(contador) >= 0 && parseInt(rechazos) >= 0) {
                        var datosMaquina = {};
                        datosMaquina.contador = contador;
                        datosMaquina.rechazos = rechazos;
                        datosMaquina.orden = orden;
                        datosMaquina.porcentaje = porcentaje;
                        datosMaquina.arrSel = arrSel;

                        $.ajax({
                            data: JSON.stringify(datosMaquina),
                            type: "POST",
                            async: true,
                            url: "../api/editarRegistrosMaquina/",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function (res) {
                                if (res[0]) {
                                    self.gridDetalle.data("kendoGrid").dataSource.read();
                                    self.gridDetalle.data('kendoGrid').refresh();
                                    self.confirmacion.cancelar();
                                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_ASIGNADO'), 4000);

                                    if (esLLenadoraEtiquetadora) {
                                        var datosTurno = {};
                                        datosTurno.idTurno = self.detailRowData.IdTurno;
                                        datosTurno.numLinea = self.numLinea;
                                        datosTurno.fechaTurno = self.detailRowData.FechaTurno;
                                        datosTurno.idTipoTurno = self.detailRowData.IdTipoTurno;

                                        self.marcarTurnoRecalculoIC(datosTurno);
                                    }
                                } else {
                                    self.gridDetalle.data("kendoGrid").dataSource.read();
                                    self.gridDetalle.data('kendoGrid').refresh();
                                    self.confirmacion.cancelar();
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), res[1], 4000);
                                }
                            },
                            error: function (err) {
                                self.confirmacion.cancelar();
                                self.gridDetalle.data("kendoGrid").dataSource.read();
                                self.gridDetalle.data('kendoGrid').refresh();
                                if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                } else if (err.responseJSON.ExceptionMessage == window.app.idioma.t('ERROR_LIMITE_CONTADOR_RECHAZOS')) {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_LIMITE_CONTADOR_RECHAZOS'), 3000);
                                } else {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_ASIGNAR'), 3000);
                                }
                            }
                        });
                    } else {
                        self.confirmacion.cancelar();
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('CONTADOR_Y_RECHAZOS'), 3000);
                    }
                } else {
                    self.confirmacion.cancelar();
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 3000);
                }
            },
            exportExcel: function () {
                kendo.ui.progress($("#gridHistoricoTurno"), true);
                var grid = $("#gridHistoricoTurno").data("kendoGrid");
                grid.saveAsExcel();
                kendo.ui.progress($("#gridHistoricoTurno"), false);
            },
            LimpiarFiltroGrid: function () {
                var self = this;

                $("form.k-filter-menu button[type='reset']").trigger("click");
                self.actualiza();
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

                var gridElement = $("#gridHistoricoTurno"),
                    dataArea = gridElement.find(".k-grid-content:first"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            },
            events: {
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnFiltrar': 'actualiza',
                'click #btnLeyenda': 'mostrarLeyenda',
                'click #btnExportExcel': 'exportExcel',
                'click #btnAsignar': 'confirmAsignarCantidades',
                'click #btnRefrescarTurno': 'refrescarTurno',
                'click #btnParteTurno': 'parteTurno',
                //'click #btnActualizarIC': 'actualizarIC',
                'click #btnModificarDatosTurno': 'modificarDatosTurno',
                'click #btnAñadirRegistros': 'confirmAnadirRegistros',
                'click #btnFiltrarMaq': 'filtrarMaquinas',
                'click #btnFusionar': 'confirmFusionar',
                'click #btnPartir': 'partir',
                'click #btnBorrar': 'confirmarBorrarRegistros',
                'change .chkAsignar': 'asignarContadorRechazos',
                'click .btnSaveNotes': 'saveNote'
            },
            mostrarLeyenda: function () {
                var self = this;

                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='windowLeyenda'></div>"));

                var ventanaLeyenda = $("#windowLeyenda").kendoWindow(
                    {
                        title: window.app.idioma.t('DESCRIPCION_COLORES'),
                        width: "1135px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        close: function () {
                            ventanaLeyenda.getKendoWindow().destroy();
                        },
                        refresh: function () {
                        }
                    });

                var template = kendo.template($("#templateLeyenda").html());
                ventanaLeyenda.getKendoWindow()
                    .content(template({}))
                    .center().open();
            },
            saveNote: function () {
                var self = this;
                var permiso = TienePermiso(116);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var descValue = self.detailRow.find("#textNote").data("kendoEditor").value();
                descValue = ParseDescriptionToHTML(descValue);

                if (self.detailRowData.Comentario != descValue) {
                    kendo.ui.progress($("#gridHistoricoTurno"), true);
                    self.añadirNota(self, descValue);
                }
            },
            añadirNota: function (self, descValue) {
                datos = {
                    IdTurno: self.detailRowData.IdTurno,
                    Comentario: descValue,
                    IdTipoTurno: self.detailRowData.IdTipoTurno,
                    InicioTurno: self.detailRowData.InicioTurno,
                    IdConsolidadoTurno: self.detailRowData.IdConsolidadoTurno
                };

                $.ajax({
                    type: "PUT",
                    url: "../api/turnos/ComentarioTurno",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    async: true,
                }).done(function (res) {
                    Backbone.trigger('eventCierraDialogo');
                    kendo.ui.progress($("#gridHistoricoTurno"), false);

                    if (!res) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_EDITAR_LAS'), 4000);
                        return;
                    }

                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('NOTAS_ACTUALIZADAS_CORRECTAMENTE'), 4000);

                    var elementNote = self.masterRow.find("#imgDesc");
                    self.detailRowData.Comentario = descValue;
                    $('#gridHistoricoTurno').data('kendoTooltip').refresh();

                    if (descValue) {
                        if (elementNote) {
                            self.masterRow.find("#imgDesc").show();
                        }
                        self.detailRow.find("#divNotas").css({ "background-color": "green", "color": "white" })
                    } else {
                        if (elementNote) {
                            self.masterRow.find("#imgDesc").hide();
                        }
                        self.detailRow.find("#divNotas").css({ "background-color": "", "color": "" })
                    }
                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    kendo.ui.progress($("#gridHistoricoTurno"), false);
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_EDITAR_LAS'), 4000);
                });
            },
            chkPlanificadoDetalle: function () {
                var gridRows = this.gridDetalle.find("tr");

                gridRows.each(function (e) {
                    if (e > 0 && parseInt($(this)[0].cells[15].innerHTML) > 0) {
                        //$(this)[0].cells[1].innerHTML = "<input class=\"chkPlanificado\" type=\"checkbox\" checked=\"checked\">"
                        $(this)[0].cells[1].innerHTML = "<input type=\"checkbox\" checked=\"checked\" disabled readonly>"
                    }
                });
            },
            asignarContadorRechazos: function (e) {
                var contadorTotal = 0;
                var rechazosTotales = 0;

                $('.chkAsignar:checked').each(function (index, elem) {
                    var row = $('.detalle').data("kendoGrid").dataItem($(elem).closest('tr'));
                    contadorTotal += row.contadorProdAuto;
                    rechazosTotales += row.contadorRechAuto;
                });

                $('#contador').val(contadorTotal);
                $('#rechazos').val(rechazosTotales);
            },
            confirmFusionar: function (e) {
                var self = this;
                var permiso = TienePermiso(116);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('FUSIONAR_REGISTROS'),
                    msg: window.app.idioma.t('DESEA_REALMENTE_FUSIONAR'),
                    funcion: function () { self.fusionar(e); },
                    contexto: this
                });
            },
            fusionar: function (e) {
                var self = this;

                var registroMaquina = null;
                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                var inicio = tr[0].cells[4].innerHTML;
                var fin = tr[0].cells[5].innerHTML;
                var gridRows = this.gridDetalle.find("tr");

                gridRows.each(function (e) {
                    if ($(this)[0].cells[4].innerHTML == inicio && $(this)[0].cells[5].innerHTML == fin) {
                        if (gridRows.length == e + 1) {
                            self.confirmacion.cancelar()
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_PUEDE_ELEGIR'), 2000);
                        } else {
                            var grid = self.gridDetalle.data("kendoGrid");
                            var registroIni = grid.dataItem(this);
                            var registroFin = grid.dataSource.at(($(this).index() + 1));

                            var datosFusionar = {};
                            datosFusionar.registroIni = registroIni;
                            datosFusionar.registroFin = registroFin;

                            $.ajax({
                                data: JSON.stringify(datosFusionar),
                                type: "POST",
                                async: true,
                                url: "../api/fusionarRegistrosMaquina",
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (res) {
                                    if (res[0]) {
                                        self.confirmacion.cancelar();
                                        self.gridDetalle.data("kendoGrid").dataSource.read();
                                        self.gridDetalle.data('kendoGrid').refresh();
                                    } else {
                                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res[1], 2000);
                                        self.confirmacion.cancelar();
                                    }
                                },
                                error: function (err) {
                                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                                    } else {
                                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_FUSIONAR'), 2000);
                                    }
                                    self.confirmacion.cancelar();
                                }
                            });
                        }
                    }
                });
            },
            partir: function (e) {
                var self = this;
                var permiso = TienePermiso(116);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var registroMaquina = null;
                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                var inicio = tr[0].cells[4].innerHTML;
                var fin = tr[0].cells[5].innerHTML;
                var gridRows = this.gridDetalle.find("tr");

                gridRows.each(function (e, element) {
                    var data = self.gridDetalle.data("kendoGrid").dataItem(element);
                    if ($(this)[0].cells[4].innerHTML == inicio && $(this)[0].cells[5].innerHTML == fin) {
                        registroMaquina = data;
                        //registroMaquina = self.dsDetalle.at(e - 2);
                        var partirMaquina = new VistaPartirMaquina({ registroMaquina: registroMaquina, inicio: inicio, fin: fin, padre: self });
                    }
                });
            },
            filtrarMaquinas: function (e) {
                var self = this;
                self.gridDetalle.data("kendoGrid").dataSource.read();
                self.gridDetalle.data('kendoGrid').refresh();
            },
            confirmAnadirRegistros: function (e) {
                var self = this;
                var permiso = TienePermiso(116);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('AÑADIR_REGISTROS'),
                    msg: window.app.idioma.t('DESEA_REALMENTE_AÑADIR'),
                    funcion: function () { self.anadirRegistros(e); },
                    contexto: this
                });
            },
            anadirRegistros: function (e) {
                var self = this;

                var datos = {};
                datos.turno = self.detailRowData;

                $.ajax({
                    data: JSON.stringify(datos),
                    type: "POST",
                    async: true,
                    url: "../api/rellenarRegistrosTurno",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res[0]) {
                            self.confirmacion.cancelar(e);
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_OPERACION_SE'), 2000);
                            self.refrescarTurno();

                            var datosTurno = {};
                            datosTurno.idTurno = self.detailRowData.IdTurno;
                            datosTurno.numLinea = self.numLinea;
                            datosTurno.fechaTurno = new Date(self.detailRowData.FechaTurno.setHours(0, 0, 0));
                            datosTurno.idTipoTurno = self.detailRowData.IdTipoTurno;

                            self.marcarTurnoRecalculoIC(datosTurno);
                        } else {
                            self.confirmacion.cancelar();
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_AÑADIR_REGISTROS'), 2000);
                        }
                    },
                    error: function (err) {
                        self.confirmacion.cancelar();
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_AÑADIR_REGISTROS'), 2000);
                        }
                    }
                });
            },
            modificarDatosTurno: function (e) {
                var self = this;
                let permiso = TienePermiso(116);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                let detalleTurnoDiv = $(e.target).closest(".produccionTurnoOrden");
                var edicionDG = new VistaEditarDatosTurno({ datosTurno: self.detailRowData, detalleTurnoDiv });
            },
            refrescarTurno: function (e) {
                var self = this;

                var turno = {};
                turno.IdTurno = self.detailRowData.IdTurno;

                $.ajax({
                    data: JSON.stringify(turno),
                    type: "PUT",
                    async: true,
                    url: "../api/ActualizarConsolidadoTurno",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            self.dsTurnos.read();
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_ACTUALIZADO_TURNO'), 3000);
                        }
                    },
                    error: function (err) {
                    }
                });
            },
            //actualizarIC: function (e) {
            //    var self = this;
            //    self.dsDetalle = null;
            //    self.gridDetalle = null;
                
            //    var turno = {};
            //    turno.IdLinea = self.detailRowData.IdLinea;
            //    turno.GrupoIC = self.detailRowData.GrupoIC;

            //    if (turno.GrupoIC == 0) {
            //        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), 'No se puede actualizar el IC de este turno, consulte a un Administrador si necesita hacerlo', 3000);
            //        return;
            //    }

            //    $.ajax({
            //        data: JSON.stringify(turno),
            //        type: "PUT",
            //        async: true,
            //        url: "../api/ActualizarICPorLineaGrupo",
            //        contentType: "application/json; charset=utf-8",
            //        dataType: "json",
            //        success: function (res) {
            //            if (res) {
            //                self.dsTurnos.read();
            //                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ACTUALIZANDO_OK'), 3000);
            //            } else {
            //                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_CALCULO_IC'), 3000);
            //            }
            //        },
            //        error: function (err) {
            //            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACTUALIZAR_IC'), 3000);
            //        }
            //    });
            //},
            marcarTurnoRecalculoIC: function (datosTurno) {
                var self = this;

                $.ajax({
                    data: JSON.stringify(datosTurno),
                    type: "PUT",
                    async: true,
                    url: "../api/MarcarTurnoParaRecalculoIC",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                    },
                    error: function (err) {
                        var e = e;
                    }
                });
            },
            parteTurno: function (e) {
                const turno = $(e.target).closest(".produccionTurnoOrden").find('.turnoDiv').html();
                const fecha = $(e.target).closest(".produccionTurnoOrden").find('.fechaDiv').html();
                const linea = this.$("#selectLinea").find(":selected").text();

                window.location.href = "#InformeTurno?turno=" + turno + "&fecha=" + fecha + "&linea=" + linea;
            },
            cargarHistoricoDetalle: function (grid, dataTurno, vista) {
                //Cargamos el grid detalle de historicos
                var self = this;
                //if (self.dsDetalle && self.gridDetalle) {
                //    self.gridDetalle.data('kendoGrid').dataSource.read();
                //    self.gridDetalle.data('kendoGrid').refresh();
                //} else {

                self.dsDetalle = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/turnosProduccionMaquinas/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.maquinaID = self.DDLMaquinas.value();
                                result.fechaTurnoUTC = dataTurno.FechaTurno;
                                result.idTipoTurno = dataTurno.IdTipoTurno;
                                //console.log('Nueva consulta detalle ' + JSON.stringify(result));
                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    pageSize: 16,
                    schema: {
                        model: {
                            fields: {
                                contadorProd: { type: "number" },
                                contadorProdAuto: { type: "number" },
                                contadorRech: { type: "number" },
                                contadorRechAuto: { type: "number" },
                                velocidadNominal: { type: "number" },
                            }
                        }
                    },
                    aggregate: [
                        { field: "contadorProd", aggregate: "sum" },
                        { field: "contadorProdAuto", aggregate: "sum" },
                        { field: "contadorRech", aggregate: "sum" },
                        { field: "contadorRechAuto", aggregate: "sum" },
                        { field: "velocidadNominal", aggregate: "sum" },
                        { field: "tiempoPlanificado", aggregate: "sum" },
                    ],
                    requestStart: function () {
                        kendo.ui.progress($(self.tabPanelRow).find("#historicotab"), true);
                    },
                    requestEnd: function () {
                        kendo.ui.progress($(self.tabPanelRow).find("#historicotab"), false);
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    }
                });

                self.gridDetalle = grid.kendoGrid({
                    dataSource: self.dsDetalle,
                    scrollable: true,
                    sortable: false,
                    resizable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [16, 24],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        { template: "<input type='checkbox' class='chkAsignar' />", title: window.app.idioma.t('ASIGNAR'), width: 40 },
                        { template: "<input type='checkbox' disabled readonly/>", title: window.app.idioma.t('PLANIFICADO'), width: 40 },
                        { template: "<a id='btnFusionar' class='k-button k-button-icontext' style='min-width:0px'><img src='img/fusionar.png' height='20'/>" + "</a>", width: 50 },
                        { template: "<a id='btnPartir' class='k-button k-button-icontext' style='min-width:0px'><img src='img/partir.png' height='20'/>" + "</a>", width: 50 },
                        {
                            field: 'fechaInicioLocal',
                            title: window.app.idioma.t('FECHA_HORAINICIO'),
                            type: "date",
                            width: 130,
                            template: '#: kendo.toString(new Date(fechaInicioLocal),kendo.culture().calendars.standard.patterns.MES_FechaHora)#',

                            filterable: false
                        },
                        {
                            field: 'fechaFinLocal',
                            title: window.app.idioma.t('FECHA_HORAFIN'),
                            type: "date",
                            width: 130,
                            template: '#: kendo.toString(new Date(fechaFinLocal),kendo.culture().calendars.standard.patterns.MES_FechaHora)#',
                            filterable: false
                        },
                        { field: 'idOrden', title: window.app.idioma.t('WO'), width: 125 },
                        { field: 'idProducto', title: window.app.idioma.t("ID_PRODUCTO"), width: 90 },
                        { field: 'descriptProducto', title: window.app.idioma.t('DESCRIPCION'), width: 220 },
                        {
                            field: 'contadorProd',
                            title: window.app.idioma.t('CONTADOR'),
                            aggregates: ["sum"],
                            footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                            template: '<div style="text-align:right;">#= kendo.format("{0:n0}",contadorProd)#</div>'
                        },
                        {
                            field: 'contadorProdAuto',
                            title: window.app.idioma.t('CONTADOR_AUTOMATICO'),
                            aggregates: ["sum"],
                            footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                            template: '<div style="text-align:right;">#= kendo.format("{0:n0}",contadorProdAuto)#</div>'
                        },
                        {
                            field: 'contadorRech',
                            title: window.app.idioma.t("RECHAZOS"),
                            aggregates: ["sum"],
                            footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                            template: '<div style="text-align:right;">#= kendo.format("{0:n0}",contadorRech)#</div>'
                        },
                        {
                            field: 'contadorRechAuto',
                            title: window.app.idioma.t("RECHAZOS_AUTOMATICO"),
                            aggregates: ["sum"],
                            footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                            template: '<div style="text-align:right;">#= kendo.format("{0:n0}",contadorRechAuto)#</div>'
                        },
                        {
                            field: 'velocidadNominal',
                            title: window.app.idioma.t("ENV_TEORICOS"),
                            aggregates: ["sum"],
                            footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                            template: '<div style="text-align:right;">#= kendo.format("{0:n0}",velocidadNominal)#</div>'
                        },
                        {
                            field: 'tiempoPlanificado',
                            title: window.app.idioma.t("TIEMPOS_PLANIFICADO"),
                            aggregates: ["sum"],
                            footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                            template: '<div style="text-align:right;">#= kendo.format("{0:n0}",tiempoPlanificado)#</div>'
                        },
                        /*{ field: 'usuario', title: 'Usuario' },*/
                        { field: 'shcID', title: 'shcID', style: "display:none" }
                    ],
                    dataBound: function (e) {
                        self.chkPlanificadoDetalle();

                        //ocultamos los botones de unir que no se pueden unir
                        var gridRows = self.gridDetalle.find("tr");
                        var registros = gridRows.length;
                        gridRows.each(function (e, element) {
                            if (e == registros - 1) {
                                $(this)[0].cells[2].innerHTML = ""
                            }
                            if (e < registros - 1 && e > 0) {
                                var grid = self.gridDetalle.data("kendoGrid");
                                var dataItem = grid.dataItem(element);
                                var unionValida = false;
                                if (dataItem) {
                                    var index = $(element).index();
                                    if (grid.dataSource.page() > 1) {
                                        index = index + (grid.dataSource.pageSize() * (grid.dataSource.page() - 1));
                                    }

                                    var dataItemSiguiente = grid.dataSource.at(index + 1);
                                    var fechaInicioUTCfinHora = new Date(new Date(dataItem.fechaInicioUTC).setHours(new Date(dataItem.fechaInicioUTC).getHours() + 1, 0, 0, 0));

                                    if (dataItemSiguiente) {
                                        if (new Date(dataItem.fechaFinUTC).getTime() == new Date(dataItemSiguiente.fechaInicioUTC).getTime() && (new Date(dataItem.fechaFinUTC).getTime() != fechaInicioUTCfinHora.getTime())) {
                                            unionValida = true;
                                        }
                                    }
                                }

                                if (!unionValida)
                                    $(this)[0].cells[2].innerHTML = ""
                            }
                        });
                    }
                });

                this.chkPlanificadoDetalle();
            },
            randomNumber: 0,
            cargarProduccionTurnoOrdenes: function (grid, dataTurno) {
                var self = this;

                if (self.horario.length > 0) {
                    var fechaInicio = new Date(self.horario[0].FechaInicio);
                    var fechaFin = new Date(self.horario[0].FechaFin);
                    var horaInicio = fechaInicio.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
                    var horaFin = fechaFin.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
                    var duracion = self.horario[0].Duracion;

                    if (self.horario[0].FechaInicioBreak === null) {
                        horario = horaInicio + ' - ' + horaFin;
                    } else {
                        var fechaInicioBreak = new Date(self.horario[0].FechaInicioBreak);
                        var fechaFinBreak = new Date(self.horario[0].FechaFinBreak);
                        var horaInicioBreak = fechaInicioBreak.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
                        var horaFinBreak = fechaFinBreak.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });
                        horario = horaInicio + ' - ' + horaInicioBreak + ' / ' + horaFinBreak + ' - ' + horaFin;
                    }
                } else {
                    horario = '--';
                    duracion = '';
                }

                //Cargamos el grid detalle de historicos
                var dsProduccion = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/turnosProduccionOrdenes/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.numLinea = self.numLinea;
                                result.idTipoTurno = dataTurno.IdTipoTurno;
                                result.fechaTurnoUTC = dataTurno.FechaTurno;

                                if (document.getElementById('horario' + self.randomNumber)) {
                                    //document.getElementById('horaInicio' + self.randomNumber).innerHTML = dataTurno.InicioTurnoLocal.substring(11, 16);
                                    document.getElementById('horario' + self.randomNumber).innerHTML = horario;
                                    //document.getElementById('horaFin' + self.randomNumber).innerHTML = dataTurno.FinTurnoLocal.substring(11, 16);
                                    document.getElementById('oeeObjetivo' + self.randomNumber).innerHTML = Math.round(dataTurno.OEEObjetivo * 100) / 100 + "%";
                                    document.getElementById('oeeCritico' + self.randomNumber).innerHTML = Math.round(dataTurno.OEECritico * 100) / 100 + "%";
                                    document.getElementById('duracion' + self.randomNumber).innerHTML = duracion == '' ? '--' : parseFloat(duracion).toFixed(2) + "h";
                                    document.getElementById('turno' + self.randomNumber).innerHTML = dataTurno.IdTipoTurno;
                                    document.getElementById('fecha' + self.randomNumber).innerHTML = dataTurno.FechaTurno.toISOString();
                                    self.randomNumber = Math.floor((Math.random() * 100000000) + 1);
                                }
                                return JSON.stringify(result);
                            }
                            return kendo.stringify(options);
                        }
                    },
                    schema: {
                        model: {
                            fields: {
                                prodDesPaletizadora: { type: "number" },
                                prodLlenadora: { type: "number" },
                                envasesTeoricos: { type: "number" },
                                sumEmpaquetadora: { type: "number" },
                                prodPaletizadora: { type: "number" },
                                prodEtiquetadoraPalets: { type: "number" },
                                rechClasificador: { type: "number" },
                                rechInspectorBotellasVacias: { type: "number" },
                                sumRechazosLlenadora_Salida: { type: "number" },
                                sumRechazosInspBotellaLlena_Bascula: { type: "number" },
                            }
                        }
                    },
                    aggregate: [
                        { field: "prodDesPaletizadora", aggregate: "sum" },
                        { field: "prodLlenadora", aggregate: "sum" },
                        { field: "envasesTeoricos", aggregate: "sum" },
                        { field: "sumEmpaquetadora", aggregate: "sum" },
                        { field: "prodPaletizadora", aggregate: "sum" },
                        { field: "prodEtiquetadoraPalets", aggregate: "sum" },
                        { field: "rechClasificador", aggregate: "sum" },
                        { field: "rechInspectorBotellasVacias", aggregate: "sum" },
                        { field: "sumRechazosLlenadora_Salida", aggregate: "sum" },
                        { field: "sumRechazosInspBotellaLlena_Bascula", aggregate: "sum" },
                    ],
                    pageSize: 5,
                    requestStart: function () {
                        //if (grid.data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($(".produccionTurnoOrden"), true);
                        //}

                    },
                    requestEnd: function () {
                        //if (grid.data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($(".produccionTurnoOrden"), false);
                        //}
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    }
                });

                var _today = new Date();
                var _inicioTurno = new Date(dataTurno.InicioTurnoLocal);
                var _finTurno = new Date(dataTurno.FinTurnoLocal);
                var _isTurnoActual = (_today >= _inicioTurno && _today <= _finTurno);
                var _styleBtns = _isTurnoActual ? "style='display:none'" : "style='float:right'";

                var gridProd = grid.kendoGrid({
                    dataSource: dsProduccion,
                    resizable: true,
                    scrollable: true,
                    sortable: false,
                    filterable: false,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    toolbar: [{
                        template: "<span style='display:none' class='turnoDiv' id='turno" + self.randomNumber + "'></span>"
                    },
                    {
                        template: "<span style='display:none' class='fechaDiv' id='fecha" + self.randomNumber + "'></span>"
                    },
                    {
                        template: "<b>" + window.app.idioma.t('HORARIO') + "</b> <span id='horario" + self.randomNumber + "' style='margin-right:10px;'></span>",
                    },
                    //{
                    //    template: "<b>" + window.app.idioma.t('HORA_FIN_') + "</b><span id='horaFin" + self.randomNumber + "' style='margin-right:10px;'></span>"
                    //},
                    {
                        template: "<b>" + window.app.idioma.t('DURACIÓN_') + "</b><span id='duracion" + self.randomNumber + "' style='margin-right:10px;'></span>"
                    },
                    {
                        template: "<b>" + window.app.idioma.t('OEE_OBJETIVO_') + "</b><span class='oeeObjetivo' id='oeeObjetivo" + self.randomNumber + "' style='margin-right:10px;'></span>"
                    },
                    {
                        template: "<b>" + window.app.idioma.t('OEE_CRÍTICO_') + "</b><span class='oeeCritico' id='oeeCritico" + self.randomNumber + "' style='margin-right:10px;'></span>"
                    },
                    {
                        template: "<button id='btnModificarDatosTurno' " + _styleBtns + " class='k-button k-button-icontext' " + (dataTurno.IdTurno == 0 ? 'disabled' : '') + " >" + window.app.idioma.t('MODIFICAR_DATOS_TURNO') + "</button>"
                    },
                    //{
                    //    template: "<button id='btnActualizarIC' " + _styleBtns + " class='k-button k-button-icontext' " + (dataTurno.IdTurno == 0 ? 'disabled' : '') + " >" + window.app.idioma.t('ACTUALIZAR_IC') + "</button>"
                    //},
                    {
                        template: "<button id='btnAñadirRegistros' " + _styleBtns + " class='k-button k-button-icontext' " + (dataTurno.IdTurno == 0 ? 'disabled' : '') + " >" + window.app.idioma.t('AÑADIR_REGISTROS') + "</button>"
                    },
                    {
                        template: "<button id='btnParteTurno' " + _styleBtns + " class='k-button k-button-icontext' " + (dataTurno.IdTurno == 0 ? 'disabled' : '') + " >" + window.app.idioma.t('_PARTE_DE') + "</button>"
                    },
                    {
                        template: "<button id='btnRefrescarTurno' " + _styleBtns + " class='k-button k-button-icontext' " + (dataTurno.IdTurno == 0 ? 'disabled' : '') + " >" + window.app.idioma.t('REFRESCAR_TURNO') + "</button>"
                    }
                    ],
                    columns: [{
                        field: "idOrden",
                        title: window.app.idioma.t('WO'),
                        width: 125,
                        filterable: true
                    },
                    {
                        field: "idProducto",
                        title: window.app.idioma.t("ID_PRODUCTO"),
                        width: 90,
                        filterable: true
                    },
                    {
                        field: "descriptProducto",
                        title: window.app.idioma.t('DESC_PRODUCTO'),
                        width: 220,
                        filterable: true
                    },
                    {
                        field: "prodDesPaletizadora",
                        title: window.app.idioma.t('PALETS_DESP'),
                        aggregates: ["sum"],
                        footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                        filterable: false,
                        template: '<div style="text-align:right;">#= kendo.format("{0:n0}",prodDesPaletizadora)#</div>'
                    },
                    {
                        field: "prodLlenadora",
                        title: window.app.idioma.t('ENVASES_BRLLENADORA'),
                        aggregates: ["sum"],
                        footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                        filterable: false,
                        template: '<div style="text-align:right;">#= kendo.format("{0:n0}",prodLlenadora)#</div>'
                    },
                    {
                        field: "envasesTeoricos",
                        title: window.app.idioma.t('ENVASES_BRTEORICOS'),
                        aggregates: ["sum"],
                        footerTemplate: '<div style="text-align:right;">Total: #= kendo.format("{0:n0}",sum)#</div>',
                        template: '<div style="text-align:right;">#= kendo.format("{0:n0}",envasesTeoricos)#</div>',
                        filterable: false
                    },
                    {
                        field: "sumEmpaquetadora",
                        title: window.app.idioma.t('CAJASPACKS_BREMP'),
                        aggregates: ["sum"],
                        footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                        template: '<div style="text-align:right;">#= kendo.format("{0:n0}",sumEmpaquetadora)#</div>',
                        filterable: false
                    },
                    {
                        field: "prodPaletizadora",
                        title: window.app.idioma.t('PALETSBRPALETIZADORA'),
                        aggregates: ["sum"],
                        footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                        template: '<div style="text-align:right;">#= kendo.format("{0:n0}",prodPaletizadora)#</div>',
                        filterable: false
                    },
                    {
                        field: "prodEtiquetadoraPalets",
                        title: window.app.idioma.t('ETIQUETASBRPALETIZADORA'),
                        aggregates: ["sum"],
                        footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                        template: '<div style="text-align:right;">#= kendo.format("{0:n0}",prodEtiquetadoraPalets)#</div>',
                        filterable: false
                    },
                    {
                        field: "rechClasificador",
                        title: window.app.idioma.t('RECHAZOSBRCLASIFICADOR'),
                        aggregates: ["sum"],
                        footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                        template: '<div style="text-align:right;">#= kendo.format("{0:n0}",rechClasificador)#</div>',
                        filterable: false
                    },
                    {
                        field: "rechInspectorBotellasVacias",
                        title: window.app.idioma.t('RECHAZOSBRVACIOS'),
                        aggregates: ["sum"],
                        footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                        template: '<div style="text-align:right;">#= kendo.format("{0:n0}",rechInspectorBotellasVacias)#</div>',
                        filterable: false
                    },
                    {
                        field: "sumRechazosLlenadora_Salida",
                        title: window.app.idioma.t('RECHAZOSBRLLENADORA'),
                        aggregates: ["sum"],
                        footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                        template: '<div style="text-align:right;">#= kendo.format("{0:n0}",sumRechazosLlenadora_Salida)#</div>',
                        filterable: false
                    },
                    {
                        field: "sumRechazosInspBotellaLlena_Bascula",
                        title: window.app.idioma.t('RECH_PRODUCTOBRTERMINADO'),
                        aggregates: ["sum"],
                        footerTemplate: '<div style="text-align:right;">' + window.app.idioma.t('TOTAL_2') + ' #=kendo.format("{0:n0}",sum)#</div>',
                        template: '<div style="text-align:right;">#= kendo.format("{0:n0}",sumRechazosInspBotellaLlena_Bascula)#</div>',
                        filterable: false
                    },
                    ],
                });
            },
            cargarFormularios: function (grid, dataTurno) {
                var self = this;

                self.dsFormularios = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerFormulariosCalidadPorTurno/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.linea = dataTurno.IdLinea;
                                result.inicioTurno = dataTurno.InicioTurno;
                                result.finTurno = dataTurno.FinTurno;

                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    pageSize: 20,
                    schema: {
                        model: {
                            fields: {
                                'IdForm': { type: "int" },
                                'Nombre': { type: "string" },
                                'Descripcion': { type: "string" },
                                'Estado': { type: "string" },
                                'EsValido': { type: "string" },
                                'FechaCreacion': { type: "date" },
                                'FechaUltimaModificacion': { type: "date" },
                                'EstadoSemaforo': { type: "string" },
                                'ValorSemaforo': { type: "string" }
                            }
                        }
                    },
                    requestStart: function () {
                        kendo.ui.progress($(".calidad"), true);
                    },
                    requestEnd: function () {
                        kendo.ui.progress($(".calidad"), false);
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    },
                    sort: { field: "createdOn", dir: "desc" }
                });

                var gridFormularios = grid.kendoGrid({
                    dataSource: self.dsFormularios,
                    sortable: true,
                    resizable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            title: " ",
                            field: "EsValido",
                            template: "<img  id='imgEstado' src='img/KOP_#= ValorSemaforo #.png'></img>",
                            width: 70,
                            attributes: { style: "text-align:center;" },
                        },
                        {
                            field: "FechaCreacion",
                            title: window.app.idioma.t('FECHA_CREACION'),
                            template: '#: kendo.toString(new Date(FechaCreacion),kendo.culture().calendars.standard.patterns.MES_FechaHora)#',
                            width: 165,
                        },
                        {
                            field: "FechaUltimaModificacion",
                            title: window.app.idioma.t('FECHA_ACTUALIZACION'),
                            template: '#: kendo.toString(new Date(FechaUltimaModificacion),kendo.culture().calendars.standard.patterns.MES_FechaHora)#',
                            width: 165,
                        },
                        {
                            field: "EventoNombre",
                            title: window.app.idioma.t('ALT_EVENTO'),
                            width: 130,
                        },
                        {
                            field: "Estado",
                            title: window.app.idioma.t("ESTADO"),
                            template: "<img title= '#:''+Errores#'  id='imgEstado' src='img/KOP_#= EstadoSemaforo #.png'> #=  window.app.idioma.t(Estado) #</img>",
                            width: 130,
                            attributes: { style: "text-align:center;" },
                        },
                        {
                            field: "Nombre",
                            title: window.app.idioma.t("ALT_FORM"),
                            width: 220,
                        },
                        {
                            field: "Descripcion",
                            title: window.app.idioma.t('DESCRIPCION'),
                        },
                    ],
                });
            }
        });

        return gridHistoricoTurno;
    });