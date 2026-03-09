define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/vpAsociarLotePlantilla.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion', 'definiciones'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, Session,definiciones) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            tagName: 'div',
            id: 'divAsociarLotes',
            PlantillaSeleccionada: {},
            dsLotes: null,
            window: null,
            dialog: null,
            lotesSeleccionados: null,
            politicaVaciadoEnum: definiciones.PoliticaVaciado(),
            //#endregion ATTRIBUTES

            initialize: function (plantilla) {
                var self = this;


                self.PlantillaSeleccionada = plantilla;

                self.dsLotes = new kendo.data.DataSource({
                    async: true,
                    autoBind: true,
                    transport: {
                        read: {
                            url: "../api/plantillaConsumoMMPP/ObtenerLotesAsociados/" + self.PlantillaSeleccionada.id + "/" + self.PlantillaSeleccionada.IdUbicacionOrigen + "/" + self.PlantillaSeleccionada.CodigoJDE,
                            dataType: "json"
                        },
                    },
                    pageSize: 200,
                    schema: {
                        model: {
                            id: "IdLoteMateriaPrima",
                            fields: {
                                'IdLoteMateriaPrima': { type: "string" },
                                'IdLoteMES': { type: "string" },
                                'Asociado': { type: "bool" },
                                'CantidadInicial': { type: "number" },
                                'CantidadActual': { type: "number" },
                                'Unidad': { type: "string" },
                                'FechaEntradaUbicacion': { type: "date" },
                                'Orden': { type: "number" },
                                'IdPoliticaVaciado': { type: "number" },
                                'FechaCaducidad': { type: "date" },
                                'HabilitarSeleccion': { type: "bool" },
                                'LoteProveedor': { type: "string" }
                            }
                        }
                    },
                    requestEnd: function (e) {
                        var response = e.response;
                        if (e.type == "read") {
                            var grid = $("#gridAsociarLote").data("kendoGrid");
                            self.habilitarFilasPorPoliticaVaciado(response, self);
                            grid.dataSource.sync();
                        }
                    }

                });

                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.window = $(self.el).kendoWindow(
                    {
                        title: self.PlantillaSeleccionada.Descripcion + " / " + self.PlantillaSeleccionada.NombreUbicacion + " / " + self.PlantillaSeleccionada.CodigoJDE,
                        width: "60%",
                        height: "80%",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        actions: ["Close"],
                        close: function () {
                            self.window.destroy();
                            self.window = null;
                        },
                    }).data("kendoWindow");

                self.dialog = $('#divAsociarLotes').data("kendoWindow");
                self.dialog = self.window;
                self.dialog.center();

                $("#gridAsociarLote").kendoGrid({
                    toolbar: kendo.template($("#template").html()),
                    dataSource: self.dsLotes,
                    sortable: true,
                    noRecords: {
                        template: window.app.idioma.t('NOREGISTROS_LOTESASOCIADOS_MATERIAL_UBICACION')
                    },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [200, 500, 1000,'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            template: "<input class='checkBoxLoteAsociado'    type='checkbox' id='#=IdLoteMateriaPrima#'  #= Asociado ? \"checked='checked'\" : '' # #= !HabilitarSeleccion ? \"disabled='disabled'\" : '' #/>",
                            width: 50
                        },
                        {
                            title: window.app.idioma.t("ORDEN"),
                            field: 'Orden',
                            attributes: { "align": "center" },
                            width: 50,
                            template: "#= Orden != null ? Orden : '' #"
                        },
                        {
                            title: window.app.idioma.t("LOTE_MES"),
                            field: 'IdLoteMES',
                            attributes: { "align": "center" },
                            width: 350
                        },
                        {
                            title: window.app.idioma.t("LOTE_PROVEEDOR"),
                            field: 'LoteProveedor',
                            attributes: { "align": "center" },
                            width: 150
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_INICIAL"),
                            field: 'CantidadInicial',
                            attributes: { "align": "center" },
                            width: 100,
                            template: '#= kendo.format("{0:n2}",CantidadInicial)#',
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_ACTUAL"),
                            field: 'CantidadActual',
                            attributes: { "align": "center" },
                            width: 100,
                            template: '#= kendo.format("{0:n2}",CantidadActual)#',
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n2}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("UNIDAD"),
                            field: 'Unidad',
                            attributes: { "align": "center" },
                            width: 50
                        },
                        {
                            title: window.app.idioma.t("FECHA_ENTRADA_UBICACION"),
                            field: 'FechaEntradaUbicacion',
                            attributes: { "align": "center" },
                            width: 150,
                            format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                            template: "#=  FechaEntradaUbicacion ? kendo.toString(FechaEntradaUbicacion, '" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "'):  ' '  #",
                        },
                        {
                            title: window.app.idioma.t("FECHA_CADUCIDAD"),
                            field: 'FechaCaducidad',
                            attributes: { "align": "center" },
                            width: 150,
                            format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                            template: "#=  FechaCaducidad ? kendo.toString(FechaCaducidad, '" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "'):  ' '  #",
                        }

                    ],
                    dataBound: function () {
                        toggleAll = self.toggleAll;
                        var data = this.dataSource.data();
                        if (data.length == 0) {
                            $('#gridAsociarLote .k-grid-toolbar').hide();
                        } else {
                            $('#gridAsociarLote .k-grid-toolbar').show();
                        }
                    }
                });
            },
            clickCheckBox: function (e,self) {
                e.preventDefault();
                var grid = $("#gridAsociarLote").data("kendoGrid");
                var tr = $(e.target).closest("tr"); 
                var data = grid.dataItem(tr);

                if (e.target.checked) {
                    var dataGrid = $("#gridAsociarLote").data("kendoGrid").dataSource.data();
                    var arrayOrden = dataGrid.map(function (item) { return item.Orden != null ? parseInt(item.Orden): 0 });
                    data.Asociado = true;
                    data.Orden = Math.max.apply(Math, arrayOrden) + 1;
                    self.reordenarLotesSeleccionados(self);
                }
                else {
                    data.Asociado = false;
                    data.Orden = null;
                    self.reordenarLotesSeleccionados(self);
                }

                self.habilitarFilasPorPoliticaVaciado(grid.dataSource.data(), self);
                grid.dataSource.sync();
            },
            reiniciarSeleccion: function () {
                self = this;

                $("#gridAsociarLote").data("kendoGrid").dataSource.read();
            },
            //#region EVENTOS
            events: {
                "click #btnReiniciarSeleccion": function () { var self = this; self.reiniciarSeleccion(self); },
                "click #btnAceptar": function () { var self = this; this.guardarLotesAsociadas(self); },
                "change .checkBoxLoteAsociado": function (e) { var self = this; this.clickCheckBox(e,self);}
            },
            //#endregion EVENTOS
            habilitarFilasPorPoliticaVaciado: function (data,self)
            {
                if (data) {
                    data.forEach(function callback(item, index, array) {
                        if (item) {
                            if (item.IdPoliticaVaciado == self.politicaVaciadoEnum.FIFO ||
                                item.IdPoliticaVaciado == self.politicaVaciadoEnum.LIFO ||
                                item.IdPoliticaVaciado == self.politicaVaciadoEnum.FEFO) {
                                var filaSiguiente = array[index + 1];
                                if (item.Asociado) {
                                    if (filaSiguiente)
                                        filaSiguiente.HabilitarSeleccion = true;
                                } else {

                                    if (filaSiguiente) {
                                        filaSiguiente.HabilitarSeleccion = false;
                                        filaSiguiente.Orden = null;
                                        filaSiguiente.Asociado = false;
                                        self.eliminarLoteSeleccionadoPorId(self, filaSiguiente.IdLoteMateriaPrima);
                                    }
                                }
                            }
                        }
                    });
                }
               

            },
            eliminarLoteSeleccionadoPorId: function (self, id) {
                if (self.lotesSeleccionados) {
                    self.lotesSeleccionados = self.lotesSeleccionados.filter(function (item) {

                        return item.IdLoteMateriaPrima != id;
                    });
                } 
            },
            reordenarLotesSeleccionados: function (self)
            {
                var lotesSeleccionados = self.obtenerLotesSeleccionados();
                var dataGrid = $("#gridAsociarLote").data("kendoGrid").dataSource.data();

                var dataGriFilter = dataGrid.filter(item => {
                    var _itemSelect = lotesSeleccionados.filter(function (id) { return id == item.IdLoteMateriaPrima });
                    if (_itemSelect.length > 0)
                        return item;
                });

                var sortedObjs = _.sortBy(dataGriFilter, 'Orden');
                var cont = 1;

                sortedObjs.forEach(function (item) {
                    item.Orden = cont++;
                });

                self.lotesSeleccionados = sortedObjs;

            },
            guardarLotesAsociadas: function (self) {
                self.reordenarLotesSeleccionados(self);
                self.confirmarGuardado(self);
            },
            confirmarGuardado: function (self) {
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ASOCIAR_DESASOCIAR_LOTES'),
                    msg: window.app.idioma.t('DESEA_REALMENTE_ASIGNAR_LOTES_PLANTILLA'),
                    funcion: function () {
                        self.actualizarPlantillaLotes(self);
                        Backbone.trigger('eventCierraDialogo');
                    },
                    contexto: this
                });
            },
            actualizarPlantillaLotes: function (self) {
                var dataItem = {};
                dataItem.IdPlantillaConsumo = self.PlantillaSeleccionada.id;
                dataItem.LotesMateriaPrima = _.map(self.lotesSeleccionados, function (item) {
                    return {
                        IdLoteMateriaPrima: parseInt(item.IdLoteMateriaPrima),
                        Orden: item.Orden
                    } });

                $.ajax({
                    type: 'PUT',
                    data: JSON.stringify(dataItem),
                    async: true,
                    dataType: "json",
                    contentType: 'application/json; charset=utf-8',
                    url: '../api/plantillaConsumoMMPP/ActualizarPlantillaLotesAsociados',
                    success: function (result) {
                        if (result) {
                            $("#gridPlantillasConsumosMMPP").data("kendoGrid").dataSource.read();
                            self.window.close();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('LOTES_ASOCIADOS_CORRECTAMENTE'), 4000);
                        }
                        else
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACTUALIZAR_LOTES_ASOCIADOSPLANTILLAS'), 4000);
                    },
                    error: function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ACTUALIZAR_LOTES_ASOCIADOSPLANTILLAS'), 4000);
                    }

                });
            },
            obtenerLotesSeleccionados: function () {
                var LotesSeleccionadas = [];

                $('#gridAsociarLote input[type=checkbox]:checked').each(function () {
                    var id = $(this).attr("id");
                    if (id) {
                        if (LotesSeleccionadas.indexOf(id) === -1) {
                            LotesSeleccionadas.push(id);
                        }
                    }
                });

                return LotesSeleccionadas;

            },

            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

