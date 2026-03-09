define(['underscore', 'backbone', 'jquery', 'vistas/trazabilidad/vComponentProduccionesEditDialog', 'vistas/trazabilidad/vComponentProduccionesMateriales',
        'vistas/vDialogoConfirm', 'compartido/notificaciones', "jszip", "definiciones"],
    function (_, Backbone, $, dialogEdit, dialogMateriales, VistaDlgConfirm, Not, JSZip, definiciones) {
        var checkedIds;
        var gridGestionTriggers = Backbone.View.extend({
            tagName: 'div',
            id: 'gridProducciones',
            ds: null,
            grid: null,
            dialogEdit: null,
            dialogMat: null,
            trazaServer: null,
            fin: null,
            inicio: null,
            filtrosData: null,
            resizeFunction: null,
            constEstadoProducciones: definiciones.EstadoProducciones(),
            initialize: function (filtros, resizeFunction) {
                //reset default values
                this.fin = new Date(),
                this.inicio = new Date((new Date()).getTime() - (2 * 24 * 3600 * 1000)),
                this.filtrosData = {
                    WO: '',
                    hiddenColumns: true,
                    hiddenToolBar: false
                };

                for (var prop in filtros) {
                    this.filtrosData[prop] = filtros[prop];
                }

                this.trazaServer = window.app.section.getAppSettingsValue('HostApiTrazabilidad');
                this.resizeFunction = resizeFunction;
            },
            render: function () {
                checkedIds = [];
                var self = this;
                window.JSZip = JSZip;
                var url = "../api/Produccion/" + kendo.toString(self.inicio, "yyyyMMddHHmmss") + "/" + kendo.toString(self.fin, "yyyyMMddHHmmss");
                if (self.filtrosData.WO != '') {
                    url = "../api/ProduccionInfo/" + self.filtrosData.WO + "/";
                }

                self.dataSourceProducciones(self, url);

                $("#dtpProdFechaDesde").kendoDateTimePicker({
                    value: self.inicio,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#dtpProdFechaHasta").kendoDateTimePicker({
                    value: self.fin,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#btnProdFiltrarFechas").click(function () {
                    self.filtrarFechas();
                });

                $("#btnProdDescripciones").click(function () {
                    self.mostrarDescripciones();
                });

                $("#btnProdLimpiarFiltros").click(function () {
                    self.limpiarFiltroGrid();
                });

                $("#btnProdExportExcel").click(function () {
                    self.exportExcel();
                });

                $("#btnModificarFecha").click(function () {
                    self.modificarFecha();
                });

                $("#btnParticion").click(function () {
                    self.editarParticion();
                });

                $("#btnAnular").click(function (e) {
                    self.anularHabilitarETQ(e);
                });

                $("#btnHabilitar").click(function (e) {
                    self.anularHabilitarETQ(e);
                });

                self.renderGrid();

                //bind click event to the checkbox
                self.grid.table.on("click", ".checkbox", self.selectRow);

                return self; // enable chained calls
            },
            dataSourceProducciones: function (self, url) {
                console.log("URL. " + url);
                self.ds = new kendo.data.DataSource({
                    batch: false,
                    async: true,
                    pageSize: 500,
                    transport: {
                        read: {
                            url: url,
                            dataType: "json" // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        }
                    },
                    requestEnd: function (e) { },
                    schema: {
                        model: {
                            id: "IdProduccion",
                            fields: {
                                EtiquetaCreatedAt: { type: "date" },
                                SSCC: { type: "string" },
                                Linea: { type: "string" },
                                Referencia: { type: "string" },
                                ParticionWO: { type: "string" },
                                LoteJDE: { type: "string" },
                                IdLoteMes: { type: "string" },
                                Estado: { type: "string" },
                                IdMotivoBloqueo: { type: "string" },
                                MotivoBloqueo: { type: "string" },
                                Picos: { type: "number" },
                                LastModifiedMes: { type: "string" },
                                LastModifiedMesAt: { type: "date" },
                                CreatedAt: { type: "date" },
                                CodigoCaja: { type: "string" },
                                EtiquetaProducedAt: { type: "date" },
                                MuestraTomada: { type: "boolean" },
                            }
                        }
                    },

                    sort: { field: "EtiquetaProducedAt", dir: "desc" }
                });
            },
            renderGrid: function () {
                var self = this;

                if (self.filtrosData.hiddenToolBar) {
                    $('#divProdFiltrosHeader').hide();
                } else {
                    $('#divProdFiltrosHeader').show();
                }

                self.grid = $(self.el).kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t('PRODUCCIONES') + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    dataSource: self.ds,
                    dataBound: self.resizeFunction,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    height: "100%",
                    sortable: true,
                    resizable: true,
                    pageable: {
                        refresh: false,
                        pageSizes: true,
                        pageSizes: [500, 1000, 'All'],
                        previousNext: true,
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            width: 30, hidden: self.filtrosData.hiddenColumns, template: "<input type='checkbox' class='checkbox' />", headerTemplate: "<input id='checkSelectAll' type='checkbox' />"
                        },
                        {
                            field: "EtiquetaCreatedAt", title: window.app.idioma.t('FECHA_CREACION'), width: 150, format: "{0:dd/MM/yyyy HH:mm:ss}",
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: "dd/MM/yyyy HH:mm:ss",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "EtiquetaProducedAt", title: window.app.idioma.t('FECHA_PRODUCCION'), width: 165, format: "{0:dd/MM/yyyy HH:mm:ss}",
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: "dd/MM/yyyy HH:mm:ss",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "SSCC", title: "SSCC", width: 160,
                            template: function (dataItem) {
                                if (dataItem.MuestraTomada) {
                                    return "<span style='color:white; background-color:green; padding: 4px; border-radius: 4px'>" + dataItem.SSCC + "</span>";
                                } else {
                                    return "<span>" + dataItem.SSCC + "</span>";
                                }
                             },
                            filterable: {
                                multi: false,
                            }
                        },
                        {
                            field: "Linea", title: window.app.idioma.t('LINEA'), filterable: false, width: 85,
                            hidden: self.filtrosData.hiddenColumns,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes 
                                        return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#=  window.app.idioma.t('LINEA')  # #= Linea #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Referencia", title: window.app.idioma.t('PRODUCTO'), width: 105, hidden: self.filtrosData.hiddenColumns,
                        },
                        {
                            field: "CodigoCaja", title: window.app.idioma.t('CODIGO_CAJA'), width: 125, hidden: self.filtrosData.hiddenColumns,
                        },
                        {
                            field: "ParticionWO", title: window.app.idioma.t('WO'), width: 150, filterable: true, hidden: self.filtrosData.hiddenColumns
                        },
                        {
                            field: "LoteJDE", title: window.app.idioma.t('LOTE_JDE'), filterable: true, width: 120, hidden: self.filtrosData.hiddenColumns
                        },
                        {
                            field: "IdLotMes", title: window.app.idioma.t('LOTE_MES'), filterable: true, width: 160,
                        },
                        {
                            field: "Estado", title: window.app.idioma.t('ESTADO'), filterable: false, width: 95,
                            template: function (data) {
                                return self.obtenerColorSemaforo(data);
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        //return "<div><label><input type='checkbox' value='#=Estado#' style='width: 14px;height:14px;margin-right:5px;'/>#= Estado == window.app.idioma.t('CORRECTA').toUpperCase() ? window.app.idioma.t('CORRECTA') : Estado == window.app.idioma.t('EN_ESPERA').toUpperCase() ?  window.app.idioma.t('EN_ESPERA') : window.app.idioma.t('ERRONEA') #</label></div>";
                                        return "<div><label><input type='checkbox' value='#=Estado#' style='width: 14px;height:14px;margin-right:5px;'/>#= Estado #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "IdMotivoBloqueo",
                            title: window.app.idioma.t('BLOQUEO'),
                            width: 100,
                            hidden: self.filtrosData.hiddenColumns,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes 
                                        return "<div><label><input type='checkbox' value='#=IdMotivoBloqueo#' style='width: 14px;height:14px;margin-right:5px;'/>#= MotivoBloqueo #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Picos", title: window.app.idioma.t('PICOS'), width: 85,
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
                            field: "LastModifiedMes", title: window.app.idioma.t('ULT_ACC_MES'), width: 155, hidden: self.filtrosData.hiddenColumns,
                            filterable: {
                                multi: true
                            }
                        },
                        {
                            field: "LastModifiedMesAt", title: window.app.idioma.t('ULT_MODIFICACION'), width: 155, format: "{0:" + kendo.culture().calendar.patterns.MES_FechaHora + "}", filterable: false, hidden: self.filtrosData.hiddenColumns,
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendar.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        }
                    ],
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];
                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];
                                //e.sender.columns[0]
                                //field: "EtiquetaCreatedAt"
                                row.cells[0].value = kendo.toString(row.cells[0].value, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                //field: "EtiquetaProducedAt"
                                row.cells[1].value = kendo.toString(row.cells[1].value, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                //field: "IdMotivoBloqueo"
                                row.cells[10].value = e.data[dataPosition].MotivoBloqueo;
                                //field: "LastModifiedMesAt"
                                row.cells[13].value = kendo.toString(row.cells[13].value, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                            } catch (e) { }
                        }
                    }
                }).data("kendoGrid");
                //on page change reset selected
                $(self.el).find(".k-pager-numbers").on("click", function () {
                    $("#checkSelectAll").prop('checked', false);
                    checkedIds = [];
                });
                $(self.el).find(".k-pager-nav").on("click", function () {
                    $("#checkSelectAll").prop('checked', false);
                    checkedIds = [];
                });
                $(self.el).find(".k-pager-sizes").on("click", function () {
                    $("#checkSelectAll").prop('checked', false);
                    checkedIds = [];
                });

                window.app.headerGridTooltip(self.grid);
            },
            refreshGrid: function (dataSource) {
                var self = window.app.vista.component;
                $("#checkSelectAll").prop('checked', false);
                checkedIds = [];

                $("#gridProducciones").data('kendoGrid').dataSource.filter({});

                $("#gridProducciones").data('kendoGrid').setDataSource(dataSource || self.ds);
                if (!dataSource) {
                    $("#gridProducciones").data('kendoGrid').dataSource.read();
                }
            },
            events: {
                'click #checkSelectAll': 'selectRowAll',
            },
            filtrarFechas: function () {
                this.inicio = $("#dtpProdFechaDesde").data("kendoDateTimePicker").value();
                this.fin = $("#dtpProdFechaHasta").data("kendoDateTimePicker").value();

                var url = "../api/Produccion/" + kendo.toString(this.inicio, "yyyyMMddHHmmss") + "/" + kendo.toString(this.fin, "yyyyMMddHHmmss");
                this.dataSourceProducciones(this, url);
                this.refreshGrid(this.ds);
            },
            mostrarDescripciones: function () {
                //Creamos el div donde se va a pintar la ventana modal
                $("#center-pane").prepend($("<div id='windowDescripciones'></div>"));

                let ventanaDescripciones = $("#windowDescripciones").kendoWindow(
                    {
                        title: window.app.idioma.t('DESCRIPCION_ESTADOS_BLOQUEOS'),
                        width: "860px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        close: function () {
                            ventanaDescripciones.getKendoWindow().destroy();
                        },
                        refresh: function () {
                        }
                    });

                let template = kendo.template($("#templateDescripEstadosBloqueos").html());
                ventanaDescripciones.getKendoWindow()
                    .content(template({}))
                    .center().open();
            },
            exportExcel: function () {
                var self = this;
                kendo.ui.progress($("#gridProducciones"), true);
                var grid = $(self.el).data("kendoGrid");
                grid.saveAsExcel();
                kendo.ui.progress($("#gridProducciones"), false);
            },
            limpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            modificarFecha: function () {
                var self = this;
                var permiso = TienePermiso(141);
                var noValido = false;

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                if (checkedIds.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 3000);
                    return;
                }

                if (checkedIds[0].Linea == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SIN_LINEA_ASOCIADA'), 3000);
                    return;
                }

                $.each(checkedIds, function (index, item) {
                    if (item.Estado == self.constEstadoProducciones.EnEspera.value || item.Estado == self.constEstadoProducciones.AnuladaMES.value ||
                        item.Estado == self.constEstadoProducciones.EliminadaJDE.value) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_MODIFICAR_FECHA'), 3000);
                        noValido = true;
                        return false;
                    }

                    if (item.IdMotivoBloqueo == 'N') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_MODIFICAR_FECHA_BLOQUEO'), 3000);
                        noValido = true;
                        return false;
                    }
                });

                if (noValido) return;

                //Creamos el div donde se va a pintar la ventana modal
                $("body").prepend($("<div id='divModalFecha'></div>"));

                self.configurarModal();

                self.ventanaModal = $('#divModalFecha').data("kendoWindow");
                if (typeof self.ventanaModal != "undefined") {
                    self.ventanaModal.center();
                }
            },
            configurarModal: function () {
                var self = this;

                $("#divModalFecha").kendoWindow(
                    {
                        title: window.app.idioma.t('MODIFICAR_FECHA'),
                        width: "330px",
                        height: "130px",
                        content: "Trazabilidad/html/EditarFechaProduccion.html",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        scrollable: false,
                        close: function () {
                            self.ventanaModal.destroy();
                            self.ventanaModal = null;
                        },
                        refresh: function () {
                            self.cargarContenido();
                        }
                    });
            },
            cargarContenido: function () {
                var self = this;

                $("#lblFecha").text(window.app.idioma.t('FECHA'));
                $("#trError").hide();

                $("#dpFecha").kendoDateTimePicker({
                    value: checkedIds[0].EtiquetaProducedAt,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                })

                $("#btnCancelarFecha").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        self.ventanaModal.close();
                    }
                });

                $("#btnAceptarFecha").kendoButton({
                    click: function () {
                        var fecha = $("#dpFecha").getKendoDateTimePicker().value().toISOString();

                        if (fecha == null) {
                            $("#trError").show();
                            $("#trError").text(window.app.idioma.t('ERROR_FECHA_VACIA'));
                            return;
                        }

                        var datos = {
                            Producciones: checkedIds,
                            FechaProduccion: fecha
                        };

                        $.ajax({
                            data: JSON.stringify(datos),
                            type: "PUT",
                            url: "../api/modificarFechaProduccion/",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function (res) {
                                Backbone.trigger('eventCierraDialogo');
                                if (res) {
                                    self.refreshGrid();
                                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_OPERACION_SE'), 3000);
                                } else {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_GUARDAR_FECHA'), 3000);
                                }
                            },
                            error: function (response) {
                                if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                } else {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_GUARDAR_FECHA'), 3000);
                                }
                                Backbone.trigger('eventCierraDialogo');
                            }
                        });

                        self.ventanaModal.close();
                    }
                });
            },
            editarParticion: function () {
                this.editarTemplate('PARTICION');
            },
            editarTemplate: function (type) {
                var self = this;
                var permiso = TienePermiso(141);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                if (checkedIds.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 3000);
                    return;
                }

                if (checkedIds[0].Linea == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SIN_LINEA_ASOCIADA'), 3000);
                    return;
                }

                if (type === 'PARTICION') {
                    for (var i = 1; i < checkedIds.length; i++) {
                        if (checkedIds[i].Linea != checkedIds[i - 1].Linea || checkedIds[i].Referencia != checkedIds[i - 1].Referencia) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EDITAR_PRODUC_DIF'), 3000);
                            return;
                        }
                    }
                }

                //var selectedItem = self.grid.dataItem(self.grid.select());

                this.dialogEdit = new dialogEdit(self.refreshGrid, { typeEdition: type, selectArr: checkedIds });
            },
            anularHabilitarETQ: function (e) {
                var self = this;
                var esAnular = e.currentTarget.id == "btnAnular";

                var permiso = TienePermiso(141);
                var noValido = false;

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                if (checkedIds.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 3000);
                    return;
                }

                if (checkedIds[0].Linea == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SIN_LINEA_ASOCIADA'), 3000);
                    return;
                }

                if (esAnular) {
                    $.each(checkedIds, function (index, item) {
                        if (item.Estado == self.constEstadoProducciones.AnuladaMES.value || item.Estado == self.constEstadoProducciones.EliminadaJDE.value) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_ANULAR_ETIQUETAS'), 3000);
                            noValido = true;
                            return false;
                        }
                    });
                } else {
                    $.each(checkedIds, function (index, item) {
                        if (item.Estado == self.constEstadoProducciones.EnEspera.value || item.Estado == self.constEstadoProducciones.CorrectaMESJDE.value ||
                            item.Estado == self.constEstadoProducciones.HabilitadaMES.value || item.Estado == self.constEstadoProducciones.ImportadaMES.value) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_HABILITAR_ETIQUETAS'), 3000);
                            noValido = true;
                            return false;
                        }
                    });
                }

                if (noValido) return;

                var datos = {
                    Producciones: checkedIds,
                    EsAnular: esAnular
                };

                this.confirmacion = new VistaDlgConfirm({
                    titulo: esAnular ? window.app.idioma.t('ANULAR_ETQ') : window.app.idioma.t('HABILITAR_ETQ'),
                    msg: window.app.idioma.t('DESEA_REALMENTE') + (esAnular ? " anular" : " habilitar") + " las etiquetas seleccionadas?",
                    funcion: function () {
                        $("#msgDialogo").text(window.app.idioma.t('SE_ESTAN_ACTUALIZANDO_WO'));
                        self.anularHabilitar(datos);
                    },
                    contexto: this
                });
                e.preventDefault();
            },
            anularHabilitar: function (datos) {
                var self = this;
                var mensajeError = datos.EsAnular ? window.app.idioma.t('ERROR_ANULAR_ETIQUETAS') : window.app.idioma.t('ERROR_HABILITAR_ETIQUETAS');

                $.ajax({
                    data: JSON.stringify(datos),
                    type: "PUT",
                    url: "../api/anularHabilitarEtiquetas/",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        Backbone.trigger('eventCierraDialogo');
                        if (res) {
                            self.refreshGrid();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_OPERACION_SE'), 3000);
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), mensajeError, 3000);
                        }
                    },
                    error: function (response) {
                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), mensajeError, 3000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            selectRowAll: function (e) {
                var checked = $("#checkSelectAll:checked").val();
                var rows = $("#gridProducciones").find("tr");
                var grid = $("#gridProducciones").data("kendoGrid");
                checkedIds = [];

                if (checked) {
                    for (var i = 1; i < rows.length; i++) {
                        $(rows[i]).addClass("k-state-selected");
                        var dataItem = grid.dataItem(rows[i]);
                        checkedIds.push(dataItem);
                    }
                    $("#gridProducciones").find(".checkbox").prop('checked', true);
                    checkedIds.push()
                } else {
                    console.log("Not checked")
                    $("#gridProducciones").find("tr").removeClass("k-state-selected");
                    $("#gridProducciones").find(".checkbox").prop('checked', false);
                }
            },
            //on click of the checkbox:
            selectRow: function () {
                var checked = this.checked,
                    row = $(this).closest("tr"),
                    grid = $("#gridProducciones").data("kendoGrid"),
                    dataItem = grid.dataItem(row);

                if (checked) {
                    //-select the row
                    checkedIds.push(dataItem);
                    row.addClass("k-state-selected");
                } else {
                    //-remove selection
                    row.removeClass("k-state-selected");
                    $("#checkSelectAll").prop('checked', false);
                    var index = checkedIds.indexOf(dataItem);

                    if (index > -1) {
                        checkedIds.splice(index, 1);
                    }
                }
                //console.log(JSON.stringify(checkedIds));
            },
            obtenerColorSemaforo: function (data) {
                var self = this;

                switch (data.Estado) {
                    case self.constEstadoProducciones.EnEspera.value:
                        return "<div class='circle_cells itemEspera' ></div>";
                    case self.constEstadoProducciones.CorrectaMESJDE.value:
                        return "<div class='circle_cells itemCorrecta'></div>";
                    case self.constEstadoProducciones.HabilitadaMES.value:
                    case self.constEstadoProducciones.ImportadaMES.value:
                        return "<div class='circle_cells itemHabilitada'></div>";
                    case self.constEstadoProducciones.AnuladaMES.value:
                        return "<div class='circle_cells itemAnulada'></div>";
                    case self.constEstadoProducciones.EliminadaJDE.value:
                        return "<div class='circle_cells itemEliminada'></div>";
                    default:
                        return "<div class='circle_cells'></div>";
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
        });

        return gridGestionTriggers;
    });