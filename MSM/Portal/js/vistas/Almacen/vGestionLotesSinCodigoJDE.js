const { post } = require("jquery");

define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/GestionLotesSinCodigoJDE.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion'],
    function (_, Backbone, $, GestionLotesSinCodigoJDE, Not, VistaDlgConfirm, Session) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(GestionLotesSinCodigoJDE),
            window: null,
            grid: null,
            dataSourceGrid: null,
            tooltip: null,
            permiso: false,
            ListaLotesGenerar: [],
            registrosDesSelData: [],
            ListLoteGenerado: [],
            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;
                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.window = $("#windowForm").kendoWindow(
                    {
                        title: window.app.idioma.t('EDITAR_LOTE'),
                        width: "30%",
                        modal: true,
                        resizable: false,
                        draggable: false,
                        visible: false,
                        actions: ["Close"],
                    }).data("kendoWindow");

                self.tooltip = kendo.template($("#tooltip").html());

                self.permiso = TienePermiso(220);
                self.ListaLotesGenerar = [];
                self.dataSourceGrid = new kendo.data.DataSource({
                    // async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerLoteSinCodigoJDE",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8"
                        },
                        update: {
                            url: "../api/ActualizarLoteSinCodigoJDE",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_ACTUALIZANDO_CODIGO"), 4000);
                                } else {
                                    var gridTran = $("#grid").data("kendoGrid");
                                    gridTran.dataSource.read();
                                    self.QuitarLotesEnGeneracion(self.ListLoteGenerado);
                                }
                                self.ListaLotesGenerar = [];
                                self.ListaLotesGenerar = [];
                                $('#btnSelTodos').prop('checked', false);
                            },
                        },
                        destroy: {
                            url: "../api/DeleteLotes",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "POST",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_ELIMINAR_CODIGO"), 4000);
                                }
                                self.ListaLotesGenerar = [];
                                $('#btnSelTodos').prop('checked', false);
                            }
                        },
                        parameterMap: function (options, type) {
                            if (type !== "read") {
                                var permiso = TienePermiso(220);
                                if (!permiso) {
                                    Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                                } else {

                                    if (type == "destroy") {
                                        return JSON.stringify(options.IdLoteSinCodigoJDE);
                                    } else {
                                        var _drpProvComb = $("#provCmb").data("kendoDropDownList");
                                        if (typeof _drpProvComb != "undefined") {
                                            var proveedorItem = $("#provCmb").data("kendoDropDownList").dataItem($("#provCmb").data("kendoDropDownList").select());
                                            options.Proveedor = proveedorItem.IdProveedor;
                                        }
                                        var _drpUbicComb = $("#ubicacioncmb").data("kendoDropDownList");
                                        if (typeof _drpUbicComb != "undefined") {
                                            var UbicacionItem = $("#ubicacioncmb").data("kendoDropDownList").dataItem($("#ubicacioncmb").data("kendoDropDownList").select());
                                            options.IdUbicacionDestino = UbicacionItem.IdUbicacion;
                                        }
                                        var _drpMateComb = $("#materialDrop").data("kendoDropDownList");
                                        if (typeof _drpMateComb != "undefined") {
                                            var MaterialItem = $("#materialDrop").data("kendoDropDownList").dataItem($("#materialDrop").data("kendoDropDownList").select());
                                            options.Material = MaterialItem.IdMaterial;
                                        }
                                        var _drpUniMedComb = $("#uomDrop").data("kendoDropDownList");
                                        if (typeof _drpUniMedComb != "undefined") {
                                            var UnidadMedidaItem = $("#uomDrop").data("kendoDropDownList").dataItem($("#uomDrop").data("kendoDropDownList").select());
                                            options.Unidad = UnidadMedidaItem.SourceUoMID;
                                        }
                                        return JSON.stringify(options);
                                    }
                                    
                                }
                            }

                        }
                    },
                    requestEnd: function (request) {
                        self.QuitarLotesEnGeneracion(self.ListLoteGenerado);
                    },
                    schema: {
                        model: {
                            id: "IdLoteSinCodigoJDE",
                            fields: {
                                'IdLoteSinCodigoJDE': { type: "int", editable: false },
                                'EAN': { type: "string", editable: false },
                                'LoteProveedor': { type: "string"},
                                'Proveedor': {
                                    type: "string",
                                    validation: {
                                        required: true,
                                        customProveedor: function (input) {
                                            if (input.attr("data-bind") == "value:Proveedor" && input.val() == 0) {
                                                input.attr("data-customProveedor-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'Material': {
                                    type: "string",
                                    validation: {
                                        MaterialValidation:
                                            function (input) {
                                                if (input.attr("data-bind") == "value:Material" && input.val() == 0) {
                                                    input.attr("data-MaterialValidation-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                    return false;
                                                }
                                                return true;
                                            }
                                    }
                                },
                                'IdUbicacionDestino': {
                                    type: "number",
                                    validation: {
                                        UbicacionDestinoValidation:
                                            function (input) {
                                                if (input.attr("data-bind") == "value:IdUbicacionDestino" && input.val() == 0) {
                                                    input.attr("data-UbicacionDestinoValidation-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                    return false;
                                                }
                                                return true;
                                            }
                                    }
                                },
                                'SSCC': { type: "string", editable: false },
                                'IdLoteMES': { type: "string", editable: false },
                                'NombreUbicacion': { type: "string" },
                                'NombreMaterial': { type: "string" },
                                'NombreProveedor': { type: "string" },
                                'OffsetConsumoMin': { type: "number" },
                                'Creado': { type: "date"},
                                'Actualizado': { type: "date", editable: false },
                                'Cantidad': {
                                    type: "number",
                                    validation: {
                                        CantidadValidation:
                                            function (input) {
                                                if (input.attr("data-bind") == "value:Cantidad" && (input.val() <=0 || input.val() === "")) {
                                                    input.attr("data-CantidadValidation-msg", "Debe ser mayor a 0");
                                                    return false;
                                                }
                                                return true;
                                            }
                                    }
                                },
                                'Unidad': {
                                    type: "string",
                                    validation: {
                                        UnidadValidation:
                                            function (input) {
                                                if (input.attr("data-bind") == "value:Unidad" && input.val() == 0) {
                                                    input.attr("data-UbicacionDestinoValidation-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                    return false;
                                                }
                                                return true;
                                            }
                                    }
                                }
                            }
                        }
                    },
                    pageSize: 30
                });

                self.grid = $("#grid").kendoGrid({
                    dataSource: self.dataSourceGrid,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    toolbar: [
                        {
                            template: '<a class="k-button k-button-icontext" id="GenerarLotes"></span>' + window.app.idioma.t("GENERAR_LOTES") + '</a>'
                        },
                        {
                            template: '<a class="k-button k-button-icontext" id="EditarLotes"></span>' + window.app.idioma.t("EDITAR_LOTES") + '</a>'
                        }
                    ],
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    resizable: true,
                    scrollable: true,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [30, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    editable: "inline",
                    cancel: function () {
                        
                        $("#grid").data("kendoGrid").dataSource.read();
                        self.QuitarLotesEnGeneracion(self.ListLoteGenerado);
                        $('#btnSelTodos').prop('checked', false);
                    },
                    edit: function () {
                        $('#btnSelTodos').prop('checked', false);
                        $(".checkboxR").each(function (e) {
                            var checkB = this;
                            if (checkB.checked) {
                                checkB.click();
                            }
                        })
                        self.ListaLotesGenerar = [];
                    },
                    dataBound: function (e) {
                        var grid = this;
                        var data = this._data;

                        for (var i = 0; i < data.length; i++) {
                            var currentUid = data[i].uid;
                            if (data[i].IdMaestroEAN == 0 || !self.permiso) {
                                var currentRow = grid.table.find("tr[data-uid='" + currentUid + "']");
                                var editButton = $(currentRow).find(".k-grid-edit");
                                var deleteButton = $(currentRow).find(".k-grid-Delete");
                                editButton.hide();
                                deleteButton.hide();
                            }
                        }
                        $("#btnSelTodos").bind("change", function (e) {
                            var self = this;
                            var grid = $('#grid').data('kendoExtGrid');
                            var _chkAll = $("input[name='btnSelTodos']:checked").length > 0 ? true : false;

                            if (_chkAll) {
                                $(".checkboxR").each(function (e) {
                                    var checkB = this;
                                    if (!checkB.checked) {
                                        checkB.click();
                                    }
                                })
                            }
                            else {
                                $(".checkboxR").each(function (e) {
                                    var checkB = this;
                                    if (checkB.checked) {
                                        checkB.click();
                                    }
                                })
                            }
                            
                        }),
                        $(".checkboxR").bind("change", function (e) {

                            var checked = this.checked;
                            row = $(e.target).closest("tr");
                            dataItem = grid.dataItem(row);
                            var operacion = dataItem.IdOperacion;

                            if (checked) {
                               
                                if (dataItem.IdUbicacionDestino !== null && dataItem.Material !== null && dataItem.cantidad !== null
                                    && dataItem.Unidad !== null && dataItem.proveedor !== null) {
                                    row.addClass("k-state-selected");

                                    var datafound = _.findWhere(self.registrosDesSelData, operacion);
                                    index = _.indexOf(self.registrosDesSelData, datafound);
                                    if (index >= 0) {
                                        self.registrosDesSelData.splice(index, 1);
                                    }
                                    self.ListaLotesGenerar.push(operacion);
                                }
                                else {
                                    row.removeClass("k-state-selected");
                                }

                            } else {
                                row.removeClass("k-state-selected");
                                self.registrosDesSelData.push(operacion);
                                var numReg = self.$("#lblRegSel").text() ? self.$("#lblRegSel").text() : 0;

                                var datafound = _.findWhere(self.ListaLotesGenerar, operacion);
                                index = _.indexOf(self.ListaLotesGenerar, datafound);
                                if (index >= 0) {
                                    self.ListaLotesGenerar.splice(index, 1);
                                }
                            }
                            $('.checkboxR').each(function (e) {
                                if (!this.checked) {
                                    $('#btnSelTodos').prop('checked', false);
                                    return false
                                }
                                $('#btnSelTodos').prop('checked', true);
                            });
                        });                    
                        self.QuitarLotesEnGeneracion(self.ListLoteGenerado);
                        self.ResizeTab();
                    },
                    columns: [
                        {
                            headerTemplate: '<input class="checkbox" id="btnSelTodos" name="btnSelTodos" type="checkbox" />',
                            template: "<input class='checkboxR' type='checkbox' style='width: 14px; height: 14px;' />",
                            width: 25
                        },
                        {
                            field: "EAN",
                            attributes: { "align": "center", "class": 'addTooltip' },
                            headerAttributes: {
                                style: "text-align: center"
                            },
                            width: 150,
                            //editor: function (e, options) { return self.EANInput(e, options) },
                        },
                        {
                            field: "SSCC",
                            attributes: { "align": "center", "class": 'addTooltip' },
                            headerAttributes: {
                                style: "text-align: center"
                            },
                            width: 150,
                        },
                        {
                            field: "IdLoteMES",
                            width: 250,
                            title: window.app.idioma.t("ID_LOTE"),
                            headerAttributes: {
                                style: "text-align: center"
                            },
                            attributes: {
                                style: 'white-space: nowrap ', "class": 'addTooltip'
                            },
                        },
                        {
                            field: "Proveedor",
                            title: window.app.idioma.t("PROVEEDOR"),
                            template: '<span class="addTooltip">#=NombreProveedor !== "undefined" && NombreProveedor !== null ?  NombreProveedor : ""#</span>',
                            attributes: {
                                style: 'white-space: nowrap '
                            },
                            headerAttributes: {
                                style: "text-align: center"
                            },
                            editor: function (e, options) { return self.ProveedorDropDownEditor(e, options) },
                            width: 150,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Proveedor#' style='width: 14px;height:14px;margin-right:5px;'/>#= NombreProveedor#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            field: "LoteProveedor",
                            width: 150,
                            title: window.app.idioma.t("LOTE_PROVEEDOR"),
                            editor: function (e, options) { return self.TextBoxEditor(e, options, options.model.LoteProveedor) },
                            headerAttributes: {
                                style: "text-align: center"
                            },
                        },
                        {
                            field: "Material",
                            width: 150,
                            title: window.app.idioma.t("MATERIAL"),
                            template: '<span class="addTooltip">#=NombreMaterial !== "undefined" && NombreMaterial !== null ?  NombreMaterial : ""#</span>',
                            editor: function (e, options) { return self.MaterialDropDownEditor(e, options) },
                            attributes: {
                                style: 'white-space: nowrap '
                            },
                            headerAttributes: {
                                style: "text-align: center"
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Material#' style='width: 14px;height:14px;margin-right:5px;'/>#= NombreMaterial#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            field: "Cantidad",
                            width: 100,
                            title: window.app.idioma.t("CANTIDAD"),
                            attributes: { "align": "center" },
                            headerAttributes: {
                                style: "text-align: center"
                            },
                        },   
                        {
                            field: "Unidad",
                            width: 80,
                            title: window.app.idioma.t("UNIDAD_MEDIDA"),
                            template: '<span class="addTooltip">#=Unidad !== "undefined" && Unidad !== null ?  Unidad : ""#</span>',
                            attributes: { "align": "center" },
                            headerAttributes: {
                                style: "text-align: center"
                            },
                            editor: function (e,options) { return self.UoMDropdDownEditor(e,options) }
                        },
                        {
                            field: "IdUbicacionDestino",
                            width: 150,
                            title: window.app.idioma.t("UBICACION_DESTINO"),
                            editor: function (e, options) { return self.UbicacionDropDownEditor(e, options) },
                            headerAttributes: {
                                style: "text-align: center"
                            },
                            template: '<span class="addTooltip">#=NombreUbicacion !== "undefined" && NombreUbicacion !== null ?  NombreUbicacion : ""#</span>',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdUbicacionDestino#' style='width: 14px;height:14px;margin-right:5px;'/>#= NombreUbicacion#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap '
                            },
                        },
                        {
                            field: "Creado",
                            width: 150,
                            title: window.app.idioma.t("FECHA_INICIO_CONSUMO"),
                            template: '<span class="addTooltip">#= Creado != null ? kendo.toString(new Date(Creado), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #</span>',
                            editor: function (e, options) { return self.FechaDropDownEditor(e, options) },
                            headerAttributes: {
                                style: "text-align: center"
                            },
                        },
                        {
                            field: "OffsetConsumoMin",
                            width: 150,
                            editor: function (e, options) { return self.NumericTextBox(e, options) },
                            title: window.app.idioma.t("OFFSET_FIN_CONSUMO"),
                            headerAttributes: {
                                style: "text-align: center"
                            },
                        },
                        {
                            field: "coms",
                            width: 250,
                            title: window.app.idioma.t("OPERACIONES"),
                            attributes: { "align": "center" },
                            command: [
                                { name: "edit", text: { edit: window.app.idioma.t("EDITAR"), update: window.app.idioma.t("ACTUALIZAR"), cancel: window.app.idioma.t("CANCELAR")} },
                                {
                                    name: "Delete", text: window.app.idioma.t("ELIMINAR"),
                                    click: function (e) {
                                        e.preventDefault(); 
                                        var grid = $("#grid").data("kendoGrid");
                                        var tr = $(e.target).closest("tr");
                                        var data = this.dataItem(tr); 
                                        if (self.permiso) {
                                            this.confirmacion = new VistaDlgConfirm({
                                                titulo: window.app.idioma.t('ELIMINAR'), msg: window.app.idioma.t('CONFIRMACION_ELIMINAR_CODIGO'), funcion: function () {
                                                    grid.dataSource.remove(data);  
                                                    grid.dataSource.sync();
                                                    Backbone.trigger('eventCierraDialogo');
                                                }, contexto: this
                                            });


                                        } else {
                                            Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                                        }
                                    }
                                },
                            ],
                        },
                    ]
                }).data("kendoGrid");

                $("#grid").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");
                

                $("#ProveedorNew").kendoDropDownList({
                    filter: "contains",
                    optionLabel: window.app.idioma.t('SELECCIONE_PROVEEDOR'),
                    open: function (e) {
                        var listContainer = e.sender.list.closest(".k-list-container");
                        listContainer.width(listContainer.width() + kendo.support.scrollbar());
                    },
                    dataTextField: "IdNombreProveedor",
                    dataValueField: "IdProveedor",
                    dataSource: {

                        transport: {
                            read: {
                                url: "../api/GetProveedorEAN",
                                dataType: "json"
                            }

                        },
                        sort: { field: "IdProveedor", dir: "asc" },
                        schema: {
                            model: {
                                id: "IdProveedor",
                                fields: {
                                    'IdProveedor': { type: "int" },
                                    'Nombre': { type: "string" },
                                    'IdNombreProveedor': { type: "string" },
                                }
                            }
                        }


                    },
                });

                $("#MaterialNew").kendoDropDownList({
                    filter: "contains",
                    optionLabel: window.app.idioma.t('SELECCIONE_MATERIAL'),
                    dataTextField: "DescripcionCompleta",
                    dataValueField: "IdMaterial",
                    open: function (e) {
                        var listContainer = e.sender.list.closest(".k-list-container");
                        listContainer.width(listContainer.width() + kendo.support.scrollbar());
                    },
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
                        },


                    },
                });

                $("#UnidadNew").kendoDropDownList({
                    filter: "contains",
                    optionLabel: window.app.idioma.t('SELECCIONE_UNIDAD'),
                    dataTextField: "SourceUoMID",
                    dataValueField: "SourceUoMID",
                    open: function (e) {
                        var listContainer = e.sender.list.closest(".k-list-container");
                        listContainer.width(listContainer.width() + kendo.support.scrollbar());
                    },
                    dataSource: {
                        batch: true,
                        transport: {
                            read: {
                                url: "../api/GetUnidadMedida/",
                                dataType: "json",
                                cache: false
                            },
                            schema: {
                                model: {
                                    id: "SourceUoMID",
                                    fields: {
                                        'SourceUoMID': { type: "string" },
                                    }
                                }
                            }

                        }
                    }

                });

                $("#OffsetNew").kendoNumericTextBox({
                    spinners: true,
                    decimals: 2,
                    min:0,
                    format: "#",
                });

                $("#UbicacionNew").kendoDropDownList({
                    filter: "contains",
                    optionLabel: window.app.idioma.t('SELECCIONE_UBICACION'),
                    dataTextField: "Nombre",
                    dataValueField: "IdUbicacion",
                    open: function (e) {
                        var listContainer = e.sender.list.closest(".k-list-container");
                        listContainer.width(listContainer.width() + kendo.support.scrollbar());
                    },
                    dataSource: {
                        transport: {
                            read: {
                                url: "../api/GetLocation/0/0",
                                dataType: "json",
                                cache: false
                            }
                        },
                        sort: { field: "Nombre", dir: "asc" },
                        schema: {
                            model: {
                                id: "IdUbicacion",
                                fields: {
                                    'IdUbicacion': { type: "number" },
                                    'Nombre': { type: "string" },
                                }
                            }
                        }


                    },

                });

                $("#CantidadNew").kendoNumericTextBox({
                    spinners: true,
                    decimals: 2,
                    format: "#",
                });
            },

            //#region EVENTOS
            events: {
                "click #GenerarLotes": function (e) { this.GenerarLotes(this); },
                "click #EditarLotes": function (e) { this.EditarLotes(this); },
            },
            EditarLotes: function (self) {
                var grid = $("#grid").data("kendoGrid");
                var listDataSelected = self.LotesSeleccionados();
                
                if (listDataSelected.length > 0) {
                    self.MostrarFormularioEdicionLotes(self,listDataSelected);
                }
            },
            LotesSeleccionados: function () {
                var grid = $("#grid").data("kendoGrid");
                var listDataSelected = [];


                $(".checkboxR").each(function (e) {
                    var item = this;
                    if (item.checked) {
                        var tr = $(item).closest("tr");
                        var data = grid.dataItem(tr);
                        listDataSelected.push(data);
                    }
                });

                return listDataSelected;
            },
            MostrarFormularioEdicionLotes: function (self,listadoSeleccionado) {
                self.window.open().center();

                $("#btnEditar").on("click", function () {
                    var grid = $('#grid').data("kendoGrid");
                    var _material = $("#MaterialNew").val();
                    var _nombreMaterial = $("#MaterialNew").data("kendoDropDownList").dataItem($("#MaterialNew").data("kendoDropDownList").select());
                    var _proveedor = $("#ProveedorNew").val();
                    var _nombreProveedor = $("#ProveedorNew").data("kendoDropDownList").dataItem($("#ProveedorNew").data("kendoDropDownList").select());
                    var _unidad = $("#UnidadNew").val();
                    var _cantidad = $("#CantidadNew").val();
                    var _ubicacion = $("#UbicacionNew").val();
                    var _nombreUbicacion = $("#UbicacionNew").data("kendoDropDownList").dataItem($("#UbicacionNew").data("kendoDropDownList").select());
                    var _offsetConsumoMin = $("#OffsetNew").val();
                    var _loteProveedor = $("#LoteProveedorNew").val();

                    $.each(listadoSeleccionado, function (idx, elem) {
                        if (_cantidad) {
                            elem.set("Cantidad", _cantidad);
                        }
                       
                        if (_material) {
                            elem.set("Material", _material);
                            elem.set("NombreMaterial", _nombreMaterial.DescripcionCompleta);
                        }

                        if (_unidad) {
                            elem.set("Unidad", _unidad);
                        }

                        if (_proveedor) {
                            elem.set("Proveedor", _proveedor);
                            elem.set("NombreProveedor", _nombreProveedor.IdNombreProveedor);
                        }

                        if (_ubicacion) {
                            elem.set("IdUbicacionDestino", _ubicacion);
                            elem.set("NombreUbicacion", _nombreUbicacion.Nombre);
                        }

                        if (_offsetConsumoMin) {
                            elem.set("OffsetConsumoMin", _offsetConsumoMin);
                        }

                        if (_loteProveedor) {
                            elem.set("LoteProveedor", _loteProveedor);
                        }
                    });

                    grid.saveChanges();
                    self.window.close();
                });
            },

            //#endregion EVENTOS
            GenerarLotes: function (self) {
                var listDataSelected = self.LotesSeleccionados();
                var lotesPorGenerar = listDataSelected.filter(function (item) { return item.Proveedor && item.Material && item.Unidad && item.Cantidad && item.IdUbicacionDestino; });
                if (lotesPorGenerar.length > 0) {
                    listDataSelected = lotesPorGenerar.map(function (a) { return a.IdLoteSinCodigoJDE; });
                    $.ajax({
                        type: "POST",
                        async: true,
                        data: JSON.stringify(listDataSelected),
                        url: "../api/GenerarLotes",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            $('#btnSelTodos').prop('checked', false);
                            $("#grid").data("kendoGrid").dataSource.read();
                            kendo.ui.progress($('#grid'), false);
                            if (res) {
                                Not.crearNotificacion('success', window.app.idioma.t('INFORMACION'), window.app.idioma.t('LOTES_GENERADOS'), 2000);

                            } else {
                                Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('ERROR_GENERANDO_LOTES'), 2000);
                            }
                        },
                        error: function (err) {
                            $('#btnSelTodos').prop('checked', false);
                            kendo.ui.progress($(".divFormControlStock"), false);
                            kendo.ui.progress($("#divControlStock"), false);
                            Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('FALTAN_DATOS_FORMULARIO'), 2000);

                            kendo.ui.progress($('#grid'), false);
                        }
                    });
                } 
            },
            EANInput: function (container, options) {
                $('<input type="text" maxlength="64" class="k-input k-textbox" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container);
                // $('<span class="k-invalid-msg" data-for="sl' + options.field + '"></span>').appendTo(container);


            },
            ActualizarDs: function (lotesProcesados) {
                var listaEliminar = [];
                var listaIdOperaciones= [];
                var g = $("#grid").data("kendoGrid");
                var ds = g.dataSource;
                var filters = ds.filter();
                var allData = ds.data();
                var query = new kendo.data.Query(allData);
                var filteredData = query.filter(filters).data;
                filteredData.forEach(function (e, a) {
                    if (jQuery.inArray(e.IdOperacion, lotesProcesados) > -1) {
                        listaEliminar.push(e);
                        listaIdOperaciones.push(e.IdOperacion);
                    }
                })
                listaEliminar.forEach(function (e, a) { ds.remove(e); });
                return listaIdOperaciones;

            },
            QuitarLotesEnGeneracion: function (lotesProcesados) {
                if (lotesProcesados.length > 0) {
                    this.ActualizarDs(lotesProcesados);
                }
            },
            UoMDropdDownEditor: function (container, options) {
                var dsUnidadMedida = new kendo.data.DataSource({
                    batch: true,
                    transport: {
                        read: {
                            url: "../api/GetUnidadMedida/",
                            dataType: "json",
                            cache: false
                        },
                        schema: {
                            model: {
                                id: "SourceUoMID",
                                fields: {
                                    'SourceUoMID': { type: "string" },
                                }
                            }
                        }

                    }
                });

                $('<input data-text-field="SourceUoMID" id="uomDrop"  data-value-field="Unidad" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        dataBound: function (e) {
                            var ddl = this;
                            ddl.select(function (dataItem) {
                                return dataItem.SourceUoMID === options.model.Unidad
                            })
                        },
                        select: function (e) {
                            var grid = $("#grid").data("kendoGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                            item.Unidad = dataItem.SourceUoMID;
                        },
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },
                        dataSource: dsUnidadMedida

                    });

                var UoMDrop = $("#uomDrop").data("kendoDropDownList");
                UoMDrop.list.width("auto");
            },
            MaterialDropDownEditor: function (container, options) {
                $('<input data-text-field="DescripcionCompleta" id="materialDrop"  data-value-field="Material" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        dataBound: function (e) {
                            var ddl = this;
                            ddl.select(function (dataItem) {
                                return dataItem.IdMaterial === options.model.Material
                            })
                           
                        },
                        select: function (e) {
                            var grid = $("#grid").data("kendoGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                            item.Material = dataItem.IdMaterial;
                        },
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },
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
                            },


                        },

                    });
                // $('<span class="k-invalid-msg" data-for="sl' + options.field + '"></span>').appendTo(container);
                var materialDrop = $("#materialDrop").data("kendoDropDownList");
                materialDrop.list.width("auto");

            },
            ProveedorDropDownEditor: function (container, options) {
                $('<input data-text-field="IdNombreProveedor" style="width:80%" id="provCmb" data-value-field="IdProveedor" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        dataBound: function (e) {
                            this.value(options.model.Proveedor)
                        },
                        select: function (e) {
                            var grid = $("#grid").data("kendoGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                            item.Proveedor = dataItem.id;
                        },
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },
                        dataSource: {

                            transport: {
                                read: {
                                    url: "../api/GetProveedorEAN",
                                    dataType: "json"
                                }

                            },
                            sort: { field: "IdProveedor", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdProveedor",
                                    fields: {
                                        'IdProveedor': { type: "int" },
                                        'Nombre': { type: "string" },
                                        'IdNombreProveedor': { type: "string" },
                                    }
                                }
                            }


                        },
                    });
                var provCmb = $("#provCmb").data("kendoDropDownList");
                provCmb.list.width("auto");
            },
            UbicacionDropDownEditor: function (container, options) {
                $('<input data-text-field="Nombre" style="width:80%" id="ubicacioncmb" data-value-field="IdProveedor" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        dataBound: function (e) {
                            var ddl = this;
                            ddl.select(function (dataItem) {
                                return dataItem.IdUbicacion === options.model.IdUbicacionDestino
                            })
                        },
                        select: function (e) {
                            var grid = $("#grid").data("kendoGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                            item.IdUbicacionDestino = dataItem.id;
                        },
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },
                        dataSource: {

                            transport: {
                                read: {
                                    url: "../api/GetLocation/0/0",
                                    dataType: "json",
                                    cache: false
                                }

                            },
                            sort: { field: "Nombre", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdUbicacion",
                                    fields: {
                                        'IdUbicacion': { type: "number" },
                                        'Nombre': { type: "string" },
                                    }
                                }
                            }


                        },

                    });


                // $('<span class="k-invalid-msg" data-for="sl' + options.field + '"></span>').appendTo(container);
                var provCmb = $("#ubicacioncmb").data("kendoDropDownList");
                provCmb.list.width("auto");
                ///$('<a id="btnAddProveedor" class="k-button" style="min-width:40px !important;width:10% !important"> <span class="k-icon k-add"></span> </a>').appendTo(container);
            },
            eliminar: function () {
                this.ListLoteGenerado = [];
                $("#windowForm").data("kendoWindow").destroy();
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            TextBoxEditor: function (container, options, value) {
                $('<input class="width-80 k-textbox" value="' + value + '" name="sl' + options.field + '" data-text-field="' + options.field + '" data-value-field="' + options.field
                    + '" data-bind="value:' + options.field + '" id="' + options.field + '" />')
                    .appendTo(container);
            },
            FechaDropDownEditor: function (container, options) {
                $('<input class="width-80" data-text-field="' + options.field + '" data-value-field="' + options.field
                    + '" data-bind="value:' + options.field + '" />')
                    .appendTo(container)
                    .kendoDateTimePicker({
                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                        culture: localStorage.getItem("idiomaSeleccionado"),
                        //value: new Date(options.model.dateTime)
                    });
            },
            NumericTextBox: function (container, options) {
                var _cantidad = options.model.OffsetConsumoMin <= 0 ? 0 : options.model.OffsetConsumoMin;
                $('<input value="' + _cantidad + '" name="' + options.field + '"/>')
                    .appendTo(container)
                    .kendoNumericTextBox({
                        spinners: true,
                        decimals: 2,
                        min: 0,
                        format: "#",
                    }).data("kendoNumericTextBox");

            },
            ResizeTab: function (isVisible) {
                var cabeceraHeight1 = $("#divCabeceraVista").height();
                var contenedorHeight = $("#center-pane").height();
                var toolbarHeight = $(".k-grid-toolbar").height();
                var cabeceraHeight = $(".k-grouping-header").height();
                var headerHeightGrid = $(".k-grid-header").height();

                var gridElement = $("#grid"),
                    dataArea = gridElement.find(".k-grid-content:first"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - toolbarHeight);

            },
        });

        return vista;
    });

