define(['underscore', 'backbone', 'jquery', 'text!../../../Fabricacion/html/OrdenesPreparacion.html', 'compartido/notificaciones', 'vistas/vDialogoConfirm', 'modelos/mSesion',
'vistas/Fabricacion/vEditarOrdenPreparacionFinalizadas'],
    function (_, Backbone, $, plantilla, Not, VistaDlgConfirm, Session,VistaEditarOrden) {
        var vista = Backbone.View.extend({
            //#region ATTRIBUTES
            template: _.template(plantilla),
            grid: null,
            dsOrdenesPreparacion: null,
            permisoVisualizacion: false,
            permisoGestion: false,
            windowVolumenReal: null,
            cambio: {},
            //#endregion ATTRIBUTES

            initialize: function () {
                var self = this;
                self.render();
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(self.el).html(this.template());

                for (i = 0; i < window.app.sesion.attributes.funciones.length; i++) {
                    if (window.app.sesion.attributes.funciones[i].id === 164)
                        self.permisoVisualizacion = true;
                    if (window.app.sesion.attributes.funciones[i].id === 165)
                        self.permisoGestion = true;
                }

                self.dsOrdenesPreparacion = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: "../api/GetOrdenesPreparacion/1",//0 - Activas / 1 - Finalizadas
                            dataType: "json"
                        }
                    },
                    schema: {
                        model: {
                            id: "IdOrden",
                            fields: {
                                'Tipo': { type: "string" },
                                'Descripcion': { type: "string" },
                                'IdEstado': { type: "number" },
                                'NombreEstado': { type: "string" },
                                'IdOrden': { type: "string" },
                                'VolumenInicial': { type: "number" },
                                'VolumenReal': { type: "number" },
                                'IdUbicacion': { type: "number" },
                                'Ubicacion': { type: "string" },
                                'FechaCreacion': { type: "date" },
                                'FechaInicio': { type: "date" },
                                'FechaFin': { type: "date" },
                                'UnidadMedida': { type: "string" },
                            }
                        }
                    },
                    requestEnd: function (e) {
                        e.preventDefault();
                        if (e.type == "read") {
                        }
                    },
                    pageSize: 50,
                });

                self.grid = this.$("#gridOrdenesPreparacion").kendoGrid({
                    dataSource: self.dsOrdenesPreparacion,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    noRecords: {
                        template: window.app.idioma.t('NO_EXISTEN_REGISTROS')
                    },
                    selectable: "row",
                    sortable: true,
                    resizable: true,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [50, 100, 200, 'All'],
                        buttonCount: 2,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    columns: [
                         {
                             field: "Tipo",
                             title: window.app.idioma.t("TIPO"),
                             attributes: { "align": "center" }
                         },
                         {
                             field: "Descripcion",
                             title: window.app.idioma.t("DESCRIPCION"),
                             attributes: { "align": "center" }
                         },
                        {
                            field: "NombreEstado",
                            attributes: { "align": "center" },
                            title: window.app.idioma.t("ESTADO")
                        },
                          {
                              field: "IdOrden",
                              title: window.app.idioma.t("ORDEN"),
                              attributes: {
                                  style: 'white-space: nowrap ',
                                  "class": 'addTooltip'
                              },
                          },
                          {
                              field: "VolumenInicial",
                              title: window.app.idioma.t("VOLUMEN_INICIAL"),
                              template: '#=typeof VolumenInicial !== "undefined" && VolumenInicial != null ?  kendo.format("{0:n2}",VolumenInicial): ""#',
                              attributes: {
                                  style: 'white-space: nowrap ',
                                  "class": 'addTooltip'
                              },
                          },
                          {
                              field: "VolumenReal",
                              title: window.app.idioma.t("VOLUMEN_FINAL"),
                              template: '#=typeof VolumenReal !== "undefined" && VolumenReal != null ?  kendo.format("{0:n2}",VolumenReal): ""#',
                              attributes: {
                                  style: 'white-space: nowrap ',
                                  "class": 'addTooltip'
                              },
                          },
                          {
                              field: "Ubicacion",
                              title: window.app.idioma.t("UBICACION"),
                              attributes: {
                                  style: 'white-space: nowrap ',
                                  "class": 'addTooltip'
                              },
                          },
                        {
                            field: "FechaCreacion",
                            title: window.app.idioma.t("FECHA_CREACION"),
                            template: '#= FechaCreacion != null ? kendo.toString(new Date(FechaCreacion), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                        },
                        {
                            field: "FechaInicio",
                            title: window.app.idioma.t("FECHA_INICIO"),
                            template: '#= FechaInicio != null ? kendo.toString(new Date(FechaInicio), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                        },
                        {
                            field: "FechaFin",
                            title: window.app.idioma.t("FECHA_FIN"),
                            template: '#= FechaFin != null ? kendo.toString(new Date(FechaFin), kendo.culture().calendars.standard.patterns.MES_FechaHora) : "" #',
                            filterable: {
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                "class": 'addTooltip'
                            },
                        },
                         
                         {
                             field: window.app.idioma.t("OPERACIONES"),
                             attributes: { "align": "center" },
                             command:
                                {
                                    template: "<div align='center' title='" + window.app.idioma.t("EDITAR") + "'><a id='btnEditar' class='k-button k-edit' style='min-width:16px;'><span class='k-icon k-edit'></span></a></div>"
                                },
                           
                         },
                    ],
                    dataBinding: function (e) {
                        kendo.ui.progress($("#gridOrdenesPreparacion"), false);
                    },
                    dataBound: function () {
                        var grid = this;
                        $(".selectEstado").each(function () {
                            var row = $(this).closest("tr");
                            var model = grid.dataItem(row);

                            var dsOpcionesCambio = {
                                data: [] //cambiosPosibles
                            };

                            var _opcionesSiguientes = model.EstadoSiguiente.split(';');

                            for (var i = 0; i < _opcionesSiguientes.length; i++) {
                                dsOpcionesCambio.data.push({ id: _opcionesSiguientes[i].split('-')[0], nombre: window.app.idioma.t(_opcionesSiguientes[i].split('-')[1].trim()) });
                            }

                            self.$("#estado"+model.IdOrden).kendoDropDownList({
                                dataTextField: "nombre",
                                dataValueField: "id",
                                width: 200,
                                dataSource: dsOpcionesCambio,
                                optionLabel: window.app.idioma.t('SELECCIONE')
                            });
                        });
                    },
                    //change: function () {
                    //    var selectedRows = this.select();
                        
                    //}
                }).data("kendoGrid");


                self.windowVolumenReal = $("#window").kendoWindow({
                    width: "300px",
                    visible: false
                }).data("kendoWindow");

                $("#cantReal").kendoNumericTextBox({
                    format: "{0:n2}",
                    min: 0,
                    value: 0
                });

                $("#btnAceptarVolumen").kendoButton({
                    click: function () {
                        var _cant = $("#cantReal").val();
                        self.cambio.volumenReal = _cant;
                        self.cambiarEstado(self);
                    }

                    
                });
                $("#btnCancelarVolumen").kendoButton({
                    click: function () { self.windowVolumenReal.close(); }
                });

                self.resizeGrid(self)
            },

            //#region EVENTOS
            events: {
                'click .btnCambiaEstado': 'validarCambio',
                "click #btnEditar": 'editarPlantilla',
            },
            //#endregion EVENTOS

            editarPlantilla: function (e) {
                var self = this;

                var row = $(e.target.parentNode.parentNode).closest("tr");
                var dataItem = $("#gridOrdenesPreparacion").data("kendoGrid").dataItem(row);

                this.vistaPlantilla = new VistaEditarOrden(dataItem);
            },

            validarCambio: function (e) {
                var self = this;
                self.cambio = {};
                var row = $("#" + e.currentTarget.id).closest("tr"); //$(e.target.parentNode.parentNode).closest("tr");
                self.cambio.wo = e.currentTarget.id.replace(/btnEst/g, '');
                self.cambio.idEstado = this.$("#estado" + self.cambio.wo + " option:selected").val();
                self.cambio.estado = this.$("#estado" + self.cambio.wo + " option:selected").text();
                if (self.cambio.estado != "") {
                    if (self.cambio.idEstado == "4")//finalizada
                    {
                        self.windowVolumenReal.center().open();
                    }
                    else
                    {
                        this.confirmacion = new VistaDlgConfirm({ titulo: window.app.idioma.t('ALT_LOG_ESTADO'), msg: window.app.idioma.t('DESEA_REALMENTE_CAMBIAR_EL') + self.cambio.wo + " a " + self.cambio.estado + "?", funcion: function () { self.cambiarEstado(self); }, contexto: this });
                    }
                    e.preventDefault(); // evitamos que se realice la acción del href
                }
                else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('DEBE_SELECCIONAR_UN_ESTADO'), 2000);
                }

            },

            cambiarEstado: function (self) {
                $.ajax({
                    data: JSON.stringify(self.cambio),
                    type: "PUT",
                    async: false,
                    url: "../api/cambiarEstadoOrdenPreparacion",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (res) {
                        Backbone.trigger('eventCierraDialogo');

                        if (!res) Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CAMBIAR_EL'), 3000);
                        else {
                            $("#gridOrdenesPreparacion").data("kendoGrid").dataSource.read();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('MODIFICADO_CORRECTAMENTE'), 2000);
                        }
                    },
                    error: function (response) {
                        if (response.status == '403' && response.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 2000);
                        } else {
                            Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CAMBIAR_EL'), 3000);
                        }
                        Backbone.trigger('eventCierraDialogo');

                    }
                });

            },

            resizeGrid: function (self) {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();

                var gridElement = $("#gridOrdenesPreparacion"),
                    dataArea = gridElement.find(".k-grid-content:first"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content").not(".k-loading-mask"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });



                if (otherElements.length > 0) {
                    dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - 1);
                }

            },

            eliminar: function () {
                this.remove();
            },
        });

        return vista;
    });

