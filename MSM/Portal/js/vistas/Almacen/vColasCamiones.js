define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/ColasCamiones.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function (_, Backbone, $, plantillaColas, Not, VistaDlgConfirm, Session) {
        var vistaColas = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantillaColas),
            gridUbicaciones: null,
            dsUbicaciones: null,
            gridLotes: null,
            dsLotes: null,
            dsUbicacionInterna: null,
            idUbicacion: null,
            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;
                kendo.culture(localStorage.getItem("idiomaSeleccionado"));
                Backbone.on('eventRefreshColaCamiones', this.ActualizaGridLotes, this);



                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                $("#divSplitterColas").kendoSplitter({
                    orientation: "vertical",
                    resize: false,
                    panes: [
                        { collapsible: false, size: '50%' },
                        { collapsible: false, size: '50%' }
                    ]
                });

                var splitter = $("#divSplitterColas").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);



                self.DataSourceUbicaciones(self);
                self.ObtenerGridUbicaciones(self);
                self.DataSourceLotes(self, 0);
                self.ObtenerGridLotes(self);
                self.ResizeTab()
            },

            //#region EVENTOS
            events: {
                'click #btnMoveTransport': function (e) { this.MoveTransport(this) },
                // 'click #btnMoverUbicacionLote': function (e) { this.ConfirmMoveTransport(this) }
            },
            //#endregion EVENTOS

            ActualizaGridLotes: function (value) {
                var self = this;
                if (value) {
                    self.gridLotes.dataSource.read();
                }
            },

            ResizeTab: function () {

                var contenedorHeight = $("#center-pane").height();
                var cabeceraHeight = $("#divCabeceraVista").height();
                $("#divSplitterColas").height(contenedorHeight - cabeceraHeight);
                //$("#gridUbicaciones").height('400px');
                var splitter = $("#divSplitterColas").data("kendoSplitter");
                splitter.wrapper.height(contenedorHeight - cabeceraHeight);
                splitter.resize();
            },

            ConfirmMoveTransport: function (self) {
                var idUbicacion = self.idUbicacion;
                var idLote = self.gridLotes.dataItem(self.gridLotes.select()).IdLote;

            },

            DataSourceUbicaciones: function (self) {
                self.dsUbicaciones = new kendo.data.DataSource({
                    batch: true,
                    pageSize: 10,
                    sort: { field: "Nombre", dir: "asc" },
                    transport: {
                        read: {
                            url: "../api/GetUbicacionesDescarga",
                            dataType: "json",
                            cache: false
                        },
                        requestEnd: function (e) {
                            if (e.type == "read") {
                                self.DataSourceLotes(self, 0);
                                self.gridLotes.dataSource.read();
                            }
                        },
                        schema: {
                            model: {
                                fields: {
                                    'IdUbicacion': { type: "number" },
                                    'Nombre': { type: "string" },
                                    'Estado': { type: "string" },
                                    'Almacen': { type: "string" },
                                    'Zona': { type: "string" },
                                    'TipoUbicacion': { type: "string" },
                                    'TipoMaterial': { type: "string" },
                                    'StockActual': { type: "number" },
                                }
                            }
                        }

                    }
                });
                return self.dsUbicaciones;

            },

            DataSourceLotes: function (self, idUbicacion) {
                self.dsLotes = new kendo.data.DataSource({
                    batch: true,
                    transport: {
                        read: {
                            url: "../api/GetLotesByIdUbicacion/" + idUbicacion,
                            dataType: "json",
                            cache: false
                        },
                        schema: {
                            model: {
                                fields: {
                                    'IdLote': { type: "string" },
                                    'Cantidad': { type: "number" },
                                    'FechaEntrada': { type: "date" },
                                    'IdTransporte': { type: "number" },
                                    'Material': { type: "string" },
                                    'Matricula': { type: "string" },
                                    'Posicion': { type: "number" },
                                    'Proveedor': { type: "string" },
                                    'UltimoCamion': { type: "string" },
                                    'FechaOrden': { type: "date" },
                                    'IdAlbaran': { type: "number" }
                                }
                            }
                        }

                    }
                });
                return self.dsLotes;

            },

            ObtenerGridUbicaciones: function (self) {
                self.gridUbicaciones = $("#gridUbicaciones").kendoGrid({
                    dataSource: self.dsUbicaciones,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    resizable: true,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    autoSync: false,
                    scrollable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [30, 100, 200, 'All'],
                        buttonCount: 2,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    selectable: true,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    noRecords: {
                        template: window.app.idioma.t("SIN_RESULTADOS")
                    },
                    columns: [
                        {
                            field: "Nombre",
                            title: window.app.idioma.t("NOMBRE"),
                            template: '#=typeof Nombre !== "undefined"?  Nombre : ""#'
                        },
                        {
                            field: "Estado",
                            title: window.app.idioma.t("ESTADO"),
                            template: '#=typeof Estado !== "undefined"?  Estado : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Estado#' style='width: 14px;height:14px;margin-right:5px;'/>#= Estado#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Almacen",
                            title: window.app.idioma.t("ALMACEN"),
                            template: '#=typeof Almacen !== "undefined"?  Almacen : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Almacen#' style='width: 14px;height:14px;margin-right:5px;'/>#= Almacen#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Zona",
                            title: window.app.idioma.t("ZONA"),
                            template: '#=typeof Zona !== "undefined"?  Zona : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Zona#' style='width: 14px;height:14px;margin-right:5px;'/>#= Zona#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "TipoUbicacion",
                            title: window.app.idioma.t("TIPO_UBICACION"),
                            template: '#=typeof TipoUbicacion !== "undefined"?  TipoUbicacion : ""#',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=TipoUbicacion#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoUbicacion#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "TipoMaterial",
                            attributes: { "align": "center" },
                            width: "10%",
                            title: window.app.idioma.t("ENLACE_TERMINAL"),
                            template: '# if(IdUbicacion !== "undefined"){#<a href="../terminal_cola_camiones?IdUbicacion=#=IdUbicacion#" target="_blank" >Link</a>#}#',
                            filterable: false
                        },
                        //{
                        //    field: "StockActual",
                        //    title: window.app.idioma.t("STOCKACTUAL"),
                        //    template: '#=typeof StockActual !== "undefined"?  StockActual : ""#'
                        //},

                    ],
                    change: function (e) {
                        var selectedRows = this.select();
                        if (selectedRows.length > 0) {
                            var dataItem = this.dataItem(selectedRows[0]);
                            // var dataItem = this.dataItem(e.item);
                            self.DataSourceLotes(self, dataItem.IdUbicacion);
                            self.gridLotes.setDataSource(self.dsLotes);
                            self.gridLotes.dataSource.read();
                        }
                    },

                    dataBound: function () {

                    }

                }).data("kendoGrid");

            },

            ObtenerGridLotes: function (self) {
                self.gridLotes = $("#gridLotes").kendoGrid({
                    dataSource: self.dsLotes,
                    autoBind: false,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    resizable: true,
                    autoSync: false,
                    scrollable: true,
                    pageable: false,
                    selectable: true,
                    toolbar: [
                        {
                            template: "<label>" + window.app.idioma.t('CAMIONES_COLA') + "</label>"
                        },
                        { template: "<a class='k-button k-button-icontext' style='display:none' id='btnMoveTransport'  href='\\#'>" + window.app.idioma.t('MOVER') + "</a>" }
                    ],
                    noRecords: {
                        template: window.app.idioma.t("SIN_RESULTADOS")
                    },
                    columns: [
                        {
                            field: "Posicion",
                            attributes: { "align": "center" },
                            width: "5%",
                            title: window.app.idioma.t("POSICION"),
                            template: '#=typeof Posicion !== "undefined"?  Posicion : ""#'
                        },
                        //{
                        //    field: "IdLote",
                        //    title: window.app.idioma.t("LOTE"),
                        //    template: '#=typeof IdLote !== "undefined"?  IdLote : ""#'
                        //},
                        {
                            field: "Matricula",
                            title: window.app.idioma.t("MATRICULA"),
                            template: '#=typeof Matricula !== "undefined"?  Matricula : ""#'
                        },
                        {
                            field: "FechaEntrada",
                            title: window.app.idioma.t("FECHA_ENTRADA"),
                            template: '#= FechaEntrada != null ? kendo.toString(new Date(FechaEntrada), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        },
                        {
                            field: "Cantidad",
                            title: window.app.idioma.t("CANTIDAD"),
                            template: '#=typeof Cantidad !== "undefined"?   kendo.format("{0:n2}", Cantidad) : ""#'
                        },
                        {
                            field: "UltimoCamion",
                            attributes: { "align": "center" },
                            title: window.app.idioma.t("CAMBIO_MATERIA_PRIMA"),
                            template: '<input type="checkbox" class="chkBox" style="cursor:pointer !important" #if (UltimoCamion !== "undefined"){ if (UltimoCamion == true){#checked# }} # />'
                        },
                        {
                            field: "coms",
                            title: window.app.idioma.t("OPERACIONES"),
                            attributes: { "align": "center" },
                            template: "<a class='k-button btnFinDescarga' href='\\#' >" + window.app.idioma.t("FINALIZAR_DESCARGA") + "</a>",
                        }

                    ],
                    dataBound: function () {
                        $('#gridLotes .k-grid-content').css('max-height', '400px');


                    },
                    change: function (e) {
                        // $("#btnMoveTransport").show();
                    }

                }).data("kendoGrid");


                //EVENTO DEL CHECKBOX EN EL LOTE
                self.gridLotes.table.on("click", ".chkBox", function () {
                    var checkedIds = {};
                    var checked = this.checked,
                        row = $(this).closest("tr"),
                        grid = $("#gridLotes").data("kendoGrid"),
                        dataItem = grid.dataItem(row);

                    if (dataItem != null) {
                        if (!checked) { dataItem.UltimoCamion = false; }
                        else { dataItem.UltimoCamion = true; }
                        var _idTransporte = dataItem.IdTransporte;
                        var _ultimoCamion = checked;
                        var offset = new Date(dataItem.FechaOrden).getTimezoneOffset();
                        var fechaOrden = new Date(dataItem.FechaOrden);
                        fechaOrden.setMinutes(fechaOrden.getMinutes() - offset);
                        //dataItem.set("FechaOrden", fechaOrden);
                        self.ActualizarCamion(_idTransporte, _ultimoCamion, fechaOrden)
                    }

                });

                self.gridLotes.table.on("click", ".btnFinDescarga", function () {
                    var row = $(this).closest("tr"),
                        grid = $("#gridLotes").data("kendoGrid"),
                        dataItem = grid.dataItem(row);

                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t("FINALIZAR_DESCARGA"),
                        msg: window.app.idioma.t("CONFIRMACION_FINALIZAR_DESCARGA"),
                        funcion: function () {
                            grid.dataSource.remove(dataItem);  //prepare a "destroy" request
                            grid.dataSource.sync();  //actually send the request (might be ommited if the autoSync option is enabled in the dataSource)
                            self.FinalizarDescarga(dataItem.IdTransporte, dataItem.IdTipoAlbaran, self);
                            Backbone.trigger('eventCierraDialogo');
                        },
                        contexto: this
                    });
                });

                //EVENTO PARA QUE SE MUEVA LA FILA SELCCIONADA
                self.gridLotes.table.kendoSortable({
                    filter: ">tbody >tr",
                    hint: function (element) { //customize the hint
                        var table = $('<table style="width: ' + $("#gridLotes").width() + 'px;" class="k-grid k-widget"></table>'),
                            hint;

                        table.append(element.clone()); //append the dragged element
                        table.css("opacity", 0.7);

                        return table; //return the hint element
                    },
                    cursor: "move",
                    placeholder: function (element) {
                        return $('<tr colspan="4" class="placeholder"></tr>');
                    },
                    change: function (e) {
                        var oldIndex = e.oldIndex,//VALOR ANTIGUO
                            newIndex = e.newIndex,// VALOR NUEVO
                            data = self.gridLotes.dataSource.data(),//DATA DEL GRID DE LOTES
                            dataItem = self.gridLotes.dataSource.getByUid(e.item.data("uid")); // ITEM DEL GRID A TRAVES DE SU UID


                        var _dataItemObjetivo = self.gridLotes.dataSource._data[newIndex];//ITEM AL QUE SE VA A MOVER
                        var _fechaNueva = self.gridLotes.dataSource.getByUid(_dataItemObjetivo.uid).FechaOrden;
                        var _UltimoCamion = dataItem.UltimoCamion;
                        var offset = new Date(_fechaNueva).getTimezoneOffset();
                        _fechaNueva = new Date(_fechaNueva);
                        if (oldIndex > newIndex) {
                            var milliseconds = _fechaNueva.getMilliseconds() - 100;
                        } else {
                            var milliseconds = _fechaNueva.getMilliseconds() + 100;
                        }
                        _fechaNueva.setMilliseconds(milliseconds);
                        _fechaNueva.setMinutes(_fechaNueva.getMinutes() - offset);
                        var idLote = dataItem.IdLote;
                        var idTransporte = dataItem.IdTransporte;

                        dataItem.set("FechaOrden", _fechaNueva);
                        self.gridLotes.dataSource.remove(dataItem); // ELIMINA EL ITEM DE SU POSICIÓN
                        self.gridLotes.dataSource.insert(newIndex, dataItem);// AÑADE EL ITEM EN LA POSICION NUEVA


                        //var arrayUpdate = [];
                        //Se actualizan todas las posiciones de la tabla
                        for (var i = 0; i < data.length; i++) {
                            dataItem = self.gridLotes.dataSource._data[i];
                            dataItem = self.gridLotes.dataSource.getByUid(dataItem.uid);
                            dataItem.set("Posicion", i + 1);
                            //arrayUpdate.push(
                            //    {
                            //        IdLote: dataItem.IdLote,
                            //        Posicion: i+1
                            //    }
                            //  )
                        }



                        //SE ACTUALIZA EN BASE DE DATOS LAS POSICIONES DE LOS TRANSPORTES
                        if (idTransporte != null) {
                            self.ActualizarCamion(idTransporte, _UltimoCamion, _fechaNueva, self)

                        }

                    }
                });

            },

            FinalizarDescarga: function (idTransporte, idTipoAlbaran, self) {
                var transporte = { IdTransporte: idTransporte, IdTipoAlbaran: idTipoAlbaran }
                $.ajax({
                    type: "PUT",
                    data: JSON.stringify(transporte),
                    async: true,
                    url: "../api/FinalizarDescargaByTransporte",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        // self.gridLotes.dataSource.read();
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GUARDAR'), 4000);
                        }
                    }
                });
            },

            ActualizarCamion: function (idTransporte, ultimoCamion, fechaOrden, self) {
                var permiso = false;
                for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                    if (window.app.sesion.attributes.funciones[i].id === 137)
                        permiso = true;
                }
                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                } else {
                    var options = {
                        IdTransporte: idTransporte,
                        FechaOrden: fechaOrden,
                        UltimoCamion: ultimoCamion
                    };
                    $.ajax({
                        type: "PUT",
                        async: true,
                        data: JSON.stringify(options),
                        url: "../api/ActualizarColaLote",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            self.gridLotes.dataSource.read();
                            //Backbone.trigger('eventRefreshColaCamionesTerminal');//SE PASA EL VALOR A FALSE PARA ACTUALIZAR EN EL TERMINAL
                        },
                        error: function (err) {
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', "Error", window.app.idioma.t("ERROR_MODIFICANDO"), 4000);
                            }

                        }
                    });
                }
            },

            MoveTransport: function (self) {
                if (self.gridLotes.select().length > 0 && self.gridUbicaciones.select().length > 0) {
                    var itemUbicaciones = self.gridUbicaciones.dataItem(self.gridUbicaciones.select());
                    var itemLote = self.gridLotes.dataItem(self.gridLotes.select());
                    self.DataSourceLocations();
                    self.ShowWindowLocation(self);
                }
                else if (self.gridLotes.select().length == 0) {
                    Not.crearNotificacion('info', window.app.idioma.t("SELECCIONAR_UNO"), window.app.idioma.t("SELECCIONAR_LOTE"), 4000);
                    $("#btnMoveTransport").hide();
                } else if (self.gridUbicaciones.select().length == 0) {
                    Not.crearNotificacion('info', window.app.idioma.t("SELECCIONAR_UNO"), window.app.idioma.t("SELECCIONAR_UBICACION"), 4000);
                    $("#btnMoveTransport").hide();

                }
            },

            Window: function () {
                var self = this;
                var tooltip = kendo.template($("#template").html());//TEMPLATE PREPARADO EN EL HTML
                $('<div style="overflow-x:hidden" id="wndLocation">' + tooltip({}) + '</div>').appendTo($("#divWnd")); // SE LE AÑADE A LA VENTANA NUEVA

                $('<input data-text-field="Nombre" required id="cmbUbicacionInterna"  data-value-field="ID"  />')
                    .appendTo($('#divCmbUbicacionInterna'))
                    .kendoDropDownList({
                        optionLabel: window.app.idioma.t("SELECCIONE_UNO"),
                        filter: "contains",
                        dataSource: self.dsUbicacionInterna,
                        select: function (e) {
                            var dataItem = this.dataItem(e.item);
                            self.idUbicacion = dataItem.ID;

                            //LLAMADA A SERVIDOR PARA MODIFICAR LA UBICACION
                        }
                    });

                $("#wndLocation").kendoWindow({
                    visible: false,
                    title: self.gridLotes.dataItem(self.gridLotes.select()).IdLote,
                    close: function () {
                        self.wnd.destroy();
                        self.wnd = null;
                    }
                });


                $("#btnMoverUbicacionLote").on("click", function () {
                    self.ConfirmMoveTransport(self);

                });

            },

            DataSourceLocations: function () {
                var self = this;
                self.dsUbicacionInterna = new kendo.data.DataSource({
                    batch: false,
                    transport: {
                        read: {
                            url: "../api/GetDataAutoCompleteUbicacion/Interna",
                            dataType: "json",
                            cache: false,
                        },
                    },

                    schema: {
                        model: {
                            id: "ID",
                            fields: {
                                'ID': { type: "number" },
                                'Nombre': { type: "string" }
                            }
                        }
                    }
                });
                return self.dsUbicacionInterna;
            },

            ShowWindowLocation: function (self) {

                self.Window();
                self.wnd = $('#wndLocation').data("kendoWindow");
                self.wnd.open();
                self.wnd.center();
                self.wnd.one("activate", function () {
                });
            },

            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                //var filtrosGrid1Height = $(".k-grouping-header").innerHeight();
                //var filtrosSeparadorGridHeight = $("#divSeparadorGrids").innerHeight();
                //var filtrosGrid2Height = $("#divFiltrosAccionesMejora").innerHeight();


                //Grid 1
                var gridElement = $("#gridUbicaciones"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                dataArea.height(contenedorHeight / 2 - otherElementsHeight - cabeceraHeight / 2 / 2 - 45);


                //Grid 2
                var gridElement2 = $("#gridLotes"),
                    dataArea2 = gridElement2.find(".k-grid-content"),
                    gridHeight2 = gridElement2.innerHeight(),
                    otherElements2 = gridElement2.children().not(".k-grid-content"),
                    otherElementsHeight2 = 0;
                otherElements2.each(function () {
                    otherElementsHeight2 += $(this).outerHeight();
                });

                dataArea2.height(contenedorHeight / 2 - otherElementsHeight2 - cabeceraHeight / 2 / 2 - 30);
            },

            eliminar: function () {
                Backbone.off('eventRefreshColaCamiones', this.ActualizaGridLotes(this), this);
                this.remove();
            },
        });

        return vistaColas;
    });

