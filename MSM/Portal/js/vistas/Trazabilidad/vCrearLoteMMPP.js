define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/CrearLoteMMPP.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, plantillaCrearEditarUbicacion, Not, VistaDlgConfirm, enums) {
        var vistaCrearLoteMMPP = Backbone.View.extend({
            tagName: 'div',
            id: 'divEditarArranqueCambio',
            window: null,
            dialog: null,
            row: null,
            accion: null,
            constUnidadMedida: enums.UnidadMedida(),
            constTipoMaterial: enums.TipoMaterial(),
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
                self.defaultIdTipoMaterial = self.constTipoMaterial.MateriasPrimas;
                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template({}));
                
                self.renderElementsFilters();
            },
            renderElementsFilters: function () {
                var self = this;
                $("#btnAceptar").kendoButton();

                $("#txtCantidad").kendoNumericTextBox({
                    decimals: 2,
                    min: 0,
                    culture: "es-ES",
                    spinners: true
                });

                $("#cmbProceso").kendoDropDownList({
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdProceso",
                    index: 2,
                    enable: false,
                    optionLabel: window.app.idioma.t("SELECCIONE_UNO"),
                    open: function (e) {
                        var listContainer = e.sender.list.closest(".k-list-container");
                        listContainer.width(listContainer.width() + kendo.support.scrollbar());
                    },
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/ObtenerProcesosLotes/false",
                                dataType: "json"
                            }
                        },
                        sort: { field: "Descripcion", dir: "asc" },
                    }
                });

                var cmbProceso = $("#cmbProceso").data("kendoDropDownList");
                cmbProceso.select(3);
                // cmbProceso.trigger('change');

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
                        var itemAlmacen = $("#cmbAlmacen").data("kendoDropDownList").dataItem($("#cmbAlmacen").data("kendoDropDownList").select());

                        itemAlmacen.IdAlmacen = itemAlmacen.IdAlmacen == "" ? "0" : itemAlmacen.IdAlmacen;
                        dataItem.IdZona = dataItem.IdZona == "" ? "0" : dataItem.IdZona;

                        comboUbicacion.dataSource.transport.options.read.url = "../api/GetLocation/" + itemAlmacen.IdAlmacen + "/" + dataItem.IdZona;
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
                    open: self.onElementOpen
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

                $("#vpTxtProveedor").kendoDropDownList({
                    filter: "contains",
                    optionLabel: window.app.idioma.t('SELECCIONE_UNO'),
                    open: function (e) {
                        var listContainer = e.sender.list.closest(".k-list-container");
                        listContainer.width(listContainer.width() + kendo.support.scrollbar());
                    },
                    dataTextField: "NombreFull",
                    dataValueField: "IdProveedor",
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetMaestroProveedorLoteMMPP",
                                dataType: "json"
                            }
                        },
                        sort: { field: "NombreFull", dir: "asc" },
                        schema: {
                            model: {
                                id: "IdProveedor",
                                fields: {
                                    'IdProveedor': { type: "int" },
                                    'Nombre': { type: "string" },
                                    'NombreFull': { type: "string" },
                                }
                            }
                        }
                    }
                });

                $("#vpTxtUnidadMedida").kendoDropDownList({
                    //autoBind: true,
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
                        var hl = data.filter(o => o.SourceUoMID === self.constUnidadMedida.Kilogramos)[0].PK;
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

                $("#vpTxtFechaCaducidad").kendoDatePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
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

                var mmppFabricacion = {};

                var idProceso = self.$("#cmbProceso").val();
                var idMaterial = self.$("#cmbRefMaterial").val();
                var cantidadActual = self.$("#txtCantidad").val();
                var unidad = self.$("#vpTxtUnidadMedida").data("kendoDropDownList").text();
                var fechaCaducidad = $("#vpTxtFechaCaducidad").data("kendoDatePicker").value();
                var idProveedor = self.$("#vpTxtProveedor").val();
                var idUbicacion = self.$("#cmbUbicacion").val();
                var loteProveedor = self.$("#txtLoteProveedor").val();
                var sscc = self.$("#txtSSCC").val();

                mmppFabricacion.CantidadInicial = cantidadActual;
                mmppFabricacion.CantidadActual = cantidadActual;
                mmppFabricacion.Unidad = unidad.toUpperCase();
                mmppFabricacion.FechaCaducidad = fechaCaducidad;
                mmppFabricacion.FechaEntradaPlanta = new Date().toISOString();
                mmppFabricacion.FechaEntradaUbicacion = new Date().toISOString();
                mmppFabricacion.IdMaterial = idMaterial;
                mmppFabricacion.IdProveedor = idProveedor;
                mmppFabricacion.IdUbicacion = idUbicacion;
                mmppFabricacion.LoteProveedor = loteProveedor;
                mmppFabricacion.SSCC = sscc;
                mmppFabricacion.IdProceso = idProceso;

                $.ajax({
                    type: "POST",
                    url: "../api/AgregarLoteMMPPFabricacion",
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(mmppFabricacion),
                    cache: false,
                    async: false,
                }).done(function (data) {
                    $("#result-container").css("visibility", "visible");
                    $("#result").html(data.IdLoteMES);

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

                $("#vpTxtFechaCaducidad").val("");
                $("#txtLoteProveedor").val("");
                $("#txtSSCC").val("");
            }
        });

        return vistaCrearLoteMMPP;
    });