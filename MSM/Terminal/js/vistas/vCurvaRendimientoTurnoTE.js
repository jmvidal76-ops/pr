define(['underscore', 'backbone', 'jquery', 'text!../../html/CurvaRendimientoTurnoTE.html', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaCurva, Not) {
        var vistaCurvaRendimientoTurnoTE = Backbone.View.extend({
            tagName: 'div',
            template: _.template(PlantillaCurva),
            fecha: new Date(),
            turnos: null,
            initialize: function () {
                var self = this;
                self.render();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                $("#dtpFecha").kendoDatePicker({
                    value: self.fecha,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    change: function () {
                        self.CambiarLineaFecha();
                    }
                });

                $("#cmbTurno").kendoDropDownList({
                    dataValueField: "tipo.id",
                    template: "#: window.app.idioma.t('TURNO' + tipo.id)#",
                    valueTemplate: "#: window.app.idioma.t('TURNO' + tipo.id)#",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#dtpFecha").data("kendoDatePicker").trigger("change");
            },
            CambiarLineaFecha: function () {
                var self = this;
                var idLinea = window.app.lineaSel.id;
                var hoyDate = new Date();
                var timestamp = $("#dtpFecha").data("kendoDatePicker").value().getTime() - hoyDate.getTimezoneOffset() * 60 * 1000;
                self.ObtenerTurnos(idLinea, timestamp);
            },
            ObtenerTurnos: function (idLinea, fecha) {
                var self = this;

                $.ajax({
                    url: "../api/turnosLineaDia/" + idLinea + "/" + fecha,
                    dataType: 'json',
                    async: false
                }).done(function (listaTurnos) {
                    self.turnos = listaTurnos;
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    }
                });

                var ds = new kendo.data.DataSource({
                    data: self.turnos,
                    sort: { field: "nombre", dir: "asc" }
                });

                var comboTurno = $("#cmbTurno").data('kendoDropDownList');
                comboTurno.setDataSource(ds);
                //comboTurno.select(0);
            },
            events: {
                'click #btnConsultar': 'MostrarGrafico',
            },
            MostrarGrafico: function () {
                var self = this;

                var turnoSel = self.turnos.filter(function (value, index) {
                    return value.tipo.id == parseInt($("#cmbTurno").data('kendoDropDownList').value());
                })[0].idTurno;

                var data = {};
                data.linea = window.app.lineaSel.id;
                data.turno = turnoSel;

                var datos = null;

                $.ajax({
                    data: JSON.stringify(data),
                    async: false,
                    type: "POST",
                    url: "../api/ObtenerDatosCurvaRendimiento",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        datos = res;
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_DATOS_RENDIMIENTO_TURNO'), 4000);
                        }
                    }
                });

                $("#graficaTurno").kendoChart({
                    chartArea: {
                        height: $("#center-pane").innerHeight() - $("#divCabeceraVista").innerHeight() - $("#divCurvaTurno").innerHeight() - 5
                    },
                    legend: {
                        position: "bottom"
                    },
                    seriesDefaults: {
                        type: "line"
                    },
                    series: datos.Series,
                    valueAxis: {
                        line: {
                            visible: false
                        },
                    },
                    categoryAxis: {
                        categories: datos.Horas,
                        majorGridLines: {
                            visible: false
                        },
                        labels: {
                            step: 6
                        },
                    },
                    tooltip: {
                        visible: true,
                        format: "{0}",
                        template: "#= series.name #: #= value #"
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
            },
        });

        return vistaCurvaRendimientoTurnoTE;
    });