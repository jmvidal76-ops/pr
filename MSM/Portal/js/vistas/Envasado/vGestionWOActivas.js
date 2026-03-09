define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/GestionWOActivas.html', 'vistas/vDialogoConfirm',
        'compartido/notificaciones', 'vistas/Envasado/vCrearWOContingencia', 'vistas/Trazabilidad/vComponentProducciones',
    'vistas/Trazabilidad/vComponentMateriales', 'vistas/Envasado/vPicos', 'vistas/Envasado/vVerDetallesOrden_LIMS', 'jszip'],
    function (_, Backbone, $, PlantillaGestionWOActivas, VistaDlgConfirm, Not, VistaCrearWO, ComponentProducciones,
              ComponentMateriales, VistaPicos, VistaLIMS, JSZip) {
        var gridGestionWOActivas = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            gridDetail: null,
            filaExpand: null,
            expand: null,
            actpendiente: null,
            tabDetail: null,
            detailRowData: null,
            detailRow: null,
            tabSelect: null,
            tabStrip: null,
            fechaEstadoIniciando: null,
            lotesFormateados: null,
            idOrdenPadre: null,
            template: _.template(PlantillaGestionWOActivas),
            serverTraza: window.app.section.getAppSettingsValue('HostApiTrazabilidad'),

            initialize: function () {
                window.JSZip = JSZip;
                Backbone.on('eventNotificacionOrden', this.actualiza, this);
                Backbone.on('eventActProd', this.actualiza, this);
                Backbone.on('eventActPlanificacionOrden', this.actualiza, this);
                var self = this;
                self.expand = false;
                self.actpendiente = false;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", function () { self.resizeGrid(self) });

                self.ds = self.getDataSource(self);
                self.render();
            },
            getDataSource: function (self) {
                var ds = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/obtenerWOActivas/",
                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        }
                    },
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                'idLinea': { type: "string" },
                                'id': { type: "string" },
                                'EstadoLIMS': { type: "number" },
                                'ColorLIMS': { type: "string" },
                                'descripcion': { type: "string" },
                                'estadoActual.nombre': { type: "string" },
                                'producto.tipoProducto.nombre': { type: "string" },
                                'producto.codigo': { type: "string" },
                                'producto.nombre': { type: "string" },
                                'produccion.paletsEtiquetadoraProducidos': { type: "number" },
                                'produccion.oee': { type: "number" },
                                'EnvasesPorPalet': { type: "number" },
                                'CajasPorPalet': { type: "number" },
                                'numLinea': { type: "number" },
                                'numLineaDescripcion': { type: "string" },
                                'dFecIniLocal': { type: "date" },
                                'FechaFinEstimadaReal': { type: "date" },
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            $("#center-pane").empty();
                        }
                    }
                });

                return ds;
            },
            render: function () {
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))
                var self = this;

                var datasourceLineas = [];
                $.each(window.app.planta.lineas, function (index, linea) {
                    var data = {};
                    data.descLinea = linea.descripcion;
                    data.numLinea = linea.numLinea;
                    data.numLineaDescripcion = linea.numLineaDescripcion;
                    datasourceLineas.push(data);
                });

                var grid = this.$("#gridGestionWOActivas").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t('WO_ACTIVAS') + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    dataSource: self.ds,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    detailTemplate: function (e) {
                        return self.detailTemplate(e, self);
                    },
                    detailInit: function (e) {
                        self.detailInit(e, self);
                    },
                    detailExpand: function (e) {
                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                        self.filaExpand = this.dataItem(e.masterRow).id;
                        self.detailRowData = this.dataItem(e.masterRow);
                        self.expand = true;
                        self.masterRow = e.masterRow;

                        var tabStrip = e.detailRow.find(".tabPanel").data("kendoTabStrip");
                        self.tabStrip = tabStrip;

                        var limsTab = tabStrip.tabGroup.children().eq(9);
                        limsTab.css("background-color", self.detailRowData.ColorLIMS);

                        var detailRow = e.detailRow;
                        var tabId = detailRow.find(".tabPanel").kendoTabStrip().data("kendoTabStrip").select()[0].id;
                        var idParticion = self.detailRowData.id;
                        var idProducto = self.detailRowData.producto.codigo;
                        var numLinea = self.detailRowData.numLinea;

                        if (tabId == "producciontab") {
                            var componentProd = new ComponentProducciones({ WO: idParticion, hiddenColumns: true, hiddenToolBar: true });
                            detailRow.find(".produccionComponent").html(componentProd.render().el);
                        }
                        if (tabId == "picosTab") {
                            var componentPicos = new VistaPicos(self.detailRowData);
                            detailRow.find(".picosComponent").html(componentPicos.render().el);
                        }
                        if (tabId == "LIMSTab") {
                            var componentLIMS = new VistaLIMS(self.detailRowData);
                            detailRow.find(".componentLIMS").html(componentLIMS.render().el);
                        }
                    },
                    detailCollapse: function (e) {
                        self.filaExpand = null;
                        self.tabSelect = null;
                        self.expand = false;
                        if (self.actpendiente) {
                            self.actualiza();
                        }
                    },
                    selectable: true,
                    resizable: true,
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
                            field: "descripcion",
                            title: " ",
                            width: 25,
                            filterable: false,
                            attributes: { style: "text-align:center;" },
                            template: '<img id="imgDesc" src="../Portal/img/round_comment_notification.png" style="width: 16px !important; height:16px !important;#if(!descripcion){# display:none;#}#">'
                        },
                        {
                            template: function (e) {
                                let title = window.app.idioma.t("ESTADO_LIMS_" + e.EstadoLIMS) || "";
                                return "<div id='lims_estado_" + e.id + "' class='circle_cells' title='" + title + "' style='background-color:" + e.ColorLIMS + ";'/>"
                            },
                            width: 30,
                            title: window.app.idioma.t("LIMS"),
                            attributes: { style: "text-align:center;" },
                            groupable: false
                        },
                        {
                            field: "numLinea", title: window.app.idioma.t("LINEA"),
                            width: 105,
                            filterable: {
                                multi: true,
                                dataSource: datasourceLineas,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#:numLinea#' style='width: 14px;height:14px;margin-right:5px;'/>" + window.app.idioma.t('LINEA') + " #: numLineaDescripcion # - #: descLinea#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            template: window.app.idioma.t("LINEA") + " #: numLineaDescripcion # - #: descLinea#"
                        },
                        {
                            field: "id",
                            title: window.app.idioma.t("IDORDEN"),
                            width: 80,
                            filterable: true,
                            attributes: {
                                "id": "CodWO",
                                style: 'white-space: nowrap',
                                'class': 'tooltipText'
                            }

                        },
                        {
                            field: "dFecIniLocal",
                            title: window.app.idioma.t("INICIO_REAL"),
                            width: 90,
                            template: '#= dFecIniLocal.getFullYear() === 1 ? "" : kendo.toString(dFecIniLocal, kendo.culture().calendars.standard.patterns.MES_FechaHora) #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap',
                                'class': 'tooltipText'
                            },

                        },
                        {
                            field: "FechaFinEstimadaReal",
                            title: window.app.idioma.t("FIN_ESTIMADO_REAL"),
                            width: 100,
                            template: '#= FechaFinEstimadaReal.getFullYear() === 1 ? "" : kendo.toString(FechaFinEstimadaReal, kendo.culture().calendars.standard.patterns.MES_FechaHora) #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                        },
                        {
                            field: "estadoActual.nombre",
                            title: window.app.idioma.t("ESTADO_MES"),
                            width: 65,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=estadoActual.nombre#' style='width: 14px;height:14px;margin-right:5px;'/>#=estadoActual.nombre#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                        },
                        {
                            field: "cambioPosible",
                            title: window.app.idioma.t("CAMBIO_ESTADO"),
                            width: 100,
                            filterable: false,
                            template: "<div id='divEst#=id#'><select id='selEst#=id#' style='width:72%;float:left;'></select><input type='image' id='btnEst#=id#' class='btnCambiaEstado' style='float:left;margin-left:5px;'; src='img/play-24.png' /></button></div>"
                        },
                        {
                            field: "producto.tipoProducto.nombre",
                            title: window.app.idioma.t("TIPO_PRODUCTO"),
                            width: 80,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=producto.tipoProducto.nombre#' style='width: 14px;height:14px;margin-right:5px;'/>#=producto.tipoProducto.nombre#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: "text-align:center;white-space: nowrap",
                                'class': 'tooltipText'
                            },
                        },
                        {
                            field: "producto.codigo",
                            title: window.app.idioma.t("CODIGO_PRODUCTO"),
                            width: 65,
                            filterable: true,
                        },
                        {
                            field: "producto.nombre",
                            title: window.app.idioma.t("PRODUCTO"),
                            width: 110,
                            filterable: true,
                            attributes: {
                                style: "text-align:center;white-space: nowrap",
                                'class': 'tooltipText'
                            },
                        },
                        {
                            field: "produccion.paletsEtiquetadoraProducidos",
                            title: window.app.idioma.t("PRODUCCION"),
                            width: 65,
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
                            field: "produccion.oee",
                            title: window.app.idioma.t("OEE_WO"),
                            width: 70,
                            template: "<div class='progress' style='width:100%;'></div>"
                        }
                    ],
                    excelExport: function (e) {
                        kendo.ui.progress($("#gridGestionWOActivas"), true);
                        var sheet = e.workbook.sheets[0];
                        //Header descripcion
                        sheet.rows[0].cells[0].value = window.app.idioma.t('NOTA');
                        var objectDescription = sheet.rows[0].cells[0]; // Añadimos el header descripción a una variable
                        sheet.rows[0].cells.shift();// Lo eliminamos del arreglo de Headers
                        sheet.rows[0].cells.splice(5, 1);// Eliminamos el header de cambio posible
                        sheet.rows[0].cells.push(objectDescription); // Lo añadimos al final del arreglo

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];
                                var cellDescription = ParseDescriptionToHTML(e.data[dataPosition].descripcion);// Obtenemos la celda de descripción
                                row.cells.shift();// Eliminamos de todos los datos de la fila el primer valor
                                row.cells.splice(5, 1);//Eliminamos Cambio Posible

                                //field: Linea
                                row.cells[0].value = window.app.idioma.t('LINEA') + ' ' + e.data[dataPosition].numLineaDescripcion + ' - ' + e.data[dataPosition].descLinea;
                                //field: "fechaInicio"
                                row.cells[2].value = e.data[dataPosition].dFecIniLocal.getFullYear() === 1 ? '' : kendo.toString(e.data[dataPosition].dFecIniLocal, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                //field: "fechaFin"
                                row.cells[3].value = e.data[dataPosition].FechaFinEstimadaReal.getFullYear() === 1 ? '' : kendo.toString(e.data[dataPosition].FechaFinEstimadaReal, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                //field: "OEE"
                                row.cells[9].value = kendo.toString(parseFloat(e.data[dataPosition].OEE.toFixed(2)), "n") + " %";
                                // Añadimos el valor a la última columna
                                row.cells.push({ value: cellDescription });

                            } catch (e) {
                            }
                        }

                        sheet.columns.forEach(function (column) {
                            // also delete the width if it is set
                            delete column.width;
                            column.autoWidth = true;
                        });

                        kendo.ui.progress($("#gridGestionWOActivas"), false);
                    },
                    dataBinding: self.resizeGrid(self),
                    dataBound: function (e) {
                        var grid = this;
                        $(".progress").each(function () {
                            var row = $(this).closest("tr");
                            var model = grid.dataItem(row);

                            var OEEProgress = $(this).kendoProgressBar({
                                type: "value",//type: "percent",
                                value: model.produccion.oee,
                                max: 100
                            }).data("kendoProgressBar");

                            if (Math.floor(model.produccion.oee) == model.produccion.oee) {
                                OEEProgress.progressStatus.text(model.produccion.oee + " %");
                            } else {
                                OEEProgress.progressStatus.text(model.produccion.oee.toFixed(2) + " %");
                            }

                            if (model.produccion.oee < model.oeeCritico) {
                                OEEProgress.progressWrapper.css({
                                    "background-color": "red",
                                    "border-color": "red"
                                });
                            }
                            else if (model.produccion.oee < model.oeeObjetivo) {
                                OEEProgress.progressWrapper.css({
                                    "background-color": "orange",
                                    "border-color": "orange"
                                });
                            }
                            else if (model.produccion.oee > 100) {
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

                            if (model.estadoActual.cambiosPosibles && model.estadoActual.cambiosPosibles.length > 0) {
                                var dsOpcionesCambio = {
                                    data: [] //cambiosPosibles
                                };

                                for (var i = 0; i < model.estadoActual.cambiosPosibles.length; i++) {
                                    dsOpcionesCambio.data.push({ id: model.estadoActual.cambiosPosibles[i].ordenMES, nombre: model.estadoActual.cambiosPosibles[i].nombre });
                                }

                                self.$("#selEst" + model.id.replace(".", "\\.")).kendoDropDownList({
                                    dataTextField: "nombre",
                                    dataValueField: "id",
                                    width: 200,
                                    dataSource: dsOpcionesCambio,
                                    optionLabel: window.app.idioma.t('SELECCIONE')
                                });
                            } else {
                                self.$("#btnEst" + model.id).hide();
                                self.$("#selEst" + model.id).hide();
                                self.$("#divEst" + model.id).append(window.app.idioma.t('SIN_CAMBIO_POSIBLE'));
                            }
                        });

                        // Si teniamos abierto un detalle de fila antes de la actualización de datos (que cierra los paneles de detalle) lo volvemos a abrir

                        if (self.filaExpand) {
                            var dataItem = grid.dataSource.get(self.filaExpand);
                            if (dataItem) grid.expandRow("tr[data-uid=" + dataItem.uid + "]");
                        }
                    }
                }).data("kendoGrid");

                this.$('#gridGestionWOActivas').kendoTooltip({
                    filter: "#imgDesc",
                    position: "auto",
                    width: 'auto',
                    content: function (e) {
                        var grid = $("#gridGestionWOActivas").data("kendoGrid");
                        var dataItem = grid.dataItem(e.target.closest("tr"));
                        return CodificarEnHTML(dataItem["descripcion"]);
                    }
                }).data("kendoTooltip");

                this.$('#gridGestionWOActivas').kendoTooltip({
                    filter: ".tooltipText",
                    position: "auto",
                    width: 'auto',
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

                window.app.headerGridTooltip(grid);

                self.resizeGrid(self)
            },
            detailTemplate: function (e, vista) {
                var self = this;

                var idOrden = e.id;
                var estado = e.estadoActual.nombre;

                if (estado != 'Finalizada') {
                    var tem = kendo.template($("#template").html()
                        .replace('<div class="rechazos" id="rechazostab"></div>', $("#templateRechazos").html())
                        .replace('<div class="cantidades" id="cantidadestab"></div>', $("#templateCantidades").html()));

                    return tem(e);
                } else {
                    $.ajax({
                        type: "GET",
                        async: true,
                        url: "../api/ordenes/obtenerDatosOriginalesParticion/" + idOrden + "/",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            var dataOld = res;

                            var rowExpand = $("#gridGestionWOActivas").find(".k-detail-row:visible");
                            kendo.ui.progress(rowExpand.find("#cantidadestab"), false);
                            kendo.ui.progress(rowExpand.find("#rechazostab"), false);
                            // rowExpand.find("#procesotab").html(kendo.template($("#templateProceso").html())(e));
                            rowExpand.find(".cantidades").html(kendo.template($("#templateCantidades").html())(res));
                            rowExpand.find(".rechazos").html(kendo.template($("#templateRechazos").html())(res));

                            kendo.ui.progress(rowExpand.find("#divProcesoLoad"), false);

                            rowExpand.find(".tblValues").kendoGrid({ resizable: true });

                            if (self.tabSelect) {
                                self.tabDetail.select(self.tabSelect);
                            }
                        },
                        error: function (response) {
                            if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                            } else {
                                Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_COMPROBAR_ARRANQUE_LINEA'), 3000);
                            }
                        }
                    });

                    return kendo.template($("#template").html())(e);
                }
            },
            detailInit: function (e, vista) {
                var self = this;
                self.detailRow = e.detailRow;
                var idParticion = e.data.id;
                var idProducto = e.data.producto.codigo;
                var gridHistorico = self.detailRow.find(".historico");
                var gridHistoricoMaquinas = self.detailRow.find(".historicoMaquinas");
                var gridProduccion = self.detailRow.find(".produccion");
                var gridProceso = self.detailRow.find(".proceso");
                var gridLotes = self.detailRow.find(".material");
                var estado = e.data.estadoActual.nombre;
                var numLinea = e.data.numLinea;
                var descripcion = e.data.descripcion == null ? '' : e.data.descripcion;
                var data = e.data;
                self.idOrden = idParticion;
                var fechaFinReal = e.data.FechaFinEstimadaReal;
                //cargamos componente pestaña producciones                

                self.detailRow.find("#auxEditor").kendoEditor({ tools: [] });

                if (estado != 'Finalizada') {
                    self.detailRow.find(".centerButton").hide();
                }

                self.tabDetail = self.detailRow.find(".tabPanel").kendoTabStrip({
                    animation: {
                        open: { effects: "fadeIn" }
                    },
                    select: function (e) {
                        self.tabSelect = null;
                        if ($(e.item).index() == 0) {
                            vista.cargarProceso(gridProceso, data)
                        } else if ($(e.item).index() == 3) {
                            var componentPicos = new VistaPicos(data);
                            self.detailRow.find(".picosComponent").html(componentPicos.render().el);
                        } else if ($(e.item).index() == 4) {
                            vista.cargarProduccionTurnos(gridProduccion, idParticion, numLinea)
                        } else if ($(e.item).index() == 5) {
                            vista.cargarHistorico(gridHistorico, idParticion);
                        } else if ($(e.item).index() == 6) {
                            vista.cargarLotesMateriaPrima(gridLotes, data)
                        } else if ($(e.item).index() == 7) {
                            var componentProd = new ComponentProducciones({ WO: idParticion, hiddenColumns: true, hiddenToolBar: true });
                            self.detailRow.find(".produccionComponent").html(componentProd.render().el);
                        } else if ($(e.item).index() == 8) {
                            self.detailRow.find("#auxEditor").data("kendoEditor").refresh();
                            self.detailRow.find("#auxEditor").data("kendoEditor").value(CodificarEnHTML(descripcion));
                        } else if ($(e.item).index() == 9) {
                            self.cargarLIMS(data);
                        } else if ($(e.item).index() == 10) {
                            vista.cargarHistoricoMaquinas(gridHistoricoMaquinas, fechaFinReal);
                        }
                    }
                }).data("kendoTabStrip");

                if (descripcion) {
                    self.detailRow.find("#divNotas").css({ "background-color": "green", "color": "white" })
                } else {
                    self.detailRow.find("#divNotas").css({ "background-color": "", "color": "" })
                }

                self.gridDetail = self.detailRow.find(".tblValues").kendoGrid({ resizable: true });

                kendo.ui.progress(self.detailRow.find("#divProcesoLoad"), true);
                kendo.ui.progress(self.detailRow.find("#cantidadestab"), true);
                kendo.ui.progress(self.detailRow.find("#rechazostab"), true);

                var linea = $.grep(window.app.planta.lineas, function (l, i) {
                    return l.numLinea == e.data.numLinea;
                })[0];

                if (!linea.Grupo) {
                    self.tabDetail.remove("#hmTab");
                }

                vista.cargarProceso(gridProceso, data)
            },
            eliminar: function () {
                Backbone.off('eventNotificacionOrden', this.actualiza, this);
                Backbone.off('eventActProd', this.actualiza, this);
                Backbone.off('eventActPlanificacionOrden', this.actualiza, this);
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            resizeGrid: function (self) {
                if (self.expand) {
                    //self.tabDetail.data("kendoTabStrip").select(0);
                }

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridGestionWOActivas"),
                    dataArea = gridElement.find(".k-grid-content:first"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content").not(".k-loading-mask"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                if (otherElements.length > 0) {
                    dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 1);
                }

                var grid = $("#gridGestionWOActivas").data("kendoGrid");
                if (grid !== undefined) {
                    grid.autoFitColumn("cambioPosible");
                    //self.expandToFit(grid);
                }
            },
            expandToFit: function (grid) {
                var $gridHeaderTable = grid.thead.closest('table');
                var gridDataWidth = $gridHeaderTable.width();
                var gridWrapperWidth = $gridHeaderTable.closest('.k-grid-header-wrap').innerWidth();
                // Since this is called after column auto-fit, reducing size
                // of columns would overflow data.
                if (gridDataWidth >= gridWrapperWidth) {
                    return;
                }

                var $headerCols = $gridHeaderTable.find('colgroup > col');
                var $tableCols = grid.table.find('colgroup > col');

                var sizeFactor = (gridWrapperWidth / gridDataWidth);
                $headerCols.add($tableCols).not('.k-group-col').each(function () {
                    var currentWidth = $(this).width();
                    var newWidth = (currentWidth * sizeFactor);
                    $(this).css({
                        width: newWidth
                    });
                });
            },
            events: {
                'click .btnCambiaEstado': 'validarCambio',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnExportExcel': 'exportExcel',
                'click #btnExportExcelMMPP': 'exportExcelMMPP',
                "click #btnCrearWO": 'crearWO',
                'click #btnSaveNotes': 'SaveNotes'
            },
            SaveNotes: function () {
                var self = this;
                var permiso = TienePermiso(13);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var descValue = self.detailRow.find("#auxEditor").data("kendoEditor").value();
                descValue = ParseDescriptionToHTML(descValue);

                if (self.detailRowData.descripcion != descValue) {
                    kendo.ui.progress($("#gridGestionWOActivas"), true);
                    self.añadirNota(self, descValue);
                }
            },
            añadirNota: function (self, descValue) {
                datos = { orderID: self.idOrden, text: descValue };

                $.ajax({
                    type: "POST",
                    url: "../api/ordenes/SetOrderNotes/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    async: false,
                }).done(function (res) {
                    Backbone.trigger('eventCierraDialogo');
                    kendo.ui.progress($("#gridGestionWOActivas"), false);
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('NOTAS_ACTUALIZADAS_CORRECTAMENTE'), 4000);

                    var elementNote = self.masterRow.find("#imgDesc");
                    self.detailRowData.descripcion = descValue;
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

                    self.ds.read();
                    $("#gridGestionWOActivas").data("kendoGrid").collapseRow(".k-master-row");
                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    kendo.ui.progress($("#gridGestionWOActivas"), false);
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_EDITAR_LAS'), 4000);
                });
            },
            crearWO: function () {
                var permiso = TienePermiso(13);

                if (permiso) {
                    this.vistaFormWO = new VistaCrearWO();
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                }
            },
            validarCambio: function (e) {
                var permiso = TienePermiso(13);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var cambio = {};
                var row = $("#" + e.currentTarget.id.replace(".", "\\.")).closest("tr");
                var item = $("#gridGestionWOActivas").data("kendoGrid").dataItem(row);
                cambio.linea = item.idLinea;
                cambio.wo = item.id;
                cambio.estado = this.$("#selEst" + cambio.wo.replace(".", "\\.") + " option:selected").val();

                var ppr = {};
                ppr.linea = cambio.linea;
                ppr.producto = {};
                ppr.producto.codigo = item.producto.codigo;
                var self = this;
                $.ajax({
                    data: JSON.stringify(ppr),
                    type: "POST",
                    async: false,
                    url: "../api/ordenes/ExistPPR_By_Line_MaterialId",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            var zonas = [];
                            var aviso = "";
                            if (cambio.estado == "Pausada" || cambio.estado == "Finalizada") {
                                $.ajax({
                                    data: JSON.stringify(cambio),
                                    type: "POST",
                                    async: false,
                                    url: "../api/comprobarOrdenEnzonas",
                                    contentType: "application/json; charset=utf-8",
                                    dataType: "json",
                                    success: function (res) {
                                        if (res.length > 0)
                                            aviso = window.app.idioma.t('WO_EN_ZONAS');
                                    },
                                    error: function (response) {
                                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                                        } else {
                                            Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_COMPROBAR_SI_ZONAS_CON_WO'), 3000);
                                        }
                                        Backbone.trigger('eventCierraDialogo');
                                    }
                                });
                            }

                            if (cambio.estado != "") {
                                this.confirmacion = new VistaDlgConfirm({
                                    titulo: window.app.idioma.t('ALT_LOG_ESTADO'),
                                    msg: window.app.idioma.t('DESEA_REALMENTE_CAMBIAR_EL') + cambio.wo + " a " + cambio.estado + "? " + aviso,
                                    funcion: function () { self.cambiarEstado(e.currentTarget.id); },
                                    contexto: this
                                });
                                e.preventDefault(); // evitamos que se realice la acción del href
                            } else {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_SELECCIONAR_UN_ESTADO'), 2000);
                            }
                        } else {
                            Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_PPR'), 3000);
                        }
                    },
                    error: function (response) {
                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_PPR'), 3000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            cambiarEstado: function (e) {
                var self = this;
                var cambio = {};
                var row = $("#" + e.replace(".", "\\.")).closest("tr"); //$(e.target.parentNode.parentNode).closest("tr");
                var item = $("#gridGestionWOActivas").data("kendoGrid").dataItem(row);
                cambio.linea = item.idLinea;
                cambio.wo = item.id;
                cambio.estado = this.$("#selEst" + cambio.wo.replace(".", "\\.") + " option:selected").val();

                $.ajax({
                    data: JSON.stringify(cambio),
                    type: "POST",
                    url: "../api/cambiarEstadoPorSupervisor",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        Backbone.trigger('eventCierraDialogo');
                        if (!res[0]) Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res[1], 3000);
                        else Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1] == '' ? window.app.idioma.t('CAMBIO_ESTADO') : res[1], 3000);
                    },
                    error: function (response) {
                        if (response.status == '500') {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('CAMBIO_ESTADO'), 4000);
                        } else if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CAMBIAR_EL'), 3000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            LimpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            exportExcel: function () {
                kendo.ui.progress($("#gridGestionWOActivas"), true);
                var grid = $("#gridGestionWOActivas").data("kendoGrid");
                grid.saveAsExcel();
                kendo.ui.progress($("#gridGestionWOActivas"), false);
            },
            exportExcelMMPP: function () {
                kendo.ui.progress($("#materialtab"), true);
                var grid = $('.k-detail-row:visible .material').data('kendoGrid');
                grid.saveAsExcel();
                kendo.ui.progress($("#materialtab"), false);
            },
            actualiza: function () {
                var self = this;
                self.actpendiente = true;
                if (!self.expand) {
                    self.ds.read();
                    self.actpendiente = false;
                } else if ($("#gridGestionWOActivas").data("kendoGrid").dataSource.filter()) {
                    var dataSource = $("#gridGestionWOActivas").data("kendoGrid").dataSource;
                    var filters = dataSource.filter();
                    var allData = dataSource.data();
                    var query = new kendo.data.Query(allData);
                    var data = query.filter(filters).data;

                    var lstDetail = $.grep(data, function (data, i) {
                        return data == self.detailRowData;
                    });

                    if (lstDetail.length == 0) {
                        self.ds.read();
                        self.actpendiente = false;
                    }
                }
            },
            cargarHistoricoMaquinas: function (gridHistoricoMaquinas, fechaFinReal) {
                var self = this;
                //Cargamos el grid detalle de historicos

                var dsHistoricoMaquinas = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ordenes/historicoMaquinas/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.fechaFinReal = fechaFinReal;

                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    schema: {
                        model: {
                            fields: {
                                'HistoricoMaquinas.FechaCambio': { type: "date" },
                                'MaquinaDescripcion': { type: "string" },
                                'NumeroLineaDescripcion': { type: "string" },
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    },
                });

                gridHistoricoMaquinas.kendoGrid({
                    dataSource: dsHistoricoMaquinas,
                    scrollable: false,
                    columns: [
                        {
                            field: "MaquinaDescripcion", title: window.app.idioma.t('MAQUINA'), width: "200px"
                        },
                        {
                            field: "HistoricoMaquinas.FechaCambio", title: window.app.idioma.t('FECHA'), width: "200px",
                            template: '#: kendo.toString(new Date(HistoricoMaquinas.FechaCambio), kendo.culture().calendars.standard.patterns.MES_FechaHora) #',
                        },
                        {
                            field: "NumeroLineaDescripcion", title: window.app.idioma.t('ESTADO'), width: "200px",
                            template: '#: window.app.idioma.t("ACTIVA") + NumeroLineaDescripcion #'
                        },
                    ]
                });
            },
            //cargarDataHistorico: async function (wo) {
            //    let result = $.ajax({
            //        type: "GET",
            //        async: true,
            //        url: "../api/ordenes/historicoOrden/" + wo + "/",
            //        contentType: "application/json; charset=utf-8",
            //        dataType: "json"
            //    });

            //    return result;
            //},
            cargarHistorico: function (gridHistorico, wo) {
                var self = this;
                //Cargamos el grid detalle de historicos

                var dsHistorico = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ordenes/historicoOrden/" + wo + "/",
                            dataType: "json"
                        }
                    },
                    schema: {
                        model: {
                            //id: "IdCambio",
                            fields: {
                                //'IdOrden': { type: "string" },
                                'fechaCambioLocal': { type: "date" },
                                'fechaCierreLocal': { type: "date" },
                                'estado.nombre': { type: "string" },
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    },
                    sort: { field: "fechaCambioLocal", dir: "asc" }
                });

                gridHistorico.kendoGrid({
                    dataSource: dsHistorico,
                    scrollable: false,
                    sortable: true,
                    columns: [
                        //{ field: "idOrden", title: window.app.idioma.t("ORDEN"), width: "200px" },
                        {
                            field: "fechaCambioLocal", title: window.app.idioma.t('DESDE'), width: "200px",
                            template: '#: kendo.toString(new Date(fechaCambioLocal),kendo.culture().calendars.standard.patterns.MES_FechaHora)#'
                        },
                        {
                            field: "fechaCierreLocal", title: window.app.idioma.t('HASTA'), width: "200px",
                            template: "#= (fechaCierreLocal.getFullYear() != 1)  ? kendo.toString(new Date(fechaCierreLocal),kendo.culture().calendars.standard.patterns.MES_FechaHora) : '' #"
                        },
                        { field: "estado.nombre", title: window.app.idioma.t('ESTADO'), width: "200px" }
                    ]
                });
            },
            cargarProceso: function (gridProceso, data) {
                var self = this;

                var dataSource = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/getParticion/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        update: {
                            url: "../api/ordenes/editarDatosGenerales",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                return JSON.stringify(data.id);
                            } else if (options) {
                                var datosGenerales = {};
                                datosGenerales.name = options.name;
                                datosGenerales.value = options.value;
                                datosGenerales.idOrden = data.idOrdenPadre;
                                datosGenerales.idParticion = data.id;
                                datosGenerales.numLinea = data.numLinea;
                                return kendo.stringify(datosGenerales);
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: "name",
                            fields: {
                                name: { editable: false },
                                value: { editable: true }
                            }
                        },
                    },
                    requestStart: function () {
                        if (gridProceso.data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($(".proceso"), true);
                        }
                    },
                    requestEnd: function () {
                        if (gridProceso.data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($(".proceso"), false);
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    },
                });

                var gridProc = gridProceso.kendoGrid({
                    dataSource: dataSource,
                    scrollable: true,
                    sortable: false,
                    filterable: false,
                    columns: [
                        {
                            field: "name",
                            title: window.app.idioma.t("NOMBRE"),
                            width: 180
                        },
                        {
                            field: "value",
                            template: function (dataItem) {
                                var name = dataItem.name;
                                var value;
                                switch (name) {
                                    case window.app.idioma.t('DURACION_PLANIFICADA'):
                                    case window.app.idioma.t('DURACION_REAL'):
                                        value = window.app.getDateFormat(dataItem.value);
                                        break;
                                    //case window.app.idioma.t('INDICE_CALIDAD'):
                                    //    value = Math.floor(dataItem.value) == dataItem.value ? dataItem.value : dataItem.value.toFixed(2);
                                    //    value = value + ' ‰';
                                    //    break;
                                    case window.app.idioma.t('OEE_OBJETIVO'):
                                    case window.app.idioma.t('OEE_CRITICO'):
                                    case window.app.idioma.t('RENDIMIENTO'):
                                    case window.app.idioma.t('OEE'):
                                        value = Math.floor(dataItem.value) == dataItem.value ? dataItem.value : dataItem.value.toFixed(2);
                                        value = value + ' %';
                                        break;
                                    case window.app.idioma.t('OEE_SECUENCIADOR'):
                                        if (!dataItem.value) {
                                            value = "--";
                                        } else {
                                            value = Math.floor(dataItem.value) == dataItem.value ? dataItem.value : dataItem.value.toFixed(2);
                                            value = value + ' %';
                                        }
                                        break;
                                    case window.app.idioma.t('FIN_REAL'):
                                    case window.app.idioma.t('INICIO_REAL'):
                                        if (!dataItem.value) {
                                            value = window.app.idioma.t('FECHA_NO_DISPONIBLE');
                                        } else {
                                            var date = new Date(dataItem.value);
                                            value = kendo.toString(date, "dd/MM/yyyy HH:mm:ss")
                                        }
                                        break;
                                    default:
                                        value = dataItem.value;
                                }
                                return kendo.htmlEncode(value);
                            },
                            title: window.app.idioma.t("VALOR"),
                            width: 180,
                            editor: self.cargarValue,
                        },
                        {
                            command: [{
                                name: "edit",
                                text: {
                                    edit: window.app.idioma.t('EDITAR'),
                                    update: window.app.idioma.t('GUARDAR'),
                                    cancel: window.app.idioma.t('CANCELAR')
                                }
                            }], title: "&nbsp;", width: "250px"
                        }
                    ],
                    editable: "inline",
                    save: function (e) {
                        if (e.model.value == null) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FECHA_INCORRECTA'), 3000);
                            e.preventDefault();
                        }
                    },
                    dataBound: function (e) {
                        var grid = this;
                        $(".proceso .k-grid-edit").each(function () {
                            var row = $(this).closest("tr");
                            var model = grid.dataItem(row);
                            if (model) {
                                if (model.name != window.app.idioma.t('INICIO_REAL') && model.name != window.app.idioma.t('FIN_REAL') || (data.estadoActual.nombre == "Producción" || data.estadoActual.nombre == "Iniciando" || data.estadoActual.nombre == "Iniciar")) {
                                    $($(row).find("td")[2]).html("");
                                }
                            }
                        });
                    }
                });
            },
            cargarValue: function (container, options) {
                $('<input required name="' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDateTimePicker({
                        format: "dd/MM/yyyy HH:mm:ss",
                        culture: localStorage.getItem("idiomaSeleccionado"),
                        value: new Date(options.model.value)
                    });
            },
            cargarProduccionTurnos: function (gridProduccion, idParticion, numLinea) {
                var dsProduccion = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ordenes/produccionParticionTurno/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.numLinea = numLinea;
                                result.idParticion = idParticion;

                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    pageSize: 5,
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
                                sumRechazosInspBotellaLlena_Bascula: { type: "number" }
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
                    requestStart: function () {
                        if (gridProduccion.data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($(".produccion"), true);
                        }
                    },
                    requestEnd: function () {
                        if (gridProduccion.data("kendoGrid").dataSource.data().length == 0) {
                            kendo.ui.progress($(".produccion"), false);
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    },
                    //sort: { field: "fecha", dir: "asc" }
                });

                var gridProd = gridProduccion.kendoGrid({
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
                    columns: [
                        {
                            field: "fechaTurnoLocal",
                            title: window.app.idioma.t('FECHA'),
                            width: 80,
                            template: '#: kendo.toString(new Date(fechaTurnoLocal),kendo.culture().calendars.standard.patterns.MES_Fecha)#'
                        },
                        {
                            field: "TipoTurno",
                            title: window.app.idioma.t('TIPO_TURNO'),
                            width: 80,
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
                        }
                    ],
                });

                gridProd.data("kendoGrid").thead.kendoTooltip({
                    filter: "th",
                    content: function (e) {
                        var target = e.target; // element for which the tooltip is shown
                        return $(target).text();
                    }
                });
            },
            cargarLotesMateriaPrima: async function (gridLotes, data) {
                var self = this;
                //const hist = await self.cargarDataHistorico(self.idOrden);
                //var registroIniciando = hist ? hist.find(o => o.estado.nombre === "Iniciando") : null;
                //self.fechaEstadoIniciando = registroIniciando ? registroIniciando.fechaCambioLocal : null;

                var dsLotes = self.obtenerLotesMMPP(data, gridLotes);                

                gridLotes.kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t('WO_ACTIVAS_MMPP_EXCEL') + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];

                                row.cells[0].value = kendo.toString(e.data[dataPosition].FechaInicioConsumo, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[1].value = kendo.toString(e.data[dataPosition].FechaFinConsumo, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[9].format = "#,##0.00";
                            } catch (e) {
                            }
                        }
                    },
                    dataSource: dsLotes,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    resizable: true,
                    scrollable: true,
                    sortable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    toolbar: [
                        {
                            template: "<button type='button' id='btnExportExcelMMPP' class='k-button k-button-icontext' style='float:right;margin-left:5px;'> <span class='k-icon k-i-excel'></span>" + window.app.idioma.t('EXPORTAR_EXCEL') + "</button>"
                        }
                    ],
                    columns: [
                    {
                        field: "FechaInicioConsumo",
                        title: window.app.idioma.t("FECHA_INICIO_CONSUMO"),
                        template: '#= FechaInicioConsumo !== null ? kendo.toString(FechaInicioConsumo, "' + kendo.culture().calendars.standard.patterns.MES_FechaHora + '" ) : "" #',
                        width: 150,
                    },
                    {
                        field: "FechaFinConsumo",
                        title: window.app.idioma.t("FECHA_FIN_CONSUMO"),
                        template: '#= FechaFinConsumo !== null ? kendo.toString(FechaFinConsumo, "' + kendo.culture().calendars.standard.patterns.MES_FechaHora + '" ) : "" #',
                        width: 140,
                    },
                    {
                        field: "IdLoteMES",
                        title: window.app.idioma.t("LOTE"),
                        //width: 140
                    },
                    {
                        field: "IdMaterial",
                        title: window.app.idioma.t("CODIGO_MATERIAL"),
                        width: 110,
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field == "all") {
                                    return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                } else {
                                    return "<div><label><input type='checkbox' value='#=IdMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= IdMaterial #</label></div>";
                                }
                            }
                        }
                    },
                    {
                        field: "DescripcionMaterial",
                        title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                        width: 190,
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field == "all") {
                                    return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                } else {
                                    return "<div><label><input type='checkbox' value='#=DescripcionMaterial#' style='//width: 14px;height:14px;margin-right:5px;'/>#= DescripcionMaterial #</label></div>";
                                }
                            }
                        }
                    },
                    {
                        field: "Ubicacion",
                        title: window.app.idioma.t("UBICACION"),
                        width: 100,
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field == "all") {
                                    return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                } else {
                                    return "<div><label><input type='checkbox' value='#=Ubicacion#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Ubicacion #</label></div>";
                                }
                            }
                        }
                    },
                    {
                        field: "IdProveedor",
                        title: window.app.idioma.t("CODIGO_PROVEEDOR"),
                        width: 120
                    },
                    {
                        field: "Proveedor",
                        title: window.app.idioma.t("DESCRIPCION_PROVEEDOR"),
                        width: 200,
                    },
                    {
                        field: "LoteProveedor",
                        title: window.app.idioma.t("LOTE_PROVEEDOR"),
                        width: 115
                    },
                    {
                        field: "Cantidad",
                        template: '#= Cantidad !== null ? kendo.format("{0:n2}", Cantidad) : "" #',
                        title: window.app.idioma.t("CANTIDAD"),
                        width: 90,
                        filterable: {
                            ui: function (element) {
                                element.kendoNumericTextBox({
                                    format: "{0:n2}",
                                    culture: localStorage.getItem("idiomaSeleccionado")
                                });
                            }
                        },
                    },
                    {
                        field: "Unidad",
                        template: "#=Unidad ? Unidad.toUpperCase() : ''#",
                        title: "UM",
                        width: 50,
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field == "all") {
                                    return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                } else {
                                    return "<div><label><input type='checkbox' value='#=Unidad#' style='//width: 14px;height:14px;margin-right:5px;'/>#= Unidad #</label></div>";
                                }
                            }
                        }
                    }
                    ],
                });
            },
            obtenerLotesMMPP: function (data, gridLotes) {
                return new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/lotes/LotesMateriaPrima/" + data.idOrdenPadre,
                            dataType: "json",
                        },
                        //parameterMap: function (options, operation) {
                        //    if (operation === "read") {
                        //        var result = {};
                        //        result.idLinea = data.idLinea;
                        //        result.idOrden = self.idOrden;
                        //        //result.fechaInicio = self.fechaEstadoIniciando ? new Date(self.fechaEstadoIniciando).toISOString() : new Date(data.dFecInicio).toISOString();
                        //        //result.fechaFin = data.FechaFinEstimadaReal.getFullYear() === 1 ? new Date().toISOString() : data.FechaFinEstimadaReal.toISOString();
                        //        result.idProducto = data.producto.codigo;
                        //        result.fecInicio = new Date(data.dFecInicio).toISOString();
                        //        result.fechaFinEstimadaReal = data.FechaFinEstimadaReal.getFullYear() === 1 ? new Date().toISOString() : data.FechaFinEstimadaReal.toISOString();
                        //        result.esHistorico = false;

                        //        return JSON.stringify(result);
                        //    }

                        //    return kendo.stringify(options);
                        //}
                    },
                    pageSize: 15,
                    schema: {
                        model: {
                            fields: {
                                'FechaInicioConsumo': { type: "date" },
                                'FechaFinConsumo': { type: "date" },
                                'IdLoteMES': { type: "string" },
                                'IdMaterial': { type: "string" },
                                'DescripcionMaterial': { type: "string" },
                                'Ubicacion': { type: "string" },
                                'IdProveedor': { type: "string" },
                                'Proveedor': { type: "string" },
                                'LoteProveedor': { type: "string" },
                                'Cantidad': { type: "number" },
                                'Unidad': { type: "string" }
                            }
                        }
                    },
                    requestStart: function (e) {
                        if (gridLotes && gridLotes.length > 0) {
                            gridLotes.css("min-height", "120px");
                            kendo.ui.progress(gridLotes, true);
                        }
                    },
                    requestEnd: function (e) {
                        if (gridLotes && gridLotes.length > 0) {
                            kendo.ui.progress(gridLotes, false);
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    },
                });
            },
            cargarLIMS: function (data) {
                var self = this;

                var dsLotes = self.obtenerLotesMMPP(data); // <-- asegúrate de que este data contiene lo esperado (tiene un .id)

                dsLotes.one("change", function () {
                    var lotesData = typeof dsLotes.data === "function" ? dsLotes.data() : [];

                    var lotesFormateados = [];

                    lotesFormateados = lotesData
                        .filter(function (lote) {
                            var id = (lote.IdLoteMES || "").toString().trim().toUpperCase();
                            return id.includes("CZAEB") || id.includes("CZAEK");
                        })
                        .map(function (lote) {
                            return lote.IdLoteMES;
                        });

                    // Añadir manualmente el lote de prueba si no está ya
                    //var lotePrueba = "BUR-71-CZAPB-F52601-TCP-B138PRTCP04-20250328T085608-000642";
                    //if (!lotesFormateados.includes(lotePrueba)) {
                    //    lotesFormateados.push(lotePrueba);
                    //}

                    // Crear el componente solo después de que tengamos los datos
                    var componentLIMS = new VistaLIMS({
                        wo: data.id,
                        lotes: lotesFormateados,
                        //fechaLote: kendo.parseDate(data.fecInicio, kendo.culture().calendars.standard.patterns.MES_FechaHora),
                        fechaLote: kendo.parseDate(new Date(), kendo.culture().calendars.standard.patterns.MES_FechaHora),
                        opciones: {
                            TipoWO: 'Activas',
                            PeticionMuestraCallback: () => {
                                self.idOrdenPadre = data.idOrdenPadre;
                                self.SetLIMsTabColor();
                            }
                        }
                    });

                    self.detailRow.find(".componentLIMS").html(componentLIMS.render().el);
                    componentLIMS.CargarLIMS();
                });

                dsLotes.read();
            },
            SetLIMsTabColor: function () {
                var self = this;

                var backGroundColor = "#eae8e8";  //transparente                

                $.ajax({
                    type: "GET",
                    async: true,
                    url: "../api/LIMS/obtenerEstadoLIMSdeWOEnvasado?wo=" + encodeURIComponent(self.idOrdenPadre),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        if (response) {
                            backGroundColor = response.Valor;

                            $("[id='lims_estado_" + self.idOrden + "']").css("background-color", backGroundColor);

                            var limsTab = self.tabStrip.tabGroup.children().eq(9);
                            limsTab.css("background-color", backGroundColor);
                        }
                    },
                    error: function (response) {
                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('info', window.app.idioma.t('AVISO'), 'obtenerEstadoLIMSdeWOEnvasado', 3000);
                        }
                    }
                });
            },
        });

        return gridGestionWOActivas;
    });