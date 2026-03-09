define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/InformeParosMaquina.html', 'compartido/notificaciones'], function (_, Backbone, $, PlantillaInformeParosMaquina,Not) {
    var VistaInformeParosMaquina = Backbone.View.extend({
        tagName: 'div',
        template: _.template(PlantillaInformeParosMaquina),
        initialize: function (options) {
            //Backbone.on('eventCierraDialogo', this.cancelar, this);
            this.options = options;
            this.render();
        },
        render: function () {

            $(this.el).html(this.template());
            $("#center-pane").prepend($(this.el));


            this.$("#cmbLinea").kendoDropDownList({
                //dataTextField: "nombre",
                dataValueField: "id",
                template: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                valueTemplate: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                dataSource: new kendo.data.DataSource({
                    data: window.app.planta.lineas,
                    sort: { field: "nombre", dir: "asc" }
                }),
                optionLabel: window.app.idioma.t('SELECCIONE')
            });

            this.$("#cmbMaquina").kendoDropDownList({
                dataTextField: "descripcion",
                dataValueField: "descripcion",
                dataSource: new kendo.data.DataSource({
                    sort: { field: "numMaquina", dir: "asc" }
                }),
                optionLabel: window.app.idioma.t('SELECCIONE')
            });

            this.$("#dpInicio").kendoDatePicker({
                value: new Date(),
                format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                culture: localStorage.getItem("idiomaSeleccionado")
            })

            this.$("#dpFin").kendoDatePicker({
                value: new Date(),
                format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                culture: localStorage.getItem("idiomaSeleccionado")
            })
            this.$("#cmbTurnosInicio").kendoDropDownList({

                dataValueField: "tipo.id",
                template: "#: window.app.idioma.t('TURNO'+tipo.id)#",
                valueTemplate: "#: window.app.idioma.t('TURNO'+tipo.id)#",
                optionLabel: window.app.idioma.t('SELECCIONE')
            });


            this.$("#cmbTurnosFin").kendoDropDownList({

                dataValueField: "tipo.id",
                template: "#: window.app.idioma.t('TURNO'+tipo.id)#",
                valueTemplate: "#: window.app.idioma.t('TURNO'+tipo.id)#",
                optionLabel: window.app.idioma.t('SELECCIONE')
            });

            this.$("#btnAceptar").kendoButton();
            this.$("#btnCancelar").kendoButton();


            $(this.el).kendoWindow(
            {
                title: window.app.idioma.t('PAROS_PROPIOS_POR_MAQUINA'),
                width: "480",
                height: "310px",
                modal: true,
                resizable: false,
                draggable: false,
                actions: []
            });
            this.dialog = $(this.el).data("kendoWindow");
            this.dialog.center();

        },
        events: {
            'click #btnAceptar': 'aceptar',
            'click #btnCancelar': 'cancelar',
            'change #cmbLinea': 'cambiaLinea',
            'change #dpInicio': 'cambiaLineaFechaIni',
            'change #dpFin': 'cambiaLineaFechaFin'
        },
        cambiaLinea: function () {
            var self = this;
            var cmbMaquina = self.$("#cmbMaquina").data("kendoDropDownList");
            var opcSel = this.$("#cmbLinea").data("kendoDropDownList").value();
            if (opcSel != "") {
                cmbMaquina.dataSource.data(self.$("#cmbLinea").data("kendoDropDownList").dataSource.get(opcSel).obtenerMaquinas);
                cmbMaquina.dataSource.sort({ field: "descripcion", dir: "asc" });
                cmbMaquina.select(0);
            }
            else {
                cmbMaquina.dataSource.data([]);
                cmbMaquina.refresh();
            }

            this.cambiaLineaFechaIni();
            this.cambiaLineaFechaFin();
        },
        cambiaLineaFechaIni: function () {
            var hoyDate = new Date();
            var idLinea = $("#cmbLinea").data("kendoDropDownList").value();
            var fecha = $("#dpInicio").data("kendoDatePicker").value();
            var dblFecha = null;
            if (fecha != null) {
                dblFecha = ($("#dpInicio").data("kendoDatePicker").value().getTime() - hoyDate.getTimezoneOffset() * 60 * 1000);
            }
            if (idLinea != "" && dblFecha) {
                var ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/turnosLineaDia/" + idLinea + "/" + dblFecha,
                            dataType: "json"
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    },
                    sort: { field: "nombre", dir: "asc" }

                });
                var comboTurnos = this.$("#cmbTurnosInicio").data('kendoDropDownList');
                comboTurnos.setDataSource(ds);
                comboTurnos.select(0);
            }

        },
        cambiaLineaFechaFin: function () {
            var hoyDate = new Date();
            var idLinea = $("#cmbLinea").data("kendoDropDownList").value();
            var fecha = $("#dpFin").data("kendoDatePicker").value();
            var dblFecha = null;
            if (fecha != null) {
                dblFecha = ($("#dpFin").data("kendoDatePicker").value().getTime() - hoyDate.getTimezoneOffset() * 60 * 1000);
            }
            if (idLinea != "" && dblFecha) {
                var ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/turnosLineaDia/" + idLinea + "/" + dblFecha,
                            dataType: "json"
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    },
                    sort: { field: "nombre", dir: "asc" }

                });
                var comboTurnos = this.$("#cmbTurnosFin").data('kendoDropDownList');
                comboTurnos.setDataSource(ds);
                comboTurnos.select(0);
            }

        },
        aceptar: function () {

            var self = this;

            self.linea = this.$("#cmbLinea").data("kendoDropDownList").value();
            self.turnoInicio = this.$("#cmbTurnosInicio").data("kendoDropDownList").text();
            self.turnoFin = this.$("#cmbTurnosFin").data("kendoDropDownList").text();
            self.dpinicio = $("#dpInicio").data("kendoDatePicker").value();
            self.dpfin = $("#dpFin").data("kendoDatePicker").value();
            self.maquina = this.$("#cmbMaquina").data("kendoDropDownList").value();

            if (self.linea == "" || self.turnoInicio == "Seleccione" || self.turnoFin == "Seleccione" || self.dpinicio == null || self.dpfin == null || self.maquina == "") {
                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('SELECCIONE_VALORES'), 6000);
            }
            else {

                var hoyDate = new Date();
                //Inicio
                $.ajax({
                    type: "GET",
                    url: "../api/turnocercano/" + this.$("#cmbLinea").data("kendoDropDownList").value() + "/" + ($("#dpInicio").data("kendoDatePicker").value().getTime() - hoyDate.getTimezoneOffset() * 60 * 1000) + "/" + $("#cmbTurnosInicio").data("kendoDropDownList").value() + "/1",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).success(function (data) {
                    self.Inicio = data.inicioUTC;
                    //Fin
                    $.ajax({
                        type: "GET",
                        url: "../api/turnocercano/" + self.$("#cmbLinea").data("kendoDropDownList").value() + "/" + ($("#dpFin").data("kendoDatePicker").value().getTime() - hoyDate.getTimezoneOffset() * 60 * 1000) + "/" + $("#cmbTurnosFin").data("kendoDropDownList").value() + "/0",
                        dataType: 'json',
                        cache: false,
                        async: false
                    }).success(function (data) {
                        self.Fin = data.finUTC;

                        //Llamada a reporting con linea, turnoInicio y turnoFin
                        //window.open("/Informes/INF-ENV-PROD_ANA-2.aspx?linea=" + self.linea + "&inicio=" + self.Inicio + "&fin=" + self.Fin)
                        var form = document.createElement("form");
                        form.setAttribute("method", "POST");
                        form.setAttribute("action", "/Informes/INF-ENV-PROD_ANA-3.aspx");

                        // setting form target to a window named 'formresult'
                        form.setAttribute("target", "_blank");

                        var lineaField = document.createElement("input");
                        lineaField.setAttribute("name", "Linea");
                        lineaField.setAttribute("value", self.linea);
                        form.appendChild(lineaField);

                        var maquinaField = document.createElement("input");
                        maquinaField.setAttribute("name", "Maquina");
                        maquinaField.setAttribute("value", self.maquina);
                        form.appendChild(maquinaField);

                        var turnoInicioField = document.createElement("input");
                        turnoInicioField.setAttribute("name", "turnoInicio");
                        turnoInicioField.setAttribute("value", self.turnoInicio);
                        form.appendChild(turnoInicioField);

                        var turnoFinField = document.createElement("input");
                        turnoFinField.setAttribute("name", "turnoFin");
                        turnoFinField.setAttribute("value", self.turnoFin);
                        form.appendChild(turnoFinField);

                        var fechaInicioField = document.createElement("input");
                        fechaInicioField.setAttribute("name", "FechaInicio");
                        fechaInicioField.setAttribute("value", self.Inicio);
                        form.appendChild(fechaInicioField);

                        var fechaFinField = document.createElement("input");
                        fechaFinField.setAttribute("name", "FechaFin");
                        fechaFinField.setAttribute("value", self.Fin);
                        form.appendChild(fechaFinField);

                        var idiomaField = document.createElement("input");
                        idiomaField.setAttribute("name", "Idioma");
                        idiomaField.setAttribute("value", localStorage.getItem("idiomaSeleccionado"));
                        form.appendChild(idiomaField);

                        document.body.appendChild(form);

                        // creating the 'formresult' window with custom features prior to submitting the form
                        //window.open('about:blank', 'formresult');

                        form.submit();
                        document.body.removeChild(form);
                    }).error(function (err, msg, ex) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                        //Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_PRODUCTOS_LINEA') + ':' + ex, 4000);
                    });


                }).error(function (err, msg, ex) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        alert(msg);
                    }
                });


            }


        },
        cancelar: function () {
            this.dialog.close();
            window.location.hash = "Inicio";
            //this.eliminar();
        },
        eliminar: function () {
            //Backbone.off('eventCierraDialogo');
            // same as this.$el.remove();
            this.remove();

            // unbind events that are
            // set on this view
            this.off();

            // remove all models bindings
            // made by this view
            if (this.model && this.model.off) { this.model.off(null, null, this); }
        },
        finProceso: function () {
            this.dialog.close();
            this.eliminar();
        }
    });
    return VistaInformeParosMaquina;
});
