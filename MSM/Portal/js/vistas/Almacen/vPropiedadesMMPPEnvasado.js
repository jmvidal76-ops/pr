define(['underscore', 'backbone', 'jquery', 'text!../../../Almacen/html/PropiedadesMMPPEnvasado.html', 'compartido/notificaciones',
    'vistas/vDialogoConfirm', 'vistas/Almacen/vAgregarPropiedadesMMPPEnvasado'],
    function (_, Backbone, $, PlantillaPropiedades, Not, VistaDlgConfirm, VistaAgregarPropiedades) {
        var checkedItems;
        var vistaPropMMPPEnvasado = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            template: _.template(PlantillaPropiedades),
            url: null,
            dsEANs: null,
            dsTipos: null,
            dsValores: null,
            grid: null,
            initialize: function () {
                Backbone.on('eventComprobarNuevasMMPPSinPropiedades', this.comprobarNuevasMMPPSinPropiedades, this);
                var self = this;
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.url = "../api/propiedadesMMPP/conPropiedades";
                self.getDataSource();
                self.obtenerTipos();
                self.render();
                self.comprobarNuevasMMPPSinPropiedades();
            },
            comprobarNuevasMMPPSinPropiedades: function () {
                if (window.app.planta.nuevasMMPPSinPropiedades) {
                    $("#btnNuevasMMPPSinProp").css("background-color", "#87CEEB");
                } else {
                    $("#btnNuevasMMPPSinProp").css("background-color", "#E9E9E9");
                }
            },
            getDataSource: function () {
                var self = this;

                self.dsEANs = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: self.url,
                            dataType: "json"
                        },
                    },
                    schema: {
                        model: {
                            id: "IdPropiedad",
                            fields: {
                                IdPropiedad: { type: "number" },
                                CodigoEAN: { type: "string" },
                                CodigoMaterial: { type: "string" },
                                DescripcionMaterial: { type: "string" },
                                UnidadMedida: { type: "string" },
                                IdProveedor: { type: "number" },
                                DescripcionProveedor: { type: "string" }
                            }
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            obtenerTipos: function () {
                var self = this;

                self.dsTipos = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/propiedadesMMPP/tipos",
                            dataType: "json"
                        },
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                            $("#center-pane").empty();
                        } else if (e.xhr.status == 400) {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                checkedItems = [];

                self.grid = self.$("#gridPropMMPP").kendoGrid({
                    dataSource: self.dsEANs,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    detailTemplate: kendo.template(this.$("#detailTemplate").html()),
                    detailInit: function (e) {
                        self.detailInit(e, self);
                    },
                    detailExpand: function (e) {
                        this.collapseRow(this.tbody.find(' > tr.k-master-row').not(e.masterRow));
                    },
                    sortable: true,
                    resizable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                        {
                            width: 30, template: "<input type='checkbox' class='checkbox' style='margin-left: 1px' />", headerTemplate: "<input id='checkSelectAll' type='checkbox' />"
                        },
                        {
                            field: "CodigoEAN", title: window.app.idioma.t("EAN"), width: 200,
                        },
                        {
                            field: "CodigoMaterial", title: window.app.idioma.t("ID_MATERIAL"), width: 150,
                        },
                        {
                            field: "DescripcionMaterial", title: window.app.idioma.t("MATERIAL"),
                        },
                        {
                            field: "UnidadMedida", title: window.app.idioma.t("UD_MEDIDA"), width: 130,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=UnidadMedida#' style='width: 14px;height:14px;margin-right:5px;'/>#=UnidadMedida#</label></div>";
                                }
                            }
                        },
                        {
                            field: "IdProveedor", title: window.app.idioma.t("ID_PROVEEDOR"), width: 150,
                        },
                        {
                            field: "DescripcionProveedor", title: window.app.idioma.t("PROVEEDOR"),
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    }
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=DescripcionProveedor#' style='width: 14px;height:14px;margin-right:5px;'/>#=DescripcionProveedor#</label></div>";
                                }
                            }
                        },
                    ],
                    dataBound: function () {
                        self.resizeGrid()
                    }
                }).data("kendoGrid");

                //on page change reset selected
                $(self.el).find(".k-pager-numbers").on("click", function () {
                    $("#checkSelectAll").prop('checked', false);
                    checkedItems = [];
                });
                $(self.el).find(".k-pager-nav").on("click", function () {
                    $("#checkSelectAll").prop('checked', false);
                    checkedItems = [];
                });
                $(self.el).find(".k-pager-sizes").on("click", function () {
                    $("#checkSelectAll").prop('checked', false);
                    checkedItems = [];
                });

                //bind click event to the checkbox
                self.grid.table.on("click", ".checkbox", self.selectRow);
            },
            detailInit: function (e, vista) {
                vista.cargarDetalle(e.detailRow.find(".detalle"), e.data);
            },
            cargarDetalle: function (gridDetalle, data) {
                var self = this;

                var dsDetalle = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/propiedadesMMPP/tiposValoresPorEANIdMaterial",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "POST"
                        },
                        create: {
                            url: "../api/propiedadesMMPP_Create",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "POST",
                            complete: function (e) {
                                if (!e.responseJSON) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_CREAR_PROPIEDAD"), 4000);
                                } else if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    dsDetalle.read();
                                    window.app.comprobarNuevasMMPPSinPropiedades();
                                }
                            },
                        },
                        update: {
                            url: "../api/propiedadesMMPP_Update",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "PUT",
                            complete: function (e) {
                                if (!e.responseJSON) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_EDITAR_PROPIEDAD"), 4000);
                                } else if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    dsDetalle.read();
                                }
                            },
                        },
                        destroy: {
                            url: "../api/propiedadesMMPP_Delete",
                            contentType: 'application/json;charset=utf-8',
                            dataType: "json",
                            type: "DELETE",
                            complete: function (e) {
                                if (!e.responseJSON) {
                                    Not.crearNotificacion('warning', 'Info', window.app.idioma.t("ERROR_ELIMINAR_PROPIEDAD"), 4000);
                                } else if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    if (gridDetalle.data("kendoGrid").dataSource.data().length > 1) {
                                        dsDetalle.read();
                                    } else {
                                        self.dsEANs.read();
                                    }
                                }
                            }
                        },
                        parameterMap: function (options, operation) {
                            if (operation === "read") {
                                var result = {};
                                result.codigoEAN = data.CodigoEAN;
                                result.codigoMaterial = data.CodigoMaterial;

                                return JSON.stringify(result);
                            } else if (operation === "create") {
                                options.CodigoEAN = data.CodigoEAN;
                                options.CodigoMaterial = data.CodigoMaterial;
                                options.UnidadMedida = data.UnidadMedida;

                                return kendo.stringify([options]);
                            } else {
                                return kendo.stringify(options);
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: "IdPropiedad",
                            fields: {
                                DescripcionPropiedad: { type: "string" },
                                Valor: { type: "string" },
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        }
                    },
                });

                gridDetalle.kendoGrid({
                    dataSource: dsDetalle,
                    sortable: true,
                    resizable: true,
                    toolbar: [
                        {
                            template: "<button class='k-button k-button-icontext' style='float:right;' onclick='sinPropiedadesClick()'>" + window.app.idioma.t('ELIMINAR_PROPIEDADES') + "</button>"
                        },
                        {
                            template: "<button id='btnFinalizarAgregar' class='k-button k-button-icontext' style='float:right;' onclick='finalizarAgregarClick()'>" + window.app.idioma.t('FINALIZAR_AGREGAR') + "</button>"
                        },
                        {
                            name: "create", text: window.app.idioma.t("AGREGAR")
                        },
                    ],
                    editable: 'inline',
                    columns: [
                        {
                            field: "DescripcionPropiedad",
                            title: window.app.idioma.t('PROPIEDADES'),
                            editor: function (e, options) { return self.tiposEditor(e, options) },
                        },
                        {
                            field: "Valor",
                            title: window.app.idioma.t('VALOR'),
                            editor: function (e, options) { return self.valoresEditor(e, options) },
                        },
                        {
                            field: "coms",
                            title: window.app.idioma.t("OPERACIONES"),
                            attributes: { "align": "center" },
                            width: 220,
                            command: [
                                {
                                    name: "edit",
                                    text: {
                                        edit: window.app.idioma.t("EDITAR"),
                                        update: window.app.idioma.t("ACTUALIZAR"),
                                        cancel: window.app.idioma.t("CANCELAR")
                                    },
                                    click: function (e) {
                                        var permiso = TienePermiso(321);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            gridDetalle.data("kendoGrid").cancelChanges();
                                        }
                                    }
                                },
                                {
                                    className: "btn-destroy",
                                    name: "Delete",
                                    text: window.app.idioma.t('ELIMINAR'),
                                    click: function (e) {
                                        e.preventDefault(); //prevent page scroll reset
                                        var permiso = TienePermiso(321);

                                        if (!permiso) {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                                            return;
                                        }

                                        var grid = gridDetalle.data("kendoGrid");
                                        var tr = $(e.target).closest("tr");
                                        var data = this.dataItem(tr);

                                        this.confirmacion = new VistaDlgConfirm({
                                            titulo: window.app.idioma.t('ELIMINAR'),
                                            msg: window.app.idioma.t('CONFIRMACION_ELIMINAR_REGISTRO'),
                                            funcion: function () {
                                                grid.dataSource.remove(data);
                                                grid.dataSource.sync();
                                                Backbone.trigger('eventCierraDialogo');
                                            }, contexto: this
                                        });
                                    }
                                }
                            ]
                        }
                    ],
                    save: function (e) {
                        if (e.model.DescripcionPropiedad == "" || e.model.Valor == "") {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LOS_VALORES_ASIGNAR_NO_VACIOS'), 3000);
                            e.preventDefault();
                        }
                    },
                    dataBound: function () {
                        if (self.url == "../api/propiedadesMMPP/conPropiedades") {
                            $("#btnFinalizarAgregar").hide();
                        } else {
                            $("#btnFinalizarAgregar").show();
                        }

                        var grid = gridDetalle.data("kendoGrid");
                        var gridData = grid.dataSource.view();
                        for (var i = 0; i < gridData.length; i++) {
                            var currentUid = gridData[i].uid;
                            if (gridData[i].DescripcionPropiedad == 'Habilitar Propiedades') {
                                var currentRow = grid.table.find("tr[data-uid='" + currentUid + "']");
                                var editButton = $(currentRow).find(".k-grid-edit");
                                editButton.hide();
                                var deleteButton = $(currentRow).find(".k-grid-Delete");
                                deleteButton.hide();
                            }
                        }

                        sinPropiedadesClick = function () {
                            var grid = gridDetalle.data("kendoGrid");
                            self.fijarSinPropiedades([grid.dataItems()[0]]);
                        };

                        finalizarAgregarClick = function () {
                            self.dsEANs.read();
                        };
                    }
                });
            },
            fijarSinPropiedades: function (data) {
                var self = this;

                $.ajax({
                    url: "../api/propiedadesMMPP/fijarSinPropiedades",
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",
                    type: "POST",
                    data: JSON.stringify(data),
                    success: function (res) {
                        Backbone.trigger('eventCierraDialogo');
                        if (res) {
                            self.dsEANs.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('LA_OPERACION_SE'), 3000);
                            window.app.comprobarNuevasMMPPSinPropiedades();
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ELIMINAR_PROPIEDADES'), 3000);
                        }
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ELIMINAR_PROPIEDADES'), 3000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            tiposEditor: function (container, options) {
                var self = this;

                $('<select id="cmbTipo" name="' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        optionLabel: window.app.idioma.t("SELECCIONE"),
                        dataTextField: "Valor",
                        dataValueField: "Id",
                        dataSource: self.dsTipos,
                        change: function () {
                            self.obtenerValores();
                        }
                    });
            },
            valoresEditor: function (container, options) {
                $('<select id="cmbValor" name="' + options.field + '"/>')
                    .appendTo(container)
                    .kendoDropDownList({
                        optionLabel: window.app.idioma.t("SELECCIONE"),
                        dataTextField: "Valor",
                        dataValueField: "Id",
                    });
            },
            obtenerValores: function () {
                var self = this;
                var listaValores = null;

                var datos = {};
                datos.idTipoPropiedad = $('#cmbTipo').data("kendoDropDownList").value();

                if (datos.idTipoPropiedad != "") {
                    $.ajax({
                        url: "../api/propiedadesMMPP/valoresPorTipo",
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        data: datos,
                        async: false
                    }).done(function (datos) {
                        listaValores = datos;
                    }).fail(function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_VALORES_PROPIEDADES'), 4000);
                        }
                    });
                }

                self.dsValores = new kendo.data.DataSource({
                    data: listaValores,
                });

                $("#cmbValor").data("kendoDropDownList").setDataSource(self.dsValores);
            },
            events: {
                'click #btnMMPPConProp': 'mostrarConPropiedades',
                'click #btnMMPPSinProp': 'mostrarSinPropiedades',
                'click #btnNuevasMMPPSinProp': 'mostrarNuevas',
                'click #btnLimpiarFiltros': 'limpiarFiltroGrid',
                'click #checkSelectAll': 'selectRowAll',
                'click #btnAgregarPropiedades': 'agregarPropiedades',
                'click #btnPasarASinPropiedades': 'pasarASinPropiedades',
            },
            mostrarConPropiedades: function () {
                var self = this;
                $("#btnAgregarPropiedades").hide();
                $("#btnPasarASinPropiedades").hide();
                $("#checkSelectAll").prop('checked', false);

                self.url = "../api/propiedadesMMPP/conPropiedades";
                self.getDataSource();

                $("#gridPropMMPP").data("kendoGrid").setDataSource(self.dsEANs);
            },
            mostrarSinPropiedades: function () {
                var self = this;
                $("#btnAgregarPropiedades").hide();
                $("#btnPasarASinPropiedades").hide();
                $("#checkSelectAll").prop('checked', false);

                self.url = "../api/propiedadesMMPP/sinPropiedades";
                self.getDataSource();

                $("#gridPropMMPP").data("kendoGrid").setDataSource(self.dsEANs);
            },
            mostrarNuevas: function () {
                var self = this;
                $("#btnAgregarPropiedades").show();
                $("#btnPasarASinPropiedades").show();
                $("#checkSelectAll").prop('checked', false);

                self.url = "../api/propiedadesMMPP/soloConPropiedadInicial";
                self.getDataSource();

                $("#gridPropMMPP").data("kendoGrid").setDataSource(self.dsEANs);
            },
            agregarPropiedades: function () {
                var self = this;
                var permiso = TienePermiso(321);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                if (checkedItems.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 3000);
                    return;
                }

                let vista = new VistaAgregarPropiedades({ checkedItems, dsTiposPropiedades: self.dsTipos });
            },
            pasarASinPropiedades: function () {
                var self = this;

                var permiso = TienePermiso(321);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                if (checkedItems.length == 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 3000);
                    return;
                }

                let confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('PASAR_MMPP_SIN_PROP'),
                    msg: window.app.idioma.t('DESEA_REALMENTE') + ' ' + window.app.idioma.t('PASAR_MMPP_SIN_PROP'),
                    funcion: function () { self.fijarSinPropiedades(checkedItems); },
                    contexto: this
                });
            },
            selectRowAll: function (e) {
                var checked = $("#checkSelectAll:checked").val();
                var rows = $("#gridPropMMPP").find("tr");
                var grid = $("#gridPropMMPP").data("kendoGrid");
                checkedItems = [];

                if (checked) {
                    for (var i = 1; i < rows.length; i++) {
                        $(rows[i]).addClass("k-state-selected");
                        var dataItem = grid.dataItem(rows[i]);
                        checkedItems.push(dataItem);
                    }
                    $("#gridPropMMPP").find(".checkbox").prop('checked', true);
                    checkedItems.push()
                } else {
                    $("#gridPropMMPP").find("tr").removeClass("k-state-selected");
                    $("#gridPropMMPP").find(".checkbox").prop('checked', false);
                }
            },
            selectRow: function () {
                var checked = this.checked,
                    row = $(this).closest("tr"),
                    grid = $("#gridPropMMPP").data("kendoGrid"),
                    dataItem = grid.dataItem(row);

                if (checked) {
                    //select the row
                    checkedItems.push(dataItem);
                    row.addClass("k-state-selected");
                } else {
                    //remove selection
                    row.removeClass("k-state-selected");
                    $("#checkSelectAll").prop('checked', false);
                    var index = checkedItems.indexOf(dataItem);

                    if (index > -1) {
                        checkedItems.splice(index, 1);
                    }
                }
            },
            limpiarFiltroGrid: function () {
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
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridPropMMPP"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;

                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosHeight - 2);
            }
        });

        return vistaPropMMPPEnvasado;
    });