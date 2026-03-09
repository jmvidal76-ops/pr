define(['underscore', 'backbone', 'jquery', 'text!../../../Alt/html/FormsAnalisisDatos.html', 'vistas/vDialogoConfirm',
    'compartido/notificaciones', 'jszip'],
    function (_, Backbone, $, PlantillaForms, VistaDlgConfirm, Not, JSZip) {
        var VistaForms = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            grid: null,
            inicio: new Date().addDays(-1),
            fin: new Date(),
            pdv: null,
            nombreForm: null,
            listaPdvs: [],
            template: _.template(PlantillaForms),
            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.getDataSource();
                self.render();
            },
            getDataSource: function () {
                var self = this;

                self.dsForms = new kendo.data.DataSource({
                    pageSize: 500,
                    transport: {
                        read: {
                            url: "../api/forms/analisisDatos",
                            data: function () {
                                var result = {};
                                result.fechaDesde = new Date(self.inicio.setHours(0, 0, 0)).toISOString();
                                result.fechaHasta = new Date(new Date(self.fin.setHours(0, 0, 0)).setDate(self.fin.getDate() + 1)).toISOString();
                                result.pdv = self.pdv;
                                result.nombreForm = self.nombreForm;

                                return result;
                            },
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            id: "IdForm",
                            fields: {
                                IdForm: { type: "number" },
                                Nombre: { type: "string" },
                                PuntoVerificacion: { type: "string" },
                                FechaCreacion: { type: "date" },
                                FechaActualizacion: { type: "date" },
                                TipoCampo: { type: "string" },
                                IdCampo: { type: "string" },
                                NombreCampo: { type: "string" },
                                FilaColumna: { type: "string" },
                                ValorCampo: { type: "string" }
                            }
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el))

                $("#dtpFechaDesde").kendoDateTimePicker({
                    value: self.inicio,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHoraMin,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#dtpFechaHasta").kendoDateTimePicker({
                    value: self.fin,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHoraMin,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                self.cargarCombosPdv();

                self.grid = this.$("#gridForms").kendoGrid({
                    excel: {
                        fileName: window.app.idioma.t("FORMS_ANALISIS_DATOS") + ".xlsx",
                        filterable: true,
                        allPages: true,
                    },
                    autoBind: false,
                    dataSource: self.dsForms,
                    groupable: {
                        messages: {
                            empty: window.app.idioma.t('ARRASTRAR_SOLTAR')
                        }
                    },
                    sortable: true,
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [500, 1000, 2000, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            field: "PuntoVerificacion",
                            title: window.app.idioma.t("PUNTO_VERIFICACION"),
                            //width: 105,
                        },
                        {
                            field: "Nombre",
                            title: window.app.idioma.t("NOMBRE"),
                            //width: 120,
                        },
                        {
                            field: "FechaCreacion",
                            title: window.app.idioma.t("FECHA_CREACION"),
                            template: '#= kendo.toString(new Date(FechaCreacion), kendo.culture().calendars.standard.patterns.MES_FechaHora) #',
                            width: 165,
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "FechaActualizacion",
                            title: window.app.idioma.t("FECHA_ACTUALIZACION"),
                            template: '#= FechaActualizacion !== null ? kendo.toString(new Date(FechaActualizacion), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            width: 170,
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "TipoCampo",
                            title: window.app.idioma.t("TIPO_CAMPO"),
                            width: 125,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='//width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=TipoCampo#' style='//width: 14px;height:14px;margin-right:5px;'/>#= TipoCampo #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "IdCampo",
                            title: window.app.idioma.t("ID_CAMPO"),
                            width: 125,
                        },
                        {
                            field: "NombreCampo",
                            title: window.app.idioma.t("NOMBRE_CAMPO"),
                            //width: 150,
                        },
                        {
                            field: "FilaColumna",
                            title: window.app.idioma.t("FILA_COLUMNA"),
                            //width: 125,
                        },
                        {
                            field: "ValorCampo",
                            title: window.app.idioma.t("VALOR_CAMPO"),
                            //width: 150,
                        },
                    ],
                    dataBinding: self.resizeGrid,
                    excelExport: function (e) {
                        var sheet = e.workbook.sheets[0];

                        for (var i = 1; i < sheet.rows.length; i++) {
                            try {
                                var dataPosition = i - 1;
                                var row = sheet.rows[i];

                                row.cells[2].value = kendo.toString(e.data[dataPosition].FechaCreacion, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                                row.cells[3].value = e.data[dataPosition].FechaActualizacion == null ? "" : kendo.toString(e.data[dataPosition].FechaActualizacion, kendo.culture().calendars.standard.patterns.MES_FechaHora);
                            } catch (e) {
                            }
                        }
                    },
                }).data("kendoGrid");

                window.app.headerGridTooltip($("#gridForms").data("kendoGrid"));

                self.resizeGrid();
            },
            events: {
                'click #btnFiltrar': 'actualiza',
                'click #btnExportExcel': 'exportExcel',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
            },
            cargarCombosPdv: function () {
                var self = this;
                var idLocation = 0;

                // Obtenemos pdvs para el nivel 1
                self.listaPdvs = window.app.calidad.pdvs;
                var location = self.listaPdvs.filter(function (item) {
                    return item.idParent == null;
                });

                if (location.length != 0) {
                    idLocation = location[0].ID;
                }

                var locationsN1 = self.listaPdvs.filter(function (item) {
                    return item.idParent == idLocation;
                });

                $("#cmbPdvNivel1").kendoDropDownList({
                    dataTextField: "name",
                    dataValueField: "ID",
                    dataSource: new kendo.data.DataSource({
                        data: locationsN1,
                        sort: { field: "name", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    change: function () {
                        // Obtenemos pdvs para el nivel 2
                        var idN1 = this.value();

                        var locationsN2 = self.listaPdvs.filter(function (item) {
                            return item.idParent == idN1;
                        });

                        var ds = new kendo.data.DataSource({
                            data: locationsN2,
                            sort: { field: "name", dir: "asc" }
                        });

                        var comboN2 = $("#cmbPdvNivel2").data('kendoDropDownList');
                        comboN2.setDataSource(ds);

                        var pdv = this.text();
                        self.cargarComboForm(pdv);
                    }
                });

                $("#cmbPdvNivel2").kendoDropDownList({
                    dataTextField: "name",
                    dataValueField: "ID",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    change: function () {
                        // Obtenemos pdvs para el nivel 3
                        var idN2 = this.value();

                        var locationsN3 = self.listaPdvs.filter(function (item) {
                            return item.idParent == idN2;
                        });

                        var locationsN3N4 = [];
                        locationsN3.forEach(function (locationN3) {
                            locationsN3N4.push(locationN3);

                            var locationsN4 = self.listaPdvs.filter(function (item) {
                                return item.idParent == locationN3.ID;
                            });

                            locationsN4.forEach(function (locationN4) {
                                locationsN3N4.push(locationN4);
                            });
                        });

                        var ds = new kendo.data.DataSource({
                            data: locationsN3N4,
                            sort: { field: "name", dir: "asc" }
                        });

                        var comboN3 = $("#cmbPdvNivel3").data('kendoDropDownList');
                        comboN3.setDataSource(ds);

                        var pdv = $("#cmbPdvNivel1").data('kendoDropDownList').text();

                        if (this.value() != '') {
                            pdv = pdv + ' \\ ' + this.text();
                        }
                        self.cargarComboForm(pdv);
                    }
                });

                $("#cmbPdvNivel3").kendoDropDownList({
                    dataTextField: "name",
                    dataValueField: "ID",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    change: function () {
                        var pdv = $("#cmbPdvNivel1").data('kendoDropDownList').text() + ' \\ ' + $("#cmbPdvNivel2").data('kendoDropDownList').text();

                        if (this.value() != '') {
                            pdv = pdv + ' \\ ' + this.text();
                        }
                        self.cargarComboForm(pdv);
                    }
                });

                $("#cmbForm").kendoDropDownList({
                    dataTextField: "Valor",
                    dataValueField: "Id",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });
            },
            cargarComboForm: function (pdv) {
                var self = this;
                var listaForms = null;

                $.ajax({
                    url: "../api/forms/nombreFormPorPDV",
                    dataType: "json",
                    data: { pdv: pdv },
                    async: false,
                    success: function (data) {
                        listaForms = data;
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                        } else if (err.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), err.xhr.responseJSON.Message, 3000);
                        }
                    }
                });

                var ds = new kendo.data.DataSource({
                    data: listaForms,
                });

                var comboForm = $("#cmbForm").data('kendoDropDownList');
                comboForm.setDataSource(ds);
            },
            actualiza: function () {
                var self = this;
                self.pdv = null;

                self.inicio = $("#dtpFechaDesde").data("kendoDateTimePicker").value();
                self.fin = $("#dtpFechaHasta").data("kendoDateTimePicker").value();

                if (!self.inicio || !self.fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LAS_FECHAS_INTRODUCIDAS'), 3000);
                    return;
                }

                if (self.inicio > self.fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('_LA_FECHA'), 3000);
                    return;
                }

                if ($("#cmbPdvNivel1").data('kendoDropDownList').value() !== '') {
                    self.pdv = $("#cmbPdvNivel1").data('kendoDropDownList').text();

                    if ($("#cmbPdvNivel2").data('kendoDropDownList').value() !== '') {
                        self.pdv = self.pdv + ' \\ ' + $("#cmbPdvNivel2").data('kendoDropDownList').text();

                        if ($("#cmbPdvNivel3").data('kendoDropDownList').value() !== '') {
                            self.pdv = self.pdv + ' \\ ' + $("#cmbPdvNivel3").data('kendoDropDownList').text();
                        }
                    }
                } else {
                    self.pdv = null;
                }

                self.nombreForm = $("#cmbForm").data('kendoDropDownList').value() == '' ? null : $("#cmbForm").data('kendoDropDownList').text();

                if (self.dsForms.page() != 1) {
                    self.dsForms.page(1);
                }
                self.dsForms.read();
            },
            exportExcel: function () {
                var grid = $("#gridForms").data("kendoGrid");
                grid.saveAsExcel();
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
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridForms"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            },
            LimpiarFiltroGrid: function () {
                if ($("#gridForms").data("kendoGrid").dataSource.filter() != undefined) {
                    $("form.k-filter-menu button[type='reset']").trigger("click");
                }
            },
        });

        return VistaForms;
    });