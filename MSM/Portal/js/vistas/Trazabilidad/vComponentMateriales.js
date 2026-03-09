define(['underscore', 'backbone', 'jquery', 'vistas/trazabilidad/vComponentMaterialesEditDialog', 'vistas/vDialogoConfirm', 'compartido/notificaciones'],
    function (_, Backbone, $, dialogEditComponent, VistaDlgConfirm, Not) {

        var gridGestionTriggers = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLComponentMMPP',
            ds: null,
            grid: null,
            dialogEdit: null,
            serverTraza: window.app.section.getAppSettingsValue('HostApiTrazabilidad'),
            filtrosData: null,
            url: null,
            WO: null,
            CodProducto: null,
            numLinea: null,
            initialize: function (url, CodProducto, WO, numLinea) {
                this.id = this.id + WO;
                this.filtrosData = {
                    height: 300,
                    agruparField: "DesReferencia",
                };
                
                this.url = url;
                this.WO = WO;
                this.CodProducto = CodProducto;
                this.numLinea = numLinea;
            },
            render: function () {
                var self = this;
                self.GetDataSource(self);
                var toolbarTemplate = [
                    {
                        name: "create",
                        text: window.app.idioma.t('DECLARAR_CONSUMO'),
                        template: "<a id='btnCrearTemplate' class='k-button k-button-icontext k-grid-add' style=' background-color:green;color:white;'><span class='k-icon k-add'></span>" + window.app.idioma.t('DECLARAR_CONSUMO') + "</a>"
                    },
                ]

                kendo.culture(localStorage.getItem("idiomaSeleccionado"));
                //el propio div que crea underscore es el grid
                self.grid = $(self.el).kendoGrid({
                    dataSource: self.ds,
                    height: self.filtrosData.height,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    toolbar: toolbarTemplate,
                    sortable: true,
                    resizable: true,
                    // pageable: {
                    //     refresh: true,
                    //     pageSizes: true,
                    //     buttonCount: 5,
                    //     messages: window.app.cfgKendo.configuracionPaginado_Msg
                    // },
                    selectable: 'row',
                    columns: [
                        {
                            field: "DesReferencia", title: window.app.idioma.t('MATERIAL'), width: 160,
                            filterable: false, hidden: true, groupHeaderTemplate: "#= value # - #= window.app.idioma.t('CANTIDAD_TOTAL')#: " + "#:kendo.toString(aggregates.Cantidad.sum, 'n') # #:aggregates.UomID.max#"
                        },
                        {
                            field: "InicioConsumo", title: window.app.idioma.t('INICIO_CONSUMO'), width: 130, format: "{0:dd/MM/yyyy HH:mm:ss}", filterable: false
                        },
                        {
                            field: "FinConsumo", title: window.app.idioma.t('FIN_CONSUMO'), width: 130, format: "{0:dd/MM/yyyy HH:mm:ss}", filterable: false
                        },
                        {
                            field: "DescUbicacion", title: window.app.idioma.t('UBICACIONES_CONSUMO'), width: 140, filterable: false
                        },
                        {
                            field: "LoteMES", title: window.app.idioma.t('LOTE_MES'), width: 160, filterable: false,
                        },
                        {
                            field: "LoteProveedor", title: window.app.idioma.t('LOTE_PROVEEDOR'), width: 160, filterable: false,
                        },
                        {
                            field: "Cantidad", title: window.app.idioma.t('CANTIDAD'), width: 160, filterable: false,
                            template: '<div style="text-align:right;">#=kendo.toString(Cantidad, "n") #</div>',
                        },
                        {
                            field: "UomID", title: window.app.idioma.t('UNIDADES'), width: 160, filterable: false,
                        },
                        {
                            title: "",
                            command:
                            {
                                template: "<a id='btnEditar' class='k-button k-grid-edit' style='min-width:16px;'><span class='k-icon k-edit'></span></a>" +
                                "<a id='btnBorrar' class='k-button k-grid-delete' style='min-width:16px;'><span class='k-icon k-delete'></span></a>"
                            },
                            width: "140px",
                            filterable: false,
                        }
                    ],
                    dataBinding: self.resizeGrid,
                }).data("kendoGrid");

                this.$("#selectAgrupacion").kendoDropDownList({
                    dataTextField: "text",
                    dataValueField: "value",
                    dataSource: [
                        { text: window.app.idioma.t('SIN_AGRUPACION'), value: '0' },
                        { text: window.app.idioma.t("MATERIAL"), value: 'Referencia' }
                    ]
                });

                return self; // enable chained calls
            },
            events: {
                'change #selectAgrupacion': 'AgruparEvent',
                'click #btnCrearTemplate': 'crearTemplate',
                'click #btnEditar': 'editarTemplate',
                'click #btnBorrar': 'confirmarBorrado',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid'
            },
            AgruparEvent: function () {
                if ($("#selectAgrupacion")) {
                    this.Agrupar($("#selectAgrupacion").val());
                }
            },
            Agrupar: function (fieldStr) {
                var dataSource = $(this.el).data("kendoGrid").dataSource;
                if ($("#selectAgrupacion").val() != 0) {
                    var pageSize = dataSource.pageSize();
                    var totalReg = dataSource.total();
                    if (pageSize != totalReg) {
                        self.pageSizeDefault = pageSize;
                    }
                    dataSource.pageSize(totalReg);
                    dataSource.group({ field: fieldStr });
                }
                else {
                    dataSource.pageSize(self.pageSizeDefault);
                    dataSource.group("");
                }
            },
            GetDataSource: function (self) {
                console.log("URl: " + self.url);

                self.ds = new kendo.data.DataSource({
                    batch: false,
                    async: true,
                    group: [{
                        field: self.filtrosData.agruparField, aggregates: [
                            { field: "Cantidad", aggregate: "sum" }, { field: "UomID", aggregate: "max" }
                        ]
                    }], //[{field:'DesReferencia'}],
                    transport: {
                        read: {
                            url: self.url,
                            //data: {ParticionWO: 'OP-BUR-17-00104.1'},
                            dataType: "json"
                        },
                        parameterMap: function (options, operation) {
                            if (operation !== "read") {
                                return JSON.stringify(options);
                            }
                        }
                    },
                    requestEnd: function (e) { },
                    schema: {
                        model: {
                            id: "IdProduccion",
                            fields: {
                                Referencia: { type: "string" },
                                DesReferencia: { type: "string" },
                                InicioConsumo: { type: "date" },
                                FinConsumo: { type: "date" },
                                IdUbicacion: {
                                    type: "number",
                                    parse: function (data) {
                                        return 1;
                                    }
                                },
                                DescUbicacion: { type: "string" },
                                Cantidad: { type: "number" },
                                LoteMES: { type: "string" },
                                LoteProveedor: { type: "string" },
                                UomID: { type: "string" }
                            }
                        }
                    },

                    sort: { field: "InicioConsumo", dir: "desc" }
                });
            },
            LimpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
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
            crearTemplate: function () {
                var permiso = false;

                if (this.WO.includes('.')) {
                    for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                        if (window.app.sesion.attributes.funciones[i].id === 13) {
                            permiso = true;
                        }
                    }
                } else {
                    for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                        if (window.app.sesion.attributes.funciones[i].id === 198) {
                            permiso = true;
                        }
                    }
                }

                if (permiso) {
                    this.dialogEdit = new dialogEditComponent(this.refreshGrid, { objectTemplate: null, WO: this.WO, CodProducto: this.CodProducto, numLinea: this.numLinea });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                }
            },
            refreshGrid: function () {
                $("#divHTMLComponentMMPP").data('kendoGrid').dataSource.read();
                $("#divHTMLComponentMMPP").data('kendoGrid').refresh();
            },
            editarTemplate: function (e) {
                var self = this;
                var permiso = false;

                if (this.WO.includes('.')) {
                    for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                        if (window.app.sesion.attributes.funciones[i].id === 13) {
                            permiso = true;
                        }
                    }
                } else {
                    for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                        if (window.app.sesion.attributes.funciones[i].id === 198) {
                            permiso = true;
                        }
                    }
                }

                if (permiso) {
                    //Obtenemos la línea seleccionada del grid
                    var tr = $(e.target.parentNode.parentNode).closest("tr");
                    // get the data bound to the current table row
                    var data = self.grid.dataItem(tr);
                    this.dialogEdit = new dialogEditComponent(this.refreshGrid, { objectTemplate: data, WO: this.WO });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                }
            },
            confirmarBorrado: function (e) {
                var self = this;
                var permiso = false;

                if (this.WO.includes('.')) {
                    for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                        if (window.app.sesion.attributes.funciones[i].id === 13) {
                            permiso = true;
                        }
                    }
                } else {
                    for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                        if (window.app.sesion.attributes.funciones[i].id === 198) {
                            permiso = true;
                        }
                    }
                }

                if (permiso) {
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('BORRAR_MATERIAL'),
                        msg: window.app.idioma.t('BORRAR_MATERIAL_TEXT'),
                        funcion: function () { self.eliminarTemplate(e); },
                        contexto: this
                    });
                } else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                }
            },
            GetItem : function (e) {
                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = $("#gridFormsCalidad").data("kendoGrid").dataItem(tr);
                return data.Calculo;
            },
            eliminarTemplate: function (e) {
                // DELETEà api/ConsumDelete
                // {"refMaterialID":"","startTime":"2018-02-23","endTime":"2018-02-23","operationId":306}
                var self = this;

                var tr = $(e.target.parentNode.parentNode).closest("tr");
                // get the data bound to the current table row
                var data = self.grid.dataItem(tr);
                var url = "../api/ConsumDelete"
                var params = {
                    // startTime: data.InicioConsumo,
                    // endTime: data.FinConsumo,
                    operationId: data.IdOperacion
                };
                console.log("URL DELETE: " + url);
                console.log("DATA: " + JSON.stringify(params));
                $.ajax({
                    type: "PUT",
                    async: false,
                    url: url,
                    data: JSON.stringify(params),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        if (res >= 0) {
                            self.refreshGrid();
                            //Not.crearNotificacion('success', window.app.idioma.t('AVISO'), res[1], 2000);                            
                        } else {
                            var errorDesc = window.app.idioma.t('ERROR_BORRANDO')
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), errorDesc, 2000);
                        }

                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (response) {
                        console.log("OK " + JSON.stringify(response));
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_BORRANDO'), 2000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            }
        });

        return gridGestionTriggers;
    });