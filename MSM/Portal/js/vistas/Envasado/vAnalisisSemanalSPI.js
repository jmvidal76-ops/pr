define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/AnalisisSemanalSPI.html', 'compartido/notificaciones'],
    function (_, Backbone, $, PlantillaAnalisisSemanalSPI, Not) {
        var AnalisisSPI = Backbone.View.extend({
            tagName: 'div',
            id: 'center-pane',
            anhos: [],
            results: null,
            template: _.template(PlantillaAnalisisSemanalSPI),
            turnoSel: null,
            arranques: null,
            inicio: null,
            anho: null,
            semana: null,
            rangoSemanas: null,
            idLineaSel: null,
            initialize: function () {
                this.anhos = [];
                var anyoActual = (new Date()).getFullYear();
                var anyoInicial = window.app.planta.anyoImplantacion;
                if ((anyoInicial + 1) < anyoActual) {
                    anyoInicial = anyoActual - 2;
                }

                for (var i = anyoInicial; i < (anyoActual + 3) ; i++) {
                    this.anhos[i - anyoInicial] = { id: i, nombre: i.toString() };
                }

                var self = this;
                self.render();
            },
            render: function () {
                var self = this;
                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))

                this.$("#toolbar").kendoToolBar({
                    items: [
                        { template: "<label>" + window.app.idioma.t('LINEA') + "</label>" },
                        {
                            template: "<input id='cmbLinea' style='width: 210px;' />",
                            overflow: "never"
                        },
                        { template: "<label>" + window.app.idioma.t('AÑO') + "</label>" },
                        {
                            template: "<input id='cmbAnyo' style='width: 100px;'/>",
                            overflow: "never"
                        },
                        { template: "<label>" + window.app.idioma.t('SEMANA_') + "</label>" },
                        {
                            template: "<input id='cmbSemana' style='width: 220px;' />",
                            overflow: "never"
                        },
                        { template: "<label>" + window.app.idioma.t('GRÁFICOS_A') + "</label>" },
                        {
                            template: "<input id='txtNumSemanas' type='number' value='1' style='width: 100px;' />",
                            overflow: "never"
                        },
                        {
                            type: "button",
                            id: "btnConsultar",
                            text: window.app.idioma.t('FILTRAR'),
                            click: function () { self.generarAnalisisSPI(this, self); }
                        },
                        {
                            type: "button",
                            id: "btnExportarPDF",
                            text: window.app.idioma.t('GENERAR_INFORME'),
                            attributes: { style: "display:none;" },
                            click: function () { self.exportarPDF(); }
                        }
                    ]
                });

                this.$("#cmbLinea").kendoDropDownList({
                    template: window.app.idioma.t("LINEA") + " #= numLineaDescripcion # - #=descripcion #",
                    valueTemplate: window.app.idioma.t("LINEA") + " #= numLineaDescripcion # - #=descripcion #",
                    dataValueField: "numLinea",
                    dataSource: window.app.planta.lineas,
                    change: function () { self.$("#btnExportarPDF").hide(); },
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                this.$("#cmbAnyo").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: this.anhos,
                    change: function () { self.$("#btnExportarPDF").hide(); self.cambiaAnyo(this, self); },
                    optionLabel: window.app.idioma.t('SELECCIONE_ANYO')
                });

                this.$("#cmbSemana").kendoDropDownList({
                    change: function () { self.$("#btnExportarPDF").hide(); },
                    dataValueField: "numSemana",
                    template: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    valueTemplate: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                this.$("#txtNumSemanas").kendoNumericTextBox({
                    format: "# " + window.app.idioma.t('SEMANAS'),
                    step: 1,
                    min: 1,
                    max: 10,
                    spin: function () { self.$("#btnExportarPDF").hide(); }
                });
                //this.$("#pCentral").hide();
            },
            exportarPDF: function () {
                var self = this;
                var form = document.createElement("form");
                form.setAttribute("method", "POST");
                form.setAttribute("action", "/Informes/INF-ENV-PROD_ANA-5.aspx");

                // setting form target to a window named 'formresult'
                form.setAttribute("target", "_blank");

                var lineaField = document.createElement("input");
                lineaField.setAttribute("name", "Linea");
                lineaField.setAttribute("value", self.idLineaSel);
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

                form.submit();
                document.body.removeChild(form);
            },
            cancelar: function () {
                this.remove();
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
            cambiaAnyo: function (e, self) {
                var anho = $("#cmbAnyo").data("kendoDropDownList").value();

                if (anho != "") {
                    self.obtenerSemanas(anho);
                }
            },
            obtenerSemanas: function (anho) {
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
            },
            generarAnalisisSPI: function (e, self) {
                //var datosConsulta = {};
                self.anho = null;
                self.semana = null;
                self.rangoSemanas = null;
                self.idLineaSel = null;
                self.$("#btnExportarPDF").hide();
                var linea = self.$("#cmbLinea").data("kendoDropDownList").value();
                self.idLineaSel = self.$("#cmbLinea").data("kendoDropDownList").dataItem().id;
                //datosConsulta.anho = self.$("#cmbAnyo").data("kendoDropDownList").value();
                //datosConsulta.semana = self.$("#cmbSemana").data("kendoDropDownList").value();
                //datosConsulta.rangoSemanas = self.$("#txtNumSemanas").data("kendoNumericTextBox").value();

                var tabStrip = $("#tabs").data("kendoTabStrip");
                if (tabStrip !== undefined) {
                    tabStrip.remove(tabStrip.tabGroup.children());
                    $("#tabs").empty();
                }

                $.ajax({
                    type: "GET",
                    url: "../api/obtenerTiposArranque/" + linea,
                    dataType: 'json',
                    cache: false,
                    async: true
                }).success(function (data) {
                    var tabstrip = $("#tabs").kendoTabStrip({
                        scrollable: true,
                        animation: {
                            open: {
                                effects: "fadeIn"
                            }
                        },
                        select: function (e) {
                            self.selectTab(e, self);
                        }
                    }).data("kendoTabStrip");

                    var listaTabs = [];
                    listaTabs.push("OEE");
                    data.forEach(function (arranque) {
                        listaTabs.push(arranque.Descripcion);
                    });

                    listaTabs.push(window.app.idioma.t('CAMBIOS'));

                    listaTabs.forEach(function (tab) {
                        var valor = tab.replace(/\s+/g, "").replace('-', '').replace('+', '');

                        tabstrip.append({
                            text: tab,
                            content: " <div id='grafico" + valor + "' style='width:100%;height:500px;'></div><div id='cmt" + valor + "' class='toolbarPanel' style='width:100%;height:auto;'></div><br /><textarea id='txtComent" + valor + "' rows='6' style='width:100%;'></textarea>"
                        });
                    });

                    self.$(".toolbarPanel").kendoToolBar({
                        items: [
                            { template: "<label>" + window.app.idioma.t('COMENTARIOS') + "</label>" },
                            {
                                type: "button",
                                id: "btnGuardarComentario",
                                text: window.app.idioma.t('GUARDAR_COMENTARIO'),
                                click: function () {
                                    self.guardarComentario(self);
                                }
                            },
                            {
                                type: "button",
                                id: "btnEliminarComentario",
                                text: window.app.idioma.t('ELIMINAR_COMENTARIO'),
                                click: function () {
                                    self.eliminarComentario(self);
                                }
                            }
                        ]
                    });

                    tabstrip.select(0);
                }).error(function (err, msg, ex) {
                    var a = "";
                });
            },
            selectTab: function (e, self) {
                var tabStripIndex = $(e.item).text().replace(/\s+/g, "").replace('-', '').replace('+', '');
                var datosConsulta = {};

                var grafico = $("#grafico" + tabStripIndex).data("kendoChart");

                if (grafico === undefined) {
                    datosConsulta.anho = self.$("#cmbAnyo").data("kendoDropDownList").value();
                    self.anho = datosConsulta.anho;
                    datosConsulta.semana = self.$("#cmbSemana").data("kendoDropDownList").value();
                    self.semana = datosConsulta.semana;
                    datosConsulta.rangoSemanas = self.$("#txtNumSemanas").data("kendoNumericTextBox").value();
                    self.rangoSemanas = datosConsulta.rangoSemanas;

                    self.inicio = self.$("#cmbSemana").data("kendoDropDownList").dataSource.get(datosConsulta.semana).inicio;
                    var day = self.inicio.getDate();
                    if (day < 10)
                        day = '0' + day;// yields
                    var month = self.inicio.getMonth() + 1;    // yields month
                    if (month < 10)
                        month = '0' + month;// yields
                    var year = self.inicio.getFullYear();      // yields year

                    var stringOutput = day + "/" + month + "/" + year;

                    datosConsulta.inicio = stringOutput;

                    if (datosConsulta.semana != "") {
                        datosConsulta.inicio = $("#cmbSemana").data("kendoDropDownList").dataSource.get(datosConsulta.semana).inicio;

                        self.generarGrafico(tabStripIndex, datosConsulta, $(e.item).text());
                        self.obtenerComentario($(e.item).text(), datosConsulta);
                    }
                    else Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_SELECCIONAR_UNA'), 4000);
                }
            },
            generarGrafico: function (tipo, datosConsulta, nombre) {
                var self = this;
                datosConsulta.linea = self.$("#cmbLinea").data("kendoDropDownList").value();
                datosConsulta.tipo = tipo;

                var grafico = $("#grafico" + tipo);

                kendo.ui.progress($("#grafico" + tipo), true);

                $.ajax({
                    type: "POST",
                    url: "../api/produccion/obtenerValoresSPI",
                    dataType: 'json',
                    data: JSON.stringify(datosConsulta),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    async: true
                }).done(function (data) {
                    self.results = data;

                    $(grafico).kendoChart({
                        pdf: {
                            fileName: window.app.idioma.t('ANALISIS_SPI')+" " + nombre + ".pdf",
                        },
                        title: {
                            text: window.app.idioma.t('GRAFICO') + " " + nombre
                        },
                        legend: {
                            position: "bottom"
                        },
                        seriesDefaults: {
                            type: "line"
                        },
                        series: self.results.series,
                        valueAxis: {
                            min: 0,
                            labels: {
                                format: "{0} "
                            },
                            line: {
                                visible: false
                            },
                            axisCrossingValue: -10
                        },
                        categoryAxis: {
                            categories: self.results.Fields,
                            majorGridLines: {
                                visible: false
                            },
                            labels: {
                                rotation: "auto"
                            }
                        },
                        tooltip: {
                            visible: true,
                            format: "{0}",
                            template: "#= series.name #: #= value #"
                        }
                    });

                    kendo.ui.progress($("#grafico" + tipo), false);
                    self.$("#btnExportarPDF").show();
                });
            },
            obtenerComentario: function (tipo, datos) {
                datos.tipo = tipo;
                datos.linea = self.$("#cmbLinea").data("kendoDropDownList").text();

                $.ajax({
                    type: "POST",
                    url: "../api/analisisSPI/obtenerComentario",
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    async: true,
                    data: JSON.stringify(datos),
                    cache: false
                }).success(function (data) {
                    self.$("#txtComent" + tipo.replace(/\s+/g, "").replace('-', '').replace('+', '')).val(data);
                }).error(function (err) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_EL_COMENTARIO') + ': ' + err.Message, 4000);
                    }
                });
            },
            guardarComentario: function (self) {
                var permiso = TienePermiso(207);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var datos = {};
                datos.LINEA = this.$("#cmbLinea").data("kendoDropDownList").text();
                datos.ANYO = this.$("#cmbAnyo").data("kendoDropDownList").value();
                datos.SEMANA = this.$("#cmbSemana").data("kendoDropDownList").value();
                datos.TIPO_ANALISIS = $("#tabs").data("kendoTabStrip").select().text();
                datos.COMENTARIOS = this.$("#txtComent" + datos.TIPO_ANALISIS.replace(/\s+/g, "").replace('-', '').replace('+', '')).val();

                $.ajax({
                    type: "POST",
                    url: "../api/analisisSPI/insertarComentario/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    async: false
                }).done(function (data) {
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_GUARDADO'), 4000);
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_GUARDAR'), 4000);
                    }
                });
            },
            eliminarComentario: function (self) {
                var permiso = TienePermiso(207);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                var datos = {};
                datos.LINEA = this.$("#cmbLinea").data("kendoDropDownList").text();
                datos.ANYO = this.$("#cmbAnyo").data("kendoDropDownList").value();
                datos.SEMANA = this.$("#cmbSemana").data("kendoDropDownList").value();
                datos.TIPO_ANALISIS = $("#tabs").data("kendoTabStrip").select().text();

                var valor = datos.TIPO_ANALISIS.replace(/\s+/g, "").replace('-', '').replace('+', '');

                $.ajax({
                    type: "POST",
                    url: "../api/analisisSPI/eliminarComentario/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    async: false
                }).done(function (data) {
                    $("#txtComent" + valor).val("");
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_ELIMINADO'), 4000);
                }).fail(function (xhr) {
                    if (xhr.status == '403' && xhr.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_GUARDAR'), 4000);
                    }
                });
            },
        });

        return AnalisisSPI;
    });
