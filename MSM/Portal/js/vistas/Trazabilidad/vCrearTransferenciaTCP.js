define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/CrearTransferenciaTCP.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, enums) {
        var vistaCrearTransferenciaTCP = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            window: null,
            registroSeleccionadoOrigen: null,
            idRegistroSeleccionadoOrigen: null,
            dsLoteOrigen: null,
            constUnidadMedida: enums.UnidadMedida(),
            constTipoMaterial: enums.TipoMaterial(),
            constProcesosLote: enums.ProcesoLote(),
            dsAlmacen: null,
            dsZona: null,
            defaultIdTipoMaterial: null,
            defaultIdProceso: null,
            dsTipoLoteOrigen: null,
            inicio: new Date().addDays(-15),
            fin: new Date(),
            template: _.template(plantilla),
            initialize: function () {
                var self = this;

                self.defaultIdTipoMaterial = self.constTipoMaterial.Semielaborados;
                self.defaultIdProceso = self.constProcesosLote.ENV;
                self.getDataSource();

                this.render();
            },
            getDataSource: function () {
                var self = this;
                
                self.dsLoteOrigen = new kendo.data.DataSource({
                    pageSize: 4,
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
                $("#dtpFechaInicio").kendoDatePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: self.inicio,
                    change: function () {
                        self.inicio = this.value();
                    }
                });

                $("#dtpFechaFin").kendoDatePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
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

                $("#cmbTipoLoteOrigen").data('kendoDropDownList').trigger('change');
            },
            renderElementsFilters: function () {
                var self = this;

                var lineas = window.app.planta.lineas;

                $("#btnAceptar").kendoButton();

                var dsAlmacenOrigen = new kendo.data.DataSource({
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
                            var idTipoZona = $("#cmbTipoLoteOrigen").data("kendoDropDownList").dataItem(selectedTipoLote).IdTipoZona;

                            if (idTipoZona) {
                                $.ajax({
                                    url: "../api/ObtenerUbicaciones/0/" + idTipoZona,
                                    dataType: "json",
                                    success: function (response) {
                                        operation.success(response);
                                    }
                                });
                            }
                            else {
                                operation.success([]);
                            }
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

                var dsTipoLoteOrigen = new kendo.data.DataSource({
                    transport: {
                        read: {
                            async: false,
                            url: "../api/ObtenerMaestroTipoLoteManualSemielaborados/" + self.defaultIdTipoMaterial,
                            dataType: "json"
                        }
                    }
                });

                $("#cmbTipoLoteOrigen").kendoDropDownList({
                    dataSource: dsTipoLoteOrigen,
                    filter: "contains",
                    index: 3,
                    dataTextField: "Descripcion",
                    dataValueField: "IdMaestroTipoLoteManualSemielaborados",
                    enabled: false,
                    change: function (e) {
                        $("#cmbUbicacionLoteOrigen").data("kendoDropDownList").dataSource.read();
                    }
                });

                $("#cmbAlmacenLoteOrigen").kendoDropDownList({
                    dataSource: dsAlmacenOrigen,
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdAlmacen",
                    enabled: false,
                    dataBound: function (e) {
                        var valueSelectedAlmacen = $("#cmbAlmacenLoteOrigen").data('kendoDropDownList').value();
                        var comboZona = $("#cmbZonaLoteOrigen").data('kendoDropDownList');

                        var IdAlmacen = valueSelectedAlmacen == "" ? "0" : valueSelectedAlmacen;

                        comboZona.dataSource.transport.options.read.url = "../api/GetZone/" + IdAlmacen;
                        comboZona.dataSource.read();
                    },
                });

                $("#cmbZonaLoteOrigen").kendoDropDownList({
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    dataSource: dsZonaOrigen,
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdZona",
                    enabled: false,
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

                $("#cmbUbicacionLoteOrigen").kendoDropDownList({
                    autoBind: false,
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    template: '#:data.Nombre #' + '#: data.Descripcion != null ? " - " + data.Descripcion : "" #',
                    dataSource: dsUbicacionOrigen,
                    filter: "contains",
                    dataTextField: "Nombre",
                    dataValueField: "IdUbicacion",
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        var gridOrigen = $("#gridOrigen").data('kendoGrid');

                        if (dataItem.IdUbicacion == '') {
                            gridOrigen.dataSource.data([]);
                        } else {
                            if (self.validarFechas()) {
                                gridOrigen.dataSource.transport.options.read.url = "../api/ObtenerLotePorIdUbicacion?idUbicacion=" + dataItem.IdUbicacion + 
                                    "&fechaInicio=" + self.inicio.toISOString() + "&fechaFin=" + self.fin.toISOString();
                                gridOrigen.dataSource.read();
                            }
                        }
                    },
                    dataBound: function (e) {
                        var idTipoLote = $("#cmbTipoLoteOrigen").data("kendoDropDownList").value();
                        var comboZona = $("#cmbZonaLoteOrigen").data('kendoDropDownList');

                        if (idTipoLote != '') {
                            $("#cmbUbicacionLoteOrigen").data("kendoDropDownList").value('');
                            $("#cmbZonaLoteOrigen").data("kendoDropDownList").value('');
                            $("#cmbAlmacenLoteOrigen").data("kendoDropDownList").value('');

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

                $("#cmbLineaEnvasado").kendoDropDownList({
                    filter: "contains",
                    dataTextField: "descripcion",
                    dataValueField: "id",
                    template: '#:data.numLineaDescripcion #' + '#: data.descripcion != null ? " - " + data.descripcion : "" #',
                    optionLabel: window.app.idioma.t("SELECCIONE_UNO"),
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                    },
                    dataSource: lineas
                });
                
                $("#txtCantidad").kendoNumericTextBox({
                    decimals: 2,
                    min: 0,
                    culture: "es-ES",
                    spinners: true
                });

                $("#dtpFechaInicioTransferencia").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                }).data("kendoDateTimePicker");

                $("#dtpFechaFinTransferencia").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                }).data("kendoDateTimePicker");

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
                        var data = $("#vpTxtUnidadMedida").data("kendoDropDownList").dataSource.view();
                        var cmbUnidadMedida = $("#vpTxtUnidadMedida").data("kendoDropDownList");
                        var hl = data.filter(o => o.SourceUoMID === self.constUnidadMedida.Hectolitros)[0].PK;
                        cmbUnidadMedida.value(hl);
                        cmbUnidadMedida.list.width("auto");
                    },
                    dataTextField: "SourceUoMID",
                    dataValueField: "PK",
                });

                $("#frmCrearTransferenciaTCP").kendoValidator({
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
                'click #btnCrearTransferencia': 'crearTransferencia'
            },
            crearTransferencia: function (e) {
                var self = this;
                e.preventDefault();

                var gridOrigen = $("#gridOrigen").data('kendoGrid');

                var selectedOrigen = [];

                gridOrigen.select().each(function () {
                    selectedOrigen.push(gridOrigen.dataItem(this));
                });

                loteOrigen = selectedOrigen[0];

                var cantidad = parseFloat(self.$("#txtCantidad").val());

                if (loteOrigen != undefined && loteOrigen.length != 0)
                    cantidadActualOrigen = parseFloat(loteOrigen.CantidadActual);
                
                if (selectedOrigen.length === 0)
                    Not.crearNotificacion('error', window.app.idioma.t('INFORMACION'), window.app.idioma.t('SELECCIONAR_LOTE_ORIGEN'), 5000);
                else if ($('#chkRestarCantidad').prop('checked') && cantidad > cantidadActualOrigen)
                    Not.crearNotificacion('error', window.app.idioma.t('INFORMACION'), window.app.idioma.t('CANTIDAD_A_MOVER_INSUFICIENTE'), 5000);
                else {
                    if ($("#frmCrearTransferenciaTCP").data("kendoValidator").validate()) {
                        self.dialogoConfirm = new VistaDlgConfirm({
                            titulo: window.app.idioma.t('CREAR_LOTE_2'),
                            msg: window.app.idioma.t('DESEA_REALMENTE_CREAR_ESTA_TRANSFERENCIA'),
                            funcion: function () {
                                self.confirmaCrearTransferencia(loteOrigen);
                                Backbone.trigger('eventCierraDialogo');
                            }, contexto: this
                        });
                    }
                }
            },
            confirmaCrearTransferencia: function (loteOrigen) {
                var self = this;

                let idLineaEnvasado = $("#cmbLineaEnvasado").data("kendoDropDownList").value();
                let fechaInicioTransf = $("#dtpFechaInicioTransferencia").data("kendoDateTimePicker").value();
                let fechaFinTransf = $("#dtpFechaFinTransferencia").data("kendoDateTimePicker").value();
                let cantidad = $("#txtCantidad").data("kendoNumericTextBox");
                let unidad = self.$("#vpTxtUnidadMedida").data("kendoDropDownList").text();
                let restarCantidad = $('#chkRestarCantidad').prop('checked');
                
                let claseMaterialLote = loteOrigen.IdLoteMES.split("-")[2];
                let claseMaterial = "";

                switch (claseMaterialLote) {
                    case "CZAP":
                        claseMaterial = "CZAE";
                        break;
                    case "CZAPB":
                        claseMaterial = "CZAEB";
                        break;
                    case "CZAPK":
                        claseMaterial = "CZAEK";
                        break;
                    default:
                        claseMaterial = claseMaterialLote;
                }

                let dataTransferenciaTCP = {};

                dataTransferenciaTCP.IdLoteOrigen = loteOrigen.IdLote;
                dataTransferenciaTCP.IdTipoMaterialMovimientoOrigen = loteOrigen.IdTipoMaterialMovimiento;
                dataTransferenciaTCP.Cantidad = cantidad.value();
                dataTransferenciaTCP.IdLineaEnvasado = idLineaEnvasado;
                dataTransferenciaTCP.FechaInicioTransferencia = fechaInicioTransf;
                dataTransferenciaTCP.FechaFinTransferencia = fechaFinTransf;
                dataTransferenciaTCP.Unidad = unidad;
                dataTransferenciaTCP.IdProceso = self.defaultIdProceso;
                dataTransferenciaTCP.IdMaterial = loteOrigen.IdMaterial;
                dataTransferenciaTCP.TipoMaterial = self.defaultIdTipoMaterial;
                dataTransferenciaTCP.ClaseMaterial = claseMaterial;
                dataTransferenciaTCP.RestarCantidadEnOrigen = restarCantidad;

                $.ajax({
                    type: "POST",
                    url: "../api/AgregarTransferenciaTCP",
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(dataTransferenciaTCP),
                    cache: false,
                    async: false,
                }).done(function (data) {
                    var gridOrigen = $("#gridOrigen").data('kendoGrid');
                    var idUbicacionOrigen = $("#cmbUbicacionLoteOrigen").data("kendoDropDownList").value();

                    if (self.validarFechas()) {
                        gridOrigen.dataSource.transport.options.read.url = "../api/ObtenerLotePorIdUbicacion?idUbicacion=" + idUbicacionOrigen +
                            "&fechaInicio=" + self.inicio.toISOString() + "&fechaFin=" + self.fin.toISOString();
                        gridOrigen.dataSource.read();
                    }

                    if (data.length === 0)
                        Not.crearNotificacion('error', window.app.idioma.t('INFORMACION'), window.app.idioma.t('LINEA_NO_TIENE_LLENADORAS'), 5000);
                    else {
                        cantidad.value(null);

                        var result = "";

                        for (var i = 0; i < data.length; i++)
                            result += "<br />" + data[i].LoteMES + "<br />";

                        $("#result-container").css("visibility", "visible");
                        $("#result").html(result);

                        Not.crearNotificacion('success', 'Info', window.app.idioma.t('TRANSFERENCIA_CREADA_CORRECTAMENTE'), 10000);
                    }                    
                }).fail(function (err) {
                    Not.crearNotificacion('error', window.app.idioma.t('INFORMACION'), window.app.idioma.t('ERROR_CREANDO_EL_LOTE'), 5000);
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearTransferenciaTCP;
    });