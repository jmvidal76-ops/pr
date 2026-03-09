define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/CrearAccionCorrectivaTurno.html', 'compartido/notificaciones', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, plantilla, Not, enums) {
        var vistaCrearAccionCorrectiva = Backbone.View.extend({
            tagName: 'div',
            id: 'divCrearAccionCorrectiva',
            window: null,
            template: _.template(plantilla),
            callback: null,
            constTipoParo: enums.TipoParo(),
            initialize: function ({ parent, options }) {
                var self = this;

                self.parent = parent;
                self.turno = options?.turno;
                self.idLinea = options?.turno?.linea?.id;
                self.callback = options?.callback;

                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                // Si hemos mandado turno no hay que seleccionarlo
                if (self.turno) {
                    $("#turnoSeleccionado").show();
                    $("#lblLinea").html(ObtenerLineaDescripcion(self.idLinea) + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + window.app.idioma.t("TURNO") + ": "
                        + kendo.toString(new Date(self.turno.fecha), 'dd/MM/yyyy') + "&nbsp;&nbsp;&nbsp;" + window.app.idioma.t("TURNO" + self.turno.tipo.id))
                }
                else {
                    $("#selectorTurno").show();
                }

                // Grid de paros
                $("#gridParos").kendoGrid({
                    dataSource: new kendo.data.DataSource({
                        transport: {
                            read: function (operation) {
                                if (self.idLinea && self.turno) {
                                    let numLinea = window.app.planta.lineas.find(f => f.id == self.idLinea).numLinea;
                                    $.ajax({
                                        url: '../api/parosPerdidas/',
                                        dataType: "json",
                                        data: {
                                            numLinea: numLinea,
                                            idTurno: self.turno.idTurno
                                        },
                                        success: function (response) {
                                            let paros = response.filter(f => f.IdTipoParoPerdida == self.constTipoParo.ParoMayor)
                                                .map(m => {
                                                    m.fechaInicio = new Date(m.dFechaHoraInicioLocal);
                                                    m.fechaFin = new Date(m.dFechaHoraFinLocal);
                                                    m.Duracion = ConversorHHMMSS_Segundos(m.duracion);
                                                    return m;
                                                });
                                            let perdidas = new Array();

                                            let perdidasData = response.filter(f => f.IdTipoParoPerdida == self.constTipoParo.PerdidaProduccion)
                                                .map(m => {
                                                    m.fechaInicio = new Date(m.dFechaHoraInicioLocal);
                                                    m.fechaFin = new Date(m.dFechaHoraFinLocal);
                                                    m.Duracion = ConversorHHMMSS_Segundos(m.strDuracionPerdidaProduccion);
                                                    return m;
                                                });

                                                //.group(({ idMaquinaResponsable }) => idMaquinaResponsable);

                                            for (let p of perdidasData) {
                                                let perdida = perdidas.find(f => f.idMaquinaResponsable == p.idMaquinaResponsable);
                                                if (perdida == null) {
                                                    p.id = -1;
                                                    perdidas.push(p);
                                                }
                                                else {
                                                    perdida.Duracion += p.Duracion
                                                    // Si alguna propiedad es distinta las dejamos en blanco
                                                    if (perdida.motivoId != p.motivoId) {
                                                        perdida.motivoId = null;
                                                        perdida.motivo = null;
                                                    }
                                                    if (perdida.causaId != p.causaId) {
                                                        perdida.causaId = null;
                                                        perdida.causa = null;
                                                    }
                                                    if (perdida.maquina != p.maquina) {
                                                        perdida.maquina = null;
                                                        perdida.descmaquina = null;
                                                    }
                                                    if (perdida.justificado != p.justificado) {
                                                        perdida.justificado = false;
                                                    }
                                                    if (perdida.fechaHoraUTC > p.fechaHoraUTC) {
                                                        perdida.fechaInicio = p.fechaInicio.addSecs(0);
                                                    }
                                                }
                                            }                                        

                                            operation.success(paros.concat(perdidas)); //mark the operation as successful
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
                                id: "id",
                                fields: {
                                    id: { type: "number", editable: false, nullable: false },
                                    IdTipoParoPerdida: { type: "number" },
                                    fechaInicio: { type: "date" },
                                    fechaFin: { type: "date" },
                                    maquina: { type: "string" },
                                    descmaquina: { type: "string" },
                                    idMaquinaResponsable: { type: "string" },
                                    nombreMaquinaResponsable: { type: "string" },
                                    descripcion: { type: "string" },
                                    observaciones: { type: "string" },
                                    Duracion: { type: "number" },
                                    motivoId: { type: "number" },
                                    motivo: { type:"string" },
                                    causaId: { type: "number" },
                                    causa: { type: "string" },
                                    justificado: { type: "bool" }
                                },
                            },
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_PAROS_PERDIDAS_TURNO'), 4000);
                            }
                        }
                    }),
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    scrollable: true,
                    selectable: true,
                    sortable: true,
                    pageable: false,
                    resizable: true,
                    height: 300,
                    columns: [                        
                        {
                            field: "justificado",
                            title: window.app.idioma.t("JUSTIFICADO"),
                            width: 80,
                            attributes: { style: "text-align: center;" },
                            template: function (registro) {
                                if (registro.justificado) return "<img src='img/check.png' width='25' height='27' alt='Justificado'/>";
                                else return "<img src='img/redball.png' width='25' height='25' alt='Justificado'/>";
                            },
                            filterable: false
                        },
                        {
                            field: "fechaInicio",
                            title: window.app.idioma.t("HORA"),
                            format: "{0:" + kendo.culture().calendar.patterns.MES_FechaHora + "}",
                            width: 140,
                            attributes: { style: "text-align: center;" },
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "IdTipoParoPerdida",
                            title: window.app.idioma.t("TIPO"),
                            template: "#= IdTipoParoPerdida == window.app.vista.vistaCrearACT.constTipoParo.ParoMayor ? window.app.idioma.t('PARO_MAYOR') : window.app.idioma.t('PERDIDAS_PRODUCCION') #",
                            width: 150,
                            attributes: { style: "text-align: center;" },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdTipoParoPerdida#' style='width: 14px;height:14px;margin-right:5px;'/>"+
                                        "# = IdTipoParoPerdida == window.app.vista.vistaCrearACT.constTipoParo.ParoMayor ? window.app.idioma.t('PARO_MAYOR') : window.app.idioma.t('PERDIDAS_PRODUCCION')#</label ></div > ";
                                    }
                                }
                            }
                        },
                        {
                            field: "descmaquina",
                            title: window.app.idioma.t("LLENADORA"),
                            width: 170,
                            attributes: { style: "text-align: center;" },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=descmaquina#' style='width: 14px;height:14px;margin-right:5px;'/>#= descmaquina#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Duracion",
                            title: window.app.idioma.t("DURACION"),
                            template: "#=ConversorHorasMinutosSegundos(Duracion)#",
                            width: 130,
                            attributes: { style: "text-align: center;" },
                            //format: "{0:HH:mm:ss}",
                            filterable: {
                                extra: false,
                                ui: function (element) {
                                    element.kendoTimePicker({
                                        format: "HH:mm:ss",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "motivo",
                            title: window.app.idioma.t("MOTIVO"),
                            //width: 80,
                            attributes: { style: "text-align: center;" },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=motivo#' style='width: 14px;height:14px;margin-right:5px;'/>#= motivo #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "causa",
                            title: window.app.idioma.t("CAUSA"),
                            //width: 80,
                            attributes: { style: "text-align: center;" },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=causa#' style='width: 14px;height:14px;margin-right:5px;'/>#= causa #</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "nombreMaquinaResponsable",
                            title: window.app.idioma.t("MAQUINA_RESPONSABLE"),
                            attributes: { style: "text-align: center;" },
                            filterable: false
                        },
                    ],
                    dataBound: function (e) {

                    },
                    change: function (e) {
                        if (e.sender.select().hasClass("k-state-previus-selected")) {
                            e.sender.tbody.find("tr").removeClass("k-state-previus-selected");
                            e.sender.select().removeClass("k-state-selected");
                        }
                        else {
                            e.sender.tbody.find("tr").removeClass("k-state-previus-selected")
                            e.sender.select().addClass("k-state-previus-selected");
                        }

                        self.onChangeParos(e.sender.select());
                    }
                });

                // Combo Maquina Responsable
                $("#cmbMaquinaResponsable").kendoDropDownList({
                    height: 450,
                    dataTextField: "Descripcion",
                    dataValueField: "CodigoMaquina",
                    dataSource: new kendo.data.DataSource({
                        transport: {
                            read: function (operation) {
                                if (self.idLinea) {
                                    $.ajax({
                                        url: "../api/MaquinasLinea/" + self.idLinea + "/",
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
                        }
                    }),
                    enable: true,
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                $("#tfResponsable").val(window.app.sesion?.attributes?.usuario);

                $("#btnDialogoGestionCancelar").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        self.window.close();
                    }
                });

                $("#btnDialogoGestionAceptar").kendoButton({
                    click: async  function (e) {
                        e.preventDefault();

                        $("#trError").html("");
                        $("#trError").hide();

                        if (self.turno == null || !self.turno.idTurno) {
                            $("#trError").html(window.app.idioma.t("SELECCIONAR_TURNO"));
                            $("#trError").show();
                            return;
                        }

                        let parosGrid = $("#gridParos").getKendoGrid();
                        let paroId = null;
                            
                        let paroSeleccionado = parosGrid.select();
                        if (paroSeleccionado.length) {
                            paroSeleccionado = parosGrid.dataItem(paroSeleccionado);
                            if (paroSeleccionado) {
                                paroId = paroSeleccionado.id;
                            }
                        }
                        else
                        {
                            paroSeleccionado = null;
                        }

                        let accion = {
                            TurnoId: self.turno.idTurno,
                            MaquinaId: $("#cmbMaquinaResponsable").getKendoDropDownList().value() || null,
                            ParoId: paroId,
                            Responsable: $("#tfResponsable").val(),
                            AccionRealizada: $("#tfAccionRealizada").val(),
                            Observaciones: $("#tfObservaciones").val()
                        }

                        kendo.ui.progress($("#divCrearAccionCorrectiva"), true);

                        try {
                            let res = await self.crearAccionCorrectiva(accion);
                            kendo.ui.progress($("#divCrearAccionCorrectiva"), false);

                            if (res == 0) {
                                // Cerramos ventana y llamamos al callback si existe
                                self.window.close();

                                if (self.callback) {
                                    self.callback();
                                }
                            } else if (res == 100) {
                                $("#trError").html(window.app.idioma.t("ERROR_CREAR_ACCION_CORRECTIVA_MANUAL_3_MAQUINAS"));
                                $("#trError").show();
                            } else {
                                $("#trError").html(window.app.idioma.t('ERROR_CREAR_ACCION_CORRECTIVA_MANUAL'));
                                $("#trError").show();
                            }                            
                        }
                        catch (err) {
                            kendo.ui.progress($("#divCrearAccionCorrectiva"), false);
                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CREAR_ACCION_CORRECTIVA_MANUAL'), 4000);
                            }
                        }
                    }
                });

                self.window = $(self.el).kendoWindow(
                    {
                        title: window.app.idioma.t('CREAR_ACCION_CORRECTIVA_TURNO'),
                        width: "1200px",
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
            onChangeParos: function (selected) {
                let maquinasDDL = $("#cmbMaquinaResponsable").getKendoDropDownList();
                if (selected.length == 0) {
                    maquinasDDL.enable(true);
                }
                else {
                    let grid = $("#gridParos").getKendoGrid();
                    let item = grid.dataItem(selected);
                    if (item) {
                        maquinasDDL.value(item.idMaquinaResponsable);
                    }
                    maquinasDDL.enable(false);
                }
            },
            crearAccionCorrectiva: async function (accion) {
                let self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "POST",
                        url: `../api/accionesCorrectivasTurno/`,
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(accion),
                        success: function (data) {
                            resolve(data);
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

    return vistaCrearAccionCorrectiva;
});