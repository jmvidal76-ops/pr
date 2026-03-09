define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/NuevaTransferencia.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaTransferencia, Not, VistaDlgConfirm) {
        var vistaTransferencia = Backbone.View.extend({
            tagName: 'div',
            id: 'divTransferencia',
            order: null,
            datos: {},
            destinos: null,
            materiales: null,
            maximo: null,
            FEClassPK: null,
            GuClassPK: null,
            FERGUClassPK: null,
            template: _.template(plantillaTransferencia),
            initialize: function (orden) {
                var self = this;

                self.order = orden;

                $.ajax({
                    type: "GET",
                    url: "../api/obtenerMaterialesATransferir/" + self.order.pk,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.materiales = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                });

                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                $("#lblOrden").text(self.order.id);
                $("#lblTipo").text(self.order.tipoOrden.descripcion.toUpperCase());

                var height = "300px";
                var width = "750px";

                if (self.order.tipoOrden.id === "FE" || self.order.tipoOrden.id === "TR") {

                    height = "360px";
                    $("#divAreadestino").show();

                    $("#cmbAreaDestino").kendoDropDownList({
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataSource: [{ desc: "FERMENTACIÓN", id: "FE" }, { desc: "GUARDA", id: "GU" }],
                        dataTextField: "desc",
                        dataValueField: "id"
                    });
                }
                else
                    if (self.order.tipoOrden.id === "GU") {
                        height = "360px";
                        $("#divAreadestino").show();
                        $("#cmbAreaDestino").kendoDropDownList({
                            optionLabel: window.app.idioma.t('SELECCIONE'),
                            dataSource: [{ desc: "GUARDA", id: "GU" }, { desc: "FILTRACIÓN", id: "FL" }],
                            dataTextField: "desc",
                            dataValueField: "id"
                        });
                    }
                    else {
                        $("#divAreadestino").hide();
                        //var height = "300px";
                        //var width = "750px";

                        $("#cmbAreaDestino").kendoDropDownList({
                            optionLabel: window.app.idioma.t('SELECCIONE'),
                            dataTextField: "desc",
                            dataValueField: "id"
                        });
                    }

                if (self.order.tipoOrden.descripcion.toUpperCase() == "GUARDA") {
                    $("#txtMaterialFilt").html(self.order.material.idMaterial + " - " + self.order.material.nombre);
                    $("#divFiltracionMosto").show();
                    $("#divMaterialNormal").hide();
                }
                else {
                    $("#divFiltracionMosto").hide();
                    $("#divMaterialNormal").show();
                }

               $("#ddlMaterial").kendoDropDownList({
                    dataTextField: "Description",
                    dataValueField: "ID",
                    dataSource: self.materiales,
                    dataBound: function () {
                        this.select(0);
                        self.cambiaMaterial();
                    }
                });

               if (self.order.tipoOrden.id === "PR") {
                   height = "360px";
                   $("#startDateField").kendoDateTimePicker({
                       culture: localStorage.getItem("idiomaSeleccionado"),
                       value: new Date(),
                       format: "dd/MM/yyyy HH:mm:ss",
                   });

                   $("#endDateField").kendoDateTimePicker({
                       culture: localStorage.getItem("idiomaSeleccionado"),
                       value: new Date(),
                       format: "dd/MM/yyyy HH:mm:ss",
                   });

                   $("#prefilledDate").show();
               } else
                   $("#prefilledDate").hide();

                this.$("#btnAcept").kendoButton();
                this.$("#btnCancel").kendoButton();

                self.window = $(self.el).kendoWindow(
               {
                   title: window.app.idioma.t('CREACIÓN_DE_TRANSFERENCIA'),
                   width: width,
                   height: height,
                   modal: true,
                   resizable: false,
                   draggable: false,
                   actions: ["Close"],
                   close: function () {
                       self.window.destroy();
                       self.window = null;
                   },
               }).data("kendoWindow");

                //$(".Uom").html(self.maximo.split(" ")[1]);

                self.dialog = $('#divTransferencia').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            events: {
                'click #btnAcept': 'aceptar',
                'click #btnCancel': 'cancelar',
                'change #ddlMaterial': 'cambiaMaterial',
                'change #ddlDestinos': 'cambiaDestino',
                'change #cmbAreaDestino': 'cambiaMaterial'                
            },
            cambiaMaterial: function () {
                var self = this;

                var material = $("#ddlMaterial").data("kendoDropDownList").value();
                var txtMaterial = $("#ddlMaterial").data("kendoDropDownList").text();

                if ((self.order.tipoOrden.id.toUpperCase() === "FE" && txtMaterial.indexOf("LEVADURA") < 0) || self.order.tipoOrden.id.toUpperCase() === "GU") {
                    var area = $("#cmbAreaDestino").data("kendoDropDownList").value();
                    material = area;
                }

                if (material !== "") {
                    $.ajax({
                        type: "GET",
                        url: "../api/obtenerDestinoTransferencia/" + self.order.pk + "/" + material,
                        dataType: 'json',
                        cache: false,
                        async: false
                    }).done(function (data) {
                        self.destinos = data;
                    }).fail(function (xhr) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                    });
                }


                if (txtMaterial.indexOf("LEVADURA") < 0) {
                    $("#cmbAreaDestino").data("kendoDropDownList").enable(true);
                    var destino = $("#ddlDestinos").data("kendoDropDownList");
                    if (destino !== undefined)
                        destino.dataSource.data([]);

                    var cant = $("#txtCantidad").data("kendoNumericTextBox");
                    if (cant !== undefined)
                        cant.enable(true);

                }
                else {
                    $("#cmbAreaDestino").data("kendoDropDownList").enable(false);
                }

                material = $("#ddlMaterial").data("kendoDropDownList").value();

                $("#ddlDestinos").kendoDropDownList({
                    dataTextField: "Descripcion",
                    dataValueField: "PK",
                    dataSource: self.destinos,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                if (self.order.tipoOrden.id === "TR" && $("#ddlMaterial").data("kendoDropDownList").text().indexOf("LEVADURA") == -1)
                {
                    var destinationEquipment = self.order.equipo.split(" - ")[1];
                    var item = $("#ddlDestinos").data("kendoDropDownList").dataSource.data().find(function (element) { return element.Descripcion.indexOf(destinationEquipment) != -1; });
                    $("#ddlDestinos").data("kendoDropDownList").value(item.PK);
                }

                $("#txtCantidad").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    decimals: 5,
                    min: 0.01,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    format: "#.00 hl",
                });

                if ((self.order.tipoOrden.id === "FL") || (txtMaterial.indexOf("LEVADURA") >= 0 || txtMaterial.indexOf("BAGAZO") >= 0) || self.order.estadoActual.descripcion=="Consolidando datos") {
                    //$("#divCantidadDisponible").hide();
                    $("#lblCant").html(window.app.idioma.t('UD_MEDIDA') + ": ");

                    $.ajax({
                        type: "GET",
                        url: "../api/obtenerUOM/" + material,
                        dataType: 'json',
                        cache: false,
                        async: false
                    }).done(function (data) {
                        self.uom = data;
                        $("#txtCantidadDisponible").html(self.uom.toUpperCase());
                    }).fail(function (xhr) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                    });

                    if (self.order.tipoOrden.id === "TR") {
                        $("#lbl").html("Recuerde, que antes de realizar una transferencia de Levadura, debe realizar antes una transferencia al equipo de destino");
                        $("#lbl").show();
                        $("#btnAceptar").attr('disabled', true);
                        $("#lbl").css('color', 'red');
                    }
                }
                else {
                    //$("#divCantidadDisponible").show();                    
                    $("#lblCant").html(window.app.idioma.t('CANTIDAD_DISPONIBLE') + ": ");
                    $.ajax({
                        type: "GET",
                        url: "../api/obtenerMaximoLoteOrden/" + self.order.pk + "/" + material,
                        dataType: 'json',
                        cache: false,
                        async: false
                    }).done(function (data) {
                        self.maximo = data;
                        $("#txtCantidadDisponible").text(self.maximo.split(" ")[0]);
                    }).fail(function (xhr) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                    });

                    $("#txtCantidadDisponible").text(self.maximo)

                    var max = self.maximo.substring(0, self.maximo.indexOf(" "))

                    if (!max || max < 1) {
                        $("#lbl").html("No queda mosto que transferir.");
                        $("#lbl").show();
                        $("#btnAceptar").attr('disabled', true);
                        $("#lbl").css('color', 'red');

                        $("#txtCantidad").data("kendoNumericTextBox").enable(false);

                    }
                    else {
                        $("#txtCantidad").data("kendoNumericTextBox").maxValue = max;
                        $("#lbl").hide();
                        $("#btnAceptar").attr('disabled', false);
                        $("#txtCantidad").data("kendoNumericTextBox").enable(true);
                    }
                }
            },
            cambiaDestino: function () {
                var self = this;

                var equipo = $("#ddlDestinos").data("kendoDropDownList").text();

                if (equipo.indexOf("Orden actual") >= 0) {
                    $("#lbl").html("SE CREARÁ UNA NUEVA ORDEN DE GUARDA.".toUpperCase());
                    $("#lbl").show();
                    $("#lbl").css('color', 'green');
                    $("#txtCantidad").data("kendoNumericTextBox").enable(false);
                    var cantidad = $("#txtCantidadDisponible").text();
                    var pos = cantidad.indexOf(" ");
                    var stringSub = cantidad.substring(0, pos);
                    $("#txtCantidad").data("kendoNumericTextBox").value(stringSub);
                }
                else {
                    $("#txtCantidad").data("kendoNumericTextBox").enable(true);
                    $("#lbl").hide();
                    //$("#btnAceptar").attr('disabled', false);
                }

            },
            eliminar: function () {
                this.remove();
            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
            },
            aceptar: function (e) {
                e.preventDefault();
                var self = this;

                var txtMaterial = $("#ddlMaterial").data("kendoDropDownList").text();
                var pkEquipo = $("#ddlDestinos").data("kendoDropDownList").value();
                var material = $("#ddlMaterial").data("kendoDropDownList").value();
                var cantidad = $("#txtCantidad").data("kendoNumericTextBox").value();
                var max = 0;

                if ((self.order.tipoOrden.id === "FL") || (txtMaterial.indexOf("LEVADURA") >= 0 || txtMaterial.indexOf("BAGAZO") >= 0) || self.order.estadoActual.descripcion == "Consolidando datos") {
                    max = cantidad + 1;
                    self.maximo = max;
                }
                else
                    max = self.maximo.substring(0, self.maximo.indexOf(" "))

                if (pkEquipo < 1) {
                    $("#lbl").html("Elija un equipo de destino.".toUpperCase());
                    $("#lbl").show();
                    $("#lbl").css('color', 'red');
                }
                else
                    if (!cantidad || cantidad < 0 || cantidad > parseFloat(max.toString().replace(',','.'))) {
                        $("#lbl").html("Introduzca una cantidad valida.".toUpperCase());
                        $("#lbl").show();
                        $("#lbl").css('color', 'red');
                    }
                    else
                        if (self.order.tipoOrden.id === "TR" && $("#ddlDestinos").data("kendoDropDownList").text().indexOf("UNITANQUE") != -1)
                        {
                            if ($("#cmbAreaDestino").data("kendoDropDownList").value().indexOf("FE") == -1 && $("#cmbAreaDestino").data("kendoDropDownList").value().indexOf("GU") == -1)
                            {
                                $("#lbl").html(window.app.idioma.t('TYPEWOTOCREATE').toUpperCase());
                                $("#lbl").css('color', 'red');
                                $("#lbl").show();
                            }else
                                this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('CREAR_TRANSFERENCIA'), msg: window.app.idioma.t('DESEA_REALMENTE_CREAR_ESTA_TRANSFERENCIA'), funcion: function () { self.creaTransfer(); }, contexto: this });
                        }else
                            this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('CREAR_TRANSFERENCIA'), msg: window.app.idioma.t('DESEA_REALMENTE_CREAR_ESTA_TRANSFERENCIA'), funcion: function () { self.creaTransfer(); }, contexto: this });

            },
            eliminar: function () {
                this.remove();
            },
            creaTransfer: function () {
                var self = this;

                var txtMaterial = $("#ddlMaterial").data("kendoDropDownList").text();
                var _ordenDestino = $("#ddlDestinos").data("kendoDropDownList").text().split(" - ")[2];
                var _materialDestino = $("#ddlDestinos").data("kendoDropDownList").text().split(" - ")[3];
                self.datos = {};
                self.datos.orden = self.order.pk;

                var pkEquipo = $("#ddlDestinos").data("kendoDropDownList").value();
                self.datos.destino = pkEquipo;
                
                if (($("#ddlDestinos").data("kendoDropDownList").text().split(" - ")[0] != self.order.equipo.split(" - ")[1]) && self.order.tipoOrden.id === "TR" && txtMaterial.indexOf("LEVADURA") == -1)
                {
                    var decantingDestiantion = {};
                    decantingDestiantion.Equipment = $("#ddlDestinos").data("kendoDropDownList").text().split(" - ")[0];
                    decantingDestiantion.OrderID = self.order.id;
                    $.ajax({
                        type: "POST",
                        url: "../api/ChangeDecantingDestination/",
                        dataType: 'json',
                        data: JSON.stringify(decantingDestiantion),
                        contentType: "application/json; charset=utf-8",
                        cache: false,
                        async: false,
                    }).done(function (res) {
                        var aux = res;
                    }).fail(function () {                        
                    });
                }

                var cantidad = $("#txtCantidad").data("kendoNumericTextBox").value();
                self.datos.cantidad = cantidad;

                var opcion = $("#cmbAreaDestino").data("kendoDropDownList").value();
                self.datos.opcion = opcion;

                var material = $("#ddlMaterial").data("kendoDropDownList").value();
                self.datos.material = material;

                if (self.order.tipoOrden.id === "PR") {
                    var fechaInicio = $("#startDateField").val();
                    self.datos.fechaInicio = fechaInicio;

                    var fechaFin = $("#endDateField").val();
                    self.datos.fechaFin = fechaFin;
                }

                self.datos.type = self.order.tipoOrden.id;

                $.ajax({
                    type: "POST",
                    url: "../api/CrearTransferencia/",
                    dataType: 'json',
                    data: JSON.stringify(self.datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    self.window.close();
                    if (res) {
                        $("#gridTransferencias").data('kendoGrid').dataSource.read();
                        $("#gridProduccion").data('kendoGrid').dataSource.read();

                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('MOSTO_TRANSFERIDO_CORRECTAMENTE'), 4000);

                        if (self.order.tipoOrden.descripcion.toUpperCase() != "FILTRACIÓN" && txtMaterial.indexOf("LEVADURA") < 0 && txtMaterial.indexOf("BAGAZO") < 0)
                            if (self.maximo)
                                if (typeof self.maximo == "number") {
                                    if (parseFloat(self.maximo.toString().replace(',', '.')) <= cantidad) {
                                        $("#imgEstadoOrden").attr("src", "img/KOP_Azul.png");
                                        $("#txtEstadoProcCerrado").text("CONSOLIDANDO DATOS");
                                    }
                                }
                                else {
                                    var max = self.maximo.substring(0, self.maximo.indexOf(" "));
                                    if (parseFloat(max.toString().replace(',', '.')) <= cantidad) {
                                        $("#imgEstadoOrden").attr("src", "img/KOP_Azul.png");
                                        $("#txtEstadoProcCerrado").text("CONSOLIDANDO DATOS");
                                    }
                                }

                        //Cada transferencia se tiene que añadir como Proceso
                        var entryData = { OrderID: self.order.id, EntryName: "Transferencia", JobID: pkEquipo }
                        $.ajax({
                            type: "POST",
                            url: "../api/crearProceso/",
                            dataType: 'json',
                            data: JSON.stringify(entryData),
                            contentType: "application/json; charset=utf-8",
                            cache: false,
                            async: false,
                        }).done(function () {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PROCESO_CREADO_CORRECTAMENTE'), 4000);
                            Backbone.trigger('eventCierraDialogo');
                            self.eliminar();
                        }).fail(function () {
                            Backbone.trigger('eventCierraDialogo');
                            self.eliminar();
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_CREAR_EL_PROCESO'), 4000);
                        });
                    } else {
                        Backbone.trigger('eventCierraDialogo');
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_TRANSFIRIENDO_EL'), 4000);
                    }


                    $("#gridConsumo").data("kendoGrid").dataSource.read();

                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_TRANSFIRIENDO_EL'), 4000);
                });
            }
        });

        return vistaTransferencia;
    });