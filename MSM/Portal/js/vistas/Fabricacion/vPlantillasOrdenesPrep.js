define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/PlantillasOrdenesPrep.html', 'vistas/Fabricacion/vCrearPlantilla', 'vistas/vDialogoConfirm', 'compartido/notificaciones', 'compartido/utils'],
    function (_, Backbone, $, PlantillaListadoWO, VistaCrearPlantilla, VistaDlgConfirm, Not, Utils) {
        var gridListadoWOPrep = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            vistaFormWO: null,
            registroSelData: null,
            template: _.template(PlantillaListadoWO),
            initialize: function () {
                var self = this;
                self.ds = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetPlantillaOrdenesPreparacion/",
                            dataType: "json"
                        }
                    },
                    pageSize: 50,
                    schema: {
                        model: {
                            id: "IdPlantilla",
                            fields: {
                                'IdPlantilla': { type: "number" },
                                'Descripcion': { type: "string" },
                                'Tipo.Id': { type: "number" },
                                'Tipo.Descripcion': { type: "string" },
                                'IdUbicacion': { type: "string" },
                                'Ubicacion': { type: "string" },
                                'FechaCreacion': { type: "date" },
                            },
                        }
                    },
                    requestStart: function () {
                        if (self.ds.data().length == 0) {
                            kendo.ui.progress($("#gridListadoWOPrep"), true);
                        }
                    },
                    requestEnd: function () {
                        if (self.ds.data().length == 0) {
                            kendo.ui.progress($("#gridListadoWOPrep"), false);
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            $("#center-pane").empty();
                        }
                    }
                });

                self.render();
            },
            render: function () {
                var self = this;

                $(this.el).html(this.template());
                $("#center-pane").append($(this.el));

                self.grid = this.$("#gridListadoWOPrep").kendoGrid({
                    dataSource: self.ds,
                    sortable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    toolbar: [
                           {
                               name: "createPlantilla",
                               text: window.app.idioma.t('CREAR_PLANTILLA'),
                               template: "<a id='btnCrearPlantilla' class='k-button k-button-icontext k-grid-add' data-funcion='FAB_PROD_RES_12_PlantillasPrep' style=' background-color:green;color:white;'><span class='k-icon k-add'></span>" + window.app.idioma.t('CREAR_PLANTILLA') + "</a>"
                           },
                           {
                               name: "create",
                               text: window.app.idioma.t('CREAR_WO_PLANTILLA'),
                               template: "<a id='btnCrearWOPlantilla' class='k-button k-button-icontext k-grid-add' data-funcion='FAB_PROD_RES_12_PlantillasPrep' style=' background-color:green;color:white;'><span class='k-icon k-add'></span>" + window.app.idioma.t('CREAR_WO_PLANTILLA') + "</a>"
                           },
                           {
                               text: window.app.idioma.t('QUITAR_FILTROS'),
                               template: "<a id='btnLimpiarFiltros' class='k-button k-button-icontext k-i-delete'><span class='k-icon k-i-funnel-clear'></span>" + window.app.idioma.t('QUITAR_FILTROS') + "</a>"
                           }
                    ],
                    columns: [
                         {
                             title: "",
                             template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                             width: 25
                         },
                        {
                            field: "Descripcion", title: window.app.idioma.t("DESCRIPCION"), width: 160,
                        },
                        {
                            field: "Tipo.Descripcion",
                            template: window.app.idioma.t('#=Tipo.Descripcion#'),
                            title: window.app.idioma.t("TIPO"), width: 70,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Tipo.Descripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= Tipo.Descripcion#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Ubicacion",
                            title: window.app.idioma.t("UBICACION"), width: 80
                        },
                        {
                            field: "FechaCreacion", title: window.app.idioma.t("FECHA_CREACION"), width: 100, format: "{0:" + kendo.culture().calendar.patterns.MES_FechaHora + "}",
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: kendo.culture().name
                                    });
                                }
                            }
                        },
                        {
                            command:
                            {
                                template: "<div align='center' title='Editar'><a id='btnEditar' class='k-button k-edit' data-funcion='FAB_PROD_RES_12_PlantillasPrep' style='min-width:16px;'><span class='k-icon k-edit'></span></a></div>"
                            },
                            title: window.app.idioma.t("EDITAR"),
                            width: 40
                        },
                        {
                            command:
                                {
                                    template: "<div align='center' title='Borrar'><a id='btnBorrar' class='k-button k-grid-delete' data-funcion='FAB_PROD_RES_12_PlantillasPrep' style='min-width:16px;'><span class='k-icon k-delete'></span></a></div>"
                                },
                            title: window.app.idioma.t("ELIMINAR"),
                            width: 40
                        },
                    ],
                    dataBinding: self.resizeGrid,
                    dataBound: function () {
                        $(".checkbox").bind("change", function (e) {

                            var checked = this.checked;
                            row = $(e.target).closest("tr");
                            grid = $("#gridListadoWOPrep").data("kendoGrid");
                            dataItem = grid.dataItem(row);
                            //var idValue = grid.dataItem(row).get("idTiempoArranque");

                            var IdPlantilla = dataItem.IdPlantilla;


                            if (checked) {
                                grid.tbody.find('input:checkbox').prop("checked", false);
                                grid.tbody.find(">tr").removeClass('k-state-selected');

                                self.registroSelData = IdPlantilla;
                                row.addClass("k-state-selected");
                                row.find('input:checkbox').prop("checked", true);

                            } else {
                                self.registroSelData = null;
                                row.removeClass("k-state-selected");
                            }

                        });


                        var grid = $("#gridListadoWOPrep").data("kendoGrid");


                        grid.tbody.find('input:checkbox').prop("checked", false);
                        grid.tbody.find(">tr").removeClass('k-state-selected');

                        var items = grid.items();

                        var listItems = [];
                        listItems = $.grep(items, function (row) {
                            var dataItem = grid.dataItem(row);
                            return self.registroSelData == dataItem.id;
                        });

                        listItems.forEach(function (row, idx) {
                            $(row.cells[0])[0].childNodes[0].checked = true;
                            $(row).closest("tr").addClass("k-state-selected");
                        });
                    }
                }).data("kendoGrid");

            },
            events: {
                "click #btnCrearPlantilla": 'crearPlantilla',
                "click #btnEditar": 'editarPlantilla',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnCrearWOPlantilla': 'confirmCrearOrdenPrep',
                'click #btnBorrar': 'confirmBorrarPlantilla',
            },
            confirmBorrarPlantilla: function (e) {
                var self = this;

                var row = $(e.target.parentNode.parentNode).closest("tr");
                var dataItem = $("#gridListadoWOPrep").data("kendoGrid").dataItem(row);

                e.preventDefault();
                this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('PLANTILLAS_ORDENES'), msg: window.app.idioma.t('ELIMINAR_PLANTILLA'), funcion: function () { self.borrarPlantilla(dataItem); }, contexto: this });
            },
            borrarPlantilla: function (dataItem) {
                var self = this;

                $.ajax({
                    type: "POST",
                    url: "../api/BorrarPlantillaPreparacion/",
                    dataType: 'json',
                    data: JSON.stringify(dataItem.IdPlantilla),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json"
                }).success(function (res) {
                    if (res) {
                        self.ds.read();
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ELIMINAR_PLANTILLA_CORRECTAMENTE'), 4000);
                    }
                    else {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ELIMINAR_PLANTILLA'), 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                }).error(function (err) {
                    if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ELIMINAR_PLANTILLA'), 4000);
                    }
                    Backbone.trigger('eventCierraDialogo');
                });
            },
            confirmCrearOrdenPrep: function (e) {
                var self = this;
                var grid = $('#gridListadoWOPrep').data('kendoGrid');

                if (self.registroSelData > 0) {
                    e.preventDefault();
                    this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('PLANTILLAS_ORDENES'), msg: window.app.idioma.t('CREAR_ORDEN_PREP'), funcion: function () { self.CrearOrdenPrep(); }, contexto: this }); 
                }
                else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                }
            },
            CrearOrdenPrep: function () {
                    var self = this;
                    

                    $.ajax({
                        type: "POST",
                        url: "../api/crearOrdenPrep/",
                        dataType: 'json',
                        data: JSON.stringify(self.registroSelData),
                        contentType: "application/json; charset=utf-8",
                        dataType: "json"
                    }).success(function (res) {
                        if (res) {
                            self.ds.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ORDEN_PREP_CREADA_CORRECTAMENTE'), 4000);
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ORDEN_PREP_PLANTILLA'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    }).error(function (err) {
                        if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_ORDEN_PREP'), 4000);
                        }
                        Backbone.trigger('eventCierraDialogo');
                    });
                },
            editarPlantilla: function (e) {
                var self = this;

                var row = $(e.target.parentNode.parentNode).closest("tr");
                var dataItem = $("#gridListadoWOPrep").data("kendoGrid").dataItem(row);

                this.vistaPlantilla = new VistaCrearPlantilla(dataItem);
            },
            LimpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            },
            eliminar: function () {
                Backbone.off('eventNotificacionOrden');
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

                var gridElement = $("#gridListadoWOPrep"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - 2);
            },
            crearPlantilla: function () {
                this.vistaPlantilla = new VistaCrearPlantilla();
            },
            actualiza: function (tipo) {
                var self = this;
                self.ds.read();
            }
        });

        return gridListadoWOPrep;
    });