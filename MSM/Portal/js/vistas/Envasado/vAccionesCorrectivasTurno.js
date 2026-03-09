define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/AccionesCorrectivasTurno.html', 'vistas/vDialogoConfirm',
    'compartido/notificaciones', 'vistas/Envasado/vCrearAccionCorrectivaTurno', 'vistas/Envasado/vTurnoSelector', 'jszip'],
    function (_, Backbone, $, PlantillaAccionesCorrectivas, VistaDlgConfirm, Not, vistaCrearACT, vistaSelectorTurno, JSZip) {
        var VistaAccionesCorrectivas = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            dia: 0,
            turno: 0,
            linea: '',
            grid: null,
            ds: null,
            inicio: new Date((new Date()).getTime() - (30 * 24 * 3600 * 1000)),
            fin: new Date(),
            template: _.template(PlantillaAccionesCorrectivas),
            destino: {
                crearAC: 0,
                crearAutoAC: 1
            },
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                var indexParams = window.location.hash.indexOf('?');
                if (indexParams > 0) {
                    var queryParams = window.location.hash.substring(indexParams);
                    if (queryParams) {
                        self.urlParams = new URLSearchParams(queryParams);
                        var fecha = self.urlParams.get('fecha');
                        if (fecha) {
                            self.inicio = new Date(fecha);
                            self.fin = new Date(fecha);
                        }
                    }
                }

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);
                
                self.getDataSource();
                self.render();
            },
            getDataSource: function () {
                var self = this;

                self.dsAcciones = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/accionesCorrectivasTurno/filtro/",
                            data: function () {
                                var result = {};
                                result.fechaInicio = self.inicio?.midnight().toISOString();
                                result.fechaFin = self.fin?.addDays(1).midnight().toISOString(); 

                                return result;
                            },
                            dataType: "json"
                        },
                        update: {
                            url: "../api/accionesCorrectivasTurno",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    $("#gridAcciones").data("kendoGrid").dataSource.read();
                                }
                            },
                        },
                        destroy: {
                            url: "../api/accionesCorrectivasTurno",
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
                                // Para que en el filtrado de fecha funcione el equal
                                r.TurnoFecha = new Date(r.TurnoFecha).midnight();
                                r.MaquinaId = r.MaquinaId?.trim() || null;
                            }

                            return response;
                        },
                        model: {
                            id: "Id",
                            fields: {
                                Id: { type: "number", editable: false },
                                IdLinea: { type: "string", editable: false },
                                TurnoFecha: { type: "date", editable: false },
                                IdTipoTurno: { type: "number", editable: false },
                                OT: { type: "number", editable: false },
                                MaquinaId: { type: "string", editable: true },
                                MaquinaNombre: { type: "string", editable: false },
                                ComentarioParo: { type: "string", editable: false },
                                Duracion: { type: "number", editable: false },
                                PerdidaRendimiento: { type: "number", editable: false },
                                Responsable: { type: "string" },
                                AccionRealizada: { type: "string" },
                                Estado: { type: "boolean" },
                                Observaciones: { type: "string" },
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
            render: function () {
                var self = this;

                DestruirKendoWidgets(self);

                $(self.el).html(self.template());
                $("#center-pane").append($(self.el))

                $("#dtpFechaDesde").kendoDatePicker({
                    value: self.inicio,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#dtpFechaHasta").kendoDatePicker({
                    value: self.fin,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#btnAdd").kendoButton({
                    click: async function () {
                        try {
                            var turno;

                            if (self.urlParams) {
                                turno = {
                                    fecha: self.urlParams.get("fecha"),
                                    linea: { id: self.urlParams.get("idLinea") },
                                    tipo: { id: self.urlParams.get("tipoTurno") }
                                }

                            } else {
                                // usamos los filtros que tenga el grid
                                var filtros = ObtenerFiltrosGrid('gridAcciones', ["IdLinea", "TurnoFecha", "IdTipoTurno"]);
                                turno = {};
                                if (filtros.IdLinea) {
                                    turno.linea = { id: filtros.IdLinea };
                                }
                                if (filtros.TurnoFecha) {
                                    turno.fecha = filtros.TurnoFecha;
                                }
                                if (filtros.IdTipoTurno) {
                                    turno.tipo = { id: filtros.IdTipoTurno };
                                }
                            }

                            self.mostrarModalSelectorTurno( turno, self.destino.crearAC );

                        } catch (er) {
                            console.log("Error cargando el selector de turno: " + er)
                        }                        
                    }
                });

                $("#btnCrearACAuto").kendoButton({
                    click: async function () {
                        try {
                            var turno;

                            if (self.urlParams) {
                                turno = {
                                    fecha: self.urlParams.get("fecha"),
                                    linea: { id: self.urlParams.get("idLinea") },
                                    tipo: { id: self.urlParams.get("tipoTurno") }
                                }

                            } else {
                                // usamos los filtros que tenga el grid
                                var filtros = ObtenerFiltrosGrid('gridAcciones', ["IdLinea", "TurnoFecha", "IdTipoTurno"]);
                                turno = {};
                                if (filtros.IdLinea) {
                                    turno.linea = { id: filtros.IdLinea };
                                }
                                if (filtros.TurnoFecha) {
                                    turno.fecha = filtros.TurnoFecha;
                                }
                                if (filtros.IdTipoTurno) {
                                    turno.tipo = { id: filtros.IdTipoTurno };
                                }
                            }

                            self.mostrarModalSelectorTurno(turno, self.destino.crearAutoAC);

                        } catch (er) {
                            console.log("Error cargando el selector de turno: " + er)
                        }
                    }
                });

                self.grid = this.$("#gridAcciones").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t("ACCIONES_CORRECTIVAS_TURNO") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    dataSource: self.dsAcciones,
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
                    detailTemplate: kendo.template($("#templateDetalleOTs").html()),
                    detailInit: self.detailOTsInit,
                    columns: [
                        {
                            title: "OTs",
                            width: "40px",
                            template: "<a class='k-icon k-i-expand expand-custom' style='cursor:pointer'></a>"
                        },
                        {
                            field: "IdLinea",
                            title: window.app.idioma.t("LINEA"),
                            template: "#: ObtenerLineaDescripcion(IdLinea) #",
                            width: 140,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=IdLinea#' style='width: 14px;height:14px;margin-right:5px;'/>#: ObtenerLineaDescripcion(IdLinea) #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "TurnoFecha",
                            title: window.app.idioma.t('FECHA'),
                            template: '#: kendo.toString(new Date(TurnoFecha),kendo.culture().calendars.standard.patterns.MES_Fecha)#',
                            width: 90,
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                    });
                                }
                            },
                            groupHeaderTemplate: (e) => {
                                return `${window.app.idioma.t("FECHA")}: ${kendo.toString(e.value, "dd/MM/yyyy")}`
                            },
                        },
                        {
                            field: "IdTipoTurno",
                            title: window.app.idioma.t('TIPO_TURNO'),
                            template: "#: window.app.idioma.t('TURNO' + IdTipoTurno) #",
                            width: 90,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#= IdTipoTurno #' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t('TURNO' + IdTipoTurno)#</label></div>";
                                    }
                                }
                            },
                            groupHeaderTemplate: (e) => {
                                return `${window.app.idioma.t("TIPO_TURNO")}: ${window.app.idioma.t('TURNO' + e.value)}`
                            },
                            attributes: {
                                "class": 'ac_turn'
                            },
                        },
                        {
                            field: "MaquinaId",
                            title: window.app.idioma.t("MAQUINA"),
                            template: "#= MaquinaNombre ? MaquinaNombre : '' #",
                            groupHeaderTemplate: (e) => {
                                return `${window.app.idioma.t("MAQUINA")}: ${e.value ? e.value : window.app.idioma.t('SIN_MAQUINA_DEFINIDA')}`
                            },
                            width: 280,
                            editor: function (e, options) { return self.resendMaquinaComboBox(e, options) },
                        },
                        {
                            field: "ComentarioParo",
                            title: window.app.idioma.t("COMENTARIO_PARO"),
                            width: 160,
                            groupable: false,
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                        },
                        {
                            field: "Duracion",
                            title: window.app.idioma.t("Duracion"),
                            template: "#=(ParoId == null ? '' : ConversorHorasMinutosSegundos(Duracion))#",
                            width: 110,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupable: false,
                        },
                        {
                            field: "PerdidaRendimiento",
                            title: window.app.idioma.t("RENDIMIENTO_PERDIDO"),
                            template: "#=(ParoId == null ? '' : PerdidaRendimiento.toFixed(2) + '%')#",
                            width: 135,
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "0",
                                        decimals: 2
                                    });
                                }
                            },
                            groupable: false,
                        },
                        {
                            field: "Responsable",
                            title: window.app.idioma.t("RESPONSABLE"),
                            width: 130,
                        },
                        {
                            field: "AccionRealizada",
                            title: window.app.idioma.t("ACCION_REALIZADA"),
                            template: "<div class='addTooltip truncated-text-cell'>#= AccionRealizada?.replace(/\\n/g, '<br>') || '' #</div>",
                            width: 300,
                            groupable: false,
                            editor: function (e, options) { return self.resendEditorTextArea(e, options) },
                            
                        },
                        {
                            field: "Estado",
                            title: window.app.idioma.t("ESTADO"),
                            template: '<div><select class="cmbEstado" id="cmbEstado_#= Id #" style="width:100%;" data-id="#= Id #" initial-value="#= Estado ? 1 : 0 #"></select></div>',
                            width: 95,
                            editor: function (e, options) { return self.resendEditorComboBox(e, options) },
                            filterable: { messages: { isTrue: window.app.idioma.t("ABIERTA"), isFalse: window.app.idioma.t("CERRADA") } },
                            groupable: false,
                        },
                        {
                            field: "Observaciones",
                            title: window.app.idioma.t("OBSERVACIONES"),
                            template: "<div class='observationsDiv'><div class='addTooltip truncated-text-cell'>#= Observaciones?.replace(/\\n/g, '<br>') || '' #</div>" +
                                "<button title='#=window.app.idioma.t('ENVIAR') # e-mail' onclick='javascript: window.app.vista.enviarEmail(#= Id #, `#=Observaciones#`)'>" +
                                "<img class='k-icon' style='background-image:none;' src='../../../Common/img/paper-plane.png'></buton></div>",
                            groupable: false,
                            editor: function (e, options) { return self.resendEditorTextArea(e, options) },
                            width: 300
                        },
                        {
                            title: window.app.idioma.t("OPERACIONES"),
                            attributes: { "align": "center" },
                            width: 160,
                            groupable: false,
                            command: [
                                {
                                    name: "edit",
                                    text: {
                                        edit: window.app.idioma.t("EDITAR"),
                                        update: window.app.idioma.t("ACTUALIZAR"),
                                        cancel: window.app.idioma.t("CANCELAR")
                                    },
                                    click: function (e) {
                                        var permiso = TienePermiso(297);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            $('#gridAcciones').data("kendoGrid").cancelChanges();
                                        }
                                    }
                                },
                                {
                                    className: "btn-destroy",
                                    name: "Delete",
                                    text: window.app.idioma.t('ELIMINAR'),
                                    click: function (e) {
                                        e.preventDefault(); //prevent page scroll reset
                                        var permiso = TienePermiso(297);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            return;
                                        }

                                        var grid = $("#gridAcciones").data("kendoGrid");
                                        var tr = $(e.target).closest("tr");
                                        var data = this.dataItem(tr);

                                        this.confirmacion = new VistaDlgConfirm({
                                            titulo: window.app.idioma.t('ELIMINAR'),
                                            msg: window.app.idioma.t('CONFIRMACION_ELIMINAR_REGISTRO'),
                                            funcion: function () {
                                                grid.dataSource.remove(data);
                                                grid.dataSource.sync();
                                                Backbone.trigger('eventCierraDialogo');
                                            }, contexto: this
                                        });
                                    }
                                },
                            ]
                        }
                    ],
                    dataBinding: self.resizeGrid,
                    dataBound: function () {
                        var grid = this;
                        var data = grid.dataSource.data();

                        // colores de celdas
                        $.each(data, function (i, row) {
                            let cellEstado = $('tr[data-uid="' + row.uid + '"]').find(".cmbEstado").closest("td");
                            let cellTurno = $('tr[data-uid="' + row.uid + '"]').find(".ac_turn").closest("td");

                            if (row.Estado) {
                                cellEstado.addClass("ac_sub-row-open");
                            }
                            else {
                                cellEstado.addClass("ac_sub-row-closed");
                            }

                            cellTurno.addClass("ac_turn_" + row.IdTipoTurno);

                        });

                        //Detalle customizado
                        grid.tbody.find(".expand-custom").each(function () {
                            $(this).on("click", function (e) {                                

                                setTimeout(() => {
                                    var tr = $(e.target).closest("tr");
                                    var detailRow = tr.next(".k-detail-row");
                                    if (detailRow.length > 0 && detailRow.is(":visible")) {
                                        // Existe una fila de detalle siguiente, significa que está expandido
                                        $(this).removeClass("k-i-collapse").addClass("k-i-expand");
                                        grid.collapseRow(tr);
                                    } else {
                                        $(this).removeClass("k-i-expand").addClass("k-i-collapse");
                                        grid.expandRow(tr);
                                    }
                                })
                            });
                        });

                        let estadoDataSource = [
                            {
                                id: 0,
                                descripcion: window.app.idioma.t('CERRADA')
                            },
                            {
                                id: 1,
                                descripcion: window.app.idioma.t('ABIERTA')
                            }
                        ]
                        $(".cmbEstado").each(function (idx, elem) {
                            $(elem).kendoDropDownList({
                                dataTextField: "descripcion",
                                dataValueField: "id",
                                dataSource: estadoDataSource,
                                index: parseInt($(elem).attr("initial-value")),
                                change: function (e) {
                                    var id = parseInt($(elem).data("id"));
                                    var object = {
                                        Id: id,
                                        Estado: parseInt(e.sender?.value())
                                    }

                                    self.patchAccionCorrectiva( [object] );
                                }
                            })
                        });

                        // Filtrado inicial con los parametros de la url
                        if (self.urlParams && !self.gridLoaded) {
                            self.gridLoaded = true;

                            var idLinea = self.urlParams.get("idLinea");
                            var idTipoTurno = parseInt(self.urlParams.get("tipoTurno"));
                            var filters = [];
                            if ( idLinea ) {
                                filters.push({ field: "IdLinea", operator: "eq", value: idLinea });
                            }
                            if (idTipoTurno) {
                                filters.push({ field: "IdTipoTurno", operator: "eq", value: idTipoTurno });
                            }
                            
                            self.dsAcciones.query({
                                page: 1,
                                pageSize: self.dsAcciones.pageSize(),
                                sort: self.dsAcciones.sort(),
                                filter: {
                                    logic: "and",
                                    filters: filters
                                }
                            });
                        }
                    },
                    cancel: function (e) {
                        $("#gridAcciones").data("kendoGrid").refresh();
                    },
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        var templateTipoTurno = kendo.template("#: window.app.idioma.t('TURNO' + IdTipoTurno) #");
                        var templateEstado = kendo.template("# if(Estado) {#" + window.app.idioma.t("ABIERTA") + "#} else {#" + window.app.idioma.t("CERRADA") + "#} #");

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];

                                var dataItemTipoTurno = {
                                    IdTipoTurno: row.cells[2].value
                                };

                                var dataItemEstado = {
                                    Estado: row.cells[10].value
                                };

                                row.cells[0].value = ObtenerLineaDescripcion(e.data[dataPosition].IdLinea);
                                row.cells[2].value = templateTipoTurno(dataItemTipoTurno);
                                row.cells[5].value = ConversorHorasMinutosSegundos(e.data[dataPosition].Duracion);
                                row.cells[6].value = e.data[dataPosition].PerdidaRendimiento.toFixed(2);
                                row.cells[9].value = templateEstado(dataItemEstado);
                            } catch (e) {
                            }
                        }
                    },
                }).data("kendoGrid");

                $("#gridAcciones").kendoTooltip({
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
            resendEditorComboBox: function (container, options) {
                $('<select data-bind="value: ' + options.field + '"><option value="true">' + window.app.idioma.t("ABIERTA") +
                    '</option><option value="false">' + window.app.idioma.t("CERRADA") + '</option> </select>').appendTo(container).kendoDropDownList();
            },
            resendMaquinaComboBox: function (container, options) {
                if (options.model.MaquinaId && !options.model.ParoId) {
                    var ds = new kendo.data.DataSource({
                        transport: {
                            read: function (operation) {
                                if (options.model.IdLinea) {
                                    $.ajax({
                                        url: "../api/MaquinasLinea/" + options.model.IdLinea + "/",
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
                        }
                    });

                    $('<select data-bind="value: ' + options.field + '"></select>').appendTo(container).kendoDropDownList(
                        {
                            height: 450,
                            dataTextField: "Descripcion",
                            dataValueField: "CodigoMaquina",
                            optionLabel: window.app.idioma.t('SELECCIONE'),
                            dataSource: ds,
                            value: options.model.MaquinaId

                        }
                    );                    
                }
            },
            resendEditorTextArea: function (container, options) {
                $('<textarea class="k-input k-textbox" name="' + options.field + '"></textarea>')
                    .appendTo(container);
            },
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnExportExcel': 'exportExcel',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
            },
            detailOTsInit: function (e) {
                let detailRow = e.detailRow;
                let self = window.app.vista;
                let data = e.data;

                detailRow.find(".manualOTlabelDiv").hide();

                if (data.OT) {
                    detailRow.find(".btnAddOTs").hide();
                    detailRow.find(".manualOTinputDiv").hide();
                    detailRow.find(".manualOTlabel").html(data.OT);
                    detailRow.find(".manualOTlabelDiv").show();
                }

                detailRow.find(".btnAddOTs").on("click", function (e) {
                    detailRow.find(".manualOTinput").val(null);
                    detailRow.find(".btnAddOTs").hide();
                    detailRow.find(".manualOTlabelDiv").hide();
                    detailRow.find(".manualOTinputDiv").show();
                });
                detailRow.find(".btnEditOTs").on("click", function (e) {
                    detailRow.find(".manualOTinput").val(data.OT);
                    detailRow.find(".btnAddOTs").hide();
                    detailRow.find(".manualOTlabelDiv").hide();
                    detailRow.find(".manualOTinputDiv").show();
                });
                detailRow.find(".btnConfirmOTs").on("click", function (e) {
                    var OT = detailRow.find(".manualOTinput").val();

                    if (OT == '') {
                        OT = null;
                    }
                    else
                    {
                        var number = parseInt(OT)
                        if (isNaN(number) || number < 10000000 || number > 1000000000) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_VALIDO'), 4000);
                            return;
                        }
                        OT = number
                    }
                    var object = {
                        Id: data.Id,
                        OT
                    }

                    self.patchAccionCorrectiva( [object] );
                });
                detailRow.find(".btnCancelOTs").on("click", function (e) {
                    detailRow.find(".btnAddOTs").hide();
                    detailRow.find(".manualOTinputDiv").hide();
                    detailRow.find(".manualOTlabelDiv").hide();
                    if (data.OT) {
                        detailRow.find(".manualOTlabelDiv").show();
                    }
                    else {
                        detailRow.find(".btnAddOTs").show();
                    }
                });

                detailRow.find(".gridDetail").kendoGrid({
                    dataSource: {
                        transport: {
                            type: "GET",
                            read: "../api/SolicitudMantenimientoPorParo/" + data.ParoId + "/",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                        },
                        schema: {
                            model: {
                                id: "Id",
                                fields: {
                                    Id: { type: "number", editable: false, nullable: false },
                                    FechaCreacion: { type: "date", editable: false },
                                    FechaCierre: { type: "date", editable: false },
                                    Maquina: { type: "string" },
                                    MaquinaDescripcion: { type: "string" },
                                    MaquinaClase: { type: "string" },
                                },
                            },
                        },
                    },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    scrollable: true,
                    sortable: true,
                    pageable: false,
                    columns: [
                        { field: "NumOT", title: window.app.idioma.t('NUM_OT'), width: 120 },
                        {
                            field: "Estado",
                            title: window.app.idioma.t('ESTADO'),
                            width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Estado#' style='width: 14px;height:14px;margin-right:5px;'/>#= Estado#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "EstadoDescripcion",
                            title: window.app.idioma.t('DESCRIPCION_ESTADO'),
                            width: 130,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=EstadoDescripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= EstadoDescripcion #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "MaquinaDescripcion",
                            title: window.app.idioma.t('MAQUINA'),
                            width: 170,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=MaquinaDescripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= MaquinaDescripcion#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "EquipoConstructivoDescripcion",
                            title: window.app.idioma.t('EQUIPO_CONSTRUCTIVO'),
                            width: 180,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=EquipoConstructivoDescripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= EquipoConstructivoDescripcion#</label></div>";
                                    }
                                }
                            }
                        },
                        { field: "DescripcionTipoAveria", title: window.app.idioma.t("TIPO_AVERIA"), width: 150 },
                        { field: "DescripcionAveria", title: window.app.idioma.t('DESCRIPCION_AVERIA'), width: 200 },
                        { field: "DescripcionProblema", title: window.app.idioma.t('DESCRIPCION_PROBLEMA'), width: 200 },
                        { field: "ComentarioCierre", title: window.app.idioma.t('COMENTARIO_CIERRE'), width: 200 },
                        {
                            field: "FechaCreacion",
                            title: window.app.idioma.t('FECHA_CREACION'),
                            format: "{0:" + kendo.culture().calendar.patterns.MES_FechaHora + "}",
                            width: 160,
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
                        {
                            field: "FechaCierre",
                            title: window.app.idioma.t('FECHA_CIERRE'),
                            format: "{0:" + kendo.culture().calendar.patterns.MES_FechaHora + "}",
                            width: 160,
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
                        {
                            field: "Usuario.UserName",
                            title: window.app.idioma.t('USUARIO'),
                            width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Usuario.UserName#' style='width: 14px;height:14px;margin-right:5px;'/>#= Usuario.UserName#</label></div>";
                                    }
                                }
                            }
                        }
                    ],
                    //dataBound: function (e) {
                    //    //Desplegamos el detalle del registro que acabamos de editar en su caso
                    //    if (self.detailsEdited.length >= 2) {
                    //        let item = this.dataSource._data.find(f => f.Id == self.detailsEdited[1]);
                    //        if (item != null) {
                    //            let uid = item.uid;
                    //            this.expandRow("tr[data-uid=" + uid + "]");
                    //        }
                    //    }
                    //    self.detailsEdited = [];
                    //}
                });
            },
            enviarEmail: function (id, msg) {

                // mostramos la ventana
                var ventanaEnviarMail = $("<div id='dlgModalEnvioEmail'/>").kendoWindow(
                    {
                        title: window.app.idioma.t('COMPARTIR') + " " + window.app.idioma.t('OBSERVACIONES'),
                        width: "800px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        close: function () {
                            ventanaEnviarMail.getKendoWindow().destroy();
                        },
                        refresh: function () {
                        }
                    });

                var template = kendo.template($("#templateSendEmail").html());
                ventanaEnviarMail.getKendoWindow()
                    .content(template({}))
                    .center().open();

                // inicializacion multiselect de emails
                $("#destinatarios").kendoMultiSelect({
                    filter: "contains",
                    dataTextField: "Email",
                    dataValueField: "Id",
                    itemTemplate: '<span class="k-state-default">#= (data.Nombre ? "<strong>"+ data.Nombre +":</strong> ("+ data.Email +")" : data.Email) #</span>',
                    //'<span class="k-state-default"><strong>#: data.Nombre #</strong> <span>#: data.Email #</span></span>',
                    tagTemplate: '<span title="#= data.Email #">#: data.Nombre || data.Email #</span>',
                    optionLabel: window.app.idioma.t("SELECCIONE"),
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/accionesCorrectivasTurno/emails",
                                dataType: "json"
                            }
                        },
                        sort: { field: "Email", dir: "asc" },
                    },
                })

                $("#mailBody").val(msg);

                $("#btnEnviarEmail").kendoButton({
                    click: async function () {
                        try {

                            var item = $("#gridAcciones").getKendoGrid().dataSource.data().find(f => f.id == id);
                            var responsable = window.app.sesion?.attributes?.usuario || "MES";

                            if (!item) {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ENVIAR_EMAIL'), 4000);
                                return;
                            }

                            var destinatarios = $("#destinatarios").getKendoMultiSelect()?.dataItems()?.map(m => m.Email);

                            if (!(destinatarios?.length)){
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONA_DESTINATARIOS'), 4000);
                                return;
                            }

                            var msgFinal = window.app.idioma.t("PLANTILLA_EMAIL_OBSERVACIONES_ACCION_CORRECTIVA")
                                .replace("#LINEA#", ObtenerLineaDescripcion(item.IdLinea))
                                .replace("#FECHA#", item.TurnoFecha.formated([]))
                                .replace("#TIPO_TURNO#", window.app.idioma.t('TURNO' + item.IdTipoTurno))
                                .replace("#OBSERVACIONES#", CodificarEnHTML2(msg))
                                .replace("#RESPONSABLE#", responsable);

                            var mailInfo = {
                                Subject: window.app.idioma.t("PARTE_RELEVO_TURNO"),
                                Message: msgFinal,
                                Recipients: destinatarios,
                                AutomaticMsg: ''
                            };

                            kendo.ui.progress($("#gridAcciones"), true);

                            $.ajax({
                                type: "POST",
                                url: `../api/general/EnviarEmailGenerico`,
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                data: JSON.stringify(mailInfo),
                                complete: function () {
                                    kendo.ui.progress($("#gridAcciones"), false)
                                },
                                success: function (res) {
                                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('EMAIL_ENVIADO_CORRECTAMENTE'), 4000);
                                },
                                error: function (e) {
                                    console.log(e);
                                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                    } else {
                                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ENVIAR_EMAIL'), 4000);
                                    }
                                }
                            });

                        } catch (er) {
                            console.log("Error enviando el email: " + er);
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ENVIAR_EMAIL'), 4000);
                        }
                    }
                })
            },
            patchAccionCorrectiva: function ( object ) {
                let self = this;

                let patch = ConvertirPatch( object );

                kendo.ui.progress($("#gridAcciones"), true);

                $.ajax({
                    type: "PATCH",
                    url: `../api/accionesCorrectivasTurno`,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(patch),
                    complete: function () {
                        kendo.ui.progress($("#gridAcciones"), false)
                    },
                    success: function (res) {
                        self.actualiza( null, true );
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITAR_ACCIONES_CORRECTIVAS'), 4000);
                        }
                    }
                });
            },            
            actualiza: function (e, mantenerFiltros = false ) {
                var self = this;

                self.inicio = $("#dtpFechaDesde").data("kendoDatePicker").value();
                self.fin = $("#dtpFechaHasta").data("kendoDatePicker").value();

                if (!self.inicio || !self.fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LAS_FECHAS_INTRODUCIDAS'), 3000);
                    return;
                }

                if (self.inicio > self.fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('_LA_FECHA'), 3000);
                    return;
                }

                RecargarGrid({ grid: self.grid, options: { filter: mantenerFiltros ? self.dsAcciones.filter() : [] } });

            },
            exportExcel: function () {
                var grid = $("#gridAcciones").data("kendoGrid");
                grid.saveAsExcel();
            },
            mostrarModalCrearAC: function ( turno ) {
                let self = this;

                self.vistaCrearACT = new vistaCrearACT({
                    parent: self,
                    options: {
                        turno,
                        callback: function (e) {
                            setTimeout(() => {
                                self.actualiza( null, true );
                            });
                        }
                    }
                });
            },
            mostrarModalSelectorTurno: function (turno, destino) {
                let self = this;

                var options = {
                    turno: turno,
                    select: null,
                    callback: ( _turno ) => {
                        setTimeout(() => {
                            if ( destino == self.destino.crearAC ) {
                                self.mostrarModalCrearAC( _turno );
                            }
                            else if ( destino == self.destino.crearAutoAC )
                            {
                                self.crearAccionesCorrectivasAuto( _turno.idTurno );
                            }
                        });
                    }
                }

                self.vistaSelectorTurno = new vistaSelectorTurno({ parent: self, options });
            },
            crearAccionesCorrectivasAuto: function (idTurno) {
                let self = this;

                kendo.ui.progress($("#gridAcciones"), true);

                $.ajax({
                    type: "GET",
                    url: "../api/accionesCorrectivasTurno/CrearAutomaticas/"+ idTurno + "/",
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    complete: function () {
                        kendo.ui.progress($("#gridAcciones"), false);
                    },
                    success: function (data) {
                        self.actualiza(null, true);
                    },
                    error: function (err) {

                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CREAR_ACCIONES_CORRECTIVAS_AUTO'), 4000);
                        }
                    }
                });
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

                var gridElement = $("#gridAcciones"),
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

                self.dsAcciones.query({
                    page: 1,
                    pageSize: self.dsAcciones.pageSize(),
                    sort: [],
                    filter: []
                });
            },
        });

        return VistaAccionesCorrectivas;
    });