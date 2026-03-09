define(['underscore', 'backbone', 'jquery', 'text!../../../ControlGestion/html/CrearCoefCorreccionHistoricoStocks.html', 'compartido/notificaciones', 'definiciones'],
    function (_, Backbone, $, plantillaCoeficiente, Not, definiciones) {
        var vistaCrearCoefCorreccionHistorico = Backbone.View.extend({
            tagName: 'div',
            id: 'divCrearCoefCorreccionHistorico',
            window: null,
            accion: null,
            procesosLote: definiciones.ProcesoLote(),
            dsMateriales: null,
            template: _.template(plantillaCoeficiente),
            initialize: function ({ dataMateriales }) {
                var self = this;
                self.dsMateriales = dataMateriales;

                self.render();
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

                self.dialog = $('#divCrearCoefCorreccionHistorico').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();
            },
            configurarControles: function () {
                var self = this;

                self.$("#cmbProceso").kendoDropDownList({
                    dataSource: [
                        { IdProceso: self.procesosLote.FAB, Descripcion: window.app.idioma.t('GENERAL_FABRICACION') },
                        { IdProceso: self.procesosLote.FER, Descripcion: window.app.idioma.t('FERMENTACION') },
                        { IdProceso: self.procesosLote.GUA, Descripcion: window.app.idioma.t('GUARDA') },
                        { IdProceso: self.procesosLote.TCP, Descripcion: window.app.idioma.t('PRELLENADO') },
                    ],
                    filter: "contains",
                    dataTextField: "Descripcion",
                    dataValueField: "IdProceso",
                });

                self.$("#cmbMaterialHistorico").kendoDropDownList({
                    dataSource: self.dsMateriales,
                    filter: "contains",
                    dataTextField: "DescripcionCompleta",
                    dataValueField: "IdMaterial",
                });

                $("#ntxtCoeficienteHistorico").kendoNumericTextBox({
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    decimals: 2,
                    format: 'n2',
                    value: 0
                });

                $("#btnAceptarCoeficienteHistorico").kendoButton({
                    click: function () { self.guardar(); }
                });

                $("#btnCancelarCoeficienteHistorico").kendoButton({
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

                kendo.ui.progress($("#CrearCoefCorreccionHistorico"), true);
                let coeficiente = $("#ntxtCoeficienteHistorico").data("kendoNumericTextBox").value() == null ? 0 : $("#ntxtCoeficienteHistorico").data("kendoNumericTextBox").value();

                var data = {};
                data.IdProceso = $("#cmbProceso").data("kendoDropDownList").value();
                data.CodigoMaterial = $("#cmbMaterialHistorico").data("kendoDropDownList").value();
                data.Coeficiente = coeficiente;

                $.ajax({
                    data: JSON.stringify(data),
                    type: "POST",
                    async: false,
                    url: "../api/controlGestion/coeficienteCorreccionHistoricoStocks",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        kendo.ui.progress($("#CrearCoefCorreccionHistorico"), false);
                        if (res) {
                            self.window.close();
                            self.eliminar();
                            self.dsMateriales.filter({});
                            $("#gridCoeficientesHistorico").data('kendoGrid').dataSource.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('GUARDADO_CORRECTAMENTE'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AÑADIR_COEFICIENTE_CORRECCION'), 4000);
                        }
                        //Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (err) {
                        kendo.ui.progress($("#CrearCoefCorreccionHistorico"), false);
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

        return vistaCrearCoefCorreccionHistorico;
    });