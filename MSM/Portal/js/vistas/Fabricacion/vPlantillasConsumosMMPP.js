define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/PlantillasConsumosMMPP.html',
    'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion', 'vistas/Almacen/vSeleccionarUbicacion',
    'vistas/Fabricacion/vPlantillasConsumosMMPP_Ubicaciones', 'vistas/Fabricacion/vPlantillasConsumosMMPP_TipoSemielaborado'
    , 'vistas/Fabricacion/vPlantillasConsumosMMPP_DisparadorKOP', 'vistas/Fabricacion/vPlantillasConsumosMMPP_DisparadorTransferencia', 'vistas/Fabricacion/vPlantillasConsumosMMPP_AsociarLotes', 'definiciones'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, Session, vSeleccionarUbicacion, vListadoUbicaciones, vListadoTipoSemielaborado, vDisparadorKOP,
        vDisparadorTransferencia, vAsociarLotes, definiciones) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            dsPlantillas: null,
            gridUbicacionesPlantillas: "contentUbicacionesPlantillas",
            gridTipoSemielaboradoPlantillas: "contentTipoSemielaboradoPlantillas",
            gridDisparadorKOP: "contentDisparadorPlantillaKOP",
            gridDisparadorTransferencia: "contentDisparadorPlantillaTransferencia",
            tiposDisparadores: definiciones.TipoDisparadorConsumoMMPP(),
            modoDescuentoEnum: definiciones.ModoDescuentoConsumoMMPP(),
            tipoWO: definiciones.TipoWO(),
            idPlantillaSeleccionada: null,
            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;

                self.dsPlantillas = new kendo.data.DataSource({
                    async: true,
                    transport: {
                        read: {
                            url: "../api/plantillaConsumoMMPP/ObtenerPlantillasConsumosMMPP",
                            dataType: "json"
                        },
                        create: {
                            url: "../api/plantillaConsumoMMPP/Create",
                            dataType: "json",
                            type: "POST",
                            contentType: "application/json; charset=utf-8",
                        },
                        update: {
                            url: "../api/plantillaConsumoMMPP/Update",
                            dataType: "json",
                            type: "PUT",
                            contentType: "application/json; charset=utf-8",
                        },
                        destroy: {
                            url: "../api/plantillaConsumoMMPP/Delete",
                            dataType: "json",
                            type: "DELETE",
                            contentType: "application/json; charset=utf-8",
                        },
                        parameterMap: function (options, operation) {
                            if (operation != "read") {
                                if (operation == "destroy")
                                    return JSON.stringify(options);

                                var model = self.ModeloPlantilla(options);
                                if (model)
                                    return JSON.stringify(model);
                                else
                                    return false;
                            }
                        },
                    },
                    requestEnd: function (e) {
                        if (e.type == "destroy" || e.type == "create" || e.type == "update") {
                            var grid = $("#gridPlantillasConsumosMMPP").data("kendoGrid");
                            grid.dataSource.read();
                        }
                    },
                    sort: { field: "Descripcion", dir: "asc" },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "IdPlantillaConsumo",
                            fields: {
                                'IdPlantillaConsumo': { type: "number" },
                                'Descripcion': { type: "string", validation: { required: true } },
                                'IdTipoWO': { type: "number" },
                                'DescTipoWO': { type: "string" },
                                'CantidadTeorica': { type: "number" },
                                'ValorMinimoRequerido': {
                                    type: "number", validation: {
                                        required: true,
                                        minimoRequeridovalidation: function (input) {
                                            if (input.is("[name='ValorMinimoRequerido']") && input.val() != "") {
                                                input.attr("data-minimoRequeridovalidation-msg", window.app.idioma.t('VALIDACION_VALOR_MINIMO_REQUERIDO'));
                                                var row = input.closest("tr");
                                                var grid = row.closest("[data-role=grid]").data("kendoGrid");
                                                var dataItem = grid.dataItem(row);
                                                if (dataItem.ValorMaximoRequerido) {
                                                    if (dataItem.ValorMaximoRequerido <= parseFloat(input.val())) {
                                                        return false;
                                                    }
                                                }



                                            }
                                            return true;
                                        }
                                    }
                                },
                                'ValorMaximoRequerido': {
                                    type: "number", validation: {
                                        required: true,
                                        maximoRequeridovalidation: function (input) {
                                            if (input.is("[name='ValorMaximoRequerido']") && input.val() != "") {
                                                input.attr("data-maximoRequeridovalidation-msg", window.app.idioma.t('VALIDACION_VALOR_MAXIMO_REQUERIDO'));
                                                var row = input.closest("tr");
                                                var grid = row.closest("[data-role=grid]").data("kendoGrid");
                                                var dataItem = grid.dataItem(row);
                                                if (dataItem.ValorMinimoRequerido) {
                                                    if (dataItem.ValorMinimoRequerido >= parseFloat(input.val())) {
                                                        return false;
                                                    }
                                                }




                                            }
                                            return true;
                                        }
                                    }
                                },
                                'CantidadTeorica': { type: "number" },
                                'CodigoJDE': { type: "string" },
                                'IdTipoDisparadorConsumo': { type: "number" },
                                'DescTipoDisparador': { type: "string" },
                                'Unidad': { type: "string" },
                                'IdModoDescuento': { type: "number" },
                                'DescModoDescuento': { type: "string" },
                                'IdUbicacionOrigen': { type: "string" },
                                'NombreUbicacion': { type: "string", validation: { required: true } },
                                'DescripcionUbicacion': { type: "string" },
                                'IdIndicadorMMPPAsignadas': { type: "string", editable: false },
                                'Activa': { type: "boolean", validation: { required: true } },
                            }
                        }
                    }
                });


                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                $("#plantillasConsumosVerticalSplitter").kendoSplitter({
                    orientation: "vertical",
                    panes: [
                        { collapsible: false, size: "50%" },
                        { collapsible: false, size: "50%" }
                    ]
                });

                $("#splitterHorizontal").kendoSplitter({
                    orientation: "horizontal",
                    panes: [
                        { collapsible: false, size: "20%" },
                        { collapsible: false, size: "30%" },
                        { collapsible: false, size: "25%" },
                        { collapsible: false, size: "25%" }
                    ]
                });



                $("#gridPlantillasConsumosMMPP").kendoGrid({
                    dataSource: self.dsPlantillas,
                    sortable: true,
                    resizable: true,
                    selectable: "row",
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    toolbar: [
                        {
                            template: "<label>" + window.app.idioma.t('PLANTILLAS') + "</label>"
                        },
                        {
                            name: "create", text: window.app.idioma.t("AGREGAR")
                        }
                    ],
                    change: function (e) {
                        e.preventDefault();
                        var grid = $("#gridPlantillasConsumosMMPP").data("kendoGrid");
                        var selectedItem = grid.dataItem(grid.select());
                        if (selectedItem != null) {
                            self.SeleccionaPlantilla(self, selectedItem);

                            self.idPlantillaSeleccionada = selectedItem.IdPlantillaConsumo;
                        }

                    },
                    edit: function () {
                        $("#btnAsociarDisparadorTransferencia").hide();
                        $("#btnAsociarDisparadorKOP").hide();
                        $("#gridPlantillasConsumosMMPP").data("kendoGrid").select(".k-grid-edit-row");



                    },
                    dataBound: function (e) {
                        var row = $("#gridPlantillasConsumosMMPP").data("kendoGrid").dataSource.get(self.idPlantillaSeleccionada);

                        if (row) {
                            rowsSelected = $("#gridPlantillasConsumosMMPP").data("kendoGrid").tbody.find("tr[data-uid='" + row.uid + "']");
                            $("#gridPlantillasConsumosMMPP").data("kendoGrid").select(rowsSelected);
                        } else {
                            self.SeleccionaPlantilla(self, null);
                        }
                    },
                    columns: [
                        {
                            title: " ",
                            field: 'IdIndicadorMMPPAsignadas',
                            width: 50,
                            attributes: {
                                style: "text-align:center;"
                            },
                            template: function (item) {
                                return "<div class='circle_cells' style='background-color:" + item.ColorIndicador + ";'/>";
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdIndicadorMMPPAsignadas#' style='width: 14px;height:14px;margin-right:5px;'/><img id='ColorIndicador' style='width: 11px; height: 11px; vertical-align: initial;margin-right: 3px; background-color:#=ColorIndicador#;'></img>#=DescIndicador#</label></div>";
                                    }
                                }
                            },
                        },

                        {
                            title: window.app.idioma.t("NOMBRE"),
                            field: 'Descripcion',
                            template: "<span class='addTooltip'>#=Descripcion#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            width: 250
                        },
                        {
                            title: window.app.idioma.t("TIPO_ORDEN"),
                            field: 'DescTipoWO',
                            width: 150,
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            template: "<span class='addTooltip'>#=DescTipoWO#</span>",
                            editor: function (e, options) { return self.TipoOrdenDropDownList(e, options) },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=DescTipoWO#' style='width: 14px;height:14px;margin-right:5px;'/>#=DescTipoWO#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            title: window.app.idioma.t("MATERIAL"),
                            field: 'CodigoJDE',
                            width: 80,
                            template: "<span class='addTooltip'>#=CodigoJDE#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            editor: function (e, options) { return self.MaterialDropDownEditor(e, options) }
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_TEORICA"),
                            field: 'CantidadTeorica',
                            width: 80,
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            editor: function (e, options) { return self.CantidadTeoricaNumericTextBox(e, options) },
                            template: '<span class="addTooltip">#= kendo.format("{0:n2}",CantidadTeorica)#</span>',
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
                            title: window.app.idioma.t("UNIDADES"),
                            field: 'Unidad',
                            width: 50,
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            template: "<span class='addTooltip'>#=Unidad#</span>",
                            editor: function (e, options) { return self.UnidadMedidaDropDownEditor(e, options) },
                        },
                        {
                            title: window.app.idioma.t("TIPO_DISPARADOR"),
                            field: 'DescTipoDisparador',
                            template: "<span class='addTooltip'>#=DescTipoDisparador#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            width: 150,
                            editor: function (e, options) { return self.TipoDisparadorDropDownEditor(e, options) },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=DescTipoDisparador#' style='width: 14px;height:14px;margin-right:5px;'/>#=DescTipoDisparador#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            title: window.app.idioma.t("MODO_DESCUENTO"),
                            field: 'DescModoDescuento',
                            template: "<span class='addTooltip'>#=DescModoDescuento#</span>",
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            width: 150,
                            editor: function (e, options) { return self.ModoDescuentoDropDownEditor(e, options) },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=DescModoDescuento#' style='width: 14px;height:14px;margin-right:5px;'/>#=DescModoDescuento#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            title: window.app.idioma.t("UBICACION_ORIGEN"),
                            field: 'NombreUbicacion',
                            width: 200,
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            template: "<span class='addTooltip'>#=NombreUbicacion#</span>",
                            editor: function (e, options) { return self.UbicacionButton(e, options) },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field === "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=NombreUbicacion#' style='width: 14px;height:14px;margin-right:5px;'/>#=NombreUbicacion#</label></div>";
                                    }
                                }
                            }

                        },
                        {
                            title: window.app.idioma.t("VALOR_MINIMO_REQUERIDO"),
                            field: 'ValorMinimoRequerido',
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            width: 150,
                            template: '<span class="addTooltip">#= kendo.format("{0:n2}",ValorMinimoRequerido)#</span>',
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
                            title: window.app.idioma.t("VALOR_MAXIMO_REQUERIDO"),
                            field: 'ValorMaximoRequerido',
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            width: 150,
                            template: '<span class="addTooltip">#= kendo.format("{0:n2}",ValorMaximoRequerido)#</span>',
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
                            title: window.app.idioma.t("ACTIVO"),//fichero idiomas
                            field: 'Activa',
                            attributes: { "align": "center", style: 'white-space: nowrap ' },
                            width: 150,
                            template: function (e, options) { return self.EstadoTemplate(e, options) },
                            editor: function (e, options) { return self.EstadoActivoDropDownList(e, options) }
                        },
                        {
                            command: [
                                {
                                    name: "edit",
                                    text: { edit: "", update: window.app.idioma.t('GUARDAR'), cancel: window.app.idioma.t('CANCELAR') }
                                },
                                //{ name: "destroy", text: "Eliminar" }
                                {
                                    name: "Delete", text: window.app.idioma.t('ELIMINAR'),
                                    click: function (e) {  //add a click event listener on the delete button
                                        e.preventDefault(); //prevent page scroll reset

                                        var grid = $("#gridPlantillasConsumosMMPP").data("kendoGrid");
                                        var tr = $(e.target).closest("tr"); //get the row for deletion
                                        var data = this.dataItem(tr); //get the row data so it can be referred later

                                        this.confirmacion = new VistaDlgConfirm({
                                            titulo: window.app.idioma.t('ELIMINAR_PLANTILLA_CONSUMO'), msg: window.app.idioma.t('DESEA_REALMENTE_ELIMINAR_PLANTILLA_CONSUMO'), funcion: function () {
                                                grid.dataSource.remove(data)  //prepare a "destroy" request
                                                grid.dataSource.sync()  //actually send the request (might be ommited if the autoSync option is enabled in the dataSource)
                                                Backbone.trigger('eventCierraDialogo');
                                            }, contexto: this
                                        });
                                    }
                                },
                                {
                                    name: "asociarLote",
                                    text: window.app.idioma.t('ASOCIAR_DESASOCIAR_LOTES'),
                                    click: function (e) { return self.AsociarLotes(e, self); }
                                }
                            ],
                            title: " ",
                            width: 350
                        },],
                    editable: {
                        mode: "inline"
                    }
                });


                new vListadoUbicaciones(self.gridUbicacionesPlantillas);
                new vListadoTipoSemielaborado(self.gridTipoSemielaboradoPlantillas);
                new vDisparadorKOP(self.gridDisparadorKOP);
                new vDisparadorTransferencia(self.gridDisparadorTransferencia);
                self.resizeSplitter();

                $("#gridPlantillasConsumosMMPP").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

            },

            //#region EVENTOS
            events: {
                "click #btnSeleccionarUbicacion": 'SeleccionarUbicacion'
            },
            AsociarLotes: function (e, self) {
                e.preventDefault();
                var dataItem = $("#gridPlantillasConsumosMMPP").data("kendoGrid").dataItem($(e.currentTarget).closest("tr"));
                new vAsociarLotes(dataItem);
            },
            ModeloPlantilla: function (options) {
                if (this.ValidarDataFueraDelModelo()) {
                    var data = {};
                    data = options;
                    data.Unidad = $("#unidadMedidaDropDownEditor").data("kendoDropDownList").dataItem($("#unidadMedidaDropDownEditor").data("kendoDropDownList").select()).SourceUoMID;
                    data.IdUbicacionOrigen = document.getElementById("ubicacionSeleccionada").dataset.idselected;

                    return data;
                }

                return null;
            },
            ValidarDataFueraDelModelo: function () {
                var result = true;
                var ubicacion = document.getElementById("ubicacionSeleccionada").dataset.idselected;
                if (ubicacion === "0") {
                    result = false;
                }


                return result;
            },
            //#endregion EVENTOS
            EstadoTemplate: function (data) {
                var estado = data.Activa ? window.app.idioma.t('SI') : window.app.idioma.t('NO');
                return '<span class="addTooltip">' + estado + '</span>';
            },
            SeleccionaPlantilla: function (self, item) {

                var id = item != null ? item.id != 0 ? item.id : -1 : -1;

                if (item != null) {
                var gridUbicaciones = $("#" + self.gridUbicacionesPlantillas).data("kendoGrid");
                gridUbicaciones.dataSource.transport.options.read.url = "../api/ubicacionesPlantillaConsumo/" + id;
                gridUbicaciones.dataSource.read();

                
                var gridTipoSemielaborado = $("#" + self.gridTipoSemielaboradoPlantillas).data("kendoGrid");
                gridTipoSemielaborado.dataSource.transport.options.read.url = "../api/tipoSemielaboradosPlantillaConsumo/" + id;
                gridTipoSemielaborado.dataSource.read();

                var gridDisparadorKOP = $("#" + self.gridDisparadorKOP).data("kendoGrid");
                var gridDisparadorTransferencia = $("#" + self.gridDisparadorTransferencia).data("kendoGrid");

                    if (item.IdPlantillaConsumo != 0) {
                        self.MostrarOcultarDatosTipoSemielaborado(self, item.IdTipoWO,false);

                        if (item.IdTipoDisparadorConsumo == self.tiposDisparadores.KOP) {
                            $("#btnAsociarDisparadorKOP").show();
                            $("#btnAsociarDisparadorTransferencia").show();

                            gridDisparadorKOP.dataSource.transport.options.read.url = "../api/disparadorPlantillasKOP/" + id
                            gridDisparadorTransferencia.dataSource.transport.options.read.url = "../api/disparadorPlantillasTransferencia/" + id;
                        }
                        else if (item.IdTipoDisparadorConsumo == self.tiposDisparadores.Transferencia) {
                            $("#btnAsociarDisparadorTransferencia").show();
                            $("#btnAsociarDisparadorKOP").hide();

                            gridDisparadorKOP.dataSource.transport.options.read.url = "../api/disparadorPlantillasKOP/-1";
                            gridDisparadorTransferencia.dataSource.transport.options.read.url = "../api/disparadorPlantillasTransferencia/" + id;
                        }
                    } else {
                        $("#btnAsociarDisparadorTransferencia").hide();
                        $("#btnAsociarDisparadorKOP").hide();
                        gridDisparadorKOP.dataSource.transport.options.read.url = "../api/disparadorPlantillasKOP/" + id;
                        gridDisparadorTransferencia.dataSource.transport.options.read.url = "../api/disparadorPlantillasTransferencia/" + id;
                    }

                }
                else {
                    $("#btnAsociarDisparadorTransferencia").hide();
                    $("#btnAsociarDisparadorKOP").hide();
                    if (gridDisparadorKOP) {
                        gridDisparadorKOP.dataSource.transport.options.read.url = "../api/disparadorPlantillasKOP/" + id;
                        gridDisparadorTransferencia.dataSource.transport.options.read.url = "../api/disparadorPlantillasTransferencia/" + id;
                    }
                }

                if (gridDisparadorKOP) {
                gridDisparadorKOP.dataSource.read();
                    gridDisparadorTransferencia.dataSource.read();
                }
            },
            SeleccionarUbicacion: function () {
                new vSeleccionarUbicacion("ubicacionSeleccionada");
            },
            UbicacionButton: function (container, options) {
                var _idSelected = options.model.IdUbicacionOrigen ? options.model.IdUbicacionOrigen : 0;
                $('<input type="text" style="width:60% !important" class="k-input k-textbox" disabled  id="ubicacionSeleccionada" name="' + options.field + '" data-bind="value:' + options.field + '" required data-idSelected="' + _idSelected + '" >')
                    .appendTo(container);
                $('<button class="k-button" id="btnSeleccionarUbicacion">...</button>').appendTo(container);

                $("#ubicacionSeleccionada").on('change', function (e) {
                    var value = document.getElementById("ubicacionSeleccionada").dataset.idselected;
                    if (value != "undefined") {
                        var grid = $("#gridPlantillasConsumosMMPP").data("kendoGrid");
                        var dataItem = grid.dataItem(this.closest("tr"));
                        dataItem.dirty = true;
                    }

                });

                $('<span class="k-invalid-msg" data-for="' + options.field + '"></span>').appendTo(container);



            },
            DataSourceUnidadesMedida: function (idMaterial) {
                return new kendo.data.DataSource({
                    batch: true,
                    transport: {
                        read: {
                            url: "../api/GetUnidadMedida/" + idMaterial,
                            dataType: "json",
                            cache: false
                        },
                        schema: {
                            model: {
                                id: "PK",
                                fields: {
                                    'PK': { type: "int" },
                                    'SourceUoMID': { type: "string" },
                                }
                            }
                        }

                    },
                });
            },
            DataSourceTipoOrden: function () {
                return new kendo.data.DataSource({
                    batch: true,
                    transport: {
                        read: {
                            url: "../api/plantillaConsumoMMPP/ObtenerTipoOrdenFabricacion",
                            dataType: "json",
                            cache: false
                        }

                    },
                    sort: { field: "Descripcion", dir: "asc" },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                'Id': { type: "number" },
                                'Descripcion': { type: "string" }
                            }
                        }
                    }
                });
            },
            UnidadMedidaDropDownEditor: function (container, options) {
                var idMaterial = options.model.IdMaterial != undefined ? options.model.IdMaterial : 0;

                $('<input data-text-field="SourceUoMID" id="unidadMedidaDropDownEditor" required data-value-field="PK" name="' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        optionLabel: "",
                        autoBind: false,
                        dataSource: this.DataSourceUnidadesMedida(idMaterial),
                        dataBound: function () { $("#unidadMedidaDropDownEditor").data("kendoDropDownList").select(0); },
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },
                    });
                $('<span class="k-invalid-msg" data-for="' + options.field + '"></span>').appendTo(container);
                var txtUnidadMedida = $("#unidadMedidaDropDownEditor").data("kendoDropDownList");
                txtUnidadMedida.list.width("auto");
            },
            ModoDescuentoDropDownEditor: function (container, options) {
                var self = this;
                $('<input data-text-field="Descripcion" id="ModoDescuentoDropDownEditor" required data-value-field="Id" name="' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        filter: "contains",
                        optionLabel: window.app.idioma.t("SELECCIONE_MODO_DESCUENTO"),
                        select: function (e) {
                            var grid = $("#gridPlantillasConsumosMMPP").data("kendoGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                           

                            if (item.IdTipoWO == self.tipoWO.Filtracion && dataItem.id == self.modoDescuentoEnum.TeoricaSemielaborado) {
                                e.preventDefault();
                            }
                            else {
                                item.IdModoDescuento = dataItem.id;
                            }
                        },
                        dataSource: {

                            transport: {
                                read: {
                                    url: "../api/plantillaConsumoMMPP/ObtenerModoDescuento",
                                    dataType: "json"
                                }
                            },
                            sort: { field: "Descripcion", dir: "asc" },
                            schema: {
                                model: {
                                    id: "Id",
                                    fields: {
                                        'Id': { type: "string" },
                                        'Descripcion': { type: "string" },
                                    }
                                }
                            }
                        },
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },
                        dataBound: function (e) {
                            this.value(options.model.IdModoDescuento);
                        }
                    });
                $('<span class="k-invalid-msg" data-for="' + options.field + '"></span>').appendTo(container);
                var cmbMaterial = $("#ModoDescuentoDropDownEditor").data("kendoDropDownList");
                cmbMaterial.list.width("auto");
            },
            TipoDisparadorDropDownEditor: function (container, options) {
                var self = this;
                $('<input data-text-field="Descripcion" id="tipoDisparadorDropDownEditor" required data-value-field="Id" name="' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        filter: "contains",
                        optionLabel: window.app.idioma.t("SELECCIONE_TIPO_DISPARADOR"),
                        change: function () {
                            var id = this.value();

                            if (self.idPlantillaSeleccionada != 0) {
                                Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('ACTUALIZAR_TIPO_DISPARADOR'), 2000);
                            }


                        },
                        select: function (e) {
                            var grid = $("#gridPlantillasConsumosMMPP").data("kendoGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                            item.IdTipoDisparadorConsumo = dataItem.id;
                        },
                        dataSource: {

                            transport: {
                                read: {
                                    url: "../api/plantillaConsumoMMPP/ObtenerTiposDisparador",
                                    dataType: "json"
                                }
                            },
                            sort: { field: "Descripcion", dir: "asc" },
                            schema: {
                                model: {
                                    id: "Id",
                                    fields: {
                                        'Id': { type: "string" },
                                        'Descripcion': { type: "string" },
                                    }
                                }
                            }
                        },
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },
                        dataBound: function (e) {
                            this.value(options.model.IdTipoDisparadorConsumo);
                        }

                    });
                $('<span class="k-invalid-msg" data-for="' + options.field + '"></span>').appendTo(container);
                var cmbMaterial = $("#tipoDisparadorDropDownEditor").data("kendoDropDownList");
                cmbMaterial.list.width("auto");
            },
            MaterialDropDownEditor: function (container, options) {
                var self = this;
                $('<input data-text-field="DescripcionCompleta" id="materialDropDownEditor" required data-value-field="IdMaterial" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        autoBind: true,
                        filter: "contains",
                        optionLabel: window.app.idioma.t("SELECCIONE_MATERIAL"),
                        dataSource: {

                            transport: {
                                read: {
                                    url: "../api/GetMaterial",
                                    dataType: "json"
                                }
                            },
                            sort: { field: "DescripcionCompleta", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdMaterial",
                                    fields: {
                                        'IdMaterial': { type: "string" },
                                        'DescripcionCompleta': { type: "string" },
                                    }
                                }
                            }
                        },
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },
                        select: function (e) {
                            var dataItem = this.dataItem(e.item);
                            $("#unidadMedidaDropDownEditor").data("kendoDropDownList").setDataSource(self.DataSourceUnidadesMedida(dataItem.IdMaterial));
                            $("#unidadMedidaDropDownEditor").data("kendoDropDownList").dataSource.read();
                        },
                        dataBound: function (e) {
                            var dataItem = this.dataItem(e.item);
                            $("#unidadMedidaDropDownEditor").data("kendoDropDownList").setDataSource(self.DataSourceUnidadesMedida(dataItem.IdMaterial));
                            $("#unidadMedidaDropDownEditor").data("kendoDropDownList").dataSource.read();
                        }

                    });
                $('<span class="k-invalid-msg" data-for="sl' + options.field + '"></span>').appendTo(container);
                var cmbMaterial = $("#materialDropDownEditor").data("kendoDropDownList");
                cmbMaterial.list.width("auto");
            },
            CantidadTeoricaNumericTextBox: function (container, options) {
                $('<input required id="cantTeoricaNumericTextBox" value="' + options.model.CantidadActual + '" name="' + options.field + '"/>')
                    .appendTo(container)
                    .kendoNumericTextBox({
                        format: 'n2',
                    }).data("kendoNumericTextBox");

                $('<span class="k-invalid-msg" data-for="' + options.field + '"></span>').appendTo(container);
            },
            TipoOrdenDropDownList: function (container, options) {
                var self = this;
                $('<input required style="width:100% required !important"  name="' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        optionLabel: window.app.idioma.t("SELECCIONE_TIPO_ORDEN"),
                        dataTextField: "Descripcion",
                        dataValueField: "Id",
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },
                        select: function (e) {
                            var grid = $("#gridPlantillasConsumosMMPP").data("kendoGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                            item.IdTipoWO = dataItem.id;
                            self.MostrarOcultarDatosTipoSemielaborado(self, item.IdTipoWO,true);
                            
                        },
                        dataSource: this.DataSourceTipoOrden(),
                        dataBound: function (e) {
                            this.value(options.model.IdTipoWO);

                        },
                    }).data("kendoDropDownList");

                $('<span class="k-invalid-msg" data-for="' + options.field + '"></span>').appendTo(container);

            },
            MostrarOcultarDatosTipoSemielaborado: function (self,idTipoWO,edicion) {
                if (idTipoWO == self.tipoWO.Filtracion) {

                    if (!edicion) {
                        $("#btnGuardarCantidadSemielaborado").hide();
                        $("#btnAsociarAsociarTipos").hide();
                    }

                    var dropDownList = $("#ModoDescuentoDropDownEditor").data("kendoDropDownList");
                    if (dropDownList)
                        if (dropDownList.items()[2]) {
                            dropDownList.select(0);
                            dropDownList.items()[2].classList.add("k-state-disabled");
                        }
                }
                else {
                    if (!edicion) {
                        $("#btnGuardarCantidadSemielaborado").show();
                        $("#btnAsociarAsociarTipos").show();
                    }
                    var dropDownList = $("#ModoDescuentoDropDownEditor").data("kendoDropDownList");
                    if (dropDownList)
                        if (dropDownList.items()[2])
                            dropDownList.items()[2].classList.remove("k-state-disabled");
                }
            },
            EstadoActivoDropDownList: function (container, options) {
                var _value = typeof options.model.Activa != "undefined" ? options.model.Activa : 1;
                var siNoDropDownDataSource = new kendo.data.DataSource(
                    {
                        data: [
                            { Value: false, Text: window.app.idioma.t('NO') },
                            { Value: true, Text: window.app.idioma.t('SI') }]
                    });
                $('<input style="width:100% !important" name="' + options.field + '" data-bind="value:' + options.field + '" data-text-field="Text"  required data-value-field="Value"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        dataSource: siNoDropDownDataSource,
                        dataTextField: "Text",
                        dataValueField: "Value",
                        dataBound: function () {
                            var ds = this.dataSource.data();
                            if (ds.length >= 1) {
                                this.select(_value);
                            }
                        }
                    });

                $('<span class="k-invalid-msg" data-for="' + options.field + '"></span>').appendTo(container);

            },

            resizeSplitter: function () {
                var outerSplitter = $("#plantillasConsumosVerticalSplitter").data("kendoSplitter");
                var browserWindow = $(window);
                var headerFooterHeight = $("#divCabeceraVista").height();

                outerSplitter.wrapper.height(browserWindow.height() - headerFooterHeight);
                outerSplitter.resize();
            },
            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

