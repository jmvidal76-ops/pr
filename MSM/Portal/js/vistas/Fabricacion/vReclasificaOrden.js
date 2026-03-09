define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/ReclasificaOrden.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaTransferencia, Not, VistaDlgConfirm) {
        var vistaTransferencia = Backbone.View.extend({
            tagName: 'div',
            id: 'divTransferencia',
            order: null,
            destinos: null,
            materiales: null,
            cantidadLote: null,
            maximo: null,
            template: _.template(plantillaTransferencia),
            initialize: function (orden) {
                var self = this;

                self.order = orden;

                $.ajax({
                    type: "GET",
                    url: "../api/obtenerMaterialCambio/" + self.order.pk,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.materiales = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                });

                $.ajax({
                    type: "GET",
                    url: "../api/obtenerCantidadLote/" + self.order.pk,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.cantidadLote = data.toString().replace('.',',');
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
                $("#txtMaterialActual").text(self.order.material.idMaterial + " - " + self.order.material.nombre);

                $("#txtCantidadDisponible").text(self.cantidadLote + " " + self.order.material.udMedida.toUpperCase());

                $("#txtCantidad").kendoNumericTextBox({
                    placeholder: window.app.idioma.t('INTRODUZCA_UN_VALOR'),
                    decimals: 5,
                    min: 1,
                    value: self.cantidadLote,
                    culture: "es-ES",
                    format: 'n2'
                });

                $("#ddlMaterial").kendoDropDownList({
                    dataTextField: "Description",
                    dataValueField: "ID",
                    dataSource: self.materiales,
                    dataBound: function () {
                        this.select(0);
                    }
                });

                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();

                self.window = $(self.el).kendoWindow(
                {
                    title: window.app.idioma.t('RECLASIFICAR_ORDEN'),
                    width: "650px",
                    height: "300px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: ["Close"],
                    close: function () {
                        self.window.destroy();
                        self.window = null;
                    },
                }).data("kendoWindow");

                self.dialog = $('#divTransferencia').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
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

                var mat = $("#ddlMaterial").data("kendoDropDownList").value();
                var cantidad = $("#txtCantidad").data("kendoNumericTextBox").value();

                if (mat > 0 || (cantidad && cantidad > 0)) {
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('RECLASIFICAR_ORDEN')
                        , msg: window.app.idioma.t('DESEA_REALMENTE_RECLASIFICAR_ESTA'), funcion: function () { self.creaReclas(); }, contexto: this
                    });

                }
                else {
                    $("#lbl").html("Seleccione algun valor para actualizar.".toUpperCase());
                    $("#lbl").show();
                    $("#lbl").css('color', 'red');
                }
            },
            creaReclas: function () {
                var self = this;

                var datos = {};
                datos.orden = self.order.pk;

                var mat = $("#ddlMaterial").data("kendoDropDownList").value();
                datos.material = mat;

                var cantidad = $("#txtCantidad").data("kendoNumericTextBox").value();
                datos.cantidad = cantidad;

                $.ajax({
                    type: "POST",
                    url: "../api/ReclasificarOrden/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    
                    $("#gridProduccion").data('kendoGrid').dataSource.read();

                    $.ajax({
                        type: "GET",
                        url: "../api/ObtenerDetalleOrdenFab/" + parseInt(self.order.pk),
                        dataType: 'json',
                        cache: true,
                        async: false
                    }).done(function (data) {
                        var order = data;

                        $.ajax({
                            type: "GET",
                            url: "../api/obtenerNombreLote/" + self.order.pk,
                            dataType: 'json',
                            cache: false,
                            async: false
                        }).done(function (data) {
                            $("#idMaterialOrden").html(data);
                        }).fail(function (xhr) {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                        });
                        

                        $("#nombreMaterialOrden").html(order.material.idMaterial + ' - ' + order.material.nombre);
                        $("#cantidadMaterialOrden").html(order.cantidad + '    ' + order.material.udMedida.toUpperCase());

                    }).fail(function (xhr) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_QUERY'), 4000);
                    });


                    self.window.close();
                    Backbone.trigger('eventCierraDialogo');
                    self.eliminar();
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('MOSTO_TRANSFERIDO_CORRECTAMENTE'), 4000);
                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_TRANSFIRIENDO_EL'), 4000);
                });
            }
        });

        return vistaTransferencia;
    });