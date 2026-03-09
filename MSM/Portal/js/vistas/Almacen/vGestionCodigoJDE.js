define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/GestionCodigoJDE.html', 'compartido/notificaciones', 'compartido/util', 'vistas/vDialogoConfirm', 'modelos/mSesion', 'jszip','xlsx'],
    function (_, Backbone, $, plantilla, Not, util, VistaDlgConfirm, Session, JSZip, XLSX) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            grid: null,
            dataSourceGrid: null,
            tooltip: null,
            permiso: false,
            //#endregion ATTRIBUTES

            initialize: function () {
                window.JSZip = JSZip;
                window.XLSX = XLSX;
                var self = this;
                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.tooltip = kendo.template($("#tooltip").html());

                for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                    if (window.app.sesion.attributes.funciones[i].id === 151)
                        self.permiso = true;
                }

                self.dataSourceGrid = new kendo.data.DataSource({
                    // async: false,
                    transport: {
                        read: {
                            url: "../api/GetMateriasPrimas",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8"                            
                        },
                        create: {
                            url: "../api/CreateMateriasPrimas",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "POST",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_CREANDO_CODIGO"), 4000);
                                } else {
                                    var gridTran = $("#grid").data("kendoGrid");
                                    gridTran.dataSource.read();
                                }
                            },
                        },
                        update: {
                            url: "../api/UpdateMateriasPrimas",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_ACTUALIZANDO_CODIGO"), 4000);
                                } else {
                                    var gridTran = $("#grid").data("kendoGrid");
                                    gridTran.dataSource.read();
                                }
                            },
                        },
                        destroy: {
                            url: "../api/DeleteMateriasPrimas",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (e.status == 500) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_ELIMINAR_CODIGO"), 4000);
                                }
                            }
                        },
                        parameterMap: function (options, type) {
                            if (type !== "read") {
                                var permiso = false;
                                for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                                    if (window.app.sesion.attributes.funciones[i].id === 151)
                                        permiso = true;
                                }
                                if (!permiso) {
                                    Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                                } else {
                                    var _drpProvComb = $("#provCmb").data("kendoDropDownList");
                                    if (typeof _drpProvComb != "undefined") {
                                        var proveedorItem = $("#provCmb").data("kendoDropDownList").dataItem($("#provCmb").data("kendoDropDownList").select());
                                        options.ID_PROVEEDOR = proveedorItem.IdProveedor;
                                        options.PROVEEDOR = proveedorItem.Nombre;
                                    }
                                    return JSON.stringify(options);

                                }
                            }

                        }
                    },
                    requestStart: function () {
                        kendo.ui.progress($("#grid"), true);
                    },
                    requestEnd: function (request) {
                        kendo.ui.progress($("#grid"), false);
                    },
                    schema: {
                        model: {
                            id: "IdMaestroEAN",
                            fields: {
                                'IdMaestroEAN': { type: "int" },
                                'EAN': {
                                    type: "string",
                                    validation: {
                                        required: true,
                                        customEAN: function (input) {
                                            if (input.attr("data-bind") == "value:EAN" && input.val() == 0) {
                                                input.attr("data-customEAN-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = ""));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'IdMaterial': { type: "string", editable: false },
                                'Nombre': {
                                    type: "string",
                                    validation: {
                                        required: true,
                                        customNombre: function (input) {
                                            if (input.attr("data-bind") == "value:Nombre" && input.val() == 0) {
                                                input.attr("data-customNombre-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'IdProveedor': { type: "string", editable: false },
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
                                'Fecha': { type: "date", editable: false, defaultValue: new Date() },
                                'Tipo': { type: "string", editable: false, defaultValue: "MES" },
                                'IdOrigen': { type: "number", editable: false, defaultValue: 1 },
                                'Origen': { type: "string", editable: false, defaultValue: "MES" },
                                'Cantidad': { type: "number" },
                                'UoM': { type: "string", editable: false }
                            }
                        }
                    },
                    pageSize: 500
                });

                self.grid = $("#grid").kendoGrid({
                    dataSource: self.dataSourceGrid,
                    sortable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    toolbar: [
                        {
                            name: "create", text: window.app.idioma.t("AGREGAR")

                        },
                        {
                            name: "excel", text: window.app.idioma.t("EXPORTAR_EXCEL")
                        },
                        {
                            template: '<a class="k-button k-button-icontext" id="InsExcel"> <span class="k-icon k-i-excel"></span>' + window.app.idioma.t("IMPORTAR_EXCEL") + '</a>'
                        }
                    ],
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    excel: util.ui.default.gridExcelDate('RELACION_EANS'),
                    resizable: true,
                    scrollable: true,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [500, 1000, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    editable: "inline",
                    cancel: function () {
                        $("#grid").data("kendoGrid").dataSource.read();
                    },
                    dataBound: function (e) {
                        var grid = this;
                        var data = this._data;

                        for (var i = 0; i < data.length; i++) {
                            var currentUid = data[i].uid;
                            if (data[i].IdOrigen != 1 || !self.permiso) {
                                var currentRow = grid.table.find("tr[data-uid='" + currentUid + "']");
                                var editButton = $(currentRow).find(".k-grid-edit");
                                var deleteButton = $(currentRow).find(".k-grid-Delete");
                                editButton.hide();
                                deleteButton.hide();
                            }
                        }

                        self.ResizeTab();
                    },
                    columns: [
                        {
                            field: "EAN",
                            attributes: { "align": "center" },
                            width: "10%",
                            editor: function (e, options) { return self.EANInput(e, options) },
                        },
                        {
                            field: "IdMaterial",
                            title: window.app.idioma.t("ID_MATERIAL"),
                            attributes: {
                                "align": "center",
                                "class": "IdMaterial"
                            },                            
                            width: "8%",
                        },
                        {
                            field: "Nombre",
                            width: "20%",
                            title: window.app.idioma.t("NOMBRE"),
                            template: "<span class='addTooltip'>#=Nombre #</span>",
                            editor: function (e, options) { return self.MaterialDropDownEditor(e, options) },
                            attributes: {
                                style: 'white-space: nowrap ',
                            },
                        },
                        {
                            field: "UoM",
                            width: "5%",
                            title: window.app.idioma.t("UNIDAD_MEDIDA"),
                            attributes: {
                                "align": "center",
                                "class": "UoM"
                            },
                            //editor: function (e,options) { return self.UoMDropdDownEditor(e,options) }
                        },
                        {
                            field: "Cantidad",
                            width: "7%",
                            title: window.app.idioma.t("CANTIDAD"),
                            attributes: { "align": "center" },
                        },
                        {
                            field: "IdProveedor",
                            width: "8%",
                            title: window.app.idioma.t("ID_PROVEEDOR"),
                            attributes: {
                                "align": "center",
                                "class": "IdProveedor"
                            },
                        },
                        {
                            field: "Proveedor",
                            title: window.app.idioma.t("PROVEEDOR"),
                            template: "<span class='addTooltip'>#=Proveedor #</span>",
                            attributes: {
                                style: 'white-space: nowrap ',
                            },
                            editor: function (e, options) { return self.ProveedorDropDownEditor(e, options) },
                            width: "20%",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Proveedor#' style='width: 14px;height:14px;margin-right:5px;'/>#= Proveedor#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            field: "Fecha",
                            width: "10%",
                            title: window.app.idioma.t("FECHA"),
                            attributes: { "align": "center", "class": 'addTooltip' },
                            template: '#= Fecha != null ? kendo.toString(new Date(Fecha), kendo.culture().calendars.standard.patterns.MES_FechaHora ) : "" #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        //{
                        //    field: "Tipo",
                        //    width: "5%",
                        //    title: window.app.idioma.t("TIPO"),
                        //    attributes: { "align": "center" },
                        //    filterable: {
                        //        multi: true,
                        //        itemTemplate: function (e) {
                        //            if (e.field == "all") {
                        //                return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                        //            } else {
                        //                return "<div><label><input type='checkbox' value='#=Tipo#' style='width: 14px;height:14px;margin-right:5px;'/>#= Tipo#</label></div>";
                        //            }
                        //        }
                        //    },
                        //},
                        {
                            field: "Origen",
                            width: "5%",
                            title: window.app.idioma.t("ORIGEN"),
                            attributes: { "align": "center" },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Origen#' style='width: 14px;height:14px;margin-right:5px;'/>#= Origen#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            field: "coms",
                            width: "14%",
                            title: window.app.idioma.t("OPERACIONES"),
                            attributes: { "align": "center" },
                            command: [
                                { name: "edit", text: { edit: window.app.idioma.t("EDITAR"), update: window.app.idioma.t("ACTUALIZAR"), cancel: window.app.idioma.t("CANCELAR") } },
                                {
                                    name: "Delete", text: window.app.idioma.t("ELIMINAR"),
                                    click: function (e) {
                                        e.preventDefault(); //prevent page scroll reset 
                                        var grid = $("#grid").data("kendoGrid");
                                        var tr = $(e.target).closest("tr"); //get the row for deletion
                                        var data = this.dataItem(tr); //get the row data so it can be referred later


                                        if (self.permiso) {
                                            this.confirmacion = new VistaDlgConfirm({
                                                titulo: window.app.idioma.t('ELIMINAR'), msg: window.app.idioma.t('CONFIRMACION_ELIMINAR_CODIGO'), funcion: function () {
                                                    grid.dataSource.remove(data);  //prepare a "destroy" request
                                                    grid.dataSource.sync();  //actually send the request (might be ommited if the autoSync option is enabled in the dataSource)

                                                    Backbone.trigger('eventCierraDialogo');


                                                }, contexto: this
                                            });


                                        } else {
                                            Not.crearNotificacion('warning', window.app.idioma.t('INFORMACION'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                                        }
                                    }
                                }

                            ],
                        },

                    ],
                    excelExport: function (e) {
                        var columns = e.workbook.sheets[0].columns;
                        var rows = e.workbook.sheets[0].rows;
                        e.workbook.sheets[0].rows = rows.filter(x => x.cells[8].value == "MES" || x.type == "header");
                        var limitedrows = e.workbook.sheets[0].rows;
                        limitedrows.forEach(function (element) {
                            var currentRow = element.cells;
                            currentRow = currentRow.filter(x => currentRow.indexOf(x) < 7);
                            element.cells = currentRow;
                        })
                        e.workbook.sheets[0].columns = columns.filter(x => columns.indexOf(x) < 7)

                        
                        columns.forEach(function (column) {
                            delete column.width;
                            column.autoWidth = true;
                        });
                    }
                }).data("kendoGrid");

                $("#grid").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");

                $("#divWndProveedor").kendoWindow({
                    width: '40%',
                    visible: false,
                    title: window.app.idioma.t("PROVEEDOR"),
                    modal: true,
                });

                $("#idProveedorNew").kendoNumericTextBox({
                    spinners: false,
                    decimals: 0,
                    format: "#",
                });

            },

            //#region EVENTOS
            events: {
                "click #btnAddProveedor": function (e) { e.preventDefault(); this.ShowWindowProveedor(this) },
                "click #InsExcel": function (e) { $("#inputFile").click() },
                "change #inputFile": function (e) { this.uploadExcel(e.target.files[0], e); },
            },
            //#endregion EVENTOS

            EANInput: function (container, options) {
                $('<input type="text" maxlength="64" class="k-input k-textbox" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container);
                // $('<span class="k-invalid-msg" data-for="sl' + options.field + '"></span>').appendTo(container);


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

                $('<input data-text-field="SourceUoMID" id="uomDrop"  data-value-field="PK" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        dataBound: function (e) {
                            this.value(options.model.UoM)
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
                $('<input data-text-field="DescripcionCompleta" id="materialDrop"  data-value-field="IdMaterial" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        dataBound: function (e) {
                            this.value(options.model.IdMaterial)
                        },
                        select: function (e) {
                            var grid = $("#grid").data("kendoGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                            item.IdMaterial = dataItem.id;
                            item.Nombre = dataItem.Descripcion;
                            item.UoM = dataItem.SourceUoMID;

                            // Actualizamos los campos de IdMaterial y Unidad Medida
                            currentRow.find(".IdMaterial").html(dataItem.id);
                            currentRow.find(".UoM").html(dataItem.SourceUoMID);
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
                                        'SourceUoMID': { type: "string" },
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
                let self = window.app.vista;
                $('<input data-text-field="NombreFull" style="width:80%" id="provCmb" data-value-field="IdProveedor" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        filter: "contains",
                        dataBound: function (e) {
                            if (self.NewIdProveedor) {
                                this.value(self.NewIdProveedor);
                                self.NewIdProveedor = null;
                            }
                            else
                            {
                                this.value(options.model.IdProveedor)
                            }                            
                        },
                        select: function (e) {
                            var grid = $("#grid").data("kendoGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                            item.IdProveedor = dataItem.id;
                            item.Proveedor = dataItem.id;

                            // Actualizamos el campo IdProveedor
                            currentRow.find(".IdProveedor").html(dataItem.id);
                        },
                        open: function (e) {
                            var listContainer = e.sender.list.closest(".k-list-container");
                            listContainer.width(listContainer.width() + kendo.support.scrollbar());
                        },
                        dataSource: {

                            transport: {
                                read: {
                                    url: "../api/GetMaestroProveedorLoteMMPP",
                                    dataType: "json"
                                }

                            },
                            sort: { field: "NombreFull", dir: "asc" },
                            schema: {
                                model: {
                                    id: "IdProveedor",
                                    fields: {
                                        'IdProveedor': { type: "int" },
                                        'Nombre': { type: "string" },
                                        'NombreFull': { type: "string" },
                                    }
                                }
                            }
                        },

                    });


                // $('<span class="k-invalid-msg" data-for="sl' + options.field + '"></span>').appendTo(container);
                var provCmb = $("#provCmb").data("kendoDropDownList");
                provCmb.list.width("auto");
                $('<a id="btnAddProveedor" class="k-button" style="min-width:40px !important;width:10% !important"> <span class="k-icon k-add"></span> </a>').appendTo(container);
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

            eliminar: function () {
                this.remove();
            },

            ShowWindowProveedor: function (self) {
                $('#divWndProveedor').data("kendoWindow").center().open();
                $("#btnSubmitProveedor").unbind('click').bind('click', function () {
                    var idProveedor = $("#idProveedorNew").val();
                    var nombreProveedor = $("#nombreProveedorNew").val();

                    if (idProveedor === "" || nombreProveedor === "" || idProveedor == 0) {
                        $("#errorProveedor").text(window.app.idioma.t("DATOS_PROVEEDOR"))
                    } else {
                        $("#errorProveedor").text();
                        self.AddProveedor(self, idProveedor, nombreProveedor);
                    }
                });
            },
            AddProveedor: function (self, idProveedor, nombreProveedor) {
                var proveedorEAN = { IdProveedor: idProveedor, Nombre: nombreProveedor, IdOrigen: 1 };
                kendo.ui.progress($(".k-window"), true);
                $.ajax({
                    type: "POST",
                    data: JSON.stringify(proveedorEAN),
                    url: "../api/AddProveedorEAN",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    complete: function () {
                        kendo.ui.progress($(".k-window"), false);
                    },
                    success: function (res) {                        
                        if (res) {
                            $("#errorProveedor").text("");
                            $("#provCmb").data("kendoDropDownList").dataSource.read();
                            self.NewIdProveedor = res.IdProveedor;
                            $('#divWndProveedor').data("kendoWindow").close();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PROVEEDOR_ACTUALIZADO'), 4000);
                        } else {
                            self.dialogoConfirm = new VistaDlgConfirm({
                                titulo: window.app.idioma.t('PROVEEDOR'), msg: window.app.idioma.t('PROVEEDOR_EXISTENTE'),
                                funcion: function () { self.UpdateProveedor(self, idProveedor, nombreProveedor); }, contexto: this
                            });
                        }
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GUARDAR'), 4000);
                        }
                    }
                });
            },
            UpdateProveedor: function (self, idProveedor, nombreProveedor) {
                var proveedorEAN = { IdProveedor: idProveedor, Nombre: nombreProveedor, IdOrigen: 1 };
                kendo.ui.progress($("#divWndProveedor"), true);
                $.ajax({
                    type: "POST",
                    data: JSON.stringify(proveedorEAN),
                    async: true,
                    url: "../api/UpdateProveedorEAN",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        self.dialogoConfirm.cancelar();
                        kendo.ui.progress($("#divWndProveedor"), false);
                        if (res) {
                            $("#errorProveedor").text("");
                            $("#provCmb").data("kendoDropDownList").dataSource.read();
                            self.NewIdProveedor = res.IdProveedor;
                            $('#divWndProveedor').data("kendoWindow").close();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PROVEEDOR_ACTUALIZADO'), 4000);
                        } else {
                            $("#errorProveedor").text(window.app.idioma.t("ERROR_PROVEEDOR"))
                        }
                    },
                    error: function (err) {
                        self.dialogoConfirm.cancelar();
                        kendo.ui.progress($("#divWndProveedor"), false);
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GUARDAR'), 4000);
                        }
                    }
                });
            },
            processedData: function (data) {
                //Se elimina los duplicados que tengan el EAN y id jde
                //Se define la columna tipo el valor manual a todos
                //Se modela en el formato de la clase de 'MaestroEANDto'

                var nonduplicate = [];

                data.forEach(x => {
                    nonduplicate.push({
                        "EAN": x["EAN"],
                        "IdMaterial": x[window.app.idioma.t("ID_MATERIAL")],
                        "IdProveedor": x[window.app.idioma.t("ID_PROVEEDOR")],
                        "Proveedor": x[window.app.idioma.t("PROVEEDOR")],
                        "IdOrigen": 1,
                        "Cantidad": x[window.app.idioma.t("CANTIDAD")],
                        "FechaCreado": new Date()
                    });
                });                
                return nonduplicate;              
            },
            uploadExcel: function (archivo, e) {
                var self = this;

                var reader = new FileReader();
                reader.readAsArrayBuffer(archivo)
                reader.onload = function () {
                    var workbook = XLSX.read(reader.result, { type: 'buffer' });
                    var json = XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1, null);
                    var validateddData = self.processedData(json);
                    kendo.ui.progress($("#grid"), true);
                    e.target.value = ""

                    $.ajax({
                        type: "POST",
                        data: JSON.stringify(validateddData),
                        async: true,
                        url: "../api/CreateMultiplesMateriasPrimas",
                        contentType: "application/json; charset=utf-8",
                        success: function (res) {
                            kendo.ui.progress($("#grid"), false);
                            var mensaje = validateddData.length + window.app.idioma.t('SUBIDA_ARCHIVO_EXCEL_1') + json.length + window.app.idioma.t('SUBIDA_ARCHIVO_EXCEL_2') ;
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), mensaje, 4000);

                            $("#grid").data("kendoGrid").dataSource.read();

                        },
                        error: function (err) {
                            $('#inputFile').val('');
                            $("#grid").data("kendoGrid").dataSource.read();

                            if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GUARDAR_IMPORT_EXCEL'), 4000);
                            }
                            kendo.ui.progress($("#grid"), false);
                        }
                    });
                }
            }

        });

        return vista;
    });

