define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/InformeParadasEficiencia.html', 'compartido/notificaciones'], function (_, Backbone, $, PlantillaInformeParadasEficiencia, Not) {
    var VistaInformeParadasEficiencia = Backbone.View.extend({
        tagName: 'div',
        template: _.template(PlantillaInformeParadasEficiencia),
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

            //this.$("#cmbCausa").kendoDropDownList({
            //    dataValueField: "id",
            //    template: "Causa #= id # - #=nombre #",
            //    valueTemplate: "Causa #= id # - #=nombre #",
            //    dataSource: new kendo.data.DataSource({
            //        data: window.app.reasonTree.Categorias,
            //        sort: { field: "id", dir: "asc" }
            //    }),
            //    optionLabel: window.app.idioma.t('SELECCIONE')
            //});

            this.$("#cmbMotivo").kendoDropDownList({
                dataTextField: "nombre",
                dataValueField: "id",
                dataSource: new kendo.data.DataSource({
                    data: window.app.reasonTree.Categorias[2].motivos,
                    sort: { field: "id", dir: "asc" }
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
                title: window.app.idioma.t('INFORME_PARADAS_EFICIENCIA'),
                width: "500",
                height: "320px",
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
            //'change #cmbCausa': 'cambiaMotivo',
            'change #cmbLinea': 'cambiaLinea',
            'change #dpInicio': 'cambiaLineaFechaIni',
            'change #dpFin': 'cambiaLineaFechaFin'
        },
        //cambiaMotivo: function () {
        //    var self = this;
        //    var cmbMotivo = self.$("#cmbMotivo").data("kendoDropDownList");
        //    var opcSel = this.$("#cmbCausa").data("kendoDropDownList").select();
        //    if (opcSel != "") {
        //        cmbMotivo.dataSource.data(window.app.reasonTree.Categorias[opcSel-1].motivos);
        //        cmbMotivo.dataSource.sort({ field: "nombre", dir: "asc" });
        //        cmbMotivo.select(0);
        //    }
        //    else {
        //        cmbMotivo.dataSource.data([]);
        //        cmbMotivo.refresh();
        //    }
        //},
        cambiaLinea: function () {
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
            //self.causa = this.$("#cmbCausa").data("kendoDropDownList").value();
            self.motivo = this.$("#cmbMotivo").data("kendoDropDownList").value();
            self.turnoInicio = this.$("#cmbTurnosInicio").data("kendoDropDownList").text();
            self.turnoFin = this.$("#cmbTurnosFin").data("kendoDropDownList").text();
            self.dpinicio = $("#dpInicio").data("kendoDatePicker").value();
            self.dpfin = $("#dpFin").data("kendoDatePicker").value();

            if (self.linea == "" || self.turnoInicio == "Seleccione" || self.turnoFin == "Seleccione" || self.dpinicio == null || self.dpfin == null || self.motivo == "" /*|| self.causa == ""*/) {
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

                        //Llamada a reporting con linea, causa, turnoInicio y turnoFin (Ademas de los textos de los turnos)
                        var form = document.createElement("form");
                        form.setAttribute("method", "POST");
                        form.setAttribute("action", "/Informes/INF-ENV-PROD_ANA-7.aspx");

                        // setting form target to a window named 'formresult'
                        form.setAttribute("target", "_blank");

                        var lineaField = document.createElement("input");
                        lineaField.setAttribute("name", "Linea");
                        lineaField.setAttribute("value", self.linea);
                        form.appendChild(lineaField);

                        //var maquinaField = document.createElement("input");
                        //maquinaField.setAttribute("name", "Causa");
                        //maquinaField.setAttribute("value", self.causa);
                        //form.appendChild(maquinaField);

                        var motivoField = document.createElement("input");
                        motivoField.setAttribute("name", "Motivo");
                        motivoField.setAttribute("value", self.motivo);
                        form.appendChild(motivoField);

                        var fechaInicioField = document.createElement("input");
                        fechaInicioField.setAttribute("name", "FechaInicio");
                        fechaInicioField.setAttribute("value", self.Inicio);
                        form.appendChild(fechaInicioField);

                        var fechaFinField = document.createElement("input");
                        fechaFinField.setAttribute("name", "FechaFin");
                        fechaFinField.setAttribute("value", self.Fin);
                        form.appendChild(fechaFinField);

                        var turnoInicioField = document.createElement("input");
                        turnoInicioField.setAttribute("name", "turnoInicio");
                        turnoInicioField.setAttribute("value", self.turnoInicio);
                        form.appendChild(turnoInicioField);

                        var turnoFinField = document.createElement("input");
                        turnoFinField.setAttribute("name", "turnoFin");
                        turnoFinField.setAttribute("value", self.turnoFin);
                        form.appendChild(turnoFinField);

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
                    //Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_PRODUCTOS_LINEA') + ':' + ex, 4000);
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
    return VistaInformeParadasEficiencia;
});
