define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/CrearOrdenArranqueCambio.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaCrearArranqueCambio, Not, VistaDlgConfirm) {
        var vistaCrearArranqueCambio = Backbone.View.extend({
            tagName: 'div',
            id: 'divEditarArranqueCambio',
            window: null,
            tipo: null,
            accion: null,
            row: null,
            productosEntrantes: null,
            productosSalientes: null,
            productoAnterior: null,
            productoPosterior: null,
            tipoArranque: null,
            tituloWindow: null,
            todosProductos: null,
            mensaje: null,
            template: _.template(plantillaCrearArranqueCambio),
            initialize: function (accion, tipo, row) {
                var self = this;

                /*
                Accion
                 0 - Añadir
                 1 - Editar

                Tipo
                 0 - Arranque
                 1 - Cambio
                **/

                self.accion = accion;
                self.row = row;
                self.tipo = tipo;

                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template({ 'tipo': self.tipo }));

                $("#btnAceptar").kendoButton({
                    click: function () { self.confirmarEdicion(); }
                });
                $("#btnCancelar").kendoButton({
                    click: function () { self.CancelarFormulario(); }
                });

                $("#txtInicioReal").kendoDateTimePicker({
                    format: "dd/MM/yyyy HH:mm:ss",
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: new Date(),
                    change: function (e) { self.cambiaFecha(); }
                });

                $("#txtInicioReal").bind('input propertychange', function (e) {
                    if (e.currentTarget.value.length == $("#" + this.id).data("kendoDateTimePicker").options.format.length) {
                        self.cambiaFecha();
                    }
                });

                $(".numerico").kendoNumericTextBox({
                    spinners: true,
                    decimals: 0,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: "n0",
                    min: 0,
                    max: 99999
                });

                this.$("#cmbLineaAC").kendoDropDownList({
                    dataValueField: "id",
                    template: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                    valueTemplate: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "nombre", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbArranques").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "Id",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbProductoEntrante").kendoDropDownList({
                    template: "#=IdProducto # (#= id #)",
                    valueTemplate: "#=IdProducto # (#= id #)",
                    dataValueField: "id",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#cmbProductoSaliente").kendoDropDownList({
                    template: "#=IdProducto # (#= id #)",
                    valueTemplate: "#=IdProducto # (#= id #)",
                    dataValueField: "id",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                if (self.accion == 0) { //Añadir
                    self.mensaje = window.app.idioma.t('PREGUNTA_CREAR_ORDEN');
                    $("#txtTObjetivo1").data("kendoNumericTextBox").enable(false);
                    $("#txtTObjetivo2").data("kendoNumericTextBox").enable(false);
                    $("#txtTiempoPreactor").data("kendoNumericTextBox").enable(false);

                    if (self.tipo == 1) //Cambio
                        self.tituloWindow = window.app.idioma.t('TEXTO_CREAR_ORDEN_CAMBIO');
                    else
                        self.tituloWindow = window.app.idioma.t('TEXTO_CREAR_ORDEN_ARRANQUE');
                } else {
                    self.mensaje = window.app.idioma.t('PREGUNTAR_EDITAR_ORDEN');

                    if (self.tipo == 1) //Cambio
                        self.tituloWindow = window.app.idioma.t('TEXTO_EDITAR_ORDEN_CAMBIO');
                    else
                        self.tituloWindow = window.app.idioma.t('TEXTO_EDITAR_ORDEN_ARRANQUE');
                }

                self.window = $(self.el).kendoWindow({
                    title: self.tituloWindow,
                    width: "600px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: [],
                    close: function () {
                        self.window.destroy();
                        self.window = null;
                    },
                }).data("kendoWindow");

                self.dialog = $('#divEditarArranqueCambio').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                self.cambiaFecha();

                if (self.accion == "1") {
                    self.$("#cmbLineaAC").data("kendoDropDownList").value(self.row.IdLinea);
                    $("#txtInicioReal").data("kendoDateTimePicker").value(self.row.InicioReal);

                    self.obtenerTurno();
                    //self.cambiaFecha();

                    //for (i = 0; i < window.app.planta.lineas.length; i++) {
                    //    if (window.app.planta.lineas[i].numLinea == self.row.Linea)
                    //        $("#cmbLineaAC").data("kendoDropDownList").select(i + 1);
                    //}

                    //self.cambiaLinea();

                    if (self.tipo == "0") {
                        //if (self.tipoArranque !== null) {
                        //for (i = 0; i < self.tipoArranque.length; i++) {
                        //    if (self.tipoArranque[i].Descripcion == self.row.TipoArranque)
                        //        $("#cmbArranques").data("kendoDropDownList").select(i + 1);
                        //}
                        self.obtieneArranques();
                        $("#cmbArranques").data("kendoDropDownList").value(self.row.TipoArranque);
                        //self.cambiaArranque();
                        //}
                    }

                    $("#txtDuracionLlenadora").data("kendoNumericTextBox").value(self.row.MinutosFinal1);
                    $("#txtDuracionPaletizadora").data("kendoNumericTextBox").value(self.row.MinutosFinal2);

                    var datosProc = {};
                    datosProc.orden = self.row.Id;

                    $.ajax({
                        type: "POST",
                        url: "../api/obtenerOrdenesRelacionadas",
                        data: JSON.stringify(datosProc),
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        cache: false,
                        async: true,
                    }).success(function (data) {
                        var ordenes = new Array();
                        ordenes = data.split(';');

                        var productoEntrante = self.row.IDProductoEntrante + " - " + self.row.ProductoEntrante;
                        var ordenEntrante = "";

                        if (self.tipo == "0")
                            ordenEntrante = ordenes[0];
                        else
                            ordenEntrante = ordenes[1];

                        var indice = -1;

                        if (self.productosEntrantes !== null)
                            for (i = 0; i < self.productosEntrantes.length; i++) {
                                if (self.productosEntrantes[i].IdProducto.replace(/ /g, '') == productoEntrante.replace(/ /g, '') && self.productosEntrantes[i].id == ordenEntrante)
                                    indice = i + 1;
                            }

                        if (indice > -1) {
                            $("#cmbProductoEntrante").data("kendoDropDownList").dataSource.read();
                            $("#cmbProductoEntrante").data("kendoDropDownList").select(indice);
                        } else {
                            if (self.productosEntrantes == undefined || self.productosEntrantes == null)
                                self.productosEntrantes = [];

                            self.productosEntrantes.unshift({ IdProducto: productoEntrante, id: ordenEntrante });
                            $("#cmbProductoEntrante").data("kendoDropDownList").dataSource.add({ "IdProducto": productoEntrante, "id": ordenEntrante });
                            //$("#cmbProductoEntrante").data("kendoDropDownList").dataSource.read();
                            $("#cmbProductoEntrante").data("kendoDropDownList").select(1);
                        }

                        //if ($("#cmbProductoEntrante").data("kendoDropDownList").value() === "") {
                        //    self.productosEntrantes.unshift({ IdProducto: productoEntrante, id: ordenEntrante });
                        //    $("#cmbProductoEntrante").data("kendoDropDownList").dataSource.read();
                        //    $("#cmbProductoEntrante").data("kendoDropDownList").select(1);
                        //}

                        //if (self.tipo == "1" && ordenEntrante != ordenes[0])
                        //    self.cambiaProductoEntrante();
                        //else
                        //    self.obtenerTiemposObjetivos();

                        //$("#txtOrdenEntrante").html(self.row.IDProductoEntrante + " - " + self.row.ProductoEntrante + " ("+ ordenes[0]+")");
                        if (self.tipo == "1")
                            if (ordenes.length > 1) {
                                var productoSaliente = self.row.IDProductoSaliente + " - " + self.row.ProductoSaliente;
                                var ordenSaliente = ordenes[0];
                                indice = -1;
                                if (self.productosSalientes !== null)
                                    for (i = 0; i < self.productosSalientes.length; i++) {
                                        if (self.productosSalientes[i].IdProducto.replace(/ /g, '') == productoSaliente.replace(/ /g, '') && self.productosSalientes[i].id == ordenSaliente)
                                            indice = i + 1;
                                    }

                                if (indice > -1)
                                    $("#cmbProductoSaliente").data("kendoDropDownList").select(indice);
                                else {
                                    if (self.productosSalientes == undefined)
                                        self.productosSalientes = [];
                                    self.productosSalientes.unshift({ IdProducto: productoSaliente, id: ordenSaliente });
                                    $("#cmbProductoSaliente").data("kendoDropDownList").dataSource.add({ "IdProducto": productoSaliente, "id": ordenSaliente });
                                    //$("#cmbProductoSaliente").data("kendoDropDownList").dataSource.read();
                                    $("#cmbProductoSaliente").data("kendoDropDownList").select(1);
                                }

                                //if ($("#cmbProductoSaliente").data("kendoDropDownList").value() === "") {
                                //    self.productosSalientes.unshift({ IdProducto: productoSaliente, id: ordenSaliente });
                                //    $("#cmbProductoSaliente").data("kendoDropDownList").dataSource.read();
                                //    $("#cmbProductoSaliente").data("kendoDropDownList").select(1);
                                //}

                                //if (self.tipo != "1" && ordenEntrante == ordenSaliente)
                                //    self.obtenerTiemposObjetivos();
                                //self.cambiaddlProductoSaliente();
                            }
                        kendo.ui.progress($("#gridSeleccionCambios"), false);

                    }).error(function (err, msg, ex) {
                        kendo.ui.progress($("#gridSeleccionCambios"), false);
                    });

                    $("#txtTObjetivo1").data("kendoNumericTextBox").value(self.row.MinutosObjetivo1);
                    $("#txtTObjetivo2").data("kendoNumericTextBox").value(self.row.MinutosObjetivo2);
                    $("#txtTiempoPreactor").data("kendoNumericTextBox").value(self.row.TiempoPreactor);

                    if (self.row.block) {
                        $("#cmbLineaAC").data("kendoDropDownList").enable(false);
                        $("#cmbProductoEntrante").data("kendoDropDownList").enable(false);
                        $("#txtInicioReal").data("kendoDateTimePicker").enable(false);
                        $("#txtDuracionLlenadora").data("kendoNumericTextBox").enable(false);
                        $("#txtDuracionPaletizadora").data("kendoNumericTextBox").enable(false);
                    }
                }
            },
            events: {
                'change #cmbLineaAC': 'cambiaLinea',
                'change #cmbArranques': 'cambiaArranque',
                //'change #txtInicioReal': 'cambiaFecha',
                'change #cmbProductoEntrante': 'obtenerTiemposObjetivos',
                'change #cmbProductoSaliente': 'cambiaddlProductoSaliente'
            },
            cambiaLinea: function () {
                var self = this;

                self.obtenerTurno();
                self.obtieneProductoEntrante();
                if (self.tipo == "1")
                    self.obtieneProductoSaliente();
                self.obtenerTiemposObjetivos();
                if (self.tipo == "0")
                    self.obtieneArranques();
            },
            cambiaFecha: function (e) {
                var self = this;

                self.obtenerTurno();
                self.obtieneProductoEntrante();
                if (self.tipo == "1")
                    self.obtieneProductoSaliente();
            },
            cambiaArranque: function () {
                var self = this;
                self.obtenerTiemposObjetivos();
            },
            cambiaProductoEntrante: function () {
                var self = this;
                var productoEntItemSel = $("#cmbProductoEntrante").data("kendoDropDownList").dataItem();

                if (self.tipo == "1") {
                    self.productosSalientes = [];
                    for (i = 0; i < self.todosProductos.length; i++) {
                        if (self.todosProductos[i].IdProducto != productoEntItemSel.IdProducto || self.todosProductos[i].id != productoEntItemSel.id) {
                            self.productosSalientes.push(self.todosProductos[i])
                        }
                    }

                    $("#cmbProductoSaliente").data("kendoDropDownList").setDataSource(self.productosSalientes);
                }
                self.obtenerTiemposObjetivos();
            },
            //cambiaddlProductoEntrante: function () {
            //    var self = this;
            //    var productoEntItemSel = $("#cmbProductoEntrante").data("kendoDropDownList").dataItem();
            //    if (self.tipo == "1") {
            //        self.productosSalientes = [];
            //        for (i = 0; i < self.todosProductos.length; i++) {
            //            if (self.todosProductos[i].IdProducto != productoEntItemSel.IdProducto || self.todosProductos[i].id != productoEntItemSel.id) {
            //                self.productosSalientes.push(self.todosProductos[i])
            //            }
            //        }

            //        self.obtenerOrdenAnterior(productoEntItemSel.id);

            //        var index = -1;

            //        for (var i = 1; i < self.productosSalientes.length; i++)
            //            if (self.productosSalientes[i].id == self.productosSalientes[0].id)
            //                index = i;

            //        if (index > -1)
            //            self.productosSalientes.splice(index, 1)

            //        $("#cmbProductoSaliente").data("kendoDropDownList").setDataSource(self.productosSalientes);
            //        $("#cmbProductoSaliente").data("kendoDropDownList").select(1);
            //    }
            //    self.obtenerTiemposObjetivos();
            //},
            //cambiaProductoSaliente: function () {
            //    var self = this;
            //    var productoSalItemSel = $("#cmbProductoSaliente").data("kendoDropDownList").dataItem();
            //    if (self.tipo == "1") {
            //        self.productosEntrantes = [];
            //        for (i = 0; i < self.todosProductos.length; i++) {

            //            if (self.todosProductos[i].IdProducto != productoSalItemSel.IdProducto || self.todosProductos[i].id != productoSalItemSel.id) {
            //                self.productosEntrantes.push(self.todosProductos[i])
            //            }
            //        }

            //        $("#cmbProductoEntrante").data("kendoDropDownList").setDataSource(self.productosEntrantes);
            //    }
            //    self.obtenerTiemposObjetivos();
            //},
            cambiaddlProductoSaliente: function () {
                var self = this;
                var productoSalItemSel = $("#cmbProductoSaliente").data("kendoDropDownList").dataItem();
                if (self.tipo == "1") {
                    self.productosEntrantes = [];
                    for (i = 0; i < self.todosProductos.length; i++) {

                        if (self.todosProductos[i].IdProducto != productoSalItemSel.IdProducto || self.todosProductos[i].id != productoSalItemSel.id) {
                            self.productosEntrantes.push(self.todosProductos[i])
                        }
                    }

                    if (typeof productoSalItemSel.id !== 'undefined') {
                        self.obtenerOrdenPosterior(productoSalItemSel.id);

                        var index = -1;

                        for (var i = 1; i < self.productosEntrantes.length; i++)
                            if (self.productosEntrantes[i].id == self.productosEntrantes[0].id)
                                index = i;

                        if (index > -1)
                            self.productosEntrantes.splice(index, 1)

                        $("#cmbProductoEntrante").data("kendoDropDownList").setDataSource(self.productosEntrantes);
                        //$("#cmbProductoEntrante").data("kendoDropDownList").select(0);
                    }
                }

                if (typeof productoSalItemSel.id !== 'undefined') {
                    self.obtenerTiemposObjetivos();
                }
            },
            //obtenerOrdenAnterior: function (idOrden) {
            //    var self = this;

            //    var linea = $("#cmbLineaAC").data("kendoDropDownList").value();
            //    var datosProc = {};
            //    datosProc.orden = idOrden;
            //    datosProc.linea = linea != "" ? linea.split('.')[3] : "";
            //    if (linea != "") {
            //        $.ajax({
            //            type: "POST",
            //            url: "../api/obtenerOrdenAnterior",
            //            data: JSON.stringify(datosProc),
            //            dataType: 'json',
            //            contentType: "application/json; charset=utf-8",
            //            cache: false,
            //            async: false,
            //        }).success(function (data) {
            //            var ordenes = new Array();
            //            ordenes = data.split(';');

            //            var orden = ordenes[0];
            //            var producto = ordenes[1];

            //            self.productosSalientes.unshift({ IdProducto: producto, id: orden });
            //        });
            //    }
            //},
            obtenerOrdenPosterior: function (idOrden) {
                var self = this;

                var linea = $("#cmbLineaAC").data("kendoDropDownList").value();
                var datosProc = {};
                datosProc.orden = idOrden;
                datosProc.linea = linea != "" ? linea.split('.')[3] : "";
                if (linea != "") {
                    $.ajax({
                        type: "POST",
                        url: "../api/obtenerOrdenPosterior",
                        data: JSON.stringify(datosProc),
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        cache: false,
                        async: false,
                    }).success(function (data) {
                        var ordenes = new Array();
                        ordenes = data.split(';');

                        var orden = ordenes[0];
                        var producto = ordenes[1];

                        self.productosEntrantes.unshift({ IdProducto: producto, id: orden });
                    });
                }
            },
            obtenerTiemposObjetivos: function () {
                var self = this;

                var linea = $("#cmbLineaAC").data("kendoDropDownList").value();
                var productoEnt = $("#cmbProductoEntrante").data("kendoDropDownList").text();
                productoEnt = productoEnt.substring(0, productoEnt.indexOf('-')).trim();
                var productoSal = "";
                var tipoArranque = "";

                var info = {};
                info.linea = linea;
                info.producto = productoEnt;
                info.tipo = self.tipo;

                if (self.tipo == "1") {
                    productoSal = $("#cmbProductoSaliente").data("kendoDropDownList").text();
                    productoSal = productoSal.substring(0, productoSal.indexOf('-')).trim();
                    info.productoSal = productoSal;
                } else {
                    tipoArranque = $("#cmbArranques").data("kendoDropDownList").value();
                    info.tipoArranque = tipoArranque;
                }

                if (self.tipo == "0" && linea !== "" && productoEnt !== "" && tipoArranque !== "")
                    self.calculaTiempos(info);

                if (self.tipo == "1" && linea !== "" && productoEnt !== "" && productoSal !== "")
                    self.calculaTiempos(info);
            },
            calculaTiempos: function (info) {
                var self = this;

                $.ajax({
                    type: "POST",
                    url: "../api/obtenerTiemposObjetivosPreactor",
                    dataType: 'json',
                    data: JSON.stringify(info),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    cache: false,
                    async: true,
                }).success(function (data) {
                    var primerValor = data[0].split(';')[0];
                    var segundoValor = data[0].split(';')[1];

                    $("#txtTObjetivo1").data("kendoNumericTextBox").value(primerValor);
                    $("#txtTObjetivo2").data("kendoNumericTextBox").value(segundoValor);
                    $("#txtTiempoPreactor").data("kendoNumericTextBox").value(data[1]);

                }).error(function (err, msg, ex) {
                    var a = "";
                });
            },
            obtenerTurno: function () {
                var self = this;

                var lineaId = $("#cmbLineaAC").data("kendoDropDownList").value();
                var lineas = 0;

                for (i = 0; i < window.app.planta.lineas.length; i++) {
                    if (window.app.planta.lineas[i].id == lineaId) {
                        lineas = window.app.planta.lineas[i].numLinea;
                    }
                }

                var fechaValue = kendo.parseDate($("#txtInicioReal").val(), $("#txtInicioReal").data("kendoDateTimePicker").options.format);
                if (fechaValue) {
                    var fecha = fechaValue.getTime() / 1000;
                    //var fecha = $("#txtInicioReal").data("kendoDateTimePicker").value()

                    $.ajax({
                        type: "GET",
                        url: "../api/obtenerTurnoSegunFecha/" + parseInt(fecha) + "/" + parseInt(lineas),
                        dataType: 'json',
                        cache: false,
                        async: false
                    }).success(function (data) {
                        self.turnoAnt = $("#txtTurno").html();
                        self.turnoActual = ((data == "Turno no encontrado") ? self.turnoAnt : data);
                        $("#txtTurno").html(data);
                    }).error(function (err, msg, ex) {
                        var a = "";
                    });
                }
            },
            obtieneProductoEntrante: function () {
                var self = this;

                var linea = $("#cmbLineaAC").data("kendoDropDownList").value();
                if (linea !== "") {

                    pos = linea.lastIndexOf(".");
                    linea = linea.substring(pos + 1, linea.length);

                    //var fecha = new Date($("#txtInicioReal").data("kendoDateTimePicker").value()).getTime() / 1000;
                    var fechaValue = kendo.parseDate($("#txtInicioReal").val(), $("#txtInicioReal").data("kendoDateTimePicker").options.format);
                    if (fechaValue) {
                        var fecha = fechaValue.getTime() / 1000;

                        if (fecha !== "") {
                            $.ajax({
                                type: "GET",
                                url: "../api/obtenerOrdenesFinalizadas/" + fecha + "/" + linea,
                                dataType: 'json',
                                contentType: "application/json; charset=utf-8",
                                cache: false,
                                async: false,
                            }).success(function (data) {

                                self.todosProductos = data;
                                var arrayProductos = [];

                                if (self.accion == 0) {
                                    arrayProductos = self.todosProductos;
                                } else {
                                    for (var i = 0; i < data.length; i++) {
                                        if (self.row != null) {
                                            if (self.row.IDProductoSaliente !== data[i].IdProducto.split(" ")[0]) {
                                                arrayProductos.push(data[i]);
                                            }
                                        }
                                    }
                                }

                                if (arrayProductos.length > 0) {
                                    self.productosEntrantes = arrayProductos;
                                    $("#cmbProductoEntrante").data("kendoDropDownList").setDataSource(self.productosEntrantes);
                                }
                            }).error(function (err, msg, ex) {
                                var a = "";
                            });
                        }
                    }
                }
            },
            obtieneProductoSaliente: function () {
                var self = this;

                if (self.tipo == "1") {
                    var linea = $("#cmbLineaAC").data("kendoDropDownList").value();
                    if (linea !== "") {
                        linea = linea.substring(pos + 1, linea.length);
                        pos = linea.lastIndexOf(".");
                        var fechaValue = kendo.parseDate($("#txtInicioReal").val(), $("#txtInicioReal").data("kendoDateTimePicker").options.format);
                        if (fechaValue) {
                            var fecha = fechaValue.getTime() / 1000;
                            //var fecha = new Date($("#txtInicioReal").data("kendoDateTimePicker").value()).getTime() / 1000;
                            if (fecha !== "") {
                                $.ajax({
                                    type: "GET",
                                    url: "../api/obtenerOrdenesFinalizadas/" + fecha + "/" + linea,
                                    dataType: 'json',
                                    contentType: "application/json; charset=utf-8",
                                    cache: false,
                                    async: false,
                                }).success(function (data) {
                                    self.todosProductos = data;
                                    self.productosSalientes = data;
                                    $("#cmbProductoSaliente").data("kendoDropDownList").setDataSource(self.productosSalientes);
                                }).error(function (err, msg, ex) {
                                    var a = "";
                                });
                            }
                        }
                    }
                }
            },
            obtieneArranques: function () {
                var self = this

                var lineas = 0;
                var opcSel = this.$("#cmbLineaAC").data("kendoDropDownList").value();

                if (opcSel !== "") {
                    for (i = 0; i < window.app.planta.lineas.length; i++) {
                        if (window.app.planta.lineas[i].id == opcSel) {
                            lineas = window.app.planta.lineas[i].numLinea;
                        }
                    }

                    if (self.tipo == "0") {
                        $.ajax({
                            type: "GET",
                            url: "../api/obtenerTiposArranque/" + lineas,
                            dataType: 'json',
                            cache: false,
                            async: false
                        }).success(function (data) {
                            self.tipoArranque = data;
                            $("#cmbArranques").data("kendoDropDownList").setDataSource(data);
                        }).error(function (err, msg, ex) {
                            var a = "";
                        });
                    }
                }
            },
            CancelarFormulario: function () {
                this.window.close();
            },
            confirmarEdicion: function (e) {
                var self = this;

                var fecha = $("#txtInicioReal").data("kendoDateTimePicker").value();
                var duracionLlenadora = $("#txtDuracionLlenadora").data("kendoNumericTextBox").value();
                var duracionPaletizadora = $("#txtDuracionPaletizadora").data("kendoNumericTextBox").value();
                var productoEnt = $("#cmbProductoEntrante").data("kendoDropDownList").text();
                var linea = $("#cmbLineaAC").data("kendoDropDownList").value();

                if (self.tipo == 0) {
                    var tipoArranque = $("#cmbArranques").data("kendoDropDownList").value();

                    if (linea != "" && fecha !== "" && duracionLlenadora !== "" && duracionLlenadora !== null && (duracionPaletizadora !== "" && duracionPaletizadora !== null) && productoEnt !== "Seleccione" && tipoArranque !== "Seleccione") {
                        this.confirmacion = new VistaDlgConfirm({ titulo: self.tituloWindow, msg: self.mensaje, funcion: function () { self.editarValoresArranqueCambio(fecha, duracionLlenadora, duracionPaletizadora, productoEnt, linea); }, contexto: this });
                        $("#trError").hide();
                    } else {
                        $("#trError").show();
                        $("#lblError").html(window.app.idioma.t('RELLENE_TODOS_CAMPOS'));
                    }
                } else {
                    var productoSal = $("#cmbProductoSaliente").data("kendoDropDownList").text();

                    if (linea != "" && fecha !== "" && duracionLlenadora !== "" && duracionLlenadora !== null && duracionPaletizadora !== "" && duracionPaletizadora !== null && productoEnt !== "Seleccione" && productoSal !== "Seleccione") {
                        this.confirmacion = new VistaDlgConfirm({ titulo: self.tituloWindow, msg: self.mensaje, funcion: function () { self.editarValoresArranqueCambio(fecha, duracionLlenadora, duracionPaletizadora, productoEnt, linea); }, contexto: this });
                        $("#trError").hide();
                    } else {
                        $("#trError").show();
                        $("#lblError").html(window.app.idioma.t('RELLENE_TODOS_CAMPOS'));
                    }
                }
            },
            editarValoresArranqueCambio: function (fecha, duracionLlenadora, duracionPaletizadora, productoEnt, linea) {
                var self = this;

                var datosProc = {};
                datosProc.fecha = fecha
                datosProc.duracionLlenadora = duracionLlenadora;
                datosProc.duracionPaletizadora = duracionPaletizadora;
                datosProc.productoEnt = productoEnt;
                datosProc.tipo = self.tipo;
                datosProc.linea = linea;
                datosProc.toLlenadora = $("#txtTObjetivo1").data("kendoNumericTextBox").value();
                datosProc.toPaletizadora = $("#txtTObjetivo2").data("kendoNumericTextBox").value();
                datosProc.tiempoPreactor = $("#txtTiempoPreactor").data("kendoNumericTextBox").value();

                if (self.tipo == "1") {
                    datosProc.productoSal = $("#cmbProductoSaliente").data("kendoDropDownList").text();
                } else {
                    datosProc.tipoArranque = $("#cmbArranques").data("kendoDropDownList").value();
                }

                var url = "";
                if (self.accion == "0") {
                    var url = "../api/crearOrdenArranqueCambio/"
                } else {
                    var url = "../api/editarOrdenArranqueCambio/"
                    datosProc.idOrden = self.row.Id;
                }

                $.ajax({
                    type: "POST",
                    url: url,
                    dataType: 'json',
                    data: JSON.stringify(datosProc),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    cache: false,
                    async: false,
                }).done(function (res) {
                    Backbone.trigger('eventCierraDialogo');
                    self.window.close();
                    self.eliminar();

                    if (res.succeeded) {
                        if ($("#gridSeleccionArranque").data('kendoGrid') !== undefined)
                            $("#gridSeleccionArranque").data('kendoGrid').dataSource.read();

                        if ($("#gridSeleccionCambios").data('kendoGrid') !== undefined)
                            $("#gridSeleccionCambios").data('kendoGrid').dataSource.read();

                        if (self.accion == "0")
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('CREADA_ORDEN_CORRECTAMENTE'), 3000);
                        else
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('EDITADA_ORDEN_CORRECTAMENTE'), 3000);
                    } else
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), res.message, 2000);
                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EDITAR_ORDEN'), 2000);
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearArranqueCambio;
    });