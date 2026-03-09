define(['underscore', 'backbone', 'jquery', 'kendoTimezones', 'text!../../../Envasado/html/PlanificadorWOJustificar.html', 'compartido/notificaciones'],
    function (_, Backbone, $, kendoTimezones, plantilla, Not) {
        var vistaPlanificadorJustificar = Backbone.View.extend({
            tagName: 'div',
            id: 'divPlanificadorJustificar',
            window: null,
            template: _.template(plantilla),
            callback: null,
            //constTipoParo: enums.TipoParo(),
            initialize: function (parent, opciones) {
                var self = this;

                self.parent = parent;
                self.opciones = opciones;

                this.render();
            },
            cambiaAnio: function (e, self) {
                let semanaDDL = $("#selectSemanaJ").getKendoDropDownList();

                semanaDDL.dataSource.read();
            },
            render: function () {
                var self = this;

                this.setElement($("<div class='wnd-justificacion'/>"));
                //$("#center-pane").prepend($(this.el));
                this.$el.html(this.template());

                // Años, cargamos desde el año de implantación del centro a 2 años en el futuro
                let anios = [];

                for (let i = window.app.planta.anyoImplantacion; i <= new Date().getFullYear() + 2; i++) {
                    anios.push({ id: i, nombre: i.toString() })
                }

                let aniosDS = new kendo.data.DataSource({
                    data: anios
                })

                this.$("#selectAnioJ").kendoDropDownList({
                    dataTextField: "nombre",
                    dataValueField: "id",
                    dataSource: aniosDS,
                    value: self.opciones.anio,
                    change: function () { self.cambiaAnio(this, self); },
                });

                let semanasDS = new kendo.data.DataSource({
                    transport: {
                        read: function (operation) {

                            let anioDDL = self.$("#selectAnioJ").getKendoDropDownList();
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
                this.$("#selectSemanaJ").kendoDropDownList({
                    dataValueField: "numSemana",
                    template: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    valueTemplate: "#= numSemana # - (#: kendo.toString(inicio, 'dd/MM/yyyy')# a #: kendo.toString(fin, 'dd/MM/yyyy')#)",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    dataSource: semanasDS,
                    dataBound: function (e) {
                        this.value(self.opciones.semana);
                    }
                });

                this.$("#selectLineasJ").kendoMultiSelect({
                    template: "#:ObtenerLineaDescripcion(id)#",
                    tagTemplate: "#:ObtenerLineaDescripcion(id)#",
                    dataValueField: "numLinea",
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas
                    }),
                    filter: "contains",
                    placeholder: window.app.idioma.t("TODAS") + "...",
                    //downArrow: true,
                    dataBound: function (e) {
                        this.value(self.opciones.lineas);
                    }
                });

                let motivoDS = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetMotivosAdherencia?verInactivos=false",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "GET"
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                    }
                })
                this.$("#selectMotivoJ").kendoDropDownList({
                    dataValueField: "IdMotivo",
                    template: "<span title='#: Descripcion #'>#: IdMotivo # - #: Motivo #</span>",
                    valueTemplate: "<span title='#: Descripcion #'>#: IdMotivo # - #: Motivo #</span>",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    dataSource: motivoDS,
                    dataBound: function (e) {                        
                    }
                });

                this.$("#btnDialogoGestionCancelarJ").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        self.window.close();
                    }
                });

                this.$("#btnDialogoGestionAceptarJ").kendoButton({
                    click: async function (e) {
                        e.preventDefault();

                        $("#trError").html("");
                        $("#trError").hide();

                        let anio = $("#selectAnioJ").getKendoDropDownList().value();
                        let semana = $("#selectSemanaJ").getKendoDropDownList().value();                        
                        let lineas = $("#selectLineasJ").getKendoMultiSelect().dataItems();
                        let motivo = $("#selectMotivoJ").getKendoDropDownList().value();
                        let comentario = $("#comentarioJ").val();

                        if (!lineas.length) {
                            // En caso de no haber seleccionado linea, cogemos todas
                            lineas = $("#selectLineasJ").getKendoMultiSelect().dataSource.data();
                        }

                        if (!anio || !semana || !motivo || !lineas.length) {
                            const campos = `${window.app.idioma.t("SEMANA")} ${window.app.idioma.t("Y_GRIEGA")} ${window.app.idioma.t("MOTIVO")}`                            
                            $("#trErrorJ").html(window.app.idioma.t('FORMULARIO_CAMPOS_OBLIGATORIOS').replace("#CAMPOS", campos));
                            $("#trErrorJ").show();
                            return;
                        }

                        const data = {
                            Anio: anio,
                            Semana: semana,
                            Lineas: lineas.map(l => l.id),
                            IdMotivo: motivo,
                            Comentario: comentario
                        }

                        let result = false;
                        const windowElem = self.window.element;
                        try {
                            kendo.ui.progress(windowElem, true);

                            result = await self.GuardarJustificacion(data);

                           // self.parent.justificacionGuardada = true;

                            kendo.ui.progress(windowElem, false);

                            // Cerramos ventana y llamamos al callback si existe
                            self.window.successClose = true;
                            self.window.close();

                            if (self.opciones.callback) {
                                self.opciones.callback(result);
                            }
                        }
                        catch (err) {
                            kendo.ui.progress(windowElem, false);
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                $("#trErrorJ").html(window.app.idioma.t('AVISO_SIN_PERMISOS'));
                            } else {
                                console.log(err)
                                let errorMsg = err.responseJSON ? err.responseJSON.Message : null;
                                $("#trErrorJ").html(window.app.idioma.t('ERROR_CREANDO_JUSTIFICACION_EXPORTACION'));
                            }
                            $("#trErrorJ").show();
                        }
                    }
                });

                self.window = this.$el.kendoWindow(
                    {
                        title: window.app.idioma.t('REGISTRO_CAMBIOS_PLANIFICACION'),
                        width: "650px",
                        modal: true,
                        resizable: false,
                        close: function () {
                            if (!self.window.successClose && self.opciones.cancelCallback) {
                                self.opciones.cancelCallback();
                            }
                            self.window.destroy();
                            self.window = null;
                            self.eliminar();
                        },
                    }).data("kendoWindow");

                self.window.center().open();

            },
            GuardarJustificacion: async function (data) {
                let self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        url: `../api/Planificador/JustificacionesCambiosPlanificacion`,
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(data),
                        success: function (_data) {
                            resolve(_data);
                        },
                        error: function (er) {
                            reject(er);
                        }
                    });
                })
            },            
            eliminar: function () {
                this.remove();
            }
        });

        return vistaPlanificadorJustificar;
    });