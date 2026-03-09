define(['underscore', 'backbone', 'jquery', 'kendoTimezones', 'text!../../../Envasado/html/PlanificadorWOCrear.html'
    , 'compartido/notificaciones', '../../../../Portal/js/constantes'],
    function (_, Backbone, $, kendoTimezones, plantilla, Not, enums) {
        var vistaPlanificadorCrear = Backbone.View.extend({
            tagName: 'div',
            id: 'divPlanificadorCrear',
            window: null,
            template: _.template(plantilla),
            constEstadosWO: enums.EstadosWOPlanificador(),
            initialize: function ({ parent, copy, callback }) {
                var self = this;

                self.padre = parent;
                self.copy = copy;
                self.callback = callback;

                this.render();
            },
            render: function () {
                var self = this;

                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template());

                let fechaInicio = self.copy ? new Date(self.copy.fechaFin.getTime()) : 
                    self.padre.sch.view().options.date.getMonday().midday();   

                // Dropdown lineas
                let lineasDS = new kendo.data.DataSource({
                    data: self.padre.datosMES.lineas.map(m => {
                        return {
                            Codigo: m.idLinea,
                            Descripcion: ObtenerLineaDescripcion(m.idLinea),
                            Color: m.color
                        }
                    })
                })

                $("#crearWO_inpt_linea").kendoDropDownList({
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    dataSource: lineasDS,
                    template: $("#lineasDDLtemplate").html(),
                    valueTemplate: $("#lineasDDLtemplate").html(),
                    dataValueField: "Codigo",
                    dataTextField: "Descripcion",
                    dataBound: function (e) {
                        if (self.copy) {
                            e.sender.value(self.copy.idLinea);
                            setTimeout(() => {
                                e.sender.trigger("change");
                            })
                        }
                    },
                    change: function (e) {
                        $("#crearWO_inpt_producto").getKendoDropDownList().dataSource.read();
                    }
                });

                let productosDS = new kendo.data.DataSource({
                    transport: {
                        read: function (operation) {
                            let idLinea = $("#crearWO_inpt_linea").getKendoDropDownList().value();
                            if (idLinea) {
                                $.ajax({
                                    url: "../api/ObtenerProductosLinea/" + idLinea + "/",
                                    dataType: "json",
                                    success: function (response) {
                                        let resMap = response.map(m => {
                                            return {
                                                Codigo: m.codigo,
                                                Descripcion: m.codigo + " - " + m.nombre + " - " + m.tipoProducto.nombre,
                                                UOM: m.udMedida,
                                                Nombre: m.nombre
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

                $("#crearWO_inpt_producto").kendoDropDownList({
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    dataSource: productosDS,
                    autoBind: false,
                    dataValueField: "Codigo",
                    dataTextField: "Descripcion",
                    dataBound: function (e) {
                        let inptCajas = $("#crearWO_inpt_cantidadCajas").getKendoNumericTextBox();
                        e.sender._old = null
                        inptCajas.enable(false);
                        inptCajas.value(null);
                        $("#crearWO_inpt_cantidadCajas").data("CBP", 0);
                        $("#lbl_envases").html("");
                        $("#lbl_envases").data("EBP", 0);

                        if (self.copy) {
                            e.sender.value(self.copy.idProducto);
                            e.sender.trigger("change");
                            setTimeout(() => {
                                let paletsInpt = $("#crearWO_inpt_cantidadPalets").getKendoNumericTextBox();
                                paletsInpt.value(self.copy.cantidad);
                                paletsInpt.trigger("change");
                            })                            
                        }
                    },
                    change: function (e) {
                        // Relaciones del producto
                        let idProducto = e.sender.value();
                        let palets = $("#crearWO_inpt_cantidadPalets").getKendoNumericTextBox().value();
                        let inptCajas = $("#crearWO_inpt_cantidadCajas").getKendoNumericTextBox();
                        let inptHL = $("#crearWO_inpt_cantidadHectolitros").getKendoNumericTextBox();
                        if (idProducto && palets) {
                            let rel = self.padre.datosMES.relacionEnvasesProductos.datos.find(f => f.idProducto == idProducto);
                            let cajas = 0;
                            let hls = 0;
                            if (!rel) {
                                rel = self.padre.datosMES.relacionEnvasesProductos.defecto;
                            }

                            $("#lbl_envases").html(palets * rel.envasesPorPalet);
                            $("#lbl_envases").data("EBP", rel.envasesPorPalet);

                            $("#crearWO_inpt_cantidadHectolitros").data("HL", rel.hectolitrosEnvase);
                            hls = palets * rel.envasesPorPalet * rel.hectolitrosEnvase;
                            inptHL.value(hls);

                            if (rel.contenedoresPorPalet) {
                                inptCajas.enable(true);
                                cajas = palets * rel.contenedoresPorPalet;
                                inptCajas.value(cajas);
                                $("#crearWO_inpt_cantidadCajas").data("CBP", rel.contenedoresPorPalet);
                                // Recalculamos fechaFin
                                self.recalcularFechaFin();
                                return;
                            }
                        }
                        else {
                            $("#lbl_envases").html("");
                        }

                        inptCajas.enable(false);
                        inptCajas.value(null);
                        $("#crearWO_inpt_cantidadCajas").data("CBP", 0);

                        // Recalculamos fechaFin
                        self.recalcularFechaFin();
                    }
                });

                // Input cantidades
                $("#divPlanificadorCrear").find("[data-role='numerictextbox']").kendoNumericTextBox({
                    decimals: 0,
                    min: 1,
                    format: "n0",
                    restrictDecimals: true,
                    change: function (e) {
                        let val = e.sender.value();
                        let palets = 0;
                        $("#lbl_envases").html();
                        $("#crearWO_inpt_cantidadPalets").getKendoNumericTextBox().value(1);
                        $("#crearWO_inpt_cantidadCajas").getKendoNumericTextBox().value(null);
                        $("#crearWO_inpt_cantidadHectolitros").getKendoNumericTextBox().value(null);
                        let EBP = $("#lbl_envases").data("EBP");
                        let CPB = $("#crearWO_inpt_cantidadCajas").data("CBP");
                        let HL = $("#crearWO_inpt_cantidadHectolitros").data("HL");

                        if (!val) {
                            return;
                        }

                        if ($(e.sender.element).attr("id").includes("Palet")) {
                            palets = val;
                        }
                        else if ($(e.sender.element).attr("id").includes("Caja")) {
                            palets = Math.round(val / CPB);
                        }
                        else {
                            palets = Math.round(val / HL / EBP);
                        }

                        $("#crearWO_inpt_cantidadPalets").getKendoNumericTextBox().value(palets);
                        if (CPB) {
                            $("#crearWO_inpt_cantidadCajas").getKendoNumericTextBox().value(palets * CPB);
                        }
                        if (EBP) {
                            $("#lbl_envases").html(palets * EBP);
                            if (HL) {
                                $("#crearWO_inpt_cantidadHectolitros").getKendoNumericTextBox().value(palets * EBP * HL);
                            }
                        }

                        // Recalculamos fechaFin
                        self.recalcularFechaFin();
                    }
                });

                //Datepicker inicio
                $("#crearWO_inpt_fechaInicioWO").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: fechaInicio,
                    change: function (e) {
                        self.recalcularFechaFin();
                    }
                });

                //Datepicker fin
                $("#crearWO_inpt_fechaFinWO").kendoDateTimePicker({
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    value: fechaInicio.addHours(1),
                    change: function (e) {
                        self.recalcularCantidad();
                    }
                });

                if (self.copy) {
                    $("#crearWO_inpt_descripcion").val(self.copy.notas);
                }

                $("#btnCrearWOCancelar").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        self.window.close();
                    }
                });

                $("#btnCrearWOAceptar").kendoButton({
                    click: function (e) {
                        e.preventDefault();

                        $("#trError").html("");
                        $("#trError").hide();

                        if (!ValidarFormulario("crearWOForm")) {
                            $("#trError").html(ObtenerCamposObligatorios("crearWOForm"));
                            $("#trError").show();
                            return;
                        }

                        if (self.padre.recalculandoFechaFin()) {
                            $("#trError").html(window.app.idioma.t('RECALCULANDO_FECHA_FIN_WO'));
                            $("#trError").show();
                            return;
                        }
                        if ($("#crearWO_inpt_fechaInicioWO").getKendoDateTimePicker().value().getTime() >=
                            $("#crearWO_inpt_fechaFinWO").getKendoDateTimePicker().value().getTime()) {
                            $("#trError").html(window.app.idioma.t("ERROR_FECHA_FIN_MENOR_INICIO"));
                            $("#trError").show();
                            return;
                        }

                        // Cerramos ventana y llamamos al callback si existe

                        if (self.callback) {
                            self.callback(self.crearWO());
                        }

                        self.window.close();
                    }
                });

                $("#crearWO_inpt_producto").getKendoDropDownList().open();
                $("#crearWO_inpt_producto").getKendoDropDownList().close();
                //let maxHeight = $("#center-pane").outerHeight() * 0.8;

                self.window = $(self.el).kendoWindow(
                    {
                        title: self.copy ? window.app.idioma.t("COPIAR") + " " + window.app.idioma.t("WO") : window.app.idioma.t("CREAR_WO"),
                        //maxHeight: maxHeight,
                        modal: true,
                        resizable: false,
                        close: function () {
                            if (self.padre.cancelarCalcularFechaFin != undefined) {
                                self.padre.cancelarCalcularFechaFin();
                            }
                            self.window.destroy();
                            self.window = null;
                            self.eliminar();
                        },
                    }).data("kendoWindow");

                self.window.center();

            },
            recalcularFechaFin: async function () {
                let self = this;

                if (self.padre.recalcularFechaFin != undefined) {
                    let idLinea = $("#crearWO_inpt_linea").getKendoDropDownList().value();                    
                    let idProducto = $("#crearWO_inpt_producto").getKendoDropDownList().value();
                    let cantidad = $("#crearWO_inpt_cantidadPalets").getKendoNumericTextBox().value();
                    let fechaInicio = $("#crearWO_inpt_fechaInicioWO").getKendoDateTimePicker().value();

                    if (idLinea && idProducto && cantidad && fechaInicio) {
                        let fechaFinInpt = $("#crearWO_inpt_fechaFinWO").getKendoDateTimePicker();

                        fechaFinInpt.value(null);
                        $("#btnCrearWOAceptar").getKendoButton().enable(false);
                        $("#fechaFinProgress").show();

                        let fechaFin = await self.padre.recalcularFechaFin(idLinea, idProducto, cantidad, fechaInicio);
                        fechaFinInpt.value(fechaFin);

                        $("#btnCrearWOAceptar").getKendoButton().enable(true);
                        $("#fechaFinProgress").hide();
                    }
                }
            },
            recalcularCantidad: async function () {
                let self = this;

                if (self.padre.recalcularCantidad != undefined) {
                    let idLinea = $("#crearWO_inpt_linea").getKendoDropDownList().value();                    
                    let idProducto = $("#crearWO_inpt_producto").getKendoDropDownList().value();
                    let fechaInicio = $("#crearWO_inpt_fechaInicioWO").getKendoDateTimePicker().value();
                    let fechaFin = $("#crearWO_inpt_fechaFinWO").getKendoDateTimePicker().value();

                    if (idLinea && idProducto && fechaInicio && fechaFin) {
                        let cantidadInpt = $("#crearWO_inpt_cantidadPalets").getKendoNumericTextBox();

                        let cantidad = await self.padre.recalcularCantidad(idLinea, idProducto, fechaInicio, fechaFin);
                        cantidadInpt.value(cantidad);
                        cantidadInpt.trigger("change");

                    }
                }
            },
            crearWO: function () {
                let self = this;

                let idLinea = $("#crearWO_inpt_linea").getKendoDropDownList().value();
                let idProducto = $("#crearWO_inpt_producto").getKendoDropDownList().value();
                let descProducto = $("#crearWO_inpt_producto").getKendoDropDownList().dataItem().Nombre;
                let uom = $("#crearWO_inpt_producto").getKendoDropDownList().dataItem().UOM;
                let cantidadPalets = $("#crearWO_inpt_cantidadPalets").getKendoNumericTextBox().value();
                let fechaInicioWO = $("#crearWO_inpt_fechaInicioWO").getKendoDateTimePicker().value();
                let fechaFinWO = $("#crearWO_inpt_fechaFinWO").getKendoDateTimePicker().value();
                //let notas = CodificarEnHTML($("#crearWO_inpt_descripcion").val());
                let notas = $("#crearWO_inpt_descripcion").val();

                let date = new Date().inUTC();
                let id = '0' + date.getFullYear().toString().slice(2)
                    + date.getMonth()
                    + date.getDate()
                    + ((((date.getHours() * 60)
                        + date.getMinutes()) * 60)
                        + date.getSeconds()).toString()
                    + date.getMilliseconds().toString().slice(0, 1);

                let wo = {
                    IdManual: id,
                    CodigoOriginal: id,
                    FechaInicioPlanificada: fechaInicioWO,
                    FechaFinPlanificada: fechaFinWO,
                    IdProducto: idProducto,
                    DescripcionProducto: descProducto,
                    Cantidad: cantidadPalets,
                    CantidadOriginal: cantidadPalets,
                    UOM: uom,
                    IdLinea: idLinea,
                    LineasProducto: [idLinea],
                    IdEstadosWO: self.constEstadosWO.Planificada,
                    Descripcion: notas,
                }

                return wo;
            },
            eliminar: function () {
                this.remove();
            }
        });

        return vistaPlanificadorCrear;
    });