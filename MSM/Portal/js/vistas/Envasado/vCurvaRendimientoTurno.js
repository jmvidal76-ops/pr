define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/CurvaRendimientoTurno.html', 'vistas/vDialogoConfirm', 'compartido/notificaciones', 'jszip'],
    function (_, Backbone, $, PlantillaCurva, VistaDlgConfirm, Not, JSZip) {
        var vistaCurvaRendimientoTurno = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaCurva),
            fecha: new Date(),
            turnos: null,
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                var splitter = $("#vertical").data("kendoSplitter");
                //splitter.bind("resize", self.resizeGrid);

                self.render();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                $("#selectLinea").kendoDropDownList({
                    dataValueField: "id",
                    valueTemplate: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    template: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "numLinea", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    change: function () {
                        self.CambiarLineaFecha();
                    }
                });

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
            },
            CambiarLineaFecha: function () {
                var self = this;

                if ($("#dtpFecha").data("kendoDatePicker").value() == null) return;

                var idLinea = $("#selectLinea").data("kendoDropDownList").value();
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
                var valorTurno = $("#cmbTurno").data('kendoDropDownList').value();

                if (valorTurno == '') {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR_TURNO'), 3000);
                    return;
                }

                var turnoSel = self.turnos.filter(function (value, index) {
                    return value.tipo.id == parseInt(valorTurno);
                })[0].idTurno;

                var data = {};
                data.linea = $("#selectLinea").data("kendoDropDownList").value();
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

                $("#grafica").kendoChart({
                    chartArea: {
                        height: $("#center-pane").innerHeight() - $("#divCabeceraVista").innerHeight() - $("#divFiltrosHeader").innerHeight()
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
            //resizeGrid: function () {
            //    var contenedorHeight = $("#center-pane").innerHeight();
            //    var cabeceraHeight = $("#divCabeceraVista").innerHeight();
            //    var filtrosHeight = $("#divFiltrosHeader").innerHeight();

            //    var gridElement = $("#gridAnaliticasO2"),
            //        dataArea = gridElement.find(".k-grid-content"),
            //        gridHeight = gridElement.innerHeight(),
            //        otherElements = gridElement.children().not(".k-grid-content"),
            //        otherElementsHeight = 0;
            //    otherElements.each(function () {
            //        otherElementsHeight += $(this).outerHeight();
            //    });
            //    dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            //}
        });

        return vistaCurvaRendimientoTurno;
    });