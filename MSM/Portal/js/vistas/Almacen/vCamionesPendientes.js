define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/CamionesPendientes.html', 'compartido/notificaciones',
    'vistas/vDialogoConfirm', 'modelos/mSesion', 'text!../../../Almacen/html/vpMantenimientoRecepcion.html',
    'vistas/Almacen/vDocumentos', 'vistas/Almacen/vAlbaranPosicion', 'vistas/Almacen/vFormMantenimiento'],
    function (_, Backbone, $, plantillaCamionesTransito, Not, VistaDlgConfirm, Session, vpMantenimientoRecepcion, jsDocumentos, jsAlbaranPosicion, jsMantenimiento) {
        var vistaCamionesTransito = Backbone.View.extend({
            //#region ATTRIBUTES

            //tagName: 'div',
            //id: 'divCamionesTransito',

            //IDS
            idAlmacen: null,
            idZona: null,
            idMaterial: null,
            idLote: null,
            IdAlbaran: null,
            idTransporte: null,

            //DATASOURCES
            dsTransporte: null,
            dsDocumentos: null,
            dsDeliveryNotes: null,
            dsReceptionDeliveryNotes: null,
            dsTransporteAutoComplete: null,
            dsClienteProveedor: null,
            dsUnidadMedida: null,
            dsProducto: null,
            dsOrigenMercancia: null,
            dsMatriculaTractoraAutoComplete: null,
            dsMatriculaRemolqueAutoComplete: null,
            dsTransportista: null,
            dsUbicacionInterna: null,
            dsUbicacionExterna: null,
            dsOperador: null,
            dsAlmacen: null,
            dsZona: null,
            dsOA: null,
            dpTxtOA: null,
            dsUbicacion: null,

            //GRIDS
            gridTransportes: null,
            gridDocumentos: null,
            gridAlbaranEntrada: null,
            gridReceptionDeliveryNotes: null,
            gridAlbaranSalida: null,
            gridAlbaranPosicion: null,
            gridOrders: null,

            propExtend: null,
            session: null,
            user: null,
            isTransportCreate: false,
            //UID
            uidAlbaranPosicion: null,


            UnidadMedidaMaterialAlbaranEntrada: null,
            transporte: null,

            changeEvent: 0,
            changeEventDate: 0,

            validator: null,
            fileDocumento: null,
            itemSelectedGrid: "li_1",//Pestaña 1

            uploadFile: 0,
            documento: null,

            //WINDOWS
            wndRecepcionAlbaranEntrada: null,
            wndMaterialProperties: null,
            wndCalidadProperties: null,
            wnd: null,

            TipoAlbaran: null,

            //TEMPLATES
            template: _.template(plantillaCamionesTransito),
            vpMantenimiento: _.template(vpMantenimientoRecepcion),
            fileUpload: null,

            isGranel: 2,
            RowSelectedGridTransporte: null,
            IdRowSelectedGridTransporte: null,
            registrosDesSelData: [],
            registrosSelData: [],
            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;
                kendo.culture(localStorage.getItem("idiomaSeleccionado"));


                //PESO DE TARA $("#txtMatriculaTractora").data("kendoComboBox").dataItem(0).PesoMaximo

                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());


                self.DataSourceTransporte();

                kendo.culture(localStorage.getItem("idiomaSeleccionado"));
                $("#splitterCamionesTransito").kendoSplitter({
                    orientation: "vertical",
                    panes: [
                        { collapsible: false, size: "300px" },
                        { collapsible: false }
                    ],
                    //resize: onResize

                });

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
                        //VALIDAMOS SI SELECCIONO UN TRANSPORTE
                        var rowSelect = $("#gridTransportes").data("kendoGrid").select().length;
                        self.gridAlbaranPosicion = null;
                        if (rowSelect == 1) {
                            var transporte = $("#gridTransportes").data("kendoGrid").dataItem($("#gridTransportes").data("kendoGrid").select()[0]);
                            self.idTransporte = transporte.IdTransporte;
                            if (item == "li_1") {
                                self.SetValues(transporte);
                                $("#btnGuardar").show();
                                $("#btnCancelarTransporte").show();
                                $("#btnCrear").hide();
                                $("#btnReiniciarCampos").hide();
                            } else if (item == "li_2") {
                                jsDocumentos.ObtenerDocumentos(self.idTransporte);
                            } else if (item == "li_3") {
                                self.TipoAlbaran = 1;
                                $("#gridAlbaranSalida").html("");
                                jsAlbaranPosicion.ObtenerAlbaranPosicion(self.idTransporte, self);
                            } else if (item == "li_4") {
                                self.TipoAlbaran = 2;
                                $("#gridAlbaranEntrada").html("");
                                jsAlbaranPosicion.ObtenerAlbaranPosicion(self.idTransporte, self);
                            }
                        } else {

                            if (item == "li_1") {
                                self.SetValues(null);
                                $("#btnGuardar").hide();
                                $("#btnCancelarTransporte").hide();
                                $("#btnCrear").show();
                                $("#btnReiniciarCampos").show();
                            } else if (item == "li_2") {
                                jsDocumentos.ObtenerDocumentos(0);
                            } else if (item == "li_3") {
                                self.TipoAlbaran = 1;
                                $("#gridAlbaranSalida").html("");
                                jsAlbaranPosicion.ObtenerAlbaranPosicion(0, self);
                            } else if (item == "li_4") {
                                self.TipoAlbaran = 2;
                                $("#gridAlbaranEntrada").html("");
                                jsAlbaranPosicion.ObtenerAlbaranPosicion(0, self);
                            }

                        }

                    }
                });

                //tabStrip.data("kendoTabStrip").disable(tabStrip.data("kendoTabStrip").tabGroup.children().eq(2));//Tab albaran de entrada
                //tabStrip.data("kendoTabStrip").disable(tabStrip.data("kendoTabStrip").tabGroup.children().eq(3));//Tab albaran de salida

                self.RenderElementsTransport();

                self.gridTransportes = this.$("#gridTransportes").kendoGrid({
                    dataSource: self.dsTransporte,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    toolbar: [
                        {
                            template: "<label>" + window.app.idioma.t('TRANSPORTE') + "</label>"
                        }
                    ],
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    selectable: "row",
                    sortable: true,
                    resizable: true,
                    //autoSync: false,
                    //scrollable: true,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [30, 100, 200, 'All'],
                        buttonCount: 2,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "Estado",
                            title: window.app.idioma.t("ESTADO"),
                            attributes: { "align": "center" },
                            template: "<img id='imgEstado' src='img/KOP_#= ColorSemaforo #.png'></img>",
                            // width: "5%"
                        },
                        {
                            field: "FechaDescarga",
                            title: window.app.idioma.t("DESCARGADO"),
                            attributes: { "align": "center" },
                            template: "#if(FechaDescarga != null){#<span class='k-icon k-update'></span>#}#",
                            // width: "5%"
                        },
                        {
                            field: "MatriculaTractora",
                            title: window.app.idioma.t("MATRICULA_TRACTORA"),
                            // width: "15%"
                        },
                        {
                            field: "NombreTransportista",
                            title: window.app.idioma.t("TRANSPORTISTA"),
                            //width: "15%",
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                        },
                        {
                            field: "FechaEntrada",
                            title: window.app.idioma.t("FECHA_ENTRADA"),
                            template: '#= FechaEntrada != null ? kendo.toString(new Date(FechaEntrada), kendo.culture().calendars.standard.patterns.MES_Fecha) : "" #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                            // width: "20%"
                        },
                        {
                            field: "DescripcionUbicacionInterna",
                            title: window.app.idioma.t("UBICACION_INTERNA"),
                            // width: "15%"
                        },
                        {
                            field: window.app.idioma.t("OPERACIONES"),
                            attributes: { "align": "center" },
                            command:
                            {
                                template: "<a id='btnEliminar' class='k-button k-grid-delete'  style='min-width:16px;'>" + window.app.idioma.t("ELIMINAR") + "</a>"
                            },
                            //width: "10%"
                        },
                    ],
                    dataBinding: function (e) {
                        kendo.ui.progress($("#gridTransportes"), false);
                        self.ResizeTab("Transporte");
                    },
                    dataBound: function () {
                        var rowsSelected = self.RowSelectedGridTransporte;
                        if (rowsSelected != null) {
                            var row = $("#gridTransportes").data("kendoGrid").dataSource.get(self.IdRowSelectedGridTransporte);

                            if (row) {
                                rowsSelected = $("#gridTransportes").data("kendoGrid").tbody.find("tr[data-uid='" + row.uid + "']");
                                $("#gridTransportes").data("kendoGrid").select(rowsSelected);
                            } else {
                                self.ReiniciarCampos();
                            }
                        }

                        if (self.isTransportCreate) {
                            self.isTransportCreate = false;
                            $("#gridTransportes").data('kendoGrid').select("tr:eq(1)");
                        }
                    },
                    change: function () {
                        var selectedRows = this.select();
                        self.RowSelectedGridTransporte = selectedRows;
                        //Si selecciona algun transporte
                        if (selectedRows.length > 0) {
                            var transporte = this.dataItem(selectedRows[0]);
                            self.idTransporte = transporte.IdTransporte;
                            self.IdRowSelectedGridTransporte = transporte.IdTransporte;
                            //self.TipoAlbaran = transporte.IdTipoAlbaran;
                            if (transporte.PesoEntrada != null && transporte.PesoEntrada != "") {
                                if ($("#numericTxtPesoSalida").data("kendoNumericTextBox") && $("#btnCapturarSalida").data("kendoButton")) {
                                    $("#numericTxtPesoSalida").data("kendoNumericTextBox").enable();
                                    $("#btnCapturarSalida").data("kendoButton").enable(true);
                                }
                            } else {
                                if ($("#numericTxtPesoSalida").data("kendoNumericTextBox") && $("#btnCapturarSalida").data("kendoButton")) {
                                    $("#numericTxtPesoSalida").data("kendoNumericTextBox").enable(false);
                                    $("#btnCapturarSalida").data("kendoButton").enable(false);
                                }
                            }
                            //Boton de agregar en los grid de la parte inferior
                            $(".k-grid-add").show();


                            //Selecciona pestaña 1 (Registro del transporte)
                            if (self.itemSelectedGrid == "li_1") {
                                $("#btnGuardar").show();
                                $("#btnCancelarTransporte").show();
                                $("#btnCrear").hide();
                                $("#btnReiniciarCampos").hide();
                                self.SetValues(transporte);
                                //Selecciona la pestaña 2 Documentos
                            } else if (self.itemSelectedGrid == "li_2") {
                                jsDocumentos.ObtenerDocumentos(self.idTransporte);
                                // Selecciona la pestaña 3 Albaran Entrada   
                            } else if (self.itemSelectedGrid == "li_3") {
                                self.TipoAlbaran = 1;
                                $("#gridAlbaranSalida").html("");
                                jsAlbaranPosicion.ObtenerAlbaranPosicion(self.idTransporte, self);
                                //Selecciona la pestaña 4 Albaran Salida    
                            } else if (self.itemSelectedGrid == "li_4") {
                                self.TipoAlbaran = 2;
                                $("#gridAlbaranEntrada").html("");
                                jsAlbaranPosicion.ObtenerAlbaranPosicion(self.idTransporte, self);

                            }
                        } else {
                            $("#btnGuardar").hide();
                            $("#btnCancelarTransporte").hide();
                            $("#btnCrear").show();
                            $("#btnReiniciarCampos").show();
                            $(".k-grid-add").hide();
                        }
                    }
                }).data("kendoGrid");



                //btnSemaforoAlbaranPosicion
                self.changeEvent = 0;



                var grid = $("#gridTransportes").data("kendoGrid");
                grid.dataSource.pageSize(20);

                self.ResizeTab("Transporte");

                $("#gridTransportes").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

            },

            //#region EVENTS
            events: {
                'click #btnEliminar': function (e) { this.DeleteTransport(e) },
                'click #btnReiniciarCampos': function () { this.ReiniciarCampos(); },
                'click #btnCrear': function (e) { this.MensajeCrearTransporte(e) },
                'click #btnGuardar': function (e) { this.MensajeGuardarTransporte(e) },

                'click #btnFinalizarCamion': function (e) { this.FinalizarCamion(this) },
                'click #btnImprimirSalida': function () { this.ImprimirAlbaran(this); },

                //jsDocumentos
                'click .k-grid-updateDocumento': function (container, options) { jsDocumentos.ActualizarDocumento(container, options) },
                'click .k-download-Document': function (container, options) { jsDocumentos.DescargarDocumento(container, options) },
                //'click .k-delete-Document': 'RemoveFichero',

                //jsAlbaranPosicion
                'click .k-grid-updateAlbaranEntrada': function (e, options) { jsAlbaranPosicion.ActualizarAlbaranPosicion(e, options, this) },
                'click #btnRecepcionadoAlbaranEntrada, #btnRecepcionadoAlbaranSalida': function (e) { jsAlbaranPosicion.ShowWindowReceptionDeliveryNote(e, this); },
                'click #btnGuardarPropiedad': function (e) { jsAlbaranPosicion.GuardarPropiedadExtendidaMaterial(e, this); },
                'click #btnSemaforoAlbaranPosicion': function (e, options) { jsAlbaranPosicion.ShowCalidadProperties(e, options, this); },
                'click #btnSearchOrder': function (e) { jsAlbaranPosicion.ShowOrdenAprovisionamiento(this) },

                //jsFormMantenimiento
                'click .btnAddNewObject': function (e) { jsMantenimiento.ShowWindowNewForm(e, this, e.currentTarget.id, e.currentTarget.className.split(' ')[1]); }
            },
            //#endregion EVENTS

            //#region METODOS

            //1. Metodo que actualiza un transporte
            ActualizarTransporte: function () {
                var self = this;
                self.GuardarTransporte(1);
            },

            CaptureWeight: function (id, _self, isManual) {
                var self = this;
                //VERIFICAR EL PESO SEGUN LA TARA
                var permiso = false;
                for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                    if (window.app.sesion.attributes.funciones[i].id === 134 || window.app.sesion.attributes.funciones[i].id === 135)
                        permiso = true;
                }

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                } {
                    var _itemGridTransporte = $("#gridTransportes").data("kendoGrid").dataItem($("#gridTransportes").data("kendoGrid").select());
                    if (_itemGridTransporte) {
                        if (!isManual) {
                            $.ajax({
                                type: "GET",
                                async: true,
                                url: "../api/CaptureWeight",
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (res) {
                                    if (res.length > 0) {
                                        $("#" + id).data("kendoNumericTextBox").value(res[0].value);

                                        if (id == "numericTxtPesoSalida" && _itemGridTransporte != null) {
                                            _itemGridTransporte.PesoEntrada = $("#numericTxtPesoEntrada").data("kendoNumericTextBox").value();
                                            _itemGridTransporte.PesoSalida = res[0].value;
                                            //_itemGridTransporte.FechaDescarga = 

                                            if (_itemGridTransporte.FechaDescarga == null && _itemGridTransporte.IdTipoAlbaran == 1) {
                                                this.confirmacion = new VistaDlgConfirm({
                                                    titulo: window.app.idioma.t('FINALIZAR_DESCARGA'), msg: window.app.idioma.t('CONFIRMACION_FINALIZAR_DESCARGA_LOTE'),
                                                    funcion: function () {
                                                        _self.FinalizarDescarga(_itemGridTransporte);
                                                        this.confirmacion = null;
                                                    }, contexto: this
                                                });
                                            }

                                        } else if (id == "numericTxtPesoEntrada" && _itemGridTransporte != null) {
                                            $("#btnCapturarSalida").data("kendoButton").enable(true);
                                            $("#numericTxtPesoSalida").data("kendoNumericTextBox").enable(true);
                                        } else if (_itemGridTransporte == null) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('MENSAJE_PESO_SALIDA'), 2000);
                                        }
                                    }

                                },
                                error: function (err) {

                                }
                            });
                        } else {
                            _itemGridTransporte.PesoSalida = $("#numericTxtPesoSalida").data("kendoNumericTextBox").value();
                            _self.FinalizarDescarga(_itemGridTransporte);
                        }
                    }
                }
            },

            CrearTransporte: function (e) {
                e.preventDefault();
                var self = this;
                self.GuardarTransporte(0);

            },

            ConfirmaEliminacion: function (e) {
                var self = this;

                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var dataRow = self.$("#gridTransportes").data("kendoGrid").dataItem(tr);

                $.ajax({
                    type: "POST",
                    url: "../api/DeleteTransport/" + dataRow.IdTransporte,
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    Backbone.trigger('eventCierraDialogo');
                    $("#gridTransportes").data('kendoGrid').dataSource.read();
                    if (res != 0) {
                        //$("#gridTransportes").data('kendoGrid').dataSource.read();
                        $("#btnGuardar").hide();
                        $("#btnCancelarTransporte").hide();
                        $("#btnCrear").show();
                        $("#btnReiniciarCampos").show();
                        self.ReiniciarCampos();
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), 'Eliminado el transporte correctamente', 3000);
                        var tabStrip = $("#divPestanias").kendoTabStrip().data("kendoTabStrip");
                        tabStrip.select(0);

                    }
                    else
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), res.message, 2000);


                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EDITAR_ORDEN'), 2000);
                });


            },

            DataSourceTransporte: function () {
                var self = this;
                self.dsTransporte = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetTransportesPendientes",
                            dataType: "json"
                        }

                    },
                    schema: {
                        model: {
                            id: "IdTransporte",
                            fields: {
                                'IdTransporte': { type: "number" },
                                'PesoEntrada': { type: "number" },
                                'PesoSalida': { type: "number" },
                                'FechaEntrada': { type: "date" },
                                'FechaDescarga': { type: "date" },
                                'FechaSalida': { type: "date" },
                                'Observaciones': { type: "string" },

                                'IdProducto': { type: "number" },
                                'NombreProducto': { type: "string" },
                                'ObservacionesProducto': { type: "string" },

                                'IdProveedor': { type: "number" },
                                'NombreProveedor': { type: "string" },

                                'IdMatriculaTractora': { type: "number" },
                                'MatriculaTractora': { type: "string" },
                                'IdMatriculaRemolque': { type: "number" },
                                'MatriculaRemolque': { type: "string" },

                                'IdTransportista': { type: "number" },
                                'NIF': { type: "string" },
                                'NombreTransportista': { type: "string" },

                                'IdOperador': { type: "string" },
                                'NombreOperador': { type: "string" },

                                'IdOrigenMercancia': { type: "number" },
                                'DescripcionOrigenMercancia': { type: "string" },

                                'IdUbicacionInterna': { type: "number" },
                                'DescripcionUbicacionInterna': { type: "string" },

                                'IdDestinatario': { type: "number" },
                                'DescripcionDestinatario': { type: "string" },
                                'PoblacionDestinatario': { type: "string" },

                                'IsGranel': { type: "boolean" },
                                'ColorSemaforo': { type: "string" },


                            }
                        }
                    },
                    requestEnd: function (e) {
                        e.preventDefault();
                        if (e.type == "read") {

                            //var _pestania = $("#divPestanias").data("kendoTabStrip");
                            //_pestania.disable(_pestania.tabGroup.children().eq(3));
                            //_pestania.disable(_pestania.tabGroup.children().eq(2));
                            //self.ReiniciarCampos();
                        }
                    },
                    pageSize: 5,
                    async: false,

                });

            },

            DeleteTransport: function (e) {
                var self = this;
                var permiso = false;

                for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                    if (window.app.sesion.attributes.funciones[i].id === 134 || window.app.sesion.attributes.funciones[i].id === 135)
                        permiso = true;
                }

                if (permiso) {
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('ELIMINAR'), msg: window.app.idioma.t('CONFIRMACION_ELIMINAR_REGISTRO'),
                        funcion: function () {
                            self.ConfirmaEliminacion(e);
                        }, contexto: this
                    });
                }
                else {
                    Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                }
            },

            FinalizarDescarga: function (_itemGridTransporte) {
                $.ajax({
                    data: JSON.stringify(_itemGridTransporte),
                    type: "PUT",
                    async: true,
                    url: "../api/FinalizarDescargaByTransporte",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('DESCARGA_FINALIZADA'), 2000);
                        $("#gridTransportes").data("kendoGrid").dataSource.read();
                        $("#gridTransportes").data("kendoGrid").select(0);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {

                    }
                });

            },

            FinalizarCamion: function (self) {
                var dataItem = self.gridTransportes.dataItem(self.gridTransportes.select());
                if (dataItem != null) {
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('FINALIZAR_CAMION'),
                        msg: window.app.idioma.t('DESEA_REALMENTE_FINALIZAR'),
                        funcion: function () {
                            Finalizar(dataItem);
                            Backbone.trigger('eventCierraDialogo');
                        },
                        contexto: this
                    });

                    function Finalizar(dataItem) {
                        $.ajax({
                            type: 'POST',
                            data: JSON.stringify(dataItem),
                            async: true,
                            dataType: "json",
                            contentType: 'application/json; charset=utf-8',
                            url: '../api/FinalizarTransporte',
                            success: function (result) {
                                self.gridTransportes.dataSource.remove(dataItem);
                                self.gridTransportes.dataSource.read();
                                self.ReiniciarCampos();
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('FINALIZADO_CORRECTAMENTE'), 4000);
                            },
                            error: function (e) {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_FINALIZANDO_TRANSPORTE'), 4000);
                            }

                        });
                    }
                }
            },

            GuardarTransporte: function (actualizar) {
                var self = this;
                var _url = actualizar == 1 ? "../api/UpdateTransport" : "../api/AddTransport";

                kendo.ui.progress(self.$("#splitterCamionesTransito"), true);
                $.ajax({
                    data: JSON.stringify(self.transporte),
                    type: "POST",
                    async: true,
                    url: _url,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res) {
                            if (self.transporte.PesoEntrada < self.transporte.PesoSalida && self.transporte.IsGranel && actualizar && self.transporte.IdTipoAlbaran == 1) {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('PESO_ENTRADA_MAYOR_QUE_PESO_SALIDA'), 4000);
                            }

                            self.isTransportCreate = true;
                            $("#gridTransportes").data('kendoGrid').dataSource.read();
                            $("#selectClienteProveedor").data('kendoComboBox').dataSource.read();
                            $("#txtNombreTransportista").data('kendoComboBox').dataSource.read();
                            $("#selectProducto").data('kendoComboBox').dataSource.read();
                            $("#txtOrigen").data('kendoComboBox').dataSource.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('MODIFICADO_CORRECTAMENTE'), 4000);
                            if (actualizar == 1) {
                                $("#btnGuardar").hide();
                                $("#btnCancelarTransporte").hide();
                                $("#btnCrear").show();
                                $("#btnReiniciarCampos").show();
                            }
                        }
                        else Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GUARDAR'), 4000);
                        Backbone.trigger('eventCierraDialogo');
                        kendo.ui.progress(self.$("#splitterCamionesTransito"), false);
                    },
                    error: function (err) {
                        kendo.ui.progress(self.$("#splitterCamionesTransito"), false);
                        Backbone.trigger('eventCierraDialogo');
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GUARDAR'), 4000);
                        }
                    }
                });

            },

            ImprimirAlbaran: function (self) {
                var dataItem = self.gridTransportes.dataItem(self.gridTransportes.select());
                var form = document.createElement("form");
                form.setAttribute("method", "POST");
                form.setAttribute("action", "/Informes/INF-ALV-PROD_ALB_MAT.aspx");

                // setting form target to a window named 'formresult'
                form.setAttribute("target", "_blank");

                var albaranField = document.createElement("input");
                albaranField.setAttribute("name", "MatriculaTractora");
                albaranField.setAttribute("value", dataItem.MatriculaTractora);
                form.appendChild(albaranField);


                var idiomaField = document.createElement("input");
                idiomaField.setAttribute("name", "Idioma");
                idiomaField.setAttribute("value", localStorage.getItem("idiomaSeleccionado"));
                form.appendChild(idiomaField);

                document.body.appendChild(form);

                form.submit();

            },

            MensajeCrearTransporte: function (e) {
                var self = this;
                var permiso = false;

                for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                    if (window.app.sesion.attributes.funciones[i].id === 134)
                        permiso = true;
                }

                if (permiso) {
                    self.ObtenerDatosRegistroTransporte();
                    if (self.ValidarCamposFormulario(self.transporte)) {
                        self.CrearTransporte(e);
                    }
                }
                else {
                    Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                }
            },

            MensajeGuardarTransporte: function (e) {
                var self = this;
                self.ObtenerDatosRegistroTransporte();

                if (self.ValidarCamposFormulario(self.transporte)) {
                    self.ActualizarTransporte(e);
                }
            },

            MostrarBotonTransporte: function (idBoton) {
                if ($("#" + idBoton).is(":visible")) {
                    $("#" + idBoton).hide();
                } else {
                    $("#" + idBoton).show();
                }
            },

            ObtenerDatosRegistroTransporte: function () {
                var self = this;
                var _itemTransporte = $("#gridTransportes").data("kendoGrid").dataItem($("#gridTransportes").data("kendoGrid").select());
                var _idOrigenMercancia = GetValueVariable('txtOrigen', 'kendoComboBox');
                var _idTransportista = GetValueVariable('txtNombreTransportista', 'kendoComboBox');
                var _idMatriculaTractora = GetValueVariable('txtMatriculaTractora', 'kendoComboBox');
                var _idMatriculaRemolque = GetValueVariable('txtMatriculaRemolque', 'kendoComboBox');
                var _matriculaTractora = GetTextVariable('txtMatriculaTractora', 'kendoComboBox');
                var _matriculaRemolque = GetTextVariable('txtMatriculaRemolque', 'kendoComboBox');
                var _fechaEntrada = $("#dateFechaEntrada").val() != "" ? kendo.parseDate($("#dateFechaEntrada").val()) : "";
                var _clienteProveedor = GetValueVariable('selectClienteProveedor', 'kendoComboBox');
                var _nombreProveedor = $("#selectClienteProveedor").data("kendoComboBox").text();
                var _DNI = $('#txtDNITransportista').val();
                var _transportista = $("#txtNombreTransportista").data("kendoComboBox").text()
                var _IdProducto = GetValueVariable('selectProducto', 'kendoComboBox');
                var _nombreProducto = $("#selectProducto").data("kendoComboBox").text();
                var _pesoEntrada = $("#numericTxtPesoEntrada").data("kendoNumericTextBox").value();
                var _pesoSalida = $("#numericTxtPesoSalida").data("kendoNumericTextBox").value();
                var _descripcionMercancia = $('#txtOrigen').data('kendoComboBox').text();
                var _ubicacionInterna = $("#txtUbicacionInterna").val();
                var _observaciones = $("#txtObservacion").val();
                var _observacionesProducto = $("#txtObservacionProducto").val();
                var _idOperador = GetValueVariable('txtOperador', 'kendoComboBox');
                var _idDestinatario = GetValueVariable('selectDestino', 'kendoComboBox');
                var _poblacionDestinatario = $("#txtUbicacionExterna").val();
                var _isGranel = GetValueVariable('selectGranel', 'kendoDropDownList') == "1" ? true : false;

                self.transporte =
                {
                    IdTransporte: self.idTransporte,
                    PesoEntrada: _pesoEntrada,
                    PesoSalida: _pesoSalida,
                    FechaEntrada: _fechaEntrada,
                    Observaciones: _observaciones,

                    IdProducto: _IdProducto,
                    NombreProducto: _nombreProducto,
                    ObservacionesProducto: _observacionesProducto,

                    IdProveedor: _clienteProveedor, //OJO
                    NombreProveedor: _nombreProveedor,

                    IdMatriculaTractora: _idMatriculaTractora,
                    MatriculaTractora: _matriculaTractora,
                    IdMatriculaRemolque: _idMatriculaRemolque,
                    MatriculaRemolque: _matriculaRemolque,

                    IdTransportista: _idTransportista,
                    NIF: _DNI,
                    NombreTransportista: _transportista,

                    IdOperador: _idOperador,

                    IdOrigenMercancia: _idOrigenMercancia,
                    DescripcionOrigenMercancia: _descripcionMercancia,

                    IdUbicacionInterna: _ubicacionInterna,

                    IdDestinatario: _idDestinatario,
                    PoblacionDestinatario: _poblacionDestinatario,
                    isGranel: _isGranel,

                    UltimoCamion: _itemTransporte != null ? _itemTransporte.UltimoCamion : false,
                    FechaOrden: _itemTransporte != null ? _itemTransporte.FechaOrden : new Date(),

                    FechaDescarga: _itemTransporte != null ? _itemTransporte.FechaDescarga : null
                }

                function GetValueVariable(id, tipo) {
                    return typeof $('#' + id).data(tipo).dataItems() !== 'undefined' ? isNaN(parseInt($('#' + id).data(tipo).value())) ? null : $('#' + id).data(tipo).value() : null;
                }

                function GetTextVariable(id, tipo) {
                    return typeof $('#' + id).data(tipo).dataItems() !== 'undefined' ? isNaN(parseInt($('#' + id).data(tipo).value())) ? "" : $('#' + id).data(tipo).text() : "";
                }

            },

            ReiniciarCampos: function () {
                var self = this;
                //var transporte = {}

                var cbNombreTransportista = $('#txtNombreTransportista').data('kendoComboBox');
                cbNombreTransportista.text("");
                cbNombreTransportista.dataSource.read();

                var cbMatriculaTractora = $('#txtMatriculaTractora').data('kendoComboBox');
                cbMatriculaTractora.text("");
                cbMatriculaTractora.dataSource.read();

                var cbMatriculaRemolque = $('#txtMatriculaRemolque').data('kendoComboBox');
                cbMatriculaRemolque.text("");
                cbMatriculaRemolque.dataSource.read();

                var cbOrigenMercancia = $('#txtOrigen').data('kendoComboBox');
                cbOrigenMercancia.text("");
                cbOrigenMercancia.dataSource.read();

                var cbOperador = $('#txtOperador').data('kendoComboBox');
                cbOperador.text("");
                cbOperador.dataSource.read();

                var _pestania = $("#divPestanias").data("kendoTabStrip");
                //_pestania.disable(_pestania.tabGroup.children().eq(3));
                //_pestania.disable(_pestania.tabGroup.children().eq(2));
                crearTooltips(_pestania.tabGroup.children().eq(3), 'SELECCIONE_CAMION');
                crearTooltips(_pestania.tabGroup.children().eq(2), 'SELECCIONE_CAMION');
                _pestania.select(0);



                self.SetValues(null);
                self.RemoveClassInvalid();
            },

            ResizeTab: function (tab) {

                var contenedorHeight = $("#center-pane").height();
                var cabeceraHeight = $("#divCabeceraVista").height();
                //var divtabla = $("#gridTransportes").height();

                $("#splitterCamionesTransito").height(contenedorHeight - cabeceraHeight);
                var divSplitterHeight = $("#splitterCamionesTransito").height();

                var divGridTransporte = tab == "Transporte" ? $('#gridTransportes').height() : $('#gridDocumentos').height();


                $('#divDetalle').height(divSplitterHeight - divGridTransporte);
                //$("#detalleTransporte").height($('#divDetalle').height() - $("#divFiltrosDetalle").height() - $(".k-tabstrip-items").height());
                //$(".k-content").height($("#detalleTransporte").height())
                var splitter = $("#splitterCamionesTransito").data("kendoSplitter");
                splitter.trigger('resize');
            },

            RemoveClassInvalid: function () {
                $("#labelFechaEntrada").removeClass("k-invalid");
                $("#labelMatriculaTractora").removeClass("k-invalid");
                $("#labelDNITransportista").removeClass("k-invalid");
                $("#labelNombreTransportista").removeClass("k-invalid");
                $("#labelOrigenMercancia").removeClass("k-invalid");

            },

            RenderElementsTransport: function () {
                var self = this;

                //if (self.changeEventDate == 0) {


                //$("#dateFechaSalida").kendoDateTimePicker(
                //    {
                //        max: new Date(),
                //        dateInput: true,
                //        format: "dd/MM/yyyy HH:mm:ss"
                //    }
                //    );

                $("#dateFechaEntrada").kendoDateTimePicker({
                    value: new Date(),
                    //dateInput: true,
                    max: new Date(),
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                // self.changeEventDate = 1;
                //}
                //AUTOCOMPLETE MATRICULAS


                $("#btnGuardar").kendoButton();
                $("#btnCrear").kendoButton();
                $("#btnImprimirSalida").kendoButton();
                $("#btnFinalizarCamion").kendoButton();
                $("#btnReiniciarCampos").kendoButton();
                $("#btnAgregarProducto").kendoButton();

                $("#btnAgregarClienteProveedor").kendoButton();

                $("#btnCancelarTransporte").kendoButton({
                    click: function (e) {

                        $("#btnGuardar").hide();
                        $("#btnCancelarTransporte").hide();
                        $("#btnCrear").show();
                        $("#btnReiniciarCampos").show();
                        self.changeEvent = 0;
                        $("#btnReiniciarCampos").trigger("click");
                        var gridTransportes = $("#gridTransportes").data('kendoGrid');
                        gridTransportes.clearSelection();

                    }
                });


                var _selectClienteProveedor = $("#selectClienteProveedor").kendoComboBox({
                    dataTextField: "Nombre",
                    filter: "contains",
                    dataValueField: "ID",
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetDataAutoCompleteClienteProveedor/",
                                dataType: "json",
                                cache: false
                            }
                        },
                        sort: { field: "Nombre", dir: "asc" },
                        schema: {
                            model: {
                                id: "ID",
                                fields: {
                                    'ID': { type: "number" },
                                    'Nombre': { type: "string" },
                                    'Tipo': { type: "string" }
                                }
                            }
                        }
                    },
                    suggest: true,
                    change: function (e) {
                        if (this.value() && this.selectedIndex == -1) {
                            var _value = this.value().trim();
                            this.confirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('AVISO'),
                                msg: window.app.idioma.t('CLIENTE_NO_ENCONTRADO'),
                                funcion: function (e) {
                                    jsMantenimiento.ShowWindowNewForm(e, self, 'selectClienteProveedor', 'clsClient');
                                    $("#vpTxtNombre").val(_value);
                                    Backbone.trigger('eventCierraDialogo');
                                },
                                funcionClose: function (e) {
                                    $("#selectClienteProveedor").data("kendoComboBox").value('');
                                    Backbone.off('eventCierraDialogo');
                                },
                                contexto: this
                            });


                        }
                    },
                    optionLabel: window.app.idioma.t("SELECCIONE")
                }).data("kendoAutoComplete");



                $("#selectDestino").kendoComboBox({
                    dataTextField: "Nombre",
                    dataValueField: "ID",
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetDataAutoCompleteUbicacion/" + "Externa",
                                dataType: "json",
                                cache: false,

                            },
                        },
                        sort: { field: "Nombre", dir: "asc" },
                        schema: {
                            model: {
                                id: "ID",
                                fields: {
                                    'ID': { type: "number" },
                                    'Nombre': { type: "string" },
                                    'Tipo': { type: "string" }
                                }
                            }
                        }
                    },
                    suggest: true,
                    highlightFirst: true,
                    optionLabel: window.app.idioma.t("SELECCIONE"),
                    select: self.SelectUbicacionExterna,
                    change: function (e) {
                        if (this.value() && this.selectedIndex == -1) {
                            var _value = this.value().trim();
                            this.confirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('AVISO'),
                                msg: window.app.idioma.t('DESTINATARIO_NO_ENCONTRADO'),
                                funcion: function (e) {
                                    jsMantenimiento.ShowWindowNewForm(e, self, 'selectDestino', 'clsAdressee');
                                    $("#vpTxtNombre").val(_value);
                                    Backbone.trigger('eventCierraDialogo');
                                },
                                funcionClose: function (e) {
                                    $("#selectDestino").data("kendoComboBox").value('');
                                    Backbone.off('eventCierraDialogo');
                                },
                                contexto: this
                            });


                        }
                    }
                });

                $("#selectProducto").kendoComboBox({
                    dataTextField: "Nombre",
                    filter: "contains",
                    dataValueField: "ID",
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetDataAutoCompleteProducto/",
                                dataType: "json",
                                cache: false
                            }
                        },
                        sort: { field: "Nombre", dir: "asc" },
                        schema: {
                            model: {
                                id: "ID",
                                fields: {
                                    'ID': { type: "number" },
                                    'Nombre': { type: "string" },
                                    'Tipo': { type: "string" }
                                }
                            }
                        }
                    },
                    suggest: true,
                    optionLabel: window.app.idioma.t("SELECCIONE"),
                    change: function (e) {
                        if (this.value() && this.selectedIndex == -1) {
                            var _value = this.value().trim();
                            this.confirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('AVISO'),
                                msg: window.app.idioma.t('PRODUCTO_NO_ENCONTRADO'),
                                funcion: function (e) {
                                    jsMantenimiento.ShowWindowNewForm(e, self, 'selectProducto', 'clsProduct');
                                    $("#vpTxtNombre").val(_value);
                                    Backbone.trigger('eventCierraDialogo');
                                },
                                funcionClose: function (e) {
                                    $("#selectProducto").data("kendoComboBox").value('');
                                    Backbone.off('eventCierraDialogo');
                                },
                                contexto: this
                            });

                        }
                    }

                }).data("kendoAutoComplete");

                $("#numericTxtPesoEntrada").kendoNumericTextBox({
                    format: "#.00 kg"
                });

                $("#btnCapturarEntrada").kendoButton({
                    enable: true,
                    click: function () {
                        self.CaptureWeight("numericTxtPesoEntrada", self, false);
                    }
                });

                $("#btnFechaActual").kendoButton({
                    enable: true,
                    click: function () {
                        $("#dateFechaEntrada").val(kendo.toString(new Date(), kendo.culture().calendars.standard.patterns.MES_FechaHora));
                    }
                });

                $('#btnFechaActual').kendoTooltip({
                    position: "bottom",
                    content: window.app.idioma.t('FECHA_ACTUAL')
                });
                $("#divPestanias").data("kendoTabStrip").tabGroup.children().eq(3).kendoTooltip({
                    position: "bottom",
                    content: window.app.idioma.t('SELECCIONE_CAMION')
                });
                $("#divPestanias").data("kendoTabStrip").tabGroup.children().eq(2).kendoTooltip({
                    position: "bottom",
                    content: window.app.idioma.t('SELECCIONE_CAMION')
                });

                $("#numericTxtPesoSalida").kendoNumericTextBox({
                    format: "#.00 kg",
                    //change: function (e) {
                    //    var _value = this.value();
                    //    var _itemSelected = $("#gridTransportes").data("kendoGrid").dataItem($("#gridTransportes").data("kendoGrid").select());
                    //    var _pesoEntrada = _itemSelected.PesoEntrada;

                    //    if (_itemSelected.IsGranel && _value > 0 && _pesoEntrada > 0) {
                    //        self.CaptureWeight("numericTxtPesoSalida", self, true);
                    //    }
                    //}
                });

                $("#numericTxtPesoSalida").data("kendoNumericTextBox").enable(false);

                $("#btnCapturarSalida").kendoButton({
                    enable: false,
                    click: function () {
                        self.CaptureWeight("numericTxtPesoSalida", self)
                    }
                });

                $("#btnImprimirTicket").kendoButton({ enable: false });

                //AUTOCOMPLETE MATRICULA TRACTORA 
                $("#txtMatriculaTractora").kendoComboBox({
                    //suggest: true,
                    minLength: 1,
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetDataAutoCompleteMatricula/" + "Tractora",
                                dataType: "json",
                                cache: false
                            },
                            parameterMap: function (data, type) {
                                if (type == "read") {
                                    return {
                                        nombre: $('#txtMatriculaTractora').data("kendoComboBox").text()
                                    };
                                }
                            }

                        },
                        sort: { field: "Nombre", dir: "asc" },
                        schema: {
                            model: {
                                id: "ID",
                                fields: {
                                    'ID': { type: "number" },
                                    'Nombre': { type: "string" },
                                    'Tipo': { type: "string" },
                                    'PesoMaximo': { type: "string" },
                                    'IdProducto': { type: "number" },
                                    'IdProveedor': { type: "number" },
                                    'IdOperador': { type: "number" },
                                    'NombreOperador': { type: "string" },
                                    'IdTransportista': { type: "number" },
                                    'NombreTransportista': { type: "string" },
                                    'NIF': { type: "string" },


                                }
                            }
                        }
                    },
                    dataBound: function (e) {
                        var model = e;
                    },
                    select: function (e) {
                        if (e.item) {
                            var dataItem = this.dataItem(e.item.index());
                            $.ajax({
                                type: "GET",
                                async: true,
                                url: "../api/GetDataMatriculaByID/" + dataItem.Nombre,
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (res) {
                                    if (res != null) {
                                        //SET VALOR del combo de operador
                                        if (res.IdOperador != null) {
                                            $("#txtOperador").data("kendoComboBox").text(res.NombreOperador);
                                            $("#txtOperador").data("kendoComboBox").dataSource.read();
                                        }
                                        else {
                                            $("#txtOperador").data("kendoComboBox").text('');
                                            $("#txtOperador").data("kendoComboBox").dataSource.read();
                                        }
                                        //SET VALOR del combo de proveedor
                                        if (res.IdProveedor != null)
                                            $("#selectClienteProveedor").data("kendoComboBox").value(res.IdProveedor);
                                        else
                                            $("#selectClienteProveedor").data("kendoComboBox").value('');
                                        //SET VALOR del combo de producto
                                        if (res.IdProducto != null)
                                            $("#selectProducto").data("kendoComboBox").value(res.IdProducto);
                                        else
                                            $("#selectProducto").data("kendoComboBox").value('');

                                        //SET del combo nombre de transportista
                                        if (res.Transportista != null) {
                                            $("#txtNombreTransportista").data("kendoComboBox").text(res.Transportista.Nombre);
                                            $("#txtNombreTransportista").data("kendoComboBox").dataSource.read();
                                            $("#txtNombreTransportista").data("kendoComboBox").value(res.Transportista.IdTransportista);
                                            //$("#txtNombreTransportista").data("kendoComboBox").value(res.Transportista.Nombre);
                                            $("#txtDNITransportista").val(res.Transportista.NIF);
                                        }
                                        else {
                                            $("#txtNombreTransportista").data("kendoComboBox").text('');
                                            $("#txtNombreTransportista").data("kendoComboBox").dataSource.read();
                                            $("#txtDNITransportista").val('');
                                        }
                                        //SET Valor Ultima Ubicacion
                                        var grid = $("#gridTransportes").data("kendoGrid");
                                        var cmbGranel = self.$("#selectGranel").data("kendoDropDownList");
                                        var ubicacionInterna = self.$("#txtUbicacionInterna").data("kendoDropDownList");
                                        var data = grid.dataSource.data();
                                        ubicacionInterna.value("");
                                        data.forEach(function (e, a) {
                                            if (res.Nombre === e.MatriculaTractora && res.Transportista.Nombre === e.NombreTransportista) {
                                                var isGranel = e.IsGranel ? 1 : 2;
                                                $("#txtUbicacionInterna").data("kendoDropDownList").dataSource.transport.options.read.url = "../api/GetDataAutoCompleteUbicacion/Interna?isGranel=" + isGranel;
                                                var respuesta = $("#txtUbicacionInterna").data("kendoDropDownList").dataSource.read();
                                                respuesta.done(function () {
                                                    ubicacionInterna.value(e.IdUbicacionInterna)
                                                    while (ubicacionInterna.value() === "") {
                                                        ubicacionInterna.value(e.IdUbicacionInterna)
                                                    }
                                                });
                                            }
                                        });


                                    }

                                },
                                error: function (err) {

                                }
                            });
                        }
                    },
                    filter: "contains",
                    filtering: function (e) {
                        e.preventDefault();
                        var filter = e.filter;
                        this.dataSource.read();
                    },
                    dataTextField: "Nombre",
                    dataValueField: "ID",
                    change: function (e) {
                        if (this.value() && this.selectedIndex == -1) {
                            var _value = this.value().trim();

                            this.confirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('AVISO'),
                                msg: window.app.idioma.t('MATRICULA_TRACTORA_NO'),
                                funcion: function (e) {
                                    jsMantenimiento.ShowWindowNewForm(e, self, 'txtMatriculaTractora', 'clsRegistrationT');
                                    $("#vpTxtMatriculaTractora").val(_value);
                                    Backbone.trigger('eventCierraDialogo');
                                },
                                funcionClose: function (e) {
                                    $("#txtMatriculaTractora").data("kendoComboBox").value('');
                                    Backbone.off('eventCierraDialogo');
                                },
                                contexto: this
                            });

                        }
                    }
                });


                //AUTOCOMPLETE MATRICULA REMOLQUE 
                $("#txtMatriculaRemolque").kendoComboBox({
                    minLength: 1,
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetDataAutoCompleteMatricula/" + "Remolque",
                                dataType: "json",
                                cache: false,

                            },
                            parameterMap: function (data, type) {
                                return {
                                    nombre: $('#txtMatriculaRemolque').data("kendoComboBox").text(),
                                    idMatriculaTractora: $('#txtMatriculaTractora').data("kendoComboBox").value()
                                };
                            }

                        },
                        sort: { field: "Nombre", dir: "asc" },
                        schema: {
                            model: {
                                id: "ID",
                                fields: {
                                    'ID': { type: "number" },
                                    'Nombre': { type: "string" },
                                    'Tipo': { type: "string" }
                                }
                            }
                        }
                    },
                    filter: "contains",
                    dataTextField: "Nombre",
                    dataValueField: "ID",
                    filtering: function (e) {
                        e.preventDefault();
                        var filter = e.filter;
                        this.dataSource.read();
                    },
                    change: function (e) {
                        if (this.value() && this.selectedIndex == -1) {
                            var _value = this.value().trim();
                            this.confirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('AVISO'),
                                msg: window.app.idioma.t('MATRICULA_REMOLQUE_NO'),
                                funcion: function (e) {
                                    jsMantenimiento.ShowWindowNewForm(e, self, 'txtMatriculaRemolque', 'clsRegistrationR');
                                    $("#vpTxtMatriculaRemolque").val(_value);
                                    Backbone.trigger('eventCierraDialogo');
                                },
                                funcionClose: function (e) {
                                    $("#txtMatriculaRemolque").data("kendoComboBox").value('');
                                    Backbone.off('eventCierraDialogo');
                                },
                                contexto: this
                            });

                        }
                    }
                }).data("kendoAutoComplete");

                // AUTOCOMPLETE ORIGEN
                $("#txtOrigen").kendoComboBox({
                    suggest: true,
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetDataAutoCompleteOrigenMercancia/",
                                dataType: "json",
                                cache: false
                            },
                            parameterMap: function (data, type) {
                                return { nombre: $('#txtOrigen').data("kendoComboBox").text() };
                            }
                        },
                        sort: { field: "Nombre", dir: "asc" },
                        schema: {
                            model: {
                                id: "ID",
                                fields: {
                                    'ID': { type: "number" },
                                    'Nombre': { type: "string" },
                                    'Tipo': { type: "string" }
                                }
                            }
                        }
                    },
                    filter: "contains",
                    filtering: function (e) {
                        e.preventDefault();
                        var filter = e.filter;
                        this.dataSource.read();
                    },
                    dataTextField: "Nombre",
                    dataValueField: "ID",
                    change: function (e) {
                        if (this.value() && this.selectedIndex == -1) {
                            var _value = this.value().trim();
                            this.confirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('AVISO'),
                                msg: window.app.idioma.t('ORIGEN_NO_ENCONTRADO'),
                                funcion: function (e) {
                                    jsMantenimiento.ShowWindowNewForm(e, self, 'txtOrigen', 'clsOrigin');
                                    $("#vpTxtNombre").val(_value);
                                    Backbone.trigger('eventCierraDialogo');
                                },
                                funcionClose: function (e) {
                                    $("#txtOrigen").data("kendoComboBox").value('');
                                    Backbone.off('eventCierraDialogo');
                                },
                                contexto: this
                            });

                        }
                    }
                }).data("kendoAutoComplete");




                // COMBO GRANEL
                $("#selectGranel").kendoDropDownList({
                    dataSource: [{ Nombre: "Si", ID: 1 }, { Nombre: "No", ID: 2 }],
                    dataTextField: "Nombre",
                    dataValueField: "ID",

                    select: function (e) {
                        var dataItem = this.dataItem(e.item);
                        $("#txtUbicacionInterna").data("kendoDropDownList").dataSource.transport.options.read.url = "../api/GetDataAutoCompleteUbicacion/Interna?isGranel=" + dataItem.ID;
                        $("#txtUbicacionInterna").data("kendoDropDownList").dataSource.read();
                    }
                });

                $("#txtUbicacionInterna").kendoDropDownList({
                    minLength: 1,
                    suggest: true,
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetDataAutoCompleteUbicacion/Interna",
                                dataType: "json",
                                cache: false,
                                data: { isGranel: self.isGranel }
                            },

                        },
                        sort: { field: "Nombre", dir: "asc" },
                        requestEnd: function (e) {
                            if (e.type === "read") {
                                var _transporte = self.gridTransportes.dataItem(self.gridTransportes.select());
                                if (_transporte != null) {
                                    if (_transporte.IdUbicacionInterna != null) {
                                        var _ubicacionInterna = $("#txtUbicacionInterna").data("kendoDropDownList");
                                        _ubicacionInterna.dataSource.data(e.response)
                                        $("#txtUbicacionInterna").data("kendoDropDownList").value(_transporte.IdUbicacionInterna)
                                    }
                                }
                            }
                        },
                        schema: {
                            model: {
                                id: "ID",
                                fields: {
                                    'ID': { type: "number" },
                                    'Nombre': { type: "string" },
                                    'Tipo': { type: "string" }
                                }
                            }
                        }
                    },
                    open: function (e) {
                        var listContainer = e.sender.list.closest(".k-list-container");
                        listContainer.width(listContainer.width() + kendo.support.scrollbar());
                    },
                    filter: "contains",
                    dataTextField: "Nombre",
                    dataValueField: "ID",

                }).data("kendoAutoComplete");

                var txtUbicacionInterna = $("#txtUbicacionInterna").data("kendoDropDownList");
                txtUbicacionInterna.list.width("auto");

                //$("#selectDestino").kendoComboBox({
                //    suggest: true,
                //    dataSource: self.dsUbicacionExterna,
                //    filter: "contains",
                //    dataTextField: "Nombre",
                //    dataValueField: "ID",
                //    select: self.SelectUbicacionExterna
                //});

                $("#txtOperador").kendoComboBox({
                    minLength: 1,
                    dataSource: {
                        serverFiltering: true,
                        transport: {
                            read: {
                                url: "../api/GetDataAutoCompleteOperador/",
                                dataType: "json",
                                cache: false,

                            },
                            parameterMap: function (data, type) {
                                return { nombre: $('#txtOperador').data("kendoComboBox").text() };
                            },
                        },
                        sort: { field: "Nombre", dir: "asc" },
                        schema: {
                            model: {
                                id: "ID",
                                fields: {
                                    'ID': { type: "number" },
                                    'Nombre': { type: "string" },
                                    'Tipo': { type: "string" }
                                }
                            }
                        }
                    },
                    filter: "contains",
                    dataTextField: "Nombre",
                    dataValueField: "ID",
                    change: function (e) {
                        if (this.value() && this.selectedIndex == -1) {
                            var _value = this.value().trim();
                            this.confirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('AVISO'),
                                msg: window.app.idioma.t('OPERADOR_NO_ENCONTRADO'),
                                funcion: function (e) {
                                    jsMantenimiento.ShowWindowNewForm(e, self, 'txtOperador', 'clsOperator');
                                    $("#vpTxtNombre").val(_value);
                                    Backbone.trigger('eventCierraDialogo');
                                },
                                funcionClose: function (e) {
                                    $("#txtOperador").data("kendoComboBox").value('');
                                    Backbone.off('eventCierraDialogo');
                                },
                                contexto: this
                            });

                        }
                    }
                }).data("kendoAutoComplete");

                // BOTON DNI TRANSPORTISTA
                $("#txtNombreTransportista").kendoComboBox({
                    minLength: 1,
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetDataAutoCompleteTransportista/",
                                dataType: "json",
                                cache: false,

                            },
                            parameterMap: function (data, type) {
                                if (type == "read")
                                    if ($('#txtNombreTransportista').data("kendoComboBox").text()) {
                                        return { nombre: $('#txtNombreTransportista').data("kendoComboBox").text() };
                                    }
                            }
                        },
                        sort: { field: "Nombre", dir: "asc" },
                        schema: {
                            model: {
                                id: "ID",
                                fields: {
                                    'ID': { type: "number" },
                                    'Nombre': { type: "string" },
                                    'Tipo': { type: "string" }
                                }
                            }
                        }
                    },
                    filter: "contains",
                    dataValueField: "ID",
                    dataTextField: "Nombre",
                    filtering: function (e) {
                        e.preventDefault();
                        var filter = e.filter;
                        this.dataSource.read();
                    },

                    select: self.SelectDNI,

                    change: function (e) {
                        if (this.value() && this.selectedIndex == -1) {
                            var _value = this.value().trim();
                            this.confirmacion = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('AVISO'),
                                msg: window.app.idioma.t('TRANSPORTISTA_NO_ENCONTRADO'),
                                funcion: function (e) {
                                    jsMantenimiento.ShowWindowNewForm(e, self, 'txtNombreTransportista', 'clsDriver');
                                    $("#vpTxtNombre").val(_value);
                                    Backbone.trigger('eventCierraDialogo');
                                },
                                funcionClose: function (e) {
                                    $("#txtNombreTransportista").data("kendoComboBox").value('');

                                },
                                contexto: this
                            });

                        }

                        if (this.value() == "") {
                            $("#txtDNITransportista").val('');
                        }
                    }

                }).data("kendoAutoComplete");


                $("#txtDNITransportista").prop("disabled", true).addClass("k-state-disabled");
                $("#txtUbicacionExterna").prop("disabled", true).addClass("k-state-disabled");

                $('#txtMatriculaTractora, #txtMatriculaRemolque').on('keypress', function (e) {
                    if (e.which == 32)
                        return false;
                });

            },

            SetValues: function (transporte) {
                var self = this;
                var cmbClienteProveedor = self.$("#selectClienteProveedor").data("kendoComboBox");
                var cmbProducto = self.$("#selectProducto").data("kendoComboBox");
                var cmbDestino = self.$("#selectDestino").data("kendoComboBox");
                var txtOrigen = self.$("#txtOrigen").data("kendoComboBox");
                var cmbTransportista = self.$("#txtNombreTransportista").data("kendoComboBox");
                var cmbGranel = self.$("#selectGranel").data("kendoDropDownList");
                var cmbMatriculaTractora = self.$("#txtMatriculaTractora").data("kendoComboBox");
                var cmbMatriculaRemolque = self.$("#txtMatriculaRemolque").data("kendoComboBox");
                var cmbOperador = self.$("#txtOperador").data("kendoComboBox");
                var txtNIF = self.$("#txtDNITransportista");
                var poblacionDestinatario = self.$("#txtUbicacionExterna");
                var dateFechaEntrada = self.$("#dateFechaEntrada");
                var ubicacionInterna = self.$("#txtUbicacionInterna").data("kendoDropDownList");
                //var dateFechaSalida = $("#dateFechaSalida").data("kendoDateTimePicker");
                var numericPesoEntrada = self.$("#numericTxtPesoEntrada").data("kendoNumericTextBox");
                var numericPesoSalida = self.$("#numericTxtPesoSalida").data("kendoNumericTextBox");
                var _txtObservacion = self.$("#txtObservacion");
                var _txtObservacionProducto = self.$("#txtObservacionProducto");
                $("#btnFinalizarCamion, #btnImprimirSalida").hide();



                if (transporte != null) {
                    cmbClienteProveedor.value(transporte.IdProveedor);
                    cmbProducto.value(transporte.IdProducto);
                    cmbDestino.value(transporte.IdDestinatario);
                    //txtOrigen.value(transporte.IdOrigenMercancia);

                    var oldDataMatriculaTractora = cmbMatriculaTractora.dataSource.data();
                    var oldDataMatriculaRemolque = cmbMatriculaRemolque.dataSource.data();
                    var oldDataTransportista = cmbTransportista.dataSource.data();
                    var oldDataOperador = cmbOperador.dataSource.data();
                    var oldDataOrigen = txtOrigen.dataSource.data();
                    //Para poder seleccionar el valor en algun combo que tenga ServerFiltering a true
                    cmbMatriculaTractora.dataSource.remove(oldDataMatriculaTractora[0]);
                    cmbMatriculaTractora.dataSource.add({ ID: transporte.IdMatriculaTractora, Nombre: transporte.MatriculaTractora });
                    cmbMatriculaTractora.value(transporte.IdMatriculaTractora);

                    cmbMatriculaRemolque.dataSource.remove(oldDataMatriculaRemolque[0]);
                    cmbMatriculaRemolque.dataSource.add({ ID: transporte.IdMatriculaRemolque, Nombre: transporte.MatriculaRemolque });
                    cmbMatriculaRemolque.value(transporte.IdMatriculaRemolque);

                    cmbTransportista.dataSource.remove(oldDataTransportista[0]);
                    cmbTransportista.dataSource.add({ ID: transporte.IdTransportista, Nombre: transporte.NombreTransportista });
                    cmbTransportista.value(transporte.IdTransportista);

                    cmbOperador.dataSource.remove(oldDataOperador[0]);
                    cmbOperador.dataSource.add({ ID: transporte.IdOperador, Nombre: transporte.NombreOperador });
                    cmbOperador.value(transporte.IdOperador);

                    txtOrigen.value(transporte.IdOrigenMercancia);

                    var _fechaEntrada = kendo.toString(kendo.parseDate(transporte.FechaEntrada), "dd/MM/yyyy HH:mm:ss");
                    dateFechaEntrada.val(_fechaEntrada);
                    txtNIF.val(transporte.NIF);
                    var isGranel = transporte.IsGranel ? 1 : 2;
                    cmbGranel.select(isGranel - 1);
                    cmbGranel.trigger("select");


                    ubicacionInterna.value(transporte.IdUbicacionInterna);
                    poblacionDestinatario.val(transporte.PoblacionDestinatario)
                    //dateFechaSalida.value(transporte.FechaSalida);
                    numericPesoEntrada.value(transporte.PesoEntrada)
                    numericPesoSalida.value(transporte.PesoSalida);
                    _txtObservacion.val(transporte.Observaciones);
                    _txtObservacionProducto.val(transporte.ObservacionesProducto);
                    self.idTransporte = transporte.IdTransporte;
                    self.$("#lblCabeceraDetalle").html(window.app.idioma.t("MODIFICAR_TRANSPORTE"))
                    if (transporte.ColorSemaforo == 'Verde') {
                        self.$("#btnFinalizarCamion, #btnImprimirSalida").show();
                    }

                } else {
                    cmbClienteProveedor.value('');
                    cmbProducto.value('');
                    cmbDestino.value('');
                    txtOrigen.value('');
                    cmbTransportista.value('');
                    cmbMatriculaTractora.value('');
                    cmbMatriculaTractora.dataSource.filter([]);
                    cmbMatriculaRemolque.value('');
                    cmbMatriculaRemolque.dataSource.filter([]);
                    cmbTransportista.value('');
                    cmbTransportista.dataSource.filter([]);
                    cmbOperador.dataSource.filter([]);
                    cmbOperador.value('');
                    numericPesoEntrada.value('')
                    numericPesoSalida.value('');
                    _txtObservacion.val('');
                    _txtObservacionProducto.val('');
                    //ubicacionInterna.value('');
                    //ubicacionInterna.dataSource.read();
                    cmbGranel.value(2);
                    cmbGranel.trigger("select");
                    txtNIF.val('');
                    poblacionDestinatario.val('');
                    $("#numericTxtPesoSalida").data("kendoNumericTextBox").enable(false);
                    $("#btnCapturarSalida").data("kendoButton").enable(false);
                    //Fecha actual
                    var MS_PER_MINUTE = 60000;
                    var myEndDateTime = new Date();
                    var durationInMinutes = 1;
                    var myStartDate = new Date(myEndDateTime - durationInMinutes * MS_PER_MINUTE);
                    var _fechaEntrada = kendo.toString(kendo.parseDate(myStartDate), "dd/MM/yyyy HH:mm:ss");
                    dateFechaEntrada.val(_fechaEntrada);

                    var _pestania = $("#divPestanias").data("kendoTabStrip");
                    //_pestania.disable(_pestania.tabGroup.children().eq(3));
                    //_pestania.disable(_pestania.tabGroup.children().eq(2));
                    crearTooltips(_pestania.tabGroup.children().eq(3), 'SELECCIONE_CAMION');
                    crearTooltips(_pestania.tabGroup.children().eq(2), 'SELECCIONE_CAMION');

                    self.$("#btnCrear").show();
                    self.$("#btnGuardar").hide();
                    self.$("#btnReiniciarCampos").show();
                    //dateFechaSalida.value('');

                    self.$("#lblCabeceraDetalle").html(window.app.idioma.t("CREAR_TRANSPORTE"))
                }

                //Si selecciona para modificar un transporte los botones cambian a guardar y cancelar
                //if (self.changeEvent == 0) {
                //    self.MostrarBotonTransporte("btnGuardar");
                //    self.MostrarBotonTransporte("btnCancelarTransporte");
                //    self.MostrarBotonTransporte("btnCrear");
                //    self.MostrarBotonTransporte("btnReiniciarCampos");
                //    self.changeEvent = 1;
                //}

            },

            SelectDNI: function (e) {

                if (typeof e.item !== 'undefined') {
                    var dataItem = this.dataItem(e.item.index());
                    if (dataItem.ID != 0) {
                        $("#txtDNITransportista").val(dataItem.Tipo);
                    } else {
                        $("#txtDNITransportista").val("");
                    }
                }


            },

            SelectUbicacionExterna: function (e) {

                if (typeof e.item !== 'undefined') {
                    var dataItem = this.dataItem(e.item.index());
                    if (dataItem.ID != 0) {
                        $("#txtUbicacionExterna").val(dataItem.Destinatario);
                    } else {
                        $("#txtUbicacionExterna").val("");
                    }
                }


            },

            ValidarCamposFormulario: function (transporte) {
                var self = this;
                var _fechaEntrada = $("#labelFechaEntrada");
                var _matriculaTractora = $("#labelMatriculaTractora");
                var _matriculaRemolque = $("#labelMatriculaRemolque");
                var _dni = $("#labelDNITransportista");
                var _nombreTransportista = $("#labelNombreTransportista");
                var _origenMercancia = $("#labelOrigenMercancia")
                var _valueReturn = false;
                var patronPlaca = /^([A-Z]{1,2})?\d{4}([A-Z]{2,3})$/;
                self.RemoveClassInvalid();

                var fEntrada = new Date(transporte.FechaEntrada)
                //var fSalida = new Date(transporte.FechaSalida)
                var fActual = new Date();


                //if (transporte.FechaEntrada == "" || (fEntrada >= fSalida && fSalida != "")) {
                //if (fEntrada >= fSalida && fSalida != "") {
                //    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'La fecha de entrada debe ser menor a la de salida', 3000);
                //}
                if (fEntrada >= fActual) {
                    Not.crearNotificacion('error', window.app.idioma.t("ERROR"), window.app.idioma.t("VALIDACION_FECHA_MENORQUE_ACTUAL"), 3000);
                    _fechaEntrada.addClass("k-invalid");



                } else if (transporte.MatriculaTractora == "") {
                    _matriculaTractora.addClass("k-invalid");
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDACION_CAMPO_MATRICULA_TRACTORA'), 4000);
                }

                if (transporte.MatriculaTractora.length > 1) {
                    if (!patronPlaca.test(transporte.MatriculaTractora)) {
                        //_matriculaTractora.addClass("k-invalid");
                        //_valueReturn = false;
                        Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDACION_CAMPO_MATRICULA_TRACTORA_FORMATO'), 4000);
                    }
                }

                if (transporte.MatriculaTractora.length < 6 || transporte.MatriculaTractora.length > 8) {
                    _matriculaTractora.addClass("k-invalid");
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDACION_CAMPO_MATRICULA_TRACTORA_LONGITUD'), 4000);
                } else if ((transporte.MatriculaRemolque.length < 6 || transporte.MatriculaRemolque.length > 9) && transporte.MatriculaRemolque.length > 1) {
                    _matriculaTractora.addClass("k-invalid");
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDACION_CAMPO_MATRICULA_REMOLQUE_LONGITUD'), 4000);
                } else if (transporte.NombreTransportista == "") {
                    _nombreTransportista.addClass("k-invalid");
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('CAMPO_TRANSPORTISTA'), 4000);
                } else if (transporte.NIF == "") {
                    _dni.addClass("k-invalid");
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('CAMPO_NIF'), 4000);
                }
                //else if (transporte.DescripcionOrigenMercancia != "" && transporte.IdOrigenMercancia == 0) {
                //    _origenMercancia.addClass("k-invalid");
                //    Not.crearNotificacion('error',window.app.idioma.t('AVISO'), 'No se puede crear un nuevo origen al modificar un transporte', 4000);
                //}
                else if (transporte.DescripcionOrigenMercancia == "") {
                    _origenMercancia.addClass("k-invalid");
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('CAMPO_ORIGEN_MERCANCIA'), 4000);
                }
                else {
                    _valueReturn = true;
                }

                if (transporte.MatriculaRemolque.length > 1) {
                    if (!patronPlaca.test(transporte.MatriculaRemolque)) {
                        //_matriculaRemolque.addClass("k-invalid");
                        //_valueReturn = false;
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDACION_CAMPO_MATRICULA_REMOLQUE_FORMATO'), 4000);
                    }
                }

                return _valueReturn;
            },

            //#endregion METODOS

            eliminar: function () {
                this.remove();
            },
        });

        return vistaCamionesTransito;
    });

function crearTooltips(target, content) {
    if (target.data("kendoTooltip") !== undefined) {
        target.data("kendoTooltip").destroy();
    }
    target.kendoTooltip({
        position: "bottom",
        content: window.app.idioma.t(content)
    });
}
