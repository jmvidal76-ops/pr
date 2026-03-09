define(['underscore', 'backbone', 'jquery', 'compartido/notificaciones'
    , 'compartido/util', 'jszip', '../../../../Portal/js/constantes', '../../../../Terminal/js/vistas/Mantenimiento/vValidacionArranqueOT', 'compartido/util'],
    function (_, Backbone, $, Not, util, JSZip, enums, vistaValidacionArranqueOT, util) {
        var VistaSolicitudesOts = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            ds: null,
            grid: null,
            fin: new Date(new Date().setHours(23, 50, 0, 0)),
            inicio: new Date(new Date().setHours(0, 0, 0, 0) - (7 * 24 * 3600 * 1000)),
            template: null,
            constOperacionesMantenimiento: enums.OperacionesSolicitudMantenimiento(),
            constEstadosMantenimiento: enums.EstadosSolicitudMantenimiento(),
            initialize: function ({ parent, options }) {
                let self = this;
                window.JSZip = JSZip;
                self.parent = parent;
                self.options = options || {};

                let splitter = $("#vertical").data("kendoSplitter");
                splitter.bind("resize", self.resizeGrid);

                self.ds = new kendo.data.DataSource({
                    pageSize: 100,
                    transport: {
                        read: {
                            url: "../api/ObtenerSolicitudesIntervencion/",
                            dataType: "json",
                            contentType: "application/json; charset=utf-8",
                            type: "GET",
                            data: function () {
                                return {
                                    fInicio: $("#dtpFechaDesde").getKendoDateTimePicker().value()?.toISOString(),
                                    fFin: $("#dtpFechaHasta").getKendoDateTimePicker().value()?.toISOString(),
                                    esEnvasado: self.options.esEnvasado
                                }
                            }
                        },
                    },
                    serverFiltering: false,
                    serverSorting: false,
                    serverPaging: false,
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                'Id': { type: "number" },
                                'NumOT': { type: "number" },
                                'Linea': { type: "string" },
                                'Estado': { type: "string" },
                                'Maquina': { type: "string" },
                                'EquipoConstructivo': { type: "string" },
                                'DescripcionAveria': { type: "string" },
                                'DescripcionProblema': { type: "string" },
                                'ComentarioCierre': { type: "string" },
                                'FechaCreacion': { type: "date" },
                                'FechaCierre': { type: "date" },
                                "Usuario": { type: "object" },
                            }
                        }
                    },
                    error: function (e) {
                        if (e.xhr.status == '403' && e.xhr.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else if (e.xhr.status == '405') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FILTROS_OBLIGATORIOS'), 4000);
                        } else if (e.xhr.status == '406') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_FECHA_FIN_MENOR_INICIO'), 4000);
                        } else
                        {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_SOLICITUDES_MANTENIMIENTO'), 2000);
                        }
                    },
                });

                self.render();
                self.$("[data-funcion]").checkSecurity();
            },
            actualiza: function () {
                let self = this;

                RecargarGrid({ grid: self.grid });

            },
            LimpiarFiltroGrid: function () {
                let self = this;

                self.ds.query({
                    page: 1,
                    pageSize: self.ds.pageSize(),
                    sort: [],
                    filter: []
                })
            },
            events: {
                'click #btnLimpiarFiltros': 'LimpiarFiltroGrid',
                'click #btnFiltrar': 'actualiza',
                'click #btnAnadir': 'AbrirModalAnadirSolicitud',
                'click #btnEditar': 'AbrirModalEditarSolicitud',
                'click #btnValidarArranque': 'AbrirModalValidarArranque',
                'click #btnCerrar': 'AbrirModalCerrarSolicitud',
                'click #btnAsociarParo': 'AbrirModalAsociarParo',
                'click #btnExportarExcel': 'ExportarExcel',
            },
            ExportarExcel: function () {
                var self = this;
                kendo.ui.progress($("#SolicitudesOTsDiv"), true);
                self.grid.saveAsExcel();
                kendo.ui.progress($("#SolicitudesOTsDiv"), false);
            },
            AbrirModalAnadirSolicitud: function (e) {
                let self = this;

                //Creamos el div donde se va a pintar la ventana modal
                $("body").prepend($("<div id='dlgGestionSolicitud'></div>"));

                let datos = {
                    Usuario: { Id: window.app.sesion.attributes.usuarioId },
                }

                self.ConfigurarModal(e, datos);
            },
            AbrirModalEditarSolicitud: function (e) {
                let self = this;

                // Obtenemos la línea seleccionada del grid
                let grid = $("#gridSolicitudesOTs").getKendoGrid();
                let datos = grid.dataItem(grid.select());

                if (datos == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                // Comprobamos que no esté ya cerrada
                if (datos.Estado == self.constEstadosMantenimiento.Cerrada || datos.CerradoEnJDE) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SOLICITUD_CERRADA'), 4000);
                    return
                }

                // Esta lína clona el objeto datos, para que no se modifique el objeto original de la tabla
                datos = { ...datos };

                //Creamos el div donde se va a pintar la ventana modal
                $("body").prepend($("<div id='dlgGestionSolicitud'></div>"));

                self.ConfigurarModal(e, datos);
            },
            AbrirModalValidarArranque: async function (e) {
                let self = this;

                // Obtenemos la línea seleccionada del grid
                let grid = $("#gridSolicitudesOTs").getKendoGrid();
                let datos = grid.dataItem(grid.select());

                if (datos == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                const cerrada = datos.Estado == self.constEstadosMantenimiento.Cerrada || datos.CerradoEnJDE;

                // Comprobamos que la OT requiera Validación de Arranque
                kendo.ui.progress($("#content"), true);

                try {
                    const datosVal = await self.CheckValidacionArranque(datos.NumOT);

                    kendo.ui.progress($("#content"), false);

                    if (!datosVal.ValidacionRequerida) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDACION_ARRANQUE_NO_REQUERIDA'), 4000);
                        return;
                    }

                    self.windowValArranque = new vistaValidacionArranqueOT({
                        parent: self, OT: datos.NumOT, datosValidacion: datosVal.DatosValidacion, read: cerrada, callback: () => {
                            self.actualizarGrid();
                        }
                    });
                }
                catch (er) {
                    kendo.ui.progress($("#content"), false);

                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CHECK_VALIDACION_ARRANQUE'), 4000);
                }
            },
            AbrirModalCerrarSolicitud: async function (e) {
                let self = this;

                // Obtenemos la línea seleccionada del grid
                let grid = $("#gridSolicitudesOTs").getKendoGrid();
                let datos = grid.dataItem(grid.select());

                if (datos == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                // Comprobamos que no esté ya cerrada
                if (datos.Estado == self.constEstadosMantenimiento.Cerrada || datos.CerradoEnJDE) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SOLICITUD_CERRADA'), 4000);
                    return
                }

                // Comprobamos que la OT requiera Validación de Arranque
                kendo.ui.progress($("#content"), true);

                try {
                    const datosVal = await self.CheckValidacionArranque(datos.NumOT);

                    kendo.ui.progress($("#content"), false);

                    if (datosVal.ValidacionRequerida && !datosVal.DatosValidacion) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('VALIDACION_ARRANQUE_REQUERIDA'), 4000);
                        return;
                    }

                    // Esta línea clona el objeto datos, para que no se modifique el objeto original de la tabla
                    datos = { ...datos };

                    //Creamos el div donde se va a pintar la ventana modal
                    $("body").prepend($("<div id='dlgGestionSolicitud'></div>"));

                    self.ConfigurarModal(e, datos);
                }
                catch (er) {
                    kendo.ui.progress($("#content"), false);

                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CHECK_VALIDACION_ARRANQUE'), 4000);
                }
            },
            AbrirModalAsociarParo: function (e) {
                let self = this;

                // Obtenemos la línea seleccionada del grid
                let grid = $("#gridSolicitudesOTs").getKendoGrid();
                let datos = grid.dataItem(grid.select());

                if (datos == null) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AL_MENOS_UN_REGISTRO'), 4000);
                    return;
                }

                // Comprobamos que no esté ya cerrada
                if (datos.Estado == self.constEstadosMantenimiento.Cerrada || datos.CerradoEnJDE) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SOLICITUD_CERRADA'), 4000);
                    return
                }

                // Comprobamos que las fechas sean correctas, se usan para cargar los paros
                var fIni = $("#dtpFechaDesde").getKendoDateTimePicker().value();
                var fFin = $("#dtpFechaHasta").getKendoDateTimePicker().value();
                if (!fIni || !fFin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FILTROS_OBLIGATORIOS'), 4000);
                    return;
                } else if (fIni > fFin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_FECHA_FIN_MENOR_INICIO'), 4000);
                    return;
                }

                // Esta lína clona el objeto datos, para que no se modifique el objeto original de la tabla
                datos = { ...datos };

                //Creamos el div donde se va a pintar la ventana modal
                $("body").prepend($("<div id='dlgGestionSolicitud'></div>"));

                self.ConfigurarModal(e, datos);

            },
            ConfigurarModal: function (e, datos) {
                let self = this;
                let id = e.target.closest("button").id;

                let modo = id == "btnAnadir" ? self.constOperacionesMantenimiento.Crear :
                    id == "btnEditar" ? self.constOperacionesMantenimiento.Editar :
                        id == "btnCerrar" ? self.constOperacionesMantenimiento.Cerrar :
                            self.constOperacionesMantenimiento.AsociarParo;

                let title;
                let template;
                let width = "700px";
                let height = "";

                switch (modo) {
                    case self.constOperacionesMantenimiento.Crear:
                        title = window.app.idioma.t('CREAR_SOLICITUD_MAN');
                        template = self.options.esEnvasado ? "Mantenimiento/html/CrearSolicitudEnvasado.html" : "Mantenimiento/html/CrearSolicitudFabricacion.html";
                        break;
                    case self.constOperacionesMantenimiento.Editar:
                        title = window.app.idioma.t('EDITAR_SOLICITUD_MAN');
                        template = self.options.esEnvasado ? "Mantenimiento/html/EditarSolicitudEnvasado.html" : "Mantenimiento/html/EditarSolicitudFabricacion.html";
                        break;
                    case self.constOperacionesMantenimiento.Cerrar:
                        title = window.app.idioma.t('CERRAR_SOLICITUD_MAN');
                        template = "Mantenimiento/html/CerrarSolicitud.html";
                        break;
                    case self.constOperacionesMantenimiento.AsociarParo:
                        title = window.app.idioma.t('ASOCIAR_PAROS_SOLICITUD_MAN');
                        template = "Mantenimiento/html/AsociarSolicitud.html";
                        height = "90%";
                        width = "90%";
                        break;
                }

                self.ventanaGestion = $("#dlgGestionSolicitud").kendoWindow(
                    {
                        title: title,
                        width: width,
                        height: height,
                        content: template,
                        modal: true,
                        resizable: false,
                        draggable: false,
                        scrollable: false,
                        close: function () {
                            self.ventanaGestion.destroy();
                            self.ventanaGestion = null;
                        },
                        refresh: function () {
                            self.CargaContenidoModal(e, datos);
                            if (typeof self.ventanaGestion != "undefined") {
                                self.ventanaGestion.center();
                            }
                        }
                    }).getKendoWindow();

            },
            ConstruirModelo: function (datos) {
                var self = this;

                // Datos de los combos
                $("#dlgGestionSolicitud [data-model-name]").each(function () {
                    
                    var kendoWidget = kendo.widgetInstance($(this));
                    if (kendoWidget) {
                        datos[$(this).attr('data-model-name')] = kendoWidget.value();
                    }
                });

                datos.DescripcionAveria = $("#tfDescripcionAveria").val();
                datos.DescripcionProblema = $("#tfDescripcionProblema").val();
                datos.ComentarioCierre = $("#tfComentarioCierre").val();
                datos.EsEnvasado = self.options.esEnvasado;
            },
            CargaContenidoModal: function (e, datos) {
                let self = this;
                let id = e.target.closest("button").id;

                let modo = id == "btnAnadir" ? self.constOperacionesMantenimiento.Crear :
                    id == "btnEditar" ? self.constOperacionesMantenimiento.Editar :
                        id == "btnCerrar" ? self.constOperacionesMantenimiento.Cerrar :
                            self.constOperacionesMantenimiento.AsociarParo;

                $("#trError").hide();

                //Modificamos los botones aceptar y cancelar para que sean más pequeños en el portal
                $("#dlgGestionSolicitud").find(".boton").removeClass("boton");

                $("#dlgGestionSolicitud [data-lng-key]").each(function () {
                    $(this).html(window.app.idioma.t($(this).attr('data-lng-key')))
                });

                $("#dlgGestionSolicitud [data-lng-val-key]").each(function () {
                    $(this).val(window.app.idioma.t($(this).attr('data-lng-val-key')))
                })

                if (modo == self.constOperacionesMantenimiento.Crear || modo == self.constOperacionesMantenimiento.Editar) {
                    // ********* CREAR / EDITAR

                    $("#cmbLinea").kendoDropDownList({
                        dataValueField: "id",
                        template: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                        valueTemplate: window.app.idioma.t('LINEA') + " #= numLineaDescripcion # - #=descripcion #",
                        dataSource: new kendo.data.DataSource({
                            data: window.app.planta.lineas,
                            sort: { field: "nombre", dir: "asc" }
                        }),
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        change: function () {
                            let dropDownList = $("#cmbMaquina").getKendoDropDownList();
                            if (!dropDownList) {
                                return;
                            }
                            dropDownList.value(null);
                            dropDownList._old = null;
                            dropDownList.dataSource.read();
                            RefrescarAlturaDropDownListKendo(dropDownList);
                            dropDownList.trigger("change");
                        }
                    });

                    $("#cmbMaquina").kendoDropDownList({
                        dataTextField: "Descripcion",
                        dataValueField: "CodigoMaquina",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: function (operation) {
                                    var idPadre = $("#cmbLinea").getKendoDropDownList()?.value() || "_";

                                    if (idPadre) {
                                        $.ajax({
                                            url: "../api/MaquinasLinea/"+ idPadre +"/",
                                            dataType: "json",
                                            cache: false,
                                            success: function (response) {
                                                operation.success(response);
                                            },
                                            error: function (er) {
                                                operation.error(er);
                                            }
                                        })
                                    } else {
                                        operation.success([]);
                                    }

                                }
                            },
                            sort: { field: "CodigoMaquina", dir: "asc" },
                            schema: {
                                model: {
                                    id: "CodigoMaquina",
                                    fields: {
                                        'CodigoMaquina': { type: "string" },
                                        'Descripcion': { type: "string" },
                                    }
                                }
                            }
                        }),
                        height: 200,
                        change: function () {
                            let dropDownList = $("#cmbEquipo").getKendoDropDownList();
                            if (!dropDownList) {
                                return;
                            }
                            dropDownList.value(null);
                            dropDownList._old = null;
                            dropDownList.dataSource.read();
                            RefrescarAlturaDropDownListKendo(dropDownList);
                            dropDownList.trigger("change");
                        },
                        dataBound: function (e) {
                            if (modo == self.constOperacionesMantenimiento.Editar && e.sender.dataSource.total() > 0) {
                                e.sender.value(datos.Maquina);
                                e.sender.trigger("change");
                            }
                        }
                    });

                    $("#cmbEquipo").kendoDropDownList({
                        dataTextField: "Descripcion",
                        dataValueField: "CodigoEquipo",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: function (operation) {
                                    var idPadre = ($("#cmbMaquina").getKendoDropDownList()?.value() || "_").trim();

                                    if (idPadre) {
                                        $.ajax({
                                            url: "../api/EquiposConstructivosMaquina/" + idPadre + "/",
                                            dataType: "json",
                                            cache: false,
                                            success: function (response) {
                                                operation.success(response);
                                            },
                                            error: function (er) {
                                                operation.error(er);
                                            }
                                        })
                                    } else {
                                        operation.success([]);
                                    }

                                }
                            },
                            sort: { field: "CodigoEquipo", dir: "asc" },
                            schema: {
                                model: {
                                    id: "CodigoEquipo",
                                    fields: {
                                        'CodigoEquipo': { type: "string" },
                                        'Descripcion': { type: "string" },
                                    }
                                }
                            }
                        }),
                        height: 200,
                        dataBound: function (e) {
                            if (modo == self.constOperacionesMantenimiento.Editar && e.sender.dataSource.total() > 0) {
                                e.sender.value(datos.EquipoConstructivo);
                            }
                        }
                    })

                    $("#cmbTipoAveria").kendoDropDownList({
                        dataTextField: "DescripcionAveria",
                        dataValueField: "IdTipoAveria",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: {
                                    url: "../api/TiposAverias",
                                    dataType: "json",
                                }
                            },
                            error: function (e) {
                                if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                } else {
                                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_TIPOS_AVERIAS'), 4000);
                                }
                            }
                        }),
                    });

                    $("#buscadorTag").kendoComboBox({
                        template: ({ Codigo, Descripcion }) => `<span>(${Codigo}) - ${Descripcion}</span>`,
                        minLength: 2,
                        autoBind: false,
                        filter: "contains",
                        suggest: true,
                        dataValueField: "Codigo",
                        dataTextField: "Valor",
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: function (operation) {
                                    var tag = $("#buscadorTag").getKendoComboBox().text();
                                    if (tag?.length >= 2) {
                                        $.ajax({
                                            url: "../api/Mantenimiento/BuscadorTAGFabricacion?tag="+tag,
                                            dataType: "json",
                                            cache: false,
                                            success: function (response) {
                                                operation.success(response);
                                            },
                                            error: function (er) {
                                                operation.error(er);
                                            }
                                        })
                                    } else {
                                        operation.success([]);
                                    }                                    
                                }
                            },
                            serverFiltering: true,
                            sort: { field: "Codigo", dir: "asc" },
                            schema: {
                                parse: function (response) {

                                    for (let r of response) {
                                        r.Valor = `(${r.Codigo}) - ${r.Descripcion}`;
                                    }

                                    return response;
                                },
                                model: {
                                    id: "Codigo",
                                    fields: {
                                        'Codigo': { type: "string" },
                                        'Descripcion': { type: "string" },
                                    }
                                }
                            }
                        }),
                        height: 200,
                        change: function (e) {
                            var widget = e.sender;
                           
                            RefrescarAlturaDropDownListKendo(widget);
                            if (widget.select() != -1) {
                                self.CargarTag(widget.value());
                            }    
                        }
                    });
                    // Esto oculta el botón para desplegar el listado
                    $("#buscadorTag").parent().find(".k-dropdown-wrap").css("padding-right", "1px");
                    $("#buscadorTag").parent().find(".k-select").hide();

                    $("#cmbArea").kendoDropDownList({
                        template: ({ Codigo, Descripcion }) => `<span>(${Codigo}) - ${Descripcion}</span>`,
                        valueTemplate: ({ Codigo, Descripcion }) => `<span>(${Codigo}) - ${Descripcion}</span>`,
                        dataValueField: "Id",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: function (operation) {
                                    $.ajax({
                                        url: "../api/Mantenimiento/MaestroAreasFabricacion/",
                                        dataType: "json",                                        
                                        cache: false,
                                        success: function (response) {
                                            operation.success(response);
                                        },
                                        error: function (er) {
                                            operation.error(er);
                                        }
                                    })
                                }
                            },
                            sort: { field: "Codigo", dir: "asc" },
                            schema: {
                                model: {
                                    id: "Id",
                                    fields: {
                                        'Id': { type: "number" },
                                        'Codigo': { type: "string" },
                                        'Descripcion': { type: "string" },
                                    }
                                }
                            }
                        }),
                        height: 200,
                        change: function (e) {
                            var widget = $("#cmbZona").getKendoComboBox();
                            if (!widget) {
                                return;
                            }
                            widget.value(null);
                            widget._old = null;
                            widget.dataSource.read();
                            RefrescarAlturaDropDownListKendo(widget);
                            widget.trigger("change");
                        }
                    });

                    $("#cmbZona").kendoComboBox({
                        dataValueField: "Id",
                        dataTextField: "CodigoDescripcion",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        minLength: 1,
                        filter: "contains",
                        suggest: true,
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: function (operation) {
                                    var widgetPadre = $("#cmbArea").getKendoDropDownList();
                                    var wdgt = $("#cmbZona").getKendoComboBox();
                                    var idPadre = widgetPadre?.value();

                                    if (wdgt && idPadre && self.TagBuscado) {
                                        wdgt.CargaTag = true;
                                    }

                                    if (idPadre) {
                                        $.ajax({
                                            url: "../api/Mantenimiento/MaestroZonasFabricacion/",
                                            dataType: "json",
                                            data: { idPadre: idPadre },
                                            cache: false,
                                            success: function (response) {
                                                operation.success(response);
                                            },
                                            error: function (er) {
                                                operation.error(er);
                                            }
                                        })
                                    } else {
                                        operation.success([]);
                                    }
                                    
                                }
                            },
                            sort: { field: "Codigo", dir: "asc" },
                            schema: {
                                parse: function (response) {
                                    for (let r of response) {
                                        r.CodigoDescripcion = `(${r.Codigo}) - ${r.Descripcion}${(r.Descripcion2 ? " - " + r.Descripcion2 : "")}`;
                                    }

                                    return response;
                                },
                                model: {
                                    id: "Id",
                                    fields: {
                                        'Id': { type: "number" },
                                        'Codigo': { type: "string" },
                                        'Descripcion': { type: "string" },
                                    }
                                }
                            }
                        }),
                        height: 200,
                        change: function (e) {
                            var widget = $("#cmbEquipoF").getKendoComboBox();
                            if (!widget) {
                                return;
                            }
                            widget.value(null);
                            widget._old = null;
                            widget.dataSource.read();
                            RefrescarAlturaDropDownListKendo(widget);
                            widget.trigger("change");
                        },
                        dataBound: function (e) {
                            if (modo == self.constOperacionesMantenimiento.Editar && e.sender.dataSource.total() > 0) {
                                e.sender.value(datos.ZonaFabricacion);
                                e.sender.trigger("change");
                            }

                            if (e.sender.CargaTag) {
                                e.sender.CargaTag = false;
                                if (self.TagBuscado.IdZona) {
                                    e.sender.value(self.TagBuscado.IdZona);
                                    e.sender.trigger("change");
                                } else {
                                    self.TagBuscado = null;
                                    kendo.ui.progress($("#dlgGestionSolicitud"), false);
                                }
                            }                          
                        }
                    });

                    $("#cmbEquipoF").kendoComboBox({
                        dataValueField: "Id",
                        dataTextField: "CodigoDescripcion",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        minLength: 1,
                        filter: "contains",
                        suggest: true,                        
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: function (operation) {
                                    var widgetPadre = $("#cmbZona").getKendoComboBox();
                                    var wdgt = $("#cmbEquipoF").getKendoComboBox();
                                    var idPadre;
                                    if (widgetPadre && widgetPadre.selectedIndex >= 0) {
                                        idPadre = widgetPadre.value();
                                    }

                                    if (wdgt && idPadre && self.TagBuscado) {
                                        wdgt.CargaTag = true;
                                    }

                                    if (idPadre) {
                                        $.ajax({
                                            url: "../api/Mantenimiento/MaestroEquiposFabricacion/",
                                            dataType: "json",
                                            data: { idPadre: idPadre },
                                            cache: false,
                                            success: function (response) {
                                                operation.success(response);
                                            },
                                            error: function (er) {
                                                operation.error(er);
                                            }
                                        })
                                    } else {
                                        operation.success([]);
                                    }

                                }
                            },
                            sort: { field: "Codigo", dir: "asc" },
                            schema: {
                                parse: function (response) {
                                    for (let r of response) {
                                        r.CodigoDescripcion = `(${r.Codigo}) - ${r.Descripcion}${(r.Descripcion2 ? " - " + r.Descripcion2 : "")}`;
                                    }

                                    return response;
                                },
                                model: {
                                    id: "Id",
                                    fields: {
                                        'Id': { type: "number" },
                                        'Codigo': { type: "string" },
                                        'Descripcion': { type: "string" },
                                    }
                                }
                            }
                        }),
                        height: 200,
                        change: function (e) {
                            var widget = $("#cmbGrupoConstructivo").getKendoComboBox();
                            if (!widget) {
                                return;
                            }
                            widget.value(null);
                            widget._old = null;
                            widget.dataSource.read();
                            RefrescarAlturaDropDownListKendo(widget);
                            widget.trigger("change");
                        },
                        dataBound: function (e) {
                            if (modo == self.constOperacionesMantenimiento.Editar && e.sender.dataSource.total() > 0) {
                                    e.sender.value(datos.EquipoFabricacion);
                                    e.sender.trigger("change");
                            }

                            if (e.sender.CargaTag) {
                                e.sender.CargaTag = false;
                                if (self.TagBuscado.IdEquipo) {
                                    e.sender.value(self.TagBuscado.IdEquipo);
                                    e.sender.trigger("change");
                                } else {
                                    self.TagBuscado = null;
                                    kendo.ui.progress($("#dlgGestionSolicitud"), false);
                                }
                                
                            }                            
                        }
                    });

                    $("#cmbGrupoConstructivo").kendoComboBox({
                        dataValueField: "Id",
                        dataTextField: "CodigoDescripcion",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        minLength: 1,
                        filter: "contains",
                        suggest: true,
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: function (operation) {
                                    var widgetPadre = $("#cmbEquipoF").getKendoComboBox();
                                    var wdgt = $("#cmbGrupoConstructivo").getKendoComboBox();
                                    var idPadre;
                                    if (widgetPadre && widgetPadre.selectedIndex >= 0) {
                                        idPadre = widgetPadre.value();
                                    }

                                    if (wdgt && idPadre && self.TagBuscado) {
                                        wdgt.CargaTag = true;
                                    }

                                    if (idPadre) {
                                        $.ajax({
                                            url: "../api/Mantenimiento/MaestroGruposConstructivosFabricacion/",
                                            dataType: "json",
                                            data: { idPadre: idPadre },
                                            cache: false,
                                            success: function (response) {
                                                operation.success(response);
                                            },
                                            error: function (er) {
                                                operation.error(er);
                                            }
                                        })
                                    } else {
                                        operation.success([]);
                                    }

                                }
                            },
                            sort: { field: "Codigo", dir: "asc" },
                            schema: {
                                parse: function (response) {
                                    for (let r of response) {
                                        r.CodigoDescripcion = `(${r.Codigo}) - ${r.Descripcion}${(r.Descripcion2 ? " - " + r.Descripcion2 : "")}`;
                                    }

                                    return response;
                                },
                                model: {
                                    id: "Id",
                                    fields: {
                                        'Id': { type: "number" },
                                        'Codigo': { type: "string" },
                                        'Descripcion': { type: "string" },
                                    }
                                }
                            }
                        }),
                        height: 200,
                        change: function (e) {
                            var widget = $("#cmbRepuesto").getKendoComboBox();
                            if (!widget) {
                                return;
                            }
                            widget.value(null);
                            widget._old = null;
                            widget.dataSource.read();
                            RefrescarAlturaDropDownListKendo(widget);
                            widget.trigger("change");
                        },
                        dataBound: function (e) {
                            if (modo == self.constOperacionesMantenimiento.Editar && e.sender.dataSource.total() > 0) {
                                e.sender.value(datos.GrupoConstructivoFabricacion);
                                e.sender.trigger("change");
                            }

                            if (e.sender.CargaTag) {
                                e.sender.CargaTag = false;
                                if (self.TagBuscado.IdGrupoConstructivo) {
                                    e.sender.value(self.TagBuscado.IdGrupoConstructivo);
                                    e.sender.trigger("change");
                                } else {
                                    self.TagBuscado = null;
                                    kendo.ui.progress($("#dlgGestionSolicitud"), false);
                                }
                            }                                                        
                        }
                    });

                    $("#cmbRepuesto").kendoComboBox({
                        dataValueField: "Id",
                        dataTextField: "CodigoDescripcion",
                        optionLabel: window.app.idioma.t('SELECCIONE'),
                        minLength: 1,
                        filter: "contains",
                        suggest: true,
                        dataSource: new kendo.data.DataSource({
                            transport: {
                                read: function (operation) {
                                    var widgetPadre = $("#cmbGrupoConstructivo").getKendoComboBox();
                                    var wdgt = $("#cmbRepuesto").getKendoComboBox();
                                    var idPadre;
                                    if (widgetPadre && widgetPadre.selectedIndex >= 0) {
                                        idPadre = widgetPadre.value();
                                    }

                                    if (wdgt && idPadre && self.TagBuscado) {
                                        wdgt.CargaTag = true;
                                    }

                                    if (idPadre) {
                                        $.ajax({
                                            url: "../api/Mantenimiento/MaestroRepuestosFabricacion/",
                                            dataType: "json",
                                            data: { idPadre: idPadre },
                                            cache: false,
                                            success: function (response) {
                                                operation.success(response);
                                            },
                                            error: function (er) {
                                                operation.error(er);
                                            }
                                        })
                                    } else {
                                        operation.success([]);
                                    }

                                }
                            },
                            sort: { field: "Codigo", dir: "asc" },
                            schema: {
                                parse: function (response) {
                                    for (let r of response) {
                                        r.CodigoDescripcion = `(${r.Codigo}) - ${r.Descripcion}${(r.Descripcion2 ? " - " + r.Descripcion2 : "")}`;
                                    }

                                    return response;
                                },
                                model: {
                                    id: "Id",
                                    fields: {
                                        'Id': { type: "number" },
                                        'Codigo': { type: "string" },
                                        'Descripcion': { type: "string" },
                                    }
                                }
                            }
                        }),
                        height: 200,                        
                        dataBound: function (e) {
                            if (modo == self.constOperacionesMantenimiento.Editar && e.sender.dataSource.total() > 0) {                                
                                e.sender.value(datos.RepuestoFabricacion);
                                e.sender.trigger("change");
                            }

                            if (e.sender.CargaTag) {
                                e.sender.CargaTag = false;

                                e.sender.value(self.TagBuscado.IdRepuesto);
                                e.sender.trigger("change");

                                self.TagBuscado = null;
                                kendo.ui.progress($("#dlgGestionSolicitud"), false);
                            }
                        }
                    });

                    // ******* CREAR
                    if (modo == self.constOperacionesMantenimiento.Crear) {
                        $("#inputLinea").show();
                        $("#cmbLinea").prop('required', true);
                        $("#lblMaquina").parent().addClass("fila");

                        // Creación de nueva solicitud
                        $("#btnGestionCrear").kendoButton({
                            click: function () {
                                $("#trError").hide();
                                // Faltan campos por rellenar
                                if (!ValidarFormulario("CrearSolicitud")) {
                                    $("#trError").text(ObtenerCamposObligatorios("CrearSolicitud"));
                                    $("#trError").show();
                                    return;
                                }

                                self.ConstruirModelo(datos);

                                self.CrearSolicitud(datos);
                            }
                        });
                    } else {
                        // ****** EDITAR

                        // Damos valores a los inputs con los originales
                        $("#cmbLinea").getKendoDropDownList()?.value(datos.Linea);
                        $("#cmbLinea").getKendoDropDownList()?.trigger("change");

                        $("#cmbArea").getKendoDropDownList()?.value(datos.AreaFabricacion);
                        $("#cmbArea").getKendoDropDownList()?.trigger("change");

                        $("#cmbTipoAveria").getKendoDropDownList().value(datos.IdTipoAveria);

                        $("#tfDescripcionAveria").val(datos.DescripcionAveria);
                        $("#tfDescripcionProblema").val(datos.DescripcionProblema);
                        if (datos.Estado == self.constEstadosMantenimiento.Cerrada || datos.CerradoEnJDE) {
                            $("#tfComentarioCierre").val(datos.ComentarioCierre);
                        } else {
                            $("#tfComentarioCierre").prop('required', false);
                            $("#tfComentarioCierre").prop('disabled', true);
                            $("#requiredCloseCommentaryMark").remove();
                        }

                        // Edición de solicitud
                        $("#btnGestionEditar").kendoButton({
                            click: function () {
                                $("#trError").hide();
                                // Faltan campos por rellenar
                                if (!ValidarFormulario("EditarSolicitud")) {
                                    $("#trError").text(ObtenerCamposObligatorios("EditarSolicitud"));
                                    $("#trError").show();
                                    return;
                                }

                                self.ConstruirModelo(datos);

                                self.EditarSolicitud(datos);
                            }
                        });
                    }

                } else if (modo == self.constOperacionesMantenimiento.Cerrar) {
                    // ************ CERRAR

                    // Cierre de solicitud
                    $("#btnGestionCerrar").kendoButton({
                        click: function () {
                            $("#trError").hide();
                            // Faltan campos por rellenar
                            if (!ValidarFormulario("CerrarSolicitud")) {
                                $("#trError").text(ObtenerCamposObligatorios("CerrarSolicitud"));
                                $("#trError").show();
                                return;
                            }
                            datos.ComentarioCierre = $("#tfComentarioCierre").val();

                            self.CerrarSolicitud(datos);
                        }
                    });
                } else {
                    // ********** Asociar Paros

                    $("#lblParos").text(window.app.idioma.t('PAROS_PERDIDAS') + " - " + ObtenerLineaDescripcion(datos.Linea));

                    $('#gridParos').kendoGrid({
                        dataSource: self.getParosDataSource(datos.Linea, datos.Id),
                        filterable: {
                            extra: false,
                            messages: window.app.cfgKendo.configuracionFiltros_Msg,
                            operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                        },
                        scrollable: true,
                        selectable: false,
                        sortable: true,
                        pageable: {
                            refresh: false,
                            pageSizes: true,
                            pageSizes: [20, 35, 50, 'All'],
                            buttonCount: 5,
                            messages: window.app.cfgKendo.configuracionPaginado_Msg
                        },
                        resizable: false,
                        height: $("#dlgGestionSolicitud").height() - 144,
                        columns: [
                            {
                                title: "",
                                template: '<input class="checkbox" type="checkbox"  style="width: 24px;	height: 24px" />',
                                width: 45,
                                attributes: { style: "text-align: center;" },
                                hidden: true
                            },
                            {
                                hidden: true,
                                title: window.app.idioma.t("LINEA"),
                                width: 150,
                                attributes: { style: "text-align: center;" },
                                field: "IdLinea",
                                template: "#= ObtenerLineaDescripcion(IdLinea) #",
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            //handle the check-all checkbox template
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            //handle the other checkboxes
                                            return "<div><label><input type='checkbox' value='#=ObtenerLineaDescripcion(IdLinea)#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t('LINEA')#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "justificado",
                                title: window.app.idioma.t("JUSTIFICADO"),
                                width: 90,
                                attributes: { style: "text-align: center;" },
                                template: function (registro) {
                                    if (registro.justificado) return "<img src='img/check.png' width='25' height='27' alt='Justificado'/>";
                                    else return "<img src='img/redball.png' width='25' height='25' alt='Justificado'/>";
                                },
                                filterable: false
                            },
                            {
                                field: "InicioLocal",
                                title: window.app.idioma.t("HORA"),
                                format: "{0:" + kendo.culture().calendar.patterns.MES_FechaHora + "}",
                                width: 150,
                                attributes: { style: "text-align: center;" },
                                filterable: {
                                    extra: true,
                                    ui: function (element) {
                                        element.kendoDateTimePicker({
                                            format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                            culture: localStorage.getItem("idiomaSeleccionado")
                                        });
                                    }
                                }
                            },
                            {
                                field: "IdTipoTurno",
                                template: "#if(IdTipoTurno){# #: window.app.idioma.t('TURNO'+IdTipoTurno) # #}#",
                                title: window.app.idioma.t("TURNO"),
                                width: 130,
                                attributes: { style: "text-align: center;" },
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
                                field: "IdTipoParoPerdida",
                                title: window.app.idioma.t("TIPO"),
                                template: "#=TipoParoPerdida#",
                                width: 150,
                                attributes: { style: "text-align: center;" },
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            return "<div><label><input type='checkbox' value='#=IdTipoParoPerdida#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoParoPerdida#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "EquipoDescripcion",
                                title: window.app.idioma.t("LLENADORA"),
                                width: 170,
                                attributes: { style: "text-align: center;" },
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            return "<div><label><input type='checkbox' value='#=EquipoDescripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= EquipoDescripcion#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "Duracion",
                                title: window.app.idioma.t("DURACION"),
                                width: 130,
                                attributes: { style: "text-align: center;" },
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
                                field: "MotivoNombre",
                                title: window.app.idioma.t("MOTIVO"),
                                //width: 80,
                                attributes: { style: "text-align: center;" },
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            return "<div><label><input type='checkbox' value='#=MotivoNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= MotivoNombre#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "CausaNombre",
                                title: window.app.idioma.t("CAUSA"),
                                //width: 80,
                                attributes: { style: "text-align: center;" },
                                filterable: {
                                    multi: true,
                                    itemTemplate: function (e) {
                                        if (e.field == "all") {
                                            return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                        } else {
                                            return "<div><label><input type='checkbox' value='#=CausaNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= CausaNombre#</label></div>";
                                        }
                                    }
                                }
                            },
                            {
                                field: "MaquinaCausaNombre",
                                title: window.app.idioma.t("MAQUINA_RESPONSABLE"),
                                attributes: { style: "text-align: center;" },
                                filterable: false
                            },
                        ],
                        // Seleccionamos en el grid los paros que ya están asignados
                        dataBound: e => { self.SeleccionarParosAsociados() },
                    });

                    // Click de las filas para seleccionarlas
                    $('#gridParos').getKendoGrid().table.on("click", "tr", self.SelectRow);

                    // asociación de paros a solicitud
                    $("#btnGestionAsociar").kendoButton({
                        click: function () {
                            $("#trError").hide();

                            let grid = $('#gridParos').getKendoGrid();
                            let paros = new Array();

                            // Obtenemos los paros seleccionados
                            grid.table.find(".k-state-selected").each((idx, i) => {
                                paros.push(grid.dataItem(i).Id);
                            })

                            datos.paros = paros;

                            self.AsociarParos(datos);
                        }
                    });
                }

                $("#btnGestionCancelar").kendoButton({
                    click: function (e) {
                        e.preventDefault();
                        self.CancelarFormulario();
                    }
                });

            },
            CancelarFormulario: function () {
                this.ventanaGestion.close();
            },
            SelectRow: function () {
                let row = $(this)
                    , checked = row.hasClass("k-state-selected");

                if (checked) {
                    //-remove selection
                    row.removeClass("k-state-selected");
                } else {
                    //-select the row
                    row.addClass("k-state-selected");
                }
            },
            SeleccionarParosAsociados: function () {

                let grid = $("#gridParos").getKendoGrid();
                let dataSource = grid.dataSource;

                $.each(grid.items(), function (index, item) {
                    let uid = $(item).data("uid");
                    let dataItem = dataSource.getByUid(uid);

                    if (dataItem.Asociado) {
                        $(item).addClass("k-state-selected");
                    }
                });
            },
            getParosDataSource: function (lineaID, solicitudId) {

                return new kendo.data.DataSource({
                    pageSize: 20,
                    transport: {
                        read: {
                            type: "GET",
                            url: "../api/ParosPerdidasOTs/",
                            dataType: "json",
                            data: function () {
                                return {
                                    idLinea: lineaID,
                                    idSolicitud: solicitudId,
                                    fDesde: $("#dtpFechaDesde").getKendoDateTimePicker().value().toISOString(),
                                    fHasta: $("#dtpFechaHasta").getKendoDateTimePicker().value().toISOString()
                                }
                            }
                        }
                    },
                    schema: {
                        model: {
                            id: "Id",
                            fields: {
                                Id: { type: "string", editable: false, nullable: false },
                                IdTipoParoPerdida: { type: "number" },
                                TipoParoPerdida: { type: "string" },
                                IdLinea: { type: "number" },
                                NumeroLineaDescripcion: { type: "string" },
                                DescLinea: { type: "string" },
                                Turno: { type: "string" },
                                FechaTurno: { type: "date" },
                                IdTipoTurno: { type: "string" },
                                NombreTipoTurno: { type: "string" },
                                InicioLocal: { type: "date" },
                                FinLocal: { type: "date" },
                                EquipoNombre: { type: "string" },
                                EquipoDescripcion: { type: "string" },
                                EquipoConstructivoNombre: { type: "string" },
                                EquipoConstructivoId: { type: "string" },
                                MaquinaCausaId: { type: "string" },
                                MaquinaCausaNombre: { type: "string" },
                                MotivoNombre: { type: "string" },
                                CausaNombre: { type: "string" },
                                Descripcion: { type: "string" },
                                Observaciones: { type: "string" },
                                Duracion: { type: "date" },
                                DuracionSegundos: { type: "number" },
                                DuracionMenores: { type: "number" },
                                DuracionBajaVel: { type: "number" },
                                NumeroParoMenores: { type: "number" },
                                MotivoID: { type: "number" },
                                CausaID: { type: "number" },
                                EquipoId: { type: "string" },
                                Justificado: { type: "number" },
                                Asociado: { type: "bool" }
                            },
                        },
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENIENDO_PAROS_PERDIDAS_TURNO'), 4000);
                        }
                    }
                });
            },
            CrearSolicitud: function (datos) {
                let self = this;

                kendo.ui.progress($(".k-window"), true);

                $.ajax({
                    type: "POST",
                    url: "../api/crearSolicitudIntervencion",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(datos),
                    complete: function () {
                        kendo.ui.progress($(".k-window"), false)
                        self.CancelarFormulario()
                    },
                    success: function (res) {
                        self.actualizarGrid();
                        if (res.correcto)
                        {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), (window.app.idioma.t('SE_HA_GUARDADO_SOLICITUD_MANTENIMIENTO') || "").replaceAll("#ID", ""), 4000);
                        }
                        else
                        {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res.mensaje, 4000);
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_GUARDAR_SOLICITUD_MANTENIMIENTO'), 4000);
                        }
                    }
                });

            },
            EditarSolicitud: function (datos) {
                let self = this;

                kendo.ui.progress($(".k-window"), true)

                $.ajax({
                    type: "POST",
                    url: "../api/EditarSolicitudIntervencion",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(datos),
                    complete: function () {
                        kendo.ui.progress($(".k-window"), false)
                        self.CancelarFormulario()
                    },
                    success: function (res) {
                        self.actualizarGrid();
                        if (res.correcto)
                        {
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), (window.app.idioma.t('SE_HA_EDITADO_SOLICITUD_MANTENIMIENTO') || "").replaceAll("#ID", ""), 4000);
                        }
                        else
                        {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), res.mensaje, 4000);
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), (window.app.idioma.t('ERROR_EDITAR_SOLICITUD_MANTENIMIENTO') || "").replaceAll("#ID", ""), 4000);
                        }
                    }
                });
            },
            CheckValidacionArranque: async function (OT) {
                let self = this;

                return new Promise((resolve, reject) => {

                    $.ajax({
                        type: "GET",
                        url: "../api/ValidacionArranque/check/" + OT,
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (res) {
                            resolve(res);
                        },
                        error: function (er) {
                            reject(er);
                        }
                    });
                });
            },
            CerrarSolicitud: function (datos) {
                let self = this;

                kendo.ui.progress($(".k-window"), true)

                $.ajax({
                    type: "POST",
                    url: "../api/cerrarSolicitudIntervencion",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(datos),
                    complete: function () {
                        kendo.ui.progress($(".k-window"), false)
                        self.CancelarFormulario()
                    },
                    success: function (res) {
                        if (res) {
                            self.actualizarGrid();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), (window.app.idioma.t('SE_HA_CERRADO_SOLICITUD_MANTENIMIENTO') || "").replaceAll("#ID", ""), 4000);
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), (window.app.idioma.t('ERROR_CERRAR_SOLICITUD_MANTENIMIENTO') || "").replaceAll("#ID", ""), 4000);
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), (window.app.idioma.t('ERROR_CERRAR_SOLICITUD_MANTENIMIENTO') || "").replaceAll("#ID", ""), 4000);
                        }
                    }
                });

            },
            AsociarParos: function (datos) {
                let self = this;

                kendo.ui.progress($(".k-window"), true);

                $.ajax({
                    type: "POST",
                    url: "../api/AsociarParosMantenimiento/" + datos.Id + "/",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify(datos.paros),
                    complete: function () {
                        kendo.ui.progress($(".k-window"), false);
                        self.CancelarFormulario()
                    },
                    success: function (res) {

                        if (res) {
                            self.actualizarGrid();
                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), (window.app.idioma.t('SE_HAN_ASOCIADO_PAROS_MANTENIMIENTO') || "").replaceAll("#ID", datos.Id), 4000);
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), (window.app.idioma.t('ERROR_ASOCIANDO_PAROS_MANTENIMIENTO') || "").replaceAll("#ID", datos.Id), 4000);
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), (window.app.idioma.t('ERROR_ASOCIANDO_PAROS_MANTENIMIENTO') || "").replaceAll("#ID", datos.Id), 4000);
                        }
                    }
                });
            },
            actualizarGrid: function () {
                let self = this;

                self.actualiza();
            },
            render: function () {
                var self = this;

                DestruirKendoWidgets(self);
                
                $(self.el).html(self.parent.template())
                $("#center-pane").append($(self.el))
                

                $("#dtpFechaDesde").kendoDateTimePicker({
                    value: self.inicio,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#dtpFechaHasta").kendoDateTimePicker({
                    value: self.fin,
                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                var columns = [
                    { field: "Id", title: window.app.idioma.t('ID'), width: 80 }
                ];

                if (self.options.esEnvasado) {
                    columns.push(
                        {
                            field: "Linea",
                            template: "#= ObtenerLineaDescripcion(Linea) #",
                            title: window.app.idioma.t('LINEA'),
                            _excelOptions: {
                                template: "#=ObtenerLineaDescripcion( value.Linea )#"
                            },
                            width: 240,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=Linea#' style='width: 14px;height:14px;margin-right:5px;'/>#= ObtenerLineaDescripcion(Linea) #</label></div>";
                                    }
                                }
                            }
                        }
                    );
                }

                columns = columns.concat([
                    { field: "NumOT", title: window.app.idioma.t('NUM_OT'), width: 120 },
                    {
                        field: "Estado",
                        title: window.app.idioma.t('ESTADO'),
                        width: 100,
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field == "all") {
                                    //handle the check-all checkbox template
                                    return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                } else {
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=Estado#' style='width: 14px;height:14px;margin-right:5px;'/>#= Estado#</label></div>";
                                }
                            }
                        }
                    },
                    {
                        field: "EstadoDescripcion",
                        title: window.app.idioma.t('DESCRIPCION_ESTADO'),
                        width: 130,
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field == "all") {
                                    //handle the check-all checkbox template
                                    return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                } else {
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=EstadoDescripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= EstadoDescripcion #</label></div>";
                                }
                            }
                        }
                    }
                ]);

                if (self.options.esEnvasado) {
                    // Columnas Envasado
                    columns = columns.concat([
                        {
                            field: "MaquinaDescripcion",
                            title: window.app.idioma.t('MAQUINA'),
                            width: 170,
                            _excelOptions: {
                                width: "auto"
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=MaquinaDescripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= MaquinaDescripcion#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "EquipoConstructivoDescripcion",
                            title: window.app.idioma.t('EQUIPO_CONSTRUCTIVO'),
                            width: 180,
                            _excelOptions: {
                                width: "auto"
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=EquipoConstructivoDescripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= EquipoConstructivoDescripcion#</label></div>";
                                    }
                                }
                            }
                        }
                    ]);
                } else {
                    // Columnas Fabricación
                    columns = columns.concat([
                        {
                            field: "CodigoAreaFabricacion",
                            title: window.app.idioma.t('AREA'),
                            template: "#=(CodigoAreaFabricacion ? CodigoAreaFabricacion + ' - ' + NombreAreaFabricacion : '')#",
                            width: 170,
                            _excelOptions: {
                                template: "#=(value.CodigoAreaFabricacion ? value.CodigoAreaFabricacion + ' - ' + value.NombreAreaFabricacion : '')#",
                                width: "auto"
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=CodigoAreaFabricacion#' style='width: 14px;height:14px;margin-right:5px;'/>#=(CodigoAreaFabricacion ? CodigoAreaFabricacion + ' - ' + NombreAreaFabricacion : '')#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CodigoZonaFabricacion",
                            title: window.app.idioma.t('ZONA'),
                            template: "#=(CodigoZonaFabricacion ? CodigoZonaFabricacion + ' - ' + NombreZonaFabricacion : '')#",
                            width: 170,
                            _excelOptions: {
                                template: "#=(value.CodigoZonaFabricacion ? value.CodigoZonaFabricacion + ' - ' + value.NombreZonaFabricacion : '')#",
                                width: "auto"
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=CodigoZonaFabricacion#' style='width: 14px;height:14px;margin-right:5px;'/>#=(CodigoZonaFabricacion ? CodigoZonaFabricacion + ' - ' + NombreZonaFabricacion : '')#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CodigoEquipoFabricacion",
                            title: window.app.idioma.t('EQUIPO'),
                            template: "#=(CodigoEquipoFabricacion ? CodigoEquipoFabricacion + ' - ' + NombreEquipoFabricacion : '')#",
                            width: 170,
                            _excelOptions: {
                                template: "#=(value.CodigoEquipoFabricacion ? value.CodigoEquipoFabricacion + ' - ' + value.NombreEquipoFabricacion : '')#",
                                width: "auto"
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=CodigoEquipoFabricacion#' style='width: 14px;height:14px;margin-right:5px;'/>#=(CodigoEquipoFabricacion ? CodigoEquipoFabricacion + ' - ' + NombreEquipoFabricacion : '')#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CodigoGrupoConstructivoFabricacion",
                            title: window.app.idioma.t('GRUPO_CONSTRUCTIVO'),
                            template: "#=(CodigoGrupoConstructivoFabricacion ? CodigoGrupoConstructivoFabricacion + ' - ' + NombreGrupoConstructivoFabricacion : '')#",
                            width: 170,
                            _excelOptions: {
                                template: "#=(value.CodigoGrupoConstructivoFabricacion ? value.CodigoGrupoConstructivoFabricacion + ' - ' + value.NombreGrupoConstructivoFabricacion : '')#",
                                width: "auto"
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=CodigoGrupoConstructivoFabricacion#' style='width: 14px;height:14px;margin-right:5px;'/>#=(CodigoGrupoConstructivoFabricacion ? CodigoGrupoConstructivoFabricacion + ' - ' + NombreGrupoConstructivoFabricacion : '')#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CodigoRepuestoFabricacion",
                            title: window.app.idioma.t('ELEMENTO'),
                            template: "#=(CodigoRepuestoFabricacion ? CodigoRepuestoFabricacion + ' - ' + NombreRepuestoFabricacion : '')#",
                            width: 170,
                            _excelOptions: {
                                template: "#=(value.CodigoRepuestoFabricacion ? value.CodigoRepuestoFabricacion + ' - ' + value.NombreRepuestoFabricacion : '')#",
                                width: "auto"
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=CodigoRepuestoFabricacion#' style='width: 14px;height:14px;margin-right:5px;'/>#=(CodigoRepuestoFabricacion ? CodigoRepuestoFabricacion + ' - ' + NombreRepuestoFabricacion : '')#</label></div>";
                                    }
                                }
                            }
                        },
                    ]);

                }

                columns = columns.concat([
                    { field: "DescripcionTipoAveria", title: window.app.idioma.t("TIPO_AVERIA"), width: 150 },
                    { field: "DescripcionAveria", title: window.app.idioma.t('DESCRIPCION_AVERIA'), width: 200 },
                    { field: "DescripcionProblema", title: window.app.idioma.t('DESCRIPCION_PROBLEMA'), width: 200 },
                    { field: "ComentarioCierre", title: window.app.idioma.t('COMENTARIO_CIERRE'), width: 200 },
                    {
                        field: "FechaCreacion",
                        title: window.app.idioma.t('FECHA_CREACION'),
                        format: "{0:" + kendo.culture().calendar.patterns.MES_FechaHora + "}",                        
                        width: 160,
                        _excelOptions: {
                            format: "dd/mm/yy hh:mm",
                            template: "#=GetDateForExcel(value.FechaCreacion)#"
                        },
                        filterable: {
                            extra: true,
                            ui: function (element) {
                                element.kendoDateTimePicker({
                                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                    culture: localStorage.getItem("idiomaSeleccionado")
                                });
                            }
                        }
                    },
                    {
                        field: "FechaCierre",
                        title: window.app.idioma.t('FECHA_CIERRE'),
                        format: "{0:" + kendo.culture().calendar.patterns.MES_FechaHora + "}",
                        width: 160,
                        _excelOptions: {
                            format: "dd/mm/yy hh:mm",
                            template: "#=GetDateForExcel(value.FechaCierre)#"
                        },
                        filterable: {
                            extra: true,
                            ui: function (element) {
                                element.kendoDateTimePicker({
                                    format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                    culture: localStorage.getItem("idiomaSeleccionado")
                                });
                            }
                        }
                    },
                    {
                        field: "Usuario.UserName",
                        title: window.app.idioma.t('USUARIO'),
                        width: 120,
                        //template: "<span>#=Usuario.UserName#</span>",
                        filterable: {
                            multi: true,
                            itemTemplate: function (e) {
                                if (e.field == "all") {
                                    //handle the check-all checkbox template
                                    return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                } else {
                                    //handle the other checkboxes
                                    return "<div><label><input type='checkbox' value='#=Usuario.UserName#' style='width: 14px;height:14px;margin-right:5px;'/>#= Usuario.UserName#</label></div>";
                                }
                            }
                        }
                    }
                ]);

                self.grid = self.$("#gridSolicitudesOTs").kendoGrid({
                    dataSource: self.ds,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores,
                    },
                    excel: util.ui.default.gridExcelDate('SOLICITUDES_MANTENIMIENTO'),
                    sortable: true,
                    resizable: true,
                    selectable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: [100, 200, 500],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    detailTemplate: self.options.esEnvasado ? kendo.template($("#detailTemplate").html()) : null,
                    detailInit: self.options.esEnvasado ? self.detailInit : null,
                    excelExport: async function (e) {
                        e.preventDefault();
                        let self = window.app.vista;

                        let sheets = [ExcelGridExtra(e, util)];
                        sheets[0].title = util.ui.T('SOLICITUDES');

                        var index = 0;

                        let cambiosEstado = [];
                        try {
                            cambiosEstado = await self.obtenerCambiosEstado();
                        } catch {
                            e.preventDefault();
                            return;
                        }

                        let rows = [
                            {
                                type: "headers",
                                index: 0,
                                cells: [
                                    { background: '#7a7a7a', color: '#fff', value: util.ui.T("NUM_OT"), colSpan: 1, rowSpan: 1 },
                                    { background: '#7a7a7a', color: '#fff', value: util.ui.T("ESTADO"), colSpan: 1, rowSpan: 1 },
                                    { background: '#7a7a7a', color: '#fff', value: util.ui.T("DESCRIPCION_ESTADO"), colSpan: 1, rowSpan: 1 },
                                    { background: '#7a7a7a', color: '#fff', value: util.ui.T("FECHA"), colSpan: 1, rowSpan: 1 },
                                ]
                            }
                        ]

                        index = 1;
                        let lastOT = 0;
                        for (let r of cambiosEstado) {
                            if (r.OT != lastOT) {
                                // Añadimos cabecera de agrupacion
                                lastOT = r.OT;
                                rows.push({
                                    type: 'agrupator',
                                    index: index,
                                    cells: [
                                        { value: r.OT, colSpan: 4, bold: true, background: '#8DB4E2', textAlign: 'center' }
                                    ]
                                })
                                index++;
                            }
                            rows.push({
                                type: 'data',
                                index: index,
                                cells: [
                                    { value: r.OT },
                                    { value: r.Estado },
                                    { value: r.EstadoDescripcion },
                                    { value: GetDateForExcel(new Date(r.Fecha)), format: "dd/mm/yy hh:mm" },
                                ]
                            })

                            index++;
                        }

                        sheets.push({
                            title: util.ui.T('CAMBIOS_ESTADO_MANTENIMIENTO'),
                            columns: [{ width: 120 }, { width: 100 }, { width: 130 }, { width: 160 }],
                            freezePane: { colSplit: 0, rowSplit: 1 },
                            filter: { from: 0, to: 3 },
                            rows: rows
                        });

                        index = 0;
                        // Aplicar color de fondo a las filas pares
                        for (let r of sheets[1].rows) {
                            if (r.type == 'data' && index % 2 == 0) {
                                r.cells.map(c => {
                                    $.extend(c, util.ui.default.excelCellEvenRow);
                                    return c;
                                })
                            }
                            index++;
                        }

                        let workbook = new kendo.ooxml.Workbook({
                            sheets: sheets
                        });

                        kendo.saveAs({
                            dataURI: workbook.toDataURL(),
                            fileName: e.sender.options.excel.fileName
                        })
                    },
                    columns: columns,
                    dataBound: function (e) {
                        //avisamos si se han llegado al limite de 30000 registros
                        var numItems = e.sender.dataSource.total();
                        if (numItems >= 30000) {
                            //“El resultado de la consulta excede del límite de 30.000 registros, por favor, acote en el filtro de búsqueda un rango de fechas menor”.
                            Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('EXCEDE_DEL_LIMITE_REGISTROS'), 10000);
                        }
                    },
                    dataBinding: self.resizeGrid
                }).data("kendoGrid");
            },
            obtenerCambiosEstado: async function () {
                let self = this;

                return new Promise((resolve, reject) => {
                    var fIni = $("#dtpFechaDesde").getKendoDateTimePicker().value();
                    var fFin = $("#dtpFechaHasta").getKendoDateTimePicker().value();
                    if (!fIni || !fFin) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FILTROS_OBLIGATORIOS'), 4000);
                        reject();
                        return;
                    } else if (fIni > fFin) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_FECHA_FIN_MENOR_INICIO'), 4000);
                        reject();
                        return;
                    }

                    $.ajax({
                        type: "GET",
                        url: "../api/SolicitudesMantenimiento/CambiosEstado/",
                        dataType: 'json',
                        cache: false,
                        data: {
                            fInicio: fIni.toISOString(),
                            fFin: fFin.toISOString(),
                            esEnvasado: self.options.esEnvasado
                        },
                        success: function (res) {
                            resolve(res);
                        },
                        error: function (e) {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_OBTENER_CAMBIOS_ESTADO_MANTENIMIENTO'), 4000);
                            reject();
                        }
                    })
                })
            },
            detailInit: function (e) {
                var detailRow = e.detailRow;

                detailRow.find(".gridDetail").kendoGrid({
                    dataSource: {
                        transport: {
                            type: "GET",
                            read: "../api/ParosSolicitudMantenimiento/" + e.data.Id + "/",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                        },
                        schema: {
                            model: {
                                id: "Id",
                                fields: {
                                    Id: { type: "string", editable: false, nullable: false },
                                    IdTipoParoPerdida: { type: "number" },
                                    TipoParoPerdida: { type: "string" },
                                    IdLinea: { type: "number" },
                                    NumeroLineaDescripcion: { type: "string" },
                                    DescLinea: { type: "string" },
                                    Turno: { type: "string" },
                                    FechaTurno: { type: "date" },
                                    IdTipoTurno: { type: "string" },
                                    NombreTipoTurno: { type: "string" },
                                    InicioLocal: { type: "date" },
                                    FinLocal: { type: "date" },
                                    EquipoNombre: { type: "string" },
                                    EquipoDescripcion: { type: "string" },
                                    EquipoConstructivoNombre: { type: "string" },
                                    EquipoConstructivoId: { type: "string" },
                                    MaquinaCausaId: { type: "string" },
                                    MaquinaCausaNombre: { type: "string" },
                                    MotivoNombre: { type: "string" },
                                    CausaNombre: { type: "string" },
                                    Descripcion: { type: "string" },
                                    Observaciones: { type: "string" },
                                    Duracion: { type: "date" },
                                    DuracionSegundos: { type: "number" },
                                    DuracionMenores: { type: "number" },
                                    DuracionBajaVel: { type: "number" },
                                    NumeroParoMenores: { type: "number" },
                                    MotivoID: { type: "number" },
                                    CausaID: { type: "number" },
                                    EquipoId: { type: "string" },
                                    Justificado: { type: "number" }
                                },
                            },
                        },
                    },
                    scrollable: true,
                    sortable: true,
                    pageable: false,
                    dataBinding: function (e) { $(".gridDetail .k-grid-content").css("min-height", "0px"); },
                    columns: [
                        {
                            title: "",
                            template: '<input class="checkbox" type="checkbox"  style="width: 24px;	height: 24px" />',
                            width: 45,
                            attributes: { style: "text-align: center;" },
                            hidden: true
                        },
                        {
                            hidden: true,
                            title: window.app.idioma.t("LINEA"),
                            width: 150,
                            attributes: { style: "text-align: center;" },
                            field: "IdLinea",
                            template: "#= ObtenerLineaDescripcion(IdLinea) #",
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        //handle the check-all checkbox template
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        //handle the other checkboxes
                                        return "<div><label><input type='checkbox' value='#=ObtenerLineaDescripcion(IdLinea)#' style='width: 14px;height:14px;margin-right:5px;'/>#= window.app.idioma.t('LINEA')#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "justificado",
                            title: window.app.idioma.t("JUSTIFICADO"),
                            width: 90,
                            attributes: { style: "text-align: center;" },
                            template: function (registro) {
                                if (registro.justificado) return "<img src='img/check.png' width='25' height='27' alt='Justificado'/>";
                                else return "<img src='img/redball.png' width='25' height='25' alt='Justificado'/>";
                            },
                            filterable: false
                        },
                        {
                            field: "InicioLocal",
                            title: window.app.idioma.t("HORA"),
                            format: "{0:" + kendo.culture().calendar.patterns.MES_FechaHora + "}",
                            width: 150,
                            attributes: { style: "text-align: center;" },
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            field: "IdTipoTurno",
                            template: "#if(IdTipoTurno){# #: window.app.idioma.t('TURNO'+IdTipoTurno) # #}#",
                            title: window.app.idioma.t("TURNO"),
                            width: 130,
                            attributes: { style: "text-align: center;" },
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
                            field: "IdTipoParoPerdida",
                            title: window.app.idioma.t("TIPO"),
                            template: "#=TipoParoPerdida#",
                            width: 150,
                            attributes: { style: "text-align: center;" },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdTipoParoPerdida#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoParoPerdida#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "EquipoDescripcion",
                            title: window.app.idioma.t("LLENADORA"),
                            width: 170,
                            attributes: { style: "text-align: center;" },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=EquipoDescripcion#' style='width: 14px;height:14px;margin-right:5px;'/>#= EquipoDescripcion#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "Duracion",
                            title: window.app.idioma.t("DURACION"),
                            width: 130,
                            attributes: { style: "text-align: center;" },
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
                            field: "MotivoNombre",
                            title: window.app.idioma.t("MOTIVO"),
                            //width: 80,
                            attributes: { style: "text-align: center;" },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=MotivoNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= MotivoNombre#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "CausaNombre",
                            title: window.app.idioma.t("CAUSA"),
                            //width: 80,
                            attributes: { style: "text-align: center;" },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=CausaNombre#' style='width: 14px;height:14px;margin-right:5px;'/>#= CausaNombre#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            field: "MaquinaCausaNombre",
                            title: window.app.idioma.t("MAQUINA_RESPONSABLE"),
                            attributes: { style: "text-align: center;" },
                            filterable: false
                        }
                    ]
                });
            },
            CargarTag: function (tag) {
                var self = this;

                if (!tag) {
                    return;
                }

                kendo.ui.progress($("#dlgGestionSolicitud"), true);

                $.ajax({
                    url: "../api/Mantenimiento/CargarTAGFabricacion?tag=" + tag,
                    dataType: "json",
                    cache: false,
                    success: function (response) {

                        var w = $("#cmbArea").getKendoDropDownList();
                        self.TagBuscado = response;
                        w.value(response.IdArea);
                        w.trigger("change");                       
                    },
                    error: function (er) {
                        kendo.ui.progress($("#dlgGestionSolicitud"), false);
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_CARGAR_TAG'), 1500);
                    }
                })
            },
            eliminar: function () {
                this.remove();
            },
            resizeGrid: function () {

                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosdivFiltrosHeader = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridSolicitudesOTs"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - filtrosdivFiltrosHeader - 2);
            }
        });

        return VistaSolicitudesOts;
    });