define(['underscore', 'backbone', 'jquery', 'text!../../../Envasado/html/DevolucionesMMPPSmile.html', 'compartido/notificaciones', 'compartido/util',
    'vistas/vDialogoConfirm', 'jszip', 'definiciones'],
    function (_, Backbone, $, plantillaDevolucionesMMPPSmile, Not, util, VistaDlgConfirm, JSZip, definiciones) {
        var gridDevolucionesMMPPSmile = Backbone.View.extend({
            tagName: 'div',
            id: 'divHTMLContenido',
            dsStock: null,
            dsUbiCons: null,
            lineaSel: "",
            TodasUbicacionesLinea: null,
            prioridad: "",
            esInicio: true,
            template: _.template(plantillaDevolucionesMMPPSmile),

            initialize: function () {
                var self = this;
                window.JSZip = JSZip;

                kendo.culture(localStorage.getItem("idiomaSeleccionado"));

                // Usar promesas para cargar datos
                var promesas = [
                    self.render(),
                    self.cargarComboLinea(),
                    self.obtenerPrioridad('MES_MSM', 'PRIO_SMILE_DEVOL_PORTAL'),
                    self.inicializarGrid(),
                ];

                // Cuando ambas promesas se resuelvan, renderizamos
                Promise.all(promesas)
                    .then(function () {
                        self.cargarGrid();                        
                        self.esInicio = false;
                    })
                    .catch(function (error) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CARGAR_DATOS'), 4000);
                    });
            },
            obtenerPrioridad: function (bbdd, clave) {
                var self = this;

                return new Promise(function (resolve, reject) {
                    $.ajax({
                        type: "GET",
                        url: "../api/general/ObtenerValorParametroGeneral?bbdd=" + bbdd + "&clave=" + clave,
                        dataType: 'json'
                    }).done(function (data) {
                        self.prioridad = data;
                        resolve();
                    }).fail(function (e) {
                        Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'api/general/ObtenerValorParametroGeneral', 4000);
                        reject();
                    });
                });
            },
            inicializarGrid: function () {
                var self = this;

                return new Promise(function (resolve, reject) {

                    self.dsStock = new kendo.data.DataSource({
                        transport: {
                            read: function (operation) {

                                if (self.esInicio) {
                                    operation.success([]);
                                    resolve();
                                    return;
                                }

                                $.ajax({
                                    url: "../api/ObtenerStock",
                                    dataType: "json",
                                    contentType: "application/json; charset=utf-8",
                                    type: "GET",
                                    complete: function (e) {
                                        kendo.ui.progress($("#gridDevolucionesMMPPSmile"), false);
                                    },
                                    success: function (response) {
                                        if (!response || response.length === 0) {
                                            operation.success([]);
                                        } else {                                            
                                            // Filtrar response para excluir los elementos que estan en ubicacion de consumo, y los que pertenezcan a la Linea seleccionada
                                            const filteredData = response.filter(item =>
                                                self.TodasUbicacionesLinea.some(u => u.IdUbicacion == item.UBICACION_ORIGEN) &&   //Vemos si son de ubicacion de la Linea seleccionada                                              
                                                item.TIPO_UBICACION !== "Consumo" &&                // No es de tipo "Consumo"
                                                item.CANTIDAD_ACTUAL > 0                            // Cantidad actual > 0
                                            );

                                            // Enriquecer datos si es necesario
                                            const enrichedData = filteredData.map(item => ({
                                                ...item,
                                                // UdPedidas: item.UnidadesSolicitadas * udPaletsStock,
                                            }));

                                            operation.success(enrichedData);
                                        }
                                        
                                        resolve();
                                    },
                                    error: function (e) {
                                        if (e.status === 403 && e.responseJSON === 'NotAuthorized') {
                                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                                        } else {
                                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_AL_OBTENER') + ' ' + window.app.idioma.t('LOTES_MMPP'), 4000);
                                        }
                                        
                                        reject(e);
                                    }
                                });
                            }
                        },
                        schema: {
                            model: {
                                id: "LoteMES",
                                fields: {
                                    'DESCRIPCION_UBICACION': { type: "string" },
                                    'UBICACION': { type: "string" },
                                    'UBICACION_ORIGEN': { type: "number" },
                                    'CLASE_MATERIAL': { type: "string" },
                                    'REFERENCIA_MES': { type: "string" },
                                    'MATERIAL': { type: "string" },
                                    'TIPO_MATERIAL': { type: "string" },
                                    'LOTE_MES': { type: "string" },
                                    'LOTE_PROVEEDOR': { type: "string" },
                                    'PROVEEDOR': { type: "string" },
                                    'ID_PROVEEDOR': { type: "number" },
                                    'CANTIDAD_INICIAL': { type: "number" },
                                    'CANTIDAD_ACTUAL': { type: "number" },                                    
                                    'FECHA_ENTRADA_UBICACION': { type: "date" },
                                    'FECHA_INICIO_CONSUMO': { type: "date" },
                                    'FECHA_FIN_CONSUMO': { type: "date" },
                                    'SSCC': { type: "string" },
                                    'EAN': { type: "string" }
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

                this.$("#gridDevolucionesMMPPSmile").kendoGrid({
                    dataSource: self.dsStock,
                    groupable: { messages: { empty: window.app.idioma.t('ARRASTRAR_COLUMNA') } },
                    sortable: true,
                    toolbarColumnMenu: true,
                    scrollable: true,
                    autoWidth: true,
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
                    dataBinding: self.resizeGrid,
                    columns: [
                        {
                            template: '<input class="checkbox" type="checkbox" style="width: 14px;	height: 14px;" />',
                            width: 35
                        },
                        {
                            title: window.app.idioma.t("ZONA"),
                            field: 'UBICACION_CON_DESCRIPTIVO',
                            width: 380,
                            filterable: true,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            hidden: true,
                            title: window.app.idioma.t("TIPO_UBICACION"),
                            field: 'TIPO_UBICACION',
                            width: 200,
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=TIPO_UBICACION#' style='width: 14px;height:14px;margin-right:5px;'/>#= TIPO_UBICACION#</label></div>";
                                    }
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            width: 150,
                            title: window.app.idioma.t("CLASE_MATERIAL"),
                            field: 'CLASE_MATERIAL',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=CLASE_MATERIAL#' style='width: 14px;height:14px;margin-right:5px;'/>#= CLASE_MATERIAL#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            width: 100,
                            title: "IdMaterial",
                            field: 'REFERENCIA_MES',
                            filterable: {
                                multi: true,
                                itemTemplate: function (e) {
                                    if (e.field == "all") {
                                        return "<div><label><strong><input type='checkbox' style='width:14px; height:14px; margin-right:5px;' />#= all#</strong></label></div>";
                                    } else {
                                        return "<div><label><input type='checkbox' value='#=REFERENCIA_MES#' style='width: 14px;height:14px;margin-right:5px;'/>#= REFERENCIA_MES#</label></div>";
                                    }
                                }
                            },

                        },
                        {
                            title: window.app.idioma.t("DESCRIPCION"),
                            field: 'MATERIAL',
                            width: 300,
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
                                        return "<div><label><input type='checkbox' value='#=MATERIAL#' style='width: 14px;height:14px;margin-right:5px;'/>#= MATERIAL#</label></div>";
                                    }
                                }
                            },
                        },
                        {
                            title: window.app.idioma.t("LOTE_MES"),
                            field: 'LOTE_MES',
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            width: 350,
                        },
                        {
                            title: window.app.idioma.t("LOTE_PROVEEDOR"),
                            field: 'LOTE_PROVEEDOR',
                            width: 150,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            hidden: true,
                            title: window.app.idioma.t("ID_PROVEEDOR"),
                            field: 'ID_PROVEEDOR',
                            width: 1,
                        },
                        {
                            template: "#=ID_PROVEEDOR != null ?ID_PROVEEDOR: ''#  #=PROVEEDOR != null? PROVEEDOR: ''#",
                            title: window.app.idioma.t("PROVEEDOR"),
                            field: 'ID_PROVEEDOR',
                            width: 400,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_INICIAL"),
                            field: 'CANTIDAD_INICIAL',
                            width: 150,
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            template: '#= kendo.format("{0:n0}",CANTIDAD_INICIAL)#',
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n0}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n0}',sum) #"
                        },
                        {
                            title: window.app.idioma.t("CANTIDAD_ACTUAL"),
                            field: 'CANTIDAD_ACTUAL',
                            width: 150,
                            template: '#= kendo.format("{0:n0}",CANTIDAD_ACTUAL)#',
                            aggregates: ["sum"],
                            filterable: {
                                ui: function (element) {
                                    element.kendoNumericTextBox({
                                        format: "{0:n0}",
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    })
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                            groupFooterTemplate: window.app.idioma.t("TOTAL") + ": #= kendo.format('{0:n0}',sum) #"
                        },                        
                        {
                            title: window.app.idioma.t("FECHA_ENTRADA_UBICACION"),
                            field: 'FECHA_ENTRADA_UBICACION',
                            width: 200,
                            template: '#= FECHA_ENTRADA_UBICACION != null ? kendo.toString(new Date(FECHA_ENTRADA_UBICACION), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("FECHA_INICIO_CONSUMO"),
                            field: 'FECHA_INICIO_CONSUMO',
                            width: 200,
                            template: '#= FECHA_INICIO_CONSUMO != null ? kendo.toString(new Date(FECHA_INICIO_CONSUMO), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },
                        {
                            title: window.app.idioma.t("FECHA_FIN_CONSUMO"),
                            field: 'FECHA_FIN_CONSUMO',
                            width: 200,
                            template: '#= FECHA_FIN_CONSUMO != null ? kendo.toString(new Date(FECHA_FIN_CONSUMO), kendo.culture().calendars.standard.patterns.MES_FechaHora  ) : "" #',
                            filterable: {
                                extra: true,
                                ui: function (element) {
                                    element.kendoDateTimePicker({
                                        format: kendo.culture().calendars.standard.patterns.MES_FechaHora,
                                        culture: localStorage.getItem("idiomaSeleccionado")
                                    });
                                }
                            },
                            attributes: {
                                style: 'white-space: nowrap ',
                                class: 'addTooltip'
                            },
                        },                        
                    ],

                });

            },
            cargarComboLinea: function () {
                var self = this;

                return new Promise((resolve, reject) => {
                    try {
                        self.$("#selectLinea").kendoDropDownList({
                            dataTextField: "id",
                            dataValueField: "numLinea",
                            valueTemplate: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                            template: window.app.idioma.t('LINEA') + " #=  numLineaDescripcion # - #=descripcion #",
                            dataSource: new kendo.data.DataSource({
                                data: window.app.planta.lineas,
                                sort: { field: "numLinea", dir: "asc" }
                            }),
                            optionLabel: window.app.idioma.t('SELECCIONE'),
                            change: function (e) {
                                var dropdownlist = this;
                                var selectedLinea = dropdownlist.dataItem(dropdownlist.select());

                                if (selectedLinea.id !== window.app.idioma.t('SELECCIONE')) {
                                    self.lineaSel = selectedLinea;
                                    self.obtenerUbicacionesLinea(selectedLinea.numLinea);
                                    self.consulta();
                                }
                            },
                            dataBound: function () {
                                resolve(); 
                            }
                        });
                    } catch (error) {
                        reject(error); 
                    }
                });
            },
            obtenerUbicacionesLinea: function (idLinea) {
                var self = this;
                $.ajax({
                    url: "../api/ObtenerUbicacionesPorLinea?Linea=" + idLinea,
                    async: false,
                    success: function (res) {
                        self.obtenerZonaLinea(res[0].IdUbicacion);
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            obtenerZonaLinea: function (idUbicacion) {
                var self = this;
                $.ajax({
                    url: "../api/GetDatosUbicacion/" + idUbicacion,
                    async: false,
                    success: function (res) {
                        //Buscamos ubicaciones filtrando por zona de la linea seleccionada
                        self.obtenerUbicacionesConsumoYAlmacenamiento(res.Zona[0].IdZona);
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            obtenerUbicacionesConsumoYAlmacenamiento: function (idZonaLinea) {
                var self = this;
                $.ajax({
                    url: "../api/ObtenerUbicacionesDesdezona/" + idZonaLinea,
                    async: false,
                    success: function (res) {
                        //Obtenemos tanto las ubicaciones de consumo como las de alamacenamiento de la linea
                        self.TodasUbicacionesLinea = res;
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            render: function () {
                var self = this;

                $(self.el).html(self.template());
                $("#center-pane").append($(self.el));
            },

            events: {
                'click #btnFiltrar': 'consulta',
                'click #btnDevolucionMMPP': 'confirmarDevoluciones',
            },
            consulta: function () {
                var self = this;

                if (self.lineaSel.id == "") {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('SELECCIONAR') + ' ' + window.app.idioma.t('LINEA'), 3000);
                    return;
                }

                if (self.dsStock.page() != 1) {
                    self.dsStock.page(1);
                }

                self.actualizarGrid();
            },
            actualizarGrid: function () {
                let self = this;
                self.dsStock.data([]);

                kendo.ui.progress($("#gridDevolucionesMMPPSmile"), true);
                self.dsStock.read();                
            },
            obtenerRegistroTablaMaestro: async function (material) {
                const self = this;
                try {
                    const response = await $.ajax({
                        type: "GET",
                        url: "../api/ObtenerDatosMaestroClaseSubClaseMMPPUbicacionMaterial?idLinea=" + self.lineaSel.id + "&idMaterial=" + material,
                        dataType: 'json'
                    });
                    return response;
                } catch (e) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'api/general/ObtenerDatosMaestroClaseSubClaseMMPPUbicacionMaterial', 4000);
                    return null;
                }
            },
            confirmarDevoluciones: async function (e) {
                e.preventDefault();
                var self = this;

                // Verificar si tiene permiso
                var permiso = TienePermiso(400);
                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                // Obtener el grid
                var grid = $("#gridDevolucionesMMPPSmile").data("kendoGrid");

                // Filtrar las filas seleccionadas
                var selectedRows = grid.tbody.find('input:checked').closest('tr');
                if (selectedRows.length === 0) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), 'SELECCIONAR FILAS', 4000);
                    return;
                }

                // Obtener los datos de las filas seleccionadas
                var dataSource = selectedRows.map(function () {
                    var dataItem = grid.dataItem(this);
                    return {
                        Lote: dataItem.LOTE_MES,
                        IdMaterial: dataItem.REFERENCIA_MES,
                        ClaseMaterial: dataItem.CLASE_MATERIAL,
                        CantidadActual: dataItem.CANTIDAD_ACTUAL,
                        Ubicacion: dataItem.UBICACION,
                        IdUbicacion: dataItem.UBICACION_ORIGEN,
                        Proveedor: dataItem.PROVEEDOR,
                        IdProveedor: dataItem.ID_PROVEEDOR
                    };
                }).get();

                // Validar que cada material esté configurado en la tabla maestra
                for (let item of dataSource) {
                    var aux = await self.obtenerRegistroTablaMaestro(item.IdMaterial);
                    if (!aux || aux.length === 0) {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('MATERIAL_NOCONFIGURADO_TABLA').replace('$IdMaterial', item.IdMaterial).replace('$ClaseMaterial', item.ClaseMaterial), 6000);
                        return;
                    }
                }

                // Verificar solicitudes vigentes antes de abrir el diálogo
                for (let item of dataSource) {
                    let sscc = self.obtenerSSCC(item.Lote);

                    if (sscc && sscc !== "") {
                        let solicitudes = await $.ajax({
                            url: "../api/ObtenerPeticionesMMPPSmilePorParametros?idSolicitud=0&SSCC=" + sscc + "&idLinea=&idMaterial=",
                            type: "GET"
                        });

                        if (solicitudes && solicitudes.length > 0) {
                            // Filtrar solicitudes con IdEstadoSolicitud < 4 (estados petición devolución vigente)
                            let solicitudesVigentes = solicitudes.filter(s => s.IdEstadoSolicitud < 4 && s.IdTipoSolicitud === 2);

                            if (solicitudesVigentes.length > 0) {
                                Not.crearNotificacion('warning','Aviso',window.app.idioma.t('DEVOLUCION_VIGENTE').replace('$lote', item.Lote).replace('$sscc', sscc),6000);
                                return; // Cancela la devolución, no abre el diálogo
                            }
                        }
                    }
                }

                // Generar el HTML para los items
                var itemsHtml = dataSource.map(function (item) {
                    return `
                     <li style="background: #f9f9f9; padding: 10px 12px; margin-bottom: 5px;
                                border-radius: 5px; border-left: 5px solid #007bff; word-wrap: break-word;">
                        <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
                            Lote: ${item.Lote}
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 14px; white-space: nowrap;">
                                ${item.Ubicacion}
                            </span>
                            <span style="font-size: 14px; flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                                / Mat: ${item.IdMaterial} - ${item.ClaseMaterial}
                            </span>
                            <span style="font-size: 14px; font-weight: bold; white-space: nowrap; margin-left: 40px;">
                                ${window.app.idioma.t('CANTIDAD')}: ${item.CantidadActual}
                            </span>
                        </div>
                    </li>
                    `;
                }).join('');

                let tmplt = Array.from($(self.template())).find(e => e.id == 'EnviarDevolucionesTemplate').innerHTML;

                // Crear la ventana de confirmación
                var ventana = $("<div id='window-confirmar-devoluciones'/>").kendoWindow({
                    title: window.app.idioma.t('CONFIRMAR_DEVOLUCIONES_SMILE'),
                    claseExtra: "popup-ancho-especial",
                    close: function () {
                        kendoWindow.destroy();
                    },
                    resizable: false,
                    modal: true
                });

                var kendoWindow = ventana.getKendoWindow();

                // Sustituir el marcador de posición con itemsHtml
                var mensajeDialogo = tmplt.replace('#= itemsHtml || "" #', itemsHtml);

                // Iniciar el contenido de la ventana
                kendoWindow.content(mensajeDialogo);
                kendo.init(ventana);

                //------------------------------------------------------------------

                // Inicializa el kendoDropDownList después de cargar el contenido dinámico
                $("#estadoCalidad").kendoDropDownList({
                    dataSource: [
                        { text: window.app.idioma.t('BUENO'), value: "D" },
                        { text: window.app.idioma.t('MALO'), value: "Q" }
                    ],
                    dataTextField: "text",
                    dataValueField: "value",
                    value: "D",  // Valor por defecto
                    change: function (e) {
                        var value = this.value();
                        $("#notasCalidadContainer").toggle(value === "Q"); // Muestra/oculta el campo de notas si el valor es "Q"
                    }
                });

                // Configuración de los botones
                $("#btnCancelarDevoluciones").click(function () {
                    Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('LANZAMIENTO_CANCELADO'), 4000);
                    kendoWindow.close();
                });

                $("#btnAceptarDevoluciones").click(async function () {
                    // Deshabilita el botón aceptar para evitar doble envío
                    $("#btnAceptarDevoluciones").prop("disabled", true);

                    // Obtener el estado de calidad y las notas de calidad
                    var estadoCalidad = $("#estadoCalidad").data("kendoDropDownList").value();
                    var notasCalidad = $("#notasCalidad").val();                   

                    // Preparar los datos a enviar
                    var datos = dataSource.map(item => {
                        var sscc = self.obtenerSSCC(item.Lote);

                        //redondeamos la cantidad
                        var num = (typeof item.CantidadActual === 'number')
                            ? item.CantidadActual
                            : kendo.parseFloat(String(item.CantidadActual)); // por si viniera como texto con coma/punto

                        var cantidadEntera = kendo.parseInt(kendo.toString(num, "n0"));
                        if (isNaN(cantidadEntera)) cantidadEntera = 0;

                        return {
                            Solicitud: {
                                IdTipoSolicitud: 2,
                                IdEstadoSolicitud: 1,
                                Fuente: self.lineaSel.id,
                                Prioridad: self.prioridad,
                                IdMaterial: item.IdMaterial,
                                SSCC: sscc,
                                EAN: "",  //no es necesario
                                Cantidad: cantidadEntera,
                                EstadoCalidad: estadoCalidad,
                                NotasCambioCalidad: notasCalidad ?? "",
                            },
                            Lote: item.Lote
                        };
                    });

                    // Llamada para enviar las devoluciones
                    self.enviarDevoluciones(datos).then((result) => {
                        if (result == "") {
                            if (self.dsStock.page() != 1) {
                                self.dsStock.page(1);
                            }
                            self.dsStock.read();

                            $("#estadoCalidad").val("D");
                            $("#notasCalidad").val("");

                            Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('SOLICITUDES_ENVIADAS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_ENVIAR_SOLICITUDES') + ':<br>' + result.replace(/\n/g, '<br>'), 10000);
                        }
                    });

                    // Cerrar la ventana
                    kendoWindow.close();
                });

                // Abrir la ventana de confirmación
                kendoWindow.center().open();
            },            
            obtenerSSCC: function (lote) {
                var self = this;
                var sscc = "";

                $.ajax({
                    url: `../api/ObtenerLoteMateriaPrima`,
                    async: false,
                    contentType: "application/json; charset=utf-8",
                    data: { idLote: lote }
                }).done(function (data) {
                    sscc = data.SSCC;
                }).fail(function (e) {
                    Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'api/ObtenerLoteMateriaPrima', 4000);
                });

                return sscc;
            },
            enviarDevoluciones: async function (datos, lotes) {
                return new Promise((resolve, reject) => {                   

                    $.ajax({
                        type: "POST",
                        url: "../api/CrearDevolucionesSmile/",
                        data: JSON.stringify(datos),
                        dataType: 'json',
                        contentType: "application/json; charset=utf-8",
                        success: function (result) {
                            resolve(result);
                        },
                        error: function (e) {
                            if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('ERROR'), 'CrearDevolucionesSmile', 4000);
                            }
                            reject("error");
                        }
                    });
                });
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var filtrosHeight = $("#divFiltrosHeader").innerHeight();

                var gridElement = $("#gridDevolucionesMMPPSmile"),
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

        return gridDevolucionesMMPPSmile;
    });
