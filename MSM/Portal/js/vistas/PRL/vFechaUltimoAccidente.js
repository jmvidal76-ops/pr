define(['underscore', 'backbone', 'jquery', 'text!../../../PRL/html/FechaUltimoAccidente.html', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaFechaAccidente, Not) {
        var VistaFechaUltimoAccidente = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            fecha: new Date(),
            template: _.template(PlantillaFechaAccidente),
            initialize: function () {
                var self = this;
                self.render();
            },
            render: function () {
                var self = this;
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                this.$("#selectLinea").kendoDropDownList({
                    dataValueField: "id",
                    template: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    valueTemplate: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "numLinea", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    change: function () { self.seleccionaLinea(this); },
                });

                $("#dtpFechaAccidente").kendoDatePicker({
                    value: self.fecha,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });
            },
            events: {
                'click  #btnCambiar': 'cambiar'
            },
            seleccionaLinea: function (e) {
                var selectedText = $(e.element).data("kendoDropDownList").text();
                var linea = selectedText.substring(0, selectedText.indexOf('-')).trim();

                $.ajax({
                    type: "GET",
                    async: false,
                    url: "../api/FechaAccidente_Read/" + linea + "/",
                    dataType: 'json',
                    cache: false,
                    success: function (res) {
                        var datepicker = $("#dtpFechaAccidente").data("kendoDatePicker");
                        datepicker.value(new Date(res));
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_FECHA_ULTIMO_ACCIDENTE'), 4000);
                        }
                    }
                });
            },
            cambiar: function () {
                var self = this;

                var selectedText = self.$("#selectLinea").data("kendoDropDownList").text();
                var fecha = $("#dtpFechaAccidente").data("kendoDatePicker").value();

                if (selectedText === window.app.idioma.t('SELECCIONE')) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_LINEA'), 4000);
                    return;
                }

                if (fecha > new Date()) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDAR_FECHA_MENOR_IGUAL_ACTUAL'), 4000);
                    return;
                }

                var datos = {};
                var linea = selectedText.substring(0, selectedText.indexOf('-')).trim();
                datos.Parametro = linea + " - " + window.app.idioma.t('FECHA_ULTIMO_ACCIDENTE');
                datos.Valor = fecha.toLocaleDateString("es-ES");

                $.ajax({
                    type: "POST",
                    async: false,
                    url: "../api/FechaAccidente_Update/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    success: function (res) {
                        if (res) {
                            Not.crearNotificacion('success', window.app.idioma.t('INFO'), window.app.idioma.t('GUARDAR_FECHA'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_GUARDAR_FECHA'), 4000);
                        }
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_GUARDAR_FECHA'), 4000);
                        }
                    }
                });
            },
            eliminar: function () {
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            }
        });

        return VistaFechaUltimoAccidente;
    });