define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/RelevoTurnoOficiales.html', 'compartido/notificaciones', 'compartido/utils',
        "jszip", 'definiciones'],
    function (_, Backbone, $, plantillaRelevoTurnoOficiales, Not, Utils, JSZip, definiciones) {
        var gridRelevoTurnoOficiales = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',            
            inicio: null,
            fin: null,
            dsRelevos: null,
            numLinea: null,
            linea: null,
            tiposTurno: null,
            esInicio: true,
            template: _.template(plantillaRelevoTurnoOficiales),

            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                kendo.culture(localStorage.getItem("idiomaSeleccionado"));

                // Usar promesas para cargar datos
                var promesas = [
                    self.cargarTiposTurno(),  
                    self.inicializarGrid()     
                ];

                // Cuando ambas promesas se resuelvan, renderizamos
                Promise.all(promesas)
                    .then(function () {
                        self.cargarGrid(); 
                        self.render();
                        self.esInicio = false;
                    })
                    .catch(function (error) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CARGAR_DATOS'), 4000);
                    });
            },
            cargarTiposTurno: function () {
                var self = this;

                return new Promise(function (resolve, reject) {
                    $.ajax({
                        type: "GET",
                        url: "../api/tiposTurnosFabrica/",
                        dataType: 'json',
                        cache: true
                    }).done(function (data) {
                        self.tiposTurno = data.filter(function (item) {
                            return item.id > 0 && item.id <= 3;
                        });
                        resolve();  
                    }).fail(function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_TIPOS_TURNO'), 4000);
                        }
                        reject(e);  
                    });
                });
            },
            inicializarGrid: function () {
                var self = this;

                return new Promise(function (resolve, reject) {

                    self.dsRelevos = new kendo.data.DataSource({
                        transport: {
                            read: function (operation) {
                                if (self.esInicio) { 
                                    operation.success([]);
                                    return;
                                }

                                let datos = {
                                    idLinea: self.linea,
                                    idZona: '',
                                    fechaDesde: self.inicio.toISOString(),
                                    fechaHasta: self.fin.toISOString(),
                                };

                                $.ajax({
                                    type: "GET",
                                    url: "../api/ObtenerRelevosTurnosOficiales",
                                    dataType: 'json',
                                    data: datos,
                                    contentType: "application/json; charset=utf-8",
                                    success: function (response) {
                                        const enrichedData = response.map(item => {
                                            const linea = window.app.planta.lineas.find(linea => linea.id === item.IdLinea);
                                            const zona = linea.zonas.find(z => z.id === item.IdZona);
                                            const tipoTurno = self.tiposTurno.find(t => t.id == item.IdTipoTurno);
                                            return {
                                                ...item,
                                                NumeroLinea: linea ? linea.numLineaDescripcion : "",
                                                DescripcionLinea: linea ? linea.descripcion : "",
                                                DescripcionZona: zona ? zona.descripcion : "",
                                                TipoTurno: tipoTurno ? tipoTurno.nombre : ""
                                            };
                                        });
                                        operation.success(enrichedData);
                                    },
                                    error: function (e) {
                                        if (e.status === 403 && e.responseJSON === 'NotAuthorized') {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                        } else {
                                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER_RELEVO'), 4000);
                                        }
                                        reject(e); 
                                    }
                                });
                            }
                        },
                        schema: {
                            model: {
                                id: "Id",
                                fields: {
                                    'IdLinea': { type: "string" },
                                    'NumeroLinea': { type: "int" },
                                    'DescripcionLinea': { type: "string" },
                                    'IdZona': { type: "string" },
                                    'DescripcionZona': { type: "string" },
                                    'FechaTurno': { type: "string" },
                                    'IdTipoTurno': { type: "string" },
                                    'TipoTurno': { type: "string" },
                                    'IdTurno': { type: "string" },
                                    'IdConsolidadoTurno': { type: "string" },
                                    'Notas': { type: "string" },
                                    'Oficial': { type: "string" },
                                }
                            }
                        },
                        pageSize: 200,
                    });

                    resolve();  
                });
            },
            cargarGrid: function () {
                var self = this;

                $("#gridRelevoTurnoOficiales").kendoGrid({
                    dataSource: self.dsRelevos,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    sortable: true,
                    toolbarColumnMenu: true,
                    scrollable: true,
                    selectable: true,
                    pageable: {
                        refresh: true,
                        pageSizes: true,
                        pageSizes: [500, 1000, 5000, 'All'],
                        buttonCount: 5,
                        messages: window.app.cfgKendo.configuracionPaginado_Msg
                    },
                    noRecords: {
                        template: window.app.idioma.t("SIN_RESULTADOS")
                    },
                    resizable: true,
                    filterable: {
                        extra: false,
                        messages: window.app.cfgKendo.configuracionFiltros_Msg,
                        operators: window.app.cfgKendo.configuracionFiltros_Operadores
                    },
                    selectable: "row",
                    change: function (e) {
                        e.preventDefault();
                        var grid = $("#gridRelevoTurnoOficiales").data("kendoGrid");
                        var selectedItem = grid.dataItem(grid.select());
                        if (selectedItem != null) {
                            self.notasRelevoModal(self, selectedItem);
                        }
                    },
                    columns: [
                        {
                            groupable: true,
                            title: window.app.idioma.t("LINEA"),
                            field: 'IdLinea',
                            template: window.app.idioma.t("LINEA") + ' #:NumeroLinea# - #:DescripcionLinea#', width: 120,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=IdLinea#' style='width: 14px;height:14px;margin-right:5px;'/>" + window.app.idioma.t('LINEA') + " #= NumeroLinea# - #= DescripcionLinea#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            width: 40,
                            hidden: true,
                            title: 'IdZona',
                            field: 'IdZona'                            
                        },
                        {
                            groupable: true,
                            title: window.app.idioma.t("ZONA"),
                            field: 'DescripcionZona',
                            template: '#:DescripcionZona#', width: 80,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=DescripcionZona#' style='width: 14px;height:14px;margin-right:5px;'/>#= DescripcionZona#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            title: window.app.idioma.t("FECHA"),
                            field: 'FechaTurno',
                            width: 60,
                            template: '#= FechaTurno != null ? kendo.toString(new Date(FechaTurno), "dd/MM/yyyy") : "" #',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                ui: function (element) {
                                    element.kendoDatePicker({
                                        format: "dd/MM/yyyy",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            }
                        },
                        {
                            width: 40,
                            hidden: true,
                            title: 'IdTipoTurno',
                            field: 'IdTipoTurno'
                        },
                        {
                            groupable: true,
                            title: window.app.idioma.t("TIPO_TURNO"),
                            field: 'TipoTurno',
                            template: '#:TipoTurno#', width: 40,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=TipoTurno#' style='width: 14px;height:14px;margin-right:5px;'/>#= TipoTurno#</label></div>";
                                    }
                                }
                            }
                        },
                        {
                            width: 50,
                            groupable: true,
                            title: 'IdTurno',
                            field: 'IdTurno',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    return e.field == "all" ?
                                        "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>" :
                                        "<div><label><input type='checkbox' value='#=IdTurno#' style='width: 14px;height:14px;margin-right:5px;'/>#= IdTurno#</label></div>";
                                }
                            }
                        },
                        {
                            width: 300,
                            groupable: false,
                            title: window.app.idioma.t("NOTAS"),
                            field: 'Notas',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: true
                        },
                        {
                            width: 100,
                            groupable: true,
                            title: window.app.idioma.t("EMPLEADO"),
                            field: 'Oficial',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            filterable: true
                        }
                    ]
                });

            },
            cargarCabecera: function () {
                var self = this;

                self.$("#selectLinea").kendoDropDownList({
                    dataTextField: "id",
                    dataValueField: "numLinea",
                    valueTemplate: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    template: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                    //value: self.numLinea,
                    dataSource: new kendo.data.DataSource({
                        data: window.app.planta.lineas,
                        sort: { field: "numLinea", dir: "asc" }
                    }),
                    optionLabel: window.app.idioma.t('SELECCIONE')
                });

                if (!self.inicio) { self.inicio = new Date(); self.inicio.setHours(0, 0, 0, 0);}
                if (!self.fin) { self.fin = new Date();self.fin.setHours(23, 59, 59, 999);}

                $("#dtpFechaDesde").kendoDatePicker({
                    value: self.inicio,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado")
                });

                $("#dtpFechaHasta").kendoDatePicker({
                    value: self.fin,
                    format: kendo.culture().calendars.standard.patterns.MES_Fecha,
                    culture: localStorage.getItem("idiomaSeleccionado"),
                });
            },
            render: function () {
                var self = this;

                $(self.el).html(self.template());
                $("#center-pane").append($(self.el));

                kendo.ui.progress($("#gridRelevoTurnoOficiales"), true);
                self.cargarCabecera();
                self.cargarGrid();
                self.resizeGrid();
                kendo.ui.progress($("#gridRelevoTurnoOficiales"), false);
            },

            events: {
                'click #btnFiltrar': 'actualiza',
            },

            notasRelevoModal: function (self, dataItem) {

                let tmplt = $("#notasRelevoTemplate").html();

                let data = {
                    Notas: dataItem.Notas || '',
                    Oficial: dataItem.Oficial || '',
                    IdConsolidadoTurno: dataItem.IdConsolidadoTurno,
                    IdLinea: dataItem.IdLinea,
                    IdZona: dataItem.IdZona,
                    InicioTurno: dataItem.InicioTurno,
                    IdTipoTurno: dataItem.IdTipoTurno
                }

                let ventana = $("<div id='window-lanzar'/>").kendoWindow({
                    title: window.app.idioma.t("NOTAS"),
                    close: function () {
                        kendoWindow.destroy();
                    },
                    resizable: false,
                    modal: true
                })

                let kendoWindow = ventana.getKendoWindow();

                let template = kendo.template(tmplt);
                kendoWindow
                    .content(template(data));
                kendo.init(ventana);

                // Configuramos los botones
                $("#btnCancelarNotas").click(async (e) => {
                    kendoWindow.close();                    
                })

                $("#btnGuardarNotas").click(async (e) => {
                    data.Notas = document.getElementById('inpt_notas').value;
                    data.Oficial = document.getElementById('inpt_oficial').value;
                    if (!data.Notas) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FORMULARIO_CAMPO_OBLIGATORIO').replace("#CAMPO", window.app.idioma.t('NOTAS')), 4000);
                        return; 
                    }
                    if (!data.Oficial) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('FORMULARIO_CAMPO_OBLIGATORIO').replace("#CAMPO", window.app.idioma.t('EMPLEADO')), 4000);
                        return;
                    }

                    kendoWindow.close();

                    await self.actualizarRelevoTurnoOficiales(self, data);

                    if (data.IdTurno == 0) {
                        await self.activarRelevoTurnoOficiales(self, data);
                    }

                    self.dsRelevos.read();
                })

                kendoWindow.center().open();

            },
            actualizarRelevoTurnoOficiales: async function (self, datos) {
                kendo.ui.progress($("#panelDatos"), true);

                return new Promise((resolve, reject) => {

                    $.ajax({
                        type: "PUT",
                        url: `../api/ActualizarRelevoTurnoOficiales/`,
                        data: JSON.stringify(datos),
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        success: function (data) {
                            kendo.ui.progress($("#panelDatos"), false);
                            resolve(data);
                            if (data == "") {
                                Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('ACTUALIZANDO_OK'), 4000);
                            }
                            else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ACTUALIZAR_RELEVO'), 4000);
                            }
                        },
                        error: function (e) {
                            kendo.ui.progress($("#panelDatos"), false);
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ACTUALIZAR_RELEVO'), 4000);
                            }
                            reject(null);
                        }
                    })
                });
            },
            activarRelevoTurnoOficiales: async function (self, datos) {

                kendo.ui.progress($("#panelDatos"), true);

                return new Promise((resolve, reject) => {

                    $.ajax({
                        type: "PUT",
                        url: `../api/ActivarRelevoTurnoOficiales/`,
                        data: JSON.stringify(datos),
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        success: function (data) {
                            kendo.ui.progress($("#panelDatos"), false);
                            resolve(data);

                            if (data) {
                                self.turnoActualRelevo.IdTurno = 1;
                                self.mostrarDatosRelevo();
                            }
                            else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ACTIVAR_RELEVO'), 4000);
                            }
                        },
                        error: function (e) {
                            kendo.ui.progress($("#panelDatos"), false);
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_ACTIVAR_RELEVO'), 4000);
                            }
                            reject(null);
                        }
                    })
                });
            },
            actualiza: function () {
                var self = this;

                //if ($("#selectLinea").val() == '') {
                //    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_SELECCIONE_LINEA'), 3000);
                //    return;
                //}

                self.numLinea = $("#selectLinea").val();
                self.inicio = $("#dtpFechaDesde").data("kendoDatePicker").value();
                self.fin = $("#dtpFechaHasta").data("kendoDatePicker").value();

                if (!self.inicio || !self.fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('LAS_FECHAS_INTRODUCIDAS'), 3000);
                    return;
                }

                if (self.inicio > self.fin) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('_LA_FECHA'), 3000);
                    return;
                }

                self.linea = "";
                if (self.numLinea != null && self.numLinea != '') {
                    self.linea = $.grep(window.app.planta.lineas, function (linea, i) {
                        return linea.numLinea == self.numLinea;
                    })[0].id;
                }

                if (self.dsRelevos.page() != 1) {
                    self.dsRelevos.page(1);
                }
                self.dsRelevos.read();               
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridRelevoTurnoOficiales"),
                    dataArea = gridElement.find(".k-grid-content:first"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });
                dataArea.height(contenedorHeight - cabeceraHeight - filtrosHeight - 100);
            },
            eliminar: function () {
                this.remove();
            },
        });

        return gridRelevoTurnoOficiales;    
    });