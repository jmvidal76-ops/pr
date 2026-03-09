define(['underscore', 'backbone', 'jquery', 'text!../../../html/Alt/LanzarMuestraLIMsLlenadora.html', 'definiciones', 'compartido/notificaciones'],
    function (_, Backbone, $, Plantilla, definiciones, Not) {
        var VistaLanzarManualLIMs = Backbone.View.extend({
            tagName: 'div',
            template: _.template(Plantilla),
            component: null,
            llenadoras: null,
            llenadoraSel: null,
            numLlenadoraSel: null,
            LoteCervezaData: null,
            LoteCervezaDuplicado: null,
            LoteCerveza: null,
            idUbicacionLlenadora1: null,
            idUbicacionLlenadora: null,
            FechaLote: null,
            WF: null,
            WorkFlowData: null,
            dsMuestrasLlenadora: null,
            initialize: function () {
                var self = this;
                
                var numLinea = window.app.lineaSel.numLinea;
                self.obtenerUbicacionesLinea(numLinea);
                self.obtenerDataSourceMuestras();

                self.obtenerNumeroLlenadoras();
                self.obtenerDatosLlenadora1();
            },
            render: function (numLlenadoras) {
                var self = this;

                $(self.el).html(self.template()); // Renderizar el HTML base

                var contenedorLlenadoras = $('#contenedorLlenadoras', self.el); 

                // Crear botones dinámicamente según el número de llenadoras
                for (let i = 1; i <= numLlenadoras; i++) {
                    var btnHtml = '<div id="divLlenadora' + i + '" style="padding-top: 10px">' +
                        '<button id="btnLlenadora' + i + '" class="k-button k-button-icontext ajustesBoton btnLlenadora" ' +
                        'data-llenadora=' + i + ' style="margin-left: 5px;">Lanzar Muestra de Llenadora ' + i + '</button></div>';

                    contenedorLlenadoras.append(btnHtml);
                }

                $("#center-pane").css("overflow", "hidden");

                self.cargarGridMuestras();
            },
            obtenerNumeroLlenadoras: function () {
                var self = this;
                
                window.app.lineaSel.llenadoras.sort(function (a, b) {
                    return a.nombre - b.nombre;
                });
                self.llenadoras = window.app.lineaSel.llenadoras.sort((a, b) => a.numMaquina - b.numMaquina);

                var numLlenadoras = self.llenadoras.length;
                self.render(numLlenadoras); // Llamar a render con el número de llenadoras
            },
            obtenerDatosLlenadora1: function () {
                var self = this;

                //Datos llenadora 1                
                var llenadora1 = self.llenadoras[0];

                //Buscamos idUbicacion de la llenadora 1
                self.idUbicacionLlenadora1 = self.UbicacionesLinea.find(ubi => ubi.Nombre === llenadora1.nombre)?.IdUbicacion;

                //Obtener Lote Cerveza -> pasamos siempre el id de la llenadora 1
                self.obtenerLoteCervezaLinea(self.idUbicacionLlenadora1);

                //Obtenemos el WorkFlow configurado
                if (self.LoteCerveza != null) {
                    
                    //self.WF = self.ObtenerConfiguracionMuestrasAutomaticas();  //Obtenemos el id workflow de la tabla de configuraciones
                    self.WF = self.ObtenerWFParametrosGenerales();  //Obtenemos el id workflow de la tabla de parametros generales de MES_LIMS

                    //Obtenemos datos del WorkFlow
                    if (self.WF != null) {
                        self.ObtenerDatosWorkFlow();
                    }
                }
            },          
            obtenerUbicacionesLinea: function (idLinea) {
                var self = this;
                $.ajax({
                    url: "../api/ObtenerUbicacionesPorLinea?Linea=" + idLinea,
                    async: false,
                    success: function (res) {
                        self.UbicacionesLinea = res;
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });
            },
            obtenerDataSourceMuestras: function () {
                var self = this;

                self.dsMuestrasLlenadora = new kendo.data.DataSource({
                    pageSize: 50,
                    transport: {
                        read: {
                            url: "../api/LIMS/MuestrasLanzadasUltimoDia",
                            dataType: "json",
                            data: function () {
                                return { idLinea: window.app.lineaSel.id };
                            }
                        },
                    },
                    schema: {
                        model: {
                            id: "IdLanzamientoMuestrasLIMs",
                            fields: {
                                IdLanzamientoMuestrasLIMs: { type: "number" },
                                ColorEstadoLIMS: { type: "string" },
                                FechaCreacion: { type: "date" },
                                IdLoteMES: { type: "string" },
                                Comentarios: { type: "string" },
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
            cargarGridMuestras: function () {
                var self = this;

                let gridMuestrasLlenadora = self.$("#gridMuestrasLlenadora").kendoGrid({
                    dataSource: self.dsMuestrasLlenadora,
                    sortable: false,
                    resizable: true,
                    pageable: false,
                    columns: [
                        {
                            field: "ColorEstadoLIMS",
                            title: window.app.idioma.t('ESTADO'),
                            width: 90,
                            template: function (e) {
                                return "<div class='circle_cells' style='background-color:" + e.ColorEstadoLIMS + ";'/>";
                            },
                            attributes: { style: "text-align:center;" },
                        },
                        {
                            field: "FechaCreacion",
                            title: window.app.idioma.t('FECHA_CREACION'),
                            width: 200,
                            template: '#: kendo.toString(new Date(FechaCreacion), kendo.culture().calendars.standard.patterns.MES_FechaHora) #',
                        },
                        {
                            field: "IdLoteMES",
                            title: window.app.idioma.t('LOTE_MES'),
                            width: 500,
                        },
                        {
                            field: "Comentarios",
                            title: window.app.idioma.t('COMENTARIOS'),
                        },
                    ],
                    dataBinding: self.resizeGrid,
                }).data("kendoGrid");
            },
            obtenerLoteCervezaLinea: function (idUbicacion) {
                var self = this;

                $.ajax({
                    url: "../api/ObtenerLotesMateriaPrimaPorIdUbicacion",
                    data: { idUbicacion: idUbicacion },  
                    dataType: "json",
                    async: false,
                    contentType: "application/json; charset=utf-8",
                    success: function (res) {                        
                        if (res.length > 0) {
                            //Ordenamos por FechaEntradaPlanta
                            res.sort(function (a, b) {
                                var dateA = new Date(a.FechaEntradaPlanta); 
                                var dateB = new Date(b.FechaEntradaPlanta);
                                return dateA - dateB; 
                            });

                            for (var i = 0; i < res.length; i++) {
                                //Condiciones para filtrar Cerveza, con catidad Actual y Consumida = 1
                                if (res[i].CLASE_MATERIAL === 'Cervezas' && res[i].CANTIDAD_ACTUAL == 1 && res[i].CANTIDAD_INICIAL == 1) {
                                    self.LoteCervezaData = res[i];
                                    self.LoteCerveza = res[i].LOTE_MES;
                                    self.FechaLote = res[i].FECHA_ENTRADA_PLANTA;
                                    break;
                                }
                            }
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON == 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        }
                        else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENER_LOTES_IDUBICACION'), 4000);
                        }
                    }
                });
            },
            ObtenerConfiguracionMuestrasAutomaticas: function () {
                var self = this;
                var IdWorkflowSeleccionado = null;

                $.ajax({
                    url: "../api/LIMS/ObtenerConfiguracionMuestrasAutomaticas",
                    dataType: "json",
                    async: false,
                    success: function (configuraciones) {
                        // Obtenemos tipo lote
                        var partesLote = self.LoteCerveza.split('-');
                        var tipoLote = partesLote[2];

                        // Buscamos workflow por tipo de lote
                        for (var i = 0; i < configuraciones.length; i++) {
                            if (configuraciones[i].ClaseLote === tipoLote) {
                                IdWorkflowSeleccionado = configuraciones[i];
                                break;  
                            }
                        }                        
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), e.xhr.responseJSON.Message, 3000);
                        }
                    }
                });

                return IdWorkflowSeleccionado;  
            },
            ObtenerWFParametrosGenerales: function () {
                var self = this;

                var IdWorkflowSeleccionado = null;
                var clave = "WF_CONT";

                $.ajax({
                    type: "GET",
                    url: `../api/LIMS/ObtenerParametroGeneral_LIMS`,
                    dataType: 'json',
                    data: { Clave: clave },
                    cache: true,
                    async: false,
                    contentType: "application/json; charset=utf-8",
                    success: function (res) {
                        IdWorkflowSeleccionado = res;
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), "ObtenerParametroGeneral_LIMS", 3000);
                        }
                    }
                });

                return IdWorkflowSeleccionado;
            },
            ObtenerDatosWorkFlow: function () {
                var self = this;

                var idWofkFlow = parseInt(self.WF, 10);

                $.ajax({
                    url: "../api/LIMS/ObtenerWorkflowsLIMS/",
                    dataType: "json",
                    async: false,
                    success: function (workflows) {
                        for (let i = 0; i < workflows.length; i++) {
                            if (workflows[i].Id == idWofkFlow) {
                                self.WorkFlowData = `${workflows[i].Nombre}${(workflows[i].Descripcion ? ' - ' + workflows[i].Descripcion : '')}`;
                                break;
                            }
                        }
                    },
                    error: function (e) {
                        if (e.status == '403' && e.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_OBTENIENDO_FLUJOS_LIMS'), 4000);
                        }                        
                    }
                });
            },
            events: {
                'click .btnLlenadora': 'lanzarMuestra',
            },
            lanzarMuestra: function (e) {
                var self = this;

                var permiso = TienePermiso(368);

                if (!permiso) {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 3000);
                    return;
                }

                //Datos llenadora Seleccionada
                self.numLlenadoraSel = $(e.currentTarget).data('llenadora');
                self.llenadoraSel = self.llenadoras[self.numLlenadoraSel - 1];

                //Validamos campos necesarios y Ejecutamos petición muestra LIMs
                if (self.LoteCerveza != null) {
                    if (self.WF != null) {
                        self.LoteCervezaNuevo = self.LoteCerveza;

                        //Si es llenadora n, ponemos correctamente el nombre del lote para llenadora n.
                        if (self.numLlenadoraSel > 1) {
                            //nuevo lote
                            let partes = self.LoteCerveza.split('-');
                            let nuevoValor = self.llenadoraSel.nombre.replace(/-/g, '');
                            partes[5] = nuevoValor;
                            self.LoteCervezaNuevo = partes.join('-');

                            //nueva ubicacion
                            self.idUbicacionLlenadora = self.UbicacionesLinea.find(ubi => ubi.Nombre === self.llenadoraSel.nombre)?.IdUbicacion;
                        }

                        ////Si todo ha ido bien, contiuamos con la pantalla de comenttarios
                        self.ComentarioMuestraModal(self);
                    }
                    else {
                        Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('WORKFLOW_NO_CONFIGURADO'), 4000);
                        return;
                    }
                }
                else {
                    Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('NO_LOTE_EN_LLENADORA'), 4000);
                    return;
                }
            },
            ComentarioMuestraModal: function (self) {
                if (!self) {
                    return;
                }

                let tmplt = Array.from($(self.template())).find(e => e.id == 'ComentarioMuestraTemplate').innerHTML;

                let data = {
                    IdLoteMES: self.LoteCervezaNuevo,
                    FechaLoteMES: self.FechaLote,
                    IdWorkflow: self.WF,
                    WorkFlowData: self.WorkFlowData,
                    Comentarios: '',
                }

                let ventana = $("<div id='window-lanzar'/>").kendoWindow({
                    title: window.app.idioma.t("COMENTARIO_MUESTRA"),
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
                $("#btnCancelarComentario").click((e) => {
                    Not.crearNotificacion('info', window.app.idioma.t('AVISO'), window.app.idioma.t('LANZAMIENTO_MUESTRA_CANCELADA'), 4000);
                    kendoWindow.close();
                })

                $("#btnAceptarComentario").click(async (e) => {
                    data.Comentarios = document.getElementById('inpt_comentarios').value;

                    //Si es llenadora n
                    if (self.numLlenadoraSel != 1) {
                        var lotedatos = await self.obtenerLoteMES(self.LoteCervezaNuevo);
                        if (lotedatos == "") {
                            //Creamos el nuevo lote
                            self.duplicarLote(self);
                            data.IdLoteMES = self.LoteCervezaDuplicado.IdLoteMES; //nuevo idloteMES
                        }
                    }
                    kendoWindow.close();

                    self.lanzarMuestraManual(self, data);
                })

                kendoWindow.center().open();
            },
            duplicarLote: function (self) {
                self.obtenerDatosLoteMateriaPrima(self.LoteCerveza);

                //Pasamos datos nuevos para el duplicado de lote
                self.LoteCervezaDuplicado.IdLoteMES = self.LoteCervezaNuevo;
                self.LoteCervezaDuplicado.IdUbicacion = self.idUbicacionLlenadora;
                self.LoteCervezaDuplicado.CantidadInicial = 10;
                self.LoteCervezaDuplicado.CantidadActual = 0;

                $.ajax({
                    url: `../api/CrearLoteMateriaPrima`,
                    type: "POST",
                    //async: false,
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(self.LoteCervezaDuplicado),
                    success: function (response) {
                        //Se crea con exito
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('CREAR_LOTE_MMPP'), 3000);
                        }
                        console.log(err);
                        kendoWindow.close();                        
                    }
                });
            },
            obtenerDatosLoteMateriaPrima: function (loteCerveza) {
                var self = this;

                $.ajax({
                    url: `../api/ObtenerLoteMateriaPrima`,
                    async: false,
                    contentType: "application/json; charset=utf-8",
                    data: { idLote: loteCerveza },
                    success: function (response) {
                        self.LoteCervezaDuplicado = response;
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ERROR_LOTES_MATERIA_PRIMA'), 3000);
                        }
                        kendoWindow.close();                        
                    }
                });
            },
            obtenerLoteMES: function (loteMES) {
                var self = this;

                return new Promise((resolve, reject) => {
                    $.ajax({
                        type: "GET",
                        url: `../api/ObtenerLotePorLoteMES`,
                        contentType: "application/json; charset=utf-8",
                        data: { loteMES: loteMES },
                        success: function (data) {
                            if (data.length > 0) {
                                resolve(loteMES);
                            } else {
                                resolve("");
                            }
                        },
                        error: function (err) {
                            if (err.status == '403' && err.responseJSON === 'NotAuthorized') {
                                Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                            } else {
                                Not.crearNotificacion('error', window.app.idioma.t('AVISO'), 'api/ObtenerLotePorLoteMES', 3000);
                            }
                            resolve(""); 
                        }
                    });
                });
            },
            lanzarMuestraManual: function (self, data) {
                if (!data.IdWorkflow) {
                    Not.crearNotificacion('error', window.app.idioma.t('AVISO'), window.app.idioma.t('ID_WORKFLOW_NECESARIO'), 3000);
                    return;
                }

                self.LanzarMuestra(data);                    
            },
            LanzarMuestra: async function (datos) {
                $.ajax({                        
                    url: `../api/LIMS/PeticionMuestraLIMS`,
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(datos),
                    success: function (data) {
                        Not.crearNotificacion('success', window.app.idioma.t('AVISO'), window.app.idioma.t('PETICION_MUESTRA_LIMS_EXITO'), 3000);
                        kendo.ui.progress($("#ComentarioMuestraTemplate"), false);
                        kendoWindow.close();
                    },
                    error: function (err) {
                        if (err.status == '403' && err.responseJSON === 'NotAuthorized') {
                            Not.crearNotificacion('warning', window.app.idioma.t('AVISO'), window.app.idioma.t('AVISO_SIN_PERMISOS'), 4000);
                        } else {
                            Not.crearNotificacion('error', window.app.idioma.t('ERROR'), window.app.idioma.t('ERROR_CREANDO_PETICION_MUESTRA_LIMS'), 3000);
                        }                        
                        kendo.ui.progress($("#ComentarioMuestraTemplate"), false);
                        kendoWindow.close();
                    }
                });
            },
            eliminar: function () {
                if (this.component)
                    this.component.eliminar();
                $("#center-pane").css("overflow", "");
                this.remove();
                this.off();
                if (this.model && this.model.off) { this.model.off(null, null, this); }
            },
            actualiza: function () {
                var self = this;

                var numLinea = window.app.lineaSel.numLinea;
                self.obtenerUbicacionesLinea(numLinea);
                self.obtenerDataSourceMuestras();

                self.obtenerNumeroLlenadoras();
                self.obtenerDatosLlenadora1();
            },
            resizeGrid: function () {
                var contenedorHeight = $("#center-pane").innerHeight();
                var cabeceraHeight = $("#divCabeceraVista").innerHeight();
                var contenedorLlenadorasHeight = $("#contenedorLlenadoras").innerHeight();
                var textoMuestrasHeight = $("#divTextoMuestras").innerHeight();

                var gridElement = $("#gridMuestrasLlenadora"),
                    dataArea = gridElement.find(".k-grid-content"),
                    gridHeight = gridElement.innerHeight(),
                    otherElements = gridElement.children().not(".k-grid-content"),
                    otherElementsHeight = 0;
                otherElements.each(function () {
                    otherElementsHeight += $(this).outerHeight();
                });

                dataArea.height(contenedorHeight - otherElementsHeight - cabeceraHeight - contenedorLlenadorasHeight - textoMuestrasHeight - 2);
            },
        });

        return VistaLanzarManualLIMs;
    });
