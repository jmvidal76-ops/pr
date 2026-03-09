const { forEach } = require("underscore");

define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/GestionUbicaciones.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'vistas/Almacen/vArbolEquipos', 'vistas/Almacen/vAsociarUbicacionZona'],
    function (_, Backbone, $, plantillaGestionUbicaciones, Not, VistaDlgConfirm, VistaArbol, VistaAsociarUbicacionZona) {
        var vistaGestionUbicaciones = Backbone.View.extend({
            tagName: 'div',
            id: 'divGestionUbicaciones',
            almacenes: null,
            zonas: null,
            ubicaciones: null,
            idAlmacenSaved: null,
            idZonaSaved: null,
            idUbicacionSaved: null,
            detalleAlmacen: null,
            detalleZona: null,
            detalleUbicacion: null,
            gridUbicacion: null,
            zonaSel: null,
            ubicacionSel: null,
            almacenSel: null,
            dsLineas: null,
            barcode: null,
            dsZonaAsociada: null,
            widthBarcode: 900,
            heightBarcode: 900,
            template: _.template(plantillaGestionUbicaciones),
            windowBarcode: null,
            initialize: function () {
                var self = this;

                self.almacenes = new kendo.data.DataSource({
                    batch: true,
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerAlmacenesUbicacion",
                            dataType: "json"
                        },
                        create: {
                            url: "../api/almacen/Create",
                            dataType: "json",
                            type: "POST",
                            contentType: "application/json; charset=utf-8",
                        },
                        destroy: {
                            url: "../api/almacen/Destroy",
                            dataType: "json",
                            type: "DELETE",
                            contentType: "application/json; charset=utf-8",
                        },
                        parameterMap: function (options, operation) {
                            if (operation !== "read" && options.models) {
                                return JSON.stringify(options.models[0]);
                            }
                        },
                    },
                    requestEnd: function (e) {
                        if (e.type == "destroy") {
                            var grid = $("#divListaAlmacenes").data("kendoGrid");
                            grid.dataSource.read();
                        }
                    },
                    sort: { field: "Descripcion", dir: "asc" },
                    schema: {
                        model: {
                            id: "IdAlmacen",
                            fields: {
                                'IdAlmacen': { type: "int" },
                                'Descripcion': { type: "string", editable: true, validation: { required: true } },
                                'IdTipoAlmacen': { type: "int" },
                                'DescripcionTipoAlmacen': { type: "string" }
                            }
                        }
                    },
                    //pagesize: 30
                });



                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                $(".divSplitter").kendoSplitter({
                    orientation: "vertical",
                    resize: false,
                    panes: [
                        { collapsible: false },
                        { collapsible: false },
                        { collapsible: false }
                    ]
                });


                $("#almacenes , #zona , #ubicaciones").kendoSplitter();

                $("#divListaAlmacenes").kendoGrid({
                    dataSource: self.almacenes,
                    sortable: true,
                    scrollable: true,
                    selectable: "row",
                    change: function (e) {
                        e.preventDefault();
                        self.seleccionaAlmacen(e, self);
                    },
                    culture: "es-ES",
                    filterable: false,
                    pageable: false,
                    toolbar: [
                        {
                            template: "<label>" + window.app.idioma.t('ALMACEN') + "</label>"
                        },
                        {
                            name: "create", text: window.app.idioma.t("NUEVO_ALMACEN")
                        }
                    ],
                    columns: [
                        {
                            field: 'IdAlmacen', hidden: true
                        },
                        {
                            title: window.app.idioma.t("NOMBRE"),
                            field: 'Descripcion',
                            width: "50px"
                        },
                        {
                            command: [
                                //{ name: "destroy", text: "Eliminar" }
                                {
                                    name: "Delete", text: window.app.idioma.t('ELIMINAR'),
                                    click: function (e) {  //add a click event listener on the delete button
                                        e.preventDefault(); //prevent page scroll reset

                                        var grid = $("#divListaAlmacenes").data("kendoGrid");
                                        var tr = $(e.target).closest("tr"); //get the row for deletion
                                        var data = this.dataItem(tr); //get the row data so it can be referred later

                                        this.confirmacion = new VistaDlgConfirm({
                                            titulo: window.app.idioma.t('ELIMINAR_ALMACÉN'), msg: window.app.idioma.t('DESEA_REALMENTE_ELIMNIAR'), funcion: function () {
                                                grid.dataSource.remove(data)  //prepare a "destroy" request
                                                grid.dataSource.sync()  //actually send the request (might be ommited if the autoSync option is enabled in the dataSource)
                                                Backbone.trigger('eventCierraDialogo');
                                            }, contexto: this
                                        });
                                    }
                                }

                                , {
                                    name: "edit",
                                    text: { edit: "", update: window.app.idioma.t('CREAR'), cancel: window.app.idioma.t('CANCELAR') }
                                }
                            ],
                            title: "&nbsp;",
                            width: "20px"
                        },],
                    editable: {
                        mode: "inline",
                        confirmation: window.app.idioma.t('CONFIRMACION_ELIMINAR_ALMACEN')
                    },
                    dataBound: function () {
                        var grid = this;

                        if (self.idAlmacenSaved === null) {
                            $.each(grid.tbody.find('tr'), function () {
                                var model = grid.dataItem(this);
                                $('[data-uid=' + model.uid + ']').addClass('k-state-selected');
                                return false;
                            });

                        }
                        else {
                            $.each(grid.tbody.find('tr'), function () {
                                var model = grid.dataItem(this);
                                if (model.id == self.idAlmacenSaved) {
                                    $('[data-uid=' + model.uid + ']').addClass('k-state-selected');
                                }
                            });

                            self.idAlmacenSaved = null;

                        }

                        $("#divListaAlmacenes tbody tr .k-grid-edit").each(function () {
                            $(this).remove();
                        });

                        var grid = $("#divListaAlmacenes").data("kendoGrid");
                        grid.trigger("change");


                    }
                });

                self.barcode = $("#barcode").kendoQRCode({
                    value: "",
                });

                if (!self.windowBarcode) {
                    self.windowBarcode = $("#window").kendoWindow({
                        width: "600px",
                        title: window.app.idioma.t('CÓDIGO_EAN_128'),

                        actions: [
                            "Pin",
                            "Minimize",
                            "Maximize",
                            "Close"
                        ],
                        close: function () {
                            this.destroy();
                        },
                    }).data("kendoWindow").center();
                }

            },
            events: {
                'click #btnlinkMesIdUbicacionLinkMes': 'cargaArbol',
                'click #btnEtiquetas': function () { this.generarTodasEtiquetas(this) },
                'click #undo': function () { this.printBarcode(this) },
            },
            generarTodasEtiquetas: function (self) {
                $("#windowBarcodes").html('');
                var dataItems = $("#divListaUbicaciones").data("kendoGrid").dataItems();
                for (var i = 0; i < dataItems.length; i++) {
                    var item = dataItems[i];
                    $("#windowBarcodes").append("<span  class='barcodes' id='barcode_" + item.IdUbicacion + "'></span>");
                    var barcode = $('#barcode_' + item.IdUbicacion).kendoQRCode({
                        value: "ID:" + item.IdUbicacion + ",V:" + item.Version,
                        errorCorrection: "M",
                        renderAs: "svg",
                        text: {
                            visible: false
                        },
                        // color: "#00b312"
                    });

                    $("#barcode_" + item.IdUbicacion + " div").append('<label style="color:#000000" class="txtBarcode">' + item.DescripcionAlmacen + '.' + item.Zona[0].Descripcion + '.' + item.Nombre + '.' + item.DescripcionTipoUbicacion + '</label>')
                    $("#windowBarcodes").append('<p style="page-break-after:always;"></p>');

                }

                if (typeof $("#windowBarcodes").data("kendoWindow") == 'undefined') {
                    $("#windowBarcodes").kendoWindow({
                        maxWidth: "600px",
                        maxHeight: "300px",
                        title: window.app.idioma.t('CÓDIGO_EAN_128'),

                    });
                }

                $("#windowBarcodes").data("kendoWindow").open().center();



                var mywindow = window.open('', window.app.idioma.t('CÓDIGO_EAN_128'), '');
                mywindow.document.write('<html><head><title>' + window.app.idioma.t('CÓDIGO_EAN_128') + '</title>');
                mywindow.document.write("<style>");
                mywindow.document.write(".barcodes{height:100%;width:100%;text-align:center;display: block !important;}"
                    + ".barcodes div{" +
                    "margin-bottom:0.3em;" +
                    "position: absolute;" +
                    "top:50%;" +
                    "left: 50%;" +
                    "transform: translate(-50%, -50%);" +
                    "}" +
                    //Bordes del codigo de barras
                    ".barcodes svg{ border-style: solid; padding-top:0.5em;padding-bottom:0.5em}"
                    
                    + ".txtBarcode{" +
                    "font-size:1.5em;" +
                    "margin-top:0.6em;" +
                    "font-family:'Helvetica Neue',Helvetica,Arial,sans-serif" +
                    "}"
                );
                mywindow.document.write("</style>");
                mywindow.document.write('</head><body >');
                //Contenido del codigo de barras
                var _barcodes = document.getElementsByClassName("barcodes");
                for (var i = 0; i < _barcodes.length; i++) {
                    var barcode = $("#" + _barcodes[i].id).data("kendoQRCode");
                    barcode.setOptions({ size: 600 });
                    barcode.resize();
                    mywindow.document.write(_barcodes[i].outerHTML);
                }

                mywindow.document.write('</body></html>');
                //Reiniciamos el barcode al tamaño inicial
                mywindow.document.close(); // necessary for IE >= 10
                mywindow.focus(); // necessary for IE >= 10*/

                mywindow.print();
                mywindow.close();

                var dialog = $("#windowBarcodes").data("kendoWindow");
                dialog.close();
                return true;
            },
            printBarcode: function (self) {
                self.PrintElem('barcode', self);
            },
            rellenarCodigoBarrasUbicacion: function () {
                var grid = $("#divListaUbicaciones").data("kendoGrid");
                var selectedItem = grid.dataItem(grid.select());
                var barcode = $('#barcode').data('kendoQRCode');
                barcode.setOptions({
                    value: "ID:" + selectedItem.IdUbicacion + ",V:" + selectedItem.Version,
                    size:400,
                    text: {
                        visible: false
                    },
                    color: "#00b312"
                });

                $(".txtBarcode").remove();
                $("#barcode div").append('<label style="color:#000000" class="txtBarcode">' + selectedItem.DescripcionAlmacen +
                    '.' + selectedItem.Zona[0].Descripcion + '.' + selectedItem.Nombre + '.' + selectedItem.DescripcionTipoUbicacion + '</label>')
            },
            PrintElem: function (elem, self) {
                self.rellenarCodigoBarrasUbicacion();

                var barcode = $('#barcode').data('kendoQRCode');
                barcode.setOptions({
                    size: 600,
                    color: "#000000",
                });

                barcode.redraw();

                var mywindow = window.open('', window.app.idioma.t('CÓDIGO_EAN_128'), '');
                mywindow.document.write('<html><head><title>' + window.app.idioma.t('CÓDIGO_EAN_128') + '</title>');
                mywindow.document.write("<style>");
                mywindow.document.write("#barcode{height:100%;width:100%;text-align:center;display: block !important;}"
                    + "#barcode div{" +
                    "margin-bottom:0.3em;" +
                    "position: absolute;" +
                    "top:50%;" +
                    "left: 50%;" +
                    "transform: translate(-50%, -50%);" +
                    "}" +
                    //Bordes del codigo de barras
                    "#barcode svg{ border-style: solid; padding:0.5em}"

                    + ".txtBarcode{" +
                    "font-size:1.5em;" +
                    "margin-top:0.6em;" +
                    "font-family:'Helvetica Neue',Helvetica,Arial,sans-serif" +
                    "}"
                );
                mywindow.document.write("</style>");
                mywindow.document.write('</head><body >');
                //Contenido del codigo de barras
                mywindow.document.write(document.getElementById(elem).outerHTML);
                mywindow.document.write('</body></html>');
                //Reiniciamos el barcode al tamaño inicial
                //self.resizeBarcode('barcode', 400, 300);
                mywindow.document.close(); // necessary for IE >= 10
                mywindow.focus(); // necessary for IE >= 10*/

                mywindow.print();
                mywindow.close();
                var dialog = $("#window").data("kendoWindow");
                dialog.close();


                return true;
            },
            resizeBarcode: function (id, _width, _height) {
                var barcode = $('#' + id).data('kendoQRCode');
                barcode.setOptions({
                    width: _width,
                    height: _height,
                });
                barcode.redraw();
            },
            seleccionaAlmacen: function (e, self) {

                var grid = $("#divListaAlmacenes").data("kendoGrid");
                var selectedItem = grid.dataItem(grid.select());

                self.almacenSel = selectedItem != null ? selectedItem.IdAlmacen : 0;

                self.detalleAlmacen = new kendo.data.DataSource({
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerDetalleAlmacen/" + parseInt(self.almacenSel),
                            dataType: "json"
                        },
                        update: {
                            url: "../api/detalleAlmacen/Update",
                            dataType: "json",
                            type: "PUT",
                            contentType: "application/json; charset=utf-8",
                        },
                        parameterMap: function (options, operation) {
                            if (operation !== "read" && options) {
                                var grid = $("#divListaAlmacenes").data("kendoGrid");

                                var selectedItem = grid.dataItem(grid.select());

                                self.idAlmacenSaved = selectedItem.IdAlmacen;

                                if (options.ddlAlmacenDescripcionTipoAlmacen !== null && options.ddlAlmacenDescripcionTipoAlmacen !== undefined) {

                                    var model = {};
                                    model.idProp = options.idProp;
                                    model.prop = options.prop;
                                    model.valor = options.ddlAlmacenDescripcionTipoAlmacen.Descripcion;
                                    model.idSup = options.idSup;

                                    return JSON.stringify(model);
                                }
                                else
                                    if (options.ddlAlmacenDescripcionTipoAlmacen !== undefined)
                                        return "";
                                    else {
                                        return JSON.stringify(options);

                                    }
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: "idProp",
                            fields: {
                                'idProp': { type: "string" },
                                'prop': { type: "string", editable: false },
                                'valor': { type: "string" },
                                'idSup': { type: "number" }
                            }
                        }
                    },
                    requestEnd: function (e) {
                        if (e.type == "update") {
                            var grid = $("#divPropAlmacenes").data("kendoGrid");
                            grid.dataSource.read();
                            var gridAlm = $("#divListaAlmacenes").data("kendoGrid");
                            gridAlm.dataSource.read();

                        }
                    },
                    data: function (data) {
                        if (data.length == 0) {
                            return [];
                        }
                        return data;
                    },
                    //pagesize: 30
                });

                if ($("#divPropAlmacenes").data("kendoGrid") !== undefined) {
                    $("#divPropAlmacenes").data("kendoGrid").destroy();
                }


                $("#divPropAlmacenes").kendoGrid({
                    dataSource: self.detalleAlmacen,
                    resizable: true,
                    toolbar: [
                        {
                            template: "<label>" + window.app.idioma.t('_PROPIEDADES_DEL') + "</label>"
                        },
                    ],
                    dataBound: function () {
                        $("#divPropAlmacenes .k-header").height($("#divListaAlmacenes .k-header").height());
                    },
                    columns: [
                        {
                            title: window.app.idioma.t("PROPIEDADES"),
                            field: 'prop',
                            width: "50px"
                        },
                        {
                            title: window.app.idioma.t("VALOR"),
                            template: '#=valor != null ? valor: ""#',
                            field: 'valor',
                            //editor: almacenEditor,
                            width: "70px"
                        },
                        { command: [{ name: "edit", text: { edit: "", update: window.app.idioma.t("ACTUALIZAR"), cancel: window.app.idioma.t("CANCELAR") } }], title: "&nbsp;", width: "30px" },
                    ],
                    editable: "inline",
                });

                function almacenEditor(container, options) {
                    if (options.model.idProp == "DescripcionTipoAlmacen") {
                        $("<input id='ddlAlmacen" + options.model.idProp + "' name='ddlAlmacen" + options.model.idProp + "'/>")
                            .appendTo(container)
                            .kendoDropDownList({
                                //autoBind: false,
                                dataTextField: "Descripcion",
                                dataValueField: "IdTipoAlmacen",
                                dataSource: {
                                    type: "json",
                                    transport: {
                                        read: "../api/ObtenerTipoAlmacen"
                                    }
                                },
                                dataBound: function (e) {
                                    var index = 0;
                                    for (var i = 0; i < e.sender.dataSource.data().length; i++)
                                        if (e.sender.dataSource.data()[i].Descripcion == options.model.valor)
                                            index = e.sender.dataSource.data()[i].IdTipoAlmacen;

                                    e.sender.value(index);
                                }
                            });
                    }
                    else {
                        $('<input id="txtAlmacen' + options.model.idProp + '" type="text" class="k-textbox" value="' + options.model.valor + '"  name="valor" data-type="string" data-bind="valor"/>')
                            .appendTo(container)


                    }
                }

                if ($("#divListaZonas").data("kendoGrid") !== undefined) {
                    $("#divListaZonas").data("kendoGrid").destroy();
                }
                self.zonas = new kendo.data.DataSource({
                    batch: true,
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerZonasDesdeAlmacen/" + parseInt(self.almacenSel),
                            dataType: "json"
                        },
                        create: {
                            url: "../api/zona/Create",
                            dataType: "json",
                            type: "POST",
                            contentType: "application/json; charset=utf-8",
                        },
                        destroy: {
                            url: "../api/zona/Destroy",
                            dataType: "json",
                            type: "DELETE",
                            contentType: "application/json; charset=utf-8",
                        },
                        parameterMap: function (options, operation) {
                            if (operation !== "read" && options.models) {
                                if (operation == "create") {

                                    var grid = $("#divListaAlmacenes").data("kendoGrid");
                                    var selectedItem = grid.dataItem(grid.select());

                                    options.models[0].IdAlmacen = selectedItem.IdAlmacen;
                                }

                                return JSON.stringify(options.models[0]);
                            }
                        }
                    },
                    sort: { field: "Descripcion", dir: "asc" },
                    schema: {
                        model: {
                            id: "IdZona",
                            fields: {
                                'IdZona': { type: "int" },
                                'Descripcion': { type: "string", editable: true },
                                'IdTipoZona': { type: "int" },
                                'DescripcionTipoZona': { type: "string", editable: true }
                            }
                        },
                        data: function (data) {
                            if (data.length == 0) {
                                return [];
                            }
                            return data;
                        }
                    },
                    requestEnd: function (e) {
                        if (e.type == "destroy") {
                            var grid = $("#divListaZonas").data("kendoGrid");
                            grid.dataSource.read();
                        }
                    },
                    //pagesize: 30
                });


                $("#divListaZonas").kendoGrid({
                    dataSource: self.zonas,
                    sortable: true,
                    resizable: true,
                    scrollable: true,
                    selectable: "row",
                    change: function (e) {
                        e.preventDefault();
                        self.seleccionaZona(e, self);
                    },
                    culture: "es-ES",
                    filterable: false,
                    pageable: false,
                    toolbar: [
                        {
                            template: "<label>" + window.app.idioma.t('ZONA') + "</label>"
                        },
                        {
                            name: "create", text: window.app.idioma.t("NUEVA_ZONA")
                        }

                    ],
                    columns: [
                        {
                            field: 'IdZona', hidden: true
                        },
                        {
                            title: window.app.idioma.t("NOMBRE"),
                            field: 'Descripcion',
                            width: "50px",
                        },
                        {
                            command: [
                                //{ name: "destroy", text: "Eliminar" }
                                {
                                    name: "Delete", text: window.app.idioma.t("ELIMINAR"),
                                    click: function (e) {  //add a click event listener on the delete button
                                        e.preventDefault(); //prevent page scroll reset

                                        var grid = $("#divListaZonas").data("kendoGrid");
                                        var tr = $(e.target).closest("tr"); //get the row for deletion
                                        var data = this.dataItem(tr); //get the row data so it can be referred later

                                        this.confirmacion = new VistaDlgConfirm({
                                            titulo: window.app.idioma.t('ELIMINAR_ZONA'), msg: window.app.idioma.t('DESEA_REALMENTE_ELIMNIAR_ESTA'), funcion: function () {
                                                grid.dataSource.remove(data)  //prepare a "destroy" request
                                                grid.dataSource.sync()  //actually send the request (might be ommited if the autoSync option is enabled in the dataSource)
                                                Backbone.trigger('eventCierraDialogo');
                                            }, contexto: this
                                        });
                                    }
                                }

                                , { name: "edit", text: { edit: "", update: window.app.idioma.t("CREAR"), cancel: window.app.idioma.t("CANCELAR") } }], title: "&nbsp;", width: "20px"
                        },],
                    editable: {
                        mode: "inline",
                        confirmation: window.app.idioma.t("CONFIRMACION_ELIMINAR_ZONA")
                    },
                    dataBound: function () {
                        var grid = this;

                        if (self.idZonaSaved === null) {
                            $.each(grid.tbody.find('tr'), function () {
                                var model = grid.dataItem(this);
                                $('[data-uid=' + model.uid + ']').addClass('k-state-selected');
                                return false;
                            });

                        }
                        else {
                            $.each(grid.tbody.find('tr'), function () {
                                var model = grid.dataItem(this);
                                if (model.id == self.idZonaSaved) {
                                    $('[data-uid=' + model.uid + ']').addClass('k-state-selected');
                                }
                            });

                            self.idZonaSaved = null;

                        }

                        $("#divListaZonas tbody tr .k-grid-edit").each(function () {
                            $(this).remove();
                        });

                        var grid = $("#divListaZonas").data("kendoGrid");
                        grid.trigger("change");


                    }
                });


            },
            asociarUbicaciones: function () {
                var gridZona = $("#divListaZonas").data("kendoGrid");
                var selectedItem = gridZona.dataItem(gridZona.select());
                var zona = {
                    IdZona: selectedItem.IdZona,
                    Descripcion: selectedItem.Descripcion
                };

                var gridUbicaciones = $("#divListaUbicaciones").data("kendoGrid").dataItems();
                var listIdUbicaciones = gridUbicaciones.map(item => item.IdUbicacion);

                new VistaAsociarUbicacionZona(zona, listIdUbicaciones);
            },
            seleccionaZona: function (e, self) {


                var grid = $("#divListaZonas").data("kendoGrid");
                var selectedItem = grid.dataItem(grid.select());

                if (selectedItem == null) {
                    self.detalleZona = new kendo.data.DataSource();
                }
                else {


                    self.detalleZona = new kendo.data.DataSource({
                        batch: true,
                        async: false,
                        transport: {
                            read: {
                                url: "../api/ObtenerDetalleZona/" + parseInt(selectedItem.IdZona),
                                dataType: "json"
                            },
                            update: {
                                url: "../api/detalleZona/Update",
                                dataType: "json",
                                type: "PUT",
                                contentType: "application/json; charset=utf-8",
                            },
                            parameterMap: function (options, operation) {
                                if (operation !== "read" && options) {

                                    var grid = $("#divListaZonas").data("kendoGrid");

                                    var selectedItem = grid.dataItem(grid.select());

                                    self.idZonaSaved = selectedItem.IdZona;

                                    if (options.models[0].ddlZonaDescripcionTipoZona !== null && options.models[0].ddlZonaDescripcionTipoZona !== undefined) {
                                        var model = {};
                                        model.idProp = options.models[0].idProp;
                                        model.prop = options.models[0].prop;
                                        model.valor = options.models[0].ddlZonaDescripcionTipoZona.Descripcion;
                                        model.aux = options.models[0].ddlZonaDescripcionTipoZona.IdTipoZona;
                                        model.idSup = options.models[0].idSup;

                                        return JSON.stringify(model);
                                    }
                                    else
                                        if (options.models[0].ddlZonaAlmacenDescripcionAlmacen !== null && options.models[0].ddlZonaAlmacenDescripcionAlmacen !== undefined) {

                                            var model = {};
                                            model.idProp = options.models[0].idProp;
                                            model.prop = options.models[0].prop;
                                            model.valor = options.models[0].ddlZonaAlmacenDescripcionAlmacen.Descripcion;
                                            model.aux = options.models[0].ddlZonaAlmacenDescripcionAlmacen.IdAlmacen;
                                            model.idSup = options.models[0].idSup;

                                            return JSON.stringify(model);
                                        }
                                        else
                                            if (options.models[0].ddlZonaDescripcionTipoZona !== undefined || options.models[0].ddlZonaAlmacenDescripcionAlmacen !== undefined)
                                                return "";
                                            else
                                                return JSON.stringify(options.models[0]);

                                }
                            }
                        },
                        schema: {
                            model: {
                                id: "idProp",
                                fields: {
                                    'idProp': { type: "string" },
                                    'prop': { type: "string", editable: false },
                                    'valor': { type: "string" },
                                    'idSup': { type: "number" }
                                }
                            }
                        },
                        requestEnd: function (e) {
                            if (e.type == "update") {
                                var grid = $("#divPropZonas").data("kendoGrid");
                                grid.dataSource.read();
                                var gridAlm = $("#divListaZonas").data("kendoGrid");
                                gridAlm.dataSource.read();

                            }
                        },
                        //pagesize: 30
                    });
                }

                if ($("#divPropZonas").data("kendoGrid") !== undefined) {
                    $("#divPropZonas").data("kendoGrid").destroy();
                }

                $("#divPropZonas").kendoGrid({
                    dataSource: self.detalleZona,
                    editable: "inline",
                    resizable: true,
                    dataBound: function () {
                        $("#divPropZonas .k-header").height($("#divListaZonas .k-header").height());

                        var elementosOcultar = this.dataSource.data().filter(x => x.idProp === 'DescripcionTipoZona');
                        for (var i = 0; i < elementosOcultar.length; i++) {
                            var currentUid = elementosOcultar[i].uid;
                            var currentRow = this.table.find("tr[data-uid='" + currentUid + "']");
                            var editButton = $(currentRow).find(".k-grid-edit");
                            editButton.remove();
                        }
                    },
                    toolbar: [
                                          {
                                              template: "<label>" + window.app.idioma.t('_PROPIEDADES_DE') + "</label>"
                        }
                       
                        
                    ],
                    columns: [
                    {
                        title: window.app.idioma.t("PROPIEDADES"),
                        field: 'prop',
                        width: "50px"
                    },
                    {
                        title: window.app.idioma.t("VALOR"),
                        field: 'valor',
                        editor: zonaEditor,
                        width: "70px",
                        template: '#=valor != null ? valor: ""#'
                    },
                    { command: [{ name: "edit", text: { edit: "", update: window.app.idioma.t("ACTUALIZAR"), cancel: window.app.idioma.t("CANCELAR") } }], title: "&nbsp;", width: "30px" },
                    ]
                });


                function zonaEditor(container, options) {
                    if (options.model.idProp == "DescripcionTipoZona") {
                        $("<input id='ddlZona" + options.model.idProp + "' name='ddlZona" + options.model.idProp + "'/>")
                            .appendTo(container)
                            .kendoDropDownList({
                                dataTextField: "Descripcion",
                                dataValueField: "IdTipoZona",
                                dataSource: {
                                    type: "json",
                                    transport: {
                                        read: "../api/ObtenerTipoZona"
                                    }
                                },
                                dataBound: function (e) {
                                    var index = 0;
                                    for (var i = 0; i < e.sender.dataSource.data().length ; i++)
                                        if (e.sender.dataSource.data()[i].Descripcion == options.model.valor)
                                            index = e.sender.dataSource.data()[i].IdTipoZona;

                                    e.sender.value(index);
                                }
                            });
                    }
                    else
                        if (options.model.idProp == "DescripcionAlmacen") {
                            $("<input id='ddlZonaAlmacen" + options.model.idProp + "' name='ddlZonaAlmacen" + options.model.idProp + "'/>")
                                .appendTo(container)
                                .kendoDropDownList({
                                    dataTextField: "Descripcion",
                                    dataValueField: "IdAlmacen",
                                    dataSource: {
                                        type: "json",
                                        transport: {
                                            read: "../api/ObtenerAlmacenesUbicacion"
                                        }
                                    },
                                    dataBound: function (e) {
                                        var index = 0;
                                        for (var i = 0; i < e.sender.dataSource.data().length ; i++)
                                            if (e.sender.dataSource.data()[i].Descripcion == options.model.valor)
                                                index = e.sender.dataSource.data()[i].IdAlmacen;

                                        e.sender.value(index);
                                    }
                                });
                        }
                        else {
                            $('<input id="txtZona' + options.model.idProp + '" type="text" class="k-textbox" value="' + options.model.valor + '"  name="valor" data-type="string" data-bind="valor"/>')
                                  .appendTo(container)


                        }

                }





                if (selectedItem == null)
                    self.ubicaciones = new kendo.data.DataSource();
                else
                    self.ubicaciones = new kendo.data.DataSource({
                        batch: true,
                        async: false,
                        transport: {
                            read: {
                                url: "../api/ObtenerUbicacionesDesdezona/" + parseInt(selectedItem.IdZona),
                                dataType: "json"
                            },
                            create: {
                                url: "../api/crearUbicacion",
                                dataType: "json",
                                type: "POST",
                                contentType: "application/json; charset=utf-8",
                                complete: function (e) {
                                    var response = e.responseJSON;
                                    if (response.Exception != null && response.Exception.Message.includes("inactiva")) {
                                        self.dialogoConfirm = new VistaDlgConfirm({
                                            titulo: window.app.idioma.t('REACTIVAR_UBICACION'),
                                            msg: window.app.idioma.t('UBICACION_EXISTE_INACTIVA'),
                                            funcion: function () {
                                                var activarUbicacionDS = new kendo.data.DataSource({
                                                    transport: {
                                                        read: {
                                                            url: function () {
                                                                return "../api/reactivarUbicacion/" + response.Data.IdUbicacion;
                                                            },
                                                            dataType: "json",
                                                            type: "PUT",
                                                            contentType: "application/json; charset=utf-8",
                                                        },                                                         
                                                    },
                                                    requestEnd: function (e) {
                                                        if (e.response && e.response.succeeded) {
                                                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('REACTIVADO'), 4000);
                                                            $("#divListaUbicaciones").data("kendoGrid").dataSource.read();
                                                        } else {
                                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACTUALIZAR_UBICACION'), 4000);
                                                        }
                                                    },
                                                    error: function (e) {
                                                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACTUALIZAR_UBICACION'), 4000);
                                                    }
                                                });

                                                // Ejecuta la reactivación
                                                activarUbicacionDS.read();
                                                Backbone.trigger('eventCierraDialogo');
                                            }, contexto: this
                                        });
                                    } else {
                                        if (response.Exception != null && response.Exception.Message.includes("existe")) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_EXISTE_UBICACION'), 4000);
                                        }
                                        else {
                                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('CREADO_CORRECTAMENTE'), 4000);
                                            $("#divListaUbicaciones").data("kendoGrid").dataSource.read();
                                        }                                        
                                    }
                                }
                            },
                            destroy: {
                                url: "../api/eliminarUbicacion",
                                dataType: "json",
                                type: "DELETE",
                                contentType: "application/json; charset=utf-8",
                            },
                            parameterMap: function (options, operation) {
                                if (operation !== "read" && options.models) {
                                    if (operation == "create") {

                                        var grid = $("#divListaZonas").data("kendoGrid");
                                        var selectedItem = grid.dataItem(grid.select());

                                        var gridAlm = $("#divListaAlmacenes").data("kendoGrid");
                                        var selectedItemAlm = gridAlm.dataItem(gridAlm.select());

                                        options.models[0].IdZona = selectedItem.IdZona;
                                        options.models[0].IdAlmacen = selectedItemAlm.IdAlmacen;
                                    }
                                    return JSON.stringify(options.models[0]);
                                }
                            }

                        },
                        sort: { field: "Nombre", dir: "asc" },
                        schema: {
                            model: {
                                id: "IdUbicacion",
                                fields: {
                                    'IdUbicacion': { type: "int" },
                                    'Nombre': {
                                        type: "string",
                                        editable: true,
                                        validation: {
                                            maxlength: function (input) {
                                                var cantMax = 25
                                                if (input.val()) {
                                                    if (input.val().length > cantMax) {
                                                        input.attr("data-maxlength-msg", window.app.idioma.t("CARACTERES_MAXIMOS") + ' ' + cantMax);
                                                        return false;
                                                    }
                                                }
                                                return true;
                                            },
                                            validCharacters: function (input) {
                                                if (input.is("[name='Nombre']")) {
                                                    // Expresión regular para validar que solo se permitan letras, números, espacios, guion alto y guion bajo.
                                                    var regex = /^[a-zA-Z0-9 _-]+$/;
                                                    if (input.val()) {
                                                        if (!regex.test(input.val())) {
                                                            input.attr("data-validCharacters-msg", window.app.idioma.t("SIN_CARACTERES_ESPECIALES"));
                                                            return false;
                                                        }
                                                    }
                                                }
                                                return true;
                                            }
                                        }
                                    },
                                    'CanBeDeleted': { type: "bool" }
                                }
                            }
                        },
                        requestEnd: function (e) {
                            console.log(e);
                            if (e.type == "destroy") {
                                var grid = $("#divListaUbicaciones").data("kendoGrid");
                                grid.dataSource.read();
                            } else if (e.type == "create") {
                                if (e.response == null) {
                                    $("#divListaZonas").data("kendoGrid").select($("#divListaZonas").data("kendoGrid").select());
                                }
                               
                            }
                        },
                        //pagesize: 30
                    });


                if ($("#divListaUbicaciones").data("kendoGrid") !== undefined) {
                    $("#divListaUbicaciones").data("kendoGrid").destroy();
                }

                $("#divListaUbicaciones").kendoGrid({
                    dataSource: self.ubicaciones,
                    sortable: true,
                    resizable: true,
                    scrollable: true,
                    selectable: "row",
                    change: function (e) {
                        e.preventDefault();
                        self.seleccionaUbicacion(e, self);
                    },
                    culture: "es-ES",
                    filterable: false,
                    pageable: false,
                    toolbar: [
                        {
                            template: "<label>" + window.app.idioma.t('UBICACION') + "</label>"
                        },
                      {
                          name: "create", text: window.app.idioma.t("NUEVA_UBICACION")
                        },
                        {
                            template: "<button class='k-button k-AsociarUbicacion' onclick='asociarUbicaciones()'>" + window.app.idioma.t("ASOCIAR_DESASOCIAR_UBICACIONES") + "</button>"
                        }
                    ],
                    columns: [
                        {
                            field: 'IdUbicacion', hidden: true
                        },
                        {
                            title: window.app.idioma.t("NOMBRE"),
                            field: 'Nombre',
                            width: "50px",
                        },
                    {
                        command: [
                            //{ name: "destroy", text: "Eliminar" }
                            {
                                name: "Delete", text: window.app.idioma.t("ELIMINAR"),
                                click: function (e) {  //add a click event listener on the delete button
                                    e.preventDefault(); //prevent page scroll reset

                                    var grid = $("#divListaUbicaciones").data("kendoGrid");
                                    var tr = $(e.target).closest("tr"); //get the row for deletion
                                    var data = this.dataItem(tr); //get the row data so it can be referred later

                                    this.confirmacion = new VistaDlgConfirm({
                                        titulo: window.app.idioma.t('ELIMINAR_UBICACIÓN'), msg: window.app.idioma.t('DESEA_REALMENTE_ELIMINAR_ESTA'), funcion: function () {
                                            grid.dataSource.remove(data)  //prepare a "destroy" request
                                            grid.dataSource.sync()  //actually send the request (might be ommited if the autoSync option is enabled in the dataSource)
                                            Backbone.trigger('eventCierraDialogo');
                                        }, contexto: this
                                    });
                                }
                            }
                            , { name: "edit", text: { edit: "", update: window.app.idioma.t("CREAR"), cancel: window.app.idioma.t("CANCELAR") } }], title: "&nbsp;", width: "20px"
                    }],
                    editable: {
                        mode: "inline",
                        confirmation: window.app.idioma.t("CONFIRMACION_ELIMINAR_UBICACION")
                    },
                    dataBound: function () {
                        var grid = this;

                        if (grid.dataSource.data().length > 0) {
                            if (self.idUbicacionSaved === null) {
                                $.each(grid.tbody.find('tr'), function () {
                                    var model = grid.dataItem(this);
                                    $('[data-uid=' + model.uid + ']').addClass('k-state-selected');
                                    return false;
                                });

                            }
                            else {
                                $.each(grid.tbody.find('tr'), function () {
                                    var model = grid.dataItem(this);
                                    if (model.id == self.idUbicacionSaved) {
                                        $('[data-uid=' + model.uid + ']').addClass('k-state-selected');
                                    }
                                });

                                self.idUbicacionSaved = null;

                            }

                            $("#divListaUbicaciones tbody tr .k-grid-edit").each(function () {
                                $(this).remove();
                            });


                            $("#divListaUbicaciones tbody tr .k-grid-delete").each(function () {
                                var currentDataItem = $("#divListaUbicaciones").data("kendoGrid").dataItem($(this).closest("tr"));

                                if (currentDataItem.CanBeDeleted == false) {
                                    $(this).remove();
                                }
                            });
                        }

                        var grid = $("#divListaUbicaciones").data("kendoGrid");
                        grid.trigger("change");

                        asociarUbicaciones = self.asociarUbicaciones;
                    }
                });


            },
            seleccionaUbicacion: function (e, self) {

                var grid = $("#divListaUbicaciones").data("kendoGrid");
                var selectedItem = grid.dataItem(grid.select());

                if (selectedItem == null) {
                    self.detalleUbicacion = new kendo.data.DataSource();
                }
                else {
                    selectedItem.IdUbicacion = typeof selectedItem.IdUbicacion == 'undefined' ? 0 : selectedItem.IdUbicacion;
                    if (selectedItem.IdUbicacion != 0) {
                        self.detalleUbicacion = new kendo.data.DataSource({
                            batch: true,
                            async: false,
                            transport: {
                                read: {
                                    url: "../api/ObtenerDetalleUbicacion/" + parseInt(selectedItem.IdUbicacion),
                                    dataType: "json"
                                },
                                update: {
                                    url: "../api/editarUbicacion",
                                    dataType: "json",
                                    type: "PUT",
                                    contentType: "application/json; charset=utf-8",
                                },
                                parameterMap: function (options, operation) {
                                    if (operation !== "read" && options) {

                                        var model = {};
                                        model.idProp = options.models[0].idProp;
                                        model.prop = options.models[0].prop;
                                        model.idSup = options.models[0].idSup;

                                        var grid = $("#divListaUbicaciones").data("kendoGrid");

                                        var selectedItem = grid.dataItem(grid.select());

                                        self.idUbicacionSaved = selectedItem.IdUbicacion;

                                        return self.obtenerPropiedadEditadaUbicaciones(model,options);
                                    }
                                }
                            },
                            schema: {
                                model: {
                                    id: "idProp",
                                    fields: {
                                        'idProp': { type: "string" },
                                        'prop': { type: "string", editable: false },
                                        'valor': { type: "string" },
                                        'idSup': { type: "number" }
                                    }
                                }
                            },
                            requestEnd: function (e) {
                                if (e.type == "update") {
                                    var grid = $("#divPropUbicaciones").data("kendoGrid");
                                    grid.dataSource.read();
                                    var gridAlm = $("#divListaUbicaciones").data("kendoGrid");
                                    gridAlm.dataSource.read();

                                   

                                }
                            },
                            //pagesize: 30
                        });
                    }
                   
                }

                if ($("#divPropUbicaciones").data("kendoGrid") !== undefined) {
                    $("#divPropUbicaciones").data("kendoGrid").destroy();
                }

                $("#divPropUbicaciones").kendoGrid({
                    dataSource: self.detalleUbicacion,
                    editable: "inline",
                    resizable: true,
                    toolbar: [
                        {
                            template: "<label>" + window.app.idioma.t('_PROPIEDADES_DE_LA') + "</label>"
                        },
                        {
                            template: "<a id='btnEtiquetas' style='float:right' class='k-button' data-icon='barcode'>" + window.app.idioma.t('GENERAR_TODAS_ETIQUETAS') + "</a>"
                        },
                        {
                            template: "<a id='undo' style='float:right' class='k-button' data-icon='barcode'>" + window.app.idioma.t('GENERAR_ETIQUETA') + "</a>"
                        },
                    ],
                    columns: [
                    {
                        title: window.app.idioma.t("PROPIEDADES"),
                        field: 'prop',
                        width: "50px"
                    },
                    {
                        title: window.app.idioma.t("VALOR"),
                        field: 'valor',
                        editor: ubicacionEditor,
                        width: "70px",
                        template: '#= "' + window.app.idioma.t("OFFSET") + '" == prop ? valor + " min.": "' + window.app.idioma.t("VELOCIDADNOMINALREFERENCIA") +
                            '" == prop ? valor + "' + window.app.idioma.t("BOTELLA_POR_HORA") + '": "' + window.app.idioma.t("BUFFER") + '" == prop ? ( valor == "True" ? "' +
                            window.app.idioma.t("SI") + '" : "No") : valor #',
                    },
                    { command: [{ name: "edit", text: { edit: "", update: window.app.idioma.t("ACTUALIZAR"), cancel: window.app.idioma.t("CANCELAR") } }], title: "&nbsp;", width: "30px" },
                    { field: "idSup", hidden: true }
                    ],
                    dataBound: function () {
                        var grid = this;

                        var data = this._data;

                        //$("#divPropUbicaciones .k-header").height($("#divListaUbicaciones .k-header").height());
                        var gridUbicaciones = $("#divListaUbicaciones").data("kendoGrid");
                        var selectedItem = gridUbicaciones.dataItem(gridUbicaciones.select());
                        if (selectedItem != null && selectedItem != undefined) {
                            $("#undo").show();
                        } else {
                            $("#undo").hide();
                        }

                        var valueLine = null;
                        var valueTipoUbicacion = null;
                        for (var x = 0; x < data.length; x++) {
                            var dataItem = data[x];
                            if (dataItem) {
                                if (dataItem.id == 'DescLinea' && (dataItem.valor == null || typeof dataItem.valor == 'undefined')) {
                                    valueLine = 1;

                                }
                                if (dataItem.valor) {
                                    if (dataItem.id == 'DescripcionTipoUbicacion' && (dataItem.valor.toLowerCase() != window.app.idioma.t("CONSUMO").toLowerCase() && dataItem.valor.toLowerCase() != window.app.idioma.t("PRODUCCION_CONSUMO").toLowerCase())) {
                                        valueTipoUbicacion = 1;
                                        $('#divPropUbicaciones td:contains(' + window.app.idioma.t("DESCLINEA") + ')').closest('tr').hide();
                                        $('#divPropUbicaciones td:contains(' + window.app.idioma.t("ZONA") + ')').closest('tr').hide();
                                    } else if (dataItem.valor.toLowerCase() === window.app.idioma.t("CONSUMO").toLowerCase()) {
                                        $('#divPropUbicaciones td:contains(' + window.app.idioma.t("DESCLINEA") + ')').closest('tr').show();
                                        $('#divPropUbicaciones td:contains(' + window.app.idioma.t("ZONA") + ')').closest('tr').show();
                                    }
                                }
                              
                            }
                        }

                        var items = this.dataSource.view();
                        for (var i = 0; i < items.length; i++) {
                            if (valueTipoUbicacion == 1) {
                                if (items[i].idProp == "DescLinea" || items[i].idProp == "Offset" || items[i].idProp == "VelocidadNominalReferencia" ||
                                    items[i].idProp == "Buffer" || items[i].idProp == "Tag" || items[i].idProp == "Cantidad_Lote_Buffer" ) {
                                    var $row = $('#divPropUbicaciones').find("[data-uid='" + items[i].uid + "']");
                                    $row.hide();
                                }
                            }
                            
                        }

                        var elementosOcultar = this.dataSource.data().filter(x => x.idProp === 'Nombre' || x.idProp === 'IdUbicacion');
                        for (var i = 0; i < elementosOcultar.length; i++) {
                            var currentUid = elementosOcultar[i].uid;
                            var currentRow = this.table.find("tr[data-uid='" + currentUid + "']");
                            var editButton = $(currentRow).find(".k-grid-edit");
                            editButton.remove();
                        }
                    }
                });

                function ubicacionEditor(container, options) {

                    var grid = $("#divListaUbicaciones").data("kendoGrid");
                    var selectedUbi = grid.dataItem(grid.select());

                    switch (options.model.idProp) {
                        case "DescripcionZona":
                            self.ZonaDropDownList(options, container);
                            break;
                        case "DescripcionTipoUbicacion":
                            self.TipoUbicacionDropDownList(options, container);
                            break;
                        case "DescripcionPoliticaAlmacenamiento":
                            self.PoliticaAlmacenamientoDropDownList(options, container);
                            break;
                        case "DescripcionPoliticaLlenado":
                            self.PoliticaLlenadoDropDownList(options, container);
                            break;
                        case "DescripcionPoliticaVaciado":
                            self.PoliticaVaciadoDropDownList(options, container);
                            break;
                        case "DescripcionEstado":
                            self.EstadoDropDownList(options, container);
                            break;
                        case "DescripcionMaterial":
                            self.MaterialDropDownList(options, container);
                            break;
                        case "DescripcionClaseMaterial":
                            self.ClaseMaterialDropDownList(options, container);
                            break;
                        case "DescripcionTipoMaterial":
                            self.TipoMaterialDropDownList(options, container);
                            break;
                        case "DescripcionUnidadAlmacenamiento":
                            self.UnidadMedidaDropDownList(options, container);
                            break;
                        case "DescLinea":
                            self.LineaDropDownList(options, container);
                            break;
                        case "DescZonaAsociada":
                            self.ZonaAsociadaDropDownList(options, container);
                            break;
                        case "DescPDV":
                        case "DescPDVSEO":
                            self.PDVDropDownList(options, container);
                            break;
                        case "Cantidad_Lote_Buffer":
                        case "CapacidadMax":
                        case "StockActual":
                        case "StockMinimo":
                        case "StockCampo":
                        case "UmbralStockCero":
                        case "UmbralLoteCero":
                        case "Offset":
                        case "VelocidadNominalReferencia":
                            self.NumericTextBox(options,container);
                            break;
                        case "IdUbicacionLinkMes":
                            self.UbicacionLinkMesDropDownList(options, container);
                            break;
                        case "IdUbicacion":
                            self.UbicacionDropDownList(options, container);
                            break;
                        case "Buffer":
                            self.BufferDropDownList(options, container);
                            break;
                        case "Tag":
                            self.TagDropDownList(options, container);
                            break;
                        case "NombreGrupo":
                            self.GrupoDropDownList(options, container);
                            break;
                        default:
                            $('<input id="txtUbicacion' + options.model.idProp + '" type="text" class="k-textbox" value="' + options.model.valor + '"  name="valor" data-type="string" data-bind="valor"/>')
                                .appendTo(container);
                            break;
                    }

                }
            },
            BufferDropDownList: function (options, container) {
                $("<input id='ddlBuffer" + options.model.idProp + "' name='ddlBuffer" + options.model.idProp + "'/>")
                    .appendTo(container)
                    .kendoDropDownList({
                        dataTextField: "id",
                        dataValueField: "value",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataSource: {
                            data: [{ id: window.app.idioma.t('ITSN_BUFFER'), value: "false" }, { id: window.app.idioma.t('ITS_BUFFER'), value: "true" }]
                        }
                    });
            },
            TagDropDownList: function (options, container) {
                $("<input id='ddlTag" + options.model.idProp + "' name='ddlTag" + options.model.idProp + "'/>")
                    .appendTo(container)
                    .kendoDropDownList({
                        dataTextField: "CounterName",
                        dataValueField: "TagName",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataSource: {
                            type: "json",
                            transport: {
                                read: "../api/GetEquipmentCounterTags/" + selectedUbi.IdUbicacion.toString()
                            },
                            sort: { field: "TagId", dir: "asc" },
                        }
                    });
            },
            GrupoDropDownList: function (options, container) {
                $("<input id='" + options.model.idProp + "' name='" + options.model.idProp + "'/>")
                    .appendTo(container)
                    .kendoDropDownList({
                        dataTextField: "Nombre",
                        dataValueField: "IdGrupo",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataSource: {
                            type: "json",
                            transport: {
                                read: "../api/ObtenerGruposUbicaciones/" 
                            },
                            sort: { field: "Nombre", dir: "asc" },
                        },
                        dataBound: function (e) {
                            var index = 0;
                            for (var i = 0; i < e.sender.dataSource.data().length; i++)
                                if (e.sender.dataSource.data()[i].Nombre == options.model.valor)
                                    index = e.sender.dataSource.data()[i].IdGrupo;

                            e.sender.value(index);
                        }
                    });
            },
            ZonaDropDownList: function (options, container) {
                var gridAlm = $("#divListaAlmacenes").data("kendoGrid");
                var selectedItemAlm = gridAlm.dataItem(gridAlm.select());

                $("<input id='ddlUbicacionZona" + options.model.idProp + "' name='ddlUbicacionZona" + options.model.idProp + "'/>")
                    .appendTo(container)
                    .kendoDropDownList({
                        dataTextField: "Descripcion",
                        dataValueField: "IdZona",
                        dataSource: {
                            type: "json",
                            transport: {
                                read: "../api/ObtenerZonasDesdeAlmacen/" + parseInt(selectedItemAlm.IdAlmacen),
                            },
                            sort: { field: "Descripcion", dir: "asc" },
                        },
                        dataBound: function (e) {
                            var index = 0;
                            for (var i = 0; i < e.sender.dataSource.data().length; i++)
                                if (e.sender.dataSource.data()[i].Descripcion == options.model.valor)
                                    index = e.sender.dataSource.data()[i].IdZona;

                            e.sender.value(index);
                        }
                    });
            },
            TipoUbicacionDropDownList: function (options, container) {
                $("<input id='ddlUbicacionTipoUbicacion" + options.model.idProp + "' name='ddlUbicacionTipoUbicacion" + options.model.idProp + "'/>")
                    .appendTo(container)
                    .kendoDropDownList({
                        dataTextField: "Descripcion",
                        dataValueField: "IdTipoUbicacion",
                        dataSource: {
                            type: "json",
                            transport: {
                                read: "../api/ObtenerTiposUbicacion"
                            },
                            sort: { field: "Descripcion", dir: "asc" },
                        },
                        dataBound: function (e) {
                            var index = 0;
                            for (var i = 0; i < e.sender.dataSource.data().length; i++)
                                if (e.sender.dataSource.data()[i].Descripcion == options.model.valor)
                                    index = e.sender.dataSource.data()[i].IdTipoUbicacion;

                            e.sender.value(index);
                        }
                    });
            },
            PoliticaAlmacenamientoDropDownList: function (options, container) {
                $("<input id='ddlUbicacionPoliticaAlmacenamiento" + options.model.idProp + "' name='ddlUbicacionPoliticaAlmacenamiento" + options.model.idProp + "'/>")
                    .appendTo(container)
                    .kendoDropDownList({
                        dataTextField: "Descripcion",
                        dataValueField: "IdPoliticaAlmacenamiento",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataSource: {
                            type: "json",
                            transport: {
                                read: "../api/ObtenerPoliticasAlmacenamiento"
                            },
                            sort: { field: "Descripcion", dir: "asc" },
                        },
                        dataBound: function (e) {
                            var index = 0;
                            for (var i = 0; i < e.sender.dataSource.data().length; i++)
                                if (e.sender.dataSource.data()[i].Descripcion == options.model.valor)
                                    index = e.sender.dataSource.data()[i].IdPoliticaAlmacenamiento;

                            e.sender.value(index);
                        }
                    });
            },
            PoliticaLlenadoDropDownList: function (options, container) {
                $("<input id='ddlUbicacionPoliticaLlenado" + options.model.idProp + "' name='ddlUbicacionPoliticaLlenado" + options.model.idProp + "'/>")
                    .appendTo(container)
                    .kendoDropDownList({
                        dataTextField: "Descripcion",
                        dataValueField: "IdPoliticaLlenado",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataSource: {
                            type: "json",
                            transport: {
                                read: "../api/ObtenerPoliticasLlenado"
                            },
                            sort: { field: "Descripcion", dir: "asc" },
                        },
                        dataBound: function (e) {
                            var index = 0;
                            for (var i = 0; i < e.sender.dataSource.data().length; i++)
                                if (e.sender.dataSource.data()[i].Descripcion == options.model.valor)
                                    index = e.sender.dataSource.data()[i].IdPoliticaLlenado;

                            e.sender.value(index);
                        }
                    });
            },
            PoliticaVaciadoDropDownList: function (options, container) {
                $("<input id='ddlUbicacionPoliticaVaciado" + options.model.idProp + "' name='ddlUbicacionPoliticaVaciado" + options.model.idProp + "'/>")
                    .appendTo(container)
                    .kendoDropDownList({
                        dataTextField: "Descripcion",
                        dataValueField: "IdPoliticaVaciado",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataSource: {
                            type: "json",
                            transport: {
                                read: "../api/ObtenerPoliticasVaciado"
                            },
                            sort: { field: "Descripcion", dir: "asc" },
                        },
                        dataBound: function (e) {
                            var index = 0;
                            for (var i = 0; i < e.sender.dataSource.data().length; i++)
                                if (e.sender.dataSource.data()[i].Descripcion == options.model.valor)
                                    index = e.sender.dataSource.data()[i].IdPoliticaVaciado;

                            e.sender.value(index);
                        }
                    });
            },
            EstadoDropDownList: function (options, container) {
                $("<input id='ddlUbicacionEstado" + options.model.idProp + "' name='ddlUbicacionEstado" + options.model.idProp + "'/>")
                    .appendTo(container)
                    .kendoDropDownList({
                        dataTextField: "Descripcion",
                        dataValueField: "IdEstadoUbicacion",
                        dataSource: {
                            type: "json",
                            transport: {
                                read: "../api/ObtenerEstadosUbicacion"
                            },
                            sort: { field: "Descripcion", dir: "asc" },
                        },
                        dataBound: function (e) {
                            var index = 0;
                            for (var i = 0; i < e.sender.dataSource.data().length; i++)
                                if (e.sender.dataSource.data()[i].Descripcion == options.model.valor)
                                    index = e.sender.dataSource.data()[i].IdEstadoUbicacion;

                            e.sender.value(index);
                        }
                    });
            },
            MaterialDropDownList: function (options, container) {
                $("<input id='ddlUbicacionMaterial" + options.model.idProp + "' name='ddlUbicacionMaterial" + options.model.idProp + "'/>")
                    .appendTo(container)
                    .kendoDropDownList({
                        dataTextField: "Descripcion",
                        dataValueField: "IdMaterial",
                        dataSource: {
                            type: "json",
                            transport: {
                                read: "../api/ObtenerMaterialesUbicacion"
                            },
                            sort: { field: "Descripcion", dir: "asc" },
                        },
                        dataBound: function (e) {
                            var index = 0;
                            for (var i = 0; i < e.sender.dataSource.data().length; i++)
                                if (e.sender.dataSource.data()[i].Descripcion == options.model.valor)
                                    index = e.sender.dataSource.data()[i].IdMaterial;

                            e.sender.value(index);
                        }
                    });
            },
            ClaseMaterialDropDownList: function (options, container) {
                $("<input id='ddlUbicacionClaseMaterial" + options.model.idProp + "' name='ddlUbicacionClaseMaterial" + options.model.idProp + "'/>")
                    .appendTo(container)
                    .kendoDropDownList({
                        dataTextField: "Descripcion",
                        dataValueField: "IdClaseMaterial",
                        template: "#=IdClaseMaterial +' - '+Descripcion#",
                        dataSource: {
                            type: "json",
                            transport: {
                                read: "../api/ObtenerClasesMaterialUbicacion"
                            },
                            sort: { field: "Descripcion", dir: "asc" },
                        },
                        dataBound: function (e) {
                            var index = 0;
                            for (var i = 0; i < e.sender.dataSource.data().length; i++)
                                if (e.sender.dataSource.data()[i].Descripcion == options.model.valor)
                                    index = e.sender.dataSource.data()[i].IdClaseMaterial;

                            e.sender.value(index);
                        }
                    });
            },
            TipoMaterialDropDownList: function (options, container) {
                $("<input id='ddlUbicacionTipoMaterial" + options.model.idProp + "' name='ddlUbicacionTipoMaterial" + options.model.idProp + "'/>")
                    .appendTo(container)
                    .kendoDropDownList({
                        dataTextField: "Descripcion",
                        dataValueField: "IdTipoMaterial",
                        dataSource: {
                            type: "json",
                            transport: {
                                read: "../api/ObtenerTiposMaterial"
                            },
                            sort: { field: "Descripcion", dir: "asc" },
                        },
                        dataBound: function (e) {
                            var index = 0;
                            for (var i = 0; i < e.sender.dataSource.data().length; i++)
                                if (e.sender.dataSource.data()[i].Descripcion == options.model.valor)
                                    index = e.sender.dataSource.data()[i].IdTipoMaterial;

                            e.sender.value(index);
                        }
                    });
            },
            UnidadMedidaDropDownList: function (options, container) {
                $("<input id='ddlUOM" + options.model.idProp + "' name='ddlUOM" + options.model.idProp + "'/>")
                    .appendTo(container)
                    .kendoDropDownList({
                        dataTextField: "IdUdMedida",
                        dataValueField: "IdUdMedida",
                        dataSource: {
                            type: "json",
                            transport: {
                                read: "../api/ObtenerUnidadAlmacenamiento"
                            },
                            sort: { field: "Descripcion", dir: "asc" },
                        },
                        dataBound: function (e) {
                            var index = 0;
                            for (var i = 0; i < e.sender.dataSource.data().length; i++)
                                if (e.sender.dataSource.data()[i].IdUdMedida == options.model.valor)
                                    index = e.sender.dataSource.data()[i].IdUdMedida;

                            e.sender.value(index);
                        }
                    });
            },
            NumericTextBox: function (options, container) {
                $('<input id="numUbicacion' + options.model.idProp + '" value="' + options.model.valor + '"  name="valor"/>')
                    .appendTo(container)
                    .kendoNumericTextBox({
                        decimals: 2, culture: localStorage.getItem("idiomaSeleccionado"), format: "n2", min: 0
                    });
            },
            LineaDropDownList: function (options, container) {
                var index = 0;
                $("<input id='ddlLinea" + options.model.idProp + "' name='ddlLinea" + options.model.idProp + "'/>")
                    .appendTo(container)
                    .kendoDropDownList({
                        dataValueField: "id",
                        template: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                        valueTemplate: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                        autoBind: false,
                        dataSource: new kendo.data.DataSource({
                            data: window.app.planta.lineas,
                            sort: { field: "nombre", dir: "asc" }
                        }),
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataBound: function (e) {
                            for (var i = 0; i < e.sender.dataSource.data().length; i++)
                                if (options.model.valor != null) {
                                    if (options.model.valor.indexOf(e.sender.dataSource.data()[i].numLineaDescripcion) !== -1)
                                        index = e.sender.dataSource.data()[i].id;
                                }
                            if (index != 0) {
                                $('#divPropUbicaciones td:contains(' + window.app.idioma.t('ZONA') + ')').closest('tr').show();
                            } else {
                                $('#divPropUbicaciones td:contains(' + window.app.idioma.t('ZONA') + ')').closest('tr').hide();

                            }
                            e.sender.value(index);
                        }
                    });
            },
            ZonaAsociadaDropDownList: function (options, container) {
                var opcSel = $('#divPropUbicaciones td:contains(' + window.app.idioma.t('LINEA') + ')').next("td").text();
                var index = 0;
                var infoplanta = window.app.planta.lineas;
                var lineasel = 0;
                var lineacad = "";

                for (var i = 0; i < infoplanta.length; i++) {
                    lineacad = window.app.idioma.t('LINEA').replace('í', 'i') + " " + infoplanta[i].numLineaDescripcion + " - " + infoplanta[i].descripcion;

                    if (lineacad === opcSel) {
                        lineasel = i;
                        break;
                    }
                }

                $("<input id='ddlZonaAsociada" + options.model.idProp + "' name='ddlZonaAsociada" + options.model.idProp + "'/>")
                    .appendTo(container)
                    .kendoDropDownList({
                        dataTextField: "descripcion",
                        dataValueField: "id",
                        autoBind: false,
                        dataSource: new kendo.data.DataSource({
                            //data: infoplanta.filter(function (item) { return window.app.idioma.t('LINEA') + " " + item.numLineaDescripcion + " - " + item.descripcion + "" === opcSel; })[0].zonas,
                            data: infoplanta[lineasel].zonas,
                            sort: { field: "numZona", dir: "asc" }
                        }),
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataBound: function (e) {
                            for (var i = 0; i < e.sender.dataSource.data().length; i++)
                                if (options.model.valor != null) {
                                    if (e.sender.dataSource.data()[i].descripcion == options.model.valor)
                                        index = e.sender.dataSource.data()[i].id;
                                }

                            e.sender.value(index);
                        }
                    });
            },
            PDVDropDownList: function (options, container) {
                var index = 0;
                var valuesCalidad = options.model.idProp == "DescPDV" ? window.app.obtenerConfigCalidad() : window.app.obtenerConfigSEO();
                var _dataSource = options.model.idProp == "DescPDV" ? window.app.calidad.pdvs : window.app.SEO.pdvs;
                _dataSource.unshift({
                    ID: 0,
                    descript: "",
                    idParent: null,
                    idSITInherit: true,
                    idSITLoc: "",
                    name: "",
                    shortName: null
                });

                $("<input id='ddl" + options.model.idProp + "' name='ddl" + options.model.idProp + "'/>")
                    .appendTo(container)
                    .kendoDropDownList({
                        dataTextField: "name",
                        dataValueField: "ID",
                        autoBind: true,
                        dataSource: new kendo.data.DataSource({
                            data: _dataSource
                        }),
                        optionLabel: { name: window.app.idioma.t('SELECCIONE'), ID: "" },
                        dataBound: function (e) {
                            for (var i = 0; i < this.dataSource.data().length; i++) {
                                if (options.model.prop != "") {
                                    if (options.model.prop.indexOf(this.dataSource.data()[i].name) !== -1)
                                        index = this.dataSource.data()[i].ID;

                                }
                            };
                            this.value(index);
                        }
                    });

                var _dp = $("#ddl" + options.model.idProp).data("kendoDropDownList");
                for (var i = 0; i < _dp.dataSource.data().length; i++) {
                    if (_dp.dataSource.data()[i]["idParent"] != null) {
                        var _idParent = _dp.dataSource.data()[i]["idParent"];
                        var _array = $.grep(_dp.dataSource.data(), function (e) { return e.ID == _idParent; });
                        if (_array.length > 0) {
                            var _name = options.model.idProp == "DescPDV" ? window.app.calidad.pdvs[i]["name"] : window.app.SEO.pdvs[i]["name"];
                            _dp.dataSource.data()[i]["name"] = _array[0].name + " \\ " + _name;
                        }
                    }
                }

                _dp.setDataSource(_dp.dataSource);
            },
            UbicacionLinkMesDropDownList: function (options, container) {
                $('<textarea id="linkMes' + options.model.idProp + '" value="' + options.model.valor + '" type="text" name="valor" data-type="string" data-bind="valor" rows="4" cols="50"> </textarea>')
                    .appendTo(container)

                $('<input type="button" id="btnlinkMes' + options.model.idProp + '" value="' + window.app.idioma.t('ELEGIR_EQUIPO')+'"/>')
                    .appendTo(container)
                    .kendoButton();
            },
            UbicacionDropDownList: function (options,container) {
                $('<textarea id="' + options.model.idProp + '" value="' + options.model.valor + '" type="text" name="valor" data-type="string" data-bind="valor" rows="4" cols="50"> </textarea>')
                    .appendTo(container);
            },
            obtenerPropiedadEditadaUbicaciones: function (model, options) {
                let _item = options.models[0];

                model.valor = typeof _item.ddlUbicacionZonaDescripcionZona != 'undefined' ? _item.ddlUbicacionZonaDescripcionZona != null ? _item.ddlUbicacionZonaDescripcionZona.Descripcion : null:
                              typeof _item.ddlUbicacionTipoUbicacionDescripcionTipoUbicacion != 'undefined' ? _item.ddlUbicacionTipoUbicacionDescripcionTipoUbicacion != null ? _item.ddlUbicacionTipoUbicacionDescripcionTipoUbicacion.Descripcion : null:
                              typeof _item.ddlUbicacionPoliticaAlmacenamientoDescripcionPoliticaAlmacenamiento != 'undefined' ? _item.ddlUbicacionPoliticaAlmacenamientoDescripcionPoliticaAlmacenamiento != null ? _item.ddlUbicacionPoliticaAlmacenamientoDescripcionPoliticaAlmacenamiento.Descripcion : null :
                              typeof _item.ddlUbicacionPoliticaLlenadoDescripcionPoliticaLlenado != 'undefined' ? _item.ddlUbicacionPoliticaLlenadoDescripcionPoliticaLlenado != null ? _item.ddlUbicacionPoliticaLlenadoDescripcionPoliticaLlenado.Descripcion : null :
                              typeof _item.ddlUbicacionPoliticaVaciadoDescripcionPoliticaVaciado != 'undefined' ? _item.ddlUbicacionPoliticaVaciadoDescripcionPoliticaVaciado != null ? _item.ddlUbicacionPoliticaVaciadoDescripcionPoliticaVaciado.Descripcion : null :
                              typeof _item.ddlUbicacionEstadoDescripcionEstado != 'undefined' ? _item.ddlUbicacionEstadoDescripcionEstado != null ? _item.ddlUbicacionEstadoDescripcionEstado.Descripcion : null:
                              typeof _item.ddlUbicacionMaterialDescripcionMaterial != 'undefined' ? _item.ddlUbicacionMaterialDescripcionMaterial != null ? _item.ddlUbicacionMaterialDescripcionMaterial.Descripcion : null :
                              typeof _item.ddlUbicacionClaseMaterialDescripcionClaseMaterial != 'undefined' ? _item.ddlUbicacionClaseMaterialDescripcionClaseMaterial != null ? _item.ddlUbicacionClaseMaterialDescripcionClaseMaterial.Descripcion : null :
                              typeof _item.ddlUbicacionTipoMaterialDescripcionTipoMaterial != 'undefined' ? _item.ddlUbicacionTipoMaterialDescripcionTipoMaterial != null ? _item.ddlUbicacionTipoMaterialDescripcionTipoMaterial.Descripcion : null :
                              typeof _item.ddlUOMDescripcionUnidadAlmacenamiento != 'undefined' ? _item.ddlUOMDescripcionUnidadAlmacenamiento != null ? _item.ddlUOMDescripcionUnidadAlmacenamiento.IdUdMedida : null :
                              typeof _item.ddlLineaDescLinea != 'undefined' ? _item.ddlLineaDescLinea != null ? _item.ddlLineaDescLinea.id : null :
                              typeof _item.ddlZonaAsociadaDescZonaAsociada != 'undefined' ? _item.ddlZonaAsociadaDescZonaAsociada != null ? _item.ddlZonaAsociadaDescZonaAsociada.id : null :
                              typeof _item.ddlDescPDV != 'undefined' ? _item.ddlDescPDV != null ? _item.ddlDescPDV.ID : null :
                              typeof _item.ddlDescPDVSEO != 'undefined' ?  _item.ddlDescPDVSEO != null ? _item.ddlDescPDVSEO.ID : null :
                              typeof _item.ddlBufferBuffer != 'undefined' ? _item.ddlBufferBuffer != null ? _item.ddlBufferBuffer.value : null :
                              typeof _item.ddlTagTag != 'undefined' ? _item.ddlTagTag != null ? _item.ddlTagTag.TagName : null : 
                              typeof _item.NombreGrupo != 'undefined' ? _item.NombreGrupo != null ? _item.NombreGrupo.IdGrupo : null : "";

                model.aux = typeof _item.ddlUbicacionZonaDescripcionZona != 'undefined' ? _item.ddlUbicacionZonaDescripcionZona != null ?_item.ddlUbicacionZonaDescripcionZona.IdZona : null :
                            typeof _item.ddlUbicacionTipoUbicacionDescripcionTipoUbicacion != 'undefined' ? _item.ddlUbicacionTipoUbicacionDescripcionTipoUbicacion != null ?_item.ddlUbicacionTipoUbicacionDescripcionTipoUbicacion.IdTipoUbicacion : null : 
                            typeof _item.ddlUbicacionPoliticaAlmacenamientoDescripcionPoliticaAlmacenamiento != 'undefined' ? _item.ddlUbicacionPoliticaAlmacenamientoDescripcionPoliticaAlmacenamiento!= null ?_item.ddlUbicacionPoliticaAlmacenamientoDescripcionPoliticaAlmacenamiento.IdPoliticaAlmacenamiento : null : 
                            typeof _item.ddlUbicacionPoliticaLlenadoDescripcionPoliticaLlenado != 'undefined' ? _item.ddlUbicacionPoliticaLlenadoDescripcionPoliticaLlenado != null ?_item.ddlUbicacionPoliticaLlenadoDescripcionPoliticaLlenado.IdPoliticaLlenado : null :
                            typeof _item.ddlUbicacionPoliticaVaciadoDescripcionPoliticaVaciado != 'undefined' ? _item.ddlUbicacionPoliticaVaciadoDescripcionPoliticaVaciado != null ? _item.ddlUbicacionPoliticaVaciadoDescripcionPoliticaVaciado.IdPoliticaVaciado : null : 
                            typeof _item.ddlUbicacionEstadoDescripcionEstado != 'undefined' ? _item.ddlUbicacionEstadoDescripcionEstado != null ? _item.ddlUbicacionEstadoDescripcionEstado.IdEstadoUbicacion : null : 
                            typeof _item.ddlUbicacionMaterialDescripcionMaterial != 'undefined' ? _item.ddlUbicacionMaterialDescripcionMaterial != null ? _item.ddlUbicacionMaterialDescripcionMaterial.IdMaterial: null : 
                            typeof _item.ddlUbicacionClaseMaterialDescripcionClaseMaterial != 'undefined' ? _item.ddlUbicacionClaseMaterialDescripcionClaseMaterial != null ? _item.ddlUbicacionClaseMaterialDescripcionClaseMaterial.IdClaseMaterial: null :
                            typeof _item.ddlUbicacionTipoMaterialDescripcionTipoMaterial != 'undefined' ? _item.ddlUbicacionTipoMaterialDescripcionTipoMaterial != null ? _item.ddlUbicacionTipoMaterialDescripcionTipoMaterial.IdTipoMaterial : null :
                            typeof _item.ddlUOMDescripcionUnidadAlmacenamiento != 'undefined' ? _item.ddlUOMDescripcionUnidadAlmacenamiento != null ? _item.ddlUOMDescripcionUnidadAlmacenamiento.IdUdMedida : null:
                            typeof _item.ddlLineaDescLinea != 'undefined' ? _item.ddlLineaDescLinea != null ? _item.ddlLineaDescLinea.id : null:
                            typeof _item.ddlZonaAsociadaDescZonaAsociada != 'undefined' ? _item.ddlZonaAsociadaDescZonaAsociada != null ?_item.ddlZonaAsociadaDescZonaAsociada.id: null:
                            typeof _item.ddlDescPDV != 'undefined' ? _item.ddlDescPDV != null ? _item.ddlDescPDV.ID : null :
                            typeof _item.ddlDescPDVSEO != 'undefined' ? _item.ddlDescPDVSEO != null ? _item.ddlDescPDVSEO.ID : null :
                            typeof _item.ddlBufferBuffer != 'undefined' ? _item.ddlBufferBuffer != null ? _item.ddlBufferBuffer.id : null :
                            typeof _item.ddlTagTag != 'undefined' ? _item.ddlTagTag != null ? _item.ddlTagTag.CounterName : null :
                            typeof _item.NombreGrupo != 'undefined' ? _item.NombreGrupo != null ? _item.NombreGrupo.IdGrupo : null: "";

                if (model.valor == "") {
                    return JSON.stringify(_item);
                }
                    
                return JSON.stringify(model);
                                                                            
            },
            cargaArbol: function () {
                var grid = $("#divPropUbicaciones").data("kendoGrid");
                var text = $("#linkMesIdUbicacionLinkMes").val();
                var rowSel = 0;

                for (var i = 0; i < grid.dataSource.data().length; i++)
                    if (grid.dataSource.data()[i].valor = text)
                        rowSel = i;

                var vistaArbolSIT = new VistaArbol(grid.dataSource.data()[rowSel]);
            },
            eliminar: function () {
                $("#window").data("kendoWindow").destroy();
                this.remove();
            }
        });

        return vistaGestionUbicaciones;
    });