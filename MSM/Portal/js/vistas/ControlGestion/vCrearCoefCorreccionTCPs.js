define(['underscore', 'backbone', 'jquery', 'text!../../../ControlGestion/html/CrearCoefCorreccionTCPs.html', 'compartido/notificaciones'],
    function (_, Backbone, $, plantillaCoeficiente, Not) {
        var vistaCrearCoefCorreccionTCPs = Backbone.View.extend({
            tagName: 'div',
            id: 'divCrearCoefCorreccionTCPs',
            window: null,
            accion: null,
            dsCervezas: null,
            dsMateriales: null,
            template: _.template(plantillaCoeficiente),
            initialize: function ({ dataMateriales }) {
                var self = this;
                self.dsMateriales = dataMateriales;
                self.obtenerCervezas();

                self.render();
            },
            obtenerCervezas: function () {
                var self = this;
                let listaCervezas = null;

                $.ajax({
                    url: "../api/materiales/cervezasTipoSemielaborado/",
                    dataType: 'json',
                    async: false
                }).done(function (lista) {
                    listaCervezas = lista.filter(function (mosto) {
                        return mosto.Status === "APPROVED";
                    });
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_CERVEZAS_SEMIELABORADO'), 4000);
                    }
                });

                listaCervezas = listaCervezas.filter(function (item) {
                    return item.IdMaterial.length == 6;
                });

                self.dsCervezas = new kendo.data.DataSource({
                    data: listaCervezas,
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
                        width: "675px",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: [],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                self.dialog = $('#divCrearCoefCorreccionTCPs').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            configurarControles: function () {
                var self = this;

                self.$("#cmbCerveza").kendoDropDownList({
                    dataSource: self.dsCervezas,
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdMaterial",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                self.$("#cmbMaterialTCPs").kendoDropDownList({
                    dataSource: self.dsMateriales,
                    filter: "contains",
                    dataTextField: "DescripcionCompleta",
                    dataValueField: "IdMaterial",
                });

                $("#ntxtCoeficienteTCPs").kendoNumericTextBox({
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2,
                    format: 'n2',
                    value: 0
                });

                $("#btnAceptarCoeficienteTCPs").kendoButton({
                    click: function () { self.guardar(); }
                });

                $("#btnCancelarCoeficienteTCPs").kendoButton({
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

                kendo.ui.progress($("#CrearCoefCorreccionTCPs"), true);
                let coeficiente = $("#ntxtCoeficienteTCPs").data("kendoNumericTextBox").value() == null ? 0 : $("#ntxtCoeficienteTCPs").data("kendoNumericTextBox").value();

                var data = {};
                data.CodigoCerveza = $("#cmbCerveza").data("kendoDropDownList").value();
                data.CodigoMaterial = $("#cmbMaterialTCPs").data("kendoDropDownList").value();
                data.Coeficiente = coeficiente;

                $.ajax({
                    data: JSON.stringify(data),
                    type: "POST",
                    async: false,
                    url: "../api/controlGestion/coeficienteCorreccionTCPs",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        kendo.ui.progress($("#CrearCoefCorreccionTCPs"), false);
                        if (res) {
                            self.window.close();
                            self.eliminar();
                            self.dsMateriales.filter({});
                            $("#gridCoeficientesTCP").data('kendoGrid').dataSource.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('GUARDADO_CORRECTAMENTE'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AÑADIR_COEFICIENTE_CORRECCION'), 4000);
                        }
                        //Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        kendo.ui.progress($("#CrearCoefCorreccionTCPs"), false);
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

        return vistaCrearCoefCorreccionTCPs;
    });