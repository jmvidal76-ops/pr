define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/ParosPerdidas.html', 'jszip',
    'compartido/notificaciones', 'vistas/vDialogoConfirm', 'vistas/Envasado/vEditarCrearParo'],
    function (_, Backbone, $, PlantillaParosPerdidas, JSZip, Not, VistaDlgConfirm, vistaCrearEditarParo) {
        var VistaParosPerdidas = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            dia: 0,
            turno: 0,
            linea: '',
            fin: new Date(),
            inicio: new Date((new Date()).getTime() - (15 * 24 * 3600 * 1000)),
            template: _.template(PlantillaParosPerdidas),
            filtros: [],
            ds: null,
            opciones: null,
            pantalla: "Paros",
            configuracionCreada: null,
            configuracionBorrada: false,
            initialize: function (options) {
                window.JSZip = JSZip;
                var self = this;
                var splitter = $("#vertical").data("kendoSplitter");

                if (this.id != 'divHTMLContenido') {
                    splitter.bind("resize", function () { self.resizeGrid(self.id); });
                } else {
                    splitter.bind("resize", function () { self.resizeGrid("center-pane"); });
                }

                if (options && options.filtro) {
                    if (options.filtro.dia) {
                        self.dia = options.filtro.dia;
                    }
                    if (options.filtro.fechaTurno) {
                        self.inicio = options.filtro.fechaTurnoInicio;
                        self.fin = options.filtro.fechaTurnoFin;
                    }
                    if (options.filtro.turno) {
                        self.turno = options.filtro.turno;
                    }
                    if (options.filtro.linea) {
                        self.linea = options.filtro.linea;
                    }
                    self.opciones = true;
                } else {
                    self.opciones = false;
                }

                self.render();
            },
            render: function () {
                var self = this;
                $(this.el).html(this.template());

                if (this.id != 'divHTMLContenido') {
                    $("#" + this.id).append($(this.el));
                    this.$("#divFiltrosHeader label").hide()
                    this.$("#dtpFechaDesde").hide();
                    this.$("#dtpFechaHasta").hide();
                    this.$("#selectLinea").hide();
                    this.$("#btnFiltrar").hide();
                    this.$("#divCabeceraVista").hide();
                } else {
                    $("#center-pane").append($(this.el));

                    this.$("#selectLinea").kendoDropDownList({
                        dataValueField: "id",
                        template: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                        valueTemplate: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                        dataSource: new kendo.data.DataSource({
                            data: window.app.planta.lineas,
                            sort: { field: "numLinea", dir: "asc" }
                        }),
                        optionLabel: window.app.idioma.t('SELECCIONE')
                    });
                }

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

                self.filtros = []
                if (self.turno != 0) {
                    self.filtros.push({
                        "field": "IdTipoTurno",
                        "operator": "eq",
                        "value": self.turno.toString()
                    });
                }

                if (self.opciones) {
                    self.renderGrid();

                }
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
            resizeGrid: function (panel) {
                var contenedorHeight = $("#" + panel).innerHeight();
                var cabeceraHeight = 0;
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();

                if (panel == "center-pane") cabeceraHeight = $("#divCabeceraVista").innerHeight();

                var gridElement = $("#gridSeleccionParosPerdidas"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            },
            events: {
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid', // agomezn 270516: 040 Incluir un botón "Limpiar filtros" en las páginas donde se usen filtros
                'click #btnExportExcel': 'exportExcel',
                'click #btnFiltrar': 'actualiza',
                'click #btnCrearParo': 'crearEditarParo',
                'click #btnEditar': 'crearEditarParo',
                'click #btnEliminar': 'eliminaParo'
            },
            crearEditarParo: function (e) {
                var self = this;
                var permiso = TienePermiso(179);

                if (permiso) {
                    self.nuevaVentana = (e.currentTarget.id == "btnCrearParo") ? new vistaCrearEditarParo("0", null) : new vistaCrearEditarParo("1", e);
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                }
            },
            eliminaParo: function (e) {
                var self = this;
                var permiso = TienePermiso(179);

                if (permiso) {
                    //Obtenemos la línea seleccionada del grid
                    var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                    // get the data bound to the current table row
                    var dataRow = self.$("#gridSeleccionParosPerdidas").data("kendoGrid").dataItem(tr);
                    var mensaje = (dataRow.IdTipoParoPerdida === 1) ? window.app.idioma.t('DESEA_REALMENTE_ELIMINAR_PARO') : window.app.idioma.t('DESEA_REALMENTE_ELIMINAR_PERDIDA');
                    var title = (dataRow.IdTipoParoPerdida === 1) ? window.app.idioma.t('ELIMINAR_PARO_MAYOR') : window.app.idioma.t('ELIMINAR_PERDIDA');

                    this.confirmacion = new VistaDlgConfirm({ titulo: title, msg: mensaje, funcion: function () { self.confirmaEliminacion(dataRow); }, contexto: this });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                }
            },
            confirmaEliminacion: function (dataRow) {
                var self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/eliminarParoPerdida/" + dataRow.Id,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: false,
                }).done(function (res) {
                    Backbone.trigger('eventCierraDialogo');

                    if (res) {
                        $("#gridSeleccionParosPerdidas").data('kendoGrid').dataSource.read();
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PARO_ELIMINADO'), 3000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), res.message, 2000);
                    }
                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ELIMINANDO_EL_PARO'), 2000);
                });
            },
            LimpiarFiltroGrid: function () {
                var self = this;
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            exportExcel: function () {
                kendo.ui.progress($("#gridSeleccionParosPerdidas"), true);
                var grid = $("#gridSeleccionParosPerdidas").data("kendoGrid");
                grid.saveAsExcel();
                kendo.ui.progress($("#gridSeleccionParosPerdidas"), false);
            },
            actualiza: function () {
                var self = this;

                if ($("#selectLinea").val() == '') {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_SELECCIONE_LINEA'), 3000);
                    return;
                }

                var valorOpcSel = this.$("#selectLinea option:selected").val();
                var linea = $("#selectLinea").data("kendoDropDownList").dataSource.get(valorOpcSel);
                //kendo.ui.progress($("#gridSeleccionParosPerdidas"), true);

                self.inicio = $("#dtpFechaDesde").data("kendoDatePicker").value();
                self.fin = $("#dtpFechaHasta").data("kendoDatePicker").value();
                self.linea = linea.numLinea;

                if (!self.inicio || !self.fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LAS_FECHAS_INTRODUCIDAS'), 3000);
                    return;
                }

                if (self.inicio > self.fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('_LA_FECHA'), 3000);
                    return;
                }

                if ($("#gridSeleccionParosPerdidas").data("kendoGrid") !== undefined) {
                    self.ds = self.getDataSource(self);
                    $("#gridSeleccionParosPerdidas").data('kendoGrid').setDataSource(self.ds);
                    $("#gridSeleccionParosPerdidas").data('kendoGrid').dataSource.read();
                } else {
                    self.renderGrid();
                }

                $("#gridSeleccionParosPerdidas").data('kendoGrid').dataSource.page(1);
                $("#btnCrearParo").show();
            },
            getDataSource: function (self) {
                var ds = new kendo.data.DataSource({
                    pageSize: 50,
                    //type: 'odata',
                    transport: {
                        read: {
                            url: "../api/GetParosPerdidasLlenadoraInterval",
                            type: "POST",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            async: true
                        },
                        parameterMap: function (model, operation) {
                            if (operation === "read") {
                                var result = {};

                                result.fInicio = self.inicio;
                                result.fFin = self.fin;
                                result.linea = self.linea
                                result.filtros = self.opciones;
                                return JSON.stringify(result);
                            }

                            return kendo.stringify(options);
                        }
                    },
                    filter: self.filtros,
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                Id: { type: "string", editable: false, nullable: false },
                                IdTipoParoPerdida: { type: "number" },
                                TipoParoPerdida: { type: "string" },
                                IdLinea: { type: "number" },
                                NumeroLineaDescripcion: { type: "string" },
                                DescLinea: { type: "string" },
                                Turno: { type: "string" },
                                FechaTurno: { type: "date" },
                                IdTipoTurno: { type: "string" },
                                NombreTipoTurno: { type: "string" },
                                InicioLocal: { type: "date" },
                                FinLocal: { type: "date" },
                                EquipoNombre: { type: "string" },
                                EquipoDescripcion: { type: "string" },
                                EquipoConstructivoNombre: { type: "string" },
                                EquipoConstructivoId: { type: "string" },
                                MaquinaCausaId: { type: "string" },
                                MaquinaCausaNombre: { type: "string" },
                                MotivoNombre: { type: "string" },
                                CausaNombre: { type: "string" },
                                Descripcion: { type: "string" },
                                Observaciones: { type: "string" },
                                Duracion: { type: "date" },
                                DuracionSegundos: { type: "number" },
                                DuracionMenores: { type: "number" },
                                DuracionBajaVel: { type: "number" },
                                NumeroParoMenores: { type: "number" },
                                MotivoID: { type: "number" },
                                CausaID: { type: "number" },
                                EquipoId: { type: "string" },
                                Justificado: { type: "number" },
                                NumOT: { type: "number" }
                            },
                            getDuracion: function () {
                                if (this.IdTipoParoPerdida == 1) {
                                    return window.app.getDateFormat(this.DuracionParoMayor);
                                }

                                return window.app.getDateFormat(this.DuracionBajaVelocidad + this.DuracionParosMenores);
                            },
                        },
                        parse: function (data) {
                            var stringLinea = window.app.idioma.t('LINEA');
                            for (var i = 0; i < data.length; i++) {
                                data[i].DescLinea = stringLinea + " " + data[i].NumeroLineaDescripcion + " - " + data[i].DescLinea;
                            }

                            return data;
                        }
                    },
                    requestStart: function () {
                        var a = self.$("#gridSeleccionParosPerdidas").data("kendoGrid");
                        if (self.ds.data().length == 0) {
                            kendo.ui.progress($("#gridSeleccionParosPerdidas"), true);
                        }
                    },
                    requestEnd: function () {
                        kendo.ui.progress($("#gridSeleccionParosPerdidas"), false);
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);

                            if (self.id != 'divHTMLContenido') {
                                $("#" + this.id).empty();
                            } else {
                                $("#center-pane").empty();
                            }
                        }
                    }
                });

                return ds;
            },
            renderGrid: function () {
                var self = this;
                self.ds = self.getDataSource(self);

                var grid = this.$("#gridSeleccionParosPerdidas").kendoGrid({
                    excel: {
                        fileName: "ParosPerdidas.xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    toolbar: kendo.template($("#toolbarTemplate").html()),
                    dataSource: self.ds,
                    sortable: true,
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    selectable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            command:
                            {
                                template: "<a id='btnEditar' class='k-button k-grid-edit' style='min-width:16px;'><span class='k-icon k-edit'></span></a>"
                            },
                            title: window.app.idioma.t("EDITAR"),
                            field: "Editar",
                            exportable: { excel: false },
                            width: 40,
                        },
                        {
                            command:
                            {
                                template: "<a id='btnEliminar' class='k-button k-grid-delete' style='min-width:16px;'><span class='k-icon k-delete'></span></a>"
                            },
                            title: window.app.idioma.t("ELIMINAR"),
                            field: "Eliminar",
                            exportable: { excel: false },
                            width: 40
                        },
                        {
                            field: "DescLinea",//"IdLinea"
                            title: window.app.idioma.t("LINEA"),
                            width: 130,
                            template: "#=DescLinea#",
                            _excelOptions: {
                                width: 180,
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=DescLinea#' style='width: 14px;height:14px;margin-right:5px;'/>#=DescLinea#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "InicioLocal",
                            title: window.app.idioma.t("FECHA_INICIO"),
                            width: 90,
                            format: "{0:" + kendo.culture().calendar.patterns.MES_FechaHora + "}",
                            _excelOptions: {
                                width: 140,
                                format: "dd/mm/yy hh:mm:ss",
                                template: "#=GetDateForExcel(value.InicioLocal)#"
                            },
                            filterable: {
                                extra: true, // agomezn 300516: 010 Al filtrar los log por fecha no sale nada no tiene el mismo formato de fecha
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "IdTipoTurno",
                            template: "#if(IdTipoTurno){# #: window.app.idioma.t('TURNO'+IdTipoTurno) # #}#",
                            title: window.app.idioma.t("TURNO"),
                            width: 90,
                            _excelOptions: {
                                width: 80,
                                template: "#if(value.IdTipoTurno){# #: window.app.idioma.t('TURNO'+ value.IdTipoTurno) # #}#"
                            },
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
                            field: "IdTipoParoPerdida",
                            title: window.app.idioma.t("TIPO"),
                            template: "#=TipoParoPerdida#",
                            width: 100,
                            _excelOptions: {
                                width: 150,
                                template: "#=(value.IdTipoParoPerdida == 1 ? window.app.idioma.t('PARO_MAYOR') : value.IdTipoParoPerdida == 2 ? window.app.idioma.t('PERDIDAS_PRODUCCION') : '')#"
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdTipoParoPerdida#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoParoPerdida#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Duracion",
                            title: window.app.idioma.t("DURACION"),
                            width: 105,
                            format: "{0:HH:mm:ss}",
                            _excelOptions: {
                                width: 100,
                                format: "[hh]:mm:ss",
                                template: "#=GetSecondsForExcel(value.Duracion)#"
                            },
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
                            field: "EquipoNombre",
                            title: window.app.idioma.t("COD_LLENADORA"),
                            width: 80,
                            _excelOptions: {
                                width: 130,
                            },
                            //hidden: true
                        },
                        {
                            field: "EquipoDescripcion",
                            title: window.app.idioma.t("LLENADORA"),
                            width: 90,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=EquipoDescripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= EquipoDescripcion#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "MotivoNombre",
                            title: window.app.idioma.t("MOTIVO"),
                            width: 80,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=MotivoNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= MotivoNombre#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CausaNombre",
                            title: window.app.idioma.t("CAUSA"),
                            width: 80,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=CausaNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= CausaNombre#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "MaquinaCausaId",
                            title: window.app.idioma.t("COD_MAQUINA_RESPONSABLE"),
                            width: 80,
                            _excelOptions: {
                                width: 100,
                            },
                            //hidden: true
                        },
                        {
                            field: "MaquinaCausaNombre",
                            title: window.app.idioma.t("MAQUINA_RESPONSABLE"),
                            width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=MaquinaCausaNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= MaquinaCausaNombre#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "EquipoConstructivoId",
                            title: window.app.idioma.t("COD_EQ_CONSTRUCTIVO"),
                            width: 80,
                            _excelOptions: {
                                width: 100,
                            },
                            //hidden: true
                        },
                        {
                            field: "EquipoConstructivoNombre",
                            title: window.app.idioma.t("EQ_CONSTRUCTIVO"),
                            width: 100,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
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
                        },
                        {
                            field: "NumOT",
                            title: window.app.idioma.t("NUM_OT"),
                            template: "#= (NumOT ? NumOT : '')#",
                            width: 80,
                        }
                    ],
                    dataBinding: function (e) {
                        if (self.id == 'divHTMLContenido') {
                            self.resizeGrid("center-pane");
                        } else {
                            self.resizeGrid(self.id);
                        }                     
                    },
                })
                .data("kendoGrid");

                self.initToolbar(grid);

                grid._findColumnByField = function (field) {
                    /// <summary>
                    /// Find a column by column binding field.
                    /// </summary>
                    let result = null;
                    let idx = 0;

                    while (result == null && idx < this.columns.length) {
                        let column = this.columns[idx];

                        if (column.field === field) {
                            result = column;
                        }

                        idx++;
                    }

                    return result;
                };

                $("#gridSeleccionParosPerdidas").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

                grid.bind("excelExport", function (e) {

                    ExcelGridExtra(e);

                });

                window.app.headerGridTooltip(grid);
            },
            initToolbar: function (grid) {

                // Cargamos las columnas en el menú
                let columnMenu = $("#columnMenu");
                let idx = 0;
                let self = this;

                // Si la toolbar ya está iniciada no la iniciamos de nuevo
                if ($("#columnMenu[data-role='menu']").length > 0) {
                    return;
                }

                let columnMenuContainer = columnMenu.find(".columnMenuContainer")

                for (let column of grid.columns) {
                    // A column must have a title to be added.
                    if ($.trim(column.title).length > 0) {
                        // Add columns to the column menu.
                        columnMenuContainer.append(kendo.format("<li><input type='checkbox' readonly data-index='{0}' data-field='{1}' data-title='{2}' {3}>&emsp;{4}</li>",
                            idx, column.field, column.title, column.hidden ? "" : "checked", column.title));
                    }
                    idx++;
                }

                columnMenu.kendoMenu({
                    closeOnClick: false,
                    select: function (e) {
                        // Get the selected column.
                        let item = $(e.item), input, columns = grid.columns;
                        input = item.find(":checkbox");
                        if (input.attr("disabled") || item.attr("data-role") === "menutitle") {
                            return;
                        }

                        input.prop("checked", !input.is(":checked"));

                        //let column = grid._findColumnByTitle(input.attr("data-title"));
                        let column = grid._findColumnByField(input.attr("data-field"));

                        // If checked, then show the column; otherwise hide the column.
                        if (input.is(":checked")) {
                            grid.showColumn(column);
                        } else {
                            grid.hideColumn(column);
                        }
                    }
                });

                // Cargamos el listado de configuraciones
                self.cargarConfiguracionesColumnas();

                // Inicializamos los botones de crear y eliminar configuaciones
                $("#saveSetting").kendoButton({
                    click: function (e) {
                        e.preventDefault();

                        // Mostramos el dialogo para introducir el nombre de la configuración
                        self.mostrarModalCrearConfiguracion();                        
                    }
                });

                $("#deleteSetting").kendoButton({
                    click: function (e) {
                        e.preventDefault();

                        // Mostramos el dialogo para borrar la configuracion
                        self.mostrarModalEliminarConfiguracion();
                    }
                });
                
            },
            cambiarConfiguracionColumnas: function (config) {
                let elems = config.split(";");

                $("#columnMenu input:checked").parent().parent().click()

                for (let i of elems) {
                    let elem = $("#columnMenu input[data-field= '" + i + "']").parent().parent()
                    elem.click();
                    elem.removeClass("k-state-hover");
                        //.prop("checked", true);
                }
            },
            cargarConfiguracionesColumnas: function () {
                let self = this;

                $("#cmbSavedSetting").kendoDropDownList({
                    dataTextField: "Nombre",
                    dataValueField: "Id",
                    optionLabel: window.app.idioma.t('POR_DEFECTO'),
                    dataSource: new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: "../api/general/ConfiguracionesVisualizacionColumnas/" + self.pantalla + "/",
                                dataType: "json"                                
                            }
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), (window.app.idioma.t('ERROR_OBTENER_CONFIGURACIONES_COLUMNAS') || "").replace("#PANTALLA", self.pantalla), 4000);
                            }
                        }
                    }),
                    height: 200,
                    dataBound: function (e) {
                        if (self.configuracionCreada != null) {
                            let config = Array.from(e.sender.dataSource.data()).filter(f => f.Nombre == self.configuracionCreada.Nombre)
                            if (config.length > 0) {
                                e.sender.value(config[0].Id);
                                e.sender.trigger("change");
                            }
                            $("#deleteSetting").getKendoButton().enable(true);
                            self.configuracionCreada == null;                            
                        }
                        else {
                            $("#deleteSetting").getKendoButton().enable(false);
                            if (self.configuracionBorrada) {
                                self.configuracionBorrada = false;
                                e.sender.trigger("change");
                            }
                        }
                    },
                    change: function (e) {
                        let config = e.sender.dataItem();
                        let columnasVisibles = "";

                        if (config.Configuracion != null)
                        {
                            $("#deleteSetting").getKendoButton().enable(true);
                            columnasVisibles = config.Configuracion;
                        }
                        else
                        {
                            $("#deleteSetting").getKendoButton().enable(false);
                            $("#columnMenu input").each(function (idx, elem) {
                                columnasVisibles += $(elem).data("field") + ";";
                            });

                            columnasVisibles = columnasVisibles.slice(0, -1);
                        }

                        self.cambiarConfiguracionColumnas(columnasVisibles);
                    }
                });
            },
            mostrarModalCrearConfiguracion: function (e) {
                let self = this;
                //Creamos el div donde se va a pintar la ventana modal
                $("body").prepend($("<div id='dlgGestion'></div>"));

                let title = window.app.idioma.t('CREAR_CONFIGURACION_VISUALIZACION_COLUMNAS');
                let template = "../portal/Envasado/html/CrearConfiguracionVisualizacionColumnas.html";
                let width = "400px";
                let height = "";

                let ventanaGestion = $("#dlgGestion").kendoWindow(
                    {
                        title: title,
                        width: width,
                        height: height,
                        content: template,
                        modal: true,
                        resizable: false,
                        draggable: false,
                        scrollable: false,
                        close: function () {
                            ventanaGestion.destroy();
                        },
                        refresh: function () {

                            //Modificamos los botones aceptar y cancelar para que sean más pequeños en el portal
                            $("#dlgGestion").find(".boton").removeClass("boton");

                            $("#lblNombre").text(window.app.idioma.t('NOMBRE'));

                            $("#btnDialogoAceptar").val(window.app.idioma.t('ACEPTAR'));
                            $("#btnDialogoCancelar").val(window.app.idioma.t('CANCELAR'));

                            $("#btnDialogoAceptar").kendoButton({
                                click: function () {
                                    $("#trError").hide();
                                    // Faltan campos por rellenar
                                    if (!ValidarFormulario("CrearConfiguracionVisualizacionColumnas")) {
                                        $("#trError").text(ObtenerCamposObligatorios("CrearConfiguracionVisualizacionColumnas"));
                                        $("#trError").show();
                                        return;
                                    }

                                    let columnasVisibles = "";

                                    $("#columnMenu input:checked").each(function (idx, elem) {
                                        columnasVisibles += $(elem).data("field") + ";";
                                    });

                                    columnasVisibles = columnasVisibles.slice(0, -1);

                                    let datos = {
                                        Nombre: $("#tbNombre").val(),
                                        Pantalla: self.pantalla,
                                        Configuracion: columnasVisibles
                                    }

                                    self.guardarConfiguracionColumnas(datos);
                                }
                            });

                            $("#btnDialogoCancelar").kendoButton({
                                click: function (e) {
                                    e.preventDefault();
                                    ventanaGestion.close();
                                }
                            });

                            if (typeof ventanaGestion != "undefined") {
                                ventanaGestion.center();
                            }
                        }
                    }).getKendoWindow();
            },
            mostrarModalEliminarConfiguracion: function () {
                let self = this;

                //Obtenemos los datos de la configuracion  actual
                let config = $("#cmbSavedSetting").getKendoDropDownList().dataItem();

                if (isNaN(config.Id)) {
                    return;
                }

                // Creamos la ventana para confirmar la eliminación usando la función de Utils
                OpenWindow(window.app.idioma.t('ELIMINAR_CONFIGURACION_VISUALIZACION_COLUMNAS'),
                    window.app.idioma.t('SEGURO_BORRAR_CONFIGURACION_VISUALIZACION_COLUMNAS'),
                    function () { self.eliminarConfiguracionColumnas(config.Id); },
                );
            },
            guardarConfiguracionColumnas: function (datos) {
                let self = this;

                kendo.ui.progress($(".k-window"), true)

                $.ajax({
                    type: "POST",
                    url: "../api/general/ConfiguracionesVisualizacionColumnas",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(datos),
                    complete: function () {
                        kendo.ui.progress($(".k-window"), false);
                        $("#dlgGestion").getKendoWindow().close();
                    },
                    success: function (res) {
                        if (res) {
                            $("#cmbSavedSetting").getKendoDropDownList().dataSource.read();
                            self.configuracionCreada = datos;
                            Not.crearNotificacion('success', 'Paros', (window.app.idioma.t('SE_HA_CREADO_CONFIGURACION_VISUALIZACION_COLUMNAS') || "").replace("#PANTALLA", self.pantalla), 4000);
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), (window.app.idioma.t('ERROR_GUARDAR_CONFIGURACION_VISUALIZACION_COLUMNAS') || "").replace("#PANTALLA", self.pantalla), 4000);
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), (window.app.idioma.t('ERROR_GUARDAR_CONFIGURACION_VISUALIZACION_COLUMNAS') || "").replace("#PANTALLA", self.pantalla), 4000);
                        }
                    }
                });
            },
            eliminarConfiguracionColumnas: function (id) {
                let self = this;

                kendo.ui.progress($(".k-window"), true)

                $.ajax({
                    type: "DELETE",
                    url: "../api/general/ConfiguracionesVisualizacionColumnas/" + id + "/",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    complete: function () {
                        kendo.ui.progress($(".k-window"), false);
                        $("#dlgGestion").getKendoWindow().close();
                    },
                    success: function (res) {
                        if (res) {
                            $("#cmbSavedSetting").getKendoDropDownList().dataSource.read();
                            self.configuracionCreada = null;
                            self.configuracionBorrada = true;
                            Not.crearNotificacion('success', 'Paros', (window.app.idioma.t('SE_HA_ELIMINADO_CONFIGURACION_VISUALIZACION_COLUMNAS') || "").replace("#PANTALLA", self.pantalla), 4000);
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), (window.app.idioma.t('ERROR_ELIMINAR_CONFIGURACION_VISUALIZACION_COLUMNAS') || "").replace("#PANTALLA", self.pantalla), 4000);
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), (window.app.idioma.t('ERROR_ELIMINAR_CONFIGURACION_VISUALIZACION_COLUMNAS') || "").replace("#PANTALLA", self.pantalla), 4000);
                        }
                    }
                });
            }
        });

        return VistaParosPerdidas;
    });