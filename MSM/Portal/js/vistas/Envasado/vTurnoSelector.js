define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/TurnoSelector.html', 'compartido/notificaciones'],
    function (_, Backbone, $, plantilla, Not) {
        var vistaTurnoSelector = Backbone.View.extend({
            tagName: 'div',
            id: 'divTurnoSelector',
            window: null,
            template: _.template(plantilla),
            callback: null,
            initialize: function ({ parent, options }) {
                var self = this;

                self.parent = parent;
                self.turno = options?.turno;
                self.select = options?.select;
                self.callback = options?.callback;

                self.dsTurnos = new kendo.data.DataSource({
                    transport: {
                        read: function (operation) {
                            let idLinea = $("#TScmbLinea").data("kendoDropDownList").value();                            
                            let fecha = $("#TSdtpFecha").data("kendoDatePicker").value();

                            if (idLinea && fecha) {
                                $.ajax({
                                    url: "../api/turnos/breaks/",
                                    data: {
                                        idLinea,
                                        fechaInicio: fecha.midnight().toISOString(),
                                        fechaFin: fecha.addDays(1).midday().toISOString()
                                    },
                                    dataType: "json",
                                    success: function (response) {
                                        let resMap = response.map(m => {
                                            return {
                                                linea: { id: m.IdLinea },
                                                fecha: m.Fecha,
                                                tipo: { id: m.IdTipoTurno },
                                                inicio: m.FechaInicio,
                                                fin: m.FechaFin,
                                                idTurno: m.Id
                                            }
                                        })
                                        operation.success(resMap); //mark the operation as successful
                                    }
                                });
                            }
                            else {
                                operation.success([]);
                            }
                        }
                    }
                });

                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                $("#TScmbLinea").kendoDropDownList({
                    template: window.app.idioma.t("LINEA") + " #= numLineaDescripcion # - #=descripcion #",
                    valueTemplate: window.app.idioma.t("LINEA") + " #= numLineaDescripcion # - #=descripcion #",
                    dataValueField: "id",
                    dataSource: window.app.planta.lineas,
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    value: self.turno?.linea?.id,
                    change: function (e) {
                        self.cambiaLineaFecha(this, self);
                    }
                });

                $("#TSdtpFecha").kendoDatePicker({
                    value: self.turno?.fecha ? new Date(self.turno.fecha): new Date(),
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    change: function (e) { self.cambiaLineaFecha(this, self); }
                });

                $("#TScmbTurnos").kendoDropDownList({
                    dataValueField: "tipo.id",
                    dataSource: self.dsTurnos,
                    template: "#: window.app.idioma.t('TURNO'+tipo.id)#",
                    valueTemplate: "#: window.app.idioma.t('TURNO'+tipo.id)#",
                    change: function () {
                        var turno = this.value() ? this.dataItem() : null
                        self.cambiaTurno( turno, self );
                    },
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    dataBound: function (e) {
                        if (!e.sender.loaded && self.turno?.tipo?.id) {
                            e.sender.loaded = true;
                            e.sender.value(self.turno.tipo.id);
                            this.trigger("change");
                            //self.cambiaTurno( this, self );
                        }
                    }
                });

                $("#TSbtnSeleccionar").kendoButton({
                    click: async function (e) {
                        e.preventDefault();

                        let combo = $("#TScmbTurnos").getKendoDropDownList();
                        let turno = combo.value() ? combo.dataItem() : null

                        if (!turno) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONE_TURNO'), 4000);
                            return;
                        }

                        self.window.close();

                        if (self.callback) {
                            self.callback( turno );
                        }
                    }
                });

                self.window = $(self.el).kendoWindow(
                    {
                        title: window.app.idioma.t('SELECTOR_TURNO'),
                        //width: "1200px",
                        modal: true,
                        resizable: false,
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                            self.eliminar();
                        },
                    }).data("kendoWindow");

                self.window.center();

            },
            cambiaLineaFecha: function (e, self) {

                var kddl = $("#TScmbTurnos").getKendoDropDownList();
                kddl.value(null);
                kddl.trigger("change");

                self.dsTurnos.read();
            },
            cambiaTurno: function (turno, self) {

                if (turno) {
                    $("#TSturnoConfirmar").show();
                    var text = "De: " + kendo.toString(new Date(turno.inicio), "HH:mm:ss") + " a " + kendo.toString(new Date(turno.fin), "HH:mm:ss")

                    $("#TSlblDescTurno").html(text);
                }
                else {
                    $("#TSturnoConfirmar").hide();
                    $("#TSlblDescTurno").html("");
                }                

                if (self.select) {
                    self.select(turno);
                }
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaTurnoSelector;
    });