define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/InformeAnalisisSPI.html', 'compartido/notificaciones'], function (_, Backbone, $, PlantillaInformeAnalisisSPI, Not) {
    var VistaInformeAnalisisSPI = Backbone.View.extend({
        tagName: 'div',
        anhos: [],
        template: _.template(PlantillaInformeAnalisisSPI),
        initialize: function (options) {
            //Backbone.on('eventCierraDialogo', this.cancelar, this);
            this.anhos = [];
            var anyoActual = (new Date()).getFullYear();
            var anyoInicial = window.app.planta.anyoImplantacion;
            if ((anyoInicial + 1) < anyoActual) {
                anyoInicial = anyoActual - 2;
            }

            for (var i = anyoInicial; i < (anyoActual + 3) ; i++) {
                this.anhos[i - anyoInicial] = { id: i, nombre: i.toString() };
            }

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

            this.$("#cmbAnyo").kendoDropDownList({
                dataTextField: "nombre",
                dataValueField: "id",
                dataSource: this.anhos,
                //change: function () { self.cambiaAnyo(this, self); },
                optionLabel: window.app.idioma.t('SELECCIONE_ANYO')
            });

            this.$("#cmbSemana").kendoDropDownList({

                dataValueField: "numSemana",
                template: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                valueTemplate: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                optionLabel: window.app.idioma.t('SELECCIONE')
            });

            this.$("#txtNumSemanas").kendoNumericTextBox({
                format: "# semanas",
                step: 1,
                min: 1,
                max: 52
            });


            this.$("#btnAceptar").kendoButton();
            this.$("#btnCancelar").kendoButton();


            $(this.el).kendoWindow(
            {
                title: window.app.idioma.t('ANÁLISIS_SEMANAL_SPI'),
                width: "420px",
                height: "300px",
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
            'change #cmbAnyo': 'cambiaAnyo'
        },
        cambiaAnyo: function () {
            var anho = this.$("#cmbAnyo").data("kendoDropDownList").value();

            if (anho != "") {
                var ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/semanas/" + anho,
                            dataType: "json"
                        }
                    },
                    schema: {
                        model: {
                            id: "numSemana",
                            fields: {
                                year: { type: "number" },
                                numSemana: { type: "number" },
                                inicio: { type: "date" },
                                fin: { type: "date" }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                });

                var comboSemana = this.$("#cmbSemana").data('kendoDropDownList');
                comboSemana.setDataSource(ds);
                comboSemana.select(0);
            }

        },
        aceptar: function () {
            var self = this;

            self.linea = self.$("#cmbLinea").data("kendoDropDownList").value();
            self.anho = self.$("#cmbAnyo").data("kendoDropDownList").value();
            self.semana = self.$("#cmbSemana").data("kendoDropDownList").value();
            self.rangoSemanas = self.$("#txtNumSemanas").data("kendoNumericTextBox").value();

            if (self.linea == "" || self.anho == "" || self.semana == "" || self.rangoSemanas == null) {
                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('SELECCIONE_VALORES'), 6000);
            }
            else {

                if (self.semana != "") {

                    self.inicio = $("#cmbSemana").data("kendoDropDownList").dataSource.get(self.semana).inicio;


                }
                else Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_SELECCIONAR_UNA'), 4000);

                var form = document.createElement("form");
                form.setAttribute("method", "POST");
                form.setAttribute("action", "/Informes/INF-ENV-PROD_ANA-5.aspx");

                // setting form target to a window named 'formresult'
                form.setAttribute("target", "_blank");

                var lineaField = document.createElement("input");
                lineaField.setAttribute("name", "Linea");
                lineaField.setAttribute("value", self.linea);
                form.appendChild(lineaField);

                var anhoField = document.createElement("input");
                anhoField.setAttribute("name", "Anho");
                anhoField.setAttribute("value", self.anho);
                form.appendChild(anhoField);

                var SemanaField = document.createElement("input");
                SemanaField.setAttribute("name", "Semana");
                SemanaField.setAttribute("value", self.semana);
                form.appendChild(SemanaField);

                var rangoSemanaField = document.createElement("input");
                rangoSemanaField.setAttribute("name", "RangoSemanas");
                rangoSemanaField.setAttribute("value", self.rangoSemanas);
                form.appendChild(rangoSemanaField);

                var day = self.inicio.getDate();
                if (day < 10)
                    day = '0' + day;// yields
                var month = self.inicio.getMonth() + 1;    // yields month
                if (month < 10)
                    month = '0' + month;// yields
                var year = self.inicio.getFullYear();      // yields year

                var stringOutput = day + "/" + month + "/" + year;

                var InicioField = document.createElement("input");
                InicioField.setAttribute("name", "Inicio");
                InicioField.setAttribute("value", stringOutput);
                form.appendChild(InicioField);



                var idiomaField = document.createElement("input");
                idiomaField.setAttribute("name", "Idioma");
                idiomaField.setAttribute("value", localStorage.getItem("idiomaSeleccionado"));
                form.appendChild(idiomaField);

                document.body.appendChild(form);

                // creating the 'formresult' window with custom features prior to submitting the form
                //window.open('about:blank', 'formresult');

                form.submit();
                document.body.removeChild(form);
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
    return VistaInformeAnalisisSPI;
});