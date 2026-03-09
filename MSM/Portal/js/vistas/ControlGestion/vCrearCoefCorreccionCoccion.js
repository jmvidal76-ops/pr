define(['underscore', 'backbone', 'jquery', 'text!../../../ControlGestion/html/CrearCoefCorreccionCoccion.html', 'compartido/notificaciones'],
    function (_, Backbone, $, plantillaCoeficiente, Not) {
        var vistaCrearCoefCorreccionCoccion = Backbone.View.extend({
            tagName: 'div',
            id: 'divCrearCoefCorreccionCoccion',
            window: null,
            accion: null,
            dsMostos: null,
            dsMateriales: null,
            template: _.template(plantillaCoeficiente),
            initialize: function ({ dataMateriales }) {
                var self = this;
                self.dsMateriales = dataMateriales;
                self.obtenerMostos();
                
                self.render();
            },
            obtenerMostos: function () {
                var self = this;
                var listaMostos = null;

                $.ajax({
                    url: "../api/materiales/mostosTipoSemielaborado/",
                    dataType: 'json',
                    async: false
                }).done(function (lista) {
                    listaMostos = lista.filter(function (mosto) {
                        return mosto.Status === "APPROVED";
                    });
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_MOSTOS_SEMIELABORADO'), 4000);
                    }
                });

                listaMostos = listaMostos.filter(function (item) {
                    return item.IdMaterial.length == 6;
                });

                self.dsMostos = new kendo.data.DataSource({
                    data: listaMostos,
                });
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                self.configurarControles();

                self.window = $(self.el).kendoWindow(
                    {
                        title: window.app.idioma.t('AÑADIR_COEFICIENTE_CORRECCION'),
                        width: "670px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: [],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                self.dialog = $('#divCrearCoefCorreccionCoccion').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            configurarControles: function () {
                var self = this;

                self.$("#cmbMosto").kendoDropDownList({
                    dataSource: self.dsMostos,
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdMaterial",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                self.$("#cmbMaterialCoccion").kendoDropDownList({
                    dataSource: self.dsMateriales,
                    filter: "contains",
                    dataTextField: "DescripcionCompleta",
                    dataValueField: "IdMaterial",
                });

                $("#ntxtCoeficienteCoccion").kendoNumericTextBox({
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2,
                    format: 'n2',
                    value: 0
                });

                $("#btnAceptarCoeficienteCoccion").kendoButton({
                    click: function () { self.guardar(); }
                });

                $("#btnCancelarCoeficienteCoccion").kendoButton({
                    click: function () { self.cancelar(); }
                });
            },
            events: {
            },
            cancelar: function (e) {
                var self = this;

                if (e) {
                    e.preventDefault();
                }

                self.dsMateriales.filter({});
                this.window.close();
                this.eliminar();
            },
            guardar: function () {
                var self = this;

                kendo.ui.progress($("#CrearCoefCorreccionCoccion"), true);
                let coeficiente = $("#ntxtCoeficienteCoccion").data("kendoNumericTextBox").value() == null ? 0 : $("#ntxtCoeficienteCoccion").data("kendoNumericTextBox").value();

                var data = {};
                data.CodigoMosto = $("#cmbMosto").data("kendoDropDownList").value();
                data.CodigoMaterial = $("#cmbMaterialCoccion").data("kendoDropDownList").value();
                data.Coeficiente = coeficiente;
                
                $.ajax({
                    data: JSON.stringify(data),
                    type: "POST",
                    async: false,
                    url: "../api/controlGestion/coeficienteCorreccionCoccion",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        kendo.ui.progress($("#CrearCoefCorreccionCoccion"), false);
                        if (res) {
                            self.window.close();
                            self.eliminar();
                            self.dsMateriales.filter({});
                            $("#gridCoeficientesCoccion").data('kendoGrid').dataSource.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('GUARDADO_CORRECTAMENTE'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AÑADIR_COEFICIENTE_CORRECCION'), 4000);
                        }
                        //Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        kendo.ui.progress($("#CrearCoefCorreccionCoccion"), false);
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AÑADIR_COEFICIENTE_CORRECCION'), 4000);
                        }
                        //Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaCrearCoefCorreccionCoccion;
    });