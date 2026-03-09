define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/ParametrosFabricacion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm',
    'definiciones', 'vistas/Fabricacion/vCrearEditarParametroFabricacion'],
    function (_, Backbone, $, plantilla, Notificacion, VistaDlgConfirm, definiciones, VistaCrearEditarParametro) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            alturaGrid: null,
            cmbParametros: null,
            gridParametrosDefecto: null,
            tipoSeleccionado: 5, // Por defecto se inicia con el tipo 5
            tiposWO: definiciones.TipoWO(),
            template: _.template(plantilla),
            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;

                this.constOperaciones = {
                    Crear: 0,
                    Editar: 1
                };

                kendo.ui.progress($("#divParam"), true);

                self.obtenerMateriales();
                self.obtenerMaestroParams();

                //Asignamos el resizegrid ccuando cambia el tamaño del navegador
                var splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.render(self.tipoSeleccionado);  // Renderiza con el tipo seleccionado por defecto

                kendo.ui.progress($("#divParam"), false);
            },
            render: function (tipoSeleccionado) {
                var self = this;

                kendo.ui.progress($("#divParam"), true);
                
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                // Asignación de valores según los tipos de orden de trabajo
                self.asignacionValor(self.tiposWO);

                // Pestañas del grid principal
                $("#divParam").kendoTabStrip({
                    select: function (e) { self.selectTab(e, self); },
                    scrollable: true,
                    selectable: true,
                    animation: { open: { effects: "fadeIn" } }
                });

                $("#divPestanias").kendoTabStrip({
                    select: function (e) { self.selectTabTipoOrden(e, self); },
                    scrollable: true,
                    animation: { open: { effects: "fadeIn" } }
                });

                // Llama al servidor para obtener los parámetros de fabricación
                $.ajax({
                    type: "GET",
                    url: "../api/ParametrosFabricacion/ObtenerParametrosFabricacionPorTipoOrden/" + self.tipoSeleccionado,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.cmbParametros = data || [];
                }).fail(function () {
                    Notificacion.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_PARAMETROS_FABRICACION'), 4000);
                });

                // Configurar el DropDownList
                $("#cmbParametros").kendoDropDownList({
                    dataTextField: "EnumParametro",
                    dataValueField: "IdParametroFabricacionMaterial",
                    dataSource: {
                        data: self.cmbParametros,  
                        sort: { field: "EnumParametro", dir: "asc" }
                    },
                    change: function () {
                        self.idParametroSeleccionado = this.value();
                        self.cargarGrid(self.tipoSeleccionado); // Carga el grid basado en el tipo seleccionado
                    }
                }).data("kendoDropDownList");

                self.cargarGrid(self.tipoSeleccionado);
                self.cambioSelector(self.tipoSeleccionado);

                kendo.ui.progress($("#divParam"), false);
            },

            asignacionValor: function (tipoOrden) {
                $("#idCoccion").val(tipoOrden.Coccion);
                //$("#idFermentacion").val(tipoOrden.Fermentacion);
                //$("#idTrasiego").val(tipoOrden.Trasiego);
                //$("#idGuarda").val(tipoOrden.Guarda);
                $("#idFiltracion").val(tipoOrden.Filtracion);
                //$("#idPrellenado").val(tipoOrden.Prellenado);
                //$("#idConcentrado").val(tipoOrden.Concentrado);
            },
            events: {
                'click #btnAnadir': 'anadirEditar',
                'click #btnEditar': 'anadirEditar',
                'click #btnEliminar': 'confirmarEliminar'
            },

            // Método para cargar el grid con los parámetros de fabricación
            cargarGrid: function (tipoOrden) {
                var self = this;

                // Destruir el grid si ya existe
                if ($("#divParam").data("kendoGrid")) {
                    $("#divParam").data("kendoGrid").destroy();
                }

                // Configuración del grid
                gridParametrosDefecto = $("#divParam").kendoGrid({
                    dataSource: {
                        type: "json",
                        transport: {
                            read: {
                                url: "../api/ParametrosFabricacion/ObtenerParametrosFabricacionPorTipoOrden/" + self.tipoSeleccionado,
                                dataType: "json",
                                complete: function (e) {
                                    // Verificar si la respuesta es vacía y configurar un array vacío en caso de no haber datos
                                    var data = e.responseJSON || [];
                                    if (data.length === 0) {
                                        gridParametrosDefecto.dataSource.data([]);
                                    }
                                }
                            }
                        },
                        schema: {
                            data: function (response) {
                                return response && response.length ? response : [];
                            },
                            model: {
                                id: "IdParametroFabricacionMaterial",
                                fields: {
                                    'IdParametroFabricacionMaterial': { type: "number" },
                                    'Descripcion': { type: "string" },
                                    'Activo': { type: "boolean" },
                                    'IdMaterial': { type: "string" },
                                    'DescripcionMaterial': { type: "string"},
                                    'Valor': { type: "number" },
                                    'Unidad': { type: "string" },
                                    'FechaActualizado': { type: "date" }
                                }
                            },
                            total: function (data) {
                                return data ? data.length : 0;
                            }
                        },
                        change: function () {
                            var data = this.data();
                            for (var i = 0; i < data.length; i++) {
                                var material = $.grep(self.dsMateriales, function (item) {
                                    return item.IdMaterial === data[i].IdMaterial;
                                });
                                data[i].set("DescripcionMaterial", material.length > 0 ? material[0].DescripcionCompleta : "");
                            }
                        },
                        pageSize: 200,
                        serverPaging: false
                    },
                    sortable: true,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    scrollable: true,
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    noRecords: {
                        template: window.app.idioma.t("SIN_RESULTADOS")
                    },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [500, 1000, 5000, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    toolbar: [
                        {
                            template: "<button type='button' id='btnEliminar' style='float:right;margin-left:10px;' class='k-button k-button-icontext k-grid-delete'>" +
                                "<span class='k-icon k-delete'></span>" + window.app.idioma.t('ELIMINAR') + "</button>"
                        },
                        {
                            template: "<button type='button' id='btnAnadir' style='float:right;background-color:green;color:white;' class='k-button k-button-icontext k-grid-add'>" +
                                "<span class='k-icon k-add'></span>" + window.app.idioma.t('ANADIR') + "</button>"
                        }
                    ],
                    columns: [
                        {
                            field: "IdParametroFabricacionMaterial",
                            hidden: true
                        },
                        {                            
                            template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                            groupable: false,
                            width: 18
                        },
                        {
                            title: window.app.idioma.t("EDITAR"),
                            command: {
                                template: "<a id='btnEditar' class='k-button k-grid-edit' style='min-width:90%;'><span class='k-icon k-edit'></span></a>"
                            },
                            attributes: { style: "text-align:center;" },
                            filterable: false,
                            groupable: false,
                            width: 30
                        },
                        {
                            field: "EnumParametro",
                            title: "EnumParametro",
                            hidden: true,
                            width: 100,
                            attributes: { style: 'white-space: nowrap ' }
                        },
                        {
                            field: "Descripcion",
                            title: window.app.idioma.t("DESCRIPCION"),
                            width: 130,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Descripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= Descripcion#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            field: "Activo",
                            title: window.app.idioma.t("ACTIVO"),
                            width: 24,
                            groupable: false,
                            template: '#= Activo ? "✔" : "" #',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Activo#' style='width: 14px;height:14px;margin-right:5px;'/>#= Activo#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            field: "IdMaterial",
                            title: "Id" + window.app.idioma.t("MATERIAL"),                            
                            width: 40
                        },
                        {
                            field: "DescripcionMaterial",
                            title: window.app.idioma.t("DESCRIPCION_MATERIAL"),
                            groupable: false,
                            width: 170
                        },                        
                        {
                            field: "Valor",
                            title: window.app.idioma.t("VALOR"),
                            groupable: false,
                            width: 50,
                            template: '#= Valor != null ? Valor.toFixed(2) : "" #'
                        },
                        {
                            field: "Unidad",
                            title: window.app.idioma.t("UNIDAD"),
                            groupable: false,
                            width: 50,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=Unidad#' style='width: 14px;height:14px;margin-right:5px;'/>#= Unidad#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "FechaActualizado",
                            title: window.app.idioma.t("FECHA_ACTUALIZACION"),
                            groupable: false,
                            width: 80,
                            format: "{0:" + kendo.culture().calendars.standard.patterns.MES_FechaHora + "}",
                            template: function (e) { return e.FechaActualizado == null ? "" : kendo.toString(kendo.parseDate(e.FechaActualizado), kendo.culture().calendars.standard.patterns.MES_FechaHora); },
                            attributes: {
                                style: 'white-space: nowrap ',
                                'class': 'tooltipText'
                            },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                        }                        
                    ],
                    dataBinding: self.resizeGrid,
                    dataBound: function (e) {

                    }                    
                }).data("kendoGrid");
            },

            // Métodos para manejar las pestañas
            selectTabTipoOrden: function (e, self) {
                var nuevoTipo = e.item.dataset.tipoorden;
                if (self.tipoSeleccionado !== nuevoTipo) {
                    self.tipoSeleccionado = nuevoTipo;
                    self.cargarGrid(self.tipoSeleccionado); 
                }
            },
            cancelarFormulario: function (e) {
                e.preventDefault();
                this.ventanaEditarCrear.close();
            },
            resizeGrid: function () {

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();

                var gridElement = $("#divParam"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;

                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - 60);
            },
            cambioSelector: function (tipoOrden) {
                $(".tipoOrden").each(function () {
                    if ($(this).val() !== tipoOrden) {

                        $(this).removeClass("k-state").removeClass("k-state-active");
                        $(this).addClass("k-state");
                    } else {
                        $(this).removeClass("k-state").removeClass("k-state-active");
                        $(this).addClass("k-state-active");
                    }
                });
            },
            anadirEditar: function (e) {
                var self = this;

                var permiso = TienePermiso(361);
                if (!permiso) {
                    Notificacion.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                // Determinar si es una operación de añadir o editar
                var operacion = (e.currentTarget.id === 'btnAnadir') ?
                    self.constOperaciones.Crear :
                    self.constOperaciones.Editar;

                // Obtener la fila seleccionada en el caso de editar
                var datosFila = {};
                if (operacion === self.constOperaciones.Editar) {
                    var tr = $(e.target).closest("tr");
                    var grid = $("#divParam").data("kendoGrid");
                    datosFila = grid.dataItem(tr);

                    if (!datosFila) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                        return;
                    }
                }

                // Pasar los datos y llamar a la vista de creación/edición
                self.nuevaVentana = new VistaCrearEditarParametro(operacion.toString(), self.tipoSeleccionado,self.dsMateriales, self.dsMaestroParams, datosFila);
            },
            confirmarEliminar: function (e) {
                e.preventDefault();
                var self = this;

                var permiso = TienePermiso(361);
                if (!permiso) {
                    Notificacion.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                // Obtener el grid
                var grid = $("#divParam").data("kendoGrid");
                // Obtener todas las filas del grid
                var rows = grid.tbody.find('input:checked');

                // Verificar que se haya seleccionado al menos un checkbox
                if (rows.length === 0) {
                    Notificacion.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                // Obtener los IDs de los items seleccionados
                var selectedIds = [];
                rows.each(function () {
                    var row = $(this).closest("tr");
                    var dataItem = grid.dataItem(row);
                    if (dataItem && dataItem.IdParametroFabricacionMaterial) {
                        selectedIds.push(dataItem.IdParametroFabricacionMaterial);
                    }
                });

                // Confirmar eliminación para cada item seleccionado
                if (selectedIds.length > 0) {
                    this.confirmacion = new VistaDlgConfirm({
                        titulo: window.app.idioma.t('ELIMINAR') + ' ' + window.app.idioma.t('PARAMETROS_FABRICACION'),
                        msg: window.app.idioma.t('CONFIRMACION_ELIMINAR_PARAMETROS_FABRICACION'),
                        funcion: function () {
                            self.borrar(selectedIds);
                        },
                        contexto: this
                    });
                } else {
                    Notificacion.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                }
            },

            borrar: function (ids) {
                var self = this;
                var grid = $("#divParam").data("kendoGrid");

                $.ajax({
                    type: "DELETE",
                    url: "../api/ParametrosFabricacion/EliminarParametrosFabricacion",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(ids),  // Pasar la lista de IDs
                    dataType: "json",
                    success: function (res) {
                        var mensaje = res.includes("Error") ? "error" : "success";
                        var mensajeTexto = res.includes("Error")
                            ? window.app.idioma.t('ERROR_AL_ELIMNAR')
                            : window.app.idioma.t('SE_HA_ELIMINADO_CORRECTAMENTE');

                        Notificacion.crearNotificacion(mensaje, window.app.idioma.t('AVISO'), mensajeTexto, 4000);
                        Backbone.trigger('eventCierraDialogo');
                        // Actualiza la fuente de datos del grid
                        if (grid && grid.dataSource) {
                            grid.dataSource.read();
                            grid.refresh(); 
                        }
                    },
                    error: function (err) {
                        if (err.status === 403 && err.responseJSON === 'NotAuthorized') {
                            Notificacion.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Notificacion.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ELIMNAR'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }
                });
            },
            obtenerMateriales: function () {
                var self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/GetMaterial",
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.dsMateriales = data;
                }).fail(function () {
                    Notificacion.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_MATERIALES'), 4000);
                });
            },
            obtenerMaestroParams: function () {
                var self = this;

                $.ajax({
                    type: "GET",
                    url: "../api/ParametrosFabricacion/ObtenerMaestroParametrosFabricacionPorTipoOrden/" + self.tipoSeleccionado,
                    dataType: 'json',
                    cache: false,
                    async: false
                }).done(function (data) {
                    self.dsMaestroParams = data;
                }).fail(function () {
                    Notificacion.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_PARAMETROS'), 4000);
                });
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
            }
        });

        return vista;
    });
