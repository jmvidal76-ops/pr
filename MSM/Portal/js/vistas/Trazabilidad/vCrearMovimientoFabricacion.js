define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/CrearMovimientoFabricacion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, plantillaCrearEditarUbicacion, Not, VistaDlgConfirm, enums) {
        var vistaCrearMovimientoFabricacion = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            window: null,
            registroSeleccionadoOrigen: null,
            registroSeleccionadoDestino: null,
            idRegistroSeleccionadoOrigen: null,
            idRegistroSeleccionadoDestino: null,
            dsLoteOrigen: null,
            constMaestroTipoLoteManualSemielaborados: enums.MaestroTipoLoteManualSemielaborados(),
            constProcesoLoteFullNames: enums.ProcesoLoteFullNames(),
            constIdTipoUbicacion: enums.IdTipoUbicacion(),
            constUnidadMedida: enums.UnidadMedida(),
            constTipoMaterial: enums.TipoMaterial(),
            dsAlmacen: null,
            dsZona: null,
            defaultIdTipoMaterial: null,
            defaultIdTipoUbicacionCoccion: null,
            inicio: new Date().addDays(-15),
            fin: new Date(),
            fechaMov: new Date(),
            template: _.template(plantillaCrearEditarUbicacion),
            initialize: function () {
                var self = this;

                self.defaultIdTipoMaterial = self.constTipoMaterial.Semielaborados;
                self.defaultIdTipoUbicacionCoccion = self.constIdTipoUbicacion.UbicacionLogica;
                self.getDataSource();

                this.render();
            },
            getDataSource: function () {
                var self = this;
                
                self.dsLoteOrigen = new kendo.data.DataSource({
                    pageSize: 5,
                    transport: {
                        read: {}
                    },
                    schema: {
                        model: {
                            id: "IdLote",
                            fields: {
                                FechaCreacion: { type: "date" },
                                IdMaterial: { type: "string" },
                                IdLote: { type: "number" },
                                IdLoteMES: { type: "string" },
                                LoteProveedor: { type: "string" },
                                CantidadInicial: { type: "number" },
                                CantidadActual: { type: "number" },
                                Unidad: { type: "string" },
                                IdProveedor: { type: "string" },
                                NombreProveedor: { type: "string" },
                                IdProceso: { type: "number" },
                                Proceso: { type: "string" },
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

                self.dsLoteDestino = new kendo.data.DataSource({
                    pageSize: 5,
                    transport: {
                        read: {}
                    },
                    schema: {
                        model: {
                            id: "IdLote",
                            fields: {
                                FechaCreacion: { type: "date" },
                                IdMaterial: { type: "string" },
                                IdLote: { type: "number" },
                                IdLoteMES: { type: "string" },
                                LoteProveedor: { type: "string" },
                                CantidadInicial: { type: "number" },
                                CantidadActual: { type: "number" },
                                Unidad: { type: "string" },
                                IdProveedor: { type: "string" },
                                NombreProveedor: { type: "string" },
                                IdProceso: { type: "number" },
                                Proceso: { type: "string" },
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
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template({}));

                //Cargamos las fechas
                $("#dtpFechaInicio").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: self.inicio,
                    change: function () {
                        self.inicio = this.value();
                    }
                });

                $("#dtpFechaFin").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: self.fin,
                    change: function () {
                        self.fin = this.value();
                    }
                });

                self.renderElementsFilters();

                $("#gridOrigen").kendoGrid({
                    dataSource: self.dsLoteOrigen,
                    sortable: true,
                    toolbarColumnMenu: true,
                    scrollable: true,
                    selectable: true,
                    pageable: {
                        refresh: true,
                        pageSize: 3,
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    noRecords: {
                        template: window.app.idioma.t("SIN_RESULTADOS")
                    },
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    toolbar: [
                        
                    ],
                    columns: [
                        {
                            title: window.app.idioma.t("FECHA_CREACION"),
                            field: 'FechaCreacion',
                            width: 160,
                            template: '#= data.FechaCreacion != null ? kendo.toString(new Date(data.FechaCreacion), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            title: window.app.idioma.t("CODIGO_JDE"),
                            field: 'IdMaterial',
                            width: 110,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#= IdMaterial#</label></div>";
                                    }
                                }
                            },

                        },
                        {
                            title: window.app.idioma.t("DESCRIPCION"),
                            field: 'NombreMaterial',
                            width: 250,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=NombreMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#= NombreMaterial#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("LOTE_MES"),
                            field: 'IdLoteMES',
                            width: 460,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("PROCESO"),
                            width: 140,
                            field: 'Proceso',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Proceso#' style='width: 14px;height:14px;margin-right:5px;'/>#= Proceso#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            hidden: true,
                            title: window.app.idioma.t("PROVEEDOR"),
                            width: 130,
                            field: 'IdProveedor',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("LOTE_PROVEEDOR"),
                            field: 'LoteProveedor',
                            width: 150,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
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
                            title: window.app.idioma.t("CANTIDAD_INICIAL"),
                            field: 'CantidadInicial',
                            width: 140,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            template: '#= kendo.format("{0:n2}",typeof data.CantidadInicial !== "undefined" && data.CantidadInicial != null ? data.CantidadInicial: "")#',
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_ACTUAL"),
                            field: 'CantidadActual',
                            width: 145,
                            template: '#= kendo.format("{0:n2}",typeof data.CantidadActual !== "undefined" && data.CantidadActual != null ? data.CantidadActual: "")#',
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            hidden: false,
                            title: window.app.idioma.t("UNIDAD_MEDIDA"),
                            field: 'Unidad',
                            width: 110,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Unidad#' style='width: 14px;height:14px;margin-right:5px;'/>#= Unidad#</label></div>";
                                    }
                                }
                            }
                        }
                    ],
                    dataBound: function (e) {
                        $("#lblRegSel").text('');

                        var grid = $("#gridOrigen").data("kendoGrid");
                        var rowSelected = self.registroSeleccionadoOrigen;

                        if (rowSelected != null) {
                            var row = $("#gridOrigen").data("kendoGrid").dataSource.get(self.idRegistroSeleccionadoOrigen);

                            if (row) {
                                rowsSelected = $("#gridOrigen").data("kendoGrid").tbody.find("tr[data-uid='" + row.uid + "']");
                                $("#gridOrigen").data("kendoGrid").select(rowsSelected);
                            }
                        }
                    },
                    change: function (e) {
                        var selectedRow = this.select();
                        self.registroSeleccionadoOrigen = selectedRow;

                        if (selectedRow.length > 0) {
                            var lote = this.dataItem(selectedRow[0]);
                            self.idRegistroSeleccionadoOrigen = lote.IdLote;
                        }
                    }
                });

                $("#gridDestino").kendoGrid({
                    dataSource: self.dsLoteDestino,
                    sortable: true,
                    toolbarColumnMenu: true,
                    scrollable: true,
                    selectable: true,
                    pageable: {
                        refresh: true,
                        pageSize: 3,
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    noRecords: {
                        template: window.app.idioma.t("SIN_RESULTADOS")
                    },
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    toolbar: [

                    ],
                    columns: [
                        {
                            title: window.app.idioma.t("FECHA_CREACION"),
                            field: 'FechaCreacion',
                            width: 160,
                            template: '#= data.FechaCreacion != null ? kendo.toString(new Date(data.FechaCreacion), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            title: window.app.idioma.t("CODIGO_JDE"),
                            field: 'IdMaterial',
                            width: 110,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#= IdMaterial#</label></div>";
                                    }
                                }
                            },

                        },
                        {
                            title: window.app.idioma.t("DESCRIPCION"),
                            field: 'NombreMaterial',
                            width: 250,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=NombreMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#= NombreMaterial#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("LOTE_MES"),
                            field: 'IdLoteMES',
                            width: 460,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("PROCESO"),
                            width: 140,
                            field: 'Proceso',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Proceso#' style='width: 14px;height:14px;margin-right:5px;'/>#= Proceso#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            hidden: true,
                            title: window.app.idioma.t("PROVEEDOR"),
                            width: 130,
                            field: 'IdProveedor',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("LOTE_PROVEEDOR"),
                            field: 'LoteProveedor',
                            width: 150,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
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
                            title: window.app.idioma.t("CANTIDAD_INICIAL"),
                            field: 'CantidadInicial',
                            width: 140,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            template: '#= kendo.format("{0:n2}",typeof data.CantidadInicial !== "undefined" && data.CantidadInicial != null ? data.CantidadInicial: "")#',
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_ACTUAL"),
                            field: 'CantidadActual',
                            width: 145,
                            template: '#= kendo.format("{0:n2}",typeof data.CantidadActual !== "undefined" && data.CantidadActual != null ? data.CantidadActual: "")#',
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #"
                        },
                        {
                            hidden: false,
                            title: window.app.idioma.t("UNIDAD_MEDIDA"),
                            field: 'Unidad',
                            width: 110,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Unidad#' style='width: 14px;height:14px;margin-right:5px;'/>#= Unidad#</label></div>";
                                    }
                                }
                            }
                        }
                    ],
                    dataBound: function (e) {
                        $("#lblRegSel").text('');

                        var grid = $("#gridDestino").data("kendoGrid");
                        var rowSelected = self.registroSeleccionadoDestino;

                        if (rowSelected != null) {
                            var row = $("#gridDestino").data("kendoGrid").dataSource.get(self.idRegistroSeleccionadoDestino);

                            if (row) {
                                rowsSelected = $("#gridDestino").data("kendoGrid").tbody.find("tr[data-uid='" + row.uid + "']");
                                $("#gridDestino").data("kendoGrid").select(rowsSelected);
                            }
                        }
                    },
                    change: function (e) {
                        var selectedRow = this.select();
                        self.registroSeleccionadoDestino = selectedRow;

                        if (selectedRow.length > 0) {
                            var lote = this.dataItem(selectedRow[0]);
                            self.idRegistroSeleccionadoDestino = lote.IdLote;
                        }
                    }
                });
            },
            renderElementsFilters: function () {
                var self = this;

                $("#btnAceptar").kendoButton();

                var dsAlmacenOrigen = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetDepot/",
                            dataType: "json"
                        }
                    }
                });

                var dsAlmacenDestino = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetDepot/",
                            dataType: "json"
                        }
                    }
                });

                var dsUbicacionOrigen = new kendo.data.DataSource({
                    transport: {
                        read: function (operation) {
                            var selectedTipoLote = $("#cmbTipoLoteOrigen").data("kendoDropDownList").select();
                            var dataItem = $("#cmbTipoLoteOrigen").data("kendoDropDownList").dataItem(selectedTipoLote);
                            var idAlmacen = $("#cmbAlmacenLoteOrigen").data("kendoDropDownList").value() || 0;
                            var idZona = $("#cmbZonaLoteOrigen").data("kendoDropDownList").value();
                            var desdeTipoLote = true;

                            if (idZona || idAlmacen) {
                                desdeTipoLote = false;
                            } else if (dataItem.IdMaestroTipoLoteManualSemielaborados) {
                                idZona = dataItem.IdTipoZona;
                            }

                            if (!idZona) {
                                desdeTipoLote = false;
                                idZona = 0;
                            }

                            var url = `../api/${(desdeTipoLote ? "ObtenerUbicaciones" : "GetLocation")}/` + 
                                `${(desdeTipoLote ?
                                    (dataItem.IdProcesoLote === self.constProcesoLoteFullNames.Coccion ? self.defaultIdTipoUbicacionCoccion : "0") : 
                                    idAlmacen)}/${idZona}`;

                            $.ajax({
                                url: url,
                                dataType: "json",
                                success: function (response) {
                                    operation.success(response);
                                }
                            });
                        }
                    }
                });

                var dsUbicacionDestino = new kendo.data.DataSource({
                    transport: {
                        read: function (operation) {
                            var selectedTipoLote = $("#cmbTipoLoteDestino").data("kendoDropDownList").select();
                            var dataItem = $("#cmbTipoLoteDestino").data("kendoDropDownList").dataItem(selectedTipoLote);
                            var idAlmacen = $("#cmbAlmacenLoteDestino").data("kendoDropDownList").value() || 0;
                            var idZona = $("#cmbZonaLoteDestino").data("kendoDropDownList").value();
                            var desdeTipoLote = true;

                            if (idZona || idAlmacen) {
                                desdeTipoLote = false;
                            } else if (dataItem.IdMaestroTipoLoteManualSemielaborados) {
                                idZona = dataItem.IdTipoZona;
                            }

                            if (!idZona) {
                                desdeTipoLote = false;
                                idZona = 0;
                            }

                            var url = `../api/${(desdeTipoLote ? "ObtenerUbicaciones" : "GetLocation")}/` +
                                `${(desdeTipoLote ?
                                    (dataItem.IdProcesoLote === self.constProcesoLoteFullNames.Coccion ? self.defaultIdTipoUbicacionCoccion : "0") :
                                    idAlmacen)}/${idZona}`;

                            $.ajax({
                                url: url,
                                dataType: "json",
                                success: function (response) {
                                    operation.success(response);
                                }
                            });
                        }
                    }
                });

                var dsZonaOrigen = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetZone/0",
                            dataType: "json"
                        }
                    }
                });

                var dsZonaDestino = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetZone/0",
                            dataType: "json"
                        }
                    }
                });

                $("#cmbTipoLoteOrigen").kendoDropDownList({
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdMaestroTipoLoteManualSemielaborados",
                    optionLabel: window.app.idioma.t("SELECCIONE_UNO"),
                    change: function (e) {
                        var dataItem = this.dataItem(e.item);
                        $("#cmbAlmacenLoteOrigen").data("kendoDropDownList").select(0);
                        $("#cmbZonaLoteOrigen").data("kendoDropDownList").select(0);

                        $("#cmbUbicacionLoteOrigen").data("kendoDropDownList").dataSource.read();

                        if (dataItem.IdMaestroTipoLoteManualSemielaborados === self.constMaestroTipoLoteManualSemielaborados.MateriasPrimas.Id) {
                            $("#cmbAlmacenLoteOrigen").data('kendoDropDownList').value('');
                            $("#cmbZonaLoteOrigen").data('kendoDropDownList').value('');
                            $("#cmbUbicacionLoteOrigen").data('kendoDropDownList').value('');

                            var gridOrigen = $("#gridOrigen").data('kendoGrid');
                            gridOrigen.dataSource.data([]);
                        }
                    },
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/ObtenerMaestroTipoLoteManualSemielaborados/" + self.defaultIdTipoMaterial,
                                dataType: "json"
                            }
                        },
                        sort: { field: "Descripcion", dir: "asc" },
                        requestEnd: function (e) {
                            e.response.push({ IdMaestroTipoLoteManualSemielaborados: -1, Descripcion: "Materias Primas", IdTipoZona: 0 });
                        }
                    }
                });

                $("#cmbAlmacenLoteOrigen").kendoDropDownList({
                    dataSource: dsAlmacenOrigen,
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdAlmacen",
                    change: function (e) {
                        var dataItem = this.dataItem(e.item);
                        //Se obtienen los dos combos que le siguen
                        var comboZona = $("#cmbZonaLoteOrigen").data('kendoDropDownList');
                        $("#cmbUbicacionLoteOrigen").data("kendoDropDownList").dataSource.read();

                        dataItem.IdAlmacen = dataItem.IdAlmacen == "" ? "0" : dataItem.IdAlmacen;

                        //Se setea el dataSource del combo de Zona
                        comboZona.dataSource.transport.options.read.url = "../api/GetZone/" + dataItem.IdAlmacen;
                        comboZona.dataSource.read();
                        comboZona.select(0);
                    },
                    dataBound: function (e) {
                        var valueSelectedAlmacen = $("#cmbAlmacenLoteOrigen").data('kendoDropDownList').value();
                        var comboZona = $("#cmbZonaLoteOrigen").data('kendoDropDownList');

                        var IdAlmacen = valueSelectedAlmacen == "" ? "0" : valueSelectedAlmacen;

                        comboZona.dataSource.transport.options.read.url = "../api/GetZone/" + IdAlmacen;
                        comboZona.dataSource.read();
                    },
                });

                $("#cmbAlmacenLoteOrigen").data("kendoDropDownList").select(0);

                $("#cmbZonaLoteOrigen").kendoDropDownList({
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    dataSource: dsZonaOrigen,
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdZona",
                    change: function (e) {
                        $("#cmbUbicacionLoteOrigen").data("kendoDropDownList").dataSource.read();
                    },
                    dataBound: function (e) {
                        var zonasGrouped = [];

                        var dataUbicaciones = $("#cmbUbicacionLoteOrigen").data("kendoDropDownList").dataSource.view();

                        if (dataUbicaciones.length > 0) {
                            zonasGrouped = dataUbicaciones.map(u => u).reduce((x, y) => { (x[y.Zona[0].IdZona] = x[y.Zona[0].IdZona] || []).push(y); return x; }, {});//self.groupDataBy(zonasToGroup, 'IdZona');
                        }

                        if (zonasGrouped && Object.keys(zonasGrouped).length === 1) {
                            idZona = Object.keys(zonasGrouped)[0];
                            $("#cmbZonaLoteOrigen").data("kendoDropDownList").value(idZona);
                        }
                    }
                });

                $("#cmbZonaLoteOrigen").data("kendoDropDownList").select(0);

                $("#cmbUbicacionLoteOrigen").kendoDropDownList({
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    template: '#:data.Nombre #' + '#: data.Descripcion != null ? " - " + data.Descripcion : "" #',
                    dataSource: dsUbicacionOrigen,
                    filter: "contains",
                    dataTextField: "Nombre",
                    dataValueField: "IdUbicacion",
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        var gridOrigen = $("#gridOrigen").data('kendoGrid');

                        if (dataItem.IdUbicacion != '') {
                            if (self.validarFechas()) {
                                gridOrigen.dataSource.transport.options.read.url = "../api/ObtenerLotePorIdUbicacion?idUbicacion=" + dataItem.IdUbicacion +
                                    "&fechaInicio=" + self.inicio.toISOString() + "&fechaFin=" + self.fin.toISOString();
                                gridOrigen.dataSource.read();
                            }
                        }
                    },
                    dataBound: function (e) {
                        var idTipoLote = $("#cmbTipoLoteOrigen").data("kendoDropDownList").value();

                        var comboAlmacen = $("#cmbAlmacenLoteOrigen").data("kendoDropDownList");
                        var comboZona = $("#cmbZonaLoteOrigen").data('kendoDropDownList');
                        
                        if (idTipoLote != '' && !comboAlmacen.value() && !comboZona.value()) {
                            $("#cmbUbicacionLoteOrigen").data("kendoDropDownList").value('');
                            //$("#cmbZonaLoteOrigen").data("kendoDropDownList").value('');
                            //$("#cmbAlmacenLoteOrigen").data("kendoDropDownList").value('');

                            var idZona = 0;
                            var idAlmacen = 0;
                            var idUbicacion = 0;
                            var almacenesGrouped = [];
                            var zonasGrouped = [];

                            var dataUbicaciones = $("#cmbUbicacionLoteOrigen").data("kendoDropDownList").dataSource.view();

                            if (dataUbicaciones.length > 0) {
                                almacenesGrouped = dataUbicaciones.map(u => u).reduce((x, y) => { (x[y.IdAlmacen] = x[y.IdAlmacen] || []).push(y); return x; }, {}); //self.groupDataBy(almacenesToGroup, 'IdAlmacen');
                                zonasGrouped = dataUbicaciones.map(u => u).reduce((x, y) => { (x[y.Zona[0].IdZona] = x[y.Zona[0].IdZona] || []).push(y); return x; }, {});//self.groupDataBy(zonasToGroup, 'IdZona');
                            }

                            if (zonasGrouped && Object.keys(zonasGrouped).length === 1)
                                idZona = Object.keys(zonasGrouped)[0];

                            if (almacenesGrouped && Object.keys(almacenesGrouped).length === 1)
                                idAlmacen = Object.keys(almacenesGrouped)[0];

                            var gridOrigen = $("#gridOrigen").data('kendoGrid');

                            comboZona.dataSource.transport.options.read.url = "../api/GetZone/" + idAlmacen;
                            comboZona.dataSource.read();

                            if (dataUbicaciones.length === 1) {
                                idUbicacion = dataUbicaciones[0].IdUbicacion;
                                idZona = dataUbicaciones[0].Zona[0].IdZona;
                                idAlmacen = dataUbicaciones[0].IdAlmacen;

                                $("#cmbUbicacionLoteOrigen").data("kendoDropDownList").value(idUbicacion);

                                if (self.validarFechas()) {
                                    gridOrigen.dataSource.transport.options.read.url = "../api/ObtenerLotePorIdUbicacion?idUbicacion=" + idUbicacion +
                                        "&fechaInicio=" + self.inicio.toISOString() + "&fechaFin=" + self.fin.toISOString();
                                    gridOrigen.dataSource.read();
                                }
                            }
                            else {
                                gridOrigen.dataSource.data([]);
                            }

                            if (idAlmacen != 0)
                                $("#cmbAlmacenLoteOrigen").data("kendoDropDownList").value(idAlmacen);
                            if (idZona != 0)
                                $("#cmbZonaLoteOrigen").data("kendoDropDownList").value(idZona);
                        }
                    }
                });

                // Destino
                $("#cmbTipoLoteDestino").kendoDropDownList({
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdMaestroTipoLoteManualSemielaborados",
                    optionLabel: window.app.idioma.t("SELECCIONE_UNO"),
                    change: function (e) {
                        var dataItem = this.dataItem(e.item);
                        $("#cmbAlmacenLoteDestino").data("kendoDropDownList").select(0);
                        $("#cmbZonaLoteDestino").data("kendoDropDownList").select(0);

                        $("#cmbUbicacionLoteDestino").data("kendoDropDownList").dataSource.read();

                        if (dataItem.IdMaestroTipoLoteManualSemielaborados === self.constMaestroTipoLoteManualSemielaborados.MateriasPrimas.Id) {
                            $("#cmbAlmacenLoteDestino").data('kendoDropDownList').value('');
                            $("#cmbZonaLoteDestino").data('kendoDropDownList').value('');
                            $("#cmbUbicacionLoteDestino").data('kendoDropDownList').value('');

                            var gridDestino = $("#gridDestino").data('kendoGrid');
                            gridDestino.dataSource.data([]);
                        }
                    },
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/ObtenerMaestroTipoLoteManualSemielaborados/" + self.defaultIdTipoMaterial,
                                dataType: "json"
                            }
                        },
                        sort: { field: "Descripcion", dir: "asc" },
                        requestEnd: function (e) {
                            e.response.push({ IdMaestroTipoLoteManualSemielaborados: -1, Descripcion: "Materias Primas", IdTipoZona: 0 });
                        }
                    }
                });

                $("#cmbAlmacenLoteDestino").kendoDropDownList({
                    dataSource: dsAlmacenDestino,
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdAlmacen",
                    change: function (e) {
                        var dataItem = this.dataItem(e.item);
                        //Se obtienen los dos combos que le siguen
                        var comboZona = $("#cmbZonaLoteDestino").data('kendoDropDownList');
                        $("#cmbUbicacionLoteOrigen").data("kendoDropDownList").dataSource.read();

                        dataItem.IdAlmacen = dataItem.IdAlmacen == "" ? "0" : dataItem.IdAlmacen;

                        //Se setea el dataSource del combo de Zona
                        comboZona.dataSource.transport.options.read.url = "../api/GetZone/" + dataItem.IdAlmacen;
                        comboZona.dataSource.read();
                        comboZona.select(0);
                    },
                    dataBound: function (e) {
                        var valueSelectedAlmacen = $("#cmbAlmacenLoteDestino").data('kendoDropDownList').value();
                        var comboZona = $("#cmbZonaLoteDestino").data('kendoDropDownList');

                        var IdAlmacen = valueSelectedAlmacen == "" ? "0" : valueSelectedAlmacen;

                        comboZona.dataSource.transport.options.read.url = "../api/GetZone/" + IdAlmacen;
                        comboZona.dataSource.read();
                    },
                });

                $("#cmbAlmacenLoteDestino").data("kendoDropDownList").select(0);

                $("#cmbZonaLoteDestino").kendoDropDownList({
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    dataSource: dsZonaDestino,
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdZona",
                    change: function (e) {
                        $("#cmbUbicacionLoteDestino").data("kendoDropDownList").dataSource.read();
                    },
                    dataBound: function (e) {
                        var zonasGrouped = [];

                        var dataUbicaciones = $("#cmbUbicacionLoteDestino").data("kendoDropDownList").dataSource.view();

                        if (dataUbicaciones.length > 0) {
                            zonasGrouped = dataUbicaciones.map(u => u).reduce((x, y) => { (x[y.Zona[0].IdZona] = x[y.Zona[0].IdZona] || []).push(y); return x; }, {});//self.groupDataBy(zonasToGroup, 'IdZona');
                        }

                        if (zonasGrouped && Object.keys(zonasGrouped).length === 1) {
                            idZona = Object.keys(zonasGrouped)[0];
                            $("#cmbZonaLoteDestino").data("kendoDropDownList").value(idZona);
                        }
                    }
                });

                $("#cmbZonaLoteDestino").data("kendoDropDownList").select(0);

                $("#cmbUbicacionLoteDestino").kendoDropDownList({
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    template: '#:data.Nombre #' + '#: data.Descripcion != null ? " - " + data.Descripcion : "" #',
                    dataSource: dsUbicacionDestino,
                    filter: "contains",
                    dataTextField: "Nombre",
                    dataValueField: "IdUbicacion",
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        var gridDestino = $("#gridDestino").data('kendoGrid');

                        if (dataItem.IdUbicacion != '') {
                            if (self.validarFechas()) {
                                gridDestino.dataSource.transport.options.read.url = "../api/ObtenerLotePorIdUbicacion?idUbicacion=" + dataItem.IdUbicacion +
                                    "&fechaInicio=" + self.inicio.toISOString() + "&fechaFin=" + self.fin.toISOString();
                                gridDestino.dataSource.read();
                            }
                        }
                    },
                    dataBound: function (e) {
                        var idTipoLote = $("#cmbTipoLoteDestino").data("kendoDropDownList").value();

                        var comboAlmacen = $("#cmbAlmacenLoteDestino").data("kendoDropDownList");
                        var comboZona = $("#cmbZonaLoteDestino").data('kendoDropDownList');

                        if (idTipoLote != '' && !comboAlmacen.value() && !comboZona.value()) {
                            $("#cmbUbicacionLoteDestino").data("kendoDropDownList").value('');
                            //$("#cmbZonaLoteDestino").data("kendoDropDownList").value('');
                            //$("#cmbAlmacenLoteDestino").data("kendoDropDownList").value('');

                            var idZona = 0;
                            var idAlmacen = 0;
                            var idUbicacion = 0;
                            var almacenesGrouped = [];
                            var zonasGrouped = [];

                            var dataUbicaciones = $("#cmbUbicacionLoteDestino").data("kendoDropDownList").dataSource.view();

                            if (dataUbicaciones.length > 0) {
                                almacenesGrouped = dataUbicaciones.map(u => u).reduce((x, y) => { (x[y.IdAlmacen] = x[y.IdAlmacen] || []).push(y); return x; }, {});
                                zonasGrouped = dataUbicaciones.map(u => u).reduce((x, y) => { (x[y.Zona[0].IdZona] = x[y.Zona[0].IdZona] || []).push(y); return x; }, {});
                            }

                            if (zonasGrouped && Object.keys(zonasGrouped).length === 1)
                                idZona = Object.keys(zonasGrouped)[0];

                            if (almacenesGrouped && Object.keys(almacenesGrouped).length === 1)
                                idAlmacen = Object.keys(almacenesGrouped)[0];

                            var gridDestino = $("#gridDestino").data('kendoGrid');

                            comboZona.dataSource.transport.options.read.url = "../api/GetZone/" + idAlmacen;
                            comboZona.dataSource.read();

                            if (dataUbicaciones.length === 1) {
                                idUbicacion = dataUbicaciones[0].IdUbicacion;
                                idZona = dataUbicaciones[0].Zona[0].IdZona;
                                idAlmacen = dataUbicaciones[0].IdAlmacen;

                                $("#cmbUbicacionLoteDestino").data("kendoDropDownList").value(idUbicacion);

                                if (self.validarFechas()) {
                                    gridDestino.dataSource.transport.options.read.url = "../api/ObtenerLotePorIdUbicacion?idUbicacion=" + idUbicacion +
                                        "&fechaInicio=" + self.inicio.toISOString() + "&fechaFin=" + self.fin.toISOString();
                                    gridDestino.dataSource.read();
                                }
                            }
                            else {
                                gridDestino.dataSource.data([]);
                            }

                            if (idAlmacen != 0)
                                $("#cmbAlmacenLoteDestino").data("kendoDropDownList").value(idAlmacen);
                            if (idZona != 0)
                                $("#cmbZonaLoteDestino").data("kendoDropDownList").value(idZona);
                        }
                    }
                });

                $("#txtCantidad").kendoNumericTextBox({
                    decimals: 2,
                    min: 0,
                    culture: "es-ES",
                    spinners: true
                });

                $("#dtpFechaMov").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: self.fechaMov,
                    change: function () {
                        self.fechaMov = this.value();
                    }
                });

                $("#vpTxtUnidadMedida").kendoDropDownList({
                    optionLabel: "",
                    dataSource: {
                        batch: true,
                        transport: {
                            read: {
                                url: "../api/GetUnidadMedida/",
                                dataType: "json",
                                cache: false
                            },
                            schema: {
                                model: {
                                    id: "PK",
                                    fields: {
                                        'PK': { type: "int" },
                                        'SourceUoMID': { type: "string" },
                                    }
                                }
                            }

                        }
                    },
                    dataBound: function (e) {
                        self.constUnidadMedida = !self.constUnidadMedida ? { Hectolitros: 'HL' } : self.constUnidadMedida;
                        var data = $("#vpTxtUnidadMedida").data("kendoDropDownList").dataSource.view();
                        var cmbUnidadMedida = $("#vpTxtUnidadMedida").data("kendoDropDownList");
                        var hl = data.filter(o => o.SourceUoMID === self.constUnidadMedida.Hectolitros)[0].PK;
                        cmbUnidadMedida.value(hl);
                        cmbUnidadMedida.list.width("auto");
                    },
                    dataTextField: "SourceUoMID",
                    dataValueField: "PK",
                });

                $("#frmCrearMovimientoFabricacion").kendoValidator({
                    messages: {
                        required: "Campo obligatorio",
                    }
                }).data("kendoValidator");
            },
            validarFechas: function () {
                var self = this;

                if (self.inicio && self.fin) {
                    if (Date.parse(self.inicio) > Date.parse(self.fin)) {
                        Not.crearNotificacion('warning', window.app.idioma.t('INFO'), window.app.idioma.t('ERROR_FECHA_FIN_MENOR_INICIO'), 4000);
                        return false;
                    }

                    return true;
                }

                Not.crearNotificacion('warning', window.app.idioma.t('INFO'), window.app.idioma.t('SELECCIONE_FECHAS'), 4000);
                return false;
            },
            events: {
                'click #btnCrearMovimiento': 'crearMovimiento'
            },
            crearMovimiento: function (e) {
                var self = this;
                e.preventDefault();

                var gridOrigen = $("#gridOrigen").data('kendoGrid');
                var gridDestino = $("#gridDestino").data('kendoGrid');

                var selectedOrigen = [];
                var selectedDestino = [];

                gridOrigen.select().each(function () {
                    selectedOrigen.push(gridOrigen.dataItem(this));
                });

                gridDestino.select().each(function () {
                    selectedDestino.push(gridDestino.dataItem(this));
                });


                loteOrigen = selectedOrigen[0];
                loteDestino = selectedDestino[0];

                var cantidad = parseFloat(self.$("#txtCantidad").data("kendoNumericTextBox").value());
                var cantidadActualOrigen = 0;

                if (loteOrigen != undefined && loteOrigen.length != 0)
                    cantidadActualOrigen = parseFloat(loteOrigen.CantidadActual);
                                
                if (selectedOrigen.length === 0 || gridDestino.length === 0)
                    Not.crearNotificacion('error', window.app.idioma.t('INFORMACION'), window.app.idioma.t('SELECCIONAR_LOTES_ORIGEN_DESTINO'), 5000);
                else if (loteOrigen.IdLote === loteDestino.IdLote)
                    Not.crearNotificacion('error', window.app.idioma.t('INFORMACION'), window.app.idioma.t('LOTE_ORIGEN_DESTINO_DIFERENTES'), 5000);
                else if ($('#chkRestarCantidad').prop('checked') && cantidad > cantidadActualOrigen)
                    Not.crearNotificacion('error', window.app.idioma.t('INFORMACION'), window.app.idioma.t('CANTIDAD_A_MOVER_INSUFICIENTE'), 5000);
                else {
                    if ($("#frmCrearMovimientoFabricacion").data("kendoValidator").validate()) {
                        self.dialogoConfirm = new VistaDlgConfirm({
                            titulo: window.app.idioma.t('CREAR_LOTE_2'),
                            msg: window.app.idioma.t('DESEA_REALMENTE_CREAR_MOVIMIENTO'),
                            funcion: function () {
                                self.confirmaCrearMovimiento(loteOrigen, loteDestino, cantidad);
                                Backbone.trigger('eventCierraDialogo');
                            }, contexto: this
                        });
                    }
                }
            },
            confirmaCrearMovimiento: function (loteOrigen, loteDestino, cantidad) {
                var self = this;

                var movimientoFabricacion = {};
                movimientoFabricacion.IdTransferencia = 0;
                movimientoFabricacion.IdLoteOrigen = loteOrigen.IdLote;
                movimientoFabricacion.IdTipoMaterialMovimientoOrigen = loteOrigen.IdTipoMaterialMovimiento;
                movimientoFabricacion.IdLoteDestino = loteDestino.IdLote;
                movimientoFabricacion.IdTipoMaterialMovimientoDestino = loteDestino.IdTipoMaterialMovimiento;
                movimientoFabricacion.Cantidad = cantidad;
                movimientoFabricacion.Creado = self.fechaMov.toISOString();
                movimientoFabricacion.RestarCantidadEnOrigen = $('#chkRestarCantidad').prop('checked');
                movimientoFabricacion.SumarCantidadEnDestino = $('#chkSumarCantidad').prop('checked');

                $.ajax({
                    type: "POST",
                    url: "../api/AgregarMovimientoLoteFabricacion",
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(movimientoFabricacion),
                    cache: false,
                    async: false,
                }).done(function (data) {
                    var cantidad = $("#txtCantidad").data("kendoNumericTextBox");
                    var gridOrigen = $("#gridOrigen").data('kendoGrid');
                    var gridDestino = $("#gridDestino").data('kendoGrid');
                    var idUbicacionOrigen = $("#cmbUbicacionLoteOrigen").data("kendoDropDownList").value();
                    var idUbicacionDestino = $("#cmbUbicacionLoteDestino").data("kendoDropDownList").value();

                    if (self.validarFechas()) {
                        gridOrigen.dataSource.transport.options.read.url = "../api/ObtenerLotePorIdUbicacion?idUbicacion=" + idUbicacionOrigen +
                            "&fechaInicio=" + self.inicio.toISOString() + "&fechaFin=" + self.fin.toISOString();
                        gridOrigen.dataSource.read();

                        gridDestino.dataSource.transport.options.read.url = "../api/ObtenerLotePorIdUbicacion?idUbicacion=" + idUbicacionDestino +
                            "&fechaInicio=" + self.inicio.toISOString() + "&fechaFin=" + self.fin.toISOString();
                        gridDestino.dataSource.read();

                        cantidad.value(null);

                        Not.crearNotificacion('success', 'Info', window.app.idioma.t('MOVIMIENTO_CREADO'), 10000);
                    }
                }).fail(function (err) {
                    Not.crearNotificacion('error', window.app.idioma.t('INFORMACION'), window.app.idioma.t('ERROR_CREANDO_EL_LOTE'), 5000);
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearMovimientoFabricacion;
    });