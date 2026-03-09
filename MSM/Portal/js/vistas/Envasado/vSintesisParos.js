define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/SintesisParos.html', 'compartido/notificaciones',
        'vistas/vDialogoConfirm', 'jszip', 'compartido/util', 'vistas/Envasado/vEditarAccionMejora'],
    function (_, Backbone, $, PlantillaSintesisParos, Not, VistaDlgConfirm, JSZip, util, VistaEditarAccionMejora) {
        var VistaSintesisParos = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            //vistaFormCrearAccionMejora: null,
            dataItemSel: -1,
            inicio: new Date((new Date()).getTime() - (15 * 24 * 3600 * 1000)),
            fin: new Date(),
            ds: null,
            vista: null,
            template: _.template(PlantillaSintesisParos),
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);
                self.ds = self.getDataSource(self);
                self.render();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                $("#divFiltrosParosHeader").hide();
                $("#gridSintesisTurnoParos").hide();

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

                //Bloque Acciones de mejora
                //-------------------------

                this.$("#gridAccionesMejora").kendoGrid({
                    autoBind: false,
                    dataSource: self.ds,
                    detailTemplate: kendo.template(this.$("#templateAccionesMejora").html()),
                    //detailInit: this.detailInit,
                    detailExpand: function (e) {
                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                    },
                    excel: {
                        fileName: window.app.idioma.t('EXCEL_SINTESIS_PAROS') + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    sortable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        buttonCount: 5,
                        pageSizes: [50, 100, 200],
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "numeroLinea",
                            title: window.app.idioma.t("LINEA"),
                            template: window.app.idioma.t("LINEA") + " #: numeroLineaDescripcion # - #: nombreLinea#",
                            width: "200px",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#:numeroLinea#' style='width: 14px;height:14px;margin-right:5px;'/>" + window.app.idioma.t('LINEA') + " #: numeroLineaDescripcion # - #: nombreLinea#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "fechaAlta", title: window.app.idioma.t("FECHA_ALTA"), width: "130px",
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            template: '#: kendo.toString(new Date(fechaAlta), "dd/MM/yyyy")#'
                        },
                        {
                            field: "fechaTurno", title: window.app.idioma.t("FECHA_TURNO"), width: "130px",
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            template: '#= fechaTurno.getFullYear() === 1 ? "" : kendo.toString(new Date(fechaTurno), "dd/MM/yyyy") #',
                        },
                        {
                            field: "tipoTurno", title: window.app.idioma.t("TURNO"), width: "110px",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=tipoTurno#' style='width: 14px;height:14px;margin-right:5px;'/>#= tipoTurno#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "usuario", title: window.app.idioma.t("USUARIO"), width: "110px",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=usuario#' style='width: 14px;height:14px;margin-right:5px;'/>#= usuario#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "nombreMaquina", title: window.app.idioma.t("MAQUINA"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=nombreMaquina#' style='width: 14px;height:14px;margin-right:5px;'/>#= nombreMaquina#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "nombreEquipoConstructivo", title: window.app.idioma.t("EQUIPO_CONSTRUCTIVO"),
                        },
                        {
                            field: "fechaFinalizada", title: window.app.idioma.t("FECHA_FINALIZADA"), width: "150px",
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            template: '#if(fechaFinalizada){# #: kendo.toString(new Date(fechaFinalizada),"dd/MM/yyyy")# #}#'
                        },
                        {
                            title: "",
                            template: "<a id='btnEditar' class='k-button' style='min-width:16px;'><span class='k-icon k-edit'></span></a>",
                            //href='\\#EditarAccionMejora/#: id #'
                            width: "60px"
                        },
                        {
                            command: [{
                                name: "destroy",
                                template: "<a id='btnBorrar' class='k-button k-grid-delete' href='' style='min-width:16px;'><span class='k-icon k-delete'></span></a>"
                            }],
                            width: "60px"
                        }
                    ],
                    selectable: true,
                    change: function (e) {
                        var selectedRows = this.select();

                        for (var i = 0; i < selectedRows.length; i++) {
                            var dataItem = this.dataItem(selectedRows[i]);
                            self.dataItemSel = dataItem.id;
                            var urlSplit = $("#gridSintesisTurnoParos").data("kendoGrid").dataSource.transport.options.read.url.split('/');
                            urlSplit[3] = self.dataItemSel;
                            $("#gridSintesisTurnoParos").data("kendoGrid").dataSource.transport.options.read.url = urlSplit.join('/');
                            $("#gridSintesisTurnoParos").data("kendoGrid").dataSource.read();
                            $("#divFiltrosParosHeader").show();
                            $("#gridSintesisTurnoParos").show();
                            
                            break;
                        }
                    },
                    detailInit: function (e) {
                        var detailRow = e.detailRow;

                        detailRow.find(".container").kendoTabStrip({
                            animation: {
                                open: { effects: "fadeIn" }
                            }
                        });
                    },
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        // Modificar los datos de la tabla
                        for (var rowIndex = 1; rowIndex < sheet.rows.length; rowIndex++) {
                            var dataPosition = rowIndex - 1;
                            var row = sheet.rows[rowIndex];

                            //field: "fechaTurno"
                            row.cells[1].value = e.data[dataPosition].fechaTurno.getFullYear() === 1 ? '' : kendo.toString(e.data[dataPosition].fechaTurno, "dd/MM/yyyy");

                            // Aplicar color de fondo a las filas pares
                            if (rowIndex % 2 == 0) {
                                for (var cellIndex = 0; cellIndex < row.cells.length; cellIndex++) {
                                    $.extend(row.cells[cellIndex], util.ui.default.excelCellEvenRow);
                                }
                            }
                        }
                    }
                });

                //Bloque Paros y Perdidas
                //-----------------------

                this.$("#gridSintesisTurnoParos").kendoGrid({
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/accionesMejora/" + self.dataItemSel + "/ParosPerdidas",
                                dataType: "json",
                                contentType: "application/json; charset=utf-8",
                                type: "GET"
                            },
                        },
                        pageSize: 50,
                        schema: {
                            model: {
                                id: "Id",
                                fields: {
                                    Id: { type: "string", editable: false, nullable: false },
                                    Duracion: { type: "date" },
                                    TipoParoPerdida: { type: "string" },
                                    EsParoMayor: { type: "number" },
                                    EsParoMenor: { type: "number" },
                                    EsBajaVelocidad: { type: "number" },
                                    IdLinea: { type: "number" },
                                    FechaTurno: { type: "date" },
                                    IdTipoTurno: { type: "string" },
                                    NombreTipoTurno: { type: "string" },
                                    InicioLocal: { type: "date" },
                                    FinLocal: { type: "date" },
                                    EquipoNombre: { type: "string" },
                                    EquipoConstructivoNombre: { type: "string" },
                                    MotivoNombre: { type: "string" },
                                    CausaNombre: { type: "string" },
                                    Descripcion: { type: "string" },
                                    Observaciones: { type: "string" },
                                    NumeroLineaDescripcion: { type: "string" }
                                }
                            }
                        },
                        error: function (e) {
                            if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            }
                        }
                    },
                    sortable: true,
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    selectable: false,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        buttonCount: 5,
                        pageSizes: [50, 100, 200, 'All'],
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "IdLinea",
                            title: window.app.idioma.t("LINEA"),
                            width: 100,
                            template: window.app.idioma.t("LINEA") + ' #: NumeroLineaDescripcion # - #: DescLinea #',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //return "<div><label><input type='checkbox' style='width: 14px;height:14px;margin-right:5px;'/>h</label></div>";
                                        return "<div><label><input type='checkbox' value='#=IdLinea#' style='width: 14px;height:14px;margin-right:5px;'/>" + window.app.idioma.t('LINEA') + " #= NumeroLineaDescripcion# - #= DescLinea#</label></div>";
                                    }
                                }
                            }

                        },
                        {
                            field: "TipoParoPerdida",
                            title: window.app.idioma.t("TIPO"),
                            width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=TipoParoPerdida#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoParoPerdida#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "FechaTurno", title: window.app.idioma.t("FECHA_TURNO"), width: 100,
                            template: '#if(FechaTurno){# #: kendo.toString(new Date(FechaTurno),"dd/MM/yyyy")# #}#',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "IdTipoTurno",
                            template: "#if(IdTipoTurno){# #: window.app.idioma.t('TURNO'+IdTipoTurno) # #}#",
                            title: window.app.idioma.t("TURNO"),
                            width: 100,
                            //template: "#: CodigoMaquina # - #: Maquina #"
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=IdTipoTurno#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t('TURNO'+IdTipoTurno)#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "InicioLocal", title: window.app.idioma.t("HORAINICIO"), width: 100, filterable: false,
                            //format: "{0:dd/MM/yyyy hh:mm:ss}",
                            template: '#if(InicioLocal){# #: kendo.toString(new Date(InicioLocal),"dd/MM/yyyy HH:mm:ss")# #}#',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: "dd/MM/yyyy HH:mm:ss",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "Duracion",
                            title: window.app.idioma.t("DURACION"),
                            width: 100,
                            format: "{0:HH:mm:ss}",
                            //template: '#if(Duracion){# #: kendo.toString(new Date(Duracion),"HH:mm:ss")# #}#',
                            //template: ' #=  window.app.getDateFormat(MinutosFinal2 * 60) #',
                            filterable: {
                                extra: false,
                                ui: function (element) {
                                    element.kendoTimePicker({
                                        format: "HH:mm:ss",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }

                            }
                        },
                        {
                            field: "EquipoDescripcion",
                            title: window.app.idioma.t("LLENADORA"),
                            width: 100,
                            //template: "#: CodigoMaquina # - #: Maquina #"
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=EquipoDescripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= EquipoDescripcion#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "MotivoNombre",
                            title: window.app.idioma.t("MOTIVO"),
                            width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=MotivoNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= MotivoNombre#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CausaNombre",
                            title: window.app.idioma.t("CAUSA"),
                            width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=CausaNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= CausaNombre#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "MaquinaCausaNombre",
                            title: window.app.idioma.t("MAQUINA_RESPONSABLE"),
                            width: 100,
                            //template: "#: CodigoMaquina # - #: Maquina #"
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=MaquinaCausaNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= MaquinaCausaNombre#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "EquipoConstructivoNombre",
                            title: window.app.idioma.t("EQ_CONSTRUCTIVO"),
                            width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=EquipoConstructivoNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= EquipoConstructivoNombre#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Descripcion",
                            title: window.app.idioma.t("DESCRIPCION"),
                            width: 100,
                            template: "<span class='addTooltip'>#=Descripcion ? Descripcion : ''#</span>",
                            attributes: {
                                style: 'white-space: nowrap ',
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Descripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= Descripcion#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Observaciones",
                            title: window.app.idioma.t("OBSERVACION"),
                            template: "<span class='addTooltip'>#=Observaciones ? Observaciones : ''#</span>",
                            width: 100,
                            attributes: {
                                style: 'white-space: nowrap ',
                            },
                        }
                    ],
                    dataBinding: self.resizeGrid,
                });

                $("#gridSintesisTurnoParos").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");
            },
            getDataSource: function (self) {
                var ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/accionesMejora",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.fInicio = self.inicio;
                                result.fFin = self.fin;
                                result.tipo = 0

                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "id",
                            fields: {
                                id: { type: "number", editable: false, nullable: false },
                                fechaAlta: { type: "date" },
                                fechaTurno: { type: "date" },
                                idTipoTurno: { type: "string" },
                                tipoTurno: { type: "string" },
                                usuario: { type: "string" },
                                fechaFinalizada: { type: "date" },

                                descripcionProblema: { type: "string" },
                                causa: { type: "string" },
                                accionPropuesta: { type: "string" },
                                observaciones: { type: "string" },

                                idLinea: { type: "string" },
                                numeroLinea: { type: "string" },
                                nombreLinea: { type: "string" },

                                idMaquina: { type: "string" },
                                nombreMaquina: { type: "string" },

                                idEquipoConstructivo: { type: "string" },
                                nombreEquipoConstructivo: { type: "string" }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            $("#center-pane").empty();
                        }
                    }
                });

                return ds;
            },
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
                'click #btnExportExcel': 'exportExcel',
                'click #btnCrearAccionMejora': 'crearAccionMejora',
                'click #btnEditar': 'editar',
                'click #btnBorrar': 'confirmarBorrado',
                'click #btnLimpiarFiltrosParos': 'limpiarFiltroGridParos'
            },
            actualiza: function () {
                var self = this;
                $("form.k-filter-menu button[type='reset']").trigger("click");
                self.inicio = $("#dtpFechaDesde").data("kendoDatePicker").value();
                self.fin = $("#dtpFechaHasta").data("kendoDatePicker").value();
                self.ds = self.getDataSource(self);
                $("#gridAccionesMejora").data('kendoGrid').setDataSource(self.ds);
                self.ds.page(1);
            },
            crearAccionMejora: function () {
                var permiso = TienePermiso(28);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                window.location.hash = "CrearAccionMejora/0";
            },
            editar: function (e) {
                var self = this;
                var permiso = TienePermiso(28);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var tr = $(e.target.parentNode.parentNode).closest("tr");
                var data = self.$("#gridAccionesMejora").data("kendoGrid").dataItem(tr);

                self.vista = new VistaEditarAccionMejora(data);
                $('#idSintesisParos').hide();
            },
            eliminar: function () {
                if (this.vista) {
                    this.vista.eliminar();
                }
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            confirmarBorrado: function (e) {
                e.preventDefault()
                var self = this;
                var permiso = TienePermiso(28);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ELIMINAR_ACCION_MEJORA'),
                    msg: window.app.idioma.t('SEGURO_QUE_DESEA'),
                    funcion: function () { self.borrarAccionMejora(e); },
                    contexto: this
                });
            },
            borrarAccionMejora: function (e) {
                var self = this;
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = $("#gridAccionesMejora").data('kendoGrid').dataItem(tr);
                $.ajax({
                    url: "/api/accionesMejora/eliminar/" + data.id,
                    dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                    // send the destroyed data items as the "models" service parameter encoded in JSON                                
                    success: function (result) {
                        // notify the data source that the request succeeded
                        $("#gridAccionesMejora").data('kendoGrid').dataSource.read();
                        $("#gridAccionesMejora").data('kendoGrid').refresh();
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_ELIMINADO_ACCION_MEJORA'), 4000); 
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (e, status, ex) {
                        // notify the data source that the request failed
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ELIMINANDO_UNA_ACCION') + ex, 4000);
                            Backbone.trigger('eventCierraDialogo');
                        }
                    }
                });
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosGrid1Height = $("#divFiltrosParosHeader").innerHeight();
                var filtrosSeparadorGridHeight = $("#divSeparadorGrids").innerHeight();
                var filtrosGrid2Height = $("#divFiltrosAccionesMejora").innerHeight();

                //Grid 1
                var gridElement = $("#gridSintesisTurnoParos"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight / 2 - otherElementsHeight - cabeceraHeight / 2 - filtrosGrid1Height - filtrosSeparadorGridHeight / 2 - 2);

                //Grid 2
                var gridElement2 = $("#gridAccionesMejora"),
                    dataArea2 = gridElement2.find(".k-grid-content"),
                    gridHeight2 = gridElement2.innerHeight(),
                    otherElements2 = gridElement2.children().not(".k-grid-content"),
                    otherElementsHeight2 = 0;
                otherElements2.each(function () {
                    otherElementsHeight2 += $(this).outerHeight();
                });
                dataArea2.height(contenedorHeight / 2 - otherElementsHeight2 - cabeceraHeight / 2 - filtrosGrid2Height - filtrosSeparadorGridHeight / 2 - 2);
            },
            limpiarFiltroGrid: function () {
                $("#gridAccionesMejora").data("kendoGrid").dataSource.filter({});
            },
            limpiarFiltroGridParos: function () {
                $("#gridSintesisTurnoParos").data("kendoGrid").dataSource.filter({});
            },
            exportExcel: function () {
                kendo.ui.progress($("#gridAccionesMejora"), true);
                var grid = $("#gridAccionesMejora").data("kendoGrid");
                grid.saveAsExcel();
                kendo.ui.progress($("#gridAccionesMejora"), false);
            },
        });

        return VistaSintesisParos;
    });
