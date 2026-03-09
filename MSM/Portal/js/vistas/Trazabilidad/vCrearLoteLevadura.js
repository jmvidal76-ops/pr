define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/CrearLoteLevadura.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, plantillaCrearEditarUbicacion, Not, VistaDlgConfirm, enums) {
        var vistaCrearLoteSemielaborado = Backbone.View.extend({
            tagName: 'div',
            id: 'divEditarArranqueCambio',
            window: null,
            dialog: null,
            row: null,
            constUnidadMedida: enums.UnidadMedida(),
            constProcesoLoteFullNames: enums.ProcesoLoteFullNames(),
            constTipoMaterial: enums.TipoMaterial(),
            accion: null,
            defaultIdTipoMaterial: null,
            dsTiposUbicacion: null,
            dsEstadosUbicacion: null,
            dsPoliticaAlmacenamiento: null,
            dsPoliticaLlenado: null,
            dsPoliticaVaciado: null,
            dsAlmacen: null,
            dsZona: null,
            dsMateriales: null,
            dsClasesMaterial: null,
            dsTiposMaterial: null,
            tituloWindow: null,
            idPolitica: null,
            template: _.template(plantillaCrearEditarUbicacion),
            initialize: function () {
                var self = this;
                self.defaultIdTipoMaterial = self.constTipoMaterial.Subproductos;
                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template({}));

                self.renderElementsFilters();
            },
            renderElementsFilters: function () {
                self = this;
                $("#btnAceptar").kendoButton();

                $("#txtCantidad").kendoNumericTextBox({
                    decimals: 2,
                    min: 0,
                    culture: "es-ES",
                    spinners: true
                });

                $("#cmbTipoLote").kendoDropDownList({
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdMaestroTipoLoteSemielaborados",
                    optionLabel: window.app.idioma.t("SELECCIONE_UNO"),
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        //Se obtienen los dos combos que le siguen
                        var comboProceso = $("#cmbProceso").data('kendoDropDownList');
                        var comboClaseMaterial = $("#cmbClaseMaterial").data('kendoDropDownList');
                        var comboReferencia = $("#cmbRefMaterial").data('kendoDropDownList');
                        var cmbUbicacion = $("#cmbUbicacion").data("kendoDropDownList");

                        var idTipoZona = dataItem.IdTipoZona;

                        cmbUbicacion.dataSource.transport.options.read.url = "../api/ObtenerUbicaciones/0/" + idTipoZona;
                        cmbUbicacion.dataSource.read();
                        cmbUbicacion.select(0);

                        comboReferencia.dataSource.transport.options.read.url = "../api/GetMaterial/" + self.defaultIdTipoMaterial + "/" + dataItem.IdClaseMaterial;
                        comboReferencia.dataSource.read();
                        comboReferencia.select(0);

                        comboProceso.value(dataItem.IdProcesoLote);
                        comboClaseMaterial.value(dataItem.IdClaseMaterial);
                    },
                    open: function (e) {
                        var listContainer = e.sender.list.closest(".k-list-container");
                        listContainer.width(listContainer.width() + kendo.support.scrollbar());
                    },
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/ObtenerMaestroTipoLoteManualSemielaborados/" + self.defaultIdTipoMaterial,
                                dataType: "json"
                            }
                        },
                        sort: { field: "Descripcion", dir: "asc" },
                    }
                });

                $("#cmbProceso").kendoDropDownList({
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdProceso",
                    enable: false,
                    optionLabel: window.app.idioma.t("SELECCIONE_UNO"),
                    open: function (e) {
                        var listContainer = e.sender.list.closest(".k-list-container");
                        listContainer.width(listContainer.width() + kendo.support.scrollbar());
                    },
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/ObtenerProcesosLotes",
                                dataType: "json"
                            }
                        },
                        sort: { field: "Descripcion", dir: "asc" },
                    }
                });

                var cmbProceso = $("#cmbProceso").data("kendoDropDownList");
                cmbProceso.value(self.constProcesoLoteFullNames.GeneralFabricacion);

                var dsAlmacen = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetDepot/",
                            dataType: "json"
                        }
                    }
                });

                $("#cmbAlmacen").kendoDropDownList({
                    dataSource: dsAlmacen,
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdAlmacen",
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        //Se obtienen los dos combos que le siguen
                        var comboZona = $("#cmbZona").data('kendoDropDownList');
                        var comboUbicacion = $("#cmbUbicacion").data('kendoDropDownList');

                        dataItem.IdAlmacen = dataItem.IdAlmacen == "" ? "0" : dataItem.IdAlmacen;

                        //Se setea el dataSource del combo de Zona
                        comboZona.dataSource.transport.options.read.url = "../api/GetZone/" + dataItem.IdAlmacen;
                        comboZona.dataSource.read();
                        comboZona.select(0);

                        //Se setea el DataSource se Ubicacion
                        comboUbicacion.dataSource.transport.options.read.url = "../api/GetLocation/" + dataItem.IdAlmacen + "/0";
                        comboUbicacion.dataSource.read();
                        comboUbicacion.select(0);
                    },
                    open: self.onElementOpen
                });

                $("#cmbAlmacen").data("kendoDropDownList").select(0);
                var cmbAlmacen = $("#cmbAlmacen").data("kendoDropDownList");
                cmbAlmacen.list.width("auto");

                var dsZona = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetZone/0",
                            dataType: "json"
                        }
                    }
                });

                $("#cmbZona").kendoDropDownList({
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    dataSource: dsZona,
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdZona",
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);

                        var comboUbicacion = $("#cmbUbicacion").data('kendoDropDownList');
                        var itemAlmacen = $("#cmbAlmacen").data("kendoDropDownList").value();

                        dataItem.IdZona = dataItem.IdZona == "" ? "0" : dataItem.IdZona;

                        comboUbicacion.dataSource.transport.options.read.url = "../api/GetLocation/" + itemAlmacen + "/" + dataItem.IdZona;
                        comboUbicacion.dataSource.read();
                        comboUbicacion.select(0);
                    },
                    open: self.onElementOpen
                });

                var cmbZona = $("#cmbZona").data("kendoDropDownList");
                cmbZona.list.width("auto");

                var dsUbicacion = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetLocation/0/0",
                            dataType: "json"
                        }
                    }
                });

                $("#cmbUbicacion").kendoDropDownList({
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    template: '#:data.Nombre #' + '#: data.Descripcion != null ? " - " + data.Descripcion : "" #',
                    dataSource: dsUbicacion,
                    filter: "contains",
                    dataTextField: "Nombre",
                    dataValueField: "IdUbicacion",
                    open: self.onElementOpen,
                    dataBound: function (e) {
                        var idTipoLote = $("#cmbTipoLote").data("kendoDropDownList").value();

                        if (idTipoLote != '') {
                            $("#cmbUbicacion").data("kendoDropDownList").value('');
                            $("#cmbZona").data("kendoDropDownList").value('');
                            $("#cmbAlmacen").data("kendoDropDownList").value('');

                            var idZona = 0;
                            var idAlmacen = 0;
                            var almacenesGrouped = [];
                            var zonasGrouped = [];

                            var dataUbicaciones = $("#cmbUbicacion").data("kendoDropDownList").dataSource.view();

                            if (dataUbicaciones.length > 0) {
                                almacenesGrouped = dataUbicaciones.map(u => u).reduce((x, y) => { (x[y.IdAlmacen] = x[y.IdAlmacen] || []).push(y); return x; }, {}); //self.groupDataBy(almacenesToGroup, 'IdAlmacen');
                                zonasGrouped = dataUbicaciones.map(u => u).reduce((x, y) => { (x[y.Zona[0].IdZona] = x[y.Zona[0].IdZona] || []).push(y); return x; }, {});//self.groupDataBy(zonasToGroup, 'IdZona');
                            }

                            if (zonasGrouped && Object.keys(zonasGrouped).length === 1)
                                idZona = Object.keys(zonasGrouped)[0];

                            if (almacenesGrouped && Object.keys(almacenesGrouped).length === 1)
                                idAlmacen = Object.keys(almacenesGrouped)[0];

                            if (dataUbicaciones.length === 1) {
                                $("#cmbUbicacion").data("kendoDropDownList").value(dataUbicaciones[0].IdUbicacion);
                                idZona = dataUbicaciones[0].Zona[0].IdZona;
                                idAlmacen = dataUbicaciones[0].IdAlmacen;
                            }

                            if (idAlmacen != 0)
                                $("#cmbAlmacen").data("kendoDropDownList").value(idAlmacen);
                            if (idZona != 0)
                                $("#cmbZona").data("kendoDropDownList").value(idZona);
                        }
                    }
                });

                var cmbUbicacion = $("#cmbUbicacion").data("kendoDropDownList");
                cmbUbicacion.list.width("auto");

                var dsTipoMaterial = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetTipoMaterial",
                            dataType: "json"
                        }
                    }
                });

                $("#cmbTipoMaterial").kendoDropDownList({
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    dataSource: dsTipoMaterial,
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdTipoMaterial",
                    index: 2,
                    enable: false,
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        //Se obtienen los dos combos que le siguen
                        var comboClaseMaterial = $("#cmbClaseMaterial").data('kendoDropDownList');
                        var comboReferencia = $("#cmbRefMaterial").data('kendoDropDownList');

                        //Se setea el dataSource del combo de Zona
                        comboClaseMaterial.dataSource.transport.options.read.url = "../api/GetClaseMaterial/" + dataItem.IdTipoMaterial;
                        comboClaseMaterial.dataSource.read();
                        comboClaseMaterial.select(0);

                        dataItem.IdTipoMaterial = dataItem.IdTipoMaterial == "" ? "00" : dataItem.IdTipoMaterial;

                        //Se setea el DataSource se Ubicacion
                        comboReferencia.dataSource.transport.options.read.url = "../api/GetMaterial/" + dataItem.IdTipoMaterial + "/00";
                        comboReferencia.dataSource.read();
                        comboReferencia.select(0);
                    },
                    open: self.onElementOpen
                });

                var cmbTipoMat = $("#cmbTipoMaterial").data("kendoDropDownList");
                cmbTipoMat.value(self.defaultIdTipoMaterial)
                cmbTipoMat.list.width("auto");


                var dsClaseMaterial = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetClaseMaterial/" + self.defaultIdTipoMaterial,
                            dataType: "json"
                        }
                    }
                });

                $("#cmbClaseMaterial").kendoDropDownList({
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    dataSource: dsClaseMaterial,
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdClaseMaterial",
                    open: function (e) {
                        var listContainer = e.sender.list.closest(".k-list-container");
                        listContainer.width(listContainer.width() + kendo.support.scrollbar());
                    },
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        //Se obtienen los dos combos que le siguen
                        var itemTipoMaterial = $("#cmbTipoMaterial").data("kendoDropDownList").dataItem($("#cmbTipoMaterial").data("kendoDropDownList").select());
                        var comboReferencia = $("#cmbRefMaterial").data('kendoDropDownList');

                        itemTipoMaterial.IdTipoMaterial = itemTipoMaterial.IdTipoMaterial == "" ? "00" : itemTipoMaterial.IdTipoMaterial;
                        dataItem.IdClaseMaterial = dataItem.IdClaseMaterial == "" ? "00" : dataItem.IdClaseMaterial;
                        //Se setea el DataSource se Ubicacion
                        comboReferencia.dataSource.transport.options.read.url = "../api/GetMaterial/" + itemTipoMaterial.IdTipoMaterial + "/" + dataItem.IdClaseMaterial;
                        comboReferencia.dataSource.read();
                        comboReferencia.select(0);
                    },
                    open: self.onElementOpen
                });

                var cmbClaseMat = $("#cmbClaseMaterial").data("kendoDropDownList");
                cmbClaseMat.dataSource.filter({
                    logic: 'or',
                    filters: [{
                        field: 'IdClaseMaterial',
                        operator: 'eq',
                        value: 'LEVP'
                    },
                    {
                        field: 'IdClaseMaterial',
                        operator: 'eq',
                        value: 'LEVC'
                    }]
                });

                cmbClaseMat.list.width("auto");

                var dsReferenciaMaterial = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetMaterial",
                            dataType: "json"
                        }
                    }
                });

                $("#cmbRefMaterial").kendoDropDownList({
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    dataSource: dsReferenciaMaterial,
                    filter: "contains",
                    dataTextField: "DescripcionCompleta",
                    dataValueField: "IdMaterial",
                    open: self.onElementOpen
                });

                var cmbReferencia = $("#cmbRefMaterial").data("kendoDropDownList");
                cmbReferencia.list.width("auto");

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
                    open: function (e) {
                        var listContainer = e.sender.list.closest(".k-list-container");
                        listContainer.width(listContainer.width() + kendo.support.scrollbar());
                    },
                    dataTextField: "SourceUoMID",
                    dataValueField: "PK",
                });

                $("#frmCrearLoteMMPP").kendoValidator({
                    messages: {
                        required: "Campo obligatorio",
                    }
                }).data("kendoValidator");
            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnReiniciarForm': 'reiniciarFormulario'
            },
            aceptar: function (e) {
                e.preventDefault();
                var self = this;
                if ($("#frmCrearLoteMMPP").data("kendoValidator").validate()) {
                    self.dialogoConfirm = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('CREAR_LOTE_2'),
                        msg: window.app.idioma.t('DESEA_REALMENTE_CREAR'),
                        funcion: function () {
                            self.confirmaAcepta();
                            Backbone.trigger('eventCierraDialogo');
                        }, contexto: this
                    });
                }
            },
            confirmaAcepta: function () {
                var self = this;

                var batchData = {};

                var idProceso = self.$("#cmbProceso").val();
                var idMaterial = self.$("#cmbRefMaterial").val();
                var cantidadActual = self.$("#txtCantidad").val();
                var unidad = self.$("#vpTxtUnidadMedida").data("kendoDropDownList").text();
                var idUbicacion = self.$("#cmbUbicacion").val();
                var matriculaLevadura = self.$("#txtMatriculaLevadura").val();

                batchData.CantidadInicial = cantidadActual;
                batchData.CantidadActual = cantidadActual;
                batchData.Unidad = unidad.toUpperCase();
                batchData.IdMaterial = idMaterial;
                batchData.IdUbicacionOrigen = idUbicacion;
                batchData.IdProceso = idProceso;
                batchData.MatriculaLevadura = matriculaLevadura; //.replace(" ", "").replace("-", "");

                $.ajax({
                    type: "POST",
                    url: "../api/AgregarLoteSemielaboradoTM",
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(batchData),
                    cache: false,
                    async: false,
                }).done(function (data) {
                    $("#result-container").css("visibility", "visible");
                    $("#result").html(data.LoteMES);

                    var cantidad = $("#txtCantidad").data("kendoNumericTextBox");
                    cantidad.value(null);

                    Not.crearNotificacion('success', 'Info', window.app.idioma.t('LOTE_GENERADO'), 10000);
                }).fail(function (err) {
                    Not.crearNotificacion('error', window.app.idioma.t('INFORMACION'), window.app.idioma.t('ERROR_CREANDO_EL_LOTE'), 5000);
                });
            },
            eliminar: function () {
                this.remove();
            },
            reiniciarFormulario: function () {

                var almacen = $("#cmbAlmacen").data("kendoDropDownList");
                almacen.select(0);

                var refMaterial = $("#cmbRefMaterial").data("kendoDropDownList");
                refMaterial.select(0);

                var zona = $("#cmbZona").data("kendoDropDownList");
                zona.select(0);

                var ubicacion = $("#cmbUbicacion").data("kendoDropDownList");
                ubicacion.select(0);

                var claseMaterial = $("#cmbClaseMaterial").data("kendoDropDownList");
                claseMaterial.select(0);

                var idProveedor = $("#vpTxtProveedor").data("kendoDropDownList");
                idProveedor.select(0);

                var cantidad = $("#txtCantidad").data("kendoNumericTextBox");
                cantidad.value(null);

                $("#txtLoteProveedor").val("");
            }
        });

        return vistaCrearLoteSemielaborado;
    });