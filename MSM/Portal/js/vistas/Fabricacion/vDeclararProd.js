define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/DeclararProd.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaDlgDeclararProd, Not, VistaDlgConfirm) {
        var vistaDeclararProd = Backbone.View.extend({
            tagName: 'div',
            id: 'divDeclararProd',
            datos: null,
            datosProd: null,
            idorden: null,
            window: null,
            uom:null,
            material: [],
            template: _.template(plantillaDlgDeclararProd),
            initialize: function (idorden) {
                var self = this;
                self.idorden = idorden;

                $.ajax({
                    type: "GET",
                    url: "../api/obtenerProducciones/" + parseInt(self.idorden.pk),
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.material = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                });


                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                this.$("#btnAceptar").kendoButton();
                this.$("#btnCancelar").kendoButton();

                $('#descBatch').text(self.idorden.id);


                $("#txtCantidad").kendoNumericTextBox({
                    spinners: false, decimals: 2, culture: "es-ES", format: "n2", min: 1, change: self.changeEquipo
                });

                $("#descMaterial").kendoDropDownList({
                    dataTextField: "Description",
                    dataValueField: "ID",
                    dataSource: self.material,
                    dataBound: function () {
                        this.select(0);
                        self.changeMat();
                    }
                });

                self.window = $(self.el).kendoWindow(
                {
                    title: window.app.idioma.t('PRODUCCIÓN_MATERIAL'),
                    width: "750px",
                    height: "280px",
                    modal: true,
                    resizable: false,
                    draggable: false,
                    actions: []
                }).data("kendoWindow");

                self.dialog = $('#divDeclararProd').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            events: {
                'click #btnAceptar': 'aceptar',
                'click #btnCancelar': 'cancelar',
                'change #descMaterial': 'changeMat'
            },
            changeMat: function () {
                var self = this;

                var mat = $("#descMaterial").data("kendoDropDownList").value();

                $.ajax({
                    type: "GET",
                    url: "../api/obtenerUOM/" + mat,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.uom = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                });

                $('#descUnidadMedida').text(self.uom.toUpperCase());

            },
            cancelar: function (e) {
                if (e) {
                    e.preventDefault();
                }
                this.dialog.close();
                this.eliminar();
            }, aceptar: function (e) {
                e.preventDefault();

                var self = this;
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('DECLARAR_PRODUCCION')
                    , msg: window.app.idioma.t('DESEA_REALMENTE_DECLARAR'), funcion: function () { self.confirmaProd(e); }, contexto: this
                });
            },
            confirmaProd: function (e) {


                var self = this;

                var cantidad = $("#txtCantidad").data("kendoNumericTextBox").value();
                var material = $("#descMaterial").data("kendoDropDownList").value();

                if (cantidad == "" || !cantidad)
                    $("#lblErrorCantidad").show();
                else {
                    $("#lblErrorCantidad").hide();
                    if (material === "" || !material)
                        $("#lblErrorMaterial").show();
                    else {
                        $("#lblErrorMaterial").hide();

                        self.datosProd = {};

                        self.datosProd.batch = self.idorden.id;
                        self.datosProd.cantidad = cantidad;
                        self.datosProd.material = material;

                        $.ajax({
                            type: "POST",
                            url: "../api/DeclararProduccion/",
                            dataType: 'json',
                            data: JSON.stringify(self.datosProd),
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            cache: false,
                            async: true,
                        }).done(function (res) {
                            $("#gridProduccion").data('kendoGrid').dataSource.read();
                            $("#gridProduccion").data('kendoGrid').refresh();
                            self.dialog.close();
                            self.eliminar();
                            Backbone.trigger('eventCierraDialogo');
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('DECLARACION_DE_PRODUCCIÓN'), 4000);
                        }).fail(function (err) {
                            Backbone.trigger('eventCierraDialogo');
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_DECLARAR_PROD'), 4000);
                        });
                    }
                }
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaDeclararProd;
    });