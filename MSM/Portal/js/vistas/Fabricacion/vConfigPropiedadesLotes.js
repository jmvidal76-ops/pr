define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/ConfigPropiedadesLotes.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            dsPropiedadesLotes: null,
            grid: null,
            permisoEdicion: false,
            tooltip: null,
            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;

                self.permisoEdicion = TienePermiso(282);

                self.dsPropiedadesLotes = new kendo.data.DataSource({
                    async: false,
                    transport: {
                        read: {
                            url: "../api/ObtenerPropiedadesLotes",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "GET"
                        },
                        create: {
                            url: "../api/AgregarPropiedadesLotes",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        update: {
                            url: "../api/ActualizarPropiedadesLotes",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "PUT"
                        },
                        parameterMap: function (options, type) {
                            if (type == "update" || type == "create") {
                                return JSON.stringify(options);
                            } 
                        }
                    },
                    requestEnd: function (e) {
                        var type = e.type;
                        if (type == "update" || type == "create")
                            self.dsPropiedadesLotes.read();
                    },
                    sort: { field: "Creado", dir: "desc" },
                    schema: {
                        model: {
                            id: "IdPropiedad",
                            fields: {
                                'IdPropiedad': { type: "number", editable: false },
                                'Nombre': {
                                    type: "string",
                                    validation: {
                                        required: true,
                                        customNombre: function (input) {
                                            if (input.attr("data-bind") == "value:Nombre" && input.val() == 0) {
                                                input.attr("data-customNombre-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'IdClaseMaterial': {
                                    type: "string",
                                    validation: {
                                        required: true,
                                        customIdClaseMaterial: function (input) {
                                            if (input.attr("data-bind") == "value:IdClaseMaterial" && input.val() == 0) {
                                                input.attr("data-customIdClaseMaterial-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'Unidad': {
                                    type: "string",
                                    validation: {
                                        required: true,
                                        customUnidad: function (input) {
                                            if (input.attr("data-bind") == "value:Unidad" && input.val() == 0) {
                                                input.attr("data-customUnidad-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }

                                },
                                'Activo': {
                                    validation: {
                                        required: true,
                                        customActivo: function (input) {
                                            if (input.attr("data-bind") == "value:Activo" && input.text() == window.app.idioma.t('SELECCIONE_UNO')) {
                                                input.attr("data-customActivo-msg", window.app.idioma.t('SELECCIONE_UNO'));
                                                input.parents("td").append(self.tooltip(Message = "", Key = "sl" + input.attr("data-bind").split(":")[1]));
                                                return false;
                                            }
                                            return true;
                                        }
                                    }
                                },
                                'MensajeSAI': { type: "string" },
                                'IdAccionPropiedad': { type: "int" },
                                'NombreAccionPropiedad': { type: "string" },
                                'Creado': { type: "date", editable: false },
                                'CreadoPor': { type: "string", editable: false },
                                'Actualizado': { type: "date", editable: false },
                                'ActualizadoPor': { type: "string", editable: false },
                                'IdGrupoUbicacion': { type: "int" },
                                'NombreGrupoUbicacion': { type: "string" },
                            }
                        }
                    },
                    pageSize: 50

                });

                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                self.tooltip = kendo.template($("#tooltip").html());

                self.grid = $("#grid").kendoGrid({
                    dataSource: self.dsPropiedadesLotes,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    toolbar: [
                        {
                            template: "<label style='margin-top: 5px'>" + window.app.idioma.t('MENSAJE_PROPIEDADES_LOTES') + "</label>"
                        },
                        {
                            name: "create", text: window.app.idioma.t("AGREGAR")
                        }
                    ],
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    excel: {
                        allPages: true,
                    },
                    resizable: true,
                    scrollable: true,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    editable: {
                        mode: "popup",
                        confirmation: false
                    },
                    edit: function (e) {
                        var isNew = e.model.isNew();
                        let _columnasGrid = $("#grid").data("kendoGrid").columns;
                        var wnd = $(e.container).data("kendoWindow");
                        wnd.setOptions({
                            width: "30%"
                        });

                        wnd.center();

                        for (var i = 0; i < _columnasGrid.length; i++) {
                            let _columna = _columnasGrid[i].field;
                            if (_columna) {
                                switch (_columna) {
                                    //No se añade enumerado porque estos son los nombres de las columnas que se muestran en el grid
                                    case "Creado":
                                    case "Actualizado":
                                        e.container.find(".k-edit-label:eq(" + i + ")").hide();
                                        e.container.find(".k-edit-field:eq(" + i + ")").hide();
                                        break;
                                    default:
                                        if (!isNew && _columna == "IdClaseMaterial") {
                                            e.container.find(".k-edit-label:eq(" + i + ")").hide();
                                            e.container.find(".k-edit-field:eq(" + i + ")").hide();
                                        }
                                        break;
                                }
                            }
                        }

                        if (!isNew) {
                            $('.k-window-title').text(window.app.idioma.t("EDITAR"));
                            $(".k-grid-update").text(window.app.idioma.t("ACTUALIZAR"));
                            $(".k-grid-cancel").text(window.app.idioma.t("CANCELAR"));

                        } else {
                            $('.k-window-title').text(window.app.idioma.t("CREAR"));
                            $(".k-grid-update").text(window.app.idioma.t("GUARDAR"));
                        }
                    },
                    cancel: function () {
                        $("#grid").data("kendoGrid").dataSource.read();
                    },
                    dataBound: function (e) {
                        var grid = this;
                        var data = this._data;

                        for (var i = 0; i < data.length; i++) {
                            var currentUid = data[i].uid;
                            if (data[i].IdPropiedad == 0 || !self.permisoEdicion) {
                                var currentRow = grid.table.find("tr[data-uid='" + currentUid + "']");
                                var editButton = $(currentRow).find(".k-grid-edit");
                                var deleteButton = $(currentRow).find(".k-grid-Delete");
                                editButton.hide();
                                deleteButton.hide();
                            }
                        }

                        self.ResizeGrid();
                    },
                    columns: [
                        {
                            field: "Nombre",
                            width: 200,
                            title: window.app.idioma.t("NOMBRE"),
                            template: "<span class='addTooltip'>#=Nombre #</span>",
                            editor: function (e, options) { return self.TextBoxEditor(e, options, options.model.Nombre) },
                            attributes: {
                                style: 'white-space: nowrap ',
                            },
                        },
                        {
                            field: "IdClaseMaterial",
                            width: 200,
                            title: window.app.idioma.t("CLASE_MATERIAL") + " " + window.app.idioma.t("UBICACION_LOTE"),
                            attributes: { "align": "center" },
                            editor: function (e, options) { return self.ClaseMaterialDropDownListEditor(e, options) },
                        },
                        {
                            field: "Unidad",
                            width: 150,
                            title: window.app.idioma.t("UNIDAD"),
                            attributes: { "align": "center" },
                            editor: function (e, options) { return self.TextBoxEditor(e, options, options.model.Unidad) },
                        },
                        {
                            field: "IdGrupoUbicacion",
                            template: "#=NombreGrupoUbicacion ? NombreGrupoUbicacion : ''#",
                            width: 150,
                            title: window.app.idioma.t("GRUPO_UBICACION"),
                            attributes: { "align": "center" },
                            editor: function (e, options) { return self.GruposUbicacionDropDownListEditor(e, options) },
                        },
                        {
                            field: "MensajeSAI",
                            width: 150,
                            title: window.app.idioma.t("MENSAJE_SAI"),
                            attributes: { "align": "center" },
                            editor: function (e, options) { return self.TextBoxEditor(e, options, options.model.MensajeSAI) },
                        },
                        {
                            field: "IdAccionPropiedad",
                            template: "#=NombreAccionPropiedad ? NombreAccionPropiedad : ''#",
                            width: 150,
                            title: window.app.idioma.t("ACCION"),
                            attributes: { "align": "center" },
                            editor: function (e, options) { return self.AccionesPropiedadesDropDownListEditor(e, options) },
                        },
                        {
                            field: "Activo",
                            width: 150,
                            title: window.app.idioma.t("ACTIVO"),
                            attributes: { "align": "center" },
                            template: function (e, options) { return self.EstadoTemplate(e, options) },
                            editor: function (e, options) { return self.EstadoActivoDropDownList(e, options) }
                        },
                        {
                            field: "Creado",
                            width: 150,
                            title: window.app.idioma.t("FECHA_CREACION"),
                            attributes: { "align": "center" },
                            template: '<span class="addTooltip">#= Creado != null ? kendo.toString(new Date(Creado), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #</span>',
                        },
                        {
                            field: "Actualizado",
                            width: 150,
                            title: window.app.idioma.t("FECHA_ACTUALIZACION"),
                            attributes: { "align": "center" },
                            template: '<span class="addTooltip">#= Actualizado != null ? kendo.toString(new Date(Actualizado), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #</span>',
                            //editor: function (e,options) { return self.UoMDropdDownEditor(e,options) }
                        },
                        {
                            field: "coms",
                            width: 250,
                            title: window.app.idioma.t("OPERACIONES"),
                            attributes: { "align": "center" },
                            command: [
                                { name: "edit", text: { edit: window.app.idioma.t("EDITAR"), update: window.app.idioma.t("ACTUALIZAR"), cancel: window.app.idioma.t("CANCELAR") } },
                            ],
                        },

                    ],
                }).data("kendoGrid");

                $("#grid").kendoTooltip({
                    filter: ".addTooltip",
                    content: function (e) {
                        return e.target.html();
                    }
                }).data("kendoTooltip");


            },
            events: {
                
            },
            TextBoxEditor: function (container, options, value) {
                $('<input class="width-80 k-textbox" value="' + value + '" name="sl' + options.field + '" data-text-field="' + options.field + '" data-value-field="' + options.field
                    + '" data-bind="value:' + options.field + '" id="' + options.field + '" />')
                    .appendTo(container);
            },
            ClaseMaterialDropDownListEditor: function (container,options) {
                var dsClaseMaterial = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetClaseMaterial",
                            dataType: "json"
                        }
                    }
                });

                $('<input data-text-field="Descripcion"  class="width-80" id="claseMaterial"  data-value-field="IdClaseMaterial" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                    optionLabel: window.app.idioma.t('SELECCIONE_UNO'),
                    dataSource: dsClaseMaterial,
                    filter: "contains",
                    dataTextField: "Descripcion",
                    template: "#=IdClaseMaterial +' - '+Descripcion#",
                    dataValueField: "IdClaseMaterial"
                    });

                var materialDrop = $("#claseMaterial").data("kendoDropDownList");
                materialDrop.list.width("auto");
            },
            AccionesPropiedadesDropDownListEditor: function (container, options) {
                let dsAccion = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerAccionesPropiedadesLotes",
                            dataType: "json"
                        }
                    }
                });

                $('<input data-text-field="Nombre"  class="width-80" id="accionPropiedad"  data-value-field="IdAccionPropiedad" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        optionLabel: window.app.idioma.t('SELECCIONE_UNO'),
                        dataSource: dsAccion,
                        filter: "contains",
                        dataTextField: "Nombre",
                        dataValueField: "IdAccionPropiedad",
                        select: function (e) {
                            var grid = $("#grid").data("kendoGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                            if (item)
                                item.set("IdAccionPropiedad", dataItem.IdAccionPropiedad);
                        },
                    });
            },
            GruposUbicacionDropDownListEditor: function (container, options) {
                let dsGrupos = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/ObtenerGruposUbicaciones",
                            dataType: "json"
                        }
                    },
                    sort: { field: "Nombre", dir: "asc" },
                });

                $('<input data-text-field="Nombre" class="width-80" id="grupoUbicacion" data-value-field="IdGrupo" name="sl' + options.field + '" data-bind="value:' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        optionLabel: window.app.idioma.t('SELECCIONE_UNO'),
                        dataSource: dsGrupos,
                        filter: "contains",
                        dataTextField: "Nombre",
                        dataValueField: "IdGrupo",
                        select: function (e) {
                            var grid = $("#grid").data("kendoGrid");
                            var currentUid = options.model.uid;
                            var dataItem = this.dataItem(e.item);
                            var currentRow = grid.tbody.find("tr[data-uid='" + currentUid + "']");
                            var item = grid.dataItem(currentRow);
                            if (item)
                                item.set("IdGrupoUbicacion", dataItem.IdGrupo);
                        },
                    });
            },
            EstadoActivoDropDownList: function (container, options) {
                var _value = typeof options.model.Activa != "undefined" ? options.model.Activa : 1;
                var siNoDropDownDataSource = new kendo.data.DataSource(
                    {
                        data: [
                            { Activo: 0, Text: window.app.idioma.t('NO') },
                            { Activo: 1, Text: window.app.idioma.t('SI') }]
                    });
                $('<input  class="width-80" name="' + options.field + '" data-bind="value:' + options.field + '" data-text-field="Text"  data-value-field="Activo"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        dataSource: siNoDropDownDataSource,
                        optionLabel: window.app.idioma.t('SELECCIONE_UNO'),
                        dataTextField: "Text",
                        dataValueField: "Activo",
                        dataBound: function () {
                            var ds = this.dataSource.data();
                            if (ds.length >= 1) {
                                this.select(_value);
                            }
                        }
                    });

                $('<span class="k-invalid-msg" data-for="' + options.field + '"></span>').appendTo(container);

            },
            EstadoTemplate: function (data) {
                var estado = data.Activo ? window.app.idioma.t('SI') : window.app.idioma.t('NO');
                return '<span class="addTooltip">' + estado + '</span>';
            },
            ResizeGrid: function () {
                var cabeceraHeight1 = $("#divCabeceraVista").height();
                var contenedorHeight = $("#center-pane").height();
                var toolbarHeight = $(".k-grid-toolbar").height();
                var cabeceraHeight = $(".k-grouping-header").height();
                var headerHeightGrid = $(".k-grid-header").height();

                var gridElement = $("#grid"),
                    dataArea = gridElement.find(".k-grid-content:first"),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - cabeceraHeight1  - otherElementsHeight);

            },
            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

