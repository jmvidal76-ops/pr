define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/GestionMateriales.html', 'compartido/notificaciones', 'compartido/utils', 'vistas/Fabricacion/vCrearLoteUbicacion', 'vistas/Fabricacion/vEditarLote', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantillaGestionMateriales, Not, Utils, vistaCrearLoteUbicacion, vistaEditarLote, VistaDlgConfirm) {
        var gridMateriales = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            gridDetalle: null,
            pass: false,
            celdas: null,
            selectedMasterRow: null,
            area: null,
            template: _.template(plantillaGestionMateriales),
            initialize: function () {
                var self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/obtenerCeldasMateriales/",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.salasCoccion = data;
                    self.render();
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                });
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                $("#toolbar").kendoToolBar({
                    items: [
                        { template: "<label id='lblCelda'>" + window.app.idioma.t('AREA') + "</label>" },
                        {
                            template: "<input id='cmbCelda' style='width: 210px;' />",
                            overflow: "never"
                        },
                        { template: "<label id='lblError1' style='display:none;color:red;'></label>" },

                        { template: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" },
                        { template: "<label id='lblArea' >" + window.app.idioma.t('CELDA') + "</label>" },
                        {
                            template: "<input id='cmbArea' style='width: 210px;' />",
                            overflow: "never"
                        },
                        { template: "<label id='lblError2' style='display:none; color:red;'></label>" },
                        {
                            type: "button",
                            id: "btnConsultar",
                            text: "Consultar",
                            click: function () {
                                self.leerMateriales();
                            }
                        }

                    ]
                });

                if (self.salasCoccion.length > 0) {
                    $("#cmbCelda").kendoDropDownList({
                        dataTextField: "Name",
                        dataValueField: "AreaPK",
                        dataSource: self.salasCoccion,
                        dataBound: function () {
                            this.select(0);
                            self.cambiaSala();
                        }
                    });
                    $("#btnConsultar").show();
                    $("#lblError1").hide();
                }
                else {
                    $("#btnConsultar").hide();
                    $("#lblError1").show();
                    $("#lblError1").text("No se han encontrado areas");
                }

            },
            events: {
                "click #btnCrear": 'crear',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click .editarLote': 'editarLote',
                'click .moverLote': 'moverLote',
                'change #cmbCelda': 'cambiaSala'
            },
            cambiaSala: function () {
                var self = this;
                var area = $("#cmbCelda").data("kendoDropDownList").value();     
                $.ajax({
                    type: "GET",
                    url: "../api/obtenerCeldaDesdeArea/" + area,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.celdas = data;
                }).fail(function (xhr) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_EQUIPOS'), 4000);
                });

                if (self.celdas.length > 0) {
                    $("#cmbArea").kendoDropDownList({
                        dataTextField: "Name",
                        dataValueField: "CeldaPK",
                        dataSource: self.celdas,
                        //optionLabel: window.app.idioma.t('SELECCIONE'),
                        change: function () { self.leerMateriales(); }
                        , dataBound: function () {
                            this.select(0);
                            self.leerMateriales();
                        }
                    });
                    $("#btnConsultar").show();
                    $("#lblError2").hide();
                } else {
                    $("#btnConsultar").hide();
                    $("#lblError2").show();
                    $("#lblError2").text("No se han encontrado celdas");
                }
            },
            leerMateriales: function () {
                var self = this;

                var salaCoccion = $("#cmbArea").data("kendoDropDownList").value();
                self.area = salaCoccion;

                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/Materiales/GetEquiposConLotes/" + salaCoccion,
                            dataType: "json"
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "LocPK",
                            fields: {
                                'LocPK': { type: "number" },
                                'LOCID': { type: "string" },
                                'LocPath': { type: "string" },
                                'ParentLocPK': { type: "number" },
                                'Descripcion': { type: "string" },
                                'InitQuantity': { type: "number" },
                                'Quantity': { type: "number" },
                                'UomID': { type: "string" },
                                'PoliticaVaciado': { type: "string" }
                            },
                        }
                    },
                    sort: { field: "LOCID", dir: "asc" }
                });

                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                var CHANGE = 'change',
                                $grid = $('#gridGestionMateriales');


                // Unbind existing refreshHandler in order to re-create with different column set
                if ($grid.length > 0 && $grid.data().kendoGrid) {
                    var thisKendoGrid = $grid.data().kendoGrid;

                    if (thisKendoGrid.dataSource && thisKendoGrid._refreshHandler) {
                        thisKendoGrid.dataSource.unbind(CHANGE, thisKendoGrid._refreshHandler);
                        $grid.removeData('kendoGrid');
                        $grid.empty();
                    }
                }

                $("#gridGestionMateriales").kendoGrid({
                    dataSource: self.ds,
                    sortable: true,
                    selectable: "multiple, row",
                    detailTemplate: kendo.template(this.$("#templateDetalle").html()),
                    //detailInit: this.detailInitLote,
                    detailExpand: function (e) {                        
                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                        self.selectedMasterRow = e;
                        self.detailInitLote(e);                        
                    },
                    scrollable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    resizable: true,
                    height:"auto",
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    toolbar: [
                           {
                               template: "<a id='btnCrear' class='k-button k-button-icontext k-grid-add' data-funcion='FAB_PROD_RES_8_Gestion_Materias_Primas' style=' background-color:green;color:white;'><span class='k-icon k-add'></span>" + window.app.idioma.t('CREAR_LOTE') + "</a>"
                           },
                           {
                               text: window.app.idioma.t('QUITAR_FILTROS'),
                               template: "<a id='btnLimpiarFiltros' class='k-button k-button-icontext k-i-delete'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</a>"
                           }

                    ],
                    columns: [
                        {
                            field: "LocPK", hidden: true
                        },
                        {
                            field: "ParentLocPK", hidden: true
                        },
                        {
                            field: "LocPath", hidden: true
                        },
                        {
                            field: "LOCID",
                            title: window.app.idioma.t("ID_UBICACION"),
                            width: 100
                        },
                        {
                            field: "Descripcion",
                            title: window.app.idioma.t("UBICACION"),
                            width: 130
                        },
                        {
                            field: "PoliticaVaciado",
                            title: window.app.idioma.t("POLITICA_VACIADO"),
                            width: 50,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=PoliticaVaciado#' style='width: 14px;height:14px;margin-right:5px;'/>#= PoliticaVaciado#</label></div>";
                                    }
                                }
                            }
                        },
                        //{
                        //    field: "InitQuantity",
                        //    title: window.app.idioma.t("CANTIDAD"),
                        //    width: 70
                        //},
                        {
                            field: "Quantity",
                            title: window.app.idioma.t("CANTIDAD_ACTUAL"),
                            width: 130,
                            template: "#=kendo.toString(Quantity,'n2')# #=UomID.toUpperCase()#"
                        },
                        {
                            field: "UomID",
                            template: "#=UomID.toUpperCase()#",
                            title: window.app.idioma.t("UD_MEDIDA"),
                            hidden: true,
                            width: 80,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=UomID#' style='width: 14px;height:14px;margin-right:5px;'/>#= UomID#</label></div>";
                                    }
                                }
                            }
                        }
                    ],
                    dataBound: function (e) { self.resizeGrid(e, self); }
                }); 

                this.$("[data-funcion]").checkSecurity();
            },
            detailInitLote: function (e) {
                var self = this;
                var detailRow = e.detailRow;
                
                $("#gridGestionMateriales").data("kendoGrid").clearSelection();
                $("#gridGestionMateriales").data("kendoGrid").select(e.masterRow);                

                var datos = $("#gridGestionMateriales").data("kendoGrid").dataItem(e.masterRow)
                var idEq = datos.LocPK;
                var dsLote = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/Materiales/GetMaterialesUbicacion/" + idEq,
                            dataType: "json"
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "DefID",
                            fields: {
                                'LocPK': { type: "number" },
                                'LocPath': { type: "string" },
                                'LotPK': { type: "number" },
                                'InitQuantity': { type: "number" },
                                'Quantity': { type: "number" },
                                'UomID': { type: "string" },
                                'DefID': { type: "string" },
                                'Descript': { type: "string" },
                                'DefPK': { type: "number" },
                                'ClassDescript': { type: "string" },
                                'LastUpdate': { type: "date" },
                                'LoteMes': { type: "string" },
                                'CreatedOn': {type: "date"}
                            }
                        }
                    },
                    sort: { field: "CreatedOn", dir: "asc" }
                });

                kendo.ui.progress(self.$("#gridDetalleLote"), true);
                self.gridDetalle = detailRow.find("#gridDetalleLote").kendoGrid({
                    dataSource: dsLote,
                    sortable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    resizable: true,
                    scrollable: false,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    toolbar: [
                           {
                               text: window.app.idioma.t('QUITAR_FILTROS'),
                               template: "<a id='btnLimpiarFiltros' class='k-button k-button-icontext k-i-delete'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</a>"
                           }

                    ],
                    columns: [
                        {
                            title: window.app.idioma.t('EDITAR'),
                            template: "<a id='btnEditar#=LotPK#' class='k-button k-grid-edit editarLote' data-funcion='FAB_PROD_RES_8_Gestion_Materias_Primas' style='min-width:16px;'><span class='k-icon k-edit'></span></a>",
                            width: "40px",
                            attributes: { style: "text-align:center;" }
                        },
                        {
                            title: window.app.idioma.t('QUITAR_LOTE'),
                            //style='width:82px; min-width:16px;'
                            template: "<a id='btnMover#=LotPK#' class='k-button moverLote' data-funcion='FAB_PROD_RES_8_Gestion_Materias_Primas' ><span class='k-icon k-delete'> </span>&ensp;Eliminar</a>",
                            width: "95px",
                            attributes: {style: "text-align:center;"}
                        },
                        {
                            field: "Descripcion", hidden: true
                        },
                        {
                            field: "LocPath", hidden: true
                        },
                        {
                            field: "LotPK", hidden: true
                        },
                        {
                            field: "DefPK", hidden: true
                        },
                        {
                            field: "DefID",
                            title: window.app.idioma.t("ID_MATERIAL"),
                            width: 80
                        },
                        {
                            field: "Descript",
                            title: window.app.idioma.t("MATERIAL"),
                            width: 220
                        },
                        {
                            field: "ClassDescript",
                            title: window.app.idioma.t("CLASE"),
                            width: 110,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=ClassDescript#' style='width: 14px;height:14px;margin-right:5px;'/>#= ClassDescript#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Quantity",
                            title: window.app.idioma.t("CANTIDAD_ACTUAL"),
                            width: 130,
                            template: "#=kendo.toString(Quantity,'n2')# #=UomID.toUpperCase()#"
                        },
                        {
                            field: "UomID",
                            title: window.app.idioma.t("UD_MEDIDA"),
                            template: "#=UomID.toUpperCase()#",
                            hidden: true,
                            width: 80,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=UomID#' style='width: 14px;height:14px;margin-right:5px;'/>#= UomID#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "serialNumber",
                            title: window.app.idioma.t("LOTE_PROVEEDOR"),
                            width: 80,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=serialNumber#' style='width: 14px;height:14px;margin-right:5px;'/>#= serialNumber#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "LoteMes", hidden: true
                        },
                        {
                            field: "LastUpdate",
                            title: window.app.idioma.t("FECHA_ACTUALIZACION"),
                            format: "{0:dd/MM/yyyy HH:mm:ss}",
                            width: 130,
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: "dd/MM/yyyy HH:mm:ss",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        }
                    ],
                    dataBinding: function (e) {                        
                        kendo.ui.progress(self.$("#gridDetalleLote"), false);                        
                        self.resizeTab;
                    },
                    dataBound: function (e) {
                        self.RefreshMasterGridQuantity(e);
                    },
                }).data("kendoGrid");

                detailRow.find("#gridDetalleLote").kendoTooltip({
                    filter: "td:nth-child(12)", //this filter selects the first column cells
                    position: "right",
                    content: function (e) {
                        var dataItem = $("#gridDetalleLote").data("kendoGrid").dataItem(e.target.closest("tr"));
                        var content = dataItem.LoteMes;
                        return content
                    }
                }).data("kendoTooltip");

                if (datos.Descripcion.toUpperCase().indexOf("LEVADURA") >= 0 && datos.Descripcion.toUpperCase().indexOf("CERVEZA") == -1)
                    $("#gridDetalleLote thead [data-field=serialNumber] .k-link").html(window.app.idioma.t("MATRICULAGENERACION"))
                else
                    $("#gridDetalleLote thead [data-field=serialNumber] .k-link").html(window.app.idioma.t("LOTE_PROVEEDOR"))


            },
            RefreshMasterGridQuantity: function(e)
            {
                var self = this;
                if ($("#pass").text() == "true") {
                    var totalQuantity = 0.0;
                    $.each(e.sender._data, function (index, item) { totalQuantity += item.Quantity });
                    var element = $("#gridGestionMateriales").data("kendoGrid").dataItem($("#gridGestionMateriales").data("kendoGrid").select());
                    var index = String($("#gridGestionMateriales").data("kendoGrid").dataSource.indexOf(element));
                    element.Quantity = Math.round(totalQuantity * 100) / 100;
                    $("#gridGestionMateriales").data("kendoGrid").refresh();
                    $("#gridGestionMateriales").data("kendoGrid").expandRow($("tr.k-master-row:eq(" + index + ")"));
                    $("#pass").text("false");
                }
            },
            LimpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            eliminar: function () {
                this.remove();
            },
            resizeGrid: function (e, self) {               
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var gridElement = null;

                if (e.sender._cellId != undefined)
                {
                    gridElement = $("#" + e.sender._cellId.split('_')[0]);
                }else
                    gridElement = $("#gridGestionMateriales");
                    
                        var dataArea = gridElement.find(".k-grid-content"),
                        gridHeight = gridElement.innerHeight(),
                        otherElements = gridElement.children().not(".k-grid-content");

                dataArea.height(contenedorHeight - cabeceraHeight - 150);

            },            
            crear: function () {
                var self = this;
                self.vistaCrearLoteUbicacion = new vistaCrearLoteUbicacion(self.selectedMasterRow);
            },
            actualiza: function () {
                var self = this;
                self.ds.read();
            },
            editarLote: function (e) {
                var self = this;                
                //Obtenemos la línea seleccionada del grid
                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var data = $(self.selectedMasterRow.detailRow.find("#gridDetalleLote")).data("kendoGrid").dataItem(tr);
                //var data = $("#gridDetalleLote").data("kendoGrid").dataItem(tr);

                self.vistaEditarLote = new vistaEditarLote(self.selectedMasterRow,data, self.area);
            },
            moverLote: function (e) {
                var self = this;

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ELIMINARLOTE')
                    , msg: window.app.idioma.t('DESEA_REALMENTE_ELIMINAR_ESTE_LOTE_DE'), funcion: function () { self.moverLoteUbicacion(e); }, contexto: this
                });

            },
            moverLoteUbicacion: function (e) {

                var self = this;
                var tr = $(e.target.parentNode.parentNode).closest("tr"); // get the current table row (tr)
                // get the data bound to the current table row
                var data = $(self.selectedMasterRow.detailRow.find("#gridDetalleLote")).data("kendoGrid").dataItem(tr);
                var datos = {};
                datos.equipo = data.LocPath;
                datos.material = data.DefID;
                datos.pk = data.LotPK;
                datos.celda = $("#cmbArea").data("kendoDropDownList").value();

                $.ajax({
                    type: "POST",
                    url: "../api/moverLote/",
                    dataType: 'json',
                    data: JSON.stringify(datos),
                    contentType: "application/json; charset=utf-8",
                    cache: false,
                    async: true,
                }).done(function (res) {
                    var datos = $("#gridGestionMateriales").data("kendoGrid").dataItem($("#gridGestionMateriales").data("kendoGrid").select());
                    var idEq = datos.LocPK;
                    var dsLote = new kendo.data.DataSource({
                        transport: {
                            read: {
                                url: "../api/Materiales/GetMaterialesUbicacion/" + idEq,
                                dataType: "json"
                            }
                        },
                        pageSize: 50,
                        schema: {
                            model: {
                                id: "DefID",
                                fields: {
                                    'LocPK': { type: "number" },
                                    'LocPath': { type: "string" },
                                    'LotPK': { type: "number" },
                                    'InitQuantity': { type: "number" },
                                    'Quantity': { type: "number" },
                                    'UomID': { type: "string" },
                                    'DefID': { type: "string" },
                                    'Descript': { type: "string" },
                                    'DefPK': { type: "number" },
                                    'ClassDescript': { type: "string" },
                                    'LastUpdate': { type: "date" },
                                    'LoteMes': { type: "string" },
                                    'CreatedOn': { type: "date" }
                                }
                            }
                        },
                        sort: { field: "CreatedOn", dir: "asc" }
                    });

                    $(self.selectedMasterRow.detailRow.find("#gridDetalleLote")).data("kendoGrid").setDataSource(dsLote);
                    $("#pass").text("true");
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('QUITADO_EL_LOTE'), 4000);
                }).fail(function (err) {
                    Backbone.trigger('eventCierraDialogo');
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR'), 4000);
                });
            }
        });

        return gridMateriales;
    });