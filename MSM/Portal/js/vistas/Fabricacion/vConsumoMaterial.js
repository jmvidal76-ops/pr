define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/ConsumoMaterial.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaDlgDeclararProd, Not, VistaDlgConfirm) {
        var vistaDeclararProd = Backbone.View.extend({
            tagName: 'div',
            id: 'divDeclararProd',
            datos: null,
            idorden: 0,
            window: null,
            procs: null,
            tipoMaterial: null,
            materiales: null,
            uom: null,
            ViewDetallesOrden: null,
            equipos: [],
            template: _.template(plantillaDlgDeclararProd),
            initialize: function (idorden,detallesOrden) {

                var self = this;
                self.idorden = idorden;
                self.ViewDetallesOrden = detallesOrden;

                $.ajax({
                    type: "GET",
                    url: "../api/obtenerEquiposOrden/" + parseInt(self.idorden.pk),
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.procs = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                });

                $.ajax({
                    type: "GET",
                    url: "../api/obtenerTipoMaterial/" + parseInt(self.idorden.pk),
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.tipoMaterial = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                });
                this.render();
            },
            render: function () {

                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.window = $(self.el).kendoWindow(
                    {
                        title: window.app.idioma.t('CONSUMO_MATERIAL'),
                        width: "650px",
                        height: "450px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: []
                    }).data("kendoWindow");

                self.dialog = $('#divDeclararProd').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                $("#btnAceptarConsumo").kendoButton({
                    enable: false
                });
                $("#btnCancelarConsumo").kendoButton();

                $('#descUnidadMedida').text(self.idorden.material.udMedida.toUpperCase());
                $('#descBatch').text(self.idorden.id);


                $("#txtCantidad").kendoNumericTextBox({
                    spinners: false, decimals: 2, culture: "es-ES", format: "n2", min: 0, change: self.changeEquipo
                });

                $("#descTipoMaterial").kendoDropDownList({
                    dataTextField: "Description",
                    dataValueField: "ID",
                    dataSource: self.tipoMaterial,
                    dataBound: function () {
                        this.select(0);
                        self.cambiaTipoMaterial();
                    }
                });

                $("#cmbDestino").kendoDropDownList({
                    dataTextField: "Des_Equipo",
                    dataValueField: "ID_Equipo",
                    dataSource: self.procs,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });


                
            },
            events: {
                'click #btnAceptarConsumo': 'aceptar',
                'click #btnCancelarConsumo': 'cancelar',
                'change #cmbDestino': 'changeEquipo',
                'change #cmbOrigen': 'changeEquipo',
                'change #descTipoMaterial': 'cambiaTipoMaterial',
                'change #descMaterial': 'cambiaMaterial'
            },
            cambiaTipoMaterial: function () {
                var self = this;

                var tipo = $("#descTipoMaterial").data("kendoDropDownList").value();
                if (tipo !== "")
                {
                    $.ajax({
                        type: "GET",
                        url: "../api/obtenerClasesMaterialConsumos/" + tipo,
                        dataType: 'json',
                        cache: false,
                        async: false
                    }).done(function (data) {
                        self.materiales = data;
                        if (self.idorden.id.indexOf("FE") != -1)
                        {
                            if ($("#descTipoMaterial").data("kendoDropDownList").text() === "CERVEZA A ENVASAR")
                                self.materiales = $.grep(data, function (item) { return (item.Description.indexOf("CZA") != -1 && item.Description.indexOf("RECUP") != -1) });
                        }
                    }).fail(function (xhr) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                    });
                }


                $("#descMaterial").kendoDropDownList({
                    dataTextField: "Description",
                    dataValueField: "ID",
                    dataSource: self.materiales,
                    dataBound: function () {
                        this.select(0);
                        self.cambiaMaterial();
                    }
                });

            },
            cambiaMaterial:function(e){
                var self = this;

                var mat = $("#descMaterial").data("kendoDropDownList").value();

                $.ajax({
                    type: "GET",
                    url: "../api/obtenerEquiposConLote/" + mat,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.equipos = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                });

                $.ajax({
                    type: "GET",
                    url: "../api/obtenerUOM/" + mat,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.uom = data;
                    $("#descUnidadMedida").html(self.uom.toUpperCase());
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                });

                if (self.equipos.length === 0) {
                    $("#lblError").show();
                    if ($("#cmbOrigen").data("kendoDropDownList") !== undefined) {
                        var dropdownlist = $("#cmbOrigen").data("kendoDropDownList");
                        dropdownlist.wrapper.hide();
                    }
                    else {
                        $("#cmbOrigen").hide();
                    }
                }
                else {
                    $("#cmbOrigen").kendoDropDownList({
                        dataTextField: "Descripcion",
                        dataValueField: "LocPath",
                        dataSource: self.equipos,
                        optionLabel: window.app.idioma.t('SELECCIONE')
                    });

                    $("#lblError").hide();

                }
            },
            changeEquipo: function () {
                var self = this;
                var opcSelOri = $("#cmbOrigen option:selected").val();
                var opcSelDes = $("#cmbDestino option:selected").val();
                var cantidad = $("#txtCantidad").data("kendoNumericTextBox").value();

                if (opcSelOri !== "" && opcSelDes !== "" && cantidad > 0) 
                    $("#btnAceptarConsumo").data("kendoButton").enable(true);
                else
                    $("#btnAceptarConsumo").data("kendoButton").enable(false);

            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
            }, aceptar: function (e) {
                var self = this;
                e.preventDefault();

                self.dialogoConfirm = new VistaDlgConfirm({ titulo: window.app.idioma.t('DECLARAR_CONSUMO'), msg: window.app.idioma.t('DESEA_DECLARAR_ESTE'), funcion: function () { self.consume(); }, contexto: this });                
            }, consume: function () {
                var self = this;
                var opcSelOri = $("#cmbOrigen").data("kendoDropDownList").value();
                var opcSelDes = $("#cmbDestino").data("kendoDropDownList").value();
                var cantidad = $("#txtCantidad").data("kendoNumericTextBox").value()

                if (cantidad === "")
                    cantidad = 0;

                var datosProd = {};

                datosProd.batch = self.idorden.id;
                datosProd.cantidad = cantidad;
                //datosProd.material = material;
                datosProd.origen = opcSelOri;
                datosProd.destino = opcSelDes;

                $.ajax({
                    type: "POST",
                    url: "../api/ConsumoMaterial/",
                    dataType: 'json',
                    data: JSON.stringify(datosProd),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    $("#gridConsumo").data('kendoGrid').dataSource.read();
                    $("#gridConsumo").data('kendoGrid').refresh();
                    $("#gridProduccion").data('kendoGrid').dataSource.read();
                                        
                    if (res.numcode === 10)
                    {
                        self.ViewDetallesOrden.SetHeaderData();
                        $("#nombreMaterialOrden").html(self.ViewDetallesOrden.order.material.idMaterial + " - " + self.ViewDetallesOrden.order.material.nombre);
                        $("#idMaterialOrden").html(self.ViewDetallesOrden.order.loteMES);
                    }

                    if ($("#descMaterial").data("kendoDropDownList").text().toUpperCase().indexOf("LEVADURA") != -1)
                    {
                        var equipment = $.grep(self.equipos, function (item) { return (item.LocPath.indexOf(opcSelOri) != -1) }, false);
                        //Cada transferencia se tiene que añadir como Proceso
                        var entryData = { OrderID: self.idorden.id, EntryName: "Siembra Levadura", JobID: equipment[0].LocPK }
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
                    }

                    Backbone.trigger('eventCierraDialogo');
                    self.dialog.close();
                    self.eliminar();
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('DECLARACION_DE_CONSUMO'), 4000);

                }).fail(function (err) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_DECLARAR_PROD'), 4000);
                });
            },  
            eliminar: function () {
                this.remove();
            }
        });

        return vistaDeclararProd;
    });