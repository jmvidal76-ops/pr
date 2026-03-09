define(['underscore', 'backbone', 'jquery', 'text!../../../Trazabilidad/html/GestionGenealogia.html', 'compartido/notificaciones',
    'vistas/vDialogoConfirm', 'modelos/mSesion', 'vistas/Almacen/vDocumentos', 'ALT/vAltFormComponent', 'jszip', 'definiciones',
    'vistas/Almacen/vPropiedadesLotes', 'vistas/Fabricacion/vVerDetallesOrden_LIMS', 'vistas/Fabricacion/vArchivosAdjuntosLote', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, Session, jsDocumentos, VistaFormComponent, JSZip, definiciones, vPropiedadesLotes
        , vistaLIMS, vistaArchivosAdjuntos, enums) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            treeLotes: null,
            itemSelectedGrid: "liDatosLotes",
             
            dsDatosLotes: null,
            dsAnaliticaLote: null,
            dsControlCalidadLote: null,
            loteSelected: "",
            IdAlbaranSelected: null,

            dsDatosDescarga: null,
            dsDatosTransporteEntrada: null,

            dsDatosCarga: null,
            dsDatosTransporteSalida: null,

            dsDocumentos: null,
            dsProcesos: null,
            dsOperaciones: null,
            dsMMPP: null,
            dsPaletsProducidos: null,
            dsWO: null,
            dsTransferencias: null,

            attrHaciaProducto: true,
            attrConsumido: true,
            IdTipoAlbaran: 0,
            isPalet: false,
            idioma: null,

            procesosLote: definiciones.ProcesoLote(),
            constTipoMovimientoLote: enums.TipoMovimientoLote(),
            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;
                window.JSZip = JSZip;
                self.idioma = kendo.culture().name;
                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                if (self.idioma != kendo.culture().name) {
                    self.idioma = kendo.culture().name;
                    self.reiniciarCampos(self);
                }

                // Posicionamos los botones especiales
                setTimeout(() => {
                    const lastTab = $("#liPaletsProducidos");
                    const posicion = (lastTab.offset().left - $("#divDetalleLote").offset().left) + lastTab.width();
                    const leftPosition = Math.round(posicion) + 1;
                    $("#btnLIMS").css("left", leftPosition + "px");
                    $("#btnFicherosAdjuntos").css("left", (leftPosition + 50) + "px");

                    $("#btnLIMS").click((e) => {
                        self.MostrarLIMS(e, self);
                    })
                    $("#btnFicherosAdjuntos").click((e) => {
                        self.MostrarFicherosAdjuntos(e, self);
                    })
                })

                self.renderTree(self);

                $("#gridSuperior").kendoGrid();

                //Se carga la primera pestaña sin datos
                self.renderData_L1(self);

                var tabStrip = this.$("#divPestanias").kendoTabStrip({
                    scrollable: true,
                    animation: {
                        open: {
                            effects: "fadeIn"
                        }
                    },
                    select: function (e) {

                        var item = e.item.id;
                        self.itemSelectedGrid = item;
                        var rowSelect = $("#treeview").data("kendoTreeView").select();
                        if (rowSelect.length > 0) {
                            var _dataItem = $("#treeview").data("kendoTreeView").dataItem(rowSelect);
                            self.loadData(self, _dataItem);
                        }
                        else
                            self.loadData(self, null);
                    }
                });

                self.renderElementsFilters();

                self.resizeContent();
                $("#divSplitter").kendoSplitter({
                    panes: [{ size: "40%" }, {}]
                });

                self.renderData_LTransferencia(self);
            },

            //#region EVENTOS
            events: {
                'click #btnFiltros': function () { this.mostrarFiltros(this); },
                'click #btnLimpiarFiltros': function () { this.limpiarFiltros(this) },
                'click #btnHaciaProducto': function () { this.consultTo(true); this.attrHaciaProducto = true; this.consultarLotes(this); },
                'click #btnHaciaMMPP': function () { this.consultTo(false); this.attrHaciaProducto = false; this.consultarLotes(this); },
                'click #btnConsultar': function () { this.consultarLotes(this); },
                'click #btnEditarCalidad': function (e) { this.editarFormularioCalidad(e, this) },
                'click #btnDescargarDocumento_Entrada': function (e) { this.descargarDocumento(e, this, "gridDocumentos_EntradaPlanta") },
                'click #btnDescargarDocumento_Salida': function (e) { this.descargarDocumento(e, this, "gridDocumentos_SalidaPlanta") },
                'click #btnImprimirAlbaranSalida': function (e) { this.imprimirAlbaran(e, this); }
            },
            //#endregion EVENTOS            

            //Metodo que recarga el arbol de lotes
            consultarLotes: function (self) {
                var tree = $("#treeview").data("kendoTreeView");
                tree.dataSource.read();
            },

            //FUncion que cambia el nombre de Hacia donde se necesita hacer la consulta
            consultTo: function (toProduct) {
                if (toProduct) {
                    $(".txtDirCo").html(window.app.idioma.t('HACIA_PRODUCTO'))
                }
                else {
                    $(".txtDirCo").html(window.app.idioma.t('HACIA_MMPP'))
                }


            },

            //Metodo para descargar documento
            descargarDocumento: function (e, options, grid) {
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                var item = $("#" + grid).data("kendoGrid").dataItem(tr);
                var _idDocumento = item.IdDocumento;
                var _docName = item.NombreFichero;

                $.ajax({
                    type: 'POST',
                    async: true,
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    url: '../api/DownloadFile/' + _idDocumento,
                    success: function (documento) {
                        if (documento != null) {
                            var data = documento;
                            var fileNamePDF = _docName.substr(_docName.length - 3);
                            var fileName = fileNamePDF.indexOf("pdf") !== -1 ? _docName : _docName + ".pdf";


                            var arrBuffer = base64ToArrayBuffer(data);

                            // It is necessary to create a new blob object with mime-type explicitly set
                            // otherwise only Chrome works like it should
                            var newBlob = new Blob([arrBuffer], { type: "application/pdf" });

                            // IE doesn't allow using a blob object directly as link href
                            // instead it is necessary to use msSaveOrOpenBlob
                            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                                var byteCharacters = atob(data);
                                var byteNumbers = new Array(byteCharacters.length);
                                for (var i = 0; i < byteCharacters.length; i++) {
                                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                                }
                                var byteArray = new Uint8Array(byteNumbers);
                                var blob = new Blob([byteArray], { type: 'application/pdf' });
                                window.navigator.msSaveOrOpenBlob(blob, fileName);
                                return;
                            }

                            // For other browsers: 
                            // Create a link pointing to the ObjectURL containing the blob.
                            var data = window.URL.createObjectURL(newBlob);

                            var link = document.createElement('a');
                            document.body.appendChild(link); //required in FF, optional for Chrome
                            link.href = data;
                            link.download = fileName;
                            link.click();
                            window.URL.revokeObjectURL(data);
                            link.remove();

                            function base64ToArrayBuffer(data) {
                                var binaryString = window.atob(data);
                                var binaryLen = binaryString.length;
                                var bytes = new Uint8Array(binaryLen);
                                for (var i = 0; i < binaryLen; i++) {
                                    var ascii = binaryString.charCodeAt(i);
                                    bytes[i] = ascii;
                                }
                                return bytes;
                            }


                        }
                    },
                    error: function (e) {

                    }

                });



            },

            //Metodo que muestra los datos dl formulario de calidad
            editarFormularioCalidad: function (e, self) {
                var permiso = false;
                for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                    if (window.app.sesion.attributes.funciones[i].id === 153)
                        permiso = true;
                }
                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                } else {
                    var tr = $(e.target.parentNode.parentNode).closest("tr");
                    // get the data bound to the current table row
                    var item = $("#gridControlCalidadLote").data("kendoGrid").dataItem(tr);
                    var dataForm = new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: "../api/GetFormsByIdAlbaranPosicion/" + item.IdAlbaranPosicion,

                            }
                        },
                        requestEnd: function (data) {
                            var type = e.type;
                            if (data.response && data.type == "read") {
                                var jsonTemplate = JSON.parse(data.response[0].FormTemplate);
                                this.vistaFormComponent = new VistaFormComponent(
                                    {
                                        modeRuntimeNOTEdit: true,
                                        idDepartmentType: "0",
                                        modeConfig: false,
                                        terminalMode: false,
                                        formTemplate: JSON.parse(data.response[0].FormTemplate),
                                        refreshFunction: false,
                                        formInstance: data.response[0]
                                    })
                            }
                        },

                    });

                    dataForm.read();


                }
            },

            //Metodo que imprime el albarán de salida
            imprimirAlbaran: function (e, self) {
                if (self.IdAlbaranSelected) {
                    var form = document.createElement("form");
                    form.setAttribute("method", "POST");
                    form.setAttribute("action", "/Informes/INF-ALV-PROD_ALB_SAL_2.aspx");
                    form.setAttribute("target", "_blank");

                    var _field = document.createElement("input");
                    _field.setAttribute("name", "IdAlbaran");
                    _field.setAttribute("value", self.IdAlbaranSelected);
                    form.appendChild(_field);


                    var idiomaField = document.createElement("input");
                    idiomaField.setAttribute("name", "Idioma");
                    idiomaField.setAttribute("value", localStorage.getItem("idiomaSeleccionado"));
                    form.appendChild(idiomaField);

                    document.body.appendChild(form);

                    form.submit();
                }
            },

            //Metodo que muestra los pre-filtros de la consulta
            mostrarFiltros: function (self) {
                if ($("#divFilters").is(":visible")) {
                    $("#divFilters").hide("slow");
                    $("#btnFiltros").html('<span class="k-icon k-i-plus"></span>' + window.app.idioma.t('MOSTRAR_FILTROS'));
                    self.resizeContent(0);
                }
                else {
                    $("#divFilters").show("slow");
                    $("#btnFiltros").html('<span class="k-icon k-i-minus"></span>' + window.app.idioma.t('OCULTAR_FILTROS'));
                    self.resizeContent(1);
                }


            },

            //Metodo que renderiza todos los elementos del pre-filtrado
            renderElementsFilters: function () {

                $("#leyendaLotes").kendoTooltip({
                    content: kendo.template($("#templateLeyenda").html()),
                    autoHide: false,
                });

                $("#gridFilters").kendoGrid({
                    toolbar: [
                        {
                            scrollable: true,
                            template: kendo.template($("#tmpToolbar").html()),
                        },
                        {
                           scrollable: true,
                            template: kendo.template($("#tmpToolbarFiltros").html()),
                       },

                    ]
                })

                var dsAlmacen = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetDepot/",
                            dataType: "json"
                        }
                    },

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

                $("#cmbTipoMat").kendoDropDownList({
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    dataSource: dsTipoMaterial,
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdTipoMaterial",
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        //Se obtienen los dos combos que le siguen
                        var comboClaseMaterial = $("#cmbClaseMat").data('kendoDropDownList');
                        var comboReferencia = $("#cmbReferencia").data('kendoDropDownList');

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

                var cmbTipoMat = $("#cmbTipoMat").data("kendoDropDownList");
                cmbTipoMat.list.width("auto");


                var dsClaseMaterial = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetClaseMaterial",
                            dataType: "json"
                        }
                    }
                });

                $("#cmbClaseMat").kendoDropDownList({
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    dataSource: dsClaseMaterial,
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdClaseMaterial",
                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        //Se obtienen los dos combos que le siguen
                        var itemTipoMaterial = $("#cmbTipoMat").data("kendoDropDownList").dataItem($("#cmbTipoMat").data("kendoDropDownList").select());
                        var comboReferencia = $("#cmbReferencia").data('kendoDropDownList');

                        itemTipoMaterial.IdTipoMaterial = itemTipoMaterial.IdTipoMaterial == "" ? "00" : itemTipoMaterial.IdTipoMaterial;
                        dataItem.IdClaseMaterial = dataItem.IdClaseMaterial == "" ? "00" : dataItem.IdClaseMaterial;
                        //Se setea el DataSource se Ubicacion
                        comboReferencia.dataSource.transport.options.read.url = "../api/GetMaterial/" + itemTipoMaterial.IdTipoMaterial + "/" + dataItem.IdClaseMaterial;
                        comboReferencia.dataSource.read();
                        comboReferencia.select(0);
                    },
                    open: self.onElementOpen
                });

                var cmbClaseMat = $("#cmbClaseMat").data("kendoDropDownList");
                cmbClaseMat.list.width("auto");

                var dsReferenciaMaterial = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetMaterial",
                            dataType: "json"
                        }
                    }
                });


                $("#cmbReferencia").kendoDropDownList({
                    optionLabel: "- " + window.app.idioma.t('SELECCIONE_UNO') + " -",
                    dataSource: dsReferenciaMaterial,
                    filter: "contains",
                    dataTextField: "DescripcionCompleta",
                    dataValueField: "IdMaterial",
                    open: self.onElementOpen
                });

                var cmbReferencia = $("#cmbReferencia").data("kendoDropDownList");
                cmbReferencia.list.width("auto");

                var dsLoteProveedor = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetAlbaranPosicionLoteByFilter/LoteProveedor",
                            dataType: "json"
                        },
                        parameterMap: function (data, type) {
                            if (type == "read") {
                                if (typeof $('#cmbLoteProveedor').data("kendoComboBox") != "undefined")
                                    return {
                                        value: $('#cmbLoteProveedor').data("kendoComboBox").text()
                                    }
                                else {
                                    return {
                                        value: ""
                                    }

                                }
                            }
                        }
                    },

                });


                $("#cmbLoteProveedor").kendoComboBox({
                    optionLabel: window.app.idioma.t('LOTE_PROVEEDOR'),
                    dataSource: dsLoteProveedor,
                    filter: "contains",
                    filtering: function (e) {
                        e.preventDefault();
                        var filter = e.filter;
                        this.dataSource.read();
                    },
                    dataTextField: "LoteProveedor",
                    dataValueField: "LoteProveedor",
                    //open: self.onElementOpen 
                });

                var cmbLoteProveedor = $("#cmbLoteProveedor").data("kendoComboBox");
                cmbLoteProveedor.list.width("auto");

                $("#cmbLoteMes").kendoComboBox({
                    optionLabel: window.app.idioma.t('LOTE_MES'),
                    filter: "contains",
                    dataTextField: "LoteProveedor",
                    dataValueField: "LoteProveedor",
                    open: self.onElementOpen
                });

                var cmbLoteMes = $("#cmbLoteMes").data("kendoComboBox");
                cmbLoteMes.list.width("auto");


                $("#cmbPrioridad").kendoNumericTextBox({
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    min: 0,
                    max: 100,
                    format: "n0"
                });



                $(".panelbar").kendoPanelBar({
                    //expandMode: "single"
                    select: function (e) {
                        var _item = e.item;
                        switch (_item.innerText.trim()) {
                            case window.app.idioma.t('DOCUMENTOS').trim():
                                //jsDocumentos.ObtenerDocumentos(0);
                                break;
                            default:
                                break;
                        }
                    }
                });


                var today = new Date();
                var prevDay = new Date();
                prevDay.setDate(prevDay.getDate() - 1);
                var todayDate = kendo.toString(kendo.parseDate(new Date()), 'dd/MM/yyyy');
                var PrevDate = kendo.toString(kendo.parseDate(prevDay), 'dd/MM/yyyy');

                $("#cmbDesde").kendoDatePicker({
                    value: PrevDate,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#cmbHasta").kendoDatePicker({
                    value: todayDate,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#cmbProceso").kendoDropDownList({
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdProceso",
                    optionLabel: window.app.idioma.t("SELECCIONAR_PROCESO"),
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

                // jsDocumentos.ObtenerDocumentos(0);
            },

            //Metodo que renderiza el arbol de los lotes
            renderTree: function (self) {

                self.treeLotes = new $("#treeview").kendoTreeView({
                    dataBound: function (e) {
                        kendo.ui.progress($("#divGridSuperior"), false);
                        var node = e.node;
                        var selection = this.select();

                        if (self.loteSelected) {
                            var _treeView = $("#treeview").data("kendoTreeView");
                            var _itemTreeViewSelected = _treeView.findByText(self.loteSelected);
                            _treeView.select(_itemTreeViewSelected);
                        }

                        if (selection.length && (selection[0] == node[0] || $.contains(selection[0], node[0]))) {
                            this.expand(node.find(".k-treeview .k-item"));
                        }
                    },
                    autoBind: false,
                    select: function (e) {
                        var item = this.dataItem(e.node);
                        self.loteSelected = item.IdLoteMES;
                        self.IdAlbaranSelected = item.IdAlbaran;
                        self.loadData(self, item);
                    },
                    expand: function (e) {
                        var item = this.dataItem(e.node);
                        self.loteSelected = item.IdLoteMES;
                        self.IdAlbaranSelected = item.IdAlbaran;
                        //self.isPalet = item.Paleta;
                        self.loadData(self, item);
                    },
                    template: function (list) {
                        let _result = "";
                        if (list) {
                            switch (list.item.IdProceso) {
                                case self.procesosLote.ENV:
                                    _result = "<div class='circle_cells itemTreeEnvasado' ></div>";
                                    break;
                                case self.procesosLote.FAB:
                                    _result = "<div class='circle_cells itemTreeFab'></div>";
                                    break;
                                case self.procesosLote.REC:
                                    _result = "<div class='circle_cells itemTreeRec'></div>";
                                    break;
                                case self.procesosLote.COC:
                                    _result = "<div class='circle_cells itemTreeCoc'></div>";
                                    break;
                                 case self.procesosLote.FER:
                                    _result = "<div class='circle_cells itemTreeFer'></div>";
                                    break;
                                 case self.procesosLote.GUA:
                                    _result = "<div class='circle_cells itemTreeGua'></div>";
                                    break;
                                 case self.procesosLote.TCP:
                                    _result = "<div class='circle_cells itemTreeTcp'></div>";
                                    break;
                                default:
                                    _result = "<div class='circle_cells'></div>";
                                    break;
                            }
                        }
                        return _result + list.item.IdLoteMES;
                    },
                    dataTextField: "IdLoteMES",
                    dataValueField: "IdLoteMES",
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetLotesGenealogia",
                                dataType: "json",
                                contentType: "application/json; charset=utf-8",
                                type: "PUT"
                            },
                            parameterMap: function (data, type) {
                                if (type == "read") {
                                    var _idTipoMaterial = $("#cmbTipoMat").data("kendoDropDownList") != undefined ? $('#cmbTipoMat').data("kendoDropDownList").value() : null;
                                    var _idClaseMaterial = $("#cmbClaseMat").data("kendoDropDownList") != undefined ? $('#cmbClaseMat').data("kendoDropDownList").value() : null;
                                    var _idMaterial = $("#cmbReferencia").data("kendoDropDownList") != undefined ? $('#cmbReferencia').data("kendoDropDownList").value() : null;
                                    var _idAlmacen = $("#cmbAlmacen").data("kendoDropDownList") != undefined ? parseInt(self.getValueVariable("cmbAlmacen", "kendoDropDownList")) : null;
                                    var _idZona = $("#cmbZona").data("kendoDropDownList") != undefined ? parseInt(self.getValueVariable("cmbZona", "kendoDropDownList")) : null;
                                    var _idUbicacion = $("#cmbUbicacion").data("kendoDropDownList") != undefined ? parseInt(self.getValueVariable("cmbUbicacion", "kendoDropDownList")) : null;
                                    var _loteProveedor = $("#cmbLoteProveedor").val();
                                    var _loteMES = $("#cmbLoteMes").val();
                                    var _cmbDesde = $("#cmbDesde").val() != "" ? kendo.parseDate($("#cmbDesde").data('kendoDatePicker').value(), "yyyy-mm-dd") : null;
                                    var _cmbHasta = $("#cmbHasta").val() != "" ? kendo.parseDate($("#cmbHasta").data('kendoDatePicker').value(), "yyyy-mm-dd") : null;
                                    var _cmbProceso = $("#cmbProceso").val() != "" ? parseInt(self.getValueVariable("cmbProceso", "kendoDropDownList")) : null;

                                    //var _idProveedor = $("#cmbProveedor").data("kendoDropDownList") != undefined ? parseInt(self.getValueVariable("cmbProveedor", "kendoDropDownList")) : null;
                                    if (_idTipoMaterial == "Dummy") {
                                        _idTipoMaterial = "06";
                                    }


                                    return JSON.stringify({
                                        IdLoteMES: _loteMES ? _loteMES : null,
                                        IdTipoMaterial: _idTipoMaterial ? _idTipoMaterial : null,
                                        IdClaseMaterial: _idClaseMaterial ? _idClaseMaterial: null,
                                        IdMaterial: _idMaterial ? _idMaterial : null,
                                        IdAlmacen: _idAlmacen ? _idAlmacen : null,
                                        IdZona: _idZona ? _idZona : null,
                                        IdUbicacion: _idUbicacion ? _idUbicacion: null,
                                        LoteProveedor: _loteProveedor ? _loteProveedor : null,
                                        IdLoteExpandido: data.IdLoteMES ? data.IdLoteMES : null,
                                        FechaInicio: _cmbDesde,
                                        FechaFin: _cmbHasta,
                                        HaciaProducto: self.attrHaciaProducto,
                                        IdProceso: _cmbProceso ? _cmbProceso : null
                                    });
                                }
                            },

                        },
                        sort: [{ field: "IdProceso", dir: "asc" },
                            { field: "Creado", dir: "desc" }],
                        schema: {
                            id: "IdLoteMES",
                            model: {
                                id: "IdLoteMES",
                                IdProceso: "IdProceso",
                                hasChildren: "hasChildren"
                            }
                        },
                        requestStart: function () {
                            kendo.ui.progress($("#divGridSuperior"), true);

                        }


                    }
                });
            },

            //Metodo que obtiene el valor de un item segun su id y el tipo
            getValueVariable: function (id, tipo) {
                return typeof $('#' + id).data(tipo).dataItems() !== 'undefined' ? isNaN(parseInt($('#' + id).data(tipo).value())) ? null : $('#' + id).data(tipo).value() : null;
            },

            //Metodo que limpia todos los prefiltros
            limpiarFiltros: function (self) {

                var today = new Date();
                var prevDay = new Date();
                prevDay.setDate(prevDay.getDate() - 1);
                var todayDate = kendo.toString(kendo.parseDate(new Date()), 'dd/MM/yyyy');
                var PrevDate = kendo.toString(kendo.parseDate(prevDay), 'dd/MM/yyyy');


                $("#cmbDesde").data("kendoDatePicker").value(PrevDate);
                $("#cmbDesde").val(PrevDate);

                $("#cmbHasta").data("kendoDatePicker").value(todayDate);
                $("#cmbHasta").val(todayDate);

                $("#chkLotesConsumidos").prop('checked', true);

                var _cmbAlmacen = $("#cmbAlmacen").data("kendoDropDownList");
                _cmbAlmacen.select(0);
                _cmbAlmacen.trigger("select");

                var _cmbTipoMat = $("#cmbTipoMat").data("kendoDropDownList");
                _cmbTipoMat.select(0);
                _cmbTipoMat.trigger("select");


                $("#cmbLoteProveedor").data("kendoComboBox").value('');
                $("#cmbLoteMes").data("kendoComboBox").value('');

                $("#treeview").data("kendoTreeView").select('');
            },

            //DATOS LOTE
            renderData_L1: function (self) {
                //self.dsAnaliticaLote = new kendo.data.DataSource({
                //    autoBind: false,
                //    transport: {
                //        read: {
                //            url: "../api/GetAnaliticaLote",
                //            dataType: "json"
                //        },
                //        parameterMap: function (data, type) {
                //            if (type == "read") {
                //                return {
                //                    IdLote: self.loteSelected ? self.loteSelected : null
                //                };

                //            }
                //        },

                //    },
                //});

                //if (!self.dsControlCalidadLote) {
                //    self.dsControlCalidadLote = new kendo.data.DataSource({
                //        autoBind: false,
                //        pageSize: 30,
                //        transport: {
                //            read: {
                //                url: "../api/GetControlCalidadLote",
                //                dataType: "json"
                //            },
                //            parameterMap: function (data, type) {
                //                if (type == "read") {
                //                    return {
                //                        IdLote: self.loteSelected ? self.loteSelected : null
                //                    };

                //                }
                //            },

                //        },
                //    });
                //}

                self.dsDatosLotes = [
                    { "Nombre": window.app.idioma.t('FECHA_CREACION'), "Valor": "" },
                    { "Nombre": window.app.idioma.t('ID_LOTE'), "Valor": "" },
                    { "Nombre": window.app.idioma.t('CODIGO_MATERIAL_JDE'), "Valor": "" },
                    { "Nombre": window.app.idioma.t('CANTIDAD_INICIAL'), "Valor": "" },
                    { "Nombre": window.app.idioma.t('CANTIDAD_ACTUAL'), "Valor": "" },
                    { "Nombre": window.app.idioma.t('UBICACION'), "Valor": "" },
                    { "Nombre": window.app.idioma.t('PROVEEDOR'), "Valor": "" },
                    { "Nombre": window.app.idioma.t('LOTE_PROVEEDOR'), "Valor": "" },
                    { "Nombre": window.app.idioma.t('FECHA_CADUCIDAD'), "Valor": "" },
                ];

                $("#gridDatosLote").kendoGrid({
                    dataSource: self.dsDatosLotes,
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    refresh: true,
                    resizable: true,
                    columns: [
                        {
                            field: "Nombre",
                            title: window.app.idioma.t("NOMBRE").toUpperCase(),
                        },
                         {
                             field: "Valor",
                             title: window.app.idioma.t("VALOR").toUpperCase(),
                             template: self.getValue,
                             attributes: {
                                 style: 'white-space: nowrap ',
                             },
                         },

                    ]
                });

                $("#gridAnaliticasLote").kendoGrid({
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [30, 100, 200, 'All'],
                        buttonCount: 2,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    resizable: true,
                    columns: [
                         {
                             field: "ID_ANALITICA",
                             title: window.app.idioma.t("ID_ANALITICA").toUpperCase(),
                         },
                         {
                             field: "TIPO_ANALITICA",
                             title: window.app.idioma.t("TIPO_ANALITICA").toUpperCase(),
                         },
                         {
                             field: "FECHA_INICIO",
                             template: '#= FECHA_INICIO != null ? kendo.toString(new Date(FECHA_INICIO), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                             title: window.app.idioma.t("FECHA_INICIO").toUpperCase(),
                         },
                         {
                             field: "FECHA_FIN",
                             template: '#= FECHA_FIN != null ? kendo.toString(new Date(FECHA_FIN), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                             title: window.app.idioma.t("FECHA_FIN").toUpperCase(),
                         },
                         {
                             field: "RESULTADO",
                             title: window.app.idioma.t("RESULTADO").toUpperCase(),
                         },
                         {
                             field: "VALORES",
                             title: window.app.idioma.t("VALORES").toUpperCase(),
                         },
                    ]
                });

                $("#gridControlCalidadLote").kendoGrid({
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [30, 100, 200, 'All'],
                        buttonCount: 2,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    resizable: true,
                    dataSource: self.dsControlCalidadLote,
                    columns: [
                         {
                             field: "Nombre",
                             title: window.app.idioma.t("FORMULARIO").toUpperCase(),
                         },
                         {
                             field: "Descripcion",
                             title: window.app.idioma.t("DESCRIPCION").toUpperCase(),
                         },
                         {
                             field: "FechaCreacion",
                             template: '#= FechaCreacion != null ? kendo.toString(new Date(FechaCreacion), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                             title: window.app.idioma.t("FECHA_CREACION").toUpperCase(),
                         },
                         {
                             field: "ColorSemaforo",
                             attributes: { "align": "center" },
                             width: "10%",
                             title: window.app.idioma.t("RESULTADO").toUpperCase(),
                             template: "#if(typeof ColorSemaforo !== 'undefined' && ColorSemaforo != null){#<img id='imgEstado' src='img/KOP_#= ColorSemaforo #.png'></img>#}#"
                         },
                         {
                             field: "Plantilla",
                             attributes: { "align": "center" },
                             title: window.app.idioma.t("VALORES").toUpperCase(),
                             template: "<a href='\\#' id='btnEditarCalidad'>" + window.app.idioma.t("VALORES") + "</a>"
                         },
                    ]
                });

                $("#gridDatosLote").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

                
            },

            renderData_LWO: function (self) {
                if (!self.dsWO) {
                    self.dsWO = new kendo.data.DataSource({
                        schema: {
                            model: {
                                id: "CodWO",
                                fields: {
                                    CodWO: { type: "string" },
                                    NombreUbicacion: { type: "string" },
                                    FechaInicioPlan: { type: "date" },
                                    FechaFinPlan: { type: "date" },
                                    CantidadPlan: { type: "number" },
                                    FechaInicioReal: { type: "date" },
                                    FechaFinReal: { type: "date" },
                                    CantidadReal: { type: "number" }
                                }
                            }
                        },
                        pageSize: 30,
                        transport: {
                            read: {
                                url: "../api/GetOrdenPorLote",
                                dataType: "json"
                            },
                            parameterMap: function (data, type) {
                                if (type == "read") {
                                    return {
                                        IdLote: self.loteSelected ? self.loteSelected : null
                                    };

                                }
                            },

                        },
                    });
                }
                if (!$("#gridWO").data("kendoGrid")) {
                    $("#gridWO").kendoGrid({
                        noRecords: {
                            template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                        },
                        filterable: {
                            extra: false,
                            messages: window.app.cfgKendo.configuracionFiltros_Msg,
                            operators: window.app.cfgKendo.configuracionFiltros_Operadores
                        },
                        resizable: true,
                        excel: {
                            fileName: window.app.idioma.t('WO') + "_" + self.loteSelected + ".xlsx",
                            filterable: true,
                            allPages: true,
                        },
                        dataSource: self.dsWO,
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            pageSizes: [30, 100, 200, 'All'],
                            buttonCount: 2,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        toolbar: [
                            {
                                template: "<label style='margin:5px'>" + window.app.idioma.t('ORDEN').toUpperCase() + "</label>"
                            },
                            {
                                template: '<div style="float: right; margin-right: 10px;"><button  class="k-button k-button-icontext k-grid-excel" style="margin-left: 5px;">' +
                                    '<span class="k-icon k-i-excel"></span>' + window.app.idioma.t('EXPORTAR_EXCEL') + '</button></div>'

                            }

                        ],

                        columns: [
                            {
                                field: "CodWO",
                                attributes: {
                                    style: 'white-space: nowrap ',
                                },
                                title: window.app.idioma.t("CODIGO_ORDEN"),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    class: 'addTooltip'
                                },
                            },
                            {
                                field: "NombreUbicacion",
                                title: window.app.idioma.t("UBICACION"),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    class: 'addTooltip'
                                },
                            },
                            {
                                field: "FechaInicioPlan",
                                title: window.app.idioma.t("FECHA_INICIO_PLANIFICADA"),
                                template: '#= FechaInicioPlan != null ? kendo.toString(new Date(FechaInicioPlan), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    class: 'addTooltip'
                                },
                            },
                            {
                                field: "FechaFinPlan",
                                template: '#= FechaFinPlan != null ? kendo.toString(new Date(FechaFinPlan), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                                title: window.app.idioma.t("FECHA_FIN_PLANIFICADA"),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    class: 'addTooltip'
                                },
                            },
                            {
                                field: "CantidadPlan",
                                title: window.app.idioma.t("CANTIDAD_PLANIFICADA"),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    class: 'addTooltip'
                                },
                            },
                            {
                                field: "FechaInicioReal",
                                template: '#= FechaInicioReal != null ? kendo.toString(new Date(FechaInicioReal), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                                title: window.app.idioma.t("FECHA_INICIO_REAL"),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    class: 'addTooltip'
                                },
                            },
                            {
                                field: "FechaFinReal",
                                title: window.app.idioma.t("FECHA_FIN_REAL"),
                                template: '#= FechaFinReal != null ? kendo.toString(new Date(FechaFinReal), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    class: 'addTooltip'
                                },
                            },
                            {
                                field: "CantidadReal",
                                title: window.app.idioma.t("CANTIDAD_REAL"),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    class: 'addTooltip'
                                },
                            },
                        ]
                    });

                    $("#gridWO").kendoTooltip({
                        filter: ".addTooltip",
                        content: function (e) {
                            return e.target.html();
                        }
                    }).data("kendoTooltip");
                }
            },

            renderData_LTransferencia: function (self) {
               
                if (!self.dsTransferencias) {
                    self.dsTransferencias = new kendo.data.DataSource({
                        async: true,
                        transport: {
                            read: {
                                url: "../api/ObtenerTransferenciasFabricacionPorLote",
                                type: "GET"
                            },
                            parameterMap: function (options, operation) {
                                if (operation === "read") {
                                    return {
                                        lote: self.loteSelected ? self.loteSelected : null
                                    };
                                }

                            }
                        },
                        sort: { field: "FechaFin", dir: "desc" },
                        schema: {
                            model: {
                                id: "IdTransferencia",
                                fields: {
                                    'IdTransferencia': { type: "number" },
                                    'LoteSAI': { type: "string" },
                                    'MaterialSAI': { type: "string" },
                                    'FechaInicio': { type: "date" },
                                    'FechaFin': { type: "date" },
                                    'UbicacionOrigen': { type: "string" },
                                    'UbicacionDestino': { type: "string" },
                                    'Cantidad': { type: "number" },
                                    'Unidad': { type: "string" }
                                }
                            }
                        },
                        pageSize: 50,
                    });
                }
                if (!$("#gridTransferencias").data("kendoGrid")) {
                    $("#gridTransferencias").kendoGrid({
                        autoBind: false,
                        dataSource: self.dsTransferencias,
                        sortable: true,
                        scrollable: true,
                        resizable: true,
                        noRecords: {
                            template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                        },
                        toolbar: [{
                            template: "<span>"+ window.app.idioma.t('TRANSFERENCIA') + "</span>"
                        }],
                        filterable: {
                            extra: false,
                            messages: window.app.cfgKendo.configuracionFiltros_Msg,
                            operators: window.app.cfgKendo.configuracionFiltros_Operadores
                        },
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            pageSizes: [50, 100, 1000, 'All'],
                            buttonCount: 5,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        columns: [
                            {
                                title: window.app.idioma.t("LOTE_SAI"),
                                field: 'LoteSAI',
                                template: "<span class='addTooltip'>#=LoteSAI != null ? LoteSAI : ''#</span>",
                                attributes: { "align": "center", style: 'white-space: nowrap ', },
                                width: 300
                            },
                            {
                                title: window.app.idioma.t("MATERIAL_SAI"),
                                field: 'MaterialSAI',
                                template: "<span class='addTooltip'>#=MaterialSAI != null ? MaterialSAI : ''#</span>",
                                attributes: { "align": "center", style: 'white-space: nowrap ', },
                                width: 150
                            },
                            {
                                title: window.app.idioma.t("FECHA"),
                                field: 'FechaFin',
                                template: "<span class='addTooltip'>#= FechaFin != null ? kendo.toString(new Date(FechaFin), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : '' #</span>",
                                attributes: { "align": "center", style: 'white-space: nowrap ', },
                                width: 200,
                                filterable: {
                                    extra: true,
                                    ui: function (element) {
                                        element.kendoDateTimePicker({
                                            format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                            culture: localStorage.getItem("idiomaSeleccionado")
                                        });
                                    }
                                },
                            },
                            {
                                title: window.app.idioma.t("UBICACION_ORIGEN"),
                                field: 'UbicacionOrigen',
                                template: "<span class='addTooltip'>#=UbicacionOrigen != null ? UbicacionOrigen : ''#</span>",
                                attributes: { "align": "center", style: 'white-space: nowrap ', },
                                width: 150
                            },
                            {
                                title: window.app.idioma.t("UBICACION_DESTINO"),
                                field: 'UbicacionDestino',
                                template: "<span class='addTooltip'>#=UbicacionDestino != null ? UbicacionDestino : ''#</span>",
                                attributes: { "align": "center", style: 'white-space: nowrap ', },
                                width: 150
                            },
                            {
                                title: window.app.idioma.t("CANTIDAD"),
                                field: 'Cantidad',
                                aggregates: ["sum"],
                                groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n2}',sum) #",
                                template: '#= kendo.format("{0:n2}",Cantidad)#',
                                attributes: { "align": "center", style: 'white-space: nowrap ', },
                                width: 100,
                                filterable: {
                                    ui: function (element) {
                                        element.kendoNumericTextBox({
                                            format: "{0:n2}",
                                            culture: localStorage.getItem("idiomaSeleccionado")
                                        })
                                    }
                                },
                            },
                            {
                                title: window.app.idioma.t("UNIDAD"),
                                field: 'Unidad',
                                template: "<span class='addTooltip'>#=Unidad != null ? Unidad : ''#</span>",
                                attributes: { "align": "center", style: 'white-space: nowrap ', },
                                width: 80
                            },
                        ],
                    });

                    $("#gridTransferencias").kendoTooltip({
                        filter: ".addTooltip",
                        content: function (e) {
                            return e.target.html();
                        }
                    }).data("kendoTooltip");
                }

                self.ResizeTab("gridTransferencias");
            },

            ResizeTab: function (idGrid) {
                var cabeceraHeight1 = $("#divCabeceraVista").height();
                var contenedorHeight = $("#center-pane").height();
                var toolbarHeight = $(".k-grid-toolbar").height() < 70 ? $(".k-grid-toolbar").height() + 53 : $(".k-grid-toolbar").height();
                var cabeceraHeight = $(".k-grouping-header").height();
                var headerHeightGrid = $(".k-grid-header").height();
                var divFiltersGrid = $("#divFilters").height();

                var gridElement = $("#" + idGrid),
                    dataArea = gridElement.find(".k-grid-content:first"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - toolbarHeight - cabeceraHeight1 - cabeceraHeight - divFiltersGrid - headerHeightGrid - 100);

            },

            getValue: function (e, options) {
                var _value = e.Valor + '';
                var patt = new RegExp(/^(\d{4}|\d{1}|\d{2})\/(\d{1}|\d{2})\/(\d{1}|\d{2}|\d{4}) (\d{1}|\d{2}):\d{2}:\d{2}$/);
                var res = patt.test(_value);
                if (res) {
                    //Esta fecha se castea directamente como "dd/MM/yyyy HH:mm:ss" porque siempre viene con ese formato desde base de datos
                    return kendo.toString(kendo.parseDate(e.Valor, "dd/MM/yyyy HH:mm:ss"), kendo.culture().calendars.standard.patterns.MES_FechaHora)
                } else if (!isNaN(parseFloat(_value))) {
                    return kendo.format('{0:n2}', e.Valor)
                }
                else if (e.Nombre == window.app.idioma.t('ALBARAN_SALIDA')) {
                    return "<a id='btnImprimirAlbaranSalida' target='_blank'>" + e.Valor + "</a>";
                } else if (e.Valor == null) {
                    return "";
                }
                return e.Valor;

            },

            //ENTRADA A PLANTA
            renderData_L2: function (self) {
                if (!self.dsDatosDescarga) {
                    self.dsDatosDescarga = self.dsDatosGridGenerico(self, 4);
                }


                if (!$("#gridDatosDescarga_EntradaPlanta").data("kendoGrid")) {
                    $("#gridDatosDescarga_EntradaPlanta").kendoGrid({
                        dataSource: self.dsDatosDescarga,
                        noRecords: {
                            template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                        },
                        resizable: true,
                        columns: [
                            {
                                field: "Nombre",
                                title: window.app.idioma.t("NOMBRE").toUpperCase(),
                            },
                             {
                                 field: "Valor",
                                 title: window.app.idioma.t("VALOR").toUpperCase(),
                                 template: self.getValue,
                             },

                        ]
                    });
                }

                if (!self.dsDatosTransporteEntrada) {
                    self.dsDatosTransporteEntrada = self.dsDatosGridGenerico(self, 1);
                }

                if (!$("#gridDatosTransporte_EntradaPlanta").data("kendoGrid")) {
                    $("#gridDatosTransporte_EntradaPlanta").kendoGrid({
                        dataSource: self.dsDatosTransporteEntrada,
                        noRecords: {
                            template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                        },
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            pageSizes: [30, 100, 200, 'All'],
                            buttonCount: 2,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        columns: [
                            {
                                field: "Nombre",
                                title: window.app.idioma.t("NOMBRE").toUpperCase(),
                            },
                             {
                                 field: "Valor",
                                 title: window.app.idioma.t("VALOR").toUpperCase(),
                                 template: self.getValue,
                             },

                        ]
                    });
                }

                if (!self.dsDocumentos)
                    self.dsDocumentos = self.dsDocumentosFunc(self);


                if (!$("#gridDocumentos_EntradaPlanta").data("kendoGrid")) {
                    $("#gridDocumentos_EntradaPlanta").kendoGrid({
                        noRecords: {
                            template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                        },
                        autoBind: false,
                        dataSource: self.dsDocumentos,
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            pageSizes: [30, 100, 200, 'All'],
                            buttonCount: 2,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        columns: [
                             {
                                 field: "TipoDocumento",
                                 title: window.app.idioma.t("TIPO_DOCUMENTO").toUpperCase(),
                                 template: "#= TipoDocumento != undefined ? TipoDocumento.Descripcion : ''  #"
                             },
                             {
                                 field: "Descripcion",
                                 title: window.app.idioma.t("DESCRIPCION").toUpperCase(),
                             },
                             {
                                 field: "Fichero",
                                 title: window.app.idioma.t("ENLACE").toUpperCase(),
                                 template: "<a href='\\#' id='btnDescargarDocumento_Entrada'>#= NombreFichero #</a>",
                             },
                        ]
                    });
                }
            },

            //SALIDA DE PLANTA
            renderData_L3: function (self) {
                if (!self.dsDatosCarga) {
                    self.dsDatosCarga = self.dsDatosGridGenerico(self, 3);
                }


                if (!$("#gridDatosCarga_SalidaPlanta").data("kendoGrid")) {
                    $("#gridDatosCarga_SalidaPlanta").kendoGrid({
                        dataSource: self.dsDatosCarga,
                        noRecords: {
                            template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                        },
                        resizable: true,
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            pageSizes: [30, 100, 200, 'All'],
                            buttonCount: 2,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        columns: [
                            {
                                field: "Nombre",
                                title: window.app.idioma.t("NOMBRE").toUpperCase(),
                            },
                             {
                                 field: "Valor",
                                 title: window.app.idioma.t("VALOR").toUpperCase(),
                                 template: self.getValue,
                             },

                        ]
                    });
                }

                if (!self.dsDatosTransporteSalida) {
                    self.dsDatosTransporteSalida = self.dsDatosGridGenerico(self, 2);
                }

                if (!$("#gridDatosTransporte_SalidaPlanta").data("kendoGrid")) {
                    $("#gridDatosTransporte_SalidaPlanta").kendoGrid({
                        dataSource: self.dsDatosTransporteSalida,
                        noRecords: {
                            template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                        },
                        resizable: true,
                        columns: [
                            {
                                field: "Nombre",
                                title: window.app.idioma.t("NOMBRE").toUpperCase(),
                            },
                             {
                                 field: "Valor",
                                 title: window.app.idioma.t("VALOR").toUpperCase(),
                                 template: self.getValue
                             },

                        ]
                    });
                }

                if (!self.dsDocumentos)
                    self.dsDocumentos = self.dsDocumentosFunc(self);

                if (!$("#gridDocumentos_SalidaPlanta").data("kendoGrid")) {
                    $("#gridDocumentos_SalidaPlanta").kendoGrid({
                        autoBind: false,
                        resizable: true,
                        noRecords: {
                            template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                        },
                        dataSource: self.dsDocumentos,
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            pageSizes: [30, 100, 200, 'All'],
                            buttonCount: 2,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        columns: [
                              {
                                  field: "TipoDocumento",
                                  title: window.app.idioma.t("TIPO_DOCUMENTO").toUpperCase(),
                                  template: "#= TipoDocumento != undefined ? TipoDocumento.Descripcion : ''  #"
                              },
                             {
                                 field: "Descripcion",
                                 title: window.app.idioma.t("DESCRIPCION").toUpperCase(),
                             },
                             {
                                 field: "Fichero",
                                 title: window.app.idioma.t("ENLACE").toUpperCase(),
                                 template: "<a href='\\#' id='btnDescargarDocumento_Salida'>#= NombreFichero #</a>",
                             },
                        ]
                    });
                }
            },

            //PROCESOS
            renderData_L4: function (self) {
                if (!self.dsProcesos) {
                    self.dsProcesos = new kendo.data.DataSource({
                        schema: {
                            model: {
                                id: "IdOrdenOrigen",
                                fields: {
                                    IdOrdenOrigen: { type: "string" },
                                    IdOrdenDestino: { type: "string" },
                                    TipoOrden: { type: "string" },
                                    FechaInicio: { type: "date" },
                                    FechaFin: { type: "date" },
                                    Descripcion: { type: "string" }

                                }
                            }
                        },
                        pageSize: 30,
                        transport: {
                            read: {
                                url: "../api/GetProcesos",
                                dataType: "json"
                            },
                            parameterMap: function (data, type) {
                                if (type == "read") {
                                    return {
                                        IdLote: self.loteSelected ? self.loteSelected : null,
                                        HaciaProducto: self.attrHaciaProducto,
                                    };

                                }
                            },

                        },
                    });
                }

                if (!$("#gridProcesos").data("kendoGrid")) {
                    $("#gridProcesos").kendoGrid({
                        dataSource: self.dsProcesos,
                        resizable: true,
                        filterable: {
                            extra: false,
                            messages: window.app.cfgKendo.configuracionFiltros_Msg,
                            operators: window.app.cfgKendo.configuracionFiltros_Operadores
                        },
                        noRecords: {
                            template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                        },
                        excel: {
                            fileName: window.app.idioma.t('PROCESOS') + "_" + self.loteSelected + ".xlsx",
                            filterable: true,
                            allPages: true,
                        },
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            pageSizes: [30, 100, 200, 'All'],
                            buttonCount: 2,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        toolbar: [
                        {
                            template: "<label style='margin:5px'>" + window.app.idioma.t('PROCESOS_RELACIONADOS').toUpperCase() + "</label>"
                        },
                        {
                            template: '<div style="float: right; margin-right: 10px;"><button id="btnExportExcel" class="k-button k-button-icontext k-grid-excel" style="margin-left: 5px;">' +
                                      '<span class="k-icon k-i-excel"></span>' + window.app.idioma.t('EXPORTAR_EXCEL') + '</button></div>'

                        }

                        ],
                        columns: [
                             {
                                 field: "IdOrdenOrigen",
                                 template: '#= IdOrdenOrigen ? IdOrdenOrigen: "N/A" #',
                                 title: window.app.idioma.t("ORDEN_ORIGEN").toUpperCase(),
                                 filterable: true,
                                 attributes: {
                                     style: 'white-space: nowrap ',
                                     class: 'addTooltip'
                                 },
                             },
                             {
                                 field: "IdOrdenDestino",
                                 template: '#= IdOrdenDestino ? IdOrdenDestino: "N/A" #',
                                 title: window.app.idioma.t("ORDEN_DESTINO").toUpperCase(),
                                 filterable: true,
                                 attributes: {
                                     style: 'white-space: nowrap ',
                                     class: 'addTooltip'
                                 },
                             },
                             {
                                 field: "Proceso",
                                 template: "#= Proceso  ? window.app.idioma.t('ORDER_TYPE_'+Proceso) : 'N/A' #",
                                 title: window.app.idioma.t("TIPO_ORDEN").toUpperCase(),
                                 filterable: true
                             },
                             {
                                 field: "FechaInicio",
                                 template: '#= FechaInicio != null ? kendo.toString(new Date(FechaInicio), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                                 title: window.app.idioma.t("FECHA_INICIO").toUpperCase(),
                                 filterable: true,
                                 attributes: {
                                     style: 'white-space: nowrap ',
                                     class: 'addTooltip'
                                 },
                             },
                              {
                                  field: "FechaFin",
                                  template: '#= FechaFin != null ? kendo.toString(new Date(FechaFin), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                                  title: window.app.idioma.t("FECHA_FIN").toUpperCase(),
                                  filterable: true,
                                  attributes: {
                                      style: 'white-space: nowrap ',
                                      class: 'addTooltip'
                                  },
                              },
                              {
                                  field: "TipoOperacion",
                                  title: window.app.idioma.t("OPERACION").toUpperCase(),
                                  filterable: true,
                                  template: "#=TipoOperacion != undefined && TipoOperacion != null? TipoOperacion.split('_')[0]:''#"
                              },
                        ]
                    });

                    $("#gridProcesos").kendoTooltip({
                        filter: ".addTooltip",
                        content: function (e) {
                            return e.target.html();
                        }
                    }).data("kendoTooltip");
                }
            },

            //OPERACIONES
            renderData_L5: function (self) {
                if (!self.dsOperaciones) {
                    self.dsOperaciones = new kendo.data.DataSource({
                        pageSize: 30,
                        transport: {
                            read: {
                                url: "../api/GetOperaciones",
                                dataType: "json"
                            },
                            parameterMap: function (data, type) {
                                if (type == "read") {
                                    return {
                                        IdLote: self.loteSelected ? self.loteSelected : null
                                    };

                                }
                            },

                        },
                    });
                }

                if (!$("#gridOperaciones").data("kendoGrid")) {
                    $("#gridOperaciones").kendoGrid({
                        resizable: true,
                        dataSource: self.dsOperaciones,
                        noRecords: {
                            template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                        },
                        filterable: {
                            extra: false,
                            messages: window.app.cfgKendo.configuracionFiltros_Msg,
                            operators: window.app.cfgKendo.configuracionFiltros_Operadores
                        },
                        excel: {
                            fileName: window.app.idioma.t('OPERACIONES') + "_" + self.loteSelected + ".xlsx",
                            filterable: true,
                            allPages: true,
                        },
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            pageSizes: [30, 100, 200, 'All'],
                            buttonCount: 2,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        toolbar: [
                       {
                           template: "<label style='margin:5px'>" + window.app.idioma.t('OPERACIONES_REALIZADAS_LOTE').toUpperCase() + "</label>"
                       },
                       {
                           template: '<div style="float: right; margin-right: 10px;"><button id="btnExportExcel" class="k-button k-button-icontext k-grid-excel" style="margin-left: 5px;">' +
                                     '<span class="k-icon k-i-excel"></span>' + window.app.idioma.t('EXPORTAR_EXCEL') + '</button></div>'

                       }

                        ],
                        columns: [
                             {
                                 field: "FechaInicio",
                                 template: '#= FechaInicio != null ? kendo.toString(new Date(FechaInicio), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                                 title: window.app.idioma.t("FECHA").toUpperCase(),
                                 attributes: {
                                     style: 'white-space: nowrap ',
                                     class: 'addTooltip'
                                 },
                             },
                             {
                                 field: "TipoOperacion",
                                 title: window.app.idioma.t("TIPO_OPERACION").toUpperCase(),
                             },
                             {
                                 field: "IdLoteMES",
                                 title: window.app.idioma.t("ID_LOTE").toUpperCase(),
                                 attributes: {
                                     style: 'white-space: nowrap ',
                                     class: 'addTooltip'
                                 },
                             },
                              {
                                  field: "Cantidad",
                                  template: '#= kendo.format("{0:n2}",Cantidad)#',
                                  title: window.app.idioma.t("CANTIDAD").toUpperCase(),
                              },
                               {
                                   field: "IdOrdenOrigen",
                                   template: '#= IdOrdenOrigen ? IdOrdenOrigen: "N/A" #',
                                   title: window.app.idioma.t("ORDEN_ORIGEN").toUpperCase(),
                                   attributes: {
                                       style: 'white-space: nowrap ',
                                       class: 'addTooltip'
                                   },
                               },
                             {
                                 field: "IdOrdenDestino",
                                 template: '#= IdOrdenDestino ? IdOrdenDestino: "N/A" #',
                                 title: window.app.idioma.t("ORDEN_DESTINO").toUpperCase(),
                                 attributes: {
                                     style: 'white-space: nowrap ',
                                     class: 'addTooltip'
                                 },
                             },
                              {
                                  field: "UbicacionOrigen",
                                  template: '#= UbicacionOrigen ? UbicacionOrigen: "N/A" #',
                                  title: window.app.idioma.t("UBICACION_ORIGEN").toUpperCase(),
                                  attributes: {
                                      style: 'white-space: nowrap ',
                                      class: 'addTooltip'
                                  },
                              },
                              {
                                  field: "UbicacionDestino",
                                  template: '#= UbicacionDestino ? UbicacionDestino: "N/A" #',
                                  title: window.app.idioma.t("UBICACION_DESTINO").toUpperCase(),
                                  attributes: {
                                      style: 'white-space: nowrap ',
                                      class: 'addTooltip'
                                  },
                              },
                        ]
                    });

                    $("#gridOperaciones").kendoTooltip({
                        filter: ".addTooltip",
                        content: function (e) {
                            return e.target.html();
                        }
                    }).data("kendoTooltip");
                }
            },

            //MMPP
            renderData_L6: function (self) {
                if (!self.dsMMPP) {
                    self.dsMMPP = new kendo.data.DataSource({
                        pageSize: 30,
                        group: { field: "IdMaterial" },
                        transport: {
                            read: {
                                url: "../api/GetArbolPadres",
                                dataType: "json"
                            },
                            parameterMap: function (data, type) {
                                if (type == "read") {
                                    return {
                                        IdLote: self.loteSelected ? self.loteSelected : null,
                                    };

                                }
                            },

                        },
                    });
                }
                if (!$("#gridMaterias").data("kendoGrid")) {
                    $("#gridMaterias").kendoGrid({
                        dataSource: self.dsMMPP,
                        scrollable: true,
                        noRecords: {
                            template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                        },
                        filterable: {
                            extra: false,
                            messages: window.app.cfgKendo.configuracionFiltros_Msg,
                            operators: window.app.cfgKendo.configuracionFiltros_Operadores
                        },
                        excel: {
                            fileName: window.app.idioma.t('MATERIAS') + "_" + self.loteSelected + ".xlsx",
                            filterable: true,
                            allPages: true,
                        },
                        resizable: true,
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            pageSizes: [30, 100, 200, 'All'],
                            buttonCount: 2,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        toolbar: [
                       {
                           template: "<label style='margin:5px'>" + window.app.idioma.t('MATERIAS_PRIMAS_COMPONEN_LOTE').toUpperCase() + "</label>"
                       },
                       {
                           template: '<div style="float: right; margin-right: 10px;"><button  class="k-button k-button-icontext k-grid-excel" style="margin-left: 5px;">' +
                                     '<span class="k-icon k-i-excel"></span>' + window.app.idioma.t('EXPORTAR_EXCEL') + '</button></div>'

                       }

                        ],
                        columns: [
                             {
                                 field: "ClaseMaterial",
                                title: window.app.idioma.t("CLASE").toUpperCase(),
                                width: 100,
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    class: 'addTooltip'
                                },
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field === "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=ClaseMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#=ClaseMaterial#</label></div>";
                                        }
                                    }
                                },
                            },
                            {
                                field: "TipoMaterial",
                                title: window.app.idioma.t("TIPO").toUpperCase(),
                                width: 100,
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    class: 'addTooltip'
                                },
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field === "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=TipoMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#=TipoMaterial#</label></div>";
                                        }
                                    }
                                },
                            },
                             {
                                 field: "IdMaterial",
                                 title: window.app.idioma.t("REFERENCIA").toUpperCase(),
                                 template: "#=IdMaterial# - #= DescripcionMaterial#",
                                 groupHeaderTemplate: window.app.idioma.t("REFERENCIA").toUpperCase() + ": #= value #",
                                 attributes: {
                                     style: 'white-space: nowrap ',
                                     class: 'addTooltip'
                                 },
                                 filterable: {
                                     multi: true,
                                     itemTemplate: function (e) {
                                         if (e.field === "all") {
                                             //handle the check-all checkbox template
                                             return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                         } else {
                                             //handle the other checkboxes
                                             return "<div><label><input type='checkbox' value='#=IdMaterial#' style='width: 14px;height:14px;margin-right:5px;'/>#=IdMaterial# - #= DescripcionMaterial#</label></div>";
                                         }
                                     }
                                 },
                                 width: 250
                            },
                            {
                                field: "IdProveedor",
                                title: window.app.idioma.t("PROVEEDOR").toUpperCase(),
                                template: "#if(typeof IdProveedor !== 'undefined' &&  IdProveedor != '0' && IdProveedor){##=IdProveedor# - #=NombreProveedor##}#",
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    class: 'addTooltip'
                                },
                                width: 300
                            },
                            {
                                field: "LoteProveedor",
                                title: window.app.idioma.t("LOTE_PROVEEDOR").toUpperCase(),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    class: 'addTooltip'
                                },
                                width: 300
                            },
                              {
                                  field: "Lote",
                                  title: window.app.idioma.t("LOTE_MES").toUpperCase(),
                                  attributes: {
                                      style: 'white-space: nowrap ',
                                      class: 'addTooltip'
                                  },
                                  width: 350
                              },
                            {
                                field: "CodWO",
                                template: '#= CodWO ? CodWO : "N/A" #',
                                title: window.app.idioma.t("ORDEN_DESTINO").toUpperCase(),
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    class: 'addTooltip'
                                },
                                width: 150
                            },
                            {
                                field: "CantidadInicial",
                                template: '#= CantidadInicial ?  kendo.format("{0:n2}",CantidadInicial): ""#',
                                title: window.app.idioma.t("CANTIDAD_INICIAL").toUpperCase(),
                                width: 150,
                                attributes: {
                                    style: 'white-space: nowrap ',
                                    class: 'addTooltip'
                                },
                            },
                               {
                                   field: "CantidadActual",
                                   template: '#= CantidadActual ? kendo.format("{0:n2}",CantidadActual) : ""#',
                                   title: window.app.idioma.t("CANTIDAD_ACTUAL").toUpperCase(),
                                   width: 150,
                                   attributes: {
                                       style: 'white-space: nowrap ',
                                       class: 'addTooltip'
                                   },
                               },
                        ]
                    });

                    $("#gridMaterias").kendoTooltip({
                        filter: ".addTooltip",
                        content: function (e) {
                            return e.target.html();
                        }
                    }).data("kendoTooltip");

                    self.ResizeTab("gridMaterias");
                }
            },

            //PALETS PRODUCIDOS
            renderData_L7: function (self) {
                if (!self.dsPaletsProducidos) {
                    self.dsPaletsProducidos = new kendo.data.DataSource({
                        pageSize: 30,
                        transport: {
                            read: {
                                url: "../api/GetPaletsProducidos",
                                dataType: "json"
                            },
                            parameterMap: function (data, type) {
                                if (type == "read") {
                                    return {
                                        IdLote: self.loteSelected ? self.loteSelected : null
                                    };

                                }
                            },

                        },
                    });
                }
                if (!$("#gridPaletsProducidos").data("kendoGrid")) {
                    $("#gridPaletsProducidos").kendoGrid({
                        noRecords: {
                            template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                        },
                        filterable: {
                            extra: false,
                            messages: window.app.cfgKendo.configuracionFiltros_Msg,
                            operators: window.app.cfgKendo.configuracionFiltros_Operadores
                        },
                        resizable: true,
                        excel: {
                            fileName: window.app.idioma.t('PALETS') + "_" + self.loteSelected + ".xlsx",
                            filterable: true,
                            allPages: true,
                        },
                        dataSource: self.dsPaletsProducidos,
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            pageSizes: [30, 100, 200, 'All'],
                            buttonCount: 2,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        toolbar: [
                      {
                          template: "<label style='margin:5px'>" + window.app.idioma.t('PALETAS_PRODUCIDAS_CONTIENEN_LOTE').toUpperCase() + "</label>"
                      },
                      {
                          template: '<div style="float: right; margin-right: 10px;"><button  class="k-button k-button-icontext k-grid-excel" style="margin-left: 5px;">' +
                                    '<span class="k-icon k-i-excel"></span>' + window.app.idioma.t('EXPORTAR_EXCEL') + '</button></div>'

                      }

                        ],

                        columns: [
                             {
                                 field: "FechaEntrada",
                                 attributes: {
                                     style: 'white-space: nowrap ',
                                 },
                                 template: '#= FechaEntrada != null ? kendo.toString(new Date(FechaEntrada), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                                 title: window.app.idioma.t("FECHA").toUpperCase(),
                             },
                             {
                                 field: "SSCC",
                                 title: window.app.idioma.t("SSCC").toUpperCase(),
                                 attributes: {
                                     style: 'white-space: nowrap ',
                                     class: 'addTooltip'
                                 },
                             },
                             {
                                 field: "IdLinea",
                                 title: window.app.idioma.t("LINEA").toUpperCase(),
                             },
                              {
                                  field: "ReferenciaMaterial",
                                  title: window.app.idioma.t("PRODUCTO").toUpperCase(),
                                  attributes: {
                                      style: 'white-space: nowrap ',
                                      class: 'addTooltip'
                                  },
                              },
                              {
                                  field: "IdLoteMES",
                                  title: window.app.idioma.t("ID_LOTE").toUpperCase(),
                                  attributes: {
                                      style: 'white-space: nowrap ',
                                      class: 'addTooltip'
                                  },
                              },
                               {
                                   field: "IdOrdenOrigen",
                                   title: window.app.idioma.t("WO").toUpperCase(),
                                   attributes: {
                                       style: 'white-space: nowrap ',
                                       class: 'addTooltip'
                                   },
                               },
                        ]
                    });

                    $("#gridPaletsProducidos").kendoTooltip({
                        filter: ".addTooltip",
                        content: function (e) {
                            return e.target.html();
                        }
                    }).data("kendoTooltip");
                }

                self.ResizeTab("gridPaletsProducidos");
            },

            //LLAMADA A LAS CARGAS 
            loadData: function (self, item) {
                switch (self.itemSelectedGrid) {
                    case "liDatosLotes":
                        self.loadData_L1(self, item);
                        break;
                    case "liWO":
                        self.renderData_LWO(self);
                        self.loadData_LWO(self, item);
                        break;
                    case "liEntradaPlanta":
                        self.renderData_L2(self);
                        self.loadData_L2(self, item);
                        break;
                    case "liSalidaPlanta":
                        self.renderData_L3(self);
                        self.loadData_L3(self, item);
                        break;
                    case "liMMPP":
                        self.renderData_L6(self);
                        self.loadData_L6(self, item);
                        break;
                    case "liPaletsProducidos":
                        self.renderData_L7(self);
                        self.loadData_L7(self, item);
                        break;
                    case "liTransferencias":
                        self.renderData_LTransferencia(self);
                        self.dsTransferencias.read();
                        break;
                }

                self.SetLIMsTabColor(self);
                self.SetFicherosAdjuntosTabColor(self);
            },

            //DATOS LOTE
            loadData_L1: function (self, item) {

                if (self.dsAnaliticaLote)
                    self.dsAnaliticaLote.read();

                if (self.dsControlCalidadLote)
                    self.dsControlCalidadLote.read();

                //Se actualizan los datos directamente en cliente porque ya el objeto trae los valores
                if (item) {
                    var _dataGridDatosLotes = $("#gridDatosLote").data("kendoGrid").dataSource.data();

                    _dataGridDatosLotes[0].set('Valor', kendo.toString(kendo.parseDate(item.FechaCreacion), kendo.culture().calendars.standard.patterns.MES_FechaHora));
                    _dataGridDatosLotes[1].set('Valor', item.IdLoteMES);
                    _dataGridDatosLotes[2].set('Valor', item.ReferenciaMES ? item.ReferenciaMES +" - "+item.NombreMaterial : "");
                    _dataGridDatosLotes[3].set('Valor', item.CantidadInicial);
                    _dataGridDatosLotes[4].set('Valor', item.CantidadActual);
                    _dataGridDatosLotes[5].set('Valor', item.NombreUbicacion);
                    if (item.IdProveedor && item.IdProveedor != "0")
                        _dataGridDatosLotes[6].set('Valor', item.IdProveedor + " - " + item.NombreProveedor);
                    else
                        _dataGridDatosLotes[6].set('Valor', "");
                    _dataGridDatosLotes[7].set('Valor', item.LoteProveedor);
                    _dataGridDatosLotes[8].set('Valor', kendo.toString(kendo.parseDate(item.FechaCaducidad), "dd/MM/yyyy"));

                    var items = [];
                    new vPropiedadesLotes(items.push(item), item.IdLote, item.IdTipoMaterialMovimiento, false, "#gridPropiedadesLote",false);
                }
            },

            //WO 
            loadData_LWO: function (self, item) {
                self.dsWO.read();
            },

            //ENTRADA A PLANTA
            loadData_L2: function (self, item) {
                if (item) {
                    if (self.dsDatosDescarga)
                        self.dsDatosDescarga.read();
                    if (self.dsDatosTransporteEntrada)
                        self.dsDatosTransporteEntrada.read();
                    if (self.dsDocumentos) {
                        self.IdTipoAlbaran = 1;
                        self.dsDocumentos.read();
                    }
                }
            },

            //SALIDA DE PLANTA
            loadData_L3: function (self, item) {
                if (item) {
                    if (self.dsDatosCarga)
                        self.dsDatosCarga.read();
                    if (self.dsDatosTransporteSalida)
                        self.dsDatosTransporteSalida.read();
                    if (self.dsDocumentos) {
                        self.IdTipoAlbaran = 2;
                        self.dsDocumentos.read();
                    }
                }
            },

            //PROCESOS
            loadData_L4: function (self, item) {
                if (item) {
                    if (self.dsProcesos)
                        self.dsProcesos.read();

                    self.consultTo(self.attrHaciaProducto);
                }
            },

            //OPERACIONES
            loadData_L5: function (self, item) {
                if (item) {
                    if (self.dsOperaciones)
                        self.dsOperaciones.read();
                }
            },

            //MMPP
            loadData_L6: function (self, item) {
                if (self.dsMMPP)
                        self.dsMMPP.read();
            },

            //PALETS PRODUCIDOS
            loadData_L7: function (self, item) {
                if (item) {
                    if (self.dsPaletsProducidos)
                        self.dsPaletsProducidos.read();
                }
            },

            dsDatosGridGenerico: function (self, tipo) {
                return new kendo.data.DataSource({
                    pageSize: 15,
                    transport: {
                        read: {
                            url: "../api/GetDatosByType",
                            dataType: "json"
                        },
                        parameterMap: function (data, type) {
                            if (type == "read") {
                                return {
                                    IdLote: self.loteSelected ? self.loteSelected : null,
                                    Tipo: tipo
                                };

                            }
                        },

                    },
                });
            },

            dsDocumentosFunc: function (self) {
                return new kendo.data.DataSource({
                    pageSize: 15,
                    transport: {
                        read: {
                            url: "../api/GetDocumentosByLote",
                            dataType: "json"
                        },
                        parameterMap: function (data, type) {
                            if (type == "read") {
                                return {
                                    IdLote: self.loteSelected ? self.loteSelected : null,
                                    IdTipoAlbaran: self.IdTipoAlbaran
                                };

                            }
                        },

                    }
                });
            },

            resizeContent: function (resizeCabecera) {
                var cabeceraHeight1 = $("#divCabeceraVista").height();
                var contenedorHeight = $("#center-pane").height();
                var cabeceraHeight = $(".k-grouping-header").height();
                var headerHeightGrid = $(".k-grid-header").height();

                if (resizeCabecera)
                    $("#divSplitter").height(contenedorHeight - cabeceraHeight1 - cabeceraHeight - divFiltersGrid - headerHeightGrid - 60);
                else
                    $("#divSplitter").height(contenedorHeight - cabeceraHeight1 - cabeceraHeight - headerHeightGrid - 1);
            },

            onElementOpen: function (e) {
                var listContainer = e.sender.list.closest(".k-list-container");
                listContainer.width(listContainer.width() + kendo.support.scrollbar());
            },

            reiniciarCampos: function (self) {
                self.dsDatosLotes = null;
                self.dsAnaliticaLote = null;
                self.dsControlCalidadLote = null;
                self.IdAlbaranSelected = null;
                self.dsDatosDescarga = null;
                self.dsDatosTransporteEntrada = null;
                self.dsDatosCarga = null;
                self.dsDatosTransporteSalida = null;
                self.dsDocumentos = null;
                self.dsProcesos = null;
                self.dsOperaciones = null;
                self.dsMMPP = null;
                self.dsPaletsProducidos = null;
            },
            SetLIMsTabColor: function (self) {
                var color = "white";
                var backGroundColor = "#eae8e8";

                $("#btnLIMS").css("background-color", backGroundColor);
                $("#btnLIMS .k-link").css("color", color);
                $("#btnLIMS").attr("title", "");

                if (!self.loteSelected) {                    
                    return;
                }

                $.ajax({
                    type: "GET",
                    url: "../api/LIMS/ObtenerEstadoLIMsDetalleOrden/" + self.loteSelected,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        if (response) {
                            backGroundColor = response.Valor;
                            color = ColorTextoBlancoNegro(backGroundColor);

                            $("#btnLIMS").css("background-color", backGroundColor);
                            $("#btnLIMS .k-link").css("color", color);
                            $("#btnLIMS").attr("title", window.app.idioma.t('ESTADO_LIMS_' + response.Id));
                        }
                    },
                    error: function (response) {

                    }
                });
            },
            MostrarLIMS: function (e, self) {
                let lote = self.loteSelected;

                let _treeView = $("#treeview").data("kendoTreeView");
                let _itemTreeViewSelected = _treeView.findByText(lote);
                let dataItem = _treeView.dataItem(_itemTreeViewSelected);

                if (!dataItem) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCION_LOTE'), 4000);
                    return;
                }

                let data = {
                    IdLoteMES: dataItem.IdLoteMES,
                    FechaLote: dataItem.FechaCreacion
                }

                let ventana = $("<div id='window-lims'/>").kendoWindow({
                    title: window.app.idioma.t("LIMS"),
                    maxWidth: "90%",
                    height: "90%",
                    close: function () {
                        kendoWindow.destroy();
                    },
                    resizable: false,
                    modal: true
                })

                let kendoWindow = ventana.getKendoWindow();

                let template = kendo.template($("#tmpLIMS").html());
                kendoWindow
                    .content(template(data));

                kendo.init(ventana);

                $("#gridLIMS").css("height", (window.innerHeight * 0.9 - 60) + "px");

                new vistaLIMS({ LoteMES: data.IdLoteMES, FechaLote: data.FechaLote, opciones: { mostrarLanzarMuestra: false } });

                kendoWindow.center().open();
            },
            SetFicherosAdjuntosTabColor: function (self) {
                var color = "white";
                var backGroundColor = "#eae8e8";

                $("#btnFicherosAdjuntos").css("background-color", backGroundColor);
                $("#btnFicherosAdjuntos .k-link").css("color", color);

                //if (!self.loteSelected) {
                    
                //    return;
                //}

                let _treeView = $("#treeview").data("kendoTreeView");
                let _itemTreeViewSelected = _treeView.findByText(self.loteSelected);
                let dataItem = _treeView.dataItem(_itemTreeViewSelected);

                $.ajax({
                    type: "GET",
                    url: "../api/EstadoFicherosAdjuntos/" + dataItem.IdLote + `?tipoLote=${dataItem.IdTipoMaterialMovimiento}`,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        const tieneArchivos = response;
                        const verde = "#4CDA43";

                        if (tieneArchivos) {
                            $("#btnFicherosAdjuntos").css("background-color", verde);
                        }
                    },
                    error: function (response) {

                    }
                });
            },
            MostrarFicherosAdjuntos: function (e, self) {
                let lote = self.loteSelected;

                let _treeView = $("#treeview").data("kendoTreeView");
                let _itemTreeViewSelected = _treeView.findByText(lote);
                let dataItem = _treeView.dataItem(_itemTreeViewSelected);

                if (!dataItem) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCION_LOTE'), 4000);
                    return;
                }

                let data = {
                    id: dataItem.IdLote,
                    tipoLote: dataItem.IdTipoMaterialMovimiento
                }

                self.windowAA = new vistaArchivosAdjuntos({ parent: self, data });
            },

            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

