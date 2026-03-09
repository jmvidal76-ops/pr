define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/FormularioAccionMejora.html', 'vistas/Envasado/vSeleccionParosPerdidasAccionMejora',
        'vistas/Envasado/vSeleccionCambiosAccionMejora', 'vistas/Envasado/vSeleccionArranqueAccionMejora', 'compartido/notificaciones', 'vistas/vDialogoConfirm'],
    function (_, Backbone, $, FormularioAccionMejora, VistaSeleccionaParosPerdidas, VistaSeleccionaCambios, VistaSeleccionaArranques, Not, VistaDlgConfirm) {
        var VistaEditarAccionMejora = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            vistaSeleccion: null,
            template: _.template(FormularioAccionMejora),
            model: null,
            datosGrid: [],
            turnos: null,
            initialize: function (options) {
                var self = this;
                self.model = options;

                if (self.model.tipo == 0) {
                    Backbone.on('eventParosSeleccionados', self.actualizaGrid, self);
                } else if (self.model.tipo == 1) {
                    Backbone.on('eventCambiosSeleccionados', self.actualizaGrid, self);
                } else if (self.model.tipo == 2) {
                    Backbone.on('eventArranqueSeleccionados', self.actualizaGrid, self);
                }

                var accion = '';
                var mensajeError = '';

                if (self.model.tipo == 0) {
                    accion = "/ParosPerdidas";
                    mensajeError = window.app.idioma.t('ERROR_AL_OBTENER_LOS');
                } else if (self.model.tipo == 1) {
                    accion = "/Cambios";
                    mensajeError = window.app.idioma.t('ERROR_AL_OBTENER_LOS_CAMBIOS');
                } else if (self.model.tipo == 2) {
                    accion = "/Arranques";
                    mensajeError = window.app.idioma.t('ERROR_AL_OBTENER_LOS_ARRANQUES');
                }

                $.ajax({
                    type: "GET",
                    async: false,
                    url: "../api/accionesMejora/" + self.model.id + accion,
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (datos) {
                        self.datosGrid = datos;
                        self.render();
                    },
                    error: function (e, msg, ex) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), mensajeError + ex, 4000);
                        }

                    }
                });
            },
            render: function () {
                var self = this;
                $("#center-pane").prepend($(this.el));
                $(this.el).html(this.template({ 'accion': "editar", 'model': self.model }));

                self.$("#cmbLinea").kendoDropDownList({
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "nombre", dir: "asc" }
                    }),
                    dataValueField: "id",
                    template: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                    valueTemplate: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                    optionLabel: window.app.idioma.t('SELECCIONE'),
                    change: function () {
                        self.CambiarLineaFecha();
                    }
                });

                self.$("#dtpFechaTurno").kendoDatePicker({
                    value: self.model.fechaTurno.getFullYear() === 1 ? '' : self.model.fechaTurno,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                    change: function () {
                        self.CambiarLineaFecha();
                    }
                });

                self.$("#ddlTurno").kendoDropDownList({
                    dataValueField: "tipo.id",
                    template: "#: window.app.idioma.t('TURNO' + tipo.id)#",
                    valueTemplate: "#: window.app.idioma.t('TURNO' + tipo.id)#",
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                self.CambiarLineaFecha();
                $("#ddlTurno").data("kendoDropDownList").value(self.model.idTipoTurno);

                if (self.model.tipo == 0) {
                    self.$("#cmbMaquina").kendoDropDownList({
                        dataTextField: "Descripcion",
                        dataValueField: "CodigoMaquina",
                        optionLabel: window.app.idioma.t('SELECCIONE')
                    });

                    self.$("#cmbEquipoConstructivo").kendoDropDownList({
                        dataTextField: "Descripcion",
                        dataValueField: "CodigoEquipo",
                        optionLabel: window.app.idioma.t('SELECCIONE')
                    });

                    if (self.model.idLinea) {
                        var maquinas = null;

                        $.ajax({
                            url: "../api/MaquinasLinea/" + self.model.idLinea + "/",
                            dataType: 'json',
                            async: false
                        }).done(function (listaMaquinas) {
                            maquinas = listaMaquinas;
                        }).fail(function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_MAQUINAS'), 4000);
                            }
                        });

                        var dsMaquinas = new kendo.data.DataSource({
                            data: maquinas,
                        });

                        $("#cmbMaquina").data("kendoDropDownList").setDataSource(dsMaquinas);
                    }

                    if (self.model.idMaquina) {
                        $("#cmbMaquina").data("kendoDropDownList").value(self.model.idMaquina);
                        self.cambiaMaquina();
                    }

                    if (self.model.idEquipoConstructivo) {
                        $("#cmbEquipoConstructivo").data("kendoDropDownList").value(self.model.idEquipoConstructivo);
                    }

                    this.$("#grid").kendoGrid({
                        dataSource: {
                            data: self.datosGrid,
                            pageSize: 50,
                            schema: {
                                model: {
                                    id: "Id",
                                    fields: {
                                        Id: { type: "string", editable: false, nullable: false },
                                        TipoParoPerdida: { type: "string" },
                                        EsParoMayor: { type: "number" },
                                        EsParoMenor: { type: "number" },
                                        EsBajaVelocidad: { type: "number" },
                                        IdLinea: { type: "number" },
                                        FechaTurno: { type: "date" },
                                        IdTipoTurno: { type: "string" },
                                        NombreTipoTurno: { type: "string" },
                                        InicioLocal: { type: "date" },
                                        FinLocal: { type: "date" },
                                        EquipoNombre: { type: "string" },
                                        EquipoConstructivoNombre: { type: "string" },
                                        MotivoNombre: { type: "string" },
                                        CausaNombre: { type: "string" },
                                        Descripcion: { type: "string" },
                                        Observaciones: { type: "string" },
                                        Duracion: { type: "date" },
                                        EquipoDescripcion: { type: "string" },
                                        NumeroLineaDescripcion: { type: "string" },
                                    }
                                }
                            }
                        },
                        sortable: true,
                        resizable: true,
                        filterable: {
                            extra: false,
                            messages: window.app.cfgKendo.configuracionFiltros_Msg,
                            operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                        },
                        selectable: false,
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            pageSizes: [50, 100, 200],
                            buttonCount: 5,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        columns: [
                            {
                                field: "IdLinea",
                                title: window.app.idioma.t("LINEA"),
                                width: 100,
                                template: window.app.idioma.t("LINEA") + ' #: NumeroLineaDescripcion # - #: DescLinea #',
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //return "<div><label><input type='checkbox' style='width: 14px;height:14px;margin-right:5px;'/>h</label></div>";
                                            return "<div><label><input type='checkbox' value='#=IdLinea#' style='width: 14px;height:14px;margin-right:5px;'/>" + window.app.idioma.t('LINEA') + " #= NumeroLineaDescripcion# - #= DescLinea#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "FechaTurno", title: window.app.idioma.t("FECHA_TURNO"), width: 100,
                                //template: '#: new Date(FechaTurno).toLocaleString() #',
                                format: "{0:dd/MM/yyyy}",
                                filterable: {
                                    ui: function (element) {
                                        element.kendoDatePicker({
                                            format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                            culture: localStorage.getItem("idiomaSeleccionado")
                                        });
                                    }
                                }
                            },
                            {
                                field: "IdTipoTurno",
                                template: "#if(IdTipoTurno){# #: window.app.idioma.t('TURNO'+IdTipoTurno) # #}#",
                                title: window.app.idioma.t("TURNO"),
                                width: 100,
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=IdTipoTurno#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t('TURNO'+IdTipoTurno)#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "TipoParoPerdida",
                                title: window.app.idioma.t("TIPO"),
                                width: 100,
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=Tipo#' style='width: 14px;height:14px;margin-right:5px;'/>#= Tipo#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "InicioLocal", title: window.app.idioma.t("HORAINICIO"), width: 100,
                                //template: '#: new Date(InicioLocal).toLocaleTimeString() #',
                                format: "{0:dd/MM/yyyy HH:mm:ss}",
                                filterable: {
                                    extra: true,
                                    ui: function (element) {
                                        element.kendoDatePicker({
                                            format: "dd/MM/yyyy HH:mm:ss",
                                            culture: localStorage.getItem("idiomaSeleccionado")
                                        });
                                    }
                                }
                            },
                            {
                                field: "Duracion",
                                title: window.app.idioma.t("DURACION"),
                                //template: ' #=  window.app.getDateFormat(Duracion) #',
                                width: 100,
                                format: "{0:HH:mm:ss}",
                                filterable: {
                                    extra: false,
                                    ui: function (element) {
                                        element.kendoTimePicker({
                                            format: "HH:mm:ss",
                                            culture: localStorage.getItem("idiomaSeleccionado")
                                        });
                                    }

                                }
                            },
                            {
                                field: "EquipoDescripcion",
                                title: window.app.idioma.t("LLENADORA"),
                                width: 100,
                                //template: "#: CodigoMaquina # - #: Maquina #"
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=EquipoDescripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= EquipoDescripcion#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "MotivoNombre",
                                title: window.app.idioma.t("MOTIVO"),
                                width: 100,
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=MotivoNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= MotivoNombre#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "CausaNombre",
                                title: window.app.idioma.t("CAUSA"),
                                width: 100,
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=CausaNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= CausaNombre#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "MaquinaCausaNombre",
                                title: window.app.idioma.t("MAQUINA_RESPONSABLE"),
                                width: 100,
                                //template: "#: CodigoMaquina # - #: Maquina #"
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=MaquinaCausaNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= MaquinaCausaNombre#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "EquipoConstructivoNombre",
                                title: window.app.idioma.t("EQ_CONSTRUCTIVO"),
                                width: 100,
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=EquipoConstructivoNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= EquipoConstructivoNombre#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "Descripcion",
                                title: window.app.idioma.t("DESCRIPCION"),
                                width: 100,
                                template: "<span class='addTooltip'>#=Descripcion ? Descripcion : ''#</span>",
                                attributes: {
                                    style: 'white-space: nowrap ',
                                },
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            return "<div><label><input type='checkbox' value='#=Descripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= Descripcion#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "Observaciones",
                                title: window.app.idioma.t("OBSERVACION"),
                                template: "<span class='addTooltip'>#=Observaciones ? Observaciones : ''#</span>",
                                width: 100,
                                attributes: {
                                    style: 'white-space: nowrap ',
                                },
                            },
                            {
                                command: [{
                                    name: "destroy",
                                    template: "<a id='btnBorrar' class='k-button k-grid-delete' href='' style='min-width:16px;'><span class='k-icon k-delete'></span></a>"
                                }],
                                width: "60px"
                            }
                        ],
                        remove: function (e) {
                        },
                        dataBinding: self.resizeGrid(),
                    });

                    $("#grid").kendoTooltip({
                        filter: ".addTooltip",
                        content: function (e) {
                            return e.target.html();
                        }
                    }).data("kendoTooltip");

                } else if (self.model.tipo == 1) {
                    this.$("#grid").kendoGrid({
                        dataSource: {
                            data: self.datosGrid,
                            pageSize: 50,
                            schema: {
                                model: {
                                    id: "Id",
                                    fields: {
                                        Id: { type: "string", editable: false, nullable: false },
                                        Linea: { type: "number" },
                                        TipoTurnoId: { type: "string" },
                                        TipoTurno: { type: "string" },
                                        FechaTurno: { type: "date" },
                                        InicioReal: { type: "date" },
                                        ProductoEntrante: { type: "string" },
                                        ProductoSaliente: { type: "string" },
                                        MinutosFinal1: { type: "number" },
                                        MinutosFinal2: { type: "number" },
                                        MinutosObjetivo1: { type: "number" },
                                        MinutosObjetivo2: { type: "number" },
                                        NumLineaDescripcion: { type: "string" },
                                    },
                                    getProductoEntrante: function () {
                                        return this.IDProductoEntrante + " - " + this.ProductoEntrante;
                                    },
                                    getProductoSaliente: function () {
                                        return this.IDProductoSaliente + " - " + this.ProductoSaliente;
                                    }
                                }
                            }
                        },
                        sortable: true,
                        resizable: true,
                        filterable: {
                            extra: false,
                            messages: window.app.cfgKendo.configuracionFiltros_Msg,
                            operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                        },
                        selectable: false,
                        pageable: {
                            refresh: true,
                            pageSizes: true,
                            buttonCount: 5,
                            pageSizes: [50, 100, 200],
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        columns: [
                            {
                                 field: "Linea",
                                 title: window.app.idioma.t("LINEA"),
                                 template: "#: window.app.idioma.t('LINEA') # #: NumLineaDescripcion # - #: DescripcionLinea #",
                                 width: 100,
                                 filterable: {
                                     multi: true,
                                     itemTemplate: function (e) {
                                         if (e.field == "all") {
                                             //handle the check-all checkbox template
                                             return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                         } else {
                                             //handle the other checkboxes
                                             return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#: window.app.idioma.t('LINEA') # #: NumLineaDescripcion # - #: DescripcionLinea #</label></div>";
                                         }
                                     }
                                 }
                            },
                            {
                                field: "TipoTurnoId",
                                title: window.app.idioma.t("TIPO_TURNO"),
                                template: "#if(TipoTurnoId){# #: window.app.idioma.t('TURNO'+TipoTurnoId) # #}#",
                                width: 100,
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=TipoTurnoId#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t('TURNO'+TipoTurnoId)#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "FechaTurno", title: window.app.idioma.t("FECHA_TURNO"), width: 100,
                                format: "{0:dd/MM/yyyy}",
                                filterable: {
                                    ui: function (element) {
                                        element.kendoDatePicker({
                                            format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                            culture: localStorage.getItem("idiomaSeleccionado")
                                        });
                                    }
                                }
                            },
                            {
                                field: "InicioReal", title: window.app.idioma.t("FECHA_HORA"), width: 100,
                                format: "{0:dd/MM/yyyy HH:mm:ss}",
                                filterable: {
                                    extra: true,
                                    ui: function (element) {
                                        element.kendoDatePicker({
                                            format: "dd/MM/yyyy HH:mm:ss",
                                            culture: localStorage.getItem("idiomaSeleccionado")
                                        });
                                    }
                                }
                            },
                            {
                                field: "getProductoEntrante()",
                                title: window.app.idioma.t("PRODUCTO_ENTRANTE"),
                                width: 100,
                                filterable: true,
                            },
                            {
                                field: "getProductoSaliente()",
                                title: window.app.idioma.t("PRODUCTO_SALIENTE"),
                                width: 100,
                                filterable: true,
                            },
                            {
                                field: "MinutosFinal1",
                                title: window.app.idioma.t("DURACION") + " 1",
                                width: 100,
                                //template: ' #=  window.app.getDateFormat(MinutosFinal1 * 60) #',
                                filterable: {
                                    ui: function (element) {
                                        element.kendoNumericTextBox({
                                            format: "0",
                                            decimals: 0
                                        });
                                    }
                                }
                            },
                            {
                                field: "MinutosFinal2",
                                title: window.app.idioma.t("DURACION") + " 2",
                                width: 100,
                                //template: ' #=  window.app.getDateFormat(MinutosFinal2 * 60) #',
                                filterable: {
                                    ui: function (element) {
                                        element.kendoNumericTextBox({
                                            format: "0",
                                            decimals: 0
                                        });
                                    }
                                }
                            },
                            {
                                field: "MinutosObjetivo1",
                                title: window.app.idioma.t("TIEMPO_OBJETIVO") + " 1",
                                width: 100,
                                //template: ' #=  window.app.getDateFormat(MinutosObjetivo1 * 60) #',
                                filterable: {
                                    ui: function (element) {
                                        element.kendoNumericTextBox({
                                            format: "0",
                                            decimals: 0
                                        });
                                    }
                                }
                            },
                            {
                                field: "MinutosObjetivo2",
                                title: window.app.idioma.t("TIEMPO_OBJETIVO") + " 2",
                                width: 100,
                                //template: ' #=  window.app.getDateFormat(MinutosObjetivo2 * 60) #',
                                filterable: {
                                    ui: function (element) {
                                        element.kendoNumericTextBox({
                                            format: "0",
                                            decimals: 0
                                        });
                                    }
                                }
                            },
                            {
                                command: [{
                                    name: "destroy",
                                    template: "<a id='btnBorrar' class='k-button k-grid-delete' href='' style='min-width:16px;'><span class='k-icon k-delete'></span></a>"
                                }],
                                width: "60px"
                            }
                        ],
                        remove: function (e) {
                        },
                        dataBinding: self.resizeGrid(),
                    });
                } else if (self.model.tipo == 2) {
                    this.$("#grid").kendoGrid({
                        dataSource: {
                            data: self.datosGrid,
                            pageSize: 50,
                            schema: {
                                model: {
                                    id: "Id",
                                    fields: {
                                        Id: { type: "string", editable: false, nullable: false },
                                        Linea: { type: "number" },
                                        TipoTurnoId: { type: "string" },
                                        TipoTurno: { type: "string" },
                                        FechaTurno: { type: "date" },
                                        InicioReal: { type: "date" },
                                        IDProductoEntrante: { type: "string" },
                                        ProductoEntrante: { type: "string" },
                                        MinutosFinal1: { type: "number" },
                                        MinutosFinal2: { type: "number" },
                                        MinutosObjetivo1: { type: "nember" },
                                        MinutosObjetivo2: { type: "number" },
                                        NumLineaDescripcion: { type: "string" },
                                    },
                                    getProductoEntrante: function () {
                                        if (this.IDProductoEntrante) {
                                            return this.IDProductoEntrante + " - " + this.ProductoEntrante;
                                        } else {
                                            return '';
                                        }
                                    }
                                }
                            }
                        },
                        sortable: true,
                        resizable: true,
                        filterable: {
                            extra: false,
                            messages: window.app.cfgKendo.configuracionFiltros_Msg,
                            operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                        },
                        selectable: false,
                        pageable: {
                            refresh: true,
                            pageSizes: [50, 100, 200],
                            pageSizes: true,
                            buttonCount: 5,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        columns: [
                            {
                                field: "Linea",
                                title: window.app.idioma.t("LINEA"),
                                template: "#: window.app.idioma.t('LINEA') # #: NumLineaDescripcion # - #: DescripcionLinea #",
                                width: 100,
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#: window.app.idioma.t('LINEA') # #: NumLineaDescripcion # - #: DescripcionLinea #</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "TipoArranque",
                                title: window.app.idioma.t("TIPO_ARRANQUE"),
                                width: 100,
                                template: "#: window.app.idioma.t('TIPO_ARRANQUE'+TipoArranque) #",
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=TipoArranque#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t('TIPO_ARRANQUE'+TipoArranque)#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "TipoTurnoId",
                                title: window.app.idioma.t("TIPO_TURNO"),
                                template: "#if(TipoTurnoId){# #: window.app.idioma.t('TURNO'+TipoTurnoId) # #}#",
                                width: 100,
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=TipoTurnoId#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t('TURNO'+TipoTurnoId)#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "FechaTurno", title: window.app.idioma.t("FECHA_TURNO"), width: 100,
                                format: "{0:dd/MM/yyyy}",
                                filterable: {
                                    ui: function (element) {
                                        element.kendoDatePicker({
                                            format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                                            culture: localStorage.getItem("idiomaSeleccionado")
                                        });
                                    }
                                }
                            },
                            {
                                field: "InicioReal", title: window.app.idioma.t("FECHA_HORA"), width: 100,
                                format: "{0:dd/MM/yyyy HH:mm:ss}",
                                filterable: {
                                    extra: true,
                                    ui: function (element) {
                                        element.kendoDatePicker({
                                            format: "dd/MM/yyyy HH:mm:ss",
                                            culture: localStorage.getItem("idiomaSeleccionado")
                                        });
                                    }
                                }
                            },
                            {
                                field: "getProductoEntrante()",
                                title: window.app.idioma.t("PRODUCTO_ENTRANTE"),
                                width: 100,
                                filterable: true,
                            },
                            {
                                field: "MinutosFinal1",
                                title: window.app.idioma.t("DURACION") + " 1",
                                width: 100,
                                //template: ' #=  window.app.getDateFormat(MinutosFinal1 * 60) #',
                                filterable: {
                                    ui: function (element) {
                                        element.kendoNumericTextBox({
                                            format: "0",
                                            decimals: 0
                                        });
                                    }
                                }
                            },
                            {
                                field: "MinutosFinal2",
                                title: window.app.idioma.t("DURACION") + " 2",
                                width: 100,
                                //template: ' #=  window.app.getDateFormat(MinutosFinal2 * 60) #',
                                filterable: {
                                    ui: function (element) {
                                        element.kendoNumericTextBox({
                                            format: "0",
                                            decimals: 0
                                        });
                                    }
                                }
                            },
                            {
                                field: "MinutosObjetivo1",
                                title: window.app.idioma.t("TIEMPO_OBJETIVO") + " 1",
                                width: 100,
                                //template: ' #=  window.app.getDateFormat(MinutosObjetivo1 * 60) #',
                                filterable: {
                                    ui: function (element) {
                                        element.kendoNumericTextBox({
                                            format: "0",
                                            decimals: 0
                                        });
                                    }
                                }
                            },
                            {
                                field: "MinutosObjetivo2",
                                title: window.app.idioma.t("TIEMPO_OBJETIVO") + " 2",
                                width: 100,
                                //template: ' #=  window.app.getDateFormat(MinutosObjetivo2 * 60) #',
                                filterable: {
                                    ui: function (element) {
                                        element.kendoNumericTextBox({
                                            format: "0",
                                            decimals: 0
                                        });
                                    }
                                }
                            },
                            {
                                command: [{
                                    name: "destroy",
                                    template: "<a id='btnBorrar' class='k-button k-grid-delete' href='' style='min-width:16px;'><span class='k-icon k-delete'></span></a>"
                                }],
                                width: "60px"
                            }

                        ],
                        remove: function (e) {
                        },
                        dataBinding: self.resizeGrid(),
                    });
                }
            },
            events: {
                'click #btnSeleccionarParosPerdidas': 'SeleccionarParosPerdidas',
                'click #btnGuardarAccionMejora': 'confirmarGuardarAccionMejora',
                'click #btnCancelarAccionMejora': 'CancelarAccionMejora',
                'change #cmbLinea': 'cambiaLinea',
                'change #cmbMaquina': 'cambiaMaquina',
                'click #btnBorrar': 'confirmarBorrado',
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
            },
            CambiarLineaFecha: function () {
                var self = this;

                if ($("#dtpFechaTurno").data("kendoDatePicker").value() == null) return;

                var idLinea = $("#cmbLinea").data("kendoDropDownList").value();
                var hoyDate = new Date();
                var timestamp = $("#dtpFechaTurno").data("kendoDatePicker").value().getTime() - hoyDate.getTimezoneOffset() * 60 * 1000;
                self.ObtenerTurnos(idLinea, timestamp);
            },
            ObtenerTurnos: function (idLinea, fecha) {
                var self = this;

                $.ajax({
                    url: "../api/turnosLineaDia/" + idLinea + "/" + fecha,
                    dataType: 'json',
                    async: false
                }).done(function (listaTurnos) {
                    self.turnos = listaTurnos;
                }).fail(function (e) {
                    if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                    }
                });

                var ds = new kendo.data.DataSource({
                    data: self.turnos,
                    sort: { field: "nombre", dir: "asc" }
                });

                var comboTurno = $("#ddlTurno").data('kendoDropDownList');
                comboTurno.setDataSource(ds);
                //comboTurno.select(0);
            },
            confirmarBorrado: function (e) {
                e.preventDefault()
                var self = this;
                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('ELIMINAR_PARO_PERDIDA'),
                    msg: window.app.idioma.t('SEGURO_QUE_DESEA'),
                    funcion: function () { self.borrarParoPerdida(e); },
                    contexto: this
                });
            },
            borrarParoPerdida: function (e) {
                try {
                    var self = this;
                    var tr = $(e.target.parentNode.parentNode).closest("tr");
                    var grid = $("#grid").data('kendoGrid');
                    var data = grid.dataItem(tr);
                    var datosGrid = grid.dataSource.data();

                    for (i = 0; i < datosGrid.length; i++) {
                        if (datosGrid[i].id == data.id) {
                            datosGrid.splice(i, 1);
                            break;
                        }
                    }

                    grid.dataSource.data(datosGrid);
                    Backbone.trigger('eventCierraDialogo');
                }
                catch (err) {
                    Backbone.trigger('eventCierraDialogo');
                }
            },
            confirmarGuardarAccionMejora: function (e) {
                e.preventDefault()
                var self = this;

                if ($('#txtDescripcionProblema').val() === '' || $("#cmbLinea").data("kendoDropDownList").value() === '') {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_ACCION_MEJORA'), 3000);
                    return;
                }

                this.confirmacion = new VistaDlgConfirm({
                    titulo: window.app.idioma.t('GUARDAR_ACCION_MEJORA'),
                    msg: window.app.idioma.t('DESEA_GUARDAR_LOS'),
                    funcion: function () { self.GuardarAccionMejora(e); },
                    contexto: this
                });
            },
            cambiaLinea: function () {
                var self = this;

                if (self.model.tipo == 0) {
                    var cmbMaquina = $("#cmbMaquina").data("kendoDropDownList");
                    var idLinea = $("#cmbLinea").data("kendoDropDownList").value();
                    var maquinas = null;

                    if (idLinea) {
                        $.ajax({
                            url: "../api/MaquinasLinea/" + idLinea + "/",
                            dataType: 'json',
                            async: false
                        }).done(function (listaMaquinas) {
                            maquinas = listaMaquinas;
                        }).fail(function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_MAQUINAS'), 4000);
                            }
                        });

                        var dsMaquinas = new kendo.data.DataSource({
                            data: maquinas,
                        });

                        cmbMaquina.setDataSource(dsMaquinas);
                    } else {
                        cmbMaquina.dataSource.data([]);
                        cmbMaquina.refresh();
                    }

                    var cmbEquipoConstructivo = $("#cmbEquipoConstructivo").data("kendoDropDownList");
                    cmbEquipoConstructivo.dataSource.data([]);
                    cmbEquipoConstructivo.refresh();
                }
            },
            cambiaMaquina: function () {
                var cmbEquipoConstructivo = $("#cmbEquipoConstructivo").data("kendoDropDownList");
                var codigoMaquina = $("#cmbMaquina").data("kendoDropDownList").value().trim();
                var equipos = null;

                if (codigoMaquina && codigoMaquina != "") {
                    $.ajax({
                        url: "../api/EquiposConstructivosMaquina/" + codigoMaquina + "/",
                        dataType: 'json',
                        async: false
                    }).done(function (listaEquipos) {
                        equipos = listaEquipos;
                    }).fail(function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_EQUIPOS_CONSTRUCTIVOS'), 4000);
                        }
                    });

                    var dsEquipos = new kendo.data.DataSource({
                        data: equipos,
                    });

                    cmbEquipoConstructivo.setDataSource(dsEquipos);
                }
                else {
                    cmbEquipoConstructivo.dataSource.data([]);
                    cmbEquipoConstructivo.refresh();
                }
            },
            SeleccionarParosPerdidas: function () {
                var nombreLinea = $("#cmbLinea").data("kendoDropDownList").value();
                var fechaTurno = $("#dtpFechaTurno").data('kendoDatePicker').value();
                var idTipoTurno = $("#ddlTurno").data('kendoDropDownList').value();

                if (this.model.tipo == 0) {
                    if (nombreLinea) {
                        this.vistaSeleccion = new VistaSeleccionaParosPerdidas(nombreLinea, fechaTurno, idTipoTurno);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_LINEA'), 4000);
                    }
                } else if (this.model.tipo == 1) {
                    if (nombreLinea) {
                        this.vistaSeleccion = new VistaSeleccionaCambios(nombreLinea, fechaTurno, idTipoTurno);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_LINEA'), 4000);
                    }
                } else if (this.model.tipo == 2) {
                    if (nombreLinea) {
                        this.vistaSeleccion = new VistaSeleccionaArranques(nombreLinea, fechaTurno, idTipoTurno);
                    } else {
                        Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_LINEA'), 4000);
                    }
                }
            },
            actualizaGrid: function (checkedRows) {
                var self = this;
                var datosGrid = $("#grid").data("kendoGrid").dataSource.data();

                jQuery.each(checkedRows, function (index, value) {
                    var sw = false;
                    for (i = 0; i < datosGrid.length; i++) {
                        if (datosGrid[i].id == value.id) {
                            sw = true;
                            break;
                        }
                    }
                    if (sw == false) {
                        datosGrid.push(value);
                    }
                });

                $("#grid").data("kendoGrid").dataSource.data(datosGrid);
            },
            GuardarAccionMejora: function () {
                var self = this;

                self.model.descripcionProblema = $('#txtDescripcionProblema').val();
                self.model.causa = $('#txtCausa').val();
                self.model.accionPropuesta = $('#txtAccionPropuesta').val();
                self.model.observaciones = $('#txtObservaciones').val();

                if ($("#cbFechaFinalizada").prop("checked")) {
                    var ahora = new Date();
                    self.model.fechaFinalizada = new Date(ahora.getTime() + ahora.getTimezoneOffset() * 60 * 1000);
                } else {
                    self.model.fechaFinalizada = null;
                }

                self.model.idLinea = $("#cmbLinea").data("kendoDropDownList").value();
                self.model.fechaTurno = $("#dtpFechaTurno").data('kendoDatePicker').value();
                self.model.idTipoTurno = $("#ddlTurno").data('kendoDropDownList').value();

                if (self.model.tipo == 0) {
                    self.model.idMaquina = $("#cmbMaquina").data("kendoDropDownList").value();
                    self.model.idEquipoConstructivo = $("#cmbEquipoConstructivo").data("kendoDropDownList").value();
                }

                var datosGrid = $("#grid").data("kendoGrid").dataSource.data();
                var accionEliminar = '';
                var accionInsertar = '';

                $.ajax({
                    data: JSON.stringify(self.model),
                    type: "POST",
                    async: true,
                    url: "../api/accionesMejora/actualizar",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function () {
                        if (self.model.tipo == 0) {
                            accionEliminar = "../api/accionesMejora/eliminarParosPerdidas/";
                            accionInsertar = "../api/accionesMejora/insertarParoMayor/";
                        } else if (self.model.tipo == 1) {
                            accionEliminar = "../api/accionesMejora/eliminarCambios/";
                            accionInsertar = "../api/accionesMejora/insertarCambio/";
                        } else if (self.model.tipo == 2) {
                            accionEliminar = "../api/accionesMejora/eliminarArranques/";
                            accionInsertar = "../api/accionesMejora/insertarArranque/";
                        }

                        $.ajax({
                            type: "GET",
                            async: true,
                            url: accionEliminar + self.model.id,
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            success: function () {
                                if (datosGrid && datosGrid.length > 0) {
                                    for (i = 0; i < datosGrid.length; i++) {
                                        $.ajax({
                                            type: "GET",
                                            async: false,
                                            url: accionInsertar + self.model.id + "/" + datosGrid[i].id + "/",
                                            contentType: "application/json; charset=utf-8",
                                            dataType: "json",
                                            success: function (data) {
                                                if (i == (datosGrid.length - 1)) {
                                                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_ACTUALIZADO'), 4000);
                                                    self.eliminar(true);
                                                }
                                            },
                                            error: function (e, msg, ex) {
                                                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                                } else {
                                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CREAR_ACCION') + ex, 4000);
                                                }
                                            }
                                        });
                                    }
                                } else {
                                    Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SE_HA_ACTUALIZADO'), 4000);
                                    self.eliminar(true);
                                }
                            },
                            error: function (err, msg, ex) {
                                if (err.status == '403' && err.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CREAR_ACCION') + ex, 4000);
                                }
                            }
                        });

                        Backbone.trigger('eventCierraDialogo');
                    },
                    error: function (e, msg, ex) {
                        Backbone.trigger('eventCierraDialogo');
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_AL_CREAR_ACCION') + ex, 4000);
                        }
                    }
                });
            },
            CancelarAccionMejora: function () {
                this.eliminar(true);
            },
            eliminar: function (returnList) {
                if (this.vistaSeleccion) {
                    this.vistaSeleccion.eliminar();
                }
                // same as this.$el.remove();
                this.remove();

                // unbind events that are
                // set on this view
                this.off();

                // remove all models bindings
                // made by this view
                if (this.model && this.model.off) { this.model.off(null, null, this); }

                if (this.model.tipo == 0) {
                    Backbone.off('eventParosSeleccionados');
                } else if (this.model.tipo == 1) {
                    Backbone.off('eventCambiosSeleccionados');
                } else if (this.model.tipo == 2) {
                    Backbone.off('eventArranqueSeleccionados');
                }

                if (returnList) {
                    if (this.model.tipo == 0) {
                        $('#idSintesisParos').show();
                        window.location.hash = "SintesisParos";
                    } else if (this.model.tipo == 1) {
                        $('#idSintesisCambio').show();
                        window.location.hash = "SintesisCambio";
                    } else if (this.model.tipo == 2) {
                        $('#idSintesisArranque').show();
                        window.location.hash = "SintesisArranque";
                    }

                    $("#gridAccionesMejora").data('kendoGrid').dataSource.read();
                }
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosGrid1Height = $("#divFiltrosParosHeader").innerHeight();
                var filtrosSeparadorGridHeight = $("#divSeparadorGrids").innerHeight();
                //var filtrosGrid2Height = $("#divFiltrosAccionesMejora").innerHeight();

                //Grid 1
                var gridElement = $("#grid");

                var dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                //dataArea.height(contenedorHeight / 2 - otherElementsHeight - cabeceraHeight / 2 - filtrosGrid1Height - filtrosSeparadorGridHeight / 2 - 2);
                gridElement.height(window.innerHeight - $(".navbar").innerHeight() - $("#divCabeceraVista").innerHeight() - $("#divEdicionAccionesMejora").innerHeight() - $("#divFiltrosParosHeader").innerHeight() - 2 * $("#divBotonesEdicionAccionesMejora").innerHeight());
            },
            LimpiarFiltroGrid: function () {
                $("form.k-filter-menu button[type='reset']").trigger("click");
            }
        });

        return VistaEditarAccionMejora;
    });