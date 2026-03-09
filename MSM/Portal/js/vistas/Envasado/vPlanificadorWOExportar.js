define(['underscore', 'backbone', 'jquery', 'kendoTimezones', 'text!../../../Envasado/html/PlanificadorWOExportar.html',
    'vistas/Envasado/vPlanificadorWOJustificar', 'compartido/notificaciones'],
    function (_, Backbone, $, kendoTimezones, plantilla, vistaJustificar, Not) {
        var vistaPlanificadorExportar = Backbone.View.extend({
            tagName: 'div',
            id: 'divPlanificadorExportar',
            window: null,
            template: _.template(plantilla),
            callback: null,
            //constTipoParo: enums.TipoParo(),
            initialize: function (schDate, opciones) {
                var self = this;

                self.schDate = schDate;
                self.opciones = opciones;

                this.render();
            },
            cambiaAnio: function (e, self) {
                let id = e.element[0].id;
                let semanaDDL = $("#selectSemana").getKendoDropDownList();

                if (id.toLowerCase().includes("desde")) {
                    semanaDDL = $("#selectSemanaDesde").getKendoDropDownList();
                } else if (id.toLowerCase().includes("hasta")) {
                    semanaDDL = $("#selectSemanaHasta").getKendoDropDownList();
                }

                semanaDDL.dataSource.read();               
            },
            render: function () {
                var self = this;

                this.setElement($("<div class='wnd-exportacion'/>"));
                this.$el.html(this.template());

                // Años, cargamos desde el año de implantación del centro a 2 años en el futuro
                let anios = [];

                for (let i = window.app.planta.anyoImplantacion; i <= new Date().getFullYear() + 2; i++) {
                    anios.push({id: i, nombre: i.toString()})
                }

                let aniosDS = new kendo.data.DataSource({
                    data: anios
                })

                this.$("#selectAnio").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: aniosDS,
                    value: self.schDate.getFullYear(),
                    change: function () { self.cambiaAnio(this, self); },
                });

                let semanasDS = new kendo.data.DataSource({
                    transport: {
                        read: function (operation) {

                            let anioDDL = self.$("#selectAnio").getKendoDropDownList();
                            if (anioDDL && anioDDL.value()) {
                                let anio = anioDDL.value();
                                $.ajax({
                                    url: "../api/semanas/" + anio + "/",
                                    dataType: "json",
                                    success: function (response) {
                                        operation.success(response); //mark the operation as successful
                                    }
                                });
                            }
                            else {
                                operation.success([]);
                            }
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
                })
                this.$("#selectSemana").kendoDropDownList({
                    dataValueField: "numSemana",
                    template: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    valueTemplate: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    dataSource: semanasDS,
                    dataBound: function (e) {
                        this.value(self.schDate.getWeek());
                    }
                });

                // Depende si queremos exportar el borrador o la planificación completa mostramos unos filtros u otros
                if (!self.opciones.soloInforme) {
                    this.$("#selectorWO").show();
                    this.$("#selectorExcel").hide();

                    this.$("#selectAnioDesde").kendoDropDownList({
                        dataTextField: "nombre",
                        dataValueField: "id",
                        dataSource: aniosDS,
                        value: self.schDate.getFullYear(),
                        change: function () { self.cambiaAnio(this, self); },
                    });

                    this.$("#selectAnioHasta").kendoDropDownList({
                        dataTextField: "nombre",
                        dataValueField: "id",
                        dataSource: aniosDS,
                        value: self.schDate.getFullYear(),
                        change: function () { self.cambiaAnio(this, self); },
                    });

                    let semanasDSDesde = new kendo.data.DataSource({
                        transport: {
                            read: function (operation) {

                                let anioDDL = self.$("#selectAnioDesde").getKendoDropDownList();
                                if (anioDDL && anioDDL.value()) {
                                    let anio = anioDDL.value();
                                    $.ajax({
                                        url: "../api/semanas/" + anio + "/",
                                        dataType: "json",
                                        success: function (response) {
                                            operation.success(response); //mark the operation as successful
                                        }
                                    });
                                }
                                else {
                                    operation.success([]);
                                }
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
                    })
                    this.$("#selectSemanaDesde").kendoDropDownList({
                        dataValueField: "numSemana",
                        template: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                        valueTemplate: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataSource: semanasDSDesde,
                        dataBound: function (e) {
                            this.value(self.schDate.getWeek());
                        }
                    });
                    let semanasDSHasta = new kendo.data.DataSource({
                        transport: {
                            read: function (operation) {

                                let anioDDL = self.$("#selectAnioHasta").getKendoDropDownList();
                                if (anioDDL && anioDDL.value()) {
                                    let anio = anioDDL.value();
                                    $.ajax({
                                        url: "../api/semanas/" + anio + "/",
                                        dataType: "json",
                                        success: function (response) {
                                            operation.success(response); //mark the operation as successful
                                        }
                                    });
                                }
                                else {
                                    operation.success([]);
                                }
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
                    })
                    this.$("#selectSemanaHasta").kendoDropDownList({
                        dataValueField: "numSemana",
                        template: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                        valueTemplate: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataSource: semanasDSHasta,
                        dataBound: function (e) {
                            this.value(self.schDate.getWeek());
                        }
                    });

                    this.$("#selectLineas").kendoMultiSelect({
                        template: "#:ObtenerLineaDescripcion(id)#",
                        tagTemplate: "#:ObtenerLineaDescripcion(id)#",
                        dataValueField: "numLinea",
                        dataSource: new kendo.data.DataSource({
                            data: window.app.planta.lineas
                        }),
                        filter: "contains",
                        placeholder: window.app.idioma.t("TODAS") + "...",
                        //downArrow: true,
                    });
                }

                this.$("#btnDialogoGestionCancelar").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        self.window.close();
                    }
                });

                this.$("#btnDialogoGestionAceptar").kendoButton({
                    click: async function (e) {
                        e.preventDefault();

                        self.$("#trError").html("");
                        self.$("#trError").hide();

                        let anioInforme = self.$("#selectAnio").getKendoDropDownList().value();
                        let semanaInforme = self.$("#selectSemana").getKendoDropDownList().value();

                        if (!anioInforme || !semanaInforme) {
                            self.$("#trError").html(window.app.idioma.t("FILTRO_NO_VALIDO"));
                            self.$("#trError").show();
                            return;
                        }

                        let fechaDesde, fechaHasta, lineas;
                        if (!self.opciones.soloInforme) {
                            fechaDesde = self.$("#selectSemanaDesde").getKendoDropDownList()?.dataItem()?.inicio;
                            fechaHasta = self.$("#selectSemanaHasta").getKendoDropDownList()?.dataItem()?.fin?.addDays(1);
                            lineas = self.$("#selectLineas").getKendoMultiSelect().value();

                            if (!fechaDesde || !fechaHasta) {
                                self.$("#trError").html(window.app.idioma.t("FILTRO_NO_VALIDO"));
                                self.$("#trError").show();
                                return;
                            }

                            if (fechaDesde >= fechaHasta) {
                                self.$("#trError").html(window.app.idioma.t("_LA_FECHA"));
                                self.$("#trError").show();
                                return;
                            }
                        }

                        const data = {
                            anioInforme,
                            semanaInforme,
                            fechaDesde,
                            fechaHasta,
                            lineas
                        }

                        if (self.opciones.soloInforme) {
                            self.ExecuteAction(data);
                            return;
                        }

                        // Mostramos dialog para elegir si justificar o no la exportación
                        OpenWindow(window.app.idioma.t("ATENCION"),
                            window.app.idioma.t("JUSTIFICAR_EXPORTACION?"),
                            () => {
                                self.OpenModalJustificar(data);
                            },
                            {
                                okMsg: window.app.idioma.t("SI"),
                                cancelMsg: window.app.idioma.t("NO"),
                                width: "270px",
                                showClose: false,
                                cancelCallback: () => {
                                    self.ExecuteAction(data);
                                }
                            }
                        );                        
                    }
                });

                self.window = this.$el.kendoWindow(
                    {
                        title: self.opciones.soloInforme ? (self.opciones.borrador ? window.app.idioma.t('EXPORTAR_BORRADOR_PLANIFICACION') : window.app.idioma.t('INFORME_PLANIFICACION')) : window.app.idioma.t('EXPORTAR') + " " + window.app.idioma.t('PLANIFICACION'),
                        width: "800px",
                        modal: true,
                        resizable: false,
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                            self.eliminar();
                        },
                    }).data("kendoWindow");

                self.window.center().open();

            },
            OpenModalJustificar: function (data) {
                let self = this;

                self.vistaJustificar = new vistaJustificar(self, {
                    anio: data.anioInforme,
                    semana: data.semanaInforme,
                    lineas: data.lineas,
                    cancelCallback: () => {
                        //if (self.justificacionGuardada) {
                            self.ExecuteAction(data);
                        //}
                    },
                    callback: (result) => {
                        // Preguntamos si queremos añadir otra justificación
                        OpenWindow(window.app.idioma.t("ATENCION"),
                            window.app.idioma.t("JUSTIFICAR_EXPORTACION_OTRA?"),
                            () => {
                                self.OpenModalJustificar(data);
                            },
                            {
                                okMsg: window.app.idioma.t("SI"),
                                cancelMsg: window.app.idioma.t("NO"),
                                width: "270px",
                                showClose: false,
                                cancelCallback: () => {
                                    self.ExecuteAction(data);
                                }
                            }
                        );
                    }
                });
            },
            ExecuteAction: async function (data) {
                let self = this;

                let result = false;
                try {
                    kendo.ui.progress($("#divPlanificadorExportar"), true);
                    if (self.opciones.soloInforme) {
                        await self.DescargarInforme(data)
                    }
                    else {
                        result = await self.ExportarPlanificacion(data);
                    }

                    kendo.ui.progress($("#divPlanificadorExportar"), false);

                    // Cerramos ventana y llamamos al callback si existe
                    self.window.close();

                    if (self.opciones.callback) {
                        self.opciones.callback(result);
                    }
                }
                catch (err) {
                    kendo.ui.progress($("#divPlanificadorExportar"), false);
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        $("#trError").html(window.app.idioma.t('AVISO_SIN_PERMISOS'));
                    } else {
                        console.log(err)
                        let errorMsg = err.responseJSON ? err.responseJSON.Message : null;
                        if (self.opciones.soloInforme) {
                            $("#trError").html(errorMsg || window.app.idioma.t('ERROR_GENERANDO_INFORME_PLANIFICACION'));
                        } else {
                            $("#trError").html(errorMsg || window.app.idioma.t('PLANIFICADOR_ERROR_EXPORTAR_WO'));
                        }
                    }
                    $("#trError").show();
                }
            },
            ExportarPlanificacion: async function (data) {
                let self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: `../api/Planificador/ExportarWO`,
                        contentType: "application/json; charset=utf-8",
                        timeout: 120000,
                        data: {
                            fechaInicio: data.fechaDesde.toISOString(),
                            fechaFin: data.fechaHasta.toISOString(),
                            semana: data.semanaInforme,
                            lineas: data.lineas.join(","),
                            anio: data.anioInforme
                        },
                        success: function (_data) {
                            resolve(_data);
                        },
                        error: function (er) {
                            reject(er);
                        }
                    });
                })
            },
            DescargarInforme: async function (data) {
                let self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: `../api/planificador/DescargarInformePlanificacion`,
                        dataType: 'json',
                        //contentType: "application/json; charset=utf-8",
                        data: {
                            semana: data.semanaInforme,
                            anio: data.anioInforme,
                            borrador: self.opciones.borrador
                        },
                        timeout: 60000,
                        success: function (_data) {
                            if (_data.valido) {
                                var bytes = Base64ToArrayBuffer(_data.data[0]);

                                var blob = new Blob([bytes], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
                                var link = document.createElement('a');
                                link.href = window.URL.createObjectURL(blob);
                                link.download = _data.data[1];
                                link.click();
                                resolve();
                            }
                            else
                            {
                                reject({
                                    responseJSON: {
                                        Message: _data.msg
                                    }
                                })
                            }                            
                        },
                        error: function (err) {
                            reject(err);
                        }
                    });
                });
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaPlanificadorExportar;
    });